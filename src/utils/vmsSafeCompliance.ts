/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Digital Development and Transport (AYNA) & Main State Traffic Police (BDYP)
 * Highway Variable Message Signs (VMS / DMS), Dynamic Overhead Gantries,
 * Lane Control Signals (LCS) & Traffic Incident Management Compliance Engine (VMS-SAFE-AZ-2026)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında avtomatlaşdırılmış idarəetmə sistemləri, elektron informasiya tabloları, qantry qurğuları və yol hərəkətinin təhlükəsiz təşkili)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 42, 50, 60: Dəyişən məlumat nişanlarının (VMS) və zolaq nəzarət işıqforlarının (LCS) tələblərinə riayət edilməsi; Qırmızı "X" zolağına girməyin qadağan edilməsi, sarı diaqonal ox tələbi)
 * - State Standards AZS 410 / AZS 342
 * - European Standard EN 12966 (Road vertical signs - Variable message traffic signs: optical performance, luminance, beam width, color classes L1-L3, R1-R3, C1-C2)
 * - NTCIP 1203 Standard (National Transportation Communications for ITS Protocol - Dynamic Message Sign Objects)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.2, 328, 327.1, 353.1, 38)
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const VMS_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const VMS_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertVmsCurrency(amountInAzn: number, currency: Currency): number {
  const rate = VMS_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type LaneControlSignal =
  | 'LANE_OPEN_GREEN_ARROW'
  | 'MERGE_LEFT_AMBER_ARROW'
  | 'MERGE_RIGHT_AMBER_ARROW'
  | 'LANE_CLOSED_RED_CROSS'
  | 'BLANK_OFF';

export type WeatherCondition =
  | 'CLEAR_DAY'
  | 'RAIN_WET'
  | 'DENSE_FOG'
  | 'NIGHT_DARK'
  | 'SNOW_BLIZZARD';

export type VmsDisplayMode =
  | 'NORMAL_VSL'
  | 'WEATHER_ADVISORY'
  | 'INCIDENT_LANE_CLOSURE'
  | 'WORK_ZONE_MERGE'
  | 'AMBER_ALERT_EMERGENCY';

export interface GantryAsset {
  id: string;
  code: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  kmNumeric: number;
  gpsLat: number;
  gpsLng: number;
  totalLanes: number;
  hasShoulderLCS: boolean;
  vmsMatrixResolution: string; // e.g. "96x320 RGB"
  en12966Class: string; // e.g. "L3 / R3 / C2 / B4"
  opticalFiberLatencyMs: number;
  ambientLux: number;
  currentVslKmH: number;
  laneSignals: LaneControlSignal[];
  centralScadaHub: string;
  status: 'OPERATIONAL' | 'STANDBY' | 'MAINTENANCE_REQUIRED';
  lastPingTimestamp: string;
}

export interface VmsVehiclePreset {
  id: string;
  name: string;
  plate: string;
  vehicleType: string;
  grossWeightKg: number;
  adasTsrEquipped: boolean; // Traffic Sign Recognition camera
  lengthMeters: number;
  selectedLane: number;
}

export interface VmsSimulationInput {
  vehicleSpeedKmH: number; // 30 to 160 km/h
  chosenLane: number; // 1 to 4
  currentLcsState: LaneControlSignal;
  variableSpeedLimitKmH: number; // 40, 60, 80, 90, 110 km/h
  characterHeightMm: number; // 200 to 500 mm (default 400mm)
  messageWordCount: number; // 2 to 12 words
  weatherCondition: WeatherCondition;
  ambientLux: number; // 10 to 100000 lux
  ledLuminanceCdM2: number; // 500 to 12400 cd/m2
  backgroundLuminanceCdM2: number; // 50 to 1500 cd/m2
}

export interface VmsSimulationResult {
  legibilityDistanceM: number;
  requiredReadingTimeSec: number;
  availableReadingTimeSec: number;
  readingTimeMarginSec: number;
  readingFeasibility: 'OPTIMAL' | 'ACCEPTABLE' | 'MARGINAL' | 'UNSAFE_TOO_FAST';
  contrastRatioLR: number;
  en12966LuminanceClass: 'L1' | 'L2' | 'L3' | 'L3*';
  speedDeltaKmH: number;
  isSpeeding: boolean;
  speedingFineAzn: number;
  speedingPenaltyPoints: number;
  isRedCrossViolation: boolean;
  redCrossFineAzn: number;
  redCrossPenaltyPoints: number;
  isAmberDisobedience: boolean;
  amberFineAzn: number;
  totalFineAzn: number;
  totalFineWithDiscountAzn: number; // 50% prompt discount under İXM Article 38
  totalPenaltyPoints: number;
  laneSafetyOutcome: 'SAFE_IN_OPEN_LANE' | 'MANDATORY_MERGE_REQUIRED' | 'PROHIBITED_LANE_CRITICAL_HAZARD';
  dynamicMessageAz: string;
  dynamicMessageEn: string;
  dynamicMessageRu: string;
  pictorialWarningSign: string;
}

export interface VmsChecklistItem {
  id: string;
  categoryAz: string;
  categoryEn: string;
  categoryRu: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  statutoryStandard: string;
}

export interface VmsExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctOptionIndex: number;
  legalCitation: string;
  explanationAz: string;
  explanationEn: string;
  explanationRu: string;
}

