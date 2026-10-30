/**
 * Official Ministry of Digital Development and Transport (RİNN),
 * Azerbaijan Land Transport Agency (AYNA) &
 * Main State Traffic Police Department (BDYP),
 * National Intelligent Transportation System (NITS) &
 * Digital Twin 3D BIM Baku Smart Highway Dynamic Speed Limit Portal
 * (RİNN, AYNA & BDYP Rəqəmsal Əkiz & NITS-TWIN-AZ-2026 Portalı)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Road Traffic" ("Yol hərəkəti haqqında" Azərbaycan Respublikasının Qanunu, Maddə 9, 30, 34, 50)
 * - Resolution of the Cabinet of Ministers of the Republic of Azerbaijan on "Rules for Implementation of Intelligent Transportation Systems (ITS) and Dynamic Traffic Management on Highways"
 * - ISO 14813 Intelligent Transport Systems — Reference Architecture for the ITS Sector
 * - ISO 21217 Intelligent Transport Systems — Communications Access for Land Mobiles (CALM)
 * - ISO 19650 Building Information Modelling (BIM) LOD 400 Infrastructure Standards
 * - DIN EN 12966 Variable Message Signs (VMS) Optical & Luminance Regulations
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
 * 6 Strategic Highway Corridors Monitored by the NITS Digital Twin
 */
export type CorridorId =
  | 'CORRIDOR_BAKU_RING_ROAD'
  | 'CORRIDOR_HEYDAR_ALIYEV_AVE'
  | 'CORRIDOR_ZIGH_HIGHWAY'
  | 'CORRIDOR_BAKU_SUMGAYIT'
  | 'CORRIDOR_ALAT_ASTARA'
  | 'CORRIDOR_SHAMAKHI_PASS';

export interface HighwayCorridorInfo {
  id: CorridorId;
  nameAz: string;
  nameEn: string;
  routeCode: string; // e.g. "M-1 / M-2 Dairəvi", "M-1 Sumqayıt"
  lengthKm: number;
  laneCount: number; // total lanes both directions
  lanesPerDirection: number;
  baselineSpeedLimitKmH: number;
  bimLodLevel: 'LOD 350' | 'LOD 400';
  cctvGantriesCount: number;
  rwisStationsCount: number; // Road Weather Information System
  vmsSignsCount: number; // Variable Message Signs
  v2xRsuCount: number; // Roadside Units for Connected Vehicles
  elevationRangeMeters: { min: number; max: number };
  dailyTrafficVehicles: number;
  primaryRiskFactorsAz: string;
}

export const STRATEGIC_CORRIDORS: Record<CorridorId, HighwayCorridorInfo> = {
  CORRIDOR_BAKU_RING_ROAD: {
    id: 'CORRIDOR_BAKU_RING_ROAD',
    nameAz: 'Bakı Dairəvi Avtomobil Yolu (M-1 / M-2 Qovşağı)',
    nameEn: 'Baku Outer Ring Road (M-1 / M-2 Junction)',
    routeCode: 'M-1 / M-2 Ringway',
    lengthKm: 28.5,
    laneCount: 6,
    lanesPerDirection: 3,
    baselineSpeedLimitKmH: 110,
    bimLodLevel: 'LOD 400',
    cctvGantriesCount: 24,
    rwisStationsCount: 4,
    vmsSignsCount: 16,
    v2xRsuCount: 14,
    elevationRangeMeters: { min: -15, max: 95 },
    dailyTrafficVehicles: 84000,
    primaryRiskFactorsAz: 'Yüksək kəsişmə qovşaqları, ağır TIR axını, yamac küləkləri və zolaq dəyişmə sıxlığı.',
  },
  CORRIDOR_HEYDAR_ALIYEV_AVE: {
    id: 'CORRIDOR_HEYDAR_ALIYEV_AVE',
    nameAz: 'Heydər Əliyev Prospekti - Hava Limanı Sürət Şosesi',
    nameEn: 'Heydar Aliyev Avenue - Airport Express Highway',
    routeCode: 'H.Aliyev Ave Express',
    lengthKm: 14.2,
    laneCount: 10,
    lanesPerDirection: 5,
    baselineSpeedLimitKmH: 120,
    bimLodLevel: 'LOD 400',
    cctvGantriesCount: 32,
    rwisStationsCount: 6,
    vmsSignsCount: 22,
    v2xRsuCount: 18,
    elevationRangeMeters: { min: -22, max: 35 },
    dailyTrafficVehicles: 125000,
    primaryRiskFactorsAz: 'Sürətli hərəkət axını, kəskin hava limanı küləkləri, VIP eskort protokolları və qəfil duman.',
  },
  CORRIDOR_ZIGH_HIGHWAY: {
    id: 'CORRIDOR_ZIGH_HIGHWAY',
    nameAz: 'Zığ Dairəsi - Hövsan - Qala Beton Şosesi',
    nameEn: 'Zigh Circle - Hovsan - Qala Concrete Highway',
    routeCode: 'Zigh Express M-2 Bypass',
    lengthKm: 21.0,
    laneCount: 6,
    lanesPerDirection: 3,
    baselineSpeedLimitKmH: 110,
    bimLodLevel: 'LOD 350',
    cctvGantriesCount: 18,
    rwisStationsCount: 3,
    vmsSignsCount: 12,
    v2xRsuCount: 10,
    elevationRangeMeters: { min: -28, max: 40 },
    dailyTrafficVehicles: 52000,
    primaryRiskFactorsAz: 'Dəniz sahili duzlu rütubət, kəskin yan xəzri küləyi və gecə görmə məhdudiyyəti.',
  },
  CORRIDOR_BAKU_SUMGAYIT: {
    id: 'CORRIDOR_BAKU_SUMGAYIT',
    nameAz: 'Bakı-Quba-Rusiya Sərhədi M-1 Sumqayıt Dəhlizi',
    nameEn: 'Baku-Quba-Russia Border M-1 Sumgayit Corridor',
    routeCode: 'M-1 Highway km 0-32',
    lengthKm: 32.4,
    laneCount: 8,
    lanesPerDirection: 4,
    baselineSpeedLimitKmH: 110,
    bimLodLevel: 'LOD 400',
    cctvGantriesCount: 28,
    rwisStationsCount: 5,
    vmsSignsCount: 20,
    v2xRsuCount: 16,
    elevationRangeMeters: { min: -18, max: 65 },
    dailyTrafficVehicles: 115000,
    primaryRiskFactorsAz: 'Pik saat işçi miqrasiyası, Ceyranbatan su anbarı dumanı, daralma zonaları və qəfil dayanmalar.',
  },
  CORRIDOR_ALAT_ASTARA: {
    id: 'CORRIDOR_ALAT_ASTARA',
    nameAz: 'Ələt-Astara-İran Sərhədi M-3 Ağıllı Tranzit Koridoru',
    nameEn: 'Alat-Astara-Iran Border M-3 Smart Transit Corridor',
    routeCode: 'M-3 Transit Corridor',
    lengthKm: 45.0,
    laneCount: 4,
    lanesPerDirection: 2,
    baselineSpeedLimitKmH: 110,
    bimLodLevel: 'LOD 350',
    cctvGantriesCount: 20,
    rwisStationsCount: 4,
    vmsSignsCount: 14,
    v2xRsuCount: 12,
    elevationRangeMeters: { min: -25, max: 15 },
    dailyTrafficVehicles: 38000,
    primaryRiskFactorsAz: 'Beynəlxalq Şimal-Cənub tranzit TIR karvanları, çöl qum fırtınası və gecə heyvan keçidləri.',
  },
  CORRIDOR_SHAMAKHI_PASS: {
    id: 'CORRIDOR_SHAMAKHI_PASS',
    nameAz: 'Bakı-Şamaxı-Yevlax M-4 Dağ Aşırımı Dəhlizi',
    nameEn: 'Baku-Shamakhi-Yevlakh M-4 Mountain Pass Corridor',
    routeCode: 'M-4 Mountain Pass',
    lengthKm: 38.6,
    laneCount: 4,
    lanesPerDirection: 2,
    baselineSpeedLimitKmH: 90,
    bimLodLevel: 'LOD 400',
    cctvGantriesCount: 22,
    rwisStationsCount: 6,
    vmsSignsCount: 18,
    v2xRsuCount: 15,
    elevationRangeMeters: { min: 120, max: 860 },
    dailyTrafficVehicles: 29000,
    primaryRiskFactorsAz: 'Qış buzlaşması (qara buz), kəskin döngələr, qalın dağ dumanı və sürüşmə təhlükəsi.',
  },
};

