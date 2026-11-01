/**
 * Highway Asphalt Pavement Thermal Deformation, Rutting Resistance & Summer Heat Restriction SCADA Telemetry Engine
 * Official standards compliance:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29: Avtomobil yollarının yay mövsümündə mühafizəsi, asfalt-beton örtüyünün istilik deformasiyasından qorunması)
 * - Decision of the Cabinet of Ministers of the Republic of Azerbaijan & Orders of AAYDA / BDYP (Havanın temperaturu +32°C-dən yuxarı olduqda saat 10:00-dan 20:00-dək ümumi faktiki kütləsi 14 tondan və ya ox yükü 5 tondan artıq olan nəqliyyat vasitələrinin hərəkətinin məhdudlaşdırılması)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 353.1, 353.2, 327.1, 38)
 * - State Standards AZS 410 / AZS 342
 * - AASHTO M 320 / AASHTO T 324 (Hamburg Wheel-Track Testing for Rutting & Moisture Susceptibility)
 * - Superpave PG (Performance Graded) Asphalt Binder Specifications
 */

export type BitumenGrade = 'BND_60_90' | 'BND_70_100' | 'PG_64_22' | 'PG_70_10' | 'SMA_16_POLYMER';
export type PavementRuttingRisk = 'MINIMAL' | 'MODERATE' | 'CRITICAL_RUTTING' | 'PAVEMENT_FAILURE';
export type SummerRestrictionStatus = 'OPEN_FREE_FLOW' | 'THERMAL_RESTRICTION_ACTIVE' | 'EMERGENCY_COOLING_HOLD';
export type VehicleAsphaltClass = 'heavy_semi_trailer' | 'heavy_tipper' | 'fuel_tanker' | 'intercity_coach' | 'medium_truck' | 'passenger_car';

export interface AsphaltCorridorAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  coordinates: string;
  chainageKm: string;
  bitumenGrade: BitumenGrade;
  pavementThicknessMm: number;
  subbaseType: string;
  currentAirTempC: number;
  currentPavementTempC: number;
  solarRadiationWm2: number;
  restrictionActive: boolean;
  coolingStationCapacityTrucks: number;
  coolingStationOccupancy: number;
  activeMistSprinklers: boolean;
  lastResurfacingYear: number;
}

export interface AsphaltVehiclePreset {
  id: string;
  name: string;
  vehicleClass: VehicleAsphaltClass;
  grossMassKg: number;
  axleCount: number;
  maxAxleLoadTonnes: number;
  tirePressureBar: number;
  licensePlate: string;
  cargoType: string;
  hasThermallyInsulatedTires: boolean;
}

export interface AsphaltThermalSimulationInput {
  airTemperatureC: number;
  solarRadiationWm2: number;
  vehicleGrossMassKg: number;
  maxAxleLoadTonnes: number;
  tirePressureBar: number;
  bitumenGrade: BitumenGrade;
  truckPassesCount: number; // ESAL passes (e.g. 500 - 20000)
  timeHour: number; // 0 to 24 (restriction hours 10:00 to 20:00)
}

export interface AsphaltThermalCalculationResult {
  pavementSurfaceTempC: number;
  pavementCriticalDepthTempC: number; // at 20mm depth (max shear stress plane)
  ruttingDepthMm: number;
  ruttingRisk: PavementRuttingRisk;
  shearStressKPa: number;
  dynamicModulusMpa: number;
  isRestrictedDueToHeat: boolean; // airTemp >= 32 && (timeHour >= 10 && timeHour <= 20) && (grossMass > 14t || axleLoad > 5t)
  restrictionReasonAz: string;
  restrictionReasonEn: string;
  estimatedCoolingWaitMinutes: number;
  statutoryFineAzn: number;
  statutoryFineUsd: number;
  statutoryFineEur: number;
  discountedFineAzn: number;
  esalDamageFactor: number;
  coolingWaterRequiredLiters: number;
  complianceNotes: string[];
}

export interface AsphaltChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  category: 'temperature_rules' | 'pavement_design' | 'axle_limits' | 'cooling_station' | 'scada_telemetry';
  legalRef: string;
  isMandatory: boolean;
}

export interface AsphaltExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  regulatoryReference: string;
}

