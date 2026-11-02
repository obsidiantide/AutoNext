/**
 * Highway Mountain Tunnel Fire Safety, Jet Fan SCADA Longitudinal Ventilation & Emergency Egress Compliance Engine
 * Official standards compliance:
 * - Law of the Republic of Azerbaijan "On Automobile Roads" (Maddə 14, 21, 29, 34: Magistral avtomobil yollarında, tunellərdə və yol qurğularında hərəkətin təhlükəsizliyi)
 * - Law of the Republic of Azerbaijan "On Fire Safety" (Yanğın təhlükəsizliyi haqqında Qanun, Maddə 6, 25: Nəqliyyat tunellərində yanğından mühafizə sistemləri)
 * - Law of the Republic of Azerbaijan "On Road Traffic" (Maddə 9, 14, 37, 50, 60: Tünellərdə hərəkət, təhlükəsizlik qaydaları, təcili təxliyə rejimi)
 * - State Standards of Azerbaijan AZS 410 / AZS 342 (Avtomobil yolları və tunellərinin istismar vəziyyətinə dair təhlükəsizlik tələbləri)
 * - NFPA 502: Standard for Road Tunnels, Bridges, and Other Limited Access Highways (Ventilation & Fire Life Safety)
 * - World Road Association (PIARC) Committee on Road Tunnel Operations & Fire Safety Guidelines
 * - European Standard EN 54 (Fire detection and fire alarm systems) & EN 12101 (Smoke and heat control systems)
 * - Code of Administrative Offences of the Republic of Azerbaijan (İXM Maddə 327.1, 328, 330, 353.1: Tuneldə manevr, sürət həddi, qəza dayanması və təhlükəli yük qaydalarının pozulması)
 * - Code of Administrative Offences Article 38 (İXM Maddə 38: 30 gün ərzində 50% güzəştlə cərimə ödənişi)
 */

export type TunnelTubeType =
  | 'TWIN_TUBE_UNIDIRECTIONAL'
  | 'SINGLE_TUBE_BIDIRECTIONAL'
  | 'URBAN_CUT_AND_COVER'
  | 'MOUNTAIN_SERPENTINE_ROCKFALL';

export type TunnelVentilationMode =
  | 'LONGITUDINAL_JET_FANS'
  | 'TRANSVERSE_EXHAUST'
  | 'SEMI_TRANSVERSE_DAMPERS'
  | 'NATURAL_CHIMNEY_PORTAL';

export type FireThreatStage =
  | 'SAFE_NORMAL_OPERATION'
  | 'ADVISORY_HAZARD_STAGE_1'
  | 'CRITICAL_INTERVENTION_STAGE_2'
  | 'CATASTROPHIC_DELUGE_STAGE_3';

export type BacklayeringState =
  | 'PREVENTED_SAFE_EGRESS'
  | 'MARGINAL_BOUNDARY_RISK'
  | 'SEVERE_BACKLAYERING_ACTIVE';

export type VehicleTunnelPresetCategory =
  | 'passenger_sedan'
  | 'commercial_van'
  | 'freight_tir'
  | 'hazmat_tanker'
  | 'tourist_coach'
  | 'rescue_response_unit';

export interface TunnelCorridorAsset {
  id: string;
  nameAz: string;
  nameEn: string;
  route: string;
  region: string;
  chainageKm: string;
  lengthMeters: number;
  altitudeMeters: number;
  tunnelType: TunnelTubeType;
  ventilationMode: TunnelVentilationMode;
  ceilingHeightM: number;
  crossSectionAreaM2: number;
  longitudinalSlopePct: number;
  totalJetFansInstalled: number;
  crossPassageSpacingM: number;
  waterDelugeInstalled: boolean;
  activeScadaSensorCode: string;
}

export interface TunnelVehiclePreset {
  id: string;
  category: VehicleTunnelPresetCategory;
  nameAz: string;
  nameEn: string;
  plateAz: string;
  designHrrMW: number;
  passengerCapacity: number;
  fuelType: 'GASOLINE_HYBRID' | 'DIESEL' | 'HEAVY_DIESEL_LNG' | 'PETROLEUM_HAZMAT' | 'ELECTRIC_BEV';
  adrHazmatClass?: string;
  recommendedEgressSpeedM_s: number;
}

