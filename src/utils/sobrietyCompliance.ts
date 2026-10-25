export type SobrietyLevel = 'sober' | 'mild' | 'moderate' | 'severe' | 'coma_risk';

export type DrugSubstanceId = 'thc' | 'opi' | 'amp' | 'coc' | 'mtd' | 'bzo';

export interface DrugSubstanceInfo {
  id: DrugSubstanceId;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  chemicalName: string;
  cutoffNgMl: number;
  detectionWindowDays: string;
  legalClassification: string;
  riskDescriptionAz: string;
  riskDescriptionEn: string;
  riskDescriptionRu: string;
}

export interface ClinicalCoordinationTest {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  category: 'neurological' | 'motor' | 'cognitive' | 'autonomic' | 'ocular';
  penaltyWeight: number;
}

export type SanctionArticle =
  | 'article_333_1'
  | 'article_333_2'
  | 'article_333_3'
  | 'article_333_4'
  | 'article_333_5'
  | 'article_333_6'
  | 'article_334_1';

export interface SanctionRule {
  article: SanctionArticle;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  baseFineAzn: number;
  maxFineAzn: number;
  penaltyPoints: number;
  suspensionMonthsMin: number;
  suspensionMonthsMax: number;
  arrestDaysMax: number;
  impoundMandatory: boolean;
  legalBasis: string;
}

export interface ToxicologyCenter {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  addressAz: string;
  addressEn: string;
  addressRu: string;
  cityAz: string;
  cityEn: string;
  cityRu: string;
  phone: string;
  workingHours: string;
  equipment: string[];
  activePhysicians: number;
  dailyCapacity: number;
  emergency247: boolean;
}

export interface DriverPreset {
  id: string;
  driverName: string;
  finCode: string;
  licenseNumber: string;
  vehiclePlate: string;
  vehicleModel: string;
  bracMgL: number;
  detectedDrugs: DrugSubstanceId[];
  failedClinicalTests: string[];
  violationArticle: SanctionArticle;
  refusal: boolean;
  notesAz: string;
  notesEn: string;
  notesRu: string;
}

export interface SobrietyProtocolRecord {
  id: string;
  protocolNumber: string;
  date: string;
  driverName: string;
  finCode: string;
  licenseNumber: string;
  vehiclePlate: string;
  vehicleModel: string;
  centerId: string;
  centerName: string;
  examiningDoctor: string;
  doctorRegNumber: string;
  inspectorBadge: string;
  policeDistrict: string;
  dragerDeviceSerial: string;
  bracMgL: number;
  bacPromille: number;
  sobrietyLevel: SobrietyLevel;
  detectedDrugs: DrugSubstanceId[];
  clinicalFailedCount: number;
  clinicalImpairmentScore: number;
  clinicalPass: boolean;
  fineAzn: number;
  penaltyPoints: number;
  suspensionMonths: number;
  arrestDaysMax: number;
  impoundMandatory: boolean;
  status: 'confirmed_intoxicated' | 'sober_cleared' | 'refusal_sanctioned';
  verificationHash: string;
}

export const STATUTORY_BAC_LIMIT_PROMILLE = 0.30;
export const STATUTORY_BRAC_LIMIT_MG_L = 0.15;
export const METABOLIC_ELIMINATION_RATE_PROMILLE_PER_HOUR = 0.15;

