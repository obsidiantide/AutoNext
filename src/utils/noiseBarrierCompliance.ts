import { Currency } from '../types/vehicle';

export type RoadSurfaceType = 'dense_asphalt' | 'stone_mastic_sma' | 'concrete' | 'porous_low_noise';

export type BarrierMaterialType = 
  | 'pmma_acrylic' 
  | 'perforated_aluminum' 
  | 'sound_absorbing_concrete' 
  | 'bio_vegetation_wall';

export interface NoiseBarrierCorridor {
  id: string;
  name: string;
  roadCode: string;
  location: string;
  lengthMeters: number;
  barrierHeightMeters: number;
  barrierMaterial: BarrierMaterialType;
  soundAbsorptionDLa: number; // dB, e.g. A3 or A4 rating
  soundInsulationDLR: number; // dB, e.g. B3 rating
  hasBirdAntiCollisionStripes: boolean;
  currentLeqDba: number;
  dayLimitDba: number; // statutory 55 dBA
  nightLimitDba: number; // statutory 45 dBA
  nearestFaçadeDistanceMeters: number;
  trafficVolumeVph: number; // vehicles per hour
  heavyTruckPercentage: number; // %
  speedLimitKmH: number;
  status: 'optimal' | 'warning' | 'critical';
  acousticSensorsCount: number;
  residentialSettlement: string;
}

export interface AcousticCalculationInput {
  trafficVolumeVph: number;
  heavyTruckPercentage: number;
  speedKmH: number;
  roadSurface: RoadSurfaceType;
  barrierHeightMeters: number;
  roadToBarrierDistanceMeters: number;
  barrierToReceiverDistanceMeters: number;
  receiverHeightMeters: number;
  sourceHeightMeters: number;
}

export interface AcousticCalculationResult {
  sourceSoundLevelDba: number;
  pathDifferenceMeters: number;
  fresnelNumber: number;
  barrierInsertionLossDb: number;
  distanceAttenuationDb: number;
  groundAttenuationDb: number;
  receiverSoundLevelDba: number;
  dayLimitCompliance: boolean;
  nightLimitCompliance: boolean;
  acousticReductionPercentage: number;
  healthRiskLevel: 'low' | 'moderate' | 'high' | 'severe';
}

export interface VehicleExhaustTestInput {
  vehiclePlate: string;
  vehicleModel: string;
  exhaustType: 'stock_factory' | 'active_valve_oem' | 'modified_sport_muffler' | 'straight_pipe_pryamotok' | 'electric_ev';
  measuredRpm: number;
  measuredExhaustDba: number;
  measuredHornDba: number;
  hasModifiedMuffler: boolean;
  hasBypassValve: boolean;
  testedInResidentialZone: boolean;
}

export interface VehicleExhaustTestResult {
  isExhaustCompliant: boolean;
  isHornCompliant: boolean;
  exhaustExcessDba: number;
  statutoryFineAzn: number;
  promptDiscountFineAzn: number;
  legalBasis: string;
  penaltyPoints: number;
  confiscationRequired: boolean;
  impoundRequired: boolean;
  inspectionVerdict: 'PASS' | 'WARNING' | 'FAIL';
}

export interface NoiseChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'acoustic_structure' | 'safety_environment' | 'maintenance_sensor';
  isMandatory: boolean;
  standardRef: string;
}

export interface NoiseExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  legalRef: string;
}

export interface NoiseGuardCertificate {
  certificateId: string;
  vehiclePlate: string;
  vehicleModel: string;
  corridorId: string;
  corridorName: string;
  issuedAt: string;
  validUntil: string;
  measuredReceiverDba: number;
  barrierInsertionLossDb: number;
  vehicleExhaustDba: number;
  complianceStatus: 'CERTIFIED' | 'CONDITIONAL' | 'NON_COMPLIANT';
  securityHash: string;
  simaSignatureUid: string;
  barrierPassPin: string;
  inspectorName: string;
}

/**
 * Currency conversion rates relative to AZN (1 AZN base)
 */
export const NOISE_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 / 1.70
  EUR: 0.5405, // 1 / 1.85
};

export const convertNoiseCurrency = (amountAzn: number, target: Currency): number => {
  const rate = NOISE_CURRENCY_RATES[target] ?? 1.0;
  return Number((amountAzn * rate).toFixed(2));
};

/**
 * Calculates highway traffic sound emission level at reference distance (10m).
 * Follows NMPB / ISO 9613 principles adapted for Azerbaijani highway conditions.
 */