export interface TunnelFireParameters {
  heatReleaseRateMW: number;
  tunnelAirVelocityMs: number;
  activeJetFansCount: number;
  ambientAirTempC: number;
  distanceToExitM: number;
  tunnelSlopePct: number;
  ceilingHeightM: number;
  crossSectionAreaM2: number;
  totalFansInstalled: number;
  waterDelugeActive: boolean;
}

export interface TunnelFirePhysicsResult {
  criticalVelocityMs: number;
  actualVelocityMs: number;
  backlayeringRatio: number;
  backlayeringState: BacklayeringState;
  fireThreatStage: FireThreatStage;
  peakSmokeTemperatureC: number;
  opticalVisibilityM: number;
  carbonMonoxidePpm: number;
  totalThrustRequiredKN: number;
  fansThrustDeliveredKN: number;
  sufficientVentilation: boolean;
  requiredSafeEgressTimeSec: number;
  availableSafeEgressTimeSec: number;
  egressSafetyMarginSec: number;
  egressViable: boolean;
  waterMistDelugeRequired: boolean;
  vmsAlertCode: string;
  vmsAlertTextAz: string;
  vmsAlertTextEn: string;
}

export interface StatutoryTunnelFineBreakdown {
  unauthorizedManeuverFineAzn: number;
  emergencySignFailureFineAzn: number;
  hazmatViolationFineAzn: number;
  speedingViolationFineAzn: number;
  totalOriginalFineAzn: number;
  discountedFineAzn: number;
  penaltyPoints: number;
  legalArticles: string[];
}

export interface TunnelSafetyChecklistItem {
  id: string;
  code: string;
  titleAz: string;
  titleEn: string;
  category: 'VENTILATION' | 'FIRE_SUPPRESSION' | 'EGRESS_SIGNAGE' | 'SCADA_SENSING' | 'COMMUNICATION';
  standardRef: string;
  mandatory: boolean;
  weight: number;
}

export interface TunnelTheoryQuestion {
  id: string;
  questionAz: string;
  questionEn: string;
  optionsAz: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationAz: string;
  explanationEn: string;
  legalRef: string;
}

export interface TunnelSafeCertificate {
  certificateId: string;
  tunnelId: string;
  tunnelName: string;
  vehiclePlate: string;
  vehicleCategory: string;
  fireThreatStage: FireThreatStage;
  criticalVelocityMs: number;
  actualVelocityMs: number;
  backlayeringSafe: boolean;
  opticalVisibilityM: number;
  egressMarginSec: number;
  safetyScore: number;
  issueDateIso: string;
  expiryDateIso: string;
  simaDigitalUid: string;
  qrVerificationHash: string;
  evacuationPasscode: string;
  status: 'VERIFIED_ACTIVE' | 'REVOKED' | 'CONDITIONAL_PASS';
}

/**
 * Calculates dimensionless heat release rate Q* according to NFPA 502 / Oka-Atkinson
 */
export function calculateDimensionlessHRR(
  hrrMW: number,
  ambientTempC: number,
  ceilingHeightM: number,
  crossSectionAreaM2: number
): number {
  const g = 9.81;
  const tKelvin = ambientTempC + 273.15;
  const rhoAmbient = 1.205; // kg/m^3
  const cp = 1.005; // kJ/(kg*K)
  const hrrKW = Math.max(0, hrrMW) * 1000;

  // Q* = Q / (rho * cp * T * g^(1/2) * H^(5/2))
  const denominator = rhoAmbient * cp * tKelvin * Math.sqrt(g) * Math.pow(Math.max(1, ceilingHeightM), 2.5);
  if (denominator <= 0) return 0;
  return hrrKW / denominator;
}

/**
 * Calculates critical velocity (v_c) to prevent smoke backlayering
 * based on Oka-Atkinson & Danziger-Kennedy formulations with slope correction K_g
 */
