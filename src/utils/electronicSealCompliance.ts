/**
 * Official State Customs Committee (DGK), Azerbaijan Land Transport Agency (AYNA) &
 * State Traffic Police Department of MIA (BDYP)
 * Electronic Intelligent GPS Transit Seal (Gömrük Elektron İntellektual Plomb / GPS E-Lock İzləmə Sistemi),
 * Transit Corridor Geofencing, Cargo Tamper Telemetry & Official E-SEAL-AZ-2026 Transit Integrity Compliance Engine
 *
 * Adheres to:
 * - Customs Code of the Republic of Azerbaijan ("Azərbaycan Respublikasının Gömrük Məcəlləsi", Maddə 184-210, 230:
 *   Gömrük təminatı vasitələri, elektron nəzarət və beynəlxalq tranzit qaydaları)
 * - Law of the Republic of Azerbaijan "On Road Traffic" ("Yol hərəkəti haqqında" AR Qanunu, Maddə 37, 53)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 499, 501:
 *   Gömrük təminatı vasitələrinin (plombların) qəsdən zədələnməsi, qırılması və ya müəyyən edilmiş tranzit
 *   marşrutundan əsassız kənara çıxmaya görə cərimələr: 500 - 1500 AZN)
 * - ISO 17712 High-Security Mechanical & Electronic Freight Container Seals Specification
 * - UNECE Customs Convention on the International Transport of Goods under Cover of TIR Carnets (1975)
 * - WCO (World Customs Organization) SAFE Framework of Standards for Global Trade Security
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD (1.70 AZN / USD)
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR (1.84 AZN / EUR)
};

/**
 * Types of Electronic Transit Seals
 */
export type ElectronicSealType =
  | 'GPS_ELOCK_PREMIUM'      // Dual GNSS (GPS/BeiDou/GLONASS) + 4G LTE-M + Iridium Satellite Uplink + Fiber-optic wire loop
  | 'GPS_ELOCK_STANDARD'     // GPS/4G Cellular + High-tensile stainless steel wire loop + Accelerometer + Light sensor
  | 'RFID_HYBRID_LOCK'       // Active 433 MHz RFID + Cellular GSM beacon + Mechanical tamper micro-switch
  | 'MECHANICAL_BOLT_ISO17712'; // ISO 17712 High-Security Bolt Seal with embedded passive NFC/RFID chip

export interface ElectronicSealModelInfo {
  id: ElectronicSealType;
  modelCode: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  baseFeeAzn: number;
  batteryLifeDays: number;
  hasSatelliteUplink: boolean;
  hasOpticalFiberLoop: boolean;
  tamperResponseSec: number;
  descriptionAz: string;
}

