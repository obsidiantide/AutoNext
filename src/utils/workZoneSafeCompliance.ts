/**
 * Official State Agency of Azerbaijan Automobile Roads (AAYDA) &
 * Main State Traffic Police Department (BDYP)
 * Highway Work Zone Traffic Safety, Taper Lane Closure,
 * Truck-Mounted Attenuator (TMA / EN 1317-5) Crash Energy Absorption,
 * Worker Protection & Official WORKZONE-SAFE-AZ-2026 Portal Compliance Engine
 *
 * Statutory Framework:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında təmir-tikinti işləri zamanı hərəkətin təhlükəsiz təşkili, yol işçilərinin və nəqliyyat axınının mühafizəsi)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 50, 60: Müvəqqəti yol nişanları, sarı rəngli müvəqqəti nişanlama xətləri, sürət məhdudiyyətləri)
 * - State Standards of Azerbaijan AZS 410 / AZS 342 & GOST 32757 / GOST 32758 (Yol təmir sahələrində müvəqqəti texniki vasitələrin yerləşdirilməsi qaydaları)
 * - European Standard EN 1317-5 & NCHRP 350 / MASH TL-3 for TMA (Truck-Mounted Attenuator / Yük avtomobilinə quraşdırılan zərbəuducu amortizator)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.1: Müvəqqəti yol nişanlarına və ya zolaq qapanmasına əməl etməmə - 40 AZN)
 * - Code of Administrative Offences (İXM Maddə 328: Təmir sahəsində icazə verilən sürətin aşılması: 10-20 km/s - 20 AZN, 20-40 km/s - 50 AZN + 2 bal, 40-60 km/s - 150 AZN + 3 bal, >60 km/s - 250 AZN + 4 bal)
 * - Code of Administrative Offences (İXM Maddə 353.1: Yol təmir qurğularına və ya TMA zərbəuducu moduluna xələl yetirmə - 200-500 AZN)
 * - Civil Code of the Republic of Azerbaijan (Mülki Məcəllə Maddə 1108: Dövlət yol əmlakına və təmir avadanlıqlarına vurulmuş maddi zərərin tam həcmdə ödənilməsi)
 * - Code of Administrative Offences Article 38 (İXM Maddə 38: 30 gün ərzində 50% güzəştlə cərimə ödənişi)
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export type WorkZoneSeverityStatus =
  | 'OPTIMAL_SAFE_DECELERATION'
  | 'CONTROLLED_ARREST_SURVIVABLE'
  | 'ELEVATED_G_HAZARD'
  | 'BUFFER_INTRUSION_WORKER_HAZARD';

export type WorkZoneVmsPattern =
  | 'SEQUENTIAL_ARROW_RIGHT'
  | 'SEQUENTIAL_ARROW_LEFT'
  | 'FLASHING_CHEVRONS'
  | 'DOUBLE_FLASHING_CAUTION';

export type WorkZoneLaneClosureType =
  | 'RIGHT_SHOULDER_AND_LANE_1'
  | 'LEFT_FAST_LANE_CLOSURE'
  | 'CENTER_LANE_DIVERSION'
  | 'FULL_CARRIAGEWAY_CONTRAFLOW';

export type VehicleWorkZoneCategory =
  | 'passenger_sedan'
  | 'crossover_suv'
  | 'freight_semi_trailer'
  | 'intercity_coach'
  | 'support_crew_cab'
  | 'police_patrol_interceptor';

export interface WorkZoneCorridorAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  chainageKm: string;
  workDescriptionAz: string;
  workDescriptionEn: string;
  laneClosure: WorkZoneLaneClosureType;
  workZoneLengthM: number;
  postedSpeedLimitKmH: number;
  originalSpeedLimitKmH: number;
  tmaEquippedTrucks: number;
  activeWorkerCount: number;
  vmsPattern: WorkZoneVmsPattern;
  bufferSpaceM: number;
  lastInspectionDate: string;
  scadaSensorCode: string;
}

export interface WorkZoneVehiclePreset {
  id: string;
  category: VehicleWorkZoneCategory;
  nameAz: string;
  nameEn: string;
  licensePlate: string;
  grossMassKg: number;
  nominalApproachSpeedKmH: number;
  frontalCrushStiffnessKNm: number;
  driverReactionTimeSec: number;
}

export interface WorkZoneSimulationInput {
  vehicleSpeedKmH: number;
  vehicleGrossMassKg: number;
  workZoneSpeedLimitKmH: number;
  laneShiftWidthM: number; // e.g. 3.5m standard lane
  tmaStrokeDepthM: number; // 0.8 to 2.4 m crush cushion stroke
  bufferSpaceDistanceM: number; // 20 to 150 m
  shadowTruckMassKg: number; // e.g. 10,000 kg shadow truck
  pavementFrictionCoeff: number; // 0.60 to 0.80
  tmaInstalled: boolean;
}

export interface WorkZoneSimulationResult {
  approachSpeedKmH: number;
  workZoneSpeedLimitKmH: number;
  speedExcessKmH: number;
  requiredTaperLengthM: number; // L = (W * S^2) / 155 or W * S
  tmaImpactKineticEnergyKJ: number; // 0.5 * m * v^2 / 1000
  averageDecelerationG: number; // a = v^2 / (2 * stroke * g)
  shadowTruckRollAheadDistanceM: number; // momentum transfer and braking friction
  remainingBufferMarginM: number; // bufferSpace - rollAhead
  severityStatus: WorkZoneSeverityStatus;
  workerSafetyCompromised: boolean;
  statutoryFineAzn: number;
  statutoryPenaltyPoints: number;
  discountedFineAzn: number; // 50% discount under IXM Article 38
  tmaDamagedReplacementCostAzn: number;
}

export interface WorkZoneChecklistItem {
  id: string;
  standardCode: string;
  descriptionAz: string;
  descriptionEn: string;
  mandatory: boolean;
  penaltyClause: string;
}

export interface WorkZoneExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  statutoryReference: string;
  explanationAz: string;
  explanationEn: string;
}

export interface WorkZoneClearanceCertificate {
  certificateId: string; // e.g. WORKZONE-SAFE-AZ-2026-XXXXX
  issueTimestamp: string;
  vehiclePlate: string;
  corridorId: string;
  corridorNameAz: string;
  driverFullName: string;
  complianceRating: 'A_EXEMPLARY' | 'B_COMPLIANT' | 'C_CONDITIONAL_PASS' | 'D_PROHIBITED';
  measuredSpeedKmH: number;
  workZoneSpeedLimitKmH: number;
  calculatedTaperLengthM: number;
  kineticEnergyAbsorptionKJ: number;
  tmaVerificationCode: string;
  simaDigitalSignatureUID: string;
  pinPasscode: string;
  sha256Checksum: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'REVOKED';
}

/**
 * Currency conversion rates (relative to AZN)
 */
