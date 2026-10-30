/**
 * Official Azerbaijan Space Agency (Azercosmos / RİNN),
 * Azerbaijan Land Transport Agency (AYNA) & State Traffic Police (BDYP),
 * Satellite GNSS Fleet Telemetry, Space-Based AIS (S-AIS) & High-Precision Real-Time Kinematic (RTK) Geo-Fencing Navigation Portal
 * (Azərkosmos Peyk Donanma Telemetriyası & S-AIS / RTK Rəqəmsal Portalı)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Space Activities" ("Kosmik fəaliyyət haqqında" Azərbaycan Respublikasının Qanunu, Maddə 8, 14, 21):
 *   * Milli peyk rabitəsi və kosmik telemetriya infrastrukturundan dövlət və kommersiya nəqliyyatında istifadə qaydaları
 * - International Telecommunication Union (ITU) Radio Regulations (RR Article 5, Article 21 - Satellite Frequency Bands)
 * - UN Outer Space Treaty (1967) & Space Object Registration Convention
 * - Cabinet of Ministers Resolution on Satellite Navigation & Digital Tachograph Fleet Telematics:
 *   * Ağırçəkili, təhlükəli yük daşıyan (ADR) və beynəlxalq sərnişin daşıma nəqliyyat vasitələrinin peyk naviqasiyası və qlobal mövqetmə (GNSS) tələbləri
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 27)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 326-1, 339)
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
 * 6 Strategic Ground Earth Stations (Yerüstü Peyk İdarəetmə və İzləmə Mərkəzləri)
 */
export type GroundStationId =
  | 'STATION_BAKU_PRIMARY'
  | 'STATION_SHAMAKHI_BACKUP'
  | 'STATION_NAKHCHIVAN_RELAY'
  | 'STATION_GANJA_UPLINK'
  | 'STATION_QABALA_TRACKING'
  | 'STATION_FUZULI_GATEWAY';

export interface GroundStationInfo {
  id: GroundStationId;
  nameAz: string;
  nameEn: string;
  regionAz: string;
  coordinates: {
    lat: number;
    lng: number;
    elevationMeters: number;
    dmsString: string;
  };
  dishAntennaDiameterMeters: number;
  frequencyBands: string[]; // e.g. ['C-Band (3.4-4.2 GHz)', 'Ku-Band (10.7-12.75 GHz)', 'Ka-Band (17.7-21.2 GHz)']
  uplinkEIRPdBW: number;    // Effective Isotropic Radiated Power in dBW
  trackingAntennaGOverT: number; // Figure of merit G/T in dB/K
  telemetryLatencyMs: number;
  redundancyTier: 'TIER_IV_MISSION_CRITICAL' | 'TIER_III_CARRIER_GRADE' | 'TIER_II_REGIONAL_RELAY';
  emergencyHotline: string;
  status: 'ONLINE_ACTIVE' | 'CALIBRATION_STANDBY' | 'MAINTENANCE_WINDOW';
  descriptionAz: string;
}

/**
 * Satellite Constellation & Orbital Assets (Peyk Qruplaşması və Kosmik Aktivlər)
 */
export type SatelliteAssetId =
  | 'AZERSPACE_1'
  | 'AZERSPACE_2'
  | 'AZERSKY_2_EO'
  | 'MULTI_GNSS_L1_L5'
  | 'SPACE_BASED_AIS_CONSTELLATION';

export interface SatelliteAssetInfo {
  id: SatelliteAssetId;
  satelliteName: string;
  orbitalSlot: string;      // e.g. "46.0° East (Geostationary GEO)", "45.0° East", "Sun-Synchronous LEO 580 km"
  orbitType: 'GEO' | 'LEO' | 'MEO';
  launchYear: number;
  transponderCount: number;
  coverageFootprintAz: string;
  positioningAccuracy: string;
  polarization: 'Linear (H/V)' | 'Linear (V)' | 'Circular (RHCP/LHCP)' | 'Circular (RHCP)';
  frequencyRange: string;
  primaryMissionAz: string;
}

