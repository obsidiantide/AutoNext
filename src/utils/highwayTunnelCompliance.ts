/**
 * Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Emergency Situations (FHN) &
 * Main State Traffic Police Department (BDYP),
 * Highway Tunnel SCADA Safety, Jet Fan Longitudinal Ventilation,
 * Fire Deluge & Emergency Evacuation Telemetry Portal
 * (AAYDA, FHN & BDYP Avtomobil Tunelləri SCADA Təhlükəsizlik Sistemi,
 * Ventilyasiya, Yanğın Söndürmə & TUNNEL-SAFE-AZ-2026 Portalı)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Road Traffic" ("Yol hərəkəti haqqında" Azərbaycan Respublikasının Qanunu, Maddə 9, 37, 50, 54: Tunellərdə hərəkət qaydaları)
 * - Law of the Republic of Azerbaijan "On Fire Safety" ("Yanğın təhlükəsizliyi haqqında" Qanun, Maddə 6, 21)
 * - European Directive 2004/54/EC on Minimum Safety Requirements for Tunnels in the Trans-European Road Network
 * - PIARC (World Road Association) Guidelines on Road Tunnel Systems & Fire Deluge Design
 * - NFPA 502 Standard for Road Tunnels, Bridges, and Other Limited Access Highways
 * - UNECE ADR Agreement on Road Transport of Dangerous Goods (Tunnel Restriction Codes A, B, C, D, E)
 * - AZS State Standard 342: Avtomobil tunellərinin istismarı və ventilyasiya təhlükəsizliyi
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882,
  EUR: 0.5435,
};

export const convertAzn = (amountAzn: number, currency: Currency): number => {
  return amountAzn * CURRENCY_RATES[currency];
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';
  return `${amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
};

/**
 * 6 Strategic Road Tunnels Monitored in Azerbaijan
 */
export type TunnelId =
  | 'TUNNEL_MUROVDAG'
  | 'TUNNEL_ZEFER_YOLU_T1'
  | 'TUNNEL_BAKU_BAY'
  | 'TUNNEL_GOYGOL_KALBAJAR_T2'
  | 'TUNNEL_SHAMAKHI_PASS'
  | 'TUNNEL_ASTARA_FRONTIER';

export interface HighwayTunnelInfo {
  id: TunnelId;
  nameAz: string;
  nameEn: string;
  highwayCode: string;
  locationAz: string;
  lengthMeters: number;
  tubesCount: number; // 1 (bi-directional) or 2 (twin-tube unidirectional)
  lanesPerTube: number;
  tunnelCrossSectionM2: number;
  maxLegalClearanceHeightMeters: number; // e.g. 4.50 m
  designSpeedKmH: number;
  jetFanCount: number;
  crossPassageCount: number; // Emergency escape cross-connections
  sosNichesCount: number;
  delugeZoneCount: number;
  adrTunnelCategory: 'A' | 'B' | 'C' | 'D' | 'E';
  dailyVehicleCapacity: number;
  altitudeMeters: number;
  scadaServerIp: string;
  aaydaRegionalDivision: string;
}

