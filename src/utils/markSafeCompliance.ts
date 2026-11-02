/**
 * Highway Road Markings, Retroreflectivity (RL / Qd), Glass Bead Embedment & Wet Night Visibility Compliance Engine
 * Official standards compliance:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında hərəkətin təhlükəsizliyi, yol nişanlanması və infrastrukturun qorunması)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 60: Üfüqi və şaquli yol nişanlanması qaydaları, zolaq intizamı)
 * - State Standards of Azerbaijan AZS 410 / AZS 342 (Yol nişanlama xətlərinin həndəsi ölçüləri, boya qalınlığı və retrorefleksiya normativləri)
 * - European Standard EN 1436: Road marking materials - Road marking performance for road users (RL dry, Rw wet, Qd daytime luminance, Skid resistance SRT)
 * - European Standard EN 1423 / EN 1424: Drop-on and premix glass beads, anti-skid aggregates and their mixtures (Refractive index n=1.50 - 1.90, sphericity >= 80%)
 * - ASTM E1710: Standard Test Method for Measurement of Retroreflective Pavement Marking Materials with CEN-prescribed Geometry using a Portable Retroreflectometer
 * - ASTM E2177: Standard Test Method for Measuring the Coefficient of Retroreflected Luminance (RL) of Pavement Markings in a Condition of Wetness
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.1: Bütöv xəttin və nişanlama tələblərinin pozulması - 40 AZN)
 * - Code of Administrative Offences (İXM Maddə 327.2: İkiqat bütöv xəttin (1.3) tapdalanması və qarşı zolağa çıxma - 60 AZN + 3 cərimə balı)
 * - Code of Administrative Offences (İXM Maddə 353.1: Yol örtüyünə və ya nişanlama xətlərinə qanunsuz müdaxilə / zədələmə - 100-150 AZN)
 * - Code of Administrative Offences Article 38 (İXM Maddə 38: 30 gün ərzində 50% güzəştlə cərimə ödənişi)
 */

export type MarkingMaterialType =
  | 'THERMOPLASTIC_EXTRUDED'
  | 'COLD_PLASTIC_MMA'
  | 'WATERBORNE_ACRYLIC_PAINT'
  | 'POLYURETHANE_STRUCTURED_RIBBED';

export type MarkingLinePattern =
  | 'SOLID_DIVIDING_1_1'
  | 'DASHED_LANE_1_5'
  | 'DOUBLE_SOLID_1_3'
  | 'EDGE_LINE_1_2'
  | 'STRUCTURED_AUDIO_PROFILE';

export type GlassBeadCoatingType =
  | 'STANDARD_SODALIME_N15'
  | 'HIGH_INDEX_TITANIA_N19'
  | 'SILANE_ADHESION_COATED'
  | 'HYDROPHOBIC_DUAL_COATED';

export type MarkingSurfaceCondition =
  | 'DRY_STANDARD'
  | 'WET_RECOVERY_ASTM'
  | 'CONTINUOUS_RAIN_ASTM';

export type RetroreflectivityTier =
  | 'CLASS_R5_EXCEPTIONAL'
  | 'CLASS_R4_GOOD'
  | 'CLASS_R3_STATUTORY_MINIMUM'
  | 'CLASS_R2_DEFICIENT'
  | 'CLASS_R1_HAZARDOUS_FAILED';

export type PreviewSafetyStatus =
  | 'EXCELLENT_PREVIEW'
  | 'ADEQUATE_SAFETY_MARGIN'
  | 'BORDERLINE_PREVIEW_TIME'
  | 'CRITICAL_LANE_DEPARTURE_RISK';

export type VehicleMarkPresetCategory =
  | 'passenger_sedan'
  | 'high_riding_suv'
  | 'freight_semi_trailer'
  | 'intercity_coach'
  | 'electric_vehicle'
  | 'police_patrol_interceptor';

