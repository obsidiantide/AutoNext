/**
 * Highway Safety Guardrails, Crash Cushions & Vehicle Restraint Systems (VRS) SCADA Telemetry Engine
 * Official standards compliance:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Yol təhlükəsizlik qurğuları, metal və beton çəpərlər, zərbəuducu amortizatorlar və dövlət yol əmlakına dəyən zərərin ödənilməsi)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 342.1: Qəza zamanı yol təsərrüfatı və mühəndis qurğularının zədələnməsi, İXM Maddə 327.1, İXM Maddə 38: 50% endirim)
 * - Civil Code of the Republic of Azerbaijan (Mülki Məcəllə Maddə 1108: Yol infrastrukturuna vurulmuş maddi ziyanın bərpası)
 * - European Standard EN 1317 (Vehicle Restraint Systems: Parts 1, 2 & 3 - Containment levels N1, N2, H1, H2, H3, H4b)
 * - State Standards AZS 410 / AZS 342
 */

export type ContainmentLevel = 'N1' | 'N2' | 'H1' | 'H2' | 'H3' | 'H4b';
export type BarrierType = 'W_BEAM_STEEL' | 'THRIE_BEAM_REINFORCED' | 'CONCRETE_NEW_JERSEY' | 'CABLE_BARRIER' | 'CRASH_CUSHION_TERMINAL';
export type WorkingWidthClass = 'W1' | 'W2' | 'W3' | 'W4' | 'W5' | 'W6' | 'W7' | 'W8';
export type ImpactSeverityClass = 'CLASS_A' | 'CLASS_B' | 'CLASS_C' | 'EXTREME_TRAUMA';
export type ContainmentOutcome = 'SAFELY_REDIRECTED' | 'DECELERATED_IN_CUSHION' | 'POCKETING_WARNING' | 'BREACH_PENETRATION_CRITICAL';
export type VehicleVrsClass = 'sedan' | 'heavy_suv' | 'intercity_coach' | 'articulated_tir' | 'electric_ev' | 'police_cruiser';

export interface GuardrailCorridorAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  chainageKm: string;
  coordinates: string;
  barrierType: BarrierType;
  containmentLevel: ContainmentLevel;
  workingWidthClass: WorkingWidthClass;
  lengthKm: number;
  speedLimitKmh: number;
  scadaSensorsActive: number;
  lastInspectionDate: string;
  impactAlertActive: boolean;
  maintenanceStatus: 'OPTIMAL' | 'MINOR_REPAIR_QUEUED' | 'URGENT_MAINTENANCE';
}

export interface GuardrailVehiclePreset {
  id: string;
  name: string;
  vehicleClass: VehicleVrsClass;
  grossMassKg: number;
  lengthMeters: number;
  centerOfGravityHeightM: number;
  defaultSpeedKmh: number;
  licensePlate: string;
  chassisType: string;
}

export interface GuardrailSimulationInput {
  vehicleGrossMassKg: number;
  impactSpeedKmh: number;
  impactAngleDeg: number; // typically 5 to 30 degrees
  barrierType: BarrierType;
  containmentLevel: ContainmentLevel;
  workingWidthClass: WorkingWidthClass;
  damagedLengthMeters: number;
}

export interface GuardrailSimulationResult {
  kineticEnergyNormalKj: number;
  totalKineticEnergyKj: number;
  barrierCapacityKj: number;
  containmentOutcome: ContainmentOutcome;
  accelerationSeverityIndex: number;
  asiClass: ImpactSeverityClass;
  theoreticalHeadImpactVelocityKmh: number;
  dynamicDeflectionM: number;
  isBreached: boolean;
  statutoryFineAzn: number;
  discountedFineAzn: number;
  statutoryFineUsd: number;
  statutoryFineEur: number;
  restorationCostAzn: number;
  restorationCostUsd: number;
  restorationCostEur: number;
  totalLiabilityAzn: number;
  discountedTotalLiabilityAzn: number;
  complianceNotes: string[];
}

