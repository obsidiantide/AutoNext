/**
 * Official Ministry of Digital Development and Transport (RİNN), Azerbaijan Land Transport Agency (AYNA),
 * State Traffic Police Department of MIA (BDYP) & State Agency of Azerbaijan Automobile Roads (AAYDA)
 * Heavy Haulage Axle Load & Automated Weigh-in-Motion (WIM / Yolda Avtomatik Dinamik Tərəzi Nəzarəti),
 * Bridge Structural Dynamic Telemetry & Official WIM-AZ-2026 Axle Load Compliance Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Road Traffic" ("Yol hərəkəti haqqında" AR Qanunu, Maddə 37, 53)
 * - Law of the Republic of Azerbaijan "On Automobile Roads" ("Avtomobil yolları haqqında" AR Qanunu)
 * - Cabinet of Ministers Resolution No. 104 (7 July 2009 / amended 2023-2025):
 *   "Azərbaycan Respublikasının ümumi istifadədə olan avtomobil yolları ilə hərəkət edən avtonəqliyyat
 *   vasitələrinin icazə verilən qabarit və çəki parametrlərinin təsdiq edilməsi haqqında"
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 322:
 *   İcazə verilən qabarit, çəki və ox parametrlərini aşmaqla nəqliyyat vasitələrini idarə etməyə görə cərimələr)
 * - Rules for Calculating Compensation for Pavement Damage Caused by Overweight Vehicles
 *   (Yol örtüyünə dəyən ziyanın hesablanması və ödənilməsi Qaydaları - Fourth Power Law / ESAL)
 * - SNiP 2.05.03-84 / Eurocode EN 1991-2 Bridge Traffic Loads & Vibration Damping Dynamics
 * - OIML R134 Class 5 / 10 / A Dynamic Automatic Weigh-in-Motion Sensors Standards
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD (1.70 AZN / USD)
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR (1.84 AZN / EUR)
};

/**
 * Axle Category Types according to Cabinet of Ministers Resolution No. 104
 */
export type AxleType =
  | 'STEERING_SINGLE'    // Tək idarəedici ox (Non-drive single steering)
  | 'DRIVE_SINGLE'       // Tək aparıcı ox (Drive single axle with dual tires)
  | 'TANDEM_CLOSE'       // Qoşa ox (araba məsafəsi < 1.0 m)
  | 'TANDEM_MEDIUM'      // Qoşa ox (araba məsafəsi 1.0 - 1.3 m)
  | 'TANDEM_STANDARD'    // Qoşa ox (araba məsafəsi 1.3 - 1.8 m)
  | 'TANDEM_WIDE'        // Qoşa ox (araba məsafəsi 1.8 m və daha çox)
  | 'TRIDEM_COMPACT'     // Üçoxlu araba (oxlar arası <= 1.3 m)
  | 'TRIDEM_STANDARD'    // Üçoxlu araba (oxlar arası 1.3 - 1.4 m)
  | 'QUAD_BOGIE';        // Dörd və ya daha çox oxlu araba

export interface AxleSpecification {
  id: AxleType;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  standardLimitKg: number;
  airSuspensionBonusKg: number;
  descriptionAz: string;
}

