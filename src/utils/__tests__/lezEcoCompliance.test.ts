import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  calculateEcoScore,
  calculateLezPermitCost,
  evaluateEcoChecklist,
  evaluateEcoAuditExam,
  generateOfficialLezCertificate,
  EmissionTelemetry,
} from '../lezEcoCompliance';
import {
  MOCK_ECO_CHECKLIST,
  MOCK_ECO_EXAM_QUESTIONS,
  MOCK_VEHICLE_PRESETS,
} from '../../data/mockLezEcoData';

describe('lezEcoCompliance utility', () => {
  describe('currency conversion & formatting', () => {
    it('converts AZN correctly to USD and EUR', () => {
      const aznAmount = 100;
      expect(convertAzn(aznAmount, 'AZN')).toBe(100);
      expect(convertAzn(aznAmount, 'USD')).toBeCloseTo(58.82, 1);
      expect(convertAzn(aznAmount, 'EUR')).toBeCloseTo(54.35, 1);
    });

    it('formats currency strings correctly with symbols', () => {
      expect(formatCurrency(15, 'AZN')).toContain('₼');
      expect(formatCurrency(15, 'USD')).toContain('$');
      expect(formatCurrency(15, 'EUR')).toContain('€');
    });
  });

  describe('calculateEcoScore', () => {
    it('awards Platinum tier and 100% eligibility to pure EV (Zero Emission)', () => {
      const evTelemetry: EmissionTelemetry = {
        euroClass: 'ZERO_EMISSION',
        propulsion: 'ELECTRIC',
        co2GramsPerKm: 0,
        noxMgPerKm: 0,
        pmMgPerKm: 0,
        dpfBackpressureMbar: 0,
        adBlueLevelPercent: 100,
        batterySohPercent: 98,
        tailpipeSmokeOpacityK: 0.0,
        noiseLevelDb: 62,
        obdMilStatus: 'CLEAR',
      };

      const result = calculateEcoScore(evTelemetry);
      expect(result.totalScore).toBeGreaterThanOrEqual(90);
      expect(result.tier).toBe('PLATINUM');
      expect(result.isEligibleForLez).toBe(true);
      expect(result.warningsAz.length).toBe(0);
      expect(result.recommendationsAz[0]).toContain('24/7');
    });

    it('awards Gold or Platinum tier to Euro 6d hybrid vehicle', () => {
      const hybridTelemetry: EmissionTelemetry = {
        euroClass: 'EURO_6D',
        propulsion: 'HYBRID',
        co2GramsPerKm: 85,
        noxMgPerKm: 28,
        pmMgPerKm: 1.0,
        dpfBackpressureMbar: 0,
        adBlueLevelPercent: 100,
        batterySohPercent: 92,
        tailpipeSmokeOpacityK: 0.04,
        noiseLevelDb: 68,
        obdMilStatus: 'CLEAR',
      };

      const result = calculateEcoScore(hybridTelemetry);
      expect(result.totalScore).toBeGreaterThanOrEqual(75);
      expect(['PLATINUM', 'GOLD']).toContain(result.tier);
      expect(result.isEligibleForLez).toBe(true);
    });

    it('handles diesel warnings for clogged DPF and low AdBlue', () => {
      const problematicDiesel: EmissionTelemetry = {
        euroClass: 'EURO_5',
        propulsion: 'DIESEL',
        co2GramsPerKm: 185,
        noxMgPerKm: 140,
        pmMgPerKm: 6.2,
        dpfBackpressureMbar: 72, // Clogged DPF
        adBlueLevelPercent: 0,   // Empty AdBlue
        tailpipeSmokeOpacityK: 0.65,
        noiseLevelDb: 77,
        obdMilStatus: 'FAULT',
      };

      const result = calculateEcoScore(problematicDiesel);
      expect(result.warningsAz.some((w) => w.includes('DPF filtri kritik'))).toBe(true);
      expect(result.warningsAz.some((w) => w.includes('AdBlue / DEF çəni tam boşdur'))).toBe(true);
      expect(result.warningsAz.some((w) => w.includes('Check Engine'))).toBe(true);
      expect(result.isEligibleForLez).toBe(false);
      expect(result.tier).toBe('NON_COMPLIANT');
    });

    it('rejects Euro 2 and below vehicles as non-compliant with legal warnings', () => {
      const euro2Telemetry: EmissionTelemetry = {
        euroClass: 'EURO_2_BELOW',
        propulsion: 'PETROL',
        co2GramsPerKm: 280,
        noxMgPerKm: 390,
        pmMgPerKm: 18.0,
        dpfBackpressureMbar: 0,
        adBlueLevelPercent: 0,
        tailpipeSmokeOpacityK: 1.2,
        noiseLevelDb: 80,
        obdMilStatus: 'FAULT',
      };

      const result = calculateEcoScore(euro2Telemetry);
      expect(result.tier).toBe('NON_COMPLIANT');
      expect(result.isEligibleForLez).toBe(false);
      expect(result.warningsAz.some((w) => w.includes('İXM Maddə 231'))).toBe(true);
    });
  });

  describe('calculateLezPermitCost', () => {
    it('gives 100% discount (0 AZN toll) to Zero Emission vehicles', () => {
      const cost = calculateLezPermitCost({
        zoneBaseRateAzn: 15,
        euroClass: 'ZERO_EMISSION',
        durationDays: 1,
        isRushHour: false,
        includeTreeOffset: false,
        currency: 'AZN',
      });

      expect(cost.subtotalAzn).toBe(0);
      expect(cost.rushHourSurchargeAzn).toBe(0);
      expect(cost.totalAzn).toBe(0);
      expect(cost.isAccessPermitted).toBe(true);
    });

    it('calculates Euro 6 50% discount and adds rush-hour and tree planting fees', () => {
      const cost = calculateLezPermitCost({
        zoneBaseRateAzn: 20,
        euroClass: 'EURO_6',
        durationDays: 2,
        isRushHour: true,
        includeTreeOffset: true,
        currency: 'AZN',
      });

      // Base: 20 * 0.5 * 2 days = 20 AZN subtotal
      // Rush hour surcharge: 20 * 0.5 = 10 AZN
      // Tree offset: 5 AZN * 2 days = 10 AZN
      // Total: 20 + 10 + 10 = 40 AZN
      expect(cost.subtotalAzn).toBe(20);
      expect(cost.rushHourSurchargeAzn).toBe(10);
      expect(cost.carbonOffsetAzn).toBe(10);
      expect(cost.totalAzn).toBe(40);
    });

    it('disallows Euro 3 vehicles and includes statutory fine citation', () => {
      const cost = calculateLezPermitCost({
        zoneBaseRateAzn: 15,
        euroClass: 'EURO_3',
        durationDays: 1,
        isRushHour: false,
        includeTreeOffset: false,
        currency: 'AZN',
      });

      expect(cost.isAccessPermitted).toBe(false);
      expect(cost.restrictionReasonAz).toContain('Avro-3');
      expect(cost.statutoryFineNoticeAz).toContain('İXM Maddə 342.2.2');
    });

    it('warns about Euro 4 vehicles during peak rush hour', () => {
      const cost = calculateLezPermitCost({
        zoneBaseRateAzn: 10,
        euroClass: 'EURO_4',
        durationDays: 1,
        isRushHour: true,
        includeTreeOffset: false,
        currency: 'AZN',
      });

      expect(cost.restrictionReasonAz).toContain('pik saatlarda');
    });
  });

  describe('evaluateEcoChecklist', () => {
    it('scores 100% when all 10 checklist items are checked', () => {
      const checked: Record<string, boolean> = {};
      MOCK_ECO_CHECKLIST.forEach((item) => {
        checked[item.id] = true;
      });

      const result = evaluateEcoChecklist(MOCK_ECO_CHECKLIST, checked);
      expect(result.passedCount).toBe(10);
      expect(result.scorePercentage).toBe(100);
      expect(result.isAllCriticalPassed).toBe(true);
    });

    it('detects when a critical checklist item is missing', () => {
      const checked: Record<string, boolean> = {
        CHK_DPF_INTEGRITY: true,
        // CHK_SCR_ADBLUE (critical) missing
        CHK_EXHAUST_SMOKE_K: true,
      };

      const result = evaluateEcoChecklist(MOCK_ECO_CHECKLIST, checked);
      expect(result.passedCount).toBe(2);
      expect(result.isAllCriticalPassed).toBe(false);
    });
  });

  describe('evaluateEcoAuditExam', () => {
    it('grades exam accurately and passes when score is >= 80%', () => {
      const answers: Record<string, number> = {};
      MOCK_ECO_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = q.correctOptionIndex;
      });

      const result = evaluateEcoAuditExam(MOCK_ECO_EXAM_QUESTIONS, answers);
      expect(result.correctCount).toBe(10);
      expect(result.percentage).toBe(100);
      expect(result.isPassed).toBe(true);
    });

    it('fails exam when score is below 80%', () => {
      const answers: Record<string, number> = {
        EXAM_LEZ_01: 0, // wrong
        EXAM_LEZ_02: 0, // wrong
        EXAM_LEZ_03: 0, // wrong
      };

      const result = evaluateEcoAuditExam(MOCK_ECO_EXAM_QUESTIONS, answers);
      expect(result.percentage).toBeLessThan(80);
      expect(result.isPassed).toBe(false);
    });
  });

  describe('generateOfficialLezCertificate', () => {
    it('creates an official certificate with cryptographic signatures and QR verification', () => {
      const cert = generateOfficialLezCertificate({
        vehiclePlate: '99-EV-001',
        vin: 'LGXCE1234AZ900001',
        carrierOrOwner: 'Green Baku Fleet MMC',
        propulsion: 'ELECTRIC',
        euroClass: 'ZERO_EMISSION',
        ecoScore: 100,
        zoneId: 'ULEZ_ICERISHEHER',
        zoneNameAz: 'İçərişəhər Dövlət Tarix-Memarlıq Qoruğu (ULEZ)',
        permitType: 'PERMANENT_GREEN',
        treesFunded: 4,
      });

      expect(cert.certificateId).toMatch(/^ECO-ZONE-AZ-2026-\d{5}$/);
      expect(cert.sha256SecurityChecksum).toContain('SHA256:');
      expect(cert.simaDigitalUid).toContain('SIMA-ETSN-');
      expect(cert.permittedHours).toContain('24/7 Limitsiz');
      expect(cert.carbonOffsetTreesFunded).toBe(4);
      expect(cert.qrVerificationUrl).toContain('eco.ayna.gov.az');
    });
  });
});
