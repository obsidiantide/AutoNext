/**
 * Official Baku Metro (Bakı Metropoliteni QSC) & AYNA Ground Transit Intermodal
 * Park & Ride (P+R) Hubs ("Park et və Metro ilə Get"), Transport Interchange Hubs (NMM / HUB),
 * Metro-Automobile Combined Commute Cost, Transit Time & Carbon Savings Calculator,
 * BakıKart Unified Transit Fare Integration & Official BAKI-METRO-2026 Intermodal P+R Boarding Pass Portal.
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Transport" ("Nəqliyyat haqqında" AR Qanunu)
 * - Rules of Passenger Carriage in Baku Metro approved by Cabinet of Ministers Resolution No. 226 ("Bakı Metropolitenindən istifadə qaydaları")
 * - Code of Administrative Offences (İXM Articles 306, 307.1, 307.2, 342.1)
 * - AYNA Baku Transport Interchange Hubs (Nəqliyyat Mübadilə Mərkəzi - NMM) Masterplan
 * - State Tariff Council (Tarif Şurası) Unified Urban Public Transit Tariff Decision (Metro ride: 0.50 AZN)
 * - Cabinet of Ministers Fire Safety Prohibition: LPG/CNG autogas vehicles strictly prohibited in underground parking levels
 */

import { Currency } from '../types/vehicle';

export type MetroHubId =
  | 'koroglu_hub'
  | 'avtovagzal_hub'
  | 'dernegul_hub'
  | 'xocesen_hub'
  | 'hezi_aslanov_hub'
  | 'may28_hub'
  | 'xetai_hub';

export type MetroLineId = 'red_line' | 'green_line' | 'purple_line';

export type IntermodalVehicleType =
  | 'sedan_compact'
  | 'suv_crossover'
  | 'electric_ev'
  | 'hybrid_phev'
  | 'motorcycle_scooter'
  | 'minivan_van';

export type PnrParkingDuration =
  | 'hourly_short' // 1-3 hours
  | 'commute_workday' // 8-10 hours
  | 'daily_24h' // 24 hours
  | 'monthly_subscription'; // 30 days unlimited

export type BakiKartValidationStatus =
  | 'validated_discount_active'
  | 'not_validated_standard_rate'
  | 'grace_period_pending';

export interface MetroHub {
  id: MetroHubId;
  name: string;
  code: string;
  lineId: MetroLineId;
  lineName: string;
  lineColor: string;
  district: string;
  address: string;
  totalBays: number;
  availableBays: number;
  evChargingBays: number;
  disabledBays: number;
  bicycleSpots: number;
  hasDirectUnderpass: boolean;
  hasSubterraneanLevels: boolean;
  securityGuards247: boolean;
  hourlyRateAzn: number;
  dailyRateAzn: number;
  monthlyRateAzn: number;
  liveStatus: 'optimal' | 'moderate' | 'near_capacity' | 'congested';
  coordinates: {
    lat: number;
    lng: number;
  };
  connectedBusRoutes: string[];
}

export interface IntermodalSavingsBreakdown {
  dailyFuelSavedLiters: number;
  dailyFuelCostSavedAzn: number;
  dailyParkingDowntownCostSavedAzn: number;
  dailyNetSavingsAzn: number;
  dailyTimeSavedMinutes: number;
  dailyCo2SavedKg: number;
  annualNetSavingsAzn: number;
  annualTimeSavedHours: number;
  annualCo2SavedKg: number;
}

export interface MetroChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'clearance' | 'regulations' | 'environmental';
  isMandatory: boolean;
  points: number;
}

export interface MetroExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation: string;
}

export interface MetroIntermodalPass {
  passNumber: string; // e.g. BAKI-METRO-2026-XXXXX
  issueDate: string;
  expiryDate: string;
  hubId: MetroHubId;
  hubName: string;
  lineId: MetroLineId;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleType: IntermodalVehicleType;
  pnrDuration: PnrParkingDuration;
  bayNumber: string;
  turnstileGatePin: string;
  baseParkingCost: number;
  metroRoundtripFare: number;
  concessionDiscount: number;
  totalPaid: number;
  currency: Currency;
  bakiKartSerial: string;
  isLpgCngCompliant: boolean;
  simaSignatureUid: string;
  securityChecksum: string;
  qrCodeData: string;
}

/**
 * Currency conversion constants
 */
export const METRO_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 1 / 1.7,
  EUR: 1 / 1.85,
};

