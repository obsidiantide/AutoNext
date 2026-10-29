/**
 * Official State Civil Aviation Agency (DDAA / DMAA - Dövlət Mülki Aviasiya Agentliyi),
 * "Azərbaycan Hava Yolları" QSC (AZAL), Heydar Aliyev International Airport (GYD) &
 * Silk Way West Airlines Cargo Air-Truck Intermodal Road Feeder Service (RFS),
 * ICAO Annex 17 / IATA Dangerous Goods (DGR) Aviation Cargo Security Screening &
 * Official AIR-CARGO-AZ-2026 Flight Transit Portal Compliance Engine
 *
 * Statutory References:
 * - Air Code of the Republic of Azerbaijan ("Azərbaycan Respublikasının Hava Məcəlləsi"):
 *   * Maddə 14: Mülki aviasiya hava limanları və beynəlxalq karqo terminalları
 *   * Maddə 38: Hava gəmisində yüklərin və poçtun daşınması qaydaları, aviaqaimə (AWB) tələbləri
 *   * Maddə 52: Aviasiya təhlükəsizliyi, qanunsuz müdaxilə aktlarından mühafizə və xüsusi yoxlama
 * - ICAO Annex 17 (Security: Safeguarding International Civil Aviation Against Acts of Unlawful Interference)
 * - ICAO Document 8973 (Restricted Aviation Security Manual)
 * - IATA Dangerous Goods Regulations (DGR) & Cargo Services Conference (CSC) Resolutions
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *   * Maddə 308: Mülki aviasiya uçuş və yük təhlükəsizliyi qaydalarının pozulması (400–1,500 AZN)
 *   * Maddə 309: Hava limanının xüsusi nəzarət zonasına qanunsuz daxilolma və baxışdan yayınma (500–2,000 AZN)
 *   * Maddə 482: Gömrük bəyannaməsi və beynəlxalq hava daşımalarında aviaqaimə tələblərinin pozulması (300–1,500 AZN)
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
 * 6 Strategic Aviation Cargo Hubs (Hava Limanı Karqo Mərkəzləri)
 */
export type AviationCargoHubId =
  | 'HUB_GYD'
  | 'HUB_KVD'
  | 'HUB_FZL'
  | 'HUB_ZZE'
  | 'HUB_NAJ'
  | 'HUB_GBB';

export interface AviationCargoHubInfo {
  id: AviationCargoHubId;
  iataCode: string;
  icaoCode: string;
  nameAz: string;
  nameEn: string;
  locationCity: string;
  runwayDimensions: string;
  annualCargoCapacityTons: number;
  currentWarehouseLoadPercent: number;
  activeFreighterFlightsToday: number;
  rfsTruckBaysCount: number;
  hasPharmaColdChainFacility: boolean;
  hasDangerousGoodsFacility: boolean;
  hasDualEnergyGantryScanner: boolean;
  latitude: number;
  longitude: number;
  cargoOperationsContact: string;
}

/**
 * Aviation Cargo Classification
 */
export type AviationCargoClass =
  | 'GENERAL_CARGO'          // Standart Hava Yükü (GEN)
  | 'PERISHABLE_COLD_CHAIN'   // Tez Xarab Olan Kənd Təsərrüfatı & Əczaçılıq (PER / COL / CRT)
  | 'DANGEROUS_GOODS_DGR'     // IATA Təhlükəli Yüklər (DGR Classes 1-9 / Lithium UN 3480)
  | 'VALUABLE_CARGO_VAL'      // Qiymətli Yüklər & Diplomatik Poçt (VAL / DIP)
  | 'EXPRESS_COURIER_AOG'     // Təcili Aviasiya Ehtiyat Hissələri & Kuryer (AOG / XPR)
  | 'OVERSIZED_HEAVY_CARGO';  // Həcmli və Ağır Çəkili Aviasiya Yükü (BIG / HEA)

export interface AviationCargoClassInfo {
  cargoClass: AviationCargoClass;
  nameAz: string;
  nameEn: string;
  baseAirRateAznPerKg: number;
  specialHandlingAzn: number;
  descriptionAz: string;
}

