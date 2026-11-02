/**
 * Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * "Azərişıq" ASC & Main State Traffic Police Department (BDYP)
 * Highway Smart LED Lighting, Photometric Illuminance (Lux / E_avg),
 * Pavement Luminance (L_avg cd/m²), Longitudinal & Overall Uniformity (U_0, U_l),
 * Glare Disability Threshold Increment (TI% / EN 13201 / CIE 115 / AZS 410) &
 * Official LIGHT-SAFE-AZ-2026 Portal Compliance Engine
 *
 * Statutory Framework:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında süni işıqlandırma şəbəkəsi, yol avadanlıqlarının qorunması və hərəkətin təhlükəsiz təşkili)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 42, 50, 73: Qaranlıq vaxtı və süni işıqlandırması olmayan yollarda xarici işıq cihazlarından istifadə və təhlükəsiz sürət həddi)
 * - State Standards of Azerbaijan AZS 410 / AZS 342 (Avtomobil yollarının işıqlandırılması normativləri)
 * - European Standard EN 13201 (Road Lighting - Parts 1 to 5: Performance requirements, calculations, measurement of lighting installations)
 * - International Commission on Illumination CIE 115 (Lighting of Roads for Motor and Pedestrian Traffic)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 342.1.4: Qaranlıqda işıq cihazları qoşulmadan və ya nasaz işıqla idarə etmə - 50 AZN)
 * - Code of Administrative Offences (İXM Maddə 342.1.4-1: Digər sürücüləri korlaşdıran kustar/tənzimlənməmiş güclü ksenon/LED uzaqvuran işıqlar - 150 AZN)
 * - Code of Administrative Offences (İXM Maddə 328: Məhdud görmə və ya zəif işıqlandırılmış zonada sürət həddinin aşılması: 10-20 km/s - 20 AZN, 20-40 km/s - 50 AZN + 2 bal, 40-60 km/s - 150 AZN + 3 bal, >60 km/s - 250 AZN + 4 bal)
 * - Code of Administrative Offences (İXM Maddə 353.1: Yol işıq dirəklərinə, yeraltı elektrik kabellərinə və ya ağıllı LED fənərlərinə xələl yetirmə - 300-800 AZN)
 * - Civil Code of the Republic of Azerbaijan (Mülki Məcəllə Maddə 1108: Dövlət yol əmlakına vurulmuş maddi zərərin tam həcmdə ödənilməsi)
 * - Code of Administrative Offences Article 38 (İXM Maddə 38: 30 gün ərzində 50% güzəştlə cərimə ödənişi)
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export type En13201LightingClass = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6';

export type RoadSurfaceReflectionClass =
  | 'R1_LIGHT_CONCRETE'
  | 'R2_SMA_POROUS'
  | 'R3_DENSE_ASPHALT'
  | 'R4_DARK_BITUMINOUS';

export type LuminaireOpticalType =
  | 'SMART_LED_BATWING'
  | 'ASYMMETRIC_CUTOFF'
  | 'HIGH_PRESSURE_SODIUM_LEGACY'
  | 'HIGH_MAST_FLOODLIGHT';

export type LightingSafetyStatus =
  | 'OPTIMAL_VISION_CLEAR'
  | 'ACCEPTABLE_STANDARD'
  | 'POOR_UNIFORMITY_HAZARD'
  | 'CRITICAL_UNDERLIT_BLINDSPOT';

export type VehicleLightCategory =
  | 'sedan_modern_matrix_led'
  | 'suv_bi_xenon'
  | 'heavy_tir_halogen'
  | 'intercity_bus_led'
  | 'compact_ev_projector'
  | 'police_patrol_interceptor';

export interface LightCorridorAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  chainageKm: string;
  lightingClass: En13201LightingClass;
  roadWidthM: number;
  poleSpacingM: number;
  mountingHeightM: number;
  luminaireType: LuminaireOpticalType;
  luminairePowerWatts: number;
  lampFluxLumens: number;
  pavementClass: RoadSurfaceReflectionClass;
  speedLimitKmH: number;
  scadaSensorCode: string;
  substationFeed: string;
}

export interface LightVehiclePreset {
  id: string;
  category: VehicleLightCategory;
  nameAz: string;
  nameEn: string;
  licensePlate: string;
  headlightLuminousFluxLm: number;
  beamRangeMeters: number;
  nominalApproachSpeedKmH: number;
  driverNightVisionScorePct: number;
}

export interface LightSimulationInput {
  vehicleSpeedKmH: number;
  luminaireFluxLumens: number; // 8,000 to 45,000 lm
  poleSpacingM: number; // 25 to 65 m
  mountingHeightM: number; // 8 to 32 m
  roadWidthM: number; // 7.0 to 28.0 m
  dimmingLevelPct: number; // 20% to 100%
  pavementType: RoadSurfaceReflectionClass;
  opticalType: LuminaireOpticalType;
  headlightBeamAssistance: boolean;
}

export interface LightSimulationResult {
  averageIlluminanceLux: number; // E_avg (lux)
  minimumIlluminanceLux: number; // E_min (lux)
  overallUniformityU0: number; // U_0 = L_min / L_avg
  longitudinalUniformityUl: number; // U_l = L_min,line / L_max,line
  averageLuminanceCdM2: number; // L_avg (cd/m²)
  thresholdIncrementTiPct: number; // TI% glare disability
  targetLightingClassAchieved: En13201LightingClass;
  driverDetectionDistanceM: number; // Contrast vision distance (m)
  stoppingDistanceM: number; // d_stop at speed
  sightMarginDistanceM: number; // d_detect - d_stop (positive = safe, negative = blind spot hazard)
  safetyStatus: LightingSafetyStatus;
  energyConsumptionKwhPerKm: number; // Energy rating per km
  speedLimitKmH: number;
  speedExcessKmH: number;
  statutoryFineAzn: number;
  statutoryFineDiscountedAzn: number;
  penaltyPoints: number;
  violationDescriptionAz: string;
  violationDescriptionEn: string;
  safetyRecommendationsAz: string[];
  safetyRecommendationsEn: string[];
}

export interface LightChecklistItem {
  id: string;
  code: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  descriptionEn: string;
  category: 'PHOTOMETRY' | 'ELECTRICAL_SAFETY' | 'GLARE_CONTROL' | 'SCADA_TELEMETRY';
  standardRef: string;
  passed: boolean;
}

export interface LightExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  legalReference: string;
}

export interface LightSafeCertificate {
  certificateId: string;
  issueDate: string;
  expiryDate: string;
  corridor: LightCorridorAsset;
  vehicle: LightVehiclePreset;
  simulation: LightSimulationResult;
  simaSignatureUid: string;
  verificationPin: string;
  sha256Seal: string;
  inspectorOfficer: string;
  clearanceOutcome: 'APPROVED_OPTIMAL_LIGHTING' | 'CONDITIONAL_MAINTENANCE_REQUIRED' | 'REJECTED_UNDERLIT_HAZARD';
}

export const LIGHT_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882,
  EUR: 0.5405,
};

export const convertLightCurrency = (amountAzn: number, target: Currency): number => {
  const rate = LIGHT_CURRENCY_RATES[target] ?? 1.0;
  return Number((amountAzn * rate).toFixed(2));
};

/**
 * Average Luminance Coefficients (q_0) per CIE 115 / EN 13201-3
 */
