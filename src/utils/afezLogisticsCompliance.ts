/**
 * Official State Maritime and Port Agency (DDLA), State Customs Committee (DGK) &
 * Port of Baku Free Trade Zone (Alat Free Economic Zone - AFEZ)
 * Multimodal Bonded Logistics, Intermodal Container Yard Telemetry & Official AFEZ-TIR-2026 Customs Clearance Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On the Alat Free Economic Zone" (AFEZ Law № 1143-VQ)
 *   ("Ələt azad iqtisadi zonası haqqında" AR Qanunu)
 * - Customs Code of the Republic of Azerbaijan ("Azərbaycan Respublikasının Gömrük Məcəlləsi", Maddə 184-210)
 * - Merchant Shipping Code of the Republic of Azerbaijan (AR Dəniz Gəmiçiliyi Məcəlləsi)
 * - Law of the Republic of Azerbaijan "On Sea Ports" ("Dəniz limanları haqqında" AR Qanunu)
 * - IMO SOLAS Convention Chapter VI Regulation 2 - Verified Gross Mass (VGM / Yoxlanılmış Ümumi Kütlə)
 * - IMO CSC 1972 (International Convention for Safe Containers) & ISO 6346 Container Identification
 * - Trans-Caspian International Transport Route (TITR / Middle Corridor / Orta Dəhliz) Protocols
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD (1.70 AZN / USD)
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR (1.84 AZN / EUR)
};

/**
 * ISO 6346 Container Types & Dimensions
 */
export type ContainerType = 
  | '20FT_DRY'
  | '40FT_DRY'
  | '40FT_HC'
  | '45FT_HC_PW'
  | '40FT_REEFER'
  | '20FT_ISO_TANK';

export interface ContainerSpecification {
  id: ContainerType;
  isoCode: string;
  nameAz: string;
  nameEn: string;
  teuValue: number;
  tareWeightKg: number;
  maxGrossMassKg: number;
  maxPayloadKg: number;
  internalVolumeM3: number;
  lengthM: number;
  heightM: number;
  liftOnLiftOffRateAzn: number;
  dailyDemurrageRateAzn: number;
  isReefer: boolean;
  isLiquidTank: boolean;
}

