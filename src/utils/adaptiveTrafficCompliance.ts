/**
 * Official Ministry of Digital Development and Transport (RİNN),
 * Azerbaijan Land Transport Agency (AYNA) &
 * Main State Traffic Police Department (BDYP)
 * Intelligent Transport Systems (ITS) Urban Traffic Light Synchronization,
 * Adaptive SCOOT/SCATS Control ("Green Wave" / "Yaşıl Dalğa"),
 * AI Intersection Congestion Pricing &
 * Official ITS-PRIORITY-AZ-2026 Smart Mobility Priority Pass Compliance Engine
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Road Traffic" ("Yol Hərəkəti Haqqında" Qanun):
 *   * Maddə 9: Ağıllı nəqliyyat sistemləri (İTS), avtomatlaşdırılmış svetofor şəbəkəsi və telemetriya
 *   * Maddə 60: Svetoforun iş rejimləri, yaşıl dalğa koordinasiyası və tənzimləmə qaydaları
 *   * Maddə 64: Nizamlayıcı və svetofor siqnallarının üstünlüyü, operativ və xüsusi nəqliyyat vasitələrinin keçid prioriteti
 * - UNECE Convention on Road Signs and Signals (1968 Vienna Convention):
 *   * Article 23: Light signals for vehicular traffic (Red, Amber, Green interval standards)
 *   * Annex 1: Cycle time design and progression bandwidth tolerances
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *   * Maddə 327.2: Svetoforun qadağanedici siqnalında hərəkəti davam etdirmə (80 AZN cərimə + 3 cərimə balı)
 *   * Maddə 327.4: Yol ayrıcını keçmə qaydalarının pozulması və tıxac yaradan hərəkətlər (60 AZN cərimə)
 *   * Maddə 342.2.1: İcazəsiz xüsusi səs/işıq və ya İTS prioritet siqnal modullarından qanunsuz istifadə (500–1,000 AZN cərimə)
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
 * 8 Strategic Urban Corridors in Baku Metropolitan Area
 */
export type StrategicCorridorId =
  | 'CORRIDOR_NEFTCHILAR'
  | 'CORRIDOR_HEYDAR_ALIYEV'
  | 'CORRIDOR_TBILISI'
  | 'CORRIDOR_8_NOYABR'
  | 'CORRIDOR_BABEK'
  | 'CORRIDOR_ZIYA_BUNYADOV'
  | 'CORRIDOR_MOSCOW'
  | 'CORRIDOR_INSHAATCHILAR';

export type SignalControlMode =
  | 'FIXED_TIME'            // Sabit Taymer Rejimi
  | 'ACTUATED'              // Nəqliyyat Asılı (İnduktiv dövrə / Kamera sensorlu)
  | 'ADAPTIVE_SCOOT'        // SCOOT Split Cycle Offset Optimization Technique
  | 'ADAPTIVE_SCATS'        // SCATS Sydney Coordinated Adaptive Traffic System
  | 'EMERGENCY_PREEMPTION'; // Operativ Xidmət Prioriteti (Yaşıl Dalğa dərhal açılma)

export type LevelOfServiceGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface StrategicCorridorInfo {
  id: StrategicCorridorId;
  nameAz: string;
  nameEn: string;
  descriptionAz: string;
  corridorLengthMeters: number;
  intersectionCount: number;
  defaultProgressionSpeedKmh: number;
  defaultCycleTimeSec: number;
  averageDailyVehicles: number;
  activeControlMode: SignalControlMode;
  connectedAynaiTsSensors: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  keyIntersections: string[];
  historicalPeakLos: LevelOfServiceGrade;
}

