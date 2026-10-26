/**
 * Official Azerbaijan Railways (ADY - "Azərbaycan Dəmir Yolları" QSC) & BDYP
 * Railway Level Crossing Safety, Auto-Train ("Avto-Qatar" / Motorail Baku-Ganja-Böyük Kəsik & Baku-Qəbələ),
 * Track Level Crossing Signals & Barrier Protocols (YHQ Maddə 44 & İXM Maddə 345 / 346),
 * High-Speed FLIRT / KISS Clearance & Official ADY-RAIL-2026 Motorail Boarding & Crossing Pass Portal.
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Road Traffic" (YHQ Maddə 44 — "Dəmiryol keçidlərində hərəkət qaydaları")
 * - Law of the Republic of Azerbaijan "On Railway Transport" ("Dəmir yolu nəqliyyatı haqqında" AR Qanunu)
 * - Code of Administrative Offences (İXM Maddə 345 & 346 — Dəmiryol keçidindən keçmə qaydalarının pozulması)
 * - Ministry of Digital Development and Transport (RİNN) & ADY Safety Regulations
 * - Stadler KISS & FLIRT EMU 25 kV AC overhead catenary safety clearance standards (GOST 9238 / EN 15273)
 */

import { Currency } from '../types/vehicle';

export type RailVehicleCategory =
  | 'sedan_compact'
  | 'suv_crossover'
  | 'minibus_van'
  | 'electric_vehicle'
  | 'motorcycle_quad'
  | 'commercial_light';

export type RailPassengerClass =
  | 'standard_seat'
  | 'kupe_4berth'
  | 'sv_2berth'
  | 'business_vip';

export type RailRouteCode =
  | 'BAKU_GANJA'
  | 'BAKU_AGSTAFA'
  | 'BAKU_QABALA'
  | 'BAKU_BOYUK_KESIK';

export interface RailwayTerminal {
  id: string;
  name: string;
  code: string;
  city: string;
  platformTracks: number;
  autoRampCapacity: number; // vehicles per hour
  dailyTrainsCount: number;
  hasHighSpeedConnection: boolean;
  liveStatus: 'operational' | 'busy' | 'track_maintenance' | 'weather_slowdown';
  contactVhf: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface MotorailRouteDetails {
  code: RailRouteCode;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  travelTimeMinutes: number;
  highwayDistanceKm: number;
  highwayTimeMinutes: number;
  standardTrainType: string;
  departureTimes: string[];
}

export interface LevelCrossingTelemetry {
  distanceMeters: number; // 0m to 150m
  barrierState: 'fully_open' | 'lowering' | 'fully_closed';
  lightsState: 'white_clear' | 'red_flashing_stop';
  bellActive: boolean;
  trainApproaching: boolean;
  trainSpeedKmH: number; // 60 - 160 km/h
  trainDistanceMeters: number;
  calculatedTimeToImpactSec: number;
  isViolation: boolean;
  violationArticle: string | null;
  fineAzn: number;
  penaltyPoints: number;
  verdict: 'safe_passage' | 'stopping_required' | 'critical_danger' | 'statutory_violation';
}

export interface MotorailCalculation {
  vehicleLengthM: number;
  vehicleWidthM: number;
  vehicleHeightM: number;
  vehicleCurbWeightKg: number;
  vehicleCategory: RailVehicleCategory;
  categoryLabel: string;
  passengerCount: number;
  passengerClass: RailPassengerClass;
  classLabel: string;
  routeCode: RailRouteCode;
  routeName: string;
  isElectric: boolean;
  batterySocPercent: number;
  baseCarFareAzn: number;
  passengerTicketsTotalAzn: number;
  deckLevel: 'Yuxarı Qat (Upper Deck)' | 'Aşağı Qat (Lower Deck)';
  wagonWheelTieDownFeeAzn: number;
  evSafetyBatteryAuditFeeAzn: number;
  stationTerminalFeeAzn: number;
  totalFareAzn: number;
  totalConverted: number;
  currency: Currency;
  estimatedHighwayFuelSavedLiters: number;
  estimatedHighwayFuelCostSavedAzn: number;
  estimatedTollSavedAzn: number;
  co2SavedKg: number;
  drivingFatigueHoursEliminated: number;
}

export interface RailwayChecklistItem {
  id: string;
  title: string;
  category: 'dimensions' | 'fire_fuel' | 'chocking' | 'signals' | 'documentation';
  description: string;
  standardRef: string;
  isCritical: boolean;
  passed: boolean;
}

export interface RailwayChecklistScore {
  score: number;
  passed: boolean;
  passCount: number;
  failCount: number;
  criticalFail: boolean;
  clearanceLevel: 'unconditional_approved' | 'conditional_approved' | 'rejected';
  penaltyAzn: number;
  rating: string;
  verdict: string;
}

export interface RailwayExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  standardRef: string;
}

