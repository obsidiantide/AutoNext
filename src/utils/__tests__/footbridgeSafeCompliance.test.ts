import { describe, it, expect } from 'vitest';
import {
  convertFootbridgeCurrency,
  calculateFootbridgeTelemetry,
  generateFootbridgeHash,
  evaluateFootbridgeExam,
  STATUTORY_MIN_CLEARANCE_METERS,
} from '../footbridgeSafeCompliance';
import {
  MOCK_FOOTBRIDGE_EXAM_QUESTIONS,
  DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
} from '../../data/mockFootbridgeSafeData';

describe('footbridgeSafeCompliance Utility Suite', () => {
  describe('convertFootbridgeCurrency', () => {
    it('converts AZN correctly with 1:1 rate', () => {
      expect(convertFootbridgeCurrency(100, 'AZN')).toBe(100);
    });

    it('converts to USD correctly', () => {
      expect(convertFootbridgeCurrency(100, 'USD')).toBe(58.82);
    });

    it('converts to EUR correctly', () => {
      expect(convertFootbridgeCurrency(100, 'EUR')).toBe(54.05);
    });
  });

  describe('calculateFootbridgeTelemetry', () => {
    it('evaluates nominal conditions when pedestrian uses overpass bridge', () => {
      const result = calculateFootbridgeTelemetry(DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS);

      expect(result.verticalClearanceCompliance).toBe(true);
      expect(result.clearanceMarginMeters).toBeCloseTo(0.30, 2);
      expect(result.atGradeFatalityRiskPercent).toBe(0);
      expect(result.crossingSafetyScorePercent).toBe(99);
      expect(result.prmAccessibilityScorePercent).toBe(100);
      expect(result.stairIceRiskPercent).toBeGreaterThan(0); // ambient temp is 1°C
      expect(result.heatingPowerDemandKw).toBeGreaterThan(0);
      expect(result.footbridgeOperationalStatus).toBe('NOMINAL_SECURE_GRADE_SEPARATION');
      expect(result.statutoryFineAzn).toBe(0);
      expect(result.statutoryFineDiscountedAzn).toBe(0);
    });

    it('detects overheight clearance violation when clearance is less than 5.50m', () => {
      const inputs = {
        ...DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
        bridgeClearanceMeters: 5.20,
      };
      const result = calculateFootbridgeTelemetry(inputs);

      expect(result.verticalClearanceCompliance).toBe(false);
      expect(result.clearanceMarginMeters).toBeLessThan(0);
      expect(result.collisionRiskScorePercent).toBeGreaterThanOrEqual(50);
      expect(result.statutoryFineAzn).toBeGreaterThanOrEqual(150);
      expect(result.penaltyPoints).toBe(3);
    });

    it('calculates dangerous fatality risk and fines when pedestrian jaywalks at-grade', () => {
      const inputs = {
        ...DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
        crossViaOverpass: false,
        trafficSpeedKmh: 100,
        trafficFlowVehHour: 3000,
      };
      const result = calculateFootbridgeTelemetry(inputs);

      expect(result.atGradeFatalityRiskPercent).toBeGreaterThanOrEqual(60);
      expect(result.crossingSafetyScorePercent).toBeLessThan(40);
      expect(result.footbridgeOperationalStatus).toBe('CRITICAL_ILLEGAL_CROSSING_ALERT');
      expect(result.statutoryFineAzn).toBe(40); // İXM 338.3
      expect(result.statutoryFineDiscountedAzn).toBe(20);
    });

    it('calculates lower fine under İXM 338.1 when jaywalking at low traffic flow', () => {
      const inputs = {
        ...DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
        crossViaOverpass: false,
        trafficSpeedKmh: 40,
        trafficFlowVehHour: 600,
      };
      const result = calculateFootbridgeTelemetry(inputs);

      expect(result.atGradeFatalityRiskPercent).toBeLessThan(60);
      expect(result.statutoryFineAzn).toBe(20); // İXM 338.1
      expect(result.statutoryFineDiscountedAzn).toBe(10);
    });

    it('penalizes broken median fence under İXM 353.1 and Civil Code 1108', () => {
      const inputs = {
        ...DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
        medianFenceIntact: false,
      };
      const result = calculateFootbridgeTelemetry(inputs);

      expect(result.statutoryFineAzn).toBeGreaterThanOrEqual(600);
      expect(result.restitutionCostAzn).toBe(1200);
      expect(result.footbridgeOperationalStatus).toBe('CRITICAL_ILLEGAL_CROSSING_ALERT');
    });

    it('adjusts PRM score when elevator is congested or overloaded', () => {
      const overloadedInputs = {
        ...DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
        elevatorOccupantsKg: 1200,
      };
      const result = calculateFootbridgeTelemetry(overloadedInputs);
      expect(result.prmAccessibilityScorePercent).toBeLessThan(90);

      const congestedInputs = {
        ...DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
        elevatorOccupantsKg: 850,
      };
      const congestedResult = calculateFootbridgeTelemetry(congestedInputs);
      expect(congestedResult.prmAccessibilityScorePercent).toBe(85);
    });

    it('disables heating and reports zero ice risk in warm weather (> 3°C)', () => {
      const warmInputs = {
        ...DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
        ambientTemperatureC: 18,
      };
      const result = calculateFootbridgeTelemetry(warmInputs);
      expect(result.heatingPowerDemandKw).toBe(0);
      expect(result.stairIceRiskPercent).toBe(0);
    });

    it('triggers wind restriction advisory under severe Caspian Khazri gusts (>= 110 km/h)', () => {
      const windyInputs = {
        ...DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
        windGustSpeedKmh: 120,
      };
      const result = calculateFootbridgeTelemetry(windyInputs);
      expect(result.footbridgeOperationalStatus).toBe('WIND_RESTRICTION_ADVISORY');
      expect(result.windVibrationDampingPercent).toBeLessThan(90);
    });
  });

  describe('generateFootbridgeHash', () => {
    it('creates formatted sha256 checksum string with fb- prefix', () => {
      const hash = generateFootbridgeHash('FOOTBRIDGE-TEST-001');
      expect(hash).toMatch(/^sha256:fb-[a-f0-9]{8}-9a4b-[a-f0-9]+$/);
    });
  });

  describe('evaluateFootbridgeExam', () => {
    it('passes exam when all questions answered correctly', () => {
      const perfectAnswers: Record<string, number> = {};
      MOCK_FOOTBRIDGE_EXAM_QUESTIONS.forEach((q) => {
        perfectAnswers[q.id] = q.correctOptionIndex;
      });

      const outcome = evaluateFootbridgeExam(perfectAnswers, MOCK_FOOTBRIDGE_EXAM_QUESTIONS);
      expect(outcome.passed).toBe(true);
      expect(outcome.scorePercent).toBe(100);
      expect(outcome.correctCount).toBe(MOCK_FOOTBRIDGE_EXAM_QUESTIONS.length);
    });

    it('fails exam when less than 80% correct', () => {
      const poorAnswers: Record<string, number> = {};
      MOCK_FOOTBRIDGE_EXAM_QUESTIONS.forEach((q, idx) => {
        // wrong answer on most
        poorAnswers[q.id] = (q.correctOptionIndex + 1) % 4;
      });

      const outcome = evaluateFootbridgeExam(poorAnswers, MOCK_FOOTBRIDGE_EXAM_QUESTIONS);
      expect(outcome.passed).toBe(false);
      expect(outcome.scorePercent).toBeLessThan(80);
    });
  });
});