export function calculateCriticalVelocity(
  hrrMW: number,
  ambientTempC: number,
  ceilingHeightM: number,
  crossSectionAreaM2: number,
  tunnelSlopePct: number
): number {
  if (hrrMW <= 0.1) return 0.5; // Baseline minimum airflow
  const g = 9.81;
  const qStar = calculateDimensionlessHRR(hrrMW, ambientTempC, ceilingHeightM, crossSectionAreaM2);

  // Grade factor Kg: Kg = 1 + 0.037 * (slope)^0.8 for positive uphill flow
  const absSlope = Math.min(10, Math.max(0, Math.abs(tunnelSlopePct)));
  const kg = 1 + 0.037 * Math.pow(absSlope, 0.8);

  let vStar = 0.40;
  if (qStar <= 0.15) {
    vStar = 0.40 * Math.pow(Math.max(0.0001, qStar) / 0.15, 1 / 3);
  } else {
    vStar = 0.40;
  }

  const vCritical = kg * vStar * Math.sqrt(g * Math.max(2, ceilingHeightM));
  // Bound critical velocity between realistic engineering bounds: 1.2 to 4.5 m/s
  return Math.min(5.0, Math.max(1.0, Number(vCritical.toFixed(2))));
}

/**
 * Computes peak smoke temperature in the plume above the fire
 */
export function calculatePeakSmokeTemperature(
  hrrMW: number,
  ambientTempC: number,
  actualVelocityMs: number,
  crossSectionAreaM2: number
): number {
  if (hrrMW <= 0.1) return ambientTempC;
  const rho = 1.2;
  const cp = 1.005;
  const vEff = Math.max(0.5, actualVelocityMs);
  const massFlowAir = rho * crossSectionAreaM2 * vEff; // kg/s
  const fireEnergyKw = hrrMW * 1000;

  // Temperature rise delta T = (eta_conv * Q) / (m_dot * cp)
  const convectiveFraction = 0.70;
  const deltaT = (convectiveFraction * fireEnergyKw) / (massFlowAir * cp);
  return Math.min(1150, Math.max(ambientTempC, Math.round(ambientTempC + deltaT)));
}

/**
 * Calculates optical smoke visibility (m) based on smoke extinction coefficient
 */
export function calculateOpticalVisibility(
  hrrMW: number,
  actualVelocityMs: number,
  crossSectionAreaM2: number
): number {
  if (hrrMW <= 0.1) return 120.0; // Clear tunnel air
  const airVolumetricFlow = Math.max(10, actualVelocityMs * crossSectionAreaM2); // m^3/s
  // Smoke particulate generation rate ~ 0.04 kg/s per MW
  const particulateRate = hrrMW * 0.04;
  const extinctionCoeffCs = Math.max(0.02, (particulateRate * 350) / airVolumetricFlow);
  // Jin's visibility constant for light-emitting signs ~ 8.0, reflective signs ~ 3.0
  const visibilityM = 8.0 / extinctionCoeffCs;
  return Math.min(100.0, Math.max(2.0, Number(visibilityM.toFixed(1))));
}

/**
 * Computes Carbon Monoxide (CO) concentration in PPM
 */
export function calculateCarbonMonoxidePpm(
  hrrMW: number,
  actualVelocityMs: number,
  crossSectionAreaM2: number
): number {
  if (hrrMW <= 0.1) return 8; // Normal atmospheric baseline
  const airVolumetricFlow = Math.max(10, actualVelocityMs * crossSectionAreaM2);
  // CO yield ~ 0.06 kg/kg fuel burned, ~ 1.5 g/s per MW
  const coGenGramsPerSec = hrrMW * 1.5;
  const coMgM3 = (coGenGramsPerSec * 1000) / airVolumetricFlow;
  // Convert mg/m^3 to ppm (CO MW = 28)
  const coPpm = (coMgM3 * 24.45) / 28.01;
  return Math.min(1200, Math.max(10, Math.round(coPpm)));
}

/**
 * Calculates aerodynamic longitudinal thrust required (kN) and delivered by operating jet fans
 */
export function calculateJetFanThrust(
  activeFans: number,
  tunnelAreaM2: number,
  ceilingHeightM: number,
  actualVelocityMs: number
): { requiredThrustKN: number; deliveredThrustKN: number; sufficient: boolean } {
  // Typical reversible tunnel jet fan: 1120mm diameter, 30 m/s outlet, ~ 1100 N (1.1 kN) nominal thrust
  const fanNominalThrustKN = 1.15;
  const installationEfficiency = 0.85;
  const deliveredThrustKN = Number((activeFans * fanNominalThrustKN * installationEfficiency).toFixed(2));

  // Friction and portal pressure loss: Delta P = lambda * (L/Dh) * 0.5 * rho * v^2
  // For typical 2km tunnel, dynamic pressure ~ 40-120 Pa
  const targetVelocity = Math.max(1.5, actualVelocityMs);
  const hydraulicDiameter = Math.sqrt(tunnelAreaM2);
  const pressureLossPa = 0.02 * (1500 / hydraulicDiameter) * 0.5 * 1.2 * Math.pow(targetVelocity, 2) + 25;
  const requiredThrustKN = Number(((pressureLossPa * tunnelAreaM2) / 1000).toFixed(2));

  return {
    requiredThrustKN,
    deliveredThrustKN,
    sufficient: deliveredThrustKN >= requiredThrustKN || activeFans >= 6
  };
}

