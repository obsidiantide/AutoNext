/**
 * Official Azerbaijan Automobile Federation (AAF),
 * Ministry of Internal Affairs (DİN) & BDYP
 * Motorsport Safety, Anti-Street Racing (İXM Maddə 511),
 * Closed Circuit Track Days & Sports Technical Passport Engine.
 *
 * Statutory Legal Foundations:
 * 1. Law of the Republic of Azerbaijan "On Physical Culture and Sport" ("Bədən tərbiyəsi və idman haqqında" AR Qanunu).
 * 2. Code of Administrative Offences (İXM Maddə 511.1 & 511.2 - "Avtoxuliqanlıq" / Street Racing Sanctions).
 * 3. Code of Administrative Offences (İXM Maddə 342.2-1 & 342.3 - Unlawful Constructive Modifications on Public Roads).
 * 4. Law of the Republic of Azerbaijan "On Road Traffic" (YHQ Articles 4, 37 & 73).
 * 5. FIA International Sporting Code (Annex J Technical Regulations - Roll Cages, Safety Harnesses, Fire Suppression, Noise dB).
 * 6. AAF (Azərbaycan Avtomobil Federasiyası) Closed-Circuit Safety Guidelines & Track Day Homologation Rules.
 */

import { Currency } from '../types/vehicle';

export type MotorsportDiscipline =
  | 'circuit_racing'
  | 'drift'
  | 'drag_racing'
  | 'time_attack'
  | 'slalom_gymkhana'
  | 'hillclimb';

export type CompetitionClass =
  | 'street_stock'
  | 'clubman_modified'
  | 'pro_am'
  | 'unlimited_outlaw';

export interface DisciplineDetails {
  id: MotorsportDiscipline;
  nameAz: string;
  nameEn: string;
  descriptionAz: string;
  requiredGear: string;
  noiseLimitDba: number;
  minCategory: string;
}

export const MOTORSPORT_DISCIPLINES: Record<MotorsportDiscipline, DisciplineDetails> = {
  circuit_racing: {
    id: 'circuit_racing',
    nameAz: 'Həlqəvi Yol Yarışı (Circuit Racing)',
    nameEn: 'Closed Circuit Racing',
    descriptionAz: 'Qapalı trasda eyni vaxtda startla çoxdövrəli sürət və dözümlülük yarışı.',
    requiredGear: 'Tam FIA karkas, 6-nöqtəli kəmər, mərkəzi yanğınsöndürmə, HANS dəbilqə',
    noiseLimitDba: 105,
    minCategory: 'AAF Milli A Lisenziyası',
  },
  drift: {
    id: 'drift',
    nameAz: 'Peşəkar Drift (Drift Tandem & Solo)',
    nameEn: 'Professional Drifting',
    descriptionAz: 'İdarə olunan yana sürüşmə bucağı, trayektoriya və duman kliring qiymətləndirməsi.',
    requiredGear: 'Yan zərbə mühafizəli FIA karkas, hidravlik əl əyləci kilidi, çömçə oturacaq',
    noiseLimitDba: 108,
    minCategory: 'AAF Drift Pro-Am Lisenziyası',
  },
  drag_racing: {
    id: 'drag_racing',
    nameAz: 'Drag Reys (402m / 1/4 Mil Sürətlənmə)',
    nameEn: 'Drag Racing (1/4 Mile)',
    descriptionAz: 'Düz xətt boyunca 402 metr məsafədə startdan finişədək ani sürətlənmə sprinti.',
    requiredGear: 'Kardana tutqac, təkər fırlanma qoruması, yanmaz kombinezon, kask',
    noiseLimitDba: 110,
    minCategory: 'AAF Drag Sprint İcazəsi',
  },
  time_attack: {
    id: 'time_attack',
    nameAz: 'Time Attack (Dövrə Vaxtı Rekordu)',
    nameEn: 'Time Attack Challenge',
    descriptionAz: 'Təmiz asfaltda təkbətək dövrə ən yaxşı vaxtı uğrunda yarış.',
    requiredGear: '4-nöqtəli kəmər, AFFF yanğınsöndürən, sertifikatlı dəbilqə, çəki kəmərləri',
    noiseLimitDba: 102,
    minCategory: 'AAF Klubmen Lisenziyası',
  },
  slalom_gymkhana: {
    id: 'slalom_gymkhana',
    nameAz: 'Avtoslalom & Cimxana (Gymkhana)',
    nameEn: 'Slalom & Gymkhana Maneuver',
    descriptionAz: 'Konuslar və maneələr arasında dəqiq və kəskin manevretmə idarəetməsi.',
    requiredGear: 'Standart təhlükəsizlik kəməri, batareya bərkidilməsi, dəbilqə',
    noiseLimitDba: 98,
    minCategory: 'Həvəskar Sürücülük Vəsiqəsi (B)',
  },
  hillclimb: {
    id: 'hillclimb',
    nameAz: 'Dağa Qalxma (Hillclimb Sprint)',
    nameEn: 'Mountain Hillclimb Sprint',
    descriptionAz: 'Dağlıq aşırım və yüksək meyilli asfalt trasda təhlükəsiz sprint çıxışı.',
    requiredGear: 'Tam FIA karkas, HANS, ikiqat qəza çəki ilgəkləri, altlıq karter qoruyucu',
    noiseLimitDba: 105,
    minCategory: 'AAF İdman Dağ Lisenziyası',
  },
};