export const STRATEGIC_TUNNELS: Record<TunnelId, HighwayTunnelInfo> = {
  TUNNEL_MUROVDAG: {
    id: 'TUNNEL_MUROVDAG',
    nameAz: 'Murovdağ Tuneli (M-27 Göygöl-Kəlbəcər Magistralı)',
    nameEn: 'Murovdag Tunnel (M-27 Goygol-Kalbajar Highway)',
    highwayCode: 'M-27 / Murovdag Pass',
    locationAz: 'Göygöl - Kəlbəcər rayonları sərhədi, Murovdağ silsiləsi',
    lengthMeters: 11600,
    tubesCount: 2,
    lanesPerTube: 2,
    tunnelCrossSectionM2: 78.5,
    maxLegalClearanceHeightMeters: 4.5,
    designSpeedKmH: 90,
    jetFanCount: 64,
    crossPassageCount: 38,
    sosNichesCount: 76,
    delugeZoneCount: 46,
    adrTunnelCategory: 'C',
    dailyVehicleCapacity: 35000,
    altitudeMeters: 1720,
    scadaServerIp: '10.88.101.10',
    aaydaRegionalDivision: 'AAYDA 7 Saylı Xüsusi Təyinatlı Yol İstismarı İdarəsi',
  },
  TUNNEL_ZEFER_YOLU_T1: {
    id: 'TUNNEL_ZEFER_YOLU_T1',
    nameAz: 'Zəfər Yolu T-1 Tuneli (Füzuli-Şuşa Dağ Magistralı)',
    nameEn: 'Victory Road T-1 Tunnel (Fuzuli-Shusha Highway)',
    highwayCode: 'Zəfər Yolu T-1 / Topxana',
    locationAz: 'Xocavənd - Şuşa dağ keçidi, Topxana meşəliyi',
    lengthMeters: 1420,
    tubesCount: 2,
    lanesPerTube: 2,
    tunnelCrossSectionM2: 72.0,
    maxLegalClearanceHeightMeters: 4.5,
    designSpeedKmH: 80,
    jetFanCount: 16,
    crossPassageCount: 5,
    sosNichesCount: 10,
    delugeZoneCount: 8,
    adrTunnelCategory: 'B',
    dailyVehicleCapacity: 28000,
    altitudeMeters: 1180,
    scadaServerIp: '10.88.101.20',
    aaydaRegionalDivision: 'AAYDA Qarabağ Regional Yol İstismarı Departamenti',
  },
  TUNNEL_BAKU_BAY: {
    id: 'TUNNEL_BAKU_BAY',
    nameAz: 'Bakı Sahil Dənizkənarı Yeraltı Tuneli (İstiqlaliyyət / Neftçilər Qovşağı)',
    nameEn: 'Baku Coastal Sub-surface Tunnel (Neftchilar Hub)',
    highwayCode: 'Baku Central Loop',
    locationAz: 'Bakı şəhəri, Səbail rayonu, Dənizkənarı Bulvar xətti',
    lengthMeters: 2150,
    tubesCount: 2,
    lanesPerTube: 3,
    tunnelCrossSectionM2: 96.0,
    maxLegalClearanceHeightMeters: 4.3,
    designSpeedKmH: 70,
    jetFanCount: 28,
    crossPassageCount: 8,
    sosNichesCount: 16,
    delugeZoneCount: 14,
    adrTunnelCategory: 'D',
    dailyVehicleCapacity: 85000,
    altitudeMeters: -18,
    scadaServerIp: '10.88.101.30',
    aaydaRegionalDivision: 'Bakı Şəhəri Avtomobil Yollarının İstismarı Departamenti',
  },
  TUNNEL_GOYGOL_KALBAJAR_T2: {
    id: 'TUNNEL_GOYGOL_KALBAJAR_T2',
    nameAz: 'Kəlbəcər Dağ Keçidi T-2 Tuneli',
    nameEn: 'Kalbajar Mountain Pass T-2 Tunnel',
    highwayCode: 'M-27 T-2 Bypass',
    locationAz: 'Kəlbəcər rayonu, Toğanalı dərəsi',
    lengthMeters: 3450,
    tubesCount: 2,
    lanesPerTube: 2,
    tunnelCrossSectionM2: 75.0,
    maxLegalClearanceHeightMeters: 4.5,
    designSpeedKmH: 80,
    jetFanCount: 24,
    crossPassageCount: 12,
    sosNichesCount: 24,
    delugeZoneCount: 18,
    adrTunnelCategory: 'C',
    dailyVehicleCapacity: 22000,
    altitudeMeters: 1540,
    scadaServerIp: '10.88.101.40',
    aaydaRegionalDivision: 'AAYDA Qərbi Azərbaycan & Kəlbəcər Yol İdarəsi',
  },
  TUNNEL_SHAMAKHI_PASS: {
    id: 'TUNNEL_SHAMAKHI_PASS',
    nameAz: 'Şamaxı Muğanlı-İsmayıllı Aşırım Tuneli',
    nameEn: 'Shamakhi Muganly-Ismayilli Pass Tunnel',
    highwayCode: 'R-11 Shamakhi-Ismayilli',
    locationAz: 'Şamaxı - İsmayıllı rayonları sərhədi, Muğanlı aşırımı',
    lengthMeters: 1850,
    tubesCount: 2,
    lanesPerTube: 2,
    tunnelCrossSectionM2: 74.0,
    maxLegalClearanceHeightMeters: 4.5,
    designSpeedKmH: 80,
    jetFanCount: 18,
    crossPassageCount: 6,
    sosNichesCount: 14,
    delugeZoneCount: 10,
    adrTunnelCategory: 'B',
    dailyVehicleCapacity: 30000,
    altitudeMeters: 920,
    scadaServerIp: '10.88.101.50',
    aaydaRegionalDivision: 'AAYDA Şirvan-İsmayıllı Regional İdarəsi',
  },
  TUNNEL_ASTARA_FRONTIER: {
    id: 'TUNNEL_ASTARA_FRONTIER',
    nameAz: 'Astara Beynəlxalq Sərhəd Tranzit Tuneli (M-3 Magistralı)',
    nameEn: 'Astara International Frontier Transit Tunnel (M-3)',
    highwayCode: 'M-3 Astara Frontier',
    locationAz: 'Astara rayonu, Şimal-Cənub beynəlxalq nəqliyyat dəhlizi',
    lengthMeters: 980,
    tubesCount: 2,
    lanesPerTube: 2,
    tunnelCrossSectionM2: 82.0,
    maxLegalClearanceHeightMeters: 4.8,
    designSpeedKmH: 80,
    jetFanCount: 12,
    crossPassageCount: 4,
    sosNichesCount: 8,
    delugeZoneCount: 6,
    adrTunnelCategory: 'B',
    dailyVehicleCapacity: 40000,
    altitudeMeters: -12,
    scadaServerIp: '10.88.101.60',
    aaydaRegionalDivision: 'AAYDA Cənub Beynəlxalq Magistral İstismar Sahəsi',
  },
};

/**
 * SCADA Operational Modes
 */
export type ScadaMode =
  | 'MODE_NORMAL'
  | 'MODE_CONGESTION'
  | 'MODE_MAINTENANCE'
  | 'MODE_FIRE_EMERGENCY';

export interface ScadaModeInfo {
  mode: ScadaMode;
  nameAz: string;
  nameEn: string;
  portalBarrierStatusAz: string;
  laneControlSignalsAz: string;
  speedLimitKmH: number;
  jetFanOperatingPowerPercent: number;
  crossPassageDoorsStatusAz: string;
  fireDelugeReadyAz: string;
  colorHex: string;
}

export const SCADA_MODES: Record<ScadaMode, ScadaModeInfo> = {
  MODE_NORMAL: {
    mode: 'MODE_NORMAL',
    nameAz: 'Normal Sərbəst Axın Rejimi',
    nameEn: 'Normal Free Flow Mode',
    portalBarrierStatusAz: 'Açıq (Baryerlər qaldırılıb)',
    laneControlSignalsAz: 'Yaşıl aşağı ox (Hər iki zolaq aktiv)',
    speedLimitKmH: 90,
    jetFanOperatingPowerPercent: 25,
    crossPassageDoorsStatusAz: 'Qapalı, təzyiq altında (+50 Pa)',
    fireDelugeReadyAz: 'Gözləmə rejimi (Avtomatik)',
    colorHex: '#10b981',
  },
  MODE_CONGESTION: {
    mode: 'MODE_CONGESTION',
    nameAz: 'Sıxlıq və Havalandırma Təmizlənməsi Rejimi',
    nameEn: 'Congestion & High-Ventilation Flush Mode',
    portalBarrierStatusAz: 'Dinamik dozajlama (Pulsasiyalı buraxılış)',
    laneControlSignalsAz: 'Sarı yanıb-sönən 50 km/s tövsiyə siqnalı',
    speedLimitKmH: 50,
    jetFanOperatingPowerPercent: 65,
    crossPassageDoorsStatusAz: 'Qapalı, təzyiq altında (+50 Pa)',
    fireDelugeReadyAz: 'Gözləmə rejimi (Avtomatik)',
    colorHex: '#f59e0b',
  },
  MODE_MAINTENANCE: {
    mode: 'MODE_MAINTENANCE',
    nameAz: 'Planlı Texniki Baxış & Əks-Hərəkət Rejimi',
    nameEn: 'Maintenance & Contraflow Lane Shift Mode',
    portalBarrierStatusAz: 'Tək boru açıq (Digər boru bağlıdır)',
    laneControlSignalsAz: 'Sarı diaqonal ox (Sağa keçid) / Qırmızı X',
    speedLimitKmH: 40,
    jetFanOperatingPowerPercent: 45,
    crossPassageDoorsStatusAz: 'Xidməti rejimdə açıla bilər',
    fireDelugeReadyAz: 'Təcrid zonaları istisna olmaqla aktiv',
    colorHex: '#6366f1',
  },
  MODE_FIRE_EMERGENCY: {
    mode: 'MODE_FIRE_EMERGENCY',
    nameAz: 'TƏCİLİ YANĞIN & EVAKUASİYA HƏYƏCANI',
    nameEn: 'CRITICAL FIRE & EVACUATION EMERGENCY',
    portalBarrierStatusAz: 'QAPALI (Girişlər tam bloklanıb, FHN 112 aktiv)',
    laneControlSignalsAz: 'Bütün zolaqlarda İKİLİ QIRMIZI X',
    speedLimitKmH: 0,
    jetFanOperatingPowerPercent: 100,
    crossPassageDoorsStatusAz: 'AVTOMATİK AÇILIB (Yaşıl LED eskapada yolu aktiv)',
    fireDelugeReadyAz: 'PÜSKÜRMƏ AKTİV (Su köpük zonası işə salınıb)',
    colorHex: '#ef4444',
  },
};

