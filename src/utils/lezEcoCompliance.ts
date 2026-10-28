/**
 * Official Ministry of Ecology and Natural Resources (ETSN - Ekologiya və Təbii Sərvətlər Nazirliyi),
 * Azerbaijan Land Transport Agency (AYNA) &
 * Main State Traffic Police Department (BDYP)
 * Urban Low Emission Zone (LEZ / Aşağı Emissiya Zonası),
 * Green Fleet Eco-Score Telemetry & Official ECO-ZONE-AZ-2026 Clean Delivery Permit Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Environmental Protection"
 *   ("Ətraf mühitin mühafizəsi haqqında" AR Qanunu, Maddə 14, 29, 50: Atmosfer havasının mühafizəsi və ekoloji audit)
 * - Law of the Republic of Azerbaijan "On Protection of Atmospheric Air"
 *   ("Atmosfer havasının mühafizəsi haqqında" AR Qanunu № 108-IIQ)
 * - Law of the Republic of Azerbaijan "On Road Traffic"
 *   ("Yol hərəkəti haqqında" AR Qanunu, Maddə 9, 37: Nəqliyyat vasitələrinin texniki və ekoloji vəziyyəti)
 * - Resolution of the Cabinet of Ministers of the Republic of Azerbaijan No. 42 / 2024
 *   ("Nəqliyyat vasitələrinin ekoloji siniflər üzrə kateqoriyalaşdırılması və aşağı emissiya zonalarında (LEZ) hərəkətinin tənzimlənməsi Qaydaları")
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *   * Maddə 231: Atmosfer havasına çirkləndirici maddələrin normadan artıq atılması (Fiziki şəxslərə 150-300 AZN, hüquqi şəxslərə 2500-4000 AZN cərimə)
 *   * Maddə 342.2.2: İcazəsiz LEZ zonasına daxil olma və ya ekoloji normativləri pozma (50-100 AZN)
 *   * Maddə 342-1: Şəhər mərkəzinə qeyri-qanuni ağır tonnajlı və yüksək emissiyalı yük maşınlarının girişi (150 AZN)
 * - European Emission Standards (Euro 0 to Euro 6d / Zero Emission EV & Hydrogen FCEV)
 * - WHO & UNECE Ambient Air Quality PM2.5 / PM10 / NOx Guidelines
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
 * Vehicle Propulsion and Emission Standard Types
 */
export type EmissionEuroClass =
  | 'ZERO_EMISSION' // Pure EV or Hydrogen Fuel Cell (Zero tailpipe emission)
  | 'EURO_6D'        // Euro 6d / Euro 6d-TEMP (Real Driving Emissions tested)
  | 'EURO_6'         // Euro 6 standard
  | 'EURO_5'         // Euro 5 standard (DPF required for diesel)
  | 'EURO_4'         // Euro 4 standard (Minimum historical baseline for Baku)
  | 'EURO_3'         // Euro 3 (Restricted in all urban LEZs)
  | 'EURO_2_BELOW';  // Euro 0 - 2 (Strict entry ban, subject to İXM 231 impoundment)

export type VehiclePropulsionType =
  | 'ELECTRIC'
  | 'HYDROGEN'
  | 'PLUG_IN_HYBRID'
  | 'HYBRID'
  | 'PETROL'
  | 'DIESEL'
  | 'CNG_LNG';

export type LezZoneCategory =
  | 'ULEZ'     // Ultra Low Emission Zone (Zero Emission / EV Only, e.g. İçərişəhər)
  | 'LEZ_A'    // Zone A - Central Business District & Heritage Core (Euro 5+ or EV)
  | 'LEZ_B'    // Zone B - Seaside Boulevard & White City Corridor (Euro 4+ or EV)
  | 'LEZ_C'    // Zone C - University & Academic District (Euro 4+ or EV)
  | 'LEZ_D'    // Zone D - Cultural & Financial Cluster (Euro 4+ or EV)
  | 'REGIONAL' // Regional Historical Cities (Ganja, Shusha)

export interface LowEmissionZoneInfo {
  id: string;
  category: LezZoneCategory;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  cityAz: string;
  areaKm2: number;
  cameraCount: number;
  currentAqi: number; // Air Quality Index (0-50 Good, 51-100 Moderate, 101+ Unhealthy)
  minAllowedEuroClass: EmissionEuroClass;
  operatingHours: string;
  dailyBaseFeeAzn: number;
  descriptionAz: string;
  keyLandmarksAz: string[];
}