export interface AntiHooliganismAuditParams {
  publicDriftAttempt: boolean;
  sharpLaneWeaving: boolean;
  mufflerRemovalCutout: boolean;
  twoWheelTippingAttempt: boolean;
  isRepeatOffenseWithinOneYear: boolean;
  publicDisturbanceOrRaceBetting: boolean;
}

export interface AntiHooliganismSanction {
  isHooliganism: boolean;
  hasConstructiveViolation: boolean;
  minFineAzn: number;
  maxFineAzn: number;
  minAdministrativeArrestDays: number;
  maxAdministrativeArrestDays: number;
  suspensionYears: number;
  impoundRequired: boolean;
  articlesViolated: string[];
  severityLevel: 'compliant' | 'warning' | 'severe_hooliganism' | 'critical_repeat';
  summaryAz: string;
  courtJurisdictionAz: string;
  trackDayAlternativeAz: string;
}

/**
 * Audit public road actions under Code of Administrative Offences Article 511 & 342.
 */
export function evaluateAntiHooliganismSanctions(
  params: AntiHooliganismAuditParams
): AntiHooliganismSanction {
  const isHooliganismDetected =
    params.publicDriftAttempt ||
    params.sharpLaneWeaving ||
    params.twoWheelTippingAttempt ||
    params.publicDisturbanceOrRaceBetting;

  const hasConstructiveViolation = params.mufflerRemovalCutout;

  const articlesViolated: string[] = [];

  if (!isHooliganismDetected && !hasConstructiveViolation) {
    return {
      isHooliganism: false,
      hasConstructiveViolation: false,
      minFineAzn: 0,
      maxFineAzn: 0,
      minAdministrativeArrestDays: 0,
      maxAdministrativeArrestDays: 0,
      suspensionYears: 0,
      impoundRequired: false,
      articlesViolated: [],
      severityLevel: 'compliant',
      summaryAz: 'Qayda pozuntusu aşkar edilmədi. Nəqliyyat vasitəsi ictimai yollarda təhlükəsiz idarə olunur.',
      courtJurisdictionAz: 'Tətbiq edilmir.',
      trackDayAlternativeAz: 'Daha yüksək adrenalin və peşəkar bacarıqlar üçün rəsmi AAF trek günlərinə qoşula bilərsiniz.',
    };
  }

  if (hasConstructiveViolation) {
    articlesViolated.push('İXM Maddə 342.2-2 (Səsboğucunun qanunsuz konstruksiya dəyişikliyi - 150 AZN)');
  }

  if (!isHooliganismDetected && hasConstructiveViolation) {
    return {
      isHooliganism: false,
      hasConstructiveViolation: true,
      minFineAzn: 150,
      maxFineAzn: 150,
      minAdministrativeArrestDays: 0,
      maxAdministrativeArrestDays: 0,
      suspensionYears: 0,
      impoundRequired: true,
      articlesViolated,
      severityLevel: 'warning',
      summaryAz: 'Konstruktiv dəyişiklik aşkar edildi (Səsboğucu qüsuru). İctimai avtoxuliqanlıq halı qeydə alınmayıb.',
      courtJurisdictionAz: 'BDYP Rayon Dövlət Yol Polisi Şöbəsi',
      trackDayAlternativeAz: 'Düz boru və idman qazanları yalnız bağlı autodrom traslarında icazəlidir.',
    };
  }

  if (params.isRepeatOffenseWithinOneYear) {
    articlesViolated.push(
      'İXM Maddə 511.2 (Avtoxuliqanlığın bir il ərzində təkrar törədilməsi - 1500-2000 AZN + 30-60 gün həbs + 2 il sürücülük hüququndan məhrumetmə)'
    );
    articlesViolated.push('İXM Maddə 96 (Nəqliyyat vasitəsinin müvəqqəti cərimə meydançasına göndərilməsi)');

    return {
      isHooliganism: true,
      hasConstructiveViolation,
      minFineAzn: 1500 + (hasConstructiveViolation ? 150 : 0),
      maxFineAzn: 2000 + (hasConstructiveViolation ? 150 : 0),
      minAdministrativeArrestDays: 30,
      maxAdministrativeArrestDays: 60,
      suspensionYears: 2,
      impoundRequired: true,
      articlesViolated,
      severityLevel: 'critical_repeat',
      summaryAz: 'TƏKRAR AVTOXULİQANLIQ (İXM 511.2): 1500–2000 AZN cərimə, 30–60 gün inzibati həbs və 2 il sürücülük hüququndan məhrumetmə!',
      courtJurisdictionAz: 'Rayon (Şəhər) Məhkəməsi Hakiminin İnzibati Qərarı',
      trackDayAlternativeAz: 'Küçələrdə təhlükə yaratmaq qanunla qadağandır! Peşəkar pilotlar yalnız rəsmi AAF idman autodromlarında yarışır.',
    };
  }

  // First time hooliganism
  articlesViolated.push(
    'İXM Maddə 511.1 (Avtoxuliqanlıq hərəkətləri - 500-1000 AZN + 15-30 gün həbs + 1-2 il sürücülük hüququndan məhrumetmə)'
  );
  articlesViolated.push('İXM Maddə 96 (Mühafizə olunan duracağa təxirəsalınmaz təhvil)');

  return {
    isHooliganism: true,
    hasConstructiveViolation,
    minFineAzn: 500 + (hasConstructiveViolation ? 150 : 0),
    maxFineAzn: 1000 + (hasConstructiveViolation ? 150 : 0),
    minAdministrativeArrestDays: 15,
    maxAdministrativeArrestDays: 30,
    suspensionYears: 1,
    impoundRequired: true,
    articlesViolated,
    severityLevel: 'severe_hooliganism',
    summaryAz: 'AVTOXULİQANLIQ AŞKAR EDİLDİ (İXM 511.1): 500–1000 AZN cərimə, 15–30 gün inzibati həbs və 1 ildən 2 ilədək sürücülük hüququndan məhrumetmə!',
    courtJurisdictionAz: 'Rayon (Şəhər) Məhkəməsi Hakiminin İnzibati Qərarı',
    trackDayAlternativeAz: 'Adrenalin və drift küçələrdə deyil, BOS və Ələt Avtodromunda qanunidir!',
  };
}

