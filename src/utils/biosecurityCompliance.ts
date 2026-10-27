/**
 * AQTA, DGK & Ministry of Agriculture Border Biosecurity, Veterinary & Phytosanitary Quarantine Control,
 * ATP Agreement Perishable Cold-Chain (Reefer) Telemetry & Official AQTA-BIO-2026 Biosecurity Clearance Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Food Safety" (Qida təhlükəsizliyi haqqında AR Qanunu)
 * - UNECE ATP Agreement on the International Carriage of Perishable Foodstuffs
 * - Customs Code of the Republic of Azerbaijan (Border Sanitary & Phytosanitary Controls)
 * - World Organisation for Animal Health (WOAH / OIE) Terrestrial Animal Health Code
 * - International Plant Protection Convention (IPPC / ISPM 15 & ISPM 12)
 * - Cabinet of Ministers Decisions on State Duties for Veterinary & Phytosanitary Quarantine Services
 * - EN 12830 / EN 13486 Temperature Recorders for the Transport of Chilled & Frozen Foods
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD (1.70 AZN / USD)
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR (1.84 AZN / EUR)
};

/**
 * UNECE ATP Agreement Refrigerator Classes
 */
export type AtpClass = 'FRC' | 'FNA' | 'FRA' | 'RRC' | 'IN';

export interface AtpClassMetadata {
  id: AtpClass;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  minTempC: number;
  maxTempC: number;
  maxKValue: number; // Heat transfer coefficient W/(m²·K)
  descriptionAz: string;
  descriptionEn: string;
}

export const ATP_CLASSES_INFO: Record<AtpClass, AtpClassMetadata> = {
  FRC: {
    id: 'FRC',
    code: 'ATP-FRC',
    nameAz: 'FRC: Gücləndirilmiş İzolyasiyalı Mexaniki Soyuducu (-20°C ... +12°C)',
    nameEn: 'FRC: Heavy Insulated Mechanically Refrigerated (-20°C to +12°C)',
    nameRu: 'FRC: Усиленная изоляция с механическим охлаждением (-20°C до +12°C)',
    minTempC: -20,
    maxTempC: 12,
    maxKValue: 0.40,
    descriptionAz: 'Dondurulmuş ət, quş əti, dəniz məhsulları və dondurma üçün ən yüksək standartlı beynəlxalq reefer.',
    descriptionEn: 'Heavy insulation refrigerated transport suitable for deep-frozen meat, poultry, fish, and dairy.',
  },
  FNA: {
    id: 'FNA',
    code: 'ATP-FNA',
    nameAz: 'FNA: Normal İzolyasiyalı Soyuducu (0°C ... +12°C)',
    nameEn: 'FNA: Normally Insulated Refrigerated (0°C to +12°C)',
    nameRu: 'FNA: Обычная изоляция с охлаждением (0°C до +12°C)',
    minTempC: 0,
    maxTempC: 12,
    maxKValue: 0.70,
    descriptionAz: 'Təzə meyvə, tərəvəz, süd məhsulları və çiçəklərin daşınması üçün standart soyuducu.',
    descriptionEn: 'Standard refrigeration for fresh fruit, vegetables, dairy products, and flowers.',
  },
  FRA: {
    id: 'FRA',
    code: 'ATP-FRA',
    nameAz: 'FRA: Gücləndirilmiş İzolyasiyalı Soyuducu (0°C ... +12°C)',
    nameEn: 'FRA: Heavy Insulated Refrigerated (0°C to +12°C)',
    nameRu: 'FRA: Усиленная изоляция с охлаждением (0°C до +12°C)',
    minTempC: 0,
    maxTempC: 12,
    maxKValue: 0.40,
    descriptionAz: 'Yüksək istilik izolyasiyalı reefer, zərif giləmeyvə və həssas əczaçılıq preparatları üçün.',
    descriptionEn: 'High thermal retention reefer for sensitive berries, chilled meat, and pharmaceutical vaccines.',
  },
  RRC: {
    id: 'RRC',
    code: 'ATP-RRC',
    nameAz: 'RRC: Çoxkameralı İkitemperaturlu Reefer (-20°C ... +12°C)',
    nameEn: 'RRC: Multi-Compartment Dual-Temperature Reefer (-20°C to +12°C)',
    nameRu: 'RRC: Многокамерный двухтемпературный рефрижератор (-20°C до +12°C)',
    minTempC: -20,
    maxTempC: 12,
    maxKValue: 0.40,
    descriptionAz: 'Arakəsməli qoşa buxarlandırıcılı furqon (eyni reysdə dondurulmuş və soyudulmuş yük kombinasiyası).',
    descriptionEn: 'Multi-zone partition reefer allowing simultaneous deep-frozen and chilled cargo transit.',
  },
  IN: {
    id: 'IN',
    code: 'ATP-IN',
    nameAz: 'IN: İzotermik Furqon (Mexaniki Aqreqatsız)',
    nameEn: 'IN: Isothermal Van (Passive Insulated, No Active Unit)',
    nameRu: 'IN: Изотермический фургон (без холодильного агрегата)',
    minTempC: 5,
    maxTempC: 25,
    maxKValue: 0.70,
    descriptionAz: 'Qısa məsafəli şəhərdaxili daşımalar və passiv istilik saxlama üçün izotermik gövdə.',
    descriptionEn: 'Passive insulated body for short-range transit without active refrigeration compressor.',
  },
};