export const SATELLITE_ASSETS: Record<SatelliteAssetId, SatelliteAssetInfo> = {
  AZERSPACE_1: {
    id: 'AZERSPACE_1',
    satelliteName: 'Azerspace-1 (Africasat-1A)',
    orbitalSlot: '46.0° East (GEO)',
    orbitType: 'GEO',
    launchYear: 2013,
    transponderCount: 36,
    coverageFootprintAz: 'Azərbaycan, Mərkəzi Asiya, Avropa, Yaxın Şərq və Afrika',
    positioningAccuracy: 'Transponder Telemetriya & Genişzolaqlı Məlumat Ötürülməsi',
    polarization: 'Linear (H/V)',
    frequencyRange: 'C-Band / Ku-Band',
    primaryMissionAz: 'Milli peyk rabitəsi, dövlət nəqliyyat telemetriyası və transponder icarəsi',
  },
  AZERSPACE_2: {
    id: 'AZERSPACE_2',
    satelliteName: 'Azerspace-2 (Intelsat 38)',
    orbitalSlot: '45.0° East (GEO)',
    orbitType: 'GEO',
    launchYear: 2018,
    transponderCount: 35,
    coverageFootprintAz: 'Avropa, Mərkəzi və Cənub-Qərbi Asiya, Sub-Saxara Afrika',
    positioningAccuracy: 'Yüksək etibarlı DVB-S2X / IP Donanma Şlüzü',
    polarization: 'Linear (H/V)',
    frequencyRange: 'Ku-Band (11.45 - 12.75 GHz)',
    primaryMissionAz: 'Yüksək təhlükəsizlikli donanma İP rabitəsi və ehtiyat dövlət telemetriyası',
  },
  AZERSKY_2_EO: {
    id: 'AZERSKY_2_EO',
    satelliteName: 'Azersky-2 (Yüksək Dəqiqlikli Optik Müşahidə)',
    orbitalSlot: 'LEO 530 km (Günəş-Sinxron Polar)',
    orbitType: 'LEO',
    launchYear: 2024,
    transponderCount: 4,
    coverageFootprintAz: 'Azərbaycan sərhəd zolaqları, beynəlxalq nəqliyyat dəhlizləri və Xəzər dənizi',
    positioningAccuracy: '0.5 metr multi-spektral yerüstü təsvir dəqiqliyi',
    polarization: 'Circular (RHCP/LHCP)',
    frequencyRange: 'X-Band Downlink (8.0-8.4 GHz)',
    primaryMissionAz: 'Nəqliyyat infrastrukturu, multimodal dəhlizlər və quru sərhədlərinin peyk monitorinqi',
  },
  MULTI_GNSS_L1_L5: {
    id: 'MULTI_GNSS_L1_L5',
    satelliteName: 'Multi-Constellation GNSS (GPS L1/L5 + Galileo E1/E5a + GLONASS)',
    orbitalSlot: 'MEO ~20,200 km (24-32 peyk qrupu)',
    orbitType: 'MEO',
    launchYear: 2026,
    transponderCount: 72,
    coverageFootprintAz: 'Qlobal və regional 3D fəza koordinatları',
    positioningAccuracy: 'Dual-Frequency L1/L5: < 1.0 m (RTK ilə < 0.02 m)',
    polarization: 'Circular (RHCP)',
    frequencyRange: 'L-Band (1176.45 - 1575.42 MHz)',
    primaryMissionAz: 'Avtonom və kommersiya avtonəqliyyat donanmasının yüksək dəqiqlikli naviqasiyası',
  },
  SPACE_BASED_AIS_CONSTELLATION: {
    id: 'SPACE_BASED_AIS_CONSTELLATION',
    satelliteName: 'Space-Based AIS (S-AIS Orbital Constellation)',
    orbitalSlot: 'LEO 650 km Qütb Orbiti',
    orbitType: 'LEO',
    launchYear: 2025,
    transponderCount: 16,
    coverageFootprintAz: 'Xəzər hövzəsi və açıq beynəlxalq dəniz marşrutları',
    positioningAccuracy: 'Kosmik AIS Mesaj Dekodlaşdırılması (< 60 saniyə yenilənmə)',
    polarization: 'Linear (V)',
    frequencyRange: 'VHF Maritime (161.975 MHz / 162.025 MHz)',
    primaryMissionAz: 'Xəzərdə üzən gəmilərin və trans-Xəzər ticarət gəmilərinin qlobal peyk izlənməsi',
  },
};

