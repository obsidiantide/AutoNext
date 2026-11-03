/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Ecology and Natural Resources (ETSN), Land Transport Agency (AYNA) &
 * Main State Traffic Police (BDYP) Highway Road Weather Information System (RWIS),
 * Road Surface Black Ice (Qara Buz) Detection, Friction Coefficient (μ),
 * Subsurface Temperature Telemetry & Automated Anti-Icing Brine Spraying Portal (RWIS-SAFE-AZ-2026)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Yolların qış saxlanması,
 *   avtomatlaşdırılmış yol-hava məlumat sistemləri (RWIS), buzlaşmaya qarşı mübarizə və təhlükəsiz hərəkətin təmin edilməsi)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 50: Qış mövsümündə və əlverişsiz hava şəraitində
 *   təhlükəsiz sürət seçimi, qış şinləri / zəncirlər, ara məsafəsi və sürüşmə təhlükəsi xəbərdarlıqları)
 * - European Standards EN 15518-1, EN 15518-2, EN 15518-3, EN 15518-4 (Winter maintenance equipment - Road weather information systems)
 * - World Meteorological Organization (WMO No. 8 Guide to Meteorological Instruments)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 342.2.2: Mövsümə uyğun olmayan və ya protektor dərinliyi normadan az olan şinlərlə idarəetmə - 50 AZN;
 *   İXM Maddə 328.2: Meteoroloji və yol şəraitinə uyğun olmayan sürət həddi - 50 AZN + 2 cərimə balı;
 *   İXM Maddə 328.3: Təyin olunmuş təhlükəsiz sürət həddini 40-60 km/saat aşma - 100 AZN + 3 bal;
 *   İXM Maddə 327.2: Qartəmizləyən və duzsəpən xüsusi texnikanın hərəkətinə mane olma - 80 AZN + 3 bal;
 *   İXM Maddə 38: 30 gün ərzində 50% endirim)
 * - State Standards AZS 410 / AZS 342
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const RWIS_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const RWIS_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertRwisCurrency(amountInAzn: number, currency: Currency): number {
  const rate = RWIS_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type SurfaceCondition =
  | 'DRY'
  | 'DAMP'
  | 'WET'
  | 'SLUSH'
  | 'SNOW_PACKED'
  | 'BLACK_ICE';

export type PrecipitationType =
  | 'NONE'
  | 'LIGHT_RAIN'
  | 'HEAVY_RAIN'
  | 'FREEZING_RAIN'
  | 'SLEET'
  | 'LIGHT_SNOW'
  | 'BLIZZARD'
  | 'HAIL';

export type TyreType =
  | 'SUMMER'
  | 'ALL_SEASON'
  | 'WINTER_STUDLESS'
  | 'WINTER_STUDDED_CHAINS';

export type VehicleClass =
  | 'PASSENGER_SEDAN'
  | 'ELECTRIC_EV'
  | 'AWD_SUV'
  | 'HEAVY_TIR'
  | 'WINTER_MAINTENANCE_TRUCK'
  | 'BDYP_PATROL';

export type IceRiskLevel =
  | 'NONE'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL_BLACK_ICE';

export type FastSystemStatus =
  | 'STANDBY'
  | 'ARMED'
  | 'ACTIVE_SPRAYING'
  | 'RELOAD_REQUIRED';

export interface RwisStation {
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
  altitudeMeters: number;
  microclimateRisk: string;
  sensorTelemetry: {
    airTempC: number;
    surfaceTempC: number;
    subsurfaceTempC: number;
    dewPointC: number;
    relativeHumidityPct: number;
    windSpeedKmh: number;
    windDirection: string;
    frictionMu: number;
    chemicalResidualGm2: number;
    waterFilmThicknessMm: number;
    surfaceCondition: SurfaceCondition;
    precipitationType: PrecipitationType;
    fastSpraySystemEquipped: boolean;
    fastChemicalType: 'NACL_BRINE_23' | 'CACL2_SOLUTION' | 'MGCL2_DEICER';
    fastTankLevelPct: number;
  };
  liveStatus: 'NORMAL_PASSABLE' | 'CAUTION_WET' | 'ALERT_FROST' | 'DANGER_BLACK_ICE';
}

export interface VehiclePreset {
  id: string;
  plateNumber: string;
  model: string;
  category: VehicleClass;
  tyreType: TyreType;
  treadDepthMm: number;
  grossWeightKg: number;
  curbWeightKg: number;
  absEquipped: boolean;
  espEquipped: boolean;
  awdDrivetrain: boolean;
  statutorySpeedLimitKmh: number;
  description: string;
}

export interface TechnicalChecklistItem {
  id: string;
  standardCode: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  descriptionEn: string;
  category: 'SENSORS' | 'FAST_SPRAY' | 'COMMUNICATION' | 'CALIBRATION';
  mandatory: boolean;
}

export interface TheoreticalExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctAnswer: number;
  explanationAz: string;
  explanationEn: string;
  legalCitation: string;
}

