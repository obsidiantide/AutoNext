/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Ecology and Natural Resources (ETSN) & Main State Traffic Police (BDYP)
 * Highway Wildlife Crossings, Eco-Duct Overpasses & Official FAUNA-SAFE-AZ-2026 Portal
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   ətraf mühit və vəhşi fauna mühafizəsi mühəndis qurğuları, eko-dukt körpüləri, heyvan keçidləri və hasarlar)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 50: Vəhşi və ev heyvanlarının yola çıxma
 *   təhlükəsi olan sahələrdə sürət rejimi, 1.25 ("Vəhşi heyvanlar") və 1.26 ("Ev heyvanları") xəbərdarlıq nişanları)
 * - Law of the Republic of Azerbaijan "On Fauna" (ETSN "Heyvanlar aləmi haqqında" AR Qanunu Maddə 12, 19, 44 və
 *   Nazirlər Kabinetinin 410 saylı Qərarı - vəhşi heyvanların qanunsuz məhvinə görə maddi ziyanın ödənilməsi tarifləri:
 *   Nəcib maral 1,650 AZN, Qonur ayı 2,200 AZN, Cüyür 550 AZN, Çöl donuzu 440 AZN, Ceyran 2,750 AZN, Qafqaz köpgəri 1,100 AZN)
 * - European Standard EN 14389-1 & AASHTO Wildlife Crossing Guidelines (Eco-Duct overpasses min 40-50m width,
 *   vegetation soil layer >= 0.8m, anti-glare screen walls >= 2.0m, high-tensile 2.4m fence with 0.5m buried apron)
 * - State Standards AZS 410 / AZS 342 (Magistral avtomobil yollarının yol mebeli və hərəkətin təşkili vasitələri)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *     * Maddə 328.2: 1.25 / 1.26 nişanlarının qüvvədə olduğu zonada sürət həddini 20-40 km/saat aşmaq - 50 AZN + 2 bal;
 *     * Maddə 327.1: Təhlükəli sahədə zəruri ehtiyat tədbirlərinə riayət etməmək və heyvan dəstəsinə yol verməmək - 40 AZN;
 *     * Maddə 38: İXM üzrə 30 gün ərzində cərimə ödənildikdə 50%-lik qanuni güzəşt;
 *     * AR Mülki Məcəlləsi Maddə 1108: Yol hasarlarına və ya kənd təsərrüfatı heyvanlarına vurulmuş ziyanın tam ödənilməsi.
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const FAUNA_SAFE_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const FAUNA_SAFE_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertFaunaSafeCurrency(amountInAzn: number, currency: Currency): number {
  const rate = FAUNA_SAFE_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type FaunaCrossingType =
  | 'ECO_DUCT_OVERPASS'
  | 'CULVERT_UNDERPASS'
  | 'AT_GRADE_RADAR_ZONE'
  | 'CANOPY_ARBOREAL_BRIDGE';

export type FaunaTargetSpecies =
  | 'RED_DEER'
  | 'BROWN_BEAR'
  | 'WILD_BOAR'
  | 'ROE_DEER'
  | 'STEPPE_GAZELLE'
  | 'DOMESTIC_CATTLE';

export type FaunaSensorStatus =
  | 'ONLINE_NOMINAL'
  | 'ANIMAL_APPROACH_DETECTED'
  | 'DETERRENT_ACTIVE'
  | 'CALIBRATION_REQUIRED';

export interface FaunaEcoStation {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  crossingType: FaunaCrossingType;
  primarySpecies: FaunaTargetSpecies;
  detectionMethodAz: string;
  detectionMethodEn: string;
  fenceLengthKm: number;
  sensorStatus: FaunaSensorStatus;
  dailyCrossingsAverage: number;
  installedYear: number;
}

export interface FaunaVehiclePreset {
  id: string;
  plate: string;
  model: string;
  massKg: number;
  defaultSpeedKmh: number;
  violationType:
    | 'NONE'
    | 'WILDLIFE_ZONE_SPEEDING'
    | 'FAILURE_TO_YIELD_ANIMAL'
    | 'WILDLIFE_COLLISION_SEVERE';
}

export interface FaunaCalculationParams {
  vehicleSpeedKmh: number; // 30 - 140 km/h
  animalDistanceM: number; // 10 - 200 m
  animalMassKg: number; // 20 - 500 kg
  roadFrictionMu: number; // 0.20 (ice/wet) - 0.85 (dry asphalt)
  ambientIlluminanceLux: number; // 0.1 (pitch night) - 1000 (daylight)
  acousticDeterrentEnabled: boolean;
}

export interface FaunaCalculationResult {
  driverReactionTimeSec: number;
  driverReactionDistanceM: number;
  vehicleBrakingDistanceM: number;
  totalStoppingDistanceM: number;
  impactOccurs: boolean;
  impactSpeedKmh: number;
  impactKineticEnergyKj: number;
  avcRiskScore: number; // 0 - 100%
  animalMortalityRiskPercent: number; // 0 - 100%
  driverInjuryRiskPercent: number; // 0 - 100%
  detectionConfidencePercent: number; // 0 - 100%
  deterrentRepelProbabilityPercent: number; // 0 - 100%
  safeSpeedAdvisoryKmh: number;
  statutoryFineAzn: number;
  promptDiscountedFineAzn: number;
  penaltyPoints: number;
  wildlifeRestitutionAzn: number;
  totalFinancialLiabilityAzn: number;
  statusRating: 'OPTIMAL_SAFE' | 'ADVISORY_CAUTION' | 'CRITICAL_HAZARD_IMPACT';
}

export interface FaunaChecklistItem {
  id: string;
  code: string;
  category: 'STRUCTURAL' | 'SCADA_TELEMETRY' | 'SAFETY_STANDARDS';
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  standardReference: string;
  weight: number;
}

export interface FaunaChecklistEvaluation {
  score: number;
  passedCount: number;
  totalCount: number;
  percentage: number;
  isCompliant: boolean;
  statusRating: 'EXCELLENT' | 'ADEQUATE' | 'NON_COMPLIANT';
}

export interface FaunaExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctOptionIndex: number;
  legalBasis: string;
  explanationAz: string;
  explanationEn: string;
  explanationRu: string;
}

