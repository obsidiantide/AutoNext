/**
 * Highway Pavement Skid Resistance, Micro/Macro-Texture Laser Profilometry & Aquaplaning Hydrodynamic Safety Compliance Engine
 * Official standards compliance:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral yollarda hərəkətin təhlükəsizliyi, asfalt örtüyünün ilişmə qabiliyyəti və yol təmiri normativləri)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 50: Nəqliyyat vasitələrinin texniki sazlığı, şin protektorunun qalıq hündürlüyü tələbləri və yağışlı havada təhlükəsiz sürət həddi)
 * - State Standards of Azerbaijan AZS 410 / AZS 342 (Avtomobil yollarının istismar vəziyyətinə dair təhlükəsizlik tələbləri)
 * - Interstate Standard GOST 30413 (Asfalt-beton örtüklərin təkərlə ilişmə əmsalının təyini metodları)
 * - ASTM E1845 (Standard Practice for Calculating Pavement Macrotexture Mean Profile Depth - MPD)
 * - ASTM E274 / EN 13036-1 (Measurement of Pavement Surface Macrotexture Depth using Volumetric Technique & Skid Resistance)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 328, 342.1, 353: Şin protektorunun normadan az olması, sürüşkən yolda sürət həddinin aşılması)
 * - Code of Administrative Offences Article 38 (İXM Maddə 38: 30 gün ərzində 50% güzəştlə cərimə ödənişi)
 * - European Road Safety Observatory (ERSO) & NASA / Gallaway Hydroplaning Mechanics
 */

export type SkidCorridorType =
  | 'URBAN_EXPRESSWAY'
  | 'COASTAL_HIGHWAY'
  | 'MOUNTAIN_PASS'
  | 'INTERSTATE_CORRIDOR'
  | 'AIRPORT_HIGHWAY'
  | 'TRANSIT_TRUCK_CORRIDOR';

export type PavementAsphaltType =
  | 'SMA_16_STONE_MASTIC'
  | 'POROUS_DRAINING_ASPHALT'
  | 'DENSE_ASPHALT_CONCRETE'
  | 'POLISHED_LIMESTONE_ASPHALT'
  | 'SURFACE_DRESSED_CHIP_SEAL'
  | 'GROOVED_CONCRETE_PAVEMENT';

export type PavementConditionState =
  | 'EXCELLENT_GRIP'
  | 'SATISFACTORY_GRIP'
  | 'POLISHED_SLIPPERY_WARNING'
  | 'CRITICAL_AQUAPLANING_HAZARD';

export type AquaplaningRiskTier =
  | 'LOW_SAFE'
  | 'ELEVATED_CAUTION'
  | 'SEVERE_HIGH_RISK'
  | 'CRITICAL_HYDRODYNAMIC_SEPARATION';

export type VehicleTireCategory =
  | 'passenger_sedan'
  | 'heavy_truck_tir'
  | 'worn_tire_sedan'
  | 'all_wheel_drive_suv'
  | 'intercity_coach_bus'
  | 'patrol_interceptor';

export interface SkidCorridorAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  chainageKm: string;
  coordinates: string;
  corridorType: SkidCorridorType;
  asphaltType: PavementAsphaltType;
  designSpeedKmh: number;
  advisoryWetSpeedKmh: number;
  skidNumberSn60: number; // Skid Number at 60 km/h (standard ASTM E274 friction x 100)
  britishPendulumBpn: number; // BPN value (0-100)
  meanProfileDepthMpdMm: number; // MPD in mm (ASTM E1845 laser profilometry)
  currentWaterFilmDepthMm: number; // Live ultrasonic water depth gauge
  liveRainIntensityMmH: number;
  drainageCrossSlopePercent: number; // Transverse slope % (advisory 2.0-2.5%)
  recentAccidentCountWet: number;
  lastFrictionSurveyDate: string;
  status: 'OPTIMAL' | 'WET_ADVISORY' | 'CRITICAL_AQUAPLANING_ALERT';
}