export const STRATEGIC_CORRIDORS: Record<StrategicCorridorId, StrategicCorridorInfo> = {
  CORRIDOR_NEFTCHILAR: {
    id: 'CORRIDOR_NEFTCHILAR',
    nameAz: 'Neftçilər Prospekti (Azneft – Dənizkənarı Bulvar – Ağ Şəhər)',
    nameEn: 'Neftchilar Avenue Smart Corridor',
    descriptionAz: 'Bakı Dənizkənarı Milli Parkı boyu uzanan, yüksək turizm və işgüzar nəqliyyat intensivliyinə malik sahil magistralı.',
    corridorLengthMeters: 4200,
    intersectionCount: 7,
    defaultProgressionSpeedKmh: 55,
    defaultCycleTimeSec: 100,
    averageDailyVehicles: 68000,
    activeControlMode: 'ADAPTIVE_SCOOT',
    connectedAynaiTsSensors: 42,
    coordinates: { lat: 40.3682, lng: 49.8398 },
    keyIntersections: ['Azneft dairəsi', 'Kukla Teatrı kəsişməsi', 'Hökumət Evi', 'Port Baku kəsişməsi', 'Ağ Şəhər qovşağı'],
    historicalPeakLos: 'C',
  },
  CORRIDOR_HEYDAR_ALIYEV: {
    id: 'CORRIDOR_HEYDAR_ALIYEV',
    nameAz: 'Heydər Əliyev Prospekti (Böyükşor – Koroğlu – Hava Limanı)',
    nameEn: 'Heydar Aliyev Avenue Express Corridor',
    descriptionAz: 'Şəhər mərkəzini Heydər Əliyev Beynəlxalq Hava Limanı və Abşeron yarımadası ilə birləşdirən əsas strateji magistral.',
    corridorLengthMeters: 8500,
    intersectionCount: 9,
    defaultProgressionSpeedKmh: 70,
    defaultCycleTimeSec: 120,
    averageDailyVehicles: 115000,
    activeControlMode: 'ADAPTIVE_SCATS',
    connectedAynaiTsSensors: 68,
    coordinates: { lat: 40.4042, lng: 49.8885 },
    keyIntersections: ['H. Əliyev Mərkəzi yanı', 'Baqirova körpüsü', 'Koroğlu NMM qovşağı', 'Böyükşor kəsişməsi', 'Mərdəkan körpüsü'],
    historicalPeakLos: 'B',
  },
  CORRIDOR_TBILISI: {
    id: 'CORRIDOR_TBILISI',
    nameAz: 'Tbilisi Prospekti (20 Yanvar – Bakıxanov – Şəhər Mərkəzi)',
    nameEn: 'Tbilisi Avenue Radial Arterial',
    descriptionAz: 'Şimal çıxışı ilə paytaxt mərkəzini birləşdirən, ictimai nəqliyyat və fərdi minik axınının ən yüksək olduğu magistral.',
    corridorLengthMeters: 4800,
    intersectionCount: 8,
    defaultProgressionSpeedKmh: 50,
    defaultCycleTimeSec: 110,
    averageDailyVehicles: 84000,
    activeControlMode: 'ADAPTIVE_SCOOT',
    connectedAynaiTsSensors: 48,
    coordinates: { lat: 40.3956, lng: 49.8213 },
    keyIntersections: ['20 Yanvar dairəsi', 'Qafqaz Point kəsişməsi', 'Həsən Əliyev kəsişməsi', 'Bakıxanov kəsişməsi', 'Füzuli meydanı istiqaməti'],
    historicalPeakLos: 'D',
  },
  CORRIDOR_8_NOYABR: {
    id: 'CORRIDOR_8_NOYABR',
    nameAz: '8 Noyabr Prospekti (Nobel – Ağ Şəhər – Həzi Aslanov)',
    nameEn: '8 November Avenue Intermodal Transit Arterial',
    descriptionAz: 'Ağ Şəhər və cənub-şərq yaşayış massivlərini liman zonası və şəhər mərkəzi ilə əlaqələndirən geniş zolaqlı arteriya.',
    corridorLengthMeters: 6200,
    intersectionCount: 8,
    defaultProgressionSpeedKmh: 60,
    defaultCycleTimeSec: 105,
    averageDailyVehicles: 72000,
    activeControlMode: 'ADAPTIVE_SCOOT',
    connectedAynaiTsSensors: 52,
    coordinates: { lat: 40.3789, lng: 49.8974 },
    keyIntersections: ['Ağ Şəhər qapısı', 'Bakı Neft Emalı Zavodu yanı', 'Nargilə kafesi dairəsi', 'Həzi Aslanov kəsişməsi'],
    historicalPeakLos: 'C',
  },
  CORRIDOR_BABEK: {
    id: 'CORRIDOR_BABEK',
    nameAz: 'Babək Prospekti (Xətai – NZS – Günəşli Tranzit)',
    nameEn: 'Babek Avenue Freight & Mixed Transit Corridor',
    descriptionAz: 'Logistika və sənaye müəssisələrinə, həmçinin Yeni Günəşli qəsəbəsinə yönələn intensiv yük və sərnişin dəhlizi.',
    corridorLengthMeters: 7400,
    intersectionCount: 10,
    defaultProgressionSpeedKmh: 60,
    defaultCycleTimeSec: 115,
    averageDailyVehicles: 79000,
    activeControlMode: 'ADAPTIVE_SCATS',
    connectedAynaiTsSensors: 58,
    coordinates: { lat: 40.3932, lng: 49.9042 },
    keyIntersections: ['Xətai prospekti kəsişməsi', 'Maşın bazarı qovşağı', 'NZS döngəsi', 'Telnov küçəsi kəsişməsi', 'Radiozavod dairəsi'],
    historicalPeakLos: 'D',
  },
  CORRIDOR_ZIYA_BUNYADOV: {
    id: 'CORRIDOR_ZIYA_BUNYADOV',
    nameAz: 'Ziya Bünyadov Prospekti (Dərnəgül – Çermet – Koroğlu)',
    nameEn: 'Ziya Bunyadov Avenue Middle Ring Corridor',
    descriptionAz: 'Bakı şəhərinin daxili həlqəvi tranzit arteriyası; ağır yük və şəhərlərarası tranzit nəqliyyat axınının tənzimlənməsi.',
    corridorLengthMeters: 9200,
    intersectionCount: 11,
    defaultProgressionSpeedKmh: 65,
    defaultCycleTimeSec: 125,
    averageDailyVehicles: 98000,
    activeControlMode: 'ADAPTIVE_SCATS',
    connectedAynaiTsSensors: 74,
    coordinates: { lat: 40.4225, lng: 49.8654 },
    keyIntersections: ['Dərnəgül dairəsi', 'Karl Marks kəsişməsi', 'Atatürk prospekti körpüsü', 'Çermet körpüsü', 'Böyükşor qovşağı'],
    historicalPeakLos: 'E',
  },
  CORRIDOR_MOSCOW: {
    id: 'CORRIDOR_MOSCOW',
    nameAz: 'Moskva Prospekti (Şamaxinka – 20 Yanvar Şimal Qapısı)',
    nameEn: 'Moscow Avenue Northern Inflow Highway',
    descriptionAz: 'M1 magistralından (Sumqayıt və şimal rayonları) paytaxta daxil olan əsas nəqliyyat qapısı.',
    corridorLengthMeters: 3600,
    intersectionCount: 6,
    defaultProgressionSpeedKmh: 55,
    defaultCycleTimeSec: 100,
    averageDailyVehicles: 89000,
    activeControlMode: 'ADAPTIVE_SCOOT',
    connectedAynaiTsSensors: 38,
    coordinates: { lat: 40.4101, lng: 49.8052 },
    keyIntersections: ['Şamaxinka meydanı', 'Avtovağzal qovşağı', '20 Yanvar metrostansiyası yanı'],
    historicalPeakLos: 'E',
  },
  CORRIDOR_INSHAATCHILAR: {
    id: 'CORRIDOR_INSHAATCHILAR',
    nameAz: 'İnşaatçılar Prospekti (Statistika Dairəsi – Elmlər Akademiyası)',
    nameEn: 'Inshaatchilar Avenue University & Tech Corridor',
    descriptionAz: 'Dövlət Statistika Komitəsi, universitetlər və İKT mərkəzlərini əhatə edən intensiv mərkəz əlaqə xətti.',
    corridorLengthMeters: 3100,
    intersectionCount: 5,
    defaultProgressionSpeedKmh: 45,
    defaultCycleTimeSec: 90,
    averageDailyVehicles: 54000,
    activeControlMode: 'FIXED_TIME',
    connectedAynaiTsSensors: 32,
    coordinates: { lat: 40.3802, lng: 49.8189 },
    keyIntersections: ['Statistika dairəsi', 'Nərimanov heykəli kəsişməsi', 'Hüseyn Cavid parkı', 'Elmlər Akademiyası dairəsi'],
    historicalPeakLos: 'C',
  },
};

