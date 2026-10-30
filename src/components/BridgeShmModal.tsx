import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Award,
  Truck,
  RefreshCw,
  X,
  Sliders,
  Wind,
  Gauge,
  Activity,
  Layers,
  Sparkles,
  Eye,
  Check,
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
  ChevronRight,
  MapPin,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  formatCurrency,
  BridgeId,
  BridgeVehicleClass,
  BridgeTelemetryState,
  BridgeClearanceCertificate,
  STRATEGIC_BRIDGES,
  BRIDGE_VEHICLE_CONFIGS,
  BRIDGE_SAFETY_CHECKLIST,
  BRIDGE_EXAM_QUESTIONS,
  evaluateStructuralHealth,
  calculateBridgeTransitFee,
  evaluateBridgeChecklist,
  evaluateBridgeExam,
  generateBridgeCertificate,
} from '../utils/bridgeShmCompliance';
import {
  INITIAL_BRIDGE_LIVE_STATES,
  MOCK_BRIDGE_CERTIFICATES,
  BridgeLiveState,
} from '../data/mockBridgeShmData';

interface BridgeShmModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type BridgeTabId =
  | 'radar'
  | 'telemetry'
  | 'calculator'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const BridgeShmModal: React.FC<BridgeShmModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  // Navigation & Preferences
  const [activeTab, setActiveTab] = useState<BridgeTabId>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Selected Bridge
  const [selectedBridgeId, setSelectedBridgeId] = useState<BridgeId>('BRIDGE_BAKU_BAY_OVERPASS');
  const [bridgeSearchQuery, setBridgeSearchQuery] = useState('');

  // Live States per Bridge
  const [bridgeLiveStates, setBridgeLiveStates] = useState<Record<BridgeId, BridgeLiveState>>(
    INITIAL_BRIDGE_LIVE_STATES
  );

  // Calculator Parameters
  const [calcPlate, setCalcPlate] = useState(targetCar?.plateNumber || '99-TK-812');
  const [calcVehicleClass, setCalcVehicleClass] =
    useState<BridgeVehicleClass>('CLASS_5_SEMI_TRAILER');
  const [calcGrossWeightTonnes, setCalcGrossWeightTonnes] = useState(38.5);
  const [calcAxleCount, setCalcAxleCount] = useState(5);
  const [calcMaxAxleWeightTonnes, setCalcMaxAxleWeightTonnes] = useState(10.5);

  // Checklist State
  const [checkedChecklistItems, setCheckedChecklistItems] = useState<string[]>(
    BRIDGE_SAFETY_CHECKLIST.map((item) => item.id)
  );

  // Exam Simulator State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Certificates Registry State
  const [certificates, setCertificates] =
    useState<BridgeClearanceCertificate[]>(MOCK_BRIDGE_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<BridgeClearanceCertificate>(
    MOCK_BRIDGE_CERTIFICATES[0]
  );
  const [registrySearchQuery, setRegistrySearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Selected Bridge Object & Live State
  const currentBridge = STRATEGIC_BRIDGES[selectedBridgeId];
  const currentLiveState = bridgeLiveStates[selectedBridgeId];

  // Structural Health Evaluation
  const healthEvaluation = useMemo(() => {
    return evaluateStructuralHealth(currentLiveState.telemetry, currentBridge);
  }, [currentLiveState.telemetry, currentBridge]);

  // Transit Fee Calculation
  const transitFeeCalc = useMemo(() => {
    return calculateBridgeTransitFee(
      calcVehicleClass,
      calcGrossWeightTonnes,
      calcAxleCount,
      calcMaxAxleWeightTonnes,
      currentBridge,
      currency
    );
  }, [
    calcVehicleClass,
    calcGrossWeightTonnes,
    calcAxleCount,
    calcMaxAxleWeightTonnes,
    currentBridge,
    currency,
  ]);

  // Checklist Evaluation
  const checklistResult = useMemo(() => {
    return evaluateBridgeChecklist(checkedChecklistItems);
  }, [checkedChecklistItems]);

  // Exam Evaluation
  const examResult = useMemo(() => {
    return evaluateBridgeExam(examAnswers);
  }, [examAnswers]);

  // Filtered Bridges
  const filteredBridges = useMemo(() => {
    const q = bridgeSearchQuery.toLowerCase();
    return Object.values(STRATEGIC_BRIDGES).filter(
      (b) =>
        b.nameAz.toLowerCase().includes(q) ||
        b.nameEn.toLowerCase().includes(q) ||
        b.highwayCode.toLowerCase().includes(q) ||
        b.locationAz.toLowerCase().includes(q)
    );
  }, [bridgeSearchQuery]);

  // Filtered Registry
  const filteredCertificates = useMemo(() => {
    const q = registrySearchQuery.toLowerCase();
    return certificates.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.vehiclePlate.toLowerCase().includes(q) ||
        c.bridgeNameAz.toLowerCase().includes(q) ||
        c.simaSignatureUid.toLowerCase().includes(q)
    );
  }, [certificates, registrySearchQuery]);

  if (!isOpen) return null;

  // Handlers
  const handleUpdateTelemetry = (field: keyof BridgeTelemetryState, value: number) => {
    setBridgeLiveStates((prev) => ({
      ...prev,
      [selectedBridgeId]: {
        ...prev[selectedBridgeId],
        telemetry: {
          ...prev[selectedBridgeId].telemetry,
          [field]: value,
        },
      },
    }));
  };

  const handleToggleBarrier = () => {
    setBridgeLiveStates((prev) => ({
      ...prev,
      [selectedBridgeId]: {
        ...prev[selectedBridgeId],
        activeBarrierOpen: !prev[selectedBridgeId].activeBarrierOpen,
      },
    }));
  };

  const handleToggleChecklistItem = (id: string) => {
    setCheckedChecklistItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    setCheckedChecklistItems(BRIDGE_SAFETY_CHECKLIST.map((item) => item.id));
  };

  const handleClearChecklist = () => {
    setCheckedChecklistItems([]);
  };

  const handleSelectExamOption = (questionId: number, optionIndex: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGenerateCertificate = () => {
    const cert = generateBridgeCertificate(
      selectedBridgeId,
      calcPlate,
      calcVehicleClass,
      calcGrossWeightTonnes,
      calcMaxAxleWeightTonnes,
      healthEvaluation
    );
    setCertificates((prev) => [cert, ...prev]);
    setActiveCertificate(cert);
    setActiveTab('certificate');
  };

  const handleCopyCertificate = () => {
    const text = `AAYDA & BDYP STRUKTUR SAĞLAMLIQ SERTİFİKATI:
№: ${activeCertificate.certificateNumber}
Körpü: ${activeCertificate.bridgeNameAz}
Nəqliyyat Qeydiyyatı: ${activeCertificate.vehiclePlate}
Kateqoriya: ${activeCertificate.vehicleClass}
Ümumi Kütlə: ${activeCertificate.grossWeightTonnes} ton
Maksimal Ox Yükü: ${activeCertificate.maxAxleLoadTonnes} ton
Təyin Edilmiş Zolaq: ${activeCertificate.trafficLaneAssigned}
İcazə Verilən Sürət: ${activeCertificate.permittedSpeedKmH} km/s
Eskort Tələbi: ${activeCertificate.escortRequired ? 'BƏLİ (BDYP Müşayiəti)' : 'XEYR'}
SİMA İmza UID: ${activeCertificate.simaSignatureUid}
Təhlükəsizlik İndeksi: %${activeCertificate.shmSafetyIndex}`;

    navigator.clipboard?.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-xl shadow-lg ring-1 ring-cyan-400/30">
              <Layers className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                  AAYDA • FHN • BDYP
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  SHM-TELEMETRY-AZ-2026
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Ağıllı Körpü & Viyaduk Struktur Sağlamlığı Monitorinqi (BRIDGE-SHM)
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    currency === cur
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2.5 bg-slate-950/90 border-b border-slate-800 overflow-x-auto scrollbar-none text-xs sm:text-sm">
          {[
            { id: 'radar', label: 'Körpülər Radarı', icon: Activity },
            { id: 'telemetry', label: 'Sensor Telemetriyası & WIM', icon: Gauge },
            { id: 'calculator', label: 'Ox Yükü & Rüsum Kalkulyatoru', icon: Sliders },
            { id: 'checklist', label: '10-Maddəlik SHM Təftişi', icon: ShieldCheck },
            { id: 'exam', label: 'Mühəndislik İmtahanı', icon: Award },
            { id: 'certificate', label: 'Elektron Buraxılış Vərəqəsi', icon: FileText },
            { id: 'registry', label: 'Vahid Reyestr', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as BridgeTabId)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              {/* Search & Overview Top Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={bridgeSearchQuery}
                    onChange={(e) => setBridgeSearchQuery(e.target.value)}
                    placeholder="Strateji körpü və ya viyaduk adı, magistral kodu və ya region üzrə axtar..."
                    className="w-full bg-slate-800/80 border border-slate-700 pl-11 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs">
                  <span className="text-slate-400">Canlı Monitorinq Obyektləri:</span>
                  <span className="font-bold text-cyan-400">
                    {filteredBridges.length} Körpü / Viyaduk
                  </span>
                </div>
              </div>

              {/* Bridge Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {filteredBridges.map((bridge) => {
                  const isSelected = selectedBridgeId === bridge.id;
                  const live = bridgeLiveStates[bridge.id];
                  const evalState = evaluateStructuralHealth(live.telemetry, bridge);

                  return (
                    <div
                      key={bridge.id}
                      onClick={() => setSelectedBridgeId(bridge.id)}
                      className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-b from-slate-800 to-indigo-950/40 border-cyan-500 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-700/80 text-cyan-300 font-mono">
                            {bridge.highwayCode}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                              evalState.alertStatus === 'STATUS_NOMINAL_GREEN'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : evalState.alertStatus === 'STATUS_ADVISORY_AMBER'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : evalState.alertStatus === 'STATUS_RESTRICTED_ORANGE'
                                ? 'bg-orange-950 text-orange-300 border border-orange-800'
                                : 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {evalState.alertStatus === 'STATUS_NOMINAL_GREEN'
                              ? 'SAĞLAM (%100)'
                              : evalState.alertStatus === 'STATUS_ADVISORY_AMBER'
                              ? 'MƏLUMAT'
                              : evalState.alertStatus === 'STATUS_RESTRICTED_ORANGE'
                              ? 'MƏHDUDİYYƏT'
                              : 'QƏZA HƏYƏCANI'}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-white leading-tight">
                            {bridge.nameAz}
                          </h2>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {bridge.locationAz}
                          </p>
                        </div>

                        {/* Structural Specs Pills */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-700/60 font-mono">
                          <div className="bg-slate-900/60 p-2 rounded-lg">
                            <span className="text-slate-400 block text-[10px]">Aşırım / Uzunluq:</span>
                            <span className="font-semibold text-slate-200">
                              {bridge.mainSpanMeters}m / {bridge.totalLengthMeters}m
                            </span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded-lg">
                            <span className="text-slate-400 block text-[10px]">Maks Ox / Ümumi:</span>
                            <span className="font-semibold text-slate-200">
                              {bridge.maxPermissibleAxleLoadTonnes}t / {bridge.maxPermissibleGrossWeightTonnes}t
                            </span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded-lg">
                            <span className="text-slate-400 block text-[10px]">FBG Lifli Sensor:</span>
                            <span className="font-semibold text-cyan-400">
                              {bridge.fbgSensorCount} tenzometr
                            </span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded-lg">
                            <span className="text-slate-400 block text-[10px]">HS-WIM Stansiyası:</span>
                            <span className="font-semibold text-indigo-300">
                              {bridge.wimStationCode}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-4 mt-3 flex items-center justify-between border-t border-slate-700/60 text-xs">
                        <span className="text-slate-400 font-mono">
                          {live.telemetry.activeVehiclesOnSpan} avto aşırımda
                        </span>
                        <span className="text-cyan-400 font-bold flex items-center gap-1 hover:translate-x-0.5 transition">
                          Telemetriyaya Bax <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Bridge Detailed Banner */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      Seçilmiş Körpü SCADA İcmalı
                    </span>
                    <h3 className="text-lg font-bold text-white">{currentBridge.nameAz}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {currentBridge.aaydaRegionalDivision} • Təhlükəsizlik İndeksi: %
                      {healthEvaluation.healthScorePercent}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('telemetry')}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2"
                    >
                      <Gauge className="w-4 h-4" />
                      Canlı Sensor Telemetriyası
                    </button>
                    <button
                      onClick={() => setActiveTab('calculator')}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                    >
                      <Sliders className="w-4 h-4" />
                      Ox Yükünü Hesabla
                    </button>
                  </div>
                </div>

                {/* VMS Message Display */}
                <div className="bg-black/80 border-2 border-amber-500/80 rounded-xl p-3 text-center font-mono">
                  <span className="text-xs text-amber-500 uppercase tracking-widest block mb-1">
                    VMS DİNAMİK YOL ELEKTRON TABLOSU (AAYDA SCADA)
                  </span>
                  <span className="text-base sm:text-lg font-bold text-amber-300">
                    {currentLiveState.activeVmsMessageAz}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY & WIM */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              {/* Selected Bridge Header */}
              <div className="flex flex-wrap items-center justify-between bg-slate-800/60 border border-slate-700 px-5 py-3 rounded-2xl gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{currentBridge.nameAz}</h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Stansiya: {currentBridge.wimStationCode} | Aşırım: {currentBridge.mainSpanMeters}m
                    </span>
                  </div>
                </div>

                {/* Emergency Barrier Manual Override Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleBarrier}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                      currentLiveState.activeBarrierOpen
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                        : 'bg-red-950 text-red-300 border-red-800 hover:bg-red-900 animate-pulse'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Şlaqbaum: {currentLiveState.activeBarrierOpen ? 'AÇIQDIR' : 'QAPALIDIR (BLOK)'}
                  </button>
                </div>
              </div>

              {/* 5 Real-Time Telemetry Gauges / Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. FBG Optical Strain */}
                <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      FBG Optik Lifli Gərginlik (με)
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        currentLiveState.telemetry.microstrainFbg > 650
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : currentLiveState.telemetry.microstrainFbg > 450
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {currentLiveState.telemetry.microstrainFbg.toFixed(1)} με
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="800"
                    step="5"
                    value={currentLiveState.telemetry.microstrainFbg}
                    onChange={(e) =>
                      handleUpdateTelemetry('microstrainFbg', parseFloat(e.target.value))
                    }
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Nominal: &lt;450 με</span>
                    <span>Kritik: &gt;650 με</span>
                  </div>
                </div>

                {/* 2. Stay Cable Dynamic Tension */}
                <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Vant Dinamik Gərilmə (kN)
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        currentLiveState.telemetry.cableTensionKn > 3200
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : currentLiveState.telemetry.cableTensionKn > 2600
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {currentLiveState.telemetry.cableTensionKn} kN
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="4000"
                    step="50"
                    value={currentLiveState.telemetry.cableTensionKn}
                    onChange={(e) =>
                      handleUpdateTelemetry('cableTensionKn', parseFloat(e.target.value))
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                    disabled={currentBridge.cableStayCount === 0}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>
                      {currentBridge.cableStayCount > 0
                        ? `${currentBridge.cableStayCount} tros aktiv`
                        : 'Vantsız konstruksiya'}
                    </span>
                    <span>Hədd: 2600 kN</span>
                  </div>
                </div>

                {/* 3. Triaxial Seismic PGA */}
                <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-red-400" />
                      Seysmik Təcil PGA (Gal)
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        currentLiveState.telemetry.groundAccelerationGal > 50
                          ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                          : currentLiveState.telemetry.groundAccelerationGal > 15
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {currentLiveState.telemetry.groundAccelerationGal.toFixed(1)} Gal
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={currentLiveState.telemetry.groundAccelerationGal}
                    onChange={(e) =>
                      handleUpdateTelemetry('groundAccelerationGal', parseFloat(e.target.value))
                    }
                    className="w-full accent-red-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Nominal: &lt;15 Gal</span>
                    <span>Qəza: &gt;50 Gal</span>
                  </div>
                </div>

                {/* 4. Anemometer Wind Velocity */}
                <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-teal-400" />
                      Külək Sürəti (m/s)
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        currentLiveState.telemetry.windSpeedMs > 25
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : currentLiveState.telemetry.windSpeedMs > 15
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {currentLiveState.telemetry.windSpeedMs.toFixed(1)} m/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="0.5"
                    value={currentLiveState.telemetry.windSpeedMs}
                    onChange={(e) =>
                      handleUpdateTelemetry('windSpeedMs', parseFloat(e.target.value))
                    }
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Xəbərdarlıq: 15 m/s</span>
                    <span>Fırtına: &gt;25 m/s</span>
                  </div>
                </div>

                {/* 5. Thermal Expansion Joint */}
                <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-purple-400" />
                      Dilatasiya Dərzi (mm)
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        Math.abs(currentLiveState.telemetry.jointExpansionDisplacementMm) > 90
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : Math.abs(currentLiveState.telemetry.jointExpansionDisplacementMm) > 75
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {currentLiveState.telemetry.jointExpansionDisplacementMm > 0 ? '+' : ''}
                      {currentLiveState.telemetry.jointExpansionDisplacementMm.toFixed(1)} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={currentLiveState.telemetry.jointExpansionDisplacementMm}
                    onChange={(e) =>
                      handleUpdateTelemetry(
                        'jointExpansionDisplacementMm',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Norma: ±75 mm</span>
                    <span>Hədd: ±90 mm</span>
                  </div>
                </div>

                {/* 6. Active Vehicles Count */}
                <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-400" />
                      Aşırımda Aktiv Avto Sayı
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                      {currentLiveState.telemetry.activeVehiclesOnSpan} ədəd
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="2"
                    value={currentLiveState.telemetry.activeVehiclesOnSpan}
                    onChange={(e) =>
                      handleUpdateTelemetry('activeVehiclesOnSpan', parseInt(e.target.value))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Buraxılış: {currentBridge.lanesCount} zolaq</span>
                    <span>Maksimum: 180 avto</span>
                  </div>
                </div>
              </div>

              {/* Live Weigh-in-Motion (WIM) Telemetry Stand */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {currentBridge.wimStationCode} Pyezo-Kvars Ox Çəki Göstəriciləri
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Dinamik Axın Ox Yükləri (Weigh-in-Motion)
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Son Kalibrasiya: {currentLiveState.lastUpdatedTimestamp}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {currentLiveState.wimAxleReadings.map((axle) => (
                    <div
                      key={axle.axleNumber}
                      className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-center space-y-1 font-mono"
                    >
                      <span className="text-xs text-slate-400 block">
                        Ox №{axle.axleNumber} (Təkər cütü)
                      </span>
                      <span className="text-lg font-bold text-cyan-300">
                        {axle.loadTonnes.toFixed(1)} t
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Limit: {axle.legalLimitTonnes} t
                      </div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          axle.status === 'PASS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {axle.status === 'PASS' ? 'UYĞUNDUR' : 'İFRAT OX YÜKÜ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Diagnostics Table */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
                  AAYDA Struktur Diaqnostika Hesabatı
                </h3>
                <div className="space-y-2.5">
                  {healthEvaluation.diagnostics.map((diag, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 text-xs gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 block">{diag.parameter}</span>
                        <p className="text-slate-400 text-[11px]">{diag.noteAz}</p>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0 font-mono">
                        <span className="text-slate-300 font-bold">{diag.valueStr}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            diag.status === 'NORMAL'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : diag.status === 'WARNING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}
                        >
                          {diag.status === 'NORMAL'
                            ? 'NORMAL'
                            : diag.status === 'WARNING'
                            ? 'XƏBƏRDARLIQ'
                            : 'KRİTİK HƏDD'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Config Panel */}
                <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Ağırçəkili Nəqliyyat Ox Yükü & Rüsum Kalkulyatoru
                      </h3>
                      <p className="text-xs text-slate-400">
                        NK-nin 104 saylı Qərarı və AAYDA tarif cədvəli əsasında rəsmi hesablama
                      </p>
                    </div>
                  </div>

                  {/* Vehicle License Plate */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Nəqliyyat Vasitəsinin Dövlət Qeydiyyat Nişanı:
                    </label>
                    <input
                      type="text"
                      value={calcPlate}
                      onChange={(e) => setCalcPlate(e.target.value.toUpperCase())}
                      placeholder="Məs: 99-TK-812 və ya 10-AA-100"
                      className="w-full bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Vehicle Class Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Nəqliyyat Kateqoriyası:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.values(BRIDGE_VEHICLE_CONFIGS).map((cfg) => (
                        <button
                          key={cfg.id}
                          onClick={() => {
                            setCalcVehicleClass(cfg.id);
                            setCalcAxleCount(cfg.defaultAxleCount);
                            setCalcGrossWeightTonnes(cfg.maxGrossWeightTonnes * 0.9);
                            setCalcMaxAxleWeightTonnes(
                              Math.min(11.5, (cfg.maxGrossWeightTonnes * 0.9) / cfg.defaultAxleCount)
                            );
                          }}
                          className={`p-3 rounded-xl border text-left transition ${
                            calcVehicleClass === cfg.id
                              ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-md'
                              : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                          }`}
                        >
                          <span className="font-bold block text-slate-200">{cfg.titleAz}</span>
                          <span className="text-[11px] text-cyan-400 font-mono mt-0.5 block">
                            Baza Rüsum: {formatCurrency(cfg.baseBridgeTollAzn, currency)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders for Gross Weight, Axle Count, Max Axle Load */}
                  <div className="space-y-4 pt-2 border-t border-slate-700/60">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">Ümumi Kütlə (Gross Weight):</span>
                        <span className="font-bold text-cyan-400 font-mono">
                          {calcGrossWeightTonnes.toFixed(1)} ton
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="70"
                        step="0.5"
                        value={calcGrossWeightTonnes}
                        onChange={(e) => setCalcGrossWeightTonnes(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">Oxların Sayı (Axle Count):</span>
                        <span className="font-bold text-indigo-400 font-mono">
                          {calcAxleCount} oxlu
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        step="1"
                        value={calcAxleCount}
                        onChange={(e) => setCalcAxleCount(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">
                          Ən Ağır Oxun Təkər Yükü (Single Axle Load):
                        </span>
                        <span
                          className={`font-bold font-mono ${
                            calcMaxAxleWeightTonnes > currentBridge.maxPermissibleAxleLoadTonnes
                              ? 'text-red-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {calcMaxAxleWeightTonnes.toFixed(1)} ton (Limit:{' '}
                          {currentBridge.maxPermissibleAxleLoadTonnes}t)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="18"
                        step="0.2"
                        value={calcMaxAxleWeightTonnes}
                        onChange={(e) => setCalcMaxAxleWeightTonnes(parseFloat(e.target.value))}
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Result Card */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                      Rəsmi Tranzit Qiymətləndirməsi
                    </span>

                    <div className="space-y-2 border-b border-slate-700/60 pb-3 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Baza Körpü Keçid Haqqı:</span>
                        <span className="font-bold font-mono">
                          {formatCurrency(transitFeeCalc.baseBridgeTollAzn, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>İfrat Ox / Çəki Cəriməsi:</span>
                        <span
                          className={`font-bold font-mono ${
                            transitFeeCalc.overweightPenaltyAzn > 0
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {formatCurrency(transitFeeCalc.overweightPenaltyAzn, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>BDYP Müşayiət Rüsumu:</span>
                        <span
                          className={`font-bold font-mono ${
                            transitFeeCalc.escortFeeAzn > 0 ? 'text-indigo-400' : 'text-slate-400'
                          }`}
                        >
                          {formatCurrency(transitFeeCalc.escortFeeAzn, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Total Fee Box */}
                    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-4 text-center space-y-1">
                      <span className="text-xs text-slate-400 block font-semibold">
                        Yekun Ödəniş Məbləği:
                      </span>
                      <span className="text-2xl font-extrabold text-cyan-300 font-mono">
                        {formatCurrency(transitFeeCalc.totalFeeAzn, currency)}
                      </span>
                    </div>

                    {/* Transit Compliance Status Badge */}
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        transitFeeCalc.transitPermitted
                          ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                          : 'bg-red-950/70 border-red-800 text-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {transitFeeCalc.transitPermitted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            TRANZİTƏ İCAZƏ VERİLİR
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            TRANZİT QADAĞANDIR!
                          </>
                        )}
                      </div>
                      <p className="text-[11px] opacity-90">
                        {transitFeeCalc.transitPermitted
                          ? 'Göstərilən parametrlər körpünün struktur dayanıqlıq hədlərinə uyğundur.'
                          : transitFeeCalc.rejectionReasonAz}
                      </p>
                    </div>
                  </div>

                  {/* Generate Certificate CTA */}
                  <button
                    onClick={handleGenerateCertificate}
                    disabled={!transitFeeCalc.transitPermitted}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg ${
                      transitFeeCalc.transitPermitted
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white cursor-pointer shadow-cyan-950'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Rəsmi SHM Buraxılış Sertifikatı Yarat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              {/* Checklist Control Header */}
              <div className="flex flex-wrap items-center justify-between bg-slate-800/60 border border-slate-700 px-5 py-4 rounded-2xl gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    10-Maddəlik Körpü Struktur Təhlükəsizlik və SHM Təftişi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Eurocode EN 1991-2 və AZS 410 standartı üzrə məcburi mühəndislik yoxlamaları
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleClearChecklist}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                  checklistResult.passed
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/60 border-amber-800 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      checklistResult.passed ? 'bg-emerald-900/60' : 'bg-amber-900/60'
                    }`}
                  >
                    {checklistResult.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">
                      Təftiş Nəticəsi: {checklistResult.scorePercent}% Uyğunluq
                    </span>
                    <span className="text-[11px] opacity-80">
                      {checklistResult.passed
                        ? 'Körpünün bütün kritik təhlükəsizlik parametrləri təsdiqləndi.'
                        : `Məcburi bəndlər üzrə çatışmazlıq: ${checklistResult.missingMandatoryCount} maddə təsdiqlənməyib.`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist Items List */}
              <div className="space-y-3">
                {BRIDGE_SAFETY_CHECKLIST.map((item) => {
                  const isChecked = checkedChecklistItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-slate-800/80 border-cyan-500/60'
                          : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900/80'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                          isChecked ? 'bg-cyan-500 text-slate-950' : 'border border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">{item.titleAz}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded">
                              {item.statutoryReference}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                item.criticalSeverity === 'HIGH'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {item.criticalSeverity === 'HIGH' ? 'MƏCBURİ' : 'DÖVRİ'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{item.requirementAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              {/* Exam Header */}
              <div className="flex flex-wrap items-center justify-between bg-slate-800/60 border border-slate-700 px-5 py-4 rounded-2xl gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    İnşaat & Körpü Mühəndisliyi Təhlükəsizlik Test Simulyatoru
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA Körpü Müfəttişi və SHM operatoru attestasiyası üzrə 10 sual
                  </p>
                </div>

                {!examSubmitted ? (
                  <button
                    onClick={() => setExamSubmitted(true)}
                    disabled={Object.keys(examAnswers).length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    Cavabları Təsdiqlə və Qiymətləndir
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Yenidən Başla
                  </button>
                )}
              </div>

              {/* Exam Result Display */}
              {examSubmitted && (
                <div
                  className={`p-5 rounded-2xl border text-xs flex items-center justify-between ${
                    examResult.passed
                      ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                      : 'bg-red-950/70 border-red-800 text-red-200'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-base font-bold block">
                      İmtahan Nəticəsi: %{examResult.scorePercent} (
                      {examResult.correctAnswersCount} / {examResult.totalQuestions} Düzgün)
                    </span>
                    <p className="opacity-90">
                      {examResult.passed
                        ? 'Təbriklər! Siz AAYDA SHM mühəndisi attestasiya həddini (%80) müvəffəqiyyətlə keçdiniz.'
                        : 'Müvəffəqiyyət həddi təmin edilmədi (%80 tələb olunur). Zəhmət olmasa materialı təkrarlayın.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {BRIDGE_EXAM_QUESTIONS.map((q) => {
                  const selectedOpt = examAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                        {q.id}. {q.questionAz}
                      </h4>

                      <div className="space-y-2">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optStyle =
                            'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-900';

                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optStyle =
                                'bg-emerald-950/80 border-emerald-600 text-emerald-200 font-bold';
                            } else if (isOptionSelected) {
                              optStyle = 'bg-red-950/80 border-red-600 text-red-200';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'bg-cyan-950/80 border-cyan-500 text-white font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectExamOption(q.id, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && optIdx === q.correctOptionIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                          <span className="font-semibold text-cyan-400">Şərh:</span>{' '}
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Certificate Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 border border-slate-700 px-5 py-3 rounded-2xl">
                <span className="text-xs text-slate-300 font-mono">
                  Sənəd Qeydiyyat №: {activeCertificate.certificateNumber}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCertificate}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copySuccess ? 'Kopyalandı!' : 'Məlumatı Kopyala'}
                  </button>
                  <button
                    onClick={handlePrintCertificate}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Çap Et
                  </button>
                </div>
              </div>

              {/* Printable Official Certificate Canvas */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                {/* Watermark Logo Backing */}
                <div className="absolute right-6 -bottom-10 opacity-5 pointer-events-none">
                  <Layers className="w-96 h-96 text-cyan-400" />
                </div>

                {/* Certificate Top Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-5 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-2xl">
                      <Layers className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
                        AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ (AAYDA) & BDYP
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-white">
                        ELEKTRON KÖRPÜ TRANZİT BURAXILIŞI & SHM VƏRƏQƏSİ
                      </h2>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-cyan-400 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/60 inline-block">
                      {activeCertificate.complianceStatus}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      № {activeCertificate.certificateNumber}
                    </span>
                  </div>
                </div>

                {/* Certificate Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-cyan-400 block border-b border-slate-700/60 pb-1">
                      Körpü və Yol İnfrastrukturu:
                    </span>
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Körpü / Viyaduk:</span>
                        <span className="text-slate-200 font-bold">
                          {activeCertificate.bridgeNameAz}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Təyin Edilmiş Zolaq:</span>
                        <span className="text-indigo-300 font-semibold">
                          {activeCertificate.trafficLaneAssigned}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Maksimum Sürət Həddi:</span>
                        <span className="text-emerald-400 font-bold">
                          {activeCertificate.permittedSpeedKmH} km/s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Struktur İndeksi:</span>
                        <span className="text-cyan-400 font-bold">
                          %{activeCertificate.shmSafetyIndex}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-cyan-400 block border-b border-slate-700/60 pb-1">
                      Nəqliyyat Vasitəsi & Çəki Parametrləri:
                    </span>
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                        <span className="text-cyan-300 font-bold">
                          {activeCertificate.vehiclePlate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kateqoriya:</span>
                        <span className="text-slate-200">{activeCertificate.vehicleClass}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ümumi Kütlə:</span>
                        <span className="text-slate-200 font-semibold">
                          {activeCertificate.grossWeightTonnes} ton
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Maksimal Ox Yükü:</span>
                        <span className="text-slate-200 font-semibold">
                          {activeCertificate.maxAxleLoadTonnes} ton
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">BDYP Eskort Müşayiəti:</span>
                        <span
                          className={`font-bold ${
                            activeCertificate.escortRequired ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {activeCertificate.escortRequired ? 'MƏCBURİDİR' : 'TƏLƏB EDİLMİR'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SİMA Digital Signature Footer */}
                <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-cyan-400 block font-bold">
                      SİMA İMZA UID: {activeCertificate.simaSignatureUid}
                    </span>
                    <span>
                      Verilmə: {activeCertificate.issueDate} | Bitmə: {activeCertificate.expiryDate}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Dispetçer Xidməti: {activeCertificate.inspectorCallsign}
                    </span>
                  </div>

                  <div className="shrink-0 bg-white p-2 rounded-xl">
                    <div className="w-16 h-16 bg-slate-950 flex items-center justify-center text-[9px] text-cyan-400 text-center font-bold p-1">
                      QR VERIFY
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={registrySearchQuery}
                  onChange={(e) => setRegistrySearchQuery(e.target.value)}
                  placeholder="Sertifikat nömrəsi, nəqliyyat qeydiyyat nişanı və ya SİMA UID üzrə axtar..."
                  className="w-full bg-slate-800/80 border border-slate-700 pl-11 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Certificates Table */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700 font-mono uppercase">
                      <tr>
                        <th className="p-3.5">Sertifikat №</th>
                        <th className="p-3.5">Körpü / Viyaduk</th>
                        <th className="p-3.5">Dövlət Qeydiyyatı</th>
                        <th className="p-3.5">Ümumi / Ox Yükü</th>
                        <th className="p-3.5">Tarix</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60 font-mono">
                      {filteredCertificates.map((cert) => (
                        <tr key={cert.certificateNumber} className="hover:bg-slate-800/50">
                          <td className="p-3.5 font-bold text-cyan-400">
                            {cert.certificateNumber}
                          </td>
                          <td className="p-3.5 text-slate-200">{cert.bridgeNameAz}</td>
                          <td className="p-3.5 text-white font-bold">{cert.vehiclePlate}</td>
                          <td className="p-3.5 text-slate-300">
                            {cert.grossWeightTonnes}t / {cert.maxAxleLoadTonnes}t
                          </td>
                          <td className="p-3.5 text-slate-400">{cert.issueDate}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                cert.complianceStatus === 'VERIFIED_ACTIVE'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-red-950 text-red-300 border border-red-800'
                              }`}
                            >
                              {cert.complianceStatus}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setActiveCertificate(cert);
                                setActiveTab('certificate');
                              }}
                              className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 rounded-lg text-[11px] font-semibold transition"
                            >
                              Göstər
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
