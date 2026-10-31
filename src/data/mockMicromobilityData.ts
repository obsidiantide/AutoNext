/**
 * Mock Data for AYNA, RİNN & BDYP Urban Micromobility & Dynamic Geofencing Portal
 */

import {
  CorridorId,
  MicromobilityCertificate,
  TelemetryState,
} from '../utils/micromobilityCompliance';

export interface FleetOperatorInfo {
  id: string;
  brandName: string;
  licenseNumber: string;
  totalActiveFleet: number;
  availableScooters: number;
  batteryHealthPercent: number;
  averageTripDistanceKm: number;
  safetyScorePercent: number;
  hotline: string;
}

export const MOCK_ACTIVE_FLEET_OPERATORS: FleetOperatorInfo[] = [
  {
    id: 'op_wingz',
    brandName: 'Wingz Azerbaijan (Rəqəmsal Samokat)',
    licenseNumber: 'AYNA-OP-2024-001',
    totalActiveFleet: 850,
    availableScooters: 620,
    batteryHealthPercent: 96,
    averageTripDistanceKm: 3.4,
    safetyScorePercent: 98,
    hotline: '*2024 / 012 505 44 22',
  },
  {
    id: 'op_jet',
    brandName: 'Jet Sharing Baku',
    licenseNumber: 'AYNA-OP-2024-004',
    totalActiveFleet: 650,
    availableScooters: 490,
    batteryHealthPercent: 94,
    averageTripDistanceKm: 2.9,
    safetyScorePercent: 95,
    hotline: '*7788 / 012 404 11 00',
  },
  {
    id: 'op_whoosh',
    brandName: 'Whoosh Smart Micromobility',
    licenseNumber: 'AYNA-OP-2024-009',
    totalActiveFleet: 900,
    availableScooters: 740,
    batteryHealthPercent: 97,
    averageTripDistanceKm: 3.8,
    safetyScorePercent: 99,
    hotline: '*9944 / 012 310 05 05',
  },
  {
    id: 'op_bakubike',
    brandName: 'BakuBike Bələdiyyə Velosiped Paylaşımı',
    licenseNumber: 'AYNA-OP-2023-012',
    totalActiveFleet: 450,
    availableScooters: 380,
    batteryHealthPercent: 100,
    averageTripDistanceKm: 4.2,
    safetyScorePercent: 97,
    hotline: '141 (AYNA Qaynar Xətt)',
  },
];

export const INITIAL_CORRIDOR_TELEMETRY: Record<CorridorId, TelemetryState> = {
  boulevard_seaside: {
    currentSpeedKmh: 18.5,
    batterySocPercent: 88,
    batteryTempCelsius: 24.5,
    geofenceZone: 'green',
    helmetDetected: true,
    tandemRidingDetected: false,
    surfaceVibrationG: 0.45,
    brakingPowerPercent: 0,
    regenerativeHarvestingWatts: 35,
    distanceTraveledKm: 4.6,
  },
  central_baku_ring: {
    currentSpeedKmh: 11.2,
    batterySocPercent: 64,
    batteryTempCelsius: 26.0,
    geofenceZone: 'yellow',
    helmetDetected: true,
    tandemRidingDetected: false,
    surfaceVibrationG: 0.85,
    brakingPowerPercent: 20,
    regenerativeHarvestingWatts: 60,
    distanceTraveledKm: 2.8,
  },
  winter_park_rail: {
    currentSpeedKmh: 19.0,
    batterySocPercent: 78,
    batteryTempCelsius: 25.0,
    geofenceZone: 'green',
    helmetDetected: true,
    tandemRidingDetected: false,
    surfaceVibrationG: 0.55,
    brakingPowerPercent: 0,
    regenerativeHarvestingWatts: 42,
    distanceTraveledKm: 3.2,
  },
  white_city_corridor: {
    currentSpeedKmh: 19.8,
    batterySocPercent: 92,
    batteryTempCelsius: 23.8,
    geofenceZone: 'green',
    helmetDetected: true,
    tandemRidingDetected: false,
    surfaceVibrationG: 0.38,
    brakingPowerPercent: 0,
    regenerativeHarvestingWatts: 50,
    distanceTraveledKm: 5.1,
  },
  academic_university_hub: {
    currentSpeedKmh: 16.5,
    batterySocPercent: 72,
    batteryTempCelsius: 25.5,
    geofenceZone: 'green',
    helmetDetected: true,
    tandemRidingDetected: false,
    surfaceVibrationG: 0.62,
    brakingPowerPercent: 10,
    regenerativeHarvestingWatts: 40,
    distanceTraveledKm: 2.4,
  },
  koroglu_intermodal_trail: {
    currentSpeedKmh: 19.2,
    batterySocPercent: 54,
    batteryTempCelsius: 27.2,
    geofenceZone: 'green',
    helmetDetected: true,
    tandemRidingDetected: false,
    surfaceVibrationG: 0.70,
    brakingPowerPercent: 0,
    regenerativeHarvestingWatts: 48,
    distanceTraveledKm: 6.8,
  },
};