/**
 * Perishable Cargo Types & Temperature Standards
 */
export type PerishableCargoType =
  | 'DEEP_FROZEN_MEAT'
  | 'CHILLED_BEEF_LAMB'
  | 'FRESH_DAIRY'
  | 'FRESH_FRUITS_VEG'
  | 'TROPICAL_BANANAS'
  | 'SEAFOOD_FRESH_FISH'
  | 'ICE_CREAM_FROZEN_CONFECTIONERY'
  | 'VACCINES_BIOMEDICAL';

export interface PerishableCargoMetadata {
  id: PerishableCargoType;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  targetTempC: number;
  minAllowedTempC: number;
  maxAllowedTempC: number;
  targetHumidityPercent: number;
  inspectionType: 'VETERINARY' | 'PHYTOSANITARY' | 'BIOMEDICAL';
  requiresAtpClass: AtpClass;
  shelfLifeDays: number;
}

export const PERISHABLE_CARGO_INFO: Record<PerishableCargoType, PerishableCargoMetadata> = {
  DEEP_FROZEN_MEAT: {
    id: 'DEEP_FROZEN_MEAT',
    nameAz: 'Dərin Dondurulmuş Ət və Quş Əti',
    nameEn: 'Deep-Frozen Meat & Poultry',
    nameRu: 'Глубокозамороженное мясо и птица',
    targetTempC: -18,
    minAllowedTempC: -25,
    maxAllowedTempC: -15,
    targetHumidityPercent: 85,
    inspectionType: 'VETERINARY',
    requiresAtpClass: 'FRC',
    shelfLifeDays: 365,
  },
  CHILLED_BEEF_LAMB: {
    id: 'CHILLED_BEEF_LAMB',
    nameAz: 'Soyudulmuş Mal və Qoyun Əti',
    nameEn: 'Chilled Fresh Beef & Lamb',
    nameRu: 'Охлажденная говядина и баранина',
    targetTempC: 2,
    minAllowedTempC: 0,
    maxAllowedTempC: 4,
    targetHumidityPercent: 90,
    inspectionType: 'VETERINARY',
    requiresAtpClass: 'FRC',
    shelfLifeDays: 21,
  },
  FRESH_DAIRY: {
    id: 'FRESH_DAIRY',
    nameAz: 'Təzə Süd, Qatıq və Pendir Məhsulları',
    nameEn: 'Fresh Dairy, Yogurt & Cheese',
    nameRu: 'Свежая молочная продукция, йогурт и сыр',
    targetTempC: 4,
    minAllowedTempC: 2,
    maxAllowedTempC: 6,
    targetHumidityPercent: 75,
    inspectionType: 'VETERINARY',
    requiresAtpClass: 'FNA',
    shelfLifeDays: 14,
  },
  FRESH_FRUITS_VEG: {
    id: 'FRESH_FRUITS_VEG',
    nameAz: 'Təzə Meyvə-Tərəvəz (Alma, Gilas, Pomidor)',
    nameEn: 'Fresh Fruits & Vegetables (Apples, Cherries, Tomatoes)',
    nameRu: 'Свежие фрукты и овощи (Яблоки, черешня, томаты)',
    targetTempC: 5,
    minAllowedTempC: 3,
    maxAllowedTempC: 8,
    targetHumidityPercent: 92,
    inspectionType: 'PHYTOSANITARY',
    requiresAtpClass: 'FNA',
    shelfLifeDays: 30,
  },
  TROPICAL_BANANAS: {
    id: 'TROPICAL_BANANAS',
    nameAz: 'Tropik Banan və Sitrus (Soyuq Zədəsi Riski)',
    nameEn: 'Tropical Bananas & Citrus (Chilling Injury Risk <12°C)',
    nameRu: 'Тропические бананы и цитрусовые (Риск переохлаждения)',
    targetTempC: 13.5,
    minAllowedTempC: 13.0,
    maxAllowedTempC: 15.0,
    targetHumidityPercent: 90,
    inspectionType: 'PHYTOSANITARY',
    requiresAtpClass: 'FNA',
    shelfLifeDays: 28,
  },
  SEAFOOD_FRESH_FISH: {
    id: 'SEAFOOD_FRESH_FISH',
    nameAz: 'Təzə Balıq və Dəniz Məhsulları (Buz Üzərində)',
    nameEn: 'Fresh Fish & Seafood (On Crushed Ice)',
    nameRu: 'Свежая рыба и морепродукты (на колотом льду)',
    targetTempC: 1,
    minAllowedTempC: 0,
    maxAllowedTempC: 2,
    targetHumidityPercent: 95,
    inspectionType: 'VETERINARY',
    requiresAtpClass: 'FRC',
    shelfLifeDays: 7,
  },
  ICE_CREAM_FROZEN_CONFECTIONERY: {
    id: 'ICE_CREAM_FROZEN_CONFECTIONERY',
    nameAz: 'Dondurma və Ultra-Dondurulmuş Qənnadı',
    nameEn: 'Ice Cream & Ultra-Frozen Confectionery',
    nameRu: 'Мороженое и ультразамороженные десерты',
    targetTempC: -22,
    minAllowedTempC: -28,
    maxAllowedTempC: -18,
    targetHumidityPercent: 80,
    inspectionType: 'VETERINARY',
    requiresAtpClass: 'FRC',
    shelfLifeDays: 180,
  },
  VACCINES_BIOMEDICAL: {
    id: 'VACCINES_BIOMEDICAL',
    nameAz: 'Biotibbi Preparatlar və Peyvəndlər (Soyuq Zəncir)',
    nameEn: 'Biomedical Vaccines & Temperature-Sensitive Pharma',
    nameRu: 'Биомедицинские вакцины и термочувствительные фармпрепараты',
    targetTempC: 4,
    minAllowedTempC: 2,
    maxAllowedTempC: 6,
    targetHumidityPercent: 60,
    inspectionType: 'BIOMEDICAL',
    requiresAtpClass: 'FRA',
    shelfLifeDays: 60,
  },
};

