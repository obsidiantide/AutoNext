/**
 * Official Ministry of Science and Education (Elm və Təhsil Nazirliyi), AYNA & BDYP
 * School Bus & Student Transit Safety Compliance, Yellow Bus Standards (UNECE R107 & Res. No. 141),
 * Route Passport, Driver Attestation & Child Restraint Calculation Engine.
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Automobile Transport" (Article 20.3 - Student transportation)
 * - Cabinet of Ministers Resolution No. 141 ("Rules for the carriage of children groups by buses")
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Articles 54, 55 - Maximum speed 60 km/h)
 * - Code of Administrative Offences (İXM Articles 324-1, 327.2, 342.2-2)
 * - UNECE Regulation No. 107 (M2/M3 Child Restraints & Accessibility)
 */

import { Currency } from '../types/vehicle';

export type SchoolBusCategory = 'minivan' | 'midibus' | 'coach';

export type SchoolBusServiceTier = 'subsidized_public' | 'standard' | 'premium_door_to_door';

export interface SchoolBusTechnicalChecklist {
  yellowBodyColor: boolean; // RAL 1023 Traffic Yellow
  reflectiveStripes: boolean; // High-visibility retro-reflective contour lines
  childIdentifierSigns: boolean; // Front & rear square/triangle "UŞAQLAR" signs
  foldingStopArm: boolean; // Left-side motorized octagonal LED STOP sign arm
  speedLimiter60kmh: boolean; // Hardware governor capping speed strictly at 60 km/h
  alcolockInstalled: boolean; // Driver breathalyzer ignition interlock device
  threePointSeatbelts: boolean; // All seats equipped with 3-point child-adjustable safety belts
  lowStepOrRamp: boolean; // Entry step height <= 250 mm or motorized folding step
  cctvAndGpsTelemetry: boolean; // 4-channel continuous video recording + AYNA GPS tracker
  emergencyRoofHatches: boolean; // At least one roof egress escape hatch
  fireExtinguishersAndAidKits: boolean; // 2x OP-5 powder fire extinguishers + child first aid kit
}

export interface SchoolBusDriverProfile {
  fullName: string;
  finCode: string;
  licenseNumber: string;
  licenseCategory: 'B' | 'C' | 'D1' | 'D';
  drivingExperienceYears: number;
  driverAge: number;
  hasViolationsPast2Years: boolean;
  medicalAttestationValid: boolean;
  psychologicalEvaluationPassed: boolean;
  hasCertifiedChaperone: boolean; // Mandatory adult attendant for student supervision
}

export interface TechnicalAuditResult {
  score: number; // 0 - 100
  isCompliant: boolean;
  passedItemsCount: number;
  totalItemsCount: number;
  passedList: string[];
  deficiencies: string[];
  fineAmountAzn: number;
  legalArticlesViolated: string[];
  recommendations: string[];
}

export interface DriverAuditResult {
  isEligible: boolean;
  passedCount: number;
  totalRequirements: number;
  disqualifications: string[];
  approvals: string[];
}

export interface SchoolRoutePricingInput {
  category: SchoolBusCategory;
  oneWayDistanceKm: number;
  studentsCount: number;
  serviceTier: SchoolBusServiceTier;
  hasSiblingDiscount?: boolean;
  currency?: Currency;
}

export interface SchoolRoutePricingResult {
  monthlyFeePerStudentAzn: number;
  monthlyTotalRouteCostAzn: number;
  fuelAndMaintenanceAzn: number;
  driverAndAttendantSalaryAzn: number;
  aynaDispatchPermitFeeAzn: number;
  siblingDiscountSavingsAzn: number;
  formattedMonthlyFee: string;
  formattedTotalCost: string;
  currency: Currency;
}

export interface SchoolBusCertificate {
  certificateNumber: string; // e.g. AYNA-SCH-2026-94812
  routePassportNumber: string; // e.g. MP-SCH-BAKU-023
  schoolId: string;
  schoolName: string;
  vehicleMakeModel: string;
  plateNumber: string;
  vinCode: string;
  capacitySeats: number;
  driverFullName: string;
  driverFin: string;
  chaperoneFullName: string;
  issueDate: string;
  validUntil: string;
  securityHash: string;
  qrVerificationUrl: string;
  complianceRating: string;
  speedCapKmh: number;
  safetyTier: string;
}

/**
 * Currency conversion rates (Standardized across AutoNext)
 */
export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882,
  EUR: 0.5405,
};

