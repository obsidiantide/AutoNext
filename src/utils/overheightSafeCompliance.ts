/**
 * Highway Overheight Vehicle Detection System (OHVDS), Bridge & Overpass Clearance Laser Radar SCADA Telemetry Engine
 * Official standards compliance:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Qabarit-hündürlük ölçüləri, körpülər, yolötürücülər və dövlət yol infrastrukturunun zədələnmədən mühafizəsi)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 50, 73: Hündürlük məhdudiyyəti və qabarit tələbləri)
 * - Cabinet of Ministers Resolution No. 104 (Azərbaycan Respublikası Nazirlər Kabinetinin 104 nömrəli Qərarı: İcazə verilən qabarit ölçüləri - Hündürlük maksimum 4.00m, konteynerdaşıyıcılar üçün 4.20m)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.1, 342.1, 353.1: Qabarit hündürlüyünün aşılması, körpü/yolötürücü nişanlarına tabe olmamaq, dövlət yol mülkiyyətinə zərər vurma)
 * - Code of Administrative Offences Article 38 (İXM Maddə 38: 30 gün ərzində 50% güzəştlə ödəniş)
 * - Civil Code of the Republic of Azerbaijan (Mülki Məcəllə Maddə 1108: Körpü və aşırım konstruksiyalarına dəyən maddi ziyanın bərpası)
 * - European Standard EN 1317 & AASHTO Bridge Superstructure Overheight Collision Avoidance Guidelines
 * - State Standards AZS 410 / AZS 342
 */

export type BridgeClearanceType =
  | 'RAILWAY_OVERPASS'
  | 'HIGHWAY_FLYOVER'
  | 'PEDESTRIAN_FOOTBRIDGE'
  | 'AQUEDUCT_ARCH'
  | 'GANTRY_SIGN_TRUSS'
  | 'UNDERPASS_PORTAL';

export type LaserSensorTechnology =
  | 'DUAL_BEAM_PULSED_LIDAR'
  | 'INFRARED_LIGHT_CURTAIN'
  | 'TIME_OF_FLIGHT_RADAR'
  | 'STEREO_3D_VISION';

export type ClearanceStatus =
  | 'SAFE_CLEARANCE'
  | 'MARGINAL_CAUTION'
  | 'CRITICAL_OVERHEIGHT_COLLISION_WARNING';

export type DivertAction =
  | 'PROCEED_NORMAL'
  | 'REDUCE_SPEED_ADVISORY'
  | 'MANDATORY_ESCAPE_SLIP_ROAD'
  | 'EMERGENCY_ARRESTER_BARRIER_DEPLOYED';

export type OverheightVehicleType =
  | 'standard_sedan'
  | 'curtain_sider_tir'
  | 'raised_tipper_dumper'
  | 'heavy_excavator_lowbed'
  | 'double_decker_coach'
  | 'ayna_patrol_interceptor';

export type RoadSurfaceFriction = 'DRY' | 'WET' | 'SNOW_ICE';

export interface OverheightBridgeAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  chainageKm: string;
  coordinates: string;
  structureType: BridgeClearanceType;
  postedClearanceM: number;
  actualLaserClearanceM: number;
  sensorTechnology: LaserSensorTechnology;
  sensorDistanceBeforeBridgeM: number;
  speedLimitKmh: number;
  overheadWarningGantryActive: boolean;
  acousticSirenDb: number;
  escapeSlipRoadAvailable: boolean;
  activeAlarmsCount: number;
  lastCalibrationDate: string;
  status: 'OPTIMAL' | 'WARNING_ACTIVE' | 'CRITICAL_BLOCKED';
}

export interface OverheightVehiclePreset {
  id: string;
  name: string;
  vehicleType: OverheightVehicleType;
  heightMeters: number;
  grossMassKg: number;
  defaultSpeedKmh: number;
  licensePlate: string;
  cargoDescription: string;
}

