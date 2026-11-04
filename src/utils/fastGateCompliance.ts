/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Emergency Situations (FHN) & Main State Traffic Police (BDYP)
 * Highway Emergency Median Crossover, Automated Fast-Gate Steel Barrier,
 * Reversible Contraflow SCADA Telemetry & Official FAST-GATE-AZ-2026 Portal
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   mühəndis qurğuları, mərkəzi ayrıcı zolağın texnoloji və qəza-xilasetmə keçidləri, avtomatlaşdırılmış idarəetmə)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 42, 47: Magistral yollarda və
 *   ayrıcı zolaqlarda manevr qaydaları; texnoloji kəsiklərdən yalnız operativ və icazəli nəqliyyatın istifadə hüququ;
 *   mülki nəqliyyat vasitələrinin qanunsuz U-turn və əks istiqamətdə hərəkət qadağası)
 * - European Standards EN 1317-1/2 (Vehicle Restraint Systems - Crash testing for removable steel median barriers,
 *   containment classes H2 & H4b, working width W3/W4) and EN 50556 / EN 12675
 * - State Standards AZS 410 / AZS 342 (Magistral avtomobil yollarının yol mebeli və hərəkətin təşkili vasitələri)
 * - PIARC (World Road Association) Guidelines on Highway Median Crossover Openings and Contraflow Traffic Operation
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *     * Maddə 327.4: Magistral yolda mərkəzi ayrıcı zolağın texnoloji kəsiyindən qanunsuz U-turn / əks axına çıxış - 100 AZN + 4 bal;
 *     * Maddə 327.1: Zolaqlar üzrə təyin edilmiş hərəkət istiqamətlərinin və contraflow işarələrinin pozulması - 40 AZN;
 *     * Maddə 353.1: Yol mebeli, polad baryer və hidravlik avtomatik qapılara zərər vurulması - 400 - 1,200 AZN + Mülki Məcəllə 1108;
 *     * Maddə 328.2: Əks-axın (contraflow) zonasında sürət həddini aşma (50 AZN + 2 bal);
 *     * Maddə 38: İXM üzrə 30 gün ərzində cərimə ödənildikdə 50%-lik qanuni güzəşt.
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const FAST_GATE_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const FAST_GATE_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertFastGateCurrency(amountInAzn: number, currency: Currency): number {
  const rate = FAST_GATE_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type VehicleClass =
  | 'PASSENGER_SEDAN'
  | 'EMERGENCY_AMBULANCE'
  | 'RESCUE_FIRE_TRUCK'
  | 'BDYP_PATROL'
  | 'HEAVY_COMMERCIAL_TIR'
  | 'INTERCITY_COACH';

export type FastGateStatus =
  | 'CLOSED_SECURED'
  | 'OPENING_DISPATCH'
  | 'OPEN_CONTRAFLOW'
  | 'MAINTENANCE_LOCK';

export type ActuatorType =
  | 'ELECTRO_HYDRAULIC'
  | 'ELECTRO_MECHANICAL'
  | 'FAST_ROLL_TELESCOPIC';

export interface FastGateZone {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  barrierLengthM: number;
  containmentLevel: 'H2' | 'H4b';
  actuatorType: ActuatorType;
  openTimeSeconds: number;
  operatingPressureBar: number;
  status: FastGateStatus;
  crossoverLanes: number;
  primaryResponder: 'BDYP' | 'FHN_112' | 'AAYDA_ROAD';
  opticalCurtainSensors: number;
  lastInspectionDate: string;
}

export interface FastGateVehiclePreset {
  id: string;
  plate: string;
  model: string;
  classType: VehicleClass;
  massKg: number;
  isEmergencyService: boolean;
  authorizedPass: boolean;
  defaultViolation:
    | 'NONE'
    | 'CIVILIAN_ILLEGAL_UTURN'
    | 'CONTRAFLOW_SPEEDING'
    | 'BARRIER_IMPACT_DAMAGE';
}

export interface FastGateCalculationParams {
  mainlineQueueKm: number; // 0.5 - 15.0 km
  diversionFlowVehHour: number; // 200 - 2500 veh/h
  contraflowSpeedKmh: number; // 30 - 80 km/h
  gateOpenTimeSeconds: number; // 30 - 180s
  operatingPressureBar: number; // 120 - 250 bar
  incidentDurationMinutes?: number; // 15 - 240 min
  emergencyVehiclesQueued?: number; // 1 - 10
}

export interface FastGateCalculationResult {
  normalKineticCapacityKj: number;
  contraflowCapacityVehHour: number;
  queueClearanceTimeMinutes: number;
  emergencyResponseMinutesSaved: number;
  secondaryCrashReductionPercent: number;
  hydraulicSystemHealth: 'OPTIMAL' | 'DEGRADED_PRESSURE' | 'CRITICAL_FAULT';
  operationalMode: 'STANDARD_SECURED' | 'CONTROLLED_CONTRAFLOW' | 'PRIORITY_EMERGENCY_BURST';
  clearanceStatus: 'AUTHORIZED_DISPATCH' | 'UNAUTHORIZED_CROSSING' | 'SECURED_STANDBY';
  unauthorizedFineAzn: number;
  unauthorizedPoints: number;
  discountedFineAzn: number;
  legalArticleAz: string;
  assetDamageRestitutionAzn: number;
}

/**
 * Calculates Highway Median Fast-Gate Crossover SCADA Telemetry,
 * Contraflow Flow Dynamics, Emergency Transit Metrics, and Statutory Sanctions.
 */
export function calculateFastGateTelemetry(
  params: FastGateCalculationParams,
  preset?: FastGateVehiclePreset
): FastGateCalculationResult {
  const {
    mainlineQueueKm,
    diversionFlowVehHour,
    contraflowSpeedKmh,
    gateOpenTimeSeconds,
    operatingPressureBar,
    incidentDurationMinutes = 60,
    emergencyVehiclesQueued = 3,
  } = params;

  // 1. Kinetic Containment Capacity (EN 1317 H2 baseline = 287.5 kJ, H4b = 724.6 kJ)
  const normalKineticCapacityKj = 350.0;

  // 2. Contraflow Lane Capacity
  // Highway single-lane contraflow with crossover taper:
  // Base saturation capacity 1400 veh/h, scaled by contraflow speed (30-80 km/h)
  const speedRatio = Math.min(1.2, Math.max(0.6, contraflowSpeedKmh / 60));
  const contraflowCapacityVehHour = Math.round(1350 * speedRatio);

  // 3. Queue Clearance Time (Minutes)
  // Estimated queued vehicles in mainline corridor: ~140 veh/km per lane (avg 2 lanes = 280 veh/km)
  const queuedVehicles = Math.round(mainlineQueueKm * 260);
  const effectiveDischarge = Math.max(100, contraflowCapacityVehHour - (diversionFlowVehHour * 0.15));
  const queueClearanceTimeMinutes = Math.min(
    360,
    Math.round(((queuedVehicles / effectiveDischarge) * 60 + (gateOpenTimeSeconds / 60)) * 10) / 10
  );

  // 4. Emergency Response Time Saved (Minutes vs driving to next grade interchange 18-25 km away)
  // Distance to turnaround interchange approx 22 km @ 90 km/h = 14.7 mins round-trip.
  // Median fast-gate crossing saves transit distance directly at incident scene.
  const emergencyResponseMinutesSaved = Math.max(
    4.0,
    Math.round((16.5 - (gateOpenTimeSeconds / 60) + (emergencyVehiclesQueued * 1.2)) * 10) / 10
  );

  // 5. Secondary Crash Risk Reduction % (PIARC model: contraflow queue-flushing prevents rear-end pileups)
  const secondaryCrashReductionPercent = Math.min(
    92,
    Math.max(25, Math.round(35 + (contraflowCapacityVehHour / 50) - (mainlineQueueKm * 1.8)))
  );

  // 6. Hydraulic System Health (Nominal 180 - 220 bar)
  let hydraulicSystemHealth: FastGateCalculationResult['hydraulicSystemHealth'] = 'OPTIMAL';
  if (operatingPressureBar < 140) {
    hydraulicSystemHealth = 'CRITICAL_FAULT';
  } else if (operatingPressureBar < 170 || operatingPressureBar > 235) {
    hydraulicSystemHealth = 'DEGRADED_PRESSURE';
  }

  // 7. Operational Mode
  let operationalMode: FastGateCalculationResult['operationalMode'] = 'STANDARD_SECURED';
  if (preset?.isEmergencyService) {
    operationalMode = 'PRIORITY_EMERGENCY_BURST';
  } else if (mainlineQueueKm >= 2.0 || diversionFlowVehHour >= 800) {
    operationalMode = 'CONTROLLED_CONTRAFLOW';
  }

  // 8. Clearance & Statutory Violations
  let clearanceStatus: FastGateCalculationResult['clearanceStatus'] = 'SECURED_STANDBY';
  let unauthorizedFineAzn = 0;
  let unauthorizedPoints = 0;
  let legalArticleAz = 'Qanunauyğun (İXM tətbiq edilmir)';
  let assetDamageRestitutionAzn = 0;

  if (preset) {
    if (preset.isEmergencyService || preset.authorizedPass) {
      clearanceStatus = 'AUTHORIZED_DISPATCH';
      legalArticleAz = 'Operativ Xilasetmə Rejimi (YHQ Maddə 47 - Tam Qanuni Keçid)';
    } else {
      clearanceStatus = 'UNAUTHORIZED_CROSSING';
      if (preset.defaultViolation === 'CIVILIAN_ILLEGAL_UTURN') {
        unauthorizedFineAzn = 100;
        unauthorizedPoints = 4;
        legalArticleAz = 'İXM Maddə 327.4 (Magistral yolda mərkəzi ayrıcı zolağın texnoloji keçidindən qanunsuz U-turn)';
      } else if (preset.defaultViolation === 'CONTRAFLOW_SPEEDING') {
        unauthorizedFineAzn = 50;
        unauthorizedPoints = 2;
        legalArticleAz = 'İXM Maddə 328.2 (Əks-axın və keçid taper zonasında sürət həddini aşma)';
      } else if (preset.defaultViolation === 'BARRIER_IMPACT_DAMAGE') {
        unauthorizedFineAzn = 600;
        unauthorizedPoints = 4;
        assetDamageRestitutionAzn = 1850; // AAYDA Road asset restitution under Civil Code Article 1108
        legalArticleAz = 'İXM Maddə 353.1 & Mülki Məcəllə 1108 (Yol polad baryerinə və hidravlik mexanizmə zərər vurma)';
      } else {
        unauthorizedFineAzn = 100;
        unauthorizedPoints = 4;
        legalArticleAz = 'İXM Maddə 327.4 (İcazəsiz mülki keçid cəhdi)';
      }
    }
  }

  // 50% early payment discount under İXM Article 38 within 30 days
  const discountedFineAzn = unauthorizedFineAzn > 0 ? Math.round(unauthorizedFineAzn * 0.5 * 100) / 100 : 0;

  return {
    normalKineticCapacityKj,
    contraflowCapacityVehHour,
    queueClearanceTimeMinutes,
    emergencyResponseMinutesSaved,
    secondaryCrashReductionPercent,
    hydraulicSystemHealth,
    operationalMode,
    clearanceStatus,
    unauthorizedFineAzn,
    unauthorizedPoints,
    discountedFineAzn,
    legalArticleAz,
    assetDamageRestitutionAzn,
  };
}

export interface ChecklistItem {
  id: string;
  labelAz: string;
  labelEn: string;
  category: 'STRUCTURAL' | 'HYDRAULIC' | 'SCADA' | 'SAFETY';
  referenceStd: string;
  critical: boolean;
}

export interface ExamQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctAnswerIndex: number;
  explanationAz: string;
  legalCitation: string;
}

