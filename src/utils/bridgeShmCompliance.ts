/**
 * Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Emergency Situations (FHN) &
 * Main State Traffic Police Department (BDYP),
 * Highway Smart Bridge & Viaduct Structural Health Monitoring (SHM),
 * Fiber-Optic Strain, Dynamic Cable Tension, Triaxial Seismic Accelerometer & Weigh-in-Motion (WIM) Telemetry Portal
 * (AAYDA, FHN & BDYP Ağıllı Körpü və Viyaduk Struktur Sağlamlığı Monitorinqi,
 * Seysmik Telemetriya, Dinamik Çəki-Ölçmə & BRIDGE-SHM-AZ-2026 Portalı)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" ("Avtomobil yolları haqqında" Azərbaycan Respublikasının Qanunu, Maddə 14, 21, 28: Körpü və viyadukların mühafizəsi və texniki vəziyyətinə nəzarət)
 * - Law of the Republic of Azerbaijan "On Road Traffic" ("Yol hərəkəti haqqında" Qanun, Maddə 52, 53: Körpülər, estakadalar və viyaduklar üzərində hərəkət qaydaları)
 * - Resolution of the Cabinet of Ministers of the Republic of Azerbaijan No. 104 "On Rules for Permissible Gross Weights and Axle Loads of Heavy Vehicles on Public Roads" (İriqabaritli və ağırçəkili nəqliyyat vasitələrinin normativ çəki və ox yükləri)
 * - Eurocode EN 1991-2: Actions on structures - Traffic loads on bridges (Fatigue load models, dynamic amplification factor DAF)
 * - AASHTO LRFD Bridge Design Specifications (Section 3: Loads and Load Factors, Structural Health Monitoring SHM guidelines)
 * - AZS State Construction Standard 410: Avtomobil yollarında körpü və boruların layihələndirilməsi, seysmik dayanıqlıq və istismar təhlükəsizliyi
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
 * 6 Strategic Bridges & Viaducts in Azerbaijan
 */
export type BridgeId =
  | 'BRIDGE_BAKU_BAY_OVERPASS'
  | 'BRIDGE_KOROGLU_INTERMODAL'
  | 'BRIDGE_KURA_RIVER_SALYAN'
  | 'BRIDGE_KHUDAFERIN_ARAZ'
  | 'BRIDGE_GANJA_CHAY_BYPASS'
  | 'BRIDGE_ZAFAR_DASHALTI_SHUSHA';

export type BridgeType =
  | 'CABLE_STAYED'
  | 'PRESTRESSED_BOX_GIRDER'
  | 'STEEL_COMPOSITE'
  | 'REINFORCED_ARCH'
  | 'HIGH_PIER_VIADUCT';

export interface BridgeStructuralInfo {
  id: BridgeId;
  nameAz: string;
  nameEn: string;
  highwayCode: string;
  locationAz: string;
  bridgeType: BridgeType;
  totalLengthMeters: number;
  mainSpanMeters: number;
  pylonHeightMeters: number;
  lanesCount: number;
  maxPermissibleAxleLoadTonnes: number; // e.g. 11.5 or 10.0
  maxPermissibleGrossWeightTonnes: number; // e.g. 40.0 or 44.0
  fbgSensorCount: number; // Fiber Bragg Grating strain sensors
  accelerometerCount: number; // Triaxial seismic accelerometers
  cableStayCount: number; // Dynamic stay cable tension cells
  wimStationCode: string; // High-Speed Weigh-In-Motion station ID
  dailyTrafficAadt: number;
  aaydaRegionalDivision: string;
}

