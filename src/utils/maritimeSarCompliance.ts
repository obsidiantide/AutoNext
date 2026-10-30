/**
 * Official State Maritime and Port Agency (DDAA / Dövlət Dəniz və Liman Agentliyi),
 * Ministry of Emergency Situations (FHN Su Nəqliyyatında Xilasetmə Xidməti) &
 * State Border Service Coast Guard (DSX Sahil Mühafizəsi),
 * Maritime Search & Rescue (SAR / Dəniz Axtarış və Xilasetmə Əməliyyatları),
 * High-Speed Medevac Pilot Boat & Coast Guard Interceptor Telemetry,
 * Caspian Offshore Sea Ambulance & Official SAR-CASPIAN-AZ-2026 Maritime Emergency Clearance Portal
 *
 * Statutory References:
 * - Merchant Shipping Code of the Republic of Azerbaijan ("Azərbaycan Respublikasının Ticarət Dənizçiliyi Məcəlləsi"):
 *   * Maddə 52: Gəmilərin təhlükəsiz idarə edilməsi və dəniz limanlarının naviqasiya rejimi
 *   * Maddə 201: Dənizdə fəlakətə uğrayan insanlara yardım göstərmək və xilasetmə əməliyyatları
 *   * Maddə 215: Xilasetmə xidmətləri, mükafat və xərclərin kompensasiyası (Salvage & Rescue)
 * - International Convention on Maritime Search and Rescue (SAR 1979)
 * - International Convention for the Safety of Life at Sea (SOLAS 74/88, Chapter V: Safety of Navigation)
 * - IMO / ICAO International Aeronautical and Maritime Search and Rescue Manual (IAMSAR Manual)
 * - Law of the Republic of Azerbaijan "On the State Border of the Republic of Azerbaijan" (Sahil Mühafizəsi sahilboyu rejim)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 301, 303)
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
 * 7 Strategic Maritime Rescue Stations (Dəniz Axtarış-Xilasetmə Məntəqələri)
 */
export type MaritimeSarStationId =
  | 'SAR_BAKU_BAY'
  | 'SAR_ALAT_PORT'
  | 'SAR_CHILOV_ISLAND'
  | 'SAR_SUMGAYIT_COAST'
  | 'SAR_NEFTCHALA_KURA'
  | 'SAR_ASTARA_SOUTH'
  | 'SAR_NABRAN_NORTH';

export interface MaritimeSarStationInfo {
  id: MaritimeSarStationId;
  nameAz: string;
  nameEn: string;
  regionAz: string;
  coordinates: {
    lat: number;
    lng: number;
    dmsString: string;
  };
  vhfEmergencyChannel: string; // e.g. "CH 16 (156.800 MHz)"
  vhfWorkingChannel: string;   // e.g. "CH 12 / CH 74"
  radarCoverageNm: number;     // Nautical Miles
  berthLengthMeters: number;
  maxVesselDraftMeters: number;
  medicalTriageLevel: 'LEVEL_1_MARITIME_TRAUMA' | 'LEVEL_2_OFFSHORE_CLINIC' | 'FIRST_AID_STABILIZATION';
  emergencyHotline: string;
  status: 'ACTIVE_24_7' | 'STORM_ALERT_STANDBY' | 'MISSION_DISPATCHED';
  descriptionAz: string;
}

/**
 * Rescue Vessel Fleet (Xilasedici Flotiliya və Katerlər)
 */
export type RescueVesselModelId =
  | 'DAMEN_PILOT_2205'
  | 'SAR_INTERCEPTOR_1606'
  | 'FHN_HOVERCRAFT_AP188'
  | 'CASPIAN_FIRE_TUG_60';

export interface RescueVesselFleetInfo {
  id: RescueVesselModelId;
  modelName: string;
  builder: string;
  operator: string;
  maxSpeedKnots: number;
  cruiseSpeedKnots: number;
  lengthMeters: number;
  beamMeters: number;
  draftMeters: number;
  stretcherCapacity: number;
  rescueCapacitySurvivors: number;
  hasFlirThermalCamera: boolean;
  hasHydraulicRescueCrane: boolean;
  hasFiFiFireMonitor: boolean;
  fuelBurnLitersPerHour: number;
  baseHourlyRateAzn: number;
  descriptionAz: string;
}

