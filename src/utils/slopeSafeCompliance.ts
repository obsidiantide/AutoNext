/**
 * Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Emergency Situations (FHN) &
 * Main State Traffic Police Department (BDYP)
 * Highway Landslide, Rockfall & Mountain Slope Stability SCADA,
 * Borehole Inclinometer, Geotechnical Pore-Pressure Telemetry &
 * Official SLOPE-SAFE-AZ-2026 Mountain Transit Portal Engine
 * (AAYDA, FHN & BDYP Dağ və Magistral Yollarda Sürüşmə, Qaya Uçqunu və Yamac Stabilliyi
 * Geotexniki SCADA Monitorinqi — İnklinometr, Piezometr, Tenzometr, Qoruyucu Tor Baryerləri
 * və Rəsmi SLOPE-SAFE-AZ-2026 Portalı)
 *
 * Statutory Framework:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21: Yol qurğularının, yamacların və dağ keçidlərinin mühəndis mühafizəsi)
 * - Law of the Republic of Azerbaijan "On Civil Defense & Emergency Situations" (Mülki müdafiə və fövqəladə hallar haqqında AR Qanunu)
 * - European Standard Eurocode 7 (EN 1997 Geotechnical Design) & AZS State Building Standards
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.1: Qadağanedici nişan və şlaqbaum tələbini pozma - 40 AZN cərimə, Maddə 353: Dağ yollarında iriqabaritli və ağırçəkili nəqliyyatın hərəkət qaydalarını pozma - 600 AZN cərimə)
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN = 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function formatCurrency(amountAzn: number, currency: Currency): string {
  const rate = CURRENCY_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '₼';
  const converted = amountAzn * rate;
  return `${converted.toFixed(2)} ${symbol}`;
}

export type SlopeAssetId =
  | 'mughanly_pass'
  | 'bayil_badamdar'
  | 'shahdag_rockfall'
  | 'lerik_talysh'
  | 'murovdag_transit'
  | 'dashalti_cliff';

export type SlopeStabilityRiskLevel = 'stable_green' | 'caution_yellow' | 'critical_orange' | 'emergency_red';
export type BarrierGateStatus = 'open_normal' | 'caution_speed_reduced' | 'single_lane_contraflow' | 'fully_barricaded_closed';
export type RockfallBarrierType = 'geobrugg_5000kj' | 'maccaferri_3000kj' | 'catch_fence_1500kj' | 'rock_shed_gallery';

export interface SlopeAsset {
  id: SlopeAssetId;
  nameAz: string;
  nameEn: string;
  highwayCode: string;
  locationAz: string;
  locationEn: string;
  altitudeMeters: number;
  slopeGradientDeg: number;
  slopeHeightMeters: number;
  geologicalCompositionAz: string;
  geologicalCompositionEn: string;
  defaultPorePressureKpa: number;
  criticalPorePressureKpa: number;
  defaultInclinometerVelocityMmDay: number;
  criticalInclinometerVelocityMmDay: number;
  defaultFoS: number;
  rockfallBarrierType: RockfallBarrierType;
  barrierEnergyCapacityKj: number;
  fhnDispatchStationAz: string;
  emergencyHotline: string;
  latitude: number;
  longitude: number;
}

export const SLOPE_REGISTRY: Record<SlopeAssetId, SlopeAsset> = {
  mughanly_pass: {
    id: 'mughanly_pass',
    nameAz: 'M-4 Muğanlı Aşırımı və Şamaxı Aktiv Sürüşmə Yamacı',
    nameEn: 'M-4 Mughanly Pass & Shamakhi Active Landslide Slope',
    highwayCode: 'M-4 (Km 104+200 - 108+600)',
    locationAz: 'Şamaxı-İsmayıllı dağlıq keçid dəhlizi',
    locationEn: 'Shamakhi-Ismayilli Mountain Pass Corridor',
    altitudeMeters: 820,
    slopeGradientDeg: 38,
    slopeHeightMeters: 140,
    geologicalCompositionAz: 'Gilli şistlər, qumdaşı layları və tektonik qırılma zonası',
    geologicalCompositionEn: 'Clay shales, sandstone strata, and tectonic fracture zone',
    defaultPorePressureKpa: 42,
    criticalPorePressureKpa: 95,
    defaultInclinometerVelocityMmDay: 1.2,
    criticalInclinometerVelocityMmDay: 8.0,
    defaultFoS: 1.45,
    rockfallBarrierType: 'geobrugg_5000kj',
    barrierEnergyCapacityKj: 5000,
    fhnDispatchStationAz: 'FHN Şamaxı Rayon Dövlət Yanğından Mühafizə Hissəsi №38 və Xüsusi Xilasetmə Dəstəsi',
    emergencyHotline: '+994 (20) 265-11-02 (FHN 112 / AAYDA 159)',
    latitude: 40.6318,
    longitude: 48.6145,
  },
  bayil_badamdar: {
    id: 'bayil_badamdar',
    nameAz: 'Bakı Bayıl-Badamdar Magistral Yamacı Aktiv Sürüşmə Sahəsi',
    nameEn: 'Baku Bayil-Badamdar Highway Slope Active Landslide Zone',
    highwayCode: 'Bayıl - 20-ci Sahə - Badamdar Magistralı',
    locationAz: 'Səbail rayonu, Badamdar yamacı kənarı',
    locationEn: 'Sabail District, Badamdar Slope Rim',
    altitudeMeters: 110,
    slopeGradientDeg: 34,
    slopeHeightMeters: 75,
    geologicalCompositionAz: 'Maykop gili layları, qrunt sularının təzyiqi və tektonik çatlaqlar',
    geologicalCompositionEn: 'Maikop clay strata, groundwater pore pressure and tectonic fissures',
    defaultPorePressureKpa: 35,
    criticalPorePressureKpa: 80,
    defaultInclinometerVelocityMmDay: 0.8,
    criticalInclinometerVelocityMmDay: 6.5,
    defaultFoS: 1.42,
    rockfallBarrierType: 'maccaferri_3000kj',
    barrierEnergyCapacityKj: 3000,
    fhnDispatchStationAz: 'FHN Xüsusi Riskli Xilasetmə Xidməti Mərkəzi Qərargahı',
    emergencyHotline: '+994 (12) 512-00-00 (FHN 112 / BDYP 902)',
    latitude: 40.3475,
    longitude: 49.8256,
  },
  shahdag_rockfall: {
    id: 'shahdag_rockfall',
    nameAz: 'R-1 Quba-Qusar-Şahdağ Dağ Yolu Qaya Uçqunu Zonası',
    nameEn: 'R-1 Guba-Gusar-Shahdag Mountain Road Rockfall Zone',
    highwayCode: 'R-1 (Km 32+600 - 35+100)',
    locationAz: 'Qusar rayonu, Laza-Şahdağ dərəsi',
    locationEn: 'Gusar District, Laza-Shahdag Valley',
    altitudeMeters: 1650,
    slopeGradientDeg: 55,
    slopeHeightMeters: 280,
    geologicalCompositionAz: 'Yura dövrü massiv əhəngdaşı qayaları və donma-ərimə çatları',
    geologicalCompositionEn: 'Jurassic massive limestone cliffs and freeze-thaw joints',
    defaultPorePressureKpa: 20,
    criticalPorePressureKpa: 60,
    defaultInclinometerVelocityMmDay: 0.4,
    criticalInclinometerVelocityMmDay: 5.0,
    defaultFoS: 1.48,
    rockfallBarrierType: 'geobrugg_5000kj',
    barrierEnergyCapacityKj: 5000,
    fhnDispatchStationAz: 'FHN Qusar Rayon Yanğından Mühafizə Hissəsi №45 və Dağ Xilasediciləri',
    emergencyHotline: '+994 (23) 385-28-01 (FHN 112 / AAYDA 159)',
    latitude: 41.3287,
    longitude: 48.1432,
  },
  lerik_talysh: {
    id: 'lerik_talysh',
    nameAz: 'R-48 Lənkəran-Lerik Dağ Serpantini Yamac Deformasiyası',
    nameEn: 'R-48 Lankaran-Lerik Mountain Serpentine Slope Zone',
    highwayCode: 'R-48 (Km 28+400 - 31+200)',
    locationAz: 'Lerik rayonu, Talış dağları meşə-qaya yamacı',
    locationEn: 'Lerik District, Talysh Mountains Forest-Cliff Slope',
    altitudeMeters: 960,
    slopeGradientDeg: 42,
    slopeHeightMeters: 160,
    geologicalCompositionAz: 'Vulkanogen çökmə süxurlar, gillər və intensiv subasma qatı',
    geologicalCompositionEn: 'Volcanogenic sedimentary rocks, clays and intense water seepage',
    defaultPorePressureKpa: 48,
    criticalPorePressureKpa: 105,
    defaultInclinometerVelocityMmDay: 1.4,
    criticalInclinometerVelocityMmDay: 9.0,
    defaultFoS: 1.32,
    rockfallBarrierType: 'maccaferri_3000kj',
    barrierEnergyCapacityKj: 3000,
    fhnDispatchStationAz: 'FHN Lerik Rayon Yanğından Mühafizə Hissəsi №42',
    emergencyHotline: '+994 (25) 274-41-01 (FHN 112 / AAYDA 159)',
    latitude: 38.7754,
    longitude: 48.4158,
  },
  murovdag_transit: {
    id: 'murovdag_transit',
    nameAz: 'M-2 Gəncə-Daşkəsən-Kəlbəcər Murovdağ Yamac Nəzarət Sahəsi',
    nameEn: 'M-2 Ganja-Dashkasan-Kalbajar Murovdag Slope Geotechnical Zone',
    highwayCode: 'R-19 / M-2 Keçidi (Km 48+150)',
    locationAz: 'Murovdağ silsiləsi yüksək dağlıq keçidi',
    locationEn: 'Murovdag Mountain Ridge High Alpine Pass',
    altitudeMeters: 2450,
    slopeGradientDeg: 48,
    slopeHeightMeters: 320,
    geologicalCompositionAz: 'Kristallik metamorfik süxurlar, tektonik qırılmalar və qar sürüşməsi',
    geologicalCompositionEn: 'Crystalline metamorphic rocks, fault lines and debris avalanches',
    defaultPorePressureKpa: 30,
    criticalPorePressureKpa: 75,
    defaultInclinometerVelocityMmDay: 0.6,
    criticalInclinometerVelocityMmDay: 5.5,
    defaultFoS: 1.40,
    rockfallBarrierType: 'geobrugg_5000kj',
    barrierEnergyCapacityKj: 5000,
    fhnDispatchStationAz: 'FHN Kəlbəcər Rayon Dövlət Yanğından Mühafizə Hissəsi №88',
    emergencyHotline: '+994 (22) 266-01-12 (FHN 112 / AAYDA 159)',
    latitude: 40.3129,
    longitude: 46.3218,
  },
  dashalti_cliff: {
    id: 'dashalti_cliff',
    nameAz: 'Zəfər Yolu Şuşa Daşaltı Dərəsi Qaya Uçqunu və Yamac Mühafizəsi',
    nameEn: 'Zafar Road Shusha Dashalti Gorge Rockfall & Slope Protection',
    highwayCode: 'Zəfər Yolu (Km 86+500 - 89+200)',
    locationAz: 'Şuşa şəhəri yaxınlığı, Daşaltı dərəsi sıldırımları',
    locationEn: 'Near Shusha City, Dashalti Gorge Vertical Cliffs',
    altitudeMeters: 1380,
    slopeGradientDeg: 62,
    slopeHeightMeters: 240,
    geologicalCompositionAz: 'Sıldırım dolomit əhəngdaşı divarları, karst boşluqları və qaya blokları',
    geologicalCompositionEn: 'Steep dolomite limestone walls, karst cavities and detached rock blocks',
    defaultPorePressureKpa: 25,
    criticalPorePressureKpa: 70,
    defaultInclinometerVelocityMmDay: 0.5,
    criticalInclinometerVelocityMmDay: 4.8,
    defaultFoS: 1.45,
    rockfallBarrierType: 'geobrugg_5000kj',
    barrierEnergyCapacityKj: 5000,
    fhnDispatchStationAz: 'FHN Şuşa Rayon Dövlət Yanğından Mühafizə Hissəsi №75',
    emergencyHotline: '+994 (26) 266-10-01 (FHN 112 / AAYDA 159)',
    latitude: 39.7542,
    longitude: 46.7485,
  },
};

export interface SlopeGeotechnicalTelemetry {
  poreWaterPressureKpa: number;
  inclinometerVelocityMmDay: number;
  extensometerApertureMm: number;
  acousticEmissionEventsHour: number;
  rainfallIntensityMmHour: number;
  rainfallCumulative24hMm: number;
  rockfallImpactDetected: boolean;
  boulderMassTons: number;
  impactVelocityMs: number;
  computedFactorOfSafety: number;
  computedRiskLevel: SlopeStabilityRiskLevel;
  barrierStatus: BarrierGateStatus;
  authorizedSpeedLimitKmH: number;
  heavyTruckProhibition: boolean;
  barrierEnergyAbsorptionKj: number;
  barrierAbsorptionMarginPct: number;
}

export function computeSlopeStability(
  asset: SlopeAsset,
  porePressureKpa: number,
  inclinometerMmDay: number,
  rainfallMmHour: number,
  boulderMassTons: number = 0,
  impactVelocityMs: number = 0
): SlopeGeotechnicalTelemetry {
  // Pore water pressure reduces effective stress: FoS degrades as pore pressure rises above baseline
  const excessPorePressure = Math.max(0, porePressureKpa - asset.defaultPorePressureKpa);
  const maxPorePressureDelta = Math.max(1, asset.criticalPorePressureKpa - asset.defaultPorePressureKpa);
  const porePressureRatio = excessPorePressure / maxPorePressureDelta;

  const excessInclinometer = Math.max(0, inclinometerMmDay - asset.defaultInclinometerVelocityMmDay);
  const maxInclinometerDelta = Math.max(0.1, asset.criticalInclinometerVelocityMmDay - asset.defaultInclinometerVelocityMmDay);
  const inclinometerRatio = excessInclinometer / maxInclinometerDelta;

  const rainSaturationFactor = Math.min(1.0, Math.max(0, rainfallMmHour - 5) / 45);

  // Bishop's simplified limit equilibrium proxy for Factor of Safety
  let computedFactorOfSafety = asset.defaultFoS - (porePressureRatio * 0.32) - (inclinometerRatio * 0.36) - (rainSaturationFactor * 0.15);
  computedFactorOfSafety = Math.max(0.65, Math.min(2.5, Number(computedFactorOfSafety.toFixed(2))));

  // Risk Level determination
  let computedRiskLevel: SlopeStabilityRiskLevel = 'stable_green';
  let barrierStatus: BarrierGateStatus = 'open_normal';
  let authorizedSpeedLimitKmH = 90;
  let heavyTruckProhibition = false;

  if (computedFactorOfSafety < 1.00 || inclinometerMmDay >= asset.criticalInclinometerVelocityMmDay) {
    computedRiskLevel = 'emergency_red';
    barrierStatus = 'fully_barricaded_closed';
    authorizedSpeedLimitKmH = 0;
    heavyTruckProhibition = true;
  } else if (computedFactorOfSafety < 1.15 || porePressureKpa >= asset.criticalPorePressureKpa * 0.90) {
    computedRiskLevel = 'critical_orange';
    barrierStatus = 'single_lane_contraflow';
    authorizedSpeedLimitKmH = 40;
    heavyTruckProhibition = true;
  } else if (computedFactorOfSafety < 1.30 || inclinometerMmDay >= asset.criticalInclinometerVelocityMmDay * 0.5) {
    computedRiskLevel = 'caution_yellow';
    barrierStatus = 'caution_speed_reduced';
    authorizedSpeedLimitKmH = 60;
    heavyTruckProhibition = false;
  } else {
    computedRiskLevel = 'stable_green';
    barrierStatus = 'open_normal';
    authorizedSpeedLimitKmH = 90;
    heavyTruckProhibition = false;
  }

  // Rockfall Kinetic Energy: E_k = 0.5 * m * v^2 (m in kg, v in m/s -> Joules / 1000 = kJ)
  const massKg = boulderMassTons * 1000;
  const rockfallImpactDetected = boulderMassTons > 0 && impactVelocityMs > 0;
  const barrierEnergyAbsorptionKj = rockfallImpactDetected ? Number(((0.5 * massKg * (impactVelocityMs ** 2)) / 1000).toFixed(1)) : 0;
  const barrierCapacity = asset.barrierEnergyCapacityKj;
  const barrierAbsorptionMarginPct = barrierCapacity > 0
    ? Number(Math.max(0, ((barrierCapacity - barrierEnergyAbsorptionKj) / barrierCapacity) * 100).toFixed(1))
    : 100;

  // Extensometer aperture proxy (crack opening)
  const extensometerApertureMm = Number((inclinometerMmDay * 1.8 + porePressureRatio * 2.2).toFixed(2));
  // Acoustic emission sensor events (cracking noise)
  const acousticEmissionEventsHour = Math.round(inclinometerMmDay * 12 + porePressureKpa * 0.8);
  const rainfallCumulative24hMm = Number((rainfallMmHour * 6.5).toFixed(1));

  return {
    poreWaterPressureKpa: porePressureKpa,
    inclinometerVelocityMmDay: inclinometerMmDay,
    extensometerApertureMm,
    acousticEmissionEventsHour,
    rainfallIntensityMmHour: rainfallMmHour,
    rainfallCumulative24hMm,
    rockfallImpactDetected,
    boulderMassTons,
    impactVelocityMs,
    computedFactorOfSafety,
    computedRiskLevel,
    barrierStatus,
    authorizedSpeedLimitKmH,
    heavyTruckProhibition,
    barrierEnergyAbsorptionKj,
    barrierAbsorptionMarginPct,
  };
}

export type VehicleCategory = 'passenger_car' | 'suv_4x4' | 'minibus_van' | 'bus_coach' | 'medium_truck' | 'heavy_freight_tir' | 'emergency_patrol';

export interface VehicleRestrictionAssessment {
  category: VehicleCategory;
  grossWeightTons: number;
  axleCount: number;
  isAllowedToTransit: boolean;
  isHeavyVehicleVibrationExempt: boolean;
  rejectionReasonAz: string | null;
  rejectionReasonEn: string | null;
  recommendedSpeedKmH: number;
  transitTariffAzn: number;
  geotechnicalMonitoringFeeAzn: number;
  statutoryFineAzn: number;
  discountedFineAzn: number;
}

export function evaluateVehicleTransitEligibility(
  category: VehicleCategory,
  grossWeightTons: number,
  telemetry: SlopeGeotechnicalTelemetry
): VehicleRestrictionAssessment {
  let isAllowedToTransit = true;
  let isHeavyVehicleVibrationExempt = false;
  let rejectionReasonAz: string | null = null;
  let rejectionReasonEn: string | null = null;
  let recommendedSpeedKmH = telemetry.authorizedSpeedLimitKmH;

  // Base state fee by vehicle type
  let transitTariffAzn = 15;
  if (category === 'suv_4x4') transitTariffAzn = 20;
  else if (category === 'minibus_van') transitTariffAzn = 25;
  else if (category === 'bus_coach') transitTariffAzn = 35;
  else if (category === 'medium_truck') transitTariffAzn = 40;
  else if (category === 'heavy_freight_tir') transitTariffAzn = 55;
  else if (category === 'emergency_patrol') {
    transitTariffAzn = 0;
    isHeavyVehicleVibrationExempt = true;
  }

  // Geotechnical SCADA maintenance fee (18% statutory engineering surcharge)
  const geotechnicalMonitoringFeeAzn = Number((transitTariffAzn * 0.18).toFixed(2));

  // Determine axle count estimate
  let axleCount = 2;
  if (category === 'heavy_freight_tir') axleCount = 5;
  else if (category === 'medium_truck' || category === 'bus_coach') axleCount = 3;

  // Evaluation based on SCADA risk
  if (telemetry.computedRiskLevel === 'emergency_red') {
    if (category !== 'emergency_patrol') {
      isAllowedToTransit = false;
      recommendedSpeedKmH = 0;
      rejectionReasonAz = 'FHN və AAYDA tərəfindən dağ yolu tamamilə bağlanmışdır (Aktiv qaya uçqunu və sürüşmə təhlükəsi)';
      rejectionReasonEn = 'Mountain highway is completely closed by FHN and AAYDA due to imminent landslide and rockfall';
    }
  } else if (telemetry.heavyTruckProhibition && grossWeightTons > 10 && category !== 'emergency_patrol') {
    isAllowedToTransit = false;
    recommendedSpeedKmH = 0;
    rejectionReasonAz = 'Yamacda plastik deformasiya səbəbindən çəkisi >10 ton olan ağır nəqliyyatın vibrasiya riski səbəbilə hərəkəti qadağandır';
    rejectionReasonEn = 'Heavy vehicles >10t prohibited due to destructive ground vibration accelerating slope slip failure';
  }

  // Statutory Administrative Fine calculation under Law on Automobile Roads & İXM Articles 327.1, 353
  let statutoryFineAzn = 0;
  if (!isAllowedToTransit) {
    if (grossWeightTons > 10) {
      statutoryFineAzn = 600; // İXM Article 353: Unauthorized heavy vehicle transit on restricted mountain pass
    } else {
      statutoryFineAzn = 40; // İXM Article 327.1: Failure to obey SCADA barrier and prohibitive road sign
    }
  }

  // 50% statutory early payment discount within 30 days
  const discountedFineAzn = Number((statutoryFineAzn * 0.5).toFixed(2));

  return {
    category,
    grossWeightTons,
    axleCount,
    isAllowedToTransit,
    isHeavyVehicleVibrationExempt,
    rejectionReasonAz,
    rejectionReasonEn,
    recommendedSpeedKmH,
    transitTariffAzn,
    geotechnicalMonitoringFeeAzn,
    statutoryFineAzn,
    discountedFineAzn,
  };
}

export interface GeotechnicalSafetyChecklistItem {
  id: string;
  categoryAz: string;
  categoryEn: string;
  titleAz: string;
  titleEn: string;
  standardReference: string;
  isCompliant: boolean;
  notesAz: string;
  notesEn: string;
}

export interface GeotechnicalSafetyChecklistResult {
  totalItems: number;
  compliantItems: number;
  complianceScorePct: number;
  passedInspection: boolean;
  criticalDefectsCount: number;
}

export function evaluateGeotechnicalChecklist(items: GeotechnicalSafetyChecklistItem[]): GeotechnicalSafetyChecklistResult {
  const totalItems = items.length;
  const compliantItems = items.filter(item => item.isCompliant).length;
  const complianceScorePct = totalItems > 0 ? Number(((compliantItems / totalItems) * 100).toFixed(1)) : 0;
  const criticalDefectsCount = totalItems - compliantItems;
  // Passing score: >= 80% and no more than 2 defects
  const passedInspection = complianceScorePct >= 80 && criticalDefectsCount <= 2;

  return {
    totalItems,
    compliantItems,
    complianceScorePct,
    passedInspection,
    criticalDefectsCount,
  };
}

export interface GeotechnicalExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
}

export interface GeotechnicalExamResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  isPassed: boolean;
}

export function evaluateGeotechnicalExam(
  questions: GeotechnicalExamQuestion[],
  selectedAnswers: Record<number, number>
): GeotechnicalExamResult {
  const totalQuestions = questions.length;
  let correctAnswers = 0;

  questions.forEach(q => {
    if (selectedAnswers[q.id] === q.correctOptionIndex) {
      correctAnswers++;
    }
  });

  const scorePercentage = totalQuestions > 0 ? Number(((correctAnswers / totalQuestions) * 100).toFixed(1)) : 0;
  // Passing standard: >= 80% (e.g. 8 out of 10)
  const isPassed = scorePercentage >= 80;

  return {
    totalQuestions,
    correctAnswers,
    scorePercentage,
    isPassed,
  };
}

export interface SlopeSafeCertificate {
  certificateId: string;
  issueTimestamp: string;
  expiryTimestamp: string;
  slopeAsset: SlopeAsset;
  vehiclePlate: string;
  vehicleCategory: VehicleCategory;
  grossWeightTons: number;
  factorOfSafety: number;
  measuredInclinometerMmDay: number;
  measuredPorePressureKpa: number;
  riskLevel: SlopeStabilityRiskLevel;
  barrierPassPin: string;
  simaDigitalSignatureHash: string;
  officialInspectorTitle: string;
  authorizedCorridorAz: string;
  authorizedCorridorEn: string;
  speedLimitKmH: number;
  totalDutyPaidAzn: number;
  verificationQrLink: string;
}

export function generateSlopeSafeCertificate(
  asset: SlopeAsset,
  vehiclePlate: string,
  category: VehicleCategory,
  grossWeightTons: number,
  telemetry: SlopeGeotechnicalTelemetry,
  transitAssessment: VehicleRestrictionAssessment
): SlopeSafeCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `SLOPE-SAFE-AZ-2026-${randomSuffix}`;
  const now = new Date();
  const issueTimestamp = now.toISOString();
  // Valid for 24 hours of mountain transit
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const expiryTimestamp = expiry.toISOString();

  // Pseudo-random 6-digit gate release PIN
  const barrierPassPin = String(Math.floor(100000 + Math.random() * 900000));
  // SHA-256 styled SİMA signature hash
  const hashSource = `${certificateId}:${asset.id}:${vehiclePlate}:${telemetry.computedFactorOfSafety}:${issueTimestamp}`;
  let hashNum = 0;
  for (let i = 0; i < hashSource.length; i++) {
    hashNum = (hashNum << 5) - hashNum + hashSource.charCodeAt(i);
    hashNum |= 0;
  }
  const simaDigitalSignatureHash = `SIMA-GEO-${Math.abs(hashNum).toString(16).toUpperCase()}-${Date.now().toString(16).toUpperCase()}`;

  const totalDutyPaidAzn = transitAssessment.transitTariffAzn + transitAssessment.geotechnicalMonitoringFeeAzn;
  const verificationQrLink = `https://aayda.gov.az/geotechnical-registry/verify?cert=${certificateId}&hash=${simaDigitalSignatureHash}`;

  return {
    certificateId,
    issueTimestamp,
    expiryTimestamp,
    slopeAsset: asset,
    vehiclePlate: vehiclePlate.toUpperCase().trim(),
    vehicleCategory: category,
    grossWeightTons,
    factorOfSafety: telemetry.computedFactorOfSafety,
    measuredInclinometerMmDay: telemetry.inclinometerVelocityMmDay,
    measuredPorePressureKpa: telemetry.poreWaterPressureKpa,
    riskLevel: telemetry.computedRiskLevel,
    barrierPassPin,
    simaDigitalSignatureHash,
    officialInspectorTitle: 'AAYDA & FHN Geotexniki Nəzarət və Seysmik Monitorinq Baş Mühəndisi',
    authorizedCorridorAz: `${asset.highwayCode} — ${asset.nameAz}`,
    authorizedCorridorEn: `${asset.highwayCode} — ${asset.nameEn}`,
    speedLimitKmH: telemetry.authorizedSpeedLimitKmH,
    totalDutyPaidAzn,
    verificationQrLink,
  };
}