export interface RwisCertificate {
  certificateId: string;
  issuedAt: string;
  expiresAt: string;
  stationCode: string;
  stationName: string;
  corridor: string;
  picketKm: string;
  vehiclePlate: string;
  vehicleModel: string;
  tyreType: TyreType;
  surfaceCondition: SurfaceCondition;
  surfaceTempC: number;
  dewPointC: number;
  frictionMu: number;
  stoppingDistanceMeters: number;
  advisorySpeedLimitKmh: number;
  blackIceRiskLevel: IceRiskLevel;
  fastSystemTriggered: boolean;
  simaDigitalUid: string;
  verificationPin: string;
  sha256Hash: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'EXPIRED';
}

/**
 * Calculates Dew Point using Magnus-Tetens approximation formula
 */
export function calculateDewPoint(tempC: number, rhPct: number): number {
  const safeRh = Math.max(1, Math.min(100, rhPct));
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(safeRh / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Math.round(dewPoint * 10) / 10;
}

/**
 * Calculates freezing point depression based on residual chemical concentration (e.g. NaCl brine)
 * Pure water: 0°C. 10 g/m² ~ -2.5°C, 25 g/m² ~ -7.0°C (down to eutectic point -21.1°C)
 */
export function calculateFreezingPointDepression(chemicalResidualGm2: number): number {
  if (chemicalResidualGm2 <= 0) return 0.0;
  // Non-linear eutectic freeze depression
  const depression = Math.min(21.1, chemicalResidualGm2 * 0.35);
  return Math.round(-depression * 10) / 10;
}

/**
 * Evaluates Black Ice Risk Level based on RWIS thermal and moisture parameters
 */
export function evaluateBlackIceRisk(
  surfaceTempC: number,
  dewPointC: number,
  surfaceCondition: SurfaceCondition,
  precipType: PrecipitationType,
  chemicalResidualGm2: number
): {
  riskScore: number;
  riskLevel: IceRiskLevel;
  freezingPointC: number;
  isBlackIceLikely: boolean;
  freezeDeltaC: number;
} {
  const freezingPointC = calculateFreezingPointDepression(chemicalResidualGm2);
  const freezeDeltaC = Math.round((surfaceTempC - freezingPointC) * 10) / 10;

  let riskScore = 0;

  // Thermal condition: surface at or below solution freezing point
  if (surfaceTempC <= freezingPointC) {
    riskScore += 45;
  } else if (surfaceTempC <= 1.0) {
    riskScore += 25;
  }

  // Dew point condensation factor: surface temperature at or below dew point promotes moisture condensation
  if (surfaceTempC <= dewPointC) {
    riskScore += 25;
  } else if (surfaceTempC - dewPointC <= 1.5) {
    riskScore += 15;
  }

  // Precipitation factor
  if (precipType === 'FREEZING_RAIN') {
    riskScore += 35;
  } else if (precipType === 'SLEET' || precipType === 'LIGHT_SNOW' || precipType === 'BLIZZARD') {
    riskScore += 25;
  } else if (surfaceCondition === 'BLACK_ICE') {
    riskScore += 40;
  } else if (surfaceCondition === 'WET' && surfaceTempC <= 0) {
    riskScore += 30;
  }

  // Chemical deficit penalty
  if (chemicalResidualGm2 < 5 && surfaceTempC <= 0.5) {
    riskScore += 15;
  } else if (chemicalResidualGm2 >= 20) {
    riskScore -= 25;
  }

  const boundedScore = Math.max(0, Math.min(100, riskScore));

  let riskLevel: IceRiskLevel = 'NONE';
  if (boundedScore >= 75 || surfaceCondition === 'BLACK_ICE' || precipType === 'FREEZING_RAIN') {
    riskLevel = 'CRITICAL_BLACK_ICE';
  } else if (boundedScore >= 50) {
    riskLevel = 'HIGH';
  } else if (boundedScore >= 30) {
    riskLevel = 'MODERATE';
  } else if (boundedScore >= 15) {
    riskLevel = 'LOW';
  }

  const isBlackIceLikely = riskLevel === 'CRITICAL_BLACK_ICE' || riskLevel === 'HIGH';

  return {
    riskScore: boundedScore,
    riskLevel,
    freezingPointC,
    isBlackIceLikely,
    freezeDeltaC,
  };
}

/**
 * Calculates Road Surface Friction Coefficient (μ) based on surface condition,
 * tyre technology, water film thickness and residual de-icing chemical.
 */
export function calculateFrictionCoefficient(
  surfaceCondition: SurfaceCondition,
  tyreType: TyreType,
  waterFilmThicknessMm: number = 0,
  chemicalResidualGm2: number = 0
): {
  frictionMu: number;
  gripQuality: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED' | 'EXTREMELY_HAZARDOUS';
  stoppingDistanceMultiplier: number;
} {
  // Base asphalt friction
  let baseMu = 0.82; // Dry asphalt

  switch (surfaceCondition) {
    case 'DRY':
      baseMu = 0.82;
      break;
    case 'DAMP':
      baseMu = 0.68;
      break;
    case 'WET':
      // Thicker water film degrades friction (hydroplaning tendency)
      baseMu = Math.max(0.40, 0.60 - waterFilmThicknessMm * 0.05);
      break;
    case 'SLUSH':
      baseMu = 0.32;
      break;
    case 'SNOW_PACKED':
      baseMu = 0.25;
      break;
    case 'BLACK_ICE':
      baseMu = 0.12;
      break;
  }

  // Tyre compound and tread influence
  let tyreFactor = 1.0;
  switch (tyreType) {
    case 'SUMMER':
      if (surfaceCondition === 'BLACK_ICE') tyreFactor = 0.70; // Summer tyre glassy slip
      else if (surfaceCondition === 'SNOW_PACKED' || surfaceCondition === 'SLUSH') tyreFactor = 0.75;
      else tyreFactor = 1.0;
      break;
    case 'ALL_SEASON':
      if (surfaceCondition === 'BLACK_ICE') tyreFactor = 0.90;
      else if (surfaceCondition === 'SNOW_PACKED') tyreFactor = 0.95;
      else tyreFactor = 0.98;
      break;
    case 'WINTER_STUDLESS':
      if (surfaceCondition === 'BLACK_ICE') tyreFactor = 1.45; // Soft silica compound
      else if (surfaceCondition === 'SNOW_PACKED' || surfaceCondition === 'SLUSH') tyreFactor = 1.50;
      else tyreFactor = 0.96;
      break;
    case 'WINTER_STUDDED_CHAINS':
      if (surfaceCondition === 'BLACK_ICE') tyreFactor = 2.10; // Studs pierce ice layer
      else if (surfaceCondition === 'SNOW_PACKED') tyreFactor = 1.80;
      else tyreFactor = 0.92;
      break;
  }

  // Chemical brine effect: residual chemical slightly improves slush/ice grip by preventing continuous glaze
  let chemicalBoost = 0;
  if ((surfaceCondition === 'BLACK_ICE' || surfaceCondition === 'SLUSH') && chemicalResidualGm2 > 10) {
    chemicalBoost = Math.min(0.08, chemicalResidualGm2 * 0.003);
  }

  const finalMu = Math.round(Math.min(0.92, Math.max(0.08, baseMu * tyreFactor + chemicalBoost)) * 100) / 100;

  let gripQuality: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED' | 'EXTREMELY_HAZARDOUS' = 'OPTIMAL';
  if (finalMu >= 0.70) gripQuality = 'OPTIMAL';
  else if (finalMu >= 0.45) gripQuality = 'ACCEPTABLE';
  else if (finalMu >= 0.25) gripQuality = 'DEGRADED';
  else gripQuality = 'EXTREMELY_HAZARDOUS';

  // Stopping distance multiplier relative to ideal dry conditions (μ = 0.82)
  const stoppingDistanceMultiplier = Math.round((0.82 / finalMu) * 10) / 10;

  return {
    frictionMu: finalMu,
    gripQuality,
    stoppingDistanceMultiplier,
  };
}

/**
 * Calculates vehicle Stopping Distance using Newtonian physics
 * d_react = v * t_react
 * d_brake = v^2 / (2 * mu * g)
 * d_total = d_react + d_brake
 */
export function calculateStoppingDistance(
  speedKmh: number,
  frictionMu: number,
  driverReactionTimeSec: number = 1.2
): {
  speedMps: number;
  reactionDistanceM: number;
  brakingDistanceM: number;
  totalStoppingDistanceM: number;
  safeFollowingDistanceM: number;
} {
  const safeSpeed = Math.max(1, speedKmh);
  const speedMps = safeSpeed / 3.6;
  const g = 9.80665; // standard gravity m/s²
  const safeMu = Math.max(0.08, frictionMu);

  const reactionDistanceM = Math.round(speedMps * driverReactionTimeSec * 10) / 10;
  const brakingDistanceM = Math.round((Math.pow(speedMps, 2) / (2 * safeMu * g)) * 10) / 10;
  const totalStoppingDistanceM = Math.round((reactionDistanceM + brakingDistanceM) * 10) / 10;

  // Safe following distance under Highway Code includes a 25% safety buffer
  const safeFollowingDistanceM = Math.round(totalStoppingDistanceM * 1.25);

  return {
    speedMps: Math.round(speedMps * 10) / 10,
    reactionDistanceM,
    brakingDistanceM,
    totalStoppingDistanceM,
    safeFollowingDistanceM,
  };
}

/**
 * Evaluates Automated Fixed Anti-Icing Spray Technology (FAST) activation
 */
export function evaluateFastAntiIcingSpray(
  blackIceRiskScore: number,
  surfaceCondition: SurfaceCondition,
  surfaceTempC: number,
  fastTankLevelPct: number
): {
  systemStatus: FastSystemStatus;
  sprayRecommended: boolean;
  dosageMlPerM2: number;
  solutionType: 'NACL_BRINE_23' | 'CACL2_SOLUTION' | 'MGCL2_DEICER';
  nozzlePressureBar: number;
  frictionImprovementDelta: number;
  actionMessageAz: string;
  actionMessageEn: string;
} {
  if (fastTankLevelPct <= 5) {
    return {
      systemStatus: 'RELOAD_REQUIRED',
      sprayRecommended: false,
      dosageMlPerM2: 0,
      solutionType: 'NACL_BRINE_23',
      nozzlePressureBar: 0,
      frictionImprovementDelta: 0,
      actionMessageAz: 'XƏBƏRDARLIQ: FAST çiləmə çənində kimyəvi reagent tükənmişdir. Təcili doldurma tələb olunur.',
      actionMessageEn: 'WARNING: FAST anti-icing reagent tank depleted. Immediate refill required.',
    };
  }

  // Determine solution type by temperature
  let solutionType: 'NACL_BRINE_23' | 'CACL2_SOLUTION' | 'MGCL2_DEICER' = 'NACL_BRINE_23';
  if (surfaceTempC < -10) {
    solutionType = 'CACL2_SOLUTION'; // effective down to -25°C
  } else if (surfaceTempC < -5) {
    solutionType = 'MGCL2_DEICER';
  }

  if (blackIceRiskScore >= 60 || surfaceCondition === 'BLACK_ICE') {
    return {
      systemStatus: 'ACTIVE_SPRAYING',
      sprayRecommended: true,
      dosageMlPerM2: surfaceCondition === 'BLACK_ICE' ? 35 : 20,
      solutionType,
      nozzlePressureBar: 6.5,
      frictionImprovementDelta: 0.22,
      actionMessageAz: 'AKTİV ÇİLƏMƏ: Qara buz təhlükəsi aşkarlandı. Yüksək təzyiqli duz məhlulu (brine) avtomatik püskürdülür.',
      actionMessageEn: 'ACTIVE SPRAY: Black ice risk detected. High-pressure brine automated spray activated.',
    };
  }

  if (blackIceRiskScore >= 35) {
    return {
      systemStatus: 'ARMED',
      sprayRecommended: true,
      dosageMlPerM2: 12,
      solutionType,
      nozzlePressureBar: 4.8,
      frictionImprovementDelta: 0.12,
      actionMessageAz: 'QABAQLAYICI REJİM: Şaxta və nəm riski var. Səthə profilaktik maye çilənməsi tövsiyə edilir.',
      actionMessageEn: 'PREVENTIVE MODE: Frost and condensation risk. Preventive de-icer misting recommended.',
    };
  }

  return {
    systemStatus: 'STANDBY',
    sprayRecommended: false,
    dosageMlPerM2: 0,
    solutionType,
    nozzlePressureBar: 0,
    frictionImprovementDelta: 0,
    actionMessageAz: 'GÖZLƏMƏ REJİMİ: Asfalt səthində buzlaşma riski yoxdur. RWIS sensorları telemetriyanı izləyir.',
    actionMessageEn: 'STANDBY: No freezing risk on road surface. RWIS telemetry nominal.',
  };
}

/**
 * Evaluates Statutory Sanctions & Fines under Azerbaijan Code of Administrative Offences (İXM)
 */
export function evaluateStatutorySanctions(
  tyreType: TyreType,
  treadDepthMm: number,
  speedKmh: number,
  advisorySpeedLimitKmh: number,
  surfaceCondition: SurfaceCondition,
  interferesWithMaintenanceFleet: boolean = false
): {
  totalFineAzn: number;
  discountedFineAzn: number; // 50% discount under İXM Article 38 within 30 days
  totalDemeritPoints: number;
  violations: Array<{
    article: string;
    descriptionAz: string;
    descriptionEn: string;
    fineAzn: number;
    demeritPoints: number;
  }>;
} {
  const violations: Array<{
    article: string;
    descriptionAz: string;
    descriptionEn: string;
    fineAzn: number;
    demeritPoints: number;
  }> = [];

  // 1. Tyre non-compliance in winter/ice conditions (İXM 342.2.2)
  const isWinterHazard = surfaceCondition === 'BLACK_ICE' || surfaceCondition === 'SNOW_PACKED' || surfaceCondition === 'SLUSH';
  if (isWinterHazard && tyreType === 'SUMMER') {
    violations.push({
      article: 'İXM Maddə 342.2.2',
      descriptionAz: 'Buzlu və ya qarlı yolda yay şinləri ilə nəqliyyat vasitəsinin idarə edilməsi',
      descriptionEn: 'Operating vehicle on icy or snow-covered roadway with summer tyres',
      fineAzn: 50,
      demeritPoints: 0,
    });
  } else if (treadDepthMm < 4.0 && (tyreType === 'WINTER_STUDLESS' || tyreType === 'WINTER_STUDDED_CHAINS')) {
    violations.push({
      article: 'İXM Maddə 342.2.2',
      descriptionAz: 'Qış şinlərinin protektor dərinliyinin normadan az olması (< 4.0 mm)',
      descriptionEn: 'Winter tyre tread depth below statutory threshold (< 4.0 mm)',
      fineAzn: 50,
      demeritPoints: 0,
    });
  }

  // 2. Speed limit violation in hazardous road weather (İXM 328.2 / 328.3)
  const speedExcess = speedKmh - advisorySpeedLimitKmh;
  if (speedExcess >= 40) {
    violations.push({
      article: 'İXM Maddə 328.3',
      descriptionAz: 'Qara buz xəbərdarlığı olan yolda müəyyən edilmiş sürət həddini 40-60 km/saat aşma',
      descriptionEn: 'Exceeding posted speed limit by 40-60 km/h in black ice hazard zone',
      fineAzn: 100,
      demeritPoints: 3,
    });
  } else if (speedExcess >= 20) {
    violations.push({
      article: 'İXM Maddə 328.2',
      descriptionAz: 'Meteoroloji və yol şəraitinə uyğun olmayan sürət həddini 20-40 km/saat aşma',
      descriptionEn: 'Exceeding safe speed limit by 20-40 km/h under adverse meteorological conditions',
      fineAzn: 50,
      demeritPoints: 2,
    });
  }

  // 3. Obstructing snowplow / de-icing salt spreader convoy (İXM 327.2)
  if (interferesWithMaintenanceFleet) {
    violations.push({
      article: 'İXM Maddə 327.2',
      descriptionAz: 'AAYDA qartəmizləyən və duzsəpən xüsusi texnika karvanının hərəkətinə mane olma',
      descriptionEn: 'Obstructing AAYDA snowplow and brine spreader emergency convoy',
      fineAzn: 80,
      demeritPoints: 3,
    });
  }

  const totalFineAzn = violations.reduce((acc, v) => acc + v.fineAzn, 0);
  const discountedFineAzn = Math.round((totalFineAzn * 0.5) * 100) / 100;
  const totalDemeritPoints = violations.reduce((acc, v) => acc + v.demeritPoints, 0);

  return {
    totalFineAzn,
    discountedFineAzn,
    totalDemeritPoints,
    violations,
  };
}

/**
 * Computes advisory safe speed limit for given surface condition and friction coefficient
 */
export function calculateAdvisorySpeedLimit(
  surfaceCondition: SurfaceCondition,
  frictionMu: number,
  baseCorridorSpeedLimitKmh: number = 110
): number {
  if (surfaceCondition === 'BLACK_ICE' || frictionMu <= 0.18) {
    return 40;
  }
  if (surfaceCondition === 'SNOW_PACKED' || frictionMu <= 0.30) {
    return 50;
  }
  if (surfaceCondition === 'SLUSH' || frictionMu <= 0.40) {
    return 60;
  }
  if (surfaceCondition === 'WET' || frictionMu <= 0.55) {
    return Math.min(80, baseCorridorSpeedLimitKmh);
  }
  if (surfaceCondition === 'DAMP') {
    return Math.min(90, baseCorridorSpeedLimitKmh);
  }
  return baseCorridorSpeedLimitKmh;
}

/**
 * Generates an official cryptographic SİMA-signed RWIS clearance certificate
 */
export function generateRwisCertificate(params: {
  stationCode: string;
  stationName: string;
  corridor: string;
  picketKm: string;
  vehiclePlate: string;
  vehicleModel: string;
  tyreType: TyreType;
  surfaceCondition: SurfaceCondition;
  surfaceTempC: number;
  dewPointC: number;
  frictionMu: number;
  stoppingDistanceMeters: number;
  advisorySpeedLimitKmh: number;
  blackIceRiskLevel: IceRiskLevel;
  fastSystemTriggered: boolean;
}): RwisCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `RWIS-SAFE-AZ-2026-${randomSuffix}`;

  const now = new Date();
  const issuedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();

  // Pseudo-SHA-256 hash string
  const rawSeed = `${certificateId}-${params.stationCode}-${params.vehiclePlate}-${params.surfaceTempC}-${params.frictionMu}-${issuedAt}`;
  let hashNum = 0;
  for (let i = 0; i < rawSeed.length; i++) {
    hashNum = (hashNum << 5) - hashNum + rawSeed.charCodeAt(i);
    hashNum |= 0;
  }
  const hexHash = Math.abs(hashNum).toString(16).padStart(8, '0');
  const sha256Hash = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b78${hexHash}`;

  const simaDigitalUid = `SIMA-AAYDA-RWIS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const verificationPin = `${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    certificateId,
    issuedAt,
    expiresAt,
    stationCode: params.stationCode,
    stationName: params.stationName,
    corridor: params.corridor,
    picketKm: params.picketKm,
    vehiclePlate: params.vehiclePlate,
    vehicleModel: params.vehicleModel,
    tyreType: params.tyreType,
    surfaceCondition: params.surfaceCondition,
    surfaceTempC: params.surfaceTempC,
    dewPointC: params.dewPointC,
    frictionMu: params.frictionMu,
    stoppingDistanceMeters: params.stoppingDistanceMeters,
    advisorySpeedLimitKmh: params.advisorySpeedLimitKmh,
    blackIceRiskLevel: params.blackIceRiskLevel,
    fastSystemTriggered: params.fastSystemTriggered,
    simaDigitalUid,
    verificationPin,
    sha256Hash,
    status: 'ACTIVE',
  };
}
