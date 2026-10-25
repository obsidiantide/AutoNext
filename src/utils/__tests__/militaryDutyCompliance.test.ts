import { describe, it, expect } from 'vitest';
import {
  formatBlackMilitaryPlate,
  parseBlackMilitaryPlate,
  calculateMilitaryReadinessScore,
  calculateMobilizationCompensation,
  calculateConvoyParameters,
  gradeMilitaryExam,
  generateMilitaryCertificate,
  MILITARY_DAILY_TARIFFS,
  STATUTORY_FUEL_PRICES,
} from '../militaryDutyCompliance';
import {
  MOCK_MILITARY_READINESS_ITEMS,
  MOCK_MILITARY_EXAM_QUESTIONS,
} from '../../data/mockMilitaryDutyData';

describe('militaryDutyCompliance Utils', () => {
  describe('formatBlackMilitaryPlate and parseBlackMilitaryPlate', () => {
    it('formats a raw plate string into standard 3-part military plate', () => {
      expect(formatBlackMilitaryPlate('014MN02')).toBe('014 MN 02');
      expect(formatBlackMilitaryPlate('007DQ01')).toBe('007 DQ 01');
      expect(formatBlackMilitaryPlate('003DSX05')).toBe('003 DSX 05');
      expect(formatBlackMilitaryPlate('')).toBe('001 MN 01');
    });

    it('correctly parses valid black military plates', () => {
      const parsedMN = parseBlackMilitaryPlate('014 MN 02');
      expect(parsedMN.isValid).toBe(true);
      expect(parsedMN.branch).toBe('MN');
      expect(parsedMN.prefix).toBe('014');
      expect(parsedMN.region).toBe('02');

      const parsedDQ = parseBlackMilitaryPlate('007 DQ 01');
      expect(parsedDQ.isValid).toBe(true);
      expect(parsedDQ.branch).toBe('DQ');

      const parsedDSX = parseBlackMilitaryPlate('003 DSX 05');
      expect(parsedDSX.isValid).toBe(true);
      expect(parsedDSX.branch).toBe('DSX');
    });

    it('identifies unknown branch codes and handles invalid inputs gracefully', () => {
      const parsedUnknown = parseBlackMilitaryPlate('999 XYZ 99');
      expect(parsedUnknown.branch).toBe('UNKNOWN');
      expect(parsedUnknown.isValid).toBe(false);
    });
  });

  describe('calculateMilitaryReadinessScore', () => {
    it('returns 100% and category_1_ready when all items are checked', () => {
      const allIds = MOCK_MILITARY_READINESS_ITEMS.map((item) => item.id);
      const res = calculateMilitaryReadinessScore(allIds, MOCK_MILITARY_READINESS_ITEMS);

      expect(res.percentage).toBe(100);
      expect(res.grade).toBe('category_1_ready');
      expect(res.eligibleForMobilization).toBe(true);
      expect(res.statusLabel).toContain('1-ci Dərəcə: Tam Yararlı');
    });

    it('returns category_2_minor when score is between 50% and 79%', () => {
      // Pick first 5 items (around 55 points)
      const subsetIds = MOCK_MILITARY_READINESS_ITEMS.slice(0, 5).map((item) => item.id);
      const res = calculateMilitaryReadinessScore(subsetIds, MOCK_MILITARY_READINESS_ITEMS);

      expect(res.percentage).toBeGreaterThanOrEqual(50);
      expect(res.percentage).toBeLessThan(80);
      expect(res.grade).toBe('category_2_minor');
      expect(res.eligibleForMobilization).toBe(true);
      expect(res.statusLabel).toContain('2-ci Dərəcə: Məhdud Yararlı');
    });

    it('returns category_3_unfit when score is below 50%', () => {
      const oneItem = [MOCK_MILITARY_READINESS_ITEMS[0].id]; // 15 points
      const res = calculateMilitaryReadinessScore(oneItem, MOCK_MILITARY_READINESS_ITEMS);

      expect(res.percentage).toBeLessThan(50);
      expect(res.grade).toBe('category_3_unfit');
      expect(res.eligibleForMobilization).toBe(false);
      expect(res.statusLabel).toContain('3-cü Dərəcə: Qeyri-kafi');
    });
  });

  describe('calculateMobilizationCompensation', () => {
    it('calculates statutory daily rate and duration correctly for full_suv', () => {
      const comp = calculateMobilizationCompensation({
        category: 'full_suv',
        durationDays: 5,
        estimatedKmPerDay: 100,
        fuelType: 'diesel',
        consumptionPer100Km: 10.0,
      });

      expect(comp.dailyRateAZN).toBe(MILITARY_DAILY_TARIFFS.full_suv); // 60 AZN
      expect(comp.totalRentalAZN).toBe(300.0); // 5 * 60
      expect(comp.estimatedKm).toBe(500); // 5 * 100
      expect(comp.estimatedFuelLiters).toBe(50.0); // 500 / 100 * 10
      expect(comp.fuelRateAZN).toBe(STATUTORY_FUEL_PRICES.diesel); // 1.00
      expect(comp.fuelCostAZN).toBe(50.0); // 50 * 1.00
      expect(comp.totalCompensationAZN).toBe(350.0); // 300 + 50
      expect(comp.totalCompensationUSD).toBeCloseTo(350.0 / 1.70, 1);
    });

    it('handles heavy_truck_6x6 with petrol and default values', () => {
      const comp = calculateMobilizationCompensation({
        category: 'heavy_truck_6x6',
        durationDays: 1,
        estimatedKmPerDay: 200,
        fuelType: 'petrol',
        consumptionPer100Km: 20.0,
      });

      expect(comp.dailyRateAZN).toBe(90.0);
      expect(comp.totalRentalAZN).toBe(90.0);
      expect(comp.estimatedFuelLiters).toBe(40.0);
      expect(comp.fuelRateAZN).toBe(1.10);
      expect(comp.fuelCostAZN).toBe(44.0);
      expect(comp.totalCompensationAZN).toBe(134.0);
    });
  });

  describe('calculateConvoyParameters', () => {
    it('calculates convoy distance and reaction safety for normal weather', () => {
      const normal = calculateConvoyParameters(60, false);
      expect(normal.recommendedDistanceMeters).toBe(90); // 60 * 1.5
      expect(normal.reactionTimeSeconds).toBe(1.2);
      expect(normal.escortMode).toContain('Təcili Operativ Müşayiət');
    });

    it('applies weather penalty for adverse conditions', () => {
      const adverse = calculateConvoyParameters(40, true);
      expect(adverse.recommendedDistanceMeters).toBe(80); // 40 * 2.0
      expect(adverse.reactionTimeSeconds).toBe(2.0);
      expect(adverse.escortMode).toContain('Təcili Operativ Müşayiət');
    });
  });

  describe('gradeMilitaryExam', () => {
    it('grades exam as passed when at least 80% correct', () => {
      const userAnswers: Record<number, number> = {};
      MOCK_MILITARY_EXAM_QUESTIONS.forEach((q) => {
        userAnswers[q.id] = q.correctAnswerIndex;
      });

      const res = gradeMilitaryExam(userAnswers, MOCK_MILITARY_EXAM_QUESTIONS);
      expect(res.score).toBe(10);
      expect(res.total).toBe(10);
      expect(res.percentage).toBe(100);
      expect(res.passed).toBe(true);
    });

    it('grades exam as failed when under 80%', () => {
      const userAnswers: Record<number, number> = {};
      MOCK_MILITARY_EXAM_QUESTIONS.forEach((q, idx) => {
        // Answer correctly for only 5 questions
        userAnswers[q.id] = idx < 5 ? q.correctAnswerIndex : 999;
      });

      const res = gradeMilitaryExam(userAnswers, MOCK_MILITARY_EXAM_QUESTIONS);
      expect(res.score).toBe(5);
      expect(res.passed).toBe(false);
      expect(res.percentage).toBe(50);
    });
  });

  describe('generateMilitaryCertificate', () => {
    it('generates certificate with unique certificate number, sha256 hash and qr link', () => {
      const cert = generateMilitaryCertificate({
        civilianPlate: '99-MN-050',
        militaryPlate: '014 MN 02',
        branch: 'MN',
      });

      expect(cert.certificateNumber).toMatch(/^SHXCDX-HNV-2026-\d{5}$/);
      expect(cert.civilianPlate).toBe('99-MN-050');
      expect(cert.militaryPlate).toBe('014 MN 02');
      expect(cert.branch).toBe('MN');
      expect(cert.simaSignatureUid).toContain('SIMA-AZ-HNV-');
      expect(cert.qrVerificationUrl).toContain('https://shxcdx.gov.az/verify/hnv/');
    });
  });
});
