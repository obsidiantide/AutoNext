/**
 * Official Ministry of Emergency Situations (FHN - Fövqəladə Hallar Nazirliyi),
 * State Fire Control Service (Dövlət Yanğın Nəzarəti Xidməti - DYNX) & BDYP
 * Emergency Firefighting, Technical Rescue & Vehicle Fire Safety Compliance Engine.
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Fire Safety" ("Yanğın təhlükəsizliyi haqqında" AR Qanunu № 313-IQ)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (YHQ Annex 1 Clause 7.7 - Mandatory Fire Extinguisher Specifications)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (YHQ Article 52 - Fire Hydrant & Station Protection Buffer Zone)
 * - Code of Administrative Offences (İXM Article 342.1 - 50 AZN Fire Extinguisher Violation, Article 346 - 40 AZN Fire Hydrant Parking Fine)
 * - European Standard EN 3-7 (Portable fire extinguishers characteristics and test requirements)
 */

import { Currency } from '../types/vehicle';

export type VehicleFireCategory = 
  | 'm1_passenger' 
  | 'm2_minibus' 
  | 'm3_bus' 
  | 'n1_light_truck' 
  | 'n2_n3_heavy_truck' 
  | 'adr_tanker';

export type ExtinguisherType = 
  | 'op2_powder' 
  | 'op4_powder' 
  | 'op6_powder' 
  | 'co2_gas' 
  | 'foam_ab';

export type SafetyGrade = 
  | 'tier_1_certified' 
  | 'tier_2_minor_defects' 
  | 'tier_3_failed_critical';

export type PassPhase = 'pull' | 'aim' | 'squeeze' | 'sweep' | 'extinguished';

export interface FireSafetyItem {
  id: string;
  title: string;
  description: string;
  legalRef: string;
  points: number;
  category: 'extinguisher' | 'isolation' | 'interior' | 'evacuation' | 'thermal';
}

export interface ExtinguisherRequirement {
  category: VehicleFireCategory;
  label: string;
  minCylinders: number;
  minTotalCapacityKg: number;
  primaryType: ExtinguisherType;
  typeLabel: string;
  description: string;
  annualFeeAZN: number;
  fineIfMissingAZN: number;
}

export interface FireExtinguisherCheckResult {
  isValid: boolean;
  pressureBar: number;
  pressureStatus: 'green' | 'red_low' | 'red_high';
  monthsSinceInspection: number;
  daysUntilExpiry: number;
  status: 'valid' | 'expiring_soon' | 'expired' | 'depressurized';
  statusLabel: string;
  fineRiskAZN: number;
  inspectionFeeAZN: number;
  inspectionFeeUSD: number;
  inspectionFeeEUR: number;
}

export interface HydrantProximityResult {
  distanceMeters: number;
  isCompliant: boolean;
  fineAZN: number;
  towingRisk: boolean;
  legalRef: string;
  warningMessage: string;
}

export interface FireStation {
  id: string;
  name: string;
  division: string;
  city: string;
  address: string;
  phone: string;
  hotline: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  capacity: number;
  activeBrigades: number;
  averageResponseMinutes: number;
  chiefOfficer: string;
  operatingHours: string;
}

export interface FireSafetyCertificate {
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  vehicleModel: string;
  ownerName: string;
  ownerFin: string;
  category: VehicleFireCategory;
  extinguisherType: ExtinguisherType;
  extinguisherSerial: string;
  cylinderWeightKg: number;
  pressureBar: number;
  score: number;
  grade: SafetyGrade;
  gradeLabel: string;
  stationId: string;
  stationName: string;
  inspectorName: string;
  inspectorBadge: string;
  sha256Checksum: string;
  simaSignatureUid: string;
  qrVerificationUrl: string;
  notes: string;
}

export interface FireExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  legalBasis: string;
}