export const RESCUE_VESSEL_FLEET: Record<RescueVesselModelId, RescueVesselFleetInfo> = {
  DAMEN_PILOT_2205: {
    id: 'DAMEN_PILOT_2205',
    modelName: 'Damen Stan Pilot 2205 Medevac & SAR Cutter',
    builder: 'Damen Shipyards Group',
    operator: 'Dövlət Dəniz və Liman Agentliyi (DDAA) Bələdçi və SAR Dəstəsi',
    maxSpeedKnots: 28,
    cruiseSpeedKnots: 24,
    lengthMeters: 22.5,
    beamMeters: 6.2,
    draftMeters: 1.6,
    stretcherCapacity: 4,
    rescueCapacitySurvivors: 25,
    hasFlirThermalCamera: true,
    hasHydraulicRescueCrane: true,
    hasFiFiFireMonitor: false,
    fuelBurnLitersPerHour: 280,
    baseHourlyRateAzn: 950,
    descriptionAz: 'Alüminium dəniz korpusu, reanimasiya modulu və dənizdən insan qaldırma hidravlik kranı ilə təchiz olunmuş yüksək dənizçilik qabiliyyətli bələdçi-xilasedici kater',
  },
  SAR_INTERCEPTOR_1606: {
    id: 'SAR_INTERCEPTOR_1606',
    modelName: 'High-Speed Composite SAR Interceptor 1606',
    builder: 'Baku Shipyard / Ares Shipyard',
    operator: 'DSX Sahil Mühafizəsi Çevik Əməliyyat Dəstəsi',
    maxSpeedKnots: 45,
    cruiseSpeedKnots: 38,
    lengthMeters: 16.5,
    beamMeters: 4.4,
    draftMeters: 0.95,
    stretcherCapacity: 2,
    rescueCapacitySurvivors: 12,
    hasFlirThermalCamera: true,
    hasHydraulicRescueCrane: false,
    hasFiFiFireMonitor: false,
    fuelBurnLitersPerHour: 340,
    baseHourlyRateAzn: 1200,
    descriptionAz: 'İkili su reaktiv qurğulu (waterjet), kompozit karbon gövdəli, qaranlıqda FLIR termal kamera ilə dənizdən sürətli axtarış və yaxalama kateri',
  },
  FHN_HOVERCRAFT_AP188: {
    id: 'FHN_HOVERCRAFT_AP188',
    modelName: 'FHN Amphibious Air-Cushion Hovercraft AP1-88',
    builder: 'British Hovercraft Corporation',
    operator: 'FHN Su Nəqliyyatında Xilasetmə Xidməti',
    maxSpeedKnots: 50,
    cruiseSpeedKnots: 42,
    lengthMeters: 21.0,
    beamMeters: 11.0,
    draftMeters: 0.0, // Air cushion
    stretcherCapacity: 6,
    rescueCapacitySurvivors: 45,
    hasFlirThermalCamera: true,
    hasHydraulicRescueCrane: false,
    hasFiFiFireMonitor: false,
    fuelBurnLitersPerHour: 420,
    baseHourlyRateAzn: 1400,
    descriptionAz: 'Dayaz sular, palçıq adacıqları, buz örtüyü və bataqlıq sahillərdə hərəkət edə bilən amfibiya hava yastıqlı fövqəladə xilasetmə gəmisi',
  },
  CASPIAN_FIRE_TUG_60: {
    id: 'CASPIAN_FIRE_TUG_60',
    modelName: 'Caspian Marine Fire & Deep-Sea Rescue Tug',
    builder: 'Krasnoye Sormovo / Baku Shipyard',
    operator: 'FHN Dəniz Xilasetmə və Yanğınsöndürmə İdarəsi',
    maxSpeedKnots: 15,
    cruiseSpeedKnots: 13,
    lengthMeters: 42.0,
    beamMeters: 12.5,
    draftMeters: 4.8,
    stretcherCapacity: 8,
    rescueCapacitySurvivors: 80,
    hasFlirThermalCamera: true,
    hasHydraulicRescueCrane: true,
    hasFiFiFireMonitor: true, // FiFi-1 (2400 m3/h)
    fuelBurnLitersPerHour: 680,
    baseHourlyRateAzn: 1850,
    descriptionAz: 'Açıq dənizdə neft platformaları və tankerlərdə yanğınların söndürülməsi, 65 ton çəkmə qüvvəsi (bollard pull) və qəzalı gəmilərin yedəklənməsi',
  },
};

/**
 * Emergency Priority & Urgency Code
 */