export const calculateTrafficSourceNoise = (input: {
  trafficVolumeVph: number;
  heavyTruckPercentage: number;
  speedKmH: number;
  roadSurface: RoadSurfaceType;
}): number => {
  const { trafficVolumeVph, heavyTruckPercentage, speedKmH, roadSurface } = input;
  
  const qTotal = Math.max(1, trafficVolumeVph);
  const pTruck = Math.min(100, Math.max(0, heavyTruckPercentage));
  const v = Math.max(20, Math.min(160, speedKmH));

  // Base sound level at 10m reference distance for Q vehicles/hour (CoRTN / ISO model)
  const baseNoise = 42.2 + 10 * Math.log10(qTotal);

  // Heavy vehicles composition correction: 10 * log10(1 + 0.043 * pTruck)
  const heavyCorrection = 10 * Math.log10(1 + 0.043 * pTruck);

  // Speed correction relative to 75 km/h
  const speedCorrection = 33 * Math.log10(v / 75);

  // Road surface acoustic corrections
  const surfaceCorrections: Record<RoadSurfaceType, number> = {
    dense_asphalt: 0.0,
    stone_mastic_sma: 0.6,
    concrete: 1.8,
    porous_low_noise: -3.5, // Whisper porous asphalt
  };
  const surfaceDelta = surfaceCorrections[roadSurface] ?? 0.0;

  const rawL = baseNoise + heavyCorrection + speedCorrection + surfaceDelta;
  return Number(Math.max(45, Math.min(95, rawL)).toFixed(1));
};

/**
 * Maekawa's barrier diffraction formula:
 * ΔL = 10 * log10(3 + 20 * N) where N is Fresnel number 2*δ/λ
 */
export const calculateMaekawaDiffraction = (
  deltaMeters: number,
  frequencyHz = 500
): { fresnelNumber: number; insertionLossDb: number } => {
  const c = 343; // speed of sound in air (m/s)
  const wavelength = c / frequencyHz;

  if (deltaMeters <= 0) {
    return { fresnelNumber: 0, insertionLossDb: 0 };
  }

  const fresnelNumber = Number(((2 * deltaMeters) / wavelength).toFixed(3));
  // Maekawa formula clamped to max 24 dB (practical transmission limit of standard noise panels)
  const rawLoss = 10 * Math.log10(3 + 20 * fresnelNumber);
  const insertionLossDb = Number(Math.min(24.0, Math.max(0, rawLoss)).toFixed(1));

  return {
    fresnelNumber,
    insertionLossDb,
  };
};

/**
 * Calculates complete acoustic propagation from highway source to residential receiver
 */