export const AXLE_LIMIT_SPECS: Record<AxleType, AxleSpecification> = {
  STEERING_SINGLE: {
    id: 'STEERING_SINGLE',
    nameAz: 'Tək İdarəedici Ox (Qabaq)',
    nameEn: 'Single Steering Axle (Front)',
    nameRu: 'Одиночная рулевая ось (передняя)',
    standardLimitKg: 10000,
    airSuspensionBonusKg: 0,
    descriptionAz: 'Avtomobilin sükan idarəetməsinə malik qabaq tək oxu (maks. 10 ton)',
  },
  DRIVE_SINGLE: {
    id: 'DRIVE_SINGLE',
    nameAz: 'Tək Aparıcı Ox (Qoşa təkərlərlə)',
    nameEn: 'Single Drive Axle (Twin Tyres)',
    nameRu: 'Одиночная ведущая ось (спаренные колеса)',
    standardLimitKg: 11500,
    airSuspensionBonusKg: 0,
    descriptionAz: 'Dartıcı və ya yük maşınının əsas aparıcı tək oxu (maks. 11.5 ton)',
  },
  TANDEM_CLOSE: {
    id: 'TANDEM_CLOSE',
    nameAz: 'Qoşa Ox (Məsafə < 1.0 m)',
    nameEn: 'Tandem Axle (Distance < 1.0 m)',
    nameRu: 'Сдвоенная тележка (расстояние < 1.0 м)',
    standardLimitKg: 11500,
    airSuspensionBonusKg: 0,
    descriptionAz: 'Oxlar arası məsafə 1.0 metrdən az olan qoşa oxlar (maks. 11.5 ton)',
  },
  TANDEM_MEDIUM: {
    id: 'TANDEM_MEDIUM',
    nameAz: 'Qoşa Ox (Məsafə 1.0 - 1.3 m)',
    nameEn: 'Tandem Axle (Distance 1.0 - 1.3 m)',
    nameRu: 'Сдвоенная тележка (расстояние 1.0 - 1.3 м)',
    standardLimitKg: 16000,
    airSuspensionBonusKg: 0,
    descriptionAz: 'Oxlar arası məsafə 1.0 m - 1.3 m olan qoşa oxlar (maks. 16.0 ton)',
  },
  TANDEM_STANDARD: {
    id: 'TANDEM_STANDARD',
    nameAz: 'Qoşa Ox Standart (Məsafə 1.3 - 1.8 m)',
    nameEn: 'Standard Tandem Axle (Distance 1.3 - 1.8 m)',
    nameRu: 'Стандартная сдвоенная ось (1.3 - 1.8 м)',
    standardLimitKg: 18000,
    airSuspensionBonusKg: 1000,
    descriptionAz: 'Oxlar arası 1.3 - 1.8 m olan qoşa ox (hava asqısı ilə 19 ton, mexaniki 18 ton)',
  },
  TANDEM_WIDE: {
    id: 'TANDEM_WIDE',
    nameAz: 'Geniş Qoşa Ox (Məsafə >= 1.8 m)',
    nameEn: 'Wide Tandem Axle (Distance >= 1.8 m)',
    nameRu: 'Широкая сдвоенная ось (расстояние >= 1.8 м)',
    standardLimitKg: 20000,
    airSuspensionBonusKg: 0,
    descriptionAz: 'Oxlar arası 1.8 metrdən çox olan ayrılmış oxlar qrupu (maks. 20.0 ton)',
  },
  TRIDEM_COMPACT: {
    id: 'TRIDEM_COMPACT',
    nameAz: 'Üçoxlu Araba (Məsafə <= 1.3 m)',
    nameEn: 'Tridem Bogie (Distance <= 1.3 m)',
    nameRu: 'Трехосная тележка (расстояние <= 1.3 м)',
    standardLimitKg: 21000,
    airSuspensionBonusKg: 0,
    descriptionAz: 'Yarımqoşqunun kompakt üçoxlu araba ox qrupu (maks. 21.0 ton)',
  },
  TRIDEM_STANDARD: {
    id: 'TRIDEM_STANDARD',
    nameAz: 'Standart Üçoxlu Araba (Məsafə 1.3 - 1.4 m)',
    nameEn: 'Standard Tridem Bogie (Distance 1.3 - 1.4 m)',
    nameRu: 'Стандартная трехосная тележка (1.3 - 1.4 м)',
    standardLimitKg: 24000,
    airSuspensionBonusKg: 0,
    descriptionAz: 'Yarımqoşqu və ya qoşqunun standart üçoxlu araba qrupu (maks. 24.0 ton)',
  },
  QUAD_BOGIE: {
    id: 'QUAD_BOGIE',
    nameAz: 'Çoxoxlu Ağır Araba (4+ Ox)',
    nameEn: 'Multi-Axle Heavy Bogie (4+ Axles)',
    nameRu: 'Многоосная тяжелая тележка (4+ оси)',
    standardLimitKg: 28000,
    airSuspensionBonusKg: 2000,
    descriptionAz: 'Ağır tonnajlı xüsusi qoşquların çoxoxlu modulu (maks. 28.0 - 30.0 ton)',
  },
};