/**
 * Disinfection Barrier & Sanitization Telemetry
 */
export type DisinfectantAgent = 'QUATERNARY_AMMONIUM' | 'CHLORINE_DIOXIDE' | 'PERACETIC_ACID';

export interface DisinfectionBarrierConfig {
  agent: DisinfectantAgent;
  agentConcentrationPpm: number;
  nozzlePressureBar: number;
  archPassageSpeedKmh: number;
  contactTimeMinutes: number;
  undercarriageCoveragePercent: number;
}

export const DISINFECTANT_AGENTS_INFO: Record<
  DisinfectantAgent,
  { nameAz: string; nameEn: string; recommendedPpm: number; minContactMins: number }
> = {
  QUATERNARY_AMMONIUM: {
    nameAz: 'Dördlü Ammonium Birləşməsi (QAC / Dezisan)',
    nameEn: 'Quaternary Ammonium Compound (QAC)',
    recommendedPpm: 1200,
    minContactMins: 3,
  },
  CHLORINE_DIOXIDE: {
    nameAz: 'Xlor Dioksid (ClO₂ / Geniş Spektrli Virulensiya)',
    nameEn: 'Chlorine Dioxide (ClO₂ High-Grade Virucidal)',
    recommendedPpm: 500,
    minContactMins: 2,
  },
  PERACETIC_ACID: {
    nameAz: 'Peruksus Turşusu (PAA / Ekoloji Parçalanan)',
    nameEn: 'Peracetic Acid (PAA Bio-Degradable)',
    recommendedPpm: 800,
    minContactMins: 4,
  },
};