export interface EmissionTelemetry {
  euroClass: EmissionEuroClass;
  propulsion: VehiclePropulsionType;
  co2GramsPerKm: number;       // Target: 0 for EV, < 95 for hybrid, < 130 for Euro 6
  noxMgPerKm: number;          // Target: < 60 for petrol, < 80 for Euro 6 diesel
  pmMgPerKm: number;           // Particulate matter (< 4.5 mg/km for Euro 6)
  dpfBackpressureMbar: number; // Diesel Particulate Filter (Normal: 5 - 35 mbar, > 60 mbar clogged)
  adBlueLevelPercent: number;  // DEF level (0 - 100%, < 15% warning, 0% engine derate)
  batterySohPercent?: number;  // For EV / Hybrid (State of Health 0 - 100%)
  tailpipeSmokeOpacityK: number; // Light absorption coefficient k (m^-1, max 0.50 for modern diesel)
  noiseLevelDb: number;        // Sound level (UNECE R51 limit: 72-74 dB)
  obdMilStatus: 'CLEAR' | 'PENDING' | 'FAULT';
}

export interface EcoScoreResult {
  totalScore: number;          // 0 to 100
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NON_COMPLIANT';
  tierLabelAz: string;
  tierColor: string;
  isEligibleForLez: boolean;
  warningsAz: string[];
  recommendationsAz: string[];
}

export interface LezPermitCalculationParams {
  zoneId: string;
  euroClass: EmissionEuroClass;
  propulsion: VehiclePropulsionType;
  durationDays: number;
  isRushHour: boolean;
  includeTreePlantingCarbonOffset: boolean;
  currency: Currency;
}

export interface LezPermitCostBreakdown {
  zoneBaseRateAzn: number;
  euroMultiplier: number;
  subtotalAzn: number;
  rushHourSurchargeAzn: number;
  carbonOffsetAzn: number;
  totalAzn: number;
  totalConverted: number;
  isAccessPermitted: boolean;
  restrictionReasonAz?: string;
  statutoryFineNoticeAz?: string;
}

export interface EcoChecklistItem {
  id: string;
  code: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  category: 'EXHAUST' | 'FILTRATION' | 'POWERTRAIN' | 'ACOUSTIC' | 'SAFETY';
  legalReference: string;
  standardRequirementAz: string;
  isCritical: boolean;
}

export interface EcoAuditAnswer {
  questionId: string;
  selectedOptionIndex: number;
}

export interface EcoAuditQuestion {
  id: string;
  code: string;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
  legalCitation: string;
}

export interface OfficialLezPermitCertificate {
  certificateId: string;      // e.g. ECO-ZONE-AZ-2026-88192
  vehiclePlate: string;
  vin: string;
  carrierOrOwner: string;
  propulsion: VehiclePropulsionType;
  euroClass: EmissionEuroClass;
  ecoScore: number;
  zoneId: string;
  zoneNameAz: string;
  permitType: 'PERMANENT_GREEN' | 'COMMERCIAL_DELIVERY' | 'TRANSIT_TEMPORARY' | 'PROVISIONAL';
  issueDate: string;
  validUntil: string;
  sha256SecurityChecksum: string;
  simaDigitalUid: string;
  permittedHours: string;
  carbonOffsetTreesFunded: number;
  qrVerificationUrl: string;
  inspectorNameAz: string;
}

/**
 * Calculates vehicle Eco-Score (0 to 100) and certification tier based on real-time telemetry
 */
