import { describe, it, expect } from 'vitest';
import {
  calculateGuardrailImpact,
  evaluateGuardrailChecklist,
  evaluateGuardrailExam,
  generateGuardrailCertificate,
  EN_1317_CAPACITY_KJ,
  WORKING_WIDTH_LIMITS_M,
  BARRIER_UNIT_RESTORATION_COST_AZN,
} from '../guardrailSafetyCompliance';
import {
  MOCK_GUARDRAIL_CHECKLIST,
  MOCK_GUARDRAIL_EXAM,
} from '../../data/mockGuardrailSafetyData';

describe('guardrailSafetyCompliance Unit Tests', () => {
  describe('calculateGuardrailImpact', () => {
    it('calculates normal kinetic energy and containment for standard passenger car within N2 limit', () => {
      const result = calculateGuardrailImpact({
        vehicleGrossMassKg: 1450,
        impactSpeedKmh: 110,
        impactAngleDeg: 20,
        barrierType: 'W_BEAM_STEEL',
        containmentLevel: 'N2',
        workingWidthClass: 'W4',
        damagedLengthMeters: 8,
      });

      expect(result.kineticEnergyNormalKj).toBeGreaterThan(0);
      expect(result.kineticEnergyNormalKj).toBeLessThanOrEqual(EN_1317_CAPACITY_KJ.N2 * 1.05);
      expect(result.containmentOutcome).toBe('SAFELY_REDIRECTED');
      expect(result.isBreached).toBe(false);
      expect(result.accelerationSeverityIndex).toBeGreaterThan(0);
      expect(result.statutoryFineAzn).toBe(100);
      expect(result.discountedFineAzn).toBe(50);
    });

    it('detects breach / penetration when kinetic energy exceeds barrier capacity', () => {
      // 40 tonne truck impacting an N2 barrier (rated only 81.9 kJ) at 90 km/h
      const result = calculateGuardrailImpact({
        vehicleGrossMassKg: 40000,
        impactSpeedKmh: 90,
        impactAngleDeg: 25,
        barrierType: 'W_BEAM_STEEL',
        containmentLevel: 'N2',
        workingWidthClass: 'W4',
        damagedLengthMeters: 16,
      });

      expect(result.isBreached).toBe(true);
      expect(result.containmentOutcome).toBe('BREACH_PENETRATION_CRITICAL');
      expect(result.kineticEnergyNormalKj).toBeGreaterThan(EN_1317_CAPACITY_KJ.N2);
    });

    it('handles crash cushion terminals with decelerated containment outcome', () => {
      const result = calculateGuardrailImpact({
        vehicleGrossMassKg: 2000,
        impactSpeedKmh: 90,
        impactAngleDeg: 10,
        barrierType: 'CRASH_CUSHION_TERMINAL',
        containmentLevel: 'N2',
        workingWidthClass: 'W1',
        damagedLengthMeters: 2,
      });

      expect(result.isBreached).toBe(false);
      expect(result.containmentOutcome).toBe('DECELERATED_IN_CUSHION');
      expect(result.asiClass).toBeDefined();
    });

    it('calculates dynamic deflection and detects pocketing when deflection exceeds working width', () => {
      const result = calculateGuardrailImpact({
        vehicleGrossMassKg: 3500,
        impactSpeedKmh: 100,
        impactAngleDeg: 20,
        barrierType: 'CABLE_BARRIER',
        containmentLevel: 'H1',
        workingWidthClass: 'W1', // W1 allows only 0.6m max deflection
        damagedLengthMeters: 10,
      });

      // Deflection should exceed 0.6m of W1
      expect(result.dynamicDeflectionM).toBeGreaterThan(WORKING_WIDTH_LIMITS_M.W1);
      if (!result.isBreached) {
        expect(result.containmentOutcome).toBe('POCKETING_WARNING');
      }
    });

    it('calculates state asset indemnification correctly including unit costs and rigging fee', () => {
      const length = 10;
      const result = calculateGuardrailImpact({
        vehicleGrossMassKg: 1500,
        impactSpeedKmh: 80,
        impactAngleDeg: 15,
        barrierType: 'THRIE_BEAM_REINFORCED',
        containmentLevel: 'H2',
        workingWidthClass: 'W3',
        damagedLengthMeters: length,
      });

      const expectedRestoration = length * BARRIER_UNIT_RESTORATION_COST_AZN.THRIE_BEAM_REINFORCED + 350;
      expect(result.restorationCostAzn).toBe(expectedRestoration);
      expect(result.totalLiabilityAzn).toBe(expectedRestoration + 100);
      expect(result.discountedTotalLiabilityAzn).toBe(expectedRestoration + 50);
    });
  });

  describe('evaluateGuardrailChecklist', () => {
    it('evaluates compliance scorecard accurately for empty checklist', () => {
      const evalEmpty = evaluateGuardrailChecklist(MOCK_GUARDRAIL_CHECKLIST, []);
      expect(evalEmpty.checkedCount).toBe(0);
      expect(evalEmpty.scorePercent).toBe(0);
      expect(evalEmpty.isCompliant).toBe(false);
      expect(evalEmpty.missingMandatoryAz.length).toBeGreaterThan(0);
    });

    it('passes compliance when all mandatory items are checked', () => {
      const allIds = MOCK_GUARDRAIL_CHECKLIST.map((item) => item.id);
      const evalFull = evaluateGuardrailChecklist(MOCK_GUARDRAIL_CHECKLIST, allIds);
      expect(evalFull.checkedCount).toBe(MOCK_GUARDRAIL_CHECKLIST.length);
      expect(evalFull.scorePercent).toBe(100);
      expect(evalFull.isCompliant).toBe(true);
      expect(evalFull.missingMandatoryAz.length).toBe(0);
    });
  });

  describe('evaluateGuardrailExam', () => {
    it('evaluates exam with 100% correct answers as ƏLA', () => {
      const answers: Record<number, number> = {};
      MOCK_GUARDRAIL_EXAM.forEach((q) => {
        answers[q.id] = q.correctOptionIndex;
      });

      const result = evaluateGuardrailExam(MOCK_GUARDRAIL_EXAM, answers);
      expect(result.scorePercent).toBe(100);
      expect(result.correctCount).toBe(10);
      expect(result.isPassed).toBe(true);
      expect(result.grade).toBe('ƏLA');
    });

    it('evaluates exam with failing answers as QEYRİ-KAFİ', () => {
      const answers: Record<number, number> = {};
      MOCK_GUARDRAIL_EXAM.forEach((q) => {
        answers[q.id] = (q.correctOptionIndex + 1) % 4;
      });

      const result = evaluateGuardrailExam(MOCK_GUARDRAIL_EXAM, answers);
      expect(result.scorePercent).toBe(0);
      expect(result.isPassed).toBe(false);
      expect(result.grade).toBe('QEYRİ-KAFİ');
    });
  });

  describe('generateGuardrailCertificate', () => {
    it('creates certificate with valid format, SİMA UID, and PIN', () => {
      const cert = generateGuardrailCertificate(
        '99-GS-101',
        'Hyundai Elantra Sedan',
        'W_BEAM_STEEL',
        'N2',
        110,
        20,
        1450,
        'M-1 Bakı - Quba Km 48+200',
        'M-1 Baku - Guba Km 48+200'
      );

      expect(cert.certificateNumber).toMatch(/^GUARD-SAFE-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-GS-101');
      expect(cert.digitalSignatureUid).toMatch(/^SIMA-AZ-VRS-\d+$/);
      expect(cert.restorationPin).toMatch(/^\d{4}-\d{4}$/);
      expect(cert.status).toBe('ACTIVE_CERTIFIED');
      expect(cert.registryHash).toContain('AAYDA-VRS-');
    });
  });
});
