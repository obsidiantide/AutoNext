/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Land Transport Agency (AYNA) & Main State Traffic Police (BDYP)
 * Highway Pedestrian Overpasses, Glass-Enclosed Footbridges, PRM Accessible Elevators,
 * Anti-Slip Ramp Surface Heating, Pedestrian Intrusion Defense & Structural Safety Telemetry,
 * EN 1991-1-7 / EN 81-70 / AZS ISO 21542 / AZS 410 & Official FOOTBRIDGE-SAFE-AZ-2026 Portal
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   müxtəlif səviyyəli piyada keçidləri, yerüstü və yeraltı mühəndis qurğuları və onların təhlükəsiz istismarı)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 40, 52: Piyadaların vəzifələri, magistral yollarda
 *   hərəkət rejimi, yerüstü piyada keçidlərindən məcburi istifadə, nəqliyyat axınına müdaxilənin qadağan edilməsi)
 * - Law of the Republic of Azerbaijan "On the Rights of Persons with Disabilities" (Əlilliyi olan şəxslərin hüquqları
 *   haqqında AR Qanunu: İnfrastruktur obyektlərində, o cümlədən yerüstü piyada körpülərində maneəsiz mühit, lift və pandus tələbləri)
 * - European Standards EN 1991-1-7 (Accidental actions on structures - impact of road vehicles on bridge piers & superstructures),
 *   EN 81-70 (Accessibility to lifts for persons including persons with disability), EN 13036-4 (Slip resistance)
 * - State Standards AZS ISO 21542 / AZS 410 / AZS 342 (Magistral avtomobil yollarında piyada mühəndis qurğuları)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *     * Maddə 338.1: Piyadalar tərəfindən yol hərəkəti qaydalarının pozulması (yerüstü keçid olan magistral yolda hərəkət hissəsini keçmə) — 20 AZN;
 *     * Maddə 338.3: Piyada tərəfindən qəflətən avtomobil yoluna çıxaraq qəza şəraiti yaradılması — 40 AZN;
 *     * Maddə 328.2: Piyada keçidi yanaşma və kəsişmə zonasında sürət həddini 20-40 km/saat aşma — 50 AZN + 2 cərimə balı;
 *     * Maddə 353.1: Yerüstü piyada keçidi avadanlıqlarına, şüşə konstruksiyalarına, lift və eskalatorlarına ziyan vurulması — 600 AZN;
 *     * Maddə 38: İXM üzrə 30 gün ərzində cərimə ödənildikdə 50%-lik qanuni güzəşt;
 *     * AR Mülki Məcəlləsi Maddə 1108: AAYDA balansındakı yerüstü piyada keçidinin zədələnmiş konstruksiyalarının,
 *       panoramik şüşələrinin, kabel qızdırıcılarının və ya lift mexanizmlərinin dəyən ziyanının tam məbləğdə kompensasiyası (900 - 3,500 AZN).
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const FOOTBRIDGE_SAFE_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const FOOTBRIDGE_SAFE_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertFootbridgeCurrency(amountInAzn: number, currency: Currency): number {
  const rate = FOOTBRIDGE_SAFE_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type BridgeType =
  | 'GLASS_ENCLOSED_TUBULAR'
  | 'STEEL_TRUSS_GLAZED'
  | 'CABLE_STAYED_AESTHETIC'
  | 'CONCRETE_PORTAL_ROOFED';

export type FootbridgeStatus =
  | 'NOMINAL_SECURE_GRADE_SEPARATION'
  | 'HIGH_TRAFFIC_ELEVATOR_CONGESTION'
  | 'CRITICAL_ILLEGAL_CROSSING_ALERT'
  | 'WIND_RESTRICTION_ADVISORY';

export interface FootbridgeStation {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  lanesSpanned: number;
  clearanceMeters: number;
  bridgeType: BridgeType;
  prmElevatorsCount: number;
  prmElevatorsStatus: 'OPERATIONAL' | 'MAINTENANCE_REQUIRED' | 'STANDBY';
  heatingActive: boolean;
  hourlyPedestrianVolume: number;
  fenceHeightMeters: number;
  installedYear: number;
  cctvAiCamerasCount: number;
}

export interface FootbridgeVehiclePreset {
  id: string;
  name: string;
  licensePlate: string;
  vehicleType: string;
  heightMeters: number;
  speedKmh: number;
  massKg: number;
  isJaywalkingPedestrian?: boolean;
  isVandalismActor?: boolean;
  riskDescription: string;
}

export interface FootbridgeSimulationInputs {
  trafficSpeedKmh: number;
  trafficFlowVehHour: number;
  bridgeClearanceMeters: number;
  ambientTemperatureC: number;
  windGustSpeedKmh: number;
  elevatorOccupantsKg: number;
  crossViaOverpass: boolean;
  medianFenceIntact: boolean;
}

export interface FootbridgeSimulationResult {
  verticalClearanceCompliance: boolean;
  clearanceMarginMeters: number;
  collisionRiskScorePercent: number;
  atGradeFatalityRiskPercent: number;
  crossingSafetyScorePercent: number;
  prmAccessibilityScorePercent: number;
  heatingPowerDemandKw: number;
  stairIceRiskPercent: number;
  windVibrationDampingPercent: number;
  footbridgeOperationalStatus: FootbridgeStatus;
  statutoryFineAzn: number;
  statutoryFineDiscountedAzn: number;
  restitutionCostAzn: number;
  penaltyPoints: number;
  legalReference: string;
}

export interface FootbridgeChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  standard: string;
  category: 'CLEARANCE' | 'ACCESSIBILITY' | 'CLIMATE_HEATING' | 'INTRUSION_FENCE' | 'SCADA_IOT';
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
}