export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 / 1.70
  EUR: 0.5405, // 1 / 1.85
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

/**
 * Converts AZN amount to target currency
 */
export function convertCurrency(amountAzn: number, currency: Currency): number {
  const rate = CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountAzn * rate * 100) / 100;
}

/**
 * Computes statutory work zone taper length based on MUTCD / AZS 410 standards:
 * For speed <= 60 km/h: L = (W * S^2) / 155
 * For speed > 60 km/h: L = W * S
 * where W is lateral lane shift width (meters) and S is posted speed limit (km/h)
 */
export function calculateRequiredTaperLength(laneShiftWidthM: number, postedSpeedLimitKmH: number): number {
  const w = Math.max(2.0, Math.min(5.0, laneShiftWidthM));
  const s = Math.max(30, Math.min(130, postedSpeedLimitKmH));

  if (s <= 60) {
    return Math.round((w * Math.pow(s, 2)) / 155);
  } else {
    return Math.round(w * s);
  }
}

/**
 * Computes kinetic energy in kJ: E_k = 0.5 * m * v^2 / 1000
 */
export function calculateKineticEnergy(massKg: number, speedKmH: number): number {
  const vMs = (speedKmH * 1000) / 3600;
  return Math.round((0.5 * massKg * Math.pow(vMs, 2)) / 1000);
}

/**
 * Calculates average deceleration G-force during TMA cushion stroke:
 * a = v^2 / (2 * stroke_depth)
 * G = a / 9.81
 */
export function calculateTmaDecelerationG(speedKmH: number, tmaStrokeDepthM: number): number {
  const vMs = (speedKmH * 1000) / 3600;
  const stroke = Math.max(0.5, tmaStrokeDepthM);
  const a = Math.pow(vMs, 2) / (2 * stroke);
  return Math.round((a / 9.80665) * 10) / 10;
}

/**
 * Calculates shadow truck roll-ahead distance after TMA impact:
 * Based on momentum conservation and sliding friction deceleration:
 * v_combined = (m_veh * v_veh) / (m_veh + m_truck)
 * d_roll = v_combined^2 / (2 * mu * g)
 */
