/**
 * Official State Tourism Agency (DTA), AYNA & Ministry of Emergency Situations (FHN)
 * Aerial Cable Car, Funicular & Ropeway Transit Safety Compliance Engine
 *
 * Adheres to:
 * - Law of the Republic of Azerbaijan "On Technical Safety" (AR Qanunu № 733-IQ)
 * - FHN State Agency for Safety in Industry and Mining Control Regulations
 * - European Standards EN 1709 (Inspection, Maintenance & Operation of Passenger Cableways)
 * - EN 12927 / ISO 4309 (Steel Wire Ropes for Cableway Installations & Discard Criteria)
 * - Cabinet of Ministers Resolution on High-Risk Industrial Facility Operations
 */

export type RopewayType =
  | 'funicular'
  | 'gondola_detachable'
  | 'chairlift_detachable'
  | 'aerial_tramway_reversible';

export type WindSafetyStatus = 'safe' | 'caution' | 'critical_evacuation';

export type CableIntegrityStatus = 'certified' | 'maintenance_due' | 'cable_discard_required';

export type PassengerCategory = 'adult' | 'child_student' | 'senior' | 'prm_veteran';

export type PassType =
  | 'single_ride'
  | 'return_trip'
  | 'day_ski_pass'
  | 'three_day_pass'
  | 'season_pass';

export type Currency = 'AZN' | 'USD' | 'EUR';

export interface AnemometerTelemetry {
  windSpeedMs: number;
  windSpeedKmh: number;
  windGustMs: number;
  windDirectionDeg: number;
  crossWindAngleDeg: number;
  lateralCabinSwayDeg: number;
  ambientTempC: number;
  iceAccretionMm: number;
  lightningDistanceKm: number;
  status: WindSafetyStatus;
  maxOperationalSpeedLimitMs: number;
  recommendedActionAz: string;
  recommendedActionEn: string;
  regulatoryStandardCitation: string;
}

export interface MagneticRopeTelemetry {
  nominalDiameterMm: number;
  measuredDiameterMm: number;
  diameterReductionPct: number;
  brokenOuterWires6d: number;
  brokenOuterWires30d: number;
  lossMetallicAreaPct: number;
  tensionHydraulicBar: number;
  bullwheelLinerWearMm: number;
  emergencyTrackBrakeMs: number;
  status: CableIntegrityStatus;
  discardCriteriaMet: boolean;
  safetyFactor: number;
  isoStandardCitation: string;
}

export interface RopewayInstallation {
  id: string;
  nameAz: string;
  nameEn: string;
  resortNameAz: string;
  resortNameEn: string;
  systemType: RopewayType;
  elevationBottomM: number;
  elevationTopM: number;
  verticalRiseM: number;
  slopeLengthM: number;
  capacityPphd: number;
  maxSpeedMs: number;
  cableDiameterMm: number;
  towersCount: number;
  cabinsCount: number;
  manufacturer: string;
  commissionYear: number;
  fhnRegistryCode: string;
  districtAz: string;
  districtEn: string;
  coordinates: { lat: number; lng: number };
  baseSingleFareAzn: number;
  status: 'operational' | 'weather_hold' | 'maintenance';
}

export interface FareCalculationResult {
  basePriceAzn: number;
  discountPercentage: number;
  discountAmountAzn: number;
  gearSurchargeAzn: number;
  vat18Azn: number;
  finalTotalAzn: number;
  finalTotalUsd: number;
  finalTotalEur: number;
  currency: Currency;
  isFreeExemption: boolean;
  notesAz: string;
  notesEn: string;
}

export interface SafetyChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  descriptionEn: string;
  category: 'cable_mechanical' | 'emergency_evacuation' | 'electrical_anemometer' | 'passenger_safety';
  regulatoryStandard: string;
  critical: boolean;
  compliant: boolean;
}

