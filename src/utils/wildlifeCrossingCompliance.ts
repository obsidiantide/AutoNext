/**
 * Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Ecology and Natural Resources (ETSN - Ekologiya və Təbii Sərvətlər Nazirliyi) &
 * Main State Traffic Police Department (BDYP)
 * Highway Wildlife Crossing, Ecological Corridor Bio-Telemetry &
 * Smart Overpass/Underpass Animal-Vehicle Collision (AVC) Prevention Portal Engine
 * (AAYDA, ETSN & BDYP Magistral Yollarda Vəhşi Təbiət və Heyvan Keçidləri,
 * Ekoloji Dəhlizlər, Yaşıl Körpü SCADA Bio-Telemetriyası, Termal Heyvan Aşkarlama Radarı
 * və Rəsmi WILD-PASS-AZ-2026 Portalı)
 *
 * Statutory Framework:
 * - Law of the Republic of Azerbaijan "On the Animal Kingdom" (Heyvanlar aləmi haqqında AR Qanunu, Maddə 18, 25: Nəqliyyat magistrallarının layihələndirilməsi və istismarı zamanı vəhşi heyvanların miqrasiya yollarının qorunması)
 * - Law of the Republic of Azerbaijan "On Environmental Protection" (Ətraf mühitin mühafizəsi haqqında AR Qanunu, Maddə 38, 42)
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Avtomobil yolları haqqında AR Qanunu, Maddə 14, 21: Ekoloji təhlükəsizlik və fauna mühafizə qurğuları)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.1: Qadağanedici və ekoloji yol nişanlarına riayət etməmə - 40 AZN cərimə; Maddə 272: Heyvanlar aləminin mühafizəsi qaydalarının pozulması)
 * - Azerbaijan Red Book (Azərbaycan Respublikasının "Qırmızı Kitabı") & Cabinet of Ministers Official Compensation Rates for Damage to Wildlife Fauna
 * - European Standard EN 1793 / EN 1794 & UNECE Guidelines on Wildlife-Permeable Infrastructure Design
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN = 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function formatCurrency(amountAzn: number, currency: Currency): string {
  const rate = CURRENCY_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '₼';
  const converted = amountAzn * rate;
  return `${converted.toFixed(2)} ${symbol}`;
}

export type WildlifeCorridorId =
  | 'hirkan_leopard_corridor'
  | 'shahdag_alpine_corridor'
  | 'shirvan_ceyran_sanctuary'
  | 'goygol_murovdag_corridor'
  | 'altiaghaj_forest_corridor'
  | 'zangezur_araz_corridor';

export type CrossingStructureType =
  | 'landscape_green_overpass'   // Yaşıl Körpü / Ekodukt (>50m enində təbii bitki örtüklü körpü)
  | 'large_mammal_underpass'      // İri Məməlilər üçün Alt Keçid (>12m enində təbii torpaq döşəməli)
  | 'culvert_amphibian_underpass' // Kiçik Fauna və Amfibilər üçün Boru-Tunel Keçidi
  | 'canopy_aerial_bridge';       // Ağac Tacı və Qayalıq Marşrutu Asma Keçidi

export type BioSensorStatus = 'clear_normal' | 'wildlife_detected' | 'critical_on_roadway';
export type DeterrentFenceState = 'standby_silent' | 'active_pulsing_ultrasound' | 'optical_strobe_activated';
export type VmsWarningState =
  | 'normal_open'
  | 'advisory_wildlife_alert'
  | 'speed_reduced_50'
  | 'hazard_stop_animals_crossing';

export type LightingCondition = 'daylight' | 'night_high_beam' | 'night_low_beam';
export type RoadSurfaceFriction = 'dry_asphalt' | 'wet_rain' | 'snow_ice';

export interface WildlifeCorridorAsset {
  id: WildlifeCorridorId;
  nameAz: string;
  nameEn: string;
  highwayCode: string;
  locationAz: string;
  locationEn: string;
  kilometerMarker: string;
  structureType: CrossingStructureType;
  overpassWidthMeters: number;
  primaryFaunaAz: string[];
  primaryFaunaEn: string[];
  targetSpeciesId: AnimalSpeciesId;
  fencingLengthKm: number;
  acousticDeterrentUnits: number;
  flirCameraCount: number;
  geophoneSensorCount: number;
  liveTelemetry: {
    ambientTempC: number;
    sensorStatus: BioSensorStatus;
    aiConfidencePct: number;
    detectedHerdSize: number;
    geophoneTremorHz: number;
    deterrentState: DeterrentFenceState;
    vmsStatus: VmsWarningState;
    advisorySpeedLimitKmH: number;
  };
}

export type AnimalSpeciesId =
  | 'caucasian_leopard'
  | 'goitered_gazelle'
  | 'brown_bear'
  | 'east_caucasian_tur'
  | 'red_deer_maral'
  | 'wild_boar';

export interface AnimalSpeciesProfile {
  id: AnimalSpeciesId;
  commonNameAz: string;
  commonNameEn: string;
  scientificName: string;
  conservationStatusAz: string;
  conservationStatusEn: string;
  isRedBookListed: boolean;
  averageAdultWeightKg: number;
  bodyTemperatureC: number;
  headlightReactionBehaviorAz: string;
  headlightReactionBehaviorEn: string;
  statutoryFaunaCompensationAzn: number; // Qanunvericiliklə müəyyən edilmiş təbiətə dəyən zərər təzminatı
}

export interface StoppingPhysicsInput {
  vehicleSpeedKmH: number;
  lighting: LightingCondition;
  surface: RoadSurfaceFriction;
  animalSpeciesId: AnimalSpeciesId;
  driverReactionTimeSec?: number;
  vehicleMassKg?: number;
}

export interface StoppingPhysicsResult {
  vehicleSpeedKmH: number;
  speedMs: number;
  frictionCoeff: number;
  detectionDistanceM: number;
  reactionDistanceM: number;
  brakingDistanceM: number;
  totalStoppingDistanceM: number;
  safetyMarginM: number;
  isCollisionAvoided: boolean;
  impactSpeedKmH: number;
  kineticImpactJoules: number;
  animalWeightKg: number;
  statutoryAnimalCompensationAzn: number;
  administrativeFineAzn: number;
  promptDiscountFineAzn: number;
  estimatedVehicleDamageAzn: number;
  totalFinancialImpactAzn: number;
  riskRating: 'safe_clear' | 'moderate_caution' | 'high_danger' | 'critical_fatal';
}

export interface WildlifeSafetyChecklistItem {
  id: string;
  category: 'infrared_telemetry' | 'fencing_structure' | 'acoustic_deterrent' | 'vehicle_preparedness';
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  descriptionEn: string;
  mandatoryForPass: boolean;
  statutoryReference: string;
}

export interface WildlifeExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctAnswer: number;
  explanationAz: string;
  explanationEn: string;
  legalCitation: string;
}

export interface WildlifeCrossingCertificate {
  certificateNumber: string; // WILD-PASS-AZ-2026-XXXXX
  simaDigitalUid: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  vehicleModel: string;
  vinCode: string;
  corridorId: WildlifeCorridorId;
  corridorNameAz: string;
  barrierReleasePin: string;
  assignedSpeedLimitKmH: number;
  safetyComplianceRating: 'MÜKƏMMƏL (EXEMPLARY)' | 'STANDART (COMPLIANT)' | 'MƏHDUDİYYƏTLİ (CONDITIONAL)';
  acousticFenceVerified: boolean;
  statutoryEtsnClearanceCode: string;
  cryptographicChecksum: string;
}

/**
 * Calculates vehicle stopping distance, collision impact physics and statutory liability
 */