export const EXTINGUISHER_REQUIREMENTS: Record<VehicleFireCategory, ExtinguisherRequirement> = {
  m1_passenger: {
    category: 'm1_passenger',
    label: 'M1 Minik Avtomobili (Kupe, Sedan, Hetçbek, SUV)',
    minCylinders: 1,
    minTotalCapacityKg: 2,
    primaryType: 'op2_powder',
    typeLabel: 'OP-2 (2 kq Quru Toz)',
    description: 'YHQ Əlavə 1 Bənd 7.7: Ən azı 1 ədəd 2 kq tutumlu manometrli tozlu yanğınsöndürən.',
    annualFeeAZN: 20,
    fineIfMissingAZN: 50,
  },
  m2_minibus: {
    category: 'm2_minibus',
    label: 'M2 Mikroavtobus (≤5 ton, 8-dən çox sərnişin)',
    minCylinders: 2,
    minTotalCapacityKg: 4,
    primaryType: 'op2_powder',
    typeLabel: '2x OP-2 və ya 1x OP-4 (4 kq)',
    description: 'Biri sürücü kabinəsində, digəri sərnişin salonunda dərhal əlçatan olmalıdır.',
    annualFeeAZN: 35,
    fineIfMissingAZN: 50,
  },
  m3_bus: {
    category: 'm3_bus',
    label: 'M3 Böyük Sərnişin Avtobusu (>5 ton)',
    minCylinders: 2,
    minTotalCapacityKg: 8,
    primaryType: 'op4_powder',
    typeLabel: '2x OP-4 (Cəmi 8 kq Quru Toz)',
    description: 'Kabina və mühərrik bölməsinə yaxın salon çıxışında daimi təzyiqli balonlar.',
    annualFeeAZN: 50,
    fineIfMissingAZN: 100,
  },
  n1_light_truck: {
    category: 'n1_light_truck',
    label: 'N1 Yüngül Yük Maşını (≤3.5 ton, Pikap/Furqon)',
    minCylinders: 1,
    minTotalCapacityKg: 2,
    primaryType: 'op2_powder',
    typeLabel: 'OP-2 (2 kq Quru Toz)',
    description: 'Kabində etibarlı bərkidilmiş, 1.2–1.5 MPa manometr göstəricili balon.',
    annualFeeAZN: 25,
    fineIfMissingAZN: 50,
  },
  n2_n3_heavy_truck: {
    category: 'n2_n3_heavy_truck',
    label: 'N2 / N3 Ağır Yük Nəqliyyatı (>3.5 ton, TIR / Özüboşaldan)',
    minCylinders: 1,
    minTotalCapacityKg: 6,
    primaryType: 'op6_powder',
    typeLabel: 'OP-6 (6 kq Quru Toz)',
    description: 'Kabin arxasında və ya şassi qutusunda zərbəyə davamlı kranştreyndə.',
    annualFeeAZN: 45,
    fineIfMissingAZN: 100,
  },
  adr_tanker: {
    category: 'adr_tanker',
    label: 'ADR Yanacaq Sisterni / Təhlükəli Yük Nəqliyyatı',
    minCylinders: 2,
    minTotalCapacityKg: 12,
    primaryType: 'op6_powder',
    typeLabel: '2x OP-6 (Cəmi 12 kq ABC Quru Toz)',
    description: 'ADR 8.1.4: Təkər/mühərrik yanğını üçün 6 kq + yük sisterni üçün 6 kq balon.',
    annualFeeAZN: 70,
    fineIfMissingAZN: 150,
  },
};

export const DEFAULT_EXCHANGE_RATES = {
  USD: 1.70,
  EUR: 1.85,
};

/**
 * Returns the statutory extinguisher requirement for the vehicle fire category.
 */
export function getExtinguisherRequirement(category: VehicleFireCategory): ExtinguisherRequirement {
  return EXTINGUISHER_REQUIREMENTS[category] || EXTINGUISHER_REQUIREMENTS.m1_passenger;
}

/**
 * Evaluates the safety audit checklist score and determines official certification grade.
 */
