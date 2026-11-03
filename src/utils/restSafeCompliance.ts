/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Digital Development and Transport (AYNA) & Main State Traffic Police (BDYP)
 * Highway Rest Areas, Heavy Commercial Vehicle Parking & Driver Fatigue Telemetry Portal (REST-SAFE-AZ-2026)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında xidmət obyektləri, istirahət meydançaları və təhlükəsiz parklanma sahələri)
 * - Law of the Republic of Azerbaijan "On Road Transport" & "On Road Traffic" (Maddə 9, 14, 37, 50: Sürücülərin iş və istirahət rejimi, təhlükəsiz hərəkət və yorğunluq əleyhinə tədbirlər)
 * - UNECE AETR Agreement (European Agreement concerning the Work of Crews of Vehicles engaged in International Road Transport)
 * - EU Delegated Regulation No 885/2013 / SSTPA Standard (Safe and Secure Truck Parking Areas - Bronze/Silver/Gold/Platinum)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 322-1: İş və istirahət rejimi; Maddə 327.1 / 346: Çiynində və ya hərəkət hissəsində qanunsuz dayanma; Maddə 38: 50% güzəşt)
 * - State Standards AZS 410 / AZS 342
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const REST_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const REST_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertRestCurrency(amountInAzn: number, currency: Currency): number {
  const rate = REST_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type SstpaTier = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';

export type TimeOfDay = 'DAY' | 'NIGHT' | 'POST_LUNCH';

export type VehicleCategory =
  | 'SEMI_TRAILER_TIR'
  | 'RIGID_HEAVY_TRUCK'
  | 'INTERCITY_COACH'
  | 'LIGHT_COMMERCIAL_VAN'
  | 'PASSENGER_CAR';

export interface RestAreaFacility {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  kmNumeric: number;
  gpsLat: number;
  gpsLng: number;
  sstpaTier: SstpaTier;
  totalTirBays: number;
  occupiedTirBays: number;
  reservedTirBays: number;
  totalCarBays: number;
  occupiedCarBays: number;
  shorePowerPlugsTotal: number;
  shorePowerPlugsOccupied: number;
  amenities: {
    motelBeds: number;
    showers: boolean;
    canteen24h: boolean;
    mosque: boolean;
    wifi: boolean;
    cctvSecurity24h: boolean;
    fuelStationSocar: boolean;
    evChargersHpc: number;
    truckRepairPit: boolean;
    defibrillatorAed: boolean;
  };
  liveOccupancyPct: number;
  status: 'OPEN_AVAILABLE' | 'HIGH_OCCUPANCY' | 'FULL_DIVERT_SUGGESTED';
}

export interface DriverFatigueInput {
  continuousDrivingHours: number; // 0.0 - 8.0 h (AETR max 4.5h)
  restTakenMinutes: number; // 0 - 90 min (AETR req 45m)
  dailyDrivingHours: number; // 0.0 - 12.0 h (AETR max 9.0h)
  hoursAwake: number; // 4.0 - 24.0 h
  timeOfDay: TimeOfDay;
  perclosPct: number; // 0 - 30% eye closure rate
  steeringCorrectionsPerMin: number; // 5 - 40 corrections/min
  vehicleSpeedKmh: number; // 40 - 130 km/h
  vehicleCategory: VehicleCategory;
  shorePowerNeeded: boolean;
  parkingDurationHours: number; // 1 - 24 h
}

export interface FatigueAnalysis {
  continuousDrivingHours: number;
  restTakenMinutes: number;
  aetrContinuousCompliant: boolean;
  aetrDailyCompliant: boolean;
  aetrStatus: 'COMPLIANT' | 'WARNING_NEAR_LIMIT' | 'CRITICAL_OVERDUE';
  minutesUntilMandatoryBreak: number;
  fatigueScorePct: number; // 0 - 100%
  fatigueLevel: 'ALERT' | 'MILD_FATIGUE' | 'HIGH_DROWSINESS' | 'SEVERE_MICROSLEEP_RISK';
  circadianMultiplier: number;
  perclosRisk: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  reactionTimeBaseSec: number;
  reactionTimeDegradedSec: number;
  reactionDistanceMeters: number;
  brakingDistanceMeters: number;
  totalStoppingDistanceMeters: number;
  stoppingDistanceIncreasePct: number;
  recommendedActionAz: string;
  recommendedActionEn: string;
  recommendedActionRu: string;
}

export interface ParkingTariffResult {
  durationHours: number;
  freeHours: number;
  billableHours: number;
  parkingFeeAzn: number;
  shorePowerFeeAzn: number;
  totalFeeAzn: number;
  totalFeeUsd: number;
  totalFeeEur: number;
  amenitiesIncluded: string[];
}

export interface StatutorySanctionsResult {
  aetrViolation: boolean;
  aetrFineAzn: number;
  aetrFineDiscountedAzn: number;
  illegalShoulderParkingViolation: boolean;
  illegalShoulderFineAzn: number;
  illegalShoulderDiscountedAzn: number;
  totalFineAzn: number;
  totalFineDiscountedAzn: number;
  totalFineUsd: number;
  totalFineEur: number;
  demeritPoints: number;
  legalArticles: string[];
}

export interface RestChecklistItem {
  id: string;
  code: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  category: 'SECURITY' | 'HYGIENE' | 'ELECTRICAL' | 'TELEMETRICS';
  standardRef: string;
  points: number;
  passed: boolean;
}

export interface RestExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctAnswer: number;
  explanationAz: string;
  explanationEn: string;
  explanationRu: string;
  legalCitation: string;
}