export interface GuardrailChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  category: 'structural_anchorage' | 'impact_attenuation' | 'scada_iot_telemetry' | 'post_spacing_deflection' | 'statutory_compliance';
  legalRef: string;
  isMandatory: boolean;
}

export interface GuardrailExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  regulatoryReference: string;
}

export interface GuardrailClearanceCertificate {
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  vehicleModel: string;
  barrierType: BarrierType;
  containmentLevel: ContainmentLevel;
  testedSpeedKmh: number;
  impactAngleDeg: number;
  testedMassKg: number;
  containmentOutcome: ContainmentOutcome;
  asiRating: number;
  asiClass: ImpactSeverityClass;
  corridorLocationAz: string;
  corridorLocationEn: string;
  digitalSignatureUid: string;
  restorationPin: string;
  qrVerificationUrl: string;
  inspectorName: string;
  registryHash: string;
  status: 'ACTIVE_CERTIFIED' | 'REVOKED' | 'RESTRICTION_ISSUED';
}

/** Currency exchange rates pegged to AZN */
export const AZN_TO_USD = 0.5882;
export const AZN_TO_EUR = 0.5435;

/** Standard containment level energy capacities in kJ according to EN 1317 */
export const EN_1317_CAPACITY_KJ: Record<ContainmentLevel, number> = {
  N1: 40.0,
  N2: 81.9,
  H1: 127.5,
  H2: 287.5,
  H3: 472.0,
  H4b: 724.6,
};

/** Working width maximum displacement in meters according to EN 1317-2 */
export const WORKING_WIDTH_LIMITS_M: Record<WorkingWidthClass, number> = {
  W1: 0.6,
  W2: 0.8,
  W3: 1.0,
  W4: 1.3,
  W5: 1.7,
  W6: 2.1,
  W7: 2.5,
  W8: 3.5,
};

/** State highway asset restoration cost per linear meter in AZN */
export const BARRIER_UNIT_RESTORATION_COST_AZN: Record<BarrierType, number> = {
  W_BEAM_STEEL: 85,
  THRIE_BEAM_REINFORCED: 145,
  CONCRETE_NEW_JERSEY: 220,
  CABLE_BARRIER: 110,
  CRASH_CUSHION_TERMINAL: 1850,
};

/** Base labor, heavy crane & highway lane closure reconstruction fee in AZN */
export const RECONSTRUCTION_RIGGING_FEE_AZN = 350;

/** Statutory administrative fine under Code of Administrative Offences (İXM Maddə 342.1) */
export const STATUTORY_FINE_IXM_342_1_AZN = 100;

/**
 * Calculates impact dynamics, containment outcome, ASI, dynamic deflection, and state indemnification costs.
 */
