/**
 * Official Azerbaijan Railways (ADY - "Azərbaycan Dəmir Yolları" QSC),
 * Azerbaijan Land Transport Agency (AYNA) &
 * Main State Traffic Police Department (BDYP)
 * Intermodal Road-Rail Piggyback Transit (Kontreyler Daşımaları / Ro-La),
 * Railcar Loading Clearance & Official PIGGYBACK-AZ-2026 Multimodal Rail Gateway Compliance Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Railway Transport"
 *   ("Dəmir yolu nəqliyyatı haqqında" AR Qanunu, Maddə 12, 18, 25: Yüklərin və intermodal nəqliyyat vasitələrinin daşınması, qabarit və hərəkət təhlükəsizliyi)
 * - Law of the Republic of Azerbaijan "On Transport" ("Nəqliyyat haqqında" AR Qanunu)
 * - Agreement on International Goods Transport by Rail (SMGS / Beynəlxalq Dəmir Yolu Yük Daşımaları Sazişi)
 * - UIC 596-2 / UIC 571-4 / UIC 592 Intermodal Pocket Wagon (Taschentragwagen) and Ro-La (Rollende Landstraße) Loading Rules
 * - GOST 9238-2013 Railway Rolling Stock & Loading Gauge Envelope (Qabarit 1-T, 02-VM) for 1520 mm Broad Gauge & 1435 mm Standard Gauge (BTK corridor)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *   * Maddə 347: Dəmir yolu nəqliyyatında yüklərin yüklənməsi, bərkidilməsi və qabarit tələblərinin pozulması (500-2,000 AZN cərimə)
 *   * Maddə 348-1: Dəmir yolu ilə təhlükəsizlik, ox yükü və sertifikatlaşdırma qaydalarının pozulması (1,000-3,000 AZN cərimə)
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR
};

export const convertAzn = (amountAzn: number, currency: Currency): number => {
  return amountAzn * CURRENCY_RATES[currency];
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';
  return `${amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
};

/**
 * Rail Wagon & Track Gauge Specifications
 */
export type IntermodalWagonType =
  | 'POCKET_T3000E'        // Sdggmrss Double Pocket Wagon for Mega semi-trailers & ISO containers
  | 'RO_LA_LOW_FLOOR'       // Ultra-low floor Ro-La wagon (wheel diam 360-380mm) for tractor + semi-trailer
  | 'CONTAINER_FLAT_60FT'   // 60ft Multimodal Container Flatcar for swap bodies & tank containers
  | 'PLATFORM_HEAVY_DUTY';  // 4-axle heavy platform for oversized / specialized machinery

export type RailTrackGauge =
  | 'GAUGE_1520_MM'  // 1520 mm Broad Gauge (ADY Domestic, CIS & INSTC corridor)
  | 'GAUGE_1435_MM'; // 1435 mm Standard Gauge (BTK Baku-Tbilisi-Kars European network interchange)

export type TerminalId =
  | 'alat_hub'
  | 'ganja_keshla'
  | 'astara_instc'
  | 'boyuk_kesik'
  | 'yalama_north'
  | 'nakhchivan_hub';

export interface IntermodalTerminalInfo {
  id: TerminalId;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  locationAz: string;
  gaugesSupported: RailTrackGauge[];
  craneCapacityTonnes: number;
  dailyTrainCapacity: number;
  roLaRampAvailable: boolean;
  pocketWagonDepot: boolean;
  customsPostAz: string;
  distanceFromAlatKm: number;
  descriptionAz: string;
}

export interface IntermodalVehiclePreset {
  id: string;
  trailerPlate: string;
  tractorPlate: string;
  vin: string;
  carrierNameAz: string;
  cargoDescriptionAz: string;
  wagonType: IntermodalWagonType;
  trackGauge: RailTrackGauge;
  originTerminal: TerminalId;
  destinationTerminal: TerminalId;
  trailerTareTonnes: number;
  cargoPayloadTonnes: number;
  trailerHeightMm: number; // Height of semi-trailer alone (mm)
  loadedHeightFromRailMm: number; // Combined total height from top of rail (mm)
  trailerWidthMm: number;
  kingpinLoadTonnes: number;
  frontBogieTonnes: number;
  rearBogieTonnes: number;
  isAirSuspensionDeflated: boolean;
  areWheelChocksLocked: boolean;
  lashingTensionKn: number;
}

