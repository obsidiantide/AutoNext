/**
 * Official Ministry of Digital Development and Transport (RİNN),
 * Azerbaijan Land Transport Agency (AYNA) & State Traffic Police Department (BDYP)
 * Intercity Smart Mobility Passenger Quota, Carrier Fleet Tender Scoring &
 * Official MOBIL-AZ-2026 Intercity Passenger Transport License Compliance Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Road Transport" ("Avtomobil nəqliyyatı haqqında" AR Qanunu,
 *   Maddə 11, 13, 27: Müntəzəm şəhərlərarası və beynəlxalq sərnişin daşımaları, daşıyıcıların
 *   müsabiqə (tender) əsasında seçilməsi və marşrut pasportları)
 * - Resolution of the Cabinet of Ministers of the Republic of Azerbaijan No. 141
 *   ("Avtomobil nəqliyyatı ilə sərnişin və baqaj daşınması Qaydaları")
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *   * Maddə 324: Müvafiq icazə (buraxılış vəsiqəsi) olmadan şəhərlərarası müntəzəm sərnişin daşınması (500-2000 AZN)
 *   * Maddə 326: Reysqabağı texniki və tibbi müayinədən keçirilməmə (300 AZN)
 *   * Maddə 322-1: Tənzimlənən tarif və bilet qaydalarının pozulması (100-300 AZN)
 * - European Agreement concerning the Work of Crews of Vehicles Engaged in International
 *   Road Transport (AETR) & Digital Tachograph standards (maximum 9h daily driving, 4.5h break rule)
 * - RİNN & AYNA "Biletim" unified national e-ticketing and real-time passenger quota system
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
 * Bus categories recognized by AYNA and UNECE / ECE R107
 */
export type BusCategory =
  | 'INTERCITY_COACH_CLASS_III'   // Luxury Long-Distance Coach (Neoplan, Setra, Travego, 48-55 seats, luggage >= 8 m³)
  | 'REGIONAL_BUS_CLASS_II'       // Regional Intercity Bus (Isuzu Novo, Otokar Sultan, 29-35 seats, luggage >= 4 m³)
  | 'SHUTTLE_MINIBUS_CLASS_B'     // Intercity Shuttle Minibus (Mercedes Sprinter 516/519, 18-20 seats)
  | 'ELECTRIC_COACH_ZERO_EMISSION'; // Zero-Emission Intercity Coach (BYD C9, Yutong ICe12, 48-52 seats, battery >= 350 kWh)

export interface BusCategoryMetadata {
  id: BusCategory;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  minSeats: number;
  maxSeats: number;
  minLuggageVolumeM3: number;
  tariffMultiplier: number;
  tenderBonusPoints: number;
  descriptionAz: string;
}

