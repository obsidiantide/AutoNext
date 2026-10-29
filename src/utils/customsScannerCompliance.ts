/**
 * Official State Customs Committee of the Republic of Azerbaijan
 * (Azərbaycan Respublikası Dövlət Gömrük Komitəsi - DGK),
 * Azerbaijan Land Transport Agency (AYNA) &
 * Main State Traffic Police Department (BDYP)
 * Cross-Border High-Energy Non-Intrusive Inspection (NII) Gantry X-Ray Scanner,
 * Dual-Energy Material Discrimination, Radiography Anomaly Detection &
 * Official DGK-SCAN-AZ-2026 Customs Clearance Compliance Engine
 *
 * Adheres to:
 * - Customs Code of the Republic of Azerbaijan ("Gömrük Məcəlləsi", Maddə 38, 42, 85:
 *   Qeyri-intruziv baxış (NII), rentgen-skan nəzarəti, gömrük eyniləşdirilməsi və fiziki yoxlama qaydaları)
 * - IAEA Radiation Protection Safety Standards Series No. SSG-55
 *   (Radiation Safety of Radiation Sources Used in Inspection of Goods and Cargo)
 * - WCO SAFE Framework of Standards (Standard 3: High-Energy Non-Intrusive Inspection Equipment & Interoperability)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *   * Maddə 482: Gömrük nəzarətindən gizlədilməklə malların keçirilməsi (gizli saxlanc yerləri, qoşa arakəsmələr, konstruktiv boşluqlar; 1,000–5,000 AZN cərimə və malların müsadirəsi)
 *   * Maddə 485: Gömrük bəyannaməsində yalan və ya natamam məlumatların verilməsi (500–2,500 AZN cərimə)
 *   * Maddə 499: Malların və nəqliyyat vasitələrinin gömrük sərhədindən qanunsuz keçirilməsi (1,500 AZN cərimə)
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR
};

export const convertAzn = (amountAzn: number, currency: Currency): number => {
  return amountAzn * CURRENCY_RATES[currency];
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';
  return `${amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
};

/**
 * High-Energy Scanner Types
 */
export type ScannerType =
  | 'GANTRY_HIGH_ENERGY_6MEV'    // Smiths Detection HCVG 6.0 MeV Gantry Scanner
  | 'MOBILE_DUAL_ENERGY_6_3MEV'  // Nuctech MT1213DE 6/3 MeV Dual-Energy Mobile Scanner
  | 'DRIVE_THROUGH_PORTAL_FAST'  // Rapiscan Eagle G60 FastScan Drive-Through (450 keV - 6.0 MeV)
  | 'RAIL_GANTRY_CARGO_6MEV';    // Rapiscan Eagle R60 6.0 MeV Rail Scanner for trains & pocket wagons

/**
 * Strategic Cross-Border Checkpoints with NII Gantry Scanners
 */
export type CheckpointId =
  | 'samur_north'
  | 'astara_south'
  | 'qirmizi_korpu'
  | 'alat_port_gantry'
  | 'mazimqara_west'
  | 'boyuk_kesik_rail'
  | 'culfa_terminal';

export interface CheckpointInfo {
  id: CheckpointId;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  locationAz: string;
  corridorAz: string;
  scannerModel: string;
  scannerType: ScannerType;
  radiationEnergyMev: number;
  steelPenetrationMm: number;
  scanSpeedKmh: number;
  dailyTruckCapacity: number;
  rpmInstalled: boolean;
  descriptionAz: string;
}

/**
 * Dual-Energy Material Discrimination Classes (Z_eff Atomic Number)
 */
export type MaterialCategory =
  | 'ORGANIC'          // Z_eff <= 10 (Orange/Brown: textiles, wood, food, plastics, illicit contraband)
  | 'INORGANIC_LIGHT'  // 10 < Z_eff <= 20 (Green: aluminum, glass, light alloys, ceramic tiles)
  | 'HEAVY_METALS'     // 20 < Z_eff < 82 (Blue: iron, steel chassis, copper, automotive machinery)
  | 'DENSE_SHIELDING'; // Z_eff >= 82 (Dark Blue/Black: thick lead, uranium shielding, dense tungsten)