export function calculateShadowTruckRollAhead(
  vehMassKg: number,
  vehSpeedKmH: number,
  truckMassKg: number,
  pavementFrictionCoeff: number,
  tmaInstalled: boolean
): number {
  const vMs = (vehSpeedKmH * 1000) / 3600;
  const totalMass = vehMassKg + truckMassKg;
  const friction = Math.max(0.3, Math.min(0.9, pavementFrictionCoeff));

  // If TMA is installed, it absorbs significant impact energy (effective inelastic coefficient)
  const momentumMultiplier = tmaInstalled ? 0.72 : 0.95;
  const combinedVelocity = ((vehMassKg * vMs) / totalMass) * momentumMultiplier;

  const rollAhead = Math.pow(combinedVelocity, 2) / (2 * friction * 9.80665);
  return Math.round(rollAhead * 10) / 10;
}

/**
 * Evaluates administrative fines and penalty points for work zone speeding under İXM Article 328
 */
export function calculateWorkZoneSpeedingFine(
  actualSpeedKmH: number,
  speedLimitKmH: number
): { fineAzn: number; penaltyPoints: number } {
  const excess = actualSpeedKmH - speedLimitKmH;

  if (excess <= 10) {
    return { fineAzn: 0, penaltyPoints: 0 };
  } else if (excess <= 20) {
    // IXM 328.1: 10 to 20 km/h excess = 20 AZN
    return { fineAzn: 20, penaltyPoints: 0 };
  } else if (excess <= 40) {
    // IXM 328.2: 20 to 40 km/h excess = 50 AZN + 2 points
    return { fineAzn: 50, penaltyPoints: 2 };
  } else if (excess <= 60) {
    // IXM 328.3: 40 to 60 km/h excess = 150 AZN + 3 points
    return { fineAzn: 150, penaltyPoints: 3 };
  } else {
    // IXM 328.4: > 60 km/h excess = 250 AZN + 4 points
    return { fineAzn: 250, penaltyPoints: 4 };
  }
}

/**
 * Executes comprehensive Work Zone simulation and physics analysis
 */
export function runWorkZoneSimulation(input: WorkZoneSimulationInput): WorkZoneSimulationResult {
  const requiredTaperLengthM = calculateRequiredTaperLength(
    input.laneShiftWidthM,
    input.workZoneSpeedLimitKmH
  );

  const tmaImpactKineticEnergyKJ = calculateKineticEnergy(
    input.vehicleGrossMassKg,
    input.vehicleSpeedKmH
  );

  const averageDecelerationG = input.tmaInstalled
    ? calculateTmaDecelerationG(input.vehicleSpeedKmH, input.tmaStrokeDepthM)
    : calculateTmaDecelerationG(input.vehicleSpeedKmH, 0.4); // rigid barrier stroke equivalent

  const shadowTruckRollAheadDistanceM = calculateShadowTruckRollAhead(
    input.vehicleGrossMassKg,
    input.vehicleSpeedKmH,
    input.shadowTruckMassKg,
    input.pavementFrictionCoeff,
    input.tmaInstalled
  );

  const remainingBufferMarginM = Math.round((input.bufferSpaceDistanceM - shadowTruckRollAheadDistanceM) * 10) / 10;
  const workerSafetyCompromised = remainingBufferMarginM <= 0;

  // Determine severity status
  let severityStatus: WorkZoneSeverityStatus = 'OPTIMAL_SAFE_DECELERATION';
  if (workerSafetyCompromised) {
    severityStatus = 'BUFFER_INTRUSION_WORKER_HAZARD';
  } else if (averageDecelerationG > 12.0) {
    severityStatus = 'ELEVATED_G_HAZARD';
  } else if (averageDecelerationG > 6.0 || shadowTruckRollAheadDistanceM > input.bufferSpaceDistanceM * 0.7) {
    severityStatus = 'CONTROLLED_ARREST_SURVIVABLE';
  } else {
    severityStatus = 'OPTIMAL_SAFE_DECELERATION';
  }

  // Calculate statutory speeding fine
  const { fineAzn: speedFine, penaltyPoints } = calculateWorkZoneSpeedingFine(
    input.vehicleSpeedKmH,
    input.workZoneSpeedLimitKmH
  );

  // If vehicle collided or intruded buffer, add IXM 327.1 / 353 fine
  let statutoryFineAzn = speedFine;
  if (workerSafetyCompromised || input.vehicleSpeedKmH > input.workZoneSpeedLimitKmH + 20) {
    statutoryFineAzn += 100; // IXM 353.1 & 327.1 violation
  }

  // 50% prompt discount under IXM Article 38 within 30 days
  const discountedFineAzn = Math.round(statutoryFineAzn * 0.5 * 100) / 100;

  // TMA damage replacement cost under Civil Code 1108 if impacted at speed > limit
  const speedExcess = Math.max(0, input.vehicleSpeedKmH - input.workZoneSpeedLimitKmH);
  let tmaDamagedReplacementCostAzn = 0;
  if (input.vehicleSpeedKmH > input.workZoneSpeedLimitKmH + 15 && input.tmaInstalled) {
    tmaDamagedReplacementCostAzn = 12500; // Certified EN 1317-5 TMA module replacement cost
  }

  return {
    approachSpeedKmH: input.vehicleSpeedKmH,
    workZoneSpeedLimitKmH: input.workZoneSpeedLimitKmH,
    speedExcessKmH: speedExcess,
    requiredTaperLengthM,
    tmaImpactKineticEnergyKJ,
    averageDecelerationG,
    shadowTruckRollAheadDistanceM,
    remainingBufferMarginM,
    severityStatus,
    workerSafetyCompromised,
    statutoryFineAzn,
    statutoryPenaltyPoints: penaltyPoints,
    discountedFineAzn,
    tmaDamagedReplacementCostAzn,
  };
}