export interface ExamEvaluationResult {
  scorePercent: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  grade: 'A' | 'B' | 'C' | 'F';
  feedback: string;
}

export interface RailwayBoardingPass {
  passId: string;
  plateNumber: string;
  vin: string;
  vehicleName: string;
  vehicleCategory: RailVehicleCategory;
  categoryLabel: string;
  passengerFullName: string;
  passengerFin: string;
  passengerCount: number;
  passengerClass: RailPassengerClass;
  classLabel: string;
  routeCode: RailRouteCode;
  routeName: string;
  departureStation: string;
  destinationStation: string;
  trainNumber: string;
  wagonNumber: string;
  deckLevel: 'Yuxarı Qat (Upper Deck)' | 'Aşağı Qat (Lower Deck)';
  bayNumber: string;
  passengerWagonNumber: string;
  seatNumbers: string;
  departureTime: string;
  arrivalTime: string;
  totalFareAzn: number;
  gatePinCode: string;
  securityHash: string;
  simaSignatureUid: string;
  inspectorName: string;
  inspectorBadge: string;
  qrData: string;
  issueDate: string;
}

export interface RailwayVehiclePreset {
  id: string;
  name: string;
  category: RailVehicleCategory;
  categoryLabel: string;
  plateNumber: string;
  vin: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  weightKg: number;
  isElectric: boolean;
  batterySoc: number;
  defaultRoute: RailRouteCode;
  imageUrl: string;
  description: string;
}

// Statutory Exchange Rates
export const AZN_TO_USD = 0.5882;
export const AZN_TO_EUR = 0.5405;

/**
 * Currency conversion helper
 */
export function convertAznToCurrency(amountAzn: number, currency: Currency): number {
  if (currency === 'USD') {
    return Math.round(amountAzn * AZN_TO_USD * 100) / 100;
  }
  if (currency === 'EUR') {
    return Math.round(amountAzn * AZN_TO_EUR * 100) / 100;
  }
  return amountAzn;
}

/**
 * Route details configuration
 */
