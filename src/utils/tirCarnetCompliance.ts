/**
 * DGK, BDYP & FHN International TIR Carnet, Cross-Border Freight Customs Transit,
 * ADR Dangerous Goods Transport Safety, Gamma/X-Ray Cargo Telemetry & "Yaşıl Dəhliz" Engine
 *
 * Adheres to:
 * - Geneva TIR Convention 1975 & IRU / ABADA Regulations
 * - Customs Code of the Republic of Azerbaijan (Articles 184–210: Transit Customs Regime)
 * - UN ADR European Agreement Concerning the International Carriage of Dangerous Goods by Road
 * - Law of Azerbaijan on Transport of Dangerous Goods
 * - Cabinet of Ministers Decisions on Customs Duties and Fees
 * - Presidential Decree on "Yaşıl Dəhliz" (Green Corridor) Priority Clearance System
 * - EN 3 / EN ISO 20471 / ISO 17712 High Security Customs Seals
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD (1.70 AZN / USD)
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR (1.84 AZN / EUR)
};

export type AdrHazardClass =
  | 'NONE'
  | 'CLASS_1' // Explosives (Partlayıcı maddələr)
  | 'CLASS_2' // Gases: Compressed/liquefied (Qazlar)
  | 'CLASS_3' // Flammable liquids (Alışan mayelər)
  | 'CLASS_4' // Flammable solids (Alışan bərk maddələr)
  | 'CLASS_5' // Oxidizers & organic peroxides (Oksidləşdiricilər)
  | 'CLASS_6' // Toxic & infectious substances (Zəhərli maddələr)
  | 'CLASS_7' // Radioactive materials (Radioaktiv materiallar)
  | 'CLASS_8' // Corrosive substances (Aşındırıcı maddələr)
  | 'CLASS_9'; // Miscellaneous dangerous goods (Digər təhlükəli maddələr)

export type AdrVehicleType = 'STANDARD' | 'EX_II' | 'EX_III' | 'FL' | 'AT' | 'MEMU';

export type GreenCorridorStatus = 'GREEN' | 'BLUE' | 'YELLOW' | 'RED';

export type TirVoletType = 'VOLET_4' | 'VOLET_6' | 'VOLET_14' | 'VOLET_20';

export interface AdrClassMetadata {
  id: AdrHazardClass;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  unExamples: string[];
  requiresPoliceEscort: boolean;
  requiresFhnEscort: boolean;
  specialPermitFeeAzn: number;
}

export const ADR_CLASSES_INFO: Record<AdrHazardClass, AdrClassMetadata> = {
  NONE: {
    id: 'NONE',
    code: 'GENERAL',
    nameAz: 'Ümumi Yük (Qeyri-Təhlükəli)',
    nameEn: 'General Freight (Non-Hazardous)',
    nameRu: 'Общий груз (Неопасный)',
    unExamples: ['N/A (Standard palletized / consumer goods)'],
    requiresPoliceEscort: false,
    requiresFhnEscort: false,
    specialPermitFeeAzn: 0,
  },
  CLASS_1: {
    id: 'CLASS_1',
    code: 'ADR-1',
    nameAz: 'Sinif 1: Partlayıcı Maddələr və Məmulatlar',
    nameEn: 'Class 1: Explosives & Pyrotechnics',
    nameRu: 'Класс 1: Взрывчатые вещества и изделия',
    unExamples: ['UN 0027 (Qara barıt)', 'UN 0336 (Pirotexnika)', 'UN 0081 (Partlayıcı maddə B tipi)'],
    requiresPoliceEscort: true,
    requiresFhnEscort: true,
    specialPermitFeeAzn: 250,
  },
  CLASS_2: {
    id: 'CLASS_2',
    code: 'ADR-2',
    nameAz: 'Sinif 2: Sıxılmış, Mayeləşdirilmiş Qazlar',
    nameEn: 'Class 2: Compressed & Liquefied Gases',
    nameRu: 'Класс 2: Сжатые и сжиженные газы',
    unExamples: ['UN 1978 (Propan)', 'UN 1075 (LPG)', 'UN 1005 (Susuz ammonyak)', 'UN 1066 (Azot)'],
    requiresPoliceEscort: false,
    requiresFhnEscort: true,
    specialPermitFeeAzn: 120,
  },
  CLASS_3: {
    id: 'CLASS_3',
    code: 'ADR-3',
    nameAz: 'Sinif 3: Tez Alışan Mayelər',
    nameEn: 'Class 3: Flammable Liquids',
    nameRu: 'Класс 3: Легковоспламеняющиеся жидкости',
    unExamples: ['UN 1202 (Dizel yanacağı)', 'UN 1203 (Benzin / Motor spirti)', 'UN 1170 (Etanol)'],
    requiresPoliceEscort: false,
    requiresFhnEscort: false,
    specialPermitFeeAzn: 80,
  },
  CLASS_4: {
    id: 'CLASS_4',
    code: 'ADR-4',
    nameAz: 'Sinif 4: Alışan Bərk Maddələr & Öz-özünə Alışanlar',
    nameEn: 'Class 4: Flammable Solids & Self-Reactive',
    nameRu: 'Класс 4: Легковоспламеняющиеся твердые вещества',
    unExamples: ['UN 1325 (Üzvi alışan bərk)', 'UN 1361 (Kömür tozu)', 'UN 1408 (Ferosilisium)'],
    requiresPoliceEscort: false,
    requiresFhnEscort: false,
    specialPermitFeeAzn: 70,
  },
  CLASS_5: {
    id: 'CLASS_5',
    code: 'ADR-5',
    nameAz: 'Sinif 5: Oksidləşdirici Maddələr & Üzvi Peroksidlər',
    nameEn: 'Class 5: Oxidizing Substances & Organic Peroxides',
    nameRu: 'Класс 5: Окисляющие вещества и оргпероксиды',
    unExamples: ['UN 1942 (Ammonium nitrat)', 'UN 2014 (Hidrogen peroksid 20-60%)'],
    requiresPoliceEscort: false,
    requiresFhnEscort: true,
    specialPermitFeeAzn: 100,
  },
  CLASS_6: {
    id: 'CLASS_6',
    code: 'ADR-6',
    nameAz: 'Sinif 6: Zəhərli və Yoluxucu Maddələr',
    nameEn: 'Class 6: Toxic & Infectious Substances',
    nameRu: 'Класс 6: Токсичные и инфекционные вещества',
    unExamples: ['UN 1689 (Natrium sianid)', 'UN 2810 (Zəhərli maye üzvi)', 'UN 3373 (Bioloji maddə B)'],
    requiresPoliceEscort: false,
    requiresFhnEscort: true,
    specialPermitFeeAzn: 140,
  },
  CLASS_7: {
    id: 'CLASS_7',
    code: 'ADR-7',
    nameAz: 'Sinif 7: Radioaktiv Materiallar',
    nameEn: 'Class 7: Radioactive Material',
    nameRu: 'Класс 7: Радиоактивные материалы',
    unExamples: ['UN 2915 (A Tipli qablaşdırma)', 'UN 2916 (B(U) Tipli qablaşdırma)'],
    requiresPoliceEscort: true,
    requiresFhnEscort: true,
    specialPermitFeeAzn: 350,
  },
  CLASS_8: {
    id: 'CLASS_8',
    code: 'ADR-8',
    nameAz: 'Sinif 8: Aşındırıcı (Korroziyalı) Maddələr',
    nameEn: 'Class 8: Corrosive Substances',
    nameRu: 'Класс 8: Коррозионные вещества',
    unExamples: ['UN 1789 (Xlorid turşusu)', 'UN 1830 (Kükürd turşusu)', 'UN 1824 (Natrium hidroksid)'],
    requiresPoliceEscort: false,
    requiresFhnEscort: false,
    specialPermitFeeAzn: 90,
  },
  CLASS_9: {
    id: 'CLASS_9',
    code: 'ADR-9',
    nameAz: 'Sinif 9: Müxtəlif Təhlükəli Maddələr & Litium Batareyalar',
    nameEn: 'Class 9: Miscellaneous Dangerous Goods & Li-Ion',
    nameRu: 'Класс 9: Прочие опасные вещества и литиевые батареи',
    unExamples: ['UN 3480 (Litium-ion akkumulyatorları)', 'UN 3077 (Ətraf mühit üçün təhlükəli bərk)'],
    requiresPoliceEscort: false,
    requiresFhnEscort: false,
    specialPermitFeeAzn: 60,
  },
};

export interface CustomsBorderCheckpoint {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  country: 'RUSSIA' | 'GEORGIA' | 'IRAN' | 'TURKEY' | 'CASPIAN_SEA';
  highwayCorridor: string;
  distanceFromBakuKm: number;
  activeTruckQueue: number;
  averageClearanceHours: number;
  greenCorridorFastTrackMinutes: number;
  hasXRayHcvp: boolean;
  xrayScannerModel: string;
  radiationPortalMonitorActive: boolean;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED';
}

export interface FreightPreset {
  id: string;
  tractorPlate: string;
  trailerPlate: string;
  carrierName: string;
  driverFullName: string;
  driverFin: string;
  tirCarnetNumber: string;
  tirVolets: TirVoletType;
  greenCorridorStatus: GreenCorridorStatus;
  adrClass: AdrHazardClass;
  adrVehicleType: AdrVehicleType;
  cargoDescription: string;
  cargoWeightTon: number;
  declaredValueAzn: number;
  borderCheckpointId: string;
  customsSealNumber: string;
  isElectronicSeal: boolean;
}

export interface XRayTelemetry {
  scannerModel: string;
  scannedAt: string;
  penetrationDepthMm: number;
  maxPenetrationLimitMm: number;
  effectiveAtomicNumberZ: number; // Organic: 6-10 (orange), Inorganic/metals: 11-20 (green), Heavy metals: 21+ (blue)
  materialCategory: 'ORGANIC' | 'INORGANIC_ALUMINUM' | 'HEAVY_STEEL_COPPER' | 'DENSE_LEAD_TUNGSTEN';
  radiationDosimeterMicroSvPerHour: number; // Normal background: 0.08 - 0.15 µSv/h, Alert: > 0.25 µSv/h
  isRadiationSafe: boolean;
  anomalyDetected: boolean;
  anomalyDescription?: string;
  sealIntegrityStatus: 'INTACT_VERIFIED' | 'TAMPER_ALERT' | 'BYPASS_DETECTED';
  overallInspectionResult: 'CLEARED' | 'SECONDARY_PHYSICAL_SEARCH_REQUIRED' | 'SEIZED';
}

export interface SafetyChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  category: 'DOCS' | 'ADR_EQUIPMENT' | 'SECURITY_SEAL' | 'FIRE_SAFETY';
  isMandatory: boolean;
  legalBasis: string;
}

export interface TheoreticalExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  explanationRu: string;
  legalCitation: string;
}

export interface TirTransitCalculationInput {
  declaredCargoValueAzn: number;
  cargoWeightTon: number;
  tirVolets: TirVoletType;
  greenCorridorStatus: GreenCorridorStatus;
  adrClass: AdrHazardClass;
  isElectronicGpsSeal: boolean;
  requiresEscort: boolean;
}

export interface TirTransitCalculationResult {
  customsDutyAzn: number;
  customsDutyUsd: number;
  customsDutyEur: number;
  tirCarnetFeeAzn: number;
  xrayScanFeeAzn: number;
  electronicSealFeeAzn: number;
  adrSpecialPermitFeeAzn: number;
  policeFhnEscortFeeAzn: number;
  vat18Azn: number;
  totalPayableAzn: number;
  totalPayableUsd: number;
  totalPayableEur: number;
  standardBorderWaitHours: number;
  greenCorridorWaitHours: number;
  timeSavedHours: number;
  guaranteeCeilingEur: number;
  riskCategoryScore: number; // 0-100 (lower is safer)
}

export interface ETransitCertificate {
  certificateId: string;
  tirCarnetNumber: string;
  issueDate: string;
  validUntil: string;
  carrierName: string;
  tractorPlate: string;
  trailerPlate: string;
  driverFullName: string;
  driverFin: string;
  greenCorridorTier: GreenCorridorStatus;
  adrHazardClass: AdrHazardClass;
  originCheckpoint: string;
  destinationCustoms: string;
  customsSealSerial: string;
  isElectronicGpsSeal: boolean;
  xrayInspectionStatus: 'PASSED_CLEARED' | 'EXEMPT_GREEN_CORRIDOR' | 'AUDITED';
  radiationDosimeterMicroSv: number;
  totalTransitFeeAzn: number;
  securityChecksumSha256: string;
  simaDigitalSignUid: string;
  verifiedInUnifiedRegistry: boolean;
}

/**
 * Calculates statutory customs duties, fees, and time savings
 */