/**
 * RTK (Real-Time Kinematic) Positioning Accuracy Modes
 */
export type RtkFixMode = 'AUTONOMOUS_GNSS' | 'DGPS_CODE' | 'RTK_FLOAT' | 'RTK_FIXED_CENTIMETER';

export interface RtkFixTelemetry {
  fixMode: RtkFixMode;
  horizontalAccuracyMeters: number;
  verticalAccuracyMeters: number;
  visibleSatellitesCount: number;
  pdop: number; // Position Dilution of Precision
  hdop: number; // Horizontal Dilution of Precision
  correctionAgeSeconds: number;
  ntripCasterStatus: 'CONNECTED_AUTHENTICATED' | 'CONNECTING' | 'CORRECTION_DROPPED';
  isSafeForAutonomousLevel4: boolean;
  statusBadgeAz: string;
}

export const evaluateRtkFixTelemetry = (
  satellitesTracked: number,
  correctionAgeSec: number,
  snrAverageDbHz: number,
  ntripConnected: boolean
): RtkFixTelemetry => {
  if (!ntripConnected || correctionAgeSec > 30 || satellitesTracked < 6 || snrAverageDbHz < 26) {
    return {
      fixMode: 'AUTONOMOUS_GNSS',
      horizontalAccuracyMeters: 2.85,
      verticalAccuracyMeters: 4.10,
      visibleSatellitesCount: satellitesTracked,
      pdop: 2.9,
      hdop: 1.8,
      correctionAgeSeconds: correctionAgeSec,
      ntripCasterStatus: 'CORRECTION_DROPPED',
      isSafeForAutonomousLevel4: false,
      statusBadgeAz: 'Standart Avtonom GNSS (2.8m Dəqiqlik - Qeyri-Dəqiq)',
    };
  }

  if (correctionAgeSec > 10 || satellitesTracked < 10 || snrAverageDbHz < 33) {
    return {
      fixMode: 'DGPS_CODE',
      horizontalAccuracyMeters: 0.75,
      verticalAccuracyMeters: 1.20,
      visibleSatellitesCount: satellitesTracked,
      pdop: 2.1,
      hdop: 1.2,
      correctionAgeSeconds: correctionAgeSec,
      ntripCasterStatus: 'CONNECTED_AUTHENTICATED',
      isSafeForAutonomousLevel4: false,
      statusBadgeAz: 'DGPS Differensial Rejim (0.75m Dəqiqlik)',
    };
  }

  if (satellitesTracked < 14 || correctionAgeSec > 3 || snrAverageDbHz < 38) {
    return {
      fixMode: 'RTK_FLOAT',
      horizontalAccuracyMeters: 0.18,
      verticalAccuracyMeters: 0.28,
      visibleSatellitesCount: satellitesTracked,
      pdop: 1.5,
      hdop: 0.8,
      correctionAgeSeconds: correctionAgeSec,
      ntripCasterStatus: 'CONNECTED_AUTHENTICATED',
      isSafeForAutonomousLevel4: false,
      statusBadgeAz: 'RTK Float Fazası (18 sm Dəqiqlik - Yaxınlaşır)',
    };
  }

  // RTK Fixed Centimeter Level
  return {
    fixMode: 'RTK_FIXED_CENTIMETER',
    horizontalAccuracyMeters: 0.018, // 1.8 cm
    verticalAccuracyMeters: 0.025,   // 2.5 cm
    visibleSatellitesCount: satellitesTracked,
    pdop: 1.05,
    hdop: 0.65,
    correctionAgeSeconds: correctionAgeSec,
    ntripCasterStatus: 'CONNECTED_AUTHENTICATED',
    isSafeForAutonomousLevel4: true,
    statusBadgeAz: 'RTK Fixed Santimetr Rejimi (1.8 sm Dəqiqlik - Yüksək Təhlükəsiz)',
  };
};