export const METRO_BASE_TICKET_FARE_AZN = 0.50; // Official Tarif Şurası Metro Fare

/**
 * Calculates intermodal commute savings comparing direct driving into Baku Downtown vs P+R + Metro.
 */
export function calculateMetroIntermodalSavings(params: {
  commuteDistanceKm: number;
  vehicleConsumptionL100km: number;
  fuelPricePerLiterAzn: number; // e.g. 1.10 AZN for Aİ-92 or 1.00 for Diesel
  downtownParkingCostAzn: number; // e.g. AzParking Zone 1/2 ~ 8-10 AZN per workday
  pnrParkingDailyFeeAzn: number; // e.g. 2.00 AZN subsidized or 0 AZN with BakıKart tap
  metroRoundtripFareAzn?: number; // default 1.00 AZN (2 trips x 0.50)
  cityTrafficDelayMinutes: number; // average morning + evening delay (e.g. 45 mins)
  workdaysPerYear?: number; // default 240 workdays
}): IntermodalSavingsBreakdown {
  const {
    commuteDistanceKm,
    vehicleConsumptionL100km,
    fuelPricePerLiterAzn,
    downtownParkingCostAzn,
    pnrParkingDailyFeeAzn,
    metroRoundtripFareAzn = METRO_BASE_TICKET_FARE_AZN * 2,
    cityTrafficDelayMinutes,
    workdaysPerYear = 240,
  } = params;

  // Fuel consumed driving all the way into Baku city center (congested roundtrip)
  // Stop-and-go congestion increases consumption by 35%
  const cityCongestedFuelFactor = 1.35;
  const directDriveFuelLiters = ((commuteDistanceKm * 2) / 100) * vehicleConsumptionL100km * cityCongestedFuelFactor;
  
  // Driving only to the perimeter Metro Hub (smooth highway corridor, e.g. 40% distance)
  const hubDistanceRatio = 0.40;
  const hubDriveFuelLiters = ((commuteDistanceKm * 2 * hubDistanceRatio) / 100) * vehicleConsumptionL100km;
  
  const dailyFuelSavedLiters = Math.max(0, directDriveFuelLiters - hubDriveFuelLiters);
  const dailyFuelCostSavedAzn = dailyFuelSavedLiters * fuelPricePerLiterAzn;

  // Direct parking downtown vs subsidized P+R + Metro transit ticket
  const directDowntownTotalCost = dailyFuelCostSavedAzn + downtownParkingCostAzn;
  const pnrTotalCost = pnrParkingDailyFeeAzn + metroRoundtripFareAzn;
  const dailyNetSavingsAzn = Math.max(0, directDowntownTotalCost - pnrTotalCost);

  // Time saved: Metro takes dedicated underground rail unaffected by rush hour traffic jams
  const dailyTimeSavedMinutes = Math.max(10, Math.round(cityTrafficDelayMinutes * 0.85));

  // CO2 reduction: approx 2.31 kg CO2 per liter of petrol saved
  const dailyCo2SavedKg = Math.round(dailyFuelSavedLiters * 2.31 * 10) / 10;

  const annualNetSavingsAzn = Math.round(dailyNetSavingsAzn * workdaysPerYear * 100) / 100;
  const annualTimeSavedHours = Math.round((dailyTimeSavedMinutes * workdaysPerYear) / 60);
  const annualCo2SavedKg = Math.round(dailyCo2SavedKg * workdaysPerYear);

  return {
    dailyFuelSavedLiters: Math.round(dailyFuelSavedLiters * 10) / 10,
    dailyFuelCostSavedAzn: Math.round(dailyFuelCostSavedAzn * 100) / 100,
    dailyParkingDowntownCostSavedAzn: downtownParkingCostAzn,
    dailyNetSavingsAzn: Math.round(dailyNetSavingsAzn * 100) / 100,
    dailyTimeSavedMinutes,
    dailyCo2SavedKg,
    annualNetSavingsAzn,
    annualTimeSavedHours,
    annualCo2SavedKg,
  };
}

/**
 * Calculates Park & Ride parking fees with BakıKart integration discount.
 */