/**
 * Audits school bus vehicle technical compliance against UNECE R107 and Cabinet of Ministers Res. No. 141.
 */
export function auditSchoolBusTechnical(checklist: SchoolBusTechnicalChecklist): TechnicalAuditResult {
  const items = [
    { key: 'yellowBodyColor', label: 'RAL 1023 Sarı kuzov rəngi (Məktəbli identifikatoru)', penalty: 100, article: 'İXM Maddə 324-1' },
    { key: 'reflectiveStripes', label: 'İşıqqaytarıcı sarı/qırmızı kontur xətləri', penalty: 50, article: 'YHQ Əlavə 1' },
    { key: 'childIdentifierSigns', label: 'Ön və arxa "UŞAQLAR" rəsmi xəbərdarlıq nişanları', penalty: 80, article: 'YHQ Maddə 54' },
    { key: 'foldingStopArm', label: 'Sol qatlanan LED işıqlı STOP qanadı (Stop Arm)', penalty: 100, article: 'NK Qərarı № 141' },
    { key: 'speedLimiter60kmh', label: 'Aparat təminatlı 60 km/saat sürət məhdudlaşdırıcısı', penalty: 150, article: 'İXM Maddə 342.2-2' },
    { key: 'alcolockInstalled', label: 'Sürücü üçün nəfəs-analizli Alko-Kilid cihazı', penalty: 200, article: 'İXM Maddə 333' },
    { key: 'threePointSeatbelts', label: 'Bütün oturacaqlarda 3-nöqtəli uşaq təhlükəsizlik kəməri', penalty: 150, article: 'YHQ Maddə 37' },
    { key: 'lowStepOrRamp', label: 'Aşağı giriş pilləsi (≤250 mm) və ya enən qatlanan pillə', penalty: 60, article: 'UNECE R107' },
    { key: 'cctvAndGpsTelemetry', label: '4-kameralı daxili müşahidə və AYNA GPS telemetriyası', penalty: 100, article: 'NK Qərarı № 141' },
    { key: 'emergencyRoofHatches', label: 'Damda təcili təxliyə qəza çıxış lyuku', penalty: 120, article: 'UNECE R107' },
    { key: 'fireExtinguishersAndAidKits', label: '2 ədəd OP-5 yanğınsöndürən və uşaq ilk yardım çantası', penalty: 50, article: 'YHQ Əlavə 1' },
  ] as const;

  const passedList: string[] = [];
  const deficiencies: string[] = [];
  const legalArticles = new Set<string>();
  let totalPenaltyAzn = 0;

  for (const item of items) {
    if (checklist[item.key]) {
      passedList.push(item.label);
    } else {
      deficiencies.push(item.label);
      totalPenaltyAzn += item.penalty;
      legalArticles.add(item.article);
    }
  }

  const passedCount = passedList.length;
  const totalCount = items.length;
  const score = Math.round((passedCount / totalCount) * 100);
  const isCompliant = score === 100;

  const recommendations: string[] = [];
  if (!checklist.speedLimiter60kmh) {
    recommendations.push('Avtobusun ECU blokuna 60 km/saat elektron sürət məhdudlaşdırıcısı proqramlaşdırılmalıdır.');
  }
  if (!checklist.alcolockInstalled) {
    recommendations.push('Start düyməsinə inteqrasiya edilmiş sertifikatlı Alco-Lock cihazı quraşdırılmalıdır.');
  }
  if (!checklist.foldingStopArm) {
    recommendations.push('Uşaqlar minik/düşmə edərkən yana açılan qırmızı LED "STOP" qanadı təchiz olunmalıdır.');
  }
  if (!checklist.threePointSeatbelts) {
    recommendations.push('Bütün sərnişin oturacaqları uşaq bədən ölçülərinə uyğunlaşan 3-nöqtəli kəmərlərlə əvəzlənməlidir.');
  }
  if (!checklist.cctvAndGpsTelemetry) {
    recommendations.push('AYNA vahid monitorinq mərkəzinə qoşulan 4G GPS treker və salon video qeydiyyatçısı aktivləşdirilməlidir.');
  }

  return {
    score,
    isCompliant,
    passedItemsCount: passedCount,
    totalItemsCount: totalCount,
    passedList,
    deficiencies,
    fineAmountAzn: totalPenaltyAzn,
    legalArticlesViolated: Array.from(legalArticles),
    recommendations,
  };
}

/**
 * Evaluates school bus driver qualification against Article 20.3 & YHQ standards.
 */
