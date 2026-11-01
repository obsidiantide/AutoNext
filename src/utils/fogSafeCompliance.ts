import { Currency } from '../types/vehicle';

export type FogCorridorId =
  | 'M2_KURDAMIR_YEVLAKH'
  | 'M3_SALYAN_BILASUVAR'
  | 'M1_GILAZI_KHACHMAZ'
  | 'M4_MUGHANLI_PASS'
  | 'M3_GOBUSTAN_SANGACHAL'
  | 'ZEFER_SHUSHA_RIDGE';

export type FogType =
  | 'radiation_fog'       // Radiasiya dumanı (Kür-Araz ovalığı gecə soyuması)
  | 'advection_fog'       // Adveksiya dumanı (Xəzər dənizindən quruya axan nəm hava)
  | 'orographic_fog'      // Oroqrafik duman (Muğanlı və Şuşa dağ yamaclarında bulud kondensasiyası)
  | 'dust_storm'          // Xəzri küləyi səbəbli qum və toz fırtınası (Qobustan / Abşeron)
  | 'steam_evaporation_fog'; // Buxarlanma dumanı (Ceyranbatan / Mingəçevir su anbarı yanı)

export type VisibilityTier =
  | 'CRITICAL_ZERO' // < 50 metr: VSL 40 km/s, təhlükə siqnalı, xüsusi eskort və ya hərəkətin dayandırılması
  | 'DENSE_FOG'     // 50 - 100 metr: VSL 60 km/s, arxa duman fənəri icazəli, məsafə intervalı > 100m
  | 'MODERATE_FOG'  // 100 - 200 metr: VSL 80 km/s, yaxın vuran işıqlar məcburi, məsafə intervalı > 70m
  | 'LIGHT_MIST'    // 200 - 500 metr: VSL 90 km/s, standart ehtiyat rejimi
  | 'CLEAR';        // > 500 metr: VSL 110 km/s, normal magistral hərəkəti

export type RoadSurfaceCondition =
  | 'dry_asphalt'
  | 'wet_damp'
  | 'slush_snow'
  | 'black_ice';

export interface FogCorridor {
  id: FogCorridorId;
  nameAz: string;
  roadCode: string;
  highwayKm: string;
  regionAz: string;
  fogType: FogType;
  fogTypeNameAz: string;
  baseElevationMeters: number;
  transmissometersCount: number;
  vslGantriesCount: number;
  ledStudsDistanceKm: number;
  currentVisibilityMeters: number;
  currentExtinctionK: number; // m^-1
  relativeHumidityPercent: number;
  ambientTemperatureC: number;
  dewPointC: number;
  windSpeedMs: number;
  pm10MicrogramM3: number;
  recommendedVslKmH: number;
  activeLedGuidanceStatus: 'OFF' | 'AMBER_PULSE_1HZ' | 'SYNCHRONIZED_RED_EMERGENCY';
  status: 'optimal' | 'warning' | 'critical';
  responsiblePatrolRegimentAz: string;
}

export interface FogLiveTelemetry {
  visibilityMeters: number;
  extinctionK: number;
  humidityPercent: number;
  temperatureC: number;
  windSpeedMs: number;
  roadSurface: RoadSurfaceCondition;
  dynamicVslKmH: number;
  ledStudsActive: boolean;
  convoyEscortActive: boolean;
}

export interface VisibilityCalculationInput {
  visibilityMeters: number;
  vehicleSpeedKmH: number;
  roadSurface: RoadSurfaceCondition;
  reactionTimeSeconds?: number;
  headwayGapMeters?: number;
}

export interface VisibilityCalculationResult {
  visibilityMeters: number;
  extinctionCoefficientK: number;
  visibilityTier: VisibilityTier;
  recommendedVslKmH: number;
  reactionDistanceMeters: number;
  brakingDistanceMeters: number;
  totalStoppingDistanceMeters: number;
  frictionCoefficient: number;
  sightStoppingMarginMeters: number;
  riskVerdict: 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'CRITICAL_HAZARD';
  riskDescriptionAz: string;
  actualHeadwaySeconds: number;
  recommendedHeadwaySeconds: number;
  isHeadwaySafe: boolean;
}

