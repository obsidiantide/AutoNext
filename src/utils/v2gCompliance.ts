/**
 * Official Ministry of Energy (Energetika Nazirliyi), "Azərişıq" ASC & BDYP
 * Smart Grid Electric Vehicle (EV) V2G (Vehicle-to-Grid) Bidirectional Inverter,
 * Peak-Shaving Dynamic Tariff & Official V2G-AZ-2026 Energy Export Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On the Use of Renewable Energy Sources in Electricity Production"
 *   ("Elektrik enerjisi istehsalında bərpa olunan enerji mənbələrindən istifadə haqqında" AR Qanunu)
 * - Law of the Republic of Azerbaijan "On Electric Power" ("Elektroenergetika haqqında" AR Qanunu)
 * - Cabinet of Ministers Resolution on Active Consumers (Aktiv İstehlakçıların Dəstəklənməsi Mexanizmi)
 * - State Tariff Council (Tarif Şurası) Dynamic Time-of-Use & Net-Billing Regulations
 * - ISO 15118-20 Road Vehicles — Vehicle to grid communication interface — Part 20: 2nd generation
 * - IEEE 1547-2018 Interconnection and Interoperability of Distributed Energy Resources
 * - IEC 61851-23 / CHAdeMO 3.0 / CCS Combo 2 / GB/T 27930 Bidirectional Power Transfer (BPT)
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD (1.70 AZN / USD)
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR (1.84 AZN / EUR)
};

/**
 * V2X Operational Modes
 */
export type V2xMode = 'V2G' | 'V2H' | 'V2L';

export interface V2xModeMetadata {
  id: V2xMode;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  descriptionAz: string;
  descriptionEn: string;
  nominalVoltageV: number;
  gridInteractive: boolean;
}

export const V2X_MODES_INFO: Record<V2xMode, V2xModeMetadata> = {
  V2G: {
    id: 'V2G',
    code: 'V2G-GRID',
    nameAz: 'V2G (Vehicle-to-Grid): Şəbəkəyə İkitərəfli Enerji İxracı',
    nameEn: 'V2G (Vehicle-to-Grid): Bidirectional Utility Grid Export',
    nameRu: 'V2G (Vehicle-to-Grid): Двунаправленный экспорт в общую сеть',
    descriptionAz: 'Pik saatlarda elektrik şəbəkəsinə balanslaşdırıcı enerji satışı və kompensasiya krediti əldə edilməsi.',
    descriptionEn: 'Exporting stored battery energy to the Azərişıq utility grid during peak demand to earn net-billing credits.',
    nominalVoltageV: 400,
    gridInteractive: true,
  },
  V2H: {
    id: 'V2H',
    code: 'V2H-HOME',
    nameAz: 'V2H (Vehicle-to-Home): Ev Təsərrüfatı Ehtiyat Qidası',
    nameEn: 'V2H (Vehicle-to-Home): Residential Backup & Self-Consumption',
    nameRu: 'V2H (Vehicle-to-Home): Резервное питание жилого дома',
    descriptionAz: 'Şəbəkədən asılılığı azaltmaq üçün yaşayış evinin avtonom qidalandırılması və pik kəsilmələrdən mühafizə.',
    descriptionEn: 'Powering a home or building from vehicle battery to reduce evening electricity bills or survive blackouts.',
    nominalVoltageV: 230,
    gridInteractive: false,
  },
  V2L: {
    id: 'V2L',
    code: 'V2L-LOAD',
    nameAz: 'V2L (Vehicle-to-Load): Xarici Cihaz və Avadanlıqların Qidası',
    nameEn: 'V2L (Vehicle-to-Load): Off-Grid Appliance Power Supply',
    nameRu: 'V2L (Vehicle-to-Load): Питание внешних приборов и инструментов',
    descriptionAz: '230V 16A rozetka vasitəsilə düşərgə, tikinti alətləri və ya digər elektromobilin təcili doldurulması.',
    descriptionEn: 'Supplying 230V AC up to 3.6 kW directly to external appliances, camping gear, or stranded EVs.',
    nominalVoltageV: 230,
    gridInteractive: false,
  },
};

/**
 * Bidirectional Inverter Hardware Categories
 */
export type InverterPowerRating = 7.4 | 11 | 22 | 50;