export const SANCTION_RULES: Record<SanctionArticle, SanctionRule> = {
  article_333_1: {
    article: 'article_333_1',
    titleAz: 'İXM Maddə 333.1: Sərxoş İdarəetmə (Zərərsiz)',
    titleEn: 'Article 333.1: Driving Intoxicated (No Damage)',
    titleRu: 'Статья 333.1: Управление в нетрезвом виде (без ущерба)',
    descriptionAz: 'Nəqliyyat vasitəsini alkoqol, narkotik və ya digər sərxoşluq vəziyyətində idarə etmə',
    descriptionEn: 'Operating vehicle while intoxicated by alcohol, drugs or toxic substances',
    descriptionRu: 'Управление транспортным средством в состоянии алкогольного, наркотического или токсического опьянения',
    baseFineAzn: 400,
    maxFineAzn: 400,
    penaltyPoints: 5,
    suspensionMonthsMin: 0,
    suspensionMonthsMax: 0,
    arrestDaysMax: 0,
    impoundMandatory: true,
    legalBasis: 'AR İXM Maddə 333.1 & Maddə 96.1'
  },
  article_333_2: {
    article: 'article_333_2',
    titleAz: 'İXM Maddə 333.2: Sərxoş İdarəetmə (Zədə və ya Zərər)',
    titleEn: 'Article 333.2: Driving Intoxicated (Property or Bodily Damage)',
    titleRu: 'Статья 333.2: Нетрезвое вождение (с причинением ущерба или легкого вреда)',
    descriptionAz: 'Maddi zərər və ya yüngül bədən xəsarəti yetirilməsi ilə nəticələnən sərxoş idarəetmə',
    descriptionEn: 'Driving intoxicated causing material damage or minor bodily injury',
    descriptionRu: 'Управление в нетрезвом виде, повлекшее причинение материального ущерба или легкого вреда здоровью',
    baseFineAzn: 700,
    maxFineAzn: 700,
    penaltyPoints: 5,
    suspensionMonthsMin: 0,
    suspensionMonthsMax: 0,
    arrestDaysMax: 15,
    impoundMandatory: true,
    legalBasis: 'AR İXM Maddə 333.2'
  },
  article_333_3: {
    article: 'article_333_3',
    titleAz: 'İXM Maddə 333.3: Sürücülük Hüququ Olmayan Şəxsin Sərxoş İdarəetməsi',
    titleEn: 'Article 333.3: Driving Intoxicated without Driver License',
    titleRu: 'Статья 333.3: Управление в нетрезвом виде лицом без водительских прав',
    descriptionAz: 'Nəqliyyat vasitəsini idarə etmə hüququ olmayan şəxs tərəfindən sərxoş vəziyyətdə idarəetmə',
    descriptionEn: 'Operating vehicle intoxicated by an individual lacking a valid driving license',
    descriptionRu: 'Управление ТС в состоянии опьянения лицом, не имеющим права управления ТС',
    baseFineAzn: 800,
    maxFineAzn: 800,
    penaltyPoints: 0,
    suspensionMonthsMin: 0,
    suspensionMonthsMax: 0,
    arrestDaysMax: 15,
    impoundMandatory: true,
    legalBasis: 'AR İXM Maddə 333.3'
  },
  article_333_4: {
    article: 'article_333_4',
    titleAz: 'İXM Maddə 333.4: 1 İl Ərzində Təkrar Sərxoşluq',
    titleEn: 'Article 333.4: Repeat Offense within 1 Year',
    titleRu: 'Статья 333.4: Повторное нетрезвое вождение в течение 1 года',
    descriptionAz: 'İnzibati tənbeh almış şəxs tərəfindən 1 il ərzində təkrarən sərxoş idarəetmə',
    descriptionEn: 'Committing intoxicated driving again within 1 year of administrative sanction',
    descriptionRu: 'Повторное совершение правонарушения по статье 333.1 в течение одного года',
    baseFineAzn: 500,
    maxFineAzn: 500,
    penaltyPoints: 0,
    suspensionMonthsMin: 24,
    suspensionMonthsMax: 24,
    arrestDaysMax: 0,
    impoundMandatory: true,
    legalBasis: 'AR İXM Maddə 333.4 (2 il məhrumetmə)'
  },
  article_333_5: {
    article: 'article_333_5',
    titleAz: 'İXM Maddə 333.5: Zədə ilə Təkrar Sərxoş İdarəetmə',
    titleEn: 'Article 333.5: Repeat Offense with Damage within 1 Year',
    titleRu: 'Статья 333.5: Повторное вождение с ущербом в течение 1 года',
    descriptionAz: '333.2-ci maddədə nəzərdə tutulmuş xətanın 1 il ərzində təkrar törədilməsi',
    descriptionEn: 'Repeat offense with injury/damage within 1 year of administrative penalty',
    descriptionRu: 'Повторное причинение вреда/ущерба в нетрезвом виде в течение 1 года',
    baseFineAzn: 800,
    maxFineAzn: 800,
    penaltyPoints: 0,
    suspensionMonthsMin: 24,
    suspensionMonthsMax: 24,
    arrestDaysMax: 30,
    impoundMandatory: true,
    legalBasis: 'AR İXM Maddə 333.5 (2 il məhrumiyyət və ya 15-30 gün həbs)'
  },
  article_333_6: {
    article: 'article_333_6',
    titleAz: 'İXM Maddə 333.6: Sərnişin Daşıma / Taksi Sürücüsü',
    titleEn: 'Article 333.6: Public Transit / Taxi Driver Intoxicated',
    titleRu: 'Статья 333.6: Водитель общественного транспорта / такси в нетрезвом виде',
    descriptionAz: 'Ümumi istifadədə olan sərnişin nəqliyyatı və ya taksi avtomobilini sərxoş idarə etmə',
    descriptionEn: 'Operating public transport bus, minibus or taxi while intoxicated',
    descriptionRu: 'Управление автобусом, маршрутным такси или легковым такси в нетрезвом состоянии',
    baseFineAzn: 500,
    maxFineAzn: 500,
    penaltyPoints: 0,
    suspensionMonthsMin: 24,
    suspensionMonthsMax: 24,
    arrestDaysMax: 0,
    impoundMandatory: true,
    legalBasis: 'AR İXM Maddə 333.6 (2 il məhrumetmə)'
  },
  article_334_1: {
    article: 'article_334_1',
    titleAz: 'İXM Maddə 334.1: Müayinədən İmtina (Boyunqaçırma)',
    titleEn: 'Article 334.1: Refusal of Sobriety Examination',
    titleRu: 'Статья 334.1: Отказ от прохождения медицинского освидетельствования',
    descriptionAz: 'Polis əməkdaşının tələbi ilə sərxoşluq vəziyyətinin tibbi müayinəsindən qanunsuz imtina',
    descriptionEn: 'Unlawful refusal to undergo statutory medical intoxication examination upon police demand',
    descriptionRu: 'Невыполнение законного требования сотрудника полиции о прохождении медицинского освидетельствования',
    baseFineAzn: 400,
    maxFineAzn: 700,
    penaltyPoints: 0,
    suspensionMonthsMin: 6,
    suspensionMonthsMax: 24,
    arrestDaysMax: 0,
    impoundMandatory: true,
    legalBasis: 'AR İXM Maddə 334.1 (400-700 AZN + 6 aydan 2 ilədək məhrumetmə)'
  }
};