export type MaritimeUrgencyCode =
  | 'CODE_RED_MOB'         // Man Overboard / Sinking Vessel (Dənizə Düşmə / Batmaqda olan gəmi)
  | 'CODE_ORANGE_MEDEVAC'  // Offshore Platform Trauma / Cardiac (Neft Platforması Tibbi Evakuasiya)
  | 'CODE_YELLOW_TOWING'   // Loss of Propulsion / Drifting (Sükan və ya Mühərriki sıradan çıxmış gəmi)
  | 'CODE_BLUE_ENVIRONMENTAL'; // Marine Oil Spill & Fire Hazard (Neft Sızması və Ətraf Mühit Riski)

export interface MaritimeUrgencyInfo {
  code: MaritimeUrgencyCode;
  nameAz: string;
  nameEn: string;
  goldenHourMinutes: number;
  priorityLevel: number;
  diverTeamRequired: boolean;
  doctorOnboardRequired: boolean;
  stateSubsidyPercent: number; // SOLAS Chapter V & Maritime Code Art. 201: 100% state coverage for life-saving rescues
  surchargeAzn: number;
  descriptionAz: string;
}

export const MARITIME_URGENCY_INFO: Record<MaritimeUrgencyCode, MaritimeUrgencyInfo> = {
  CODE_RED_MOB: {
    code: 'CODE_RED_MOB',
    nameAz: 'Qırmızı Kod - Dənizə Düşmə / Batma Təhlükəsi (Qızıl Saat)',
    nameEn: 'Code Red - Man Overboard / Sinking Craft (Golden Hour)',
    goldenHourMinutes: 60,
    priorityLevel: 1,
    diverTeamRequired: true,
    doctorOnboardRequired: true,
    stateSubsidyPercent: 100, // Dövlət tərəfindən 100% kompensasiya olunur
    surchargeAzn: 450,
    descriptionAz: 'Dənizdə insan həyatı üçün dərhal kritik təhlükə, hipotermiya riski və qəza yerinə təxirəsalınmaz çevik reaksiya',
  },
  CODE_ORANGE_MEDEVAC: {
    code: 'CODE_ORANGE_MEDEVAC',
    nameAz: 'Narıncı Kod - Neft Platformasından Dəniz Sanitar Təxliyəsi',
    nameEn: 'Code Orange - Offshore Oil Rig Medevac / Trauma Evacuation',
    goldenHourMinutes: 90,
    priorityLevel: 2,
    diverTeamRequired: false,
    doctorOnboardRequired: true,
    stateSubsidyPercent: 100,
    surchargeAzn: 380,
    descriptionAz: 'Xəzər dənizində neft-qaz stasionar platformalarında ağır xəsarət alan işçilərin sürətli xilasedici ilə sahil hospitalına çatdırılması',
  },
  CODE_YELLOW_TOWING: {
    code: 'CODE_YELLOW_TOWING',
    nameAz: 'Sarı Kod - Sükan/Mühərrik İtmiş Dəniz Vasitəsinin Qəza Yedəklənməsi',
    nameEn: 'Code Yellow - Disabled Vessel Drifting in Fairway (Salvage)',
    goldenHourMinutes: 180,
    priorityLevel: 3,
    diverTeamRequired: false,
    doctorOnboardRequired: false,
    stateSubsidyPercent: 50,
    surchargeAzn: 250,
    descriptionAz: 'Bakı arxipelaqı və ya gəmiçilik kanalında idarəetməni itirmiş dəniz vasitəsinin qayalara və platformalara çırpılmasının qarşısının alınması',
  },
  CODE_BLUE_ENVIRONMENTAL: {
    code: 'CODE_BLUE_ENVIRONMENTAL',
    nameAz: 'Mavi Kod - Neft Daşması və Dəniz Yanğınına Qarşı Reaksiya',
    nameEn: 'Code Blue - Marine Oil Spill Containment & Offshore Fire',
    goldenHourMinutes: 120,
    priorityLevel: 2,
    diverTeamRequired: true,
    doctorOnboardRequired: false,
    stateSubsidyPercent: 80,
    surchargeAzn: 500,
    descriptionAz: 'Açıq dənizdə neft ləkələrinin bom çəpərləri ilə lokallaşdırılması və FiFi su topları ilə yanğınsöndürmə əməliyyatı',
  },
};

/**
 * Sea State & Beaufort Scale Assessment
 */
