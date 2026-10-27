import { describe, it, expect } from 'vitest';
import {
  convertCurrency,
  evaluateWindTelemetry,
  evaluateCableIntegrity,
  calculateFareTariff,
  evaluateSafetyChecklist,
  evaluateTheoreticalExam,
  generateCableCarCertificate,
  SafetyChecklistItem,
  TheoreticalExamQuestion,
} from '../cableCarCompliance';
import { MOCK_ROPEWAY_INSTALLATIONS } from '../../data/mockCableCarData';

describe('cableCarCompliance Utility Suite', () => {
  describe('convertCurrency', () => {
    it('returns exact amount for AZN', () => {
      expect(convertCurrency(100, 'AZN')).toBe(100);
    });

    it('converts correctly to USD (1.7 rate)', () => {
      expect(convertCurrency(170, 'USD')).toBe(100.0);
    });

    it('converts correctly to EUR (1.85 rate)', () => {
      expect(convertCurrency(185, 'EUR')).toBe(100.0);
    });
  });

  describe('evaluateWindTelemetry', () => {
    it('evaluates safe wind speeds below 10 m/s', () => {
      const result = evaluateWindTelemetry(6.0, 8.5, 45, 12, 0, 30);
      expect(result.status).toBe('safe');
      expect(result.maxOperationalSpeedLimitMs).toBe(6.0);
      expect(result.lateralCabinSwayDeg).toBeGreaterThan(0);
      expect(result.windSpeedKmh).toBe(21.6);
      expect(result.recommendedActionAz).toContain('Normal istismar');
    });

    it('evaluates caution / restricted regime when wind gust is between 12 and 17.9 m/s', () => {
      const result = evaluateWindTelemetry(11.0, 14.5, 60, 5, 0, 20);
      expect(result.status).toBe('caution');
      expect(result.maxOperationalSpeedLimitMs).toBe(3.0);
      expect(result.recommendedActionAz).toContain('XƏBƏRDARLIQ');
    });

    it('triggers critical evacuation when wind gust exceeds 18 m/s', () => {
      const result = evaluateWindTelemetry(16.0, 21.0, 90, 2, 0, 20);
      expect(result.status).toBe('critical_evacuation');
      expect(result.maxOperationalSpeedLimitMs).toBe(0.0);
      expect(result.recommendedActionAz).toContain('TƏCİLİ DAYANMA');
    });

    it('triggers critical evacuation when lightning is under 5 km', () => {
      const result = evaluateWindTelemetry(5.0, 7.0, 30, 10, 0, 3.5);
      expect(result.status).toBe('critical_evacuation');
      expect(result.maxOperationalSpeedLimitMs).toBe(0.0);
    });

    it('triggers critical evacuation when ice accretion is 5 mm or more', () => {
      const result = evaluateWindTelemetry(5.0, 7.0, 30, -5, 6.0, 30);
      expect(result.status).toBe('critical_evacuation');
    });
  });

  describe('evaluateCableIntegrity', () => {
    it('evaluates new or sound cable as certified with high safety factor', () => {
      const result = evaluateCableIntegrity(52.0, 51.8, 0, 1, 1.2, 160, 5.0, 310);
      expect(result.status).toBe('certified');
      expect(result.discardCriteriaMet).toBe(false);
      expect(result.safetyFactor).toBeGreaterThanOrEqual(4.0);
      expect(result.diameterReductionPct).toBeLessThan(1.0);
    });

    it('flags maintenance due when minor outer wire breaks or moderate liner wear exist', () => {
      const result = evaluateCableIntegrity(52.0, 50.0, 4, 7, 5.0, 155, 11.0, 350);
      expect(result.status).toBe('maintenance_due');
      expect(result.discardCriteriaMet).toBe(false);
      expect(result.safetyFactor).toBeLessThan(4.0);
    });

    it('mandates rope discard when diameter reduction reaches or exceeds 6%', () => {
      // 52mm down to 48.5mm is >6.7% reduction
      const result = evaluateCableIntegrity(52.0, 48.5, 2, 4, 3.0, 160, 6.0, 320);
      expect(result.status).toBe('cable_discard_required');
      expect(result.discardCriteriaMet).toBe(true);
      expect(result.diameterReductionPct).toBeGreaterThanOrEqual(6.0);
    });

    it('mandates rope discard when broken outer wires reach 6 in 6d length', () => {
      const result = evaluateCableIntegrity(52.0, 51.5, 7, 10, 3.0, 160, 5.0, 320);
      expect(result.status).toBe('cable_discard_required');
      expect(result.discardCriteriaMet).toBe(true);
    });

    it('mandates rope discard when Loss of Metallic Area (LMA) reaches 8% or more', () => {
      const result = evaluateCableIntegrity(52.0, 51.0, 2, 4, 9.5, 160, 5.0, 320);
      expect(result.status).toBe('cable_discard_required');
      expect(result.discardCriteriaMet).toBe(true);
    });

    it('mandates rope discard when emergency track brake exceeds 400ms', () => {
      const result = evaluateCableIntegrity(52.0, 51.8, 0, 1, 1.0, 160, 5.0, 480);
      expect(result.status).toBe('cable_discard_required');
      expect(result.discardCriteriaMet).toBe(true);
    });
  });

  describe('calculateFareTariff', () => {
    it('calculates standard single ride fare for adult', () => {
      const result = calculateFareTariff(18.0, 'single_ride', 'adult', false, 'AZN');
      expect(result.basePriceAzn).toBe(18.0);
      expect(result.discountPercentage).toBe(0);
      expect(result.finalTotalAzn).toBe(18.0);
      expect(result.isFreeExemption).toBe(false);
    });

    it('applies 50% discount for children and students', () => {
      const result = calculateFareTariff(20.0, 'single_ride', 'child_student', false, 'AZN');
      expect(result.basePriceAzn).toBe(20.0);
      expect(result.discountPercentage).toBe(50);
      expect(result.discountAmountAzn).toBe(10.0);
      expect(result.finalTotalAzn).toBe(10.0);
    });

    it('applies 40% discount for seniors', () => {
      const result = calculateFareTariff(20.0, 'single_ride', 'senior', false, 'AZN');
      expect(result.discountPercentage).toBe(40);
      expect(result.discountAmountAzn).toBe(8.0);
      expect(result.finalTotalAzn).toBe(12.0);
    });

    it('applies 100% free exemption for PRM individuals and war veterans', () => {
      const result = calculateFareTariff(25.0, 'day_ski_pass', 'prm_veteran', true, 'AZN');
      expect(result.isFreeExemption).toBe(true);
      expect(result.discountPercentage).toBe(100);
      expect(result.gearSurchargeAzn).toBe(0);
      expect(result.finalTotalAzn).toBe(0);
    });

    it('adds gear surcharge for mountain bike or paraglider', () => {
      const result = calculateFareTariff(16.0, 'return_trip', 'adult', true, 'AZN');
      // 16 * 1.6 = 25.60 AZN + 5.00 gear surcharge = 30.60 AZN
      expect(result.gearSurchargeAzn).toBe(5.0);
      expect(result.finalTotalAzn).toBe(30.6);
    });

    it('supports pass multipliers for season pass', () => {
      const result = calculateFareTariff(10.0, 'season_pass', 'adult', false, 'AZN');
      // 10 * 25 = 250.00 AZN
      expect(result.finalTotalAzn).toBe(250.0);
    });
  });

  describe('evaluateSafetyChecklist', () => {
    it('returns passed when all checklist items are compliant', () => {
      const items: SafetyChecklistItem[] = [
        {
          id: '1',
          titleAz: 'Test 1',
          titleEn: 'Test 1',
          descriptionAz: '',
          descriptionEn: '',
          category: 'cable_mechanical',
          regulatoryStandard: 'EN',
          critical: true,
          compliant: true,
        },
        {
          id: '2',
          titleAz: 'Test 2',
          titleEn: 'Test 2',
          descriptionAz: '',
          descriptionEn: '',
          category: 'electrical_anemometer',
          regulatoryStandard: 'EN',
          critical: false,
          compliant: true,
        },
      ];

      const audit = evaluateSafetyChecklist(items);
      expect(audit.overallStatus).toBe('passed');
      expect(audit.scorePercentage).toBe(100);
      expect(audit.criticalFailedCount).toBe(0);
    });

    it('returns failed when a critical item is non-compliant', () => {
      const items: SafetyChecklistItem[] = [
        {
          id: '1',
          titleAz: 'Critical item',
          titleEn: 'Critical item',
          descriptionAz: '',
          descriptionEn: '',
          category: 'cable_mechanical',
          regulatoryStandard: 'EN',
          critical: true,
          compliant: false,
        },
        {
          id: '2',
          titleAz: 'Non-critical item',
          titleEn: 'Non-critical item',
          descriptionAz: '',
          descriptionEn: '',
          category: 'passenger_safety',
          regulatoryStandard: 'EN',
          critical: false,
          compliant: true,
        },
      ];

      const audit = evaluateSafetyChecklist(items);
      expect(audit.overallStatus).toBe('failed');
      expect(audit.criticalFailedCount).toBe(1);
      expect(audit.fhnAuditConclusionAz).toContain('İSTİSMAR QADAĞANDIR');
    });

    it('returns conditional when non-critical items fail but overall score is 70-89%', () => {
      const items: SafetyChecklistItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        titleAz: `Item ${i}`,
        titleEn: `Item ${i}`,
        descriptionAz: '',
        descriptionEn: '',
        category: 'passenger_safety',
        regulatoryStandard: 'EN',
        critical: false,
        compliant: i < 8, // 8 out of 10 passed = 80%
      }));

      const audit = evaluateSafetyChecklist(items);
      expect(audit.overallStatus).toBe('conditional');
      expect(audit.scorePercentage).toBe(80);
    });
  });

  describe('evaluateTheoreticalExam', () => {
    const mockQuestions: TheoreticalExamQuestion[] = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      questionAz: `Sual ${i}`,
      questionEn: `Question ${i}`,
      optionsAz: ['A', 'B', 'C', 'D'],
      optionsEn: ['A', 'B', 'C', 'D'],
      correctOptionIndex: 0,
      explanationAz: 'İzah',
      explanationEn: 'Explanation',
      legalCitation: 'EN 1709',
    }));

    it('passes exam when scoring 8 or more out of 10', () => {
      const answers: Record<string, number> = {
        q0: 0,
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
        q5: 0,
        q6: 0,
        q7: 0,
        q8: 1, // wrong
        q9: 2, // wrong
      };

      const result = evaluateTheoreticalExam(mockQuestions, answers);
      expect(result.passed).toBe(true);
      expect(result.correctAnswersCount).toBe(8);
      expect(result.scorePercentage).toBe(80);
      expect(result.certificationStatusAz).toContain('uğurla keçildi');
    });

    it('fails exam when scoring under 8 out of 10', () => {
      const answers: Record<string, number> = {
        q0: 0,
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
        q5: 0,
        q6: 0,
        q7: 1, // wrong
        q8: 1, // wrong
        q9: 2, // wrong
      };

      const result = evaluateTheoreticalExam(mockQuestions, answers);
      expect(result.passed).toBe(false);
      expect(result.correctAnswersCount).toBe(7);
      expect(result.scorePercentage).toBe(70);
      expect(result.certificationStatusAz).toContain('qeyri-qənaətbəxşdir');
    });
  });

  describe('generateCableCarCertificate', () => {
    it('creates a valid official certificate with correct attributes', () => {
      const installation = MOCK_ROPEWAY_INSTALLATIONS[0];
      const cableTelemetry = evaluateCableIntegrity(28, 27.8, 0, 1, 1.0);
      const auditResult = {
        totalItems: 10,
        compliantCount: 10,
        scorePercentage: 100,
        criticalFailedCount: 0,
        overallStatus: 'passed' as const,
        fhnAuditConclusionAz: 'Tam uyğundur',
        fhnAuditConclusionEn: 'Fully compliant',
      };

      const cert = generateCableCarCertificate(installation, cableTelemetry, auditResult);
      expect(cert.certificateNumber).toMatch(/^DTA-CAB-2026-\d{5}$/);
      expect(cert.installationId).toBe(installation.id);
      expect(cert.fhnRegistryCode).toBe(installation.fhnRegistryCode);
      expect(cert.simsSignatureUid).toContain('SIMA-FHN-');
      expect(cert.sha256SecurityHash).toContain('SHA256:ROPEWAY:');
      expect(cert.qrPayload).toContain(cert.certificateNumber);
    });
  });
});
