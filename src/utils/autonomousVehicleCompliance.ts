/**
 * Official Azerbaijan Land Transport Agency (AYNA),
 * Main State Traffic Police Department (BDYP) &
 * Ministry of Emergency Situations (FHN)
 * Autonomous Self-Driving Vehicles (SAE Level 3/4/5),
 * V2X (Vehicle-to-Everything) C-V2X / DSRC Telemetry,
 * LiDAR / Stereoscopic Camera Sensor Fusion &
 * Official AUTONOM-AZ-2026 Autonomous Pilot Testing Permit Compliance Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Road Traffic" ("Yol Hərəkəti Haqqında" Qanun):
 *   * Maddə 9: Ağıllı nəqliyyat sistemləri (İTS) və avtomatlaşdırılmış yol infrastrukturu
 *   * Maddə 14: Sınaq rejimində olan avtonom nəqliyyat vasitələrinin dövlət reyestri və sınaq marşrutları
 *   * Maddə 27: Konstruksiyanın təhlükəsizliyi, ASIL-D ehtiyat əyləc/sükan idarəetməsi və sertifikatlaşdırılmış Təhlükəsizlik Sürücüsü (Safety Driver) tələbləri
 * - ISO 26262: Road Vehicles - Functional Safety (ASIL-D Fail-Operational Steer-by-Wire & Brake-by-Wire Redundancy)
 * - ISO 21448: Road Vehicles - Safety of the Intended Functionality (SOTIF - Edge Case & Unknown Hazards Mitigation)
 * - UNECE WP.29 Automated Driving Regulations:
 *   * UN Regulation No. 157: Automated Lane Keeping Systems (ALKS)
 *   * UN Regulation No. 155: Cyber Security and Cyber Security Management System
 *   * UN Regulation No. 156: Software Update and Software Updates Management System
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *   * Maddə 342.2: İcazəsiz avtonom sınaqların keçirilməsi və ya təsdiqlənmiş ODD/sınaq koridorundan kənara çıxma (500–1,500 AZN cərimə)
 *   * Maddə 342.7: Təhlükəsizlik sürücüsünün (Safety Driver) sükan arxasında olmaması və ya tələb olunduqda 10 saniyə ərzində idarəetməni təhvil almaması (300–800 AZN cərimə)
 *   * Maddə 342.9: V2X rabitə və ya qara qutu (EDR / DSSAD) telemetriya qeydlərinin aparılmaması və arxivlənməməsi (400–1,000 AZN cərimə)
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
 * SAE J3016 Automation Levels
 */
export type SaeAutomationLevel =
  | 'LEVEL_0_NO_AUTOMATION'       // Manual Driving (Sürücü Tam Nəzarəti)
  | 'LEVEL_1_DRIVER_ASSISTANCE'   // Single axis (ACC or LKA)
  | 'LEVEL_2_PARTIAL_AUTOMATION'  // Combined ACC + LKA, Hands-On required
  | 'LEVEL_3_CONDITIONAL_AUTO'    // Traffic Jam Pilot, System drives, Human fallback <= 10s
  | 'LEVEL_4_HIGH_AUTOMATION'     // Geofenced ODD Robotaxi / Shuttle, No Human required in ODD
  | 'LEVEL_5_FULL_AUTOMATION';    // Unrestricted ODD, Everywhere, Any Weather

export interface SaeLevelDefinition {
  level: SaeAutomationLevel;
  code: string;
  titleAz: string;
  nameEn: string;
  descriptionAz: string;
  steeringAndSpeedControl: string;
  environmentMonitoring: string;
  fallbackResponsibility: string;
  systemCapabilityODD: string;
  handoverTimeMaxSec: number;
}

