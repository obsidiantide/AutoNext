import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  evaluateMaterialDiscrimination,
  evaluateRadiographyAnomaly,
  evaluateRpmTelemetry,
  calculateCustomsScanningFees,
  evaluateScannerChecklist,
  evaluateScannerExam,
  generateOfficialCustomsScannerCertificate,
} from '../customsScannerCompliance';
import {
  MOCK_CHECKPOINTS_LIST,
  MOCK_TRUCK_PRESETS,
  MOCK_SCANNER_CHECKLIST,
  MOCK_SCANNER_EXAM_QUESTIONS,
} from '../../data/mockCustomsScannerData';

describe('CustomsScannerCompliance Utility Suite', () => {
  describe('Currency and Formatting', () => {
    it('converts AZN amounts to USD and EUR correctly', () => {
      const aznAmount = 100;
      expect(convertAzn(aznAmount, 'AZN')).toBe(100);
      expect(convertAzn(aznAmount, 'USD')).toBeCloseTo(58.82, 1);
      expect(convertAzn(aznAmount, 'EUR')).toBeCloseTo(54.35, 1);
    });

    it('formats currencies with proper symbols', () => {
      expect(formatCurrency(120.5, 'AZN')).toContain('₼');
      expect(formatCurrency(120.5, 'USD')).toContain('$');
      expect(formatCurrency(120.5, 'EUR')).toContain('€');
    });
  });

  describe('Material Discrimination (Dual-Energy Z_eff)', () => {
    it('evaluates ORGANIC materials correctly with orange spectrum', () => {
      const res = evaluateMaterialDiscrimination('ORGANIC', 0.4, 0.4);
      expect(res.dominantMaterial).toBe('ORGANIC');
      expect(res.organicPercent).toBeGreaterThan(60);
      expect(res.colorHexCode).toBe('#ea580c');
      expect(res.estimatedEffectiveAtomicNumber).toBeLessThanOrEqual(10);
      expect(res.materialLabelAz).toContain('Üzvi maddələr');
    });

    it('evaluates INORGANIC_LIGHT materials with green spectrum', () => {
      const res = evaluateMaterialDiscrimination('INORGANIC_LIGHT', 2.0, 2.0);
      expect(res.dominantMaterial).toBe('INORGANIC_LIGHT');
      expect(res.inorganicPercent).toBeGreaterThan(50);
      expect(res.colorHexCode).toBe('#16a34a');
      expect(res.estimatedEffectiveAtomicNumber).toBeGreaterThan(10);
      expect(res.estimatedEffectiveAtomicNumber).toBeLessThanOrEqual(20);
    });

    it('evaluates HEAVY_METALS with blue spectrum', () => {
      const res = evaluateMaterialDiscrimination('HEAVY_METALS', 5.0, 5.0);
      expect(res.dominantMaterial).toBe('HEAVY_METALS');
      expect(res.heavyMetalsPercent).toBeGreaterThan(50);
      expect(res.colorHexCode).toBe('#2563eb');
      expect(res.estimatedEffectiveAtomicNumber).toBeGreaterThan(20);
    });

    it('evaluates DENSE_SHIELDING with dark slate/black spectrum', () => {
      const res = evaluateMaterialDiscrimination('DENSE_SHIELDING', 11.0, 11.0);
      expect(res.dominantMaterial).toBe('DENSE_SHIELDING');
      expect(res.denseShieldingPercent).toBeGreaterThanOrEqual(50);
      expect(res.colorHexCode).toBe('#0f172a');
      expect(res.estimatedEffectiveAtomicNumber).toBeGreaterThanOrEqual(82);
    });
  });

  describe('Radiography Density Anomaly Evaluation', () => {
    it('approves uniform legal cargo without anomaly', () => {
      const res = evaluateRadiographyAnomaly(0.4, 0.42, 'DECLARED_CARGO_UNIFORM', 0);
      expect(res.verdict).toBe('CLEAR_PASSED');
      expect(res.riskScore).toBeLessThan(30);
      expect(res.isPhysicalInspectionRequired).toBe(false);
      expect(res.rejectionReasonAz).toBeNull();
    });

    it('flags suspicious density delta when variance is high', () => {
      const res = evaluateRadiographyAnomaly(2.15, 2.78, 'DECLARED_CARGO_UNIFORM', 0);
      expect(res.verdict).toBe('SUSPICIOUS_DENSITY');
      expect(res.isPhysicalInspectionRequired).toBe(true);
      expect(res.densityDeltaGcm3).toBeCloseTo(0.63, 2);
      expect(res.rejectionReasonAz).toContain('Gömrük Məcəlləsi Maddə 42');
    });

    it('flags critical concealment when hidden compartment is present', () => {
      const res = evaluateRadiographyAnomaly(4.85, 5.92, 'FALSE_BULKHEAD_FRONT', 160);
      expect(res.verdict).toBe('CRITICAL_CONCEALMENT_DETECTED');
      expect(res.riskScore).toBeGreaterThanOrEqual(90);
      expect(res.isPhysicalInspectionRequired).toBe(true);
      expect(res.rejectionReasonAz).toContain('İXM Maddə 482 pozuntusu');
    });
  });

  describe('Radiation Portal Monitor (RPM) Telemetry', () => {
    it('approves natural background radiation', () => {
      const res = evaluateRpmTelemetry(0.11, 0);
      expect(res.alarmLevel).toBe('CLEAR_BACKGROUND');
      expect(res.isRadiationSafe).toBe(true);
      expect(res.radiologicalRiskScore).toBeLessThan(20);
    });

    it('flags elevated non-hazardous radiation', () => {
      const res = evaluateRpmTelemetry(0.28, 2);
      expect(res.alarmLevel).toBe('ELEVATED_NON_HAZARDOUS');
      expect(res.isRadiationSafe).toBe(false);
      expect(res.actionProtocolAz).toContain('İzotop Analizatoru Standı');
    });

    it('triggers critical radioactive threat on high dose rate or neutron counts', () => {
      const res = evaluateRpmTelemetry(0.65, 12);
      expect(res.alarmLevel).toBe('RADIOACTIVE_THREAT_DETECTED');
      expect(res.isRadiationSafe).toBe(false);
      expect(res.radiologicalRiskScore).toBeGreaterThanOrEqual(95);
      expect(res.actionProtocolAz).toContain('IAEA SSG-55 Qırmızı Protokolu');
    });
  });

  describe('Statutory Customs Fees and Sanctions', () => {
    it('applies standard base fee without discount for normal truck', () => {
      const res = calculateCustomsScanningFees('GANTRY_HIGH_ENERGY_6MEV', 'CLEAR_PASSED', false, false);
      expect(res.baseScanFeeAzn).toBe(30);
      expect(res.greenCorridorDiscountAzn).toBe(0);
      expect(res.totalPayableAzn).toBe(30);
    });

    it('applies 100% discount for Green Corridor authorized carriers', () => {
      const res = calculateCustomsScanningFees('GANTRY_HIGH_ENERGY_6MEV', 'CLEAR_PASSED', false, true);
      expect(res.greenCorridorDiscountAzn).toBe(30);
      expect(res.totalPayableAzn).toBe(0);
    });

    it('adds rescan and physical escort fees for suspicious density', () => {
      const res = calculateCustomsScanningFees('GANTRY_HIGH_ENERGY_6MEV', 'SUSPICIOUS_DENSITY', false, false);
      expect(res.rescanFeeAzn).toBe(50);
      expect(res.physicalEscortFeeAzn).toBe(40);
      expect(res.totalPayableAzn).toBe(30 + 50 + 40);
    });

    it('levies administrative fine and full strip-down inspection for critical concealment', () => {
      const res = calculateCustomsScanningFees('GANTRY_HIGH_ENERGY_6MEV', 'CRITICAL_CONCEALMENT_DETECTED', false, false);
      expect(res.physicalEscortFeeAzn).toBe(80);
      expect(res.k9InspectionFeeAzn).toBe(35);
      expect(res.statutoryFineAzn).toBe(1500);
      expect(res.totalPayableAzn).toBe(30 + 80 + 35 + 1500);
    });
  });

  describe('Safety Checklist and Exam Evaluation', () => {
    it('evaluates safety checklist scoring and detects missing mandatory items', () => {
      const allIds = MOCK_SCANNER_CHECKLIST.map((item) => item.id);
      const fullRes = evaluateScannerChecklist(allIds, MOCK_SCANNER_CHECKLIST);
      expect(fullRes.isAllMandatoryApproved).toBe(true);
      expect(fullRes.complianceScorePercent).toBe(100);

      const partialIds = allIds.slice(0, 3);
      const partialRes = evaluateScannerChecklist(partialIds, MOCK_SCANNER_CHECKLIST);
      expect(partialRes.isAllMandatoryApproved).toBe(false);
      expect(partialRes.missingMandatoryItemsAz.length).toBeGreaterThan(0);
    });

    it('evaluates theoretical examination scoring and pass/fail thresholds', () => {
      const perfectAnswers: Record<string, number> = {};
      MOCK_SCANNER_EXAM_QUESTIONS.forEach((q) => {
        perfectAnswers[q.id] = q.correctOptionIndex;
      });

      const passRes = evaluateScannerExam(perfectAnswers, MOCK_SCANNER_EXAM_QUESTIONS);
      expect(passRes.isPassed).toBe(true);
      expect(passRes.scorePercent).toBe(100);
      expect(passRes.correctAnswersCount).toBe(MOCK_SCANNER_EXAM_QUESTIONS.length);

      const failAnswers: Record<string, number> = {};
      MOCK_SCANNER_EXAM_QUESTIONS.forEach((q) => {
        failAnswers[q.id] = (q.correctOptionIndex + 1) % 4;
      });
      const failRes = evaluateScannerExam(failAnswers, MOCK_SCANNER_EXAM_QUESTIONS);
      expect(failRes.isPassed).toBe(false);
      expect(failRes.scorePercent).toBe(0);
    });
  });

  describe('Official Customs Scanner Certificate Generation', () => {
    it('generates an authentic certificate with correct attributes and checksums', () => {
      const truck = MOCK_TRUCK_PRESETS[0];
      const checkpoint = MOCK_CHECKPOINTS_LIST[0];
      const anomaly = evaluateRadiographyAnomaly(
        truck.declaredDensityGcm3,
        truck.measuredDensityGcm3,
        truck.anomalyLocation,
        truck.anomalyVolumeLitres
      );
      const material = evaluateMaterialDiscrimination(
        truck.dominantMaterial,
        truck.declaredDensityGcm3,
        truck.measuredDensityGcm3
      );
      const rpm = evaluateRpmTelemetry(truck.rpmGammaDoseRate, truck.rpmNeutronCps);
      const fee = calculateCustomsScanningFees(truck.scannerType, anomaly.verdict, !rpm.isRadiationSafe, truck.isGreenCorridor);

      const cert = generateOfficialCustomsScannerCertificate(truck, checkpoint, anomaly, material, rpm, fee);

      expect(cert.certificateId).toMatch(/^DGK-SCAN-AZ-2026-\d{5}$/);
      expect(cert.trailerPlate).toBe(truck.trailerPlate);
      expect(cert.checkpointAz).toBe(checkpoint.nameAz);
      expect(cert.sha256SecurityChecksum).toBeDefined();
      expect(cert.simaDigitalUid).toContain('SIMA-DGK-XRAY-');
      expect(cert.inspectionLaneCode).toMatch(/^LANE-XRAY-0\d$/);
    });
  });
});