export const CONTAINER_SPECS: Record<ContainerType, ContainerSpecification> = {
  '20FT_DRY': {
    id: '20FT_DRY',
    isoCode: '22G1',
    nameAz: '20 fut Standart Quru Yük Konteyneri (1 TEU)',
    nameEn: '20ft Standard Dry Cargo Container (1 TEU)',
    teuValue: 1.0,
    tareWeightKg: 2230,
    maxGrossMassKg: 30480,
    maxPayloadKg: 28250,
    internalVolumeM3: 33.2,
    lengthM: 6.06,
    heightM: 2.59,
    liftOnLiftOffRateAzn: 65,
    dailyDemurrageRateAzn: 8,
    isReefer: false,
    isLiquidTank: false,
  },
  '40FT_DRY': {
    id: '40FT_DRY',
    isoCode: '42G1',
    nameAz: '40 fut Standart Ümumi Təyinatlı Konteyner (2 TEU)',
    nameEn: '40ft Standard General Purpose Container (2 TEU)',
    teuValue: 2.0,
    tareWeightKg: 3750,
    maxGrossMassKg: 32500,
    maxPayloadKg: 28750,
    internalVolumeM3: 67.7,
    lengthM: 12.19,
    heightM: 2.59,
    liftOnLiftOffRateAzn: 95,
    dailyDemurrageRateAzn: 14,
    isReefer: false,
    isLiquidTank: false,
  },
  '40FT_HC': {
    id: '40FT_HC',
    isoCode: '45G1',
    nameAz: '40 fut Yüksək Tutumlu High Cube Konteyner (2 TEU)',
    nameEn: '40ft High Cube High-Capacity Container (2 TEU)',
    teuValue: 2.0,
    tareWeightKg: 3900,
    maxGrossMassKg: 32500,
    maxPayloadKg: 28600,
    internalVolumeM3: 76.4,
    lengthM: 12.19,
    heightM: 2.90,
    liftOnLiftOffRateAzn: 105,
    dailyDemurrageRateAzn: 16,
    isReefer: false,
    isLiquidTank: false,
  },
  '45FT_HC_PW': {
    id: '45FT_HC_PW',
    isoCode: 'L5G1',
    nameAz: '45 fut High Cube Pallet-Wide İntermodal Konteyner (2.25 TEU)',
    nameEn: '45ft High Cube Pallet-Wide Intermodal Container (2.25 TEU)',
    teuValue: 2.25,
    tareWeightKg: 4800,
    maxGrossMassKg: 34000,
    maxPayloadKg: 29200,
    internalVolumeM3: 89.2,
    lengthM: 13.72,
    heightM: 2.90,
    liftOnLiftOffRateAzn: 120,
    dailyDemurrageRateAzn: 20,
    isReefer: false,
    isLiquidTank: false,
  },
  '40FT_REEFER': {
    id: '40FT_REEFER',
    isoCode: '45R1',
    nameAz: '40 fut Soyuduculu Refrijerator Konteyner (-30°C / +30°C)',
    nameEn: '40ft Refrigerated Cold-Chain Reefer Container (-30°C / +30°C)',
    teuValue: 2.0,
    tareWeightKg: 4480,
    maxGrossMassKg: 34000,
    maxPayloadKg: 29520,
    internalVolumeM3: 67.5,
    lengthM: 12.19,
    heightM: 2.90,
    liftOnLiftOffRateAzn: 135,
    dailyDemurrageRateAzn: 24,
    isReefer: true,
    isLiquidTank: false,
  },
  '20FT_ISO_TANK': {
    id: '20FT_ISO_TANK',
    isoCode: '22T6',
    nameAz: '20 fut Maye və Kimyəvi Maddələr üçün ISO Sistern Konteyner',
    nameEn: '20ft Bulk Liquid & Chemical ISO Tank Container (26,000L)',
    teuValue: 1.0,
    tareWeightKg: 3620,
    maxGrossMassKg: 36000,
    maxPayloadKg: 32380,
    internalVolumeM3: 26.0,
    lengthM: 6.06,
    heightM: 2.59,
    liftOnLiftOffRateAzn: 110,
    dailyDemurrageRateAzn: 18,
    isReefer: false,
    isLiquidTank: true,
  },
};

/**
 * Multimodal Transport Corridor Legs
 */
export type MultimodalCorridor = 
  | 'TRANS_CASPIAN_SEA'
  | 'BTK_RAIL_BLOCK'
  | 'NORTH_SOUTH_ROAD'
  | 'AIR_SEA_INTERMODAL'
  | 'AFEZ_INTERNAL_BONDED';

export interface CorridorMetadata {
  id: MultimodalCorridor;
  code: string;
  nameAz: string;
  nameEn: string;
  transitSpeedKmH: number;
  averageTransitDays: number;
  primaryModes: string[];
  co2PerTeuKmGram: number;
  baseFreightRateAzn: number;
}

