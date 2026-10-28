/**
 * Official Ministry of Emergency Situations (FHN - Fövqəladə Hallar Nazirliyi),
 * State Fire Control Service (DYNX - Dövlət Yanğın Nəzarəti Xidməti) &
 * Main State Traffic Police Department (BDYP)
 * Dangerous Goods Hazardous Materials (ADR / Təhlükəli Yüklər) Tanker Hydrostatic Inspection,
 * Ex-Proof Flame Arrester Telemetry & Official ADR-AZ-2026 Vehicle Approval Portal Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Fire Safety" ("Yanğın təhlükəsizliyi haqqında" AR Qanunu,
 *   Maddə 14, 21, 28: Təhlükəli obyektlərin və texnologiyaların yanğın təhlükəsizliyi ekspertizası)
 * - Law of the Republic of Azerbaijan "On Technical Safety" ("Texniki təhlükəsizlik haqqında" AR Qanunu № 733-IQ)
 * - Law of the Republic of Azerbaijan "On Road Transport" ("Avtomobil nəqliyyatı haqqında" AR Qanunu)
 * - Resolution of the Cabinet of Ministers of the Republic of Azerbaijan No. 10
 *   ("Təhlükəli yüklərin avtomobil nəqliyyatı ilə daşınması Qaydaları")
 * - European Agreement concerning the International Carriage of Dangerous Goods by Road (UNECE ADR):
 *   * Part 6: Sisternlərin (çənlərin) hazırlanması, hidrostatik sınağı və yoxlanış tələbləri (EN 13094, EN 12493)
 *   * Part 8: Nəqliyyat heyəti, yanğınsöndürmə avadanlığı və sənədləşmə tələbləri
 *   * Part 9: Nəqliyyat vasitələrinin konstruksiya tələbləri və təsdiq edilməsi (FL, AT, EX/II, EX/III, MEMU)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *   * Maddə 323: Təhlükəli yüklərin daşınması qaydalarının pozulması (Sürücülərə 100-200 AZN, vəzifəli şəxslərə 800-1500 AZN, hüquqi şəxslərə 3000-5000 AZN)
 *   * Maddə 354: İcazəsiz və ya texniki şəhadətnaməsiz təhlükəli yük daşınması (200-500 AZN)
 *   * Maddə 96.1.4: Nəqliyyat vasitəsinin cərimə meydançasına mühafizə olunması (impoundment)
 * - ATEX / IECEx 60079 Zone 0 / Zone 1 Ex-d / Ex-e partlayışdan mühafizə və statik torpaqlama standartları
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD (1.70 AZN / USD)
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR (1.84 AZN / EUR)
};

export const convertAzn = (amountAzn: number, currency: Currency): number => {
  return amountAzn * CURRENCY_RATES[currency];
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';
  return `${amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
};

/**
 * UNECE ADR Part 9 Vehicle Type Categories
 */
export type AdrVehicleCategory =
  | 'FL'      // Flammable Liquids/Gases: Fuel road tankers, LNG/LPG, flashpoint <= 60°C
  | 'AT'      // Tanks other than FL: Toxic, Corrosive liquids, Caustic, Fertilizers
  | 'EX_II'   // Explosives transport category II (light/medium blast materials)
  | 'EX_III'  // Explosives transport category III (heavy blast materials, armored shell)
  | 'MEMU';   // Mobile Explosives Manufacturing Unit (mobile mixing & pump unit)

export interface AdrVehicleCategoryMetadata {
  id: AdrVehicleCategory;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  code: string;
  descriptionAz: string;
  mandatoryFeaturesAz: string[];
  baseInspectionFeeAzn: number;
}

