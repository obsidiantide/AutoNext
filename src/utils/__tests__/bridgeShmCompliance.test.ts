import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  STRATEGIC_BRIDGES,
  BRIDGE_VEHICLE_CONFIGS,
  BRIDGE_SAFETY_CHECKLIST,
  BRIDGE_EXAM_QUESTIONS,
  evaluateStructuralHealth,
  calculateBridgeTransitFee,
  evaluateBridgeChecklist,
  evaluateBridgeExam,
  generateBridgeCertificate,
  BridgeTelemetryState,
} from '../bridgeShmCompliance';

describe('bridgeShmCompliance Utility Engine', () => {
  describe('Currency conversion and formatting', () => {
    it('converts AZN correctly to USD and EUR', () => {
      expect(convertAzn(100, 'AZN')).toBe(100);
      expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 1);
      expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 1);
    });

    it('formats currencies with proper symbols', () => {
      expect(formatCurrency(25, 'AZN')).toContain('₼');
      expect(formatCurrency(25, 'USD')).toContain('$');
      expect(formatCurrency(25, 'EUR')).toContain('€');
    });
  });

  describe('Strategic Bridges Database', () => {
    it('contains all 6 strategic bridges in Azerbaijan', () => {
      const bridgeKeys = Object.keys(STRATEGIC_BRIDGES);
      expect(bridgeKeys).toHaveLength(6);
      expect(bridgeKeys).toContain('BRIDGE_BAKU_BAY_OVERPASS');
      expect(bridgeKeys).toContain('BRIDGE_KOROGLU_INTERMODAL');
      expect(bridgeKeys).toContain('BRIDGE_KURA_RIVER_SALYAN');
      expect(bridgeKeys).toContain('BRIDGE_KHUDAFERIN_ARAZ');
      expect(bridgeKeys).toContain('BRIDGE_GANJA_CHAY_BYPASS');
      expect(bridgeKeys).toContain('BRIDGE_ZAFAR_DASHALTI_SHUSHA');
    });

    it('verifies cable-stayed bridge structural specs', () => {
      const bakuBay = STRATEGIC_BRIDGES.BRIDGE_BAKU_BAY_OVERPASS;
      expect(bakuBay.bridgeType).toBe('CABLE_STAYED');
      expect(bakuBay.cableStayCount).toBeGreaterThan(0);
      expect(bakuBay.fbgSensorCount).toBe(128);
      expect(bakuBay.maxPermissibleAxleLoadTonnes).toBe(11.5);
    });
  });

  describe('evaluateStructuralHealth', () => {
    const nominalTelemetry: BridgeTelemetryState = {
      microstrainFbg: 220,
      cableTensionKn: 1400,
      groundAccelerationGal: 3.5,
      deckModalFrequencyHz: 0.42,
      dynamicAmplificationFactor: 1.12,
      windSpeedMs: 10,
      jointExpansionDisplacementMm: 15,
      activeVehiclesOnSpan: 50,
    };

    it('returns STATUS_NOMINAL_GREEN for normal operating parameters', () => {
      const bridge = STRATEGIC_BRIDGES.BRIDGE_BAKU_BAY_OVERPASS;
      const evaluation = evaluateStructuralHealth(nominalTelemetry, bridge);

      expect(evaluation.alertStatus).toBe('STATUS_NOMINAL_GREEN');
      expect(evaluation.healthScorePercent).toBe(100);
      expect(evaluation.barrierClosed).toBe(false);
      expect(evaluation.recommendedSpeedKmH).toBe(90);
    });

    it('triggers STATUS_ADVISORY_AMBER on high wind or high strain warning', () => {
      const bridge = STRATEGIC_BRIDGES.BRIDGE_BAKU_BAY_OVERPASS;
      const telemetry: BridgeTelemetryState = {
        ...nominalTelemetry,
        windSpeedMs: 18.5, // > 15 m/s warning
      };
      const evaluation = evaluateStructuralHealth(telemetry, bridge);

      expect(evaluation.alertStatus).toBe('STATUS_ADVISORY_AMBER');
      expect(evaluation.recommendedSpeedKmH).toBe(60);
      expect(evaluation.barrierClosed).toBe(false);
    });

    it('triggers STATUS_RESTRICTED_ORANGE when multiple warnings coincide', () => {
      const bridge = STRATEGIC_BRIDGES.BRIDGE_BAKU_BAY_OVERPASS;
      const telemetry: BridgeTelemetryState = {
        ...nominalTelemetry,
        microstrainFbg: 480, // warning
        windSpeedMs: 19.0, // warning
      };
      const evaluation = evaluateStructuralHealth(telemetry, bridge);

      expect(evaluation.alertStatus).toBe('STATUS_RESTRICTED_ORANGE');
      expect(evaluation.recommendedSpeedKmH).toBe(40);
    });

    it('triggers STATUS_EMERGENCY_RED and closes barrier on critical earthquake or severe strain', () => {
      const bridge = STRATEGIC_BRIDGES.BRIDGE_BAKU_BAY_OVERPASS;
      const telemetry: BridgeTelemetryState = {
        ...nominalTelemetry,
        groundAccelerationGal: 62.0, // > 50 gal earthquake alert
      };
      const evaluation = evaluateStructuralHealth(telemetry, bridge);

      expect(evaluation.alertStatus).toBe('STATUS_EMERGENCY_RED');
      expect(evaluation.barrierClosed).toBe(true);
      expect(evaluation.recommendedSpeedKmH).toBe(0);
    });
  });

  describe('calculateBridgeTransitFee', () => {
    const bridge = STRATEGIC_BRIDGES.BRIDGE_BAKU_BAY_OVERPASS;

    it('charges zero base toll for passenger vehicles (Class 1)', () => {
      const result = calculateBridgeTransitFee(
        'CLASS_1_PASSENGER',
        2.2,
        2,
        1.2,
        bridge,
        'AZN'
      );
      expect(result.baseBridgeTollAzn).toBe(0);
      expect(result.totalFeeAzn).toBe(0);
      expect(result.transitPermitted).toBe(true);
      expect(result.isAxleOverloaded).toBe(false);
    });

    it('calculates proper base toll for 5-axle semi-trailer without overload', () => {
      const result = calculateBridgeTransitFee(
        'CLASS_5_SEMI_TRAILER',
        38.0,
        5,
        10.5,
        bridge,
        'AZN'
      );
      expect(result.baseBridgeTollAzn).toBe(20.0);
      expect(result.overweightPenaltyAzn).toBe(0);
      expect(result.totalFeeAzn).toBe(20.0);
      expect(result.transitPermitted).toBe(true);
    });

    it('applies overweight penalties and escort fees when exceeding legal axle load', () => {
      const result = calculateBridgeTransitFee(
        'CLASS_5_SEMI_TRAILER',
        43.0,
        5,
        13.2, // 13.2 - 11.5 = 1.7t excess per axle
        bridge,
        'AZN'
      );
      expect(result.isAxleOverloaded).toBe(true);
      expect(result.excessAxleTonnes).toBeCloseTo(1.7, 1);
      expect(result.overweightPenaltyAzn).toBeGreaterThan(0);
      expect(result.escortFeeAzn).toBe(50.0);
      expect(result.transitPermitted).toBe(true);
    });

    it('rejects transit when gross weight or axle load exceeds critical safety limit', () => {
      const result = calculateBridgeTransitFee(
        'CLASS_6_OVERSIZE_HEAVY',
        72.0, // > 65t critical limit
        7,
        16.0,
        bridge,
        'AZN'
      );
      expect(result.transitPermitted).toBe(false);
      expect(result.rejectionReasonAz).toBeDefined();
    });
  });

  describe('evaluateBridgeChecklist', () => {
    it('returns 100% and passed when all items are checked', () => {
      const allIds = BRIDGE_SAFETY_CHECKLIST.map((i) => i.id);
      const result = evaluateBridgeChecklist(allIds);

      expect(result.scorePercent).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.missingMandatoryCount).toBe(0);
    });

    it('fails if high severity mandatory items are missing', () => {
      // Exclude FBG strain and seismic accelerometer
      const someIds = BRIDGE_SAFETY_CHECKLIST.filter(
        (i) => i.criticalSeverity !== 'HIGH'
      ).map((i) => i.id);

      const result = evaluateBridgeChecklist(someIds);
      expect(result.passed).toBe(false);
      expect(result.missingMandatoryCount).toBeGreaterThan(0);
    });
  });

  describe('evaluateBridgeExam', () => {
    it('evaluates exam answers correctly and returns pass status', () => {
      const correctAnswers: Record<number, number> = {};
      BRIDGE_EXAM_QUESTIONS.forEach((q) => {
        correctAnswers[q.id] = q.correctOptionIndex;
      });

      const result = evaluateBridgeExam(correctAnswers);
      expect(result.totalQuestions).toBe(10);
      expect(result.correctAnswersCount).toBe(10);
      expect(result.scorePercent).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('returns fail status if score is under 80%', () => {
      const partialAnswers: Record<number, number> = {
        1: BRIDGE_EXAM_QUESTIONS[0].correctOptionIndex,
        2: 999, // wrong
      };

      const result = evaluateBridgeExam(partialAnswers);
      expect(result.passed).toBe(false);
      expect(result.scorePercent).toBeLessThan(80);
    });
  });

  describe('generateBridgeCertificate', () => {
    it('generates an official clearance certificate with valid SİMA signature and details', () => {
      const bridge = STRATEGIC_BRIDGES.BRIDGE_BAKU_BAY_OVERPASS;
      const evaluation = evaluateStructuralHealth(
        {
          microstrainFbg: 210,
          cableTensionKn: 1400,
          groundAccelerationGal: 3.0,
          deckModalFrequencyHz: 0.4,
          dynamicAmplificationFactor: 1.1,
          windSpeedMs: 10,
          jointExpansionDisplacementMm: 12,
          activeVehiclesOnSpan: 40,
        },
        bridge
      );

      const cert = generateBridgeCertificate(
        'BRIDGE_BAKU_BAY_OVERPASS',
        '99-TK-812',
        'CLASS_5_SEMI_TRAILER',
        38.5,
        10.5,
        evaluation
      );

      expect(cert.certificateNumber).toMatch(/^BRIDGE-SHM-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-TK-812');
      expect(cert.bridgeId).toBe('BRIDGE_BAKU_BAY_OVERPASS');
      expect(cert.complianceStatus).toBe('VERIFIED_ACTIVE');
      expect(cert.simaSignatureUid).toContain('SIMA-SHM-');
      expect(cert.qrCodeData).toContain('https://aayda.gov.az/shm/verify');
    });

    it('marks certificate as REVOKED_OVERLOAD if vehicle exceeds axle limit', () => {
      const bridge = STRATEGIC_BRIDGES.BRIDGE_BAKU_BAY_OVERPASS;
      const evaluation = evaluateStructuralHealth(
        {
          microstrainFbg: 210,
          cableTensionKn: 1400,
          groundAccelerationGal: 3.0,
          deckModalFrequencyHz: 0.4,
          dynamicAmplificationFactor: 1.1,
          windSpeedMs: 10,
          jointExpansionDisplacementMm: 12,
          activeVehiclesOnSpan: 40,
        },
        bridge
      );

      const cert = generateBridgeCertificate(
        'BRIDGE_BAKU_BAY_OVERPASS',
        '99-TK-812',
        'CLASS_5_SEMI_TRAILER',
        38.5,
        14.0, // Exceeds 11.5t
        evaluation
      );

      expect(cert.complianceStatus).toBe('REVOKED_OVERLOAD');
    });
  });
});