export interface RestReservationRecord {
  reservationId: string;
  certificateNumber: string;
  vehiclePlate: string;
  vehicleCategory: VehicleCategory;
  driverName: string;
  driverFin: string;
  companyName: string;
  restAreaId: string;
  restAreaName: string;
  bayNumber: string;
  shorePowerRequested: boolean;
  arrivalEstimated: string;
  departureEstimated: string;
  durationHours: number;
  totalFeeAzn: number;
  paymentStatus: 'PAID_ASANPAY' | 'RESERVED_PENDING' | 'ACTIVE_PARKED';
  simaDigitalUid: string;
  securityHashSha256: string;
  barrierPinCode: string;
  issuedAt: string;
  validUntil: string;
}

/**
 * Calculates driver fatigue index, AETR compliance, and stopping distances
 */
export function calculateDriverFatigue(input: DriverFatigueInput): FatigueAnalysis {
  const {
    continuousDrivingHours,
    restTakenMinutes,
    dailyDrivingHours,
    hoursAwake,
    timeOfDay,
    perclosPct,
    steeringCorrectionsPerMin,
    vehicleSpeedKmh,
  } = input;

  // AETR compliance check: 4.5 continuous hours max before 45-min break
  const effectiveRestMinutes = Math.max(0, restTakenMinutes);
  const aetrContinuousCompliant =
    continuousDrivingHours <= 4.5 || effectiveRestMinutes >= 45;

  const aetrDailyCompliant = dailyDrivingHours <= 9.0;

  let aetrStatus: 'COMPLIANT' | 'WARNING_NEAR_LIMIT' | 'CRITICAL_OVERDUE' = 'COMPLIANT';
  if (continuousDrivingHours > 4.5 && effectiveRestMinutes < 45) {
    aetrStatus = 'CRITICAL_OVERDUE';
  } else if (continuousDrivingHours >= 4.0 || dailyDrivingHours >= 8.5) {
    aetrStatus = 'WARNING_NEAR_LIMIT';
  }

  const minutesUntilMandatoryBreak = Math.max(
    0,
    Math.round((4.5 - continuousDrivingHours) * 60)
  );

  // Circadian rhythm factor
  let circadianMultiplier = 1.0;
  if (timeOfDay === 'NIGHT') {
    circadianMultiplier = 1.45; // 00:00 - 06:00 highest fatigue
  } else if (timeOfDay === 'POST_LUNCH') {
    circadianMultiplier = 1.2; // 13:00 - 15:00 dip
  }

  // Base fatigue calculation from continuous driving
  const drivingTerm = Math.min(50, Math.pow(continuousDrivingHours / 4.5, 1.7) * 35);
  // Sleep deprivation term from hours awake (normal 16h)
  const awakeTerm = Math.max(0, (hoursAwake - 12) * 2.8);
  // PERCLOS eye closure term
  const perclosTerm = Math.min(30, (perclosPct / 25) * 25);
  // Steering sluggishness (normal 15-25 micro-corrections; <10 or >32 erratic)
  let steeringTerm = 0;
  if (steeringCorrectionsPerMin < 10) {
    steeringTerm = (10 - steeringCorrectionsPerMin) * 2.5;
  } else if (steeringCorrectionsPerMin > 30) {
    steeringTerm = (steeringCorrectionsPerMin - 30) * 1.5;
  }

  const rawFatigue = (drivingTerm + awakeTerm + perclosTerm + steeringTerm) * circadianMultiplier;
  const fatigueScorePct = Math.min(100, Math.max(5, Math.round(rawFatigue)));

  let fatigueLevel: 'ALERT' | 'MILD_FATIGUE' | 'HIGH_DROWSINESS' | 'SEVERE_MICROSLEEP_RISK' =
    'ALERT';
  if (fatigueScorePct >= 80) {
    fatigueLevel = 'SEVERE_MICROSLEEP_RISK';
  } else if (fatigueScorePct >= 55) {
    fatigueLevel = 'HIGH_DROWSINESS';
  } else if (fatigueScorePct >= 30) {
    fatigueLevel = 'MILD_FATIGUE';
  }

  let perclosRisk: 'NORMAL' | 'ELEVATED' | 'CRITICAL' = 'NORMAL';
  if (perclosPct >= 15) {
    perclosRisk = 'CRITICAL';
  } else if (perclosPct >= 8) {
    perclosRisk = 'ELEVATED';
  }

  // Reaction time degradation
  const reactionTimeBaseSec = 1.0;
  const degradationFactor = 1.0 + (fatigueScorePct / 100) * 1.35;
  const reactionTimeDegradedSec = Math.round(reactionTimeBaseSec * degradationFactor * 100) / 100;

  // Stopping distance physics
  const speedMs = (vehicleSpeedKmh * 1000) / 3600;
  const reactionDistanceMeters = Math.round(speedMs * reactionTimeDegradedSec * 10) / 10;

  // Dry asphalt friction mu ≈ 0.70, g = 9.81
  const mu = 0.7;
  const g = 9.81;
  const brakingDistanceMeters = Math.round((Math.pow(speedMs, 2) / (2 * mu * g)) * 10) / 10;

  const totalStoppingDistanceMeters =
    Math.round((reactionDistanceMeters + brakingDistanceMeters) * 10) / 10;

  const baseStoppingDistance = speedMs * reactionTimeBaseSec + brakingDistanceMeters;
  const stoppingDistanceIncreasePct = Math.max(
    0,
    Math.round(((totalStoppingDistanceMeters - baseStoppingDistance) / baseStoppingDistance) * 100)
  );

  let recommendedActionAz = 'Sürücü ayıq və diqqətlidir. Marşrutu normal davam etdirmək olar.';
  let recommendedActionEn = 'Driver is alert and vigilant. Safe to continue routine journey.';
  let recommendedActionRu = 'Водитель бодр и внимателен. Безопасно продолжать движение.';

  if (fatigueLevel === 'SEVERE_MICROSLEEP_RISK' || aetrStatus === 'CRITICAL_OVERDUE') {
    recommendedActionAz =
      'TƏCİLİ DAYANMA TƏLƏB OLUNUR! Mikro-yuxu və qəza riski kritikdir. Yaxınlıqdakı TIR parkına daxil olun.';
    recommendedActionEn =
      'IMMEDIATE STOP REQUIRED! Critical micro-sleep & crash risk. Divert to nearest truck rest area immediately.';
    recommendedActionRu =
      'ТРЕБУЕТСЯ СРОЧНАЯ ОСТАНОВКА! Критический риск микросна. Немедленно съезжайте в зону отдыха TIR.';
  } else if (fatigueLevel === 'HIGH_DROWSINESS' || aetrStatus === 'WARNING_NEAR_LIMIT') {
    recommendedActionAz =
      'Yüksək yorğunluq aşkarlandı. Növbəti 15-20 dəqiqə ərzində məcburi 45 dəqiqəlik istirahətə çıxın.';
    recommendedActionEn =
      'High fatigue detected. Plan mandatory 45-minute rest stop within next 15-20 minutes.';
    recommendedActionRu =
      'Обнаружена высокая утомляемость. Запланируйте обязательный 45-минутный отдых в течение 15-20 минут.';
  } else if (fatigueLevel === 'MILD_FATIGUE') {
    recommendedActionAz =
      'Mülayim yorğunluq. Təmiz hava qəbul edin və yaxınlıqdakı istirahət zonasında qısa fasilə verin.';
    recommendedActionEn =
      'Mild fatigue signs. Ventilate cabin and schedule a brief rest break at the next rest facility.';
    recommendedActionRu =
      'Легкая усталость. Проветрите кабину и сделайте короткий перерыв в ближайшей зоне отдыха.';
  }

  return {
    continuousDrivingHours,
    restTakenMinutes,
    aetrContinuousCompliant,
    aetrDailyCompliant,
    aetrStatus,
    minutesUntilMandatoryBreak,
    fatigueScorePct,
    fatigueLevel,
    circadianMultiplier,
    perclosRisk,
    reactionTimeBaseSec,
    reactionTimeDegradedSec,
    reactionDistanceMeters,
    brakingDistanceMeters,
    totalStoppingDistanceMeters,
    stoppingDistanceIncreasePct,
    recommendedActionAz,
    recommendedActionEn,
    recommendedActionRu,
  };
}

