import { Currency } from '../types/vehicle';

export type AvalancheCorridorId =
  | 'QUBA_KHINALUG_PASS'
  | 'QUSAR_SHAHDAG_LAZA'
  | 'MUROVDAG_OMAR_PASS'
  | 'SHAMAKHI_AGHSU_PASS'
  | 'LANKARAN_LERIK_ZUVAND'
  | 'ZEFER_SHUSHA_DASHALTI';

export type AvalancheRiskTier =
  | 'TIER_1_LOW'          // 1 - Aşağı (Qar qatı çox sabitdir, fərdi uçqun ehtimalı <5%)
  | 'TIER_2_MODERATE'     // 2 - Mülayim (Müəyyən dik yamaclarda zəif qat, xüsusi ehtiyat tələb olunur)
  | 'TIER_3_CONSIDERABLE' // 3 - Nəzərəçarpan (Bir çox dik yamaclarda qeyri-sabit, zəncirsiz keçid qadağandır)
  | 'TIER_4_HIGH'         // 4 - Yüksək (Spontan iri uçqunlar, profilaktik Gazex partlatması məcburidir)
  | 'TIER_5_VERY_HIGH';   // 5 - Fövqəladə Təhlükəli (Kütləvi fəlakətli uçqunlar, magistral tam bağlanır)

export type SnowType =
  | 'fresh_powder'      // Yeni yağmış quru toz qar (sıxlıq 80-120 kg/m³)
  | 'settled_snow'      // Oturmuş qar qatı (sıxlıq 200-300 kg/m³)
  | 'wind_slab'         // Külək sıxışdırmalı lövhəvari qar (sıxlıq 300-400 kg/m³)
  | 'wet_heavy_snow'    // Nəm ağır yaz qarı (sıxlıq 400-500 kg/m³)
  | 'firn_refrozen';    // Buzlaşmış dənəvər firn / qabıq (sıxlıq 500-600 kg/m³)

export type AlpineSurfaceCondition =
  | 'dry_cold_asphalt'
  | 'slush_chemically_treated'
  | 'packed_snow_groomed'
  | 'black_ice_glaze';

export type VehicleTireEquipment =
  | 'summer_tires'
  | 'all_season_m_s'
  | 'winter_3pmsf'
  | 'studded_or_chains';

export interface AlpineCorridor {
  id: AvalancheCorridorId;
  nameAz: string;
  roadCode: string;
  highwayKm: string;
  regionAz: string;
  altitudeMeters: number;
  slopeAngleDeg: number;
  aspectAzimuth: string; // Şimal-Şərq, Şimal, və s.
  gazexExplodersCount: number;
  acousticSensorsCount: number;
  thermalAntiIceSprinklers: number;
  currentSnowDepthCm: number;
  currentSnowDensityKgM3: number;
  weakLayerShearStrengthKPa: number;
  ambientTemperatureC: number;
  pavementTemperatureC: number;
  windSpeedMs: number;
  riskTier: AvalancheRiskTier;
  transitStatus: 'OPEN_ALL' | 'CHAINS_ONLY_4X4' | 'CLOSED_EMERGENCY';
  activeExploderReady: boolean;
  responsiblePatrolRegimentAz: string;
}

export interface AvalancheLiveTelemetry {
  snowDepthCm: number;
  snowDensityKgM3: number;
  weakLayerStrengthKPa: number;
  slopeAngleDeg: number;
  pavementTempC: number;
  ambientTempC: number;
  windSpeedMs: number;
  surfaceCondition: AlpineSurfaceCondition;
  tireEquipment: VehicleTireEquipment;
}

export interface AvalancheCalculationInput {
  snowDepthCm: number;
  snowDensityKgM3: number;
  weakLayerShearStrengthKPa: number;
  slopeAngleDeg: number;
  pavementTempC: number;
  ambientTempC: number;
  vehicleSpeedKmH: number;
  surfaceCondition: AlpineSurfaceCondition;
  tireEquipment: VehicleTireEquipment;
}

export interface AvalancheCalculationResult {
  snowWaterEquivalentMm: number;
  slabShearStressKPa: number;
  stabilityIndexSn: number;
  avalancheRiskTier: AvalancheRiskTier;
  recommendedAntiIceSaltGm2: number;
  recommendedBrineLitersM2: number;
  frictionCoefficientMu: number;
  stoppingDistanceMeters: number;
  tractionVerdict: 'OPTIMAL' | 'ACCEPTABLE' | 'HAZARDOUS' | 'PROHIBITED';
  tractionVerdictDescriptionAz: string;
  isTransitPermitted: boolean;
  requiredProtectiveActionAz: string;
}