/**
 * Environmental Telemetry Parameters
 */
export interface TunnelTelemetryState {
  carbonMonoxidePpm: number; // Normal < 30 ppm, Warning 30-50, Danger > 50 ppm
  nitrogenDioxidePpm: number; // Normal < 0.4 ppm, Danger > 1.0 ppm
  visibilityExtinctionK: number; // Normal < 0.005 m-1, Warning 0.005-0.009, Fire Smoke > 0.009 m-1
  airflowVelocityMs: number; // Nominal 1.5 - 3.5 m/s (critical velocity to avoid backlayering)
  linearHeatSensorTempC: number; // Linear heat cable temp C: Normal 15-30 C, Alert > 68 C
  crossPassagePressureDifferentialPa: number; // Nominal +50 Pa positive differential
  overheightDetected: boolean; // Over 4.50m triggers portal alarm
  activeVehiclesInTube: number;
}

/**
 * Air Quality Safety Assessment
 */
export interface AirQualityAssessment {
  coStatus: 'SAFE' | 'WARNING' | 'DANGER';
  no2Status: 'SAFE' | 'WARNING' | 'DANGER';
  visibilityStatus: 'CLEAR' | 'HAZY' | 'DENSE_SMOKE';
  heatStatus: 'NORMAL' | 'ELEVATED' | 'FIRE_FLASH';
  requiresVentilationBoost: boolean;
  requiresEmergencyStop: boolean;
  recommendedJetFanPowerPercent: number;
  diagnosticSummaryAz: string;
}

export const evaluateAirQuality = (telemetry: TunnelTelemetryState): AirQualityAssessment => {
  // CO evaluation
  let coStatus: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
  if (telemetry.carbonMonoxidePpm >= 50) {
    coStatus = 'DANGER';
  } else if (telemetry.carbonMonoxidePpm >= 30) {
    coStatus = 'WARNING';
  }

  // NO2 evaluation
  let no2Status: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
  if (telemetry.nitrogenDioxidePpm >= 1.0) {
    no2Status = 'DANGER';
  } else if (telemetry.nitrogenDioxidePpm >= 0.4) {
    no2Status = 'WARNING';
  }

  // Visibility evaluation
  let visibilityStatus: 'CLEAR' | 'HAZY' | 'DENSE_SMOKE' = 'CLEAR';
  if (telemetry.visibilityExtinctionK >= 0.009) {
    visibilityStatus = 'DENSE_SMOKE';
  } else if (telemetry.visibilityExtinctionK >= 0.005) {
    visibilityStatus = 'HAZY';
  }

  // Heat evaluation
  let heatStatus: 'NORMAL' | 'ELEVATED' | 'FIRE_FLASH' = 'NORMAL';
  if (telemetry.linearHeatSensorTempC >= 68) {
    heatStatus = 'FIRE_FLASH';
  } else if (telemetry.linearHeatSensorTempC >= 45) {
    heatStatus = 'ELEVATED';
  }

  const requiresEmergencyStop =
    heatStatus === 'FIRE_FLASH' ||
    visibilityStatus === 'DENSE_SMOKE' ||
    coStatus === 'DANGER' ||
    telemetry.overheightDetected;

  const requiresVentilationBoost =
    coStatus !== 'SAFE' ||
    no2Status !== 'SAFE' ||
    visibilityStatus !== 'CLEAR' ||
    heatStatus !== 'NORMAL';

  let recommendedJetFanPowerPercent = 25;
  if (requiresEmergencyStop) {
    recommendedJetFanPowerPercent = 100;
  } else if (coStatus === 'WARNING' || no2Status === 'WARNING' || visibilityStatus === 'HAZY') {
    recommendedJetFanPowerPercent = 65;
  }

  let diagnosticSummaryAz = 'SCADA parametrləri tam normadadır. Təbii hava axını və ventilyasiya balansı qorunur.';
  if (requiresEmergencyStop) {
    diagnosticSummaryAz = 'DİQQƏT: Kritik təhlükə aşkarlanıb! Tunel girişi bağlanmalı, reaktiv ventilyasiya maksimum rejimə keçirilməlidir.';
  } else if (requiresVentilationBoost) {
    diagnosticSummaryAz = 'XƏBƏRDARLIQ: Zəhərli qaz konsentrasiyası və ya tüstü həddi artıb. Jet fan ventilyatorlarının gücü artırılmalıdır.';
  }

  return {
    coStatus,
    no2Status,
    visibilityStatus,
    heatStatus,
    requiresVentilationBoost,
    requiresEmergencyStop,
    recommendedJetFanPowerPercent,
    diagnosticSummaryAz,
  };
};

/**
 * Vehicle Classes for Tunnel Transit
 */
export type TunnelVehicleClass =
  | 'CLASS_1_PASSENGER'
  | 'CLASS_2_MINIBUS_VAN'
  | 'CLASS_3_HEAVY_TRUCK_BUS'
  | 'CLASS_4_ADR_TANKER_OVERSIZE';

export interface VehicleClassTariff {
  id: TunnelVehicleClass;
  nameAz: string;
  nameEn: string;
  baseFeeAzn: number;
  speedLimitMultiplier: number;
  adrAllowedByDefault: boolean;
  escortRequired: boolean;
}

