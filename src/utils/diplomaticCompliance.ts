export type DiplomaticCategory = 'CD' | 'D' | 'T' | 'CC' | 'HON';

export type DiplomaticMissionType = 'embassy' | 'consulate' | 'international_org' | 'trade_representation';

export interface MissionCountry {
  code: string;
  countryAz: string;
  countryEn: string;
  countryRu: string;
  flagEmoji: string;
  headOfMissionAz: string;
  headOfMissionEn: string;
}

export interface ViennaChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  viennaArticle: string;
  required: boolean;
}

export interface DiplomaticMission {
  id: string;
  missionNameAz: string;
  missionNameEn: string;
  missionNameRu: string;
  countryCode: string;
  missionType: DiplomaticMissionType;
  addressAz: string;
  addressEn: string;
  districtAz: string;
  phone: string;
  email: string;
  liaisonOfficer: string;
  activeVehiclesCount: number;
  reservedParkingBays: number;
}

export interface DiplomaticVehiclePreset {
  id: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  plateNumber: string;
  countryCode: string;
  category: DiplomaticCategory;
  vehicleModel: string;
  engineCc: number;
  engineHp: number;
  manufactureYear: number;
  cifValueAzn: number;
  registeredMonthsAgo: number;
  flagPoleMounted: boolean;
  inviolabilityStatus: boolean;
}

export interface DiplomaticProtocolExamQuestion {
  id: number;
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
  legalCitation: string;
}

export interface DiplomaticCertificate {
  certificateNumber: string;
  issueDate: string;
  validUntil: string;
  plateNumber: string;
  countryCode: string;
  countryName: string;
  category: DiplomaticCategory;
  missionName: string;
  vehicleModel: string;
  vin: string;
  engineCc: number;
  customsExemptionStatus: string;
  savedDutiesAzn: number;
  savedDutiesUsd: number;
  savedDutiesEur: number;
  protocolOfficer: string;
  simaSignatureUid: string;
  verificationCode: string;
  inviolabilityLevel: string;
  status: 'active' | 'transfer_pending' | 'civilian_cleared' | 'revoked';
}

export const AZN_TO_USD = 0.5882;
export const AZN_TO_EUR = 0.5405;

export const DIPLOMATIC_CATEGORIES: Record<
  DiplomaticCategory,
  { labelAz: string; labelEn: string; labelRu: string; descriptionAz: string; descriptionEn: string; descriptionRu: string; immunityLevel: string }