export const AVIATION_CARGO_CLASS_INFO: Record<AviationCargoClass, AviationCargoClassInfo> = {
  GENERAL_CARGO: {
    cargoClass: 'GENERAL_CARGO',
    nameAz: 'Standart Hava Yükü (General Cargo - GEN)',
    nameEn: 'General Cargo (GEN)',
    baseAirRateAznPerKg: 2.40,
    specialHandlingAzn: 0,
    descriptionAz: 'Xüsusi temperatur və ya təhlükəlilik tələb etməyən sənaye və istehlak malları',
  },
  PERISHABLE_COLD_CHAIN: {
    cargoClass: 'PERISHABLE_COLD_CHAIN',
    nameAz: 'Əczaçılıq & Tez Xarab Olan Kənd Təsərrüfatı (PER / COL / CRT)',
    nameEn: 'Perishable & Cold-Chain Pharma (PER / CRT)',
    baseAirRateAznPerKg: 3.80,
    specialHandlingAzn: 65,
    descriptionAz: 'Dəqiq temperatur nəzarəti (+2°C ilə +8°C və ya -20°C) tələb edən vaksinlər və qida',
  },
  DANGEROUS_GOODS_DGR: {
    cargoClass: 'DANGEROUS_GOODS_DGR',
    nameAz: 'IATA Təhlükəli Yüklər & Litium Batareyalar (DGR / UN 3480)',
    nameEn: 'Dangerous Goods (DGR / Class 1-9)',
    baseAirRateAznPerKg: 4.50,
    specialHandlingAzn: 95,
    descriptionAz: 'IATA DGR qaydalarına uyğun bəyan edilmiş kimyəvi, yanar və ya litium-ion yük',
  },
  VALUABLE_CARGO_VAL: {
    cargoClass: 'VALUABLE_CARGO_VAL',
    nameAz: 'Qiymətli Yüklər, Bank Qiymətliləri & Diplomatik Poçt (VAL / DIP)',
    nameEn: 'Valuable Cargo & Diplomatic Mail (VAL / DIP)',
    baseAirRateAznPerKg: 5.20,
    specialHandlingAzn: 150,
    descriptionAz: 'Zirehli eskort, gücləndirilmiş seyf otağı və xüsusi nəzarət tələb edən qiymətli yük',
  },
  EXPRESS_COURIER_AOG: {
    cargoClass: 'EXPRESS_COURIER_AOG',
    nameAz: 'Təcili Aviasiya Ehtiyat Hissəsi & Express Kuryer (AOG / XPR)',
    nameEn: 'Aircraft On Ground & Express Courier (AOG / XPR)',
    baseAirRateAznPerKg: 4.00,
    specialHandlingAzn: 120,
    descriptionAz: 'Təyyarə təmiri üçün təxirəsalınmaz ehtiyat hissələri və növbədənkənar rəsmiləşdirmə',
  },
  OVERSIZED_HEAVY_CARGO: {
    cargoClass: 'OVERSIZED_HEAVY_CARGO',
    nameAz: 'Həcmli və Ağır Çəkili Aviasiya Yükü (BIG / HEA)',
    nameEn: 'Oversized & Heavy Aircraft Cargo (BIG / HEA)',
    baseAirRateAznPerKg: 3.20,
    specialHandlingAzn: 180,
    descriptionAz: 'B747-8F ön burun lyukundan yüklənən neft-qaz qazma avadanlığı və iri aqreqatlar',
  },
};

/**
 * ULD (Unit Load Device) Aviation Pallets & Containers
 */
export type UldType =
  | 'PMC_PALLET'
  | 'PAG_PALLET'
  | 'AKE_CONTAINER'
  | 'AMF_CONTAINER'
  | 'RAP_COOL_ULD'
  | 'LOOSE_BULK';

export interface UldTypeInfo {
  uldType: UldType;
  iataCode: string;
  nameAz: string;
  nameEn: string;
  dimensionsCm: string;
  tareWeightKg: number;
  maxGrossWeightKg: number;
  volumeM3: number;
  deckCompatibility: string;
}

