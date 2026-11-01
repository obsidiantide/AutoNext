/**
 * Highway Crosswind, Gale-Force Gust SCADA & Aerodynamic Overturning Risk Compliance Engine
 * Official standards compliance:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 4, 37, 50)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 328, 353, 327.1, 38)
 * - State Standards AZS 410 / AZS 342
 * - European Standard EN 1991-1-4 (Actions on Structures - Wind Actions)
 * - World Meteorological Organization (WMO) Beaufort & Gale Warning Standards
 */

export type WindPredominantType = 'khazri' | 'gilavar' | 'local_squall';
export type WindAlertTier = 'normal' | 'advisory' | 'warning' | 'emergency';
export type VehicleAeroType = 'semi_trailer' | 'intercity_bus' | 'box_van' | 'suv_roofbox' | 'crossover' | 'patrol_sedan';
export type RolloverRiskStatus = 'SAFE' | 'ADVISORY' | 'CRITICAL' | 'ROLLOVER_HAZARD';
export type RoadSurfaceFriction = 'dry' | 'wet' | 'slush' | 'ice';

export interface WindCorridorAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  coordinates: string;
  elevationM: number;
  currentWindSpeedMs: number;
  currentGustSpeedMs: number;
  windAzimuthDeg: number;
  predominantWindType: WindPredominantType;
  barrierPorosity: number; // 0.0 (solid) to 1.0 (no barrier), typical porous fence 0.35 - 0.50
  barrierInstalled: boolean;
  barrierHeightM: number;
  alertTier: WindAlertTier;
  recommendedSpeedLimitKmh: number;
}

export interface VehicleAeroProfile {
  id: string;
  name: string;
  type: VehicleAeroType;
  sideAreaM2: number;
  centerOfPressureHeightM: number;
  trackWidthM: number;
  curbMassKg: number;
  typicalSpeedKmh: number;
  cSideDragCoeff: number;
  licensePlate: string;
  rolloverSensitivity: 'very_high' | 'high' | 'moderate' | 'low';
}

export interface WindAeroSimulationInput {
  vehicleSpeedKmh: number;
  windSpeedMs: number;
  gustFactor: number; // 1.0 to 2.0 (peak gust multiplier)
  windAttackAngleDeg: number; // 0° = direct headwind, 90° = pure perpendicular crosswind, 180° = tailwind
  barrierReductionPercent: number; // 0% (no barrier) to 70% (dense aerodynamic wind fence)
  roadCondition: RoadSurfaceFriction;
  vehicleProfile: VehicleAeroProfile;
}

export interface WindAeroCalculationResult {
  relativeAirSpeedMs: number;
  yawAngleDeg: number;
  effectiveWindSpeedMs: number;
  peakGustSpeedMs: number;
  lateralWindSpeedMs: number;
  sideAeroForceN: number;
  overturningMomentNm: number;
  restoringMomentNm: number;
  rolloverRiskFactor: number; // RRF = Overturning Moment / Restoring Moment
  safetyStatus: RolloverRiskStatus;
  dynamicSpeedLimitKmh: number;
  lateralDeviationMarginM: number;
  isOverturningLikely: boolean;
  isTransitPermitted: boolean;
  statutoryFineAzN: number;
  statutoryFineUsd: number;
  statutoryFineEur: number;
  discountedFineAzN: number;
  complianceNotes: string[];
}

export interface WindSafetyChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  category: 'aerodynamics' | 'cargo' | 'tires' | 'scada_vms' | 'regulatory';
  legalRef: string;
  isMandatory: boolean;
}

export interface WindExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  articleRef: string;
}

export interface WindSafeCertificate {
  certificateId: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  corridorId: string;
  corridorName: string;
  windSpeedMs: number;
  gustSpeedMs: number;
  vehicleModel: string;
  sideAreaM2: number;
  rolloverRiskFactor: number;
  barrierPassCode: string;
  qrVerificationUrl: string;
  simaSignatureUid: string;
  sha256Checksum: string;
  complianceStatus: 'PERMITTED' | 'SPEED_RESTRICTED' | 'PROHIBITED';
  dynamicSpeedLimitKmh: number;
}