export interface AvalancheViolationCalculation {
  transitDefianceViolation: boolean; // Qadağan olunmuş aşırıma icazəsiz giriş (İXM 353)
  missingSnowChainsViolation: boolean; // Tələb olunan halda qar zəncirinin olmaması (İXM 353)
  safeDistanceViolation: boolean; // Çovğunda təhlükəsiz intervalın pozulması (İXM 327.1)
  speedExcessUnderBlizzard: boolean; // Çovğunda tövsiyə olunan sürətin 20+ km/s aşılması (İXM 328.1)
  totalFineAzn: number;
  promptDiscountFineAzn: number; // İXM 38 uyğun olaraq 30 gün ərzində 50% endirim
  penaltyPoints: number;
  totalFineForeign: number;
  promptDiscountFineForeign: number;
  currency: Currency;
  violationsSummaryAz: string[];
}

export interface AvalancheSafetyChecklistItem {
  id: string;
  titleAz: string;
  descriptionAz: string;
  category: 'avalanche_scada' | 'vehicle_winter_gear' | 'roadway_safety';
  isMandatory: boolean;
  standardRef: string;
}

export interface AvalancheExamQuestion {
  id: number;
  questionAz: string;
  optionsAz: string[];
  correctIndex: number;
  explanationAz: string;
  legalBasisAz: string;
}

export interface AvalancheClearanceCertificate {
  certificateUid: string;
  passPinCode: string;
  issueDate: string;
  expiryDate: string;
  corridorId: AvalancheCorridorId;
  corridorNameAz: string;
  vehiclePlate: string;
  vehicleModel: string;
  riskTier: AvalancheRiskTier;
  measuredStabilityIndex: number;
  snowDepthCm: number;
  gazexExploderReady: boolean;
  transitVerdictAz: string;
  simaSignatureUid: string;
  sha256VerificationHash: string;
  qrPayload: string;
  isVerified: boolean;
}

/**
 * Currency conversion constants
 */
export const AZN_TO_USD = 0.5882;
export const AZN_TO_EUR = 0.5405;

export function convertFromAzn(amountAzn: number, currency: Currency): number {
  switch (currency) {
    case 'USD':
      return Math.round(amountAzn * AZN_TO_USD * 100) / 100;
    case 'EUR':
      return Math.round(amountAzn * AZN_TO_EUR * 100) / 100;
    case 'AZN':
    default:
      return Math.round(amountAzn * 100) / 100;
  }
}

/**
 * Calculate Snow Water Equivalent (SWE) in mm
 * SWE = H_s (cm) * (rho_s / rho_water) * 10
 */
export function calculateSnowWaterEquivalent(snowDepthCm: number, snowDensityKgM3: number): number {
  const depthMeters = Math.max(0, snowDepthCm) / 100;
  // Water density = 1000 kg/m^3 -> depth in mm of water
  const sweMm = depthMeters * snowDensityKgM3;
  return Math.round(sweMm * 10) / 10;
}

/**
 * Calculate Slab Shear Stress tau_g in kPa
 * tau_g = rho_s * g * H_m * sin(theta) / 1000
 */
export function calculateSlabShearStress(
  snowDepthCm: number,
  snowDensityKgM3: number,
  slopeAngleDeg: number
): number {
  const g = 9.81;
  const depthMeters = Math.max(0, snowDepthCm) / 100;
  const slopeRad = (slopeAngleDeg * Math.PI) / 180;
  const stressPa = snowDensityKgM3 * g * depthMeters * Math.sin(slopeRad);
  const stressKPa = stressPa / 1000;
  return Math.round(stressKPa * 100) / 100;
}

/**
 * Calculate Snowpack Stability Index Sn = tau_f / tau_g
 */
export function calculateStabilityIndex(
  weakLayerStrengthKPa: number,
  slabShearStressKPa: number
): number {
  if (slabShearStressKPa <= 0.01) {
    return 3.5; // No significant stress -> high stability
  }
  const sn = weakLayerStrengthKPa / slabShearStressKPa;
  return Math.round(sn * 100) / 100;
}

/**
 * Determine Avalanche Danger Tier based on Stability Index Sn and Snow Depth
 */