export function calculateMetroPnrCost(params: {
  hub: MetroHub;
  duration: PnrParkingDuration;
  vehicleType: IntermodalVehicleType;
  bakiKartStatus: BakiKartValidationStatus;
  currency?: Currency;
}): {
  baseParkingFee: number;
  metroFare: number;
  concessionDiscount: number;
  totalCost: number;
  effectiveDiscountPercent: number;
  convertedCost: number;
} {
  const { hub, duration, vehicleType, bakiKartStatus, currency = 'AZN' } = params;

  let baseRate = 0;
  switch (duration) {
    case 'hourly_short':
      baseRate = hub.hourlyRateAzn * 2; // 2 hours sample
      break;
    case 'commute_workday':
      baseRate = hub.hourlyRateAzn * 8; // 8 hours standard workday
      break;
    case 'daily_24h':
      baseRate = hub.dailyRateAzn;
      break;
    case 'monthly_subscription':
      baseRate = hub.monthlyRateAzn;
      break;
  }

  // Vehicle type multiplier: Electric vehicles get 25% green discount, motorcycles 50% discount
  if (vehicleType === 'electric_ev') {
    baseRate *= 0.75;
  } else if (vehicleType === 'motorcycle_scooter') {
    baseRate *= 0.50;
  }

  // BakıKart Metro integration concession:
  // If passenger tapped metro entry ticket, parking is discounted by 50% (or free for first 8 hours on commute)
  let concessionDiscount = 0;
  let effectiveDiscountPercent = 0;

  if (bakiKartStatus === 'validated_discount_active') {
    if (duration === 'commute_workday') {
      concessionDiscount = baseRate * 0.60; // 60% P+R government subsidy
      effectiveDiscountPercent = 60;
    } else if (duration === 'hourly_short') {
      concessionDiscount = baseRate * 0.50; // 50% discount
      effectiveDiscountPercent = 50;
    } else if (duration === 'daily_24h') {
      concessionDiscount = baseRate * 0.35; // 35% discount
      effectiveDiscountPercent = 35;
    } else if (duration === 'monthly_subscription') {
      concessionDiscount = baseRate * 0.20; // 20% discount
      effectiveDiscountPercent = 20;
    }
  }

  const metroFare = duration === 'monthly_subscription' 
    ? METRO_BASE_TICKET_FARE_AZN * 40 // ~40 rides/mo
    : METRO_BASE_TICKET_FARE_AZN * 2; // 2 rides (to & from work)

  const finalParkingFee = Math.max(0, baseRate - concessionDiscount);
  const totalCost = Math.round((finalParkingFee + metroFare) * 100) / 100;
  const rate = METRO_CURRENCY_RATES[currency] || 1.0;
  const convertedCost = Math.round(totalCost * rate * 100) / 100;

  return {
    baseParkingFee: Math.round(baseRate * 100) / 100,
    metroFare,
    concessionDiscount: Math.round(concessionDiscount * 100) / 100,
    totalCost,
    effectiveDiscountPercent,
    convertedCost,
  };
}

/**
 * Evaluates the 10-point Intermodal Hub and Subterranean Parking Compliance Checklist.
 */
export function evaluateMetroChecklist(
  items: MetroChecklistItem[],
  checkedMap: Record<string, boolean>,
  isLpgOrCngVehicle: boolean
): {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  violations: string[];
  mandatoryFail: boolean;
} {
  let score = 0;
  let maxScore = 0;
  const violations: string[] = [];
  let mandatoryFail = false;

  for (const item of items) {
    maxScore += item.points;
    const isChecked = Boolean(checkedMap[item.id]);

    // Critical Subterranean Fire Safety rule: LPG/CNG is strictly prohibited underground
    if (item.id === 'subterranean_lpg_prohibition' && isLpgOrCngVehicle) {
      violations.push('QAZBALON (LPG/CNG) QADAĞASI: Nazirlər Kabinetinin Yanğın Təhlükəsizliyi Qaydalarına əsasən yeraltı mərtəbələrə giriş qadağandır!');
      mandatoryFail = true;
      continue;
    }

    if (isChecked) {
      score += item.points;
    } else {
      violations.push(`${item.title}: Tələb təmin edilməyib`);
      if (item.isMandatory) {
        mandatoryFail = true;
      }
    }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = !mandatoryFail && percentage >= 80;

  return {
    score,
    maxScore,
    percentage,
    passed,
    violations,
    mandatoryFail,
  };
}

/**
 * Evaluates 10-Question Baku Metro and Intermodal Transit Theoretical Exam.
 */
export function evaluateMetroExam(
  questions: MetroExamQuestion[],
  answers: Record<string, number>
): {
  correctCount: number;
  totalQuestions: number;
  scorePercentage: number;
  isPassed: boolean;
  detailedResults: Array<{
    id: string;
    question: string;
    selectedOption: number;
    correctOption: number;
    isCorrect: boolean;
    explanation: string;
    citation: string;
  }>;
} {
  let correctCount = 0;
  const detailedResults = questions.map((q) => {
    const selected = answers[q.id];
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) correctCount++;

    return {
      id: q.id,
      question: q.question,
      selectedOption: selected ?? -1,
      correctOption: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
      citation: q.citation,
    };
  });

  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  // Official transit exam requires 80% passing score (8/10)
  const isPassed = correctCount >= 8;

  return {
    correctCount,
    totalQuestions,
    scorePercentage,
    isPassed,
    detailedResults,
  };
}