export const TUNNEL_VEHICLE_TARIFFS: Record<TunnelVehicleClass, VehicleClassTariff> = {
  CLASS_1_PASSENGER: {
    id: 'CLASS_1_PASSENGER',
    nameAz: 'Kateqoriya 1: Minik avtomobilləri (Sedan, Hetçbek, SUV)',
    nameEn: 'Category 1: Passenger Cars (Sedan, Hatchback, SUV)',
    baseFeeAzn: 2.0,
    speedLimitMultiplier: 1.0,
    adrAllowedByDefault: true,
    escortRequired: false,
  },
  CLASS_2_MINIBUS_VAN: {
    id: 'CLASS_2_MINIBUS_VAN',
    nameAz: 'Kateqoriya 2: Mikroavtobuslar və Yüngül Kommersiya (≤ 3.5t)',
    nameEn: 'Category 2: Minibuses & Light Commercial (≤ 3.5t)',
    baseFeeAzn: 4.0,
    speedLimitMultiplier: 0.9,
    adrAllowedByDefault: true,
    escortRequired: false,
  },
  CLASS_3_HEAVY_TRUCK_BUS: {
    id: 'CLASS_3_HEAVY_TRUCK_BUS',
    nameAz: 'Kateqoriya 3: Böyük tutumlu Avtobuslar və Yük maşınları (> 3.5t)',
    nameEn: 'Category 3: Heavy Duty Buses & Freight Trucks (> 3.5t)',
    baseFeeAzn: 8.0,
    speedLimitMultiplier: 0.8,
    adrAllowedByDefault: true,
    escortRequired: false,
  },
  CLASS_4_ADR_TANKER_OVERSIZE: {
    id: 'CLASS_4_ADR_TANKER_OVERSIZE',
    nameAz: 'Kateqoriya 4: Təhlükəli Yüklər (ADR Sitern) və İriqabaritli Nəqliyyat',
    nameEn: 'Category 4: Hazardous Materials (ADR Tanker) & Oversized Vehicles',
    baseFeeAzn: 25.0,
    speedLimitMultiplier: 0.65,
    adrAllowedByDefault: false,
    escortRequired: true,
  },
};

/**
 * ADR Tunnel Restriction Codes
 */
export type AdrCargoCode = 'NONE' | 'ADR_CAT_B' | 'ADR_CAT_C' | 'ADR_CAT_D' | 'ADR_CAT_E';

export interface AdrCargoInfo {
  code: AdrCargoCode;
  labelAz: string;
  labelEn: string;
  dangerLevelAz: string;
  requiresAaydaEscort: boolean;
  escortFeeAzn: number;
}

export const ADR_CARGO_CATEGORIES: Record<AdrCargoCode, AdrCargoInfo> = {
  NONE: {
    code: 'NONE',
    labelAz: 'Standart Qeyri-Təhlükəli Yük',
    labelEn: 'Standard Non-Hazardous Cargo',
    dangerLevelAz: 'Təhlükəsiz (Məhdudiyyətsiz tranzit)',
    requiresAaydaEscort: false,
    escortFeeAzn: 0,
  },
  ADR_CAT_B: {
    code: 'ADR_CAT_B',
    labelAz: 'ADR Kod B: Kütləvi partlayış riski olan yüklər',
    labelEn: 'ADR Code B: Very large explosion hazard',
    dangerLevelAz: 'Yüksək Təhlükə (Tunel B, C, D, E daxilində qadağandır)',
    requiresAaydaEscort: true,
    escortFeeAzn: 35.0,
  },
  ADR_CAT_C: {
    code: 'ADR_CAT_C',
    labelAz: 'ADR Kod C: Böyük partlayış və ya zəhərli qaz riski',
    labelEn: 'ADR Code C: Large explosion or toxic risk',
    dangerLevelAz: 'Orta-Yüksək Təhlükə (Tunel C, D, E qadağandır)',
    requiresAaydaEscort: true,
    escortFeeAzn: 25.0,
  },
  ADR_CAT_D: {
    code: 'ADR_CAT_D',
    labelAz: 'ADR Kod D: Yanacaq siternləri və tezalışan mayelər',
    labelEn: 'ADR Code D: Flammable liquid tankers (SOCAR, Azpetrol)',
    dangerLevelAz: 'Yanğın Təhlükəsi (Tunel D, E qadağandır, FHN eskortu tələb olunur)',
    requiresAaydaEscort: true,
    escortFeeAzn: 20.0,
  },
  ADR_CAT_E: {
    code: 'ADR_CAT_E',
    labelAz: 'ADR Kod E: Bütün növ təhlükəli kimyəvi yüklər',
    labelEn: 'ADR Code E: All dangerous chemical goods',
    dangerLevelAz: 'Ümumi Təhlükə (Tunel E qadağandır)',
    requiresAaydaEscort: false,
    escortFeeAzn: 10.0,
  },
};

/**
 * Transit Fee Calculation Input & Output
 */
export interface TunnelTransitFeeCalculation {
  tunnelId: TunnelId;
  vehicleClass: TunnelVehicleClass;
  adrCargoCode: AdrCargoCode;
  isPeakHour: boolean; // 1.25x peak multiplier
  currency: Currency;
  baseFeeAzn: number;
  adrEscortFeeAzn: number;
  peakHourSurchargeAzn: number;
  totalFeeAzn: number;
  convertedTotalFee: number;
  isAdrPermittedInTunnel: boolean;
  adrRestrictionReasonAz: string;
}

