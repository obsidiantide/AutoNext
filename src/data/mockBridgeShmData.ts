/**
 * Mock Data & Operational Scenarios for Highway Smart Bridge & Viaduct SHM Portal
 * (AAYDA, FHN & BDYP Ağıllı Körpü və Viyaduk Struktur Sağlamlığı Portalı)
 */

import {
  BridgeId,
  BridgeTelemetryState,
  BridgeClearanceCertificate,
  STRATEGIC_BRIDGES,
} from '../utils/bridgeShmCompliance';

export interface BridgeLiveState {
  bridgeId: BridgeId;
  telemetry: BridgeTelemetryState;
  activeBarrierOpen: boolean;
  activeVmsMessageAz: string;
  wimAxleReadings: {
    axleNumber: number;
    loadTonnes: number;
    legalLimitTonnes: number;
    status: 'PASS' | 'WARNING' | 'OVERLOAD';
  }[];
  lastUpdatedTimestamp: string;
}

export const INITIAL_BRIDGE_LIVE_STATES: Record<BridgeId, BridgeLiveState> = {
  BRIDGE_BAKU_BAY_OVERPASS: {
    bridgeId: 'BRIDGE_BAKU_BAY_OVERPASS',
    telemetry: {
      microstrainFbg: 218.4,
      cableTensionKn: 1420,
      groundAccelerationGal: 3.2,
      deckModalFrequencyHz: 0.38,
      dynamicAmplificationFactor: 1.12,
      windSpeedMs: 11.4,
      jointExpansionDisplacementMm: 14.8,
      activeVehiclesOnSpan: 74,
    },
    activeBarrierOpen: true,
    activeVmsMessageAz: 'SÜRƏT HƏDDİ 90 KM/S - BAKI BUXTASI ASMA KÖRPÜSÜ AÇIQDIR',
    wimAxleReadings: [
      { axleNumber: 1, loadTonnes: 6.2, legalLimitTonnes: 11.5, status: 'PASS' },
      { axleNumber: 2, loadTonnes: 9.8, legalLimitTonnes: 11.5, status: 'PASS' },
      { axleNumber: 3, loadTonnes: 7.1, legalLimitTonnes: 11.5, status: 'PASS' },
    ],
    lastUpdatedTimestamp: '2026-10-31 00:04:15',
  },
  BRIDGE_KOROGLU_INTERMODAL: {
    bridgeId: 'BRIDGE_KOROGLU_INTERMODAL',
    telemetry: {
      microstrainFbg: 310.5,
      cableTensionKn: 0,
      groundAccelerationGal: 4.8,
      deckModalFrequencyHz: 1.15,
      dynamicAmplificationFactor: 1.18,
      windSpeedMs: 8.2,
      jointExpansionDisplacementMm: 22.3,
      activeVehiclesOnSpan: 112,
    },
    activeBarrierOpen: true,
    activeVmsMessageAz: 'HƏRƏKƏT İNTENSİVDİR - TƏHLÜKƏSİZ ARA MƏSAFƏSİ SAXLAYIN (30M)',
    wimAxleReadings: [
      { axleNumber: 1, loadTonnes: 5.8, legalLimitTonnes: 11.5, status: 'PASS' },
      { axleNumber: 2, loadTonnes: 10.4, legalLimitTonnes: 11.5, status: 'PASS' },
    ],
    lastUpdatedTimestamp: '2026-10-31 00:04:18',
  },
  BRIDGE_KURA_RIVER_SALYAN: {
    bridgeId: 'BRIDGE_KURA_RIVER_SALYAN',
    telemetry: {
      microstrainFbg: 195.0,
      cableTensionKn: 1280,
      groundAccelerationGal: 2.1,
      deckModalFrequencyHz: 0.45,
      dynamicAmplificationFactor: 1.09,
      windSpeedMs: 13.5,
      jointExpansionDisplacementMm: 12.1,
      activeVehiclesOnSpan: 32,
    },
    activeBarrierOpen: true,
    activeVmsMessageAz: 'KÜR ÇAYI YENİ ASMA KÖRPÜSÜ - NORMAL HƏRƏKƏT REJİMİ',
    wimAxleReadings: [
      { axleNumber: 1, loadTonnes: 7.0, legalLimitTonnes: 11.5, status: 'PASS' },
      { axleNumber: 2, loadTonnes: 11.2, legalLimitTonnes: 11.5, status: 'PASS' },
      { axleNumber: 3, loadTonnes: 7.8, legalLimitTonnes: 11.5, status: 'PASS' },
      { axleNumber: 4, loadTonnes: 7.9, legalLimitTonnes: 11.5, status: 'PASS' },
      { axleNumber: 5, loadTonnes: 7.6, legalLimitTonnes: 11.5, status: 'PASS' },
    ],
    lastUpdatedTimestamp: '2026-10-31 00:04:22',
  },
  BRIDGE_KHUDAFERIN_ARAZ: {
    bridgeId: 'BRIDGE_KHUDAFERIN_ARAZ',
    telemetry: {
      microstrainFbg: 160.2,
      cableTensionKn: 0,
      groundAccelerationGal: 1.8,
      deckModalFrequencyHz: 2.1,
      dynamicAmplificationFactor: 1.05,
      windSpeedMs: 7.0,
      jointExpansionDisplacementMm: 8.5,
      activeVehiclesOnSpan: 18,
    },
    activeBarrierOpen: true,
    activeVmsMessageAz: 'XUDAFƏRİN KÖRPÜSÜ - BEYNƏLXALQ TRANZİT DƏHLİZİ AÇIQDIR',
    wimAxleReadings: [
      { axleNumber: 1, loadTonnes: 6.4, legalLimitTonnes: 10.0, status: 'PASS' },
      { axleNumber: 2, loadTonnes: 9.5, legalLimitTonnes: 10.0, status: 'PASS' },
    ],
    lastUpdatedTimestamp: '2026-10-31 00:04:25',
  },
  BRIDGE_GANJA_CHAY_BYPASS: {
    bridgeId: 'BRIDGE_GANJA_CHAY_BYPASS',
    telemetry: {
      microstrainFbg: 242.0,
      cableTensionKn: 1510,
      groundAccelerationGal: 3.6,
      deckModalFrequencyHz: 0.52,
      dynamicAmplificationFactor: 1.14,
      windSpeedMs: 12.8,
      jointExpansionDisplacementMm: 19.4,
      activeVehiclesOnSpan: 46,
    },
    activeBarrierOpen: true,
    activeVmsMessageAz: 'GƏNCƏÇAY ASMA VİYADUKU - TRZ-QAZAX YOLU AÇIQDIR',
    wimAxleReadings: [
      { axleNumber: 1, loadTonnes: 6.8, legalLimitTonnes: 11.5, status: 'PASS' },
      { axleNumber: 2, loadTonnes: 10.1, legalLimitTonnes: 11.5, status: 'PASS' },
      { axleNumber: 3, loadTonnes: 8.2, legalLimitTonnes: 11.5, status: 'PASS' },
    ],
    lastUpdatedTimestamp: '2026-10-31 00:04:30',
  },
  BRIDGE_ZAFAR_DASHALTI_SHUSHA: {
    bridgeId: 'BRIDGE_ZAFAR_DASHALTI_SHUSHA',
    telemetry: {
      microstrainFbg: 205.8,
      cableTensionKn: 0,
      groundAccelerationGal: 2.9,
      deckModalFrequencyHz: 0.88,
      dynamicAmplificationFactor: 1.11,
      windSpeedMs: 14.2,
      jointExpansionDisplacementMm: 16.0,
      activeVehiclesOnSpan: 14,
    },
    activeBarrierOpen: true,
    activeVmsMessageAz: 'ZƏFƏR YOLU DAŞALTI DƏRƏSİ HÜNDÜR VİYADUKU - DİQQƏTLİ SÜRÜŞ',
    wimAxleReadings: [
      { axleNumber: 1, loadTonnes: 5.5, legalLimitTonnes: 10.0, status: 'PASS' },
      { axleNumber: 2, loadTonnes: 8.8, legalLimitTonnes: 10.0, status: 'PASS' },
    ],
    lastUpdatedTimestamp: '2026-10-31 00:04:35',
  },
};

