import { describe, it, expect } from 'vitest';
import {
  convertCushionSafeCurrency,
  calculateCushionPhysics,
  generateCushionCertificateNumber,
  generateSimaDigitalUid,
  generateQrVerificationPin,
  generateSha256Checksum,
  CUSHION_SAFE_CURRENCY_RATES,
} from '../cushionSafeCompliance';

describe('cushionSafeCompliance utility tests', () => {
  it('converts currencies accurately according to statutory exchange rates', () => {
    expect(convertCushionSafeCurrency(100, 'AZN')).toBe(100);
    expect(convertCushionSafeCurrency(100, 'USD')).toBe(58.82);
    expect(convertCushionSafeCurrency(100, 'EUR')).toBe(54.05);

    // Default rate fallback test
    expect(convertCushionSafeCurrency(100, 'GBP' as any)).toBe(100);
  });

  it('calculates crash cushion physics under normal sedan impact parameters (Class A)', () => {
    const result = calculateCushionPhysics({
      impactSpeedKmh: 90,
      impactAngleDeg: 0,
      vehicleMassKg: 1350,
      cushionBaysRemaining: 6,
      ambientTempC: 22,
    });

    expect(result.kineticEnergyKj).toBeGreaterThan(400);
    expect(result.effectiveStrokeM).toBeGreaterThan(0);
    expect(result.compressionDeflectionPct).toBeGreaterThan(0);
    expect(result.compressionDeflectionPct).toBeLessThanOrEqual(100);
    expect(result.averageDecelerationG).toBeGreaterThan(0);
    expect(result.asiScore).toBeGreaterThan(0);
    expect(result.asiClass).toBe('CLASS_A');
    expect(result.thivCompliant).toBe(true);
    expect(result.occupantSurvivalRating).toBe('EXCELLENT');
    expect(result.sensorTriggered).toBe(true);
    expect(result.status).toBe('SAFE_ABSORPTION');
    expect(result.pierProtectionScorePct).toBeGreaterThanOrEqual(80);
    expect(result.fineAzn).toBe(600); // 600 AZN damage fine, speed is 90 (not >90), angle is 0
    expect(result.discountedFineAzn).toBe(300);
    expect(result.restitutionCostAzn).toBeGreaterThan(0);
    expect(result.totalLiabilityAzn).toBe(result.discountedFineAzn + result.restitutionCostAzn);
  });

  it('calculates crash cushion physics under moderate SUV impact with angle (Class B / Controlled Redesign)', () => {
    const result = calculateCushionPhysics({
      impactSpeedKmh: 110,
      impactAngleDeg: 15,
      vehicleMassKg: 2200,
      cushionBaysRemaining: 6,
      ambientTempC: 18,
    });

    expect(result.kineticEnergyKj).toBeGreaterThan(1000);
    expect(result.status).toBe('CONTROLLED_REDESIGN');
    expect(result.asiScore).toBeGreaterThan(0.6);
    expect(result.fineAzn).toBe(600 + 50 + 80); // damage + speed + angle
    expect(result.demeritPoints).toBe(2 + 3); // 5 points
    expect(result.discountedFineAzn).toBe(365); // 730 * 0.5
  });

  it('handles structural overload under extreme high-speed and heavy vehicle scenario', () => {
    const result = calculateCushionPhysics({
      impactSpeedKmh: 140,
      impactAngleDeg: 25,
      vehicleMassKg: 4500,
      cushionBaysRemaining: 2,
      ambientTempC: 35,
    });

    expect(result.status).toBe('STRUCTURAL_OVERLOAD');
    expect(result.bottomingOutRiskPct).toBeGreaterThan(50);
    expect(result.occupantSurvivalRating).toBe('INJURY_HAZARD');
    expect(result.sensorTriggered).toBe(true);
  });

  it('evaluates safe slow speed without triggering severe sensor alarm if under thresholds', () => {
    const result = calculateCushionPhysics({
      impactSpeedKmh: 40,
      impactAngleDeg: 0,
      vehicleMassKg: 900,
      cushionBaysRemaining: 6,
      ambientTempC: 20,
    });

    expect(result.kineticEnergyKj).toBeLessThan(100);
    expect(result.asiClass).toBe('CLASS_A');
    expect(result.occupantSurvivalRating).toBe('EXCELLENT');
  });

  it('generates compliant and formatted certificate numbers and unique hashes', () => {
    const certNum = generateCushionCertificateNumber();
    expect(certNum).toMatch(/^CUSHION-SAFE-AZ-2026-\d{5}$/);

    const simaUid = generateSimaDigitalUid();
    expect(simaUid).toMatch(/^SIMA-AZ-CUSH-[A-F0-9]{8}$/);

    const pin = generateQrVerificationPin();
    expect(pin).toMatch(/^\d{4}$/);

    const hash = generateSha256Checksum('PAYLOAD-TEST-SAMPLE-123');
    expect(hash).toMatch(/^SHA256:0x[a-f0-9]{8}9a7b4c8d[a-f0-9]{8}$/);
  });
});
