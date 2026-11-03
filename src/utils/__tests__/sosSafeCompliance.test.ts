import { describe, it, expect } from 'vitest';
import {
  calculateSosRoadsideSafety,
  evaluateSosChecklist,
  gradeSosExam,
  generateSosSafeCertificate,
  searchSosCertificates,
  convertSosCurrency,
  SosSimulationInput,
  SosChecklistItem,
  SosExamQuestion,
} from '../sosSafeCompliance';
import {
  MOCK_SOS_PILLARS,
  MOCK_SOS_VEHICLE_PRESETS,
  MOCK_SOS_CHECKLIST,
  MOCK_SOS_EXAM_QUESTIONS,
  MOCK_SOS_CERTIFICATES,
} from '../../data/mockSosSafeData';

describe('sosSafeCompliance Utility Suite', () => {
  const samplePillar = MOCK_SOS_PILLARS[0];
  const sampleVehicle = MOCK_SOS_VEHICLE_PRESETS[0];

  it('calculates walking time and distance correctly', () => {
    const input: SosSimulationInput = {
      distanceToPillarM: 240,
      triangleDistanceM: 60,
      shoulderType: 'PAVED_HARD_SHOULDER',
      emergencyType: 'MECHANICAL_BREAKDOWN',
      vestWorn: true,
      hazardLightsOn: true,
      trafficSpeedKmH: 100,
      trafficFlowVehPerHour: 1200,
      ambientCondition: 'DAY_CLEAR',
    };

    const result = calculateSosRoadsideSafety(input, samplePillar, sampleVehicle);

    // 240m / 1.2 m/s = 200 sec
    expect(result.walkingTimeSec).toBe(200);
    expect(result.walkingTimeMin).toBe(3.3);
    expect(result.triangleCompliance.isCompliant).toBe(true);
    expect(result.triangleCompliance.actualDistanceM).toBe(60);
    expect(result.vestCompliance.isCompliant).toBe(true);
    expect(result.hazardFlasherCompliance.isCompliant).toBe(true);
    expect(result.statutoryFines).toHaveLength(0);
    expect(result.totalFineAZN).toBe(0);
  });

  it('triggers fine under İXM 330 when warning triangle distance is inadequate (<50m)', () => {
    const input: SosSimulationInput = {
      distanceToPillarM: 100,
      triangleDistanceM: 20, // less than required 50m
      shoulderType: 'PAVED_HARD_SHOULDER',
      emergencyType: 'MECHANICAL_BREAKDOWN',
      vestWorn: true,
      hazardLightsOn: true,
      trafficSpeedKmH: 110,
      trafficFlowVehPerHour: 1500,
      ambientCondition: 'NIGHT_DARK',
    };

    const result = calculateSosRoadsideSafety(input, samplePillar, sampleVehicle);

    expect(result.triangleCompliance.isCompliant).toBe(false);
    expect(result.statutoryFines.some((f) => f.code === 'İXM-330')).toBe(true);
    expect(result.totalFineAZN).toBe(40);
    expect(result.totalDiscountedFineAZN).toBe(20); // 50% discount under Article 38
  });

  it('triggers fine under İXM 330 when hazard flashers are off', () => {
    const input: SosSimulationInput = {
      distanceToPillarM: 150,
      triangleDistanceM: 55,
      shoulderType: 'PAVED_HARD_SHOULDER',
      emergencyType: 'MECHANICAL_BREAKDOWN',
      vestWorn: true,
      hazardLightsOn: false, // off!
      trafficSpeedKmH: 90,
      trafficFlowVehPerHour: 800,
      ambientCondition: 'DAY_CLEAR',
    };

    const result = calculateSosRoadsideSafety(input, samplePillar, sampleVehicle);

    expect(result.hazardFlasherCompliance.isCompliant).toBe(false);
    expect(result.statutoryFines.some((f) => f.code === 'İXM-330')).toBe(true);
  });

  it('triggers fine under İXM 327.1 on bridge viaduct refuge when vest is not worn', () => {
    const input: SosSimulationInput = {
      distanceToPillarM: 80,
      triangleDistanceM: 60,
      shoulderType: 'BRIDGE_VIADUCT_REFUGE',
      emergencyType: 'MECHANICAL_BREAKDOWN',
      vestWorn: false,
      hazardLightsOn: true,
      trafficSpeedKmH: 100,
      trafficFlowVehPerHour: 1000,
      ambientCondition: 'NIGHT_DARK',
    };

    const result = calculateSosRoadsideSafety(input, samplePillar, sampleVehicle);

    expect(result.vestCompliance.isCompliant).toBe(false);
    expect(result.statutoryFines.some((f) => f.code === 'İXM-327.1')).toBe(true);
    expect(result.totalPenaltyPoints).toBeGreaterThan(0);
  });

  it('adjusts dispatch agency and ETA based on emergency type', () => {
    const medicalInput: SosSimulationInput = {
      distanceToPillarM: 100,
      triangleDistanceM: 50,
      shoulderType: 'PAVED_HARD_SHOULDER',
      emergencyType: 'MEDICAL_EMERGENCY',
      vestWorn: true,
      hazardLightsOn: true,
      trafficSpeedKmH: 100,
      trafficFlowVehPerHour: 1000,
      ambientCondition: 'DAY_CLEAR',
    };

    const medResult = calculateSosRoadsideSafety(medicalInput, samplePillar, sampleVehicle);
    expect(medResult.dispatchAgency).toContain('TƏBİB 113 / 103');
    expect(medResult.dispatchEtaMinutes).toBeLessThanOrEqual(12);

    const fireInput: SosSimulationInput = {
      ...medicalInput,
      emergencyType: 'HAZMAT_FIRE',
    };
    const fireResult = calculateSosRoadsideSafety(fireInput, samplePillar, sampleVehicle);
    expect(fireResult.dispatchAgency).toContain('FHN 112');
  });

  it('evaluates pedestrian safety status tiers according to calculated risk', () => {
    const severeInput: SosSimulationInput = {
      distanceToPillarM: 1800,
      triangleDistanceM: 10,
      shoulderType: 'NARROW_GRAVEL_SHOULDER',
      emergencyType: 'MECHANICAL_BREAKDOWN',
      vestWorn: false,
      hazardLightsOn: false,
      trafficSpeedKmH: 130,
      trafficFlowVehPerHour: 3000,
      ambientCondition: 'RAIN_FOG',
    };

    const severeResult = calculateSosRoadsideSafety(severeInput, samplePillar, sampleVehicle);
    expect(severeResult.pedestrianSafetyStatus).toBe('CRITICAL_HAZARD');
    expect(severeResult.pedestrianExposureRiskPercent).toBeGreaterThanOrEqual(75);
    expect(severeResult.overallSafetyIndexPercent).toBeLessThan(50);
  });

  it('evaluates checklist compliance accurately', () => {
    const allIds = MOCK_SOS_CHECKLIST.map((c) => c.id);
    const fullResult = evaluateSosChecklist(allIds, MOCK_SOS_CHECKLIST);
    expect(fullResult.isFullyCompliant).toBe(true);
    expect(fullResult.compliancePercentage).toBe(100);

    const partialResult = evaluateSosChecklist(['sos-chk-1'], MOCK_SOS_CHECKLIST);
    expect(partialResult.isFullyCompliant).toBe(false);
    expect(partialResult.compliancePercentage).toBe(10);
  });

  it('grades theoretical exam and enforces 80% passing threshold', () => {
    const perfectAnswers: Record<string, number> = {};
    MOCK_SOS_EXAM_QUESTIONS.forEach((q) => {
      perfectAnswers[q.id] = q.correctAnswer;
    });

    const passedGrade = gradeSosExam(perfectAnswers, MOCK_SOS_EXAM_QUESTIONS);
    expect(passedGrade.passed).toBe(true);
    expect(passedGrade.scorePercentage).toBe(100);
    expect(passedGrade.correctAnswers).toBe(10);

    const failedAnswers: Record<string, number> = {
      'sos-q-1': 0, // incorrect
      'sos-q-2': 0, // incorrect
      'sos-q-3': 0, // incorrect
    };
    const failedGrade = gradeSosExam(failedAnswers, MOCK_SOS_EXAM_QUESTIONS);
    expect(failedGrade.passed).toBe(false);
    expect(failedGrade.scorePercentage).toBeLessThan(80);
  });

  it('generates valid official certificate and supports registry search', () => {
    const cert = generateSosSafeCertificate(
      samplePillar,
      sampleVehicle,
      'MECHANICAL_BREAKDOWN',
      94
    );

    expect(cert.certificateNumber).toMatch(/^SOS-SAFE-AZ-2026-\d{5}$/);
    expect(cert.vehiclePlate).toBe(sampleVehicle.plate);
    expect(cert.corridorCode).toBe(samplePillar.code);
    expect(cert.simaSignatureUid).toContain('SIMA-AZ-ERT');
    expect(cert.sha256Hash).toMatch(/^SHA256-[0-9A-F]+$/);
    expect(cert.status).toBe('VALID');

    const searchHits = searchSosCertificates(sampleVehicle.plate, [cert, ...MOCK_SOS_CERTIFICATES]);
    expect(searchHits.length).toBeGreaterThanOrEqual(1);
    expect(searchHits[0].vehiclePlate).toBe(sampleVehicle.plate);
  });

  it('converts multi-currency values with fixed exchange rates', () => {
    const aznAmount = 100;
    expect(convertSosCurrency(aznAmount, 'AZN')).toBe(100);
    expect(convertSosCurrency(aznAmount, 'USD')).toBe(58.82);
    expect(convertSosCurrency(aznAmount, 'EUR')).toBe(54.35);
  });
});
