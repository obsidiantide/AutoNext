import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  evaluateSeaStateConditions,
  calculateMaritimeSarMission,
  generateMaritimeCertificateHash,
  issueMaritimeSarCertificate,
  RESCUE_VESSEL_FLEET,
  MARITIME_URGENCY_INFO,
} from '../maritimeSarCompliance';
import {
  MOCK_MARITIME_SAR_STATIONS,
  MOCK_INCIDENT_PRESETS,
  MOCK_MARITIME_CHECKLIST,
  MOCK_MARITIME_EXAM,
  MOCK_VERIFIABLE_MARITIME_CERTIFICATES,
} from '../../data/mockMaritimeSarData';

describe('maritimeSarCompliance utility functions', () => {
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

  it('evaluates calm sea conditions (Beaufort 1-2) with no speed loss', () => {
    const calm = evaluateSeaStateConditions({
      waveHeightMeters: 0.3,
      windSpeedKnots: 5,
      isNightOperation: false,
      visibilityNauticalMiles: 10,
      hasFogOrHeavyRain: false,
      isOffshoreDeepwater: false,
    });

    expect(calm.condition).toBe('CALM_SAFE');
    expect(calm.beaufortScale).toBe(2);
    expect(calm.speedReductionFactorPercent).toBe(0);
    expect(calm.flirThermalRequired).toBe(false);
    expect(calm.isMissionAuthorized).toBe(true);
  });

  it('evaluates moderate sea conditions and applies 10% speed reduction', () => {
    const moderate = evaluateSeaStateConditions({
      waveHeightMeters: 1.0,
      windSpeedKnots: 15,
      isNightOperation: false,
      visibilityNauticalMiles: 8,
      hasFogOrHeavyRain: false,
      isOffshoreDeepwater: false,
    });

    expect(moderate.condition).toBe('MODERATE_OPERATIONAL');
    expect(moderate.beaufortScale).toBe(4);
    expect(moderate.speedReductionFactorPercent).toBe(10);
  });

  it('evaluates rough high seas and enforces FLIR thermal requirement at night', () => {
    const roughNight = evaluateSeaStateConditions({
      waveHeightMeters: 2.2,
      windSpeedKnots: 25,
      isNightOperation: true,
      visibilityNauticalMiles: 4,
      hasFogOrHeavyRain: false,
      isOffshoreDeepwater: true,
    });

    expect(roughNight.condition).toBe('ROUGH_HIGH_SEAS');
    expect(roughNight.beaufortScale).toBe(6);
    expect(roughNight.flirThermalRequired).toBe(true);
    expect(roughNight.speedReductionFactorPercent).toBe(20);
    expect(roughNight.maxRecommendedCraftSpeedKnots).toBe(26);
  });

  it('evaluates storm restricted conditions (Beaufort 8+)', () => {
    const storm = evaluateSeaStateConditions({
      waveHeightMeters: 3.5,
      windSpeedKnots: 38,
      isNightOperation: false,
      visibilityNauticalMiles: 1.5,
      hasFogOrHeavyRain: true,
      isOffshoreDeepwater: true,
    });

    expect(storm.condition).toBe('STORM_RESTRICTED');
    expect(storm.beaufortScale).toBe(8);
    expect(storm.speedReductionFactorPercent).toBe(35);
    expect(storm.flirThermalRequired).toBe(true);
    expect(storm.maxRecommendedCraftSpeedKnots).toBe(18);
  });

  it('calculates mission time and verifies golden hour attainment for high speed cutter', () => {
    const station = MOCK_MARITIME_SAR_STATIONS.find((s) => s.id === 'SAR_BAKU_BAY')!;
    const vessel = RESCUE_VESSEL_FLEET.SAR_INTERCEPTOR_1606; // 38 kts cruise
    const seaState = evaluateSeaStateConditions({
      waveHeightMeters: 0.8,
      windSpeedKnots: 12,
      isNightOperation: false,
      visibilityNauticalMiles: 8,
      hasFogOrHeavyRain: false,
      isOffshoreDeepwater: false,
    });

    const mission = calculateMaritimeSarMission({
      station,
      vessel,
      urgencyCode: 'CODE_RED_MOB',
      distanceNm: 10,
      seaStateResult: seaState,
    });

    expect(mission.distanceKm).toBeCloseTo(18.5, 0);
    expect(mission.effectiveSpeedKnots).toBeGreaterThan(25);
    expect(mission.totalMissionTimeMinutes).toBeLessThan(60);
    expect(mission.isGoldenHourMet).toBe(true);
    expect(mission.fuelRequiredLiters).toBeGreaterThan(0);
    expect(mission.stateSubsidyAmountAzn).toBe(mission.subtotalAzn); // 100% subsidy for life saving
    expect(mission.payableTotalAzn).toBe(0);
  });

  it('applies partial state subsidy (50%) for vessel towing (salvage)', () => {
    const station = MOCK_MARITIME_SAR_STATIONS.find((s) => s.id === 'SAR_ALAT_PORT')!;
    const vessel = RESCUE_VESSEL_FLEET.CASPIAN_FIRE_TUG_60;
    const seaState = evaluateSeaStateConditions({
      waveHeightMeters: 1.2,
      windSpeedKnots: 15,
      isNightOperation: false,
      visibilityNauticalMiles: 6,
      hasFogOrHeavyRain: false,
      isOffshoreDeepwater: false,
    });

    const mission = calculateMaritimeSarMission({
      station,
      vessel,
      urgencyCode: 'CODE_YELLOW_TOWING',
      distanceNm: 15,
      seaStateResult: seaState,
      requiresSpecialDivers: true,
    });

    expect(mission.stateSubsidyAmountAzn).toBeGreaterThan(0);
    expect(mission.payableTotalAzn).toBeGreaterThan(0);
    expect(mission.payableTotalAzn).toBe(mission.subtotalAzn - mission.stateSubsidyAmountAzn);
  });

  it('generates cryptographic certificate hash and issues valid maritime clearance certificate', () => {
    const station = MOCK_MARITIME_SAR_STATIONS[0];
    const vessel = RESCUE_VESSEL_FLEET.DAMEN_PILOT_2205;
    const seaState = evaluateSeaStateConditions({
      waveHeightMeters: 1.0,
      windSpeedKnots: 14,
      isNightOperation: false,
      visibilityNauticalMiles: 8,
      hasFogOrHeavyRain: false,
      isOffshoreDeepwater: false,
    });
    const calc = calculateMaritimeSarMission({
      station,
      vessel,
      urgencyCode: 'CODE_ORANGE_MEDEVAC',
      distanceNm: 20,
      seaStateResult: seaState,
    });

    const cert = issueMaritimeSarCertificate({
      station,
      vessel,
      urgencyCode: 'CODE_ORANGE_MEDEVAC',
      calcResult: calc,
      seaStateResult: seaState,
      incidentNotes: 'Neft platforması təcili təxliyə',
    });

    expect(cert.certificateNumber).toMatch(/^SAR-CASPIAN-AZ-2026-\d{5}$/);
    expect(cert.callsign).toMatch(/^RESCUE-CASPIAN-\d{2}$/);
    expect(cert.cryptographicSha256.length).toBe(32);
    expect(cert.simaDigitalUid).toMatch(/^SIMA-SAR-\d{8}$/);
    expect(cert.stationNameAz).toBe(station.nameAz);
    expect(cert.vesselModel).toBe(vessel.modelName);
  });

  it('validates mock data integrity across all datasets', () => {
    expect(MOCK_MARITIME_SAR_STATIONS.length).toBe(7);
    expect(Object.keys(RESCUE_VESSEL_FLEET).length).toBe(4);
    expect(Object.keys(MARITIME_URGENCY_INFO).length).toBe(4);
    expect(MOCK_INCIDENT_PRESETS.length).toBe(6);
    expect(MOCK_MARITIME_CHECKLIST.length).toBe(10);
    expect(MOCK_MARITIME_EXAM.length).toBe(10);
    expect(MOCK_VERIFIABLE_MARITIME_CERTIFICATES.length).toBe(5);

    MOCK_MARITIME_EXAM.forEach((q) => {
      expect(q.optionsAz.length).toBe(4);
      expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctOptionIndex).toBeLessThan(4);
      expect(q.regulatoryBasis.length).toBeGreaterThan(5);
    });

    MOCK_MARITIME_CHECKLIST.forEach((chk) => {
      expect(chk.isMandatory).toBe(true);
      expect(chk.regulatoryRef.length).toBeGreaterThan(5);
    });
  });
});
