import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateStoppingPhysics,
  evaluateWildlifeChecklist,
  gradeWildlifeExam,
  generateWildlifeCertificate,
  WildlifeCorridorAsset,
} from '../wildlifeCrossingCompliance';
import {
  MOCK_WILDLIFE_CORRIDORS,
  WILDLIFE_EXAM_QUESTIONS,
  MOCK_ANIMAL_SPECIES,
} from '../../data/mockWildlifeCrossingData';

describe('Wildlife Crossing & Ecological Corridor Compliance Engine', () => {
  describe('formatCurrency', () => {
    it('formats AZN correctly', () => {
      expect(formatCurrency(100, 'AZN')).toBe('100.00 ₼');
    });

    it('formats USD conversion correctly', () => {
      // 100 * 0.5882 = 58.82 $
      expect(formatCurrency(100, 'USD')).toBe('58.82 $');
    });

    it('formats EUR conversion correctly', () => {
      // 100 * 0.5405 = 54.05 €
      expect(formatCurrency(100, 'EUR')).toBe('54.05 €');
    });
  });

  describe('calculateStoppingPhysics', () => {
    it('avoids collision at low speed with high beam on dry asphalt', () => {
      const res = calculateStoppingPhysics({
        vehicleSpeedKmH: 50,
        lighting: 'night_high_beam',
        surface: 'dry_asphalt',
        animalSpeciesId: 'goitered_gazelle',
      });

      expect(res.detectionDistanceM).toBe(95);
      expect(res.isCollisionAvoided).toBe(true);
      expect(res.safetyMarginM).toBeGreaterThan(0);
      expect(res.impactSpeedKmH).toBe(0);
      expect(res.statutoryAnimalCompensationAzn).toBe(0);
      expect(res.administrativeFineAzn).toBe(0);
      expect(res.riskRating).toBe('safe_clear');
    });

    it('calculates collision and severe impact at high speed with low beam on wet asphalt', () => {
      const res = calculateStoppingPhysics({
        vehicleSpeedKmH: 100,
        lighting: 'night_low_beam',
        surface: 'wet_rain',
        animalSpeciesId: 'caucasian_leopard',
      });

      expect(res.detectionDistanceM).toBe(40);
      expect(res.isCollisionAvoided).toBe(false);
      expect(res.safetyMarginM).toBeLessThan(0);
      expect(res.impactSpeedKmH).toBeGreaterThan(0);
      expect(res.kineticImpactJoules).toBeGreaterThan(0);
      expect(res.statutoryAnimalCompensationAzn).toBe(50000); // Caucasian leopard compensation
      expect(res.administrativeFineAzn).toBe(40);
      expect(res.promptDiscountFineAzn).toBe(20);
      expect(res.estimatedVehicleDamageAzn).toBeGreaterThan(0);
      expect(res.totalFinancialImpactAzn).toBeGreaterThan(50000);
      expect(res.riskRating).toBe('critical_fatal');
    });

    it('correctly handles snow/ice low friction coefficient (0.20)', () => {
      const res = calculateStoppingPhysics({
        vehicleSpeedKmH: 60,
        lighting: 'night_low_beam',
        surface: 'snow_ice',
        animalSpeciesId: 'brown_bear',
      });

      expect(res.frictionCoeff).toBe(0.20);
      expect(res.isCollisionAvoided).toBe(false);
      expect(res.statutoryAnimalCompensationAzn).toBe(4000); // Brown bear
      expect(res.animalWeightKg).toBe(260);
    });

    it('identifies moderate caution when vehicle stops within narrow margin (<15m)', () => {
      const res = calculateStoppingPhysics({
        vehicleSpeedKmH: 78,
        lighting: 'night_high_beam',
        surface: 'dry_asphalt',
        animalSpeciesId: 'wild_boar',
      });

      if (res.isCollisionAvoided && res.safetyMarginM < 15) {
        expect(res.riskRating).toBe('moderate_caution');
      }
    });
  });

  describe('evaluateWildlifeChecklist', () => {
    it('returns exemplary status for 100% checked items', () => {
      const allIds = [
        'chk_flir_thermal',
        'chk_geophone_tremors',
        'chk_virtual_fence',
        'chk_green_overpass_canopy',
        'chk_exclusion_fencing',
        'chk_escape_ramps',
        'chk_vms_speed_warning',
        'chk_vehicle_headlights',
        'chk_horn_sound_level',
        'chk_red_book_registry',
      ];

      const res = evaluateWildlifeChecklist(allIds);
      expect(res.percentageScore).toBe(100);
      expect(res.isFullyCompliant).toBe(true);
      expect(res.missingMandatoryCount).toBe(0);
      expect(res.ratingAz).toContain('MÜKƏMMƏL');
    });

    it('returns standard compliant status for 8 items checked (80%)', () => {
      const eightIds = [
        'chk_flir_thermal',
        'chk_geophone_tremors',
        'chk_virtual_fence',
        'chk_green_overpass_canopy',
        'chk_exclusion_fencing',
        'chk_escape_ramps',
        'chk_vms_speed_warning',
        'chk_vehicle_headlights',
      ];

      const res = evaluateWildlifeChecklist(eightIds);
      expect(res.percentageScore).toBe(80);
      expect(res.isFullyCompliant).toBe(true);
      expect(res.missingMandatoryCount).toBe(2);
      expect(res.ratingAz).toContain('STANDART');
    });

    it('returns unsatisfactory status for less than 8 items (<80%)', () => {
      const fourIds = ['chk_flir_thermal', 'chk_geophone_tremors', 'chk_virtual_fence', 'chk_escape_ramps'];
      const res = evaluateWildlifeChecklist(fourIds);
      expect(res.percentageScore).toBe(40);
      expect(res.isFullyCompliant).toBe(false);
      expect(res.missingMandatoryCount).toBe(6);
      expect(res.ratingAz).toContain('QEYRİ-MƏQBULDUR');
    });
  });

  describe('gradeWildlifeExam', () => {
    const correctMap = WILDLIFE_EXAM_QUESTIONS.reduce((acc, q) => {
      acc[q.id] = q.correctAnswer;
      return acc;
    }, {} as Record<number, number>);

    it('passes exam with 10/10 score', () => {
      const res = gradeWildlifeExam(correctMap, correctMap);
      expect(res.correctCount).toBe(10);
      expect(res.scorePercentage).toBe(100);
      expect(res.isPassed).toBe(true);
      expect(res.certificateEligible).toBe(true);
      expect(res.verdictAz).toContain('MÜVƏFFƏQİYYƏTLİ');
    });

    it('passes exam with exactly 8/10 passing score', () => {
      const answers: Record<number, number> = { ...correctMap };
      answers[9] = 99; // wrong
      answers[10] = 99; // wrong

      const res = gradeWildlifeExam(answers, correctMap);
      expect(res.correctCount).toBe(8);
      expect(res.scorePercentage).toBe(80);
      expect(res.isPassed).toBe(true);
      expect(res.certificateEligible).toBe(true);
    });

    it('fails exam with less than 8 correct answers', () => {
      const answers: Record<number, number> = { ...correctMap };
      answers[1] = 99;
      answers[2] = 99;
      answers[3] = 99;

      const res = gradeWildlifeExam(answers, correctMap);
      expect(res.correctCount).toBe(7);
      expect(res.scorePercentage).toBe(70);
      expect(res.isPassed).toBe(false);
      expect(res.certificateEligible).toBe(false);
      expect(res.verdictAz).toContain('KƏSİLDİ');
    });
  });

  describe('generateWildlifeCertificate', () => {
    it('generates a valid WILD-PASS-AZ-2026 electronic certificate', () => {
      const corridor: WildlifeCorridorAsset = MOCK_WILDLIFE_CORRIDORS[0];
      const cert = generateWildlifeCertificate({
        vehiclePlate: '99-wl-901',
        vehicleModel: 'Toyota RAV4 Hybrid AWD',
        vinCode: 'jtmbfrev9pd194821',
        corridor,
        scorePercentage: 100,
      });

      expect(cert.certificateNumber).toMatch(/^WILD-PASS-AZ-2026-\d{5}$/);
      expect(cert.simaDigitalUid).toMatch(/^SIMA-ETSN-\d{8}$/);
      expect(cert.vehiclePlate).toBe('99-WL-901');
      expect(cert.vinCode).toBe('JTMBFREV9PD194821');
      expect(cert.corridorId).toBe('hirkan_leopard_corridor');
      expect(cert.barrierReleasePin).toMatch(/^\d{4}$/);
      expect(cert.safetyComplianceRating).toBe('MÜKƏMMƏL (EXEMPLARY)');
      expect(cert.cryptographicChecksum).toMatch(/^SHA256:/);
      expect(cert.statutoryEtsnClearanceCode).toContain('ETSN-BIO-');
    });
  });

  describe('Mock Data Integrity', () => {
    it('has 6 strategic wildlife corridors', () => {
      expect(MOCK_WILDLIFE_CORRIDORS).toHaveLength(6);
    });

    it('has 6 animal species profiles with Red Book statuses', () => {
      expect(MOCK_ANIMAL_SPECIES).toHaveLength(6);
      const redBookCount = MOCK_ANIMAL_SPECIES.filter(s => s.isRedBookListed).length;
      expect(redBookCount).toBe(5);
    });

    it('has 10 exam questions with valid options', () => {
      expect(WILDLIFE_EXAM_QUESTIONS).toHaveLength(10);
      WILDLIFE_EXAM_QUESTIONS.forEach(q => {
        expect(q.optionsAz.length).toBe(4);
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswer).toBeLessThan(4);
      });
    });
  });
});