export const MOTOR_AIL_ROUTES: Record<RailRouteCode, MotorailRouteDetails> = {
  BAKU_GANJA: {
    code: 'BAKU_GANJA',
    name: 'Bakı – Gəncə Express Motorail',
    origin: 'Bakı Dəmir Yolu Vağzalı',
    destination: 'Gəncə Mərkəzi Vağzalı',
    distanceKm: 364,
    travelTimeMinutes: 220, // 3h 40m
    highwayDistanceKm: 375,
    highwayTimeMinutes: 300, // 5h
    standardTrainType: 'Stadler FLIRT / KISS Avto-Qatar',
    departureTimes: ['08:00', '14:30', '19:00'],
  },
  BAKU_AGSTAFA: {
    code: 'BAKU_AGSTAFA',
    name: 'Bakı – Tovuz – Ağstafa Qərb Koridoru',
    origin: 'Bakı Dəmir Yolu Vağzalı',
    destination: 'Ağstafa Dəmir Yolu Stansiyası',
    distanceKm: 458,
    travelTimeMinutes: 285, // 4h 45m
    highwayDistanceKm: 470,
    highwayTimeMinutes: 390, // 6h 30m
    standardTrainType: 'Stadler KISS 4-Wagon Auto-Express',
    departureTimes: ['08:45', '17:15'],
  },
  BAKU_QABALA: {
    code: 'BAKU_QABALA',
    name: 'Bakı – Şamaxı – Qəbələ Turizm Xətti',
    origin: 'Bakı Dəmir Yolu Vağzalı',
    destination: 'Qəbələ Dəmir Yolu Terminalı',
    distanceKm: 242,
    travelTimeMinutes: 180, // 3h
    highwayDistanceKm: 225,
    highwayTimeMinutes: 220, // 3h 40m (mountainous terrain)
    standardTrainType: 'Stadler FLIRT Alpine Scenic',
    departureTimes: ['07:30', '16:00'],
  },
  BAKU_BOYUK_KESIK: {
    code: 'BAKU_BOYUK_KESIK',
    name: 'Bakı – Böyük Kəsik (Gürcüstan Sərhədi) Tranzit',
    origin: 'Bakı Dəmir Yolu Vağzalı',
    destination: 'Böyük Kəsik Sərhəd Qovşağı',
    distanceKm: 495,
    travelTimeMinutes: 310, // 5h 10m
    highwayDistanceKm: 510,
    highwayTimeMinutes: 420, // 7h
    standardTrainType: 'ADY Beynəlxalq Avto-Qatar Eşelonu',
    departureTimes: ['21:30'],
  },
};

/**
 * Passenger ticket rates by class (AZN)
 */
export function getPassengerTicketRateAzn(pClass: RailPassengerClass): number {
  switch (pClass) {
    case 'standard_seat':
      return 20; // 20 AZN per person
    case 'kupe_4berth':
      return 35; // 35 AZN per person
    case 'sv_2berth':
      return 60; // 60 AZN per person
    case 'business_vip':
      return 110; // 110 AZN per person
    default:
      return 20;
  }
}

/**
 * Vehicle category base carriage rate (AZN)
 */
export function getVehicleBaseRateAzn(category: RailVehicleCategory): number {
  switch (category) {
    case 'motorcycle_quad':
      return 35;
    case 'sedan_compact':
      return 65;
    case 'suv_crossover':
      return 85;
    case 'minibus_van':
      return 110;
    case 'commercial_light':
      return 120;
    case 'electric_vehicle':
      return 75; // Includes specialized thermal safety tie-down
    default:
      return 65;
  }
}

/**
 * Vehicle category label
 */
export function getVehicleCategoryLabel(category: RailVehicleCategory): string {
  switch (category) {
    case 'motorcycle_quad':
      return 'Motosikl / Kvadrosikl';
    case 'sedan_compact':
      return 'Sedan / Hetçbek / Universal';
    case 'suv_crossover':
      return 'Krossover / Yolsuzluq (SUV)';
    case 'minibus_van':
      return 'Miniven / Mikroavtobus';
    case 'commercial_light':
      return 'Yüngül Kommersiya / Pikap';
    case 'electric_vehicle':
      return 'Elektromobil (EV / PHEV)';
    default:
      return 'Minik Avtomobili';
  }
}

/**
 * Passenger class label
 */
export function getPassengerClassLabel(pClass: RailPassengerClass): string {
  switch (pClass) {
    case 'standard_seat':
      return 'Standart Oturacaq';
    case 'kupe_4berth':
      return 'Kupe (4 Nəfərlik)';
    case 'sv_2berth':
      return 'SV / Lüks (2 Nəfərlik)';
    case 'business_vip':
      return 'VIP Biznes Salon';
    default:
      return 'Standart';
  }
}

/**
 * Calculates Motorail Fare and Economic / Carbon Benefits
 */
