/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA) &
 * Main State Traffic Police (BDYP) Highway Anti-Glare Screens, Median Headlight Glare Defense,
 * Optical Transmittance Telemetry, EN 12676-1/2 Safety Compliance & Official GLARE-SAFE-AZ-2026 Portal
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   təhlükəsizlik mühəndis qurğuları, mərkəzi ayrıcı zolaq avadanlıqları və gözqamaşdırmaya qarşı qoruyucu çəpərlər)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 50: Qaranlıq vaxtı və görmə şəraiti
 *   məhdud olduqda xarici işıq cihazlarından istifadə qaydaları; qarşıdan gələn nəqliyyata ən azı 150 m qalmış
 *   uzaq vuran işıqların yaxın vuran işıqlara keçirilməsi; göz qamaşdıqda qəza dayanma siqnalının yandırılması)
 * - European Standards EN 12676-1 & EN 12676-2: Anti-glare screens for roads (Performance, characteristics,
 *   cutoff screening angle calculation, wind resistance class WL1/WL2, impact and weathering test methods)
 * - State Standards AZS 410 / AZS 342 (Magistral avtomobil yollarının yol mebeli və mühəndis qurğuları)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *     * Maddə 329: Faralardan, xüsusi işıq siqnallarından qaydalara zidd istifadə edilməsi və ya qarşıdan
 *       gələn nəqliyyat vasitəsinin sürücüsünün gözünün qamaşdırılması — 30 AZN;
 *     * Maddə 342.1: Standartlara uyğun olmayan işıq cihazları, qanunsuz ksenon/LED quraşdırılması — 150 AZN;
 *     * Maddə 328.2: Magistralda təhlükəli görmə şəraitində sürət həddini 20-40 km/saat aşmaq — 50 AZN + 2 bal;
 *     * Maddə 353.1: Yol mebelinə, mərkəzi ayrıcı zolaq çəpərlərinə ziyan vurulması — 600 AZN;
 *     * Maddə 38: İXM üzrə 30 gün ərzində cərimə ödənildikdə 50%-lik qanuni güzəşt;
 *     * AR Mülki Məcəlləsi Maddə 1108: AAYDA balansındakı anti-glare polimer panel və bərkidici avadanlığa
 *       vurulmuş ziyanın tam məbləğdə kompensasiya edilməsi.
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const GLARE_SAFE_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const GLARE_SAFE_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertGlareSafeCurrency(amountInAzn: number, currency: Currency): number {
  const rate = GLARE_SAFE_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type MedianBarrierType =
  | 'CONCRETE_NEW_JERSEY'
  | 'DOUBLE_W_BEAM_GUARDRAIL'
  | 'STEEL_BOX_BEAM'
  | 'EARTHEN_GREEN_BERM';

export type AntiGlareVaneMaterial =
  | 'UV_HDPE_POLYMER'
  | 'ALUMINUM_COMPOSITE'
  | 'FIBERGLASS_REINFORCED'
  | 'BIOLOGICAL_GREEN_HEDGE';

export type GlareStationStatus =
  | 'ONLINE_NOMINAL'
  | 'HIGH_GLARE_ALERT'
  | 'WIND_DEFLECTION_WARNING'
  | 'VANE_MAINTENANCE_REQUIRED';

export interface GlareCorridorStation {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  medianBarrier: MedianBarrierType;
  vaneMaterial: AntiGlareVaneMaterial;
  screenHeightMm: number;
  bladeSpacingMm: number;
  bladeAngleDeg: number;
  windResistanceClass: 'WL1' | 'WL2';
  stationStatus: GlareStationStatus;
  dailyTrafficVehicles: number;
  measuredAmbientLux: number;
  installedYear: number;
}

export interface GlareVehiclePreset {
  id: string;
  plate: string;
  model: string;
  headlightType:
    | 'FACTORY_HALOGEN'
    | 'FACTORY_BI_XENON'
    | 'MATRIX_LED'
    | 'LASER_HIGH_BEAM'
    | 'ILLEGAL_AFTERMARKET_LED';
  luminousIntensityCd: number;
  driverEyeHeightMm: number;
  defaultSpeedKmh: number;
  violationType:
    | 'NONE'
    | 'FAILURE_TO_DIP_HIGH_BEAM'
    | 'ILLEGAL_UNHOMOLOGATED_LIGHTS'
    | 'BARRIER_COLLISION_DAMAGE';
}

export interface GlareCalculationParams {
  vehicleSpeedKmh: number; // 40 - 140 km/h
  oncomingLuminousIntensityCd: number; // 10,000 - 150,000 cd
  oncomingDistanceM: number; // 15 - 250 m
  lateralSeparationM: number; // 2.0 - 15.0 m
  driverEyeHeightMm: number; // 1050 - 1500 mm
  screenHeightMm: number; // 1400 - 2200 mm
  bladeSpacingMm: number; // 400 - 1000 mm
  bladeAngleDeg: number; // 12° - 30°
  ambientIlluminanceLux: number; // 0.05 - 10 Lux
  windGustSpeedKmh: number; // 0 - 140 km/h
  bladeDefectMissingPct: number; // 0% - 30%
}

export type GlareShieldingRating =
  | 'EXCELLENT_SHIELDING'
  | 'SATISFACTORY_SHIELDING'
  | 'DISTURBING_GLARE'
  | 'CRITICAL_DISABILITY_BLINDNESS';

export interface GlareCalculationResult {
  screeningEffectivenessPct: number;
  effectiveCutoffAngleDeg: number;
  directIlluminanceWithoutScreenLux: number;
  illuminanceAtEyeLux: number;
  veilingLuminanceCdM2: number;
  deBoerComfortIndex: number;
  visualRecoveryTimeSec: number;
  blindDrivingDistanceM: number;
  disabilityGlareRiskScore: number;
  windDeflectionAngleDeg: number;
  shieldingRating: GlareShieldingRating;
  recommendationsAz: string[];
  recommendationsEn: string[];
}

export interface StatutoryGlareSanction {
  articleCode: string;
  descriptionAz: string;
  descriptionEn: string;
  baseFineAzn: number;
  discountedFineAzn: number;
  penaltyPoints: number;
  civilRestitutionAzn: number;
  totalPayableAzn: number;
}

export interface GlareChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  descriptionEn: string;
  standardRef: string;
  category: 'OPTICAL_DESIGN' | 'STRUCTURAL_WIND' | 'MAINTENANCE_INSPECTION';
  isMandatory: boolean;
}