export const SAE_LEVEL_DEFINITIONS: Record<SaeAutomationLevel, SaeLevelDefinition> = {
  LEVEL_0_NO_AUTOMATION: {
    level: 'LEVEL_0_NO_AUTOMATION',
    code: 'SAE L0',
    titleAz: 'Səviyyə 0: Sıfır Avtomatlaşdırma (Tam İnsan İdarəetməsi)',
    nameEn: 'No Driving Automation',
    descriptionAz: 'Sürücü bütün sükan, sürət və əyləc əməliyyatlarını daimi icra edir. Yalnız xəbərdarlıq sistemləri (kor nöqtə, zolaq xəbərdarlığı) mövcuddur.',
    steeringAndSpeedControl: 'Tam İnsan',
    environmentMonitoring: 'Tam İnsan',
    fallbackResponsibility: 'Tam İnsan',
    systemCapabilityODD: 'Yoxdur',
    handoverTimeMaxSec: 0,
  },
  LEVEL_1_DRIVER_ASSISTANCE: {
    level: 'LEVEL_1_DRIVER_ASSISTANCE',
    code: 'SAE L1',
    titleAz: 'Səviyyə 1: Sürücüyə Dəstək Sistemi (ACC və ya LKA)',
    nameEn: 'Driver Assistance',
    descriptionAz: 'Avtomobil ya uzununa (Adaptiv Kruiz - ACC), ya da eninə (Zolaqda Saxlama - LKA) idarəetməni dəstəkləyir. Əllər sükanda olmalıdır.',
    steeringAndSpeedControl: 'Sürücü və ya Sistem',
    environmentMonitoring: 'Sürücü',
    fallbackResponsibility: 'Sürücü',
    systemCapabilityODD: 'Məhdud Magistral',
    handoverTimeMaxSec: 0,
  },
  LEVEL_2_PARTIAL_AUTOMATION: {
    level: 'LEVEL_2_PARTIAL_AUTOMATION',
    code: 'SAE L2',
    titleAz: 'Səviyyə 2: Qismən Avtomatlaşdırma (ACC + LKA + Zolaq Dəyişmə)',
    nameEn: 'Partial Driving Automation',
    descriptionAz: 'Sistem eyni zamanda sükan və sürəti idarə edir. Sürücü daima yolu izləməli və hər an hazır olmalıdır (Hands-On / Driver Eye Monitoring).',
    steeringAndSpeedControl: 'Sistem',
    environmentMonitoring: 'Sürücü',
    fallbackResponsibility: 'Sürücü',
    systemCapabilityODD: 'Magistral və Şəhərdaxili Seçilmiş Zolaqlar',
    handoverTimeMaxSec: 1,
  },
  LEVEL_3_CONDITIONAL_AUTO: {
    level: 'LEVEL_3_CONDITIONAL_AUTO',
    code: 'SAE L3',
    titleAz: 'Səviyyə 3: Şərti Avtomatlaşdırma (Traffic Jam / Highway Pilot)',
    nameEn: 'Conditional Driving Automation',
    descriptionAz: 'Təsdiqlənmiş ODD daxilində avtomobil tam müstəqil hərəkət edir. Sistem tələb etdikdə təhlükəsizlik sürücüsü 10 saniyə ərzində idarəetməni təhvil almalıdır.',
    steeringAndSpeedControl: 'Sistem',
    environmentMonitoring: 'Sistem',
    fallbackResponsibility: 'Təhlükəsizlik Sürücüsü (Safety Driver)',
    systemCapabilityODD: 'Təsdiqlənmiş Ağıllı Koridorlar (< 60-80 km/s)',
    handoverTimeMaxSec: 10,
  },
  LEVEL_4_HIGH_AUTOMATION: {
    level: 'LEVEL_4_HIGH_AUTOMATION',
    code: 'SAE L4',
    titleAz: 'Səviyyə 4: Yüksək Avtomatlaşdırma (Geofenced Robotaksi / Şattl)',
    nameEn: 'High Driving Automation',
    descriptionAz: 'Müəyyən edilmiş sınaq zonasında (Geofence) insan müdaxiləsinə ehtiyac yoxdur. Kritik rejimdə sistem təhlükəsiz zolağa çıxıb dayanır (Minimum Risk Maneuver).',
    steeringAndSpeedControl: 'Sistem',
    environmentMonitoring: 'Sistem',
    fallbackResponsibility: 'Sistem (Avtomatik MRM)',
    systemCapabilityODD: 'Geofenced Sınaq Koridorları və Qapalı Şəhərciklər',
    handoverTimeMaxSec: 0,
  },
  LEVEL_5_FULL_AUTOMATION: {
    level: 'LEVEL_5_FULL_AUTOMATION',
    code: 'SAE L5',
    titleAz: 'Səviyyə 5: Tam Avtomatlaşdırma (Hər Şəraitdə Sürücüsüz)',
    nameEn: 'Full Driving Automation',
    descriptionAz: 'İstənilən yolda, hər hava şəraitində tam müstəqil sükan və sürət idarəetməsi. Sükan və pedallar tələb olunmur.',
    steeringAndSpeedControl: 'Sistem',
    environmentMonitoring: 'Sistem',
    fallbackResponsibility: 'Sistem',
    systemCapabilityODD: 'Məhdudiyyətsiz Bütün Yollar',
    handoverTimeMaxSec: 0,
  },
};