export const BUS_CATEGORIES: Record<BusCategory, BusCategoryMetadata> = {
  INTERCITY_COACH_CLASS_III: {
    id: 'INTERCITY_COACH_CLASS_III',
    nameAz: 'Sinif III – Magistral Şəhərlərarası Turist Avtobusu (48-55 yer)',
    nameEn: 'Class III – Long-Distance Intercity Touring Coach (48-55 seats)',
    nameRu: 'Класс III – Междугородний туристический лайнер (48-55 мест)',
    minSeats: 48,
    maxSeats: 55,
    minLuggageVolumeM3: 8.0,
    tariffMultiplier: 1.15,
    tenderBonusPoints: 10,
    descriptionAz: 'Baqaj bölməsi ən azı 8 m³, fərdi kondisioner və USB enerji çıxışları, salon tualeti olan uzaqməsafəli komfortlu avtobus',
  },
  REGIONAL_BUS_CLASS_II: {
    id: 'REGIONAL_BUS_CLASS_II',
    nameAz: 'Sinif II – Regional Şəhərlərarası Avtobus (29-35 yer)',
    nameEn: 'Class II – Regional Intercity Medium Bus (29-35 seats)',
    nameRu: 'Класс II – Региональный междугородний автобус (29-35 мест)',
    minSeats: 29,
    maxSeats: 35,
    minLuggageVolumeM3: 4.0,
    tariffMultiplier: 1.0,
    tenderBonusPoints: 5,
    descriptionAz: 'Orta tutumlu, şəhərlərarası qısa və orta məsafəli xətlər üçün nəzərdə tutulmuş sərnişin avtobusu',
  },
  SHUTTLE_MINIBUS_CLASS_B: {
    id: 'SHUTTLE_MINIBUS_CLASS_B',
    nameAz: 'Sinif B – Ekspres Şatll Minibus (18-20 yer)',
    nameEn: 'Class B – Intercity Express Shuttle Minibus (18-20 seats)',
    nameRu: 'Класс B – Экспресс-шатл микроавтобус (18-20 мест)',
    minSeats: 18,
    maxSeats: 20,
    minLuggageVolumeM3: 1.8,
    tariffMultiplier: 1.10,
    tenderBonusPoints: 3,
    descriptionAz: 'Sürətli ekspres marşrutlar və az sərnişin axını olan dağlıq istiqamətlər üçün rahat mikroavtobus',
  },
  ELECTRIC_COACH_ZERO_EMISSION: {
    id: 'ELECTRIC_COACH_ZERO_EMISSION',
    nameAz: 'Ekoloji Təmiz Sıfır Emissiyalı Elektrikli Avtobus (48-52 yer)',
    nameEn: 'Zero-Emission 100% Electric Intercity Coach (48-52 seats)',
    nameRu: '100% Электрический междугородний эко-автобус (48-52 мест)',
    minSeats: 48,
    maxSeats: 52,
    minLuggageVolumeM3: 7.0,
    tariffMultiplier: 1.12,
    tenderBonusPoints: 15,
    descriptionAz: 'LFP batareyalı (350+ kWh), sıfır yerli tullantı, yaşıl enerji subsidiya güzəşti və yüksək akustik komfort',
  },
};

/**
 * 7 Strategic Intercity Routes in Azerbaijan
 */
export type IntercityRouteCode =
  | 'AZ_ROUTE_101_GANJA'
  | 'AZ_ROUTE_205_SHUSHA'
  | 'AZ_ROUTE_302_LANKARAN'
  | 'AZ_ROUTE_404_QUBA'
  | 'AZ_ROUTE_508_SHEKI'
  | 'AZ_ROUTE_601_NAKHCHIVAN'
  | 'AZ_ROUTE_703_AGHDAM';

export interface IntercityRouteMetadata {
  code: IntercityRouteCode;
  routeNumber: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  originAz: string;
  destinationAz: string;
  distanceKm: number;
  transitHours: number;
  dailyScheduledTrips: number;
  baseFareAzn: number; // Regulated base passenger tariff
  dailyPassengerDemand: number;
  highwayCode: string;
  terminalHubAz: string;
  minCoachesRequired: number;
}