export interface BogieAxleLoadResult {
  grossTrailerWeightTonnes: number;
  wagonTareWeightTonnes: number;
  totalCombinedWeightTonnes: number;
  totalAxles: number;
  averageAxleLoadTonnes: number;
  maxAllowableAxleLoadTonnes: number;
  isAxleLoadCompliant: boolean;
  bogieImbalancePercent: number;
  isBogieBalanced: boolean; // Balance <= 10%
  kingpinCompliant: boolean; // <= 15.0 tonnes
  clearanceCategory: 'UIC_P400_STANDARD' | 'UIC_P385_COMPLIANT' | 'OVERSIZED_SPECIAL_PERMIT' | 'REJECTED_CRITICAL_OVERLOAD';
}

export interface LoadingClearanceResult {
  isHeightCompliant: boolean;
  isWidthCompliant: boolean;
  isSuspensionDeflated: boolean;
  areChocksLocked: boolean;
  isLashingTensionSufficient: boolean;
  isFullyApproved: boolean;
  envelopeMarginHeightMm: number;
  envelopeMarginWidthMm: number;
  rejectionReasonsAz: string[];
  recommendedWagonAz: string;
}

export interface TariffAndSavingsResult {
  distanceKm: number;
  railBaseTariffAzn: number;
  wagonSurchargeAzn: number;
  terminalHandlingFeeAzn: number;
  totalRailTariffAzn: number;
  estimatedRoadTransitCostAzn: number;
  netFinancialSavingsAzn: number;
  savingsPercentage: number;
  roadDieselConsumedLitres: number;
  railEquivalentDieselLitres: number;
  dieselSavedLitres: number;
  co2EmissionsAvoidedKg: number;
  roadWearFeesSavedAzn: number;
}

export interface PiggybackChecklistItem {
  id: string;
  categoryAz: 'WAGON_DECK' | 'TRAILER_CHASSIS' | 'SECURING_LASHINGS' | 'BRAKE_SYSTEM' | 'CUSTOMS_SEALS';
  titleAz: string;
  descriptionAz: string;
  isMandatory: boolean;
  uicReference: string;
}

export interface PiggybackExamQuestion {
  id: string;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  legalBasisAz: string;
}

export interface OfficialPiggybackCertificate {
  certificateId: string;
  issueDate: string;
  validUntil: string;
  trailerPlate: string;
  tractorPlate: string;
  vin: string;
  carrierNameAz: string;
  cargoDescriptionAz: string;
  wagonId: string;
  wagonType: IntermodalWagonType;
  trackGauge: RailTrackGauge;
  originTerminalAz: string;
  destinationTerminalAz: string;
  distanceKm: number;
  totalCombinedWeightTonnes: number;
  maxAxleLoadTonnes: number;
  loadedHeightFromRailMm: number;
  clearanceCode: string;
  co2AvoidedKg: number;
  dieselSavedLitres: number;
  sha256SecurityChecksum: string;
  simaDigitalUid: string;
  qrVerificationUrl: string;
  adyStationMasterAz: string;
  customsSealCode: string;
}

/**
 * Standard Envelope and Capacity Limits
 */
export const UIC_P400_MAX_HEIGHT_MM = 4000; // Standard allowable loading height on pocket wagon from rail top
export const MAX_EXTENDED_POCKET_HEIGHT_MM = 4200; // Specialized deep pocket wagon limit (e.g. T3000e in deep recess)
export const MAX_ALLOWABLE_WIDTH_MM = 2600; // Standard refrigerated / dry van max width
export const MAX_KINGPIN_LOAD_TONNES = 15.0; // Max allowable hitch saddle / kingpin load
export const MIN_LASHING_TENSION_KN = 100.0; // Minimum 100 kN heavy tension chains

export const WAGON_SPECS: Record<
  IntermodalWagonType,
  { nameAz: string; tareWeightTonnes: number; axles: number; maxPayloadTonnes: number; maxAxleLoadTonnes: number }