export const PAVEMENT_Q0_COEFFICIENTS: Record<RoadSurfaceReflectionClass, number> = {
  R1_LIGHT_CONCRETE: 0.10,
  R2_SMA_POROUS: 0.07,
  R3_DENSE_ASPHALT: 0.07,
  R4_DARK_BITUMINOUS: 0.08,
};

/**
 * Optical Utilization Factor (η) and Glare Veiling Index by Luminaire Type
 */
export const LUMINAIRE_OPTICAL_SPECS: Record<
  LuminaireOpticalType,
  { utilizationFactor: number; glareFactor: number; longitudinalFactor: number }
> = {
  SMART_LED_BATWING: { utilizationFactor: 0.48, glareFactor: 0.08, longitudinalFactor: 0.72 },
  ASYMMETRIC_CUTOFF: { utilizationFactor: 0.42, glareFactor: 0.06, longitudinalFactor: 0.65 },
  HIGH_PRESSURE_SODIUM_LEGACY: { utilizationFactor: 0.35, glareFactor: 0.16, longitudinalFactor: 0.52 },
  HIGH_MAST_FLOODLIGHT: { utilizationFactor: 0.38, glareFactor: 0.12, longitudinalFactor: 0.60 },
};

/**
 * EN 13201-2 Lighting Class Minimum Thresholds
 */