export interface MarkCorridorAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  chainageKm: string;
  materialType: MarkingMaterialType;
  linePattern: MarkingLinePattern;
  beadCoating: GlassBeadCoatingType;
  currentRlDry: number; // mcd/(m^2*lx)
  currentRwWet: number; // mcd/(m^2*lx)
  currentQd: number; // mcd/(m^2*lx)
  beadApplicationRateGPerM2: number;
  beadEmbedmentDepthPct: number;
  aadtTraffic: number;
  lastRepaintDate: string;
  scadaSensorCode: string;
}

export interface MarkVehiclePreset {
  id: string;
  category: VehicleMarkPresetCategory;
  nameAz: string;
  nameEn: string;
  licensePlate: string;
  headlightLumens: number;
  headlightCandela: number;
  nominalSpeedKmH: number;
  driverEyeHeightM: number;
  headlightMountHeightM: number;
  previewDemandSeconds: number;
}

export interface MarkSimulationInput {
  vehicleSpeedKmH: number;
  headlightIntensityCandela: number;
  beadEmbedmentPct: number; // 20% to 90%
  beadRoundnessPct: number; // 50% to 100%
  refractiveIndex: number; // 1.50 to 1.95
  beadApplicationRateGPerM2: number; // 150 to 650 g/m^2
  waterFilmThicknessMm: number; // 0.0 to 4.0 mm
  materialType: MarkingMaterialType;
  linePattern: MarkingLinePattern;
  surfaceCondition: MarkingSurfaceCondition;
  markingAgeMonths: number;
  annualTrafficAadt: number;
}

export interface MarkSimulationResult {
  dryRetroreflectivityRl: number; // mcd/(m^2*lx)
  effectiveWetRetroreflectivityRw: number; // mcd/(m^2*lx)
  daytimeLuminanceFactorQd: number; // mcd/(m^2*lx)
  retroreflectivityTier: RetroreflectivityTier;
  driverPreviewDistanceMeters: number; // preview sight distance in meters
  driverPreviewTimeSeconds: number; // preview time in seconds
  previewSafetyStatus: PreviewSafetyStatus;
  statutoryCompliancePassed: boolean;
  contrastRatioNight: number;
  glassBeadOpticalEfficiencyPct: number;
  waterSubmersionFactorPct: number;
  annualDegradationForecastMonths: number;
  recommendationAz: string;
  recommendationEn: string;
}

export interface MarkChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  category: 'geometry' | 'optics' | 'skid' | 'durability';
  standardRef: string;
  descriptionAz: string;
  descriptionEn: string;
  mandatory: boolean;
}

export interface MarkExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctIndex: number;
  legalCitation: string;
  explanationAz: string;
  explanationEn: string;
}

export interface MarkSanctionCalculation {
  statutoryBaseFineAzn: number;
  promptDiscountFineAzn: number; // 50% under İXM Article 38
  penaltyPoints: number;
  legalBasisAz: string;
  legalBasisEn: string;
  currencyEquivalentUsd: number;
  currencyEquivalentEur: number;
}

export interface MarkSafeCertificate {
  certificateUid: string;
  verificationPin: string;
  vehiclePlate: string;
  corridorId: string;
  measuredRlDry: number;
  measuredRwWet: number;
  measuredQd: number;
  tier: RetroreflectivityTier;
  previewDistanceMeters: number;
  previewTimeSeconds: number;
  safetyStatus: PreviewSafetyStatus;
  inspectionDateIso: string;
  validUntilIso: string;
  simaDigitalUid: string;
  sha256Checksum: string;
}

/**
 * Standard exchange rates for calculations
 */
export const AZN_TO_USD_RATE = 0.5882;
export const AZN_TO_EUR_RATE = 0.5405;

/**
 * Calculate glass bead optical efficiency based on embedment depth and sphericity
 * Optimum embedment depth according to EN 1423 is 50% - 60%.
 * Less than 40% leads to dislodgement under traffic; greater than 70% obscures internal reflection.
 */
