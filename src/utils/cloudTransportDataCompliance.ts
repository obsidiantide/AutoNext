/**
 * Official Ministry of Digital Development and Transport (RİNN),
 * "AzInTelecom" LLC (Sovereign Cloud & G-Cloud Provider) &
 * State Traffic Police Department (BDYP),
 * National Commercial Vehicle Telematics Big Data Lake & Smart Mobility AI Hub
 * (AzInTelecom Nəqliyyat Bulud Məlumat Mərkəzi & AZINTELECOM-CLOUD-AZ-2026 Portalı)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Personal Data" ("Fərdi məlumatlar haqqında" Azərbaycan Respublikasının Qanunu, Maddə 5, 9, 13)
 * - Law of the Republic of Azerbaijan "On Telecommunications" ("Telekommunikasiya haqqında" Azərbaycan Respublikasının Qanunu, Maddə 11, 28)
 * - Decree of the President of the Republic of Azerbaijan on "Government Cloud" (Hökumət Buludu - G-Cloud Konsepsiyası və Tətbiqi Qaydaları):
 *   * Dövlət orqanları və strateji nəqliyyat sistemlərinin mərkəzləşdirilmiş bulud infrastrukturuna inteqrasiyası
 * - National Information and Cybersecurity Strategy (2023-2027) of the Republic of Azerbaijan
 * - Resolution of the Cabinet of Ministers on the Rules of Operation of State Transport Information Systems and Telematics Data Storage
 * - International Standards: ISO/IEC 27001 (Information Security), ISO/IEC 27017 (Cloud Security), ISO/IEC 27018 (PII Privacy Protection in Cloud), Uptime Institute Tier III / Tier IV Datacenter Certification
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
 * 6 Strategic Sovereign Cloud Zones (AzInTelecom Suveren Bulud Zonaları)
 */
export type CloudZoneId =
  | 'ZONE_BAKU_PRIMARY'
  | 'ZONE_YEVLAKH_REGIONAL'
  | 'ZONE_NAKHCHIVAN_REDUNDANT'
  | 'ZONE_GANJA_EDGE'
  | 'ZONE_SUMGAYIT_HIGH_DENSITY'
  | 'ZONE_FUZULI_SMART';

export interface CloudZoneInfo {
  id: CloudZoneId;
  nameAz: string;
  nameEn: string;
  regionAz: string;
  coordinates: {
    lat: number;
    lng: number;
    elevationMeters: number;
    dmsString: string;
  };
  tierClassification: 'TIER_IV_MISSION_CRITICAL' | 'TIER_III_CARRIER_GRADE' | 'TIER_III_EDGE_HUB';
  uptimeSlaPercentage: number; // e.g. 99.995%
  totalComputeRacks: number;
  nvmeStoragePetabytes: number;
  averageIngestionLatencyMs: number;
  redundantBackboneFiberBandwidthGbps: number;
  greenPowerPUE: number; // Power Usage Effectiveness e.g. 1.18
  status: 'ONLINE_ACTIVE' | 'HIGH_LOAD_SURGE' | 'MAINTENANCE_STANDBY';
  emergencyNocHotline: string;
  descriptionAz: string;
}