export function calculateStoppingPhysics(input: StoppingPhysicsInput): StoppingPhysicsResult {
  const reactionTimeSec = input.driverReactionTimeSec ?? 1.2; // Standard alert driver reaction time
  const vehicleMassKg = input.vehicleMassKg ?? 1600; // Average passenger car
  const g = 9.81; // m/s²

  // Friction coefficient
  let frictionCoeff = 0.75;
  if (input.surface === 'wet_rain') {
    frictionCoeff = 0.50;
  } else if (input.surface === 'snow_ice') {
    frictionCoeff = 0.20;
  }

  // Detection distance based on lighting condition
  let detectionDistanceM = 120; // Daylight
  if (input.lighting === 'night_high_beam') {
    detectionDistanceM = 95;
  } else if (input.lighting === 'night_low_beam') {
    detectionDistanceM = 40;
  }

  const speedMs = (input.vehicleSpeedKmH * 1000) / 3600;
  const reactionDistanceM = speedMs * reactionTimeSec;
  const brakingDistanceM = (speedMs * speedMs) / (2 * frictionCoeff * g);
  const totalStoppingDistanceM = reactionDistanceM + brakingDistanceM;

  const safetyMarginM = detectionDistanceM - totalStoppingDistanceM;
  const isCollisionAvoided = safetyMarginM >= 0;

  let impactSpeedKmH = 0;
  let kineticImpactJoules = 0;

  if (!isCollisionAvoided) {
    if (detectionDistanceM <= reactionDistanceM) {
      // Driver hits animal before brakes even engage
      impactSpeedKmH = input.vehicleSpeedKmH;
    } else {
      const distanceUnderBraking = detectionDistanceM - reactionDistanceM;
      const speedSquaredAtImpact = Math.max(0, speedMs * speedMs - 2 * frictionCoeff * g * distanceUnderBraking);
      const impactSpeedMs = Math.sqrt(speedSquaredAtImpact);
      impactSpeedKmH = (impactSpeedMs * 3600) / 1000;
    }
    const impactSpeedMs = (impactSpeedKmH * 1000) / 3600;
    kineticImpactJoules = 0.5 * vehicleMassKg * impactSpeedMs * impactSpeedMs;
  }

  // Species specific damages
  const speciesCompensationMap: Record<AnimalSpeciesId, { weight: number; cost: number }> = {
    caucasian_leopard: { weight: 65, cost: 50000 },
    goitered_gazelle: { weight: 30, cost: 3000 },
    brown_bear: { weight: 260, cost: 4000 },
    east_caucasian_tur: { weight: 110, cost: 2500 },
    red_deer_maral: { weight: 220, cost: 3500 },
    wild_boar: { weight: 130, cost: 800 },
  };

  const speciesData = speciesCompensationMap[input.animalSpeciesId] || { weight: 70, cost: 1500 };
  const animalWeightKg = speciesData.weight;

  let statutoryAnimalCompensationAzn = 0;
  let administrativeFineAzn = 0;
  let estimatedVehicleDamageAzn = 0;

  if (!isCollisionAvoided) {
    statutoryAnimalCompensationAzn = speciesData.cost;
    administrativeFineAzn = 40; // İXM Article 327.1
    // Vehicle damage scales with animal weight and impact kinetic energy
    estimatedVehicleDamageAzn = Math.min(35000, Math.round((kineticImpactJoules / 1000) * (animalWeightKg / 80) * 18));
  }

  const promptDiscountFineAzn = administrativeFineAzn * 0.5;
  const totalFinancialImpactAzn = statutoryAnimalCompensationAzn + promptDiscountFineAzn + estimatedVehicleDamageAzn;

  let riskRating: 'safe_clear' | 'moderate_caution' | 'high_danger' | 'critical_fatal' = 'safe_clear';
  if (!isCollisionAvoided) {
    if (impactSpeedKmH > 70 || animalWeightKg > 150) {
      riskRating = 'critical_fatal';
    } else {
      riskRating = 'high_danger';
    }
  } else if (safetyMarginM < 15) {
    riskRating = 'moderate_caution';
  }

  return {
    vehicleSpeedKmH: input.vehicleSpeedKmH,
    speedMs: Number(speedMs.toFixed(2)),
    frictionCoeff,
    detectionDistanceM,
    reactionDistanceM: Number(reactionDistanceM.toFixed(1)),
    brakingDistanceM: Number(brakingDistanceM.toFixed(1)),
    totalStoppingDistanceM: Number(totalStoppingDistanceM.toFixed(1)),
    safetyMarginM: Number(safetyMarginM.toFixed(1)),
    isCollisionAvoided,
    impactSpeedKmH: Number(impactSpeedKmH.toFixed(1)),
    kineticImpactJoules: Math.round(kineticImpactJoules),
    animalWeightKg,
    statutoryAnimalCompensationAzn,
    administrativeFineAzn,
    promptDiscountFineAzn,
    estimatedVehicleDamageAzn,
    totalFinancialImpactAzn,
    riskRating,
  };
}