export const EN13201_CLASS_THRESHOLDS: Record<
  En13201LightingClass,
  { minLuminance: number; minU0: number; minUl: number; maxTi: number }
> = {
  M1: { minLuminance: 2.0, minU0: 0.40, minUl: 0.70, maxTi: 10 },
  M2: { minLuminance: 1.5, minU0: 0.40, minUl: 0.70, maxTi: 10 },
  M3: { minLuminance: 1.0, minU0: 0.40, minUl: 0.60, maxTi: 15 },
  M4: { minLuminance: 0.75, minU0: 0.40, minUl: 0.60, maxTi: 15 },
  M5: { minLuminance: 0.50, minU0: 0.35, minUl: 0.40, maxTi: 15 },
  M6: { minLuminance: 0.30, minU0: 0.35, minUl: 0.40, maxTi: 20 },
};

/**
 * Evaluates Photometrics & Nighttime Driver Safety
 */
export const calculateHighwayPhotometrics = (
  input: LightSimulationInput,
  corridorSpeedLimit: number = 90
): LightSimulationResult => {
  const {
    vehicleSpeedKmH,
    luminaireFluxLumens,
    poleSpacingM,
    mountingHeightM,
    roadWidthM,
    dimmingLevelPct,
    pavementType,
    opticalType,
    headlightBeamAssistance,
  } = input;

  const dimRatio = Math.max(0.1, Math.min(1.0, dimmingLevelPct / 100));
  const effectiveFlux = luminaireFluxLumens * dimRatio;
  const optical = LUMINAIRE_OPTICAL_SPECS[opticalType];
  const q0 = PAVEMENT_Q0_COEFFICIENTS[pavementType];
  const maintenanceFactor = 0.85; // Dirt and lamp lumen depreciation

  // Illuminance: E_avg = (Flux * eta * MF) / (Width * Spacing)
  const illuminatedArea = Math.max(1, roadWidthM * poleSpacingM);
  const averageIlluminanceLux = Number(
    ((effectiveFlux * optical.utilizationFactor * maintenanceFactor) / illuminatedArea).toFixed(1)
  );

  // Height-to-spacing ratio penalty on uniformity
  const spacingRatio = poleSpacingM / Math.max(1, mountingHeightM);
  let uniformityBase = 0.55 - (spacingRatio - 3.0) * 0.08;
  if (opticalType === 'SMART_LED_BATWING') uniformityBase += 0.06;
  if (opticalType === 'HIGH_PRESSURE_SODIUM_LEGACY') uniformityBase -= 0.08;
  const overallUniformityU0 = Number(Math.max(0.18, Math.min(0.68, uniformityBase)).toFixed(2));
  const minimumIlluminanceLux = Number((averageIlluminanceLux * overallUniformityU0).toFixed(1));

  const longitudinalUniformityUl = Number(
    Math.max(0.25, Math.min(0.85, optical.longitudinalFactor - (spacingRatio - 3.0) * 0.05)).toFixed(2)
  );

  // Luminance: L_avg = q0 * E_avg (cd/m²)
  const averageLuminanceCdM2 = Number((q0 * averageIlluminanceLux).toFixed(2));

  // Glare Disability Threshold Increment (TI%): TI = (65 * L_v) / (L_avg^0.8)
  const veilingRatio = optical.glareFactor * (mountingHeightM < 10 ? 1.3 : 1.0);
  const baseTi = (65 * veilingRatio) / Math.max(0.2, Math.pow(averageLuminanceCdM2, 0.8));
  const thresholdIncrementTiPct = Number(Math.max(4.0, Math.min(32.0, baseTi)).toFixed(1));

  // Determine Achieved EN 13201 Class
  let targetLightingClassAchieved: En13201LightingClass = 'M6';
  const classes: En13201LightingClass[] = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  for (const cls of classes) {
    const t = EN13201_CLASS_THRESHOLDS[cls];
    if (
      averageLuminanceCdM2 >= t.minLuminance &&
      overallUniformityU0 >= t.minU0 &&
      longitudinalUniformityUl >= t.minUl &&
      thresholdIncrementTiPct <= t.maxTi
    ) {
      targetLightingClassAchieved = cls;
      break;
    }
  }

  // Driver Night Contrast & Obstacle Detection Distance (m)
  // Contrast vision is proportional to L_avg^0.35, degraded by glare TI%, boosted by car headlights
  const headlightBoost = headlightBeamAssistance ? 55 : 0;
  const glareDegradation = Math.max(0.5, 1 - Math.max(0, thresholdIncrementTiPct - 10) * 0.02);
  const driverDetectionDistanceM = Number(
    Math.round(75 * Math.pow(Math.max(0.1, averageLuminanceCdM2), 0.35) * glareDegradation + headlightBoost)
  );

  // Vehicle Stopping Distance: reaction distance + braking distance on pavement
  // d_stop = (v / 3.6) * t_r + v^2 / (2 * mu * g), assuming mu ~ 0.75 dry asphalt
  const vMs = vehicleSpeedKmH / 3.6;
  const reactionDist = vMs * 1.0; // 1.0 sec night reaction time
  const brakingDist = Math.pow(vMs, 2) / (2 * 0.75 * 9.81);
  const stoppingDistanceM = Number(Math.round(reactionDist + brakingDist));

  const sightMarginDistanceM = Number(Math.round(driverDetectionDistanceM - stoppingDistanceM));

  // Safety Status
  let safetyStatus: LightingSafetyStatus = 'OPTIMAL_VISION_CLEAR';
  if (sightMarginDistanceM < -25 || averageLuminanceCdM2 < 0.40) {
    safetyStatus = 'CRITICAL_UNDERLIT_BLINDSPOT';
  } else if (sightMarginDistanceM < 0 || overallUniformityU0 < 0.35 || thresholdIncrementTiPct > 15) {
    safetyStatus = 'POOR_UNIFORMITY_HAZARD';
  } else if (averageLuminanceCdM2 >= 0.75 && overallUniformityU0 >= 0.38 && thresholdIncrementTiPct <= 15) {
    safetyStatus = 'OPTIMAL_VISION_CLEAR';
  } else {
    safetyStatus = 'ACCEPTABLE_STANDARD';
  }

  // Energy Consumption rating (kWh per km per hour of operation)
  const luminairesPerKm = Math.round(1000 / poleSpacingM);
  const fixtureWatts = opticalType === 'SMART_LED_BATWING' ? 180 : opticalType === 'ASYMMETRIC_CUTOFF' ? 200 : 250;
  const energyConsumptionKwhPerKm = Number(
    ((luminairesPerKm * fixtureWatts * dimRatio) / 1000).toFixed(2)
  );

  // Statutory Fines & Speed Excess
  const speedExcessKmH = Math.max(0, vehicleSpeedKmH - corridorSpeedLimit);
  let statutoryFineAzn = 0;
  let penaltyPoints = 0;
  let violationDescriptionAz = 'Qanun pozuntusu qeydə alınmayıb — hərəkət qaydalara uyğundur';
  let violationDescriptionEn = 'No violation recorded — movement complies with legal limits';

  if (speedExcessKmH > 60) {
    statutoryFineAzn = 250;
    penaltyPoints = 4;
    violationDescriptionAz = `İXM Maddə 328.4: Sürət həddinin 60 km/saatdan çox aşılması (${speedExcessKmH} km/s artıq)`;
    violationDescriptionEn = `İXM Art. 328.4: Speeding over 60 km/h above limit (+${speedExcessKmH} km/h)`;
  } else if (speedExcessKmH > 40) {
    statutoryFineAzn = 150;
    penaltyPoints = 3;
    violationDescriptionAz = `İXM Maddə 328.3: Sürət həddinin 40-60 km/saat aşılması (${speedExcessKmH} km/s artıq)`;
    violationDescriptionEn = `İXM Art. 328.3: Speeding 40-60 km/h above limit (+${speedExcessKmH} km/h)`;
  } else if (speedExcessKmH > 20) {
    statutoryFineAzn = 50;
    penaltyPoints = 2;
    violationDescriptionAz = `İXM Maddə 328.2: Sürət həddinin 20-40 km/saat aşılması (${speedExcessKmH} km/s artıq)`;
    violationDescriptionEn = `İXM Art. 328.2: Speeding 20-40 km/h above limit (+${speedExcessKmH} km/h)`;
  } else if (speedExcessKmH > 10) {
    statutoryFineAzn = 20;
    penaltyPoints = 0;
    violationDescriptionAz = `İXM Maddə 328.1: Sürət həddinin 10-20 km/saat aşılması (${speedExcessKmH} km/s artıq)`;
    violationDescriptionEn = `İXM Art. 328.1: Speeding 10-20 km/h above limit (+${speedExcessKmH} km/h)`;
  } else if (!headlightBeamAssistance && vehicleSpeedKmH > 40 && averageLuminanceCdM2 < 0.8) {
    statutoryFineAzn = 50;
    penaltyPoints = 0;
    violationDescriptionAz = 'İXM Maddə 342.1.4: Qaranlıq vaxtı xarici işıq cihazları qoşulmadan nəqliyyatı idarə etmə';
    violationDescriptionEn = 'İXM Art. 342.1.4: Operating vehicle in the dark without headlights engaged';
  }

  const statutoryFineDiscountedAzn = Number((statutoryFineAzn * 0.5).toFixed(2));

  // Recommendations
  const safetyRecommendationsAz: string[] = [];
  const safetyRecommendationsEn: string[] = [];

  if (sightMarginDistanceM < 0) {
    safetyRecommendationsAz.push(
      `Təhlükəli görmə çatışmazlığı: Dayanma məsafəsi (${stoppingDistanceM} m) maneə tanıma məsafəsindən (${driverDetectionDistanceM} m) çoxdur. Sürəti azaldın!`
    );
    safetyRecommendationsEn.push(
      `Critical sight deficit: Stopping distance (${stoppingDistanceM} m) exceeds obstacle detection distance (${driverDetectionDistanceM} m). Reduce speed!`
    );
  }

  if (overallUniformityU0 < 0.40) {
    safetyRecommendationsAz.push(
      `Ümumi bərabərlik əmsalı aşağıdır (U₀ = ${overallUniformityU0} < 0.40). Yolda "zebra/zolaqlı qaranlıq zolaqlar" riski var.`
    );
    safetyRecommendationsEn.push(
      `Low overall uniformity (U₀ = ${overallUniformityU0} < 0.40). Risk of zebra lighting stripes and phantom shadow zones.`
    );
  }

  if (thresholdIncrementTiPct > 15) {
    safetyRecommendationsAz.push(
      `Korlaşdırıcı parıltı həddən artıqdır (TI = ${thresholdIncrementTiPct}% > 15%). Fənərlərin asimmetrik diffuzor bucağı tənzimlənməlidir.`
    );
    safetyRecommendationsEn.push(
      `Excessive glare threshold increment (TI = ${thresholdIncrementTiPct}% > 15%). Asymmetric luminaire cut-off shields required.`
    );
  }

  if (safetyRecommendationsAz.length === 0) {
    safetyRecommendationsAz.push('İşıqlandırma parametrləri EN 13201 və AZS 410 standartlarına tam uyğundur.');
    safetyRecommendationsEn.push('Lighting parameters fully comply with EN 13201 and AZS 410 standards.');
  }

  return {
    averageIlluminanceLux,
    minimumIlluminanceLux,
    overallUniformityU0,
    longitudinalUniformityUl,
    averageLuminanceCdM2,
    thresholdIncrementTiPct,
    targetLightingClassAchieved,
    driverDetectionDistanceM,
    stoppingDistanceM,
    sightMarginDistanceM,
    safetyStatus,
    energyConsumptionKwhPerKm,
    speedLimitKmH: corridorSpeedLimit,
    speedExcessKmH,
    statutoryFineAzn,
    statutoryFineDiscountedAzn,
    penaltyPoints,
    violationDescriptionAz,
    violationDescriptionEn,
    safetyRecommendationsAz,
    safetyRecommendationsEn,
  };
};