export interface SafetyAuditResult {
  totalItems: number;
  compliantCount: number;
  scorePercentage: number;
  criticalFailedCount: number;
  overallStatus: 'passed' | 'conditional' | 'failed';
  fhnAuditConclusionAz: string;
  fhnAuditConclusionEn: string;
}

export interface TheoreticalExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  legalCitation: string;
}

export interface ExamEvaluationResult {
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercentage: number;
  passed: boolean;
  certificationStatusAz: string;
  certificationStatusEn: string;
}

export interface CableCarCertificate {
  certificateNumber: string;
  installationId: string;
  installationNameAz: string;
  resortNameAz: string;
  systemType: RopewayType;
  fhnRegistryCode: string;
  issueDate: string;
  validUntil: string;
  leadInspectorName: string;
  leadInspectorBadge: string;
  anemometerCutoffSpeedMs: number;
  cableIntegrityStatus: CableIntegrityStatus;
  overallAuditScore: number;
  simsSignatureUid: string;
  sha256SecurityHash: string;
  qrPayload: string;
}

export const CURRENCY_RATES = {
  AZN: 1.0,
  USD: 1.7,
  EUR: 1.85,
};

/**
 * Converts AZN to target currency
 */
export function convertCurrency(amountAzn: number, target: Currency): number {
  if (target === 'AZN') return amountAzn;
  return Number((amountAzn / CURRENCY_RATES[target]).toFixed(2));
}

/**
 * Evaluates anemometer and atmospheric telemetry for ropeway operation
 * Adheres to EN 1709 Clause 9.3 and FHN safety regulations
 */
export function evaluateWindTelemetry(
  windSpeedMs: number,
  windGustMs: number,
  crossWindAngleDeg: number = 45,
  ambientTempC: number = 10,
  iceAccretionMm: number = 0,
  lightningDistanceKm: number = 25
): AnemometerTelemetry {
  const windSpeedKmh = Number((windSpeedMs * 3.6).toFixed(1));
  const normalizedAngle = Math.abs(crossWindAngleDeg % 180);
  // Crosswind factor: sin(angle)
  const crossWindFactor = Math.sin((normalizedAngle * Math.PI) / 180);
  const lateralCabinSwayDeg = Number((windGustMs * 0.45 * Math.max(0.2, crossWindFactor)).toFixed(1));

  let status: WindSafetyStatus = 'safe';
  let maxOperationalSpeedLimitMs = 6.0;
  let recommendedActionAz = 'Normal istismar rejimi. Külək sürəti normativ hədlər daxilindədir.';
  let recommendedActionEn = 'Normal operating regime. Wind speeds are within safe regulatory limits.';
  const regulatoryStandardCitation = 'EN 1709 Bənd 9.3 & FHN Sənaye Təhlükəsizliyi Qaydaları';

  if (windGustMs >= 18.0 || windSpeedMs >= 15.0 || lightningDistanceKm < 5.0 || iceAccretionMm >= 5.0) {
    status = 'critical_evacuation';
    maxOperationalSpeedLimitMs = 0.0;
    recommendedActionAz = 'TƏCİLİ DAYANMA VƏ EVAKUASİYA: Külək və ya ildırım təhlükəsizlik həddini aşıb. Ehtiyat intiqal işə salınmalı və xətt 30 dəqiqə ərzində tam boşaldılmalıdır.';
    recommendedActionEn = 'EMERGENCY SHUTDOWN & EVACUATION: Wind speed or lightning exceeds statutory thresholds. Auxiliary drive must be engaged to evacuate all cabins within 30 minutes.';
  } else if (windGustMs >= 12.0 || windSpeedMs >= 10.0 || lightningDistanceKm < 15.0 || iceAccretionMm > 0) {
    status = 'caution';
    maxOperationalSpeedLimitMs = 3.0;
    recommendedActionAz = 'XƏBƏRDARLIQ / MƏHDUDİYYƏT: Hərəkət sürəti 3.0 m/s-dək azaldılmalı, boş qondolalar ehtiyatla hərəkət etdirilməli və anemometr daimi izlənməlidir.';
    recommendedActionEn = 'CAUTION / RESTRICTED REGIME: Cableway speed must be reduced to 3.0 m/s, empty cabins stabilized, and anemometer telemetry monitored continuously.';
  }

  return {
    windSpeedMs,
    windSpeedKmh,
    windGustMs,
    windDirectionDeg: normalizedAngle,
    crossWindAngleDeg: normalizedAngle,
    lateralCabinSwayDeg,
    ambientTempC,
    iceAccretionMm,
    lightningDistanceKm,
    status,
    maxOperationalSpeedLimitMs,
    recommendedActionAz,
    recommendedActionEn,
    regulatoryStandardCitation,
  };
}

