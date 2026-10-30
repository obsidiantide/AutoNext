import { describe, it, expect } from 'vitest';
import {
  STRATEGIC_CORRIDORS,
  WEATHER_CONDITIONS,
  INCIDENT_SEVERITY_LEVELS,
  LOS_DEFINITIONS,
  DIGITAL_TWIN_SAFETY_CHECKLIST,
  DIGITAL_TWIN_EXAM_QUESTIONS,
  convertAzn,
  formatCurrency,
  calculateDynamicSpeedLimit,
  calculateTrafficFlowMetrics,
  evaluateDigitalTwinSafetyChecklist,
  evaluateDigitalTwinExam,
  generateSimulatedSha256Checksum,
  issueDigitalTwinCertificate,
} from '../digitalTwinItsCompliance';

describe('digitalTwinItsCompliance Utilities', () => {
  describe('Constants & Currency Conversions', () => {
    it('defines all 6 strategic highway corridors with correct baseline values', () => {
      const corridorIds = Object.keys(STRATEGIC_CORRIDORS);
      expect(corridorIds.length).toBe(6);
      expect(corridorIds).toContain('CORRIDOR_BAKU_RING_ROAD');
      expect(corridorIds).toContain('CORRIDOR_HEYDAR_ALIYEV_AVE');
      expect(corridorIds).toContain('CORRIDOR_ZIGH_HIGHWAY');
      expect(corridorIds).toContain('CORRIDOR_BAKU_SUMGAYIT');
      expect(corridorIds).toContain('CORRIDOR_ALAT_ASTARA');
      expect(corridorIds).toContain('CORRIDOR_SHAMAKHI_PASS');

      const ringRoad = STRATEGIC_CORRIDORS.CORRIDOR_BAKU_RING_ROAD;
      expect(ringRoad.baselineSpeedLimitKmH).toBe(110);
      expect(ringRoad.bimLodLevel).toBe('LOD 400');
      expect(ringRoad.lanesPerDirection).toBe(3);
    });

    it('defines weather conditions and incident severity models', () => {
      expect(Object.keys(WEATHER_CONDITIONS).length).toBe(4);
      expect(WEATHER_CONDITIONS.SNOW_ICE.baseFrictionCoefficient).toBeLessThan(0.3);
      expect(WEATHER_CONDITIONS.DRY.baseFrictionCoefficient).toBeGreaterThan(0.8);

      expect(INCIDENT_SEVERITY_LEVELS.ROAD_CLOSURE.capacityReductionRatio).toBe(0.0);
      expect(INCIDENT_SEVERITY_LEVELS.MULTI_LANE_MAJOR.alertLevel).toBe('EMERGENCY');
    });

    it('formats currencies accurately in AZN, USD, and EUR', () => {
      expect(convertAzn(100, 'AZN')).toBe(100);
      expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 1);
      expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 1);

      expect(formatCurrency(150, 'AZN')).toContain('₼');
      expect(formatCurrency(150, 'USD')).toContain('$');
      expect(formatCurrency(150, 'EUR')).toContain('€');
    });
  });

  describe('Dynamic Variable Speed Limit (VSL) Physics Engine', () => {
    it('calculates optimal baseline speed under dry weather and low traffic', () => {
      const result = calculateDynamicSpeedLimit(
        'CORRIDOR_HEYDAR_ALIYEV_AVE',
        15, // low density veh/km/lane
        'DRY',
        'NONE',
        22
      );

      expect(result.recommendedVslKmH).toBe(120);
      expect(result.isHighwayClosed).toBe(false);
      expect(result.levelOfService).toBe('LOS_A');
      expect(result.effectiveFrictionCoefficient).toBeGreaterThanOrEqual(0.8);
      expect(result.laneSignals.every((s) => s === 'OPEN_GREEN')).toBe(true);
    });

    it('lowers speed limit and warns of black ice under snow/ice conditions', () => {
      const result = calculateDynamicSpeedLimit(
        'CORRIDOR_SHAMAKHI_PASS',
        30,
        'SNOW_ICE',
        'NONE',
        -5
      );

      expect(result.recommendedVslKmH).toBeLessThanOrEqual(60);
      expect(result.effectiveFrictionCoefficient).toBeCloseTo(0.22, 1);
      expect(result.vmsDisplayMessageAz).toContain('QARA BUZ');
    });

    it('handles single lane blockage and sets lane control signals with merge indicator', () => {
      const result = calculateDynamicSpeedLimit(
        'CORRIDOR_BAKU_RING_ROAD',
        40,
        'WET_RAIN',
        'SINGLE_LANE_BLOCK',
        12
      );

      expect(result.recommendedVslKmH).toBeLessThan(110);
      expect(result.laneSignals).toContain('CLOSED_RED_X');
      expect(result.laneSignals).toContain('MERGE_LEFT');
      expect(result.aidAlarmTriggered).toBe(true);
    });

    it('enforces total closure on ROAD_CLOSURE incident', () => {
      const result = calculateDynamicSpeedLimit(
        'CORRIDOR_ALAT_ASTARA',
        20,
        'DRY',
        'ROAD_CLOSURE',
        20
      );

      expect(result.isHighwayClosed).toBe(true);
      expect(result.recommendedVslKmH).toBe(0);
      expect(result.levelOfService).toBe('LOS_F');
      expect(result.laneSignals.every((s) => s === 'CLOSED_RED_X')).toBe(true);
      expect(result.vmsDisplayMessageAz).toContain('MAGİSTRAL TAM BAĞLIDIR');
    });

    it('transitions Level of Service (LOS) appropriately across densities', () => {
      const losA = calculateDynamicSpeedLimit('CORRIDOR_BAKU_RING_ROAD', 10, 'DRY', 'NONE');
      const losB = calculateDynamicSpeedLimit('CORRIDOR_BAKU_RING_ROAD', 20, 'DRY', 'NONE');
      const losC = calculateDynamicSpeedLimit('CORRIDOR_BAKU_RING_ROAD', 30, 'DRY', 'NONE');
      const losD = calculateDynamicSpeedLimit('CORRIDOR_BAKU_RING_ROAD', 40, 'DRY', 'NONE');
      const losE = calculateDynamicSpeedLimit('CORRIDOR_BAKU_RING_ROAD', 60, 'DRY', 'NONE');
      const losF = calculateDynamicSpeedLimit('CORRIDOR_BAKU_RING_ROAD', 85, 'DRY', 'NONE');

      expect(losA.levelOfService).toBe('LOS_A');
      expect(losB.levelOfService).toBe('LOS_B');
      expect(losC.levelOfService).toBe('LOS_C');
      expect(losD.levelOfService).toBe('LOS_D');
      expect(losE.levelOfService).toBe('LOS_E');
      expect(losF.levelOfService).toBe('LOS_F');
    });
  });

  describe('Macro & Micro Traffic Flow Metrics', () => {
    it('computes PCU equivalent volume, vehicle composition, and delay costs', () => {
      const metrics = calculateTrafficFlowMetrics(
        'CORRIDOR_BAKU_SUMGAYIT',
        50, // moderate-high density
        25, // 25% trucks
        10, // 10% buses
        'NONE'
      );

      expect(metrics.hourlyVolumeVehTotal).toBeGreaterThan(0);
      expect(metrics.truckTransitPercent).toBe(25);
      expect(metrics.busPublicPercent).toBe(10);
      expect(metrics.passengerCarPercent).toBe(65);
      expect(metrics.pcuEquivalentFlow).toBeGreaterThan(metrics.hourlyVolumeVehTotal);
      expect(metrics.averageHeadwaySeconds).toBeGreaterThan(0);
      expect(metrics.excessCo2KgPerHour).toBeGreaterThanOrEqual(0);
    });
  });

  describe('10-Point Operational Safety Checklist Evaluation', () => {
    it('validates 100% compliance when all items are checked', () => {
      const allIds = DIGITAL_TWIN_SAFETY_CHECKLIST.map((c) => c.id);
      const evalResult = evaluateDigitalTwinSafetyChecklist(allIds);

      expect(evalResult.checkedCount).toBe(10);
      expect(evalResult.totalCount).toBe(10);
      expect(evalResult.scorePercentage).toBe(100);
      expect(evalResult.isCompliant).toBe(true);
      expect(evalResult.statusAz).toBe('TAM UYĞUNDUR');
      expect(evalResult.recommendationsAz.length).toBe(0);
    });

    it('generates specific recommendations when critical items are missing', () => {
      const partialIds = ['ITS_CHK_01_V2X_RSU', 'ITS_CHK_03_RWIS_WEATHER'];
      const evalResult = evaluateDigitalTwinSafetyChecklist(partialIds);

      expect(evalResult.scorePercentage).toBe(20);
      expect(evalResult.isCompliant).toBe(false);
      expect(evalResult.statusAz).toBe('TƏHLÜKƏLİ / NÖQSANLI');
      expect(evalResult.recommendationsAz.length).toBeGreaterThan(0);
    });
  });

  describe('Smart Mobility & ITS Law Exam Simulator', () => {
    it('evaluates passing score with grade ƏLA when all answers are correct', () => {
      const perfectAnswers: Record<number, number> = {};
      DIGITAL_TWIN_EXAM_QUESTIONS.forEach((q) => {
        perfectAnswers[q.id] = q.correctOptionIndex;
      });

      const examResult = evaluateDigitalTwinExam(perfectAnswers);
      expect(examResult.correctCount).toBe(10);
      expect(examResult.percentage).toBe(100);
      expect(examResult.isPassed).toBe(true);
      expect(examResult.scoreGrade).toBe('ƏLA');
      expect(examResult.feedbackAz).toContain('Təbriklər');
    });

    it('fails when score is below 70%', () => {
      const failingAnswers: Record<number, number> = {
        1: 0, // incorrect
        2: 0, // incorrect
        3: 0, // correct (3 is index 0)
        4: 0, // incorrect
        5: 0, // incorrect
      };

      const examResult = evaluateDigitalTwinExam(failingAnswers);
      expect(examResult.percentage).toBeLessThan(70);
      expect(examResult.isPassed).toBe(false);
      expect(examResult.scoreGrade).toBe('QEYRİ-KAFİ');
    });
  });

  describe('Official Certificate Issuance & Verification', () => {
    it('generates deterministic SHA-256 hash', () => {
      const hash1 = generateSimulatedSha256Checksum('NITS-TWIN-AZ-2026-TEST');
      const hash2 = generateSimulatedSha256Checksum('NITS-TWIN-AZ-2026-TEST');
      const hash3 = generateSimulatedSha256Checksum('NITS-TWIN-AZ-2026-DIFF');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1.length).toBe(64);
    });

    it('issues valid digital twin corridor certificate with correct status', () => {
      const cert = issueDigitalTwinCertificate({
        corridorId: 'CORRIDOR_BAKU_RING_ROAD',
        authorizedOrganization: 'Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA)',
        operatorVoen: '1402283941',
        safetyScorePercentage: 95,
        activeVslKmH: 90,
        levelOfService: 'LOS_B',
        rwisFrictionMu: 0.82,
      });

      expect(cert.certificateId).toMatch(/^NITS-TWIN-AZ-2026-\d{4}$/);
      expect(cert.corridorId).toBe('CORRIDOR_BAKU_RING_ROAD');
      expect(cert.bimLodLevel).toBe('LOD 400');
      expect(cert.status).toBe('ACTIVE_CERTIFIED');
      expect(cert.sha256VerificationHash.length).toBe(64);
      expect(cert.simaDigitalUid).toContain('SIMA-NITS-');
      expect(cert.qrVerificationUrl).toContain('https://nits.gov.az/verify/twin/');
    });

    it('sets status to TEMPORARILY_RESTRICTED when score is low or LOS is F', () => {
      const restrictedCert = issueDigitalTwinCertificate({
        corridorId: 'CORRIDOR_SHAMAKHI_PASS',
        authorizedOrganization: 'Şamaxı Magistral Xidməti',
        operatorVoen: '2100481920',
        safetyScorePercentage: 60,
        activeVslKmH: 40,
        levelOfService: 'LOS_F',
        rwisFrictionMu: 0.20,
      });

      expect(restrictedCert.status).toBe('TEMPORARILY_RESTRICTED');
    });
  });
});