export function evaluateAlcoholIntoxication(bracMgL: number): {
  bacPromille: number;
  status: SobrietyLevel;
  isViolation: boolean;
  severityText: { az: string; en: string; ru: string };
  hoursToSober: number;
} {
  const safeBrac = Math.max(0, bracMgL);
  const bacPromille = Number((safeBrac * 2.0).toFixed(2));
  const isViolation = bacPromille >= STATUTORY_BAC_LIMIT_PROMILLE;
  const hoursToSober = bacPromille > 0 
    ? Number((bacPromille / METABOLIC_ELIMINATION_RATE_PROMILLE_PER_HOUR).toFixed(1))
    : 0;

  let status: SobrietyLevel = 'sober';
  let severityText = {
    az: 'Ayıq (Qanuni Normal Hədd Daxilində)',
    en: 'Sober (Within Legal Statutory Limit)',
    ru: 'Трезвый (В пределах нормы)'
  };

  if (bacPromille >= 2.50) {
    status = 'coma_risk';
    severityText = {
      az: 'Ağır Toksik Sərxoşluq / Koma Riski (≥2.50 ‰)',
      en: 'Severe Toxic Intoxication / Coma Risk (≥2.50 ‰)',
      ru: 'Тяжелейшее токсическое опьянение / Риск комы (≥2.50 ‰)'
    };
  } else if (bacPromille >= 1.50) {
    status = 'severe';
    severityText = {
      az: 'Ağır Dərəcəli Sərxoşluq (1.50–2.49 ‰)',
      en: 'Severe Intoxication (1.50–2.49 ‰)',
      ru: 'Тяжелая степень опьянения (1.50–2.49 ‰)'
    };
  } else if (bacPromille >= 0.80) {
    status = 'moderate';
    severityText = {
      az: 'Orta Dərəcəli Sərxoşluq (0.80–1.49 ‰)',
      en: 'Moderate Intoxication (0.80–1.49 ‰)',
      ru: 'Средняя степень опьянения (0.80–1.49 ‰)'
    };
  } else if (bacPromille >= STATUTORY_BAC_LIMIT_PROMILLE) {
    status = 'mild';
    severityText = {
      az: 'Yüngül Dərəcəli Sərxoşluq (0.30–0.79 ‰)',
      en: 'Mild Intoxication (0.30–0.79 ‰)',
      ru: 'Легкая степень опьянения (0.30–0.79 ‰)'
    };
  }

  return {
    bacPromille,
    status,
    isViolation,
    severityText,
    hoursToSober
  };
}

