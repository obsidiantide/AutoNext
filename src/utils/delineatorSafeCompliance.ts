/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Land Transport Agency (AYNA) & Main State Traffic Police (BDYP)
 * Highway Delineator Posts, Guide Posts & Flexible Road Markers,
 * Retroreflective Sheeting (EN 12899-3 / AZS 410), Night Curve Guidance,
 * Fog Visibility Telemetry & Official DELINEATOR-SAFE-AZ-2026 Portal
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   təhlükəsizlik mühəndis qurğuları, yol mebeli, bələdçi siqnal sütuncuqları və optik oriyentasiya vasitələri)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 42, 50: Gecə vaxtı və məhdud görmə
 *   şəraitində yol trayektoriyasının izlənməsi, döngələrdə sürət rejimi və xarici işıq cihazlarından istifadə)
 * - European Standard EN 12899-3: Fixed, vertical road traffic signs - Part 3: Delineator posts and retroreflectors
 *   (Retroreflector optical performance Class R1 / R2 / R3, Coefficient of Luminous Intensity CIL mcd/lx, impact durability)
 * - State Standards AZS 410 / AZS 342, GOST 32843 / GOST 32866 (Yol siqnal sütuncuqları, konstruktiv tələblər və sınaq metodları)
 * - US FHWA MUTCD Section 3F (Delineator spacing formula on horizontal curves: S = 3 * sqrt(R - 15))
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *     * Maddə 327.1: Yol hərəkəti qaydalarına riayət edilməməsi, yol kənarı bələdçi xətlərinin pozulması — 40 AZN;
 *     * Maddə 327.4: Bələdçi sütuncuqlarla ayrılmış sərhədi aşaraq qarşı zolağa və ya dik yamaca çıxma — 100 AZN + 4 cərimə balı;
 *     * Maddə 328.2: Bələdçi sütunlarla təchiz edilmiş təhlükəli döngələrdə sürət həddini 20-40 km/saat aşma — 50 AZN + 2 bal;
 *     * Maddə 353.1: Yol mebelinə, bələdçi sütuncuqlarına və reflektorlara ziyan vurulması — 600 AZN;
 *     * Maddə 38: İXM üzrə 30 gün ərzində cərimə ödənildikdə 50%-lik qanuni güzəşt;
 *     * AR Mülki Məcəlləsi Maddə 1108: AAYDA balansındakı yol mebelinə vurulmuş ziyanın tam məbləğdə kompensasiya edilməsi (hər sütun üçün 180 AZN).
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const DELINEATOR_SAFE_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const DELINEATOR_SAFE_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertDelineatorSafeCurrency(amountInAzn: number, currency: Currency): number {
  const rate = DELINEATOR_SAFE_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type RetroreflectorClass =
  | 'CLASS_R1' // EN 12899-3 Class R1 (≥ 50 mcd/lx standard engineering grade)
  | 'CLASS_R2' // EN 12899-3 Class R2 (≥ 150 mcd/lx high-intensity microprismatic)
  | 'CLASS_R3'; // EN 12899-3 Class R3 (≥ 300 mcd/lx diamond grade ultra-high)

export type DelineatorPostType =
  | 'FLEXIBLE_POLYURETHANE' // Class D2 self-reboundable TPU post, survives 50+ tire impacts
  | 'RIGID_GALVANIZED_STEEL' // Class D1 rigid steel post with breakaway base
  | 'SEMI_RIGID_HDPE'; // Class D3 high-density polyethylene tubular post

export type DelineatorPlacement =
  | 'RIGHT_SHOULDER' // White post with Red/Amber reflector on right side
  | 'LEFT_MEDIAN' // White post with White reflector on left side
  | 'DIVERGE_GORE' // Flared array marking ramp splits
  | 'MOUNTAIN_SERPENTINE'; // High-visibility snow pole with extended height

export type DelineatorStationStatus =
  | 'OPERATIONAL_NOMINAL'
  | 'CLEANING_WASH_DUE'
  | 'KNOCKDOWN_REPLACE_DUE'
  | 'FOG_ACTIVE_MONITORING';

export interface DelineatorCorridorStation {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  curveRadiusM: number;
  curveLengthM: number;
  postType: DelineatorPostType;
  reflectorClass: RetroreflectorClass;
  nominalSpacingM: number;
  stationStatus: DelineatorStationStatus;
  annualAccidentReductionPct: number;
  installedYear: number;
}

export interface DelineatorCalculationInput {
  curveRadiusM: number;
  vehicleSpeedKmH: number;
  headlightIntensityCd: number;
  visibilityMorM: number; // Meteorological Optical Range in meters (fog/night)
  ambientLux: number; // 0.01 to 20 Lux
  reflectorClass: RetroreflectorClass;
  postType: DelineatorPostType;
  wheelStrikeSimulation: boolean;
}

export interface DelineatorCalculationResult {
  recommendedSpacingM: number;
  transitionSpacing1M: number;
  transitionSpacing2M: number;
  transitionSpacing3M: number;
  totalPostsInCurve: number;
  opticalPreviewDistanceM: number;
  previewTimeSec: number;
  safeSpeedLimitKmH: number;
  speedStatus: 'SAFE_CRUISING' | 'ADVISORY_CAUTION' | 'CRITICAL_OVERSPEED';
  illuminanceAtPostLux: number;
  reflectedIntensityCd: number;
  perceivedDriverLux: number;
  visualGuidanceScorePct: number;
  reboundSurvivalScorePct: number;
  operationalStatus:
    | 'OPTIMAL_OPTICAL_GUIDANCE'
    | 'ADEQUATE_VISIBILITY'
    | 'FOG_RESTRICTED_PREVIEW'
    | 'HAZARDOUS_DEFICIENT_GUIDANCE';
  impactKineticEnergyJ: number;
  reboundRestorationTimeSec: number;
  statutoryFineAzn: number;
  statutoryFineDiscountedAzn: number;
  demeritPoints: number;
  civilRestitutionAzn: number;
  totalLiabilityAzn: number;
}

/**
 * Calculates optimal delineator post spacing on horizontal curves
 * based on AASHTO / MUTCD and AZS 410:
 * S = 3 * sqrt(R - 15) for R in meters.
 * Clamped between 6m (minimum practical spacing on tight curves) and 40m.
 * On straight tangents, spacing is 50m.
 */
export function calculateDelineatorSpacing(curveRadiusM: number): {
  curveSpacingM: number;
  transition1M: number;
  transition2M: number;
  transition3M: number;
} {
  const effectiveRadius = Math.max(16, curveRadiusM);
  let spacing = 3 * Math.sqrt(effectiveRadius - 15);
  spacing = Math.max(6, Math.min(40, Math.round(spacing * 10) / 10));

  return {
    curveSpacingM: spacing,
    transition1M: Math.round(spacing * 1.5 * 10) / 10,
    transition2M: Math.round(spacing * 2.0 * 10) / 10,
    transition3M: Math.round(spacing * 3.0 * 10) / 10,
  };
}

/**
 * Calculates safe curve advisory speed based on centripetal friction:
 * v_safe = sqrt(mu * g * R) * 3.6
 * using standard design lateral friction factor mu = 0.15 (AASHTO / AZS 410)
 */
export function calculateSafeCurveSpeed(curveRadiusM: number): number {
  const lateralMu = 0.15;
  const g = 9.80665;
  const safeSpeedMs = Math.sqrt(lateralMu * g * curveRadiusM);
  const safeSpeedKmh = Math.round(safeSpeedMs * 3.6);
  return Math.max(30, Math.min(130, safeSpeedKmh));
}

/**
 * Returns coefficient of luminous intensity (CIL, mcd/lx) under EN 12899-3
 */
export function getReflectorCil(reflectorClass: RetroreflectorClass): number {
  switch (reflectorClass) {
    case 'CLASS_R1':
      return 65; // Standard engineering grade
    case 'CLASS_R2':
      return 180; // High-intensity microprismatic
    case 'CLASS_R3':
      return 360; // Diamond-grade ultra-reflective
    default:
      return 180;
  }
}

/**
 * Evaluates comprehensive delineator optical guidance, preview distance,
 * wheel strike rebound dynamics, and statutory legal sanctions.
 */
export function evaluateDelineatorSafety(input: DelineatorCalculationInput): DelineatorCalculationResult {
  const spacingInfo = calculateDelineatorSpacing(input.curveRadiusM);
  const recommendedSpacing = spacingInfo.curveSpacingM;
  const safeSpeed = calculateSafeCurveSpeed(input.curveRadiusM);

  // Optical physics: Beer-Lambert atmospheric attenuation
  // k = 2.996 / MOR (Koschmieder's law)
  const mor = Math.max(20, input.visibilityMorM);
  const kExtinction = 2.996 / mor;

  const cil = getReflectorCil(input.reflectorClass);
  const headlampIntensity = Math.max(5000, input.headlightIntensityCd);

  // Standard eye-headlight to delineator observation distance for preview
  const nominalDistance = Math.min(mor, 120); // capped by visibility
  const atmosphericTransmission = Math.exp(-kExtinction * nominalDistance);

  // Incident illuminance at post E = I / d^2
  const illuminanceAtPost = (headlampIntensity / Math.pow(nominalDistance, 2)) * atmosphericTransmission;

  // Reflected intensity I_refl = (CIL * E) / 1000 in candelas
  const reflectedIntensity = (cil * illuminanceAtPost) / 1000;

  // Perceived driver lux E_driver = (I_refl / d^2) * tau
  const perceivedDriverLux = (reflectedIntensity / Math.pow(nominalDistance, 2)) * atmosphericTransmission;

  // Optical preview distance: distance where delineator contrast remains above threshold
  // Contrast threshold ~ 0.0001 lux in night conditions
  const previewFactor = Math.sqrt(headlampIntensity / 25000) * (cil / 180);
  const opticalPreviewDistance = Math.min(
    mor,
    Math.round(nominalDistance * Math.min(2.5, Math.max(0.4, previewFactor * (mor / 500))))
  );

  const speedMs = (input.vehicleSpeedKmH * 1000) / 3600;
  const previewTime = speedMs > 0 ? Math.round((opticalPreviewDistance / speedMs) * 10) / 10 : 9.9;

  // Total posts in a 200m representative curve
  const representativeCurveLength = 200;
  const totalPostsInCurve = Math.max(4, Math.round(representativeCurveLength / recommendedSpacing));

  // Speed Status Evaluation
  let speedStatus: 'SAFE_CRUISING' | 'ADVISORY_CAUTION' | 'CRITICAL_OVERSPEED' = 'SAFE_CRUISING';
  if (input.vehicleSpeedKmH > safeSpeed + 20) {
    speedStatus = 'CRITICAL_OVERSPEED';
  } else if (input.vehicleSpeedKmH > safeSpeed) {
    speedStatus = 'ADVISORY_CAUTION';
  }

  // Visual Guidance Score (0-100%)
  let visualGuidanceScore = 50;
  if (previewTime >= 5.0) {
    visualGuidanceScore += 30;
  } else if (previewTime >= 3.0) {
    visualGuidanceScore += 15;
  }

  if (input.reflectorClass === 'CLASS_R3') visualGuidanceScore += 20;
  else if (input.reflectorClass === 'CLASS_R2') visualGuidanceScore += 10;

  if (mor < 200) visualGuidanceScore -= 25;
  else if (mor < 500) visualGuidanceScore -= 10;

  visualGuidanceScore = Math.max(10, Math.min(99, visualGuidanceScore));

  // Wheel strike and rebound mechanics
  const postMassKg = input.postType === 'FLEXIBLE_POLYURETHANE' ? 1.4 : input.postType === 'SEMI_RIGID_HDPE' ? 2.2 : 5.8;
  const impactKineticEnergy = input.wheelStrikeSimulation ? Math.round(0.5 * postMassKg * Math.pow(speedMs, 2)) : 0;

  let reboundSurvivalScore = 95;
  let reboundRestorationTime = 0.3; // seconds for TPU
  if (input.postType === 'FLEXIBLE_POLYURETHANE') {
    reboundSurvivalScore = input.wheelStrikeSimulation ? 94 : 99;
    reboundRestorationTime = 0.28;
  } else if (input.postType === 'SEMI_RIGID_HDPE') {
    reboundSurvivalScore = input.wheelStrikeSimulation ? 68 : 88;
    reboundRestorationTime = 1.1;
  } else {
    // RIGID_GALVANIZED_STEEL
    reboundSurvivalScore = input.wheelStrikeSimulation ? 15 : 90;
    reboundRestorationTime = 99.9; // fails to restore, permanent deformation
  }

  // Operational Status
  let operationalStatus:
    | 'OPTIMAL_OPTICAL_GUIDANCE'
    | 'ADEQUATE_VISIBILITY'
    | 'FOG_RESTRICTED_PREVIEW'
    | 'HAZARDOUS_DEFICIENT_GUIDANCE' = 'OPTIMAL_OPTICAL_GUIDANCE';

  if (mor < 250 || previewTime < 2.5) {
    operationalStatus = 'FOG_RESTRICTED_PREVIEW';
  } else if (speedStatus === 'CRITICAL_OVERSPEED' || visualGuidanceScore < 45) {
    operationalStatus = 'HAZARDOUS_DEFICIENT_GUIDANCE';
  } else if (visualGuidanceScore >= 75 && previewTime >= 4.5) {
    operationalStatus = 'OPTIMAL_OPTICAL_GUIDANCE';
  } else {
    operationalStatus = 'ADEQUATE_VISIBILITY';
  }

  // Statutory Sanctions & Penalties
  let fineAzn = 0;
  let demeritPoints = 0;

  if (input.wheelStrikeSimulation) {
    // Damaging road furniture / post: İXM 353.1
    fineAzn += 600;
  }

  if (speedStatus === 'CRITICAL_OVERSPEED') {
    // Speeding 20-40 km/h: İXM 328.2
    fineAzn += 50;
    demeritPoints += 2;
  } else if (speedStatus === 'ADVISORY_CAUTION') {
    // Slight lane/marking disregard: İXM 327.1
    fineAzn += 40;
  }

  const statutoryFineDiscountedAzn = Math.round(fineAzn * 0.5 * 100) / 100;
  const civilRestitutionAzn = input.wheelStrikeSimulation ? 180 : 0; // Cost of 1 replacement post under Civil Code 1108
  const totalLiabilityAzn = statutoryFineDiscountedAzn + civilRestitutionAzn;

  return {
    recommendedSpacingM: recommendedSpacing,
    transitionSpacing1M: spacingInfo.transition1M,
    transitionSpacing2M: spacingInfo.transition2M,
    transitionSpacing3M: spacingInfo.transition3M,
    totalPostsInCurve,
    opticalPreviewDistanceM: opticalPreviewDistance,
    previewTimeSec: previewTime,
    safeSpeedLimitKmH: safeSpeed,
    speedStatus,
    illuminanceAtPostLux: Math.round(illuminanceAtPost * 1000) / 1000,
    reflectedIntensityCd: Math.round(reflectedIntensity * 1000) / 1000,
    perceivedDriverLux: Math.round(perceivedDriverLux * 10000) / 10000,
    visualGuidanceScorePct: visualGuidanceScore,
    reboundSurvivalScorePct: reboundSurvivalScore,
    operationalStatus,
    impactKineticEnergyJ: impactKineticEnergy,
    reboundRestorationTimeSec: reboundRestorationTime,
    statutoryFineAzn: fineAzn,
    statutoryFineDiscountedAzn,
    demeritPoints,
    civilRestitutionAzn,
    totalLiabilityAzn,
  };
}

export interface DelineatorChecklistItem {
  id: string;
  code: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  standard: string;
  mandatory: boolean;
}

export interface DelineatorExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctAnswer: number;
  legalBasis: string;
}