/**
 * Environmental & Weather Conditions
 */
export type WeatherCondition = 'DRY' | 'WET_RAIN' | 'HEAVY_FOG' | 'SNOW_ICE';

export interface WeatherConditionInfo {
  condition: WeatherCondition;
  labelAz: string;
  labelEn: string;
  baseFrictionCoefficient: number; // friction index mu (0.15 - 0.90)
  visibilityMeters: number;
  sprayRiskPercentage: number;
}

export const WEATHER_CONDITIONS: Record<WeatherCondition, WeatherConditionInfo> = {
  DRY: {
    condition: 'DRY',
    labelAz: 'Quru və Açıq Yol Səthi',
    labelEn: 'Dry & Clear Pavement',
    baseFrictionCoefficient: 0.85,
    visibilityMeters: 1000,
    sprayRiskPercentage: 0,
  },
  WET_RAIN: {
    condition: 'WET_RAIN',
    labelAz: 'Yağışlı və Yaş Asfalt',
    labelEn: 'Wet & Rainy Asphalt',
    baseFrictionCoefficient: 0.55,
    visibilityMeters: 450,
    sprayRiskPercentage: 45,
  },
  HEAVY_FOG: {
    condition: 'HEAVY_FOG',
    labelAz: 'Qatı Duman və Görmə < 100m',
    labelEn: 'Dense Fog & Low Visibility',
    baseFrictionCoefficient: 0.60,
    visibilityMeters: 80,
    sprayRiskPercentage: 20,
  },
  SNOW_ICE: {
    condition: 'SNOW_ICE',
    labelAz: 'Qarlı / Qara Buz Sürüşkənliyi',
    labelEn: 'Snow & Black Ice Glaze',
    baseFrictionCoefficient: 0.22,
    visibilityMeters: 180,
    sprayRiskPercentage: 75,
  },
};

/**
 * Highway Incident & Hazard Severity
 */
export type IncidentSeverity =
  | 'NONE'
  | 'LANE_SHOULDER'
  | 'SINGLE_LANE_BLOCK'
  | 'MULTI_LANE_MAJOR'
  | 'ROAD_CLOSURE';

export interface IncidentSeverityInfo {
  severity: IncidentSeverity;
  labelAz: string;
  labelEn: string;
  capacityReductionRatio: number; // remaining capacity fraction
  speedPenaltyRatio: number;
  alertLevel: 'NORMAL' | 'ADVISORY' | 'WARNING' | 'EMERGENCY';
}

export const INCIDENT_SEVERITY_LEVELS: Record<IncidentSeverity, IncidentSeverityInfo> = {
  NONE: {
    severity: 'NONE',
    labelAz: 'Hadisə Yoxdur (Ştat Rejimi)',
    labelEn: 'No Incidents (Normal Ops)',
    capacityReductionRatio: 1.0,
    speedPenaltyRatio: 1.0,
    alertLevel: 'NORMAL',
  },
  LANE_SHOULDER: {
    severity: 'LANE_SHOULDER',
    labelAz: 'Çiyində Qəza / Nasaz Nəqliyyat',
    labelEn: 'Shoulder Breakdown / Stalled Car',
    capacityReductionRatio: 0.88,
    speedPenaltyRatio: 0.90,
    alertLevel: 'ADVISORY',
  },
  SINGLE_LANE_BLOCK: {
    severity: 'SINGLE_LANE_BLOCK',
    labelAz: 'Tək Zolaqda Qəza / Təmir İşi',
    labelEn: 'Single Lane Blockage / Roadwork',
    capacityReductionRatio: 0.62,
    speedPenaltyRatio: 0.72,
    alertLevel: 'WARNING',
  },
  MULTI_LANE_MAJOR: {
    severity: 'MULTI_LANE_MAJOR',
    labelAz: 'Çoxzolaqlı Zəncirvari Qəza',
    labelEn: 'Multi-Lane Chain Collision',
    capacityReductionRatio: 0.35,
    speedPenaltyRatio: 0.45,
    alertLevel: 'EMERGENCY',
  },
  ROAD_CLOSURE: {
    severity: 'ROAD_CLOSURE',
    labelAz: 'Magistralın Tam Bağlanması (FHN/DYP)',
    labelEn: 'Complete Highway Closure',
    capacityReductionRatio: 0.0,
    speedPenaltyRatio: 0.0,
    alertLevel: 'EMERGENCY',
  },
};

/**
 * Level of Service (LOS) Categories according to Highway Capacity Manual (HCM)
 */
export type LevelOfService = 'LOS_A' | 'LOS_B' | 'LOS_C' | 'LOS_D' | 'LOS_E' | 'LOS_F';

export interface LosClassification {
  los: LevelOfService;
  nameAz: string;
  descriptionAz: string;
  colorClass: string;
  delayRangeMin: string;
}