export const CLOUD_ZONES: Record<CloudZoneId, CloudZoneInfo> = {
  ZONE_BAKU_PRIMARY: {
    id: 'ZONE_BAKU_PRIMARY',
    nameAz: 'Bakı Əsas Məlumat Mərkəzi (Baku Primary Tier III/IV DC)',
    nameEn: 'Baku Primary Sovereign Datacenter Hub',
    regionAz: 'Bakı şəhəri, Səbail rayonu / Hökumət Buludu Şlüzü',
    coordinates: {
      lat: 40.3688,
      lng: 49.8272,
      elevationMeters: 28,
      dmsString: '40°22\'07.7"N 49°49\'37.9"E',
    },
    tierClassification: 'TIER_IV_MISSION_CRITICAL',
    uptimeSlaPercentage: 99.995,
    totalComputeRacks: 360,
    nvmeStoragePetabytes: 48.5,
    averageIngestionLatencyMs: 1.8,
    redundantBackboneFiberBandwidthGbps: 400,
    greenPowerPUE: 1.22,
    status: 'ONLINE_ACTIVE',
    emergencyNocHotline: '+994 (12) 200-01-00 (Daxili 110)',
    descriptionAz: 'Azərbaycanın əsas Hökumət Buludu (G-Cloud) və milli kommersiya nəqliyyatı telemetriya nüvə klasteri. 2N+1 fasiləsiz soyutma və generator ehtiyatı.',
  },
  ZONE_YEVLAKH_REGIONAL: {
    id: 'ZONE_YEVLAKH_REGIONAL',
    nameAz: 'Yevlax Regional Ehtiyat və Magistral Bulud Qovşağı',
    nameEn: 'Yevlakh Regional Transit Cloud Node',
    regionAz: 'Yevlax rayonu / Mərkəzi Aran Nəqliyyat Qovşağı',
    coordinates: {
      lat: 40.6172,
      lng: 47.1501,
      elevationMeters: 17,
      dmsString: '40°37\'01.9"N 47°09\'00.4"E',
    },
    tierClassification: 'TIER_III_CARRIER_GRADE',
    uptimeSlaPercentage: 99.982,
    totalComputeRacks: 140,
    nvmeStoragePetabytes: 22.0,
    averageIngestionLatencyMs: 4.2,
    redundantBackboneFiberBandwidthGbps: 200,
    greenPowerPUE: 1.25,
    status: 'ONLINE_ACTIVE',
    emergencyNocHotline: '+994 (22) 336-12-00',
    descriptionAz: 'Bakı-Qazax və Şərq-Qərb magistral yük daşımaları telemetriyası üzrə coğrafi ehtiyat və geobloklama arxivi.',
  },
  ZONE_NAKHCHIVAN_REDUNDANT: {
    id: 'ZONE_NAKHCHIVAN_REDUNDANT',
    nameAz: 'Naxçıvan Muxtar Respublika Suveren Ehtiyat Klasteri',
    nameEn: 'Nakhchivan Sovereign Redundant Edge Node',
    regionAz: 'Naxçıvan MR, Culfa və Türkiyə tranzit dəhlizi',
    coordinates: {
      lat: 39.2089,
      lng: 45.4122,
      elevationMeters: 875,
      dmsString: '39°12\'32.0"N 45°24\'43.9"E',
    },
    tierClassification: 'TIER_III_CARRIER_GRADE',
    uptimeSlaPercentage: 99.985,
    totalComputeRacks: 80,
    nvmeStoragePetabytes: 12.5,
    averageIngestionLatencyMs: 6.5,
    redundantBackboneFiberBandwidthGbps: 100,
    greenPowerPUE: 1.19,
    status: 'ONLINE_ACTIVE',
    emergencyNocHotline: '+994 (36) 544-77-00',
    descriptionAz: 'Naxçıvan dəhlizi və Türkiyə-İran beynəlxalq TIR daşımaları üçün avtonom lokal kiber-mühafizəli məlumat mərkəzi.',
  },
  ZONE_GANJA_EDGE: {
    id: 'ZONE_GANJA_EDGE',
    nameAz: 'Gəncə Qərb Nəqliyyat Dəhlizi Edge Computing Klasteri',
    nameEn: 'Ganja West Transport Corridor Edge Cluster',
    regionAz: 'Gəncə şəhəri / Gürcüstan və Qara Dəniz magistralı',
    coordinates: {
      lat: 40.6828,
      lng: 46.3606,
      elevationMeters: 412,
      dmsString: '40°40\'58.1"N 46°21\'38.2"E',
    },
    tierClassification: 'TIER_III_EDGE_HUB',
    uptimeSlaPercentage: 99.980,
    totalComputeRacks: 96,
    nvmeStoragePetabytes: 16.0,
    averageIngestionLatencyMs: 3.5,
    redundantBackboneFiberBandwidthGbps: 150,
    greenPowerPUE: 1.21,
    status: 'ONLINE_ACTIVE',
    emergencyNocHotline: '+994 (22) 266-40-10',
    descriptionAz: 'Böyük İpək Yolu (TRACECA) qərb sektorunda hərəkət edən avtoparkların ultra-aşağı gecikməli AI telemetriya işlənməsi.',
  },
  ZONE_SUMGAYIT_HIGH_DENSITY: {
    id: 'ZONE_SUMGAYIT_HIGH_DENSITY',
    nameAz: 'Sumqayıt Yüksək Sıxlıqlı AI Hesablama Texnoparkı Klasteri',
    nameEn: 'Sumgayit High-Density AI & Big Data Cluster',
    regionAz: 'Sumqayıt Kimya Sənaye Parkı (SKSP) / Şimal Dəhlizi',
    coordinates: {
      lat: 40.5897,
      lng: 49.6686,
      elevationMeters: -12,
      dmsString: '40°35\'22.9"N 49°40\'07.0"E',
    },
    tierClassification: 'TIER_IV_MISSION_CRITICAL',
    uptimeSlaPercentage: 99.992,
    totalComputeRacks: 220,
    nvmeStoragePetabytes: 36.0,
    averageIngestionLatencyMs: 2.1,
    redundantBackboneFiberBandwidthGbps: 300,
    greenPowerPUE: 1.16,
    status: 'HIGH_LOAD_SURGE',
    emergencyNocHotline: '+994 (18) 648-90-20',
    descriptionAz: 'NVIDIA H100 və L40S GPU klasterləri ilə təchiz olunmuş, maşın öyrənməsi və avtopark qəza proqnozlaşdırma mərkəzi.',
  },
  ZONE_FUZULI_SMART: {
    id: 'ZONE_FUZULI_SMART',
    nameAz: 'Füzuli "Ağıllı Şəhər və Nəqliyyat Dəhlizi" Yaşıl Edge Klasteri',
    nameEn: 'Fuzuli Smart Corridor Green Edge Node',
    regionAz: 'Füzuli şəhəri / Zəngəzur Dəhlizi və Qarabağ Şəbəkəsi',
    coordinates: {
      lat: 39.6003,
      lng: 47.1431,
      elevationMeters: 416,
      dmsString: '39°36\'01.1"N 47°08\'35.2"E',
    },
    tierClassification: 'TIER_III_EDGE_HUB',
    uptimeSlaPercentage: 99.990,
    totalComputeRacks: 64,
    nvmeStoragePetabytes: 10.0,
    averageIngestionLatencyMs: 3.1,
    redundantBackboneFiberBandwidthGbps: 100,
    greenPowerPUE: 1.12,
    status: 'ONLINE_ACTIVE',
    emergencyNocHotline: '+994 (26) 315-05-50',
    descriptionAz: '100% günəş və külək enerjisi ilə qidalanan, Qarabağ iqtisadi rayonunun ağıllı mobillik və avtonom nəqliyyat şlüzü.',
  },
};

/**
 * Real-Time Telemetry Pipeline & Kafka / Flink Streaming Presets
 */
export interface StreamingPipelineMetric {
  pipelineId: string;
  pipelineNameAz: string;
  sourceStream: 'KAFKA_TELEMATICS_IN' | 'MQTT_CAN_BUS' | 'V2X_EDGE_BROKER' | 'TACHOGRAPH_REST_API';
  currentIngestionPacketsPerSec: number;
  dataIngressMbps: number;
  streamProcessingEngine: 'APACHE_FLINK_V1_19' | 'SPARK_STRUCTURED_STREAMING' | 'CLICKHOUSE_REALTIME';
  consumerLagMilliseconds: number;
  droppedPacketsRatePercentage: number;
  storageTier: 'HOT_NVME_REALTIME' | 'WARM_SSD_ANALYTICS' | 'COLD_GLACIER_ARCHIVE';
}

