/**
 * Official Azerbaijan Railways CJSC (ADY - "Azərbaycan Dəmir Yolları" QSC),
 * State Agency of Azerbaijan Automobile Roads (AAYDA) &
 * Main State Traffic Police Department (BDYP) Highway-Railway Level Crossing SCADA,
 * Laser Obstacle Radar, Automatic Barrier Interlocking & Safety Telemetry Portal Engine
 * (ADY, AAYDA & BDYP Həmsəviyyəli Dəmiryolu Keçidləri SCADA Təhlükəsizlik Sistemi,
 * Avtomatik Baryer Kilidləmə, Maneə Aşkarlama Radarı və LEVEL-CROSSING-AZ-2026 Portalı)
 *
 * Statutory Framework:
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 44: Dəmir yolu keçidləri ilə hərəkət; Maddə 52, 53)
 * - Code of Administrative Offences of the Republic of Azerbaijan (Maddə 327.3: Dəmiryol keçidindən keçmə qaydalarının pozulması - 100 AZN + 3 cərimə balı)
 * - "Azərbaycan Dəmir Yolları" QSC (ADY) Technical Operation Rules (TİQ Maddə 15: Keçidlərin təchizatı və xidməti)
 * - State Standard AZS 422 / AZS 342 (Dəmiryolu keçidlərinin avtomatika və işıqfor siqnalizasiyası qaydaları)
 * - Cabinet of Ministers Resolution No. 104 on Exceptional Over-dimensional & Heavy Vehicle Escort
 * - UNECE Vienna Convention on Road Traffic (Article 18 & 19: Railway Level Crossings) & UIC 912 Safety Code
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN = 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function formatCurrency(amountAzn: number, currency: Currency): string {
  const rate = CURRENCY_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '₼';
  const converted = amountAzn * rate;
  return `${converted.toFixed(2)} ${symbol}`;
}

export type CrossingId =
  | 'sabunchu_zabrat'
  | 'qobustan_sangachal'
  | 'khachmaz_north'
  | 'masalli_south'
  | 'aran_bypass'
  | 'zangezur_gateway';

export type BarrierState = 'open' | 'descending' | 'closed' | 'emergency_trap';
export type SignalLampState = 'lunar_white' | 'alternating_red' | 'dark_failure';
export type ObstacleDetectionState = 'clear' | 'vehicle_trapped' | 'debris_alert' | 'pedestrian';
export type TrainApproachState = 'no_train' | 'approaching_caution' | 'crossing_active' | 'train_occupying';

export interface LevelCrossingAsset {
  id: CrossingId;
  nameAz: string;
  nameEn: string;
  lineCorridorAz: string;
  lineCorridorEn: string;
  railKm: string;
  highwayRoute: string;
  tracksCount: number;
  isElectrified: boolean;
  catenaryVoltageKv: number; // 25 kV AC or 3 kV DC
  maxTrainSpeedKmh: number;
  dailyVehicleCount: number;
  barrierTypeAz: string;
  radarTypeAz: string;
  cctvAnprActive: boolean;
  stationMasterPhone: string;
  dispatcherEmergencyPhone: string;
  latitude: number;
  longitude: number;
  defaultBarrierState: BarrierState;
  defaultTrainSpeedKmh: number;
  defaultTrainDistanceM: number;
}

export const LEVEL_CROSSINGS_REGISTRY: Record<CrossingId, LevelCrossingAsset> = {
  sabunchu_zabrat: {
    id: 'sabunchu_zabrat',
    nameAz: 'Sabunçu - Zabrat Həmsəviyyəli Dəmiryolu Keçidi',
    nameEn: 'Sabunchu - Zabrat Highway-Rail Grade Crossing',
    lineCorridorAz: 'Bakı - Sabunçu - Pirşağı - Sumqayıt Dairəvi Xətti',
    lineCorridorEn: 'Baku - Sabunchu - Pirshagi - Sumgayit Commuter Line',
    railKm: 'Km 18+420',
    highwayRoute: 'Sabunçu - Maştağa Magistralı (R-6)',
    tracksCount: 2,
    isElectrified: true,
    catenaryVoltageKv: 25,
    maxTrainSpeedKmh: 140,
    dailyVehicleCount: 42000,
    barrierTypeAz: 'Dördgözlü Tam Avtomatik Şlaqbaum (4x Baryer)',
    radarTypeAz: '3D FMCW Millimetrik Radar + İntellektual Lidar',
    cctvAnprActive: true,
    stationMasterPhone: '+994 (12) 499-81-22',
    dispatcherEmergencyPhone: '+994 (12) 499-10-01 (ADY Qəza Mərkəzi)',
    latitude: 40.4528,
    longitude: 49.9511,
    defaultBarrierState: 'open',
    defaultTrainSpeedKmh: 110,
    defaultTrainDistanceM: 1850,
  },
  qobustan_sangachal: {
    id: 'qobustan_sangachal',
    nameAz: 'Qobustan - Səngəçal Ağır Nəqliyyat Dəmiryolu Keçidi',
    nameEn: 'Qobustan - Sangachal Heavy Freight Grade Crossing',
    lineCorridorAz: 'Bakı - Ələt - Hacıqabul - Gəncə Əsas Magistral Dəmiryolu',
    lineCorridorEn: 'Baku - Alat - Hajiqabul - Ganja Mainline Rail Corridor',
    railKm: 'Km 64+150',
    highwayRoute: 'Bakı - Ələt - Qazax - Gürcüstan Sərhədi (M-2)',
    tracksCount: 2,
    isElectrified: true,
    catenaryVoltageKv: 25,
    maxTrainSpeedKmh: 120,
    dailyVehicleCount: 28000,
    barrierTypeAz: 'Hidravlik Kilidli Yarımşlaqbaum + Yol Baryerləri (UZP)',
    radarTypeAz: 'Optik Termal Matris + İkiqat İnduktiv Kontur',
    cctvAnprActive: true,
    stationMasterPhone: '+994 (12) 499-74-50',
    dispatcherEmergencyPhone: '+994 (12) 499-10-02',
    latitude: 40.1205,
    longitude: 49.4678,
    defaultBarrierState: 'open',
    defaultTrainSpeedKmh: 90,
    defaultTrainDistanceM: 2400,
  },
  khachmaz_north: {
    id: 'khachmaz_north',
    nameAz: 'Xaçmaz Beynəlxalq Şimal Dəmiryolu Keçidi',
    nameEn: 'Khachmaz North Corridor International Grade Crossing',
    lineCorridorAz: 'Bakı - Yalama - Rusiya Federasiyası Sərhədi',
    lineCorridorEn: 'Baku - Yalama - Russian Federation Frontier Rail',
    railKm: 'Km 132+800',
    highwayRoute: 'Bakı - Quba - Rusiya Sərhədi Avtomobil Yolu (M-1)',
    tracksCount: 2,
    isElectrified: true,
    catenaryVoltageKv: 25,
    maxTrainSpeedKmh: 100,
    dailyVehicleCount: 16500,
    barrierTypeAz: 'Rele Bloklamalı Avtomatik İşıqfor-Şlaqbaum (AOP)',
    radarTypeAz: 'Ultrasonik Maneə Skeneri + Lazer Barajı',
    cctvAnprActive: true,
    stationMasterPhone: '+994 (23) 325-11-40',
    dispatcherEmergencyPhone: '+994 (23) 325-10-05',
    latitude: 41.4635,
    longitude: 48.8062,
    defaultBarrierState: 'open',
    defaultTrainSpeedKmh: 80,
    defaultTrainDistanceM: 1600,
  },
  masalli_south: {
    id: 'masalli_south',
    nameAz: 'Masallı - Lənkəran Cənub Dəmiryolu Keçidi',
    nameEn: 'Masalli - Lankaran South Corridor Grade Crossing',
    lineCorridorAz: 'Ələt - Masallı - Astara - İran Sərhədi Tranziti',
    lineCorridorEn: 'Alat - Masalli - Astara - Iran Border Rail Transit',
    railKm: 'Km 210+500',
    highwayRoute: 'Ələt - Astara Beynəlxalq Magistralı (M-3)',
    tracksCount: 1,
    isElectrified: true,
    catenaryVoltageKv: 25,
    maxTrainSpeedKmh: 90,
    dailyVehicleCount: 19000,
    barrierTypeAz: 'Elektron İşıqforlu Avtomat Şlaqbaum və Zəng Siqnalı',
    radarTypeAz: 'Dördnöqtəli İnfraqırmızı Maneə Detektoru',
    cctvAnprActive: true,
    stationMasterPhone: '+994 (25) 215-22-19',
    dispatcherEmergencyPhone: '+994 (25) 215-10-03',
    latitude: 39.0341,
    longitude: 48.6654,
    defaultBarrierState: 'open',
    defaultTrainSpeedKmh: 75,
    defaultTrainDistanceM: 1400,
  },
  aran_bypass: {
    id: 'aran_bypass',
    nameAz: 'Kürdəmir - Yevlax Aran Aqro-Logistika Dəmiryolu Keçidi',
    nameEn: 'Kurdamir - Yevlakh Central Agro-Logistics Grade Crossing',
    lineCorridorAz: 'Hacıqabul - Kürdəmir - Yevlax - Gəncə Qərb Magistralı',
    lineCorridorEn: 'Hajiqabul - Kurdamir - Yevlakh - Ganja West Mainline',
    railKm: 'Km 288+200',
    highwayRoute: 'Yevlax - Bərdə - Ağdam Magistral Şosesi (R-32)',
    tracksCount: 2,
    isElectrified: true,
    catenaryVoltageKv: 25,
    maxTrainSpeedKmh: 110,
    dailyVehicleCount: 22000,
    barrierTypeAz: 'Avtomatik Yarımşlaqbaum + İşıqfor və Maneə Qaldırıcı',
    radarTypeAz: 'Mikrodalğalı 77 GHz Maneə Radarı',
    cctvAnprActive: true,
    stationMasterPhone: '+994 (20) 255-14-30',
    dispatcherEmergencyPhone: '+994 (20) 255-10-01',
    latitude: 40.5982,
    longitude: 47.1456,
    defaultBarrierState: 'open',
    defaultTrainSpeedKmh: 95,
    defaultTrainDistanceM: 2100,
  },
  zangezur_gateway: {
    id: 'zangezur_gateway',
    nameAz: 'Cəbrayıl - Zəngilan Zəngəzur Dəhlizi Smart Dəmiryolu Keçidi',
    nameEn: 'Jabrayil - Zangilan Zangezur Gateway Smart Grade Crossing',
    lineCorridorAz: 'Horadiz - Ağbənd - Naxçıvan Strateji Dəmiryolu',
    lineCorridorEn: 'Horadiz - Agbend - Nakhchivan Strategic Rail Corridor',
    railKm: 'Km 45+100',
    highwayRoute: 'Hacıqabul - Horadiz - Zəngilan - Ağbənd Magistralı (M-6)',
    tracksCount: 2,
    isElectrified: true,
    catenaryVoltageKv: 25,
    maxTrainSpeedKmh: 140,
    dailyVehicleCount: 14000,
    barrierTypeAz: 'Optik Lifli SCADA Avtomatik Tam Qoruyucu Şlaqbaum',
    radarTypeAz: 'AI Neyron Şəbəkəli 360° 3D Lidar + LPR Kamera',
    cctvAnprActive: true,
    stationMasterPhone: '+994 (12) 499-90-88',
    dispatcherEmergencyPhone: '+994 (12) 499-10-08',
    latitude: 39.1024,
    longitude: 46.7389,
    defaultBarrierState: 'open',
    defaultTrainSpeedKmh: 120,
    defaultTrainDistanceM: 2800,
  },
};

export type VehicleClass = 'sedan' | 'bus' | 'truck' | 'oversize' | 'hazmat';

export interface VehicleClassInfo {
  type: VehicleClass;
  nameAz: string;
  nameEn: string;
  defaultLengthM: number;
  defaultWeightTons: number;
  defaultHeightM: number;
  requiresAdyEscort: boolean;
  baseFeeAzn: number;
  escortFeeAzn: number;
  catenarySafetyFeeAzn: number;
}

export const VEHICLE_CLASSES_INFO: Record<VehicleClass, VehicleClassInfo> = {
  sedan: {
    type: 'sedan',
    nameAz: 'Minik Avtomobili / Fərdi Nəqliyyat',
    nameEn: 'Passenger Sedan / Light Vehicle',
    defaultLengthM: 4.8,
    defaultWeightTons: 1.8,
    defaultHeightM: 1.5,
    requiresAdyEscort: false,
    baseFeeAzn: 0,
    escortFeeAzn: 0,
    catenarySafetyFeeAzn: 0,
  },
  bus: {
    type: 'bus',
    nameAz: 'Şəhərlərarası Sərnişin Avtobusu',
    nameEn: 'Intercity Passenger Bus',
    defaultLengthM: 12.5,
    defaultWeightTons: 18.0,
    defaultHeightM: 3.4,
    requiresAdyEscort: false,
    baseFeeAzn: 0,
    escortFeeAzn: 0,
    catenarySafetyFeeAzn: 0,
  },
  truck: {
    type: 'truck',
    nameAz: 'Standart Ağır Yük Avtomobili (TIR)',
    nameEn: 'Standard Heavy Freight Truck (TIR)',
    defaultLengthM: 16.5,
    defaultWeightTons: 38.0,
    defaultHeightM: 3.9,
    requiresAdyEscort: false,
    baseFeeAzn: 15,
    escortFeeAzn: 0,
    catenarySafetyFeeAzn: 0,
  },
  oversize: {
    type: 'oversize',
    nameAz: 'Qabaritsiz / Ağır Xüsusi Texnika (Kombayn, Kran)',
    nameEn: 'Oversize / Heavy Special Machinery (Harvester, Crane)',
    defaultLengthM: 22.0,
    defaultWeightTons: 65.0,
    defaultHeightM: 4.65, // > 4.5m requires catenary safety check
    requiresAdyEscort: true,
    baseFeeAzn: 60,
    escortFeeAzn: 80,
    catenarySafetyFeeAzn: 120,
  },
  hazmat: {
    type: 'hazmat',
    nameAz: 'Təhlükəli Yük Tankeri (ADR Sinif 3 Yanacaq)',
    nameEn: 'Hazardous Goods Tanker (ADR Class 3 Flammable)',
    defaultLengthM: 15.0,
    defaultWeightTons: 36.0,
    defaultHeightM: 3.7,
    requiresAdyEscort: false,
    baseFeeAzn: 45,
    escortFeeAzn: 50,
    catenarySafetyFeeAzn: 0,
  },
};

export interface CrossingTelemetryState {
  crossingId: CrossingId;
  barrierState: BarrierState;
  signalLampState: SignalLampState;
  acousticAlarmActive: boolean;
  obstacleState: ObstacleDetectionState;
  obstacleDistanceM: number;
  trainApproaching: boolean;
  trainSpeedKmh: number;
  trainDistanceM: number;
  trainType: 'passenger_emu' | 'heavy_freight' | 'diesel_locomotive';
  atsEmergencyTripActivated: boolean;
  emergencyRelayTriggered: boolean;
  crossingClearanceTimeSec: number;
  cctvSurveillanceStatus: 'normal' | 'recording_violation' | 'maintenance';
}

export interface TransitTariffCalculation {
  vehicleType: VehicleClass;
  crossingId: CrossingId;
  totalFeeAzn: number;
  baseFeeAzn: number;
  escortFeeAzn: number;
  catenarySafetyFeeAzn: number;
  policeEscortFeeAzn: number;
  requiresSpecialEscort: boolean;
  requiresCatenaryDeenergization: boolean;
  violationPenaltyAzn: number;
  violationPenaltyDiscountedAzn: number;
  violationPenaltyPoints: number;
}

export function calculateTransitTariff(params: {
  vehicleType: VehicleClass;
  crossingId: CrossingId;
  vehicleHeightM: number;
  vehicleWidthM: number;
  vehicleWeightTons: number;
  vehicleSpeedKmh: number;
  requiresPoliceConvoy?: boolean;
}): TransitTariffCalculation {
  const info = VEHICLE_CLASSES_INFO[params.vehicleType] || VEHICLE_CLASSES_INFO.sedan;
  let baseFee = info.baseFeeAzn;
  let escortFee = info.escortFeeAzn;
  let catenaryFee = info.catenarySafetyFeeAzn;
  let policeFee = params.requiresPoliceConvoy ? 50 : 0;

  // Law "On Road Traffic" Maddə 44: Vehicles slower than 8 km/h or width > 5m or height > 4.5m require ADY Stationmaster permission
  const isSlowMoving = params.vehicleSpeedKmh < 8;
  const isOverheight = params.vehicleHeightM > 4.5;
  const isOverwidth = params.vehicleWidthM > 3.5;
  const isOverweight = params.vehicleWeightTons > 44;

  const requiresSpecialEscort = info.requiresAdyEscort || isSlowMoving || isOverwidth || isOverweight;
  const requiresCatenaryDeenergization = isOverheight;

  if (requiresSpecialEscort && escortFee === 0) {
    escortFee = 75;
  }
  if (requiresCatenaryDeenergization && catenaryFee === 0) {
    catenaryFee = 120;
  }

  const totalFeeAzn = baseFee + escortFee + catenaryFee + policeFee;

  // Law Maddə 327.3: Violation fine for crossing against red light or closed barrier: 100 AZN + 3 penalty points
  const violationPenaltyAzn = 100;
  const violationPenaltyDiscountedAzn = 50; // 50% discount within 30 days
  const violationPenaltyPoints = 3;

  return {
    vehicleType: params.vehicleType,
    crossingId: params.crossingId,
    totalFeeAzn,
    baseFeeAzn: baseFee,
    escortFeeAzn: escortFee,
    catenarySafetyFeeAzn: catenaryFee,
    policeEscortFeeAzn: policeFee,
    requiresSpecialEscort,
    requiresCatenaryDeenergization,
    violationPenaltyAzn,
    violationPenaltyDiscountedAzn,
    violationPenaltyPoints,
  };
}

export interface CollisionRiskAnalysis {
  timeToImpactSec: number;
  emergencyBrakingDistanceM: number;
  distanceMarginM: number;
  isTrainStopGuaranteed: boolean;
  riskLevel: 'safe' | 'caution' | 'critical_danger';
  recommendedActionAz: string;
  recommendedActionEn: string;
  atsTripMandatory: boolean;
}

export function evaluateCollisionRisk(params: {
  trainSpeedKmh: number;
  trainDistanceM: number;
  trainType: 'passenger_emu' | 'heavy_freight' | 'diesel_locomotive';
  obstacleDetected: boolean;
  barrierState: BarrierState;
}): CollisionRiskAnalysis {
  const speedMs = (params.trainSpeedKmh * 1000) / 3600;
  const timeToImpactSec = speedMs > 0 ? Math.round((params.trainDistanceM / speedMs) * 10) / 10 : 999;

  // Deceleration rates: EMU train ~ 1.2 m/s^2, freight ~ 0.75 m/s^2, diesel ~ 0.9 m/s^2
  let decelerationRate = 1.0;
  if (params.trainType === 'passenger_emu') {
    decelerationRate = 1.25;
  } else if (params.trainType === 'heavy_freight') {
    decelerationRate = 0.75;
  } else {
    decelerationRate = 0.95;
  }

  // Emergency braking distance S = v^2 / (2 * a)
  const emergencyBrakingDistanceM = Math.round((speedMs * speedMs) / (2 * decelerationRate));
  const distanceMarginM = Math.round(params.trainDistanceM - emergencyBrakingDistanceM);
  const isTrainStopGuaranteed = distanceMarginM > 80;

  let riskLevel: 'safe' | 'caution' | 'critical_danger' = 'safe';
  let recommendedActionAz = 'Normal hərəkət rejimi: Keçid zonası açıqdır və təhlükəsizdir.';
  let recommendedActionEn = 'Normal operation: Crossing zone is clear and safe.';
  let atsTripMandatory = false;

  if (params.obstacleDetected) {
    if (timeToImpactSec <= 25 || !isTrainStopGuaranteed) {
      riskLevel = 'critical_danger';
      recommendedActionAz = 'FÖVQƏLADƏ TƏHLÜKƏ! Qatara dərhal ALSN / ETCS qəza əyləc siqnalı (ATS) göndərilsin!';
      recommendedActionEn = 'CRITICAL DANGER! Transmit immediate ATS / ETCS emergency brake trip to locomotive cab!';
      atsTripMandatory = true;
    } else {
      riskLevel = 'caution';
      recommendedActionAz = 'XƏBƏRDARLIQ: Keçiddə maneə aşkarlandı. Maşinistə sürəti azaltmaq əmri göndərildi.';
      recommendedActionEn = 'CAUTION: Obstacle detected on crossing. Speed restriction advisory sent to driver.';
      atsTripMandatory = false;
    }
  } else if (params.barrierState === 'descending' || params.barrierState === 'closed') {
    if (timeToImpactSec <= 35) {
      riskLevel = 'caution';
      recommendedActionAz = 'Qatar yaxınlaşır: Şlaqbaum kilidləndi, optik qırmızı işıqlar aktivdir.';
      recommendedActionEn = 'Train approaching: Barriers locked, alternating red signals active.';
    }
  }

  return {
    timeToImpactSec,
    emergencyBrakingDistanceM,
    distanceMarginM,
    isTrainStopGuaranteed,
    riskLevel,
    recommendedActionAz,
    recommendedActionEn,
    atsTripMandatory,
  };
}

export interface LevelCrossingChecklistItem {
  id: string;
  categoryAz: string;
  titleAz: string;
  titleEn: string;
  lawReference: string;
  descriptionAz: string;
  penaltyPoints: number;
  fineAzn: number;
}

export const LEVEL_CROSSING_CHECKLIST: LevelCrossingChecklistItem[] = [
  {
    id: 'chk_stopping_distance',
    categoryAz: 'Dayanma Məsafəsi',
    titleAz: 'Şlaqbaum olduqda 5 metr, olmadıqda relsdən 10 metr məsafədə dayanmaq',
    titleEn: 'Stop at least 5m from barrier or 10m from nearest rail when train approaches',
    lawReference: 'Yol hərəkəti haqqında Qanun Maddə 44 (I hissə)',
    descriptionAz: 'Şlaqbaum, işıqfor və ya keçid növbətçisinin qadağan siqnalı olduqda sürücü stop-xəttində, olmadıqda şlaqbauma 5 metr, şlaqbaum olmadıqda isə ən yaxın relsə ən azı 10 metr qalmış dayanmalıdır.',
    penaltyPoints: 3,
    fineAzn: 100,
  },
  {
    id: 'chk_closed_barrier_prohibition',
    categoryAz: 'Baryer Qaydaları',
    titleAz: 'Bağlanan və ya bağlanmış şlaqbaumun yanından keçmənin qəti qadağan olması',
    titleEn: 'Strict prohibition of bypassing closed or descending barrier arms',
    lawReference: 'Yol hərəkəti haqqında Qanun Maddə 44 (II hissə, 1-ci bənd)',
    descriptionAz: 'Şlaqbaum bağlanarkən, tam bağlı olduqda və ya işıqforun yanıb-sönən qırmızı siqnalında keçidə daxil olmaq və ya qarşı zolağa çıxaraq baryeri dolanmaq qəti qadağandır.',
    penaltyPoints: 3,
    fineAzn: 100,
  },
  {
    id: 'chk_no_stop_reverse_overtake',
    categoryAz: 'Manevr Qaydaları',
    titleAz: 'Dəmiryol keçidi üzərində dayanma, geri hərəkət və ötmə qadağası',
    titleEn: 'No stopping, no reversing, and no overtaking on or within 100m of grade crossing',
    lawReference: 'Yol hərəkəti haqqında Qanun Maddə 44 & Maddə 52',
    descriptionAz: 'Dəmir yolu keçidində və ona 100 metrdən az məsafədə ötmə, keçidin özündə isə dayanma və ya geriyə hərəkət etmək qəti qadağandır.',
    penaltyPoints: 3,
    fineAzn: 100,
  },
  {
    id: 'chk_gear_shift_prohibition',
    categoryAz: 'İdarəetmə Texnikası',
    titleAz: 'Keçid üzərində sürət pilləsini dəyişməmək və muftanı ayırmamaq',
    titleEn: 'Zero gear-shifting or clutch disengagement while traversing rails',
    lawReference: 'ADY Dəmir Yollarının Texniki İstismar Qaydaları (TİQ) Maddə 15',
    descriptionAz: 'Keçid üzərində transmissiya pilləsinin dəyişdirilməsi və ya muftanın basılması mühərrikin sönməsinə və nəqliyyatın rels üzərində ilişməsinə səbəb ola bilər.',
    penaltyPoints: 0,
    fineAzn: 50,
  },
  {
    id: 'chk_emergency_circular_signal',
    categoryAz: 'Qəza Siqnalı',
    titleAz: 'Nəqliyyat ilişdikdə maşinistə dairəvi qol hərəkəti ilə dayandırıcı siqnal vermək',
    titleEn: 'Give circular arm emergency stop signal to approaching train (1000m distance)',
    lawReference: 'Yol hərəkəti haqqında Qanun Maddə 44 (III hissə)',
    descriptionAz: 'Avtomobil keçiddə məcburi dayandıqda və çıxarmaq mümkün olmadıqda, hər iki istiqamətə (ən azı 1000m) siqnalçı göndərilir; gündüz qırmızı parça və ya əl dairəvi fırladılır, gecə isə fənər və ya məşəllə dairəvi hərəkət edilir.',
    penaltyPoints: 0,
    fineAzn: 0,
  },
  {
    id: 'chk_slow_machinery_permission',
    categoryAz: 'Xüsusi Texnika',
    titleAz: 'Sürəti 8 km/saatdan az olan texnikanın stansiya rəisi icazəsi ilə keçməsi',
    titleEn: 'Permit from railway stationmaster for machinery moving under 8 km/h',
    lawReference: 'Yol hərəkəti haqqında Qanun Maddə 44 (IV hissə)',
    descriptionAz: 'Kənd təsərrüfatı, yol və tikinti maşınlarının, habelə sürəti 8 km/saatdan az olan nəqliyyat qatarlarının keçiddən keçməsinə yalnız dəmir yolu distansiyası rəisinin icazəsi ilə yol verilir.',
    penaltyPoints: 3,
    fineAzn: 150,
  },
  {
    id: 'chk_catenary_height_limit',
    categoryAz: 'Kontakt Şəbəkəsi',
    titleAz: 'Yükün qabarit hündürlüyü 4.5 metrdən çox olduqda elektrik xətti təhlükəsizlik razılığı',
    titleEn: 'Overhead catenary 25kV clearance consent for vehicles over 4.5m in height',
    lawReference: 'Nazirlər Kabinetinin 104 nömrəli Qərarı & ADY Təhlükəsizlik Qaydaları',
    descriptionAz: 'Qabarit hündürlüyü 4.5 metrdən çox olan avtomobillər 25,000 Volt yüksək gərginlikli kontakt naqilinə yaxınlaşma təhlükəsi yaratdığı üçün ADY mühəndisi müşayiəti tələb olunur.',
    penaltyPoints: 4,
    fineAzn: 250,
  },
  {
    id: 'chk_passenger_evacuation',
    categoryAz: 'Sərnişin Təhlükəsizliyi',
    titleAz: 'Keçiddə məcburi dayanma zamanı sərnişinlərin dərhal təxliyə edilməsi',
    titleEn: 'Immediate evacuation of passengers if vehicle stalls on railway crossing',
    lawReference: 'Yol hərəkəti haqqında Qanun Maddə 44 (III hissə, bənd a)',
    descriptionAz: 'Nəqliyyat vasitəsi dəmir yolu keçidində dayandıqda sürücü dərhal sərnişinləri düşürməli və keçidi təmizləmək üçün bütün tədbirləri görməlidir.',
    penaltyPoints: 0,
    fineAzn: 60,
  },
  {
    id: 'chk_unauthorized_crossing_ban',
    categoryAz: 'Qeyri-Qanuni Keçid',
    titleAz: 'Xüsusi ayrılmamış yerlərdən dəmiryolu xəttini kəsmənin qəti qadağan olması',
    titleEn: 'Strict prohibition of crossing railway tracks outside designated grade crossings',
    lawReference: 'Yol hərəkəti haqqında Qanun Maddə 44 (I hissə)',
    descriptionAz: 'Dəmir yolu xətlərini yalnız xüsusi təchiz edilmiş dəmir yolu keçidlərindən keçmək olar. Relslərin üzərindən icazəsiz keçmə təhlükəsizlik qəzası hesab edilir.',
    penaltyPoints: 4,
    fineAzn: 200,
  },
  {
    id: 'chk_audiovisual_system_check',
    categoryAz: 'Siqnalizasiya Audit',
    titleAz: 'AOP işıqforlarının, zəng siqnalının və yol nişanlarının (1.1 - 1.4) görünürlüyü',
    titleEn: 'Verification of AOP flashing lights, warning bells, and 1.1 - 1.4 rail warning signs',
    lawReference: 'Dövlət Standartı AZS 422 & Yol Hərəkəti Qaydaları 1-ci Əlavə',
    descriptionAz: 'Dəmiryolu keçidinə yaxınlaşma nişanları (1.1, 1.2, 1.3, 1.4) 150-300 metr və 50 metr məsafələrdə düzgün yerləşdirilməli, yanıb-sönən iki qırmızı işıq aydın görünməlidir.',
    penaltyPoints: 0,
    fineAzn: 40,
  },
];

export interface LevelCrossingExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctAnswer: number;
  explanationAz: string;
  explanationEn: string;
}

export const LEVEL_CROSSING_EXAM_QUESTIONS: LevelCrossingExamQuestion[] = [
  {
    id: 1,
    questionAz: 'Yol hərəkəti haqqında Qanuna əsasən, dəmir yolu keçidinə yaxınlaşarkən şlaqbaum olduqda və hərəkət qadağan edildikdə sürücü şlaqbauma ən azı neçə metr qalmış dayanmalıdır?',
    questionEn: 'According to the Law On Road Traffic, when a train is approaching and a barrier is present, at what minimum distance from the barrier must the driver stop?',
    optionsAz: [
      'Ən azı 2 metr qalmış',
      'Ən azı 5 metr qalmış',
      'Ən azı 10 metr qalmış',
      'Ən azı 15 metr qalmış',
    ],
    optionsEn: [
      'At least 2 meters',
      'At least 5 meters',
      'At least 10 meters',
      'At least 15 meters',
    ],
    correctAnswer: 1,
    explanationAz: 'Qanunun 44-cü maddəsinə əsasən, hərəkət qadağan edildikdə sürücü şlaqbaum olduqda ona ən azı 5 metr qalmış dayanmalıdır.',
    explanationEn: 'Under Article 44, when movement is prohibited, the driver must stop at least 5 meters before the barrier arm.',
  },
  {
    id: 2,
    questionAz: 'Dəmir yolu keçidində şlaqbaum olmadıqda, yaxınlaşan qatar qarşısında ən yaxın relsə ən azı nə qədər məsafədə dayanmaq tələb olunur?',
    questionEn: 'If there is no barrier at a railway grade crossing, what is the minimum distance from the nearest rail a vehicle must stop?',
    optionsAz: [
      'Ən azı 5 metr qalmış',
      'Ən azı 10 metr qalmış',
      'Ən azı 15 metr qalmış',
      'Ən azı 20 metr qalmış',
    ],
    optionsEn: [
      'At least 5 meters',
      'At least 10 meters',
      'At least 15 meters',
      'At least 20 meters',
    ],
    correctAnswer: 1,
    explanationAz: 'Şlaqbaum olmadıqda sürücü ən yaxın relsə ən azı 10 metr qalmış dayanmağa borcludur (Maddə 44).',
    explanationEn: 'When there is no barrier arm, the vehicle must stop at least 10 meters away from the nearest rail (Article 44).',
  },
  {
    id: 3,
    questionAz: 'İnzibati Xətalar Məcəlləsinin 327.3-cü maddəsinə əsasən, dəmir yolu keçidindən keçmə qaydalarını pozmağa (məsələn, qırmızı işıqda keçmək) görə hansı cəza tətbiq olunur?',
    questionEn: 'Under Article 327.3 of the Code of Administrative Offences, what penalty is imposed for violating railway crossing transit rules?',
    optionsAz: [
      '40 AZN cərimə və 1 bal',
      '60 AZN cərimə və 2 bal',
      '100 AZN cərimə və 3 cərimə balı',
      '200 AZN cərimə və sürücülük hüququndan məhrum etmə',
    ],
    optionsEn: [
      '40 AZN fine and 1 penalty point',
      '60 AZN fine and 2 penalty points',
      '100 AZN fine and 3 penalty points',
      '200 AZN fine and license revocation',
    ],
    correctAnswer: 2,
    explanationAz: 'İXM Maddə 327.3-ə əsasən, dəmiryol keçidindən keçmə qaydalarının pozulması 100 manat məbləğində cərimə və 3 cərimə balı ilə cəzalandırılır.',
    explanationEn: 'Under Article 327.3, railway level crossing violations result in a 100 AZN fine and 3 penalty points.',
  },
  {
    id: 4,
    questionAz: 'Dəmiryol keçidində avtomobil məcburi dayandıqda və relslərdən çıxarmaq mümkün olmadıqda, yaxınlaşan qatara dayandırıcı qəza siqnalı necə verilməlidir?',
    questionEn: 'If a vehicle stalls on a railway crossing and cannot be removed, how should an emergency stop signal be given to an approaching train?',
    optionsAz: [
      'Yalnız avtomobilin klakson səs siqnalı fasiləsiz çalınmalıdır',
      'Qolun (gündüz parlaq əşya, gecə fənər və ya məşəl ilə) dairəvi fırladılması ilə',
      'Qolu yuxarı-aşağı yelləməklə',
      'İki əli yuxarı qaldırıb tərpənmədən durmaqla',
    ],
    optionsEn: [
      'Only sounding the continuous vehicle horn',
      'By moving the arm in a circular motion (holding bright object by day, lantern/torch by night)',
      'By waving the arm up and down',
      'By standing still with both hands raised',
    ],
    correctAnswer: 1,
    explanationAz: 'Qanunun 44-cü maddəsinə görə, dayanma siqnalı qolun dairəvi hərəkət etdirilməsidir (gündüz parlaq/qırmızı parça, gecə fənər və ya məşəl ilə).',
    explanationEn: 'Under Article 44, the universal emergency rail stop signal is a circular motion of the arm (with a bright cloth by day or a light by night).',
  },
  {
    id: 5,
    questionAz: 'Sürəti hansı həddən az olan xüsusi texnikanın (traktor, kombayn) keçiddən keçməsinə yalnız dəmir yolu distansiyası rəisinin icazəsi ilə yol verilir?',
    questionEn: 'For special machinery traveling below what speed limit is prior permission from the railway stationmaster required to cross?',
    optionsAz: [
      'Sürəti 5 km/saatdan az olan',
      'Sürəti 8 km/saatdan az olan',
      'Sürəti 15 km/saatdan az olan',
      'Sürəti 20 km/saatdan az olan',
    ],
    optionsEn: [
      'Speed below 5 km/h',
      'Speed below 8 km/h',
      'Speed below 15 km/h',
      'Speed below 20 km/h',
    ],
    correctAnswer: 1,
    explanationAz: 'Yol hərəkəti haqqında Qanun Maddə 44-ə görə, sürəti 8 km/saatdan az olan texnikanın keçidindən keçməsi üçün dəmir yolu distansiyası rəisinin rəsmi icazəsi mütləqdir.',
    explanationEn: 'Article 44 specifies that machinery with speeds below 8 km/h requires official authorization from the railway division superintendent.',
  },
  {
    id: 6,
    questionAz: 'Dəmir yolu keçidlərinə neçə metr qalmış digər nəqliyyat vasitələrini ötmək qanunla qadağandır?',
    questionEn: 'At what distance prior to a railway grade crossing is overtaking other vehicles strictly prohibited?',
    optionsAz: [
      'Keçidə 50 metrdən az məsafədə',
      'Keçidə 100 metrdən az məsafədə',
      'Keçidə 150 metrdən az məsafədə',
      'Yalnız keçidin bilavasitə üzərində',
    ],
    optionsEn: [
      'Less than 50 meters before crossing',
      'Less than 100 meters before crossing',
      'Less than 150 meters before crossing',
      'Only directly on the crossing',
    ],
    correctAnswer: 1,
    explanationAz: 'Yol hərəkəti haqqında Qanun Maddə 52-yə əsasən, dəmir yolu keçidində və ona 100 metrdən az qalmış məsafədə ötmə qəti qadağandır.',
    explanationEn: 'Under Article 52, overtaking is strictly forbidden on railway crossings and within 100 meters prior to them.',
  },
  {
    id: 7,
    questionAz: 'Avtomatlaşdırılmış keçiddə işıqforun hansı siqnalı nəqliyyat vasitələrinin keçiddən təhlükəsiz keçməsinə icazə verir?',
    questionEn: 'Which signal lamp on an automated grade crossing permits vehicles to cross safely?',
    optionsAz: [
      'Yanıb-sönən iki qırmızı işıq',
      'Yanıb-sönən tək sarı işıq',
      'Tək yanıb-sönən ay-ağ (ağ) işıq siqnalı',
      'Sabit yanan yaşıl ox siqnalı',
    ],
    optionsEn: [
      'Two alternating red flashing lights',
      'Single flashing yellow light',
      'Single flashing lunar-white light',
      'Steady green directional arrow',
    ],
    correctAnswer: 2,
    explanationAz: 'Yanıb-sönən tək ay-ağ (lunar-white) işıq siqnalı dəmiryolu siqnalizasiya sisteminin saz olduğunu və keçiddən keçməyə icazə verildiyini bildirir.',
    explanationEn: 'A single flashing lunar-white signal indicates the automatic signaling system is operating properly and crossing is permitted.',
  },
  {
    id: 8,
    questionAz: 'Qabarit hündürlüyü neçə metrdən artıq olan nəqliyyat vasitələri 25 kV-luq dəmiryolu kontakt şəbəkəsi altından keçmək üçün xüsusi ADY razılığı almalıdır?',
    questionEn: 'Vehicles exceeding what height limit require special ADY catenary clearance to pass under 25 kV overhead contact wires?',
    optionsAz: [
      '3.8 metrdən çox',
      '4.0 metrdən çox',
      '4.5 metrdən çox',
      '5.0 metrdən çox',
    ],
    optionsEn: [
      'Exceeding 3.8 meters',
      'Exceeding 4.0 meters',
      'Exceeding 4.5 meters',
      'Exceeding 5.0 meters',
    ],
    correctAnswer: 2,
    explanationAz: 'Qabarit hündürlüyü 4.5 metrdən artıq olan yüklü və ya yüksüz avtomobillərin elektrik naqilləri altından keçidi xüsusi razılıq və təhlükəsizlik tədbirləri ilə həyata keçirilir.',
    explanationEn: 'Vehicles exceeding 4.5 meters in height require special clearance due to high-voltage (25 kV) electric catenary proximity.',
  },
  {
    id: 9,
    questionAz: 'Dəmir yolu keçidində qırmızı işıq yanıb-söndükdə, lakin şlaqbaum hələ tam enməmiş olduqda sürücü nə etməlidir?',
    questionEn: 'What must a driver do if the red signal is flashing but the barrier arm has not fully lowered yet?',
    optionsAz: [
      'Şlaqbaum enənə qədər cəld sürətlənib keçməlidir',
      'Dərhal stop-xəttində və ya şlaqbauma 5 metr qalmış dayanmalıdır',
      'Səs siqnalı verərək sola manevr etməlidir',
      'Keçid növbətçisindən şifahi icazə alıb davam etməlidir',
    ],
    optionsEn: [
      'Accelerate rapidly to cross before the barrier descends',
      'Stop immediately at the stop-line or 5 meters before the barrier',
      'Sound horn and maneuver into the oncoming lane',
      'Ask verbal permission from crossing keeper and proceed',
    ],
    correctAnswer: 1,
    explanationAz: 'Yanıb-sönən qırmızı işıq şlaqbaumun vəziyyətindən asılı olmayaraq hərəkəti qadağan edir; dərhal dayanmaq məcburidir.',
    explanationEn: 'The flashing red light forbids movement regardless of barrier arm position; the driver must stop immediately.',
  },
  {
    id: 10,
    questionAz: 'Dəmiryolu keçidində avtomobilin mühərriki qəfil söndükdə ən birinci hansı təxirəsalınmaz təhlükəsizlik tədbiri görülməlidir?',
    questionEn: 'If a vehicle engine stalls abruptly on a grade crossing, what is the very first emergency measure that must be taken?',
    optionsAz: [
      'Sərnişinləri dərhal maşından düşürüb təhlükəsiz zonaya təxliyə etmək',
      'Avtomobili təkbaşına starterlə çəkməyə cəhd etmək',
      'Avtomobilin kapotunu açıb akkumulyatoru yoxlamaq',
      'ADY baş idarəsinə yazılı ərizə göndərmək',
    ],
    optionsEn: [
      'Immediately evacuate all passengers from the vehicle to a safe zone',
      'Attempt to move the car alone using only the starter motor',
      'Open car hood and inspect the battery',
      'Send a written report to the ADY central directorate',
    ],
    correctAnswer: 0,
    explanationAz: 'Qanunun 44-cü maddəsinə əsasən, birinci və təxirəsalınmaz addım bütün sərnişinlərin dərhal təxliyə olunmasıdır.',
    explanationEn: 'According to Article 44, the foremost priority is the immediate evacuation of all passengers to safety away from tracks.',
  },
];

export interface LevelCrossingCertificate {
  certificateId: string;
  crossingId: CrossingId;
  crossingNameAz: string;
  vehiclePlate: string;
  vehicleType: VehicleClass;
  applicantName: string;
  companyName: string;
  issuedDate: string;
  validUntil: string;
  transitSlot: string;
  escortCallsign: string;
  catenaryClearanceStatus: string;
  sha256Hash: string;
  simaSignatureUid: string;
  status: 'approved' | 'in_transit' | 'escorted_complete' | 'rejected';
  calculatedFeeAzn: number;
}

export function generateLevelCrossingCertificate(params: {
  crossingId: CrossingId;
  vehiclePlate: string;
  vehicleType: VehicleClass;
  applicantName: string;
  companyName: string;
  transitSlot: string;
  calculatedFeeAzn: number;
}): LevelCrossingCertificate {
  const crossing = LEVEL_CROSSINGS_REGISTRY[params.crossingId] || LEVEL_CROSSINGS_REGISTRY.sabunchu_zabrat;
  const serial = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `LEVEL-CROSSING-AZ-2026-${serial}`;
  const now = new Date();
  const issuedDate = now.toISOString().split('T')[0];
  const expiry = new Date(now.getTime() + 48 * 3600 * 1000);
  const validUntil = expiry.toISOString().split('T')[0];

  // Pseudo-SHA256 checksum
  const rawPayload = `${certificateId}:${params.vehiclePlate}:${params.vehicleType}:${params.crossingId}:${issuedDate}:ADY-AAYDA-BDYP`;
  let hashVal = 0;
  for (let i = 0; i < rawPayload.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawPayload.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256Hash = `SHA256:${Math.abs(hashVal).toString(16).padStart(8, '0')}e9f8a3c2718290bcda4`;
  const simaSignatureUid = `SIMA-GOV-AZ-${Math.abs(hashVal).toString(36).toUpperCase()}-2026`;

  return {
    certificateId,
    crossingId: params.crossingId,
    crossingNameAz: crossing.nameAz,
    vehiclePlate: params.vehiclePlate.toUpperCase().trim(),
    vehicleType: params.vehicleType,
    applicantName: params.applicantName,
    companyName: params.companyName,
    issuedDate,
    validUntil,
    transitSlot: params.transitSlot,
    escortCallsign: 'ADY-PATROL-EKİPAJ #44',
    catenaryClearanceStatus: params.vehicleType === 'oversize' ? 'Təsdiqlənib (25kV Gərginlik Nəzarətində)' : 'Standart Hündürlük',
    sha256Hash,
    simaSignatureUid,
    status: 'approved',
    calculatedFeeAzn: params.calculatedFeeAzn,
  };
}