export const ADR_VEHICLE_CATEGORIES: Record<AdrVehicleCategory, AdrVehicleCategoryMetadata> = {
  FL: {
    id: 'FL',
    nameAz: 'FL – Tezalışan Maye və Qaz Sisternləri (Benzin, Dizel, LPG, Qazkondensat)',
    nameEn: 'FL – Flammable Liquids & Gases Road Tankers (Petrol, Diesel, LPG)',
    nameRu: 'FL – Цистерны для легковоспламеняющихся жидкостей и газов (Бензин, Дизель, СУГ)',
    code: 'FL',
    descriptionAz: 'Alışma temperaturu 60°C-dən aşağı olan maye və qazların daşınması üçün çən və qablar daşıyan avtonəqliyyat',
    mandatoryFeaturesAz: [
      'ECE R13 Əlavə 5 retarder / daimi tormozlama sistemi',
      'Ex-d partlayışdan mühafizə olunmuş naqillər və IP54 elektrik qutuları',
      'Kabina və xarici ikiqütblü akkumulyator kəsici açarı (ADR Master Switch)',
      'Alovsöndürən tor (Flame Arrester) və qaz dövriyyə (VRU) klapanı',
      'Statik elektrik torpaqlama kontaktı (< 10 Ω)',
    ],
    baseInspectionFeeAzn: 120,
  },
  AT: {
    id: 'AT',
    nameAz: 'AT – Toksik, Aşındırıcı və Qeyri-Tezalışan Kimyəvi Maddə Sisternləri',
    nameEn: 'AT – Toxic, Corrosive & Chemical Tankers other than FL',
    nameRu: 'AT – Цистерны для токсичных и коррозионных веществ (кроме FL)',
    code: 'AT',
    descriptionAz: 'Turşu, qələvi və digər aqressiv kimyəvi reagentlərin daşınması üçün xüsusi daxili örtüklü sisternlər',
    mandatoryFeaturesAz: [
      'ABS tormoz antiblok sistemi (ECE R13)',
      'Elektrik naqillərinin bütöv qoruyucu zirehli örtüyü',
      'Korrozoyaya davamlı paslanmayan polad və ya rezin örtüklü çən',
      'Pnevmatik məsafədən idarə olunan daxili alt klapan',
    ],
    baseInspectionFeeAzn: 110,
  },
  EX_II: {
    id: 'EX_II',
    nameAz: 'EX/II – Partlayıcı Maddə Daşıyan Qapalı Avtomobillər (Sinif 1, Orta Rejim)',
    nameEn: 'EX/II – Vehicles Intended for Carriage of Explosives (Class 1)',
    nameRu: 'EX/II – Транспорт для перевозки взрывчатых веществ (Класс 1)',
    code: 'EX/II',
    descriptionAz: 'Partlayıcı maddələrin və döyüş sursatlarının təhlükəsiz daşınması üçün odadavamlı qapalı furqon',
    mandatoryFeaturesAz: [
      'Odadavamlı və istilik izolyasiyalı yük bölməsi',
      'Yanğından mühafizə ekranlı mühərrik və egzoz sistemi',
      'Kombinə edilmiş daxili qığılcımsız bərkidici avadanlıq',
    ],
    baseInspectionFeeAzn: 150,
  },
  EX_III: {
    id: 'EX_III',
    nameAz: 'EX/III – Partlayıcı Maddə Daşıyan Xüsusi Qorunmalı Avtomobillər (Sinif 1, Ağır Rejim)',
    nameEn: 'EX/III – Heavily Fortified Explosives Transport Vehicles (Class 1)',
    nameRu: 'EX/III – Специализированный бронированный транспорт для ВВ (Класс 1)',
    code: 'EX/III',
    descriptionAz: 'Yüksək təhlükəli partlayıcı maddələr, kapsullar və detonatorlar üçün gücləndirilmiş xüsusi nəqliyyat',
    mandatoryFeaturesAz: [
      'Bütöv polad hermetik və istilik sipərli furqon',
      'Yanacaq çəninin zərbəyə və yanğına qarşı xüsusi ekranı',
      'Məcburi BDYP və FHN xüsusi operativ mühafizə eskortu',
    ],
    baseInspectionFeeAzn: 200,
  },
  MEMU: {
    id: 'MEMU',
    nameAz: 'MEMU – Səyyar Partlayıcı Maddə İstehsalı və Doldurma Qurğusu (Mobil Emulsiya)',
    nameEn: 'MEMU – Mobile Explosives Manufacturing Unit',
    nameRu: 'MEMU – Мобильная смесительно-зарядная машина (MEMU)',
    code: 'MEMU',
    descriptionAz: 'Mədən və tunel qazıntıları üçün emulsiya və qranulyat partlayıcı maddələrin yerində qarışdırılması avtomobili',
    mandatoryFeaturesAz: [
      'Ayrı-ayrı xammal bölmələri üçün avtomatlaşdırılmış təcili bağlama klapanları',
      'Daxili yanğınsöndürmə avtomatı (Novec / Köpük püskürdücü)',
      'Statik elektrik və temperatur fasiləsiz telemetriya qeydiyyatı',
    ],
    baseInspectionFeeAzn: 250,
  },
};