/**
 * GNSS Jamming & Spoofing Defense Telemetry
 */
export type JammingThreatLevel = 'NOMINAL_SAFE' | 'INTERFERENCE_CAUTION' | 'ACTIVE_JAMMING_ALERT' | 'CRITICAL_SPOOFING_DETECTED';

export interface JammingTelemetryResult {
  threatLevel: JammingThreatLevel;
  carrierToNoiseRatioDbHz: number;
  agcSurgePercentage: number; // Automatic Gain Control anomaly
  pseudorangeClockDriftNs: number;
  antiJammingCrpaFilterActive: boolean;
  imuDeadReckoningEngaged: boolean;
  statusBadgeAz: string;
  recommendedActionAz: string;
}

export const evaluateJammingSpoofing = (
  cNoDbHz: number,
  agcAttenuationPct: number,
  clockDriftNs: number
): JammingTelemetryResult => {
  // If clock drift is anomalous (> 80 ns) and C/N0 is abnormally high or stable, spoofing detected
  if (clockDriftNs > 85 && cNoDbHz > 47) {
    return {
      threatLevel: 'CRITICAL_SPOOFING_DETECTED',
      carrierToNoiseRatioDbHz: cNoDbHz,
      agcSurgePercentage: agcAttenuationPct,
      pseudorangeClockDriftNs: clockDriftNs,
      antiJammingCrpaFilterActive: true,
      imuDeadReckoningEngaged: true,
      statusBadgeAz: 'KRİTİK GNSS SPOOFİNG XƏBƏRDARLIĞI (Yalançı Peyk Siqnalı)',
      recommendedActionAz: 'Peyk koordinatlarını dərhal bloklayın, IMU/Təkər İnertial naviqasiyasına keçin və BDYP/Azərkosmos mərkəzinə həyəcan siqnalı ötürün.',
    };
  }

  // If C/N0 drops drastically (< 28 dB-Hz) and AGC attenuates sharply
  if (cNoDbHz < 28 || agcAttenuationPct > 70) {
    return {
      threatLevel: 'ACTIVE_JAMMING_ALERT',
      carrierToNoiseRatioDbHz: cNoDbHz,
      agcSurgePercentage: agcAttenuationPct,
      pseudorangeClockDriftNs: clockDriftNs,
      antiJammingCrpaFilterActive: true,
      imuDeadReckoningEngaged: true,
      statusBadgeAz: 'AKTİV GNSS JAMMİNG (Elektron Maneə və Siqnal Boğulması)',
      recommendedActionAz: 'CRPA adaptiv şüa sıxlaşdırma filtrini işə salın, Dead-Reckoning sensor füzyonuna keçin və təhlükəsiz zonaya daxil olun.',
    };
  }

  if (cNoDbHz < 36 || agcAttenuationPct > 35) {
    return {
      threatLevel: 'INTERFERENCE_CAUTION',
      carrierToNoiseRatioDbHz: cNoDbHz,
      agcSurgePercentage: agcAttenuationPct,
      pseudorangeClockDriftNs: clockDriftNs,
      antiJammingCrpaFilterActive: false,
      imuDeadReckoningEngaged: false,
      statusBadgeAz: 'Elektromaqnit İnterferensiya Xəbərdarlığı (C/N0 zəifləyir)',
      recommendedActionAz: 'L5 və E5a qorunan aeronaviqasiya tezliklərinə keçid edin, siqnal keyfiyyətini izləyin.',
    };
  }

  return {
    threatLevel: 'NOMINAL_SAFE',
    carrierToNoiseRatioDbHz: cNoDbHz,
    agcSurgePercentage: agcAttenuationPct,
    pseudorangeClockDriftNs: clockDriftNs,
    antiJammingCrpaFilterActive: false,
    imuDeadReckoningEngaged: false,
    statusBadgeAz: 'Siqnal Təmiz və Nominal (Maksimal Təhlükəsizlik)',
    recommendedActionAz: 'Peyk naviqasiyası tam ştat rejimində işləyir, heç bir xarici elektron maneə müşahidə edilmir.',
  };
};

