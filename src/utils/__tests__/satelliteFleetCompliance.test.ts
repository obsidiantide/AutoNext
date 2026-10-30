import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  evaluateRtkFixTelemetry,
  evaluateJammingSpoofing,
  calculateSatelliteFleetTariff,
  evaluateSpaceChecklist,
  evaluateSpaceExam,
  generateDeterministicHash,
  issueSatelliteFleetCertificate,
  SATELLITE_ASSETS,
  FLEET_VEHICLE_PRESETS,
} from '../satelliteFleetCompliance';
import {
  MOCK_SPACE_CHECKLIST,
  MOCK_SPACE_EXAM_QUESTIONS,
} from '../../data/mockSatelliteFleetData';

describe('Satellite Fleet Compliance Engine (Azercosmos, AYNA & BDYP)', () => {
  describe('Currency Conversion and Formatting', () => {
    it('correctly converts AZN to USD and EUR', () => {
      expect(convertAzn(100, 'AZN')).toBe(100);
      expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 1);
      expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 1);
    });

    it('formats currency strings correctly with symbols', () => {
      const aznStr = formatCurrency(1500, 'AZN');
      expect(aznStr).toContain('₼');
      const usdStr = formatCurrency(1500, 'USD');
      expect(usdStr).toContain('$');
      const eurStr = formatCurrency(1500, 'EUR');
      expect(eurStr).toContain('€');
    });
  });

  describe('Orbital Satellite Assets & Presets', () => {
    it('contains valid definitions for Azerspace-1, Azerspace-2 and S-AIS', () => {
      expect(SATELLITE_ASSETS.AZERSPACE_1.orbitalSlot).toContain('46.0° East');
      expect(SATELLITE_ASSETS.AZERSPACE_2.orbitalSlot).toContain('45.0° East');
      expect(SATELLITE_ASSETS.AZERSKY_2_EO.orbitType).toBe('LEO');
      expect(SATELLITE_ASSETS.MULTI_GNSS_L1_L5.transponderCount).toBeGreaterThan(50);
      expect(SATELLITE_ASSETS.SPACE_BASED_AIS_CONSTELLATION.orbitType).toBe('LEO');
    });

    it('contains fleet presets with valid configurations', () => {
      expect(FLEET_VEHICLE_PRESETS.HEAVY_FREIGHT_TIR.defaultVehiclePlate).toBe('99-ZA-841');
      expect(FLEET_VEHICLE_PRESETS.ADR_HAZMAT_TANKER.requiresRtkCentimeter).toBe(true);
      expect(FLEET_VEHICLE_PRESETS.CASPIAN_CARGO_FEEDER_VESSEL.requiresSpaceBasedAis).toBe(true);
      expect(FLEET_VEHICLE_PRESETS.CASH_IN_TRANSIT_ARMORED.requiredUpdateIntervalSec).toBe(2);
    });
  });

  describe('RTK Fix Telemetry Evaluation', () => {
    it('returns AUTONOMOUS_GNSS when NTRIP is disconnected or correction is stale', () => {
      const result = evaluateRtkFixTelemetry(8, 35, 30, false);
      expect(result.fixMode).toBe('AUTONOMOUS_GNSS');
      expect(result.isSafeForAutonomousLevel4).toBe(false);
      expect(result.horizontalAccuracyMeters).toBeGreaterThan(2.0);
    });

    it('returns DGPS_CODE when correction age is between 11 and 30s or satellites < 14', () => {
      const result = evaluateRtkFixTelemetry(12, 15, 35, true);
      expect(result.fixMode).toBe('DGPS_CODE');
      expect(result.isSafeForAutonomousLevel4).toBe(false);
      expect(result.horizontalAccuracyMeters).toBe(0.75);
    });

    it('returns RTK_FLOAT when satellites are sufficient but SNR or age is borderline', () => {
      const result = evaluateRtkFixTelemetry(13, 2, 40, true);
      expect(result.fixMode).toBe('RTK_FLOAT');
      expect(result.horizontalAccuracyMeters).toBe(0.18);
      expect(result.isSafeForAutonomousLevel4).toBe(false);
    });

    it('returns RTK_FIXED_CENTIMETER under optimal conditions', () => {
      const result = evaluateRtkFixTelemetry(24, 1, 45, true);
      expect(result.fixMode).toBe('RTK_FIXED_CENTIMETER');
      expect(result.horizontalAccuracyMeters).toBeLessThan(0.05); // ~1.8 cm
      expect(result.isSafeForAutonomousLevel4).toBe(true);
      expect(result.statusBadgeAz).toContain('Santimetr Rejimi');
    });
  });

  describe('GNSS Jamming & Spoofing Evaluation', () => {
    it('detects CRITICAL_SPOOFING_DETECTED when clock drift is abnormal with strong signal', () => {
      const result = evaluateJammingSpoofing(49, 10, 95);
      expect(result.threatLevel).toBe('CRITICAL_SPOOFING_DETECTED');
      expect(result.antiJammingCrpaFilterActive).toBe(true);
      expect(result.imuDeadReckoningEngaged).toBe(true);
      expect(result.statusBadgeAz).toContain('SPOOFİNG');
    });

    it('detects ACTIVE_JAMMING_ALERT when C/N0 drops below 28 or AGC attenuates severely', () => {
      const result = evaluateJammingSpoofing(24, 75, 12);
      expect(result.threatLevel).toBe('ACTIVE_JAMMING_ALERT');
      expect(result.antiJammingCrpaFilterActive).toBe(true);
      expect(result.statusBadgeAz).toContain('JAMMİNG');
    });

    it('detects INTERFERENCE_CAUTION when C/N0 is moderately degraded', () => {
      const result = evaluateJammingSpoofing(32, 40, 15);
      expect(result.threatLevel).toBe('INTERFERENCE_CAUTION');
      expect(result.statusBadgeAz).toContain('İnterferensiya');
    });

    it('returns NOMINAL_SAFE under clear signal conditions', () => {
      const result = evaluateJammingSpoofing(45, 10, 8);
      expect(result.threatLevel).toBe('NOMINAL_SAFE');
      expect(result.statusBadgeAz).toContain('Nominal');
    });
  });

  describe('Satellite Fleet Tariff Calculation', () => {
    it('calculates base tariff for 1 unit for 1 month', () => {
      const tariff = calculateSatelliteFleetTariff(1, 'HEAVY_FREIGHT_TIR', 1, false, false, false, false, 'AZN');
      expect(tariff.baseTelematicsFeeAzn).toBe(25);
      expect(tariff.stateRegulatoryDutyAzn).toBe(35); // 30 + 1 * 5
      expect(tariff.totalFeeAzn).toBe(60); // 25 + 35
    });

    it('applies RTK and satellite link add-ons correctly', () => {
      const tariff = calculateSatelliteFleetTariff(2, 'ADR_HAZMAT_TANKER', 6, true, false, true, true, 'AZN');
      // base: 2 * 6 * 25 = 300
      // rtk: 2 * 6 * 35 = 420
      // azerspace: 2 * 6 * 20 = 240
      // geofence: 2 * 6 * 10 = 120
      // subtotal: 1080
      // discount (<10 units): 0
      // duty: 30 + 2 * 5 = 40
      // total: 1120
      expect(tariff.baseTelematicsFeeAzn).toBe(300);
      expect(tariff.rtkCentimeterCorrectionFeeAzn).toBe(420);
      expect(tariff.totalFeeAzn).toBe(1120);
    });

    it('applies volume discount for fleets of 50+ units', () => {
      const tariff = calculateSatelliteFleetTariff(50, 'HEAVY_FREIGHT_TIR', 12, false, false, false, false, 'AZN');
      // base: 50 * 12 * 25 = 15000
      // discount 15%: 2250
      // duty: 30 + 50 * 5 = 280
      // total: 15000 - 2250 + 280 = 13030
      expect(tariff.volumeDiscountAzn).toBe(2250);
      expect(tariff.totalFeeAzn).toBe(13030);
    });
  });

  describe('Space Cyber-Resilience Checklist Evaluation', () => {
    it('verifies full compliance when all mandatory items are checked', () => {
      const allChecked: Record<string, boolean> = {};
      MOCK_SPACE_CHECKLIST.forEach(item => {
        allChecked[item.id] = true;
      });

      const evalResult = evaluateSpaceChecklist(MOCK_SPACE_CHECKLIST, allChecked);
      expect(evalResult.isEligibleForPermit).toBe(true);
      expect(evalResult.complianceScorePercent).toBe(100);
      expect(evalResult.mandatoryFailedCount).toBe(0);
      expect(evalResult.verdictAz).toContain('TAM UYĞUNDUR');
    });

    it('fails compliance if any mandatory item is unchecked', () => {
      const checkedMap: Record<string, boolean> = {};
      MOCK_SPACE_CHECKLIST.forEach(item => {
        if (item.id !== 'SAT_CHK_01') {
          checkedMap[item.id] = true;
        }
      });

      const evalResult = evaluateSpaceChecklist(MOCK_SPACE_CHECKLIST, checkedMap);
      expect(evalResult.isEligibleForPermit).toBe(false);
      expect(evalResult.mandatoryFailedCount).toBe(1);
      expect(evalResult.verdictAz).toContain('MƏHDUDİYYƏTLİ');
    });
  });

  describe('Space Examination Simulator', () => {
    it('evaluates passing exam with >= 8 correct answers', () => {
      const perfectAnswers: Record<number, number> = {};
      MOCK_SPACE_EXAM_QUESTIONS.forEach(q => {
        perfectAnswers[q.id] = q.correctOptionIndex;
      });

      const examResult = evaluateSpaceExam(MOCK_SPACE_EXAM_QUESTIONS, perfectAnswers);
      expect(examResult.isPassed).toBe(true);
      expect(examResult.scorePercent).toBe(100);
      expect(examResult.certificateGrade).toBe('EXCELLENT');
    });

    it('evaluates failing exam when correct answers < 8', () => {
      const badAnswers: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 2, // incorrect
        5: 2, // incorrect
        6: 2, // incorrect
        7: 2, // incorrect
        8: 2, // incorrect
        9: 2, // incorrect
        10: 2, // incorrect
      };

      const examResult = evaluateSpaceExam(MOCK_SPACE_EXAM_QUESTIONS, badAnswers);
      expect(examResult.isPassed).toBe(false);
      expect(examResult.scorePercent).toBeLessThan(80);
      expect(examResult.certificateGrade).toBe('FAILED');
    });
  });

  describe('Certificate Generation', () => {
    it('creates a deterministic hash and verified certificate', () => {
      const hash1 = generateDeterministicHash('test-seed-1');
      const hash2 = generateDeterministicHash('test-seed-1');
      expect(hash1).toBe(hash2);
      expect(hash1.startsWith('0x')).toBe(true);

      const cert = issueSatelliteFleetCertificate(
        '99-ZA-841',
        'VF624GPA7KC881920',
        'AzLogistics Global',
        'HEAVY_FREIGHT_TIR',
        'STATION_BAKU_PRIMARY',
        'AZERSPACE_1',
        'RTK_FIXED_CENTIMETER',
        false,
        true
      );

      expect(cert.certificateId).toMatch(/^AZERCOSMOS-SAT-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-ZA-841');
      expect(cert.status).toBe('OFFICIALLY_VERIFIED');
      expect(cert.sha256Digest).toContain('0x');
      expect(cert.simaUid).toContain('SIMA-AZ-SAT-');
    });
  });
});