const AIR_DENSITY_KG_M3 = 1.225; // Standard sea level air density at 15°C
const GRAVITY_M_S2 = 9.80665;
const AZN_TO_USD = 0.5882;
const AZN_TO_EUR = 0.5405;

/**
 * Calculates aerodynamic forces, lateral wind components, overturning moments,
 * and Rollover Risk Factor (RRF) for highway vehicles subject to gale-force winds.
 */
export function calculateAerodynamicForces(input: WindAeroSimulationInput): WindAeroCalculationResult {
  const vehicleSpeedMs = Math.max(0, input.vehicleSpeedKmh / 3.6);
  
  // Calculate effective wind speed after windbreak fence attenuation
  const barrierFactor = Math.max(0, Math.min(0.70, input.barrierReductionPercent / 100));
  const effectiveWindSpeedMs = input.windSpeedMs * (1 - barrierFactor);
  const peakGustSpeedMs = effectiveWindSpeedMs * Math.max(1.0, input.gustFactor);

  // Decompose wind velocity relative to highway heading
  const angleRad = (input.windAttackAngleDeg * Math.PI) / 180;
  const windAlongTrackMs = peakGustSpeedMs * Math.cos(angleRad);
  const lateralWindSpeedMs = peakGustSpeedMs * Math.sin(angleRad);

  // Relative airflow velocity seen by vehicle
  const relAirAlongMs = vehicleSpeedMs + windAlongTrackMs;
  const relativeAirSpeedMs = Math.sqrt(Math.pow(relAirAlongMs, 2) + Math.pow(lateralWindSpeedMs, 2));

  // Aerodynamic yaw angle in degrees
  const yawAngleRad = Math.atan2(Math.abs(lateralWindSpeedMs), Math.max(0.1, relAirAlongMs));
  const yawAngleDeg = (yawAngleRad * 180) / Math.PI;

  // Aerodynamic side force: F_y = 0.5 * rho * v_rel^2 * C_y(beta) * A_side, where C_y(beta) = C_y * sin(beta)
  const effectiveSideDragCoeff = input.vehicleProfile.cSideDragCoeff * Math.sin(yawAngleRad);
  const sideForceN = 0.5 * AIR_DENSITY_KG_M3 * Math.pow(relativeAirSpeedMs, 2) * effectiveSideDragCoeff * input.vehicleProfile.sideAreaM2;

  // Aerodynamic Overturning Moment around outer tire contact patch: M_o = F_y * h_cop
  const overturningMomentNm = sideForceN * input.vehicleProfile.centerOfPressureHeightM;

  // Restoring Gravitational Moment: M_r = m * g * (trackWidth / 2)
  const restoringMomentNm = input.vehicleProfile.curbMassKg * GRAVITY_M_S2 * (input.vehicleProfile.trackWidthM / 2);

  // Rollover Risk Factor (RRF = M_o / M_r)
  const rolloverRiskFactor = restoringMomentNm > 0 ? Number((overturningMomentNm / restoringMomentNm).toFixed(3)) : 1.5;

  // Lateral lane deviation estimation under wind gust (approx. 0.5 * (F_y / m) * t^2 with t=1.2s driver reaction)
  const reactionTimeS = 1.2;
  const lateralAccelMs2 = sideForceN / Math.max(500, input.vehicleProfile.curbMassKg);
  const lateralDeviationMarginM = Number((0.5 * lateralAccelMs2 * Math.pow(reactionTimeS, 2)).toFixed(2));

  // Road friction reduction factor
  let roadFrictionMaxMps = 1.0;
  if (input.roadCondition === 'wet') roadFrictionMaxMps = 0.85;
  if (input.roadCondition === 'slush') roadFrictionMaxMps = 0.65;
  if (input.roadCondition === 'ice') roadFrictionMaxMps = 0.40;

  // Determine safety status
  let safetyStatus: RolloverRiskStatus = 'SAFE';
  let dynamicSpeedLimitKmh = 110;
  let isOverturningLikely = false;
  let isTransitPermitted = true;

  if (rolloverRiskFactor >= 1.0 || peakGustSpeedMs >= 35) {
    safetyStatus = 'ROLLOVER_HAZARD';
    dynamicSpeedLimitKmh = 0;
    isOverturningLikely = true;
    isTransitPermitted = false;
  } else if (rolloverRiskFactor >= 0.75 || peakGustSpeedMs >= 25) {
    safetyStatus = 'CRITICAL';
    dynamicSpeedLimitKmh = Math.min(50, Math.round(50 * roadFrictionMaxMps));
    isOverturningLikely = false;
    isTransitPermitted = input.vehicleProfile.type !== 'semi_trailer';
  } else if (rolloverRiskFactor >= 0.50 || peakGustSpeedMs >= 17) {
    safetyStatus = 'ADVISORY';
    dynamicSpeedLimitKmh = Math.min(70, Math.round(70 * roadFrictionMaxMps));
    isTransitPermitted = true;
  } else {
    safetyStatus = 'SAFE';
    dynamicSpeedLimitKmh = Math.min(90, Math.round(110 * roadFrictionMaxMps));
    isTransitPermitted = true;
  }

  // Statutory administrative fines calculation
  let statutoryFineAzN = 0;
  const complianceNotes: string[] = [];

  if (input.vehicleSpeedKmh > dynamicSpeedLimitKmh && dynamicSpeedLimitKmh > 0) {
    const overSpeed = input.vehicleSpeedKmh - dynamicSpeedLimitKmh;
    if (overSpeed > 40) {
      statutoryFineAzN += 250;
      complianceNotes.push(`İXM Maddə 328.3: Dinamik VMS sürət həddini 40 km/saatdan çox aşma (250 AZN cərimə, 4 cərimə balı).`);
    } else if (overSpeed > 20) {
      statutoryFineAzN += 100;
      complianceNotes.push(`İXM Maddə 328.2: Dinamik VMS sürət həddini 20-40 km/saat aşma (100 AZN cərimə, 3 cərimə balı).`);
    } else {
      statutoryFineAzN += 50;
      complianceNotes.push(`İXM Maddə 328.1: Dinamik VMS sürət həddini 10-20 km/saat aşma (50 AZN cərimə).`);
    }
  }

  if (!isTransitPermitted && input.vehicleSpeedKmh > 0) {
    statutoryFineAzN += 150;
    complianceNotes.push(`İXM Maddə 353: Fövqəladə qasırğa zamanı hərəkəti qadağan olunmuş iri qabaritli nəqliyyatın magistrala daxil olması (150 AZN cərimə).`);
  }

  if (lateralDeviationMarginM > 1.2) {
    complianceNotes.push(`Xəbərdarlıq: Yan külək itələməsi nəticəsində 1.2 metrdən artıq zolaqdan yayınma riski mövcuddur.`);
  }

  const statutoryFineUsd = Number((statutoryFineAzN * AZN_TO_USD).toFixed(2));
  const statutoryFineEur = Number((statutoryFineAzN * AZN_TO_EUR).toFixed(2));
  const discountedFineAzN = Number((statutoryFineAzN * 0.5).toFixed(2)); // 50% prompt discount under İXM Maddə 38

  return {
    relativeAirSpeedMs: Number(relativeAirSpeedMs.toFixed(2)),
    yawAngleDeg: Number(yawAngleDeg.toFixed(1)),
    effectiveWindSpeedMs: Number(effectiveWindSpeedMs.toFixed(2)),
    peakGustSpeedMs: Number(peakGustSpeedMs.toFixed(2)),
    lateralWindSpeedMs: Number(lateralWindSpeedMs.toFixed(2)),
    sideAeroForceN: Math.round(sideForceN),
    overturningMomentNm: Math.round(overturningMomentNm),
    restoringMomentNm: Math.round(restoringMomentNm),
    rolloverRiskFactor,
    safetyStatus,
    dynamicSpeedLimitKmh,
    lateralDeviationMarginM,
    isOverturningLikely,
    isTransitPermitted,
    statutoryFineAzN,
    statutoryFineUsd,
    statutoryFineEur,
    discountedFineAzN,
    complianceNotes,
  };
}

