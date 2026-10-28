import { describe, it, expect } from 'vitest';
import {
  evaluateSealTelemetry,
  calculateSealFeesAndPenalties,
  calculateSealChecklistScore,
  evaluateSealExam,
  generateElectronicSealCertificate,
  ELECTRONIC_SEAL_SPECS,
  TRANSIT_CORRIDORS,
  CARGO_RISK_SPECS,
  TelemetryStandInputs,
  SealChecklistItem,
  SealExamQuestion,
} from '../electronicSealCompliance';

describe('electronicSealCompliance utility functions', () => {
  const nominalInputs: TelemetryStandInputs = {
    sealType: 'GPS_ELOCK_PREMIUM',
    corridor: 'CORRIDOR_NORTH_SOUTH_M1_M3',
    cargoRisk: 'STANDARD_GENERAL',
    cableCut: false,
    ambientLightLux: 0.2,
    shockGForce: 0.8,
    batteryPercent: 95,
    routeDeviationMeters: 50,
    unauthorizedDwellMinutes: 0,
  };

  it('correctly evaluates nominal seal telemetry without tamper or deviation', () => {
    const result = evaluateSealTelemetry(nominalInputs);
    expect(result.cableStatus).toBe('INTACT');
    expect(result.lightStatus).toBe('SEALED_DARK');
    expect(result.shockStatus).toBe('NORMAL');
    expect(result.geofenceStatus).toBe('ON_CORRIDOR');
    expect(result.dwellStatus).toBe('MOVING_OR_REST_AREA');
    expect(result.overallRating).toBe('LOW_RISK_CLEARED');
    expect(result.isTamperDetected).toBe(false);
    expect(result.isRouteViolation).toBe(false);
    expect(result.requiresCustomsInterception).toBe(false);
  });

  it('detects severed cable loop and triggers critical security breach', () => {
    const severedInputs: TelemetryStandInputs = {
      ...nominalInputs,
      cableCut: true,
    };
    const result = evaluateSealTelemetry(severedInputs);
    expect(result.cableStatus).toBe('CUT_SEVERED');
    expect(result.overallRating).toBe('CRITICAL_SECURITY_BREACH');
    expect(result.isTamperDetected).toBe(true);
    expect(result.requiresCustomsInterception).toBe(true);
    expect(result.tamperExplanationAz).toContain('TƏHLÜKƏ');
  });

  it('detects door breach when internal ambient light exceeds 5 Lux', () => {
    const breachInputs: TelemetryStandInputs = {
      ...nominalInputs,
      ambientLightLux: 15.0,
    };
    const result = evaluateSealTelemetry(breachInputs);
    expect(result.lightStatus).toBe('DOOR_BREACH_LIGHT');
    expect(result.overallRating).toBe('CRITICAL_SECURITY_BREACH');
    expect(result.isTamperDetected).toBe(true);
    expect(result.requiresCustomsInterception).toBe(true);
  });

  it('detects route deviation exceeding corridor buffer limit', () => {
    const devInputs: TelemetryStandInputs = {
      ...nominalInputs,
      routeDeviationMeters: 1500, // corridor buffer is 1000m
    };
    const result = evaluateSealTelemetry(devInputs);
    expect(result.geofenceStatus).toBe('ROUTE_DEVIATION_ALERT');
    expect(result.overallRating).toBe('CRITICAL_SECURITY_BREACH');
    expect(result.isRouteViolation).toBe(true);
    expect(result.requiresCustomsInterception).toBe(true);
  });

  it('detects unauthorized dwell outside designated TIR rest areas exceeding 45 mins', () => {
    const dwellInputs: TelemetryStandInputs = {
      ...nominalInputs,
      unauthorizedDwellMinutes: 60,
    };
    const result = evaluateSealTelemetry(dwellInputs);
    expect(result.dwellStatus).toBe('UNAUTHORIZED_DWELL_ALERT');
    expect(result.isRouteViolation).toBe(true);
    expect(result.overallRating).toBe('ELEVATED_SURVEILLANCE');
  });

  it('detects high shock impact and rollover thresholds', () => {
    const shockInputs: TelemetryStandInputs = {
      ...nominalInputs,
      shockGForce: 4.5,
    };
    expect(evaluateSealTelemetry(shockInputs).shockStatus).toBe('HIGH_IMPACT');

    const rollInputs: TelemetryStandInputs = {
      ...nominalInputs,
      shockGForce: 7.0,
    };
    expect(evaluateSealTelemetry(rollInputs).shockStatus).toBe('ROLLOVER');
  });

  it('calculates statutory seal fees and currency conversions correctly', () => {
    const feeAzn = calculateSealFeesAndPenalties(nominalInputs, 'AZN');
    expect(feeAzn.baseSealFeeAzn).toBe(ELECTRONIC_SEAL_SPECS.GPS_ELOCK_PREMIUM.baseFeeAzn);
    expect(feeAzn.corridorDistanceSurchargeAzn).toBe(15); // > 300km
    expect(feeAzn.totalStatutoryDutyAzn).toBeGreaterThan(0);
    expect(feeAzn.statutoryFineAzn).toBe(0);

    const feeUsd = calculateSealFeesAndPenalties(nominalInputs, 'USD');
    expect(feeUsd.currency).toBe('USD');
    expect(feeUsd.convertedTotal).toBeCloseTo(feeAzn.totalPayableAzn * 0.5882, 1);
  });

  it('calculates statutory administrative fines under İXM 499 for severe tampering', () => {
    const violatedInputs: TelemetryStandInputs = {
      ...nominalInputs,
      cableCut: true,
      routeDeviationMeters: 1800,
      unauthorizedDwellMinutes: 50,
    };
    const fee = calculateSealFeesAndPenalties(violatedInputs, 'AZN');
    expect(fee.statutoryFineAzn).toBe(1500 + 800 + 500); // 2800 AZN
    expect(fee.totalPayableAzn).toBe(fee.totalStatutoryDutyAzn + 2800);
  });

  it('evaluates checklist scores and mandatory requirements', () => {
    const mockItems: SealChecklistItem[] = [
      {
        id: '1',
        category: 'SEAL_HARDWARE',
        titleAz: 'Hardware',
        titleEn: 'Hardware',
        titleRu: 'Hardware',
        descriptionAz: 'Desc',
        legalBasis: 'ISO',
        isMandatory: true,
      },
      {
        id: '2',
        category: 'GEOFENCE_GPS',
        titleAz: 'GPS',
        titleEn: 'GPS',
        titleRu: 'GPS',
        descriptionAz: 'Desc',
        legalBasis: 'ISO',
        isMandatory: false,
      },
    ];

    const resultPass = calculateSealChecklistScore(mockItems, ['1', '2']);
    expect(resultPass.scorePercent).toBe(100);
    expect(resultPass.passed).toBe(true);

    const resultFail = calculateSealChecklistScore(mockItems, ['2']);
    expect(resultFail.scorePercent).toBe(50);
    expect(resultFail.mandatoryFulfilled).toBe(false);
    expect(resultFail.passed).toBe(false);
  });

  it('evaluates exam answers with pass and fail criteria', () => {
    const mockQuestions: SealExamQuestion[] = [
      {
        id: 1,
        questionAz: 'Q1',
        questionEn: 'Q1',
        questionRu: 'Q1',
        optionsAz: ['A', 'B'],
        optionsEn: ['A', 'B'],
        optionsRu: ['A', 'B'],
        correctIndex: 1,
        explanationAz: 'Exp',
        explanationEn: 'Exp',
        explanationRu: 'Exp',
        legalArticle: 'Art',
      },
      {
        id: 2,
        questionAz: 'Q2',
        questionEn: 'Q2',
        questionRu: 'Q2',
        optionsAz: ['A', 'B'],
        optionsEn: ['A', 'B'],
        optionsRu: ['A', 'B'],
        correctIndex: 0,
        explanationAz: 'Exp',
        explanationEn: 'Exp',
        explanationRu: 'Exp',
        legalArticle: 'Art',
      },
    ];

    const passResult = evaluateSealExam(mockQuestions, { 1: 1, 2: 0 });
    expect(passResult.scorePercent).toBe(100);
    expect(passResult.passed).toBe(true);

    const failResult = evaluateSealExam(mockQuestions, { 1: 0, 2: 0 });
    expect(failResult.scorePercent).toBe(50);
    expect(failResult.passed).toBe(false);
  });

  it('generates an official Electronic Transit Integrity Certificate with SHA-256 and SIMA UID', () => {
    const evalResult = evaluateSealTelemetry(nominalInputs);
    const cert = generateElectronicSealCertificate('99-EL-101', 'MSKU-918234-1', nominalInputs, evalResult);

    expect(cert.certificateNumber).toMatch(/^E-SEAL-AZ-2026-\d{5}$/);
    expect(cert.plateNumber).toBe('99-EL-101');
    expect(cert.containerNumber).toBe('MSKU-918234-1');
    expect(cert.sealSerial).toMatch(/^DGK-ELOCK-994-\d{4}$/);
    expect(cert.securityChecksumSha256).toContain('SHA256-');
    expect(cert.simaDigitalUid).toContain('SIMA-GOV-AZ-');
    expect(cert.isTamperFree).toBe(true);
    expect(cert.isClearedForExit).toBe(true);
  });
});
