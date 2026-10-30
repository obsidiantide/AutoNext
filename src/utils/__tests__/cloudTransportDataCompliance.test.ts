import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  CLOUD_ZONES,
  calculateCloudTransportTariff,
  evaluateCloudSecurityChecklist,
  CLOUD_SECURITY_CHECKLIST,
  evaluateCloudExam,
  CLOUD_EXAM_QUESTIONS,
  issueCloudTransportCertificate,
  generateSimulatedSha256Checksum,
} from '../cloudTransportDataCompliance';

describe('cloudTransportDataCompliance Utility Functions', () => {
  describe('Currency conversions and formatting', () => {
    it('converts AZN amounts correctly to USD and EUR', () => {
      const aznAmount = 1000;
      const usdAmount = convertAzn(aznAmount, 'USD');
      const eurAmount = convertAzn(aznAmount, 'EUR');
      const sameAzn = convertAzn(aznAmount, 'AZN');

      expect(sameAzn).toBe(1000);
      expect(usdAmount).toBeCloseTo(588.2, 1);
      expect(eurAmount).toBeCloseTo(543.5, 1);
    });

    it('formats currency strings according to locale and currency symbols', () => {
      expect(formatCurrency(1500, 'AZN')).toContain('₼');
      expect(formatCurrency(1500, 'USD')).toContain('$');
      expect(formatCurrency(1500, 'EUR')).toContain('€');
    });
  });

  describe('Cloud Zones Catalog', () => {
    it('contains all 6 sovereign cloud zones with valid coordinates and SLAs', () => {
      const zoneKeys = Object.keys(CLOUD_ZONES);
      expect(zoneKeys.length).toBe(6);
      expect(zoneKeys).toContain('ZONE_BAKU_PRIMARY');
      expect(zoneKeys).toContain('ZONE_YEVLAKH_REGIONAL');
      expect(zoneKeys).toContain('ZONE_NAKHCHIVAN_REDUNDANT');
      expect(zoneKeys).toContain('ZONE_GANJA_EDGE');
      expect(zoneKeys).toContain('ZONE_SUMGAYIT_HIGH_DENSITY');
      expect(zoneKeys).toContain('ZONE_FUZULI_SMART');

      Object.values(CLOUD_ZONES).forEach((zone) => {
        expect(zone.uptimeSlaPercentage).toBeGreaterThanOrEqual(99.98);
        expect(zone.coordinates.lat).toBeGreaterThan(38);
        expect(zone.coordinates.lat).toBeLessThan(42);
        expect(zone.nvmeStoragePetabytes).toBeGreaterThan(0);
        expect(zone.greenPowerPUE).toBeLessThan(1.5);
      });
    });
  });

  describe('calculateCloudTransportTariff', () => {
    it('calculates standard base tier correctly for 1 vehicle', () => {
      const result = calculateCloudTransportTariff(
        1,
        1,
        'BASIC_TELEMETRY',
        'GEO_REDUNDANT_STANDARD',
        false,
        'AZN'
      );

      expect(result.fleetVehicleCount).toBe(1);
      expect(result.baseMonthlySubscriptionAzn).toBe(12.0);
      expect(result.aiComputeProcessingCostMonthlyAzn).toBe(4.0);
      expect(result.highAvailabilityRedundancyCostMonthlyAzn).toBe(0);
      expect(result.subsidyDiscountAmountAzn).toBe(0);
      expect(result.netMonthlyTotalAzn).toBeGreaterThanOrEqual(16);
      expect(result.guaranteedSlaUptime).toContain('99.980%');
    });

    it('applies 15% government subsidy discount when enabled', () => {
      const withoutSubsidy = calculateCloudTransportTariff(
        50,
        12,
        'ADVANCED_FLEET_AI',
        'DUAL_ZONE_ACTIVE_ACTIVE',
        false,
        'AZN'
      );
      const withSubsidy = calculateCloudTransportTariff(
        50,
        12,
        'ADVANCED_FLEET_AI',
        'DUAL_ZONE_ACTIVE_ACTIVE',
        true,
        'AZN'
      );

      expect(withSubsidy.subsidyDiscountAmountAzn).toBeCloseTo(
        withoutSubsidy.grossMonthlyTotalAzn * 0.15,
        2
      );
      expect(withSubsidy.netMonthlyTotalAzn).toBeCloseTo(
        withoutSubsidy.grossMonthlyTotalAzn * 0.85,
        2
      );
    });

    it('correctly prices Tier IV sovereign G-Cloud redundancy and converts to USD', () => {
      const result = calculateCloudTransportTariff(
        200,
        24,
        'ENTERPRISE_MISSION_CRITICAL',
        'G_CLOUD_SOVEREIGN_TIER_IV',
        false,
        'USD'
      );

      expect(result.highAvailabilityRedundancyCostMonthlyAzn).toBeGreaterThan(0);
      expect(result.guaranteedSlaUptime).toContain('Tier IV');
      expect(result.netMonthlyConverted).toBeCloseTo(result.netMonthlyTotalAzn * 0.5882, 1);
    });

    it('safely clamps vehicle count boundaries', () => {
      const minResult = calculateCloudTransportTariff(0, 1, 'BASIC_TELEMETRY', 'GEO_REDUNDANT_STANDARD', false);
      expect(minResult.fleetVehicleCount).toBe(1);

      const maxResult = calculateCloudTransportTariff(99999, 1, 'BASIC_TELEMETRY', 'GEO_REDUNDANT_STANDARD', false);
      expect(maxResult.fleetVehicleCount).toBe(5000);
    });
  });

  describe('evaluateCloudSecurityChecklist', () => {
    it('returns 0% and non-compliant for empty selection', () => {
      const evalResult = evaluateCloudSecurityChecklist([]);
      expect(evalResult.totalScore).toBe(0);
      expect(evalResult.percentage).toBe(0);
      expect(evalResult.isCompliant).toBe(false);
      expect(evalResult.complianceGrade).toBe('F');
      expect(evalResult.missingCriticalItems.length).toBe(CLOUD_SECURITY_CHECKLIST.length);
    });

    it('returns 100% and Grade A+ when all items are checked', () => {
      const allIds = CLOUD_SECURITY_CHECKLIST.map((item) => item.id);
      const evalResult = evaluateCloudSecurityChecklist(allIds);

      expect(evalResult.percentage).toBe(100);
      expect(evalResult.isCompliant).toBe(true);
      expect(evalResult.complianceGrade).toBe('A+');
      expect(evalResult.missingCriticalItems.length).toBe(0);
    });
  });

  describe('evaluateCloudExam', () => {
    it('gives 100% and grade ƏLA for all correct answers', () => {
      const correctAnswers: Record<number, string> = {};
      CLOUD_EXAM_QUESTIONS.forEach((q) => {
        const correct = q.options.find((o) => o.isCorrect);
        if (correct) {
          correctAnswers[q.id] = correct.key;
        }
      });

      const examResult = evaluateCloudExam(correctAnswers);
      expect(examResult.correctCount).toBe(CLOUD_EXAM_QUESTIONS.length);
      expect(examResult.percentage).toBe(100);
      expect(examResult.isPassed).toBe(true);
      expect(examResult.scoreGrade).toBe('ƏLA');
      expect(examResult.feedbackAz).toContain('Təbriklər');
    });

    it('handles failing scores when answers are incorrect', () => {
      const wrongAnswers: Record<number, string> = {};
      CLOUD_EXAM_QUESTIONS.forEach((q) => {
        const wrong = q.options.find((o) => !o.isCorrect);
        if (wrong) {
          wrongAnswers[q.id] = wrong.key;
        }
      });

      const examResult = evaluateCloudExam(wrongAnswers);
      expect(examResult.correctCount).toBe(0);
      expect(examResult.percentage).toBe(0);
      expect(examResult.isPassed).toBe(false);
      expect(examResult.scoreGrade).toBe('QEYRİ-KAFİ');
      expect(examResult.feedbackAz).toContain('qeyri-kafidir');
    });
  });

  describe('issueCloudTransportCertificate & generateSimulatedSha256Checksum', () => {
    it('generates a valid 64-character SHA-256 hex string', () => {
      const hash = generateSimulatedSha256Checksum('sample-telematics-payload');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('issues a compliant certificate with official IDs and dates', () => {
      const cert = issueCloudTransportCertificate(
        'Baku Express Logistics QSC',
        '1402948191',
        150,
        'ZONE_BAKU_PRIMARY',
        'ENTERPRISE_MISSION_CRITICAL',
        'G_CLOUD_SOVEREIGN_TIER_IV',
        98
      );

      expect(cert.certificateId).toMatch(/^AZINTELECOM-CLOUD-AZ-2026-\d{4}$/);
      expect(cert.fleetCompany).toBe('Baku Express Logistics QSC');
      expect(cert.taxPayerIdVoen).toBe('1402948191');
      expect(cert.fleetVehicleCount).toBe(150);
      expect(cert.assignedCloudZone).toBe('ZONE_BAKU_PRIMARY');
      expect(cert.simaDigitalUid).toContain('SIMA-AZIN-CLOUD');
      expect(cert.sha256VerificationHash).toHaveLength(64);
      expect(cert.status).toBe('ACTIVE_VALID');
      expect(cert.qrVerificationUrl).toContain(cert.certificateId);
    });
  });
});