export function calculateBeadOpticalEfficiency(
  embedmentPct: number,
  roundnessPct: number,
  refractiveIndex: number
): number {
  const clampedEmbed = Math.min(Math.max(embedmentPct, 20), 90);
  const clampedRound = Math.min(Math.max(roundnessPct, 50), 100);
  const clampedRi = Math.min(Math.max(refractiveIndex, 1.5), 1.95);

  // Peak efficiency bell curve centered around 55% embedment
  const embedDeviation = Math.abs(clampedEmbed - 55);
  const embedFactor = Math.max(0.15, 1 - Math.pow(embedDeviation / 40, 2));

  // Roundness factor: below 70% sphericity light scatters randomly
  const roundFactor = Math.max(0.3, (clampedRound - 40) / 60);

  // High-index titania beads (n=1.90) offer ~35% higher retroreflective yield than soda-lime (n=1.50)
  const riFactor = 1.0 + (clampedRi - 1.5) * 0.75;

  const rawEfficiency = embedFactor * roundFactor * riFactor * 100;
  return Math.min(Math.max(Math.round(rawEfficiency * 10) / 10, 15), 100);
}

/**
 * Calculate dry retroreflectivity (RL in mcd/(m^2*lx))
 */
export function calculateDryRetroreflectivity(
  materialType: MarkingMaterialType,
  beadEfficiencyPct: number,
  beadAppRateGPerM2: number,
  ageMonths: number,
  annualAadt: number
): number {
  // Baseline initial RL by material
  let baseRl = 320;
  switch (materialType) {
    case 'THERMOPLASTIC_EXTRUDED':
      baseRl = 380;
      break;
    case 'COLD_PLASTIC_MMA':
      baseRl = 460;
      break;
    case 'POLYURETHANE_STRUCTURED_RIBBED':
      baseRl = 520;
      break;
    case 'WATERBORNE_ACRYLIC_PAINT':
      baseRl = 260;
      break;
  }

  // Application rate scaling: standard rate is 400 g/m^2
  const appRateFactor = Math.min(1.25, Math.max(0.5, beadAppRateGPerM2 / 400));
  const opticalYield = beadEfficiencyPct / 100;

  // Traffic and environmental wear exponential decay
  // Average highway wear constant
  const wearConstant = (annualAadt / 15000) * 0.025;
  const degradationMultiplier = Math.exp(-wearConstant * (ageMonths / 12));

  const totalRl = baseRl * appRateFactor * opticalYield * degradationMultiplier;
  return Math.max(30, Math.round(totalRl));
}

/**
 * Calculate wet retroreflectivity (Rw in mcd/(m^2*lx))
 * Structured ribbed profiles retain drainage channels so beads remain above water film
 */
export function calculateWetRetroreflectivity(
  dryRl: number,
  waterFilmThicknessMm: number,
  linePattern: MarkingLinePattern,
  coatingType: GlassBeadCoatingType
): number {
  if (waterFilmThicknessMm <= 0.05) {
    return Math.round(dryRl * 0.9);
  }

  // Profile advantage: structured audio profiles sit 3-7 mm above surface, water drains freely
  const isStructured = linePattern === 'STRUCTURED_AUDIO_PROFILE';
  const profileWaterReduction = isStructured ? 0.35 : 1.0;

  // Effective water layer on top of beads
  const effectiveWaterDepth = waterFilmThicknessMm * profileWaterReduction;

  // Hydrophobic silicone/silane coatings reduce water film adhesion by 30%
  const coatingCoeff =
    coatingType === 'HYDROPHOBIC_DUAL_COATED'
      ? 0.7
      : coatingType === 'SILANE_ADHESION_COATED'
      ? 0.85
      : 1.0;

  const adjustedWaterDepth = effectiveWaterDepth * coatingCoeff;

  // Exponential specular mirror attenuation of beads under water
  // When completely submerged, standard glass beads lose Snell retroreflection angle
  const attenuation = Math.exp(-adjustedWaterDepth * 1.4);
  const wetRl = dryRl * Math.max(0.08, attenuation);

  return Math.max(15, Math.round(wetRl));
}