export const STREAMING_PIPELINE_PRESETS: StreamingPipelineMetric[] = [
  {
    pipelineId: 'PIPE_COMMERCIAL_FLEET_CORE',
    pipelineNameAz: 'Respublika Kommersiya Yük və TIR Donanması Əsas Telemetriya Şini',
    sourceStream: 'KAFKA_TELEMATICS_IN',
    currentIngestionPacketsPerSec: 48500,
    dataIngressMbps: 388.4,
    streamProcessingEngine: 'APACHE_FLINK_V1_19',
    consumerLagMilliseconds: 14,
    droppedPacketsRatePercentage: 0.0001,
    storageTier: 'HOT_NVME_REALTIME',
  },
  {
    pipelineId: 'PIPE_ADR_HAZMAT_URGENT',
    pipelineNameAz: 'Təhlükəli Yük (ADR) və Yanacaq Daşıyan Çənlərin Təzyiq & Temperatur Telemetriyası',
    sourceStream: 'MQTT_CAN_BUS',
    currentIngestionPacketsPerSec: 12400,
    dataIngressMbps: 99.2,
    streamProcessingEngine: 'APACHE_FLINK_V1_19',
    consumerLagMilliseconds: 8,
    droppedPacketsRatePercentage: 0.0,
    storageTier: 'HOT_NVME_REALTIME',
  },
  {
    pipelineId: 'PIPE_PASSENGER_TRANSIT_BUS',
    pipelineNameAz: 'Bakı və Şəhərlərarası Sərnişin Avtobuslarının Marşrut & Sürət Audit Sistemi',
    sourceStream: 'V2X_EDGE_BROKER',
    currentIngestionPacketsPerSec: 26800,
    dataIngressMbps: 214.4,
    streamProcessingEngine: 'CLICKHOUSE_REALTIME',
    consumerLagMilliseconds: 22,
    droppedPacketsRatePercentage: 0.0002,
    storageTier: 'WARM_SSD_ANALYTICS',
  },
  {
    pipelineId: 'PIPE_REGULATORY_ARCHIVE_5YR',
    pipelineNameAz: 'AYNA & BDYP İllik Rəsmi Taxoqraf və Sürət Arxiv Dəryası (5 İllik Saxlama)',
    sourceStream: 'TACHOGRAPH_REST_API',
    currentIngestionPacketsPerSec: 5200,
    dataIngressMbps: 41.6,
    streamProcessingEngine: 'SPARK_STRUCTURED_STREAMING',
    consumerLagMilliseconds: 110,
    droppedPacketsRatePercentage: 0.0,
    storageTier: 'COLD_GLACIER_ARCHIVE',
  },
];

/**
 * Fleet Predictive Maintenance & AI Anomaly Detection Models
 */
export interface FleetAiAnomalySample {
  vehicleVin: string;
  plateNumber: string;
  model: string;
  fleetCompany: string;
  vibrationFftAmplitudeMmPerSec: number; // Normal: < 2.5 mm/s; Warning: 2.5-4.5; Critical: > 4.5
  batteryStateOfHealthPercentage: number; // Normal: > 85%; Warning: 70-85%; Critical: < 70%
  brakePadWearPredictedLifeDays: number; // Normal: > 45 days; Warning: 15-45; Critical: < 15
  canBusErrorFrameRatePerMinute: number; // Normal: < 5; Warning: 5-25; Critical: > 25
  predictedRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommendedInterventionAz: string;
}

export const MOCK_AI_ANOMALY_SAMPLES: FleetAiAnomalySample[] = [
  {
    vehicleVin: 'VF624GPA000192831',
    plateNumber: '99-JH-412',
    model: 'Renault T-High 480 Euro-6',
    fleetCompany: 'Baku Express Logistics QSC',
    vibrationFftAmplitudeMmPerSec: 5.12,
    batteryStateOfHealthPercentage: 74.2,
    brakePadWearPredictedLifeDays: 9,
    canBusErrorFrameRatePerMinute: 34,
    predictedRiskLevel: 'CRITICAL',
    recommendedInterventionAz: 'Transmissiya kardan valı vibrasiyası və ön sağ əyləc bəndinin təcili dəyişdirilməsi. 48 saat ərzində xidmət mərkəzinə müraciət tələb olunur.',
  },
  {
    vehicleVin: 'WDB9634031L819203',
    plateNumber: '77-AD-551',
    model: 'Mercedes-Benz Actros 1845 LS',
    fleetCompany: 'Silk Way Trans Korporasiyası',
    vibrationFftAmplitudeMmPerSec: 3.40,
    batteryStateOfHealthPercentage: 81.0,
    brakePadWearPredictedLifeDays: 28,
    canBusErrorFrameRatePerMinute: 11,
    predictedRiskLevel: 'HIGH',
    recommendedInterventionAz: 'Akkumulyator hüceyrələrində gərginlik disbalansı və turbo kompressor temperatur anomaliyası. Növbəti reysdən əvvəl diaqnostika tövsiyə edilir.',
  },
  {
    vehicleVin: 'XLRTE47MS0G128941',
    plateNumber: '10-UK-890',
    model: 'DAF XF 530 Super Space Cab',
    fleetCompany: 'Caspian Freight Solutions MMC',
    vibrationFftAmplitudeMmPerSec: 2.15,
    batteryStateOfHealthPercentage: 92.4,
    brakePadWearPredictedLifeDays: 84,
    canBusErrorFrameRatePerMinute: 2,
    predictedRiskLevel: 'LOW',
    recommendedInterventionAz: 'Sistem parametrləri optimal həddədir. Bütün sensor telemetriyası ISO 27001 şifrələnmiş rejimdə saxlanılır.',
  },
  {
    vehicleVin: 'YS2R4X20002938102',
    plateNumber: '50-DM-303',
    model: 'Scania R500 V8 Streamline',
    fleetCompany: 'Sumqayıt Kimya Loqistika ASC',
    vibrationFftAmplitudeMmPerSec: 2.95,
    batteryStateOfHealthPercentage: 86.1,
    brakePadWearPredictedLifeDays: 35,
    canBusErrorFrameRatePerMinute: 7,
    predictedRiskLevel: 'MODERATE',
    recommendedInterventionAz: 'Dizel çənində su sensoru siqnalı və sol arxa təkər təzyiqində kiçik fərq qeydə alınıb. Planlı texniki baxış təyin edilib.',
  },
];

/**
 * Statutory Cloud Telematics Storage Tariff & SLA Compute Cost Calculator
 */
export type AiPipelineTier = 'BASIC_TELEMETRY' | 'ADVANCED_FLEET_AI' | 'ENTERPRISE_MISSION_CRITICAL';
export type CloudRedundancyOption = 'GEO_REDUNDANT_STANDARD' | 'DUAL_ZONE_ACTIVE_ACTIVE' | 'G_CLOUD_SOVEREIGN_TIER_IV';
export type StorageRetentionMonths = 1 | 3 | 6 | 12 | 24 | 36 | 60;

export interface CloudTariffCalculationResult {
  fleetVehicleCount: number;
  retentionMonths: StorageRetentionMonths;
  aiPipelineTier: AiPipelineTier;
  redundancyOption: CloudRedundancyOption;
  hasGovernmentSubsidy: boolean;
  currency: Currency;