export function calculateMotorailFare(params: {
  vehicleLengthM: number;
  vehicleWidthM: number;
  vehicleHeightM: number;
  vehicleCurbWeightKg: number;
  vehicleCategory: RailVehicleCategory;
  passengerCount: number;
  passengerClass: RailPassengerClass;
  routeCode: RailRouteCode;
  isElectric?: boolean;
  batterySocPercent?: number;
  currency?: Currency;
}): MotorailCalculation {
  const currency = params.currency || 'AZN';
  const route = MOTOR_AIL_ROUTES[params.routeCode] || MOTOR_AIL_ROUTES.BAKU_GANJA;
  const isElectric = params.isElectric ?? (params.vehicleCategory === 'electric_vehicle');
  const batterySocPercent = params.batterySocPercent ?? 60;

  // Base vehicle fare adjusted by distance factor relative to Baku-Ganja (364 km)
  const distanceFactor = route.distanceKm / 364;
  const rawBaseCarFare = getVehicleBaseRateAzn(params.vehicleCategory) * distanceFactor;
  const baseCarFareAzn = Math.round(rawBaseCarFare * 10) / 10;

  // Passenger tickets
  const passengerCount = Math.max(1, params.passengerCount);
  const ticketRate = getPassengerTicketRateAzn(params.passengerClass) * distanceFactor;
  const passengerTicketsTotalAzn = Math.round(ticketRate * passengerCount * 10) / 10;

  // Deck level assignment based on height
  // Max upper deck height is 2.05m; lower deck is 1.95m
  const deckLevel: 'Yuxarı Qat (Upper Deck)' | 'Aşağı Qat (Lower Deck)' =
    params.vehicleHeightM > 1.85 ? 'Yuxarı Qat (Upper Deck)' : 'Aşağı Qat (Lower Deck)';

  // Mandatory wagon tie-down and wheel chocking fee (statutory 15 AZN)
  const wagonWheelTieDownFeeAzn = 15;

  // EV fire safety inspection & high-voltage battery audit (statutory 10 AZN)
  const evSafetyBatteryAuditFeeAzn = isElectric ? 10 : 0;

  // ADY terminal and ramp marshalling fee (statutory 10 AZN)
  const stationTerminalFeeAzn = 10;

  const totalFareAzn = Math.round(
    (baseCarFareAzn +
      passengerTicketsTotalAzn +
      wagonWheelTieDownFeeAzn +
      evSafetyBatteryAuditFeeAzn +
      stationTerminalFeeAzn) * 100
  ) / 100;

  const totalConverted = convertAznToCurrency(totalFareAzn, currency);

  // Economic & Ecological comparison vs highway driving
  // Highway consumption avg 8.5 L/100km, fuel cost 1.10 AZN/L (Aİ-92)
  const highwayFuelConsumptionPer100 = params.vehicleCategory === 'suv_crossover' ? 10.5 : 8.0;
  const estimatedHighwayFuelSavedLiters = Math.round(
    ((route.highwayDistanceKm * highwayFuelConsumptionPer100) / 100) * 10
  ) / 10;
  const estimatedHighwayFuelCostSavedAzn = Math.round(
    estimatedHighwayFuelSavedLiters * 1.10 * 10
  ) / 10;

  // M1/M2 toll highway fee avoided
  const estimatedTollSavedAzn = Math.round(route.highwayDistanceKm * 0.04 * 10) / 10;

  // CO2 savings (average car produces ~185g CO2/km; train produces ~38g CO2/km equivalent, saving ~79%)
  const carTotalCo2Kg = (route.highwayDistanceKm * 0.185);
  const trainTotalCo2Kg = (route.distanceKm * 0.038);
  const co2SavedKg = Math.round((carTotalCo2Kg - trainTotalCo2Kg) * 10) / 10;

  const drivingFatigueHoursEliminated = Math.round((route.highwayTimeMinutes / 60) * 10) / 10;

  return {
    vehicleLengthM: params.vehicleLengthM,
    vehicleWidthM: params.vehicleWidthM,
    vehicleHeightM: params.vehicleHeightM,
    vehicleCurbWeightKg: params.vehicleCurbWeightKg,
    vehicleCategory: params.vehicleCategory,
    categoryLabel: getVehicleCategoryLabel(params.vehicleCategory),
    passengerCount,
    passengerClass: params.passengerClass,
    classLabel: getPassengerClassLabel(params.passengerClass),
    routeCode: params.routeCode,
    routeName: route.name,
    isElectric,
    batterySocPercent,
    baseCarFareAzn,
    passengerTicketsTotalAzn,
    deckLevel,
    wagonWheelTieDownFeeAzn,
    evSafetyBatteryAuditFeeAzn,
    stationTerminalFeeAzn,
    totalFareAzn,
    totalConverted,
    currency,
    estimatedHighwayFuelSavedLiters,
    estimatedHighwayFuelCostSavedAzn,
    estimatedTollSavedAzn,
    co2SavedKg,
    drivingFatigueHoursEliminated,
  };
}