export function determineAvalancheRiskTier(
  stabilityIndexSn: number,
  snowDepthCm: number
): AvalancheRiskTier {
  if (stabilityIndexSn < 0.85 || snowDepthCm > 180) {
    return 'TIER_5_VERY_HIGH';
  }
  if (stabilityIndexSn < 1.15 || snowDepthCm > 110) {
    return 'TIER_4_HIGH';
  }
  if (stabilityIndexSn < 1.6 || snowDepthCm > 60) {
    return 'TIER_3_CONSIDERABLE';
  }
  if (stabilityIndexSn < 2.2 || snowDepthCm > 25) {
    return 'TIER_2_MODERATE';
  }
  return 'TIER_1_LOW';
}

/**
 * Calculate Recommended Anti-icing chemical salt and brine dosing based on pavement temp
 */
export function calculateAntiIceDosing(
  pavementTempC: number,
  surfaceCondition: AlpineSurfaceCondition
): { saltGm2: number; brineLitersM2: number } {
  let baseSalt = 15;
  let baseBrine = 0.025;

  if (surfaceCondition === 'black_ice_glaze') {
    baseSalt += 25;
    baseBrine += 0.035;
  } else if (surfaceCondition === 'packed_snow_groomed') {
    baseSalt += 15;
    baseBrine += 0.02;
  } else if (surfaceCondition === 'slush_chemically_treated') {
    baseSalt += 5;
    baseBrine += 0.01;
  }

  // If sub-zero, increment dose per degree
  if (pavementTempC < 0) {
    const frostDiff = Math.min(20, Math.abs(pavementTempC));
    baseSalt += frostDiff * 1.5;
    baseBrine += frostDiff * 0.002;
  }

  return {
    saltGm2: Math.min(60, Math.round(baseSalt)),
    brineLitersM2: Math.min(0.08, Math.round(baseBrine * 1000) / 1000),
  };
}

/**
 * Determine friction coefficient mu based on surface and vehicle tire equipment
 */
export function calculateAlpineFriction(
  surface: AlpineSurfaceCondition,
  tires: VehicleTireEquipment
): number {
  let baseMu = 0.8;
  switch (surface) {
    case 'dry_cold_asphalt':
      baseMu = 0.75;
      break;
    case 'slush_chemically_treated':
      baseMu = 0.45;
      break;
    case 'packed_snow_groomed':
      baseMu = 0.25;
      break;
    case 'black_ice_glaze':
      baseMu = 0.1;
      break;
  }

  // Tire modifiers
  switch (tires) {
    case 'summer_tires':
      baseMu *= 0.55; // dangerous degradation on winter surface
      break;
    case 'all_season_m_s':
      baseMu *= 0.8;
      break;
    case 'winter_3pmsf':
      baseMu *= 1.25;
      break;
    case 'studded_or_chains':
      baseMu = surface === 'black_ice_glaze' ? 0.35 : Math.min(0.7, baseMu * 1.6);
      break;
  }

  return Math.round(Math.min(0.9, Math.max(0.05, baseMu)) * 100) / 100;
}

/**
 * Comprehensive Avalanche & Alpine Road Calculation
 */
