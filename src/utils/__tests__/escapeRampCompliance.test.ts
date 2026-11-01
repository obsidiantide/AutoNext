import { describe, it, expect } from 'vitest';
import {
  calculateEscapeRampPhysics,
  evaluateEscapeChecklist,
  scoreEscapeExam,
  generateEscapeRampCertificate,
  verifyEscapeCertificate,
  EscapeRampSimulationInput,
} from '../escapeRampCompliance';
import {
  MOCK_ESCAPE_RAMP_ASSETS,
  MOCK_ESCAPE_VEHICLES,
  MOCK_ESCAPE_CHECKLIST,
  MOCK_ESCAPE_EXAM_QUESTIONS,
  MOCK_ESCAPE_CERTIFICATES,
} from '../../data/mockEscapeRampData';

describe('Escape Ramp & Arrester Bed Compliance Engine', () => {
  const baseInput: EscapeRampSimulationInput = {
    entrySpeedKmh: 90,
    vehicleMassKg: 40000,
    rampInclineDeg: 9.0,
    bedFrictionCoeff: 0.28,
    brakeTempC: 450,
    bedLengthM: 350,
    hasCableNetArrester: true,
  };

  it('calculates stopping distance and deceleration on gravel arrester bed', () => {
    const res = calculateEscapeRampPhysics(baseInput, 'AZN');

    expect(res.entrySpeedMs).toBe(25);
    expect(res.decelerationMps2).toBeGreaterThan(0);
    expect(res.decelerationG).toBeGreaterThan(0);
    expect(res.stoppingDistanceM).toBeGreaterThan(0);
    expect(res.stoppingDistanceM).toBeLessThan(baseInput.bedLengthM);
    expect(res.isWithinBedBounds).toBe(true);
  });

  it('calculates kinetic energy and thermal brake dissipation correctly', () => {
    const res = calculateEscapeRampPhysics(baseInput, 'AZN');

    expect(res.kineticEnergyMj).toBeGreaterThan(0);
    expect(res.brakeThermalEnergyMj).toBeGreaterThan(0);
    expect(res.totalBrakeTempC).toBeGreaterThan(baseInput.brakeTempC);
    expect(['NORMAL', 'ELEVATED', 'CRITICAL', 'COMPLETE_FADE']).toContain(res.brakeFadeStatus);
  });

  it('triggers critical brake fade status and administrative fines when brake temp is extreme', () => {
    const extremeBrakeInput: EscapeRampSimulationInput = {
      ...baseInput,
      brakeTempC: 600,
      entrySpeedKmh: 110,
    };
    const res = calculateEscapeRampPhysics(extremeBrakeInput, 'AZN');

    expect(res.brakeFadeStatus).toBe('COMPLETE_FADE');
    expect(res.statutoryFineAzN).toBeGreaterThanOrEqual(180); // İXM 342.2 + 353.1
    expect(res.discountedFineAzN).toBe(Math.round(res.statutoryFineAzN * 0.5));
    expect(res.complianceNotes.length).toBeGreaterThan(0);
  });

  it('detects ramp overrun risk when entry speed is excessive and bed length is short', () => {
    const runawayInput: EscapeRampSimulationInput = {
      ...baseInput,
      entrySpeedKmh: 150,
      bedLengthM: 40,
      rampInclineDeg: 0,
      hasCableNetArrester: false,
    };
    const res = calculateEscapeRampPhysics(runawayInput, 'AZN');

    expect(res.isWithinBedBounds).toBe(false);
    expect(res.rampArrestStatus).toBe('RAMP_OVERRUN_RISK');
  });

  it('evaluates compliance checklist accurately', () => {
    const emptyChecked = evaluateEscapeChecklist(MOCK_ESCAPE_CHECKLIST, {});
    expect(emptyChecked.completedItems).toBe(0);
    expect(emptyChecked.isFullyCompliant).toBe(false);
    expect(emptyChecked.completionPercentage).toBe(0);

    const allCheckedMap: Record<string, boolean> = {};
    MOCK_ESCAPE_CHECKLIST.forEach(item => {
      allCheckedMap[item.id] = true;
    });

    const fullChecked = evaluateEscapeChecklist(MOCK_ESCAPE_CHECKLIST, allCheckedMap);
    expect(fullChecked.completedItems).toBe(MOCK_ESCAPE_CHECKLIST.length);
    expect(fullChecked.isFullyCompliant).toBe(true);
    expect(fullChecked.completionPercentage).toBe(100);
  });

  it('evaluates driver theoretical exam scoring accurately', () => {
    const perfectAnswers: Record<number, number> = {};
    MOCK_ESCAPE_EXAM_QUESTIONS.forEach(q => {
      perfectAnswers[q.id] = q.correctOptionIndex;
    });

    const evalRes = scoreEscapeExam(MOCK_ESCAPE_EXAM_QUESTIONS, perfectAnswers);
    expect(evalRes.totalQuestions).toBe(MOCK_ESCAPE_EXAM_QUESTIONS.length);
    expect(evalRes.correctAnswers).toBe(MOCK_ESCAPE_EXAM_QUESTIONS.length);
    expect(evalRes.scorePercentage).toBe(100);
    expect(evalRes.isPassed).toBe(true);

    const failAnswers: Record<number, number> = { 1: 99 };
    const failRes = scoreEscapeExam(MOCK_ESCAPE_EXAM_QUESTIONS, failAnswers);
    expect(failRes.isPassed).toBe(false);
  });

  it('generates an official ESCAPE-RAMP-AZ-2026 electronic certificate with SİMA UID and SHA-256', () => {
    const ramp = MOCK_ESCAPE_RAMP_ASSETS[0];
    const vehicle = MOCK_ESCAPE_VEHICLES[0];
    const res = calculateEscapeRampPhysics(baseInput, 'AZN');

    const cert = generateEscapeRampCertificate(ramp, vehicle, baseInput, res);

    expect(cert.certificateId).toMatch(/^ESCAPE-RAMP-AZ-2026-\d{5}$/);
    expect(cert.vehiclePlate).toBe(vehicle.licensePlate);
    expect(cert.rampName).toBe(ramp.nameAz);
    expect(cert.recoveryPin).toMatch(/^\d{4}$/);
    expect(cert.simaSignatureUid).toMatch(/^SIMA-AAYDA-FHN-/);
    expect(cert.sha256Checksum).toHaveLength(64);
    expect(['CLEARED', 'RECOVERY_DISPATCHED', 'UNDER_INSPECTION']).toContain(cert.complianceStatus);
  });

  it('verifies certificates in public registry accurately', () => {
    const existing = MOCK_ESCAPE_CERTIFICATES[0];
    const found = verifyEscapeCertificate(existing.certificateId, MOCK_ESCAPE_CERTIFICATES);
    expect(found).not.toBeNull();
    expect(found?.certificateId).toBe(existing.certificateId);

    const notFound = verifyEscapeCertificate('NON-EXISTENT-ID', MOCK_ESCAPE_CERTIFICATES);
    expect(notFound).toBeNull();

    const empty = verifyEscapeCertificate('', MOCK_ESCAPE_CERTIFICATES);
    expect(empty).toBeNull();
  });

  it('computes currency conversion for fines and recovery winch costs', () => {
    const resAzn = calculateEscapeRampPhysics(baseInput, 'AZN');
    const resUsd = calculateEscapeRampPhysics(baseInput, 'USD');
    const resEur = calculateEscapeRampPhysics(baseInput, 'EUR');

    expect(resAzn.statutoryFineAzN).toBeGreaterThanOrEqual(0);
    expect(resUsd.statutoryFineUsd).toBeGreaterThanOrEqual(0);
    expect(resEur.statutoryFineEur).toBeGreaterThanOrEqual(0);
  });
});