/**
 * Calculate daytime luminance factor Qd (mcd/(m^2*lx))
 */
export function calculateDaytimeLuminance(
  materialType: MarkingMaterialType,
  ageMonths: number
): number {
  let baseQd = 160;
  switch (materialType) {
    case 'COLD_PLASTIC_MMA':
      baseQd = 200;
      break;
    case 'THERMOPLASTIC_EXTRUDED':
      baseQd = 175;
      break;
    case 'POLYURETHANE_STRUCTURED_RIBBED':
      baseQd = 165;
      break;
    case 'WATERBORNE_ACRYLIC_PAINT':
      baseQd = 140;
      break;
  }
  const ageFactor = Math.max(0.65, 1 - (ageMonths / 48) * 0.35);
  return Math.round(baseQd * ageFactor);
}

/**
 * Determine EN 1436 and AZS 410 Retroreflectivity Tier
 * Minimum statutory threshold on Azerbaijani high-speed expressways is Class R3 (>= 150 mcd/(m^2*lx) dry)
 */
export function determineRetroreflectivityTier(rlDry: number): RetroreflectivityTier {
  if (rlDry >= 400) return 'CLASS_R5_EXCEPTIONAL';
  if (rlDry >= 250) return 'CLASS_R4_GOOD';
  if (rlDry >= 150) return 'CLASS_R3_STATUTORY_MINIMUM';
  if (rlDry >= 100) return 'CLASS_R2_DEFICIENT';
  return 'CLASS_R1_HAZARDOUS_FAILED';
}

/**
 * Calculate driver preview sight distance (meters) and preview time (seconds)
 * preview formula: D_vis = sqrt((RL * I_beam) / (E_th * 1000))
 * where I_beam is headlight candela, E_th is eye detection threshold illuminance
 */
export function calculateDriverPreviewMetrics(
  effectiveRl: number,
  headlightCandela: number,
  speedKmH: number
): { previewDistanceMeters: number; previewTimeSeconds: number; safetyStatus: PreviewSafetyStatus } {
  const speedMS = Math.max(5, speedKmH / 3.6);

  // Geometric optical formula for pavement marking preview distance (CEN 30m standard scaled)
  const previewDistance = Math.min(
    180,
    Math.max(15, Math.round(Math.sqrt((effectiveRl * headlightCandela) / 35000) * 3.6))
  );

  const previewTimeSeconds = Math.round((previewDistance / speedMS) * 10) / 10;

  let safetyStatus: PreviewSafetyStatus = 'CRITICAL_LANE_DEPARTURE_RISK';
  if (previewTimeSeconds >= 3.2) {
    safetyStatus = 'EXCELLENT_PREVIEW';
  } else if (previewTimeSeconds >= 2.5) {
    safetyStatus = 'ADEQUATE_SAFETY_MARGIN';
  } else if (previewTimeSeconds >= 1.8) {
    safetyStatus = 'BORDERLINE_PREVIEW_TIME';
  } else {
    safetyStatus = 'CRITICAL_LANE_DEPARTURE_RISK';
  }

  return {
    previewDistanceMeters: previewDistance,
    previewTimeSeconds,
    safetyStatus
  };
}

/**
 * Execute full road marking simulation
 */