/**
 * Vehicle Configuration Types for Gross Vehicle Weight (GVW / Ümumi Kütlə) Limits
 */
export type VehicleConfigType =
  | 'RIGID_2_AXLE'
  | 'RIGID_3_AXLE'
  | 'RIGID_4_AXLE'
  | 'ARTICULATED_5_AXLE'
  | 'ARTICULATED_6_AXLE'
  | 'ROAD_TRAIN_6_AXLE'
  | 'HEAVY_SPECIAL_PERMIT';

export interface VehicleConfigSpecification {
  id: VehicleConfigType;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  totalAxles: number;
  maxGrossWeightKg: number;
  maxHeightM: number;
  maxWidthM: number;
  maxLengthM: number;
  typicalUseAz: string;
}

export const VEHICLE_CONFIG_SPECS: Record<VehicleConfigType, VehicleConfigSpecification> = {
  RIGID_2_AXLE: {
    id: 'RIGID_2_AXLE',
    nameAz: '2-oxlu Bütöv Yük Avtomobili',
    nameEn: '2-Axle Rigid Truck',
    nameRu: '2-осный одиночный грузовой автомобиль',
    totalAxles: 2,
    maxGrossWeightKg: 18000,
    maxHeightM: 4.0,
    maxWidthM: 2.55,
    maxLengthM: 12.0,
    typicalUseAz: 'Şəhərdaxili paylama və orta tonnajlı daşımalar (18 ton həddi)',
  },
  RIGID_3_AXLE: {
    id: 'RIGID_3_AXLE',
    nameAz: '3-oxlu Bütöv Yük Avtomobili / Özüboşaldan',
    nameEn: '3-Axle Rigid Truck / Dump Truck',
    nameRu: '3-осный одиночный грузовик / Самосвал',
    totalAxles: 3,
    maxGrossWeightKg: 26000,
    maxHeightM: 4.0,
    maxWidthM: 2.55,
    maxLengthM: 12.0,
    typicalUseAz: 'Qoşa arxalı yük maşınları və karyer özüboşaldanları (26 ton həddi)',
  },
  RIGID_4_AXLE: {
    id: 'RIGID_4_AXLE',
    nameAz: '4-oxlu Ağır Tikinti Avtomobili / Betonqarışdıran',
    nameEn: '4-Axle Heavy Construction Truck / Concrete Mixer',
    nameRu: '4-осный тяжелый строительный грузовик / Бетономешалка',
    totalAxles: 4,
    maxGrossWeightKg: 32000,
    maxHeightM: 4.0,
    maxWidthM: 2.55,
    maxLengthM: 12.0,
    typicalUseAz: '4-oxlu 8x4 inşaat betonqarışdıranları və ağır damperləri (32 ton həddi)',
  },
  ARTICULATED_5_AXLE: {
    id: 'ARTICULATED_5_AXLE',
    nameAz: '5-oxlu Qoşqulu TIR (2-oxlu dartıcı + 3-oxlu yarımqoşqu)',
    nameEn: '5-Axle Articulated Semi-Trailer (4x2 Tractor + Tri-Axle)',
    nameRu: '5-осный автопоезд (тягач 4х2 + полуприцеп)',
    totalAxles: 5,
    maxGrossWeightKg: 40000,
    maxHeightM: 4.0,
    maxWidthM: 2.55,
    maxLengthM: 16.5,
    typicalUseAz: 'Beynəlxalq və daxili magistral yük daşımaları (standart 40 ton həddi)',
  },
  ARTICULATED_6_AXLE: {
    id: 'ARTICULATED_6_AXLE',
    nameAz: '6-oxlu İntermodal Konteynerdaşıyan TIR',
    nameEn: '6-Axle Intermodal ISO Container Transporter',
    nameRu: '6-осный контейнеровоз для интермодальных перевозок',
    totalAxles: 6,
    maxGrossWeightKg: 44000,
    maxHeightM: 4.0,
    maxWidthM: 2.55,
    maxLengthM: 16.5,
    typicalUseAz: '40/45 fut ISO konteynerlərin dəmiryol/liman intermodal daşınması (44 ton)',
  },
  ROAD_TRAIN_6_AXLE: {
    id: 'ROAD_TRAIN_6_AXLE',
    nameAz: 'Qoşqulu Qatar (3-oxlu maşın + 3-oxlu dönər qoşqu)',
    nameEn: 'Road Train (3-Axle Truck + 3-Axle Drawbar Trailer)',
    nameRu: 'Автопоезд (грузовик 3 оси + прицеп 3 оси)',
    totalAxles: 6,
    maxGrossWeightKg: 44000,
    maxHeightM: 4.0,
    maxWidthM: 2.55,
    maxLengthM: 20.0,
    typicalUseAz: 'Həcmli yük və kənd təsərrüfatı daşımaları (maks. 20.0 metr uzunluq)',
  },
  HEAVY_SPECIAL_PERMIT: {
    id: 'HEAVY_SPECIAL_PERMIT',
    nameAz: 'Ağır Bölünməz Yük / Xüsusi İcazəli Karvan',
    nameEn: 'Heavy Indivisible Haulage (Special Permit Route)',
    nameRu: 'Тяжеловесный неделимый груз (маршрут по спецразрешению)',
    totalAxles: 8,
    maxGrossWeightKg: 60000,
    maxHeightM: 4.5,
    maxWidthM: 3.5,
    maxLengthM: 25.0,
    typicalUseAz: 'Böyük qabaritli sənaye transformatorları və neft avadanlıqları',
  },
};

