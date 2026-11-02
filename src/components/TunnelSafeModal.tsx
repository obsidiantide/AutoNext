import React, { useState, useMemo } from 'react';
import {
  X,
  Flame,
  Wind,
  ShieldAlert,
  Radio,
  Sliders,
  CheckCircle2,
  FileCheck,
  Search,
  Printer,
  Copy,
  Sparkles,
  Info,
  MapPin,
  Gauge,
  Activity,
  AlertTriangle,
  RotateCcw,
  Car,
  Volume2,
  Award,
  Layers,
  DoorOpen,
  ArrowRight
} from 'lucide-react';
import { Currency } from '../types/vehicle';
import {
  TunnelCorridorAsset,
  TunnelVehiclePreset,
  TunnelSafeCertificate,
  evaluateTunnelFirePhysics,
  calculateTunnelStatutoryFines,
  convertTunnelCurrency,
  generateTunnelSafeCertificate
} from '../utils/tunnelSafeCompliance';
import {
  MOCK_TUNNEL_CORRIDORS,
  MOCK_TUNNEL_VEHICLES,
  MOCK_TUNNEL_CHECKLIST,
  MOCK_TUNNEL_QUESTIONS,
  MOCK_TUNNEL_CERTIFICATES
} from '../data/mockTunnelSafeData';

export interface TunnelSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  language: 'az' | 'en' | 'ru';
}