/**
 * Green Wave (Yaşıl Dalğa) Progression & Bandwidth Calculation
 */
export interface GreenWaveSimulationInput {
  corridorLengthMeters: number;
  intersectionCount: number;
  progressionSpeedKmh: number;
  cycleTimeSec: number;
  greenSplitRatio: number; // e.g. 0.50 (50% of cycle is green)
  trafficVolumeVehPerHour: number;
  controlMode: SignalControlMode;
}

export interface GreenWaveSimulationResult {
  idealProgressionSpeedMs: number;
  averageIntersectionSpacingMeters: number;
  idealOffsetPerIntersectionSec: number;
  greenTimeSec: number;
  bandwidthSec: number;
  bandwidthEfficiencyPercent: number;
  progressionQualityGrade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  progressionQualityAz: string;
  expectedStopsPerTrip: number;
  travelTimeWithoutWaveSec: number;
  travelTimeWithWaveSec: number;
  travelTimeSavedSec: number;
  travelTimeSavedPercent: number;
  fuelSavedLitersPerDay: number;
  co2ReductionKgPerDay: number;
  recommendationAz: string;
}

export const calculateGreenWaveProgression = (
  input: GreenWaveSimulationInput
): GreenWaveSimulationResult => {
  const speedMs = (input.progressionSpeedKmh * 1000) / 3600;
  const numIntersections = Math.max(2, input.intersectionCount);
  const totalLength = Math.max(500, input.corridorLengthMeters);
  const avgSpacingM = totalLength / (numIntersections - 1);

  // Offset in seconds between consecutive signal stops = distance / speed
  const idealOffsetPerIntersectionSec = Math.round((avgSpacingM / speedMs) * 10) / 10;

  const cycleTime = Math.max(60, Math.min(180, input.cycleTimeSec));
  const split = Math.max(0.3, Math.min(0.7, input.greenSplitRatio));
  const greenTimeSec = Math.round(cycleTime * split);

  // Bandwidth calculation considering dispersion & control mode
  let dispersionFactor = 0.85;
  if (input.controlMode === 'ADAPTIVE_SCOOT' || input.controlMode === 'ADAPTIVE_SCATS') {
    dispersionFactor = 0.95; // Adaptive control dynamically tunes offsets
  } else if (input.controlMode === 'EMERGENCY_PREEMPTION') {
    dispersionFactor = 1.0; // Total preemption clears the entire queue
  } else if (input.controlMode === 'FIXED_TIME') {
    dispersionFactor = 0.72; // Platoon disperses without adaptive feedback
  }

  // Bandwidth is maximum uninterrupted green window in platoon
  const bandwidthSec = Math.max(5, Math.round(greenTimeSec * dispersionFactor * 0.75));
  const bandwidthEfficiencyPercent = Math.min(95, Math.round((bandwidthSec / cycleTime) * 100));

  let progressionQualityGrade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'POOR';
  let progressionQualityAz = 'Qeyri-qənaətbəxş (Platon parçalanması və tez-tez dayanmalar)';

  if (bandwidthEfficiencyPercent >= 45) {
    progressionQualityGrade = 'EXCELLENT';
    progressionQualityAz = 'Mükəmməl Sinxronizasiya (Sürət itkisi olmadan fasiləsiz yaşıl dalğa)';
  } else if (bandwidthEfficiencyPercent >= 35) {
    progressionQualityGrade = 'GOOD';
    progressionQualityAz = 'Yaxşı (Cüzi quyruq yığılması ilə sabit avtomobil sütunu axını)';
  } else if (bandwidthEfficiencyPercent >= 25) {
    progressionQualityGrade = 'FAIR';
    progressionQualityAz = 'Orta (Pik saatlarda platon kənarlarında cüzi ləngimələr)';
  }

  // Expected stops per trip: with poor wave ~ 0.6 stops per light; with excellent ~ 0.08
  const baseStopsPerLight = progressionQualityGrade === 'EXCELLENT' ? 0.08 :
    progressionQualityGrade === 'GOOD' ? 0.22 :
    progressionQualityGrade === 'FAIR' ? 0.45 : 0.75;
  const expectedStopsPerTrip = Math.round(numIntersections * baseStopsPerLight * 10) / 10;

  // Travel time without wave (assuming red wait of ~40% of cycle at several stops)
  const baseCruisingTimeSec = Math.round(totalLength / speedMs);
  const redPenaltyPerStopSec = cycleTime * 0.45;
  const stopsWithoutWave = Math.round(numIntersections * 0.65);
  const travelTimeWithoutWaveSec = Math.round(baseCruisingTimeSec + stopsWithoutWave * redPenaltyPerStopSec);

  // Travel time with wave
  const stopsWithWave = expectedStopsPerTrip;
  const travelTimeWithWaveSec = Math.round(baseCruisingTimeSec + stopsWithWave * (cycleTime * 0.2));
  const travelTimeSavedSec = Math.max(0, travelTimeWithoutWaveSec - travelTimeWithWaveSec);
  const travelTimeSavedPercent = Math.min(65, Math.round((travelTimeSavedSec / travelTimeWithoutWaveSec) * 100));

  // Fuel and CO2 savings scaled by daily traffic volume
  const dailyVehicles = Math.max(5000, input.trafficVolumeVehPerHour * 12);
  const stopReductionPerDay = dailyVehicles * (stopsWithoutWave - stopsWithWave);
  // Idling + stop/start consumes ~0.012L per extra stop
  const fuelSavedLitersPerDay = Math.round(stopReductionPerDay * 0.012);
  // 1 Liter of gasoline ~ 2.31 kg CO2
  const co2ReductionKgPerDay = Math.round(fuelSavedLitersPerDay * 2.31);

  let recommendationAz = 'Mövcud sürət və faz bölgüsü tənzimləməsi optimaldır.';
  if (bandwidthEfficiencyPercent < 30) {
    recommendationAz = `Tövsiyə olunur: Faz bölgüsünü (split) ən azı 55%-ə qaldırın və ya sürəti ${Math.round(input.progressionSpeedKmh * 0.9)} km/saat səviyyəsinə uyğunlaşdırın.`;
  } else if (input.controlMode === 'FIXED_TIME') {
    recommendationAz = 'Sabit vaxt rejimi əvəzinə SCOOT/SCATS adaptiv rejimə keçid tövsiyə edilir.';
  }

  return {
    idealProgressionSpeedMs: Math.round(speedMs * 10) / 10,
    averageIntersectionSpacingMeters: Math.round(avgSpacingM),
    idealOffsetPerIntersectionSec,
    greenTimeSec,
    bandwidthSec,
    bandwidthEfficiencyPercent,
    progressionQualityGrade,
    progressionQualityAz,
    expectedStopsPerTrip,
    travelTimeWithoutWaveSec,
    travelTimeWithWaveSec,
    travelTimeSavedSec,
    travelTimeSavedPercent,
    fuelSavedLitersPerDay,
    co2ReductionKgPerDay,
    recommendationAz,
  };
};