export interface AxleWeightDetail {
  axleIndex: number;
  axleType: AxleType;
  measuredWeightKg: number;
  legalLimitKg: number;
  hasAirSuspension: boolean;
  isOverweight: boolean;
  excessWeightKg: number;
  overloadPercentage: number;
  wearFactorEsal: number; // Equivalent Single Axle Load relative to 8.16t (18,000 lbs)
}

export interface BridgeTelemetryResult {
  bridgeNameAz: string;
  spanLengthM: number;
  totalVehicleWeightKg: number;
  vehicleSpeedKmh: number;
  midSpanDeflectionMm: number;
  allowableDeflectionMm: number; // L / 800 standard limit
  isDeflectionSafe: boolean;
  vibrationFrequencyHz: number;
  dampingRatio: number;
  dynamicAmplificationFactor: number; // DAF (1.10 - 1.40)
  structuralLoadRating: 'SAFE' | 'WARNING' | 'CRITICAL_RISK';
}

export interface AxleLoadCalculation {
  vehicleConfig: VehicleConfigType;
  totalMeasuredGrossWeightKg: number;
  legalMaxGrossWeightKg: number;
  isGrossOverweight: boolean;
  excessGrossWeightKg: number;
  grossOverloadPercentage: number;
  axleDetails: AxleWeightDetail[];
  totalEsalPavementDamage: number; // Cumulative Fourth Power Law ESAL
  roadDamageCompensationAzn: number;
  roadDamageCompensationConverted: number;
  administrativeFineAzn: number;
  administrativeFineConverted: number;
  administrativeCodeArticle: string;
  requiresSpecialPermit: boolean;
  isVehicleImpounded: boolean;
  currency: Currency;
  currencySymbol: string;
  bridgeTelemetry: BridgeTelemetryResult;
  complianceRating: 'COMPLIANT' | 'MINOR_WARNING' | 'SUBSTANTIAL_OVERWEIGHT' | 'CRITICAL_HAZARD';
}