export function executeMarkSimulation(input: MarkSimulationInput): MarkSimulationResult {
  const beadEff = calculateBeadOpticalEfficiency(
    input.beadEmbedmentPct,
    input.beadRoundnessPct,
    input.refractiveIndex
  );

  const dryRl = calculateDryRetroreflectivity(
    input.materialType,
    beadEff,
    input.beadApplicationRateGPerM2,
    input.markingAgeMonths,
    input.annualTrafficAadt
  );

  const coating: GlassBeadCoatingType =
    input.refractiveIndex >= 1.85
      ? 'HIGH_INDEX_TITANIA_N19'
      : input.beadEmbedmentPct > 70
      ? 'SILANE_ADHESION_COATED'
      : 'HYDROPHOBIC_DUAL_COATED';

  const wetRw = calculateWetRetroreflectivity(
    dryRl,
    input.waterFilmThicknessMm,
    input.linePattern,
    coating
  );

  const effectiveRl = input.surfaceCondition === 'DRY_STANDARD' ? dryRl : wetRw;
  const qd = calculateDaytimeLuminance(input.materialType, input.markingAgeMonths);
  const tier = determineRetroreflectivityTier(effectiveRl);

  const preview = calculateDriverPreviewMetrics(
    effectiveRl,
    input.headlightIntensityCandela,
    input.vehicleSpeedKmH
  );

  const statutoryPassed = effectiveRl >= 150 && preview.previewTimeSeconds >= 2.5;

  // Contrast ratio on dark asphalt (assuming asphalt background luminance ~12 mcd)
  const contrastRatio = Math.round((effectiveRl / 14) * 10) / 10;

  // Water submersion factor %
  const waterSubmersionPct = Math.min(100, Math.round(input.waterFilmThicknessMm * 38));

  // Months remaining before falling below statutory threshold 150 mcd
  const wearPerMonth = Math.max(1.5, (input.annualTrafficAadt / 25000) * 3.5);
  const degradationMonths = Math.max(
    0,
    Math.round((dryRl - 150) / wearPerMonth)
  );

  let recommendationAz = 'Yol nişanlama xətləri AZS 410 və EN 1436 normativlərinə tam cavab verir.';
  let recommendationEn = 'Road markings fully comply with AZS 410 and EN 1436 standards.';

  if (!statutoryPassed) {
    if (preview.safetyStatus === 'CRITICAL_LANE_DEPARTURE_RISK') {
      recommendationAz =
        'TƏCİLİ XƏBƏRDARLIQ: Retrorefleksiya böhran həddindən aşağıdır! Gecə zolaqdan çıxma riski yüksəkdir. AAYDA tərəfindən təkrar termoplastik çəkilməsi tələb olunur.';
      recommendationEn =
        'CRITICAL ALERT: Retroreflectivity is below legal minimum! High lane departure risk. Urgent repainting required by AAYDA.';
    } else {
      recommendationAz =
        'Retrorefleksiya qanuni minimuma yaxındır. Yağışlı havada mikrosferlərin su altında qalması səbəbilə profil strukturlu xətlərin tətbiqi tövsiyə olunur.';
      recommendationEn =
        'Retroreflectivity is borderline. Structured ribbed profile markings recommended to prevent water flooding in wet weather.';
    }
  }

  return {
    dryRetroreflectivityRl: dryRl,
    effectiveWetRetroreflectivityRw: wetRw,
    daytimeLuminanceFactorQd: qd,
    retroreflectivityTier: tier,
    driverPreviewDistanceMeters: preview.previewDistanceMeters,
    driverPreviewTimeSeconds: preview.previewTimeSeconds,
    previewSafetyStatus: preview.safetyStatus,
    statutoryCompliancePassed: statutoryPassed,
    contrastRatioNight: contrastRatio,
    glassBeadOpticalEfficiencyPct: beadEff,
    waterSubmersionFactorPct: waterSubmersionPct,
    annualDegradationForecastMonths: degradationMonths,
    recommendationAz,
    recommendationEn
  };
}

/**
 * Calculate statutory administrative fine under Azerbaijan Code of Administrative Offences
 * - İXM Article 327.1: Violation of road markings (bütöv xəttin tələbinin pozulması) - 40 AZN
 * - İXM Article 327.2: Crossing double solid line 1.3 into oncoming lane - 60 AZN + 3 points
 * - İXM Article 353.1: Damaging road markings or unauthorized interference - 150 AZN
 * Article 38 grants 50% prompt discount if paid within 30 days.
 */
