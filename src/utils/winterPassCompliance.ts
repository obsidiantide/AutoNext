/**
 * Official State Motor Road Agency (AAYDA), BDYP & Ministry of Emergency Situations (FHN)
 * Mountain Pass Avalanche, Landslide & Winter Road Safety Compliance Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Road Traffic" (YHQ Articles 37, 49, 52)
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (AR Qanunu № 798-IQ)
 * - Code of Administrative Offences (İXM Article 342.1.5 - winter equipment & chains violations, 50 AZN fine)
 * - Code of Administrative Offences (İXM Article 327 - ignoring emergency avalanche/blizzard road closures, 100 AZN fine)
 * - AAYDA Winter Road Maintenance & Exploitation Regulations (Qış Mövsümündə Yolların Mühafizəsi Təlimatı)
 * - European Standards EN 16811 (Winter Service Equipment & De-Icing Reagents) & ISO 14382 (Tire Chains)
 */

export type MountainPassId =
  | 'm4_agsu_pass'
  | 'r1_shahdag_laza'
  | 'r19_murovdag_pass'
  | 'r22_ismayilli_muganli'
  | 'r25_gedebey_pass'
  | 'r48_lerik_pass';

export type PassOperationalStatus =
  | 'open_all'
  | 'chains_required'
  | 'heavy_truck_restricted'
  | 'full_closure';

export type AvalancheHazardLevel = 1 | 2 | 3 | 4 | 5;

export type DeIcingReagentType =
  | 'nacl_salt'
  | 'cacl2_liquid'
  | 'bischofite_mgcl2'
  | 'sand_salt_mix';

export type DriveType = 'fwd' | 'rwd' | 'awd_4x4';

export type ChainPatternType =
  | 'diamond_steel_12mm'
  | 'diamond_steel_9mm'
  | 'ladder_steel'
  | 'textile_snow_socks';

export type MachineryType =
  | 'snow_plow_blade'
  | 'rotary_snow_blower'
  | 'salt_brine_spreader'
  | 'fhn_crawler_tractor';

export type Currency = 'AZN' | 'USD' | 'EUR';

export const AZN_TO_USD = 0.5882; // 1 USD ≈ 1.70 AZN
export const AZN_TO_EUR = 0.5405; // 1 EUR ≈ 1.85 AZN

export interface RWISTelemetry {
  ambientTempC: number;
  roadTempC: number;
  snowDepthCm: number;
  iceThicknessMm: number;
  frictionCoeff: number; // 0.05 (glaze ice) to 0.85 (dry asphalt)
  windGustKmh: number;
  visibilityM: number;
  avalancheRisk: AvalancheHazardLevel;
  status: PassOperationalStatus;
  advisoryAz: string;
  advisoryEn: string;
  fineRiskAzn: number;
}

export interface MountainPassInfo {
  id: MountainPassId;
  nameAz: string;
  nameEn: string;
  highwayCode: string;
  elevationM: number;
  segmentLengthKm: number;
  serpentineTurns: number;
  maxGradientPct: number;
  districtAz: string;
  districtEn: string;
  coordinates: { lat: number; lng: number };
  nearestDepotAz: string;
  nearestDepotEn: string;
  depotDistanceKm: number;
  webcamUrl: string;
  rwisStationCode: string;
}

export interface DeIcingCalculationResult {
  reagent: DeIcingReagentType;
  reagentNameAz: string;
  reagentNameEn: string;
  roadTempC: number;
  iceThicknessMm: number;
  dosageGm2: number;
  roadLengthKm: number;
  roadWidthM: number;
  coverageAreaM2: number;
  totalReagentKg: number;
  totalReagentTons: number;
  materialCostAzn: number;
  equipmentSpreadingCostAzn: number;
  vat18Azn: number;
  totalCostAzn: number;
  totalCostUsd: number;
  totalCostEur: number;
  freezingPointDepressionC: number;
  environmentalImpactAz: string;
  environmentalImpactEn: string;
}

export interface ChainComplianceResult {
  driveType: DriveType;
  chainPattern: ChainPatternType;
  tireWidthMm: number;
  wheelArchClearanceMm: number;
  compliant: boolean;
  maxAllowedSpeedKmh: number;
  driveAxlePlacementAz: string;
  driveAxlePlacementEn: string;
  fineRiskAzn: number;
  recommendationsAz: string[];
  recommendationsEn: string[];
}