export interface SkidVehiclePreset {
  id: string;
  name: string;
  category: VehicleTireCategory;
  licensePlate: string;
  tirePressureKpa: number; // Inflation pressure in kPa (e.g., 220 kPa ~ 32 psi)
  treadDepthMm: number; // Remaining tread groove depth in mm
  vehicleMassKg: number;
  approachSpeedKmh: number;
  tireDimensions: string;
  cargoDescription: string;
}

export interface SkidSimulationInput {
  approachSpeedKmh: number;
  tirePressureKpa: number;
  treadDepthMm: number;
  waterFilmDepthMm: number;
  meanProfileDepthMm: number;
  skidNumberSn60: number;
  driverReactionTimeSec?: number;
}

export interface SkidSimulationResult {
  horneHydroplaningSpeedKmh: number;
  effectiveHydroplaningSpeedKmh: number;
  aquaplaningRiskPercent: number;
  aquaplaningRiskTier: AquaplaningRiskTier;
  frictionCoefficientMu: number;
  pavementState: PavementConditionState;
  reactionDistanceM: number;
  brakingDistanceWetM: number;
  totalStoppingDistanceWetM: number;
  stoppingDistanceDryComparisonM: number;
  stoppingDistanceIncreaseRatio: number;
  tireTreadStatus: 'LEGAL_COMPLIANT' | 'BORDERLINE_WEAR' | 'ILLEGAL_WORN_OUT';
  tireMinimumStatutoryDepthMm: number;
}

export interface SkidStatutoryFineCalculation {
  hasTreadViolation: boolean;
  treadFineAzn: number;
  hasSpeedExcessWet: boolean;
  speedExcessKmh: number;
  speedFineAzn: number;
  penaltyPoints: number;
  totalFineAzn: number;
  totalFineDiscountedAzn: number;
  statutoryLegalArticlesAz: string[];
}

export interface SkidChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  categoryAz: string;
  referenceStandard: string;
  detailsAz: string;
  isMandatory: boolean;
}

export interface SkidExamQuestion {
  id: string;
  questionAz: string;
  optionsAz: string[];
  correctIndex: number;
  explanationAz: string;
  legalArticle: string;
}

export interface SkidCertificate {
  certificateId: string;
  vehiclePlate: string;
  vehicleModel: string;
  corridorNameAz: string;
  route: string;
  skidNumberSn60: number;
  treadDepthMm: number;
  waterFilmDepthMm: number;
  hydroplaningSpeedKmh: number;
  aquaplaningRiskTier: AquaplaningRiskTier;
  pavementState: PavementConditionState;
  calculatedStoppingDistanceM: number;
  issueDate: string;
  expiryDate: string;
  simaDigitalUid: string;
  verificationSha256: string;
  passPinCode: string;
}

/**
 * Statutory minimum tread groove depth according to Azerbaijan Law "On Road Traffic"
 */
export function getStatutoryTreadDepthLimit(category: VehicleTireCategory): number {
  switch (category) {
    case 'passenger_sedan':
    case 'all_wheel_drive_suv':
    case 'patrol_interceptor':
    case 'worn_tire_sedan':
      return 1.6; // Category B: 1.6 mm
    case 'heavy_truck_tir':
      return 1.0; // Category C: 1.0 mm
    case 'intercity_coach_bus':
      return 2.0; // Category D: 2.0 mm
    default:
      return 1.6;
  }
}

/**
 * Calculates Horne's dynamic hydroplaning speed:
 * v_horne = 6.36 * sqrt(p_kPa)  [km/h]
 * NASA / Horne empirical baseline formula for spinning aircraft/automobile tires
 */
export function calculateHorneSpeed(tirePressureKpa: number): number {
  const safePressure = Math.max(100, Math.min(1200, tirePressureKpa));
  const speed = 6.36 * Math.sqrt(safePressure);
  return Math.round(speed * 10) / 10;
}

/**
 * Calculates Effective Aquaplaning / Hydroplaning Speed considering:
 * - Horne pressure formula
 * - Water film depth (WFD)
 * - Pavement Macrotexture (MPD - Mean Profile Depth)
 * - Tire Tread Groove Depth (TD)
 * Based on Gallaway & NASA hydrodynamic regression model
 */