export interface FastGateCertificate {
  certificateUid: string;
  simaSignatureUid: string;
  barrierReleasePin: string;
  sha256Hash: string;
  zoneCode: string;
  zoneName: string;
  vehiclePlate: string;
  vehicleModel: string;
  operatorAgency: string;
  barrierType: string;
  containmentRating: string;
  openingDurationSeconds: number;
  authorizedReason: string;
  issuedAt: string;
  expiresAt: string;
  status: 'ACTIVE_DISPATCH' | 'ARCHIVED' | 'REVOKED';
}

export function evaluateFastGateChecklist(items: { id: string; checked: boolean }[]): {
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  complianceRating: number;
  statusAz: string;
} {
  const totalCount = items.length;
  const passedCount = items.filter((i) => i.checked).length;
  const complianceRating = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const allPassed = passedCount === totalCount && totalCount > 0;

  let statusAz = 'Qeyri-kafi (İstismara buraxıla bilməz)';
  if (allPassed) {
    statusAz = 'Tam Uyğundur (FHN və BDYP Operativ Rejiminə Hazır)';
  } else if (complianceRating >= 80) {
    statusAz = 'Şərti Uyğundur (Məhdud rejimdə yoxlanış)';
  }

  return {
    passedCount,
    totalCount,
    allPassed,
    complianceRating,
    statusAz,
  };
}