/**
 * Level Crossing Safety & Violation Evaluator (YHQ Maddə 44 & İXM Maddə 345 / 346)
 */
export function evaluateRailwayCrossingViolation(params: {
  distanceMeters: number; // distance from nearest rail or barrier
  barrierState: 'fully_open' | 'lowering' | 'fully_closed';
  lightsState: 'white_clear' | 'red_flashing_stop';
  bellActive: boolean;
  trainApproaching: boolean;
  trainSpeedKmH?: number; // km/h
  trainDistanceMeters?: number; // meters from crossing
}): LevelCrossingTelemetry {
  const trainSpeedKmH = params.trainSpeedKmH ?? 120;
  const trainDistanceMeters = params.trainDistanceMeters ?? 400;

  // Time to impact in seconds: (distance in m) / (speed in m/s)
  const trainSpeedMS = (trainSpeedKmH * 1000) / 3600;
  const calculatedTimeToImpactSec = Math.round((trainDistanceMeters / Math.max(1, trainSpeedMS)) * 10) / 10;

  let isViolation = false;
  let violationArticle: string | null = null;
  let fineAzn = 0;
  let penaltyPoints = 0;
  let verdict: 'safe_passage' | 'stopping_required' | 'critical_danger' | 'statutory_violation' = 'safe_passage';

  const isRed = params.lightsState === 'red_flashing_stop';
  const isBarrierMovingOrClosed = params.barrierState === 'lowering' || params.barrierState === 'fully_closed';

  if (isRed || isBarrierMovingOrClosed || params.bellActive) {
    // Under YHQ Article 44: When red flashing lights, lowering barrier, or bell is active, stopping is mandatory!
    // Driver must stop at least 5m before barrier or 10m before the nearest rail if no barrier.
    if (params.distanceMeters <= 0) {
      // Vehicle entered the tracks while forbidden
      isViolation = true;
      violationArticle = 'İXM Maddə 345 & YHQ Maddə 44 (Qadağan olunmuş rejimdə relsə daxil olma)';
      fineAzn = 150;
      penaltyPoints = 4;
      verdict = 'critical_danger';
    } else if (params.distanceMeters < 5 && isBarrierMovingOrClosed) {
      isViolation = true;
      violationArticle = 'İXM Maddə 345 (Dəmiryol keçidindən keçmə qaydalarının pozulması)';
      fineAzn = 100;
      penaltyPoints = 3;
      verdict = calculatedTimeToImpactSec <= 15 ? 'critical_danger' : 'statutory_violation';
    } else {
      verdict = 'stopping_required';
    }
  } else {
    // White light / clear
    verdict = 'safe_passage';
  }

  return {
    distanceMeters: params.distanceMeters,
    barrierState: params.barrierState,
    lightsState: params.lightsState,
    bellActive: params.bellActive,
    trainApproaching: params.trainApproaching,
    trainSpeedKmH,
    trainDistanceMeters,
    calculatedTimeToImpactSec,
    isViolation,
    violationArticle,
    fineAzn,
    penaltyPoints,
    verdict,
  };
}

/**
 * Evaluates the 10-Point Technical Motorail & Crossing Checklist
 */