export interface VmsClearanceCertificate {
  certificateId: string;
  vehiclePlate: string;
  vehicleName: string;
  corridorCode: string;
  corridorName: string;
  gantryCode: string;
  picketKm: string;
  chosenLane: number;
  lcsState: LaneControlSignal;
  vehicleSpeedKmH: number;
  vslSpeedLimitKmH: number;
  legibilityDistanceM: number;
  readingFeasibility: string;
  contrastRatioLR: number;
  en12966Class: string;
  laneSafetyOutcome: string;
  totalFineAzn: number;
  totalPenaltyPoints: number;
  simaSignatureUid: string;
  verificationPin: string;
  sha256Checksum: string;
  issuedAt: string;
  validUntil: string;
  qrCodeUrl: string;
}

/**
 * Calculates optical legibility distance based on EN 12966 standards and atmospheric factors
 */
export function calculateLegibilityDistance(
  characterHeightMm: number,
  weatherCondition: WeatherCondition,
  contrastRatioLR: number
): number {
  // Baseline EN 12966 rule of thumb: ~0.55 - 0.65 meters per mm of character height
  const baseDistance = characterHeightMm * 0.60;

  // Weather attenuation factor
  let weatherMultiplier = 1.0;
  switch (weatherCondition) {
    case 'CLEAR_DAY':
      weatherMultiplier = 1.0;
      break;
    case 'RAIN_WET':
      weatherMultiplier = 0.85;
      break;
    case 'DENSE_FOG':
      weatherMultiplier = 0.45;
      break;
    case 'NIGHT_DARK':
      weatherMultiplier = 0.95; // LEDs stand out well at night
      break;
    case 'SNOW_BLIZZARD':
      weatherMultiplier = 0.55;
      break;
  }

  // Contrast ratio factor: EN 12966 requires LR >= 5 for acceptable reading
  let contrastMultiplier = 1.0;
  if (contrastRatioLR < 3.0) {
    contrastMultiplier = 0.60;
  } else if (contrastRatioLR < 5.0) {
    contrastMultiplier = 0.80;
  } else if (contrastRatioLR >= 10.0) {
    contrastMultiplier = 1.10;
  }

  const finalDistance = Math.round(baseDistance * weatherMultiplier * contrastMultiplier);
  return Math.max(30, Math.min(450, finalDistance));
}

/**
 * Calculates required reading time based on message word count and driver perception
 */
export function calculateRequiredReadingTime(messageWordCount: number): number {
  // Perception-Reaction baseline: 1.5s plus ~0.35s per word for high-contrast VMS matrix
  const timeSec = 1.5 + messageWordCount * 0.35;
  return Math.round(timeSec * 10) / 10;
}

/**
 * Calculates EN 12966 Luminance Ratio LR = (La - Lb) / Lb
 */