/**
 * 6 Strategic Autonomous Pilot Corridors in Azerbaijan
 */
export type PilotCorridorId =
  | 'baku_white_city'
  | 'sea_breeze_shuttle'
  | 'fuzuli_smart_loop'
  | 'alat_afez_freight'
  | 'heydar_aliyev_adas'
  | 'baku_stadium_ring';

export interface PilotCorridorInfo {
  id: PilotCorridorId;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  locationAz: string;
  routeLengthKm: number;
  maxSpeedKmh: number;
  maxSaeLevelApproved: SaeAutomationLevel;
  rsuCount: number; // Roadside Units (C-V2X 5.9 GHz)
  hdMapPrecisionCm: number; // High-Definition Map resolution
  corridorTypeAz: 'SMART_URBAN' | 'RESORT_SHUTTLE' | 'SMART_CITY_LOOP' | 'HEAVY_FREIGHT' | 'HIGHWAY_ADAS' | 'TEST_RING';
  descriptionAz: string;
  featuresAz: string[];
}

/**
 * Weather & Environmental Degradation
 */
export type WeatherCondition =
  | 'CLEAR_DAY'
  | 'OVERCAST_RAIN'
  | 'HEAVY_FOG'
  | 'NIGHT_LOW_LIGHT'
  | 'SNOW_ICY_TRACK';

export interface SensorDegradationFactor {
  weather: WeatherCondition;
  lidarLossPercent: number;
  cameraLossPercent: number;
  radarLossPercent: number;
  gnssRtkAccuracyCm: number;
}

export const WEATHER_DEGRADATION_FACTORS: Record<WeatherCondition, SensorDegradationFactor> = {
  CLEAR_DAY: {
    weather: 'CLEAR_DAY',
    lidarLossPercent: 2,
    cameraLossPercent: 1,
    radarLossPercent: 0,
    gnssRtkAccuracyCm: 2,
  },
  OVERCAST_RAIN: {
    weather: 'OVERCAST_RAIN',
    lidarLossPercent: 18,
    cameraLossPercent: 25,
    radarLossPercent: 5,
    gnssRtkAccuracyCm: 5,
  },
  HEAVY_FOG: {
    weather: 'HEAVY_FOG',
    lidarLossPercent: 42,
    cameraLossPercent: 55,
    radarLossPercent: 8,
    gnssRtkAccuracyCm: 7,
  },
  NIGHT_LOW_LIGHT: {
    weather: 'NIGHT_LOW_LIGHT',
    lidarLossPercent: 4,
    cameraLossPercent: 48,
    radarLossPercent: 1,
    gnssRtkAccuracyCm: 3,
  },
  SNOW_ICY_TRACK: {
    weather: 'SNOW_ICY_TRACK',
    lidarLossPercent: 35,
    cameraLossPercent: 45,
    radarLossPercent: 12,
    gnssRtkAccuracyCm: 8,
  },
};

/**
 * V2X (Vehicle-to-Everything) Communication Protocols
 */
export type V2xProtocol = 'C_V2X_PC5_5_9GHZ' | 'DSRC_IEEE_802_11P';

export interface V2xTelemetryResult {
  protocol: V2xProtocol;
  latencyMs: number;
  packetDeliveryRatioPercent: number;
  spatSyncStatus: 'LOCKED' | 'DEGRADED' | 'DISCONNECTED';
  v2pAlertActive: boolean;
  isCompliant: boolean;
  statusLabelAz: string;
  latencyCategoryAz: 'ULTRA_LOW' | 'NOMINAL' | 'ELEVATED' | 'CRITICAL_LATENCY';
  actionRequiredAz: string;
}