export function evaluateRailwayChecklist(items: RailwayChecklistItem[]): RailwayChecklistScore {
  const totalCount = items.length;
  if (totalCount === 0) {
    return {
      score: 100,
      passed: true,
      passCount: 0,
      failCount: 0,
      criticalFail: false,
      clearanceLevel: 'unconditional_approved',
      penaltyAzn: 0,
      rating: '100% Müvəffəqiyyətli',
      verdict: 'Bütün texniki tələblər tam təmin edilib.',
    };
  }

  let passCount = 0;
  let criticalFail = false;

  for (const item of items) {
    if (item.passed) {
      passCount++;
    } else if (item.isCritical) {
      criticalFail = true;
    }
  }

  const failCount = totalCount - passCount;
  const score = Math.round((passCount / totalCount) * 100);

  let clearanceLevel: 'unconditional_approved' | 'conditional_approved' | 'rejected' =
    'unconditional_approved';
  let penaltyAzn = 0;
  let verdict = '';
  let rating = `${score}%`;

  if (criticalFail || score < 60) {
    clearanceLevel = 'rejected';
    penaltyAzn = 80;
    verdict =
      'Kritik təhlükəsizlik qaydası pozulub və ya qabarit norması aşılıb. Vaqona yüklənmə qadağandır!';
    rating = `${score}% Qeyri-kafi (Rədd edilib)`;
  } else if (score < 100) {
    clearanceLevel = 'conditional_approved';
    penaltyAzn = 30;
    verdict =
      'Kiçik çatışmazlıqlar qeydə alınıb. Vaqona yüklənməyə nəzarətçi müşayiəti ilə icazə verilir.';
    rating = `${score}% Şərti İcazə`;
  } else {
    clearanceLevel = 'unconditional_approved';
    penaltyAzn = 0;
    verdict =
      'Nəqliyyat vasitəsi ADY və BDYP standartlarına tam uyğundur. Avtovaqona yüklənməyə icazə verilir.';
    rating = '100% Əla (Təsdiqləndi)';
  }

  return {
    score,
    passed: clearanceLevel !== 'rejected',
    passCount,
    failCount,
    criticalFail,
    clearanceLevel,
    penaltyAzn,
    rating,
    verdict,
  };
}

/**
 * Grades the Theoretical Railway Traffic Exam
 */
export function gradeRailwayExam(
  questions: RailwayExamQuestion[],
  answers: Record<string, number>
): ExamEvaluationResult {
  const totalCount = questions.length;
  if (totalCount === 0) {
    return {
      scorePercent: 100,
      passed: true,
      correctCount: 0,
      totalCount: 0,
      grade: 'A',
      feedback: 'İmtahan sualı yoxdur.',
    };
  }

  let correctCount = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctAnswerIndex) {
      correctCount++;
    }
  }

  const scorePercent = Math.round((correctCount / totalCount) * 100);
  const passed = scorePercent >= 80;

  let grade: 'A' | 'B' | 'C' | 'F' = 'F';
  let feedback = '';

  if (scorePercent >= 90) {
    grade = 'A';
    feedback =
      'Əla nəticə! Dəmiryol keçidləri və qatar təhlükəsizliyi qaydalarını mükəmməl bilirsiniz.';
  } else if (scorePercent >= 80) {
    grade = 'B';
    feedback =
      'Yaxşı nəticə! İmtahan uğurla başa çatdı. İcazə vərəqəsi üçün təsdiqləndi.';
  } else if (scorePercent >= 60) {
    grade = 'C';
    feedback =
      'Kafi nəticə, lakin keçid balı (80%) toplanmadı. Zəhmət olmasa YHQ Maddə 44-ü təkrar oxuyun.';
  } else {
    grade = 'F';
    feedback =
      'Qeyri-kafi. Dəmiryol keçidlərində hərəkət qaydaları ciddi şəkildə öyrənilməlidir.';
  }

  return {
    scorePercent,
    passed,
    correctCount,
    totalCount,
    grade,
    feedback,
  };
}

/**
 * Generates an Official ADY & BDYP Electronic Motorail Boarding Pass
 */
