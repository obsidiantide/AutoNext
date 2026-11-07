import { describe, it, expect } from 'vitest';
import {
  calculateTerminalSimulation,
  calculateTerminalStatutorySanctions,
  convertTerminalSafeCurrency,
  generateTerminalCertificate,
} from '../terminalSafeCompliance';
import {
  MOCK_TERMINAL_CORRIDOR_STATIONS,
  MOCK_TERMINAL_VEHICLE_PRESETS,
} from '../../data/mockTerminalSafeData';

describe('terminalSafeCompliance Utility Suite', () => {
  it('correctly calculates kinetic energy and extrusion stroke displacement for frontal impact', () => {
    const result = calculateTerminalSimulation({
      vehicleSpeedKmh: 105,
      vehicleMassKg: 1850,
      impactAngleDeg: 0,
      terminalType: 'TANGENT_EXTRUDER',
      performanceClass: 'P4',
      postCondition: 'OPTIMAL_SHEAR',
      shearedPostsCount: 4,
    });

    // 105 km/h ≈ 29.17 m/s; Ek = 0.5 * 1850 * (29.17)^2 / 1000 ≈ 787 kJ
    expect(result.kineticEnergyKj).toBeGreaterThan(700);
    expect(result.kineticEnergyKj).toBeLessThan(900);
    expect(result.extrusionStrokeDisplacementM).toBeGreaterThan(0.5);
    expect(result.averageDecelerationG).toBeGreaterThan(0);
    expect(result.accelerationSeverityIndexASI).toBeGreaterThan(0.3);
    expect(result.accelerationSeverityIndexASI).toBeLessThan(2.0);
    expect(result.impalementDefended).toBe(true);
    expect(result.cockpitPenetrationRiskPct).toBeLessThan(30);
    expect(result.terminalStatus).toBe('CONTROLLED_ENERGY_ABSORPTION');
    expect(result.estimatedRestitutionAzn).toBeGreaterThan(1500);
  });

  it('evaluates flared deflection terminal with angled impact', () => {
    const result = calculateTerminalSimulation({
      vehicleSpeedKmh: 110,
      vehicleMassKg: 2650,
      impactAngleDeg: 15,
      terminalType: 'FLARED_DEFLECTION',
      performanceClass: 'P4',
      postCondition: 'OPTIMAL_SHEAR',
      shearedPostsCount: 6,
    });

    expect(result.kineticEnergyKj).toBeGreaterThan(1200);
    expect(result.vehicleRedirectionStabilityPct).toBeGreaterThan(50);
    // At high kinetic energy or angle >= 12, check status reflects redirection or overload risk
    expect(['CONTROLLED_REDIRECTIVE_DEFLECTION', 'STRUCTURAL_OVERLOAD_RISK', 'CRITICAL_SPEAR_PENETRATION_HAZARD']).toContain(result.terminalStatus);
  });

  it('detects critical spear penetration risk when terminal class is exceeded', () => {
    const result = calculateTerminalSimulation({
      vehicleSpeedKmh: 130, // Exceeds P1 (50 km/h) heavily
      vehicleMassKg: 3500,
      impactAngleDeg: 5,
      terminalType: 'TANGENT_EXTRUDER',
      performanceClass: 'P1',
      postCondition: 'SOIL_DISPLACEMENT',
      shearedPostsCount: 8,
    });

    expect(result.cockpitPenetrationRiskPct).toBeGreaterThan(40);
  });

  it('handles weathered rust and soil displacement post conditions properly', () => {
    const optimalResult = calculateTerminalSimulation({
      vehicleSpeedKmh: 90,
      vehicleMassKg: 1500,
      impactAngleDeg: 0,
      terminalType: 'TANGENT_EXTRUDER',
      performanceClass: 'P3',
      postCondition: 'OPTIMAL_SHEAR',
      shearedPostsCount: 3,
    });

    const soilResult = calculateTerminalSimulation({
      vehicleSpeedKmh: 90,
      vehicleMassKg: 1500,
      impactAngleDeg: 0,
      terminalType: 'TANGENT_EXTRUDER',
      performanceClass: 'P3',
      postCondition: 'SOIL_DISPLACEMENT',
      shearedPostsCount: 3,
    });

    // Lower resistance means larger displacement and higher risk
    expect(soilResult.extrusionStrokeDisplacementM).toBeGreaterThanOrEqual(optimalResult.extrusionStrokeDisplacementM);
    expect(soilResult.cockpitPenetrationRiskPct).toBeGreaterThan(optimalResult.cockpitPenetrationRiskPct);
  });

  it('correctly calculates statutory fines and 50% discount under Article 38', () => {
    const sanctions = calculateTerminalStatutorySanctions(
      125, // speed
      90,  // limit -> excess 35 km/h -> İXM 328.2: 50 AZN + 2 bal
      true, // zone encroachment -> İXM 327.2: 80 AZN + 3 bal
      2400  // restitution
    );

    expect(sanctions.ixm327_2FineAzn).toBe(80);
    expect(sanctions.ixm327_2PenaltyPoints).toBe(3);
    expect(sanctions.ixm328_2SpeedingFineAzn).toBe(50);
    expect(sanctions.ixm328_2PenaltyPoints).toBe(2);
    expect(sanctions.ixm353_1DamageFineAzn).toBe(600);
    expect(sanctions.civil1108RestitutionAzn).toBe(2400);

    const grossFines = 80 + 50 + 600; // 730
    expect(sanctions.totalGrossLiabilityAzn).toBe(730 + 2400); // 3130
    expect(sanctions.totalDiscountedLiabilityAzn).toBe(grossFines * 0.5 + 2400); // 365 + 2400 = 2765
    expect(sanctions.totalPenaltyPoints).toBe(5);
  });

  it('correctly converts currencies (AZN, USD, EUR)', () => {
    expect(convertTerminalSafeCurrency(100, 'AZN')).toBe(100);
    expect(convertTerminalSafeCurrency(100, 'USD')).toBe(58.82);
    expect(convertTerminalSafeCurrency(100, 'EUR')).toBe(54.05);
  });

  it('generates an official valid certificate with verification pin and sha256', () => {
    const station = MOCK_TERMINAL_CORRIDOR_STATIONS[0];
    const vehicle = MOCK_TERMINAL_VEHICLE_PRESETS[0];
    const sim = calculateTerminalSimulation({
      vehicleSpeedKmh: vehicle.defaultSpeedKmh,
      vehicleMassKg: vehicle.massKg,
      impactAngleDeg: vehicle.impactAngleDeg,
      terminalType: station.terminalType,
      performanceClass: station.performanceClass,
      postCondition: 'OPTIMAL_SHEAR',
      shearedPostsCount: 4,
    });

    const cert = generateTerminalCertificate(station, vehicle, sim);

    expect(cert.certificateId).toMatch(/^TERMINAL-SAFE-AZ-2026-\d{5}$/);
    expect(cert.simaDigitalUid).toMatch(/^SIMA-AAYDA-TRM-\d{6}$/);
    expect(cert.verificationPin.length).toBe(4);
    expect(cert.vehiclePlate).toBe(vehicle.licensePlate);
    expect(cert.status).toBe('VERIFIED');
    expect(cert.sha256Hash.length).toBeGreaterThan(20);
  });
});