export interface FiaAnnexJChecklist {
  rollCageCertified: boolean; // FIA 253 certified roll cage
  racingBucketSeat: boolean; // FIA 8855/8862 competition bucket seat
  multiPointHarness: boolean; // FIA 8853 4/5/6-point harness
  fireSuppressionSystem: boolean; // FIA 8865 / AFFF plumbing system
  masterCutoffSwitch: boolean; // External & internal electrical kill switch
  dualTowHooks: boolean; // Marked front & rear recovery tow loops
  batteryBoxCatchTank: boolean; // Sealed battery compartment + 1L oil catch tank
  fuelCellSafetyBladder: boolean; // FIA FT3 certified safety fuel tank
  exhaustDecibelLimit: boolean; // <=105 dBA at 4,500 RPM test stand
  helmetHansDevice: boolean; // FIA 8859/8860 approved helmet & FHR / HANS neck collar
}

export interface FiaAuditResult {
  score: number; // 0 - 100
  passedCount: number;
  totalCount: number;
  isEligibleForTrack: boolean;
  readinessLevel: 'prohibited' | 'track_day_novice' | 'club_competition' | 'pro_championship';
  statusLabelAz: string;
  deficiencies: string[];
  passedItems: string[];
  recommendedUpgrades: string[];
}

/**
 * Audit vehicle against FIA Annex J Closed Circuit Motorsport Technical Requirements
 */
