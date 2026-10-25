/**
 * Official Ministry of Agriculture (Kənd Təsərrüfatı Nazirliyi - KTN),
 * State Agricultural Services Agency (DAXA / BDTNX) & BDYP
 * Agricultural & Self-Propelled Forestry Machinery Registration,
 * Tractor Operator Licensing (Categories A-F), Field Transit & Agrarian Subsidies (EKTİS) Engine.
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Articles 27, 33, 54, 57)
 * - Law of the Republic of Azerbaijan "On State Duties" (Article 18 - Agricultural machinery duties)
 * - Cabinet of Ministers Decisions on the State Registration & Technical Inspection of Tractors
 * - Code of Administrative Offences (İXM Articles 327.1, 342.1.5, 342.2-1, 353)
 * - Rules of the Agrarian Credit and Development Agency (AKİA) & EKTİS 40% machinery subsidies
 */

import { Currency } from '../types/vehicle';

export type TractorCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface TractorCategoryInfo {
  category: TractorCategory;
  name: string;
  description: string;
  powerRange: string;
  minAge: number;
  sampleVehicles: string;
}

export const TRACTOR_CATEGORIES: Record<TractorCategory, TractorCategoryInfo> = {
  A: {
    category: 'A',
    name: 'Kateqoriya A: Kiçik Təkərli Traktorlar',
    description: 'Mühərrikinin gücü 25.7 kVt-dək (35 a.g.-dək) olan təkərli traktorlar',
    powerRange: '≤ 25.7 kW (≤ 35 hp)',
    minAge: 18,
    sampleVehicles: 'Yanmar YT359, Kioti CK35, Dongfeng DF-244, bağçılıq mini-traktorları',
  },
  B: {
    category: 'B',
    name: 'Kateqoriya B: Orta Təkərli Traktorlar',
    description: 'Mühərrikinin gücü 25.7 kVt-dan 77.2 kVt-dək (35–105 a.g.) olan təkərli traktorlar',
    powerRange: '25.7 – 77.2 kW (35 – 105 hp)',
    minAge: 18,
    sampleVehicles: 'Belarus MTZ-82.1, New Holland T6000, Case IH Farmall, Lovol 904',
  },
  C: {
    category: 'C',
    name: 'Kateqoriya C: Ağır Təkərli Traktorlar',
    description: 'Mühərrikinin gücü 77.2 kVt-dan yuxarı (>105 a.g.) olan təkərli ağır kotan traktorları',
    powerRange: '> 77.2 kW (> 105 hp)',
    minAge: 18,
    sampleVehicles: 'John Deere 8R, Fendt 900 Vario, Case IH Magnum, Belarus 3522',
  },
  D: {
    category: 'D',
    name: 'Kateqoriya D: Tırtıllı Traktorlar',
    description: 'Bütün güclərdə olan tırtıllı kənd təsərrüfatı və meliorasiya traktorları',
    powerRange: 'Bütün güclər (tırtıllı şassi)',
    minAge: 19,
    sampleVehicles: 'DT-75M, T-150-05-09, Caterpillar Challenger, John Deere 8RT',
  },
  E: {
    category: 'E',
    name: 'Kateqoriya E: Özüyeriyən Meliorasiya & Tikinti Maşınları',
    description: 'Özüyeriyən meliorasiya, ekskavator, skreper, qreyder və xəndəkqazan aqreqatlar',
    powerRange: 'Özüyeriyən xüsusi aqreqatlar',
    minAge: 18,
    sampleVehicles: 'JCB 3CX Eco, Hidromek HMK 102B, Komatsu WB93R, meliorasiya təmizləyiciləri',
  },
  F: {
    category: 'F',
    name: 'Kateqoriya F: Özüyeriyən Taxıl & Pambıqyığan Kombaynlar',
    description: 'Taxılyığan, pambıqyığan, çəltikyığan və yem tədarük edən özüyeriyən kombaynlar',
    powerRange: '> 150 kW (> 200 hp)',
    minAge: 18,
    sampleVehicles: 'CLAAS Tucano 450, Rostselmash RSM 161, John Deere S770, Case IH Axial-Flow',
  },
};