/**
 * Radiography Density Anomaly & Hidden Compartment Locations
 */
export type AnomalyLocation =
  | 'DECLARED_CARGO_UNIFORM'        // Uniform legal cargo matching manifest density
  | 'FALSE_BULKHEAD_FRONT'          // Front bulkhead hollow partition / false wall
  | 'DOUBLE_FLOOR_CAVITY'           // Secondary floor elevation & concealed floor space
  | 'FUEL_TANK_INNER_COMPARTMENT'   // Welded internal chamber inside diesel fuel tank
  | 'REEFER_ROOF_VOID'              // Refrigeration unit insulation cutout cavity
  | 'SPARE_WHEEL_VOID'              // Hollow rim/tire cavity with undeclared density
  | 'CHASSIS_HOLLOW_BEAMS';         // Chassis longitudinal hollow beams modification

export type RadiographyVerdict =
  | 'CLEAR_PASSED'
  | 'SUSPICIOUS_DENSITY'
  | 'CRITICAL_CONCEALMENT_DETECTED';

export type RpmAlarmLevel =
  | 'CLEAR_BACKGROUND'
  | 'ELEVATED_NON_HAZARDOUS'
  | 'RADIOACTIVE_THREAT_DETECTED';

export interface ScannedTruckPreset {
  id: string;
  trailerPlate: string;
  tractorPlate: string;
  driverNameAz: string;
  carrierNameAz: string;
  customsManifestNumber: string;
  checkpointId: CheckpointId;
  scannerType: ScannerType;
  declaredCargoAz: string;
  declaredWeightTonnes: number;
  declaredDensityGcm3: number;
  measuredDensityGcm3: number;
  dominantMaterial: MaterialCategory;
  anomalyLocation: AnomalyLocation;
  anomalyVolumeLitres: number;
  rpmGammaDoseRate: number; // Normal background: 0.08 - 0.14 uSv/h, threshold: 0.25 uSv/h
  rpmNeutronCps: number; // Normal: 0-2 cps, threshold: >= 5 cps
  isGreenCorridor: boolean;
}

/**
 * Dual-Energy Material Discrimination Spectrum Result
 */
export interface MaterialDiscriminationResult {
  dominantMaterial: MaterialCategory;
  organicPercent: number;
  inorganicPercent: number;
  heavyMetalsPercent: number;
  denseShieldingPercent: number;
  estimatedEffectiveAtomicNumber: number; // Z_eff
  colorHexCode: string; // Color code on customs monitor
  materialLabelAz: string;
}

/**
 * Radiography Density Anomaly Evaluation Result
 */
export interface RadiographyAnomalyResult {
  declaredDensityGcm3: number;
  measuredDensityGcm3: number;
  densityDeltaGcm3: number;
  densityVariancePercent: number;
  attenuationOpacityPercent: number;
  anomalyLocation: AnomalyLocation;
  anomalyVolumeLitres: number;
  verdict: RadiographyVerdict;
  verdictLabelAz: string;
  riskScore: number; // 0 - 100
  isPhysicalInspectionRequired: boolean;
  rejectionReasonAz: string | null;
  recommendedActionAz: string;
}

/**
 * Radiation Portal Monitor (RPM) Telemetry Result
 */
export interface RpmTelemetryResult {
  gammaDoseRateUsvh: number;
  gammaBackgroundUsvh: number;
  gammaDeltaPercent: number;
  neutronCps: number;
  alarmLevel: RpmAlarmLevel;
  alarmLabelAz: string;
  isRadiationSafe: boolean;
  radiologicalRiskScore: number; // 0 - 100
  actionProtocolAz: string;
}

