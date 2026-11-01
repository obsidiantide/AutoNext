import { describe, it, expect } from 'vitest';
import {
  calculatePavementTemperature,
  getBitumenDynamicModulus,
  calculateRuttingDepth,
  calculateEsalDamageFactor,
  evaluateSummerHeatRestriction,
  calculateAsphaltStatutoryFine,
  calculateAsphaltThermalSimulation,
  evaluateAsphaltChecklist,
  evaluateAsphaltExam,
  generateAsphaltCertificate,
} from '../asphaltGuardCompliance';
import {
  MOCK_ASPHALT_CORRIDORS,
  MOCK_ASPHALT_VEHICLES,
  MOCK_ASPHALT_CHECKLIST,
  MOCK_ASPHALT_EXAM_QUESTIONS,
} from '../../data/mockAsphaltGuardData';

describe('asphaltGuardCompliance Suite', () => {
  describe('calculatePavementTemperature', () => {
    it('calculates pavement surface and critical depth temperature accurately under solar radiation', () => {
      const temps = calculatePavementTemperature(38, 850);
      expect(temps.surfaceTempC).toBeGreaterThan(38);
      expect(temps.surfaceTempC).toBeGreaterThanOrEqual(55);
      expect(temps.criticalDepthTempC).toBeLessThan(temps.surfaceTempC);
      expect(temps.criticalDepthTempC).toBeGreaterThan(38);
    });

    it('handles low temperature with zero solar radiation', () => {
      const temps = calculatePavementTemperature(18, 0);
      expect(temps.surfaceTempC).toBe(18);
      expect(temps.criticalDepthTempC).toBe(18);
    });
  });

  describe('getBitumenDynamicModulus', () => {
    it('returns higher dynamic modulus for polymer-modified SMA compared to standard BND 60/90', () => {
      const smaModulus = getBitumenDynamicModulus('SMA_16_POLYMER', 50);
      const bndModulus = getBitumenDynamicModulus('BND_60_90', 50);
      expect(smaModulus).toBeGreaterThan(bndModulus);
    });

    it('drops modulus as temperature increases', () => {
      const modAt30 = getBitumenDynamicModulus('PG_64_22', 30);
      const modAt60 = getBitumenDynamicModulus('PG_64_22', 60);
      expect(modAt30).toBeGreaterThan(modAt60);
    });
  });

  describe('calculateRuttingDepth', () => {
    it('predicts greater rutting depth for heavier axle loads and higher temperatures', () => {
      const lowLoadRutting = calculateRuttingDepth(40, 5000, 6.0, 7.0, 'PG_64_22');
      const highLoadRutting = calculateRuttingDepth(60, 5000, 13.0, 9.0, 'PG_64_22');
      expect(highLoadRutting).toBeGreaterThan(lowLoadRutting);
    });

    it('shows polymer-modified SMA reduces rutting compared to standard BND 70/100', () => {
      const bndRutting = calculateRuttingDepth(55, 10000, 11.5, 8.5, 'BND_70_100');
      const smaRutting = calculateRuttingDepth(55, 10000, 11.5, 8.5, 'SMA_16_POLYMER');
      expect(smaRutting).toBeLessThan(bndRutting);
    });
  });

  describe('calculateEsalDamageFactor', () => {
    it('applies the AASHTO 4th Power Law correctly', () => {
      const standardDamage = calculateEsalDamageFactor(8.16);
      expect(standardDamage).toBeCloseTo(1.0, 1);

      const doubleAxleDamage = calculateEsalDamageFactor(16.32);
      expect(doubleAxleDamage).toBeCloseTo(16.0, 1);
    });
  });

  describe('evaluateSummerHeatRestriction', () => {
    it('restricts heavy vehicles (>14t) during summer daytime (10:00-20:00) when air temp >= 32°C', () => {
      const result = evaluateSummerHeatRestriction(35.0, 14, 38000, 11.5);
      expect(result.isRestricted).toBe(true);
      expect(result.reasonAz).toContain('qadağandır');
    });

    it('restricts vehicles with single axle > 5t during daytime heat even if gross mass is below 14t', () => {
      const result = evaluateSummerHeatRestriction(33.0, 12, 12000, 6.5);
      expect(result.isRestricted).toBe(true);
      expect(result.reasonAz).toContain('Ox yükü');
    });

    it('permits passenger cars under 14t and under 5t axle during hot daytime', () => {
      const result = evaluateSummerHeatRestriction(38.0, 15, 2500, 1.3);
      expect(result.isRestricted).toBe(false);
      expect(result.reasonAz).toContain('icazə verilir');
    });

    it('permits heavy vehicles during night/early morning hours even if temp is high', () => {
      const result = evaluateSummerHeatRestriction(33.0, 22, 40000, 11.5);
      expect(result.isRestricted).toBe(false);
      expect(result.reasonAz).toContain('Gecə/səhər dəhlizi');
    });

    it('permits all vehicles when air temp is below 32°C', () => {
      const result = evaluateSummerHeatRestriction(28.0, 14, 40000, 11.5);
      expect(result.isRestricted).toBe(false);
      expect(result.reasonAz).toContain('<32°C');
    });
  });

  describe('calculateAsphaltStatutoryFine', () => {
    it('returns zero fine when vehicle is not restricted', () => {
      const fines = calculateAsphaltStatutoryFine(false, 30000, 10);
      expect(fines.statutoryFineAzn).toBe(0);
      expect(fines.discountedFineAzn).toBe(0);
    });

    it('calculates standard and aggravated fine with 50% discount under Article 38', () => {
      const standard = calculateAsphaltStatutoryFine(true, 18000, 7);
      expect(standard.statutoryFineAzn).toBe(150);
      expect(standard.discountedFineAzn).toBe(75);

      const aggravated = calculateAsphaltStatutoryFine(true, 36000, 11.5);
      expect(aggravated.statutoryFineAzn).toBe(250);
      expect(aggravated.discountedFineAzn).toBe(125);
      expect(aggravated.statutoryFineUsd).toBeGreaterThan(0);
      expect(aggravated.statutoryFineEur).toBeGreaterThan(0);
    });
  });

  describe('calculateAsphaltThermalSimulation', () => {
    it('runs full simulation for a restricted heavy semi-trailer during heatwave', () => {
      const sim = calculateAsphaltThermalSimulation({
        airTemperatureC: 38.0,
        solarRadiationWm2: 850,
        vehicleGrossMassKg: 38000,
        maxAxleLoadTonnes: 11.5,
        tirePressureBar: 9.0,
        bitumenGrade: 'BND_60_90',
        truckPassesCount: 8000,
        timeHour: 14,
      });

      expect(sim.isRestrictedDueToHeat).toBe(true);
      expect(sim.statutoryFineAzn).toBe(250);
      expect(sim.discountedFineAzn).toBe(125);
      expect(sim.estimatedCoolingWaitMinutes).toBe(360); // 20 - 14 = 6 hours = 360 min
      expect(sim.ruttingDepthMm).toBeGreaterThan(5);
      expect(sim.coolingWaterRequiredLiters).toBeGreaterThan(0);
      expect(sim.complianceNotes.length).toBeGreaterThan(0);
    });

    it('correctly categorizes critical rutting risk', () => {
      const sim = calculateAsphaltThermalSimulation({
        airTemperatureC: 42.0,
        solarRadiationWm2: 950,
        vehicleGrossMassKg: 40000,
        maxAxleLoadTonnes: 14.0,
        tirePressureBar: 10.0,
        bitumenGrade: 'BND_70_100',
        truckPassesCount: 20000,
        timeHour: 15,
      });

      expect(sim.ruttingRisk === 'CRITICAL_RUTTING' || sim.ruttingRisk === 'PAVEMENT_FAILURE').toBe(true);
    });
  });

  describe('evaluateAsphaltChecklist', () => {
    it('evaluates compliance based on checked mandatory items', () => {
      const allIds = MOCK_ASPHALT_CHECKLIST.map((item) => item.id);
      const fullResult = evaluateAsphaltChecklist(MOCK_ASPHALT_CHECKLIST, allIds);
      expect(fullResult.isCompliant).toBe(true);
      expect(fullResult.scorePercent).toBe(100);
      expect(fullResult.missingMandatoryAz.length).toBe(0);

      const emptyResult = evaluateAsphaltChecklist(MOCK_ASPHALT_CHECKLIST, []);
      expect(emptyResult.isCompliant).toBe(false);
      expect(emptyResult.scorePercent).toBe(0);
      expect(emptyResult.missingMandatoryAz.length).toBeGreaterThan(0);
    });
  });

  describe('evaluateAsphaltExam', () => {
    it('evaluates answers and calculates correct grade and pass/fail state', () => {
      const perfectAnswers: Record<number, number> = {};
      MOCK_ASPHALT_EXAM_QUESTIONS.forEach((q) => {
        perfectAnswers[q.id] = q.correctOptionIndex;
      });

      const passResult = evaluateAsphaltExam(MOCK_ASPHALT_EXAM_QUESTIONS, perfectAnswers);
      expect(passResult.isPassed).toBe(true);
      expect(passResult.scorePercent).toBe(100);
      expect(passResult.grade).toBe('ƏLA');

      const failAnswers: Record<number, number> = {};
      MOCK_ASPHALT_EXAM_QUESTIONS.forEach((q) => {
        failAnswers[q.id] = (q.correctOptionIndex + 1) % 4;
      });

      const failResult = evaluateAsphaltExam(MOCK_ASPHALT_EXAM_QUESTIONS, failAnswers);
      expect(failResult.isPassed).toBe(false);
      expect(failResult.scorePercent).toBe(0);
      expect(failResult.grade).toBe('QEYRİ-KAFİ');
    });
  });

  describe('generateAsphaltCertificate', () => {
    it('generates a valid certificate with SIMA digital signature and QR code data', () => {
      const corridor = MOCK_ASPHALT_CORRIDORS[0];
      const vehicle = MOCK_ASPHALT_VEHICLES[0];
      const sim = calculateAsphaltThermalSimulation({
        airTemperatureC: corridor.currentAirTempC,
        solarRadiationWm2: corridor.solarRadiationWm2,
        vehicleGrossMassKg: vehicle.grossMassKg,
        maxAxleLoadTonnes: vehicle.maxAxleLoadTonnes,
        tirePressureBar: vehicle.tirePressureBar,
        bitumenGrade: corridor.bitumenGrade,
        truckPassesCount: 6000,
        timeHour: 13,
      });

      const cert = generateAsphaltCertificate({
        vehiclePlate: vehicle.licensePlate,
        vehicleClass: vehicle.vehicleClass,
        grossMassKg: vehicle.grossMassKg,
        maxAxleLoadTonnes: vehicle.maxAxleLoadTonnes,
        corridor,
        simResult: sim,
      });

      expect(cert.certificateNumber).toMatch(/^ASPHALT-GUARD-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-AG-101');
      expect(cert.clearanceStatus).toBe('RESTRICTED_COOLING_HOLD');
      expect(cert.digitalSignatureUid).toContain('SIMA-');
      expect(cert.coolingBayPinCode).toMatch(/^\d{4}$/);
      expect(cert.qrCodeData).toContain(cert.certificateNumber);
    });
  });
});
