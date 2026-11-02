import { describe, it, expect } from 'vitest';
import {
  getStatutoryTreadDepthLimit,
  calculateHorneSpeed,
  calculateEffectiveHydroplaningSpeed,
  simulateSkidAndAquaplaning,
  calculateSkidStatutoryFines,
  convertSkidCurrency,
  generateSkidCertificate,
} from '../skidSafeCompliance';
import { MOCK_SKID_CORRIDORS } from '../../data/mockSkidSafeData';

describe('skidSafeCompliance Utility Functions', () => {
  describe('getStatutoryTreadDepthLimit', () => {
    it('returns 1.6 mm for passenger cars and SUVs', () => {
      expect(getStatutoryTreadDepthLimit('passenger_sedan')).toBe(1.6);
      expect(getStatutoryTreadDepthLimit('all_wheel_drive_suv')).toBe(1.6);
      expect(getStatutoryTreadDepthLimit('patrol_interceptor')).toBe(1.6);
      expect(getStatutoryTreadDepthLimit('worn_tire_sedan')).toBe(1.6);
    });

    it('returns 1.0 mm for heavy commercial trucks', () => {
      expect(getStatutoryTreadDepthLimit('heavy_truck_tir')).toBe(1.0);
    });

    it('returns 2.0 mm for intercity passenger buses', () => {
      expect(getStatutoryTreadDepthLimit('intercity_coach_bus')).toBe(2.0);
    });
  });

  describe('calculateHorneSpeed', () => {
    it('calculates Horne baseline hydroplaning speed accurately', () => {
      // For p = 250 kPa: 6.36 * sqrt(250) ≈ 6.36 * 15.811 ≈ 100.56 km/h
      const speed = calculateHorneSpeed(250);
      expect(speed).toBeCloseTo(100.6, 1);
    });

    it('enforces pressure bounds between 100 kPa and 1200 kPa', () => {
      const minSpeed = calculateHorneSpeed(50); // should clamp to 100
      expect(minSpeed).toBeCloseTo(63.6, 1);

      const maxSpeed = calculateHorneSpeed(1500); // should clamp to 1200
      expect(maxSpeed).toBeCloseTo(220.3, 1);
    });
  });

  describe('calculateEffectiveHydroplaningSpeed', () => {
    it('calculates lower effective speed with worn tread and deep water film', () => {
      // Good condition: 250 kPa, 8mm tread, 1.0mm water, 1.2mm MPD
      const goodSpeed = calculateEffectiveHydroplaningSpeed(250, 8.0, 1.0, 1.2);
      // Worn condition: 250 kPa, 1.5mm tread, 4.0mm water, 0.4mm MPD
      const wornSpeed = calculateEffectiveHydroplaningSpeed(250, 1.5, 4.0, 0.4);

      expect(wornSpeed).toBeLessThan(goodSpeed);
      expect(goodSpeed).toBeGreaterThan(90);
    });

    it('returns higher speed when water puddle is minimal and drains into macrotexture', () => {
      const drySpeed = calculateEffectiveHydroplaningSpeed(250, 8.0, 0.2, 1.5);
      expect(drySpeed).toBeGreaterThan(120);
    });
  });

  describe('simulateSkidAndAquaplaning', () => {
    it('accurately evaluates safe conditions for moderate speed and new tires', () => {
      const result = simulateSkidAndAquaplaning({
        approachSpeedKmh: 60,
        tirePressureKpa: 240,
        treadDepthMm: 7.5,
        waterFilmDepthMm: 1.0,
        meanProfileDepthMm: 1.2,
        skidNumberSn60: 65,
        driverReactionTimeSec: 1.0,
      });

      expect(result.aquaplaningRiskTier).toBe('LOW_SAFE');
      expect(result.aquaplaningRiskPercent).toBeLessThan(65);
      expect(result.tireTreadStatus).toBe('LEGAL_COMPLIANT');
      expect(result.frictionCoefficientMu).toBeGreaterThanOrEqual(0.6);
      expect(result.totalStoppingDistanceWetM).toBeGreaterThan(0);
      expect(result.stoppingDistanceIncreaseRatio).toBeGreaterThan(1.0);
    });

    it('detects critical hydrodynamic separation at excessive speed and deep water', () => {
      const result = simulateSkidAndAquaplaning({
        approachSpeedKmh: 140,
        tirePressureKpa: 210,
        treadDepthMm: 1.2, // Below legal 1.6 mm
        waterFilmDepthMm: 4.5,
        meanProfileDepthMm: 0.4,
        skidNumberSn60: 30,
        driverReactionTimeSec: 1.2,
      });

      expect(result.aquaplaningRiskTier).toBe('CRITICAL_HYDRODYNAMIC_SEPARATION');
      expect(result.tireTreadStatus).toBe('ILLEGAL_WORN_OUT');
      expect(result.pavementState).toBe('CRITICAL_AQUAPLANING_HAZARD');
      expect(result.frictionCoefficientMu).toBeLessThan(0.3);
      expect(result.totalStoppingDistanceWetM).toBeGreaterThan(150);
    });
  });

  describe('calculateSkidStatutoryFines', () => {
    it('calculates zero fine when compliant with tread and advisory speed', () => {
      const fine = calculateSkidStatutoryFines(5.0, 'passenger_sedan', 70, 80);
      expect(fine.hasTreadViolation).toBe(false);
      expect(fine.treadFineAzn).toBe(0);
      expect(fine.hasSpeedExcessWet).toBe(false);
      expect(fine.totalFineAzn).toBe(0);
      expect(fine.totalFineDiscountedAzn).toBe(0);
    });

    it('imposes 50 AZN fine under İXM 342.1 for worn tread below 1.6 mm', () => {
      const fine = calculateSkidStatutoryFines(1.2, 'passenger_sedan', 60, 60);
      expect(fine.hasTreadViolation).toBe(true);
      expect(fine.treadFineAzn).toBe(50);
      expect(fine.totalFineAzn).toBe(50);
      expect(fine.totalFineDiscountedAzn).toBe(25); // 50% discount under Article 38
    });

    it('calculates speeding fine under İXM 328 when exceeding advisory speed', () => {
      const fine = calculateSkidStatutoryFines(6.0, 'passenger_sedan', 115, 70); // +45 km/h excess
      expect(fine.hasSpeedExcessWet).toBe(true);
      expect(fine.speedExcessKmh).toBe(45);
      expect(fine.speedFineAzn).toBe(200);
      expect(fine.penaltyPoints).toBe(3);
      expect(fine.totalFineAzn).toBe(200);
      expect(fine.totalFineDiscountedAzn).toBe(100);
    });
  });

  describe('convertSkidCurrency', () => {
    it('converts AZN amounts correctly to USD and EUR', () => {
      const azn = convertSkidCurrency(100, 'AZN');
      expect(azn.amount).toBe(100);
      expect(azn.formatted).toContain('₼');

      const usd = convertSkidCurrency(100, 'USD');
      expect(usd.amount).toBe(59);
      expect(usd.formatted).toContain('$');

      const eur = convertSkidCurrency(100, 'EUR');
      expect(eur.amount).toBe(54);
      expect(eur.formatted).toContain('€');
    });
  });

  describe('generateSkidCertificate', () => {
    it('generates a valid certificate with SİMA UID, SHA-256 and PIN code', () => {
      const corridor = MOCK_SKID_CORRIDORS[0];
      const sim = simulateSkidAndAquaplaning({
        approachSpeedKmh: 80,
        tirePressureKpa: 240,
        treadDepthMm: 6.0,
        waterFilmDepthMm: 1.5,
        meanProfileDepthMm: 1.0,
        skidNumberSn60: 55,
      });

      const cert = generateSkidCertificate('99-SK-101', 'Porsche Taycan', corridor, sim);
      expect(cert.certificateId).toMatch(/^SKID-SAFE-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-SK-101');
      expect(cert.simaDigitalUid).toContain('SIMA-AZ-');
      expect(cert.verificationSha256).toContain('sha256-aayda-skid-');
      expect(cert.passPinCode).toMatch(/^\d{4}-\d{4}$/);
    });
  });
});