  // Monthly breakdown in AZN
  baseMonthlySubscriptionAzn: number;
  storageVolumeTerabytesMonthly: number;
  storageCostMonthlyAzn: number;
  aiComputeProcessingCostMonthlyAzn: number;
  highAvailabilityRedundancyCostMonthlyAzn: number;
  grossMonthlyTotalAzn: number;
  subsidyDiscountAmountAzn: number;
  netMonthlyTotalAzn: number;
  netAnnualTotalAzn: number;

  // Converted values
  netMonthlyConverted: number;
  netAnnualConverted: number;
  estimatedIngestedGigabytesPerMonth: number;
  guaranteedSlaUptime: string;
}

export const calculateCloudTransportTariff = (
  fleetVehicleCount: number,
  retentionMonths: StorageRetentionMonths,
  aiPipelineTier: AiPipelineTier,
  redundancyOption: CloudRedundancyOption,
  hasGovernmentSubsidy: boolean,
  currency: Currency = 'AZN'
): CloudTariffCalculationResult => {
  const safeVehicles = Math.max(1, Math.min(5000, Math.floor(fleetVehicleCount || 1)));

  // Base platform access fee per vehicle: 12 AZN/month
  const baseMonthlySubscriptionAzn = safeVehicles * 12.0;

  // Data estimation: 1 vehicle generates ~3.5 GB raw telemetry per month
  const rawGbPerVehiclePerMonth = 3.5;
  const estimatedIngestedGigabytesPerMonth = safeVehicles * rawGbPerVehiclePerMonth;

  // Active storage volume across retention period
  const totalStoredTb = (estimatedIngestedGigabytesPerMonth * retentionMonths) / 1024;
  const storageVolumeTerabytesMonthly = Math.round(totalStoredTb * 100) / 100;

  // Storage cost: 8 AZN per TB-month on sovereign NVMe/SSD cluster
  const storageCostMonthlyAzn = storageVolumeTerabytesMonthly * 8.0;

  // AI Pipeline compute tier pricing per vehicle:
  // BASIC: 4 AZN/month
  // ADVANCED_FLEET_AI: 10 AZN/month (vibration, brake, battery machine learning models)
  // ENTERPRISE_MISSION_CRITICAL: 22 AZN/month (real-time sub-10ms collision, V2X, G-Cloud integration)
  const aiCostPerVehicleMap: Record<AiPipelineTier, number> = {
    BASIC_TELEMETRY: 4.0,
    ADVANCED_FLEET_AI: 10.0,
    ENTERPRISE_MISSION_CRITICAL: 22.0,
  };
  const aiComputeProcessingCostMonthlyAzn = safeVehicles * aiCostPerVehicleMap[aiPipelineTier];

  // Redundancy premium multiplier on compute & storage:
  // STANDARD: 0 AZN
  // DUAL_ZONE_ACTIVE_ACTIVE: 25% surcharge
  // G_CLOUD_SOVEREIGN_TIER_IV: 50% surcharge
  const redundancySurchargeRateMap: Record<CloudRedundancyOption, number> = {
    GEO_REDUNDANT_STANDARD: 0.0,
    DUAL_ZONE_ACTIVE_ACTIVE: 0.25,
    G_CLOUD_SOVEREIGN_TIER_IV: 0.50,
  };
  const highAvailabilityRedundancyCostMonthlyAzn =
    (baseMonthlySubscriptionAzn + storageCostMonthlyAzn + aiComputeProcessingCostMonthlyAzn) *
    redundancySurchargeRateMap[redundancyOption];

  const grossMonthlyTotalAzn =
    baseMonthlySubscriptionAzn +
    storageCostMonthlyAzn +
    aiComputeProcessingCostMonthlyAzn +
    highAvailabilityRedundancyCostMonthlyAzn;

  // Government & Municipal public transportation subsidy: 15% discount
  const subsidyDiscountAmountAzn = hasGovernmentSubsidy ? grossMonthlyTotalAzn * 0.15 : 0;
  const netMonthlyTotalAzn = Math.max(0, grossMonthlyTotalAzn - subsidyDiscountAmountAzn);
  const netAnnualTotalAzn = netMonthlyTotalAzn * 12;

  const netMonthlyConverted = convertAzn(netMonthlyTotalAzn, currency);
  const netAnnualConverted = convertAzn(netAnnualTotalAzn, currency);

  const guaranteedSlaUptime =
    redundancyOption === 'G_CLOUD_SOVEREIGN_TIER_IV'
      ? '99.995% (Tier IV Mission-Critical)'
      : redundancyOption === 'DUAL_ZONE_ACTIVE_ACTIVE'
      ? '99.990% (Tier III Active-Active)'
      : '99.980% (Tier III Geo-Redundant)';

  return {
    fleetVehicleCount: safeVehicles,
    retentionMonths,
    aiPipelineTier,
    redundancyOption,
    hasGovernmentSubsidy,
    currency,
    baseMonthlySubscriptionAzn,
    storageVolumeTerabytesMonthly,
    storageCostMonthlyAzn,
    aiComputeProcessingCostMonthlyAzn,
    highAvailabilityRedundancyCostMonthlyAzn,
    grossMonthlyTotalAzn,
    subsidyDiscountAmountAzn,
    netMonthlyTotalAzn,
    netAnnualTotalAzn,
    netMonthlyConverted,
    netAnnualConverted,
    estimatedIngestedGigabytesPerMonth,
    guaranteedSlaUptime,
  };
};

/**
 * 10-Point Sovereign Cloud Security & ISO/IEC 27001 Data Protection Checklist
 */
export interface CloudSecurityChecklistItem {
  id: string;
  order: number;
  titleAz: string;
  titleEn: string;
  category: 'LEGAL_DATA_RESIDENCY' | 'ENCRYPTION_CYBER' | 'ACCESS_CONTROL' | 'DISASTER_RECOVERY';
  legalReference: string;
  descriptionAz: string;
  weight: number;
}