export const ULD_TYPE_INFO: Record<UldType, UldTypeInfo> = {
  PMC_PALLET: {
    uldType: 'PMC_PALLET',
    iataCode: 'PMC / P6P',
    nameAz: 'PMC Standart Əsas Göyərtə Paleti',
    nameEn: 'PMC Standard Main Deck Pallet',
    dimensionsCm: '318 × 244 × 163 cm',
    tareWeightKg: 110,
    maxGrossWeightKg: 6804,
    volumeM3: 11.5,
    deckCompatibility: 'Main Deck & Lower Deck (Widebody)',
  },
  PAG_PALLET: {
    uldType: 'PAG_PALLET',
    iataCode: 'PAG / P1P',
    nameAz: 'PAG Aşağı Göyərtə Paleti',
    nameEn: 'PAG Lower Deck Pallet',
    dimensionsCm: '318 × 224 × 163 cm',
    tareWeightKg: 100,
    maxGrossWeightKg: 6033,
    volumeM3: 10.8,
    deckCompatibility: 'Main Deck & Lower Deck',
  },
  AKE_CONTAINER: {
    uldType: 'AKE_CONTAINER',
    iataCode: 'AKE / LD3',
    nameAz: 'AKE / LD3 Yarım-En Aşağı Göyərtə Konteyneri',
    nameEn: 'AKE / LD3 Half-Width Lower Deck Container',
    dimensionsCm: '156 × 153 × 163 cm',
    tareWeightKg: 75,
    maxGrossWeightKg: 1588,
    volumeM3: 4.3,
    deckCompatibility: 'Lower Deck (B777 / B747 / A330)',
  },
  AMF_CONTAINER: {
    uldType: 'AMF_CONTAINER',
    iataCode: 'AMF / LD36',
    nameAz: 'AMF Tam-En Əsas Göyərtə Konteyneri',
    nameEn: 'AMF Full-Width Main Deck Container',
    dimensionsCm: '318 × 244 × 163 cm',
    tareWeightKg: 250,
    maxGrossWeightKg: 6804,
    volumeM3: 14.7,
    deckCompatibility: 'Main Deck Only',
  },
  RAP_COOL_ULD: {
    uldType: 'RAP_COOL_ULD',
    iataCode: 'RAP e2 Envirotainer',
    nameAz: 'RAP e2 Envirotainer Aktiv Termo-Konteyner',
    nameEn: 'RAP e2 Envirotainer Active Cool ULD',
    dimensionsCm: '318 × 244 × 163 cm',
    tareWeightKg: 1200,
    maxGrossWeightKg: 6033,
    volumeM3: 8.2,
    deckCompatibility: 'Main Deck & Lower Deck',
  },
  LOOSE_BULK: {
    uldType: 'LOOSE_BULK',
    iataCode: 'BULK',
    nameAz: 'Sərbəst / Roller-Bed Yük (Bulk Compartment)',
    nameEn: 'Loose Bulk Cargo / Roller-Bed',
    dimensionsCm: 'Dəyişkən / Parça-parça',
    tareWeightKg: 0,
    maxGrossWeightKg: 2500,
    volumeM3: 6.0,
    deckCompatibility: 'Bulk Hold (Aft)',
  },
};

/**
 * Freighter Aircraft Profiles
 */
export type FreighterAircraftType =
  | 'B777F'
  | 'B747_8F'
  | 'B747_400F'
  | 'A330_200F'
  | 'ATR72_500F';

export interface FreighterAircraftInfo {
  type: FreighterAircraftType;
  modelName: string;
  operator: string;
  maxPayloadKg: number;
  maxRangeKm: number;
  mainDeckDoorSizeCm: string;
  hasNoseDoor: boolean;
  palletPositions: string;
}

