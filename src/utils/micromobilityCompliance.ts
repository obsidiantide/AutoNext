/**
 * Official Azerbaijan Ground Transport Agency (AYNA), Ministry of Digital Development and Transport (RİNN)
 * & State Traffic Police (BDYP) Urban Micromobility, Dedicated Bicycle Lanes Network,
 * E-Scooter Dynamic Geofencing & Rental Operator Safety Telemetry Portal Engine
 * (AYNA & BDYP Rəqəmsal Mikromobillik, Velosiped Zolaqları Şəbəkəsi,
 * Elektrosamokat və Velosiped Geofencing, Təhlükəsizlik Telemetriyası və MICROMOBILITY-BAKU-AZ-2026 Portalı)
 *
 * Statutory Framework:
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 46, 47, 48: Velosipedlərin, mopedlərin və fərdi mobillik vasitələrinin hərəkəti)
 * - Cabinet of Ministers Resolution No. 129 on Urban Micromobility Speed Limits & Safety Regulations
 * - European Standard EN 17128 (Light motorized vehicles for the transportation of persons and goods - PLEV)
 * - ISO 4210 (Cycles - Safety requirements for bicycles)
 * - UN 38.3 & IEC 62133 (Lithium-ion Battery Safety & Thermal Runaway Protection)
 * - Code of Administrative Offences of the Republic of Azerbaijan (Maddə 338: Piyadalar və yol hərəkətinin digər iştirakçıları tərəfindən qaydaların pozulması)
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

export type GeofenceZoneType = 'green' | 'yellow' | 'red' | 'purple';

export interface GeofenceZoneInfo {
  type: GeofenceZoneType;
  nameAz: string;
  nameEn: string;
  speedLimitKmh: number;
  throttleAction: 'full_power' | 'restricted_governor' | 'throttle_cutoff' | 'parking_snap';
  descriptionAz: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export const GEOFENCE_ZONE_DEFINITIONS: Record<GeofenceZoneType, GeofenceZoneInfo> = {
  green: {
    type: 'green',
    nameAz: 'Yaşıl Zona - Ayrılmış Velosiped Zolağı',
    nameEn: 'Green Zone - Dedicated Bike Lane',
    speedLimitKmh: 20,
    throttleAction: 'full_power',
    descriptionAz: 'YHQ Maddə 46 üzrə ayrılmış sarı-ağ xətli xüsusi velozolaq. Maksimum icazə verilən sürət 20 km/saat.',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
  },
  yellow: {
    type: 'yellow',
    nameAz: 'Sarı Zona - Yüksək Piyada Sıxlığı / Qarışıq Zona',
    nameEn: 'Yellow Zone - High Pedestrian Density / Mixed',
    speedLimitKmh: 12,
    throttleAction: 'restricted_governor',
    descriptionAz: 'Fəvvarələr Meydanı, Nizami (Torqovaya) və Dənizkənarı Park piyada zonaları. Avtomatik elektron sürət məhdudiyyəti 10-12 km/saat.',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
  },
  red: {
    type: 'red',
    nameAz: 'Qırmızı Zona - Qadağan Edilmiş Hərəkət Zonası',
    nameEn: 'Red Zone - No-Ride Prohibited Zone',
    speedLimitKmh: 0,
    throttleAction: 'throttle_cutoff',
    descriptionAz: 'Avtomobil magistralları (Heydər Əliyev prospekti sürətli zolağı, Zığ şosesi, Bakı Dairəvi yolu), tunellər və metro stansiyaları. Mühərrik dərhal sönür.',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/30',
  },
  purple: {
    type: 'purple',
    nameAz: 'Bənövşəyi Zona - Rəsmi Parklanma Cibi (P-Spot)',
    nameEn: 'Purple Zone - Official Parking Bay (P-Spot)',
    speedLimitKmh: 5,
    throttleAction: 'parking_snap',
    descriptionAz: 'AYNA tərəfindən xüsusi ayrılmış mikromobillik parklanma yeri. Fotosübut tələb olunur, səkidə nizamsız qoyulma 50 AZN cəriməyə səbəb olur.',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
  },
};

export type MicromobilityVehicleCategory =
  | 'e_scooter'
  | 'e_bike'
  | 'city_bicycle'
  | 'cargo_e_bike'
  | 'shared_fleet_scooter';

export interface VehicleCategoryConfig {
  id: MicromobilityVehicleCategory;
  nameAz: string;
  nameEn: string;
  motorPowerWatts: number;
  maxAutonomousSpeedKmh: number;
  minAge: number;
  requiresHelmet: boolean;
  requiresPlate: boolean;
  baseUnlockFeeAzn: number;
  perMinuteRateAzn: number;
  co2SavingsPerKmGrams: number;
  descriptionAz: string;
}

export const MICROMOBILITY_VEHICLE_CONFIGS: Record<MicromobilityVehicleCategory, VehicleCategoryConfig> = {
  e_scooter: {
    id: 'e_scooter',
    nameAz: 'Elektrosamokat (Fərdi E-Skuter)',
    nameEn: 'Electric Kick Scooter (Personal)',
    motorPowerWatts: 350,
    maxAutonomousSpeedKmh: 20,
    minAge: 14,
    requiresHelmet: true,
    requiresPlate: false,
    baseUnlockFeeAzn: 0,
    perMinuteRateAzn: 0,
    co2SavingsPerKmGrams: 110,
    descriptionAz: 'Fərdi mülkiyyətdə olan elektrik samokatı. YHQ Maddə 48.1 üzrə tənzimlənir, velozolaqlarda 20 km/s limit.',
  },
  e_bike: {
    id: 'e_bike',
    nameAz: 'Elektrikli Şəhər Velosipedi (Pedelec 250W)',
    nameEn: 'Electric City Bicycle (Pedelec)',
    motorPowerWatts: 250,
    maxAutonomousSpeedKmh: 25,
    minAge: 14,
    requiresHelmet: true,
    requiresPlate: false,
    baseUnlockFeeAzn: 0.5,
    perMinuteRateAzn: 0.12,
    co2SavingsPerKmGrams: 130,
    descriptionAz: 'Pedal assist elektrik intiqallı velosiped. Maksimum köməkçi sürət 25 km/s, EN 15194 standartı.',
  },
  city_bicycle: {
    id: 'city_bicycle',
    nameAz: 'Klassik Mexaniki Şəhər Velosipedi',
    nameEn: 'Mechanical City Bicycle',
    motorPowerWatts: 0,
    maxAutonomousSpeedKmh: 30,
    minAge: 12,
    requiresHelmet: true,
    requiresPlate: false,
    baseUnlockFeeAzn: 0.3,
    perMinuteRateAzn: 0.05,
    co2SavingsPerKmGrams: 150,
    descriptionAz: 'Klassik mexaniki velosiped. Sıfır emissiya, şəhər daxili ayrılmış zolaqlarda sərbəst hərəkət hüququ.',
  },
  cargo_e_bike: {
    id: 'cargo_e_bike',
    nameAz: 'Kuryer / Yük Elektrik Velosipedi (Cargo 500W)',
    nameEn: 'Commercial Cargo E-Bike (Courier)',
    motorPowerWatts: 500,
    maxAutonomousSpeedKmh: 20,
    minAge: 16,
    requiresHelmet: true,
    requiresPlate: false,
    baseUnlockFeeAzn: 1.0,
    perMinuteRateAzn: 0.15,
    co2SavingsPerKmGrams: 175,
    descriptionAz: 'Çatdırılma xidmətləri üçün nəzərdə tutulmuş yük bölməli e-velosiped. 120 kq faydalı yük daşıma gücü.',
  },
  shared_fleet_scooter: {
    id: 'shared_fleet_scooter',
    nameAz: 'İcarə Şəbəkəsi Elektrosamokatı (Wingz / Jet / Whoosh)',
    nameEn: 'Shared Fleet E-Scooter (Wingz / Jet / Whoosh)',
    motorPowerWatts: 450,
    maxAutonomousSpeedKmh: 20,
    minAge: 16,
    requiresHelmet: true,
    requiresPlate: false,
    baseUnlockFeeAzn: 0.8,
    perMinuteRateAzn: 0.18,
    co2SavingsPerKmGrams: 115,
    descriptionAz: 'AYNA lisenziyalı rəqəmsal icarə donanması. Mərkəzi telemetriya və geofencing nəzarəti ilə təchiz olunub.',
  },
};

export type CorridorId =
  | 'boulevard_seaside'
  | 'central_baku_ring'
  | 'winter_park_rail'
  | 'white_city_corridor'
  | 'academic_university_hub'
  | 'koroglu_intermodal_trail';

export interface StrategicCorridor {
  id: CorridorId;
  nameAz: string;
  nameEn: string;
  lengthKm: number;
  widthMeters: number;
  surfaceType: 'red_asphalt_micro' | 'epoxy_anti_skid' | 'polyurethane_green' | 'paved_interlock';
  primaryGeofence: GeofenceZoneType;
  maxSpeedKmh: number;
  activeScootersCount: number;
  activeBicyclesCount: number;
  pSpotParkingBays: number;
  connectedMetroStations: string[];
  descriptionAz: string;
}

export const STRATEGIC_CORRIDORS: Record<CorridorId, StrategicCorridor> = {
  boulevard_seaside: {
    id: 'boulevard_seaside',
    nameAz: 'Dənizkənarı Milli Park Sahil Mikromobillik Dəhlizi',
    nameEn: 'Baku Boulevard Seaside Micromobility Corridor',
    lengthKm: 15.2,
    widthMeters: 3.5,
    surfaceType: 'red_asphalt_micro',
    primaryGeofence: 'green',
    maxSpeedKmh: 20,
    activeScootersCount: 342,
    activeBicyclesCount: 218,
    pSpotParkingBays: 48,
    connectedMetroStations: ['Sahil', 'İçərişəhər', 'Xətai'],
    descriptionAz: 'Ağ Şəhərdən Su İdmanı Sarayınadək uzanan 15.2 km-lik fasiləsiz sahil velosiped magistralı.',
  },
  central_baku_ring: {
    id: 'central_baku_ring',
    nameAz: 'Mərkəzi Bakı Tarixi Halqası (İstiqlaliyyət - Azərbaycan pr. - Nizami)',
    nameEn: 'Central Baku Historic Ring (Istiglaliyyat - Azerbaijan Ave - Nizami)',
    lengthKm: 6.8,
    widthMeters: 2.5,
    surfaceType: 'epoxy_anti_skid',
    primaryGeofence: 'yellow',
    maxSpeedKmh: 12,
    activeScootersCount: 185,
    activeBicyclesCount: 94,
    pSpotParkingBays: 32,
    connectedMetroStations: ['İçərişəhər', '28 May', 'Nizami'],
    descriptionAz: 'Şəhər mərkəzində piyada axını yüksək olan qarışıq mədəniyyət və ticarət zonası.',
  },
  winter_park_rail: {
    id: 'winter_park_rail',
    nameAz: 'Qış Parkı - Heydər Əliyev Sarayı - Bakı Dəmiryol Vağzalı Əlaqəsi',
    nameEn: 'Winter Park - Heydar Aliyev Palace - Baku Railway Station Link',
    lengthKm: 4.5,
    widthMeters: 3.0,
    surfaceType: 'red_asphalt_micro',
    primaryGeofence: 'green',
    maxSpeedKmh: 20,
    activeScootersCount: 146,
    activeBicyclesCount: 88,
    pSpotParkingBays: 24,
    connectedMetroStations: ['28 May', 'Cəfər Cabbarlı'],
    descriptionAz: 'Mərkəzi Dəmiryol Vağzalı ilə şəhər mərkəzini birləşdirən intermodal velodəhliz.',
  },
  white_city_corridor: {
    id: 'white_city_corridor',
    nameAz: 'Bakı Ağ Şəhər (Baku White City) Ağıllı Mobillik Bulvarı',
    nameEn: 'Baku White City Smart Mobility Boulevard',
    lengthKm: 5.4,
    widthMeters: 3.2,
    surfaceType: 'polyurethane_green',
    primaryGeofence: 'green',
    maxSpeedKmh: 20,
    activeScootersCount: 160,
    activeBicyclesCount: 112,
    pSpotParkingBays: 28,
    connectedMetroStations: ['Xətai', 'Ağ Şəhər (Planlaşdırılan)'],
    descriptionAz: 'Müasir şəhərsalma standartlarına uyğun ikitərəfli qorunan velosiped şəbəkəsi.',
  },
  academic_university_hub: {
    id: 'academic_university_hub',
    nameAz: 'Akademik Tələbə Şəhərciyi (Elmlər Akademiyası - BDU - AzTU - Memarlıq)',
    nameEn: 'Academic University Campus Hub (Academy of Sciences - BSU - AzTU)',
    lengthKm: 5.1,
    widthMeters: 2.8,
    surfaceType: 'epoxy_anti_skid',
    primaryGeofence: 'green',
    maxSpeedKmh: 20,
    activeScootersCount: 220,
    activeBicyclesCount: 175,
    pSpotParkingBays: 36,
    connectedMetroStations: ['Elmlər Akademiyası', 'İnşaatçılar'],
    descriptionAz: 'Tələbələr və tədqiqatçılar üçün xüsusi güzəştli tarif zonası və sıx mikromobillik xətti.',
  },
  koroglu_intermodal_trail: {
    id: 'koroglu_intermodal_trail',
    nameAz: 'Koroğlu Nəqliyyat Mübadilə Mərkəzi və Böyükşor Ekoloji Zolağı',
    nameEn: 'Koroglu Intermodal Transport Hub & Boyukshor Eco Trail',
    lengthKm: 8.6,
    widthMeters: 3.5,
    surfaceType: 'paved_interlock',
    primaryGeofence: 'green',
    maxSpeedKmh: 20,
    activeScootersCount: 118,
    activeBicyclesCount: 65,
    pSpotParkingBays: 20,
    connectedMetroStations: ['Koroğlu'],
    descriptionAz: 'Bakıətrafı qəsəbələrdən metroya gələn sərnişinlər üçün son mil (last-mile) ekoloji keçid.',
  },
};

export interface TelemetryState {
  currentSpeedKmh: number;
  batterySocPercent: number;
  batteryTempCelsius: number;
  geofenceZone: GeofenceZoneType;
  helmetDetected: boolean;
  tandemRidingDetected: boolean;
  surfaceVibrationG: number;
  brakingPowerPercent: number;
  regenerativeHarvestingWatts: number;
  distanceTraveledKm: number;
}

export interface TelemetryEvaluation {
  governedSpeedKmh: number;
  isThrottleCutoff: boolean;
  isSpeedingViolation: boolean;
  isHelmetViolation: boolean;
  isTandemViolation: boolean;
  isRoughSurfaceWarning: boolean;
  isBatteryLowWarning: boolean;
  penaltyPoints: number;
  fineAmountAzn: number;
  statusBadgeAz: string;
  statusBadgeEn: string;
  badgeVariant: 'success' | 'warning' | 'danger';
}

export function evaluateMicromobilityTelemetry(telemetry: TelemetryState): TelemetryEvaluation {
  const zoneConfig = GEOFENCE_ZONE_DEFINITIONS[telemetry.geofenceZone];
  const maxAllowed = zoneConfig.speedLimitKmh;

  let governedSpeedKmh = telemetry.currentSpeedKmh;
  let isThrottleCutoff = false;

  if (zoneConfig.throttleAction === 'throttle_cutoff') {
    governedSpeedKmh = 0;
    isThrottleCutoff = true;
  } else if (zoneConfig.throttleAction === 'restricted_governor') {
    governedSpeedKmh = Math.min(telemetry.currentSpeedKmh, maxAllowed);
  } else if (zoneConfig.throttleAction === 'parking_snap') {
    governedSpeedKmh = Math.min(telemetry.currentSpeedKmh, 5);
  }

  const isSpeedingViolation = telemetry.currentSpeedKmh > maxAllowed + 2;
  const isHelmetViolation = !telemetry.helmetDetected;
  const isTandemViolation = telemetry.tandemRidingDetected;
  const isRoughSurfaceWarning = telemetry.surfaceVibrationG > 1.8;
  const isBatteryLowWarning = telemetry.batterySocPercent < 15;

  let fineAmountAzn = 0;
  let penaltyPoints = 0;

  if (isThrottleCutoff) {
    fineAmountAzn += 50; // Qadağan zonada sürmə
    penaltyPoints += 2;
  }
  if (isSpeedingViolation) {
    fineAmountAzn += 40; // YHQ sürət həddi aşılması
    penaltyPoints += 1;
  }
  if (isHelmetViolation) {
    fineAmountAzn += 20; // Dəbilqəsiz sürmə Maddə 338.3
  }
  if (isTandemViolation) {
    fineAmountAzn += 30; // İki nəfərlə minmə qadağası
    penaltyPoints += 1;
  }

  let statusBadgeAz = 'Təhlükəsiz və Qanunauyğun Hərəkət';
  let statusBadgeEn = 'Safe & Compliant Transit';
  let badgeVariant: 'success' | 'warning' | 'danger' = 'success';

  if (isThrottleCutoff || isTandemViolation) {
    statusBadgeAz = 'Kritik Təhlükəsizlik Pozuntusu (Mühərrik Kəsildi)';
    statusBadgeEn = 'Critical Safety Violation (Motor Cut Off)';
    badgeVariant = 'danger';
  } else if (isSpeedingViolation || isHelmetViolation || isBatteryLowWarning) {
    statusBadgeAz = 'Xəbərdarlıq: Qaydaların Qismən Pozulması';
    statusBadgeEn = 'Warning: Partial Regulatory Non-Compliance';
    badgeVariant = 'warning';
  }

  return {
    governedSpeedKmh,
    isThrottleCutoff,
    isSpeedingViolation,
    isHelmetViolation,
    isTandemViolation,
    isRoughSurfaceWarning,
    isBatteryLowWarning,
    penaltyPoints,
    fineAmountAzn,
    statusBadgeAz,
    statusBadgeEn,
    badgeVariant,
  };
}

export interface TariffCalculationInput {
  category: MicromobilityVehicleCategory;
  corridorId: CorridorId;
  durationMinutes: number;
  distanceKm: number;
  hasStudentDiscount: boolean;
  hasBakuCardTransitTransfer: boolean;
  includeHelmetRental: boolean;
}

export interface TariffCalculationResult {
  baseUnlockFeeAzn: number;
  rideMinuteFeeAzn: number;
  helmetRentalFeeAzn: number;
  grossTotalAzn: number;
  studentDiscountAmountAzn: number;
  bakuCardDiscountAmountAzn: number;
  totalDiscountAmountAzn: number;
  netPayableAzn: number;
  co2EmissionsSavedGrams: number;
  equivalentFuelSavedLitres: number;
}

export function calculateMicromobilityTariff(input: TariffCalculationInput): TariffCalculationResult {
  const config = MICROMOBILITY_VEHICLE_CONFIGS[input.category];
  const baseUnlockFeeAzn = config.baseUnlockFeeAzn;
  const rideMinuteFeeAzn = Math.round(input.durationMinutes * config.perMinuteRateAzn * 100) / 100;
  const helmetRentalFeeAzn = input.includeHelmetRental ? 0.3 : 0.0;

  const grossTotalAzn = Math.round((baseUnlockFeeAzn + rideMinuteFeeAzn + helmetRentalFeeAzn) * 100) / 100;

  let studentDiscountAmountAzn = 0;
  if (input.hasStudentDiscount) {
    studentDiscountAmountAzn = Math.round(grossTotalAzn * 0.2 * 100) / 100; // 20% tələbə güzəşti
  }

  let bakuCardDiscountAmountAzn = 0;
  if (input.hasBakuCardTransitTransfer) {
    bakuCardDiscountAmountAzn = Math.round(grossTotalAzn * 0.25 * 100) / 100; // 25% metro/avtobus inteqrasiya
  }

  const totalDiscountAmountAzn = Math.min(
    grossTotalAzn,
    Math.round((studentDiscountAmountAzn + bakuCardDiscountAmountAzn) * 100) / 100
  );

  const netPayableAzn = Math.max(0.1, Math.round((grossTotalAzn - totalDiscountAmountAzn) * 100) / 100);

  const co2EmissionsSavedGrams = Math.round(input.distanceKm * config.co2SavingsPerKmGrams);
  const equivalentFuelSavedLitres = Math.round((input.distanceKm * 0.075) * 100) / 100; // ~7.5L/100km auto equivalent

  return {
    baseUnlockFeeAzn,
    rideMinuteFeeAzn,
    helmetRentalFeeAzn,
    grossTotalAzn,
    studentDiscountAmountAzn,
    bakuCardDiscountAmountAzn,
    totalDiscountAmountAzn,
    netPayableAzn,
    co2EmissionsSavedGrams,
    equivalentFuelSavedLitres,
  };
}

export interface ChecklistItem {
  id: string;
  category: 'mechanical' | 'electrical' | 'safety' | 'operator';
  titleAz: string;
  titleEn: string;
  regulatoryReference: string;
  isMandatory: boolean;
}

export const MICROMOBILITY_SAFETY_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk_dual_brakes',
    category: 'mechanical',
    titleAz: 'İkiqat Müstəqil Əyləc Sistemi (Mexaniki disk + Regenerativ elektron əyləc)',
    titleEn: 'Dual Independent Brakes (Mechanical disc + Electronic regenerative)',
    regulatoryReference: 'EN 17128 Maddə 5.2 / YHQ Maddə 46',
    isMandatory: true,
  },
  {
    id: 'chk_headlight_lumen',
    category: 'electrical',
    titleAz: 'Ön Ağ İşıqlı Lampa (10 metr məsafədə minimum 20 Lux parlaqlıq)',
    titleEn: 'Front White Headlight (Minimum 20 Lux at 10m distance)',
    regulatoryReference: 'YHQ Maddə 48.3 / AZS 842',
    isMandatory: true,
  },
  {
    id: 'chk_rear_brake_light',
    category: 'electrical',
    titleAz: 'Arxa Qırmızı Qabarit və Yanıb-sönən Əyləc Siqnalı',
    titleEn: 'Rear Red Tail Light & Flashing Brake Sensor Indicator',
    regulatoryReference: 'YHQ Maddə 48.3',
    isMandatory: true,
  },
  {
    id: 'chk_acoustic_bell',
    category: 'safety',
    titleAz: 'Səs Siqnalı / Zəng (Minimum 75 dB aydın eşidilən siqnal)',
    titleEn: 'Acoustic Bell / Warning Buzzer (Minimum 75 dB)',
    regulatoryReference: 'YHQ Maddə 46.2',
    isMandatory: true,
  },
  {
    id: 'chk_un383_battery',
    category: 'electrical',
    titleAz: 'UN 38.3 Litium Batareya Yanğın və Termal Təhlükəsizlik Sertifikatı',
    titleEn: 'UN 38.3 Lithium Battery Safety & Thermal Runaway Certification',
    regulatoryReference: 'IEC 62133 / FHN Qaydaları',
    isMandatory: true,
  },
  {
    id: 'chk_helmet_presence',
    category: 'safety',
    titleAz: 'Sertifikatlaşdırılmış Qoruyucu Şlem (Dəbilqə EN 1078)',
    titleEn: 'Certified Protective Safety Helmet (EN 1078 Standard)',
    regulatoryReference: 'YHQ Maddə 338.3 / BDYP Təlimatı',
    isMandatory: true,
  },
  {
    id: 'chk_single_rider',
    category: 'safety',
    titleAz: 'Tək Nəfərlik İstifadə Şərti (İkinci sərnişin və uşaq minməsi qadağandır)',
    titleEn: 'Single Rider Mandate (Tandem riding strictly prohibited)',
    regulatoryReference: 'YHQ Maddə 46.4 / İXM Maddə 338',
    isMandatory: true,
  },
  {
    id: 'chk_p_spot_parking',
    category: 'operator',
    titleAz: 'Rəsmi P-Spot Parklanma Qaydalarına Əməl Olunması və Fotosübut',
    titleEn: 'Official P-Spot Bay Parking Adherence with Photo Verification',
    regulatoryReference: 'AYNA Şəhər Parklanma Qaydaları',
    isMandatory: true,
  },
  {
    id: 'chk_age_verification',
    category: 'operator',
    titleAz: 'Yaş Məhdudiyyətinə Uyğunluq (Minimum 14 yaş fərdi, 16 yaş icarə donanması)',
    titleEn: 'Age Requirement Compliance (Min 14 years personal, 16 years rental)',
    regulatoryReference: 'YHQ Maddə 46.1',
    isMandatory: true,
  },
  {
    id: 'chk_geofence_governor',
    category: 'mechanical',
    titleAz: 'AYNA Mərkəzi Serverinə Qoşulan Avtomatik Geofencing Sürət Məhdudlaşdırıcısı',
    titleEn: 'Automatic Geofencing Speed Governor Connected to AYNA Central Server',
    regulatoryReference: 'RİNN Rəqəmsal Nəqliyyat Əsasnaməsi',
    isMandatory: true,
  },
];

export function evaluateMicromobilityChecklist(checkedIds: string[]): {
  scorePercent: number;
  isEligible: boolean;
  mandatoryFailedCount: number;
  totalChecked: number;
  totalItems: number;
} {
  const totalItems = MICROMOBILITY_SAFETY_CHECKLIST.length;
  const totalChecked = checkedIds.length;
  const scorePercent = Math.round((totalChecked / totalItems) * 100);

  let mandatoryFailedCount = 0;
  for (const item of MICROMOBILITY_SAFETY_CHECKLIST) {
    if (item.isMandatory && !checkedIds.includes(item.id)) {
      mandatoryFailedCount++;
    }
  }

  const isEligible = mandatoryFailedCount === 0 && scorePercent >= 80;

  return {
    scorePercent,
    isEligible,
    mandatoryFailedCount,
    totalChecked,
    totalItems,
  };
}

export interface ExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationAz: string;
  regulatorySource: string;
}

export const MICROMOBILITY_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    questionAz: 'Azərbaycan qanunvericiliyinə görə elektrosamokatların ayrılmış velosiped zolaqlarında maksimum sürəti nə qədərdir?',
    questionEn: 'According to Azerbaijani law, what is the maximum speed of e-scooters on dedicated bike lanes?',
    optionsAz: ['15 km/saat', '20 km/saat', '25 km/saat', '35 km/saat'],
    optionsEn: ['15 km/h', '20 km/h', '25 km/h', '35 km/h'],
    correctIndex: 1,
    explanationAz: 'Yol Hərəkəti Haqqında Qanun və AYNA qaydalarına əsasən velozolaqlarda mikromobillik vasitələrinin sürət həddi 20 km/saat müəyyən edilmişdir.',
    regulatorySource: 'YHQ Maddə 46',
  },
  {
    id: 2,
    questionAz: 'Piyada keçidlərindən (zebra) keçərkən velosiped və samokat sürücüləri hansı qaydaya əməl etməlidir?',
    questionEn: 'What rule must bicycle and scooter riders follow when crossing at pedestrian zebra crossings?',
    optionsAz: [
      'Sürəti 10 km/saata endirərək keçiddən sürmək',
      'Vasitədən düşməli və piyada kimi piyadalarla bərabər aparmalıdırlar',
      'Yalnız səs siqnalı verərək fasiləsiz keçmək',
      'Avtomobillər yol verərsə sürməyə icazə verilir',
    ],
    optionsEn: [
      'Ride across at a reduced speed of 10 km/h',
      'Dismount and walk alongside the vehicle as a pedestrian',
      'Sound the horn and cross without stopping',
      'Permitted to ride if cars yield',
    ],
    correctIndex: 1,
    explanationAz: 'YHQ Maddə 48-ə görə nizamlanmayan və nizamlanan piyada keçidlərində sürmək qəti qadağandır; sürücü mütləq vasitədən düşərək piyada kimi hərəkət etməlidir.',
    regulatorySource: 'YHQ Maddə 48',
  },
  {
    id: 3,
    questionAz: 'Elektrosamokatda iki nəfərin (o cümlədən uşağın) eyni vaxtda hərəkət etməsinə icazə verilirmi?',
    questionEn: 'Is riding with two persons (including a child) permitted on an electric scooter?',
    optionsAz: [
      'Bəli, əgər çəkiləri 120 kq-dan çox deyilsə',
      'Xeyr, konstruksiyada xüsusi oturacaq nəzərdə tutulmayıbsa qəti qadağandır',
      'Yalnız valideyn nəzarəti olduqda icazə verilir',
      'Yalnız gecə saatlarında icazə verilir',
    ],
    optionsEn: [
      'Yes, if combined weight is under 120 kg',
      'No, strictly prohibited unless specifically engineered with an approved seat',
      'Only permitted under parental supervision',
      'Only permitted during night hours',
    ],
    correctIndex: 1,
    explanationAz: 'Fərdi mobillik vasitələrində sərnişin daşınması qadağandır və İnzibati Xətalar Məcəlləsinin 338-ci maddəsi ilə cərimə tətbiq edilir.',
    regulatorySource: 'İXM Maddə 338 / YHQ Maddə 46',
  },
  {
    id: 4,
    questionAz: 'Gecə vaxtı və dumanlı havada velosiped və samokatlarda hansı işıq cihazları məcburidir?',
    questionEn: 'Which lighting equipment is mandatory for bicycles and scooters during nighttime and fog?',
    optionsAz: [
      'Yalnız cib fənəri',
      'Öndə ağ fənər, arxada qırmızı fənər və yanlarda işıqqaytarıcılar',
      'Yalnız arxa qırmızı reflektor',
      'İşıq tələb olunmur, yalnız əks etdirici jilet kifayətdir',
    ],
    optionsEn: [
      'Pocket flashlight only',
      'Front white headlight, rear red tail lamp, and side retro-reflectors',
      'Rear red reflector only',
      'No lights required if high-visibility vest is worn',
    ],
    correctIndex: 1,
    explanationAz: 'YHQ Maddə 48.3-ə uyğun olaraq qaranlıq vaxtı öndə ağ, arxada qırmızı fənər və təkərlərdə sarı/narıncı reflektorlar məcburidir.',
    regulatorySource: 'YHQ Maddə 48.3',
  },
  {
    id: 5,
    questionAz: 'Avtomagistrallarda (məsələn, Heydər Əliyev prospekti sürətli zolağı, Zığ şosesi) samokat sürmək olarmı?',
    questionEn: 'Is riding an e-scooter permitted on expressways (e.g. Heydar Aliyev Ave high-speed lanes)?',
    optionsAz: [
      'Yalnız sağ kənar zolaqda icazə verilir',
      'Qəti qadağandır (Qırmızı Geofencing Zonası)',
      'Gündüz saatlarında icazə verilir',
      'Kaska taxılıbsa icazə verilir',
    ],
    optionsEn: [
      'Permitted on right-hand lane only',
      'Strictly prohibited (Red Geofencing Zone)',
      'Permitted during daytime hours',
      'Permitted if wearing a helmet',
    ],
    correctIndex: 1,
    explanationAz: 'Avtomagistral və yüksək sürətli yollarda velosiped və samokatların hərəkəti qəti qadağandır; sistem avtomatik mühərriki kəsir.',
    regulatorySource: 'YHQ Maddə 46 və 51',
  },
  {
    id: 6,
    questionAz: 'İctimai icarə samokatlarını səkidə piyadaların yolunu kəsəcək şəkildə saxlamağın cəriməsi nə qədərdir?',
    questionEn: 'What is the penalty for leaving shared rental scooters blocking pedestrian sidewalks?',
    optionsAz: ['10 AZN', '20 AZN', '50 AZN', '100 AZN'],
    optionsEn: ['10 AZN', '20 AZN', '50 AZN', '100 AZN'],
    correctIndex: 2,
    explanationAz: 'AYNA və BDYP tərəfindən təsdiq edilmiş qaydalara görə təyin edilməmiş ərazilərdə nizamsız parklanma 50 AZN cərimə ilə nəticələnir.',
    regulatorySource: 'İXM Maddə 346.1',
  },
  {
    id: 7,
    questionAz: 'Elektrosamokat idarə etmək üçün qanunla müəyyən edilmiş minimum yaş həddi neçədir?',
    questionEn: 'What is the statutory minimum age required to operate an electric scooter in Azerbaijan?',
    optionsAz: ['10 yaş', '12 yaş', '14 yaş', '18 yaş'],
    optionsEn: ['10 years', '12 years', '14 years', '18 years'],
    correctIndex: 2,
    explanationAz: 'Yol Hərəkəti Haqqında Qanuna əsasən fərdi mikromobillik vasitələrini küçələrdə idarə etmək üçün minimum yaş 14-dür (şərikli icarə şirkətlərində isə 16).',
    regulatorySource: 'YHQ Maddə 46',
  },
  {
    id: 8,
    questionAz: 'Velosiped və ya samokat sürücüsü sağa və ya sola dönərkən manevri necə bildirməlidir?',
    questionEn: 'How must a bicycle or scooter rider signal their intention when turning right or left?',
    optionsAz: [
      'Yalnız səs siqnalı verərək',
      'Müvafiq tərəfə qolunu yana uzatmaqla əl siqnalı verməlidir',
      'Siqnal vermək məcburi deyil',
      'Ayağını yerə toxundurmaqla',
    ],
    optionsEn: [
      'By sounding the bell only',
      'By extending the corresponding arm horizontally as a hand signal',
      'Signaling is not mandatory',
      'By touching a foot to the ground',
    ],
    correctIndex: 1,
    explanationAz: 'YHQ Maddə 42-yə əsasən xarici işıq göstəriciləri olmayan ikitəkərli nəqliyyat sürücüləri manevrdən əvvəl qolunu yana uzatmaqla əl işarəsi verməlidirlər.',
    regulatorySource: 'YHQ Maddə 42.1',
  },
  {
    id: 9,
    questionAz: 'Piyada zonasında (Sarı Geofence Zonasında) elektrosamokatın avtomatik sürət həddi neçə km/saat təyin edilir?',
    questionEn: 'What speed limit is automatically governed in pedestrian zones (Yellow Geofence)?',
    optionsAz: ['5-8 km/saat', '10-12 km/saat', '20 km/saat', '25 km/saat'],
    optionsEn: ['5-8 km/h', '10-12 km/h', '20 km/h', '25 km/h'],
    correctIndex: 1,
    explanationAz: 'AYNA telemetriya təlimatına uyğun olaraq Fəvvarələr Meydanı və Dənizkənarı parkın sıx piyada hissələrində sürət avtomatik 10-12 km/saatadək məhdudlaşdırılır.',
    regulatorySource: 'AYNA Rəqəmsal Geofencing Qaydaları',
  },
  {
    id: 10,
    questionAz: 'Velosiped və samokat sürücülərinin qoruyucu dəbilqədən (kaska) istifadəsi barədə tələb hansıdır?',
    questionEn: 'What is the requirement regarding protective helmets for cyclists and scooter riders?',
    optionsAz: [
      'Kaska yalnız 10 yaşdan kiçiklər üçündür',
      'Avtomobil yolu ilə hərəkət edərkən sertifikatlaşdırılmış dəbilqə taxmaq məcburidir',
      'Kaska istifadəsi yalnız tövsiyə xarakterlidir',
      'Yalnız yağışlı havada taxılmalıdır',
    ],
    optionsEn: [
      'Helmets are only for children under 10',
      'Certified safety helmets are mandatory when riding on roadway lanes',
      'Helmet use is strictly advisory',
      'Only required in rainy weather',
    ],
    correctIndex: 1,
    explanationAz: 'BDYP və AYNA təlimatına əsasən ümumi istifadədə olan yollarda hərəkət edən bütün fərdi mobillik istifadəçiləri üçün dəbilqə məcburidir.',
    regulatorySource: 'YHQ Maddə 338.3',
  },
];

export function evaluateMicromobilityExam(userAnswers: Record<number, number>): {
  scorePercent: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  incorrectQuestionIds: number[];
} {
  const totalQuestions = MICROMOBILITY_EXAM_QUESTIONS.length;
  let correctCount = 0;
  const incorrectQuestionIds: number[] = [];

  for (const q of MICROMOBILITY_EXAM_QUESTIONS) {
    if (userAnswers[q.id] === q.correctIndex) {
      correctCount++;
    } else {
      incorrectQuestionIds.push(q.id);
    }
  }

  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= 80;

  return {
    scorePercent,
    passed,
    correctCount,
    totalQuestions,
    incorrectQuestionIds,
  };
}

export interface MicromobilityCertificate {
  certificateNumber: string;
  qrPayload: string;
  riderFullName: string;
  riderFin: string;
  vehicleCategory: MicromobilityVehicleCategory;
  vehicleSerialNumber: string;
  operatorBrand: string;
  authorizedCorridors: CorridorId[];
  allowedMaxSpeedKmh: number;
  helmetCertified: boolean;
  examScore: number;
  checklistScore: number;
  simaDigitalUid: string;
  issueDate: string;
  expiryDate: string;
  sha256Digest: string;
}

export function generateMicromobilityCertificate(params: {
  riderFullName: string;
  riderFin: string;
  vehicleCategory: MicromobilityVehicleCategory;
  vehicleSerialNumber: string;
  operatorBrand?: string;
  authorizedCorridors?: CorridorId[];
  helmetCertified?: boolean;
  examScore?: number;
  checklistScore?: number;
}): MicromobilityCertificate {
  const serialSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `MICROMOBILITY-BAKU-AZ-2026-${serialSuffix}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const expiryDate = nextYear.toISOString().split('T')[0];

  const catConfig = MICROMOBILITY_VEHICLE_CONFIGS[params.vehicleCategory];
  const allowedMaxSpeedKmh = catConfig.maxAutonomousSpeedKmh;

  const simaDigitalUid = `SIMA-AYNA-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
  const sha256Digest = `sha256-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

  const operatorBrand = params.operatorBrand || 'AYNA Smart Transit (Fərdi / Bələdiyyə)';
  const authorizedCorridors = params.authorizedCorridors || [
    'boulevard_seaside',
    'central_baku_ring',
    'winter_park_rail',
    'white_city_corridor',
    'academic_university_hub',
    'koroglu_intermodal_trail',
  ];

  const qrPayload = JSON.stringify({
    cert: certificateNumber,
    fin: params.riderFin,
    cat: params.vehicleCategory,
    vSn: params.vehicleSerialNumber,
    speed: allowedMaxSpeedKmh,
    sima: simaDigitalUid,
    exp: expiryDate,
  });

  return {
    certificateNumber,
    qrPayload,
    riderFullName: params.riderFullName,
    riderFin: params.riderFin,
    vehicleCategory: params.vehicleCategory,
    vehicleSerialNumber: params.vehicleSerialNumber,
    operatorBrand,
    authorizedCorridors,
    allowedMaxSpeedKmh,
    helmetCertified: params.helmetCertified ?? true,
    examScore: params.examScore ?? 100,
    checklistScore: params.checklistScore ?? 100,
    simaDigitalUid,
    issueDate,
    expiryDate,
    sha256Digest,
  };
}