/**
 * Calculates official statutory parking fees & shore power tariffs
 */
export function calculateParkingTariff(
  durationHours: number,
  shorePowerNeeded: boolean,
  vehicleCategory: VehicleCategory
): ParkingTariffResult {
  const safeHours = Math.max(1, Math.min(24, Math.round(durationHours)));

  // First 2 hours are free to promote statutory 45m rest
  const freeHours = Math.min(2, safeHours);
  const billableHours = Math.max(0, safeHours - freeHours);

  let hourlyRate = 1.0;
  if (vehicleCategory === 'SEMI_TRAILER_TIR') {
    hourlyRate = 1.5;
  } else if (vehicleCategory === 'RIGID_HEAVY_TRUCK' || vehicleCategory === 'INTERCITY_COACH') {
    hourlyRate = 1.2;
  } else if (vehicleCategory === 'LIGHT_COMMERCIAL_VAN') {
    hourlyRate = 0.8;
  } else {
    hourlyRate = 0.5;
  }

  // Parking fee with daily cap (e.g. max 12 AZN/day for TIR)
  const rawParkingFee = billableHours * hourlyRate;
  const dailyCap = vehicleCategory === 'SEMI_TRAILER_TIR' ? 12.0 : 8.0;
  const parkingFeeAzn = Math.round(Math.min(dailyCap, rawParkingFee) * 100) / 100;

  // Shore power (400V 32A reefer unit ~ 4 kW * 0.20 AZN/kWh = 0.80 AZN/hr)
  let shorePowerFeeAzn = 0;
  if (shorePowerNeeded) {
    shorePowerFeeAzn = Math.round(safeHours * 0.8 * 100) / 100;
  }

  const totalFeeAzn = Math.round((parkingFeeAzn + shorePowerFeeAzn) * 100) / 100;
  const totalFeeUsd = convertRestCurrency(totalFeeAzn, 'USD');
  const totalFeeEur = convertRestCurrency(totalFeeAzn, 'EUR');

  const amenitiesIncluded = [
    '24/7 SSTPA Video Mühafizə',
    'Sanitar Qovşağı və Duşxana',
    'Yüksəksürətli Wi-Fi Şəbəkəsi',
    'İçməli Su və Təhlükəsizlik Postu',
  ];

  if (shorePowerNeeded) {
    amenitiesIncluded.push('400V / 32A Soyuducu (Reefer) Elektrik Şəbəkəsi');
  }

  return {
    durationHours: safeHours,
    freeHours,
    billableHours,
    parkingFeeAzn,
    shorePowerFeeAzn,
    totalFeeAzn,
    totalFeeUsd,
    totalFeeEur,
    amenitiesIncluded,
  };
}