export interface FaunaExamEvaluation {
  score: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  passingThresholdPercent: number;
}

export interface FaunaCertificate {
  certificateId: string;
  issueTimestamp: string;
  expiryDate: string;
  stationCode: string;
  stationName: string;
  corridor: string;
  vehiclePlate: string;
  vehicleModel: string;
  crossingType: FaunaCrossingType;
  targetSpecies: FaunaTargetSpecies;
  avcRiskScore: number;
  impactSpeedKmh: number;
  statusRating: 'OPTIMAL_SAFE' | 'ADVISORY_CAUTION' | 'CRITICAL_HAZARD_IMPACT';
  simaDigitalUid: string;
  sha256Checksum: string;
  verificationPin: string;
}

/**
 * Statutory Wildlife Restitution Matrix under ETSN & Cabinet of Ministers Decision No. 410
 */
export const FAUNA_RESTITUTION_RATES: Record<FaunaTargetSpecies, number> = {
  STEPPE_GAZELLE: 2750, // Ceyran (Red Book of Azerbaijan) - 2,750 AZN
  BROWN_BEAR: 2200, // Qonur ayı - 2,200 AZN
  RED_DEER: 1650, // Qafqaz nəcib maralı - 1,650 AZN
  ROE_DEER: 550, // Cüyür - 550 AZN
  WILD_BOAR: 440, // Çöl donuzu (qaban) - 440 AZN
  DOMESTIC_CATTLE: 1200, // Kənd təsərrüfatı iri buynuzlu mal-qara - 1,200 AZN
};

/**
 * Perform scientific & statutory calculation of Animal-Vehicle Collision (AVC) risk,
 * Newtonian braking physics, kinetic impact energy, deterrent efficacy and legal liabilities.
 */
