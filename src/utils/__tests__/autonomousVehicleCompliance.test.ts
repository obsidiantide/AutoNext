import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  evaluateSaeAutomationLevel,
  evaluateSensorFusion,
  evaluateV2xTelemetry,
  calculateAutonomousPilotFees,
  evaluateAutonomousSafetyChecklist,
  evaluateAutonomousExam,
  generateOfficialAutonomousPilotPermit,
  SAE_LEVEL_DEFINITIONS,
} from '../autonomousVehicleCompliance';
import {
  MOCK_AUTONOMOUS_CORRIDORS_LIST,
  MOCK_AUTONOMOUS_CHECKLIST,
  MOCK_AUTONOMOUS_EXAM_QUESTIONS,
} from '../../data/mockAutonomousVehicleData';

describe('Autonomous Vehicle Compliance Utility', () => {
  describe('Currency conversion and formatting', () => {
    it('converts AZN to USD and EUR accurately', () => {
      const aznAmount = 100;
      expect(convertAzn(aznAmount, 'AZN')).toBe(100);
      expect(convertAzn(aznAmount, 'USD')).toBeCloseTo(58.82, 1);
      expect(convertAzn(aznAmount, 'EUR')).toBeCloseTo(54.35, 1);
    });

    it('formats currency with appropriate symbols', () => {
      expect(formatCurrency(150, 'AZN')).toContain('₼');
      expect(formatCurrency(150, 'USD')).toContain('$');
      expect(formatCurrency(150, 'EUR')).toContain('€');
    });
  });

  describe('SAE Automation Level Evaluation', () => {
    it('identifies compliant Level 3 testing with safety driver within speed limit', () => {
      const result = evaluateSaeAutomationLevel(
        'LEVEL_3_CONDITIONAL_AUTO',
        true, // hasSafetyDriver
        60,   // speedKmh
        80    // corridorMaxSpeedKmh
      );
      expect(result.isCompliant).toBe(true);
      expect(result.speedViolation).toBe(false);
      expect(result.penaltyAzn).toBe(0);
      expect(result.handoverTimeSec).toBe(10);
    });

    it('detects missing safety driver violation for Level 3 testing', () => {
      const result = evaluateSaeAutomationLevel(
        'LEVEL_3_CONDITIONAL_AUTO',
        false, // no safety driver
        40,
        80
      );
      expect(result.isCompliant).toBe(false);
      expect(result.requiresSafetyDriver).toBe(true);
      expect(result.penaltyAzn).toBe(500);
      expect(result.statutoryArticleAz).toContain('342.7');
    });

    it('detects speed limit violation in corridor', () => {
      const result = evaluateSaeAutomationLevel(
        'LEVEL_4_HIGH_AUTOMATION',
        true,
        95, // speed
        80  // max speed
      );
      expect(result.isCompliant).toBe(false);
      expect(result.speedViolation).toBe(true);
      expect(result.penaltyAzn).toBe(200);
      expect(result.statutoryArticleAz).toContain('342.2');
    });

    it('has definitions for all SAE levels from Level 0 to Level 5', () => {
      expect(SAE_LEVEL_DEFINITIONS.LEVEL_0_NO_AUTOMATION.code).toBe('SAE L0');
      expect(SAE_LEVEL_DEFINITIONS.LEVEL_4_HIGH_AUTOMATION.code).toBe('SAE L4');
      expect(SAE_LEVEL_DEFINITIONS.LEVEL_5_FULL_AUTOMATION.code).toBe('SAE L5');
    });
  });

  describe('Sensor Fusion & Environmental Degradation', () => {
    it('evaluates optimal sensor fusion under clear conditions', () => {
      const result = evaluateSensorFusion(
        200,      // lidar range
        1500000,  // pts/sec
        0,        // occlusion
        24,       // radar tracks
        'CLEAR_DAY',
        true      // radar active
      );
      expect(result.overallPerceptionConfidencePercent).toBeGreaterThanOrEqual(85);
      expect(result.isSafeForAutonomousMode).toBe(true);
      expect(result.mrmTriggered).toBe(false);
      expect(result.activeFaultsAz.length).toBe(0);
    });

    it('triggers MRM emergency stop in heavy fog with high occlusion and disabled radar', () => {
      const result = evaluateSensorFusion(
        90,       // low range degraded by fog
        400000,   // low density
        65,       // high camera occlusion
        0,
        'HEAVY_FOG',
        false     // radar inactive
      );
      expect(result.isSafeForAutonomousMode).toBe(false);
      expect(result.mrmTriggered).toBe(true);
      expect(result.fusionVerdictAz).toContain('Minimum Risk Manevri');
      expect(result.activeFaultsAz.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('V2X Telemetry Benchmarks', () => {
    it('rates ultra-low latency C-V2X connection', () => {
      const result = evaluateV2xTelemetry(
        'C_V2X_PC5_5_9GHZ',
        12,   // 12ms latency
        99.5, // 99.5% PDR
        true, // SPaT sync
        false // no pedestrian alert
      );
      expect(result.isCompliant).toBe(true);
      expect(result.latencyCategoryAz).toBe('ULTRA_LOW');
      expect(result.spatSyncStatus).toBe('LOCKED');
    });

    it('flags critical latency and link loss', () => {
      const result = evaluateV2xTelemetry(
        'DSRC_IEEE_802_11P',
        95,   // 95ms latency
        88.0, // poor PDR
        false,// no SPaT
        true  // pedestrian alert
      );
      expect(result.isCompliant).toBe(false);
      expect(result.latencyCategoryAz).toBe('CRITICAL_LATENCY');
      expect(result.spatSyncStatus).toBe('DISCONNECTED');
    });
  });

  describe('Statutory Road Test Fees Calculation', () => {
    it('calculates 30-day testing fees with police escort and spectrum clearance', () => {
      const fees = calculateAutonomousPilotFees(
        'LEVEL_4_HIGH_AUTOMATION',
        30,   // 30 days
        true, // requires escort
        5,    // 5 escort days
        true, // v2x spectrum
        true  // FHN safety stand
      );
      // Base: 50 * 30 = 1500
      // Escort: 5 * 120 = 600
      // V2X: 90
      // FHN: 80
      // Total: 2270 AZN
      expect(fees.baseTestingFeeAzn).toBe(1500);
      expect(fees.corridorEscortFeeAzn).toBe(600);
      expect(fees.v2xSpectrumClearanceFeeAzn).toBe(90);
      expect(fees.fhnSafetyStandFeeAzn).toBe(80);
      expect(fees.totalPayableAzn).toBe(2270);
    });
  });

  describe('10-Point Autonomous Vehicle Safety Checklist', () => {
    it('passes eligibility when all mandatory items are checked', () => {
      const checked: Record<string, boolean> = {};
      MOCK_AUTONOMOUS_CHECKLIST.forEach((item) => {
        checked[item.id] = true;
      });
      const result = evaluateAutonomousSafetyChecklist(checked, MOCK_AUTONOMOUS_CHECKLIST);
      expect(result.compliancePercent).toBe(100);
      expect(result.allMandatoryPassed).toBe(true);
      expect(result.isEligibleForPermit).toBe(true);
    });

    it('fails eligibility if mandatory items are missing', () => {
      const checked: Record<string, boolean> = {
        chk_steer_brake_redundancy: false, // Mandatory failed
      };
      const result = evaluateAutonomousSafetyChecklist(checked, MOCK_AUTONOMOUS_CHECKLIST);
      expect(result.allMandatoryPassed).toBe(false);
      expect(result.isEligibleForPermit).toBe(false);
      expect(result.missingMandatoryAz.length).toBeGreaterThan(0);
    });
  });

  describe('10-Question Theoretical Examination Simulator', () => {
    it('evaluates 100% score when all questions are correct', () => {
      const answers: Record<string, number> = {};
      MOCK_AUTONOMOUS_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = q.correctOptionIndex;
      });
      const exam = evaluateAutonomousExam(answers, MOCK_AUTONOMOUS_EXAM_QUESTIONS);
      expect(exam.scorePercent).toBe(100);
      expect(exam.isPassed).toBe(true);
      expect(exam.correctAnswersCount).toBe(MOCK_AUTONOMOUS_EXAM_QUESTIONS.length);
    });

    it('fails candidate if score is under 80%', () => {
      const answers: Record<string, number> = {};
      MOCK_AUTONOMOUS_EXAM_QUESTIONS.forEach((q, idx) => {
        // Answer wrong on majority of questions
        answers[q.id] = idx < 5 ? q.correctOptionIndex : (q.correctOptionIndex + 1) % 4;
      });
      const exam = evaluateAutonomousExam(answers, MOCK_AUTONOMOUS_EXAM_QUESTIONS);
      expect(exam.scorePercent).toBe(50);
      expect(exam.isPassed).toBe(false);
    });
  });

  describe('Official Electronic Permit Generator (AUTONOM-AZ-2026)', () => {
    it('generates compliant permit with SHA-256 seal and SIMA UID', () => {
      const corridor = MOCK_AUTONOMOUS_CORRIDORS_LIST[0];
      const permit = generateOfficialAutonomousPilotPermit(
        '99-AS-101',
        'VF3EZ10AUT0260012',
        'LEVEL_4_HIGH_AUTOMATION',
        corridor,
        'Baku Smart Mobility MMC',
        'Rəşad Quliyev',
        'SD-AYNA-2026-084',
        'EasyMile EZ10 Gen 3',
        35,
        'C_V2X_PC5_5_9GHZ',
        1670
      );

      expect(permit.permitId).toMatch(/^AUTONOM-AZ-2026-\d{5}$/);
      expect(permit.sha256SecurityChecksum).toBeDefined();
      expect(permit.simaDigitalUid).toContain('SIMA-AYNA-AUTONOM-');
      expect(permit.vehiclePlate).toBe('99-AS-101');
      expect(permit.corridorId).toBe('baku_white_city');
      expect(permit.maxApprovedSpeedKmh).toBe(35);
      expect(permit.dssadBlackBoxActive).toBe(true);
    });
  });
});