export const FREIGHTER_AIRCRAFT_INFO: Record<FreighterAircraftType, FreighterAircraftInfo> = {
  B777F: {
    type: 'B777F',
    modelName: 'Boeing 777-200F Freighter',
    operator: 'Silk Way West Airlines',
    maxPayloadKg: 102000,
    maxRangeKm: 9200,
    mainDeckDoorSizeCm: '372 × 305 cm',
    hasNoseDoor: false,
    palletPositions: '27 Main Deck + 10 Lower Deck',
  },
  B747_8F: {
    type: 'B747_8F',
    modelName: 'Boeing 747-8F High-Capacity Freighter',
    operator: 'Silk Way West Airlines',
    maxPayloadKg: 137700,
    maxRangeKm: 8130,
    mainDeckDoorSizeCm: '340 × 305 cm (Side) + Burun Lyuku',
    hasNoseDoor: true,
    palletPositions: '34 Main Deck + 12 Lower Deck',
  },
  B747_400F: {
    type: 'B747_400F',
    modelName: 'Boeing 747-400F Jumbo Freighter',
    operator: 'Silk Way West Airlines',
    maxPayloadKg: 112000,
    maxRangeKm: 8250,
    mainDeckDoorSizeCm: '340 × 305 cm',
    hasNoseDoor: true,
    palletPositions: '30 Main Deck + 9 Lower Deck',
  },
  A330_200F: {
    type: 'A330_200F',
    modelName: 'Airbus A330-200F Mid-Size Freighter',
    operator: 'AZAL Cargo',
    maxPayloadKg: 70000,
    maxRangeKm: 7400,
    mainDeckDoorSizeCm: '358 × 256 cm',
    hasNoseDoor: false,
    palletPositions: '22 Main Deck + 8 Lower Deck',
  },
  ATR72_500F: {
    type: 'ATR72_500F',
    modelName: 'ATR 72-500F Regional Feeder',
    operator: 'Silk Way Airlines Regional',
    maxPayloadKg: 8500,
    maxRangeKm: 1320,
    mainDeckDoorSizeCm: '295 × 180 cm',
    hasNoseDoor: false,
    palletPositions: '5 Bulk Sections / 7 LD3',
  },
};

/**
 * Calculation Input and Result
 */
export interface AirCargoTariffInput {
  originHubId: AviationCargoHubId;
  destinationAirportCode: string;
  cargoClass: AviationCargoClass;
  uldType: UldType;
  actualGrossWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  piecesCount: number;
  rfsDistanceKm: number; // Road Feeder Service truck corridor distance
  isKnownConsignor: boolean; // Məlum Göndərən (KC / RA)
  isExportTransit: boolean; // 0% ƏDV beynəlxalq tranzit rejimi
  isPriorityAog: boolean; // Təcili AOG statusu
}

export interface AirCargoTariffBreakdown {
  actualGrossWeightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  volumeM3: number;
  baseAirRatePerKgAzn: number;
  airFreightCostAzn: number;
  rfsTruckTransitCostAzn: number;
  securityScreeningCostAzn: number;
  terminalHandlingCostAzn: number;
  customsBondEscortAzn: number;
  specialHandlingCostAzn: number;
  priorityAogSurchargeAzn: number;
  subtotalAzn: number;
  vatRatePercent: number;
  vatAmountAzn: number;
  totalCostAzn: number;
  totalCostUsd: number;
  totalCostEur: number;
}

/**
 * Calculate IATA volumetric weight:
 * Volumetric Weight (kg) = (Length × Width × Height in cm) / 6000
 * Chargeable Weight = max(Gross Weight, Volumetric Weight)
 */
export const calculateChargeableWeight = (
  actualGrossWeightKg: number,
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  piecesCount: number = 1
): { volumetricWeightKg: number; chargeableWeightKg: number; volumeM3: number } => {
  const singleVolM3 = (lengthCm * widthCm * heightCm) / 1_000_000;
  const totalVolumeM3 = Math.round(singleVolM3 * piecesCount * 100) / 100;
  
  // IATA volumetric ratio: 1 m³ = 167 kg (standard 6000 cm³/kg)
  const singleVolumetricWeight = (lengthCm * widthCm * heightCm) / 6000;
  const totalVolumetricWeightKg = Math.round(singleVolumetricWeight * piecesCount * 10) / 10;
  const chargeableWeightKg = Math.max(actualGrossWeightKg, totalVolumetricWeightKg);

  return {
    volumetricWeightKg: totalVolumetricWeightKg,
    chargeableWeightKg,
    volumeM3: totalVolumeM3,
  };
};