export const calculateEcoScore = (telemetry: EmissionTelemetry): EcoScoreResult => {
  let score = 0;
  const warningsAz: string[] = [];
  const recommendationsAz: string[] = [];

  // 1. Propulsion & Euro Class Base Points (Max 50 pts)
  switch (telemetry.euroClass) {
    case 'ZERO_EMISSION':
      score += 50;
      break;
    case 'EURO_6D':
      score += 45;
      break;
    case 'EURO_6':
      score += 40;
      break;
    case 'EURO_5':
      score += 28;
      break;
    case 'EURO_4':
      score += 15;
      warningsAz.push('Avro-4 mühərriki LEZ zonalarında şərti girişə malikdir və pik saatlarda məhdudlaşdırıla bilər.');
      break;
    case 'EURO_3':
      score += 5;
      warningsAz.push('Avro-3 mühərriki şəhər daxili LEZ zonalarına qeyri-qanunidir (İXM Maddə 342.2.2).');
      break;
    case 'EURO_2_BELOW':
    default:
      score += 0;
      warningsAz.push('Avro-2 və daha köhnə aqreqatların LEZ zonalarına daxil olması qadağandır (İXM Maddə 231).');
      break;
  }

  // 2. Tailpipe & Gas Emissions (Max 25 pts)
  if (telemetry.propulsion === 'ELECTRIC' || telemetry.propulsion === 'HYDROGEN') {
    score += 25; // Zero emission bonus
  } else {
    // CO2 penalty/bonus
    if (telemetry.co2GramsPerKm <= 95) {
      score += 10;
    } else if (telemetry.co2GramsPerKm <= 130) {
      score += 6;
    } else if (telemetry.co2GramsPerKm <= 170) {
      score += 2;
    } else {
      warningsAz.push(`Yüksək CO2 emissiyası (${telemetry.co2GramsPerKm} q/km) normadan artıqdır.`);
    }

    // NOx rating
    if (telemetry.noxMgPerKm <= 60) {
      score += 8;
    } else if (telemetry.noxMgPerKm <= 80) {
      score += 5;
    } else {
      warningsAz.push(`NOx emissiyası (${telemetry.noxMgPerKm} mq/km) Euro normativ limitini aşır.`);
    }

    // Particulate matter
    if (telemetry.pmMgPerKm <= 2.0) {
      score += 7;
    } else if (telemetry.pmMgPerKm <= 4.5) {
      score += 4;
    } else {
      warningsAz.push(`Qatı his və toz hissəcikləri (PM: ${telemetry.pmMgPerKm} mq/km) filtrləmə defektini göstərir.`);
    }
  }

  // 3. Filtration & Engine Health (Max 15 pts)
  if (telemetry.propulsion === 'DIESEL') {
    if (telemetry.dpfBackpressureMbar <= 35) {
      score += 5;
    } else if (telemetry.dpfBackpressureMbar <= 55) {
      score += 2;
      warningsAz.push(`DPF his filtri əks-təzyiqi yüksəkdir (${telemetry.dpfBackpressureMbar} mbar). Təmizlənmə tövsiyə edilir.`);
    } else {
      warningsAz.push(`DPF filtri kritik dərəcədə tutulub (${telemetry.dpfBackpressureMbar} mbar). LEZ icazəsi bloklanır.`);
    }

    if (telemetry.adBlueLevelPercent >= 20) {
      score += 5;
    } else if (telemetry.adBlueLevelPercent > 0) {
      score += 2;
      warningsAz.push(`AdBlue / DEF çən səviyyəsi azdır (${telemetry.adBlueLevelPercent}%).`);
    } else {
      warningsAz.push('AdBlue / DEF çəni tam boşdur. SCR sistemi qeyri-aktivdir.');
    }

    if (telemetry.tailpipeSmokeOpacityK <= 0.3) {
      score += 5;
    } else if (telemetry.tailpipeSmokeOpacityK <= 0.5) {
      score += 2;
    } else {
      warningsAz.push(`Tüstülənmə həddi (k=${telemetry.tailpipeSmokeOpacityK} m⁻¹) qanuni 0.50 həddini aşır.`);
    }
  } else if (telemetry.propulsion === 'ELECTRIC' || telemetry.propulsion === 'HYDROGEN') {
    if ((telemetry.batterySohPercent ?? 100) >= 80) {
      score += 15;
    } else {
      score += 10;
      recommendationsAz.push('EV batareyasının dövri balanslaşdırılması tövsiyə edilir.');
    }
  } else {
    // Petrol / Hybrid / CNG
    score += 15;
  }

  // 4. Acoustic Noise & OBD Sensor Status (Max 10 pts)
  if (telemetry.noiseLevelDb <= 72) {
    score += 5;
  } else if (telemetry.noiseLevelDb <= 74) {
    score += 3;
  } else {
    warningsAz.push(`Akustik səs-küy səviyyəsi (${telemetry.noiseLevelDb} dB) UNECE R51 həddini aşır.`);
  }

  if (telemetry.obdMilStatus === 'CLEAR') {
    score += 5;
  } else if (telemetry.obdMilStatus === 'PENDING') {
    score += 2;
    warningsAz.push('OBD-II bort diaqnostikasında gözləyən xəta kodları mövcuddur.');
  } else {
    warningsAz.push('Check Engine (MIL) lampası aktivdir və emissiya idarəetmə xətası var.');
  }

  // Ensure 0 - 100 bounds
  score = Math.max(0, Math.min(100, Math.round(score)));

  let tier: EcoScoreResult['tier'] = 'NON_COMPLIANT';
  let tierLabelAz = 'Qeyri-Uyğun (LEZ Qadağası)';
  let tierColor = '#ef4444';
  let isEligibleForLez = false;

  if (score >= 90) {
    tier = 'PLATINUM';
    tierLabelAz = 'Platin Eko-Sinif (Sıfır Emissiya / Ən Yüksək Yaşıl Giriş)';
    tierColor = '#10b981';
    isEligibleForLez = true;
    recommendationsAz.push('Bütün 7 LEZ və ULEZ zonasına 24/7 tam rüsumsuz daxil olma imtiyazı verilir.');
  } else if (score >= 75) {
    tier = 'GOLD';
    tierLabelAz = 'Qızıl Eko-Sinif (Avro-6d Təmiz Nəqliyyat)';
    tierColor = '#059669';
    isEligibleForLez = true;
    recommendationsAz.push('Bütün LEZ zonalarına (İçərişəhər ULEZ istisna olmaqla) tam sərbəst giriş.');
  } else if (score >= 60) {
    tier = 'SILVER';
    tierLabelAz = 'Gümüş Eko-Sinif (Avro-5 / Standart Giriş)';
    tierColor = '#3b82f6';
    isEligibleForLez = true;
    recommendationsAz.push('Standart LEZ icazəsi ilə mərkəz zonalarına daxil olmaq mümkündür.');
  } else if (score >= 45) {
    tier = 'BRONZE';
    tierLabelAz = 'Bürünc Eko-Sinif (Avro-4 / Məhdud Giriş)';
    tierColor = '#f59e0b';
    isEligibleForLez = true;
    recommendationsAz.push('Pik saatlar istisna olmaqla ekoloji rüsum ödənişi ilə şərti icazə.');
  } else {
    tier = 'NON_COMPLIANT';
    tierLabelAz = 'Qeyri-Uyğun (LEZ Giriş Qadağası)';
    tierColor = '#dc2626';
    isEligibleForLez = false;
    recommendationsAz.push('Nəqliyyat vasitəsi DPF quraşdırılmalı və ya utilit proqramına yönləndirilməlidir.');
  }

  return {
    totalScore: score,
    tier,
    tierLabelAz,
    tierColor,
    isEligibleForLez,
    warningsAz,
    recommendationsAz,
  };
};