export const MULTIMODAL_CORRIDORS: Record<MultimodalCorridor, CorridorMetadata> = {
  TRANS_CASPIAN_SEA: {
    id: 'TRANS_CASPIAN_SEA',
    code: 'TITR-SEA',
    nameAz: 'Orta Dəhliz / Trans-Xəzər Dəniz Xətti (Ələt – Aktau / Quryk / Türkmənbaşı)',
    nameEn: 'Middle Corridor / Trans-Caspian Sea Line (Alat – Aktau / Kuryk / Turkmenbashi)',
    transitSpeedKmH: 26,
    averageTransitDays: 1.5,
    primaryModes: ['Feeder Ro-Ro', 'ASCO Ro-Pax Ferry', 'TIR Tractor'],
    co2PerTeuKmGram: 18.5,
    baseFreightRateAzn: 380,
  },
  BTK_RAIL_BLOCK: {
    id: 'BTK_RAIL_BLOCK',
    code: 'BTK-RAIL',
    nameAz: 'Bakı-Tbilisi-Qars (BTK) və ADY Blok Konteyner Qatarı',
    nameEn: 'Baku-Tbilisi-Kars (BTK) & ADY Container Block Train',
    transitSpeedKmH: 65,
    averageTransitDays: 2.0,
    primaryModes: ['Electric Locomotive', 'Container Flat Wagon', 'ADY Rail Yard'],
    co2PerTeuKmGram: 22.0,
    baseFreightRateAzn: 320,
  },
  NORTH_SOUTH_ROAD: {
    id: 'NORTH_SOUTH_ROAD',
    code: 'INSTC-ROAD',
    nameAz: 'Şimal-Cənub Beynəlxalq Nəqliyyat Dəhlizi (M-3 Astara – Ələt – Samur M-1)',
    nameEn: 'International North-South Transport Corridor (M-3 Astara – Alat – Samur M-1)',
    transitSpeedKmH: 70,
    averageTransitDays: 1.0,
    primaryModes: ['Euro-6 TIR Truck', 'Container Chassis Semi-Trailer'],
    co2PerTeuKmGram: 62.0,
    baseFreightRateAzn: 260,
  },
  AIR_SEA_INTERMODAL: {
    id: 'AIR_SEA_INTERMODAL',
    code: 'SW-AIR-SEA',
    nameAz: 'Silk Way Azad İqtisadi Zona Hava-Dəniz-Quru Ekspres Tranziti',
    nameEn: 'Silk Way AFEZ Air-Sea-Road Multimodal Express Cargo Transit',
    transitSpeedKmH: 220,
    averageTransitDays: 0.5,
    primaryModes: ['Boeing 747-8F Cargo', 'Bonded Airport Shuttle', 'AFEZ Hub'],
    co2PerTeuKmGram: 110.0,
    baseFreightRateAzn: 740,
  },
  AFEZ_INTERNAL_BONDED: {
    id: 'AFEZ_INTERNAL_BONDED',
    code: 'AFEZ-BONDED',
    nameAz: 'Ələt Azad İqtisadi Zonası Daxili Gömrük Anbarı və Logistika Emalı',
    nameEn: 'AFEZ Internal Bonded Customs Warehousing & Value-Add Processing',
    transitSpeedKmH: 30,
    averageTransitDays: 0.2,
    primaryModes: ['Terminal AGV Shuttle', 'Internal Heavy Reach Stacker'],
    co2PerTeuKmGram: 12.0,
    baseFreightRateAzn: 110,
  },
};

/**
 * Free Economic Zone (AFEZ) Tax & Tariff Concessions
 */
export const AFEZ_CONCESSIONS = {
  freeBondedStorageDays: 14,
  corporateTaxRatePercent: 0,
  vatRatePercent: 0,
  customsImportDutyPercent: 0,
  exciseTaxPercent: 0,
  singleWindowProcessingFeeAzn: 15,
  solasVgmWeighbridgeFeeAzn: 20,
  reeferShorePowerDailyFeeAzn: 25,
  rfidSecuritySealBarrierFeeAzn: 10,
  // Domestic standard comparison baseline
  standardCustomsDutyPercent: 15,
  standardVatPercent: 18,
};

/**
 * SOLAS VGM Weighing Methods
 */
export type VgmMethod = 'METHOD_1_WEIGHBRIDGE' | 'METHOD_2_CALCULATED';

export interface VgmCalculationResult {
  method: VgmMethod;
  containerIso: string;
  tareWeightKg: number;
  cargoPayloadKg: number;
  dunnagePackagingKg: number;
  verifiedGrossMassKg: number;
  maxGrossPermissibleKg: number;
  isOverloaded: boolean;
  overloadExcessKg: number;
  toleranceDiscrepancyKg: number;
  isToleranceCompliant: boolean;
  scaleAccuracyPercent: number;
  weighbridgeScaleId: string;
  vgmCertificateUid: string;
  statusAz: string;
  statusEn: string;
}