export function auditSchoolBusDriver(driver: SchoolBusDriverProfile): DriverAuditResult {
  const disqualifications: string[] = [];
  const approvals: string[] = [];

  // 1. License category: Must be 'D' (or 'D1' for minivans up to 16 seats)
  if (driver.licenseCategory === 'D' || driver.licenseCategory === 'D1') {
    approvals.push(`Rəsmi ${driver.licenseCategory} kateqoriyalı sürücülük hüququ mövcuddur`);
  } else {
    disqualifications.push(`Yararsız kateqoriya (${driver.licenseCategory}). Məktəbli avtobusu üçün yalnız D və ya D1 kateqoriyası tələb olunur.`);
  }

  // 2. Minimum 3 years continuous D experience
  if (driver.drivingExperienceYears >= 3) {
    approvals.push(`Tələb olunan minimum 3 illik təcrübə təmin edilib (${driver.drivingExperienceYears} il)`);
  } else {
    disqualifications.push(`Qeyri-kafi sükan arxası təcrübə (${driver.drivingExperienceYears} il). Qanunla minimum 3 il fasiləsiz D təcrübəsi şərtdir.`);
  }

  // 3. Driver age between 23 and 65
  if (driver.driverAge >= 23 && driver.driverAge <= 65) {
    approvals.push(`Yaş həddi normativlərə uyğundur (${driver.driverAge} yaş)`);
  } else {
    disqualifications.push(`Yaş meyarı pozulub (${driver.driverAge} yaş). İcazə verilən yaş aralığı: 23–65 yaş.`);
  }

  // 4. Clean driving record in the last 2 years
  if (!driver.hasViolationsPast2Years) {
    approvals.push('Son 2 ildə kobud yol hərəkəti pozuntusu və qəza qeydiyyatı yoxdur');
  } else {
    disqualifications.push('Son 2 ildə kobud İXM qayda pozuntusu və ya təqsirli YNH qeydə alınıb.');
  }

  // 5. Medical attestation Form 083/y
  if (driver.medicalAttestationValid) {
    approvals.push('Rəsmi illik tibbi komissiya arayışı (Form № 083/y) qüvvədədir');
  } else {
    disqualifications.push('İllik tibbi arayışın müddəti bitib və ya təqdim olunmayıb.');
  }

  // 6. Psychophysiological evaluation
  if (driver.psychologicalEvaluationPassed) {
    approvals.push('AYNA akkreditəli psixofizioloji stress-test və yuxu auditindən keçib');
  } else {
    disqualifications.push('Psixofizioloji müayinə sertifikatı çatışmır.');
  }

  // 7. Adult escort / chaperone present
  if (driver.hasCertifiedChaperone) {
    approvals.push('Sertifikatlı böyük müşayiətçi (bələdçi) təyin edilib');
  } else {
    disqualifications.push('Avtobusda şagirdlərin nəzarəti üçün məsul müşayiətçi (bələdçi) yoxdur (NK Qərarı № 141).');
  }

  const isEligible = disqualifications.length === 0;

  return {
    isEligible,
    passedCount: approvals.length,
    totalRequirements: approvals.length + disqualifications.length,
    disqualifications,
    approvals,
  };
}

/**
 * Calculates monthly school bus route operating expenses and student tuition fees.
 */
