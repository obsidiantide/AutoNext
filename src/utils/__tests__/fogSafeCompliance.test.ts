import { describe, it, expect } from 'vitest';
import {
  calculateKoschmiederVisibility,
  calculateExtinctionCoefficient,
  determineVisibilityTier,
  getSurfaceFrictionCoefficient,
  getRecommendedVsl,
  calculateStoppingPhysics,
  evaluateSightDistanceRisk,
  calculateVisibilityMetrics,
  calculateFogViolationFine,
  evaluateFogChecklist,
  evaluateFogExam,
  generateFogCertificate,
} from '../fogSafeCompliance';
import {
  MOCK_FOG_CORRIDORS,
  MOCK_FOG_CHECKLIST_ITEMS,
  MOCK_FOG_EXAM_QUESTIONS,
} from '../../data/mockFogSafeData';

describe('fogSafeCompliance Utility Suite', () => {
  describe('Koschmieder Optical Formulas', () => {
    it('calculates Koschmieder visibility distance correctly from extinction coefficient', () => {
      // V = 2.996 / k
      const vis1 = calculateKoschmiederVisibility(0.0665); // ~45m
      expect(vis1).toBe(45);

      const vis2 = calculateKoschmiederVisibility(0.01); // ~300m
      expect(vis2).toBe(300);

      // Handles non-positive values safely
      expect(calculateKoschmiederVisibility(0)).toBe(10000);
      expect(calculateKoschmiederVisibility(-0.5)).toBe(10000);
    });

    it('calculates atmospheric extinction coefficient k from visibility meters', () => {
      // k = 2.996 / V
      const k1 = calculateExtinctionCoefficient(50);
      expect(k1).toBeCloseTo(0.0599, 4);

      const k2 = calculateExtinctionCoefficient(100);
      expect(k2).toBeCloseTo(0.0300, 4);

      expect(calculateExtinctionCoefficient(0)).toBe(0.3);
    });

    it('determines visibility tier accurately across threshold ranges', () => {
      expect(determineVisibilityTier(35)).toBe('CRITICAL_ZERO');
      expect(determineVisibilityTier(49)).toBe('CRITICAL_ZERO');
      expect(determineVisibilityTier(50)).toBe('DENSE_FOG');
      expect(determineVisibilityTier(99)).toBe('DENSE_FOG');
      expect(determineVisibilityTier(100)).toBe('MODERATE_FOG');
      expect(determineVisibilityTier(199)).toBe('MODERATE_FOG');
      expect(determineVisibilityTier(200)).toBe('LIGHT_MIST');
      expect(determineVisibilityTier(499)).toBe('LIGHT_MIST');
      expect(determineVisibilityTier(500)).toBe('CLEAR');
      expect(determineVisibilityTier(1200)).toBe('CLEAR');
    });
  });

  describe('Surface Friction & Recommended Dynamic VSL', () => {
    it('returns standard surface friction coefficients for varied conditions', () => {
      expect(getSurfaceFrictionCoefficient('dry_asphalt')).toBe(0.75);
      expect(getSurfaceFrictionCoefficient('wet_damp')).toBe(0.45);
      expect(getSurfaceFrictionCoefficient('slush_snow')).toBe(0.25);
      expect(getSurfaceFrictionCoefficient('black_ice')).toBe(0.12);
    });

    it('calculates recommended VSL speed limit based on visibility and road friction', () => {
      // Critical (<50m) is always 40 km/h
      expect(getRecommendedVsl(35, 'wet_damp')).toBe(40);
      expect(getRecommendedVsl(45, 'dry_asphalt')).toBe(40);

      // Dense fog (50-100m) is 60 km/h, but drops to 40 km/h on black ice
      expect(getRecommendedVsl(80, 'wet_damp')).toBe(60);
      expect(getRecommendedVsl(80, 'black_ice')).toBe(40);

      // Moderate fog (100-200m) is 80 km/h, but 50 km/h on black ice
      expect(getRecommendedVsl(150, 'wet_damp')).toBe(80);
      expect(getRecommendedVsl(150, 'black_ice')).toBe(50);

      // Clear (>500m) is 110 km/h on wet/dry, 70 km/h on black ice
      expect(getRecommendedVsl(600, 'dry_asphalt')).toBe(110);
      expect(getRecommendedVsl(600, 'black_ice')).toBe(70);
    });
  });

  describe('Stopping Physics & Sight Distance Margin Risk', () => {
    it('calculates reaction, braking and total stopping distance accurately', () => {
      const physics = calculateStoppingPhysics(60, 'wet_damp', 1.4);
      // 60 km/h = 16.67 m/s. Reaction dist = 16.67 * 1.4 ≈ 23.3m
      expect(physics.reactionDist).toBeCloseTo(23.3, 1);
      // Braking dist: (16.67^2) / (2 * 0.45 * 9.81) = 277.78 / 8.829 ≈ 31.5m
      expect(physics.brakingDist).toBeCloseTo(31.5, 1);
      expect(physics.totalStoppingDist).toBeCloseTo(54.8, 1);
      expect(physics.frictionCoeff).toBe(0.45);
    });

    it('evaluates sight distance margin and categorizes risk levels', () => {
      // Safe: margin >= 40m
      const safeRisk = evaluateSightDistanceRisk(150, 60);
      expect(safeRisk.riskLevel).toBe('SAFE');
      expect(safeRisk.marginMeters).toBe(90);

      // Caution: margin >= 10m
      const cautionRisk = evaluateSightDistanceRisk(65, 50);
      expect(cautionRisk.riskLevel).toBe('CAUTION');
      expect(cautionRisk.marginMeters).toBe(15);

      // High Risk: margin >= 0m
      const highRisk = evaluateSightDistanceRisk(52, 50);
      expect(highRisk.riskLevel).toBe('HIGH_RISK');
      expect(highRisk.marginMeters).toBe(2);

      // Critical Hazard: margin < 0m (stopping distance exceeds visibility)
      const hazardRisk = evaluateSightDistanceRisk(30, 55);
      expect(hazardRisk.riskLevel).toBe('CRITICAL_HAZARD');
      expect(hazardRisk.marginMeters).toBe(-25);
      expect(hazardRisk.warningAz).toContain('FƏLAKƏT TƏHLÜKƏSİ');
    });

    it('calculates comprehensive visibility metrics with headway evaluation', () => {
      const metrics = calculateVisibilityMetrics({
        visibilityMeters: 45,
        vehicleSpeedKmH: 50,
        roadSurface: 'wet_damp',
        reactionTimeSeconds: 1.4,
        headwayGapMeters: 30,
      });

      expect(metrics.visibilityMeters).toBe(45);
      expect(metrics.visibilityTier).toBe('CRITICAL_ZERO');
      expect(metrics.recommendedVslKmH).toBe(40);
      expect(metrics.recommendedHeadwaySeconds).toBe(6.0);
      expect(metrics.isHeadwaySafe).toBe(false); // 30m at 50km/h (13.89 m/s) is ~2.2s < 6.0s
    });
  });

  describe('Statutory Administrative Fines under İXM', () => {
    it('calculates speeding fines and penalty points correctly in AZN and foreign currency', () => {
      // 85 km/h with VSL 60 km/h: +25 km/h -> İXM 328.2 (50 AZN, 2 points)
      const calc1 = calculateFogViolationFine(85, 60, false, false, false, 'AZN');
      expect(calc1.speedExcessKmH).toBe(25);
      expect(calc1.speedFineAzn).toBe(50);
      expect(calc1.penaltyPoints).toBe(2);
      expect(calc1.totalFineAzn).toBe(50);
      expect(calc1.promptDiscountFineAzn).toBe(25); // 50% discount

      // +65 km/h excess -> İXM 328.4 (250 AZN, 4 points)
      const calc2 = calculateFogViolationFine(125, 60, false, false, false, 'USD');
      expect(calc2.speedExcessKmH).toBe(65);
      expect(calc2.speedFineAzn).toBe(250);
      expect(calc2.penaltyPoints).toBe(4);
      expect(calc2.totalFineForeign).toBeCloseTo(250 * 0.588, 1);
      expect(calc2.promptDiscountFineForeign).toBeCloseTo(125 * 0.588, 1);
    });

    it('aggregates lighting violations, rear fog misuse, and headway violations', () => {
      // Speed excess 15 km/h (10 AZN) + Headlights violation (30 AZN) + Rear fog misuse (30 AZN) + Safe distance (40 AZN) = 110 AZN
      const calc = calculateFogViolationFine(75, 60, true, true, true, 'AZN');
      expect(calc.speedFineAzn).toBe(10);
      expect(calc.headlightsFineAzn).toBe(30);
      expect(calc.rearFogMisuseFineAzn).toBe(30);
      expect(calc.safeDistanceFineAzn).toBe(40);
      expect(calc.totalFineAzn).toBe(110);
      expect(calc.promptDiscountFineAzn).toBe(55);
      expect(calc.violationsSummaryAz.length).toBe(4);
    });
  });

  describe('Checklist & Theoretical Exam Evaluation', () => {
    it('evaluates safety checklist and verifies compliance thresholds', () => {
      const allIds = MOCK_FOG_CHECKLIST_ITEMS.map((item) => item.id);
      const fullRes = evaluateFogChecklist(allIds, MOCK_FOG_CHECKLIST_ITEMS);
      expect(fullRes.isCompliant).toBe(true);
      expect(fullRes.passedCount).toBe(MOCK_FOG_CHECKLIST_ITEMS.length);
      expect(fullRes.percentage).toBe(100);
      expect(fullRes.missingMandatoryCount).toBe(0);

      // Missing mandatory item fails compliance
      const partialIds = allIds.filter((id) => id !== 'FOG_CHK_01_FRONT_LAMPS');
      const partialRes = evaluateFogChecklist(partialIds, MOCK_FOG_CHECKLIST_ITEMS);
      expect(partialRes.isCompliant).toBe(false);
      expect(partialRes.missingMandatoryCount).toBe(1);
    });

    it('evaluates theoretical examination questions scoring', () => {
      const perfectAnswers: Record<number, number> = {};
      MOCK_FOG_EXAM_QUESTIONS.forEach((q) => {
        perfectAnswers[q.id] = q.correctOptionIndex;
      });

      const examRes = evaluateFogExam(perfectAnswers, MOCK_FOG_EXAM_QUESTIONS);
      expect(examRes.passed).toBe(true);
      expect(examRes.percentage).toBe(100);
      expect(examRes.correctCount).toBe(MOCK_FOG_EXAM_QUESTIONS.length);
      expect(examRes.score).toBe(100);

      // Failing exam score (<80%)
      const poorAnswers: Record<number, number> = {
        1: 0, // incorrect
        2: 0, // incorrect
        3: 0, // incorrect
      };
      const failedRes = evaluateFogExam(poorAnswers, MOCK_FOG_EXAM_QUESTIONS);
      expect(failedRes.passed).toBe(false);
      expect(failedRes.percentage).toBeLessThan(80);
    });
  });

  describe('Certificate Generation', () => {
    it('generates an official FOG-SAFE-AZ-2026 electronic clearance certificate', () => {
      const corridor = MOCK_FOG_CORRIDORS[0];
      const cert = generateFogCertificate(
        corridor,
        '99-FG-101',
        'Mercedes-Benz E-Class',
        45,
        'wet_damp'
      );

      expect(cert.certificateNumber).toMatch(/^FOG-SAFE-AZ-2026-\d{5}$/);
      expect(cert.corridorId).toBe(corridor.id);
      expect(cert.vehiclePlate).toBe('99-FG-101');
      expect(cert.measuredVisibilityMeters).toBe(45);
      expect(cert.visibilityTier).toBe('CRITICAL_ZERO');
      expect(cert.assignedVslSpeedKmH).toBe(40);
      expect(cert.escortRequired).toBe(true);
      expect(cert.simaDigitalUid).toContain('SIMA-FOG-');
      expect(cert.sha256Checksum).toHaveLength(24);
      expect(cert.status).toBe('ACTIVE');
    });
  });
});
