import { describe, it, expect } from 'vitest';
import {
  convertDelineatorSafeCurrency,
  calculateDelineatorSpacing,
  calculateSafeCurveSpeed,
  getReflectorCil,
  evaluateDelineatorSafety,
  generateDelineatorCertificate,
  DelineatorCalculationInput,
} from '../delineatorSafeCompliance';
import { MOCK_DELINEATOR_STATIONS } from '../../data/mockDelineatorSafeData';

describe('delineatorSafeCompliance Unit Tests', () => {
  it('converts currencies correctly using exchange rates', () => {
    expect(convertDelineatorSafeCurrency(100, 'AZN')).toBe(100);
    expect(convertDelineatorSafeCurrency(100, 'USD')).toBeCloseTo(58.82, 1);
    expect(convertDelineatorSafeCurrency(100, 'EUR')).toBeCloseTo(54.05, 1);
  });

  it('calculates delineator spacing on curves according to AASHTO / MUTCD and AZS 410', () => {
    // Tight curve R=45m: 3 * sqrt(45 - 15) = 3 * sqrt(30) ≈ 16.4m
    const spacing45 = calculateDelineatorSpacing(45);
    expect(spacing45.curveSpacingM).toBeCloseTo(16.4, 1);
    expect(spacing45.transition1M).toBeCloseTo(24.6, 1);
    expect(spacing45.transition2M).toBeCloseTo(32.8, 1);
    expect(spacing45.transition3M).toBeCloseTo(49.2, 1);

    // Very tight curve R=18m: 3 * sqrt(3) ≈ 5.2m -> clamped to 6.0m
    const spacing18 = calculateDelineatorSpacing(18);
    expect(spacing18.curveSpacingM).toBe(6.0);

    // Wide curve R=800m: 3 * sqrt(785) ≈ 84.1m -> clamped to 40.0m
    const spacing800 = calculateDelineatorSpacing(800);
    expect(spacing800.curveSpacingM).toBe(40.0);
  });

  it('calculates safe curve speed based on lateral friction', () => {
    const speed45 = calculateSafeCurveSpeed(45);
    expect(speed45).toBeGreaterThanOrEqual(30);
    expect(speed45).toBeLessThanOrEqual(50);

    const speed650 = calculateSafeCurveSpeed(650);
    expect(speed650).toBeGreaterThanOrEqual(90);
    expect(speed650).toBeLessThanOrEqual(130);
  });

  it('returns appropriate CIL values for reflector classes', () => {
    expect(getReflectorCil('CLASS_R1')).toBe(65);
    expect(getReflectorCil('CLASS_R2')).toBe(180);
    expect(getReflectorCil('CLASS_R3')).toBe(360);
  });

  it('evaluates optimal optical conditions with high visibility and compliant speed', () => {
    const input: DelineatorCalculationInput = {
      curveRadiusM: 280,
      vehicleSpeedKmH: 70,
      headlightIntensityCd: 60000,
      visibilityMorM: 2000,
      ambientLux: 0.1,
      reflectorClass: 'CLASS_R3',
      postType: 'FLEXIBLE_POLYURETHANE',
      wheelStrikeSimulation: false,
    };

    const result = evaluateDelineatorSafety(input);
    expect(result.speedStatus).toBe('SAFE_CRUISING');
    expect(result.previewTimeSec).toBeGreaterThanOrEqual(4.0);
    expect(result.operationalStatus).toBe('OPTIMAL_OPTICAL_GUIDANCE');
    expect(result.statutoryFineAzn).toBe(0);
    expect(result.civilRestitutionAzn).toBe(0);
  });

  it('detects fog restricted preview when MOR is low', () => {
    const input: DelineatorCalculationInput = {
      curveRadiusM: 100,
      vehicleSpeedKmH: 80,
      headlightIntensityCd: 25000,
      visibilityMorM: 150, // Dense fog
      ambientLux: 0.5,
      reflectorClass: 'CLASS_R2',
      postType: 'FLEXIBLE_POLYURETHANE',
      wheelStrikeSimulation: false,
    };

    const result = evaluateDelineatorSafety(input);
    expect(result.operationalStatus).toBe('FOG_RESTRICTED_PREVIEW');
  });

  it('detects critical overspeed and applies statutory fines', () => {
    // Safe speed for R=45 is ~30 km/h, test at 90 km/h (overspeed > 20)
    const input: DelineatorCalculationInput = {
      curveRadiusM: 45,
      vehicleSpeedKmH: 90,
      headlightIntensityCd: 40000,
      visibilityMorM: 1000,
      ambientLux: 0.2,
      reflectorClass: 'CLASS_R2',
      postType: 'FLEXIBLE_POLYURETHANE',
      wheelStrikeSimulation: false,
    };

    const result = evaluateDelineatorSafety(input);
    expect(result.speedStatus).toBe('CRITICAL_OVERSPEED');
    expect(result.statutoryFineAzn).toBe(50); // İXM 328.2
    expect(result.statutoryFineDiscountedAzn).toBe(25); // 50% discount under İXM 38
    expect(result.demeritPoints).toBe(2);
  });

  it('simulates wheel strike knockdown, kinetic energy and civil restitution', () => {
    const input: DelineatorCalculationInput = {
      curveRadiusM: 180,
      vehicleSpeedKmH: 72, // 20 m/s
      headlightIntensityCd: 45000,
      visibilityMorM: 1500,
      ambientLux: 0.1,
      reflectorClass: 'CLASS_R2',
      postType: 'FLEXIBLE_POLYURETHANE',
      wheelStrikeSimulation: true,
    };

    const result = evaluateDelineatorSafety(input);
    expect(result.impactKineticEnergyJ).toBeGreaterThan(0);
    expect(result.reboundSurvivalScorePct).toBeGreaterThan(90);
    expect(result.statutoryFineAzn).toBeGreaterThanOrEqual(600); // İXM 353.1
    expect(result.civilRestitutionAzn).toBe(180); // Civil Code 1108
    expect(result.totalLiabilityAzn).toBe(result.statutoryFineDiscountedAzn + 180);
  });

  it('generates official DELINEATOR-SAFE-AZ-2026 certificate with cryptographic hashes', () => {
    const station = MOCK_DELINEATOR_STATIONS[0];
    const input: DelineatorCalculationInput = {
      curveRadiusM: station.curveRadiusM,
      vehicleSpeedKmH: 80,
      headlightIntensityCd: 50000,
      visibilityMorM: 1200,
      ambientLux: 0.2,
      reflectorClass: station.reflectorClass,
      postType: station.postType,
      wheelStrikeSimulation: false,
    };
    const result = evaluateDelineatorSafety(input);

    const cert = generateDelineatorCertificate({
      corridorStation: station,
      vehiclePlate: '99-DL-101',
      postType: station.postType,
      reflectorClass: station.reflectorClass,
      calculationResult: result,
    });

    expect(cert.certificateNumber).toMatch(/^DELINEATOR-SAFE-AZ-2026-\d{5}$/);
    expect(cert.simaUid).toMatch(/^SIMA-AAYDA-DEL-/);
    expect(cert.verificationPin).toMatch(/^\d{6}$/);
    expect(cert.sha256Hash).toHaveLength(64);
  });
});