export interface OverheightSimulationInput {
  vehicleHeightM: number;
  approachSpeedKmh: number;
  vehicleGrossMassKg: number;
  bridgePostedClearanceM: number;
  sensorDistanceBeforeBridgeM: number;
  roadSurfaceFriction: RoadSurfaceFriction;
  driverReactionTimeSec: number;
}

export interface OverheightSimulationResult {
  clearanceMarginM: number;
  clearanceStatus: ClearanceStatus;
  timeToImpactSec: number;
  reactionDistanceM: number;
  brakingDistanceM: number;
  stoppingDistanceM: number;
  safeStoppingMarginM: number;
  divertAction: DivertAction;
  kineticEnergyAtImpactMJ: number;
  acousticWarningSirenActive: boolean;
  acousticWarningDb: number;
  vmsMessageAz: string;
  vmsMessageEn: string;
  statutoryFineAzn: number;
  statutoryFineUsd: number;
  statutoryFineEur: number;
  discountedFineAzn: number;
  pointsPenalty: number;
  legalBasisAz: string;
  structuralDamageLiabilityAzn: number;
}

export interface OverheightChecklistItem {
  id: string;
  code: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  descriptionEn: string;
  category: 'LASER_RADAR' | 'ACOUSTIC_VMS' | 'ROADWAY_GEOMETRY' | 'LEGAL_COMPLIANCE';
  mandatory: boolean;
}

export interface OverheightExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctAnswerIndex: number;
  explanationAz: string;
  explanationEn: string;
  legalRef: string;
}

export interface OverheightCertificate {
  id: string;
  certificateNo: string;
  issueDate: string;
  expiryDate: string;
  licensePlate: string;
  vehicleType: OverheightVehicleType;
  measuredHeightM: number;
  permittedMaxHeightM: number;
  structureId: string;
  structureName: string;
  clearanceMarginM: number;
  status: 'VERIFIED_CLEARANCE' | 'DIVERT_REQUIRED' | 'SPECIAL_PERMIT_VALIDATED';
  simaSignatureUid: string;
  barrierPassPin: string;
  sha256Hash: string;
  qrVerificationUrl: string;
}

// Multi-currency conversion constants (AZN base)
export const AZN_TO_USD = 1 / 1.70;
export const AZN_TO_EUR = 1 / 1.85;

/**
 * Surface friction coefficient lookup
 */
export function getSurfaceFrictionCoefficient(surface: RoadSurfaceFriction): number {
  switch (surface) {
    case 'DRY':
      return 0.72;
    case 'WET':
      return 0.42;
    case 'SNOW_ICE':
      return 0.18;
    default:
      return 0.70;
  }
}

/**
 * Evaluates highway bridge overheight physics, stopping dynamics, and statutory compliance
 */