export const INTERCITY_ROUTES: Record<IntercityRouteCode, IntercityRouteMetadata> = {
  AZ_ROUTE_101_GANJA: {
    code: 'AZ_ROUTE_101_GANJA',
    routeNumber: 'M-101',
    nameAz: 'Bakı (Beynəlxalq Avtovağzal) – Gəncə Avtovağzal',
    nameEn: 'Baku International Bus Terminal – Ganja Central Terminal',
    nameRu: 'Баку (Международный автовокзал) – Гянджа',
    originAz: 'Bakı Beynəlxalq Avtovağzal Kompleksi (BBAK)',
    destinationAz: 'Gəncə Şəhərlərarası Avtovağzalı',
    distanceKm: 365,
    transitHours: 4.5,
    dailyScheduledTrips: 14,
    baseFareAzn: 18.5,
    dailyPassengerDemand: 650,
    highwayCode: 'M2 Bakı-Qazax-Gürcüstan',
    terminalHubAz: 'BBAK Platforma № 4',
    minCoachesRequired: 8,
  },
  AZ_ROUTE_205_SHUSHA: {
    code: 'AZ_ROUTE_205_SHUSHA',
    routeNumber: 'Q-205',
    nameAz: 'Bakı – Füzuli – Şuşa (Zəfər Yolu) / Xankəndi',
    nameEn: 'Baku – Fuzuli – Shusha (Victory Road) / Khankendi',
    nameRu: 'Баку – Физули – Шуша (Дорога Победы) / Ханкенди',
    originAz: 'Bakı Beynəlxalq Avtovağzal Kompleksi (BBAK)',
    destinationAz: 'Şuşa Şəhər İntellektual Avtovağzalı',
    distanceKm: 395,
    transitHours: 5.5,
    dailyScheduledTrips: 8,
    baseFareAzn: 22.0,
    dailyPassengerDemand: 380,
    highwayCode: 'M2 / M6 / Zəfər Yolu',
    terminalHubAz: 'BBAK Platforma № 1 (Qarabağ Terminalı)',
    minCoachesRequired: 6,
  },
  AZ_ROUTE_302_LANKARAN: {
    code: 'AZ_ROUTE_302_LANKARAN',
    routeNumber: 'C-302',
    nameAz: 'Bakı – Salyan – Cəlilabad – Lənkəran – Astara',
    nameEn: 'Baku – Salyan – Jalilabad – Lankaran – Astara',
    nameRu: 'Баку – Сальян – Джалилабад – Ленкорань – Астара',
    originAz: 'Bakı Beynəlxalq Avtovağzal Kompleksi (BBAK)',
    destinationAz: 'Lənkəran Şəhər Avtovağzalı',
    distanceKm: 270,
    transitHours: 3.2,
    dailyScheduledTrips: 12,
    baseFareAzn: 14.5,
    dailyPassengerDemand: 520,
    highwayCode: 'M3 Ələt-Astara-İran',
    terminalHubAz: 'BBAK Platforma № 7',
    minCoachesRequired: 7,
  },
  AZ_ROUTE_404_QUBA: {
    code: 'AZ_ROUTE_404_QUBA',
    routeNumber: 'Ş-404',
    nameAz: 'Bakı – Sumqayıt – Şabran – Quba – Qusar (Şahdağ)',
    nameEn: 'Baku – Sumgayit – Shabran – Quba – Qusar (Shahdag)',
    nameRu: 'Баку – Сумгайыт – Шабран – Губа – Гусар (Шахдаг)',
    originAz: 'Bakı Beynəlxalq Avtovağzal Kompleksi (BBAK)',
    destinationAz: 'Quba Rayonlararası Terminalı / Qusar',
    distanceKm: 180,
    transitHours: 2.2,
    dailyScheduledTrips: 16,
    baseFareAzn: 10.0,
    dailyPassengerDemand: 720,
    highwayCode: 'M1 Bakı-Quba-Rusiya',
    terminalHubAz: 'BBAK Platforma № 2',
    minCoachesRequired: 8,
  },
  AZ_ROUTE_508_SHEKI: {
    code: 'AZ_ROUTE_508_SHEKI',
    routeNumber: 'Q-508',
    nameAz: 'Bakı – Şamaxı – İsmayıllı – Qəbələ – Şəki – Zaqatala',
    nameEn: 'Baku – Shamakhi – Ismayilli – Gabala – Sheki – Zagatala',
    nameRu: 'Баку – Шемаха – Исмаиллы – Габала – Шеки – Загатала',
    originAz: 'Bakı Beynəlxalq Avtovağzal Kompleksi (BBAK)',
    destinationAz: 'Şəki Şəhər Avtovağzalı',
    distanceKm: 310,
    transitHours: 4.2,
    dailyScheduledTrips: 10,
    baseFareAzn: 16.0,
    dailyPassengerDemand: 460,
    highwayCode: 'M4 Bakı-Şamaxı-Yevlax',
    terminalHubAz: 'BBAK Platforma № 5',
    minCoachesRequired: 6,
  },
  AZ_ROUTE_601_NAKHCHIVAN: {
    code: 'AZ_ROUTE_601_NAKHCHIVAN',
    routeNumber: 'N-601',
    nameAz: 'Bakı – İmişli – Biləsuvar – İran / Zəngəzur – Naxçıvan',
    nameEn: 'Baku – Imishli – Bilasuvar – Transit – Nakhchivan',
    nameRu: 'Баку – Имишли – Билясувар – Транзит – Нахчыван',
    originAz: 'Bakı Beynəlxalq Avtovağzal Kompleksi (BBAK)',
    destinationAz: 'Naxçıvan Mərkəzi Şəhərlərarası Terminalı',
    distanceKm: 530,
    transitHours: 7.0,
    dailyScheduledTrips: 6,
    baseFareAzn: 28.0,
    dailyPassengerDemand: 300,
    highwayCode: 'M3 / M4 / Tranzit Dəhliz',
    terminalHubAz: 'BBAK Platforma № 9 (Beynəlxalq / Tranzit)',
    minCoachesRequired: 5,
  },
  AZ_ROUTE_703_AGHDAM: {
    code: 'AZ_ROUTE_703_AGHDAM',
    routeNumber: 'Q-703',
    nameAz: 'Bakı – Bərdə – Ağdam – Xocalı – Əsgəran',
    nameEn: 'Baku – Barda – Aghdam – Khojaly – Asgaran',
    nameRu: 'Баку – Барда – Агдам – Ходжалы – Аскеран',
    originAz: 'Bakı Beynəlxalq Avtovağzal Kompleksi (BBAK)',
    destinationAz: 'Ağdam Şəhər Yeni Nəqliyyat Qovşağı',
    distanceKm: 340,
    transitHours: 4.0,
    dailyScheduledTrips: 8,
    baseFareAzn: 17.5,
    dailyPassengerDemand: 360,
    highwayCode: 'M2 / R4 Bərdə-Ağdam',
    terminalHubAz: 'BBAK Platforma № 3',
    minCoachesRequired: 5,
  },
};