/**
 * Queue Length & Saturation Flow Rate (Webster Model) Telemetry
 */
export interface QueueTelemetryInput {
  arrivalRateVehPerHourPerLane: number; // q
  saturationFlowRateVehPerHourPerLane: number; // S (typically 1800-2000 pcu/h)
  cycleTimeSec: number; // C
  effectiveGreenSec: number; // g
  numberOfLanes: number;
}

export interface QueueTelemetryResult {
  degreeOfSaturationX: number; // X = q / (S * g/C)
  capacityVehPerHour: number; // c = S * (g/C) * lanes
  averageDelaySecPerVehicle: number; // Webster delay formula
  levelOfService: LevelOfServiceGrade;
  levelOfServiceDescriptionAz: string;
  queueLengthVehicles: number;
  queueLengthMeters: number;
  spillbackRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL_GRIDLOCK';
  spillbackRiskAz: string;
  recommendedActionAz: string;
}

export const evaluateQueueAndSaturation = (
  input: QueueTelemetryInput
): QueueTelemetryResult => {
  const lanes = Math.max(1, input.numberOfLanes);
  const S = Math.max(1200, input.saturationFlowRateVehPerHourPerLane);
  const q = Math.max(50, input.arrivalRateVehPerHourPerLane);
  const C = Math.max(40, input.cycleTimeSec);
  const g = Math.max(10, Math.min(C - 5, input.effectiveGreenSec));

  const greenRatio = g / C; // lambda = g / C
  const capacityPerLane = S * greenRatio;
  const totalCapacity = Math.round(capacityPerLane * lanes);

  // Degree of saturation X = q / capacityPerLane
  const X = Math.round((q / capacityPerLane) * 100) / 100;

  // Webster delay formula:
  // d1 = [ C * (1 - lambda)^2 ] / [ 2 * (1 - lambda * X) ]
  // d2 = [ X^2 ] / [ 2 * q_sec * (1 - X) ] (approx overflow delay when X < 1)
  let d1 = (C * Math.pow(1 - greenRatio, 2)) / (2 * (1 - greenRatio * Math.min(0.98, X)));
  let d2 = 0;
  if (X >= 0.99) {
    d2 = 45 * Math.pow(X, 3); // High overflow penalty
  } else if (X > 0.6) {
    const qSec = q / 3600;
    d2 = Math.pow(X, 2) / (2 * qSec * (1 - X) * 3600);
  }
  const averageDelaySec = Math.max(5, Math.round(d1 + d2));

  // LOS Criteria according to Highway Capacity Manual (HCM):
  // LOS A: <= 10 sec
  // LOS B: > 10 and <= 20 sec
  // LOS C: > 20 and <= 35 sec
  // LOS D: > 35 and <= 55 sec
  // LOS E: > 55 and <= 80 sec
  // LOS F: > 80 sec or X > 1.0
  let levelOfService: LevelOfServiceGrade = 'A';
  let levelOfServiceDescriptionAz = 'LOS A: Əla axın, sərbəst hərəkət, gözləmə müddəti yox dərəcəsindədir.';

  if (X > 1.05 || averageDelaySec > 80) {
    levelOfService = 'F';
    levelOfServiceDescriptionAz = 'LOS F: Kritik iflic (Gridlock). Tələbat tutumu aşıb, uzun quyruqlar və sıxıntı.';
  } else if (averageDelaySec > 55 || X > 0.9) {
    levelOfService = 'E';
    levelOfServiceDescriptionAz = 'LOS E: Tutum həddində hərəkət. Qeyri-sabit axın və hər dövrdə gecikmələr.';
  } else if (averageDelaySec > 35 || X > 0.8) {
    levelOfService = 'D';
    levelOfServiceDescriptionAz = 'LOS D: İntensiv axın. Gözləmə müddətləri hiss olunandır, bəzi dövrlərdə quyruq qalır.';
  } else if (averageDelaySec > 20 || X > 0.65) {
    levelOfService = 'C';
    levelOfServiceDescriptionAz = 'LOS C: Qənaətbəxş axın. İdarəolunan quyruq, əksər nəqliyyat ilk yaşıl fazada keçir.';
  } else if (averageDelaySec > 10 || X > 0.45) {
    levelOfService = 'B';
    levelOfServiceDescriptionAz = 'LOS B: Yaxşı axın. Qısa quyruqlar və minimal ləngimə.';
  }

  // Queue length in vehicles per lane = q * (C - g) / 3600 + overflow
  const redSec = C - g;
  const redArrivals = (q / 3600) * redSec;
  const overflow = X > 0.9 ? Math.round((X - 0.9) * 20) : 0;
  const queueVehiclesPerLane = Math.max(1, Math.round(redArrivals + overflow));
  const totalQueueVehicles = queueVehiclesPerLane * lanes;

  // Average space occupied per vehicle ~ 6.5 meters (car length + buffer)
  const queueLengthMeters = queueVehiclesPerLane * 6.5;

  let spillbackRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL_GRIDLOCK' = 'LOW';
  let spillbackRiskAz = 'Aşağı (Qonşu kəsişməyə daşma təhlükəsi yoxdur)';

  if (queueLengthMeters >= 250 || X >= 1.05) {
    spillbackRisk = 'CRITICAL_GRIDLOCK';
    spillbackRiskAz = 'Kritik İflic (Qonşu yol ayrıcının bloklanması qaçılmazdır)';
  } else if (queueLengthMeters >= 150 || X >= 0.92) {
    spillbackRisk = 'HIGH';
    spillbackRiskAz = 'Yüksək Risk (Tıxacın geriyə doğru uzanması ehtimalı böyükdür)';
  } else if (queueLengthMeters >= 80 || X >= 0.78) {
    spillbackRisk = 'MODERATE';
    spillbackRiskAz = 'Mötədil (Pik dövrdə qısa quyruq yığılması)';
  }

  let recommendedActionAz = 'Siqnal tənzimləməsi cari tələbata tam cavab verir.';
  if (spillbackRisk === 'CRITICAL_GRIDLOCK') {
    recommendedActionAz = 'Təcili tədbir: Yaşıl fazanın müddətini 15 saniyə artırın və ya daxilolma zolağında dozalanma (metering) tətbiq edin.';
  } else if (spillbackRisk === 'HIGH') {
    recommendedActionAz = 'Adaptiv SCOOT koordinasiyasını aktivləşdirin və qonşu kəsişmənin ofsetini tənzimləyin.';
  }

  return {
    degreeOfSaturationX: X,
    capacityVehPerHour: totalCapacity,
    averageDelaySecPerVehicle: averageDelaySec,
    levelOfService,
    levelOfServiceDescriptionAz,
    queueLengthVehicles: totalQueueVehicles,
    queueLengthMeters: Math.round(queueLengthMeters),
    spillbackRisk,
    spillbackRiskAz,
    recommendedActionAz,
  };
};

