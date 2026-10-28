import { describe, it, expect } from 'vitest';
import {
  calculateTenderScore,
  calculateRouteEconomics,
  evaluateLiveTelemetry,
  calculateMobilityChecklistScore,
  evaluateMobilityExam,
  generateIntercityMobilityCertificate,
  convertAzn,
  formatCurrency,
  BUS_CATEGORIES,
  INTERCITY_ROUTES,
  TenderInputs,
  LiveTelemetryInputs,
} from '../intercityMobilityCompliance';
import {
  MOCK_MOBILITY_CHECKLIST_ITEMS,
  MOCK_MOBILITY_EXAM_QUESTIONS,
} from '../../data/mockIntercityMobilityData';

describe('intercityMobilityCompliance', () => {
  describe('currency converters & formatters', () => {
    it('converts AZN to USD and EUR correctly', () => {
      expect(convertAzn(100, 'AZN')).toBe(100);
      expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 1);
      expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 1);
    });

    it('formats currency with appropriate symbols', () => {
      expect(formatCurrency(100, 'AZN')).toContain('₼');
      expect(formatCurrency(100, 'USD')).toContain('$');
      expect(formatCurrency(100, 'EUR')).toContain('€');
    });
  });

  describe('calculateTenderScore', () => {
    it('calculates full 100 points for top-tier zero-emission fleet with complete equipment', () => {
      const inputs: TenderInputs = {
        fleetAverageAgeYears: 1,
        euroStandard: 'ELECTRIC_ZERO',
        hasWheelchairAccessibility: true,
        hasAynaGpsAndTachograph: true,
        hasAynaBiletimIntegration: true,
        hasClimateAndCctv: true,
        busCategory: 'ELECTRIC_COACH_ZERO_EMISSION',
        routeCode: 'AZ_ROUTE_101_GANJA',
        fleetVehicleCount: 10,
        seatCapacityPerBus: 50,
      };

      const result = calculateTenderScore(inputs);
      expect(result.ageScore).toBe(20);
      expect(result.emissionScore).toBe(20);
      expect(result.accessibilityScore).toBe(15);
      expect(result.telemetryScore).toBe(15);
      expect(result.biletimScore).toBe(15);
      expect(result.comfortScore).toBe(15);
      expect(result.totalScore).toBe(100);
      expect(result.grade).toBe('A');
      expect(result.status).toBe('QUALIFIED');
      expect(result.feedbackAz.length).toBe(0);
    });

    it('calculates partial score and Grade B for Euro 5 regional bus', () => {
      const inputs: TenderInputs = {
        fleetAverageAgeYears: 4,
        euroStandard: 'EURO_5',
        hasWheelchairAccessibility: true,
        hasAynaGpsAndTachograph: true,
        hasAynaBiletimIntegration: true,
        hasClimateAndCctv: false,
        busCategory: 'REGIONAL_BUS_CLASS_II',
        routeCode: 'AZ_ROUTE_508_SHEKI',
        fleetVehicleCount: 6,
        seatCapacityPerBus: 35,
      };

      const result = calculateTenderScore(inputs);
      expect(result.ageScore).toBe(16);
      expect(result.emissionScore).toBe(14);
      expect(result.comfortScore).toBe(0);
      expect(result.totalScore).toBe(75);
      expect(result.grade).toBe('B');
      expect(result.status).toBe('QUALIFIED');
      expect(result.feedbackAz).toContain(
        'Sərnişin salonu üçün ikizonalı klimat-kontrol və 360° videomüşahidə kamerası tələb olunur.'
      );
    });

    it('disqualifies old fleet with low emission standard and missing accessibility', () => {
      const inputs: TenderInputs = {
        fleetAverageAgeYears: 12,
        euroStandard: 'EURO_3_BELOW',
        hasWheelchairAccessibility: false,
        hasAynaGpsAndTachograph: false,
        hasAynaBiletimIntegration: false,
        hasClimateAndCctv: false,
        busCategory: 'SHUTTLE_MINIBUS_CLASS_B',
        routeCode: 'AZ_ROUTE_404_QUBA',
        fleetVehicleCount: 4,
        seatCapacityPerBus: 20,
      };

      const result = calculateTenderScore(inputs);
      expect(result.ageScore).toBe(0);
      expect(result.emissionScore).toBe(0);
      expect(result.totalScore).toBe(0);
      expect(result.grade).toBe('C');
      expect(result.status).toBe('DISQUALIFIED');
      expect(result.feedbackAz.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('calculateRouteEconomics', () => {
    it('accurately calculates economics for Baku - Ganja route', () => {
      const inputs: TenderInputs = {
        fleetAverageAgeYears: 2,
        euroStandard: 'EURO_6',
        hasWheelchairAccessibility: true,
        hasAynaGpsAndTachograph: true,
        hasAynaBiletimIntegration: true,
        hasClimateAndCctv: true,
        busCategory: 'INTERCITY_COACH_CLASS_III',
        routeCode: 'AZ_ROUTE_101_GANJA',
        fleetVehicleCount: 12,
        seatCapacityPerBus: 53,
      };

      const economics = calculateRouteEconomics(inputs, 'AZN');
      expect(economics.routeCode).toBe('AZ_ROUTE_101_GANJA');
      expect(economics.distanceKm).toBe(365);
      expect(economics.calculatedTicketPriceAzn).toBeGreaterThan(15);
      expect(economics.dailyPassengerQuota).toBeGreaterThan(0);
      expect(economics.dailyEstimatedRevenueAzn).toBeGreaterThan(0);
      expect(economics.estimatedDailyNetProfitAzn).toBeGreaterThan(0);
    });
  });

  describe('evaluateLiveTelemetry', () => {
    it('evaluates fully compliant onboard telemetry with zero fines', () => {
      const inputs: LiveTelemetryInputs = {
        currentSpeedKmH: 85,
        driverShiftHours: 3.5,
        cabinTemperatureCelsius: 22.0,
        passengerOccupancyPercent: 88,
        biletimValidatorOnline: true,
        alcoholInterlockOk: true,
        routeDeviationKm: 0.2,
      };

      const evaluation = evaluateLiveTelemetry(inputs, 'AZN');
      expect(evaluation.isCompliant).toBe(true);
      expect(evaluation.speedViolation).toBe(false);
      expect(evaluation.driverFatigueRisk).toBe('NORMAL');
      expect(evaluation.potentialFineAzn).toBe(0);
      expect(evaluation.violationsAz.length).toBe(0);
    });

    it('detects speeding, driver overtime, and alcohol failure with fines', () => {
      const inputs: LiveTelemetryInputs = {
        currentSpeedKmH: 125, // >90 + 35 excess
        driverShiftHours: 9.8, // >9.0 critical overtime
        cabinTemperatureCelsius: 29.0, // too hot
        passengerOccupancyPercent: 100,
        biletimValidatorOnline: false, // offline
        alcoholInterlockOk: false, // alcohol detected
        routeDeviationKm: 3.5, // > 2.0 km deviation
      };

      const evaluation = evaluateLiveTelemetry(inputs, 'AZN');
      expect(evaluation.isCompliant).toBe(false);
      expect(evaluation.speedViolation).toBe(true);
      expect(evaluation.driverFatigueRisk).toBe('CRITICAL_OVERTIME');
      expect(evaluation.biletimStatusOk).toBe(false);
      expect(evaluation.alcoholStatusOk).toBe(false);
      expect(evaluation.routeDeviationViolation).toBe(true);
      expect(evaluation.potentialFineAzn).toBeGreaterThanOrEqual(1000);
      expect(evaluation.violationsAz.length).toBeGreaterThanOrEqual(5);
    });

    it('flags break due when driving hours exceed 4.5h', () => {
      const inputs: LiveTelemetryInputs = {
        currentSpeedKmH: 80,
        driverShiftHours: 4.8,
        cabinTemperatureCelsius: 21,
        passengerOccupancyPercent: 70,
        biletimValidatorOnline: true,
        alcoholInterlockOk: true,
        routeDeviationKm: 0.5,
      };

      const evaluation = evaluateLiveTelemetry(inputs, 'AZN');
      expect(evaluation.driverFatigueRisk).toBe('BREAK_DUE');
      expect(evaluation.violationsAz.some((v) => v.includes('4.5 saat'))).toBe(true);
    });
  });

  describe('calculateMobilityChecklistScore', () => {
    it('approves checklist when all mandatory items are checked with score >= 80%', () => {
      const allIds = MOCK_MOBILITY_CHECKLIST_ITEMS.map((i) => i.id);
      const result = calculateMobilityChecklistScore(MOCK_MOBILITY_CHECKLIST_ITEMS, allIds);
      expect(result.scorePercent).toBe(100);
      expect(result.isApproved).toBe(true);
      expect(result.missingMandatoryItems.length).toBe(0);
    });

    it('fails approval when a mandatory item is missing', () => {
      // Exclude mandatory item chk-1 (taxoqraf)
      const partialIds = MOCK_MOBILITY_CHECKLIST_ITEMS.filter((i) => i.id !== 'chk-1').map(
        (i) => i.id
      );
      const result = calculateMobilityChecklistScore(MOCK_MOBILITY_CHECKLIST_ITEMS, partialIds);
      expect(result.isApproved).toBe(false);
      expect(result.missingMandatoryItems).toContain(
        'Rəqəmsal Taxoqraf və Sürücü Smart Kartı Yoxlanışı'
      );
    });
  });

  describe('evaluateMobilityExam', () => {
    it('evaluates exam as passed with 100% correct answers', () => {
      const perfectAnswers: Record<number, number> = {};
      MOCK_MOBILITY_EXAM_QUESTIONS.forEach((q) => {
        perfectAnswers[q.id] = q.correctOptionIndex;
      });

      const result = evaluateMobilityExam(MOCK_MOBILITY_EXAM_QUESTIONS, perfectAnswers);
      expect(result.scorePercent).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.correctCount).toBe(10);
    });

    it('evaluates exam as failed when wrong answers are supplied', () => {
      const wrongAnswers: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      const result = evaluateMobilityExam(MOCK_MOBILITY_EXAM_QUESTIONS, wrongAnswers);
      expect(result.passed).toBe(false);
      expect(result.scorePercent).toBeLessThan(80);
    });
  });

  describe('generateIntercityMobilityCertificate', () => {
    it('creates a verifiable certificate with valid checksum and SIMA UID', () => {
      const cert = generateIntercityMobilityCertificate(
        'BakuBus MMC',
        '99-JH-101',
        'Neoplan Tourliner',
        'INTERCITY_COACH_CLASS_III',
        'AZ_ROUTE_101_GANJA',
        95,
        'A'
      );

      expect(cert.certificateId).toMatch(/^MOBIL-AZ-2026-\d{5}$/);
      expect(cert.simaSignatureUid).toContain('SIMA-RINN-');
      expect(cert.securityHashSha256).toContain('SHA256:0x');
      expect(cert.status).toBe('ACTIVE_VALID');
      expect(cert.grade).toBe('A');
      expect(cert.assignedRouteNameAz).toContain('Gəncə');
    });

    it('flags certificate as provisional if tender score is below 70', () => {
      const cert = generateIntercityMobilityCertificate(
        'Test Trans',
        '10-XX-000',
        'Old Bus',
        'REGIONAL_BUS_CLASS_II',
        'AZ_ROUTE_404_QUBA',
        62,
        'C'
      );

      expect(cert.status).toBe('PROVISIONAL');
    });
  });
});
