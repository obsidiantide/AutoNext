/**
 * Official State Civil Aviation Agency (DDAA / DMAA - Dövlət Mülki Aviasiya Agentliyi),
 * Ministry of Emergency Situations (FHN - Fövqəladə Hallar Nazirliyi Aviasiya Dəstəsi) &
 * Administration of the Regional Medical Divisions (TƏBİB) / İcbari Tibbi Sığorta (İTS),
 * Helicopter Emergency Medical Services (HEMS / Aviasiya Təcili Tibbi Yardım və Sanitar Aviasiya),
 * Air Ambulance Strategic Helipad Radar, Mountain & Highway Medevac Telemetry &
 * Official HEMS-AZ-2026 Flight Clearance Portal Compliance Engine
 *
 * Statutory References:
 * - Air Code of the Republic of Azerbaijan ("Azərbaycan Respublikasının Hava Məcəlləsi"):
 *   * Maddə 14: Vertolyot meydançaları (heliporlar) və sanitar aviasiya eniş zolaqları
 *   * Maddə 28: Təcili tibbi yardım və axtarış-xilasetmə uçuşlarının xüsusi statusu və növbədənkənar icazə
 *   * Maddə 45: Fövqəladə hallarda hava gəmilərinin cəlb edilməsi və xilasetmə əməliyyatları
 *   * Maddə 62: Mülki aviasiyada uçuş təhlükəsizliyi və meteoroloji minimumlar (VFR / IFR / NVG)
 * - Law of the Republic of Azerbaijan "On Protection of Public Health" ("Əhalinin sağlamlığının qorunması haqqında"):
 *   * Maddə 23: Təxirəsalınmaz təcili tibbi yardım və xəstələrin ixtisaslaşdırılmış xəstəxanalara təxliyəsi
 * - ICAO Annex 6 Part III (International Operations - Helicopters) & Annex 14 Volume II (Heliports)
 * - EASA SPA.HEMS (Specific Approval for Helicopter Emergency Medical Services Operations)
 * - TƏBİB "Qızıl Saat" (Golden Hour) Təcili Tibbi Təxliyə Standartları və Sanitar Aviasiya Reqlamenti
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 308, 309)
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
 * 8 Strategic Medical Helipads Radar (Sanitar Aviasiya Heliporları)
 */
export type MedicalHelipadId =
  | 'HELI_YENI_KLINIKA'
  | 'HELI_RES_CLINICAL'
  | 'HELI_FHN_DARNAGUL'
  | 'HELI_SHUSHA_CITY'
  | 'HELI_GABALA_EMERGENCY'
  | 'HELI_GANJA_REGIONAL'
  | 'HELI_NAKHCHIVAN_MED'
  | 'HELI_KHACHMAZ_HUB';

export type HelipadSurfaceType =
  | 'ELEVATED_ROOFTOP' // Dam üstü xüsusi platforma
  | 'GROUND_ASPHALT'   // Yerüstü monolit asfalt/beton meydança
  | 'REINFORCED_DECK'; // Gücləndirilmiş xilasetmə göyərtəsi

export interface MedicalHelipadInfo {
  id: MedicalHelipadId;
  icaoDesignator: string;
  nameAz: string;
  nameEn: string;
  locationCity: string;
  hospitalAffiliation: string;
  elevationMeters: number;
  surfaceType: HelipadSurfaceType;
  maxTakeoffWeightKg: number; // MTOW (Maximum Takeoff Weight)
  dValueDiameterMeters: number; // Heliport D-Value (rotor diameter clearance)
  nightLightingAvailable: boolean; // ICAO Helipad Perimeter & Flood Lighting
  instrumentApproachType: 'VFR_ONLY' | 'PINPOINT_RNAV_GPS' | 'CAT_I_PRECISION';
  vhfRadioFreqMhz: string;
  latitude: number;
  longitude: number;
  traumaLevel: 'LEVEL_1_COMPREHENSIVE' | 'LEVEL_2_REGIONAL' | 'ALPINE_STABILIZATION';
  emergencyDispatchPhone: string;
  status: 'ACTIVE_STANDBY' | 'MISSION_IN_PROGRESS' | 'WEATHER_ALERT';
}