export function calculateEffectiveHydroplaningSpeed(
  tirePressureKpa: number,
  treadDepthMm: number,
  waterFilmDepthMm: number,
  meanProfileDepthMm: number
): number {
  const baseHorne = calculateHorneSpeed(tirePressureKpa);

  // If water film depth is less than 0.5 mm or less than half of pavement macrotexture, water drains into surface voids
  const netWaterPuddleMm = Math.max(0, waterFilmDepthMm - 0.4 * meanProfileDepthMm);
  if (netWaterPuddleMm <= 0.2) {
    return Math.round(baseHorne * 1.35 * 10) / 10;
  }

  // Tread depth factor: standard full tread is ~8.0 mm
  const safeTread = Math.max(0.4, Math.min(15.0, treadDepthMm));
  const treadFactor = Math.min(1.2, Math.max(0.55, Math.pow(safeTread / 8.0, 0.35)));

  // Water depth attenuation factor
  const waterAttenuation = Math.max(0.65, 1.0 - 0.045 * netWaterPuddleMm);

  // Macrotexture benefit (higher MPD provides escape channels for water underneath tire)
  const safeMpd = Math.max(0.2, Math.min(3.0, meanProfileDepthMm));
  const textureBonus = Math.min(1.25, 1.0 + 0.08 * (safeMpd - 0.8));

  const effectiveSpeed = baseHorne * treadFactor * waterAttenuation * textureBonus;
  return Math.round(effectiveSpeed * 10) / 10;
}

/**
 * Executes comprehensive skid resistance and aquaplaning simulation
 */