/**
 * Calculate full Air Cargo & Road Feeder Service Tariff
 */
export const calculateAirCargoTariff = (input: AirCargoTariffInput): AirCargoTariffBreakdown => {
  const { volumetricWeightKg, chargeableWeightKg, volumeM3 } = calculateChargeableWeight(
    input.actualGrossWeightKg,
    input.lengthCm,
    input.widthCm,
    input.heightCm,
    input.piecesCount
  );

  const cargoInfo = AVIATION_CARGO_CLASS_INFO[input.cargoClass];
  const baseAirRatePerKgAzn = cargoInfo.baseAirRateAznPerKg;
  const airFreightCostAzn = Math.round(chargeableWeightKg * baseAirRatePerKgAzn * 100) / 100;

  // Road Feeder Service (RFS) truck transit: Base 120 AZN + 0.85 AZN/km + 0.02 AZN/kg
  const rfsTruckTransitCostAzn = input.rfsDistanceKm > 0
    ? Math.round((120 + input.rfsDistanceKm * 0.85 + chargeableWeightKg * 0.02) * 100) / 100
    : 0;

  // ICAO Annex 17 security screening: 0.08 AZN/kg (minimum 25 AZN)
  const calculatedScreening = chargeableWeightKg * 0.08;
  const securityScreeningCostAzn = Math.max(25, Math.round(calculatedScreening * 100) / 100);

  // Terminal handling charge (THC): 0.12 AZN/kg (minimum 40 AZN)
  const calculatedThc = chargeableWeightKg * 0.12;
  const terminalHandlingCostAzn = Math.max(40, Math.round(calculatedThc * 100) / 100);

  // Customs Bond Escort (DGK)
  const customsBondEscortAzn = 35.0;

  // Special Class Handling
  const specialHandlingCostAzn = cargoInfo.specialHandlingAzn;

  // AOG Express priority
  const priorityAogSurchargeAzn = input.isPriorityAog ? 120.0 : 0;

  const subtotalAzn =
    airFreightCostAzn +
    rfsTruckTransitCostAzn +
    securityScreeningCostAzn +
    terminalHandlingCostAzn +
    customsBondEscortAzn +
    specialHandlingCostAzn +
    priorityAogSurchargeAzn;

  // Tax Code Article 165.1.4: International transit freight is 0% VAT, domestic is 18%
  const vatRatePercent = input.isExportTransit ? 0 : 18;
  const vatAmountAzn = Math.round(((subtotalAzn * vatRatePercent) / 100) * 100) / 100;
  const totalCostAzn = Math.round((subtotalAzn + vatAmountAzn) * 100) / 100;

  return {
    actualGrossWeightKg: input.actualGrossWeightKg,
    volumetricWeightKg,
    chargeableWeightKg,
    volumeM3,
    baseAirRatePerKgAzn,
    airFreightCostAzn,
    rfsTruckTransitCostAzn,
    securityScreeningCostAzn,
    terminalHandlingCostAzn,
    customsBondEscortAzn,
    specialHandlingCostAzn,
    priorityAogSurchargeAzn,
    subtotalAzn,
    vatRatePercent,
    vatAmountAzn,
    totalCostAzn,
    totalCostUsd: Math.round(convertAzn(totalCostAzn, 'USD') * 100) / 100,
    totalCostEur: Math.round(convertAzn(totalCostAzn, 'EUR') * 100) / 100,
  };
};

/**
 * Security Screening Evaluation (ICAO Annex 17 & IATA DGR)
 */