export const STRATEGIC_BRIDGES: Record<BridgeId, BridgeStructuralInfo> = {
  BRIDGE_BAKU_BAY_OVERPASS: {
    id: 'BRIDGE_BAKU_BAY_OVERPASS',
    nameAz: 'Bakı Buxtası Dənizkənarı Asma Körpü & Viyaduk Kompleksi',
    nameEn: 'Baku Bay Coastal Cable-Stayed Bridge & Viaduct Complex',
    highwayCode: 'Baku Boulevard Transit / Bay Expressway',
    locationAz: 'Bakı şəhəri, Dənizkənarı Milli Park - Zığ magistralı',
    bridgeType: 'CABLE_STAYED',
    totalLengthMeters: 1850,
    mainSpanMeters: 480,
    pylonHeightMeters: 120,
    lanesCount: 6,
    maxPermissibleAxleLoadTonnes: 11.5,
    maxPermissibleGrossWeightTonnes: 44.0,
    fbgSensorCount: 128,
    accelerometerCount: 24,
    cableStayCount: 96,
    wimStationCode: 'WIM-BAKU-BAY-01',
    dailyTrafficAadt: 68500,
    aaydaRegionalDivision: 'AAYDA 1 saylı Bakı Xüsusi Təyinatlı Körpü İstismar İdarəsi',
  },
  BRIDGE_KOROGLU_INTERMODAL: {
    id: 'BRIDGE_KOROGLU_INTERMODAL',
    nameAz: 'Koroğlu Nəqliyyat Qovşağı Çoxsəviyyəli Viyaduk Kompleksi',
    nameEn: 'Koroglu Intermodal Transport Junction Multilevel Viaduct',
    highwayCode: 'Heydər Əliyev Prospekti / M-1 Qovşağı',
    locationAz: 'Bakı şəhəri, Nizami & Sabunçu rayonları kəsişməsi',
    bridgeType: 'PRESTRESSED_BOX_GIRDER',
    totalLengthMeters: 1240,
    mainSpanMeters: 110,
    pylonHeightMeters: 0,
    lanesCount: 8,
    maxPermissibleAxleLoadTonnes: 11.5,
    maxPermissibleGrossWeightTonnes: 44.0,
    fbgSensorCount: 96,
    accelerometerCount: 18,
    cableStayCount: 0,
    wimStationCode: 'WIM-KOROGLU-02',
    dailyTrafficAadt: 92000,
    aaydaRegionalDivision: 'AAYDA 2 saylı Paytaxt Yol və Yol Qovşaqları İdarəsi',
  },
  BRIDGE_KURA_RIVER_SALYAN: {
    id: 'BRIDGE_KURA_RIVER_SALYAN',
    nameAz: 'Kür Çayı Ələt-Astara M-3 Yeni Asma Körpüsü',
    nameEn: 'Kura River Alat-Astara M-3 Highway Cable-Stayed Bridge',
    highwayCode: 'M-3 Magistralı (km 65, Salyan dolama yolu)',
    locationAz: 'Salyan rayonu, Kür çayı üzərindən keçid',
    bridgeType: 'CABLE_STAYED',
    totalLengthMeters: 360,
    mainSpanMeters: 220,
    pylonHeightMeters: 78,
    lanesCount: 4,
    maxPermissibleAxleLoadTonnes: 11.5,
    maxPermissibleGrossWeightTonnes: 44.0,
    fbgSensorCount: 64,
    accelerometerCount: 16,
    cableStayCount: 48,
    wimStationCode: 'WIM-KURA-SALYAN-03',
    dailyTrafficAadt: 28400,
    aaydaRegionalDivision: 'AAYDA 46 saylı Salyan Yol İstismarı İdarəsi',
  },
  BRIDGE_KHUDAFERIN_ARAZ: {
    id: 'BRIDGE_KHUDAFERIN_ARAZ',
    nameAz: 'Xudafərin Tarixi və Strateji Keçid Körpüsü (Araz Koridoru)',
    nameEn: 'Khudaferin Historic & Strategic Transit Bridge (Horadiz-Agbend Corridor)',
    highwayCode: 'M-6 / Zəngəzur Dəhlizi Avtomobil Yolu (km 112)',
    locationAz: 'Cəbrayıl rayonu, Xudafərin kəndi, Araz çayı sahili',
    bridgeType: 'REINFORCED_ARCH',
    totalLengthMeters: 420,
    mainSpanMeters: 90,
    pylonHeightMeters: 0,
    lanesCount: 4,
    maxPermissibleAxleLoadTonnes: 10.0,
    maxPermissibleGrossWeightTonnes: 40.0,
    fbgSensorCount: 72,
    accelerometerCount: 14,
    cableStayCount: 0,
    wimStationCode: 'WIM-KHUDAFERIN-04',
    dailyTrafficAadt: 14500,
    aaydaRegionalDivision: 'AAYDA Qarabağ Regional Magistral Körpülər İdarəsi',
  },
  BRIDGE_GANJA_CHAY_BYPASS: {
    id: 'BRIDGE_GANJA_CHAY_BYPASS',
    nameAz: 'Gəncəçay Asma Viyaduku (M-2 Bakı-Qazax-Gürcüstan Magistralı)',
    nameEn: 'Ganja River Cable-Stayed Bypass Viaduct (M-2 Highway)',
    highwayCode: 'M-2 Magistralı (km 368, Gəncə dairəvi)',
    locationAz: 'Gəncə şəhəri, Gəncəçay kanyonu keçidi',
    bridgeType: 'CABLE_STAYED',
    totalLengthMeters: 780,
    mainSpanMeters: 280,
    pylonHeightMeters: 85,
    lanesCount: 4,
    maxPermissibleAxleLoadTonnes: 11.5,
    maxPermissibleGrossWeightTonnes: 44.0,
    fbgSensorCount: 88,
    accelerometerCount: 16,
    cableStayCount: 64,
    wimStationCode: 'WIM-GANJA-05',
    dailyTrafficAadt: 36200,
    aaydaRegionalDivision: 'AAYDA 24 saylı Gəncə Yol İstismarı İdarəsi',
  },
  BRIDGE_ZAFAR_DASHALTI_SHUSHA: {
    id: 'BRIDGE_ZAFAR_DASHALTI_SHUSHA',
    nameAz: 'Zəfər Yolu Daşaltı Dərəsi Hündür Viyaduku (Füzuli-Şuşa)',
    nameEn: 'Zafar Road Dashalti Gorge High Viaduct (Fuzuli-Shusha Pass)',
    highwayCode: 'Zəfər Yolu / Daşaltı Keçidi (km 84)',
    locationAz: 'Şuşa rayonu, Daşaltı kəndi, dağlıq dərə keçidi',
    bridgeType: 'HIGH_PIER_VIADUCT',
    totalLengthMeters: 520,
    mainSpanMeters: 140,
    pylonHeightMeters: 68,
    lanesCount: 2,
    maxPermissibleAxleLoadTonnes: 10.0,
    maxPermissibleGrossWeightTonnes: 40.0,
    fbgSensorCount: 80,
    accelerometerCount: 20,
    cableStayCount: 0,
    wimStationCode: 'WIM-DASHALTI-06',
    dailyTrafficAadt: 9800,
    aaydaRegionalDivision: 'AAYDA Xankəndi & Şuşa Yol İdarəsi',
  },
};

/**
 * Real-Time Bridge SCADA Structural Alert Status
 */
export type BridgeAlertStatus =
  | 'STATUS_NOMINAL_GREEN'
  | 'STATUS_ADVISORY_AMBER'
  | 'STATUS_RESTRICTED_ORANGE'
  | 'STATUS_EMERGENCY_RED';

export interface BridgeTelemetryState {
  microstrainFbg: number; // Fiber-Optic Bragg Grating microstrain με
  cableTensionKn: number; // Dynamic stay cable tension kN
  groundAccelerationGal: number; // Triaxial PGA (cm/s² or Gal)
  deckModalFrequencyHz: number; // Deck vibration natural modal frequency Hz
  dynamicAmplificationFactor: number; // Dynamic amplification factor DAF
  windSpeedMs: number; // Anemometer wind speed m/s
  jointExpansionDisplacementMm: number; // Thermal expansion joint movement mm
  activeVehiclesOnSpan: number;
}

