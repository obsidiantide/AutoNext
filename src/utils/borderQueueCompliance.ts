/**
 * Official State Border Service (DSX - Dövlət Sərhəd Xidməti),
 * State Customs Committee (DGK - Dövlət Gömrük Komitəsi) &
 * Main State Traffic Police Department (BDYP)
 * Cross-Border Commercial Vehicle e-Queue (Sərhəd Buraxılış Məntəqəsi Elektron Növbə),
 * Smart Frontier Buffer Zone Telemetry, Biometric Driver e-Gate Verification &
 * Official BORDER-QUEUE-AZ-2026 Transit Clearance Portal Compliance Engine
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On State Border" ("Azərbaycan Respublikasının Dövlət Sərhədi Haqqında" Qanun):
 *   * Maddə 8: Dövlət sərhədindən buraxılış məntəqələri və beynəlxalq nəqliyyat dəhlizləri
 *   * Maddə 12: Sərhəd nəzarəti, biometrik identifikasiya və elektron pasport nəzarəti e-Gate sistemləri
 *   * Maddə 19: Dövlət sərhədindən növbədənkənar və operativ buraxılış rejimləri (Yaşıl Dəhliz / Fast-Track)
 * - Customs Code of the Republic of Azerbaijan (Gömrük Məcəlləsi):
 *   * Maddə 184–210: Beynəlxalq gömrük tranziti və sərhəd yoxlama zonaları
 *   * Maddə 230: Sərhədkeçmə intellektual elektron növbə reyestri və tənzimləmə qaydaları
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *   * Maddə 482: Gömrük sərhədini keçmə qaydalarının pozulması (300–1,500 AZN cərimə)
 *   * Maddə 499: Tranzit yüklərin gömrük marşrutu və qrafikinə əməl edilməməsi (500–1,000 AZN cərimə)
 *   * Maddə 510: Dövlət sərhəd buraxılış məntəqəsində ictimai asayiş və növbə rejiminin pozulması (100–300 AZN cərimə)
 * - UNECE TIR Convention 1975 & WCO SAFE Framework of Standards
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
 * 7 Strategic Cross-Border Checkpoints (SBM - Sərhəd Buraxılış Məntəqələri)
 */
export type BorderCheckpointId =
  | 'BCP_SAMUR'
  | 'BCP_ASTARA'
  | 'BCP_MAZIMQARA'
  | 'BCP_BOYUK_KESIK'
  | 'BCP_BILASUVAR'
  | 'BCP_SAHTAXTI'
  | 'BCP_CULFA';

export interface BorderCheckpointInfo {
  id: BorderCheckpointId;
  nameAz: string;
  nameEn: string;
  neighborCountry: string;
  highwayCorridor: string;
  bufferZoneTotalSlots: number;
  currentActiveQueueTrucks: number;
  processingThroughputPerHour: number;
  averageSpeedPerTruckMins: number;
  biometricEGateLanes: number;
  eGateActive: boolean;
  greenLaneAvailable: boolean;
  adrHazmatAuthorized: boolean;
  latitude: number;
  longitude: number;
  contactEmergency: string;
}

/**
 * Commercial Freight Vehicle Types
 */
export type CommercialVehicleCategory =
  | 'TIR_SEMI_TRAILER'    // 40t Standart TIR Yarımqoşqu
  | 'REFRIGERATED_TRUCK'  // Refrijerator / Tez xarab olan kənd təsərrüfatı malları
  | 'TANKER_HAZMAT'       // ADR Maye/Kimyəvi Yanacaq Tankeri
  | 'FLATBED_OVERSIZE'    // Açıq Platforma / Ağır Qabaritli Yük
  | 'CONTAINER_CARRIER'   // Multimodal Dəniz/Dəmiryol Konteyner Daşıyıcı
  | 'LIGHT_COMMERCIAL';   // Kiçik Tonnajlı Yük Vanı / Pikap (≤3.5t)

export interface CommercialVehicleCategoryInfo {
  category: CommercialVehicleCategory;
  nameAz: string;
  nameEn: string;
  baseInspectionMins: number;
  statutoryBaseFeeAzn: number;
  descriptionAz: string;
}

