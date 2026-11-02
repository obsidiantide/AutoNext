import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  Search,
  Award,
  Sliders,
  Eye,
  Droplets,
  Sun,
  Sparkles,
  Car,
  Gauge,
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import {
  MarkCorridorAsset,
  MarkVehiclePreset,
  MarkSimulationInput,
  MarkSafeCertificate,
  MarkingMaterialType,
  MarkingLinePattern,
  MarkingSurfaceCondition,
  executeMarkSimulation,
  calculateMarkSanction,
  generateMarkSafeCertificate
} from '../utils/markSafeCompliance';
import {
  MOCK_MARK_CORRIDORS,
  MOCK_MARK_VEHICLE_PRESETS,
  MOCK_MARK_CHECKLIST_ITEMS,
  MOCK_MARK_EXAM_QUESTIONS,
  MOCK_ACTIVE_MARK_CERTIFICATES
} from '../data/mockMarkSafeData';
import { Currency } from '../types/vehicle';

interface MarkSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType = 'radar' | 'simulator' | 'presets' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const MarkSafeModal: React.FC<MarkSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedCorridor, setSelectedCorridor] = useState<MarkCorridorAsset>(MOCK_MARK_CORRIDORS[0]);
  const [selectedPreset, setSelectedPreset] = useState<MarkVehiclePreset>(MOCK_MARK_VEHICLE_PRESETS[0]);

  // Simulation inputs
  const [vehicleSpeedKmH, setVehicleSpeedKmH] = useState<number>(90);
  const [headlightCandela, setHeadlightCandela] = useState<number>(50000);
  const [beadEmbedmentPct, setBeadEmbedmentPct] = useState<number>(56);
  const [beadRoundnessPct, setBeadRoundnessPct] = useState<number>(88);
  const [refractiveIndex, setRefractiveIndex] = useState<number>(1.9);
  const [beadAppRate, setBeadAppRate] = useState<number>(450);
  const [waterFilmDepthMm, setWaterFilmDepthMm] = useState<number>(0.0);
  const [materialType, setMaterialType] = useState<MarkingMaterialType>('THERMOPLASTIC_EXTRUDED');
  const [linePattern, setLinePattern] = useState<MarkingLinePattern>('STRUCTURED_AUDIO_PROFILE');
  const [surfaceCondition, setSurfaceCondition] = useState<MarkingSurfaceCondition>('DRY_STANDARD');
  const [markingAgeMonths, setMarkingAgeMonths] = useState<number>(6);
  const [annualAadt, setAnnualAadt] = useState<number>(35000);

  // Sanctions state
  const [violationType, setViolationType] = useState<'LINE_DEPARTURE_327_1' | 'DOUBLE_SOLID_CROSSING_327_2' | 'MARKING_DAMAGE_353'>('LINE_DEPARTURE_327_1');

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'chk-geom-width': true,
    'chk-thickness-layer': true,
    'chk-dry-retro-rl': true,
    'chk-wet-retro-rw': true,
    'chk-daytime-qd': true,
    'chk-bead-embedment': true,
    'chk-bead-roundness': true,
    'chk-skid-resistance': true
  });

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificates & Registry
  const [certificates, setCertificates] = useState<MarkSafeCertificate[]>(MOCK_ACTIVE_MARK_CERTIFICATES);
  const [activeCert, setActiveCert] = useState<MarkSafeCertificate>(MOCK_ACTIVE_MARK_CERTIFICATES[0]);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Simulation execution
  const simInput: MarkSimulationInput = useMemo(
    () => ({
      vehicleSpeedKmH,
      headlightIntensityCandela: headlightCandela,
      beadEmbedmentPct,
      beadRoundnessPct,
      refractiveIndex,
      beadApplicationRateGPerM2: beadAppRate,
      waterFilmThicknessMm: waterFilmDepthMm,
      materialType,
      linePattern,
      surfaceCondition,
      markingAgeMonths,
      annualTrafficAadt: annualAadt
    }),
    [
      vehicleSpeedKmH,
      headlightCandela,
      beadEmbedmentPct,
      beadRoundnessPct,
      refractiveIndex,
      beadAppRate,
      waterFilmDepthMm,
      materialType,
      linePattern,
      surfaceCondition,
      markingAgeMonths,
      annualAadt
    ]
  );

  const simResult = useMemo(() => executeMarkSimulation(simInput), [simInput]);
  const sanctionResult = useMemo(() => calculateMarkSanction(violationType), [violationType]);

  if (!isOpen) return null;

  // Handlers
  const handleCorridorSelect = (corridor: MarkCorridorAsset) => {
    setSelectedCorridor(corridor);
    setMaterialType(corridor.materialType);
    setLinePattern(corridor.linePattern);
    setBeadAppRate(corridor.beadApplicationRateGPerM2);
    setBeadEmbedmentPct(corridor.beadEmbedmentDepthPct);
    setAnnualAadt(corridor.aadtTraffic);
  };

  const handleApplyPreset = (preset: MarkVehiclePreset) => {
    setSelectedPreset(preset);
    setHeadlightCandela(preset.headlightCandela);
    setVehicleSpeedKmH(preset.nominalSpeedKmH);
  };

  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectAllChecklist = () => {
    const all: Record<string, boolean> = {};
    MOCK_MARK_CHECKLIST_ITEMS.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedItems(all);
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
  };

  const handleExamOptionSelect = (qId: string, optIdx: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  const handleExamSubmit = () => {
    setExamSubmitted(true);
  };

  const handleExamReset = () => {
    setExamAnswers({});
    setExamSubmitted(false);
  };

  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_MARK_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  }, [examAnswers]);

  const handleGenerateCertificate = () => {
    const newCert = generateMarkSafeCertificate(
      selectedPreset.licensePlate,
      selectedCorridor.id,
      simResult
    );
    setCertificates([newCert, ...certificates]);
    setActiveCert(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const filteredRegistry = certificates.filter(
    (c) =>
      c.certificateUid.toLowerCase().includes(registrySearch.toLowerCase()) ||
      c.vehiclePlate.toLowerCase().includes(registrySearch.toLowerCase()) ||
      c.corridorId.toLowerCase().includes(registrySearch.toLowerCase())
  );

  return (
    <div
      data-testid="mark-safe-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        data-testid="mark-safe-modal-content"
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden text-slate-100 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Eye className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  MARK-SAFE-AZ-2026
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  AAYDA & BDYP SCADA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  EN 1436 / AZS 410
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Magistral Yollarda Üfüqi Yol Nişanlanması Xətləri, Retrorefleksiya ($R_L$ / $Q_d$), Şüşə Mikrosferlər və Gecə Görünüşü Portalı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="mark-safe-close-btn"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-300" />
            <span>SCADA Dəhlizləri</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            data-testid="tab-simulator"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-300" />
            <span>Lazer Optika Laboratoriyası</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            data-testid="tab-presets"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-4 h-4 text-emerald-300" />
            <span>Avtomobil və İXM Cərimələri</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>10-Bəndlik Standart</span>
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'exam'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-300" />
            <span>İmtahan Simulyatoru</span>
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-300" />
            <span>Rəsmi Sertifikat</span>
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>Dövlət Reyestri</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto">
          {/* TAB 1: RADAR CORRIDORS */}
          {activeTab === 'radar' && (
            <div className="space-y-5" data-testid="radar-tab-content">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Azərbaycan Magistral Yollarında SCADA Lazer Retroreflektometr Şəbəkəsi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Mobil lazer skanerləri (CEN 30m həndəsəsi) və SCADA sensorları vasitəsilə üfüqi nişanlama xətlərinin canlı optik monitorinqi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-semibold text-emerald-400">6 Dəhliz Aktiv</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_MARK_CORRIDORS.map((c) => {
                  const isSelected = selectedCorridor.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleCorridorSelect(c)}
                      data-testid={`corridor-card-${c.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-emerald-300">
                          {c.route} • {c.chainageKm}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.scadaSensorCode}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">
                        {c.nameAz}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">{c.region}</p>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/40 text-center">
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">$R_L$ Quru</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {c.currentRlDry}
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">$R_w$ Nəm</span>
                          <span className="text-xs font-bold text-cyan-400">
                            {c.currentRwWet}
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">$Q_d$ Gündüz</span>
                          <span className="text-xs font-bold text-amber-400">
                            {c.currentQd}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>AADT: {c.aadtTraffic.toLocaleString()} avt/gün</span>
                        <span className="text-emerald-400 font-medium">Seç və Tətbiq Et</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LASER OPTICS SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6" data-testid="simulator-tab-content">
              {/* Interactive SVG Diagram */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 overflow-hidden shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Şüşə Mikrosferlərdə Daxili Qayıtma (Snell Optikası) və Gecə Yolu Vizualizasiyası
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    CEN 30m Prescribed Geometry: α=1.05°, ε=1.24°
                  </span>
                </div>

                <div className="relative w-full h-44 bg-slate-900/90 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 600 160">
                    {/* Road Surface Dark Asphalt */}
                    <rect x="0" y="100" width="600" height="60" fill="#0f172a" />
                    {/* Asphalt Texture speckles */}
                    <circle cx="50" cy="120" r="2" fill="#334155" />
                    <circle cx="150" cy="135" r="1.5" fill="#334155" />
                    <circle cx="280" cy="115" r="2" fill="#334155" />
                    <circle cx="420" cy="140" r="1.5" fill="#334155" />
                    <circle cx="550" cy="125" r="2" fill="#334155" />

                    {/* Thermoplastic Line Strip */}
                    <rect x="180" y="94" width="380" height="12" rx="2" fill="#f8fafc" opacity="0.95" />

                    {/* Water film layer if depth > 0 */}
                    {waterFilmDepthMm > 0 && (
                      <rect
                        x="180"
                        y={94 - Math.min(10, waterFilmDepthMm * 2.5)}
                        width="380"
                        height={12 + Math.min(10, waterFilmDepthMm * 2.5)}
                        fill="#06b6d4"
                        opacity={0.35}
                      />
                    )}

                    {/* Macro Glass Bead Close-up Sphere on left */}
                    <g transform="translate(80, 75)">
                      {/* Bead drop-on base paint layer */}
                      <rect x="-35" y="10" width="70" height="30" rx="3" fill="#ffffff" />
                      {/* Submerged portion indicator */}
                      <circle cx="0" cy="0" r="30" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
                      {/* Glass Sphere */}
                      <circle
                        cx="0"
                        cy="0"
                        r="30"
                        fill="url(#glassBeadGrad)"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                      />
                      {/* Paint Meniscus Embedment line */}
                      <line
                        x1="-30"
                        y1={30 - (beadEmbedmentPct / 100) * 60}
                        x2="30"
                        y2={30 - (beadEmbedmentPct / 100) * 60}
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="3,2"
                      />
                      {/* Ray tracing lines */}
                      <path
                        d="M -60 -40 L -12 -15 L 18 15 L 22 25 L -50 -30"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        strokeDasharray="4,2"
                      />
                      <text x="-32" y="-35" fill="#f59e0b" fontSize="8" fontWeight="bold">
                        Fənər Şüası
                      </text>
                      <text x="-40" y="-18" fill="#10b981" fontSize="8" fontWeight="bold">
                        Geri Retrorefleksiya
                      </text>
                    </g>

                    {/* Headlight beam on vehicle right side */}
                    <g transform="translate(560, 60)">
                      <circle cx="0" cy="0" r="10" fill="#fef08a" />
                      {/* Beam cone shining left */}
                      <polygon points="0,0 -380,42 -380,30" fill="url(#beamGrad)" opacity="0.45" />
                    </g>

                    {/* Gradients */}
                    <defs>
                      <radialGradient id="glassBeadGrad" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.7" />
                      </radialGradient>
                      <linearGradient id="beamGrad" x1="100%" y1="50%" x2="0%" y2="50%">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#fef08a" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Live metrics overlay */}
                    <text x="210" y="40" fill="#34d399" fontSize="11" fontWeight="bold">
                      {`Gecə Görünüş Məsafəsi: ${simResult.driverPreviewDistanceMeters} metr (${simResult.driverPreviewTimeSeconds} saniyə)`}
                    </text>
                    <text x="210" y="58" fill="#94a3b8" fontSize="10">
                      {`$R_L$ Əmsalı: ${simResult.dryRetroreflectivityRl} mcd/(m²·lx) | Su qatı: ${waterFilmDepthMm} mm`}
                    </text>
                  </svg>
                </div>
              </div>

              {/* Sliders & Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Speed Slider */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Hərəkət Sürəti</span>
                    <span className="text-emerald-400 font-bold">{vehicleSpeedKmH} km/saat</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="140"
                    step="5"
                    value={vehicleSpeedKmH}
                    onChange={(e) => setVehicleSpeedKmH(Number(e.target.value))}
                    data-testid="slider-speed"
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>30 km/h</span>
                    <span>90 km/h</span>
                    <span>140 km/h</span>
                  </div>
                </div>

                {/* Headlight Candela */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Fənər Parıltı Gücü (I-beam)</span>
                    <span className="text-emerald-400 font-bold">{headlightCandela.toLocaleString()} cd</span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="90000"
                    step="2500"
                    value={headlightCandela}
                    onChange={(e) => setHeadlightCandela(Number(e.target.value))}
                    data-testid="slider-headlight"
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>15,000 (Halogen)</span>
                    <span>50,000 (LED)</span>
                    <span>90,000 (Laser Matrix)</span>
                  </div>
                </div>

                {/* Bead Embedment % */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Mikrosfer Batma Dərinliyi ($E\%$)</span>
                    <span className="text-emerald-400 font-bold">{beadEmbedmentPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="1"
                    value={beadEmbedmentPct}
                    onChange={(e) => setBeadEmbedmentPct(Number(e.target.value))}
                    data-testid="slider-embedment"
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>20% (Qopma Riski)</span>
                    <span className="text-emerald-400 font-semibold">55% (Optimal)</span>
                    <span>90% (Korlaşma)</span>
                  </div>
                </div>

                {/* Refractive Index n */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Şüşə Sınma Əmsalı ($n$)</span>
                    <span className="text-emerald-400 font-bold">{refractiveIndex.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.50"
                    max="1.95"
                    step="0.05"
                    value={refractiveIndex}
                    onChange={(e) => setRefractiveIndex(Number(e.target.value))}
                    data-testid="slider-refractive-index"
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>n=1.50 (Soda-əhəng)</span>
                    <span>n=1.90 (Titan Dioksid)</span>
                  </div>
                </div>

                {/* Water Film Depth mm */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Yağış Su Təbəqəsi Dərinliyi</span>
                    <span className="text-cyan-400 font-bold">{waterFilmDepthMm.toFixed(1)} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="4.0"
                    step="0.2"
                    value={waterFilmDepthMm}
                    onChange={(e) => setWaterFilmDepthMm(Number(e.target.value))}
                    data-testid="slider-water-depth"
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0.0 mm (Quru)</span>
                    <span>1.5 mm (Nəm)</span>
                    <span>4.0 mm (Leysan)</span>
                  </div>
                </div>

                {/* Marking Material Select */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Nişanlama Materialının Növü
                  </label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value as MarkingMaterialType)}
                    data-testid="select-material-type"
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="THERMOPLASTIC_EXTRUDED">Termoplastik Ekstruziya (3.0 mm)</option>
                    <option value="COLD_PLASTIC_MMA">Soyuq Plastik MMA (2.5 mm)</option>
                    <option value="POLYURETHANE_STRUCTURED_RIBBED">Səsli Profilli Poliuretan (Ribbed 8.0 mm)</option>
                    <option value="WATERBORNE_ACRYLIC_PAINT">Su Əsaslı Akril Boya (0.6 mm)</option>
                  </select>
                </div>
              </div>

              {/* Key Output Evaluation Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-emerald-500/40 shadow-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs text-slate-400 block">$R_L$ Retrorefleksiya</span>
                    <span className="text-xl font-black text-emerald-400 mt-1 block">
                      {simResult.dryRetroreflectivityRl} <span className="text-xs font-normal">mcd</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Standart: ≥150 mcd</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Zolaq Baxış Məsafəsi</span>
                    <span className="text-xl font-black text-white mt-1 block">
                      {simResult.driverPreviewDistanceMeters} <span className="text-xs font-normal">metr</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Öncədən Görmə: {simResult.driverPreviewTimeSeconds} san
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs text-slate-400 block">EN 1436 Sinifi</span>
                    <span className="text-lg font-bold text-amber-400 mt-1 block">
                      {simResult.retroreflectivityTier.replace('CLASS_', '')}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Optik Fayda: {simResult.glassBeadOpticalEfficiencyPct}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Təhlükəsizlik Statusu</span>
                    <span
                      className={`text-sm font-bold mt-2 block ${
                        simResult.statutoryCompliancePassed
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {simResult.statutoryCompliancePassed ? 'UYĞUNDUR (PASS)' : 'UYĞUN DEYİL (DEFICIENT)'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {simResult.previewSafetyStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-emerald-400 mr-1">Rəsmi Rəy:</span>
                  {simResult.recommendationAz}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS & SANCTIONS */}
          {activeTab === 'presets' && (
            <div className="space-y-6" data-testid="presets-tab-content">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  Nəqliyyat Vasitələri Fənər Hündürlüyü və Fotonik Presetləri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_MARK_VEHICLE_PRESETS.map((p) => {
                    const isSelected = selectedPreset.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleApplyPreset(p)}
                        data-testid={`preset-card-${p.id}`}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 border border-slate-700 text-amber-300">
                            {p.licensePlate}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {p.nominalSpeedKmH} km/h
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1">{p.nameAz}</h4>
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <div>Fənər Gücü: {p.headlightCandela.toLocaleString()} cd</div>
                          <div>Sürücü Göz Səviyyəsi: {p.driverEyeHeightM} m</div>
                          <div>Fənər Quraşdırma Hündürlüyü: {p.headlightMountHeightM} m</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Administrative Sanctions Stand */}
              <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Azərbaycan İnzibati Xətalar Məcəlləsi (İXM) üzrə Cərimə Standı
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setViolationType('LINE_DEPARTURE_327_1')}
                    data-testid="violation-btn-327-1"
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      violationType === 'LINE_DEPARTURE_327_1'
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">İXM 327.1</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      1.1 Bütöv xəttin tələbinin pozulması (40 AZN)
                    </div>
                  </button>

                  <button
                    onClick={() => setViolationType('DOUBLE_SOLID_CROSSING_327_2')}
                    data-testid="violation-btn-327-2"
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      violationType === 'DOUBLE_SOLID_CROSSING_327_2'
                        ? 'bg-rose-500/20 border-rose-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">İXM 327.2</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      1.3 İkiqat bütöv xətti keçmə (60 AZN + 3 bal)
                    </div>
                  </button>

                  <button
                    onClick={() => setViolationType('MARKING_DAMAGE_353')}
                    data-testid="violation-btn-353"
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      violationType === 'MARKING_DAMAGE_353'
                        ? 'bg-red-500/20 border-red-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">İXM 353.1</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Yol nişanlama örtüyünü zədələmə (150 AZN)
                    </div>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block">{sanctionResult.legalBasisAz}</span>
                    <span className="text-xs text-emerald-400 font-semibold mt-1 block">
                      İXM Maddə 38: 30 gün ərzində ödənildikdə 50% ENDİRİM tətbiq edilir!
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">
                      Tam: <span className="line-through">{sanctionResult.statutoryBaseFineAzn} AZN</span>
                    </div>
                    <div className="text-xl font-black text-emerald-400">
                      {sanctionResult.promptDiscountFineAzn} {currency}
                    </div>
                    {sanctionResult.penaltyPoints > 0 && (
                      <div className="text-xs text-rose-400 font-bold">
                        +{sanctionResult.penaltyPoints} Cərimə Balı
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT TECHNICAL CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4" data-testid="checklist-tab-content">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    AZS 410, AZS 342 & EN 1436 Nişanlama Qaydaları Yoxlama Vərəqəsi
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    10 vacib texniki standart və retrorefleksiya meyarları
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    data-testid="checklist-select-all"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    data-testid="checklist-reset"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {MOCK_MARK_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/25 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{item.titleAz}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono">
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

          {/* TAB 5: THEORETICAL EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-5" data-testid="exam-tab-content">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Yol Nişanlanması və Gecə Təhlükəsizliyi İmtahan Standı (10 Sual)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AZS 410, İXM 327 və EN 1436 maddələri üzrə biliyin yoxlanılması
                  </p>
                </div>
                {examSubmitted ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300">
                      Nəticə: <span className="font-bold text-emerald-400">{examScore} / 10</span>
                    </span>
                    <button
                      onClick={handleExamReset}
                      data-testid="exam-reset-btn"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Yenidən Başla
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleExamSubmit}
                    data-testid="exam-submit-btn"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    Cavabları Təsdiqlə
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_MARK_EXAM_QUESTIONS.map((q, qIndex) => {
                  const userAnswer = examAnswers[q.id];
                  const isCorrect = userAnswer === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 text-xs flex items-center justify-center font-bold">
                          {qIndex + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white flex-1">{q.questionAz}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.optionsAz.map((opt, oIndex) => {
                          const isOptionSelected = userAnswer === oIndex;
                          let btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800';

                          if (examSubmitted) {
                            if (oIndex === q.correctIndex) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-emerald-600/30 border-emerald-500 text-white font-bold';
                          }

                          return (
                            <button
                              key={oIndex}
                              onClick={() => handleExamOptionSelect(q.id, oIndex)}
                              data-testid={`exam-q-${qIndex}-opt-${oIndex}`}
                              className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div
                          className={`p-3 rounded-lg text-xs ${
                            isCorrect ? 'bg-emerald-950/40 text-emerald-300' : 'bg-rose-950/40 text-rose-300'
                          }`}
                        >
                          <div className="font-semibold mb-1">
                            {isCorrect ? 'Düzgün Cavab!' : 'Səhv Cavab!'}
                          </div>
                          <div className="text-[11px] text-slate-300">{q.explanationAz}</div>
                          <div className="text-[10px] text-amber-400 mt-1 font-mono">{q.legalCitation}</div>
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
            <div className="space-y-5" data-testid="certificate-tab-content">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    MARK-SAFE-AZ-2026 Rəsmi Elektron Texniki Sertifikat
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və BDYP tərəfindən SİMA Rəqəmsal İmza ilə təsdiqlənmiş lisenziyalı sənəd
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateCertificate}
                    data-testid="cert-generate-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Yeni Sertifikat Tərtib Et</span>
                  </button>
                  <button
                    onClick={handlePrintCertificate}
                    data-testid="cert-print-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Printable Certificate Layout */}
              <div
                id="printable-mark-certificate"
                className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/50 shadow-2xl space-y-6 text-slate-200"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-white tracking-widest uppercase">
                      AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ
                    </h2>
                    <h3 className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mt-0.5">
                      BAŞ DÖVLƏT YOL POLİSİ İDARƏSİ (BDYP) İLƏ BİRGƏ TƏHLÜKƏSİZLİK LİSENZİYASI
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400 block">
                      {activeCert.certificateUid}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      PIN: {activeCert.verificationPin}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Nəqliyyat Qeydiyyatı</span>
                    <span className="text-sm font-mono font-bold text-amber-300 mt-1 block">
                      {activeCert.vehiclePlate}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Ölçülən $R_L$ Quru</span>
                    <span className="text-sm font-bold text-emerald-400 mt-1 block">
                      {activeCert.measuredRlDry} mcd/(m²·lx)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Gecə Baxış Məsafəsi</span>
                    <span className="text-sm font-bold text-white mt-1 block">
                      {activeCert.previewDistanceMeters} metr ({activeCert.previewTimeSeconds}s)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">EN 1436 Təsnifatı</span>
                    <span className="text-sm font-bold text-amber-300 mt-1 block">
                      {activeCert.tier}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Təftiş Dəhlizi:</span>
                    <span className="text-white font-medium">{activeCert.corridorId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verilmə Tarixi:</span>
                    <span className="text-white font-medium">
                      {new Date(activeCert.inspectionDateIso).toLocaleDateString('az-AZ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Etibarlılıq Müddəti:</span>
                    <span className="text-white font-medium">
                      {new Date(activeCert.validUntilIso).toLocaleDateString('az-AZ')} (6 ay)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-[10px] text-slate-400 font-mono">
                  <div>
                    <span>SİMA UID: {activeCert.simaDigitalUid}</span>
                    <div className="text-[9px] text-slate-500">{activeCert.sha256Checksum}</div>
                  </div>
                  <button
                    onClick={() => handleCopyCode(activeCert.certificateUid)}
                    data-testid="cert-copy-btn"
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: UNIFIED PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4" data-testid="registry-tab-content">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Vahid İctimai AAYDA & BDYP Nişanlama Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sistemdə təsdiqlənmiş aktiv MARK-SAFE-AZ-2026 sertifikatları
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="UID və ya Dövlət Nömrə Nişanı..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    data-testid="registry-search-input"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredRegistry.map((cert) => (
                  <div
                    key={cert.certificateUid}
                    data-testid={`registry-row-${cert.certificateUid}`}
                    className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/60 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {cert.certificateUid}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                          {cert.vehiclePlate}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          {cert.tier}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Dəhliz: {cert.corridorId} • Ölçülən $R_L$: {cert.measuredRlDry} mcd • Baxış: {cert.previewDistanceMeters} m ({cert.previewTimeSeconds}s)
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setActiveCert(cert);
                          setActiveTab('certificate');
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer"
                      >
                        Bax
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Standartlar: AZS 410, AZS 342, EN 1436, EN 1423, ASTM E1710</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">İXM Maddə 327.1 / 327.2 / 353</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
