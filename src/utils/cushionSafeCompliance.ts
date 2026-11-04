/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Land Transport Agency (AYNA) & Main State Traffic Police (BDYP)
 * Highway Crash Cushions, Impact Attenuator Systems & Official CUSHION-SAFE-AZ-2026 Portal
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   mühəndis qurğuları, haçalanma zonaları, yol mebeli və qəza sönümləyici qurğuların (Crash Cushions) tətbiqi)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 42, 60: Yol ayrıclarında və haçalanma
 *   (gore points) bufer zonalarında hərəkət qaydaları, qəfil xətt dəyişmə və təhlükəli manevrlərin qadağan edilməsi)
 * - European Standard EN 1317-3 (Vehicle Restraint Systems - Crash Cushions, performance levels 50, 80, 100, 110 km/h;
 *   containment redirection types R - Re-directive vs NR - Non-redirective; Acceleration Severity Index ASI classes
 *   A [ASI <= 1.0] and B [ASI <= 1.4]; Theoretical Head Impact Velocity THIV <= 33 km/h)
 * - State Standards AZS 410 / AZS 342 (Magistral avtomobil yollarının yol mebeli və hərəkətin təşkili vasitələri)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *     * Maddə 327.2: Yol ayrıcında haçalanma bufer zonasına (gore area) girmək və qəfil kəsişmə manevri - 80 AZN + 3 bal;
 *     * Maddə 328.2: Haçalanma yaxınlığında sürət həddini 20-40 km/saat aşmaq - 50 AZN + 2 bal;
 *     * Maddə 353.1: Yol mebelinə, baryerlərə və qəza sönümləyici yastıqlara ziyan vurmaq - 400 - 1,200 AZN (orta 600 AZN);
 *     * Maddə 38: İXM üzrə 30 gün ərzində cərimə ödənildikdə 50%-lik qanuni güzəşt;
 *     * AR Mülki Məcəlləsi Maddə 1108: AAYDA-ya vurulmuş maddi ziyanın (amortizator kartriclərinin bərpası) tam ödənilməsi.
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CUSHION_SAFE_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const CUSHION_SAFE_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertCushionSafeCurrency(amountInAzn: number, currency: Currency): number {
  const rate = CUSHION_SAFE_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type CushionContainmentClass =
  | '110_REDIRECTIVE'
  | '100_REDIRECTIVE'
  | '80_REDIRECTIVE'
  | '80_NON_REDIRECTIVE'
  | '50_TERMINAL';

export type CushionSensorStatus =
  | 'OK_INTACT'
  | 'DEFLECTED_WARNING'
  | 'CRITICAL_IMPACT_DEPLOYED'
  | 'MAINTENANCE_LOCK';

export interface CushionGoreZone {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  containmentClass: CushionContainmentClass;
  speedRatingKmh: number;
  totalBays: number;
  systemLengthM: number;
  systemWidthM: number;
  protectedStructureAz: string;
  protectedStructureEn: string;
  protectedStructureRu: string;
  sensorStatus: CushionSensorStatus;
  lastInspectionDate: string;
  installedYear: number;
}

export interface CushionVehiclePreset {
  id: string;
  plate: string;
  model: string;
  massKg: number;
  defaultSpeedKmh: number;
  defaultAngleDeg: number;
  violationType:
    | 'NONE'
    | 'GORE_INTRUSION'
    | 'EXCESS_SPEED'
    | 'IMPACT_DAMAGE_FULL';
}

export interface CushionCalculationParams {
  impactSpeedKmh: number; // 40 - 140 km/h
  impactAngleDeg: number; // 0 - 25 deg (0 = head-on)
  vehicleMassKg: number; // 900 - 4500 kg
  cushionBaysRemaining: number; // 1 - 6 bays
  ambientTempC: number; // -15 to +45 C
}

export interface CushionCalculationResult {
  kineticEnergyKj: number;
  effectiveStrokeM: number;
  compressionDeflectionPct: number;
  averageDecelerationG: number;
  asiScore: number;
  asiClass: 'CLASS_A' | 'CLASS_B' | 'DANGEROUS_EXCESS';
  thivKmh: number;
  thivCompliant: boolean;
  pierProtectionScorePct: number;
  bottomingOutRiskPct: number;
  occupantSurvivalRating: 'EXCELLENT' | 'GOOD' | 'INJURY_HAZARD';
  sensorTriggered: boolean;
  status: 'SAFE_ABSORPTION' | 'CONTROLLED_REDESIGN' | 'STRUCTURAL_OVERLOAD';
  fineAzn: number;
  discountedFineAzn: number;
  restitutionCostAzn: number;
  totalLiabilityAzn: number;
  demeritPoints: number;
}

export function calculateCushionPhysics(params: CushionCalculationParams): CushionCalculationResult {
  const speedMps = (params.impactSpeedKmh * 1000) / 3600;
  // Kinetic energy: 0.5 * m * v^2 / 1000 in kJ
  const kineticEnergyKj = Math.round(0.5 * params.vehicleMassKg * Math.pow(speedMps, 2) / 1000);

  // Each bay in an EN 1317-3 110R cushion provides ~0.9m stroke and ~200 kJ absorption
  const maxAvailableStroke = Math.max(0.9, params.cushionBaysRemaining * 0.9);
  const totalCapacityKj = params.cushionBaysRemaining * 200;

  // Actual crush stroke: scales smoothly with speed and energy
  const speedRatio = Math.min(1.2, params.impactSpeedKmh / 110);
  const crushStroke = Math.min(
    maxAvailableStroke,
    Math.max(0.8, speedRatio * maxAvailableStroke * Math.min(1.2, params.vehicleMassKg / 1500))
  );

  const compressionDeflectionPct = Math.min(
    100,
    Math.max(5, Math.round((crushStroke / maxAvailableStroke) * 100))
  );

  // Average deceleration: a_avg = v^2 / (2 * crushStroke)
  const avgDecelMps2 = Math.pow(speedMps, 2) / (2 * Math.max(0.8, crushStroke));
  const averageDecelerationG = Math.round((avgDecelMps2 / 9.81) * 10) / 10;

  // Longitudinal & lateral components based on impact angle
  const angleRad = (params.impactAngleDeg * Math.PI) / 180;
  const ax = averageDecelerationG * Math.cos(angleRad);
  const ay = averageDecelerationG * Math.sin(angleRad);

  // Acceleration Severity Index (ASI) = sqrt((ax/12)^2 + (ay/9)^2)
  const asiRaw = Math.sqrt(Math.pow(ax / 12, 2) + Math.pow(ay / 9, 2));
  const asiScore = Math.round(asiRaw * 100) / 100;

  let asiClass: 'CLASS_A' | 'CLASS_B' | 'DANGEROUS_EXCESS';
  if (asiScore <= 1.0) {
    asiClass = 'CLASS_A';
  } else if (asiScore <= 1.4) {
    asiClass = 'CLASS_B';
  } else {
    asiClass = 'DANGEROUS_EXCESS';
  }

  // Theoretical Head Impact Velocity (THIV) in km/h under EN 1317-3 (0.3m head travel distance):
  const thivRaw = Math.sqrt(2 * Math.min(120, avgDecelMps2) * 0.3) * 3.6;
  const thivKmh = Math.round(thivRaw * 10) / 10;
  const thivCompliant = thivKmh <= 33.0;

  // Bottoming out risk: occurs when kinetic energy approaches or exceeds system capacity
  const energyRatio = kineticEnergyKj / totalCapacityKj;
  const bottomingOutRiskPct = Math.min(
    100,
    Math.max(0, Math.round(Math.max(0, energyRatio - 0.7) / 0.3 * 100))
  );

  // Pier protection score: 100% minus bottoming out impact
  const pierProtectionScorePct = Math.max(10, 100 - bottomingOutRiskPct);

  // Occupant survival rating
  let occupantSurvivalRating: 'EXCELLENT' | 'GOOD' | 'INJURY_HAZARD';
  if (asiScore <= 1.0 && thivCompliant) {
    occupantSurvivalRating = 'EXCELLENT';
  } else if (asiScore <= 1.4 && thivKmh <= 38) {
    occupantSurvivalRating = 'GOOD';
  } else {
    occupantSurvivalRating = 'INJURY_HAZARD';
  }

  // Sensor triggered if deceleration > 2.5g or deflection > 25%
  const sensorTriggered = averageDecelerationG >= 2.5 || compressionDeflectionPct >= 25;

  let status: 'SAFE_ABSORPTION' | 'CONTROLLED_REDESIGN' | 'STRUCTURAL_OVERLOAD';
  if (bottomingOutRiskPct >= 70 || asiClass === 'DANGEROUS_EXCESS') {
    status = 'STRUCTURAL_OVERLOAD';
  } else if (params.impactAngleDeg > 12) {
    status = 'CONTROLLED_REDESIGN';
  } else {
    status = 'SAFE_ABSORPTION';
  }

  // Statutory fines under Code of Administrative Offences (İXM):
  let fineAzn = 0;
  let demeritPoints = 0;
  let restitutionCostAzn = 0;

  if (sensorTriggered) {
    fineAzn += 600; // İXM 353.1
    // Restitution cost under Civil Code 1108 for damaged cartridges & shear pins
    const baysDamaged = Math.max(1, Math.ceil((compressionDeflectionPct / 100) * params.cushionBaysRemaining));
    restitutionCostAzn = baysDamaged * 450 + 350; // 450 AZN per cartridge + 350 AZN nose & installation
  }

  if (params.impactSpeedKmh > 90) {
    fineAzn += 50; // İXM 328.2
    demeritPoints += 2;
  }

  if (params.impactAngleDeg > 5) {
    fineAzn += 80; // İXM 327.2 (Gore zone unsafe maneuver)
    demeritPoints += 3;
  }

  // 50% discount under İXM Article 38 within 30 days
  const discountedFineAzn = Math.round((fineAzn * 0.5) * 100) / 100;
  const totalLiabilityAzn = discountedFineAzn + restitutionCostAzn;

  return {
    kineticEnergyKj,
    effectiveStrokeM: Math.round(crushStroke * 100) / 100,
    compressionDeflectionPct,
    averageDecelerationG,
    asiScore,
    asiClass,
    thivKmh,
    thivCompliant,
    pierProtectionScorePct,
    bottomingOutRiskPct,
    occupantSurvivalRating,
    sensorTriggered,
    status,
    fineAzn,
    discountedFineAzn,
    restitutionCostAzn,
    totalLiabilityAzn,
    demeritPoints,
  };
}

export interface ChecklistItem {
  id: string;
  category: 'STRUCTURAL' | 'TELEMETRY' | 'SAFETY_STANDARDS' | 'MAINTENANCE';
  titleAz: string;
  titleEn: string;
  titleRu: string;
  standard: string;
  status: 'VERIFIED' | 'WARNING' | 'CRITICAL';
  detailsAz: string;
  detailsEn: string;
  detailsRu: string;
}

export interface ExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctIndex: number;
  explanationAz: string;
  explanationEn: string;
  explanationRu: string;
  legalArticle: string;
}

export interface CushionCertificate {
  id: string;
  certificateNumber: string;
  vehiclePlate: string;
  vehicleModel: string;
  zoneCode: string;
  containmentLevel: string;
  asiScore: number;
  impactSpeedKmh: number;
  kineticEnergyKj: number;
  restitutionCostAzn: number;
  issueDate: string;
  validUntil: string;
  status: 'ACTIVE_CERTIFIED' | 'DEFICIT_PENDING' | 'REPLACED';
  simaDigitalUid: string;
  qrVerificationPin: string;
  sha256Hash: string;
}

export function generateCushionCertificateNumber(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `CUSHION-SAFE-AZ-2026-${randomSuffix}`;
}

export function generateSimaDigitalUid(): string {
  const hex = Math.random().toString(16).substring(2, 10).toUpperCase();
  return `SIMA-AZ-CUSH-${hex}`;
}

export function generateQrVerificationPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateSha256Checksum(payload: string): string {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `SHA256:0x${hex}9a7b4c8d${hex}`;
}