export interface MachineryDispatchResult {
  machineryType: MachineryType;
  machineryNameAz: string;
  machineryNameEn: string;
  passId: MountainPassId;
  depotNameAz: string;
  depotNameEn: string;
  depotDistanceKm: number;
  transitSpeedKmh: number;
  etaMinutes: number;
  clearingCapacityMetric: string;
  fuelConsumptionLiters: number;
  operationalCostAzn: number;
  operationalCostUsd: number;
  operationalCostEur: number;
  dispatchPriority: 'standard' | 'urgent' | 'emergency';
}

export interface WinterSafetyChecklistItem {
  id: string;
  labelAz: string;
  labelEn: string;
  regulatoryCode: string;
  critical: boolean;
}

export interface WinterExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  legalCitation: string;
}

export interface WinterPassCertificate {
  certificateId: string;
  vehiclePlate: string;
  vin: string;
  passId: MountainPassId;
  passNameAz: string;
  passNameEn: string;
  issueDate: string;
  validUntil: string;
  clearanceStatus: 'cleared_full' | 'cleared_chains_only' | 'prohibited_transit';
  driveType: DriveType;
  tireChainCertified: boolean;
  rwisFrictionCoeff: number;
  avalancheRating: number;
  roadInspectorBadge: string;
  simaDigitalUid: string;
  sha256Checksum: string;
}

/**
 * Currency conversion helper
 */
export function convertAznTo(amountAzn: number, currency: Currency): number {
  if (currency === 'AZN') return Math.round(amountAzn * 100) / 100;
  if (currency === 'USD') return Math.round((amountAzn / 1.70) * 100) / 100;
  return Math.round((amountAzn / 1.85) * 100) / 100;
}

/**
 * Evaluates RWIS (Road Weather Information System) telemetry and determines road operational status
 */
export function evaluateRwisTelemetry(params: {
  roadTempC: number;
  snowDepthCm: number;
  iceThicknessMm: number;
  frictionCoeff: number;
  windGustKmh: number;
  visibilityM: number;
  avalancheRisk: AvalancheHazardLevel;
}): RWISTelemetry {
  const {
    roadTempC,
    snowDepthCm,
    iceThicknessMm,
    frictionCoeff,
    windGustKmh,
    visibilityM,
    avalancheRisk,
  } = params;

  let status: PassOperationalStatus = 'open_all';
  let fineRiskAzn = 0;
  let advisoryAz = 'Aşırımda hərəkət bütün növ nəqliyyat vasitələri üçün açıqdır. Standart sürət rejiminə riayət edin.';
  let advisoryEn = 'Pass is fully open for all vehicles. Observe standard mountain driving precautions.';

  // Critical closure triggers: high avalanche danger, extreme snow drifts, or near-zero visibility
  if (avalancheRisk >= 4 || snowDepthCm > 40 || visibilityM < 20 || windGustKmh > 90) {
    status = 'full_closure';
    fineRiskAzn = 100; // İXM Article 327
    advisoryAz = 'TƏHLÜKƏ! Qar uçqunu və ya şiddətli çovğun səbəbindən aşırım tam bağlanıb. Giriş qadağandır (İXM Maddə 327: 100 AZN cərimə).';
    advisoryEn = 'DANGER! Complete pass closure due to avalanche hazard or blizzard. Entry strictly prohibited (İXM Art. 327: 100 AZN fine).';
  } else if (iceThicknessMm > 5 || frictionCoeff < 0.25 || snowDepthCm > 15 || avalancheRisk === 3) {
    status = 'chains_required';
    fineRiskAzn = 50; // İXM Article 342.1.5
    advisoryAz = 'DİQQƏT! Şaxta və buzlaşma səbəbindən hərəkətə YALNIZ təkər zənciri və ya 4x4 tam ötürücülü maşınlara icazə verilir (İXM Maddə 342.1.5: 50 AZN).';
    advisoryEn = 'CAUTION! Severe icing/snow. Transit strictly restricted to vehicles equipped with tire chains or 4WD (İXM Art. 342.1.5: 50 AZN fine).';
  } else if (frictionCoeff < 0.35 || snowDepthCm > 8 || roadTempC <= -3) {
    status = 'heavy_truck_restricted';
    fineRiskAzn = 50;
    advisoryAz = 'Sürüşkən yol və enişli-yoxuşlu döngələr səbəbilə qoşqulu ağır yük maşınlarının (TIR) hərəkəti məhdudlaşdırılıb.';
    advisoryEn = 'Heavy articulated transport (TIR) restricted due to slippery gradient and hairpin switchbacks.';
  }

  return {
    ambientTempC: roadTempC - 2,
    roadTempC,
    snowDepthCm,
    iceThicknessMm,
    frictionCoeff,
    windGustKmh,
    visibilityM,
    avalancheRisk,
    status,
    advisoryAz,
    advisoryEn,
    fineRiskAzn,
  };
}