/**
 * Statutory Customs Tariffs & Escort Fee Calculation Result
 */
export interface CustomsScanningFeeResult {
  baseScanFeeAzn: number;
  greenCorridorDiscountAzn: number;
  rescanFeeAzn: number;
  physicalEscortFeeAzn: number;
  k9InspectionFeeAzn: number;
  statutoryFineAzn: number;
  totalPayableAzn: number;
  totalPayableUsd: number;
  totalPayableEur: number;
  statutoryArticleAz: string;
}

/**
 * 10-Point Technical & Radiation Safety Checklist Item
 */
export interface ScannerChecklistItem {
  id: string;
  categoryAz: 'RADIATION_SAFETY' | 'OPTICAL_CALIBRATION' | 'GANTRY_MECHANICS' | 'IMAGE_ARCHIVING';
  titleAz: string;
  descriptionAz: string;
  isMandatory: boolean;
  iaeaStandard: string;
}

/**
 * 10-Question Customs NII Theoretical Examination Simulator
 */
export interface ScannerExamQuestion {
  id: string;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  legalBasisAz: string;
}

/**
 * Official Electronic Customs Clearance Certificate
 */
export interface OfficialCustomsScannerCertificate {
  certificateId: string; // DGK-SCAN-AZ-2026-XXXXX
  issueDate: string;
  validUntil: string;
  trailerPlate: string;
  tractorPlate: string;
  driverNameAz: string;
  carrierNameAz: string;
  customsManifestNumber: string;
  checkpointAz: string;
  scannerModel: string;
  radiationEnergyMev: number;
  steelPenetrationMm: number;
  declaredCargoAz: string;
  declaredDensityGcm3: number;
  measuredDensityGcm3: number;
  materialDiscriminationAz: string;
  effectiveAtomicNumberZ: number;
  rpmGammaUsvh: number;
  rpmNeutronCps: number;
  radiographyVerdict: RadiographyVerdict;
  verdictLabelAz: string;
  totalFeeAzn: number;
  customsInspectorBadge: string;
  inspectionLaneCode: string;
  sha256SecurityChecksum: string;
  simaDigitalUid: string;
}

/**
 * Evaluates Dual-Energy Material Discrimination
 */
export const evaluateMaterialDiscrimination = (
  dominantMaterial: MaterialCategory,
  declaredDensity: number,
  measuredDensity: number
): MaterialDiscriminationResult => {
  let organicPercent = 15;
  let inorganicPercent = 25;
  let heavyMetalsPercent = 55;
  let denseShieldingPercent = 5;
  let zEff = 26; // Iron
  let colorHexCode = '#2563eb'; // Blue
  let materialLabelAz = 'Ağır metallər və polad konstruksiya (Z > 20)';

  switch (dominantMaterial) {
    case 'ORGANIC':
      organicPercent = 70;
      inorganicPercent = 18;
      heavyMetalsPercent = 10;
      denseShieldingPercent = 2;
      zEff = 7.5;
      colorHexCode = '#ea580c'; // Orange
      materialLabelAz = 'Üzvi maddələr, tekstil, qida və sintetik polimerlər (Z ≤ 10)';
      break;
    case 'INORGANIC_LIGHT':
      organicPercent = 15;
      inorganicPercent = 65;
      heavyMetalsPercent = 18;
      denseShieldingPercent = 2;
      zEff = 13.5;
      colorHexCode = '#16a34a'; // Green
      materialLabelAz = 'Qeyri-üzvi yüngül materiallar, alüminium, şüşə və keramika (10 < Z ≤ 20)';
      break;
    case 'HEAVY_METALS':
      organicPercent = 10;
      inorganicPercent = 20;
      heavyMetalsPercent = 65;
      denseShieldingPercent = 5;
      zEff = 26.0;
      colorHexCode = '#2563eb'; // Blue
      materialLabelAz = 'Ağır metallər, mühərrik detalları, mis və şassi konstruksiyası (20 < Z < 82)';
      break;
    case 'DENSE_SHIELDING':
      organicPercent = 5;
      inorganicPercent = 10;
      heavyMetalsPercent = 35;
      denseShieldingPercent = 50;
      zEff = 82.0; // Lead
      colorHexCode = '#0f172a'; // Dark Slate / Black
      materialLabelAz = 'Yüksək sıxlıqlı radiasiya ekranlaşdırması, qurğuşun və volfram (Z ≥ 82)';
      break;
  }

  // Adjust zEff slightly based on density
  if (measuredDensity > declaredDensity) {
    zEff = Number((zEff + (measuredDensity - declaredDensity) * 1.5).toFixed(1));
  }

  return {
    dominantMaterial,
    organicPercent,
    inorganicPercent,
    heavyMetalsPercent,
    denseShieldingPercent,
    estimatedEffectiveAtomicNumber: zEff,
    colorHexCode,
    materialLabelAz,
  };
};