> = {
  CD: {
    labelAz: 'CD — Corps Diplomatique (Səfir / Missiya Rəhbəri)',
    labelEn: 'CD — Corps Diplomatique (Ambassador / Head of Mission)',
    labelRu: 'CD — Corps Diplomatique (Посол / Глава Дипмиссии)',
    descriptionAz: 'Fövqəladə və Səlahiyyətli Səfirlər, Nümayəndəlik Başçıları və Nazir Elçilər üçün tam toxunulmazlıq statusu.',
    descriptionEn: 'Full diplomatic inviolability status reserved for Ambassadors Extraordinary & Plenipotentiary and Heads of Mission.',
    descriptionRu: 'Полная дипломатическая неприкосновенность для Чрезвычайных и Полномочных Послов и Глав Дипломатических Миссий.',
    immunityLevel: 'Mütləq Diplomatik Toxunulmazlıq (Vyana Konvensiyası Maddə 29, 30, 31)'
  },
  D: {
    labelAz: 'D — Diplomatik Agent (Müşavir / Attaşe / Katib)',
    labelEn: 'D — Diplomatic Agent (Counselor / Secretary / Attaché)',
    labelRu: 'D — Дипломатический Агент (Советник / Атташе / Секретарь)',
    descriptionAz: 'Müşavirlər, 1-ci/2-ci/3-cü katiblər, Hərbi və Ticarət attaşeləri və onların akkreditə olunmuş ailə üzvləri.',
    descriptionEn: 'Counselors, First/Second/Third Secretaries, Defense and Commercial Attachés, and accredited family members.',
    descriptionRu: 'Советники, секретари, военные и торговые атташе и аккредитованные члены их семей.',
    immunityLevel: 'Tam Şəxsi və Nəqliyyat Toxunulmazlığı (Vyana Konvensiyası Maddə 31, 37)'
  },
  T: {
    labelAz: 'T — İnzibati və Texniki Heyət (Dəftərxana / IT / Təhlükəsizlik)',
    labelEn: 'T — Administrative & Technical Staff (Chancellery / IT / Security)',
    labelRu: 'T — Административно-Технический Персонал (Канцелярия / IT / Охрана)',
    descriptionAz: 'Səfirlik və nümayəndəliklərin inzibati və texniki xidmət əməkdaşları üçün xidməti toxunulmazlıq.',
    descriptionEn: 'Administrative and technical personnel of diplomatic missions with official duty immunity.',
    descriptionRu: 'Служебная неприкосновенность для сотрудников административно-технического звена посольств.',
    immunityLevel: 'Xidməti Vəzifə Hədlərində İmmunitet (Vyana Konvensiyası Maddə 37.2)'
  },
  CC: {
    labelAz: 'CC — Corps Consulaire (Baş Konsul / Konsul)',
    labelEn: 'CC — Corps Consulaire (Consul General / Consul)',
    labelRu: 'CC — Corps Consulaire (Генеральный Консул / Консул)',
    descriptionAz: 'Konsulluq idarələrinin rəhbərləri, Baş konsullar və konsul əməkdaşları üçün konsulluq immuniteti.',
    descriptionEn: 'Heads of Consular posts, Consuls General, and consular officials under the 1963 Vienna Convention.',
    descriptionRu: 'Консульский иммунитет для глав консульских учреждений и генеральных консулов.',
    immunityLevel: 'Konsulluq İmmuniteti (1963-cü il Vyana Konsulluq Konvensiyası Maddə 43)'
  },
  HON: {
    labelAz: 'HON — Fəxri Konsul (Honorary Consul)',
    labelEn: 'HON — Honorary Consul',
    labelRu: 'HON — Почетный Консул',
    descriptionAz: 'Azərbaycan Respublikasında təyin olunmuş Fəxri Konsulluqların rəsmi xidməti avtomobilləri.',
    descriptionEn: 'Official service vehicles assigned to accredited Honorary Consular Posts in Azerbaijan.',
    descriptionRu: 'Служебный транспорт аккредитованных Почетных Консулов в Азербайджане.',
    immunityLevel: 'Xidməti Arxiv və Sənəd Toxunulmazlığı (Vyana Konvensiyası Maddə 58-62)'
  }
};