/**
 * Tanker Hydrostatic & Shell Thickness Limits
 */
export interface TankerHydrostaticTelemetry {
  testPressureBar: number;            // Test pressure (e.g., 0.4 bar for gravity, up to 25.0 bar for LPG)
  operatingPressureBar: number;       // Operating maximum pressure
  holdingDurationMinutes: number;      // Statutory holding time (min 15-30 mins)
  pressureDropBar: number;            // Pressure drop during hold (must be <= 0.00 bar / 0% drop)
  shellThicknessMm: number;           // Measured ultrasonic shell thickness (mm)
  minNominalThicknessMm: number;      // Required nominal thickness (e.g., 4.0 - 6.0 mm)
  bottomValveClosureSeconds: number;  // Foot valve emergency shutoff pneumatic trip (must be < 5.0 s)
  shearGrooveIntact: boolean;         // Safety shear groove protection intact
}

/**
 * Ex-Proof Flame Arrester & Electrostatic Grounding Telemetry
 */
export interface FlameArresterGroundingTelemetry {
  flameArresterCleanlinessPercent: number; // Mesh cleanliness (must be >= 80%)
  pressureDropMbar: number;                // Flow resistance delta-P (normal <= 12 mbar, warning > 15 mbar)
  staticGroundResistanceOhms: number;      // Grounding reel resistance (must be <= 10.0 Ohms under ADR)
  overfillSensorOperational: boolean;      // 5-wire thermistor/optical overfill sensor active
  vaporRecoveryValveSealed: boolean;       // Stage II VRU balance valve tight
  batteryMasterSwitchOperable: boolean;    // Dual-pole isolation switch functional
}

export interface TankerComplianceEvaluation {
  isFullyCompliant: boolean;
  hydrostaticPassed: boolean;
  thicknessPassed: boolean;
  valveTripPassed: boolean;
  flameArresterPassed: boolean;
  groundingPassed: boolean;
  overallScore: number; // 0 - 100
  criticalDefectsAz: string[];
  recommendationsAz: string[];
  finesRiskAzn: number;
  statutoryLegalArticles: string[];
}

/**
 * Evaluate tanker hydrostatic and safety telemetry
 */