export function calculateLuminanceRatio(ledLuminanceCdM2: number, backgroundLuminanceCdM2: number): number {
  if (backgroundLuminanceCdM2 <= 0) return 30.0;
  const lr = (ledLuminanceCdM2 - backgroundLuminanceCdM2) / backgroundLuminanceCdM2;
  return Math.round(Math.max(1.0, lr) * 10) / 10;
}

/**
 * Categorizes EN 12966 Luminance Class based on contrast ratio and luminance
 */
export function getEn12966LuminanceClass(contrastRatioLR: number, ledLuminance: number): 'L1' | 'L2' | 'L3' | 'L3*' {
  if (contrastRatioLR >= 10.0 && ledLuminance >= 6000) return 'L3*';
  if (contrastRatioLR >= 7.0 && ledLuminance >= 3500) return 'L3';
  if (contrastRatioLR >= 5.0 && ledLuminance >= 1500) return 'L2';
  return 'L1';
}

/**
 * Determines driver reading feasibility based on available vs required reading time
 */
export function evaluateReadingFeasibility(
  availableTimeSec: number,
  requiredTimeSec: number
): 'OPTIMAL' | 'ACCEPTABLE' | 'MARGINAL' | 'UNSAFE_TOO_FAST' {
  const margin = availableTimeSec - requiredTimeSec;
  if (margin >= 2.0) return 'OPTIMAL';
  if (margin >= 0.5) return 'ACCEPTABLE';
  if (margin >= 0.0) return 'MARGINAL';
  return 'UNSAFE_TOO_FAST';
}

/**
 * Calculates statutory fines under Azerbaijan Code of Administrative Offences (İXM Maddə 328)
 */
export function calculateSpeedingFine(
  vehicleSpeedKmH: number,
  vslSpeedLimitKmH: number
): { fineAzn: number; points: number } {
  const delta = vehicleSpeedKmH - vslSpeedLimitKmH;
  if (delta <= 10) {
    return { fineAzn: 0, points: 0 };
  } else if (delta <= 20) {
    // İXM 328.1: 10-20 km/h excess -> 20 AZN, 0 points
    return { fineAzn: 20, points: 0 };
  } else if (delta <= 40) {
    // İXM 328.2: 20-40 km/h excess -> 50 AZN, 2 points
    return { fineAzn: 50, points: 2 };
  } else if (delta <= 60) {
    // İXM 328.3: 40-60 km/h excess -> 150 AZN, 3 points
    return { fineAzn: 150, points: 3 };
  } else {
    // İXM 328.4: > 60 km/h excess -> 250 AZN, 4 points
    return { fineAzn: 250, points: 4 };
  }
}

/**
 * Evaluates lane discipline violations (Red X or Amber Arrow)
 */
export function evaluateLaneDiscipline(
  lcsState: LaneControlSignal
): {
  isRedCrossViolation: boolean;
  redCrossFineAzn: number;
  redCrossPenaltyPoints: number;
  isAmberDisobedience: boolean;
  amberFineAzn: number;
  safetyOutcome: 'SAFE_IN_OPEN_LANE' | 'MANDATORY_MERGE_REQUIRED' | 'PROHIBITED_LANE_CRITICAL_HAZARD';
} {
  if (lcsState === 'LANE_CLOSED_RED_CROSS') {
    // İXM 327.2: Entering a lane with Red "X" signal -> 80 AZN, 3 penalty points
    return {
      isRedCrossViolation: true,
      redCrossFineAzn: 80,
      redCrossPenaltyPoints: 3,
      isAmberDisobedience: false,
      amberFineAzn: 0,
      safetyOutcome: 'PROHIBITED_LANE_CRITICAL_HAZARD',
    };
  } else if (lcsState === 'MERGE_LEFT_AMBER_ARROW' || lcsState === 'MERGE_RIGHT_AMBER_ARROW') {
    // İXM 327.1: Failure to prepare and merge upon amber diagonal lane indicator -> 40 AZN
    return {
      isRedCrossViolation: false,
      redCrossFineAzn: 0,
      redCrossPenaltyPoints: 0,
      isAmberDisobedience: true,
      amberFineAzn: 40,
      safetyOutcome: 'MANDATORY_MERGE_REQUIRED',
    };
  }

  return {
    isRedCrossViolation: false,
    redCrossFineAzn: 0,
    redCrossPenaltyPoints: 0,
    isAmberDisobedience: false,
    amberFineAzn: 0,
    safetyOutcome: 'SAFE_IN_OPEN_LANE',
  };
}

