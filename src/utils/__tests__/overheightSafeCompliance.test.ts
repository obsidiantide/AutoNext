import { describe, it, expect } from 'vitest';
import {
  getSurfaceFrictionCoefficient,
  calculateOverheightPhysics,
  generateOverheightCertificate,
  AZN_TO_USD,
  AZN_TO_EUR,
  OverheightSimulationInput,
} from '../overheightSafeCompliance';
import { MOCK_OVERHEIGHT_BRIDGES } from '../../data/mockOverheightSafeData';

describe('Overheight Safe Compliance Engine', () => {
  it('correctly provides road surface friction coefficients', () => {
    expect(getSurfaceFrictionCoefficient('DRY')).toBe(0.72);
    expect(getSurfaceFrictionCoefficient('WET')).toBe(0.42);
    expect(getSurfaceFrictionCoefficient('SNOW_ICE')).toBe(0.18);
  });

  it('evaluates safe clearance when vehicle is well under structure height', () => {
    const input: OverheightSimulationInput = {
      vehicleHeightM: 3.50,
      approachSpeedKmh: 80,
      vehicleGrossMassKg: 20000,
      bridgePostedClearanceM: 4.50,
      sensorDistanceBeforeBridgeM: 350,
      roadSurfaceFriction: 'DRY',
      driverReactionTimeSec: 1.2,
    };

    const res = calculateOverheightPhysics(input);
    expect(res.clearanceMarginM).toBe(1.00);
    expect(res.clearanceStatus).toBe('SAFE_CLEARANCE');
    expect(res.divertAction).toBe('PROCEED_NORMAL');
    expect(res.statutoryFineAzn).toBe(0);
    expect(res.pointsPenalty).toBe(0);
    expect(res.acousticWarningSirenActive).toBe(false);
    expect(res.safeStoppingMarginM).toBeGreaterThan(0);
  });

  it('evaluates marginal caution when clearance is under 0.30m', () => {
    const input: OverheightSimulationInput = {
      vehicleHeightM: 4.35,
      approachSpeedKmh: 60,
      vehicleGrossMassKg: 18000,
      bridgePostedClearanceM: 4.50,
      sensorDistanceBeforeBridgeM: 300,
      roadSurfaceFriction: 'DRY',
      driverReactionTimeSec: 1.2,
    };

    const res = calculateOverheightPhysics(input);
    expect(res.clearanceMarginM).toBe(0.15);
    expect(res.clearanceStatus).toBe('MARGINAL_CAUTION');
    expect(res.divertAction).toBe('REDUCE_SPEED_ADVISORY');
    expect(res.acousticWarningSirenActive).toBe(true);
    expect(res.acousticWarningDb).toBe(92);
  });

  it('evaluates critical overheight collision warning with escape slip road divert', () => {
    const input: OverheightSimulationInput = {
      vehicleHeightM: 4.80,
      approachSpeedKmh: 65,
      vehicleGrossMassKg: 32000,
      bridgePostedClearanceM: 4.50,
      sensorDistanceBeforeBridgeM: 350,
      roadSurfaceFriction: 'DRY',
      driverReactionTimeSec: 1.2,
    };

    const res = calculateOverheightPhysics(input);
    expect(res.clearanceMarginM).toBe(-0.30);
    expect(res.clearanceStatus).toBe('CRITICAL_OVERHEIGHT_COLLISION_WARNING');
    expect(res.acousticWarningSirenActive).toBe(true);
    expect(res.acousticWarningDb).toBe(118);
    expect(res.statutoryFineAzn).toBe(200); // 0.20 - 0.50m excess
    expect(res.pointsPenalty).toBe(4);
    expect(res.discountedFineAzn).toBe(100);
    expect(res.statutoryFineUsd).toBe(Number((200 * AZN_TO_USD).toFixed(2)));
    expect(res.statutoryFineEur).toBe(Number((200 * AZN_TO_EUR).toFixed(2)));
    expect(res.divertAction).toBe('MANDATORY_ESCAPE_SLIP_ROAD');
  });

  it('deploys emergency arrester barrier when safe stopping margin is negative', () => {
    const input: OverheightSimulationInput = {
      vehicleHeightM: 4.90,
      approachSpeedKmh: 120, // very high speed
      vehicleGrossMassKg: 40000,
      bridgePostedClearanceM: 4.20,
      sensorDistanceBeforeBridgeM: 100, // very short distance
      roadSurfaceFriction: 'WET',
      driverReactionTimeSec: 2.0,
    };

    const res = calculateOverheightPhysics(input);
    expect(res.clearanceStatus).toBe('CRITICAL_OVERHEIGHT_COLLISION_WARNING');
    expect(res.safeStoppingMarginM).toBeLessThan(0);
    expect(res.divertAction).toBe('EMERGENCY_ARRESTER_BARRIER_DEPLOYED');
    expect(res.statutoryFineAzn).toBe(350); // > 0.50m excess
    expect(res.pointsPenalty).toBe(5);
    expect(res.kineticEnergyAtImpactMJ).toBeGreaterThan(0);
    expect(res.structuralDamageLiabilityAzn).toBeGreaterThan(2000);
  });

  it('correctly calculates small overheight excess fine', () => {
    const input: OverheightSimulationInput = {
      vehicleHeightM: 4.40,
      approachSpeedKmh: 50,
      vehicleGrossMassKg: 15000,
      bridgePostedClearanceM: 4.30,
      sensorDistanceBeforeBridgeM: 300,
      roadSurfaceFriction: 'DRY',
      driverReactionTimeSec: 1.0,
    };

    const res = calculateOverheightPhysics(input);
    expect(res.clearanceMarginM).toBe(-0.10);
    expect(res.statutoryFineAzn).toBe(100);
    expect(res.pointsPenalty).toBe(3);
    expect(res.discountedFineAzn).toBe(50);
  });

  it('generates an official verified clearance certificate', () => {
    const bridge = MOCK_OVERHEIGHT_BRIDGES[0];
    const cert = generateOverheightCertificate(
      '99-OH-101',
      'curtain_sider_tir',
      4.00,
      bridge
    );

    expect(cert.certificateNo).toMatch(/^OVERHEIGHT-SAFE-AZ-2026-\d{5}$/);
    expect(cert.licensePlate).toBe('99-OH-101');
    expect(cert.structureId).toBe(bridge.id);
    expect(cert.status).toBe('VERIFIED_CLEARANCE');
    expect(cert.simaSignatureUid).toContain('SIMA-AZ-OHVDS');
    expect(cert.sha256Hash).toHaveLength(64);
    expect(cert.barrierPassPin).toHaveLength(4);
    expect(cert.qrVerificationUrl).toContain('aayda.gov.az');
  });

  it('marks certificate status as DIVERT_REQUIRED if clearance is negative', () => {
    const bridge = MOCK_OVERHEIGHT_BRIDGES[2]; // 4.30m posted, 4.33m actual
    const cert = generateOverheightCertificate(
      '10-OH-202',
      'raised_tipper_dumper',
      4.85,
      bridge
    );

    expect(cert.status).toBe('DIVERT_REQUIRED');
    expect(cert.clearanceMarginM).toBeLessThan(0);
  });

  it('marks certificate status as SPECIAL_PERMIT_VALIDATED if height exceeds 4.00m but fits bridge', () => {
    const bridge = MOCK_OVERHEIGHT_BRIDGES[3]; // 5.00m posted, 5.08m actual
    const cert = generateOverheightCertificate(
      '77-OH-303',
      'heavy_excavator_lowbed',
      4.65,
      bridge
    );

    expect(cert.status).toBe('SPECIAL_PERMIT_VALIDATED');
    expect(cert.clearanceMarginM).toBeGreaterThan(0);
  });
});