/**
 * Evaluates steel wire rope condition based on Magnetic Rope Testing (MRT)
 * and discard criteria per ISO 4309 / EN 12927
 */
export function evaluateCableIntegrity(
  nominalDiameterMm: number,
  measuredDiameterMm: number,
  brokenOuterWires6d: number,
  brokenOuterWires30d: number,
  lossMetallicAreaPct: number,
  tensionHydraulicBar: number = 160,
  bullwheelLinerWearMm: number = 6.0,
  emergencyTrackBrakeMs: number = 320
): MagneticRopeTelemetry {
  const diameterReductionPct = Number((((nominalDiameterMm - measuredDiameterMm) / nominalDiameterMm) * 100).toFixed(2));
  const isoStandardCitation = 'ISO 4309:2017 & EN 12927:2019 Polad Dartı Kanatları Standartı';

  // Discard criteria:
  // - Diameter reduction >= 6% (or >= 10% severe)
  // - Broken outer wires in 6d >= 6 or in 30d >= 12
  // - Loss of metallic area (LMA) >= 8% (discard at 10%)
  // - Emergency track brake response > 400ms
  // - Hydraulic tension out of 120-200 bar envelope
  const isDiscardDueToDiameter = diameterReductionPct >= 6.0;
  const isDiscardDueToBrokenWires = brokenOuterWires6d >= 6 || brokenOuterWires30d >= 12;
  const isDiscardDueToLma = lossMetallicAreaPct >= 8.0;
  const isEmergencyBrakeFault = emergencyTrackBrakeMs > 400;
  const isHydraulicTensionFault = tensionHydraulicBar < 120 || tensionHydraulicBar > 210;

  const discardCriteriaMet =
    isDiscardDueToDiameter ||
    isDiscardDueToBrokenWires ||
    isDiscardDueToLma ||
    isEmergencyBrakeFault ||
    isHydraulicTensionFault;

  let status: CableIntegrityStatus = 'certified';
  let safetyFactor = 4.5;

  if (discardCriteriaMet) {
    status = 'cable_discard_required';
    safetyFactor = Number(Math.max(1.8, 4.5 - (lossMetallicAreaPct * 0.25) - (diameterReductionPct * 0.15)).toFixed(2));
  } else if (
    diameterReductionPct >= 3.5 ||
    brokenOuterWires6d >= 3 ||
    lossMetallicAreaPct >= 4.0 ||
    bullwheelLinerWearMm >= 10.0
  ) {
    status = 'maintenance_due';
    safetyFactor = Number((3.8 - (lossMetallicAreaPct * 0.1)).toFixed(2));
  }

  return {
    nominalDiameterMm,
    measuredDiameterMm,
    diameterReductionPct,
    brokenOuterWires6d,
    brokenOuterWires30d,
    lossMetallicAreaPct,
    tensionHydraulicBar,
    bullwheelLinerWearMm,
    emergencyTrackBrakeMs,
    status,
    discardCriteriaMet,
    safetyFactor,
    isoStandardCitation,
  };
}

/**
 * Calculates ticket & ski-pass fare pricing with discounts and equipment add-ons
 */