export const calculateAcousticPropagation = (
  input: AcousticCalculationInput
): AcousticCalculationResult => {
  const {
    trafficVolumeVph,
    heavyTruckPercentage,
    speedKmH,
    roadSurface,
    barrierHeightMeters,
    roadToBarrierDistanceMeters,
    barrierToReceiverDistanceMeters,
    receiverHeightMeters,
    sourceHeightMeters,
  } = input;

  const d1 = Math.max(1, roadToBarrierDistanceMeters);
  const d2 = Math.max(1, barrierToReceiverDistanceMeters);
  const hs = Math.max(0.1, sourceHeightMeters);
  const hr = Math.max(0.5, receiverHeightMeters);
  const hb = Math.max(0, barrierHeightMeters);

  const sourceSoundLevelDba = calculateTrafficSourceNoise({
    trafficVolumeVph,
    heavyTruckPercentage,
    speedKmH,
    roadSurface,
  });

  // Direct line-of-sight distance
  const dDirect = Math.sqrt(Math.pow(d1 + d2, 2) + Math.pow(hr - hs, 2));

  // Path over the barrier top
  const path1 = Math.sqrt(Math.pow(d1, 2) + Math.pow(hb - hs, 2));
  const path2 = Math.sqrt(Math.pow(d2, 2) + Math.pow(hb - hr, 2));
  const pathOver = path1 + path2;

  // Path difference δ
  // If barrier does not break the line of sight:
  const lineOfSightHeightAtBarrier = hs + (d1 / (d1 + d2)) * (hr - hs);
  const isLineOfSightBroken = hb > lineOfSightHeightAtBarrier;

  const pathDifferenceMeters = isLineOfSightBroken
    ? Number(Math.max(0, pathOver - dDirect).toFixed(3))
    : 0;

  const { fresnelNumber, insertionLossDb: barrierInsertionLossDb } = calculateMaekawaDiffraction(pathDifferenceMeters);

  // Distance geometric spreading attenuation for line source: 10 * log10(d / d0)
  const totalDistance = d1 + d2;
  const distanceAttenuationDb = totalDistance > 10
    ? Number((10 * Math.log10(totalDistance / 10)).toFixed(1))
    : 0;

  // Ground attenuation (semi-porous grass/earth between barrier and facade)
  const groundAttenuationDb = 2.0;

  // Net sound level at resident window
  const netSoundLevel = sourceSoundLevelDba - barrierInsertionLossDb - distanceAttenuationDb - groundAttenuationDb;
  const receiverSoundLevelDba = Number(Math.max(30, netSoundLevel).toFixed(1));

  const dayLimitCompliance = receiverSoundLevelDba <= 55.0;
  const nightLimitCompliance = receiverSoundLevelDba <= 45.0;

  const acousticReductionPercentage = sourceSoundLevelDba > 0
    ? Number((((sourceSoundLevelDba - receiverSoundLevelDba) / sourceSoundLevelDba) * 100).toFixed(1))
    : 0;

  let healthRiskLevel: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  if (receiverSoundLevelDba > 70) {
    healthRiskLevel = 'severe';
  } else if (receiverSoundLevelDba > 60) {
    healthRiskLevel = 'high';
  } else if (receiverSoundLevelDba > 50) {
    healthRiskLevel = 'moderate';
  }

  return {
    sourceSoundLevelDba,
    pathDifferenceMeters,
    fresnelNumber,
    barrierInsertionLossDb,
    distanceAttenuationDb,
    groundAttenuationDb,
    receiverSoundLevelDba,
    dayLimitCompliance,
    nightLimitCompliance,
    acousticReductionPercentage,
    healthRiskLevel,
  };
};

/**
 * Evaluates individual vehicle exhaust & acoustic horn compliance per Azerbaijani Law
 * Law on Road Traffic Annex 1 (Clauses 6.1 & 7.2) and Code of Administrative Offences
 * Articles 342.2-1 (150 AZN modified exhaust) and 329.3 (30 AZN residential honking)
 */
export const evaluateVehicleExhaustAcoustics = (
  input: VehicleExhaustTestInput
): VehicleExhaustTestResult => {
  const {
    exhaustType,
    measuredExhaustDba,
    measuredHornDba,
    hasModifiedMuffler,
    hasBypassValve,
    testedInResidentialZone,
  } = input;

  // Statutory maximum permissible exhaust sound level is 84 dBA (passenger M1) per UNECE R51 / AZS
  const statutoryLimit = 84.0;
  const exhaustExcessDba = Math.max(0, Number((measuredExhaustDba - statutoryLimit).toFixed(1)));

  // Horn standard is 93 to 112 dBA per UNECE R28
  const isHornCompliant = measuredHornDba >= 93 && measuredHornDba <= 112;

  const isIllegalExhaust = 
    hasModifiedMuffler || 
    hasBypassValve || 
    exhaustType === 'straight_pipe_pryamotok' || 
    measuredExhaustDba > statutoryLimit;

  const isExhaustCompliant = !isIllegalExhaust;

  let statutoryFineAzn = 0;
  let penaltyPoints = 0;
  let confiscationRequired = false;
  let impoundRequired = false;
  const legalClauses: string[] = [];

  if (isIllegalExhaust) {
    // İXM Maddə 342.2-1: Qanunsuz konstruksiya dəyişikliyi və normadan artıq səs-küy - 150 AZN
    statutoryFineAzn += 150;
    legalClauses.push('İXM Maddə 342.2-1 (150 AZN səsboğucu qanunsuz konstruksiya)');

    if (exhaustType === 'straight_pipe_pryamotok' || measuredExhaustDba >= 95) {
      confiscationRequired = true;
      impoundRequired = true;
      legalClauses.push('İXM Maddə 96 (Cərimə meydançasına təxliyyə)');
    }
  }

  if (testedInResidentialZone && measuredHornDba > 0) {
    // İXM Maddə 329.3: Yaşayış məntəqələrində və xəstəxana zonalarında əsassız səs siqnalı - 30 AZN
    statutoryFineAzn += 30;
    legalClauses.push('İXM Maddə 329.3 (30 AZN əsassız səs siqnalı)');
  }

  if (!isHornCompliant && measuredHornDba > 112) {
    statutoryFineAzn += 50;
    legalClauses.push('İXM Maddə 342.1.4 (50 AZN qeyri-standart səs siqnalı)');
  }

  const promptDiscountFineAzn = Number((statutoryFineAzn * 0.5).toFixed(2));

  let inspectionVerdict: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  if (statutoryFineAzn > 0) {
    inspectionVerdict = confiscationRequired ? 'FAIL' : 'WARNING';
  }

  return {
    isExhaustCompliant,
    isHornCompliant,
    exhaustExcessDba,
    statutoryFineAzn,
    promptDiscountFineAzn,
    legalBasis: legalClauses.length > 0 ? legalClauses.join('; ') : 'YHQ Əlavə 1 tam uyğundur',
    penaltyPoints,
    confiscationRequired,
    impoundRequired,
    inspectionVerdict,
  };
};

