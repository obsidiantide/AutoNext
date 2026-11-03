/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Land Transport Agency (AYNA) & Main State Traffic Police (BDYP)
 * Highway Ramp Metering, Intelligent Freeway On-Ramp Flow Control,
 * ALINEA Feedback Algorithm, Merge Acceleration Taper & Bottleneck Prevention SCADA Portal (RAMP-SAFE-AZ-2026)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   və yol qovşaqlarında hərəkətin təhlükəsizliyi, giriş rampalarının intellektual idarəetmə sistemləri)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 42, 50: Yol qovşaqlarında və birləşmə
 *   zolaqlarında hərəkət qaydaları, əsas axına yol vermə üstünlüyü və təhlükəsiz ara məsafəsi)
 * - European Standards EN 12675 (Traffic signal controllers - Functional safety),
 *   EN 50556 (Road traffic signal systems), TR 2516 (Ramp Metering Functional Specifications)
 * - ALINEA Local Feedback Ramp Metering Control Theory (Papageorgiou et al., Transportation Research Board)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.2: Ramp svetoforunun qırmızı işığında
 *   magistrala daxil olma - 80 AZN + 3 cərimə balı;
 *   İXM Maddə 327.1: Birləşmə zolağından çıxarkən əsas axındakı nəqliyyat vasitələrinə yol verməmə - 40 AZN;
 *   İXM Maddə 328.2: Rampa yaxınlaşmasında sürət həddini 20-40 km/saat aşma - 50 AZN + 2 bal;
 *   İXM Maddə 327.4: Birləşmə zolağında (taper) qanunsuz dayanma və ya tərs istiqamətdə manevr - 100 AZN + 4 bal;
 *   İXM Maddə 38: 30 gün ərzində cərimənin 50%-nin ödənilməsi hüququ)
 * - State Standards AZS 410 / AZS 342
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const RAMP_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const RAMP_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertRampCurrency(amountInAzn: number, currency: Currency): number {
  const rate = RAMP_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type MeteringMode =
  | 'OFF_FREE_FLOW'
  | 'ONE_CAR_PER_GREEN'
  | 'TWO_CAR_PER_GREEN'
  | 'QUEUE_FLUSH_OVERRIDE'
  | 'EMERGENCY_CLOSURE';

export type SignalHeadState = 'RED' | 'AMBER' | 'GREEN';

export type LevelOfService = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type VehicleClass =
  | 'PASSENGER_SEDAN'
  | 'ELECTRIC_EV'
  | 'AWD_SUV'
  | 'HEAVY_COMMERCIAL_TIR'
  | 'RIDESHARE_HYBRID'
  | 'TRANSIT_SHUTTLE_BUS'
  | 'BDYP_PATROL';

export interface RampStation {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  kmNumeric: number;
  gpsLat: number;
  gpsLng: number;
  mainlineLanes: number;
  rampLanes: number;
  taperLengthMeters: number;
  defaultMainlineFlow: number; // veh/h
  defaultDownstreamOccupancy: number; // %
  defaultRampDemand: number; // veh/h
  criticalOccupancyPercent: number; // typically 18.0 - 20.0%
  alertLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

export interface VehiclePreset {
  id: string;
  plate: string;
  model: string;
  classType: VehicleClass;
  curbWeightKg: number;
  accelerationRate: number; // m/s² (0-100 km/h acceleration capability)
  designMergeSpeedKmH: number; // km/h
  driverCategory: string;
  co2GramsKm: number;
  defaultViolation:
    | 'NONE'
    | 'RED_LIGHT_RUNNING'
    | 'FAILURE_TO_YIELD'
    | 'RAMP_SPEEDING'
    | 'ILLEGAL_TAPER_STOPPING';
}

export interface AlineaCalculationResult {
  meteringRateVehPerHour: number;
  cycleLengthSeconds: number;
  greenSeconds: number;
  amberSeconds: number;
  redSeconds: number;
  meteringMode: MeteringMode;
  queueOverrideActive: boolean;
  effectiveCapacityVehH: number;
  mainlineLevelOfService: LevelOfService;
  mainlineDensityVehKm: number;
}

export interface MergePhysicsResult {
  requiredTaperLengthMeters: number;
  actualTaperLengthMeters: number;
  taperSafetyRatio: number;
  criticalMergeGapSeconds: number;
  mergeCollisionProbabilityPercent: number;
  taperStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'HAZARDOUS_SHORT';
}

export interface StatutorySanctionsResult {
  violationCode: string;
  violationDescriptionAz: string;
  penaltyPoints: number;
  fineAmountAzn: number;
  fineAmountConverted: number;
  discountedFineAzn: number;
  discountedFineConverted: number;
  currency: Currency;
  legalArticle: string;
}

export interface TechnicalChecklistItem {
  id: string;
  code: string;
  titleAz: string;
  titleEn: string;
  category: 'DETECTOR_LOOPS' | 'SIGNAL_HEADS' | 'ALINEA_SCADA' | 'TAPER_SAFETY';
  referenceNorm: string;
  requiredMetric: string;
  defaultChecked: boolean;
}

export interface TheoreticalExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  statutoryReference: string;
  explanationAz: string;
}

export interface RampCertificate {
  certificateNumber: string; // e.g. RAMP-SAFE-AZ-2026-XXXXX
  simaSignatureUid: string;
  verificationPin: string;
  sha256Hash: string;
  vehiclePlate: string;
  vehicleModel: string;
  stationCode: string;
  stationName: string;
  corridor: string;
  picketKm: string;
  meteringRate: number;
  cycleTimeSec: number;
  greenTimeSec: number;
  levelOfService: LevelOfService;
  taperSafetyRatio: number;
  issueDate: string;
  validUntil: string;
  status: 'AUTHORIZED_CLEARED' | 'METERED_ADVISORY' | 'RESTRICTED';
}

/**
 * Computes ALINEA local feedback ramp metering rate:
 * r(k) = r(k-1) + Kr * (o_target - o_out)
 * Clamped between r_min (200 veh/h) and r_max (1200 veh/h for 1 lane, 2200 veh/h for 2 lanes).
 * If queue occupancy exceeds queueFlushThreshold (e.g. 80%), queue override takes precedence.
 */
export function calculateAlineaRate(params: {
  downstreamOccupancyPercent: number;
  targetOccupancyPercent?: number;
  previousRateVehPerHour?: number;
  krRegulatorParam?: number;
  rampQueueOccupancyPercent?: number;
  rampLanes?: number;
  preferredMode?: 'ONE_CAR_PER_GREEN' | 'TWO_CAR_PER_GREEN';
}): AlineaCalculationResult {
  const targetOcc = params.targetOccupancyPercent ?? 18.5;
  const prevRate = params.previousRateVehPerHour ?? 600;
  const Kr = params.krRegulatorParam ?? 70; // standard ALINEA parameter: 70 veh/h per % occupancy
  const queueOcc = params.rampQueueOccupancyPercent ?? 30;
  const rampLanes = params.rampLanes ?? 1;
  const preferredMode = params.preferredMode ?? 'ONE_CAR_PER_GREEN';

  const rMin = 200 * rampLanes;
  const rMax = preferredMode === 'TWO_CAR_PER_GREEN' ? 1800 * rampLanes : 1200 * rampLanes;

  // Raw ALINEA rate
  const occupancyDelta = targetOcc - params.downstreamOccupancyPercent;
  let rawRate = prevRate + Kr * occupancyDelta;

  // Queue override check (spillback protection)
  let queueOverrideActive = false;
  if (queueOcc >= 80) {
    queueOverrideActive = true;
    const overrideMin = 900 * rampLanes;
    if (rawRate < overrideMin) {
      rawRate = overrideMin;
    }
  }

  // Clamping
  const clampedRate = Math.min(rMax, Math.max(rMin, Math.round(rawRate)));

  // Mode assignment
  let meteringMode: MeteringMode = preferredMode;
  if (params.downstreamOccupancyPercent < 12 && queueOcc < 50) {
    meteringMode = 'OFF_FREE_FLOW';
  } else if (queueOverrideActive) {
    meteringMode = 'QUEUE_FLUSH_OVERRIDE';
  }

  // Cycle time C = 3600 / r (seconds per cycle)
  let cycleLengthSeconds = Math.round((3600 / clampedRate) * 10) / 10;
  cycleLengthSeconds = Math.max(4.0, Math.min(30.0, cycleLengthSeconds));

  const amberSeconds = 1.0;
  let greenSeconds = preferredMode === 'TWO_CAR_PER_GREEN' ? 4.0 : 2.0;
  if (meteringMode === 'OFF_FREE_FLOW') {
    greenSeconds = cycleLengthSeconds;
  }

  let redSeconds = Math.max(1.0, Math.round((cycleLengthSeconds - greenSeconds - amberSeconds) * 10) / 10);
  if (meteringMode === 'OFF_FREE_FLOW') {
    redSeconds = 0;
  }

  // Calculate mainline Level of Service (LOS) based on downstream occupancy
  let mainlineLevelOfService: LevelOfService = 'A';
  if (params.downstreamOccupancyPercent <= 10) {
    mainlineLevelOfService = 'A';
  } else if (params.downstreamOccupancyPercent <= 15) {
    mainlineLevelOfService = 'B';
  } else if (params.downstreamOccupancyPercent <= 20) {
    mainlineLevelOfService = 'C';
  } else if (params.downstreamOccupancyPercent <= 26) {
    mainlineLevelOfService = 'D';
  } else if (params.downstreamOccupancyPercent <= 32) {
    mainlineLevelOfService = 'E';
  } else {
    mainlineLevelOfService = 'F';
  }

  // Mainline density estimation: k ≈ occupancy / (vehicle_length + loop_length)
  // Assuming average vehicle + sensor footprint = 7.5 meters
  const mainlineDensityVehKm = Math.round((params.downstreamOccupancyPercent / 100) * (1000 / 7.5));
  const effectiveCapacityVehH = 2200 * rampLanes;

  return {
    meteringRateVehPerHour: clampedRate,
    cycleLengthSeconds,
    greenSeconds,
    amberSeconds,
    redSeconds,
    meteringMode,
    queueOverrideActive,
    effectiveCapacityVehH,
    mainlineLevelOfService,
    mainlineDensityVehKm,
  };
}

/**
 * Calculates freeway merge acceleration taper requirements and gap acceptance probability.
 * L_req = (v_main² - v_ramp²) / (2 * a_acc)
 */
export function calculateMergePhysics(params: {
  mainlineSpeedKmH: number;
  rampReleaseSpeedKmH: number;
  accelerationRateMS2: number; // typical 1.5 - 2.5 m/s²
  actualTaperLengthMeters: number;
  mainlineFlowVehPerHour: number;
}): MergePhysicsResult {
  const vMainMS = (params.mainlineSpeedKmH * 1000) / 3600;
  const vRampMS = (params.rampReleaseSpeedKmH * 1000) / 3600;
  const aAcc = Math.max(0.8, params.accelerationRateMS2);

  // Required acceleration length: v² - u² = 2*a*s => s = (v² - u²) / (2a)
  const deltaV2 = Math.max(0, Math.pow(vMainMS, 2) - Math.pow(vRampMS, 2));
  const rawReqTaper = deltaV2 / (2 * aAcc);
  // Add 40m merging maneuver observation distance
  const requiredTaperLengthMeters = Math.round(rawReqTaper + 40);

  const actualTaper = Math.max(30, params.actualTaperLengthMeters);
  const taperSafetyRatio = Math.round((actualTaper / Math.max(1, requiredTaperLengthMeters)) * 100) / 100;

  // Critical merge gap tau_c (seconds)
  // Faster mainlines require longer critical gaps
  const baseGap = 3.5; // seconds
  const speedDifferenceKmH = Math.max(0, params.mainlineSpeedKmH - params.rampReleaseSpeedKmH);
  const criticalMergeGapSeconds = Math.round((baseGap + speedDifferenceKmH * 0.04) * 10) / 10;

  // Probability of merge conflict or required heavy braking:
  // Poisson headway model: P(gap < tau_c) = 1 - e^(-lambda * tau_c), where lambda = q / 3600
  const lambda = Math.max(100, params.mainlineFlowVehPerHour) / 3600;
  const mergeConflictProb = 1 - Math.exp(-lambda * criticalMergeGapSeconds);
  const mergeCollisionProbabilityPercent = Math.min(
    95,
    Math.round((mergeConflictProb * (taperSafetyRatio < 1.0 ? 1.5 : 0.8)) * 100)
  );

  let taperStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'HAZARDOUS_SHORT' = 'OPTIMAL';
  if (taperSafetyRatio < 0.85) {
    taperStatus = 'HAZARDOUS_SHORT';
  } else if (taperSafetyRatio < 1.15) {
    taperStatus = 'ACCEPTABLE';
  }

  return {
    requiredTaperLengthMeters,
    actualTaperLengthMeters: actualTaper,
    taperSafetyRatio,
    criticalMergeGapSeconds,
    mergeCollisionProbabilityPercent,
    taperStatus,
  };
}

/**
 * Calculates statutory administrative penalties under Azerbaijani law.
 */
export function evaluateStatutorySanctions(
  violation: VehiclePreset['defaultViolation'],
  currency: Currency = 'AZN'
): StatutorySanctionsResult {
  switch (violation) {
    case 'RED_LIGHT_RUNNING':
      return {
        violationCode: 'IXM_327_2_RAMP_RED',
        violationDescriptionAz:
          'Ramp svetoforunun qırmızı işığının tələbinə məhəl qoymadan magistral yola icazəsiz daxil olma',
        penaltyPoints: 3,
        fineAmountAzn: 80,
        fineAmountConverted: convertRampCurrency(80, currency),
        discountedFineAzn: 40,
        discountedFineConverted: convertRampCurrency(40, currency),
        currency,
        legalArticle: 'İXM Maddə 327.2 (80 AZN + 3 bal; 30 gün ərzində 50% endirimlə 40 AZN)',
      };
    case 'FAILURE_TO_YIELD':
      return {
        violationCode: 'IXM_327_1_MERGE_YIELD',
        violationDescriptionAz:
          'Birləşmə zolağından əsas magistral xəttə daxil olarkən hərəkət üstünlüyünə malik nəqliyyat vasitələrinə yol verməmə',
        penaltyPoints: 0,
        fineAmountAzn: 40,
        fineAmountConverted: convertRampCurrency(40, currency),
        discountedFineAzn: 20,
        discountedFineConverted: convertRampCurrency(20, currency),
        currency,
        legalArticle: 'İXM Maddə 327.1 (40 AZN; 30 gün ərzində 50% endirimlə 20 AZN)',
      };
    case 'RAMP_SPEEDING':
      return {
        violationCode: 'IXM_328_2_RAMP_SPEED',
        violationDescriptionAz:
          'Rampa yaxınlaşmasında və ya birləşmə qövsündə müəyyən edilmiş təhlükəsiz sürət həddini 20-40 km/saat aşma',
        penaltyPoints: 2,
        fineAmountAzn: 50,
        fineAmountConverted: convertRampCurrency(50, currency),
        discountedFineAzn: 25,
        discountedFineConverted: convertRampCurrency(25, currency),
        currency,
        legalArticle: 'İXM Maddə 328.2 (50 AZN + 2 bal; 30 gün ərzində 50% endirimlə 25 AZN)',
      };
    case 'ILLEGAL_TAPER_STOPPING':
      return {
        violationCode: 'IXM_327_4_TAPER_STOPPING',
        violationDescriptionAz:
          'Birləşmə zolağında (taper) qanunsuz dayanma, durma və ya təhlükəli geriyə hərəkət manevri',
        penaltyPoints: 4,
        fineAmountAzn: 100,
        fineAmountConverted: convertRampCurrency(100, currency),
        discountedFineAzn: 50,
        discountedFineConverted: convertRampCurrency(50, currency),
        currency,
        legalArticle: 'İXM Maddə 327.4 (100 AZN + 4 bal; 30 gün ərzində 50% endirimlə 50 AZN)',
      };
    case 'NONE':
    default:
      return {
        violationCode: 'COMPLIANT_NO_VIOLATION',
        violationDescriptionAz:
          'İntellektual rampa və birləşmə zolağı qaydalarına tam riayət edilib, qayda pozuntusu aşkarlanmayıb',
        penaltyPoints: 0,
        fineAmountAzn: 0,
        fineAmountConverted: 0,
        discountedFineAzn: 0,
        discountedFineConverted: 0,
        currency,
        legalArticle: 'YHQ Maddə 42 / İXM Qayda Pozuntusu Yoxdur (0 AZN)',
      };
  }
}

/**
 * Generates an official cryptographic RAMP-SAFE-AZ-2026 electronic clearance certificate.
 */
export function generateRampCertificate(params: {
  vehiclePlate: string;
  vehicleModel: string;
  station: RampStation;
  meteringRate: number;
  cycleTimeSec: number;
  greenTimeSec: number;
  levelOfService: LevelOfService;
  taperSafetyRatio: number;
}): RampCertificate {
  const cleanPlate = params.vehiclePlate.trim().toUpperCase() || '99-RP-101';
  const salt = `${cleanPlate}-${params.station.code}-${params.meteringRate}-${Date.now()}`;

  // Simple pseudo SHA-256 hex generator for cryptographic authenticity mock
  let hashVal = 0x811c9dc5;
  for (let i = 0; i < salt.length; i++) {
    hashVal ^= salt.charCodeAt(i);
    hashVal = (hashVal * 0x01000193) >>> 0;
  }
  const hexPart = hashVal.toString(16).padStart(8, '0');
  const sha256Hash = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b${hexPart}`;

  const certNumber = `RAMP-SAFE-AZ-2026-${hexPart.toUpperCase().slice(0, 5)}`;
  const simaSignatureUid = `SIMA-RAMP-AZ-${hexPart.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const verificationPin = `${Math.floor(100000 + Math.random() * 900000)}`;

  const now = new Date();
  const issueDate = now.toISOString().slice(0, 10);
  const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  let status: RampCertificate['status'] = 'AUTHORIZED_CLEARED';
  if (params.levelOfService === 'F' || params.taperSafetyRatio < 0.8) {
    status = 'RESTRICTED';
  } else if (params.levelOfService === 'E' || params.taperSafetyRatio < 1.0) {
    status = 'METERED_ADVISORY';
  }

  return {
    certificateNumber: certNumber,
    simaSignatureUid,
    verificationPin,
    sha256Hash,
    vehiclePlate: cleanPlate,
    vehicleModel: params.vehicleModel,
    stationCode: params.station.code,
    stationName: params.station.nameAz,
    corridor: params.station.corridor,
    picketKm: params.station.picketKm,
    meteringRate: params.meteringRate,
    cycleTimeSec: params.cycleTimeSec,
    greenTimeSec: params.greenTimeSec,
    levelOfService: params.levelOfService,
    taperSafetyRatio: params.taperSafetyRatio,
    issueDate,
    validUntil: expiryDate,
    status,
  };
}