export interface InverterSpecification {
  powerRatingKw: InverterPowerRating;
  phaseType: 'Single-Phase AC' | 'Three-Phase AC' | 'DC Fast Bidirectional';
  nominalCurrentAmps: number;
  efficiencyPercent: number;
  protocolStandard: string;
  nameAz: string;
  nameEn: string;
}

export const INVERTER_SPECS: Record<InverterPowerRating, InverterSpecification> = {
  7.4: {
    powerRatingKw: 7.4,
    phaseType: 'Single-Phase AC',
    nominalCurrentAmps: 32,
    efficiencyPercent: 91.5,
    protocolStandard: 'ISO 15118-20 / Type 2 AC BPT',
    nameAz: '7.4 kVt Birfazalı AC İkitərəfli İnverter (32A / 230V)',
    nameEn: '7.4 kW Single-Phase AC Bidirectional Inverter (32A / 230V)',
  },
  11: {
    powerRatingKw: 11,
    phaseType: 'Three-Phase AC',
    nominalCurrentAmps: 16,
    efficiencyPercent: 94.0,
    protocolStandard: 'ISO 15118-20 / Type 2 Tri-Phase BPT',
    nameAz: '11 kVt Üçfazalı AC Standart V2G İnverter (16A / 400V)',
    nameEn: '11 kW Three-Phase AC Standard V2G Inverter (16A / 400V)',
  },
  22: {
    powerRatingKw: 22,
    phaseType: 'Three-Phase AC',
    nominalCurrentAmps: 32,
    efficiencyPercent: 95.2,
    protocolStandard: 'ISO 15118-20 / Mennekes BPT High-Power',
    nameAz: '22 kVt Yüksək Güclü Üçfazalı AC İnverter (32A / 400V)',
    nameEn: '22 kW High-Power Three-Phase AC Inverter (32A / 400V)',
  },
  50: {
    powerRatingKw: 50,
    phaseType: 'DC Fast Bidirectional',
    nominalCurrentAmps: 125,
    efficiencyPercent: 96.5,
    protocolStandard: 'CCS Combo 2 / CHAdeMO 3.0 / GB/T 27930 DC V2G',
    nameAz: '50 kVt Sürətli DC Şəbəkə Balanslaşdırıcı İnverter (125A / 400-800V)',
    nameEn: '50 kW Fast DC Grid-Balancing Inverter (125A / 400-800V)',
  },
};

/**
 * Azərişıq & Tarif Şurası Time-of-Use Dynamic Tariff Periods
 */
export type TimeOfUsePeriod = 'off_peak' | 'shoulder' | 'peak' | 'critical_peak';

export interface TariffPeriodInfo {
  id: TimeOfUsePeriod;
  nameAz: string;
  nameEn: string;
  hoursWindowAz: string;
  gridTariffAznPerKwh: number;     // Purchase rate from grid
  exportCreditAznPerKwh: number;   // Export credit paid to active consumer
  gridStressLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  colorCode: string;
}

export const TIME_OF_USE_TARIFFS: Record<TimeOfUsePeriod, TariffPeriodInfo> = {
  off_peak: {
    id: 'off_peak',
    nameAz: 'Gecə Qeyri-Pik Dövrü (00:00 - 07:00)',
    nameEn: 'Night Off-Peak Period (00:00 - 07:00)',
    hoursWindowAz: '00:00 - 07:00 (Gecə akkumulyator doldurulması üçün sərfəli)',
    gridTariffAznPerKwh: 0.05,
    exportCreditAznPerKwh: 0.06,
    gridStressLevel: 'Low',
    colorCode: '#10b981', // green
  },
  shoulder: {
    id: 'shoulder',
    nameAz: 'Gündüz Normal Dövr (07:00 - 17:00 & 22:00 - 24:00)',
    nameEn: 'Daytime Shoulder Period (07:00 - 17:00 & 22:00 - 24:00)',
    hoursWindowAz: '07:00 - 17:00 və 22:00 - 24:00',
    gridTariffAznPerKwh: 0.09,
    exportCreditAznPerKwh: 0.10,
    gridStressLevel: 'Moderate',
    colorCode: '#3b82f6', // blue
  },
  peak: {
    id: 'peak',
    nameAz: 'Axşam Pik Dövrü (17:00 - 22:00)',
    nameEn: 'Evening Peak Demand Period (17:00 - 22:00)',
    hoursWindowAz: '17:00 - 22:00 (Maksimal şəbəkə yüklənməsi və yüksək ixrac tarifi)',
    gridTariffAznPerKwh: 0.15,
    exportCreditAznPerKwh: 0.18,
    gridStressLevel: 'High',
    colorCode: '#f59e0b', // amber
  },
  critical_peak: {
    id: 'critical_peak',
    nameAz: 'Böhran Pik Tələbat Hadisəsi (Tələb Olunduqda)',
    nameEn: 'Critical Peak Demand Event (Grid Stress Emergency)',
    hoursWindowAz: 'Qəza və ya qlobal şəbəkə ehtiyat çağırışı zamanı',
    gridTariffAznPerKwh: 0.22,
    exportCreditAznPerKwh: 0.26,
    gridStressLevel: 'Critical',
    colorCode: '#ef4444', // red
  },
};