/**
 * Commercial Fleet Preset
 */
export type FleetVehicleCategory =
  | 'HEAVY_FREIGHT_TIR'
  | 'ADR_HAZMAT_TANKER'
  | 'INTERCITY_PASSENGER_BUS'
  | 'CASH_IN_TRANSIT_ARMORED'
  | 'CASPIAN_CARGO_FEEDER_VESSEL';

export interface FleetVehiclePreset {
  category: FleetVehicleCategory;
  categoryNameAz: string;
  defaultVehiclePlate: string;
  defaultVinOrImo: string;
  operatorCompanyAz: string;
  requiredUpdateIntervalSec: number;
  requiresRtkCentimeter: boolean;
  requiresSpaceBasedAis: boolean;
  requiresDualSimSatelliteBackup: boolean;
  monthlyBandwidthQuotaMb: number;
}

export const FLEET_VEHICLE_PRESETS: Record<FleetVehicleCategory, FleetVehiclePreset> = {
  HEAVY_FREIGHT_TIR: {
    category: 'HEAVY_FREIGHT_TIR',
    categoryNameAz: 'Beynəlxalq TIR və Ağır Yük Avtopoezdi (TIR-EPD / CMR)',
    defaultVehiclePlate: '99-ZA-841',
    defaultVinOrImo: 'VIN: VF624GPA7KC881920',
    operatorCompanyAz: 'AzLogistics Global Transit QSC',
    requiredUpdateIntervalSec: 10,
    requiresRtkCentimeter: false,
    requiresSpaceBasedAis: false,
    requiresDualSimSatelliteBackup: true,
    monthlyBandwidthQuotaMb: 150,
  },
  ADR_HAZMAT_TANKER: {
    category: 'ADR_HAZMAT_TANKER',
    categoryNameAz: 'Təhlükəli Yük (ADR Class 3 Yanacaq və Kimyəvi Tanker)',
    defaultVehiclePlate: '10-TH-902',
    defaultVinOrImo: 'VIN: WMA06XZZ5MP123498',
    operatorCompanyAz: 'SOCAR Petroleum QSC & Caspian Gas Fleet',
    requiredUpdateIntervalSec: 5,
    requiresRtkCentimeter: true,
    requiresSpaceBasedAis: false,
    requiresDualSimSatelliteBackup: true,
    monthlyBandwidthQuotaMb: 300,
  },
  INTERCITY_PASSENGER_BUS: {
    category: 'INTERCITY_PASSENGER_BUS',
    categoryNameAz: 'Şəhərlərarası Böyük Tutumlu Sərnişin Avtobusu (AYNA)',
    defaultVehiclePlate: '90-JU-554',
    defaultVinOrImo: 'VIN: NMB4182901L882144',
    operatorCompanyAz: 'BakuBus MMC / Şəhərlərarası Ekspress',
    requiredUpdateIntervalSec: 5,
    requiresRtkCentimeter: false,
    requiresSpaceBasedAis: false,
    requiresDualSimSatelliteBackup: true,
    monthlyBandwidthQuotaMb: 200,
  },
  CASH_IN_TRANSIT_ARMORED: {
    category: 'CASH_IN_TRANSIT_ARMORED',
    categoryNameAz: 'Bank İnkasator və Xüsusi Qiymətli Yük Zirehli Avtomobili',
    defaultVehiclePlate: '77-BB-007',
    defaultVinOrImo: 'VIN: WDB9066571S901844',
    operatorCompanyAz: 'Mərkəzi Bank & Dövlət İnkasasiya Xidməti',
    requiredUpdateIntervalSec: 2,
    requiresRtkCentimeter: true,
    requiresSpaceBasedAis: false,
    requiresDualSimSatelliteBackup: true,
    monthlyBandwidthQuotaMb: 500,
  },
  CASPIAN_CARGO_FEEDER_VESSEL: {
    category: 'CASPIAN_CARGO_FEEDER_VESSEL',
    categoryNameAz: 'Xəzər Dəniz Ro-Pax və Konteyner Gəmisi (S-AIS)',
    defaultVehiclePlate: 'IMO 9821450',
    defaultVinOrImo: 'MMSI: 423048000 / IMO: 9821450 ("Barda" Ro-Pax)',
    operatorCompanyAz: 'Azərbaycan Xəzər Dəniz Gəmiçiliyi (ASCO)',
    requiredUpdateIntervalSec: 30,
    requiresRtkCentimeter: false,
    requiresSpaceBasedAis: true,
    requiresDualSimSatelliteBackup: true,
    monthlyBandwidthQuotaMb: 1000,
  },
};

