/**
 * Official State Maritime and Port Agency (DDLA - Dövlət Dəniz və Liman Agentliyi),
 * Azerbaijan Caspian Shipping Company (ASCO - "Azərbaycan Xəzər Dəniz Gəmiçiliyi" QSC),
 * & Baku International Sea Trade Port (Port of Baku / "Bakı Beynəlxalq Dəniz Ticarət Limanı" QSC - Ələt)
 * Caspian Sea Ro-Pax Ferry & Ro-Ro Vehicle Embarkation, IMO IMDG Maritime Stowage & Lashing (Lashing/Chocking) Telemetry Stand,
 * Trans-Caspian Middle Corridor Route Simulator & Official Electronic Maritime Boarding Pass Portal.
 *
 * Adheres to:
 * - Merchant Shipping Code of the Republic of Azerbaijan (AR Ticarət Gəmiçiliyi Məcəlləsi)
 * - Law of the Republic of Azerbaijan "On Sea Ports" ("Dəniz limanları haqqında" AR Qanunu)
 * - State Maritime and Port Agency (DDLA) regulations under Ministry of Digital Development and Transport (RİNN)
 * - International Maritime Organization (IMO) SOLAS (Safety of Life at Sea) Convention (Chapters VI & VII)
 * - IMO Code of Safe Practice for Cargo Stowage and Securing (CSS Code) & Cargo Securing Manual (CSM)
 * - International Maritime Dangerous Goods (IMDG) Code & IMO EV Circular MSC.1/Circ.1615
 * - ISPS Code (International Ship and Port Facility Security Code - Levels 1, 2, 3)
 * - Code of Administrative Offences (İXM Articles 305.1, 305.2, 306 — Maritime Transport & Stowage Violations)
 */

import { Currency } from '../types/vehicle';

export type PortVehicleCategory =
  | 'sedan_compact'
  | 'suv_crossover'
  | 'minibus_van'
  | 'campervan_rv'
  | 'tir_semitrailer'
  | 'oversize_cargo'
  | 'electric_vehicle';

export type CabinTier =
  | 'deck_seat'
  | 'tourist_4berth'
  | 'superior_2berth'
  | 'deluxe_vip';

export type FerryRouteCode =
  | 'ALAT_AKTAU'
  | 'ALAT_KURYK'
  | 'ALAT_TURKMENBASHI'
  | 'HOVSAN_AKTAU';