export const LOS_DEFINITIONS: Record<LevelOfService, LosClassification> = {
  LOS_A: {
    los: 'LOS_A',
    nameAz: 'Sərbəst Axın (A)',
    descriptionAz: 'Maneəsiz hərəkət, zolaq seçimi tam sərbəstdir, sürət maksimumdadır.',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    delayRangeMin: '< 1 dəqiqə',
  },
  LOS_B: {
    los: 'LOS_B',
    nameAz: 'Stabil Axın (B)',
    descriptionAz: 'Yaxşı axın sürəti, digər nəqliyyat vasitələri manevrlərə minimal təsir edir.',
    colorClass: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    delayRangeMin: '1 - 3 dəqiqə',
  },
  LOS_C: {
    los: 'LOS_C',
    nameAz: 'Məqbul Axın (C)',
    descriptionAz: 'Sürət qorunur, lakin zolaq dəyişmə və ötmə manevrləri diqqət tələb edir.',
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    delayRangeMin: '3 - 6 dəqiqə',
  },
  LOS_D: {
    los: 'LOS_D',
    nameAz: 'Sıx Axın (D)',
    descriptionAz: 'Buraxılış qabiliyyətinə yaxınlaşma, manevr imkanları kəskin məhduddur.',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    delayRangeMin: '6 - 12 dəqiqə',
  },
  LOS_E: {
    los: 'LOS_E',
    nameAz: 'Böhran Axını (E)',
    descriptionAz: 'Maksimum tutum həddi, kiçik ləngimə zəncirvari dayanma yaradır.',
    colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    delayRangeMin: '12 - 25 dəqiqə',
  },
  LOS_F: {
    los: 'LOS_F',
    nameAz: 'Tıxac və Böhran (F)',
    descriptionAz: 'Nəqliyyat axınının tam dayanması (stop-and-go), uzun növbələr.',
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    delayRangeMin: '> 25 dəqiqə',
  },
};

/**
 * Dynamic Speed Limit Calculation Results
 */
export interface VslCalculationResult {
  corridorId: CorridorId;
  corridorNameAz: string;
  baselineSpeedLimitKmH: number;
  recommendedVslKmH: number;
  isHighwayClosed: boolean;
  effectiveFrictionCoefficient: number;
  densityVehPerKmPerLane: number;
  flowVehPerHourPerLane: number;
  estimatedAverageSpeedKmH: number;
  levelOfService: LevelOfService;
  queueLengthKm: number;
  delayMinutes: number;
  vmsDisplayMessageAz: string;
  vmsDisplayMessageEn: string;
  laneSignals: ('OPEN_GREEN' | 'MERGE_LEFT' | 'MERGE_RIGHT' | 'CLOSED_RED_X')[];
  safetyRationaleAz: string;
  aidAlarmTriggered: boolean;
  rwisSurfaceStatusAz: string;
}

/**
 * Real-Time Dynamic Variable Speed Limit (VSL) Physics & Algorithm
 * Adhering to Greenshields traffic stream model and friction coefficient safety margins
 */
