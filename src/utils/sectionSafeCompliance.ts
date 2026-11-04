/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Land Transport Agency (AYNA) & Main State Traffic Police (BDYP)
 * Highway Section Control (Point-to-Point Average Speed Enforcement),
 * High-Speed ANPR Trajectory Telemetry, OIML R 91 Metrology,
 * Shockwave Damping & Official SECTION-SAFE-AZ-2026 Portal
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   avtomatlaşdırılmış nəzarət sistemləri, foto-video qeydiyyat vasitələri və yol infrastrukturunun qorunması)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 50, 60: Hərəkət sürəti hədləri,
 *   təhlükəsiz ara məsafəsi və sürət rejiminə riayət edilməsi məcburiyyəti)
 * - International Organization of Legal Metrology Standard OIML R 91 (Radar equipment for the measurement of the
 *   speed of vehicles - point-to-point and average speed systems)
 * - European Standard EN 16889 (Road transport and traffic telematics - Electronic fee collection and average speed systems)
 * - State Standards AZS 410 / AZS 342 (Yol hərəkəti təhlükəsizliyi qaydaları və foto-radar metroloji kalibrasiyası)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 328):
 *     * 328.1: Müəyyən edilmiş hərəkət sürətini 10-20 km/saat həddində aşma - 20 AZN;
 *     * 328.2: 20-40 km/saat həddində aşma - 50 AZN + 2 cərimə balı;
 *     * 328.3: 40-60 km/saat həddində aşma - 100 AZN + 3 cərimə balı;
 *     * 328.4: 60 km/saatdan artıq həddə aşma - 250 AZN + 4 cərimə balı;
 *     * İXM Maddə 38: Cərimənin qanuni qüvvəyə mindiyi gündən 30 gün ərzində 50%-nin ödənilməsi hüququ.
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const SECTION_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const SECTION_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertSectionCurrency(amountInAzn: number, currency: Currency): number {
  const rate = SECTION_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type VehicleClass =
  | 'PASSENGER_SEDAN'
  | 'SPORT_COUPE'
  | 'HEAVY_COMMERCIAL_TIR'
  | 'RIDESHARE_HYBRID'
  | 'INTERCITY_COACH'
  | 'BDYP_PATROL';

export interface SectionZone {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  entryPicketKm: string;
  exitPicketKm: string;
  distanceKm: number;
  speedLimitKmh: number;
  lanesPerDirection: number;
  anprAccuracyPercent: number;
  gpsNtpOffsetMs: number;
  defaultEntryFlow: number; // veh/h
  defaultTransitMinutes: number;
  alertLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

export interface VehiclePreset {
  id: string;
  plate: string;
  model: string;
  classType: VehicleClass;
  driverCategory: string;
  baselineFuelBurnL100km: number;
  co2GramsKm: number;
  defaultViolation:
    | 'NONE'
    | 'SPEEDING_10_20'
    | 'SPEEDING_20_40'
    | 'SPEEDING_40_60'
    | 'SPEEDING_OVER_60';
}

export interface SectionCalculationParams {
  zoneDistanceKm: number;
  speedLimitKmh: number;
  transitTimeSeconds: number;
  vehicleApproachSpeedKmh?: number;
  trafficDensityVehKm?: number;
  weatherCondition?: 'OPTIMAL' | 'RAIN' | 'FOG' | 'SNOW';
}

export interface SectionCalculationResult {
  rawAverageSpeedKmh: number;
  minLegalTimeSeconds: number;
  timeDeficitSeconds: number;
  toleranceDeductionKmh: number;
  netSpeedKmh: number;
  excessSpeedKmh: number;
  violationTier:
    | 'NONE'
    | 'SPEEDING_10_20'
    | 'SPEEDING_20_40'
    | 'SPEEDING_40_60'
    | 'SPEEDING_OVER_60';
  fineAzn: number;
  penaltyPoints: number;
  discountedFineAzn: number;
  legalArticleAz: string;
  shockwaveDampingRatio: number; // % reduction in shockwave turbulence
  speedUniformityCv: number; // speed coefficient of variation (0.01 - 0.30)
  crashRiskReductionPercent: number; // % reduction in fatal/injury accidents via Elvik power model
  fuelSavedLiters: number;
  co2SavedKg: number;
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'VIOLATION';
}

/**
 * Calculates Point-to-Point Section Control Telemetry, OIML R 91 Tolerances,
 * Speed Fines, Shockwave Damping & Fuel/CO2 Savings.
 */
export function calculateSectionTelemetry(
  params: SectionCalculationParams
): SectionCalculationResult {
  const {
    zoneDistanceKm,
    speedLimitKmh,
    transitTimeSeconds,
    vehicleApproachSpeedKmh = speedLimitKmh,
    trafficDensityVehKm = 24,
    weatherCondition = 'OPTIMAL',
  } = params;

  // Clamped positive transit time
  const safeTimeSec = Math.max(1, transitTimeSeconds);
  const rawAverageSpeedKmh = Math.round(((zoneDistanceKm * 3600) / safeTimeSec) * 10) / 10;

  // Minimum lawful transit time at posted limit
  const minLegalTimeSeconds = Math.round((zoneDistanceKm * 3600) / speedLimitKmh);
  const timeDeficitSeconds = Math.max(0, minLegalTimeSeconds - safeTimeSec);

  // OIML R 91 & AZS 410 Metrological Tolerance Deduction:
  // - 3.0 km/h for raw speed <= 100 km/h
  // - 3% for raw speed > 100 km/h
  let toleranceDeductionKmh = 3.0;
  if (rawAverageSpeedKmh > 100) {
    toleranceDeductionKmh = Math.round(rawAverageSpeedKmh * 0.03 * 10) / 10;
  }

  const netSpeedKmh = Math.max(0, Math.round((rawAverageSpeedKmh - toleranceDeductionKmh) * 10) / 10);
  const excessSpeedKmh = Math.max(0, Math.round((netSpeedKmh - speedLimitKmh) * 10) / 10);

  // Statutory Violations under Azerbaijan Code of Administrative Offences (İXM Maddə 328)
  let violationTier: SectionCalculationResult['violationTier'] = 'NONE';
  let fineAzn = 0;
  let penaltyPoints = 0;
  let legalArticleAz = 'Qanunauyğun (İXM Maddə 328 tətbiq edilmir)';

  if (excessSpeedKmh >= 60) {
    violationTier = 'SPEEDING_OVER_60';
    fineAzn = 250;
    penaltyPoints = 4;
    legalArticleAz = 'İXM Maddə 328.4 (Sürət həddini 60 km/saatdan artıq aşma)';
  } else if (excessSpeedKmh >= 40) {
    violationTier = 'SPEEDING_40_60';
    fineAzn = 100;
    penaltyPoints = 3;
    legalArticleAz = 'İXM Maddə 328.3 (Sürət həddini 40-60 km/saat aralığında aşma)';
  } else if (excessSpeedKmh >= 20) {
    violationTier = 'SPEEDING_20_40';
    fineAzn = 50;
    penaltyPoints = 2;
    legalArticleAz = 'İXM Maddə 328.2 (Sürət həddini 20-40 km/saat aralığında aşma)';
  } else if (excessSpeedKmh >= 10) {
    violationTier = 'SPEEDING_10_20';
    fineAzn = 20;
    penaltyPoints = 0;
    legalArticleAz = 'İXM Maddə 328.1 (Sürət həddini 10-20 km/saat aralığında aşma)';
  }

  // Statutory 50% discount under İXM Article 38 within 30 days
  const discountedFineAzn = fineAzn > 0 ? Math.round(fineAzn * 0.5 * 100) / 100 : 0;

  // Compliance status
  let complianceStatus: SectionCalculationResult['complianceStatus'] = 'COMPLIANT';
  if (excessSpeedKmh >= 10) {
    complianceStatus = 'VIOLATION';
  } else if (excessSpeedKmh > 0) {
    complianceStatus = 'WARNING';
  }

  // Shockwave Damping Ratio:
  // Spot radar causes sudden kangaroo braking (-3.5 m/s²), while section control induces uniform pace.
  // We model damping ratio as a function of speed difference and traffic density.
  const speedDiff = Math.abs(vehicleApproachSpeedKmh - netSpeedKmh);
  const dampingBase = 72 - (speedDiff * 0.4) + (trafficDensityVehKm * 0.2);
  const shockwaveDampingRatio = Math.max(15, Math.min(95, Math.round(dampingBase)));

  // Speed Uniformity (Coefficient of Variation CV = sigma / mu):
  // Section control typically achieves CV between 0.04 and 0.08, whereas spot radars have CV ~ 0.20-0.25.
  let speedUniformityCv = 0.05 + (excessSpeedKmh * 0.003);
  if (weatherCondition === 'RAIN') speedUniformityCv += 0.02;
  if (weatherCondition === 'FOG' || weatherCondition === 'SNOW') speedUniformityCv += 0.04;
  speedUniformityCv = Math.min(0.28, Math.round(speedUniformityCv * 100) / 100);

  // Crash Risk Reduction Percent (Elvik Power Model for average speeds):
  // Fatal crash reduction ~ 1 - (v_compliant / v_violating)^4
  let crashRiskReductionPercent = 46.5;
  if (excessSpeedKmh > 0) {
    const ratio = speedLimitKmh / Math.max(speedLimitKmh, netSpeedKmh);
    const elvikDrop = (1 - Math.pow(ratio, 3.5)) * 100;
    crashRiskReductionPercent = Math.max(5, Math.round((46.5 - elvikDrop) * 10) / 10);
  }

  // Fuel Saved & CO2 Mitigated via Eliminating Stop-and-Go Acceleration:
  // Smooth section cruising saves ~1.1 L / 100km on average
  const fuelFactorPer100Km = excessSpeedKmh > 20 ? 0.4 : 1.15;
  const fuelSavedLiters = Math.round(((zoneDistanceKm / 100) * fuelFactorPer100Km) * 100) / 100;
  // 1 liter of gasoline ~ 2.31 kg CO2
  const co2SavedKg = Math.round(fuelSavedLiters * 2.31 * 100) / 100;

  return {
    rawAverageSpeedKmh,
    minLegalTimeSeconds,
    timeDeficitSeconds,
    toleranceDeductionKmh,
    netSpeedKmh,
    excessSpeedKmh,
    violationTier,
    fineAzn,
    penaltyPoints,
    discountedFineAzn,
    legalArticleAz,
    shockwaveDampingRatio,
    speedUniformityCv,
    crashRiskReductionPercent,
    fuelSavedLiters,
    co2SavedKg,
    complianceStatus,
  };
}

export interface TechnicalChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  standard: string;
  category: 'OPTICAL_ANPR' | 'NTP_METROLOGY' | 'SCADA_INTEGRITY' | 'LEGAL_DISCOUNT';
  mandatory: boolean;
  descriptionAz: string;
}

export interface TheoreticalExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctAnswer: number;
  explanationAz: string;
  legalCitation: string;
}