/**
 * Standard AASHTO ESAL reference load: 8,160 kg (80 kN / 18,000 lbs single axle)
 */
export const STANDARD_AXLE_LOAD_KG = 8160;

/**
 * Calculate Fourth Power Law pavement damage wear factor (ESAL)
 * Formula: ESAL = (AxleLoad / StandardLoad)^4
 */
export function calculateEsalFactor(axleWeightKg: number): number {
  if (axleWeightKg <= 0) return 0;
  const ratio = axleWeightKg / STANDARD_AXLE_LOAD_KG;
  const esal = Math.pow(ratio, 4);
  return Number(esal.toFixed(2));
}

/**
 * Calculate Bridge Dynamic Telemetry based on vehicle speed, span length, and total weight
 */
export function calculateBridgeTelemetry(params: {
  spanLengthM: number;
  totalWeightKg: number;
  speedKmh: number;
  bridgeNameAz?: string;
}): BridgeTelemetryResult {
  const span = Math.max(10, Math.min(200, params.spanLengthM));
  const weightTonnes = params.totalWeightKg / 1000;
  const speed = Math.max(10, Math.min(120, params.speedKmh));
  const name = params.bridgeNameAz || 'M2 Kürdəmir-Yevlax Körpü Keçidi (Aşırım 45m)';

  // Structural mechanics approximation:
  // Allowable deflection = Span / 800 (SNiP / Eurocode)
  const allowableDeflectionMm = Number(((span * 1000) / 800).toFixed(1));

  // Dynamic Amplification Factor: DAF = 1.0 + 0.4 / (1 + 0.2 * span) * (speed / 80)
  const daf = Number((1.0 + (0.4 / (1 + 0.2 * span)) * (speed / 80)).toFixed(2));

  // Mid-span deflection: ~ (P * L^3 / (48 * E * I)) dynamic response factor
  // Normalized calibrated factor for standard concrete/steel bridge girders
  const baseDeflectionMm = (weightTonnes * Math.pow(span / 30, 1.8) * 0.35) * daf;
  const midSpanDeflectionMm = Number(baseDeflectionMm.toFixed(1));

  const isDeflectionSafe = midSpanDeflectionMm <= allowableDeflectionMm;

  // Natural vibration frequency (Hz)
  const vibrationFrequencyHz = Number((12.5 / Math.sqrt(span * 0.25 + 1.0)).toFixed(2));
  const dampingRatio = 0.035; // typical reinforced pre-stressed concrete damping (3.5%)

  let structuralLoadRating: 'SAFE' | 'WARNING' | 'CRITICAL_RISK' = 'SAFE';
  const ratio = midSpanDeflectionMm / allowableDeflectionMm;
  if (ratio > 1.0) {
    structuralLoadRating = 'CRITICAL_RISK';
  } else if (ratio > 0.8) {
    structuralLoadRating = 'WARNING';
  }

  return {
    bridgeNameAz: name,
    spanLengthM: span,
    totalVehicleWeightKg: params.totalWeightKg,
    vehicleSpeedKmh: speed,
    midSpanDeflectionMm,
    allowableDeflectionMm,
    isDeflectionSafe,
    vibrationFrequencyHz,
    dampingRatio,
    dynamicAmplificationFactor: daf,
    structuralLoadRating,
  };
}

/**
 * Calculate Comprehensive Axle Load, Gross Vehicle Weight, Administrative Fines,
 * and Pavement Road Damage Compensation.
 */