export const ELECTRONIC_SEAL_SPECS: Record<ElectronicSealType, ElectronicSealModelInfo> = {
  GPS_ELOCK_PREMIUM: {
    id: 'GPS_ELOCK_PREMIUM',
    modelCode: 'DGK-ELOCK-PRO-X1',
    nameAz: 'Dual-Uplink GPS/Peyk İntellektual Elektron Plomb',
    nameEn: 'Dual-Uplink GPS/Satellite Intelligent E-Lock',
    nameRu: 'Интеллектуальная спутниковая/GPS электронная пломба',
    baseFeeAzn: 55,
    batteryLifeDays: 30,
    hasSatelliteUplink: true,
    hasOpticalFiberLoop: true,
    tamperResponseSec: 2,
    descriptionAz: 'Peyk və 4G LTE əlaqəli, optik-lif kabel ilməsi, işıq və zərbə sensorları ilə təchiz olunmuş yüksək riskli tranzit üçün e-plomb',
  },
  GPS_ELOCK_STANDARD: {
    id: 'GPS_ELOCK_STANDARD',
    modelCode: 'DGK-ELOCK-STD-S4',
    nameAz: 'Standart GPS/4G Şəbəkəli Elektron Plomb',
    nameEn: 'Standard GPS/4G Cellular Electronic Seal',
    nameRu: 'Стандартная сотовая GPS/4G электронная пломба',
    baseFeeAzn: 35,
    batteryLifeDays: 20,
    hasSatelliteUplink: false,
    hasOpticalFiberLoop: false,
    tamperResponseSec: 5,
    descriptionAz: 'Paslanmayan polad naqil ilməsi, 4G mobil rabitə və akkumulyator telemetriyası ilə standart tranzit konteynerləri üçün e-plomb',
  },
  RFID_HYBRID_LOCK: {
    id: 'RFID_HYBRID_LOCK',
    modelCode: 'DGK-RFID-HYBRID-R2',
    nameAz: 'Aktiv RFID və Qısa Məsafəli Şlüz Plombu',
    nameEn: 'Active RFID & Short-Range Gateway Seal',
    nameRu: 'Активная RFID гибридная электронная пломба',
    baseFeeAzn: 25,
    batteryLifeDays: 45,
    hasSatelliteUplink: false,
    hasOpticalFiberLoop: false,
    tamperResponseSec: 10,
    descriptionAz: 'Gömrük postları arasında qısa məsafəli (DSRC/RFID) və daxili gömrük terminalları üçün aktiv elektron nəzarət plombu',
  },
  MECHANICAL_BOLT_ISO17712: {
    id: 'MECHANICAL_BOLT_ISO17712',
    modelCode: 'DGK-BOLT-NFC-B1',
    nameAz: 'ISO 17712 Mexaniki Bolt Plomb (Passiv NFC/RFID Çipli)',
    nameEn: 'ISO 17712 High-Security Mechanical Bolt (NFC/RFID Chip)',
    nameRu: 'Механическая болтовая пломба ISO 17712 с чипом NFC/RFID',
    baseFeeAzn: 15,
    batteryLifeDays: 365,
    hasSatelliteUplink: false,
    hasOpticalFiberLoop: false,
    tamperResponseSec: 0,
    descriptionAz: 'Birdəfəlik polad bolt konstruksiyalı, ştrix-kod və daxili kriptoqrafik NFC identifikasiya çipi olan yüksək təhlükəsizlikli plomb',
  },
};

/**
 * Strategic Azerbaijan Transit Corridors with Geofencing
 */
export type TransitCorridorCode =
  | 'CORRIDOR_NORTH_SOUTH_M1_M3'     // Samur (RU) -> Baku/Alat -> Astara (IR) [510 km]
  | 'CORRIDOR_EAST_WEST_M2'          // Alat Port -> Ganja -> Red Bridge / Boyuk Kesik (GE) [503 km]
  | 'CORRIDOR_NORTH_WEST_M4_M5'      // Baku -> Shamakhi -> Yevlakh -> Sheki -> Mazimqara / Balakan (GE) [445 km]
  | 'CORRIDOR_SOUTHERN_M3_BILASUVAR' // Alat -> Salyan -> Bilasuvar (IR) [185 km]
  | 'CORRIDOR_ZANGEZUR_NAKHCHIVAN'   // Sadarak (TR) -> Nakhchivan -> Julfa (IR) [160 km]
  | 'CORRIDOR_BAKU_PORT_AFEZ';       // Alat Port -> AFEZ Bonded Zone -> Lokbatan Terminal [65 km]

export interface TransitCorridorInfo {
  code: TransitCorridorCode;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  entryPostAz: string;
  exitPostAz: string;
  distanceKm: number;
  standardTransitHours: number;
  maxAllowedHours: number;
  geofenceBufferMeters: number; // e.g. 1000m (±1 km tolerance from highway centerline)
  designatedStopsAz: string[];
}

