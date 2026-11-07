/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Land Transport Agency (AYNA) & Main State Traffic Police (BDYP)
 * Highway Guardrail End Terminals, Energy-Absorbing Extruder Heads,
 * Vehicle Impalement ("Spear Effect") Elimination & Crashworthiness Telemetry,
 * EN 1317-4 Performance Classes (P1, P2, P3, P4) & Official TERMINAL-SAFE-AZ-2026 Portal
 *
 * Statutory References:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında
 *   hərəkət təhlükəsizliyi mühəndis qurğuları, yol çəpərləri və zərbəyə davamlı enerjiuducu ucluq sistemləri (End Terminals))
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 42: Magistral yollarda yol kənarı mühəndis
 *   qurğularının toxunulmazlığı, çəpərlənmə zonalarında hərəkət rejimi və qəza təhlükəsizliyi)
 * - European Standard EN 1317-4: Road restraint systems - Part 4: Performance classes, impact test acceptance criteria
 *   and test methods for terminals and transitions of safety barriers (Classes P1, P2, P3, P4; Test Types TT 1.1, TT 2.1, TT 4.1)
 * - State Standards AZS 410 / AZS 342 (Magistral avtomobil yollarının yol mebeli, polad çəpərləri və qoruyucu başlıqları)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM):
 *     * Maddə 327.2: Qoruyucu terminal təhlükəsizlik bufer zonasında icazəsiz parklanma və hərəkət maneəsi — 80 AZN + 3 cərimə balı;
 *     * Maddə 328.2: Terminal və körpü yanaşma zonasında müəyyən edilmiş sürət həddini 20-40 km/saat aşma — 50 AZN + 2 bal;
 *     * Maddə 353.1: Yol çəpəri ucluqlarına, ekstruder başlıqlarına və kəndir ankerlərinə ziyan vurulması — 600 AZN;
 *     * Maddə 38: İXM üzrə 30 gün ərzində cərimə ödənildikdə 50%-lik qanuni güzəşt;
 *     * AR Mülki Məcəlləsi Maddə 1108: AAYDA balansındakı yol çəpəri ucluğunun və deformasiya olunan komponentlərinin
 *       (ekstruder, qırılan dirəklər, kabel ankerləri) dəyən ziyanının tam məbləğdə kompensasiyası (1,200 - 3,800 AZN).
 */

export type Currency = 'AZN' | 'USD' | 'EUR';

export const TERMINAL_SAFE_CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.5882 USD (1 USD = 1.70 AZN)
  EUR: 0.5405, // 1 AZN ≈ 0.5405 EUR (1 EUR = 1.85 AZN)
};

export const TERMINAL_SAFE_CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

export function convertTerminalSafeCurrency(amountInAzn: number, currency: Currency): number {
  const rate = TERMINAL_SAFE_CURRENCY_RATES[currency] || 1.0;
  return Math.round(amountInAzn * rate * 100) / 100;
}

export type TerminalPerformanceClass = 'P1' | 'P2' | 'P3' | 'P4';
export type TerminalType = 'TANGENT_EXTRUDER' | 'FLARED_DEFLECTION' | 'SLOTTED_RAIL_FRICTION' | 'BURIED_BACKSLOPE';
export type BreakawayPostCondition = 'OPTIMAL_SHEAR' | 'WEATHERED_RUST' | 'SOIL_DISPLACEMENT';

export interface TerminalCorridorStation {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  corridor: string;
  routeNumber: string;
  picketKm: string;
  terminalType: TerminalType;
  performanceClass: TerminalPerformanceClass;
  speedLimitKmh: number;
  terminalLengthM: number;
  breakawayPostsCount: number;
  stationStatus: 'OPERATIONAL_NOMINAL' | 'MAINTENANCE_REQUIRED' | 'IMPACT_ALERT';
  impalementRiskEliminatedPct: number;
  installedYear: number;
}

export interface TerminalVehiclePreset {
  id: string;
  name: string;
  licensePlate: string;
  vehicleType: string;
  massKg: number;
  defaultSpeedKmh: number;
  impactAngleDeg: number;
  cockpitStrengthScore: number;
  riskDescription: string;
}

export interface TerminalSimulationInputs {
  vehicleSpeedKmh: number;
  vehicleMassKg: number;
  impactAngleDeg: number;
  terminalType: TerminalType;
  performanceClass: TerminalPerformanceClass;
  postCondition: BreakawayPostCondition;
  shearedPostsCount: number;
}