export function calculateAxleLoadCompliance(params: {
  vehicleConfig: VehicleConfigType;
  axleWeights: number[];
  airSuspensionAxles?: boolean[];
  transitDistanceKm?: number;
  speedKmh?: number;
  spanLengthM?: number;
  bridgeNameAz?: string;
  currency?: Currency;
}): AxleLoadCalculation {
  const currency = params.currency || 'AZN';
  const rate = CURRENCY_RATES[currency] || 1.0;
  const configSpec = VEHICLE_CONFIG_SPECS[params.vehicleConfig];
  const transitDistanceKm = params.transitDistanceKm || 120;
  const speedKmh = params.speedKmh || 65;
  const spanLengthM = params.spanLengthM || 45;

  const currencySymbols: Record<Currency, string> = {
    AZN: '₼',
    USD: '$',
    EUR: '€',
  };

  // Determine axle details
  const axleWeights = params.axleWeights;
  const airSuspension = params.airSuspensionAxles || [];

  const axleDetails: AxleWeightDetail[] = axleWeights.map((weightKg, idx) => {
    let axleType: AxleType = 'STEERING_SINGLE';
    if (idx === 0) {
      axleType = 'STEERING_SINGLE';
    } else if (params.vehicleConfig === 'RIGID_2_AXLE') {
      axleType = 'DRIVE_SINGLE';
    } else if (params.vehicleConfig === 'RIGID_3_AXLE') {
      axleType = 'TANDEM_STANDARD';
    } else if (params.vehicleConfig === 'RIGID_4_AXLE') {
      axleType = idx === 1 ? 'STEERING_SINGLE' : 'TANDEM_STANDARD';
    } else if (params.vehicleConfig === 'ARTICULATED_5_AXLE') {
      if (idx === 1) axleType = 'DRIVE_SINGLE';
      else axleType = 'TRIDEM_STANDARD';
    } else if (params.vehicleConfig === 'ARTICULATED_6_AXLE' || params.vehicleConfig === 'ROAD_TRAIN_6_AXLE') {
      if (idx === 1) axleType = 'DRIVE_SINGLE';
      else if (idx === 2) axleType = 'DRIVE_SINGLE';
      else axleType = 'TRIDEM_STANDARD';
    } else {
      axleType = idx < 2 ? 'STEERING_SINGLE' : 'QUAD_BOGIE';
    }

    const hasAir = Boolean(airSuspension[idx]);
    const spec = AXLE_LIMIT_SPECS[axleType];
    const legalLimitKg = spec.standardLimitKg + (hasAir ? spec.airSuspensionBonusKg : 0);
    const excessWeightKg = Math.max(0, weightKg - legalLimitKg);
    const isOverweight = excessWeightKg > 0;
    const overloadPercentage = Number(((excessWeightKg / legalLimitKg) * 100).toFixed(1));
    const wearFactorEsal = calculateEsalFactor(weightKg);

    return {
      axleIndex: idx + 1,
      axleType,
      measuredWeightKg: weightKg,
      legalLimitKg,
      hasAirSuspension: hasAir,
      isOverweight,
      excessWeightKg,
      overloadPercentage,
      wearFactorEsal,
    };
  });

  const totalMeasuredGrossWeightKg = axleWeights.reduce((sum, w) => sum + w, 0);
  const legalMaxGrossWeightKg = configSpec.maxGrossWeightKg;
  const excessGrossWeightKg = Math.max(0, totalMeasuredGrossWeightKg - legalMaxGrossWeightKg);
  const isGrossOverweight = excessGrossWeightKg > 0;
  const grossOverloadPercentage = Number(((excessGrossWeightKg / legalMaxGrossWeightKg) * 100).toFixed(1));

  // Total ESAL calculation
  const totalEsalPavementDamage = Number(
    axleDetails.reduce((sum, ax) => sum + ax.wearFactorEsal, 0).toFixed(2)
  );

  // Administrative Fine (İXM Maddə 322) & Road Damage Compensation calculation
  // Statutory tiers under İXM 322:
  // - Overweight <= 5%: tolerance buffer, no fine (warning)
  // - 5% < Overweight <= 15%: 600 AZN (physical) / 1,400 AZN (official)
  // - 15% < Overweight <= 25%: 1,000 AZN / 2,500 AZN
  // - Overweight > 25%: 2,000 AZN / 4,000 AZN + vehicle impounded until offloaded
  let administrativeFineAzn = 0;
  let articleCode = 'İXM Maddə 322 (Uyğundur)';
  let isVehicleImpounded = false;
  let requiresSpecialPermit = false;

  const maxOverloadPercent = Math.max(
    grossOverloadPercentage,
    ...axleDetails.map(a => a.overloadPercentage)
  );

  if (maxOverloadPercent > 25) {
    administrativeFineAzn = 2000;
    articleCode = 'İXM Maddə 322.3 (Çəki və ya ox yükünün 25%-dən çox aşılması)';
    isVehicleImpounded = true;
    requiresSpecialPermit = true;
  } else if (maxOverloadPercent > 15) {
    administrativeFineAzn = 1000;
    articleCode = 'İXM Maddə 322.2 (Çəki və ya ox yükünün 15%-dən 25%-dək aşılması)';
    requiresSpecialPermit = true;
  } else if (maxOverloadPercent > 5) {
    administrativeFineAzn = 600;
    articleCode = 'İXM Maddə 322.1 (Çəki və ya ox yükünün 5%-dən 15%-dək aşılması)';
  } else if (maxOverloadPercent > 0) {
    administrativeFineAzn = 0;
    articleCode = 'Qanuni Xəta Həddi daxilində (5%-dək qanuni xəta payı)';
  }

  // Road pavement damage compensation calculation
  // Formula: Base tariff 0.15 AZN per excess tonne per km + ESAL impact fee
  const excessTonnes = Math.max(
    excessGrossWeightKg / 1000,
    axleDetails.reduce((sum, a) => sum + a.excessWeightKg, 0) / 1000
  );
  let roadDamageCompensationAzn = 0;
  if (excessTonnes > 0) {
    const baseDamageFee = excessTonnes * transitDistanceKm * 0.18;
    const esalDamageMultiplier = Math.max(1, totalEsalPavementDamage / 8.0);
    roadDamageCompensationAzn = Math.round(baseDamageFee * esalDamageMultiplier);
  }

  // Bridge dynamic telemetry
  const bridgeTelemetry = calculateBridgeTelemetry({
    spanLengthM,
    totalWeightKg: totalMeasuredGrossWeightKg,
    speedKmh,
    bridgeNameAz: params.bridgeNameAz,
  });

  // Compliance rating
  let complianceRating: 'COMPLIANT' | 'MINOR_WARNING' | 'SUBSTANTIAL_OVERWEIGHT' | 'CRITICAL_HAZARD' = 'COMPLIANT';
  if (maxOverloadPercent > 25 || !bridgeTelemetry.isDeflectionSafe) {
    complianceRating = 'CRITICAL_HAZARD';
  } else if (maxOverloadPercent > 5 || bridgeTelemetry.structuralLoadRating === 'WARNING') {
    complianceRating = 'SUBSTANTIAL_OVERWEIGHT';
  } else if (maxOverloadPercent > 0) {
    complianceRating = 'MINOR_WARNING';
  }

  return {
    vehicleConfig: params.vehicleConfig,
    totalMeasuredGrossWeightKg,
    legalMaxGrossWeightKg,
    isGrossOverweight,
    excessGrossWeightKg,
    grossOverloadPercentage,
    axleDetails,
    totalEsalPavementDamage,
    roadDamageCompensationAzn,
    roadDamageCompensationConverted: Number((roadDamageCompensationAzn * rate).toFixed(2)),
    administrativeFineAzn,
    administrativeFineConverted: Number((administrativeFineAzn * rate).toFixed(2)),
    administrativeCodeArticle: articleCode,
    requiresSpecialPermit,
    isVehicleImpounded,
    currency,
    currencySymbol: currencySymbols[currency],
    bridgeTelemetry,
    complianceRating,
  };
}

