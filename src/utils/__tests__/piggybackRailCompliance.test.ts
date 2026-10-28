import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  calculateBogieAxleLoad,
  evaluateLoadingClearance,
  calculateIntermodalSavingsAndTariff,
  evaluateFasteningChecklist,
  evaluatePiggybackExam,
  generateOfficialPiggybackCertificate,
} from '../piggybackRailCompliance';
import {
  MOCK_TERMINALS_RECORD,
  MOCK_FASTENING_CHECKLIST,
  MOCK_EXAM_QUESTIONS,
} from '../../data/mockPiggybackRailData';

describe('piggybackRailCompliance utility', () => {
  describe('currency conversion & formatting', () => {
    it('converts AZN to USD and EUR correctly', () => {
      const aznAmount = 100;
      expect(convertAzn(aznAmount, 'AZN')).toBe(100);
      expect(convertAzn(aznAmount, 'USD')).toBeCloseTo(58.82, 1);
      expect(convertAzn(aznAmount, 'EUR')).toBeCloseTo(54.35, 1);
    });

    it('formats currency values with symbols correctly', () => {
      expect(formatCurrency(250, 'AZN')).toContain('₼');
      expect(formatCurrency(250, 'USD')).toContain('$');
      expect(formatCurrency(250, 'EUR')).toContain('€');
    });
  });

  describe('calculateBogieAxleLoad', () => {
    it('calculates balanced axle load and UIC_P400_STANDARD for standard pocket wagon', () => {
      const result = calculateBogieAxleLoad({
        wagonType: 'POCKET_T3000E',
        trailerTareTonnes: 7.2,
        cargoPayloadTonnes: 24.8,
        frontBogieTonnes: 21.0,
        rearBogieTonnes: 21.5,
        kingpinLoadTonnes: 11.5,
        trackGauge: 'GAUGE_1520_MM',
      });

      expect(result.grossTrailerWeightTonnes).toBe(32.0);
      expect(result.totalCombinedWeightTonnes).toBe(66.0);
      expect(result.averageAxleLoadTonnes).toBe(11.0); // 66.0 / 6
      expect(result.isAxleLoadCompliant).toBe(true);
      expect(result.isBogieBalanced).toBe(true);
      expect(result.kingpinCompliant).toBe(true);
      expect(result.clearanceCategory).toBe('UIC_P400_STANDARD');
    });

    it('flags bogie imbalance when difference between front and rear exceeds 10%', () => {
      const result = calculateBogieAxleLoad({
        wagonType: 'POCKET_T3000E',
        trailerTareTonnes: 7.0,
        cargoPayloadTonnes: 25.0,
        frontBogieTonnes: 25.0,
        rearBogieTonnes: 18.0,
        kingpinLoadTonnes: 12.0,
        trackGauge: 'GAUGE_1520_MM',
      });

      expect(result.isBogieBalanced).toBe(false);
      expect(result.bogieImbalancePercent).toBeGreaterThan(10);
      expect(result.clearanceCategory).toBe('OVERSIZED_SPECIAL_PERMIT');
    });

    it('rejects with REJECTED_CRITICAL_OVERLOAD if total wagon payload is exceeded', () => {
      const result = calculateBogieAxleLoad({
        wagonType: 'CONTAINER_FLAT_60FT', // max payload 70.5 tonnes, 4 axles
        trailerTareTonnes: 25.0,
        cargoPayloadTonnes: 70.0,
        frontBogieTonnes: 50.0,
        rearBogieTonnes: 55.0,
        kingpinLoadTonnes: 18.0,
        trackGauge: 'GAUGE_1435_MM',
      });

      expect(result.isAxleLoadCompliant).toBe(false);
      expect(result.clearanceCategory).toBe('REJECTED_CRITICAL_OVERLOAD');
    });
  });

  describe('evaluateLoadingClearance', () => {
    it('approves compliant trailer within UIC P400 height and width envelope', () => {
      const bogieResult = calculateBogieAxleLoad({
        wagonType: 'POCKET_T3000E',
        trailerTareTonnes: 7.2,
        cargoPayloadTonnes: 24.8,
        frontBogieTonnes: 21.0,
        rearBogieTonnes: 21.5,
        kingpinLoadTonnes: 11.5,
        trackGauge: 'GAUGE_1520_MM',
      });

      const clearance = evaluateLoadingClearance({
        wagonType: 'POCKET_T3000E',
        loadedHeightFromRailMm: 3980,
        trailerWidthMm: 2550,
        isAirSuspensionDeflated: true,
        areWheelChocksLocked: true,
        lashingTensionKn: 125,
        bogieResult,
      });

      expect(clearance.isFullyApproved).toBe(true);
      expect(clearance.isHeightCompliant).toBe(true);
      expect(clearance.isWidthCompliant).toBe(true);
      expect(clearance.rejectionReasonsAz.length).toBe(0);
      expect(clearance.envelopeMarginHeightMm).toBe(220); // 4200 - 3980
    });

    it('detects violations when height exceeds limit or air suspension is not deflated', () => {
      const bogieResult = calculateBogieAxleLoad({
        wagonType: 'CONTAINER_FLAT_60FT',
        trailerTareTonnes: 8.0,
        cargoPayloadTonnes: 20.0,
        frontBogieTonnes: 18.0,
        rearBogieTonnes: 18.0,
        kingpinLoadTonnes: 10.0,
        trackGauge: 'GAUGE_1520_MM',
      });

      const clearance = evaluateLoadingClearance({
        wagonType: 'CONTAINER_FLAT_60FT',
        loadedHeightFromRailMm: 4150, // exceeds 4000mm standard flat limit
        trailerWidthMm: 2650, // exceeds 2600mm
        isAirSuspensionDeflated: false, // not deflated
        areWheelChocksLocked: false, // chocks not locked
        lashingTensionKn: 70, // below 100 kN
        bogieResult,
      });

      expect(clearance.isFullyApproved).toBe(false);
      expect(clearance.isHeightCompliant).toBe(false);
      expect(clearance.isWidthCompliant).toBe(false);
      expect(clearance.isSuspensionDeflated).toBe(false);
      expect(clearance.areChocksLocked).toBe(false);
      expect(clearance.isLashingTensionSufficient).toBe(false);
      expect(clearance.rejectionReasonsAz.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('calculateIntermodalSavingsAndTariff', () => {
    it('calculates rail tariff, fuel savings and avoided CO2 accurately', () => {
      const tariff = calculateIntermodalSavingsAndTariff({
        originTerminal: 'alat_hub',
        destinationTerminal: 'boyuk_kesik',
        wagonType: 'POCKET_T3000E',
        grossTrailerWeightTonnes: 32.0,
        isRoundTrip: false,
        terminals: MOCK_TERMINALS_RECORD,
      });

      expect(tariff.distanceKm).toBe(468);
      expect(tariff.totalRailTariffAzn).toBeGreaterThan(0);
      expect(tariff.estimatedRoadTransitCostAzn).toBeGreaterThan(tariff.totalRailTariffAzn);
      expect(tariff.netFinancialSavingsAzn).toBeGreaterThan(0);
      expect(tariff.dieselSavedLitres).toBeGreaterThan(100);
      expect(tariff.co2EmissionsAvoidedKg).toBeGreaterThan(250);
    });

    it('applies round-trip discount correctly', () => {
      const oneWay = calculateIntermodalSavingsAndTariff({
        originTerminal: 'alat_hub',
        destinationTerminal: 'ganja_keshla',
        wagonType: 'POCKET_T3000E',
        grossTrailerWeightTonnes: 30.0,
        isRoundTrip: false,
        terminals: MOCK_TERMINALS_RECORD,
      });

      const roundTrip = calculateIntermodalSavingsAndTariff({
        originTerminal: 'alat_hub',
        destinationTerminal: 'ganja_keshla',
        wagonType: 'POCKET_T3000E',
        grossTrailerWeightTonnes: 30.0,
        isRoundTrip: true,
        terminals: MOCK_TERMINALS_RECORD,
      });

      expect(roundTrip.totalRailTariffAzn).toBeCloseTo(oneWay.totalRailTariffAzn * 1.85, 1);
    });
  });

  describe('evaluateFasteningChecklist', () => {
    it('marks satisfied when all mandatory items are checked', () => {
      const checkedMap: Record<string, boolean> = {};
      MOCK_FASTENING_CHECKLIST.forEach((item) => {
        checkedMap[item.id] = true;
      });

      const res = evaluateFasteningChecklist(MOCK_FASTENING_CHECKLIST, checkedMap);
      expect(res.isAllMandatorySatisfied).toBe(true);
      expect(res.scorePercent).toBe(100);
      expect(res.totalChecked).toBe(MOCK_FASTENING_CHECKLIST.length);
    });

    it('detects missing mandatory checklist items', () => {
      const checkedMap: Record<string, boolean> = {
        chk_kingpin_lock: true,
      };

      const res = evaluateFasteningChecklist(MOCK_FASTENING_CHECKLIST, checkedMap);
      expect(res.isAllMandatorySatisfied).toBe(false);
      expect(res.scorePercent).toBeLessThan(50);
    });
  });

  describe('evaluatePiggybackExam', () => {
    it('evaluates passing score when answers are 80% or above', () => {
      const answers: Record<string, number> = {};
      MOCK_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = q.correctOptionIndex;
      });

      const res = evaluatePiggybackExam(MOCK_EXAM_QUESTIONS, answers);
      expect(res.percentage).toBe(100);
      expect(res.isPassed).toBe(true);
    });

    it('evaluates failing score when answers are below 80%', () => {
      const answers: Record<string, number> = {
        [MOCK_EXAM_QUESTIONS[0].id]: MOCK_EXAM_QUESTIONS[0].correctOptionIndex,
      };

      const res = evaluatePiggybackExam(MOCK_EXAM_QUESTIONS, answers);
      expect(res.percentage).toBeLessThan(80);
      expect(res.isPassed).toBe(false);
    });
  });

  describe('generateOfficialPiggybackCertificate', () => {
    it('generates a valid certificate with SHA-256 and SIMA UID', () => {
      const cert = generateOfficialPiggybackCertificate({
        trailerPlate: '99-TR-707',
        tractorPlate: '99-JH-404',
        vin: 'WMA06XZZ8LP092811',
        carrierNameAz: 'Caspian Intermodal Express QSC',
        cargoDescriptionAz: 'Elektronika avadanlığı',
        wagonType: 'POCKET_T3000E',
        trackGauge: 'GAUGE_1520_MM',
        originTerminalAz: 'Bakı Beynəlxalq Dəniz Ticarət Limanı',
        destinationTerminalAz: 'Böyük Kəsik Qərb Qapısı',
        distanceKm: 468,
        totalCombinedWeightTonnes: 66.0,
        maxAxleLoadTonnes: 11.0,
        loadedHeightFromRailMm: 3980,
        co2AvoidedKg: 307.7,
        dieselSavedLitres: 114.8,
      });

      expect(cert.certificateId).toMatch(/^PIGGYBACK-AZ-2026-\d{5}$/);
      expect(cert.sha256SecurityChecksum).toMatch(/^SHA256:[a-f0-9]+$/);
      expect(cert.simaDigitalUid).toContain('SIMA-ADY-');
      expect(cert.wagonId).toContain('AZ-ADY-');
      expect(cert.customsSealCode).toContain('AZ-DGK-E-SEAL-');
      expect(cert.clearanceCode).toContain('UIC-P400');
    });
  });
});