/**
 * Dynamic Intersection Congestion Pricing & Smart Mobility Pass Tariff
 */
export type VehiclePowertrainType = 'ELECTRIC' | 'HYBRID' | 'INTERNAL_COMBUSTION' | 'EMERGENCY_AMBULANCE_FIRE';

export interface CongestionPricingInput {
  corridorId: StrategicCorridorId;
  powertrain: VehiclePowertrainType;
  isPeakHour: boolean; // 07:30 - 10:00 or 17:30 - 20:30
  levelOfService: LevelOfServiceGrade;
  passDurationDays: number; // 1, 7, 30, 365
  requestEmergencyPreemptionPass: boolean;
}

export interface CongestionPricingResult {
  baseDailyFeeAzn: number;
  peakHourMultiplier: number;
  congestionSurchargeAzn: number;
  powertrainDiscountPercent: number;
  powertrainDiscountAzn: number;
  emergencyPreemptionFeeAzn: number;
  subtotalDailyAzn: number;
  totalPeriodFeeAzn: number;
  isExempt: boolean;
  legalBasisAz: string;
}

export const calculateCongestionTariff = (
  input: CongestionPricingInput
): CongestionPricingResult => {
  if (input.powertrain === 'EMERGENCY_AMBULANCE_FIRE') {
    return {
      baseDailyFeeAzn: 0,
      peakHourMultiplier: 1.0,
      congestionSurchargeAzn: 0,
      powertrainDiscountPercent: 100,
      powertrainDiscountAzn: 0,
      emergencyPreemptionFeeAzn: 0,
      subtotalDailyAzn: 0,
      totalPeriodFeeAzn: 0,
      isExempt: true,
      legalBasisAz: 'Yol Hərəkəti Haqqında Qanun Maddə 64 & Nazirlər Kabineti Qərarı № 42: Operativ xidmət nəqliyyatı bütün rüsum və ödənişlərdən azaddır.',
    };
  }

  // Base corridor charge per day
  let baseDailyFeeAzn = 4.0;
  if (input.corridorId === 'CORRIDOR_NEFTCHILAR' || input.corridorId === 'CORRIDOR_HEYDAR_ALIYEV') {
    baseDailyFeeAzn = 6.0;
  } else if (input.corridorId === 'CORRIDOR_TBILISI' || input.corridorId === 'CORRIDOR_ZIYA_BUNYADOV') {
    baseDailyFeeAzn = 5.0;
  }

  // Peak hour multiplier
  const peakMultiplier = input.isPeakHour ? 1.5 : 1.0;

  // Congestion surcharge based on LOS
  let losSurcharge = 0;
  if (input.levelOfService === 'F') losSurcharge = 4.0;
  else if (input.levelOfService === 'E') losSurcharge = 2.5;
  else if (input.levelOfService === 'D') losSurcharge = 1.0;

  const rawDailyWithCongestion = (baseDailyFeeAzn * peakMultiplier) + losSurcharge;

  // Powertrain discount
  let discountPercent = 0;
  if (input.powertrain === 'ELECTRIC') {
    discountPercent = 50; // 50% discount for Zero-Emission EVs
  } else if (input.powertrain === 'HYBRID') {
    discountPercent = 25; // 25% discount for Hybrids
  }

  const discountAmount = Math.round(((rawDailyWithCongestion * discountPercent) / 100) * 100) / 100;
  let preemptionFee = 0;
  if (input.requestEmergencyPreemptionPass) {
    preemptionFee = 15.0; // Commercial VIP green-wave fleet clearance fee
  }

  const subtotalDaily = Math.max(1.0, Math.round((rawDailyWithCongestion - discountAmount + preemptionFee) * 100) / 100);
  const days = Math.max(1, input.passDurationDays);

  // Volume discount for multi-day passes
  let durationMultiplier = 1.0;
  if (days >= 365) durationMultiplier = 0.70; // 30% discount for annual
  else if (days >= 30) durationMultiplier = 0.85; // 15% discount for monthly
  else if (days >= 7) durationMultiplier = 0.92; // 8% discount for weekly

  const totalPeriodFeeAzn = Math.round(subtotalDaily * days * durationMultiplier * 100) / 100;

  return {
    baseDailyFeeAzn,
    peakHourMultiplier: peakMultiplier,
    congestionSurchargeAzn: losSurcharge,
    powertrainDiscountPercent: discountPercent,
    powertrainDiscountAzn: discountAmount,
    emergencyPreemptionFeeAzn: preemptionFee,
    subtotalDailyAzn: subtotalDaily,
    totalPeriodFeeAzn,
    isExempt: false,
    legalBasisAz: 'RİNN və AYNA Bakı Ağıllı Nəqliyyat Şəbəkəsi İdarəetmə Qaydaları və İXM Maddə 327 üzrə təsdiqlənmiş dinamik pik tarif dərəcələri.',
  };
};

