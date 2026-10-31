import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  evaluateMicromobilityTelemetry,
  calculateMicromobilityTariff,
  evaluateMicromobilityChecklist,
  evaluateMicromobilityExam,
  generateMicromobilityCertificate,
  TelemetryState,
  TariffCalculationInput,
  MICROMOBILITY_SAFETY_CHECKLIST,
  MICROMOBILITY_EXAM_QUESTIONS,
  STRATEGIC_CORRIDORS,
  GEOFENCE_ZONE_DEFINITIONS,
  MICROMOBILITY_VEHICLE_CONFIGS,
} from '../micromobilityCompliance';

describe('micromobilityCompliance utility functions', () => {
  it('formats currency correctly for AZN, USD, and EUR', () => {
    expect(formatCurrency(10, 'AZN')).toBe('10.00 ₼');
    expect(formatCurrency(10, 'USD')).toBe('5.88 $');
    expect(formatCurrency(10, 'EUR')).toBe('5.40 €');
  });

  describe('evaluateMicromobilityTelemetry', () => {
    it('evaluates safe and compliant transit in green zone', () => {
      const state: TelemetryState = {
        currentSpeedKmh: 18,
        batterySocPercent: 85,
        batteryTempCelsius: 24,
        geofenceZone: 'green',
        helmetDetected: true,
        tandemRidingDetected: false,
        surfaceVibrationG: 0.5,
        brakingPowerPercent: 0,
        regenerativeHarvestingWatts: 30,
        distanceTraveledKm: 3.5,
      };

      const result = evaluateMicromobilityTelemetry(state);
      expect(result.governedSpeedKmh).toBe(18);
      expect(result.isThrottleCutoff).toBe(false);
      expect(result.isSpeedingViolation).toBe(false);
      expect(result.isHelmetViolation).toBe(false);
      expect(result.isTandemViolation).toBe(false);
      expect(result.fineAmountAzn).toBe(0);
      expect(result.penaltyPoints).toBe(0);
      expect(result.badgeVariant).toBe('success');
    });

    it('enforces throttle cutoff in red no-ride prohibited zone', () => {
      const state: TelemetryState = {
        currentSpeedKmh: 15,
        batterySocPercent: 70,
        batteryTempCelsius: 25,
        geofenceZone: 'red',
        helmetDetected: true,
        tandemRidingDetected: false,
        surfaceVibrationG: 0.4,
        brakingPowerPercent: 0,
        regenerativeHarvestingWatts: 0,
        distanceTraveledKm: 1.2,
      };

      const result = evaluateMicromobilityTelemetry(state);
      expect(result.governedSpeedKmh).toBe(0);
      expect(result.isThrottleCutoff).toBe(true);
      expect(result.fineAmountAzn).toBeGreaterThanOrEqual(50);
      expect(result.penaltyPoints).toBeGreaterThanOrEqual(2);
      expect(result.badgeVariant).toBe('danger');
    });

    it('governs speed in yellow high-pedestrian density zone', () => {
      const state: TelemetryState = {
        currentSpeedKmh: 18,
        batterySocPercent: 80,
        batteryTempCelsius: 24,
        geofenceZone: 'yellow',
        helmetDetected: true,
        tandemRidingDetected: false,
        surfaceVibrationG: 0.6,
        brakingPowerPercent: 10,
        regenerativeHarvestingWatts: 20,
        distanceTraveledKm: 2.0,
      };

      const result = evaluateMicromobilityTelemetry(state);
      expect(result.governedSpeedKmh).toBe(12);
      expect(result.isThrottleCutoff).toBe(false);
      expect(result.isSpeedingViolation).toBe(true);
      expect(result.fineAmountAzn).toBeGreaterThan(0);
    });

    it('penalizes tandem riding and missing helmet violations', () => {
      const state: TelemetryState = {
        currentSpeedKmh: 14,
        batterySocPercent: 10, // low battery
        batteryTempCelsius: 29,
        geofenceZone: 'green',
        helmetDetected: false,
        tandemRidingDetected: true,
        surfaceVibrationG: 2.2, // rough surface
        brakingPowerPercent: 0,
        regenerativeHarvestingWatts: 0,
        distanceTraveledKm: 4.1,
      };

      const result = evaluateMicromobilityTelemetry(state);
      expect(result.isHelmetViolation).toBe(true);
      expect(result.isTandemViolation).toBe(true);
      expect(result.isBatteryLowWarning).toBe(true);
      expect(result.isRoughSurfaceWarning).toBe(true);
      expect(result.fineAmountAzn).toBe(50); // 20 helmet + 30 tandem
      expect(result.badgeVariant).toBe('danger');
    });
  });

  describe('calculateMicromobilityTariff', () => {
    it('calculates standard rental tariff without discounts', () => {
      const input: TariffCalculationInput = {
        category: 'shared_fleet_scooter',
        corridorId: 'boulevard_seaside',
        durationMinutes: 20,
        distanceKm: 4.0,
        hasStudentDiscount: false,
        hasBakuCardTransitTransfer: false,
        includeHelmetRental: false,
      };

      const res = calculateMicromobilityTariff(input);
      expect(res.baseUnlockFeeAzn).toBe(0.8);
      expect(res.rideMinuteFeeAzn).toBe(3.6); // 20 * 0.18
      expect(res.helmetRentalFeeAzn).toBe(0);
      expect(res.grossTotalAzn).toBe(4.4);
      expect(res.netPayableAzn).toBe(4.4);
      expect(res.co2EmissionsSavedGrams).toBe(460); // 4 * 115
      expect(res.equivalentFuelSavedLitres).toBe(0.3); // 4 * 0.075
    });

    it('applies student discount and BakuCard transfer perk', () => {
      const input: TariffCalculationInput = {
        category: 'shared_fleet_scooter',
        corridorId: 'academic_university_hub',
        durationMinutes: 30,
        distanceKm: 5.0,
        hasStudentDiscount: true,
        hasBakuCardTransitTransfer: true,
        includeHelmetRental: true,
      };

      const res = calculateMicromobilityTariff(input);
      expect(res.baseUnlockFeeAzn).toBe(0.8);
      expect(res.rideMinuteFeeAzn).toBe(5.4); // 30 * 0.18
      expect(res.helmetRentalFeeAzn).toBe(0.3);
      expect(res.grossTotalAzn).toBe(6.5);
      expect(res.studentDiscountAmountAzn).toBeGreaterThan(0);
      expect(res.bakuCardDiscountAmountAzn).toBeGreaterThan(0);
      expect(res.netPayableAzn).toBeLessThan(res.grossTotalAzn);
    });
  });

  describe('evaluateMicromobilityChecklist', () => {
    it('approves candidate when all items are verified', () => {
      const allIds = MICROMOBILITY_SAFETY_CHECKLIST.map((i) => i.id);
      const res = evaluateMicromobilityChecklist(allIds);
      expect(res.scorePercent).toBe(100);
      expect(res.isEligible).toBe(true);
      expect(res.mandatoryFailedCount).toBe(0);
    });

    it('rejects candidate when mandatory items fail', () => {
      const partial = [MICROMOBILITY_SAFETY_CHECKLIST[0].id];
      const res = evaluateMicromobilityChecklist(partial);
      expect(res.scorePercent).toBeLessThan(80);
      expect(res.isEligible).toBe(false);
      expect(res.mandatoryFailedCount).toBeGreaterThan(0);
    });
  });

  describe('evaluateMicromobilityExam', () => {
    it('evaluates 100% correct answers as passed', () => {
      const perfectAnswers: Record<number, number> = {};
      MICROMOBILITY_EXAM_QUESTIONS.forEach((q) => {
        perfectAnswers[q.id] = q.correctIndex;
      });

      const res = evaluateMicromobilityExam(perfectAnswers);
      expect(res.scorePercent).toBe(100);
      expect(res.passed).toBe(true);
      expect(res.correctCount).toBe(10);
      expect(res.incorrectQuestionIds).toHaveLength(0);
    });

    it('identifies incorrect answers and fails below 80%', () => {
      const lowAnswers: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
      };

      const res = evaluateMicromobilityExam(lowAnswers);
      expect(res.scorePercent).toBeLessThan(80);
      expect(res.passed).toBe(false);
    });
  });

  describe('generateMicromobilityCertificate', () => {
    it('generates a valid certificate with cryptographic checksum and SIMA UID', () => {
      const cert = generateMicromobilityCertificate({
        riderFullName: 'Orxan Əliyev',
        riderFin: '9ABC12D',
        vehicleCategory: 'e_scooter',
        vehicleSerialNumber: 'SCOOT-BAKU-2026-001',
      });

      expect(cert.certificateNumber).toMatch(/^MICROMOBILITY-BAKU-AZ-2026-\d{5}$/);
      expect(cert.riderFullName).toBe('Orxan Əliyev');
      expect(cert.riderFin).toBe('9ABC12D');
      expect(cert.simaDigitalUid).toContain('SIMA-AYNA-');
      expect(cert.sha256Digest).toContain('sha256-');
      expect(cert.allowedMaxSpeedKmh).toBe(20);
      expect(cert.qrPayload).toContain(cert.certificateNumber);
    });
  });

  describe('Constants integrity', () => {
    it('contains all 6 strategic corridors', () => {
      expect(Object.keys(STRATEGIC_CORRIDORS)).toHaveLength(6);
      expect(STRATEGIC_CORRIDORS.boulevard_seaside.lengthKm).toBe(15.2);
    });

    it('contains all 4 geofence zone definitions', () => {
      expect(GEOFENCE_ZONE_DEFINITIONS.green.speedLimitKmh).toBe(20);
      expect(GEOFENCE_ZONE_DEFINITIONS.yellow.speedLimitKmh).toBe(12);
      expect(GEOFENCE_ZONE_DEFINITIONS.red.speedLimitKmh).toBe(0);
      expect(GEOFENCE_ZONE_DEFINITIONS.purple.speedLimitKmh).toBe(5);
    });

    it('contains all 5 micromobility vehicle configurations', () => {
      expect(Object.keys(MICROMOBILITY_VEHICLE_CONFIGS)).toHaveLength(5);
    });
  });
});
