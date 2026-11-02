import React, { useState, useId } from 'react';
import {
  X,
  SunMedium,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sliders,
  CheckCircle2,
  FileText,
  Printer,
  Copy,
  Search,
  Zap,
  Gauge,
  Lightbulb,
  Radio,
  Eye,
  Award,
  RefreshCw,
} from 'lucide-react';
import {
  Currency,
  En13201LightingClass,
  RoadSurfaceReflectionClass,
  LuminaireOpticalType,
  LightCorridorAsset,
  LightVehiclePreset,
  LightChecklistItem,
  LightSafeCertificate,
  calculateHighwayPhotometrics,
  evaluateLightChecklist,
  gradeLightExam,
  generateLightSafeCertificate,
  searchLightCertificates,
  convertLightCurrency,
} from '../utils/lightSafeCompliance';
import {
  MOCK_LIGHT_CORRIDORS,
  MOCK_LIGHT_VEHICLE_PRESETS,
  MOCK_LIGHT_CHECKLIST,
  MOCK_LIGHT_EXAM_QUESTIONS,
  MOCK_LIGHT_CERTIFICATES,
} from '../data/mockLightSafeData';

interface LightSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType = 'radar' | 'simulator' | 'vehicles' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const LightSafeModal: React.FC<LightSafeModalProps> = ({
  isOpen,
  onClose,
  currency: initialCurrency = 'AZN',
}) => {
  const gradientId = useId();
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialCurrency);
  const [selectedCorridor, setSelectedCorridor] = useState<LightCorridorAsset>(MOCK_LIGHT_CORRIDORS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<LightVehiclePreset>(MOCK_LIGHT_VEHICLE_PRESETS[0]);

  // Simulation inputs
  const [vehicleSpeedKmH, setVehicleSpeedKmH] = useState<number>(selectedCorridor.speedLimitKmH);
  const [luminaireFluxLumens, setLuminaireFluxLumens] = useState<number>(selectedCorridor.lampFluxLumens);
  const [poleSpacingM, setPoleSpacingM] = useState<number>(selectedCorridor.poleSpacingM);
  const [mountingHeightM, setMountingHeightM] = useState<number>(selectedCorridor.mountingHeightM);
  const [roadWidthM, setRoadWidthM] = useState<number>(selectedCorridor.roadWidthM);
  const [dimmingLevelPct, setDimmingLevelPct] = useState<number>(100);
  const [pavementType, setPavementType] = useState<RoadSurfaceReflectionClass>(selectedCorridor.pavementClass);
  const [opticalType, setOpticalType] = useState<LuminaireOpticalType>(selectedCorridor.luminaireType);
  const [headlightBeamAssistance, setHeadlightBeamAssistance] = useState<boolean>(true);

  // Checklist & Exam state
  const [checklist, setChecklist] = useState<LightChecklistItem[]>(MOCK_LIGHT_CHECKLIST);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificates & Registry
  const [registry, setRegistry] = useState<LightSafeCertificate[]>(MOCK_LIGHT_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<LightSafeCertificate | null>(MOCK_LIGHT_CERTIFICATES[0]);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculation Result
  const simResult = calculateHighwayPhotometrics(
    {
      vehicleSpeedKmH,
      luminaireFluxLumens,
      poleSpacingM,
      mountingHeightM,
      roadWidthM,
      dimmingLevelPct,
      pavementType,
      opticalType,
      headlightBeamAssistance,
    },
    selectedCorridor.speedLimitKmH
  );

  const checklistResult = evaluateLightChecklist(checklist);
  const examResult = gradeLightExam(MOCK_LIGHT_EXAM_QUESTIONS, examAnswers);

  const handleCorridorSelect = (corridor: LightCorridorAsset) => {
    setSelectedCorridor(corridor);
    setVehicleSpeedKmH(corridor.speedLimitKmH);
    setLuminaireFluxLumens(corridor.lampFluxLumens);
    setPoleSpacingM(corridor.poleSpacingM);
    setMountingHeightM(corridor.mountingHeightM);
    setRoadWidthM(corridor.roadWidthM);
    setPavementType(corridor.pavementClass);
    setOpticalType(corridor.luminaireType);
    setDimmingLevelPct(100);
  };

  const handleVehicleSelect = (vehicle: LightVehiclePreset) => {
    setSelectedVehicle(vehicle);
    setVehicleSpeedKmH(vehicle.nominalApproachSpeedKmH);
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const handleCheckAll = () => {
    setChecklist(prev => prev.map(item => ({ ...item, passed: true })));
  };

  const handleExamOptionSelect = (qId: string, optIndex: number) => {
    if (examSubmitted) return;
    setExamAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleQuickFillExam = () => {
    const perfect: Record<string, number> = {};
    MOCK_LIGHT_EXAM_QUESTIONS.forEach(q => {
      perfect[q.id] = q.correctOptionIndex;
    });
    setExamAnswers(perfect);
  };

  const handleGenerateCertificate = () => {
    const newCert = generateLightSafeCertificate({
      corridor: selectedCorridor,
      vehicle: selectedVehicle,
      simulation: simResult,
    });
    setRegistry(prev => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} kopyalandı!`);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredRegistry = searchLightCertificates(registrySearch, registry);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="light-safe-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl my-auto bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <SunMedium className="w-6 h-6 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 bg-amber-500/20 rounded border border-amber-500/30 uppercase">
                  AAYDA • AZƏRİŞIQ • BDYP
                </span>
                <span className="text-xs text-amber-400/80 hidden sm:inline">
                  EN 13201 / CIE 115 / AZS 410
                </span>
              </div>
              <h2
                id="light-safe-modal-title"
                className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2"
              >
                Magistral Ağıllı Yol İşıqlandırması və Fotometriya Portalı
                <span className="text-xs font-normal text-amber-400">LIGHT-SAFE-AZ-2026</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map(curr => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2 py-1 rounded font-medium transition-all ${
                    selectedCurrency === curr
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="light-safe-close-btn"
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 overflow-x-auto text-xs sm:text-sm scrollbar-none">
          {[
            { id: 'radar', label: 'Dəhlizlər Radarı', icon: Radio },
            { id: 'simulator', label: 'Fotometriya Simulyatoru', icon: Sliders },
            { id: 'vehicles', label: 'Nəqliyyat & İXM Cərimələr', icon: Eye },
            { id: 'checklist', label: 'Texniki Standartlar (10)', icon: CheckCircle2 },
            { id: 'exam', label: 'İmtahan & Test (10)', icon: Award },
            { id: 'certificate', label: 'LIGHT-SAFE Sertifikatı', icon: FileText },
            { id: 'registry', label: 'Vahid Reyestr', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`light-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-300 text-sm">
          {copyFeedback && (
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{copyFeedback}</span>
            </div>
          )}

          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-amber-400" />
                    Respublika Magistral Ağıllı İşıqlandırma SCADA Şəbəkəsi
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və Azərişıq ASC SCADA mərkəzi tərəfindən idarə olunan 6 strateji magistral dəhliz
                  </p>
                </div>
                <div className="text-xs font-mono px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg">
                  Aktiv Dəhliz: {selectedCorridor.chainageKm}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_LIGHT_CORRIDORS.map(corridor => {
                  const isSelected = selectedCorridor.id === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => handleCorridorSelect(corridor)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/20 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                            Sinif {corridor.lightingClass}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {corridor.scadaSensorCode}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-100 text-sm mt-2">{corridor.nameAz}</h4>
                        <p className="text-xs text-slate-400 mt-1">{corridor.region}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Fənər / Güc</span>
                          <span className="text-slate-200 font-medium">
                            {corridor.luminairePowerWatts}W ({corridor.lampFluxLumens.toLocaleString()} lm)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Addım / Hündürlük</span>
                          <span className="text-slate-200 font-medium">
                            {corridor.poleSpacingM}m / {corridor.mountingHeightM}m
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Yol Eni</span>
                          <span className="text-slate-200 font-medium">{corridor.roadWidthM}m</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Yol Sürət Həddi</span>
                          <span className="text-amber-400 font-bold">{corridor.speedLimitKmH} km/s</span>
                        </div>
                      </div>

                      <div className="mt-3 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        ⚡ {corridor.substationFeed}
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
              {/* SVG 2D Visualization Diagram */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <SunMedium className="w-4 h-4 text-amber-400 animate-spin" />
                    Fotometrik Şüalanma və Görmə Xətti Vizualizasiyası (EN 13201)
                  </span>
                  <span className="font-mono text-slate-400">
                    L_avg: {simResult.averageLuminanceCdM2} cd/m² • U₀: {simResult.overallUniformityU0} • TI: {simResult.thresholdIncrementTiPct}%
                  </span>
                </div>

                <div className="w-full h-48 sm:h-56 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`lightBeam-${gradientId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                        <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id={`headlightBeam-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Road Surface */}
                    <rect x="0" y="180" width="800" height="60" fill="#1e293b" />
                    {/* Road Markings Dashed Line */}
                    <line x1="0" y1="210" x2="800" y2="210" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="18,14" />

                    {/* Light Poles & Cones */}
                    {[120, 360, 600].map((xPole, idx) => (
                      <g key={idx}>
                        {/* Light Cone Polygon */}
                        <polygon
                          points={`${xPole},40 ${xPole - 110},180 ${xPole + 110},180`}
                          fill={`url(#lightBeam-${gradientId})`}
                          opacity={dimmingLevelPct / 100}
                        />
                        {/* Pole Mast */}
                        <line x1={xPole} y1="40" x2={xPole} y2="180" stroke="#94a3b8" strokeWidth="3" />
                        {/* Bracket Arm */}
                        <line x1={xPole} y1="40" x2={xPole + 15} y2="35" stroke="#cbd5e1" strokeWidth="2.5" />
                        {/* Luminaire Fixture with Glow */}
                        <circle cx={xPole + 15} cy="35" r="5" fill="#fef08a" />
                        <circle cx={xPole + 15} cy="35" r="10" fill="#f59e0b" opacity="0.4" />
                      </g>
                    ))}

                    {/* Moving Car */}
                    <g transform="translate(180, 160)">
                      {/* Car Body */}
                      <rect x="0" y="14" width="70" height="20" rx="4" fill="#3b82f6" />
                      <rect x="14" y="2" width="38" height="15" rx="3" fill="#60a5fa" />
                      {/* Windows */}
                      <rect x="18" y="5" width="14" height="10" rx="1" fill="#0f172a" />
                      <rect x="35" y="5" width="14" height="10" rx="1" fill="#0f172a" />
                      {/* Wheels */}
                      <circle cx="16" cy="35" r="7" fill="#020617" />
                      <circle cx="54" cy="35" r="7" fill="#020617" />
                      {/* Headlight beam */}
                      {headlightBeamAssistance && (
                        <polygon
                          points="70,22 280,10 280,38 70,26"
                          fill={`url(#headlightBeam-${gradientId})`}
                          opacity="0.65"
                        />
                      )}
                    </g>

                    {/* Pedestrian / Obstacle at Detection Distance */}
                    <g transform="translate(470, 155)">
                      <circle cx="5" cy="5" r="4" fill="#f87171" />
                      <line x1="5" y1="9" x2="5" y2="24" stroke="#f87171" strokeWidth="2.5" />
                      <line x1="1" y1="14" x2="9" y2="14" stroke="#f87171" strokeWidth="2" />
                      <line x1="5" y1="24" x2="1" y2="34" stroke="#f87171" strokeWidth="2" />
                      <line x1="5" y1="24" x2="9" y2="34" stroke="#f87171" strokeWidth="2" />
                    </g>

                    {/* Distance Indicators */}
                    <line x1="250" y1="140" x2="470" y2="140" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
                    <text x="360" y="132" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">
                      Görmə Məsafəsi: {simResult.driverDetectionDistanceM} m (Dayanma: {simResult.stoppingDistanceM} m)
                    </text>
                  </svg>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
                {/* Speed Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Nəqliyyatın Sürəti</span>
                    <span className="text-amber-400 font-bold">{vehicleSpeedKmH} km/s</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="160"
                    step="5"
                    value={vehicleSpeedKmH}
                    onChange={e => setVehicleSpeedKmH(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>30 km/s</span>
                    <span>Limit: {selectedCorridor.speedLimitKmH} km/s</span>
                    <span>160 km/s</span>
                  </div>
                </div>

                {/* Luminaire Flux */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Fənərin İşıq Seli (Flux)</span>
                    <span className="text-amber-400 font-bold">{luminaireFluxLumens.toLocaleString()} lm</span>
                  </div>
                  <input
                    type="range"
                    min="8000"
                    max="45000"
                    step="1000"
                    value={luminaireFluxLumens}
                    onChange={e => setLuminaireFluxLumens(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>8,000 lm</span>
                    <span>45,000 lm</span>
                  </div>
                </div>

                {/* Pole Spacing */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Dirəklərarası Məsafə (Spacing)</span>
                    <span className="text-amber-400 font-bold">{poleSpacingM} m</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="70"
                    step="1"
                    value={poleSpacingM}
                    onChange={e => setPoleSpacingM(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>25 m</span>
                    <span>70 m</span>
                  </div>
                </div>

                {/* Mounting Height */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Quraşdırılma Hündürlüyü (H)</span>
                    <span className="text-amber-400 font-bold">{mountingHeightM} m</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    step="1"
                    value={mountingHeightM}
                    onChange={e => setMountingHeightM(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>8 m</span>
                    <span>32 m</span>
                  </div>
                </div>

                {/* Road Width */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Yol Hissəsinin Eni (W)</span>
                    <span className="text-amber-400 font-bold">{roadWidthM} m</span>
                  </div>
                  <input
                    type="range"
                    min="7"
                    max="32"
                    step="1"
                    value={roadWidthM}
                    onChange={e => setRoadWidthM(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>7 m (2 zolaq)</span>
                    <span>32 m (8 zolaq)</span>
                  </div>
                </div>

                {/* Dimming Level */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">DALI Ağıllı Dimming Faizi</span>
                    <span className="text-amber-400 font-bold">{dimmingLevelPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={dimmingLevelPct}
                    onChange={e => setDimmingLevelPct(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>20% (Gecə 03:00)</span>
                    <span>100% (Pik)</span>
                  </div>
                </div>
              </div>

              {/* Toggles & Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Asfalt Səthinin Əks-Etdirmə Sinfi</label>
                  <select
                    value={pavementType}
                    onChange={e => setPavementType(e.target.value as RoadSurfaceReflectionClass)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="R1_LIGHT_CONCRETE">R1: Açıq Rəngli Beton (q₀ = 0.10)</option>
                    <option value="R2_SMA_POROUS">R2: Məsaməli SMA Asfalt (q₀ = 0.07)</option>
                    <option value="R3_DENSE_ASPHALT">R3: Qara Sıx Asfalt-Beton (q₀ = 0.07)</option>
                    <option value="R4_DARK_BITUMINOUS">R4: Tünd Qudron Bitum (q₀ = 0.08)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Optik İşıq Paylanması Tipi</label>
                  <select
                    value={opticalType}
                    onChange={e => setOpticalType(e.target.value as LuminaireOpticalType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="SMART_LED_BATWING">Smart LED Batwing (Optik linzalı geniş)</option>
                    <option value="ASYMMETRIC_CUTOFF">Asimmetrik Cut-Off (Qler əleyhinə pərdəli)</option>
                    <option value="HIGH_PRESSURE_SODIUM_LEGACY">Natrium HPS İrsi Sarı (Köhnə tip)</option>
                    <option value="HIGH_MAST_FLOODLIGHT">High-Mast Qüllə Projektor (30m+)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700">
                  <div>
                    <span className="font-semibold text-slate-200 block">Avtomobil Fənərləri</span>
                    <span className="text-[10px] text-slate-400">Yaxın vuran işıqlar açıqdır</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={headlightBeamAssistance}
                    onChange={e => setHeadlightBeamAssistance(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Performance Key Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Orta İşıqlanma</span>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">{simResult.averageIlluminanceLux} lx</div>
                  <span className="text-[10px] text-slate-500">Min: {simResult.minimumIlluminanceLux} lx</span>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Orta Parlaqlıq</span>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">{simResult.averageLuminanceCdM2} cd/m²</div>
                  <span className="text-[10px] text-slate-500">L_avg (EN 13201)</span>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ümumi Bərabərlik U₀</span>
                  <div className={`text-lg font-bold mt-0.5 ${simResult.overallUniformityU0 >= 0.40 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simResult.overallUniformityU0}
                  </div>
                  <span className="text-[10px] text-slate-500">Tələb: ≥ 0.40</span>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Qler Həddi TI%</span>
                  <div className={`text-lg font-bold mt-0.5 ${simResult.thresholdIncrementTiPct <= 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {simResult.thresholdIncrementTiPct}%
                  </div>
                  <span className="text-[10px] text-slate-500">Maks: ≤ 15%</span>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Görmə Məsafəsi</span>
                  <div className="text-lg font-bold text-sky-400 mt-0.5">{simResult.driverDetectionDistanceM} m</div>
                  <span className="text-[10px] text-slate-500">Dayanma: {simResult.stoppingDistanceM} m</span>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Qazanılmış Sinif</span>
                  <div className="text-lg font-bold text-purple-400 mt-0.5">Sinif {simResult.targetLightingClassAchieved}</div>
                  <span className="text-[10px] text-slate-500">EN 13201 Tiers</span>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  simResult.safetyStatus === 'OPTIMAL_VISION_CLEAR'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : simResult.safetyStatus === 'ACCEPTABLE_STANDARD'
                    ? 'bg-sky-950/30 border-sky-500/40 text-sky-300'
                    : simResult.safetyStatus === 'POOR_UNIFORMITY_HAZARD'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-sm">
                    {simResult.safetyStatus === 'OPTIMAL_VISION_CLEAR' && 'İşıqlandırma Optimaldır — Hərəkət Tam Təhlükəsizdir'}
                    {simResult.safetyStatus === 'ACCEPTABLE_STANDARD' && 'İşıqlandırma Qəbulolunandır — Standartlara Uyğundur'}
                    {simResult.safetyStatus === 'POOR_UNIFORMITY_HAZARD' && 'Bərabərlik Zəifdir — Parıltı və Kölgə Riski Mövcuddur'}
                    {simResult.safetyStatus === 'CRITICAL_UNDERLIT_BLINDSPOT' && 'TƏHLÜKƏLİ QARANLIQ ZONA — Görünüş Məsafəsi Çatmır!'}
                  </div>
                  <div className="mt-1">
                    Görmə Ehtiyat Məsafəsi: <span className="font-bold">{simResult.sightMarginDistanceM} metr</span>.
                    {simResult.safetyRecommendationsAz[0]}
                  </div>
                </div>
                <button
                  onClick={handleGenerateCertificate}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap"
                >
                  Sertifikat Tərtib Et
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLES & FINES */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  Nəqliyyat İşıq Profilləri və İnzibati Xətalar Məcəlləsi (İXM) Sanksiyaları
                </h3>
                <p className="text-xs text-slate-400">
                  İşıq cihazlarının qaydalara uyğun istifadəsi və gecə saatlarında sürət həddinə nəzarət
                </p>
              </div>

              {/* Vehicle Preset Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_LIGHT_VEHICLE_PRESETS.map(veh => {
                  const isSelected = selectedVehicle.id === veh.id;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => handleVehicleSelect(veh)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-400">
                          {veh.licensePlate}
                        </span>
                        <span className="text-[10px] text-slate-400">Görmə: {veh.driverNightVisionScorePct}%</span>
                      </div>
                      <h4 className="font-semibold text-slate-200 text-xs mt-2">{veh.nameAz}</h4>
                      <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                        <span>Fənər İşığı: {veh.headlightLuminousFluxLm} lm</span>
                        <span>Şüa: {veh.beamRangeMeters} m</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Penalty and Compliance Card */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-4">
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Hüquqi Qiymətləndirmə və İXM Maddələri
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Tətbiq Olunan Cərimə</span>
                    <span className="text-base font-bold text-amber-400">
                      {convertLightCurrency(simResult.statutoryFineAzn, selectedCurrency)} {selectedCurrency}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">İXM Maddə 38 (50% Güzəşt)</span>
                    <span className="text-base font-bold text-emerald-400">
                      {convertLightCurrency(simResult.statutoryFineDiscountedAzn, selectedCurrency)} {selectedCurrency}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Cərimə Balı</span>
                    <span className="text-base font-bold text-purple-400">{simResult.penaltyPoints} Bal</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Sürət Artımı</span>
                    <span className="text-base font-bold text-slate-200">+{simResult.speedExcessKmH} km/s</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Pozuntu Təsviri:</span>
                  <span className="text-slate-200">{simResult.violationDescriptionAz}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    10 Maddəlik Magistral İşıqlandırma və Elektrik Təhlükəsizlik Yoxlaması
                  </h3>
                  <p className="text-xs text-slate-400">
                    EN 13201-2, CIE 115, AZS 410 və Azərişıq ASC normativ aktlarına uyğunluq
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-700 text-amber-300">
                    Uyğunluq: {checklistResult.compliancePercentage}% ({checklistResult.passedCount}/{checklistResult.totalCount})
                  </span>
                  <button
                    onClick={handleCheckAll}
                    className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium"
                  >
                    Hamısını Seç
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      item.passed
                        ? 'bg-slate-800/60 border-emerald-500/30 text-slate-200'
                        : 'bg-slate-800/20 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.passed}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">{item.titleAz}</span>
                        <span className="text-[10px] font-mono text-amber-400/80">{item.standardRef}</span>
                      </div>
                      <p className="text-slate-400 mt-1">{item.descriptionAz}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Magistral İşıqlandırma və Gecə Hərəkəti Təhlükəsizliyi İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    YHQ, İXM və EN 13201 üzrə 10 rəsmi nəzəri test sualı (Keçid balı: 80%)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuickFillExam}
                    className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs"
                  >
                    Avtomatik Doldur
                  </button>
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Nəticəni Yoxla
                  </button>
                </div>
              </div>

              {examSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    examResult.passed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">
                      {examResult.passed ? '🎉 İMTAHAN UĞURLA BAŞA ÇATDI!' : '❌ İMTAHAN BƏRPA OLUNMADI'}
                    </span>
                    <span className="text-xs">
                      Toplanan bal: {examResult.scorePercentage}% ({examResult.correctAnswers}/{examResult.totalQuestions})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    Yenidən Başla
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_LIGHT_EXAM_QUESTIONS.map((q, qIndex) => {
                  const selectedOpt = examAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctOptionIndex;
                  return (
                    <div key={q.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-100 text-xs">
                          {qIndex + 1}. {q.questionAz}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{q.legalReference}</span>
                      </div>

                      <div className="space-y-1.5">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optionClasses = 'bg-slate-800/70 border-slate-700 text-slate-300';
                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optionClasses = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected) {
                              optionClasses = 'bg-rose-950/40 border-rose-500 text-rose-200';
                            }
                          } else if (isOptionSelected) {
                            optionClasses = 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold';
                          }

                          return (
                            <div
                              key={optIdx}
                              onClick={() => handleExamOptionSelect(q.id, optIdx)}
                              className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${optionClasses}`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                          <span className="text-amber-400 font-semibold block">İzah:</span>
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
          {activeTab === 'certificate' && activeCertificate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400">
                  Rəsmi Dövlət AAYDA & Azərişıq Elektron Fotometrik Uyğunluq Sertifikatı
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeCertificate.certificateId, 'Sertifikat Nömrəsi')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Kopyala
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Çap Et
                  </button>
                </div>
              </div>

              {/* Printable Voucher */}
              <div className="p-6 bg-slate-950 border-2 border-amber-500/40 rounded-2xl shadow-xl text-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <SunMedium className="w-6 h-6 text-amber-400" />
                      <span className="text-lg font-bold text-amber-400">LIGHT-SAFE-AZ-2026</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Azərbaycan Avtomobil Yolları Dövlət Agentliyi & "Azərişıq" ASC
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-400 block">Sertifikat ID:</span>
                    <span className="text-sm font-mono font-bold text-amber-300">
                      {activeCertificate.certificateId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Magistral Dəhliz:</span>
                    <span className="font-semibold text-slate-100">{activeCertificate.corridor.nameAz}</span>
                    <span className="text-[10px] text-slate-400 block">Piketi: {activeCertificate.corridor.chainageKm}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nəqliyyat Vasitəsi:</span>
                    <span className="font-semibold text-slate-100">{activeCertificate.vehicle.nameAz}</span>
                    <span className="text-[10px] text-amber-400 font-mono block">DQN: {activeCertificate.vehicle.licensePlate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Təsdiq Nəticəsi:</span>
                    <span
                      className={`font-bold inline-block px-2 py-0.5 rounded text-[11px] ${
                        activeCertificate.clearanceOutcome === 'APPROVED_OPTIMAL_LIGHTING'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : activeCertificate.clearanceOutcome === 'CONDITIONAL_MAINTENANCE_REQUIRED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {activeCertificate.clearanceOutcome}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Orta Parlaqlıq L_avg</span>
                    <span className="font-bold text-slate-100">{activeCertificate.simulation.averageLuminanceCdM2} cd/m²</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ümumi Bərabərlik U₀</span>
                    <span className="font-bold text-slate-100">{activeCertificate.simulation.overallUniformityU0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Korlaşdırıcı Parıltı TI%</span>
                    <span className="font-bold text-slate-100">{activeCertificate.simulation.thresholdIncrementTiPct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Görmə Məsafəsi</span>
                    <span className="font-bold text-emerald-400">{activeCertificate.simulation.driverDetectionDistanceM} m</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-4 text-[11px] text-slate-400 gap-2">
                  <div>
                    <span>SİMA UID: </span>
                    <span className="font-mono text-amber-300">{activeCertificate.simaSignatureUid}</span>
                    <span className="mx-2">•</span>
                    <span>PİN: </span>
                    <span className="font-mono text-slate-200">{activeCertificate.verificationPin}</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    SHA256: {activeCertificate.sha256Seal}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={e => setRegistrySearch(e.target.value)}
                    placeholder="Sertifikat ID, DQN, dəhliz və ya SİMA UID üzrə axtarış..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  Qeydiyyatda: {filteredRegistry.length} sertifikat
                </span>
              </div>

              <div className="space-y-2">
                {filteredRegistry.map(cert => (
                  <div
                    key={cert.certificateId}
                    onClick={() => {
                      setActiveCertificate(cert);
                      setActiveTab('certificate');
                    }}
                    className="p-3.5 bg-slate-800/40 hover:bg-slate-800/80 rounded-xl border border-slate-700/60 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-300">{cert.certificateId}</span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                          {cert.vehicle.licensePlate}
                        </span>
                        <span className="text-xs text-slate-400">{cert.corridor.nameAz}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>L_avg: {cert.simulation.averageLuminanceCdM2} cd/m²</span>
                        <span>•</span>
                        <span>U₀: {cert.simulation.overallUniformityU0}</span>
                        <span>•</span>
                        <span>SİMA: {cert.simaSignatureUid}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          cert.clearanceOutcome === 'APPROVED_OPTIMAL_LIGHTING'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {cert.clearanceOutcome}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SCADA Şəbəkəsi: Aktiv • 24/7 Avtomatlaşdırılmış Rejim</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