export type SeaStateCondition =
  | 'CALM_SAFE'             // Beaufort 0-2 (Wave < 0.5m)
  | 'MODERATE_OPERATIONAL'  // Beaufort 3-4 (Wave 0.5 - 1.25m)
  | 'ROUGH_HIGH_SEAS'       // Beaufort 5-6 (Wave 1.25 - 2.5m, heavy spray)
  | 'STORM_RESTRICTED';     // Beaufort 7+ (Wave > 2.5m, severe storm, only heavy tug/hovercraft)

export interface SeaStateAssessmentInput {
  waveHeightMeters: number;
  windSpeedKnots: number;
  isNightOperation: boolean;
  visibilityNauticalMiles: number;
  hasFogOrHeavyRain: boolean;
  isOffshoreDeepwater: boolean;
}

export interface SeaStateAssessmentResult {
  condition: SeaStateCondition;
  beaufortScale: number;
  isMissionAuthorized: boolean;
  flirThermalRequired: boolean;
  speedReductionFactorPercent: number; // Wave resistance reduces boat speed by X%
  operationalRiskAz: string;
  maxRecommendedCraftSpeedKnots: number;
}

export const evaluateSeaStateConditions = (
  input: SeaStateAssessmentInput
): SeaStateAssessmentResult => {
  const {
    waveHeightMeters,
    windSpeedKnots,
    isNightOperation,
    visibilityNauticalMiles,
    hasFogOrHeavyRain,
  } = input;

  // Calculate Beaufort scale approximation from wind speed
  let beaufort = 1;
  if (windSpeedKnots < 4) beaufort = 1;
  else if (windSpeedKnots < 7) beaufort = 2;
  else if (windSpeedKnots < 11) beaufort = 3;
  else if (windSpeedKnots < 17) beaufort = 4;
  else if (windSpeedKnots < 22) beaufort = 5;
  else if (windSpeedKnots < 28) beaufort = 6;
  else if (windSpeedKnots < 34) beaufort = 7;
  else if (windSpeedKnots < 41) beaufort = 8;
  else beaufort = 9;

  let condition: SeaStateCondition = 'CALM_SAFE';
  let speedReductionFactorPercent = 0;
  let operationalRiskAz = 'Dəniz sakitdir. Bütün tipli xilasedici katerlər üçün maksimal sürət rejimində çıxışa tam icazə verilir.';
  let isMissionAuthorized = true;

  if (waveHeightMeters > 3.0 || windSpeedKnots >= 34) {
    condition = 'STORM_RESTRICTED';
    speedReductionFactorPercent = 35;
    operationalRiskAz = 'Şiddətli Xəzri fırtınası və hündür dalğalar. Yüngül katerlər üçün təhlükəlidir, yalnız ağır yanğın-xilasetmə yedəyi və ya hovercraft cəlb oluna bilər.';
    // Still authorized for life-saving SAR under IAMSAR, but restricted craft
    isMissionAuthorized = true;
  } else if (waveHeightMeters > 1.5 || windSpeedKnots >= 22) {
    condition = 'ROUGH_HIGH_SEAS';
    speedReductionFactorPercent = 20;
    operationalRiskAz = 'Hissolunan dalğalanma və dəniz sıçrantıları. Sürət təhlükəsizlik həddinə endirilməli, zərbə əleyhinə bəndlər bağlanmalıdır.';
  } else if (waveHeightMeters > 0.6 || windSpeedKnots >= 11) {
    condition = 'MODERATE_OPERATIONAL';
    speedReductionFactorPercent = 10;
    operationalRiskAz = 'Mülayim dəniz dalğalanması. Bütün növbətçi heyətlər üçün standart naviqasiya rejimi təmin edilir.';
  }

  const flirThermalRequired = isNightOperation || visibilityNauticalMiles < 2 || hasFogOrHeavyRain;

  let maxRecommendedCraftSpeedKnots = 45;
  if (condition === 'STORM_RESTRICTED') maxRecommendedCraftSpeedKnots = 18;
  else if (condition === 'ROUGH_HIGH_SEAS') maxRecommendedCraftSpeedKnots = 26;
  else if (condition === 'MODERATE_OPERATIONAL') maxRecommendedCraftSpeedKnots = 35;

  return {
    condition,
    beaufortScale: beaufort,
    isMissionAuthorized,
    flirThermalRequired,
    speedReductionFactorPercent,
    operationalRiskAz,
    maxRecommendedCraftSpeedKnots,
  };
};

