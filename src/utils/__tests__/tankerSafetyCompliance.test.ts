import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  evaluateTankerCompliance,
  calculateTankerInspectionCosts,
  generateTankerCertificateHash,
  ADR_VEHICLE_CATEGORIES,
  CURRENCY_RATES,
} from '../tankerSafetyCompliance';
import { MOCK_TANKER_PRESETS } from '../../data/mockTankerSafetyData';

describe('tankerSafetyCompliance utility suite', () => {
  it('converts currencies correctly with established rates', () => {
    expect(convertAzn(100, 'AZN')).toBe(100);
    expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 1);
    expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 1);
  });

  it('formats currencies with appropriate symbols and locale formatting', () => {
    expect(formatCurrency(120, 'AZN')).toContain('₼');
    expect(formatCurrency(120, 'USD')).toContain('$');
    expect(formatCurrency(120, 'EUR')).toContain('€');
  });

  it('correctly provides metadata for all ADR vehicle categories', () => {
    expect(ADR_VEHICLE_CATEGORIES.FL.code).toBe('FL');
    expect(ADR_VEHICLE_CATEGORIES.AT.code).toBe('AT');
    expect(ADR_VEHICLE_CATEGORIES.EX_II.code).toBe('EX/II');
    expect(ADR_VEHICLE_CATEGORIES.EX_III.code).toBe('EX/III');
    expect(ADR_VEHICLE_CATEGORIES.MEMU.code).toBe('MEMU');
  });

  it('evaluates fully compliant tanker preset with perfect score', () => {
    const preset = MOCK_TANKER_PRESETS[0]; // PRESET_FL_MAN_TGX
    const result = evaluateTankerCompliance(
      preset.hydrostaticTelemetry,
      preset.flameArresterTelemetry,
      preset.category
    );

    expect(result.isFullyCompliant).toBe(true);
    expect(result.hydrostaticPassed).toBe(true);
    expect(result.thicknessPassed).toBe(true);
    expect(result.valveTripPassed).toBe(true);
    expect(result.flameArresterPassed).toBe(true);
    expect(result.groundingPassed).toBe(true);
    expect(result.overallScore).toBe(100);
    expect(result.criticalDefectsAz.length).toBe(0);
    expect(result.finesRiskAzn).toBe(0);
  });

  it('detects multiple critical safety defects and calculates fines on defective tanker', () => {
    const defectivePreset = MOCK_TANKER_PRESETS.find(p => p.id === 'PRESET_DEFECTIVE_OLD_TANKER')!;
    const result = evaluateTankerCompliance(
      defectivePreset.hydrostaticTelemetry,
      defectivePreset.flameArresterTelemetry,
      defectivePreset.category
    );

    expect(result.isFullyCompliant).toBe(false);
    expect(result.hydrostaticPassed).toBe(false);
    expect(result.thicknessPassed).toBe(false);
    expect(result.valveTripPassed).toBe(false);
    expect(result.flameArresterPassed).toBe(false);
    expect(result.groundingPassed).toBe(false);
    expect(result.overallScore).toBeLessThan(50);
    expect(result.criticalDefectsAz.length).toBeGreaterThanOrEqual(4);
    expect(result.finesRiskAzn).toBeGreaterThan(3000);
    expect(result.statutoryLegalArticles.length).toBeGreaterThan(0);
  });

  it('handles isolated defects such as grounding resistance exceeding threshold', () => {
    const preset = { ...MOCK_TANKER_PRESETS[0] };
    const badGroundingTelemetry = {
      ...preset.flameArresterTelemetry,
      staticGroundResistanceOhms: 18.5, // > 10.0 Ohms
    };

    const result = evaluateTankerCompliance(
      preset.hydrostaticTelemetry,
      badGroundingTelemetry,
      preset.category
    );

    expect(result.isFullyCompliant).toBe(false);
    expect(result.groundingPassed).toBe(false);
    expect(result.overallScore).toBe(80);
    expect(result.criticalDefectsAz.some(d => d.includes('Statik elektrik'))).toBe(true);
    expect(result.finesRiskAzn).toBe(1200);
  });

  it('handles isolated defect when emergency foot valve takes too long to close', () => {
    const preset = { ...MOCK_TANKER_PRESETS[0] };
    const slowValveHydro = {
      ...preset.hydrostaticTelemetry,
      bottomValveClosureSeconds: 8.2, // > 5.0 seconds
    };

    const result = evaluateTankerCompliance(
      slowValveHydro,
      preset.flameArresterTelemetry,
      preset.category
    );

    expect(result.isFullyCompliant).toBe(false);
    expect(result.valveTripPassed).toBe(false);
    expect(result.criticalDefectsAz.some(d => d.includes('Foot valve'))).toBe(true);
  });

  it('calculates tanker inspection cost breakdown with escort and NDT additions', () => {
    const costsStandard = calculateTankerInspectionCosts('FL', false, false, 'AZN');
    expect(costsStandard.categoryBaseFeeAzn).toBe(120);
    expect(costsStandard.hydrostaticTestFeeAzn).toBe(180);
    expect(costsStandard.ultrasonicNdtFeeAzn).toBe(0);
    expect(costsStandard.policeEscortFeeAzn).toBe(0);
    expect(costsStandard.totalAzn).toBeGreaterThan(450);

    const costsWithEscortAndNdt = calculateTankerInspectionCosts('EX_III', true, true, 'AZN');
    expect(costsWithEscortAndNdt.categoryBaseFeeAzn).toBe(200);
    expect(costsWithEscortAndNdt.policeEscortFeeAzn).toBe(250);
    expect(costsWithEscortAndNdt.ultrasonicNdtFeeAzn).toBe(120);
    expect(costsWithEscortAndNdt.totalAzn).toBeGreaterThan(costsStandard.totalAzn);
    expect(costsWithEscortAndNdt.currency).toBe('AZN');
  });

  it('calculates converted costs accurately in USD and EUR', () => {
    const costsUsd = calculateTankerInspectionCosts('FL', false, false, 'USD');
    expect(costsUsd.totalConverted).toBeCloseTo(costsUsd.totalAzn * CURRENCY_RATES.USD, 1);

    const costsEur = calculateTankerInspectionCosts('FL', false, false, 'EUR');
    expect(costsEur.totalConverted).toBeCloseTo(costsEur.totalAzn * CURRENCY_RATES.EUR, 1);
  });

  it('generates consistent and deterministic cryptographic hashes', () => {
    const hash1 = generateTankerCertificateHash('99-FL-101', 'VIN1234567890', 'TK-001', 'FL');
    const hash2 = generateTankerCertificateHash('99-FL-101', 'VIN1234567890', 'TK-001', 'FL');
    const hashDifferent = generateTankerCertificateHash('10-AD-404', 'VIN1234567890', 'TK-001', 'FL');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDifferent);
    expect(hash1.length).toBe(32);
  });
});