export const checkAdrTunnelCompliance = (
  tunnelCategory: 'A' | 'B' | 'C' | 'D' | 'E',
  cargoCode: AdrCargoCode
): { permitted: boolean; reasonAz: string } => {
  if (cargoCode === 'NONE') {
    return {
      permitted: true,
      reasonAz: 'Yük təhlükəsizdir, tunel tranziti üçün heç bir ADR məhdudiyyəti tətbiq edilmir.',
    };
  }

  // Under UNECE ADR rules:
  // Tunnel Cat A: No restrictions
  // Tunnel Cat B: Restricts cargo B, C, D, E
  // Tunnel Cat C: Restricts cargo C, D, E
  // Tunnel Cat D: Restricts cargo D, E
  // Tunnel Cat E: Restricts all dangerous goods
  if (tunnelCategory === 'A') {
    return { permitted: true, reasonAz: 'Tunel A kateqoriyasındadır, bütün təhlükəli yüklərin keçidinə icazə verilir.' };
  }

  if (cargoCode === 'ADR_CAT_B') {
    return {
      permitted: false,
      reasonAz: 'ADR Kod B (Kütləvi partlayış riski) bu tuneldə qəti qadağandır. Yerüstü dolama marşrut tələb olunur.',
    };
  }

  if (cargoCode === 'ADR_CAT_C' && (tunnelCategory === 'C' || tunnelCategory === 'D' || tunnelCategory === 'E')) {
    return {
      permitted: false,
      reasonAz: 'ADR Kod C yükü bu kateqoriyalı tuneldən keçə bilməz. Qanunvericiliklə alternativ marşrut nəzərdə tutulub.',
    };
  }

  if (cargoCode === 'ADR_CAT_D' && (tunnelCategory === 'D' || tunnelCategory === 'E')) {
    return {
      permitted: false,
      reasonAz: 'ADR Kod D (Yanacaq siternləri) bu şəhərdaxili/xüsusi tuneldən keçə bilməz. AAYDA eskortu ilə dolama yoldan istifadə edin.',
    };
  }

  if (cargoCode === 'ADR_CAT_E' && tunnelCategory === 'E') {
    return {
      permitted: false,
      reasonAz: 'Tunel E kateqoriyasındadır, bütün növ təhlükəli yüklərin hərəkəti qadağandır.',
    };
  }

  return {
    permitted: true,
    reasonAz: 'Təhlükəli yükün kateqoriyası bu tunelin təhlükəsizlik sinfinə uyğundur və xüsusi rejimdə keçidə icazə verilir.',
  };
};

export const calculateTunnelTransitFee = (
  tunnelId: TunnelId,
  vehicleClass: TunnelVehicleClass,
  adrCargoCode: AdrCargoCode,
  isPeakHour: boolean,
  currency: Currency
): TunnelTransitFeeCalculation => {
  const tunnel = STRATEGIC_TUNNELS[tunnelId];
  const vehicle = TUNNEL_VEHICLE_TARIFFS[vehicleClass];
  const cargo = ADR_CARGO_CATEGORIES[adrCargoCode];

  const compliance = checkAdrTunnelCompliance(tunnel.adrTunnelCategory, adrCargoCode);

  const baseFeeAzn = vehicle.baseFeeAzn;
  const adrEscortFeeAzn = cargo.escortFeeAzn;

  const subtotalAzn = baseFeeAzn + adrEscortFeeAzn;
  const peakHourSurchargeAzn = isPeakHour ? subtotalAzn * 0.25 : 0;
  const totalFeeAzn = subtotalAzn + peakHourSurchargeAzn;

  return {
    tunnelId,
    vehicleClass,
    adrCargoCode,
    isPeakHour,
    currency,
    baseFeeAzn,
    adrEscortFeeAzn,
    peakHourSurchargeAzn,
    totalFeeAzn,
    convertedTotalFee: convertAzn(totalFeeAzn, currency),
    isAdrPermittedInTunnel: compliance.permitted,
    adrRestrictionReasonAz: compliance.reasonAz,
  };
};

/**
 * 10-Point Technical & Fire Safety Checklist
 */
export interface TunnelSafetyChecklistItem {
  id: string;
  titleAz: string;
  descriptionAz: string;
  category: 'VENTILATION' | 'FIRE_SUPPRESSION' | 'SCADA_SENSORS' | 'EVACUATION' | 'STRUCTURAL';
  statutoryMandate: string;
  weightPoints: number;
}

export const TUNNEL_SAFETY_CHECKLIST: TunnelSafetyChecklistItem[] = [
  {
    id: 'CHK_JET_FANS_REVERSIBILITY',
    titleAz: 'Reaktiv Ventilyatorların Reversiv İti və Tüstü Çəkmə Gücü',
    descriptionAz: 'Bütün reaktiv fanların (Jet Fans) 100% gücdə reversiv fırlanması və tüstünü hərəkət axını istiqamətinə üfürməsi yoxlanılır.',
    category: 'VENTILATION',
    statutoryMandate: 'PIARC Guidelines / NFPA 502 Section 7.2',
    weightPoints: 10,
  },
  {
    id: 'CHK_CRITICAL_VELOCITY_BACKLAYERING',
    titleAz: 'Kritik Tüstü Sürəti (Critical Velocity ≥ 2.5 m/s) Təminatı',
    descriptionAz: 'Tüstünün maşınların üzərinə geri qayıtmasının (backlayering) qarşısını almaq üçün uzununa külək sürətinin minimum 2.5 m/s olması təsdiqlənir.',
    category: 'VENTILATION',
    statutoryMandate: 'Directive 2004/54/EC Annex I',
    weightPoints: 10,
  },
  {
    id: 'CHK_LINEAR_HEAT_DETECTION',
    titleAz: 'Xətti İstilik Ölçmə Lifli-Optik Sensor Kabeli (LHD Testi)',
    descriptionAz: 'Tunel tağında quraşdırılmış optik lifli yanğın kabelinin temperatur dəyişməsini 5 saniyə ərzində ±1°C dəqiqliklə aşkarlaması yoxlanılır.',
    category: 'FIRE_SUPPRESSION',
    statutoryMandate: 'NFPA 502 Section 9.3',
    weightPoints: 10,
  },
  {
    id: 'CHK_DELUGE_SPRINKLER_ZONES',
    titleAz: 'Köpüklü Su Püskürmə Deluge Sistemi və Hidrant Şəbəkəsi',
    descriptionAz: 'Yanğın zonalarında 30 saniyə ərzində su-köpük deluge püskürtməsinin avtomatik aktivləşməsi və hidrant təzyiqinin minimum 8 bar olması yoxlanılır.',
    category: 'FIRE_SUPPRESSION',
    statutoryMandate: 'AR Yanğın Təhlükəsizliyi Qanunu, Maddə 21',
    weightPoints: 10,
  },
  {
    id: 'CHK_CROSS_PASSAGE_PRESSURE',
    titleAz: 'Təxliyə Qapılarında Müsbət Təzyiq Fərqi (+50 Pa)',
    descriptionAz: 'Tüstünün qonşu təxliyə borusuna keçməməsi üçün keçid qapılarında +50 Pa izafi hava təzyiqi və qapıların antı-panik mexanizmi yoxlanılır.',
    category: 'EVACUATION',
    statutoryMandate: 'Directive 2004/54/EC Section 2.4',
    weightPoints: 10,
  },
  {
    id: 'CHK_SOS_NICHES_TELEPHONY',
    titleAz: 'SOS Telefon Nişləri, Yanğınsöndürənlər və 112 FHN Əlaqəsi',
    descriptionAz: 'Hər 150 metrdən bir quraşdırılmış SOS qutularından dispetçer mərkəzinə və FHN 112 xidmətinə birbaşa audio rabitə xətti yoxlanılır.',
    category: 'EVACUATION',
    statutoryMandate: 'Yol hərəkəti haqqında Qanun, Maddə 54',
    weightPoints: 10,
  },
  {
    id: 'CHK_OVERHEIGHT_IR_BARRIER',
    titleAz: 'Giriş Portallarında Qabarit Hündürlüyü İnfraqırmızı Baryeri',
    descriptionAz: '4.50 metrdən hündür nəqliyyat vasitələrini 200 metr əvvəlcədən aşkarlayan infraqırmızı şüa sensoru və avtomatik şlaqbaum sınağı aparılır.',
    category: 'SCADA_SENSORS',
    statutoryMandate: 'AAYDA Magistral Təhlükəsizlik Reqlamenti',
    weightPoints: 10,
  },
  {
    id: 'CHK_CO_NO2_OPACITY_METERS',
    titleAz: 'CO, NO2 və Optik Tüstü Sıxlığı (k-metr) Qazanalizatorları',
    descriptionAz: 'Qazanalizatorların kalibrasiya sertifikatı, CO 30 ppm və NO2 0.4 ppm xəbərdarlıq həddi dəqiqliyi audit olunur.',
    category: 'SCADA_SENSORS',
    statutoryMandate: 'AZS 342 Dövlət Standartı',
    weightPoints: 10,
  },
  {
    id: 'CHK_DYNAMIC_LANE_SIGNALS',
    titleAz: 'Zolaq Nəzarət İşıqforları (LCS) və Dəyişkən Məlumat Lövhələri',
    descriptionAz: 'Yaşıl ox, sarı diaqonal və qırmızı X siqnallarının SCADA mərkəzindən 1 saniyədən az gecikmə ilə yenilənməsi yoxlanılır.',
    category: 'SCADA_SENSORS',
    statutoryMandate: 'DIN EN 12966 / VMS Tələbləri',
    weightPoints: 10,
  },
  {
    id: 'CHK_UPS_DIESEL_GENERATOR',
    titleAz: 'Fasiləsiz Qida Mənbələri (UPS) və Ehtiyat Dizel Generatorları',
    descriptionAz: 'Şəbəkə gərginliyi itdiyi halda UPS-in 0 millisaniyə kəsintisizliyi və 15 saniyə ərzində 500 kVA ehtiyat dizel generatorunun işə düşməsi yoxlanılır.',
    category: 'STRUCTURAL',
    statutoryMandate: 'NFPA 502 Section 12.4',
    weightPoints: 10,
  },
];