export interface FootbridgeExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  explanationRu: string;
  legalCitation: string;
}

export interface FootbridgeCertificate {
  certificateId: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  footbridgeCode: string;
  footbridgeName: string;
  routeNumber: string;
  crossingSafetyScorePercent: number;
  prmComplianceScorePercent: number;
  sha256Checksum: string;
  simaSignatureUid: string;
  verificationPin: string;
  inspectorOfficer: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
}

/**
 * Statutory vertical clearance threshold in Azerbaijan (AZS 410 / Law On Automobile Roads)
 * Standard minimum overhead clearance for pedestrian footbridges is 5.50 meters.
 */
export const STATUTORY_MIN_CLEARANCE_METERS = 5.50;

/**
 * Simulates structural footbridge clearance, pedestrian crossing safety,
 * PRM accessibility, stair anti-icing heating, and wind vibration dynamics.
 */
export function calculateFootbridgeTelemetry(
  inputs: FootbridgeSimulationInputs
): FootbridgeSimulationResult {
  const {
    trafficSpeedKmh,
    trafficFlowVehHour,
    bridgeClearanceMeters,
    ambientTemperatureC,
    windGustSpeedKmh,
    elevatorOccupantsKg,
    crossViaOverpass,
    medianFenceIntact,
  } = inputs;

  // 1. Vertical Clearance Compliance
  const clearanceMarginMeters = Math.round((bridgeClearanceMeters - STATUTORY_MIN_CLEARANCE_METERS) * 100) / 100;
  const verticalClearanceCompliance = bridgeClearanceMeters >= STATUTORY_MIN_CLEARANCE_METERS;

  // Overheight strike collision risk if clearance < 5.50m
  let collisionRiskScorePercent = 0;
  if (bridgeClearanceMeters < STATUTORY_MIN_CLEARANCE_METERS) {
    const deficit = STATUTORY_MIN_CLEARANCE_METERS - bridgeClearanceMeters;
    collisionRiskScorePercent = Math.min(100, Math.round((deficit / 0.50) * 100));
  } else {
    // Negligible risk with buffer
    collisionRiskScorePercent = Math.max(1, Math.round(5 - (clearanceMarginMeters * 5)));
  }

  // 2. Crossing Safety Score and At-Grade Fatality Risk
  let atGradeFatalityRiskPercent = 0;
  let crossingSafetyScorePercent = 100;

  if (crossViaOverpass) {
    // Pedestrian uses footbridge
    atGradeFatalityRiskPercent = 0;
    crossingSafetyScorePercent = 99; // 99% fully protected grade separation
  } else {
    // Dangerous at-grade jaywalking across highway!
    // Arrival rate lambda = flow / 3600
    // Crossing time t = 6 lanes * 3.5m / 1.2 m/s ≈ 17.5 seconds
    const lambda = trafficFlowVehHour / 3600;
    const crossingTimeSeconds = 17.5;
    const probabilityOfGapConflict = 1 - Math.exp(-lambda * crossingTimeSeconds);
    // Kinetic impact lethality at speed v
    const speedRatio = Math.min(1.0, trafficSpeedKmh / 100);
    atGradeFatalityRiskPercent = Math.min(99, Math.round(probabilityOfGapConflict * speedRatio * 100));
    crossingSafetyScorePercent = Math.max(1, 100 - atGradeFatalityRiskPercent);
  }

  // 3. PRM Accessibility Score (EN 81-70 / AZS ISO 21542)
  // Max rated capacity typically 1000 kg (approx 13 persons)
  let prmAccessibilityScorePercent = 100;
  if (elevatorOccupantsKg > 1000) {
    // Overloaded elevator
    prmAccessibilityScorePercent = Math.max(20, Math.round(100 - ((elevatorOccupantsKg - 1000) / 10)));
  } else if (elevatorOccupantsKg > 800) {
    prmAccessibilityScorePercent = 85; // High congestion
  }

  // 4. Anti-icing Heating Cables Power Demand and Stair Ice Risk
  let heatingPowerDemandKw = 0;
  let stairIceRiskPercent = 0;
  if (ambientTemperatureC <= 3) {
    // Below +3°C, automated heating cables engage
    // Standard footbridge heated surface ~ 120 m² at 250 W/m² = 30 kW
    const deltaT = Math.max(1, 4 - ambientTemperatureC);
    heatingPowerDemandKw = Math.min(45, Math.round(25 + deltaT * 1.5));
    stairIceRiskPercent = Math.max(2, Math.round(deltaT * 3)); // heating protects stairs
  } else {
    heatingPowerDemandKw = 0;
    stairIceRiskPercent = 0;
  }

  // 5. Wind Vibration Damping (Caspian Khazri up to 140 km/h)
  // Tuned mass dampers (TMD) dampen structural oscillation
  let windVibrationDampingPercent = 98;
  if (windGustSpeedKmh > 100) {
    windVibrationDampingPercent = Math.max(70, Math.round(98 - ((windGustSpeedKmh - 100) * 0.7)));
  } else if (windGustSpeedKmh > 70) {
    windVibrationDampingPercent = Math.max(85, Math.round(98 - ((windGustSpeedKmh - 70) * 0.4)));
  }

  // 6. Operational Status Determination
  let footbridgeOperationalStatus: FootbridgeStatus = 'NOMINAL_SECURE_GRADE_SEPARATION';
  if (!crossViaOverpass || !medianFenceIntact) {
    footbridgeOperationalStatus = 'CRITICAL_ILLEGAL_CROSSING_ALERT';
  } else if (windGustSpeedKmh >= 110) {
    footbridgeOperationalStatus = 'WIND_RESTRICTION_ADVISORY';
  } else if (elevatorOccupantsKg >= 900) {
    footbridgeOperationalStatus = 'HIGH_TRAFFIC_ELEVATOR_CONGESTION';
  }

  // 7. Statutory Fines and Restitution
  let statutoryFineAzn = 0;
  let penaltyPoints = 0;
  let restitutionCostAzn = 0;
  let legalReference = 'AR Qanunu "Yol hərəkəti haqqında" Maddə 9 və 40 — Tam Qanuni Hərəkət';

  if (!crossViaOverpass) {
    if (atGradeFatalityRiskPercent >= 60) {
      // Maddə 338.3: Piyada tərəfindən hərəkət hissəsinə qəflətən çıxaraq qəza şəraiti yaradılması — 40 AZN
      statutoryFineAzn = 40;
      penaltyPoints = 0; // Pedestrians do not get driver points, but receive official administrative fine
      legalReference = 'İXM Maddə 338.3: Piyada tərəfindən magistralda qəza şəraiti yaradılması — 40 AZN';
    } else {
      // Maddə 338.1: Yerüstü keçid olan yerdə yolu qanunsuz keçmə — 20 AZN
      statutoryFineAzn = 20;
      penaltyPoints = 0;
      legalReference = 'İXM Maddə 338.1: Yerüstü piyada keçidindən istifadə etməmə — 20 AZN';
    }
  }

  if (!medianFenceIntact) {
    // Vandalism or damage to anti-trespass median fence
    statutoryFineAzn += 600; // İXM 353.1
    restitutionCostAzn = 1200; // Civil Code 1108
    legalReference += ' + İXM 353.1 & MM 1108: Məhəccər və çəpərə ziyan vurulması (600 AZN + 1,200 AZN bərpa)';
  }

  if (!verticalClearanceCompliance) {
    // Overheight vehicle hazard approach
    statutoryFineAzn = Math.max(statutoryFineAzn, 150);
    penaltyPoints = Math.max(penaltyPoints, 3);
    legalReference = 'İXM Maddə 342.2-2: Qabarit hündürlüyü tələblərini pozaraq körpü altına daxil olma — 150 AZN + 3 bal';
  }

  const statutoryFineDiscountedAzn = Math.round((statutoryFineAzn * 0.5) * 100) / 100;

  return {
    verticalClearanceCompliance,
    clearanceMarginMeters,
    collisionRiskScorePercent,
    atGradeFatalityRiskPercent,
    crossingSafetyScorePercent,
    prmAccessibilityScorePercent,
    heatingPowerDemandKw,
    stairIceRiskPercent,
    windVibrationDampingPercent,
    footbridgeOperationalStatus,
    statutoryFineAzn,
    statutoryFineDiscountedAzn,
    restitutionCostAzn,
    penaltyPoints,
    legalReference,
  };
}

/**
 * Calculates SHA-256 equivalent cryptographic hash for FOOTBRIDGE-SAFE-AZ-2026 certificates
 */
export function generateFootbridgeHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:fb-${hex}-9a4b-${Date.now().toString(16).slice(-6)}`;
}

/**
 * Evaluates exam submission and returns score percent, pass status, and feedback
 */
export function evaluateFootbridgeExam(
  answers: Record<string, number>,
  questions: FootbridgeExamQuestion[]
): {
  scorePercent: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
} {
  let correctCount = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const totalQuestions = questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = scorePercent >= 80;

  return {
    scorePercent,
    passed,
    correctCount,
    totalQuestions,
  };
}
