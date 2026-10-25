import { describe, it, expect } from 'vitest';
import {
  calculateEktisSubsidy,
  evaluateFieldTransitSafety,
  evaluateTractorChecklist,
  evaluateTractorDriver,
  generateTractorCertificate,
  TRACTOR_CATEGORIES,
  TractorTechnicalChecklist,
} from '../tractorCompliance';

describe('Tractor & Agricultural Machinery Compliance Engine', () => {
  const perfectChecklist: TractorTechnicalChecklist = {
    chassisAndEngineMatch: true,
    hydraulicSystemIntegrity: true,
    steeringBrakeFunction: true,
    emergencyBeaconLight: true,
    slowMovingVehicleSign: true,
    lightingAndReflectors: true,
    cabinRolloverProtection: true,
    fireExtinguisherAndFirstAid: true,
    ptoShaftShield: true,
    exhaustSparkArrester: true,
  };

  describe('evaluateTractorChecklist', () => {
    it('returns 100 score and compliant when all 10 items pass', () => {
      const result = evaluateTractorChecklist(perfectChecklist);
      expect(result.score).toBe(100);
      expect(result.isCompliant).toBe(true);
      expect(result.passedCount).toBe(10);
      expect(result.deficiencies.length).toBe(0);
      expect(result.fineAmountAzn).toBe(0);
      expect(result.legalArticlesViolated.length).toBe(0);
    });

    it('fails compliance if chassis and engine serial do not match passport', () => {
      const checklist = { ...perfectChecklist, chassisAndEngineMatch: false };
      const result = evaluateTractorChecklist(checklist);
      expect(result.isCompliant).toBe(false);
      expect(result.fineAmountAzn).toBe(150);
      expect(result.legalArticlesViolated).toContain('İXM Maddə 342.2-1');
      expect(result.deficiencies).toContain('Şassi və mühərrik nömrələrinin texniki pasportla eyniliyi');
    });

    it('fails compliance if steering brake function lacks highway lock latch', () => {
      const checklist = { ...perfectChecklist, steeringBrakeFunction: false };
      const result = evaluateTractorChecklist(checklist);
      expect(result.isCompliant).toBe(false);
      expect(result.fineAmountAzn).toBe(150);
      expect(result.legalArticlesViolated).toContain('İXM Maddə 342.2');
    });

    it('calculates multiple fines and deficiencies correctly', () => {
      const degraded: TractorTechnicalChecklist = {
        ...perfectChecklist,
        emergencyBeaconLight: false, // 50 AZN
        slowMovingVehicleSign: false, // 40 AZN
        exhaustSparkArrester: false, // 60 AZN
      };
      const result = evaluateTractorChecklist(degraded);
      expect(result.fineAmountAzn).toBe(150);
      expect(result.deficiencies.length).toBe(3);
      expect(result.passedCount).toBe(7);
      expect(result.score).toBe(75);
    });
  });

  describe('evaluateTractorDriver', () => {
    it('passes fully qualified operator for category B', () => {
      const result = evaluateTractorDriver({
        fullName: 'Murad Əliyev',
        finCode: '7TY4102',
        category: 'B',
        driverAge: 25,
        medicalFitnessValid: true,
        theoryExamScore: 10,
        practicalTillageExamPassed: true,
      });
      expect(result.isEligible).toBe(true);
      expect(result.score).toBe(100);
      expect(result.disqualifications.length).toBe(0);
    });

    it('disqualifies under-aged driver for crawler category D (min age 19)', () => {
      const result = evaluateTractorDriver({
        fullName: 'Kənan Bağırov',
        finCode: '5BN8841',
        category: 'D',
        driverAge: 18, // Requires 19
        medicalFitnessValid: true,
        theoryExamScore: 9,
        practicalTillageExamPassed: true,
      });
      expect(result.isEligible).toBe(false);
      expect(result.disqualifications[0]).toContain('minimum 19');
    });

    it('disqualifies if theory exam score is below 9/10', () => {
      const result = evaluateTractorDriver({
        fullName: 'Samir İsmayılov',
        finCode: '4LL9012',
        category: 'F',
        driverAge: 32,
        medicalFitnessValid: true,
        theoryExamScore: 8,
        practicalTillageExamPassed: true,
      });
      expect(result.isEligible).toBe(false);
      expect(result.disqualifications.some((d) => d.includes('minimum 9'))).toBe(true);
    });

    it('disqualifies if medical fitness Forma AZS-083/e is invalid', () => {
      const result = evaluateTractorDriver({
        fullName: 'Eldar Rzayev',
        finCode: '1AA2233',
        category: 'A',
        driverAge: 22,
        medicalFitnessValid: false,
        theoryExamScore: 10,
        practicalTillageExamPassed: true,
      });
      expect(result.isEligible).toBe(false);
      expect(result.disqualifications.some((d) => d.includes('Forma AZS-083/e'))).toBe(true);
    });
  });

  describe('evaluateFieldTransitSafety', () => {
    it('strictly prohibits metal crawler tractors on asphalt highways', () => {
      const result = evaluateFieldTransitSafety({
        machineryType: 'crawler',
        travelSurface: 'asphalt_highway',
        hasAmberBeaconActive: true,
        hasPilotEscortVehicle: false,
        plannedSpeedKmh: 15,
      });
      expect(result.isHighwayTransitPermitted).toBe(false);
      expect(result.restrictions[0]).toContain('asfalt örtüklü');
      expect(result.mandatoryActions[0]).toContain('aşağı platformalı xüsusi ağır yük treylerində');
      expect(result.fineRiskAzn).toBeGreaterThanOrEqual(150);
    });

    it('allows crawler on dirt field roads', () => {
      const result = evaluateFieldTransitSafety({
        machineryType: 'crawler',
        travelSurface: 'dirt_field_road',
        hasAmberBeaconActive: true,
        hasPilotEscortVehicle: false,
        plannedSpeedKmh: 12,
      });
      expect(result.isHighwayTransitPermitted).toBe(true);
      expect(result.fineRiskAzn).toBe(0);
    });

    it('prohibits combine on highway if cutting header (>2.55m) is attached to front', () => {
      const result = evaluateFieldTransitSafety({
        machineryType: 'combine',
        travelSurface: 'asphalt_highway',
        cuttingWidthMeters: 6.0,
        isHeaderAttachedToFront: true,
        hasAmberBeaconActive: true,
        hasPilotEscortVehicle: true,
        plannedSpeedKmh: 25,
      });
      expect(result.isHighwayTransitPermitted).toBe(false);
      expect(result.overhangWarning).toBe(true);
      expect(result.fineRiskAzn).toBeGreaterThanOrEqual(600);
      expect(result.mandatoryActions.some((a) => a.includes('təkərli qoşqu arabacığına'))).toBe(true);
    });

    it('permits combine on highway when header is detached and amber beacon is active', () => {
      const result = evaluateFieldTransitSafety({
        machineryType: 'combine',
        travelSurface: 'asphalt_highway',
        cuttingWidthMeters: 6.0,
        isHeaderAttachedToFront: false,
        hasAmberBeaconActive: true,
        hasPilotEscortVehicle: false,
        plannedSpeedKmh: 25,
      });
      expect(result.isHighwayTransitPermitted).toBe(true);
      expect(result.overhangWarning).toBe(false);
    });

    it('flags speeding violation when planned speed exceeds legal limit', () => {
      const result = evaluateFieldTransitSafety({
        machineryType: 'wheeled',
        travelSurface: 'asphalt_highway',
        hasAmberBeaconActive: true,
        hasPilotEscortVehicle: false,
        plannedSpeedKmh: 55, // Legal cap is 40 km/h
      });
      expect(result.restrictions.some((r) => r.includes('Maksimum qanuni sürət həddi'))).toBe(true);
      expect(result.fineRiskAzn).toBe(50);
    });
  });

  describe('calculateEktisSubsidy', () => {
    it('calculates 40% state non-refundable subsidy and 20% farmer down payment', () => {
      const result = calculateEktisSubsidy({
        machineryPriceAzn: 100000,
        machineryCategory: 'B',
        isLocalAssemblyOrPreferential: true,
        leasePeriodMonths: 60,
      });
      expect(result.machineryPriceAzn).toBe(100000);
      expect(result.stateSubsidyAzn).toBe(40000);
      expect(result.farmerDownPaymentAzn).toBe(20000);
      expect(result.subsidizedLeasingBalanceAzn).toBe(40000);
      expect(result.monthlyLeasePaymentAzn).toBe(Math.round(40000 / 60));
      expect(result.stateGrantPercentage).toBe(40);
      expect(result.currency).toBe('AZN');
    });

    it('supports currency formatting in USD and EUR', () => {
      const resultUsd = calculateEktisSubsidy({
        machineryPriceAzn: 100000,
        machineryCategory: 'C',
        isLocalAssemblyOrPreferential: true,
        currency: 'USD',
      });
      expect(resultUsd.formattedPrice).toContain('$');

      const resultEur = calculateEktisSubsidy({
        machineryPriceAzn: 100000,
        machineryCategory: 'C',
        isLocalAssemblyOrPreferential: true,
        currency: 'EUR',
      });
      expect(resultEur.formattedPrice).toContain('€');
    });
  });

  describe('generateTractorCertificate', () => {
    it('generates an official certificate with KTN-TEX-2026- prefix and valid dates', () => {
      const cert = generateTractorCertificate({
        daxaDivisionName: 'Bərdə Regional Dövlət Aqrar Xidmətlər Mərkəzi',
        plateNumber: '99-TA-102',
        chassisNumber: 'MTZ821AZ-849120',
        engineSerial: 'D243-98214',
        category: 'B',
        ownerName: 'Məhərrəm Quliyev',
        ownerVoenOrFin: 'VÖEN: 3201498112',
        safetyScore: 95,
      });

      expect(cert.certificateNumber).toMatch(/^KTN-TEX-2026-\d{5}$/);
      expect(cert.plateNumber).toBe('99-TA-102');
      expect(cert.category).toBe('B');
      expect(cert.safetyScore).toBe(95);
      expect(cert.status).toBe('valid');
      expect(cert.securityChecksum).toContain('SHA256:KTN:B:99-TA-102:');
    });
  });

  describe('TRACTOR_CATEGORIES structure', () => {
    it('covers all A through F categories', () => {
      const keys = Object.keys(TRACTOR_CATEGORIES);
      expect(keys).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
      expect(TRACTOR_CATEGORIES.D.minAge).toBe(19);
      expect(TRACTOR_CATEGORIES.A.minAge).toBe(18);
    });
  });
});