export function calculateTirTransitCost(
  input: TirTransitCalculationInput,
  currency: Currency = 'AZN'
): TirTransitCalculationResult {
  // Customs clearance duty based on declared value (AR Cabinet of Ministers schedule)
  let baseDutyAzn = 30; // Min up to 1,000 AZN
  const val = Math.max(0, input.declaredCargoValueAzn);

  if (val > 1000 && val <= 10000) {
    baseDutyAzn = 60;
  } else if (val > 10000 && val <= 50000) {
    baseDutyAzn = 120;
  } else if (val > 50000 && val <= 100000) {
    baseDutyAzn = 200;
  } else if (val > 100000) {
    baseDutyAzn = 300 + Math.floor((val - 100000) / 100000) * 50;
    if (baseDutyAzn > 1000) baseDutyAzn = 1000;
  }

  // Weight surcharge for extra heavy freight (>24 ton)
  if (input.cargoWeightTon > 24) {
    baseDutyAzn += Math.round((input.cargoWeightTon - 24) * 8);
  }

  // TIR Carnet administrative fee by volet tier
  let tirCarnetFeeAzn = 45;
  if (input.tirVolets === 'VOLET_6') tirCarnetFeeAzn = 65;
  if (input.tirVolets === 'VOLET_14') tirCarnetFeeAzn = 110;
  if (input.tirVolets === 'VOLET_20') tirCarnetFeeAzn = 150;

  // X-Ray scanning fee (40 AZN standard, 0 for Green Corridor trusted operators)
  const xrayScanFeeAzn = input.greenCorridorStatus === 'GREEN' ? 0 : 40;

  // Electronic GPS/GSM customs seal rental & satellite geo-fencing (45 AZN vs 15 AZN standard mechanical)
  const electronicSealFeeAzn = input.isElectronicGpsSeal ? 45 : 15;

  // ADR special dangerous goods permit fee
  const adrMeta = ADR_CLASSES_INFO[input.adrClass];
  const adrSpecialPermitFeeAzn = adrMeta.specialPermitFeeAzn;

  // Police / FHN escort fee (if required or selected)
  let policeFhnEscortFeeAzn = 0;
  if (adrMeta.requiresPoliceEscort || input.requiresEscort) {
    policeFhnEscortFeeAzn += 220;
  }
  if (adrMeta.requiresFhnEscort && input.adrClass !== 'NONE') {
    policeFhnEscortFeeAzn += 130;
  }

  // Subtotal and VAT (18%) on service fees (excluding state duty)
  const taxableServices = tirCarnetFeeAzn + xrayScanFeeAzn + electronicSealFeeAzn + policeFhnEscortFeeAzn;
  const vat18Azn = Math.round(taxableServices * 0.18 * 100) / 100;

  // Total in AZN
  let totalPayableAzn =
    baseDutyAzn + tirCarnetFeeAzn + xrayScanFeeAzn + electronicSealFeeAzn + adrSpecialPermitFeeAzn + policeFhnEscortFeeAzn + vat18Azn;

  // Green Corridor discount (15% reduction on administrative processing)
  if (input.greenCorridorStatus === 'GREEN') {
    totalPayableAzn = Math.round(totalPayableAzn * 0.85 * 100) / 100;
  }

  // Currency conversions
  const rate = CURRENCY_RATES[currency] || 1.0;
  const totalPayableCur = Math.round(totalPayableAzn * rate * 100) / 100;
  const customsDutyUsd = Math.round(baseDutyAzn * CURRENCY_RATES.USD * 100) / 100;
  const customsDutyEur = Math.round(baseDutyAzn * CURRENCY_RATES.EUR * 100) / 100;

  // Wait time comparison
  const standardBorderWaitHours = 9.5;
  const greenCorridorWaitHours =
    input.greenCorridorStatus === 'GREEN' ? 0.45 : input.greenCorridorStatus === 'BLUE' ? 1.5 : input.greenCorridorStatus === 'YELLOW' ? 4.0 : 8.5;
  const timeSavedHours = Math.max(0, Math.round((standardBorderWaitHours - greenCorridorWaitHours) * 10) / 10);

  // Guarantee ceiling under IRU / ABADA TIR convention
  const guaranteeCeilingEur = 100000;

  // Risk Score calculation (0 to 100)
  let riskScore = 15;
  if (input.greenCorridorStatus === 'RED') riskScore += 40;
  if (input.greenCorridorStatus === 'YELLOW') riskScore += 20;
  if (input.greenCorridorStatus === 'BLUE') riskScore += 5;
  if (input.greenCorridorStatus === 'GREEN') riskScore = 8;

  if (input.adrClass === 'CLASS_1' || input.adrClass === 'CLASS_7') riskScore += 35;
  else if (input.adrClass !== 'NONE') riskScore += 15;

  if (input.isElectronicGpsSeal) riskScore = Math.max(5, riskScore - 10);
  if (riskScore > 100) riskScore = 100;

  return {
    customsDutyAzn: baseDutyAzn,
    customsDutyUsd,
    customsDutyEur,
    tirCarnetFeeAzn,
    xrayScanFeeAzn,
    electronicSealFeeAzn,
    adrSpecialPermitFeeAzn,
    policeFhnEscortFeeAzn,
    vat18Azn,
    totalPayableAzn,
    totalPayableUsd: Math.round(totalPayableAzn * CURRENCY_RATES.USD * 100) / 100,
    totalPayableEur: Math.round(totalPayableAzn * CURRENCY_RATES.EUR * 100) / 100,
    standardBorderWaitHours,
    greenCorridorWaitHours,
    timeSavedHours,
    guaranteeCeilingEur,
    riskCategoryScore: riskScore,
  };
}

