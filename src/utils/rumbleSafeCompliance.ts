/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Land Transport Agency (AYNA) & Main State Traffic Police (BDYP)
 * Highway Rumble Strips, Milled Shoulder & Centerline Delineation,
 * Inattentive Lane Departure & Fatigue Run-Off-Road (ROR) Crash Defense,
 * EN 1436 / FHWA T 5040.39 Acoustic & Tactile Vibration Telemetry &
 * Official RUMBLE-SAFE-AZ-2026 Portal
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   təhlükəsizlik mühəndis qurğuları, yol örtüyündə xüsusi səs-küy və titrəyiş profilləri, frezlənmiş akustik zolaqlar)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 42, 50: Yol nişanlanması xətləri,
 *   hərəkət zolaqlarının dəyişdirilməsi qaydaları, çiyinlərdə və ayırıcı zolaqlarda təhlükəsizlik rejimi)
 * - European Standard EN 1436: Road marking materials - Road marking performance for road users
 *   (Type II structured markings, retroreflectivity in wet conditions, acoustic and tactile warning ribs)
 * - US Federal Highway Administration FHWA Technical Advisory T 5040.39 (Shoulder and Centerline Rumble Strips:
 *   Milling specifications, dimensions, acoustic dBA elevation, bicycle gap patterns, snowplow durability)
 * - State Standards AZS 410 / AZS 342 (Magistral avtomobil yollarının yol mebeli və texniki təhlükəsizlik avadanlıqları)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *     * Maddə 327.1: Yol nişanlanması xətlərinin tələblərinə riayət edilməməsi, əsassız olaraq çiyinə çıxma — 40 AZN;
 *     * Maddə 327.4: Mərkəzi səs-küy zolağını və bütöv 1.1 / 1.3 xəttini tapdalayaraq qarşı hərəkət zolağına çıxma — 100 AZN + 4 cərimə balı;
 *     * Maddə 328.2: Yanaşma səs-küy zolaqları zonasında müəyyən edilmiş sürət həddini 20-40 km/saat aşma — 50 AZN + 2 bal;
 *     * Maddə 353.1: Yol örtüyünə, səs-küy zolaqlarına və mühəndis infrastrukturuna ziyan vurulması — 600 AZN;
 *     * Maddə 38: İXM üzrə 30 gün ərzində cərimə ödənildikdə 50%-lik qanuni güzəşt;
 *     * AR Mülki Məcəlləsi Maddə 1108: AAYDA balansındakı yol örtüyünə vurulmuş ziyanın tam məbləğdə kompensasiya edilməsi.
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const RUMBLE_SAFE_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const RUMBLE_SAFE_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertRumbleSafeCurrency(amountInAzn: number, currency: Currency): number {
  const rate = RUMBLE_SAFE_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type RumbleStripPattern =
  | 'MILLED_CYLINDRICAL'
  | 'MILLED_SINUSOIDAL'
  | 'RAISED_THERMOPLASTIC'
  | 'ROLLED_ASPHALT';

export type RumbleStripPlacement =
  | 'SHOULDER_EDGE'
  | 'CENTERLINE_MEDIAN'
  | 'TRANSVERSE_APPROACH'
  | 'LANE_DEPARTURE_BUFFER';

export type RumbleStationStatus =
  | 'OPERATIONAL_NOMINAL'
  | 'WEAR_INSPECTION_DUE'
  | 'WINTER_SNOW_MAINTENANCE'
  | 'HIGH_ROR_INCIDENT_ZONE';

export type TireType =
  | 'SUMMER_PASSENGER'
  | 'WINTER_STUDLESS'
  | 'COMMERCIAL_TRUCK_RADIAL'
  | 'LOW_PROFILE_SPORT';

export type DriverCognitiveState =
  | 'ALERT_NORMAL'
  | 'MILD_DROWSINESS'
  | 'SEVERE_FATIGUE_MICRO_SLEEP'
  | 'DISTRACTED_PHONE';

export type PavementType =
  | 'SMA_STONE_MASTIC'
  | 'DENSE_ASPHALT_CONCRETE'
  | 'POROUS_DRAINAGE_ASPHALT';

export interface RumbleCorridorStation {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  placement: RumbleStripPlacement;
  pattern: RumbleStripPattern;
  millingDepthMm: number;
  millingWidthMm: number;
  pitchMm: number;
  bicycleGapPattern: boolean;
  stationStatus: RumbleStationStatus;
  annualRorReductionPct: number;
  installedYear: number;
}

export interface RumbleVehiclePreset {
  id: string;
  plate: string;
  model: string;
  tireType: TireType;
  suspensionStiffnessFactor: number; // 0.8 to 1.5
  baselineCabinNoiseDba: number; // typically 62 - 70 dBA
  defaultSpeedKmh: number;
  driverState: DriverCognitiveState;
  violationType:
    | 'NONE'
    | 'SHOULDER_INCURSION'
    | 'CENTERLINE_CROSSOVER'
    | 'APPROACH_SPEEDING'
    | 'PAVEMENT_DAMAGE';
}

export interface RumbleCalculationParams {
  vehicleSpeedKmh: number; // 30 - 140 km/h
  pattern: RumbleStripPattern;
  placement: RumbleStripPlacement;
  millingDepthMm: number; // 6 - 16 mm
  millingWidthMm: number; // 150 - 500 mm
  pitchMm: number; // 200 - 1200 mm
  tireType: TireType;
  driverState: DriverCognitiveState;
  pavementType: PavementType;
  hasBicycleGapPattern: boolean;
}

export type RumbleAlertEffectiveness =
  | 'OPTIMAL_TACTILE_ALERT'
  | 'ACCEPTABLE_WARNING'
  | 'INSUFFICIENT_STIMULUS'
  | 'EXCESSIVE_NOISE_POLLUTION';

export interface RumbleCalculationResult {
  excitationFrequencyHz: number;
  soundElevationDeltaDba: number;
  totalCabinNoiseDba: number;
  steeringVibrationAccMs2: number;
  driverReactionTimeSec: number;
  recoveryDistanceM: number;
  rorCrashReductionPct: number;
  bicycleSafetyScorePct: number;
  snowplowDurabilityScorePct: number;
  effectiveness: RumbleAlertEffectiveness;
  recommendationsAz: string[];
  recommendationsEn: string[];
}

export interface StatutoryRumbleSanction {
  articleCode: string;
  descriptionAz: string;
  descriptionEn: string;
  baseFineAzn: number;
  discountedFineAzn: number;
  penaltyPoints: number;
  civilRestitutionAzn: number;
  totalPayableAzn: number;
}

export interface RumbleChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  descriptionEn: string;
  standardRef: string;
  category: 'MILLING_GEOMETRY' | 'ACOUSTIC_TACTILE' | 'ROAD_SAFETY';
  isMandatory: boolean;
}

