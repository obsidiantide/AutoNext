export type VehiclePowerType = 'ice_combustion' | 'electric_motor';

export type MopedCategory =
  | 'moped_light'
  | 'moped_standard'
  | 'electric_scooter'
  | 'light_motorcycle'
  | 'standard_motorcycle';

export type CourierPlatform =
  | 'wolt'
  | 'bolt_food'
  | 'express_166'
  | 'yango_delivery'
  | 'independent_courier'
  | 'personal_use';

export type HelmetCertification =
  | 'unece_22_06'
  | 'unece_22_05'
  | 'dot_fmvss_218'
  | 'non_certified_novelty';

export type ChinstrapType =
  | 'double_d_ring'
  | 'micrometric_ratchet'
  | 'quick_release'
  | 'broken_missing';

export interface MopedSpecInput {
  powerType: VehiclePowerType;
  engineDisplacementCc: number;
  electricPowerKw: number;
  maxSpeedKmh: number;
  ownerAge: number;
  courierPlatform: CourierPlatform;
  helmetCert: HelmetCertification;
  chinStrap: ChinstrapType;
  hasVisorEyeProtection: boolean;
  hasReflectiveVest: boolean;
  hasDeliveryBoxBracket: boolean;
  deliveryBoxOverhangMeters: number;
  isPassengerPresent: boolean;
  passengerHasHelmet: boolean;
  selectedCurrency: 'AZN' | 'USD' | 'EUR';
}

export interface PotentialViolation {
  code: string;
  article: string;
  penaltyAzn: number;
  description: string;
  severe: boolean;
}

export interface MopedComplianceResult {
  requiredCategory: 'A1' | 'A';
  minimumAgeRequired: number;
  isAgeCompliant: boolean;
  isRegistrationMandatory: boolean;
  helmetCompliant: boolean;
  helmetScore: number;
  courierSafetyCompliant: boolean;
  overallRoadLegal: boolean;
  plateIssuanceFeeAzn: number;
  texpasportFeeAzn: number;
  inspectionFeeAzn: number;
  compulsoryInsuranceEstimateAzn: number;
  totalStateDutiesAzn: number;
  totalDutiesConverted: number;
  potentialViolations: PotentialViolation[];
  totalFineRiskAzn: number;
}

export interface MopedRegistrationRecord {
  id: string;
  plateNumber: string;
  frameVin: string;
  engineSerial: string;
  ownerFullName: string;
  ownerFin: string;
  brandModel: string;
  category: MopedCategory;
  powerType: VehiclePowerType;
  engineDisplacementCc?: number;
  electricPowerKw?: number;
  maxSpeedKmh: number;
  courierPlatform: CourierPlatform;
  registrationCertificateNumber: string;
  issueDate: string;
  inspectionExpiryDate: string;
  insurancePolicyNumber: string;
  status: 'active' | 'pending_inspection' | 'suspended_no_helmet' | 'revoked';
  qrTelemetry: string;
}

export interface MopedMeroCenter {
  id: string;
  name: string;
  region: string;
  address: string;
  coordinates: { lat: number; lng: number };
  contactPhone: string;
  operatingHours: string;
  dailySlotCapacity: number;
  currentWaitMinutes: number;
  acceptsElectricMopeds: boolean;
  hasTheoreticalExamHall: boolean;
}

export interface CourierSafetyStandard {
  id: string;
  title: string;
  legalBasis: string;
  ruleRequirement: string;
  sanctionPenalty: string;
  safetyWeight: number;
}