export interface BridgeHealthEvaluation {
  alertStatus: BridgeAlertStatus;
  healthScorePercent: number;
  diagnostics: {
    parameter: string;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    valueStr: string;
    legalLimitStr: string;
    noteAz: string;
  }[];
  recommendedSpeedKmH: number;
  barrierClosed: boolean;
}

/**
 * Structural Health Evaluation Function
 */
export const evaluateStructuralHealth = (
  telemetry: BridgeTelemetryState,
  bridge: BridgeStructuralInfo
): BridgeHealthEvaluation => {
  const diagnostics: BridgeHealthEvaluation['diagnostics'] = [];
  let deduction = 0;

  // 1. FBG Fiber-Optic Strain (Nominal 50-350 με, Warning > 450 με, Critical > 650 με)
  let strainStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (telemetry.microstrainFbg > 650) {
    strainStatus = 'CRITICAL';
    deduction += 35;
  } else if (telemetry.microstrainFbg > 450) {
    strainStatus = 'WARNING';
    deduction += 15;
  }
  diagnostics.push({
    parameter: 'Optik Lifli Gərginlik Deformasiyası (FBG Microstrain)',
    status: strainStatus,
    valueStr: `${telemetry.microstrainFbg.toFixed(1)} με`,
    legalLimitStr: '< 450.0 με (Limit: 650 με)',
    noteAz:
      strainStatus === 'NORMAL'
        ? 'Dəmir-beton və polad aşırımında elastik deformasiya normativ hədlərdədir.'
        : strainStatus === 'WARNING'
        ? 'Aşırım qutusunda yüksək gərginlik qeydə alındı - sürət rejimi azaldılmalıdır.'
        : 'Kritik qalıq plastik deformasiya təhlükəsi! Aşırımın bağlanması tələb olunur.',
  });

  // 2. Stay Cable Dynamic Tension (Nominal 600 - 2200 kN, Warning > 2600 kN, Critical > 3200 kN)
  if (bridge.cableStayCount > 0) {
    let cableStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (telemetry.cableTensionKn > 3200) {
      cableStatus = 'CRITICAL';
      deduction += 30;
    } else if (telemetry.cableTensionKn > 2600) {
      cableStatus = 'WARNING';
      deduction += 15;
    }
    diagnostics.push({
      parameter: 'Asma Vant Dinamik Gərilmə Gücü (Cable-Stay Tension)',
      status: cableStatus,
      valueStr: `${telemetry.cableTensionKn.toFixed(0)} kN`,
      legalLimitStr: '< 2600 kN (Limit: 3200 kN)',
      noteAz:
        cableStatus === 'NORMAL'
          ? 'Vant polad troslarında gərilmə paylanması simmetrik və təhlükəsizdir.'
          : cableStatus === 'WARNING'
          ? 'Qeyri-bərabər vant dartılması - rezonans əleyhinə dempferlər işə salınır.'
          : 'Kritik vant ifrat gərilməsi! Trosların qırılma ehtimalı yüksəkdir.',
    });
  }

  // 3. Triaxial Seismic Ground Acceleration (PGA Gal: < 15 gal normal, 15-50 gal tremor, > 50 gal earthquake alert)
  let seismicStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (telemetry.groundAccelerationGal > 50) {
    seismicStatus = 'CRITICAL';
    deduction += 40;
  } else if (telemetry.groundAccelerationGal > 15) {
    seismicStatus = 'WARNING';
    deduction += 15;
  }
  diagnostics.push({
    parameter: '3-Oxlu Seysmik Təcil (Triaxial Peak Ground Acceleration - Gal)',
    status: seismicStatus,
    valueStr: `${telemetry.groundAccelerationGal.toFixed(1)} Gal (cm/s²)`,
    legalLimitStr: '< 15.0 Gal (Limit: 50.0 Gal)',
    noteAz:
      seismicStatus === 'NORMAL'
        ? 'Mikroseysmik fon stabildir, tektonik tərpəniş aşkar edilməyib.'
        : seismicStatus === 'WARNING'
        ? 'Zəif və orta maqnitudalı seysmik vibrasiya qeydə alınır - SHM aktiv izləmədə.'
        : 'FHN Təcili Seysmik Həyəcan Rejimi! Güclü zəlzələ təcili aşkarlandı.',
  });

  // 4. Anemometer Wind Speed (Nominal < 15 m/s, Warning 15-25 m/s, Critical > 25 m/s)
  let windStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (telemetry.windSpeedMs > 25) {
    windStatus = 'CRITICAL';
    deduction += 25;
  } else if (telemetry.windSpeedMs > 15) {
    windStatus = 'WARNING';
    deduction += 10;
  }
  diagnostics.push({
    parameter: 'Aeroelastik Külək Sürəti və Qasırğa Təzyiqi (Anemometer Wind Speed)',
    status: windStatus,
    valueStr: `${telemetry.windSpeedMs.toFixed(1)} m/s (${(telemetry.windSpeedMs * 3.6).toFixed(0)} km/s)`,
    legalLimitStr: '< 15.0 m/s (Limit: 25.0 m/s)',
    noteAz:
      windStatus === 'NORMAL'
        ? 'Yan külək təzyiqi aerodinamik dayanıqlıq hədləri daxilindədir.'
        : windStatus === 'WARNING'
        ? 'Güclü yan külək xəbərdarlığı - tentli yük maşınları və hündür avtobuslar üçün sürət azaldılır.'
        : 'Qasırğa və burulğan həyəcanı! Körpü üzərində hərəkət tam dayandırılmalıdır.',
  });

  // 5. Thermal Expansion Joint Movement (-40 to +60 mm nominal, > 75 mm warning, > 90 mm critical)
  let jointStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  const absJoint = Math.abs(telemetry.jointExpansionDisplacementMm);
  if (absJoint > 90) {
    jointStatus = 'CRITICAL';
    deduction += 20;
  } else if (absJoint > 75) {
    jointStatus = 'WARNING';
    deduction += 10;
  }
  diagnostics.push({
    parameter: 'Temperatur Genişlənmə Dərzinin Yerdəyişməsi (Expansion Joint Displacement)',
    status: jointStatus,
    valueStr: `${telemetry.jointExpansionDisplacementMm > 0 ? '+' : ''}${telemetry.jointExpansionDisplacementMm.toFixed(1)} mm`,
    legalLimitStr: '±75.0 mm (Limit: ±90.0 mm)',
    noteAz:
      jointStatus === 'NORMAL'
        ? 'Temperatur dərzlərinin hərəkət diapazonu mövsümi deformasiyaya uyğundur.'
        : jointStatus === 'WARNING'
        ? 'Dərz yerdəyişməsi həddə yaxınlaşır - neopren qoruyucu yastıqları yoxlayın.'
        : 'Dərz mexanizmi ilişmə və ya ifrat açılma həddindədir! Zərbə riski mövcuddur.',
  });

  const healthScorePercent = Math.max(0, 100 - deduction);

  let alertStatus: BridgeAlertStatus = 'STATUS_NOMINAL_GREEN';
  let recommendedSpeedKmH = 90;
  let barrierClosed = false;

  if (
    strainStatus === 'CRITICAL' ||
    seismicStatus === 'CRITICAL' ||
    windStatus === 'CRITICAL' ||
    jointStatus === 'CRITICAL' ||
    healthScorePercent < 55
  ) {
    alertStatus = 'STATUS_EMERGENCY_RED';
    recommendedSpeedKmH = 0;
    barrierClosed = true;
  } else if (
    strainStatus === 'WARNING' &&
    (windStatus === 'WARNING' || seismicStatus === 'WARNING')
  ) {
    alertStatus = 'STATUS_RESTRICTED_ORANGE';
    recommendedSpeedKmH = 40;
    barrierClosed = false;
  } else if (
    strainStatus === 'WARNING' ||
    windStatus === 'WARNING' ||
    seismicStatus === 'WARNING' ||
    jointStatus === 'WARNING' ||
    healthScorePercent < 80
  ) {
    alertStatus = 'STATUS_ADVISORY_AMBER';
    recommendedSpeedKmH = 60;
    barrierClosed = false;
  }

  return {
    alertStatus,
    healthScorePercent,
    diagnostics,
    recommendedSpeedKmH,
    barrierClosed,
  };
};