/**
 * Evaluates Radiography Density Anomaly and Concealment Risks
 */
export const evaluateRadiographyAnomaly = (
  declaredDensity: number,
  measuredDensity: number,
  anomalyLocation: AnomalyLocation,
  anomalyVolumeLitres: number
): RadiographyAnomalyResult => {
  const densityDeltaGcm3 = Number((measuredDensity - declaredDensity).toFixed(3));
  const densityVariancePercent = Number(
    declaredDensity > 0 ? ((Math.abs(densityDeltaGcm3) / declaredDensity) * 100).toFixed(1) : '0'
  );

  // Attenuation Opacity correlates with measured density and high-energy penetration
  const attenuationOpacityPercent = Math.min(
    99,
    Math.max(12, Math.round((measuredDensity / 7.8) * 100) + (anomalyVolumeLitres > 0 ? 15 : 0))
  );

  let verdict: RadiographyVerdict = 'CLEAR_PASSED';
  let verdictLabelAz = 'TƏSDİQLƏNDİ — Radioloji Qanunilik və Şəffaflıq Təsdiq Olundu';
  let riskScore = 8;
  let isPhysicalInspectionRequired = false;
  let rejectionReasonAz: string | null = null;
  let recommendedActionAz = 'Sərbəst buraxılış: Beynəlxalq tranzit və ya daxili idxal rəsmiləşdirilməsinə icazə verilir.';

  if (anomalyLocation !== 'DECLARED_CARGO_UNIFORM' && anomalyVolumeLitres > 30) {
    verdict = 'CRITICAL_CONCEALMENT_DETECTED';
    verdictLabelAz = 'KRİTİK ANOMALİYA — Konstruktiv Gizli Saxlanc Yeri və ya Qaçaqmalçılıq Aşkar Edildi';
    riskScore = 96;
    isPhysicalInspectionRequired = true;
    rejectionReasonAz = `İXM Maddə 482 pozuntusu: ${anomalyLocation} zonasında ${anomalyVolumeLitres} litrlik qeyri-qanuni saxlanc boşluğu və sıxlıq anomaliyası (${densityDeltaGcm3} q/sm³) aşkar edilmişdir.`;
    recommendedActionAz = 'Təcili saxlanma: Nəqliyyat vasitəsi dərin fiziki baxış anqarına və kinoloji xidmət qrupuna yönləndirilsin.';
  } else if (Math.abs(densityDeltaGcm3) > 0.45 || anomalyVolumeLitres > 0) {
    verdict = 'SUSPICIOUS_DENSITY';
    verdictLabelAz = 'ŞÜBHƏLİ DİAQNOSTİKA — Bəyan Edilmiş Yüklə Ölçülən Sıxlıq Uyğunsuzluğu';
    riskScore = 58;
    isPhysicalInspectionRequired = true;
    rejectionReasonAz = `Gömrük Məcəlləsi Maddə 42: Bəyan olunmuş sıxlıq (${declaredDensity} q/sm³) ilə skaner sıxlığı (${measuredDensity} q/sm³) arasında fərq (${densityDeltaGcm3} q/sm³) normadan artıqdır.`;
    recommendedActionAz = 'Təkrar skan və qismən boşaltma ilə fiziki yoxlama icra edilsin.';
  }

  return {
    declaredDensityGcm3: declaredDensity,
    measuredDensityGcm3: measuredDensity,
    densityDeltaGcm3,
    densityVariancePercent,
    attenuationOpacityPercent,
    anomalyLocation,
    anomalyVolumeLitres,
    verdict,
    verdictLabelAz,
    riskScore,
    isPhysicalInspectionRequired,
    rejectionReasonAz,
    recommendedActionAz,
  };
};

