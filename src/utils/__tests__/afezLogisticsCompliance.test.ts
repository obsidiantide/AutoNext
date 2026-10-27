import { describe, it, expect } from 'vitest';
import {
  calculateSolasVgm,
  calculateAfezLogisticsTariff,
  formatAfezCurrency,
  evaluateAfezChecklist,
  gradeAfezExam,
  generateAfezCertificate,
  CONTAINER_SPECS,
  MULTIMODAL_CORRIDORS,
  AFEZ_CONCESSIONS,
} from '../afezLogisticsCompliance';
import {
  AFEZ_CHECKLIST_ITEMS,
  AFEZ_EXAM_QUESTIONS,
  AFEZ_VEHICLE_PRESETS,
} from '../../data/mockAfezLogisticsData';

describe('afezLogisticsCompliance utility functions', () => {
  describe('calculateSolasVgm', () => {
    it('calculates verified gross mass under Method 1 (Weighbridge)', () => {
      const result = calculateSolasVgm('20FT_DRY', 20000, 'METHOD_1_WEIGHBRIDGE', 250);
      const expectedTheoretical = CONTAINER_SPECS['20FT_DRY'].tareWeightKg + 20000 + 250;
      expect(result.verifiedGrossMassKg).toBe(expectedTheoretical);
      expect(result.isOverloaded).toBe(false);
      expect(result.isToleranceCompliant).toBe(true);
      expect(result.vgmCertificateUid).toContain('VGM-AFEZ-22G1');
    });

    it('detects overloaded container when gross mass exceeds maximum rating', () => {
      // 20ft max gross mass is 30,480 kg
      const result = calculateSolasVgm('20FT_DRY', 29000, 'METHOD_1_WEIGHBRIDGE', 1000);
      expect(result.isOverloaded).toBe(true);
      expect(result.overloadExcessKg).toBeGreaterThan(0);
      expect(result.statusAz).toContain('HƏDDƏN ARTIQ');
      expect(result.statusEn).toContain('OVERLOADED');
    });

    it('detects tolerance violation when scale measured mass diverges significantly', () => {
      const theoretical = CONTAINER_SPECS['40FT_HC'].tareWeightKg + 20000 + 250;
      // Divergence of 3000 kg exceeds 500 kg maximum allowed tolerance
      const result = calculateSolasVgm('40FT_HC', 20000, 'METHOD_1_WEIGHBRIDGE', 250, theoretical + 3000);
      expect(result.isToleranceCompliant).toBe(false);
      expect(result.toleranceDiscrepancyKg).toBe(3000);
      expect(result.statusAz).toContain('DƏQİQLİK XƏTASI');
    });

    it('calculates Method 2 correctly without weighbridge discrepancy', () => {
      const result = calculateSolasVgm('40FT_REEFER', 18000, 'METHOD_2_CALCULATED', 500);
      expect(result.method).toBe('METHOD_2_CALCULATED');
      expect(result.toleranceDiscrepancyKg).toBe(0);
      expect(result.isToleranceCompliant).toBe(true);
      expect(result.isOverloaded).toBe(false);
    });
  });

  describe('calculateAfezLogisticsTariff', () => {
    it('calculates operational tariffs and free dwell time correctly', () => {
      const result = calculateAfezLogisticsTariff({
        containerType: '40FT_HC',
        corridor: 'TRANS_CASPIAN_SEA',
        dwellDays: 18,
        cargoValueAzn: 100000,
        requestReeferPower: false,
        requestSolasVgm: true,
      });

      expect(result.freeDwellDays).toBe(14);
      expect(result.billableDwellDays).toBe(4); // 18 - 14
      expect(result.storageDemurrageCostAzn).toBe(4 * CONTAINER_SPECS['40FT_HC'].dailyDemurrageRateAzn);
      expect(result.solasVgmCostAzn).toBe(AFEZ_CONCESSIONS.solasVgmWeighbridgeFeeAzn);
      expect(result.rfidBarrierSecurityFeeAzn).toBe(AFEZ_CONCESSIONS.rfidSecuritySealBarrierFeeAzn);
      expect(result.totalAfezOperationalCostAzn).toBeGreaterThan(0);
    });

    it('calculates 0% AFEZ fiscal savings compared to standard domestic tariffs', () => {
      const cargoValue = 100000;
      const result = calculateAfezLogisticsTariff({
        containerType: '20FT_DRY',
        corridor: 'BTK_RAIL_BLOCK',
        dwellDays: 7,
        cargoValueAzn: cargoValue,
      });

      // Standard customs duty: 15% of 100k = 15k AZN
      expect(result.standardCustomsDutySavedAzn).toBe(15000);
      // Standard VAT: 18% of (100k + 15k) = 20,700 AZN
      expect(result.standardVatSavedAzn).toBe(20700);
      // Total savings: 35,700 AZN
      expect(result.totalFiscalSavingsAzn).toBe(35700);
    });

    it('supports multi-currency conversion for USD and EUR', () => {
      const resultAzn = calculateAfezLogisticsTariff({
        containerType: '45FT_HC_PW',
        corridor: 'NORTH_SOUTH_ROAD',
        dwellDays: 10,
        cargoValueAzn: 50000,
        currency: 'AZN',
      });

      const resultUsd = calculateAfezLogisticsTariff({
        containerType: '45FT_HC_PW',
        corridor: 'NORTH_SOUTH_ROAD',
        dwellDays: 10,
        cargoValueAzn: 50000,
        currency: 'USD',
      });

      expect(resultUsd.convertedTotalOperationalCost).toBeCloseTo(resultAzn.totalAfezOperationalCostAzn * 0.5882, 1);
    });

    it('adds reefer shore power costs when requested for reefer containers', () => {
      const result = calculateAfezLogisticsTariff({
        containerType: '40FT_REEFER',
        corridor: 'TRANS_CASPIAN_SEA',
        dwellDays: 5,
        cargoValueAzn: 80000,
        requestReeferPower: true,
      });

      expect(result.reeferShorePowerCostAzn).toBe(5 * AFEZ_CONCESSIONS.reeferShorePowerDailyFeeAzn);
    });
  });

  describe('formatAfezCurrency', () => {
    it('formats AZN, USD, and EUR amounts with proper symbols', () => {
      expect(formatAfezCurrency(1250, 'AZN')).toContain('₼');
      expect(formatAfezCurrency(1250, 'USD')).toContain('$');
      expect(formatAfezCurrency(1250, 'EUR')).toContain('€');
    });
  });

  describe('evaluateAfezChecklist', () => {
    it('approves clearance when all checklist items pass', () => {
      const allIds = AFEZ_CHECKLIST_ITEMS.map((item) => item.id);
      const result = evaluateAfezChecklist(AFEZ_CHECKLIST_ITEMS, allIds);

      expect(result.scorePercentage).toBe(100);
      expect(result.isEligibleForClearance).toBe(true);
      expect(result.failedItemsCount).toBe(0);
      expect(result.verdictAz).toContain('TAM İCAZƏ VERİLDİ');
    });

    it('rejects clearance when multiple critical items fail', () => {
      const result = evaluateAfezChecklist(AFEZ_CHECKLIST_ITEMS, []);

      expect(result.scorePercentage).toBe(0);
      expect(result.isEligibleForClearance).toBe(false);
      expect(result.verdictAz).toContain('TƏLƏBLƏR ÖDƏNİLMƏDİ');
    });
  });

  describe('gradeAfezExam', () => {
    it('evaluates passing score when answers are correct', () => {
      const answers: Record<string, number> = {};
      AFEZ_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = q.correctAnswerIndex;
      });

      const result = gradeAfezExam(AFEZ_EXAM_QUESTIONS, answers);
      expect(result.passed).toBe(true);
      expect(result.scorePercentage).toBe(100);
      expect(result.correctAnswers).toBe(AFEZ_EXAM_QUESTIONS.length);
      expect(result.feedbackAz).toContain('MÜVƏFFƏQİYYƏTLƏ KEÇDİNİZ');
    });

    it('evaluates failed score when answers are wrong', () => {
      const answers: Record<string, number> = {};
      AFEZ_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = (q.correctAnswerIndex + 1) % 4;
      });

      const result = gradeAfezExam(AFEZ_EXAM_QUESTIONS, answers);
      expect(result.passed).toBe(false);
      expect(result.scorePercentage).toBe(0);
      expect(result.feedbackAz).toContain('KƏSİLDİNİZ');
    });
  });

  describe('generateAfezCertificate', () => {
    it('generates an authentic AFEZ-TIR-2026 certificate with valid hashes and properties', () => {
      const preset = AFEZ_VEHICLE_PRESETS[0];
      const cert = generateAfezCertificate({
        containerNumber: preset.containerNumber,
        containerType: preset.containerType,
        carrierTruckPlate: preset.truckPlate,
        driverFullName: preset.driverName,
        driverPassportFin: preset.driverFin,
        originCountry: preset.originCountry,
        destinationPort: preset.destinationPort,
        corridor: preset.corridor,
        cargoNetWeightKg: preset.cargoNetWeightKg,
        cargoDeclaredValueAzn: preset.cargoDeclaredValueAzn,
        assignedYardBay: preset.assignedBay,
      });

      expect(cert.certificateUid).toMatch(/^AFEZ-TIR-2026-\d{5}$/);
      expect(cert.containerNumber).toBe(preset.containerNumber);
      expect(cert.carrierTruckPlate).toBe(preset.truckPlate);
      expect(cert.simaDigitalUid).toContain('SIMA-AFEZ-');
      expect(cert.sha256VerificationHash).toBeDefined();
      expect(cert.status).toBe('ACTIVE_APPROVED');
      expect(cert.totalFiscalSavingsAzn).toBeGreaterThan(0);
      expect(cert.verifiedGrossMassKg).toBeGreaterThan(preset.cargoNetWeightKg);
    });
  });
});
