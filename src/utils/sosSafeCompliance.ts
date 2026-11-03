/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Emergency Situations (FHN) & Main State Traffic Police (BDYP)
 * Highway Emergency Call Box (SOS / ERT), Roadside Optical Fiber SCADA Intercom &
 * Shoulder Breakdown Safety Compliance Engine (SOS-SAFE-AZ-2026)
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında texniki rabitə şəbəkələri, qəza çağırış sütunları və yol avadanlıqlarının mühafizəsi)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 43, 50: Məcburi dayanma zamanı sürücünün və sərnişinlərin təhlükəsizlik qaydaları, qəza dayanma nişanı və işıqqaytarıcı jilet)
 * - Law of the Republic of Azerbaijan "On Civil Defense and Emergency Situations" (Maddə 6, 12, 19: 112 və 902 təcili çağırış xidmətləri ilə koordinasiya)
 * - State Standards AZS 410 / AZS 342, EN 301 511 (GSM/VoIP Emergency Telephony), EN 50121, EN ISO 20471 (High-Visibility Warning Clothing)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 330, 327.1, 353.1, 38)
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export type SosEmergencyType =
  | 'MECHANICAL_BREAKDOWN'
  | 'MEDICAL_EMERGENCY'
  | 'TRAFFIC_COLLISION'
  | 'HAZMAT_FIRE'
  | 'OBSTACLE_HAZARD';

export type ShoulderType =
  | 'PAVED_HARD_SHOULDER'
  | 'NARROW_GRAVEL_SHOULDER'
  | 'BRIDGE_VIADUCT_REFUGE'
  | 'TUNNEL_EMERGENCY_BAY';

export type PillarPowerStatus = 'SOLAR_ACTIVE' | 'BATTERY_RESERVE' | 'GRID_FEED';

export interface SosPillarAsset {
  id: string;
  code: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  kmNumeric: number;
  gpsLat: number;
  gpsLng: number;
  side: 'NORTHBOUND' | 'SOUTHBOUND' | 'MEDIAN';
  opticalFiberLatencyMs: number;
  solarBatterySoC: number;
  cctvCoverage: boolean;
  assignedDispatchHub: string;
  status: 'OPERATIONAL' | 'STANDBY' | 'MAINTENANCE_REQUIRED';
  lastPingTimestamp: string;
}

export interface SosVehiclePreset {
  id: string;
  name: string;
  plate: string;
  vehicleType: string;
  grossWeightKg: number;
  warningTriangleEquipped: boolean;
  highVisVestCount: number;
  flashersOperational: boolean;
  occupantCount: number;
}

export interface SosSimulationInput {
  distanceToPillarM: number; // 10 to 2000m
  triangleDistanceM: number; // 0 to 150m
  shoulderType: ShoulderType;
  emergencyType: SosEmergencyType;
  vestWorn: boolean;
  hazardLightsOn: boolean;
  trafficSpeedKmH: number; // 40 to 140 km/h
  trafficFlowVehPerHour: number; // 200 to 3500 veh/h
  ambientCondition: 'DAY_CLEAR' | 'NIGHT_LIT' | 'NIGHT_DARK' | 'RAIN_FOG';
}

export interface StatutoryFine {
  code: string;
  article: string;
  description: string;
  baseFineAZN: number;
  discountedFineAZN: number;
  penaltyPoints: number;
}

export interface SosSimulationResult {
  walkingTimeSec: number;
  walkingTimeMin: number;
  pedestrianExposureRiskPercent: number;
  pedestrianSafetyStatus: 'SECURE_REFUGE' | 'ACCEPTABLE' | 'ELEVATED_DANGER' | 'CRITICAL_HAZARD';
  triangleCompliance: {
    requiredMinDistanceM: number;
    actualDistanceM: number;
    isCompliant: boolean;
    statusMessage: string;
  };
  vestCompliance: {
    isCompliant: boolean;
    statusMessage: string;
  };
  hazardFlasherCompliance: {
    isCompliant: boolean;
    statusMessage: string;
  };
  dispatchEtaMinutes: number;
  dispatchAgency: string;
  solarTelemetryHealth: {
    powerStatus: PillarPowerStatus;
    batteryAutonomyHours: number;
    transmissionSpeedMbps: number;
    connectionQuality: 'EXCELLENT' | 'GOOD' | 'DEGRADED';
  };
  statutoryFines: StatutoryFine[];
  totalFineAZN: number;
  totalDiscountedFineAZN: number;
  totalPenaltyPoints: number;
  overallSafetyIndexPercent: number;
  recommendations: string[];
}

