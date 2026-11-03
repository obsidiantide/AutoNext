import { describe, it, expect } from 'vitest';
import {
  convertRampCurrency,
  calculateAlineaRate,
  calculateMergePhysics,
  evaluateStatutorySanctions,
  generateRampCertificate,
} from '../rampSafeCompliance';
import { MOCK_RAMP_STATIONS } from '../../data/mockRampSafeData';

describe('rampSafeCompliance Utility Tests', () => {
  describe('convertRampCurrency', () => {
    it('converts AZN to AZN, USD, EUR correctly', () => {
      expect(convertRampCurrency(100, 'AZN')).toBe(100);
      expect(convertRampCurrency(100, 'USD')).toBe(58.82);
      expect(convertRampCurrency(100, 'EUR')).toBe(54.05);
    });
  });

  describe('calculateAlineaRate', () => {
    it('computes standard ALINEA feedback metering rate within bounds', () => {
      // target = 18.5, downstream = 18.5, delta = 0 -> rate remains prevRate (600)
      const res = calculateAlineaRate({
        downstreamOccupancyPercent: 18.5,
        targetOccupancyPercent: 18.5,
        previousRateVehPerHour: 600,
        rampQueueOccupancyPercent: 30,
      });

      expect(res.meteringRateVehPerHour).toBe(600);
      expect(res.queueOverrideActive).toBe(false);
      expect(res.cycleLengthSeconds).toBe(6); // 3600 / 600 = 6s
      expect(res.greenSeconds).toBe(2.0);
      expect(res.amberSeconds).toBe(1.0);
      expect(res.redSeconds).toBe(3.0);
      expect(res.mainlineLevelOfService).toBe('C');
    });

    it('clamps rate between min (200) and max (1200 for 1 lane)', () => {
      // Extremely congested downstream (delta is huge negative)
      const resLow = calculateAlineaRate({
        downstreamOccupancyPercent: 35,
        targetOccupancyPercent: 18,
        previousRateVehPerHour: 300,
        rampQueueOccupancyPercent: 20,
      });
      expect(resLow.meteringRateVehPerHour).toBe(200);

      // Completely empty downstream (delta is huge positive)
      const resHigh = calculateAlineaRate({
        downstreamOccupancyPercent: 5,
        targetOccupancyPercent: 20,
        previousRateVehPerHour: 1000,
        rampQueueOccupancyPercent: 20,
      });
      expect(resHigh.meteringRateVehPerHour).toBe(1200);
    });

    it('triggers queue override when ramp queue occupancy >= 80%', () => {
      const res = calculateAlineaRate({
        downstreamOccupancyPercent: 30, // heavy congestion
        targetOccupancyPercent: 18.5,
        previousRateVehPerHour: 400,
        rampQueueOccupancyPercent: 85, // queue spillback!
      });

      expect(res.queueOverrideActive).toBe(true);
      expect(res.meteringMode).toBe('QUEUE_FLUSH_OVERRIDE');
      expect(res.meteringRateVehPerHour).toBeGreaterThanOrEqual(900);
    });

    it('sets free flow mode when downstream occupancy < 12% and queue is low', () => {
      const res = calculateAlineaRate({
        downstreamOccupancyPercent: 10,
        targetOccupancyPercent: 18.5,
        previousRateVehPerHour: 800,
        rampQueueOccupancyPercent: 25,
      });

      expect(res.meteringMode).toBe('OFF_FREE_FLOW');
      expect(res.redSeconds).toBe(0);
      expect(res.mainlineLevelOfService).toBe('A');
    });

    it('supports two-car-per-green mode with 4.0s green phase', () => {
      const res = calculateAlineaRate({
        downstreamOccupancyPercent: 17,
        preferredMode: 'TWO_CAR_PER_GREEN',
        rampQueueOccupancyPercent: 40,
      });

      expect(res.greenSeconds).toBe(4.0);
      expect(res.meteringMode).toBe('TWO_CAR_PER_GREEN');
    });

    it('accurately identifies Level of Service (A through F)', () => {
      expect(calculateAlineaRate({ downstreamOccupancyPercent: 8 }).mainlineLevelOfService).toBe('A');
      expect(calculateAlineaRate({ downstreamOccupancyPercent: 13 }).mainlineLevelOfService).toBe('B');
      expect(calculateAlineaRate({ downstreamOccupancyPercent: 18 }).mainlineLevelOfService).toBe('C');
      expect(calculateAlineaRate({ downstreamOccupancyPercent: 24 }).mainlineLevelOfService).toBe('D');
      expect(calculateAlineaRate({ downstreamOccupancyPercent: 30 }).mainlineLevelOfService).toBe('E');
      expect(calculateAlineaRate({ downstreamOccupancyPercent: 35 }).mainlineLevelOfService).toBe('F');
    });
  });

  describe('calculateMergePhysics', () => {
    it('calculates required merge taper length and optimal safety ratio', () => {
      const res = calculateMergePhysics({
        mainlineSpeedKmH: 90,
        rampReleaseSpeedKmH: 50,
        accelerationRateMS2: 2.4,
        actualTaperLengthMeters: 220,
        mainlineFlowVehPerHour: 3800,
      });

      expect(res.requiredTaperLengthMeters).toBeGreaterThan(50);
      expect(res.taperSafetyRatio).toBeGreaterThan(1.0);
      expect(res.taperStatus).toBe('OPTIMAL');
      expect(res.criticalMergeGapSeconds).toBeGreaterThan(3.5);
      expect(res.mergeCollisionProbabilityPercent).toBeGreaterThanOrEqual(0);
      expect(res.mergeCollisionProbabilityPercent).toBeLessThanOrEqual(100);
    });

    it('identifies hazardous short taper when actual length is insufficient', () => {
      const res = calculateMergePhysics({
        mainlineSpeedKmH: 110,
        rampReleaseSpeedKmH: 40,
        accelerationRateMS2: 0.9, // heavy truck
        actualTaperLengthMeters: 100, // very short
        mainlineFlowVehPerHour: 4500,
      });

      expect(res.taperSafetyRatio).toBeLessThan(0.85);
      expect(res.taperStatus).toBe('HAZARDOUS_SHORT');
    });
  });

  describe('evaluateStatutorySanctions', () => {
    it('calculates red light running fine under İXM 327.2', () => {
      const san = evaluateStatutorySanctions('RED_LIGHT_RUNNING', 'AZN');
      expect(san.violationCode).toBe('IXM_327_2_RAMP_RED');
      expect(san.fineAmountAzn).toBe(80);
      expect(san.penaltyPoints).toBe(3);
      expect(san.discountedFineAzn).toBe(40);
    });

    it('calculates failure to yield right-of-way under İXM 327.1', () => {
      const san = evaluateStatutorySanctions('FAILURE_TO_YIELD', 'AZN');
      expect(san.violationCode).toBe('IXM_327_1_MERGE_YIELD');
      expect(san.fineAmountAzn).toBe(40);
      expect(san.penaltyPoints).toBe(0);
      expect(san.discountedFineAzn).toBe(20);
    });

    it('calculates ramp speeding fine under İXM 328.2', () => {
      const san = evaluateStatutorySanctions('RAMP_SPEEDING', 'AZN');
      expect(san.violationCode).toBe('IXM_328_2_RAMP_SPEED');
      expect(san.fineAmountAzn).toBe(50);
      expect(san.penaltyPoints).toBe(2);
      expect(san.discountedFineAzn).toBe(25);
    });

    it('calculates illegal taper stopping fine under İXM 327.4', () => {
      const san = evaluateStatutorySanctions('ILLEGAL_TAPER_STOPPING', 'USD');
      expect(san.violationCode).toBe('IXM_327_4_TAPER_STOPPING');
      expect(san.fineAmountAzn).toBe(100);
      expect(san.fineAmountConverted).toBe(58.82);
      expect(san.penaltyPoints).toBe(4);
      expect(san.discountedFineConverted).toBe(29.41);
    });

    it('returns compliant 0 AZN for NONE violation', () => {
      const san = evaluateStatutorySanctions('NONE');
      expect(san.fineAmountAzn).toBe(0);
      expect(san.penaltyPoints).toBe(0);
      expect(san.discountedFineAzn).toBe(0);
    });
  });

  describe('generateRampCertificate', () => {
    it('creates authentic RAMP-SAFE certificate with cryptographic hashes', () => {
      const station = MOCK_RAMP_STATIONS[0];
      const cert = generateRampCertificate({
        vehiclePlate: '99-RP-101',
        vehicleModel: 'Mercedes E300',
        station,
        meteringRate: 720,
        cycleTimeSec: 5.0,
        greenTimeSec: 2.0,
        levelOfService: 'B',
        taperSafetyRatio: 1.25,
      });

      expect(cert.certificateNumber).toMatch(/^RAMP-SAFE-AZ-2026-[0-9A-F]{5}$/);
      expect(cert.simaSignatureUid).toContain('SIMA-RAMP-AZ-');
      expect(cert.sha256Hash).toHaveLength(64);
      expect(cert.vehiclePlate).toBe('99-RP-101');
      expect(cert.status).toBe('AUTHORIZED_CLEARED');
    });

    it('marks restricted or advisory status for poor LOS or hazardous taper', () => {
      const station = MOCK_RAMP_STATIONS[0];
      const certRestricted = generateRampCertificate({
        vehiclePlate: '77-RP-303',
        vehicleModel: 'KamAZ',
        station,
        meteringRate: 200,
        cycleTimeSec: 18.0,
        greenTimeSec: 2.0,
        levelOfService: 'F',
        taperSafetyRatio: 0.7,
      });

      expect(certRestricted.status).toBe('RESTRICTED');
    });
  });
});