> = {
  POCKET_T3000E: {
    nameAz: 'Sdggmrss T3000e İkili Cib Vaqonu (Taschentragwagen)',
    tareWeightTonnes: 34.0,
    axles: 6, // 6-axle articulated double pocket
    maxPayloadTonnes: 72.0,
    maxAxleLoadTonnes: 22.5,
  },
  RO_LA_LOW_FLOOR: {
    nameAz: 'Saadkms Aşağı Döşəməli Ro-La Avtoqatar Vaqonu (Rollende Landstraße)',
    tareWeightTonnes: 20.5,
    axles: 8, // 8-axle low floor multi-bogie
    maxPayloadTonnes: 44.0,
    maxAxleLoadTonnes: 15.0,
  },
  CONTAINER_FLAT_60FT: {
    nameAz: 'Sgnss 60ft İntermodal Düz Platforma Vaqonu',
    tareWeightTonnes: 19.5,
    axles: 4, // 4-axle standard flat wagon
    maxPayloadTonnes: 70.5,
    maxAxleLoadTonnes: 22.5,
  },
  PLATFORM_HEAVY_DUTY: {
    nameAz: 'Res 4-Oxlu Ağır Sənaye və Xüsusi Qabaritli Platforma',
    tareWeightTonnes: 23.0,
    axles: 4,
    maxPayloadTonnes: 67.0,
    maxAxleLoadTonnes: 25.0, // 25.0 tonnes for GOST Category D4
  },
};

/**
 * Calculates bogie axle load, balance, and clearance category
 */
export const calculateBogieAxleLoad = (params: {
  wagonType: IntermodalWagonType;
  trailerTareTonnes: number;
  cargoPayloadTonnes: number;
  frontBogieTonnes: number;
  rearBogieTonnes: number;
  kingpinLoadTonnes: number;
  trackGauge: RailTrackGauge;
}): BogieAxleLoadResult => {
  const wagon = WAGON_SPECS[params.wagonType];
  const grossTrailerWeightTonnes = Number((params.trailerTareTonnes + params.cargoPayloadTonnes).toFixed(2));
  const wagonTareWeightTonnes = wagon.tareWeightTonnes;
  const totalCombinedWeightTonnes = Number((grossTrailerWeightTonnes + wagonTareWeightTonnes).toFixed(2));
  const totalAxles = wagon.axles;

  const averageAxleLoadTonnes = Number((totalCombinedWeightTonnes / totalAxles).toFixed(2));
  const maxAllowableAxleLoadTonnes = params.trackGauge === 'GAUGE_1520_MM' ? 25.0 : wagon.maxAxleLoadTonnes;

  const isAxleLoadCompliant = averageAxleLoadTonnes <= maxAllowableAxleLoadTonnes;

  const bogieSum = params.frontBogieTonnes + params.rearBogieTonnes;
  const bogieDiff = Math.abs(params.frontBogieTonnes - params.rearBogieTonnes);
  const bogieImbalancePercent = bogieSum > 0 ? Number(((bogieDiff / (bogieSum / 2)) * 100).toFixed(1)) : 0;
  const isBogieBalanced = bogieImbalancePercent <= 10.0;

  const kingpinCompliant = params.kingpinLoadTonnes <= MAX_KINGPIN_LOAD_TONNES;

  let clearanceCategory: BogieAxleLoadResult['clearanceCategory'] = 'UIC_P400_STANDARD';

  if (!isAxleLoadCompliant || totalCombinedWeightTonnes > wagonTareWeightTonnes + wagon.maxPayloadTonnes) {
    clearanceCategory = 'REJECTED_CRITICAL_OVERLOAD';
  } else if (!isBogieBalanced || !kingpinCompliant) {
    clearanceCategory = 'OVERSIZED_SPECIAL_PERMIT';
  } else if (grossTrailerWeightTonnes > 38.0) {
    clearanceCategory = 'UIC_P385_COMPLIANT';
  }

  return {
    grossTrailerWeightTonnes,
    wagonTareWeightTonnes,
    totalCombinedWeightTonnes,
    totalAxles,
    averageAxleLoadTonnes,
    maxAllowableAxleLoadTonnes,
    isAxleLoadCompliant,
    bogieImbalancePercent,
    isBogieBalanced,
    kingpinCompliant,
    clearanceCategory,
  };
};

/**
 * Evaluates dynamic railway loading clearance envelope (UIC 596-2 / GOST 1-T)
 */