/**
 * Medical Helicopter Fleet (HEMS Vertolyot Parkı)
 */
export type HelicopterFleetModelId =
  | 'H145_BK117_D3'
  | 'H135_T3'
  | 'BELL_412_EP'
  | 'MI_17_1V_MED';

export interface HelicopterFleetInfo {
  id: HelicopterFleetModelId;
  modelName: string;
  manufacturer: string;
  operator: string;
  cruiseSpeedKmH: number;
  maxRangeKm: number;
  serviceCeilingMeters: number;
  stretcherCapacity: number;
  medicalCrewCount: number;
  maxGrossWeightKg: number;
  hasRescueHoist: boolean;
  hoistCableLengthMeters: number;
  hasNightVisionGogglesNVG: boolean;
  hasAirborneIcuVentilator: boolean;
  fuelBurnLitersPerHour: number;
  baseHourlyRateAzn: number;
  descriptionAz: string;
}

export const HELICOPTER_FLEET_INFO: Record<HelicopterFleetModelId, HelicopterFleetInfo> = {
  H145_BK117_D3: {
    id: 'H145_BK117_D3',
    modelName: 'Airbus H145 (BK117 D-3) Medevac 5-Blade',
    manufacturer: 'Airbus Helicopters',
    operator: 'FHN Aviasiya Dəstəsi / TƏBİB HEMS',
    cruiseSpeedKmH: 245,
    maxRangeKm: 650,
    serviceCeilingMeters: 6095,
    stretcherCapacity: 2,
    medicalCrewCount: 3,
    maxGrossWeightKg: 3800,
    hasRescueHoist: true,
    hoistCableLengthMeters: 90,
    hasNightVisionGogglesNVG: true,
    hasAirborneIcuVentilator: true,
    fuelBurnLitersPerHour: 230,
    baseHourlyRateAzn: 1850,
    descriptionAz: 'Qabaqcıl 5 pərli rotorsistem, daxili Fenestron təhlükəsiz quyruq pəri və tam reanimasiya modulu',
  },
  H135_T3: {
    id: 'H135_T3',
    modelName: 'Airbus H135 T3 Helionix ICU',
    manufacturer: 'Airbus Helicopters',
    operator: 'TƏBİB Təcili Tibbi Yardım Mərkəzi',
    cruiseSpeedKmH: 252,
    maxRangeKm: 635,
    serviceCeilingMeters: 6095,
    stretcherCapacity: 1,
    medicalCrewCount: 2,
    maxGrossWeightKg: 2980,
    hasRescueHoist: false,
    hoistCableLengthMeters: 0,
    hasNightVisionGogglesNVG: true,
    hasAirborneIcuVentilator: true,
    fuelBurnLitersPerHour: 195,
    baseHourlyRateAzn: 1450,
    descriptionAz: 'Şəhər mühiti və damüstü heliporlar üçün kompakt, səssiz və çevik ikimühərrikli təcili evakuasiya vertolyotu',
  },
  BELL_412_EP: {
    id: 'BELL_412_EP',
    modelName: 'Bell 412EP Twin Turbine Rescue',
    manufacturer: 'Bell Textron Inc.',
    operator: 'FHN Xüsusi Riskli Xilasetmə Xidməti',
    cruiseSpeedKmH: 226,
    maxRangeKm: 745,
    serviceCeilingMeters: 6096,
    stretcherCapacity: 6,
    medicalCrewCount: 4,
    maxGrossWeightKg: 5398,
    hasRescueHoist: true,
    hoistCableLengthMeters: 75,
    hasNightVisionGogglesNVG: true,
    hasAirborneIcuVentilator: true,
    fuelBurnLitersPerHour: 340,
    baseHourlyRateAzn: 2200,
    descriptionAz: 'Kütləvi qəzalar, zəlzələ və magistral fəlakətlər zamanı çoxsaylı yaralıların daşınması üçün dördpərli ağır xilasedici',
  },
  MI_17_1V_MED: {
    id: 'MI_17_1V_MED',
    modelName: 'Mil Mi-17-1V Heavy Search & Rescue ICU',
    manufacturer: 'Kazan Helicopters / Mil Moscow',
    operator: 'FHN Aviasiya Dəstəsi',
    cruiseSpeedKmH: 230,
    maxRangeKm: 580,
    serviceCeilingMeters: 6000,
    stretcherCapacity: 12,
    medicalCrewCount: 5,
    maxGrossWeightKg: 13000,
    hasRescueHoist: true,
    hoistCableLengthMeters: 50,
    hasNightVisionGogglesNVG: false,
    hasAirborneIcuVentilator: true,
    fuelBurnLitersPerHour: 750,
    baseHourlyRateAzn: 3100,
    descriptionAz: 'Çətin relyefli dağ əməliyyatları, daşqınlar və hərbi-mülki birgə sanitar təxliyə üçün gücləndirilmiş ağır vertolyot',
  },
};