export const MISSION_COUNTRIES: MissionCountry[] = [
  { code: '001', countryAz: 'Türkiyə Cümhuriyyəti', countryEn: 'Republic of Turkey', countryRu: 'Турецкая Республика', flagEmoji: '🇹🇷', headOfMissionAz: 'Fövqəladə və Səlahiyyətli Səfir', headOfMissionEn: 'Ambassador Extraordinary and Plenipotentiary' },
  { code: '002', countryAz: 'Amerika Birləşmiş Ştatları', countryEn: 'United States of America', countryRu: 'Соединенные Штаты Америки', flagEmoji: '🇺🇸', headOfMissionAz: 'Fövqəladə və Səlahiyyətli Səfir', headOfMissionEn: 'Ambassador Extraordinary and Plenipotentiary' },
  { code: '003', countryAz: 'Rusiya Federasiyası', countryEn: 'Russian Federation', countryRu: 'Российская Федерация', flagEmoji: '🇷🇺', headOfMissionAz: 'Fövqəladə və Səlahiyyətli Səfir', headOfMissionEn: 'Ambassador Extraordinary and Plenipotentiary' },
  { code: '004', countryAz: 'İran İslam Respublikası', countryEn: 'Islamic Republic of Iran', countryRu: 'Исламская Республика Иран', flagEmoji: '🇮🇷', headOfMissionAz: 'Fövqəladə və Səlahiyyətli Səfir', headOfMissionEn: 'Ambassador Extraordinary and Plenipotentiary' },
  { code: '005', countryAz: 'Böyük Britaniya Krallığı', countryEn: 'United Kingdom', countryRu: 'Великобритания', flagEmoji: '🇬🇧', headOfMissionAz: 'Fövqəladə və Səlahiyyətli Səfir', headOfMissionEn: 'Ambassador Extraordinary and Plenipotentiary' },
  { code: '006', countryAz: 'Almaniya Federativ Respublikası', countryEn: 'Federal Republic of Germany', countryRu: 'Федеративная Республика Германия', flagEmoji: '🇩🇪', headOfMissionAz: 'Fövqəladə və Səlahiyyətli Səfir', headOfMissionEn: 'Ambassador Extraordinary and Plenipotentiary' },
  { code: '007', countryAz: 'Fransa Respublikası', countryEn: 'French Republic', countryRu: 'Французская Республика', flagEmoji: '🇫🇷', headOfMissionAz: 'Fövqəladə və Səlahiyyətli Səfir', headOfMissionEn: 'Ambassador Extraordinary and Plenipotentiary' },
  { code: '010', countryAz: 'Birləşmiş Millətlər Təşkilatı (BMT)', countryEn: 'United Nations (UN)', countryRu: 'Организация Объединенных Наций (ООН)', flagEmoji: '🇺🇳', headOfMissionAz: 'Rezident Əlaqələndirici', headOfMissionEn: 'Resident Coordinator' },
  { code: '025', countryAz: 'Avropa İttifaqı Nümayəndəliyi', countryEn: 'Delegation of the European Union', countryRu: 'Представительство Европейского Союза', flagEmoji: '🇪🇺', headOfMissionAz: 'Nümayəndəlik Rəhbəri / Səfir', headOfMissionEn: 'Head of Delegation / Ambassador' },
  { code: '030', countryAz: 'İtaliya Respublikası', countryEn: 'Italian Republic', countryRu: 'Итальянская Республика', flagEmoji: '🇮🇹', headOfMissionAz: 'Fövqəladə və Səlahiyyətli Səfir', headOfMissionEn: 'Ambassador Extraordinary and Plenipotentiary' }
];

export function formatDiplomaticPlate(countryCode: string, category: DiplomaticCategory, sequence: string | number): string {
  const paddedCode = countryCode.padStart(3, '0');
  const paddedSeq = String(sequence).padStart(3, '0');
  return `${paddedCode} ${category} ${paddedSeq}`;
}

export function parseDiplomaticPlate(plate: string): { countryCode: string; category: DiplomaticCategory | null; sequence: string; isValid: boolean } {
  const clean = plate.trim().toUpperCase().replace(/\s+/g, ' ');
  const parts = clean.split(' ');
  if (parts.length === 3) {
    const [code, cat, seq] = parts;
    const isValidCategory = ['CD', 'D', 'T', 'CC', 'HON'].includes(cat);
    const isValidCode = /^\d{3}$/.test(code);
    const isValidSeq = /^\d{3}$/.test(seq);
    if (isValidCategory && isValidCode && isValidSeq) {
      return {
        countryCode: code,
        category: cat as DiplomaticCategory,
        sequence: seq,
        isValid: true
      };
    }
  }
  return {
    countryCode: '',
    category: null,
    sequence: '',
    isValid: false
  };
}