/**
 * Emission standards for buses
 */
export type EuroStandard = 'EURO_3_BELOW' | 'EURO_4' | 'EURO_5' | 'EURO_6' | 'ELECTRIC_ZERO';

export interface TenderInputs {
  fleetAverageAgeYears: number; // 0 to 20
  euroStandard: EuroStandard;
  hasWheelchairAccessibility: boolean; // hydraulic ramp/lift + designated wheelchair bay
  hasAynaGpsAndTachograph: boolean; // continuous GPS telemetry + digital tachograph with smart driver card
  hasAynaBiletimIntegration: boolean; // central "Biletim" cloud validator & contactless QR check-in
  hasClimateAndCctv: boolean; // automatic dual-zone AC + 360° 4-camera internal/external DVR + USB ports
  busCategory: BusCategory;
  routeCode: IntercityRouteCode;
  fleetVehicleCount: number; // e.g., 4 to 20
  seatCapacityPerBus: number; // e.g., 18 to 55
}

export interface TenderScoreResult {
  ageScore: number; // max 20
  emissionScore: number; // max 20
  accessibilityScore: number; // max 15
  telemetryScore: number; // max 15
  biletimScore: number; // max 15
  comfortScore: number; // max 15
  totalScore: number; // max 100
  grade: 'A' | 'B' | 'C';
  status: 'QUALIFIED' | 'CONDITIONAL' | 'DISQUALIFIED';
  licenseEligibilityAz: string;
  feedbackAz: string[];
}

/**
 * Calculates AYNA Tender Evaluation Score (0 - 100 points)
 */
