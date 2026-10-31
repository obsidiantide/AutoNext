/**
 * Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Emergency Situations (FHN),
 * Azerbaijan State Water Reserves Agency (ADSEA / Azərsu) &
 * Main State Traffic Police Department (BDYP)
 * Highway Underpass Submersion, Stormwater Drainage SCADA,
 * Hydrostatic Water Level Telemetry & Flash Flood Early Warning Portal Engine
 * (AAYDA, FHN, ADSEA & BDYP Avtomobil Yolları və Yolötürücü Keçidlərdə Subasma,
 * Yağış-Drenaj Kollektoru SCADA Sistemi, Hidrostatik Su Səviyyəsi Telemetriyası və FLOOD-GUARD-AZ-2026 Portalı)
 *
 * Statutory Framework:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21: Yol qurğularının qorunması və drenaj təminatı)
 * - Law of the Republic of Azerbaijan "On Water Supply and Wastewater" ("Su təchizatı və tullantı suları haqqında" AR Qanunu)
 * - Law of the Republic of Azerbaijan "On Civil Defense & Emergency Situations" (Mülki müdafiə və fövqəladə hallar)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.1: Su basmış yolda qadağanedici nişan və baryeri keçmə - 40 AZN cərimə)
 * - State Standard AZS 410 / AZS 342 & Cabinet of Ministers Resolution on Stormwater Drainage Resilience in Urban Infrastructure
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

export type UnderpassId =
  | 'sabunchu_tunnel'
  | 'bagirov_bridge'
  | 'khatai_nobel'
  | 'babek_mahammadi'
  | 'dernegul_underpass'
  | 'lokbatan_m3';

export type FloodWarningLevel = 'normal' | 'caution' | 'high_risk' | 'critical_closure';
export type PumpScadaStatus = 'standby' | 'pumping_normal' | 'pumping_maximum' | 'pump_failure';
export type BarrierGateStatus = 'open_free_flow' | 'caution_flashing' | 'closing_countdown' | 'fully_barricaded';

export interface UnderpassAsset {
  id: UnderpassId;
  nameAz: string;
  nameEn: string;
  locationAz: string;
  locationEn: string;
  catchmentAreaHa: number;
  retentionBasinCapacityM3: number;
  collectorDiameterMm: number;
  totalPumpsCount: number;
  pumpCapacityM3h: number; // per pump
  pumpPowerKw: number;
  backupGeneratorsCount: number;
  ultrasonicSensorActive: boolean;
  defaultWaterLevelMm: number;
  criticalThresholdMm: number;
  closureThresholdMm: number;
  defaultRainIntensityMmH: number;
  fhnDispatchStationAz: string;
  emergencyHotline: string;
  latitude: number;
  longitude: number;
}

export const UNDERPASS_REGISTRY: Record<UnderpassId, UnderpassAsset> = {
  sabunchu_tunnel: {
    id: 'sabunchu_tunnel',
    nameAz: 'Sabunçu Yolötürücü Keçidi və Tuneli',
    nameEn: 'Sabunchu Highway Underpass & Interchange Tunnel',
    locationAz: 'Heydər Əliyev prospekti qovşağı (Km 12+400)',
    locationEn: 'Heydar Aliyev Avenue Junction (Km 12+400)',
    catchmentAreaHa: 48,
    retentionBasinCapacityM3: 6500,
    collectorDiameterMm: 1600,
    totalPumpsCount: 6,
    pumpCapacityM3h: 1200,
    pumpPowerKw: 110,
    backupGeneratorsCount: 2,
    ultrasonicSensorActive: true,
    defaultWaterLevelMm: 85,
    criticalThresholdMm: 300,
    closureThresholdMm: 400,
    defaultRainIntensityMmH: 18.5,
    fhnDispatchStationAz: 'FHN Sabunçu Rayon Yanğından Mühafizə Hissəsi №14',
    emergencyHotline: '+994 (12) 425-11-02 (FHN 112 / AAYDA 159)',
    latitude: 40.4284,
    longitude: 49.9321,
  },
  bagirov_bridge: {
    id: 'bagirov_bridge',
    nameAz: 'Bağırov Körpüsü Altı Yol Keçidi',
    nameEn: 'Bagirov Bridge Sub-Railway Underpass',
    locationAz: 'Təbriz küçəsi və Heydər Əliyev prospekti kəsişməsi',
    locationEn: 'Tabriz Street & Heydar Aliyev Ave Intersection',
    catchmentAreaHa: 32,
    retentionBasinCapacityM3: 4200,
    collectorDiameterMm: 1400,
    totalPumpsCount: 4,
    pumpCapacityM3h: 1000,
    pumpPowerKw: 90,
    backupGeneratorsCount: 2,
    ultrasonicSensorActive: true,
    defaultWaterLevelMm: 45,
    criticalThresholdMm: 280,
    closureThresholdMm: 380,
    defaultRainIntensityMmH: 12.0,
    fhnDispatchStationAz: 'FHN Nərimanov Rayon Yanğından Mühafizə Hissəsi №6',
    emergencyHotline: '+994 (12) 566-20-04 (ADSEA Kollektor Mərkəzi)',
    latitude: 40.4012,
    longitude: 49.8715,
  },
  khatai_nobel: {
    id: 'khatai_nobel',
    nameAz: 'Xətai - 8 Noyabr Sahil Yağış-Drenaj və Tunel Keçidi',
    nameEn: 'Khatai - 8 November Coastal Drainage Underpass',
    locationAz: '8 Noyabr prospekti - Ağ Şəhər qovşağı',
    locationEn: '8 November Avenue - White City Intersection',
    catchmentAreaHa: 40,
    retentionBasinCapacityM3: 5000,
    collectorDiameterMm: 1500,
    totalPumpsCount: 5,
    pumpCapacityM3h: 1100,
    pumpPowerKw: 100,
    backupGeneratorsCount: 2,
    ultrasonicSensorActive: true,
    defaultWaterLevelMm: 120,
    criticalThresholdMm: 300,
    closureThresholdMm: 420,
    defaultRainIntensityMmH: 22.0,
    fhnDispatchStationAz: 'FHN Xətai Rayon Yanğından Mühafizə Hissəsi №9',
    emergencyHotline: '+994 (12) 490-55-11',
    latitude: 40.3842,
    longitude: 49.8962,
  },
  babek_mahammadi: {
    id: 'babek_mahammadi',
    nameAz: 'Babək Prospekti - Məhəmmədi Yolötürücü Drenaj Qovşağı',
    nameEn: 'Babek Avenue - Mahammadi Road Interchange Underpass',
    locationAz: 'Babək prospekti Km 8+200',
    locationEn: 'Babek Avenue Km 8+200',
    catchmentAreaHa: 26,
    retentionBasinCapacityM3: 3500,
    collectorDiameterMm: 1200,
    totalPumpsCount: 4,
    pumpCapacityM3h: 900,
    pumpPowerKw: 75,
    backupGeneratorsCount: 1,
    ultrasonicSensorActive: true,
    defaultWaterLevelMm: 35,
    criticalThresholdMm: 250,
    closureThresholdMm: 350,
    defaultRainIntensityMmH: 9.5,
    fhnDispatchStationAz: 'FHN Nizami Rayon Yanğından Mühafizə Hissəsi №7',
    emergencyHotline: '+994 (12) 421-33-88',
    latitude: 40.3951,
    longitude: 49.9248,
  },
  dernegul_underpass: {
    id: 'dernegul_underpass',
    nameAz: 'Dərnəgül Dairəsi - Biləcəri Dəmiryolu Altı Keçid',
    nameEn: 'Dernegul Roundabout - Bilajari Railway Underpass',
    locationAz: 'Ziya Bünyadov prospekti və Biləcəri şosesi kəsişməsi',
    locationEn: 'Ziya Bunyadov Ave & Bilajari Highway Crossing',
    catchmentAreaHa: 55,
    retentionBasinCapacityM3: 7200,
    collectorDiameterMm: 1800,
    totalPumpsCount: 6,
    pumpCapacityM3h: 1350,
    pumpPowerKw: 132,
    backupGeneratorsCount: 2,
    ultrasonicSensorActive: true,
    defaultWaterLevelMm: 95,
    criticalThresholdMm: 320,
    closureThresholdMm: 450,
    defaultRainIntensityMmH: 25.0,
    fhnDispatchStationAz: 'FHN Binəqədi Rayon Yanğından Mühafizə Hissəsi №10',
    emergencyHotline: '+994 (12) 561-12-14',
    latitude: 40.4215,
    longitude: 49.8523,
  },
  lokbatan_m3: {
    id: 'lokbatan_m3',
    nameAz: 'Lökbatan Dairəsi - Bakı-Ələt M-3 Magistralı Altı Keçid',
    nameEn: 'Lokbatan Junction - Baku-Alat M-3 Highway Underpass',
    locationAz: 'Bakı-Ələt-Qazax-Gürcüstan magistralı (M-3 Km 14+100)',
    locationEn: 'Baku-Alat-Qazax M-3 Highway (Km 14+100)',
    catchmentAreaHa: 60,
    retentionBasinCapacityM3: 8000,
    collectorDiameterMm: 1800,
    totalPumpsCount: 6,
    pumpCapacityM3h: 1400,
    pumpPowerKw: 150,
    backupGeneratorsCount: 2,
    ultrasonicSensorActive: true,
    defaultWaterLevelMm: 70,
    criticalThresholdMm: 350,
    closureThresholdMm: 480,
    defaultRainIntensityMmH: 16.0,
    fhnDispatchStationAz: 'FHN Qaradağ Rayon Yanğından Mühafizə Hissəsi №12',
    emergencyHotline: '+994 (12) 445-67-11',
    latitude: 40.3275,
    longitude: 49.7412,
  },
};

export type VehicleClass =
  | 'sedan_compact'
  | 'crossover_suv'
  | 'heavy_4x4'
  | 'electric_vehicle'
  | 'bus_truck';

export interface VehicleFloodProfile {
  id: VehicleClass;
  nameAz: string;
  nameEn: string;
  groundClearanceMm: number;
  airIntakeHeightMm: number;
  isElectric: boolean;
  waterproofRating: string; // e.g., 'IP54 Standard', 'IP67 Battery Pack', 'IP68 Military'
  hydroLockCostAzn: number; // estimated engine rebuild / battery replacement cost
}

export const VEHICLE_FLOOD_PROFILES: Record<VehicleClass, VehicleFloodProfile> = {
  sedan_compact: {
    id: 'sedan_compact',
    nameAz: 'Kompakt Sedan / Hetçbek (Kia Rio, Hyundai Accent, Toyota Corolla)',
    nameEn: 'Compact Sedan / Hatchback',
    groundClearanceMm: 150,
    airIntakeHeightMm: 450,
    isElectric: false,
    waterproofRating: 'IP54 Standart mühərrik təchizatı',
    hydroLockCostAzn: 3800,
  },
  crossover_suv: {
    id: 'crossover_suv',
    nameAz: 'Krossover / Şəhər SUV (Hyundai Tucson, Kia Sportage, Toyota RAV4)',
    nameEn: 'Crossover / Compact SUV',
    groundClearanceMm: 195,
    airIntakeHeightMm: 580,
    isElectric: false,
    waterproofRating: 'IP55 Qoruyucu korpus',
    hydroLockCostAzn: 5200,
  },
  heavy_4x4: {
    id: 'heavy_4x4',
    nameAz: 'Ağır Yolsuzluq 4x4 (Toyota Land Cruiser, Nissan Patrol, Şnorkelli)',
    nameEn: 'Heavy 4x4 / Offroad with High Snorkel',
    groundClearanceMm: 260,
    airIntakeHeightMm: 850,
    isElectric: false,
    waterproofRating: 'IP66 + Dərin Brod Təchizatı',
    hydroLockCostAzn: 8500,
  },
  electric_vehicle: {
    id: 'electric_vehicle',
    nameAz: 'Elektromobil / EV (BYD Seal, Tesla Model Y, Zeekr 001)',
    nameEn: 'Electric Vehicle (Sealed High-Voltage Battery Pack)',
    groundClearanceMm: 160,
    airIntakeHeightMm: 9999, // No air intake combustion hydro-lock, but electrical short hazard
    isElectric: true,
    waterproofRating: 'IP67 / IP68 Hermetik Batareya Bloku',
    hydroLockCostAzn: 14500,
  },
  bus_truck: {
    id: 'bus_truck',
    nameAz: 'Marşrut Avtobusu / Kommersiya Yük Maşını (BakuBus BMC, MAN TGS)',
    nameEn: 'Transit Bus / Heavy Commercial Vehicle',
    groundClearanceMm: 340,
    airIntakeHeightMm: 1150,
    isElectric: false,
    waterproofRating: 'IP65 Ağır Kommersiya İzolasiyası',
    hydroLockCostAzn: 12000,
  },
};

export interface HydroLockRiskAssessment {
  riskLevel: 'safe' | 'caution' | 'critical' | 'severe_danger';
  riskScorePercent: number;
  waterDepthMm: number;
  vehicleClearanceMm: number;
  airIntakeMarginMm: number;
  clearanceExceeded: boolean;
  intakeSubmerged: boolean;
  isElectricShortCircuitRisk: boolean;
  estimatedDamageAzn: number;
  recommendationAz: string;
  recommendationEn: string;
}

export function evaluateHydroLockRisk(
  waterDepthMm: number,
  vehicleClass: VehicleClass
): HydroLockRiskAssessment {
  const profile = VEHICLE_FLOOD_PROFILES[vehicleClass];
  const clearanceExceeded = waterDepthMm > profile.groundClearanceMm;
  const intakeSubmerged = !profile.isElectric && waterDepthMm >= profile.airIntakeHeightMm;
  const airIntakeMarginMm = profile.airIntakeHeightMm - waterDepthMm;

  let riskLevel: 'safe' | 'caution' | 'critical' | 'severe_danger' = 'safe';
  let riskScorePercent = 0;
  let estimatedDamageAzn = 0;
  let recommendationAz = '';
  let recommendationEn = '';

  if (profile.isElectric) {
    if (waterDepthMm < 150) {
      riskLevel = 'safe';
      riskScorePercent = 5;
      estimatedDamageAzn = 0;
      recommendationAz = 'Su səviyyəsi təhlükəsizdir. Aşağı sürətlə (maks. 20 km/s) hərəkətə icazə verilir.';
      recommendationEn = 'Water level is safe. Controlled low-speed transit (<20 km/h) permitted.';
    } else if (waterDepthMm < 300) {
      riskLevel = 'caution';
      riskScorePercent = 35;
      estimatedDamageAzn = 800;
      recommendationAz = 'Batareya alt qoruyucusu suya batır. Yalnız zəruri hallarda ehtiyatla hərəkət edin.';
      recommendationEn = 'Battery underbody submerged. Proceed cautiously only if urgent.';
    } else if (waterDepthMm < 450) {
      riskLevel = 'critical';
      riskScorePercent = 75;
      estimatedDamageAzn = 6500;
      recommendationAz = 'Yüksək gərginlik naqillərində izolasiya sızması və elektron blok qapanması riski yüksəkdir!';
      recommendationEn = 'High risk of high-voltage harness insulation breach and electronic controller short circuit!';
    } else {
      riskLevel = 'severe_danger';
      riskScorePercent = 98;
      estimatedDamageAzn = profile.hydroLockCostAzn;
      recommendationAz = 'FÖVQƏLADƏ RİSK: Keçid qadağandır! Batareya paketinin tam zədələnməsi və hermetiklik pozulması təhlükəsi!';
      recommendationEn = 'EXTREME RISK: Passage prohibited! Severe risk of battery pack failure and water ingress!';
    }
  } else {
    if (waterDepthMm < profile.groundClearanceMm) {
      riskLevel = 'safe';
      riskScorePercent = Math.min(25, Math.round((waterDepthMm / profile.groundClearanceMm) * 25));
      estimatedDamageAzn = 0;
      recommendationAz = 'Klirens daxilindədir. Yol səthində dalğa yaratmadan sabit sürətlə keçin.';
      recommendationEn = 'Within ground clearance limit. Maintain steady low speed without creating bow waves.';
    } else if (waterDepthMm < profile.airIntakeHeightMm - 100) {
      riskLevel = 'caution';
      riskScorePercent = 45;
      estimatedDamageAzn = 450;
      recommendationAz = 'Təkər göbəyi və əyləc diskləri su altındadır. Əyləc məsafəsi uzanır, salonun alt hissəsi islanma riski daşıyır.';
      recommendationEn = 'Wheel hubs and brake rotors submerged. Wet brake fade hazard; underbody wetting risk.';
    } else if (waterDepthMm < profile.airIntakeHeightMm) {
      riskLevel = 'critical';
      riskScorePercent = 80;
      estimatedDamageAzn = Math.round(profile.hydroLockCostAzn * 0.6);
      recommendationAz = 'DİQQƏT: Su səviyyəsi hava girişinə (hava filtri qutusuna) çatır! Qarşıdan gələn maşının dalğası mühərriki hidrozərbə edə bilər!';
      recommendationEn = 'WARNING: Water approaching air intake box! Opposing vehicle waves can trigger fatal hydro-lock!';
    } else {
      riskLevel = 'severe_danger';
      riskScorePercent = 100;
      estimatedDamageAzn = profile.hydroLockCostAzn;
      recommendationAz = 'FÖVQƏLADƏ TƏHLÜKƏ: Hava filtri suyun altındadır! Mühərrikin hidrozərbə alması və porşen qollarının əyilməsi labüddür!';
      recommendationEn = 'EXTREME DANGER: Air intake fully inundated! Catastrophic hydro-lock and bent connecting rods unavoidable!';
    }
  }

  return {
    riskLevel,
    riskScorePercent,
    waterDepthMm,
    vehicleClearanceMm: profile.groundClearanceMm,
    airIntakeMarginMm: Math.max(0, airIntakeMarginMm),
    clearanceExceeded,
    intakeSubmerged,
    isElectricShortCircuitRisk: profile.isElectric && waterDepthMm >= 300,
    estimatedDamageAzn,
    recommendationAz,
    recommendationEn,
  };
}

export function calculateDrainageMetrics(
  underpass: UnderpassAsset,
  currentWaterLevelMm: number,
  activePumps: number,
  rainIntensityMmH: number
): {
  accumulatedWaterVolumeM3: number;
  rainInflowRateM3h: number;
  totalPumpingDischargeM3h: number;
  netDrainageRateM3h: number;
  timeToCompleteDrainageMinutes: number;
  warningLevel: FloodWarningLevel;
  gateStatus: BarrierGateStatus;
  scadaStatus: PumpScadaStatus;
} {
  // Approximate submerged road water surface area derived from retention basin geometry
  const roadBasinAreaM2 = (underpass.retentionBasinCapacityM3 / 1.5); // assumed avg max pool depth 1.5m
  const accumulatedWaterVolumeM3 = Math.round((currentWaterLevelMm / 1000) * roadBasinAreaM2);

  // Inflow = Catchment (ha * 10,000 m2) * Rain (mm/h / 1000) * Runoff coefficient (0.85 urban asphalt)
  const runoffCoefficient = 0.85;
  const rainInflowRateM3h = Math.round(
    underpass.catchmentAreaHa * 10000 * (rainIntensityMmH / 1000) * runoffCoefficient
  );

  const totalPumpingDischargeM3h = activePumps * underpass.pumpCapacityM3h;
  const netDrainageRateM3h = totalPumpingDischargeM3h - rainInflowRateM3h;

  let timeToCompleteDrainageMinutes = 0;
  if (accumulatedWaterVolumeM3 <= 10) {
    timeToCompleteDrainageMinutes = 0;
  } else if (netDrainageRateM3h > 0) {
    timeToCompleteDrainageMinutes = Math.round((accumulatedWaterVolumeM3 / netDrainageRateM3h) * 60);
  } else {
    // Inflow exceeds pumping rate - water level is rising!
    timeToCompleteDrainageMinutes = 999;
  }

  let warningLevel: FloodWarningLevel = 'normal';
  let gateStatus: BarrierGateStatus = 'open_free_flow';
  let scadaStatus: PumpScadaStatus = 'standby';

  if (currentWaterLevelMm >= underpass.closureThresholdMm) {
    warningLevel = 'critical_closure';
    gateStatus = 'fully_barricaded';
  } else if (currentWaterLevelMm >= underpass.criticalThresholdMm) {
    warningLevel = 'high_risk';
    gateStatus = 'closing_countdown';
  } else if (currentWaterLevelMm >= 150) {
    warningLevel = 'caution';
    gateStatus = 'caution_flashing';
  } else {
    warningLevel = 'normal';
    gateStatus = 'open_free_flow';
  }

  if (activePumps === 0 && accumulatedWaterVolumeM3 > 20) {
    scadaStatus = 'pump_failure';
  } else if (activePumps === underpass.totalPumpsCount) {
    scadaStatus = 'pumping_maximum';
  } else if (activePumps > 0) {
    scadaStatus = 'pumping_normal';
  } else {
    scadaStatus = 'standby';
  }

  return {
    accumulatedWaterVolumeM3,
    rainInflowRateM3h,
    totalPumpingDischargeM3h,
    netDrainageRateM3h,
    timeToCompleteDrainageMinutes,
    warningLevel,
    gateStatus,
    scadaStatus,
  };
}

export function calculateEnergyConsumption(
  underpass: UnderpassAsset,
  activePumps: number,
  durationHours: number,
  currency: Currency
): {
  totalKwh: number;
  costAzn: number;
  formattedCost: string;
} {
  const electricityTariffAznPerKwh = 0.11; // Non-residential commercial / municipal rate in Azerbaijan
  const totalKw = activePumps * underpass.pumpPowerKw;
  const totalKwh = Math.round(totalKw * durationHours);
  const costAzn = Number((totalKwh * electricityTariffAznPerKwh).toFixed(2));
  return {
    totalKwh,
    costAzn,
    formattedCost: formatCurrency(costAzn, currency),
  };
}

export function calculateStatutoryFloodFines(
  violationType: 'barrier_breach' | 'stalled_blocking' | 'speeding_in_flood',
  promptDiscount: boolean,
  currency: Currency
): {
  articleCitation: string;
  baseFineAzn: number;
  demeritPoints: number;
  finalFineAzn: number;
  formattedFinalFine: string;
} {
  let articleCitation = '';
  let baseFineAzn = 40;
  let demeritPoints = 0;

  switch (violationType) {
    case 'barrier_breach':
      articleCitation = 'İXM Maddə 327.1 (Su basmış keçiddə qadağanedici baryer və svetofor siqnalına məhəl qoymamaq)';
      baseFineAzn = 60;
      demeritPoints = 2;
      break;
    case 'stalled_blocking':
      articleCitation = 'İXM Maddə 346.1 (Yolötürücü keçiddə su basma zamanı hərəkət hissəsini tıxamaq və ya nasaz nəqliyyatı tərk etmək)';
      baseFineAzn = 50;
      demeritPoints = 0;
      break;
    case 'speeding_in_flood':
      articleCitation = 'İXM Maddə 328.1 (Su qatında təhlükəli sürət və su sıçratmaqla piyada/digər nəqliyyatı riskə atmaq)';
      baseFineAzn = 40;
      demeritPoints = 0;
      break;
  }

  const finalFineAzn = promptDiscount ? baseFineAzn * 0.5 : baseFineAzn;
  return {
    articleCitation,
    baseFineAzn,
    demeritPoints,
    finalFineAzn,
    formattedFinalFine: formatCurrency(finalFineAzn, currency),
  };
}

export interface DrainageSafetyChecklist {
  id: string;
  titleAz: string;
  titleEn: string;
  standardCitation: string;
  criticality: 'critical' | 'high' | 'standard';
  passed: boolean;
}

export const INITIAL_DRAINAGE_CHECKLIST: DrainageSafetyChecklist[] = [
  {
    id: 'pump_float_switch',
    titleAz: 'Drenaj quyusu avtomatik hidrostatik float-sviç və səviyyə sensoru testi',
    titleEn: 'Automatic hydrostatic float-switch and level sensor activation test',
    standardCitation: 'AZS 410 Maddə 8.4',
    criticality: 'critical',
    passed: true,
  },
  {
    id: 'silt_sediment_clearance',
    titleAz: 'Çöküntü qəbuledici çənlərdə lillənmə və qum tutucu səviyyəsi (<15%)',
    titleEn: 'Retention basin silt sediment and sand-trap accumulation check (<15%)',
    standardCitation: 'ADSEA Yağış Suları Reqlamenti 12-B',
    criticality: 'high',
    passed: true,
  },
  {
    id: 'collector_pipe_flaps',
    titleAz: 'Yağış kollektoru əks-klapanlarının (non-return flaps) hermetikliyi',
    titleEn: 'Stormwater collector non-return flap valves backflow prevention seal',
    standardCitation: 'AAYDA Drenaj Normaları Bölmə 6',
    criticality: 'critical',
    passed: true,
  },
  {
    id: 'backup_generator_sync',
    titleAz: 'Ehtiyat dizel generatorunun avtomatik işə düşmə vaxtı (≤ 15 saniyə ATS)',
    titleEn: 'Backup diesel generator auto-transfer switch response time (≤ 15 sec ATS)',
    standardCitation: 'FHN Yanğın və Qəza Təhlükəsizliyi Qaydaları',
    criticality: 'critical',
    passed: true,
  },
  {
    id: 'ultrasonic_gauge_calibration',
    titleAz: 'Optik reka şkalası və ultrasəs su səviyyəsi ölçən sensorun kalibrasiyası',
    titleEn: 'Optical staff gauge and ultrasonic water depth sensor precision audit',
    standardCitation: 'Dövlət Metrologiya Xidməti Reystri',
    criticality: 'high',
    passed: true,
  },
  {
    id: 'scada_telemetry_rtu',
    titleAz: 'AAYDA və FHN Mərkəzi Dispetçer SCADA / GSM RTU rabitə xətti testi',
    titleEn: 'AAYDA & FHN Central Dispatch SCADA / GSM RTU telemetry link verification',
    standardCitation: 'ISO 27001 / SCADA Protokol IEC 60870',
    criticality: 'critical',
    passed: true,
  },
  {
    id: 'hydraulic_barrier_arms',
    titleAz: 'Avtomatik hidravlik yol bağlayıcı şlaqbaum və LED qırmızı qadağan fənərləri',
    titleEn: 'Automated hydraulic road closure barrier arms & pulsating red LED lights',
    standardCitation: 'YHQ Maddə 9 və AZS 342',
    criticality: 'critical',
    passed: true,
  },
  {
    id: 'vms_matrix_alerts',
    titleAz: 'Tunel öncəsi dinamik elektron VMS tablolarında xəbərdarlıq mətni yayımı',
    titleEn: 'Variable Message Signs (VMS) early flood diversion display broadcast',
    standardCitation: 'BDYP Ağıllı Yol İnfrastruktur Reqlamenti',
    criticality: 'high',
    passed: true,
  },
  {
    id: 'fhn_motopump_docking',
    titleAz: 'FHN mobil güclü motopompa və assenizator maşınları üçün quraşdırma fitinqi',
    titleEn: 'FHN high-capacity mobile suction pump quick-connect camlock fittings',
    standardCitation: 'FHN Xilasetmə Xidməti Təlimatı',
    criticality: 'high',
    passed: true,
  },
  {
    id: 'emergency_escape_steps',
    titleAz: 'Tunel divarında qəza-xilasetmə pilləkənləri və 112 FHN birbaşa rabitə düyməsi',
    titleEn: 'Emergency pedestrian escape wall-ladders and 112 direct call intercom',
    standardCitation: 'AR Mülki Müdafiə Qanunu Maddə 18',
    criticality: 'critical',
    passed: true,
  },
];

export interface FloodExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationAz: string;
  explanationEn: string;
}

export const FLOOD_EXAM_QUESTIONS: FloodExamQuestion[] = [
  {
    id: 1,
    questionAz: 'Yolötürücü körpüaltı tuneldə su səviyyəsi hansı həddi keçdikdə standart sedan avtomobili üçün hidrozərbə (hydro-lock) qaçılmaz olur?',
    questionEn: 'At what water depth threshold does engine hydro-lock become imminent for a standard sedan in an underpass?',
    optionsAz: [
      '50 mm (5 sm)',
      '100 mm (10 sm)',
      'Su səviyyəsi mühərrikin hava giriş filtri qutusuna (təqribən 400-450 mm) çatdıqda',
      'Təkərin alt protektoruna çatdıqda',
    ],
    optionsEn: [
      '50 mm (5 cm)',
      '100 mm (10 cm)',
      'When water level reaches the air intake filter duct (approx. 400-450 mm)',
      'When touching the bottom tire tread',
    ],
    correctIndex: 2,
    explanationAz: 'Mühərrik hava əvəzinə silindrlərə su sorduqda sıxılmayan maye porşeni dayandırır və dirsəkli valı/əyilən qolları dərhal sındırır.',
    explanationEn: 'When the engine ingests water instead of air into the cylinders, non-compressible water stops the piston, immediately bending rods.',
  },
  {
    id: 2,
    questionAz: 'Su basmış yoldan keçərkən avtomobili hansı sürət və ötürücü rejimində idarə etmək tələb olunur?',
    questionEn: 'In what speed and gear configuration should a driver traverse shallow standing water?',
    optionsAz: [
      'Maksimum sürətlə inersiya hesabına keçmək',
      '1-ci aşağı ötürücüdə, sabit yüksək mühərrik dövriyyəsində və dalğa yaratmadan aramla',
      'Neytral rejimdə diyirlənməklə',
      'Hər 2 metrdən bir dayanıb mühərriki söndürməklə',
    ],
    optionsEn: [
      'Accelerate at full throttle to cross by momentum',
      'In 1st low gear, at steady elevated RPM, slowly without creating a bow wave',
      'Coasting in neutral',
      'Stopping every 2 meters and cutting the ignition',
    ],
    correctIndex: 1,
    explanationAz: 'Sabit qaz qazburaxma borusundan (qluşitel) suyun əks-təzyiqlə mühərrikə girməsinin qarşısını alır və dalğa yaranmır.',
    explanationEn: 'Steady gas pedal maintains positive exhaust backpressure preventing water ingestion into the tailpipe and stops bow waves.',
  },
  {
    id: 3,
    questionAz: 'Elektromobilin (EV) su basmış sahədən keçməsi zamanı ən böyük risk amili nədir?',
    questionEn: 'What is the primary risk factor when an Electric Vehicle traverses flooded pavement?',
    optionsAz: [
      'Karbüratorun islanması',
      'Porşen qolunun əyilməsi',
      'Hermetik IP67 batareya korpusu zədələndikdə 400V/800V yüksək gərginlik sızması və qoruyucu piropatronun partlaması',
      'Benzin nasosunun dayanması',
    ],
    optionsEn: [
      'Carburetor wetting',
      'Bent connecting rod',
      'High-voltage (400V/800V) isolation failure and pyro-fuse severance if the IP67 enclosure seal is compromised',
      'Fuel pump cutoff',
    ],
    correctIndex: 2,
    explanationAz: 'Elektromobillərdə daxili yanma olmasa da, yüksək gərginlikli batareya korpusu su altında təzyiqə tab gətirmədikdə qəza söndürmə sistemi işə düşür.',
    explanationEn: 'While EVs have no combustion intake, submerged high-voltage enclosures risk insulation loss triggering emergency pyro-fuse disconnects.',
  },
  {
    id: 4,
    questionAz: 'AAYDA və BDYP tərəfindən subasma səbəbilə tunel qarşısında enən qırmızı şlaqbaum və işıqforu pozaraq daxil olmaq hansı məsuliyyəti yaradır?',
    questionEn: 'What statutory penalty is incurred by violating a red barrier gate and entering a flooded underpass?',
    optionsAz: [
      'Cərimə tətbiq edilmir, sürücünün öz seçimidir',
      'İXM Maddə 327.1 üzrə 60 AZN və 2 cərimə balı',
      'Yalnız şifahi xəbərdarlıq',
      'Sürücülük hüququndan 5 il məhrumetmə',
    ],
    optionsEn: [
      'No penalty; it is the driver personal discretion',
      '60 AZN fine and 2 penalty points under Article 327.1 of the Administrative Code',
      'Verbal warning only',
      '5-year driver license suspension',
    ],
    correctIndex: 1,
    explanationAz: 'Qadağanedici nişan və baryerləri qəsdən pozmaq qəza vəziyyəti yaratdığı üçün İXM 327.1 ilə rəsmiləşdirilir.',
    explanationEn: 'Willfully breaching traffic barricades creates a severe emergency risk sanctioned under CAO Article 327.1.',
  },
  {
    id: 5,
    questionAz: 'Su basmış tuneldə avtomobil sönərsə və su səviyyəsi sürətlə qalxarsa nə edilməlidir?',
    questionEn: 'If a vehicle stalls in a flooded underpass and water is rising rapidly, what immediate action is required?',
    optionsAz: [
      'Mühərriki təkrar-təkrar işə salmağa cəhd etmək',
      'Dərhal şüşəni və ya qapını açıb maşını tərk etmək və təhlükəsiz quru yüksəkliyə/pilləkənə çıxmaq',
      'Salon tam su ilə dolana qədər sükan arxasında gözləmək',
      'Kapotu açıb mühərriki yoxlamaq',
    ],
    optionsEn: [
      'Repeatedly crank the ignition starter motor',
      'Immediately unbuckle, open windows/doors, evacuate to elevated safety walkways or wall ladders',
      'Remain seated inside until the cabin completely fills with water',
      'Pop the hood open and inspect the engine block',
    ],
    correctIndex: 1,
    explanationAz: 'Su təzyiqi artdıqca qapını açmaq qeyri-mümkün olur; dərhal təxliyə həyat xilas edir. Mühərriki yenidən işə salmaq qəti qadağandır.',
    explanationEn: 'Rising external hydrostatic pressure seals doors shut; immediate evacuation is lifesaving. Cranking a flooded engine causes severe destruction.',
  },
  {
    id: 6,
    questionAz: 'Subasmadan uğurla çıxdıqdan dərhal sonra sürücü əyləc sistemi ilə bağlı nə etməlidir?',
    questionEn: 'What critical procedure must a driver execute regarding the braking system immediately after exiting flood water?',
    optionsAz: [
      'Maksimum sürətlə şosedə hərəkət etmək',
      'Əl əyləcini çəkib 1 saat gözləmək',
      'Aşağı sürətdə fasilələrlə əyləc pedalını basaraq əyləc bəndlərini sürtünmə ilə qurutmaq',
      'Əyləc mayesini dərhal boşaltmaq',
    ],
    optionsEn: [
      'Accelerate immediately to maximum highway speed',
      'Engage the parking brake and wait for one hour',
      'Pump the brake pedal intermittently at low speed to dry the wet friction pads',
      'Immediately drain brake fluid on the road',
    ],
    correctIndex: 2,
    explanationAz: 'İslanmış əyləc bəndləri və diskləri sürtünmə qabiliyyətini itirir; bir neçə yüngül sıxma ilə qızdırılaraq qurudulmalıdır.',
    explanationEn: 'Wet brake rotors and pads suffer extreme friction fade; light intermittent braking dries them via heat generation.',
  },
  {
    id: 7,
    questionAz: 'Sabunçu tuneli və digər böyük yolötürücülərdə quraşdırılmış SCADA drenaj nasoslarının elektrik enerjisi kəsildikdə hansı sistem avtomatik işə düşür?',
    questionEn: 'Which system automatically activates when primary utility grid power is lost at Sabunchu tunnel drainage pumps?',
    optionsAz: [
      'Külək turbini',
      'Avtomatik Transfer Keçiricili (ATS) ehtiyat dizel generatorları',
      'Mexaniki əl nasosu',
      'Güneş paneli batareyası',
    ],
    optionsEn: [
      'Wind turbine generator',
      'Automatic Transfer Switch (ATS) backup heavy diesel generator units',
      'Manual hand pump',
      'Solar roof batteries',
    ],
    correctIndex: 1,
    explanationAz: 'Şəbəkə gərginliyi itdikdə 15 saniyə ərzində böyük sənaye dizel generatorları işə düşərək nasosları tam gücündə saxlayır.',
    explanationEn: 'Within 15 seconds of power loss, industrial diesel gensets fire up via ATS to keep high-capacity submersible pumps operating.',
  },
  {
    id: 8,
    questionAz: 'Avtomobilin hava girişinə quraşdırılan "Şnorkel" (Snorkel) qurğusunun əsas təyinatı nədir?',
    questionEn: 'What is the principal purpose of an automotive snorkel intake device on 4x4 vehicles?',
    optionsAz: [
      'Musiqi səsinin keyfiyyətini artırmaq',
      'Mühərrikin hava giriş nöqtəsini dam səviyyəsinə qaldıraraq dərin sulardan təhlükəsiz keçidi təmin etmək',
      'Yanacaq çənini doldurmaq',
      'Salonun kondisionerini soyutmaq',
    ],
    optionsEn: [
      'Improve stereo acoustics',
      'Elevate the engine air intake point to roof height for deep water wading safety',
      'Refill the fuel tank',
      'Cool cabin climate control',
    ],
    correctIndex: 1,
    explanationAz: 'Şnorkel hava girişini təkər tağından dam səviyyəsinə (1.8 - 2.0 metrə) qaldıraraq mühərrikə suyun sorulmasını əngəlləyir.',
    explanationEn: 'A snorkel relocates the air intake from the wheel arch to the vehicle roofline (1.8 - 2.0m), preventing water ingress.',
  },
  {
    id: 9,
    questionAz: 'Körpüaltı keçidlərdə su səviyyəsinin avtomatik ölçülməsində hansı qabaqcıl sensor texnologiyalarından istifadə olunur?',
    questionEn: 'Which advanced sensor technologies are utilized for automated water level monitoring in modern underpasses?',
    optionsAz: [
      'Yalnız mexaniki taxta çubuqlar',
      'Ultrasəs (ultrasonic) exolot sensorları və hidrostatik təzyiq ötürücüləri',
      'Avtomobilin spidometri',
      'Civəli tibbi termometr',
    ],
    optionsEn: [
      'Manual wooden dipsticks only',
      'Ultrasonic depth transceivers and submersible hydrostatic pressure transducers',
      'Vehicle dashboard speedometer',
      'Mercury clinical thermometer',
    ],
    correctIndex: 1,
    explanationAz: 'Ultrasəs dalğaları ilə kontaktsız və quyu daxilində hidrostatik təzyiq qeydiyyatı ilə millimetr dəqiqliyində canlı telemetriya alınır.',
    explanationEn: 'Non-contact ultrasonic acoustic reflection and submersible hydrostatic pressure sensors yield millimeter-accurate telemetry.',
  },
  {
    id: 10,
    questionAz: 'Subasma zamanı Fövqəladə Hallar Nazirliyinin (FHN) operativ xilasetmə və nasos xidmətinə müraciət üçün hansı qısa nömrə yığılmalıdır?',
    questionEn: 'Which nationwide emergency hotline should be dialed to dispatch MES (FHN) flood rescue and de-watering units?',
    optionsAz: [
      '102',
      '103',
      '112',
      '155',
    ],
    optionsEn: [
      '102',
      '103',
      '112',
      '155',
    ],
    correctIndex: 2,
    explanationAz: 'Fövqəladə Hallar Nazirliyinin vahid 112 qaynar xətti daşqın, subasma və qəza təxliyəsi üçün 24/7 rejimdə cavabdehdir.',
    explanationEn: 'The Ministry of Emergency Situations nationwide 112 hotline coordinates flood response, rescue, and de-watering teams 24/7.',
  },
];

export interface FloodGuardCertificate {
  certificateId: string;
  underpassId: UnderpassId;
  underpassNameAz: string;
  underpassNameEn: string;
  vehiclePlate: string;
  vehicleClass: VehicleClass;
  measuredWaterDepthMm: number;
  permissibleMaxDepthMm: number;
  evaluatedRiskLevel: 'safe' | 'caution' | 'critical' | 'severe_danger';
  barrierPassPinCode: string;
  simaDigitalUid: string;
  sha256Checksum: string;
  issuedAt: string;
  validUntil: string;
  aaydaInspectorCallsign: string;
  status: 'active_valid' | 'expired' | 'revoked';
}

export function generateFloodGuardCertificate(
  underpass: UnderpassAsset,
  vehiclePlate: string,
  vehicleClass: VehicleClass,
  waterDepthMm: number,
  riskAssessment: HydroLockRiskAssessment
): FloodGuardCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `FLOOD-GUARD-AZ-2026-${randomSuffix}`;
  const barrierPassPinCode = `${Math.floor(1000 + Math.random() * 9000)}`;
  const simaDigitalUid = `SIMA-AZ-${Math.random().toString(36).substring(2, 10).toUpperCase()}-FLOOD`;
  const sha256Checksum = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const now = new Date();
  const validUntilDate = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4-hour clearance pass

  const profile = VEHICLE_FLOOD_PROFILES[vehicleClass];

  return {
    certificateId,
    underpassId: underpass.id,
    underpassNameAz: underpass.nameAz,
    underpassNameEn: underpass.nameEn,
    vehiclePlate: vehiclePlate.toUpperCase().trim(),
    vehicleClass,
    measuredWaterDepthMm: waterDepthMm,
    permissibleMaxDepthMm: profile.groundClearanceMm,
    evaluatedRiskLevel: riskAssessment.riskLevel,
    barrierPassPinCode,
    simaDigitalUid,
    sha256Checksum,
    issuedAt: now.toISOString(),
    validUntil: validUntilDate.toISOString(),
    aaydaInspectorCallsign: `AAYDA-DRENAJ-№${Math.floor(12 + Math.random() * 30)}`,
    status: 'active_valid',
  };
}