export function calculateDiplomaticCustomsExemption(
  cifValueAzn: number,
  engineCc: number,
  vehicleAgeYears: number = 1
): { baseDutyAzn: number; exciseTaxAzn: number; vatAzn: number; totalSavedDutiesAzn: number } {
  const safeCif = Math.max(1000, cifValueAzn);
  const safeCc = Math.max(500, engineCc);
  const safeAge = Math.max(0, vehicleAgeYears);

  // Statutory Azerbaijan Customs Tariff estimation:
  // Base duty: 15% of CIF + 0.40 AZN per cc if vehicle age > 1 year
  const baseDutyRate = 0.15;
  const ccTariff = safeAge > 1 ? safeCc * 0.4 : safeCc * 0.2;
  const baseDutyAzn = Math.round(safeCif * baseDutyRate + ccTariff);

  // Excise duty (Mülki aksiz vergisi):
  // Up to 2000 cc: 0.20 AZN/cc
  // 2001 - 3000 cc: 400 AZN + 3.0 AZN/cc above 2000
  // 3001 - 4000 cc: 3400 AZN + 8.0 AZN/cc above 3000
  // Above 4000 cc: 11400 AZN + 15.0 AZN/cc above 4000
  let exciseTaxAzn = 0;
  if (safeCc <= 2000) {
    exciseTaxAzn = safeCc * 0.2;
  } else if (safeCc <= 3000) {
    exciseTaxAzn = 400 + (safeCc - 2000) * 3.0;
  } else if (safeCc <= 4000) {
    exciseTaxAzn = 3400 + (safeCc - 3000) * 8.0;
  } else {
    exciseTaxAzn = 11400 + (safeCc - 4000) * 15.0;
  }
  exciseTaxAzn = Math.round(exciseTaxAzn);

  // VAT 18% on (CIF + Duty + Excise)
  const taxableBase = safeCif + baseDutyAzn + exciseTaxAzn;
  const vatAzn = Math.round(taxableBase * 0.18);

  const totalSavedDutiesAzn = baseDutyAzn + exciseTaxAzn + vatAzn;

  return {
    baseDutyAzn,
    exciseTaxAzn,
    vatAzn,
    totalSavedDutiesAzn
  };
}

export function calculateCivilianResaleDuties(
  cifValueAzn: number,
  engineCc: number,
  vehicleAgeYears: number,
  monthsInDiplomaticService: number
): {
  totalCivilianDutyAzn: number;
  payablePercentage: number;
  remainingPayableDutyAzn: number;
  isFullyExempt: boolean;
} {
  const { totalSavedDutiesAzn } = calculateDiplomaticCustomsExemption(cifValueAzn, engineCc, vehicleAgeYears);

  // Resale amortization rules under Azerbaijan Customs Code (Diplomatic Exemptions):
  // 0 - 12 months: 100% of duties payable
  // 13 - 24 months: 80% payable
  // 25 - 36 months: 60% payable
  // 37 - 48 months: 40% payable
  // 49 - 60 months: 20% payable
  // 60+ months (5+ years): 0% (Fully exempt)
  let payablePercentage = 100;
  if (monthsInDiplomaticService >= 60) {
    payablePercentage = 0;
  } else if (monthsInDiplomaticService >= 48) {
    payablePercentage = 20;
  } else if (monthsInDiplomaticService >= 36) {
    payablePercentage = 40;
  } else if (monthsInDiplomaticService >= 24) {
    payablePercentage = 60;
  } else if (monthsInDiplomaticService >= 12) {
    payablePercentage = 80;
  }

  const remainingPayableDutyAzn = Math.round((totalSavedDutiesAzn * payablePercentage) / 100);
  const isFullyExempt = payablePercentage === 0;

  return {
    totalCivilianDutyAzn: totalSavedDutiesAzn,
    payablePercentage,
    remainingPayableDutyAzn,
    isFullyExempt
  };
}

export function calculateProtocolChecklistScore(
  checkedIds: string[],
  allItems: ViennaChecklistItem[]
): { scorePercentage: number; allMandatoryMet: boolean; missingMandatoryCount: number } {
  if (allItems.length === 0) {
    return { scorePercentage: 100, allMandatoryMet: true, missingMandatoryCount: 0 };
  }

  const mandatoryItems = allItems.filter(item => item.required);
  const missingMandatory = mandatoryItems.filter(item => !checkedIds.includes(item.id));

  const checkedCount = checkedIds.filter(id => allItems.some(i => i.id === id)).length;
  const scorePercentage = Math.round((checkedCount / allItems.length) * 100);

  return {
    scorePercentage,
    allMandatoryMet: missingMandatory.length === 0,
    missingMandatoryCount: missingMandatory.length
  };
}

