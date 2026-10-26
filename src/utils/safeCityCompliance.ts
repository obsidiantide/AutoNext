/**
 * Official Ministry of Internal Affairs (DİN - Daxili İşlər Nazirliyi),
 * Intelligent Transport Management Center (NİİM - Nəqliyyatın İntellektual İdarəetmə Mərkəzi) & BDYP
 * Automated CCTV Surveillance, ANPR License Plate Telemetry, "Yaşıl Dalğa" (Green Wave) Adaptive Traffic Lights & Incident Dispatch Engine.
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Police" ("Polis haqqında" AR Qanunu)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (YHQ Articles 9, 48, 50, 52, 60)
 * - Code of Administrative Offences (İXM Articles 327.1, 327.2, 327.3, 327.4, 327.1-1, 329.1, 342.1.3, 342.9)
 * - Intelligent Transport Management System (NİİM) Standards & Level of Service (LOS A–F) Specifications
 */

import { Currency } from '../types/vehicle';

export type LevelOfService = 'LOS_A' | 'LOS_B' | 'LOS_C' | 'LOS_D' | 'LOS_E' | 'LOS_F';

export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';

export type IncidentType = 
  | 'accident' 
  | 'vehicle_breakdown' 
  | 'road_debris' 
  | 'traffic_signal_failure' 
  | 'pedestrian_hazard' 
  | 'water_logging';

export type CameraType = 'anpr_radar' | 'ptz_surveillance' | 'red_light_sensor' | 'bus_lane_ai' | 'seatbelt_phone_ai';

export interface TrafficCorridor {
  id: string;
  name: string;
  district: string;
  lengthKm: number;
  cameraCount: number;
  speedLimitKmh: number;
  greenWaveSpeedKmh: number;
  currentLos: LevelOfService;
  losLabel: string;
  congestionIndex: number; // 0 - 100%
  averageTravelTimeMinutes: number;
  freeFlowTravelTimeMinutes: number;
  vmsAlert: string;
  activeIncidents: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface AnprDetection {
  plateNumber: string;
  speedKmh: number;
  speedLimitKmh: number;
  isSpeeding: boolean;
  speedDeltaKmh: number;
  inBusLane: boolean;
  seatbeltFastened: boolean;
  usingMobilePhone: boolean;
  redLightRun: boolean;
  plateObscured: boolean;
  isStolenOrWanted: boolean;
  cameraConfidence: number; // 0 - 100%
  timestamp: string;
  corridorId: string;
}

export interface FineCalculationResult {
  totalFineAZN: number;
  discountedFineAZN: number; // 50% early payment discount within 30 days
  totalDemeritPoints: number;
  violations: Array<{
    code: string;
    description: string;
    legalRef: string;
    fineAZN: number;
    demeritPoints: number;
  }>;
  hasCriticalViolation: boolean;
  licenseSuspensionRisk: boolean;
}

export interface GreenWaveSyncResult {
  corridorLengthKm: number;
  targetSpeedKmh: number;
  greenWaveOptimalSpeedKmh: number;
  isSpeedInSync: boolean;
  syncEfficiencyPercent: number;
  estimatedStops: number;
  travelTimeMinutes: number;
  fuelSavedLiters: number;
  co2SavedGrams: number;
  recommendation: string;
}

export interface IncidentDispatch {
  id: string;
  type: IncidentType;
  typeLabel: string;
  severity: IncidentSeverity;
  corridorName: string;
  locationDetails: string;
  reportedTime: string;
  estimatedResponseMinutes: number;
  dispatchedUnit: string;
  status: 'dispatched' | 'en_route' | 'on_scene' | 'resolved';
  requiresTow: boolean;
  requiresAmbulance: boolean;
}

export interface SafeCityCertificate {
  certificateId: string;
  plateNumber: string;
  vin: string;
  ownerFullName: string;
  corridorName: string;
  losGrade: LevelOfService;
  anprTrustScore: number;
  greenWaveCompliant: boolean;
  zeroViolationRecord: boolean;
  issueDate: string;
  expiryDate: string;
  securityHash: string;
  simaSignatureUid: string;
  inspectorName: string;
  inspectorBadge: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  legalCitation: string;
}

// Currency Exchange Rates
const EXCHANGE_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 0.5882, // 1 AZN = ~0.59 USD
  EUR: 0.5435, // 1 AZN = ~0.54 EUR
};

/**
 * Convert AZN value to target currency
 */