/**
 * Calculates statutory fines under Code of Administrative Offences (İXM 322-1, 327.1, 346)
 */
export function calculateStatutorySanctions(
  fatigueAnalysis: FatigueAnalysis,
  parkedOnShoulderIllegally: boolean
): StatutorySanctionsResult {
  const aetrViolation = fatigueAnalysis.aetrStatus === 'CRITICAL_OVERDUE';
  const aetrFineAzn = aetrViolation ? 40 : 0; // İXM 322-1: 40 AZN sürücü üçün
  const aetrFineDiscountedAzn = Math.round(aetrFineAzn * 0.5 * 100) / 100;

  const illegalShoulderParkingViolation = parkedOnShoulderIllegally;
  const illegalShoulderFineAzn = illegalShoulderParkingViolation ? 40 : 0; // İXM 346: 40 AZN
  const illegalShoulderDiscountedAzn = Math.round(illegalShoulderFineAzn * 0.5 * 100) / 100;

  const totalFineAzn = aetrFineAzn + illegalShoulderFineAzn;
  const totalFineDiscountedAzn = aetrFineDiscountedAzn + illegalShoulderDiscountedAzn;

  const totalFineUsd = convertRestCurrency(totalFineDiscountedAzn, 'USD');
  const totalFineEur = convertRestCurrency(totalFineDiscountedAzn, 'EUR');

  let demeritPoints = 0;
  if (aetrViolation) demeritPoints += 2;
  if (illegalShoulderParkingViolation) demeritPoints += 2;

  const legalArticles: string[] = [];
  if (aetrViolation) {
    legalArticles.push(
      'İXM Maddə 322-1: Sürücülərin iş və istirahət rejiminə riayət etməməsi (40 AZN + 2 cərimə balı)'
    );
  }
  if (illegalShoulderParkingViolation) {
    legalArticles.push(
      'İXM Maddə 346 / 327.1: Magistral yolun hərəkət hissəsində və ya yol çiynində qanunsuz dayanma (40 AZN + 2 cərimə balı)'
    );
  }
  if (legalArticles.length === 0) {
    legalArticles.push('Qanun pozuntusu aşkar edilməmişdir (İXM Maddə 38 tam hüquqi uyğunluq)');
  }

  return {
    aetrViolation,
    aetrFineAzn,
    aetrFineDiscountedAzn,
    illegalShoulderParkingViolation,
    illegalShoulderFineAzn,
    illegalShoulderDiscountedAzn,
    totalFineAzn,
    totalFineDiscountedAzn,
    totalFineUsd,
    totalFineEur,
    demeritPoints,
    legalArticles,
  };
}

