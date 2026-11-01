/**
 * Highway Emergency Escape Ramp (EER), Gravitational Arrester Bed & Thermal Brake SCADA Telemetry Engine
 * Official standards compliance:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29: Dağ yollarında qəza-xilasedici qurğuların, qravitasiya yataqlarının və SCADA sistemlərinin istismarı)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 37, 50, 73: Dağ yollarında və dik enişlərdə nəqliyyat vasitələrinin texniki sazlığı, əyləc sisteminə nəzarət)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 342.2, 353.1, 327.1, 38)
 * - State Standards AZS 410 / AZS 342
 * - AASHTO A Policy on Geometric Design of Highways and Streets (Emergency Escape Ramps)
 * - European Standard EN 1317 (Road Restraint Systems & Cable Attenuator Barriers)
 */

export type BedMaterialType = 'pea_gravel' | 'crushed_aggregate' | 'sand_gravel' | 'drag_net_hybrid';
export type EscapeVehicleType = 'semi_trailer' | 'heavy_tipper' | 'intercity_coach' | 'medium_box' | 'mountain_van' | 'rescue_winch';
export type BrakeFadeStatus = 'NORMAL' | 'ELEVATED' | 'CRITICAL' | 'COMPLETE_FADE';
export type RampArrestStatus = 'SAFE_STOP' | 'FULL_BED_USED' | 'ARRESTER_NET_ENGAGED' | 'RAMP_OVERRUN_RISK';
export type RampOperationalStatus = 'CLEAR' | 'ENGAGED' | 'MAINTENANCE';

export interface EscapeRampAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  coordinates: string;
  elevationM: number;
  descentGradePercent: number; // e.g. -10.5%
  rampLengthM: number; // e.g. 350m
  rampInclineDeg: number; // e.g. +8.0° (uphill grade)
  bedMaterialType: BedMaterialType;
  bedDepthM: number; // e.g. 0.85m depth
  frictionCoeff: number; // typical rolling resistance in pea gravel = 0.28
  flirCameraActive: boolean;
  entranceStatus: RampOperationalStatus;
  winchTowAnchorPresent: boolean;
  hasCableNetAttenuator: boolean;
  lastInspectionDate: string;
}

export interface EscapeVehicleProfile {
  id: string;
  name: string;
  type: EscapeVehicleType;
  grossMassKg: number;
  brakeType: 'pneumatic_drum' | 'pneumatic_disc' | 'hydraulic_disc';
  rotorCount: number;
  rotorMassKg: number;
  typicalDescentSpeedKmh: number;
  licensePlate: string;
  hasJakeBrakeRetarder: boolean;
}

export interface EscapeRampSimulationInput {
  entrySpeedKmh: number;
  vehicleMassKg: number;
  rampInclineDeg: number;
  bedFrictionCoeff: number;
  brakeTempC: number;
  bedLengthM: number;
  hasCableNetArrester: boolean;
}

export interface EscapeRampCalculationResult {
  entrySpeedMs: number;
  decelerationMps2: number;
  decelerationG: number;
  stoppingDistanceM: number;
  penetrationDepthCm: number;
  kineticEnergyMj: number;
  brakeThermalEnergyMj: number;
  estimatedRotorTempRiseC: number;
  totalBrakeTempC: number;
  brakeFadeStatus: BrakeFadeStatus;
  rampArrestStatus: RampArrestStatus;
  requiresHeavyRotatorWinch: boolean;
  bedLengthRemainingM: number;
  isWithinBedBounds: boolean;
  estimatedRecoveryCostAzN: number;
  estimatedRecoveryCostUsd: number;
  estimatedRecoveryCostEur: number;
  statutoryFineAzN: number;
  statutoryFineUsd: number;
  statutoryFineEur: number;
  discountedFineAzN: number;
  complianceNotes: string[];
}

export interface EscapeRampChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  category: 'brake_system' | 'retarder_jake' | 'bed_infrastructure' | 'scada_flir' | 'emergency_winch';
  legalRef: string;
  isMandatory: boolean;
}

export interface EscapeRampExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  legalBasis: string;
}