/**
 * Safety Checklist scoring calculation
 */
export interface ChecklistAuditResult {
  totalItems: number;
  completedItems: number;
  scorePercentage: number;
  isEligibleForCertificate: boolean;
  criticalPendingItems: string[];
}

export function evaluateAxleChecklist(
  items: Array<{ id: string; titleAz: string; isChecked: boolean; isCritical: boolean }>
): ChecklistAuditResult {
  const totalItems = items.length;
  const completedItems = items.filter(i => i.isChecked).length;
  const scorePercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const criticalPendingItems = items
    .filter(i => i.isCritical && !i.isChecked)
    .map(i => i.titleAz);

  const isEligibleForCertificate = scorePercentage >= 80 && criticalPendingItems.length === 0;

  return {
    totalItems,
    completedItems,
    scorePercentage,
    isEligibleForCertificate,
    criticalPendingItems,
  };
}

/**
 * Theoretical Examination evaluation
 */
export interface ExamEvaluationResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  isPassed: boolean;
}

export function evaluateAxleExam(
  questions: Array<{ id: string; selectedAnswerIndex: number | null; correctAnswerIndex: number }>
): ExamEvaluationResult {
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter(
    q => q.selectedAnswerIndex !== null && q.selectedAnswerIndex === q.correctAnswerIndex
  ).length;

  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const isPassed = scorePercentage >= 70;

  return {
    totalQuestions,
    correctAnswers,
    scorePercentage,
    isPassed,
  };
}