export interface TractorTechnicalChecklist {
  chassisAndEngineMatch: boolean; // Serial numbers match registration passport
  hydraulicSystemIntegrity: boolean; // Zero high-pressure fluid leaks, functional 3-point hitch
  steeringBrakeFunction: boolean; // Dual pedal locking latch for road transit, independent brake balance
  emergencyBeaconLight: boolean; // Orange flashing beacon light (sarı mayak) for transit
  slowMovingVehicleSign: boolean; // Rear reflective SMV triangle emblem (≤40 km/h)
  lightingAndReflectors: boolean; // Working headlights, amber turn indicators, rear reflectors
  cabinRolloverProtection: boolean; // ROPS / FOPS certified roll-over protective cabin
  fireExtinguisherAndFirstAid: boolean; // OP-5 powder fire extinguisher & medical kit
  ptoShaftShield: boolean; // Rotating PTO shaft safety cover and universal guard
  exhaustSparkArrester: boolean; // Fire safety spark arrester for dry field operations
}

export interface TechnicalAuditResult {
  score: number; // 0 - 100
  isCompliant: boolean;
  passedCount: number;
  totalCount: number;
  passedList: string[];
  deficiencies: string[];
  fineAmountAzn: number;
  legalArticlesViolated: string[];
  recommendations: string[];
}

export interface TractorDriverProfile {
  fullName: string;
  finCode: string;
  category: TractorCategory;
  driverAge: number;
  medicalFitnessValid: boolean; // Forma AZS-083/e
  theoryExamScore: number; // 0 - 10 (Passing threshold >= 9)
  practicalTillageExamPassed: boolean;
}

export interface DriverAttestationResult {
  isEligible: boolean;
  score: number;
  disqualifications: string[];
  approvals: string[];
}

export interface FieldTransitSafetyInput {
  machineryType: 'wheeled' | 'crawler' | 'combine';
  cuttingWidthMeters?: number; // Header width (e.g. 5.4m, 7.0m)
  isHeaderAttachedToFront?: boolean; // If attached to front vs placed on cart/trailer
  travelSurface: 'asphalt_highway' | 'dirt_field_road';
  hasAmberBeaconActive: boolean;
  hasPilotEscortVehicle: boolean;
  plannedSpeedKmh: number;
}

export interface FieldTransitSafetyResult {
  isHighwayTransitPermitted: boolean;
  restrictions: string[];
  mandatoryActions: string[];
  fineRiskAzn: number;
  maxLegalSpeedKmh: number;
  overhangWarning: boolean;
}

export interface EktisSubsidyInput {
  machineryPriceAzn: number;
  machineryCategory: TractorCategory;
  isLocalAssemblyOrPreferential: boolean; // Additional incentive or certified distributor
  leasePeriodMonths?: number; // Standard 60 months (5 years)
  currency?: Currency;
}

export interface EktisSubsidyResult {
  machineryPriceAzn: number;
  stateSubsidyAzn: number; // 40% non-refundable grant
  farmerDownPaymentAzn: number; // 20%
  subsidizedLeasingBalanceAzn: number; // 40%
  monthlyLeasePaymentAzn: number; // 0% subsidized interest over 60 months
  totalFarmerSavingsAzn: number;
  stateGrantPercentage: number;
  currency: Currency;
  formattedPrice: string;
  formattedSubsidy: string;
  formattedDownPayment: string;
  formattedMonthly: string;
}

export interface TractorCertificate {
  certificateNumber: string; // e.g. KTN-TEX-2026-89412
  daxaDivisionName: string;
  plateNumber: string; // e.g. 99-TA-102
  chassisNumber: string;
  engineSerial: string;
  category: TractorCategory;
  ownerName: string;
  ownerVoenOrFin: string;
  issueDate: string;
  expiryDate: string;
  safetyScore: number;
  annualInspectionTalonNumber: string;
  securityChecksum: string;
  status: 'valid' | 'expired' | 'suspended';
}

const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882,
  EUR: 0.5405,
};

/**
 * Evaluates the 10-point technical & roadworthiness checklist for agricultural machinery.
 */