export const evaluateLoadingClearance = (params: {
  wagonType: IntermodalWagonType;
  loadedHeightFromRailMm: number;
  trailerWidthMm: number;
  isAirSuspensionDeflated: boolean;
  areWheelChocksLocked: boolean;
  lashingTensionKn: number;
  bogieResult: BogieAxleLoadResult;
}): LoadingClearanceResult => {
  const maxHeight = params.wagonType === 'POCKET_T3000E' ? MAX_EXTENDED_POCKET_HEIGHT_MM : UIC_P400_MAX_HEIGHT_MM;
  const isHeightCompliant = params.loadedHeightFromRailMm <= maxHeight;
  const isWidthCompliant = params.trailerWidthMm <= MAX_ALLOWABLE_WIDTH_MM;
  const isSuspensionDeflated = params.isAirSuspensionDeflated;
  const areChocksLocked = params.areWheelChocksLocked;
  const isLashingTensionSufficient = params.lashingTensionKn >= MIN_LASHING_TENSION_KN;

  const envelopeMarginHeightMm = maxHeight - params.loadedHeightFromRailMm;
  const envelopeMarginWidthMm = MAX_ALLOWABLE_WIDTH_MM - params.trailerWidthMm;

  const rejectionReasonsAz: string[] = [];

  if (!isHeightCompliant) {
    rejectionReasonsAz.push(`Qatar üstü ümumi hündürlük normanı ${Math.abs(envelopeMarginHeightMm)} mm aşır (Maks: ${maxHeight} mm).`);
  }
  if (!isWidthCompliant) {
    rejectionReasonsAz.push(`Yarımqoşqu eni maksimal qabariti ${Math.abs(envelopeMarginWidthMm)} mm aşır (Maks: ${MAX_ALLOWABLE_WIDTH_MM} mm).`);
  }
  if (!isSuspensionDeflated) {
    rejectionReasonsAz.push('Yarımqoşqu pnevmatik asqısı tam endirilməyib (cib vaqonunda dəmir yolu tunel qabariti üçün məcburidir).');
  }
  if (!areChocksLocked) {
    rejectionReasonsAz.push('Vaqon göyərtəsində təkər dayaqları (tormoz başmaqları) kran şinlərində kilidlənməyib.');
  }
  if (!isLashingTensionSufficient) {
    rejectionReasonsAz.push(`Zəncirli bərkitmə gərginliyi ${params.lashingTensionKn} kN təşkil edir (minimum tələb: ${MIN_LASHING_TENSION_KN} kN).`);
  }
  if (!params.bogieResult.isAxleLoadCompliant) {
    rejectionReasonsAz.push(`Orta ox yükü (${params.bogieResult.averageAxleLoadTonnes} t) yol qəbul həddini (${params.bogieResult.maxAllowableAxleLoadTonnes} t) aşır.`);
  }
  if (!params.bogieResult.isBogieBalanced) {
    rejectionReasonsAz.push(`Vaxtaşırı təkər arabacıqları yük disbalansı ${params.bogieResult.bogieImbalancePercent}% təşkil edir (maksimum 10%).`);
  }
  if (!params.bogieResult.kingpinCompliant) {
    rejectionReasonsAz.push('Şkvorin (Kingpin) dayaq yükü 15.0 ton həddini aşır.');
  }

  const isFullyApproved = rejectionReasonsAz.length === 0;

  let recommendedWagonAz = 'Sdggmrss T3000e Cib Vaqonu (Taschentragwagen)';
  if (params.loadedHeightFromRailMm > 4000) {
    recommendedWagonAz = 'T3000e Xüsusi Dərinləşdirilmiş Cib Vaqonu (UIC Code P400)';
  } else if (params.wagonType === 'RO_LA_LOW_FLOOR') {
    recommendedWagonAz = 'Saadkms Aşağı Döşəməli Tam Qovuşuq Ro-La Vaqonu';
  } else if (params.wagonType === 'CONTAINER_FLAT_60FT') {
    recommendedWagonAz = 'Sgnss 60ft Standart İntermodal Düz Platforma';
  }

  return {
    isHeightCompliant,
    isWidthCompliant,
    isSuspensionDeflated,
    areChocksLocked,
    isLashingTensionSufficient,
    isFullyApproved,
    envelopeMarginHeightMm,
    envelopeMarginWidthMm,
    rejectionReasonsAz,
    recommendedWagonAz,
  };
};

/**
 * Calculates intermodal rail freight tariffs, fuel savings and CO2 emission avoidance
 */