export const CLOUD_SECURITY_CHECKLIST: CloudSecurityChecklistItem[] = [
  {
    id: 'SEC_01_DATA_RESIDENCY',
    order: 1,
    titleAz: 'Milli Suveren Məlumat Rezidentliyi və G-Cloud Uyğunluğu',
    titleEn: 'National Sovereign Data Residency & G-Cloud Compliance',
    category: 'LEGAL_DATA_RESIDENCY',
    legalReference: 'Fərdi məlumatlar haqqında Qanun, Maddə 13',
    descriptionAz: 'Bütün nəqliyyat telemetriyası və sürücü fərdi məlumatlarının yalnız Azərbaycan Respublikası ərazisindəki AzInTelecom məlumat mərkəzlərində saxlanılması təsdiqlənib.',
    weight: 12,
  },
  {
    id: 'SEC_02_AES_256_ENCRYPTION',
    order: 2,
    titleAz: 'İstirahətdə və Hərəkətdə Məlumatların Şifrələnməsi (AES-256 / TLS 1.3)',
    titleEn: 'Data Encryption at Rest and in Transit (AES-256 / TLS 1.3)',
    category: 'ENCRYPTION_CYBER',
    legalReference: 'ISO/IEC 27001:2022 Maddə A.8.24 (Cryptography)',
    descriptionAz: 'NVMe yaddaşlarında saxlanan telemetriya AES-256 şifrələməsi ilə qorunur, V2X və CAN-bus rabitəsi TLS 1.3 və milli kriptoqrafik protokollarla təhlükəsizləşdirilir.',
    weight: 10,
  },
  {
    id: 'SEC_03_SIMA_MFA_AUTH',
    order: 3,
    titleAz: 'SİMA İmza və Çoxfaktorlu İcazə Nəzarəti (MFA / RBAC)',
    titleEn: 'SİMA Digital Signature & Multi-Factor Access Control',
    category: 'ACCESS_CONTROL',
    legalReference: 'Elektron imza və elektron sənəd haqqında Qanun',
    descriptionAz: 'Bulud telemetriya gövdəsinə inzibati daxilolma yalnız SİMA İmza biometrik və aparat açarları (FIDO2) vasitəsilə həyata keçirilir.',
    weight: 10,
  },
  {
    id: 'SEC_04_ANONYMIZATION_PII',
    order: 4,
    titleAz: 'Sürücü Fərdi Məlumatlarının Avtomatik Anonimləşdirilməsi & Maskalanması',
    titleEn: 'Driver PII Pseudonymization and Automated Masking',
    category: 'LEGAL_DATA_RESIDENCY',
    legalReference: 'Fərdi məlumatlar haqqında Qanun, Maddə 9',
    descriptionAz: 'AI maşın öyrənməsi və analitika məqsədilə emal olunan sürət və GPS koordinatlarında sürücünün FİN və şəxsi məlumatları xüsusi heş alqoritmi ilə maskalanır.',
    weight: 10,
  },
  {
    id: 'SEC_05_TIER_IV_REDUNDANCY',
    order: 5,
    titleAz: 'Fiziki Təhlükəsizlik və 2N+1 Ehtiyat İnfrastruktur Standartı',
    titleEn: 'Physical Security & 2N+1 Redundant Infrastructure Standard',
    category: 'DISASTER_RECOVERY',
    legalReference: 'Uptime Institute Tier III / IV Datacenter Standard',
    descriptionAz: 'Server zalında biometrik giriş, qazla yanğınsöndürmə (FM-200), paralel UPS və avtomatik dizel generator sistemləri mövcuddur.',
    weight: 10,
  },
  {
    id: 'SEC_06_SOC_SIEM_MONITORING',
    order: 6,
    titleAz: 'Milli Kiber Təhlükəsizlik Mərkəzi (CERT) və 24/7 SIEM/SOC Monitorinq',
    titleEn: 'National CERT & 24/7 Security Operations Center (SOC) Telemetry',
    category: 'ENCRYPTION_CYBER',
    legalReference: 'Milli Kibertəhlükəsizlik Strategiyası 2023-2027',
    descriptionAz: 'Şəbəkə anomaliyaları, DDoS hücumları və qanunsuz müdaxilə cəhdləri AzInTelecom SOC və Elektron Təhlükəsizlik Xidməti tərəfindən 24/7 real vaxtda təhlil olunur.',
    weight: 10,
  },
  {
    id: 'SEC_07_DISASTER_RECOVERY_RPO_RTO',
    order: 7,
    titleAz: 'Fəlakətdən Bərpa Planı (Disaster Recovery RPO < 1 dəqiqə, RTO < 15 dəqiqə)',
    titleEn: 'Disaster Recovery Plan with RPO < 1 min, RTO < 15 min',
    category: 'DISASTER_RECOVERY',
    legalReference: 'ISO 22301 İş Davamlılığı Standartı',
    descriptionAz: 'Bakı Əsas Mərkəzi ilə Yevlax və Naxçıvan regional qovşaqları arasında sinxron və asinxron güzgü replikasiyası təmin edilib.',
    weight: 10,
  },
  {
    id: 'SEC_08_WORM_IMMUTABLE_LOGS',
    order: 8,
    titleAz: 'WORM (Write Once, Read Many) Dəyişdirilməz Taxoqraf və Hadisə Loqları',
    titleEn: 'WORM Immutable Audit Trail for Tachograph & Collision Logs',
    category: 'ACCESS_CONTROL',
    legalReference: 'Azərbaycan Respublikasının İXM Maddə 326-1',
    descriptionAz: 'Yol hərəkəti qayda pozuntuları və qəza telemetriyası silinmə və dəyişdirilməyə qarşı WORM aparat bloklaması ilə arxivlənir.',
    weight: 10,
  },
  {
    id: 'SEC_09_API_GATEWAY_THROTTLING',
    order: 9,
    titleAz: 'Dövlət İnteqrasiya Şlüzü (ASAN Körpü / Digital Login) və API Rate Limiting',
    titleEn: 'State Integration Gateway (ASAN Bridge) & Zero-Trust API Throttling',
    category: 'ACCESS_CONTROL',
    legalReference: 'Dövlət İnformasiya Ehtiyatları və Sistemlərinin Əsasnaməsi',
    descriptionAz: 'AYNA, BDYP və DGK sistemləri ilə məlumat mübadiləsi mTLSRabbit/REST təhlükəsiz şlüzü və ciddi kvota nəzarəti ilə icra edilir.',
    weight: 9,
  },
  {
    id: 'SEC_10_SUPPLY_CHAIN_AUDIT',
    order: 10,
    titleAz: 'Avadanlıq və Proqram Təminatı Təchizat Zənciri Təhlükəsizlik Auditi',
    titleEn: 'Supply Chain Cyber Audit & Hardware Tamper-Proof Verification',
    category: 'ENCRYPTION_CYBER',
    legalReference: 'Dövlət Proqramı Kiber-gigiyena Standartı',
    descriptionAz: 'Nəqliyyat vasitələrinə quraşdırılan GPS izləyici və telemetriya mikrokontrollerlərinin gizli arxa qapılara (backdoor) qarşı sertifikatlaşdırılması aparılıb.',
    weight: 9,
  },
];