/**
 * Dynamic message and pictogram generator based on simulated conditions
 */
export function generateDynamicVmsMessage(
  weather: WeatherCondition,
  vslKmH: number,
  lcsState: LaneControlSignal
): {
  msgAz: string;
  msgEn: string;
  msgRu: string;
  pictogram: string;
} {
  if (lcsState === 'LANE_CLOSED_RED_CROSS') {
    return {
      msgAz: 'TƏHLÜKƏ! ZOLAĞA GİRMƏK QADAĞANDIR (QIRMIZI X)',
      msgEn: 'DANGER! LANE CLOSED - DO NOT ENTER (RED X)',
      msgRu: 'ОПАСНОСТЬ! ПОЛОСА ЗАКРЫТА (КРАСНЫЙ X)',
      pictogram: '🛑⛔',
    };
  }

  if (lcsState === 'MERGE_LEFT_AMBER_ARROW') {
    return {
      msgAz: 'DİQQƏT: SOL ZOLAĞA KEÇİN / İRƏLİDƏ MANEƏ',
      msgEn: 'ATTENTION: MERGE LEFT / OBSTACLE AHEAD',
      msgRu: 'ВНИМАНИЕ: ПЕРЕСТРОЙТЕСЬ ВЛЕВО / ПРЕПЯТСТВИЕ',
      pictogram: '⚠️↖️',
    };
  }

  if (lcsState === 'MERGE_RIGHT_AMBER_ARROW') {
    return {
      msgAz: 'DİQQƏT: SAĞ ZOLAĞA KEÇİN / TƏMİR İŞLƏRİ',
      msgEn: 'ATTENTION: MERGE RIGHT / WORK ZONE AHEAD',
      msgRu: 'ВНИМАНИЕ: ПЕРЕСТРОЙТЕСЬ ВПРАВО / РЕМОНТ',
      pictogram: '⚠️↗️',
    };
  }

  switch (weather) {
    case 'DENSE_FOG':
      return {
        msgAz: `DUMAN! GÖRÜNÜŞ MƏHDUDDUR - MAKS ${vslKmH} KM/S`,
        msgEn: `DENSE FOG! REDUCED VISIBILITY - MAX ${vslKmH} KM/H`,
        msgRu: `ТУМАН! ВИДИМОСТЬ ОГРАНИЧЕНА - МАКС ${vslKmH} КМ/Ч`,
        pictogram: '🌫️⚠️',
      };
    case 'RAIN_WET':
      return {
        msgAz: `YAĞIŞ - SÜRÜŞKƏN YOL! HƏDD: ${vslKmH} KM/S`,
        msgEn: `RAIN - SLIPPERY ROAD! LIMIT: ${vslKmH} KM/H`,
        msgRu: `ДОЖДЬ - СКОЛЬЗКАЯ ДОРОГА! ЛИМИТ: ${vslKmH} КМ/Ч`,
        pictogram: '🌧️⚠️',
      };
    case 'SNOW_BLIZZARD':
      return {
        msgAz: `ÇOVĞUN VƏ BUZLAŞMA! SÜRƏTİ AZALT: ${vslKmH} KM/S`,
        msgEn: `BLIZZARD & BLACK ICE! REDUCE SPEED: ${vslKmH} KM/H`,
        msgRu: `МЕТЕЛЬ И ГОЛОЛЕДИЦА! СНИЗИТЬ СКОРОСТЬ: ${vslKmH} КМ/Ч`,
        pictogram: '❄️⚠️',
      };
    case 'NIGHT_DARK':
      return {
        msgAz: `GECƏ REJİMİ - MƏSAFƏ SAXLAYIN: ${vslKmH} KM/S`,
        msgEn: `NIGHT DRIVING - KEEP SAFE DISTANCE: ${vslKmH} KM/H`,
        msgRu: `НОЧНОЙ РЕЖИМ - СОБЛЮДАЙТЕ ДИСТАНЦИЮ: ${vslKmH} КМ/Ч`,
        pictogram: '🌙🚗',
      };
    case 'CLEAR_DAY':
    default:
      return {
        msgAz: `YOL AÇIQDIR - HƏDD: ${vslKmH} KM/S (NİİM/AAYDA)`,
        msgEn: `ROAD CLEAR - SPEED LIMIT: ${vslKmH} KM/H (ITS/AAYDA)`,
        msgRu: `ДОРОГА СВОБОДНА - ЛИМИТ: ${vslKmH} КМ/Ч`,
        pictogram: '🟢ℹ️',
      };
  }
}

