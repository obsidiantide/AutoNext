import { describe, it, expect } from 'vitest';
import {
  calculateSnowWaterEquivalent,
  calculateSlabShearStress,
  calculateStabilityIndex,
  determineAvalancheRiskTier,
  calculateAntiIceDosing,
  calculateAlpineFriction,
  calculateAvalancheMetrics,
  calculateAvalancheViolationFine,
  evaluateAvalancheChecklist,
  evaluateAvalancheExam,
  generateAvalancheCertificate,
  convertFromAzn,
} from '../avalancheSafeCompliance';
import {
  MOCK_ALPINE_CORRIDORS,
  MOCK_AVALANCHE_CHECKLIST_ITEMS,
  MOCK_AVALANCHE_EXAM_QUESTIONS,
} from '../../data/mockAvalancheSafeData';

describe('avalancheSafeCompliance utility suite', () => {
  it('converts AZN amounts to USD and EUR accurately', () => {
    expect(convertFromAzn(100, 'AZN')).toBe(100);
    expect(convertFromAzn(100, 'USD')).toBe(58.82);
    expect(convertFromAzn(100, 'EUR')).toBe(54.05);
  });

  it('calculates Snow Water Equivalent (SWE) correctly', () => {
    // 50 cm depth, 200 kg/m^3 density -> 0.5m * 200 = 100 mm SWE
    const swe = calculateSnowWaterEquivalent(50, 200);
    expect(swe).toBe(100);

    // 0 cm depth -> 0 SWE
    expect(calculateSnowWaterEquivalent(0, 300)).toBe(0);
  });

  it('calculates Slab Shear Stress accurately', () => {
    // 100 cm depth (1m), 300 kg/m^3, 30 degrees (sin(30) = 0.5)
    // 300 * 9.81 * 1 * 0.5 / 1000 = 1.4715 kPa -> rounded to 1.47
    const stress = calculateSlabShearStress(100, 300, 30);
    expect(stress).toBe(1.47);
  });

  it('calculates Snowpack Stability Index Sn correctly', () => {
    // weak layer = 2.0 kPa, slab shear = 1.0 kPa -> Sn = 2.0
    expect(calculateStabilityIndex(2.0, 1.0)).toBe(2);

    // near zero stress should return safe value (3.5)
    expect(calculateStabilityIndex(2.0, 0.005)).toBe(3.5);
  });

  it('determines appropriate Avalanche Danger Tier based on Sn and snow depth', () => {
    expect(determineAvalancheRiskTier(0.7, 50)).toBe('TIER_5_VERY_HIGH');
    expect(determineAvalancheRiskTier(1.0, 70)).toBe('TIER_4_HIGH');
    expect(determineAvalancheRiskTier(1.4, 70)).toBe('TIER_3_CONSIDERABLE');
    expect(determineAvalancheRiskTier(1.8, 30)).toBe('TIER_2_MODERATE');
    expect(determineAvalancheRiskTier(2.5, 15)).toBe('TIER_1_LOW');
  });

  it('calculates Anti-icing chemical dosing according to pavement temperature', () => {
    const dryDose = calculateAntiIceDosing(5, 'dry_cold_asphalt');
    expect(dryDose.saltGm2).toBe(15);
    expect(dryDose.brineLitersM2).toBe(0.025);

    const subZeroDose = calculateAntiIceDosing(-10, 'black_ice_glaze');
    expect(subZeroDose.saltGm2).toBeGreaterThan(45);
    expect(subZeroDose.brineLitersM2).toBeGreaterThan(0.05);
  });

  it('evaluates alpine friction coefficient based on surface condition and tire equipment', () => {
    const dryWinter = calculateAlpineFriction('dry_cold_asphalt', 'winter_3pmsf');
    expect(dryWinter).toBeGreaterThan(0.7);

    const blackIceSummer = calculateAlpineFriction('black_ice_glaze', 'summer_tires');
    expect(blackIceSummer).toBeLessThan(0.1);

    const blackIceChains = calculateAlpineFriction('black_ice_glaze', 'studded_or_chains');
    expect(blackIceChains).toBe(0.35);
  });

  it('computes comprehensive avalanche metrics and stopping distances', () => {
    const result = calculateAvalancheMetrics({
      snowDepthCm: 90,
      snowDensityKgM3: 320,
      weakLayerShearStrengthKPa: 2.2,
      slopeAngleDeg: 35,
      pavementTempC: -8,
      ambientTempC: -10,
      vehicleSpeedKmH: 40,
      surfaceCondition: 'packed_snow_groomed',
      tireEquipment: 'winter_3pmsf',
    });

    expect(result.snowWaterEquivalentMm).toBeGreaterThan(0);
    expect(result.slabShearStressKPa).toBeGreaterThan(0);
    expect(result.stabilityIndexSn).toBeGreaterThan(0);
    expect(result.stoppingDistanceMeters).toBeGreaterThan(0);
    expect(result.frictionCoefficientMu).toBeGreaterThan(0.1);
    expect(result.tractionVerdict).toBeDefined();
    expect(result.requiredProtectiveActionAz).toBeDefined();
  });

  it('calculates statutory fines with 50% discount under Article 38 and currency conversions', () => {
    const violation = calculateAvalancheViolationFine(true, true, true, true, 'AZN');
    // 100 + 80 + 40 + 50 = 270 AZN
    expect(violation.totalFineAzn).toBe(270);
    expect(violation.promptDiscountFineAzn).toBe(135);
    expect(violation.penaltyPoints).toBe(7);
    expect(violation.violationsSummaryAz.length).toBe(4);

    const violationUsd = calculateAvalancheViolationFine(true, false, false, false, 'USD');
    expect(violationUsd.totalFineAzn).toBe(100);
    expect(violationUsd.totalFineForeign).toBe(58.82);
    expect(violationUsd.promptDiscountFineForeign).toBe(29.41);
  });

  it('evaluates safety checklist compliance properly', () => {
    const allIds = MOCK_AVALANCHE_CHECKLIST_ITEMS.map((item) => item.id);
    const compliant = evaluateAvalancheChecklist(allIds, MOCK_AVALANCHE_CHECKLIST_ITEMS);
    expect(compliant.isCompliant).toBe(true);
    expect(compliant.percentage).toBe(100);
    expect(compliant.missingMandatoryItems.length).toBe(0);

    const empty = evaluateAvalancheChecklist([], MOCK_AVALANCHE_CHECKLIST_ITEMS);
    expect(empty.isCompliant).toBe(false);
    expect(empty.percentage).toBe(0);
    expect(empty.missingMandatoryItems.length).toBeGreaterThan(0);
  });

  it('evaluates theoretical exam scoring and pass threshold', () => {
    const perfectAnswers: Record<number, number> = {};
    MOCK_AVALANCHE_EXAM_QUESTIONS.forEach((q) => {
      perfectAnswers[q.id] = q.correctIndex;
    });

    const passed = evaluateAvalancheExam(perfectAnswers, MOCK_AVALANCHE_EXAM_QUESTIONS);
    expect(passed.isPassed).toBe(true);
    expect(passed.scorePercentage).toBe(100);
    expect(passed.correctAnswersCount).toBe(10);

    const failed = evaluateAvalancheExam({}, MOCK_AVALANCHE_EXAM_QUESTIONS);
    expect(failed.isPassed).toBe(false);
    expect(failed.scorePercentage).toBe(0);
  });

  it('generates an official clearance certificate with authentic cryptographic signature', () => {
    const corridor = MOCK_ALPINE_CORRIDORS[0];
    const cert = generateAvalancheCertificate(
      corridor,
      '99-AV-101',
      'Toyota Land Cruiser',
      'TIER_3_CONSIDERABLE',
      1.45,
      85,
      true
    );

    expect(cert.certificateUid).toContain('AVALANCHE-SAFE-AZ-2026-');
    expect(cert.passPinCode).toHaveLength(4);
    expect(cert.vehiclePlate).toBe('99-AV-101');
    expect(cert.isVerified).toBe(true);
    expect(cert.simaSignatureUid).toContain('SIMA-AAYDA-FHN-2026-');
    expect(cert.sha256VerificationHash).toBeDefined();
    expect(cert.qrPayload).toContain(cert.certificateUid);
  });
});
