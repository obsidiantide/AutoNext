import { describe, it, expect } from 'vitest';
import {
  convertVmsCurrency,
  calculateLegibilityDistance,
  calculateRequiredReadingTime,
  calculateLuminanceRatio,
  getEn12966LuminanceClass,
  evaluateReadingFeasibility,
  calculateSpeedingFine,
  evaluateLaneDiscipline,
  generateDynamicVmsMessage,
  runVmsSimulation,
  evaluateVmsChecklist,
  gradeVmsExam,
  generateVmsCertificate,
  VmsSimulationInput,
} from '../vmsSafeCompliance';
import {
  MOCK_VMS_CHECKLIST,
  MOCK_VMS_EXAM,
} from '../../data/mockVmsSafeData';

describe('vmsSafeCompliance Suite', () => {
  it('converts currencies correctly with official rates', () => {
    expect(convertVmsCurrency(100, 'AZN')).toBe(100);
    expect(convertVmsCurrency(100, 'USD')).toBe(58.82);
    expect(convertVmsCurrency(100, 'EUR')).toBe(54.05);
  });

  it('calculates optical legibility distance across different weather conditions', () => {
    // 400mm font, clear day (multiplier 1.0), normal contrast 7.0 -> base = 240m
    const clearDist = calculateLegibilityDistance(400, 'CLEAR_DAY', 7.0);
    expect(clearDist).toBe(240);

    // Rainy weather (multiplier 0.85) -> 240 * 0.85 = 204m
    const rainDist = calculateLegibilityDistance(400, 'RAIN_WET', 7.0);
    expect(rainDist).toBe(204);

    // Dense fog (multiplier 0.45) -> 240 * 0.45 = 108m
    const fogDist = calculateLegibilityDistance(400, 'DENSE_FOG', 7.0);
    expect(fogDist).toBe(108);

    // Low contrast < 3.0 -> penalized by 0.60
    const lowContrastDist = calculateLegibilityDistance(400, 'CLEAR_DAY', 2.0);
    expect(lowContrastDist).toBe(144);
  });

  it('calculates driver reading time based on message word count', () => {
    // 6 words: 1.5 + 6 * 0.35 = 3.6s
    expect(calculateRequiredReadingTime(6)).toBe(3.6);
    // 2 words: 1.5 + 2 * 0.35 = 2.2s
    expect(calculateRequiredReadingTime(2)).toBe(2.2);
  });

  it('computes EN 12966 luminance ratio LR and classifies correctly', () => {
    // (4500 - 450) / 450 = 9.0
    const lr = calculateLuminanceRatio(4500, 450);
    expect(lr).toBe(9.0);

    // L3* class: LR >= 10.0 and luminance >= 6000
    expect(getEn12966LuminanceClass(10.5, 7000)).toBe('L3*');
    // L3 class: LR >= 7.0 and luminance >= 3500
    expect(getEn12966LuminanceClass(8.0, 4000)).toBe('L3');
    // L2 class: LR >= 5.0 and luminance >= 1500
    expect(getEn12966LuminanceClass(5.5, 2000)).toBe('L2');
    // L1 class
    expect(getEn12966LuminanceClass(2.0, 800)).toBe('L1');
  });

  it('evaluates reading feasibility margin', () => {
    expect(evaluateReadingFeasibility(6.0, 3.0)).toBe('OPTIMAL');
    expect(evaluateReadingFeasibility(3.5, 3.0)).toBe('ACCEPTABLE');
    expect(evaluateReadingFeasibility(3.1, 3.0)).toBe('MARGINAL');
    expect(evaluateReadingFeasibility(2.0, 3.0)).toBe('UNSAFE_TOO_FAST');
  });

  it('calculates statutory speeding fines under İXM Maddə 328 correctly', () => {
    // <= 10 km/h: no fine
    expect(calculateSpeedingFine(95, 90)).toEqual({ fineAzn: 0, points: 0 });
    // 10-20 km/h excess (İXM 328.1): 20 AZN, 0 points
    expect(calculateSpeedingFine(105, 90)).toEqual({ fineAzn: 20, points: 0 });
    // 20-40 km/h excess (İXM 328.2): 50 AZN, 2 points
    expect(calculateSpeedingFine(125, 90)).toEqual({ fineAzn: 50, points: 2 });
    // 40-60 km/h excess (İXM 328.3): 150 AZN, 3 points
    expect(calculateSpeedingFine(145, 90)).toEqual({ fineAzn: 150, points: 3 });
    // > 60 km/h excess (İXM 328.4): 250 AZN, 4 points
    expect(calculateSpeedingFine(165, 90)).toEqual({ fineAzn: 250, points: 4 });
  });

  it('evaluates lane control signal discipline under İXM 327.2 and 327.1', () => {
    // Red Cross: 80 AZN, 3 penalty points
    const redCross = evaluateLaneDiscipline('LANE_CLOSED_RED_CROSS');
    expect(redCross.isRedCrossViolation).toBe(true);
    expect(redCross.redCrossFineAzn).toBe(80);
    expect(redCross.redCrossPenaltyPoints).toBe(3);
    expect(redCross.safetyOutcome).toBe('PROHIBITED_LANE_CRITICAL_HAZARD');

    // Amber merge arrow: 40 AZN
    const amberMerge = evaluateLaneDiscipline('MERGE_LEFT_AMBER_ARROW');
    expect(amberMerge.isAmberDisobedience).toBe(true);
    expect(amberMerge.amberFineAzn).toBe(40);
    expect(amberMerge.safetyOutcome).toBe('MANDATORY_MERGE_REQUIRED');

    // Green arrow: 0 fine
    const greenArrow = evaluateLaneDiscipline('LANE_OPEN_GREEN_ARROW');
    expect(greenArrow.isRedCrossViolation).toBe(false);
    expect(greenArrow.safetyOutcome).toBe('SAFE_IN_OPEN_LANE');
  });

  it('generates dynamic messages and warning pictograms for adverse weather and signals', () => {
    const redCrossMsg = generateDynamicVmsMessage('CLEAR_DAY', 110, 'LANE_CLOSED_RED_CROSS');
    expect(redCrossMsg.msgAz).toContain('QIRMIZI X');

    const fogMsg = generateDynamicVmsMessage('DENSE_FOG', 60, 'LANE_OPEN_GREEN_ARROW');
    expect(fogMsg.msgAz).toContain('DUMAN');
    expect(fogMsg.msgAz).toContain('60 KM/S');

    const blizzardMsg = generateDynamicVmsMessage('SNOW_BLIZZARD', 50, 'LANE_OPEN_GREEN_ARROW');
    expect(blizzardMsg.msgAz).toContain('ÇOVĞUN VƏ BUZLAŞMA');
  });

  it('runs full VMS simulation and calculates prompt 50% discount under İXM Article 38', () => {
    const input: VmsSimulationInput = {
      vehicleSpeedKmH: 125, // 35 km/h over 90 km/h limit -> 50 AZN + 2 points
      chosenLane: 3,
      currentLcsState: 'LANE_CLOSED_RED_CROSS', // 80 AZN + 3 points
      variableSpeedLimitKmH: 90,
      characterHeightMm: 400,
      messageWordCount: 6,
      weatherCondition: 'CLEAR_DAY',
      ambientLux: 45000,
      ledLuminanceCdM2: 4500,
      backgroundLuminanceCdM2: 450,
    };

    const res = runVmsSimulation(input);
    expect(res.isSpeeding).toBe(true);
    expect(res.speedingFineAzn).toBe(50);
    expect(res.isRedCrossViolation).toBe(true);
    expect(res.redCrossFineAzn).toBe(80);
    expect(res.totalFineAzn).toBe(130);
    expect(res.totalFineWithDiscountAzn).toBe(65); // 50% prompt discount
    expect(res.totalPenaltyPoints).toBe(5); // 2 + 3
    expect(res.laneSafetyOutcome).toBe('PROHIBITED_LANE_CRITICAL_HAZARD');
  });

  it('evaluates 10-point checklist compliance', () => {
    const allIds = MOCK_VMS_CHECKLIST.map((i) => i.id);
    const fullCheck = evaluateVmsChecklist(allIds, 10);
    expect(fullCheck.isCompliant).toBe(true);
    expect(fullCheck.percentage).toBe(100);

    const partial = evaluateVmsChecklist(allIds.slice(0, 8), 10);
    expect(partial.isCompliant).toBe(false);
    expect(partial.percentage).toBe(80);
  });

  it('grades 10-question theoretical exam with 80% passing standard', () => {
    const perfectAnswers: Record<string, number> = {};
    MOCK_VMS_EXAM.forEach((q) => {
      perfectAnswers[q.id] = q.correctOptionIndex;
    });

    const passResult = gradeVmsExam(perfectAnswers, MOCK_VMS_EXAM);
    expect(passResult.passed).toBe(true);
    expect(passResult.scorePercentage).toBe(100);

    // Fail case
    const failResult = gradeVmsExam({}, MOCK_VMS_EXAM);
    expect(failResult.passed).toBe(false);
    expect(failResult.scorePercentage).toBe(0);
  });

  it('generates an official VMS clearance certificate with SHA256 and SIMA UID', () => {
    const cert = generateVmsCertificate({
      vehiclePlate: '99-VM-101',
      vehicleName: 'Audi A6 Quattro 55 TFSI',
      corridorCode: 'AAYDA-VMS-M1-028',
      corridorName: 'M-1 Bakı - Quba - Rusiya Sərhədi',
      gantryCode: 'AAYDA-VMS-M1-028',
      picketKm: 'Km 28+400',
      chosenLane: 2,
      lcsState: 'LANE_OPEN_GREEN_ARROW',
      vehicleSpeedKmH: 105,
      vslSpeedLimitKmH: 110,
      legibilityDistanceM: 240,
      readingFeasibility: 'OPTIMAL',
      contrastRatioLR: 8.5,
      en12966Class: 'L3*',
      laneSafetyOutcome: 'SAFE_IN_OPEN_LANE',
      totalFineAzn: 0,
      totalPenaltyPoints: 0,
    });

    expect(cert.certificateId).toMatch(/^VMS-SAFE-AZ-2026-\d{5}$/);
    expect(cert.simaSignatureUid).toMatch(/^SIMA-AZ-[0-9A-F]{12}$/);
    expect(cert.sha256Checksum).toHaveLength(64);
    expect(cert.verificationPin).toHaveLength(4);
    expect(cert.vehiclePlate).toBe('99-VM-101');
  });
});