export function calculateTenderScore(inputs: TenderInputs): TenderScoreResult {
  let ageScore = 0;
  if (inputs.fleetAverageAgeYears <= 2) {
    ageScore = 20;
  } else if (inputs.fleetAverageAgeYears <= 5) {
    ageScore = 16;
  } else if (inputs.fleetAverageAgeYears <= 8) {
    ageScore = 12;
  } else if (inputs.fleetAverageAgeYears <= 10) {
    ageScore = 6;
  } else {
    ageScore = 0;
  }

  let emissionScore = 0;
  switch (inputs.euroStandard) {
    case 'ELECTRIC_ZERO':
      emissionScore = 20;
      break;
    case 'EURO_6':
      emissionScore = 18;
      break;
    case 'EURO_5':
      emissionScore = 14;
      break;
    case 'EURO_4':
      emissionScore = 6;
      break;
    case 'EURO_3_BELOW':
    default:
      emissionScore = 0;
      break;
  }

  const accessibilityScore = inputs.hasWheelchairAccessibility ? 15 : 0;
  const telemetryScore = inputs.hasAynaGpsAndTachograph ? 15 : 0;
  const biletimScore = inputs.hasAynaBiletimIntegration ? 15 : 0;
  const comfortScore = inputs.hasClimateAndCctv ? 15 : 0;

  const totalScore = Math.min(
    100,
    ageScore + emissionScore + accessibilityScore + telemetryScore + biletimScore + comfortScore
  );

  let grade: 'A' | 'B' | 'C' = 'C';
  let status: 'QUALIFIED' | 'CONDITIONAL' | 'DISQUALIFIED' = 'DISQUALIFIED';
  let licenseEligibilityAz = 'Buraxılış vəsiqəsi verilməsindən imtina edilir (Kafi bal toplanmadı)';

  if (totalScore >= 85) {
    grade = 'A';
    status = 'QUALIFIED';
    licenseEligibilityAz = 'I Dərəcəli Müntəzəm Şəhərlərarası Marşrut Lisenziyası Təsdiqləndi (Qızıl Standart)';
  } else if (totalScore >= 70) {
    grade = 'B';
    status = 'QUALIFIED';
    licenseEligibilityAz = 'Standart Şəhərlərarası Marşrut Buraxılış Vəsiqəsi Təsdiqləndi (Şərti monitorinq)';
  } else if (totalScore >= 55) {
    grade = 'C';
    status = 'CONDITIONAL';
    licenseEligibilityAz = 'Şərti Buraxılış: 30 gün ərzində nöqsanların aradan qaldırılması tələb olunur';
  }

  const feedbackAz: string[] = [];
  if (inputs.fleetAverageAgeYears > 8) {
    feedbackAz.push('Parkın orta yaşı 8 ildən yuxarıdır. Yeni avtobusların cəlb edilməsi tələb olunur.');
  }
  if (inputs.euroStandard === 'EURO_3_BELOW' || inputs.euroStandard === 'EURO_4') {
    feedbackAz.push('Emissiya standartı ən azı Euro-5 və ya Euro-6 olmalıdır.');
  }
  if (!inputs.hasWheelchairAccessibility) {
    feedbackAz.push('Əlilliyi olan şəxslər üçün pandus və xüsusi təhlükəsizlik sahəsi təchiz edilməlidir.');
  }
  if (!inputs.hasAynaGpsAndTachograph) {
    feedbackAz.push('AYNA mərkəzi serverinə qoşulan onlayn GPS izləmə və rəqəmsal taxoqraf zəruridir.');
  }
  if (!inputs.hasAynaBiletimIntegration) {
    feedbackAz.push('"Biletim" vahid elektron bilet satışı portalına inteqrasiya tamamlanmalıdır.');
  }
  if (!inputs.hasClimateAndCctv) {
    feedbackAz.push('Sərnişin salonu üçün ikizonalı klimat-kontrol və 360° videomüşahidə kamerası tələb olunur.');
  }

  return {
    ageScore,
    emissionScore,
    accessibilityScore,
    telemetryScore,
    biletimScore,
    comfortScore,
    totalScore,
    grade,
    status,
    licenseEligibilityAz,
    feedbackAz,
  };
}

/**
 * Route Quota, Daily Dispatch & Economics
 */
export interface RouteQuotaAndEconomics {
  routeCode: IntercityRouteCode;
  routeNameAz: string;
  distanceKm: number;
  transitHours: number;
  dailyScheduledTrips: number;
  baseRatePerKm: number;
  calculatedTicketPriceAzn: number;
  calculatedTicketPriceConverted: number;
  dailyPassengerQuota: number;
  dailyCapacitySeats: number;
  averageLoadFactorPercent: number;
  dailyEstimatedRevenueAzn: number;
  dailyEstimatedRevenueConverted: number;
  estimatedDailyFuelCostAzn: number;
  estimatedDailyDriverWagesAzn: number;
  estimatedTerminalFeesAzn: number;
  estimatedDailyNetProfitAzn: number;
  estimatedDailyNetProfitConverted: number;
  currency: Currency;
}