/**
 * Evaluates checklist items for crosswind compliance.
 */
export function evaluateWindChecklist(
  selectedIds: string[],
  allItems: WindSafetyChecklistItem[]
): {
  totalCount: number;
  checkedCount: number;
  mandatoryCount: number;
  checkedMandatoryCount: number;
  isCompliant: boolean;
  scorePercentage: number;
} {
  const totalCount = allItems.length;
  const checkedCount = selectedIds.length;
  const mandatoryItems = allItems.filter(i => i.isMandatory);
  const mandatoryCount = mandatoryItems.length;
  const checkedMandatoryCount = mandatoryItems.filter(i => selectedIds.includes(i.id)).length;
  const isCompliant = checkedMandatoryCount === mandatoryCount;
  const scorePercentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return {
    totalCount,
    checkedCount,
    mandatoryCount,
    checkedMandatoryCount,
    isCompliant,
    scorePercentage,
  };
}

/**
 * Grades the crosswind safety examination.
 */
export function gradeWindExam(
  answers: Record<number, number>,
  questions: WindExamQuestion[]
): {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  isPassed: boolean;
  results: { questionId: number; isCorrect: boolean; selectedOption: number; correctOption: number }[];
} {
  let correctCount = 0;
  const results = questions.map(q => {
    const selected = answers[q.id];
    const isCorrect = selected === q.correctOptionIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      isCorrect,
      selectedOption: selected ?? -1,
      correctOption: q.correctOptionIndex,
    };
  });

  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassed = scorePercentage >= 80;

  return {
    totalQuestions,
    correctAnswers: correctCount,
    scorePercentage,
    isPassed,
    results,
  };
}