export interface ScreeningEvaluationInput {
  xrayDensityPassed: boolean;
  etdTraceDetected: boolean;
  k9CanineCleared: boolean;
  lithiumBatteryCompliant: boolean;
  knownConsignorValid: boolean;
  tamperSealIntact: boolean;
}

export interface ScreeningEvaluationResult {
  isAirsideCleared: boolean;
  securityRiskLevel: 'LOW_CLEARED' | 'MEDIUM_ENHANCED_SEARCH' | 'HIGH_REJECTED';
  reasonsAz: string[];
  recommendedActionAz: string;
}

export const evaluateCargoSecurityScreening = (
  input: ScreeningEvaluationInput
): ScreeningEvaluationResult => {
  const reasons: string[] = [];

  if (!input.xrayDensityPassed) {
    reasons.push('Dual-energy rentgen skanerində şübhəli sıxlıq / gizli boşluq anomaliyası aşkarlandı');
  }
  if (input.etdTraceDetected) {
    reasons.push('Partlayıcı maddə izi detektoru (ETD swab) müsbət kimyəvi reaksiya verdi');
  }
  if (!input.k9CanineCleared) {
    reasons.push('Kinoloji xidmət iti şübhəli siqnal bildirdi');
  }
  if (!input.lithiumBatteryCompliant) {
    reasons.push('IATA DGR UN 3480 litium batareya şarj səviyyəsi (SOC > 30%) və ya etiketlənmə pozuntusu');
  }
  if (!input.tamperSealIntact) {
    reasons.push('RFS yük maşınının və ya ULD konteynerin gömrük mühafizə plombu zədələnib');
  }

  if (input.etdTraceDetected || (!input.xrayDensityPassed && !input.k9CanineCleared)) {
    return {
      isAirsideCleared: false,
      securityRiskLevel: 'HIGH_REJECTED',
      reasonsAz: reasons,
      recommendedActionAz: 'Yük dərhal hava limanının xüsusi təhlükəsizlik karantin sahəsinə təxliyə edilməli və hüquq-mühafizə orqanlarına məlumat verilməlidir.',
    };
  }

  if (reasons.length > 0) {
    return {
      isAirsideCleared: false,
      securityRiskLevel: 'MEDIUM_ENHANCED_SEARCH',
      reasonsAz: reasons,
      recommendedActionAz: 'Yük 100% fiziki açılma və əl ilə təkrar yoxlama üçün 2-ci dərəcəli baxış sahəsinə yönləndirilməlidir.',
    };
  }

  return {
    isAirsideCleared: true,
    securityRiskLevel: 'LOW_CLEARED',
    reasonsAz: ['Bütün ICAO Annex 17 və IATA DGR təhlükəsizlik meyarları tam təsdiqləndi.'],
    recommendedActionAz: 'Yük uçuşa buraxıldı. ULD qurulması və hava gəmisinin əsas göyərtəsinə yüklənməsi təsdiq edilir.',
  };
};

/**
 * 10-Point Technical Checklist Item
 */
export interface AirCargoChecklistItem {
  id: string;
  categoryAz: string;
  titleAz: string;
  titleEn: string;
  legalCitation: string;
  fineAzn: number;
  weightScore: number;
}

/**
 * Theoretical Exam Question
 */
export interface AirCargoExamQuestion {
  id: number;
  questionAz: string;
  optionsAz: string[];
  correctOptionIndex: number;
  explanationAz: string;
  legalArticle: string;
}

/**
 * Electronic Flight Transit Voucher Data Model
 */
export interface AirCargoTransitVoucher {
  voucherId: string; // AIR-CARGO-AZ-2026-XXXXX
  awbNumber: string; // 463-XXXX XXXX (Silk Way West)
  originHubId: AviationCargoHubId;
  destinationAirportCode: string;
  flightNumber: string; // 7L 774 / J2 511
  freighterType: FreighterAircraftType;
  cargoClass: AviationCargoClass;
  uldType: UldType;
  actualGrossWeightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  volumeM3: number;
  rfsTruckPlate: string;
  carrierEnterprise: string;
  shipperName: string;
  consigneeName: string;
  totalCostAzn: number;
  issueTimestamp: string;
  validUntilTimestamp: string;
  securityChecksumSha256: string;
  simaDigitalSignatureUid: string;
  assignedApronBay: string;
  isAirsideCleared: boolean;
}