export function calculateClinicalImpairment(failedTestIds: string[], totalTestsCount = 10): {
  failedCount: number;
  totalTests: number;
  impairmentScore: number;
  clinicalPass: boolean;
} {
  const failedCount = failedTestIds.length;
  const impairmentScore = Math.min(100, Math.round((failedCount / Math.max(1, totalTestsCount)) * 100));
  // A clinical pass requires failing at most 1 minor test
  const clinicalPass = failedCount <= 1;

  return {
    failedCount,
    totalTests: totalTestsCount,
    impairmentScore,
    clinicalPass
  };
}

export function calculateSobrietySanctions(params: {
  article: SanctionArticle;
  bracMgL: number;
  detectedDrugs: DrugSubstanceId[];
  refusal: boolean;
  currency?: 'AZN' | 'USD' | 'EUR';
}): {
  fineAzn: number;
  convertedFine: number;
  penaltyPoints: number;
  suspensionMonths: number;
  arrestDaysMax: number;
  impoundMandatory: boolean;
  isIntoxicated: boolean;
  legalBasis: string;
} {
  const rule = SANCTION_RULES[params.article] || SANCTION_RULES.article_333_1;
  const alcoholEval = evaluateAlcoholIntoxication(params.bracMgL);
  const isAlcoholIntoxicated = alcoholEval.isViolation;
  const isDrugIntoxicated = params.detectedDrugs.length > 0;
  const isIntoxicated = isAlcoholIntoxicated || isDrugIntoxicated || params.refusal;

  let fineAzn = 0;
  let penaltyPoints = 0;
  let suspensionMonths = 0;
  let arrestDaysMax = 0;
  let impoundMandatory = false;

  if (params.refusal) {
    fineAzn = rule.baseFineAzn;
    penaltyPoints = rule.penaltyPoints;
    suspensionMonths = rule.suspensionMonthsMin;
    arrestDaysMax = rule.arrestDaysMax;
    impoundMandatory = true;
  } else if (isIntoxicated) {
    fineAzn = rule.baseFineAzn;
    penaltyPoints = rule.penaltyPoints;
    suspensionMonths = rule.suspensionMonthsMin;
    arrestDaysMax = rule.arrestDaysMax;
    impoundMandatory = true;
  }

  const currencyRates = { AZN: 1.0, USD: 1.70, EUR: 1.85 };
  const targetCurrency = params.currency || 'AZN';
  const rate = currencyRates[targetCurrency] || 1.0;
  const convertedFine = Number((fineAzn / rate).toFixed(2));

  return {
    fineAzn,
    convertedFine,
    penaltyPoints,
    suspensionMonths,
    arrestDaysMax,
    impoundMandatory,
    isIntoxicated,
    legalBasis: rule.legalBasis
  };
}

export function generateSobrietyProtocolNumber(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `DIN-RNM-2026-${randomSuffix}`;
}

export function formatPlate(plate: string): string {
  const cleaned = plate.replace(/\s+/g, '').toUpperCase();
  if (cleaned.length >= 7 && !cleaned.includes('-')) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
  }
  return plate.toUpperCase();
}

export function formatPromille(value: number): string {
  return `${value.toFixed(2)} ‰`;
}

export function formatCurrency(amount: number, currency: 'AZN' | 'USD' | 'EUR' = 'AZN'): string {
  const symbols = {
    AZN: '₼',
    USD: '$',
    EUR: '€'
  };
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbols[currency] || '₼'}`;
}