export function calculateOverheightPhysics(input: OverheightSimulationInput): OverheightSimulationResult {
  const {
    vehicleHeightM,
    approachSpeedKmh,
    vehicleGrossMassKg,
    bridgePostedClearanceM,
    sensorDistanceBeforeBridgeM,
    roadSurfaceFriction,
    driverReactionTimeSec,
  } = input;

  const clearanceMarginM = Number((bridgePostedClearanceM - vehicleHeightM).toFixed(2));

  let clearanceStatus: ClearanceStatus = 'SAFE_CLEARANCE';
  if (clearanceMarginM <= 0) {
    clearanceStatus = 'CRITICAL_OVERHEIGHT_COLLISION_WARNING';
  } else if (clearanceMarginM < 0.30) {
    clearanceStatus = 'MARGINAL_CAUTION';
  } else {
    clearanceStatus = 'SAFE_CLEARANCE';
  }

  // Velocity conversions
  const velocityMs = approachSpeedKmh / 3.6;
  const gravity = 9.81;
  const mu = getSurfaceFrictionCoefficient(roadSurfaceFriction);

  // Time to reach bridge without braking
  const timeToImpactSec = velocityMs > 0 ? Number((sensorDistanceBeforeBridgeM / velocityMs).toFixed(1)) : 999;

  // Stopping distance = Reaction Distance + Braking Distance
  const reactionDistanceM = Number((velocityMs * driverReactionTimeSec).toFixed(1));
  const brakingDistanceM = Number(((velocityMs * velocityMs) / (2 * mu * gravity)).toFixed(1));
  const stoppingDistanceM = Number((reactionDistanceM + brakingDistanceM).toFixed(1));
  const safeStoppingMarginM = Number((sensorDistanceBeforeBridgeM - stoppingDistanceM).toFixed(1));

  // Kinetic energy in MJ: 0.5 * m * v^2 / 10^6
  const kineticEnergyAtImpactMJ = Number(((0.5 * vehicleGrossMassKg * velocityMs * velocityMs) / 1000000).toFixed(2));

  // Divert action logic
  let divertAction: DivertAction = 'PROCEED_NORMAL';
  let acousticWarningSirenActive = false;
  let acousticWarningDb = 0;
  let vmsMessageAz = 'QABARİT TƏHLÜKƏSİZDİR: SƏLİS HƏRƏKƏT EDİN';
  let vmsMessageEn = 'CLEARANCE SAFE: PROCEED SMOOTHLY';

  if (clearanceStatus === 'CRITICAL_OVERHEIGHT_COLLISION_WARNING') {
    acousticWarningSirenActive = true;
    acousticWarningDb = 118; // 118 dBA high-decibel directional acoustic horn
    if (safeStoppingMarginM >= 0) {
      divertAction = 'MANDATORY_ESCAPE_SLIP_ROAD';
      vmsMessageAz = `DİQQƏT: HÜNDÜRLÜK AŞILIB (${vehicleHeightM}m > ${bridgePostedClearanceM}m)! KÖRPÜALTINA GİRMƏ! SAĞA XİLASEDİCİ YOLA ÇIX!`;
      vmsMessageEn = `WARNING: OVERHEIGHT DETECTED (${vehicleHeightM}m > ${bridgePostedClearanceM}m)! DO NOT ENTER! DIVERT RIGHT TO ESCAPE RAMP!`;
    } else {
      divertAction = 'EMERGENCY_ARRESTER_BARRIER_DEPLOYED';
      vmsMessageAz = `TƏCİLİ HƏYƏCAN: MƏSAFƏ ÇATMIR! QƏZA AMORTİZATORU BARYERİ AKTİVLƏŞDİ! TƏCİLİ DAYANIN!`;
      vmsMessageEn = `EMERGENCY ALERT: INSUFFICIENT STOPPING DISTANCE! ARRESTER BARRIER DEPLOYED! FULL EMERGENCY BRAKE!`;
    }
  } else if (clearanceStatus === 'MARGINAL_CAUTION') {
    acousticWarningSirenActive = true;
    acousticWarningDb = 92; // 92 dBA warning chirp
    divertAction = 'REDUCE_SPEED_ADVISORY';
    vmsMessageAz = `XƏBƏRDARLIQ: EHTİYAT PAYI ÇOX AZDIR (+${clearanceMarginM}m)! SÜRƏTİ 30 KM/S-Ə ENDİRİN!`;
    vmsMessageEn = `CAUTION: LOW CLEARANCE MARGIN (+${clearanceMarginM}m)! REDUCE SPEED TO 30 KM/H!`;
  }

  // Statutory Fines & Liability under İXM & Civil Code
  let statutoryFineAzn = 0;
  let pointsPenalty = 0;
  let legalBasisAz = 'İXM Maddə 327.1 / NK 104 - Qaydalara uyğun qabarit';
  let structuralDamageLiabilityAzn = 0;

  if (clearanceStatus === 'CRITICAL_OVERHEIGHT_COLLISION_WARNING') {
    const heightExcess = Math.abs(clearanceMarginM);
    if (heightExcess <= 0.20) {
      statutoryFineAzn = 100;
      pointsPenalty = 3;
      legalBasisAz = 'İXM Maddə 327.1, 342.1 (0.20 metrə qədər qabarit hündürlüyü aşımı)';
    } else if (heightExcess <= 0.50) {
      statutoryFineAzn = 200;
      pointsPenalty = 4;
      legalBasisAz = 'İXM Maddə 342.1, 353.1 (0.20 - 0.50 metr qabarit hündürlüyü aşımı)';
    } else {
      statutoryFineAzn = 350;
      pointsPenalty = 5;
      legalBasisAz = 'İXM Maddə 353.1 (0.50 metrdən çox təhlükəli qabarit hündürlüyü aşımı)';
    }
    // Estimated potential structural impact civil liability if strike occurs
    structuralDamageLiabilityAzn = Math.round(1500 + heightExcess * 4500 + kineticEnergyAtImpactMJ * 800);
  } else if (clearanceStatus === 'MARGINAL_CAUTION' && vehicleHeightM > 4.00) {
    // Exceeds standard Cabinet of Ministers 104 without special permit
    statutoryFineAzn = 50;
    pointsPenalty = 0;
    legalBasisAz = 'NK 104 Qərarı - Xüsusi razılıq olmadan 4.00m standart hündürlük həddinin aşılması';
  }

  const statutoryFineUsd = Number((statutoryFineAzn * AZN_TO_USD).toFixed(2));
  const statutoryFineEur = Number((statutoryFineAzn * AZN_TO_EUR).toFixed(2));
  const discountedFineAzn = Number((statutoryFineAzn * 0.50).toFixed(2)); // 50% prompt discount under İXM Article 38

  return {
    clearanceMarginM,
    clearanceStatus,
    timeToImpactSec,
    reactionDistanceM,
    brakingDistanceM,
    stoppingDistanceM,
    safeStoppingMarginM,
    divertAction,
    kineticEnergyAtImpactMJ,
    acousticWarningSirenActive,
    acousticWarningDb,
    vmsMessageAz,
    vmsMessageEn,
    statutoryFineAzn,
    statutoryFineUsd,
    statutoryFineEur,
    discountedFineAzn,
    pointsPenalty,
    legalBasisAz,
    structuralDamageLiabilityAzn,
  };
}