/**
 * Heavy Vehicle Axle & Weigh-in-Motion (WIM) Compliance Classifications
 */
export type BridgeVehicleClass =
  | 'CLASS_1_PASSENGER'
  | 'CLASS_2_LIGHT_COMMERCIAL'
  | 'CLASS_3_BUS_COACH'
  | 'CLASS_4_RIGID_TRUCK'
  | 'CLASS_5_SEMI_TRAILER'
  | 'CLASS_6_OVERSIZE_HEAVY';

export interface BridgeVehicleClassConfig {
  id: BridgeVehicleClass;
  titleAz: string;
  titleEn: string;
  defaultAxleCount: number;
  maxGrossWeightTonnes: number;
  baseBridgeTollAzn: number;
}

export const BRIDGE_VEHICLE_CONFIGS: Record<BridgeVehicleClass, BridgeVehicleClassConfig> = {
  CLASS_1_PASSENGER: {
    id: 'CLASS_1_PASSENGER',
    titleAz: 'Kateqoriya 1: Minik avtomobilləri və mikroavtobuslar (≤ 3.5 t)',
    titleEn: 'Category 1: Passenger Cars & Vans (≤ 3.5 t)',
    defaultAxleCount: 2,
    maxGrossWeightTonnes: 3.5,
    baseBridgeTollAzn: 0.0, // Free for light passenger
  },
  CLASS_2_LIGHT_COMMERCIAL: {
    id: 'CLASS_2_LIGHT_COMMERCIAL',
    titleAz: 'Kateqoriya 2: Yüngül ticari və çatdırılma maşınları (3.5 - 7.5 t)',
    titleEn: 'Category 2: Light Commercial Delivery Trucks (3.5 - 7.5 t)',
    defaultAxleCount: 2,
    maxGrossWeightTonnes: 7.5,
    baseBridgeTollAzn: 2.0,
  },
  CLASS_3_BUS_COACH: {
    id: 'CLASS_3_BUS_COACH',
    titleAz: 'Kateqoriya 3: Sərnişin və şəhərlərarası avtobuslar (2-3 ox, ≤ 18 t)',
    titleEn: 'Category 3: Intercity Coaches & Transit Buses (2-3 axles, ≤ 18 t)',
    defaultAxleCount: 3,
    maxGrossWeightTonnes: 18.0,
    baseBridgeTollAzn: 5.0,
  },
  CLASS_4_RIGID_TRUCK: {
    id: 'CLASS_4_RIGID_TRUCK',
    titleAz: 'Kateqoriya 4: Üç-oxlu tək gövdəli ağır yük maşını (≤ 26 t)',
    titleEn: 'Category 4: 3-Axle Rigid Heavy Cargo Truck (≤ 26 t)',
    defaultAxleCount: 3,
    maxGrossWeightTonnes: 26.0,
    baseBridgeTollAzn: 10.0,
  },
  CLASS_5_SEMI_TRAILER: {
    id: 'CLASS_5_SEMI_TRAILER',
    titleAz: 'Kateqoriya 5: 5-oxlu beynəlxalq tır və yarımqoşqu (≤ 40 t)',
    titleEn: 'Category 5: 5-Axle Articulated Semi-Trailer TIR (≤ 40 t)',
    defaultAxleCount: 5,
    maxGrossWeightTonnes: 40.0,
    baseBridgeTollAzn: 20.0,
  },
  CLASS_6_OVERSIZE_HEAVY: {
    id: 'CLASS_6_OVERSIZE_HEAVY',
    titleAz: 'Kateqoriya 6: İriqabaritli və xüsusi ağırçəkili avtoqatar (> 40 t)',
    titleEn: 'Category 6: Special Oversize & Heavy Multi-Axle Transporter (> 40 t)',
    defaultAxleCount: 7,
    maxGrossWeightTonnes: 60.0,
    baseBridgeTollAzn: 45.0,
  },
};

