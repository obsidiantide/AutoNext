import { describe, it, expect } from 'vitest';
import {
  calculateMetroIntermodalSavings,
  calculateMetroPnrCost,
  evaluateMetroChecklist,
  evaluateMetroExam,
  formatMetroPlate,
  generateMetroIntermodalPass,
  formatMetroCurrency,
  METRO_BASE_TICKET_FARE_AZN,
} from '../metroIntermodalCompliance';
import {
  MOCK_METRO_HUBS,
  MOCK_METRO_CHECKLIST,
  MOCK_METRO_EXAM_QUESTIONS,
} from '../../data/mockMetroData';

describe('metroIntermodalCompliance Utility Suite', () => {
  describe('calculateMetroIntermodalSavings', () => {
    it('calculates daily and annual savings correctly for standard commuter', () => {
      const res = calculateMetroIntermodalSavings({
        commuteDistanceKm: 30,
        vehicleConsumptionL100km: 8.0,
        fuelPricePerLiterAzn: 1.10,
        downtownParkingCostAzn: 8.00,
        pnrParkingDailyFeeAzn: 2.00,
        cityTrafficDelayMinutes: 45,
      });

      expect(res.dailyFuelSavedLiters).toBeGreaterThan(0);
      expect(res.dailyFuelCostSavedAzn).toBeGreaterThan(0);
      expect(res.dailyNetSavingsAzn).toBeGreaterThan(0);
      expect(res.dailyTimeSavedMinutes).toBeGreaterThan(0);
      expect(res.dailyCo2SavedKg).toBeGreaterThan(0);
      expect(res.annualNetSavingsAzn).toBeGreaterThan(0);
      expect(res.annualTimeSavedHours).toBeGreaterThan(0);
      expect(res.annualCo2SavedKg).toBeGreaterThan(0);
    });

    it('handles zero fuel consumption or extreme inputs gracefully', () => {
      const res = calculateMetroIntermodalSavings({
        commuteDistanceKm: 0,
        vehicleConsumptionL100km: 0,
        fuelPricePerLiterAzn: 1.10,
        downtownParkingCostAzn: 0,
        pnrParkingDailyFeeAzn: 0,
        cityTrafficDelayMinutes: 0,
      });

      expect(res.dailyFuelSavedLiters).toBe(0);
      expect(res.dailyFuelCostSavedAzn).toBe(0);
      expect(res.dailyTimeSavedMinutes).toBe(10); // minimum floor
    });
  });

  describe('calculateMetroPnrCost', () => {
    const hub = MOCK_METRO_HUBS[0]; // Koroğlu HUB (hourly: 0.60, daily: 3.50, monthly: 45.00)

    it('calculates workday commute rate with BakıKart discount', () => {
      const res = calculateMetroPnrCost({
        hub,
        duration: 'commute_workday',
        vehicleType: 'sedan_compact',
        bakiKartStatus: 'validated_discount_active',
        currency: 'AZN',
      });

      // base: 0.60 * 8 = 4.80
      expect(res.baseParkingFee).toBe(4.80);
      expect(res.effectiveDiscountPercent).toBe(60);
      // discount = 4.80 * 0.60 = 2.88
      expect(res.concessionDiscount).toBe(2.88);
      // parking = 4.80 - 2.88 = 1.92, metro = 1.00, total = 2.92
      expect(res.totalCost).toBe(2.92);
      expect(res.convertedCost).toBe(2.92);
    });

    it('gives EV vehicles 25% discount', () => {
      const res = calculateMetroPnrCost({
        hub,
        duration: 'commute_workday',
        vehicleType: 'electric_ev',
        bakiKartStatus: 'not_validated_standard_rate',
        currency: 'AZN',
      });

      // base for EV: (0.60 * 8) * 0.75 = 3.60
      expect(res.baseParkingFee).toBe(3.60);
      expect(res.concessionDiscount).toBe(0);
    });

    it('converts to USD and EUR currencies accurately', () => {
      const resUsd = calculateMetroPnrCost({
        hub,
        duration: 'daily_24h',
        vehicleType: 'sedan_compact',
        bakiKartStatus: 'validated_discount_active',
        currency: 'USD',
      });

      expect(resUsd.convertedCost).toBeGreaterThan(0);
      expect(resUsd.convertedCost).not.toBe(resUsd.totalCost);
    });
  });

  describe('evaluateMetroChecklist', () => {
    it('passes when all checklist items are checked and vehicle has no LPG/CNG', () => {
      const checkedMap: Record<string, boolean> = {};
      MOCK_METRO_CHECKLIST.forEach((item) => {
        checkedMap[item.id] = true;
      });

      const audit = evaluateMetroChecklist(MOCK_METRO_CHECKLIST, checkedMap, false);
      expect(audit.passed).toBe(true);
      expect(audit.percentage).toBe(100);
      expect(audit.mandatoryFail).toBe(false);
      expect(audit.violations.length).toBe(0);
    });

    it('fails immediately when vehicle has LPG/CNG in underground parking', () => {
      const checkedMap: Record<string, boolean> = {};
      MOCK_METRO_CHECKLIST.forEach((item) => {
        checkedMap[item.id] = true;
      });

      const audit = evaluateMetroChecklist(MOCK_METRO_CHECKLIST, checkedMap, true);
      expect(audit.passed).toBe(false);
      expect(audit.mandatoryFail).toBe(true);
      expect(audit.violations.some((v) => v.includes('QAZBALON'))).toBe(true);
    });

    it('fails when mandatory items are unchecked', () => {
      const checkedMap: Record<string, boolean> = {
        subterranean_lpg_prohibition: true,
      };

      const audit = evaluateMetroChecklist(MOCK_METRO_CHECKLIST, checkedMap, false);
      expect(audit.passed).toBe(false);
      expect(audit.mandatoryFail).toBe(true);
      expect(audit.violations.length).toBeGreaterThan(0);
    });
  });

  describe('evaluateMetroExam', () => {
    it('passes with perfect score when all correct answers provided', () => {
      const answers: Record<string, number> = {};
      MOCK_METRO_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = q.correctIndex;
      });

      const res = evaluateMetroExam(MOCK_METRO_EXAM_QUESTIONS, answers);
      expect(res.correctCount).toBe(10);
      expect(res.scorePercentage).toBe(100);
      expect(res.isPassed).toBe(true);
      expect(res.detailedResults.every((d) => d.isCorrect)).toBe(true);
    });

    it('fails when score is below 80%', () => {
      const answers: Record<string, number> = {};
      MOCK_METRO_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = (q.correctIndex + 1) % 4; // all incorrect
      });

      const res = evaluateMetroExam(MOCK_METRO_EXAM_QUESTIONS, answers);
      expect(res.correctCount).toBe(0);
      expect(res.scorePercentage).toBe(0);
      expect(res.isPassed).toBe(false);
    });
  });

  describe('formatMetroPlate', () => {
    it('formats raw string into standard Azerbaijani plate format', () => {
      expect(formatMetroPlate('10bm100')).toBe('10-BM-100');
      expect(formatMetroPlate('99pr202')).toBe('99-PR-202');
      expect(formatMetroPlate('')).toBe('10-BM-100');
    });
  });

  describe('generateMetroIntermodalPass', () => {
    it('creates a complete official pass with all required telemetry fields', () => {
      const hub = MOCK_METRO_HUBS[0];
      const pass = generateMetroIntermodalPass({
        hub,
        vehiclePlate: '10-BM-100',
        vehicleModel: 'Hyundai Elantra',
        vehicleType: 'sedan_compact',
        pnrDuration: 'commute_workday',
        bakiKartSerial: '99401294829104',
        isLpgOrCng: false,
        currency: 'AZN',
      });

      expect(pass.passNumber).toMatch(/^BAKI-METRO-2026-\d{5}$/);
      expect(pass.hubName).toBe(hub.name);
      expect(pass.vehiclePlate).toBe('10-BM-100');
      expect(pass.isLpgCngCompliant).toBe(true);
      expect(pass.turnstileGatePin).toBeDefined();
      expect(pass.simaSignatureUid).toContain('SIMA-AZ-');
      expect(pass.securityChecksum).toContain('SHA256:');
      expect(pass.qrCodeData).toContain('https://metro.gov.az/pnr/verify');
    });
  });

  describe('formatMetroCurrency', () => {
    it('formats AZN, USD, EUR symbols properly', () => {
      expect(formatMetroCurrency(2.5, 'AZN')).toBe('2.50 ₼');
      expect(formatMetroCurrency(2.5, 'USD')).toBe('2.50 $');
      expect(formatMetroCurrency(2.5, 'EUR')).toBe('2.50 €');
    });
  });
});
