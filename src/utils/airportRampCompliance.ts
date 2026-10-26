/**
 * Official State Civil Aviation Agency (DMAA - Dövlət Mülki Aviasiya Agentliyi),
 * Azerbaijan Airlines (AZAL) & Heydar Aliyev International Airport (GYD)
 * Airside Ground Handling & Ramp Vehicle Safety, "Apron Giriş Buraxılışı" (Airside Vehicle Permit - AVP / ADP),
 * ICAO Annex 14 / EASA Ground Standards, Aircraft Stand & Jet Blast Safety Zones,
 * Airside Speed Limits (5–30 km/h), Follow-Me Escort Protocol & Electronic Permit Engine.
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Aviation" ("Aviasiya haqqında" AR Qanunu)
 * - State Civil Aviation Agency (DMAA) under Ministry of Digital Development and Transport (RİNN)
 * - ICAO Annex 14 (Aerodromes - Volume I: Aerodrome Design and Operations)
 * - EASA Ground Handling & Airside Safety Guidelines (AHM 630 / AHM 913)
 * - Heydar Aliyev International Airport (GYD) Apron Safety & Traffic Management Regulations
 * - Code of Administrative Offences (İXM Articles 308.1, 308.2, 308.3 — Airside & Ramp Violations)
 */

import { Currency } from '../types/vehicle';

export type ApronVehicleType =
  | 'pushback_tractor'
  | 'follow_me'
  | 'passenger_shuttle'
  | 'fuel_bowser'
  | 'catering_loader'
  | 'baggage_tug'
  | 'deicing_truck'
  | 'ground_power_unit';

export type ApronSpeedZone =
  | 'era_footprint' // Equipment Restraint Area (Within 5m of aircraft): Max 5 km/h
  | 'stand_taxilane' // Aircraft Stand Taxilane & Baggage Makeup: Max 15 km/h
  | 'service_road'; // Airside Perimeter Service Road & Equipment Parking: Max 30 km/h

export type AirportLocationCode = 'GYD' | 'GNJ' | 'FZL' | 'ZZE';

export interface AirportTerminal {
  id: string;
  code: AirportLocationCode;
  airportName: string;
  terminalName: string;
  standsCount: number;
  jetbridgeCount: number;
  activeAircraftOnStand: number;
  apronCongestionIndex: number; // 0 - 100%
  serviceRoadLimitKmh: number;
  standTaxilaneLimitKmh: number;
  eraLimitKmh: number;
  vhfGroundFreqMhz: string;
  vhfTowerFreqMhz: string;
  status: 'optimal' | 'busy' | 'congested' | 'weather_hold';
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ApronVehiclePreset {
  id: string;
  name: string;
  vehicleType: ApronVehicleType;
  typeLabel: string;
  plateNumber: string;
  operator: string;
  terminalId: string;
  speedKmh: number;
  currentZone: ApronSpeedZone;
  speedGovernorKmh: number;
  yieldedToAircraft: boolean;
  beaconActive: boolean;
  radioActive: boolean;
  sparkArrestorFitted: boolean;
  extinguisherReady: boolean;
  fodFree: boolean;
  towLockEngaged: boolean;
  emergencyKillSwitchReady: boolean;
  hazardDescription: string;
  imageUrl: string;
}

export interface JetBlastCalculation {
  aircraftType: string;
  engineThrustState: 'idle' | 'breakaway' | 'takeoff';
  distanceMeters: number;
  blastWindSpeedKmh: number;
  temperatureCelsius: number;
  isHazardousToVehicles: boolean;
  riskSeverity: 'safe' | 'caution' | 'critical';
  minSafeDistanceMeters: number;
  recommendation: string;
  windForceDescription: string;
}

export interface AirsideSpeedAudit {
  speedKmh: number;
  speedLimitKmh: number;
  isSpeeding: boolean;
  speedDeltaKmh: number;
  zone: ApronSpeedZone;
  zoneLabel: string;
  yieldedToAircraft: boolean;
  beaconActive: boolean;
  radioActive: boolean;
  isCompliant: boolean;
  statutoryFineAzn: number;
  discountedFineAzn: number;
  licenseSuspensionMonths: number;
  infractions: Array<{
    code: string;
    description: string;
    legalRef: string;
    fineAzn: number;
  }>;
  verdict: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'safety' | 'avionics' | 'mechanical' | 'hazard_containment';
  description: string;
  standardRef: string;
  isCritical: boolean;
  passed: boolean;
}

export interface ChecklistScore {
  score: number;
  passed: boolean;
  passCount: number;
  failCount: number;
  criticalFail: boolean;
  penaltyAzn: number;
  rating: string;
}

export interface AirsideDriverExamQuestion {
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

export interface AirportRampPermit {
  permitId: string;
  plateNumber: string;
  vin: string;
  vehicleName: string;
  vehicleType: ApronVehicleType;
  typeLabel: string;
  operatorName: string;
  terminalCode: AirportLocationCode;
  terminalName: string;
  speedGovernorKmh: number;
  complianceScore: number;
  issueDate: string;
  expiryDate: string;
  securityHash: string;
  simaSignatureUid: string;
  inspectorName: string;
  inspectorBadge: string;
  vhfFrequencyMhz: string;
  apronZoneAllowed: string;
}

export interface ApronPlateDetails {
  plateNumber: string;
  prefix: string;
  series: string;
  digits: string;
  isValid: boolean;
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
 * Format apron license plate (e.g., GYD-AP-012, AZAL-RAMP-04, SW-CARGO-88)
 */
export function formatApronPlate(input: string): string {
  if (!input) return '';
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9-]/g, '').trim();
  