/**
 * Generates an official WIND-SAFE-AZ-2026 Electronic Clearance Certificate.
 */
export function generateWindSafeCertificate(
  corridor: WindCorridorAsset,
  vehicle: VehicleAeroProfile,
  input: WindAeroSimulationInput,
  result: WindAeroCalculationResult
): WindSafeCertificate {
  const seed = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `WIND-SAFE-AZ-2026-${seed}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expDateObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const expiryDate = expDateObj.toISOString().split('T')[0];

  const passPin = Math.floor(1000 + Math.random() * 9000).toString();
  const simaUid = `SIMA-GOV-AZ-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
  const sha256Checksum = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  let complianceStatus: 'PERMITTED' | 'SPEED_RESTRICTED' | 'PROHIBITED' = 'PERMITTED';
  if (!result.isTransitPermitted || result.safetyStatus === 'ROLLOVER_HAZARD') {
    complianceStatus = 'PROHIBITED';
  } else if (result.dynamicSpeedLimitKmh < 90) {
    complianceStatus = 'SPEED_RESTRICTED';
  }

  return {
    certificateId,
    issueDate,
    expiryDate,
    vehiclePlate: vehicle.licensePlate,
    corridorId: corridor.id,
    corridorName: corridor.nameAz,
    windSpeedMs: corridor.currentWindSpeedMs,
    gustSpeedMs: result.peakGustSpeedMs,
    vehicleModel: vehicle.name,
    sideAreaM2: vehicle.sideAreaM2,
    rolloverRiskFactor: result.rolloverRiskFactor,
    barrierPassCode: passPin,
    qrVerificationUrl: `https://aayda.gov.az/az/services/wind-safe/verify?cert=${certificateId}&auth=${sha256Checksum.slice(0, 16)}`,
    simaSignatureUid: simaUid,
    sha256Checksum,
    complianceStatus,
    dynamicSpeedLimitKmh: result.dynamicSpeedLimitKmh,
  };
}

/**
 * Searches and verifies a certificate by ID in the mock/registry database.
 */
export function verifyWindCertificate(
  certId: string,
  certificates: WindSafeCertificate[]
): WindSafeCertificate | null {
  if (!certId.trim()) return null;
  const normalized = certId.trim().toUpperCase();
  return certificates.find(c => c.certificateId.toUpperCase() === normalized) || null;
}