/**
 * Calculates chemical de-icing treatment requirements (grams/m², tons, costs)
 */
export function calculateDeIcingRequirements(
  reagent: DeIcingReagentType,
  roadTempC: number,
  iceThicknessMm: number,
  roadLengthKm: number,
  roadWidthM: number = 7.5,
  currency: Currency = 'AZN'
): DeIcingCalculationResult {
  const coverageAreaM2 = Math.round(roadLengthKm * 1000 * roadWidthM);

  // Base dosage in g/m² and cost in AZN/kg
  let baseDosageGm2 = 25;
  let unitCostAznPerKg = 0.20;
  let reagentNameAz = 'Texniki Duz (NaCl)';
  let reagentNameEn = 'Technical Rock Salt (NaCl)';
  let freezingPointDepressionC = -10;
  let environmentalImpactAz = 'Orta səviyyəli torpaq və metal korroziyası riski.';
  let environmentalImpactEn = 'Moderate soil salinity and metal corrosion risk.';

  switch (reagent) {
    case 'nacl_salt':
      baseDosageGm2 = 25;
      unitCostAznPerKg = 0.22;
      reagentNameAz = 'Bərk Texniki Duz (NaCl)';
      reagentNameEn = 'Technical Rock Salt (NaCl)';
      freezingPointDepressionC = -10;
      environmentalImpactAz = 'Orta səviyyəli korroziya; -10°C-dən aşağı temperaturda effektivliyi kəskin düşür.';
      environmentalImpactEn = 'Moderate corrosion; effectiveness drops significantly below -10°C.';
      break;

    case 'cacl2_liquid':
      baseDosageGm2 = 20;
      unitCostAznPerKg = 0.65;
      reagentNameAz = 'Kalsium Xlorid Məhlulu (CaCl₂)';
      reagentNameEn = 'Calcium Chloride Brine (CaCl₂)';
      freezingPointDepressionC = -25;
      environmentalImpactAz = 'Sürətli ekzotermik ərimə; -25°C-dək buz qatını effektiv parçalayır.';
      environmentalImpactEn = 'Rapid exothermic reaction; effectively melts glaze ice down to -25°C.';
      break;

    case 'bischofite_mgcl2':
      baseDosageGm2 = 30;
      unitCostAznPerKg = 0.85;
      reagentNameAz = 'Bişofit / Maqnezium Xlorid (MgCl₂)';
      reagentNameEn = 'Bischofite / Magnesium Chloride (MgCl₂)';
      freezingPointDepressionC = -30;
      environmentalImpactAz = 'Ekoloji təmiz mineral; avtomobil kuzovuna və bitki örtüyünə minimal təsir göstərir.';
      environmentalImpactEn = 'Eco-friendly natural mineral; minimal vehicle underbody and flora corrosion.';
      break;

    case 'sand_salt_mix':
      baseDosageGm2 = 200;
      unitCostAznPerKg = 0.08;
      reagentNameAz = 'Qum-Duz Qarışığı (70/30 Qum + NaCl)';
      reagentNameEn = 'Sand-Salt Mixture (70% Sand / 30% NaCl)';
      freezingPointDepressionC = -15;
      environmentalImpactAz = 'Aşındırıcı sürtünmə artırıcı; dik dağ döngələrində dərhal ilişmə təmin edir.';
      environmentalImpactEn = 'Abrasive traction booster; provides instantaneous grip on steep switchbacks.';
      break;
  }

  // Multiplier for cold pavement temperature
  let tempMultiplier = 1.0;
  if (roadTempC < -15) tempMultiplier = 2.0;
  else if (roadTempC < -8) tempMultiplier = 1.5;
  else if (roadTempC < -3) tempMultiplier = 1.2;

  // Multiplier for ice thickness
  const iceMultiplier = Math.max(1.0, 1 + iceThicknessMm * 0.12);

  const dosageGm2 = Math.round(baseDosageGm2 * tempMultiplier * iceMultiplier);
  const totalReagentKg = Math.round((dosageGm2 * coverageAreaM2) / 1000);
  const totalReagentTons = Math.round((totalReagentKg / 1000) * 100) / 100;

  const materialCostAzn = Math.round(totalReagentKg * unitCostAznPerKg * 100) / 100;
  // Machinery spreading overhead (e.g. 15 AZN per km)
  const equipmentSpreadingCostAzn = Math.round(roadLengthKm * 18 * 100) / 100;
  const subtotalAzn = materialCostAzn + equipmentSpreadingCostAzn;
  const vat18Azn = Math.round(subtotalAzn * 0.18 * 100) / 100;
  const totalCostAzn = Math.round((subtotalAzn + vat18Azn) * 100) / 100;

  return {
    reagent,
    reagentNameAz,
    reagentNameEn,
    roadTempC,
    iceThicknessMm,
    dosageGm2,
    roadLengthKm,
    roadWidthM,
    coverageAreaM2,
    totalReagentKg,
    totalReagentTons,
    materialCostAzn,
    equipmentSpreadingCostAzn,
    vat18Azn,
    totalCostAzn,
    totalCostUsd: convertAznTo(totalCostAzn, 'USD'),
    totalCostEur: convertAznTo(totalCostAzn, 'EUR'),
    freezingPointDepressionC,
    environmentalImpactAz,
    environmentalImpactEn,
  };
}

