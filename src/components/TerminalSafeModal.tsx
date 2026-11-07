import React, { useState, useId } from 'react';
import {
  Shield,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  RotateCcw,
  Volume2,
  X,
  Compass,
  Sliders,
  Award,
  Layers,
  Wrench,
  Car,
} from 'lucide-react';
import {
  Currency,
  TerminalPerformanceClass,
  TerminalType,
  BreakawayPostCondition,
  TerminalCorridorStation,
  TerminalVehiclePreset,
  TerminalSimulationInputs,
  TerminalCertificate,
  TERMINAL_SAFE_CURRENCY_SYMBOLS,
  convertTerminalSafeCurrency,
  calculateTerminalSimulation,
  calculateTerminalStatutorySanctions,
  generateTerminalCertificate,
} from '../utils/terminalSafeCompliance';
import {
  MOCK_TERMINAL_CORRIDOR_STATIONS,
  MOCK_TERMINAL_VEHICLE_PRESETS,
  MOCK_TERMINAL_CHECKLIST_ITEMS,
  MOCK_TERMINAL_EXAM_QUESTIONS,
  MOCK_ACTIVE_TERMINAL_CERTIFICATES,
} from '../data/mockTerminalSafeData';

export interface TerminalSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'az' | 'en' | 'ru';
}