/**
 * 10-Point Technical ITS & Traffic Signal Infrastructure Checklist
 */
export interface ItsChecklistItem {
  id: string;
  categoryAz: string;
  titleAz: string;
  descriptionAz: string;
  standardReference: string;
  isMandatory: boolean;
}

export const evaluateItsChecklist = (
  checkedIds: Record<string, boolean>,
  items: ItsChecklistItem[]
): {
  totalItems: number;
  completedItems: number;
  compliancePercent: number;
  allMandatoryPassed: boolean;
  isEligibleForSynchronization: boolean;
  missingMandatoryAz: string[];
} => {
  const totalItems = items.length;
  let completedItems = 0;
  const missingMandatoryAz: string[] = [];

  for (const item of items) {
    const isChecked = !!checkedIds[item.id];
    if (isChecked) {
      completedItems++;
    } else if (item.isMandatory) {
      missingMandatoryAz.push(item.titleAz);
    }
  }

  const compliancePercent = Math.round((completedItems / totalItems) * 100);
  const allMandatoryPassed = missingMandatoryAz.length === 0;
  const isEligibleForSynchronization = compliancePercent >= 90 && allMandatoryPassed;

  return {
    totalItems,
    completedItems,
    compliancePercent,
    allMandatoryPassed,
    isEligibleForSynchronization,
    missingMandatoryAz,
  };
};