export interface BridgeTransitFeeCalculation {
  vehicleClass: BridgeVehicleClass;
  grossWeightTonnes: number;
  axleCount: number;
  maxSingleAxleWeightTonnes: number;
  bridgeLegalAxleLimitTonnes: number;
  bridgeLegalGrossLimitTonnes: number;
  isAxleOverloaded: boolean;
  isGrossOverloaded: boolean;
  excessAxleTonnes: number;
  excessGrossTonnes: number;
  baseBridgeTollAzn: number;
  overweightPenaltyAzn: number;
  escortFeeAzn: number;
  totalFeeAzn: number;
  totalFeeConverted: number;
  transitPermitted: boolean;
  rejectionReasonAz?: string;
}

/**
 * Calculate Bridge Transit Tariff & Overweight Penalties
 * Statutory formula adhering to Cabinet of Ministers Resolution No. 104:
 * - Base toll per vehicle category
 * - Overweight penalty: 15 AZN per excess tonne over permissible axle / gross limit
 * - Escort fee: 50 AZN if vehicle is > 20% overweight or gross > 44t
 */
export const calculateBridgeTransitFee = (
  vehicleClass: BridgeVehicleClass,
  grossWeightTonnes: number,
  axleCount: number,
  maxSingleAxleWeightTonnes: number,
  bridge: BridgeStructuralInfo,
  currency: Currency
): BridgeTransitFeeCalculation => {
  const config = BRIDGE_VEHICLE_CONFIGS[vehicleClass];
  const bridgeLegalAxle = bridge.maxPermissibleAxleLoadTonnes;
  const bridgeLegalGross = bridge.maxPermissibleGrossWeightTonnes;

  const excessAxleTonnes = Math.max(0, maxSingleAxleWeightTonnes - bridgeLegalAxle);
  const excessGrossTonnes = Math.max(0, grossWeightTonnes - bridgeLegalGross);

  const isAxleOverloaded = excessAxleTonnes > 0;
  const isGrossOverloaded = excessGrossTonnes > 0;

  let baseBridgeTollAzn = config.baseBridgeTollAzn;
  let overweightPenaltyAzn = 0;
  let escortFeeAzn = 0;
  let transitPermitted = true;
  let rejectionReasonAz: string | undefined;

  // Severe Overload check (> 30% axle overload or > 65 tonnes gross weight without AAYDA special permit)
  if (excessAxleTonnes > 3.5 || grossWeightTonnes > 65) {
    transitPermitted = false;
    rejectionReasonAz =
      'Körpünün struktur təhlükəsizliyi səbəbindən hərəkət qadağandır! Ox yükü və ya ümumi çəki kritik həddi aşır (Nazirlər Kabinetinin 104 saylı Qərarı).';
  }

  if (isAxleOverloaded || isGrossOverloaded) {
    const chargeableExcess = Math.max(excessAxleTonnes * axleCount, excessGrossTonnes);
    overweightPenaltyAzn = chargeableExcess * 15.0; // 15 AZN per excess tonne

    if (excessAxleTonnes > 1.5 || grossWeightTonnes > 44) {
      escortFeeAzn = 50.0; // BDYP escort fee
    }
  }

  const totalFeeAzn = baseBridgeTollAzn + overweightPenaltyAzn + escortFeeAzn;
  const totalFeeConverted = convertAzn(totalFeeAzn, currency);

  return {
    vehicleClass,
    grossWeightTonnes,
    axleCount,
    maxSingleAxleWeightTonnes,
    bridgeLegalAxleLimitTonnes: bridgeLegalAxle,
    bridgeLegalGrossLimitTonnes: bridgeLegalGross,
    isAxleOverloaded,
    isGrossOverloaded,
    excessAxleTonnes,
    excessGrossTonnes,
    baseBridgeTollAzn,
    overweightPenaltyAzn,
    escortFeeAzn,
    totalFeeAzn,
    totalFeeConverted,
    transitPermitted,
    rejectionReasonAz,
  };
};

/**
 * 10-Point Bridge Structural Integrity & Engineering Checklist
 */