/**
 * Sensor Fusion Assessment
 */
export interface SensorFusionResult {
  lidarDetectionRangeM: number;
  lidarPointsPerSec: number;
  cameraOcclusionPercent: number;
  radarTrackingCount: number;
  weatherCondition: WeatherCondition;
  overallPerceptionConfidencePercent: number;
  isSafeForAutonomousMode: boolean;
  fusionVerdictAz: string;
  mrmTriggered: boolean;
  activeFaultsAz: string[];
}

/**
 * Autonomous Vehicle Safety & Fail-Safe Redundancy Checklist
 */
export interface AutonomousSafetyChecklistItem {
  id: string;
  categoryAz: 'ACTUATOR_REDUNDANCY' | 'PERCEPTION_STACK' | 'TELEMETRY_RECORDING' | 'SAFETY_DRIVER';
  titleAz: string;
  descriptionAz: string;
  isMandatory: boolean;
  statutoryStandard: string;
}

/**
 * Theoretical AV Testing Examination Question
 */
export interface AutonomousExamQuestion {
  id: string;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  legalBasisAz: string;
}

/**
 * Official Autonomous Pilot Testing Permit (AUTONOM-AZ-2026)
 */
export interface OfficialAutonomousPilotPermit {
  permitId: string; // AUTONOM-AZ-2026-XXXXX
  issueDate: string;
  validUntil: string;
  vehiclePlate: string;
  vin: string;
  saeLevel: SaeAutomationLevel;
  saeLevelCode: string;
  corridorId: PilotCorridorId;
  corridorNameAz: string;
  operatorCompanyAz: string;
  safetyDriverNameAz: string;
  safetyDriverLicense: string;
  vehicleModelAz: string;
  maxApprovedSpeedKmh: number;
  v2xProtocol: V2xProtocol;
  dssadBlackBoxActive: boolean;
  totalFeeAzn: number;
  aynaInspectorBadge: string;
  sha256SecurityChecksum: string;
  simaDigitalUid: string;
}

/**
 * Fee Calculation Result
 */
export interface AutonomousPilotFeeResult {
  baseTestingFeeAzn: number;
  corridorEscortFeeAzn: number;
  v2xSpectrumClearanceFeeAzn: number;
  fhnSafetyStandFeeAzn: number;
  totalPayableAzn: number;
  totalPayableCurrency: number;
  currency: Currency;
  statutoryBasisAz: string;
}

/**
 * Evaluates SAE Automation Level Compliance
 */
export const evaluateSaeAutomationLevel = (
  level: SaeAutomationLevel,
  hasSafetyDriver: boolean,
  speedKmh: number,
  corridorMaxSpeedKmh: number
): {
  isCompliant: boolean;
  requiresSafetyDriver: boolean;
  handoverTimeSec: number;
  speedViolation: boolean;
  verdictAz: string;
  penaltyAzn: number;
  statutoryArticleAz: string;
} => {
  const def = SAE_LEVEL_DEFINITIONS[level];
  const requiresSafetyDriver = level !== 'LEVEL_5_FULL_AUTOMATION' && level !== 'LEVEL_4_HIGH_AUTOMATION';
  const speedViolation = speedKmh > corridorMaxSpeedKmh;

  let penaltyAzn = 0;
  let statutoryArticleAz = 'Qanunauyğun (Maddə 14)';

  if (speedViolation) {
    penaltyAzn += 200;
    statutoryArticleAz = 'İXM Maddə 342.2 (Sürət həddinin aşılması)';
  }

  if (requiresSafetyDriver && !hasSafetyDriver) {
    penaltyAzn += 500;
    statutoryArticleAz = 'İXM Maddə 342.7 (Təhlükəsizlik sürücüsünün olmaması)';
  }

  const isCompliant = !speedViolation && (!requiresSafetyDriver || hasSafetyDriver);

  let verdictAz = 'Avtonom Sınaq Rejimi Təsdiqləndi';
  if (!isCompliant) {
    verdictAz = 'Sınaq Rejimi Qadağandır (Qanun Pozuntusu)';
  }

  return {
    isCompliant,
    requiresSafetyDriver,
    handoverTimeSec: def.handoverTimeMaxSec,
    speedViolation,
    verdictAz,
    penaltyAzn,
    statutoryArticleAz,
  };
};