/**
 * Grid Emission Factor in Azerbaijan (approx 0.48 kg CO2e / kWh for gas-fired power plants)
 */
export const AZERBAIJAN_GRID_EMISSION_FACTOR_KG_CO2 = 0.48;

/**
 * Battery cell cycle wear / degradation estimate per kWh transferred
 */
export const BATTERY_CELL_DEGRADATION_COST_AZN_PER_KWH = 0.022;

export interface V2gExportParams {
  batteryCapacityKwh: number;
  currentSocPercent: number;
  minSocReservePercent: number; // e.g. 20% reserved for driving
  inverterPowerKw: InverterPowerRating;
  mode: V2xMode;
  tariffPeriod: TimeOfUsePeriod;
  currency: Currency;
  substationFeedInMultiplier?: number; // Regional incentive multiplier (1.0 - 1.25)
}

export interface V2gExportResult {
  exportableEnergyKwh: number;
  netDeliveredEnergyKwh: number;
  exportDurationHours: number;
  grossCreditAzn: number;
  grossCreditLocal: number;
  batteryDegradationCostAzn: number;
  batteryDegradationCostLocal: number;
  netEarningsAzn: number;
  netEarningsLocal: number;
  peakShavingPowerKw: number;
  avoidedCo2Kg: number;
  roundTripEfficiencyPercent: number;
  antiIslandingSafe: boolean;
  frequencyWithinLimits: boolean;
  statusTextAz: string;
  statusTextEn: string;
}

/**
 * Calculate V2G / V2X Energy Export & Financial Balance
 */
