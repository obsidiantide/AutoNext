import { describe, expect, it } from 'vitest';
import {
  CURRENCY_RATES,
  SLOPE_REGISTRY,
  computeSlopeStability,
  evaluateGeotechnicalChecklist,
  evaluateGeotechnicalExam,
  evaluateVehicleTransitEligibility,
  formatCurrency,
  generateSlopeSafeCertificate,
} from '../slopeSafeCompliance';

describe('slopeSafeCompliance utility module', () => {
  const asset = SLOPE_REGISTRY.mughanly_pass;

  describe('formatCurrency', () => {
    it('formats AZN correctly', () => {
      expect(formatCurrency(100, 'AZN')).toBe('100.00 ₼');
    });

    it('formats USD correctly with conversion rate', () => {
      const expected = (100 * CURRENCY_RATES.USD).toFixed(2);
      expect(formatCurrency(100, 'USD')).toBe(`${expected} $`);
    });

    it('formats EUR correctly with conversion rate', () => {
      const expected = (100 * CURRENCY_RATES.EUR).toFixed(2);
      expect(formatCurrency(100, 'EUR')).toBe(`${expected} €`);
    });
  });

  describe('computeSlopeStability', () => {
    it('computes stable green conditions for baseline values', () => {
      const res = computeSlopeStability(asset, 20, 0.5, 5, 0, 0);
      expect(res.computedFactorOfSafety).toBeGreaterThanOrEqual(1.30);
      expect(res.computedRiskLevel).toBe('stable_green');
      expect(res.barrierStatus).toBe('open_normal');
      expect(res.authorizedSpeedLimitKmH).toBe(90);
      expect(res.heavyTruckProhibition).toBe(false);
      expect(res.rockfallImpactDetected).toBe(false);
      expect(res.barrierEnergyAbsorptionKj).toBe(0);
      expect(res.barrierAbsorptionMarginPct).toBe(100);
    });

    it('computes caution yellow conditions when pore pressure or inclinometer increases moderately', () => {
      // criticalInclinometer is 8.0, 50% is 4.0
      const res = computeSlopeStability(asset, 50, 4.2, 15, 0, 0);
      expect(res.computedRiskLevel).toBe('caution_yellow');
      expect(res.barrierStatus).toBe('caution_speed_reduced');
      expect(res.authorizedSpeedLimitKmH).toBe(60);
      expect(res.heavyTruckProhibition).toBe(false);
    });

    it('computes critical orange conditions when approaching critical limits', () => {
      // criticalPorePressure is 95, 90% is 85.5
      const res = computeSlopeStability(asset, 86, 3.0, 15, 0, 0);
      expect(res.computedRiskLevel).toBe('critical_orange');
      expect(res.barrierStatus).toBe('single_lane_contraflow');
      expect(res.authorizedSpeedLimitKmH).toBe(40);
      expect(res.heavyTruckProhibition).toBe(true);
    });

    it('computes emergency red condition when FoS drops below 1.0 or inclinometer reaches critical velocity', () => {
      const res = computeSlopeStability(asset, 95, 8.5, 45, 0, 0);
      expect(res.computedRiskLevel).toBe('emergency_red');
      expect(res.barrierStatus).toBe('fully_barricaded_closed');
      expect(res.authorizedSpeedLimitKmH).toBe(0);
      expect(res.heavyTruckProhibition).toBe(true);
    });

    it('computes rockfall kinetic energy and barrier absorption correctly', () => {
      // 2 tons boulder at 20 m/s: E_k = 0.5 * 2000 kg * 20^2 = 400,000 J = 400 kJ
      const res = computeSlopeStability(asset, 20, 0.5, 5, 2.0, 20);
      expect(res.rockfallImpactDetected).toBe(true);
      expect(res.barrierEnergyAbsorptionKj).toBe(400);
      // Asset has 5000 kJ capacity: margin = (5000 - 400) / 5000 * 100 = 92%
      expect(res.barrierAbsorptionMarginPct).toBe(92);
    });
  });

  describe('evaluateVehicleTransitEligibility', () => {
    it('allows passenger car during stable green conditions', () => {
      const telemetry = computeSlopeStability(asset, 20, 0.5, 5);
      const assessment = evaluateVehicleTransitEligibility('passenger_car', 1.6, telemetry);
      expect(assessment.isAllowedToTransit).toBe(true);
      expect(assessment.rejectionReasonAz).toBeNull();
      expect(assessment.transitTariffAzn).toBe(15);
      expect(assessment.geotechnicalMonitoringFeeAzn).toBe(2.7); // 18% of 15
      expect(assessment.statutoryFineAzn).toBe(0);
    });

    it('prohibits heavy truck >10t during critical orange conditions due to vibration risk', () => {
      const telemetry = computeSlopeStability(asset, 86, 3.0, 15);
      const assessment = evaluateVehicleTransitEligibility('heavy_freight_tir', 40.0, telemetry);
      expect(assessment.isAllowedToTransit).toBe(false);
      expect(assessment.rejectionReasonAz).toContain('çəkisi >10 ton olan ağır nəqliyyatın vibrasiya riski');
      expect(assessment.statutoryFineAzn).toBe(600);
      expect(assessment.discountedFineAzn).toBe(300);
    });

    it('prohibits all civilian vehicles during emergency red closure', () => {
      const telemetry = computeSlopeStability(asset, 95, 8.5, 45);
      const assessment = evaluateVehicleTransitEligibility('suv_4x4', 2.5, telemetry);
      expect(assessment.isAllowedToTransit).toBe(false);
      expect(assessment.rejectionReasonAz).toContain('dağ yolu tamamilə bağlanmışdır');
      expect(assessment.statutoryFineAzn).toBe(40);
      expect(assessment.discountedFineAzn).toBe(20);
    });

    it('allows emergency patrol vehicles even during emergency closure with zero tariff', () => {
      const telemetry = computeSlopeStability(asset, 95, 8.5, 45);
      const assessment = evaluateVehicleTransitEligibility('emergency_patrol', 14.5, telemetry);
      expect(assessment.isAllowedToTransit).toBe(true);
      expect(assessment.isHeavyVehicleVibrationExempt).toBe(true);
      expect(assessment.transitTariffAzn).toBe(0);
      expect(assessment.geotechnicalMonitoringFeeAzn).toBe(0);
    });
  });

  describe('evaluateGeotechnicalChecklist', () => {
    it('passes inspection when all items are compliant', () => {
      const mockItems = [
        { id: '1', categoryAz: 'A', categoryEn: 'A', titleAz: 'T1', titleEn: 'T1', standardReference: 'R', isCompliant: true, notesAz: 'N', notesEn: 'N' },
        { id: '2', categoryAz: 'A', categoryEn: 'A', titleAz: 'T2', titleEn: 'T2', standardReference: 'R', isCompliant: true, notesAz: 'N', notesEn: 'N' },
      ];
      const result = evaluateGeotechnicalChecklist(mockItems);
      expect(result.totalItems).toBe(2);
      expect(result.compliantItems).toBe(2);
      expect(result.complianceScorePct).toBe(100);
      expect(result.passedInspection).toBe(true);
      expect(result.criticalDefectsCount).toBe(0);
    });

    it('fails inspection when compliance is below threshold', () => {
      const mockItems = [
        { id: '1', categoryAz: 'A', categoryEn: 'A', titleAz: 'T1', titleEn: 'T1', standardReference: 'R', isCompliant: false, notesAz: 'N', notesEn: 'N' },
        { id: '2', categoryAz: 'A', categoryEn: 'A', titleAz: 'T2', titleEn: 'T2', standardReference: 'R', isCompliant: false, notesAz: 'N', notesEn: 'N' },
        { id: '3', categoryAz: 'A', categoryEn: 'A', titleAz: 'T3', titleEn: 'T3', standardReference: 'R', isCompliant: false, notesAz: 'N', notesEn: 'N' },
        { id: '4', categoryAz: 'A', categoryEn: 'A', titleAz: 'T4', titleEn: 'T4', standardReference: 'R', isCompliant: true, notesAz: 'N', notesEn: 'N' },
      ];
      const result = evaluateGeotechnicalChecklist(mockItems);
      expect(result.complianceScorePct).toBe(25);
      expect(result.passedInspection).toBe(false);
      expect(result.criticalDefectsCount).toBe(3);
    });
  });

  describe('evaluateGeotechnicalExam', () => {
    const mockQuestions = [
      { id: 1, questionAz: 'Q1', questionEn: 'Q1', optionsAz: ['A', 'B'], optionsEn: ['A', 'B'], correctOptionIndex: 0, explanationAz: 'E', explanationEn: 'E' },
      { id: 2, questionAz: 'Q2', questionEn: 'Q2', optionsAz: ['A', 'B'], optionsEn: ['A', 'B'], correctOptionIndex: 1, explanationAz: 'E', explanationEn: 'E' },
    ];

    it('evaluates perfect score', () => {
      const result = evaluateGeotechnicalExam(mockQuestions, { 1: 0, 2: 1 });
      expect(result.correctAnswers).toBe(2);
      expect(result.scorePercentage).toBe(100);
      expect(result.isPassed).toBe(true);
    });

    it('evaluates failing score', () => {
      const result = evaluateGeotechnicalExam(mockQuestions, { 1: 1, 2: 0 });
      expect(result.correctAnswers).toBe(0);
      expect(result.scorePercentage).toBe(0);
      expect(result.isPassed).toBe(false);
    });
  });

  describe('generateSlopeSafeCertificate', () => {
    it('creates a complete verifiable certificate', () => {
      const telemetry = computeSlopeStability(asset, 20, 0.5, 5);
      const assessment = evaluateVehicleTransitEligibility('suv_4x4', 2.85, telemetry);
      const cert = generateSlopeSafeCertificate(asset, '99-SL-101', 'suv_4x4', 2.85, telemetry, assessment);

      expect(cert.certificateId).toMatch(/^SLOPE-SAFE-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-SL-101');
      expect(cert.barrierPassPin).toHaveLength(6);
      expect(cert.simaDigitalSignatureHash).toContain('SIMA-GEO');
      expect(cert.authorizedCorridorAz).toContain(asset.highwayCode);
      expect(cert.totalDutyPaidAzn).toBe(assessment.transitTariffAzn + assessment.geotechnicalMonitoringFeeAzn);
      expect(cert.verificationQrLink).toContain(cert.certificateId);
    });
  });
});