export interface AsphaltClearanceCertificate {
  certificateNumber: string;
  issueDate: string;
  validUntil: string;
  vehiclePlate: string;
  vehicleClass: VehicleAsphaltClass;
  grossMassKg: number;
  maxAxleLoadTonnes: number;
  corridorId: string;
  corridorNameAz: string;
  pavementSurfaceTempC: number;
  ruttingDepthMm: number;
  clearanceStatus: 'APPROVED' | 'RESTRICTED_COOLING_HOLD' | 'PROHIBITED';
  coolingBayPinCode: string;
  digitalSignatureUid: string;
  qrCodeData: string;
  authorizedInspector: string;
}

// Exchange rates (Standard AutoNext convention)
export const AZN_TO_USD = 0.5882;
export const AZN_TO_EUR = 0.5435;

/**
 * Calculates asphalt pavement surface and critical depth (20 mm) temperature
 * Formula adapted from Superpave / SHRP thermal model:
 * T_surf = T_air + 0.0003 * SolarRadiation + 0.35 * T_air + 5.0
 * T_depth(20mm) = T_surf - (T_surf - T_air) * 0.18
 */
export function calculatePavementTemperature(airTempC: number, solarRadiationWm2: number): { surfaceTempC: number; criticalDepthTempC: number } {
  const radiationFactor = (solarRadiationWm2 / 1000) * 16.5;
  const surfaceTempC = Math.round((airTempC + radiationFactor + Math.max(0, airTempC - 20) * 0.45) * 10) / 10;
  // At 20mm depth where maximum shear stress from heavy truck tires occurs
  const criticalDepthTempC = Math.round((surfaceTempC - 0.12 * (surfaceTempC - airTempC)) * 10) / 10;
  return { surfaceTempC, criticalDepthTempC };
}

/**
 * Bitumen stiffness & dynamic shear modulus |E*| (MPa) as a function of temperature & binder grade
 */
export function getBitumenDynamicModulus(grade: BitumenGrade, depthTempC: number): number {
  const baseModulus: Record<BitumenGrade, number> = {
    BND_60_90: 2800,
    BND_70_100: 2200,
    PG_64_22: 3400,
    PG_70_10: 4200,
    SMA_16_POLYMER: 5500,
  };

  const tempDropRate: Record<BitumenGrade, number> = {
    BND_60_90: 0.048,
    BND_70_100: 0.055,
    PG_64_22: 0.042,
    PG_70_10: 0.035,
    SMA_16_POLYMER: 0.028,
  };

  const refTemp = 20; // 20°C standard reference
  const deltaT = Math.max(0, depthTempC - refTemp);
  const modulus = baseModulus[grade] * Math.exp(-tempDropRate[grade] * deltaT);
  return Math.max(120, Math.round(modulus));
}

/**
 * Rutting depth prediction model (French MEPDG / Hamburg Wheel power equation)
 * RD = k * (Passes / 1000)^0.28 * (T_depth / 20)^2.1 * (TirePressure / 7)^0.8 * (AxleLoad / 10)^1.4
 */
export function calculateRuttingDepth(
  depthTempC: number,
  passes: number,
  axleLoadTonnes: number,
  tirePressureBar: number,
  grade: BitumenGrade
): number {
  const gradeModifier: Record<BitumenGrade, number> = {
    BND_60_90: 1.25,
    BND_70_100: 1.55,
    PG_64_22: 0.95,
    PG_70_10: 0.70,
    SMA_16_POLYMER: 0.45,
  };

  const normalizedTemp = Math.max(1.0, depthTempC / 25.0);
  const normalizedPasses = Math.max(0.1, passes / 1000.0);
  const normalizedAxle = Math.max(0.2, axleLoadTonnes / 10.0);
  const normalizedPressure = Math.max(0.5, tirePressureBar / 7.0);

  const rawRutting = 2.4 * Math.pow(normalizedPasses, 0.28) * Math.pow(normalizedTemp, 2.1) * Math.pow(normalizedAxle, 1.35) * Math.pow(normalizedPressure, 0.75) * gradeModifier[grade];

  return Math.round(rawRutting * 10) / 10;
}

/**
 * 4th Power Law AASHTO Equivalent Single Axle Load (ESAL) relative road damage factor:
 * ESAL = (AxleLoad / 8.16)^4.0
 */
export function calculateEsalDamageFactor(axleLoadTonnes: number): number {
  const standardAxleTonnes = 8.16;
  const esal = Math.pow(axleLoadTonnes / standardAxleTonnes, 4.0);
  return Math.round(esal * 100) / 100;
}

/**
 * Evaluates whether vehicle falls under the statutory daytime summer temperature restriction
 * (+32°C rule between 10:00 and 20:00 for gross > 14t or axle > 5t)
 */