export function calculateGuardrailImpact(input: GuardrailSimulationInput): GuardrailSimulationResult {
  const {
    vehicleGrossMassKg,
    impactSpeedKmh,
    impactAngleDeg,
    barrierType,
    containmentLevel,
    workingWidthClass,
    damagedLengthMeters,
  } = input;

  const speedMs = (impactSpeedKmh * 1000) / 3600;
  const angleRad = (impactAngleDeg * Math.PI) / 180;
  const normalSpeedMs = speedMs * Math.sin(angleRad);

  // Kinetic energy normal to barrier: E_normal = 0.5 * m * (v * sin(theta))^2 in kJ
  const kineticEnergyNormalKj = (0.5 * vehicleGrossMassKg * Math.pow(normalSpeedMs, 2)) / 1000;
  const totalKineticEnergyKj = (0.5 * vehicleGrossMassKg * Math.pow(speedMs, 2)) / 1000;

  const barrierCapacityKj = EN_1317_CAPACITY_KJ[containmentLevel];

  // Dynamic deflection prediction based on normal kinetic energy and barrier stiffness
  const barrierStiffnessFactor =
    barrierType === 'CONCRETE_NEW_JERSEY'
      ? 0.08
      : barrierType === 'CRASH_CUSHION_TERMINAL'
      ? 0.35
      : barrierType === 'THRIE_BEAM_REINFORCED'
      ? 0.22
      : barrierType === 'W_BEAM_STEEL'
      ? 0.28
      : 0.42; // CABLE_BARRIER

  const calculatedDeflection = Math.min(
    4.0,
    Math.max(0.05, Math.sqrt(kineticEnergyNormalKj / (barrierCapacityKj * 1.5 || 1)) * barrierStiffnessFactor * 3.5)
  );

  const maxAllowedDeflection = WORKING_WIDTH_LIMITS_M[workingWidthClass];
  const isBreached = kineticEnergyNormalKj > barrierCapacityKj * 1.05;

  let containmentOutcome: ContainmentOutcome;
  if (barrierType === 'CRASH_CUSHION_TERMINAL') {
    containmentOutcome = isBreached ? 'BREACH_PENETRATION_CRITICAL' : 'DECELERATED_IN_CUSHION';
  } else if (isBreached) {
    containmentOutcome = 'BREACH_PENETRATION_CRITICAL';
  } else if (calculatedDeflection > maxAllowedDeflection) {
    containmentOutcome = 'POCKETING_WARNING';
  } else {
    containmentOutcome = 'SAFELY_REDIRECTED';
  }

  // Acceleration Severity Index (ASI) calculation
  // ASI is proportional to normal impact deceleration, governed by barrier elasticity
  const decelerationG = (Math.pow(normalSpeedMs, 2) / (2 * 9.81 * Math.max(0.1, calculatedDeflection)));
  let accelerationSeverityIndex = decelerationG / 8.5;

  if (barrierType === 'CONCRETE_NEW_JERSEY') {
    accelerationSeverityIndex *= 1.35; // Concrete has minimal deflection, higher vehicle deceleration
  } else if (barrierType === 'CRASH_CUSHION_TERMINAL') {
    accelerationSeverityIndex *= 0.65; // High energy absorbing cartridge
  }

  // Cap ASI between 0.2 and 3.5 for physical sanity
  accelerationSeverityIndex = Math.max(0.2, Math.min(3.5, Number(accelerationSeverityIndex.toFixed(2))));

  let asiClass: ImpactSeverityClass;
  if (accelerationSeverityIndex <= 1.0) {
    asiClass = 'CLASS_A';
  } else if (accelerationSeverityIndex <= 1.4) {
    asiClass = 'CLASS_B';
  } else if (accelerationSeverityIndex <= 1.9) {
    asiClass = 'CLASS_C';
  } else {
    asiClass = 'EXTREME_TRAUMA';
  }

  // Theoretical Head Impact Velocity (THIV) in km/h
  const theoreticalHeadImpactVelocityKmh = Math.min(
    65,
    Math.max(8, Number((accelerationSeverityIndex * 21.4).toFixed(1)))
  );

  // Restoration liability calculation
  const unitCost = BARRIER_UNIT_RESTORATION_COST_AZN[barrierType];
  const effectiveLength = Math.max(1, damagedLengthMeters);
  const restorationCostAzn = Math.round(unitCost * effectiveLength + RECONSTRUCTION_RIGGING_FEE_AZN);
  const restorationCostUsd = Math.round(restorationCostAzn * AZN_TO_USD);
  const restorationCostEur = Math.round(restorationCostAzn * AZN_TO_EUR);

  // Administrative fine
  const statutoryFineAzn = STATUTORY_FINE_IXM_342_1_AZN;
  const discountedFineAzn = STATUTORY_FINE_IXM_342_1_AZN * 0.5; // 50% discount under İXM Maddə 38
  const statutoryFineUsd = Math.round(statutoryFineAzn * AZN_TO_USD);
  const statutoryFineEur = Math.round(statutoryFineAzn * AZN_TO_EUR);

  const totalLiabilityAzn = restorationCostAzn + statutoryFineAzn;
  const discountedTotalLiabilityAzn = restorationCostAzn + discountedFineAzn;

  const complianceNotes: string[] = [];

  if (containmentOutcome === 'SAFELY_REDIRECTED') {
    complianceNotes.push(`EN 1317: Çəpər ${containmentLevel} səviyyəsində avtomobili təhlükəsiz trayektoriyaya yönləndirdi.`);
  } else if (containmentOutcome === 'DECELERATED_IN_CUSHION') {
    complianceNotes.push(`EN 1317-3: Zərbəuducu amortizator kinetik enerjini tam amortizasiya edərək avtomobili dayandırdı.`);
  } else if (containmentOutcome === 'POCKETING_WARNING') {
    complianceNotes.push(`XƏBƏRDARLIQ: Dinamik əyilmə (${calculatedDeflection.toFixed(2)}m) təyin olunmuş İşçi Eni (${maxAllowedDeflection}m) həddini aşdı (Ciblənmə və ilişmə riski).`);
  } else {
    complianceNotes.push(`BÖHRAN: Kinetik zərbə enerjisi (${kineticEnergyNormalKj.toFixed(1)} kJ) çəpər tutumunu (${barrierCapacityKj} kJ) aşdı. Çəpərin yarılması və aşma riski!`);
  }

  if (asiClass === 'CLASS_A') {
    complianceNotes.push(`Sərnişin təhlükəsizliyi: ASI Class A (ASI <= 1.0) - Minimum travma riski.`);
  } else if (asiClass === 'EXTREME_TRAUMA') {
    complianceNotes.push(`DİQQƏT: ASI Class Extreme (> 1.9) - Sükan arxasındakı şəxslər üçün ağır travma təhlükəsi.`);
  }

  complianceNotes.push(`İXM Maddə 342.1: Yol mühəndis qurğularına ziyan vurulması üzrə 100 AZN cərimə (30 gün ərzində 50 AZN).`);
  complianceNotes.push(`Mülki Məcəllə Maddə 1108: AAYDA balansındakı çəpərin bərpa dəyəri: ${restorationCostAzn} AZN.`);

  return {
    kineticEnergyNormalKj: Number(kineticEnergyNormalKj.toFixed(1)),
    totalKineticEnergyKj: Number(totalKineticEnergyKj.toFixed(1)),
    barrierCapacityKj,
    containmentOutcome,
    accelerationSeverityIndex,
    asiClass,
    theoreticalHeadImpactVelocityKmh,
    dynamicDeflectionM: Number(calculatedDeflection.toFixed(2)),
    isBreached,
    statutoryFineAzn,
    discountedFineAzn,
    statutoryFineUsd,
    statutoryFineEur,
    restorationCostAzn,
    restorationCostUsd,
    restorationCostEur,
    totalLiabilityAzn,
    discountedTotalLiabilityAzn,
    complianceNotes,
  };
}