export interface RumbleExamQuestion {
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

export interface RumbleCertificate {
  certificateId: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  corridorCode: string;
  corridorName: string;
  excitationFrequencyHz: number;
  measuredDeltaDba: number;
  vibrationAccMs2: number;
  simaDigitalUid: string;
  verificationPin: string;
  sha256Checksum: string;
  authorizedInspector: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
}

/**
 * Calculates highway rumble strip acoustic excitation frequency,
 * cabin sound pressure elevation (ΔdBA), steering wheel tactile vibration,
 * driver reaction time reduction, recovery distance, and safety metrics.
 */
export function calculateRumbleSafety(params: RumbleCalculationParams): RumbleCalculationResult {
  const {
    vehicleSpeedKmh,
    pattern,
    placement,
    millingDepthMm,
    millingWidthMm,
    pitchMm,
    tireType,
    driverState,
    pavementType,
    hasBicycleGapPattern,
  } = params;

  // Convert speed from km/h to m/s
  const speedMs = (vehicleSpeedKmh * 1000) / 3600;
  const pitchM = Math.max(0.15, pitchMm / 1000);

  // Excitation frequency f = v / p
  const excitationFrequencyHz = Math.round((speedMs / pitchM) * 10) / 10;

  // Pattern efficiency multipliers
  let patternAcousticFactor = 1.0;
  let patternTactileFactor = 1.0;
  let snowplowDurabilityScorePct = 95;

  switch (pattern) {
    case 'MILLED_CYLINDRICAL':
      patternAcousticFactor = 1.15;
      patternTactileFactor = 1.2;
      snowplowDurabilityScorePct = 98; // recessed beneath surface
      break;
    case 'MILLED_SINUSOIDAL':
      // Sinusoidal mumble strips reduce exterior noise pollution while maintaining cabin alert
      patternAcousticFactor = 0.88;
      patternTactileFactor = 0.95;
      snowplowDurabilityScorePct = 98;
      break;
    case 'RAISED_THERMOPLASTIC':
      patternAcousticFactor = 0.8;
      patternTactileFactor = 0.75;
      snowplowDurabilityScorePct = 35; // easily sheared off by winter snowplows
      break;
    case 'ROLLED_ASPHALT':
      patternAcousticFactor = 0.7;
      patternTactileFactor = 0.65;
      snowplowDurabilityScorePct = 85;
      break;
  }

  // Tire characteristics
  let tireTreadFactor = 1.0;
  let baselineCabinDba = 65;
  switch (tireType) {
    case 'SUMMER_PASSENGER':
      tireTreadFactor = 1.0;
      baselineCabinDba = 64;
      break;
    case 'WINTER_STUDLESS':
      tireTreadFactor = 1.1;
      baselineCabinDba = 66;
      break;
    case 'COMMERCIAL_TRUCK_RADIAL':
      tireTreadFactor = 1.35;
      baselineCabinDba = 71;
      break;
    case 'LOW_PROFILE_SPORT':
      tireTreadFactor = 1.15;
      baselineCabinDba = 67;
      break;
  }

  // Pavement acoustic absorption
  let pavementAbsorption = 1.0;
  if (pavementType === 'POROUS_DRAINAGE_ASPHALT') {
    pavementAbsorption = 0.85; // absorbs ~2-3 dB
  } else if (pavementType === 'SMA_STONE_MASTIC') {
    pavementAbsorption = 1.05;
  }

  // Acoustic elevation: ΔdBA = function of depth, width, speed, pattern
  // Optimal depth is 10-13 mm according to FHWA T 5040.39 and EN 1436.
  const depthFactor = Math.min(1.5, millingDepthMm / 10.0);
  const widthFactor = Math.min(1.3, millingWidthMm / 350.0);
  const speedNoiseMultiplier = Math.pow(vehicleSpeedKmh / 90.0, 0.45);

  const rawDeltaDba =
    10.5 * depthFactor * widthFactor * speedNoiseMultiplier * patternAcousticFactor * tireTreadFactor * pavementAbsorption;
  const soundElevationDeltaDba = Math.round(Math.max(2.5, Math.min(22.0, rawDeltaDba)) * 10) / 10;
  const totalCabinNoiseDba = Math.round((baselineCabinDba + soundElevationDeltaDba) * 10) / 10;

  // Steering wheel tactile vibration acceleration (m/s²)
  // a_vib = function of depth, speed, and pattern
  const rawVibrationAcc =
    (0.12 * millingDepthMm * (vehicleSpeedKmh / 90.0) * patternTactileFactor * (tireType === 'LOW_PROFILE_SPORT' ? 1.25 : 1.0));
  const steeringVibrationAccMs2 = Math.round(Math.max(0.3, Math.min(4.8, rawVibrationAcc)) * 100) / 100;

  // Driver reaction time based on cognitive state & alert magnitude
  let baselineReactionTimeSec = 1.2;
  switch (driverState) {
    case 'ALERT_NORMAL':
      baselineReactionTimeSec = 0.9;
      break;
    case 'MILD_DROWSINESS':
      baselineReactionTimeSec = 1.6;
      break;
    case 'SEVERE_FATIGUE_MICRO_SLEEP':
      baselineReactionTimeSec = 2.4;
      break;
    case 'DISTRACTED_PHONE':
      baselineReactionTimeSec = 2.0;
      break;
  }

  // Stimulus magnitude factor: combining acoustic ΔdBA and tactile vibration
  const stimulusStrength = Math.min(1.0, (soundElevationDeltaDba / 12.0) * 0.5 + (steeringVibrationAccMs2 / 2.0) * 0.5);
  // Stimulus cuts reaction delay dramatically
  const driverReactionTimeSec =
    Math.round(Math.max(0.42, baselineReactionTimeSec * (1.0 - stimulusStrength * 0.62)) * 100) / 100;

  // Recovery distance: distance traversed before corrective steering action takes effect
  // d = v * t_reaction + steering transient (~0.4s)
  const recoveryDistanceM = Math.round((speedMs * (driverReactionTimeSec + 0.35)) * 10) / 10;

  // Run-off-road (ROR) / Head-on collision reduction percentage
  let baseRorReduction = 58; // empirical 50-65% reduction
  if (placement === 'CENTERLINE_MEDIAN') {
    baseRorReduction = 64; // centerline strips prevent fatal head-on crossovers
  } else if (placement === 'TRANSVERSE_APPROACH') {
    baseRorReduction = 48; // speed reduction warning
  }
  const rorCrashReductionPct = Math.min(
    76,
    Math.round((baseRorReduction * Math.min(1.15, stimulusStrength * 1.1)) * 10) / 10
  );

  // Bicycle & Vulnerable Road User Safety Score
  let bicycleSafetyScorePct = 50;
  if (hasBicycleGapPattern) {
    bicycleSafetyScorePct = 94; // 3.0-3.6m gap allows easy bicycle crossing
  } else if (placement === 'CENTERLINE_MEDIAN' || placement === 'TRANSVERSE_APPROACH') {
    bicycleSafetyScorePct = 80; // bicycles ride on outer shoulder, centerline doesn't impede
  } else {
    bicycleSafetyScorePct = 38; // continuous shoulder milling without gaps forces cyclists into travel lane
  }

  // Effectiveness evaluation
  let effectiveness: RumbleAlertEffectiveness = 'ACCEPTABLE_WARNING';
  if (soundElevationDeltaDba >= 8.0 && steeringVibrationAccMs2 >= 1.2) {
    if (soundElevationDeltaDba > 18.0) {
      effectiveness = 'EXCESSIVE_NOISE_POLLUTION';
    } else {
      effectiveness = 'OPTIMAL_TACTILE_ALERT';
    }
  } else if (soundElevationDeltaDba < 5.0 || steeringVibrationAccMs2 < 0.7) {
    effectiveness = 'INSUFFICIENT_STIMULUS';
  } else {
    effectiveness = 'ACCEPTABLE_WARNING';
  }

  // Statutory recommendations
  const recommendationsAz: string[] = [];
  const recommendationsEn: string[] = [];

  if (soundElevationDeltaDba < 6.0) {
    recommendationsAz.push(
      'Akustik səs artımı (ΔdBA < 6.0) qeyri-kafi hesab olunur; frezlənmə dərinliyi 10-12 mm-ə qədər artırılmalıdır.'
    );
    recommendationsEn.push(
      'Acoustic sound elevation (ΔdBA < 6.0) is insufficient; milling depth should be increased to 10-12 mm.'
    );
  } else if (soundElevationDeltaDba > 18.0) {
    recommendationsAz.push(
      'Səs-küy dərəcəsi həddindən artıq yüksəkdir (>18 dBA); yaşayış məntəqələri yaxınlığında sinusoidal profillər (mumble strips) tətbiq edilməlidir.'
    );
    recommendationsEn.push(
      'Noise level is excessively high (>18 dBA); sinusoidal profiles (mumble strips) should be used near residential areas.'
    );
  }

  if (placement === 'SHOULDER_EDGE' && !hasBicycleGapPattern) {
    recommendationsAz.push(
      'Magistral çiyin zolağında velosiped və motosikletçilərin təhlükəsiz keçidi üçün hər 15-18 metrdən bir 3.6 metrlik qanuni boşluq (gap pattern) təmin edilməlidir.'
    );
    recommendationsEn.push(
      'For safe bicycle and motorcycle crossing on shoulders, statutory 3.6m gap patterns must be provided every 15-18 meters.'
    );
  }

  if (pattern === 'RAISED_THERMOPLASTIC') {
    recommendationsAz.push(
      'Qış aylarında qar təmizləyən texnikanın (qar kotanları) qabarıq zolaqları qoparmaması üçün AAYDA standartı üzrə frezlənmiş (milled) batıq profilə keçid tövsiyə olunur.'
    );
    recommendationsEn.push(
      'To prevent winter snowplow blades from tearing off raised markings, transition to AAYDA standard recessed milled profile is recommended.'
    );
  }

  if (recommendationsAz.length === 0) {
    recommendationsAz.push(
      'Səs-küy zolağı EN 1436 və FHWA T 5040.39 texniki tələblərinə tam uyğundur; vibrasiya və akustik xəbərdarlıq optimal səviyyədədir.'
    );
    recommendationsEn.push(
      'Rumble strip strictly complies with EN 1436 and FHWA T 5040.39 standards; vibration and acoustic alerting are at optimal levels.'
    );
  }

  return {
    excitationFrequencyHz,
    soundElevationDeltaDba,
    totalCabinNoiseDba,
    steeringVibrationAccMs2,
    driverReactionTimeSec,
    recoveryDistanceM,
    rorCrashReductionPct,
    bicycleSafetyScorePct,
    snowplowDurabilityScorePct,
    effectiveness,
    recommendationsAz,
    recommendationsEn,
  };
}

/**
 * Calculates statutory fines, penalty points, and asset restitution under Azerbaijani law.
 */
export function calculateRumbleSanctions(
  violationType:
    | 'NONE'
    | 'SHOULDER_INCURSION'
    | 'CENTERLINE_CROSSOVER'
    | 'APPROACH_SPEEDING'
    | 'PAVEMENT_DAMAGE',
  currency: Currency = 'AZN'
): StatutoryRumbleSanction {
  let articleCode = 'İXM Maddə 327.1';
  let descriptionAz = 'Qaydaların pozulması faktı qeydə alınmayıb.';
  let descriptionEn = 'No traffic violation recorded.';
  let baseFineAzn = 0;
  let penaltyPoints = 0;
  let civilRestitutionAzn = 0;

  switch (violationType) {
    case 'SHOULDER_INCURSION':
      articleCode = 'İXM Maddə 327.1';
      descriptionAz =
        'Yol nişanlanması xətlərinin tələblərinə riayət edilməməsi, əsassız olaraq çiyin səs-küy zolağına çıxma və hərəkət qaydasının pozulması';
      descriptionEn =
        'Failure to comply with road marking requirements, unauthorized shoulder rumble strip crossing and unsafe movement';
      baseFineAzn = 40;
      penaltyPoints = 0;
      civilRestitutionAzn = 0;
      break;

    case 'CENTERLINE_CROSSOVER':
      articleCode = 'İXM Maddə 327.4';
      descriptionAz =
        'Mərkəzi səs-küy zolağını və bütöv 1.1 / 1.3 qoşa nişanlanma xəttini tapdalayaraq qarşı hərəkət zolağına çıxma və ötmə əməliyyatı';
      descriptionEn =
        'Crossing centerline rumble strip and continuous double dividing line 1.1/1.3 into oncoming traffic lane';
      baseFineAzn = 100;
      penaltyPoints = 4;
      civilRestitutionAzn = 0;
      break;

    case 'APPROACH_SPEEDING':
      articleCode = 'İXM Maddə 328.2';
      descriptionAz =
        'Yol ayrıclarında və təhlükəli döngələrdə eninə xəbərdaredici səs-küy zolaqları zonasında müəyyən edilmiş sürət həddini 20-40 km/saat aşma';
      descriptionEn =
        'Exceeding established speed limit by 20-40 km/h in transverse deceleration rumble strip hazard warning zone';
      baseFineAzn = 50;
      penaltyPoints = 2;
      civilRestitutionAzn = 0;
      break;

    case 'PAVEMENT_DAMAGE':
      articleCode = 'İXM Maddə 353.1 & MM 1108';
      descriptionAz =
        'AAYDA balansındakı yol örtüyünə, frezlənmiş səs-küy zolağı strukturuna və bərkidici qatına mexaniki ziyan vurulması və bərpa xərcləri';
      descriptionEn =
        'Inflicting mechanical damage to AAYDA roadway pavement, milled rumble strip structure and restoration restitution';
      baseFineAzn = 600;
      penaltyPoints = 0;
      civilRestitutionAzn = 450;
      break;

    case 'NONE':
    default:
      break;
  }

  // 50% statutory discount under Article 38 of the Code of Administrative Offences if paid within 30 days
  const discountedFineAzn = Math.round(baseFineAzn * 0.5 * 100) / 100;
  const totalPayableAzn = discountedFineAzn + civilRestitutionAzn;

  return {
    articleCode,
    descriptionAz,
    descriptionEn,
    baseFineAzn: convertRumbleSafeCurrency(baseFineAzn, currency),
    discountedFineAzn: convertRumbleSafeCurrency(discountedFineAzn, currency),
    penaltyPoints,
    civilRestitutionAzn: convertRumbleSafeCurrency(civilRestitutionAzn, currency),
    totalPayableAzn: convertRumbleSafeCurrency(totalPayableAzn, currency),
  };
}

/**
 * Generates an official RUMBLE-SAFE-AZ-2026 electronic certificate with cryptographic checksum.
 */
export function generateRumbleCertificate(params: {
  vehiclePlate: string;
  corridorCode: string;
  corridorName: string;
  excitationFrequencyHz: number;
  measuredDeltaDba: number;
  vibrationAccMs2: number;
  authorizedInspector?: string;
}): RumbleCertificate {
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const certificateId = `RUMBLE-SAFE-AZ-2026-${randomHash}`;
  const simaDigitalUid = `SIMA-RUMBLE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const verificationPin = Math.floor(100000 + Math.random() * 900000).toString();

  // Pseudo-SHA-256 hash
  const rawString = `${certificateId}:${params.vehiclePlate}:${params.corridorCode}:${params.measuredDeltaDba}:${issueDate}`;
  let hashVal = 0;
  for (let i = 0; i < rawString.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawString.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256Checksum =
    Math.abs(hashVal).toString(16).padStart(8, '0') +
    'e94d812ca493f0b83c74901a5e128dfa32b6';

  return {
    certificateId,
    issueDate,
    expiryDate,
    vehiclePlate: params.vehiclePlate,
    corridorCode: params.corridorCode,
    corridorName: params.corridorName,
    excitationFrequencyHz: params.excitationFrequencyHz,
    measuredDeltaDba: params.measuredDeltaDba,
    vibrationAccMs2: params.vibrationAccMs2,
    simaDigitalUid,
    verificationPin,
    sha256Checksum,
    authorizedInspector: params.authorizedInspector || 'AAYDA Magistral Yollar Texniki Təhlükəsizlik Müfəttişliyi #14',
    status: 'ACTIVE',
  };
}

/**
 * Evaluates the 10-point technical checklist for highway rumble strips.
 */
export function evaluateRumbleChecklist(
  items: RumbleChecklistItem[],
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
export function evaluateRumbleExam(
  questions: RumbleExamQuestion[],
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
 * Searches the mock public registry of active rumble strip safety certificates.
 */
export function searchRumbleRegistry(
  certificates: RumbleCertificate[],
  query: string
): RumbleCertificate[] {
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