  if (cleaned.includes('-')) {
    return cleaned;
  }

  // Attempt auto-hyphenation for common patterns
  if (cleaned.startsWith('GYDAP') && cleaned.length > 5) {
    return `GYD-AP-${cleaned.slice(5)}`;
  }
  if (cleaned.startsWith('AZAL') && cleaned.length > 4) {
    return `AZAL-${cleaned.slice(4)}`;
  }
  if (cleaned.startsWith('SW') && cleaned.length > 2) {
    return `SW-${cleaned.slice(2)}`;
  }
  return cleaned;
}

/**
 * Parse an apron plate to extract prefix, series, and digits
 */
export function parseApronPlate(plate: string): ApronPlateDetails {
  const formatted = formatApronPlate(plate);
  const parts = formatted.split('-');
  
  if (parts.length >= 2) {
    return {
      plateNumber: formatted,
      prefix: parts[0] || '',
      series: parts[1] || '',
      digits: parts.slice(2).join('-') || '',
      isValid: true,
    };
  }

  return {
    plateNumber: formatted,
    prefix: formatted.slice(0, 3),
    series: 'AP',
    digits: formatted.slice(3),
    isValid: formatted.length >= 4,
  };
}

/**
 * Evaluate Airside Speed and Aircraft Priority Compliance
 * In accordance with ICAO Annex 14, EASA AHM 630 & İXM Articles 308.1/308.2
 */
export function evaluateApronSpeedAndPriority(
  vehicleType: ApronVehicleType,
  speedKmh: number,
  zone: ApronSpeedZone,
  yieldedToAircraft: boolean,
  beaconActive: boolean,
  radioActive: boolean
): AirsideSpeedAudit {
  let speedLimitKmh = 30;
  let zoneLabel = 'Perimetr Xidmət Yolu (Maks 30 km/saat)';

  if (zone === 'era_footprint') {
    speedLimitKmh = 5;
    zoneLabel = 'Təyyarə Ətrafı ERA Zonası (5 metr daxilində — Maks 5 km/saat)';
  } else if (zone === 'stand_taxilane') {
    speedLimitKmh = 15;
    zoneLabel = 'Dayanacaq Taxilane və Baqaj Qəbulu (Maks 15 km/saat)';
  }

  const isSpeeding = speedKmh > speedLimitKmh;
  const speedDeltaKmh = Math.max(0, speedKmh - speedLimitKmh);

  const infractions: Array<{
    code: string;
    description: string;
    legalRef: string;
    fineAzn: number;
  }> = [];

  let statutoryFineAzn = 0;
  let licenseSuspensionMonths = 0;

  // 1. Speed Infractions
  if (isSpeeding) {
    if (speedDeltaKmh > 15) {
      const fine = 200;
      statutoryFineAzn += fine;
      licenseSuspensionMonths = 3;
      infractions.push({
        code: 'AIR-SPD-CRIT',
        description: `Apron zonasında təhlükəli sürət həddi aşımı (+${speedDeltaKmh} km/saat). Hava gəmisi toqquşma təhlükəsi.`,
        legalRef: 'İXM Maddə 308.2 & ICAO Əlavə 14 (200 ₼ + 3 ay buraxılışın dayandırılması)',
        fineAzn: fine,
      });
    } else {
      const fine = 80;
      statutoryFineAzn += fine;
      infractions.push({
        code: 'AIR-SPD-MOD',
        description: `Müəyyən edilmiş apron sürət həddinin aşılması (+${speedDeltaKmh} km/saat).`,
        legalRef: 'İXM Maddə 308.1 & DMAA Qaydaları (80 ₼ cərimə)',
        fineAzn: fine,
      });
    }
  }

  // 2. Aircraft Right-of-Way Violation (CRITICAL)
  if (!yieldedToAircraft) {
    const fine = 300;
    statutoryFineAzn += fine;
    licenseSuspensionMonths = Math.max(licenseSuspensionMonths, 6);
    infractions.push({
      code: 'AIR-ROW-VIOL',
      description: 'Hərəkətdə və ya yedəkdə olan təyyarəyə yol verilməməsi (Təyyarənin 100% mütləq üstünlüyü pozulub).',
      legalRef: 'İXM Maddə 308.3 & ICAO Standartı AHM 630 (300 ₼ + 6 ay lisenziya məhrumiyyəti)',
      fineAzn: fine,
    });
  }

  // 3. Flashing Beacon inactive
  if (!beaconActive) {
    const fine = 50;
    statutoryFineAzn += fine;
    infractions.push({
      code: 'AIR-BCN-OFF',
      description: 'Apron xidməti zamanı narıncı fırlanan xəbərdarlıq mayakının söndürülməsi.',
      legalRef: 'ICAO Əlavə 14 Bölmə 9.5 & DMAA Əsasnaməsi (50 ₼)',
      fineAzn: fine,
    });
  }

  // 4. VHF Aeronautical Radio offline
  if (!radioActive) {
    const fine = 70;
    statutoryFineAzn += fine;
    infractions.push({
      code: 'AIR-RAD-OFF',
      description: 'Apron Dispetçer tezliyi (121.7 MHz) ilə ikitərəfli radio rabitəsinin olmaması.',
      legalRef: 'Aviasiya haqqında AR Qanunu Maddə 24 & İXM 308.1 (70 ₼)',
      fineAzn: fine,
    });
  }

  const isCompliant = infractions.length === 0;
  const discountedFineAzn = Math.round(statutoryFineAzn * 0.5 * 100) / 100; // 50% early payment discount within 30 days

  let verdict = 'TAM UYĞUNDUR: Nəqliyyat vasitəsi ICAO Əlavə 14 və GYD Apron Təhlükəsizlik Rejiminə tam cavab verir.';
  if (!isCompliant) {
    if (licenseSuspensionMonths > 0) {
      verdict = `TƏHLÜKƏLİ POZUNTU: Cəmi ${statutoryFineAzn} ₼ cərimə və ${licenseSuspensionMonths} ay müddətinə Apron Sürücülük Buraxılışından (ADP) məhrumetmə sanksiyası tətbiq edilir.`;
    } else {
      verdict = `İNZİBATİ XƏTA: Cəmi ${statutoryFineAzn} ₼ cərimə hesablandı. 30 gün ərzində ödənişdə 50% güzəştlə ${discountedFineAzn} ₼ tətbiq olunur.`;
    }
  }

  return {
    speedKmh,
    speedLimitKmh,
    isSpeeding,
    speedDeltaKmh,
    zone,
    zoneLabel,
    yieldedToAircraft,
    beaconActive,
    radioActive,
    isCompliant,
    statutoryFineAzn,
    discountedFineAzn,
    licenseSuspensionMonths,
    infractions,
    verdict,
  };
}

/**
 * Calculate Jet Blast Wind Force, Temperature & Safety Stand-off Distance
 * Based on aircraft type and turbofan engine state (Idle, Breakaway, Takeoff)
 */
export function calculateJetBlastSafety(
  aircraftType: string,
  engineThrustState: 'idle' | 'breakaway' | 'takeoff',
  distanceMeters: number
): JetBlastCalculation {
  // Base distances and speeds
  let maxBlastSpeedKmh = 120;
  let maxTempC = 70;
  let minSafeDistanceMeters = 30;

  if (aircraftType.includes('777') || aircraftType.includes('A350') || aircraftType.includes('747')) {
    // Widebody heavy jet
    if (engineThrustState === 'idle') {
      maxBlastSpeedKmh = 80;
      maxTempC = 45;
      minSafeDistanceMeters = 30;
    } else if (engineThrustState === 'breakaway') {
      maxBlastSpeedKmh = 160;
      maxTempC = 95;
      minSafeDistanceMeters = 75;
    } else {
      maxBlastSpeedKmh = 230;
      maxTempC = 160;
      minSafeDistanceMeters = 120;
    }
  } else if (aircraftType.includes('A320') || aircraftType.includes('737') || aircraftType.includes('E190')) {
    // Narrowbody medium jet
    if (engineThrustState === 'idle') {
      maxBlastSpeedKmh = 60;
      maxTempC = 40;
      minSafeDistanceMeters = 20;
    } else if (engineThrustState === 'breakaway') {
      maxBlastSpeedKmh = 125;
      maxTempC = 80;
      minSafeDistanceMeters = 50;
    } else {
      maxBlastSpeedKmh = 185;
      maxTempC = 130;
      minSafeDistanceMeters = 85;
    }
  } else {
    // Turboprop or light regional (ATR 72, etc.)
    if (engineThrustState === 'idle') {
      maxBlastSpeedKmh = 40;
      maxTempC = 30;
      minSafeDistanceMeters = 15;
    } else if (engineThrustState === 'breakaway') {
      maxBlastSpeedKmh = 85;
      maxTempC = 55;
      minSafeDistanceMeters = 35;
    } else {
      maxBlastSpeedKmh = 130;
      maxTempC = 85;
      minSafeDistanceMeters = 55;
    }
  }

  // Calculate actual blast speed at given distance using inverse square dispersion
  const safeDistance = Math.max(5, distanceMeters);
  const ratio = Math.min(2.5, minSafeDistanceMeters / safeDistance);
  const blastWindSpeedKmh = Math.round(maxBlastSpeedKmh * Math.min(1.5, Math.pow(ratio, 1.2)));
  const temperatureCelsius = Math.round(Math.max(25, maxTempC * Math.min(1.2, ratio)));

  const isHazardousToVehicles = distanceMeters < minSafeDistanceMeters || blastWindSpeedKmh >= 90;
  
  let riskSeverity: 'safe' | 'caution' | 'critical' = 'safe';
  let recommendation = 'TƏHLÜKƏSİZ MƏSAFƏ: Reaktiv qaz axını və temperatur normal rejimdədir.';
  let windForceDescription = 'Zəif külək axını (< 50 km/saat). Nəqliyyatın hərəkəti təhlükəsizdir.';

  if (distanceMeters < minSafeDistanceMeters * 0.6 || blastWindSpeedKmh >= 130) {
    riskSeverity = 'critical';
    recommendation = `KRİTİK TƏHLÜKƏ! Qaz axınının sürəti (${blastWindSpeedKmh} km/saat) nəqliyyat vasitəsini və baqaj arabalarını aşıra bilər. Dərhal minimum ${minSafeDistanceMeters} metr geriyə çəkilin!`;
    windForceDescription = 'Qasırğa gücündə isti reaktiv axın (> 130 km/saat). Aşma və yanğın riski!';
  } else if (distanceMeters < minSafeDistanceMeters || blastWindSpeedKmh >= 80) {
    riskSeverity = 'caution';
    recommendation = `EHTİYAT ZONASI: Qaz axını hiss olunur (${blastWindSpeedKmh} km/saat). FOD və boş əşyaların uçma təhlükəsi var. Məsafəni artırın.`;
    windForceDescription = 'Güclü qasırğavari axın (80–120 km/saat). Yüngül avadanlıqlar yerindən qopa bilər.';
  }

  return {
    aircraftType,
    engineThrustState,
    distanceMeters,
    blastWindSpeedKmh,
    temperatureCelsius,
    isHazardousToVehicles,
    riskSeverity,
    minSafeDistanceMeters,
    recommendation,
    windForceDescription,
  };
}

/**
 * Score 10-Point Technical Compliance Checklist
 */
export function calculateChecklistScore(items: ChecklistItem[]): ChecklistScore {
  const totalCount = items.length;
  if (totalCount === 0) {
    return {
      score: 100,
      passed: true,
      passCount: 0,
      failCount: 0,
      criticalFail: false,
      penaltyAzn: 0,
      rating: 'İcazə Verildi (100%)',
    };
  }

  const passCount = items.filter((i) => i.passed).length;
  const failCount = totalCount - passCount;
  const criticalFail = items.some((i) => i.isCritical && !i.passed);
  const score = Math.round((passCount / totalCount) * 100);

  let passed = score >= 80 && !criticalFail;
  let penaltyAzn = failCount * 50;
  if (criticalFail) {
    penaltyAzn += 150;
  }

  let rating = 'Əla (100%) - Təsdiqləndi';
  if (criticalFail) {
    rating = 'İCAZƏ VERİLMİR: Kritik Təhlükəsizlik Standartı Pozulub';
    passed = false;
  } else if (score >= 90) {
    rating = 'Yüksək Standart (A+)';
  } else if (score >= 80) {
    rating = 'Kafi Buraxılış (B)';
  } else {
    rating = 'Uğursuz (Standarta Uyğun Deyil)';
    passed = false;
  }

  return {
    score,
    passed,
    passCount,
    failCount,
    criticalFail,
    penaltyAzn,
    rating,
  };
}

/**
 * Evaluate Airside Driver Permit (ADP) Examination
 */
export function calculateExamScore(
  answers: Record<string, number>,
  questions: AirsideDriverExamQuestion[]
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
  const passed = scorePercent >= 80; // 80% passing standard for ICAO ADP

  let grade: 'A' | 'B' | 'C' | 'F' = 'F';
  let feedback = 'Təəssüf ki, imtahandan kəsildiniz. Minimum keçid balı 80%-dir.';

  if (scorePercent === 100) {
    grade = 'A';
    feedback = 'Mükəmməl nəticə! Bütün ICAO Əlavə 14 və GYD Apron qaydalarını 100% dəqiqliklə mənimsəmisiniz.';
  } else if (scorePercent >= 90) {
    grade = 'A';
    feedback = 'Təbriklər! Yüksək nəticə ilə Apron Sürücülük İmtahanından keçdiniz.';
  } else if (scorePercent >= 80) {
    grade = 'B';
    feedback = 'İmtahan müvəffəqiyyətlə başa çatdı. Buraxılış vəsiqəsi təsdiq edildi.';
  } else if (scorePercent >= 60) {
    grade = 'C';
    feedback = 'Qeyri-kafi nəticə. Apron sürət və təyyarəyə yol vermə qaydalarını yenidən təkrarlayın.';
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
 * Generate official DMAA-GYD-2026 Electronic Airside Vehicle Permit ("Apron Giriş Buraxılışı Vərəqəsi")
 */
export function generateAirportRampPermit(params: {
  plateNumber: string;
  vin?: string;
  vehicleName: string;
  vehicleType: ApronVehicleType;
  operatorName: string;
  terminalCode?: AirportLocationCode;
  terminalName?: string;
  speedGovernorKmh?: number;
  complianceScore?: number;
}): AirportRampPermit {
  const formattedPlate = formatApronPlate(params.plateNumber || 'GYD-AP-001');
  const serialNumber = Math.floor(10000 + Math.random() * 90000);
  const permitId = `DMAA-GYD-2026-${serialNumber}`;

  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1-year annual validity
  const expiryDate = expiry.toISOString().split('T')[0];

  const vin = params.vin || `AZ9GYD${serialNumber}AIR2026`;
  const seed = `${formattedPlate}-${vin}-${permitId}`;
  let hashVal = 0;
  for (let i = 0; i < seed.length; i++) {
    hashVal = ((hashVal << 5) - hashVal) + seed.charCodeAt(i);
    hashVal |= 0;
  }
  const securityHash = `SHA256-${Math.abs(hashVal).toString(16).toUpperCase()}${serialNumber}`;
  const simaSignatureUid = `SIMA-AZ-DMAA-${Math.abs(hashVal).toString(36).toUpperCase()}`;

  const typeLabels: Record<ApronVehicleType, string> = {
    pushback_tractor: 'Təyyarə İtələyici Traktor (Pushback)',
    follow_me: 'Follow-Me Bələdçi / Eskort Avtomobili',
    passenger_shuttle: 'Apron Sərnişin Avtobusu (Shuttle)',
    fuel_bowser: 'Təyyarə Yanacaqdolduran Sistern (Jet A-1)',
    catering_loader: 'Hündürlük Qaldırıcılı Keterinq Furqonu',
    baggage_tug: 'Baqaj Və Yük Dartıcı Karvanı',
    deicing_truck: 'Qış Buztəmizləyici Bomlu Xüsusi Texnika',
    ground_power_unit: 'Təyyarə Yerüstü Elektrik Qidalandırıcı (GPU)',
  };

  return {
    permitId,
    plateNumber: formattedPlate,
    vin: vin.toUpperCase(),
    vehicleName: params.vehicleName,
    vehicleType: params.vehicleType,
    typeLabel: typeLabels[params.vehicleType] || 'Apron Xidmət Nəqliyyatı',
    operatorName: params.operatorName || 'AZAL Ground Handling CJSC',
    terminalCode: params.terminalCode || 'GYD',
    terminalName: params.terminalName || 'Heydər Əliyev Beynəlxalq Aeroportu (GYD) - Terminal 1 & 2',
    speedGovernorKmh: params.speedGovernorKmh || 30,
    complianceScore: params.complianceScore || 98,
    issueDate,
    expiryDate,
    securityHash,
    simaSignatureUid,
    inspectorName: 'Mülki Aviasiya Müfəttişi F. Rəhimov',
    inspectorBadge: 'DMAA-AVP-№702',
    vhfFrequencyMhz: '121.700 MHz (Apron Nəzarət)',
    apronZoneAllowed: 'Zonalar A, B, C & Perimetr Xidmət Yolu',
  };
}