export interface TerminalSimulationResults {
  kineticEnergyKj: number;
  extrusionStrokeDisplacementM: number;
  averageDecelerationG: number;
  accelerationSeverityIndexASI: number;
  asiClass: 'CLASS_A' | 'CLASS_B' | 'UNACCEPTABLE';
  theoreticalHeadImpactVelocityThivKmh: number;
  cockpitPenetrationRiskPct: number;
  vehicleRedirectionStabilityPct: number;
  impalementDefended: boolean;
  terminalStatus: 'CONTROLLED_ENERGY_ABSORPTION' | 'CONTROLLED_REDIRECTIVE_DEFLECTION' | 'STRUCTURAL_OVERLOAD_RISK' | 'CRITICAL_SPEAR_PENETRATION_HAZARD';
  estimatedRestitutionAzn: number;
}

export interface TerminalStatutorySanctions {
  ixm327_2FineAzn: number;
  ixm327_2PenaltyPoints: number;
  ixm328_2SpeedingFineAzn: number;
  ixm328_2PenaltyPoints: number;
  ixm353_1DamageFineAzn: number;
  civil1108RestitutionAzn: number;
  totalGrossLiabilityAzn: number;
  totalDiscountedLiabilityAzn: number;
  totalPenaltyPoints: number;
}

export interface TerminalChecklistItem {
  id: string;
  code: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descAz: string;
  descEn: string;
  descRu: string;
  standardReference: string;
  mandatory: boolean;
  status: 'COMPLIANT' | 'NON_COMPLIANT';
}

export interface TerminalExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctOptionIndex: number;
  legalCitation: string;
  explanationAz: string;
}

export interface TerminalCertificate {
  certificateId: string;
  simaDigitalUid: string;
  verificationPin: string;
  corridorCode: string;
  corridorName: string;
  vehiclePlate: string;
  vehicleModel: string;
  performanceClass: TerminalPerformanceClass;
  terminalType: TerminalType;
  impactSpeedKmh: number;
  kineticEnergyKj: number;
  asiScore: number;
  thivKmh: number;
  penetrationProtected: boolean;
  issueDate: string;
  expiryDate: string;
  inspectorName: string;
  sha256Hash: string;
  status: 'VERIFIED' | 'REVOKED' | 'EXPIRED';
}

/**
 * Calculates physics & impact metrics under EN 1317-4 standards
 */