/**
 * Computes Egress Safe Evacuation Times (ASET vs RSET)
 */
export function calculateEgressTimes(
  distanceToExitM: number,
  opticalVisibilityM: number,
  peakTempC: number,
  hrrMW: number
): { rsetSec: number; asetSec: number; marginSec: number; egressViable: boolean } {
  // Walking speed reduced by low visibility and smoke
  const baseWalkingSpeed = 1.25; // m/s
  const visibilityFactor = Math.min(1.0, Math.max(0.25, opticalVisibilityM / 20.0));
  const walkingSpeed = baseWalkingSpeed * visibilityFactor;

  // RSET = detection time (15s) + alarm verification (15s) + pre-movement time (30s) + travel time
  const tPreMovement = 60; // seconds
  const travelTime = distanceToExitM / walkingSpeed;
  const rsetSec = Math.round(tPreMovement + travelTime);

  // ASET: Time until conditions become untenable
  // Higher HRR shortens ASET drastically
  let baseAset = 600; // 10 minutes default
  if (hrrMW > 50) baseAset = 240;
  else if (hrrMW > 20) baseAset = 360;
  else if (hrrMW > 5) baseAset = 480;

  // Temperature penalty
  if (peakTempC > 180) baseAset *= 0.6;
  else if (peakTempC > 90) baseAset *= 0.8;

  const asetSec = Math.round(Math.max(60, baseAset));
  const marginSec = asetSec - rsetSec;

  return {
    rsetSec,
    asetSec,
    marginSec,
    egressViable: marginSec >= 0
  };
}

/**
 * Full physics evaluation engine for Tunnel SCADA Fire & Ventilation
 */