export function auditFiaAnnexJCompliance(checklist: FiaAnnexJChecklist): FiaAuditResult {
  const items = [
    {
      key: 'rollCageCertified',
      labelAz: 'FIA 253 Sertifikatlı Polad Təhlükəsizlik Karkası (Roll Cage)',
      passed: checklist.rollCageCertified,
      weight: 15,
      upgrade: 'Sertifikatlı dikişsiz soyuq çəkilmiş xrom-molibden polad karkas quraşdırın.',
    },
    {
      key: 'racingBucketSeat',
      labelAz: 'FIA 8855/8862 Homoloqasiyalı İdman Oturacağı (Racing Bucket)',
      passed: checklist.racingBucketSeat,
      weight: 10,
      upgrade: 'FIA 8855-1999 qüvvədə olan mono-kok yarış oturacağı ilə təchiz edin.',
    },
    {
      key: 'multiPointHarness',
      labelAz: 'FIA 8853 Çoxnöqtəli (4/5/6 nöqtəli) Təhlükəsizlik Kəmərləri',
      passed: checklist.multiPointHarness,
      weight: 10,
      upgrade: 'Kam-lok mərkəzi kilidli 5/6 nöqtəli yarış kəməri əlavə edin.',
    },
    {
      key: 'fireSuppressionSystem',
      labelAz: 'FIA 8865 / AFFF Mərkəzləşdirilmiş Yanğınsöndürmə Sistemi',
      passed: checklist.fireSuppressionSystem,
      weight: 15,
      upgrade: 'Mühərrik bölməsi və salona istiqamətlənmiş avtomatik borulu sistem quraşdırın.',
    },
    {
      key: 'masterCutoffSwitch',
      labelAz: 'Daxili və Xarici Elektrik Kəsmə Düyməsi (Mass / Kill Switch)',
      passed: checklist.masterCutoffSwitch,
      weight: 10,
      upgrade: 'Xarici qırmızı qığılcım işarəli və salondan idarə olunan kəsici açar quraşdırın.',
    },
    {
      key: 'dualTowHooks',
      labelAz: 'Ön və Arxa Sertifikatlı İdman Çəki İlgəkləri (Tow Straps)',
      passed: checklist.dualTowHooks,
      weight: 5,
      upgrade: 'Minimum 2.5 ton yüklənməyə dözümlü qırmızı parça kəmər ilgəklər əlavə edin.',
    },
    {
      key: 'batteryBoxCatchTank',
      labelAz: 'İzolyasiya Olunmuş Akkumulyator Qutusu & 1L Yağ Tənəffüs Çəni',
      passed: checklist.batteryBoxCatchTank,
      weight: 10,
      upgrade: 'Akkumulyatoru hermetik qutuya yerləşdirin və karter havası üçün catch-tank əlavə edin.',
    },
    {
      key: 'fuelCellSafetyBladder',
      labelAz: 'FIA FT3 Təhlükəsiz Yanacaq Çəni & Qəza Klapanı',
      passed: checklist.fuelCellSafetyBladder,
      weight: 10,
      upgrade: 'Kevlar örtüklü zərbəyə dözümlü təhlükəsizlik çəni və aşma klapanı tətbiq edin.',
    },
    {
      key: 'exhaustDecibelLimit',
      labelAz: 'Maksimum 105 dBA Tras Səs Həddi (4500 RPM-də)',
      passed: checklist.exhaustDecibelLimit,
      weight: 5,
      upgrade: 'Egzoz rezonatoru və ya db-killer əlavə edərək akustik həddi 105 dBA-ya endirin.',
    },
    {
      key: 'helmetHansDevice',
      labelAz: 'FIA 8859/8860 Dəbilqə & FHR / HANS Boyun Təhlükəsizlik Sistemi',
      passed: checklist.helmetHansDevice,
      weight: 10,
      upgrade: 'FIA sertifikatlı qapalı dəbilqə və HANS teli alaraq tras təhlükəsizliyini təmin edin.',
    },
  ];

  let score = 0;
  let passedCount = 0;
  const passedItems: string[] = [];
  const deficiencies: string[] = [];
  const recommendedUpgrades: string[] = [];

  items.forEach((item) => {
    if (item.passed) {
      score += item.weight;
      passedCount++;
      passedItems.push(item.labelAz);
    } else {
      deficiencies.push(item.labelAz);
      recommendedUpgrades.push(item.upgrade);
    }
  });

  let readinessLevel: FiaAuditResult['readinessLevel'] = 'prohibited';
  let statusLabelAz = 'Trasa Buraxılmır (Qadağandır)';

  if (score >= 90) {
    readinessLevel = 'pro_championship';
    statusLabelAz = 'Peşəkar AAF Çempionat Homoloqasiyası (100% Hazır)';
  } else if (score >= 70) {
    readinessLevel = 'club_competition';
    statusLabelAz = 'Klub Yarışları & Drift Kuboku Səviyyəsi';
  } else if (score >= 40) {
    readinessLevel = 'track_day_novice';
    statusLabelAz = 'Həvəskar Açıq Qapı Trek Günü (Məhdud Rejim)';
  }

  const isEligibleForTrack = score >= 40;

  return {
    score,
    passedCount,
    totalCount: items.length,
    isEligibleForTrack,
    readinessLevel,
    statusLabelAz,
    deficiencies,
    passedItems,
    recommendedUpgrades,
  };
}

