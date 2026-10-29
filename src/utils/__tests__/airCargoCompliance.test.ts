import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  calculateChargeableWeight,
  calculateAirCargoTariff,
  evaluateCargoSecurityScreening,
  generateAirCargoHash,
  issueAirCargoVoucher,
} from '../airCargoCompliance';
import { MOCK_AVIATION_CARGO_HUBS } from '../../data/mockAirCargoData';

describe('airCargoCompliance utility functions', () => {
  it('converts AZN to USD and EUR correctly', () => {
    expect(convertAzn(100, 'AZN')).toBe(100);
    expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 1);
    expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 1);
  });

  it('formats currency correctly with symbols', () => {
    expect(formatCurrency(1250, 'AZN')).toContain('₼');
    expect(formatCurrency(1250, 'USD')).toContain('$');
    expect(formatCurrency(1250, 'EUR')).toContain('€');
  });

  it('calculates chargeable weight correctly using IATA standard volumetric formula', () => {
    // 318 × 244 × 163 cm / 6000 = ~2107.8 kg
    const res1 = calculateChargeableWeight(4200, 318, 244, 163, 1);
    expect(res1.volumetricWeightKg).toBeCloseTo(2107.8, 0);
    expect(res1.chargeableWeightKg).toBe(4200); // Gross weight is higher

    // Small actual gross weight but large volume
    const res2 = calculateChargeableWeight(500, 318, 244, 163, 1);
    expect(res2.chargeableWeightKg).toBeGreaterThan(2000); // Volumetric weight takes precedence
    expect(res2.volumeM3).toBeGreaterThan(12);
  });

  it('calculates full air cargo and RFS tariff breakdown with 0% export VAT', () => {
    const tariff = calculateAirCargoTariff({
      originHubId: 'HUB_GYD',
      destinationAirportCode: 'FRA / EDDF',
      cargoClass: 'PERISHABLE_COLD_CHAIN',
      uldType: 'RAP_COOL_ULD',
      actualGrossWeightKg: 4200,
      lengthCm: 318,
      widthCm: 244,
      heightCm: 163,
      piecesCount: 1,
      rfsDistanceKm: 45,
      isKnownConsignor: true,
      isExportTransit: true, // 0% VAT
      isPriorityAog: false,
    });

    expect(tariff.chargeableWeightKg).toBe(4200);
    expect(tariff.airFreightCostAzn).toBe(4200 * 3.80);
    expect(tariff.vatRatePercent).toBe(0);
    expect(tariff.vatAmountAzn).toBe(0);
    expect(tariff.securityScreeningCostAzn).toBeGreaterThanOrEqual(25);
    expect(tariff.terminalHandlingCostAzn).toBeGreaterThanOrEqual(40);
    expect(tariff.totalCostAzn).toBe(tariff.subtotalAzn);
    expect(tariff.totalCostUsd).toBeGreaterThan(0);
    expect(tariff.totalCostEur).toBeGreaterThan(0);
  });

  it('applies 18% domestic VAT and AOG priority surcharge when configured', () => {
    const tariff = calculateAirCargoTariff({
      originHubId: 'HUB_GYD',
      destinationAirportCode: 'KVD',
      cargoClass: 'EXPRESS_COURIER_AOG',
      uldType: 'PMC_PALLET',
      actualGrossWeightKg: 1000,
      lengthCm: 200,
      widthCm: 150,
      heightCm: 120,
      piecesCount: 1,
      rfsDistanceKm: 0,
      isKnownConsignor: true,
      isExportTransit: false, // 18% domestic VAT
      isPriorityAog: true, // +120 AZN surcharge
    });

    expect(tariff.vatRatePercent).toBe(18);
    expect(tariff.vatAmountAzn).toBeGreaterThan(0);
    expect(tariff.priorityAogSurchargeAzn).toBe(120);
    expect(tariff.totalCostAzn).toBe(tariff.subtotalAzn + tariff.vatAmountAzn);
  });

  it('evaluates cargo security screening correctly under ICAO Annex 17', () => {
    // All compliant
    const cleared = evaluateCargoSecurityScreening({
      xrayDensityPassed: true,
      etdTraceDetected: false,
      k9CanineCleared: true,
      lithiumBatteryCompliant: true,
      knownConsignorValid: true,
      tamperSealIntact: true,
    });
    expect(cleared.isAirsideCleared).toBe(true);
    expect(cleared.securityRiskLevel).toBe('LOW_CLEARED');

    // ETD Trace detected -> immediate HIGH_REJECTED
    const rejected = evaluateCargoSecurityScreening({
      xrayDensityPassed: true,
      etdTraceDetected: true,
      k9CanineCleared: true,
      lithiumBatteryCompliant: true,
      knownConsignorValid: true,
      tamperSealIntact: true,
    });
    expect(rejected.isAirsideCleared).toBe(false);
    expect(rejected.securityRiskLevel).toBe('HIGH_REJECTED');

    // Lithium battery non-compliant -> MEDIUM_ENHANCED_SEARCH
    const medium = evaluateCargoSecurityScreening({
      xrayDensityPassed: true,
      etdTraceDetected: false,
      k9CanineCleared: true,
      lithiumBatteryCompliant: false,
      knownConsignorValid: true,
      tamperSealIntact: true,
    });
    expect(medium.isAirsideCleared).toBe(false);
    expect(medium.securityRiskLevel).toBe('MEDIUM_ENHANCED_SEARCH');
  });

  it('generates cryptographic verification hash', () => {
    const hash = generateAirCargoHash('AIR-CARGO-AZ-2026-10101|463-1234 5678');
    expect(hash).toContain('AZ-ICAO-AIR-');
  });

  it('issues a valid electronic flight transit voucher', () => {
    const voucher = issueAirCargoVoucher({
      originHubId: 'HUB_GYD',
      destinationAirportCode: 'FRA / EDDF',
      flightNumber: '7L 774',
      freighterType: 'B777F',
      cargoClass: 'PERISHABLE_COLD_CHAIN',
      uldType: 'RAP_COOL_ULD',
      actualGrossWeightKg: 4200,
      lengthCm: 318,
      widthCm: 244,
      heightCm: 163,
      rfsTruckPlate: '99-AC-101',
      carrierEnterprise: 'Silk Way West Airlines QSC',
      shipperName: 'AzərPharma Biosintez QSC',
      consigneeName: 'BioNTech SE Healthcare Logistics Mainz',
    });

    expect(voucher.voucherId).toContain('AIR-CARGO-AZ-2026-');
    expect(voucher.awbNumber).toMatch(/^463-\d{4} \d{4}$/);
    expect(voucher.securityChecksumSha256).toContain('AZ-ICAO-AIR-');
    expect(voucher.simaDigitalSignatureUid).toContain('SIMA-AIR-2026-');
    expect(voucher.chargeableWeightKg).toBe(4200);
    expect(voucher.totalCostAzn).toBeGreaterThan(0);
    expect(voucher.isAirsideCleared).toBe(true);
  });

  it('contains 6 strategic aviation cargo hubs in mock data', () => {
    expect(MOCK_AVIATION_CARGO_HUBS.length).toBe(6);
    const gyd = MOCK_AVIATION_CARGO_HUBS.find((h) => h.id === 'HUB_GYD');
    expect(gyd).toBeDefined();
    expect(gyd?.iataCode).toBe('GYD');
    expect(gyd?.hasPharmaColdChainFacility).toBe(true);
    expect(gyd?.hasDualEnergyGantryScanner).toBe(true);
  });
});