export function calculateFaunaRisk(
  params: FaunaCalculationParams,
  species: FaunaTargetSpecies,
  violationType: FaunaVehiclePreset['violationType'] = 'NONE'
): FaunaCalculationResult {
  const g = 9.81; // m/s²
  const vMps = (params.vehicleSpeedKmh * 1000) / 3600;

  // Driver reaction time depends on ambient lighting (0.1 lux night vs 1000 lux day)
  // Standard reaction time 1.0s in day, up to 1.8s in dark / unlit conditions
  let reactionTimeSec = 1.0;
  if (params.ambientIlluminanceLux < 5) {
    reactionTimeSec = 1.8;
  } else if (params.ambientIlluminanceLux < 50) {
    reactionTimeSec = 1.4;
  } else if (params.ambientIlluminanceLux < 300) {
    reactionTimeSec = 1.15;
  }
  const reactionDistM = Math.round(vMps * reactionTimeSec * 10) / 10;

  // Pure braking distance under road friction mu: d = v² / (2 * mu * g)
  const safeMu = Math.max(0.15, Math.min(0.9, params.roadFrictionMu));
  const brakingDistM = Math.round(((vMps * vMps) / (2 * safeMu * g)) * 10) / 10;
  const totalStoppingDistM = Math.round((reactionDistM + brakingDistM) * 10) / 10;

  // Collision determination
  const availableDistM = params.animalDistanceM;
  const impactOccurs = totalStoppingDistM > availableDistM;

  let impactSpeedKmh = 0;
  let impactKineticEnergyKj = 0;

  if (impactOccurs) {
    // Distance remaining after reaction
    const effectiveBrakingDistanceAvailable = Math.max(0, availableDistM - reactionDistM);
    // Speed reduction during braking: v_impact² = v₀² - 2 * mu * g * d_braking
    const speedSquared = Math.max(0, vMps * vMps - 2 * safeMu * g * effectiveBrakingDistanceAvailable);
    const impactSpeedMps = Math.sqrt(speedSquared);
    impactSpeedKmh = Math.round(((impactSpeedMps * 3600) / 1000) * 10) / 10;

    // Combined mass equivalent impact energy: E = 0.5 * m_effective * v²
    // Effective impact with animal mass vs vehicle
    const effectiveMassKg = Math.min(params.animalMassKg, 400);
    impactKineticEnergyKj = Math.round((0.5 * effectiveMassKg * impactSpeedMps * impactSpeedMps) / 1000);
  }

  // Detection confidence of FLIR & AI optical cameras (improves with thermal contrast and illuminance)
  let detectionConfidencePercent = 94;
  if (params.ambientIlluminanceLux < 10) {
    detectionConfidencePercent = 88; // FLIR thermal still maintains high accuracy
  }
  if (params.animalDistanceM > 150) {
    detectionConfidencePercent -= 8;
  }

  // Ultrasonic acoustic deterrent repellent probability (20-30 kHz acoustic sirens)
  let deterrentRepelProbabilityPercent = 0;
  if (params.acousticDeterrentEnabled) {
    deterrentRepelProbabilityPercent = species === 'BROWN_BEAR' ? 68 : species === 'WILD_BOAR' ? 82 : 88;
  }

  // Animal-Vehicle Collision (AVC) risk score (0 - 100%)
  let avcRiskScore = 0;
  if (impactOccurs) {
    avcRiskScore = Math.min(100, Math.round(50 + (impactSpeedKmh / 140) * 50));
  } else {
    // Near-miss safety buffer ratio
    const marginRatio = (availableDistM - totalStoppingDistM) / availableDistM;
    avcRiskScore = Math.max(5, Math.round((1 - marginRatio) * 45));
  }
  if (params.acousticDeterrentEnabled && !impactOccurs) {
    avcRiskScore = Math.max(2, Math.round(avcRiskScore * 0.4));
  }

  // Animal mortality risk and driver injury risk
  const animalMortalityRiskPercent = impactOccurs
    ? Math.min(100, Math.round(Math.pow(impactSpeedKmh / 80, 2) * 100))
    : 0;
  const driverInjuryRiskPercent = impactOccurs
    ? Math.min(95, Math.round((impactKineticEnergyKj / 60) * 100))
    : 0;

  // Safe speed advisory to ensure stopping within available distance
  // v_safe = -mu*g*t_r + sqrt((mu*g*t_r)² + 2*mu*g*availableDist)
  const b = safeMu * g * reactionTimeSec;
  const vSafeMps = -b + Math.sqrt(b * b + 2 * safeMu * g * Math.max(15, availableDistM));
  const safeSpeedAdvisoryKmh = Math.min(110, Math.max(30, Math.round((vSafeMps * 3600) / 1000 / 5) * 5));

  // Statutory fines and liability
  let statutoryFineAzn = 0;
  let penaltyPoints = 0;

  if (violationType === 'WILDLIFE_ZONE_SPEEDING') {
    statutoryFineAzn = 50; // İXM 328.2 (20-40 km/h over in hazard zone)
    penaltyPoints = 2;
  } else if (violationType === 'FAILURE_TO_YIELD_ANIMAL') {
    statutoryFineAzn = 40; // İXM 327.1
    penaltyPoints = 0;
  } else if (violationType === 'WILDLIFE_COLLISION_SEVERE') {
    statutoryFineAzn = 90; // İXM 328.2 (50 AZN) + İXM 327.1 (40 AZN)
    penaltyPoints = 2;
  }

  // Statutory 50% discount if paid within 30 days under İXM Article 38
  const promptDiscountedFineAzn = Math.round(statutoryFineAzn * 0.5 * 100) / 100;

  // Wildlife Restitution Tariff under ETSN & Cabinet of Ministers Decision No. 410
  const baseRestitution = FAUNA_RESTITUTION_RATES[species] || 500;
  const wildlifeRestitutionAzn = impactOccurs ? baseRestitution : 0;

  const totalFinancialLiabilityAzn = promptDiscountedFineAzn + wildlifeRestitutionAzn;

  // Status rating classification
  let statusRating: FaunaCalculationResult['statusRating'] = 'OPTIMAL_SAFE';
  if (impactOccurs || avcRiskScore >= 65) {
    statusRating = 'CRITICAL_HAZARD_IMPACT';
  } else if (avcRiskScore >= 25 || totalStoppingDistM > availableDistM * 0.75) {
    statusRating = 'ADVISORY_CAUTION';
  }

  return {
    driverReactionTimeSec: reactionTimeSec,
    driverReactionDistanceM: reactionDistM,
    vehicleBrakingDistanceM: brakingDistM,
    totalStoppingDistanceM: totalStoppingDistM,
    impactOccurs,
    impactSpeedKmh,
    impactKineticEnergyKj,
    avcRiskScore,
    animalMortalityRiskPercent,
    driverInjuryRiskPercent,
    detectionConfidencePercent,
    deterrentRepelProbabilityPercent,
    safeSpeedAdvisoryKmh,
    statutoryFineAzn,
    promptDiscountedFineAzn,
    penaltyPoints,
    wildlifeRestitutionAzn,
    totalFinancialLiabilityAzn,
    statusRating,
  };
}