export const COMMERCIAL_VEHICLE_INFO: Record<CommercialVehicleCategory, CommercialVehicleCategoryInfo> = {
  TIR_SEMI_TRAILER: {
    category: 'TIR_SEMI_TRAILER',
    nameAz: 'Standart TIR Yarımqoşqu (40t)',
    nameEn: 'Standard Semi-Trailer TIR (40t)',
    baseInspectionMins: 18,
    statutoryBaseFeeAzn: 40,
    descriptionAz: 'Ümumi çəkisi 40 tona qədər olan örtülü beynəlxalq yük daşıma avtoqatarı',
  },
  REFRIGERATED_TRUCK: {
    category: 'REFRIGERATED_TRUCK',
    nameAz: 'Soyuduculu Refrijerator (Tez xarab olan)',
    nameEn: 'Refrigerated Cold-Chain Reefer',
    baseInspectionMins: 12,
    statutoryBaseFeeAzn: 35,
    descriptionAz: 'Temperatur rejimi tələb edən qida, ət-süd və kənd təsərrüfatı məhsulları',
  },
  TANKER_HAZMAT: {
    category: 'TANKER_HAZMAT',
    nameAz: 'ADR Təhlükəli Yük Tankeri',
    nameEn: 'Hazmat ADR Dangerous Goods Tanker',
    baseInspectionMins: 25,
    statutoryBaseFeeAzn: 65,
    descriptionAz: 'Neft məhsulları, mayeləşdirilmiş qaz və kimyəvi xammal daşıyan sisternlər',
  },
  FLATBED_OVERSIZE: {
    category: 'FLATBED_OVERSIZE',
    nameAz: 'İriqabaritli / Açıq Platforma (Oversize)',
    nameEn: 'Oversize Flatbed Heavy Haulage',
    baseInspectionMins: 22,
    statutoryBaseFeeAzn: 75,
    descriptionAz: 'Texniki parametrləri standart qabariti aşan sənaye və inşaat avadanlıqları',
  },
  CONTAINER_CARRIER: {
    category: 'CONTAINER_CARRIER',
    nameAz: 'Multimodal Konteyner Daşıyıcı (20/40ft)',
    nameEn: 'Intermodal Container Carrier (20/40ft)',
    baseInspectionMins: 15,
    statutoryBaseFeeAzn: 45,
    descriptionAz: 'Beynəlxalq dəniz və dəmiryol intermodal konteyner daşımaları',
  },
  LIGHT_COMMERCIAL: {
    category: 'LIGHT_COMMERCIAL',
    nameAz: 'Yüngül Ticarət Vanı / Pikap (≤3.5t)',
    nameEn: 'Light Commercial Vehicle (LCV ≤3.5t)',
    baseInspectionMins: 10,
    statutoryBaseFeeAzn: 25,
    descriptionAz: 'Təcili poçt, kuryer və kiçik partiyalı kommersiya yükləri',
  },
};

/**
 * Cargo Transit Priority Tier
 */
export type CargoPriorityTier =
  | 'GREEN_LANE'       // Yaşıl Dəhliz / Priority 1 (Fast-Track)
  | 'ADR_EXPRESS'      // Təhlükəli Yüklər ADR / Priority 2
  | 'REGULAR_TRANSIT'  // Standart Tranzit / Priority 3
  | 'EMPTY_RETURN';    // Boş Qayıdış / Priority 4

export interface CargoPriorityTierInfo {
  tier: CargoPriorityTier;
  nameAz: string;
  nameEn: string;
  queueCoefficient: number; // multiplier for queue bypass
  fastTrackSurchargeAzn: number;
  descriptionAz: string;
}

