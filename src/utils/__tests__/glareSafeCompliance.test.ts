import { describe, it, expect } from 'vitest';
import {
  convertGlareSafeCurrency,
  calculateGlareShielding,
  calculateStatutoryGlareSanctions,
  evaluateGlareChecklist,
  evaluateGlareExam,
  generateGlareCertificate,
  searchGlareRegistry,
  GlareCalculationParams,
  GlareVehiclePreset,
} from '../glareSafeCompliance';
import {
  MOCK_GLARE_CORRIDOR_STATIONS,
  MOCK_GLARE_CHECKLIST_ITEMS,
  MOCK_GLARE_EXAM_QUESTIONS,
  MOCK_GLARE_CERTIFICATES,
} from '../../data/mockGlareSafeData';

describe('glareSafeCompliance Utility Suite', () => {
  describe('convertGlareSafeCurrency', () => {
    it('converts correctly between AZN, USD, and EUR', () => {
      expect(convertGlareSafeCurrency(100, 'AZN')).toBe(100);
      expect(convertGlareSafeCurrency(100, 'USD')).toBe(58.82);
      expect(convertGlareSafeCurrency(100, 'EUR')).toBe(54.05);
    });

    it('handles zero or negative amounts gracefully', () => {
      expect(convertGlareSafeCurrency(0, 'AZN')).toBe(0);
      expect(convertGlareSafeCurrency(-50, 'AZN')).toBe(-50);
    });
  });

  describe('calculateGlareShielding', () => {
    const baseParams: GlareCalculationParams = {
      vehicleSpeedKmh: 110,
      oncomingLuminousIntensityCd: 85000,
      oncomingDistanceM: 50,
      lateralSeparationM: 4.5,
      driverEyeHeightMm: 1200,
      screenHeightMm: 1900,
      bladeSpacingMm: 700,
      bladeAngleDeg: 20,
      ambientIlluminanceLux: 0.15,
      windGustSpeedKmh: 40,
      bladeDefectMissingPct: 0,
    };

    it('calculates optimal shielding with pristine vanes and high mounting', () => {
      const result = calculateGlareShielding(baseParams);

      expect(result.screeningEffectivenessPct).toBeGreaterThanOrEqual(80);
      expect(result.effectiveCutoffAngleDeg).toBeGreaterThan(15);
      expect(result.deBoerComfortIndex).toBeGreaterThanOrEqual(6.0);
      expect(result.veilingLuminanceCdM2).toBeLessThan(0.5);
      expect(result.visualRecoveryTimeSec).toBeLessThan(2.0);
      expect(result.blindDrivingDistanceM).toBeGreaterThan(0);
      expect(result.shieldingRating).toMatch(/EXCELLENT_SHIELDING|SATISFACTORY_SHIELDING/);
      expect(result.recommendationsAz.length).toBeGreaterThan(0);
      expect(result.recommendationsEn.length).toBeGreaterThan(0);
    });

    it('detects acute glare and blindness when vanes are missing or low', () => {
      const defectiveParams: GlareCalculationParams = {
        ...baseParams,
        screenHeightMm: 1100, // lower than driver eye level (1200mm)
        bladeDefectMissingPct: 25, // 25% missing
        oncomingLuminousIntensityCd: 140000, // intense high beams
        windGustSpeedKmh: 120, // violent Khazri gale
      };

      const result = calculateGlareShielding(defectiveParams);

      expect(result.screeningEffectivenessPct).toBeLessThan(baseParams.screenHeightMm);
      expect(result.veilingLuminanceCdM2).toBeGreaterThan(0.01);
      expect(result.disabilityGlareRiskScore).toBeGreaterThan(30);
      expect(result.blindDrivingDistanceM).toBeGreaterThan(15);
    });

    it('evaluates blind driving distance accurately based on vehicle speed', () => {
      const slowParams = { ...baseParams, vehicleSpeedKmh: 60 };
      const fastParams = { ...baseParams, vehicleSpeedKmh: 120 };

      const slowResult = calculateGlareShielding(slowParams);
      const fastResult = calculateGlareShielding(fastParams);

      expect(fastResult.blindDrivingDistanceM).toBeGreaterThan(slowResult.blindDrivingDistanceM);
    });

    it('evaluates wind deflection properly under severe gusts', () => {
      const calmParams = { ...baseParams, windGustSpeedKmh: 10 };
      const galeParams = { ...baseParams, windGustSpeedKmh: 120 };

      const calmResult = calculateGlareShielding(calmParams);
      const galeResult = calculateGlareShielding(galeParams);

      expect(galeResult.windDeflectionAngleDeg).toBeGreaterThan(calmResult.windDeflectionAngleDeg);
    });
  });

  describe('calculateStatutoryGlareSanctions', () => {
    it('evaluates compliant usage with zero fines', () => {
      const preset: GlareVehiclePreset = {
        id: 'test-1',
        plate: '99-AA-001',
        model: 'Standard Car',
        headlightType: 'FACTORY_HALOGEN',
        luminousIntensityCd: 35000,
        driverEyeHeightMm: 1200,
        defaultSpeedKmh: 90,
        violationType: 'NONE',
      };

      const sanction = calculateStatutoryGlareSanctions(preset);
      expect(sanction.baseFineAzn).toBe(0);
      expect(sanction.discountedFineAzn).toBe(0);
      expect(sanction.civilRestitutionAzn).toBe(0);
      expect(sanction.totalPayableAzn).toBe(0);
    });

    it('evaluates failure to dip high beam under İXM 329 with 50% prompt discount', () => {
      const preset: GlareVehiclePreset = {
        id: 'test-2',
        plate: '99-GL-505',
        model: 'High Beam Offender',
        headlightType: 'LASER_HIGH_BEAM',
        luminousIntensityCd: 110000,
        driverEyeHeightMm: 1190,
        defaultSpeedKmh: 110,
        violationType: 'FAILURE_TO_DIP_HIGH_BEAM',
      };

      const sanction = calculateStatutoryGlareSanctions(preset);
      expect(sanction.baseFineAzn).toBe(30);
      expect(sanction.discountedFineAzn).toBe(15);
      expect(sanction.totalPayableAzn).toBe(15);
      expect(sanction.articleCode).toContain('İXM Maddə 329');
    });

    it('evaluates illegal unhomologated LEDs under İXM 342.1', () => {
      const preset: GlareVehiclePreset = {
        id: 'test-3',
        plate: '77-GL-303',
        model: 'Blinding Aftermarket LED',
        headlightType: 'ILLEGAL_AFTERMARKET_LED',
        luminousIntensityCd: 120000,
        driverEyeHeightMm: 1210,
        defaultSpeedKmh: 80,
        violationType: 'ILLEGAL_UNHOMOLOGATED_LIGHTS',
      };

      const sanction = calculateStatutoryGlareSanctions(preset);
      expect(sanction.baseFineAzn).toBe(150);
      expect(sanction.discountedFineAzn).toBe(75);
      expect(sanction.totalPayableAzn).toBe(75);
      expect(sanction.articleCode).toContain('İXM Maddə 342.1');
    });

    it('evaluates median barrier crash impact under İXM 353.1 and Civil Code 1108', () => {
      const preset: GlareVehiclePreset = {
        id: 'test-4',
        plate: '00-YP-606',
        model: 'Barrier Crash Car',
        headlightType: 'MATRIX_LED',
        luminousIntensityCd: 75000,
        driverEyeHeightMm: 1080,
        defaultSpeedKmh: 110,
        violationType: 'BARRIER_COLLISION_DAMAGE',
      };

      const sanction = calculateStatutoryGlareSanctions(preset);
      expect(sanction.baseFineAzn).toBe(600);
      expect(sanction.discountedFineAzn).toBe(300);
      expect(sanction.civilRestitutionAzn).toBe(850);
      expect(sanction.totalPayableAzn).toBe(1150);
      expect(sanction.articleCode).toContain('İXM Maddə 353.1');
    });
  });

  describe('evaluateGlareChecklist', () => {
    it('calculates checklist completion and full compliance correctly', () => {
      const allIds = MOCK_GLARE_CHECKLIST_ITEMS.map((item) => item.id);
      const fullEval = evaluateGlareChecklist(MOCK_GLARE_CHECKLIST_ITEMS, allIds);

      expect(fullEval.checkedCount).toBe(MOCK_GLARE_CHECKLIST_ITEMS.length);
      expect(fullEval.complianceScorePct).toBe(100);
      expect(fullEval.isFullyCompliant).toBe(true);

      const partialEval = evaluateGlareChecklist(MOCK_GLARE_CHECKLIST_ITEMS, [allIds[0]]);
      expect(partialEval.complianceScorePct).toBeLessThan(50);
      expect(partialEval.isFullyCompliant).toBe(false);
    });
  });

  describe('evaluateGlareExam', () => {
    it('evaluates answers and grades exam appropriately', () => {
      const perfectAnswers: Record<string, number> = {};
      MOCK_GLARE_EXAM_QUESTIONS.forEach((q) => {
        perfectAnswers[q.id] = q.correctIndex;
      });

      const passResult = evaluateGlareExam(MOCK_GLARE_EXAM_QUESTIONS, perfectAnswers);
      expect(passResult.score).toBe(MOCK_GLARE_EXAM_QUESTIONS.length);
      expect(passResult.percentage).toBe(100);
      expect(passResult.passed).toBe(true);

      const failAnswers: Record<string, number> = {};
      MOCK_GLARE_EXAM_QUESTIONS.forEach((q) => {
        failAnswers[q.id] = (q.correctIndex + 1) % q.optionsAz.length;
      });

      const failResult = evaluateGlareExam(MOCK_GLARE_EXAM_QUESTIONS, failAnswers);
      expect(failResult.score).toBe(0);
      expect(failResult.passed).toBe(false);
    });
  });

  describe('generateGlareCertificate & searchGlareRegistry', () => {
    it('generates cryptographic certificate with SİMA UID and PIN', () => {
      const station = MOCK_GLARE_CORRIDOR_STATIONS[0];
      const cert = generateGlareCertificate('99-GL-101', station, 96.5, 8.2, 0.05);

      expect(cert.certificateId).toMatch(/^GLARE-SAFE-AZ-2026-[0-9A-F]{8}$/);
      expect(cert.simaDigitalUid).toContain('SIMA-GLARE-');
      expect(cert.verificationPin).toHaveLength(6);
      expect(cert.vehiclePlate).toBe('99-GL-101');
      expect(cert.corridorCode).toBe(station.code);
      expect(cert.screeningEfficiencyPct).toBe(96.5);
      expect(cert.status).toBe('ACTIVE');
    });

    it('searches and filters public registry correctly', () => {
      expect(searchGlareRegistry(MOCK_GLARE_CERTIFICATES, '')).toHaveLength(
        MOCK_GLARE_CERTIFICATES.length
      );

      const filteredByPlate = searchGlareRegistry(MOCK_GLARE_CERTIFICATES, '99-GL-101');
      expect(filteredByPlate).toHaveLength(1);
      expect(filteredByPlate[0].vehiclePlate).toBe('99-GL-101');

      const filteredByCorridor = searchGlareRegistry(MOCK_GLARE_CERTIFICATES, 'GLARE-M4');
      expect(filteredByCorridor).toHaveLength(1);
      expect(filteredByCorridor[0].corridorCode).toBe('GLARE-M4-KM128');

      const nonExistent = searchGlareRegistry(MOCK_GLARE_CERTIFICATES, 'UNKNOWN-999');
      expect(nonExistent).toHaveLength(0);
    });
  });
});