export interface EscapeRampCertificate {
  certificateId: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  rampId: string;
  rampName: string;
  entrySpeedKmh: number;
  vehicleMassKg: number;
  stoppingDistanceM: number;
  brakeTempC: number;
  brakeFadeStatus: BrakeFadeStatus;
  recoveryPin: string;
  qrVerificationUrl: string;
  simaSignatureUid: string;
  sha256Checksum: string;
  complianceStatus: 'CLEARED' | 'RECOVERY_DISPATCHED' | 'UNDER_INSPECTION';
  requiresHeavyRotatorWinch: boolean;
}

// Statutory conversion rates
export const ESCAPE_CURRENCY_RATES = {
  AZN: 1.0,
  USD: 0.5882, // ~1.70 AZN/USD
  EUR: 0.5435, // ~1.84 AZN/EUR
};

/**
 * Calculates physics parameters for highway runaway truck arrester bed and thermal brake degradation.
 */
export function calculateEscapeRampPhysics(
  input: EscapeRampSimulationInput,
  currency: 'AZN' | 'USD' | 'EUR' = 'AZN'
): EscapeRampCalculationResult {
  const g = 9.80665; // m/s²
  const entrySpeedMs = (input.entrySpeedKmh * 1000) / 3600;

  // Kinetic energy: E_k = 0.5 * m * v^2
  const kineticEnergyJoules = 0.5 * input.vehicleMassKg * Math.pow(entrySpeedMs, 2);
  const kineticEnergyMj = Math.round((kineticEnergyJoules / 1_000_000) * 100) / 100;

  // Incline angle conversion to radians
  const inclineRad = (input.rampInclineDeg * Math.PI) / 180;

  // Total deceleration on gravitational arrester bed:
  // a = g * (mu * cos(theta) + sin(theta))
  // where mu is bed aggregate rolling shear resistance
  const mu = Math.max(0.12, Math.min(0.40, input.bedFrictionCoeff));
  const effectiveDecelFactor = mu * Math.cos(inclineRad) + Math.sin(inclineRad);
  const decelerationMps2 = Math.max(0.5, g * effectiveDecelFactor);
  const decelerationG = Math.round((decelerationMps2 / g) * 100) / 100;

  // Stopping distance: L_stop = v_0^2 / (2 * a)
  let stoppingDistanceM = Math.pow(entrySpeedMs, 2) / (2 * decelerationMps2);

  // If cable net arrester attenuator is engaged at bed end, it can absorb kinetic energy
  const cableAbsorbReduction = input.hasCableNetArrester ? 0.92 : 1.0;
  stoppingDistanceM = Math.round(stoppingDistanceM * cableAbsorbReduction * 10) / 10;

  // Aggregate penetration depth: z ≈ 0.0035 * v * sqrt(mass / 1000) (cm)
  const penetrationDepthCm = Math.min(
    75,
    Math.round(0.0035 * input.entrySpeedKmh * Math.sqrt(input.vehicleMassKg / 1000) * 10) / 10
  );

  // Brake thermal dissipation calculation
  // Typical steel brake rotor heat capacity c_p ≈ 460 J/(kg·K)
  // Assuming 40% of descent kinetic energy absorbed during brake drag before runaway
  const brakeThermalEnergyJoules = kineticEnergyJoules * 0.45;
  const brakeThermalEnergyMj = Math.round((brakeThermalEnergyJoules / 1_000_000) * 100) / 100;
  
  // Total estimated brake temperature
  const estimatedRotorTempRiseC = Math.round(brakeThermalEnergyJoules / (460 * (input.vehicleMassKg * 0.008)));
  const totalBrakeTempC = Math.round(input.brakeTempC + Math.min(250, estimatedRotorTempRiseC));

  // Determine brake fade status
  let brakeFadeStatus: BrakeFadeStatus = 'NORMAL';
  if (totalBrakeTempC >= 550) {
    brakeFadeStatus = 'COMPLETE_FADE';
  } else if (totalBrakeTempC >= 420) {
    brakeFadeStatus = 'CRITICAL';
  } else if (totalBrakeTempC >= 280) {
    brakeFadeStatus = 'ELEVATED';
  }

  // Determine ramp arrest status
  let rampArrestStatus: RampArrestStatus = 'SAFE_STOP';
  const bedLengthRemainingM = Math.round((input.bedLengthM - stoppingDistanceM) * 10) / 10;
  const isWithinBedBounds = stoppingDistanceM <= input.bedLengthM;

  if (stoppingDistanceM > input.bedLengthM * 1.05) {
    rampArrestStatus = 'RAMP_OVERRUN_RISK';
  } else if (stoppingDistanceM > input.bedLengthM) {
    rampArrestStatus = input.hasCableNetArrester ? 'ARRESTER_NET_ENGAGED' : 'RAMP_OVERRUN_RISK';
  } else if (stoppingDistanceM > input.bedLengthM * 0.85) {
    rampArrestStatus = 'FULL_BED_USED';
  }

  // Requires heavy winch extraction if vehicle has sunk > 15 cm into pea gravel
  const requiresHeavyRotatorWinch = penetrationDepthCm > 15 || stoppingDistanceM > 25;

  // Statutory fines under Azerbaijani Code of Administrative Offences (İXM):
  // - İXM 342.2: Əyləc sistemi nasaz olan nəqliyyat vasitəsini idarə etmə: 100 AZN + 4 cərimə balı
  // - İXM 353.1: Dağ aşırımlarında təhlükəsizlik və sürət qaydalarının pozulması: 80 AZN
  // - İXM 327.1: Dik enişdə məsafə və hərəkət rejimi: 40 AZN
  let statutoryFineAzN = 0;
  const notes: string[] = [];

  if (brakeFadeStatus === 'COMPLETE_FADE' || brakeFadeStatus === 'CRITICAL') {
    statutoryFineAzN += 100;
    notes.push('İXM Maddə 342.2: Əyləc sistemi kritik qızmış və ya işləməyən nəqliyyat vasitəsi (100 AZN)');
  }
  if (input.entrySpeedKmh > 90) {
    statutoryFineAzN += 80;
    notes.push('İXM Maddə 353.1: Dağ enişində icazə verilən təhlükəsiz sürət həddinin aşılması (80 AZN)');
  }
  if (rampArrestStatus === 'RAMP_OVERRUN_RISK') {
    statutoryFineAzN += 40;
    notes.push('İXM Maddə 327.1: Təcili qəza zolağının aşılması və zolaq infrastrukturuna ziyan riski (40 AZN)');
  }

  // Prompt discount under İXM Maddə 38 (50% discount within 30 days)
  const discountedFineAzN = Math.round(statutoryFineAzN * 0.5);

  // Heavy rotator winch extraction tariff (AAYDA / FHN Dağ Xilasetmə Xidməti)
  // Base tariff 250 AZN + 15 AZN per ton + 20 AZN per meter of bed penetration
  let recoveryTariffAzN = 0;
  if (requiresHeavyRotatorWinch) {
    recoveryTariffAzN = 250 + Math.round((input.vehicleMassKg / 1000) * 15) + Math.round(stoppingDistanceM * 1.5);
  }

  const rate = ESCAPE_CURRENCY_RATES[currency];
  const statutoryFineConverted = Math.round(statutoryFineAzN * rate * 100) / 100;
  const recoveryCostConverted = Math.round(recoveryTariffAzN * rate * 100) / 100;

  if (notes.length === 0) {
    notes.push('Nəqliyyat vasitəsinin tormoz və dinamik parametrləri normativ standartlara uyğundur.');
  }

  return {
    entrySpeedMs: Math.round(entrySpeedMs * 10) / 10,
    decelerationMps2: Math.round(decelerationMps2 * 100) / 100,
    decelerationG,
    stoppingDistanceM,
    penetrationDepthCm,
    kineticEnergyMj,
    brakeThermalEnergyMj,
    estimatedRotorTempRiseC,
    totalBrakeTempC,
    brakeFadeStatus,
    rampArrestStatus,
    requiresHeavyRotatorWinch,
    bedLengthRemainingM,
    isWithinBedBounds,
    estimatedRecoveryCostAzN: recoveryTariffAzN,
    estimatedRecoveryCostUsd: Math.round(recoveryTariffAzN * ESCAPE_CURRENCY_RATES.USD * 100) / 100,
    estimatedRecoveryCostEur: Math.round(recoveryTariffAzN * ESCAPE_CURRENCY_RATES.EUR * 100) / 100,
    statutoryFineAzN,
    statutoryFineUsd: Math.round(statutoryFineAzN * ESCAPE_CURRENCY_RATES.USD * 100) / 100,
    statutoryFineEur: Math.round(statutoryFineAzN * ESCAPE_CURRENCY_RATES.EUR * 100) / 100,
    discountedFineAzN,
    complianceNotes: notes,
  };
}

