import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  calculateDistanceKm,
  evaluateHemsWeatherConditions,
  calculateHemsMission,
  generateHemsCertificateHash,
  issueHemsFlightCertificate,
  HELICOPTER_FLEET_INFO,
  MEDEVAC_URGENCY_INFO,
} from '../hemsAviationCompliance';
import {
  MOCK_MEDICAL_HELIPADS,
  MOCK_HELICOPTER_FLEET,
  MOCK_HEMS_CHECKLIST,
  MOCK_HEMS_EXAM_QUESTIONS,
  MOCK_HEMS_REGISTRY,
} from '../../data/mockHemsAviationData';

describe('hemsAviationCompliance utility functions', () => {
  it('converts AZN to USD and EUR accurately', () => {
    expect(convertAzn(100, 'AZN')).toBe(100);
    expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 1);
    expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 1);
  });

  it('formats currency with appropriate symbols', () => {
    expect(formatCurrency(1500, 'AZN')).toContain('₼');
    expect(formatCurrency(1500, 'USD')).toContain('$');
    expect(formatCurrency(1500, 'EUR')).toContain('€');
  });

  it('calculates geographic distance using haversine formula correctly', () => {
    // Baku Yeni Klinika to Shusha City Hospital
    const yeniKlinika = MOCK_MEDICAL_HELIPADS.find((h) => h.id === 'HELI_YENI_KLINIKA')!;
    const shusha = MOCK_MEDICAL_HELIPADS.find((h) => h.id === 'HELI_SHUSHA_CITY')!;

    const dist = calculateDistanceKm(
      yeniKlinika.latitude,
      yeniKlinika.longitude,
      shusha.latitude,
      shusha.longitude
    );

    expect(dist).toBeGreaterThan(250);
    expect(dist).toBeLessThan(350);

    // Distance to self is 0
    const zeroDist = calculateDistanceKm(
      yeniKlinika.latitude,
      yeniKlinika.longitude,
      yeniKlinika.latitude,
      yeniKlinika.longitude
    );
    expect(zeroDist).toBe(0);
  });

  it('evaluates flight weather conditions under VFR Day rules correctly', () => {
    const clearWeather = evaluateHemsWeatherConditions({
      cloudCeilingFeet: 2500,
      flightVisibilityMeters: 8000,
      windSpeedKnots: 15,
      isNightOperation: false,
      isMountainRoute: false,
      hasModerateOrSevereIcing: false,
      hasThunderstormOnRoute: false,
    });

    expect(clearWeather.condition).toBe('CLEARED_VFR_DAY');
    expect(clearWeather.isFlightPermitted).toBe(true);
    expect(clearWeather.nightVisionGogglesRequired).toBe(false);
    expect(clearWeather.windLimitPassed).toBe(true);
  });

  it('evaluates nighttime weather and enforces NVG requirement', () => {
    const nightWeather = evaluateHemsWeatherConditions({
      cloudCeilingFeet: 1800,
      flightVisibilityMeters: 4500,
      windSpeedKnots: 18,
      isNightOperation: true,
      isMountainRoute: false,
      hasModerateOrSevereIcing: false,
      hasThunderstormOnRoute: false,
    });

    expect(nightWeather.condition).toBe('CLEARED_NVG_NIGHT');
    expect(nightWeather.isFlightPermitted).toBe(true);
    expect(nightWeather.nightVisionGogglesRequired).toBe(true);
  });

  it('grounds helicopter when thunderstorm, severe icing or high wind occurs', () => {
    const thunderstorm = evaluateHemsWeatherConditions({
      cloudCeilingFeet: 2000,
      flightVisibilityMeters: 5000,
      windSpeedKnots: 20,
      isNightOperation: false,
      isMountainRoute: false,
      hasModerateOrSevereIcing: false,
      hasThunderstormOnRoute: true,
    });
    expect(thunderstorm.condition).toBe('GROUNDED_BELOW_MINIMA');
    expect(thunderstorm.isFlightPermitted).toBe(false);

    const highWind = evaluateHemsWeatherConditions({
      cloudCeilingFeet: 2000,
      flightVisibilityMeters: 5000,
      windSpeedKnots: 52, // > 45 knots
      isNightOperation: false,
      isMountainRoute: false,
      hasModerateOrSevereIcing: false,
      hasThunderstormOnRoute: false,
    });
    expect(highWind.condition).toBe('GROUNDED_BELOW_MINIMA');
    expect(highWind.isFlightPermitted).toBe(false);
    expect(highWind.windLimitPassed).toBe(false);

    const severeIcing = evaluateHemsWeatherConditions({
      cloudCeilingFeet: 2000,
      flightVisibilityMeters: 5000,
      windSpeedKnots: 20,
      isNightOperation: false,
      isMountainRoute: false,
      hasModerateOrSevereIcing: true,
      hasThunderstormOnRoute: false,
    });
    expect(severeIcing.isFlightPermitted).toBe(false);
    expect(severeIcing.icingRiskLevel).toBe('CRITICAL_NO_GO');
  });

  it('calculates HEMS mission parameters, response time and 100% state subsidy for Code Red', () => {
    const mission = calculateHemsMission(
      {
        departureHelipadId: 'HELI_SHUSHA_CITY',
        destinationHelipadId: 'HELI_YENI_KLINIKA',
        helicopterModelId: 'H145_BK117_D3',
        urgencyCode: 'CODE_RED_CRITICAL',
        patientCount: 1,
        isNightOperation: false,
        requiresHoistWinch: false,
        applyStateSubsidy: true,
      },
      MOCK_MEDICAL_HELIPADS
    );

    expect(mission.distanceKm).toBeGreaterThan(250);
    expect(mission.cruiseSpeedKmH).toBe(245);
    expect(mission.flightTimeMinutes).toBeGreaterThan(0);
    expect(mission.scrambleTimeMinutes).toBe(10); // Code Red daytime scramble is 10m
    expect(mission.fuelRequiredLiters).toBeGreaterThan(100);
    expect(mission.flightBaseCostAzn).toBeGreaterThan(1000);
    expect(mission.urgencySurchargeAzn).toBe(450);
    expect(mission.subtotalAzn).toBeGreaterThan(1500);

    // Code Red has 100% state subsidy
    expect(mission.stateSubsidyAmountAzn).toBe(mission.subtotalAzn);
    expect(mission.payableTotalAzn).toBe(0);
    expect(mission.payableTotalUsd).toBe(0);
  });

  it('applies partial state subsidy (85%) for Code Yellow and calculates remaining payable amount', () => {
    const mission = calculateHemsMission(
      {
        departureHelipadId: 'HELI_GANJA_REGIONAL',
        destinationHelipadId: 'HELI_RES_CLINICAL',
        helicopterModelId: 'H135_T3',
        urgencyCode: 'CODE_YELLOW_URGENT',
        patientCount: 1,
        isNightOperation: true,
        requiresHoistWinch: true,
        applyStateSubsidy: true,
      },
      MOCK_MEDICAL_HELIPADS
    );

    expect(mission.scrambleTimeMinutes).toBe(20); // Night operation
    expect(mission.hoistWinchFeeAzn).toBe(350);
    expect(mission.urgencySurchargeAzn).toBe(280);
    expect(mission.stateSubsidyAmountAzn).toBe(Math.round((mission.subtotalAzn * 85) / 100));
    expect(mission.payableTotalAzn).toBe(mission.subtotalAzn - mission.stateSubsidyAmountAzn);
    expect(mission.payableTotalAzn).toBeGreaterThan(0);
  });

  it('generates cryptographic hash and issues valid flight clearance certificate', () => {
    const dep = MOCK_MEDICAL_HELIPADS[0];
    const dest = MOCK_MEDICAL_HELIPADS[3];
    const copter = HELICOPTER_FLEET_INFO['H145_BK117_D3'];
    const urgency = 'CODE_RED_CRITICAL';

    const calc = calculateHemsMission(
      {
        departureHelipadId: dep.id,
        destinationHelipadId: dest.id,
        helicopterModelId: 'H145_BK117_D3',
        urgencyCode: urgency,
        patientCount: 1,
        isNightOperation: false,
        requiresHoistWinch: false,
        applyStateSubsidy: true,
      },
      MOCK_MEDICAL_HELIPADS
    );

    const weather = evaluateHemsWeatherConditions({
      cloudCeilingFeet: 2500,
      flightVisibilityMeters: 7000,
      windSpeedKnots: 12,
      isNightOperation: false,
      isMountainRoute: true,
      hasModerateOrSevereIcing: false,
      hasThunderstormOnRoute: false,
    });

    const cert = issueHemsFlightCertificate({
      departureHelipad: dep,
      destinationHelipad: dest,
      helicopter: copter,
      urgencyCode: urgency,
      calcResult: calc,
      weatherResult: weather,
      patientNotes: 'Politravma hadisə yerindən təcili paytaxt hospitalına',
    });

    expect(cert.certificateNumber).toMatch(/^HEMS-AZ-2026-\d{5}$/);
    expect(cert.callsign).toMatch(/^MEDEVAC-\d{2}$/);
    expect(cert.departureHelipadIcao).toBe(dep.icaoDesignator);
    expect(cert.destinationHelipadIcao).toBe(dest.icaoDesignator);
    expect(cert.cryptographicSha256.length).toBe(32);
    expect(cert.simaDigitalUid).toContain('SIMA-HEMS-');
    expect(cert.qrVerificationUrl).toContain('https://hems.gov.az/verify?cert=');
  });

  it('verifies integrity of mock database arrays', () => {
    expect(MOCK_MEDICAL_HELIPADS.length).toBe(8);
    expect(MOCK_HELICOPTER_FLEET.length).toBe(4);
    expect(MOCK_HEMS_CHECKLIST.length).toBe(10);
    expect(MOCK_HEMS_EXAM_QUESTIONS.length).toBe(10);
    expect(MOCK_HEMS_REGISTRY.length).toBeGreaterThanOrEqual(3);

    // Verify all helipads have valid coordinates and designators
    MOCK_MEDICAL_HELIPADS.forEach((h) => {
      expect(h.icaoDesignator.length).toBe(4);
      expect(h.latitude).toBeGreaterThan(38);
      expect(h.latitude).toBeLessThan(42);
      expect(h.longitude).toBeGreaterThan(44);
      expect(h.longitude).toBeLessThan(51);
    });

    // Verify checklist items have mandatory flag and regulatory basis
    MOCK_HEMS_CHECKLIST.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.regulatoryRef.length).toBeGreaterThan(5);
    });

    // Verify exam questions have valid correctOptionIndex
    MOCK_HEMS_EXAM_QUESTIONS.forEach((q) => {
      expect(q.optionsAz.length).toBe(4);
      expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctOptionIndex).toBeLessThan(4);
    });
  });
});