export interface SosChecklistItem {
  id: string;
  title: string;
  description: string;
  standard: string;
  isMandatory: boolean;
}

export interface SosExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  legalCitation: string;
  explanation: string;
}

export interface SosSafeCertificate {
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  vehicleModel: string;
  corridorCode: string;
  picketKm: string;
  emergencyType: SosEmergencyType;
  dispatchReference: string;
  safetyIndexPercent: number;
  simaSignatureUid: string;
  verificationPin: string;
  qrCodeData: string;
  sha256Hash: string;
  status: 'VALID' | 'PROCESSED' | 'ARCHIVED';
}

const EXCHANGE_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = ~0.5882 USD (1.70 AZN/USD)
  EUR: 0.5435, // 1 AZN = ~0.5435 EUR (1.84 AZN/EUR)
};

export const convertSosCurrency = (amountInAZN: number, currency: Currency): number => {
  const rate = EXCHANGE_RATES[currency] || 1.0;
  return Number((amountInAZN * rate).toFixed(2));
};

export const calculateSosRoadsideSafety = (
  input: SosSimulationInput,
  pillar: SosPillarAsset,
  vehicle: SosVehiclePreset
): SosSimulationResult => {
  // Walking speed on roadside shoulder: ~1.2 m/s
  const walkingSpeedMps = 1.2;
  const walkingTimeSec = Math.round(input.distanceToPillarM / walkingSpeedMps);
  const walkingTimeMin = Number((walkingTimeSec / 60).toFixed(1));

  // Minimum required distance for warning triangle:
  // Under Law "On Road Traffic" Article 43:
  // - In built-up areas: >= 15m
  // - Outside built-up areas: >= 30m
  // - On highways / expressways: >= 50m
  const requiredMinDistanceM = 50;
  const triangleCompliant = input.triangleDistanceM >= requiredMinDistanceM;
  const vestCompliant = input.vestWorn || vehicle.highVisVestCount > 0 && input.vestWorn;
  const flashersCompliant = input.hazardLightsOn && vehicle.flashersOperational;

  // Pedestrian exposure risk calculation
  // Factors: distance to walk along traffic, traffic speed, ambient visibility, shoulder width
  let shoulderPenalty = 1.0;
  switch (input.shoulderType) {
    case 'PAVED_HARD_SHOULDER':
      shoulderPenalty = 0.5;
      break;
    case 'NARROW_GRAVEL_SHOULDER':
      shoulderPenalty = 1.3;
      break;
    case 'BRIDGE_VIADUCT_REFUGE':
      shoulderPenalty = 1.5;
      break;
    case 'TUNNEL_EMERGENCY_BAY':
      shoulderPenalty = 1.2;
      break;
  }

  let ambientPenalty = 1.0;
  switch (input.ambientCondition) {
    case 'DAY_CLEAR':
      ambientPenalty = 0.6;
      break;
    case 'NIGHT_LIT':
      ambientPenalty = 1.0;
      break;
    case 'NIGHT_DARK':
      ambientPenalty = 1.8;
      break;
    case 'RAIN_FOG':
      ambientPenalty = 2.2;
      break;
  }

  const speedFactor = input.trafficSpeedKmH / 100;
  const trafficFactor = Math.min(2.0, input.trafficFlowVehPerHour / 1200);

  // Baseline risk: scaled by distance and time
  const baselineRisk = (input.distanceToPillarM / 1000) * 40 * speedFactor * trafficFactor * shoulderPenalty * ambientPenalty;

  // Vest reduction: -40% risk
  const vestModifier = vestCompliant ? 0.6 : 1.4;

  let calculatedRisk = baselineRisk * vestModifier;
  calculatedRisk = Math.min(100, Math.max(5, Math.round(calculatedRisk)));

  let pedestrianSafetyStatus: 'SECURE_REFUGE' | 'ACCEPTABLE' | 'ELEVATED_DANGER' | 'CRITICAL_HAZARD';
  if (calculatedRisk < 25) {
    pedestrianSafetyStatus = 'SECURE_REFUGE';
  } else if (calculatedRisk < 50) {
    pedestrianSafetyStatus = 'ACCEPTABLE';
  } else if (calculatedRisk < 75) {
    pedestrianSafetyStatus = 'ELEVATED_DANGER';
  } else {
    pedestrianSafetyStatus = 'CRITICAL_HAZARD';
  }

  // Dispatch Agency & Response ETA
  let dispatchAgency = 'AAYDA 156 Yol Xidməti & BDYP 902';
  let baseEtaMin = 12;
  switch (input.emergencyType) {
    case 'MEDICAL_EMERGENCY':
      dispatchAgency = 'TƏBİB 113 / 103 Təcili Tibbi Yardım & BDYP Yaşıl Dəhliz';
      baseEtaMin = 9;
      break;
    case 'HAZMAT_FIRE':
      dispatchAgency = 'FHN 112 Xilasetmə və Yanğından Mühafizə & AAYDA';
      baseEtaMin = 10;
      break;
    case 'TRAFFIC_COLLISION':
      dispatchAgency = 'BDYP 902 Yol Polisi Patrulu & AAYDA Qəza Xidməti';
      baseEtaMin = 11;
      break;
    case 'OBSTACLE_HAZARD':
      dispatchAgency = 'AAYDA 156 Patrul Briqadası';
      baseEtaMin = 15;
      break;
    case 'MECHANICAL_BREAKDOWN':
    default:
      dispatchAgency = 'AAYDA 156 Evakuator & Mobil Texniki Kömək';
      baseEtaMin = 14;
      break;
  }

  // Telemetry impact on ETA
  if (pillar.opticalFiberLatencyMs > 50 || pillar.status === 'MAINTENANCE_REQUIRED') {
    baseEtaMin += 3;
  }
  const dispatchEtaMinutes = baseEtaMin;

  // Solar and battery telemetry
  let powerStatus: PillarPowerStatus = 'SOLAR_ACTIVE';
  if (pillar.solarBatterySoC < 30) {
    powerStatus = 'BATTERY_RESERVE';
  }
  const batteryAutonomyHours = Math.round((pillar.solarBatterySoC / 100) * 96); // up to 96 hours reserve
  const transmissionSpeedMbps = pillar.opticalFiberLatencyMs < 20 ? 100 : 25;
  const connectionQuality = pillar.opticalFiberLatencyMs < 20 ? 'EXCELLENT' : pillar.opticalFiberLatencyMs < 60 ? 'GOOD' : 'DEGRADED';

  // Statutory Fines evaluation
  const statutoryFines: StatutoryFine[] = [];

  // İXM Article 330: Qəza işıq siqnalının qoşulmaması və ya qəza dayanma nişanının qoyulmaması (40 AZN)
  if (!flashersCompliant || !triangleCompliant) {
    statutoryFines.push({
      code: 'İXM-330',
      article: 'İnzibati Xətalar Məcəlləsi Maddə 330',
      description: 'Məcburi dayanma zamanı qəza işıq siqnalının qoşulmamasına və ya qəza dayanma nişanının tələb olunan məsafədə (min 50m) quraşdırılmamasına görə',
      baseFineAZN: 40,
      discountedFineAZN: 20, // 50% discount under Article 38
      penaltyPoints: 0,
    });
  }

  // İXM Article 327.1: Magistral yolun hərəkət hissəsində və ya yol çiyinində qanunsuz dayanma (40 AZN)
  if (input.shoulderType === 'BRIDGE_VIADUCT_REFUGE' && !vestCompliant) {
    statutoryFines.push({
      code: 'İXM-327.1',
      article: 'İnzibati Xətalar Məcəlləsi Maddə 327.1',
      description: 'Magistral yolun körpü və ya yolötürücü hissəsində təhlükəsizlik qaydalarını pozaraq nəqliyyat vasitəsini tərk etmə',
      baseFineAZN: 40,
      discountedFineAZN: 20,
      penaltyPoints: 1,
    });
  }

  const totalFineAZN = statutoryFines.reduce((sum, f) => sum + f.baseFineAZN, 0);
  const totalDiscountedFineAZN = statutoryFines.reduce((sum, f) => sum + f.discountedFineAZN, 0);
  const totalPenaltyPoints = statutoryFines.reduce((sum, f) => sum + f.penaltyPoints, 0);

  // Overall Safety Index (0-100%)
  let safetyScore = 100;
  if (!triangleCompliant) safetyScore -= 25;
  if (!vestCompliant) safetyScore -= 25;
  if (!flashersCompliant) safetyScore -= 20;
  if (calculatedRisk > 50) safetyScore -= 20;
  if (pillar.solarBatterySoC < 30) safetyScore -= 10;
  const overallSafetyIndexPercent = Math.max(10, Math.min(100, safetyScore));

  const recommendations: string[] = [];
  if (!vestCompliant) {
    recommendations.push('YHQ Maddə 37: Nəqliyyat vasitəsindən düşməzdən əvvəl mütləq işıqqaytarıcı jilet (EN ISO 20471) geyinin.');
  }
  if (!triangleCompliant) {
    recommendations.push(`YHQ Maddə 43: Qəza dayanma nişanını nəqliyyat vasitəsindən ən azı ${requiredMinDistanceM} metr məsafədə hərəkət istiqamətinə qarşı quraşdırın.`);
  }
  if (!flashersCompliant) {
    recommendations.push('Məcburi dayanma zamanı qəza işıq siqnalını (avariya) dərhal aktivləşdirin.');
  }
  if (input.distanceToPillarM > 300) {
    recommendations.push(`SOS sütunu ${input.distanceToPillarM}m məsafədədir. Yolda piyada hərəkət etmək əvəzinə təhlükəsiz yol baryerinin arxasında gözləyərək mobil 112/902 xidmətinə də zəng edə bilərsiniz.`);
  } else {
    recommendations.push(`Yol kənarındakı SOS sütununa (${pillar.code}) doğru metal baryerin arxasından ehtiyatla irəliləyin və düyməni sıxaraq dispetçerlə əlaqə qurun.`);
  }

  return {
    walkingTimeSec,
    walkingTimeMin,
    pedestrianExposureRiskPercent: calculatedRisk,
    pedestrianSafetyStatus,
    triangleCompliance: {
      requiredMinDistanceM,
      actualDistanceM: input.triangleDistanceM,
      isCompliant: triangleCompliant,
      statusMessage: triangleCompliant
        ? `Qanuni tələb ödənilib: ${input.triangleDistanceM}m >= ${requiredMinDistanceM}m`
        : `Qeyri-kafi məsafə: ${input.triangleDistanceM}m < ${requiredMinDistanceM}m (İXM Maddə 330 cərimə riski)`,
    },
    vestCompliance: {
      isCompliant: vestCompliant,
      statusMessage: vestCompliant
        ? 'İşıqqaytarıcı jilet geyinilib (YHQ Maddə 37 standartı təmin olunub)'
        : 'İşıqqaytarıcı jilet geyinilməyib! Qaranlıqda piyadanın görünüşü kəskin azalır',
    },
    hazardFlasherCompliance: {
      isCompliant: flashersCompliant,
      statusMessage: flashersCompliant
        ? 'Qəza işıq siqnalı aktivdir'
        : 'Qəza işıq siqnalı sönülüdür və ya nasazdır',
    },
    dispatchEtaMinutes,
    dispatchAgency,
    solarTelemetryHealth: {
      powerStatus,
      batteryAutonomyHours,
      transmissionSpeedMbps,
      connectionQuality,
    },
    statutoryFines,
    totalFineAZN,
    totalDiscountedFineAZN,
    totalPenaltyPoints,
    overallSafetyIndexPercent,
    recommendations,
  };
};