export interface SectionCertificate {
  id: string;
  certificateCode: string;
  vehiclePlate: string;
  vehicleModel: string;
  corridorCode: string;
  zoneNameAz: string;
  distanceKm: number;
  speedLimitKmh: number;
  transitTimeSeconds: number;
  rawSpeedKmh: number;
  netSpeedKmh: number;
  fineAzn: number;
  status: 'CLEARED' | 'CITATION_ISSUED';
  issueDate: string;
  validUntil: string;
  simaSignatureUid: string;
  barrierPassPin: string;
  sha256Checksum: string;
}

/**
 * Evaluates the 10-point Section Control technical checklist.
 */
export function evaluateSectionChecklist(
  checkedIds: string[],
  items: TechnicalChecklistItem[]
): {
  scorePercent: number;
  passed: boolean;
  allMandatoryChecked: boolean;
  checkedCount: number;
  totalCount: number;
} {
  const totalCount = items.length;
  const checkedCount = checkedIds.length;
  const scorePercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const mandatoryItems = items.filter((item) => item.mandatory);
  const allMandatoryChecked = mandatoryItems.every((item) => checkedIds.includes(item.id));
  const passed = scorePercent >= 80 && allMandatoryChecked;

  return {
    scorePercent,
    passed,
    allMandatoryChecked,
    checkedCount,
    totalCount,
  };
}