/**
 * Medevac Urgency Triage Priority (Təcili Tibbi Triage Dərəcələri)
 */
export type MedevacUrgencyCode =
  | 'CODE_RED_CRITICAL'  // Politravma, kəllə-beyin travması, qanaxma, "Qızıl Saat" (<60 dəq)
  | 'CODE_YELLOW_URGENT' // Donor orqan transferi, neonatal kardiocərrahiyyə
  | 'CODE_GREEN_STABLE'  // Planlı regional ixtisaslaşdırılmış transfer
  | 'ALPINE_SAR_RESCUE'; // Dağlıq, dərə və magistralda kəndirlə vinçlə xilasetmə

export interface MedevacUrgencyInfo {
  code: MedevacUrgencyCode;
  nameAz: string;
  nameEn: string;
  maxGoldenHourMinutes: number;
  priorityLevel: number;
  icuSpecialistRequired: boolean;
  stateInsuranceSubsidyPercent: number; // İcbari Tibbi Sığorta dövlət subsidiyası
  surchargeAzn: number;
  descriptionAz: string;
}

export const MEDEVAC_URGENCY_INFO: Record<MedevacUrgencyCode, MedevacUrgencyInfo> = {
  CODE_RED_CRITICAL: {
    code: 'CODE_RED_CRITICAL',
    nameAz: 'Qırmızı Kod - Həyati Təhlükə / Politravma (Qızıl Saat)',
    nameEn: 'Code Red - Critical Life Threat (Golden Hour)',
    maxGoldenHourMinutes: 60,
    priorityLevel: 1,
    icuSpecialistRequired: true,
    stateInsuranceSubsidyPercent: 100, // Dövlət və İTS tərəfindən 100% təmin olunur
    surchargeAzn: 450,
    descriptionAz: 'Həyati orqan çatışmazlığı, magistral qəzası nəticəsində politravma, dərhal təyyarə reanimasiyası',
  },
  CODE_YELLOW_URGENT: {
    code: 'CODE_YELLOW_URGENT',
    nameAz: 'Sarı Kod - Təcili Donor Orqan / Neonatal Küvəz Transferi',
    nameEn: 'Code Yellow - Urgent Organ / Neonatal Transport',
    maxGoldenHourMinutes: 120,
    priorityLevel: 2,
    icuSpecialistRequired: true,
    stateInsuranceSubsidyPercent: 85,
    surchargeAzn: 280,
    descriptionAz: 'Transplantasiya üçün donor ürək/qaraciyər daşınması və ya kritik yeni doğulmuş körpənin daşınması',
  },
  CODE_GREEN_STABLE: {
    code: 'CODE_GREEN_STABLE',
    nameAz: 'Yaşıl Kod - Planlı Sanitar Aviasiya Təxliyəsi',
    nameEn: 'Code Green - Scheduled Inter-Hospital Transfer',
    maxGoldenHourMinutes: 240,
    priorityLevel: 3,
    icuSpecialistRequired: false,
    stateInsuranceSubsidyPercent: 50,
    surchargeAzn: 150,
    descriptionAz: 'Rayon mərkəzi xəstəxanasından paytaxt ixtisaslaşdırılmış tibb mərkəzinə stabil xəstə köçürülməsi',
  },
  ALPINE_SAR_RESCUE: {
    code: 'ALPINE_SAR_RESCUE',
    nameAz: 'Axtarış-Xilasetmə və Dağ HEMS Vinç Əməliyyatı',
    nameEn: 'Search & Rescue / Alpine Mountain Hoist Medevac',
    maxGoldenHourMinutes: 90,
    priorityLevel: 1,
    icuSpecialistRequired: true,
    stateInsuranceSubsidyPercent: 100,
    surchargeAzn: 600,
    descriptionAz: 'Şahdağ, Tufandağ və Murov silsilələrində çətin əlçatan dərələrdən xəstənin xilasetmə vinçi ilə qaldırılması',
  },
};