/**
 * Checks tire chain compliance based on drive type, pattern, and road clearances
 */
export function calculateTireChainCompliance(
  driveType: DriveType,
  chainPattern: ChainPatternType,
  tireWidthMm: number,
  wheelArchClearanceMm: number,
  targetPassStatus: PassOperationalStatus = 'chains_required'
): ChainComplianceResult {
  const recommendationsAz: string[] = [];
  const recommendationsEn: string[] = [];
  let compliant = true;
  let fineRiskAzn = 0;

  let driveAxlePlacementAz = 'Ön ötürücü təkərlər (Ön ox)';
  let driveAxlePlacementEn = 'Front drive wheels (Front axle)';

  if (driveType === 'rwd') {
    driveAxlePlacementAz = 'Arxa ötürücü təkərlər (Arxa ox)';
    driveAxlePlacementEn = 'Rear drive wheels (Rear axle)';
  } else if (driveType === 'awd_4x4') {
    driveAxlePlacementAz = 'Bütün 4 təkərə və ya əsas çəkici ön oxa';
    driveAxlePlacementEn = 'All 4 wheels or primary front drive axle';
  }

  // Wheel arch clearance check (ISO 14382 recommends at least 12-15mm clearance)
  if (wheelArchClearanceMm < 14) {
    compliant = false;
    recommendationsAz.push(
      'Təkər arkası məsafəsi çox kiçikdir (<14mm). Polad zəncir asqı qollarına və ya qanada zərər vura bilər.'
    );
    recommendationsEn.push(
      'Wheel arch clearance insufficient (<14mm). Steel chains may impact suspension components or bodywork.'
    );
  }

  // Textile socks vs heavy steel chains
  if (chainPattern === 'textile_snow_socks' && targetPassStatus === 'chains_required') {
    compliant = false;
    fineRiskAzn = 50;
    recommendationsAz.push(
      'Tekstil qar corabları sərt dağ aşırımlarında dövlət tərəfindən icazə verilən metal zəncir hesab edilmir (İXM Maddə 342.1.5: 50 AZN cərimə).'
    );
    recommendationsEn.push(
      'Textile snow socks do not qualify as certified metallic snow chains on official mountain passes (İXM Art. 342.1.5: 50 AZN fine).'
    );
  } else if (chainPattern === 'ladder_steel') {
    recommendationsAz.push(
      'Pilləkən tipli zəncir düz xətdə çəki təmin etsə də, döngələrdə yan sürüşmə riskini artırır. Romb şəkilli tövsiyə olunur.'
    );
    recommendationsEn.push(
      'Ladder chain provides longitudinal traction but lower lateral stability on mountain serpentines. Diamond pattern recommended.'
    );
  } else {
    recommendationsAz.push(
      'Sertifikatlaşdırılmış romb formalı polad zəncir dağ döngələrində maksimum yan ilişmə və təhlükəsizlik təmin edir.'
    );
    recommendationsEn.push(
      'Certified diamond steel chains provide optimal lateral grip and steering stability in mountain switchbacks.'
    );
  }

  if (targetPassStatus === 'full_closure') {
    compliant = false;
    fineRiskAzn = 100;
    recommendationsAz.push('Aşırım tam bağlıdır. Zəncir olsa belə keçid qəti qadağandır!');
    recommendationsEn.push('Pass is fully closed. Transit strictly prohibited even with chains equipped!');
  }

  return {
    driveType,
    chainPattern,
    tireWidthMm,
    wheelArchClearanceMm,
    compliant,
    maxAllowedSpeedKmh: 50, // Strict statutory 50 km/h limit with tire chains
    driveAxlePlacementAz,
    driveAxlePlacementEn,
    fineRiskAzn,
    recommendationsAz,
    recommendationsEn,
  };
}