export function calculateRouteEconomics(inputs: TenderInputs, currency: Currency): RouteQuotaAndEconomics {
  const route = INTERCITY_ROUTES[inputs.routeCode];
  const busCat = BUS_CATEGORIES[inputs.busCategory];

  // Regulated passenger fare formula: Base fare * Category multiplier
  const calculatedTicketPriceAzn = Math.round(route.baseFareAzn * busCat.tariffMultiplier * 10) / 10;
  const calculatedTicketPriceConverted = convertAzn(calculatedTicketPriceAzn, currency);

  // Total daily passenger capacity based on trips and fleet
  const tripsPerBusPerDay = Math.max(1, Math.floor(route.dailyScheduledTrips / Math.max(1, inputs.fleetVehicleCount)));
  const totalTrips = inputs.fleetVehicleCount * tripsPerBusPerDay;
  const dailyCapacitySeats = totalTrips * inputs.seatCapacityPerBus;

  // Realistic occupancy load factor: ~82%
  const averageLoadFactorPercent = 82;
  const dailyPassengerQuota = Math.round((dailyCapacitySeats * averageLoadFactorPercent) / 100);

  // Daily revenue
  const dailyEstimatedRevenueAzn = dailyPassengerQuota * calculatedTicketPriceAzn;
  const dailyEstimatedRevenueConverted = convertAzn(dailyEstimatedRevenueAzn, currency);

  // Fuel / Energy expense:
  // Diesel ~28L / 100km at 0.90 AZN/L = 0.25 AZN/km. Electric ~1.2 kWh / km at 0.12 AZN/kWh = 0.14 AZN/km.
  const costPerKm = inputs.euroStandard === 'ELECTRIC_ZERO' ? 0.14 : 0.26;
  const totalKmDrivenPerDay = totalTrips * route.distanceKm;
  const estimatedDailyFuelCostAzn = Math.round(totalKmDrivenPerDay * costPerKm);

  // Driver wages & dispatch (e.g., 2 drivers per bus, 60 AZN daily wage per driver)
  const estimatedDailyDriverWagesAzn = inputs.fleetVehicleCount * 2 * 60;

  // Terminal & AYNA Biletim transaction commission (~5% of revenue)
  const estimatedTerminalFeesAzn = Math.round(dailyEstimatedRevenueAzn * 0.05);

  const estimatedDailyNetProfitAzn = Math.max(
    0,
    dailyEstimatedRevenueAzn -
      (estimatedDailyFuelCostAzn + estimatedDailyDriverWagesAzn + estimatedTerminalFeesAzn)
  );
  const estimatedDailyNetProfitConverted = convertAzn(estimatedDailyNetProfitAzn, currency);

  return {
    routeCode: route.code,
    routeNameAz: route.nameAz,
    distanceKm: route.distanceKm,
    transitHours: route.transitHours,
    dailyScheduledTrips: totalTrips,
    baseRatePerKm: 0.05,
    calculatedTicketPriceAzn,
    calculatedTicketPriceConverted,
    dailyPassengerQuota,
    dailyCapacitySeats,
    averageLoadFactorPercent,
    dailyEstimatedRevenueAzn,
    dailyEstimatedRevenueConverted,
    estimatedDailyFuelCostAzn,
    estimatedDailyDriverWagesAzn,
    estimatedTerminalFeesAzn,
    estimatedDailyNetProfitAzn,
    estimatedDailyNetProfitConverted,
    currency,
  };
}

/**
 * Real-time Onboard Telemetry Stand & Safety Compliance
 */
export interface LiveTelemetryInputs {
  currentSpeedKmH: number; // vs 90 km/h statutory highway bus speed governor
  driverShiftHours: number; // vs 9.0h daily limit & 4.5h continuous limit
  cabinTemperatureCelsius: number; // statutory comfortable 20°C - 24°C
  passengerOccupancyPercent: number; // 0 - 100%
  biletimValidatorOnline: boolean; // electronic ticket QR validator connection
  alcoholInterlockOk: boolean; // 0.00 mg/L breathalyzer status
  routeDeviationKm: number; // allowed corridor buffer <= 2.0 km
}

export interface LiveTelemetryEvaluation {
  speedViolation: boolean;
  excessSpeedKmH: number;
  driverFatigueRisk: 'NORMAL' | 'BREAK_DUE' | 'CRITICAL_OVERTIME';
  cabinComfortOk: boolean;
  biletimStatusOk: boolean;
  alcoholStatusOk: boolean;
  routeDeviationViolation: boolean;
  isCompliant: boolean;
  potentialFineAzn: number;
  potentialFineConverted: number;
  violationsAz: string[];
}