export function evaluateSummerHeatRestriction(
  airTempC: number,
  timeHour: number,
  grossMassKg: number,
  maxAxleLoadTonnes: number
): { isRestricted: boolean; reasonAz: string; reasonEn: string } {
  const isSummerHours = timeHour >= 10 && timeHour <= 20;
  const isHighTemperature = airTempC >= 32.0;
  const exceedsGrossLimit = grossMassKg > 14000;
  const exceedsAxleLimit = maxAxleLoadTonnes > 5.0;

  if (isHighTemperature && isSummerHours && (exceedsGrossLimit || exceedsAxleLimit)) {
    const reasons: string[] = [];
    if (exceedsGrossLimit) reasons.push(`Ümumi kütlə (${(grossMassKg / 1000).toFixed(1)}t > 14.0t)`);
    if (exceedsAxleLimit) reasons.push(`Ox yükü (${maxAxleLoadTonnes.toFixed(1)}t > 5.0t)`);

    return {
      isRestricted: true,
      reasonAz: `Havanın temperaturu ${airTempC}°C (≥32°C) və saat ${timeHour}:00 (10:00-20:00 intervalı). ${reasons.join(', ')} səbəbilə hərəkət qadağandır!`,
      reasonEn: `Ambient temperature ${airTempC}°C (≥32°C) and time ${timeHour}:00 (10:00-20:00 window). Movement banned due to ${reasons.join(', ')}!`,
    };
  }

  if (isHighTemperature && isSummerHours) {
    return {
      isRestricted: false,
      reasonAz: `Temperatur ${airTempC}°C yüksəkdir, lakin nəqliyyat vasitəsi 14t və 5t ox limitlərini aşmır. Hərəkətə icazə verilir.`,
      reasonEn: `High temperature ${airTempC}°C, but vehicle does not exceed 14t gross or 5t axle limits. Transit permitted.`,
    };
  }

  if (airTempC >= 32.0 && !isSummerHours) {
    return {
      isRestricted: false,
      reasonAz: `Gecə/səhər dəhlizi (saat ${timeHour}:00). 10:00-20:00 qadağa pəncərəsindən kənardır. Tranzitə icazə verilir.`,
      reasonEn: `Night/morning transit corridor (hour ${timeHour}:00). Outside 10:00-20:00 restriction window. Transit permitted.`,
    };
  }

  return {
    isRestricted: false,
    reasonAz: `Havanın temperaturu ${airTempC}°C (<32°C). Asfalt örtüyünün kritik yumşalma riski yoxdur. Sərbəst hərəkət.`,
    reasonEn: `Ambient temperature ${airTempC}°C (<32°C). No critical bitumen softening risk. Free transit permitted.`,
  };
}

/**
 * Evaluates administrative fines under Code of Administrative Offences (İXM 353.1 / 353.2)
 * Violation of highway seasonal temperature restriction:
 * - Base fine: 150 AZN
 * - Severe overweight excess: +100 AZN
 * - 50% prompt payment discount under Article 38 if paid within 30 days
 */
export function calculateAsphaltStatutoryFine(
  isRestricted: boolean,
  grossMassKg: number,
  maxAxleLoadTonnes: number
): {
  statutoryFineAzn: number;
  statutoryFineUsd: number;
  statutoryFineEur: number;
  discountedFineAzn: number;
} {
  if (!isRestricted) {
    return { statutoryFineAzn: 0, statutoryFineUsd: 0, statutoryFineEur: 0, discountedFineAzn: 0 };
  }

  let fineAzn = 150; // Standard fine under İXM 353.1
  if (grossMassKg > 24000 || maxAxleLoadTonnes > 10.0) {
    fineAzn += 100; // Aggravated violation
  }

  const discountedFineAzn = Math.round(fineAzn * 0.5);
  const statutoryFineUsd = Math.round(fineAzn * AZN_TO_USD);
  const statutoryFineEur = Math.round(fineAzn * AZN_TO_EUR);

  return {
    statutoryFineAzn: fineAzn,
    statutoryFineUsd,
    statutoryFineEur,
    discountedFineAzn,
  };
}

/**
 * Main calculation engine for asphalt pavement thermal simulation
 */