/**
 * Evaluates the 10-point technical checklist
 */
export const evaluateNoiseChecklist = (
  checkedIds: string[],
  items: NoiseChecklistItem[]
): { score: number; passed: boolean; mandatoryPassed: boolean; total: number } => {
  const total = items.length;
  const checkedCount = checkedIds.length;
  const score = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const mandatoryItems = items.filter((item) => item.isMandatory);
  const mandatoryPassed = mandatoryItems.every((item) => checkedIds.includes(item.id));
  const passed = score >= 80 && mandatoryPassed;

  return {
    score,
    passed,
    mandatoryPassed,
    total,
  };
};

/**
 * Grades the 10-question official theoretical examination
 */
export const gradeNoiseExam = (
  answers: Record<number, number>,
  questions: NoiseExamQuestion[]
): { score: number; percentage: number; passed: boolean; total: number } => {
  const total = questions.length;
  let correctCount = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      correctCount += 1;
    }
  });

  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = percentage >= 80;

  return {
    score: correctCount,
    percentage,
    passed,
    total,
  };
};

/**
 * Generates an official electronic NOISE-GUARD-AZ-2026 Certificate
 */
export const generateNoiseGuardCertificate = (params: {
  vehiclePlate: string;
  vehicleModel: string;
  corridor: NoiseBarrierCorridor;
  measuredReceiverDba: number;
  barrierInsertionLossDb: number;
  vehicleExhaustDba: number;
  inspectorName?: string;
}): NoiseGuardCertificate => {
  const {
    vehiclePlate,
    vehicleModel,
    corridor,
    measuredReceiverDba,
    barrierInsertionLossDb,
    vehicleExhaustDba,
    inspectorName = 'Polis Baş Leytenantı E. Məmmədov (BDYP / AAYDA)',
  } = params;

  const now = new Date();
  const validUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const cleanPlate = vehiclePlate.replace(/\s+/g, '-').toUpperCase();
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `NOISE-GUARD-AZ-2026-${randNum}`;

  const isCompliant = vehicleExhaustDba <= 84 && measuredReceiverDba <= corridor.dayLimitDba;
  const complianceStatus: 'CERTIFIED' | 'CONDITIONAL' | 'NON_COMPLIANT' = isCompliant
    ? 'CERTIFIED'
    : vehicleExhaustDba <= 88
    ? 'CONDITIONAL'
    : 'NON_COMPLIANT';

  const securityHash = `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const simaSignatureUid = `SIMA-AZ-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const barrierPassPin = `${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    certificateId,
    vehiclePlate: cleanPlate,
    vehicleModel,
    corridorId: corridor.id,
    corridorName: corridor.name,
    issuedAt: now.toISOString().split('T')[0],
    validUntil: validUntil.toISOString().split('T')[0],
    measuredReceiverDba,
    barrierInsertionLossDb,
    vehicleExhaustDba,
    complianceStatus,
    securityHash,
    simaSignatureUid,
    barrierPassPin,
    inspectorName,
  };
};

/**
 * Searches certificate registry by query string
 */
export const searchNoiseCertificates = (
  query: string,
  certificates: NoiseGuardCertificate[]
): NoiseGuardCertificate[] => {
  const q = query.trim().toLowerCase();
  if (!q) return certificates;

  return certificates.filter((c) =>
    c.certificateId.toLowerCase().includes(q) ||
    c.vehiclePlate.toLowerCase().includes(q) ||
    c.vehicleModel.toLowerCase().includes(q) ||
    c.corridorName.toLowerCase().includes(q) ||
    c.complianceStatus.toLowerCase().includes(q)
  );
};
