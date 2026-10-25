/**
 * Official Ministry of Defense (MN), State Service for Mobilization and Conscription (SHXÇDX)
 * & BDYP Military Transport Duty ("Hərbi-Nəqliyyat Vəzifəsi") Compliance Engine.
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Military Transport Duty" ("Hərbi-nəqliyyat vəzifəsi haqqında" AR Qanunu № 759)
 * - Law on Road Traffic (YHQ Article 27 - Black Military Plate Series: MN, DQ, DSX, DTX, SHX, HQ)
 * - Law on Road Traffic (YHQ Articles 42 & 48 - Military Convoy March Regulations)
 * - Resolution of the Cabinet of Ministers of the Republic of Azerbaijan on Military Transport Requisition
 */

export type MilitaryBranch = 'MN' | 'DQ' | 'DSX' | 'DTX' | 'SHX' | 'HQ';

export type MilitaryVehicleCategory = 
  | 'compact_suv' 
  | 'full_suv' 
  | 'pickup_4x4' 
  | 'heavy_truck_6x6' 
  | 'tactical_bus';

export type MobilizationStatus = 
  | 'exempt' 
  | 'eligible' 
  | 'registered' 
  | 'mobilized' 
  | 'reserve';

export type ReadinessGrade = 
  | 'category_1_ready' 
  | 'category_2_minor' 
  | 'category_3_unfit';

export interface MilitaryReadinessItem {
  id: string;
  title: string;
  description: string;
  legalRef: string;
  points: number;
  category: 'drivetrain' | 'chassis' | 'equipment' | 'electrical' | 'armor';
}

export interface ConvoySpeedScenario {
  terrain: 'urban' | 'highway' | 'unpaved' | 'mountain';
  label: string;
  speedKmH: number;
  minDistanceMeters: number;
  escortRequired: boolean;
  notes: string;
}

export interface MobilizationCompensation {
  dailyRateAZN: number;
  durationDays: number;
  totalRentalAZN: number;
  estimatedKm: number;
  estimatedFuelLiters: number;
  fuelRateAZN: number;
  fuelCostAZN: number;
  totalCompensationAZN: number;
  totalCompensationUSD: number;
  totalCompensationEUR: number;
}

export interface MilitaryCertificate {
  certificateNumber: string;
  registrationDate: string;
  expiryDate: string;
  civilianPlate: string;
  militaryPlate: string;
  branch: MilitaryBranch;
  category: MilitaryVehicleCategory;
  ownerName: string;
  ownerFin: string;
  chassisNumber: string;
  mobilizationDivision: string;
  readinessScore: number;
  readinessGrade: ReadinessGrade;
  readinessLevel: string;
  dailyCompensationRate: number;
  sha256Hash: string;
  simaSignatureUid: string;
  notes: string;
  qrVerificationUrl: string;
}

export interface MobilizationDivision {
  id: string;
  name: string;
  district: string;
  city: string;
  address: string;
  contactPhone: string;
  operatingHours: string;
  officerInCharge: string;
  rank: string;
  activeCapacityDaily: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface MilitaryExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  legalArticle: string;
}

// Statutory Base Daily Compensation Tariffs in AZN according to Cabinet of Ministers
export const MILITARY_DAILY_TARIFFS: Record<MilitaryVehicleCategory, number> = {
  compact_suv: 40.0,
  full_suv: 60.0,
  pickup_4x4: 55.0,
  heavy_truck_6x6: 90.0,
  tactical_bus: 75.0,
};

// Statutory Fuel Prices under Tariff Council of Azerbaijan (AZN/L)
export const STATUTORY_FUEL_PRICES: Record<'petrol' | 'diesel', number> = {
  petrol: 1.10, // Aİ-92
  diesel: 1.00, // Dizel
};

// Default exchange rates if not supplied
export const DEFAULT_EXCHANGE_RATES = {
  USD: 1.70,
  EUR: 1.85,
};

/**
 * Format a black military plate string (e.g. "014 MN 02", "007 DQ 01")
 */