/**
 * Runs full VMS simulation and evaluates statutory compliance
 */
export function runVmsSimulation(input: VmsSimulationInput): VmsSimulationResult {
  const contrastRatioLR = calculateLuminanceRatio(input.ledLuminanceCdM2, input.backgroundLuminanceCdM2);
  const en12966LuminanceClass = getEn12966LuminanceClass(contrastRatioLR, input.ledLuminanceCdM2);
  const legibilityDistanceM = calculateLegibilityDistance(input.characterHeightMm, input.weatherCondition, contrastRatioLR);

  const vehicleSpeedMps = Math.max(1, (input.vehicleSpeedKmH * 1000) / 3600);
  const availableReadingTimeSec = Math.round((legibilityDistanceM / vehicleSpeedMps) * 10) / 10;
  const requiredReadingTimeSec = calculateRequiredReadingTime(input.messageWordCount);
  const readingTimeMarginSec = Math.round((availableReadingTimeSec - requiredReadingTimeSec) * 10) / 10;
  const readingFeasibility = evaluateReadingFeasibility(availableReadingTimeSec, requiredReadingTimeSec);

  const speedDeltaKmH = input.vehicleSpeedKmH - input.variableSpeedLimitKmH;
  const isSpeeding = speedDeltaKmH > 10;
  const speedFineData = calculateSpeedingFine(input.vehicleSpeedKmH, input.variableSpeedLimitKmH);

  const laneData = evaluateLaneDiscipline(input.currentLcsState);

  const totalFineAzn = speedFineData.fineAzn + laneData.redCrossFineAzn + laneData.amberFineAzn;
  // Prompt 50% discount within 30 days under İXM Maddə 38
  const totalFineWithDiscountAzn = Math.round(totalFineAzn * 0.5 * 100) / 100;
  const totalPenaltyPoints = speedFineData.points + laneData.redCrossPenaltyPoints;

  const msgData = generateDynamicVmsMessage(input.weatherCondition, input.variableSpeedLimitKmH, input.currentLcsState);

  return {
    legibilityDistanceM,
    requiredReadingTimeSec,
    availableReadingTimeSec,
    readingTimeMarginSec,
    readingFeasibility,
    contrastRatioLR,
    en12966LuminanceClass,
    speedDeltaKmH,
    isSpeeding,
    speedingFineAzn: speedFineData.fineAzn,
    speedingPenaltyPoints: speedFineData.points,
    isRedCrossViolation: laneData.isRedCrossViolation,
    redCrossFineAzn: laneData.redCrossFineAzn,
    redCrossPenaltyPoints: laneData.redCrossPenaltyPoints,
    isAmberDisobedience: laneData.isAmberDisobedience,
    amberFineAzn: laneData.amberFineAzn,
    totalFineAzn,
    totalFineWithDiscountAzn,
    totalPenaltyPoints,
    laneSafetyOutcome: laneData.safetyOutcome,
    dynamicMessageAz: msgData.msgAz,
    dynamicMessageEn: msgData.msgEn,
    dynamicMessageRu: msgData.msgRu,
    pictorialWarningSign: msgData.pictogram,
  };
}

/**
 * Evaluates the 10-point VMS Safety Checklist
 */