/**
 * Weather & Flight Rules Minimums Assessment (VFR / IFR / NVG)
 */
export type WeatherFlightCondition =
  | 'CLEARED_VFR_DAY'      // Vizual Uçuş Qaydaları (Aydın hava)
  | 'CLEARED_NVG_NIGHT'    // Gecə Görmə Eynəkləri ilə Xüsusi Təsdiq
  | 'MARGINAL_SPECIAL_VFR' // Hüdudi Hava (Yalnız təcrübəli pilot və kritik xəstə)
  | 'GROUNDED_BELOW_MINIMA'; // Uçuş Qadağandır (Fırtına, sıx duman, buzlaşma)

export interface WeatherAssessmentInput {
  cloudCeilingFeet: number;
  flightVisibilityMeters: number;
  windSpeedKnots: number;
  isNightOperation: boolean;
  isMountainRoute: boolean;
  hasModerateOrSevereIcing: boolean;
  hasThunderstormOnRoute: boolean;
}

export interface WeatherAssessmentResult {
  condition: WeatherFlightCondition;
  isFlightPermitted: boolean;
  nightVisionGogglesRequired: boolean;
  icingRiskLevel: 'NONE' | 'MODERATE_ALERT' | 'CRITICAL_NO_GO';
  windLimitPassed: boolean;
  summaryAz: string;
  minimumCeilingRequiredFt: number;
  minimumVisibilityRequiredM: number;
}

