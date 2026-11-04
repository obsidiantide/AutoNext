import { describe, it, expect } from 'vitest';
import {
  convertSectionCurrency,
  calculateSectionTelemetry,
  evaluateSectionChecklist,
  gradeSectionExam,
  generateSectionCertificate,
} from '../sectionSafeCompliance';
import {
  MOCK_SECTION_ZONES,
  MOCK_SECTION_CHECKLIST,
  MOCK_SECTION_EXAM,
} from '../../data/mockSectionSafeData';

describe('sectionSafeCompliance Utility Suite', () => {
  describe('convertSectionCurrency', () => {
    it('converts AZN to AZN, USD, EUR accurately', () => {
      expect(convertSectionCurrency(100, 'AZN')).toBe(100);
      expect(convertSectionCurrency(100, 'USD')).toBe(58.82);
      expect(convertSectionCurrency(100, 'EUR')).toBe(54.05);
      expect(convertSectionCurrency(0, 'AZN')).toBe(0);
    });
  });

  describe('calculateSectionTelemetry', () => {
    it('evaluates compliant cruising within statutory speed limits', () => {
      // 18.6 km at 110 km/h limit with 650 seconds transit time (~102.9 km/h raw)
      const res = calculateSectionTelemetry({
        zoneDistanceKm: 18.6,
        speedLimitKmh: 110,
        transitTimeSeconds: 650,
      });

      expect(res.rawAverageSpeedKmh).toBe(103);
      expect(res.toleranceDeductionKmh).toBe(3.1); // 103 * 0.03 ~ 3.1
      expect(res.netSpeedKmh).toBe(99.9);
      expect(res.excessSpeedKmh).toBe(0);
      expect(res.violationTier).toBe('NONE');
      expect(res.fineAzn).toBe(0);
      expect(res.penaltyPoints).toBe(0);
      expect(res.discountedFineAzn).toBe(0);
      expect(res.complianceStatus).toBe('COMPLIANT');
      expect(res.shockwaveDampingRatio).toBeGreaterThan(50);
      expect(res.fuelSavedLiters).toBeGreaterThan(0);
      expect(res.co2SavedKg).toBeGreaterThan(0);
    });

    it('applies flat 3.0 km/h OIML R 91 tolerance deduction for speeds <= 100 km/h', () => {
      // 9.4 km at 90 km/h limit with 376 s -> exactly 90 km/h raw
      const res = calculateSectionTelemetry({
        zoneDistanceKm: 9.4,
        speedLimitKmh: 90,
        transitTimeSeconds: 376,
      });

      expect(res.rawAverageSpeedKmh).toBe(90);
      expect(res.toleranceDeductionKmh).toBe(3.0);
      expect(res.netSpeedKmh).toBe(87);
      expect(res.complianceStatus).toBe('COMPLIANT');
    });

    it('evaluates 10-20 km/h speeding violation under İXM 328.1 (20 AZN, 0 points)', () => {
      // 18.6 km, limit 90 km/h. Transit time 600s -> 111.6 km/h raw.
      // Net speed = 111.6 - (111.6 * 0.03 = 3.3) = 108.3 km/h.
      // Excess = 108.3 - 90 = 18.3 km/h (Tier 10-20)
      const res = calculateSectionTelemetry({
        zoneDistanceKm: 18.6,
        speedLimitKmh: 90,
        transitTimeSeconds: 600,
      });

      expect(res.excessSpeedKmh).toBeGreaterThanOrEqual(10);
      expect(res.excessSpeedKmh).toBeLessThan(20);
      expect(res.violationTier).toBe('SPEEDING_10_20');
      expect(res.fineAzn).toBe(20);
      expect(res.penaltyPoints).toBe(0);
      expect(res.discountedFineAzn).toBe(10);
      expect(res.legalArticleAz).toContain('328.1');
      expect(res.complianceStatus).toBe('VIOLATION');
    });

    it('evaluates 20-40 km/h speeding violation under İXM 328.2 (50 AZN, 2 points)', () => {
      // 18.6 km, limit 90 km/h. Transit time 530s -> 126.3 km/h raw.
      // Net speed = 126.3 - 3.8 = 122.5 km/h. Excess = 32.5 km/h.
      const res = calculateSectionTelemetry({
        zoneDistanceKm: 18.6,
        speedLimitKmh: 90,
        transitTimeSeconds: 530,
      });

      expect(res.excessSpeedKmh).toBeGreaterThanOrEqual(20);
      expect(res.excessSpeedKmh).toBeLessThan(40);
      expect(res.violationTier).toBe('SPEEDING_20_40');
      expect(res.fineAzn).toBe(50);
      expect(res.penaltyPoints).toBe(2);
      expect(res.discountedFineAzn).toBe(25);
      expect(res.legalArticleAz).toContain('328.2');
    });

    it('evaluates 40-60 km/h speeding violation under İXM 328.3 (100 AZN, 3 points)', () => {
      // 9.4 km, limit 90 km/h. Transit time 230s -> 147.1 km/h raw.
      // Net speed = 147.1 - 4.4 = 142.7 km/h. Excess = 52.7 km/h.
      const res = calculateSectionTelemetry({
        zoneDistanceKm: 9.4,
        speedLimitKmh: 90,
        transitTimeSeconds: 230,
      });

      expect(res.excessSpeedKmh).toBeGreaterThanOrEqual(40);
      expect(res.excessSpeedKmh).toBeLessThan(60);
      expect(res.violationTier).toBe('SPEEDING_40_60');
      expect(res.fineAzn).toBe(100);
      expect(res.penaltyPoints).toBe(3);
      expect(res.discountedFineAzn).toBe(50);
      expect(res.legalArticleAz).toContain('328.3');
    });

    it('evaluates >60 km/h speeding violation under İXM 328.4 (250 AZN, 4 points)', () => {
      // 9.4 km, limit 90 km/h. Transit time 180s -> 188.0 km/h raw.
      // Net speed = 188.0 - 5.6 = 182.4 km/h. Excess = 92.4 km/h.
      const res = calculateSectionTelemetry({
        zoneDistanceKm: 9.4,
        speedLimitKmh: 90,
        transitTimeSeconds: 180,
      });

      expect(res.excessSpeedKmh).toBeGreaterThanOrEqual(60);
      expect(res.violationTier).toBe('SPEEDING_OVER_60');
      expect(res.fineAzn).toBe(250);
      expect(res.penaltyPoints).toBe(4);
      expect(res.discountedFineAzn).toBe(125);
      expect(res.legalArticleAz).toContain('328.4');
    });

    it('handles buffer warning tier when excess is between 0.1 and 9.9 km/h', () => {
      // 9.4 km, limit 90 km/h. Transit time 350s -> 96.7 km/h raw.
      // Net speed = 96.7 - 3.0 = 93.7 km/h. Excess = 3.7 km/h.
      const res = calculateSectionTelemetry({
        zoneDistanceKm: 9.4,
        speedLimitKmh: 90,
        transitTimeSeconds: 350,
      });

      expect(res.excessSpeedKmh).toBeGreaterThan(0);
      expect(res.excessSpeedKmh).toBeLessThan(10);
      expect(res.violationTier).toBe('NONE');
      expect(res.fineAzn).toBe(0);
      expect(res.complianceStatus).toBe('WARNING');
    });
  });

  describe('evaluateSectionChecklist', () => {
    it('passes when all mandatory and >=80% items are checked', () => {
      const allIds = MOCK_SECTION_CHECKLIST.map((i) => i.id);
      const evalRes = evaluateSectionChecklist(allIds, MOCK_SECTION_CHECKLIST);

      expect(evalRes.passed).toBe(true);
      expect(evalRes.scorePercent).toBe(100);
      expect(evalRes.allMandatoryChecked).toBe(true);
    });

    it('fails when a mandatory item is missing even if percentage is high', () => {
      // Missing chk-01 (mandatory ANPR accuracy)
      const almostAll = MOCK_SECTION_CHECKLIST.filter((i) => i.id !== 'chk-01').map((i) => i.id);
      const evalRes = evaluateSectionChecklist(almostAll, MOCK_SECTION_CHECKLIST);

      expect(evalRes.scorePercent).toBe(90);
      expect(evalRes.allMandatoryChecked).toBe(false);
      expect(evalRes.passed).toBe(false);
    });

    it('handles empty checklist correctly', () => {
      const evalRes = evaluateSectionChecklist([], MOCK_SECTION_CHECKLIST);
      expect(evalRes.scorePercent).toBe(0);
      expect(evalRes.passed).toBe(false);
      expect(evalRes.checkedCount).toBe(0);
    });
  });

  describe('gradeSectionExam', () => {
    it('scores 100% on perfect answers and marks passed', () => {
      const perfectAnswers: Record<string, number> = {};
      MOCK_SECTION_EXAM.forEach((q) => {
        perfectAnswers[q.id] = q.correctAnswer;
      });

      const res = gradeSectionExam(perfectAnswers, MOCK_SECTION_EXAM);
      expect(res.score).toBe(10);
      expect(res.total).toBe(10);
      expect(res.percentage).toBe(100);
      expect(res.passed).toBe(true);
    });

    it('scores 70% and marks passed for threshold score', () => {
      const sevenAnswers: Record<string, number> = {};
      MOCK_SECTION_EXAM.forEach((q, idx) => {
        sevenAnswers[q.id] = idx < 7 ? q.correctAnswer : (q.correctAnswer + 1) % 4;
      });

      const res = gradeSectionExam(sevenAnswers, MOCK_SECTION_EXAM);
      expect(res.score).toBe(7);
      expect(res.percentage).toBe(70);
      expect(res.passed).toBe(true);
    });

    it('fails when score is below 70%', () => {
      const res = gradeSectionExam({}, MOCK_SECTION_EXAM);
      expect(res.score).toBe(0);
      expect(res.passed).toBe(false);
    });
  });

  describe('generateSectionCertificate', () => {
    it('generates an official valid certificate structure', () => {
      const cert = generateSectionCertificate({
        vehiclePlate: '99-SC-101',
        vehicleModel: 'Mercedes-Benz E 350d',
        corridorCode: 'SEC-M1-01',
        zoneNameAz: 'M-1 Bakı - Quba - Rusiya Sərhədi',
        distanceKm: 18.6,
        speedLimitKmh: 110,
        transitTimeSeconds: 610,
        rawSpeedKmh: 109.8,
        netSpeedKmh: 106.5,
        fineAzn: 0,
        status: 'CLEARED',
      });

      expect(cert.certificateCode).toMatch(/^SEC-SAFE-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-SC-101');
      expect(cert.status).toBe('CLEARED');
      expect(cert.simaSignatureUid).toContain('SIMA-GOV-AZ');
      expect(cert.barrierPassPin).toMatch(/^\d{4}-\d{4}$/);
      expect(cert.sha256Checksum.length).toBeGreaterThan(20);
    });
  });
});