export const MOCK_MICROMOBILITY_CERTIFICATES: MicromobilityCertificate[] = [
  {
    certificateNumber: 'MICROMOBILITY-BAKU-AZ-2026-77821',
    qrPayload: '{"cert":"MICROMOBILITY-BAKU-AZ-2026-77821","fin":"5XYZ12A","cat":"shared_fleet_scooter","vSn":"WINGZ-AZ-8894","speed":20}',
    riderFullName: 'Fərid Rəhimli',
    riderFin: '5XYZ12A',
    vehicleCategory: 'shared_fleet_scooter',
    vehicleSerialNumber: 'WINGZ-AZ-8894',
    operatorBrand: 'Wingz Azerbaijan (Rəqəmsal Samokat)',
    authorizedCorridors: [
      'boulevard_seaside',
      'central_baku_ring',
      'winter_park_rail',
      'white_city_corridor',
      'academic_university_hub',
      'koroglu_intermodal_trail',
    ],
    allowedMaxSpeedKmh: 20,
    helmetCertified: true,
    examScore: 100,
    checklistScore: 100,
    simaDigitalUid: 'SIMA-AYNA-98CBA412-2026',
    issueDate: '2026-03-15',
    expiryDate: '2027-03-15',
    sha256Digest: 'sha256-a9f87c421de7630bb8c091ad44299b',
  },
  {
    certificateNumber: 'MICROMOBILITY-BAKU-AZ-2026-34019',
    qrPayload: '{"cert":"MICROMOBILITY-BAKU-AZ-2026-34019","fin":"7BKL99M","cat":"e_scooter","vSn":"NINEBOT-MAX-G2-5501","speed":20}',
    riderFullName: 'Nigar Quliyeva',
    riderFin: '7BKL99M',
    vehicleCategory: 'e_scooter',
    vehicleSerialNumber: 'NINEBOT-MAX-G2-5501',
    operatorBrand: 'Fərdi Mülkiyyət (Segway-Ninebot)',
    authorizedCorridors: [
      'boulevard_seaside',
      'central_baku_ring',
      'winter_park_rail',
      'academic_university_hub',
    ],
    allowedMaxSpeedKmh: 20,
    helmetCertified: true,
    examScore: 90,
    checklistScore: 100,
    simaDigitalUid: 'SIMA-AYNA-33D4FA01-2026',
    issueDate: '2026-04-10',
    expiryDate: '2027-04-10',
    sha256Digest: 'sha256-d71e549102cae4492bf881aa0984cf',
  },
  {
    certificateNumber: 'MICROMOBILITY-BAKU-AZ-2026-89104',
    qrPayload: '{"cert":"MICROMOBILITY-BAKU-AZ-2026-89104","fin":"1ABC45K","cat":"cargo_e_bike","vSn":"CARGO-PRO-BAKU-102","speed":20}',
    riderFullName: 'Elşən Məmmədov (Wolt Courier Express)',
    riderFin: '1ABC45K',
    vehicleCategory: 'cargo_e_bike',
    vehicleSerialNumber: 'CARGO-PRO-BAKU-102',
    operatorBrand: 'Wolt / AYNA Yaşıl Kuryer Şəbəkəsi',
    authorizedCorridors: [
      'boulevard_seaside',
      'central_baku_ring',
      'winter_park_rail',
      'white_city_corridor',
      'academic_university_hub',
      'koroglu_intermodal_trail',
    ],
    allowedMaxSpeedKmh: 20,
    helmetCertified: true,
    examScore: 100,
    checklistScore: 100,
    simaDigitalUid: 'SIMA-AYNA-77E5501B-2026',
    issueDate: '2026-05-02',
    expiryDate: '2027-05-02',
    sha256Digest: 'sha256-11b8ef09214ac350e97d19c366ff40',
  },
];