export const calculateDynamicSpeedLimit = (
  corridorId: CorridorId,
  densityVehPerKmPerLane: number, // 0 to 120 veh/km/lane
  weatherCondition: WeatherCondition,
  incidentSeverity: IncidentSeverity,
  surfaceTempCelsius: number = 18
): VslCalculationResult => {
  const corridor = STRATEGIC_CORRIDORS[corridorId] || STRATEGIC_CORRIDORS.CORRIDOR_BAKU_RING_ROAD;
  const weather = WEATHER_CONDITIONS[weatherCondition] || WEATHER_CONDITIONS.DRY;
  const incident = INCIDENT_SEVERITY_LEVELS[incidentSeverity] || INCIDENT_SEVERITY_LEVELS.NONE;

  // Temperature impact on friction
  let friction = weather.baseFrictionCoefficient;
  if (surfaceTempCelsius <= 0 && weatherCondition !== 'SNOW_ICE') {
    // Risk of undetected glaze/black ice near zero degrees
    friction = Math.max(0.25, friction * 0.65);
  } else if (surfaceTempCelsius >= 45 && weatherCondition === 'DRY') {
    // High bitumen bleed softening
    friction = Math.max(0.70, friction * 0.92);
  }

  // If complete road closure ordered
  if (incidentSeverity === 'ROAD_CLOSURE') {
    return {
      corridorId,
      corridorNameAz: corridor.nameAz,
      baselineSpeedLimitKmH: corridor.baselineSpeedLimitKmH,
      recommendedVslKmH: 0,
      isHighwayClosed: true,
      effectiveFrictionCoefficient: Number(friction.toFixed(2)),
      densityVehPerKmPerLane,
      flowVehPerHourPerLane: 0,
      estimatedAverageSpeedKmH: 0,
      levelOfService: 'LOS_F',
      queueLengthKm: Number((corridor.lengthKm * 0.6).toFixed(1)),
      delayMinutes: 60,
      vmsDisplayMessageAz: 'TƏHLÜKƏ! MAGİSTRAL TAM BAĞLIDIR. YAN YOLA DÖNÜN.',
      vmsDisplayMessageEn: 'DANGER! HIGHWAY CLOSED. DIVERT TO ALTERNATE ROUTE.',
      laneSignals: Array(corridor.lanesPerDirection).fill('CLOSED_RED_X'),
      safetyRationaleAz: 'FHN və BDYP tərəfindən fövqəladə vəziyyətlə əlaqədar hərəkət dayandırılıb.',
      aidAlarmTriggered: true,
      rwisSurfaceStatusAz: 'Hərəkət dayandırılıb (Bütün zolaqlar qırmızı X)',
    };
  }

  // Two-Regime Greenshields Traffic Stream Model:
  // Under light density (k <= 20 veh/km/lane), traffic travels at full free-flow speed v0.
  // Above critical density (k > 20), speed decreases towards jam density.
  const v0 = corridor.baselineSpeedLimitKmH;
  const criticalDensity = 20;
  const jamDensity = 110;
  const normalizedDensity = Math.min(jamDensity, Math.max(0, densityVehPerKmPerLane));
  const rawModelSpeed =
    normalizedDensity <= criticalDensity
      ? v0
      : v0 * Math.max(0.15, 1 - (normalizedDensity - criticalDensity) / (jamDensity - criticalDensity));

  // Weather grip deceleration factor (safe stopping distance proportional to 1/sqrt(mu))
  const weatherFrictionRatio = Math.sqrt(friction / 0.85);

  // Raw recommended speed combining density, weather, and incident penalty
  let calculatedSpeed = rawModelSpeed * weatherFrictionRatio * incident.speedPenaltyRatio;

  // Discrete legal VSL rounding (multiples of 10 km/h)
  // Min speed is 40 km/h unless road closed
  let recommendedVsl = Math.round(calculatedSpeed / 10) * 10;
  recommendedVsl = Math.max(40, Math.min(corridor.baselineSpeedLimitKmH, recommendedVsl));

  // Determine Level of Service (LOS)
  let los: LevelOfService = 'LOS_A';
  if (normalizedDensity >= 70 || incidentSeverity === 'MULTI_LANE_MAJOR') {
    los = 'LOS_F';
  } else if (normalizedDensity >= 50) {
    los = 'LOS_E';
  } else if (normalizedDensity >= 35) {
    los = 'LOS_D';
  } else if (normalizedDensity >= 25) {
    los = 'LOS_C';
  } else if (normalizedDensity > 16) {
    los = 'LOS_B';
  } else {
    los = 'LOS_A';
  }

  // Estimated traffic flow (veh/hr/lane)
  const estimatedSpeed = Math.max(15, rawModelSpeed * incident.speedPenaltyRatio);
  const flow = Math.round(normalizedDensity * estimatedSpeed * incident.capacityReductionRatio);

  // Queue length in km
  let queueLengthKm = 0;
  if (normalizedDensity > 45) {
    queueLengthKm = Number(((normalizedDensity - 45) * 0.12 + (incidentSeverity === 'MULTI_LANE_MAJOR' ? 4.5 : incidentSeverity === 'SINGLE_LANE_BLOCK' ? 2.0 : 0)).toFixed(1));
  } else if (incidentSeverity === 'SINGLE_LANE_BLOCK') {
    queueLengthKm = 1.2;
  }

  // Estimated delay minutes
  const freeFlowTravelTimeMinutes = (corridor.lengthKm / corridor.baselineSpeedLimitKmH) * 60;
  const currentTravelTimeMinutes = (corridor.lengthKm / Math.max(12, estimatedSpeed)) * 60;
  const delayMinutes = Math.max(0, Math.round(currentTravelTimeMinutes - freeFlowTravelTimeMinutes));

  // Generate lane signals based on incident
  const lanesCount = corridor.lanesPerDirection;
  const laneSignals: ('OPEN_GREEN' | 'MERGE_LEFT' | 'MERGE_RIGHT' | 'CLOSED_RED_X')[] = [];
  for (let i = 0; i < lanesCount; i++) {
    if (incidentSeverity === 'MULTI_LANE_MAJOR') {
      laneSignals.push(i === 0 ? 'OPEN_GREEN' : 'CLOSED_RED_X');
    } else if (incidentSeverity === 'SINGLE_LANE_BLOCK') {
      if (i === lanesCount - 1) {
        laneSignals.push('CLOSED_RED_X');
      } else if (i === lanesCount - 2) {
        laneSignals.push('MERGE_LEFT');
      } else {
        laneSignals.push('OPEN_GREEN');
      }
    } else {
      laneSignals.push('OPEN_GREEN');
    }
  }

  // Build VMS message text
  let vmsMsgAz = `DİNAMİK HƏDD: ${recommendedVsl} KM/S`;
  let vmsMsgEn = `VARIABLE SPEED: ${recommendedVsl} KM/H`;

  if (weatherCondition === 'SNOW_ICE') {
    vmsMsgAz = `QARA BUZ TƏHLÜKƏSİ! SÜRƏT: ${recommendedVsl} KM/S`;
    vmsMsgEn = `BLACK ICE WARNING! SPEED: ${recommendedVsl} KM/H`;
  } else if (weatherCondition === 'HEAVY_FOG') {
    vmsMsgAz = `QATI DUMAN! MƏSAFƏ SAXLAYIN: ${recommendedVsl} KM/S`;
    vmsMsgEn = `DENSE FOG! KEEP DISTANCE: ${recommendedVsl} KM/H`;
  } else if (weatherCondition === 'WET_RAIN') {
    vmsMsgAz = `SÜRÜŞKƏN YOL! DİNAMİK SÜRƏT: ${recommendedVsl} KM/S`;
    vmsMsgEn = `WET ROAD SURFACE! SPEED: ${recommendedVsl} KM/H`;
  } else if (incidentSeverity === 'MULTI_LANE_MAJOR') {
    vmsMsgAz = `QƏZA SAHƏSİ! SOL ZOLAĞA KEÇİN: ${recommendedVsl} KM/S`;
    vmsMsgEn = `ACCIDENT AHEAD! MERGE LEFT: ${recommendedVsl} KM/H`;
  } else if (los === 'LOS_E' || los === 'LOS_F') {
    vmsMsgAz = `SIX AXIN VƏ TIXAC! SÜRƏT: ${recommendedVsl} KM/S`;
    vmsMsgEn = `HEAVY CONGESTION! SPEED: ${recommendedVsl} KM/H`;
  }

  // Build safety rationale text
  let rationale = `Yol hərəkəti haqqında Qanunun 50-ci maddəsinə uyğun olaraq, `;
  if (recommendedVsl < corridor.baselineSpeedLimitKmH) {
    rationale += `hava şəraiti (${weather.labelAz}) və nəqliyyat sıxlığı səbəbindən dinamik sürət həddi ${corridor.baselineSpeedLimitKmH} km/s-dən ${recommendedVsl} km/s-ə endirilmişdir. Elektron tablonun göstərişi qanuni üstünlüyə malikdir.`;
  } else {
    rationale += `yol şəraiti normaldır, baza sürət həddi (${corridor.baselineSpeedLimitKmH} km/s) qüvvədədir.`;
  }

  const aidAlarmTriggered = incidentSeverity !== 'NONE' || los === 'LOS_F';
  const rwisSurfaceStatusAz = `${weather.labelAz} (μ=${friction.toFixed(2)}, T=${surfaceTempCelsius}°C)`;

  return {
    corridorId,
    corridorNameAz: corridor.nameAz,
    baselineSpeedLimitKmH: corridor.baselineSpeedLimitKmH,
    recommendedVslKmH: recommendedVsl,
    isHighwayClosed: false,
    effectiveFrictionCoefficient: Number(friction.toFixed(2)),
    densityVehPerKmPerLane: normalizedDensity,
    flowVehPerHourPerLane: flow,
    estimatedAverageSpeedKmH: Math.round(estimatedSpeed),
    levelOfService: los,
    queueLengthKm,
    delayMinutes,
    vmsDisplayMessageAz: vmsMsgAz,
    vmsDisplayMessageEn: vmsMsgEn,
    laneSignals,
    safetyRationaleAz: rationale,
    aidAlarmTriggered,
    rwisSurfaceStatusAz,
  };
};

/**
 * Macro & Micro Traffic Flow Physics Stand Parameters
 */
export interface TrafficFlowMetrics {
  hourlyVolumeVehTotal: number;
  passengerCarPercent: number;
  truckTransitPercent: number;
  busPublicPercent: number;
  averageHeadwaySeconds: number;
  pcuEquivalentFlow: number; // Passenger Car Unit (PCU)
  excessCo2KgPerHour: number;
  fuelWasteLitresPerHour: number;
  economicDelayCostAznPerHour: number;
}