export function generateRailwayBoardingPass(params: {
  plateNumber: string;
  vin: string;
  vehicleName: string;
  vehicleCategory: RailVehicleCategory;
  passengerFullName: string;
  passengerFin: string;
  passengerCount: number;
  passengerClass: RailPassengerClass;
  routeCode: RailRouteCode;
  totalFareAzn: number;
}): RailwayBoardingPass {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const passId = `ADY-RAIL-2026-${randomSuffix}`;
  const route = MOTOR_AIL_ROUTES[params.routeCode] || MOTOR_AIL_ROUTES.BAKU_GANJA;

  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];

  // Assigned train & wagon specifics
  const trainNumber =
    params.routeCode === 'BAKU_GANJA'
      ? 'ADY Express № 702'
      : params.routeCode === 'BAKU_AGSTAFA'
      ? 'ADY Qərb Express № 706'
      : params.routeCode === 'BAKU_QABALA'
      ? 'ADY Şimal Express № 714'
      : 'ADY Tranzit Eşelon № 720';

  const randomWagonNum = Math.floor(10 + Math.random() * 8); // 10-17
  const wagonNumber = `Avtovaqon № ${randomWagonNum}`;
  const bayNumber = `Bay 0${Math.floor(1 + Math.random() * 6)}`;
  const passengerWagonNumber = `Vaqon № 0${Math.floor(2 + Math.random() * 4)}`;
  const startSeat = Math.floor(10 + Math.random() * 20);
  const seatNumbers = Array.from(
    { length: params.passengerCount },
    (_, idx) => `Yer ${startSeat + idx}`
  ).join(', ');

  const departureTime = route.departureTimes[0] || '08:00';
  const arrivalMinutes =
    parseInt(departureTime.split(':')[0], 10) * 60 +
    parseInt(departureTime.split(':')[1], 10) +
    route.travelTimeMinutes;
  const arrH = Math.floor((arrivalMinutes / 60) % 24)
    .toString()
    .padStart(2, '0');
  const arrM = Math.floor(arrivalMinutes % 60)
    .toString()
    .padStart(2, '0');
  const arrivalTime = `${arrH}:${arrM}`;

  const gatePinCode = Math.floor(1000 + Math.random() * 9000).toString();
  const securityHash = `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase()}`;
  const simaSignatureUid = `SIMA-AZ-RAIL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const inspectors = [
    { name: 'Rəşad Nəsirov', badge: 'ADY-ST-402' },
    { name: 'Tural Məmmədov', badge: 'ADY-ST-118' },
    { name: 'Elmar Quliyev', badge: 'ADY-ST-294' },
    { name: 'Fərid Əliyev', badge: 'ADY-ST-305' },
  ];
  const inspector = inspectors[Math.floor(Math.random() * inspectors.length)];

  const qrData = JSON.stringify({
    passId,
    plate: params.plateNumber,
    route: route.name,
    train: trainNumber,
    wagon: wagonNumber,
    deck: 'Yuxarı Qat (Upper Deck)',
    status: 'ACTIVE_VALIDATED',
    sec: securityHash.substring(0, 16),
  });

  return {
    passId,
    plateNumber: params.plateNumber,
    vin: params.vin,
    vehicleName: params.vehicleName,
    vehicleCategory: params.vehicleCategory,
    categoryLabel: getVehicleCategoryLabel(params.vehicleCategory),
    passengerFullName: params.passengerFullName,
    passengerFin: params.passengerFin,
    passengerCount: params.passengerCount,
    passengerClass: params.passengerClass,
    classLabel: getPassengerClassLabel(params.passengerClass),
    routeCode: params.routeCode,
    routeName: route.name,
    departureStation: route.origin,
    destinationStation: route.destination,
    trainNumber,
    wagonNumber,
    deckLevel: 'Yuxarı Qat (Upper Deck)',
    bayNumber,
    passengerWagonNumber,
    seatNumbers,
    departureTime,
    arrivalTime,
    totalFareAzn: params.totalFareAzn,
    gatePinCode,
    securityHash,
    simaSignatureUid,
    inspectorName: inspector.name,
    inspectorBadge: inspector.badge,
    qrData,
    issueDate,
  };
}

/**
 * Validates and formats Azerbaijan license plate
 */
export function formatAzerbaijanPlate(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 7)}`;
  }
  return input.toUpperCase();
}