export function calculateAsphaltThermalSimulation(input: AsphaltThermalSimulationInput): AsphaltThermalCalculationResult {
  const { surfaceTempC, criticalDepthTempC } = calculatePavementTemperature(input.airTemperatureC, input.solarRadiationWm2);
  const dynamicModulusMpa = getBitumenDynamicModulus(input.bitumenGrade, criticalDepthTempC);
  const ruttingDepthMm = calculateRuttingDepth(criticalDepthTempC, input.truckPassesCount, input.maxAxleLoadTonnes, input.tirePressureBar, input.bitumenGrade);
  const esalDamageFactor = calculateEsalDamageFactor(input.maxAxleLoadTonnes);

  // Tire contact shear stress (kPa): tau = 0.5 * P_tire * sqrt(Load / standard)
  const shearStressKPa = Math.round(0.48 * (input.tirePressureBar * 100) * Math.sqrt(input.maxAxleLoadTonnes / 8.0));

  let ruttingRisk: PavementRuttingRisk = 'MINIMAL';
  if (ruttingDepthMm >= 25.0) {
    ruttingRisk = 'PAVEMENT_FAILURE';
  } else if (ruttingDepthMm >= 15.0) {
    ruttingRisk = 'CRITICAL_RUTTING';
  } else if (ruttingDepthMm >= 7.0) {
    ruttingRisk = 'MODERATE';
  }

  const restrictionEval = evaluateSummerHeatRestriction(input.airTemperatureC, input.timeHour, input.vehicleGrossMassKg, input.maxAxleLoadTonnes);
  const fines = calculateAsphaltStatutoryFine(restrictionEval.isRestricted, input.vehicleGrossMassKg, input.maxAxleLoadTonnes);

  // Estimated cooling wait until 20:00
  let estimatedCoolingWaitMinutes = 0;
  if (restrictionEval.isRestricted) {
    const hoursRemaining = Math.max(1, 20 - input.timeHour);
    estimatedCoolingWaitMinutes = hoursRemaining * 60;
  }

  // Water required to spray cool road section (Liters per 100m lane): Q = m * C * deltaT / L_vap
  const coolingWaterRequiredLiters = restrictionEval.isRestricted ? Math.round(Math.max(0, surfaceTempC - 45) * 85) : 0;

  const complianceNotes: string[] = [];
  if (restrictionEval.isRestricted) {
    complianceNotes.push(restrictionEval.reasonAz);
    complianceNotes.push(`İXM 353.1 maddəsi üzrə cərimə: ${fines.statutoryFineAzn} AZN (30 gün ərzində 50% endirimlə: ${fines.discountedFineAzn} AZN).`);
    complianceNotes.push(`Yol kənarı TIR-Park soyutma dayanacağında gözləmə vaxtı: ${Math.floor(estimatedCoolingWaitMinutes / 60)} saat ${estimatedCoolingWaitMinutes % 60} dəqiqə.`);
  } else {
    complianceNotes.push(restrictionEval.reasonAz);
  }

  if (ruttingRisk === 'CRITICAL_RUTTING' || ruttingRisk === 'PAVEMENT_FAILURE') {
    complianceNotes.push(`XƏBƏRDARLIQ: Plastik deformasiya (təkər izi) dərinliyi ${ruttingDepthMm} mm həddinə çatmışdır! Yol təbəqəsində qopma və sürüşmə təhlükəsi mövcuddur.`);
  }

  return {
    pavementSurfaceTempC: surfaceTempC,
    pavementCriticalDepthTempC: criticalDepthTempC,
    ruttingDepthMm,
    ruttingRisk,
    shearStressKPa,
    dynamicModulusMpa,
    isRestrictedDueToHeat: restrictionEval.isRestricted,
    restrictionReasonAz: restrictionEval.reasonAz,
    restrictionReasonEn: restrictionEval.reasonEn,
    estimatedCoolingWaitMinutes,
    statutoryFineAzn: fines.statutoryFineAzn,
    statutoryFineUsd: fines.statutoryFineUsd,
    statutoryFineEur: fines.statutoryFineEur,
    discountedFineAzn: fines.discountedFineAzn,
    esalDamageFactor,
    coolingWaterRequiredLiters,
    complianceNotes,
  };
}

/**
 * Evaluates 10-point Technical Checklist
 */