export function calculateFareTariff(
  baseSingleFareAzn: number,
  passType: PassType = 'single_ride',
  passengerCategory: PassengerCategory = 'adult',
  paragliderOrBikeGear: boolean = false,
  currency: Currency = 'AZN'
): FareCalculationResult {
  let passMultiplier = 1.0;
  if (passType === 'return_trip') passMultiplier = 1.6;
  else if (passType === 'day_ski_pass') passMultiplier = 2.5;
  else if (passType === 'three_day_pass') passMultiplier = 6.2;
  else if (passType === 'season_pass') passMultiplier = 25.0;

  const basePriceAzn = Number((baseSingleFareAzn * passMultiplier).toFixed(2));

  let discountPercentage = 0;
  let isFreeExemption = false;
  let notesAz = 'Standart tarif tətbiq edildi.';
  let notesEn = 'Standard tariff applied.';

  if (passengerCategory === 'prm_veteran') {
    discountPercentage = 100;
    isFreeExemption = true;
    notesAz = 'Əlilliyi olan şəxslər, müharibə veteranları və şəhid ailələri üçün 100% dövlət güzəşti.';
    notesEn = '100% state exemption for PRM individuals, war veterans, and martyr families.';
  } else if (passengerCategory === 'child_student') {
    discountPercentage = 50;
    notesAz = 'Uşaqlar (6-12 yaş) və tələbələr üçün 50% endirim tətbiq edildi.';
    notesEn = '50% concessionary tariff for children (6-12) and students applied.';
  } else if (passengerCategory === 'senior') {
    discountPercentage = 40;
    notesAz = 'Pensiyaçılar və ahıllar (65+ yaş) üçün 40% sosial güzəşt.';
    notesEn = '40% social concession applied for senior citizens (65+).';
  }

  const discountAmountAzn = Number(((basePriceAzn * discountPercentage) / 100).toFixed(2));
  const gearSurchargeAzn = paragliderOrBikeGear && !isFreeExemption ? 5.0 : 0.0;
  const taxableSubtotal = isFreeExemption ? 0.0 : Math.max(0, basePriceAzn - discountAmountAzn + gearSurchargeAzn);
  const vat18Azn = Number((taxableSubtotal * 0.18).toFixed(2));
  const finalTotalAzn = Number((taxableSubtotal).toFixed(2));

  return {
    basePriceAzn,
    discountPercentage,
    discountAmountAzn,
    gearSurchargeAzn,
    vat18Azn,
    finalTotalAzn,
    finalTotalUsd: convertCurrency(finalTotalAzn, 'USD'),
    finalTotalEur: convertCurrency(finalTotalAzn, 'EUR'),
    currency,
    isFreeExemption,
    notesAz,
    notesEn,
  };
}

/**
 * Evaluates the 10-point FHN statutory ropeway safety checklist
 */
export function evaluateSafetyChecklist(items: SafetyChecklistItem[]): SafetyAuditResult {
  const totalItems = items.length;
  const compliantCount = items.filter((item) => item.compliant).length;
  const criticalFailedCount = items.filter((item) => item.critical && !item.compliant).length;
  const scorePercentage = totalItems > 0 ? Number(((compliantCount / totalItems) * 100).toFixed(1)) : 0;

  let overallStatus: 'passed' | 'conditional' | 'failed' = 'passed';
  let fhnAuditConclusionAz = 'Kanat yolu qurğusu FHN və EN 1709 texniki təhlükəsizlik tələblərinə tam cavab verir.';
  let fhnAuditConclusionEn = 'The ropeway installation fully complies with FHN and EN 1709 technical safety standards.';

  if (criticalFailedCount > 0 || scorePercentage < 70) {
    overallStatus = 'failed';
    fhnAuditConclusionAz = `İSTİSMAR QADAĞANDIR: ${criticalFailedCount} kritik təhlükəsizlik bəndi təmin edilməyib. Qurğunun sərnişin daşıması qadağandır.`;
    fhnAuditConclusionEn = `OPERATION PROHIBITED: ${criticalFailedCount} critical safety items failed. Passenger conveyance is strictly suspended.`;
  } else if (scorePercentage < 90) {
    overallStatus = 'conditional';
    fhnAuditConclusionAz = 'ŞƏRTİ İCAZƏ: Xırda qüsurlar 14 təqvim günü ərzində aradan qaldırılmalı və təkrar FHN baxışı keçirilməlidir.';
    fhnAuditConclusionEn = 'CONDITIONAL PERMIT: Minor non-conformances must be rectified within 14 calendar days prior to re-audit.';
  }

  return {
    totalItems,
    compliantCount,
    scorePercentage,
    criticalFailedCount,
    overallStatus,
    fhnAuditConclusionAz,
    fhnAuditConclusionEn,
  };
}

