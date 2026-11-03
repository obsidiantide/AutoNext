import { describe, it, expect } from 'vitest';
import {
  convertRwisCurrency,
  calculateDewPoint,
  calculateFreezingPointDepression,
  evaluateBlackIceRisk,
  calculateFrictionCoefficient,
  calculateStoppingDistance,
  evaluateFastAntiIcingSpray,
  evaluateStatutorySanctions,
  calculateAdvisorySpeedLimit,
  generateRwisCertificate,
} from '../rwisSafeCompliance';

describe('rwisSafeCompliance Utility Suite', () => {
  describe('convertRwisCurrency', () => {
    it('accurately converts AZN to USD and EUR', () => {
      expect(convertRwisCurrency(100, 'AZN')).toBe(100);
      expect(convertRwisCurrency(100, 'USD')).toBe(58.82);
      expect(convertRwisCurrency(100, 'EUR')).toBe(54.05);
    });
  });

  describe('calculateDewPoint', () => {
    it('computes dew point with Magnus-Tetens formula', () => {
      // At 10°C and 80% RH, dew point is roughly 6.7°C
      const dp1 = calculateDewPoint(10, 80);
      expect(dp1).toBeCloseTo(6.7, 0.5);

      // At -2°C and 90% RH, dew point is roughly -3.4°C
      const dp2 = calculateDewPoint(-2, 90);
      expect(dp2).toBeLessThan(-2);
      expect(dp2).toBeGreaterThan(-5);
    });
  });

  describe('calculateFreezingPointDepression', () => {
    it('returns 0 for zero chemical residual', () => {
      expect(calculateFreezingPointDepression(0)).toBe(0);
    });

    it('calculates eutectic freezing point depression for chemical de-icer', () => {
      const dep10 = calculateFreezingPointDepression(10);
      expect(dep10).toBe(-3.5);

      const dep40 = calculateFreezingPointDepression(40);
      expect(dep40).toBe(-14.0);
    });
  });

  describe('evaluateBlackIceRisk', () => {
    it('identifies critical black ice condition when surface is freezing and freezing rain occurs', () => {
      const evaluation = evaluateBlackIceRisk(-3.0, -2.5, 'BLACK_ICE', 'FREEZING_RAIN', 2);
      expect(evaluation.riskScore).toBeGreaterThanOrEqual(75);
      expect(evaluation.riskLevel).toBe('CRITICAL_BLACK_ICE');
      expect(evaluation.isBlackIceLikely).toBe(true);
    });

    it('identifies low/none risk in warm dry conditions with high chemical residual', () => {
      const evaluation = evaluateBlackIceRisk(8.0, 3.0, 'DRY', 'NONE', 25);
      expect(evaluation.riskScore).toBeLessThan(20);
      expect(evaluation.isBlackIceLikely).toBe(false);
    });
  });

  describe('calculateFrictionCoefficient', () => {
    it('computes high friction for dry asphalt and degrades drastically on black ice', () => {
      const drySummer = calculateFrictionCoefficient('DRY', 'SUMMER', 0, 0);
      expect(drySummer.frictionMu).toBeGreaterThanOrEqual(0.80);
      expect(drySummer.gripQuality).toBe('OPTIMAL');

      const iceSummer = calculateFrictionCoefficient('BLACK_ICE', 'SUMMER', 0.5, 0);
      expect(iceSummer.frictionMu).toBeLessThanOrEqual(0.12);
      expect(iceSummer.gripQuality).toBe('EXTREMELY_HAZARDOUS');
      expect(iceSummer.stoppingDistanceMultiplier).toBeGreaterThan(6.0);
    });

    it('rewards winter studded tyres and chemical brine presence on ice', () => {
      const iceStudded = calculateFrictionCoefficient('BLACK_ICE', 'WINTER_STUDDED_CHAINS', 0.5, 20);
      expect(iceStudded.frictionMu).toBeGreaterThan(0.25);
    });
  });

  describe('calculateStoppingDistance', () => {
    it('calculates reaction, braking, and total stopping distances', () => {
      // 90 km/h = 25 m/s. Reaction at 1.2s = 30m. Braking at mu = 0.82 ~ 38.9m. Total ~ 68.9m
      const dryResult = calculateStoppingDistance(90, 0.82, 1.2);
      expect(dryResult.speedMps).toBe(25);
      expect(dryResult.reactionDistanceM).toBe(30);
      expect(dryResult.brakingDistanceM).toBeCloseTo(38.9, 1);
      expect(dryResult.totalStoppingDistanceM).toBeCloseTo(68.9, 1);
      expect(dryResult.safeFollowingDistanceM).toBeGreaterThan(dryResult.totalStoppingDistanceM);

      // On black ice mu = 0.12, braking distance jumps to ~ 265m!
      const iceResult = calculateStoppingDistance(90, 0.12, 1.2);
      expect(iceResult.brakingDistanceM).toBeGreaterThan(250);
    });
  });

  describe('evaluateFastAntiIcingSpray', () => {
    it('recommends refill when tank level is critical', () => {
      const res = evaluateFastAntiIcingSpray(90, 'BLACK_ICE', -4, 3);
      expect(res.systemStatus).toBe('RELOAD_REQUIRED');
      expect(res.sprayRecommended).toBe(false);
    });

    it('activates high pressure active spraying on black ice', () => {
      const res = evaluateFastAntiIcingSpray(85, 'BLACK_ICE', -4, 80);
      expect(res.systemStatus).toBe('ACTIVE_SPRAYING');
      expect(res.sprayRecommended).toBe(true);
      expect(res.dosageMlPerM2).toBe(35);
      expect(res.nozzlePressureBar).toBe(6.5);
    });

    it('arms preventive mode during moderate frost conditions', () => {
      const res = evaluateFastAntiIcingSpray(45, 'DAMP', -1, 80);
      expect(res.systemStatus).toBe('ARMED');
      expect(res.sprayRecommended).toBe(true);
      expect(res.dosageMlPerM2).toBe(12);
    });

    it('remains on standby in nominal weather', () => {
      const res = evaluateFastAntiIcingSpray(10, 'DRY', 8, 80);
      expect(res.systemStatus).toBe('STANDBY');
      expect(res.sprayRecommended).toBe(false);
    });
  });

  describe('evaluateStatutorySanctions', () => {
    it('applies sanctions for summer tyre on icy road under İXM 342.2.2', () => {
      const result = evaluateStatutorySanctions('SUMMER', 2.5, 40, 40, 'BLACK_ICE', false);
      expect(result.totalFineAzn).toBe(50);
      expect(result.discountedFineAzn).toBe(25); // 50% discount under İXM Article 38
      expect(result.violations[0].article).toContain('342.2.2');
    });

    it('applies speeding sanctions under İXM 328 and snowplow obstruction under İXM 327.2', () => {
      const result = evaluateStatutorySanctions('WINTER_STUDLESS', 6.0, 95, 50, 'BLACK_ICE', true);
      // Speed excess = 45 km/h -> 100 AZN + 3 points (İXM 328.3)
      // Snowplow obstruction -> 80 AZN + 3 points (İXM 327.2)
      // Total = 180 AZN, discounted = 90 AZN, 6 points
      expect(result.totalFineAzn).toBe(180);
      expect(result.discountedFineAzn).toBe(90);
      expect(result.totalDemeritPoints).toBe(6);
      expect(result.violations.length).toBe(2);
    });
  });

  describe('calculateAdvisorySpeedLimit', () => {
    it('reduces speed to 40 km/h on black ice and 50 km/h on packed snow', () => {
      expect(calculateAdvisorySpeedLimit('BLACK_ICE', 0.12, 110)).toBe(40);
      expect(calculateAdvisorySpeedLimit('SNOW_PACKED', 0.25, 110)).toBe(50);
      expect(calculateAdvisorySpeedLimit('WET', 0.50, 110)).toBe(80);
      expect(calculateAdvisorySpeedLimit('DRY', 0.82, 110)).toBe(110);
    });
  });

  describe('generateRwisCertificate', () => {
    it('generates an official cryptographic clearance certificate', () => {
      const cert = generateRwisCertificate({
        stationCode: 'M4-RWIS-132',
        stationName: 'M-4 Şamaxı - Ağsu Aşırımı',
        corridor: 'M-4 Bakı - Şamaxı',
        picketKm: 'Km 132+400',
        vehiclePlate: '99-WI-101',
        vehicleModel: 'Mercedes-Benz G 400d',
        tyreType: 'WINTER_STUDDED_CHAINS',
        surfaceCondition: 'BLACK_ICE',
        surfaceTempC: -3.8,
        dewPointC: -3.2,
        frictionMu: 0.25,
        stoppingDistanceMeters: 58.2,
        advisorySpeedLimitKmh: 40,
        blackIceRiskLevel: 'CRITICAL_BLACK_ICE',
        fastSystemTriggered: true,
      });

      expect(cert.certificateId).toMatch(/^RWIS-SAFE-AZ-2026-\d{5}$/);
      expect(cert.simaDigitalUid).toContain('SIMA-AAYDA-RWIS-2026-');
      expect(cert.verificationPin.length).toBe(4);
      expect(cert.sha256Hash).toContain('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b78');
      expect(cert.status).toBe('ACTIVE');
    });
  });
});