export function calculateAvalancheMetrics(
  input: AvalancheCalculationInput
): AvalancheCalculationResult {
  const swe = calculateSnowWaterEquivalent(input.snowDepthCm, input.snowDensityKgM3);
  const shearStress = calculateSlabShearStress(
    input.snowDepthCm,
    input.snowDensityKgM3,
    input.slopeAngleDeg
  );
  const sn = calculateStabilityIndex(input.weakLayerShearStrengthKPa, shearStress);
  const riskTier = determineAvalancheRiskTier(sn, input.snowDepthCm);
  const dosing = calculateAntiIceDosing(input.pavementTempC, input.surfaceCondition);
  const mu = calculateAlpineFriction(input.surfaceCondition, input.tireEquipment);

  // Stopping distance db = v^2 / (2 * mu * g)
  const g = 9.81;
  const speedMs = (Math.max(10, input.vehicleSpeedKmH) * 1000) / 3600;
  const db = (speedMs * speedMs) / (2 * mu * g);
  const stoppingDistMeters = Math.round(db * 10) / 10;

  // Verdict logic
  let tractionVerdict: 'OPTIMAL' | 'ACCEPTABLE' | 'HAZARDOUS' | 'PROHIBITED' = 'OPTIMAL';
  let descAz = 'Yol səthi və təkər ilişməsi standart dağlıq qış normalarına tam uyğundur.';
  let isTransitPermitted = true;
  let actionAz = 'Standart qış sürət həddi ilə təhlükəsiz hərəkətə icazə verilir.';

  if (riskTier === 'TIER_5_VERY_HIGH' || input.surfaceCondition === 'black_ice_glaze' && input.tireEquipment === 'summer_tires') {
    tractionVerdict = 'PROHIBITED';
    descAz = 'TƏHLÜKƏ! Qar uçqunu və ya şüşə buzlaşma şəraitində yay təkərləri ilə dağ aşırımına daxil olmaq qəti qadağandır!';
    isTransitPermitted = false;
    actionAz = 'Magistral AAYDA və BDYP tərəfindən bağlanmışdır. Qabaqlayıcı Gazex partlayışı və duz səpki gözlənilir.';
  } else if (riskTier === 'TIER_4_HIGH' || input.tireEquipment === 'summer_tires' || mu < 0.2) {
    tractionVerdict = 'HAZARDOUS';
    descAz = 'Yüksək qəza riski: Qar qatının stabilliyi kritik həddədir, təkər ilişməsi kəskin zəifdir.';
    isTransitPermitted = input.tireEquipment === 'studded_or_chains';
    actionAz = 'Yalnız 4x4 ötürücülü və qar zənciri ilə təchiz olunmuş nəqliyyat vasitələrinin keçidinə icazə verilir.';
  } else if (riskTier === 'TIER_3_CONSIDERABLE' || input.tireEquipment === 'all_season_m_s') {
    tractionVerdict = 'ACCEPTABLE';
    descAz = 'Nəzərəçarpan risk: Qış təkərləri (3PMSF) və ya zəncir tələb olunur, minimum 70m ara məsafəsi saxlanmalıdır.';
    isTransitPermitted = true;
    actionAz = 'Sürət həddi 40 km/s məhdudlaşdırılır. Qabaqlayıcı de-icing reaktivləri səpilir.';
  }

  return {
    snowWaterEquivalentMm: swe,
    slabShearStressKPa: shearStress,
    stabilityIndexSn: sn,
    avalancheRiskTier: riskTier,
    recommendedAntiIceSaltGm2: dosing.saltGm2,
    recommendedBrineLitersM2: dosing.brineLitersM2,
    frictionCoefficientMu: mu,
    stoppingDistanceMeters: stoppingDistMeters,
    tractionVerdict,
    tractionVerdictDescriptionAz: descAz,
    isTransitPermitted,
    requiredProtectiveActionAz: actionAz,
  };
}

/**
 * Calculate statutory administrative fines for winter/avalanche transit violations
 */
export function calculateAvalancheViolationFine(
  transitDefiance: boolean,
  missingSnowChains: boolean,
  safeDistanceViolation: boolean,
  speedExcessUnderBlizzard: boolean,
  currency: Currency = 'AZN'
): AvalancheViolationCalculation {
  let fineAzn = 0;
  let points = 0;
  const violationsSummaryAz: string[] = [];

  if (transitDefiance) {
    // İXM Maddə 353 (Qadağan olunmuş aşırıma icazəsiz giriş)
    fineAzn += 100;
    points += 3;
    violationsSummaryAz.push(
      'İXM Maddə 353: Fövqəladə xəbərdarlıq elan olunmuş dağ aşırımına icazəsiz daxil olma (100 AZN, 3 cərimə balı)'
    );
  }

  if (missingSnowChains) {
    // İXM Maddə 353 (Tələb olunan halda qar zəncirinin və ya qış təkərinin olmaması)
    fineAzn += 80;
    points += 2;
    violationsSummaryAz.push(
      'İXM Maddə 353: Qar zənciri tələb olunan aşırımda zəncirsiz və yararsız təkərlərlə hərəkət (80 AZN, 2 cərimə balı)'
    );
  }

  if (safeDistanceViolation) {
    // İXM Maddə 327.1 (Çovğunda təhlükəsiz intervalın pozulması)
    fineAzn += 40;
    violationsSummaryAz.push(
      'İXM Maddə 327.1: Məhdud görmə və çovğun şəraitində təhlükəsiz ara məsafəsinin saxlanmaması (40 AZN)'
    );
  }

  if (speedExcessUnderBlizzard) {
    // İXM Maddə 328.1 (Qarlı aşırımda tövsiyə olunan sürət həddinin 20 km/s-dən çox aşılması)
    fineAzn += 50;
    points += 2;
    violationsSummaryAz.push(
      'İXM Maddə 328.1: Çovğun və buzlaşma xəbərdarlığında müəyyən edilmiş sürət həddinin aşılması (50 AZN, 2 cərimə balı)'
    );
  }

  // 50% prompt discount under İXM Article 38 within 30 days
  const promptDiscountAzn = Math.round((fineAzn * 0.5) * 100) / 100;

  return {
    transitDefianceViolation: transitDefiance,
    missingSnowChainsViolation: missingSnowChains,
    safeDistanceViolation,
    speedExcessUnderBlizzard,
    totalFineAzn: fineAzn,
    promptDiscountFineAzn: promptDiscountAzn,
    penaltyPoints: points,
    totalFineForeign: convertFromAzn(fineAzn, currency),
    promptDiscountFineForeign: convertFromAzn(promptDiscountAzn, currency),
    currency,
    violationsSummaryAz,
  };
}