export function calculateSchoolRoutePricing(input: SchoolRoutePricingInput): SchoolRoutePricingResult {
  const { category, oneWayDistanceKm, studentsCount, serviceTier, hasSiblingDiscount = false, currency = 'AZN' } = input;

  const validStudents = Math.max(1, studentsCount);
  const validDistance = Math.max(1, oneWayDistanceKm);

  // Daily mileage (2 trips per day * 22 school days per month)
  const monthlyKm = validDistance * 2 * 22;

  // Fuel consumption based on bus category (Liters per 100km of Diesel at 0.80 AZN/L)
  const fuelRateLPer100Km = category === 'minivan' ? 10 : category === 'midibus' ? 16 : 24;
  const dieselPriceAzn = 0.8;
  const monthlyFuelCost = (monthlyKm / 100) * fuelRateLPer100Km * dieselPriceAzn;
  const monthlyMaintenanceCost = monthlyKm * 0.12; // 0.12 AZN/km wear & oil
  const fuelAndMaintenanceAzn = Math.round(monthlyFuelCost + monthlyMaintenanceCost);

  // Salaries: Driver (850 - 1200 AZN) + Chaperone (450 - 600 AZN)
  const driverSalary = category === 'minivan' ? 850 : category === 'midibus' ? 1050 : 1250;
  const chaperoneSalary = 500;
  const driverAndAttendantSalaryAzn = driverSalary + chaperoneSalary;

  // AYNA monthly route dispatch & telemetry permit fee
  const aynaDispatchPermitFeeAzn = category === 'minivan' ? 60 : category === 'midibus' ? 90 : 120;

  // Service Tier Multiplier
  const tierMultiplier = serviceTier === 'subsidized_public' ? 0.65 : serviceTier === 'premium_door_to_door' ? 1.4 : 1.0;

  // Total monthly route operating cost
  const rawTotalCost = (fuelAndMaintenanceAzn + driverAndAttendantSalaryAzn + aynaDispatchPermitFeeAzn) * tierMultiplier;
  const monthlyTotalRouteCostAzn = Math.round(rawTotalCost);

  // Base per-student monthly fee
  let baseFeePerStudent = Math.ceil(monthlyTotalRouteCostAzn / validStudents);
  // Ensure minimum baseline
  if (baseFeePerStudent < 45) baseFeePerStudent = 45;

  let siblingDiscountSavingsAzn = 0;
  if (hasSiblingDiscount) {
    siblingDiscountSavingsAzn = Math.round(baseFeePerStudent * 0.2); // 20% discount
    baseFeePerStudent -= siblingDiscountSavingsAzn;
  }

  const rate = CURRENCY_RATES[currency] || 1.0;
  const convertedStudentFee = baseFeePerStudent * rate;
  const convertedTotalRouteCost = monthlyTotalRouteCostAzn * rate;

  const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';

  return {
    monthlyFeePerStudentAzn: baseFeePerStudent,
    monthlyTotalRouteCostAzn,
    fuelAndMaintenanceAzn,
    driverAndAttendantSalaryAzn,
    aynaDispatchPermitFeeAzn,
    siblingDiscountSavingsAzn,
    formattedMonthlyFee: `${convertedStudentFee.toFixed(currency === 'AZN' ? 0 : 1)} ${symbol}`,
    formattedTotalCost: `${convertedTotalRouteCost.toFixed(0)} ${symbol}`,
    currency,
  };
}

/**
 * Generates an official AYNA & Elm və Təhsil Nazirliyi School Bus Permit Certificate.
 */
export function generateSchoolBusCertificate(params: {
  schoolId: string;
  schoolName: string;
  vehicleMakeModel: string;
  plateNumber: string;
  vinCode: string;
  capacitySeats: number;
  driverFullName: string;
  driverFin: string;
  chaperoneFullName: string;
  isFullyCompliant: boolean;
}): SchoolBusCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certNumber = `AYNA-SCH-2026-${randomSuffix}`;
  const routePassportNumber = `MP-SCH-${params.plateNumber.replace(/-/g, '')}`;

  const now = new Date();
  const issueDate = now.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const expiryDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toLocaleDateString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Deterministic mock cryptographic SHA-256 seal
  const rawSeed = `${certNumber}|${params.plateNumber}|${params.vinCode}|${params.driverFin}|2026`;
  let hashVal = 0;
  for (let i = 0; i < rawSeed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawSeed.charCodeAt(i);
    hashVal |= 0;
  }
  const hexHash = Math.abs(hashVal).toString(16).padStart(8, '0');
  const securityHash = `SHA256:e9a4${hexHash}7bc82026d34b`;

  const qrVerificationUrl = `https://ayna.gov.az/verify/school-bus?cert=${certNumber}&sig=${hexHash}`;

  return {
    certificateNumber: certNumber,
    routePassportNumber,
    schoolId: params.schoolId,
    schoolName: params.schoolName,
    vehicleMakeModel: params.vehicleMakeModel,
    plateNumber: params.plateNumber,
    vinCode: params.vinCode,
    capacitySeats: params.capacitySeats,
    driverFullName: params.driverFullName,
    driverFin: params.driverFin,
    chaperoneFullName: params.chaperoneFullName,
    issueDate,
    validUntil: expiryDate,
    securityHash,
    qrVerificationUrl,
    complianceRating: params.isFullyCompliant ? 'TƏSDİQLƏNDİ (100% STANDART)' : 'ŞƏRTİ İCAZƏ (QÜSURLU)',
    speedCapKmh: 60,
    safetyTier: params.isFullyCompliant ? 'A+ Yüksək Təhlükəsizlik' : 'B Standart Nəzarət',
  };
}