export const evaluateSosChecklist = (
  checkedIds: string[],
  items: SosChecklistItem[]
): {
  totalItems: number;
  completedItems: number;
  mandatoryTotal: number;
  mandatoryCompleted: number;
  compliancePercentage: number;
  isFullyCompliant: boolean;
} => {
  const totalItems = items.length;
  const completedItems = checkedIds.length;
  const mandatoryItems = items.filter((item) => item.isMandatory);
  const mandatoryTotal = mandatoryItems.length;
  const mandatoryCompleted = mandatoryItems.filter((item) => checkedIds.includes(item.id)).length;
  const compliancePercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isFullyCompliant = mandatoryCompleted === mandatoryTotal && compliancePercentage >= 90;

  return {
    totalItems,
    completedItems,
    mandatoryTotal,
    mandatoryCompleted,
    compliancePercentage,
    isFullyCompliant,
  };
};

export const gradeSosExam = (
  answers: Record<string, number>,
  questions: SosExamQuestion[]
): {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
} => {
  const totalQuestions = questions.length;
  let correctAnswers = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correctAnswers++;
    }
  });

  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const passed = scorePercentage >= 80;

  return {
    totalQuestions,
    correctAnswers,
    scorePercentage,
    passed,
  };
};

export const generateSosSafeCertificate = (
  pillar: SosPillarAsset,
  vehicle: SosVehiclePreset,
  emergencyType: SosEmergencyType,
  safetyIndex: number
): SosSafeCertificate => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `SOS-SAFE-AZ-2026-${randomSuffix}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiryDate = expiry.toISOString().split('T')[0];
  const dispatchReference = `DISPATCH-ERT-${pillar.code}-${randomSuffix}`;
  const simaSignatureUid = `SIMA-AZ-ERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
  const verificationPin = `${Math.floor(1000 + Math.random() * 9000)}`;

  const rawHashInput = `${certificateNumber}|${vehicle.plate}|${pillar.code}|${emergencyType}|${safetyIndex}|${issueDate}`;
  // Simple deterministic SHA-256 mock hash
  let hashVal = 0;
  for (let i = 0; i < rawHashInput.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHashInput.charCodeAt(i);
    hashVal |= 0;
  }
  const sha256Hash = `SHA256-${Math.abs(hashVal).toString(16).padStart(16, '0')}${Math.abs(hashVal * 31).toString(16).padStart(16, '0')}`.toUpperCase();

  const qrCodeData = `https://aayda.gov.az/az/sos-safe/verify?cert=${certificateNumber}&plate=${encodeURIComponent(vehicle.plate)}&pin=${verificationPin}&hash=${sha256Hash}`;

  return {
    certificateNumber,
    issueDate,
    expiryDate,
    vehiclePlate: vehicle.plate,
    vehicleModel: vehicle.name,
    corridorCode: pillar.code,
    picketKm: pillar.picketKm,
    emergencyType,
    dispatchReference,
    safetyIndexPercent: safetyIndex,
    simaSignatureUid,
    verificationPin,
    qrCodeData,
    sha256Hash,
    status: 'VALID',
  };
};

export const searchSosCertificates = (
  query: string,
  certificates: SosSafeCertificate[]
): SosSafeCertificate[] => {
  if (!query || query.trim() === '') {
    return certificates;
  }
  const clean = query.trim().toLowerCase();
  return certificates.filter(
    (c) =>
      c.certificateNumber.toLowerCase().includes(clean) ||
      c.vehiclePlate.toLowerCase().includes(clean) ||
      c.corridorCode.toLowerCase().includes(clean) ||
      c.picketKm.toLowerCase().includes(clean) ||
      c.dispatchReference.toLowerCase().includes(clean)
  );
};