export interface BridgeChecklistItem {
  id: string;
  categoryAz: string;
  titleAz: string;
  requirementAz: string;
  statutoryReference: string;
  criticalSeverity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const BRIDGE_SAFETY_CHECKLIST: BridgeChecklistItem[] = [
  {
    id: 'CHK_FBG_STRAIN',
    categoryAz: 'Optik Sensorlar',
    titleAz: 'Fiber Bragg Grating (FBG) Lifli Gərginlik Sensorlarının Kalibrasiyası',
    requirementAz: 'Bütün aşırımlarda quraşdırılmış optik lifli tenzometrlərin dalğa uzunluğu sürüşməsi (pm) sıfırlanmalı və dinamik həssaslığı yoxlanmalıdır.',
    statutoryReference: 'AZS 410 / Eurocode EN 1991-2',
    criticalSeverity: 'HIGH',
  },
  {
    id: 'CHK_ACCEL_TRIAXIAL',
    categoryAz: 'Seysmik Telemetriya',
    titleAz: '3-Oxlu Seysmo-Akselerometrlərin və Qeydedici Blokların Hazırlığı',
    requirementAz: 'Pilon başında və dayaq fundamentlərində quraşdırılmış piezoelektrik seysmik sensorların 0.1-50 Hz tezlik diapazonu və PGA siqnalı aktiv olmalıdır.',
    statutoryReference: 'FHN Seysmik Təhlükəsizlik Reqlamenti',
    criticalSeverity: 'HIGH',
  },
  {
    id: 'CHK_CABLE_STAY',
    categoryAz: 'Vant Sistemi',
    titleAz: 'Asma Polad Vantların Titrəmə Frekansı və Dinamik Dartılma Nəzarəti',
    requirementAz: 'Vant troslarının rezonans tezliyi (Hz) və hidravlik kəlbətinlərlə dartılma gərginliyi (kN) 2.5 təhlükəsizlik əmsalından aşağı olmamalıdır.',
    statutoryReference: 'FIB Bulletin 89 / AASHTO LRFD',
    criticalSeverity: 'HIGH',
  },
  {
    id: 'CHK_HS_WIM',
    categoryAz: 'Çəki Nəzarəti',
    titleAz: 'Yüksək Sürətli Weigh-in-Motion (HS-WIM) Pyezo-Kvars Sensorları',
    requirementAz: 'Hərəkət zolaqlarındakı WIM kvars sensorlarının ox çəkisini ±3% dəqiqliklə ölçməsi və BDYP sisteminə ötürməsi təmin edilməlidir.',
    statutoryReference: 'NK-nin 104 saylı Qərarı / COST 323 Standartı',
    criticalSeverity: 'HIGH',
  },
  {
    id: 'CHK_EXPANSION_JOINTS',
    categoryAz: 'Deformasiya Dərzləri',
    titleAz: 'Modul Tipli Temperatur Dərzləri və Neopren Hidroizolyasiya Qatı',
    requirementAz: 'Temperatur dilatasiya dərzlərinin hərəkət boşluğu təmizlənməli, elastomer sukeçirməz membranlarda cırılma və ya ilişmə olmamalıdır.',
    statutoryReference: 'AAYDA Körpülərin İstismarı Təlimatı',
    criticalSeverity: 'MEDIUM',
  },
  {
    id: 'CHK_WIND_ANEMOMETER',
    categoryAz: 'Meteorologiya',
    titleAz: 'Ultrasonik Anemometr və Yan Külək Şiddəti Xəbərdarlıq Tabloları',
    requirementAz: 'Körpü üstündə 10 metrlik dirəklərdəki külək sensorları külək həddi 15 m/s-dən çox olduqda VMS elektron tablolarına avtomatik bildiriş göndərməlidir.',
    statutoryReference: 'Yol hərəkəti haqqında Qanun, Maddə 53',
    criticalSeverity: 'MEDIUM',
  },
  {
    id: 'CHK_BEARING_PADS',
    categoryAz: 'Dayaq Hissələri',
    titleAz: 'Sferik və Elastomer Dayayıcı Yastıqların (Pot Bearings) İnspeksiyası',
    requirementAz: 'Dayaq başlıqlarında yerləşən polad-teflon və rezin dayaq yastıqlarının çökmə və bucaq fırlanma dərəcələri lazer skanerlə yoxlanmalıdır.',
    statutoryReference: 'EN 1337 Körpü Dayaq Standartı',
    criticalSeverity: 'HIGH',
  },
  {
    id: 'CHK_DRAINAGE_SCOUR',
    categoryAz: 'Hidrologiya & Drenaj',
    titleAz: 'Çay və Dəniz Dayaqlarının Yuyulma (Scour) və Drenaj Borularının Yoxlanması',
    requirementAz: 'Körpü təməlinin ətrafında su dibi aşınması (sonar ölçmə) və körpü göyərtəsindən yağış sularının neft ayıranlara axıdılması saz olmalıdır.',
    statutoryReference: 'ETSN & AAYDA Ekoloji Reqlament',
    criticalSeverity: 'MEDIUM',
  },
  {
    id: 'CHK_BARRIER_LIGHTING',
    categoryAz: 'Yol İnfrastrukturu',
    titleAz: 'H1/H2 Qəza Baryerləri, LED İşıqlandırma və Pilon Naviqasiya Siqnalları',
    requirementAz: 'Ağır zərbəyə davamlı deformasiyalanan yan polad məhəccərlər və aviasiya/gəmiçilik üçün pilon xəbərdarlıq qırmızı mayakları işlək olmalıdır.',
    statutoryReference: 'EN 1317 Qoruyucu Baryer Standartı',
    criticalSeverity: 'LOW',
  },
  {
    id: 'CHK_EMERGENCY_SCADA',
    categoryAz: 'Təcili Əlaqə & SCADA',
    titleAz: 'FHN 112 və BDYP ilə Avtomatik Fövqəladə Bariyer Kilidləmə İnteqrasiyası',
    requirementAz: 'Kritik seysmik və ya aeroelastik dalğalanma zamanı körpüyə giriş şlaqbaumlarının SCADA tərəfindən 3 saniyə ərzində avtomatik bağlanması.',
    statutoryReference: 'FHN Mülki Müdafiə Tələbləri',
    criticalSeverity: 'HIGH',
  },
];

export const evaluateBridgeChecklist = (
  checkedItemIds: string[]
): {
  scorePercent: number;
  passed: boolean;
  missingMandatoryCount: number;
} => {
  const totalCount = BRIDGE_SAFETY_CHECKLIST.length;
  const checkedCount = checkedItemIds.length;
  const scorePercent = Math.round((checkedCount / totalCount) * 100);

  const missingMandatory = BRIDGE_SAFETY_CHECKLIST.filter(
    (item) => item.criticalSeverity === 'HIGH' && !checkedItemIds.includes(item.id)
  );

  return {
    scorePercent,
    passed: scorePercent >= 80 && missingMandatory.length === 0,
    missingMandatoryCount: missingMandatory.length,
  };
};

/**
 * 10-Question Civil & Bridge Engineering Safety Exam Simulator
 */
export interface BridgeExamQuestion {
  id: number;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
}

export const BRIDGE_EXAM_QUESTIONS: BridgeExamQuestion[] = [
  {
    id: 1,
    questionAz:
      'Azərbaycan Respublikasının Nazirlər Kabinetinin 104 saylı Qərarına əsasən, ümumi istifadədə olan avtomobil yollarında tək aparıcı ox üçün icazə verilən maksimum normativ ox yükü nə qədərdir?',
    optionsAz: ['8.0 ton', '10.0 ton', '11.5 ton', '14.0 ton'],
    correctOptionIndex: 2,
    explanationAz:
      'Respublika ərazisində beynəlxalq və respublika əhəmiyyətli yollarda və müasir körpülərdə tək aparıcı ox üçün icazə verilən ən yüksək yük həddi 11.5 tondur.',
  },
  {
    id: 2,
    questionAz:
      'Asma və vantlı körpülərdə quraşdırılan Fiber Bragg Grating (FBG) sensorlarının əsas təyinatı nədir?',
    optionsAz: [
      'Asfaltın rəng tonunu və parlaqlığını analiz etmək',
      'Optik lif daxilində dalğa uzunluğu dəyişikliyi ilə mikrodeformasiya (microstrain) və temperaturu ölçmək',
      'Avtomobillərin qeydiyyat nömrələrini oxumaq',
      'Körpünün altında balıqların hərəkətini izləmək',
    ],
    correctOptionIndex: 1,
    explanationAz:
      'FBG sensorları optik liflərdə işığın Bragg dalğa uzunluğunun sürüşməsi əsasında körpü konstruksiyasının dartılma və sıxılma mikrodeformasiyalarını (με) yüksək dəqiqliklə ölçür.',
  },
  {
    id: 3,
    questionAz:
      'Dinamik Artım Əmsalı (Dynamic Amplification Factor - DAF) körpü mühəndisliyində nəyi xarakterizə edir?',
    optionsAz: [
      'Körpünün tikintisi üçün xərclənən büdcə artımını',
      'Hərəkətdə olan təkərlərin zərbə və titrəməsi nəticəsində dinamik gərginliyin statik yükə olan nisbətini',
      'Körpüdən keçən sərnişinlərin orta gediş haqqını',
      'Körpünün illik aşınma faizini',
    ],
    correctOptionIndex: 1,
    explanationAz:
      'DAF hərəkət edən nəqliyyat vasitəsinin yaratdığı dinamik təsirlərin statik ağırlığa olan nisbətidir (adətən 1.10 - 1.35 aralığında dəyişir).',
  },
  {
    id: 4,
    questionAz:
      'Körpülərdə 3-oxlu seysmik akselerometrlə ölçülən təcil (PGA) hansı vahidlə ifadə olunur və zəlzələ təhlükəsi hansı həddən başlayır?',
    optionsAz: [
      'Litrlə; 5 litrdən',
      'Gal (cm/s²); 15 Gal-dan yuxarı təkanlar aktiv izləməyə, 50 Gal-dan yuxarı həyəcan vəziyyətinə səbəb olur',
      'Bar; 100 bardan',
      'Dərəcə Selsi; 45°C-dən',
    ],
    correctOptionIndex: 1,
    explanationAz:
      'Peak Ground Acceleration (PGA) Gal (1 Gal = 1 cm/s²) vahidi ilə ölçülür. 50 Gal-dan yuxarı qeydə alınan təcillər körpünün fövqəladə rejimə keçməsini tələb edir.',
  },
  {
    id: 5,
    questionAz:
      'Körpülərdə aeroelastik qeyri-sabitlik (Flutter) və Karman burulğanları nə zaman yaranır?',
    optionsAz: [
      'Gecə vaxtı havanın temperaturu -20°C-yə düşəndə',
      'Küləyin sürəti kritik aerodinamik həddi aşdıqda və aşırımın titrəmə tezliyi ilə üst-üstə düşdükdə',
      'Yalnız elektrikli avtomobillər hərəkət etdikdə',
      'Körpü üzərində su yığıldıqda',
    ],
    correctOptionIndex: 1,
    explanationAz:
      'Aeroelastik dalğalanma və flutter güclü yan küləklərin körpü aşırımı ətrafında burulğanlar yaradaraq konstruksiyanın məxsusi tezliyi ilə rezonansa girməsi nəticəsində baş verir.',
  },
  {
    id: 6,
    questionAz:
      'High-Speed Weigh-in-Motion (HS-WIM) sisteminin ənənəvi stasionar tərəzilərdən əsas fərqi nədir?',
    optionsAz: [
      'Yalnız velosipedləri çəkə bilməsi',
      'Nəqliyyat vasitəsi magistral sürətlə (60-110 km/s) hərəkət edərkən ox yüklərini və ümumi kütləni dərhal ölçməsi',
      'Çəki ölçmək üçün avtomobilin tam dayanmasının tələb olunması',
      'Məlumatları internet olmadan kağıza çap etməsi',
    ],
    correctOptionIndex: 1,
    explanationAz:
      'HS-WIM asfalt qatına yerləşdirilmiş pyezo-kvars sensorlar vasitəsilə nəqliyyat axınını saxlamadan yüksək sürətdə ox və təkər kütlələrini qeydə alır.',
  },
  {
    id: 7,
    questionAz:
      '"Yol hərəkəti haqqında" Qanuna əsasən, körpülər və estakadalar üzərində hansı manevr qəti şəkildə qadağandır?',
    optionsAz: [
      'Sağ zolaqla müəyyən edilmiş sürətlə hərəkət etmək',
      'Geri dönmə, geriyə hərəkət və dayanma-durma',
      'Faraları yandırmaq',
      'Təhlükəsizlik kəmərini taxmaq',
    ],
    correctOptionIndex: 1,
    explanationAz:
      'Maddə 52 və 53-ə əsasən, körpülər, viyaduklar, estakadalar və onların altındakı keçidlərdə geriyə hərəkət, geri dönmə və nəqliyyat vasitələrinin dayanması və durması qadağandır.',
  },
  {
    id: 8,
    questionAz:
      'Vantlı körpülərdə rezonans titrəmələrini və külək-yağış təsirlərini neytrallaşdırmaq üçün hansı mühəndis qurğularından istifadə olunur?',
    optionsAz: [
      'Viskoz və köndələn daxili dempferlər (TMD - Tuned Mass Dampers)',
      'Plastik köpük lövhələri',
      'Səs gücləndirici dinamiklər',
      'Taxta dirəklər',
    ],
    correctOptionIndex: 0,
    explanationAz:
      'Vantların mexaniki rəqslərini söndürmək üçün pilon və aşırım bərkitmə nöqtələrində hidravlik və viskoz dempferlər quraşdırılır.',
  },
  {
    id: 9,
    questionAz:
      'Körpünün temperatur deformasiya dərzlərinin (Expansion Joints) əsas funksiyası nədir?',
    optionsAz: [
      'Piyadaların keçidini çətinləşdirmək',
      'Mövsümi istiləşmə və soyuma zamanı körpü aşırımının uzunluq dəyişməsini kompensasiya etmək və dağılmanın qarşısını almaq',
      'Yalnız körpünün estetikasını yaxşılaşdırmaq',
      'Təkərlərin səsini artırmaq',
    ],
    correctOptionIndex: 1,
    explanationAz:
      'Termal dərzlər temperatur fərqlərindən yaranan xətti genişlənmə və yığılma gərginliklərini təhlükəsiz şəkildə udur.',
  },
  {
    id: 10,
    questionAz:
      'Fövqəladə Hallar Nazirliyi və AAYDA SCADA sistemində körpünün "STATUS_EMERGENCY_RED" rejiminə keçməsi hansı avtomatik tədbiri tələb edir?',
    optionsAz: [
      'Sürət həddini 120 km/s-ə qədər artırmaq',
      'Körpüyə giriş şlaqbaumlarının bağlanması, svetoforlarda qırmızı siqnalın yanması və BDYP patrulunun əraziyə göndərilməsi',
      'Körpünün işıqlarını tam söndürmək',
      'Yalnız yük maşınlarına icazə vermək',
    ],
    correctOptionIndex: 1,
    explanationAz:
      'Qırmızı qəza rejimində avtomatlaşdırılmış SCADA dərhal şlaqbaumları endirir, xəbərdarlıq tablolarda çıxış istiqamətini göstərir və bütün hərəkəti təcili dayandırır.',
  },
];

export const evaluateBridgeExam = (
  answers: Record<number, number>
): {
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercent: number;
  passed: boolean;
} => {
  const totalQuestions = BRIDGE_EXAM_QUESTIONS.length;
  let correctAnswersCount = 0;

  BRIDGE_EXAM_QUESTIONS.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      correctAnswersCount++;
    }
  });

  const scorePercent = Math.round((correctAnswersCount / totalQuestions) * 100);

  return {
    totalQuestions,
    correctAnswersCount,
    scorePercent,
    passed: scorePercent >= 80,
  };
};