/**
 * Maritime Mission Calculation Result
 */
export interface MaritimeMissionCalculationResult {
  distanceNm: number;
  distanceKm: number;
  effectiveSpeedKnots: number;
  transitTimeMinutes: number;
  scrambleTimeMinutes: number; // 10 min muster & launch
  totalMissionTimeMinutes: number;
  isGoldenHourMet: boolean;
  fuelRequiredLiters: number;
  vesselBaseCostAzn: number;
  urgencySurchargeAzn: number;
  diverOrMedicalCrewFeeAzn: number;
  subtotalAzn: number;
  stateSubsidyAmountAzn: number;
  payableTotalAzn: number;
  payableTotalUsd: number;
  payableTotalEur: number;
}

export const calculateMaritimeSarMission = (params: {
  station: MaritimeSarStationInfo;
  vessel: RescueVesselFleetInfo;
  urgencyCode: MaritimeUrgencyCode;
  distanceNm: number;
  seaStateResult: SeaStateAssessmentResult;
  requiresSpecialDivers?: boolean;
}): MaritimeMissionCalculationResult => {
  const { station: _station, vessel, urgencyCode, distanceNm, seaStateResult, requiresSpecialDivers } = params;
  const urgency = MARITIME_URGENCY_INFO[urgencyCode];

  const distanceKm = Math.round(distanceNm * 1.852 * 10) / 10;

  // Effective speed based on sea state reduction
  const reductionFraction = seaStateResult.speedReductionFactorPercent / 100;
  const nominalSpeed = Math.min(vessel.cruiseSpeedKnots, seaStateResult.maxRecommendedCraftSpeedKnots);
  const effectiveSpeedKnots = Math.max(8, Math.round(nominalSpeed * (1 - reductionFraction)));

  // Time calculations
  const transitTimeMinutes = Math.round((distanceNm / effectiveSpeedKnots) * 60);
  const scrambleTimeMinutes = 10; // Rapid berth muster and cast-off
  const onSceneSearchMinutes = 15; // Initial triage & victim recovery
  const totalMissionTimeMinutes = scrambleTimeMinutes + transitTimeMinutes + onSceneSearchMinutes;

  const isGoldenHourMet = totalMissionTimeMinutes <= urgency.goldenHourMinutes;

  // Fuel consumption: (transit + search + return transit) = ~ 2.2x one-way
  const totalOperatingHours = ((transitTimeMinutes * 2 + onSceneSearchMinutes) / 60);
  const fuelRequiredLiters = Math.round(totalOperatingHours * vessel.fuelBurnLitersPerHour);

  // Financial calculations
  const vesselBaseCostAzn = Math.round(totalOperatingHours * vessel.baseHourlyRateAzn);
  const urgencySurchargeAzn = urgency.surchargeAzn;
  const diverOrMedicalCrewFeeAzn = (urgency.diverTeamRequired || requiresSpecialDivers) ? 350 : 150;

  const subtotalAzn = vesselBaseCostAzn + urgencySurchargeAzn + diverOrMedicalCrewFeeAzn;
  const stateSubsidyAmountAzn = Math.round((subtotalAzn * urgency.stateSubsidyPercent) / 100);
  const payableTotalAzn = Math.max(0, subtotalAzn - stateSubsidyAmountAzn);

  return {
    distanceNm,
    distanceKm,
    effectiveSpeedKnots,
    transitTimeMinutes,
    scrambleTimeMinutes,
    totalMissionTimeMinutes,
    isGoldenHourMet,
    fuelRequiredLiters,
    vesselBaseCostAzn,
    urgencySurchargeAzn,
    diverOrMedicalCrewFeeAzn,
    subtotalAzn,
    stateSubsidyAmountAzn,
    payableTotalAzn,
    payableTotalUsd: convertAzn(payableTotalAzn, 'USD'),
    payableTotalEur: convertAzn(payableTotalAzn, 'EUR'),
  };
};

/**
 * 10-Point SOLAS & Maritime Medevac Safety Checklist Item
 */
export interface MaritimeChecklistItem {
  id: string;
  category: 'SOLAS_NAVIGATION' | 'MEDICAL_ICU' | 'RESCUE_HULL';
  titleAz: string;
  titleEn: string;
  regulatoryRef: string;
  isMandatory: boolean;
  descriptionAz: string;
}

/**
 * 10-Question Maritime Transport Law & SAR Regulations Examination
 */