export function calculateMarkSanction(
  violationType: 'LINE_DEPARTURE_327_1' | 'DOUBLE_SOLID_CROSSING_327_2' | 'MARKING_DAMAGE_353'
): MarkSanctionCalculation {
  let baseFine = 40;
  let points = 0;
  let basisAz = 'İXM Maddə 327.1 - Yol nişanlarının və ya yolun hərəkət hissəsinin nişanlanması tələblərinə riayət edilməməsi';
  let basisEn = 'Article 327.1 - Disobedience to road markings and lane demarcation requirements';

  switch (violationType) {
    case 'DOUBLE_SOLID_CROSSING_327_2':
      baseFine = 60;
      points = 3;
      basisAz = 'İXM Maddə 327.2 - 1.1 və ya 1.3 ikiqat bütöv xəttin tələblərini pozaraq qarşı hərəkət zolağına çıxma';
      basisEn = 'Article 327.2 - Crossing double solid marking 1.3 into oncoming traffic lane';
      break;
    case 'MARKING_DAMAGE_353':
      baseFine = 150;
      points = 0;
      basisAz = 'İXM Maddə 353.1 - Yol örtüyünə, termoplastik nişanlama zolaqlarına və ya qurğularına zərər yetirilməsi';
      basisEn = 'Article 353.1 - Damaging road markings, thermoplastic layers, or highway fixtures';
      break;
  }

  const promptFine = Math.round(baseFine * 0.5);

  return {
    statutoryBaseFineAzn: baseFine,
    promptDiscountFineAzn: promptFine,
    penaltyPoints: points,
    legalBasisAz: basisAz,
    legalBasisEn: basisEn,
    currencyEquivalentUsd: Math.round(promptFine * AZN_TO_USD_RATE * 100) / 100,
    currencyEquivalentEur: Math.round(promptFine * AZN_TO_EUR_RATE * 100) / 100
  };
}

/**
 * Generate official MARK-SAFE-AZ-2026 Electronic Clearance Certificate
 */
export function generateMarkSafeCertificate(
  plate: string,
  corridorId: string,
  simResult: MarkSimulationResult
): MarkSafeCertificate {
  const now = new Date();
  const validUntil = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months validity

  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
  const uid = `MARK-SAFE-AZ-2026-${randomHex}`;
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const simaUid = `SIMA-MARK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // Deterministic fake SHA-256 digest
  const rawHashInput = `${uid}:${plate}:${corridorId}:${simResult.dryRetroreflectivityRl}:${now.toISOString()}`;
  let hashVal = 0x811c9dc5;
  for (let i = 0; i < rawHashInput.length; i++) {
    hashVal ^= rawHashInput.charCodeAt(i);
    hashVal = (hashVal * 0x01000193) >>> 0;
  }
  const sha256 = `SHA256-${hashVal.toString(16).toUpperCase().padStart(8, '0')}-${randomHex}`;

  return {
    certificateUid: uid,
    verificationPin: pin,
    vehiclePlate: plate,
    corridorId,
    measuredRlDry: simResult.dryRetroreflectivityRl,
    measuredRwWet: simResult.effectiveWetRetroreflectivityRw,
    measuredQd: simResult.daytimeLuminanceFactorQd,
    tier: simResult.retroreflectivityTier,
    previewDistanceMeters: simResult.driverPreviewDistanceMeters,
    previewTimeSeconds: simResult.driverPreviewTimeSeconds,
    safetyStatus: simResult.previewSafetyStatus,
    inspectionDateIso: now.toISOString(),
    validUntilIso: validUntil.toISOString(),
    simaDigitalUid: simaUid,
    sha256Checksum: sha256
  };
}