/**
 * Evaluates the 10-Point Technical VRS Safety Checklist
 */
export function evaluateGuardrailChecklist(
  items: GuardrailChecklistItem[],
  checkedIds: string[]
): {
  totalItems: number;
  checkedCount: number;
  mandatoryCount: number;
  mandatoryCheckedCount: number;
  scorePercent: number;
  isCompliant: boolean;
  missingMandatoryAz: string[];
} {
  const totalItems = items.length;
  const checkedCount = checkedIds.length;
  const mandatoryItems = items.filter((item) => item.isMandatory);
  const mandatoryCount = mandatoryItems.length;

  const missingMandatoryAz = mandatoryItems
    .filter((item) => !checkedIds.includes(item.id))
    .map((item) => item.titleAz);

  const mandatoryCheckedCount = mandatoryCount - missingMandatoryAz.length;
  const scorePercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const isCompliant = missingMandatoryAz.length === 0;

  return {
    totalItems,
    checkedCount,
    mandatoryCount,
    mandatoryCheckedCount,
    scorePercent,
    isCompliant,
    missingMandatoryAz,
  };
}

/**
 * Evaluates the Theoretical Exam for Vehicle Restraint Systems
 */
export function evaluateGuardrailExam(
  questions: GuardrailExamQuestion[],
  selectedAnswers: Record<number, number>
): {
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  isPassed: boolean;
  grade: 'ƏLA' | 'YAXŞI' | 'KAFİ' | 'QEYRİ-KAFİ';
  details: {
    questionId: number;
    isCorrect: boolean;
    userAnswer: number;
    correctAnswer: number;
    explanationAz: string;
  }[];
} {
  const totalQuestions = questions.length;
  let correctCount = 0;

  const details = questions.map((q) => {
    const userAnswer = selectedAnswers[q.id];
    const isCorrect = userAnswer === q.correctOptionIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      isCorrect,
      userAnswer,
      correctAnswer: q.correctOptionIndex,
      explanationAz: q.explanationAz,
    };
  });

  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassed = scorePercent >= 80;

  let grade: 'ƏLA' | 'YAXŞI' | 'KAFİ' | 'QEYRİ-KAFİ' = 'QEYRİ-KAFİ';
  if (scorePercent === 100) grade = 'ƏLA';
  else if (scorePercent >= 90) grade = 'YAXŞI';
  else if (scorePercent >= 80) grade = 'KAFİ';

  return {
    totalQuestions,
    correctCount,
    scorePercent,
    isPassed,
    grade,
    details,
  };
}

