import { describe, it, expect } from 'vitest';
import {
  calculateTirTransitCost,
  evaluateXRayScanTelemetry,
  evaluateSafetyChecklist,
  evaluateTheoreticalExam,
  generateETransitCertificate,
  ADR_CLASSES_INFO,
} from '../tirCarnetCompliance';
import {
  MOCK_FREIGHT_PRESETS,
  MOCK_SAFETY_CHECKLIST,
  MOCK_THEORETICAL_EXAM_QUESTIONS,
} from '../../data/mockTirCarnetData';

describe('tirCarnetCompliance utility', () => {
  describe('calculateTirTransitCost', () => {
    it('calculates standard freight transit costs accurately for AZN', () => {
      const res = calculateTirTransitCost({
        declaredCargoValueAzn: 50000,
        cargoWeightTon: 20,
        tirVolets: 'VOLET_14',
        greenCorridorStatus: 'YELLOW',
        adrClass: 'NONE',
        isElectronicGpsSeal: true,
        requiresEscort: false,
      });

      expect(res.customsDutyAzn).toBe(120);
      expect(res.tirCarnetFeeAzn).toBe(110);
      expect(res.xrayScanFeeAzn).toBe(40);
      expect(res.electronicSealFeeAzn).toBe(45);
      expect(res.adrSpecialPermitFeeAzn).toBe(0);
      expect(res.policeFhnEscortFeeAzn).toBe(0);
      expect(res.totalPayableAzn).toBeGreaterThan(300);
      expect(res.guaranteeCeilingEur).toBe(100000);
      expect(res.timeSavedHours).toBeGreaterThan(0);
    });

    it('applies Green Corridor discount and zero X-ray fee', () => {
      const res = calculateTirTransitCost({
        declaredCargoValueAzn: 100000,
        cargoWeightTon: 22,
        tirVolets: 'VOLET_4',
        greenCorridorStatus: 'GREEN',
        adrClass: 'NONE',
        isElectronicGpsSeal: false,
        requiresEscort: false,
      });

      expect(res.xrayScanFeeAzn).toBe(0); // Exempt for Green Corridor
      expect(res.greenCorridorWaitHours).toBeLessThan(1.0);
      expect(res.timeSavedHours).toBeGreaterThan(8.0);
    });

    it('calculates ADR Class 1 explosives with mandatory escort and surcharges', () => {
      const res = calculateTirTransitCost({
        declaredCargoValueAzn: 250000,
        cargoWeightTon: 18,
        tirVolets: 'VOLET_20',
        greenCorridorStatus: 'RED',
        adrClass: 'CLASS_1',
        isElectronicGpsSeal: true,
        requiresEscort: true,
      });

      expect(res.adrSpecialPermitFeeAzn).toBe(ADR_CLASSES_INFO.CLASS_1.specialPermitFeeAzn);
      expect(res.policeFhnEscortFeeAzn).toBeGreaterThan(0);
      expect(res.riskCategoryScore).toBeGreaterThan(50);
    });

    it('handles heavy cargo weight surcharges (>24 tons)', () => {
      const resLight = calculateTirTransitCost({
        declaredCargoValueAzn: 30000,
        cargoWeightTon: 20,
        tirVolets: 'VOLET_6',
        greenCorridorStatus: 'BLUE',
        adrClass: 'NONE',
        isElectronicGpsSeal: false,
        requiresEscort: false,
      });

      const resHeavy = calculateTirTransitCost({
        declaredCargoValueAzn: 30000,
        cargoWeightTon: 32, // +8 tons over 24
        tirVolets: 'VOLET_6',
        greenCorridorStatus: 'BLUE',
        adrClass: 'NONE',
        isElectronicGpsSeal: false,
        requiresEscort: false,
      });

      expect(resHeavy.customsDutyAzn).toBeGreaterThan(resLight.customsDutyAzn);
    });

    it('converts currencies correctly to USD and EUR', () => {
      const res = calculateTirTransitCost(
        {
          declaredCargoValueAzn: 40000,
          cargoWeightTon: 15,
          tirVolets: 'VOLET_4',
          greenCorridorStatus: 'GREEN',
          adrClass: 'NONE',
          isElectronicGpsSeal: false,
          requiresEscort: false,
        },
        'USD'
      );

      expect(res.totalPayableUsd).toBeGreaterThan(0);
      expect(res.totalPayableEur).toBeGreaterThan(0);
      expect(res.totalPayableUsd).toBeLessThan(res.totalPayableAzn);
    });
  });

  describe('evaluateXRayScanTelemetry', () => {
    it('evaluates safe organic material scan', () => {
      const telemetry = evaluateXRayScanTelemetry(7, 0.10, false);
      expect(telemetry.materialCategory).toBe('ORGANIC');
      expect(telemetry.isRadiationSafe).toBe(true);
      expect(telemetry.anomalyDetected).toBe(false);
      expect(telemetry.overallInspectionResult).toBe('CLEARED');
      expect(telemetry.sealIntegrityStatus).toBe('INTACT_VERIFIED');
    });

    it('flags high radiation level above 0.25 µSv/h', () => {
      const telemetry = evaluateXRayScanTelemetry(14, 0.35, false);
      expect(telemetry.materialCategory).toBe('INORGANIC_ALUMINUM');
      expect(telemetry.isRadiationSafe).toBe(false);
      expect(telemetry.anomalyDetected).toBe(true);
      expect(telemetry.overallInspectionResult).toBe('SEIZED');
      expect(telemetry.anomalyDescription).toContain('Radiasiya');
    });

    it('flags broken or tampered customs seal', () => {
      const telemetry = evaluateXRayScanTelemetry(26, 0.12, true);
      expect(telemetry.sealIntegrityStatus).toBe('TAMPER_ALERT');
      expect(telemetry.anomalyDetected).toBe(true);
      expect(telemetry.overallInspectionResult).toBe('SEIZED');
    });

    it('detects dense lead/tungsten shielding anomaly', () => {
      const telemetry = evaluateXRayScanTelemetry(82, 0.11, false);
      expect(telemetry.materialCategory).toBe('DENSE_LEAD_TUNGSTEN');
      expect(telemetry.anomalyDetected).toBe(true);
      expect(telemetry.overallInspectionResult).toBe('SECONDARY_PHYSICAL_SEARCH_REQUIRED');
    });
  });

  describe('evaluateSafetyChecklist', () => {
    it('evaluates fully checked checklist', () => {
      const allIds = MOCK_SAFETY_CHECKLIST.map((i) => i.id);
      const res = evaluateSafetyChecklist(allIds, MOCK_SAFETY_CHECKLIST);

      expect(res.passedCount).toBe(MOCK_SAFETY_CHECKLIST.length);
      expect(res.completionPercentage).toBe(100);
      expect(res.allMandatoryPassed).toBe(true);
      expect(res.missingMandatoryIds).toHaveLength(0);
    });

    it('detects missing mandatory items', () => {
      const mandatoryIds = MOCK_SAFETY_CHECKLIST.filter((i) => i.isMandatory).map((i) => i.id);
      // exclude first mandatory item
      const missingOne = mandatoryIds.slice(1);
      const res = evaluateSafetyChecklist(missingOne, MOCK_SAFETY_CHECKLIST);

      expect(res.allMandatoryPassed).toBe(false);
      expect(res.missingMandatoryIds).toContain(mandatoryIds[0]);
    });
  });

  describe('evaluateTheoreticalExam', () => {
    it('scores exam and awards passing result for 8+ correct answers', () => {
      const answers: Record<number, number> = {};
      MOCK_THEORETICAL_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = q.correctOptionIndex;
      });

      const res = evaluateTheoreticalExam(answers, MOCK_THEORETICAL_EXAM_QUESTIONS);
      expect(res.score).toBe(10);
      expect(res.passed).toBe(true);
      expect(res.percentage).toBe(100);
    });

    it('fails exam if score is below 8', () => {
      const answers: Record<number, number> = {
        1: 0, // incorrect
        2: 0, // incorrect
        3: 0, // incorrect
      };

      const res = evaluateTheoreticalExam(answers, MOCK_THEORETICAL_EXAM_QUESTIONS);
      expect(res.score).toBeLessThan(8);
      expect(res.passed).toBe(false);
    });
  });

  describe('generateETransitCertificate', () => {
    it('generates certificate with SHA256 checksum and SIMA UID', () => {
      const preset = MOCK_FREIGHT_PRESETS[0];
      const calcResult = calculateTirTransitCost({
        declaredCargoValueAzn: preset.declaredValueAzn,
        cargoWeightTon: preset.cargoWeightTon,
        tirVolets: preset.tirVolets,
        greenCorridorStatus: preset.greenCorridorStatus,
        adrClass: preset.adrClass,
        isElectronicGpsSeal: preset.isElectronicSeal,
        requiresEscort: false,
      });

      const cert = generateETransitCertificate(preset, calcResult);
      expect(cert.certificateId).toMatch(/^DGK-TIR-2026-\d{5}$/);
      expect(cert.carrierName).toBe(preset.carrierName);
      expect(cert.tractorPlate).toBe(preset.tractorPlate);
      expect(cert.securityChecksumSha256).toContain('SHA256:DGK:');
      expect(cert.simaDigitalSignUid).toContain('SIMA-GOV-AZ-');
      expect(cert.verifiedInUnifiedRegistry).toBe(true);
    });
  });
});