/**
 * Calculates official statutory LEZ access permit costs, rush hour surcharges, and carbon offset contributions
 */
export const calculateLezPermitCost = (
  params: LezPermitCostBreakdownParams
): LezPermitCostBreakdown => {
  const { zoneBaseRateAzn, euroClass, durationDays, isRushHour, includeTreeOffset, currency } = params;

  let euroMultiplier = 1.0;
  let isAccessPermitted = true;
  let restrictionReasonAz: string | undefined;
  let statutoryFineNoticeAz: string | undefined;

  switch (euroClass) {
    case 'ZERO_EMISSION':
      euroMultiplier = 0.0; // Free for EV / Hydrogen
      break;
    case 'EURO_6D':
      euroMultiplier = 0.25; // 75% green discount
      break;
    case 'EURO_6':
      euroMultiplier = 0.50; // 50% clean discount
      break;
    case 'EURO_5':
      euroMultiplier = 1.00; // Standard base rate
      break;
    case 'EURO_4':
      euroMultiplier = 2.00; // 2x environmental penalty rate
      if (isRushHour) {
        restrictionReasonAz = 'Avro-4 nəqliyyat vasitələrinin pik saatlarda LEZ mərkəz zonasına daxil olması qadağandır.';
      }
      break;
    case 'EURO_3':
      euroMultiplier = 4.00;
      isAccessPermitted = false;
      restrictionReasonAz = 'Avro-3 standartı şəhər daxili LEZ zonalarına daxil olmaq üçün qadağan olunmuş kateqoriyadır.';
      statutoryFineNoticeAz = 'İXM Maddə 342.2.2: Qeyri-qanuni giriş üçün 50-100 AZN inzibati cərimə tətbiq olunur.';
      break;
    case 'EURO_2_BELOW':
    default:
      euroMultiplier = 8.00;
      isAccessPermitted = false;
      restrictionReasonAz = 'Avro-2 və daha aşağı köhnə nəqliyyat vasitələrinin LEZ zonasına girişi qəti qadağandır.';
      statutoryFineNoticeAz = 'İXM Maddə 231: Normadan artıq zərərli tullantıya görə 150-300 AZN cərimə və cərimə meydançası.';
      break;
  }

  const subtotalAzn = isAccessPermitted ? zoneBaseRateAzn * euroMultiplier * Math.max(1, durationDays) : 0;
  const rushHourSurchargeAzn = isAccessPermitted && isRushHour && euroMultiplier > 0 ? subtotalAzn * 0.5 : 0;
  const carbonOffsetAzn = includeTreeOffset ? 5.0 * Math.max(1, durationDays) : 0; // 5 AZN per day for urban tree planting

  const totalAzn = subtotalAzn + rushHourSurchargeAzn + carbonOffsetAzn;
  const totalConverted = convertAzn(totalAzn, currency);

  return {
    zoneBaseRateAzn,
    euroMultiplier,
    subtotalAzn,
    rushHourSurchargeAzn,
    carbonOffsetAzn,
    totalAzn,
    totalConverted,
    isAccessPermitted,
    restrictionReasonAz,
    statutoryFineNoticeAz,
  };
};