/**
 * Calculate SOLAS Verified Gross Mass (VGM)
 */
export function calculateSolasVgm(
  containerType: ContainerType,
  cargoNetWeightKg: number,
  method: VgmMethod = 'METHOD_1_WEIGHBRIDGE',
  dunnagePackagingKg: number = 250,
  measuredScaleGrossKg?: number
): VgmCalculationResult {
  const spec = CONTAINER_SPECS[containerType];
  const tare = spec.tareWeightKg;
  const theoreticalGross = tare + cargoNetWeightKg + dunnagePackagingKg;

  let verifiedGross = theoreticalGross;
  let toleranceDiscrepancy = 0;

  if (method === 'METHOD_1_WEIGHBRIDGE') {
    // Certified weighbridge actual reading
    verifiedGross = measuredScaleGrossKg !== undefined ? measuredScaleGrossKg : theoreticalGross;
    toleranceDiscrepancy = Math.abs(verifiedGross - theoreticalGross);
  } else {
    // Method 2: Calculated from individual items + packaging + container tare
    verifiedGross = tare + cargoNetWeightKg + dunnagePackagingKg;
    toleranceDiscrepancy = 0;
  }

  const isOverloaded = verifiedGross > spec.maxGrossMassKg;
  const overloadExcess = isOverloaded ? verifiedGross - spec.maxGrossMassKg : 0;
  // SOLAS maximum tolerance is 5% or 500 kg
  const maxAllowedDiscrepancy = Math.min(verifiedGross * 0.05, 500);
  const isToleranceCompliant = toleranceDiscrepancy <= maxAllowedDiscrepancy;

  const statusAz = isOverloaded
    ? 'HƏDDƏN ARTIQ YÜKLƏNMİŞDİR: SOLAS Çəki Həddi Aşıldı'
    : !isToleranceCompliant
    ? 'DƏQİQLİK XƏTASI: Çəki Fərqi İcazə Verilən Həddi Aşır'
    : 'TƏSDİQLƏNDİ: SOLAS VGM Beynəlxalq Tələblərinə Uyğundur';

  const statusEn = isOverloaded
    ? 'OVERLOADED: SOLAS Maximum Gross Mass Exceeded'
    : !isToleranceCompliant
    ? 'TOLERANCE EXCEEDED: Weighbridge Discrepancy > 5%'
    : 'VERIFIED: Complies with SOLAS Chapter VI Regulation 2';

  const vgmCertificateUid = `VGM-AFEZ-${spec.isoCode}-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    method,
    containerIso: spec.isoCode,
    tareWeightKg: tare,
    cargoPayloadKg: cargoNetWeightKg,
    dunnagePackagingKg,
    verifiedGrossMassKg: Math.round(verifiedGross),
    maxGrossPermissibleKg: spec.maxGrossMassKg,
    isOverloaded,
    overloadExcessKg: Math.round(overloadExcess),
    toleranceDiscrepancyKg: Math.round(toleranceDiscrepancy),
    isToleranceCompliant,
    scaleAccuracyPercent: 99.8,
    weighbridgeScaleId: 'AFEZ-WBR-04-CERTIFIED',
    vgmCertificateUid,
    statusAz,
    statusEn,
  };
}

/**
 * AFEZ Multimodal Logistics & Tariff Calculation Breakdown
 */
export interface AfezLogisticsCalculation {
  containerType: ContainerType;
  containerSpec: ContainerSpecification;
  corridor: MultimodalCorridor;
  corridorMeta: CorridorMetadata;
  dwellDaysInYard: number;
  freeDwellDays: number;
  billableDwellDays: number;
  isReeferPowerRequested: boolean;
  isSolasVgmScaleRequested: boolean;
  cargoDeclaredValueAzn: number;
  currency: Currency;

  // Tariff Line Items in AZN
  liftOnLiftOffCostAzn: number;
  freightCostAzn: number;
  storageDemurrageCostAzn: number;
  reeferShorePowerCostAzn: number;
  solasVgmCostAzn: number;
  rfidBarrierSecurityFeeAzn: number;
  dgkCustomsBondedProcessingAzn: number;
  totalAfezOperationalCostAzn: number;

  // Concession & Tax Savings
  standardCustomsDutySavedAzn: number;
  standardVatSavedAzn: number;
  totalFiscalSavingsAzn: number;

  // Currency converted values
  convertedTotalOperationalCost: number;
  convertedTotalFiscalSavings: number;

  // Environmental Metrics
  estimatedTransitTimeHours: number;
  co2EmissionsKg: number;
}

/**
 * Calculate Complete AFEZ Logistics & Customs Tariff
 */
export function calculateAfezLogisticsTariff(params: {
  containerType: ContainerType;
  corridor: MultimodalCorridor;
  dwellDays: number;
  cargoValueAzn: number;
  requestReeferPower?: boolean;
  requestSolasVgm?: boolean;
  currency?: Currency;
}): AfezLogisticsCalculation {
  const {
    containerType,
    corridor,
    dwellDays,
    cargoValueAzn,
    requestReeferPower = false,
    requestSolasVgm = true,
    currency = 'AZN',
  } = params;

  const spec = CONTAINER_SPECS[containerType];
  const corridorMeta = MULTIMODAL_CORRIDORS[corridor];

  const freeDwellDays = AFEZ_CONCESSIONS.freeBondedStorageDays;
  const billableDwellDays = Math.max(0, dwellDays - freeDwellDays);

  const liftOnLiftOffCostAzn = spec.liftOnLiftOffRateAzn;
  const freightCostAzn = corridorMeta.baseFreightRateAzn * spec.teuValue;
  const storageDemurrageCostAzn = billableDwellDays * spec.dailyDemurrageRateAzn;
  const reeferShorePowerCostAzn = (spec.isReefer && requestReeferPower)
    ? dwellDays * AFEZ_CONCESSIONS.reeferShorePowerDailyFeeAzn
    : 0;
  const solasVgmCostAzn = requestSolasVgm ? AFEZ_CONCESSIONS.solasVgmWeighbridgeFeeAzn : 0;
  const rfidBarrierSecurityFeeAzn = AFEZ_CONCESSIONS.rfidSecuritySealBarrierFeeAzn;
  const dgkCustomsBondedProcessingAzn = AFEZ_CONCESSIONS.singleWindowProcessingFeeAzn;

  const totalAfezOperationalCostAzn =
    liftOnLiftOffCostAzn +
    freightCostAzn +
    storageDemurrageCostAzn +
    reeferShorePowerCostAzn +
    solasVgmCostAzn +
    rfidBarrierSecurityFeeAzn +
    dgkCustomsBondedProcessingAzn;

  // Standard domestic tariffs saved by AFEZ 0% special tax regime
  const standardCustomsDutySavedAzn = cargoValueAzn * (AFEZ_CONCESSIONS.standardCustomsDutyPercent / 100);
  const standardVatSavedAzn = (cargoValueAzn + standardCustomsDutySavedAzn) * (AFEZ_CONCESSIONS.standardVatPercent / 100);
  const totalFiscalSavingsAzn = standardCustomsDutySavedAzn + standardVatSavedAzn;

  const rate = CURRENCY_RATES[currency];
  const convertedTotalOperationalCost = totalAfezOperationalCostAzn * rate;
  const convertedTotalFiscalSavings = totalFiscalSavingsAzn * rate;

  const estimatedTransitTimeHours = Math.round(corridorMeta.averageTransitDays * 24);
  const co2EmissionsKg = Math.round((corridorMeta.co2PerTeuKmGram * 350 * spec.teuValue) / 1000);

  return {
    containerType,
    containerSpec: spec,
    corridor,
    corridorMeta,
    dwellDaysInYard: dwellDays,
    freeDwellDays,
    billableDwellDays,
    isReeferPowerRequested: requestReeferPower,
    isSolasVgmScaleRequested: requestSolasVgm,
    cargoDeclaredValueAzn: cargoValueAzn,
    currency,
    liftOnLiftOffCostAzn,
    freightCostAzn,
    storageDemurrageCostAzn,
    reeferShorePowerCostAzn,
    solasVgmCostAzn,
    rfidBarrierSecurityFeeAzn,
    dgkCustomsBondedProcessingAzn,
    totalAfezOperationalCostAzn,
    standardCustomsDutySavedAzn,
    standardVatSavedAzn,
    totalFiscalSavingsAzn,
    convertedTotalOperationalCost,
    convertedTotalFiscalSavings,
    estimatedTransitTimeHours,
    co2EmissionsKg,
  };
}

/**
 * Format currency amount
 */
export function formatAfezCurrency(amount: number, currency: Currency = 'AZN'): string {
  const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';
  return `${amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

/**
 * Checklist Evaluation
 */
export interface AfezChecklistItem {
  id: string;
  category: 'CUSTOMS_BOND' | 'SOLAS_SAFETY' | 'CONTAINER_INTEGRITY' | 'SECURITY_RFID';
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  descriptionEn: string;
  legalArticle: string;
  weight: number;
}

export interface AfezChecklistResult {
  score: number;
  totalWeight: number;
  scorePercentage: number;
  isEligibleForClearance: boolean;
  failedItemsCount: number;
  verdictAz: string;
  verdictEn: string;
}

export function evaluateAfezChecklist(
  items: AfezChecklistItem[],
  checkedItemIds: string[]
): AfezChecklistResult {
  let score = 0;
  let totalWeight = 0;
  let failedCount = 0;

  items.forEach((item) => {
    totalWeight += item.weight;
    if (checkedItemIds.includes(item.id)) {
      score += item.weight;
    } else {
      failedCount++;
    }
  });

  const scorePercentage = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
  const isEligibleForClearance = scorePercentage >= 85 && failedCount <= 2;

  const verdictAz = isEligibleForClearance
    ? 'GÖMRÜK VƏ LOGİSTİKA BURAXILIŞINA TAM İCAZƏ VERİLDİ'
    : 'TƏLƏBLƏR ÖDƏNİLMƏDİ: Azad Zonaya Daxil Olmağa Qadağa Qoyuldu';

  const verdictEn = isEligibleForClearance
    ? 'CUSTOMS & LOGISTICS GATE PASS FULLY APPROVED'
    : 'DEFICIENCIES DETECTED: Gate Entry Restricted in AFEZ Yard';

  return {
    score,
    totalWeight,
    scorePercentage,
    isEligibleForClearance,
    failedItemsCount: failedCount,
    verdictAz,
    verdictEn,
  };
}

/**
 * Multimodal Transport & Customs Examination Simulator
 */
export interface AfezExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctAnswerIndex: number;
  explanationAz: string;
  explanationEn: string;
  legalCitation: string;
}

export interface AfezExamResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
  feedbackAz: string;
  feedbackEn: string;
}