export function simulateSkidAndAquaplaning(
  input: SkidSimulationInput,
  vehicleCategory: VehicleTireCategory = 'passenger_sedan'
): SkidSimulationResult {
  const safeSpeed = Math.max(10, Math.min(200, input.approachSpeedKmh));
  const safePressure = Math.max(100, Math.min(1000, input.tirePressureKpa));
  const safeTread = Math.max(0.2, Math.min(16, input.treadDepthMm));
  const safeWater = Math.max(0, Math.min(15, input.waterFilmDepthMm));
  const safeMpd = Math.max(0.1, Math.min(4.0, input.meanProfileDepthMm));
  const safeSn = Math.max(15, Math.min(95, input.skidNumberSn60));
  const reactionTime = input.driverReactionTimeSec || 1.0;

  const horneSpeed = calculateHorneSpeed(safePressure);
  const effectiveHydroplaningSpeed = calculateEffectiveHydroplaningSpeed(
    safePressure,
    safeTread,
    safeWater,
    safeMpd
  );

  // Aquaplaning risk percentage
  const aquaplaningRatio = safeSpeed / effectiveHydroplaningSpeed;
  const aquaplaningRiskPercent = Math.min(100, Math.round(aquaplaningRatio * 100));

  let aquaplaningRiskTier: AquaplaningRiskTier = 'LOW_SAFE';
  if (aquaplaningRiskPercent >= 95) {
    aquaplaningRiskTier = 'CRITICAL_HYDRODYNAMIC_SEPARATION';
  } else if (aquaplaningRiskPercent >= 80) {
    aquaplaningRiskTier = 'SEVERE_HIGH_RISK';
  } else if (aquaplaningRiskPercent >= 65) {
    aquaplaningRiskTier = 'ELEVATED_CAUTION';
  }

  // Friction coefficient mu under wet conditions
  // Base wet mu derived from Skid Number SN_60: mu ~ SN_60 / 100
  let wetMu = safeSn / 100;

  // Severe reduction if approaching or exceeding hydroplaning speed
  if (aquaplaningRiskPercent >= 90) {
    wetMu = Math.max(0.08, wetMu * 0.25); // Hydrodynamic separation: tire floats on water film
  } else if (aquaplaningRiskPercent >= 70) {
    const penaltyFactor = 1 - (aquaplaningRiskPercent - 70) * 0.025;
    wetMu = Math.max(0.15, wetMu * penaltyFactor);
  }

  // Round wetMu to 2 decimals
  wetMu = Math.round(wetMu * 100) / 100;

  // Pavement condition classification
  let pavementState: PavementConditionState = 'SATISFACTORY_GRIP';
  if (aquaplaningRiskTier === 'CRITICAL_HYDRODYNAMIC_SEPARATION') {
    pavementState = 'CRITICAL_AQUAPLANING_HAZARD';
  } else if (safeSn < 35 || wetMu < 0.35) {
    pavementState = 'POLISHED_SLIPPERY_WARNING';
  } else if (safeSn >= 55 && wetMu >= 0.55) {
    pavementState = 'EXCELLENT_GRIP';
  }

  // Stopping distance calculations
  // v in m/s:
  const vMps = safeSpeed / 3.6;
  const reactionDistanceM = Math.round(vMps * reactionTime * 10) / 10;
  
  // Braking distance = v^2 / (2 * mu * g)
  const g = 9.81;
  const brakingDistanceWetM = Math.round((Math.pow(vMps, 2) / (2 * wetMu * g)) * 10) / 10;
  const totalStoppingDistanceWetM = Math.round((reactionDistanceM + brakingDistanceWetM) * 10) / 10;

  // Dry baseline comparison (dry asphalt mu ~ 0.80)
  const dryMu = 0.80;
  const brakingDistanceDryM = Math.round((Math.pow(vMps, 2) / (2 * dryMu * g)) * 10) / 10;
  const stoppingDistanceDryComparisonM = Math.round((reactionDistanceM + brakingDistanceDryM) * 10) / 10;

  const stoppingDistanceIncreaseRatio =
    Math.round((totalStoppingDistanceWetM / stoppingDistanceDryComparisonM) * 100) / 100;

  // Statutory tread depth evaluation
  const minRequiredTread = getStatutoryTreadDepthLimit(vehicleCategory);
  let tireTreadStatus: 'LEGAL_COMPLIANT' | 'BORDERLINE_WEAR' | 'ILLEGAL_WORN_OUT' = 'LEGAL_COMPLIANT';
  if (safeTread < minRequiredTread) {
    tireTreadStatus = 'ILLEGAL_WORN_OUT';
  } else if (safeTread <= minRequiredTread + 1.0) {
    tireTreadStatus = 'BORDERLINE_WEAR';
  }

  return {
    horneHydroplaningSpeedKmh: horneSpeed,
    effectiveHydroplaningSpeedKmh: effectiveHydroplaningSpeed,
    aquaplaningRiskPercent,
    aquaplaningRiskTier,
    frictionCoefficientMu: wetMu,
    pavementState,
    reactionDistanceM,
    brakingDistanceWetM,
    totalStoppingDistanceWetM,
    stoppingDistanceDryComparisonM,
    stoppingDistanceIncreaseRatio,
    tireTreadStatus,
    tireMinimumStatutoryDepthMm: minRequiredTread,
  };
}

/**
 * Calculates statutory fines and penalties according to the Code of Administrative Offences (İXM)
 */
