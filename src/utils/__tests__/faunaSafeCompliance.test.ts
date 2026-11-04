import { describe, it, expect } from 'vitest';
import {
  convertFaunaSafeCurrency,
  calculateFaunaRisk,
  evaluateFaunaChecklist,
  evaluateFaunaExam,
  generateFaunaCertificate,
  searchFaunaRegistry,
  FAUNA_SAFE_CURRENCY_RATES,
  FAUNA_RESTITUTION_RATES,
} from '../faunaSafeCompliance';
import {
  MOCK_FAUNA_ECO_STATIONS,
  MOCK_FAUNA_VEHICLE_PRESETS,
  MOCK_FAUNA_CHECKLIST_ITEMS,
  MOCK_FAUNA_EXAM_QUESTIONS,
  MOCK_FAUNA_CERTIFICATES,
} from '../../data/mockFaunaSafeData';

describe('faunaSafeCompliance utility tests', () => {
  it('converts currencies accurately according to statutory exchange rates', () => {
    expect(convertFaunaSafeCurrency(100, 'AZN')).toBe(100);
    expect(convertFaunaSafeCurrency(100, 'USD')).toBe(58.82);
    expect(convertFaunaSafeCurrency(100, 'EUR')).toBe(54.05);

    // Default rate fallback test
    expect(convertFaunaSafeCurrency(100, 'GBP' as any)).toBe(100);
  });

  it('calculates safe stopping parameters when distance is ample and speed is normal', () => {
    const result = calculateFaunaRisk(
      {
        vehicleSpeedKmh: 60,
        animalDistanceM: 100,
        animalMassKg: 180,
        roadFrictionMu: 0.8,
        ambientIlluminanceLux: 500, // daylight
        acousticDeterrentEnabled: true,
      },
      'RED_DEER',
      'NONE'
    );

    expect(result.impactOccurs).toBe(false);
    expect(result.impactSpeedKmh).toBe(0);
    expect(result.impactKineticEnergyKj).toBe(0);
    expect(result.animalMortalityRiskPercent).toBe(0);
    expect(result.driverInjuryRiskPercent).toBe(0);
    expect(result.totalStoppingDistanceM).toBeLessThan(100);
    expect(result.statusRating).toBe('OPTIMAL_SAFE');
    expect(result.statutoryFineAzn).toBe(0);
    expect(result.wildlifeRestitutionAzn).toBe(0);
  });

  it('calculates collision physics, kinetic energy and ETSN restitution under sudden near-distance hazard', () => {
    const result = calculateFaunaRisk(
      {
        vehicleSpeedKmh: 120,
        animalDistanceM: 30, // insufficient distance to stop
        animalMassKg: 200,
        roadFrictionMu: 0.6,
        ambientIlluminanceLux: 2, // night
        acousticDeterrentEnabled: false,
      },
      'RED_DEER',
      'WILDLIFE_ZONE_SPEEDING'
    );

    expect(result.impactOccurs).toBe(true);
    expect(result.impactSpeedKmh).toBeGreaterThan(0);
    expect(result.impactKineticEnergyKj).toBeGreaterThan(0);
    expect(result.avcRiskScore).toBeGreaterThan(50);
    expect(result.animalMortalityRiskPercent).toBeGreaterThan(0);
    expect(result.statusRating).toBe('CRITICAL_HAZARD_IMPACT');
    expect(result.statutoryFineAzn).toBe(50); // İXM 328.2
    expect(result.penaltyPoints).toBe(2);
    expect(result.promptDiscountedFineAzn).toBe(25); // 50% discount under İXM 38
    expect(result.wildlifeRestitutionAzn).toBe(FAUNA_RESTITUTION_RATES.RED_DEER); // 1,650 AZN
    expect(result.totalFinancialLiabilityAzn).toBe(25 + 1650);
  });

  it('calculates failure to yield violation penalties and Brown Bear restitution', () => {
    const result = calculateFaunaRisk(
      {
        vehicleSpeedKmh: 90,
        animalDistanceM: 40,
        animalMassKg: 250,
        roadFrictionMu: 0.7,
        ambientIlluminanceLux: 10,
        acousticDeterrentEnabled: true,
      },
      'BROWN_BEAR',
      'FAILURE_TO_YIELD_ANIMAL'
    );

    expect(result.statutoryFineAzn).toBe(40); // İXM 327.1
    expect(result.promptDiscountedFineAzn).toBe(20);
    expect(result.penaltyPoints).toBe(0);
    if (result.impactOccurs) {
      expect(result.wildlifeRestitutionAzn).toBe(FAUNA_RESTITUTION_RATES.BROWN_BEAR); // 2,200 AZN
    }
  });

  it('evaluates 10-point technical checklist correctly', () => {
    const allChecked: Record<string, boolean> = {};
    MOCK_FAUNA_CHECKLIST_ITEMS.forEach((it) => {
      allChecked[it.id] = true;
    });

    const evalAll = evaluateFaunaChecklist(allChecked, MOCK_FAUNA_CHECKLIST_ITEMS);
    expect(evalAll.isCompliant).toBe(true);
    expect(evalAll.percentage).toBe(100);
    expect(evalAll.statusRating).toBe('EXCELLENT');

    const noneChecked: Record<string, boolean> = {};
    const evalNone = evaluateFaunaChecklist(noneChecked, MOCK_FAUNA_CHECKLIST_ITEMS);
    expect(evalNone.isCompliant).toBe(false);
    expect(evalNone.percentage).toBe(0);
    expect(evalNone.statusRating).toBe('NON_COMPLIANT');
  });

  it('evaluates theoretical exam scoring and passing criteria', () => {
    const perfectAnswers: Record<string, number> = {};
    MOCK_FAUNA_EXAM_QUESTIONS.forEach((q) => {
      perfectAnswers[q.id] = q.correctOptionIndex;
    });

    const evalPerfect = evaluateFaunaExam(perfectAnswers, MOCK_FAUNA_EXAM_QUESTIONS);
    expect(evalPerfect.isPassed).toBe(true);
    expect(evalPerfect.score).toBe(10);
    expect(evalPerfect.percentage).toBe(100);

    const wrongAnswers: Record<string, number> = {};
    MOCK_FAUNA_EXAM_QUESTIONS.forEach((q) => {
      wrongAnswers[q.id] = (q.correctOptionIndex + 1) % 4;
    });

    const evalWrong = evaluateFaunaExam(wrongAnswers, MOCK_FAUNA_EXAM_QUESTIONS);
    expect(evalWrong.isPassed).toBe(false);
    expect(evalWrong.score).toBe(0);
  });

  it('generates authentic FAUNA-SAFE-AZ-2026 certificate and searches registry', () => {
    const st = MOCK_FAUNA_ECO_STATIONS[0];
    const veh = MOCK_FAUNA_VEHICLE_PRESETS[0];
    const calc = calculateFaunaRisk(
      {
        vehicleSpeedKmh: 80,
        animalDistanceM: 90,
        animalMassKg: 180,
        roadFrictionMu: 0.75,
        ambientIlluminanceLux: 100,
        acousticDeterrentEnabled: true,
      },
      'RED_DEER'
    );

    const cert = generateFaunaCertificate(st, veh, calc, 'RED_DEER');
    expect(cert.certificateId).toMatch(/^FAUNA-SAFE-AZ-2026-\d{5}$/);
    expect(cert.stationCode).toBe(st.code);
    expect(cert.vehiclePlate).toBe(veh.plate);
    expect(cert.simaDigitalUid).toContain('SIMA-FAUNA-');
    expect(cert.sha256Checksum).toContain('SHA256-');

    // Test registry search
    const resultsByPlate = searchFaunaRegistry(veh.plate, [cert, ...MOCK_FAUNA_CERTIFICATES]);
    expect(resultsByPlate.some((r) => r.vehiclePlate === veh.plate)).toBe(true);

    const resultsByCertId = searchFaunaRegistry(cert.certificateId, [cert]);
    expect(resultsByCertId.length).toBe(1);

    const emptyQueryResults = searchFaunaRegistry('', [cert]);
    expect(emptyQueryResults.length).toBe(1);
  });
});
