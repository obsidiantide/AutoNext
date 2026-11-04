import { describe, it, expect } from 'vitest';
import {
  convertFastGateCurrency,
  FAST_GATE_CURRENCY_RATES,
  FAST_GATE_CURRENCY_SYMBOLS,
  calculateFastGateTelemetry,
  evaluateFastGateChecklist,
  calculateFastGateExamScore,
  generateFastGateCertificate,
  FastGateCalculationParams,
  FastGateVehiclePreset,
} from '../fastGateCompliance';
import {
  MOCK_FAST_GATE_ZONES,
  MOCK_FAST_GATE_VEHICLES,
  MOCK_FAST_GATE_CHECKLIST,
  MOCK_FAST_GATE_QUESTIONS,
} from '../../data/mockFastGateData';

describe('fastGateCompliance utility suite', () => {
  describe('Currency conversion and formatting', () => {
    it('converts AZN to USD and EUR correctly', () => {
      const amountAzn = 100;
      expect(convertFastGateCurrency(amountAzn, 'AZN')).toBe(100);
      expect(convertFastGateCurrency(amountAzn, 'USD')).toBe(58.82);
      expect(convertFastGateCurrency(amountAzn, 'EUR')).toBe(54.05);
    });

    it('provides correct currency symbols', () => {
      expect(FAST_GATE_CURRENCY_SYMBOLS.AZN).toBe('₼');
      expect(FAST_GATE_CURRENCY_SYMBOLS.USD).toBe('$');
      expect(FAST_GATE_CURRENCY_SYMBOLS.EUR).toBe('€');
    });
  });

  describe('SCADA Telemetry and Contraflow Calculations', () => {
    const baseParams: FastGateCalculationParams = {
      mainlineQueueKm: 3.5,
      diversionFlowVehHour: 1200,
      contraflowSpeedKmh: 50,
      gateOpenTimeSeconds: 45,
      operatingPressureBar: 200,
    };

    it('calculates contraflow capacity, queue clearance and response time saved', () => {
      const result = calculateFastGateTelemetry(baseParams, MOCK_FAST_GATE_VEHICLES[0]); // Fire truck
      expect(result.normalKineticCapacityKj).toBe(350);
      expect(result.contraflowCapacityVehHour).toBeGreaterThan(1000);
      expect(result.queueClearanceTimeMinutes).toBeGreaterThan(10);
      expect(result.emergencyResponseMinutesSaved).toBeGreaterThan(5);
      expect(result.secondaryCrashReductionPercent).toBeGreaterThan(30);
      expect(result.hydraulicSystemHealth).toBe('OPTIMAL');
      expect(result.operationalMode).toBe('PRIORITY_EMERGENCY_BURST');
      expect(result.clearanceStatus).toBe('AUTHORIZED_DISPATCH');
      expect(result.unauthorizedFineAzn).toBe(0);
      expect(result.discountedFineAzn).toBe(0);
    });

    it('evaluates hydraulic system health correctly based on pressure', () => {
      // Critical fault < 140 bar
      const critResult = calculateFastGateTelemetry({
        ...baseParams,
        operatingPressureBar: 130,
      });
      expect(critResult.hydraulicSystemHealth).toBe('CRITICAL_FAULT');

      // Degraded < 170 bar or > 235 bar
      const degLow = calculateFastGateTelemetry({
        ...baseParams,
        operatingPressureBar: 160,
      });
      expect(degLow.hydraulicSystemHealth).toBe('DEGRADED_PRESSURE');

      const degHigh = calculateFastGateTelemetry({
        ...baseParams,
        operatingPressureBar: 240,
      });
      expect(degHigh.hydraulicSystemHealth).toBe('DEGRADED_PRESSURE');

      // Optimal 180-220 bar
      const opt = calculateFastGateTelemetry({
        ...baseParams,
        operatingPressureBar: 210,
      });
      expect(opt.hydraulicSystemHealth).toBe('OPTIMAL');
    });

    it('applies statutory fines for civilian illegal U-turns (İXM 327.4)', () => {
      const civilianPreset = MOCK_FAST_GATE_VEHICLES.find(
        (v) => v.defaultViolation === 'CIVILIAN_ILLEGAL_UTURN'
      )!;
      const result = calculateFastGateTelemetry(baseParams, civilianPreset);

      expect(result.clearanceStatus).toBe('UNAUTHORIZED_CROSSING');
      expect(result.unauthorizedFineAzn).toBe(100);
      expect(result.unauthorizedPoints).toBe(4);
      expect(result.discountedFineAzn).toBe(50);
      expect(result.legalArticleAz).toContain('327.4');
    });

    it('applies statutory fines for contraflow speeding (İXM 328.2)', () => {
      const speedingTruck = MOCK_FAST_GATE_VEHICLES.find(
        (v) => v.defaultViolation === 'CONTRAFLOW_SPEEDING'
      )!;
      const result = calculateFastGateTelemetry(baseParams, speedingTruck);

      expect(result.clearanceStatus).toBe('UNAUTHORIZED_CROSSING');
      expect(result.unauthorizedFineAzn).toBe(50);
      expect(result.unauthorizedPoints).toBe(2);
      expect(result.discountedFineAzn).toBe(25);
      expect(result.legalArticleAz).toContain('328.2');
    });

    it('applies barrier damage restitution under Civil Code 1108 & İXM 353.1', () => {
      const crashingPreset = MOCK_FAST_GATE_VEHICLES.find(
        (v) => v.defaultViolation === 'BARRIER_IMPACT_DAMAGE'
      )!;
      const result = calculateFastGateTelemetry(baseParams, crashingPreset);

      expect(result.clearanceStatus).toBe('UNAUTHORIZED_CROSSING');
      expect(result.unauthorizedFineAzn).toBe(600);
      expect(result.unauthorizedPoints).toBe(4);
      expect(result.assetDamageRestitutionAzn).toBe(1850);
      expect(result.legalArticleAz).toContain('353.1');
      expect(result.legalArticleAz).toContain('1108');
    });
  });

  describe('Technical Checklist Evaluation', () => {
    it('evaluates fully checked checklist as 100% compliant', () => {
      const allChecked = MOCK_FAST_GATE_CHECKLIST.map((item) => ({
        id: item.id,
        checked: true,
      }));
      const evaluation = evaluateFastGateChecklist(allChecked);

      expect(evaluation.allPassed).toBe(true);
      expect(evaluation.complianceRating).toBe(100);
      expect(evaluation.passedCount).toBe(allChecked.length);
      expect(evaluation.statusAz).toContain('Tam Uyğundur');
    });

    it('evaluates partial checklist correctly', () => {
      const partialChecked = MOCK_FAST_GATE_CHECKLIST.map((item, index) => ({
        id: item.id,
        checked: index < 5,
      }));
      const evaluation = evaluateFastGateChecklist(partialChecked);

      expect(evaluation.allPassed).toBe(false);
      expect(evaluation.passedCount).toBe(5);
      expect(evaluation.complianceRating).toBe(50);
      expect(evaluation.statusAz).toContain('Qeyri-kafi');
    });
  });

  describe('Exam Scoring', () => {
    it('calculates perfect 100% score for correct answers', () => {
      const perfectAnswers: Record<string, number> = {};
      MOCK_FAST_GATE_QUESTIONS.forEach((q) => {
        perfectAnswers[q.id] = q.correctAnswerIndex;
      });

      const examResult = calculateFastGateExamScore(perfectAnswers, MOCK_FAST_GATE_QUESTIONS);
      expect(examResult.score).toBe(10);
      expect(examResult.total).toBe(10);
      expect(examResult.percent).toBe(100);
      expect(examResult.passed).toBe(true);
      expect(examResult.gradeAz).toContain('100%');
    });

    it('calculates failed grade when score is below 80%', () => {
      const failingAnswers: Record<string, number> = {};
      MOCK_FAST_GATE_QUESTIONS.forEach((q, idx) => {
        // Only 3 answers correct
        failingAnswers[q.id] = idx < 3 ? q.correctAnswerIndex : 99;
      });

      const examResult = calculateFastGateExamScore(failingAnswers, MOCK_FAST_GATE_QUESTIONS);
      expect(examResult.passed).toBe(false);
      expect(examResult.score).toBe(3);
      expect(examResult.percent).toBe(30);
      expect(examResult.gradeAz).toContain('Kəsildi');
    });
  });

  describe('Certificate Generation', () => {
    it('generates a valid Fast-Gate operational clearance certificate', () => {
      const zone = MOCK_FAST_GATE_ZONES[0];
      const vehicle = MOCK_FAST_GATE_VEHICLES[0];
      const cert = generateFastGateCertificate(zone, vehicle);

      expect(cert.certificateUid).toMatch(/^FAST-GATE-AZ-2026-\d{5}$/);
      expect(cert.simaSignatureUid).toMatch(/^SIMA-AZ-GOV-/);
      expect(cert.barrierReleasePin).toMatch(/^\d{4}-\d{4}$/);
      expect(cert.sha256Hash).toMatch(/^e3b0c442/);
      expect(cert.zoneCode).toBe(zone.code);
      expect(cert.vehiclePlate).toBe(vehicle.plate);
      expect(cert.status).toBe('ACTIVE_DISPATCH');
    });
  });
});