/**
 * Evaluates Sensor Fusion & Degradation
 */
export const evaluateSensorFusion = (
  lidarDetectionRangeM: number,
  lidarPointsPerSec: number,
  cameraOcclusionPercent: number,
  radarTrackingCount: number,
  weatherCondition: WeatherCondition,
  isRadarActive: boolean
): SensorFusionResult => {
  const deg = WEATHER_DEGRADATION_FACTORS[weatherCondition];
  const activeFaultsAz: string[] = [];

  // Effective LiDAR capability
  const effectiveLidarRange = lidarDetectionRangeM * (1 - deg.lidarLossPercent / 100);
  const effectiveCameraClarity = Math.max(0, 100 - cameraOcclusionPercent - deg.cameraLossPercent);

  if (effectiveLidarRange < 80) {
    activeFaultsAz.push('LiDAR məsafəsi təhlükəsizlik həddindən aşağıdır (<80m)');
  }
  if (lidarPointsPerSec < 500000) {
    activeFaultsAz.push('LiDAR nöqtə buludu sıxlığı kritikdir (<500k pts/s)');
  }
  if (effectiveCameraClarity < 40) {
    activeFaultsAz.push('Kamera görüntüsü zəifdir və ya linza örtülmüşdür (>60% itki)');
  }
  if (!isRadarActive) {
    activeFaultsAz.push('4D mmWave Radar söndürülüb (Zəruri ehtiyat sensoru)');
  }

  // Weightings: LiDAR 45%, Camera 35%, Radar 20%
  let score = 0;
  score += Math.min(100, (effectiveLidarRange / 200) * 100) * 0.45;
  score += effectiveCameraClarity * 0.35;
  score += (isRadarActive ? Math.min(100, (radarTrackingCount / 32) * 100) : 0) * 0.20;

  const overallConfidence = Math.round(Math.max(5, Math.min(99, score)));
  const isSafe = overallConfidence >= 75 && activeFaultsAz.length === 0;
  const mrmTriggered = overallConfidence < 60 || activeFaultsAz.length >= 2;

  let verdictAz = 'Sensor Füzyon Optimal (Nominal Rejim)';
  if (mrmTriggered) {
    verdictAz = 'KRİTİK XƏTA: Minimum Risk Manevri (MRM) Fəallaşdırıldı (Avtomatik Dayanma)';
  } else if (!isSafe) {
    verdictAz = 'XƏBƏRDARLIQ: Sensor dəqiqliyi azalıb, sürət azaldılmalıdır';
  }

  return {
    lidarDetectionRangeM: Math.round(effectiveLidarRange),
    lidarPointsPerSec,
    cameraOcclusionPercent,
    radarTrackingCount,
    weatherCondition,
    overallPerceptionConfidencePercent: overallConfidence,
    isSafeForAutonomousMode: isSafe,
    fusionVerdictAz: verdictAz,
    mrmTriggered,
    activeFaultsAz,
  };
};

/**
 * Evaluates V2X Telemetry Benchmarks
 */