export const TRANSIT_CORRIDORS: Record<TransitCorridorCode, TransitCorridorInfo> = {
  CORRIDOR_NORTH_SOUTH_M1_M3: {
    code: 'CORRIDOR_NORTH_SOUTH_M1_M3',
    nameAz: 'Şimal-Cənub Magistral Dəhlizi (M1 - M3)',
    nameEn: 'North-South Transit Corridor (M1 - M3)',
    nameRu: 'Транзитный коридор Север-Юг (M1 - M3)',
    entryPostAz: 'Samur Gömrük Postu (Qusar / Rusiya sərhədi)',
    exitPostAz: 'Astara Gömrük Postu (İran sərhədi)',
    distanceKm: 510,
    standardTransitHours: 8.5,
    maxAllowedHours: 24.0,
    geofenceBufferMeters: 1000,
    designatedStopsAz: [
      'Giləzi Beynəlxalq Yük Dayanacağı (M1)',
      'Ələt Azad İqtisadi Zona & Liman TIR Parkı',
      'Salyan Tranzit Nəqliyyat Terminalı (M3)',
    ],
  },
  CORRIDOR_EAST_WEST_M2: {
    code: 'CORRIDOR_EAST_WEST_M2',
    nameAz: 'Şərq-Qərb Trans-Xəzər Dəhlizi (M2 / Orta Dəhliz)',
    nameEn: 'East-West Middle Corridor (M2 / Middle Corridor)',
    nameRu: 'Транскаспийский коридор Восток-Запад (M2)',
    entryPostAz: 'Bakı Beynəlxalq Dəniz Ticarət Limanı (Ələt Ro-Pax)',
    exitPostAz: 'Qırmızı Körpü Gömrük Postu (Qazax / Gürcüstan)',
    distanceKm: 503,
    standardTransitHours: 8.0,
    maxAllowedHours: 24.0,
    geofenceBufferMeters: 1000,
    designatedStopsAz: [
      'Hacıqabul TIR Dayanacaq Mərkəzi',
      'Yevlax Avtovağzal Logistika Qovşağı',
      'Gəncə Dairəvi Yük Kompleksi',
    ],
  },
  CORRIDOR_NORTH_WEST_M4_M5: {
    code: 'CORRIDOR_NORTH_WEST_M4_M5',
    nameAz: 'Şimal-Qərb İpək Yolu Dəhlizi (M4 - M5)',
    nameEn: 'North-West Silk Road Corridor (M4 - M5)',
    nameRu: 'Северо-Западный шелковый коридор (M4 - M5)',
    entryPostAz: 'Bakı Baş Gömrük İdarəsi (Lökbatan Terminalı)',
    exitPostAz: 'Mazımqara Gömrük Postu (Balakən / Gürcüstan)',
    distanceKm: 445,
    standardTransitHours: 8.0,
    maxAllowedHours: 24.0,
    geofenceBufferMeters: 1000,
    designatedStopsAz: [
      'Şamaxı Dağ Aşırımı TIR Dayanacağı',
      'Qəbələ Şimal-Qərb Logistika Meydançası',
      'Şəki Beynəlxalq Yük Qovşağı',
    ],
  },
  CORRIDOR_SOUTHERN_M3_BILASUVAR: {
    code: 'CORRIDOR_SOUTHERN_M3_BILASUVAR',
    nameAz: 'Cənub Biləsuvar Tranzit Qolu (M3 - Biləsuvar)',
    nameEn: 'Southern Bilasuvar Transit Spur (M3 - Bilasuvar)',
    nameRu: 'Южное Билясуварское транзитное ответвление',
    entryPostAz: 'Ələt Liman Gömrük Terminalı',
    exitPostAz: 'Biləsuvar Gömrük Postu (İran sərhədi)',
    distanceKm: 185,
    standardTransitHours: 3.5,
    maxAllowedHours: 12.0,
    geofenceBufferMeters: 800,
    designatedStopsAz: [
      'Salyan M3 Tranzit TIR Dayanacağı',
      'Biləsuvar Sərhəd Terminalı Logistika Parkı',
    ],
  },
  CORRIDOR_ZANGEZUR_NAKHCHIVAN: {
    code: 'CORRIDOR_ZANGEZUR_NAKHCHIVAN',
    nameAz: 'Naxçıvan Muxtar Respublikası Tranzit Dəhlizi',
    nameEn: 'Nakhchivan Autonomous Republic Transit Corridor',
    nameRu: 'Транзитный коридор Нахчыванской АР',
    entryPostAz: 'Sədərək Gömrük Postu (Türkiyə sərhədi)',
    exitPostAz: 'Culfa Gömrük Postu (İran sərhədi)',
    distanceKm: 160,
    standardTransitHours: 3.0,
    maxAllowedHours: 10.0,
    geofenceBufferMeters: 800,
    designatedStopsAz: [
      'Naxçıvan Şəhər Gömrük İdarəsi Terminalı',
      'Culfa Dəmiryol və Avtomobil Tranzit Mərkəzi',
    ],
  },
  CORRIDOR_BAKU_PORT_AFEZ: {
    code: 'CORRIDOR_BAKU_PORT_AFEZ',
    nameAz: 'Ələt Liman - AFEZ Azad İqtisadi Zona Gömrük Xətti',
    nameEn: 'Alat Port - AFEZ Bonded Customs Spur',
    nameRu: 'Таможенная линия Порт Алят - СЭЗ АФЕЗ',
    entryPostAz: 'Bakı Limanı Ro-Pax Terminalı',
    exitPostAz: 'Lökbatan Daxili Gömrük İdarəsi Terminalı',
    distanceKm: 65,
    standardTransitHours: 1.5,
    maxAllowedHours: 6.0,
    geofenceBufferMeters: 500,
    designatedStopsAz: [
      'AFEZ Gömrük Nəzarət Məntəqəsi',
      'Qobustan Tranzit Yoxlama Stansiyası',
    ],
  },
};