export interface ChecklistEvaluationResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  gradeAz: 'ƏLA' | 'QƏNAƏTBƏXŞ' | 'QEYRİ-MƏQBUL';
  summaryAz: string;
}

export const evaluateTunnelChecklist = (checkedIds: string[]): ChecklistEvaluationResult => {
  const maxScore = TUNNEL_SAFETY_CHECKLIST.reduce((sum, item) => sum + item.weightPoints, 0);
  const totalScore = TUNNEL_SAFETY_CHECKLIST.filter((item) => checkedIds.includes(item.id)).reduce(
    (sum, item) => sum + item.weightPoints,
    0
  );

  const percentage = Math.round((totalScore / maxScore) * 100);
  const passed = percentage >= 80;

  let gradeAz: 'ƏLA' | 'QƏNAƏTBƏXŞ' | 'QEYRİ-MƏQBUL' = 'QEYRİ-MƏQBUL';
  let summaryAz = 'Tunel təhlükəsizlik yoxlamasından keçmədi. Kritik sistemlərdə kəsirlər mövcuddur.';

  if (percentage >= 90) {
    gradeAz = 'ƏLA';
    summaryAz = 'Bütün SCADA, havalandırma, yanğın və təxliyə parametrləri beynəlxalq PIARC və NFPA standartlarına tam cavab verir.';
  } else if (percentage >= 80) {
    gradeAz = 'QƏNAƏTBƏXŞ';
    summaryAz = 'Minimum zəruri təhlükəsizlik tələbləri ödənilib. Növbəti texniki qulluq müddətinədək istismara icazə verilir.';
  }

  return {
    totalScore,
    maxScore,
    percentage,
    passed,
    gradeAz,
    summaryAz,
  };
};

/**
 * 10 Theoretical Exam Questions on Tunnel Safety & Traffic Law
 */
export interface TunnelExamQuestion {
  id: string;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  legalCitation: string;
  explanationAz: string;
}