/**
 * Evaluates the safety checklist completion.
 */
export function evaluateEscapeChecklist(
  items: EscapeRampChecklistItem[],
  checkedMap: Record<string, boolean>
): {
  totalItems: number;
  completedItems: number;
  mandatoryTotal: number;
  mandatoryCompleted: number;
  isFullyCompliant: boolean;
  completionPercentage: number;
} {
  const totalItems = items.length;
  const completedItems = items.filter(i => !!checkedMap[i.id]).length;
  const mandatoryItems = items.filter(i => i.isMandatory);
  const mandatoryTotal = mandatoryItems.length;
  const mandatoryCompleted = mandatoryItems.filter(i => !!checkedMap[i.id]).length;

  const isFullyCompliant = mandatoryTotal > 0 && mandatoryCompleted === mandatoryTotal;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    totalItems,
    completedItems,
    mandatoryTotal,
    mandatoryCompleted,
    isFullyCompliant,
    completionPercentage,
  };
}

/**
 * Evaluates the 10-question mountain descent and escape ramp exam.
 */
export function scoreEscapeExam(
  questions: EscapeRampExamQuestion[],
  answers: Record<number, number>
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
 * Generates an official ESCAPE-RAMP-AZ-2026 Electronic Clearance Certificate.
 */
export function generateEscapeRampCertificate(
  ramp: EscapeRampAsset,
  vehicle: EscapeVehicleProfile,
  input: EscapeRampSimulationInput,
  result: EscapeRampCalculationResult
): EscapeRampCertificate {
  const seed = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `ESCAPE-RAMP-AZ-2026-${seed}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expDateObj = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const expiryDate = expDateObj.toISOString().split('T')[0];

  const recoveryPin = Math.floor(1000 + Math.random() * 9000).toString();
  const simaUid = `SIMA-AAYDA-FHN-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
  const sha256Checksum = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  let complianceStatus: 'CLEARED' | 'RECOVERY_DISPATCHED' | 'UNDER_INSPECTION' = 'CLEARED';
  if (result.rampArrestStatus === 'RAMP_OVERRUN_RISK' || result.brakeFadeStatus === 'COMPLETE_FADE') {
    complianceStatus = 'RECOVERY_DISPATCHED';
  } else if (result.requiresHeavyRotatorWinch || result.brakeFadeStatus === 'CRITICAL') {
    complianceStatus = 'UNDER_INSPECTION';
  }

  return {
    certificateId,
    issueDate,
    expiryDate,
    vehiclePlate: vehicle.licensePlate,
    rampId: ramp.id,
    rampName: ramp.nameAz,
    entrySpeedKmh: input.entrySpeedKmh,
    vehicleMassKg: input.vehicleMassKg,
    stoppingDistanceM: result.stoppingDistanceM,
    brakeTempC: result.totalBrakeTempC,
    brakeFadeStatus: result.brakeFadeStatus,
    recoveryPin,
    qrVerificationUrl: `https://aayda.gov.az/az/services/escape-ramp/verify?cert=${certificateId}&auth=${sha256Checksum.slice(0, 16)}`,
    simaSignatureUid: simaUid,
    sha256Checksum,
    complianceStatus,
    requiresHeavyRotatorWinch: result.requiresHeavyRotatorWinch,
  };
}

/**
 * Searches and verifies a certificate by ID in the mock/registry database.
 */
export function verifyEscapeCertificate(
  certId: string,
  certificates: EscapeRampCertificate[]
): EscapeRampCertificate | null {
  if (!certId.trim()) return null;
  const normalized = certId.trim().toUpperCase();
  return certificates.find(c => c.certificateId.toUpperCase() === normalized) || null;
}
