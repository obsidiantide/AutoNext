import { describe, it, expect } from 'vitest';
import {
  calculateEsalFactor,
  calculateBridgeTelemetry,
  calculateAxleLoadCompliance,
  evaluateAxleChecklist,
  evaluateAxleExam,
  generateWimCertificate,
  AXLE_LIMIT_SPECS,
  VEHICLE_CONFIG_SPECS,
  STANDARD_AXLE_LOAD_KG,
} from '../axleLoadCompliance';
import {
  MOCK_AXLE_CHECKLIST,
  MOCK_AXLE_EXAM_QUESTIONS,
} from '../../data/mockAxleLoadData';

describe('Axle Load & WIM Compliance Calculation Engine', () => {
  describe('Fourth Power Law (ESAL Calculation)', () => {
    it('returns 0 for zero or negative axle weight', () => {
      expect(calculateEsalFactor(0)).toBe(0);
      expect(calculateEsalFactor(-500)).toBe(0);
    });

    it('calculates ESAL of 1.0 for standard axle weight (8,160 kg)', () => {
      const esal = calculateEsalFactor(STANDARD_AXLE_LOAD_KG);
      expect(esal).toBeCloseTo(1.0, 1);
    });

    it('demonstrates exponential pavement wear when overloaded', () => {
      const normalAxle = calculateEsalFactor(8160);
      const heavyAxle = calculateEsalFactor(12000);
      expect(heavyAxle).toBeGreaterThan(normalAxle * 4); // (12000/8160)^4 = ~4.66
    });
  });

  describe('Bridge Structural Dynamic Telemetry', () => {
    it('calculates mid-span deflection and allowable limit correctly', () => {
      const span = 45;
      const result = calculateBridgeTelemetry({
        spanLengthM: span,
        totalWeightKg: 40000,
        speedKmh: 70,
        bridgeNameAz: 'Kür Çayı Körpüsü',
      });

      expect(result.allowableDeflectionMm).toBe(Number(((span * 1000) / 800).toFixed(1)));
      expect(result.midSpanDeflectionMm).toBeGreaterThan(0);
      expect(result.isDeflectionSafe).toBe(true);
      expect(result.dynamicAmplificationFactor).toBeGreaterThanOrEqual(1.0);
      expect(result.vibrationFrequencyHz).toBeGreaterThan(0);
      expect(result.structuralLoadRating).toBe('SAFE');
    });

    it('flags critical risk when heavy overload causes excessive deflection', () => {
      const result = calculateBridgeTelemetry({
        spanLengthM: 80,
        totalWeightKg: 120000, // extreme heavy weight
        speedKmh: 90,
      });

      expect(result.structuralLoadRating).toBe('CRITICAL_RISK');
      expect(result.isDeflectionSafe).toBe(false);
    });
  });

  describe('calculateAxleLoadCompliance', () => {
    it('evaluates fully compliant 5-axle articulated vehicle', () => {
      const result = calculateAxleLoadCompliance({
        vehicleConfig: 'ARTICULATED_5_AXLE',
        axleWeights: [7100, 10800, 7100, 7100, 7100],
        airSuspensionAxles: [false, true, true, true, true],
        transitDistanceKm: 150,
        speedKmh: 75,
        currency: 'AZN',
      });

      expect(result.totalMeasuredGrossWeightKg).toBe(39200);
      expect(result.legalMaxGrossWeightKg).toBe(40000);
      expect(result.isGrossOverweight).toBe(false);
      expect(result.excessGrossWeightKg).toBe(0);
      expect(result.administrativeFineAzn).toBe(0);
      expect(result.roadDamageCompensationAzn).toBe(0);
      expect(result.complianceRating).toBe('COMPLIANT');
      expect(result.isVehicleImpounded).toBe(false);
    });

    it('calculates Tier 1 fine (İXM 322.1) and road damage for 5-15% overweight vehicle', () => {
      const result = calculateAxleLoadCompliance({
        vehicleConfig: 'ARTICULATED_5_AXLE',
        axleWeights: [7800, 12200, 8000, 7900, 7900], // 43,800 kg vs 40,000 kg limit (9.5% excess)
        airSuspensionAxles: [false, false, false, false, false],
        transitDistanceKm: 100,
        currency: 'AZN',
      });

      expect(result.isGrossOverweight).toBe(true);
      expect(result.excessGrossWeightKg).toBe(3800);
      expect(result.administrativeFineAzn).toBe(600);
      expect(result.administrativeCodeArticle).toContain('İXM Maddə 322.1');
      expect(result.roadDamageCompensationAzn).toBeGreaterThan(0);
      expect(result.complianceRating).toBe('SUBSTANTIAL_OVERWEIGHT');
    });

    it('calculates Tier 3 fine and flags impoundment for > 25% severe overload', () => {
      const result = calculateAxleLoadCompliance({
        vehicleConfig: 'RIGID_3_AXLE',
        axleWeights: [8000, 14000, 14000], // 36,000 kg vs 26,000 kg limit (38.5% excess)
        airSuspensionAxles: [false, false, false],
        transitDistanceKm: 80,
      });

      expect(result.administrativeFineAzn).toBe(2000);
      expect(result.administrativeCodeArticle).toContain('İXM Maddə 322.3');
      expect(result.isVehicleImpounded).toBe(true);
      expect(result.requiresSpecialPermit).toBe(true);
      expect(result.complianceRating).toBe('CRITICAL_HAZARD');
    });

    it('handles currency conversions for USD and EUR', () => {
      const aznResult = calculateAxleLoadCompliance({
        vehicleConfig: 'ARTICULATED_5_AXLE',
        axleWeights: [7800, 12200, 8000, 7900, 7900],
        currency: 'AZN',
      });

      const usdResult = calculateAxleLoadCompliance({
        vehicleConfig: 'ARTICULATED_5_AXLE',
        axleWeights: [7800, 12200, 8000, 7900, 7900],
        currency: 'USD',
      });

      const eurResult = calculateAxleLoadCompliance({
        vehicleConfig: 'ARTICULATED_5_AXLE',
        axleWeights: [7800, 12200, 8000, 7900, 7900],
        currency: 'EUR',
      });

      expect(usdResult.currencySymbol).toBe('$');
      expect(eurResult.currencySymbol).toBe('€');
      expect(usdResult.administrativeFineConverted).toBeCloseTo(aznResult.administrativeFineAzn * 0.5882, 1);
      expect(eurResult.administrativeFineConverted).toBeCloseTo(aznResult.administrativeFineAzn * 0.5435, 1);
    });

    it('applies air suspension bonus on standard tandem axles', () => {
      const withAir = calculateAxleLoadCompliance({
        vehicleConfig: 'RIGID_3_AXLE',
        axleWeights: [6000, 9500, 9500], // tandem = 19,000 kg
        airSuspensionAxles: [false, true, true],
      });

      const withoutAir = calculateAxleLoadCompliance({
        vehicleConfig: 'RIGID_3_AXLE',
        axleWeights: [6000, 9500, 9500],
        airSuspensionAxles: [false, false, false],
      });

      // Standard tandem with air has 19,000 kg limit, without air 18,000 kg limit
      expect(withAir.axleDetails[1].legalLimitKg).toBe(19000);
      expect(withoutAir.axleDetails[1].legalLimitKg).toBe(18000);
    });
  });

  describe('evaluateAxleChecklist', () => {
    it('evaluates fully checked checklist as passing', () => {
      const allChecked = MOCK_AXLE_CHECKLIST.map(item => ({ ...item, isChecked: true }));
      const result = evaluateAxleChecklist(allChecked);

      expect(result.scorePercentage).toBe(100);
      expect(result.isEligibleForCertificate).toBe(true);
      expect(result.criticalPendingItems.length).toBe(0);
    });

    it('fails eligibility if critical items are unchecked', () => {
      const someUnchecked = MOCK_AXLE_CHECKLIST.map((item, idx) => ({
        ...item,
        isChecked: idx > 2, // CHK-01 and CHK-02 critical items unchecked
      }));
      const result = evaluateAxleChecklist(someUnchecked);

      expect(result.isEligibleForCertificate).toBe(false);
      expect(result.criticalPendingItems.length).toBeGreaterThan(0);
    });
  });

  describe('evaluateAxleExam', () => {
    it('scores 100% when all correct answers selected', () => {
      const allCorrect = MOCK_AXLE_EXAM_QUESTIONS.map(q => ({
        id: q.id,
        selectedAnswerIndex: q.correctAnswerIndex,
        correctAnswerIndex: q.correctAnswerIndex,
      }));
      const result = evaluateAxleExam(allCorrect);

      expect(result.scorePercentage).toBe(100);
      expect(result.isPassed).toBe(true);
      expect(result.correctAnswers).toBe(MOCK_AXLE_EXAM_QUESTIONS.length);
    });

    it('fails when score is below 70%', () => {
      const mostlyWrong = MOCK_AXLE_EXAM_QUESTIONS.map(q => ({
        id: q.id,
        selectedAnswerIndex: (q.correctAnswerIndex + 1) % 4,
        correctAnswerIndex: q.correctAnswerIndex,
      }));
      const result = evaluateAxleExam(mostlyWrong);

      expect(result.scorePercentage).toBe(0);
      expect(result.isPassed).toBe(false);
    });
  });

  describe('generateWimCertificate', () => {
    it('generates a valid WIM certificate with authentic security hashes and metadata', () => {
      const calc = calculateAxleLoadCompliance({
        vehicleConfig: 'ARTICULATED_5_AXLE',
        axleWeights: [7100, 10800, 7100, 7100, 7100],
        airSuspensionAxles: [false, true, true, true, true],
      });

      const cert = generateWimCertificate({
        stationId: 'WIM-01',
        stationNameAz: 'Giləzi WIM Postu',
        highwayCode: 'M1',
        vehiclePlate: '99-ZZ-990',
        calculation: calc,
      });

      expect(cert.certificateId).toMatch(/^WIM-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-ZZ-990');
      expect(cert.complianceRating).toBe('COMPLIANT');
      expect(cert.simaDigitalUid).toContain('SIMA-WIM-AZ');
      expect(cert.sha256Checksum.length).toBe(64);
      expect(cert.qrPayload).toContain('https://ayna.gov.az/wim-verify');
    });
  });

  describe('Static Constants & Specifications Integrity', () => {
    it('has valid axle limit specifications', () => {
      expect(AXLE_LIMIT_SPECS.STEERING_SINGLE.standardLimitKg).toBe(10000);
      expect(AXLE_LIMIT_SPECS.DRIVE_SINGLE.standardLimitKg).toBe(11500);
      expect(AXLE_LIMIT_SPECS.TRIDEM_STANDARD.standardLimitKg).toBe(24000);
    });

    it('has valid vehicle configuration specifications', () => {
      expect(VEHICLE_CONFIG_SPECS.ARTICULATED_5_AXLE.maxGrossWeightKg).toBe(40000);
      expect(VEHICLE_CONFIG_SPECS.ARTICULATED_6_AXLE.maxGrossWeightKg).toBe(44000);
      expect(VEHICLE_CONFIG_SPECS.RIGID_4_AXLE.maxGrossWeightKg).toBe(32000);
    });
  });
});