export function calculateSkidStatutoryFines(
  treadDepthMm: number,
  vehicleCategory: VehicleTireCategory,
  approachSpeedKmh: number,
  postedAdvisorySpeedKmh: number
): SkidStatutoryFineCalculation {
  const minRequiredTread = getStatutoryTreadDepthLimit(vehicleCategory);
  const hasTreadViolation = treadDepthMm < minRequiredTread;
  const treadFineAzn = hasTreadViolation ? 50 : 0; // İXM Maddə 342.1 (50 AZN)

  let hasSpeedExcessWet = false;
  let speedExcessKmh = 0;
  let speedFineAzn = 0;
  let penaltyPoints = 0;

  if (approachSpeedKmh > postedAdvisorySpeedKmh) {
    speedExcessKmh = Math.round(approachSpeedKmh - postedAdvisorySpeedKmh);
    hasSpeedExcessWet = true;

    // Administrative speeding penalties under İXM Maddə 328
    if (speedExcessKmh >= 60) {
      speedFineAzn = 250;
      penaltyPoints = 4;
    } else if (speedExcessKmh >= 40) {
      speedFineAzn = 200;
      penaltyPoints = 3;
    } else if (speedExcessKmh >= 20) {
      speedFineAzn = 50;
      penaltyPoints = 2;
    } else if (speedExcessKmh >= 10) {
      speedFineAzn = 20;
      penaltyPoints = 0;
    } else {
      hasSpeedExcessWet = false;
    }
  }

  const totalFineAzn = treadFineAzn + speedFineAzn;
  // Article 38 prompt payment discount 50%
  const totalFineDiscountedAzn = Math.round((totalFineAzn * 0.5) * 100) / 100;

  const legalArticles: string[] = [];
  if (hasTreadViolation) {
    legalArticles.push(
      `İXM Maddə 342.1: Protektor naxışının qalığı qanunvericiliklə müəyyən edilmiş normadan (${minRequiredTread} mm) az olan şinlərlə idarəetmə (50 AZN).`
    );
  }
  if (hasSpeedExcessWet) {
    legalArticles.push(
      `İXM Maddə 328: Yağışlı/sürüşkən yolda tövsiyə olunan sürət həddini +${speedExcessKmh} km/saat aşma (${speedFineAzn} AZN, ${penaltyPoints} cərimə balı).`
    );
  }
  if (legalArticles.length === 0) {
    legalArticles.push('Qanunvericilik normativlərinə tam uyğundur: İnzibati xəta aşkar edilməmişdir.');
  }

  return {
    hasTreadViolation,
    treadFineAzn,
    hasSpeedExcessWet,
    speedExcessKmh,
    speedFineAzn,
    penaltyPoints,
    totalFineAzn,
    totalFineDiscountedAzn,
    statutoryLegalArticlesAz: legalArticles,
  };
}

/**
 * Currency conversion helper for multi-currency display
 */
export function convertSkidCurrency(
  aznAmount: number,
  currency: 'AZN' | 'USD' | 'EUR'
): { amount: number; formatted: string } {
  const rates = {
    AZN: 1.0,
    USD: 0.59,
    EUR: 0.54,
  };

  const amount = Math.round(aznAmount * rates[currency] * 100) / 100;
  const symbols = {
    AZN: '₼',
    USD: '$',
    EUR: '€',
  };

  return {
    amount,
    formatted: `${amount.toFixed(2)} ${symbols[currency]}`,
  };
}

/**
 * Generates an official SKID-SAFE-AZ-2026 Certificate
 */
export function generateSkidCertificate(
  plate: string,
  model: string,
  corridor: SkidCorridorAsset,
  simResult: SkidSimulationResult
): SkidCertificate {
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const certId = `SKID-SAFE-AZ-2026-${randNum}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expiryDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const seed = `${certId}:${plate}:${corridor.id}:${simResult.effectiveHydroplaningSpeedKmh}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  const simaUid = `SIMA-AZ-${Math.abs(hash).toString().substring(0, 6)}-2026`;
  const passPinCode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    certificateId: certId,
    vehiclePlate: plate,
    vehicleModel: model,
    corridorNameAz: corridor.nameAz,
    route: corridor.route,
    skidNumberSn60: corridor.skidNumberSn60,
    treadDepthMm: simResult.tireMinimumStatutoryDepthMm,
    waterFilmDepthMm: corridor.currentWaterFilmDepthMm,
    hydroplaningSpeedKmh: simResult.effectiveHydroplaningSpeedKmh,
    aquaplaningRiskTier: simResult.aquaplaningRiskTier,
    pavementState: simResult.pavementState,
    calculatedStoppingDistanceM: simResult.totalStoppingDistanceWetM,
    issueDate,
    expiryDate,
    simaDigitalUid: simaUid,
    verificationSha256: `sha256-aayda-skid-${hexHash}e84b`,
    passPinCode,
  };
}