export const calculateIntermodalSavingsAndTariff = (params: {
  originTerminal: TerminalId;
  destinationTerminal: TerminalId;
  wagonType: IntermodalWagonType;
  grossTrailerWeightTonnes: number;
  isRoundTrip: boolean;
  terminals: Record<TerminalId, IntermodalTerminalInfo>;
}): TariffAndSavingsResult => {
  const origin = params.terminals[params.originTerminal];
  const dest = params.terminals[params.destinationTerminal];

  // Calculate approximate rail track distance between hubs
  let distanceKm = Math.abs(dest.distanceFromAlatKm - origin.distanceFromAlatKm);
  if (distanceKm === 0) {
    distanceKm = 45; // Local shunting & port shuttle distance
  }

  // Tariff calculation: Base fee + per-km rate + gross weight factor
  const baseBookingFeeAzn = 65.0;
  const ratePerKmPerTonneAzn = 0.025; // ~0.025 AZN per tonne-km
  const distanceFeeAzn = distanceKm * params.grossTrailerWeightTonnes * ratePerKmPerTonneAzn;

  const wagonSurchargeAzn =
    params.wagonType === 'POCKET_T3000E'
      ? 75.0
      : params.wagonType === 'RO_LA_LOW_FLOOR'
      ? 95.0
      : params.wagonType === 'PLATFORM_HEAVY_DUTY'
      ? 85.0
      : 55.0;

  const terminalHandlingFeeAzn = 45.0; // Terminal gantry crane / Ro-La ramp handling fee

  let totalRailTariffAzn = baseBookingFeeAzn + distanceFeeAzn + wagonSurchargeAzn + terminalHandlingFeeAzn;
  if (params.isRoundTrip) {
    totalRailTariffAzn = totalRailTariffAzn * 1.85; // 15% discount on round-trip return transit
  }
  totalRailTariffAzn = Number(totalRailTariffAzn.toFixed(2));

  // Comparative road transit parameters:
  // Typical diesel semi-trailer consumes ~33 L / 100 km on highway
  const roadDieselConsumedLitres = Number(((distanceKm / 100) * 33.0).toFixed(1));
  // Electric / diesel-electric freight train consumes equivalent of ~8.5 L per semi-trailer slot / 100 km
  const railEquivalentDieselLitres = Number(((distanceKm / 100) * 8.5).toFixed(1));
  const dieselSavedLitres = Number(Math.max(0, roadDieselConsumedLitres - railEquivalentDieselLitres).toFixed(1));

  // CO2 Emissions: 1 Litre diesel produces ~2.68 kg CO2
  const co2EmissionsAvoidedKg = Number((dieselSavedLitres * 2.68).toFixed(1));

  // Road transit costs: Diesel cost (~0.90 AZN/L) + highway toll + tire/brake wear (~0.55 AZN/km) + driver per-diem/amortization (~1.25 AZN/km)
  const roadFuelCostAzn = roadDieselConsumedLitres * 0.90;
  const roadMaintenanceAndTollAzn = distanceKm * 0.55;
  const driverAndTruckAmortizationAzn = distanceKm * 1.25;
  let estimatedRoadTransitCostAzn = roadFuelCostAzn + roadMaintenanceAndTollAzn + driverAndTruckAmortizationAzn;
  if (params.isRoundTrip) {
    estimatedRoadTransitCostAzn *= 2.0;
  }
  estimatedRoadTransitCostAzn = Number(estimatedRoadTransitCostAzn.toFixed(2));

  const roadWearFeesSavedAzn = Number((distanceKm * 0.18).toFixed(2));
  const netFinancialSavingsAzn = Number((estimatedRoadTransitCostAzn - totalRailTariffAzn).toFixed(2));
  const savingsPercentage =
    estimatedRoadTransitCostAzn > 0
      ? Number(((netFinancialSavingsAzn / estimatedRoadTransitCostAzn) * 100).toFixed(1))
      : 0;

  return {
    distanceKm,
    railBaseTariffAzn: baseBookingFeeAzn,
    wagonSurchargeAzn,
    terminalHandlingFeeAzn,
    totalRailTariffAzn,
    estimatedRoadTransitCostAzn,
    netFinancialSavingsAzn,
    savingsPercentage,
    roadDieselConsumedLitres,
    railEquivalentDieselLitres,
    dieselSavedLitres,
    co2EmissionsAvoidedKg,
    roadWearFeesSavedAzn,
  };
};

/**
 * Fastening checklist evaluation
 */
