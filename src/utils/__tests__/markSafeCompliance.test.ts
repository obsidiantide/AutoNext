import { describe, it, expect } from 'vitest';
import {
  calculateBeadOpticalEfficiency,
  calculateDryRetroreflectivity,
  calculateWetRetroreflectivity,
  calculateDaytimeLuminance,
  determineRetroreflectivityTier,
  calculateDriverPreviewMetrics,
  executeMarkSimulation,
  calculateMarkSanction,
  generateMarkSafeCertificate,
  AZN_TO_USD_RATE,
  AZN_TO_EUR_RATE
} from '../markSafeCompliance';

describe('markSafeCompliance Unit Tests', () => {
  describe('calculateBeadOpticalEfficiency', () => {
    it('achieves peak optical efficiency around 55% embedment depth', () => {
      const optimal = calculateBeadOpticalEfficiency(55, 95, 1.90);
      const underEmbedded = calculateBeadOpticalEfficiency(25, 95, 1.90);
      const overEmbedded = calculateBeadOpticalEfficiency(85, 95, 1.90);

      expect(optimal).toBeGreaterThan(underEmbedded);
      expect(optimal).toBeGreaterThan(overEmbedded);
      expect(optimal).toBeGreaterThan(70);
    });

    it('clamps embedment, roundness and refractive index within valid physical bounds', () => {
      const clampedLow = calculateBeadOpticalEfficiency(5, 20, 1.1);
      const clampedHigh = calculateBeadOpticalEfficiency(120, 150, 2.5);

      expect(clampedLow).toBeGreaterThanOrEqual(15);
      expect(clampedHigh).toBeLessThanOrEqual(100);
    });

    it('yields higher efficiency for higher refractive index beads (n=1.90 vs n=1.50)', () => {
      const highIndex = calculateBeadOpticalEfficiency(55, 90, 1.90);
      const standard = calculateBeadOpticalEfficiency(55, 90, 1.50);
      expect(highIndex).toBeGreaterThan(standard);
    });
  });

  describe('calculateDryRetroreflectivity', () => {
    it('produces higher initial RL for structured ribbed and MMA cold plastic materials', () => {
      const ribbed = calculateDryRetroreflectivity('POLYURETHANE_STRUCTURED_RIBBED', 90, 450, 1, 10000);
      const waterborne = calculateDryRetroreflectivity('WATERBORNE_ACRYLIC_PAINT', 90, 450, 1, 10000);
      expect(ribbed).toBeGreaterThan(waterborne);
    });

    it('degrades with older age and higher traffic AADT', () => {
      const fresh = calculateDryRetroreflectivity('THERMOPLASTIC_EXTRUDED', 80, 400, 2, 20000);
      const aged = calculateDryRetroreflectivity('THERMOPLASTIC_EXTRUDED', 80, 400, 36, 60000);
      expect(fresh).toBeGreaterThan(aged);
    });
  });

  describe('calculateWetRetroreflectivity', () => {
    it('maintains high residual RL when dry (<= 0.05mm water film)', () => {
      const dry = calculateWetRetroreflectivity(350, 0.0, 'SOLID_DIVIDING_1_1', 'STANDARD_SODALIME_N15');
      expect(dry).toBe(Math.round(350 * 0.9));
    });

    it('structured ribbed lines retain higher wet retroreflectivity than flat lines in rain', () => {
      const ribbedWet = calculateWetRetroreflectivity(
        350,
        2.0,
        'STRUCTURED_AUDIO_PROFILE',
        'HYDROPHOBIC_DUAL_COATED'
      );
      const flatWet = calculateWetRetroreflectivity(
        350,
        2.0,
        'SOLID_DIVIDING_1_1',
        'STANDARD_SODALIME_N15'
      );
      expect(ribbedWet).toBeGreaterThan(flatWet);
    });
  });

  describe('calculateDaytimeLuminance', () => {
    it('calculates daytime luminance Qd with age factor', () => {
      const freshQd = calculateDaytimeLuminance('COLD_PLASTIC_MMA', 0);
      const agedQd = calculateDaytimeLuminance('COLD_PLASTIC_MMA', 24);
      expect(freshQd).toBe(200);
      expect(agedQd).toBeLessThan(freshQd);
      expect(agedQd).toBeGreaterThanOrEqual(130);
    });
  });

  describe('determineRetroreflectivityTier', () => {
    it('categorizes tiers according to EN 1436 standards', () => {
      expect(determineRetroreflectivityTier(420)).toBe('CLASS_R5_EXCEPTIONAL');
      expect(determineRetroreflectivityTier(280)).toBe('CLASS_R4_GOOD');
      expect(determineRetroreflectivityTier(180)).toBe('CLASS_R3_STATUTORY_MINIMUM');
      expect(determineRetroreflectivityTier(120)).toBe('CLASS_R2_DEFICIENT');
      expect(determineRetroreflectivityTier(60)).toBe('CLASS_R1_HAZARDOUS_FAILED');
    });
  });

  describe('calculateDriverPreviewMetrics', () => {
    it('computes realistic preview distance and safety classification', () => {
      const safe = calculateDriverPreviewMetrics(350, 60000, 90);
      expect(safe.previewDistanceMeters).toBeGreaterThan(60);
      expect(safe.previewTimeSeconds).toBeGreaterThanOrEqual(2.5);
      expect(['EXCELLENT_PREVIEW', 'ADEQUATE_SAFETY_MARGIN']).toContain(safe.safetyStatus);

      const critical = calculateDriverPreviewMetrics(40, 20000, 130);
      expect(critical.previewTimeSeconds).toBeLessThan(2.0);
      expect(critical.safetyStatus).toBe('CRITICAL_LANE_DEPARTURE_RISK');
    });
  });

  describe('executeMarkSimulation', () => {
    it('evaluates full simulation and provides appropriate recommendations', () => {
      const result = executeMarkSimulation({
        vehicleSpeedKmH: 90,
        headlightIntensityCandela: 50000,
        beadEmbedmentPct: 55,
        beadRoundnessPct: 90,
        refractiveIndex: 1.9,
        beadApplicationRateGPerM2: 450,
        waterFilmThicknessMm: 0,
        materialType: 'THERMOPLASTIC_EXTRUDED',
        linePattern: 'STRUCTURED_AUDIO_PROFILE',
        surfaceCondition: 'DRY_STANDARD',
        markingAgeMonths: 6,
        annualTrafficAadt: 25000
      });

      expect(result.dryRetroreflectivityRl).toBeGreaterThan(150);
      expect(result.statutoryCompliancePassed).toBe(true);
      expect(result.contrastRatioNight).toBeGreaterThan(10);
      expect(result.recommendationAz).toContain('AZS 410');
    });

    it('flags non-compliance and degradation for severely worn markings under heavy rain', () => {
      const result = executeMarkSimulation({
        vehicleSpeedKmH: 120,
        headlightIntensityCandela: 25000,
        beadEmbedmentPct: 20,
        beadRoundnessPct: 55,
        refractiveIndex: 1.5,
        beadApplicationRateGPerM2: 200,
        waterFilmThicknessMm: 3.5,
        materialType: 'WATERBORNE_ACRYLIC_PAINT',
        linePattern: 'SOLID_DIVIDING_1_1',
        surfaceCondition: 'CONTINUOUS_RAIN_ASTM',
        markingAgeMonths: 36,
        annualTrafficAadt: 50000
      });

      expect(result.statutoryCompliancePassed).toBe(false);
      expect(result.previewSafetyStatus).toBe('CRITICAL_LANE_DEPARTURE_RISK');
      expect(result.recommendationAz).toContain('XƏBƏRDARLIQ');
    });
  });

  describe('calculateMarkSanction', () => {
    it('calculates Article 327.1 lane marking departure fine with 50% prompt discount', () => {
      const sanction = calculateMarkSanction('LINE_DEPARTURE_327_1');
      expect(sanction.statutoryBaseFineAzn).toBe(40);
      expect(sanction.promptDiscountFineAzn).toBe(20);
      expect(sanction.penaltyPoints).toBe(0);
      expect(sanction.currencyEquivalentUsd).toBeCloseTo(20 * AZN_TO_USD_RATE, 1);
    });

    it('calculates Article 327.2 double solid crossing fine with 3 penalty points', () => {
      const sanction = calculateMarkSanction('DOUBLE_SOLID_CROSSING_327_2');
      expect(sanction.statutoryBaseFineAzn).toBe(60);
      expect(sanction.promptDiscountFineAzn).toBe(30);
      expect(sanction.penaltyPoints).toBe(3);
    });

    it('calculates Article 353 marking damage fine', () => {
      const sanction = calculateMarkSanction('MARKING_DAMAGE_353');
      expect(sanction.statutoryBaseFineAzn).toBe(150);
      expect(sanction.promptDiscountFineAzn).toBe(75);
    });
  });

  describe('generateMarkSafeCertificate', () => {
    it('creates a cryptographically signed certificate with valid structure', () => {
      const sim = executeMarkSimulation({
        vehicleSpeedKmH: 100,
        headlightIntensityCandela: 60000,
        beadEmbedmentPct: 56,
        beadRoundnessPct: 88,
        refractiveIndex: 1.9,
        beadApplicationRateGPerM2: 480,
        waterFilmThicknessMm: 0,
        materialType: 'COLD_PLASTIC_MMA',
        linePattern: 'DASHED_LANE_1_5',
        surfaceCondition: 'DRY_STANDARD',
        markingAgeMonths: 4,
        annualTrafficAadt: 30000
      });

      const cert = generateMarkSafeCertificate('99-MK-101', 'corridor-airport-highway', sim);
      expect(cert.certificateUid).toMatch(/^MARK-SAFE-AZ-2026-[A-F0-9]{6}$/);
      expect(cert.verificationPin).toHaveLength(4);
      expect(cert.simaDigitalUid).toContain('SIMA-MARK-');
      expect(cert.sha256Checksum).toContain('SHA256-');
      expect(cert.vehiclePlate).toBe('99-MK-101');
      expect(cert.measuredRlDry).toBe(sim.dryRetroreflectivityRl);
    });
  });
});