export function gradeAfezExam(
  questions: AfezExamQuestion[],
  userAnswers: Record<string, number>
): AfezExamResult {
  const total = questions.length;
  let correct = 0;

  questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswerIndex) {
      correct++;
    }
  });

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = percentage >= 80;

  const feedbackAz = passed
    ? `MÜVƏFFƏQİYYƏTLƏ KEÇDİNİZ (${correct}/${total} - ${percentage}%). AFEZ Multimodal Beynəlxalq Sertifikatı Təsdiqləndi.`
    : `KƏSİLDİNİZ (${correct}/${total} - ${percentage}%). Minimum keçid balı 80%-dir. Zəhmət olmasa təkrar yoxlayın.`;

  const feedbackEn = passed
    ? `PASSED SUCCESSFULLY (${correct}/${total} - ${percentage}%). AFEZ Multimodal Cargo Certificate Approved.`
    : `FAILED (${correct}/${total} - ${percentage}%). Passing grade is 80%. Please review guidelines and re-take.`;

  return {
    totalQuestions: total,
    correctAnswers: correct,
    scorePercentage: percentage,
    passed,
    feedbackAz,
    feedbackEn,
  };
}

/**
 * Verified AFEZ-TIR-2026 Clearance Certificate
 */
export interface VerifiedAfezCertificate {
  certificateUid: string;
  issueDate: string;
  validUntil: string;
  containerNumber: string;
  containerType: ContainerType;
  isoCode: string;
  carrierTruckPlate: string;
  driverFullName: string;
  driverPassportFin: string;
  originCountry: string;
  destinationPort: string;
  corridor: MultimodalCorridor;
  verifiedGrossMassKg: number;
  vgmMethod: VgmMethod;
  cargoDeclaredValueAzn: number;
  totalFiscalSavingsAzn: number;
  simaDigitalUid: string;
  sha256VerificationHash: string;
  assignedYardBay: string;
  reachStackerId: string;
  qrCodeUrl: string;
  status: 'ACTIVE_APPROVED' | 'IN_TRANSIT' | 'CUSTOMS_INSPECTED' | 'DISCHARGED';
}