export const evaluateV2xTelemetry = (
  protocol: V2xProtocol,
  latencyMs: number,
  packetDeliveryRatioPercent: number,
  spatSync: boolean,
  v2pAlert: boolean
): V2xTelemetryResult => {
  let latencyCategoryAz: 'ULTRA_LOW' | 'NOMINAL' | 'ELEVATED' | 'CRITICAL_LATENCY' = 'NOMINAL';
  let isCompliant = true;
  let statusLabelAz = 'V2X Rabitə Sabitdir';
  let actionRequiredAz = 'Normal avtonom əməliyyat davam edir.';

  if (latencyMs <= 15) {
    latencyCategoryAz = 'ULTRA_LOW';
  } else if (latencyMs <= 35) {
    latencyCategoryAz = 'NOMINAL';
  } else if (latencyMs <= 70) {
    latencyCategoryAz = 'ELEVATED';
    statusLabelAz = 'Gecikmə Yüksəkdir (Əyləc məsafəsi artırıldı)';
    actionRequiredAz = 'Sürəti 20% azaldın, sensor buferi artırıldı.';
  } else {
    latencyCategoryAz = 'CRITICAL_LATENCY';
    isCompliant = false;
    statusLabelAz = 'KRİTİK GECİKMƏ (V2X Link İtkisi)';
    actionRequiredAz = 'Təhlükəsizlik sürücüsünə təcili idarəetmə təhvil verilməlidir.';
  }

  if (packetDeliveryRatioPercent < 95) {
    isCompliant = false;
    statusLabelAz = 'Paket İtkisi Yüksəkdir (<95% PDR)';
  }

  const spatSyncStatus = !spatSync
    ? 'DISCONNECTED'
    : packetDeliveryRatioPercent >= 95
    ? 'LOCKED'
    : 'DEGRADED';

  return {
    protocol,
    latencyMs,
    packetDeliveryRatioPercent,
    spatSyncStatus,
    v2pAlertActive: v2pAlert,
    isCompliant,
    statusLabelAz,
    latencyCategoryAz,
    actionRequiredAz,
  };
};

/**
 * Calculates Statutory Autonomous Pilot Road Test & Escort Fees
 */
export const calculateAutonomousPilotFees = (
  saeLevel: SaeAutomationLevel,
  testDurationDays: number,
  requiresPoliceEscort: boolean,
  escortDaysCount: number,
  v2xSpectrumClearance: boolean,
  fhnSafetyStand: boolean,
  currency: Currency = 'AZN'
): AutonomousPilotFeeResult => {
  // Base AYNA pilot permit fee by SAE level
  let baseDailyRate = 25; // AZN/day
  if (saeLevel === 'LEVEL_3_CONDITIONAL_AUTO') baseDailyRate = 35;
  if (saeLevel === 'LEVEL_4_HIGH_AUTOMATION') baseDailyRate = 50;
  if (saeLevel === 'LEVEL_5_FULL_AUTOMATION') baseDailyRate = 65;

  const baseTestingFeeAzn = Math.max(150, baseDailyRate * testDurationDays);

  // BDYP escort fee (120 AZN/escort day)
  const corridorEscortFeeAzn = requiresPoliceEscort ? escortDaysCount * 120 : 0;

  // V2X 5.9 GHz RSU spectrum clearance fee (flat 90 AZN per test campaign)
  const v2xSpectrumClearanceFeeAzn = v2xSpectrumClearance ? 90 : 0;

  // FHN safety stand & fire brigade monitoring standby (flat 80 AZN)
  const fhnSafetyStandFeeAzn = fhnSafetyStand ? 80 : 0;

  const totalPayableAzn =
    baseTestingFeeAzn +
    corridorEscortFeeAzn +
    v2xSpectrumClearanceFeeAzn +
    fhnSafetyStandFeeAzn;

  const totalPayableCurrency = convertAzn(totalPayableAzn, currency);

  return {
    baseTestingFeeAzn,
    corridorEscortFeeAzn,
    v2xSpectrumClearanceFeeAzn,
    fhnSafetyStandFeeAzn,
    totalPayableAzn,
    totalPayableCurrency,
    currency,
    statutoryBasisAz: 'Azərbaycan Respublikası Nazirlər Kabinetinin Qərarı və İTS Tarif Cədvəli',
  };
};

/**
 * Evaluates 10-Point Autonomous Vehicle Safety Checklist
 */