export const MOCK_BRIDGE_CERTIFICATES: BridgeClearanceCertificate[] = [
  {
    certificateNumber: 'BRIDGE-SHM-AZ-2026-88102',
    bridgeId: 'BRIDGE_BAKU_BAY_OVERPASS',
    bridgeNameAz: STRATEGIC_BRIDGES.BRIDGE_BAKU_BAY_OVERPASS.nameAz,
    vehiclePlate: '99-TK-812',
    vehicleClass: 'CLASS_5_SEMI_TRAILER',
    grossWeightTonnes: 38.6,
    maxAxleLoadTonnes: 10.8,
    permittedSpeedKmH: 80,
    trafficLaneAssigned: 'Zolaq 1 (Kənar sağ zolaq - ağır tonnaj)',
    escortRequired: false,
    issueDate: '2026-10-30 14:22:10',
    expiryDate: '2026-10-31 14:22:10',
    simaSignatureUid: 'SIMA-SHM-4A9B1C88-AAYDA-GOV-AZ',
    qrCodeData: 'https://aayda.gov.az/shm/verify?cert=BRIDGE-SHM-AZ-2026-88102',
    complianceStatus: 'VERIFIED_ACTIVE',
    inspectorCallsign: 'AAYDA-SHM-BAKU-DISPATCH-07',
    shmSafetyIndex: 96,
  },
  {
    certificateNumber: 'BRIDGE-SHM-AZ-2026-72419',
    bridgeId: 'BRIDGE_KURA_RIVER_SALYAN',
    bridgeNameAz: STRATEGIC_BRIDGES.BRIDGE_KURA_RIVER_SALYAN.nameAz,
    vehiclePlate: '50-AA-555',
    vehicleClass: 'CLASS_4_RIGID_TRUCK',
    grossWeightTonnes: 24.2,
    maxAxleLoadTonnes: 9.6,
    permittedSpeedKmH: 70,
    trafficLaneAssigned: 'Zolaq 2 & 3 (Orta sürət zolağı)',
    escortRequired: false,
    issueDate: '2026-10-30 16:05:44',
    expiryDate: '2026-10-31 16:05:44',
    simaSignatureUid: 'SIMA-SHM-7E2D9914-AAYDA-GOV-AZ',
    qrCodeData: 'https://aayda.gov.az/shm/verify?cert=BRIDGE-SHM-AZ-2026-72419',
    complianceStatus: 'VERIFIED_ACTIVE',
    inspectorCallsign: 'AAYDA-SHM-SALYAN-DISPATCH-03',
    shmSafetyIndex: 94,
  },
  {
    certificateNumber: 'BRIDGE-SHM-AZ-2026-44910',
    bridgeId: 'BRIDGE_KHUDAFERIN_ARAZ',
    bridgeNameAz: STRATEGIC_BRIDGES.BRIDGE_KHUDAFERIN_ARAZ.nameAz,
    vehiclePlate: '90-XO-909',
    vehicleClass: 'CLASS_6_OVERSIZE_HEAVY',
    grossWeightTonnes: 54.0,
    maxAxleLoadTonnes: 11.2,
    permittedSpeedKmH: 40,
    trafficLaneAssigned: 'Zolaq 1 (Kənar sağ zolaq - ağır tonnaj)',
    escortRequired: true,
    issueDate: '2026-10-30 18:30:12',
    expiryDate: '2026-10-31 18:30:12',
    simaSignatureUid: 'SIMA-SHM-3B1289DF-AAYDA-GOV-AZ',
    qrCodeData: 'https://aayda.gov.az/shm/verify?cert=BRIDGE-SHM-AZ-2026-44910',
    complianceStatus: 'VERIFIED_ACTIVE',
    inspectorCallsign: 'AAYDA-SHM-QARABAG-DISPATCH-01',
    shmSafetyIndex: 88,
  },
];