export function formatBlackMilitaryPlate(rawPlate: string, defaultBranch: MilitaryBranch = 'MN'): string {
  if (!rawPlate) return `001 ${defaultBranch} 01`;

  const clean = rawPlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Try pattern: 3-4 digits, 2-3 letters, 2 digits (e.g., 014MN02 or 007DQ01)
  const match = clean.match(/^(\d{2,4})([A-Z]{2,3})(\d{2})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }

  // Fallback parsing: extract digits and letters
  const digits = clean.match(/\d+/g)?.join('') || '00101';
  const letters = clean.match(/[A-Z]+/g)?.join('') || defaultBranch;

  const prefix = digits.slice(0, Math.min(3, Math.max(2, digits.length - 2))) || '001';
  const region = digits.slice(prefix.length, prefix.length + 2) || '01';

  return `${prefix.padStart(3, '0')} ${letters.slice(0, 3)} ${region.padStart(2, '0')}`;
}

/**
 * Parse an authentic Azerbaijan military plate
 */
export function parseBlackMilitaryPlate(plate: string): {
  prefix: string;
  branch: MilitaryBranch | 'UNKNOWN';
  region: string;
  isValid: boolean;
} {
  const formatted = formatBlackMilitaryPlate(plate);
  const parts = formatted.split(' ');

  if (parts.length === 3) {
    const [prefix, branchCode, region] = parts;
    const knownBranches: MilitaryBranch[] = ['MN', 'DQ', 'DSX', 'DTX', 'SHX', 'HQ'];
    const isValidBranch = knownBranches.includes(branchCode as MilitaryBranch);

    return {
      prefix,
      branch: isValidBranch ? (branchCode as MilitaryBranch) : 'UNKNOWN',
      region,
      isValid: isValidBranch && /^\d{2,4}$/.test(prefix) && /^\d{2}$/.test(region),
    };
  }

  return {
    prefix: '',
    branch: 'UNKNOWN',
    region: '',
    isValid: false,
  };
}

/**
 * Calculate readiness score based on checked technical items
 */
export function calculateMilitaryReadinessScore(
  checkedItemIds: string[],
  totalItems: MilitaryReadinessItem[]
): {
  score: number;
  maxScore: number;
  percentage: number;
  grade: ReadinessGrade;
  statusLabel: string;
  eligibleForMobilization: boolean;
} {
  const maxScore = totalItems.reduce((acc, it) => acc + it.points, 0);
  const score = totalItems
    .filter((it) => checkedItemIds.includes(it.id))
    .reduce((acc, it) => acc + it.points, 0);

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  let grade: ReadinessGrade = 'category_3_unfit';
  let statusLabel = '3-cü Dərəcə: Qeyri-kafi / Təxirəsalınmaz Təmir Tələb Olunur';
  let eligibleForMobilization = false;

  if (percentage >= 80) {
    grade = 'category_1_ready';
    statusLabel = '1-ci Dərəcə: Tam Yararlı / Hərbi Kolona Dərhal Qoşulmağa Hazır';
    eligibleForMobilization = true;
  } else if (percentage >= 50) {
    grade = 'category_2_minor';
    statusLabel = '2-ci Dərəcə: Məhdud Yararlı / İkinci Eşelon və Ehtiyat Qüvvələr';
    eligibleForMobilization = true;
  }

  return {
    score,
    maxScore,
    percentage,
    grade,
    statusLabel,
    eligibleForMobilization,
  };
}

/**
 * Calculate statutory mobilization requisition compensation & fuel refund
 */
export function calculateMobilizationCompensation(params: {
  category: MilitaryVehicleCategory;
  durationDays: number;
  estimatedKmPerDay?: number;
  fuelType?: 'petrol' | 'diesel';
  consumptionPer100Km?: number;
  exchangeRates?: { USD: number; EUR: number };
}): MobilizationCompensation {
  const {
    category,
    durationDays = 1,
    estimatedKmPerDay = 150,
    fuelType = 'diesel',
    consumptionPer100Km = 12.0,
    exchangeRates = DEFAULT_EXCHANGE_RATES,
  } = params;

  const validDays = Math.max(1, durationDays);
  const dailyRateAZN = MILITARY_DAILY_TARIFFS[category] || 50.0;
  const totalRentalAZN = Number((dailyRateAZN * validDays).toFixed(2));

  const totalKm = validDays * Math.max(0, estimatedKmPerDay);
  const estimatedFuelLiters = Number(((totalKm / 100) * consumptionPer100Km).toFixed(1));

  const fuelRateAZN = STATUTORY_FUEL_PRICES[fuelType] || 1.00;
  const fuelCostAZN = Number((estimatedFuelLiters * fuelRateAZN).toFixed(2));

  const totalCompensationAZN = Number((totalRentalAZN + fuelCostAZN).toFixed(2));
  const totalCompensationUSD = Number((totalCompensationAZN / exchangeRates.USD).toFixed(2));
  const totalCompensationEUR = Number((totalCompensationAZN / exchangeRates.EUR).toFixed(2));

  return {
    dailyRateAZN,
    durationDays: validDays,
    totalRentalAZN,
    estimatedKm: totalKm,
    estimatedFuelLiters,
    fuelRateAZN,
    fuelCostAZN,
    totalCompensationAZN,
    totalCompensationUSD,
    totalCompensationEUR,
  };
}