export function calculateFireSafetyScore(
  checkedIds: string[],
  items: FireSafetyItem[]
): {
  score: number;
  maxScore: number;
  percentage: number;
  grade: SafetyGrade;
  gradeLabel: string;
  isCertified: boolean;
} {
  const maxScore = items.reduce((acc, item) => acc + item.points, 0);
  const checkedItems = items.filter(item => checkedIds.includes(item.id));
  const score = checkedItems.reduce((acc, item) => acc + item.points, 0);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  let grade: SafetyGrade = 'tier_3_failed_critical';
  let gradeLabel = 'İstismara Qadağa (Yüksək Yanğın Riski)';
  let isCertified = false;

  if (percentage >= 85) {
    grade = 'tier_1_certified';
    gradeLabel = 'Dövlət Sertifikatına Tam Uyğundur (1-ci Dərəcə)';
    isCertified = true;
  } else if (percentage >= 65) {
    grade = 'tier_2_minor_defects';
    gradeLabel = 'Şərti Uyğunluq (Xırda Qüsurların Aradan Qaldırılması Tələb Olunur)';
    isCertified = false;
  }

  return {
    score,
    maxScore,
    percentage,
    grade,
    gradeLabel,
    isCertified,
  };
}

/**
 * Evaluates the status of a vehicle fire extinguisher based on age and internal pressure.
 */
export function evaluateExtinguisher(
  monthsSinceInspection: number,
  pressureBar: number,
  category: VehicleFireCategory,
  exchangeRates: { USD: number; EUR: number } = DEFAULT_EXCHANGE_RATES
): FireExtinguisherCheckResult {
  const req = getExtinguisherRequirement(category);
  const maxMonthsValid = 12; // Annual inspection required by DYNX
  const daysUntilExpiry = Math.max(0, Math.round((maxMonthsValid - monthsSinceInspection) * 30.4));

  let pressureStatus: 'green' | 'red_low' | 'red_high' = 'green';
  if (pressureBar < 1.1) {
    pressureStatus = 'red_low';
  } else if (pressureBar > 1.6) {
    pressureStatus = 'red_high';
  }

  let status: 'valid' | 'expiring_soon' | 'expired' | 'depressurized' = 'valid';
  let statusLabel = 'Yararlıdır (Təzyiq Normada, Tarix Aktivdir)';
  let fineRiskAZN = 0;
  let isValid = true;

  if (pressureStatus !== 'green') {
    status = 'depressurized';
    statusLabel = 'Təzyiq Qüsuru (Manometr Qırmızı Zonadadır - Boşalmışdır)';
    fineRiskAZN = req.fineIfMissingAZN;
    isValid = false;
  } else if (monthsSinceInspection > maxMonthsValid) {
    status = 'expired';
    statusLabel = 'Müddəti Bitib (DYNX İllik Təftişi Keçməyib)';
    fineRiskAZN = req.fineIfMissingAZN;
    isValid = false;
  } else if (daysUntilExpiry <= 30) {
    status = 'expiring_soon';
    statusLabel = 'Müddətin Bitməsinə 30 Gündən Az Qalıb';
    isValid = true;
  }

  const inspectionFeeAZN = req.annualFeeAZN;
  const inspectionFeeUSD = Number((inspectionFeeAZN / exchangeRates.USD).toFixed(2));
  const inspectionFeeEUR = Number((inspectionFeeAZN / exchangeRates.EUR).toFixed(2));

  return {
    isValid,
    pressureBar,
    pressureStatus,
    monthsSinceInspection,
    daysUntilExpiry,
    status,
    statusLabel,
    fineRiskAZN,
    inspectionFeeAZN,
    inspectionFeeUSD,
    inspectionFeeEUR,
  };
}

/**
 * Validates distance to fire hydrant under YHQ Article 52 & İXM Article 346.
 */
export function checkHydrantProximity(distanceMeters: number): HydrantProximityResult {
  const MIN_DISTANCE_METERS = 5.0;
  const isCompliant = distanceMeters >= MIN_DISTANCE_METERS;

  if (isCompliant) {
    return {
      distanceMeters,
      isCompliant: true,
      fineAZN: 0,
      towingRisk: false,
      legalRef: 'YHQ Maddə 52 / İXM Maddə 346',
      warningMessage: 'Qanuni məsafə təmin olunub (5 metrdən artıqdır). Yanğınsöndürmə maşınlarının çıxışına maneə yoxdur.',
    };
  }

  return {
    distanceMeters,
    isCompliant: false,
    fineAZN: 40,
    towingRisk: true,
    legalRef: 'YHQ Maddə 52 / İXM Maddə 346 & Maddə 96',
    warningMessage: `Qadağan olunmuş zona! Yanğın hidrantına ${distanceMeters.toFixed(1)}m məsafədə saxlamaq 40 AZN cərimə və dərhal evakuasiya ilə nəticələnir.`,
  };
}