/**
 * Quarantine Lab Screen Parameters
 */
export interface QuarantineLabScreen {
  pestInspectionPassed: boolean;
  bacterialPathogenCountCfu: number; // CFU/g (Colony Forming Units)
  pesticideMrlPercent: number; // Maximum Residue Limit compliance % (must be <= 100%)
  veterinaryAntibioticResiduePpb: number; // parts per billion (threshold <= 50 ppb)
  gmoStatus: 'NEGATIVE' | 'POSITIVE_DECLARED' | 'POSITIVE_UNDECLARED';
  samplingVialCode: string;
}

/**
 * Cost Calculation Options
 */
export interface BiosecurityFeeOptions {
  cargoType: PerishableCargoType;
  atpClass: AtpClass;
  cargoWeightTons: number;
  isTransitOnly: boolean;
  requiresExpressPcr: boolean;
  requiresDisinfectionBarrier: boolean;
  currency: Currency;
}

export interface BiosecurityFeeBreakdown {
  disinfectionFeeAzn: number;
  veterinaryDutyAzn: number;
  phytosanitaryDutyAzn: number;
  atpCalibrationAuditFeeAzn: number;
  labPcrAnalysisFeeAzn: number;
  subtotalAzn: number;
  vat18Azn: number;
  totalAzn: number;
  totalConverted: number;
  currency: Currency;
}

/**
 * Check Cold-Chain Temperature Compliance
 */
export interface TemperatureAuditResult {
  isCompliant: boolean;
  deviationC: number;
  targetTempC: number;
  currentTempC: number;
  alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL';
  statusMessageAz: string;
  statusMessageEn: string;
}

export function evaluateColdChainCompliance(
  cargoType: PerishableCargoType,
  currentTempC: number
): TemperatureAuditResult {
  const meta = PERISHABLE_CARGO_INFO[cargoType];
  const target = meta.targetTempC;
  const deviation = Math.round((currentTempC - target) * 10) / 10;

  if (currentTempC >= meta.minAllowedTempC && currentTempC <= meta.maxAllowedTempC) {
    return {
      isCompliant: true,
      deviationC: deviation,
      targetTempC: target,
      currentTempC,
      alertLevel: 'NORMAL',
      statusMessageAz: `Temperatur normativ daxilindədir (${meta.minAllowedTempC}°C ... ${meta.maxAllowedTempC}°C). Soyuq zəncir tam qorunub.`,
      statusMessageEn: `Temperature is within statutory limits (${meta.minAllowedTempC}°C to ${meta.maxAllowedTempC}°C). Cold-chain fully preserved.`,
    };
  }

  const isSevere =
    currentTempC < meta.minAllowedTempC - 2.5 || currentTempC > meta.maxAllowedTempC + 2.5;

  return {
    isCompliant: false,
    deviationC: deviation,
    targetTempC: target,
    currentTempC,
    alertLevel: isSevere ? 'CRITICAL' : 'WARNING',
    statusMessageAz: isSevere
      ? `KRİTİK TEMPERATUR POZUNTUSU! Tələb olunan: ${meta.minAllowedTempC}°C ... ${meta.maxAllowedTempC}°C. Mövcud: ${currentTempC}°C. Yük karantinə alınmalıdır.`
      : `Temperatur sapması aşkarlandı (${currentTempC}°C). Yolverilən diapazon: ${meta.minAllowedTempC}°C ... ${meta.maxAllowedTempC}°C.`,
    statusMessageEn: isSevere
      ? `CRITICAL TEMPERATURE BREACH! Required: ${meta.minAllowedTempC}°C to ${meta.maxAllowedTempC}°C. Actual: ${currentTempC}°C. Cargo must be quarantined.`
      : `Temperature excursion detected (${currentTempC}°C). Permissible range: ${meta.minAllowedTempC}°C to ${meta.maxAllowedTempC}°C.`,
  };
}

/**
 * Disinfection Barrier Evaluation
 */
export interface DisinfectionBarrierResult {
  passed: boolean;
  coverageScore: number; // 0 - 100
  effectiveBiosecurity: boolean;
  notesAz: string;
  notesEn: string;
}