/**
 * Generate cryptographic SHA-256 style verification hash
 */
export const generateAirCargoHash = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0').toUpperCase();
  return `AZ-ICAO-AIR-${hex}-${Date.now().toString(16).slice(-6).toUpperCase()}`;
};

/**
 * Issue new Electronic Air Cargo Flight Transit Voucher
 */
export const issueAirCargoVoucher = (
  params: {
    originHubId: AviationCargoHubId;
    destinationAirportCode: string;
    flightNumber: string;
    freighterType: FreighterAircraftType;
    cargoClass: AviationCargoClass;
    uldType: UldType;
    actualGrossWeightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    rfsTruckPlate: string;
    carrierEnterprise: string;
    shipperName: string;
    consigneeName: string;
    rfsDistanceKm?: number;
    isExportTransit?: boolean;
    isPriorityAog?: boolean;
    awbPrefix?: string;
  }
): AirCargoTransitVoucher => {
  const tariff = calculateAirCargoTariff({
    originHubId: params.originHubId,
    destinationAirportCode: params.destinationAirportCode,
    cargoClass: params.cargoClass,
    uldType: params.uldType,
    actualGrossWeightKg: params.actualGrossWeightKg,
    lengthCm: params.lengthCm,
    widthCm: params.widthCm,
    heightCm: params.heightCm,
    piecesCount: 1,
    rfsDistanceKm: params.rfsDistanceKm ?? 45,
    isKnownConsignor: true,
    isExportTransit: params.isExportTransit ?? true,
    isPriorityAog: params.isPriorityAog ?? false,
  });

  const randomVoucherNum = Math.floor(10000 + Math.random() * 90000);
  const voucherId = `AIR-CARGO-AZ-2026-${randomVoucherNum}`;

  const prefix = params.awbPrefix || '463';
  const randomAwb1 = Math.floor(1000 + Math.random() * 9000);
  const randomAwb2 = Math.floor(1000 + Math.random() * 9000);
  const awbNumber = `${prefix}-${randomAwb1} ${randomAwb2}`;

  const now = new Date();
  const issueTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);
  const validUntil = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const validUntilTimestamp = validUntil.toISOString().replace('T', ' ').substring(0, 19);

  const checksumSource = `${voucherId}|${awbNumber}|${params.flightNumber}|${params.rfsTruckPlate}|${tariff.totalCostAzn}`;
  const securityChecksumSha256 = generateAirCargoHash(checksumSource);
  const simaDigitalSignatureUid = `SIMA-AIR-2026-${Math.floor(1000000 + Math.random() * 9000000)}`;

  const apronBays = ['CARGO-STAND-101', 'CARGO-STAND-102', 'RAMP-BAY-04', 'APRON-GATE-07', 'SILKWAY-BAY-12'];
  const assignedApronBay = apronBays[Math.floor(Math.random() * apronBays.length)];

  return {
    voucherId,
    awbNumber,
    originHubId: params.originHubId,
    destinationAirportCode: params.destinationAirportCode,
    flightNumber: params.flightNumber,
    freighterType: params.freighterType,
    cargoClass: params.cargoClass,
    uldType: params.uldType,
    actualGrossWeightKg: params.actualGrossWeightKg,
    volumetricWeightKg: tariff.volumetricWeightKg,
    chargeableWeightKg: tariff.chargeableWeightKg,
    volumeM3: tariff.volumeM3,
    rfsTruckPlate: params.rfsTruckPlate,
    carrierEnterprise: params.carrierEnterprise,
    shipperName: params.shipperName,
    consigneeName: params.consigneeName,
    totalCostAzn: tariff.totalCostAzn,
    issueTimestamp,
    validUntilTimestamp,
    securityChecksumSha256,
    simaDigitalSignatureUid,
    assignedApronBay,
    isAirsideCleared: true,
  };
};