export const calculateTrafficFlowMetrics = (
  corridorId: CorridorId,
  densityK: number,
  truckPercent: number = 20,
  busPercent: number = 8,
  incidentSeverity: IncidentSeverity = 'NONE'
): TrafficFlowMetrics => {
  const corridor = STRATEGIC_CORRIDORS[corridorId] || STRATEGIC_CORRIDORS.CORRIDOR_BAKU_RING_ROAD;
  const lanes = corridor.lanesPerDirection;

  const validTruck = Math.max(5, Math.min(50, truckPercent));
  const validBus = Math.max(2, Math.min(25, busPercent));
  const passengerPercent = Math.max(25, 100 - (validTruck + validBus));

  const incident = INCIDENT_SEVERITY_LEVELS[incidentSeverity] || INCIDENT_SEVERITY_LEVELS.NONE;
  const rawSpeed = corridor.baselineSpeedLimitKmH * Math.max(0.12, 1 - densityK / 110) * incident.speedPenaltyRatio;
  const flowPerLane = Math.round(densityK * rawSpeed * incident.capacityReductionRatio);
  const totalVolume = flowPerLane * lanes;

  // Passenger Car Unit (PCU) multiplier: Passenger=1.0, Bus=2.2, Heavy Truck=2.5
  const pcuFactor = (passengerPercent * 1.0 + validBus * 2.2 + validTruck * 2.5) / 100;
  const pcuEquivalent = Math.round(totalVolume * pcuFactor);

  // Time headway between vehicles: h = 3600 / flowPerLane
  const headway = flowPerLane > 0 ? Number((3600 / flowPerLane).toFixed(1)) : 99.9;

  // Congestion waste metrics: Stop-and-go idling and braking
  const delayFactor = Math.max(0, (densityK - 28) / 30);
  const excessCo2 = Math.round(totalVolume * 0.045 * delayFactor * (corridor.lengthKm / 10));
  const fuelWaste = Math.round(totalVolume * 0.018 * delayFactor * (corridor.lengthKm / 10));
  const economicCostAzn = Math.round(delayFactor * totalVolume * 0.45 * 2.8);

  return {
    hourlyVolumeVehTotal: totalVolume,
    passengerCarPercent: passengerPercent,
    truckTransitPercent: validTruck,
    busPublicPercent: validBus,
    averageHeadwaySeconds: headway,
    pcuEquivalentFlow: pcuEquivalent,
    excessCo2KgPerHour: excessCo2,
    fuelWasteLitresPerHour: fuelWaste,
    economicDelayCostAznPerHour: economicCostAzn,
  };
};

/**
 * 10-Point ITS Digital Twin Operational Safety Checklist
 */
export interface DigitalTwinOperationalChecklistItem {
  id: string;
  categoryAz: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  statutoryReference: string;
  weightPoints: number;
}

export const DIGITAL_TWIN_SAFETY_CHECKLIST: DigitalTwinOperationalChecklistItem[] = [
  {
    id: 'ITS_CHK_01_V2X_RSU',
    categoryAz: 'V2X Rabitə',
    titleAz: '5.9 GHz DSRC / C-V2X RSU Yol Kənarı Bikon Sinxronizasiyası',
    titleEn: '5.9 GHz DSRC / C-V2X Roadside Unit Beacon Synchronization',
    descriptionAz: 'Magistral boyu yerləşən V2X baza stansiyalarının avtonom və qoşulmuş nəqliyyat vasitələrinə təhlükəsizlik xəbərdarlıqlarını ötürmə gecikməsi < 20 ms olmalıdır.',
    statutoryReference: 'ISO 21217 CALM / RİNN Ağıllı Nəqliyyat Şəbəkəsi Qaydaları',
    weightPoints: 10,
  },
  {
    id: 'ITS_CHK_02_VMS_OPTICAL',
    categoryAz: 'Dinamik İşarələr',
    titleAz: 'Dinamik VMS Elektron Tablo və Zolaq İdarəetmə LED Auditi',
    titleEn: 'Dynamic VMS Electronic Boards & Lane Control LED Luminance Audit',
    descriptionAz: 'Gündüz günəş şüası və gecə duman şəraitində EN 12966 standartına uyğun optik parlaqlıq və avtomatik ikitərəfli telemetriya cavabı yoxlanılmalıdır.',
    statutoryReference: 'DIN EN 12966 / Yol Hərəkəti Haqqında Qanun, Maddə 34',
    weightPoints: 10,
  },
  {
    id: 'ITS_CHK_03_RWIS_WEATHER',
    categoryAz: 'Yol-Hava Telemetriyası',
    titleAz: 'RWIS Yol-Hava Stansiyalarının Asfalt Səth Sürtünmə Sensoru Kalibrasiyası',
    titleEn: 'RWIS Road Weather Station Pavement Friction Sensor Calibration',
    descriptionAz: 'Optik spektroskopik sensorlar yol örtüyündə su plyonkası qalınlığını (mm), buzlanma faizini və sürtünmə əmsalını (μ) real vaxtda mərkəzə ötürməlidir.',
    statutoryReference: 'Nazirlər Kabinetinin ITS Təhlükəsizlik Qaydaları',
    weightPoints: 10,
  },
  {
    id: 'ITS_CHK_04_AID_CCTV_AI',
    categoryAz: 'Süni İntellekt Analitikası',
    titleAz: 'AID (Automatic Incident Detection) CCTV Video Analitika Reaksiyası',
    titleEn: 'AID CCTV AI Video Analytics Incident Detection Time (<10 sec)',
    descriptionAz: 'Dayanmış avtomobil, əks istiqamətə çıxma (wrong-way), zolağa düşmüş yük və ya piyada hadisələri 10 saniyə ərzində avtomatik deteksiya olunmalı və operatora həyəcan siqnalı verilməlidir.',
    statutoryReference: 'BDYP Mərkəzi Nəzarət Şöbəsi İnsident Reqlamenti',
    weightPoints: 10,
  },
  {
    id: 'ITS_CHK_05_BDYP_RADAR_SYNC',
    categoryAz: 'Dövlət İnteqrasiyası',
    titleAz: 'Dinamik VSL Göstərişinin BDYP Elektron Radar Şəbəkəsinə Sinxron İnteqrasiyası',
    titleEn: 'Dynamic VSL Legal Promulgation to BDYP E-Radar Police Network',
    descriptionAz: 'Tabloda dəyişdirilən sürət həddi eyni saniyədə foto-radar və MMX kameralarının protokol bazasında yenilənməli, 5 dəqiqəlik keçid buferi təmin olunmalıdır.',
    statutoryReference: 'AR İnzibati Xətalar Məcəlləsi, Maddə 342.1 / DYP Təlimatı',
    weightPoints: 10,
  },
  {
    id: 'ITS_CHK_06_FIBER_BACKBONE',
    categoryAz: 'Şəbəkə İnfrastrukturu',
    titleAz: 'Optik Lif Magistral Rabitə Xəttinin Siqnal Gecikməsi (< 15 ms Latency)',
    titleEn: 'Fiber-Optic Highway Ring Backbone Network Latency (< 15 ms)',
    descriptionAz: 'Magistral kənarındakı sənaye dərəcəli kommutatorların ehtiyat halqa (ring redundancy) keçid müddəti < 20 ms olmalı, mərkəzlə rabitə qırılmamalıdır.',
    statutoryReference: 'RİNN Dövlət Nəqliyyat Rabitə Şəbəkəsi Standartı',
    weightPoints: 10,
  },
  {
    id: 'ITS_CHK_07_BIM_LOD400',
    categoryAz: 'Rəqəmsal Əkiz Həndəsəsi',
    titleAz: '3D BIM LOD 400 Rəqəmsal Modelinin Geodezik Dəqiqliyi (< 5 sm Xəta)',
    titleEn: '3D BIM LOD 400 Digital Twin Geodetic Accuracy (< 5 cm tolerance)',
    descriptionAz: 'Magistralın örtük həndəsəsi, yeraltı drenaj boruları, viaduklar və işarə portalları GIS/BIM məkan koordinatları ilə mütləq dəqiqliklə uyğunlaşdırılmalıdır.',
    statutoryReference: 'ISO 19650-2 / AR Şəhərsalma və Tikinti Məcəlləsi',
    weightPoints: 10,
  },
  {
    id: 'ITS_CHK_08_SOS_TELEPHONY',
    categoryAz: 'Təcili Əlaqə',
    titleAz: 'Magistral SOS Təcili Zəng Postlarının (112 / 902) Səs və Enerji Hazırlığı',
    titleEn: 'Highway SOS Emergency Call Posts (112 / 902) Audio & Power Readiness',
    descriptionAz: 'Hər 1.5 - 2 km məsafədə yerləşən günəş panelli təcili zəng dirəklərinin FHN və DYP dispetçer mərkəzinə canlı ikitərəfli səs əlaqəsi sınaqdan keçirilməlidir.',
    statutoryReference: 'AAYDA Magistral Təhlükəsizlik və Rabitə Qaydaları',
    weightPoints: 10,
  },
  {
    id: 'ITS_CHK_09_UPS_POWER',
    categoryAz: 'Enerji Təminatı',
    titleAz: 'Paylayıcı İdarəetmə Şkaflarının 4 Saatlıq Fasiləsiz UPS Ehtiyatı',
    titleEn: 'Distribution Control Cabinet 4-Hour Uninterruptible UPS Battery Backup',
    descriptionAz: 'Magistral şəbəkəsində 380V/220V gərginlik itdiyi təqdirdə, dinamik tablolar və təhlükəsizlik kameraları ən azı 4 saat avtonom akkumulyatorla işləməlidir.',
    statutoryReference: 'Dövlət Yanğın Təhlükəsizliyi Xidməti (FHN) Qaydaları',
    weightPoints: 10,
  },
  {
    id: 'ITS_CHK_10_ANTI_ICING_BRINE',
    categoryAz: 'Qış Əməliyyatları',
    titleAz: 'Avtomatlaşdırılmış Buzlanma Əleyhinə Duz-Məhlul (Brine) Çiləyici Qurğular',
    titleEn: 'Automated Fixed Anti-Icing Spraying Systems (FAST) Brine Readiness',
    descriptionAz: 'Viaduk və körpülərdəki avtomatik sprey ucluqlarının təzyiqi, qatılığı və çən səviyyəsi mərkəzdən telemetriya ilə yoxlanılmalı və sınaq çiləməsi aparılmalıdır.',
    statutoryReference: 'AAYDA Qış Mövsümü Magistral Saxlama Təlimatı',
    weightPoints: 10,
  },
];