/**
 * Cargo Risk & Hazard Classification
 */
export type CargoRiskType =
  | 'STANDARD_GENERAL'     // Standard manufactured or consumer goods
  | 'HIGH_EXCISE_ALCOHOL'  // Alcohol, tobacco, perfumes (High excise duty risk)
  | 'ADR_DANGEROUS'        // Chemical, toxic, flammable (ADR Classes 1-9)
  | 'HIGH_VALUE_TECH';     // Electronics, machinery, automotive spare parts

export interface CargoRiskInfo {
  id: CargoRiskType;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  riskMultiplier: number;
  surveillanceSurchargeAzn: number;
  requiresSatellite: boolean;
}

export const CARGO_RISK_SPECS: Record<CargoRiskType, CargoRiskInfo> = {
  STANDARD_GENERAL: {
    id: 'STANDARD_GENERAL',
    nameAz: 'Standart Ümumi Yüklər (Sənaye və Qida Malları)',
    nameEn: 'Standard General Cargo (Industrial & Food)',
    nameRu: 'Стандартные генеральные грузы',
    riskMultiplier: 1.0,
    surveillanceSurchargeAzn: 0,
    requiresSatellite: false,
  },
  HIGH_EXCISE_ALCOHOL: {
    id: 'HIGH_EXCISE_ALCOHOL',
    nameAz: 'Yüksək Aksizli Mallar (Tütün, Alkoqol, Ətriyyat)',
    nameEn: 'High Excise Duty Goods (Tobacco, Alcohol, Perfume)',
    nameRu: 'Высокоподакцизные товары (табак, алкоголь)',
    riskMultiplier: 1.4,
    surveillanceSurchargeAzn: 25,
    requiresSatellite: true,
  },
  ADR_DANGEROUS: {
    id: 'ADR_DANGEROUS',
    nameAz: 'Təhlükəli Yüklər (ADR Sinifləri 1-9)',
    nameEn: 'Dangerous Goods (ADR Classes 1-9)',
    nameRu: 'Опасные грузы (Классы ADR 1-9)',
    riskMultiplier: 1.5,
    surveillanceSurchargeAzn: 30,
    requiresSatellite: true,
  },
  HIGH_VALUE_TECH: {
    id: 'HIGH_VALUE_TECH',
    nameAz: 'Yüksək Dəyərli Avadanlıq və Elektronika',
    nameEn: 'High-Value Electronics & Technology',
    nameRu: 'Высокотехнологичная электроника и ценное оборудование',
    riskMultiplier: 1.25,
    surveillanceSurchargeAzn: 20,
    requiresSatellite: false,
  },
};

/**
 * Sensor Telemetry & Tamper Status Types
 */
export type CableLoopStatus = 'INTACT' | 'CUT_SEVERED' | 'RESISTANCE_ANOMALY';
export type LightSensorStatus = 'SEALED_DARK' | 'DOOR_BREACH_LIGHT';
export type ShockSensorStatus = 'NORMAL' | 'HIGH_IMPACT' | 'ROLLOVER';
export type GeofenceViolationStatus = 'ON_CORRIDOR' | 'BUFFER_ZONE' | 'ROUTE_DEVIATION_ALERT';
export type DwellStatus = 'MOVING_OR_REST_AREA' | 'UNAUTHORIZED_DWELL_ALERT';
export type OverallIntegrityRating = 'LOW_RISK_CLEARED' | 'ELEVATED_SURVEILLANCE' | 'CRITICAL_SECURITY_BREACH';