/**
 * Evaluates the 10-point technical and ecological wildlife safety checklist
 */
export function evaluateWildlifeChecklist(checkedItemIds: string[]): {
  totalItems: number;
  checkedCount: number;
  percentageScore: number;
  isFullyCompliant: boolean;
  missingMandatoryCount: number;
  ratingAz: string;
  ratingEn: string;
} {
  const totalItems = 10;
  const checkedCount = checkedItemIds.length;
  const percentageScore = Math.min(100, Math.round((checkedCount / totalItems) * 100));
  const isFullyCompliant = checkedCount >= 8;
  const missingMandatoryCount = Math.max(0, 10 - checkedCount);

  let ratingAz = 'QEYRİ-MƏQBULDUR: Ekoloji dəhlizdən keçid tövsiyə edilmir.';
  let ratingEn = 'UNSATISFACTORY: Passage through ecological corridor not recommended.';

  if (percentageScore === 100) {
    ratingAz = 'MÜKƏMMƏL: 100% Ekoloji və fauna təhlükəsizliyi tələblərinə cavab verir.';
    ratingEn = 'EXEMPLARY: 100% compliant with ecological and wildlife safety standards.';
  } else if (percentageScore >= 80) {
    ratingAz = 'STANDART: Fauna mühafizəsi və zolaq qaydalarına tam uyğundur.';
    ratingEn = 'STANDARD: Fully compliant with fauna protection and roadway rules.';
  }

  return {
    totalItems,
    checkedCount,
    percentageScore,
    isFullyCompliant,
    missingMandatoryCount,
    ratingAz,
    ratingEn,
  };
}