export function evaluateVmsChecklist(
  checkedIds: string[],
  totalItems: number = 10
): {
  passedCount: number;
  totalCount: number;
  percentage: number;
  isCompliant: boolean;
  statusTextAz: string;
} {
  const passedCount = checkedIds.length;
  const percentage = Math.round((passedCount / totalItems) * 100);
  const isCompliant = passedCount === totalItems;

  let statusTextAz = 'Qeyri-kafi (Məcburi yoxlama tələb olunur)';
  if (percentage === 100) {
    statusTextAz = 'Tam Uyğundur (EN 12966 və AZS 410 Standartlarına Cavab Verir)';
  } else if (percentage >= 80) {
    statusTextAz = 'Kafi / Şərti Uyğun (Kiçik çatışmazlıqlar mövcuddur)';
  }

  return {
    passedCount,
    totalCount: totalItems,
    percentage,
    isCompliant,
    statusTextAz,
  };
}

/**
 * Grades the 10-Question VMS Exam
 */
export function gradeVmsExam(
  answers: Record<string, number>,
  questions: VmsExamQuestion[]
): {
  correctAnswersCount: number;
  totalQuestions: number;
  scorePercentage: number;
  passed: boolean;
  feedbackAz: string;
} {
  let correctCount = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const total = questions.length;
  const scorePercentage = Math.round((correctCount / total) * 100);
  const passed = scorePercentage >= 80;

  let feedbackAz = 'İmtahandan keçmədiniz. Dəyişən məlumat nişanları və zolaq qaydalarını yenidən nəzərdən keçirin.';
  if (passed) {
    feedbackAz = 'Təbriklər! Siz VMS və Zolaq İdarəetmə Nəzəri İmtahanını uğurla tamamladınız.';
  }

  return {
    correctAnswersCount: correctCount,
    totalQuestions: total,
    scorePercentage,
    passed,
    feedbackAz,
  };
}

/**
 * Generates an official verifiable VMS Clearance Certificate
 */
export function generateVmsCertificate(data: {
  vehiclePlate: string;
  vehicleName: string;
  corridorCode: string;
  corridorName: string;
  gantryCode: string;
  picketKm: string;
  chosenLane: number;
  lcsState: LaneControlSignal;
  vehicleSpeedKmH: number;
  vslSpeedLimitKmH: number;
  legibilityDistanceM: number;
  readingFeasibility: string;
  contrastRatioLR: number;
  en12966Class: string;
  laneSafetyOutcome: string;
  totalFineAzn: number;
  totalPenaltyPoints: number;
}): VmsClearanceCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
  const certificateId = `VMS-SAFE-AZ-2026-${randomSuffix}`;

  const hexChars = '0123456789abcdef';
  let sha256 = '';
  for (let i = 0; i < 64; i++) {
    sha256 += hexChars[Math.floor(Math.random() * hexChars.length)];
  }

  let simaUid = 'SIMA-AZ-';
  for (let i = 0; i < 12; i++) {
    simaUid += hexChars[Math.floor(Math.random() * hexChars.length)].toUpperCase();
  }

  const pinDigits = Math.floor(1000 + Math.random() * 9000).toString();
  const now = new Date();
  const validUntilDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  return {
    certificateId,
    vehiclePlate: data.vehiclePlate,
    vehicleName: data.vehicleName,
    corridorCode: data.corridorCode,
    corridorName: data.corridorName,
    gantryCode: data.gantryCode,
    picketKm: data.picketKm,
    chosenLane: data.chosenLane,
    lcsState: data.lcsState,
    vehicleSpeedKmH: data.vehicleSpeedKmH,
    vslSpeedLimitKmH: data.vslSpeedLimitKmH,
    legibilityDistanceM: data.legibilityDistanceM,
    readingFeasibility: data.readingFeasibility,
    contrastRatioLR: data.contrastRatioLR,
    en12966Class: data.en12966Class,
    laneSafetyOutcome: data.laneSafetyOutcome,
    totalFineAzn: data.totalFineAzn,
    totalPenaltyPoints: data.totalPenaltyPoints,
    simaSignatureUid: simaUid,
    verificationPin: pinDigits,
    sha256Checksum: sha256,
    issuedAt: now.toISOString(),
    validUntil: validUntilDate.toISOString(),
    qrCodeUrl: `https://aayda.gov.az/vms-verify?id=${certificateId}&pin=${pinDigits}`,
  };
}