export const TUNNEL_EXAM_QUESTIONS: TunnelExamQuestion[] = [
  {
    id: 'Q1_TUNNEL_STOPPING',
    questionAz: 'Azərbaycan Respublikasının "Yol hərəkəti haqqında" Qanununa əsasən, tunellərdə hansı manevr qəti qadağandır?',
    optionsAz: [
      'Gündüz vaxtı yaxın işıq faralarından istifadə etmək',
      'Geri dönmək, geriyə hərəkət etmək və zərurət olmadan dayanmaq və ya durmaq',
      'Dəyişkən sürət həddinə əməl edərək hərəkət etmək',
      'Sağ zolaqla icazə verilən sürətlə irəliləmək',
    ],
    correctOptionIndex: 1,
    legalCitation: 'AR "Yol hərəkəti haqqında" Qanunu, Maddə 54, Hissə 2',
    explanationAz: 'Qanuna əsasən tunellərdə geriyə hərəkət etmək, geriyə dönmək, habelə nəzərdə tutulmayan yerlərdə dayanmaq və durmaq qəti qadağandır.',
  },
  {
    id: 'Q2_FIRE_EVACUATION_DIRECTION',
    questionAz: 'Tuneldə avtomobil yanğını baş verdikdə və tüstü yayıldıqda sürücü və sərnişinlər hansı istiqamətdə təxliyə olunmalıdır?',
    optionsAz: [
      'Tüstünün hərəkət istiqaməti ilə eyni istiqamətdə qaçmaq lazımdır',
      'Reaktiv ventilyatorların üfürdüyü hava axınının əksi istiqamətinə (təmiz havaya doğru) və ən yaxın yaşıl işıqlı təxliyə qapısına doğru',
      'Avtomobilin içində oturub şüşələri bağlayaraq xilasediciləri gözləmək',
      'Yalnız tunelin çıxışına tərəf maşını sürməyə davam etmək',
    ],
    correctOptionIndex: 1,
    legalCitation: 'NFPA 502 & PIARC Yanğın Təhlükəsizliyi və Təxliyə Qaydaları',
    explanationAz: 'Tüstü zəhərlənməsindən qorunmaq üçün ventilyasiya axınının əksinə - təmiz hava mənbəyinə və ən yaxın təxliyə keçidinə (Cross-Passage) qaçılmalıdır.',
  },
  {
    id: 'Q3_HEADLIGHTS_IN_TUNNEL',
    questionAz: 'İşıqlandırılmış avtomobil tunelinə daxil olarkən sürücü hansı xarici işıq cihazlarını yandırmağa borcludur?',
    optionsAz: [
      'Yalnız qabarit işıqları kifayətdir',
      'Yaxın və ya uzaq vuran faraları (tunel tam işıqlı olsa belə)',
      'İşıqları söndürüb yalnız duman faralarını yandırmaq',
      'Heç bir işıq yandırmaq tələb olunmur',
    ],
    correctOptionIndex: 1,
    legalCitation: 'AR "Yol hərəkəti haqqında" Qanunu, Maddə 72, Hissə 1',
    explanationAz: 'Süni işıqlandırmanın olub-olmamasından asılı olmayaraq, tunellərdə hərəkət edərkən yaxın və ya uzaq vuran fənərlər mütləq yandırılmalıdır.',
  },
  {
    id: 'Q4_DISTANCE_BETWEEN_VEHICLES',
    questionAz: 'Tunellərdə hərəkət edərkən və ya tıxacda dayanarkən öndəki avtomobillə minimal təhlükəsiz məsafə nə qədər olmalıdır?',
    optionsAz: [
      'Hərəkətdə ən azı 50 metr, tıxacda dayandıqda isə ən azı 5 metr məsafə',
      'Hərəkətdə 5 metr, tıxacda isə 0.5 metr bufer məsafəsi',
      'Heç bir məsafə tələbi yoxdur',
      'Öndəki maşının arxa bamperinə sıx dayanmaq lazımdır',
    ],
    correctOptionIndex: 0,
    legalCitation: 'Directive 2004/54/EC / Yol hərəkəti təhlükəsizliyi qaydaları',
    explanationAz: 'Tuneldə zəncirvari qəzaların və yanğın zamanı tələyə düşmənin qarşısını almaq üçün hərəkətdə ən azı 50m, dayandıqda minimum 5m məsafə saxlanmalıdır.',
  },
  {
    id: 'Q5_OVERHEIGHT_RESTRICTION',
    questionAz: 'Azərbaycanın dağ və magistral tunellərində standart icazə verilən maksimal qabarit hündürlüyü nə qədərdir?',
    optionsAz: [
      '3.50 metr',
      '4.50 metr',
      '5.50 metr',
      'Məhdudiyyətsiz',
    ],
    correctOptionIndex: 1,
    legalCitation: 'AAYDA Magistral Tunellərin Həndəsi Layihələndirmə Normaları',
    explanationAz: 'Standart magistral tunel tavanında jet fan və kommunikasiyaların qorunması üçün maksimal icazə verilən qabarit hündürlüyü 4.50 metrdir.',
  },
  {
    id: 'Q6_RED_X_LANE_SIGNAL',
    questionAz: 'Zolaq üzərində quraşdırılmış LCS elektron işıqforunda QIRMIZI X (çarpaz) işarəsi yandıqda nə edilməlidir?',
    optionsAz: [
      'Sürəti artıraraq həmin zolaqla davam etmək',
      'Həmin zolaqla hərəkət QƏTİ QADAĞANDIR; dərhal təhlükəsiz şəkildə qonşu açıq zolağa keçilməlidir',
      'Yalnız yük maşınları zolağı tərk etməlidir',
      'Fasiləsiz səs siqnalı verərək irəliləmək',
    ],
    correctOptionIndex: 1,
    legalCitation: 'AR "Yol hərəkəti haqqında" Qanunu, Maddə 60, Hissə 8',
    explanationAz: 'Zolağın üstündə qırmızı X işarəsi həmin zolağın bağlı olduğunu bildirir və oraya daxil olmaq qadağandır.',
  },
  {
    id: 'Q7_ADR_TUNNEL_CODES',
    questionAz: 'UNECE ADR razılaşmasına görə "E" kateqoriyalı tunellərdən hansı yüklərin keçidi qadağandır?',
    optionsAz: [
      'Bütün növ təhlükəli yüklərin (ADR qeydiyyatlı bütün siniflər)',
      'Yalnız kənd təsərrüfatı ərzaq mallarının',
      'Elektriklə işləyən avtomobillərin',
      'Heç bir yük məhdudlaşdırılmır',
    ],
    correctOptionIndex: 0,
    legalCitation: 'UNECE ADR Chapter 1.9 & Chapter 8.6',
    explanationAz: 'E kateqoriyalı tunellər ən sərt məhdudiyyətə malikdir və bütün təhlükəli yüklərin tunelə daxil olmasını qadağan edir.',
  },
  {
    id: 'Q8_CROSS_PASSAGE_FUNCTION',
    questionAz: 'Tuneldə "Cross-Passage" (əlaqələndirici təxliyə keçidi) nə üçün nəzərdə tutulub?',
    optionsAz: [
      'Avtomobillərin geriyə dönməsi üçün',
      'Yanğın və ya qəza zamanı insanların təhlükəsiz digər paralel boruya və ya sığınacağa piyada keçməsi üçün',
      'Avtomobillərin parklanması üçün',
      'Yalnız polisin müşahidə aparması üçün',
    ],
    correctOptionIndex: 1,
    legalCitation: 'Directive 2004/54/EC & NFPA 502 Section 7.16',
    explanationAz: 'Təxliyə keçidləri tüstüdən mühafizə olunmuş hermetik qapılara malikdir və piyadaların təhlükəsiz paralel boruya keçidini təmin edir.',
  },
  {
    id: 'Q9_CRITICAL_AIRFLOW_VELOCITY',
    questionAz: 'Tuneldə tüstünün geri yayılmasının (backlayering) qarşısını alan uzununa hava sürəti necə adlanır?',
    optionsAz: [
      'Kritik sürət (Critical Velocity)',
      'Turbulent dispersiya əmsalı',
      'Statik laminarlıq həddi',
      'Aerodinamik sıfır sürəti',
    ],
    correctOptionIndex: 0,
    legalCitation: 'PIARC Systems and Equipment for Fire and Smoke Control',
    explanationAz: 'Kritik sürət (Critical Velocity) tüstünün termal qaldırıcı qüvvəsinə qalib gələrək onun geriyə sızmasını əngəlləyən minimal uzununa havalandırma sürətidir.',
  },
  {
    id: 'Q10_CONGESTION_ENGINE_OFF',
    questionAz: 'Tuneldə hərəkət tam dayandıqda (uzunmüddətli tıxac yarandıqda) sürücü nə etməlidir?',
    optionsAz: [
      'Avtomobilin mühərrikini söndürməli, qabarit işıqlarını açıq saxlamalı və daxili hava resirkulyasiyasını aktiv etməlidir',
      'Qaz pedalını basaraq mühərriki qızdırmalıdır',
      'Səs siqnalı verərək digər sürücüləri tələsdirməlidir',
      'Avtomobili tərk edib yolu bağlamalıdır',
    ],
    correctOptionIndex: 0,
    legalCitation: 'AR "Yol hərəkəti haqqında" Qanunu, Maddə 54 / E-Təhlükəsizlik Təlimatı',
    explanationAz: 'CO və NO2 zəhərli qazlarının tuneldə yığılmasının qarşısını almaq üçün uzunmüddətli dayanma zamanı mühərrik mütləq söndürülməlidir.',
  },
];