export const evaluateHemsWeatherConditions = (
  input: WeatherAssessmentInput
): WeatherAssessmentResult => {
  const {
    cloudCeilingFeet,
    flightVisibilityMeters,
    windSpeedKnots,
    isNightOperation,
    isMountainRoute,
    hasModerateOrSevereIcing,
    hasThunderstormOnRoute,
  } = input;

  // Statutory minimums under ICAO Annex 6 & EASA SPA.HEMS:
  // Daytime Flat: Ceiling >= 500 ft, Vis >= 1500 m
  // Nighttime Flat: Ceiling >= 1000 ft, Vis >= 3000 m
  // Mountain Daytime: Ceiling >= 1000 ft, Vis >= 2500 m
  // Mountain Nighttime: Ceiling >= 1500 ft, Vis >= 4000 m

  let minCeiling = 500;
  let minVis = 1500;

  if (isMountainRoute && !isNightOperation) {
    minCeiling = 1000;
    minVis = 2500;
  } else if (!isMountainRoute && isNightOperation) {
    minCeiling = 1000;
    minVis = 3000;
  } else if (isMountainRoute && isNightOperation) {
    minCeiling = 1500;
    minVis = 4000;
  }

  const windLimitPassed = windSpeedKnots <= 45; // Max 45 knots for rotorcraft operations

  if (hasThunderstormOnRoute || hasModerateOrSevereIcing || !windLimitPassed) {
    return {
      condition: 'GROUNDED_BELOW_MINIMA',
      isFlightPermitted: false,
      nightVisionGogglesRequired: isNightOperation,
      icingRiskLevel: hasModerateOrSevereIcing ? 'CRITICAL_NO_GO' : 'NONE',
      windLimitPassed,
      summaryAz: 'Uçuş QADAĞANDIR: Təhlükəli meteoroloji şərait (ildırım qasırğası, aktiv buzlaşma və ya həddindən artıq külək).',
      minimumCeilingRequiredFt: minCeiling,
      minimumVisibilityRequiredM: minVis,
    };
  }

  if (cloudCeilingFeet < minCeiling || flightVisibilityMeters < minVis) {
    // If marginal near minima for critical Code Red
    if (cloudCeilingFeet >= minCeiling * 0.75 && flightVisibilityMeters >= minVis * 0.7) {
      return {
        condition: 'MARGINAL_SPECIAL_VFR',
        isFlightPermitted: true,
        nightVisionGogglesRequired: isNightOperation,
        icingRiskLevel: 'MODERATE_ALERT',
        windLimitPassed,
        summaryAz: 'Hüdudi Hava Şəraiti (Special VFR): Yalnız zəruri hallarda və ən yüksək təhlükəsizlik marjası ilə uçuşa icazə verilir.',
        minimumCeilingRequiredFt: minCeiling,
        minimumVisibilityRequiredM: minVis,
      };
    }

    return {
      condition: 'GROUNDED_BELOW_MINIMA',
      isFlightPermitted: false,
      nightVisionGogglesRequired: isNightOperation,
      icingRiskLevel: 'NONE',
      windLimitPassed,
      summaryAz: `Uçuş QADAĞANDIR: Hava şəraiti minimumlardan aşağıdır (Bulud tavanı < ${minCeiling} ft və ya görünmə məsafəsi < ${minVis} m).`,
      minimumCeilingRequiredFt: minCeiling,
      minimumVisibilityRequiredM: minVis,
    };
  }

  if (isNightOperation) {
    return {
      condition: 'CLEARED_NVG_NIGHT',
      isFlightPermitted: true,
      nightVisionGogglesRequired: true,
      icingRiskLevel: 'NONE',
      windLimitPassed,
      summaryAz: 'Gecə HEMS Uçuşuna İcazə Verildi: NVG (Gecə Görmə Eynəkləri) və infraqırmızı axtarış fənəri mütləq istifadə olunmalıdır.',
      minimumCeilingRequiredFt: minCeiling,
      minimumVisibilityRequiredM: minVis,
    };
  }

  return {
    condition: 'CLEARED_VFR_DAY',
    isFlightPermitted: true,
    nightVisionGogglesRequired: false,
    icingRiskLevel: 'NONE',
    windLimitPassed,
    summaryAz: 'Uçuşa Tam İcazə Verildi: Əlverişli vizual hava şəraiti (VFR Day Cleared).',
    minimumCeilingRequiredFt: minCeiling,
    minimumVisibilityRequiredM: minVis,
  };
};

/**
 * Haversine Great Circle Distance Formula (in Kilometers)
 */
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Mission Response Time & Flight Calculator Input
 */
export interface HemsMissionCalculationInput {
  departureHelipadId: MedicalHelipadId;
  destinationHelipadId: MedicalHelipadId;
  helicopterModelId: HelicopterFleetModelId;
  urgencyCode: MedevacUrgencyCode;
  patientCount: number;
  isNightOperation: boolean;
  requiresHoistWinch: boolean;
  applyStateSubsidy: boolean;
}

export interface HemsMissionCalculationResult {
  distanceKm: number;
  cruiseSpeedKmH: number;
  flightTimeMinutes: number;
  scrambleTimeMinutes: number;
  totalMissionTimeMinutes: number;
  isGoldenHourMet: boolean;
  fuelRequiredLiters: number;
  flightBaseCostAzn: number;
  urgencySurchargeAzn: number;
  hoistWinchFeeAzn: number;
  subtotalAzn: number;
  stateSubsidyAmountAzn: number;
  payableTotalAzn: number;
  payableTotalUsd: number;
  payableTotalEur: number;
}