/**
 * Official Bridge Clearance Certificate Generator
 */
export interface BridgeClearanceCertificate {
  certificateNumber: string;
  bridgeId: BridgeId;
  bridgeNameAz: string;
  vehiclePlate: string;
  vehicleClass: BridgeVehicleClass;
  grossWeightTonnes: number;
  maxAxleLoadTonnes: number;
  permittedSpeedKmH: number;
  trafficLaneAssigned: string;
  escortRequired: boolean;
  issueDate: string;
  expiryDate: string;
  simaSignatureUid: string;
  qrCodeData: string;
  complianceStatus: 'VERIFIED_ACTIVE' | 'REVOKED_OVERLOAD' | 'EXPIRED';
  inspectorCallsign: string;
  shmSafetyIndex: number;
}

export const generateBridgeCertificate = (
  bridgeId: BridgeId,
  vehiclePlate: string,
  vehicleClass: BridgeVehicleClass,
  grossWeightTonnes: number,
  maxAxleLoadTonnes: number,
  healthEvaluation: BridgeHealthEvaluation
): BridgeClearanceCertificate => {
  const bridge = STRATEGIC_BRIDGES[bridgeId];
  const serial = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `BRIDGE-SHM-AZ-2026-${serial}`;

  const now = new Date();
  const issueDate = now.toISOString().replace('T', ' ').substring(0, 19);

  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours transit validity
  const expiryDate = expiry.toISOString().replace('T', ' ').substring(0, 19);

  const hexHash = Math.abs(
    Array.from(certificateNumber + vehiclePlate + bridgeId).reduce(
      (acc, char) => (acc << 5) - acc + char.charCodeAt(0),
      0
    )
  )
    .toString(16)
    .toUpperCase()
    .padStart(8, '0');

  const simaSignatureUid = `SIMA-SHM-${hexHash}-AAYDA-GOV-AZ`;
  const qrCodeData = `https://aayda.gov.az/shm/verify?cert=${certificateNumber}&plate=${vehiclePlate}&bridge=${bridgeId}&hash=${hexHash}`;

  const isOverload =
    maxAxleLoadTonnes > bridge.maxPermissibleAxleLoadTonnes ||
    grossWeightTonnes > bridge.maxPermissibleGrossWeightTonnes;

  const complianceStatus: BridgeClearanceCertificate['complianceStatus'] =
    healthEvaluation.alertStatus === 'STATUS_EMERGENCY_RED' || isOverload
      ? 'REVOKED_OVERLOAD'
      : 'VERIFIED_ACTIVE';

  const escortRequired = maxAxleLoadTonnes > bridge.maxPermissibleAxleLoadTonnes + 1.0;

  return {
    certificateNumber,
    bridgeId,
    bridgeNameAz: bridge.nameAz,
    vehiclePlate: vehiclePlate.toUpperCase(),
    vehicleClass,
    grossWeightTonnes,
    maxAxleLoadTonnes,
    permittedSpeedKmH: healthEvaluation.recommendedSpeedKmH,
    trafficLaneAssigned:
      vehicleClass === 'CLASS_5_SEMI_TRAILER' || vehicleClass === 'CLASS_6_OVERSIZE_HEAVY'
        ? 'Zolaq 1 (Kənar sağ zolaq - ağır tonnaj)'
        : 'Zolaq 2 & 3 (Orta sürət zolağı)',
    escortRequired,
    issueDate,
    expiryDate,
    simaSignatureUid,
    qrCodeData,
    complianceStatus,
    inspectorCallsign: 'AAYDA-SHM-BAKU-DISPATCH-07',
    shmSafetyIndex: healthEvaluation.healthScorePercent,
  };
};