/**
 * Dispatches winter heavy road maintenance equipment to a target pass
 */
export function dispatchWinterMachinery(
  passId: MountainPassId,
  machinery: MachineryType,
  depotDistanceKm: number,
  priority: 'standard' | 'urgent' | 'emergency' = 'standard'
): MachineryDispatchResult {
  let machineryNameAz = 'Kamaz-43118 6x6 Qar Kürəyən və Qum Səpən';
  let machineryNameEn = 'Kamaz-43118 6x6 Snow Plow & Salt Spreader';
  let transitSpeedKmh = 45;
  let clearingCapacityMetric = '30 km/saat qar təmizləmə zolağı';
  let hourlyRateAzn = 85;
  let fuelConsumptionLiters = Math.round(depotDistanceKm * 0.45);

  switch (machinery) {
    case 'snow_plow_blade':
      machineryNameAz = 'MAN TGS 6x6 Ön Kürəkli Qar Təmizləyən';
      machineryNameEn = 'MAN TGS 6x6 Front-Blade Snow Plow';
      transitSpeedKmh = 50;
      clearingCapacityMetric = 'Eni 3.4m qar zolağı, 50 km/saat';
      hourlyRateAzn = 90;
      fuelConsumptionLiters = Math.round(depotDistanceKm * 0.42);
      break;

    case 'rotary_snow_blower':
      machineryNameAz = 'Ural-4320 Şnek-Rotasion Qar Sovuran (1,500 t/saat)';
      machineryNameEn = 'Ural-4320 Heavy Rotary Snow Blower (1,500 t/h)';
      transitSpeedKmh = 30;
      clearingCapacityMetric = '1,500 ton/saat qar atma gücü (hündürlük 2.5m)';
      hourlyRateAzn = 140;
      fuelConsumptionLiters = Math.round(depotDistanceKm * 0.65);
      break;

    case 'salt_brine_spreader':
      machineryNameAz = 'Kamaz-6522 Otomatik Duz və Maye Məhlul Səpən';
      machineryNameEn = 'Kamaz-6522 Automated De-Icing Brine Spreader';
      transitSpeedKmh = 45;
      clearingCapacityMetric = '8 m³ duz çəni, 12m çiləmə eni';
      hourlyRateAzn = 80;
      fuelConsumptionLiters = Math.round(depotDistanceKm * 0.38);
      break;

    case 'fhn_crawler_tractor':
      machineryNameAz = 'FHN Komatsu D65 Dağ Tırtıllı Buldozer';
      machineryNameEn = 'FHN Komatsu D65 Heavy Mountain Crawler Tractor';
      transitSpeedKmh = 18;
      clearingCapacityMetric = 'Uçqun və torpaq sürüşməsi aradan qaldırılması';
      hourlyRateAzn = 180;
      fuelConsumptionLiters = Math.round(depotDistanceKm * 0.95);
      break;
  }

  if (priority === 'emergency') {
    transitSpeedKmh = Math.round(transitSpeedKmh * 1.15);
  }

  const etaMinutes = Math.max(10, Math.round((depotDistanceKm / transitSpeedKmh) * 60));
  const operationalCostAzn = Math.round((hourlyRateAzn * (etaMinutes / 60) + fuelConsumptionLiters * 1.0) * 100) / 100;

  return {
    machineryType: machinery,
    machineryNameAz,
    machineryNameEn,
    passId,
    depotNameAz: 'AAYDA Qış Yol İstismarı İdarəsi',
    depotNameEn: 'AAYDA Winter Road Maintenance Depot',
    depotDistanceKm,
    transitSpeedKmh,
    etaMinutes,
    clearingCapacityMetric,
    fuelConsumptionLiters,
    operationalCostAzn,
    operationalCostUsd: convertAznTo(operationalCostAzn, 'USD'),
    operationalCostEur: convertAznTo(operationalCostAzn, 'EUR'),
    dispatchPriority: priority,
  };
}