export function evaluateLiveTelemetry(inputs: LiveTelemetryInputs, currency: Currency): LiveTelemetryEvaluation {
  const violationsAz: string[] = [];
  let potentialFineAzn = 0;

  // Speed governor check: statutory limit 90 km/h for Class II/III buses on M-highways
  const speedViolation = inputs.currentSpeedKmH > 90;
  const excessSpeedKmH = Math.max(0, inputs.currentSpeedKmH - 90);
  if (excessSpeedKmH >= 30) {
    violationsAz.push(`Sürət həddi 30+ km/s aşılıb (${inputs.currentSpeedKmH} km/s) – İXM Maddə 328: 150 AZN cərimə`);
    potentialFineAzn += 150;
  } else if (excessSpeedKmH >= 10) {
    violationsAz.push(`Sürət həddi aşılıb (${inputs.currentSpeedKmH} km/s) – İXM Maddə 328: 50 AZN cərimə`);
    potentialFineAzn += 50;
  }

  // Driver shift hours (AETR Convention: max 4.5h without 45 min break, max 9.0h daily)
  let driverFatigueRisk: 'NORMAL' | 'BREAK_DUE' | 'CRITICAL_OVERTIME' = 'NORMAL';
  if (inputs.driverShiftHours > 9.0) {
    driverFatigueRisk = 'CRITICAL_OVERTIME';
    violationsAz.push(`Sürücünün fasiləsiz iş vaxtı norması (9.0 saat) aşılıb (${inputs.driverShiftHours} saat) – İXM Maddə 326: 300 AZN`);
    potentialFineAzn += 300;
  } else if (inputs.driverShiftHours >= 4.5) {
    driverFatigueRisk = 'BREAK_DUE';
    violationsAz.push(`4.5 saat fasiləsiz idarəetmə başa çatıb. Məcburi 45 dəqiqəlik istirahət rejimi tələb olunur.`);
  }

  // Cabin temperature
  const cabinComfortOk = inputs.cabinTemperatureCelsius >= 18 && inputs.cabinTemperatureCelsius <= 25;
  if (!cabinComfortOk) {
    violationsAz.push(`Salon temperaturu sanitar normadan kənardır (${inputs.cabinTemperatureCelsius}°C, norma: 20-24°C)`);
  }

  // Biletim QR validator status
  const biletimStatusOk = inputs.biletimValidatorOnline;
  if (!biletimStatusOk) {
    violationsAz.push(`AYNA "Biletim" QR validator mərkəzi serverlə əlaqəni itirib – İXM Maddə 322-1: 100 AZN`);
    potentialFineAzn += 100;
  }

  // Alcohol interlock
  const alcoholStatusOk = inputs.alcoholInterlockOk;
  if (!alcoholStatusOk) {
    violationsAz.push(`Reysqabağı alkotester testi uğursuzdur (Alkoqol aşkarlanıb) – İXM Maddə 333: 400 AZN və sürücülükdən kənarlaşdırma`);
    potentialFineAzn += 400;
  }

  // Route deviation
  const routeDeviationViolation = inputs.routeDeviationKm > 2.0;
  if (routeDeviationViolation) {
    violationsAz.push(`Avtobus təsdiqlənmiş şəhərlərarası marşrut koridorundan ${inputs.routeDeviationKm} km kənara çıxıb – İXM Maddə 324: 500 AZN`);
    potentialFineAzn += 500;
  }

  const isCompliant = violationsAz.length === 0;
  const potentialFineConverted = convertAzn(potentialFineAzn, currency);

  return {
    speedViolation,
    excessSpeedKmH,
    driverFatigueRisk,
    cabinComfortOk,
    biletimStatusOk,
    alcoholStatusOk,
    routeDeviationViolation,
    isCompliant,
    potentialFineAzn,
    potentialFineConverted,
    violationsAz,
  };
}

/**
 * 10-Point Technical & Safety Carrier Checklist
 */
export interface MobilityChecklistItem {
  id: string;
  categoryAz: string;
  titleAz: string;
  descriptionAz: string;
  isMandatory: boolean;
  legalCitation: string;
  points: number;
}

export interface MobilityChecklistResult {
  totalItems: number;
  checkedCount: number;
  mandatoryTotal: number;
  mandatoryChecked: number;
  scorePercent: number;
  isApproved: boolean;
  missingMandatoryItems: string[];
}

