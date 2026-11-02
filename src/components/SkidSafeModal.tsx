import React, { useState, useMemo } from 'react';
import {
  X,
  Droplets,
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
  ShieldAlert,
  Car,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Currency } from '../types/vehicle';
import {
  SkidCorridorAsset,
  SkidVehiclePreset,
  SkidSimulationInput,
  SkidCertificate,
  simulateSkidAndAquaplaning,
  calculateSkidStatutoryFines,
  convertSkidCurrency,
  generateSkidCertificate,
} from '../utils/skidSafeCompliance';
import {
  MOCK_SKID_CORRIDORS,
  MOCK_SKID_VEHICLE_PRESETS,
  MOCK_SKID_CHECKLIST,
  MOCK_SKID_EXAM_QUESTIONS,
  MOCK_SKID_REGISTRY,
} from '../data/mockSkidSafeData';

export interface SkidSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  language: 'az' | 'en' | 'ru';
}

export const SkidSafeModal: React.FC<SkidSafeModalProps> = ({
  isOpen,
  onClose,
  currency,
}) => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<
    'radar' | 'scada' | 'vehicles' | 'checklist' | 'exam' | 'certificate' | 'registry'
  >('radar');

  // Selected corridor
  const [selectedCorridor, setSelectedCorridor] = useState<SkidCorridorAsset>(MOCK_SKID_CORRIDORS[0]);

  // Selected vehicle preset
  const [selectedVehicle, setSelectedVehicle] = useState<SkidVehiclePreset>(MOCK_SKID_VEHICLE_PRESETS[0]);

  // SCADA Simulation Sliders
  const [approachSpeedKmh, setApproachSpeedKmh] = useState<number>(selectedVehicle.approachSpeedKmh);
  const [tirePressureKpa, setTirePressureKpa] = useState<number>(selectedVehicle.tirePressureKpa);
  const [treadDepthMm, setTreadDepthMm] = useState<number>(selectedVehicle.treadDepthMm);
  const [waterFilmDepthMm, setWaterFilmDepthMm] = useState<number>(selectedCorridor.currentWaterFilmDepthMm);
  const [meanProfileDepthMm, setMeanProfileDepthMm] = useState<number>(selectedCorridor.meanProfileDepthMpdMm);
  const [skidNumberSn60, setSkidNumberSn60] = useState<number>(selectedCorridor.skidNumberSn60);
  const [driverReactionTimeSec, setDriverReactionTimeSec] = useState<number>(1.0);

  // Currency switcher override
  const [selectedCurrency, setSelectedCurrency] = useState<'AZN' | 'USD' | 'EUR'>('AZN');

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    MOCK_SKID_CHECKLIST.forEach((item, index) => {
      init[item.id] = index < 5; // Default half checked
    });
    return init;
  });

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [activeCertificate, setActiveCertificate] = useState<SkidCertificate>(MOCK_SKID_REGISTRY[0]);
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  // Public Registry Search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio synthesizer warning
  const playAquaplaningAlert = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable or blocked in non-interactive environment
    }
  };

  // Run physics calculation
  const simInput: SkidSimulationInput = useMemo(
    () => ({
      approachSpeedKmh,
      tirePressureKpa,
      treadDepthMm,
      waterFilmDepthMm,
      meanProfileDepthMm,
      skidNumberSn60,
      driverReactionTimeSec,
    }),
    [
      approachSpeedKmh,
      tirePressureKpa,
      treadDepthMm,
      waterFilmDepthMm,
      meanProfileDepthMm,
      skidNumberSn60,
      driverReactionTimeSec,
    ]
  );

  const simResult = useMemo(
    () => simulateSkidAndAquaplaning(simInput, selectedVehicle.category),
    [simInput, selectedVehicle.category]
  );

  // Fine calculation
  const fineCalculation = useMemo(
    () =>
      calculateSkidStatutoryFines(
        treadDepthMm,
        selectedVehicle.category,
        approachSpeedKmh,
        selectedCorridor.advisoryWetSpeedKmh
      ),
    [treadDepthMm, selectedVehicle.category, approachSpeedKmh, selectedCorridor.advisoryWetSpeedKmh]
  );

  // When corridor changes, update road params
  const handleSelectCorridor = (corridor: SkidCorridorAsset) => {
    setSelectedCorridor(corridor);
    setWaterFilmDepthMm(corridor.currentWaterFilmDepthMm);
    setMeanProfileDepthMm(corridor.meanProfileDepthMpdMm);
    setSkidNumberSn60(corridor.skidNumberSn60);
  };

  // When vehicle changes, update vehicle params
  const handleSelectVehicle = (preset: SkidVehiclePreset) => {
    setSelectedVehicle(preset);
    setApproachSpeedKmh(preset.approachSpeedKmh);
    setTirePressureKpa(preset.tirePressureKpa);
    setTreadDepthMm(preset.treadDepthMm);
  };

  // Generate certificate
  const handleGenerateCertificate = () => {
    const newCert = generateSkidCertificate(
      selectedVehicle.licensePlate,
      selectedVehicle.name,
      selectedCorridor,
      simResult
    );
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  // Checklist handlers
  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllChecklist = () => {
    const all: Record<string, boolean> = {};
    MOCK_SKID_CHECKLIST.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedItems(all);
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
  };

  const checklistScore = useMemo(() => {
    const total = MOCK_SKID_CHECKLIST.length;
    const completed = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  }, [checkedItems]);

  // Exam handlers
  const handleSelectExamAnswer = (questionId: string, index: number) => {
    if (isExamSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const handleQuickFillExam = () => {
    const fullScore: Record<string, number> = {};
    MOCK_SKID_EXAM_QUESTIONS.forEach((q) => {
      fullScore[q.id] = q.correctIndex;
    });
    setExamAnswers(fullScore);
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setIsExamSubmitted(false);
  };

  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_SKID_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return Math.round((correct / MOCK_SKID_EXAM_QUESTIONS.length) * 100);
  }, [examAnswers]);

  // Copy certificate info
  const handleCopyCertificate = (cert: SkidCertificate) => {
    const text = `AAYDA & BDYP SKID-SAFE-AZ-2026 SERTİFİKATI
Sənəd No: ${cert.certificateId}
Nəqliyyat Qeydiyyatı: ${cert.vehiclePlate} (${cert.vehicleModel})
Magistral Dəhliz: ${cert.corridorNameAz} (${cert.route})
Sürtünmə Göstəricisi: SN60 = ${cert.skidNumberSn60}
Akvaplaninq Sürəti: ${cert.hydroplaningSpeedKmh} km/saat
Təhlükə Kateqoriyası: ${cert.aquaplaningRiskTier}
Tormoz Məsafəsi: ${cert.calculatedStoppingDistanceM} m
SİMA Rəqəmsal UID: ${cert.simaDigitalUid}
Yoxlama PIN: ${cert.passPinCode}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCertId(cert.certificateId);
      setTimeout(() => setCopiedCertId(null), 2500);
    }
  };

  // Filter public registry
  const filteredRegistry = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_SKID_REGISTRY;
    const q = searchQuery.toLowerCase();
    return MOCK_SKID_REGISTRY.filter(
      (cert) =>
        cert.certificateId.toLowerCase().includes(q) ||
        cert.vehiclePlate.toLowerCase().includes(q) ||
        cert.corridorNameAz.toLowerCase().includes(q) ||
        cert.vehicleModel.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-cyan-950/70 to-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30 text-white">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  AAYDA • ETSN • BDYP • 2026
                </span>
                <span className="text-xs text-slate-400">Dövlət Yol Hərəkəti Təhlükəsizliyi</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
                SKID-SAFE-AZ-2026
                <span className="text-xs font-normal text-cyan-300 hidden sm:inline">
                  — Asfalt Səthinin İlişmə Əmsalı və Hidroplaninq Telemetriyası
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={playAquaplaningAlert}
              title="Akvaplaninq Siqnal Testi"
              aria-label="Akvaplaninq Siqnal Testi"
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-transparent hover:border-cyan-500/20"
            >
              <Activity className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              aria-label="Modalı Bağla"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto scrollbar-none text-xs font-medium">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'radar'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            1. Dəhlizlər Radarı (6 Koridor)
          </button>
          <button
            onClick={() => setActiveTab('scada')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'scada'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            2. SCADA Fizika & Hidroplaninq
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'vehicles'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-4 h-4" />
            3. Nəqliyyat & İXM Cərimələr
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'checklist'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            4. 10-Bəndlik Texniki Yoxlama
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'exam'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            5. Yol Qaydaları & İmtahan
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'certificate'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            6. Elektron Sertifikat
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'registry'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            7. Vahid Dövlət Reyestri
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR CORRIDORS */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    Respublika Əhəmiyyətli Magistral Yollarda İlişmə Vəziyyəti Radarı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AAYDA və BDYP-nin fasiləsiz lazer profilometriya və sürtünmə ölçən (GripTester) SCADA stansiyaları
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Optimum İlişmə
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Nəm / Məsləhət
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
                    Kritik Sürüşkən
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_SKID_CORRIDORS.map((corridor) => {
                  const isSelected = selectedCorridor.id === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => handleSelectCorridor(corridor)}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                          {corridor.chainageKm}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            corridor.status === 'OPTIMAL'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : corridor.status === 'WET_ADVISORY'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          }`}
                        >
                          {corridor.status === 'OPTIMAL'
                            ? 'Optimum Örtük'
                            : corridor.status === 'WET_ADVISORY'
                            ? 'Nəm Səth Məhdudiyyəti'
                            : 'Kritik Akvaplaninq Tələsi'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white line-clamp-1 mb-1">
                        {corridor.nameAz}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                        {corridor.region} • {corridor.coordinates}
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-900/70 rounded-lg text-center text-xs mb-3 border border-slate-800">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">İlişmə SN60</div>
                          <div className={`font-mono font-bold text-sm ${corridor.skidNumberSn60 < 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {corridor.skidNumberSn60}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Su Qatı (WFD)</div>
                          <div className="font-mono font-bold text-sm text-cyan-300">
                            {corridor.currentWaterFilmDepthMm} mm
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Tekstura MPD</div>
                          <div className="font-mono font-bold text-sm text-amber-300">
                            {corridor.meanProfileDepthMpdMm} mm
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/50">
                        <span className="text-slate-400">
                          Tövsiyə Sürət: <span className="text-white font-bold">{corridor.advisoryWetSpeedKmh} km/s</span>
                        </span>
                        <span className="text-cyan-400 font-medium flex items-center gap-1">
                          SCADA-ya Köçür <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Corridor Overview Banner */}
              <div className="p-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">
                    Aktiv Seçilmiş Magistral Dəhliz
                  </div>
                  <div className="text-base font-bold text-white">
                    {selectedCorridor.nameAz} ({selectedCorridor.route})
                  </div>
                  <div className="text-xs text-slate-300">
                    Asfalt Tipi: <span className="font-semibold text-cyan-200">{selectedCorridor.asphaltType}</span> | Köndələn Maililik: <span className="font-semibold text-cyan-200">%{selectedCorridor.drainageCrossSlopePercent}</span> | Yağıntı İntensivliyi: <span className="font-semibold text-cyan-200">{selectedCorridor.liveRainIntensityMmH} mm/saat</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('scada')}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  SCADA Simulyatoruna Keç
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA PHYSICS & AQUAPLANING SIMULATOR */}
          {activeTab === 'scada' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sliders Control Panel (7 cols) */}
                <div className="lg:col-span-7 space-y-4 p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      SCADA Parametrləri & Telemetriya İdarəetməsi
                    </h3>
                    <button
                      onClick={() => {
                        setApproachSpeedKmh(selectedVehicle.approachSpeedKmh);
                        setTirePressureKpa(selectedVehicle.tirePressureKpa);
                        setTreadDepthMm(selectedVehicle.treadDepthMm);
                        setWaterFilmDepthMm(selectedCorridor.currentWaterFilmDepthMm);
                        setMeanProfileDepthMm(selectedCorridor.meanProfileDepthMpdMm);
                        setSkidNumberSn60(selectedCorridor.skidNumberSn60);
                      }}
                      className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Standarta Qaytar
                    </button>
                  </div>

                  {/* Slider 1: Approach Speed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Avtomobilin Sürəti (v)</span>
                      <span className="font-mono font-bold text-cyan-400">{approachSpeedKmh} km/saat</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="160"
                      step="1"
                      aria-label="Avtomobilin Sürəti"
                      value={approachSpeedKmh}
                      onChange={(e) => setApproachSpeedKmh(Number(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>30 km/s (Şəhər)</span>
                      <span>{selectedCorridor.advisoryWetSpeedKmh} km/s (Tövsiyə)</span>
                      <span>160 km/s (Həddən artıq)</span>
                    </div>
                  </div>

                  {/* Slider 2: Tire Pressure */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Təkərin Hava Təzyiqi (p)</span>
                      <span className="font-mono font-bold text-blue-400">
                        {tirePressureKpa} kPa (~{(tirePressureKpa / 6.895).toFixed(1)} psi)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="140"
                      max="900"
                      step="10"
                      aria-label="Təkərin Hava Təzyiqi"
                      value={tirePressureKpa}
                      onChange={(e) => setTirePressureKpa(Number(e.target.value))}
                      className="w-full accent-blue-400 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>140 kPa (Aşağı Təzyiq)</span>
                      <span>230 kPa (Minik Standartı)</span>
                      <span>900 kPa (Ağır TIR)</span>
                    </div>
                  </div>

                  {/* Slider 3: Tread Depth */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Təkər Protektorunun Qalıq Hündürlüyü (TD)</span>
                      <span className={`font-mono font-bold ${treadDepthMm < simResult.tireMinimumStatutoryDepthMm ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {treadDepthMm.toFixed(1)} mm
                        {treadDepthMm < simResult.tireMinimumStatutoryDepthMm && ' (QANUNSUZ - İXM 342.1)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="12.0"
                      step="0.1"
                      aria-label="Təkər Protektorunun Qalıq Hündürlüyü"
                      value={treadDepthMm}
                      onChange={(e) => setTreadDepthMm(Number(e.target.value))}
                      className="w-full accent-emerald-400 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.5 mm (Bald / Qəza)</span>
                      <span className="text-rose-400 font-bold">{simResult.tireMinimumStatutoryDepthMm} mm (Qanuni Limit)</span>
                      <span>8.0+ mm (Yeni Şin)</span>
                    </div>
                  </div>

                  {/* Slider 4: Water Film Depth */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Yol Səthindəki Su Qatının Qalınlığı (WFD)</span>
                      <span className="font-mono font-bold text-cyan-300">{waterFilmDepthMm.toFixed(1)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="8.0"
                      step="0.1"
                      aria-label="Su Qatının Qalınlığı"
                      value={waterFilmDepthMm}
                      onChange={(e) => setWaterFilmDepthMm(Number(e.target.value))}
                      className="w-full accent-cyan-300 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.0 mm (Quru)</span>
                      <span>1.5 mm (Yağış Qatı)</span>
                      <span>8.0 mm (Dərin Gölməçə)</span>
                    </div>
                  </div>

                  {/* Slider 5: Macrotexture MPD */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Asfalt Makroteksturası (MPD - Mean Profile Depth)</span>
                      <span className="font-mono font-bold text-amber-400">{meanProfileDepthMm.toFixed(2)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.5"
                      step="0.05"
                      aria-label="Asfalt Makroteksturası"
                      value={meanProfileDepthMm}
                      onChange={(e) => setMeanProfileDepthMm(Number(e.target.value))}
                      className="w-full accent-amber-400 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.2 mm (Cilalanmış Sürüşkən)</span>
                      <span>0.8 mm (Normativ Hədd)</span>
                      <span>2.5 mm (Məsaməli SMA Asfalt)</span>
                    </div>
                  </div>

                  {/* Slider 6: Skid Number SN60 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Asfaltın Sürtünmə Əmsalı (Skid Number SN60)</span>
                      <span className="font-mono font-bold text-emerald-300">{skidNumberSn60}</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="85"
                      step="1"
                      aria-label="Asfaltın Sürtünmə Əmsalı"
                      value={skidNumberSn60}
                      onChange={(e) => setSkidNumberSn60(Number(e.target.value))}
                      className="w-full accent-emerald-300 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>20 (Buzvari Asfalt)</span>
                      <span>45 (Dövlət Standartı AZS 410)</span>
                      <span>85 (Yüksək İlişmə)</span>
                    </div>
                  </div>

                  {/* Reaction Time */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                    <span className="text-slate-400">Sürücünün Reaksiya Müddəti (t_r):</span>
                    <select
                      value={driverReactionTimeSec}
                      onChange={(e) => setDriverReactionTimeSec(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    >
                      <option value={0.8}>0.8 saniyə (Gənc / ayıq)</option>
                      <option value={1.0}>1.0 saniyə (Standart norma)</option>
                      <option value={1.5}>1.5 saniyə (Yorğun / diqqətsiz)</option>
                      <option value={2.0}>2.0 saniyə (Ləng reaksiya)</option>
                    </select>
                  </div>
                </div>

                {/* Animated Hydroplaning Gauge & SVG Cross-Section (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Gauge Card */}
                  <div className="p-5 bg-gradient-to-b from-slate-800/60 to-slate-900/90 border border-slate-700/80 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                        Akvaplaninq Riski Qiymətləndirməsi
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          simResult.aquaplaningRiskTier === 'LOW_SAFE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : simResult.aquaplaningRiskTier === 'ELEVATED_CAUTION'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : simResult.aquaplaningRiskTier === 'SEVERE_HIGH_RISK'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                        }`}
                      >
                        {simResult.aquaplaningRiskTier === 'LOW_SAFE'
                          ? 'Təhlükəsiz Qrip'
                          : simResult.aquaplaningRiskTier === 'ELEVATED_CAUTION'
                          ? 'Ehtiyatlı Olun'
                          : simResult.aquaplaningRiskTier === 'SEVERE_HIGH_RISK'
                          ? 'Yüksək Sürüşmə Riski'
                          : 'KRİTİK HİDRODİNAMİK ÜZMƏ!'}
                      </span>
                    </div>

                    <div className="space-y-1 text-center py-2">
                      <div className="text-4xl font-extrabold font-mono tracking-tight text-white flex items-center justify-center gap-2">
                        {simResult.aquaplaningRiskPercent}%
                        <TrendingUp
                          className={`w-7 h-7 ${
                            simResult.aquaplaningRiskPercent > 80 ? 'text-rose-500 animate-bounce' : 'text-cyan-400'
                          }`}
                        />
                      </div>
                      <div className="text-xs text-slate-400">
                        Faktiki Sürət ({approachSpeedKmh} km/s) / Hidroplaninq Həddi ({simResult.effectiveHydroplaningSpeedKmh} km/s)
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700/60 rounded-full h-3 overflow-hidden border border-slate-600">
                      <div
                        className={`h-full transition-all duration-300 ${
                          simResult.aquaplaningRiskPercent < 60
                            ? 'bg-emerald-500'
                            : simResult.aquaplaningRiskPercent < 85
                            ? 'bg-amber-500'
                            : 'bg-rose-600'
                        }`}
                        style={{ width: `${Math.min(100, simResult.aquaplaningRiskPercent)}%` }}
                      />
                    </div>

                    {/* Animated SVG Tire Contact Patch & Water Wedge */}
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                        <span>Təkər Təması & Su Pərdəsi Kəsiyi</span>
                        <span className="text-[10px] text-cyan-400 font-mono">v_aq: {simResult.effectiveHydroplaningSpeedKmh} km/s</span>
                      </div>
                      <svg viewBox="0 0 320 130" className="w-full h-28 overflow-hidden rounded-lg bg-slate-900">
                        {/* Asphalt Base & Texture */}
                        <rect x="0" y="100" width="320" height="30" fill="#1e293b" />
                        <line x1="0" y1="100" x2="320" y2="100" stroke="#475569" strokeWidth="2" strokeDasharray="3,3" />

                        {/* Water Film Puddle */}
                        {waterFilmDepthMm > 0 && (
                          <rect
                            x="0"
                            y={100 - Math.min(20, waterFilmDepthMm * 3)}
                            width="320"
                            height={Math.min(20, waterFilmDepthMm * 3)}
                            fill="rgba(6, 182, 212, 0.45)"
                          />
                        )}

                        {/* Hydrodynamic Water Wedge beneath Tire */}
                        {simResult.aquaplaningRiskPercent >= 65 && (
                          <polygon
                            points={`100,100 160,${100 - Math.min(14, (simResult.aquaplaningRiskPercent - 50) * 0.25)} 200,100`}
                            fill="rgba(56, 189, 248, 0.75)"
                            className="animate-pulse"
                          />
                        )}

                        {/* Tire Silhouette (Cross-section) */}
                        <path
                          d={`M 90,${
                            simResult.aquaplaningRiskPercent >= 90 ? 82 : 88
                          } Q 160,${
                            simResult.aquaplaningRiskPercent >= 90 ? 86 : 94
                          } 230,${
                            simResult.aquaplaningRiskPercent >= 90 ? 82 : 88
                          } L 245,30 Q 160,20 75,30 Z`}
                          fill="#0f172a"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                        />

                        {/* Tread Grooves Channels */}
                        <line x1="120" y1="50" x2="120" y2="92" stroke="#06b6d4" strokeWidth="2" />
                        <line x1="160" y1="45" x2="160" y2="93" stroke="#06b6d4" strokeWidth="2" />
                        <line x1="200" y1="50" x2="200" y2="92" stroke="#06b6d4" strokeWidth="2" />

                        {/* Tire Inflation Indicator Label */}
                        <text x="160" y="38" fill="#e2e8f0" fontSize="10" textAnchor="middle" fontWeight="bold">
                          {selectedVehicle.licensePlate} ({tirePressureKpa} kPa)
                        </text>

                        {/* Water Spray Particles if High Speed */}
                        {approachSpeedKmh > 70 && (
                          <>
                            <circle cx="70" cy="88" r="2.5" fill="#38bdf8" className="animate-ping" />
                            <circle cx="55" cy="80" r="2" fill="#06b6d4" />
                            <circle cx="45" cy="74" r="1.5" fill="#38bdf8" />
                            <circle cx="250" cy="88" r="2" fill="#38bdf8" />
                          </>
                        )}

                        {/* Separation Warning Banner if Floating */}
                        {simResult.aquaplaningRiskPercent >= 90 && (
                          <text x="160" y="75" fill="#f43f5e" fontSize="10" textAnchor="middle" fontWeight="bold">
                            ⚠️ HİDRODİNAMİK AYRILMA (TƏMAS İTDİ)
                          </text>
                        )}
                      </svg>
                    </div>

                    {/* Stopping Distance Comparison Metric */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">Quru Yolda Tormoz</div>
                        <div className="font-mono font-bold text-white text-sm">
                          {simResult.stoppingDistanceDryComparisonM} metr
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-cyan-500/20">
                        <div className="text-[10px] text-cyan-300">Nəm Yolda Tormoz (Faktiki)</div>
                        <div className="font-mono font-bold text-rose-400 text-sm">
                          {simResult.totalStoppingDistanceWetM} metr
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          +{simResult.stoppingDistanceIncreaseRatio}x dəfə artım
                        </div>
                      </div>
                    </div>

                    {/* Issue Certificate Fast Button */}
                    <button
                      onClick={handleGenerateCertificate}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      Yoxlama Nəticəsini Sertifikatlaşdır
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS & STATUTORY FINES */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-cyan-400" />
                    Nəqliyyat Kateqoriyaları & Təkər Protektoru Standartı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    "Yol hərəkəti haqqında" Qanuna uyğun minimal protektor dərinliyi və İXM cərimə hesabatı
                  </p>
                </div>
                {/* Currency Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-700 text-xs">
                  <span className="text-slate-400 px-1 text-[11px]">Valyuta:</span>
                  {(['AZN', 'USD', 'EUR'] as const).map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setSelectedCurrency(cur)}
                      className={`px-2 py-0.5 rounded font-bold transition-colors ${
                        selectedCurrency === cur
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Preset Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_SKID_VEHICLE_PRESETS.map((preset) => {
                  const isSelected = selectedVehicle.id === preset.id;
                  const isIllegalTread = preset.treadDepthMm < (preset.category === 'heavy_truck_tir' ? 1.0 : preset.category === 'intercity_coach_bus' ? 2.0 : 1.6);
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectVehicle(preset)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-slate-900 text-amber-300 border border-slate-700 tracking-wider">
                          {preset.licensePlate}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isIllegalTread
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isIllegalTread ? 'İXM 342.1 XƏTASI' : 'Qanuni Protektor'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white mb-1">{preset.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{preset.cargoDescription}</p>

                      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-slate-900/70 rounded-lg text-center text-xs mb-3 border border-slate-800">
                        <div>
                          <div className="text-[10px] text-slate-400">Protektor</div>
                          <div className={`font-mono font-bold ${isIllegalTread ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {preset.treadDepthMm} mm
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Təzyiq</div>
                          <div className="font-mono font-bold text-blue-300">{preset.tirePressureKpa} kPa</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Çəki</div>
                          <div className="font-mono font-bold text-slate-300">{preset.vehicleMassKg} kq</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 border-t border-slate-700/50 pt-2 flex items-center justify-between">
                        <span>Ölçü: {preset.tireDimensions}</span>
                        <span className="text-cyan-400 font-semibold">Seçildi</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Statutory Fines & Sanctions Overview Card */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <h4 className="font-bold text-sm text-white">
                      İnzibati Xətalar Məcəlləsi (İXM) üzrə Hüquqi Qiymətləndirmə
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded">
                    İXM Maddə 342.1 & 328
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Aşınmış Təkər Cəriməsi (İXM 342.1)</div>
                    <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                      {convertSkidCurrency(fineCalculation.treadFineAzn, selectedCurrency).formatted}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {fineCalculation.hasTreadViolation
                        ? `Protektor (${treadDepthMm} mm) < tələb olunan (${simResult.tireMinimumStatutoryDepthMm} mm)`
                        : 'Şin normativə tam uyğundur'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400">Sürət Aşma Cəriməsi (İXM 328)</div>
                    <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                      {convertSkidCurrency(fineCalculation.speedFineAzn, selectedCurrency).formatted}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {fineCalculation.hasSpeedExcessWet
                        ? `+${fineCalculation.speedExcessKmh} km/s artıq (${fineCalculation.penaltyPoints} cərimə balı)`
                        : 'Sürət həddi daxilindədir'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/70 rounded-xl border border-cyan-500/20">
                    <div className="text-xs text-cyan-300">İXM Maddə 38 ilə 50% Güzəştli Ödəniş</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                      {convertSkidCurrency(fineCalculation.totalFineDiscountedAzn, selectedCurrency).formatted}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Bildirişdən sonra 30 gün ərzində ödədikdə qüvvədədir
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-300">Rəsmi Qanunvericilik Əsaslandırması:</div>
                  {fineCalculation.statutoryLegalArticlesAz.map((article, idx) => (
                    <div key={idx} className="text-slate-400 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{article}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT TECHNICAL CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    10-Bəndlik Texniki Asfalt & Təkər Təhlükəsizliyi Audit Standartı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AAYDA, AZS 410, ASTM E1845 və EN 13036-1 beynəlxalq standartlarına uyğun yoxlama
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Auditin Tamamlanma Dərəcəsi</span>
                  <span className={`font-mono font-bold ${checklistScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {checklistScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistScore === 100 ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${checklistScore}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {MOCK_SKID_CHECKLIST.map((item, idx) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-800/80 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-800/30 border-slate-700/60 hover:bg-slate-800/50'
                      }`}
                    >
                      <div
                        className={`mt-0.5 p-1 rounded-md border flex items-center justify-center ${
                          isChecked
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-900 text-transparent border-slate-600'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className={`text-sm font-bold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                            {idx + 1}. {item.titleAz}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-cyan-300 rounded border border-slate-700">
                              {item.categoryAz}
                            </span>
                            {item.isMandatory && (
                              <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 font-semibold">
                                Məcburi Standart
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{item.detailsAz}</p>
                        <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1 font-mono">
                          <Info className="w-3.5 h-3.5 text-cyan-400" /> Normativ: {item.referenceStandard}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SAFETY EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-cyan-400" />
                    Asfalt İlişməsi, Akvaplaninq & Yol Hərəkəti Təhlükəsizliyi İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    10 nəzəri test sualı vasitəsilə sürücülük və mühəndislik biliklərinin qiymətləndirilməsi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuickFillExam}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-colors"
                  >
                    100% Düzgün Doldur
                  </button>
                  <button
                    onClick={handleResetExam}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    Təmizlə
                  </button>
                </div>
              </div>

              {/* Exam Result Header if submitted */}
              {isExamSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    examScore >= 80
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm">
                      {examScore >= 80 ? 'Təbriklər! İmtahan Uğurla Keçildi' : 'Təəssüf, İmtahan Nəticəsi Qeyri-Qənaətbəxşdir'}
                    </div>
                    <div className="text-xs opacity-80">
                      Nəticəniz: {examScore}% (Minimal keçid balı: 80%)
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('certificate')}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Sertifikatı Al
                  </button>
                </div>
              )}

              {/* Exam Questions */}
              <div className="space-y-4">
                {MOCK_SKID_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedIdx = examAnswers[q.id];
                  const isAnswered = selectedIdx !== undefined;
                  const isCorrect = isAnswered && selectedIdx === q.correctIndex;

                  return (
                    <div key={q.id} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-sm text-white">
                          {idx + 1}. {q.questionAz}
                        </h4>
                        {isExamSubmitted && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {isCorrect ? 'DÜZGÜN' : 'SƏHV'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {q.optionsAz.map((option, optIdx) => {
                          const isOptionSelected = selectedIdx === optIdx;
                          let optionStyle = 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800';

                          if (isOptionSelected) {
                            optionStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold';
                          }
                          if (isExamSubmitted) {
                            if (optIdx === q.correctIndex) {
                              optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected) {
                              optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isExamSubmitted}
                              onClick={() => handleSelectExamAnswer(q.id, optIdx)}
                              className={`p-3 text-left rounded-lg border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                            >
                              <span>{option}</span>
                              {isOptionSelected && (
                                <span className="w-2 h-2 rounded-full bg-cyan-400 ml-2 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/80 text-xs space-y-1 text-slate-300">
                          <div className="font-semibold text-cyan-300">İzah & Hüquqi Əsas:</div>
                          <div>{q.explanationAz}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Maddə: {q.legalArticle}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isExamSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    İmtahanı Tamamla və Qiymətləndir
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: OFFICIAL ELECTRONIC CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Rəsmi Elektron Səth İlişməsi & Şin Sertifikatı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    SİMA rəqəmsal imzalı və QR kodlu SKID-SAFE-AZ-2026 Dövlət Yol Şəhadətnaməsi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCertificate(activeCertificate)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedCertId === activeCertificate.certificateId ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Çap Et
                  </button>
                </div>
              </div>

              {/* Printable Certificate Template */}
              <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-2xl shadow-2xl space-y-6 text-slate-200 relative overflow-hidden">
                {/* Certificate Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <Droplets className="w-96 h-96 text-cyan-400" />
                </div>

                {/* Certificate Top Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-500/30 pb-4 gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                      Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA) & BDYP
                    </div>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      RƏSMİ SKİD-SAFE-AZ YOL VƏ TƏKƏR UYĞUNLUQ SERTİFİKATI
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Qeydiyyat No: <span className="text-cyan-300 font-bold">{activeCertificate.certificateId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      SİMA İLƏ TƏSDİQLƏNİB
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">{activeCertificate.simaDigitalUid}</div>
                  </div>
                </div>

                {/* Certificate Core Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase">Dövlət Qeydiyyat Nişanı</div>
                    <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                      {activeCertificate.vehiclePlate}
                    </div>
                    <div className="text-xs text-slate-300">{activeCertificate.vehicleModel}</div>
                  </div>

                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase">Yoxlanılmış Dəhliz</div>
                    <div className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                      {activeCertificate.corridorNameAz}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{activeCertificate.route}</div>
                  </div>

                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase">Asfalt Sürtünməsi (SN60)</div>
                    <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                      {activeCertificate.skidNumberSn60}
                    </div>
                    <div className="text-xs text-emerald-400">{activeCertificate.pavementState}</div>
                  </div>

                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase">Akvaplaninq Sürəti</div>
                    <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                      {activeCertificate.hydroplaningSpeedKmh} km/saat
                    </div>
                    <div className="text-xs text-slate-400">
                      Tormoz: {activeCertificate.calculatedStoppingDistanceM} m
                    </div>
                  </div>
                </div>

                {/* Verification Bar */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Verilmə Tarixi: </span>
                    <span className="text-white font-mono font-bold">{activeCertificate.issueDate}</span>
                    <span className="text-slate-500 mx-2">|</span>
                    <span className="text-slate-400">Etibarlılıq: </span>
                    <span className="text-white font-mono font-bold">{activeCertificate.expiryDate} (6 Ay)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Buraxılış PİN:</span>
                    <span className="px-2 py-0.5 bg-slate-800 font-mono font-bold text-cyan-400 border border-slate-700 rounded">
                      {activeCertificate.passPinCode}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono border-t border-slate-800 pt-3 flex flex-col sm:flex-row justify-between gap-2">
                  <span>SHA-256 Checksum: {activeCertificate.verificationSha256}</span>
                  <span className="text-emerald-400">AR Yol Hərəkəti Təhlükəsizliyi Komissiyası Reyestri</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY SEARCH */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-400" />
                    Vahid Dövlət Asfalt İlişmə & Təkər Reyestri Axtarışı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Aktiv və arxivləşdirilmiş SKID-SAFE-AZ-2026 sertifikatlarının canlı yoxlanılması
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Sertifikat no, nömrə və ya dəhliz..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Registry Records Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-700/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Sertifikat ID</th>
                      <th className="py-3 px-4">Nəqliyyat & Nömrə</th>
                      <th className="py-3 px-4">Magistral Dəhliz</th>
                      <th className="py-3 px-4">SN60 / Akvaplaninq</th>
                      <th className="py-3 px-4">Tarix</th>
                      <th className="py-3 px-4 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                    {filteredRegistry.map((cert) => (
                      <tr key={cert.certificateId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                          {cert.certificateId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{cert.vehiclePlate}</div>
                          <div className="text-[11px] text-slate-400">{cert.vehicleModel}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200 line-clamp-1">{cert.corridorNameAz}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{cert.route}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-emerald-400 font-bold">SN {cert.skidNumberSn60}</span>
                          <span className="text-slate-500 mx-1">•</span>
                          <span className="font-mono text-slate-300">{cert.hydroplaningSpeedKmh} km/s</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {cert.issueDate}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setActiveCertificate(cert);
                              setActiveTab('certificate');
                            }}
                            className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded text-[11px] font-semibold transition-colors"
                          >
                            Bax & Çap
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredRegistry.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          Sorğunuza uyğun sertifikat tapılmadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AAYDA Magistral Asfalt Qoruma və Yol Polisi Hərəkət Təhlükəsizliyi Şurası</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Versiya: 2026.11.02</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