/**
 * Evaluate Checklist
 */
export function evaluateAvalancheChecklist(
  checkedItemIds: string[],
  allItems: AvalancheSafetyChecklistItem[]
): {
  totalCount: number;
  checkedCount: number;
  mandatoryCount: number;
  mandatoryCheckedCount: number;
  percentage: number;
  isCompliant: boolean;
  missingMandatoryItems: AvalancheSafetyChecklistItem[];
} {
  const totalCount = allItems.length;
  const checkedSet = new Set(checkedItemIds);
  const checkedCount = allItems.filter((item) => checkedSet.has(item.id)).length;
  const mandatoryItems = allItems.filter((item) => item.isMandatory);
  const mandatoryCount = mandatoryItems.length;
  const missingMandatoryItems = mandatoryItems.filter((item) => !checkedSet.has(item.id));
  const mandatoryCheckedCount = mandatoryCount - missingMandatoryItems.length;
  const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const isCompliant = missingMandatoryItems.length === 0 && percentage >= 80;

  return {
    totalCount,
    checkedCount,
    mandatoryCount,
    mandatoryCheckedCount,
    percentage,
    isCompliant,
    missingMandatoryItems,
  };
}

/**
 * Evaluate Exam
 */
export function evaluateAvalancheExam(
  answers: Record<number, number>,
  questions: AvalancheExamQuestion[]
): {
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercentage: number;
  isPassed: boolean;
  details: {
    questionId: number;
    userAnswer: number | undefined;
    correctAnswer: number;
    isCorrect: boolean;
  }[];
} {
  let correctCount = 0;
  const details = questions.map((q) => {
    const userAns = answers[q.id];
    const isCorrect = userAns === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      userAnswer: userAns,
      correctAnswer: q.correctIndex,
      isCorrect,
    };
  });

  const total = questions.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const isPassed = score >= 80; // 80% pass threshold

  return {
    totalQuestions: total,
    correctAnswersCount: correctCount,
    scorePercentage: score,
    isPassed,
    details,
  };
}

/**
 * Generate official clearance certificate
 */
export function generateAvalancheCertificate(
  corridor: AlpineCorridor,
  vehiclePlate: string,
  vehicleModel: string,
  riskTier: AvalancheRiskTier,
  stabilityIndex: number,
  snowDepthCm: number,
  gazexReady: boolean
): AvalancheClearanceCertificate {
  const serial = Math.floor(10000 + Math.random() * 90000);
  const certificateUid = `AVALANCHE-SAFE-AZ-2026-${serial}`;
  const passPinCode = `${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours validity

  const simaUid = `SIMA-AAYDA-FHN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const rawPayload = `${certificateUid}|${corridor.id}|${vehiclePlate}|${riskTier}|${stabilityIndex}|${snowDepthCm}`;
  
  // pseudo SHA-256 representation
  let hashVal = 0;
  for (let i = 0; i < rawPayload.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawPayload.charCodeAt(i);
    hashVal |= 0;
  }
  const hexHash = Math.abs(hashVal).toString(16).padStart(8, '0');
  const sha256VerificationHash = `e89c${hexHash}71f0c294d${hexHash}99b3a4d`;

  let verdictAz = 'Təhlükəsiz tranzit təsdiq olunmuşdur (4x4 və qar zənciri tövsiyə edilir)';
  if (riskTier === 'TIER_5_VERY_HIGH') {
    verdictAz = 'Xüsusi fövqəladə kolon müşayiəti ilə şərti icazə';
  }

  return {
    certificateUid,
    passPinCode,
    issueDate: now.toISOString().split('T')[0],
    expiryDate: expiry.toISOString().split('T')[0],
    corridorId: corridor.id,
    corridorNameAz: corridor.nameAz,
    vehiclePlate,
    vehicleModel,
    riskTier,
    measuredStabilityIndex: stabilityIndex,
    snowDepthCm,
    gazexExploderReady: gazexReady,
    transitVerdictAz: verdictAz,
    simaSignatureUid: simaUid,
    sha256VerificationHash,
    qrPayload: `https://aayda.gov.az/avalanche/verify/${certificateUid}?pin=${passPinCode}`,
    isVerified: true,
  };
}