export const evaluateAutonomousSafetyChecklist = (
  checkedIds: Record<string, boolean>,
  items: AutonomousSafetyChecklistItem[]
): {
  totalItems: number;
  completedItems: number;
  compliancePercent: number;
  allMandatoryPassed: boolean;
  isEligibleForPermit: boolean;
  missingMandatoryAz: string[];
} => {
  const totalItems = items.length;
  let completedItems = 0;
  const missingMandatoryAz: string[] = [];

  for (const item of items) {
    const isChecked = !!checkedIds[item.id];
    if (isChecked) {
      completedItems++;
    } else if (item.isMandatory) {
      missingMandatoryAz.push(item.titleAz);
    }
  }

  const compliancePercent = Math.round((completedItems / totalItems) * 100);
  const allMandatoryPassed = missingMandatoryAz.length === 0;
  const isEligibleForPermit = compliancePercent >= 90 && allMandatoryPassed;

  return {
    totalItems,
    completedItems,
    compliancePercent,
    allMandatoryPassed,
    isEligibleForPermit,
    missingMandatoryAz,
  };
};

/**
 * Evaluates 10-Question Theoretical AV Testing Examination Simulator
 */
export const evaluateAutonomousExam = (
  answers: Record<string, number>,
  questions: AutonomousExamQuestion[]
): {
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercent: number;
  isPassed: boolean;
  detailedResults: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: number | undefined;
    correctAnswer: number;
    legalBasisAz: string;
  }>;
} => {
  const totalQuestions = questions.length;
  let correctAnswersCount = 0;

  const detailedResults = questions.map((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctOptionIndex;
    if (isCorrect) correctAnswersCount++;

    return {
      questionId: q.id,
      isCorrect,
      userAnswer,
      correctAnswer: q.correctOptionIndex,
      legalBasisAz: q.legalBasisAz,
    };
  });

  const scorePercent = Math.round((correctAnswersCount / totalQuestions) * 100);
  const isPassed = scorePercent >= 80;

  return {
    totalQuestions,
    correctAnswersCount,
    scorePercent,
    isPassed,
    detailedResults,
  };
};

/**
 * Generates Official AUTONOM-AZ-2026 Electronic Pilot Permit
 */
export const generateOfficialAutonomousPilotPermit = (
  vehiclePlate: string,
  vin: string,
  saeLevel: SaeAutomationLevel,
  corridor: PilotCorridorInfo,
  operatorCompanyAz: string,
  safetyDriverNameAz: string,
  safetyDriverLicense: string,
  vehicleModelAz: string,
  maxSpeedKmh: number,
  v2xProtocol: V2xProtocol,
  totalFeeAzn: number
): OfficialAutonomousPilotPermit => {
  const issueDateObj = new Date();
  const validUntilObj = new Date(issueDateObj.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day testing permit

  const pad = (n: number) => n.toString().padStart(2, '0');
  const issueDate = `${issueDateObj.getFullYear()}-${pad(issueDateObj.getMonth() + 1)}-${pad(issueDateObj.getDate())}`;
  const validUntil = `${validUntilObj.getFullYear()}-${pad(validUntilObj.getMonth() + 1)}-${pad(validUntilObj.getDate())}`;

  const certNumber = Math.floor(10000 + Math.random() * 90000);
  const permitId = `AUTONOM-AZ-2026-${certNumber}`;

  // Deterministic SHA-256 style mock hash
  const rawHash = `${permitId}-${vehiclePlate}-${vin}-${corridor.id}-${issueDate}`;
  let hashVal = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHash.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256SecurityChecksum = Math.abs(hashVal).toString(16).padStart(16, '0').toUpperCase();
  const simaDigitalUid = `SIMA-AYNA-AUTONOM-${Math.abs(hashVal ^ 0x5a5a5a).toString(16).toUpperCase()}`;

  const inspectorId = Math.floor(100 + Math.random() * 900);

  return {
    permitId,
    issueDate,
    validUntil,
    vehiclePlate,
    vin,
    saeLevel,
    saeLevelCode: SAE_LEVEL_DEFINITIONS[saeLevel].code,
    corridorId: corridor.id,
    corridorNameAz: corridor.nameAz,
    operatorCompanyAz,
    safetyDriverNameAz,
    safetyDriverLicense,
    vehicleModelAz,
    maxApprovedSpeedKmh: Math.min(maxSpeedKmh, corridor.maxSpeedKmh),
    v2xProtocol,
    dssadBlackBoxActive: true,
    totalFeeAzn,
    aynaInspectorBadge: `AYNA-INSP-${inspectorId}`,
    sha256SecurityChecksum,
    simaDigitalUid,
  };
};