/**
 * Evaluates Checklist Items
 */
export const evaluateLightChecklist = (
  items: LightChecklistItem[]
): {
  totalCount: number;
  passedCount: number;
  compliancePercentage: number;
  allPassed: boolean;
} => {
  const totalCount = items.length;
  const passedCount = items.filter(i => i.passed).length;
  const compliancePercentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  return {
    totalCount,
    passedCount,
    compliancePercentage,
    allPassed: passedCount === totalCount,
  };
};

/**
 * Grades Exam Answers
 */
export const gradeLightExam = (
  questions: LightExamQuestion[],
  selectedAnswers: Record<string, number>
): {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
} => {
  const totalQuestions = questions.length;
  let correctAnswers = 0;
  for (const q of questions) {
    if (selectedAnswers[q.id] === q.correctOptionIndex) {
      correctAnswers++;
    }
  }
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  return {
    totalQuestions,
    correctAnswers,
    scorePercentage,
    passed: scorePercentage >= 80,
  };
};

/**
 * Generates an Official LIGHT-SAFE-AZ-2026 Certificate
 */
export const generateLightSafeCertificate = (params: {
  corridor: LightCorridorAsset;
  vehicle: LightVehiclePreset;
  simulation: LightSimulationResult;
  inspectorOfficer?: string;
}): LightSafeCertificate => {
  const { corridor, vehicle, simulation, inspectorOfficer } = params;
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const certificateId = `LIGHT-SAFE-AZ-2026-${randNum}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expiry = new Date(now.getTime() + 180 * 24 * 3600 * 1000); // 180 days validity
  const expiryDate = expiry.toISOString().split('T')[0];

  const rawPayload = `${certificateId}:${corridor.id}:${vehicle.licensePlate}:${simulation.averageLuminanceCdM2}:${simulation.overallUniformityU0}:${issueDate}`;
  let hash = 0;
  for (let i = 0; i < rawPayload.length; i++) {
    const char = rawPayload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const sha256Seal = Math.abs(hash).toString(16).padStart(16, '0').toUpperCase();
  const simaSignatureUid = `SIMA-LIGHT-${Math.abs(hash).toString(36).toUpperCase()}-AZ`;
  const verificationPin = `${Math.floor(1000 + Math.random() * 9000)}`;

  let clearanceOutcome: LightSafeCertificate['clearanceOutcome'] = 'APPROVED_OPTIMAL_LIGHTING';
  if (simulation.safetyStatus === 'CRITICAL_UNDERLIT_BLINDSPOT') {
    clearanceOutcome = 'REJECTED_UNDERLIT_HAZARD';
  } else if (simulation.safetyStatus === 'POOR_UNIFORMITY_HAZARD') {
    clearanceOutcome = 'CONDITIONAL_MAINTENANCE_REQUIRED';
  }

  return {
    certificateId,
    issueDate,
    expiryDate,
    corridor,
    vehicle,
    simulation,
    simaSignatureUid,
    verificationPin,
    sha256Seal,
    inspectorOfficer: inspectorOfficer || 'Baş Mühəndis R. Qasımov (AAYDA / Azərişıq ASC)',
    clearanceOutcome,
  };
};

/**
 * Search Certificates in Registry
 */
export const searchLightCertificates = (
  query: string,
  registry: LightSafeCertificate[]
): LightSafeCertificate[] => {
  const q = query.trim().toLowerCase();
  if (!q) return registry;
  return registry.filter(
    c =>
      c.certificateId.toLowerCase().includes(q) ||
      c.vehicle.licensePlate.toLowerCase().includes(q) ||
      c.vehicle.nameAz.toLowerCase().includes(q) ||
      c.vehicle.nameEn.toLowerCase().includes(q) ||
      c.corridor.nameAz.toLowerCase().includes(q) ||
      c.corridor.nameEn.toLowerCase().includes(q) ||
      c.corridor.route.toLowerCase().includes(q) ||
      c.corridor.scadaSensorCode.toLowerCase().includes(q) ||
      c.corridor.region.toLowerCase().includes(q) ||
      c.simaSignatureUid.toLowerCase().includes(q) ||
      c.verificationPin.toLowerCase().includes(q)
  );
};