export function evaluateDisinfectionBarrier(config: DisinfectionBarrierConfig): DisinfectionBarrierResult {
  const agentMeta = DISINFECTANT_AGENTS_INFO[config.agent];
  const concentrationRatio = config.agentConcentrationPpm / agentMeta.recommendedPpm;
  const speedCompliant = config.archPassageSpeedKmh <= 10;
  const pressureCompliant = config.nozzlePressureBar >= 25 && config.nozzlePressureBar <= 60;
  const coverageCompliant = config.undercarriageCoveragePercent >= 90;
  const timeCompliant = config.contactTimeMinutes >= agentMeta.minContactMins;

  let score = 0;
  if (concentrationRatio >= 0.9) score += 25;
  if (speedCompliant) score += 20;
  if (pressureCompliant) score += 20;
  if (coverageCompliant) score += 20;
  if (timeCompliant) score += 15;

  const passed = score >= 80;

  return {
    passed,
    coverageScore: score,
    effectiveBiosecurity: passed && coverageCompliant,
    notesAz: passed
      ? 'Dezinfeksiya çəpəri və şassi yuyulması uğurla tamamlandı. Patogen riski neytrallaşdırıldı.'
      : 'Dezinfeksiya normativi ödənmədi: Sürət ≤10 km/saat, təzyiq ≥25 bar və təmas müddəti təmin edilməlidir.',
    notesEn: passed
      ? 'Biosecurity disinfection arch and undercarriage wash passed. Pathogenic risks neutralized.'
      : 'Disinfection standards not met: Speed must be ≤10 km/h, pressure ≥25 bar, and contact time observed.',
  };
}

/**
 * Calculate Statutory Biosecurity & Quarantine Duties
 */
export function calculateBiosecurityFees(options: BiosecurityFeeOptions): BiosecurityFeeBreakdown {
  const cargoMeta = PERISHABLE_CARGO_INFO[options.cargoType];

  // Base state duties under Cabinet of Ministers regulations
  const disinfectionFeeAzn = options.requiresDisinfectionBarrier ? (options.cargoWeightTons > 12 ? 30 : 20) : 0;
  const veterinaryDutyAzn = cargoMeta.inspectionType === 'VETERINARY' ? 40 : 0;
  const phytosanitaryDutyAzn = cargoMeta.inspectionType === 'PHYTOSANITARY' ? 35 : 0;
  const atpCalibrationAuditFeeAzn = 25; // Continuous thermo-recorder verification
  const labPcrAnalysisFeeAzn = options.requiresExpressPcr ? 50 : 0;

  const subtotalAzn =
    disinfectionFeeAzn +
    veterinaryDutyAzn +
    phytosanitaryDutyAzn +
    atpCalibrationAuditFeeAzn +
    labPcrAnalysisFeeAzn;

  // 18% VAT applies to disinfection and lab analysis service charges (not pure state duty)
  const taxableServices = disinfectionFeeAzn + atpCalibrationAuditFeeAzn + labPcrAnalysisFeeAzn;
  const vat18Azn = Math.round(taxableServices * 0.18 * 100) / 100;
  const totalAzn = Math.round((subtotalAzn + vat18Azn) * 100) / 100;

  const rate = CURRENCY_RATES[options.currency] || 1.0;
  const totalConverted = Math.round(totalAzn * rate * 100) / 100;

  return {
    disinfectionFeeAzn,
    veterinaryDutyAzn,
    phytosanitaryDutyAzn,
    atpCalibrationAuditFeeAzn,
    labPcrAnalysisFeeAzn,
    subtotalAzn,
    vat18Azn,
    totalAzn,
    totalConverted,
    currency: options.currency,
  };
}

/**
 * Format Currency Amount
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    AZN: '₼',
    USD: '$',
    EUR: '€',
  };
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbols[currency]}`;
}

/**
 * Generate Secure Certificate Serial: AQTA-BIO-2026-XXXXX
 */
export function generateCertificateSerial(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
  return `AQTA-BIO-2026-${randomSuffix}`;
}

/**
 * Generate SHA-256 Mock Hash for Electronic Certificate
 */
export function generateCertificateHash(serial: string, plate: string): string {
  let hash = 0;
  const str = `${serial}:${plate}:AQTA:AZ:2026:ATP:RECL:BIOSECURITY`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}9a4b8f1c${hex.split('').reverse().join('')}e2`;
}