export interface ChecklistEvaluationResult {
  checkedCount: number;
  totalCount: number;
  scorePercentage: number;
  isCompliant: boolean;
  statusAz: 'TAM UYĞUNDUR' | 'QİSMƏN UYĞUNDUR' | 'TƏHLÜKƏLİ / NÖQSANLI';
  recommendationsAz: string[];
}

export const evaluateDigitalTwinSafetyChecklist = (
  checkedIds: string[]
): ChecklistEvaluationResult => {
  const total = DIGITAL_TWIN_SAFETY_CHECKLIST.length;
  const checked = checkedIds.filter((id) =>
    DIGITAL_TWIN_SAFETY_CHECKLIST.some((item) => item.id === id)
  ).length;

  const scorePercentage = Math.round((checked / total) * 100);
  const isCompliant = scorePercentage >= 80;

  let statusAz: 'TAM UYĞUNDUR' | 'QİSMƏN UYĞUNDUR' | 'TƏHLÜKƏLİ / NÖQSANLI' =
    'TƏHLÜKƏLİ / NÖQSANLI';
  if (scorePercentage >= 90) statusAz = 'TAM UYĞUNDUR';
  else if (scorePercentage >= 70) statusAz = 'QİSMƏN UYĞUNDUR';

  const recommendationsAz: string[] = [];
  if (!checkedIds.includes('ITS_CHK_02_VMS_OPTICAL')) {
    recommendationsAz.push('Dinamik VMS elektron tablolarının optik parlaqlığını və LED matris telemetriyasını təcili yoxlayın.');
  }
  if (!checkedIds.includes('ITS_CHK_04_AID_CCTV_AI')) {
    recommendationsAz.push('AID süni intellekt avtomatik insident deteksiya kamerasının reaksiya vaxtını kalibrasiya edin.');
  }
  if (!checkedIds.includes('ITS_CHK_05_BDYP_RADAR_SYNC')) {
    recommendationsAz.push('Dinamik sürət hədlərinin BDYP elektron radar bazasına avtomatik ötürülmə protokolunu aktivləşdirin.');
  }
  if (!checkedIds.includes('ITS_CHK_07_BIM_LOD400')) {
    recommendationsAz.push('3D BIM LOD 400 rəqəmsal əkiz modelinin məkan geodezik koordinatlarını yeniləyin.');
  }

  if (recommendationsAz.length === 0 && !isCompliant) {
    recommendationsAz.push('Bütün 10 təhlükəsizlik parametrini yoxlayaraq sertifikatlaşdırma tələblərinə uyğunlaşdırın.');
  }

  return {
    checkedCount: checked,
    totalCount: total,
    scorePercentage,
    isCompliant,
    statusAz,
    recommendationsAz,
  };
};

/**
 * 10-Question Smart Mobility & ITS Law Exam Simulator
 */
export interface DigitalTwinExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
  statutoryReference: string;
}