export function evaluateTractorChecklist(checklist: TractorTechnicalChecklist): TechnicalAuditResult {
  const items: { key: keyof TractorTechnicalChecklist; label: string; weight: number; fineAzn: number; article: string }[] = [
    { key: 'chassisAndEngineMatch', label: 'Şassi və mühərrik nömrələrinin texniki pasportla eyniliyi', weight: 15, fineAzn: 150, article: 'İXM Maddə 342.2-1' },
    { key: 'hydraulicSystemIntegrity', label: 'Yüksək təzyiqli hidravlik sistemin germetikliyi və 3-nöqtəli asqı sazlığı', weight: 10, fineAzn: 50, article: 'İXM Maddə 342.1.5' },
    { key: 'steeringBrakeFunction', label: 'Sükan idarəetməsi və qoşalaşdırılmış əyləc pedalının şose kilidləmə fiksatoru', weight: 15, fineAzn: 150, article: 'İXM Maddə 342.2' },
    { key: 'emergencyBeaconLight', label: 'Narıncı/sarı yanıb-sönən xəbərdarlıq mayakı (irihəcmli texnika üçün)', weight: 10, fineAzn: 50, article: 'İXM Maddə 342.1' },
    { key: 'slowMovingVehicleSign', label: 'Arxa tərəfdə əks-etdirici "Aşağı Sürətli Nəqliyyat" (SMV ≤40 km/s) üçbucağı', weight: 10, fineAzn: 40, article: 'YHQ Əlavə 1' },
    { key: 'lightingAndReflectors', label: 'Xarici işıq cihazları, dönmə siqnalları və qabarit əks-etdiriciləri', weight: 10, fineAzn: 50, article: 'İXM Maddə 342.1.4' },
    { key: 'cabinRolloverProtection', label: 'ROPS/FOPS sertifikatlı aşma və zərbədən qoruyucu təhlükəsizlik kabinası', weight: 10, fineAzn: 100, article: 'KTN Texniki Standart' },
    { key: 'fireExtinguisherAndFirstAid', label: 'OP-5 tozlu odsöndürən balon və kənd təsərrüfatı tibbi çantası', weight: 5, fineAzn: 50, article: 'İXM Maddə 342.1.7' },
    { key: 'ptoShaftShield', label: 'Gücayıran valın (VOM / PTO) fırlanan hissələrinin mühafizə qoruyucu örtüyü', weight: 10, fineAzn: 80, article: 'Texniki Təhlükəsizlik Qaydası' },
    { key: 'exhaustSparkArrester', label: 'Taxıl zəmilərində yanğın təhlükəsizliyi üçün qığılcımsöndürən başlıq', weight: 5, fineAzn: 60, article: 'FHN Yanğın Standartı' },
  ];

  let score = 0;
  let passedCount = 0;
  let fineAmountAzn = 0;
  const passedList: string[] = [];
  const deficiencies: string[] = [];
  const legalArticlesViolated: string[] = [];
  const recommendations: string[] = [];

  for (const item of items) {
    if (checklist[item.key]) {
      score += item.weight;
      passedCount += 1;
      passedList.push(item.label);
    } else {
      deficiencies.push(item.label);
      fineAmountAzn += item.fineAzn;
      if (!legalArticlesViolated.includes(item.article)) {
        legalArticlesViolated.push(item.article);
      }
      recommendations.push(`${item.label} təmin olunmalıdır (${item.article} — cərimə ${item.fineAzn} ₼).`);
    }
  }

  const isCompliant = score >= 85 && checklist.chassisAndEngineMatch && checklist.steeringBrakeFunction;

  return {
    score,
    isCompliant,
    passedCount,
    totalCount: items.length,
    passedList,
    deficiencies,
    fineAmountAzn,
    legalArticlesViolated,
    recommendations,
  };
}

/**
 * Validates tractor & self-propelled machinery operator driver profile.
 */