export const calculateHemsMission = (
  input: HemsMissionCalculationInput,
  helipads: MedicalHelipadInfo[]
): HemsMissionCalculationResult => {
  const {
    departureHelipadId,
    destinationHelipadId,
    helicopterModelId,
    urgencyCode,
    isNightOperation,
    requiresHoistWinch,
    applyStateSubsidy,
  } = input;

  const depHelipad = helipads.find((h) => h.id === departureHelipadId) || helipads[0];
  const destHelipad = helipads.find((h) => h.id === destinationHelipadId) || helipads[1];
  const helicopter = HELICOPTER_FLEET_INFO[helicopterModelId];
  const urgency = MEDEVAC_URGENCY_INFO[urgencyCode];

  // Calculate distance
  const distanceKm =
    departureHelipadId === destinationHelipadId
      ? 25 // Local orbit / emergency transfer within metropolitan zone
      : calculateDistanceKm(
          depHelipad.latitude,
          depHelipad.longitude,
          destHelipad.latitude,
          destHelipad.longitude
        );

  const cruiseSpeed = helicopter.cruiseSpeedKmH;

  // Flight time in minutes
  const flightTimeMinutes = Math.round((distanceKm / cruiseSpeed) * 60);

  // Scramble preparation time (crew brief, pre-flight engine spool, navigation load)
  // Day: 10 mins for urgent, 15 for normal; Night: 20 mins
  const scrambleTimeMinutes = isNightOperation ? 20 : urgencyCode === 'CODE_RED_CRITICAL' ? 10 : 15;

  const totalMissionTimeMinutes = flightTimeMinutes + scrambleTimeMinutes;
  const isGoldenHourMet = totalMissionTimeMinutes <= urgency.maxGoldenHourMinutes;

  // Fuel calculation (15% reserve added)
  const flightHours = flightTimeMinutes / 60;
  const fuelRequiredLiters = Math.round(flightHours * helicopter.fuelBurnLitersPerHour * 1.15);

  // Cost breakdown
  const flightBaseCostAzn = Math.round(flightHours * helicopter.baseHourlyRateAzn);
  const urgencySurchargeAzn = urgency.surchargeAzn;
  const hoistWinchFeeAzn = requiresHoistWinch ? 350 : 0;

  const subtotalAzn = flightBaseCostAzn + urgencySurchargeAzn + hoistWinchFeeAzn;

  const subsidyPercent = applyStateSubsidy ? urgency.stateInsuranceSubsidyPercent : 0;
  const stateSubsidyAmountAzn = Math.round((subtotalAzn * subsidyPercent) / 100);
  const payableTotalAzn = Math.max(0, subtotalAzn - stateSubsidyAmountAzn);

  return {
    distanceKm,
    cruiseSpeedKmH: cruiseSpeed,
    flightTimeMinutes,
    scrambleTimeMinutes,
    totalMissionTimeMinutes,
    isGoldenHourMet,
    fuelRequiredLiters,
    flightBaseCostAzn,
    urgencySurchargeAzn,
    hoistWinchFeeAzn,
    subtotalAzn,
    stateSubsidyAmountAzn,
    payableTotalAzn,
    payableTotalUsd: convertAzn(payableTotalAzn, 'USD'),
    payableTotalEur: convertAzn(payableTotalAzn, 'EUR'),
  };
};

/**
 * 10-Point Aeronautical & Clinical Safety Checklist Item
 */
export interface HemsChecklistItem {
  id: string;
  category: 'AERONAUTICAL' | 'CLINICAL_ICU' | 'METEOROLOGY_ATC';
  titleAz: string;
  titleEn: string;
  regulatoryRef: string;
  isMandatory: boolean;
  descriptionAz: string;
}

/**
 * 10-Question HEMS Regulations Examination
 */
export interface HemsExamQuestion {
  id: string;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
  regulatoryBasis: string;
}

/**
 * Official HEMS-AZ-2026 Flight Clearance Certificate
 */