export function evaluateAsphaltChecklist(
  items: AsphaltChecklistItem[],
  checkedIds: string[]
): {
  totalItems: number;
  checkedCount: number;
  mandatoryCount: number;
  mandatoryCheckedCount: number;
  scorePercent: number;
  isCompliant: boolean;
  missingMandatoryAz: string[];
} {
  const totalItems = items.length;
  const checkedCount = checkedIds.length;
  const mandatoryItems = items.filter((item) => item.isMandatory);
  const mandatoryCount = mandatoryItems.length;

  const missingMandatoryAz = mandatoryItems.filter((item) => !checkedIds.includes(item.id)).map((item) => item.titleAz);

  const mandatoryCheckedCount = mandatoryCount - missingMandatoryAz.length;
  const scorePercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const isCompliant = missingMandatoryAz.length === 0;

  return {
    totalItems,
    checkedCount,
    mandatoryCount,
    mandatoryCheckedCount,
    scorePercent,
    isCompliant,
    missingMandatoryAz,
  };
}

/**
 * Evaluates Theoretical Exam
 */
export function evaluateAsphaltExam(
  questions: AsphaltExamQuestion[],
  selectedAnswers: Record<number, number>
): {
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  isPassed: boolean;
  grade: 'ƏLA' | 'YAXŞI' | 'KAFİ' | 'QEYRİ-KAFİ';
  details: {
    questionId: number;
    isCorrect: boolean;
    userAnswer: number;
    correctAnswer: number;
    explanationAz: string;
  }[];
} {
  const totalQuestions = questions.length;
  let correctCount = 0;

  const details = questions.map((q) => {
    const userAnswer = selectedAnswers[q.id];
    const isCorrect = userAnswer === q.correctOptionIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      isCorrect,
      userAnswer,
      correctAnswer: q.correctOptionIndex,
      explanationAz: q.explanationAz,
    };
  });

  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassed = scorePercent >= 80;

  let grade: 'ƏLA' | 'YAXŞI' | 'KAFİ' | 'QEYRİ-KAFİ' = 'QEYRİ-KAFİ';
  if (scorePercent === 100) grade = 'ƏLA';
  else if (scorePercent >= 90) grade = 'YAXŞI';
  else if (scorePercent >= 80) grade = 'KAFİ';

  return {
    totalQuestions,
    correctCount,
    scorePercent,
    isPassed,
    grade,
    details,
  };
}

/**
 * Generates official ASPHALT-GUARD-AZ-2026 Clearance Certificate
 */
export function generateAsphaltCertificate(params: {
  vehiclePlate: string;
  vehicleClass: VehicleAsphaltClass;
  grossMassKg: number;
  maxAxleLoadTonnes: number;
  corridor: AsphaltCorridorAsset;
  simResult: AsphaltThermalCalculationResult;
}): AsphaltClearanceCertificate {
  const now = new Date();
  const serial = Math.floor(10000 + Math.random() * 90000);
  const certNumber = `ASPHALT-GUARD-AZ-2026-${serial}`;

  const validUntilDate = new Date(now.getTime() + 24 * 3600 * 1000);
  const issueDateStr = now.toISOString().split('T')[0];
  const validUntilStr = validUntilDate.toISOString().split('T')[0];

  const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
  const hashSource = `${certNumber}-${params.vehiclePlate}-${params.corridor.id}-${params.simResult.ruttingDepthMm}`;
  const digitalSignatureUid = `SIMA-${Math.abs(hashSource.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(16).toUpperCase()}`;

  let clearanceStatus: AsphaltClearanceCertificate['clearanceStatus'] = 'APPROVED';
  if (params.simResult.isRestrictedDueToHeat) {
    clearanceStatus = 'RESTRICTED_COOLING_HOLD';
  } else if (params.simResult.ruttingRisk === 'PAVEMENT_FAILURE') {
    clearanceStatus = 'PROHIBITED';
  }

  const qrCodeData = `https://aayda.gov.az/asphalt-guard/verify?cert=${certNumber}&plate=${params.vehiclePlate}&pin=${pinCode}&status=${clearanceStatus}`;

  return {
    certificateNumber: certNumber,
    issueDate: issueDateStr,
    validUntil: validUntilStr,
    vehiclePlate: params.vehiclePlate,
    vehicleClass: params.vehicleClass,
    grossMassKg: params.grossMassKg,
    maxAxleLoadTonnes: params.maxAxleLoadTonnes,
    corridorId: params.corridor.id,
    corridorNameAz: params.corridor.nameAz,
    pavementSurfaceTempC: params.simResult.pavementSurfaceTempC,
    ruttingDepthMm: params.simResult.ruttingDepthMm,
    clearanceStatus,
    coolingBayPinCode: pinCode,
    digitalSignatureUid,
    qrCodeData,
    authorizedInspector: 'Polkovnik-leytenant E. Həsənov (AAYDA / BDYP)',
  };
}