export const evaluateTankerCompliance = (
  hydro: TankerHydrostaticTelemetry,
  telemetry: FlameArresterGroundingTelemetry,
  category: AdrVehicleCategory
): TankerComplianceEvaluation => {
  const criticalDefectsAz: string[] = [];
  const recommendationsAz: string[] = [];
  let score = 100;
  let finesRiskAzn = 0;
  const statutoryLegalArticles: string[] = [];

  // 1. Hydrostatic pressure drop check (0 bar drop required)
  const hydrostaticPassed = hydro.pressureDropBar <= 0.01;
  if (!hydrostaticPassed) {
    criticalDefectsAz.push(
      `Sistern çəninin hidrostatik sınağında təzyiq itkisi aşkarlandı (${hydro.pressureDropBar.toFixed(2)} bar). Qeyri-hermetik sızma qəti qadağandır!`
    );
    score -= 30;
    finesRiskAzn += 2000;
    statutoryLegalArticles.push('AR Nazirlər Kabinetinin 10 saylı Qərarı (Bənd 4.6), ADR Hissə 6.8');
  }

  // 2. Shell thickness check
  const thicknessPassed = hydro.shellThicknessMm >= hydro.minNominalThicknessMm;
  if (!thicknessPassed) {
    const deficitMm = (hydro.minNominalThicknessMm - hydro.shellThicknessMm).toFixed(2);
    criticalDefectsAz.push(
      `Sistern divar qalınlığı normativdən (${hydro.minNominalThicknessMm} mm) azdır: ${hydro.shellThicknessMm} mm (çatışmazlıq: -${deficitMm} mm). Korroziya yeyilməsi yol verilən həddi keçib!`
    );
    score -= 25;
    finesRiskAzn += 1500;
    statutoryLegalArticles.push('ADR Bənd 6.8.2.1.18, EN 13094 Metal Çənlər');
  }

  // 3. Bottom valve emergency trip check (< 5.0 seconds)
  const valveTripPassed = hydro.bottomValveClosureSeconds <= 5.0 && hydro.shearGrooveIntact;
  if (!valveTripPassed) {
    if (hydro.bottomValveClosureSeconds > 5.0) {
      criticalDefectsAz.push(
        `Daxili dib təcili bağlama klapanının (Foot valve) pnevmatik bağlanma müddəti ${hydro.bottomValveClosureSeconds.toFixed(1)} san-dir (Norma: ≤ 5.0 san)!`
      );
      score -= 20;
    }
    if (!hydro.shearGrooveIntact) {
      criticalDefectsAz.push('Çən dib borusunun qəza qırılma zəif nöqtəsi (Shear groove) zədələnib və ya ləğv edilib!');
      score -= 15;
    }
    finesRiskAzn += 1000;
    statutoryLegalArticles.push('ADR Bənd 6.8.2.2.2, İXM Maddə 323');
  }

  // 4. Flame Arrester check (Mesh cleanliness >= 80% and deltaP <= 15 mbar)
  const flameArresterPassed =
    telemetry.flameArresterCleanlinessPercent >= 80 && telemetry.pressureDropMbar <= 15;
  if (!flameArresterPassed) {
    if (telemetry.flameArresterCleanlinessPercent < 80) {
      criticalDefectsAz.push(
        `Qığılcımsöndürən / alovkəsici torun təmizlik dərəcəsi aşağıdır: ${telemetry.flameArresterCleanlinessPercent}% (Norma: ≥ 80%). Qatran və his tıxanması var!`
      );
      score -= 15;
    }
    if (telemetry.pressureDropMbar > 15) {
      recommendationsAz.push(
        `Alovsöndürücünün aerodinamik müqaviməti yüksəkdir (${telemetry.pressureDropMbar} mbar). Torun ultrasəs vannasında yuyulması tələb olunur.`
      );
      score -= 5;
    }
    finesRiskAzn += 800;
    statutoryLegalArticles.push('Yanğın təhlükəsizliyi haqqında AR Qanunu Maddə 21');
  }

  // 5. Grounding resistance check (< 10.0 Ohms)
  const groundingPassed = telemetry.staticGroundResistanceOhms <= 10.0;
  if (!groundingPassed) {
    criticalDefectsAz.push(
      `Statik elektrik torpaqlama makarasının keçiricilik müqaviməti normativ həddən yüksəkdir: ${telemetry.staticGroundResistanceOhms.toFixed(1)} Ω (Norma: ≤ 10.0 Ω). Statik qığılcım partlayış riski!`
    );
    score -= 20;
    finesRiskAzn += 1200;
    statutoryLegalArticles.push('ADR Bənd 9.2.4.7, IEC 60079-32-1');
  }

  // Check additional auxiliary safety devices
  if (!telemetry.overfillSensorOperational) {
    recommendationsAz.push('Çənin dolma həddi optik / termistor sensoru (Overfill) cavab vermir. Doldurma estakadasında qəza kəsilməsi işləməyəcək.');
    score -= 10;
  }
  if (!telemetry.batteryMasterSwitchOperable) {
    criticalDefectsAz.push('ADR akkumulyator kəsici açarı (Master Switch) həm salondan, həm xaricdən sınaq zamanı dövrəni kəsmədi!');
    score -= 15;
    finesRiskAzn += 500;
    statutoryLegalArticles.push('ADR Bənd 9.2.2.8');
  }
  if (!telemetry.vaporRecoveryValveSealed) {
    recommendationsAz.push('Buxar bərpa xəttinin (VRU) klapan contasında cüzi sızma qeydə alındı. Contanın dəyişdirilməsi tövsiyə edilir.');
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));
  const isFullyCompliant =
    hydrostaticPassed &&
    thicknessPassed &&
    valveTripPassed &&
    flameArresterPassed &&
    groundingPassed &&
    telemetry.batteryMasterSwitchOperable;

  return {
    isFullyCompliant,
    hydrostaticPassed,
    thicknessPassed,
    valveTripPassed,
    flameArresterPassed,
    groundingPassed,
    overallScore: score,
    criticalDefectsAz,
    recommendationsAz,
    finesRiskAzn,
    statutoryLegalArticles: Array.from(new Set(statutoryLegalArticles)),
  };
};

/**
 * Statutory FHN DYNX, BDYP & Inspection Duty Calculation
 */
export interface TankerInspectionCostBreakdown {
  categoryBaseFeeAzn: number;
  hydrostaticTestFeeAzn: number;
  ultrasonicNdtFeeAzn: number;
  adrCertificateFeeAzn: number;
  flameArresterCertFeeAzn: number;
  policeEscortFeeAzn: number;
  vatAzn: number;
  totalAzn: number;
  totalConverted: number;
  currency: Currency;
}