/**
 * Evaluates X-Ray Cargo Scanning Telemetry
 */
export function evaluateXRayScanTelemetry(
  effectiveAtomicNumberZ: number,
  dosimeterMicroSvPerHour: number,
  sealTampered: boolean
): XRayTelemetry {
  let materialCat: XRayTelemetry['materialCategory'] = 'ORGANIC';
  let anomalyDetected = false;
  let anomalyDescription = undefined;

  if (effectiveAtomicNumberZ <= 10) {
    materialCat = 'ORGANIC';
  } else if (effectiveAtomicNumberZ <= 20) {
    materialCat = 'INORGANIC_ALUMINUM';
  } else if (effectiveAtomicNumberZ <= 50) {
    materialCat = 'HEAVY_STEEL_COPPER';
  } else {
    materialCat = 'DENSE_LEAD_TUNGSTEN';
    anomalyDetected = true;
    anomalyDescription = 'Yüksək sıxlıqlı qurğuşun ekranlaşdırma qatı aşkar edildi (High density shielding).';
  }

  const isRadiationSafe = dosimeterMicroSvPerHour <= 0.25;
  if (!isRadiationSafe) {
    anomalyDetected = true;
    anomalyDescription = `Radiasiya fonu normanı aşır: ${dosimeterMicroSvPerHour} µSv/h (Threshold: 0.25 µSv/h).`;
  }

  const sealStatus: XRayTelemetry['sealIntegrityStatus'] = sealTampered ? 'TAMPER_ALERT' : 'INTACT_VERIFIED';
  if (sealTampered) {
    anomalyDetected = true;
    anomalyDescription = 'Gömrük elektron möhürünün / kabelinin qırılması və ya fiziki müdaxilə siqnalı!';
  }

  let overallResult: XRayTelemetry['overallInspectionResult'] = 'CLEARED';
  if (anomalyDetected) {
    overallResult = !isRadiationSafe || sealTampered ? 'SEIZED' : 'SECONDARY_PHYSICAL_SEARCH_REQUIRED';
  }

  return {
    scannerModel: 'Nuctech HCVP / Rapiscan Eagle M60 Dual-Energy X-Ray',
    scannedAt: new Date().toISOString(),
    penetrationDepthMm: Math.min(380, 250 + Math.round(effectiveAtomicNumberZ * 4)),
    maxPenetrationLimitMm: 400,
    effectiveAtomicNumberZ,
    materialCategory: materialCat,
    radiationDosimeterMicroSvPerHour: dosimeterMicroSvPerHour,
    isRadiationSafe,
    anomalyDetected,
    anomalyDescription,
    sealIntegrityStatus: sealStatus,
    overallInspectionResult: overallResult,
  };
}

