import { describe, it, expect } from 'vitest';
import {
  convertCurrency,
  formatCurrency,
  formatAzerbaijanPlate,
  isValidAzerbaijanPlate,
  getLosDetails,
  calculateAnprFines,
  calculateGreenWaveSync,
  generateSafeCityCertificate,
  AnprDetection,
} from '../safeCityCompliance';

describe('safeCityCompliance utils', () => {
  describe('currency conversion and formatting', () => {
    it('converts AZN to USD and EUR properly', () => {
      const aznAmount = 100;
      const usdAmount = convertCurrency(aznAmount, 'USD');
      const eurAmount = convertCurrency(aznAmount, 'EUR');

      expect(usdAmount).toBeCloseTo(58.82, 1);
      expect(eurAmount).toBeCloseTo(54.35, 1);
      expect(convertCurrency(aznAmount, 'AZN')).toBe(100);
    });

    it('formats currencies with appropriate symbols', () => {
      expect(formatCurrency(100, 'AZN')).toContain('100.00 ₼');
      expect(formatCurrency(50, 'USD')).toContain('$50.00');
      expect(formatCurrency(45, 'EUR')).toContain('€45.00');
    });
  });

  describe('plate validation and formatting', () => {
    it('formats clean alphanumeric strings into standard Azerbaijan license plates', () => {
      expect(formatAzerbaijanPlate('10aa100')).toBe('10-AA-100');
      expect(formatAzerbaijanPlate('99-nn-999')).toBe('99-NN-999');
      expect(formatAzerbaijanPlate('77gb707')).toBe('77-GB-707');
    });

    it('validates authentic Azerbaijan plate patterns', () => {
      expect(isValidAzerbaijanPlate('10-AA-100')).toBe(true);
      expect(isValidAzerbaijanPlate('99-NN-999')).toBe(true);
      expect(isValidAzerbaijanPlate('INVALID')).toBe(false);
      expect(isValidAzerbaijanPlate('100-AAA-10')).toBe(false);
    });
  });

  describe('Level of Service (LOS) details', () => {
    it('returns appropriate details for all LOS levels A to F', () => {
      const losA = getLosDetails('LOS_A');
      expect(losA.code).toBe('LOS_A');
      expect(losA.delaySecondsPerVehicle).toBe('< 10 san');
      expect(losA.colorClass).toContain('text-emerald-400');

      const losF = getLosDetails('LOS_F');
      expect(losF.code).toBe('LOS_F');
      expect(losF.delaySecondsPerVehicle).toBe('> 80 san');
      expect(losF.colorClass).toContain('text-red-400');
    });
  });

  describe('calculateAnprFines', () => {
    const baseDetection: AnprDetection = {
      plateNumber: '10-AA-100',
      speedKmh: 60,
      speedLimitKmh: 60,
      isSpeeding: false,
      speedDeltaKmh: 0,
      inBusLane: false,
      seatbeltFastened: true,
      usingMobilePhone: false,
      redLightRun: false,
      plateObscured: false,
      isStolenOrWanted: false,
      cameraConfidence: 99.0,
      timestamp: '2026-10-26 12:00:00',
      corridorId: 'corridor-1',
    };

    it('calculates zero fines for compliant driver', () => {
      const result = calculateAnprFines(baseDetection);
      expect(result.totalFineAZN).toBe(0);
      expect(result.discountedFineAZN).toBe(0);
      expect(result.totalDemeritPoints).toBe(0);
      expect(result.violations).toHaveLength(0);
      expect(result.hasCriticalViolation).toBe(false);
    });

    it('calculates tier 1 speeding (10-20 km/h: 20 AZN, 0 points)', () => {
      const detection: AnprDetection = {
        ...baseDetection,
        speedKmh: 75,
        isSpeeding: true,
        speedDeltaKmh: 15,
      };
      const result = calculateAnprFines(detection);
      expect(result.totalFineAZN).toBe(20);
      expect(result.discountedFineAZN).toBe(10);
      expect(result.totalDemeritPoints).toBe(0);
      expect(result.violations[0].code).toBe('IXM-327.1');
    });

    it('calculates tier 2 speeding (20-40 km/h: 50 AZN, 2 points)', () => {
      const detection: AnprDetection = {
        ...baseDetection,
        speedKmh: 90,
        isSpeeding: true,
        speedDeltaKmh: 30,
      };
      const result = calculateAnprFines(detection);
      expect(result.totalFineAZN).toBe(50);
      expect(result.discountedFineAZN).toBe(25);
      expect(result.totalDemeritPoints).toBe(2);
      expect(result.violations[0].code).toBe('IXM-327.2');
    });

    it('calculates tier 3 speeding (40-60 km/h: 100 AZN, 3 points)', () => {
      const detection: AnprDetection = {
        ...baseDetection,
        speedKmh: 110,
        isSpeeding: true,
        speedDeltaKmh: 50,
      };
      const result = calculateAnprFines(detection);
      expect(result.totalFineAZN).toBe(100);
      expect(result.discountedFineAZN).toBe(50);
      expect(result.totalDemeritPoints).toBe(3);
      expect(result.violations[0].code).toBe('IXM-327.3');
    });

    it('calculates tier 4 speeding (>60 km/h: 250 AZN, 4 points)', () => {
      const detection: AnprDetection = {
        ...baseDetection,
        speedKmh: 130,
        isSpeeding: true,
        speedDeltaKmh: 70,
      };
      const result = calculateAnprFines(detection);
      expect(result.totalFineAZN).toBe(250);
      expect(result.discountedFineAZN).toBe(125);
      expect(result.totalDemeritPoints).toBe(4);
      expect(result.violations[0].code).toBe('IXM-327.4');
      expect(result.hasCriticalViolation).toBe(true);
    });

    it('calculates dedicated bus lane fine (100 AZN, 2 points)', () => {
      const detection: AnprDetection = {
        ...baseDetection,
        inBusLane: true,
      };
      const result = calculateAnprFines(detection);
      expect(result.totalFineAZN).toBe(100);
      expect(result.totalDemeritPoints).toBe(2);
      expect(result.violations[0].code).toBe('IXM-327.1-1');
    });

    it('combines multiple violations correctly', () => {
      const detection: AnprDetection = {
        ...baseDetection,
        speedKmh: 85,
        isSpeeding: true,
        speedDeltaKmh: 25, // 50 AZN, 2 points
        inBusLane: true, // 100 AZN, 2 points
        seatbeltFastened: false, // 40 AZN
        usingMobilePhone: true, // 50 AZN, 2 points
      };
      const result = calculateAnprFines(detection);
      expect(result.totalFineAZN).toBe(50 + 100 + 40 + 50); // 240 AZN
      expect(result.discountedFineAZN).toBe(120);
      expect(result.totalDemeritPoints).toBe(2 + 2 + 2); // 6 points
      expect(result.violations).toHaveLength(4);
    });

    it('handles stolen/wanted vehicle trigger as critical violation', () => {
      const detection: AnprDetection = {
        ...baseDetection,
        isStolenOrWanted: true,
      };
      const result = calculateAnprFines(detection);
      expect(result.hasCriticalViolation).toBe(true);
      expect(result.violations.some((v) => v.code === 'DIN-ALARM-WANTED')).toBe(true);
    });
  });

  describe('calculateGreenWaveSync', () => {
    it('calculates optimal metrics when driver speed matches green wave speed', () => {
      const result = calculateGreenWaveSync(6.8, 70, 70);
      expect(result.isSpeedInSync).toBe(true);
      expect(result.syncEfficiencyPercent).toBe(100);
      expect(result.estimatedStops).toBe(0);
      expect(result.fuelSavedLiters).toBeGreaterThan(0);
      expect(result.recommendation).toContain('Optimal "Yaşıl Dalğa" koordinasiyası aktivdir');
    });

    it('detects when driver is exceeding green wave speed', () => {
      const result = calculateGreenWaveSync(6.8, 90, 70);
      expect(result.isSpeedInSync).toBe(false);
      expect(result.syncEfficiencyPercent).toBeLessThan(100);
      expect(result.estimatedStops).toBeGreaterThan(0);
      expect(result.recommendation).toContain('Yaşıl Dalğa hədəfindən');
    });

    it('detects when driver is driving too slowly for the wave', () => {
      const result = calculateGreenWaveSync(6.8, 40, 70);
      expect(result.isSpeedInSync).toBe(false);
      expect(result.recommendation).toContain('Sürətiniz çox aşağıdır');
    });
  });

  describe('generateSafeCityCertificate', () => {
    it('generates a valid certificate with hashes and inspector badges', () => {
      const cert = generateSafeCityCertificate(
        '10-AA-100',
        'VF1BB0A0548190342',
        'Namiq Rəşid oğlu Məmmədov',
        'Heydər Əliyev prospekti',
        'LOS_A'
      );

      expect(cert.certificateId).toMatch(/^DIN-NIIM-2026-\d{5}$/);
      expect(cert.plateNumber).toBe('10-AA-100');
      expect(cert.ownerFullName).toBe('Namiq Rəşid oğlu Məmmədov');
      expect(cert.securityHash).toContain('SHA256-');
      expect(cert.simaSignatureUid).toContain('SIMA-AZ-NIIM-');
      expect(cert.inspectorBadge).toContain('DİN-NİİM');
    });
  });
});