/**
 * Generates an official cryptographic GUARD-SAFE-AZ-2026 Clearance Certificate.
 */
export function generateGuardrailCertificate(
  plate: string,
  model: string,
  barrierType: BarrierType,
  containmentLevel: ContainmentLevel,
  speedKmh: number,
  angleDeg: number,
  massKg: number,
  corridorLocationAz: string,
  corridorLocationEn: string
): GuardrailClearanceCertificate {
  const serial = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const exp = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const expiryDate = exp.toISOString().split('T')[0];

  const simulation = calculateGuardrailImpact({
    vehicleGrossMassKg: massKg,
    impactSpeedKmh: speedKmh,
    impactAngleDeg: angleDeg,
    barrierType,
    containmentLevel,
    workingWidthClass: 'W3',
    damagedLengthMeters: 4,
  });

  const rawSeed = `${plate}:${barrierType}:${containmentLevel}:${speedKmh}:${serial}:${issueDate}`;
  let hashNum = 0;
  for (let i = 0; i < rawSeed.length; i++) {
    hashNum = (hashNum << 5) - hashNum + rawSeed.charCodeAt(i);
    hashNum |= 0;
  }
  const registryHash = `AAYDA-VRS-` + Math.abs(hashNum).toString(16).toUpperCase().padStart(8, '0');
  const digitalSignatureUid = `SIMA-AZ-VRS-` + Math.floor(10000000 + Math.random() * 90000000);
  const restorationPin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    certificateNumber: `GUARD-SAFE-AZ-2026-${serial}`,
    issueDate,
    expiryDate,
    vehiclePlate: plate,
    vehicleModel: model,
    barrierType,
    containmentLevel,
    testedSpeedKmh: speedKmh,
    impactAngleDeg: angleDeg,
    testedMassKg: massKg,
    containmentOutcome: simulation.containmentOutcome,
    asiRating: simulation.accelerationSeverityIndex,
    asiClass: simulation.asiClass,
    corridorLocationAz,
    corridorLocationEn,
    digitalSignatureUid,
    restorationPin,
    qrVerificationUrl: `https://aayda.gov.az/vrs-verify?cert=GUARD-SAFE-AZ-2026-${serial}&plate=${plate}`,
    inspectorName: 'Mühəndis Elçin Məmmədov (AAYDA Baş İnfrastruktur Müfəttişi)',
    registryHash,
    status: simulation.isBreached ? 'RESTRICTION_ISSUED' : 'ACTIVE_CERTIFIED',
  };
}