export function calculateMobilityChecklistScore(
  items: MobilityChecklistItem[],
  checkedIds: string[]
): MobilityChecklistResult {
  const totalItems = items.length;
  const checkedCount = checkedIds.length;

  const mandatoryItems = items.filter((i) => i.isMandatory);
  const mandatoryTotal = mandatoryItems.length;
  const mandatoryChecked = mandatoryItems.filter((i) => checkedIds.includes(i.id)).length;

  const totalPoints = items.reduce((acc, curr) => acc + curr.points, 0);
  const earnedPoints = items
    .filter((i) => checkedIds.includes(i.id))
    .reduce((acc, curr) => acc + curr.points, 0);

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const isApproved = mandatoryChecked === mandatoryTotal && scorePercent >= 80;

  const missingMandatoryItems = mandatoryItems
    .filter((i) => !checkedIds.includes(i.id))
    .map((i) => i.titleAz);

  return {
    totalItems,
    checkedCount,
    mandatoryTotal,
    mandatoryChecked,
    scorePercent,
    isApproved,
    missingMandatoryItems,
  };
}

/**
 * 10-Question Theoretical Examination Simulator
 */
export interface MobilityExamQuestion {
  id: number;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  legalCitationAz: string;
  explanationAz: string;
}

export interface MobilityExamResult {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  passed: boolean;
  questionResults: {
    questionId: number;
    userAnswerIndex: number | undefined;
    isCorrect: boolean;
    correctAnswerIndex: number;
  }[];
}

export function evaluateMobilityExam(
  questions: MobilityExamQuestion[],
  answers: Record<number, number>
): MobilityExamResult {
  const totalQuestions = questions.length;
  let correctCount = 0;
  let answeredCount = 0;

  const questionResults = questions.map((q) => {
    const userAnswerIndex = answers[q.id];
    if (userAnswerIndex !== undefined) answeredCount++;

    const isCorrect = userAnswerIndex === q.correctOptionIndex;
    if (isCorrect) correctCount++;

    return {
      questionId: q.id,
      userAnswerIndex,
      isCorrect,
      correctAnswerIndex: q.correctOptionIndex,
    };
  });

  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = scorePercent >= 80; // 8/10 pass requirement

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    scorePercent,
    passed,
    questionResults,
  };
}

/**
 * Official MOBIL-AZ-2026 Intercity Passenger Transport License Certificate
 */
export interface IntercityMobilityCertificate {
  certificateId: string; // e.g. "MOBIL-AZ-2026-84910"
  carrierEnterpriseAz: string;
  carrierVoen: string;
  assignedRouteCode: IntercityRouteCode;
  assignedRouteNameAz: string;
  vehiclePlate: string;
  busModelAz: string;
  busCategory: BusCategory;
  seatCapacity: number;
  tenderScore: number;
  grade: 'A' | 'B' | 'C';
  status: 'ACTIVE_VALID' | 'PROVISIONAL' | 'SUSPENDED';
  issueDate: string;
  expiryDate: string;
  simaSignatureUid: string;
  securityHashSha256: string;
  biletimTerminalId: string;
  qrCodeData: string;
}

export function generateIntercityMobilityCertificate(
  carrierName: string,
  plate: string,
  busModel: string,
  category: BusCategory,
  routeCode: IntercityRouteCode,
  tenderScore: number,
  grade: 'A' | 'B' | 'C'
): IntercityMobilityCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
  const certificateId = `MOBIL-AZ-2026-${randomSuffix}`;
  const route = INTERCITY_ROUTES[routeCode];
  const busCat = BUS_CATEGORIES[category];

  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expiryDate = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate())
    .toISOString()
    .split('T')[0];

  const simaSignatureUid = `SIMA-RINN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const securityHashSha256 = `SHA256:0x${Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}...${randomSuffix}`;
  const biletimTerminalId = `AYNA-TERM-${route.routeNumber}-${randomSuffix.substring(0, 3)}`;

  return {
    certificateId,
    carrierEnterpriseAz: carrierName || 'BakuBus MMC',
    carrierVoen: `VOEN-${Math.floor(100000000 + Math.random() * 900000000)}`,
    assignedRouteCode: routeCode,
    assignedRouteNameAz: route.nameAz,
    vehiclePlate: plate || '99-JH-101',
    busModelAz: busModel || busCat.nameAz,
    busCategory: category,
    seatCapacity: busCat.minSeats,
    tenderScore,
    grade,
    status: tenderScore >= 70 ? 'ACTIVE_VALID' : 'PROVISIONAL',
    issueDate,
    expiryDate,
    simaSignatureUid,
    securityHashSha256,
    biletimTerminalId,
    qrCodeData: `https://ayna.gov.az/verify/intercity-license/${certificateId}?sha=${securityHashSha256}`,
  };
}
