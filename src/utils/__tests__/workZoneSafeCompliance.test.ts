import { describe, it, expect } from 'vitest';
import {
  convertCurrency,
  calculateRequiredTaperLength,
  calculateKineticEnergy,
  calculateTmaDecelerationG,
  calculateShadowTruckRollAhead,
  calculateWorkZoneSpeedingFine,
  runWorkZoneSimulation,
  evaluateChecklist,
  evaluateExam,
  generateWorkZoneCertificate
} from '../workZoneSafeCompliance';
import {
  MOCK_WORK_ZONE_CORRIDORS,
  MOCK_WORK_ZONE_CHECKLIST,
  MOCK_WORK_ZONE_EXAM
} from '../../data/mockWorkZoneSafeData';

describe('workZoneSafeCompliance Utility Suite', () => {
  it('converts currencies correctly (AZN, USD, EUR)', () => {
    expect(convertCurrency(100, 'AZN')).toBe(100);
    expect(convertCurrency(170, 'USD')).toBeCloseTo(100, 0);
    expect(convertCurrency(100, 'EUR')).toBeCloseTo(54.05, 1);
  });

  it('calculates required taper length under MUTCD / AZS 410 standards', () => {
    // For S <= 60 km/h: L = (W * S^2) / 155
    // W = 3.5, S = 50 -> (3.5 * 2500) / 155 = 8750 / 155 = 56.45 -> 56
    const taperLowSpeed = calculateRequiredTaperLength(3.5, 50);
    expect(taperLowSpeed).toBe(56);

    // For S > 60 km/h: L = W * S
    // W = 3.5, S = 80 -> 3.5 * 80 = 280
    const taperHighSpeed = calculateRequiredTaperLength(3.5, 80);
    expect(taperHighSpeed).toBe(280);
  });

  it('calculates vehicle kinetic energy (E_k = 0.5 * m * v^2 / 1000)', () => {
    // m = 1380 kg, v = 50 km/h (13.888 m/s) -> 0.5 * 1380 * 13.888^2 / 1000 = 133 kJ
    const energy = calculateKineticEnergy(1380, 50);
    expect(energy).toBeCloseTo(133, 0);
  });

  it('calculates TMA cushion average deceleration G-force', () => {
    // v = 60 km/h (16.67 m/s), stroke = 1.8 m -> a = 16.67^2 / (2 * 1.8) = 77.16 m/s^2 -> 7.9 G
    const decelG = calculateTmaDecelerationG(60, 1.8);
    expect(decelG).toBe(7.9);
  });

  it('calculates shadow truck roll-ahead distance with momentum transfer', () => {
    const rollAheadWithTma = calculateShadowTruckRollAhead(1380, 60, 10000, 0.72, true);
    const rollAheadWithoutTma = calculateShadowTruckRollAhead(1380, 60, 10000, 0.72, false);

    expect(rollAheadWithTma).toBeGreaterThan(0);
    expect(rollAheadWithoutTma).toBeGreaterThan(rollAheadWithTma);
  });

  it('calculates statutory work zone speeding fines and penalty points under IXM 328', () => {
    // No excess
    expect(calculateWorkZoneSpeedingFine(50, 50)).toEqual({ fineAzn: 0, penaltyPoints: 0 });

    // 10-20 km/h excess -> IXM 328.1 (20 AZN, 0 points)
    expect(calculateWorkZoneSpeedingFine(65, 50)).toEqual({ fineAzn: 20, penaltyPoints: 0 });

    // 20-40 km/h excess -> IXM 328.2 (50 AZN, 2 points)
    expect(calculateWorkZoneSpeedingFine(85, 50)).toEqual({ fineAzn: 50, penaltyPoints: 2 });

    // 40-60 km/h excess -> IXM 328.3 (150 AZN, 3 points)
    expect(calculateWorkZoneSpeedingFine(105, 50)).toEqual({ fineAzn: 150, penaltyPoints: 3 });

    // > 60 km/h excess -> IXM 328.4 (250 AZN, 4 points)
    expect(calculateWorkZoneSpeedingFine(125, 50)).toEqual({ fineAzn: 250, penaltyPoints: 4 });
  });

  it('runs complete Work Zone simulation with safe compliance output', () => {
    const result = runWorkZoneSimulation({
      vehicleSpeedKmH: 48,
      vehicleGrossMassKg: 1380,
      workZoneSpeedLimitKmH: 50,
      laneShiftWidthM: 3.5,
      tmaStrokeDepthM: 1.8,
      bufferSpaceDistanceM: 65,
      shadowTruckMassKg: 10000,
      pavementFrictionCoeff: 0.72,
      tmaInstalled: true
    });

    expect(result.speedExcessKmH).toBe(0);
    expect(result.statutoryFineAzn).toBe(0);
    expect(result.discountedFineAzn).toBe(0);
    expect(result.workerSafetyCompromised).toBe(false);
    expect(result.severityStatus).toBe('OPTIMAL_SAFE_DECELERATION');
    expect(result.tmaDamagedReplacementCostAzn).toBe(0);
  });

  it('flags worker safety hazard when buffer space is violated by high-speed heavy truck', () => {
    const result = runWorkZoneSimulation({
      vehicleSpeedKmH: 120,
      vehicleGrossMassKg: 30000,
      workZoneSpeedLimitKmH: 50,
      laneShiftWidthM: 3.5,
      tmaStrokeDepthM: 1.8,
      bufferSpaceDistanceM: 20,
      shadowTruckMassKg: 10000,
      pavementFrictionCoeff: 0.72,
      tmaInstalled: false
    });

    expect(result.speedExcessKmH).toBe(70);
    expect(result.workerSafetyCompromised).toBe(true);
    expect(result.severityStatus).toBe('BUFFER_INTRUSION_WORKER_HAZARD');
    expect(result.statutoryFineAzn).toBe(350); // 250 (speeding) + 100 (IXM 353/327.1)
    expect(result.discountedFineAzn).toBe(175);
  });

  it('evaluates checklist completion and certificate eligibility correctly', () => {
    const allIds = MOCK_WORK_ZONE_CHECKLIST.map((c) => c.id);
    const resultAll = evaluateChecklist(MOCK_WORK_ZONE_CHECKLIST, allIds);
    expect(resultAll.percentageScore).toBe(100);
    expect(resultAll.isEligibleForCertificate).toBe(true);

    const emptyResult = evaluateChecklist(MOCK_WORK_ZONE_CHECKLIST, []);
    expect(emptyResult.percentageScore).toBe(0);
    expect(emptyResult.isEligibleForCertificate).toBe(false);
  });

  it('evaluates exam answers and calculates pass/fail grade', () => {
    const perfectAnswers: Record<string, number> = {};
    MOCK_WORK_ZONE_EXAM.forEach((q) => {
      perfectAnswers[q.id] = q.correctOptionIndex;
    });

    const passedResult = evaluateExam(MOCK_WORK_ZONE_EXAM, perfectAnswers);
    expect(passedResult.percentageScore).toBe(100);
    expect(passedResult.passed).toBe(true);

    const failedResult = evaluateExam(MOCK_WORK_ZONE_EXAM, {});
    expect(failedResult.percentageScore).toBe(0);
    expect(failedResult.passed).toBe(false);
  });

  it('generates an authentic cryptographic clearance certificate', () => {
    const corridor = MOCK_WORK_ZONE_CORRIDORS[0];
    const simRes = runWorkZoneSimulation({
      vehicleSpeedKmH: 48,
      vehicleGrossMassKg: 1380,
      workZoneSpeedLimitKmH: 50,
      laneShiftWidthM: 3.5,
      tmaStrokeDepthM: 1.8,
      bufferSpaceDistanceM: 65,
      shadowTruckMassKg: 10000,
      pavementFrictionCoeff: 0.72,
      tmaInstalled: true
    });

    const cert = generateWorkZoneCertificate('99-WZ-101', 'Əli Əliyev', corridor, simRes);
    expect(cert.certificateId).toMatch(/^WORKZONE-SAFE-AZ-2026-\d{5}$/);
    expect(cert.vehiclePlate).toBe('99-WZ-101');
    expect(cert.driverFullName).toBe('Əli Əliyev');
    expect(cert.complianceRating).toBe('A_EXEMPLARY');
    expect(cert.simaDigitalSignatureUID).toContain('SIMA-GOV-AZ');
    expect(cert.sha256Checksum).toHaveLength(32);
    expect(cert.status).toBe('ACTIVE');
  });
});
