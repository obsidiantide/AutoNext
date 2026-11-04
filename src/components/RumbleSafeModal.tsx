import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
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
  Compass,
  ArrowRight,
  Radio,
  Zap,
  Info,
  Clock,
  Award,
  Lock,
  Flame,
  Truck,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin,
  Waves,
  Vibrate,
  Bike,
  Snowflake,
} from 'lucide-react';
import {
  Currency,
  RumbleStripPattern,
  RumbleStripPlacement,
  TireType,
  DriverCognitiveState,
  PavementType,
  RumbleCorridorStation,
  RumbleVehiclePreset,
  RumbleCertificate,
  convertRumbleSafeCurrency,
  RUMBLE_SAFE_CURRENCY_SYMBOLS,
  calculateRumbleSafety,
  calculateRumbleSanctions,
  evaluateRumbleChecklist,
  evaluateRumbleExam,
  generateRumbleCertificate,
  searchRumbleRegistry,
} from '../utils/rumbleSafeCompliance';
import {
  MOCK_RUMBLE_CORRIDOR_STATIONS,
  MOCK_RUMBLE_VEHICLE_PRESETS,
  MOCK_RUMBLE_CHECKLIST_ITEMS,
  MOCK_RUMBLE_EXAM_QUESTIONS,
  MOCK_RUMBLE_CERTIFICATES,
} from '../data/mockRumbleSafeData';