export const DIGITAL_TWIN_EXAM_QUESTIONS: DigitalTwinExamQuestion[] = [
  {
    id: 1,
    questionAz: 'Dinamik VMS elektron tablosunda göstərilən dəyişkən sürət həddi ilə stasionar yol nişanı ziddiyyət təşkil edərsə, sürücü hansı göstərişə riayət etməlidir?',
    questionEn: 'If a dynamic VMS electronic speed limit contradicts a static road sign, which must the driver obey?',
    optionsAz: [
      'Stasionar metal lövhəli yol nişanına',
      'Elektron tablodakı dəyişkən sürət həddinə (VMS)',
      'Sürücünün öz şəxsi seçiminə',
      'Yalnız öndə gedən avtomobilin sürətinə',
    ],
    correctOptionIndex: 1,
    explanationAz: 'Yol hərəkəti haqqında Qanunun 34-cü maddəsinə əsasən, operativ hava və yol şəraitini əks etdirən elektron dinamik tablonun göstərişi stasionar nişanlardan üstündür.',
    statutoryReference: 'Yol hərəkəti haqqında Qanun, Maddə 34',
  },
  {
    id: 2,
    questionAz: 'Magistralda RWIS yol-hava stansiyası asfalt səthində sürtünmə əmsalını (μ) 0.22 (qara buz) qeydə alarsa, NITS sistemi hansı təxirəsalınmaz addımı atır?',
    questionEn: 'If RWIS detects a road surface friction coefficient of 0.22 (black ice), what action does NITS trigger?',
    optionsAz: [
      'Heç bir dəyişiklik etmir, gözləmə rejiminə keçir',
      'Avtomatik olaraq dinamik sürət həddini endirir və buzlanma əleyhinə duz-məhlul (brine) sistemini işə salır',
      'Yalnız magistralın gecə işıqlandırmasını söndürür',
      'Bütün avtomobillərə dərhal cərimə protokolu göndərir',
    ],
    correctOptionIndex: 1,
    explanationAz: 'Təhlükəli buzlanma zamanı sistem qəzaların qarşısını almaq üçün sürət həddini endirir, VMS-də xəbərdarlıq çıxarır və avtomatik çiləyicilərə siqnal göndərir.',
    statutoryReference: 'AAYDA & NITS İnsident İdarəetmə Təlimatı',
  },
  {
    id: 3,
    questionAz: 'AID (Automatic Incident Detection) süni intellekt CCTV analitikası magistralda dayanmış maşını ən geci neçə saniyə ərzində aşkar etməlidir?',
    questionEn: 'Within how many seconds must the AID AI CCTV video analytics detect a stopped vehicle on a highway?',
    optionsAz: [
      '10 saniyə ərzində',
      '5 dəqiqə ərzində',
      '30 dəqiqə ərzində',
      'Yalnız növbəti gün təhlil olunur',
    ],
    correctOptionIndex: 0,
    explanationAz: 'Beynəlxalq ITS və BDYP qaydalarına görə, sürətli magistrallarda təkrar toqquşmaların qarşısını almaq üçün AID deteksiya müddəti 10 saniyəni aşmamalıdır.',
    statutoryReference: 'ISO 14813 / BDYP Təhlükəsizlik Reqlamenti',
  },
  {
    id: 4,
    questionAz: '3D BIM LOD 400 infrastrukturu dedikdə rəqəmsal əkiz modelində nə nəzərdə tutulur?',
    questionEn: 'What does 3D BIM LOD 400 infrastructure entail in a digital twin highway model?',
    optionsAz: [
      'Yalnız 2D sxematik xəritə cizgisi',
      'Dəqiq həndəsi ölçülərə, yeraltı kommunikasiyalara və sensor avadanlıqlarına malik yüksək detallı istehsalat modeli',
      'Magistralın yalnız kosmik peyk fotoşəkli',
      'Sərnişinlərin mobil telefon nömrələri bazası',
    ],
    correctOptionIndex: 1,
    explanationAz: 'LOD 400 səviyyəsi magistralın hər bir elementinin (asfalt qatı, kabellər, sensorlar, işarələr) tikinti və istismar dəqiqliyi ilə rəqəmsal surətini təmin edir.',
    statutoryReference: 'ISO 19650-2 İnformasiya Modelləşdirməsi',
  },
  {
    id: 5,
    questionAz: 'V2X (Vehicle-to-Everything) texnologiyasında RSU qurğularının əsas funksiyası nədir?',
    questionEn: 'What is the primary function of Roadside Units (RSU) in V2X technology?',
    optionsAz: [
      'Sürücülərə reklam broşürləri göndərmək',
      'Magistral boyu avtomobillərə təhlükə, işıqfor fazaları və dinamik sürət xəbərdarlıqlarını kabelsiz ötürmək',
      'Avtomobillərin yanacaq çənini məsafədən bağlamaq',
      'Yalnız musiqi radiosunu yayımlamaq',
    ],
    correctOptionIndex: 1,
    explanationAz: 'RSU (Roadside Unit) 5.9 GHz tezliyində hərəkət edən avtomobillərin kompüterinə ani təhlükəsizlik telemetriyasını birbaşa ötürür.',
    statutoryReference: 'ISO 21217 CALM Standartı',
  },
  {
    id: 6,
    questionAz: 'Dinamik sürət həddi dəyişdirildikdə, DYP radar sistemi sürücülərə hansı keçid müddətini (bufer vaxtı) tanıyır?',
    questionEn: 'When the dynamic speed limit is lowered, what buffer transition time is recognized before photo-radar fines apply?',
    optionsAz: [
      '0 saniyə (dərhal cərimə kəsilir)',
      'Sürücülərin sürəti təhlükəsiz tənzimləməsi üçün 5 dəqiqəlik keçid buferi',
      '24 saat sonra',
      'Yalnız ayın sonunda',
    ],
    correctOptionIndex: 1,
    explanationAz: 'Sürücünün tablonu görüb sürətini qəfil tormozlama etmədən təhlükəsiz azaltması üçün qanuni təcrübədə 5 dəqiqəlik keçid adaptasiya buferi tətbiq olunur.',
    statutoryReference: 'BDYP Texniki İnteqrasiya Təlimatı',
  },
  {
    id: 7,
    questionAz: 'Magistralda zolaq üzərində qırmızı çəpəki xaç (Red X) işarəsi yandıqda sürücü nə etməlidir?',
    questionEn: 'When a red diagonal cross (Red X) illuminates above a lane on a highway, what must the driver do?',
    optionsAz: [
      'Həmin zolaqla daha yüksək sürətlə irəliləməlidir',
      'Həmin zolaq bağlıdır, dərhal təhlükəsiz şəkildə açıq zolağa keçməlidir',
      'Zolağın ortasında avtomobili saxlayıb gözləməlidir',
      'İşarəyə məhəl qoymadan hərəkəti davam etdirməlidir',
    ],
    correctOptionIndex: 1,
    explanationAz: 'Qırmızı X işarəsi zolağın qəza, təmir və ya maneə səbəbindən hərəkət üçün tamamilə qadağan edildiyini bildirir. Zolağa girmək qanunla ciddi qayda pozuntusudur.',
    statutoryReference: 'Yol hərəkəti haqqında Qanun, Maddə 34',
  },
  {
    id: 8,
    questionAz: 'Greenshields nəqliyyat axını modelinə görə nəqliyyat sıxlığı (k) jam density (tıxac sıxlığı) həddinə çatdıqda axın sürəti necə dəyişir?',
    questionEn: 'According to Greenshields traffic stream model, what happens to speed when density reaches jam density?',
    optionsAz: [
      'Sürət maksimum həddə çatır',
      'Sürət sıfra (0 km/s) enir və axın tamamilə dayanır',
      'Sürət dəyişməz qalır',
      'Sürət eksponensial olaraq artır',
    ],
    correctOptionIndex: 1,
    explanationAz: 'Tıxac sıxlığı (k_jam) yolun tam maşınlarla dolduğu və heç bir avtomobilin hərəkət edə bilmədiyi vəziyyəti təsvir edir; axın sürəti v = 0 olur.',
    statutoryReference: 'Nəqliyyat Axını Nəzəriyyəsi / HCM Manual',
  },
  {
    id: 9,
    questionAz: 'Magistral boyu SOS qəza dirəklərinin əsas enerji mənbəyi və ehtiyatı necə təşkil olunur?',
    questionEn: 'How is the primary and backup power organized for highway SOS emergency posts?',
    optionsAz: [
      'Yalnız birdəfəlik məişət batareyaları ilə',
      'Günəş panelləri və 48 saatlıq sənaye tipli dərin dövrlü gel akkumulyatorları ilə',
      'Avtomobillərdən çəkilən kabellərlə',
      'Yalnız gündüz saatlarında işləyən generatorla',
    ],
    correctOptionIndex: 1,
    explanationAz: 'SOS dirəkləri fövqəladə hallarda qəza yerində şəbəkədən asılı olmadan günəş paneli və güclü gel akkumulyatorları sayəsində 24/7 rejimdə işləməlidir.',
    statutoryReference: 'AAYDA SOS İnfrastruktur Standartı',
  },
  {
    id: 10,
    questionAz: 'Magistral boyu qurulmuş optik lif rabitə halqasının (ring redundancy) əsas üstünlüyü nədir?',
    questionEn: 'What is the main advantage of an optical fiber ring redundancy architecture along a highway?',
    optionsAz: [
      'İnternet xərcini azaltmaq',
      'Optik kabelin bir nöqtədə qırılması zamanı rabitənin dərhal əks istiqamətdən avtomatik bərpa olunması (<20ms)',
      'Yalnız televiziya yayımlarını ötürmək',
      'Yol polisinə radio ötürücüləri əvəz etmək',
    ],
    correctOptionIndex: 1,
    explanationAz: 'Halqa topologiyası kabel qazıntı və ya qəza zamanı kəsildikdə belə siqnalı dərhal əks tərəfdən göndərərək sistemin fasiləsiz işini qoruyur.',
    statutoryReference: 'RİNN Kritik İnfrastruktur Rabitə Qaydaları',
  },
];