export interface FogViolationCalculation {
  actualSpeedKmH: number;
  vslSpeedKmH: number;
  speedExcessKmH: number;
  speedFineAzn: number;
  headlightsFineAzn: number;
  rearFogMisuseFineAzn: number;
  safeDistanceFineAzn: number;
  totalFineAzn: number;
  promptDiscountFineAzn: number;
  penaltyPoints: number;
  totalFineForeign: number;
  promptDiscountFineForeign: number;
  currency: Currency;
  violationsSummaryAz: string[];
}

export interface FogSafetyChecklistItem {
  id: string;
  titleAz: string;
  descriptionAz: string;
  category: 'lighting_sensors' | 'vehicle_chassis' | 'roadway_guidance';
  isMandatory: boolean;
  standardRef: string;
}

export interface FogExamQuestion {
  id: number;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
  legalCitation: string;
}

export interface FogClearanceCertificate {
  certificateNumber: string; // e.g. "FOG-SAFE-AZ-2026-XXXXX"
  corridorId: FogCorridorId;
  corridorNameAz: string;
  roadCode: string;
  vehiclePlate: string;
  vehicleModel: string;
  issuedAt: string;
  validUntil: string;
  measuredVisibilityMeters: number;
  visibilityTier: VisibilityTier;
  assignedVslSpeedKmH: number;
  roadSurface: RoadSurfaceCondition;
  escortRequired: boolean;
  barrierReleasePin: string;
  simaDigitalUid: string;
  sha256Checksum: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

/**
 * Koschmieder's Law:
 * V = -ln(0.05) / k ≈ 2.996 / k ≈ 3.0 / k
 * where V is Meteorological Optical Range (MOR) in meters and k is extinction coefficient in m^-1.
 */
export const calculateKoschmiederVisibility = (extinctionCoefficientK: number): number => {
  if (extinctionCoefficientK <= 0) return 10000;
  const visibility = 2.996 / extinctionCoefficientK;
  return Math.max(10, Math.round(visibility));
};

export const calculateExtinctionCoefficient = (visibilityMeters: number): number => {
  if (visibilityMeters <= 0) return 0.3;
  const k = 2.996 / visibilityMeters;
  return Math.round(k * 10000) / 10000;
};

export const determineVisibilityTier = (visibilityMeters: number): VisibilityTier => {
  if (visibilityMeters < 50) return 'CRITICAL_ZERO';
  if (visibilityMeters < 100) return 'DENSE_FOG';
  if (visibilityMeters < 200) return 'MODERATE_FOG';
  if (visibilityMeters < 500) return 'LIGHT_MIST';
  return 'CLEAR';
};

export const getSurfaceFrictionCoefficient = (surface: RoadSurfaceCondition): number => {
  switch (surface) {
    case 'dry_asphalt':
      return 0.75;
    case 'wet_damp':
      return 0.45;
    case 'slush_snow':
      return 0.25;
    case 'black_ice':
      return 0.12;
    default:
      return 0.50;
  }
};

export const getRecommendedVsl = (
  visibilityMeters: number,
  surface: RoadSurfaceCondition = 'wet_damp'
): number => {
  if (visibilityMeters < 50) return 40;
  if (visibilityMeters < 100) return surface === 'black_ice' ? 40 : 60;
  if (visibilityMeters < 200) return surface === 'black_ice' ? 50 : 80;
  if (visibilityMeters < 500) return surface === 'black_ice' ? 60 : 90;
  return surface === 'black_ice' ? 70 : 110;
};

/**
 * Vehicle Stopping Physics:
 * Reaction Distance: d_r = v * t_r  (v in m/s)
 * Braking Distance: d_b = v^2 / (2 * mu * g)
 * Total Stopping Distance: d_stop = d_r + d_b
 */
export const calculateStoppingPhysics = (
  speedKmH: number,
  surface: RoadSurfaceCondition,
  reactionTimeSeconds = 1.4 // Default reaction time under reduced visibility
): { reactionDist: number; brakingDist: number; totalStoppingDist: number; frictionCoeff: number } => {
  const speedMs = (speedKmH * 1000) / 3600;
  const mu = getSurfaceFrictionCoefficient(surface);
  const g = 9.81;

  const reactionDist = Math.round(speedMs * reactionTimeSeconds * 10) / 10;
  const brakingDist = Math.round(((speedMs * speedMs) / (2 * mu * g)) * 10) / 10;
  const totalStoppingDist = Math.round((reactionDist + brakingDist) * 10) / 10;

  return {
    reactionDist,
    brakingDist,
    totalStoppingDist,
    frictionCoeff: mu,
  };
};

export const evaluateSightDistanceRisk = (
  visibilityMeters: number,
  totalStoppingDist: number
): { marginMeters: number; riskLevel: 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'CRITICAL_HAZARD'; warningAz: string } => {
  const marginMeters = Math.round((visibilityMeters - totalStoppingDist) * 10) / 10;

  if (marginMeters >= 40) {
    return {
      marginMeters,
      riskLevel: 'SAFE',
      warningAz: 'Görmə sahəsi kifayətdir. Dayanma məsafəsi optik görünüşdən xeyli qısadır.',
    };
  }

  if (marginMeters >= 10) {
    return {
      marginMeters,
      riskLevel: 'CAUTION',
      warningAz: 'Məhdud ehtiyat zonası! Sürəti azaldın və ara məsafəsini genişləndirin.',
    };
  }

  if (marginMeters >= 0) {
    return {
      marginMeters,
      riskLevel: 'HIGH_RISK',
      warningAz: 'Yüksək qəza riski! Dayanma məsafəsi görünüş zonasının sərhədindədir. Zərbə qaçılmaz ola bilər.',
    };
  }

  return {
    marginMeters,
    riskLevel: 'CRITICAL_HAZARD',
    warningAz: 'FƏLAKƏT TƏHLÜKƏSİ! Dayanma məsafəsi görünüş məsafəsini aşır (Blind Driving). Zəncirvari toqquşma riski!',
  };
};

export const calculateVisibilityMetrics = (
  input: VisibilityCalculationInput
): VisibilityCalculationResult => {
  const { visibilityMeters, vehicleSpeedKmH, roadSurface, reactionTimeSeconds = 1.4, headwayGapMeters = 50 } = input;
  const extinctionCoefficientK = calculateExtinctionCoefficient(visibilityMeters);
  const visibilityTier = determineVisibilityTier(visibilityMeters);
  const recommendedVslKmH = getRecommendedVsl(visibilityMeters, roadSurface);

  const physics = calculateStoppingPhysics(vehicleSpeedKmH, roadSurface, reactionTimeSeconds);
  const risk = evaluateSightDistanceRisk(visibilityMeters, physics.totalStoppingDist);

  const speedMs = Math.max(1, (vehicleSpeedKmH * 1000) / 3600);
  const actualHeadwaySeconds = Math.round((headwayGapMeters / speedMs) * 10) / 10;

  let recommendedHeadwaySeconds = 3.0;
  if (visibilityTier === 'CRITICAL_ZERO') recommendedHeadwaySeconds = 6.0;
  else if (visibilityTier === 'DENSE_FOG') recommendedHeadwaySeconds = 5.0;
  else if (visibilityTier === 'MODERATE_FOG') recommendedHeadwaySeconds = 4.0;

  const isHeadwaySafe = actualHeadwaySeconds >= recommendedHeadwaySeconds;

  return {
    visibilityMeters,
    extinctionCoefficientK,
    visibilityTier,
    recommendedVslKmH,
    reactionDistanceMeters: physics.reactionDist,
    brakingDistanceMeters: physics.brakingDist,
    totalStoppingDistanceMeters: physics.totalStoppingDist,
    frictionCoefficient: physics.frictionCoeff,
    sightStoppingMarginMeters: risk.marginMeters,
    riskVerdict: risk.riskLevel,
    riskDescriptionAz: risk.warningAz,
    actualHeadwaySeconds,
    recommendedHeadwaySeconds,
    isHeadwaySafe,
  };
};

/**
 * Statutory Fines under the Code of Administrative Offences (İXM):
 * - İXM 328.1 (10-20 km/h excess): 10 AZN
 * - İXM 328.2 (21-40 km/h excess): 50 AZN + 2 bal
 * - İXM 328.3 (41-60 km/h excess): 150 AZN + 3 bal
 * - İXM 328.4 (>60 km/h excess): 250 AZN + 4 bal
 * - İXM 342.1.4 (Incorrect lighting / rear fog misuse in clear weather / blinding high beams): 30 AZN
 * - İXM 327.1 (Failure to keep safe headway distance in low visibility): 40 AZN
 * - 50% discount within 30 days under İXM 38
 */
export const calculateFogViolationFine = (
  actualSpeedKmH: number,
  vslSpeedKmH: number,
  headlightsViolation: boolean,
  rearFogMisuse: boolean,
  safeDistanceViolation: boolean,
  currency: Currency = 'AZN'
): FogViolationCalculation => {
  const speedExcessKmH = Math.max(0, actualSpeedKmH - vslSpeedKmH);
  let speedFineAzn = 0;
  let penaltyPoints = 0;
  const violationsSummaryAz: string[] = [];

  if (speedExcessKmH >= 61) {
    speedFineAzn = 250;
    penaltyPoints += 4;
    violationsSummaryAz.push(`İXM 328.4: Duman rejimində VSL sürət həddini +${speedExcessKmH} km/s aşma (250 ₼, 4 cərimə balı)`);
  } else if (speedExcessKmH >= 41) {
    speedFineAzn = 150;
    penaltyPoints += 3;
    violationsSummaryAz.push(`İXM 328.3: Duman rejimində VSL sürət həddini +${speedExcessKmH} km/s aşma (150 ₼, 3 cərimə balı)`);
  } else if (speedExcessKmH >= 21) {
    speedFineAzn = 50;
    penaltyPoints += 2;
    violationsSummaryAz.push(`İXM 328.2: Duman rejimində VSL sürət həddini +${speedExcessKmH} km/s aşma (50 ₼, 2 cərimə balı)`);
  } else if (speedExcessKmH >= 11) {
    speedFineAzn = 10;
    violationsSummaryAz.push(`İXM 328.1: Duman rejimində VSL sürət həddini +${speedExcessKmH} km/s aşma (10 ₼)`);
  }

  const headlightsFineAzn = headlightsViolation ? 30 : 0;
  if (headlightsViolation) {
    violationsSummaryAz.push('İXM 342.1.4: Dumanda uzaq vuran işıqların əks-parıltı yaradaraq istifadəsi və ya işıqsız hərəkət (30 ₼)');
  }

  const rearFogMisuseFineAzn = rearFogMisuse ? 30 : 0;
  if (rearFogMisuse) {
    violationsSummaryAz.push('İXM 342.1.4: Görünüş >50m olduqda arxa duman fənərinin arxadakı sürücünü kor edəcək şəkildə qanunsuz yandırılması (30 ₼)');
  }

  const safeDistanceFineAzn = safeDistanceViolation ? 40 : 0;
  if (safeDistanceViolation) {
    violationsSummaryAz.push('İXM 327.1: Dumanda təhlükəsiz ara və yan məsafə intervalının pozulması (40 ₼)');
  }

  const totalFineAzn = speedFineAzn + headlightsFineAzn + rearFogMisuseFineAzn + safeDistanceFineAzn;
  const promptDiscountFineAzn = Math.round((totalFineAzn * 0.5) * 100) / 100;

  const rate = currency === 'USD' ? 0.588 : currency === 'EUR' ? 0.54 : 1.0;
  const totalFineForeign = Math.round(totalFineAzn * rate * 100) / 100;
  const promptDiscountFineForeign = Math.round(promptDiscountFineAzn * rate * 100) / 100;

  return {
    actualSpeedKmH,
    vslSpeedKmH,
    speedExcessKmH,
    speedFineAzn,
    headlightsFineAzn,
    rearFogMisuseFineAzn,
    safeDistanceFineAzn,
    totalFineAzn,
    promptDiscountFineAzn,
    penaltyPoints,
    totalFineForeign,
    promptDiscountFineForeign,
    currency,
    violationsSummaryAz,
  };
};

export const evaluateFogChecklist = (
  checkedIds: string[],
  items: FogSafetyChecklistItem[]
): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  isCompliant: boolean;
  passedCount: number;
  totalCount: number;
  missingMandatoryCount: number;
} => {
  const totalCount = items.length;
  const passedCount = items.filter((item) => checkedIds.includes(item.id)).length;
  const mandatoryItems = items.filter((item) => item.isMandatory);
  const missingMandatoryCount = mandatoryItems.filter((item) => !checkedIds.includes(item.id)).length;

  const maxScore = 100;
  const pointsPerItem = totalCount > 0 ? maxScore / totalCount : 0;
  const totalScore = Math.round(passedCount * pointsPerItem);
  const percentage = Math.round((passedCount / totalCount) * 100);
  const isCompliant = missingMandatoryCount === 0 && percentage >= 80;

  return {
    totalScore,
    maxScore,
    percentage,
    isCompliant,
    passedCount,
    totalCount,
    missingMandatoryCount,
  };
};