/**
 * Grades the 10-question official theoretical examination
 */
export function evaluateTheoreticalExam(
  questions: TheoreticalExamQuestion[],
  selectedAnswers: Record<string, number>
): ExamEvaluationResult {
  const totalQuestions = questions.length;
  let correctAnswersCount = 0;

  questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correctOptionIndex) {
      correctAnswersCount++;
    }
  });

  const scorePercentage = totalQuestions > 0 ? Number(((correctAnswersCount / totalQuestions) * 100).toFixed(1)) : 0;
  const passed = correctAnswersCount >= 8; // 8/10 threshold

  const certificationStatusAz = passed
    ? 'İmtahan uğurla keçildi. Kanat qurğusunun istismarı və texniki nəzarəti üzrə FHN attestasiyası təsdiqləndi.'
    : 'İmtahan nəticəsi qeyri-qənaətbəxşdir. Minimum tələb 8 düzgün cavabdır (80%). Təkrar imtahan tələb olunur.';

  const certificationStatusEn = passed
    ? 'Examination passed successfully. FHN operator attestation for ropeway maintenance is officially validated.'
    : 'Examination result unsatisfactory. Minimum threshold is 8 correct answers (80%). Re-examination required.';

  return {
    totalQuestions,
    correctAnswersCount,
    scorePercentage,
    passed,
  certificationStatusAz,
    certificationStatusEn,
  };
}

/**
 * Generates an official DTA & FHN electronic ropeway safety certificate
 */
export function generateCableCarCertificate(
  installation: RopewayInstallation,
  cableIntegrity: MagneticRopeTelemetry,
  auditResult: SafetyAuditResult,
  inspectorName: string = 'Rəşad Məmmədov (FHN Baş Müfəttişi)'
): CableCarCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
  const certificateNumber = `DTA-CAB-2026-${randomSuffix}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const validUntilDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const validUntil = validUntilDate.toISOString().split('T')[0];

  const simsSignatureUid = `SIMA-FHN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const sha256SecurityHash = `SHA256:ROPEWAY:${installation.fhnRegistryCode}:${certificateNumber}:${issueDate}:${cableIntegrity.status}`;
  const qrPayload = `https://dta.gov.az/verify/cablecar?cert=${certificateNumber}&registry=${installation.fhnRegistryCode}&status=${auditResult.overallStatus}`;

  return {
    certificateNumber,
    installationId: installation.id,
    installationNameAz: installation.nameAz,
    resortNameAz: installation.resortNameAz,
    systemType: installation.systemType,
    fhnRegistryCode: installation.fhnRegistryCode,
    issueDate,
    validUntil,
    leadInspectorName: inspectorName,
    leadInspectorBadge: 'FHN-DGMN-9428',
    anemometerCutoffSpeedMs: 18.0,
    cableIntegrityStatus: cableIntegrity.status,
    overallAuditScore: auditResult.scorePercentage,
    simsSignatureUid,
    sha256SecurityHash,
    qrPayload,
  };
}