export interface ExamEvaluationResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  userAnswers: Record<string, number>;
  feedbackAz: string;
}

export const evaluateTunnelExam = (answers: Record<string, number>): ExamEvaluationResult => {
  let score = 0;
  const totalQuestions = TUNNEL_EXAM_QUESTIONS.length;

  TUNNEL_EXAM_QUESTIONS.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      score += 1;
    }
  });

  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 80;

  const feedbackAz = passed
    ? `Təbriklər! İmtahandan uğurla keçdiniz (${score}/${totalQuestions} düzgün cavab, ${percentage}%). Tunel təhlükəsizliyi və qanunvericilik üzrə bilikləriniz təsdiq olunur.`
    : `Təəssüf ki, keçid balını toplaya bilmədiniz (${score}/${totalQuestions} düzgün cavab, ${percentage}%). Minimal keçid balı 80%-dir. Səhvlərinizi nəzərdən keçirin.`;

  return {
    score,
    totalQuestions,
    percentage,
    passed,
    userAnswers: answers,
    feedbackAz,
  };
};

/**
 * Official Clearance Certificate Interface & Generator
 */
export interface TunnelClearanceCertificate {
  certificateNumber: string; // e.g. "TUNNEL-SAFE-AZ-2026-XXXXX"
  issueDateIso: string;
  expiryDateIso: string;
  tunnelId: TunnelId;
  tunnelNameAz: string;
  vehiclePlate: string;
  vehicleClass: TunnelVehicleClass;
  vehicleClassNameAz: string;
  adrCargoCode: AdrCargoCode;
  adrCargoLabelAz: string;
  paidFeeAzn: number;
  paidFeeConverted: number;
  currency: Currency;
  scadaMode: ScadaMode;
  authorizedLaneNumber: number;
  maxSpeedKmH: number;
  assignedEscortCallsign: string;
  securityChecksumSha256: string;
  simaDigitalSignatureUid: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
}

export const generateTunnelCertificate = (
  tunnelId: TunnelId,
  vehiclePlate: string,
  vehicleClass: TunnelVehicleClass,
  adrCargoCode: AdrCargoCode,
  currency: Currency,
  isPeakHour: boolean
): TunnelClearanceCertificate => {
  const tunnel = STRATEGIC_TUNNELS[tunnelId];
  const feeCalc = calculateTunnelTransitFee(tunnelId, vehicleClass, adrCargoCode, isPeakHour, currency);
  const vehicle = TUNNEL_VEHICLE_TARIFFS[vehicleClass];
  const cargo = ADR_CARGO_CATEGORIES[adrCargoCode];

  const randomSeq = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `TUNNEL-SAFE-AZ-2026-${randomSeq}`;

  const issueDate = new Date();
  const expiryDate = new Date(issueDate.getTime() + 24 * 60 * 60 * 1000); // 24-hour single-transit validity

  const speedLimit = Math.round(tunnel.designSpeedKmH * vehicle.speedLimitMultiplier);
  const escortCallsign = cargo.requiresAaydaEscort ? `AAYDA-ESCORT-${randomSeq % 100}` : 'TƏLƏB_OLUNMUR';

  // Deterministic hex representation
  const rawHashData = `${certificateNumber}|${tunnelId}|${vehiclePlate}|${feeCalc.totalFeeAzn}|${issueDate.toISOString()}`;
  let hashNum = 0;
  for (let i = 0; i < rawHashData.length; i++) {
    hashNum = (hashNum << 5) - hashNum + rawHashData.charCodeAt(i);
    hashNum |= 0;
  }
  const securityChecksumSha256 = `SHA256:AAYDA:${Math.abs(hashNum).toString(16).toUpperCase().padStart(12, 'F')}`;
  const simaDigitalSignatureUid = `SIMA-AZ-GOV-${Math.abs(hashNum % 9999999).toString().padStart(7, '0')}`;

  return {
    certificateNumber,
    issueDateIso: issueDate.toISOString(),
    expiryDateIso: expiryDate.toISOString(),
    tunnelId,
    tunnelNameAz: tunnel.nameAz,
    vehiclePlate: vehiclePlate.toUpperCase().trim(),
    vehicleClass,
    vehicleClassNameAz: vehicle.nameAz,
    adrCargoCode,
    adrCargoLabelAz: cargo.labelAz,
    paidFeeAzn: feeCalc.totalFeeAzn,
    paidFeeConverted: feeCalc.convertedTotalFee,
    currency,
    scadaMode: 'MODE_NORMAL',
    authorizedLaneNumber: 1,
    maxSpeedKmH: speedLimit,
    assignedEscortCallsign: escortCallsign,
    securityChecksumSha256,
    simaDigitalSignatureUid,
    status: 'ACTIVE',
  };
};