/**
 * Official WIM Certificate Generator
 */
export interface OfficialWimCertificate {
  certificateId: string;
  issueDate: string;
  validUntil: string;
  stationId: string;
  stationNameAz: string;
  highwayCode: string;
  vehiclePlate: string;
  vehicleConfigNameAz: string;
  measuredGrossWeightKg: number;
  legalMaxGrossWeightKg: number;
  axleCount: number;
  complianceRating: 'COMPLIANT' | 'MINOR_WARNING' | 'SUBSTANTIAL_OVERWEIGHT' | 'CRITICAL_HAZARD';
  esalPavementDamage: number;
  bridgeDeflectionMm: number;
  fineAmountAzn: number;
  roadCompensationAzn: number;
  simaDigitalUid: string;
  sha256Checksum: string;
  qrPayload: string;
}

export function generateWimCertificate(params: {
  stationId: string;
  stationNameAz: string;
  highwayCode: string;
  vehiclePlate: string;
  calculation: AxleLoadCalculation;
}): OfficialWimCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `WIM-AZ-2026-${randomSuffix}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  
  // Valid for 72 hours for transit clearance
  const expiryDate = new Date(now.getTime() + 72 * 3600 * 1000).toISOString().split('T')[0];

  const vehicleConfigSpec = VEHICLE_CONFIG_SPECS[params.calculation.vehicleConfig];

  const simaDigitalUid = `SIMA-WIM-AZ-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
  const sha256Checksum = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const qrPayload = `https://ayna.gov.az/wim-verify?cert=${certificateId}&plate=${encodeURIComponent(
    params.vehiclePlate
  )}&weight=${params.calculation.totalMeasuredGrossWeightKg}&status=${params.calculation.complianceRating}&uid=${simaDigitalUid}`;

  return {
    certificateId,
    issueDate,
    validUntil: expiryDate,
    stationId: params.stationId,
    stationNameAz: params.stationNameAz,
    highwayCode: params.highwayCode,
    vehiclePlate: params.vehiclePlate,
    vehicleConfigNameAz: vehicleConfigSpec.nameAz,
    measuredGrossWeightKg: params.calculation.totalMeasuredGrossWeightKg,
    legalMaxGrossWeightKg: params.calculation.legalMaxGrossWeightKg,
    axleCount: params.calculation.axleDetails.length,
    complianceRating: params.calculation.complianceRating,
    esalPavementDamage: params.calculation.totalEsalPavementDamage,
    bridgeDeflectionMm: params.calculation.bridgeTelemetry.midSpanDeflectionMm,
    fineAmountAzn: params.calculation.administrativeFineAzn,
    roadCompensationAzn: params.calculation.roadDamageCompensationAzn,
    simaDigitalUid,
    sha256Checksum,
    qrPayload,
  };
}
