import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Gauge,
  Sliders,
  Car,
  Volume2,
  Layers,
  Compass,
  ArrowRight,
  Radio,
  Zap,
  Info,
} from 'lucide-react';
import {
  Currency,
  MeteringMode,
  RampStation,
  VehiclePreset,
  RampCertificate,
  convertRampCurrency,
  RAMP_CURRENCY_SYMBOLS,
  calculateAlineaRate,
  calculateMergePhysics,
  evaluateStatutorySanctions,
  generateRampCertificate,
} from '../utils/rampSafeCompliance';
import {
  MOCK_RAMP_STATIONS,
  MOCK_VEHICLE_PRESETS,
  MOCK_TECHNICAL_CHECKLIST,
  MOCK_THEORETICAL_EXAM,
  MOCK_RAMP_CERTIFICATES,
} from '../data/mockRampSafeData';

interface RampSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType =
  | 'radar'
  | 'simulator'
  | 'vehicles'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry'
  | 'about';

export const RampSafeModal: React.FC<RampSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedStation, setSelectedStation] = useState<RampStation>(MOCK_RAMP_STATIONS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePreset>(MOCK_VEHICLE_PRESETS[0]);

  // Simulator inputs
  const [downstreamOccupancy, setDownstreamOccupancy] = useState<number>(18.5);
  const [targetOccupancy, setTargetOccupancy] = useState<number>(18.5);
  const [rampQueueOccupancy, setRampQueueOccupancy] = useState<number>(35);
  const [mainlineSpeed, setMainlineSpeed] = useState<number>(90); // km/h
  const [rampReleaseSpeed, setRampReleaseSpeed] = useState<number>(50); // km/h
  const [taperLength, setTaperLength] = useState<number>(220); // meters
  const [mainlineFlow, setMainlineFlow] = useState<number>(3800); // veh/h
  const [preferredMode, setPreferredMode] = useState<'ONE_CAR_PER_GREEN' | 'TWO_CAR_PER_GREEN'>(
    'ONE_CAR_PER_GREEN'
  );

  // Sound synthesis state
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MOCK_TECHNICAL_CHECKLIST.forEach((item) => {
      initial[item.id] = item.defaultChecked;
    });
    return initial;
  });

  // Theoretical exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate Generator State
  const [certPlate, setCertPlate] = useState<string>('99-RP-101');
  const [certVehicleModel, setCertVehicleModel] = useState<string>('Mercedes-Benz E 300 4MATIC');
  const [generatedCert, setGeneratedCert] = useState<RampCertificate>(MOCK_RAMP_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Public Registry Search & Records
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryRecords, setRegistryRecords] = useState<RampCertificate[]>(MOCK_RAMP_CERTIFICATES);

  // Active ALINEA rate calculation
  const alineaResult = useMemo(() => {
    return calculateAlineaRate({
      downstreamOccupancyPercent: downstreamOccupancy,
      targetOccupancyPercent: targetOccupancy,
      previousRateVehPerHour: 650,
      rampQueueOccupancyPercent: rampQueueOccupancy,
      rampLanes: selectedStation.rampLanes,
      preferredMode,
    });
  }, [
    downstreamOccupancy,
    targetOccupancy,
    rampQueueOccupancy,
    selectedStation.rampLanes,
    preferredMode,
  ]);

  // Active Merge physics calculation
  const mergeResult = useMemo(() => {
    return calculateMergePhysics({
      mainlineSpeedKmH: mainlineSpeed,
      rampReleaseSpeedKmH: rampReleaseSpeed,
      accelerationRateMS2: selectedVehicle.accelerationRate,
      actualTaperLengthMeters: taperLength,
      mainlineFlowVehPerHour: mainlineFlow,
    });
  }, [
    mainlineSpeed,
    rampReleaseSpeed,
    selectedVehicle.accelerationRate,
    taperLength,
    mainlineFlow,
  ]);

  // Statutory sanctions calculation
  const sanctionsResult = useMemo(() => {
    return evaluateStatutorySanctions(selectedVehicle.defaultViolation, currency);
  }, [selectedVehicle.defaultViolation, currency]);

  // Synthesized Web Audio SCADA Alarm
  const playScadaWarningSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
      setAudioPlayed(true);
      setTimeout(() => setAudioPlayed(false), 800);
    } catch {
      // Audio not supported in test environment
    }
  };

  // Station selection sync
  const handleSelectStation = (st: RampStation) => {
    setSelectedStation(st);
    setDownstreamOccupancy(st.defaultDownstreamOccupancy);
    setTargetOccupancy(st.criticalOccupancyPercent);
    setTaperLength(st.taperLengthMeters);
    setMainlineFlow(st.defaultMainlineFlow);
  };

  // Vehicle preset selection sync
  const handleSelectVehicle = (veh: VehiclePreset) => {
    setSelectedVehicle(veh);
    setCertPlate(veh.plate);
    setCertVehicleModel(veh.model);
    setRampReleaseSpeed(veh.designMergeSpeedKmH);
  };

  // Toggle checklist
  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllChecklist = (check: boolean) => {
    const updated: Record<string, boolean> = {};
    MOCK_TECHNICAL_CHECKLIST.forEach((item) => {
      updated[item.id] = check;
    });
    setCheckedItems(updated);
  };

  const checklistScore = useMemo(() => {
    const total = MOCK_TECHNICAL_CHECKLIST.length;
    const checked = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  }, [checkedItems]);

  // Theoretical exam submission
  const handleAnswerOption = (questionId: number, optionIdx: number) => {
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_THEORETICAL_EXAM.forEach((q) => {
      if (examAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    return {
      correctCount: correct,
      totalCount: MOCK_THEORETICAL_EXAM.length,
      percentage: Math.round((correct / MOCK_THEORETICAL_EXAM.length) * 100),
      passed: correct >= 8,
    };
  }, [examAnswers]);

  // Certificate generation
  const handleGenerateCertificate = () => {
    const cert = generateRampCertificate({
      vehiclePlate: certPlate,
      vehicleModel: certVehicleModel,
      station: selectedStation,
      meteringRate: alineaResult.meteringRateVehPerHour,
      cycleTimeSec: alineaResult.cycleLengthSeconds,
      greenTimeSec: alineaResult.greenSeconds,
      levelOfService: alineaResult.mainlineLevelOfService,
      taperSafetyRatio: mergeResult.taperSafetyRatio,
    });
    setGeneratedCert(cert);
    setRegistryRecords((prev) => [cert, ...prev.filter((r) => r.certificateNumber !== cert.certificateNumber)]);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered public registry
  const filteredRegistry = useMemo(() => {
    if (!registrySearch.trim()) return registryRecords;
    const q = registrySearch.toLowerCase();
    return registryRecords.filter(
      (r) =>
        r.certificateNumber.toLowerCase().includes(q) ||
        r.vehiclePlate.toLowerCase().includes(q) ||
        r.stationName.toLowerCase().includes(q) ||
        r.stationCode.toLowerCase().includes(q)
    );
  }, [registryRecords, registrySearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      data-testid="ramp-safe-modal"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-b border-emerald-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AAYDA • AYNA • BDYP
                </span>
                <span className="text-xs font-mono text-slate-400">RAMP-SAFE-AZ-2026</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Magistral Giriş Rampası Nəzarət və ALINEA SCADA Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="ramp-safe-close-btn"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto scrollbar-none text-xs sm:text-sm">
          {[
            { id: 'radar', label: 'Rampa Radarı (6)', icon: Compass },
            { id: 'simulator', label: 'ALINEA SCADA Simulyator', icon: Sliders },
            { id: 'vehicles', label: 'Avtomobil & İXM Cərimələr', icon: Car },
            { id: 'checklist', label: '10-Nöqtəli Audit', icon: ShieldAlert },
            { id: 'exam', label: 'Sürücü İmtahanı', icon: FileText },
            { id: 'certificate', label: 'Rəsmi Buraxılış Vərəqəsi', icon: CheckCircle },
            { id: 'registry', label: 'Açıq Reyestr', icon: Search },
            { id: 'about', label: 'Hüquqi Əsaslar', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`ramp-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-4" data-testid="ramp-radar-tab">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-400" />
                    Azərbaycanın 6 Strateji Magistral Giriş Rampası və SCADA Sensor Şəbəkəsi
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və AYNA İntellektual Nəqliyyat İdarəetmə Mərkəzi (NİİM) real-vaxt detektor ilgəkləri
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Normal: 3
                  </span>
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Nəzarət: 2
                  </span>
                  <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Kritik: 1
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_RAMP_STATIONS.map((station) => {
                  const isSelected = selectedStation.id === station.id;
                  const alertBg =
                    station.alertLevel === 'CRITICAL'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      : station.alertLevel === 'ELEVATED'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';

                  return (
                    <div
                      key={station.id}
                      data-testid={`ramp-station-card-${station.id}`}
                      onClick={() => handleSelectStation(station)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                            {station.code}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
                            {station.nameAz}
                          </h4>
                          <p className="text-xs text-slate-400">{station.corridor}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${alertBg}`}>
                          {station.alertLevel}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Piket & Koordinat</span>
                          <span className="font-semibold text-slate-200">{station.picketKm}</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Taper Uzunluğu</span>
                          <span className="font-semibold text-emerald-400">
                            {station.taperLengthMeters} metr
                          </span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Əsas Axın Doluluğu</span>
                          <span className="font-semibold text-slate-200">
                            {station.defaultDownstreamOccupancy}%
                          </span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Rampa Tələbi</span>
                          <span className="font-semibold text-amber-400">
                            {station.defaultRampDemand} avt/saat
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/50">
                        <span className="text-slate-400">
                          Zolaqlar: {station.rampLanes} rampa / {station.mainlineLanes} magistral
                        </span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          {isSelected ? 'Seçildi' : 'Seçmək üçün klikləyin'}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Station Telemetry Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-emerald-400 font-mono">
                      AKTİV RADAR İNTELLEKTUAL STANCIYASI
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {selectedStation.nameAz} ({selectedStation.routeNumber})
                    </h3>
                    <p className="text-xs text-slate-400">
                      GPS: {selectedStation.gpsLat}° N, {selectedStation.gpsLng}° E • Piket: {selectedStation.picketKm}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-lg"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>ALINEA Simulyatora Keç</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALINEA SCADA SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-5" data-testid="ramp-simulator-tab">
              {/* Alert Status Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  alineaResult.queueOverrideActive
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : alineaResult.mainlineLevelOfService === 'E' ||
                      alineaResult.mainlineLevelOfService === 'F'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 animate-pulse" />
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider block">
                      SCADA Nizamlayıcı Rejimi: {alineaResult.meteringMode.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs">
                      Aşağı Axın Doluluğu: {downstreamOccupancy}% (Hədəf: {targetOccupancy}%) •
                      Xidmət Səviyyəsi (LOS): {alineaResult.mainlineLevelOfService} • Buraxılış Sürəti:{' '}
                      {alineaResult.meteringRateVehPerHour} avt/saat
                    </span>
                  </div>
                </div>
                <button
                  onClick={playScadaWarningSound}
                  data-testid="ramp-alarm-sound-btn"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs flex items-center gap-1.5"
                  title="SCADA Səs Siqnalı"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{audioPlayed ? 'Çalınır...' : 'SCADA Siqnal'}</span>
                </button>
              </div>

              {/* 2D Animated SVG Freeway Merge Visualizer */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400">
                      SCADA 2D REAL-TIME CANLI BİRLƏŞMƏ DİAQRAMI
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Taper: {taperLength}m
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Qırmızı (
                      {alineaResult.redSeconds}s)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> Yaşıl (
                      {alineaResult.greenSeconds}s)
                    </span>
                  </div>
                </div>

                <svg viewBox="0 0 900 240" className="w-full h-auto rounded-xl bg-slate-900 border border-slate-800">
                  <defs>
                    <linearGradient id="mainlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="rampGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#047857" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#065f46" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Freeway Mainline Pavement */}
                  <rect x="20" y="30" width="860" height="90" rx="6" fill="url(#mainlineGrad)" stroke="#334155" strokeWidth="2" />

                  {/* Mainline Lane Markings (White Dashed) */}
                  <line x1="20" y1="60" x2="880" y2="60" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="15,12" opacity="0.6" />
                  <line x1="20" y1="90" x2="880" y2="90" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="15,12" opacity="0.6" />

                  {/* On-Ramp Curve Approaching Mainline */}
                  <path
                    d="M 60 210 Q 220 200, 360 120 L 640 120"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="32"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                  <path
                    d="M 60 210 Q 220 200, 360 120 L 640 120"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="8,8"
                  />

                  {/* Acceleration Taper Zone Highlight */}
                  <rect
                    x="360"
                    y="118"
                    width="280"
                    height="18"
                    fill="#10b981"
                    fillOpacity="0.15"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <text x="440" y="132" fill="#6ee7b7" fontSize="10" fontFamily="monospace">
                    Birləşmə Taper Zonası ({taperLength} m)
                  </text>

                  {/* Stop Line at Ramp Meter */}
                  <line x1="230" y1="165" x2="255" y2="195" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
                  <text x="180" y="215" fill="#f87171" fontSize="10" fontWeight="bold">
                    STOP LINE
                  </text>

                  {/* Dual LED Ramp Signal Head Graphic */}
                  <rect x="250" y="140" width="16" height="38" rx="4" fill="#020617" stroke="#475569" strokeWidth="1.5" />
                  {/* Red Light */}
                  <circle
                    cx="258"
                    cy="148"
                    r="4"
                    fill={alineaResult.meteringMode === 'OFF_FREE_FLOW' ? '#334155' : '#ef4444'}
                    filter={alineaResult.meteringMode !== 'OFF_FREE_FLOW' ? 'drop-shadow(0 0 4px #ef4444)' : undefined}
                  />
                  {/* Amber Light */}
                  <circle cx="258" cy="159" r="4" fill="#f59e0b" opacity="0.3" />
                  {/* Green Light */}
                  <circle
                    cx="258"
                    cy="170"
                    r="4"
                    fill={alineaResult.meteringMode === 'OFF_FREE_FLOW' ? '#10b981' : '#10b981'}
                    filter="drop-shadow(0 0 4px #10b981)"
                  />

                  {/* Vehicles on Mainline */}
                  <g transform="translate(100, 42)">
                    <rect width="28" height="14" rx="3" fill="#38bdf8" />
                    <text x="32" y="11" fill="#94a3b8" fontSize="9">90 km/h</text>
                  </g>
                  <g transform="translate(320, 72)">
                    <rect width="28" height="14" rx="3" fill="#38bdf8" />
                    <text x="32" y="11" fill="#94a3b8" fontSize="9">85 km/h</text>
                  </g>
                  <g transform="translate(560, 42)">
                    <rect width="40" height="15" rx="3" fill="#fbbf24" />
                    <text x="44" y="11" fill="#94a3b8" fontSize="9">TIR</text>
                  </g>
                  <g transform="translate(720, 72)">
                    <rect width="28" height="14" rx="3" fill="#38bdf8" />
                  </g>

                  {/* Vehicle on On-Ramp Meter */}
                  <g transform="translate(200, 168) rotate(-15)">
                    <rect width="26" height="13" rx="3" fill="#10b981" stroke="#34d399" strokeWidth="1" />
                    <text x="2" y="10" fill="#020617" fontSize="8" fontWeight="bold">AZ</text>
                  </g>

                  {/* Waiting Queue behind ramp meter */}
                  <g transform="translate(140, 185) rotate(-12)">
                    <rect width="24" height="12" rx="2" fill="#64748b" opacity="0.8" />
                  </g>
                  <g transform="translate(85, 200) rotate(-8)">
                    <rect width="24" height="12" rx="2" fill="#64748b" opacity="0.7" />
                  </g>

                  {/* Detector Loops (Dashed squares on pavement) */}
                  {/* Downstream Loop Array */}
                  <g transform="translate(780, 35)">
                    <rect width="22" height="20" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />
                    <rect width="22" height="20" y="28" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />
                    <rect width="22" height="20" y="56" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />
                    <text x="-4" y="-5" fill="#38bdf8" fontSize="9" fontFamily="monospace">Downstream Loops</text>
                  </g>

                  {/* Queue Spillback Detector */}
                  <g transform="translate(55, 195)">
                    <rect width="18" height="16" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
                    <text x="-10" y="32" fill="#f59e0b" fontSize="8" fontFamily="monospace">Queue Loop</text>
                  </g>
                </svg>
              </div>

              {/* Interactive Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Slider 1: Downstream Occupancy */}
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">Aşağı Axın Doluluğu (o_out)</span>
                    <span className="font-mono text-emerald-400 font-bold">{downstreamOccupancy}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="0.5"
                    value={downstreamOccupancy}
                    onChange={(e) => setDownstreamOccupancy(parseFloat(e.target.value))}
                    data-testid="ramp-slider-downstream-occ"
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>5% (Boş Yol)</span>
                    <span>18.5% (Optimal)</span>
                    <span>35% (Tıxac)</span>
                  </div>
                </div>

                {/* Slider 2: Target Occupancy */}
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">ALINEA Hədəf Doluluq (o_hat)</span>
                    <span className="font-mono text-emerald-400 font-bold">{targetOccupancy}%</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    step="0.5"
                    value={targetOccupancy}
                    onChange={(e) => setTargetOccupancy(parseFloat(e.target.value))}
                    data-testid="ramp-slider-target-occ"
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>14% (Konservativ)</span>
                    <span>19% (Kapasitə)</span>
                    <span>24% (Aqressiv)</span>
                  </div>
                </div>

                {/* Slider 3: Ramp Queue Storage Occupancy */}
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">Rampa Növbə Doluluğu</span>
                    <span
                      className={`font-mono font-bold ${
                        rampQueueOccupancy >= 80 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                      }`}
                    >
                      {rampQueueOccupancy}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={rampQueueOccupancy}
                    onChange={(e) => setRampQueueOccupancy(parseInt(e.target.value))}
                    data-testid="ramp-slider-queue-occ"
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0% (Boş Rampa)</span>
                    <span>80% (Override Həddi)</span>
                    <span>100% (Dolub)</span>
                  </div>
                </div>

                {/* Slider 4: Taper Length */}
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">Sürətlənmə Taper Uzunluğu</span>
                    <span className="font-mono text-emerald-400 font-bold">{taperLength} m</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="350"
                    step="10"
                    value={taperLength}
                    onChange={(e) => setTaperLength(parseInt(e.target.value))}
                    data-testid="ramp-slider-taper-len"
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>100m (Qısa)</span>
                    <span>220m (Standart)</span>
                    <span>350m (Geniş)</span>
                  </div>
                </div>

                {/* Slider 5: Mainline Speed */}
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">Magistral Axın Sürəti</span>
                    <span className="font-mono text-sky-400 font-bold">{mainlineSpeed} km/saat</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="130"
                    step="5"
                    value={mainlineSpeed}
                    onChange={(e) => setMainlineSpeed(parseInt(e.target.value))}
                    data-testid="ramp-slider-mainline-speed"
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>40 km/h</span>
                    <span>90 km/h</span>
                    <span>130 km/h</span>
                  </div>
                </div>

                {/* Slider 6: Preferred Mode Toggle */}
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl flex flex-col justify-between">
                  <span className="font-semibold text-white text-xs">Buraxılış Rejimi</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => setPreferredMode('ONE_CAR_PER_GREEN')}
                      data-testid="ramp-mode-one-car-btn"
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold border ${
                        preferredMode === 'ONE_CAR_PER_GREEN'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      1 Avt / Yaşıl (2.0s)
                    </button>
                    <button
                      onClick={() => setPreferredMode('TWO_CAR_PER_GREEN')}
                      data-testid="ramp-mode-two-car-btn"
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold border ${
                        preferredMode === 'TWO_CAR_PER_GREEN'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      2 Avt / Yaşıl (4.0s)
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Sikl vaxtı: {alineaResult.cycleLengthSeconds}s • Qırmızı: {alineaResult.redSeconds}s
                  </span>
                </div>
              </div>

              {/* Telemetry Output Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">
                    ALINEA Buraxılış Sürəti
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    {alineaResult.meteringRateVehPerHour}
                  </span>
                  <span className="text-[10px] text-slate-500 block">avt / saat</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">
                    Svetofor Sikl Müddəti (C)
                  </span>
                  <span className="text-xl font-bold text-sky-400">
                    {alineaResult.cycleLengthSeconds}s
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Yaşıl: {alineaResult.greenSeconds}s | Qırmızı: {alineaResult.redSeconds}s
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">
                    Taper Təhlükəsizlik Əmsalı
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      mergeResult.taperSafetyRatio < 0.85
                        ? 'text-rose-400'
                        : mergeResult.taperSafetyRatio < 1.15
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {mergeResult.taperSafetyRatio}x
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Tələb: {mergeResult.requiredTaperLengthMeters}m ({mergeResult.taperStatus})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">
                    Kritik Birləşmə İntervalı
                  </span>
                  <span className="text-xl font-bold text-indigo-400">
                    {mergeResult.criticalMergeGapSeconds}s
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Qəza riski: {mergeResult.mergeCollisionProbabilityPercent}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLES & STATUTORY SANCTIONS */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4" data-testid="ramp-vehicles-tab">
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-emerald-400" />
                  Avtomobil Presetləri və İXM Qaydaları üzrə İnzibati Məsuliyyət
                </h3>
                <p className="text-xs text-slate-400">
                  İnzibati Xətalar Məcəlləsinin 327.1, 327.2, 327.4 və 328.2 maddələri üzrə cərimələr və 30 gün
                  ərzində 50% endirim (İXM Maddə 38)
                </p>
              </div>

              {/* Vehicle Preset Selector Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_VEHICLE_PRESETS.map((veh) => {
                  const isSelected = selectedVehicle.id === veh.id;
                  return (
                    <div
                      key={veh.id}
                      data-testid={`ramp-vehicle-preset-${veh.id}`}
                      onClick={() => handleSelectVehicle(veh)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400">
                          {veh.plate}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                          {veh.classType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-2">{veh.model}</h4>
                      <p className="text-xs text-slate-400">{veh.driverCategory}</p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Kütlə</span>
                          <span className="font-semibold text-slate-200">{veh.curbWeightKg} kq</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Təcil (a)</span>
                          <span className="font-semibold text-emerald-400">{veh.accelerationRate} m/s²</span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Pozuntu:</span>
                        <span
                          className={`font-semibold ${
                            veh.defaultViolation === 'NONE' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {veh.defaultViolation === 'NONE'
                            ? 'Qaydalara Uyğundur'
                            : veh.defaultViolation.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sanctions & Fine Breakdown Stand */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-emerald-400">STATUTORY LEGAL SANCTION</span>
                    <h4 className="text-sm font-bold text-white">
                      Seçilmiş Avtomobil: {selectedVehicle.model} ({selectedVehicle.plate})
                    </h4>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Valyuta: {currency} ({RAMP_CURRENCY_SYMBOLS[currency]})
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {sanctionsResult.violationDescriptionAz}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Hüquqi Əsas: {sanctionsResult.legalArticle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Cərimə Balı</span>
                    <span className="text-lg font-bold text-amber-400">
                      {sanctionsResult.penaltyPoints} Bal
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Standart Cərimə Məbləği</span>
                    <span className="text-lg font-bold text-rose-400">
                      {sanctionsResult.fineAmountConverted} {RAMP_CURRENCY_SYMBOLS[currency]}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({sanctionsResult.fineAmountAzn} AZN)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">
                      30 Gün Ərzində 50% Endirimlə (İXM 38)
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {sanctionsResult.discountedFineConverted} {RAMP_CURRENCY_SYMBOLS[currency]}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({sanctionsResult.discountedFineAzn} AZN)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4" data-testid="ramp-checklist-tab">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-400" />
                    10-Nöqtəli Rampa Nəzarət və SCADA Texniki Təhlükəsizlik Auditi
                  </h3>
                  <p className="text-xs text-slate-400">
                    AZS 410, AZS 342, EN 12675 və TR 2516 standartları üzrə rampa avadanlıqlarının yoxlanışı
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAllChecklist(true)}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={() => toggleAllChecklist(false)}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Uyğunluq Səviyyəsi</span>
                  <span className="font-mono font-bold text-emerald-400">{checklistScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${checklistScore}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {MOCK_TECHNICAL_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      data-testid={`ramp-checklist-item-${item.id}`}
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                        isChecked
                          ? 'bg-slate-800/60 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">{item.titleAz}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.referenceNorm}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.requiredMetric}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-4" data-testid="ramp-exam-tab">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Rampa Nəzarət və Magistral Birləşmə Qaydaları üzrə Nəzəri İmtahan
                  </h3>
                  <p className="text-xs text-slate-400">
                    Yol Hərəkəti haqqında Qanun (Maddə 42) və İXM üzrə 10 sualdan ibarət interaktiv test
                  </p>
                </div>
                {examSubmitted && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      examScore.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    Nəticə: {examScore.correctCount} / {examScore.totalCount} ({examScore.percentage}%) -{' '}
                    {examScore.passed ? 'KEÇDİ' : 'KƏSİLDİ'}
                  </span>
                )}
              </div>

              {/* Exam Questions */}
              <div className="space-y-4">
                {MOCK_THEORETICAL_EXAM.map((q, idx) => {
                  const userAnswer = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white">
                          {idx + 1}. {q.questionAz}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {q.statutoryReference}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let optStyle =
                            'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850';
                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (isSelected && optIdx !== q.correctOptionIndex) {
                              optStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                            }
                          } else if (isSelected) {
                            optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                          }

                          return (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${optStyle}`}
                            >
                              <input
                                type="radio"
                                name={`exam-q-${q.id}`}
                                checked={isSelected}
                                onChange={() => handleAnswerOption(q.id, optIdx)}
                                className="text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                          <span className="text-emerald-400 font-bold block text-[11px]">İzah:</span>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit & Reset Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => {
                    setExamAnswers({});
                    setExamSubmitted(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Sıfırla
                </button>
                <button
                  onClick={() => setExamSubmitted(true)}
                  data-testid="ramp-exam-submit-btn"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg"
                >
                  Cavabları Təsdiqlə və Qiymətləndir
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4" data-testid="ramp-certificate-tab">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Rəsmi Elektron Rampa Buraxılış Vərəqəsi (RAMP-SAFE-AZ-2026)
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, AYNA və BDYP vahid dövlət elektron reyestri tərəfindən təsdiqlənmiş rəqəmsal sənəd
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(generatedCert.certificateNumber)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs"
                    title="Nömrəni Kopyala"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                  </button>
                  <button
                    onClick={() => window.print?.()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Printable Certificate Layout */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-5 text-slate-200 font-sans">
                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Zap className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                        Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Yerüstü Nəqliyyat Agentliyi (AYNA) & Baş Dövlət Yol Polisi İdarəsi (BDYP)
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {generatedCert.certificateNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tarix: {generatedCert.issueDate} • Bitmə: {generatedCert.validUntil}
                    </span>
                  </div>
                </div>

                {/* Status Badge Banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-emerald-400 block">
                      STATUS / TƏSDİQ NƏTİCƏSİ
                    </span>
                    <span className="text-sm font-bold text-white">
                      {generatedCert.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Xidmət Səviyyəsi (LOS)</span>
                    <span className="text-sm font-bold text-emerald-300">
                      Dərəcə {generatedCert.levelOfService}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Dövlət Qeydiyyat Nişanı</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {generatedCert.vehiclePlate}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Nəqliyyat Vasitəsinin Modeli</span>
                    <span className="font-semibold text-slate-200">{generatedCert.vehicleModel}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Stansiya Kodu & Adı</span>
                    <span className="font-semibold text-slate-200">{generatedCert.stationName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Magistral Dəhliz & Piket</span>
                    <span className="font-semibold text-slate-200">
                      {generatedCert.corridor} ({generatedCert.picketKm})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Təyin Edilmiş Buraxılış Sürəti</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {generatedCert.meteringRate} avt/saat
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Sikl & Yaşıl Müddət</span>
                    <span className="font-semibold text-slate-200">
                      Sikl: {generatedCert.cycleTimeSec}s • Yaşıl: {generatedCert.greenTimeSec}s
                    </span>
                  </div>
                </div>

                {/* Signatures & Security Hashes */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">SİMA RƏQƏMSAL İMZA UID</span>
                    <span className="font-mono text-emerald-400">{generatedCert.simaSignatureUid}</span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-1">
                      SHA-256 Checksum: {generatedCert.sha256Hash.slice(0, 32)}...
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Təsdiq PİN Kodu</span>
                    <span className="text-base font-mono font-bold text-amber-400">
                      {generatedCert.verificationPin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Generate New Certificate Form Stand */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-emerald-400 block">YENİ VƏRƏQƏ YARAT</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı</label>
                    <input
                      type="text"
                      value={certPlate}
                      onChange={(e) => setCertPlate(e.target.value)}
                      data-testid="ramp-cert-plate-input"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Avtomobil Modeli</label>
                    <input
                      type="text"
                      value={certVehicleModel}
                      onChange={(e) => setCertVehicleModel(e.target.value)}
                      data-testid="ramp-cert-model-input"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateCertificate}
                  data-testid="ramp-generate-cert-btn"
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow"
                >
                  Yeni RAMP-SAFE-AZ-2026 Vərəqəsi Tərtib Et
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4" data-testid="ramp-registry-tab">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-400" />
                    Vahid Açıq Rampa Buraxılış Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, AYNA və BDYP tərəfindən təsdiq olunmuş aktiv və arxiv buraxılış vərəqələri
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Nömrə, qeydiyyat nişanı və ya stansiya..."
                    data-testid="ramp-registry-search-input"
                    className="px-3 py-1.5 pl-8 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 w-64 focus:ring-1 focus:ring-emerald-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Registry Records Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Sənəd Nömrəsi</th>
                      <th className="p-3">Qeydiyyat Nişanı</th>
                      <th className="p-3">Stansiya & Dəhliz</th>
                      <th className="p-3">Buraxılış Sürəti</th>
                      <th className="p-3">LOS Dərəcə</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRegistry.map((cert) => (
                      <tr key={cert.certificateNumber} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          {cert.certificateNumber}
                        </td>
                        <td className="p-3 font-mono text-white">{cert.vehiclePlate}</td>
                        <td className="p-3 text-slate-300">
                          <span className="block font-semibold">{cert.stationName}</span>
                          <span className="text-[10px] text-slate-500">{cert.corridor}</span>
                        </td>
                        <td className="p-3 font-mono text-emerald-300">
                          {cert.meteringRate} avt/h
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                            {cert.levelOfService}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              cert.status === 'AUTHORIZED_CLEARED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : cert.status === 'METERED_ADVISORY'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {cert.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: ABOUT & STATUTORY REFERENCES */}
          {activeTab === 'about' && (
            <div className="space-y-4" data-testid="ramp-about-tab">
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-400" />
                  Qanunvericilik Aktları və Beynəlxalq Mühəndislik Standartları
                </h3>
                <p className="text-xs text-slate-400">
                  Magistral yollarda intellektual giriş rampalarının tənzimlənməsi üzrə normativ baza
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Azərbaycan Respublikasının Qanunvericiliyi
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 leading-relaxed list-disc list-inside">
                    <li>
                      <strong>«Avtomobil yolları haqqında» Qanun (Maddə 14, 21, 29, 34):</strong> Yollarda hərəkətin
                      təhlükəsizliyi, intellektual nəqliyyat sistemləri (İNS) və giriş rampalarının idarə edilməsi.
                    </li>
                    <li>
                      <strong>«Yol hərəkəti haqqında» Qanun (Maddə 42, 50):</strong> Sürətlənmə və birləşmə
                      zolaqlarında hərəkət qaydaları, əsas axındakı nəqliyyat vasitələrinə yol vermək öhdəliyi.
                    </li>
                    <li>
                      <strong>İnzibati Xətalar Məcəlləsi (İXM Maddə 327.2):</strong> Svetoforun qırmızı işığında
                      magistrala daxil olma - 80 AZN cərimə və 3 cərimə balı.
                    </li>
                    <li>
                      <strong>İXM Maddə 327.1:</strong> Birləşmə zolağında hərəkət üstünlüyünə əməl etməmə - 40 AZN cərimə.
                    </li>
                    <li>
                      <strong>İXM Maddə 38:</strong> Qərar rəsmi təqdim edildiyi gündən 30 gün ərzində cərimənin 50%
                      endirimlə ödənilməsi hüququ.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Beynəlxalq və Regional Standartlar
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 leading-relaxed list-disc list-inside">
                    <li>
                      <strong>EN 12675:</strong> Yol hərəkətini tənzimləyən kontrollerlərin funksional təhlükəsizlik
                      tələbləri və nasazlıq protokolları.
                    </li>
                    <li>
                      <strong>TR 2516 (Ramp Metering Specifications):</strong> ALINEA alqoritmi parametrləri,
                      induktiv ilgək kalibrasiyası və buraxılış dövriyyəsi.
                    </li>
                    <li>
                      <strong>AZS 410 / AZS 342:</strong> Azərbaycan Respublikasının yol nişanları, svetofor başlıqları
                      və optik parlaqlıq normativləri.
                    </li>
                    <li>
                      <strong>Highway Capacity Manual (HCM 2020):</strong> Freeway merge taper uzunluğu, sıxlıq (k) və
                      xidmət səviyyələri (LOS A - F) bölgüsü.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AAYDA / AYNA / BDYP SCADA Mərkəzi Serveri Aktivdir</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-400">RAMP-SAFE-AZ-2026-V1.0</span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RampSafeModal;