/**
 * Formats Azerbaijani vehicle license plate strings cleanly.
 */
export function formatMetroPlate(rawPlate: string): string {
  if (!rawPlate) return '10-BM-100';
  const cleaned = rawPlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length >= 7) {
    const region = cleaned.slice(0, 2);
    const series = cleaned.slice(2, 4);
    const digits = cleaned.slice(4, 7);
    return `${region}-${series}-${digits}`;
  }
  return rawPlate.toUpperCase().trim();
}

/**
 * Generates official BAKI-METRO-2026 Electronic Intermodal P+R Boarding & Parking Pass.
 */
export function generateMetroIntermodalPass(params: {
  hub: MetroHub;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleType: IntermodalVehicleType;
  pnrDuration: PnrParkingDuration;
  bakiKartSerial?: string;
  isLpgOrCng?: boolean;
  currency?: Currency;
}): MetroIntermodalPass {
  const {
    hub,
    vehiclePlate,
    vehicleModel,
    vehicleType,
    pnrDuration,
    bakiKartSerial = '994012' + Math.floor(10000000 + Math.random() * 90000000),
    isLpgOrCng = false,
    currency = 'AZN',
  } = params;

  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const passNumber = `BAKI-METRO-2026-${randomDigits}`;

  const now = new Date();
  const issueDate = now.toISOString().slice(0, 10);
  
  const expiryDateObj = new Date(now);
  if (pnrDuration === 'hourly_short') {
    expiryDateObj.setHours(expiryDateObj.getHours() + 4);
  } else if (pnrDuration === 'commute_workday') {
    expiryDateObj.setHours(expiryDateObj.getHours() + 12);
  } else if (pnrDuration === 'daily_24h') {
    expiryDateObj.setDate(expiryDateObj.getDate() + 1);
  } else {
    expiryDateObj.setDate(expiryDateObj.getDate() + 30);
  }
  const expiryDate = expiryDateObj.toISOString().slice(0, 10);

  const costData = calculateMetroPnrCost({
    hub,
    duration: pnrDuration,
    vehicleType,
    bakiKartStatus: 'validated_discount_active',
    currency,
  });

  const bayLetter = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
  const bayNum = Math.floor(10 + Math.random() * 90);
  const bayNumber = `${bayLetter}-${bayNum}`;
  const turnstileGatePin = `${Math.floor(1000 + Math.random() * 9000)}`;

  const simaSignatureUid = `SIMA-AZ-${Math.random().toString(36).substring(2, 10).toUpperCase()}-METRO`;
  const securityChecksum = `SHA256:${Math.random().toString(16).substring(2, 18).toUpperCase()}`;
  const qrCodeData = `https://metro.gov.az/pnr/verify?pass=${passNumber}&hub=${hub.code}&plate=${vehiclePlate}&sig=${simaSignatureUid}`;

  return {
    passNumber,
    issueDate,
    expiryDate,
    hubId: hub.id,
    hubName: hub.name,
    lineId: hub.lineId,
    vehiclePlate: formatMetroPlate(vehiclePlate),
    vehicleModel: vehicleModel || 'Baku Commuter Car',
    vehicleType,
    pnrDuration,
    bayNumber,
    turnstileGatePin,
    baseParkingCost: costData.baseParkingFee,
    metroRoundtripFare: costData.metroFare,
    concessionDiscount: costData.concessionDiscount,
    totalPaid: costData.convertedCost,
    currency,
    bakiKartSerial,
    isLpgCngCompliant: !isLpgOrCng,
    simaSignatureUid,
    securityChecksum,
    qrCodeData,
  };
}

/**
 * Formats currency values in AZN, USD, or EUR.
 */
export function formatMetroCurrency(amount: number, currency: Currency): string {
  const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';
  return `${amount.toFixed(2)} ${symbol}`;
}