/**
 * Calculates checklist completion score and validation
 */
export function evaluateSafetyChecklist(
  checkedItemIds: string[],
  totalItems: SafetyChecklistItem[]
): {
  passedCount: number;
  totalCount: number;
  completionPercentage: number;
  allMandatoryPassed: boolean;
  missingMandatoryIds: string[];
} {
  const checkedSet = new Set(checkedItemIds);
  let passedCount = 0;
  const missingMandatoryIds: string[] = [];

  totalItems.forEach((item) => {
    if (checkedSet.has(item.id)) {
      passedCount++;
    } else if (item.isMandatory) {
      missingMandatoryIds.push(item.id);
    }
  });

  const completionPercentage = totalItems.length > 0 ? Math.round((passedCount / totalItems.length) * 100) : 0;

  return {
    passedCount,
    totalCount: totalItems.length,
    completionPercentage,
    allMandatoryPassed: missingMandatoryIds.length === 0,
    missingMandatoryIds,
  };
}

/**
 * Evaluates theoretical exam score
 */
export function evaluateTheoreticalExam(
  answers: Record<number, number>,
  questions: TheoreticalExamQuestion[]
): {
  score: number;
  totalQuestions: number;
  passed: boolean;
  percentage: number;
  details: Array<{ questionId: number; isCorrect: boolean }>;
} {
  let score = 0;
  const details = questions.map((q) => {
    const isCorrect = answers[q.id] === q.correctOptionIndex;
    if (isCorrect) score++;
    return { questionId: q.id, isCorrect };
  });

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = score >= 8; // 8 out of 10 threshold (80%)

  return {
    score,
    totalQuestions: questions.length,
    passed,
    percentage,
    details,
  };
}