/**
 * Evaluates Radiation Portal Monitor (RPM) Telemetry
 */
export const evaluateRpmTelemetry = (
  gammaDoseRateUsvh: number,
  neutronCps: number
): RpmTelemetryResult => {
  const gammaBackgroundUsvh = 0.11; // Standard natural background
  const gammaDeltaPercent = Number(
    (((gammaDoseRateUsvh - gammaBackgroundUsvh) / gammaBackgroundUsvh) * 100).toFixed(1)
  );

  let alarmLevel: RpmAlarmLevel = 'CLEAR_BACKGROUND';
  let alarmLabelAz = 'NORMALLAŞDIRILMIŞ FON — Təhlükəsiz Radiasiya Səviyyəsi';
  let isRadiationSafe = true;
  let radiologicalRiskScore = 4;
  let actionProtocolAz = 'Radioloji maneəsiz keçid: Təbii ionlaşdırıcı fon hədləri daxilindədir.';

  if (gammaDoseRateUsvh >= 0.50 || neutronCps >= 10) {
    alarmLevel = 'RADIOACTIVE_THREAT_DETECTED';
    alarmLabelAz = 'KRİTİK RADIASİYA HƏYƏCANI — Qamma və ya Neytron Çirklənməsi / Nüvə Materialı';
    isRadiationSafe = false;
    radiologicalRiskScore = 98;
    actionProtocolAz = 'IAEA SSG-55 Qırmızı Protokolu: Zolağı bağlayın, heyəti 50m təxliyyə edin və FHN Radiasiya Qəza Xidmətini çağırın.';
  } else if (gammaDoseRateUsvh >= 0.25 || neutronCps >= 4) {
    alarmLevel = 'ELEVATED_NON_HAZARDOUS';
    alarmLabelAz = 'YÜKSƏK FON — İkinci Dərəcəli İdentifikasiya Tələb Olunur';
    isRadiationSafe = false;
    radiologicalRiskScore = 52;
    actionProtocolAz = 'İzotop Analizatoru Standı: Əl spektrometri (RIID) ilə NORM (təbii radioaktiv material) yoxlaması aparılsın.';
  }

  return {
    gammaDoseRateUsvh,
    gammaBackgroundUsvh,
    gammaDeltaPercent,
    neutronCps,
    alarmLevel,
    alarmLabelAz,
    isRadiationSafe,
    radiologicalRiskScore,
    actionProtocolAz,
  };
};

/**
 * Calculates Statutory Customs Scanning Tariffs & Escort Fees
 */
