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
  Eye,
  SunMedium,
  Wind,
} from 'lucide-react';
import {
  Currency,
  GlareCorridorStation,
  GlareVehiclePreset,
  GlareCertificate,
  convertGlareSafeCurrency,
  GLARE_SAFE_CURRENCY_SYMBOLS,
  calculateGlareShielding,
  calculateStatutoryGlareSanctions,
  evaluateGlareChecklist,
  evaluateGlareExam,
  generateGlareCertificate,
  searchGlareRegistry,
} from '../utils/glareSafeCompliance';
import {
  MOCK_GLARE_CORRIDOR_STATIONS,
  MOCK_GLARE_VEHICLE_PRESETS,
  MOCK_GLARE_CHECKLIST_ITEMS,
  MOCK_GLARE_EXAM_QUESTIONS,
  MOCK_GLARE_CERTIFICATES,
} from '../data/mockGlareSafeData';

export interface GlareSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlareSafeModal: React.FC<GlareSafeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'radar' | 'simulator' | 'presets' | 'checklist' | 'exam' | 'certificate' | 'registry'
  >('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<GlareCorridorStation>(
    MOCK_GLARE_CORRIDOR_STATIONS[0]
  );
  const [selectedPreset, setSelectedPreset] = useState<GlareVehiclePreset>(
    MOCK_GLARE_VEHICLE_PRESETS[0]
  );

  // Simulator parameters
  const [speedKmh, setSpeedKmh] = useState(110);
  const [luminousIntensityCd, setLuminousIntensityCd] = useState(85000);
  const [distanceM, setDistanceM] = useState(60);
  const [lateralSeparationM, setLateralSeparationM] = useState(4.5);
  const [driverEyeHeightMm, setDriverEyeHeightMm] = useState(1200);
  const [screenHeightMm, setScreenHeightMm] = useState(1900);
  const [bladeSpacingMm, setBladeSpacingMm] = useState(700);
  const [bladeAngleDeg, setBladeAngleDeg] = useState(20);
  const [ambientLux, setAmbientLux] = useState(0.15);
  const [windGustKmh, setWindGustKmh] = useState(40);
  const [bladeDefectPct, setBladeDefectPct] = useState(0);

  // Checklist state
  const [checkedIds, setCheckedIds] = useState<string[]>([
    MOCK_GLARE_CHECKLIST_ITEMS[0].id,
    MOCK_GLARE_CHECKLIST_ITEMS[1].id,
    MOCK_GLARE_CHECKLIST_ITEMS[2].id,
  ]);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);

  // Certificate state
  const [activeCert, setActiveCert] = useState<GlareCertificate>(MOCK_GLARE_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [registryQuery, setRegistryQuery] = useState('');

  // Audio synthesizer chime
  const playScadaChime = (frequency = 660, type: OscillatorType = 'sine', duration = 0.18) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio context might be restricted in test environments
    }
  };

  // Live simulation calculations
  const simulationResult = useMemo(() => {
    return calculateGlareShielding({
      vehicleSpeedKmh: speedKmh,
      oncomingLuminousIntensityCd: luminousIntensityCd,
      oncomingDistanceM: distanceM,
      lateralSeparationM,
      driverEyeHeightMm,
      screenHeightMm,
      bladeSpacingMm,
      bladeAngleDeg,
      ambientIlluminanceLux: ambientLux,
      windGustSpeedKmh: windGustKmh,
      bladeDefectMissingPct: bladeDefectPct,
    });
  }, [
    speedKmh,
    luminousIntensityCd,
    distanceM,
    lateralSeparationM,
    driverEyeHeightMm,
    screenHeightMm,
    bladeSpacingMm,
    bladeAngleDeg,
    ambientLux,
    windGustKmh,
    bladeDefectPct,
  ]);

  // Sanctions calculations
  const sanctionResult = useMemo(() => {
    return calculateStatutoryGlareSanctions(selectedPreset);
  }, [selectedPreset]);

  // Checklist evaluation
  const checklistResult = useMemo(() => {
    return evaluateGlareChecklist(MOCK_GLARE_CHECKLIST_ITEMS, checkedIds);
  }, [checkedIds]);

  // Exam evaluation
  const examResult = useMemo(() => {
    return evaluateGlareExam(MOCK_GLARE_EXAM_QUESTIONS, examAnswers);
  }, [examAnswers]);

  // Filtered stations in radar tab
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_GLARE_CORRIDOR_STATIONS;
    const q = searchQuery.toLowerCase();
    return MOCK_GLARE_CORRIDOR_STATIONS.filter(
      (s) =>
        s.nameAz.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.routeNumber.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered registry certificates
  const filteredCertificates = useMemo(() => {
    return searchGlareRegistry(MOCK_GLARE_CERTIFICATES, registryQuery);
  }, [registryQuery]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleChecklist = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCheckAll = () => {
    setCheckedIds(MOCK_GLARE_CHECKLIST_ITEMS.map((item) => item.id));
  };

  const handleResetChecklist = () => {
    setCheckedIds([]);
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    setExamAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleAutoFillExam = () => {
    const perfect: Record<string, number> = {};
    MOCK_GLARE_EXAM_QUESTIONS.forEach((q) => {
      perfect[q.id] = q.correctIndex;
    });
    setExamAnswers(perfect);
    setIsExamSubmitted(true);
  };

  const handleGenerateCertificate = () => {
    const newCert = generateGlareCertificate(
      selectedPreset.plate,
      selectedStation,
      simulationResult.screeningEffectivenessPct,
      simulationResult.deBoerComfortIndex,
      simulationResult.veilingLuminanceCdM2
    );
    setActiveCert(newCert);
    setActiveTab('certificate');
    playScadaChime(880, 'triangle', 0.25);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header Strip */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/60 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <SunMedium className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  AAYDA & BDYP Magistral Anti-Glare Çəpər və Optik Gözqamaşdırma Portalı
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                    GLARE-SAFE-AZ-2026
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                EN 12676-1/2 Qanuni Standartları, Mərkəzi Ayrıcı Zolaq Daldalanma Bucaqları və Stiles-Holladay SCADA Telemetriyası
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 p-1 border border-slate-700 rounded-lg text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    currency === curr
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto text-xs font-medium scrollbar-thin">
          {[
            { id: 'radar', label: 'Stansiyalar Radarı', icon: Radio },
            { id: 'simulator', label: 'SCADA Simulyator', icon: Sliders },
            { id: 'presets', label: 'Nəqliyyat & İXM', icon: Car },
            { id: 'checklist', label: '10-Bəndlik Standart', icon: CheckCircle },
            { id: 'exam', label: 'İmtahan Testi', icon: Award },
            { id: 'certificate', label: 'Elektron Sertifikat', icon: FileText },
            { id: 'registry', label: 'Vahid Reyestr', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  playScadaChime(520, 'sine', 0.1);
                }}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-all ${
                  isSelected
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-slate-900 to-slate-950">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>AAYDA Magistral Ayrıcı Zolaq Anti-Glare Çəpər Monitorinq Şəbəkəsi (6 Strateji Nöqtə)</span>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Stansiya və ya magistral axtar..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((st) => {
                  const isSelected = selectedStation.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStation(st);
                        setScreenHeightMm(st.screenHeightMm);
                        setBladeSpacingMm(st.bladeSpacingMm);
                        setBladeAngleDeg(st.bladeAngleDeg);
                        playScadaChime(620, 'sine', 0.12);
                      }}
                      className={`cursor-pointer p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                          : 'bg-slate-850/60 border-slate-750 hover:border-slate-650 hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                            {st.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              st.stationStatus === 'ONLINE_NOMINAL'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : st.stationStatus === 'HIGH_GLARE_ALERT'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {st.stationStatus}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug mb-1">
                          {st.nameAz}
                        </h4>
                        <p className="text-xs text-slate-400 mb-3">{st.corridor}</p>

                        <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-slate-800 mb-3">
                          <div>
                            <span className="text-slate-500">Piket:</span>{' '}
                            <span className="font-mono text-slate-200">{st.picketKm}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Külək Sinfi:</span>{' '}
                            <span className="font-semibold text-emerald-300">{st.windResistanceClass}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Pərdə Hünd.:</span>{' '}
                            <span className="font-mono text-slate-200">{st.screenHeightMm} mm</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Meyil Bucağı:</span>{' '}
                            <span className="font-mono text-slate-200">{st.bladeAngleDeg}°</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Addım Aralığı:</span>{' '}
                            <span className="font-mono text-slate-200">{st.bladeSpacingMm} mm</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Gecə Lüksü:</span>{' '}
                            <span className="font-mono text-slate-200">{st.measuredAmbientLux} lx</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500">
                          Gündəlik Trafik: {st.dailyTrafficVehicles.toLocaleString()} maşın
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStation(st);
                            setScreenHeightMm(st.screenHeightMm);
                            setBladeSpacingMm(st.bladeSpacingMm);
                            setBladeAngleDeg(st.bladeAngleDeg);
                            setActiveTab('simulator');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition"
                        >
                          Simulyatora Keç <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-5">
              {/* Top Banner KPI strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-750">
                  <div className="text-[11px] text-slate-400">Optik Daldalanma Dərəcəsi</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    {simulationResult.screeningEffectivenessPct}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">EN 12676-1 daldalanma</div>
                </div>

                <div className="bg-slate-850 p-3 rounded-xl border border-slate-750">
                  <div className="text-[11px] text-slate-400">De Boer Komfort Şkalası</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">
                    {simulationResult.deBoerComfortIndex} / 9.0
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {simulationResult.deBoerComfortIndex >= 7
                      ? 'Qənaətbəxş'
                      : simulationResult.deBoerComfortIndex >= 5
                      ? 'Yolverilən'
                      : 'Narahatedici/Təhlükəli'}
                  </div>
                </div>

                <div className="bg-slate-850 p-3 rounded-xl border border-slate-750">
                  <div className="text-[11px] text-slate-400">Pərdələyici Parıltı (Lv)</div>
                  <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
                    {simulationResult.veilingLuminanceCdM2} <span className="text-xs text-slate-400">cd/m²</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Stiles-Holladay düsturu</div>
                </div>

                <div className="bg-slate-850 p-3 rounded-xl border border-slate-750">
                  <div className="text-[11px] text-slate-400">Kor Sürmə Məsafəsi</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      simulationResult.blindDrivingDistanceM > 35 ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {simulationResult.blindDrivingDistanceM} m
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Gözün bərpası: {simulationResult.visualRecoveryTimeSec} san
                  </div>
                </div>
              </div>

              {/* 2D SVG Motorway Cross-Section Visualization */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    2D Dinamik Optik Ayrıcı Zolaq və Fara Kəsimi SVG Modeli ({selectedStation.code})
                  </span>
                  <button
                    type="button"
                    onClick={() => playScadaChime(740, 'triangle', 0.2)}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 border border-slate-700"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Səs Siqnalı
                  </button>
                </div>

                <svg viewBox="0 0 800 240" className="w-full h-52 bg-slate-900/90 rounded-lg border border-slate-800">
                  {/* Sky/night background gradient */}
                  <defs>
                    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#020617" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="headlightBeam" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                      <stop offset="60%" stopColor="#facc15" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="shieldCone" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#064e3b" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  <rect x="0" y="0" width="800" height="240" fill="url(#nightSky)" />

                  {/* Road Asphalt */}
                  <rect x="0" y="180" width="800" height="60" fill="#1e293b" />
                  <line x1="0" y1="180" x2="800" y2="180" stroke="#334155" strokeWidth="2" />
                  {/* White road markings */}
                  <line x1="20" y1="210" x2="180" y2="210" stroke="#f8fafc" strokeWidth="3" strokeDasharray="15,15" />
                  <line x1="620" y1="210" x2="780" y2="210" stroke="#f8fafc" strokeWidth="3" strokeDasharray="15,15" />

                  {/* Central Median Barrier (New Jersey / W-Beam) */}
                  <rect x="385" y="145" width="30" height="35" fill="#475569" rx="3" />
                  <polygon points="380,180 385,145 415,145 420,180" fill="#64748b" />
                  <rect x="390" y="140" width="20" height="5" fill="#94a3b8" />

                  {/* Anti-Glare Vertical Vanes Mounted on Median */}
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const vaneX = 390 + (idx - 2) * 5;
                    const flexAngle = (simulationResult.windDeflectionAngleDeg * (idx % 2 === 0 ? 1 : -1)) / 3;
                    return (
                      <g key={idx} transform={`rotate(${flexAngle}, ${vaneX}, 140)`}>
                        <rect
                          x={vaneX - 2}
                          y={140 - (screenHeightMm - 1200) * 0.08}
                          width="5"
                          height={(screenHeightMm - 1200) * 0.08}
                          fill={selectedStation.vaneMaterial === 'UV_HDPE_POLYMER' ? '#10b981' : '#38bdf8'}
                          rx="1.5"
                        />
                      </g>
                    );
                  })}

                  {/* Oncoming Vehicle (Left side facing right) */}
                  <g transform="translate(100, 150)">
                    <rect x="0" y="10" width="80" height="20" fill="#3b82f6" rx="4" />
                    <circle cx="20" cy="30" r="8" fill="#0f172a" />
                    <circle cx="60" cy="30" r="8" fill="#0f172a" />
                    {/* Headlights emission */}
                    <circle cx="78" cy="18" r="4" fill="#fef08a" />
                    <polygon points="80,18 390,95 390,165" fill="url(#headlightBeam)" />
                  </g>

                  {/* Shielded shadow zone behind anti-glare screen */}
                  <polygon points="405,100 780,70 780,180 405,160" fill="url(#shieldCone)" />

                  {/* Driver Vehicle (Right side facing left) */}
                  <g transform="translate(640, 145)">
                    <rect x="0" y="15" width="80" height="20" fill="#10b981" rx="4" />
                    <circle cx="20" cy="35" r="8" fill="#0f172a" />
                    <circle cx="60" cy="35" r="8" fill="#0f172a" />
                    {/* Driver eye indicator */}
                    <circle cx="30" cy="8" r="3.5" fill="#38bdf8" />
                    <text x="35" y="5" fill="#38bdf8" fontSize="9" fontWeight="bold">Sürücü Gözü</text>
                  </g>

                  {/* Direct sightline rays */}
                  <line
                    x1="180"
                    y1="168"
                    x2="395"
                    y2="115"
                    stroke="#facc15"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <line
                    x1="400"
                    y1="115"
                    x2="670"
                    y2="153"
                    stroke={simulationResult.screeningEffectivenessPct >= 80 ? '#10b981' : '#ef4444'}
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />

                  {/* Cutoff label overlay */}
                  <text x="365" y="75" fill="#10b981" fontSize="10" fontWeight="bold">
                    Daldalanma Bucağı: {simulationResult.effectiveCutoffAngleDeg}°
                  </text>
                  <text x="18" y="25" fill="#94a3b8" fontSize="10">
                    Qarşı Faralar: {luminousIntensityCd.toLocaleString()} cd
                  </text>
                  <text x="590" y="25" fill="#38bdf8" fontSize="10">
                    Göz Qorunması: {simulationResult.shieldingRating}
                  </text>
                </svg>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-750">
                {/* Speed */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Nəqliyyatın Sürəti</span>
                    <span className="font-mono text-emerald-400 font-bold">{speedKmh} km/saat</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="140"
                    step="5"
                    value={speedKmh}
                    onChange={(e) => setSpeedKmh(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>40 km/h</span>
                    <span>140 km/h</span>
                  </div>
                </div>

                {/* Oncoming Intensity */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Qarşı Faraların İşıq Şiddəti</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {luminousIntensityCd.toLocaleString()} cd
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="150000"
                    step="5000"
                    value={luminousIntensityCd}
                    onChange={(e) => setLuminousIntensityCd(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>10k cd (Halogen)</span>
                    <span>150k cd (Lazer)</span>
                  </div>
                </div>

                {/* Oncoming Distance */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Qarşı Avtomobilə Məsafə</span>
                    <span className="font-mono text-cyan-400 font-bold">{distanceM} metr</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="200"
                    step="5"
                    value={distanceM}
                    onChange={(e) => setDistanceM(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>15 m</span>
                    <span>200 m</span>
                  </div>
                </div>

                {/* Screen Height */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Çəpər Pərdəsinin Hündürlüyü</span>
                    <span className="font-mono text-emerald-400 font-bold">{screenHeightMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="1400"
                    max="2200"
                    step="50"
                    value={screenHeightMm}
                    onChange={(e) => setScreenHeightMm(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>1400 mm</span>
                    <span>2200 mm</span>
                  </div>
                </div>

                {/* Blade Angle */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Pərdələrin Meyil Bucağı</span>
                    <span className="font-mono text-emerald-400 font-bold">{bladeAngleDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="30"
                    step="1"
                    value={bladeAngleDeg}
                    onChange={(e) => setBladeAngleDeg(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>12°</span>
                    <span>30°</span>
                  </div>
                </div>

                {/* Blade Spacing */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Pərdələr Arası Addım Məsafəsi</span>
                    <span className="font-mono text-emerald-400 font-bold">{bladeSpacingMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="1000"
                    step="50"
                    value={bladeSpacingMm}
                    onChange={(e) => setBladeSpacingMm(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>400 mm</span>
                    <span>1000 mm</span>
                  </div>
                </div>

                {/* Khazri Wind Gust */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Xəzri Külək Sürəti</span>
                    <span className="font-mono text-cyan-400 font-bold">{windGustKmh} km/saat</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="140"
                    step="5"
                    value={windGustKmh}
                    onChange={(e) => setWindGustKmh(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0 km/h</span>
                    <span>140 km/h (Qasırğa)</span>
                  </div>
                </div>

                {/* Blade Defect Percentage */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Çatışmayan / Qırıq Pərdə Qüsuru</span>
                    <span
                      className={`font-mono font-bold ${
                        bladeDefectPct > 5 ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {bladeDefectPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={bladeDefectPct}
                    onChange={(e) => setBladeDefectPct(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0% (Saz)</span>
                    <span>30% (Kritik Qüsur)</span>
                  </div>
                </div>

                {/* Driver Eye Height */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Sürücü Göz Səviyyəsi</span>
                    <span className="font-mono text-purple-400 font-bold">{driverEyeHeightMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="1050"
                    max="1500"
                    step="25"
                    value={driverEyeHeightMm}
                    onChange={(e) => setDriverEyeHeightMm(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>1050 mm (Kupe)</span>
                    <span>1500 mm (TIR)</span>
                  </div>
                </div>
              </div>

              {/* Recommendations & Action Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    AAYDA Texniki Tövsiyə və Sərəncamı
                  </div>
                  <p className="text-xs text-slate-300">
                    {simulationResult.recommendationsAz[0]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateCertificate}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-900/30 flex items-center gap-2 whitespace-nowrap transition"
                >
                  <FileText className="w-4 h-4" /> Elektron Sertifikat Tərtib Et
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS & SANCTIONS */}
          {activeTab === 'presets' && (
            <div className="space-y-5">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-400" />
                  Azərbaycan Dövlət Qeydiyyat Nişanlı Nəqliyyat Presetləri
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  İnzibati Xətalar Məcəlləsinin 329, 342.1, 353.1 və Mülki Məcəllənin 1108-ci maddələri üzrə cərimə və bərpa xərcləri
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_GLARE_VEHICLE_PRESETS.map((vp) => {
                    const isSelected = selectedPreset.id === vp.id;
                    return (
                      <div
                        key={vp.id}
                        onClick={() => {
                          setSelectedPreset(vp);
                          setLuminousIntensityCd(vp.luminousIntensityCd);
                          setDriverEyeHeightMm(vp.driverEyeHeightMm);
                          setSpeedKmh(vp.defaultSpeedKmh);
                          playScadaChime(660, 'sine', 0.1);
                        }}
                        className={`cursor-pointer p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40'
                            : 'bg-slate-850/60 border-slate-750 hover:bg-slate-800/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-slate-900 border border-slate-700 text-slate-100">
                              {vp.plate}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {vp.headlightType}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white mb-2">{vp.model}</div>
                          <div className="text-[11px] text-slate-400 space-y-0.5 border-t border-slate-800 pt-2">
                            <div>İşıq Gücü: <span className="font-mono text-amber-300">{vp.luminousIntensityCd.toLocaleString()} cd</span></div>
                            <div>Göz Hündürlüyü: <span className="font-mono text-purple-300">{vp.driverEyeHeightMm} mm</span></div>
                            <div>Sürət: <span className="font-mono text-slate-200">{vp.defaultSpeedKmh} km/saat</span></div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              vp.violationType === 'NONE'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {vp.violationType === 'NONE' ? 'Qanuni' : 'Pozuntu'}
                          </span>
                          <span className="text-xs text-emerald-400 font-bold">Seç</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sanctions details card */}
              <div className="bg-slate-850 p-5 rounded-xl border border-slate-750 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-750 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400">Seçilmiş Avtomobil: </span>
                    <span className="text-sm font-bold text-white font-mono">{selectedPreset.plate}</span>
                    <span className="text-xs text-slate-400 ml-2">({selectedPreset.model})</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {sanctionResult.articleCode}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">Xəta / İttiham Təsviri: </span>
                  {sanctionResult.descriptionAz}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Baza İnzibati Cəriməsi</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {convertGlareSafeCurrency(sanctionResult.baseFineAzn, currency)}{' '}
                      {GLARE_SAFE_CURRENCY_SYMBOLS[currency]}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">30 Günlük 50% Güzəşt</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {convertGlareSafeCurrency(sanctionResult.discountedFineAzn, currency)}{' '}
                      {GLARE_SAFE_CURRENCY_SYMBOLS[currency]}
                    </div>
                    <div className="text-[9px] text-slate-500">İXM Maddə 38</div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Mülki Bərpa Dəyəri</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">
                      {convertGlareSafeCurrency(sanctionResult.civilRestitutionAzn, currency)}{' '}
                      {GLARE_SAFE_CURRENCY_SYMBOLS[currency]}
                    </div>
                    <div className="text-[9px] text-slate-500">Mülki Məcəllə 1108</div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Yekun Ödəniləcək Məbləğ</div>
                    <div className="text-lg font-bold text-cyan-400 mt-1">
                      {convertGlareSafeCurrency(sanctionResult.totalPayableAzn, currency)}{' '}
                      {GLARE_SAFE_CURRENCY_SYMBOLS[currency]}
                    </div>
                    <div className="text-[9px] text-slate-500">Güzəştli Cəmi</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    10-Bəndlik Anti-Glare Çəpər SCADA & Texniki Standart Yoxlama Vərəqəsi
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    EN 12676-1/2, AZS 410 və AAYDA magistral istismar qaydalarına uyğunluq auditi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCheckAll}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition"
                  >
                    Hamısını Təsdiqlə
                  </button>
                  <button
                    type="button"
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-750">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-300 font-semibold">Standartlara Uyğunluq Dərəcəsi</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {checklistResult.checkedCount} / {checklistResult.totalCount} ({checklistResult.complianceScorePct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                    style={{ width: `${checklistResult.complianceScorePct}%` }}
                  />
                </div>
              </div>

              {/* Checklist items list */}
              <div className="space-y-2.5">
                {MOCK_GLARE_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checkedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800/40'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-white">{item.titleAz}</h4>
                          <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-emerald-300 border border-slate-700">
                            {item.standardRef}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.descriptionAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    10-Suallıq Magistral Anti-Glare və Gözqamaşdırma Nəzəri İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    YHQ 50-ci maddə, İXM 329/342.1 və EN 12676-1 beynəlxalq standartları
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillExam}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition"
                >
                  Avtomatik Doldur (100%)
                </button>
              </div>

              {/* Result banner if submitted */}
              {isExamSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    examResult.passed
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6" />
                    <div>
                      <div className="text-sm font-bold">
                        {examResult.passed ? 'İmtahandan Müvəffəqiyyətlə Keçdiniz!' : 'Nəticə Qeyri-Qənaətbəxşdir'}
                      </div>
                      <div className="text-xs opacity-90">
                        Toplanan Bal: {examResult.score} / {examResult.totalQuestions} ({examResult.percentage}%) — Keçid Həddi: 80%
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExamAnswers({});
                      setIsExamSubmitted(false);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 transition"
                  >
                    Yenidən Başla
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_GLARE_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedAnswer = examAnswers[q.id];
                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3">
                      <div className="text-xs font-bold text-white flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-mono text-[11px] shrink-0 border border-slate-700">
                          {idx + 1}
                        </span>
                        <span>{q.questionAz}</span>
                      </div>

                      <div className="space-y-1.5 pl-7">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedAnswer === optIdx;
                          const isCorrect = q.correctIndex === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg text-xs transition border flex items-center justify-between ${
                                isExamSubmitted
                                  ? isCorrect
                                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold'
                                    : isOptionSelected
                                    ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                                    : 'bg-slate-900 border-slate-800 text-slate-400'
                                  : isOptionSelected
                                  ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200 font-medium'
                                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                              }`}
                            >
                              <span>{opt}</span>
                              {isExamSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="mt-2 p-2.5 bg-slate-900/90 rounded border border-slate-800 text-[11px] text-slate-300 pl-7">
                          <span className="font-bold text-emerald-400">Hüquqi Əsas: </span>
                          {q.explanationAz} ({q.legalCitation})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isExamSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExamSubmitted(true);
                      playScadaChime(examResult.passed ? 880 : 440, 'triangle', 0.25);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg transition"
                  >
                    Cavabları Təsdiqlə və İmtahanı Bitir
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Rəsmi Dövlət Anti-Glare Optik Təhlükəsizlik Sertifikatı ({activeCert.certificateId})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(activeCert.certificateId)}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Kodu Kopyala
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" /> Çap Et
                  </button>
                </div>
              </div>

              {/* Printable Voucher Paper Layout */}
              <div className="bg-slate-950 p-6 rounded-2xl border-2 border-emerald-500/40 shadow-2xl relative text-slate-100">
                <div className="flex flex-wrap items-center justify-between border-b-2 border-emerald-500/30 pb-4 mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-emerald-400 font-bold text-xl">
                      AAYDA
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white tracking-wide">
                        AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ
                      </h2>
                      <p className="text-xs text-slate-400">
                        Baş Dövlət Yol Polisi İdarəsi (BDYP) İlə Birgə Optik Təhlükəsizlik Sertifikatı
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-emerald-400 bg-slate-900 px-3 py-1 rounded border border-emerald-500/40">
                      {activeCert.certificateId}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      SİMA UID: {activeCert.simaDigitalUid}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs py-2">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Dövlət Qeydiyyat Nişanı:</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">{activeCert.vehiclePlate}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Magistral Dəhliz:</span>
                    <div className="text-xs font-bold text-emerald-300 mt-0.5 truncate">{activeCert.corridorName}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Stansiya Kodu:</span>
                    <div className="text-sm font-mono text-cyan-400 font-bold mt-0.5">{activeCert.corridorCode}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Optik Daldalanma:</span>
                    <div className="text-sm font-mono text-emerald-400 font-bold mt-0.5">
                      {activeCert.screeningEfficiencyPct}% (EN 12676-1)
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px]">De Boer İndeksi:</span>
                    <div className="text-sm font-mono text-purple-400 font-bold mt-0.5">
                      {activeCert.deBoerScore} / 9.0
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Təhlükəsizlik PİN Kodu:</span>
                    <div className="text-sm font-mono text-amber-400 font-bold mt-0.5">
                      {activeCert.verificationPin}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div>
                    Verilmə Tarixi: <span className="text-slate-200 font-mono">{activeCert.issueDate}</span> | Qüvvədədir:{' '}
                    <span className="text-slate-200 font-mono">{activeCert.expiryDate}</span>
                  </div>
                  <div className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> SİMA Rəqəmsal İmza ilə Təsdiq Edilmişdir
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  Vahid AAYDA & BDYP Anti-Glare Təhlükəsizlik Sertifikatları Dövlət Reyestri
                </span>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registryQuery}
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    placeholder="Sertifikat ID, Nömrə və ya SİMA UID axtar..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.certificateId}
                    onClick={() => {
                      setActiveCert(cert);
                      setActiveTab('certificate');
                    }}
                    className="cursor-pointer p-3.5 bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-750 flex flex-wrap items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {cert.certificateId}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {cert.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-semibold">{cert.corridorName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Nömrə: {cert.vehiclePlate} | Daldalanma: {cert.screeningEfficiencyPct}% | De Boer:{' '}
                        {cert.deBoerScore}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-slate-400">Qüvvədədir: {cert.expiryDate}</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        PIN: {cert.verificationPin}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredCertificates.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-850/40 rounded-xl border border-slate-800">
                    Axtarış sorğusuna uyğun aktiv dövlət sertifikatı tapılmadı.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AAYDA Magistral Yol Avadanlıqları İdarəsi & BDYP DYP Mühəndis Nəzarəti SCADA Server 2026</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-semibold transition"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