export const TerminalSafeModal: React.FC<TerminalSafeModalProps> = ({
  isOpen,
  onClose,
  language = 'az',
}) => {
  const [activeTab, setActiveTab] = useState<'corridors' | 'simulator' | 'calculator' | 'checklist' | 'exam' | 'certificate' | 'registry'>('corridors');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Corridor Selection
  const [selectedStation, setSelectedStation] = useState<TerminalCorridorStation>(MOCK_TERMINAL_CORRIDOR_STATIONS[0]);
  const [corridorSearch, setCorridorSearch] = useState('');

  // Simulation State
  const [simInputs, setSimInputs] = useState<TerminalSimulationInputs>({
    vehicleSpeedKmh: 105,
    vehicleMassKg: 1850,
    impactAngleDeg: 0,
    terminalType: 'TANGENT_EXTRUDER',
    performanceClass: 'P4',
    postCondition: 'OPTIMAL_SHEAR',
    shearedPostsCount: 4,
  });

  // Vehicle Preset & Calculator State
  const [selectedVehicle, setSelectedVehicle] = useState<TerminalVehiclePreset>(MOCK_TERMINAL_VEHICLE_PRESETS[0]);
  const [isZoneEncroachment, setIsZoneEncroachment] = useState(true);

  // Checklist State
  const [checklist, setChecklist] = useState(MOCK_TERMINAL_CHECKLIST_ITEMS);

  // Exam State
  const [userExamAnswers, setUserExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Certificate & Registry State
  const [activeCert, setActiveCert] = useState<TerminalCertificate>(MOCK_ACTIVE_TERMINAL_CERTIFICATES[0]);
  const [registryRecords, setRegistryRecords] = useState<TerminalCertificate[]>(MOCK_ACTIVE_TERMINAL_CERTIFICATES);
  const [registrySearch, setRegistrySearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);

  // Accessibility IDs
  const speedInputId = useId();
  const massInputId = useId();
  const angleInputId = useId();
  const postsInputId = useId();

  if (!isOpen) return null;

  // Real-time calculations
  const simResults = calculateTerminalSimulation(simInputs);
  const sanctions = calculateTerminalStatutorySanctions(
    simInputs.vehicleSpeedKmh,
    selectedStation.speedLimitKmh,
    isZoneEncroachment,
    simResults.estimatedRestitutionAzn
  );

  // Handlers
  const handleSelectStation = (station: TerminalCorridorStation) => {
    setSelectedStation(station);
    setSimInputs(prev => ({
      ...prev,
      terminalType: station.terminalType,
      performanceClass: station.performanceClass,
    }));
  };

  const handleSelectVehicle = (preset: TerminalVehiclePreset) => {
    setSelectedVehicle(preset);
    setSimInputs(prev => ({
      ...prev,
      vehicleSpeedKmh: preset.defaultSpeedKmh,
      vehicleMassKg: preset.massKg,
      impactAngleDeg: preset.impactAngleDeg,
    }));
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'COMPLIANT' ? 'NON_COMPLIANT' : 'COMPLIANT' }
          : item
      )
    );
  };

  const handleSelectAllChecklist = () => {
    setChecklist(prev => prev.map(item => ({ ...item, status: 'COMPLIANT' })));
  };

  const handleResetChecklist = () => {
    setChecklist(prev => prev.map(item => ({ ...item, status: 'NON_COMPLIANT' })));
  };

  const handleExamOptionSelect = (qId: number, optIdx: number) => {
    if (examSubmitted) return;
    setUserExamAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleAutoFillExam = () => {
    const perfect: Record<number, number> = {};
    MOCK_TERMINAL_EXAM_QUESTIONS.forEach(q => {
      perfect[q.id] = q.correctOptionIndex;
    });
    setUserExamAnswers(perfect);
  };

  const handleCalculateExamScore = () => {
    let score = 0;
    MOCK_TERMINAL_EXAM_QUESTIONS.forEach(q => {
      if (userExamAnswers[q.id] === q.correctOptionIndex) score += 1;
    });
    return score;
  };

  const handleGenerateCertificate = () => {
    const newCert = generateTerminalCertificate(selectedStation, selectedVehicle, simResults);
    setActiveCert(newCert);
    setRegistryRecords(prev => [newCert, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePlaySound = () => {
    setSoundPlaying(true);
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // AudioContext unavailable in test environments
    }
    setTimeout(() => setSoundPlaying(false), 800);
  };

  const formatCurr = (amount: number) => {
    const converted = convertTerminalSafeCurrency(amount, currency);
    const sym = TERMINAL_SAFE_CURRENCY_SYMBOLS[currency];
    return `${converted.toLocaleString()} ${sym}`;
  };

  const filteredStations = MOCK_TERMINAL_CORRIDOR_STATIONS.filter(s =>
    s.nameAz.toLowerCase().includes(corridorSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(corridorSearch.toLowerCase()) ||
    s.routeNumber.toLowerCase().includes(corridorSearch.toLowerCase())
  );

  const filteredCertificates = registryRecords.filter(c =>
    c.certificateId.toLowerCase().includes(registrySearch.toLowerCase()) ||
    c.vehiclePlate.toLowerCase().includes(registrySearch.toLowerCase()) ||
    c.corridorCode.toLowerCase().includes(registrySearch.toLowerCase())
  );

  const compliantCount = checklist.filter(c => c.status === 'COMPLIANT').length;
  const examScore = handleCalculateExamScore();
  const examPassed = examScore >= 8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AAYDA • AYNA • BDYP
                </span>
                <span className="text-xs font-medium text-slate-400">
                  EN 1317-4 / AZS 410
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Magistral Yol Çəpəri Ucluqları və Enerji Udma Portalı (TERMINAL-SAFE-AZ-2026)
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency Switcher */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map(cur => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === cur
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto scrollbar-none px-4">
          {[
            { id: 'corridors', icon: Compass, labelAz: 'Radarlar & Dəhlizlər', labelEn: 'Corridors Radar', labelRu: 'Коридоры' },
            { id: 'simulator', icon: Sliders, labelAz: 'Toqquşma Simulyatoru', labelEn: 'Impact Simulator', labelRu: 'Симулятор' },
            { id: 'calculator', icon: Car, labelAz: 'Nəqliyyat & İXM Cərimələri', labelEn: 'Sanctions & Fines', labelRu: 'Штрафы' },
            { id: 'checklist', icon: Wrench, labelAz: '10-Bənd SCADA Standartı', labelEn: 'SCADA Checklist', labelRu: 'Стандарты' },
            { id: 'exam', icon: Award, labelAz: 'Yol Qanunvericiliyi İmtahanı', labelEn: 'Statutory Exam', labelRu: 'Экзамен' },
            { id: 'certificate', icon: FileText, labelAz: 'Rəsmi Arayış', labelEn: 'Certificate', labelRu: 'Справка' },
            { id: 'registry', icon: Layers, labelAz: 'Vahid Reyestr', labelEn: 'Public Registry', labelRu: 'Реестр' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{language === 'az' ? tab.labelAz : language === 'en' ? tab.labelEn : tab.labelRu}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-900/90">
          {/* TAB 1: CORRIDORS RADAR */}
          {activeTab === 'corridors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-400" />
                    Respublika Magistral Yollarında Enerjiuducu Terminal Stansiyaları
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    EN 1317-4 standartlı ekstruder və bükülmə qoruyucu başlıqların real-vaxt AAYDA SCADA telemetriyası
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={corridorSearch}
                    onChange={e => setCorridorSearch(e.target.value)}
                    placeholder="Dəhliz və ya nömrə axtar..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map(station => {
                  const isSelected = selectedStation.id === station.id;
                  return (
                    <div
                      key={station.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                      onClick={() => handleSelectStation(station)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          {station.code} • {station.routeNumber}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {station.performanceClass} (110 km/s)
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white mb-2 line-clamp-1">
                        {station.nameAz}
                      </h4>

                      <div className="space-y-1.5 text-xs text-slate-400 mb-3">
                        <div className="flex justify-between">
                          <span>Piketaj Koordinatı:</span>
                          <span className="text-slate-200 font-medium">{station.picketKm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Terminal Tipi:</span>
                          <span className="text-slate-200 font-medium">{station.terminalType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nizə Riskinin Ləğvi:</span>
                          <span className="text-emerald-400 font-bold">{station.impalementRiskEliminatedPct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Qırılan Dirəklər:</span>
                          <span className="text-slate-200 font-medium">{station.breakawayPostsCount} ədəd CRT</span>
                        </div>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleSelectStation(station);
                          setActiveTab('simulator');
                        }}
                        className="w-full py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center justify-center space-x-1.5 border border-amber-500/30"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Simulyatorda Aç</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: IMPACT SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* 2D Interactive SVG Telemetry Canvas */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-slate-300 font-semibold">
                      EN 1317-4 Deformasiya və Rels Ekstruziyası Telemetriyası
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePlaySound}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 border border-slate-700"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${soundPlaying ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>Akustik Zərbə Səsi</span>
                    </button>
                  </div>
                </div>

                <svg className="w-full h-48 sm:h-56 bg-slate-900 rounded-lg border border-slate-800" viewBox="0 0 800 220">
                  <defs>
                    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <pattern id="hazardPattern" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <rect width="10" height="20" fill="#f59e0b" />
                      <rect x="10" width="10" height="20" fill="#020617" />
                    </pattern>
                  </defs>

                  {/* Roadway Surface */}
                  <rect x="0" y="20" width="800" height="180" fill="url(#roadGrad)" />
                  <line x1="0" y1="30" x2="800" y2="30" stroke="#f8fafc" strokeWidth="3" strokeDasharray="15,15" />
                  <line x1="0" y1="190" x2="800" y2="190" stroke="#f8fafc" strokeWidth="4" />

                  {/* Guardrail W-beam Line */}
                  <line x1="320" y1="140" x2="800" y2="140" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
                  <line x1="320" y1="145" x2="800" y2="145" stroke="#cbd5e1" strokeWidth="2" />

                  {/* Ground Foundation Cable */}
                  <line x1="180" y1="165" x2="320" y2="140" stroke="#64748b" strokeWidth="3" strokeDasharray="4,4" />

                  {/* Breakaway Posts */}
                  {[340, 420, 500, 580, 660, 740].map((px, idx) => {
                    const isSheared = idx < simInputs.shearedPostsCount;
                    return (
                      <g key={px}>
                        <rect
                          x={px - 4}
                          y={isSheared ? 145 : 120}
                          width="8"
                          height={isSheared ? "10" : "35"}
                          fill={isSheared ? "#ef4444" : "#e2e8f0"}
                          transform={isSheared ? `rotate(45, ${px}, 150)` : undefined}
                        />
                        {isSheared && (
                          <text x={px - 10} y={115} fill="#ef4444" fontSize="9" fontWeight="bold">SHEARED</text>
                        )}
                      </g>
                    );
                  })}

                  {/* Extruder Head Box */}
                  <g transform={`translate(${Math.max(160, 320 - simResults.extrusionStrokeDisplacementM * 8)}, 125)`}>
                    <rect x="0" y="0" width="40" height="30" rx="4" fill="url(#hazardPattern)" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="20" y="20" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">EN 1317</text>

                    {/* Curling extruded ribbons of flattened steel */}
                    <path
                      d="M 40,15 Q 60,5 50,30 T 70,45"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Approaching or Impacting Vehicle */}
                  <g transform={`translate(${Math.max(60, 160 - (simInputs.vehicleSpeedKmh > 100 ? 40 : 20))}, 115)`}>
                    <rect x="0" y="0" width="70" height="35" rx="6" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
                    {/* Windshield */}
                    <rect x="35" y="5" width="20" height="25" rx="3" fill="#0f172a" />
                    {/* Headlights */}
                    <polygon points="68,8 95,2 95,33 68,27" fill="#fef08a" opacity="0.4" />
                    {/* Plate */}
                    <rect x="5" y="12" width="22" height="10" rx="2" fill="#ffffff" />
                    <text x="16" y="20" fill="#020617" fontSize="7" fontWeight="bold" textAnchor="middle">
                      {selectedVehicle.licensePlate.substring(0, 5)}
                    </text>
                  </g>

                  {/* Telemetry HUD overlay */}
                  <rect x="15" y="35" width="210" height="70" rx="6" fill="#020617" opacity="0.85" stroke="#334155" />
                  <text x="25" y="52" fill="#f59e0b" fontSize="11" fontWeight="bold">
                    Ekstruziya Gedişi: {simResults.extrusionStrokeDisplacementM} m
                  </text>
                  <text x="25" y="68" fill="#38bdf8" fontSize="11">
                    Yavaşlama: {simResults.averageDecelerationG} g (ASI: {simResults.accelerationSeverityIndexASI})
                  </text>
                  <text x="25" y="84" fill="#4ade80" fontSize="11">
                    Nizə Dəlmə Riski: {simResults.cockpitPenetrationRiskPct}% ({simResults.impalementDefended ? 'MÜHAFİZƏ OLUNUB' : 'TƏHLÜKƏLİ'})
                  </text>
                  <text x="25" y="98" fill="#e2e8f0" fontSize="9">
                    Kinetik Enerji: {simResults.kineticEnergyKj} kJ
                  </text>
                </svg>
              </div>

              {/* Sliders & Configurations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800">
                {/* Left Column: Sliders */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <label htmlFor={speedInputId} className="text-slate-300 font-medium">Toqquşma Sürəti (km/saat):</label>
                      <span className="text-amber-400 font-bold">{simInputs.vehicleSpeedKmh} km/saat</span>
                    </div>
                    <input
                      id={speedInputId}
                      type="range"
                      min="30"
                      max="140"
                      step="5"
                      value={simInputs.vehicleSpeedKmh}
                      onChange={e => setSimInputs(prev => ({ ...prev, vehicleSpeedKmh: Number(e.target.value) }))}
                      className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <label htmlFor={massInputId} className="text-slate-300 font-medium">Avtomobil Kütləsi (kq):</label>
                      <span className="text-amber-400 font-bold">{simInputs.vehicleMassKg} kq</span>
                    </div>
                    <input
                      id={massInputId}
                      type="range"
                      min="900"
                      max="4500"
                      step="50"
                      value={simInputs.vehicleMassKg}
                      onChange={e => setSimInputs(prev => ({ ...prev, vehicleMassKg: Number(e.target.value) }))}
                      className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <label htmlFor={angleInputId} className="text-slate-300 font-medium">Zərbə Bucağı (dərəcə):</label>
                      <span className="text-amber-400 font-bold">{simInputs.impactAngleDeg}°</span>
                    </div>
                    <input
                      id={angleInputId}
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={simInputs.impactAngleDeg}
                      onChange={e => setSimInputs(prev => ({ ...prev, impactAngleDeg: Number(e.target.value) }))}
                      className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <label htmlFor={postsInputId} className="text-slate-300 font-medium">Qırılan CRT Dirəklərin Sayı:</label>
                      <span className="text-amber-400 font-bold">{simInputs.shearedPostsCount} ədəd</span>
                    </div>
                    <input
                      id={postsInputId}
                      type="range"
                      min="1"
                      max="8"
                      step="1"
                      value={simInputs.shearedPostsCount}
                      onChange={e => setSimInputs(prev => ({ ...prev, shearedPostsCount: Number(e.target.value) }))}
                      className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Column: Terminal Selectors */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-2">Terminal Mühəndis Konstruksiyası:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'TANGENT_EXTRUDER', label: 'Düz Xətti Ekstruder' },
                        { id: 'FLARED_DEFLECTION', label: 'Bükülmüş Yönləndirici' },
                        { id: 'SLOTTED_RAIL_FRICTION', label: 'Kəsikli Relssürtünmə' },
                        { id: 'BURIED_BACKSLOPE', label: 'Yamacagömülmə' },
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setSimInputs(prev => ({ ...prev, terminalType: type.id as TerminalType }))}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border text-left transition-all ${
                            simInputs.terminalType === type.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-2">EN 1317-4 Performans Sinifi:</label>
                    <div className="flex space-x-2">
                      {(['P1', 'P2', 'P3', 'P4'] as TerminalPerformanceClass[]).map(pClass => (
                        <button
                          key={pClass}
                          onClick={() => setSimInputs(prev => ({ ...prev, performanceClass: pClass }))}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            simInputs.performanceClass === pClass
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          {pClass}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-2">Dirək & Zəmin Vəziyyəti:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'OPTIMAL_SHEAR', label: 'Optimal' },
                        { id: 'WEATHERED_RUST', label: 'Korroziyalı' },
                        { id: 'SOIL_DISPLACEMENT', label: 'Yumşaq Torpaq' },
                      ].map(cond => (
                        <button
                          key={cond.id}
                          onClick={() => setSimInputs(prev => ({ ...prev, postCondition: cond.id as BreakawayPostCondition }))}
                          className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                            simInputs.postCondition === cond.id
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {cond.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Results & Verification Banner */}
              <div className="p-4 rounded-xl border bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl border ${
                    simResults.impalementDefended
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}>
                    {simResults.impalementDefended ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      Status: {simResults.terminalStatus}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ASI İndeksi: <span className="font-semibold text-slate-200">{simResults.accelerationSeverityIndexASI} ({simResults.asiClass})</span> | THIV Sürəti: <span className="font-semibold text-slate-200">{simResults.theoreticalHeadImpactVelocityThivKmh} km/s</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateCertificate}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>TERMINAL-SAFE Rəsmi Arayış Yarat</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS & SANCTIONS */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-400" />
                  Azərbaycan Qeydiyyatlı Nəqliyyat Vasitələri Preseti & Zərbə Parametrləri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_TERMINAL_VEHICLE_PRESETS.map(preset => {
                    const isSelected = selectedVehicle.id === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectVehicle(preset)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/80 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-white border border-slate-700">
                            {preset.licensePlate}
                          </span>
                          <span className="text-xs text-slate-400">{preset.massKg} kq</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mb-1">{preset.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{preset.riskDescription}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sanctions & Fine Breakdown */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Qanunvericilik üzrə İnzibati Cərimələr və Mülki Ziyan Məsuliyyəti
                  </h4>
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isZoneEncroachment}
                      onChange={e => setIsZoneEncroachment(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span>İXM 327.2 Qoruyucu Zonada Dayanma</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">İXM 327.2 (Zonaya Müdaxilə):</span>
                    <span className="text-white font-bold text-sm">{formatCurr(sanctions.ixm327_2FineAzn)}</span>
                    <span className="text-amber-400 ml-1.5">({sanctions.ixm327_2PenaltyPoints} Bal)</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">İXM 328 (Sürət Həddi):</span>
                    <span className="text-white font-bold text-sm">{formatCurr(sanctions.ixm328_2SpeedingFineAzn)}</span>
                    <span className="text-amber-400 ml-1.5">({sanctions.ixm328_2PenaltyPoints} Bal)</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">İXM 353.1 (Yol Zədələnməsi):</span>
                    <span className="text-white font-bold text-sm">{formatCurr(sanctions.ixm353_1DamageFineAzn)}</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">Mülki Məcəllə 1108 (Bərpa):</span>
                    <span className="text-white font-bold text-sm">{formatCurr(sanctions.civil1108RestitutionAzn)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/90 p-3.5 rounded-lg border border-amber-500/30 gap-2">
                  <div className="text-xs text-slate-300">
                    <span className="text-amber-400 font-semibold">İXM Maddə 38 Güzəşti:</span> 30 gün ərzində ödənildikdə inzibati cərimələrə 50% qanuni güzəşt tətbiq olunur.
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Yekun Qanuni Öhdəlik (Güzəştlə):</div>
                    <div className="text-base font-bold text-emerald-400">{formatCurr(sanctions.totalDiscountedLiabilityAzn)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCADA CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-400" />
                    10-Bəndlik Yol Çəpəri Terminal SCADA & Texniki Standartı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    EN 1317-4, AZS 410 və AAYDA standartlarına uyğunluq monitorinqi ({compliantCount}/10 Təsdiqlənib)
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-all border border-emerald-500/30"
                  >
                    Hamısını Təsdiqlə
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all border border-slate-700 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Sıfırla</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {checklist.map(item => {
                  const isCompliant = item.status === 'COMPLIANT';
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        isCompliant
                          ? 'bg-slate-950 border-slate-700'
                          : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                      }`}
                    >
                      <button className="mt-0.5 focus:outline-none">
                        {isCompliant ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{item.titleAz}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCompliant
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {isCompliant ? 'UYĞUNDUR' : 'UYĞUN DEYİL'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{item.descAz}</p>
                        <span className="text-[10px] text-amber-400/80 font-mono">{item.standardReference}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: STATUTORY EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Çəpər Ucluqları və Yol Təhlükəsizliyi Qanunvericiliyi İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    10 sualdan ən azı 8-nə düzgün cavab verərək rəsmi mühəndislik arayışı əldə edin
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAutoFillExam}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all border border-amber-500/30"
                  >
                    100% Avto-Doldur
                  </button>
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow"
                  >
                    İmtahanı Tamamla
                  </button>
                </div>
              </div>

              {examSubmitted && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  examPassed
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    {examPassed ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-rose-400" />}
                    <div>
                      <div className="font-bold text-sm">
                        İmtahan Nəticəsi: {examScore} / 10 Doğru Cavab
                      </div>
                      <div className="text-xs text-slate-400">
                        {examPassed
                          ? 'Təbriklər! Standartlara uyğunluq tələblərini uğurla keçdiniz.'
                          : 'Tələb olunan keçid balı (80%) toplanmadı. Sualları yenidən nəzərdən keçirin.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_TERMINAL_EXAM_QUESTIONS.map(q => {
                  const userAnswer = userExamAnswers[q.id];
                  const isCorrect = examSubmitted && userAnswer === q.correctOptionIndex;
                  return (
                    <div key={q.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-start space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 mt-0.5">
                          #{q.id}
                        </span>
                        <div className="flex-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-white">{q.questionAz}</h4>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{q.legalCitation}</span>
                        </div>
                      </div>

                      <div className="space-y-2 pl-7">
                        {q.optionsAz.map((opt, idx) => {
                          const isSelected = userAnswer === idx;
                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                          if (isSelected) btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold';
                          if (examSubmitted) {
                            if (idx === q.correctOptionIndex) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                            else if (isSelected && !isCorrect) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => handleExamOptionSelect(q.id, idx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="mt-2 text-xs bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-400">
                          <span className="text-amber-400 font-semibold">Qanuni İzah: </span>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleCopyCode(activeCert.certificateId)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? 'Seriya Kodu Kopyalandı!' : 'Kopyala'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Çap Et</span>
                </button>
              </div>

              {/* Printable Certificate Layout */}
              <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border-2 border-amber-500/40 relative shadow-2xl space-y-6">
                <div className="text-center space-y-1">
                  <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                    Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA)
                  </div>
                  <div className="text-xs text-slate-400">
                    Baş Dövlət Yol Polisi İdarəsi (BDYP) • Azərbaycan Yerüstü Nəqliyyat Agentliyi (AYNA)
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-white mt-2">
                    TERMINAL-SAFE-AZ-2026 ELEKTRON TƏSDİQNAMƏSİ
                  </h3>
                  <div className="text-xs font-mono text-amber-300">
                    Sertifikat №: {activeCert.certificateId}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block">Dəhliz Kodu:</span>
                    <span className="text-white font-bold">{activeCert.corridorCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nəqliyyat Qeydiyyatı:</span>
                    <span className="text-white font-bold">{activeCert.vehiclePlate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Performans Sinifi:</span>
                    <span className="text-amber-400 font-bold">{activeCert.performanceClass} (EN 1317-4)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nizə Dəlmə Mühafizəsi:</span>
                    <span className="text-emerald-400 font-bold">
                      {activeCert.penetrationProtected ? '100% QORUNUR' : 'TƏMİR TƏLƏB OLUNUR'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Toqquşma Kinetik Enerjisi:</span>
                    <span className="text-slate-200 font-bold">{activeCert.kineticEnergyKj} kJ</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Akselerasiya İndeksi (ASI):</span>
                    <span className="text-slate-200 font-bold">{activeCert.asiScore} (Class A)</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Kəllə Zərbə Sürəti (THIV):</span>
                    <span className="text-slate-200 font-bold">{activeCert.thivKmh} km/saat</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-4 gap-2">
                  <div>
                    <div>SİMA Rəqəmsal İmza UID: <span className="font-mono text-slate-300">{activeCert.simaDigitalUid}</span></div>
                    <div>Verifikasiya PİN Kodu: <span className="font-mono text-amber-300 font-bold">{activeCert.verificationPin}</span></div>
                  </div>
                  <div className="text-right">
                    <div>Verilmə Tarixi: <span className="text-slate-300">{activeCert.issueDate}</span></div>
                    <div>Yoxlayan: <span className="text-slate-300">{activeCert.inspectorName}</span></div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono text-center break-all">
                  SHA-256 HASH: {activeCert.sha256Hash}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    Vahid İctimai Çəpər Terminal Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Respublika üzrə təsdiqlənmiş EN 1317-4 sertifikatlarının və qəza ekspertizalarının rəsmi reyestri
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={e => setRegistrySearch(e.target.value)}
                    placeholder="Sertifikat və ya nömrə axtar..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredCertificates.map(cert => (
                  <div
                    key={cert.certificateId}
                    onClick={() => {
                      setActiveCert(cert);
                      setActiveTab('certificate');
                    }}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-amber-400 font-mono">{cert.certificateId}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {cert.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-1">
                        {cert.corridorName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Nəqliyyat: {cert.vehicleModel} ({cert.vehiclePlate}) | Ekstruziya: {cert.performanceClass}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-slate-400">Tarix: <span className="text-slate-200">{cert.issueDate}</span></div>
                      <div className="text-[11px] text-amber-400/80 font-mono">PİN: {cert.verificationPin}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>© 2026 AAYDA • AYNA • BDYP | Magistral Yolların Çəpər Terminalı və Təhlükəsizlik Sistemi</span>
          </div>
          <div className="text-slate-400 font-mono">
            SİMA Cloud Portal v4.12 • EN 1317-4
          </div>
        </div>
      </div>
    </div>
  );
};