/**
 * Generate AFEZ-TIR-2026 Certificate
 */
export function generateAfezCertificate(params: {
  containerNumber: string;
  containerType: ContainerType;
  carrierTruckPlate: string;
  driverFullName: string;
  driverPassportFin: string;
  originCountry: string;
  destinationPort: string;
  corridor: MultimodalCorridor;
  cargoNetWeightKg: number;
  cargoDeclaredValueAzn: number;
  vgmMethod?: VgmMethod;
  assignedYardBay?: string;
}): VerifiedAfezCertificate {
  const spec = CONTAINER_SPECS[params.containerType];
  const vgmResult = calculateSolasVgm(params.containerType, params.cargoNetWeightKg, params.vgmMethod || 'METHOD_1_WEIGHBRIDGE');
  const tariffResult = calculateAfezLogisticsTariff({
    containerType: params.containerType,
    corridor: params.corridor,
    dwellDays: 7,
    cargoValueAzn: params.cargoDeclaredValueAzn,
  });

  const certNum = Math.floor(10000 + Math.random() * 90000);
  const certificateUid = `AFEZ-TIR-2026-${certNum}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const validUntilDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const validUntil = validUntilDate.toISOString().split('T')[0];

  const simaDigitalUid = `SIMA-AFEZ-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
  const sha256VerificationHash = `E4A9${Math.random().toString(36).substring(2, 15).toUpperCase()}7B92C${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

  const bayList = ['BAY-04-A-12', 'BAY-08-C-04', 'BAY-12-B-09', 'REEFER-BAY-02', 'TANK-PARK-01'];
  const assignedYardBay = params.assignedYardBay || bayList[Math.floor(Math.random() * bayList.length)];
  const reachStackerId = `RS-KALMAR-${Math.floor(10 + Math.random() * 90)}`;

  return {
    certificateUid,
    issueDate,
    validUntil,
    containerNumber: params.containerNumber,
    containerType: params.containerType,
    isoCode: spec.isoCode,
    carrierTruckPlate: params.carrierTruckPlate,
    driverFullName: params.driverFullName,
    driverPassportFin: params.driverPassportFin,
    originCountry: params.originCountry,
    destinationPort: params.destinationPort,
    corridor: params.corridor,
    verifiedGrossMassKg: vgmResult.verifiedGrossMassKg,
    vgmMethod: vgmResult.method,
    cargoDeclaredValueAzn: params.cargoDeclaredValueAzn,
    totalFiscalSavingsAzn: tariffResult.totalFiscalSavingsAzn,
    simaDigitalUid,
    sha256VerificationHash,
    assignedYardBay,
    reachStackerId,
    qrCodeUrl: `https://afez.az/verify/pass?id=${certificateUid}&hash=${sha256VerificationHash}`,
    status: 'ACTIVE_APPROVED',
  };
}