export function calculateV2gExport(params: V2gExportParams): V2gExportResult {
  const {
    batteryCapacityKwh,
    currentSocPercent,
    minSocReservePercent,
    inverterPowerKw,
    mode,
    tariffPeriod,
    currency,
    substationFeedInMultiplier = 1.0,
  } = params;

  const rate = CURRENCY_RATES[currency] || 1.0;
  const spec = INVERTER_SPECS[inverterPowerKw] || INVERTER_SPECS[11];
  const tariff = TIME_OF_USE_TARIFFS[tariffPeriod] || TIME_OF_USE_TARIFFS.peak;

  // Usable SoC span
  const usableSocSpan = Math.max(0, currentSocPercent - minSocReservePercent);
  const rawExportKwh = (batteryCapacityKwh * usableSocSpan) / 100;

  // Efficiency adjusted
  const efficiency = spec.efficiencyPercent / 100;
  const netDeliveredEnergyKwh = Number((rawExportKwh * efficiency).toFixed(2));

  // Time duration
  const exportDurationHours = Number((rawExportKwh / spec.powerRatingKw).toFixed(2));

  // Export tariff per kWh with regional multiplier
  const effectiveFeedInRate = mode === 'V2G'
    ? tariff.exportCreditAznPerKwh * substationFeedInMultiplier
    : tariff.gridTariffAznPerKwh; // for V2H/V2L, savings equals avoided purchase price

  const grossCreditAzn = Number((netDeliveredEnergyKwh * effectiveFeedInRate).toFixed(2));
  const batteryDegradationCostAzn = Number((rawExportKwh * BATTERY_CELL_DEGRADATION_COST_AZN_PER_KWH).toFixed(2));
  const netEarningsAzn = Number(Math.max(0, grossCreditAzn - batteryDegradationCostAzn).toFixed(2));

  const grossCreditLocal = Number((grossCreditAzn * rate).toFixed(2));
  const batteryDegradationCostLocal = Number((batteryDegradationCostAzn * rate).toFixed(2));
  const netEarningsLocal = Number((netEarningsAzn * rate).toFixed(2));

  const avoidedCo2Kg = Number((netDeliveredEnergyKwh * AZERBAIJAN_GRID_EMISSION_FACTOR_KG_CO2).toFixed(2));
  const peakShavingPowerKw = mode === 'V2G' ? spec.powerRatingKw : Number((spec.powerRatingKw * 0.75).toFixed(1));

  let statusTextAz = 'Sistem normal iş rejimindədir. Şəbəkəyə ixrac təsdiqlənib.';
  let statusTextEn = 'System operating nominally. Bidirectional power transfer confirmed.';

  if (rawExportKwh <= 0) {
    statusTextAz = 'Akkumulyator ehtiyat limiti çatışmır (Cari SoC ≤ Tələb olunan ehtiyat).';
    statusTextEn = 'Insufficient battery reserve (Current SoC ≤ Min reserve threshold).';
  }

  return {
    exportableEnergyKwh: Number(rawExportKwh.toFixed(2)),
    netDeliveredEnergyKwh,
    exportDurationHours,
    grossCreditAzn,
    grossCreditLocal,
    batteryDegradationCostAzn,
    batteryDegradationCostLocal,
    netEarningsAzn,
    netEarningsLocal,
    peakShavingPowerKw,
    avoidedCo2Kg,
    roundTripEfficiencyPercent: spec.efficiencyPercent,
    antiIslandingSafe: true,
    frequencyWithinLimits: true,
    statusTextAz,
    statusTextEn,
  };
}

/**
 * Grid Frequency & Anti-Islanding Trip Diagnostic (IEEE 1547 / IEC 61851-23)
 */
export interface GridFrequencyDiagnostic {
  measuredFrequencyHz: number;
  nominalFrequencyHz: number;
  frequencyDeviationHz: number;
  isStable: boolean;
  requiresCurtailment: boolean;
  antiIslandingTripRequired: boolean;
  statusAz: string;
  statusEn: string;
}

export function evaluateGridFrequency(frequencyHz: number): GridFrequencyDiagnostic {
  const nominal = 50.00;
  const deviation = Number((frequencyHz - nominal).toFixed(3));

  // Standard safe window in Azerbaijan: 49.80 Hz - 50.20 Hz
  // Curtailment window: 50.20 - 50.50 Hz
  // Trip cutoff: < 49.50 Hz or > 50.50 Hz
  const trip = frequencyHz < 49.50 || frequencyHz > 50.50;
  const curtailment = frequencyHz > 50.20 && frequencyHz <= 50.50;
  const stable = !trip && !curtailment;

  let statusAz = 'Şəbəkə tezliyi sabitdir (50 Hz standart diapazonda).';
  let statusEn = 'Grid frequency stable within standard 50 Hz boundary.';

  if (trip) {
    statusAz = 'Kritik tezlik xətası! Anti-islanding qoruma sistemi inverteri şəbəkədən dərhal ayırır (<100ms).';
    statusEn = 'Critical frequency deviation! Anti-islanding safety disconnects inverter immediately (<100ms).';
  } else if (curtailment) {
    statusAz = 'Yüksək tezlik xəbərdarlığı: İnverter ixrac gücünü avtomatik azaldır (Droop Control).';
    statusEn = 'Over-frequency alert: Inverter activates droop control to throttle export power.';
  }

  return {
    measuredFrequencyHz: frequencyHz,
    nominalFrequencyHz: nominal,
    frequencyDeviationHz: deviation,
    isStable: stable,
    requiresCurtailment: curtailment,
    antiIslandingTripRequired: trip,
    statusAz,
    statusEn,
  };
}

/**
 * 10-Point Technical & Safety Audit Checklist Evaluation
 */
export interface V2gChecklistItem {
  id: string;
  category: 'Electrical' | 'Protocol' | 'BMS' | 'GridSafety';
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  standardReference: string;
  isMandatory: boolean;
  passed: boolean;
}