/**
 * Generates official DGK-TIR-2026 Electronic International Customs Transit Certificate
 */
export function generateETransitCertificate(
  preset: FreightPreset,
  calcResult: TirTransitCalculationResult,
  destinationCustoms: string = 'Bakı Baş Gömrük İdarəsi (İpək Yolu Terminalı)'
): ETransitCertificate {
  const randSeq = Math.floor(10000 + Math.random() * 90000);
  const certId = `DGK-TIR-2026-${randSeq}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];

  const expiry = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days international transit window
  const validUntil = expiry.toISOString().split('T')[0];

  // Cryptographic simulation checksum
  const seed = `${certId}-${preset.tractorPlate}-${preset.tirCarnetNumber}-${preset.cargoDescription}`;
  let hashVal = 0;
  for (let i = 0; i < seed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + seed.charCodeAt(i);
    hashVal |= 0;
  }
  const securityChecksumSha256 = `SHA256:DGK:${Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0')}:AZ${randSeq}`;
  const simaDigitalSignUid = `SIMA-GOV-AZ-${Math.abs(hashVal * 31).toString(16).toUpperCase().slice(0, 12)}`;

  return {
    certificateId: certId,
    tirCarnetNumber: preset.tirCarnetNumber,
    issueDate,
    validUntil,
    carrierName: preset.carrierName,
    tractorPlate: preset.tractorPlate,
    trailerPlate: preset.trailerPlate,
    driverFullName: preset.driverFullName,
    driverFin: preset.driverFin,
    greenCorridorTier: preset.greenCorridorStatus,
    adrHazardClass: preset.adrClass,
    originCheckpoint: preset.borderCheckpointId,
    destinationCustoms,
    customsSealSerial: preset.customsSealNumber,
    isElectronicGpsSeal: preset.isElectronicSeal,
    xrayInspectionStatus: preset.greenCorridorStatus === 'GREEN' ? 'EXEMPT_GREEN_CORRIDOR' : 'PASSED_CLEARED',
    radiationDosimeterMicroSv: 0.11,
    totalTransitFeeAzn: calcResult.totalPayableAzn,
    securityChecksumSha256,
    simaDigitalSignUid,
    verifiedInUnifiedRegistry: true,
  };
}