export const calculateCustomsScanningFees = (
  scannerType: ScannerType,
  verdict: RadiographyVerdict,
  isRadiationAlarm: boolean,
  isGreenCorridor: boolean
): CustomsScanningFeeResult => {
  let baseScanFeeAzn = 30; // Standard 6 MeV gantry truck scan
  if (scannerType === 'RAIL_GANTRY_CARGO_6MEV') {
    baseScanFeeAzn = 40;
  } else if (scannerType === 'DRIVE_THROUGH_PORTAL_FAST') {
    baseScanFeeAzn = 25;
  }

  // Green Corridor 100% routine waiver
  const greenCorridorDiscountAzn = isGreenCorridor ? baseScanFeeAzn : 0;

  // Secondary rescan fee if suspicious or radiation elevated
  let rescanFeeAzn = 0;
  if (verdict === 'SUSPICIOUS_DENSITY' || isRadiationAlarm) {
    rescanFeeAzn = 50;
  }

  // Physical strip inspection escort fee
  let physicalEscortFeeAzn = 0;
  let k9InspectionFeeAzn = 0;
  let statutoryFineAzn = 0;
  let statutoryArticleAz = 'Gömrük Məcəlləsi Maddə 38 (Standart Qeyri-İntruziv Rentgen Baxışı)';

  if (verdict === 'CRITICAL_CONCEALMENT_DETECTED') {
    physicalEscortFeeAzn = 80;
    k9InspectionFeeAzn = 35;
    statutoryFineAzn = 1500; // Administrative code fine under Article 482
    statutoryArticleAz = 'İXM Maddə 482 (Gömrük nəzarətindən gizlədilmə və qanunsuz anbar tərtibatı — 1,500 AZN)';
  } else if (verdict === 'SUSPICIOUS_DENSITY') {
    physicalEscortFeeAzn = 40;
    statutoryArticleAz = 'Gömrük Məcəlləsi Maddə 42 (Qeyri-standart sıxlıq fərqinə görə əsaslandırılmış fiziki baxış)';
  }

  const totalPayableAzn = Math.max(
    0,
    baseScanFeeAzn -
      greenCorridorDiscountAzn +
      rescanFeeAzn +
      physicalEscortFeeAzn +
      k9InspectionFeeAzn +
      statutoryFineAzn
  );

  return {
    baseScanFeeAzn,
    greenCorridorDiscountAzn,
    rescanFeeAzn,
    physicalEscortFeeAzn,
    k9InspectionFeeAzn,
    statutoryFineAzn,
    totalPayableAzn,
    totalPayableUsd: Number(convertAzn(totalPayableAzn, 'USD').toFixed(2)),
    totalPayableEur: Number(convertAzn(totalPayableAzn, 'EUR').toFixed(2)),
    statutoryArticleAz,
  };
};

/**
 * Evaluates 10-Point Technical & Radiation Safety Checklist
 */
export const evaluateScannerChecklist = (
  completedItemIds: string[],
  totalItems: ScannerChecklistItem[]
): {
  totalCount: number;
  completedCount: number;
  mandatoryCount: number;
  completedMandatoryCount: number;
  complianceScorePercent: number;
  isAllMandatoryApproved: boolean;
  missingMandatoryItemsAz: string[];
} => {
  const totalCount = totalItems.length;
  const completedCount = completedItemIds.length;
  const mandatoryItems = totalItems.filter((item) => item.isMandatory);
  const mandatoryCount = mandatoryItems.length;

  const completedMandatory = mandatoryItems.filter((item) => completedItemIds.includes(item.id));
  const completedMandatoryCount = completedMandatory.length;

  const isAllMandatoryApproved = completedMandatoryCount === mandatoryCount;
  const complianceScorePercent = Math.round((completedCount / totalCount) * 100);

  const missingMandatoryItemsAz = mandatoryItems
    .filter((item) => !completedItemIds.includes(item.id))
    .map((item) => item.titleAz);

  return {
    totalCount,
    completedCount,
    mandatoryCount,
    completedMandatoryCount,
    complianceScorePercent,
    isAllMandatoryApproved,
    missingMandatoryItemsAz,
  };
};

/**
 * Evaluates Theoretical Customs NII Exam
 */