export interface TelemetryStandInputs {
  sealType: ElectronicSealType;
  corridor: TransitCorridorCode;
  cargoRisk: CargoRiskType;
  cableCut: boolean;
  ambientLightLux: number; // 0 to 500 Lux (Threshold > 5 Lux indicates door crack/opening)
  shockGForce: number;     // 0 to 10.0 G (Threshold > 3.5 G indicates sudden crash or forced opening)
  batteryPercent: number;  // 0 to 100%
  routeDeviationMeters: number; // Deviation from highway centerline (Threshold > 1000 m is violation)
  unauthorizedDwellMinutes: number; // Stopped outside designated TIR rest stops (Threshold > 45 mins)
}

export interface TelemetryStandEvaluation {
  cableStatus: CableLoopStatus;
  lightStatus: LightSensorStatus;
  shockStatus: ShockSensorStatus;
  geofenceStatus: GeofenceViolationStatus;
  dwellStatus: DwellStatus;
  overallRating: OverallIntegrityRating;
  isTamperDetected: boolean;
  isRouteViolation: boolean;
  requiresCustomsInterception: boolean;
  tamperExplanationAz: string;
  tamperExplanationEn: string;
}

/**
 * Evaluates real-time electronic seal telemetry and flags tamper anomalies
 */
export function evaluateSealTelemetry(inputs: TelemetryStandInputs): TelemetryStandEvaluation {
  const corridorInfo = TRANSIT_CORRIDORS[inputs.corridor];
  
  // 1. Cable Loop Status
  let cableStatus: CableLoopStatus = 'INTACT';
  if (inputs.cableCut) {
    cableStatus = 'CUT_SEVERED';
  }

  // 2. Interior Light Sensor (Door Breach)
  // Inside a sealed cargo container or trailer, lux should be near 0. > 5 lux indicates door breach.
  const lightStatus: LightSensorStatus = inputs.ambientLightLux > 5 ? 'DOOR_BREACH_LIGHT' : 'SEALED_DARK';

  // 3. Shock / Accelerometer Sensor
  let shockStatus: ShockSensorStatus = 'NORMAL';
  if (inputs.shockGForce >= 6.0) {
    shockStatus = 'ROLLOVER';
  } else if (inputs.shockGForce >= 3.5) {
    shockStatus = 'HIGH_IMPACT';
  }

  // 4. Geofencing Route Deviation
  let geofenceStatus: GeofenceViolationStatus = 'ON_CORRIDOR';
  if (inputs.routeDeviationMeters > corridorInfo.geofenceBufferMeters) {
    geofenceStatus = 'ROUTE_DEVIATION_ALERT';
  } else if (inputs.routeDeviationMeters > corridorInfo.geofenceBufferMeters * 0.75) {
    geofenceStatus = 'BUFFER_ZONE';
  }

  // 5. Unauthorized Dwell Status (stopped outside designated rest stops for > 45 mins)
  const dwellStatus: DwellStatus =
    inputs.unauthorizedDwellMinutes > 45 ? 'UNAUTHORIZED_DWELL_ALERT' : 'MOVING_OR_REST_AREA';

  // Tamper & Route Violations
  const isTamperDetected =
    cableStatus === 'CUT_SEVERED' ||
    lightStatus === 'DOOR_BREACH_LIGHT' ||
    shockStatus === 'HIGH_IMPACT' ||
    shockStatus === 'ROLLOVER';

  const isRouteViolation =
    geofenceStatus === 'ROUTE_DEVIATION_ALERT' || dwellStatus === 'UNAUTHORIZED_DWELL_ALERT';

  const requiresCustomsInterception = isTamperDetected || isRouteViolation;

  // Overall Integrity Rating
  let overallRating: OverallIntegrityRating = 'LOW_RISK_CLEARED';
  let tamperExplanationAz = 'Bütün telemetriya parametrləri normadadır. Plomb bütövdür və icazə verilən tranzit dəhlizindədir.';
  let tamperExplanationEn = 'All telemetry parameters are nominal. Seal is intact and vehicle is on designated corridor.';

  if (cableStatus === 'CUT_SEVERED') {
    overallRating = 'CRITICAL_SECURITY_BREACH';
    tamperExplanationAz = 'TƏHLÜKƏ: Elektron kabel ilməsi kəsilib və ya qırılıb! Gömrük Məcəlləsinin 230-cu maddəsi üzrə qanun pozuntusu.';
    tamperExplanationEn = 'CRITICAL: Electronic cable loop has been severed! Immediate customs violation under Customs Code Art. 230.';
  } else if (lightStatus === 'DOOR_BREACH_LIGHT') {
    overallRating = 'CRITICAL_SECURITY_BREACH';
    tamperExplanationAz = 'HƏYƏCAN: Yük qapısı açılıb! Daxili işıq sensoru 5 Lux həddini aşdı (qeyri-qanuni müdaxilə ehtimalı).';
    tamperExplanationEn = 'ALARM: Cargo door opened! Internal light sensor exceeded 5 Lux threshold (illicit cargo access).';
  } else if (geofenceStatus === 'ROUTE_DEVIATION_ALERT') {
    overallRating = 'CRITICAL_SECURITY_BREACH';
    tamperExplanationAz = `MARŞRUT POZUNTUSU: Avtomobil təsdiq olunmuş dəhlizdən ${inputs.routeDeviationMeters} metr kənara çıxıb (İcazə: ${corridorInfo.geofenceBufferMeters} m).`;
    tamperExplanationEn = `ROUTE VIOLATION: Vehicle deviated by ${inputs.routeDeviationMeters} m from approved corridor (Limit: ${corridorInfo.geofenceBufferMeters} m).`;
  } else if (dwellStatus === 'UNAUTHORIZED_DWELL_ALERT') {
    overallRating = 'ELEVATED_SURVEILLANCE';
    tamperExplanationAz = `ŞÜBHƏLİ DAYANMA: Təsdiqlənməmiş ərazidə ${inputs.unauthorizedDwellMinutes} dəqiqə dayanma qeydə alınıb (>45 dəqiqə həddi).`;
    tamperExplanationEn = `SUSPICIOUS STOP: Unauthorized dwell of ${inputs.unauthorizedDwellMinutes} mins outside designated parking (>45 min threshold).`;
  } else if (shockStatus === 'HIGH_IMPACT' || shockStatus === 'ROLLOVER') {
    overallRating = 'ELEVATED_SURVEILLANCE';
    tamperExplanationAz = `ZƏRBƏ XƏBƏRDARLIĞI: Qəfil akselerometr təkanı (${inputs.shockGForce} G) qeydə alınıb. Konteyner bütövlüyü yoxlanmalıdır.`;
    tamperExplanationEn = `SHOCK WARNING: High accelerometer impulse (${inputs.shockGForce} G) detected. Structural check required.`;
  }

  return {
    cableStatus,
    lightStatus,
    shockStatus,
    geofenceStatus,
    dwellStatus,
    overallRating,
    isTamperDetected,
    isRouteViolation,
    requiresCustomsInterception,
    tamperExplanationAz,
    tamperExplanationEn,
  };
}