export const CARGO_PRIORITY_INFO: Record<CargoPriorityTier, CargoPriorityTierInfo> = {
  GREEN_LANE: {
    tier: 'GREEN_LANE',
    nameAz: 'Yaşıl Dəhliz (Fast-Track Express)',
    nameEn: 'Green Lane Express (Fast-Track)',
    queueCoefficient: 0.25,
    fastTrackSurchargeAzn: 30,
    descriptionAz: 'AQTA sertifikatlı tez xarab olan qida, təzə meyvə-tərəvəz və humanitar tibbi yüklər',
  },
  ADR_EXPRESS: {
    tier: 'ADR_EXPRESS',
    nameAz: 'ADR Xüsusi Rejimli Dəhliz',
    nameEn: 'ADR Hazardous Cargo Priority',
    queueCoefficient: 0.50,
    fastTrackSurchargeAzn: 45,
    descriptionAz: 'FHN və BDYP müşayiəti tələb edən yüksək riskli təhlükəli maddələr',
  },
  REGULAR_TRANSIT: {
    tier: 'REGULAR_TRANSIT',
    nameAz: 'Standart Beynəlxalq Tranzit',
    nameEn: 'Standard International Transit',
    queueCoefficient: 1.0,
    fastTrackSurchargeAzn: 0,
    descriptionAz: 'Ümumi təyinatlı quru yük və sənaye malları üçün adi elektron növbə',
  },
  EMPTY_RETURN: {
    tier: 'EMPTY_RETURN',
    nameAz: 'Boş Avtoqatarın Dönüş Dəhlizi',
    nameEn: 'Empty Return Vehicle Corridor',
    queueCoefficient: 0.65,
    fastTrackSurchargeAzn: 0,
    descriptionAz: 'Yükünü boşaldıb qeydiyyat ölkəsinə qayıdan boş ticarət vasitələri',
  },
};

/**
 * Biometric Driver e-Gate Verification Telemetry
 */
export interface BiometricEGateTelemetry {
  driverFullName: string;
  driverFin: string;
  driverPassportNumber: string;
  driverNationality: string;
  facialRecognitionScore: number; // 0 - 100% (>= 85% required)
  fingerprintMatchScore: number;  // 0 - 100% (>= 90% required)
  driverLicenseVerified: boolean;
  entryVisaValid: boolean;
  breathalyzerPromille: number;   // 0.00 promille (must be <= 0.05 promille)
  eGateGateStatus: 'CLEARED' | 'FLAGGED_MANUAL_CHECK' | 'DENIED_ENTRY';
}

/**
 * Checkpoint Live Status & Buffer Zone Evaluation
 */
export interface CheckpointBufferEvaluation {
  checkpoint: BorderCheckpointInfo;
  occupancyPercentage: number;
  statusAz: string;
  statusLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL_CONGESTION';
  estimatedStandardWaitHours: number;
  estimatedFastTrackWaitHours: number;
  availableSlotsInZone: number;
}

export const evaluateCheckpointBuffer = (checkpoint: BorderCheckpointInfo): CheckpointBufferEvaluation => {
  const occupancyPercentage = Math.round(
    (checkpoint.currentActiveQueueTrucks / checkpoint.bufferZoneTotalSlots) * 100
  );

  let statusLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL_CONGESTION' = 'NORMAL';
  let statusAz = 'Sərbəst Keçid — Normal Rejim';

  if (occupancyPercentage >= 90) {
    statusLevel = 'CRITICAL_CONGESTION';
    statusAz = 'Kritik Sıxlıq — Bufer Zona Doludur';
  } else if (occupancyPercentage >= 65) {
    statusLevel = 'ELEVATED';
    statusAz = 'Yüksək Sıxlıq — Növbə Ləngiyir';
  }

  // Estimated standard wait time in hours
  const rawWaitHours = checkpoint.currentActiveQueueTrucks / Math.max(checkpoint.processingThroughputPerHour, 1);
  const estimatedStandardWaitHours = Math.round(rawWaitHours * 10) / 10;
  const estimatedFastTrackWaitHours = Math.round(rawWaitHours * 0.25 * 10) / 10;
  const availableSlotsInZone = Math.max(0, checkpoint.bufferZoneTotalSlots - checkpoint.currentActiveQueueTrucks);

  return {
    checkpoint,
    occupancyPercentage,
    statusAz,
    statusLevel,
    estimatedStandardWaitHours,
    estimatedFastTrackWaitHours,
    availableSlotsInZone,
  };
};

/**
 * Electronic Queue Slot Booking Calculation
 */
export interface QueueBookingCalculationParams {
  checkpoint: BorderCheckpointInfo;
  vehicleCategory: CommercialVehicleCategory;
  priorityTier: CargoPriorityTier;
  isNightSlot: boolean; // 22:00 - 06:00
  driverEGateCleared: boolean;
  currency: Currency;
}

export interface QueueBookingCalculationResult {
  baseFeeAzn: number;
  prioritySurchargeAzn: number;
  nightSurchargeAzn: number;
  eGateDiscountAzn: number; // 10 AZN discount if biometric e-gate pre-cleared
  totalFeeAzn: number;
  totalFeeSelectedCurrency: number;
  currency: Currency;
  estimatedWaitMinutes: number;
  queueTicketNumber: string;
  assignedLane: string;
  bufferZoneBayNumber: number;
  statutoryArticleAz: string;
}