/**
 * Generates an official verified AAYDA, AYNA & BDYP OVERHEIGHT-SAFE-AZ-2026 Certificate
 */
export function generateOverheightCertificate(
  licensePlate: string,
  vehicleType: OverheightVehicleType,
  measuredHeightM: number,
  structure: OverheightBridgeAsset
): OverheightCertificate {
  const serial = Math.floor(10000 + Math.random() * 90000);
  const certificateNo = `OVERHEIGHT-SAFE-AZ-2026-${serial}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiryDate = expiry.toISOString().split('T')[0];

  const clearanceMarginM = Number((structure.actualLaserClearanceM - measuredHeightM).toFixed(2));

  let status: 'VERIFIED_CLEARANCE' | 'DIVERT_REQUIRED' | 'SPECIAL_PERMIT_VALIDATED' = 'VERIFIED_CLEARANCE';
  if (clearanceMarginM <= 0) {
    status = 'DIVERT_REQUIRED';
  } else if (measuredHeightM > 4.00) {
    status = 'SPECIAL_PERMIT_VALIDATED';
  }

  const simaSignatureUid = `SIMA-AZ-OHVDS-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
  const barrierPassPin = Math.floor(1000 + Math.random() * 9000).toString();

  // Pseudo-SHA256 representation
  const sha256Hash = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const qrVerificationUrl = `https://aayda.gov.az/az/clearance/verify?cert=${certificateNo}&sha=${sha256Hash.substring(0, 16)}`;

  return {
    id: certificateNo,
    certificateNo,
    issueDate,
    expiryDate,
    licensePlate: licensePlate.toUpperCase().trim(),
    vehicleType,
    measuredHeightM,
    permittedMaxHeightM: structure.postedClearanceM,
    structureId: structure.id,
    structureName: structure.nameAz,
    clearanceMarginM,
    status,
    simaSignatureUid,
    barrierPassPin,
    sha256Hash,
    qrVerificationUrl,
  };
}