export interface GlareExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationAz: string;
  explanationEn: string;
  legalCitation: string;
}

export interface GlareCertificate {
  certificateId: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  corridorCode: string;
  corridorName: string;
  screeningEfficiencyPct: number;
  deBoerScore: number;
  calculatedVeilingCdM2: number;
  simaDigitalUid: string;
  verificationPin: string;
  sha256Checksum: string;
  authorizedInspector: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
}

/**
 * Calculates optical anti-glare shielding, illuminance at pupil,
 * veiling luminance (Stiles-Holladay formula), De Boer comfort rating,
 * visual recovery time, and blind travel distance.
 */
export function calculateGlareShielding(params: GlareCalculationParams): GlareCalculationResult {
  const {
    vehicleSpeedKmh,
    oncomingLuminousIntensityCd,
    oncomingDistanceM,
    lateralSeparationM,
    driverEyeHeightMm,
    screenHeightMm,
    bladeSpacingMm,
    bladeAngleDeg,
    ambientIlluminanceLux,
    windGustSpeedKmh,
    bladeDefectMissingPct,
  } = params;

  // Geometry angles
  // Angle of oncoming light to driver visual axis
  const distanceHypot = Math.sqrt(
    oncomingDistanceM * oncomingDistanceM + lateralSeparationM * lateralSeparationM
  );
  const thetaRad = Math.atan2(lateralSeparationM, oncomingDistanceM);
  const thetaDeg = Math.max(1.0, (thetaRad * 180) / Math.PI);

  // Optical cutoff screening angle of the anti-glare screen vanes (EN 12676-1 Clause 4.2)
  // s = spacing, w = standard vane width (~220mm)
  const vaneWidthMm = 220;
  const bladeAngleRad = (bladeAngleDeg * Math.PI) / 180;
  // Effective cutoff angle calculation
  const cosAngle = Math.cos(bladeAngleRad);
  const sinAngle = Math.sin(bladeAngleRad);
  const cutoffAngleRad = Math.atan2(
    vaneWidthMm * cosAngle + bladeSpacingMm * sinAngle,
    bladeSpacingMm * cosAngle
  );
  const effectiveCutoffAngleDeg = Math.round(((cutoffAngleRad * 180) / Math.PI) * 10) / 10;

  // Wind load deflection angle (HDPE blade flexes under high wind velocity)
  // Caspian Khazri wind gusts (WL2 class EN 12676-1)
  const windDeflectionAngleDeg =
    Math.round(Math.pow(windGustSpeedKmh / 100, 2) * 5.8 * 10) / 10;

  // Screen height screening check (vertical cutoff)
  // Eye height vs screen height (standard mounting: 1.6m - 2.1m)
  const verticalMarginMm = screenHeightMm - driverEyeHeightMm;
  const isVerticalSufficient = verticalMarginMm >= 200; // at least 20cm above driver eye

  // Base optical obscuration factor based on angular geometry
  let geometricCoverage = 0.96;
  if (thetaDeg <= effectiveCutoffAngleDeg + 4.0) {
    geometricCoverage = 0.992;
  } else {
    geometricCoverage = Math.max(0.3, 0.992 - (thetaDeg - effectiveCutoffAngleDeg) * 0.05);
  }

  // Adjust for vertical height margin
  if (!isVerticalSufficient) {
    geometricCoverage *= Math.max(0.4, (screenHeightMm / driverEyeHeightMm) * 0.85);
  }

  // Adjust for missing/damaged blades
  const defectFactor = 1.0 - Math.min(0.6, (bladeDefectMissingPct / 100) * 1.8);
  geometricCoverage *= defectFactor;

  // Adjust for wind deflection leakage
  const windDegradation = 1.0 - Math.min(0.25, windDeflectionAngleDeg * 0.015);
  geometricCoverage *= windDegradation;

  const screeningEffectivenessPct =
    Math.min(99.8, Math.max(5.0, Math.round(geometricCoverage * 1000) / 10));

  // Direct illuminance without screen: E0 = I / (D^2 + d^2) * cos(theta)
  const directIlluminanceWithoutScreenLux =
    Math.round(((oncomingLuminousIntensityCd / (distanceHypot * distanceHypot)) * Math.cos(thetaRad)) * 100) / 100;

  // Residual illuminance at driver's pupil with anti-glare screen
  // When within cutoff screening, direct line-of-sight is physically occluded by opaque vanes;
  // residual light consists of edge scatter, gap leakage and missing blade windows.
  const residualLeakageFactor = Math.max(
    0.001,
    (1.0 - screeningEffectivenessPct / 100) * 0.05 + (bladeDefectMissingPct / 100) * 0.4
  );
  const illuminanceAtEyeLux =
    Math.round((directIlluminanceWithoutScreenLux * residualLeakageFactor + ambientIlluminanceLux * 0.01) * 1000) / 1000;

  // Veiling Luminance (Stiles-Holladay formula): Lv = (10 * E_eye) / (theta_deg^2) cd/m^2
  const veilingLuminanceCdM2 =
    Math.round(((10 * illuminanceAtEyeLux) / (thetaDeg * thetaDeg)) * 1000) / 1000;

  // De Boer Rating Scale (1 = unbearable, 3 = disturbing, 5 = just acceptable, 7 = satisfactory, 9 = unnoticeable)
  // Standard CIE De Boer formulation scaled for veiling luminance and adaptation
  const deBoerRaw =
    9.0 - 2.5 * Math.log10(1 + (veilingLuminanceCdM2 * 25) / Math.max(0.05, ambientIlluminanceLux));
  const deBoerComfortIndex = Math.min(9.0, Math.max(1.0, Math.round(deBoerRaw * 10) / 10));

  // Visual recovery time (temporary flash blindness duration)
  // Higher illuminance and lower ambient light prolong recovery
  const visualRecoveryTimeSec =
    Math.round(
      Math.min(
        5.0,
        Math.max(
          0.2,
          0.3 + 1.1 * Math.log10(1 + (illuminanceAtEyeLux * 15) / Math.max(0.05, ambientIlluminanceLux))
        )
      ) * 100
    ) / 100;

  // Blind driving distance at speed: d_blind = (v_kmh / 3.6) * t_recovery
  const speedMetersPerSec = (vehicleSpeedKmh * 1000) / 3600;
  const blindDrivingDistanceM = Math.round(speedMetersPerSec * visualRecoveryTimeSec * 10) / 10;

  // Disability Glare Risk Score (0 - 100%)
  const disabilityGlareRiskScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (100 - screeningEffectivenessPct) * 0.45 +
          (9 - deBoerComfortIndex) * 6.5 +
          veilingLuminanceCdM2 * 12
      )
    )
  );

  // Rating classification
  let shieldingRating: GlareShieldingRating;
  if (deBoerComfortIndex >= 7.0 && screeningEffectivenessPct >= 85) {
    shieldingRating = 'EXCELLENT_SHIELDING';
  } else if (deBoerComfortIndex >= 5.0 && screeningEffectivenessPct >= 70) {
    shieldingRating = 'SATISFACTORY_SHIELDING';
  } else if (deBoerComfortIndex >= 3.0) {
    shieldingRating = 'DISTURBING_GLARE';
  } else {
    shieldingRating = 'CRITICAL_DISABILITY_BLINDNESS';
  }

  // Recommendations
  const recommendationsAz: string[] = [];
  const recommendationsEn: string[] = [];

  if (screeningEffectivenessPct >= 85) {
    recommendationsAz.push(
      'Mərkəzi ayrıcı zolaqdakı EN 12676-1 anti-glare pərdələri optimal qorunma təmin edir.'
    );
    recommendationsEn.push(
      'EN 12676-1 anti-glare screens in median reservation provide optimal night glare shielding.'
    );
  } else {
    recommendationsAz.push(
      'Gözqamaşdırma dərəcəsi yüksəkdir; pərdə bucağı və ya hündürlüyü artırılmalıdır.'
    );
    recommendationsEn.push(
      'Glare level is excessive; screen vane angle or height should be increased.'
    );
  }

  if (bladeDefectMissingPct > 5) {
    recommendationsAz.push(
      `Çəpərdə ${bladeDefectMissingPct}% qırıq və ya çatışmayan pərdə aşkarlandı. AAYDA operativ təmir briqadası göndərilməlidir.`
    );
    recommendationsEn.push(
      `${bladeDefectMissingPct}% missing or broken vanes detected. Immediate AAYDA repair squad dispatch required.`
    );
  }

  if (blindDrivingDistanceM > 35) {
    recommendationsAz.push(
      `Kor sürmə məsafəsi (${blindDrivingDistanceM} m) kritikdir! YHQ 50-ci maddəyə əsasən sürət azaldılmalıdır.`
    );
    recommendationsEn.push(
      `Blind driving travel distance (${blindDrivingDistanceM} m) is critical! Reduce speed per Road Traffic Law Art. 50.`
    );
  }

  return {
    screeningEffectivenessPct,
    effectiveCutoffAngleDeg,
    directIlluminanceWithoutScreenLux,
    illuminanceAtEyeLux,
    veilingLuminanceCdM2,
    deBoerComfortIndex,
    visualRecoveryTimeSec,
    blindDrivingDistanceM,
    disabilityGlareRiskScore,
    windDeflectionAngleDeg,
    shieldingRating,
    recommendationsAz,
    recommendationsEn,
  };
}