export interface HemsFlightClearanceCertificate {
  certificateNumber: string; // e.g. HEMS-AZ-2026-XXXXX
  issuedAt: string;
  expiresAt: string;
  callsign: string; // e.g. MEDEVAC-01
  helicopterModel: string;
  operator: string;
  departureHelipadName: string;
  departureHelipadIcao: string;
  destinationHelipadName: string;
  destinationHelipadIcao: string;
  urgencyCode: MedevacUrgencyCode;
  patientTriageSummary: string;
  goldenHourStatus: string;
  estimatedFlightTimeMin: number;
  flightDistanceKm: number;
  weatherCondition: WeatherFlightCondition;
  stateSubsidyPercent: number;
  payableAmountAzn: number;
  flightPhysicianName: string;
  captainPilotName: string;
  simaDigitalUid: string;
  qrVerificationUrl: string;
  cryptographicSha256: string;
}

export const generateHemsCertificateHash = (input: {
  certNumber: string;
  callsign: string;
  depIcao: string;
  destIcao: string;
  timestamp: string;
}): string => {
  const raw = `${input.certNumber}|${input.callsign}|${input.depIcao}->${input.destIcao}|${input.timestamp}|AZ-HEMS-DDAA-2026`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexPart1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hexPart2 = Math.abs((hash * 31) | 0).toString(16).padStart(8, '0');
  const hexPart3 = Math.abs((hash * 127) | 0).toString(16).padStart(8, '0');
  const hexPart4 = Math.abs((hash * 8191) | 0).toString(16).padStart(8, '0');
  return `${hexPart1}${hexPart2}${hexPart3}${hexPart4}`.toUpperCase();
};

export const issueHemsFlightCertificate = (params: {
  departureHelipad: MedicalHelipadInfo;
  destinationHelipad: MedicalHelipadInfo;
  helicopter: HelicopterFleetInfo;
  urgencyCode: MedevacUrgencyCode;
  calcResult: HemsMissionCalculationResult;
  weatherResult: WeatherAssessmentResult;
  patientNotes?: string;
}): HemsFlightClearanceCertificate => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certNumber = `HEMS-AZ-2026-${randomSuffix}`;
  const now = new Date();
  const issuedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(); // 12-hour flight plan window

  const callsign = `MEDEVAC-${Math.floor(10 + Math.random() * 90)}`;
  const simaUid = `SIMA-HEMS-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const sha256 = generateHemsCertificateHash({
    certNumber,
    callsign,
    depIcao: params.departureHelipad.icaoDesignator,
    destIcao: params.destinationHelipad.icaoDesignator,
    timestamp: issuedAt,
  });

  const urgency = MEDEVAC_URGENCY_INFO[params.urgencyCode];

  return {
    certificateNumber: certNumber,
    issuedAt,
    expiresAt,
    callsign,
    helicopterModel: params.helicopter.modelName,
    operator: params.helicopter.operator,
    departureHelipadName: params.departureHelipad.nameAz,
    departureHelipadIcao: params.departureHelipad.icaoDesignator,
    destinationHelipadName: params.destinationHelipad.nameAz,
    destinationHelipadIcao: params.destinationHelipad.icaoDesignator,
    urgencyCode: params.urgencyCode,
    patientTriageSummary:
      params.patientNotes ||
      `${urgency.nameAz} - Xəstənin təcili ixtisaslaşdırılmış reanimasiyaya çatdırılması`,
    goldenHourStatus: params.calcResult.isGoldenHourMet
      ? 'TƏMİN OLUNDU (< 60 dəqiqə)'
      : 'GECİKMƏ RİSKİ (Təcili Stabilizasiya)',
    estimatedFlightTimeMin: params.calcResult.flightTimeMinutes,
    flightDistanceKm: params.calcResult.distanceKm,
    weatherCondition: params.weatherResult.condition,
    stateSubsidyPercent: params.calcResult.stateSubsidyAmountAzn > 0 ? urgency.stateInsuranceSubsidyPercent : 0,
    payableAmountAzn: params.calcResult.payableTotalAzn,
    flightPhysicianName: 'Dr. Əliyar Məmmədov (Təcili Cərrah / Reanimatoloq)',
    captainPilotName: 'Kapt. Rövşən Qasımov (I Dərəcəli HEMS Pilotu)',
    simaDigitalUid: simaUid,
    qrVerificationUrl: `https://hems.gov.az/verify?cert=${certNumber}&sig=${sha256.slice(0, 12)}`,
    cryptographicSha256: sha256,
  };
};