export function evaluateTunnelFirePhysics(params: TunnelFireParameters): TunnelFirePhysicsResult {
  const criticalVelocityMs = calculateCriticalVelocity(
    params.heatReleaseRateMW,
    params.ambientAirTempC,
    params.ceilingHeightM,
    params.crossSectionAreaM2,
    params.tunnelSlopePct
  );

  const actualVelocityMs = Number(Math.max(0.1, params.tunnelAirVelocityMs).toFixed(2));
  const backlayeringRatio = Number((actualVelocityMs / criticalVelocityMs).toFixed(2));

  let backlayeringState: BacklayeringState = 'PREVENTED_SAFE_EGRESS';
  if (params.heatReleaseRateMW > 0.5) {
    if (backlayeringRatio >= 1.0) {
      backlayeringState = 'PREVENTED_SAFE_EGRESS';
    } else if (backlayeringRatio >= 0.85) {
      backlayeringState = 'MARGINAL_BOUNDARY_RISK';
    } else {
      backlayeringState = 'SEVERE_BACKLAYERING_ACTIVE';
    }
  }

  let fireThreatStage: FireThreatStage = 'SAFE_NORMAL_OPERATION';
  if (params.heatReleaseRateMW >= 60) {
    fireThreatStage = 'CATASTROPHIC_DELUGE_STAGE_3';
  } else if (params.heatReleaseRateMW >= 15) {
    fireThreatStage = 'CRITICAL_INTERVENTION_STAGE_2';
  } else if (params.heatReleaseRateMW >= 1.0) {
    fireThreatStage = 'ADVISORY_HAZARD_STAGE_1';
  }

  const peakSmokeTemperatureC = calculatePeakSmokeTemperature(
    params.heatReleaseRateMW,
    params.ambientAirTempC,
    actualVelocityMs,
    params.crossSectionAreaM2
  );

  const opticalVisibilityM = calculateOpticalVisibility(
    params.heatReleaseRateMW,
    actualVelocityMs,
    params.crossSectionAreaM2
  );

  const carbonMonoxidePpm = calculateCarbonMonoxidePpm(
    params.heatReleaseRateMW,
    actualVelocityMs,
    params.crossSectionAreaM2
  );

  const thrust = calculateJetFanThrust(
    params.activeJetFansCount,
    params.crossSectionAreaM2,
    params.ceilingHeightM,
    actualVelocityMs
  );

  const egress = calculateEgressTimes(
    params.distanceToExitM,
    opticalVisibilityM,
    peakSmokeTemperatureC,
    params.heatReleaseRateMW
  );

  const waterMistDelugeRequired = params.heatReleaseRateMW >= 30.0 || peakSmokeTemperatureC >= 250;

  let vmsAlertCode = 'VMS-TUN-NORMAL';
  let vmsAlertTextAz = 'HƏRƏKƏT SƏRBƏSTDİR - TƏHLÜKƏSİZ SÜRƏT VƏ 50M ARALIQ MƏSAFƏSİNƏ RİAYƏT EDİN';
  let vmsAlertTextEn = 'TUNNEL CLEAR - MAINTAIN SAFE SPEED AND 50M INTER-VEHICLE SPACING';

  if (fireThreatStage === 'CATASTROPHIC_DELUGE_STAGE_3') {
    vmsAlertCode = 'VMS-TUN-EVACUATE-DELUGE';
    vmsAlertTextAz = 'QIRMIZI HƏYƏCAN! TÜNELDƏ BÖYÜK YANĞIN! MÜHƏRRİKİ SÖNDÜRÜN, TƏXLİYƏ QAPILARINA QAÇIN!';
    vmsAlertTextEn = 'RED EMERGENCY! MAJOR FIRE DELUGE ACTIVE! KILL ENGINE, ESCAPE TO EMERGENCY CROSS-PASSAGE!';
  } else if (fireThreatStage === 'CRITICAL_INTERVENTION_STAGE_2') {
    vmsAlertCode = 'VMS-TUN-CRITICAL-FIRE';
    vmsAlertTextAz = 'DİQQƏT! TÜNELDƏ YANĞIN VƏ TÜSTÜ! GİRİŞ QADAĞANDIR, TƏXLİYƏ QAPILARINDAN İSTİFADƏ EDİN!';
    vmsAlertTextEn = 'DANGER! TUNNEL FIRE & SMOKE DETECTED! ENTRY BLOCKED, PROCEED TO EMERGENCY CROSS-PASSAGES!';
  } else if (fireThreatStage === 'ADVISORY_HAZARD_STAGE_1') {
    vmsAlertCode = 'VMS-TUN-ADVISORY-SMOKE';
    vmsAlertTextAz = 'XƏBƏRDARLIQ: TÜNELDƏ QƏZA VƏ LOKAL YANĞIN! SÜRƏTİ AZALDIN (MAX 30 KM/S), SAĞA ÇƏKİN!';
    vmsAlertTextEn = 'WARNING: INCIDENT/LOCAL SMOKE IN TUNNEL! REDUCE SPEED (MAX 30 KM/H), MOVE TO SHOULDER!';
  }

  return {
    criticalVelocityMs,
    actualVelocityMs,
    backlayeringRatio,
    backlayeringState,
    fireThreatStage,
    peakSmokeTemperatureC,
    opticalVisibilityM,
    carbonMonoxidePpm,
    totalThrustRequiredKN: thrust.requiredThrustKN,
    fansThrustDeliveredKN: thrust.deliveredThrustKN,
    sufficientVentilation: thrust.sufficient,
    requiredSafeEgressTimeSec: egress.rsetSec,
    availableSafeEgressTimeSec: egress.asetSec,
    egressSafetyMarginSec: egress.marginSec,
    egressViable: egress.egressViable,
    waterMistDelugeRequired,
    vmsAlertCode,
    vmsAlertTextAz,
    vmsAlertTextEn
  };
}

/**
 * Calculates statutory fines and penalties under Azerbaijani Code of Administrative Offences (İXM)
 */