export interface MaritimeExamQuestion {
  id: string;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
  regulatoryBasis: string;
}

/**
 * Official SAR-CASPIAN-AZ-2026 Maritime Emergency Clearance Certificate
 */
export interface MaritimeSarClearanceCertificate {
  certificateNumber: string; // e.g. SAR-CASPIAN-AZ-2026-XXXXX
  issuedAt: string;
  expiresAt: string;
  callsign: string; // e.g. RESCUE-CASPIAN-07
  vesselModel: string;
  operator: string;
  stationNameAz: string;
  incidentLocationDms: string;
  urgencyCode: MaritimeUrgencyCode;
  casualtyTriageSummary: string;
  goldenHourStatus: string;
  effectiveSpeedKnots: number;
  distanceNm: number;
  seaStateCondition: SeaStateCondition;
  beaufortScale: number;
  stateSubsidyPercent: number;
  payableAmountAzn: number;
  missionCommanderName: string;
  flirThermalUsed: boolean;
  simaDigitalUid: string;
  qrVerificationUrl: string;
  cryptographicSha256: string;
}

export const generateMaritimeCertificateHash = (input: {
  certNumber: string;
  callsign: string;
  stationId: string;
  timestamp: string;
}): string => {
  const raw = `${input.certNumber}|${input.callsign}|${input.stationId}|${input.timestamp}|AZ-MARITIME-DDAA-2026`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexPart1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hexPart2 = Math.abs((hash * 37) | 0).toString(16).padStart(8, '0');
  const hexPart3 = Math.abs((hash * 131) | 0).toString(16).padStart(8, '0');
  const hexPart4 = Math.abs((hash * 7919) | 0).toString(16).padStart(8, '0');
  return `${hexPart1}${hexPart2}${hexPart3}${hexPart4}`.toUpperCase();
};

export const issueMaritimeSarCertificate = (params: {
  station: MaritimeSarStationInfo;
  vessel: RescueVesselFleetInfo;
  urgencyCode: MaritimeUrgencyCode;
  calcResult: MaritimeMissionCalculationResult;
  seaStateResult: SeaStateAssessmentResult;
  incidentNotes?: string;
}): MaritimeSarClearanceCertificate => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certNumber = `SAR-CASPIAN-AZ-2026-${randomSuffix}`;
  const now = new Date();
  const issuedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const callsign = `RESCUE-CASPIAN-${Math.floor(10 + Math.random() * 90)}`;
  const simaUid = `SIMA-SAR-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const sha256 = generateMaritimeCertificateHash({
    certNumber,
    callsign,
    stationId: params.station.id,
    timestamp: issuedAt,
  });

  const urgency = MARITIME_URGENCY_INFO[params.urgencyCode];

  return {
    certificateNumber: certNumber,
    issuedAt,
    expiresAt,
    callsign,
    vesselModel: params.vessel.modelName,
    operator: params.vessel.operator,
    stationNameAz: params.station.nameAz,
    incidentLocationDms: `${params.station.coordinates.dmsString} (${params.calcResult.distanceNm} NM Dənizdə)`,
    urgencyCode: params.urgencyCode,
    casualtyTriageSummary:
      params.incidentNotes ||
      `${urgency.nameAz} - Xəzər dənizində təxirəsalınmaz xilasetmə və sahil klinikasına çatdırılma`,
    goldenHourStatus: params.calcResult.isGoldenHourMet
      ? 'TƏMİN OLUNDU (< 60-90 dəqiqə)'
      : 'GECİKMƏ RİSKİ (Fırtına Maneəsi)',
    effectiveSpeedKnots: params.calcResult.effectiveSpeedKnots,
    distanceNm: params.calcResult.distanceNm,
    seaStateCondition: params.seaStateResult.condition,
    beaufortScale: params.seaStateResult.beaufortScale,
    stateSubsidyPercent: urgency.stateSubsidyPercent,
    payableAmountAzn: params.calcResult.payableTotalAzn,
    missionCommanderName: 'Kapitan Namiq Əliyev (Baş Dəniz Xilasedicisi / DDAA)',
    flirThermalUsed: params.seaStateResult.flirThermalRequired,
    simaDigitalUid: simaUid,
    qrVerificationUrl: `https://sar.ddaa.gov.az/verify?cert=${certNumber}&sig=${sha256.slice(0, 12)}`,
    cryptographicSha256: sha256,
  };
};