export interface CloudChecklistEvaluation {
  totalScore: number;
  maxScore: number;
  percentage: number;
  isCompliant: boolean;
  complianceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  missingCriticalItems: string[];
}

export const evaluateCloudSecurityChecklist = (checkedIds: string[]): CloudChecklistEvaluation => {
  const maxScore = CLOUD_SECURITY_CHECKLIST.reduce((sum, item) => sum + item.weight, 0);
  let totalScore = 0;
  const missingCriticalItems: string[] = [];

  CLOUD_SECURITY_CHECKLIST.forEach((item) => {
    if (checkedIds.includes(item.id)) {
      totalScore += item.weight;
    } else {
      missingCriticalItems.push(item.titleAz);
    }
  });

  const percentage = Math.round((totalScore / maxScore) * 100);
  const isCompliant = percentage >= 80;

  let complianceGrade: 'A+' | 'A' | 'B' | 'C' | 'F' = 'F';
  if (percentage >= 95) complianceGrade = 'A+';
  else if (percentage >= 85) complianceGrade = 'A';
  else if (percentage >= 75) complianceGrade = 'B';
  else if (percentage >= 60) complianceGrade = 'C';

  return {
    totalScore,
    maxScore,
    percentage,
    isCompliant,
    complianceGrade,
    missingCriticalItems,
  };
};

/**
 * 10-Question Cloud Computing & Transport Data Governance Exam Simulator
 */
export interface CloudExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  legalReference: string;
  options: {
    key: string;
    textAz: string;
    isCorrect: boolean;
  }[];
  explanationAz: string;
}