/**
 * Statutory Satellite Transponder Lease & Telematics Tariff Breakdown
 */
export interface SatelliteTariffBreakdown {
  fleetSizeUnits: number;
  category: FleetVehicleCategory;
  serviceDurationMonths: number;
  baseTelematicsFeeAzn: number;
  rtkCentimeterCorrectionFeeAzn: number;
  spaceBasedAisSatellitePingFeeAzn: number;
  azerspaceBackupLinkFeeAzn: number;
  geofenceRealtimeAlertFeeAzn: number;
  subtotalAzn: number;
  volumeDiscountAzn: number;
  stateRegulatoryDutyAzn: number;
  totalFeeAzn: number;
  currency: Currency;
  totalFeeConverted: number;
}

export const calculateSatelliteFleetTariff = (
  fleetSizeUnits: number,
  category: FleetVehicleCategory,
  serviceDurationMonths: number,
  includeRtkCorrection: boolean,
  includeSpaceBasedAis: boolean,
  includeAzerspaceLink: boolean,
  includeGeofenceSla: boolean,
  currency: Currency = 'AZN'
): SatelliteTariffBreakdown => {
  const units = Math.max(1, Math.min(250, fleetSizeUnits));
  const months = Math.max(1, Math.min(36, serviceDurationMonths));

  // Base monthly telematics per vehicle: 25 AZN
  const baseMonthlyPerUnit = 25;
  const baseTelematicsFeeAzn = units * months * baseMonthlyPerUnit;

  // RTK correction per unit: 35 AZN / month
  const rtkCentimeterCorrectionFeeAzn = includeRtkCorrection ? units * months * 35 : 0;

  // Space-based AIS per unit (maritime): 50 AZN / month
  const spaceBasedAisSatellitePingFeeAzn = includeSpaceBasedAis ? units * months * 50 : 0;

  // Azerspace direct satellite uplink/telemetry backup: 20 AZN / month
  const azerspaceBackupLinkFeeAzn = includeAzerspaceLink ? units * months * 20 : 0;

  // 24/7 Geofencing & instant police/AYNA corridor breach SLA: 10 AZN / month
  const geofenceRealtimeAlertFeeAzn = includeGeofenceSla ? units * months * 10 : 0;

  const subtotalAzn =
    baseTelematicsFeeAzn +
    rtkCentimeterCorrectionFeeAzn +
    spaceBasedAisSatellitePingFeeAzn +
    azerspaceBackupLinkFeeAzn +
    geofenceRealtimeAlertFeeAzn;

  // Volume discount: 10+ units = 5%, 25+ units = 10%, 50+ units = 15%
  let volumeDiscountPct = 0;
  if (units >= 50) {
    volumeDiscountPct = 0.15;
  } else if (units >= 25) {
    volumeDiscountPct = 0.10;
  } else if (units >= 10) {
    volumeDiscountPct = 0.05;
  }
  const volumeDiscountAzn = Math.round(subtotalAzn * volumeDiscountPct);

  // Statutory state registration fee: 30 AZN flat + 5 AZN per unit
  const stateRegulatoryDutyAzn = 30 + units * 5;

  const totalFeeAzn = Math.max(0, subtotalAzn - volumeDiscountAzn + stateRegulatoryDutyAzn);
  const totalFeeConverted = convertAzn(totalFeeAzn, currency);

  return {
    fleetSizeUnits: units,
    category,
    serviceDurationMonths: months,
    baseTelematicsFeeAzn,
    rtkCentimeterCorrectionFeeAzn,
    spaceBasedAisSatellitePingFeeAzn,
    azerspaceBackupLinkFeeAzn,
    geofenceRealtimeAlertFeeAzn,
    subtotalAzn,
    volumeDiscountAzn,
    stateRegulatoryDutyAzn,
    totalFeeAzn,
    currency,
    totalFeeConverted,
  };
};