/**
 * Statutory Seal Fee & Administrative Penalty Engine
 */
export interface SealFeeBreakdown {
  baseSealFeeAzn: number;
  corridorDistanceSurchargeAzn: number;
  riskSurveillanceSurchargeAzn: number;
  satelliteDataMonitoringAzn: number;
  subtotalAzn: number;
  vat18PercentAzn: number;
  totalStatutoryDutyAzn: number;
  statutoryFineAzn: number; // Fine under İXM 499 if violation detected
  totalPayableAzn: number;
  convertedTotal: number;
  convertedFine: number;
  currency: Currency;
}

export function calculateSealFeesAndPenalties(
  inputs: TelemetryStandInputs,
  currency: Currency = 'AZN'
): SealFeeBreakdown {
  const sealSpec = ELECTRONIC_SEAL_SPECS[inputs.sealType];
  const corridor = TRANSIT_CORRIDORS[inputs.corridor];
  const riskSpec = CARGO_RISK_SPECS[inputs.cargoRisk];
  const evaluation = evaluateSealTelemetry(inputs);

  const baseSealFeeAzn = sealSpec.baseFeeAzn;

  // Corridor distance surcharge: 15 AZN if corridor > 300 km
  const corridorDistanceSurchargeAzn = corridor.distanceKm > 300 ? 15 : 5;

  // Cargo risk surveillance fee
  const riskSurveillanceSurchargeAzn = riskSpec.surveillanceSurchargeAzn;

  // Satellite monitoring fee: 20 AZN if seal has satellite or cargo requires satellite
  const satelliteDataMonitoringAzn = sealSpec.hasSatelliteUplink || riskSpec.requiresSatellite ? 20 : 0;

  const subtotalAzn =
    baseSealFeeAzn + corridorDistanceSurchargeAzn + riskSurveillanceSurchargeAzn + satelliteDataMonitoringAzn;

  const vat18PercentAzn = Math.round(subtotalAzn * 0.18 * 100) / 100;
  const totalStatutoryDutyAzn = Math.round((subtotalAzn + vat18PercentAzn) * 100) / 100;

  // Administrative Penalty under Code of Administrative Offences (İXM Maddə 499)
  // Cable cut: 1500 AZN (Maddə 499.1 - Gömrük təminatı vasitələrini zədələmə)
  // Route deviation: 800 AZN (Maddə 501 - Marşrutdan kənara çıxma)
  // Unauthorized stop: 500 AZN
  let statutoryFineAzn = 0;
  if (evaluation.cableStatus === 'CUT_SEVERED') {
    statutoryFineAzn += 1500;
  }
  if (evaluation.geofenceStatus === 'ROUTE_DEVIATION_ALERT') {
    statutoryFineAzn += 800;
  }
  if (evaluation.dwellStatus === 'UNAUTHORIZED_DWELL_ALERT') {
    statutoryFineAzn += 500;
  }
  if (evaluation.lightStatus === 'DOOR_BREACH_LIGHT' && evaluation.cableStatus !== 'CUT_SEVERED') {
    statutoryFineAzn += 1000;
  }

  const totalPayableAzn = totalStatutoryDutyAzn + statutoryFineAzn;
  const rate = CURRENCY_RATES[currency];

  return {
    baseSealFeeAzn,
    corridorDistanceSurchargeAzn,
    riskSurveillanceSurchargeAzn,
    satelliteDataMonitoringAzn,
    subtotalAzn,
    vat18PercentAzn,
    totalStatutoryDutyAzn,
    statutoryFineAzn,
    totalPayableAzn,
    convertedTotal: Math.round(totalPayableAzn * rate * 100) / 100,
    convertedFine: Math.round(statutoryFineAzn * rate * 100) / 100,
    currency,
  };
}