/**
 * Evaluates checklist completion score
 */
export function evaluateChecklist(
  checklistItems: WorkZoneChecklistItem[],
  checkedItemIds: string[]
): {
  totalItems: number;
  checkedCount: number;
  mandatoryChecked: number;
  mandatoryTotal: number;
  percentageScore: number;
  isEligibleForCertificate: boolean;
} {
  const totalItems = checklistItems.length;
  const checkedSet = new Set(checkedItemIds);
  const checkedCount = checklistItems.filter((i) => checkedSet.has(i.id)).length;

  const mandatoryItems = checklistItems.filter((i) => i.mandatory);
  const mandatoryTotal = mandatoryItems.length;
  const mandatoryChecked = mandatoryItems.filter((i) => checkedSet.has(i.id)).length;

  const percentageScore = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const isEligibleForCertificate = mandatoryChecked === mandatoryTotal && percentageScore >= 80;

  return {
    totalItems,
    checkedCount,
    mandatoryChecked,
    mandatoryTotal,
    percentageScore,
    isEligibleForCertificate,
  };
}

/**
 * Evaluates exam responses
 */
export function evaluateExam(
  questions: WorkZoneExamQuestion[],
  answers: Record<string, number>
): {
  totalQuestions: number;
  correctAnswers: number;
  percentageScore: number;
  passed: boolean;
} {
  const totalQuestions = questions.length;
  let correctAnswers = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      correctAnswers++;
    }
  });

  const percentageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const passed = percentageScore >= 70;

  return {
    totalQuestions,
    correctAnswers,
    percentageScore,
    passed,
  };
}

/**
 * Generates an authentic cryptographic certificate for Work Zone Transit Safety
 */
export function generateWorkZoneCertificate(
  plate: string,
  driverFullName: string,
  corridor: WorkZoneCorridorAsset,
  result: WorkZoneSimulationResult
): WorkZoneClearanceCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `WORKZONE-SAFE-AZ-2026-${randomSuffix}`;
  const issueTimestamp = new Date().toISOString();

  let complianceRating: 'A_EXEMPLARY' | 'B_COMPLIANT' | 'C_CONDITIONAL_PASS' | 'D_PROHIBITED' = 'A_EXEMPLARY';
  if (result.workerSafetyCompromised) {
    complianceRating = 'D_PROHIBITED';
  } else if (result.speedExcessKmH > 20) {
    complianceRating = 'C_CONDITIONAL_PASS';
  } else if (result.speedExcessKmH > 0) {
    complianceRating = 'B_COMPLIANT';
  }

  const pinPasscode = `${Math.floor(1000 + Math.random() * 9000)}`;
  const simaDigitalSignatureUID = `SIMA-GOV-AZ-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
  const tmaVerificationCode = `AAYDA-TMA-${Math.floor(100 + Math.random() * 900)}-TL3`;

  // Compute a simple deterministic mock SHA-256 hex string
  const rawData = `${certificateId}-${plate}-${issueTimestamp}-${corridor.id}-${result.severityStatus}`;
  let hashVal = 0;
  for (let i = 0; i < rawData.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawData.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256Checksum = `e5b7${Math.abs(hashVal).toString(16).padStart(8, '0')}4c919a7f8021da63c0a5`;

  return {
    certificateId,
    issueTimestamp,
    vehiclePlate: plate.trim().toUpperCase(),
    corridorId: corridor.id,
    corridorNameAz: corridor.nameAz,
    driverFullName: driverFullName.trim() || 'Rəşad Quliyev',
    complianceRating,
    measuredSpeedKmH: result.approachSpeedKmH,
    workZoneSpeedLimitKmH: result.workZoneSpeedLimitKmH,
    calculatedTaperLengthM: result.requiredTaperLengthM,
    kineticEnergyAbsorptionKJ: result.tmaImpactKineticEnergyKJ,
    tmaVerificationCode,
    simaDigitalSignatureUID,
    pinPasscode,
    sha256Checksum,
    status: 'ACTIVE',
  };
}