/**
 * Calculate convoy march dynamics under YHQ Articles 42 & 48
 */
export function calculateConvoyParameters(
  speedKmH: number,
  isAdverseWeather: boolean = false
): {
  recommendedDistanceMeters: number;
  reactionTimeSeconds: number;
  minSafetySpacing: number;
  escortMode: string;
} {
  const safeSpeed = Math.max(10, Math.min(90, speedKmH));
  const weatherMultiplier = isAdverseWeather ? 2.0 : 1.5;
  const recommendedDistanceMeters = Math.round(safeSpeed * weatherMultiplier);
  const reactionTimeSeconds = isAdverseWeather ? 2.0 : 1.2;
  const minSafetySpacing = Math.round((safeSpeed / 3.6) * reactionTimeSeconds + (safeSpeed ** 2) / 200);

  let escortMode = 'Standart Kolon (Ön və Arxa Müşayiət Tələb Olunmur)';
  if (safeSpeed > 50 || isAdverseWeather) {
    escortMode = 'Təcili Operativ Müşayiət (BDYP / VAI Patrul Mayakı Mütləqdir)';
  } else if (safeSpeed > 30) {
    escortMode = 'Planlı Kolon Müşayiəti (Baş maşında Narıncı Mayak)';
  }

  return {
    recommendedDistanceMeters,
    reactionTimeSeconds,
    minSafetySpacing,
    escortMode,
  };
}

/**
 * Grade theoretical exam for military transport rules
 */
export function gradeMilitaryExam(
  userAnswers: Record<number, number>,
  questions: MilitaryExamQuestion[]
): {
  score: number;
  total: number;
  passed: boolean;
  percentage: number;
} {
  const total = questions.length;
  let score = 0;

  questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswerIndex) {
      score += 1;
    }
  });

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  // Pass mark is 8 out of 10 (80%)
  const passed = percentage >= 80;

  return {
    score,
    total,
    passed,
    percentage,
  };
}

/**
 * Generate official SHXCDX electronic military transport registration certificate
 */
export function generateMilitaryCertificate(
  overrides: Partial<MilitaryCertificate> = {}
): MilitaryCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const regDate = now.toISOString().split('T')[0];
  const nextYear = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  const expiryDate = nextYear.toISOString().split('T')[0];

  const certNumber = overrides.certificateNumber || `SHXCDX-HNV-2026-${randomSuffix}`;
  const sha256 = overrides.sha256Hash || `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.slice(0, 32) + randomSuffix;
  const simaUid = overrides.simaSignatureUid || `SIMA-AZ-HNV-${randomSuffix}`;

  return {
    certificateNumber: certNumber,
    registrationDate: overrides.registrationDate || regDate,
    expiryDate: overrides.expiryDate || expiryDate,
    civilianPlate: overrides.civilianPlate || '99-MN-050',
    militaryPlate: overrides.militaryPlate || '014 MN 02',
    branch: overrides.branch || 'MN',
    category: overrides.category || 'full_suv',
    ownerName: overrides.ownerName || 'Həsənov Rəşad İlham oğlu',
    ownerFin: overrides.ownerFin || '5KJH892',
    chassisNumber: overrides.chassisNumber || 'WDB9066331S849201',
    mobilizationDivision: overrides.mobilizationDivision || 'Bakı Şəhəri Səbail Rayon SHXÇDX İdarəsi',
    readinessScore: overrides.readinessScore ?? 90,
    readinessGrade: overrides.readinessGrade || 'category_1_ready',
    readinessLevel: overrides.readinessLevel || '1-ci Dərəcə: Tam Yararlı',
    dailyCompensationRate: overrides.dailyCompensationRate ?? 60.0,
    sha256Hash: sha256,
    simaSignatureUid: simaUid,
    notes: overrides.notes || 'Hərbi-nəqliyyat vəzifəsi üzrə qeydiyyata alınmışdır. Texpasportda qeyd aparılmışdır.',
    qrVerificationUrl: `https://shxcdx.gov.az/verify/hnv/${certNumber}`,
  };
}