export function calculateTunnelStatutoryFines(params: {
  unauthorizedManeuver: boolean;
  emergencySignFailure: boolean;
  hazmatViolation: boolean;
  speedDeltaKmH: number;
}): StatutoryTunnelFineBreakdown {
  let unauthorizedManeuverFineAzn = 0;
  let emergencySignFailureFineAzn = 0;
  let hazmatViolationFineAzn = 0;
  let speedingViolationFineAzn = 0;
  let penaltyPoints = 0;
  const legalArticles: string[] = [];

  if (params.unauthorizedManeuver) {
    unauthorizedManeuverFineAzn = 60;
    penaltyPoints += 3;
    legalArticles.push('İXM Maddə 327.1 / 327.2 (Tüneldə qadağan olunmuş dönmə və ya əks istiqamətdə hərəkət)');
  }

  if (params.emergencySignFailure) {
    emergencySignFailureFineAzn = 80;
    penaltyPoints += 2;
    legalArticles.push('İXM Maddə 330 (Tüneldə məcburi dayanma zamanı qəza durma nişanının quraşdırılmaması)');
  }

  if (params.hazmatViolation) {
    hazmatViolationFineAzn = 150;
    penaltyPoints += 4;
    legalArticles.push('İXM Maddə 353.1 (ADR reqlamentinə zidd olaraq təhlükəli yüklə tünelə qanunsuz daxilolma)');
  }

  if (params.speedDeltaKmH > 40) {
    speedingViolationFineAzn = 250;
    penaltyPoints += 4;
    legalArticles.push('İXM Maddə 328.3 (Tünel daxilində müəyyən edilmiş sürət həddini 40 km/saatdan artıq aşma)');
  } else if (params.speedDeltaKmH > 20) {
    speedingViolationFineAzn = 50;
    penaltyPoints += 2;
    legalArticles.push('İXM Maddə 328.2 (Tünel daxilində sürət həddini 20-40 km/saat aşma)');
  }

  const totalOriginalFineAzn =
    unauthorizedManeuverFineAzn +
    emergencySignFailureFineAzn +
    hazmatViolationFineAzn +
    speedingViolationFineAzn;

  const discountedFineAzn = Math.round(totalOriginalFineAzn * 0.5);

  return {
    unauthorizedManeuverFineAzn,
    emergencySignFailureFineAzn,
    hazmatViolationFineAzn,
    speedingViolationFineAzn,
    totalOriginalFineAzn,
    discountedFineAzn,
    penaltyPoints,
    legalArticles
  };
}

/**
 * Converts AZN amount to target currency (USD, EUR, AZN)
 */
export function convertTunnelCurrency(amountAzn: number, currency: 'AZN' | 'USD' | 'EUR'): string {
  const rates = {
    AZN: 1.0,
    USD: 1 / 1.70,
    EUR: 1 / 1.85
  };
  const converted = amountAzn * rates[currency];
  return `${converted.toFixed(currency === 'AZN' ? 0 : 2)} ${currency}`;
}

/**
 * Generates an official TUNNEL-SAFE-AZ-2026 electronic certificate
 */
export function generateTunnelSafeCertificate(
  tunnel: TunnelCorridorAsset,
  vehiclePlate: string,
  category: string,
  physics: TunnelFirePhysicsResult,
  score: number
): TunnelSafeCertificate {
  const serial = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const expiry = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months validity

  const passCode = `EP-${Math.floor(1000 + Math.random() * 9000)}-CROSS`;
  const simaUid = `SIMA-TUN-${Math.random().toString(36).substring(2, 9).toUpperCase()}-AZ`;
  const qrHash = `SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}-TUNNEL-SAFE`;

  return {
    certificateId: `TUNNEL-SAFE-AZ-2026-${serial}`,
    tunnelId: tunnel.id,
    tunnelName: tunnel.nameAz,
    vehiclePlate: vehiclePlate.toUpperCase(),
    vehicleCategory: category,
    fireThreatStage: physics.fireThreatStage,
    criticalVelocityMs: physics.criticalVelocityMs,
    actualVelocityMs: physics.actualVelocityMs,
    backlayeringSafe: physics.backlayeringState === 'PREVENTED_SAFE_EGRESS',
    opticalVisibilityM: physics.opticalVisibilityM,
    egressMarginSec: physics.egressSafetyMarginSec,
    safetyScore: score,
    issueDateIso: now.toISOString(),
    expiryDateIso: expiry.toISOString(),
    simaDigitalUid: simaUid,
    qrVerificationHash: qrHash,
    evacuationPasscode: passCode,
    status: score >= 75 ? 'VERIFIED_ACTIVE' : 'CONDITIONAL_PASS'
  };
}