export function generateDiplomaticCertificateNumber(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `XIN-DIP-2026-${randomSuffix}`;
}

export function convertCurrency(amountAzn: number, currency: 'AZN' | 'USD' | 'EUR'): number {
  if (currency === 'USD') return Math.round(amountAzn * AZN_TO_USD);
  if (currency === 'EUR') return Math.round(amountAzn * AZN_TO_EUR);
  return amountAzn;
}

export function filterDiplomaticMissions(
  missions: DiplomaticMission[],
  searchQuery: string,
  typeFilter: string
): DiplomaticMission[] {
  const query = searchQuery.trim().toLowerCase();
  return missions.filter(m => {
    const matchesSearch =
      !query ||
      m.missionNameAz.toLowerCase().includes(query) ||
      m.missionNameEn.toLowerCase().includes(query) ||
      m.countryCode.includes(query) ||
      m.districtAz.toLowerCase().includes(query);

    const matchesType = typeFilter === 'all' || m.missionType === typeFilter;
    return matchesSearch && matchesType;
  });
}

export function filterDiplomaticCertificates(
  certs: DiplomaticCertificate[],
  searchQuery: string
): DiplomaticCertificate[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return certs;
  return certs.filter(c =>
    c.certificateNumber.toLowerCase().includes(query) ||
    c.plateNumber.toLowerCase().includes(query) ||
    c.countryName.toLowerCase().includes(query) ||
    c.vin.toLowerCase().includes(query) ||
    c.missionName.toLowerCase().includes(query)
  );
}

export function createDiplomaticCertificate(params: {
  countryCode: string;
  category: DiplomaticCategory;
  sequence: string | number;
  missionName: string;
  vehicleModel: string;
  vin: string;
  engineCc: number;
  cifValueAzn: number;
  protocolOfficer?: string;
}): DiplomaticCertificate {
  const country = MISSION_COUNTRIES.find(c => c.code === params.countryCode) || {
    code: params.countryCode,
    countryAz: 'Beynəlxalq Nümayəndəlik',
    countryEn: 'International Representation',
    countryRu: 'Международное Представительство'
  };

  const plateNumber = formatDiplomaticPlate(params.countryCode, params.category, params.sequence);
  const { totalSavedDutiesAzn } = calculateDiplomaticCustomsExemption(params.cifValueAzn, params.engineCc, 1);

  const certNumber = generateDiplomaticCertificateNumber();
  const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();

  return {
    certificateNumber: certNumber,
    issueDate: '2026-10-25',
    validUntil: '2028-10-25',
    plateNumber,
    countryCode: params.countryCode,
    countryName: country.countryAz,
    category: params.category,
    missionName: params.missionName,
    vehicleModel: params.vehicleModel,
    vin: params.vin.toUpperCase(),
    engineCc: params.engineCc,
    customsExemptionStatus: '100% Tax-Free Diplomatic Exemption (DGK / XİN Birgə Reystri)',
    savedDutiesAzn: totalSavedDutiesAzn,
    savedDutiesUsd: convertCurrency(totalSavedDutiesAzn, 'USD'),
    savedDutiesEur: convertCurrency(totalSavedDutiesAzn, 'EUR'),
    protocolOfficer: params.protocolOfficer || 'T. Məmmədov (XİN Dövlət Protokolu İdarəsi Baş Məsləhətçisi)',
    simaSignatureUid: `SIMA-DIP-XIN-${randomHex}`,
    verificationCode: `VER-DIP-${params.countryCode}-${randomHex}`,
    inviolabilityLevel: DIPLOMATIC_CATEGORIES[params.category].immunityLevel,
    status: 'active'
  };
}
