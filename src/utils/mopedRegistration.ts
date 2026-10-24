import {
  MopedSpecInput,
  MopedComplianceResult,
  PotentialViolation,
  MopedRegistrationRecord,
} from '../types/mopedRegistration';

export const CURRENCY_RATES = {
  AZN: 1.0,
  USD: 1.7,
  EUR: 1.85,
};

export const STATUTORY_FEES = {
  PLATE_FEE_AZN: 30, // Law on State Duties Art. 18.2
  TEXPASPORT_FEE_AZN: 30, // Law on State Duties Art. 18.3
  INSPECTION_FEE_AZN: 30, // State Technical Inspection Fee
};

export function evaluateMopedCompliance(input: MopedSpecInput): MopedComplianceResult {
  // 1. Determine license category and minimum age
  let requiredCategory: 'A1' | 'A' = 'A1';
  let minimumAgeRequired = 16;

  if (input.powerType === 'ice_combustion') {
    if (input.engineDisplacementCc > 125 || input.maxSpeedKmh > 90) {
      requiredCategory = 'A';
      minimumAgeRequired = 18;
    } else {
      requiredCategory = 'A1';
      minimumAgeRequired = 16;
    }
  } else {
    // electric_motor
    if (input.electricPowerKw > 11.0 || input.maxSpeedKmh > 90) {
      requiredCategory = 'A';
      minimumAgeRequired = 18;
    } else {
      requiredCategory = 'A1';
      minimumAgeRequired = 16;
    }
  }

  const isAgeCompliant = input.ownerAge >= minimumAgeRequired;
  const isRegistrationMandatory = true; // All mopeds and e-scooters >0.25kW require state registration

  // 2. Helmet Score and Compliance (UNECE 22.06 / 22.05)
  let certPoints = 0;
  if (input.helmetCert === 'unece_22_06') {
    certPoints = 50;
  } else if (input.helmetCert === 'unece_22_05') {
    certPoints = 40;
  } else if (input.helmetCert === 'dot_fmvss_218') {
    certPoints = 25;
  } else {
    certPoints = 0;
  }

  let strapPoints = 0;
  if (input.chinStrap === 'double_d_ring') {
    strapPoints = 30;
  } else if (input.chinStrap === 'micrometric_ratchet') {
    strapPoints = 25;
  } else if (input.chinStrap === 'quick_release') {
    strapPoints = 15;
  } else {
    strapPoints = 0;
  }

  const visorPoints = input.hasVisorEyeProtection ? 20 : 0;
  const helmetScore = Math.min(100, certPoints + strapPoints + visorPoints);

  const helmetCompliant =
    (input.helmetCert === 'unece_22_06' || input.helmetCert === 'unece_22_05') &&
    input.chinStrap !== 'broken_missing';

  // 3. Courier safety compliance
  const isCourier = input.courierPlatform !== 'personal_use';
  let courierSafetyCompliant = true;

  if (isCourier) {
    if (!input.hasReflectiveVest || !input.hasDeliveryBoxBracket || input.deliveryBoxOverhangMeters > 0.5) {
      courierSafetyCompliant = false;
    }
  }

  // 4. Potential Violations & Penalties
  const potentialViolations: PotentialViolation[] = [];

  if (!helmetCompliant) {
    potentialViolations.push({
      code: 'VIO-HLM',
      article: 'İXM Maddə 338.4',
      penaltyAzn: 40,
      description: 'Dövlət standartına (UNECE 22.06/22.05) uyğun gəlməyən və ya taxılmamış dəbilqə ilə idarəetmə',
      severe: true,
    });
  }

  if (input.isPassengerPresent && !input.passengerHasHelmet) {
    potentialViolations.push({
      code: 'VIO-PSG-HLM',
      article: 'İXM Maddə 338.4',
      penaltyAzn: 40,
      description: 'Dəbilqəsiz sərnişinin daşınması',
      severe: false,
    });
  }

  if (!isAgeCompliant) {
    potentialViolations.push({
      code: 'VIO-AGE',
      article: 'İXM Maddə 332.1',
      penaltyAzn: 100,
      description: `Sürücülük hüququ olmadan idarəetmə (${requiredCategory} kateqoriyası üzrə yaş həddi: ${minimumAgeRequired} yaş)`,
      severe: true,
    });
  }

  if (isCourier && !input.hasReflectiveVest) {
    potentialViolations.push({
      code: 'VIO-VEST',
      article: 'YHQ Maddə 37 & AYNA Standartı',
      penaltyAzn: 40,
      description: 'Qaranlıq vaxtda və ya dumanlı şəraitdə işıqqaytarıcı jiletsiz hərəkət',
      severe: false,
    });
  }

  if (input.deliveryBoxOverhangMeters > 0.5) {
    potentialViolations.push({
      code: 'VIO-BOX',
      article: 'İXM Maddə 327.1',
      penaltyAzn: 40,
      description: `Qabaritdən 0.5 metrdən artıq çıxan təhlükəli termoboks (${input.deliveryBoxOverhangMeters.toFixed(2)} m)`,
      severe: false,
    });
  }

  if (isCourier && !input.hasDeliveryBoxBracket) {
    potentialViolations.push({
      code: 'VIO-BRKT',
      article: 'İXM Maddə 342.2-1',
      penaltyAzn: 50,
      description: 'Mopedin konstruksiyasına zidd kustar üsulla bərkidilmiş qutu',
      severe: false,
    });
  }

  const totalFineRiskAzn = potentialViolations.reduce((sum, v) => sum + v.penaltyAzn, 0);

  // 5. Insurance estimate
  let compulsoryInsuranceEstimateAzn = 40;
  if (input.powerType === 'ice_combustion') {
    if (input.engineDisplacementCc > 125) {
      compulsoryInsuranceEstimateAzn = 65;
    } else if (input.engineDisplacementCc > 50) {
      compulsoryInsuranceEstimateAzn = 50;
    } else {
      compulsoryInsuranceEstimateAzn = 40;
    }
  } else {
    compulsoryInsuranceEstimateAzn = input.electricPowerKw > 4.0 ? 55 : 40;
  }

  const totalStateDutiesAzn =
    STATUTORY_FEES.PLATE_FEE_AZN +
    STATUTORY_FEES.TEXPASPORT_FEE_AZN +
    STATUTORY_FEES.INSPECTION_FEE_AZN;

  const rate = CURRENCY_RATES[input.selectedCurrency] || 1.0;
  const totalDutiesConverted = Number((totalStateDutiesAzn / rate).toFixed(2));

  const overallRoadLegal =
    isAgeCompliant &&
    helmetCompliant &&
    courierSafetyCompliant &&
    (!input.isPassengerPresent || input.passengerHasHelmet) &&
    input.deliveryBoxOverhangMeters <= 0.5;

  return {
    requiredCategory,
    minimumAgeRequired,
    isAgeCompliant,
    isRegistrationMandatory,
    helmetCompliant,
    helmetScore,
    courierSafetyCompliant,
    overallRoadLegal,
    plateIssuanceFeeAzn: STATUTORY_FEES.PLATE_FEE_AZN,
    texpasportFeeAzn: STATUTORY_FEES.TEXPASPORT_FEE_AZN,
    inspectionFeeAzn: STATUTORY_FEES.INSPECTION_FEE_AZN,
    compulsoryInsuranceEstimateAzn,
    totalStateDutiesAzn,
    totalDutiesConverted,
    potentialViolations,
    totalFineRiskAzn,
  };
}