export function calculateTerminalSimulation(inputs: TerminalSimulationInputs): TerminalSimulationResults {
  const speedMs = Math.max(1, inputs.vehicleSpeedKmh) / 3.6;
  const massKg = Math.max(100, inputs.vehicleMassKg);

  // Kinetic energy: Ek = 0.5 * m * v^2 in kJ
  const kineticEnergyKj = Math.round(0.5 * massKg * Math.pow(speedMs, 2) / 1000 * 10) / 10;

  // Extruder head plastic deformation resistance per meter + post shearing force
  let baseExtruderForceKn = 75; // 75 kN standard for W-beam flattening extruder
  if (inputs.terminalType === 'FLARED_DEFLECTION') baseExtruderForceKn = 65;
  if (inputs.terminalType === 'SLOTTED_RAIL_FRICTION') baseExtruderForceKn = 70;
  if (inputs.terminalType === 'BURIED_BACKSLOPE') baseExtruderForceKn = 90;

  let postConditionMultiplier = 1.0;
  if (inputs.postCondition === 'WEATHERED_RUST') postConditionMultiplier = 0.85;
  if (inputs.postCondition === 'SOIL_DISPLACEMENT') postConditionMultiplier = 0.75;

  const postShearForceKn = inputs.shearedPostsCount * 14 * postConditionMultiplier;
  const totalResistiveForceKn = baseExtruderForceKn + postShearForceKn;

  // Extrusion stroke displacement: x = Ek / F_total (meters)
  let rawStrokeDisplacementM = (kineticEnergyKj / Math.max(40, totalResistiveForceKn));
  if (inputs.impactAngleDeg > 0) {
    // Trigonometric reduction for angled impact
    const angleRad = (inputs.impactAngleDeg * Math.PI) / 180;
    rawStrokeDisplacementM = rawStrokeDisplacementM * Math.cos(angleRad);
  }
  const extrusionStrokeDisplacementM = Math.min(18.0, Math.max(0.5, Math.round(rawStrokeDisplacementM * 100) / 100));

  // Average deceleration: a_avg = v^2 / (2 * x) in m/s^2, converted to g-forces (g = 9.81 m/s^2)
  const decelMs2 = Math.pow(speedMs, 2) / (2 * extrusionStrokeDisplacementM);
  const averageDecelerationG = Math.round((decelMs2 / 9.81) * 100) / 100;

  // Acceleration Severity Index (ASI) under EN 1317-1/4
  // For longitudinal impact dominated terminals, ASI is roughly a_long / 12g with correction for lateral component
  const lateralFactor = Math.sin((inputs.impactAngleDeg * Math.PI) / 180) * 0.4;
  const rawASI = (averageDecelerationG / 12.0) * (1.0 + lateralFactor) * 0.9;
  const accelerationSeverityIndexASI = Math.min(2.5, Math.max(0.3, Math.round(rawASI * 100) / 100));

  let asiClass: 'CLASS_A' | 'CLASS_B' | 'UNACCEPTABLE' = 'CLASS_A';
  if (accelerationSeverityIndexASI <= 1.0) {
    asiClass = 'CLASS_A'; // Best occupant safety
  } else if (accelerationSeverityIndexASI <= 1.4) {
    asiClass = 'CLASS_B'; // Acceptable
  } else {
    asiClass = 'UNACCEPTABLE'; // High injury risk
  }

  // Theoretical Head Impact Velocity (THIV) in km/h (EN 1317 limit is <= 33 km/h)
  const rawThiv = Math.min(45, (averageDecelerationG * 3.8) + (inputs.vehicleSpeedKmh * 0.12));
  const theoreticalHeadImpactVelocityThivKmh = Math.round(rawThiv * 10) / 10;

  // Cockpit penetration risk score: Untreated fish-tail has 95% risk, EN 1317-4 extruder reduces to near zero
  let basePenetrationRisk = 2.0; // 2% baseline with certified terminal
  if (inputs.performanceClass === 'P1' && inputs.vehicleSpeedKmh > 50) basePenetrationRisk += (inputs.vehicleSpeedKmh - 50) * 0.8;
  if (inputs.performanceClass === 'P2' && inputs.vehicleSpeedKmh > 80) basePenetrationRisk += (inputs.vehicleSpeedKmh - 80) * 0.7;
  if (inputs.performanceClass === 'P3' && inputs.vehicleSpeedKmh > 100) basePenetrationRisk += (inputs.vehicleSpeedKmh - 100) * 0.6;
  if (inputs.performanceClass === 'P4' && inputs.vehicleSpeedKmh > 110) basePenetrationRisk += (inputs.vehicleSpeedKmh - 110) * 0.5;

  if (inputs.postCondition === 'SOIL_DISPLACEMENT') basePenetrationRisk += 8.0;
  if (inputs.postCondition === 'WEATHERED_RUST') basePenetrationRisk += 5.0;
  if (inputs.shearedPostsCount >= 7) basePenetrationRisk += 12.0;

  const cockpitPenetrationRiskPct = Math.min(98.0, Math.max(1.0, Math.round(basePenetrationRisk * 10) / 10));
  const impalementDefended = cockpitPenetrationRiskPct < 30.0;

  // Redirection stability %
  let stability = 95.0 - (inputs.impactAngleDeg * 1.8) - (inputs.vehicleSpeedKmh > 100 ? (inputs.vehicleSpeedKmh - 100) * 0.4 : 0);
  if (inputs.terminalType === 'FLARED_DEFLECTION') stability += 5.0;
  const vehicleRedirectionStabilityPct = Math.min(99.0, Math.max(30.0, Math.round(stability * 10) / 10));

  // Determine operational status
  let terminalStatus: 'CONTROLLED_ENERGY_ABSORPTION' | 'CONTROLLED_REDIRECTIVE_DEFLECTION' | 'STRUCTURAL_OVERLOAD_RISK' | 'CRITICAL_SPEAR_PENETRATION_HAZARD';
  if (cockpitPenetrationRiskPct > 50.0 || kineticEnergyKj > 1400) {
    terminalStatus = 'CRITICAL_SPEAR_PENETRATION_HAZARD';
  } else if (kineticEnergyKj > 1000 || accelerationSeverityIndexASI > 1.4) {
    terminalStatus = 'STRUCTURAL_OVERLOAD_RISK';
  } else if (inputs.impactAngleDeg >= 12) {
    terminalStatus = 'CONTROLLED_REDIRECTIVE_DEFLECTION';
  } else {
    terminalStatus = 'CONTROLLED_ENERGY_ABSORPTION';
  }

  // Estimated civil restitution for AAYDA road repair
  const baseExtruderHeadCost = 1400; // Extruder replacement
  const postCost = inputs.shearedPostsCount * 180; // Each breakaway post
  const railCostPerM = 90; // W-beam rail replacement per meter of stroke
  const estimatedRestitutionAzn = Math.round(baseExtruderHeadCost + postCost + (extrusionStrokeDisplacementM * railCostPerM));

  return {
    kineticEnergyKj,
    extrusionStrokeDisplacementM,
    averageDecelerationG,
    accelerationSeverityIndexASI,
    asiClass,
    theoreticalHeadImpactVelocityThivKmh,
    cockpitPenetrationRiskPct,
    vehicleRedirectionStabilityPct,
    impalementDefended,
    terminalStatus,
    estimatedRestitutionAzn,
  };
}