export const calculateQueueBooking = (
  params: QueueBookingCalculationParams
): QueueBookingCalculationResult => {
  const vehicleInfo = COMMERCIAL_VEHICLE_INFO[params.vehicleCategory];
  const priorityInfo = CARGO_PRIORITY_INFO[params.priorityTier];

  const baseFeeAzn = vehicleInfo.statutoryBaseFeeAzn;
  const prioritySurchargeAzn = priorityInfo.fastTrackSurchargeAzn;
  const nightSurchargeAzn = params.isNightSlot ? 15 : 0;
  const eGateDiscountAzn = params.driverEGateCleared ? 10 : 0;

  const totalFeeAzn = Math.max(10, baseFeeAzn + prioritySurchargeAzn + nightSurchargeAzn - eGateDiscountAzn);
  const totalFeeSelectedCurrency = convertAzn(totalFeeAzn, params.currency);

  // Calculate wait minutes based on priority coefficient and throughput
  const baseMinutes = (params.checkpoint.currentActiveQueueTrucks / Math.max(params.checkpoint.processingThroughputPerHour, 1)) * 60;
  const estimatedWaitMinutes = Math.max(15, Math.round(baseMinutes * priorityInfo.queueCoefficient));

  // Determine assigned lane
  let assignedLane = 'LANE-03 (Standard Freight)';
  if (params.priorityTier === 'GREEN_LANE') {
    assignedLane = 'LANE-01 (Green Lane Fast-Track)';
  } else if (params.priorityTier === 'ADR_EXPRESS') {
    assignedLane = 'LANE-02 (ADR Hazmat Escort)';
  } else if (params.priorityTier === 'EMPTY_RETURN') {
    assignedLane = 'LANE-04 (Empty Return)';
  }

  // Generate buffer zone bay (1 to bufferZoneTotalSlots)
  const bufferZoneBayNumber = ((params.checkpoint.currentActiveQueueTrucks + 7) % params.checkpoint.bufferZoneTotalSlots) + 1;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const queueTicketNumber = `AZ-Q-${params.checkpoint.id.replace('BCP_', '')}-${randomSuffix}`;

  return {
    baseFeeAzn,
    prioritySurchargeAzn,
    nightSurchargeAzn,
    eGateDiscountAzn,
    totalFeeAzn,
    totalFeeSelectedCurrency,
    currency: params.currency,
    estimatedWaitMinutes,
    queueTicketNumber,
    assignedLane,
    bufferZoneBayNumber,
    statutoryArticleAz: 'AR Dövlət Sərhədi Haqqında Qanun Maddə 8, 12, 19 və Gömrük Məcəlləsi Maddə 184–210',
  };
};

/**
 * Biometric e-Gate Verification Engine
 */
export const verifyBiometricEGate = (
  facialScore: number,
  fingerprintScore: number,
  licenseVerified: boolean,
  visaValid: boolean,
  breathalyzerPromille: number
): {
  isCleared: boolean;
  reasonsAz: string[];
  gateStatus: 'CLEARED' | 'FLAGGED_MANUAL_CHECK' | 'DENIED_ENTRY';
} => {
  const reasonsAz: string[] = [];

  if (breathalyzerPromille > 0.05) {
    reasonsAz.push('Sürücüdə alkoqol səviyyəsi qanuni normadan artıqdır (İXM Maddə 333)');
  }

  if (!licenseVerified) {
    reasonsAz.push('Beynəlxalq sürücülük vəsiqəsi və ya kateqoriya uyğunsuzluğu aşkarlandı');
  }

  if (!visaValid) {
    reasonsAz.push('Dövlət sərhədindən giriş vizası və ya sərhəd icazə sənədi etibarsızdır');
  }

  if (facialScore < 85) {
    reasonsAz.push('Biometrik üz tanıma uyğunluq faizi 85%-dən aşağıdır');
  }

  if (fingerprintScore < 90) {
    reasonsAz.push('Rəqəmsal daktiloskopik barmaq izi uyğunluq faizi 90%-dən aşağıdır');
  }

  if (breathalyzerPromille > 0.05 || !visaValid) {
    return {
      isCleared: false,
      reasonsAz,
      gateStatus: 'DENIED_ENTRY',
    };
  }

  if (reasonsAz.length > 0) {
    return {
      isCleared: false,
      reasonsAz,
      gateStatus: 'FLAGGED_MANUAL_CHECK',
    };
  }

  return {
    isCleared: true,
    reasonsAz: ['Bütün biometrik və hüquqi yoxlamalar DSX standartlarına uyğundur'],
    gateStatus: 'CLEARED',
  };
};