export const calculateTankerInspectionCosts = (
  category: AdrVehicleCategory,
  needsPoliceEscort: boolean,
  includeNdt: boolean,
  currency: Currency
): TankerInspectionCostBreakdown => {
  const catMeta = ADR_VEHICLE_CATEGORIES[category];
  const categoryBaseFeeAzn = catMeta.baseInspectionFeeAzn;
  const hydrostaticTestFeeAzn = 180;
  const ultrasonicNdtFeeAzn = includeNdt ? 120 : 0;
  const adrCertificateFeeAzn = 60;
  const flameArresterCertFeeAzn = 70;
  const policeEscortFeeAzn = needsPoliceEscort ? 250 : 0;

  const subtotalAzn =
    categoryBaseFeeAzn +
    hydrostaticTestFeeAzn +
    ultrasonicNdtFeeAzn +
    adrCertificateFeeAzn +
    flameArresterCertFeeAzn +
    policeEscortFeeAzn;

  const vatAzn = Math.round(subtotalAzn * 0.18 * 100) / 100;
  const totalAzn = subtotalAzn + vatAzn;
  const totalConverted = convertAzn(totalAzn, currency);

  return {
    categoryBaseFeeAzn,
    hydrostaticTestFeeAzn,
    ultrasonicNdtFeeAzn,
    adrCertificateFeeAzn,
    flameArresterCertFeeAzn,
    policeEscortFeeAzn,
    vatAzn,
    totalAzn,
    totalConverted,
    currency,
  };
};

/**
 * Strategic Azerbaijan ADR Hazardous Materials Terminals Radar
 */
export interface AdrTerminal {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  locationAz: string;
  coordinates: string;
  primarySubstancesAz: string[];
  unCodes: string[];
  maxDailyThroughputTons: number;
  activeLoadingBays: number;
  safetyTier: 'SEVESO_TOP_TIER' | 'HIGH_SAFETY' | 'STANDARD_HAZMAT';
  fhnInspectorateDistrict: string;
  liveStatus: 'OPERATIONAL' | 'HIGH_CONGESTION' | 'MAINTENANCE_INSPECTION';
  fireStationDistanceKm: number;
  vaporRecoverySystemActive: boolean;
}

/**
 * 10-Point FHN DYNX & BDYP Technical Fire Safety Checklist Item
 */
export interface TankerChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  legalBasis: string;
  weight: number;
  isMandatory: boolean;
}

/**
 * 10-Question ADR Driver & Technical Safety Advisor Examination Question
 */
export interface AdrExamQuestion {
  id: number;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
  legalCitation: string;
}

/**
 * Official ADR-AZ-2026 Vehicle Approval Certificate Record
 */
export interface AdrTankerApprovalCertificate {
  certificateId: string; // e.g. "ADR-AZ-2026-98124"
  vehiclePlate: string;
  chassisVin: string;
  carrierCompanyName: string;
  carrierVoen: string;
  vehicleCategory: AdrVehicleCategory;
  tankSerialNumber: string;
  tankManufacturer: string;
  tankCapacityLiters: number;
  tankCompartmentsCount: number;
  hydrostaticTestDate: string;
  hydrostaticNextDueDate: string;
  permittedUnNumbers: string[];
  flameArresterModel: string;
  staticGroundResistanceOhms: number;
  inspectionInspectorName: string;
  issueDate: string;
  expiryDate: string;
  status: 'ACTIVE_APPROVED' | 'EXPIRING_SOON' | 'REVOKED_DEFECT';
  securityHashSha256: string;
  simaSignatureUid: string;
}

/**
 * Generate cryptographic SHA-256 simulation hash
 */
export const generateTankerCertificateHash = (
  plate: string,
  vin: string,
  tankSerial: string,
  category: string
): string => {
  const seed = `${plate}-${vin}-${tankSerial}-${category}-FHN-DYNX-BDYP-2026`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexPart1 = Math.abs(hash).toString(16).padStart(8, 'a');
  const hexPart2 = Math.abs((hash ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, 'f');
  const hexPart3 = Math.abs((hash * 31) >>> 0).toString(16).padStart(8, '7');
  const hexPart4 = Math.abs((hash * 17) >>> 0).toString(16).padStart(8, '3');
  return `${hexPart1}${hexPart2}${hexPart3}${hexPart4}`.toLowerCase();
};