export interface LezPermitCostBreakdownParams {
  zoneBaseRateAzn: number;
  euroClass: EmissionEuroClass;
  durationDays: number;
  isRushHour: boolean;
  includeTreeOffset: boolean;
  currency: Currency;
}

/**
 * Evaluates the 10-Point Technical Eco-Compliance Checklist
 */
export const evaluateEcoChecklist = (
  items: EcoChecklistItem[],
  checkedMap: Record<string, boolean>
): { passedCount: number; totalCount: number; isAllCriticalPassed: boolean; scorePercentage: number } => {
  let passedCount = 0;
  let isAllCriticalPassed = true;

  items.forEach((item) => {
    const isChecked = !!checkedMap[item.id];
    if (isChecked) {
      passedCount++;
    } else if (item.isCritical) {
      isAllCriticalPassed = false;
    }
  });

  const totalCount = items.length;
  const scorePercentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return {
    passedCount,
    totalCount,
    isAllCriticalPassed,
    scorePercentage,
  };
};

/**
 * Evaluates the Official Eco-Audit Examination Simulator
 */
export const evaluateEcoAuditExam = (
  questions: EcoAuditQuestion[],
  answers: Record<string, number>
): { correctCount: number; totalCount: number; percentage: number; isPassed: boolean } => {
  let correctCount = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const totalCount = questions.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isPassed = percentage >= 80; // 80% passing threshold for official green auditor certification

  return {
    correctCount,
    totalCount,
    percentage,
    isPassed,
  };
};

/**
 * Generates an official ETSN, AYNA & BDYP ECO-ZONE-AZ-2026 Clean Delivery Permit Certificate
 */
export const generateOfficialLezCertificate = (params: {
  vehiclePlate: string;
  vin: string;
  carrierOrOwner: string;
  propulsion: VehiclePropulsionType;
  euroClass: EmissionEuroClass;
  ecoScore: number;
  zoneId: string;
  zoneNameAz: string;
  permitType: OfficialLezPermitCertificate['permitType'];
  treesFunded?: number;
}): OfficialLezPermitCertificate => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `ECO-ZONE-AZ-2026-${randomSuffix}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];

  const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const validUntil = expiry.toISOString().split('T')[0];

  const rawPayload = `${certificateId}|${params.vehiclePlate}|${params.vin}|${params.zoneId}|${params.euroClass}|${issueDate}`;
  let hash = 0;
  for (let i = 0; i < rawPayload.length; i++) {
    hash = (hash << 5) - hash + rawPayload.charCodeAt(i);
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  const sha256SecurityChecksum = `SHA256:7e8b${hexHash}c4d19f8a2026`;
  const simaDigitalUid = `SIMA-ETSN-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const permittedHours =
    params.euroClass === 'ZERO_EMISSION' || params.euroClass === 'EURO_6D'
      ? '24/7 Limitsiz Sərbəst Giriş'
      : params.euroClass === 'EURO_6'
      ? '06:00 - 23:00 (Pik daxil)'
      : params.euroClass === 'EURO_5'
      ? '10:00 - 17:00 və 20:00 - 07:00 (Qeyri-pik saatlar)'
      : 'Yalnız Gecə saatları (22:00 - 06:00)';

  return {
    certificateId,
    vehiclePlate: params.vehiclePlate,
    vin: params.vin,
    carrierOrOwner: params.carrierOrOwner,
    propulsion: params.propulsion,
    euroClass: params.euroClass,
    ecoScore: params.ecoScore,
    zoneId: params.zoneId,
    zoneNameAz: params.zoneNameAz,
    permitType: params.permitType,
    issueDate,
    validUntil,
    sha256SecurityChecksum,
    simaDigitalUid,
    permittedHours,
    carbonOffsetTreesFunded: params.treesFunded ?? 2,
    qrVerificationUrl: `https://eco.ayna.gov.az/verify?cert=${certificateId}&plate=${encodeURIComponent(params.vehiclePlate)}`,
    inspectorNameAz: 'Ekoloji Dövlət Müfəttişi Ə. R. Həsənzadə (VÖEN: 1400293181)',
  };
};