/**
 * 10-Point Border Security & Cargo Declaration Checklist Item
 */
export interface BorderSecurityChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  category: 'DOCUMENTS' | 'CARGO_SEAL' | 'VEHICLE_TECH' | 'SECURITY';
  mandatory: boolean;
  penaltyAzn: number;
  statutoryReference: string;
}

/**
 * 10-Question Cross-Border Transport Law Exam Item
 */
export interface BorderLawExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
  legalReference: string;
}

/**
 * Official BORDER-QUEUE-AZ-2026 Electronic Queue Voucher Structure
 */
export interface BorderQueueVoucher {
  voucherNumber: string; // e.g. BORDER-QUEUE-AZ-2026-78412
  queueTicketNumber: string;
  checkpointId: BorderCheckpointId;
  checkpointNameAz: string;
  vehiclePlate: string;
  vehicleCategory: CommercialVehicleCategory;
  priorityTier: CargoPriorityTier;
  carrierCompanyName: string;
  driverFullName: string;
  driverFin: string;
  assignedLane: string;
  bufferZoneBayNumber: number;
  estimatedCallTimeAz: string;
  totalFeeAzn: number;
  totalFeeFormatted: string;
  qrVerificationUrl: string;
  securityChecksumSha256: string;
  simaDigitalSignatureUid: string;
  barrierGatePin: string;
  createdAtIso: string;
}

/**
 * Mock generation of a cryptographic SHA-256 style hex string
 */
export const generateBorderQueueHash = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:e9b${hex}4107f8b9d0e2c81a56c4d7120`;
};

/**
 * Generates an official BORDER-QUEUE-AZ-2026 Voucher
 */
export const issueBorderQueueVoucher = (
  checkpoint: BorderCheckpointInfo,
  vehiclePlate: string,
  vehicleCategory: CommercialVehicleCategory,
  priorityTier: CargoPriorityTier,
  carrierCompanyName: string,
  driverFullName: string,
  driverFin: string,
  calculation: QueueBookingCalculationResult
): BorderQueueVoucher => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const voucherNumber = `BORDER-QUEUE-AZ-2026-${randomSuffix}`;
  const barrierGatePin = `${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date();
  const callTime = new Date(now.getTime() + calculation.estimatedWaitMinutes * 60000);
  const hours = String(callTime.getHours()).padStart(2, '0');
  const mins = String(callTime.getMinutes()).padStart(2, '0');
  const estimatedCallTimeAz = `${hours}:${mins} (Təxmini çağırış vaxtı)`;

  const checksumSource = `${voucherNumber}|${checkpoint.id}|${vehiclePlate}|${driverFin}|${calculation.totalFeeAzn}`;
  const securityChecksumSha256 = generateBorderQueueHash(checksumSource);
  const simaDigitalSignatureUid = `SIMA-DSX-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;

  return {
    voucherNumber,
    queueTicketNumber: calculation.queueTicketNumber,
    checkpointId: checkpoint.id,
    checkpointNameAz: checkpoint.nameAz,
    vehiclePlate,
    vehicleCategory,
    priorityTier,
    carrierCompanyName: carrierCompanyName || 'Məsul Beynəlxalq Daşıyıcı MMC',
    driverFullName: driverFullName || 'Məmmədov Rauf Əli oğlu',
    driverFin: driverFin || '5A99B88',
    assignedLane: calculation.assignedLane,
    bufferZoneBayNumber: calculation.bufferZoneBayNumber,
    estimatedCallTimeAz,
    totalFeeAzn: calculation.totalFeeAzn,
    totalFeeFormatted: formatCurrency(calculation.totalFeeSelectedCurrency, calculation.currency),
    qrVerificationUrl: `https://dsx.gov.az/e-queue/verify?code=${voucherNumber}`,
    securityChecksumSha256,
    simaDigitalSignatureUid,
    barrierGatePin,
    createdAtIso: now.toISOString(),
  };
};