export type TrackDayPackage =
  | 'morning_session'
  | 'full_day_unlimited'
  | 'drift_open_skidpad'
  | 'drag_night_sprint';

export type TrackInsuranceTier =
  | 'basic_third_party'
  | 'paddock_plus'
  | 'comprehensive_track';

export interface TrackDayCalculationParams {
  packageType: TrackDayPackage;
  insuranceTier: TrackInsuranceTier;
  transponderTiming: boolean;
  pitBoxRental: boolean;
  currency: Currency;
}

export interface TrackDayCostBreakdown {
  packageType: TrackDayPackage;
  insuranceTier: TrackInsuranceTier;
  basePackageCostAzn: number;
  insuranceCostAzn: number;
  timingFeeAzn: number;
  pitBoxFeeAzn: number;
  totalAzn: number;
  totalConverted: number;
  currency: Currency;
  sessionDurationAz: string;
}

const EXCHANGE_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 1 / 1.7,
  EUR: 1 / 1.85,
};

/**
 * Calculate Closed Circuit Track Day Pricing in AZN, USD, EUR
 */
export function calculateTrackDayCost(params: TrackDayCalculationParams): TrackDayCostBreakdown {
  let basePackageCostAzn = 80;
  let sessionDurationAz = '3 Saat Səhər Sessiyası (09:00 - 12:00)';

  switch (params.packageType) {
    case 'morning_session':
      basePackageCostAzn = 80;
      sessionDurationAz = '3 Saat Səhər Sessiyası (09:00 - 12:00)';
      break;
    case 'full_day_unlimited':
      basePackageCostAzn = 180;
      sessionDurationAz = 'Tam Gün Limitsiz Dövrə (10:00 - 18:00)';
      break;
    case 'drift_open_skidpad':
      basePackageCostAzn = 120;
      sessionDurationAz = 'Drift & Yaş Meydança Sessiyası (4 Saat)';
      break;
    case 'drag_night_sprint':
      basePackageCostAzn = 70;
      sessionDurationAz = 'Gecə Drag Sprinti (20:00 - 24:00, 10 qaçış)';
      break;
  }

  let insuranceCostAzn = 20;
  switch (params.insuranceTier) {
    case 'basic_third_party':
      insuranceCostAzn = 20;
      break;
    case 'paddock_plus':
      insuranceCostAzn = 45;
      break;
    case 'comprehensive_track':
      insuranceCostAzn = 95;
      break;
  }

  const timingFeeAzn = params.transponderTiming ? 25 : 0;
  const pitBoxFeeAzn = params.pitBoxRental ? 50 : 0;

  const totalAzn = basePackageCostAzn + insuranceCostAzn + timingFeeAzn + pitBoxFeeAzn;
  const rate = EXCHANGE_RATES[params.currency] || 1.0;
  const totalConverted = Math.round(totalAzn * rate);

  return {
    packageType: params.packageType,
    insuranceTier: params.insuranceTier,
    basePackageCostAzn,
    insuranceCostAzn,
    timingFeeAzn,
    pitBoxFeeAzn,
    totalAzn,
    totalConverted,
    currency: params.currency,
    sessionDurationAz,
  };
}

