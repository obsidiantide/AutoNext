import { describe, it, expect } from 'vitest';
import {
  calculateV2gExport,
  evaluateGridFrequency,
  evaluateV2gSafetyChecklist,
  gradeV2gExam,
  generateV2gCertificate,
  formatV2gCurrency,
  V2X_MODES_INFO,
  INVERTER_SPECS,
  TIME_OF_USE_TARIFFS,
  V2gChecklistItem,
} from '../v2gCompliance';

describe('V2G Smart Grid & Bidirectional Inverter Engine (v2gCompliance.ts)', () => {
  it('correctly calculates V2G export energy and financial balance for 11 kW inverter', () => {
    const result = calculateV2gExport({
      batteryCapacityKwh: 77.4,
      currentSocPercent: 80,
      minSocReservePercent: 20,
      inverterPowerKw: 11,
      mode: 'V2G',
      tariffPeriod: 'peak', // 0.18 AZN/kWh credit
      currency: 'AZN',
      substationFeedInMultiplier: 1.0,
    });

    // 80 - 20 = 60% usable SoC => 77.4 * 0.6 = 46.44 kWh
    expect(result.exportableEnergyKwh).toBe(46.44);
    // Net delivered = 46.44 * 0.94 (efficiency) = 43.65 kWh
    expect(result.netDeliveredEnergyKwh).toBe(43.65);
    // Export duration = 46.44 / 11 = 4.22 hours
    expect(result.exportDurationHours).toBe(4.22);
    // Gross credit = 43.65 * 0.18 = 7.86 AZN
    expect(result.grossCreditAzn).toBe(7.86);
    // Degradation cost = 46.44 * 0.022 = 1.02 AZN
    expect(result.batteryDegradationCostAzn).toBe(1.02);
    // Net earnings = 7.86 - 1.02 = 6.84 AZN
    expect(result.netEarningsAzn).toBe(6.84);
    expect(result.peakShavingPowerKw).toBe(11);
    expect(result.avoidedCo2Kg).toBeGreaterThan(20);
    expect(result.antiIslandingSafe).toBe(true);
    expect(result.frequencyWithinLimits).toBe(true);
  });

  it('handles regional substation feed-in incentive multiplier', () => {
    const resultStandard = calculateV2gExport({
      batteryCapacityKwh: 100,
      currentSocPercent: 90,
      minSocReservePercent: 20,
      inverterPowerKw: 22,
      mode: 'V2G',
      tariffPeriod: 'peak',
      currency: 'AZN',
      substationFeedInMultiplier: 1.0,
    });

    const resultIncentive = calculateV2gExport({
      batteryCapacityKwh: 100,
      currentSocPercent: 90,
      minSocReservePercent: 20,
      inverterPowerKw: 22,
      mode: 'V2G',
      tariffPeriod: 'peak',
      currency: 'AZN',
      substationFeedInMultiplier: 1.25, // 25% premium in White City
    });

    expect(resultIncentive.grossCreditAzn).toBeGreaterThan(resultStandard.grossCreditAzn);
    expect(resultIncentive.netEarningsAzn).toBeGreaterThan(resultStandard.netEarningsAzn);
  });

  it('handles zero or negative usable capacity when current SoC <= reserve limit', () => {
    const result = calculateV2gExport({
      batteryCapacityKwh: 60,
      currentSocPercent: 15,
      minSocReservePercent: 20,
      inverterPowerKw: 7.4,
      mode: 'V2G',
      tariffPeriod: 'shoulder',
      currency: 'AZN',
    });

    expect(result.exportableEnergyKwh).toBe(0);
    expect(result.netDeliveredEnergyKwh).toBe(0);
    expect(result.grossCreditAzn).toBe(0);
    expect(result.netEarningsAzn).toBe(0);
    expect(result.statusTextAz).toContain('çatışmır');
  });

  it('converts calculations accurately to USD and EUR', () => {
    const resultAzn = calculateV2gExport({
      batteryCapacityKwh: 80,
      currentSocPercent: 80,
      minSocReservePercent: 30,
      inverterPowerKw: 11,
      mode: 'V2G',
      tariffPeriod: 'peak',
      currency: 'AZN',
    });

    const resultUsd = calculateV2gExport({
      batteryCapacityKwh: 80,
      currentSocPercent: 80,
      minSocReservePercent: 30,
      inverterPowerKw: 11,
      mode: 'V2G',
      tariffPeriod: 'peak',
      currency: 'USD',
    });

    expect(resultUsd.netEarningsLocal).toBeCloseTo(resultAzn.netEarningsAzn * 0.5882, 1);
  });

  it('diagnoses grid frequency and anti-islanding trip correctly', () => {
    // Normal 50.00 Hz
    const normal = evaluateGridFrequency(50.01);
    expect(normal.isStable).toBe(true);
    expect(normal.antiIslandingTripRequired).toBe(false);
    expect(normal.requiresCurtailment).toBe(false);

    // Over-frequency droop warning (50.30 Hz)
    const droop = evaluateGridFrequency(50.30);
    expect(droop.isStable).toBe(false);
    expect(droop.requiresCurtailment).toBe(true);
    expect(droop.antiIslandingTripRequired).toBe(false);

    // Critical low-frequency trip (49.30 Hz)
    const tripLow = evaluateGridFrequency(49.30);
    expect(tripLow.isStable).toBe(false);
    expect(tripLow.antiIslandingTripRequired).toBe(true);

    // Critical high-frequency trip (50.70 Hz)
    const tripHigh = evaluateGridFrequency(50.70);
    expect(tripHigh.isStable).toBe(false);
    expect(tripHigh.antiIslandingTripRequired).toBe(true);
  });

  it('evaluates 10-point technical checklist and checks mandatory items', () => {
    const mockItems: V2gChecklistItem[] = [
      {
        id: '1',
        category: 'Electrical',
        titleAz: 'RCD Type B',
        titleEn: 'RCD Type B',
        descriptionAz: 'RCD test',
        standardReference: 'IEC 62423',
        isMandatory: true,
        passed: true,
      },
      {
        id: '2',
        category: 'GridSafety',
        titleAz: 'Anti-Islanding',
        titleEn: 'Anti-Islanding',
        descriptionAz: 'Test trip',
        standardReference: 'IEEE 1547',
        isMandatory: true,
        passed: true,
      },
      {
        id: '3',
        category: 'BMS',
        titleAz: 'Optional item',
        titleEn: 'Optional item',
        descriptionAz: 'Optional test',
        standardReference: 'ISO 6469',
        isMandatory: false,
        passed: false,
      },
    ];

    const evalResult = evaluateV2gSafetyChecklist(mockItems);
    expect(evalResult.totalItems).toBe(3);
    expect(evalResult.passedItems).toBe(2);
    expect(evalResult.allMandatoryPassed).toBe(true);
    expect(evalResult.scorePercentage).toBe(67);
    // Score < 80% so not eligible
    expect(evalResult.isEligibleForExport).toBe(false);

    // When mandatory fails:
    mockItems[0].passed = false;
    const failedMandatory = evaluateV2gSafetyChecklist(mockItems);
    expect(failedMandatory.allMandatoryPassed).toBe(false);
    expect(failedMandatory.isEligibleForExport).toBe(false);
  });

  it('grades theoretical exam and validates pass threshold', () => {
    const correctKeys: Record<number, number> = {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 1,
      7: 1,
      8: 1,
      9: 0,
      10: 0,
    };

    // 9 out of 10 correct
    const answersPassed: Record<number, number> = {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 1,
      7: 1,
      8: 1,
      9: 0,
      10: 3, // wrong
    };

    const gradePassed = gradeV2gExam(answersPassed, correctKeys);
    expect(gradePassed.correctAnswers).toBe(9);
    expect(gradePassed.scorePercentage).toBe(90);
    expect(gradePassed.passed).toBe(true);

    // 5 out of 10 correct (fail)
    const answersFailed: Record<number, number> = {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 0,
      7: 0,
      8: 0,
      9: 1,
      10: 1,
    };

    const gradeFailed = gradeV2gExam(answersFailed, correctKeys);
    expect(gradeFailed.correctAnswers).toBe(5);
    expect(gradeFailed.scorePercentage).toBe(50);
    expect(gradeFailed.passed).toBe(false);
  });

  it('generates authentic V2G certificates with valid format and checksums', () => {
    const cert = generateV2gCertificate({
      licensePlate: '10-VG-505',
      ownerFullName: 'Rəşad Əliyev',
      finCode: '5K8M2P1',
      substationId: 'sub-whitecity',
      substationNameAz: '110/35/10 kV "Ağ Şəhər-1"',
      smartMeterCode: 'AZS-SM-782194',
      inverterModel: 'ABB Terra 11kW',
      inverterPowerKw: 11,
      mode: 'V2G',
      batteryCapacityKwh: 77.4,
      maxExportLimitKw: 11,
      issueDate: '2026-10-27',
      expiryDate: '2027-10-27',
      status: 'ACTIVE',
    });

    expect(cert.certificateNumber).toMatch(/^V2G-AZ-2026-\d{5}$/);
    expect(cert.securityChecksum.length).toBe(8);
    expect(cert.simaDigitalUid).toContain('SIMA-ENERG-AZ-');
    expect(cert.licensePlate).toBe('10-VG-505');
  });

  it('formats currency with symbol appropriately', () => {
    expect(formatV2gCurrency(100, 'AZN')).toBe('100.00 ₼');
    expect(formatV2gCurrency(100, 'USD')).toBe('$58.82');
    expect(formatV2gCurrency(100, 'EUR')).toBe('€54.35');
  });

  it('validates V2X mode metadata and inverter specs completeness', () => {
    expect(V2X_MODES_INFO.V2G.gridInteractive).toBe(true);
    expect(V2X_MODES_INFO.V2H.gridInteractive).toBe(false);
    expect(V2X_MODES_INFO.V2L.gridInteractive).toBe(false);

    expect(INVERTER_SPECS[7.4].efficiencyPercent).toBeGreaterThan(90);
    expect(INVERTER_SPECS[11].efficiencyPercent).toBeGreaterThan(93);
    expect(INVERTER_SPECS[22].efficiencyPercent).toBeGreaterThan(94);
    expect(INVERTER_SPECS[50].efficiencyPercent).toBeGreaterThan(95);

    expect(TIME_OF_USE_TARIFFS.peak.exportCreditAznPerKwh).toBeGreaterThan(
      TIME_OF_USE_TARIFFS.off_peak.exportCreditAznPerKwh
    );
  });
});