/**
 * Evaluates the 10-point technical rest area checklist
 */
export function evaluateRestChecklist(items: RestChecklistItem[]): {
  totalPoints: number;
  scorePct: number;
  sstpaAchievedTier: SstpaTier;
  passedCount: number;
  failedCount: number;
} {
  const totalPoints = items.reduce((sum, item) => sum + (item.passed ? item.points : 0), 0);
  const maxPossible = items.reduce((sum, item) => sum + item.points, 0);
  const scorePct = maxPossible > 0 ? Math.round((totalPoints / maxPossible) * 100) : 0;

  let sstpaAchievedTier: SstpaTier = 'BRONZE';
  if (scorePct >= 90) {
    sstpaAchievedTier = 'PLATINUM';
  } else if (scorePct >= 75) {
    sstpaAchievedTier = 'GOLD';
  } else if (scorePct >= 60) {
    sstpaAchievedTier = 'SILVER';
  }

  const passedCount = items.filter((i) => i.passed).length;
  const failedCount = items.length - passedCount;

  return {
    totalPoints,
    scorePct,
    sstpaAchievedTier,
    passedCount,
    failedCount,
  };
}

/**
 * Grades the theoretical examination simulator
 */
export function evaluateRestExam(
  questions: RestExamQuestion[],
  answers: Record<string, number>
): {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
} {
  let score = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctAnswer) {
      score += 1;
    }
  }

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = score >= 8; // 8 out of 10 to pass

  return {
    score,
    total,
    percentage,
    passed,
  };
}

/**
 * Generates an official REST-SAFE-AZ-2026 parking reservation & clearance voucher
 */
export function generateRestReservationRecord(
  facility: RestAreaFacility,
  vehiclePlate: string,
  vehicleCategory: VehicleCategory,
  driverName: string,
  driverFin: string,
  companyName: string,
  durationHours: number,
  shorePowerNeeded: boolean
): RestReservationRecord {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reservationId = `REST-${timestamp.toString().slice(-6)}-${randomSuffix}`;
  const certificateNumber = `REST-SAFE-AZ-2026-${randomSuffix}`;

  const tariff = calculateParkingTariff(durationHours, shorePowerNeeded, vehicleCategory);
  const now = new Date();
  const arrivalTime = now.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });

  const depDate = new Date(now.getTime() + durationHours * 3600 * 1000);
  const departureTime = depDate.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });

  const simaDigitalUid = `SIMA-AETR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const securityHashSha256 = `SHA256:7f8a9b${Math.random().toString(16).substring(2, 14)}e4c02`;
  const barrierPinCode = Math.floor(100000 + Math.random() * 900000).toString();

  const bayNumber = `TIR-${Math.floor(1 + Math.random() * facility.totalTirBays)
    .toString()
    .padStart(2, '0')}`;

  const validUntil = new Date(depDate.getTime() + 2 * 3600 * 1000).toISOString();

  return {
    reservationId,
    certificateNumber,
    vehiclePlate: vehiclePlate.toUpperCase().trim(),
    vehicleCategory,
    driverName: driverName.trim(),
    driverFin: driverFin.toUpperCase().trim(),
    companyName: companyName.trim(),
    restAreaId: facility.id,
    restAreaName: facility.nameAz,
    bayNumber,
    shorePowerRequested: shorePowerNeeded,
    arrivalEstimated: `${now.toLocaleDateString('az-AZ')} ${arrivalTime}`,
    departureEstimated: `${depDate.toLocaleDateString('az-AZ')} ${departureTime}`,
    durationHours,
    totalFeeAzn: tariff.totalFeeAzn,
    paymentStatus: 'PAID_ASANPAY',
    simaDigitalUid,
    securityHashSha256,
    barrierPinCode,
    issuedAt: now.toISOString(),
    validUntil,
  };
}