/**
 * 10-Point DGK / AYNA / BDYP Intelligent E-Seal Security & Geofence Checklist Item
 */
export interface SealChecklistItem {
  id: string;
  category: 'SEAL_HARDWARE' | 'GEOFENCE_GPS' | 'CARGO_CONTAINER' | 'CUSTOMS_PROTOCOL';
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  legalBasis: string;
  isMandatory: boolean;
}

/**
 * Theoretical Exam Question Model
 */
export interface SealExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctIndex: number;
  explanationAz: string;
  explanationEn: string;
  explanationRu: string;
  legalArticle: string;
}

/**
 * Official DGK, AYNA & BDYP Electronic Transit Integrity Certificate Model
 */
export interface ElectronicSealCertificate {
  certificateNumber: string; // e.g. E-SEAL-AZ-2026-94812
  plateNumber: string;
  containerNumber: string;
  sealSerial: string;        // e.g. DGK-ELOCK-994-0192
  sealType: ElectronicSealType;
  corridor: TransitCorridorCode;
  entryCheckpoint: string;
  exitCheckpoint: string;
  distanceKm: number;
  cargoCategory: string;
  integrityRating: OverallIntegrityRating;
  isTamperFree: boolean;
  tamperCount: number;
  batteryHealthPercent: number;
  issueDate: string;
  expiryDate: string;
  simaDigitalUid: string;
  qrVerificationUrl: string;
  securityChecksumSha256: string;
  customsOfficerId: string;
  isClearedForExit: boolean;
}