export function evaluateTractorDriver(profile: TractorDriverProfile): DriverAttestationResult {
  const disqualifications: string[] = [];
  const approvals: string[] = [];
  const categoryInfo = TRACTOR_CATEGORIES[profile.category];

  if (profile.driverAge < categoryInfo.minAge) {
    disqualifications.push(`Sürücünün yaşı minimum ${categoryInfo.minAge} olmalıdır (cari yaş: ${profile.driverAge}).`);
  } else {
    approvals.push(`Yaş tələbinə uyğundur (minimum: ${categoryInfo.minAge} il).`);
  }

  if (!profile.medicalFitnessValid) {
    disqualifications.push('Forma AZS-083/e rəqəmsal tibbi arayışının müddəti bitib və ya qeydiyyatdan keçməyib.');
  } else {
    approvals.push('Səhiyyə Nazirliyi Forma AZS-083/e tibbi müayinə qüvvədədir.');
  }

  if (profile.theoryExamScore < 9) {
    disqualifications.push(`Nəzəri imtahan balı 10-dan minimum 9 olmalıdır (cari bal: ${profile.theoryExamScore}/10).`);
  } else {
    approvals.push(`DAXA nəzəri imtahanı uğurla verilib (${profile.theoryExamScore}/10).`);
  }

  if (!profile.practicalTillageExamPassed) {
    disqualifications.push('Aqrotexniki poliqonda praktiki şum və manevr imtahanı tamamlanmayıb.');
  } else {
    approvals.push('Praktiki aqrotexniki idarəetmə və aqreqasiya imtahanı qəbul edilib.');
  }

  const isEligible = disqualifications.length === 0;
  const score = isEligible ? 100 : Math.round((approvals.length / (approvals.length + disqualifications.length)) * 100);

  return {
    isEligible,
    score,
    disqualifications,
    approvals,
  };
}

/**
 * Assesses seasonal field transit and highway safety compliance.
 */
export function evaluateFieldTransitSafety(input: FieldTransitSafetyInput): FieldTransitSafetyResult {
  const restrictions: string[] = [];
  const mandatoryActions: string[] = [];
  let fineRiskAzn = 0;
  let isHighwayTransitPermitted = true;
  let maxLegalSpeedKmh = input.machineryType === 'crawler' ? 15 : 40;
  let overhangWarning = false;

  // 1. Crawler metal track highway ban
  if (input.machineryType === 'crawler') {
    if (input.travelSurface === 'asphalt_highway') {
      isHighwayTransitPermitted = false;
      restrictions.push('Metal tırtıllı traktorların asfalt örtüklü ümumi istifadədə olan avtomobil yollarında hərəkəti qəti QADAĞANDIR!');
      mandatoryActions.push('Texnika aşağı platformalı xüsusi ağır yük treylerində (tral) daşınmalı və ya rezin örtüklü tırtıl yastıqları quraşdırılmalıdır.');
      fineRiskAzn += 150; // İXM 342.2-1 & road surface damage penalty
    }
    maxLegalSpeedKmh = 15;
  }

  // 2. Harvester cutting width and header rule
  if (input.machineryType === 'combine') {
    const width = input.cuttingWidthMeters || 6.0;
    maxLegalSpeedKmh = 30;

    if (input.travelSurface === 'asphalt_highway' && input.isHeaderAttachedToFront) {
      if (width > 2.55) {
        isHighwayTransitPermitted = false;
        overhangWarning = true;
        restrictions.push(`Biçən aqreqatın ("jatka") eni ${width}m olduğu halda kombaynın önünə qoşulmuş vəziyyətdə yola çıxması QADAĞANDIR!`);
        mandatoryActions.push('Biçən aqreqat ("jatka") sökülərək xüsusi təkərli qoşqu arabacığına qoyulmalı və kombaynın arxasında çəkilməlidir (maksimal yol qabariti 2.55m).');
        fineRiskAzn += 600; // İXM Maddə 353 (İriqabaritli nəqliyyat qaydalarının pozulması)
      }
    }

    if (width > 3.0 && !input.hasAmberBeaconActive) {
      restrictions.push('Sarı/narıncı yanıb-sönən xəbərdarlıq mayakı aktivləşdirilməyib.');
      mandatoryActions.push('Kabina tavanında 360° görünən sarı mayak yandırılmalıdır.');
      fineRiskAzn += 50;
    }

    if (width > 3.5 && !input.hasPilotEscortVehicle && input.travelSurface === 'asphalt_highway') {
      restrictions.push('Eni 3.5 metrdən artıq olan kombayn üçün müşayiətçi eskort avtomobili tələb olunur.');
      mandatoryActions.push('Öndə "Geniş Qabarit" lövhəli xüsusi eskort avtomobili hərəkət etməlidir.');
      fineRiskAzn += 200;
    }
  }

  // 3. Planned speed check
  if (input.plannedSpeedKmh > maxLegalSpeedKmh) {
    restrictions.push(`Maksimum qanuni sürət həddi aşılır (Qanuni hədd: ${maxLegalSpeedKmh} km/saat, planlaşdırılan: ${input.plannedSpeedKmh} km/saat).`);
    mandatoryActions.push(`Sürət ${maxLegalSpeedKmh} km/saat həddinə endirilməlidir.`);
    fineRiskAzn += 50;
  }

  return {
    isHighwayTransitPermitted,
    restrictions,
    mandatoryActions,
    fineRiskAzn,
    maxLegalSpeedKmh,
    overhangWarning,
  };
}