export const evaluateFogExam = (
  answers: Record<number, number>,
  questions: FogExamQuestion[]
): {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
} => {
  const totalCount = questions.length;
  let correctCount = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      correctCount += 1;
    }
  });

  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const passed = percentage >= 80;

  return {
    score: correctCount * 10,
    maxScore: totalCount * 10,
    percentage,
    passed,
    correctCount,
    totalCount,
  };
};

export const generateFogCertificate = (
  corridor: FogCorridor,
  vehiclePlate: string,
  vehicleModel: string,
  measuredVisibilityMeters: number,
  roadSurface: RoadSurfaceCondition
): FogClearanceCertificate => {
  const now = new Date();
  const validUntilDate = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours validity during fog event

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `FOG-SAFE-AZ-2026-${randomNum}`;
  const barrierReleasePin = `${Math.floor(1000 + Math.random() * 9000)}`;
  const simaDigitalUid = `SIMA-FOG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;

  const visibilityTier = determineVisibilityTier(measuredVisibilityMeters);
  const assignedVslSpeedKmH = getRecommendedVsl(measuredVisibilityMeters, roadSurface);
  const escortRequired = measuredVisibilityMeters < 50;

  const rawHashData = `${certificateNumber}|${corridor.id}|${vehiclePlate}|${measuredVisibilityMeters}|${assignedVslSpeedKmH}|${now.toISOString()}`;
  let hash = 0;
  for (let i = 0; i < rawHashData.length; i++) {
    hash = (hash << 5) - hash + rawHashData.charCodeAt(i);
    hash |= 0;
  }
  const sha256Checksum = Math.abs(hash).toString(16).padStart(16, '0') + 'f09a87cd';

  return {
    certificateNumber,
    corridorId: corridor.id,
    corridorNameAz: corridor.nameAz,
    roadCode: corridor.roadCode,
    vehiclePlate,
    vehicleModel,
    issuedAt: now.toISOString().replace('T', ' ').substring(0, 19),
    validUntil: validUntilDate.toISOString().replace('T', ' ').substring(0, 19),
    measuredVisibilityMeters,
    visibilityTier,
    assignedVslSpeedKmH,
    roadSurface,
    escortRequired,
    barrierReleasePin,
    simaDigitalUid,
    sha256Checksum,
    status: 'ACTIVE',
  };
};