/**
 * Calculates statutory administrative fines and civil restitution tariffs under
 * Azerbaijani legislation for illegal lighting, failure to dip high beams, or barrier collision.
 */
export function calculateStatutoryGlareSanctions(
  preset: GlareVehiclePreset
): StatutoryGlareSanction {
  let articleCode = 'YHQ Maddə 50 / İXM Maddə 329';
  let descriptionAz = 'Qanunauyğun istifadə — Cərimə tətbiq olunmur';
  let descriptionEn = 'Compliant usage — No administrative violation';
  let baseFineAzn = 0;
  let penaltyPoints = 0;
  let civilRestitutionAzn = 0;

  switch (preset.violationType) {
    case 'FAILURE_TO_DIP_HIGH_BEAM':
      articleCode = 'İXM Maddə 329 (AR İnzibati Xətalar Məcəlləsi)';
      descriptionAz =
        'Qarşıdan gələn nəqliyyat vasitəsinə 150 m qalmış uzaq vuran işıqları yaxın vuran işıqlara keçirməmək və gözqamaşdırma';
      descriptionEn =
        'Failure to dip high beams to low beams within 150m of oncoming vehicle causing acute glare';
      baseFineAzn = 30;
      penaltyPoints = 0;
      break;

    case 'ILLEGAL_UNHOMOLOGATED_LIGHTS':
      articleCode = 'İXM Maddə 342.1 (AR İnzibati Xətalar Məcəlləsi)';
      descriptionAz =
        'Standartlara uyğun olmayan qanunsuz ksenon/LED konstruktiv dəyişikliyi və blinding optik sistem';
      descriptionEn =
        'Illegal non-homologated Xenon/LED retrofit light installation causing acute blinding glare';
      baseFineAzn = 150;
      penaltyPoints = 0;
      break;

    case 'BARRIER_COLLISION_DAMAGE':
      articleCode = 'İXM Maddə 353.1 & Mülki Məcəllə Maddə 1108';
      descriptionAz =
        'Magistral yolun mərkəzi ayrıcı zolaq qoruyucu çəpərinə və anti-glare polimer panellərinə ziyan vurulması';
      descriptionEn =
        'Collision impact damage to highway median barrier and polymer anti-glare screen panels';
      baseFineAzn = 600;
      penaltyPoints = 0;
      civilRestitutionAzn = 850; // AAYDA replacement cost for 10m vanes + brackets
      break;

    case 'NONE':
    default:
      break;
  }

  // 50% prompt discount under Article 38 of Code of Administrative Offences
  const discountedFineAzn = Math.round(baseFineAzn * 0.5 * 100) / 100;
  const totalPayableAzn = discountedFineAzn + civilRestitutionAzn;

  return {
    articleCode,
    descriptionAz,
    descriptionEn,
    baseFineAzn,
    discountedFineAzn,
    penaltyPoints,
    civilRestitutionAzn,
    totalPayableAzn,
  };
}

