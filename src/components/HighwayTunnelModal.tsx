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
  Flame,
  Wind,
  Thermometer,
  Gauge,
  Activity,
  Layers,
  Sparkles,
  Eye,
  Check,
  Radio,
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
  ChevronRight,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  formatCurrency,
  TunnelId,
  ScadaMode,
  TunnelVehicleClass,
  AdrCargoCode,
  TunnelTelemetryState,
  TunnelClearanceCertificate,
  STRATEGIC_TUNNELS,
  SCADA_MODES,
  TUNNEL_VEHICLE_TARIFFS,
  ADR_CARGO_CATEGORIES,
  TUNNEL_SAFETY_CHECKLIST,
  TUNNEL_EXAM_QUESTIONS,
  evaluateAirQuality,
  checkAdrTunnelCompliance,
  calculateTunnelTransitFee,
  evaluateTunnelChecklist,
  evaluateTunnelExam,
  generateTunnelCertificate,
} from '../utils/highwayTunnelCompliance';
import {
  INITIAL_TUNNEL_LIVE_STATES,
  MOCK_TUNNEL_CERTIFICATES,
  TunnelLiveState,
} from '../data/mockHighwayTunnelData';

interface HighwayTunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type TunnelTabId =
  | 'radar'
  | 'scada-control'
  | 'calculator'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const HighwayTunnelModal: React.FC<HighwayTunnelModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  // Navigation & Preferences
  const [activeTab, setActiveTab] = useState<TunnelTabId>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Selected Tunnel
  const [selectedTunnelId, setSelectedTunnelId] = useState<TunnelId>('TUNNEL_MUROVDAG');
  const [tunnelSearchQuery, setTunnelSearchQuery] = useState('');

  // Live SCADA Sensor State per Tunnel
  const [tunnelLiveStates, setTunnelLiveStates] = useState<Record<TunnelId, TunnelLiveState>>(
    INITIAL_TUNNEL_LIVE_STATES
  );
  const [scadaMode, setScadaMode] = useState<ScadaMode>('MODE_NORMAL');

  // Calculator Parameters
  const [calcPlate, setCalcPlate] = useState(targetCar?.plateNumber || '10-AA-100');
  const [calcVehicleClass, setCalcVehicleClass] = useState<TunnelVehicleClass>('CLASS_1_PASSENGER');
  const [calcCargoCode, setCalcCargoCode] = useState<AdrCargoCode>('NONE');
  const [isPeakHour, setIsPeakHour] = useState(false);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<string[]>(
    TUNNEL_SAFETY_CHECKLIST.map((item) => item.id)
  );

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Certificates State
  const [certificates, setCertificates] = useState<TunnelClearanceCertificate[]>(
    MOCK_TUNNEL_CERTIFICATES
  );
  const [currentCertificate, setCurrentCertificate] = useState<TunnelClearanceCertificate | null>(
    MOCK_TUNNEL_CERTIFICATES[0]
  );
  const [registrySearch, setRegistrySearch] = useState('');
  const [copyNotification, setCopyNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTunnel = STRATEGIC_TUNNELS[selectedTunnelId];
  const currentLiveState = tunnelLiveStates[selectedTunnelId];
  const airQualityAssessment = evaluateAirQuality(currentLiveState.telemetry);
  const transitFeeCalculation = calculateTunnelTransitFee(
    selectedTunnelId,
    calcVehicleClass,
    calcCargoCode,
    isPeakHour,
    currency
  );
  const checklistResult = evaluateTunnelChecklist(checkedItems);
  const examResult = evaluateTunnelExam(examAnswers);

  // Filtered Tunnels for Radar Tab
  const filteredTunnels = Object.values(STRATEGIC_TUNNELS).filter((t) => {
    const q = tunnelSearchQuery.toLowerCase();
    return (
      t.nameAz.toLowerCase().includes(q) ||
      t.nameEn.toLowerCase().includes(q) ||
      t.locationAz.toLowerCase().includes(q) ||
      t.highwayCode.toLowerCase().includes(q)
    );
  });

  // Filtered Certificates for Registry Tab
  const filteredCertificates = certificates.filter((c) => {
    const q = registrySearch.toLowerCase();
    return (
      c.certificateNumber.toLowerCase().includes(q) ||
      c.vehiclePlate.toLowerCase().includes(q) ||
      c.tunnelNameAz.toLowerCase().includes(q)
    );
  });

  // Telemetry Sliders Handler
  const handleTelemetryChange = (key: keyof TunnelTelemetryState, val: number | boolean) => {
    setTunnelLiveStates((prev) => ({
      ...prev,
      [selectedTunnelId]: {
        ...prev[selectedTunnelId],
        telemetry: {
          ...prev[selectedTunnelId].telemetry,
          [key]: val,
        },
      },
    }));
  };

  // Change SCADA Mode
  const handleScadaModeChange = (mode: ScadaMode) => {
    setScadaMode(mode);
    setTunnelLiveStates((prev) => {
      const modeInfo = SCADA_MODES[mode];
      const isFire = mode === 'MODE_FIRE_EMERGENCY';
      return {
        ...prev,
        [selectedTunnelId]: {
          ...prev[selectedTunnelId],
          jetFanOperatingPowerPercent: modeInfo.jetFanOperatingPowerPercent,
          portalBarrierOpen: !isFire,
          activeLcsLane1: isFire ? 'RED_X' : mode === 'MODE_MAINTENANCE' ? 'YELLOW_DIAGONAL' : 'GREEN_ARROW',
          activeLcsLane2: isFire ? 'RED_X' : 'GREEN_ARROW',
          vmsMessageAz: isFire
            ? 'TƏCİLİ YANĞIN! TUNELƏ GİRİŞ QADAĞANDIR! FHN 112 ÇAĞIRILIB'
            : mode === 'MODE_CONGESTION'
            ? 'SIXLİQ REJİMİ - SÜRƏT HƏDDİ 50 KM/S - MÜHƏRRİKİ SÖNDÜRÜN'
            : mode === 'MODE_MAINTENANCE'
            ? 'PLANLI TƏMİR - SAĞ ZOLAĞA KEÇİN - SÜRƏT 40 KM/S'
            : 'SÜRƏT HƏDDİ 90 KM/S - TƏHLÜKƏSİZ MƏSAFƏ SAXLAYIN (50M)',
          telemetry: {
            ...prev[selectedTunnelId].telemetry,
            linearHeatSensorTempC: isFire ? 78 : 20,
            carbonMonoxidePpm: isFire ? 65 : mode === 'MODE_CONGESTION' ? 38 : 12,
            visibilityExtinctionK: isFire ? 0.015 : 0.002,
          },
        },
      };
    });
  };

  // Checklist Item Toggle
  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all or reset checklist
  const handleSelectAllChecklist = () => {
    setCheckedItems(TUNNEL_SAFETY_CHECKLIST.map((item) => item.id));
  };
  const handleResetChecklist = () => {
    setCheckedItems([]);
  };

  // Answer Exam Question
  const handleAnswerExam = (questionId: string, optionIdx: number) => {
    setExamAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  // Generate New Certificate
  const handleGenerateCertificate = () => {
    const newCert = generateTunnelCertificate(
      selectedTunnelId,
      calcPlate,
      calcVehicleClass,
      calcCargoCode,
      currency,
      isPeakHour
    );
    setCertificates((prev) => [newCert, ...prev]);
    setCurrentCertificate(newCert);
    setActiveTab('certificate');
  };

  // Copy to Clipboard
  const handleCopyText = (text: string, label: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopyNotification(`${label} buferə kopyalandı!`);
    setTimeout(() => setCopyNotification(null), 3000);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tunnel-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  AAYDA • FHN • BDYP RƏSMİ PORTALI
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  TUNNEL-SAFE-AZ-2026
                </span>
              </div>
              <h2 id="tunnel-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Avtomobil Tunelləri SCADA Təhlükəsizlik və Ventilyasiya Sistemi
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    currency === c
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 overflow-x-auto scrollbar-none gap-1">
          {[
            { id: 'radar', label: 'Tunellər Radarı', icon: Activity },
            { id: 'scada-control', label: 'SCADA Telemetriya & Ventilyasiya', icon: Sliders },
            { id: 'calculator', label: 'Tranzit & ADR Tarifləri', icon: Gauge },
            { id: 'checklist', label: '10-Nöqtəli Təhlükəsizlik Sınağı', icon: ShieldCheck },
            { id: 'exam', label: 'Nəzəri İmtahan Simulyatoru', icon: Award },
            { id: 'certificate', label: 'E-İcazə Sertifikatı', icon: FileText },
            { id: 'registry', label: 'Vahid Dövlət Reyestri', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TunnelTabId)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Toast Copy Notification */}
        {copyNotification && (
          <div className="absolute top-20 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            {copyNotification}
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: RADAR & TUNNEL SELECTOR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              {/* Top Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tunel adı, magistral və ya rayon axtar..."
                    value={tunnelSearchQuery}
                    onChange={(e) => setTunnelSearchQuery(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Ümumi 6 strateji dağ və magistral tuneli</span>
                </div>
              </div>

              {/* Tunnel Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTunnels.map((tunnel) => {
                  const isSelected = tunnel.id === selectedTunnelId;
                  const liveState = tunnelLiveStates[tunnel.id];
                  const airEval = evaluateAirQuality(liveState.telemetry);

                  return (
                    <div
                      key={tunnel.id}
                      onClick={() => setSelectedTunnelId(tunnel.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-amber-300">
                            {tunnel.highwayCode}
                          </span>
                          <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                            {tunnel.nameAz}
                          </h3>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            airEval.requiresEmergencyStop
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : airEval.requiresVentilationBoost
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {airEval.requiresEmergencyStop
                            ? 'ALARM'
                            : airEval.requiresVentilationBoost
                            ? 'XƏBƏRDARLIQ'
                            : 'NORMAL'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                        {tunnel.locationAz}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 mb-3">
                        <div>
                          <span className="text-slate-400">Uzunluq:</span>
                          <div className="font-bold text-slate-200">
                            {(tunnel.lengthMeters / 1000).toFixed(1)} km ({tunnel.lengthMeters} m)
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">Boru / Zolaq:</span>
                          <div className="font-bold text-slate-200">
                            {tunnel.tubesCount} boru ({tunnel.lanesPerTube} zolaq)
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">Reaktiv Fanlar:</span>
                          <div className="font-bold text-amber-400">
                            {tunnel.jetFanCount} ədəd Jet Fan
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">ADR Sinfi:</span>
                          <div className="font-bold text-emerald-400">
                            Tunel Kateqoriyası {tunnel.adrTunnelCategory}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/40">
                        <span className="text-slate-400">İçəridəki nəqliyyat:</span>
                        <span className="font-bold text-white">
                          {liveState.telemetry.activeVehiclesInTube} avtomobil
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Tunnel 3D BIM Cross-Section View */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700">
                  <div>
                    <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                      SCADA 3D RƏQƏMSAL KƏSİK VƏ ƏMƏLİYYAT STATİSTİKASI
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {currentTunnel.nameAz} ({currentTunnel.highwayCode})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      Hündürlük: {currentTunnel.altitudeMeters} m
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      SCADA Server: {currentTunnel.scadaServerIp}
                    </span>
                  </div>
                </div>

                {/* Tunnel Visual Section Simulation */}
                <div className="relative rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 overflow-hidden">
                  {/* Ceiling Jet Fans Representation */}
                  <div className="flex justify-around items-center mb-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                            currentLiveState.jetFanOperatingPowerPercent > 50
                              ? 'border-amber-400 bg-amber-500/20 text-amber-400 animate-spin'
                              : 'border-slate-600 bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Wind className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] text-slate-400">Fan #{i + 1}</span>
                      </div>
                    ))}
                  </div>

                  {/* Lane Signals Overhead Gantries */}
                  <div className="grid grid-cols-2 gap-4 my-4 max-w-md mx-auto">
                    <div className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-slate-400 mb-1 font-semibold">ZOLAQ 1 (SOL)</div>
                      <div className="flex justify-center">
                        {currentLiveState.activeLcsLane1 === 'GREEN_ARROW' && (
                          <div className="text-emerald-400 font-black text-lg flex items-center gap-1 animate-pulse">
                            ↓ AÇIQ (90 KM/S)
                          </div>
                        )}
                        {currentLiveState.activeLcsLane1 === 'YELLOW_DIAGONAL' && (
                          <div className="text-amber-400 font-black text-lg flex items-center gap-1">
                            ↘ SAĞA KEÇ
                          </div>
                        )}
                        {currentLiveState.activeLcsLane1 === 'RED_X' && (
                          <div className="text-red-500 font-black text-lg flex items-center gap-1 animate-ping">
                            ✕ QAPALIDIR
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-slate-400 mb-1 font-semibold">ZOLAQ 2 (SAĞ)</div>
                      <div className="flex justify-center">
                        {currentLiveState.activeLcsLane2 === 'GREEN_ARROW' && (
                          <div className="text-emerald-400 font-black text-lg flex items-center gap-1 animate-pulse">
                            ↓ AÇIQ (90 KM/S)
                          </div>
                        )}
                        {currentLiveState.activeLcsLane2 === 'RED_X' && (
                          <div className="text-red-500 font-black text-lg flex items-center gap-1">
                            ✕ QAPALIDIR
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Road Asphalt Simulation */}
                  <div className="relative border-t-2 border-b-2 border-slate-700 bg-slate-900/80 py-4 px-6 rounded-md">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-amber-400" />
                        <span>Tranzit axını: {currentLiveState.telemetry.activeVehiclesInTube} vasitə</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                        VMS: {currentLiveState.vmsMessageAz}
                      </div>
                    </div>
                  </div>

                  {/* Safety Features Footer */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-[11px]">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-400">Təxliyə Qapıları:</span>
                      <div className="font-bold text-emerald-400">
                        {currentTunnel.crossPassageCount} qapı (+50 Pa hermetik)
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-400">SOS Telefon Nişləri:</span>
                      <div className="font-bold text-slate-200">
                        {currentTunnel.sosNichesCount} ədəd (150m interval)
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-400">Köpüklü Deluge Zonalı:</span>
                      <div className="font-bold text-slate-200">
                        {currentTunnel.delugeZoneCount} sprinkler zonası
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-400">Qabarit Hündürlüyü:</span>
                      <div className="font-bold text-amber-300">
                        Maks. {currentTunnel.maxLegalClearanceHeightMeters} metr
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Məsul İdarə: {currentTunnel.aaydaRegionalDivision}</span>
                  <button
                    onClick={() => setActiveTab('scada-control')}
                    className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <span>SCADA İdarəetmə Panelinə Keç</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA TELEMETRY & VENTILATION CONTROLLER */}
          {activeTab === 'scada-control' && (
            <div className="space-y-6">
              {/* Operational Mode Selector */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 space-y-3">
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  SCADA ƏMƏLİYYAT REJİMİ SEÇİMİ
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(Object.keys(SCADA_MODES) as ScadaMode[]).map((modeKey) => {
                    const mInfo = SCADA_MODES[modeKey];
                    const isCurrent = scadaMode === modeKey;
                    return (
                      <button
                        key={modeKey}
                        onClick={() => handleScadaModeChange(modeKey)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isCurrent
                            ? 'bg-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                            : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: mInfo.colorHex }}
                          />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {mInfo.speedLimitKmH > 0 ? `${mInfo.speedLimitKmH} km/s` : 'BLOK'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white leading-tight">
                          {mInfo.nameAz}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          Fan: {mInfo.jetFanOperatingPowerPercent}% • {mInfo.portalBarrierStatusAz}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Environmental Telemetry Sliders & Diagnostics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sliders Card */}
                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      SCADA Ətraf Mühit & Sensor Telemetriyası
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Tunel: {currentTunnel.nameAz.split(' ')[0]}
                    </span>
                  </div>

                  {/* CO ppm Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        Dəm qazı konsentrasiyası (CO ppm):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          currentLiveState.telemetry.carbonMonoxidePpm >= 50
                            ? 'text-red-400'
                            : currentLiveState.telemetry.carbonMonoxidePpm >= 30
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {currentLiveState.telemetry.carbonMonoxidePpm.toFixed(1)} ppm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      step={0.5}
                      value={currentLiveState.telemetry.carbonMonoxidePpm}
                      onChange={(e) =>
                        handleTelemetryChange('carbonMonoxidePpm', parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0 ppm (Təmiz)</span>
                      <span>30 ppm (Xəbərdarlıq)</span>
                      <span>50 ppm (Alarm)</span>
                    </div>
                  </div>

                  {/* NO2 ppm Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        Azot dioksid (NO2 ppm):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          currentLiveState.telemetry.nitrogenDioxidePpm >= 1.0
                            ? 'text-red-400'
                            : currentLiveState.telemetry.nitrogenDioxidePpm >= 0.4
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {currentLiveState.telemetry.nitrogenDioxidePpm.toFixed(2)} ppm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2.0}
                      step={0.05}
                      value={currentLiveState.telemetry.nitrogenDioxidePpm}
                      onChange={(e) =>
                        handleTelemetryChange('nitrogenDioxidePpm', parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.0 ppm</span>
                      <span>0.4 ppm (Hədd)</span>
                      <span>1.0 ppm (Kritik)</span>
                    </div>
                  </div>

                  {/* Extinction Coefficient k (Visibility) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        Tüstü Optik Sönmə Əmsalı (k m⁻¹):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          currentLiveState.telemetry.visibilityExtinctionK >= 0.009
                            ? 'text-red-400'
                            : currentLiveState.telemetry.visibilityExtinctionK >= 0.005
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {currentLiveState.telemetry.visibilityExtinctionK.toFixed(4)} m⁻¹
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.001}
                      max={0.02}
                      step={0.0005}
                      value={currentLiveState.telemetry.visibilityExtinctionK}
                      onChange={(e) =>
                        handleTelemetryChange('visibilityExtinctionK', parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.001 (Şəffaf)</span>
                      <span>0.005 (Duman)</span>
                      <span>0.009 (Qatı tüstü)</span>
                    </div>
                  </div>

                  {/* Linear Heat Cable Temp */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        Xətti İstilik Lifli-Optik Kabel (°C):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          currentLiveState.telemetry.linearHeatSensorTempC >= 68
                            ? 'text-red-400'
                            : currentLiveState.telemetry.linearHeatSensorTempC >= 45
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {currentLiveState.telemetry.linearHeatSensorTempC.toFixed(1)} °C
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={1}
                      value={currentLiveState.telemetry.linearHeatSensorTempC}
                      onChange={(e) =>
                        handleTelemetryChange('linearHeatSensorTempC', parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>15 °C (Nominal)</span>
                      <span>45 °C (İstilik artımı)</span>
                      <span>68 °C (Yanğın sprinkler)</span>
                    </div>
                  </div>

                  {/* Overheight Vehicle Detection Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700/70">
                    <div>
                      <div className="text-xs font-bold text-white">Qabarit Hündürlüyü Sensoru (&gt; 4.50m)</div>
                      <div className="text-[11px] text-slate-400">Giriş portalında IR şüa kəsilməsi alarmı</div>
                    </div>
                    <button
                      onClick={() =>
                        handleTelemetryChange('overheightDetected', !currentLiveState.telemetry.overheightDetected)
                      }
                      className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                        currentLiveState.telemetry.overheightDetected
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {currentLiveState.telemetry.overheightDetected ? 'AŞKARLANDI (ALARM)' : 'NORMAL'}
                    </button>
                  </div>
                </div>

                {/* Diagnostics & Real-time Action Card */}
                <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    SCADA Avtomatika Təhlili & Həyəcan Statusu
                  </h3>

                  {/* Summary Box */}
                  <div
                    className={`p-4 rounded-xl border ${
                      airQualityAssessment.requiresEmergencyStop
                        ? 'bg-red-500/10 border-red-500 text-red-200'
                        : airQualityAssessment.requiresVentilationBoost
                        ? 'bg-amber-500/10 border-amber-500 text-amber-200'
                        : 'bg-emerald-500/10 border-emerald-500 text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      {airQualityAssessment.requiresEmergencyStop ? (
                        <>
                          <ShieldAlert className="w-5 h-5 text-red-400" />
                          <span>KRİTİK HƏYƏCAN: TUNEL BLOKLANMASI TƏLƏB OLUNUR</span>
                        </>
                      ) : airQualityAssessment.requiresVentilationBoost ? (
                        <>
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                          <span>XƏBƏRDARLIQ: YÜKSƏK VENTİLYASİYA TƏLƏBİ</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>BÜTÜN PARAMETRLƏR TƏHLÜKƏSİZLİK NORMALARINDADIR</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed">{airQualityAssessment.diagnosticSummaryAz}</p>
                  </div>

                  {/* Live Sensor Metrics Table */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400">Tövsiyə olunan Jet Fan Gücü:</span>
                      <div className="font-bold text-amber-400 text-base mt-0.5">
                        {airQualityAssessment.recommendedJetFanPowerPercent}% Güc
                      </div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400">Kritik Tüstü Sürəti (v_crit):</span>
                      <div className="font-bold text-emerald-400 text-base mt-0.5">
                        {currentLiveState.telemetry.airflowVelocityMs} m/s (Təhlükəsiz &gt; 2.5)
                      </div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400">Təxliyə İzafi Təzyiqi:</span>
                      <div className="font-bold text-slate-200 text-base mt-0.5">
                        +{currentLiveState.telemetry.crossPassagePressureDifferentialPa} Pa (Norma: 50 Pa)
                      </div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                      <span className="text-slate-400">Giriş Şlaqbaum Statusu:</span>
                      <div className="font-bold text-white text-base mt-0.5">
                        {currentLiveState.portalBarrierOpen ? 'AÇIQDIR' : 'BAĞLIDIR (BLOK)'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleScadaModeChange('MODE_NORMAL')}
                      className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      SCADA Parametrlərini Standart Rejimə Sıfırla
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSIT TARIFF & ADR ESCORT CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  Tranzit İcazəsi & Təhlükəli Yük (ADR) Parametrləri
                </h3>

                {/* Target Tunnel */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tranzit Tuneli:
                  </label>
                  <select
                    value={selectedTunnelId}
                    onChange={(e) => setSelectedTunnelId(e.target.value as TunnelId)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {Object.values(STRATEGIC_TUNNELS).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameAz} ({t.highwayCode}) - ADR Sinfi: {t.adrTunnelCategory}
                      </option>
                    ))}
                  </select>
                </div>

                {/* License Plate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nəqliyyat Vasitəsinin Dövlət Qeydiyyat Nişanı:
                  </label>
                  <input
                    type="text"
                    value={calcPlate}
                    onChange={(e) => setCalcPlate(e.target.value.toUpperCase())}
                    placeholder="e.g. 10-AA-100"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Vehicle Class */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nəqliyyat Kateqoriyası:
                  </label>
                  <div className="space-y-2">
                    {(Object.keys(TUNNEL_VEHICLE_TARIFFS) as TunnelVehicleClass[]).map((vKey) => {
                      const vTariff = TUNNEL_VEHICLE_TARIFFS[vKey];
                      const isSelected = calcVehicleClass === vKey;
                      return (
                        <div
                          key={vKey}
                          onClick={() => setCalcVehicleClass(vKey)}
                          className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-400 text-white'
                              : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex justify-between items-center font-bold">
                            <span>{vTariff.nameAz}</span>
                            <span className="text-amber-400 font-mono">
                              {formatCurrency(vTariff.baseFeeAzn, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ADR Cargo Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Təhlükəli Yük (ADR) Sinif Məhdudiyyəti:
                  </label>
                  <select
                    value={calcCargoCode}
                    onChange={(e) => setCalcCargoCode(e.target.value as AdrCargoCode)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {(Object.keys(ADR_CARGO_CATEGORIES) as AdrCargoCode[]).map((codeKey) => {
                      const info = ADR_CARGO_CATEGORIES[codeKey];
                      return (
                        <option key={codeKey} value={codeKey}>
                          {info.labelAz}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Peak Hour Checkbox */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700">
                  <div>
                    <span className="text-xs font-bold text-white">Pik Saat Əlavəsi (+25%)</span>
                    <p className="text-[11px] text-slate-400">Səhər 08:00-10:00 / Axşam 18:00-20:00 saatları</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPeakHour}
                    onChange={(e) => setIsPeakHour(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>

              {/* Fee Breakdown & Statutory Clearance */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Rəsmi Dövlət Rüsumu & ADR İcazə Qərarı
                  </h3>

                  {/* ADR Compliance Box */}
                  <div
                    className={`p-3.5 rounded-xl border ${
                      transitFeeCalculation.isAdrPermittedInTunnel
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200'
                        : 'bg-red-500/10 border-red-500/50 text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      {transitFeeCalculation.isAdrPermittedInTunnel ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>TRANZİTƏ İCAZƏ VERİLİR</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          <span>BU TUNELDƏN TRANZİT QADAĞANDIR!</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {transitFeeCalculation.adrRestrictionReasonAz}
                    </p>
                  </div>

                  {/* Fee Itemization */}
                  <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/60 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Baza Tranzit Rüsumu:</span>
                      <span className="font-mono text-slate-200">
                        {formatCurrency(transitFeeCalculation.baseFeeAzn, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ADR Eskort & FHN Təhlükəsizlik Haqqı:</span>
                      <span className="font-mono text-slate-200">
                        {formatCurrency(transitFeeCalculation.adrEscortFeeAzn, currency)}
                      </span>
                    </div>
                    {isPeakHour && (
                      <div className="flex justify-between text-amber-400">
                        <span>Pik Saat Əlavəsi (+25%):</span>
                        <span className="font-mono">
                          +{formatCurrency(transitFeeCalculation.peakHourSurchargeAzn, currency)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-bold text-white">
                      <span>Cəmi Ödəniş:</span>
                      <span className="font-mono text-amber-400 text-lg">
                        {formatCurrency(transitFeeCalculation.totalFeeAzn, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <button
                    onClick={handleGenerateCertificate}
                    disabled={!transitFeeCalculation.isAdrPermittedInTunnel}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      transitFeeCalculation.isAdrPermittedInTunnel
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Rəsmi TUNNEL-SAFE E-İcazə Sertifikatı Yarat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT TECHNICAL & FIRE SAFETY CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    DİREKTİV 2004/54/EC & NFPA 502 STANDARTLARI
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    10-Nöqtəli Tunel Təhlükəsizlik və Yanğın Sınaq Protokolu
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Məcburi yoxlama bəndləri üzrə minimum 80% uyğunluq tələb olunur.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Ümumi Qiymət:</div>
                    <div
                      className={`text-xl font-black ${
                        checklistResult.passed ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {checklistResult.percentage}% ({checklistResult.gradeAz})
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllChecklist}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      Hamısını Seç
                    </button>
                    <button
                      onClick={handleResetChecklist}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 transition-colors"
                    >
                      Sıfırla
                    </button>
                  </div>
                </div>
              </div>

              {/* Checklist Items List */}
              <div className="space-y-3">
                {TUNNEL_SAFETY_CHECKLIST.map((item, idx) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-slate-800/90 border-slate-700 hover:border-amber-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isChecked ? 'text-white' : 'text-slate-400'
                            }`}
                          >
                            #{idx + 1}. {item.titleAz}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                            {item.statutoryMandate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {item.descriptionAz}
                        </p>
                      </div>

                      <span className="text-xs font-mono font-bold text-slate-500">
                        {item.weightPoints} bal
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              {/* Exam Header */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    BDYP & FHN SÜRÜCÜ İMTAHAN SİMULYATORU
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    Avtomobil Tunellərində Hərəkət və Təxliyə İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    10 sualdan ən azı 8-nə (80%) düzgün cavab verilməlidir.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {examSubmitted && (
                    <div
                      className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${
                        examResult.passed
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-red-500/10 border-red-500 text-red-400'
                      }`}
                    >
                      Nəticə: {examResult.score}/10 ({examResult.percentage}%)
                    </div>
                  )}
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    Nəticəni Yoxla
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {TUNNEL_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedOpt = examAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-xl border border-slate-700 bg-slate-800/60 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          Sual {idx + 1}: {q.questionAz}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {q.legalCitation}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {q.optionsAz.map((optText, optIdx) => {
                          const isOptSelected = selectedOpt === optIdx;
                          let optStyle =
                            'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600';

                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (isOptSelected && !isCorrect) {
                              optStyle = 'bg-red-500/10 border-red-500 text-red-300';
                            }
                          } else if (isOptSelected) {
                            optStyle = 'bg-amber-500/10 border-amber-400 text-white font-medium';
                          }

                          return (
                            <div
                              key={optIdx}
                              onClick={() => !examSubmitted && handleAnswerExam(q.id, optIdx)}
                              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <span>{optText}</span>
                              {examSubmitted && optIdx === q.correctOptionIndex && (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                          <span className="text-amber-400 font-semibold">Qanunvericilik İzahı: </span>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL ELECTRONIC CERTIFICATE VOUCHER */}
          {activeTab === 'certificate' && currentCertificate && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Certificate Paper Layout */}
              <div className="p-6 sm:p-8 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 shadow-2xl relative overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-64 h-64 text-amber-400" />
                </div>

                {/* Top Heraldry Header */}
                <div className="text-center pb-5 border-b-2 border-amber-500/30">
                  <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    AZƏRBAYCAN RESPUBLİKASI NAZİRLƏR KABİNETİ
                  </div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mt-0.5">
                    AAYDA • FHN • DÖVLƏT YOL POLİSİ İDARƏSİ
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1.5 tracking-tight uppercase">
                    AVTOMOBİL TUNELLƏRİ TRANZİT VƏ TƏHLÜKƏSİZLİK ELEKTRON İCAZƏSİ
                  </h3>
                  <div className="inline-block mt-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs">
                    № {currentCertificate.certificateNumber}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="py-5 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Tranzit Tuneli:</span>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {currentCertificate.tunnelNameAz}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                    <div className="font-mono font-black text-amber-400 text-sm mt-0.5">
                      {currentCertificate.vehiclePlate}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Nəqliyyat Kateqoriyası:</span>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {currentCertificate.vehicleClassNameAz}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">ADR Təhlükəli Yük Sinfi:</span>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {currentCertificate.adrCargoLabelAz}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">İcazə Verilən Maks. Sürət:</span>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">
                      {currentCertificate.maxSpeedKmH} km/s
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">AAYDA Eskort Çağırış Kodu:</span>
                    <div className="font-mono font-bold text-amber-300 mt-0.5">
                      {currentCertificate.assignedEscortCallsign}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Verilmə Tarixi:</span>
                    <div className="font-mono text-slate-300 mt-0.5">
                      {new Date(currentCertificate.issueDateIso).toLocaleString('az-AZ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Etibarlılıq Müddəti:</span>
                    <div className="font-mono text-slate-300 mt-0.5">
                      {new Date(currentCertificate.expiryDateIso).toLocaleString('az-AZ')}
                    </div>
                  </div>
                </div>

                {/* Security Checksum & QR Simulation */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono text-[10px] text-slate-500">
                      {currentCertificate.securityChecksumSha256}
                    </div>
                    <div className="font-mono text-[10px] text-emerald-400 mt-0.5">
                      SİMA İMZA: {currentCertificate.simaDigitalSignatureUid}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      STATUS: AKTİV TRANZİT
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() =>
                    handleCopyText(currentCertificate.certificateNumber, 'Sertifikat Nömrəsi')
                  }
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <Copy className="w-4 h-4 text-amber-400" />
                  Kodu Kopyala
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  Çap Et (PDF)
                </button>
                <button
                  onClick={() => setActiveTab('registry')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
                >
                  <Search className="w-4 h-4" />
                  Reyestrdə Yoxla
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: UNIFIED PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Qeydiyyat nişanı və ya sertifikat nömrəsi ilə axtar..."
                  value={registrySearch}
                  onChange={(e) => setRegistrySearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Registry Table */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Sertifikat №</th>
                        <th className="p-3">Dövlət Nişanı</th>
                        <th className="p-3">Tunel</th>
                        <th className="p-3">Kateqoriya</th>
                        <th className="p-3">Ödəniş</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredCertificates.map((cert) => (
                        <tr key={cert.certificateNumber} className="hover:bg-slate-800/80">
                          <td className="p-3 font-mono font-bold text-amber-400">
                            {cert.certificateNumber}
                          </td>
                          <td className="p-3 font-mono font-bold text-white">
                            {cert.vehiclePlate}
                          </td>
                          <td className="p-3 text-slate-300">
                            {cert.tunnelNameAz.split(' ')[0]}
                          </td>
                          <td className="p-3 text-slate-400">
                            {cert.vehicleClass.replace('CLASS_', 'Kat ')}
                          </td>
                          <td className="p-3 font-mono text-emerald-400">
                            {formatCurrency(cert.paidFeeAzn, currency)}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                cert.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {cert.status === 'ACTIVE' ? 'AKTİV' : 'MÜDDƏTİ BİTİB'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setCurrentCertificate(cert);
                                setActiveTab('certificate');
                              }}
                              className="text-amber-400 hover:text-amber-300 font-semibold"
                            >
                              Baxış
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
