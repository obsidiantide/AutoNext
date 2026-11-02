import { describe, it, expect } from 'vitest';
import {
  calculateDimensionlessHRR,
  calculateCriticalVelocity,
  calculatePeakSmokeTemperature,
  calculateOpticalVisibility,
  calculateCarbonMonoxidePpm,
  calculateJetFanThrust,
  calculateEgressTimes,
  evaluateTunnelFirePhysics,
  calculateTunnelStatutoryFines,
  convertTunnelCurrency,
  generateTunnelSafeCertificate
} from '../tunnelSafeCompliance';
import { MOCK_TUNNEL_CORRIDORS } from '../../data/mockTunnelSafeData';

describe('tunnelSafeCompliance Engine Tests', () => {
  describe('calculateDimensionlessHRR', () => {
    it('returns 0 for zero or negative fire HRR', () => {
      expect(calculateDimensionlessHRR(0, 20, 5.0, 60.0)).toBe(0);
      expect(calculateDimensionlessHRR(-10, 20, 5.0, 60.0)).toBe(0);
    });

    it('calculates dimensionless heat release rate proportionally', () => {
      const qSmall = calculateDimensionlessHRR(5.0, 20, 5.0, 60.0);
      const qLarge = calculateDimensionlessHRR(50.0, 20, 5.0, 60.0);
      expect(qLarge).toBeGreaterThan(qSmall);
      expect(qSmall).toBeGreaterThan(0);
    });
  });

  describe('calculateCriticalVelocity', () => {
    it('returns baseline velocity for zero fire heat', () => {
      const vc = calculateCriticalVelocity(0, 20, 5.0, 60.0, 1.5);
      expect(vc).toBe(0.5);
    });

    it('calculates higher critical velocity for larger fires up to bounds', () => {
      const vcCar = calculateCriticalVelocity(5.0, 20, 5.0, 60.0, 1.5);
      const vcTir = calculateCriticalVelocity(50.0, 20, 5.0, 60.0, 1.5);
      expect(vcTir).toBeGreaterThanOrEqual(vcCar);
      expect(vcCar).toBeGreaterThanOrEqual(1.0);
      expect(vcTir).toBeLessThanOrEqual(5.0);
    });

    it('increases critical velocity with steeper tunnel slopes due to chimney effect', () => {
      const vcFlat = calculateCriticalVelocity(20.0, 20, 5.0, 60.0, 0.0);
      const vcSteep = calculateCriticalVelocity(20.0, 20, 5.0, 60.0, 4.0);
      expect(vcSteep).toBeGreaterThan(vcFlat);
    });
  });

  describe('calculatePeakSmokeTemperature', () => {
    it('returns ambient temperature when no fire exists', () => {
      expect(calculatePeakSmokeTemperature(0, 22, 3.0, 60.0)).toBe(22);
    });

    it('computes higher plume temperatures for intense fires', () => {
      const tempSmall = calculatePeakSmokeTemperature(5.0, 20, 3.0, 60.0);
      const tempLarge = calculatePeakSmokeTemperature(50.0, 20, 3.0, 60.0);
      expect(tempLarge).toBeGreaterThan(tempSmall);
      expect(tempSmall).toBeGreaterThan(20);
    });
  });

  describe('calculateOpticalVisibility & CO', () => {
    it('provides clear optical visibility and baseline CO for zero fire', () => {
      const vis = calculateOpticalVisibility(0, 3.0, 60.0);
      const co = calculateCarbonMonoxidePpm(0, 3.0, 60.0);
      expect(vis).toBe(120.0);
      expect(co).toBe(8);
    });

    it('drops visibility and increases CO as fire HRR escalates', () => {
      const vis = calculateOpticalVisibility(30.0, 3.0, 60.0);
      const co = calculateCarbonMonoxidePpm(30.0, 3.0, 60.0);
      expect(vis).toBeLessThan(30.0);
      expect(co).toBeGreaterThan(50);
    });
  });

  describe('calculateJetFanThrust', () => {
    it('calculates zero delivered thrust when no fans operate', () => {
      const result = calculateJetFanThrust(0, 60.0, 5.0, 3.0);
      expect(result.deliveredThrustKN).toBe(0);
      expect(result.sufficient).toBe(false);
    });

    it('evaluates sufficiency when active fan count delivers required thrust', () => {
      const result = calculateJetFanThrust(12, 60.0, 5.0, 3.0);
      expect(result.deliveredThrustKN).toBeGreaterThan(10);
      expect(result.sufficient).toBe(true);
    });
  });

  describe('calculateEgressTimes', () => {
    it('evaluates safe evacuation margin when exit is close and smoke is low', () => {
      const egress = calculateEgressTimes(50, 60.0, 40, 5.0);
      expect(egress.egressViable).toBe(true);
      expect(egress.marginSec).toBeGreaterThan(0);
    });

    it('indicates negative margin during catastrophic conditions with distant exit', () => {
      const egress = calculateEgressTimes(250, 4.0, 400, 100.0);
      expect(egress.marginSec).toBeLessThan(100);
    });
  });

  describe('evaluateTunnelFirePhysics', () => {
    it('evaluates complete SCADA telemetry and determines backlayering prevention', () => {
      const result = evaluateTunnelFirePhysics({
        heatReleaseRateMW: 15.0,
        tunnelAirVelocityMs: 3.5,
        activeJetFansCount: 12,
        ambientAirTempC: 20,
        distanceToExitM: 100,
        tunnelSlopePct: 2.0,
        ceilingHeightM: 5.2,
        crossSectionAreaM2: 64.0,
        totalFansInstalled: 18,
        waterDelugeActive: false
      });

      expect(result.criticalVelocityMs).toBeGreaterThan(0);
      expect(result.actualVelocityMs).toBe(3.5);
      expect(result.fireThreatStage).toBe('CRITICAL_INTERVENTION_STAGE_2');
      expect(result.vmsAlertCode).toBe('VMS-TUN-CRITICAL-FIRE');
    });

    it('flags backlayering when airflow is below critical velocity', () => {
      const result = evaluateTunnelFirePhysics({
        heatReleaseRateMW: 30.0,
        tunnelAirVelocityMs: 0.5,
        activeJetFansCount: 2,
        ambientAirTempC: 20,
        distanceToExitM: 150,
        tunnelSlopePct: 2.0,
        ceilingHeightM: 5.2,
        crossSectionAreaM2: 64.0,
        totalFansInstalled: 18,
        waterDelugeActive: false
      });

      expect(result.backlayeringState).toBe('SEVERE_BACKLAYERING_ACTIVE');
      expect(result.waterMistDelugeRequired).toBe(true);
    });
  });

  describe('calculateTunnelStatutoryFines', () => {
    it('returns zero fines when no infractions are present', () => {
      const fines = calculateTunnelStatutoryFines({
        unauthorizedManeuver: false,
        emergencySignFailure: false,
        hazmatViolation: false,
        speedDeltaKmH: 0
      });
      expect(fines.totalOriginalFineAzn).toBe(0);
      expect(fines.discountedFineAzn).toBe(0);
      expect(fines.penaltyPoints).toBe(0);
    });

    it('calculates full fine and 50% discount under Article 38 for multiple violations', () => {
      const fines = calculateTunnelStatutoryFines({
        unauthorizedManeuver: true,
        emergencySignFailure: true,
        hazmatViolation: true,
        speedDeltaKmH: 25
      });
      // 60 + 80 + 150 + 50 = 340 AZN
      expect(fines.totalOriginalFineAzn).toBe(340);
      expect(fines.discountedFineAzn).toBe(170);
      expect(fines.penaltyPoints).toBe(11);
      expect(fines.legalArticles.length).toBe(4);
    });
  });

  describe('convertTunnelCurrency', () => {
    it('converts AZN to USD and EUR accurately', () => {
      expect(convertTunnelCurrency(170, 'AZN')).toBe('170 AZN');
      expect(convertTunnelCurrency(170, 'USD')).toBe('100.00 USD');
      expect(convertTunnelCurrency(185, 'EUR')).toBe('100.00 EUR');
    });
  });

  describe('generateTunnelSafeCertificate', () => {
    it('generates a valid certificate with verified status and unique identifiers', () => {
      const physics = evaluateTunnelFirePhysics({
        heatReleaseRateMW: 5.0,
        tunnelAirVelocityMs: 3.2,
        activeJetFansCount: 12,
        ambientAirTempC: 20,
        distanceToExitM: 100,
        tunnelSlopePct: 1.8,
        ceilingHeightM: 5.2,
        crossSectionAreaM2: 64.0,
        totalFansInstalled: 18,
        waterDelugeActive: false
      });

      const cert = generateTunnelSafeCertificate(
        MOCK_TUNNEL_CORRIDORS[0],
        '99-TN-101',
        'Toyota Camry Hybrid',
        physics,
        95
      );

      expect(cert.certificateId).toMatch(/^TUNNEL-SAFE-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('99-TN-101');
      expect(cert.status).toBe('VERIFIED_ACTIVE');
      expect(cert.simaDigitalUid).toContain('SIMA-TUN-');
      expect(cert.evacuationPasscode).toContain('EP-');
    });
  });
});