/**
 * Evaluates the 10-point technical checklist for anti-glare screens.
 */
export function evaluateGlareChecklist(
  items: GlareChecklistItem[],
  checkedIds: string[]
): {
  checkedCount: number;
  totalCount: number;
  mandatoryCheckedCount: number;
  mandatoryTotalCount: number;
  complianceScorePct: number;
  isFullyCompliant: boolean;
} {
  const totalCount = items.length;
  const checkedSet = new Set(checkedIds);
  const checkedCount = items.filter((item) => checkedSet.has(item.id)).length;

  const mandatoryItems = items.filter((item) => item.isMandatory);
  const mandatoryTotalCount = mandatoryItems.length;
  const mandatoryCheckedCount = mandatoryItems.filter((item) => checkedSet.has(item.id)).length;

  const complianceScorePct =
    totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const isFullyCompliant =
    mandatoryCheckedCount === mandatoryTotalCount && complianceScorePct >= 90;

  return {
    checkedCount,
    totalCount,
    mandatoryCheckedCount,
    mandatoryTotalCount,
    complianceScorePct,
    isFullyCompliant,
  };
}

/**
 * Evaluates theoretical exam simulator results.
 */
export function evaluateGlareExam(
  questions: GlareExamQuestion[],
  answers: Record<string, number>
): {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
} {
  const totalQuestions = questions.length;
  let score = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctIndex) {
      score++;
    }
  });

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 80;

  return {
    score,
    totalQuestions,
    percentage,
    passed,
  };
}