export const TunnelSafeModal: React.FC<TunnelSafeModalProps> = ({
  isOpen,
  onClose,
  currency
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'radar' | 'scada' | 'vehicles' | 'checklist' | 'exam' | 'certificate' | 'registry'
  >('radar');

  // Selected corridor & vehicle preset
  const [selectedCorridor, setSelectedCorridor] = useState<TunnelCorridorAsset>(MOCK_TUNNEL_CORRIDORS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<TunnelVehiclePreset>(MOCK_TUNNEL_VEHICLES[0]);

  // SCADA Simulation Sliders
  const [heatReleaseRateMW, setHeatReleaseRateMW] = useState<number>(selectedVehicle.designHrrMW);
  const [tunnelAirVelocityMs, setTunnelAirVelocityMs] = useState<number>(3.2);
  const [activeJetFansCount, setActiveJetFansCount] = useState<number>(12);
  const [ambientAirTempC, setAmbientAirTempC] = useState<number>(20);
  const [distanceToExitM, setDistanceToExitM] = useState<number>(120);

  // Penalty parameters
  const [unauthorizedManeuver, setUnauthorizedManeuver] = useState<boolean>(false);
  const [emergencySignFailure, setEmergencySignFailure] = useState<boolean>(false);
  const [hazmatViolation, setHazmatViolation] = useState<boolean>(false);
  const [speedDeltaKmH, setSpeedDeltaKmH] = useState<number>(0);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MOCK_TUNNEL_CHECKLIST.forEach((item) => {
      initial[item.id] = true;
    });
    return initial;
  });

  // Theory Exam state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExamResults, setShowExamResults] = useState<boolean>(false);

  // Generated Certificate state
  const [generatedCertificate, setGeneratedCertificate] = useState<TunnelSafeCertificate | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  // Registry Search Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Web Audio synthesizer for emergency fire evacuation horn
  const playEmergencyHorn = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(520, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(780, audioCtx.currentTime);

      osc1.frequency.linearRampToValueAtTime(380, audioCtx.currentTime + 0.4);
      osc2.frequency.linearRampToValueAtTime(580, audioCtx.currentTime + 0.4);

      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.5);
      osc2.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio not permitted or context unavailable in headless
    }
  };

  // Evaluate SCADA physics
  const physicsResult = useMemo(() => {
    return evaluateTunnelFirePhysics({
      heatReleaseRateMW,
      tunnelAirVelocityMs,
      activeJetFansCount,
      ambientAirTempC,
      distanceToExitM,
      tunnelSlopePct: selectedCorridor.longitudinalSlopePct,
      ceilingHeightM: selectedCorridor.ceilingHeightM,
      crossSectionAreaM2: selectedCorridor.crossSectionAreaM2,
      totalFansInstalled: selectedCorridor.totalJetFansInstalled,
      waterDelugeActive: selectedCorridor.waterDelugeInstalled && heatReleaseRateMW >= 30
    });
  }, [
    heatReleaseRateMW,
    tunnelAirVelocityMs,
    activeJetFansCount,
    ambientAirTempC,
    distanceToExitM,
    selectedCorridor
  ]);

  // Evaluate Statutory Fines
  const statutoryFines = useMemo(() => {
    return calculateTunnelStatutoryFines({
      unauthorizedManeuver,
      emergencySignFailure,
      hazmatViolation,
      speedDeltaKmH
    });
  }, [unauthorizedManeuver, emergencySignFailure, hazmatViolation, speedDeltaKmH]);

  // Checklist score
  const checklistScore = useMemo(() => {
    let totalScore = 0;
    MOCK_TUNNEL_CHECKLIST.forEach((item) => {
      if (checkedItems[item.id]) {
        totalScore += item.weight;
      }
    });
    return Math.min(100, totalScore);
  }, [checkedItems]);

  // Exam Score
  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_TUNNEL_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    return correct;
  }, [selectedAnswers]);

  // Registry filter
  const filteredCertificates = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_TUNNEL_CERTIFICATES;
    const q = searchQuery.toLowerCase();
    return MOCK_TUNNEL_CERTIFICATES.filter(
      (cert) =>
        cert.certificateId.toLowerCase().includes(q) ||
        cert.tunnelName.toLowerCase().includes(q) ||
        cert.vehiclePlate.toLowerCase().includes(q) ||
        cert.evacuationPasscode.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Handle vehicle preset select
  const handleSelectVehiclePreset = (v: TunnelVehiclePreset) => {
    setSelectedVehicle(v);
    setHeatReleaseRateMW(v.designHrrMW);
    if (v.category === 'hazmat_tanker') {
      setHazmatViolation(true);
    } else {
      setHazmatViolation(false);
    }
  };

  // Generate certificate
  const handleGenerateCertificate = () => {
    const cert = generateTunnelSafeCertificate(
      selectedCorridor,
      selectedVehicle.plateAz,
      selectedVehicle.nameAz,
      physicsResult,
      checklistScore
    );
    setGeneratedCertificate(cert);
    setActiveTab('certificate');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="tunnel-safe-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <Flame className="w-6 h-6 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AAYDA • FHN • BDYP RƏSMİ PORTALI
                </span>
                <span className="text-xs text-amber-400/80 font-mono">TUNNEL-SAFE-AZ-2026</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Magistral Dağ Tünellərində Yanğın Təhlükəsizliyi və Jet Fan SCADA Telemetriyası
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="tunnel-safe-close-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic VMS Warning Banner */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-semibold text-amber-400 font-mono">VMS GANTRY:</span>
            <span className="text-slate-300 font-medium">{physicsResult.vmsAlertTextAz}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={playEmergencyHorn}
              data-testid="audio-siren-btn"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold cursor-pointer transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Səsli PA Təxliyə Siqnalı
            </button>
            <span className="text-slate-400 font-mono">
              Sens: {selectedCorridor.activeScadaSensorCode}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-4 h-4" />
            Strateji Tunellər Radarı (6)
          </button>
          <button
            onClick={() => setActiveTab('scada')}
            data-testid="tab-scada"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'scada'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Jet Fan SCADA & Egress Standı
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            data-testid="tab-vehicles"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'vehicles'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Car className="w-4 h-4" />
            Nəqliyyat Preseti & İXM Cərimələri
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Təhlükəsizlik Yoxlama Protokolu
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'exam'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            Tünel İmtahan Simulyatoru (10)
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Rəsmi SİMA Sertifikatı
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4" />
            Vahid İctimai Reyestr
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-5" data-testid="radar-view">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-400" />
                    Azərbaycan Respublikasının 6 Əsas Magistral Dağ Tünelləri
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    AAYDA, FHN və BDYP tərəfindən idarə olunan SCADA ventilyasiya və yanğından mühafizə infrastrukturu.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                  Seçilmiş: {selectedCorridor.nameAz.split('(')[0]}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_TUNNEL_CORRIDORS.map((corridor) => {
                  const isSelected = selectedCorridor.id === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      data-testid={`corridor-card-${corridor.id}`}
                      onClick={() => setSelectedCorridor(corridor)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700/60 text-slate-300">
                          {corridor.chainageKm}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {corridor.lengthMeters} m
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-white">{corridor.nameAz}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {corridor.route}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Hündürlük:</span>
                          {corridor.altitudeMeters} m dəniz səv.
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Jet Fan Sayı:</span>
                          {corridor.totalJetFansInstalled} ədəd
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Təxliyə Qapıları:</span>
                          Hər {corridor.crossPassageSpacingM} m-dən bir
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Deluge Söndürmə:</span>
                          {corridor.waterDelugeInstalled ? 'MÖVCUDDUR' : 'YALNIZ HİDRANT'}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs pt-2">
                        <span className="text-[10px] text-amber-400/90 font-mono">
                          {corridor.activeScadaSensorCode}
                        </span>
                        <span className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                          {isSelected ? 'Aktiv Seçim' : 'Seçmək'}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SCADA & EGRESS STAND */}
          {activeTab === 'scada' && (
            <div className="space-y-5" data-testid="scada-view">
              {/* Physics Summary Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Kritik Sürət (vc)
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {physicsResult.criticalVelocityMs.toFixed(2)} m/s
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Faktiki: {physicsResult.actualVelocityMs.toFixed(2)} m/s
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Backlayering Statusu
                  </span>
                  <div
                    className={`text-sm font-bold mt-1 ${
                      physicsResult.backlayeringState === 'PREVENTED_SAFE_EGRESS'
                        ? 'text-emerald-400'
                        : physicsResult.backlayeringState === 'MARGINAL_BOUNDARY_RISK'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {physicsResult.backlayeringState === 'PREVENTED_SAFE_EGRESS'
                      ? 'QARŞISI ALINDI'
                      : physicsResult.backlayeringState === 'MARGINAL_BOUNDARY_RISK'
                      ? 'SƏRHƏD RİSKİ'
                      : 'GERİ YAYILIR!'}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Nisbət: {physicsResult.backlayeringRatio.toFixed(2)}x
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Optik Görünüş / CO
                  </span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {physicsResult.opticalVisibilityM.toFixed(1)} m
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    CO: {physicsResult.carbonMonoxidePpm} ppm
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Təxliyə Vaxt Ehtiyatı
                  </span>
                  <div
                    className={`text-xl font-bold font-mono mt-1 ${
                      physicsResult.egressViable ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {physicsResult.egressSafetyMarginSec} san
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    RSET: {physicsResult.requiredSafeEgressTimeSec}s / ASET:{' '}
                    {physicsResult.availableSafeEgressTimeSec}s
                  </span>
                </div>
              </div>

              {/* Interactive Tunnel Diagram SVG */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Tünel Uzununa Havalandırma və Tüstü Yayılma Profili (SCADA 2D)
                  </span>
                  <span className="text-slate-400 font-mono">
                    Ocaq: {heatReleaseRateMW} MW | T_peak: {physicsResult.peakSmokeTemperatureC}°C
                  </span>
                </div>

                <div className="w-full overflow-hidden rounded-lg bg-slate-900 border border-slate-800 p-2">
                  <svg
                    viewBox="0 0 900 240"
                    className="w-full h-auto select-none"
                    aria-label="Tunnel Fire & Jet Fan Ventilation Diagram"
                  >
                    {/* Tunnel Ceiling & Road Concrete */}
                    <rect x="20" y="20" width="860" height="200" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                    {/* Tunnel Crown Arch */}
                    <path d="M 20 60 Q 450 15 880 60" fill="none" stroke="#475569" strokeWidth="3" strokeDasharray="6,4" />

                    {/* Road Surface */}
                    <line x1="20" y1="180" x2="880" y2="180" stroke="#64748b" strokeWidth="3" />
                    {/* Lane marking */}
                    <line x1="20" y1="200" x2="880" y2="200" stroke="#f59e0b" strokeWidth="2" strokeDasharray="16,12" />

                    {/* Jet Fans along the ceiling */}
                    {[120, 320, 520, 720].map((fanX, i) => (
                      <g key={i}>
                        <rect x={fanX} y="32" width="60" height="16" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                        <line x1={fanX + 60} y1="40" x2={fanX + 80} y2="40" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" />
                        <text x={fanX + 30} y="44" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="bold">
                          FAN {i + 1}
                        </text>
                      </g>
                    ))}

                    {/* Fire Source Plume */}
                    <g transform="translate(420, 140)">
                      {/* Fire Vehicle Silhouette */}
                      <rect x="0" y="15" width="70" height="25" rx="3" fill="#334155" stroke="#ef4444" strokeWidth="2" />
                      <circle cx="15" cy="40" r="6" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
                      <circle cx="55" cy="40" r="6" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
                      {/* Flames */}
                      {heatReleaseRateMW > 0.5 && (
                        <path
                          d="M 15 15 Q 25 -25 35 15 Q 45 -40 55 15 Z"
                          fill="url(#fireGradient)"
                          className="animate-pulse"
                        />
                      )}
                      <text x="35" y="32" fill="#ffffff" fontSize="8" textAnchor="middle" fontWeight="bold">
                        {heatReleaseRateMW} MW
                      </text>
                    </g>

                    {/* Smoke Layer Envelope */}
                    {heatReleaseRateMW > 0.5 && (
                      <path
                        d={`M 420 90 Q ${
                          physicsResult.backlayeringState === 'SEVERE_BACKLAYERING_ACTIVE' ? '240 60' : '380 70'
                        } ${
                          physicsResult.backlayeringState === 'SEVERE_BACKLAYERING_ACTIVE' ? '140 70' : '410 70'
                        } L 870 50 L 870 120 L 450 120 Z`}
                        fill="rgba(239, 68, 68, 0.25)"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                      />
                    )}

                    {/* Emergency Cross Passage Door (Green) */}
                    <g transform="translate(180, 110)">
                      <rect x="0" y="0" width="35" height="70" rx="3" fill="#065f46" stroke="#10b981" strokeWidth="2" />
                      <text x="17.5" y="35" fill="#10b981" fontSize="18" textAnchor="middle">
                        🚪
                      </text>
                      <text x="17.5" y="82" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">
                        EGRESS 250m
                      </text>
                    </g>

                    {/* Escaping Motorist Silhouette */}
                    <g transform={`translate(${Math.max(220, 420 - distanceToExitM * 1.5)}, 150)`}>
                      <circle cx="10" cy="5" r="4" fill="#38bdf8" />
                      <line x1="10" y1="9" x2="10" y2="22" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="10" y1="22" x2="5" y2="30" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="10" y1="22" x2="15" y2="30" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="6" y1="14" x2="14" y2="14" stroke="#38bdf8" strokeWidth="2" />
                      <text x="10" y="-2" fill="#38bdf8" fontSize="8" textAnchor="middle">
                        {distanceToExitM}m
                      </text>
                    </g>

                    {/* Airflow direction indicator arrows */}
                    <g transform="translate(40, 90)">
                      <line x1="0" y1="0" x2="60" y2="0" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrow)" />
                      <text x="30" y="-8" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                        {tunnelAirVelocityMs.toFixed(1)} m/s
                      </text>
                    </g>

                    <defs>
                      <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fef08a" />
                      </linearGradient>
                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Sliders Control Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="input-fire-hrr" className="font-semibold text-slate-300">Yanğın İstilik Ayrılma Gücü (HRR):</label>
                    <span className="font-mono text-amber-400 font-bold">{heatReleaseRateMW} MW</span>
                  </div>
                  <input
                    id="input-fire-hrr"
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={heatReleaseRateMW}
                    onChange={(e) => setHeatReleaseRateMW(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0 MW (Sakit)</span>
                    <span>15 MW (Van)</span>
                    <span>50 MW (TIR)</span>
                    <span>120 MW (HazMat Tanker)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="input-air-velocity" className="font-semibold text-slate-300">Tünel Uzununa Hava Sürəti:</label>
                    <span className="font-mono text-cyan-400 font-bold">{tunnelAirVelocityMs.toFixed(1)} m/s</span>
                  </div>
                  <input
                    id="input-air-velocity"
                    type="range"
                    min="0.2"
                    max="7.0"
                    step="0.1"
                    value={tunnelAirVelocityMs}
                    onChange={(e) => setTunnelAirVelocityMs(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.2 m/s</span>
                    <span>vc = {physicsResult.criticalVelocityMs.toFixed(1)} m/s</span>
                    <span>7.0 m/s</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="input-active-fans" className="font-semibold text-slate-300">Aktiv SCADA Jet Fan Sayı:</label>
                    <span className="font-mono text-emerald-400 font-bold">
                      {activeJetFansCount} / {selectedCorridor.totalJetFansInstalled} ədəd
                    </span>
                  </div>
                  <input
                    id="input-active-fans"
                    type="range"
                    min="0"
                    max={selectedCorridor.totalJetFansInstalled}
                    step="2"
                    value={activeJetFansCount}
                    onChange={(e) => setActiveJetFansCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0 Fan (Təbii Axın)</span>
                    <span>Nominal: {Math.floor(selectedCorridor.totalJetFansInstalled / 2)}</span>
                    <span>Maks: {selectedCorridor.totalJetFansInstalled}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="input-egress-dist" className="font-semibold text-slate-300">Ən Yaxın Təxliyə Qapısına Məsafə:</label>
                    <span className="font-mono text-purple-400 font-bold">{distanceToExitM} metr</span>
                  </div>
                  <input
                    id="input-egress-dist"
                    type="range"
                    min="10"
                    max={selectedCorridor.crossPassageSpacingM}
                    step="10"
                    value={distanceToExitM}
                    onChange={(e) => setDistanceToExitM(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>10 m</span>
                    <span>125 m (Orta)</span>
                    <span>{selectedCorridor.crossPassageSpacingM} m (Maks)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS & STATUTORY FINES */}
          {activeTab === 'vehicles' && (
            <div className="space-y-5" data-testid="vehicles-view">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-400" />
                  Nəqliyyat Preseti Seçimi & Tunel Təhlükə Potensialı
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Avtomobil sinfinə uyğun dizayn yanğın yükü (HRR), yanacaq növü və ADR statusu.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {MOCK_TUNNEL_VEHICLES.map((v) => {
                    const isSelected = selectedVehicle.id === v.id;
                    return (
                      <div
                        key={v.id}
                        data-testid={`vehicle-card-${v.id}`}
                        onClick={() => handleSelectVehiclePreset(v)}
                        className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500/80 shadow-md'
                            : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-amber-500/30">
                            {v.plateAz}
                          </span>
                          <span className="text-xs font-mono font-bold text-red-400">
                            {v.designHrrMW} MW
                          </span>
                        </div>
                        <h4 className="mt-2 text-sm font-bold text-white">{v.nameAz}</h4>
                        <div className="mt-2 text-[11px] font-mono text-slate-300 space-y-0.5">
                          <div>Sərnişin: {v.passengerCapacity} nəfər</div>
                          <div>Yanacaq: {v.fuelType}</div>
                          {v.adrHazmatClass && (
                            <div className="text-amber-400 font-bold">{v.adrHazmatClass}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statutory Fines Stand under Code of Administrative Offences (İXM) */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    İXM Tunel Hərəkət Qaydaları və Cərimə Kalkulyatoru
                  </h3>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    İXM Maddə 38: 30 günə 50% Endirim
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unauthorizedManeuver}
                      onChange={(e) => setUnauthorizedManeuver(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        Tuneldə qadağan olunmuş dönmə və ya əks hərəkət
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        İXM 327.1 / 327.2: 60 AZN + 3 bal
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emergencySignFailure}
                      onChange={(e) => setEmergencySignFailure(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        Məcburi dayanma zamanı qəza durma nişanı qoyulmaması
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        İXM 330: 80 AZN + 2 bal
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hazmatViolation}
                      onChange={(e) => setHazmatViolation(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        ADR qadağan olunmuş tunelə təhlükəli yüklə daxilolma
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        İXM 353.1: 150 AZN + 4 bal
                      </span>
                    </div>
                  </label>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Sürət Həddi Artığı (km/s):</span>
                      <span className="font-mono text-amber-400 font-bold">+{speedDeltaKmH} km/s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={speedDeltaKmH}
                      onChange={(e) => setSpeedDeltaKmH(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>0</span>
                      <span>+20 (50 AZN)</span>
                      <span>+40 (250 AZN)</span>
                    </div>
                  </div>
                </div>

                {/* Fine Calculation Result Summary */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Hesablanmış Cəmi Cərimə Məbləği:</span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-2xl font-bold font-mono text-red-400">
                        {convertTunnelCurrency(statutoryFines.totalOriginalFineAzn, currency)}
                      </span>
                      <span className="text-sm font-semibold font-mono text-emerald-400">
                        (50% Güzəştlə: {convertTunnelCurrency(statutoryFines.discountedFineAzn, currency)})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Cərimə Balları:</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {statutoryFines.penaltyPoints} Bal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4" data-testid="checklist-view">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    10-Bəndlik Tunel Texniki və Yanğın Təhlükəsizliyi Yoxlama Protokolu
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    AZS 410, AZS 342, NFPA 502 və PIARC beynəlxalq standartlarına uyğun audit.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const all: Record<string, boolean> = {};
                      MOCK_TUNNEL_CHECKLIST.forEach((item) => {
                        all[item.id] = true;
                      });
                      setCheckedItems(all);
                    }}
                    data-testid="checklist-select-all"
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold transition-all"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={() => setCheckedItems({})}
                    data-testid="checklist-reset"
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold transition-all"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Score bar */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Yoxlama Nəticəsi:</span>
                  <span className="font-mono font-bold text-amber-400">{checklistScore} / 100 Bal</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistScore >= 80 ? 'bg-emerald-500' : checklistScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${checklistScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {MOCK_TUNNEL_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <label
                      key={item.id}
                      data-testid={`checklist-item-${item.id}`}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setCheckedItems((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id]
                          }));
                        }}
                        className="mt-1 rounded accent-amber-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-300">
                            {item.code}
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono">
                            {item.standardRef}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">
                          {item.titleAz}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">+{item.weight} b</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORY EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-4" data-testid="exam-view">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    10-Suallıq Tunel Yanğın və Fövqəladə Təxliyə Qaydaları İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Dövlət standartları və İctimai İmtahan Mərkəzi sual bazası əsasında nəzəri test.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowExamResults(!showExamResults)}
                    data-testid="submit-exam-btn"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {showExamResults ? 'Nəticəni Gizlət' : 'İmtahanı Tamamla'}
                  </button>
                  {showExamResults && (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                      Nəticə: {examScore} / {MOCK_TUNNEL_QUESTIONS.length}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {MOCK_TUNNEL_QUESTIONS.map((q, qIndex) => {
                  const selectedIdx = selectedAnswers[q.id];
                  const isCorrect = selectedIdx === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      data-testid={`question-card-${q.id}`}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-amber-400">
                          Sual #{qIndex + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {q.legalRef}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-100">
                        {q.questionAz}
                      </p>

                      <div className="space-y-2 pt-1">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedIdx === optIdx;
                          let btnStyle = 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800';

                          if (showExamResults) {
                            if (optIdx === q.correctIndex) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = 'bg-red-950/60 border-red-500 text-red-300';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-amber-950/50 border-amber-500 text-amber-300 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setSelectedAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx
                                }));
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {showExamResults && optIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showExamResults && (
                        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-xs text-slate-300 space-y-1">
                          <span className="font-bold text-amber-400 block">Hüquqi və Texniki İzah:</span>
                          <p>{q.explanationAz}</p>
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
            <div className="space-y-5" data-testid="certificate-view">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-amber-400" />
                    Rəsmi SİMA Rəqəmsal İmzalı TUNNEL-SAFE-AZ Sertifikatı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    AAYDA, FHN və BDYP tərəfindən dağ tunellərindən təhlükəsiz keçidə verilən icazə sənədi.
                  </p>
                </div>
                <button
                  onClick={handleGenerateCertificate}
                  data-testid="generate-cert-btn"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Yeni Sertifikat Yarat
                </button>
              </div>

              {generatedCertificate ? (
                <div
                  data-testid="certificate-card"
                  className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20 border-2 border-amber-500/40 shadow-2xl space-y-5 max-w-2xl mx-auto"
                >
                  {/* Certificate Header */}
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                          AZƏRBAYCAN RESPUBLİKASI AAYDA & FHN
                        </span>
                        <h4 className="text-base font-bold text-white">
                          RƏSMİ TUNEL TƏHLÜKƏSİZLİK SERTİFİKATI
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {generatedCertificate.status}
                    </span>
                  </div>

                  {/* Certificate Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Sertifikat Nömrəsi:</span>
                      <span className="font-bold text-amber-300">{generatedCertificate.certificateId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Nəqliyyat Qeydiyyat Nişanı:</span>
                      <span className="font-bold text-white">{generatedCertificate.vehiclePlate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Strateji Tunel:</span>
                      <span className="font-bold text-slate-200">{generatedCertificate.tunnelName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Təxliyə Qapı Kodu:</span>
                      <span className="font-bold text-emerald-400">{generatedCertificate.evacuationPasscode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Kritik Ventilyasiya:</span>
                      <span className="font-bold text-slate-200">
                        vc = {generatedCertificate.criticalVelocityMs.toFixed(2)} m/s (Faktiki: {generatedCertificate.actualVelocityMs.toFixed(2)} m/s)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Təhlükəsizlik Balı:</span>
                      <span className="font-bold text-amber-400">{generatedCertificate.safetyScore} / 100</span>
                    </div>
                  </div>

                  {/* Cryptographic UID & Hash */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>SİMA Digital UID:</span>
                      <span className="text-cyan-400">{generatedCertificate.simaDigitalUid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>QR Doğrulama Kodu:</span>
                      <span className="text-amber-400">{generatedCertificate.qrVerificationHash}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleCopy(generatedCertificate.certificateId, 'certId')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copySuccess === 'certId' ? 'Kopyalandı!' : 'ID Kopyala'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-slate-950 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Çap Et
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-800/20 rounded-xl border border-slate-800">
                  <p className="text-sm">Hələ sertifikat yaradılmayıb. &quot;Yeni Sertifikat Yarat&quot; düyməsini sıxın.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4" data-testid="registry-view">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-amber-400" />
                    Vahid Dövlət Tünel Təhlükəsizlik Reyestri (AAYDA / FHN)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Verilmiş bütün rəsmi TUNNEL-SAFE-AZ sertifikatlarının real-vaxt axtarış bazası.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Qeydiyyat nişanı və ya ID..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.certificateId}
                    data-testid={`registry-item-${cert.certificateId}`}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {cert.certificateId}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-200">
                          {cert.vehiclePlate}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {cert.status}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">
                        {cert.tunnelName}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Təxliyə PIN: {cert.evacuationPasscode} | SİMA: {cert.simaDigitalUid}
                      </p>
                    </div>

                    <div className="text-right flex flex-col sm:items-end">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        Bal: {cert.safetyScore} / 100
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Bitmə: {new Date(cert.expiryDateIso).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>SCADA Jet Fan Longitudinal Telemetry: AKTİV</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