export interface ExamEvaluationResult {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  scoreGrade: 'ƏLA' | 'YAXŞI' | 'KAFİ' | 'QEYRİ-KAFİ';
  feedbackAz: string;
}

export const evaluateDigitalTwinExam = (
  userAnswers: Record<number, number>
): ExamEvaluationResult => {
  const totalQuestions = DIGITAL_TWIN_EXAM_QUESTIONS.length;
  let correctCount = 0;

  DIGITAL_TWIN_EXAM_QUESTIONS.forEach((q) => {
    if (userAnswers[q.id] === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = percentage >= 70;

  let scoreGrade: 'ƏLA' | 'YAXŞI' | 'KAFİ' | 'QEYRİ-KAFİ' = 'QEYRİ-KAFİ';
  if (percentage >= 90) scoreGrade = 'ƏLA';
  else if (percentage >= 80) scoreGrade = 'YAXŞI';
  else if (percentage >= 70) scoreGrade = 'KAFİ';

  const feedbackAz = isPassed
    ? `Təbriklər! Siz ${percentage}% nəticə ilə RİNN, AYNA & BDYP Rəqəmsal Əkiz və Ağıllı Magistral İdarəetmə Sertifikatlaşdırma İmtahanını uğurla keçdiniz.`
    : `Nəticə qeyri-kafidir (${percentage}%). İmtahandan keçid balı 70%-dir. Dinamik sürət qaydaları, VMS nişanları və V2X standartlarını nəzərdən keçirin.`;

  return {
    correctCount,
    totalQuestions,
    percentage,
    isPassed,
    scoreGrade,
    feedbackAz,
  };
};

/**
 * Official NITS-TWIN-AZ-2026 Certificate & Verification Engine
 */
export interface DigitalTwinCertificate {
  certificateId: string; // e.g. "NITS-TWIN-AZ-2026-1042"
  corridorId: CorridorId;
  corridorNameAz: string;
  authorizedOrganization: string;
  operatorVoen: string;
  bimLodLevel: string;
  baselineSpeedLimitKmH: number;
  activeVslKmH: number;
  levelOfService: LevelOfService;
  safetyScorePercentage: number;
  rwisFrictionMu: number;
  issueDateIso: string;
  expiryDateIso: string;
  simaDigitalUid: string;
  sha256VerificationHash: string;
  qrVerificationUrl: string;
  status: 'ACTIVE_CERTIFIED' | 'MONITORED_ADVISORY' | 'TEMPORARILY_RESTRICTED';
}

/**
 * Deterministic SHA-256 hash simulator for official certificates
 */
export const generateSimulatedSha256Checksum = (input: string): string => {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x27d4eb2f;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash1 ^= char;
    hash1 = (hash1 * 0x01000193) >>> 0;
    hash2 = (hash2 * 31 + char) >>> 0;
  }

  const part1 = hash1.toString(16).padStart(8, '0');
  const part2 = hash2.toString(16).padStart(8, '0');
  const part3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((hash1 + hash2) >>> 0).toString(16).padStart(8, '0');
  const part5 = (((hash1 << 5) ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const part6 = (((hash2 << 7) ^ hash1) >>> 0).toString(16).padStart(8, '0');
  const part7 = ((hash1 ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0');
  const part8 = ((hash2 ^ 0xa5a5a5a5) >>> 0).toString(16).padStart(8, '0');

  return `${part1}${part2}${part3}${part4}${part5}${part6}${part7}${part8}`;
};

/**
 * Issue an official Digital Twin Clearance Certificate
 */
export const issueDigitalTwinCertificate = (params: {
  corridorId: CorridorId;
  authorizedOrganization: string;
  operatorVoen: string;
  safetyScorePercentage: number;
  activeVslKmH: number;
  levelOfService: LevelOfService;
  rwisFrictionMu: number;
}): DigitalTwinCertificate => {
  const corridor = STRATEGIC_CORRIDORS[params.corridorId] || STRATEGIC_CORRIDORS.CORRIDOR_BAKU_RING_ROAD;
  const seedNumber = Math.floor(1000 + Math.random() * 9000);
  const certificateId = `NITS-TWIN-AZ-2026-${seedNumber}`;

  const issueDate = new Date();
  const expiryDate = new Date(issueDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  const rawPayload = `${certificateId}|${params.corridorId}|${params.operatorVoen}|${params.safetyScorePercentage}|${issueDate.toISOString()}`;
  const sha256VerificationHash = generateSimulatedSha256Checksum(rawPayload);
  const simaDigitalUid = `SIMA-NITS-${sha256VerificationHash.substring(0, 12).toUpperCase()}`;

  let status: 'ACTIVE_CERTIFIED' | 'MONITORED_ADVISORY' | 'TEMPORARILY_RESTRICTED' = 'ACTIVE_CERTIFIED';
  if (params.safetyScorePercentage < 70 || params.levelOfService === 'LOS_F') {
    status = 'TEMPORARILY_RESTRICTED';
  } else if (params.safetyScorePercentage < 85 || params.levelOfService === 'LOS_E') {
    status = 'MONITORED_ADVISORY';
  }

  return {
    certificateId,
    corridorId: params.corridorId,
    corridorNameAz: corridor.nameAz,
    authorizedOrganization: params.authorizedOrganization,
    operatorVoen: params.operatorVoen,
    bimLodLevel: corridor.bimLodLevel,
    baselineSpeedLimitKmH: corridor.baselineSpeedLimitKmH,
    activeVslKmH: params.activeVslKmH,
    levelOfService: params.levelOfService,
    safetyScorePercentage: params.safetyScorePercentage,
    rwisFrictionMu: params.rwisFrictionMu,
    issueDateIso: issueDate.toISOString().split('T')[0],
    expiryDateIso: expiryDate.toISOString().split('T')[0],
    simaDigitalUid,
    sha256VerificationHash,
    qrVerificationUrl: `https://nits.gov.az/verify/twin/${certificateId}?hash=${sha256VerificationHash.substring(0, 16)}`,
    status,
  };
};