export function calculateFastGateExamScore(
  answers: Record<string, number>,
  questions: ExamQuestion[]
): {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  gradeAz: string;
} {
  const total = questions.length;
  let score = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswerIndex) {
      score += 1;
    }
  });

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percent >= 80;

  let gradeAz = 'Kəsildi (Yenidən imtahan tələb olunur)';
  if (percent === 100) {
    gradeAz = 'Əla (100% - FHN və BDYP Sertifikatlı Komandir)';
  } else if (percent >= 80) {
    gradeAz = 'Müvəffəq (80%+ - İstismar və İdarəetməyə İcazə Verilir)';
  }

  return {
    score,
    total,
    percent,
    passed,
    gradeAz,
  };
}

export function generateFastGateCertificate(
  zone: FastGateZone,
  vehicle: FastGateVehiclePreset,
  reason = 'Qəza Nəticələrinin Aradan Qaldırılması və Xilasetmə Əməliyyatı'
): FastGateCertificate {
  const now = new Date();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateUid = `FAST-GATE-AZ-2026-${randomSuffix}`;
  const simaSignatureUid = `SIMA-AZ-GOV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const barrierReleasePin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const rawHashPayload = `${certificateUid}:${zone.code}:${vehicle.plate}:${simaSignatureUid}:${now.toISOString()}`;
  // Simple deterministic SHA-256 substitute for mock verification hash
  let hashNum = 0;
  for (let i = 0; i < rawHashPayload.length; i++) {
    hashNum = (hashNum << 5) - hashNum + rawHashPayload.charCodeAt(i);
    hashNum |= 0;
  }
  const sha256Hash = `e3b0c442${Math.abs(hashNum).toString(16).padStart(8, '0')}89f5a432b145d88691f`;

  const expiresDate = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4-hour operational mission voucher

  return {
    certificateUid,
    simaSignatureUid,
    barrierReleasePin,
    sha256Hash,
    zoneCode: zone.code,
    zoneName: zone.nameAz,
    vehiclePlate: vehicle.plate,
    vehicleModel: vehicle.model,
    operatorAgency: vehicle.isEmergencyService ? 'FHN / BDYP Operativ Qüvvələri' : 'AAYDA Magistral Xidməti',
    barrierType: zone.actuatorType,
    containmentRating: `EN 1317 ${zone.containmentLevel}`,
    openingDurationSeconds: zone.openTimeSeconds,
    authorizedReason: reason,
    issuedAt: now.toISOString(),
    expiresAt: expiresDate.toISOString(),
    status: 'ACTIVE_DISPATCH',
  };
}
