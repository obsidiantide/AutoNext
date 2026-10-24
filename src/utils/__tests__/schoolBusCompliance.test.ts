import { describe, it, expect } from 'vitest';
import {
  auditSchoolBusTechnical,
  auditSchoolBusDriver,
  calculateSchoolRoutePricing,
  generateSchoolBusCertificate,
  SchoolBusTechnicalChecklist,
  SchoolBusDriverProfile,
} from '../schoolBusCompliance';

describe('schoolBusCompliance utility functions', () => {
  const perfectChecklist: SchoolBusTechnicalChecklist = {
    yellowBodyColor: true,
    reflectiveStripes: true,
    childIdentifierSigns: true,
    foldingStopArm: true,
    speedLimiter60kmh: true,
    alcolockInstalled: true,
    threePointSeatbelts: true,
    lowStepOrRamp: true,
    cctvAndGpsTelemetry: true,
    emergencyRoofHatches: true,
    fireExtinguishersAndAidKits: true,
  };

  const perfectDriver: SchoolBusDriverProfile = {
    fullName: 'Rövşən Babayev',
    finCode: '4K8LP91',
    licenseNumber: 'AZ9912048',
    licenseCategory: 'D',
    drivingExperienceYears: 8,
    driverAge: 42,
    hasViolationsPast2Years: false,
    medicalAttestationValid: true,
    psychologicalEvaluationPassed: true,
    hasCertifiedChaperone: true,
  };

  describe('auditSchoolBusTechnical', () => {
    it('returns 100% score and compliance when all 11 criteria are met', () => {
      const result = auditSchoolBusTechnical(perfectChecklist);
      expect(result.score).toBe(100);
      expect(result.isCompliant).toBe(true);
      expect(result.passedItemsCount).toBe(11);
      expect(result.totalItemsCount).toBe(11);
      expect(result.deficiencies.length).toBe(0);
      expect(result.fineAmountAzn).toBe(0);
      expect(result.recommendations.length).toBe(0);
    });

    it('correctly calculates penalties and recommendations when key safety items are missing', () => {
      const degradedChecklist: SchoolBusTechnicalChecklist = {
        ...perfectChecklist,
        foldingStopArm: false,
        speedLimiter60kmh: false,
        alcolockInstalled: false,
      };

      const result = auditSchoolBusTechnical(degradedChecklist);
      expect(result.score).toBeLessThan(100);
      expect(result.isCompliant).toBe(false);
      expect(result.deficiencies.length).toBe(3);
      expect(result.fineAmountAzn).toBe(450); // 100 (stop arm) + 150 (speed limiter) + 200 (alcolock)
      expect(result.legalArticlesViolated).toContain('İXM Maddə 342.2-2');
      expect(result.legalArticlesViolated).toContain('İXM Maddə 333');
      expect(result.recommendations.some((r) => r.includes('60 km/saat'))).toBe(true);
      expect(result.recommendations.some((r) => r.includes('Alco-Lock'))).toBe(true);
    });
  });

  describe('auditSchoolBusDriver', () => {
    it('approves qualified driver with D license, 3+ years experience, and certified chaperone', () => {
      const result = auditSchoolBusDriver(perfectDriver);
      expect(result.isEligible).toBe(true);
      expect(result.disqualifications.length).toBe(0);
      expect(result.approvals.length).toBe(7);
    });

    it('disqualifies driver with B category, inadequate experience, or no chaperone', () => {
      const unqualifiedDriver: SchoolBusDriverProfile = {
        ...perfectDriver,
        licenseCategory: 'B',
        drivingExperienceYears: 1,
        driverAge: 21,
        hasCertifiedChaperone: false,
      };

      const result = auditSchoolBusDriver(unqualifiedDriver);
      expect(result.isEligible).toBe(false);
      expect(result.disqualifications.some((d) => d.includes('Yararsız kateqoriya'))).toBe(true);
      expect(result.disqualifications.some((d) => d.includes('Qeyri-kafi sükan arxası təcrübə'))).toBe(true);
      expect(result.disqualifications.some((d) => d.includes('Yaş meyarı pozulub'))).toBe(true);
      expect(result.disqualifications.some((d) => d.includes('məsul müşayiətçi'))).toBe(true);
    });

    it('disqualifies driver with recent traffic violations or expired medical attestation', () => {
      const faultyDriver: SchoolBusDriverProfile = {
        ...perfectDriver,
        hasViolationsPast2Years: true,
        medicalAttestationValid: false,
      };

      const result = auditSchoolBusDriver(faultyDriver);
      expect(result.isEligible).toBe(false);
      expect(result.disqualifications.some((d) => d.includes('İXM qayda pozuntusu'))).toBe(true);
      expect(result.disqualifications.some((d) => d.includes('tibbi arayışın'))).toBe(true);
    });
  });

  describe('calculateSchoolRoutePricing', () => {
    it('calculates standard monthly tuition fee for midibus route', () => {
      const result = calculateSchoolRoutePricing({
        category: 'midibus',
        oneWayDistanceKm: 15,
        studentsCount: 25,
        serviceTier: 'standard',
        currency: 'AZN',
      });

      expect(result.monthlyFeePerStudentAzn).toBeGreaterThanOrEqual(45);
      expect(result.monthlyTotalRouteCostAzn).toBeGreaterThan(0);
      expect(result.fuelAndMaintenanceAzn).toBeGreaterThan(0);
      expect(result.driverAndAttendantSalaryAzn).toBe(1550); // 1050 + 500
      expect(result.formattedMonthlyFee).toContain('₼');
      expect(result.currency).toBe('AZN');
    });

    it('applies 20% sibling discount when hasSiblingDiscount is enabled', () => {
      const withoutDiscount = calculateSchoolRoutePricing({
        category: 'minivan',
        oneWayDistanceKm: 10,
        studentsCount: 15,
        serviceTier: 'standard',
        hasSiblingDiscount: false,
      });

      const withDiscount = calculateSchoolRoutePricing({
        category: 'minivan',
        oneWayDistanceKm: 10,
        studentsCount: 15,
        serviceTier: 'standard',
        hasSiblingDiscount: true,
      });

      expect(withDiscount.monthlyFeePerStudentAzn).toBeLessThan(withoutDiscount.monthlyFeePerStudentAzn);
      expect(withDiscount.siblingDiscountSavingsAzn).toBeGreaterThan(0);
    });

    it('converts prices to USD and EUR correctly', () => {
      const usdResult = calculateSchoolRoutePricing({
        category: 'coach',
        oneWayDistanceKm: 20,
        studentsCount: 35,
        serviceTier: 'premium_door_to_door',
        currency: 'USD',
      });

      expect(usdResult.currency).toBe('USD');
      expect(usdResult.formattedMonthlyFee).toContain('$');
    });
  });

  describe('generateSchoolBusCertificate', () => {
    it('generates complete official certificate with QR and security hash', () => {
      const cert = generateSchoolBusCertificate({
        schoolId: 'sch_baku_23',
        schoolName: '23 Nömrəli Tam Orta Məktəb',
        vehicleMakeModel: 'Iveco Daily School',
        plateNumber: '99-JS-412',
        vinCode: 'ZCFC50D4805829104',
        capacitySeats: 22,
        driverFullName: 'Rövşən Babayev',
        driverFin: '4K8LP91',
        chaperoneFullName: 'Nərgiz Məmmədova',
        isFullyCompliant: true,
      });

      expect(cert.certificateNumber).toMatch(/^AYNA-SCH-2026-\d{5}$/);
      expect(cert.routePassportNumber).toBe('MP-SCH-99JS412');
      expect(cert.securityHash).toContain('SHA256:');
      expect(cert.qrVerificationUrl).toContain('https://ayna.gov.az/verify/school-bus?cert=');
      expect(cert.speedCapKmh).toBe(60);
      expect(cert.complianceRating).toContain('TƏSDİQLƏNDİ');
    });
  });
});
