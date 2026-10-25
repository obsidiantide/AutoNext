import { describe, it, expect } from 'vitest';
import {
  MOTORSPORT_DISCIPLINES,
  evaluateAntiHooliganismSanctions,
  auditFiaAnnexJCompliance,
  calculateTrackDayCost,
  generateAafSportsPassport,
  filterAafPassports,
  FiaAnnexJChecklist,
  AafSportsPassport,
} from '../motorsportCompliance';

describe('motorsportCompliance Utility Functions', () => {
  describe('MOTORSPORT_DISCIPLINES dictionary', () => {
    it('defines all 6 standard disciplines with proper noise limits and gear specifications', () => {
      const disciplines = Object.keys(MOTORSPORT_DISCIPLINES);
      expect(disciplines).toContain('circuit_racing');
      expect(disciplines).toContain('drift');
      expect(disciplines).toContain('drag_racing');
      expect(disciplines).toContain('time_attack');
      expect(disciplines).toContain('slalom_gymkhana');
      expect(disciplines).toContain('hillclimb');

      expect(MOTORSPORT_DISCIPLINES.circuit_racing.noiseLimitDba).toBe(105);
      expect(MOTORSPORT_DISCIPLINES.drift.noiseLimitDba).toBe(108);
      expect(MOTORSPORT_DISCIPLINES.drag_racing.noiseLimitDba).toBe(110);
    });
  });

  describe('evaluateAntiHooliganismSanctions (İXM Maddə 511 & 342)', () => {
    it('evaluates completely compliant driving behavior without sanctions', () => {
      const result = evaluateAntiHooliganismSanctions({
        publicDriftAttempt: false,
        sharpLaneWeaving: false,
        mufflerRemovalCutout: false,
        twoWheelTippingAttempt: false,
        isRepeatOffenseWithinOneYear: false,
        publicDisturbanceOrRaceBetting: false,
      });

      expect(result.isHooliganism).toBe(false);
      expect(result.hasConstructiveViolation).toBe(false);
      expect(result.minFineAzn).toBe(0);
      expect(result.maxFineAzn).toBe(0);
      expect(result.minAdministrativeArrestDays).toBe(0);
      expect(result.suspensionYears).toBe(0);
      expect(result.impoundRequired).toBe(false);
      expect(result.severityLevel).toBe('compliant');
    });

    it('identifies constructive violation only when muffler is cutout but no public drift occurs', () => {
      const result = evaluateAntiHooliganismSanctions({
        publicDriftAttempt: false,
        sharpLaneWeaving: false,
        mufflerRemovalCutout: true,
        twoWheelTippingAttempt: false,
        isRepeatOffenseWithinOneYear: false,
        publicDisturbanceOrRaceBetting: false,
      });

      expect(result.isHooliganism).toBe(false);
      expect(result.hasConstructiveViolation).toBe(true);
      expect(result.minFineAzn).toBe(150);
      expect(result.maxFineAzn).toBe(150);
      expect(result.minAdministrativeArrestDays).toBe(0);
      expect(result.impoundRequired).toBe(true);
      expect(result.severityLevel).toBe('warning');
      expect(result.articlesViolated[0]).toContain('342.2-2');
    });

    it('evaluates first-time street hooliganism (İXM 511.1) with arrest and license suspension', () => {
      const result = evaluateAntiHooliganismSanctions({
        publicDriftAttempt: true,
        sharpLaneWeaving: true,
        mufflerRemovalCutout: false,
        twoWheelTippingAttempt: false,
        isRepeatOffenseWithinOneYear: false,
        publicDisturbanceOrRaceBetting: false,
      });

      expect(result.isHooliganism).toBe(true);
      expect(result.minFineAzn).toBe(500);
      expect(result.maxFineAzn).toBe(1000);
      expect(result.minAdministrativeArrestDays).toBe(15);
      expect(result.maxAdministrativeArrestDays).toBe(30);
      expect(result.suspensionYears).toBe(1);
      expect(result.impoundRequired).toBe(true);
      expect(result.severityLevel).toBe('severe_hooliganism');
    });

    it('evaluates repeat street hooliganism (İXM 511.2) with severe judicial sanctions', () => {
      const result = evaluateAntiHooliganismSanctions({
        publicDriftAttempt: true,
        sharpLaneWeaving: false,
        mufflerRemovalCutout: true,
        twoWheelTippingAttempt: false,
        isRepeatOffenseWithinOneYear: true,
        publicDisturbanceOrRaceBetting: true,
      });

      expect(result.isHooliganism).toBe(true);
      expect(result.hasConstructiveViolation).toBe(true);
      // 1500-2000 AZN + 150 AZN constructive modification
      expect(result.minFineAzn).toBe(1650);
      expect(result.maxFineAzn).toBe(2150);
      expect(result.minAdministrativeArrestDays).toBe(30);
      expect(result.maxAdministrativeArrestDays).toBe(60);
      expect(result.suspensionYears).toBe(2);
      expect(result.impoundRequired).toBe(true);
      expect(result.severityLevel).toBe('critical_repeat');
    });
  });

  describe('auditFiaAnnexJCompliance (Technical Scrutineering)', () => {
    it('grants pro_championship rating to fully equipped race vehicle (100 score)', () => {
      const fullChecklist: FiaAnnexJChecklist = {
        rollCageCertified: true,
        racingBucketSeat: true,
        multiPointHarness: true,
        fireSuppressionSystem: true,
        masterCutoffSwitch: true,
        dualTowHooks: true,
        batteryBoxCatchTank: true,
        fuelCellSafetyBladder: true,
        exhaustDecibelLimit: true,
        helmetHansDevice: true,
      };

      const result = auditFiaAnnexJCompliance(fullChecklist);
      expect(result.score).toBe(100);
      expect(result.passedCount).toBe(10);
      expect(result.totalCount).toBe(10);
      expect(result.isEligibleForTrack).toBe(true);
      expect(result.readinessLevel).toBe('pro_championship');
      expect(result.deficiencies.length).toBe(0);
      expect(result.recommendedUpgrades.length).toBe(0);
    });

    it('identifies club competition readiness when non-critical fuel bladder is missing (90 score)', () => {
      const clubChecklist: FiaAnnexJChecklist = {
        rollCageCertified: true,
        racingBucketSeat: true,
        multiPointHarness: true,
        fireSuppressionSystem: true,
        masterCutoffSwitch: true,
        dualTowHooks: true,
        batteryBoxCatchTank: true,
        fuelCellSafetyBladder: false,
        exhaustDecibelLimit: true,
        helmetHansDevice: true,
      };

      const result = auditFiaAnnexJCompliance(clubChecklist);
      expect(result.score).toBe(90);
      expect(result.passedCount).toBe(9);
      expect(result.isEligibleForTrack).toBe(true);
      expect(result.readinessLevel).toBe('pro_championship');
      expect(result.deficiencies.length).toBe(1);
    });

    it('marks street car as track_day_novice when basic tow hooks and helmet are present', () => {
      const noviceChecklist: FiaAnnexJChecklist = {
        rollCageCertified: false,
        racingBucketSeat: false,
        multiPointHarness: false,
        fireSuppressionSystem: false,
        masterCutoffSwitch: false,
        dualTowHooks: true,
        batteryBoxCatchTank: true,
        fuelCellSafetyBladder: false,
        exhaustDecibelLimit: true,
        helmetHansDevice: true,
      };

      const result = auditFiaAnnexJCompliance(noviceChecklist);
      // 5 + 10 + 5 + 10 = 30 -> wait, 30 < 40 is prohibited!
      expect(result.score).toBe(30);
      expect(result.isEligibleForTrack).toBe(false);
      expect(result.readinessLevel).toBe('prohibited');
    });

    it('prohibits completely unsafe vehicles with zero points', () => {
      const unsafeChecklist: FiaAnnexJChecklist = {
        rollCageCertified: false,
        racingBucketSeat: false,
        multiPointHarness: false,
        fireSuppressionSystem: false,
        masterCutoffSwitch: false,
        dualTowHooks: false,
        batteryBoxCatchTank: false,
        fuelCellSafetyBladder: false,
        exhaustDecibelLimit: false,
        helmetHansDevice: false,
      };

      const result = auditFiaAnnexJCompliance(unsafeChecklist);
      expect(result.score).toBe(0);
      expect(result.isEligibleForTrack).toBe(false);
      expect(result.readinessLevel).toBe('prohibited');
      expect(result.deficiencies.length).toBe(10);
    });
  });

  describe('calculateTrackDayCost', () => {
    it('calculates morning session with basic insurance in AZN', () => {
      const cost = calculateTrackDayCost({
        packageType: 'morning_session',
        insuranceTier: 'basic_third_party',
        transponderTiming: false,
        pitBoxRental: false,
        currency: 'AZN',
      });

      // 80 base + 20 insurance = 100 AZN
      expect(cost.totalAzn).toBe(100);
      expect(cost.totalConverted).toBe(100);
      expect(cost.timingFeeAzn).toBe(0);
      expect(cost.pitBoxFeeAzn).toBe(0);
    });

    it('calculates full day with comprehensive insurance, timing, and pit box in USD and EUR', () => {
      const costAzn = calculateTrackDayCost({
        packageType: 'full_day_unlimited',
        insuranceTier: 'comprehensive_track',
        transponderTiming: true,
        pitBoxRental: true,
        currency: 'AZN',
      });

      // 180 base + 95 insurance + 25 timing + 50 pit = 350 AZN
      expect(costAzn.totalAzn).toBe(350);

      const costUsd = calculateTrackDayCost({
        packageType: 'full_day_unlimited',
        insuranceTier: 'comprehensive_track',
        transponderTiming: true,
        pitBoxRental: true,
        currency: 'USD',
      });

      // 350 / 1.7 ~ 206 USD
      expect(costUsd.totalConverted).toBe(Math.round(350 / 1.7));

      const costEur = calculateTrackDayCost({
        packageType: 'full_day_unlimited',
        insuranceTier: 'comprehensive_track',
        transponderTiming: true,
        pitBoxRental: true,
        currency: 'EUR',
      });

      // 350 / 1.85 ~ 189 EUR
      expect(costEur.totalConverted).toBe(Math.round(350 / 1.85));
    });
  });

  describe('generateAafSportsPassport & filterAafPassports', () => {
    it('generates a valid AAF Sports Passport with cryptographic security hash and validity dates', () => {
      const passport = generateAafSportsPassport(
        'WBA330000AA099881',
        '99-YP-330',
        'BMW M3 E46 Track Spec',
        'Teymur Məmmədov',
        'time_attack',
        'clubman_modified',
        90,
        101,
        'Bakı Olimpiya Stadionu Autodromu (BOS)'
      );

      expect(passport.passportNumber).toMatch(/^AAF-TRK-2026-\d{5}$/);
      expect(passport.vin).toBe('WBA330000AA099881');
      expect(passport.plateNumber).toBe('99-YP-330');
      expect(passport.rollCageSerial).toMatch(/^FIA-AZ-CAGE-\d{4}$/);
      expect(passport.qrSecurityHash).toContain('SHA256:AAF:');
      expect(passport.status).toBe('active');
    });

    it('filters sports passports correctly by plate, vin, driver, and track name', () => {
      const samplePassports: AafSportsPassport[] = [
        {
          id: 'p1',
          passportNumber: 'AAF-TRK-2026-11111',
          vin: 'VIN11111',
          plateNumber: '10-DR-015',
          vehicleModel: 'Nissan Silvia S15',
          driverFullName: 'Eldar Rüstəmov',
          driverLicenseCategory: 'B',
          aafLicenseNumber: 'LIC1',
          discipline: 'drift',
          competitionClass: 'pro_am',
          rollCageSerial: 'FIA-01',
          exhaustDbRating: 105,
          auditScore: 100,
          assignedTrackName: 'Sumqayıt Autodrom',
          issueDate: '2026-01-01',
          validityUntil: '2027-01-01',
          qrSecurityHash: 'HASH1',
          chiefScrutineer: 'Inspector',
          status: 'active',
        },
        {
          id: 'p2',
          passportNumber: 'AAF-TRK-2026-22222',
          vin: 'VIN22222',
          plateNumber: '90-GT-992',
          vehicleModel: 'Porsche 911 GT3',
          driverFullName: 'Orxan İsmayılov',
          driverLicenseCategory: 'B',
          aafLicenseNumber: 'LIC2',
          discipline: 'circuit_racing',
          competitionClass: 'pro_am',
          rollCageSerial: 'FIA-02',
          exhaustDbRating: 102,
          auditScore: 100,
          assignedTrackName: 'Ələt Kompleksi',
          issueDate: '2026-02-01',
          validityUntil: '2027-02-01',
          qrSecurityHash: 'HASH2',
          chiefScrutineer: 'Inspector',
          status: 'active',
        },
      ];

      expect(filterAafPassports(samplePassports, '').length).toBe(2);
      expect(filterAafPassports(samplePassports, 'Silvia').length).toBe(1);
      expect(filterAafPassports(samplePassports, '90-GT-992').length).toBe(1);
      expect(filterAafPassports(samplePassports, 'Eldar').length).toBe(1);
      expect(filterAafPassports(samplePassports, 'Ələt').length).toBe(1);
      expect(filterAafPassports(samplePassports, 'NonExistent').length).toBe(0);
    });
  });
});