export interface PortFacility {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  berthCount: number;
  maxDraftMeters: number;
  ispsSecurityLevel: 1 | 2 | 3;
  vhfChannel: string;
  activeVesselsCount: number;
  ferryBridgeLengthM: number;
  congestionIndex: number; // 0 - 100%
  status: 'operational' | 'busy' | 'weather_delay' | 'security_alert';
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface CaspianFerryVessel {
  id: string;
  name: string;
  imoNumber: string;
  flag: string;
  type: 'Ro-Pax' | 'Ro-Ro';
  carCapacity: number;
  passengerCapacity: number;
  lengthM: number;
  beamM: number;
  deadweightTonnes: number;
  currentLocation: string;
  status: 'boarding' | 'in_transit' | 'berthed' | 'scheduled';
}

export interface MaritimeWeatherSeaState {
  beaufortScale: number; // 0 to 12
  windSpeedKnots: number;
  waveHeightMeters: number;
  shipRollAngleDeg: number;
  seaCondition: 'calm' | 'smooth' | 'moderate' | 'rough' | 'very_rough' | 'storm';
  isNavigationPermitted: boolean;
  lashingRequirement: 'standard_4point' | 'reinforced_6point' | 'heavy_8point' | 'storm_12point';
  chockPairsRequired: number;
  minLashingTensionKn: number;
  advisory: string;
}

export interface LinearMeterCalculation {
  vehicleLengthM: number;
  vehicleWidthM: number;
  vehicleCategory: PortVehicleCategory;
  categoryLabel: string;
  passengerCount: number;
  cabinTier: CabinTier;
  cabinLabel: string;
  routeCode: FerryRouteCode;
  routeName: string;
  isHazardousImdg: boolean;
  isElectricVehicle: boolean;
  baseFreightCostAzn: number;
  linearMeterRateAzn: number;
  passengerTicketTotalAzn: number;
  cabinSurchargeAzn: number;
  ispsSecurityFeeAzn: number;
  terminalHandlingFeeAzn: number;
  dgkManifestDutyAzn: number;
  hazardousSurchargeAzn: number;
  evBatteryHandlingFeeAzn: number;
  totalPortAndFerryCostAzn: number;
  totalConverted: number;
  currency: Currency;
  transitTimeHours: number;
  nauticalMiles: number;
}

export interface MaritimeChecklistItem {
  id: string;
  title: string;
  category: 'stowage' | 'safety' | 'hermeticity' | 'hazmat_imdg' | 'ramp_clearance';
  description: string;
  standardRef: string;
  isCritical: boolean;
  passed: boolean;
}

export interface MaritimeChecklistScore {
  score: number;
  passed: boolean;
  passCount: number;
  failCount: number;
  criticalFail: boolean;
  stowageClearanceLevel: 'unconditional_approved' | 'conditional_approved' | 'rejected';
  penaltyAzn: number;
  rating: string;
  verdict: string;
}

export interface MaritimeSafetyExamQuestion {
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

export interface MaritimeBoardingPass {
  passId: string;
  plateNumber: string;
  vin: string;
  vehicleName: string;
  vehicleCategory: PortVehicleCategory;
  categoryLabel: string;
  driverFullName: string;
  driverFin: string;
  routeCode: FerryRouteCode;
  routeName: string;
  vesselName: string;
  deckLevel: 'Upper Weather Deck' | 'Main Vehicle Deck' | 'Lower Cargo Hold';
  laneNumber: string;
  lashingSecuringType: string;
  chockCount: number;
  imdgClass: string | null;
  evSocChecked: boolean;
  totalFareAzn: number;
  issueDate: string;
  departureScheduled: string;
  gatePinCode: string;
  securityHash: string;
  simaSignatureUid: string;
  portOfficerName: string;
  portOfficerBadge: string;
  qrData: string;
}

export interface MaritimeVehiclePreset {
  id: string;
  name: string;
  category: PortVehicleCategory;
  categoryLabel: string;
  plateNumber: string;
  vin: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  curbWeightKg: number;
  isElectric: boolean;
  isHazardous: boolean;
  imdgClass: string | null;
  defaultRoute: FerryRouteCode;
  operator: string;
  description: string;
  imageUrl: string;
}

// Statutory Exchange Rates
export const AZN_TO_USD = 0.5882; // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
export const AZN_TO_EUR = 0.5405; // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)

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
 * Linear meter rate by vehicle category
 */
export function getLinearMeterRateAzn(category: PortVehicleCategory): number {
  switch (category) {
    case 'sedan_compact':
      return 55; // 55 AZN/meter
    case 'suv_crossover':
      return 65; // 65 AZN/meter
    case 'minibus_van':
      return 80; // 80 AZN/meter
    case 'campervan_rv':
      return 95; // 95 AZN/meter
    case 'tir_semitrailer':
      return 115; // 115 AZN/meter
    case 'oversize_cargo':
      return 150; // 150 AZN/meter
    case 'electric_vehicle':
      return 60; // 60 AZN/meter
    default:
      return 60;
  }
}

/**
 * Route details configuration
 */
export const ROUTE_METADATA: Record<
  FerryRouteCode,
  { name: string; nauticalMiles: number; transitHours: number; distanceFactor: number }
> = {
  ALAT_AKTAU: {
    name: 'Ələt (Bakı) — Aktau (Qazaxıstan)',
    nauticalMiles: 253,
    transitHours: 22,
    distanceFactor: 1.0,
  },
  ALAT_KURYK: {
    name: 'Ələt (Bakı) — Kurık (Qazaxıstan)',
    nauticalMiles: 260,
    transitHours: 24,
    distanceFactor: 1.02,
  },
  ALAT_TURKMENBASHI: {
    name: 'Ələt (Bakı) — Türkmənbaşı (Türkmənistan)',
    nauticalMiles: 160,
    transitHours: 16,
    distanceFactor: 0.85,
  },
  HOVSAN_AKTAU: {
    name: 'Hövsan (Bakı) — Aktau (Qazaxıstan)',
    nauticalMiles: 265,
    transitHours: 25,
    distanceFactor: 1.05,
  },
};

/**
 * Category friendly labels
 */
export const CATEGORY_LABELS: Record<PortVehicleCategory, string> = {
  sedan_compact: 'Minik Avtomobili (Sedan / Hetçbek)',
  suv_crossover: 'Krossover / SUV / Cip',
  minibus_van: 'Mikroavtobus / Yüngül Furqon',
  campervan_rv: 'Turist Karvan / Avtodom (RV)',
  tir_semitrailer: 'TIR Yəhərli Qoşqu / Avtoqatar',
  oversize_cargo: 'İriqabaritli / Ağır Texnika',
  electric_vehicle: 'Elektromobil (EV / Plug-in)',
};

/**
 * Cabin friendly labels and pricing
 */
export const CABIN_METADATA: Record<CabinTier, { label: string; surchargeAzn: number }> = {
  deck_seat: { label: 'Oturaq Yer (Pullman Salonu)', surchargeAzn: 0 },
  tourist_4berth: { label: '4-Nəfərlik Standart Kayut', surchargeAzn: 45 },
  superior_2berth: { label: '2-Nəfərlik Komfortun Kayut', surchargeAzn: 95 },
  deluxe_vip: { label: 'De-Luxe VIP Dəniz Mənzərəli Kayut', surchargeAzn: 190 },
};

/**
 * Calculates comprehensive Ro-Pax ferry freight and port dues
 */
export function calculateMaritimeFreight(params: {
  vehicleLengthM: number;
  vehicleWidthM?: number;
  vehicleCategory: PortVehicleCategory;
  passengerCount: number;
  cabinTier: CabinTier;
  routeCode: FerryRouteCode;
  isHazardousImdg?: boolean;
  isElectricVehicle?: boolean;
  currency?: Currency;
}): LinearMeterCalculation {
  const {
    vehicleLengthM,
    vehicleWidthM = 2.0,
    vehicleCategory,
    passengerCount = 1,
    cabinTier,
    routeCode,
    isHazardousImdg = false,
    isElectricVehicle = false,
    currency = 'AZN',
  } = params;

  const route = ROUTE_METADATA[routeCode];
  const linearRate = getLinearMeterRateAzn(vehicleCategory);
  
  // Base linear freight = length * rate * distanceFactor
  const baseFreight = Math.round(vehicleLengthM * linearRate * route.distanceFactor);

  // Standard passenger ticket = 80 AZN per passenger (Deck seat included)
  const passengerTicketTotal = passengerCount * 80;

  // Cabin upgrade surcharge
  const cabinInfo = CABIN_METADATA[cabinTier];
  const cabinSurcharge = cabinInfo.surchargeAzn;

  // Statutory Port & State Dues
  const ispsSecurityFeeAzn = 25; // ISPS Code security declaration
  const terminalHandlingFeeAzn = 40; // Port of Baku THC
  const dgkManifestDutyAzn = 30; // Customs electronic transit manifest

  // Surcharges for Hazardous & EV
  const hazardousSurchargeAzn = isHazardousImdg ? Math.round(baseFreight * 0.35) : 0;
  const evBatteryHandlingFeeAzn = isElectricVehicle ? 20 : 0;

  const totalPortAndFerryCostAzn =
    baseFreight +
    passengerTicketTotal +
    cabinSurcharge +
    ispsSecurityFeeAzn +
    terminalHandlingFeeAzn +
    dgkManifestDutyAzn +
    hazardousSurchargeAzn +
    evBatteryHandlingFeeAzn;

  const totalConverted = convertAznToCurrency(totalPortAndFerryCostAzn, currency);

  return {
    vehicleLengthM,
    vehicleWidthM,
    vehicleCategory,
    categoryLabel: CATEGORY_LABELS[vehicleCategory],
    passengerCount,
    cabinTier,
    cabinLabel: cabinInfo.label,
    routeCode,
    routeName: route.name,
    isHazardousImdg,
    isElectricVehicle,
    baseFreightCostAzn: baseFreight,
    linearMeterRateAzn: linearRate,
    passengerTicketTotalAzn: passengerTicketTotal,
    cabinSurchargeAzn: cabinSurcharge,
    ispsSecurityFeeAzn,
    terminalHandlingFeeAzn,
    dgkManifestDutyAzn,
    hazardousSurchargeAzn,
    evBatteryHandlingFeeAzn,
    totalPortAndFerryCostAzn,
    totalConverted,
    currency,
    transitTimeHours: route.transitHours,
    nauticalMiles: route.nauticalMiles,
  };
}

/**
 * Calculates Caspian Sea weather condition, ship roll, and lashing requirements
 */
export function evaluateMaritimeSeaState(
  beaufortScale: number,
  shipRollAngleDeg: number
): MaritimeWeatherSeaState {
  const clampedBft = Math.max(0, Math.min(12, Math.round(beaufortScale)));
  const clampedRoll = Math.max(0, Math.min(35, Math.round(shipRollAngleDeg)));

  let windSpeedKnots = 5;
  let waveHeightMeters = 0.3;
  let seaCondition: MaritimeWeatherSeaState['seaCondition'] = 'calm';
  let isNavigationPermitted = true;
  let lashingRequirement: MaritimeWeatherSeaState['lashingRequirement'] = 'standard_4point';
  let chockPairsRequired = 1;
  let minLashingTensionKn = 20;
  let advisory = 'Dəniz sakitdir. Standart 4-nöqtəli zəncir bəndləməsi və təkər pazları kifayətdir.';

  if (clampedBft <= 2) {
    windSpeedKnots = 4 + clampedBft * 3;
    waveHeightMeters = 0.2 + clampedBft * 0.15;
    seaCondition = 'calm';
    lashingRequirement = 'standard_4point';
    chockPairsRequired = 1;
    minLashingTensionKn = 20;
    advisory = 'Sakit dəniz. Standart 4-nöqtəli bağlama (MBL ≥20 kN).';
  } else if (clampedBft <= 4) {
    windSpeedKnots = 11 + (clampedBft - 3) * 5;
    waveHeightMeters = 0.8 + (clampedBft - 3) * 0.5;
    seaCondition = 'smooth';
    lashingRequirement = 'standard_4point';
    chockPairsRequired = 1;
    minLashingTensionKn = 30;
    advisory = 'Mülayim dalğalar. Bütün zəncirlərin gərilməsi yoxlanılmalıdır.';
  } else if (clampedBft <= 6) {
    windSpeedKnots = 22 + (clampedBft - 5) * 5;
    waveHeightMeters = 2.0 + (clampedBft - 5) * 0.8;
    seaCondition = 'moderate';
    lashingRequirement = 'reinforced_6point';
    chockPairsRequired = 2;
    minLashingTensionKn = 45;
    advisory = 'Orta dalğalı dəniz. Gücləndirilmiş 6-nöqtəli bağlama və cüt pazlar tələb olunur.';
  } else if (clampedBft <= 7) {
    windSpeedKnots = 28 + (clampedBft - 6) * 5;
    waveHeightMeters = 3.2 + (clampedBft - 6) * 1.0;
    seaCondition = 'rough';
    lashingRequirement = 'heavy_8point';
    chockPairsRequired = 2;
    minLashingTensionKn = 65;
    advisory = 'Girişməli dəniz. Ağır 8-nöqtəli polad zəncir bağlama və təkər blokadası məcburidir.';
  } else if (clampedBft <= 9) {
    windSpeedKnots = 38 + (clampedBft - 8) * 8;
    waveHeightMeters = 5.0 + (clampedBft - 8) * 1.5;
    seaCondition = 'very_rough';
    lashingRequirement = 'storm_12point';
    chockPairsRequired = 3;
    minLashingTensionKn = 90;
    advisory = 'Qasırğalı hava (Gale). 12-nöqtəli zəncir zirehi və göyərtəyə çıxış məhdudlaşdırılır.';
  } else {
    windSpeedKnots = 50 + (clampedBft - 10) * 10;
    waveHeightMeters = 7.5 + (clampedBft - 10) * 2.0;
    seaCondition = 'storm';
    isNavigationPermitted = false;
    lashingRequirement = 'storm_12point';
    chockPairsRequired = 3;
    minLashingTensionKn = 120;
    advisory = 'Fırtına xəbərdarlığı! Dənizə çıxış və bərə yanalması tam dayandırılır.';
  }

  // Adjust for ship roll angle if significant
  if (clampedRoll >= 15 && isNavigationPermitted) {
    if (lashingRequirement === 'standard_4point') {
      lashingRequirement = 'reinforced_6point';
      minLashingTensionKn = 45;
    } else if (lashingRequirement === 'reinforced_6point') {
      lashingRequirement = 'heavy_8point';
      minLashingTensionKn = 70;
    }
  }

  return {
    beaufortScale: clampedBft,
    windSpeedKnots,
    waveHeightMeters: Math.round(waveHeightMeters * 10) / 10,
    shipRollAngleDeg: clampedRoll,
    seaCondition,
    isNavigationPermitted,
    lashingRequirement,
    chockPairsRequired,
    minLashingTensionKn,
    advisory,
  };
}

/**
 * Evaluates the 10-point maritime stowage technical checklist
 */
export function evaluateMaritimeChecklist(items: MaritimeChecklistItem[]): MaritimeChecklistScore {
  const total = items.length;
  if (total === 0) {
    return {
      score: 0,
      passed: false,
      passCount: 0,
      failCount: 0,
      criticalFail: false,
      stowageClearanceLevel: 'rejected',
      penaltyAzn: 400,
      rating: 'F',
      verdict: 'Məlumat daxil edilməyib.',
    };
  }

  const passCount = items.filter((i) => i.passed).length;
  const failCount = total - passCount;
  const criticalFail = items.some((i) => i.isCritical && !i.passed);
  const score = Math.round((passCount / total) * 100);

  let passed = false;
  let stowageClearanceLevel: MaritimeChecklistScore['stowageClearanceLevel'] = 'rejected';
  let penaltyAzn = 0;
  let rating = 'F';
  let verdict = '';

  if (!criticalFail && score >= 90) {
    passed = true;
    stowageClearanceLevel = 'unconditional_approved';
    penaltyAzn = 0;
    rating = 'A (Mükəmməl)';
    verdict = 'Bərəyə minik icazəsi qeyd-şərtsiz təsdiq edildi. Bütün SOLAS & IMDG standartları ödənilib.';
  } else if (!criticalFail && score >= 70) {
    passed = true;
    stowageClearanceLevel = 'conditional_approved';
    penaltyAzn = 100; // İXM 305.1 cüzi çatışmazlıq protokolu
    rating = 'B (Şərti İcazə)';
    verdict = 'Şərti təsdiq. Nöqsanların aradan qaldırılması üçün Ələt Limanı xidmət zonasına yönləndirildi.';
  } else {
    passed = false;
    stowageClearanceLevel = 'rejected';
    penaltyAzn = criticalFail ? 300 : 200; // İXM 305.2 ciddi pozuntu
    rating = criticalFail ? 'Kritik İmtina (F)' : 'C (Uyğun Deyil)';
    verdict = criticalFail
      ? 'Kritik təhlükəsizlik qaydası pozulub (yanacaq sızması, bağlama qarmağı qüsuru və ya IMDG ziddiyyəti). Gəmiyə minik qadağandır.'
      : 'Uyğunluq balı yetərsizdir. Nəqliyyat vasitəsi təmirə yönləndirilməlidir.';
  }

  return {
    score,
    passed,
    passCount,
    failCount,
    criticalFail,
    stowageClearanceLevel,
    penaltyAzn,
    rating,
    verdict,
  };
}

/**
 * Evaluates 10-Question Maritime Transport Theoretical Exam
 */
export function evaluateMaritimeExam(userAnswers: Record<string, number>, questions: MaritimeSafetyExamQuestion[]): ExamEvaluationResult {
  const totalCount = questions.length;
  if (totalCount === 0) {
    return {
      scorePercent: 0,
      passed: false,
      correctCount: 0,
      totalCount: 0,
      grade: 'F',
      feedback: 'İmtahan sualları mövcud deyil.',
    };
  }

  let correctCount = 0;
  questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswerIndex) {
      correctCount++;
    }
  });

  const scorePercent = Math.round((correctCount / totalCount) * 100);
  const passed = scorePercent >= 80; // Pass threshold 80%

  let grade: ExamEvaluationResult['grade'] = 'F';
  let feedback = '';

  if (scorePercent >= 90) {
    grade = 'A';
    feedback = 'Mükəmməl nəticə! Dəniz gəmiçiliyi və bərə təhlükəsizliyi qaydalarını yüksək səviyyədə mənimsəmisiniz.';
  } else if (scorePercent >= 80) {
    grade = 'B';
    feedback = 'İmtahan uğurla keçildi. Bərə göyərtəsində hərəkət və lashing qaydalarına tam riayət edin.';
  } else if (scorePercent >= 60) {
    grade = 'C';
    feedback = 'Kafi nəticə, lakin keçid balı (80%) toplanmadı. Zəhmət olmasa SOLAS və IMDG qaydalarını təkrar nəzərdən keçirin.';
  } else {
    grade = 'F';
    feedback = 'Qeyri-məqbul. Dəniz təhlükəsizliyi qaydaları üzrə təkrar təlimdən keçməyiniz tövsiyə olunur.';
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
 * Generates an official Maritime Boarding Pass & Port Gate Permit
 */
export function generateMaritimeBoardingPass(params: {
  plateNumber: string;
  vin: string;
  vehicleName: string;
  vehicleCategory: PortVehicleCategory;
  driverFullName: string;
  driverFin: string;
  routeCode: FerryRouteCode;
  vesselName: string;
  cabinTier: CabinTier;
  totalFareAzn: number;
  imdgClass?: string | null;
  evSocChecked?: boolean;
}): MaritimeBoardingPass {
  const serialNumber = Math.floor(10000 + Math.random() * 90000);
  const passId = `DDLA-PORT-2026-${serialNumber}`;
  const now = new Date();
  const issueDate = now.toISOString().slice(0, 10);
  
  // Scheduled departure: tomorrow 08:30
  const departureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const departureScheduled = `${departureDate.toISOString().slice(0, 10)} 08:30`;

  const gatePinCode = String(Math.floor(100000 + Math.random() * 900000));
  const securityHash = `SHA256:${Math.random().toString(16).substring(2, 10).toUpperCase()}${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
  const simaSignatureUid = `SIMA-DDLA-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;

  // Assign Deck Level and Lane based on category
  let deckLevel: MaritimeBoardingPass['deckLevel'] = 'Main Vehicle Deck';
  let laneNumber = `Göyərtə 2 — Zolaq 0${Math.floor(1 + Math.random() * 6)}`;
  let lashingSecuringType = '4-Nöqtəli Zəncir (MBL ≥25 kN) + 2 Təkər Pazı';
  let chockCount = 2;

  if (params.vehicleCategory === 'tir_semitrailer' || params.vehicleCategory === 'oversize_cargo') {
    deckLevel = 'Main Vehicle Deck';
    laneNumber = `Əsas Yük Göyərtəsi — Zolaq 0${Math.floor(1 + Math.random() * 4)}`;
    lashingSecuringType = '8-Nöqtəli Ağır Polad Zəncir (MBL ≥65 kN) + 4 Polad Dayaq Pazı';
    chockCount = 4;
  } else if (params.vehicleCategory === 'electric_vehicle') {
    deckLevel = 'Upper Weather Deck'; // EVs prefer open/ventilated deck under IMO EV guidelines
    laneNumber = `Açıq Havalı Göyərtə — Zolaq EV-0${Math.floor(1 + Math.random() * 3)}`;
    lashingSecuringType = '6-Nöqtəli Qığılcımkeçirməz Zəncir + Termal Monitorinq';
    chockCount = 2;
  } else if (params.vehicleCategory === 'minibus_van' || params.vehicleCategory === 'campervan_rv') {
    deckLevel = 'Main Vehicle Deck';
    laneNumber = `Göyərtə 2 — Zolaq 0${Math.floor(1 + Math.random() * 5)}`;
    lashingSecuringType = '6-Nöqtəli Polad Zəncir (MBL ≥45 kN) + 2 Paz';
    chockCount = 2;
  } else {
    deckLevel = 'Lower Cargo Hold';
    laneNumber = `Aşağı Yük Sahəsi — Zolaq C-0${Math.floor(1 + Math.random() * 4)}`;
    lashingSecuringType = '4-Nöqtəli Zəncir (MBL ≥25 kN) + 2 Paz';
    chockCount = 2;
  }

  const route = ROUTE_METADATA[params.routeCode];
  const qrData = `DDLA|PORT_OF_BAKU|${passId}|${params.plateNumber}|${params.routeCode}|${params.vesselName}|${departureScheduled}|FARE:${params.totalFareAzn}AZN`;

  return {
    passId,
    plateNumber: params.plateNumber,
    vin: params.vin,
    vehicleName: params.vehicleName,
    vehicleCategory: params.vehicleCategory,
    categoryLabel: CATEGORY_LABELS[params.vehicleCategory],
    driverFullName: params.driverFullName,
    driverFin: params.driverFin,
    routeCode: params.routeCode,
    routeName: route.name,
    vesselName: params.vesselName,
    deckLevel,
    laneNumber,
    lashingSecuringType,
    chockCount,
    imdgClass: params.imdgClass || null,
    evSocChecked: params.evSocChecked || false,
    totalFareAzn: params.totalFareAzn,
    issueDate,
    departureScheduled,
    gatePinCode,
    securityHash,
    simaSignatureUid,
    portOfficerName: 'R. K. Məmmədov (Bərə Dispetçeri)',
    portOfficerBadge: 'DDLA-ALAT-DISP-408',
    qrData,
  };
}