export interface V2gChecklistEvaluation {
  totalItems: number;
  passedItems: number;
  scorePercentage: number;
  allMandatoryPassed: boolean;
  isEligibleForExport: boolean;
  statusBadgeAz: string;
  statusBadgeEn: string;
}

export function evaluateV2gSafetyChecklist(items: V2gChecklistItem[]): V2gChecklistEvaluation {
  const totalItems = items.length;
  const passedItems = items.filter(i => i.passed).length;
  const mandatoryItems = items.filter(i => i.isMandatory);
  const allMandatoryPassed = mandatoryItems.every(i => i.passed);
  const scorePercentage = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;
  const isEligibleForExport = allMandatoryPassed && scorePercentage >= 80;

  return {
    totalItems,
    passedItems,
    scorePercentage,
    allMandatoryPassed,
    isEligibleForExport,
    statusBadgeAz: isEligibleForExport ? 'Təsdiqləndi (İxrac İcazəsi Verilir)' : 'Kafi Deyil (Təhlükəsizlik Qüsuru)',
    statusBadgeEn: isEligibleForExport ? 'Approved (Grid Export Authorized)' : 'Deficient (Safety Non-Compliance)',
  };
}

/**
 * 10-Question Official Theoretical Examination Grading
 */
export interface V2gExamGrading {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
  verdictAz: string;
  verdictEn: string;
}

export function gradeV2gExam(answers: Record<number, number>, correctKeys: Record<number, number>): V2gExamGrading {
  const totalQuestions = Object.keys(correctKeys).length;
  let correctCount = 0;

  for (const [qId, correctIdx] of Object.entries(correctKeys)) {
    const numericQId = Number(qId);
    if (answers[numericQId] === correctIdx) {
      correctCount++;
    }
  }

  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = scorePercentage >= 80; // Pass mark: 8 out of 10

  return {
    totalQuestions,
    correctAnswers: correctCount,
    scorePercentage,
    passed,
    verdictAz: passed ? 'Müvəffəqiyyətlə Keçdi (İmtahan Təsdiqləndi)' : 'Qeyri-Məqbul (Yenidən Hazırlaşmalı)',
    verdictEn: passed ? 'Passed (Certification Approved)' : 'Failed (Retest Required)',
  };
}

/**
 * Verified V2G Export Certificate Record
 */
export interface VerifiedV2gCertificate {
  certificateNumber: string;        // e.g. V2G-AZ-2026-88124
  licensePlate: string;            // e.g. 10-VG-505
  ownerFullName: string;
  finCode: string;
  substationId: string;
  substationNameAz: string;
  smartMeterCode: string;          // e.g. AZS-SM-782194
  inverterModel: string;
  inverterPowerKw: InverterPowerRating;
  mode: V2xMode;
  batteryCapacityKwh: number;
  maxExportLimitKw: number;
  issueDate: string;
  expiryDate: string;
  securityChecksum: string;
  simaDigitalUid: string;
  status: 'ACTIVE' | 'PENDING' | 'REVOKED';
}

/**
 * Generate Authentic Official V2G Certificate
 */
export function generateV2gCertificate(
  params: Omit<VerifiedV2gCertificate, 'certificateNumber' | 'securityChecksum' | 'simaDigitalUid'>
): VerifiedV2gCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `V2G-AZ-2026-${randomSuffix}`;

  // Deterministic mock checksum
  const seed = `${certificateNumber}-${params.licensePlate}-${params.finCode}-${params.smartMeterCode}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const securityChecksum = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const simaDigitalUid = `SIMA-ENERG-AZ-${securityChecksum.slice(0, 4)}-${randomSuffix}`;

  return {
    ...params,
    certificateNumber,
    securityChecksum,
    simaDigitalUid,
  };
}

/**
 * Currency Formatter Helper
 */
export function formatV2gCurrency(amountAzn: number, currency: Currency): string {
  const rate = CURRENCY_RATES[currency] || 1.0;
  const value = amountAzn * rate;
  switch (currency) {
    case 'USD':
      return `$${value.toFixed(2)}`;
    case 'EUR':
      return `€${value.toFixed(2)}`;
    case 'AZN':
    default:
      return `${value.toFixed(2)} ₼`;
  }
}