/**
 * Calculates statutory fines under Code of Administrative Offences (İXM) & Civil Code 1108
 */
export function calculateTerminalStatutorySanctions(
  speedKmh: number,
  speedLimitKmh: number,
  isZoneEncroachment: boolean,
  estimatedRestitutionAzn: number
): TerminalStatutorySanctions {
  // İXM 327.2: Guardrail terminal safety zone encroachment: 80 AZN + 3 points
  const ixm327_2FineAzn = isZoneEncroachment ? 80 : 0;
  const ixm327_2PenaltyPoints = isZoneEncroachment ? 3 : 0;

  // İXM 328.2: Speed excess 20-40 km/h: 50 AZN + 2 points (or higher tiers)
  let ixm328_2SpeedingFineAzn = 0;
  let ixm328_2PenaltyPoints = 0;
  const excess = speedKmh - speedLimitKmh;
  if (excess >= 60) {
    ixm328_2SpeedingFineAzn = 250;
    ixm328_2PenaltyPoints = 4;
  } else if (excess >= 40) {
    ixm328_2SpeedingFineAzn = 100;
    ixm328_2PenaltyPoints = 3;
  } else if (excess >= 20) {
    ixm328_2SpeedingFineAzn = 50;
    ixm328_2PenaltyPoints = 2;
  } else if (excess >= 10) {
    ixm328_2SpeedingFineAzn = 20;
    ixm328_2PenaltyPoints = 0;
  }

  // İXM 353.1: Road furniture / crash terminal impact damage: 600 AZN
  const ixm353_1DamageFineAzn = 600;

  // Civil restitution
  const civil1108RestitutionAzn = estimatedRestitutionAzn;

  const totalGrossFines = ixm327_2FineAzn + ixm328_2SpeedingFineAzn + ixm353_1DamageFineAzn;
  // Article 38 prompt payment discount 50% applies to administrative fines only (not civil restitution)
  const discountedFines = totalGrossFines * 0.5;

  const totalGrossLiabilityAzn = totalGrossFines + civil1108RestitutionAzn;
  const totalDiscountedLiabilityAzn = Math.round((discountedFines + civil1108RestitutionAzn) * 100) / 100;
  const totalPenaltyPoints = ixm327_2PenaltyPoints + ixm328_2PenaltyPoints;

  return {
    ixm327_2FineAzn,
    ixm327_2PenaltyPoints,
    ixm328_2SpeedingFineAzn,
    ixm328_2PenaltyPoints,
    ixm353_1DamageFineAzn,
    civil1108RestitutionAzn,
    totalGrossLiabilityAzn,
    totalDiscountedLiabilityAzn,
    totalPenaltyPoints,
  };
}

/**
 * Generates an official clearance certificate
 */
export function generateTerminalCertificate(
  station: TerminalCorridorStation,
  vehicle: TerminalVehiclePreset,
  simulation: TerminalSimulationResults
): TerminalCertificate {
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const certId = `TERMINAL-SAFE-AZ-2026-${randNum}`;
  const simaUid = `SIMA-AAYDA-TRM-${Math.floor(100000 + Math.random() * 900000)}`;
  const pin = `${Math.floor(1000 + Math.random() * 9000)}`;

  const issueDate = new Date().toISOString().split('T')[0];
  const expDateObj = new Date();
  expDateObj.setFullYear(expDateObj.getFullYear() + 1);
  const expiryDate = expDateObj.toISOString().split('T')[0];

  const sha256Hash = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.substring(0, 32) + `${randNum}`;

  return {
    certificateId: certId,
    simaDigitalUid: simaUid,
    verificationPin: pin,
    corridorCode: station.code,
    corridorName: station.nameAz,
    vehiclePlate: vehicle.licensePlate,
    vehicleModel: vehicle.name,
    performanceClass: station.performanceClass,
    terminalType: station.terminalType,
    impactSpeedKmh: vehicle.defaultSpeedKmh,
    kineticEnergyKj: simulation.kineticEnergyKj,
    asiScore: simulation.accelerationSeverityIndexASI,
    thivKmh: simulation.theoreticalHeadImpactVelocityThivKmh,
    penetrationProtected: simulation.impalementDefended,
    issueDate,
    expiryDate,
    inspectorName: 'Baş Mühəndis R. Əliyev (AAYDA Magistral Departament)',
    sha256Hash,
    status: 'VERIFIED',
  };
}