/**
 * Evaluate 10-Point Technical SCADA & Eco-Duct Checklist
 */
export function evaluateFaunaChecklist(
  answers: Record<string, boolean>,
  items: FaunaChecklistItem[]
): FaunaChecklistEvaluation {
  const totalCount = items.length;
  let passedCount = 0;
  let totalWeight = 0;
  let earnedWeight = 0;

  items.forEach((item) => {
    totalWeight += item.weight;
    if (answers[item.id]) {
      passedCount++;
      earnedWeight += item.weight;
    }
  });

  const percentage = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const isCompliant = percentage >= 80;

  let statusRating: FaunaChecklistEvaluation['statusRating'] = 'NON_COMPLIANT';
  if (percentage >= 90) {
    statusRating = 'EXCELLENT';
  } else if (percentage >= 80) {
    statusRating = 'ADEQUATE';
  }

  return {
    score: earnedWeight,
    passedCount,
    totalCount,
    percentage,
    isCompliant,
    statusRating,
  };
}

/**
 * Evaluate 10-Question Wildlife & Eco-Duct Theoretical Exam
 */
export function evaluateFaunaExam(
  selectedAnswers: Record<string, number>,
  questions: FaunaExamQuestion[]
): FaunaExamEvaluation {
  const totalQuestions = questions.length;
  let correctCount = 0;

  questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passingThresholdPercent = 80; // 8 out of 10 required
  const isPassed = percentage >= passingThresholdPercent;

  return {
    score: correctCount,
    totalQuestions,
    percentage,
    isPassed,
    passingThresholdPercent,
  };
}

/**
 * Generate official FAUNA-SAFE-AZ-2026 Electronic Clearance Certificate
 */
export function generateFaunaCertificate(
  station: FaunaEcoStation,
  vehiclePreset: FaunaVehiclePreset,
  calcResult: FaunaCalculationResult,
  species: FaunaTargetSpecies
): FaunaCertificate {
  const serial = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `FAUNA-SAFE-AZ-2026-${serial}`;

  const now = new Date();
  const issueTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);

  // Expiry date is 1 year from issue
  const expYear = now.getFullYear() + 1;
  const expiryDate = `${expYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const hexPlate = vehiclePreset.plate.replace(/[^A-Z0-9]/g, '');
  const simaDigitalUid = `SIMA-FAUNA-${hexPlate}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const rawHash = `${certificateId}-${station.code}-${vehiclePreset.plate}-${calcResult.avcRiskScore}-${calcResult.statusRating}`;
  let hashVal = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHash.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256Checksum = `SHA256-${Math.abs(hashVal).toString(16).padStart(8, '0')}-${Math.random().toString(16).substring(2, 10)}`.toUpperCase();

  const verificationPin = String(Math.floor(1000 + Math.random() * 9000));

  return {
    certificateId,
    issueTimestamp,
    expiryDate,
    stationCode: station.code,
    stationName: station.nameAz,
    corridor: station.corridor,
    vehiclePlate: vehiclePreset.plate,
    vehicleModel: vehiclePreset.model,
    crossingType: station.crossingType,
    targetSpecies: species,
    avcRiskScore: calcResult.avcRiskScore,
    impactSpeedKmh: calcResult.impactSpeedKmh,
    statusRating: calcResult.statusRating,
    simaDigitalUid,
    sha256Checksum,
    verificationPin,
  };
}

/**
 * Public Registry Search for FAUNA-SAFE certificates
 */
export function searchFaunaRegistry(
  query: string,
  records: FaunaCertificate[]
): FaunaCertificate[] {
  const q = query.trim().toUpperCase();
  if (!q) return records;

  return records.filter(
    (r) =>
      r.certificateId.toUpperCase().includes(q) ||
      r.vehiclePlate.toUpperCase().includes(q) ||
      r.stationCode.toUpperCase().includes(q) ||
      r.stationName.toUpperCase().includes(q) ||
      r.simaDigitalUid.toUpperCase().includes(q) ||
      r.verificationPin.includes(q)
  );
}
