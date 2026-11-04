import { describe, it, expect } from 'vitest';
import {
  calculateRumbleSafety,
  calculateRumbleSanctions,
  convertRumbleSafeCurrency,
  evaluateRumbleChecklist,
  evaluateRumbleExam,
  generateRumbleCertificate,
  searchRumbleRegistry,
} from '../rumbleSafeCompliance';
import {
  MOCK_RUMBLE_CORRIDOR_STATIONS,
  MOCK_RUMBLE_CHECKLIST_ITEMS,
  MOCK_RUMBLE_EXAM_QUESTIONS,
  MOCK_RUMBLE_CERTIFICATES,
} from '../../data/mockRumbleSafeData';

describe('rumbleSafeCompliance Utility Suite', () => {
  it('correctly calculates acoustic excitation frequency and sound elevation', () => {
    const result = calculateRumbleSafety({
      vehicleSpeedKmh: 90, // 25 m/s
      pattern: 'MILLED_CYLINDRICAL',
      placement: 'SHOULDER_EDGE',
      millingDepthMm: 12,
      millingWidthMm: 380,
      pitchMm: 300, // 0.3 m
      tireType: 'SUMMER_PASSENGER',
      driverState: 'ALERT_NORMAL',
      pavementType: 'SMA_STONE_MASTIC',
      hasBicycleGapPattern: true,
    });

    // f = 25 / 0.3 = 83.3 Hz
    expect(result.excitationFrequencyHz).toBeCloseTo(83.3, 0.5);
    expect(result.soundElevationDeltaDba).toBeGreaterThan(6.0);
    expect(result.steeringVibrationAccMs2).toBeGreaterThanOrEqual(1.0);
    expect(result.driverReactionTimeSec).toBeLessThan(1.0);
    expect(result.recoveryDistanceM).toBeGreaterThan(0);
    expect(result.rorCrashReductionPct).toBeGreaterThan(50);
    expect(result.bicycleSafetyScorePct).toBe(94);
    expect(result.snowplowDurabilityScorePct).toBe(98);
    expect(result.effectiveness).toBe('OPTIMAL_TACTILE_ALERT');
  });

  it('evaluates sinusoidal pattern and residential low noise characteristics', () => {
    const result = calculateRumbleSafety({
      vehicleSpeedKmh: 80,
      pattern: 'MILLED_SINUSOIDAL',
      placement: 'TRANSVERSE_APPROACH',
      millingDepthMm: 9,
      millingWidthMm: 500,
      pitchMm: 600,
      tireType: 'SUMMER_PASSENGER',
      driverState: 'MILD_DROWSINESS',
      pavementType: 'POROUS_DRAINAGE_ASPHALT',
      hasBicycleGapPattern: false,
    });

    expect(result.excitationFrequencyHz).toBeGreaterThan(30);
    expect(result.snowplowDurabilityScorePct).toBe(98);
  });

  it('flags raised thermoplastic markings as low snowplow durability', () => {
    const result = calculateRumbleSafety({
      vehicleSpeedKmh: 60,
      pattern: 'RAISED_THERMOPLASTIC',
      placement: 'SHOULDER_EDGE',
      millingDepthMm: 7,
      millingWidthMm: 200,
      pitchMm: 400,
      tireType: 'COMMERCIAL_TRUCK_RADIAL',
      driverState: 'SEVERE_FATIGUE_MICRO_SLEEP',
      pavementType: 'DENSE_ASPHALT_CONCRETE',
      hasBicycleGapPattern: false,
    });

    expect(result.snowplowDurabilityScorePct).toBeLessThan(50);
    expect(result.bicycleSafetyScorePct).toBeLessThan(50);
    expect(result.recommendationsAz.some((r) => r.includes('qar kotanları'))).toBe(true);
  });

  it('calculates statutory fines with 50% prompt discount under Article 38', () => {
    const shoulderIncursion = calculateRumbleSanctions('SHOULDER_INCURSION', 'AZN');
    expect(shoulderIncursion.baseFineAzn).toBe(40);
    expect(shoulderIncursion.discountedFineAzn).toBe(20);
    expect(shoulderIncursion.penaltyPoints).toBe(0);

    const centerline = calculateRumbleSanctions('CENTERLINE_CROSSOVER', 'AZN');
    expect(centerline.baseFineAzn).toBe(100);
    expect(centerline.discountedFineAzn).toBe(50);
    expect(centerline.penaltyPoints).toBe(4);

    const speeding = calculateRumbleSanctions('APPROACH_SPEEDING', 'AZN');
    expect(speeding.baseFineAzn).toBe(50);
    expect(speeding.discountedFineAzn).toBe(25);
    expect(speeding.penaltyPoints).toBe(2);

    const damage = calculateRumbleSanctions('PAVEMENT_DAMAGE', 'AZN');
    expect(damage.baseFineAzn).toBe(600);
    expect(damage.civilRestitutionAzn).toBe(450);
    expect(damage.totalPayableAzn).toBe(750); // 300 + 450
  });

  it('converts currencies correctly', () => {
    const aznAmount = 100;
    const usdAmount = convertRumbleSafeCurrency(aznAmount, 'USD');
    const eurAmount = convertRumbleSafeCurrency(aznAmount, 'EUR');

    expect(usdAmount).toBe(58.82);
    expect(eurAmount).toBe(54.05);
  });

  it('evaluates checklist compliance accurately', () => {
    const allIds = MOCK_RUMBLE_CHECKLIST_ITEMS.map((item) => item.id);
    const fullEval = evaluateRumbleChecklist(MOCK_RUMBLE_CHECKLIST_ITEMS, allIds);
    expect(fullEval.checkedCount).toBe(MOCK_RUMBLE_CHECKLIST_ITEMS.length);
    expect(fullEval.complianceScorePct).toBe(100);
    expect(fullEval.isFullyCompliant).toBe(true);

    const partialEval = evaluateRumbleChecklist(MOCK_RUMBLE_CHECKLIST_ITEMS, [allIds[0]]);
    expect(partialEval.complianceScorePct).toBeLessThan(50);
    expect(partialEval.isFullyCompliant).toBe(false);
  });

  it('evaluates theoretical exam answers accurately', () => {
    const fullAnswers: Record<string, number> = {};
    MOCK_RUMBLE_EXAM_QUESTIONS.forEach((q) => {
      fullAnswers[q.id] = q.correctIndex;
    });

    const passResult = evaluateRumbleExam(MOCK_RUMBLE_EXAM_QUESTIONS, fullAnswers);
    expect(passResult.score).toBe(MOCK_RUMBLE_EXAM_QUESTIONS.length);
    expect(passResult.percentage).toBe(100);
    expect(passResult.passed).toBe(true);

    const failResult = evaluateRumbleExam(MOCK_RUMBLE_EXAM_QUESTIONS, {});
    expect(failResult.score).toBe(0);
    expect(failResult.percentage).toBe(0);
    expect(failResult.passed).toBe(false);
  });

  it('generates a valid certificate with SİMA digital UID and SHA-256 hash', () => {
    const cert = generateRumbleCertificate({
      vehiclePlate: '99-RS-101',
      corridorCode: 'M1-KM45',
      corridorName: 'M-1 Baku - Guba',
      excitationFrequencyHz: 83.3,
      measuredDeltaDba: 11.2,
      vibrationAccMs2: 1.85,
    });

    expect(cert.certificateId).toContain('RUMBLE-SAFE-AZ-2026-');
    expect(cert.simaDigitalUid).toContain('SIMA-RUMBLE-');
    expect(cert.verificationPin).toHaveLength(6);
    expect(cert.status).toBe('ACTIVE');
  });

  it('searches public registry effectively', () => {
    const all = searchRumbleRegistry(MOCK_RUMBLE_CERTIFICATES, '');
    expect(all).toHaveLength(MOCK_RUMBLE_CERTIFICATES.length);

    const matchPlate = searchRumbleRegistry(MOCK_RUMBLE_CERTIFICATES, '99-RS-101');
    expect(matchPlate.length).toBeGreaterThanOrEqual(1);
    expect(matchPlate[0].vehiclePlate).toBe('99-RS-101');

    const noMatch = searchRumbleRegistry(MOCK_RUMBLE_CERTIFICATES, 'NON-EXISTENT-XYZ');
    expect(noMatch).toHaveLength(0);
  });
});