/**
 * Evaluates the 10-point winter mountain safety checklist
 */
export function evaluateWinterChecklist(checkedItemIds: string[]): {
  score: number;
  total: number;
  passed: boolean;
  ratingAz: string;
  ratingEn: string;
} {
  const total = 10;
  const score = checkedItemIds.length;
  const passed = score >= 8;

  let ratingAz = 'TƏHLÜKƏLİ: Qış dağ aşırımına çıxmaq tövsiyə olunmur!';
  let ratingEn = 'HAZARDOUS: Mountain transit strongly discouraged!';

  if (score === 10) {
    ratingAz = 'NÜMUNƏVİ: Dağ qış şəraitinə 100% tam hazırlıq.';
    ratingEn = 'EXEMPLARY: 100% prepared for extreme winter mountain conditions.';
  } else if (score >= 8) {
    ratingAz = 'MƏQBUL: Qış tələblərinə uyğundur, aşırıma icazə verilir.';
    ratingEn = 'ACCEPTABLE: Compliant with winter standards, passage cleared.';
  }

  return {
    score,
    total,
    passed,
    ratingAz,
    ratingEn,
  };
}

/**
 * Grades the 10-question theoretical winter driving examination
 */
export function gradeWinterExam(answers: Record<number, number>, correctAnswers: Record<number, number>): {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
} {
  const total = 10;
  let score = 0;

  for (let i = 1; i <= total; i++) {
    if (answers[i] === correctAnswers[i]) {
      score++;
    }
  }

  const percentage = Math.round((score / total) * 100);
  const passed = score >= 9; // 9/10 pass threshold (90%)

  return {
    score,
    total,
    percentage,
    passed,
  };
}

/**
 * Generates official AAYDA-QAR-2026 winter mountain clearance certificate
 */
export function generateWinterPassCertificate(params: {
  vehiclePlate: string;
  vin: string;
  passId: MountainPassId;
  passNameAz: string;
  passNameEn: string;
  driveType: DriveType;
  tireChainCertified: boolean;
  rwisFrictionCoeff: number;
  avalancheRating: number;
  clearanceStatus: 'cleared_full' | 'cleared_chains_only' | 'prohibited_transit';
}): WinterPassCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
  const certificateId = `AAYDA-QAR-2026-${randomSuffix}`;

  const now = new Date();
  const issueDate = now.toISOString().replace('T', ' ').substring(0, 19);
  const validUntilDate = new Date(now.getTime() + 24 * 3600 * 1000); // 24 hours validity
  const validUntil = validUntilDate.toISOString().replace('T', ' ').substring(0, 19);

  // Pseudo-SHA256 checksum representation
  const rawString = `${certificateId}:${params.vehiclePlate}:${params.passId}:${issueDate}`;
  let hashVal = 0;
  for (let i = 0; i < rawString.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawString.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256Checksum = `e9a3b8f1c${Math.abs(hashVal).toString(16).padStart(8, '0')}74ddf201869`;
  const simaDigitalUid = `SIMA-AZ-QAR-${Math.abs(hashVal % 999999).toString().padStart(6, '0')}`;

  return {
    certificateId,
    vehiclePlate: params.vehiclePlate.toUpperCase(),
    vin: params.vin.toUpperCase(),
    passId: params.passId,
    passNameAz: params.passNameAz,
    passNameEn: params.passNameEn,
    issueDate,
    validUntil,
    clearanceStatus: params.clearanceStatus,
    driveType: params.driveType,
    tireChainCertified: params.tireChainCertified,
    rwisFrictionCoeff: params.rwisFrictionCoeff,
    avalancheRating: params.avalancheRating,
    roadInspectorBadge: `AAYDA-NÖVB-77${Math.floor(10 + Math.random() * 90)}`,
    simaDigitalUid,
    sha256Checksum,
  };
}