/**
 * Calculates Checklist Score Percentage
 */
export function calculateSealChecklistScore(
  checklistItems: SealChecklistItem[],
  checkedItemIds: string[]
): { scorePercent: number; passed: boolean; mandatoryFulfilled: boolean } {
  if (checklistItems.length === 0) return { scorePercent: 100, passed: true, mandatoryFulfilled: true };

  const checkedSet = new Set(checkedItemIds);
  const totalScore = (checkedSet.size / checklistItems.length) * 100;

  const mandatoryItems = checklistItems.filter(item => item.isMandatory);
  const mandatoryFulfilled = mandatoryItems.every(item => checkedSet.has(item.id));

  const passed = totalScore >= 80 && mandatoryFulfilled;

  return {
    scorePercent: Math.round(totalScore),
    passed,
    mandatoryFulfilled,
  };
}

/**
 * Evaluates Theoretical Examination
 */
export function evaluateSealExam(
  questions: SealExamQuestion[],
  answers: Record<number, number>
): { scorePercent: number; passed: boolean; correctCount: number; totalCount: number } {
  const totalCount = questions.length;
  if (totalCount === 0) return { scorePercent: 100, passed: true, correctCount: 0, totalCount: 0 };

  let correctCount = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correctIndex) {
      correctCount += 1;
    }
  });

  const scorePercent = Math.round((correctCount / totalCount) * 100);
  const passed = scorePercent >= 80;

  return {
    scorePercent,
    passed,
    correctCount,
    totalCount,
  };
}

/**
 * Generates an official SHA-256 styled checksum and Electronic Transit Integrity Certificate
 */
export function generateElectronicSealCertificate(
  plateNumber: string,
  containerNumber: string,
  inputs: TelemetryStandInputs,
  evaluation: TelemetryStandEvaluation
): ElectronicSealCertificate {
  const corridor = TRANSIT_CORRIDORS[inputs.corridor];
  const sealSpec = ELECTRONIC_SEAL_SPECS[inputs.sealType];
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `E-SEAL-AZ-2026-${randomSuffix}`;
  const sealSerial = `DGK-ELOCK-994-${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date();
  const issueDate = now.toISOString().slice(0, 10);
  const expiryDate = new Date(now.getTime() + corridor.maxAllowedHours * 3600 * 1000).toISOString().slice(0, 10);

  const rawString = `${certificateNumber}|${plateNumber}|${containerNumber}|${sealSerial}|${corridor.code}|${evaluation.overallRating}|${issueDate}`;
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    hash = (hash << 5) - hash + rawString.charCodeAt(i);
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  const securityChecksumSha256 = `SHA256-${hexHash.toUpperCase()}84B79A20DF419C`;
  const simaDigitalUid = `SIMA-GOV-AZ-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;

  const isTamperFree = !evaluation.isTamperDetected && !evaluation.isRouteViolation;
  const tamperCount = (evaluation.isTamperDetected ? 1 : 0) + (evaluation.isRouteViolation ? 1 : 0);

  return {
    certificateNumber,
    plateNumber,
    containerNumber,
    sealSerial,
    sealType: inputs.sealType,
    corridor: inputs.corridor,
    entryCheckpoint: corridor.entryPostAz,
    exitCheckpoint: corridor.exitPostAz,
    distanceKm: corridor.distanceKm,
    cargoCategory: CARGO_RISK_SPECS[inputs.cargoRisk].nameAz,
    integrityRating: evaluation.overallRating,
    isTamperFree,
    tamperCount,
    batteryHealthPercent: inputs.batteryPercent,
    issueDate,
    expiryDate,
    simaDigitalUid,
    securityChecksumSha256,
    qrVerificationUrl: `https://customs.gov.az/transit/eseal/verify?cert=${certificateNumber}&sha=${hexHash}`,
    customsOfficerId: 'DGK-TRANSIT-INSP-0482',
    isClearedForExit: isTamperFree && inputs.batteryPercent > 15,
  };
}
