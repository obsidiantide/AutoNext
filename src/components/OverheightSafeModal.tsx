import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  Radio,
  Sliders,
  CheckCircle2,
  FileCheck,
  Search,
  Printer,
  Copy,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  MapPin,
  Maximize2,
  Minimize2,
  Gauge,
  Activity,
  AlertTriangle,
  Volume2,
  VolumeX,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Currency } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  BridgeClearanceType,
  LaserSensorTechnology,
  ClearanceStatus,
  DivertAction,
  RoadSurfaceFriction,
  OverheightBridgeAsset,
  OverheightVehiclePreset,
  OverheightSimulationInput,
  OverheightSimulationResult,
  OverheightCertificate,
  calculateOverheightPhysics,
  generateOverheightCertificate,
} from '../utils/overheightSafeCompliance';
import {
  MOCK_OVERHEIGHT_BRIDGES,
  MOCK_OVERHEIGHT_VEHICLE_PRESETS,
  MOCK_OVERHEIGHT_CHECKLIST,
  MOCK_OVERHEIGHT_EXAM,
  MOCK_OVERHEIGHT_REGISTRY,
} from '../data/mockOverheightSafeData';

interface OverheightSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
}

type TabType =
  | 'corridors'
  | 'scada'
  | 'envelope'
  | 'presets'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const OverheightSafeModal: React.FC<OverheightSafeModalProps> = ({
  isOpen,
  onClose,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('corridors');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(MOCK_OVERHEIGHT_BRIDGES[0].id);

  // Simulation input state
  const [vehicleHeightM, setVehicleHeightM] = useState<number>(4.00);
  const [approachSpeedKmh, setApproachSpeedKmh] = useState<number>(75);
  const [vehicleGrossMassKg, setVehicleGrossMassKg] = useState<number>(38000);
  const [bridgePostedClearanceM, setBridgePostedClearanceM] = useState<number>(4.50);
  const [sensorDistanceBeforeBridgeM, setSensorDistanceBeforeBridgeM] = useState<number>(350);
  const [roadSurfaceFriction, setRoadSurfaceFriction] = useState<RoadSurfaceFriction>('DRY');
  const [driverReactionTimeSec, setDriverReactionTimeSec] = useState<number>(1.2);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'CHK-01': true,
    'CHK-02': true,
    'CHK-03': true,
    'CHK-04': true,
    'CHK-07': true,
  });

  // Exam state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Active certificate
  const [activeCertificate, setActiveCertificate] = useState<OverheightCertificate | null>(null);
  const [activePlate, setActivePlate] = useState<string>('99-OH-101');
  const [selectedVehicleType, setSelectedVehicleType] = useState<OverheightVehiclePreset['vehicleType']>('curtain_sider_tir');

  // Registry search & filter state
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryStatusFilter, setRegistryStatusFilter] = useState<string>('ALL');
  const [certificates, setCertificates] = useState<OverheightCertificate[]>(MOCK_OVERHEIGHT_REGISTRY);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Currently selected bridge asset
  const selectedBridge = useMemo(() => {
    return MOCK_OVERHEIGHT_BRIDGES.find((b) => b.id === selectedCorridorId) || MOCK_OVERHEIGHT_BRIDGES[0];
  }, [selectedCorridorId]);

  // Simulation calculation
  const simInput: OverheightSimulationInput = useMemo(
    () => ({
      vehicleHeightM,
      approachSpeedKmh,
      vehicleGrossMassKg,
      bridgePostedClearanceM,
      sensorDistanceBeforeBridgeM,
      roadSurfaceFriction,
      driverReactionTimeSec,
    }),
    [
      vehicleHeightM,
      approachSpeedKmh,
      vehicleGrossMassKg,
      bridgePostedClearanceM,
      sensorDistanceBeforeBridgeM,
      roadSurfaceFriction,
      driverReactionTimeSec,
    ]
  );

  const simResult: OverheightSimulationResult = useMemo(() => {
    return calculateOverheightPhysics(simInput);
  }, [simInput]);

  // Handle Audio Warning Beep (Synthesized Web Audio)
  const playWarningChirp = () => {
    if (isAudioMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = simResult.clearanceStatus === 'CRITICAL_OVERHEIGHT_COLLISION_WARNING' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(simResult.clearanceStatus === 'CRITICAL_OVERHEIGHT_COLLISION_WARNING' ? 880 : 520, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  // Apply corridor to simulator
  const handleSelectCorridor = (bridge: OverheightBridgeAsset) => {
    setSelectedCorridorId(bridge.id);
    setBridgePostedClearanceM(bridge.postedClearanceM);
    setSensorDistanceBeforeBridgeM(bridge.sensorDistanceBeforeBridgeM);
  };

  // Apply vehicle preset to simulator
  const handleApplyPreset = (preset: OverheightVehiclePreset) => {
    setVehicleHeightM(preset.heightMeters);
    setApproachSpeedKmh(preset.defaultSpeedKmh);
    setVehicleGrossMassKg(preset.grossMassKg);
    setActivePlate(preset.licensePlate);
    setSelectedVehicleType(preset.vehicleType);
  };

  // Checklist toggles
  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAllChecklist = () => {
    const all: Record<string, boolean> = {};
    MOCK_OVERHEIGHT_CHECKLIST.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedItems(all);
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
  };

  const checklistScore = useMemo(() => {
    const total = MOCK_OVERHEIGHT_CHECKLIST.length;
    const completed = MOCK_OVERHEIGHT_CHECKLIST.filter((i) => checkedItems[i.id]).length;
    return Math.round((completed / total) * 100);
  }, [checkedItems]);

  // Exam handlers
  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    if (examSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const examScore = useMemo(() => {
    let score = 0;
    MOCK_OVERHEIGHT_EXAM.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });
    return score;
  }, [selectedAnswers]);

  const handleGenerateCertificate = () => {
    const cert = generateOverheightCertificate(
      activePlate,
      selectedVehicleType,
      vehicleHeightM,
      selectedBridge
    );
    setActiveCertificate(cert);
    setCertificates((prev) => [cert, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopyFeedback('Kopiyalandı!');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Filtered bridges
  const filteredBridges = useMemo(() => {
    return MOCK_OVERHEIGHT_BRIDGES.filter(
      (b) =>
        b.nameAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filtered registry
  const filteredRegistry = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.certificateNo.toLowerCase().includes(registrySearch.toLowerCase()) ||
        cert.licensePlate.toLowerCase().includes(registrySearch.toLowerCase()) ||
        cert.structureName.toLowerCase().includes(registrySearch.toLowerCase());
      const matchesStatus =
        registryStatusFilter === 'ALL' || cert.status === registryStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [certificates, registrySearch, registryStatusFilter]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="overheight-safe-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-7xl max-h-[96vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AAYDA • AYNA • BDYP RƏSMİ SCADA
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OHVDS • LiDAR 2026
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Magistral Qabarit Hündürlük & Körpüyə Çırpılma Mühafizəsi (OVERHEIGHT-SAFE-AZ-2026)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('corridors')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'corridors'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Körpü Radarı
          </button>
          <button
            onClick={() => setActiveTab('scada')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'scada'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            SCADA Lazer Stendi
          </button>
          <button
            onClick={() => setActiveTab('envelope')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'envelope'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            2D/3D Aşırım Qrafiki
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'presets'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            Nəqliyyat Preseti & Cərimə
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            10-Bəndlik Standart
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'exam'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            İmtahan Simulyatoru
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Sertifikat Blankı
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            Dövlət Reyestri
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CORRIDORS (RADAR) */}
          {activeTab === 'corridors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-400" />
                    Azərbaycan Magistral Körpü və Yolötürücülərinin Laser OHVDS Radarı
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    AAYDA və BDYP Situasiya Mərkəzinə qoşulmuş aktiv 6 strateji körpü və aşırım qabariti
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Körpü və ya marşrut axtar..."
                    className="w-full sm:w-64 pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBridges.map((bridge) => {
                  const isSelected = bridge.id === selectedCorridorId;
                  return (
                    <div
                      key={bridge.id}
                      onClick={() => handleSelectCorridor(bridge)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500 shadow-lg shadow-amber-950/30'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-amber-300 border border-slate-700">
                          {bridge.id} • {bridge.chainageKm}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            bridge.status === 'OPTIMAL'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {bridge.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">
                        {bridge.nameAz}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">{bridge.route}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mb-3">
                        <div>
                          <div className="text-slate-400 text-[10px]">Qabarit Hündürlüyü:</div>
                          <div className="font-bold text-emerald-400 text-sm">{bridge.postedClearanceM.toFixed(2)} m</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px]">Lazer Məsafəsi:</div>
                          <div className="font-bold text-sky-400">{bridge.sensorDistanceBeforeBridgeM} m öndə</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px]">Sensor Növü:</div>
                          <div className="font-medium text-slate-300 text-[11px] truncate">{bridge.sensorTechnology}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px]">Akustik Siren:</div>
                          <div className="font-medium text-amber-400">{bridge.acousticSirenDb} dBA</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Son kalibrasiya: {bridge.lastCalibrationDate}</span>
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          Seç və Tətbiq Et <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SCADA LASER STAND */}
          {activeTab === 'scada' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-400" />
                    OHVDS Dual-Beam Lazer & Toqquşma SCADA Simulyasiya Stendi
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Aktiv Körpü: <span className="text-amber-300 font-semibold">{selectedBridge.nameAz}</span> ({selectedBridge.chainageKm})
                  </p>
                </div>
                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    isAudioMuted
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-amber-600/20 text-amber-300 border-amber-500/40 animate-pulse'
                  }`}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isAudioMuted ? 'Səs Söndürülüb' : '118 dBA Siren Aktiv'}
                </button>
              </div>

              {/* Dynamic VMS Warning Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  simResult.clearanceStatus === 'CRITICAL_OVERHEIGHT_COLLISION_WARNING'
                    ? 'bg-red-950/40 border-red-500/60 text-red-200 animate-pulse'
                    : simResult.clearanceStatus === 'MARGINAL_CAUTION'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      simResult.clearanceStatus === 'CRITICAL_OVERHEIGHT_COLLISION_WARNING'
                        ? 'bg-red-500/20 text-red-400'
                        : simResult.clearanceStatus === 'MARGINAL_CAUTION'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      DİNAMİK ELEKTRON VMS TABLOSU (PORTAL GANTRY)
                    </div>
                    <div className="text-sm sm:text-base font-extrabold tracking-tight font-mono">
                      {simResult.vmsMessageAz}
                    </div>
                    <div className="text-xs opacity-75 font-mono">{simResult.vmsMessageEn}</div>
                  </div>
                </div>

                {simResult.acousticWarningSirenActive && (
                  <button
                    onClick={playWarningChirp}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Sireni Sına
                  </button>
                )}
              </div>

              {/* Interactive Controls & Live Physics Gauge */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sliders Panel */}
                <div className="lg:col-span-2 space-y-4 bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Telemetriya Parametrləri
                  </h4>

                  {/* Vehicle Height Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Nəqliyyatın Faktiki Hündürlüyü:</span>
                      <span className="font-bold text-amber-400">{vehicleHeightM.toFixed(2)} metr</span>
                    </div>
                    <input
                      type="range"
                      min="2.00"
                      max="5.40"
                      step="0.05"
                      value={vehicleHeightM}
                      onChange={(e) => setVehicleHeightM(parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>2.00m (Minik)</span>
                      <span>4.00m (NK 104 Standart)</span>
                      <span>4.50m (Körpü Aşırımı)</span>
                      <span>5.40m (Kuzov Açıq)</span>
                    </div>
                  </div>

                  {/* Approach Speed Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Yaxınlaşma Sürəti:</span>
                      <span className="font-bold text-sky-400">{approachSpeedKmh} km/saat</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="130"
                      step="5"
                      value={approachSpeedKmh}
                      onChange={(e) => setApproachSpeedKmh(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>20 km/s</span>
                      <span>60 km/s (Şəhər)</span>
                      <span>90 km/s (Magistral)</span>
                      <span>130 km/s</span>
                    </div>
                  </div>

                  {/* Vehicle Gross Mass Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Nəqliyyatın Ümumi Çəkisi (Gross Mass):</span>
                      <span className="font-bold text-indigo-400">{(vehicleGrossMassKg / 1000).toFixed(1)} ton</span>
                    </div>
                    <input
                      type="range"
                      min="1500"
                      max="50000"
                      step="500"
                      value={vehicleGrossMassKg}
                      onChange={(e) => setVehicleGrossMassKg(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>1.5t (Sedan)</span>
                      <span>18t (Avtobus)</span>
                      <span>38t (Euro-6 TIR)</span>
                      <span>50t (Ağır Lowbed)</span>
                    </div>
                  </div>

                  {/* Bridge Clearance Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Körpü Nişan Qabariti (Posted Clearance):</span>
                      <span className="font-bold text-emerald-400">{bridgePostedClearanceM.toFixed(2)} metr</span>
                    </div>
                    <input
                      type="range"
                      min="3.80"
                      max="5.20"
                      step="0.05"
                      value={bridgePostedClearanceM}
                      onChange={(e) => setBridgePostedClearanceM(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  {/* Sensor Distance Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Lazer Şüalanma Məsafəsi (Körpüdən Öncə):</span>
                      <span className="font-bold text-purple-400">{sensorDistanceBeforeBridgeM} metr</span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="500"
                      step="10"
                      value={sensorDistanceBeforeBridgeM}
                      onChange={(e) => setSensorDistanceBeforeBridgeM(parseInt(e.target.value, 10))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Road Surface Friction & Reaction Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Yol Səthi Sürtünməsi:</label>
                      <select
                        value={roadSurfaceFriction}
                        onChange={(e) => setRoadSurfaceFriction(e.target.value as RoadSurfaceFriction)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="DRY">Quru Asfalt (μ = 0.72)</option>
                        <option value="WET">Nəm / Yağışlı (μ = 0.42)</option>
                        <option value="SNOW_ICE">Qarlı / Buzlu (μ = 0.18)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Sürücü Reaksiya Müddəti ({driverReactionTimeSec} saniyə):
                      </label>
                      <input
                        type="range"
                        min="0.8"
                        max="2.5"
                        step="0.1"
                        value={driverReactionTimeSec}
                        onChange={(e) => setDriverReactionTimeSec(parseFloat(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time SCADA Metrics Card */}
                <div className="space-y-4 bg-slate-950/50 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      Hesablanmış SCADA Nəticələri
                    </h4>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Qabarit Payı (Margin):</div>
                          <div
                            className={`text-lg font-extrabold ${
                              simResult.clearanceMarginM <= 0
                                ? 'text-red-400'
                                : simResult.clearanceMarginM < 0.30
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {simResult.clearanceMarginM > 0 ? `+${simResult.clearanceMarginM.toFixed(2)}` : simResult.clearanceMarginM.toFixed(2)} m
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-[10px] font-bold rounded ${
                            simResult.clearanceStatus === 'CRITICAL_OVERHEIGHT_COLLISION_WARNING'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : simResult.clearanceStatus === 'MARGINAL_CAUTION'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {simResult.clearanceStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-slate-400 text-[10px]">Tormoz Məsafəsi:</div>
                          <div className="text-white font-bold">{simResult.stoppingDistanceM} m</div>
                          <div className="text-[9px] text-slate-500">
                            Reak: {simResult.reactionDistanceM}m + Əyləc: {simResult.brakingDistanceM}m
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                          <div className="text-slate-400 text-[10px]">Təhlükəsizlik Marjası:</div>
                          <div
                            className={`font-bold ${
                              simResult.safeStoppingMarginM >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {simResult.safeStoppingMarginM >= 0 ? `+${simResult.safeStoppingMarginM}` : simResult.safeStoppingMarginM} m
                          </div>
                          <div className="text-[9px] text-slate-500">Çatma vaxtı: {simResult.timeToImpactSec} san</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Toqquşma Kinetik Enerjisi:</div>
                        <div className="text-amber-300 font-bold text-sm">
                          {simResult.kineticEnergyAtImpactMJ} MegaJoul (MJ)
                        </div>
                        <div className="text-[9px] text-slate-500">
                          Potensial mülki konstruksiya zərəri: {formatPrice(simResult.structuralDamageLiabilityAzn, currency)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Məcburi Hərəkət Təlimatı:</div>
                        <div className="text-indigo-300 font-semibold text-xs mt-0.5">
                          {simResult.divertAction}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateCertificate}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/30"
                  >
                    <FileCheck className="w-4 h-4" />
                    Elektron Qabarit Arayışı Yarat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANIMATED SVG CLEARANCE ENVELOPE */}
          {activeTab === 'envelope' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-400" />
                    2D Lazer LiDAR Aşırım Ölçmə Zərfi və Profil Qrafiki
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Körpü tağı ({bridgePostedClearanceM}m) və nəqliyyat qabariti ({vehicleHeightM}m) nisbəti
                  </p>
                </div>
                <div className="text-xs text-right">
                  <div className="text-slate-400 text-[10px]">Dövlət Qeydiyyatı:</div>
                  <div className="font-mono font-bold text-amber-400">{activePlate}</div>
                </div>
              </div>

              {/* Animated Interactive SVG Diagram */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <svg
                  viewBox="0 0 800 380"
                  className="w-full max-w-4xl h-auto select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Sky / Background Grid */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                    <linearGradient id="laserBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <rect width="800" height="380" fill="url(#grid)" />

                  {/* Road Surface */}
                  <rect x="0" y="320" width="800" height="60" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                  <line x1="0" y1="350" x2="800" y2="350" stroke="#facc15" strokeWidth="2" strokeDasharray="15,15" />

                  {/* Bridge Pier & Overhead Girder */}
                  {/* Left Pier */}
                  <rect x="520" y="80" width="35" height="240" fill="#334155" rx="4" stroke="#475569" strokeWidth="2" />
                  {/* Right Pier */}
                  <rect x="730" y="80" width="35" height="240" fill="#334155" rx="4" stroke="#475569" strokeWidth="2" />
                  {/* Overhead Girder */}
                  <rect x="500" y="40" width="280" height="50" fill="#1e293b" rx="6" stroke="#475569" strokeWidth="2" />
                  <text x="640" y="70" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                    KÖRPÜ / OVERPASS ({bridgePostedClearanceM.toFixed(2)}m)
                  </text>

                  {/* Height Limit Indicator Sign on Girder */}
                  <circle cx="640" cy="115" r="22" fill="#ffffff" stroke="#dc2626" strokeWidth="4" />
                  <text x="640" y="119" fill="#0f172a" fontSize="11" fontWeight="extrabold" textAnchor="middle">
                    {bridgePostedClearanceM.toFixed(1)}m
                  </text>

                  {/* Laser Gantry Prior to Bridge (Sensor Stand) */}
                  <line x1="280" y1="50" x2="280" y2="320" stroke="#0ea5e9" strokeWidth="3" />
                  <rect x="270" y="45" width="20" height="25" fill="#0284c7" rx="3" />
                  {/* Dual-Beam Laser Emitters */}
                  <circle cx="280" cy="120" r="4" fill="#ef4444" className="animate-ping" />
                  <circle cx="280" cy="120" r="3" fill="#ef4444" />
                  <circle cx="280" cy="160" r="3" fill="#ef4444" />
                  <line
                    x1="280"
                    y1="120"
                    x2="520"
                    y2="120"
                    stroke="url(#laserBeamGrad)"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  <text x="280" y="35" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                    LiDAR SENSOR (350m)
                  </text>

                  {/* Vehicle Outline */}
                  {/* Calculate scaled vehicle top: Road is y=320, 1m = 40px scale */}
                  {/* Base scale: 4.5m bridge = 180px above road => y = 320 - 180 = 140px */}
                  {(() => {
                    const pixelsPerMeter = 42;
                    const bridgeClearancePx = bridgePostedClearanceM * pixelsPerMeter;
                    const vehicleHeightPx = vehicleHeightM * pixelsPerMeter;
                    const bridgeY = 320 - bridgeClearancePx;
                    const vehicleTopY = 320 - vehicleHeightPx;
                    const isCollision = vehicleHeightM > bridgePostedClearanceM;

                    return (
                      <g>
                        {/* Bridge Underside Clearance Reference Line */}
                        <line
                          x1="200"
                          y1={bridgeY}
                          x2="780"
                          y2={bridgeY}
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray="6,4"
                        />
                        <text x="210" y={bridgeY - 6} fill="#10b981" fontSize="10" fontWeight="bold">
                          Körpü Alt Həddi: {bridgePostedClearanceM.toFixed(2)}m
                        </text>

                        {/* Vehicle Body */}
                        <g transform="translate(100, 0)">
                          {/* Cabin & Cargo */}
                          <rect
                            x="40"
                            y={vehicleTopY}
                            width="160"
                            height={vehicleHeightPx - 25}
                            fill={isCollision ? '#b91c1c' : '#1e3a8a'}
                            stroke={isCollision ? '#ef4444' : '#3b82f6'}
                            strokeWidth="2"
                            rx="4"
                          />
                          {/* Cabin Nose */}
                          <path
                            d={`M 200 ${vehicleTopY + 40} L 240 ${vehicleTopY + 80} L 240 295 L 200 295 Z`}
                            fill="#1e293b"
                            stroke="#475569"
                            strokeWidth="2"
                          />
                          {/* Wheels */}
                          <circle cx="80" cy="308" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
                          <circle cx="150" cy="308" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
                          <circle cx="220" cy="308" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="3" />

                          {/* Height Dimension Arrow */}
                          <line
                            x1="25"
                            y1={vehicleTopY}
                            x2="25"
                            y2="320"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            markerEnd="url(#arrow)"
                          />
                          <text
                            x="20"
                            y={(vehicleTopY + 320) / 2}
                            fill="#f59e0b"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="end"
                          >
                            {vehicleHeightM.toFixed(2)}m
                          </text>

                          {/* Vehicle Plate Tag */}
                          <rect
                            x="160"
                            y="280"
                            width="65"
                            height="16"
                            fill="#ffffff"
                            stroke="#000000"
                            strokeWidth="1"
                            rx="2"
                          />
                          <text x="192" y="292" fill="#000000" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {activePlate}
                          </text>
                        </g>

                        {/* Collision Penetration / Buffer Zone Indicator */}
                        {isCollision ? (
                          <g>
                            <rect
                              x="350"
                              y={vehicleTopY}
                              width="180"
                              height={bridgeY - vehicleTopY}
                              fill="#ef4444"
                              fillOpacity="0.3"
                              stroke="#ef4444"
                              strokeWidth="1.5"
                              strokeDasharray="4,2"
                            />
                            <text
                              x="440"
                              y={vehicleTopY - 10}
                              fill="#ef4444"
                              fontSize="12"
                              fontWeight="extrabold"
                              textAnchor="middle"
                            >
                              TOQQUŞMA TƏHLÜKƏSİ! (-{Math.abs(simResult.clearanceMarginM).toFixed(2)}m)
                            </text>
                          </g>
                        ) : (
                          <g>
                            <line
                              x1="450"
                              y1={vehicleTopY}
                              x2="450"
                              y2={bridgeY}
                              stroke="#10b981"
                              strokeWidth="2"
                            />
                            <text
                              x="460"
                              y={(vehicleTopY + bridgeY) / 2 + 4}
                              fill="#10b981"
                              fontSize="11"
                              fontWeight="bold"
                            >
                              Təhlükəsiz Pay: +{simResult.clearanceMarginM.toFixed(2)}m
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })()}

                  {/* Escape Slip Road Arrow Sign */}
                  <g transform="translate(360, 220)">
                    <rect x="0" y="0" width="110" height="42" fill="#0f766e" rx="4" stroke="#14b8a6" strokeWidth="2" />
                    <text x="55" y="18" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      XİLASEDİCİ YOL
                    </text>
                    <text x="55" y="32" fill="#facc15" fontSize="10" fontWeight="extrabold" textAnchor="middle">
                      SAĞA DÖN ➔
                    </text>
                  </g>
                </svg>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Lazer Şüa Texnologiyası:</div>
                  <div className="text-white font-bold">{selectedBridge.sensorTechnology}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Dual-Beam impuls tezliyi: 100 kHz</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Təhlükəsizlik Zolağı:</div>
                  <div className="text-emerald-400 font-bold">Məcburi Sağ Çıxış Mövcuddur</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Körpüyə 180 metr qalmış</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Dövlət Standartı:</div>
                  <div className="text-amber-400 font-bold">AZS 410 / AASHTO Bridge</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">EN 1317 qoruyucu ştanqa</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRESETS & FINES */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  Nəqliyyat Presetləri və İnzibati Məsuliyyət Hesablayıcısı
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Azərbaycan Respublikası İnzibati Xətalar Məcəlləsi (İXM 327.1, 342.1, 353.1) və NK 104
                </p>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_OVERHEIGHT_VEHICLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/80 hover:border-amber-500/50 text-left transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                        {preset.licensePlate}
                      </span>
                      <span className="text-xs font-extrabold text-amber-400">
                        {preset.heightMeters.toFixed(2)} m
                      </span>
                    </div>
                    <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors line-clamp-1">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {preset.cargoDescription}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-700/40">
                      <span>Kütlə: {(preset.grossMassKg / 1000).toFixed(1)}t</span>
                      <span>Sürət: {preset.defaultSpeedKmh} km/s</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Penalty and Civil Liability Calculation Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Qanunvericilik üzrə Cərimə və Dəymiş Ziyanın Bərpası
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-xs">Standart İnzibati Cərimə:</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">
                      {formatPrice(simResult.statutoryFineAzn, currency)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Cərimə Balı: <span className="text-red-400 font-bold">{simResult.pointsPenalty} bal</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {simResult.statutoryFineUsd} USD / {simResult.statutoryFineEur} EUR
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/20">
                    <div className="text-emerald-400 text-xs font-semibold">
                      İXM Maddə 38 üzrə 50% Güzəştli Ödəniş (30 gün):
                    </div>
                    <div className="text-2xl font-black text-emerald-300 mt-1">
                      {formatPrice(simResult.discountedFineAzn, currency)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      30 gün ərzində ASAN ödəniş portalı vasitəsilə
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400 text-xs">Mülki Məcəllə Maddə 1108 (İnfrastruktur Təmiri):</div>
                    <div className="text-2xl font-black text-red-400 mt-1">
                      {formatPrice(simResult.structuralDamageLiabilityAzn, currency)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Aşırım karkası, bərpa krantajı və ekspertiza xərci
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-amber-400">Hüquqi Əsas: </span>
                  {simResult.legalBasisAz}. AR NK-nın 104 №-li Qərarına görə qabarit hündürlüyü 4.00 metri keçən bütün nəqliyyat vasitələri üçün AAYDA və BDYP-dən xüsusi icazə tələb olunur.
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    10-Bəndlik Texniki və Hüquqi Qabarit Hündürlük Standartı
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    AAYDA, AYNA və BDYP tərəfindən təsdiq olunmuş yol mühəndisliyi audit tələbləri
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-600/30 transition-colors"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Auditə Uyğunluq Dərəcəsi:</span>
                  <span className="font-bold text-amber-400">{checklistScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      checklistScore === 100
                        ? 'bg-emerald-500'
                        : checklistScore >= 70
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${checklistScore}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_OVERHEIGHT_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-sm'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border transition-colors ${
                          isChecked
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-white text-xs">{item.titleAz}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.descriptionAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    Qabarit Hündürlük və Körpü Təhlükəsizliyi İmtahan Simulyatoru
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    AAYDA mühəndisləri və ağır nəqliyyat sürücüləri üçün rəsmi 10 sual
                  </p>
                </div>
                {examSubmitted && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        examScore >= 8
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}
                    >
                      Nəticə: {examScore} / 10 ({examScore >= 8 ? 'MÜVƏFFƏQ' : 'KƏSİLDİ'})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedAnswers({});
                        setExamSubmitted(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold hover:bg-slate-700"
                    >
                      Yenidən Başla
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_OVERHEIGHT_EXAM.map((q, idx) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isAnswered = userAnswer !== undefined;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-xs sm:text-sm">{q.questionAz}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">{q.legalRef}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.optionsAz.map((option, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800';

                          if (examSubmitted) {
                            if (optIdx === q.correctAnswerIndex) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isSelected && optIdx !== q.correctAnswerIndex) {
                              btnStyle = 'bg-red-950/60 border-red-500 text-red-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-amber-600/30 border-amber-500 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerChange(q.id, optIdx)}
                              disabled={examSubmitted}
                              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${btnStyle}`}
                            >
                              <span className="font-bold mr-2 text-slate-500">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                          <span className="font-bold text-amber-400">İzah: </span>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!examSubmitted && (
                <button
                  onClick={() => setExamSubmitted(true)}
                  disabled={Object.keys(selectedAnswers).length < MOCK_OVERHEIGHT_EXAM.length}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-amber-600/30"
                >
                  Cavabları Təsdiqlə və Qiymətləndir
                </button>
              )}
            </div>
          )}

          {/* TAB 7: CERTIFICATE SHEET */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-amber-400" />
                    Rəsmi Elektron Qabarit Arayışı (OVERHEIGHT-SAFE-AZ-2026)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    AAYDA, AYNA və BDYP rəqəmsal imzalı vahid təhlükəsizlik blankı
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print?.()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Çap Et
                  </button>
                  <button
                    onClick={() => {
                      if (activeCertificate) {
                        handleCopyHash(activeCertificate.sha256Hash);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-600/30 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copyFeedback || 'Heş Kodu Kopyala'}
                  </button>
                </div>
              </div>

              {/* Certificate Sheet Display */}
              {activeCertificate ? (
                <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border-2 border-amber-500/40 relative overflow-hidden shadow-2xl">
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                    <span className="text-7xl sm:text-9xl font-black text-amber-400 transform -rotate-12">
                      AAYDA SCADA
                    </span>
                  </div>

                  <div className="relative space-y-6">
                    {/* Top Seal & Heading */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/30 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                            AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ
                          </div>
                          <h2 className="text-base sm:text-xl font-black text-white">
                            QABARİT HÜNDÜRLÜK KEÇİD SERTİFİKATI
                          </h2>
                          <div className="text-xs text-slate-400 font-mono">
                            {activeCertificate.certificateNo}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            activeCertificate.status === 'VERIFIED_CLEARANCE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : activeCertificate.status === 'SPECIAL_PERMIT_VALIDATED'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {activeCertificate.status}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <div>
                        <div className="text-slate-400 text-[10px]">Dövlət Qeydiyyat Nişanı:</div>
                        <div className="font-mono font-bold text-amber-400 text-sm">
                          {activeCertificate.licensePlate}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Ölçülmüş Hündürlük:</div>
                        <div className="font-bold text-white text-sm">
                          {activeCertificate.measuredHeightM.toFixed(2)} m
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">İcazə Verilən Hündürlük:</div>
                        <div className="font-bold text-emerald-400 text-sm">
                          {activeCertificate.permittedMaxHeightM.toFixed(2)} m
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Qabarit Payı (Margin):</div>
                        <div
                          className={`font-bold text-sm ${
                            activeCertificate.clearanceMarginM >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {activeCertificate.clearanceMarginM >= 0
                            ? `+${activeCertificate.clearanceMarginM.toFixed(2)}`
                            : activeCertificate.clearanceMarginM.toFixed(2)}{' '}
                          m
                        </div>
                      </div>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="text-slate-400">Yolötürücü / Aşırım Obyekti:</div>
                      <div className="font-bold text-white bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        {activeCertificate.structureName} ({activeCertificate.structureId})
                      </div>
                    </div>

                    {/* Security Digital Signatures */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-4 border-t border-slate-800">
                      <div>
                        <div className="text-slate-500">SİMA Rəqəmsal İmza:</div>
                        <div className="font-mono text-slate-300 truncate">{activeCertificate.simaSignatureUid}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Keçid Şlaqbaum PİN:</div>
                        <div className="font-mono font-bold text-amber-400 text-sm">
                          {activeCertificate.barrierPassPin}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Etibarlılıq Tarixi:</div>
                        <div className="text-slate-300">
                          {activeCertificate.issueDate} — {activeCertificate.expiryDate}
                        </div>
                      </div>
                    </div>

                    {/* SHA256 Checksum */}
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-400 break-all">
                      SHA256: {activeCertificate.sha256Hash}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <FileCheck className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="text-slate-300 font-bold">Hələ sertifikat yaradılmayıb</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    SCADA stendində parametrləri təyin edib "Elektron Qabarit Arayışı Yarat" düyməsini sıxın.
                  </p>
                  <button
                    onClick={() => setActiveTab('scada')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                  >
                    SCADA Stendinə Keç
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-amber-400" />
                    Vahid AAYDA & BDYP Qabarit və Toqquşma Reyestri
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Sistemdə təsdiqlənmiş və qeydiyyata alınmış aktiv sertifikatlar və qəza xəbərdarlıqları
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={registryStatusFilter}
                    onChange={(e) => setRegistryStatusFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">Bütün Statuslar</option>
                    <option value="VERIFIED_CLEARANCE">Təhlükəsiz (Verified)</option>
                    <option value="DIVERT_REQUIRED">Yönləndirmə (Divert)</option>
                    <option value="SPECIAL_PERMIT_VALIDATED">Xüsusi İcazəli</option>
                  </select>

                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Qeydiyyat nişanı və ya №..."
                    className="w-48 sm:w-60 pl-3 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Table of Registry Entries */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Sertifikat №</th>
                      <th className="p-3">Qeydiyyat Nişanı</th>
                      <th className="p-3">Aşırım Obyekti</th>
                      <th className="p-3">Ölçülən Hündürlük</th>
                      <th className="p-3">Marja</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Tarix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredRegistry.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => {
                          setActiveCertificate(entry);
                          setActiveTab('certificate');
                        }}
                        className="hover:bg-slate-800/60 transition-colors cursor-pointer"
                      >
                        <td className="p-3 font-mono text-amber-300 font-bold">{entry.certificateNo}</td>
                        <td className="p-3 font-mono font-bold text-white">{entry.licensePlate}</td>
                        <td className="p-3 text-slate-300 max-w-xs truncate">{entry.structureName}</td>
                        <td className="p-3 font-bold text-white">{entry.measuredHeightM.toFixed(2)} m</td>
                        <td
                          className={`p-3 font-bold ${
                            entry.clearanceMarginM >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {entry.clearanceMarginM >= 0
                            ? `+${entry.clearanceMarginM.toFixed(2)}`
                            : entry.clearanceMarginM.toFixed(2)}{' '}
                          m
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              entry.status === 'VERIFIED_CLEARANCE'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : entry.status === 'SPECIAL_PERMIT_VALIDATED'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{entry.issueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AAYDA SCADA OHVDS LiDAR Qovşağı Aktivdir (±3mm Sensor Kalibrasiyası)</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            AR NK No 104 • İXM 327.1, 342.1 • EN 1317 • SİMA 2026
          </div>
        </div>
      </div>
    </div>
  );
};