export interface RumbleSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RumbleSafeModal: React.FC<RumbleSafeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'radar' | 'simulator' | 'presets' | 'checklist' | 'exam' | 'certificate' | 'registry'
  >('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<RumbleCorridorStation>(
    MOCK_RUMBLE_CORRIDOR_STATIONS[0]
  );
  const [selectedPreset, setSelectedPreset] = useState<RumbleVehiclePreset>(
    MOCK_RUMBLE_VEHICLE_PRESETS[0]
  );

  // Simulator parameters
  const [speedKmh, setSpeedKmh] = useState(90);
  const [pattern, setPattern] = useState<RumbleStripPattern>('MILLED_CYLINDRICAL');
  const [placement, setPlacement] = useState<RumbleStripPlacement>('SHOULDER_EDGE');
  const [millingDepthMm, setMillingDepthMm] = useState(12);
  const [millingWidthMm, setMillingWidthMm] = useState(380);
  const [pitchMm, setPitchMm] = useState(300);
  const [tireType, setTireType] = useState<TireType>('SUMMER_PASSENGER');
  const [driverState, setDriverState] = useState<DriverCognitiveState>('MILD_DROWSINESS');
  const [pavementType, setPavementType] = useState<PavementType>('SMA_STONE_MASTIC');
  const [hasBicycleGapPattern, setHasBicycleGapPattern] = useState(true);

  // Checklist state
  const [checkedIds, setCheckedIds] = useState<string[]>([
    MOCK_RUMBLE_CHECKLIST_ITEMS[0].id,
    MOCK_RUMBLE_CHECKLIST_ITEMS[1].id,
    MOCK_RUMBLE_CHECKLIST_ITEMS[2].id,
  ]);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);

  // Certificate state
  const [activeCert, setActiveCert] = useState<RumbleCertificate>(MOCK_RUMBLE_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [registryQuery, setRegistryQuery] = useState('');

  // Audio synthesizer chime for rumble sound
  const playRumbleChime = (frequency = 85, duration = 0.35) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio context might be restricted in test environments
    }
  };

  // Calculations
  const simulationResults = useMemo(() => {
    return calculateRumbleSafety({
      vehicleSpeedKmh: speedKmh,
      pattern,
      placement,
      millingDepthMm,
      millingWidthMm,
      pitchMm,
      tireType,
      driverState,
      pavementType,
      hasBicycleGapPattern,
    });
  }, [
    speedKmh,
    pattern,
    placement,
    millingDepthMm,
    millingWidthMm,
    pitchMm,
    tireType,
    driverState,
    pavementType,
    hasBicycleGapPattern,
  ]);

  const presetSanctions = useMemo(() => {
    return calculateRumbleSanctions(selectedPreset.violationType, currency);
  }, [selectedPreset.violationType, currency]);

  const checklistEvaluation = useMemo(() => {
    return evaluateRumbleChecklist(MOCK_RUMBLE_CHECKLIST_ITEMS, checkedIds);
  }, [checkedIds]);

  const examEvaluation = useMemo(() => {
    return evaluateRumbleExam(MOCK_RUMBLE_EXAM_QUESTIONS, examAnswers);
  }, [examAnswers]);

  const filteredStations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return MOCK_RUMBLE_CORRIDOR_STATIONS;
    return MOCK_RUMBLE_CORRIDOR_STATIONS.filter(
      (s) =>
        s.nameAz.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.routeNumber.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredRegistry = useMemo(() => {
    return searchRumbleRegistry(MOCK_RUMBLE_CERTIFICATES, registryQuery);
  }, [registryQuery]);

  if (!isOpen) return null;

  const handleSelectStation = (station: RumbleCorridorStation) => {
    setSelectedStation(station);
    setMillingDepthMm(station.millingDepthMm);
    setMillingWidthMm(station.millingWidthMm);
    setPitchMm(station.pitchMm);
    setPattern(station.pattern);
    setPlacement(station.placement);
    setHasBicycleGapPattern(station.bicycleGapPattern);
    setActiveTab('simulator');
  };

  const handleChecklistToggle = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCheckAll = () => {
    setCheckedIds(MOCK_RUMBLE_CHECKLIST_ITEMS.map((item) => item.id));
  };

  const handleResetChecklist = () => {
    setCheckedIds([]);
  };

  const handleExamOptionSelect = (qId: string, optIdx: number) => {
    if (isExamSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleExamSubmit = () => {
    setIsExamSubmitted(true);
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setIsExamSubmitted(false);
  };

  const handleAutoFillExam = () => {
    const answers: Record<string, number> = {};
    MOCK_RUMBLE_EXAM_QUESTIONS.forEach((q) => {
      answers[q.id] = q.correctIndex;
    });
    setExamAnswers(answers);
    setIsExamSubmitted(false);
  };

  const handleGenerateCertificate = () => {
    const newCert = generateRumbleCertificate({
      vehiclePlate: selectedPreset.plate,
      corridorCode: selectedStation.code,
      corridorName: selectedStation.nameAz,
      excitationFrequencyHz: simulationResults.excitationFrequencyHz,
      measuredDeltaDba: simulationResults.soundElevationDeltaDba,
      vibrationAccMs2: simulationResults.steeringVibrationAccMs2,
    });
    setActiveCert(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rumble-safe-modal-title"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AAYDA • AYNA • BDYP
                </span>
                <span className="text-xs font-mono text-slate-400">RUMBLE-SAFE-AZ-2026</span>
              </div>
              <h2 id="rumble-safe-modal-title" className="text-lg font-bold text-slate-100 tracking-tight">
                Magistral Səs-Küy və Titrəyiş Zolaqları Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    currency === curr
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'radar', label: 'Strateji Zolaqlar Radarı', icon: Radio },
            { id: 'simulator', label: 'Akustik & Taktil Simulyator', icon: Sliders },
            { id: 'presets', label: 'Nəqliyyat & Cərimələr', icon: Car },
            { id: 'checklist', label: '10 Maddəlik Standart', icon: CheckCircle },
            { id: 'exam', label: 'İmtahan Simulyatoru', icon: Award },
            { id: 'certificate', label: 'Elektron AAYDA Sertifikatı', icon: FileText },
            { id: 'registry', label: 'İctimai Reyestr', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/60">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                    <Radio className="w-5 h-5 text-amber-400" />
                    <span>Azərbaycan Magistral Şəbəkəsində Frezlənmiş Səs-Küy Zolaqları</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və BDYP tərəfindən nəzarət olunan 6 əsas magistral dəhlizdə səs-küy profillərinin monitorinqi
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Dəhliz və ya stansiya axtar..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((station) => {
                  const isSelected = selectedStation.id === station.id;
                  return (
                    <div
                      key={station.id}
                      onClick={() => handleSelectStation(station)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {station.routeNumber} • {station.picketKm}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          {station.stationStatus === 'HIGH_ROR_INCIDENT_ZONE'
                            ? 'Yüksək Qəza Riski'
                            : 'Normal İstismar'}
                        </span>
                      </div>

                      <h4 className="font-semibold text-sm text-slate-100 mb-1">{station.nameAz}</h4>
                      <p className="text-xs text-slate-400 mb-3">{station.corridor}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 mb-3">
                        <div>
                          <span className="text-slate-500 block">Dərinlik / En:</span>
                          <span className="font-semibold">{station.millingDepthMm} mm / {station.millingWidthMm} mm</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Addım (Pitch):</span>
                          <span className="font-semibold">{station.pitchMm} mm</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Yerləşmə:</span>
                          <span className="font-semibold">
                            {station.placement === 'SHOULDER_EDGE'
                              ? 'Çiyin Zolağı'
                              : station.placement === 'CENTERLINE_MEDIAN'
                              ? 'Mərkəzi Ayrıcı'
                              : 'Eninə Yanaşma'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">ROR Azalması:</span>
                          <span className="font-semibold text-emerald-400">-{station.annualRorReductionPct}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-amber-400 font-medium pt-1">
                        <span className="flex items-center space-x-1">
                          <Bike className="w-3.5 h-3.5" />
                          <span>{station.bicycleGapPattern ? 'Velosiped Boşluğu Var' : 'Boşluqsuz'}</span>
                        </span>
                        <span className="flex items-center space-x-1 hover:underline">
                          <span>Simulyatora Yüklə</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Həyəcanlama Tezliyi</span>
                    <Waves className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xl font-bold text-cyan-300 font-mono">
                    {simulationResults.excitationFrequencyHz} <span className="text-xs text-slate-400 font-normal">Hz</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">f = v / p düsturu üzrə</div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Akustik Səs Artımı (Δ)</span>
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-bold text-amber-300 font-mono">
                    +{simulationResults.soundElevationDeltaDba} <span className="text-xs text-slate-400 font-normal">dBA</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Kabin: {simulationResults.totalCabinNoiseDba} dBA</div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Sükan Titrəyiş Təcili</span>
                    <Vibrate className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xl font-bold text-rose-300 font-mono">
                    {simulationResults.steeringVibrationAccMs2} <span className="text-xs text-slate-400 font-normal">m/s²</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">avib ≥ 1.0 m/s² normativ</div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Qəza Riskinin Azalması</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold text-emerald-300 font-mono">
                    -{simulationResults.rorCrashReductionPct}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Yoldan çıxma müdafiəsi</div>
                </div>
              </div>

              {/* Animated 2D SVG Motorway Cross-Section */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>2D Dinamik Səs-Küy Zolağı və Asfalt Profili SCADA Telemetriyası</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => playRumbleChime(simulationResults.excitationFrequencyHz)}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs hover:bg-amber-500/30 transition-colors"
                      title="Səs-küy zolağının kabin səsini dinlə"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Akustik Səsi Sına</span>
                    </button>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {selectedStation.code}
                    </span>
                  </div>
                </div>

                <div className="h-44 w-full flex items-center justify-center">
                  <svg viewBox="0 0 800 200" className="w-full h-full">
                    {/* Background Highway Asphalt */}
                    <rect x="0" y="80" width="800" height="120" fill="#1e293b" />

                    {/* Lane Marking: Solid / Broken Line */}
                    <line
                      x1="0"
                      y1="82"
                      x2="800"
                      y2="82"
                      stroke="#f8fafc"
                      strokeWidth="4"
                      strokeDasharray={placement === 'CENTERLINE_MEDIAN' ? '16, 12' : 'none'}
                    />

                    {/* Rumble Strip Recessed Indentations */}
                    {Array.from({ length: 24 }).map((_, i) => {
                      const cx = 30 + i * 32;
                      const depthScaled = Math.min(22, (millingDepthMm / 16) * 20);
                      const widthScaled = Math.min(28, (millingWidthMm / 500) * 26);

                      return (
                        <g key={i}>
                          {pattern === 'MILLED_SINUSOIDAL' ? (
                            <path
                              d={`M ${cx - widthScaled / 2} 90 Q ${cx} ${90 + depthScaled} ${cx + widthScaled / 2} 90`}
                              fill="none"
                              stroke="#0f172a"
                              strokeWidth="3.5"
                            />
                          ) : pattern === 'RAISED_THERMOPLASTIC' ? (
                            <rect
                              x={cx - widthScaled / 2}
                              y={90 - depthScaled * 0.4}
                              width={widthScaled}
                              height={depthScaled * 0.4}
                              fill="#f59e0b"
                              rx="2"
                            />
                          ) : (
                            <rect
                              x={cx - widthScaled / 2}
                              y={90}
                              width={widthScaled}
                              height={depthScaled}
                              fill="#0f172a"
                              rx="3"
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Vehicle Wheel Traversing the Rumble Strip */}
                    <g transform="translate(420, 35)">
                      {/* Tire */}
                      <circle cx="40" cy="50" r="32" fill="#090d16" stroke="#475569" strokeWidth="4" />
                      <circle cx="40" cy="50" r="18" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                      <circle cx="40" cy="50" r="6" fill="#f8fafc" />

                      {/* Vibration Shock Waves */}
                      <path
                        d="M 10 40 Q 5 50 10 60 M -2 30 Q -10 50 -2 70"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                        fill="none"
                        className="animate-pulse"
                      />
                      <path
                        d="M 70 40 Q 75 50 70 60 M 82 30 Q 90 50 82 70"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                        fill="none"
                        className="animate-pulse"
                      />
                    </g>

                    {/* Acoustic Wave Indicators */}
                    <g transform="translate(435, 10)">
                      <circle cx="25" cy="15" r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8" />
                      <circle cx="25" cy="15" r="24" fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.5" />
                      <text x="25" y="-5" fill="#f59e0b" fontSize="11" textAnchor="middle" fontWeight="bold">
                        +{simulationResults.soundElevationDeltaDba} dBA
                      </text>
                    </g>

                    {/* Bicycle Lane Clearance Gap Indication */}
                    {hasBicycleGapPattern && (
                      <g transform="translate(680, 140)">
                        <rect x="0" y="0" width="100" height="28" fill="#047857" opacity="0.25" rx="4" />
                        <text x="50" y="18" fill="#34d399" fontSize="10" textAnchor="middle" fontWeight="bold">
                          3.6m Velosiped Keçidi
                        </text>
                      </g>
                    )}

                    {/* HUD Overlay Text */}
                    <text x="20" y="180" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                      V = {speedKmh} km/h | Dərinlik = {millingDepthMm} mm | Səs Artımı = +{simulationResults.soundElevationDeltaDba} dBA | Titrəyiş = {simulationResults.steeringVibrationAccMs2} m/s²
                    </text>
                  </svg>
                </div>
              </div>

              {/* Interactive Control Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-800/40 p-5 rounded-xl border border-slate-700/60">
                {/* Vehicle Speed */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Nəqliyyatın Sürəti</span>
                    <span className="text-amber-400 font-bold font-mono">{speedKmh} km/saat</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="140"
                    step="5"
                    value={speedKmh}
                    onChange={(e) => setSpeedKmh(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">Magistral hədd: 30 - 140 km/h</span>
                </div>

                {/* Milling Depth */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Frezlənmə Dərinliyi</span>
                    <span className="text-amber-400 font-bold font-mono">{millingDepthMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="16"
                    step="1"
                    value={millingDepthMm}
                    onChange={(e) => setMillingDepthMm(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">FHWA / AAYDA standart: 10 - 13 mm</span>
                </div>

                {/* Milling Width */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Zolaq Eni</span>
                    <span className="text-amber-400 font-bold font-mono">{millingWidthMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="500"
                    step="10"
                    value={millingWidthMm}
                    onChange={(e) => setMillingWidthMm(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">Standart: 300 - 400 mm</span>
                </div>

                {/* Pitch / Longitudinal Spacing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Addım (Pitch / Məsafə)</span>
                    <span className="text-amber-400 font-bold font-mono">{pitchMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1200"
                    step="25"
                    value={pitchMm}
                    onChange={(e) => setPitchMm(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">Standart longitudinal addım: 300 mm</span>
                </div>

                {/* Pattern Type */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-300 font-medium block">Frezlənmə Növü</span>
                  <select
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value as RumbleStripPattern)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="MILLED_CYLINDRICAL">Klassik Silindrik Frez (AAYDA Əsas)</option>
                    <option value="MILLED_SINUSOIDAL">Sinusoidal "Mumble" (Səssiz Yaşayış)</option>
                    <option value="RAISED_THERMOPLASTIC">Qabarıq Termoplastik Qabırğalar</option>
                    <option value="ROLLED_ASPHALT">Qaynar Asfalta Təzyiqlə Basılmış</option>
                  </select>
                </div>

                {/* Placement */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-300 font-medium block">Quraşdırılma Yeri</span>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as RumbleStripPlacement)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="SHOULDER_EDGE">Sağ Çiyin Zolağı (Yoldan Çıxma)</option>
                    <option value="CENTERLINE_MEDIAN">Mərkəzi Ayrıcı (Ötmə / Qarşı Hərəkət)</option>
                    <option value="TRANSVERSE_APPROACH">Eninə Yanaşma (Döngə / Ödəniş)</option>
                  </select>
                </div>

                {/* Driver Cognitive State */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-300 font-medium block">Sürücünün Psixofizioloji Vəziyyəti</span>
                  <select
                    value={driverState}
                    onChange={(e) => setDriverState(e.target.value as DriverCognitiveState)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALERT_NORMAL">Ayıq və Diqqətli (Normal 0.9s)</option>
                    <option value="MILD_DROWSINESS">Yüngül Yorğunluq və Mürgü (1.6s)</option>
                    <option value="SEVERE_FATIGUE_MICRO_SLEEP">Dərin Yuxulama / Mikro-yuxu (2.4s)</option>
                    <option value="DISTRACTED_PHONE">Smartfona Yayınma (2.0s)</option>
                  </select>
                </div>

                {/* Tire Type */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-300 font-medium block">Təkər Növü</span>
                  <select
                    value={tireType}
                    onChange={(e) => setTireType(e.target.value as TireType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="SUMMER_PASSENGER">Yay Təkəri (Minik)</option>
                    <option value="WINTER_STUDLESS">Qış Təkəri (Lamelli)</option>
                    <option value="COMMERCIAL_TRUCK_RADIAL">Radial Yük Təkəri (TIR / Bus)</option>
                    <option value="LOW_PROFILE_SPORT">Alçaq Profilli İdman Təkəri</option>
                  </select>
                </div>

                {/* Bicycle Gap Pattern Toggle */}
                <div className="flex items-center space-x-3 pt-5">
                  <input
                    type="checkbox"
                    id="bicycleGapToggle"
                    checked={hasBicycleGapPattern}
                    onChange={(e) => setHasBicycleGapPattern(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="bicycleGapToggle" className="text-xs text-slate-300 cursor-pointer">
                    3.6m Qanuni Velosiped Keçid Boşluqları (Cycle Gap)
                  </label>
                </div>
              </div>

              {/* Performance & Safety Outcome Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Oyanma & Reaksiya Müddəti</span>
                  <div className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{simulationResults.driverReactionTimeSec} saniyə</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Bərpa məsafəsi: <strong className="text-slate-200">{simulationResults.recoveryDistanceM} metr</strong>
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Velosiped & Moto Təhlükəsizliyi</span>
                  <div className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <Bike className="w-4 h-4 text-emerald-400" />
                    <span>{simulationResults.bicycleSafetyScorePct}% Qoruma</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {hasBicycleGapPattern ? 'İkitəkərli vasitələr sərbəst keçə bilir' : 'Boşluqsuz kəsintisiz frez'}
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block mb-1">Qış Qar Kotanı Dayanıqlığı</span>
                  <div className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <Snowflake className="w-4 h-4 text-cyan-400" />
                    <span>{simulationResults.snowplowDurabilityScorePct}% Dayanıqlıq</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {pattern === 'RAISED_THERMOPLASTIC'
                      ? 'Kotan qopara bilər (Batıq frez tövsiyə olunur)'
                      : 'Batıq profil kotandan zədələnmir'}
                  </p>
                </div>
              </div>

              {/* Recommendations Box */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold mb-2">
                  <Info className="w-4 h-4" />
                  <span>AAYDA Mühəndis Nəzarətinin Qanuni Tövsiyələri</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {simulationResults.recommendationsAz.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateCertificate}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>AAYDA Sertifikatı Tərtib Et</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS & FINES */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-100 mb-1 flex items-center space-x-2">
                  <Car className="w-5 h-5 text-amber-400" />
                  <span>Nəqliyyat Presetləri və İnzibati Xətalar Məcəlləsi (İXM) Sanksiyaları</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Fərqli asqı və təkər tiplərinə malik nəqliyyat vasitələrinin frezlənmiş zolaqlarda davranışı və qanuni cərimələr
                </p>
              </div>

              {/* Vehicle Preset Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_RUMBLE_VEHICLE_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow'
                          : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                          {preset.plate}
                        </span>
                        <span className="text-[10px] text-slate-400">{preset.defaultSpeedKmh} km/h</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100">{preset.model}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Fon Səsi: {preset.baselineCabinNoiseDba} dBA • Təkər: {preset.tireType}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Statutory Fines Stand */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-amber-400 font-mono">
                      {presetSanctions.articleCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                      {presetSanctions.descriptionAz}
                    </h4>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                    {presetSanctions.penaltyPoints > 0 ? `${presetSanctions.penaltyPoints} Bal` : 'Balsız'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Əsas Cərimə:</span>
                    <span className="text-base font-bold text-slate-200">
                      {presetSanctions.baseFineAzn} {RUMBLE_SAFE_CURRENCY_SYMBOLS[currency]}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">50% Güzəştli Cərimə (İXM 38):</span>
                    <span className="text-base font-bold text-emerald-400">
                      {presetSanctions.discountedFineAzn} {RUMBLE_SAFE_CURRENCY_SYMBOLS[currency]}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">AAYDA Yol Bərpası (MM 1108):</span>
                    <span className="text-base font-bold text-amber-400">
                      {presetSanctions.civilRestitutionAzn} {RUMBLE_SAFE_CURRENCY_SYMBOLS[currency]}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Cəmi Ödəniləcək:</span>
                    <span className="text-base font-bold text-slate-100">
                      {presetSanctions.totalPayableAzn} {RUMBLE_SAFE_CURRENCY_SYMBOLS[currency]}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-900 p-3 rounded-lg border border-slate-800/80">
                  Qeyd: AR İnzibati Xətalar Məcəlləsinin 38-ci maddəsinə uyğun olaraq, elektron qərar çıxarıldığı gündən
                  30 gün müddətində cərimə ödənildikdə 50 faiz məbləğində qanuni endirim qüvvədə qalır.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                    <span>AAYDA & FHWA 10 Maddəlik Standart Yoxlanışı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Səs-küy zolaqlarının texniki həndəsi ölçüləri, akustik səviyyəsi və velosiped təhlükəsizliyi
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCheckAll}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs hover:bg-emerald-600/30 transition-colors"
                  >
                    Hamısını Təsdiqlə
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs hover:bg-slate-700 transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Standart Uyğunluq İndeksi</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {checklistEvaluation.checkedCount} / {checklistEvaluation.totalCount} ({checklistEvaluation.complianceScorePct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${checklistEvaluation.complianceScorePct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {MOCK_RUMBLE_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checkedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleChecklistToggle(item.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all flex items-start space-x-3 ${
                        isChecked
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-semibold text-slate-100">{item.titleAz}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.standardRef}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{item.descriptionAz}</p>
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
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>Magistral Səs-Küy Zolaqları üzrə Rəsmi Nəzəri İmtahan</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, AYNA və BDYP tərəfindən təsdiq olunmuş 10 sualdan ibarət sertifikatlaşdırma sınağı
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAutoFillExam}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-amber-300 border border-amber-500/30 text-xs hover:bg-slate-700 transition-colors"
                  >
                    Avto-doldur
                  </button>
                  <button
                    onClick={handleResetExam}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs hover:bg-slate-700 transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {isExamSubmitted && (
                <div
                  className={`p-4 rounded-xl border ${
                    examEvaluation.passed
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      {examEvaluation.passed ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                          <span>Təbriklər! İmtahandan Müvəffəqiyyətlə Keçdiniz.</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-rose-400" />
                          <span>İmtahandan kəsildiniz. Keçid balı: 80%</span>
                        </>
                      )}
                    </div>
                    <span className="font-mono text-base font-bold">
                      {examEvaluation.score} / {examEvaluation.totalQuestions} ({examEvaluation.percentage}%)
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_RUMBLE_EXAM_QUESTIONS.map((q, idx) => {
                  const userAnswer = examAnswers[q.id];
                  const isCorrect = isExamSubmitted && userAnswer === q.correctIndex;
                  const isWrong = isExamSubmitted && userAnswer !== undefined && userAnswer !== q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border ${
                        isExamSubmitted
                          ? isCorrect
                            ? 'border-emerald-500/40 bg-emerald-500/5'
                            : isWrong
                            ? 'border-rose-500/40 bg-rose-500/5'
                            : 'border-slate-800 bg-slate-800/40'
                          : 'border-slate-800 bg-slate-800/40'
                      }`}
                    >
                      <h4 className="text-xs font-semibold text-slate-100 mb-3 flex items-start space-x-2">
                        <span className="text-amber-400 font-mono">#{idx + 1}.</span>
                        <span>{q.questionAz}</span>
                      </h4>

                      <div className="space-y-2">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleExamOptionSelect(q.id, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500'
                                  : 'bg-slate-900/60 text-slate-300 border border-slate-800 hover:bg-slate-800/80'
                              }`}
                            >
                              <span>{opt}</span>
                              {isExamSubmitted && optIdx === q.correctIndex && (
                                <Check className="w-4 h-4 text-emerald-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                          <p>
                            <strong className="text-slate-300">İzah:</strong> {q.explanationAz}
                          </p>
                          <p className="font-mono text-slate-500">
                            Qanuni istinad: {q.legalCitation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isExamSubmitted && (
                <div className="flex justify-end">
                  <button
                    onClick={handleExamSubmit}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all"
                  >
                    Cavabları Təsdiqlə və Qiymətləndir
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span>Rəsmi Elektron RUMBLE-SAFE-AZ-2026 Sertifikatı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    SİMA rəqəmsal imzası və SHA-256 kriptoqrafik nəzarət ştrixi ilə təsdiqlənmiş rəsmi akt
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyCode(activeCert.certificateId)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs hover:bg-slate-700 transition-colors"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Kopyalandı' : 'ID Kopyala'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs hover:bg-amber-500 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Printable Certificate Template */}
              <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="text-center space-y-1 border-b border-slate-800 pb-5">
                  <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
                    Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA) & BDYP
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-100 uppercase tracking-wide">
                    Magistral Səs-Küy Zolağı Texniki Uyğunluq Sertifikatı
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    Sertifikat №: <span className="text-amber-300 font-bold">{activeCert.certificateId}</span>
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Qeydiyyat Nişanı:</span>
                      <span className="text-sm font-bold text-slate-100 font-mono">{activeCert.vehiclePlate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Magistral Dəhliz:</span>
                      <span className="font-semibold text-slate-200">{activeCert.corridorName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Dəhliz Kodu:</span>
                      <span className="font-mono text-slate-300">{activeCert.corridorCode}</span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Həyəcanlama Tezliyi:</span>
                      <span className="text-sm font-bold text-cyan-300 font-mono">
                        {activeCert.excitationFrequencyHz} Hz
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Kabin Səs Artımı (ΔdBA):</span>
                      <span className="text-sm font-bold text-amber-300 font-mono">
                        +{activeCert.measuredDeltaDba} dBA
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sükan Titrəyiş Təcili:</span>
                      <span className="text-sm font-bold text-rose-300 font-mono">
                        {activeCert.vibrationAccMs2} m/s²
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Signature & Validation Footer */}
                <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>SİMA UID: <strong className="font-mono text-slate-200">{activeCert.simaDigitalUid}</strong></span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      SHA-256: {activeCert.sha256Checksum}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Verilmə: {activeCert.issueDate} • Bitmə: {activeCert.expiryDate}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Təsdiq Edən İdarə:</span>
                    <span className="font-semibold text-slate-200 text-xs block">{activeCert.authorizedInspector}</span>
                    <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      STATUS: AKTİV
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
                    <Search className="w-5 h-5 text-amber-400" />
                    <span>AAYDA Vahid İctimai Axtarış Reyestri</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rəsmi qeydiyyatdan keçmiş səs-küy zolağı sertifikatlarının yoxlanılması
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registryQuery}
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    placeholder="Sertifikat ID və ya Nömrə ilə axtar..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Sertifikat ID</th>
                      <th className="p-3">Dövlət Nömrə Nişanı</th>
                      <th className="p-3">Dəhliz</th>
                      <th className="p-3">Tezlik</th>
                      <th className="p-3">Səs Artımı</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredRegistry.map((cert) => (
                      <tr key={cert.certificateId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-400">{cert.certificateId}</td>
                        <td className="p-3 font-mono font-semibold text-slate-100">{cert.vehiclePlate}</td>
                        <td className="p-3 text-slate-300">{cert.corridorName}</td>
                        <td className="p-3 font-mono text-cyan-300">{cert.excitationFrequencyHz} Hz</td>
                        <td className="p-3 font-mono text-amber-300">+{cert.measuredDeltaDba} dBA</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {cert.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setActiveCert(cert);
                              setActiveTab('certificate');
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs transition-colors"
                          >
                            Bax
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>EN 1436 • FHWA T 5040.39 • AZS 410 Sertifikatlaşdırılmışdır</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
