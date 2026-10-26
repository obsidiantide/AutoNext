import { describe, it, expect } from 'vitest';
import {
  getExtinguisherRequirement,
  calculateFireSafetyScore,
  evaluateExtinguisher,
  checkHydrantProximity,
  convertCurrency,
  formatAZN,
  generateFireSafetyCertificate,
  EXTINGUISHER_REQUIREMENTS,
} from '../fireSafetyCompliance';
import { FIRE_SAFETY_CHECKLIST_ITEMS } from '../../data/mockFireSafetyData';

describe('fireSafetyCompliance Utility', () => {
  describe('getExtinguisherRequirement', () => {
    it('returns correct requirement for m1_passenger', () => {
      const req = getExtinguisherRequirement('m1_passenger');
      expect(req.minCylinders).toBe(1);
      expect(req.minTotalCapacityKg).toBe(2);
      expect(req.primaryType).toBe('op2_powder');
      expect(req.annualFeeAZN).toBe(20);
      expect(req.fineIfMissingAZN).toBe(50);
    });

    it('returns correct requirement for adr_tanker', () => {
      const req = getExtinguisherRequirement('adr_tanker');
      expect(req.minCylinders).toBe(2);
      expect(req.minTotalCapacityKg).toBe(12);
      expect(req.primaryType).toBe('op6_powder');
      expect(req.annualFeeAZN).toBe(70);
      expect(req.fineIfMissingAZN).toBe(150);
    });

    it('defaults to m1_passenger for unknown category', () => {
      // @ts-expect-error testing fallback
      const req = getExtinguisherRequirement('unknown_type');
      expect(req.category).toBe('m1_passenger');
    });
  });

  describe('calculateFireSafetyScore', () => {
    it('calculates 100% and tier_1_certified when all items are checked', () => {
      const allIds = FIRE_SAFETY_CHECKLIST_ITEMS.map(i => i.id);
      const result = calculateFireSafetyScore(allIds, FIRE_SAFETY_CHECKLIST_ITEMS);

      expect(result.percentage).toBe(100);
      expect(result.grade).toBe('tier_1_certified');
      expect(result.isCertified).toBe(true);
      expect(result.gradeLabel).toContain('Dövlət Sertifikatına Tam Uyğundur');
    });

    it('calculates 0% and tier_3_failed_critical when no items are checked', () => {
      const result = calculateFireSafetyScore([], FIRE_SAFETY_CHECKLIST_ITEMS);

      expect(result.percentage).toBe(0);
      expect(result.grade).toBe('tier_3_failed_critical');
      expect(result.isCertified).toBe(false);
      expect(result.gradeLabel).toContain('İstismara Qadağa');
    });

    it('calculates tier_2_minor_defects when percentage is between 65% and 84%', () => {
      // Pick first 6 items
      const selectedIds = FIRE_SAFETY_CHECKLIST_ITEMS.slice(0, 6).map(i => i.id);
      const result = calculateFireSafetyScore(selectedIds, FIRE_SAFETY_CHECKLIST_ITEMS);

      expect(result.percentage).toBeGreaterThanOrEqual(65);
      expect(result.percentage).toBeLessThan(85);
      expect(result.grade).toBe('tier_2_minor_defects');
      expect(result.isCertified).toBe(false);
    });
  });

  describe('evaluateExtinguisher', () => {
    it('evaluates extinguisher as valid when pressure is in green zone and within 12 months', () => {
      const result = evaluateExtinguisher(4, 1.35, 'm1_passenger');

      expect(result.isValid).toBe(true);
      expect(result.pressureStatus).toBe('green');
      expect(result.status).toBe('valid');
      expect(result.fineRiskAZN).toBe(0);
      expect(result.inspectionFeeAZN).toBe(20);
      expect(result.inspectionFeeUSD).toBeCloseTo(20 / 1.70, 2);
    });

    it('detects depressurized condition when pressure is below 1.1 bar', () => {
      const result = evaluateExtinguisher(2, 0.8, 'm1_passenger');

      expect(result.isValid).toBe(false);
      expect(result.pressureStatus).toBe('red_low');
      expect(result.status).toBe('depressurized');
      expect(result.fineRiskAZN).toBe(50);
      expect(result.statusLabel).toContain('Təzyiq Qüsuru');
    });

    it('detects overpressure when pressure exceeds 1.6 bar', () => {
      const result = evaluateExtinguisher(2, 1.8, 'm1_passenger');

      expect(result.isValid).toBe(false);
      expect(result.pressureStatus).toBe('red_high');
      expect(result.status).toBe('depressurized');
      expect(result.fineRiskAZN).toBe(50);
    });

    it('detects expired inspection when months exceed 12', () => {
      const result = evaluateExtinguisher(14, 1.35, 'm3_bus');

      expect(result.isValid).toBe(false);
      expect(result.status).toBe('expired');
      expect(result.fineRiskAZN).toBe(100);
      expect(result.statusLabel).toContain('Müddəti Bitib');
    });

    it('flags expiring_soon when within 30 days of 1-year threshold', () => {
      const result = evaluateExtinguisher(11.5, 1.35, 'm1_passenger');

      expect(result.isValid).toBe(true);
      expect(result.status).toBe('expiring_soon');
      expect(result.daysUntilExpiry).toBeLessThanOrEqual(30);
    });
  });

  describe('checkHydrantProximity', () => {
    it('returns compliant when distance is 5.0m or more', () => {
      const result = checkHydrantProximity(6.2);

      expect(result.isCompliant).toBe(true);
      expect(result.fineAZN).toBe(0);
      expect(result.towingRisk).toBe(false);
      expect(result.warningMessage).toContain('Qanuni məsafə təmin olunub');
    });

    it('returns violation and towing risk when distance is less than 5.0m', () => {
      const result = checkHydrantProximity(2.4);

      expect(result.isCompliant).toBe(false);
      expect(result.fineAZN).toBe(40);
      expect(result.towingRisk).toBe(true);
      expect(result.warningMessage).toContain('Qadağan olunmuş zona');
      expect(result.legalRef).toContain('YHQ Maddə 52');
    });
  });

  describe('Currency conversion and formatting', () => {
    it('converts correctly between AZN, USD, and EUR', () => {
      expect(convertCurrency(170, 'AZN')).toBe(170);
      expect(convertCurrency(170, 'USD')).toBe(100);
      expect(convertCurrency(185, 'EUR')).toBe(100);
    });

    it('formats monetary values with symbols', () => {
      expect(formatAZN(50, 'AZN')).toContain('50');
      expect(formatAZN(50, 'AZN')).toContain('₼');
      expect(formatAZN(100, 'USD')).toContain('$');
      expect(formatAZN(100, 'EUR')).toContain('€');
    });
  });

  describe('generateFireSafetyCertificate', () => {
    it('generates a complete valid certificate with security hashes and signatures', () => {
      const cert = generateFireSafetyCertificate({
        vehiclePlate: '10-AA-112',
        vehicleModel: 'Mercedes-Benz E 300',
        ownerName: 'Rəşad Nəzərov',
        ownerFin: '1ABC456',
        category: 'm1_passenger',
        extinguisherType: 'op2_powder',
        extinguisherSerial: 'AZ-OP2-994821',
        cylinderWeightKg: 2,
        pressureBar: 1.35,
        score: 95,
        stationId: 'fhn-sta-baku-main',
        stationName: 'FHN DYNX Baş İdarəsi',
        inspectorName: 'Vüsal Məmmədli',
        inspectorBadge: 'FHN-DYNX-0442',
      });

      expect(cert.certificateNumber).toMatch(/^FHN-DYNX-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('10-AA-112');
      expect(cert.grade).toBe('tier_1_certified');
      expect(cert.sha256Checksum).toContain('sha256:fhn_');
      expect(cert.simaSignatureUid).toContain('SIMA-FHN-');
      expect(cert.qrVerificationUrl).toContain('https://fhn.gov.az/e-certificate/verify');
      expect(cert.issueDate).toBeDefined();
      expect(cert.expiryDate).toBeDefined();
    });
  });
});