/**
 * 10-Question Theoretical Traffic Signal Engineering Examination
 */
export interface TrafficExamQuestion {
  id: string;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
  legalBasisAz: string;
}

export const evaluateTrafficExam = (
  answers: Record<string, number>,
  questions: TrafficExamQuestion[]
): {
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercent: number;
  isPassed: boolean;
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
 * Official ITS-PRIORITY-AZ-2026 Electronic Smart Mobility Pass
 */
export interface OfficialItsPriorityPass {
  passId: string;
  issueDate: string;
  validUntil: string;
  vehiclePlate: string;
  vehicleModelAz: string;
  operatorOrganizationAz: string;
  priorityTierAz: string;
  corridorId: StrategicCorridorId;
  corridorNameAz: string;
  signalControlMode: SignalControlMode;
  preemptionChannelFrequencyMhz: number;
  isV2iRsuEquipped: boolean;
  totalTariffAzn: number;
  rinnRegistryBadge: string;
  sha256SecurityChecksum: string;
  simaDigitalUid: string;
}

export const generateOfficialItsPriorityPass = (
  vehiclePlate: string,
  vehicleModelAz: string,
  operatorOrganizationAz: string,
  priorityTierAz: string,
  corridor: StrategicCorridorInfo,
  signalControlMode: SignalControlMode,
  totalTariffAzn: number,
  isV2iRsuEquipped: boolean = true
): OfficialItsPriorityPass => {
  const issueDateObj = new Date();
  const validUntilObj = new Date(issueDateObj.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days validity

  const pad = (n: number) => n.toString().padStart(2, '0');
  const issueDate = `${issueDateObj.getFullYear()}-${pad(issueDateObj.getMonth() + 1)}-${pad(issueDateObj.getDate())}`;
  const validUntil = `${validUntilObj.getFullYear()}-${pad(validUntilObj.getMonth() + 1)}-${pad(validUntilObj.getDate())}`;

  const certNumber = Math.floor(10000 + Math.random() * 90000);
  const passId = `ITS-PRIORITY-AZ-2026-${certNumber}`;

  const rawHash = `${passId}-${vehiclePlate}-${corridor.id}-${issueDate}-${totalTariffAzn}`;
  let hashVal = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHash.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256SecurityChecksum = Math.abs(hashVal).toString(16).padStart(16, '0').toUpperCase();
  const simaDigitalUid = `SIMA-RINN-ITS-${Math.abs(hashVal ^ 0x6b6b6b).toString(16).toUpperCase()}`;

  const engineerId = Math.floor(100 + Math.random() * 900);

  return {
    passId,
    issueDate,
    validUntil,
    vehiclePlate,
    vehicleModelAz,
    operatorOrganizationAz,
    priorityTierAz,
    corridorId: corridor.id,
    corridorNameAz: corridor.nameAz,
    signalControlMode,
    preemptionChannelFrequencyMhz: 5895.0, // C-V2X / DSRC channel 178 standard for emergency preemption
    isV2iRsuEquipped,
    totalTariffAzn,
    rinnRegistryBadge: `RINN-ITS-ENG-${engineerId}`,
    sha256SecurityChecksum,
    simaDigitalUid,
  };
};