/**
 * Grades the 10-question Section Control theoretical exam.
 */
export function gradeSectionExam(
  answers: Record<string, number>,
  questions: TheoreticalExamQuestion[]
): {
  score: number;
  total: number;
  passed: boolean;
  percentage: number;
} {
  const total = questions.length;
  let score = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      score += 1;
    }
  });

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 70; // 7 out of 10 to pass

  return {
    score,
    total,
    passed,
    percentage,
  };
}

/**
 * Generates an official SECTION-SAFE-AZ-2026 electronic certificate.
 */
export function generateSectionCertificate(data: {
  vehiclePlate: string;
  vehicleModel: string;
  corridorCode: string;
  zoneNameAz: string;
  distanceKm: number;
  speedLimitKmh: number;
  transitTimeSeconds: number;
  rawSpeedKmh: number;
  netSpeedKmh: number;
  fineAzn: number;
  status: 'CLEARED' | 'CITATION_ISSUED';
}): SectionCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateCode = `SEC-SAFE-AZ-2026-${randomSuffix}`;
  const now = new Date();
  const issueDate = now.toISOString().replace('T', ' ').substring(0, 19);

  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day validity
  const validUntil = future.toISOString().replace('T', ' ').substring(0, 19);

  const simaSignatureUid = `SIMA-GOV-AZ-${Math.random().toString(36).substring(2, 10).toUpperCase()}-SCADA`;
  const barrierPassPin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Deterministic-like SHA-256 mock hash
  const rawHashPayload = `${certificateCode}:${data.vehiclePlate}:${data.corridorCode}:${data.netSpeedKmh}:${issueDate}`;
  let hashVal = 0;
  for (let i = 0; i < rawHashPayload.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHashPayload.charCodeAt(i);
    hashVal |= 0;
  }
  const hexPart = Math.abs(hashVal).toString(16).padStart(8, '0');
  const sha256Checksum = `e59a${hexPart}8f21bc90a7d4320984f1bce8${hexPart}`;

  return {
    id: `cert-${Date.now()}-${randomSuffix}`,
    certificateCode,
    vehiclePlate: data.vehiclePlate,
    vehicleModel: data.vehicleModel,
    corridorCode: data.corridorCode,
    zoneNameAz: data.zoneNameAz,
    distanceKm: data.distanceKm,
    speedLimitKmh: data.speedLimitKmh,
    transitTimeSeconds: data.transitTimeSeconds,
    rawSpeedKmh: data.rawSpeedKmh,
    netSpeedKmh: data.netSpeedKmh,
    fineAzn: data.fineAzn,
    status: data.status,
    issueDate,
    validUntil,
    simaSignatureUid,
    barrierPassPin,
    sha256Checksum,
  };
}