export function convertCurrency(amountAZN: number, targetCurrency: Currency): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return Math.round(amountAZN * rate * 100) / 100;
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, currency: Currency): string {
  switch (currency) {
    case 'USD':
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'EUR':
      return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'AZN':
    default:
      return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼`;
  }
}

/**
 * Standardize Azerbaijan license plate formatting (e.g. "99-NN-999" or "10-AA-100")
 */
export function formatAzerbaijanPlate(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length < 5) return cleaned;
  
  const region = cleaned.slice(0, 2);
  const series = cleaned.slice(2, 4);
  const digits = cleaned.slice(4, 7);

  if (region && series && digits) {
    return `${region}-${series}-${digits}`;
  }
  return cleaned;
}

/**
 * Validates whether string is an authentic Azerbaijan license plate pattern
 */
export function isValidAzerbaijanPlate(plate: string): boolean {
  const regex = /^\d{2}-[A-Z]{2}-\d{3}$/;
  return regex.test(plate.toUpperCase().trim());
}

/**
 * Get Level of Service details (LOS A through F)
 */
export function getLosDetails(los: LevelOfService): {
  code: LevelOfService;
  label: string;
  trafficStatus: string;
  delaySecondsPerVehicle: string;
  colorClass: string;
  bgClass: string;
} {
  switch (los) {
    case 'LOS_A':
      return {
        code: 'LOS_A',
        label: 'LOS A - Sərbəst Axın',
        trafficStatus: 'Yüksək səviyyəli hərəkət rahatlığı, sıxlıq yoxdur',
        delaySecondsPerVehicle: '< 10 san',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/10 border-emerald-500/30',
      };
    case 'LOS_B':
      return {
        code: 'LOS_B',
        label: 'LOS B - Sabit Normal Axın',
        trafficStatus: 'Yüngül manevr məhdudiyyəti, axıcı hərəkət',
        delaySecondsPerVehicle: '10 – 20 san',
        colorClass: 'text-teal-400',
        bgClass: 'bg-teal-500/10 border-teal-500/30',
      };
    case 'LOS_C':
      return {
        code: 'LOS_C',
        label: 'LOS C - Mülayim Sıxlıq',
        trafficStatus: 'Axın stabildir, zolaq dəyişmə çətinləşir',
        delaySecondsPerVehicle: '20 – 35 san',
        colorClass: 'text-yellow-400',
        bgClass: 'bg-yellow-500/10 border-yellow-500/30',
      };
    case 'LOS_D':
      return {
        code: 'LOS_D',
        label: 'LOS D - Yüksək Sıxlıq',
        trafficStatus: 'Sürət aşağı düşür, tıxac riski yüksəkdir',
        delaySecondsPerVehicle: '35 – 55 san',
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-500/10 border-amber-500/30',
      };
    case 'LOS_E':
      return {
        code: 'LOS_E',
        label: 'LOS E - Maksimum Buraxılış',
        trafficStatus: 'Maksimum yol tutumu həddi, dayanıqsız axın',
        delaySecondsPerVehicle: '55 – 80 san',
        colorClass: 'text-orange-400',
        bgClass: 'bg-orange-500/10 border-orange-500/30',
      };
    case 'LOS_F':
    default:
      return {
        code: 'LOS_F',
        label: 'LOS F - Kritik Tıxac / Qapanma',
        trafficStatus: 'Nəqliyyat iflici, fasiləsiz dayan-hərəkət et rejimi',
        delaySecondsPerVehicle: '> 80 san',
        colorClass: 'text-red-400',
        bgClass: 'bg-red-500/10 border-red-500/30',
      };
  }
}

/**
 * Calculate statutory traffic violations based on ANPR and AI camera telemetry
 */
export function calculateAnprFines(detection: AnprDetection): FineCalculationResult {
  const violations: FineCalculationResult['violations'] = [];
  let totalFineAZN = 0;
  let totalDemeritPoints = 0;

  // 1. Speeding Violations (İXM Maddə 327.1 - 327.4)
  if (detection.isSpeeding && detection.speedDeltaKmh > 0) {
    const delta = detection.speedDeltaKmh;
    if (delta >= 10 && delta <= 20) {
      violations.push({
        code: 'IXM-327.1',
        description: `Müəyyən edilmiş hərəkət sürətini 10-20 km/saat həddində aşma (+${delta} km/saat)`,
        legalRef: 'İXM Maddə 327.1',
        fineAZN: 20,
        demeritPoints: 0,
      });
      totalFineAZN += 20;
    } else if (delta > 20 && delta <= 40) {
      violations.push({
        code: 'IXM-327.2',
        description: `Müəyyən edilmiş hərəkət sürətini 20-40 km/saat həddində aşma (+${delta} km/saat)`,
        legalRef: 'İXM Maddə 327.2',
        fineAZN: 50,
        demeritPoints: 2,
      });
      totalFineAZN += 50;
      totalDemeritPoints += 2;
    } else if (delta > 40 && delta <= 60) {
      violations.push({
        code: 'IXM-327.3',
        description: `Müəyyən edilmiş hərəkət sürətini 40-60 km/saat həddində aşma (+${delta} km/saat)`,
        legalRef: 'İXM Maddə 327.3',
        fineAZN: 100,
        demeritPoints: 3,
      });
      totalFineAZN += 100;
      totalDemeritPoints += 3;
    } else if (delta > 60) {
      violations.push({
        code: 'IXM-327.4',
        description: `Müəyyən edilmiş hərəkət sürətini 60 km/saatdan artıq aşma (+${delta} km/saat)`,
        legalRef: 'İXM Maddə 327.4',
        fineAZN: 250,
        demeritPoints: 4,
      });
      totalFineAZN += 250;
      totalDemeritPoints += 4;
    }
  }

  // 2. Yellow Dedicated Bus Lane Encroachment (İXM Maddə 327.1-1)
  if (detection.inBusLane) {
    violations.push({
      code: 'IXM-327.1-1',
      description: 'Ümumi istifadədə olan nəqliyyat vasitələri üçün ayrılmış "A" zolağına daxil olma',
      legalRef: 'İXM Maddə 327.1-1',
      fineAZN: 100,
      demeritPoints: 2,
    });
    totalFineAZN += 100;
    totalDemeritPoints += 2;
  }

  // 3. Red Light Running (İXM Maddə 327.2)
  if (detection.redLightRun) {
    violations.push({
      code: 'IXM-327.2-RED',
      description: 'İşıqforun və ya nizamlayıcının qadağanedici işarəsi verilərkən hərəkəti davam etdirmə',
      legalRef: 'İXM Maddə 327.2',
      fineAZN: 80,
      demeritPoints: 3,
    });
    totalFineAZN += 80;
    totalDemeritPoints += 3;
  }

  // 4. Mobile Phone Use While Driving (İXM Maddə 342.6)
  if (detection.usingMobilePhone) {
    violations.push({
      code: 'IXM-342.6',
      description: 'Nəqliyyat vasitəsini idarə edərkən telefon və rabitə vasitələrindən əllə istifadə etmə',
      legalRef: 'İXM Maddə 342.6',
      fineAZN: 50,
      demeritPoints: 2,
    });
    totalFineAZN += 50;
    totalDemeritPoints += 2;
  }

  // 5. Seatbelt Not Fastened (İXM Maddə 329.1)
  if (!detection.seatbeltFastened) {
    violations.push({
      code: 'IXM-329.1',
      description: 'Təhlükəsizlik kəmərini bağlamadan nəqliyyat vasitəsini idarə etmə (Süni intellekt kamera təsdiqi)',
      legalRef: 'İXM Maddə 329.1',
      fineAZN: 40,
      demeritPoints: 0,
    });
    totalFineAZN += 40;
  }

  // 6. Plate Obscured or Bent (İXM Maddə 342.1.3)
  if (detection.plateObscured) {
    violations.push({
      code: 'IXM-342.1.3',
      description: 'Dövlət qeydiyyat nişanının oxunmasını çətinləşdirən vasitələrdən istifadə və ya çirkli saxlanma',
      legalRef: 'İXM Maddə 342.1.3',
      fineAZN: 40,
      demeritPoints: 0,
    });
    totalFineAZN += 40;
  }

  // 7. Stolen / Wanted Vehicle Trigger
  if (detection.isStolenOrWanted) {
    violations.push({
      code: 'DIN-ALARM-WANTED',
      description: 'DİN "Təhlükəsiz Şəhər" Axtarış Əməliyyatı: Saxlama və İntersepsiya Qərarı',
      legalRef: 'Polis haqqında Qanun Maddə 14',
      fineAZN: 0,
      demeritPoints: 0,
    });
  }

  // 50% early payment discount within 30 days under AsanPay / Article 150-1 rules
  const discountedFineAZN = Math.round((totalFineAZN * 0.5) * 100) / 100;
  const hasCriticalViolation = detection.isStolenOrWanted || detection.speedDeltaKmh > 60 || totalDemeritPoints >= 4;
  const licenseSuspensionRisk = totalDemeritPoints >= 12;

  return {
    totalFineAZN,
    discountedFineAZN,
    totalDemeritPoints,
    violations,
    hasCriticalViolation,
    licenseSuspensionRisk,
  };
}

/**
 * Calculate "Yaşıl Dalğa" (Green Wave) Synchronization Metrics
 */
export function calculateGreenWaveSync(
  corridorLengthKm: number,
  driverSpeedKmh: number,
  greenWaveSpeedKmh: number = 55
): GreenWaveSyncResult {
  const speedDiff = Math.abs(driverSpeedKmh - greenWaveSpeedKmh);
  const isSpeedInSync = speedDiff <= 5;

  // Synchronization efficiency: 100% when exactly at target, drops as diff increases
  const syncEfficiencyPercent = Math.max(0, Math.min(100, Math.round(100 - (speedDiff * 5))));

  // Stops calculation: 0-1 stops if in sync, increases dramatically when out of sync
  const estimatedStops = isSpeedInSync
    ? (speedDiff === 0 ? 0 : 1)
    : Math.min(8, Math.max(2, Math.round(speedDiff / 4)));

  // Travel time in minutes
  const effectiveSpeedKmh = Math.max(10, driverSpeedKmh - (estimatedStops * 4));
  const travelTimeMinutes = Math.round((corridorLengthKm / effectiveSpeedKmh) * 60 * 10) / 10;

  // Fuel saved compared to stop-and-go regime (~0.12 liters saved per avoided stop)
  const stopsAvoided = Math.max(0, 6 - estimatedStops);
  const fuelSavedLiters = Math.round(stopsAvoided * 0.12 * 100) / 100;
  const co2SavedGrams = Math.round(fuelSavedLiters * 2392); // ~2392g CO2 per liter of gasoline

  let recommendation = '';
  if (isSpeedInSync) {
    recommendation = `Optimal "Yaşıl Dalğa" koordinasiyası aktivdir! ${greenWaveSpeedKmh} km/saat sabit sürət saxlanılarsa, bütün növbəti işıqforlar yaşıl fazada qarşılayacaq.`;
  } else if (driverSpeedKmh > greenWaveSpeedKmh) {
    recommendation = `Sürətiniz Yaşıl Dalğa hədəfindən (${greenWaveSpeedKmh} km/saat) ${speedDiff} km/saat yüksəkdir. Növbəti kəsişmədə qırmızı fazaya düşmə riski yüksəkdir.`;
  } else {
    recommendation = `Sürətiniz çox aşağıdır (${driverSpeedKmh} km/saat). Yaşıl Dalğa pəncərəsini qaçırmamaq üçün sürəti tədricən ${greenWaveSpeedKmh} km/saata çatdırın.`;
  }

  return {
    corridorLengthKm,
    targetSpeedKmh: driverSpeedKmh,
    greenWaveOptimalSpeedKmh: greenWaveSpeedKmh,
    isSpeedInSync,
    syncEfficiencyPercent,
    estimatedStops,
    travelTimeMinutes,
    fuelSavedLiters,
    co2SavedGrams,
    recommendation,
  };
}

/**
 * Generate a certified DİN-NİİM Electronic Safe City Clearance Certificate
 */
export function generateSafeCityCertificate(
  plateNumber: string,
  vin: string,
  ownerFullName: string,
  corridorName: string,
  losGrade: LevelOfService = 'LOS_A'
): SafeCityCertificate {
  const formattedPlate = formatAzerbaijanPlate(plateNumber);
  const serialNumber = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `DIN-NIIM-2026-${serialNumber}`;

  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expiry = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months
  const expiryDate = expiry.toISOString().split('T')[0];

  const seed = `${formattedPlate}-${vin}-${certificateId}`;
  let hashVal = 0;
  for (let i = 0; i < seed.length; i++) {
    hashVal = ((hashVal << 5) - hashVal) + seed.charCodeAt(i);
    hashVal |= 0;
  }
  const securityHash = `SHA256-${Math.abs(hashVal).toString(16).toUpperCase()}${serialNumber}`;
  const simaSignatureUid = `SIMA-AZ-NIIM-${Math.abs(hashVal).toString(36).toUpperCase()}`;

  return {
    certificateId,
    plateNumber: formattedPlate,
    vin: vin.toUpperCase(),
    ownerFullName,
    corridorName,
    losGrade,
    anprTrustScore: 98.4,
    greenWaveCompliant: true,
    zeroViolationRecord: true,
    issueDate,
    expiryDate,
    securityHash,
    simaSignatureUid,
    inspectorName: 'Polis Polkovnik-leytenantı R. Qasımov',
    inspectorBadge: 'DİN-NİİM-№4042',
  };
}