export const CLOUD_EXAM_QUESTIONS: CloudExamQuestion[] = [
  {
    id: 1,
    questionAz: '"Fərdi məlumatlar haqqında" Azərbaycan Respublikasının Qanununa əsasən, nəqliyyat telemetriya məlumatları hansı ərazidə saxlanılmalıdır?',
    questionEn: 'According to the Law "On Personal Data", where must transport telematics data be stored?',
    legalReference: 'Fərdi məlumatlar haqqında Qanun, Maddə 13',
    options: [
      { key: 'A', textAz: 'İstənilən xarici bulud xidmətində (AWS, Azure, Google Cloud)', isCorrect: false },
      { key: 'B', textAz: 'Yalnız Azərbaycan Respublikasının ərazisində yerləşən milli və suveren məlumat mərkəzlərində', isCorrect: true },
      { key: 'C', textAz: 'Yalnız avtomobilin bort kompüterinin yerli yaddaşında', isCorrect: false },
      { key: 'D', textAz: 'İxtiyari Avropa İttifaqı serverlərində', isCorrect: false },
    ],
    explanationAz: 'Qanunun 13-cü maddəsinə və Hökumət Buludu tələblərinə əsasən dövlət reyestrlərinə inteqrasiya olunan fərdi və hərəkət telemetriya məlumatları ölkə daxilində yerləşən serverlərdə saxlanmalıdır.',
  },
  {
    id: 2,
    questionAz: 'AzInTelecom Hökumət Buludunda (G-Cloud) Tier IV sertifikatlaşdırılmış məlumat mərkəzinin illik fasiləsiz işləmə (uptime) SLA tələbi nə qədərdir?',
    questionEn: 'What is the annual uptime SLA requirement for a Tier IV certified datacenter in AzInTelecom G-Cloud?',
    legalReference: 'Uptime Institute Tier IV Standard & RİNN G-Cloud SLA',
    options: [
      { key: 'A', textAz: '95.000% (illik 18 gün dayanma)', isCorrect: false },
      { key: 'B', textAz: '99.000% (illik 87 saat dayanma)', isCorrect: false },
      { key: 'C', textAz: '99.995% (illik maksimum 26 dəqiqə planlaşdırılmamış fasilə)', isCorrect: true },
      { key: 'D', textAz: '100.000% mütləq dayanmasız (fiziki ehtiyac olmadan)', isCorrect: false },
    ],
    explanationAz: 'Tier IV standartı 99.995% fasiləsizliyi təmin edir və 2N+1 tam müstəqil enerji, rabitə və soyutma yollarını zəruri edir.',
  },
  {
    id: 3,
    questionAz: 'Kommersiya yük və sərnişin nəqliyyatında taxoqraf və sürət telemetriya loqlarının dəyişdirilməsinin qarşısını alan aparat texnologiyası hansıdır?',
    questionEn: 'Which hardware technology prevents alteration of tachograph and speed logs in commercial transport?',
    legalReference: 'İXM Maddə 326-1 & Kiber-gigiyena Standartı',
    options: [
      { key: 'A', textAz: 'WORM (Write Once, Read Many) bloklaması və rəqəmsal zaman möhürü', isCorrect: true },
      { key: 'B', textAz: 'FAT32 fayl sistemi formatı', isCorrect: false },
      { key: 'C', textAz: 'Dövrü avtomatik silinmə skripti', isCorrect: false },
      { key: 'D', textAz: 'Bluetooth naqilsiz paylaşım rejimi', isCorrect: false },
    ],
    explanationAz: 'WORM texnologiyası məlumatın bir dəfə yazıldıqdan sonra heç bir səlahiyyətli şəxs və ya proqram tərəfindən silinə və ya saxtalaşdırıla bilməyəcəyini zəmanət edir.',
  },
  {
    id: 4,
    questionAz: 'Böyük həcmli avtopark telemetriyasını (saniyədə 50,000-dən çox paket) real vaxtda emal etmək üçün hansı paylanmış axın texnologiyasından istifadə edilir?',
    questionEn: 'Which distributed streaming technology is utilized to process high-volume fleet telematics in real time?',
    legalReference: 'AzInTelecom Big Data Memarlığı & Apache Layihələri',
    options: [
      { key: 'A', textAz: 'Əl ilə daxil edilən Excel cədvəli', isCorrect: false },
      { key: 'B', textAz: 'Apache Kafka və Apache Flink paylanmış axın mühərrikləri', isCorrect: true },
      { key: 'C', textAz: 'Statik HTML faylları', isCorrect: false },
      { key: 'D', textAz: 'FTP protokolu ilə gecə yüklənməsi', isCorrect: false },
    ],
    explanationAz: 'Apache Kafka ultra-yüksək ötürücülüklü mesaj növbələri, Apache Flink isə milisaniyəlik hadisə emalı (event-driven stream processing) üçün sənaye standartıdır.',
  },
  {
    id: 5,
    questionAz: 'Avtoparkın süni intellekt (AI) proqnozlaşdırıcı texniki xidmət modelində mühərrik kardan valının FFT vibrasiya amplitudunun təhlükəli həddi nə qədərdir?',
    questionEn: 'What is the critical threshold for FFT vibration amplitude in fleet predictive maintenance AI models?',
    legalReference: 'ISO 10816-3 Maşın Vibrasiyası Tələbləri',
    options: [
      { key: 'A', textAz: '0.1 mm/s-dən az', isCorrect: false },
      { key: 'B', textAz: '1.0 mm/s-dən az', isCorrect: false },
      { key: 'C', textAz: '4.5 mm/s-dən yuxarı kritik vibrasiya səviyyəsi', isCorrect: true },
      { key: 'D', textAz: 'Həmişə 100 mm/s olmalıdır', isCorrect: false },
    ],
    explanationAz: 'ISO 10816 standartına əsasən fırlanan mexanizmlərdə vibrasiya amplitudunun 4.5 mm/s həddini aşması təcili podşipnik və kardan balanslaşdırma xidmətini tələb edir.',
  },
  {
    id: 6,
    questionAz: 'Dövlət orqanları (AYNA, BDYP, FHN) arasında nəqliyyat telemetriyasının təhlükəsiz mübadiləsi hansı milli infrastruktur vasitəsilə təmin olunur?',
    questionEn: 'Which national infrastructure facilitates secure exchange of transport telemetry among state authorities?',
    legalReference: 'Dövlət İnformasiya Sistemlərinin İnteqrasiyası Qaydaları',
    options: [
      { key: 'A', textAz: 'Açıq ictimai Wi-Fi nöqtələri', isCorrect: false },
      { key: 'B', textAz: 'ASAN Körpü (X-Road əsaslı) Dövlət İnformasiya İnteqrasiya Şlüzü', isCorrect: true },
      { key: 'C', textAz: 'Açıq poçt göndərişi', isCorrect: false },
      { key: 'D', textAz: 'Telegram ictimai botları', isCorrect: false },
    ],
    explanationAz: 'ASAN Körpü şifrələnmiş dövlətlərarası məlumat inteqrasiyası şlüzü olub, bütün dövlət qurumları arasında elektron sorğu-cavab standartını icra edir.',
  },
  {
    id: 7,
    questionAz: 'İstirahətdə olan (at-rest) telemetriya məlumatlarının saxlanılmasında hansı şifrələmə alqoritmi məcburidir?',
    questionEn: 'Which encryption algorithm is mandatory for data-at-rest storage of telematics data?',
    legalReference: 'ISO/IEC 27001 & FIPS 140-3 Standartı',
    options: [
      { key: 'A', textAz: 'Sadə Base64 kodlaşdırması', isCorrect: false },
      { key: 'B', textAz: 'Heç bir şifrələmə olmadan açıq mətn', isCorrect: false },
      { key: 'C', textAz: 'AES-256 (Advanced Encryption Standard 256-bit)', isCorrect: true },
      { key: 'D', textAz: 'MD5 heş funksiyası', isCorrect: false },
    ],
    explanationAz: 'AES-256 hərbi və suveren səviyyəli simmetrik şifrələmə standartı olub, Hökumət Buludunda bütün blok və obyekt yaddaşlarında icbari qaydada aktiv edilir.',
  },
  {
    id: 8,
    questionAz: 'Fəlakətdən Bərpa Planında (Disaster Recovery) RPO (Recovery Point Objective) anlayışı nəyi ifadə edir?',
    questionEn: 'What does RPO (Recovery Point Objective) represent in a Disaster Recovery Plan?',
    legalReference: 'ISO 22301 Davamlılıq İdarəetməsi',
    options: [
      { key: 'A', textAz: 'Qəza anında qəbul edilə bilən maksimum məlumat itkisi zaman intervalı', isCorrect: true },
      { key: 'B', textAz: 'Serverin elektrik enerjisinin aylıq dəyəri', isCorrect: false },
      { key: 'C', textAz: 'Avtomobilin mühərrik gücü', isCorrect: false },
      { key: 'D', textAz: 'Kabelin uzunluğu', isCorrect: false },
    ],
    explanationAz: 'RPO qəza baş verdikdə bərpa olunan ən son nüsxə ilə qəza anı arasındakı vaxtdır. AzInTelecom suveren buludunda bu göstərici 1 dəqiqədən az təmin olunur.',
  },
  {
    id: 9,
    questionAz: 'Bulud telemetriya sistemində inzibatçı və operatorların identifikasiyası üçün hansı rəqəmsal şəxsiyyət vasitəsi tələb olunur?',
    questionEn: 'Which digital identity medium is required for authentication of administrators in the transport cloud system?',
    legalReference: 'Elektron İmza Qanunvericiliyi və SİMA Standartı',
    options: [
      { key: 'A', textAz: 'Yalnız asan xatırlanan 4 rəqəmli PİN kod', isCorrect: false },
      { key: 'B', textAz: 'SİMA İmza biometrik və kriptoqrafik rəqəmsal autentifikasiyası', isCorrect: true },
      { key: 'C', textAz: 'İmzalanmamış e-poçt təsdiqi', isCorrect: false },
      { key: 'D', textAz: 'Sosial şəbəkə hesabları ilə daxil olma', isCorrect: false },
    ],
    explanationAz: 'Dövlət əhəmiyyətli informasiya sistemlərinə giriş üçün SİMA rəqəmsal imza və biometrik üz tanıma texnologiyası təhlükəsizliyi təmin edir.',
  },
  {
    id: 10,
    questionAz: 'Yaşıl Enerji və Karbon İzi baxımından müasir məlumat mərkəzinin PUE (Power Usage Effectiveness) əmsalı hansı diapazonda optimal hesab olunur?',
    questionEn: 'In terms of Green Energy and Carbon Footprint, which PUE range is considered optimal for modern datacenters?',
    legalReference: 'Yaşıl Rəqəmsal İqtisadiyyat & COP29 Standartları',
    options: [
      { key: 'A', textAz: '3.0 - 5.0 (həddən artıq yüksək israf)', isCorrect: false },
      { key: 'B', textAz: '1.1 - 1.25 (yüksək enerji səmərəliliyi və ekoloji dizayn)', isCorrect: true },
      { key: 'C', textAz: '0.1 - 0.2 (fiziki qeyri-mümkün)', isCorrect: false },
      { key: 'D', textAz: 'Fərqi yoxdur', isCorrect: false },
    ],
    explanationAz: 'PUE göstəricisi serverlərin sərf etdiyi enerjinin ümumi məlumat mərkəzi enerjisinə nisbətidir. 1.1-1.25 göstəricisi Füzuli və Sumqayıt yaşıl DC-lərdə beynəlxalq standartdır.',
  },
];

