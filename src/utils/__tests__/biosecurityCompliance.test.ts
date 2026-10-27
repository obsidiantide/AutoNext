import { describe, it, expect } from 'vitest';
import {
  evaluateColdChainCompliance,
  evaluateDisinfectionBarrier,
  calculateBiosecurityFees,
  formatCurrency,
  generateCertificateSerial,
  generateCertificateHash,
  ATP_CLASSES_INFO,
  PERISHABLE_CARGO_INFO,
} from '../biosecurityCompliance';

describe('biosecurityCompliance utility tests', () => {
  it('correctly validates compliant temperature for deep frozen meat', () => {
    const result = evaluateColdChainCompliance('DEEP_FROZEN_MEAT', -19.5);
    expect(result.isCompliant).toBe(true);
    expect(result.alertLevel).toBe('NORMAL');
    expect(result.targetTempC).toBe(-18);
  });

  it('detects temperature excursion and flags critical alert when meat is too warm', () => {
    const result = evaluateColdChainCompliance('DEEP_FROZEN_MEAT', -10.0);
    expect(result.isCompliant).toBe(false);
    expect(result.alertLevel).toBe('CRITICAL');
    expect(result.statusMessageAz).toContain('KRİTİK TEMPERATUR POZUNTUSU');
  });

  it('detects tropical banana chilling injury when temp is below +13.0°C', () => {
    const result = evaluateColdChainCompliance('TROPICAL_BANANAS', 8.0);
    expect(result.isCompliant).toBe(false);
    expect(result.alertLevel).toBe('CRITICAL');
  });

  it('validates successful disinfection barrier pass when speed, pressure, and coverage meet standards', () => {
    const result = evaluateDisinfectionBarrier({
      agent: 'QUATERNARY_AMMONIUM',
      agentConcentrationPpm: 1200,
      nozzlePressureBar: 45,
      archPassageSpeedKmh: 8,
      contactTimeMinutes: 4,
      undercarriageCoveragePercent: 95,
    });
    expect(result.passed).toBe(true);
    expect(result.effectiveBiosecurity).toBe(true);
    expect(result.coverageScore).toBeGreaterThanOrEqual(80);
  });

  it('fails disinfection barrier if truck passes too fast (>10 km/h) or low pressure', () => {
    const result = evaluateDisinfectionBarrier({
      agent: 'QUATERNARY_AMMONIUM',
      agentConcentrationPpm: 500, // too low
      nozzlePressureBar: 15, // too low
      archPassageSpeedKmh: 20, // too fast
      contactTimeMinutes: 1, // too short
      undercarriageCoveragePercent: 60,
    });
    expect(result.passed).toBe(false);
    expect(result.effectiveBiosecurity).toBe(false);
    expect(result.coverageScore).toBeLessThan(80);
  });

  it('calculates statutory biosecurity fees including VAT correctly in AZN', () => {
    const fees = calculateBiosecurityFees({
      cargoType: 'DEEP_FROZEN_MEAT',
      atpClass: 'FRC',
      cargoWeightTons: 20,
      isTransitOnly: true,
      requiresExpressPcr: true,
      requiresDisinfectionBarrier: true,
      currency: 'AZN',
    });

    expect(fees.disinfectionFeeAzn).toBe(30); // >12 tons
    expect(fees.veterinaryDutyAzn).toBe(40);
    expect(fees.phytosanitaryDutyAzn).toBe(0);
    expect(fees.atpCalibrationAuditFeeAzn).toBe(25);
    expect(fees.labPcrAnalysisFeeAzn).toBe(50);
    expect(fees.subtotalAzn).toBe(145);
    // Taxable services: 30 + 25 + 50 = 105 * 0.18 = 18.9
    expect(fees.vat18Azn).toBe(18.9);
    expect(fees.totalAzn).toBe(163.9);
    expect(fees.totalConverted).toBe(163.9);
  });

  it('calculates phytosanitary fees correctly and converts to USD/EUR', () => {
    const feesUsd = calculateBiosecurityFees({
      cargoType: 'FRESH_FRUITS_VEG',
      atpClass: 'FNA',
      cargoWeightTons: 10,
      isTransitOnly: true,
      requiresExpressPcr: false,
      requiresDisinfectionBarrier: true,
      currency: 'USD',
    });

    expect(feesUsd.disinfectionFeeAzn).toBe(20); // <= 12 tons
    expect(feesUsd.veterinaryDutyAzn).toBe(0);
    expect(feesUsd.phytosanitaryDutyAzn).toBe(35);
    expect(feesUsd.atpCalibrationAuditFeeAzn).toBe(25);
    expect(feesUsd.labPcrAnalysisFeeAzn).toBe(0);
    expect(feesUsd.currency).toBe('USD');
    expect(feesUsd.totalConverted).toBeGreaterThan(0);
  });

  it('formats currency strings properly', () => {
    expect(formatCurrency(150, 'AZN')).toBe('150.00 ₼');
    expect(formatCurrency(88.2, 'USD')).toBe('88.20 $');
    expect(formatCurrency(81.5, 'EUR')).toBe('81.50 €');
  });

  it('generates consistent and valid certificate serial format', () => {
    const serial = generateCertificateSerial();
    expect(serial).toMatch(/^AQTA-BIO-2026-\d{5}$/);
  });

  it('generates deterministic security checksums', () => {
    const hash1 = generateCertificateHash('AQTA-BIO-2026-11111', '99-AQ-101');
    const hash2 = generateCertificateHash('AQTA-BIO-2026-11111', '99-AQ-101');
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^0x/);
  });

  it('validates ATP class specifications', () => {
    expect(ATP_CLASSES_INFO.FRC.maxKValue).toBe(0.4);
    expect(ATP_CLASSES_INFO.FNA.maxKValue).toBe(0.7);
    expect(PERISHABLE_CARGO_INFO.DEEP_FROZEN_MEAT.inspectionType).toBe('VETERINARY');
    expect(PERISHABLE_CARGO_INFO.FRESH_FRUITS_VEG.inspectionType).toBe('PHYTOSANITARY');
  });
});