export function formatAzerbaijanMopedPlate(plate: string): {
  region: string;
  series: string;
  digits: string;
} {
  const clean = plate.trim().toUpperCase().replace(/\s+/g, '-');
  const parts = clean.split('-');

  if (parts.length === 3) {
    return {
      region: parts[0] || '99',
      series: parts[1] || 'A',
      digits: parts[2] || '000',
    };
  }

  return {
    region: '99',
    series: 'A',
    digits: '101',
  };
}

export function generateMopedRegistrationCertificate(
  data: Partial<MopedRegistrationRecord>
): MopedRegistrationRecord {
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);
  const inspectionExpiryDate = nextYear.toISOString().split('T')[0];

  const plateNumber = data.plateNumber || '99-A-850';
  const ownerFin = data.ownerFin || '5AB789M';

  return {
    id: data.id || `reg-mpd-${Date.now()}`,
    plateNumber,
    frameVin: data.frameVin || `LPR50QT2026${randNum}`,
    engineSerial: data.engineSerial || `139QMB-${randNum}`,
    ownerFullName: data.ownerFullName || 'Nəqliyyat Sahibi',
    ownerFin,
    brandModel: data.brandModel || 'Moped / Skuter',
    category: data.category || 'moped_light',
    powerType: data.powerType || 'ice_combustion',
    engineDisplacementCc: data.engineDisplacementCc ?? 49,
    electricPowerKw: data.electricPowerKw ?? 0,
    maxSpeedKmh: data.maxSpeedKmh || 45,
    courierPlatform: data.courierPlatform || 'personal_use',
    registrationCertificateNumber:
      data.registrationCertificateNumber || `BDYP-MPD-2026-${randNum}`,
    issueDate: data.issueDate || issueDate,
    inspectionExpiryDate: data.inspectionExpiryDate || inspectionExpiryDate,
    insurancePolicyNumber: data.insurancePolicyNumber || `ISB-ICB-2026-${randNum * 2}`,
    status: data.status || 'active',
    qrTelemetry: `BDYP_MOPED_VERIFIED_${plateNumber.replace(/-/g, '')}_${ownerFin}_2026`,
  };
}
