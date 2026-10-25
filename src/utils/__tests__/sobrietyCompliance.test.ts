import { describe, it, expect } from 'vitest';
import {
  evaluateAlcoholIntoxication,
  calculateClinicalImpairment,
  calculateSobrietySanctions,
  generateSobrietyProtocolNumber,
  formatPlate,
  formatPromille,
  formatCurrency,
  STATUTORY_BAC_LIMIT_PROMILLE
} from '../sobrietyCompliance';

describe('sobrietyCompliance utility functions', () => {
  describe('evaluateAlcoholIntoxication', () => {
    it('evaluates zero BrAC as sober', () => {
      const result = evaluateAlcoholIntoxication(0.00);
      expect(result.bacPromille).toBe(0.00);
      expect(result.status).toBe('sober');
      expect(result.isViolation).toBe(false);
      expect(result.hoursToSober).toBe(0);
      expect(result.severityText.az).toContain('Ayıq');
    });

    it('evaluates BrAC below legal threshold (0.14 mg/L -> 0.28 ‰) as sober', () => {
      const result = evaluateAlcoholIntoxication(0.14);
      expect(result.bacPromille).toBe(0.28);
      expect(result.status).toBe('sober');
      expect(result.isViolation).toBe(false);
      expect(result.hoursToSober).toBeGreaterThan(0);
    });

    it('evaluates BrAC at exact legal threshold (0.15 mg/L -> 0.30 ‰) as mild intoxication violation', () => {
      const result = evaluateAlcoholIntoxication(0.15);
      expect(result.bacPromille).toBe(0.30);
      expect(result.status).toBe('mild');
      expect(result.isViolation).toBe(true);
      expect(result.hoursToSober).toBe(2.0); // 0.30 / 0.15 = 2.0
    });

    it('evaluates BrAC for moderate intoxication (0.50 mg/L -> 1.00 ‰)', () => {
      const result = evaluateAlcoholIntoxication(0.50);
      expect(result.bacPromille).toBe(1.00);
      expect(result.status).toBe('moderate');
      expect(result.isViolation).toBe(true);
      expect(result.hoursToSober).toBeCloseTo(6.7, 1);
    });

    it('evaluates BrAC for severe intoxication (0.80 mg/L -> 1.60 ‰)', () => {
      const result = evaluateAlcoholIntoxication(0.80);
      expect(result.bacPromille).toBe(1.60);
      expect(result.status).toBe('severe');
      expect(result.isViolation).toBe(true);
    });

    it('evaluates BrAC for coma risk (1.30 mg/L -> 2.60 ‰)', () => {
      const result = evaluateAlcoholIntoxication(1.30);
      expect(result.bacPromille).toBe(2.60);
      expect(result.status).toBe('coma_risk');
      expect(result.isViolation).toBe(true);
      expect(result.severityText.az).toContain('Koma');
    });

    it('handles negative inputs safely', () => {
      const result = evaluateAlcoholIntoxication(-0.5);
      expect(result.bacPromille).toBe(0.00);
      expect(result.status).toBe('sober');
      expect(result.isViolation).toBe(false);
    });
  });

  describe('calculateClinicalImpairment', () => {
    it('returns 0% impairment and passes when no tests are failed', () => {
      const result = calculateClinicalImpairment([]);
      expect(result.failedCount).toBe(0);
      expect(result.impairmentScore).toBe(0);
      expect(result.clinicalPass).toBe(true);
    });

    it('passes clinical test when only 1 minor test is failed', () => {
      const result = calculateClinicalImpairment(['speech_articulation']);
      expect(result.failedCount).toBe(1);
      expect(result.impairmentScore).toBe(10);
      expect(result.clinicalPass).toBe(true);
    });

    it('fails clinical test when 2 or more tests are failed', () => {
      const result = calculateClinicalImpairment(['romberg_balance', 'finger_to_nose']);
      expect(result.failedCount).toBe(2);
      expect(result.impairmentScore).toBe(20);
      expect(result.clinicalPass).toBe(false);
    });

    it('caps impairment score at 100%', () => {
      const result = calculateClinicalImpairment(new Array(12).fill('test'));
      expect(result.impairmentScore).toBe(100);
      expect(result.clinicalPass).toBe(false);
    });
  });

  describe('calculateSobrietySanctions', () => {
    it('returns zero fine and zero points when sober and not refused', () => {
      const result = calculateSobrietySanctions({
        article: 'article_333_1',
        bracMgL: 0.00,
        detectedDrugs: [],
        refusal: false,
        currency: 'AZN'
      });
      expect(result.fineAzn).toBe(0);
      expect(result.penaltyPoints).toBe(0);
      expect(result.impoundMandatory).toBe(false);
      expect(result.isIntoxicated).toBe(false);
    });

    it('applies Article 333.1 sanctions when alcohol intoxicated', () => {
      const result = calculateSobrietySanctions({
        article: 'article_333_1',
        bracMgL: 0.25, // 0.50 ‰
        detectedDrugs: [],
        refusal: false,
        currency: 'AZN'
      });
      expect(result.fineAzn).toBe(400);
      expect(result.penaltyPoints).toBe(5);
      expect(result.suspensionMonths).toBe(0);
      expect(result.arrestDaysMax).toBe(0);
      expect(result.impoundMandatory).toBe(true);
      expect(result.isIntoxicated).toBe(true);
    });

    it('applies Article 333.2 sanctions for accident with injury or damage', () => {
      const result = calculateSobrietySanctions({
        article: 'article_333_2',
        bracMgL: 0.50,
        detectedDrugs: [],
        refusal: false,
        currency: 'AZN'
      });
      expect(result.fineAzn).toBe(700);
      expect(result.penaltyPoints).toBe(5);
      expect(result.arrestDaysMax).toBe(15);
      expect(result.impoundMandatory).toBe(true);
    });

    it('applies Article 333.3 sanctions for unlicensed intoxicated driver', () => {
      const result = calculateSobrietySanctions({
        article: 'article_333_3',
        bracMgL: 0.30,
        detectedDrugs: [],
        refusal: false,
        currency: 'AZN'
      });
      expect(result.fineAzn).toBe(800);
      expect(result.arrestDaysMax).toBe(15);
    });

    it('applies Article 333.4 repeat offense sanctions with 2-year suspension', () => {
      const result = calculateSobrietySanctions({
        article: 'article_333_4',
        bracMgL: 0.30,
        detectedDrugs: [],
        refusal: false,
        currency: 'AZN'
      });
      expect(result.fineAzn).toBe(500);
      expect(result.suspensionMonths).toBe(24);
    });

    it('applies Article 333.6 sanctions for commercial / taxi drivers with drugs detected', () => {
      const result = calculateSobrietySanctions({
        article: 'article_333_6',
        bracMgL: 0.00,
        detectedDrugs: ['thc'],
        refusal: false,
        currency: 'AZN'
      });
      expect(result.fineAzn).toBe(500);
      expect(result.suspensionMonths).toBe(24);
      expect(result.isIntoxicated).toBe(true);
    });

    it('applies Article 334.1 refusal sanctions even with 0.00 alcohol', () => {
      const result = calculateSobrietySanctions({
        article: 'article_334_1',
        bracMgL: 0.00,
        detectedDrugs: [],
        refusal: true,
        currency: 'AZN'
      });
      expect(result.fineAzn).toBe(400);
      expect(result.suspensionMonths).toBe(6);
      expect(result.impoundMandatory).toBe(true);
      expect(result.isIntoxicated).toBe(true);
    });

    it('converts fine correctly to USD and EUR', () => {
      const resultUsd = calculateSobrietySanctions({
        article: 'article_333_1',
        bracMgL: 0.30,
        detectedDrugs: [],
        refusal: false,
        currency: 'USD'
      });
      // 400 / 1.70 = 235.29
      expect(resultUsd.convertedFine).toBe(235.29);

      const resultEur = calculateSobrietySanctions({
        article: 'article_333_1',
        bracMgL: 0.30,
        detectedDrugs: [],
        refusal: false,
        currency: 'EUR'
      });
      // 400 / 1.85 = 216.22
      expect(resultEur.convertedFine).toBe(216.22);
    });
  });

  describe('Formatting and Generator Helpers', () => {
    it('formats promille values properly', () => {
      expect(formatPromille(0.3)).toBe('0.30 ‰');
      expect(formatPromille(1.456)).toBe('1.46 ‰');
    });

    it('formats license plates with hyphens', () => {
      expect(formatPlate('99LR410')).toBe('99-LR-410');
      expect(formatPlate('10-TR-808')).toBe('10-TR-808');
    });

    it('formats currencies properly', () => {
      expect(formatCurrency(400, 'AZN')).toBe('400.00 ₼');
      expect(formatCurrency(250, 'USD')).toBe('250.00 $');
      expect(formatCurrency(200, 'EUR')).toBe('200.00 €');
    });

    it('generates valid protocol numbers', () => {
      const num = generateSobrietyProtocolNumber();
      expect(num).toMatch(/^DIN-RNM-2026-\d{4}$/);
    });
  });
});
