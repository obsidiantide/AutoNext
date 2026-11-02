import { describe, it, expect } from 'vitest';
import {
  calculateHighwayPhotometrics,
  evaluateLightChecklist,
  gradeLightExam,
  generateLightSafeCertificate,
  searchLightCertificates,
  convertLightCurrency,
  PAVEMENT_Q0_COEFFICIENTS,
  LUMINAIRE_OPTICAL_SPECS,
  EN13201_CLASS_THRESHOLDS,
  LightSimulationInput,
} from '../lightSafeCompliance';
import {
  MOCK_LIGHT_CORRIDORS,
  MOCK_LIGHT_VEHICLE_PRESETS,
  MOCK_LIGHT_CHECKLIST,
  MOCK_LIGHT_EXAM_QUESTIONS,
  MOCK_LIGHT_CERTIFICATES,
} from '../../data/mockLightSafeData';

describe('lightSafeCompliance Utility Suite', () => {
  const baseInput: LightSimulationInput = {
    vehicleSpeedKmH: 90,
    luminaireFluxLumens: 36000,
    poleSpacingM: 38,
    mountingHeightM: 12,
    roadWidthM: 28,
    dimmingLevelPct: 100,
    pavementType: 'R2_SMA_POROUS',
    opticalType: 'SMART_LED_BATWING',
    headlightBeamAssistance: true,
  };

  it('calculates average illuminance and luminance accurately for base conditions', () => {
    const res = calculateHighwayPhotometrics(baseInput, 110);
    expect(res.averageIlluminanceLux).toBeGreaterThan(10);
    expect(res.averageLuminanceCdM2).toBeGreaterThan(0.5);
    expect(res.overallUniformityU0).toBeGreaterThanOrEqual(0.35);
    expect(res.longitudinalUniformityUl).toBeGreaterThanOrEqual(0.50);
    expect(res.driverDetectionDistanceM).toBeGreaterThan(50);
    expect(res.stoppingDistanceM).toBeGreaterThan(40);
    expect(res.speedExcessKmH).toBe(0);
    expect(res.statutoryFineAzn).toBe(0);
  });

  it('verifies dimming level scales luminous flux and power correctly', () => {
    const resFull = calculateHighwayPhotometrics(baseInput, 110);
    const resDimmed = calculateHighwayPhotometrics(
      { ...baseInput, dimmingLevelPct: 50 },
      110
    );

    expect(resDimmed.averageIlluminanceLux).toBeLessThan(resFull.averageIlluminanceLux);
    expect(resDimmed.energyConsumptionKwhPerKm).toBeLessThan(resFull.energyConsumptionKwhPerKm);
  });

  it('detects critical underlit blindspot when poles are spaced excessively with low flux', () => {
    const underlitInput: LightSimulationInput = {
      vehicleSpeedKmH: 120,
      luminaireFluxLumens: 8000,
      poleSpacingM: 65,
      mountingHeightM: 8,
      roadWidthM: 28,
      dimmingLevelPct: 20,
      pavementType: 'R3_DENSE_ASPHALT',
      opticalType: 'HIGH_PRESSURE_SODIUM_LEGACY',
      headlightBeamAssistance: false,
    };
    const res = calculateHighwayPhotometrics(underlitInput, 90);
    expect(res.safetyStatus).toBe('CRITICAL_UNDERLIT_BLINDSPOT');
    expect(res.sightMarginDistanceM).toBeLessThan(0);
    expect(res.safetyRecommendationsAz.length).toBeGreaterThan(0);
  });

  it('detects speeding violations and applies correct İXM Article 328 tiers', () => {
    // 90 limit, driving at 135 km/h -> +45 km/h excess (İXM 328.3: 150 AZN, 3 points)
    const speedingInput: LightSimulationInput = {
      ...baseInput,
      vehicleSpeedKmH: 135,
    };
    const res = calculateHighwayPhotometrics(speedingInput, 90);
    expect(res.speedExcessKmH).toBe(45);
    expect(res.statutoryFineAzn).toBe(150);
    expect(res.statutoryFineDiscountedAzn).toBe(75);
    expect(res.penaltyPoints).toBe(3);
    expect(res.violationDescriptionAz).toContain('328.3');
  });

  it('evaluates checklist completion correctly', () => {
    const evalResult = evaluateLightChecklist(MOCK_LIGHT_CHECKLIST);
    expect(evalResult.totalCount).toBe(10);
    expect(evalResult.passedCount).toBe(10);
    expect(evalResult.compliancePercentage).toBe(100);
    expect(evalResult.allPassed).toBe(true);

    const partialList = MOCK_LIGHT_CHECKLIST.map((item, idx) => ({
      ...item,
      passed: idx < 8,
    }));
    const partialEval = evaluateLightChecklist(partialList);
    expect(partialEval.passedCount).toBe(8);
    expect(partialEval.compliancePercentage).toBe(80);
    expect(partialEval.allPassed).toBe(false);
  });

  it('grades exam questions with pass/fail evaluation', () => {
    const perfectAnswers: Record<string, number> = {};
    MOCK_LIGHT_EXAM_QUESTIONS.forEach(q => {
      perfectAnswers[q.id] = q.correctOptionIndex;
    });

    const perfectScore = gradeLightExam(MOCK_LIGHT_EXAM_QUESTIONS, perfectAnswers);
    expect(perfectScore.correctAnswers).toBe(10);
    expect(perfectScore.scorePercentage).toBe(100);
    expect(perfectScore.passed).toBe(true);

    const failingAnswers: Record<string, number> = {
      ex_light_01: 3,
      ex_light_02: 3,
      ex_light_03: 3,
    };
    const failingScore = gradeLightExam(MOCK_LIGHT_EXAM_QUESTIONS, failingAnswers);
    expect(failingScore.scorePercentage).toBeLessThan(80);
    expect(failingScore.passed).toBe(false);
  });

  it('generates an official LIGHT-SAFE-AZ-2026 certificate with cryptographic seal', () => {
    const corridor = MOCK_LIGHT_CORRIDORS[0];
    const vehicle = MOCK_LIGHT_VEHICLE_PRESETS[0];
    const simulation = calculateHighwayPhotometrics(baseInput, corridor.speedLimitKmH);

    const cert = generateLightSafeCertificate({
      corridor,
      vehicle,
      simulation,
    });

    expect(cert.certificateId).toMatch(/^LIGHT-SAFE-AZ-2026-\d{5}$/);
    expect(cert.simaSignatureUid).toContain('SIMA-LIGHT-');
    expect(cert.sha256Seal).toBeDefined();
    expect(cert.clearanceOutcome).toBe('APPROVED_OPTIMAL_LIGHTING');
  });

  it('searches and filters certificates in registry', () => {
    const results = searchLightCertificates('GYD', MOCK_LIGHT_CERTIFICATES);
    expect(results.length).toBeGreaterThanOrEqual(1);

    const plateResults = searchLightCertificates('99-LX-101', MOCK_LIGHT_CERTIFICATES);
    expect(plateResults.length).toBeGreaterThanOrEqual(1);

    const emptyResults = searchLightCertificates('NON_EXISTENT_XYZ', MOCK_LIGHT_CERTIFICATES);
    expect(emptyResults.length).toBe(0);
  });

  it('converts currencies reliably for AZN, USD, and EUR', () => {
    expect(convertLightCurrency(100, 'AZN')).toBe(100);
    expect(convertLightCurrency(100, 'USD')).toBe(58.82);
    expect(convertLightCurrency(100, 'EUR')).toBe(54.05);
  });

  it('validates constants and mappings integrity', () => {
    expect(PAVEMENT_Q0_COEFFICIENTS.R1_LIGHT_CONCRETE).toBe(0.10);
    expect(PAVEMENT_Q0_COEFFICIENTS.R2_SMA_POROUS).toBe(0.07);
    expect(LUMINAIRE_OPTICAL_SPECS.SMART_LED_BATWING.utilizationFactor).toBe(0.48);
    expect(EN13201_CLASS_THRESHOLDS.M1.minLuminance).toBe(2.0);
    expect(EN13201_CLASS_THRESHOLDS.M1.minU0).toBe(0.40);
  });
});