/**
 * Grades the 10-question theoretical examination on wildlife crossings and animal kingdom laws
 */
export function gradeWildlifeExam(
  answers: Record<number, number>,
  correctAnswers: Record<number, number>
): {
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  isPassed: boolean;
  certificateEligible: boolean;
  verdictAz: string;
  verdictEn: string;
} {
  const totalQuestions = 10;
  let correctCount = 0;

  for (let i = 1; i <= totalQuestions; i++) {
    if (answers[i] !== undefined && answers[i] === correctAnswers[i]) {
      correctCount++;
    }
  }

  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = correctCount >= 8; // 80% passing threshold
  const certificateEligible = isPassed;

  const verdictAz = isPassed
    ? `MÜVƏFFƏQİYYƏTLİ: ${correctCount}/10 düzgün cavab (${scorePercentage}%). Vəhşi təbiət və ekoloji dəhliz keçid sertifikatı təsdiqləndi.`
    : `KƏSİLDİ: ${correctCount}/10 düzgün cavab (${scorePercentage}%). Keçid balı 80%-dir. Zəhmət olmasa AR "Heyvanlar aləmi haqqında" Qanununu təkrar edin.`;

  const verdictEn = isPassed
    ? `PASSED: ${correctCount}/10 correct answers (${scorePercentage}%). Wildlife corridor transit clearance approved.`
    : `FAILED: ${correctCount}/10 correct answers (${scorePercentage}%). Passing score is 80%. Please review the Wildlife Protection statutes.`;

  return {
    totalQuestions,
    correctCount,
    scorePercentage,
    isPassed,
    certificateEligible,
    verdictAz,
    verdictEn,
  };
}

/**
 * Generates an official AAYDA, ETSN & BDYP Electronic Wildlife Corridor Clearance Certificate
 */
export function generateWildlifeCertificate(params: {
  vehiclePlate: string;
  vehicleModel: string;
  vinCode: string;
  corridor: WildlifeCorridorAsset;
  scorePercentage: number;
}): WildlifeCrossingCertificate {
  const dateObj = new Date();
  const issueDate = dateObj.toISOString().split('T')[0];
  const expDateObj = new Date(dateObj);
  expDateObj.setFullYear(expDateObj.getFullYear() + 1);
  const expiryDate = expDateObj.toISOString().split('T')[0];

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `WILD-PASS-AZ-2026-${randomNum}`;
  const simaDigitalUid = `SIMA-ETSN-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const barrierReleasePin = Math.floor(1000 + Math.random() * 9000).toString();

  let safetyComplianceRating: 'MÜKƏMMƏL (EXEMPLARY)' | 'STANDART (COMPLIANT)' | 'MƏHDUDİYYƏTLİ (CONDITIONAL)' =
    'STANDART (COMPLIANT)';
  if (params.scorePercentage === 100) {
    safetyComplianceRating = 'MÜKƏMMƏL (EXEMPLARY)';
  } else if (params.scorePercentage < 80) {
    safetyComplianceRating = 'MƏHDUDİYYƏTLİ (CONDITIONAL)';
  }

  const cleanPlate = params.vehiclePlate.trim().toUpperCase().replace(/\s+/g, '-');
  const cleanVin = params.vinCode.trim().toUpperCase();
  const rawHash = `${certificateNumber}|${cleanPlate}|${cleanVin}|${params.corridor.id}|${issueDate}|ETSN-AAYDA-AZE`;
  let hashVal = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHash.charCodeAt(i);
    hashVal |= 0;
  }
  const cryptographicChecksum = `SHA256:${Math.abs(hashVal).toString(16).toUpperCase().padStart(12, '0')}${randomNum}`;

  return {
    certificateNumber,
    simaDigitalUid,
    issueDate,
    expiryDate,
    vehiclePlate: cleanPlate,
    vehicleModel: params.vehicleModel,
    vinCode: cleanVin,
    corridorId: params.corridor.id,
    corridorNameAz: params.corridor.nameAz,
    barrierReleasePin,
    assignedSpeedLimitKmH: params.corridor.liveTelemetry.advisorySpeedLimitKmH,
    safetyComplianceRating,
    acousticFenceVerified: true,
    statutoryEtsnClearanceCode: `ETSN-BIO-${params.corridor.kilometerMarker.replace(/[^0-9]/g, '')}`,
    cryptographicChecksum,
  };
}