export const evaluateScannerExam = (
  answers: Record<string, number>,
  questions: ScannerExamQuestion[]
): {
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercent: number;
  isPassed: boolean; // Passing score >= 80% (8/10)
  detailedResults: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: number | undefined;
    correctAnswer: number;
    legalBasisAz: string;
  }>;
} => {
  const totalQuestions = questions.length;
  let correctAnswersCount = 0;

  const detailedResults = questions.map((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctOptionIndex;
    if (isCorrect) correctAnswersCount++;

    return {
      questionId: q.id,
      isCorrect,
      userAnswer,
      correctAnswer: q.correctOptionIndex,
      legalBasisAz: q.legalBasisAz,
    };
  });

  const scorePercent = Math.round((correctAnswersCount / totalQuestions) * 100);
  const isPassed = scorePercent >= 80;

  return {
    totalQuestions,
    correctAnswersCount,
    scorePercent,
    isPassed,
    detailedResults,
  };
};

/**
 * Generates Official Electronic Customs Clearance Certificate
 */
export const generateOfficialCustomsScannerCertificate = (
  truck: ScannedTruckPreset,
  checkpoint: CheckpointInfo,
  anomalyResult: RadiographyAnomalyResult,
  materialResult: MaterialDiscriminationResult,
  rpmResult: RpmTelemetryResult,
  feeResult: CustomsScanningFeeResult
): OfficialCustomsScannerCertificate => {
  const issueDateObj = new Date();
  const validUntilObj = new Date(issueDateObj.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days transit clearance

  const pad = (n: number) => n.toString().padStart(2, '0');
  const issueDate = `${issueDateObj.getFullYear()}-${pad(issueDateObj.getMonth() + 1)}-${pad(issueDateObj.getDate())}`;
  const validUntil = `${validUntilObj.getFullYear()}-${pad(validUntilObj.getMonth() + 1)}-${pad(validUntilObj.getDate())}`;

  const certNumber = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `DGK-SCAN-AZ-2026-${certNumber}`;

  // Simple deterministic SHA-256 style mock checksum
  const rawHash = `${certificateId}-${truck.trailerPlate}-${truck.customsManifestNumber}-${issueDate}`;
  let hashVal = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHash.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256SecurityChecksum = Math.abs(hashVal).toString(16).padStart(16, '0').toUpperCase();
  const simaDigitalUid = `SIMA-DGK-XRAY-${Math.abs(hashVal ^ 0xabcdef).toString(16).toUpperCase()}`;

  const laneNumber = Math.floor(1 + Math.random() * 4);
  const inspectorId = Math.floor(100 + Math.random() * 900);

  return {
    certificateId,
    issueDate,
    validUntil,
    trailerPlate: truck.trailerPlate,
    tractorPlate: truck.tractorPlate,
    driverNameAz: truck.driverNameAz,
    carrierNameAz: truck.carrierNameAz,
    customsManifestNumber: truck.customsManifestNumber,
    checkpointAz: checkpoint.nameAz,
    scannerModel: checkpoint.scannerModel,
    radiationEnergyMev: checkpoint.radiationEnergyMev,
    steelPenetrationMm: checkpoint.steelPenetrationMm,
    declaredCargoAz: truck.declaredCargoAz,
    declaredDensityGcm3: anomalyResult.declaredDensityGcm3,
    measuredDensityGcm3: anomalyResult.measuredDensityGcm3,
    materialDiscriminationAz: materialResult.materialLabelAz,
    effectiveAtomicNumberZ: materialResult.estimatedEffectiveAtomicNumber,
    rpmGammaUsvh: rpmResult.gammaDoseRateUsvh,
    rpmNeutronCps: rpmResult.neutronCps,
    radiographyVerdict: anomalyResult.verdict,
    verdictLabelAz: anomalyResult.verdictLabelAz,
    totalFeeAzn: feeResult.totalPayableAzn,
    customsInspectorBadge: `DGK-INSP-${inspectorId}`,
    inspectionLaneCode: `LANE-XRAY-0${laneNumber}`,
    sha256SecurityChecksum,
    simaDigitalUid,
  };
};