/**
 * Converts AZN amount to target currency.
 */
export function convertCurrency(
  amountAZN: number,
  currency: Currency = 'AZN',
  exchangeRates: { USD: number; EUR: number } = DEFAULT_EXCHANGE_RATES
): number {
  if (currency === 'USD') {
    return Number((amountAZN / exchangeRates.USD).toFixed(2));
  }
  if (currency === 'EUR') {
    return Number((amountAZN / exchangeRates.EUR).toFixed(2));
  }
  return amountAZN;
}

/**
 * Formats monetary amounts with currency symbol.
 */
export function formatAZN(amount: number, currency: Currency = 'AZN'): string {
  const converted = convertCurrency(amount, currency);
  switch (currency) {
    case 'USD':
      return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    case 'EUR':
      return `€${converted.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    case 'AZN':
    default:
      return `${converted.toLocaleString('az-AZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₼`;
  }
}

/**
 * Generates an official FHN-DYNX Electronic Fire Safety Certificate.
 */
export function generateFireSafetyCertificate(params: {
  vehiclePlate: string;
  vehicleModel: string;
  ownerName: string;
  ownerFin: string;
  category: VehicleFireCategory;
  extinguisherType: ExtinguisherType;
  extinguisherSerial: string;
  cylinderWeightKg: number;
  pressureBar: number;
  score: number;
  stationId: string;
  stationName: string;
  inspectorName: string;
  inspectorBadge: string;
  notes?: string;
}): FireSafetyCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `FHN-DYNX-2026-${randomSuffix}`;
  
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 1);
  const expiryDate = expiry.toISOString().split('T')[0];

  let grade: SafetyGrade = 'tier_1_certified';
  let gradeLabel = 'Dövlət Sertifikatına Tam Uyğundur (1-ci Dərəcə)';

  if (params.score < 65) {
    grade = 'tier_3_failed_critical';
    gradeLabel = 'İstismara Qadağa (Yüksək Yanğın Riski)';
  } else if (params.score < 85) {
    grade = 'tier_2_minor_defects';
    gradeLabel = 'Şərti Uyğunluq (Texniki Qüsurların Aradan Qaldırılması Şərtilə)';
  }

  const rawString = `${certificateNumber}|${params.vehiclePlate}|${params.ownerFin}|${issueDate}|${params.score}`;
  // Simple deterministic pseudohash for verification simulation
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    hash = ((hash << 5) - hash) + rawString.charCodeAt(i);
    hash |= 0;
  }
  const sha256Checksum = `sha256:fhn_${Math.abs(hash).toString(16).padStart(8, '0')}${certificateNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const simaSignatureUid = `SIMA-FHN-${Math.abs(hash).toString(36).toUpperCase()}-2026`;
  const qrVerificationUrl = `https://fhn.gov.az/e-certificate/verify?doc=${certificateNumber}&sig=${simaSignatureUid}`;

  return {
    certificateNumber,
    issueDate,
    expiryDate,
    vehiclePlate: params.vehiclePlate.toUpperCase().trim(),
    vehicleModel: params.vehicleModel,
    ownerName: params.ownerName,
    ownerFin: params.ownerFin.toUpperCase().trim(),
    category: params.category,
    extinguisherType: params.extinguisherType,
    extinguisherSerial: params.extinguisherSerial,
    cylinderWeightKg: params.cylinderWeightKg,
    pressureBar: params.pressureBar,
    score: params.score,
    grade,
    gradeLabel,
    stationId: params.stationId,
    stationName: params.stationName,
    inspectorName: params.inspectorName,
    inspectorBadge: params.inspectorBadge,
    sha256Checksum,
    simaSignatureUid,
    qrVerificationUrl,
    notes: params.notes || 'Yanğından Mühafizə Qaydalarına uyğun olaraq 12 ay müddətində etibarlıdır.',
  };
}