/**
 * 10-Point Space Communications & GNSS Cyber-Resilience Checklist
 */
export interface SpaceChecklistItem {
  id: string;
  titleAz: string;
  category: 'ANTENNA_RF' | 'SECURITY_CYBER' | 'PROTOCOL_NTRIP' | 'FAILSAFE_IMU';
  statutoryBasisAz: string;
  descriptionAz: string;
  isMandatory: boolean;
}

export interface SpaceChecklistEvaluation {
  totalItems: number;
  completedItemsCount: number;
  mandatoryFailedCount: number;
  complianceScorePercent: number;
  isEligibleForPermit: boolean;
  verdictAz: string;
}

export const evaluateSpaceChecklist = (
  checklistItems: SpaceChecklistItem[],
  checkedMap: Record<string, boolean>
): SpaceChecklistEvaluation => {
  const totalItems = checklistItems.length;
  let completedItemsCount = 0;
  let mandatoryFailedCount = 0;

  for (const item of checklistItems) {
    if (checkedMap[item.id]) {
      completedItemsCount++;
    } else if (item.isMandatory) {
      mandatoryFailedCount++;
    }
  }

  const complianceScorePercent = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;
  const isEligibleForPermit = mandatoryFailedCount === 0 && complianceScorePercent >= 80;

  let verdictAz = '';
  if (isEligibleForPermit) {
    verdictAz = 'TAM UYĞUNDUR: Nəqliyyat vasitəsi Azərkosmos Peyk Telemetriyası və Yüksək Dəqiqlikli GNSS/RTK standartlarına cavab verir.';
  } else if (mandatoryFailedCount > 0) {
    verdictAz = `MƏHDUDİYYƏTLİ: ${mandatoryFailedCount} məcburi təhlükəsizlik/kiberdayanıqlıq bəndi təmin edilməyib. İstismara icazə verilmir.`;
  } else {
    verdictAz = `KAFİ DEYİL: Uyğunluq dərəcəsi ${complianceScorePercent}% (minimum 80% tələb olunur).`;
  }

  return {
    totalItems,
    completedItemsCount,
    mandatoryFailedCount,
    complianceScorePercent,
    isEligibleForPermit,
    verdictAz,
  };
};

/**
 * 10-Question Space Law & Satellite Navigation Examination Simulator
 */
export interface SpaceExamQuestion {
  id: number;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
}

export interface SpaceExamResult {
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercent: number;
  isPassed: boolean;
  certificateGrade: 'EXCELLENT' | 'GOOD' | 'FAILED';
  statusSummaryAz: string;
}

