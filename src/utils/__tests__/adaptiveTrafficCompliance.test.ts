import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  STRATEGIC_CORRIDORS,
  calculateGreenWaveProgression,
  evaluateQueueAndSaturation,
  calculateCongestionTariff,
  evaluateItsChecklist,
  evaluateTrafficExam,
  generateOfficialItsPriorityPass,
  ItsChecklistItem,
  TrafficExamQuestion,
} from '../adaptiveTrafficCompliance';

describe('Adaptive Traffic Light & ITS Compliance Engine', () => {
  describe('Currency Conversion & Formatting', () => {
    it('converts AZN correctly to USD and EUR', () => {
      expect(convertAzn(100, 'AZN')).toBe(100);
      expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 1);
      expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 1);
    });

    it('formats currencies with appropriate symbols', () => {
      expect(formatCurrency(50, 'AZN')).toContain('₼');
      expect(formatCurrency(50, 'USD')).toContain('$');
      expect(formatCurrency(50, 'EUR')).toContain('€');
    });
  });

  describe('Strategic Corridors Data Integrity', () => {
    it('contains all 8 defined strategic Baku corridors', () => {
      const keys = Object.keys(STRATEGIC_CORRIDORS);
      expect(keys).toHaveLength(8);
      expect(STRATEGIC_CORRIDORS.CORRIDOR_NEFTCHILAR).toBeDefined();
      expect(STRATEGIC_CORRIDORS.CORRIDOR_HEYDAR_ALIYEV).toBeDefined();
      expect(STRATEGIC_CORRIDORS.CORRIDOR_TBILISI).toBeDefined();
      expect(STRATEGIC_CORRIDORS.CORRIDOR_8_NOYABR).toBeDefined();
      expect(STRATEGIC_CORRIDORS.CORRIDOR_BABEK).toBeDefined();
      expect(STRATEGIC_CORRIDORS.CORRIDOR_ZIYA_BUNYADOV).toBeDefined();
      expect(STRATEGIC_CORRIDORS.CORRIDOR_MOSCOW).toBeDefined();
      expect(STRATEGIC_CORRIDORS.CORRIDOR_INSHAATCHILAR).toBeDefined();
    });

    it('each corridor has valid coordinates, length, and intersections', () => {
      for (const c of Object.values(STRATEGIC_CORRIDORS)) {
        expect(c.corridorLengthMeters).toBeGreaterThan(1000);
        expect(c.intersectionCount).toBeGreaterThanOrEqual(4);
        expect(c.coordinates.lat).toBeGreaterThan(40);
        expect(c.coordinates.lng).toBeGreaterThan(49);
        expect(c.keyIntersections.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Green Wave (Yaşıl Dalğa) Progression & Bandwidth Simulator', () => {
    it('calculates progression with high bandwidth efficiency for adaptive SCOOT mode', () => {
      const result = calculateGreenWaveProgression({
        corridorLengthMeters: 4200,
        intersectionCount: 7,
        progressionSpeedKmh: 55,
        cycleTimeSec: 100,
        greenSplitRatio: 0.60,
        trafficVolumeVehPerHour: 4500,
        controlMode: 'ADAPTIVE_SCOOT',
      });

      expect(result.idealProgressionSpeedMs).toBeCloseTo(15.3, 1);
      expect(result.averageIntersectionSpacingMeters).toBe(700);
      expect(result.idealOffsetPerIntersectionSec).toBeGreaterThan(40);
      expect(result.bandwidthSec).toBeGreaterThan(30);
      expect(result.bandwidthEfficiencyPercent).toBeGreaterThanOrEqual(35);
      expect(['EXCELLENT', 'GOOD']).toContain(result.progressionQualityGrade);
      expect(result.travelTimeSavedSec).toBeGreaterThan(0);
      expect(result.travelTimeSavedPercent).toBeGreaterThan(0);
      expect(result.fuelSavedLitersPerDay).toBeGreaterThan(0);
      expect(result.co2ReductionKgPerDay).toBeGreaterThan(0);
    });

    it('penalizes progression quality in FIXED_TIME mode with low green split', () => {
      const result = calculateGreenWaveProgression({
        corridorLengthMeters: 5000,
        intersectionCount: 8,
        progressionSpeedKmh: 45,
        cycleTimeSec: 90,
        greenSplitRatio: 0.35,
        trafficVolumeVehPerHour: 3000,
        controlMode: 'FIXED_TIME',
      });

      expect(result.bandwidthEfficiencyPercent).toBeLessThan(35);
      expect(['FAIR', 'POOR']).toContain(result.progressionQualityGrade);
      expect(result.expectedStopsPerTrip).toBeGreaterThan(2);
    });

    it('handles emergency preemption mode with maximum bandwidth efficiency', () => {
      const result = calculateGreenWaveProgression({
        corridorLengthMeters: 8500,
        intersectionCount: 9,
        progressionSpeedKmh: 70,
        cycleTimeSec: 120,
        greenSplitRatio: 0.70,
        trafficVolumeVehPerHour: 5000,
        controlMode: 'EMERGENCY_PREEMPTION',
      });

      expect(result.progressionQualityGrade).toBe('EXCELLENT');
      expect(result.bandwidthEfficiencyPercent).toBeGreaterThanOrEqual(45);
    });
  });

  describe('Queue Length & Webster Saturation Delay Telemetry', () => {
    it('evaluates low saturation (LOS A or B) under light traffic', () => {
      const result = evaluateQueueAndSaturation({
        arrivalRateVehPerHourPerLane: 400,
        saturationFlowRateVehPerHourPerLane: 1900,
        cycleTimeSec: 90,
        effectiveGreenSec: 50,
        numberOfLanes: 3,
      });

      expect(result.degreeOfSaturationX).toBeLessThan(0.5);
      expect(['A', 'B']).toContain(result.levelOfService);
      expect(result.spillbackRisk).toBe('LOW');
      expect(result.queueLengthMeters).toBeLessThan(50);
    });

    it('detects critical gridlock (LOS F) when demand exceeds capacity', () => {
      const result = evaluateQueueAndSaturation({
        arrivalRateVehPerHourPerLane: 1600,
        saturationFlowRateVehPerHourPerLane: 1800,
        cycleTimeSec: 120,
        effectiveGreenSec: 40,
        numberOfLanes: 2,
      });

      expect(result.degreeOfSaturationX).toBeGreaterThanOrEqual(1.0);
      expect(result.levelOfService).toBe('F');
      expect(result.averageDelaySecPerVehicle).toBeGreaterThan(80);
      expect(result.spillbackRisk).toBe('CRITICAL_GRIDLOCK');
    });

    it('identifies moderate congestion (LOS C or D) in normal peak flow', () => {
      const result = evaluateQueueAndSaturation({
        arrivalRateVehPerHourPerLane: 950,
        saturationFlowRateVehPerHourPerLane: 1900,
        cycleTimeSec: 100,
        effectiveGreenSec: 55,
        numberOfLanes: 3,
      });

      expect(result.degreeOfSaturationX).toBeGreaterThan(0.6);
      expect(result.degreeOfSaturationX).toBeLessThan(1.0);
      expect(['C', 'D', 'E']).toContain(result.levelOfService);
    });
  });

  describe('Dynamic Intersection Congestion Pricing Tariff', () => {
    it('completely exempts emergency services (ambulances, fire engines)', () => {
      const result = calculateCongestionTariff({
        corridorId: 'CORRIDOR_TBILISI',
        powertrain: 'EMERGENCY_AMBULANCE_FIRE',
        isPeakHour: true,
        levelOfService: 'F',
        passDurationDays: 30,
        requestEmergencyPreemptionPass: true,
      });

      expect(result.isExempt).toBe(true);
      expect(result.totalPeriodFeeAzn).toBe(0);
      expect(result.subtotalDailyAzn).toBe(0);
      expect(result.legalBasisAz).toContain('Maddə 64');
    });

    it('applies 50% discount for electric vehicles and surcharge for peak hour', () => {
      const evResult = calculateCongestionTariff({
        corridorId: 'CORRIDOR_NEFTCHILAR',
        powertrain: 'ELECTRIC',
        isPeakHour: true,
        levelOfService: 'D',
        passDurationDays: 1,
        requestEmergencyPreemptionPass: false,
      });

      expect(evResult.powertrainDiscountPercent).toBe(50);
      expect(evResult.isExempt).toBe(false);
      expect(evResult.peakHourMultiplier).toBe(1.5);
      expect(evResult.totalPeriodFeeAzn).toBeGreaterThan(0);
    });

    it('applies duration discount for annual passes', () => {
      const singleDay = calculateCongestionTariff({
        corridorId: 'CORRIDOR_BABEK',
        powertrain: 'INTERNAL_COMBUSTION',
        isPeakHour: false,
        levelOfService: 'C',
        passDurationDays: 1,
        requestEmergencyPreemptionPass: false,
      });

      const annual = calculateCongestionTariff({
        corridorId: 'CORRIDOR_BABEK',
        powertrain: 'INTERNAL_COMBUSTION',
        isPeakHour: false,
        levelOfService: 'C',
        passDurationDays: 365,
        requestEmergencyPreemptionPass: false,
      });

      expect(annual.totalPeriodFeeAzn).toBeLessThan(singleDay.subtotalDailyAzn * 365);
    });
  });

  describe('10-Point ITS Infrastructure Checklist Evaluation', () => {
    const mockItems: ItsChecklistItem[] = [
      { id: '1', categoryAz: 'Cat1', titleAz: 'Item 1', descriptionAz: 'Desc 1', standardReference: 'Ref 1', isMandatory: true },
      { id: '2', categoryAz: 'Cat1', titleAz: 'Item 2', descriptionAz: 'Desc 2', standardReference: 'Ref 2', isMandatory: true },
      { id: '3', categoryAz: 'Cat2', titleAz: 'Item 3', descriptionAz: 'Desc 3', standardReference: 'Ref 3', isMandatory: false },
    ];

    it('passes when all items are checked', () => {
      const result = evaluateItsChecklist({ '1': true, '2': true, '3': true }, mockItems);
      expect(result.compliancePercent).toBe(100);
      expect(result.allMandatoryPassed).toBe(true);
      expect(result.isEligibleForSynchronization).toBe(true);
      expect(result.missingMandatoryAz).toHaveLength(0);
    });

    it('fails eligibility if a mandatory item is missing', () => {
      const result = evaluateItsChecklist({ '1': true, '3': true }, mockItems);
      expect(result.allMandatoryPassed).toBe(false);
      expect(result.isEligibleForSynchronization).toBe(false);
      expect(result.missingMandatoryAz).toContain('Item 2');
    });
  });

  describe('10-Question Theoretical Exam Evaluation', () => {
    const mockQuestions: TrafficExamQuestion[] = [
      { id: 'q1', questionAz: 'Q1', optionsAz: ['A', 'B'], correctOptionIndex: 1, explanationAz: 'Exp', legalBasisAz: 'Law' },
      { id: 'q2', questionAz: 'Q2', optionsAz: ['A', 'B'], correctOptionIndex: 0, explanationAz: 'Exp', legalBasisAz: 'Law' },
    ];

    it('calculates score and passes when score is 100%', () => {
      const result = evaluateTrafficExam({ q1: 1, q2: 0 }, mockQuestions);
      expect(result.scorePercent).toBe(100);
      expect(result.correctAnswersCount).toBe(2);
      expect(result.isPassed).toBe(true);
    });

    it('fails when score is below 80%', () => {
      const result = evaluateTrafficExam({ q1: 0, q2: 0 }, mockQuestions);
      expect(result.scorePercent).toBe(50);
      expect(result.isPassed).toBe(false);
    });
  });

  describe('Official ITS Priority Pass Generator', () => {
    it('generates a valid pass with cryptographic checksum and SIMA UID', () => {
      const corridor = STRATEGIC_CORRIDORS.CORRIDOR_NEFTCHILAR;
      const pass = generateOfficialItsPriorityPass(
        '10-TT-103',
        'Mercedes-Benz Sprinter 319 CDI',
        'Bakı Şəhər TTY Stansiyası',
        'Kateqoriya 1: Tibbi Prioritet',
        corridor,
        'EMERGENCY_PREEMPTION',
        0,
        true
      );

      expect(pass.passId).toMatch(/^ITS-PRIORITY-AZ-2026-\d{5}$/);
      expect(pass.vehiclePlate).toBe('10-TT-103');
      expect(pass.corridorId).toBe('CORRIDOR_NEFTCHILAR');
      expect(pass.preemptionChannelFrequencyMhz).toBe(5895.0);
      expect(pass.sha256SecurityChecksum).toBeDefined();
      expect(pass.sha256SecurityChecksum.length).toBeGreaterThanOrEqual(8);
      expect(pass.simaDigitalUid).toContain('SIMA-RINN-ITS-');
      expect(pass.rinnRegistryBadge).toContain('RINN-ITS-ENG-');
    });
  });
});
