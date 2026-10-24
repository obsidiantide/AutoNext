import { describe, it, expect } from 'vitest';
import {
  evaluateMopedCompliance,
  formatAzerbaijanMopedPlate,
  generateMopedRegistrationCertificate,
  STATUTORY_FEES,
} from '../mopedRegistration';
import { MopedSpecInput } from '../../types/mopedRegistration';

describe('mopedRegistration utility functions', () => {
  const baseInput: MopedSpecInput = {
    powerType: 'ice_combustion',
    engineDisplacementCc: 49,
    electricPowerKw: 0,
    maxSpeedKmh: 45,
    ownerAge: 20,
    courierPlatform: 'wolt',
    helmetCert: 'unece_22_06',
    chinStrap: 'double_d_ring',
    hasVisorEyeProtection: true,
    hasReflectiveVest: true,
    hasDeliveryBoxBracket: true,
    deliveryBoxOverhangMeters: 0.3,
    isPassengerPresent: false,
    passengerHasHelmet: false,
    selectedCurrency: 'AZN',
  };

  it('correctly classifies <=125cc moped into subcategory A1 and evaluates age 16+', () => {
    const res = evaluateMopedCompliance(baseInput);
    expect(res.requiredCategory).toBe('A1');
    expect(res.minimumAgeRequired).toBe(16);
    expect(res.isAgeCompliant).toBe(true);
    expect(res.isRegistrationMandatory).toBe(true);
    expect(res.overallRoadLegal).toBe(true);
    expect(res.potentialViolations.length).toBe(0);
    expect(res.totalFineRiskAzn).toBe(0);
  });

  it('evaluates high-displacement >125cc motorcycle as category A requiring 18 years', () => {
    const motoInput: MopedSpecInput = {
      ...baseInput,
      engineDisplacementCc: 150,
      maxSpeedKmh: 105,
      ownerAge: 17,
      courierPlatform: 'personal_use',
    };
    const res = evaluateMopedCompliance(motoInput);
    expect(res.requiredCategory).toBe('A');
    expect(res.minimumAgeRequired).toBe(18);
    expect(res.isAgeCompliant).toBe(false);
    expect(res.overallRoadLegal).toBe(false);
    expect(res.potentialViolations.some((v) => v.code === 'VIO-AGE')).toBe(true);
  });

  it('correctly handles electric mopeds <=11kW as A1 and >11kW as A', () => {
    const eScooterInput: MopedSpecInput = {
      ...baseInput,
      powerType: 'electric_motor',
      engineDisplacementCc: 0,
      electricPowerKw: 3.5,
      maxSpeedKmh: 50,
      ownerAge: 18,
    };
    const res1 = evaluateMopedCompliance(eScooterInput);
    expect(res1.requiredCategory).toBe('A1');
    expect(res1.minimumAgeRequired).toBe(16);

    const heavyElectric: MopedSpecInput = {
      ...eScooterInput,
      electricPowerKw: 14.0,
      maxSpeedKmh: 110,
    };
    const res2 = evaluateMopedCompliance(heavyElectric);
    expect(res2.requiredCategory).toBe('A');
    expect(res2.minimumAgeRequired).toBe(18);
  });

  it('calculates helmet score and flags non-certified or unstrapped helmets', () => {
    const badHelmetInput: MopedSpecInput = {
      ...baseInput,
      helmetCert: 'non_certified_novelty',
      chinStrap: 'broken_missing',
      hasVisorEyeProtection: false,
    };
    const res = evaluateMopedCompliance(badHelmetInput);
    expect(res.helmetCompliant).toBe(false);
    expect(res.helmetScore).toBe(0);
    expect(res.potentialViolations.some((v) => v.code === 'VIO-HLM')).toBe(true);
    expect(res.overallRoadLegal).toBe(false);
  });

  it('detects courier specific violations: box overhang > 0.5m, missing reflective vest, and unbracketed box', () => {
    const unsafeCourierInput: MopedSpecInput = {
      ...baseInput,
      courierPlatform: 'bolt_food',
      hasReflectiveVest: false,
      hasDeliveryBoxBracket: false,
      deliveryBoxOverhangMeters: 0.65,
    };
    const res = evaluateMopedCompliance(unsafeCourierInput);
    expect(res.courierSafetyCompliant).toBe(false);
    expect(res.potentialViolations.some((v) => v.code === 'VIO-VEST')).toBe(true);
    expect(res.potentialViolations.some((v) => v.code === 'VIO-BOX')).toBe(true);
    expect(res.potentialViolations.some((v) => v.code === 'VIO-BRKT')).toBe(true);
    expect(res.totalFineRiskAzn).toBeGreaterThanOrEqual(130);
  });

  it('flags passenger carrying without helmet violation', () => {
    const passengerInput: MopedSpecInput = {
      ...baseInput,
      isPassengerPresent: true,
      passengerHasHelmet: false,
    };
    const res = evaluateMopedCompliance(passengerInput);
    expect(res.potentialViolations.some((v) => v.code === 'VIO-PSG-HLM')).toBe(true);
    expect(res.overallRoadLegal).toBe(false);
  });

  it('calculates statutory state duties correctly with currency conversions', () => {
    const resAzn = evaluateMopedCompliance({ ...baseInput, selectedCurrency: 'AZN' });
    expect(resAzn.totalStateDutiesAzn).toBe(
      STATUTORY_FEES.PLATE_FEE_AZN +
        STATUTORY_FEES.TEXPASPORT_FEE_AZN +
        STATUTORY_FEES.INSPECTION_FEE_AZN
    );
    expect(resAzn.totalDutiesConverted).toBe(90);

    const resUsd = evaluateMopedCompliance({ ...baseInput, selectedCurrency: 'USD' });
    expect(resUsd.totalDutiesConverted).toBeCloseTo(90 / 1.7, 1);
  });

  it('formats Azerbaijan moped plates accurately', () => {
    const plate = formatAzerbaijanMopedPlate('99-A-102');
    expect(plate.region).toBe('99');
    expect(plate.series).toBe('A');
    expect(plate.digits).toBe('102');

    const defaultPlate = formatAzerbaijanMopedPlate('invalid');
    expect(defaultPlate.region).toBe('99');
  });

  it('generates a valid moped registration certificate with QR telemetry', () => {
    const cert = generateMopedRegistrationCertificate({
      plateNumber: '10-AA-519',
      ownerFin: '1TQ993X',
      brandModel: 'Yadea G5',
    });
    expect(cert.plateNumber).toBe('10-AA-519');
    expect(cert.ownerFin).toBe('1TQ993X');
    expect(cert.registrationCertificateNumber).toMatch(/^BDYP-MPD-2026-/);
    expect(cert.qrTelemetry).toContain('10AA519');
    expect(cert.status).toBe('active');
  });
});