export const evaluateSpaceExam = (
  questions: SpaceExamQuestion[],
  answersMap: Record<number, number>
): SpaceExamResult => {
  const totalQuestions = questions.length;
  let correctAnswersCount = 0;

  questions.forEach(q => {
    if (answersMap[q.id] === q.correctOptionIndex) {
      correctAnswersCount++;
    }
  });

  const scorePercent = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;
  const isPassed = correctAnswersCount >= 8; // 8 out of 10 to pass (80%)

  let certificateGrade: 'EXCELLENT' | 'GOOD' | 'FAILED' = 'FAILED';
  let statusSummaryAz = '';

  if (scorePercent >= 90) {
    certificateGrade = 'EXCELLENT';
    statusSummaryAz = 'ƏLA NƏTİCƏ: Kosmik telemetriya, GNSS tezlikləri və peyk hüququ üzrə sertifikatlaşdırma uğurla başa çatdı.';
  } else if (isPassed) {
    certificateGrade = 'GOOD';
    statusSummaryAz = 'MÜVƏFFƏQİYYƏTLİ: İmtahan standartları ödənildi. Sertifikat verilməsinə təsdiq verildi.';
  } else {
    certificateGrade = 'FAILED';
    statusSummaryAz = `QEYRİ-KAFİ: Düzgün cavab sayı: ${correctAnswersCount}/${totalQuestions} (Minimum keçid: 8/10). Təkrar imtahan tələb olunur.`;
  }

  return {
    totalQuestions,
    correctAnswersCount,
    scorePercent,
    isPassed,
    certificateGrade,
    statusSummaryAz,
  };
};

/**
 * Official Azercosmos & AYNA Electronic Satellite Fleet Telematics Certificate
 */
export interface SatelliteFleetCertificate {
  certificateId: string; // e.g. "AZERCOSMOS-SAT-AZ-2026-94812"
  issueDate: string;
  validUntil: string;
  vehiclePlate: string;
  vinOrImo: string;
  companyNameAz: string;
  vehicleCategory: FleetVehicleCategory;
  primaryGroundStation: GroundStationId;
  allocatedSatelliteAsset: SatelliteAssetId;
  rtkFixCapability: RtkFixMode;
  spaceBasedAisStatus: 'ENABLED_ACTIVE' | 'NOT_APPLICABLE';
  antiJammingCrpaShield: boolean;
  sha256Digest: string;
  simaUid: string;
  status: 'OFFICIALLY_VERIFIED' | 'REVOKED' | 'EXPIRED';
}

/**
 * Simple deterministic SHA-256 mock hash
 */
export const generateDeterministicHash = (seed: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `0x${hex}e92b8c4d11a87e5b3f09a12c8d76e4fa83c510b2`;
};

export const issueSatelliteFleetCertificate = (
  plate: string,
  vinOrImo: string,
  companyName: string,
  category: FleetVehicleCategory,
  groundStation: GroundStationId,
  satelliteAsset: SatelliteAssetId,
  rtkCapability: RtkFixMode,
  spaceAisActive: boolean,
  antiJamming: boolean
): SatelliteFleetCertificate => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const certId = `AZERCOSMOS-SAT-AZ-2026-${randomNum}`;
  const now = new Date();
  const issueDate = now.toISOString().slice(0, 10);
  const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const validUntil = expiry.toISOString().slice(0, 10);

  const hashSeed = `${certId}:${plate}:${vinOrImo}:${companyName}:${satelliteAsset}:${issueDate}`;
  const sha256Digest = generateDeterministicHash(hashSeed);
  const simaUid = `SIMA-AZ-SAT-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    certificateId: certId,
    issueDate,
    validUntil,
    vehiclePlate: plate.trim().toUpperCase(),
    vinOrImo: vinOrImo.trim().toUpperCase(),
    companyNameAz: companyName.trim(),
    vehicleCategory: category,
    primaryGroundStation: groundStation,
    allocatedSatelliteAsset: satelliteAsset,
    rtkFixCapability: rtkCapability,
    spaceBasedAisStatus: spaceAisActive ? 'ENABLED_ACTIVE' : 'NOT_APPLICABLE',
    antiJammingCrpaShield: antiJamming,
    sha256Digest,
    simaUid,
    status: 'OFFICIALLY_VERIFIED',
  };
};
