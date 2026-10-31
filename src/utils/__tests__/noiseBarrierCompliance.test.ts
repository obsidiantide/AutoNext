import { describe, it, expect } from 'vitest';
import {
  calculateTrafficSourceNoise,
  calculateMaekawaDiffraction,
  calculateAcousticPropagation,
  evaluateVehicleExhaustAcoustics,
  evaluateNoiseChecklist,
  gradeNoiseExam,
  generateNoiseGuardCertificate,
  searchNoiseCertificates,
  convertNoiseCurrency,
  AcousticCalculationInput,
} from '../noiseBarrierCompliance';
import {
  MOCK_NOISE_BARRIER_CORRIDORS,
  MOCK_NOISE_CHECKLIST_ITEMS,
  MOCK_NOISE_EXAM_QUESTIONS,
  MOCK_NOISE_GUARD_CERTIFICATES,
} from '../../data/mockNoiseBarrierData';

describe('noiseBarrierCompliance Utility Suite', () => {
  describe('calculateTrafficSourceNoise', () => {
    it('calculates higher noise with higher heavy truck percentage', () => {
      const noiseLowTruck = calculateTrafficSourceNoise({
        trafficVolumeVph: 2000,
        heavyTruckPercentage: 5,
        speedKmH: 90,
        roadSurface: 'dense_asphalt',
      });

      const noiseHighTruck = calculateTrafficSourceNoise({
        trafficVolumeVph: 2000,
        heavyTruckPercentage: 35,
        speedKmH: 90,
        roadSurface: 'dense_asphalt',
      });

      expect(noiseHighTruck).toBeGreaterThan(noiseLowTruck);
    });

    it('accounts for low noise whisper asphalt reduction', () => {
      const normalAsphalt = calculateTrafficSourceNoise({
        trafficVolumeVph: 2000,
        heavyTruckPercentage: 10,
        speedKmH: 80,
        roadSurface: 'dense_asphalt',
      });

      const porousAsphalt = calculateTrafficSourceNoise({
        trafficVolumeVph: 2000,
        heavyTruckPercentage: 10,
        speedKmH: 80,
        roadSurface: 'porous_low_noise',
      });

      expect(porousAsphalt).toBeLessThan(normalAsphalt);
    });
  });

  describe('calculateMaekawaDiffraction', () => {
    it('returns zero insertion loss when path difference is non-positive', () => {
      const res = calculateMaekawaDiffraction(0);
      expect(res.fresnelNumber).toBe(0);
      expect(res.insertionLossDb).toBe(0);

      const resNeg = calculateMaekawaDiffraction(-0.5);
      expect(resNeg.fresnelNumber).toBe(0);
      expect(resNeg.insertionLossDb).toBe(0);
    });

    it('calculates positive insertion loss for positive path difference', () => {
      const res = calculateMaekawaDiffraction(0.25, 500);
      expect(res.fresnelNumber).toBeGreaterThan(0);
      expect(res.insertionLossDb).toBeGreaterThan(5);
    });

    it('caps insertion loss to 24 dB maximum', () => {
      const res = calculateMaekawaDiffraction(50, 500);
      expect(res.insertionLossDb).toBeLessThanOrEqual(24.0);
    });
  });

  describe('calculateAcousticPropagation', () => {
    it('evaluates attenuation and compliance accurately', () => {
      const input: AcousticCalculationInput = {
        trafficVolumeVph: 3000,
        heavyTruckPercentage: 15,
        speedKmH: 90,
        roadSurface: 'dense_asphalt',
        barrierHeightMeters: 4.5,
        roadToBarrierDistanceMeters: 4,
        barrierToReceiverDistanceMeters: 35,
        receiverHeightMeters: 4.0,
        sourceHeightMeters: 0.5,
      };

      const result = calculateAcousticPropagation(input);

      expect(result.sourceSoundLevelDba).toBeGreaterThan(60);
      expect(result.barrierInsertionLossDb).toBeGreaterThan(0);
      expect(result.receiverSoundLevelDba).toBeLessThan(result.sourceSoundLevelDba);
      expect(result.acousticReductionPercentage).toBeGreaterThan(0);
      expect(['low', 'moderate', 'high', 'severe']).toContain(result.healthRiskLevel);
    });

    it('detects zero barrier attenuation when barrier height is 0', () => {
      const input: AcousticCalculationInput = {
        trafficVolumeVph: 3000,
        heavyTruckPercentage: 15,
        speedKmH: 90,
        roadSurface: 'dense_asphalt',
        barrierHeightMeters: 0,
        roadToBarrierDistanceMeters: 4,
        barrierToReceiverDistanceMeters: 35,
        receiverHeightMeters: 4.0,
        sourceHeightMeters: 0.5,
      };

      const result = calculateAcousticPropagation(input);
      expect(result.barrierInsertionLossDb).toBe(0);
    });
  });

  describe('evaluateVehicleExhaustAcoustics', () => {
    it('passes compliant OEM factory exhaust vehicle', () => {
      const result = evaluateVehicleExhaustAcoustics({
        vehiclePlate: '99-NS-101',
        vehicleModel: 'Toyota Corolla Hybrid',
        exhaustType: 'stock_factory',
        measuredRpm: 2500,
        measuredExhaustDba: 68.5,
        measuredHornDba: 102.0,
        hasModifiedMuffler: false,
        hasBypassValve: false,
        testedInResidentialZone: false,
      });

      expect(result.isExhaustCompliant).toBe(true);
      expect(result.isHornCompliant).toBe(true);
      expect(result.statutoryFineAzn).toBe(0);
      expect(result.inspectionVerdict).toBe('PASS');
    });

    it('penalizes illegal straight pipe pryamotok exhaust with 150 AZN fine and impound', () => {
      const result = evaluateVehicleExhaustAcoustics({
        vehiclePlate: '77-SP-909',
        vehicleModel: 'VAZ-2107 Custom',
        exhaustType: 'straight_pipe_pryamotok',
        measuredRpm: 3500,
        measuredExhaustDba: 98.0,
        measuredHornDba: 105.0,
        hasModifiedMuffler: true,
        hasBypassValve: false,
        testedInResidentialZone: true,
      });

      expect(result.isExhaustCompliant).toBe(false);
      expect(result.statutoryFineAzn).toBeGreaterThanOrEqual(150);
      expect(result.promptDiscountFineAzn).toBe(Number((result.statutoryFineAzn * 0.5).toFixed(2)));
      expect(result.impoundRequired).toBe(true);
      expect(result.inspectionVerdict).toBe('FAIL');
    });

    it('adds 30 AZN fine for unnecessary residential horn use', () => {
      const result = evaluateVehicleExhaustAcoustics({
        vehiclePlate: '10-AA-100',
        vehicleModel: 'Mercedes E-Class',
        exhaustType: 'stock_factory',
        measuredRpm: 2000,
        measuredExhaustDba: 74.0,
        measuredHornDba: 104.0,
        hasModifiedMuffler: false,
        hasBypassValve: false,
        testedInResidentialZone: true,
      });

      expect(result.statutoryFineAzn).toBe(30);
      expect(result.promptDiscountFineAzn).toBe(15);
    });
  });

  describe('evaluateNoiseChecklist', () => {
    it('returns 100% when all items are checked', () => {
      const allIds = MOCK_NOISE_CHECKLIST_ITEMS.map((item) => item.id);
      const res = evaluateNoiseChecklist(allIds, MOCK_NOISE_CHECKLIST_ITEMS);

      expect(res.score).toBe(100);
      expect(res.passed).toBe(true);
      expect(res.mandatoryPassed).toBe(true);
    });

    it('fails when mandatory items are missing', () => {
      const res = evaluateNoiseChecklist(['chk-06', 'chk-08'], MOCK_NOISE_CHECKLIST_ITEMS);
      expect(res.passed).toBe(false);
      expect(res.mandatoryPassed).toBe(false);
    });
  });

  describe('gradeNoiseExam', () => {
    it('calculates score and passes when at least 80% correct', () => {
      const answers: Record<number, number> = {};
      MOCK_NOISE_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = q.correctOptionIndex;
      });

      const res = gradeNoiseExam(answers, MOCK_NOISE_EXAM_QUESTIONS);
      expect(res.score).toBe(MOCK_NOISE_EXAM_QUESTIONS.length);
      expect(res.percentage).toBe(100);
      expect(res.passed).toBe(true);
    });

    it('fails when under 80%', () => {
      const answers: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      const res = gradeNoiseExam(answers, MOCK_NOISE_EXAM_QUESTIONS);
      expect(res.passed).toBe(false);
    });
  });

  describe('generateNoiseGuardCertificate and search', () => {
    it('generates a valid certificate object', () => {
      const cert = generateNoiseGuardCertificate({
        vehiclePlate: '99-NS-101',
        vehicleModel: 'Toyota Corolla Hybrid',
        corridor: MOCK_NOISE_BARRIER_CORRIDORS[0],
        measuredReceiverDba: 42.6,
        barrierInsertionLossDb: 14.8,
        vehicleExhaustDba: 68.5,
      });

      expect(cert.certificateId).toContain('NOISE-GUARD-AZ-2026-');
      expect(cert.vehiclePlate).toBe('99-NS-101');
      expect(cert.complianceStatus).toBe('CERTIFIED');
      expect(cert.simaSignatureUid).toContain('SIMA-AZ-');
    });

    it('filters certificates by query', () => {
      const results = searchNoiseCertificates('Toyota', MOCK_NOISE_GUARD_CERTIFICATES);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].vehicleModel).toContain('Toyota');

      const emptyResults = searchNoiseCertificates('NONEXISTENT_XYZ', MOCK_NOISE_GUARD_CERTIFICATES);
      expect(emptyResults.length).toBe(0);
    });
  });

  describe('convertNoiseCurrency', () => {
    it('converts correctly between AZN, USD, and EUR', () => {
      expect(convertNoiseCurrency(100, 'AZN')).toBe(100);
      expect(convertNoiseCurrency(100, 'USD')).toBe(58.82);
      expect(convertNoiseCurrency(100, 'EUR')).toBe(54.05);
    });
  });
});