export interface CloudExamEvaluationResult {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  scoreGrade: 'ƏLA' | 'YAXŞI' | 'KAFİ' | 'QEYRİ-KAFİ';
  feedbackAz: string;
}

export const evaluateCloudExam = (userAnswers: Record<number, string>): CloudExamEvaluationResult => {
  let correctCount = 0;
  const totalQuestions = CLOUD_EXAM_QUESTIONS.length;

  CLOUD_EXAM_QUESTIONS.forEach((q) => {
    const selectedKey = userAnswers[q.id];
    const correctOption = q.options.find((o) => o.isCorrect);
    if (selectedKey && correctOption && selectedKey === correctOption.key) {
      correctCount += 1;
    }
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = percentage >= 70;

  let scoreGrade: 'ƏLA' | 'YAXŞI' | 'KAFİ' | 'QEYRİ-KAFİ' = 'QEYRİ-KAFİ';
  if (percentage >= 90) scoreGrade = 'ƏLA';
  else if (percentage >= 80) scoreGrade = 'YAXŞI';
  else if (percentage >= 70) scoreGrade = 'KAFİ';

  const feedbackAz = isPassed
    ? `Təbriklər! Siz ${percentage}% nəticə ilə RİNN & "AzInTelecom" Suveren Nəqliyyat Buludu İdarəetmə Sertifikatlaşdırma İmtahanını uğurla keçdiniz.`
    : `Nəticə qeyri-kafidir (${percentage}%). İmtahandan keçid balı 70%-dir. Fərdi məlumatların qorunması və G-Cloud standartlarını nəzərdən keçirin.`;

  return {
    correctCount,
    totalQuestions,
    percentage,
    isPassed,
    scoreGrade,
    feedbackAz,
  };
};

/**
 * Official AZINTELECOM-CLOUD-AZ-2026 Certificate & Verification Engine
 */
export interface CloudTransportCertificate {
  certificateId: string; // e.g. "AZINTELECOM-CLOUD-AZ-2026-0814"
  fleetCompany: string;
  taxPayerIdVoen: string;
  fleetVehicleCount: number;
  assignedCloudZone: CloudZoneId;
  aiPipelineTier: AiPipelineTier;
  redundancyOption: CloudRedundancyOption;
  monthlyStorageVolumeTb: number;
  slaUptimeCommitment: string;
  iso27001ComplianceScore: number;
  issueDateIso: string;
  expiryDateIso: string;
  simaDigitalUid: string;
  sha256VerificationHash: string;
  qrVerificationUrl: string;
  status: 'ACTIVE_VALID' | 'PROBATIONARY_AUDIT' | 'EXPIRED';
}

/**
 * Deterministic SHA-256 hash simulator for official certificates
 */
export const generateSimulatedSha256Checksum = (input: string): string => {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x27d4eb2f;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash1 ^= char;
    hash1 = (hash1 * 0x01000193) >>> 0;
    hash2 = (hash2 * 31 + char) >>> 0;
  }

  const part1 = hash1.toString(16).padStart(8, '0');
  const part2 = hash2.toString(16).padStart(8, '0');
  const part3 = ((hash1 ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((hash1 + hash2) >>> 0).toString(16).padStart(8, '0');
  const part5 = (((hash1 << 5) ^ hash2) >>> 0).toString(16).padStart(8, '0');
  const part6 = (((hash2 << 7) ^ hash1) >>> 0).toString(16).padStart(8, '0');
  const part7 = ((hash1 ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0');
  const part8 = ((hash2 ^ 0xa5a5a5a5) >>> 0).toString(16).padStart(8, '0');

  return `${part1}${part2}${part3}${part4}${part5}${part6}${part7}${part8}`;
};

export const issueCloudTransportCertificate = (
  company: string,
  voen: string,
  vehicles: number,
  zone: CloudZoneId,
  tier: AiPipelineTier,
  redundancy: CloudRedundancyOption,
  checklistScore: number = 95
): CloudTransportCertificate => {
  const safeVehicles = Math.max(1, Math.floor(vehicles || 1));
  const safeVoen = voen.trim() || '2001948271';
  const safeCompany = company.trim() || 'Sovereign Transport Logistics MMC';

  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  const certificateId = `AZINTELECOM-CLOUD-AZ-2026-${randomSeq}`;

  const issueDate = new Date();
  const issueDateIso = issueDate.toISOString().split('T')[0];

  const expiryDate = new Date(issueDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const expiryDateIso = expiryDate.toISOString().split('T')[0];

  const simaUid = `SIMA-AZIN-CLOUD-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;

  const storageTb = Math.round(((safeVehicles * 3.5 * 12) / 1024) * 100) / 100;
  const slaText =
    redundancy === 'G_CLOUD_SOVEREIGN_TIER_IV'
      ? '99.995% SLA (Tier IV Mission Critical)'
      : redundancy === 'DUAL_ZONE_ACTIVE_ACTIVE'
      ? '99.990% SLA (Dual-Zone Active-Active)'
      : '99.980% SLA (Tier III Geo-Redundant)';

  const rawPayload = `${certificateId}|${safeCompany}|${safeVoen}|${safeVehicles}|${zone}|${tier}|${redundancy}|${simaUid}`;
  const sha256VerificationHash = generateSimulatedSha256Checksum(rawPayload);

  const qrVerificationUrl = `https://azintelecom.az/cloud/verify?id=${certificateId}&hash=${sha256VerificationHash.substring(0, 16)}`;

  return {
    certificateId,
    fleetCompany: safeCompany,
    taxPayerIdVoen: safeVoen,
    fleetVehicleCount: safeVehicles,
    assignedCloudZone: zone,
    aiPipelineTier: tier,
    redundancyOption: redundancy,
    monthlyStorageVolumeTb: storageTb,
    slaUptimeCommitment: slaText,
    iso27001ComplianceScore: checklistScore,
    issueDateIso,
    expiryDateIso,
    simaDigitalUid: simaUid,
    sha256VerificationHash,
    qrVerificationUrl,
    status: 'ACTIVE_VALID',
  };
};