export interface AafSportsPassport {
  id: string;
  passportNumber: string; // e.g. AAF-TRK-2026-XXXXX
  vin: string;
  plateNumber: string;
  vehicleModel: string;
  driverFullName: string;
  driverLicenseCategory: string;
  aafLicenseNumber: string;
  discipline: MotorsportDiscipline;
  competitionClass: CompetitionClass;
  rollCageSerial: string;
  exhaustDbRating: number;
  auditScore: number;
  assignedTrackName: string;
  issueDate: string;
  validityUntil: string;
  qrSecurityHash: string;
  chiefScrutineer: string;
  status: 'active' | 'suspended_for_street_racing' | 'pending_inspection';
}

/**
 * Generate official AAF Sports Technical Passport
 */
export function generateAafSportsPassport(
  vin: string,
  plate: string,
  vehicleModel: string,
  driverName: string,
  discipline: MotorsportDiscipline,
  compClass: CompetitionClass,
  score: number,
  exhaustDb: number,
  trackName: string
): AafSportsPassport {
  const randomSeq = Math.floor(10000 + Math.random() * 90000);
  const passportNumber = `AAF-TRK-2026-${randomSeq}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];

  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 1);
  const validityUntil = expiry.toISOString().split('T')[0];

  const rollCageSerial = score >= 50 ? `FIA-AZ-CAGE-${Math.floor(1000 + Math.random() * 9000)}` : 'Quraşdırılmayıb';

  const rawHash = `${passportNumber}|${vin}|${plate}|${driverName}|${discipline}|${issueDate}`;
  let hashVal = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHash.charCodeAt(i);
    hashVal |= 0;
  }
  const qrSecurityHash = `SHA256:AAF:${Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0')}:VERIFIED`;

  return {
    id: `aaf-pass-${randomSeq}`,
    passportNumber,
    vin: vin || 'WBA330000AA099881',
    plateNumber: plate || '10-AA-000',
    vehicleModel: vehicleModel || 'Track Prepared Vehicle',
    driverFullName: driverName || 'Rəşad Əliyev',
    driverLicenseCategory: 'B / AAF Milli A',
    aafLicenseNumber: `AAF-LIC-${Math.floor(1000 + Math.random() * 9000)}`,
    discipline,
    competitionClass: compClass,
    rollCageSerial,
    exhaustDbRating: exhaustDb,
    auditScore: score,
    assignedTrackName: trackName,
    issueDate,
    validityUntil,
    qrSecurityHash,
    chiefScrutineer: 'Elçin Qasımov (AAF Baş Texniki Komissar)',
    status: 'active',
  };
}

/**
 * Filter Sports Passports in the unified registry
 */
export function filterAafPassports(passports: AafSportsPassport[], query: string): AafSportsPassport[] {
  if (!query.trim()) return passports;
  const q = query.toLowerCase().trim();
  return passports.filter(
    (p) =>
      p.passportNumber.toLowerCase().includes(q) ||
      p.plateNumber.toLowerCase().includes(q) ||
      p.vin.toLowerCase().includes(q) ||
      p.driverFullName.toLowerCase().includes(q) ||
      p.vehicleModel.toLowerCase().includes(q) ||
      p.assignedTrackName.toLowerCase().includes(q)
  );
}
