/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Digital Development and Transport (AYNA) & Main State Traffic Police (BDYP)
 * Highway Automatic Incident Detection (AID), AI Computer Vision CCTV Video Analytics,
 * Stopped Vehicle / Wrong-Way Driving / Debris Alert SCADA Telemetry Portal (AID-SAFE-AZ-2026)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında avtomatlaşdırılmış idarəetmə sistemləri, intellektual video analitika, qəza aşkarlama və yol hərəkətinin təhlükəsiz təşkili)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 42, 50, 60: Magistral yollarda hərəkət rejimi, əks istiqamətdə hərəkətin və əsassız dayanmanın qadağan edilməsi, təcili xəbərdarlıq sistemləri)
 * - State Standards AZS 410 / AZS 342
 * - European Standard EN 50132-7 / EN 62676-4 (CCTV video surveillance systems for security and traffic applications)
 * - ISO 14827 Standard (Transport Information and Control Systems - Data interfaces between centers)
 * - ONVIF Profile S/G/T (Open Network Video Interface Forum for ITS smart cameras)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.4, 327.1, 330, 327.2, 338.1, 38)
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const AID_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const AID_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertAidCurrency(amountInAzn: number, currency: Currency): number {
  const rate = AID_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type IncidentType =
  | 'STOPPED_VEHICLE'
  | 'WRONG_WAY_DRIVER'
  | 'DEBRIS_OBSTACLE'
  | 'PEDESTRIAN_INTRUSION'
  | 'TRAFFIC_CONGESTION_SHOCKWAVE'
  | 'VEHICLE_FIRE_SMOKE';

export type WeatherCondition =
  | 'CLEAR_DAY'
  | 'RAIN_WET'
  | 'DENSE_FOG'
  | 'NIGHT_IR'
  | 'DUST_WIND';

export type IncidentSeverity =
  | 'CRITICAL_EMERGENCY'
  | 'HIGH_PRIORITY'
  | 'MODERATE_ALERT'
  | 'ADVISORY_MONITOR';

export interface AidCameraNode {
  id: string;
  code: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  kmNumeric: number;
  gpsLat: number;
  gpsLng: number;
  cameraType: string;
  sensorResolution: string; // e.g. "4K UHD (3840x2160)"
  aiFrameRateFps: number;
  opticalZoom: string; // e.g. "36x Optical"
  fiberLatencyMs: number;
  status: 'ONLINE' | 'CALIBRATING' | 'DISPATCH_ACTIVE';
  activeAlertCount: number;
  weatherCondition: WeatherCondition;
}

export interface AidSimulationInput {
  incidentType: IncidentType;
  approachSpeedKmh: number;
  incidentSpeedKmh: number; // for wrong way or slow moving
  distanceToIncidentMeters: number;
  cameraFocalLengthMm: number; // 8 - 120 mm
  detectionLatencySec: number; // 1 - 15 s
  aiFrameRateFps: number; // 15 - 60 fps
  ambientVisibility: WeatherCondition;
  trafficFlowVehPerHour: number; // 200 - 4000
  aiConfidenceThresholdPct: number; // 70 - 99
  driverReactionTimeSec: number; // 0.8 - 2.5 s
  affectedLane: number; // 1, 2, 3, 4
}

export interface OpticalResolutionMetrics {
  targetDistanceMeters: number;
  pixelsPerMeter: number;
  johnsonCriteriaStatus: 'IDENTIFICATION' | 'RECOGNITION' | 'DETECTION' | 'SUB_PIXEL_INSUFFICIENT';
  opticalClarityPct: number;
  effectiveAiConfidencePct: number;
  meanTimeToDetectSec: number;
}

export interface CollisionRiskMetrics {
  closingSpeedKmh: number;
  closingSpeedMs: number;
  timeToCollisionSec: number;
  stoppingDistanceRequiredM: number;
  brakingDistanceM: number;
  reactionDistanceM: number;
  clearanceMarginM: number;
  collisionPredicted: boolean;
  severity: IncidentSeverity;
  secondaryCrashRiskPct: number;
}

export interface ScadaAutomationAction {
  vmsBannerAz: string;
  vmsBannerEn: string;
  vmsBannerRu: string;
  recommendedLaneSignals: string[]; // e.g. ["RED_CROSS", "MERGE_RIGHT", "GREEN_ARROW"]
  recommendedSpeedLimitKmh: number;
  dispatchUnits: string[];
  audibleAlarmPattern: 'CONTINUOUS_KLAXON' | 'FAST_BEEP' | 'MODERATE_CHIME' | 'STANDBY';
}

export interface AidComplianceEvaluation {
  opticalMetrics: OpticalResolutionMetrics;
  collisionMetrics: CollisionRiskMetrics;
  scadaAction: ScadaAutomationAction;
  statutoryFineAzn: number;
  demeritPoints: number;
  statutoryArticle: string;
  violationTitle: string;
}

/**
 * Evaluates optical camera resolution on target according to Johnson's Criteria
 */
export function calculateOpticalResolution(
  distanceMeters: number,
  focalLengthMm: number,
  weather: WeatherCondition,
  fps: number,
  thresholdConfidence: number
): OpticalResolutionMetrics {
  // Image sensor assumed 1/1.8" type (approx 7.2mm horizontal sensor width, 3840 pixels width)
  const sensorWidthMm = 7.2;
  const imageWidthPx = 3840;

  // Horizontal Field of View (HFOV in radians) = 2 * atan(sensorWidth / (2 * focalLength))
  const hfovRad = 2 * Math.atan(sensorWidthMm / (2 * focalLengthMm));
  const sceneWidthMeters = 2 * distanceMeters * Math.tan(hfovRad / 2);

  // Pixels per meter on target
  const rawPpm = sceneWidthMeters > 0 ? imageWidthPx / sceneWidthMeters : 0;
  const pixelsPerMeter = Math.round(rawPpm * 10) / 10;

  // Weather atmospheric attenuation factor
  let weatherFactor = 1.0;
  switch (weather) {
    case 'CLEAR_DAY':
      weatherFactor = 1.0;
      break;
    case 'NIGHT_IR':
      weatherFactor = 0.88;
      break;
    case 'RAIN_WET':
      weatherFactor = 0.82;
      break;
    case 'DUST_WIND':
      weatherFactor = 0.65;
      break;
    case 'DENSE_FOG':
      weatherFactor = 0.52;
      break;
  }

  // Frame rate processing benefit (30+ fps gives temporal tracking boost)
  const fpsFactor = Math.min(1.05, 0.9 + (fps / 60) * 0.15);

  const opticalClarityPct = Math.min(100, Math.round(Math.min(pixelsPerMeter / 60, 1.0) * weatherFactor * 100));

  // Determine Johnson's criteria (Detection: >=6 px/m, Recognition: >=25 px/m, Identification: >=60 px/m)
  let johnsonCriteriaStatus: OpticalResolutionMetrics['johnsonCriteriaStatus'] = 'SUB_PIXEL_INSUFFICIENT';
  if (pixelsPerMeter >= 60) {
    johnsonCriteriaStatus = 'IDENTIFICATION';
  } else if (pixelsPerMeter >= 25) {
    johnsonCriteriaStatus = 'RECOGNITION';
  } else if (pixelsPerMeter >= 6) {
    johnsonCriteriaStatus = 'DETECTION';
  }

  // Effective AI confidence
  const rawConfidence = thresholdConfidence * weatherFactor * fpsFactor * (pixelsPerMeter >= 25 ? 1.0 : pixelsPerMeter / 25);
  const effectiveAiConfidencePct = Math.min(99.8, Math.max(50.0, Math.round(rawConfidence * 10) / 10));

  // Mean time to detect in seconds (faster with higher fps and higher clarity)
  const baseLatency = 2.0;
  const mttd = Math.round((baseLatency + (1 - weatherFactor) * 3.5 + (pixelsPerMeter < 25 ? 2.0 : 0)) * 10) / 10;

  return {
    targetDistanceMeters: distanceMeters,
    pixelsPerMeter,
    johnsonCriteriaStatus,
    opticalClarityPct,
    effectiveAiConfidencePct,
    meanTimeToDetectSec: mttd,
  };
}

/**
 * Calculates collision mechanics, time-to-collision, stopping safety margins, and secondary crash risk
 */
export function calculateCollisionRisk(
  input: AidSimulationInput,
  optical: OpticalResolutionMetrics
): CollisionRiskMetrics {
  const approachSpeedMs = (input.approachSpeedKmh * 1000) / 3600;
  let closingSpeedKmh = input.approachSpeedKmh;

  if (input.incidentType === 'WRONG_WAY_DRIVER') {
    closingSpeedKmh = input.approachSpeedKmh + input.incidentSpeedKmh;
  } else if (input.incidentType === 'TRAFFIC_CONGESTION_SHOCKWAVE') {
    closingSpeedKmh = Math.max(10, input.approachSpeedKmh - input.incidentSpeedKmh);
  }

  const closingSpeedMs = (closingSpeedKmh * 1000) / 3600;

  // Time to collision in seconds
  const timeToCollisionSec = closingSpeedMs > 0
    ? Math.round((input.distanceToIncidentMeters / closingSpeedMs) * 10) / 10
    : 99.9;

  // Road surface friction coefficient
  let frictionMu = 0.75;
  if (input.ambientVisibility === 'RAIN_WET') frictionMu = 0.50;
  if (input.ambientVisibility === 'DENSE_FOG') frictionMu = 0.60;
  if (input.ambientVisibility === 'DUST_WIND') frictionMu = 0.55;

  const g = 9.81;
  const reactionDist = approachSpeedMs * input.driverReactionTimeSec;
  const brakingDist = (approachSpeedMs * approachSpeedMs) / (2 * frictionMu * g);
  const stoppingDistRequired = Math.round((reactionDist + brakingDist) * 10) / 10;

  const clearanceMarginM = Math.round((input.distanceToIncidentMeters - stoppingDistRequired) * 10) / 10;
  const collisionPredicted = clearanceMarginM < 0 || timeToCollisionSec < (input.driverReactionTimeSec + 0.5);

  // Secondary accident risk calculation (based on incident duration unresolved and traffic flow density)
  const trafficFlowRatio = Math.min(1.8, input.trafficFlowVehPerHour / 2200);
  const unresolvedTimeMin = (input.detectionLatencySec + optical.meanTimeToDetectSec + 15) / 60;
  const rawSecRisk = (1 - Math.exp(-0.08 * unresolvedTimeMin * trafficFlowRatio * trafficFlowRatio)) * 100;
  const secondaryCrashRiskPct = Math.min(98.5, Math.max(4.0, Math.round(rawSecRisk * 10) / 10));

  // Determine Severity
  let severity: IncidentSeverity = 'MODERATE_ALERT';
  if (input.incidentType === 'WRONG_WAY_DRIVER') {
    severity = 'CRITICAL_EMERGENCY';
  } else if (input.incidentType === 'VEHICLE_FIRE_SMOKE' || (input.incidentType === 'STOPPED_VEHICLE' && input.affectedLane <= 2)) {
    severity = timeToCollisionSec < 8 ? 'CRITICAL_EMERGENCY' : 'HIGH_PRIORITY';
  } else if (input.incidentType === 'PEDESTRIAN_INTRUSION') {
    severity = 'HIGH_PRIORITY';
  } else if (input.incidentType === 'DEBRIS_OBSTACLE') {
    severity = timeToCollisionSec < 10 ? 'HIGH_PRIORITY' : 'MODERATE_ALERT';
  } else {
    severity = 'ADVISORY_MONITOR';
  }

  return {
    closingSpeedKmh,
    closingSpeedMs: Math.round(closingSpeedMs * 10) / 10,
    timeToCollisionSec,
    stoppingDistanceRequiredM: stoppingDistRequired,
    brakingDistanceM: Math.round(brakingDist * 10) / 10,
    reactionDistanceM: Math.round(reactionDist * 10) / 10,
    clearanceMarginM,
    collisionPredicted,
    severity,
    secondaryCrashRiskPct,
  };
}

/**
 * Determines statutory administrative fine, points, and legal citation under İXM
 */
export function getStatutoryFineDetails(incidentType: IncidentType): {
  fineAzn: number;
  demeritPoints: number;
  article: string;
  violationTitle: string;
} {
  switch (incidentType) {
    case 'WRONG_WAY_DRIVER':
      return {
        fineAzn: 100,
        demeritPoints: 4,
        article: 'İXM Maddə 327.4',
        violationTitle: 'Birtərəfli və ya magistral yolda hərəkətin əks istiqamətinə çıxaraq hərəkət etmə',
      };
    case 'STOPPED_VEHICLE':
      return {
        fineAzn: 40,
        demeritPoints: 0,
        article: 'İXM Maddə 327.1 & Maddə 330',
        violationTitle: 'Magistral yolun hərəkət zolağında əsassız dayanma və ya qəza dayanma nişanını quraşdırmama',
      };
    case 'DEBRIS_OBSTACLE':
      return {
        fineAzn: 80,
        demeritPoints: 3,
        article: 'İXM Maddə 327.2',
        violationTitle: 'Yol hərəkəti hissəsinə yük tökərək və ya əşya buraxaraq qəza təhlükəsi yaratma',
      };
    case 'PEDESTRIAN_INTRUSION':
      return {
        fineAzn: 40,
        demeritPoints: 0,
        article: 'İXM Maddə 338.1',
        violationTitle: 'Piyadaların magistral avtomobil yolunun hərəkət hissəsinə qanunsuz daxil olması',
      };
    case 'VEHICLE_FIRE_SMOKE':
      return {
        fineAzn: 50,
        demeritPoints: 0,
        article: 'İXM Maddə 342.1.7',
        violationTitle: 'Nəqliyyat vasitəsində yanğınsöndürən balonun olmaması və ya təhlükəsizlik qaydalarının pozulması',
      };
    case 'TRAFFIC_CONGESTION_SHOCKWAVE':
    default:
      return {
        fineAzn: 0,
        demeritPoints: 0,
        article: 'YHQ Maddə 50',
        violationTitle: 'Tıxac xəbərdarlığı və təhlükəsiz ara məsafəsi rejimi (İnzibati cərimə tətbiq edilmir)',
      };
  }
}

/**
 * Generates automated SCADA actuation decisions (VMS gantry text, LCS signals, speed limit, dispatch)
 */
export function generateScadaAutomationAction(
  incidentType: IncidentType,
  affectedLane: number,
  severity: IncidentSeverity,
  distanceMeters: number
): ScadaAutomationAction {
  const distRounded = Math.round(distanceMeters / 50) * 50;

  let vmsBannerAz = '';
  let vmsBannerEn = '';
  let vmsBannerRu = '';
  let recSpeed = 60;
  let alarmPattern: ScadaAutomationAction['audibleAlarmPattern'] = 'MODERATE_CHIME';

  const dispatchUnits: string[] = ['BDYP 902 Magistral Patrul Alayı'];

  if (incidentType === 'WRONG_WAY_DRIVER') {
    vmsBannerAz = `TƏHLÜKƏ! ƏKS İSTİQAMƏTDƏ NƏQLİYYAT! SAĞ ZOLAĞA ÇƏKİLİN (${distRounded}m)`;
    vmsBannerEn = `DANGER! WRONG-WAY DRIVER AHEAD! MOVE TO RIGHT LANE (${distRounded}m)`;
    vmsBannerRu = `ОПАСНОСТЬ! АВТОМОБИЛЬ НА ВСТРЕЧНОЙ ПОЛОСЕ! ПРИЖМИТЕСЬ ВПРАВО (${distRounded}м)`;
    recSpeed = 40;
    alarmPattern = 'CONTINUOUS_KLAXON';
    dispatchUnits.push('DİN Xüsusi Əməliyyat Bölüyü', 'AAYDA Qəza Qrupu');
  } else if (incidentType === 'STOPPED_VEHICLE') {
    vmsBannerAz = `DİQQƏT! ZOLAĞDA DAYANMIŞ MAŞIN! SÜRƏTİ AZALDIN (${distRounded}m)`;
    vmsBannerEn = `WARNING! STOPPED VEHICLE IN LANE! REDUCE SPEED (${distRounded}m)`;
    vmsBannerRu = `ВНИМАНИЕ! ОСТАНОВИВШИЙСЯ АВТОМОБИЛЬ В ПОЛОСЕ (${distRounded}м)`;
    recSpeed = 50;
    alarmPattern = 'FAST_BEEP';
    dispatchUnits.push('AAYDA 156 Evakuator Xidməti');
  } else if (incidentType === 'DEBRIS_OBSTACLE') {
    vmsBannerAz = `XƏBƏRDARLIQ! YOLDA TƏHLÜKƏLİ MANEƏ / YÜK QALIQLARI (${distRounded}m)`;
    vmsBannerEn = `CAUTION! DEBRIS & ROAD HAZARD AHEAD (${distRounded}m)`;
    vmsBannerRu = `ОСТОРОЖНО! ПОСТОРОННИЙ ПРЕДМЕТ НА ДОРОГЕ (${distRounded}м)`;
    recSpeed = 60;
    alarmPattern = 'MODERATE_CHIME';
    dispatchUnits.push('AAYDA Yol Təmizləmə və İstismar Briqadası');
  } else if (incidentType === 'PEDESTRIAN_INTRUSION') {
    vmsBannerAz = `TƏCİLİ! YOLDA PİYADA VAR! DİQQƏTLİ OLUN (${distRounded}m)`;
    vmsBannerEn = `EMERGENCY! PEDESTRIAN ON HIGHWAY! SLOW DOWN (${distRounded}m)`;
    vmsBannerRu = `ВНИМАНИЕ! ПЕШЕХОД НА МАГИСТРАЛИ! СНИЗЬТЕ СКОРОСТЬ (${distRounded}м)`;
    recSpeed = 50;
    alarmPattern = 'FAST_BEEP';
    dispatchUnits.push('BDYP Piyada Nəzarət Heyəti');
  } else if (incidentType === 'VEHICLE_FIRE_SMOKE') {
    vmsBannerAz = `TƏHLÜKƏ! YANĞIN VƏ TÜSTÜ! ZOLAQLARI TƏCİLİ TƏRK EDİN (${distRounded}m)`;
    vmsBannerEn = `DANGER! VEHICLE FIRE & SMOKE AHEAD! CLEAR LANES (${distRounded}m)`;
    vmsBannerRu = `ОПАСНОСТЬ! ВОЗГОРАНИЕ АВТОМОБИЛЯ И ДЫМ (${distRounded}м)`;
    recSpeed = 40;
    alarmPattern = 'CONTINUOUS_KLAXON';
    dispatchUnits.push('FHN 112 Yanğınsöndürmə Briqadası', 'TƏBİB Təcili Tibbi Yardım 103');
  } else {
    vmsBannerAz = `DİQQƏT! İRƏLİDƏ TIXAC VƏ SÜRƏT DÜŞMƏSİ (${distRounded}m)`;
    vmsBannerEn = `ADVISORY! CONGESTION & TRAFFIC SLOWDOWN AHEAD (${distRounded}m)`;
    vmsBannerRu = `ПРЕДУПРЕЖДЕНИЕ! ВПЕРЕДИ ЗАТОР И СНИЖЕНИЕ СКОРОСТИ (${distRounded}м)`;
    recSpeed = 70;
    alarmPattern = 'STANDBY';
  }

  // Generate lane control signals for 3 lanes
  const laneSignals: string[] = ['GREEN_ARROW', 'GREEN_ARROW', 'GREEN_ARROW'];
  if (severity === 'CRITICAL_EMERGENCY' || severity === 'HIGH_PRIORITY') {
    const laneIndex = Math.max(0, Math.min(2, affectedLane - 1));
    laneSignals[laneIndex] = 'RED_CROSS';
    if (laneIndex === 0) {
      laneSignals[1] = 'MERGE_RIGHT';
    } else if (laneIndex === 2) {
      laneSignals[1] = 'MERGE_LEFT';
    }
  }

  return {
    vmsBannerAz,
    vmsBannerEn,
    vmsBannerRu,
    recommendedLaneSignals: laneSignals,
    recommendedSpeedLimitKmh: recSpeed,
    dispatchUnits,
    audibleAlarmPattern: alarmPattern,
  };
}

/**
 * Main evaluation orchestrator for AID system
 */
export function evaluateAidCompliance(input: AidSimulationInput): AidComplianceEvaluation {
  const opticalMetrics = calculateOpticalResolution(
    input.distanceToIncidentMeters,
    input.cameraFocalLengthMm,
    input.ambientVisibility,
    input.aiFrameRateFps,
    input.aiConfidenceThresholdPct
  );

  const collisionMetrics = calculateCollisionRisk(input, opticalMetrics);

  const scadaAction = generateScadaAutomationAction(
    input.incidentType,
    input.affectedLane,
    collisionMetrics.severity,
    input.distanceToIncidentMeters
  );

  const fineDetails = getStatutoryFineDetails(input.incidentType);

  return {
    opticalMetrics,
    collisionMetrics,
    scadaAction,
    statutoryFineAzn: fineDetails.fineAzn,
    demeritPoints: fineDetails.demeritPoints,
    statutoryArticle: fineDetails.article,
    violationTitle: fineDetails.violationTitle,
  };
}

/**
 * Generates an official AID-SAFE-AZ-2026 electronic incident telemetry & verification certificate
 */
export function generateAidCertificate(
  cameraNode: AidCameraNode,
  evaluation: AidComplianceEvaluation,
  vehiclePlate: string,
  operatorName: string
): {
  certificateId: string;
  qrHash: string;
  sha256Digest: string;
  issuedAt: string;
  simaSignatureUid: string;
  barrierPIN: string;
  incidentLogReference: string;
} {
  const seed = `${cameraNode.code}-${vehiclePlate}-${evaluation.collisionMetrics.severity}-${Date.now()}`;
  let hashVal = 0;
  for (let i = 0; i < seed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + seed.charCodeAt(i);
    hashVal |= 0;
  }
  const hexHash = Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0');
  const certificateId = `AID-SAFE-AZ-2026-${hexHash}`;
  const sha256Digest = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852${hexHash.toLowerCase()}`;
  const simaSignatureUid = `SIMA-AID-${Math.abs(hashVal % 900000 + 100000)}`;
  const barrierPIN = `${Math.abs(hashVal % 9000 + 1000)}`;
  const incidentLogReference = `SCADA-INC-${cameraNode.corridor.substring(0, 3).toUpperCase()}-${Math.floor(Date.now() / 10000)}`;

  return {
    certificateId,
    qrHash: `https://aayda.gov.az/aid-safe/verify?cert=${certificateId}&sha=${hexHash}`,
    sha256Digest,
    issuedAt: new Date().toISOString(),
    simaSignatureUid,
    barrierPIN,
    incidentLogReference,
  };
}