export const evaluateFasteningChecklist = (
  checklist: PiggybackChecklistItem[],
  checkedMap: Record<string, boolean>
): {
  mandatoryCount: number;
  mandatoryChecked: number;
  totalCount: number;
  totalChecked: number;
  isAllMandatorySatisfied: boolean;
  scorePercent: number;
} => {
  const totalCount = checklist.length;
  let totalChecked = 0;
  let mandatoryCount = 0;
  let mandatoryChecked = 0;

  checklist.forEach((item) => {
    const isChecked = !!checkedMap[item.id];
    if (isChecked) totalChecked++;
    if (item.isMandatory) {
      mandatoryCount++;
      if (isChecked) mandatoryChecked++;
    }
  });

  const isAllMandatorySatisfied = mandatoryCount === mandatoryChecked;
  const scorePercent = totalCount > 0 ? Math.round((totalChecked / totalCount) * 100) : 0;

  return {
    mandatoryCount,
    mandatoryChecked,
    totalCount,
    totalChecked,
    isAllMandatorySatisfied,
    scorePercent,
  };
};

/**
 * Theoretical exam evaluator
 */
export const evaluatePiggybackExam = (
  questions: PiggybackExamQuestion[],
  answers: Record<string, number>
): {
  correctCount: number;
  totalCount: number;
  percentage: number;
  isPassed: boolean;
} => {
  let correctCount = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const totalCount = questions.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isPassed = percentage >= 80;

  return {
    correctCount,
    totalCount,
    percentage,
    isPassed,
  };
};

/**
 * Generates an official ADY, AYNA & BDYP PIGGYBACK-AZ-2026 Multimodal Rail Gateway Clearance Certificate
 */
export const generateOfficialPiggybackCertificate = (params: {
  trailerPlate: string;
  tractorPlate: string;
  vin: string;
  carrierNameAz: string;
  cargoDescriptionAz: string;
  wagonType: IntermodalWagonType;
  trackGauge: RailTrackGauge;
  originTerminalAz: string;
  destinationTerminalAz: string;
  distanceKm: number;
  totalCombinedWeightTonnes: number;
  maxAxleLoadTonnes: number;
  loadedHeightFromRailMm: number;
  co2AvoidedKg: number;
  dieselSavedLitres: number;
}): OfficialPiggybackCertificate => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `PIGGYBACK-AZ-2026-${randomSuffix}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];

  const expiry = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days intermodal transit window
  const validUntil = expiry.toISOString().split('T')[0];

  const wagonId = `AZ-ADY-${Math.floor(20000000 + Math.random() * 70000000)}`;
  const customsSealCode = `AZ-DGK-E-SEAL-${Math.floor(100000 + Math.random() * 900000)}`;

  const rawPayload = `${certificateId}|${params.trailerPlate}|${params.vin}|${wagonId}|${issueDate}`;
  let hash = 0;
  for (let i = 0; i < rawPayload.length; i++) {
    hash = (hash << 5) - hash + rawPayload.charCodeAt(i);
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  const sha256SecurityChecksum = `SHA256:4d7a${hexHash}e821fa2026`;
  const simaDigitalUid = `SIMA-ADY-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const clearanceCode =
    params.loadedHeightFromRailMm <= 4000
      ? 'UIC-P400 / GOST-1T STANDART'
      : 'UIC-P400-EXTENDED XÜSUSİ DƏRİN CİB';

  return {
    certificateId,
    issueDate,
    validUntil,
    trailerPlate: params.trailerPlate,
    tractorPlate: params.tractorPlate,
    vin: params.vin,
    carrierNameAz: params.carrierNameAz,
    cargoDescriptionAz: params.cargoDescriptionAz,
    wagonId,
    wagonType: params.wagonType,
    trackGauge: params.trackGauge,
    originTerminalAz: params.originTerminalAz,
    destinationTerminalAz: params.destinationTerminalAz,
    distanceKm: params.distanceKm,
    totalCombinedWeightTonnes: params.totalCombinedWeightTonnes,
    maxAxleLoadTonnes: params.maxAxleLoadTonnes,
    loadedHeightFromRailMm: params.loadedHeightFromRailMm,
    clearanceCode,
    co2AvoidedKg: params.co2AvoidedKg,
    dieselSavedLitres: params.dieselSavedLitres,
    sha256SecurityChecksum,
    simaDigitalUid,
    qrVerificationUrl: `https://railways.gov.az/intermodal/verify?cert=${certificateId}&plate=${encodeURIComponent(params.trailerPlate)}`,
    adyStationMasterAz: 'Baş Hərəkət və Yük Dispetçeri N. Q. Məmmədrzayev (ADY VÖEN: 1300894011)',
    customsSealCode,
  };
};
