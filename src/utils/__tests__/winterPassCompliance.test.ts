import { describe, it, expect } from 'vitest';
import {
  evaluateRwisTelemetry,
  calculateDeIcingRequirements,
  calculateTireChainCompliance,
  dispatchWinterMachinery,
  evaluateWinterChecklist,
  gradeWinterExam,
  generateWinterPassCertificate,
  convertAznTo,
} from '../winterPassCompliance';

describe('winterPassCompliance Unit Test Suite', () => {
  describe('convertAznTo Currency Conversion', () => {
    it('returns original amount for AZN', () => {
      expect(convertAznTo(100, 'AZN')).toBe(100);
    });

    it('converts to USD correctly', () => {
      expect(convertAznTo(170, 'USD')).toBe(100.0);
    });

    it('converts to EUR correctly', () => {
      expect(convertAznTo(185, 'EUR')).toBe(100.0);
    });
  });

  describe('evaluateRwisTelemetry', () => {
    it('evaluates normal open road conditions', () => {
      const result = evaluateRwisTelemetry({
        roadTempC: 1,
        snowDepthCm: 2,
        iceThicknessMm: 0,
        frictionCoeff: 0.65,
        windGustKmh: 20,
        visibilityM: 1000,
        avalancheRisk: 1,
      });

      expect(result.status).toBe('open_all');
      expect(result.fineRiskAzn).toBe(0);
      expect(result.advisoryAz).toContain('bütün növ nəqliyyat vasitələri üçün açıqdır');
    });

    it('evaluates heavy truck restricted conditions', () => {
      const result = evaluateRwisTelemetry({
        roadTempC: -4,
        snowDepthCm: 10,
        iceThicknessMm: 2,
        frictionCoeff: 0.30,
        windGustKmh: 35,
        visibilityM: 300,
        avalancheRisk: 2,
      });

      expect(result.status).toBe('heavy_truck_restricted');
      expect(result.fineRiskAzn).toBe(50);
      expect(result.advisoryAz).toContain('ağır yük maşınlarının (TIR)');
    });

    it('evaluates chains required condition when ice or friction is severe', () => {
      const result = evaluateRwisTelemetry({
        roadTempC: -8,
        snowDepthCm: 20,
        iceThicknessMm: 7,
        frictionCoeff: 0.20,
        windGustKmh: 50,
        visibilityM: 80,
        avalancheRisk: 3,
      });

      expect(result.status).toBe('chains_required');
      expect(result.fineRiskAzn).toBe(50);
      expect(result.advisoryAz).toContain('YALNIZ təkər zənciri');
    });

    it('evaluates full closure on extreme avalanche danger or blizzard', () => {
      const result = evaluateRwisTelemetry({
        roadTempC: -18,
        snowDepthCm: 50,
        iceThicknessMm: 12,
        frictionCoeff: 0.10,
        windGustKmh: 100,
        visibilityM: 10,
        avalancheRisk: 5,
      });

      expect(result.status).toBe('full_closure');
      expect(result.fineRiskAzn).toBe(100);
      expect(result.advisoryAz).toContain('aşırım tam bağlanıb');
    });
  });

  describe('calculateDeIcingRequirements', () => {
    it('calculates NaCl technical salt requirements and costs', () => {
      const result = calculateDeIcingRequirements('nacl_salt', -4, 2, 10, 7.5, 'AZN');
      expect(result.dosageGm2).toBeGreaterThan(0);
      expect(result.coverageAreaM2).toBe(75000);
      expect(result.totalReagentTons).toBeGreaterThan(0);
      expect(result.totalCostAzn).toBeGreaterThan(0);
      expect(result.freezingPointDepressionC).toBe(-10);
      expect(result.environmentalImpactAz).toContain('korroziya');
    });

    it('calculates Bischofite (MgCl2) eco-friendly requirements down to -30C', () => {
      const result = calculateDeIcingRequirements('bischofite_mgcl2', -20, 8, 15, 8.0, 'AZN');
      expect(result.dosageGm2).toBeGreaterThan(30);
      expect(result.freezingPointDepressionC).toBe(-30);
      expect(result.environmentalImpactAz).toContain('Ekoloji təmiz mineral');
      expect(result.vat18Azn).toBeGreaterThan(0);
    });

    it('calculates sand-salt mix for steep serpentines', () => {
      const result = calculateDeIcingRequirements('sand_salt_mix', -5, 4, 12, 7.5, 'AZN');
      expect(result.dosageGm2).toBeGreaterThanOrEqual(200);
      expect(result.reagentNameAz).toContain('Qum-Duz Qarışığı');
      expect(result.totalCostUsd).toBeGreaterThan(0);
      expect(result.totalCostEur).toBeGreaterThan(0);
    });
  });

  describe('calculateTireChainCompliance', () => {
    it('certifies compliant 4WD setup with 12mm diamond steel chains', () => {
      const result = calculateTireChainCompliance('awd_4x4', 'diamond_steel_12mm', 265, 40, 'chains_required');
      expect(result.compliant).toBe(true);
      expect(result.fineRiskAzn).toBe(0);
      expect(result.maxAllowedSpeedKmh).toBe(50);
      expect(result.driveAxlePlacementAz).toContain('Bütün 4 təkərə');
    });

    it('rejects textile snow socks when chains are strictly mandatory', () => {
      const result = calculateTireChainCompliance('rwd', 'textile_snow_socks', 245, 20, 'chains_required');
      expect(result.compliant).toBe(false);
      expect(result.fineRiskAzn).toBe(50);
      expect(result.recommendationsAz[0]).toContain('Tekstil qar corabları');
    });

    it('flags insufficient wheel arch clearance (<14mm)', () => {
      const result = calculateTireChainCompliance('fwd', 'diamond_steel_9mm', 225, 11, 'chains_required');
      expect(result.compliant).toBe(false);
      expect(result.recommendationsAz.some((r) => r.includes('<14mm'))).toBe(true);
    });

    it('flags full closure warning if road is fully shut', () => {
      const result = calculateTireChainCompliance('awd_4x4', 'diamond_steel_12mm', 265, 40, 'full_closure');
      expect(result.compliant).toBe(false);
      expect(result.fineRiskAzn).toBe(100);
      expect(result.recommendationsAz.some((r) => r.includes('tam bağlıdır'))).toBe(true);
    });
  });

  describe('dispatchWinterMachinery', () => {
    it('dispatches snow plow blade correctly', () => {
      const result = dispatchWinterMachinery('m4_agsu_pass', 'snow_plow_blade', 14, 'standard');
      expect(result.machineryType).toBe('snow_plow_blade');
      expect(result.etaMinutes).toBeGreaterThan(0);
      expect(result.transitSpeedKmh).toBe(50);
      expect(result.operationalCostAzn).toBeGreaterThan(0);
    });

    it('dispatches heavy rotary snow blower for emergency drifts', () => {
      const result = dispatchWinterMachinery('r19_murovdag_pass', 'rotary_snow_blower', 26, 'emergency');
      expect(result.machineryType).toBe('rotary_snow_blower');
      expect(result.dispatchPriority).toBe('emergency');
      expect(result.transitSpeedKmh).toBeGreaterThan(30);
      expect(result.clearingCapacityMetric).toContain('1,500 ton/saat');
    });
  });

  describe('evaluateWinterChecklist', () => {
    it('passes when 8 or more items are verified', () => {
      const checked = ['1', '2', '3', '4', '5', '6', '7', '8'];
      const result = evaluateWinterChecklist(checked);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(8);
      expect(result.ratingAz).toContain('MƏQBUL');
    });

    it('rates exemplary when all 10 items are verified', () => {
      const checked = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      const result = evaluateWinterChecklist(checked);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(10);
      expect(result.ratingAz).toContain('NÜMUNƏVİ');
    });

    it('fails when fewer than 8 items are verified', () => {
      const checked = ['1', '2', '3'];
      const result = evaluateWinterChecklist(checked);
      expect(result.passed).toBe(false);
      expect(result.ratingAz).toContain('TƏHLÜKƏLİ');
    });
  });

  describe('gradeWinterExam', () => {
    it('passes when 9 or 10 answers are correct', () => {
      const correctMap = { 1: 1, 2: 1, 3: 1, 4: 0, 5: 1, 6: 1, 7: 1, 8: 0, 9: 0, 10: 0 };
      const userAnswers = { 1: 1, 2: 1, 3: 1, 4: 0, 5: 1, 6: 1, 7: 1, 8: 0, 9: 0, 10: 0 };
      const result = gradeWinterExam(userAnswers, correctMap);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(10);
      expect(result.percentage).toBe(100);
    });

    it('fails when score is below 9', () => {
      const correctMap = { 1: 1, 2: 1, 3: 1, 4: 0, 5: 1, 6: 1, 7: 1, 8: 0, 9: 0, 10: 0 };
      const userAnswers = { 1: 1, 2: 1, 3: 0, 4: 2, 5: 1, 6: 1, 7: 1, 8: 0, 9: 0, 10: 0 }; // 8/10
      const result = gradeWinterExam(userAnswers, correctMap);
      expect(result.passed).toBe(false);
      expect(result.score).toBe(8);
      expect(result.percentage).toBe(80);
    });
  });

  describe('generateWinterPassCertificate', () => {
    it('generates certificate with authentic format and SHA-256 representation', () => {
      const cert = generateWinterPassCertificate({
        vehiclePlate: '99-FS-101',
        vin: 'JTEBU29J700142851',
        passId: 'm4_agsu_pass',
        passNameAz: 'M-4 Ağsu Dağ Aşırımı',
        passNameEn: 'M-4 Agsu Mountain Pass',
        driveType: 'awd_4x4',
        tireChainCertified: true,
        rwisFrictionCoeff: 0.38,
        avalancheRating: 2,
        clearanceStatus: 'cleared_full',
      });

      expect(cert.certificateId).toMatch(/^AAYDA-QAR-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-FS-101');
      expect(cert.simaDigitalUid).toContain('SIMA-AZ-QAR-');
      expect(cert.sha256Checksum).toBeDefined();
      expect(cert.clearanceStatus).toBe('cleared_full');
    });
  });
});