/**
 * Calculates EKTİS state machinery subsidies and concessional leasing financials.
 */
export function calculateEktisSubsidy(input: EktisSubsidyInput): EktisSubsidyResult {
  const currency = input.currency || 'AZN';
  const rate = CURRENCY_RATES[currency] || 1.0;
  const machineryPriceAzn = Math.max(0, input.machineryPriceAzn);

  // Statutory standard: State provides 40% non-refundable grant
  const stateGrantPercentage = 40;
  const stateSubsidyAzn = Math.round(machineryPriceAzn * 0.40);

  // Farmer down payment: 20%
  const farmerDownPaymentAzn = Math.round(machineryPriceAzn * 0.20);

  // Subsidized leasing balance: remaining 40%
  const subsidizedLeasingBalanceAzn = machineryPriceAzn - stateSubsidyAzn - farmerDownPaymentAzn;

  const leaseMonths = input.leasePeriodMonths || 60; // 5 years
  // 0% interest subsidized by AKİA
  const monthlyLeasePaymentAzn = leaseMonths > 0 ? Math.round(subsidizedLeasingBalanceAzn / leaseMonths) : 0;
  const totalFarmerSavingsAzn = stateSubsidyAzn;

  const formatCurrency = (amountAzn: number) => {
    const converted = amountAzn * rate;
    const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';
    return `${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${symbol}`;
  };

  return {
    machineryPriceAzn,
    stateSubsidyAzn,
    farmerDownPaymentAzn,
    subsidizedLeasingBalanceAzn,
    monthlyLeasePaymentAzn,
    totalFarmerSavingsAzn,
    stateGrantPercentage,
    currency,
    formattedPrice: formatCurrency(machineryPriceAzn),
    formattedSubsidy: formatCurrency(stateSubsidyAzn),
    formattedDownPayment: formatCurrency(farmerDownPaymentAzn),
    formattedMonthly: formatCurrency(monthlyLeasePaymentAzn),
  };
}

/**
 * Generates an official KTN / DAXA State Machinery Registration Certificate.
 */
export function generateTractorCertificate(params: {
  daxaDivisionName: string;
  plateNumber: string;
  chassisNumber: string;
  engineSerial: string;
  category: TractorCategory;
  ownerName: string;
  ownerVoenOrFin: string;
  safetyScore: number;
}): TractorCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `KTN-TEX-2026-${randomSuffix}`;
  const annualInspectionTalonNumber = `DAXA-TB-${randomSuffix}`;

  const today = new Date();
  const issueDate = today.toISOString().split('T')[0];
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const expiryDate = nextYear.toISOString().split('T')[0];

  const securityChecksum = `SHA256:KTN:${params.category}:${params.plateNumber}:${randomSuffix}`;

  return {
    certificateNumber,
    daxaDivisionName: params.daxaDivisionName,
    plateNumber: params.plateNumber,
    chassisNumber: params.chassisNumber,
    engineSerial: params.engineSerial,
    category: params.category,
    ownerName: params.ownerName,
    ownerVoenOrFin: params.ownerVoenOrFin,
    issueDate,
    expiryDate,
    safetyScore: params.safetyScore,
    annualInspectionTalonNumber,
    securityChecksum,
    status: 'valid',
  };
}