/**
 * Generates an official cryptographic GLARE-SAFE-AZ-2026 clearance certificate.
 */
export function generateGlareCertificate(
  vehiclePlate: string,
  corridor: GlareCorridorStation,
  screeningEfficiencyPct: number,
  deBoerScore: number,
  veilingCdM2: number
): GlareCertificate {
  const seed = `${vehiclePlate}-${corridor.code}-${Date.now()}`;
  let hashVal = 0;
  for (let i = 0; i < seed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + seed.charCodeAt(i);
    hashVal |= 0;
  }
  const hexStr = Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0');
  const certificateId = `GLARE-SAFE-AZ-2026-${hexStr}`;

  const today = new Date();
  const issueDate = today.toISOString().split('T')[0];
  const expiry = new Date(today);
  expiry.setFullYear(today.getFullYear() + 1);
  const expiryDate = expiry.toISOString().split('T')[0];

  const simaDigitalUid = `SIMA-GLARE-${Math.abs(hashVal * 31).toString(16).toUpperCase().slice(0, 12)}`;
  const verificationPin = Math.floor(100000 + Math.random() * 900000).toString();
  const sha256Checksum = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.slice(0, 32);

  return {
    certificateId,
    issueDate,
    expiryDate,
    vehiclePlate,
    corridorCode: corridor.code,
    corridorName: corridor.nameAz,
    screeningEfficiencyPct,
    deBoerScore,
    calculatedVeilingCdM2: veilingCdM2,
    simaDigitalUid,
    verificationPin,
    sha256Checksum,
    authorizedInspector: 'AAYDA Magistral Yol Avadanlıqları İdarəsi / BDYP DYP Mühəndis Nəzarəti',
    status: 'ACTIVE',
  };
}

/**
 * Searches the mock public registry of active certificates.
 */
export function searchGlareRegistry(
  certificates: GlareCertificate[],
  query: string
): GlareCertificate[] {
  const cleanQuery = query.trim().toUpperCase();
  if (!cleanQuery) return certificates;

  return certificates.filter(
    (c) =>
      c.certificateId.toUpperCase().includes(cleanQuery) ||
      c.vehiclePlate.toUpperCase().includes(cleanQuery) ||
      c.corridorCode.toUpperCase().includes(cleanQuery) ||
      c.simaDigitalUid.toUpperCase().includes(cleanQuery)
  );
}