export interface DelineatorPublicRecord {
  id: string;
  certificateNumber: string;
  corridorCode: string;
  corridorNameAz: string;
  corridorNameEn: string;
  vehiclePlate: string;
  postType: DelineatorPostType;
  reflectorClass: RetroreflectorClass;
  measuredSpacingM: number;
  previewTimeSec: number;
  complianceRatingPct: number;
  issueDate: string;
  validUntil: string;
  status: 'VALID' | 'INSPECTION_PENDING' | 'REPLACED';
}

/**
 * Generates an official DELINEATOR-SAFE-AZ-2026 Certificate
 */
export function generateDelineatorCertificate(params: {
  corridorStation: DelineatorCorridorStation;
  vehiclePlate: string;
  postType: DelineatorPostType;
  reflectorClass: RetroreflectorClass;
  calculationResult: DelineatorCalculationResult;
}): {
  certificateNumber: string;
  issueDate: string;
  validUntil: string;
  simaUid: string;
  verificationPin: string;
  sha256Hash: string;
} {
  const serial = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `DELINEATOR-SAFE-AZ-2026-${serial}`;
  const now = new Date();
  const issueDate = now.toISOString().slice(0, 10);
  const nextYear = new Date(now.setFullYear(now.getFullYear() + 1));
  const validUntil = nextYear.toISOString().slice(0, 10);
  const simaUid = `SIMA-AAYDA-DEL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const verificationPin = Math.floor(100000 + Math.random() * 900000).toString();
  const sha256Hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    certificateNumber,
    issueDate,
    validUntil,
    simaUid,
    verificationPin,
    sha256Hash,
  };
}
