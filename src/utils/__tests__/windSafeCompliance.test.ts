import { describe, it, expect } from 'vitest';
import {
  calculateAerodynamicForces,
  evaluateWindChecklist,
  gradeWindExam,
  generateWindSafeCertificate,
  verifyWindCertificate,
  WindAeroSimulationInput,
} from '../windSafeCompliance';
import {
  MOCK_WIND_CORRIDORS,
  MOCK_VEHICLE_AERO_PROFILES,
  MOCK_WIND_CHECKLIST_ITEMS,
  MOCK_WIND_EXAM_QUESTIONS,
  MOCK_ACTIVE_WIND_CERTIFICATES,
} from '../../data/mockWindSafeData';

describe('windSafeCompliance Utility', () => {
  const defaultSemiTrailer = MOCK_VEHICLE_AERO_PROFILES[0]; // MAN TGX 18.510 Euro-6 (40.5 m² side area)
  const defaultPatrolCar = MOCK_VEHICLE_AERO_PROFILES[5]; // BMW 330i xDrive (4.5 m² side area)
  const defaultCorridor = MOCK_WIND_CORRIDORS[0]; // Gilazi-Siyazan Corridor

  it('computes safe aerodynamic metrics and low RRF for low wind speeds', () => {
    const input: WindAeroSimulationInput = {
      vehicleSpeedKmh: 60,
      windSpeedMs: 8,
      gustFactor: 1.1,
      windAttackAngleDeg: 90,
      barrierReductionPercent: 0,
      roadCondition: 'dry',
      vehicleProfile: defaultSemiTrailer,
    };

    const result = calculateAerodynamicForces(input);
    expect(result.rolloverRiskFactor).toBeLessThan(0.4);
    expect(result.safetyStatus).toBe('SAFE');
    expect(result.isTransitPermitted).toBe(true);
    expect(result.isOverturningLikely).toBe(false);
    expect(result.sideAeroForceN).toBeGreaterThan(0);
    expect(result.restoringMomentNm).toBeGreaterThan(result.overturningMomentNm);
  });

  it('identifies critical rollover hazard for heavy semi-trailer in severe gale gusts', () => {
    const input: WindAeroSimulationInput = {
      vehicleSpeedKmh: 90,
      windSpeedMs: 35,
      gustFactor: 1.4,
      windAttackAngleDeg: 90,
      barrierReductionPercent: 0,
      roadCondition: 'dry',
      vehicleProfile: defaultSemiTrailer,
    };

    const result = calculateAerodynamicForces(input);
    expect(result.rolloverRiskFactor).toBeGreaterThanOrEqual(0.9);
    expect(result.safetyStatus).toBe('ROLLOVER_HAZARD');
    expect(result.isOverturningLikely).toBe(true);
    expect(result.isTransitPermitted).toBe(false);
    expect(result.dynamicSpeedLimitKmh).toBe(0);
  });

  it('verifies that pure headwind (0 degrees) results in zero lateral side force and zero overturning moment', () => {
    const input: WindAeroSimulationInput = {
      vehicleSpeedKmh: 80,
      windSpeedMs: 25,
      gustFactor: 1.2,
      windAttackAngleDeg: 0, // Direct headwind
      barrierReductionPercent: 0,
      roadCondition: 'dry',
      vehicleProfile: defaultSemiTrailer,
    };

    const result = calculateAerodynamicForces(input);
    expect(result.lateralWindSpeedMs).toBe(0);
    expect(result.sideAeroForceN).toBe(0);
    expect(result.overturningMomentNm).toBe(0);
    expect(result.rolloverRiskFactor).toBe(0);
  });

  it('verifies that aerodynamic windbreak barrier reduces effective wind speed and lowers RRF', () => {
    const inputWithoutBarrier: WindAeroSimulationInput = {
      vehicleSpeedKmh: 70,
      windSpeedMs: 25,
      gustFactor: 1.3,
      windAttackAngleDeg: 90,
      barrierReductionPercent: 0,
      roadCondition: 'dry',
      vehicleProfile: defaultSemiTrailer,
    };

    const inputWithBarrier: WindAeroSimulationInput = {
      ...inputWithoutBarrier,
      barrierReductionPercent: 50, // 50% attenuation from porous wind fence
    };

    const resultWithout = calculateAerodynamicForces(inputWithoutBarrier);
    const resultWith = calculateAerodynamicForces(inputWithBarrier);

    expect(resultWith.effectiveWindSpeedMs).toBeLessThan(resultWithout.effectiveWindSpeedMs);
    expect(resultWith.sideAeroForceN).toBeLessThan(resultWithout.sideAeroForceN);
    expect(resultWith.rolloverRiskFactor).toBeLessThan(resultWithout.rolloverRiskFactor);
  });

  it('reduces dynamic speed limits when road surface is ice or slush', () => {
    const dryInput: WindAeroSimulationInput = {
      vehicleSpeedKmh: 50,
      windSpeedMs: 15,
      gustFactor: 1.2,
      windAttackAngleDeg: 90,
      barrierReductionPercent: 0,
      roadCondition: 'dry',
      vehicleProfile: defaultPatrolCar,
    };

    const iceInput: WindAeroSimulationInput = {
      ...dryInput,
      roadCondition: 'ice',
    };

    const dryResult = calculateAerodynamicForces(dryInput);
    const iceResult = calculateAerodynamicForces(iceInput);

    expect(iceResult.dynamicSpeedLimitKmh).toBeLessThan(dryResult.dynamicSpeedLimitKmh);
  });

  it('calculates statutory speeding fines under İXM 328 and applies 50% prompt discount', () => {
    const speedingInput: WindAeroSimulationInput = {
      vehicleSpeedKmh: 120, // Driving at 120 km/h when advisory limit is 70 km/h (50 km/h over)
      windSpeedMs: 20,
      gustFactor: 1.2,
      windAttackAngleDeg: 90,
      barrierReductionPercent: 0,
      roadCondition: 'dry',
      vehicleProfile: defaultPatrolCar,
    };

    const result = calculateAerodynamicForces(speedingInput);
    expect(result.statutoryFineAzN).toBeGreaterThanOrEqual(250);
    expect(result.discountedFineAzN).toBe(result.statutoryFineAzN * 0.5);
    expect(result.statutoryFineUsd).toBeGreaterThan(0);
    expect(result.statutoryFineEur).toBeGreaterThan(0);
    expect(result.complianceNotes.length).toBeGreaterThan(0);
  });

  it('evaluates checklist compliance correctly for all mandatory items', () => {
    const mandatoryIds = MOCK_WIND_CHECKLIST_ITEMS.filter(i => i.isMandatory).map(i => i.id);
    const resultFull = evaluateWindChecklist(
      MOCK_WIND_CHECKLIST_ITEMS.map(i => i.id),
      MOCK_WIND_CHECKLIST_ITEMS
    );

    expect(resultFull.isCompliant).toBe(true);
    expect(resultFull.scorePercentage).toBe(100);
    expect(resultFull.checkedMandatoryCount).toBe(mandatoryIds.length);

    const resultPartial = evaluateWindChecklist([], MOCK_WIND_CHECKLIST_ITEMS);
    expect(resultPartial.isCompliant).toBe(false);
    expect(resultPartial.checkedCount).toBe(0);
    expect(resultPartial.scorePercentage).toBe(0);
  });

  it('grades exam accurately and yields pass status for score >= 80%', () => {
    const passingAnswers: Record<number, number> = {};
    MOCK_WIND_EXAM_QUESTIONS.forEach(q => {
      passingAnswers[q.id] = q.correctOptionIndex;
    });

    const result = gradeWindExam(passingAnswers, MOCK_WIND_EXAM_QUESTIONS);
    expect(result.isPassed).toBe(true);
    expect(result.scorePercentage).toBe(100);
    expect(result.correctAnswers).toBe(MOCK_WIND_EXAM_QUESTIONS.length);

    // Fail case
    const failingAnswers: Record<number, number> = {};
    MOCK_WIND_EXAM_QUESTIONS.forEach((q, idx) => {
      failingAnswers[q.id] = idx === 0 ? q.correctOptionIndex : (q.correctOptionIndex + 1) % 4;
    });

    const failResult = gradeWindExam(failingAnswers, MOCK_WIND_EXAM_QUESTIONS);
    expect(failResult.isPassed).toBe(false);
    expect(failResult.scorePercentage).toBeLessThan(80);
  });

  it('generates a valid WIND-SAFE-AZ-2026 electronic certificate with SİMA signature', () => {
    const input: WindAeroSimulationInput = {
      vehicleSpeedKmh: 65,
      windSpeedMs: 18,
      gustFactor: 1.3,
      windAttackAngleDeg: 90,
      barrierReductionPercent: 20,
      roadCondition: 'dry',
      vehicleProfile: defaultSemiTrailer,
    };

    const aero = calculateAerodynamicForces(input);
    const cert = generateWindSafeCertificate(defaultCorridor, defaultSemiTrailer, input, aero);

    expect(cert.certificateId).toMatch(/^WIND-SAFE-AZ-2026-\d{5}$/);
    expect(cert.vehiclePlate).toBe(defaultSemiTrailer.licensePlate);
    expect(cert.simaSignatureUid).toContain('SIMA-GOV-AZ-');
    expect(cert.sha256Checksum.length).toBe(64);
    expect(cert.barrierPassCode.length).toBe(4);
    expect(cert.qrVerificationUrl).toContain('https://aayda.gov.az');
  });

  it('verifies existing certificates in registry database and handles non-existent queries', () => {
    const validCert = MOCK_ACTIVE_WIND_CERTIFICATES[0];
    const found = verifyWindCertificate(validCert.certificateId, MOCK_ACTIVE_WIND_CERTIFICATES);
    expect(found).not.toBeNull();
    expect(found?.vehiclePlate).toBe(validCert.vehiclePlate);

    const notFound = verifyWindCertificate('INVALID-ID-99999', MOCK_ACTIVE_WIND_CERTIFICATES);
    expect(notFound).toBeNull();

    const emptySearch = verifyWindCertificate('', MOCK_ACTIVE_WIND_CERTIFICATES);
    expect(emptySearch).toBeNull();
  });
});
