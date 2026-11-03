import React, { useState, useMemo } from 'react';
import {
  X,
  Snowflake,
  ShieldAlert,
  Wind,
  Thermometer,
  CloudRain,
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
  Droplets,
  Layers,
  Compass,
} from 'lucide-react';
import {
  Currency,
  SurfaceCondition,
  PrecipitationType,
  TyreType,
  RwisStation,
  VehiclePreset,
  RwisCertificate,
  convertRwisCurrency,
  RWIS_CURRENCY_SYMBOLS,
  calculateDewPoint,
  evaluateBlackIceRisk,
  calculateFrictionCoefficient,
  calculateStoppingDistance,
  evaluateFastAntiIcingSpray,
  evaluateStatutorySanctions,
  calculateAdvisorySpeedLimit,
  generateRwisCertificate,
} from '../utils/rwisSafeCompliance';
import {
  MOCK_RWIS_STATIONS,
  MOCK_VEHICLE_PRESETS,
  MOCK_TECHNICAL_CHECKLIST,
  MOCK_THEORETICAL_EXAM,
  MOCK_RWIS_CERTIFICATES,
} from '../data/mockRwisSafeData';

interface RwisSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType =
  | 'radar'
  | 'simulator'
  | 'sanctions'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const RwisSafeModal: React.FC<RwisSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedStation, setSelectedStation] = useState<RwisStation>(MOCK_RWIS_STATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulator controls
  const [airTempC, setAirTempC] = useState<number>(-2.4);
  const [surfaceTempC, setSurfaceTempC] = useState<number>(-3.8);
  const [subsurfaceTempC, setSubsurfaceTempC] = useState<number>(0.8);
  const [relativeHumidityPct, setRelativeHumidityPct] = useState<number>(94);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(48);
  const [chemicalResidualGm2, setChemicalResidualGm2] = useState<number>(4.5);
  const [waterFilmThicknessMm, setWaterFilmThicknessMm] = useState<number>(0.8);
  const [surfaceCondition, setSurfaceCondition] = useState<SurfaceCondition>('BLACK_ICE');
  const [precipitationType, setPrecipitationType] = useState<PrecipitationType>('FREEZING_RAIN');
  const [vehicleSpeedKmh, setVehicleSpeedKmh] = useState<number>(80);
  const [selectedTyreType, setSelectedTyreType] = useState<TyreType>('WINTER_STUDDED_CHAINS');
  const [fastTankLevelPct, setFastTankLevelPct] = useState<number>(82);
  const [forceFastSpray, setForceFastSpray] = useState<boolean>(false);

  // Selected vehicle preset
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePreset>(MOCK_VEHICLE_PRESETS[0]);
  const [interferesWithPlow, setInterferesWithPlow] = useState<boolean>(false);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'chk-1': true,
    'chk-2': true,
    'chk-3': true,
    'chk-4': true,
    'chk-5': true,
    'chk-6': true,
    'chk-7': true,
    'chk-8': true,
    'chk-9': false,
    'chk-10': true,
  });

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificate & Registry state
  const [currentCertificate, setCurrentCertificate] = useState<RwisCertificate>(MOCK_RWIS_CERTIFICATES[0]);
  const [registryList, setRegistryList] = useState<RwisCertificate[]>(MOCK_RWIS_CERTIFICATES);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Derived calculations
  const calculatedDewPoint = useMemo(() => {
    return calculateDewPoint(airTempC, relativeHumidityPct);
  }, [airTempC, relativeHumidityPct]);

  const blackIceEvaluation = useMemo(() => {
    return evaluateBlackIceRisk(
      surfaceTempC,
      calculatedDewPoint,
      surfaceCondition,
      precipitationType,
      chemicalResidualGm2
    );
  }, [surfaceTempC, calculatedDewPoint, surfaceCondition, precipitationType, chemicalResidualGm2]);

  const frictionEvaluation = useMemo(() => {
    return calculateFrictionCoefficient(
      surfaceCondition,
      selectedTyreType,
      waterFilmThicknessMm,
      chemicalResidualGm2
    );
  }, [surfaceCondition, selectedTyreType, waterFilmThicknessMm, chemicalResidualGm2]);

  const stoppingDistance = useMemo(() => {
    return calculateStoppingDistance(vehicleSpeedKmh, frictionEvaluation.frictionMu, 1.2);
  }, [vehicleSpeedKmh, frictionEvaluation.frictionMu]);

  const dryStoppingDistance = useMemo(() => {
    return calculateStoppingDistance(vehicleSpeedKmh, 0.82, 1.2);
  }, [vehicleSpeedKmh]);

  const advisorySpeedLimit = useMemo(() => {
    return calculateAdvisorySpeedLimit(surfaceCondition, frictionEvaluation.frictionMu, 110);
  }, [surfaceCondition, frictionEvaluation.frictionMu]);

  const fastSprayEvaluation = useMemo(() => {
    if (forceFastSpray) {
      return {
        systemStatus: 'ACTIVE_SPRAYING' as const,
        sprayRecommended: true,
        dosageMlPerM2: 30,
        solutionType: 'NACL_BRINE_23' as const,
        nozzlePressureBar: 6.5,
        frictionImprovementDelta: 0.22,
        actionMessageAz: 'MƏCBURİ AKTİV ÇİLƏMƏ: Operator tərəfindən FAST duz məhlulu sistemi işə salındı.',
        actionMessageEn: 'MANUAL OVERRIDE: FAST high-pressure brine misting triggered by operator.',
      };
    }
    return evaluateFastAntiIcingSpray(
      blackIceEvaluation.riskScore,
      surfaceCondition,
      surfaceTempC,
      fastTankLevelPct
    );
  }, [forceFastSpray, blackIceEvaluation.riskScore, surfaceCondition, surfaceTempC, fastTankLevelPct]);

  const sanctionsEvaluation = useMemo(() => {
    return evaluateStatutorySanctions(
      selectedTyreType,
      selectedVehicle.treadDepthMm,
      vehicleSpeedKmh,
      advisorySpeedLimit,
      surfaceCondition,
      interferesWithPlow
    );
  }, [
    selectedTyreType,
    selectedVehicle.treadDepthMm,
    vehicleSpeedKmh,
    advisorySpeedLimit,
    surfaceCondition,
    interferesWithPlow,
  ]);

  // Audio synthesizer for SCADA alert sound
  const playIceAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.35);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.75);
    } catch {
      // AudioContext not permitted or muted in test environment
    }
  };

  const handleSelectStation = (station: RwisStation) => {
    setSelectedStation(station);
    setAirTempC(station.sensorTelemetry.airTempC);
    setSurfaceTempC(station.sensorTelemetry.surfaceTempC);
    setSubsurfaceTempC(station.sensorTelemetry.subsurfaceTempC);
    setRelativeHumidityPct(station.sensorTelemetry.relativeHumidityPct);
    setWindSpeedKmh(station.sensorTelemetry.windSpeedKmh);
    setChemicalResidualGm2(station.sensorTelemetry.chemicalResidualGm2);
    setWaterFilmThicknessMm(station.sensorTelemetry.waterFilmThicknessMm);
    setSurfaceCondition(station.sensorTelemetry.surfaceCondition);
    setPrecipitationType(station.sensorTelemetry.precipitationType);
    setFastTankLevelPct(station.sensorTelemetry.fastTankLevelPct);
    setForceFastSpray(false);
  };

  const handleSelectVehicle = (preset: VehiclePreset) => {
    setSelectedVehicle(preset);
    setSelectedTyreType(preset.tyreType);
  };

  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAllChecklist = () => {
    const next: Record<string, boolean> = {};
    MOCK_TECHNICAL_CHECKLIST.forEach((item) => {
      next[item.id] = true;
    });
    setCheckedItems(next);
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
  };

  const checklistScore = useMemo(() => {
    const total = MOCK_TECHNICAL_CHECKLIST.length;
    const passed = MOCK_TECHNICAL_CHECKLIST.filter((i) => checkedItems[i.id]).length;
    return Math.round((passed / total) * 100);
  }, [checkedItems]);

  const handleExamAnswer = (questionId: number, optionIdx: number) => {
    if (isExamSubmitted) return;
    setExamAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleExamSubmit = () => {
    setIsExamSubmitted(true);
  };

  const handleExamReset = () => {
    setExamAnswers({});
    setIsExamSubmitted(false);
  };

  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_THEORETICAL_EXAM.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  }, [examAnswers]);

  const handleGenerateCertificate = () => {
    const newCert = generateRwisCertificate({
      stationCode: selectedStation.code,
      stationName: selectedStation.nameAz,
      corridor: selectedStation.corridor,
      picketKm: selectedStation.picketKm,
      vehiclePlate: selectedVehicle.plateNumber,
      vehicleModel: selectedVehicle.model,
      tyreType: selectedTyreType,
      surfaceCondition,
      surfaceTempC,
      dewPointC: calculatedDewPoint,
      frictionMu: frictionEvaluation.frictionMu,
      stoppingDistanceMeters: stoppingDistance.totalStoppingDistanceM,
      advisorySpeedLimitKmh: advisorySpeedLimit,
      blackIceRiskLevel: blackIceEvaluation.riskLevel,
      fastSystemTriggered: fastSprayEvaluation.sprayRecommended,
    });
    setCurrentCertificate(newCert);
    setRegistryList((prev) => [newCert, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopy = (text: string, code: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_RWIS_STATIONS;
    const q = searchQuery.toLowerCase();
    return MOCK_RWIS_STATIONS.filter(
      (s) =>
        s.nameAz.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.corridor.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredRegistry = useMemo(() => {
    if (!searchQuery.trim()) return registryList;
    const q = searchQuery.toLowerCase();
    return registryList.filter(
      (c) =>
        c.certificateId.toLowerCase().includes(q) ||
        c.vehiclePlate.toLowerCase().includes(q) ||
        c.stationName.toLowerCase().includes(q) ||
        c.simaDigitalUid.toLowerCase().includes(q)
    );
  }, [registryList, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <Snowflake className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  AAYDA • ETSN • AYNA • BDYP
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SCADA LIVE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                RWIS Magistral Yol-Hava Məlumat & Qara Buz (Black Ice) Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/70 border-b border-cyan-500/10 overflow-x-auto scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            Stansiyalar Radarı ({MOCK_RWIS_STATIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            RWIS Telemetriya & FAST Çiləmə
          </button>
          <button
            onClick={() => setActiveTab('sanctions')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'sanctions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Car className="w-4 h-4" />
            Avtomobil Presetləri & İXM Cərimələri
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Texniki Standartlar (AZS/EN 15518)
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'exam'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Qış Hərəkət İmtahanı (10 Sual)
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            SİMA Rəqəmsal Sertifikat
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4" />
            Dövlət Reyestri
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Azərbaycan Magistral Yol Şəbəkəsi RWIS Stansiyaları
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və ETSN tərəfindən idarə olunan strateji aşırım və viaduktlarda quraşdırılmış yol-hava müşahidə qovşaqları
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Stansiya və ya magistral axtar..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((station) => {
                  const isSelected = selectedStation.id === station.id;
                  const isBlackIce = station.sensorTelemetry.surfaceCondition === 'BLACK_ICE';
                  return (
                    <div
                      key={station.id}
                      onClick={() => handleSelectStation(station)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/50'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/30">
                              {station.code}
                            </span>
                            <span className="text-xs text-slate-400">{station.picketKm}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-white mt-1.5">
                            {station.nameAz}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">{station.corridor}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isBlackIce
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                              : station.sensorTelemetry.surfaceCondition === 'SNOW_PACKED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {station.sensorTelemetry.surfaceCondition}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/60 text-center">
                        <div className="p-2 rounded-lg bg-slate-900/60">
                          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Thermometer className="w-3 h-3 text-cyan-400" /> Səth
                          </span>
                          <span
                            className={`text-xs font-bold font-mono mt-0.5 block ${
                              station.sensorTelemetry.surfaceTempC <= 0 ? 'text-cyan-300' : 'text-slate-200'
                            }`}
                          >
                            {station.sensorTelemetry.surfaceTempC}°C
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/60">
                          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Gauge className="w-3 h-3 text-amber-400" /> İlişmə (μ)
                          </span>
                          <span
                            className={`text-xs font-bold font-mono mt-0.5 block ${
                              station.sensorTelemetry.frictionMu < 0.25 ? 'text-rose-400' : 'text-slate-200'
                            }`}
                          >
                            {station.sensorTelemetry.frictionMu.toFixed(2)}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/60">
                          <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Wind className="w-3 h-3 text-emerald-400" /> Külək
                          </span>
                          <span className="text-xs font-bold font-mono mt-0.5 block text-slate-200">
                            {station.sensorTelemetry.windSpeedKmh} km/s
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Hündürlük: {station.altitudeMeters} m</span>
                        <span className="text-cyan-400">
                          FAST Çiləmə: {station.sensorTelemetry.fastSpraySystemEquipped ? 'Təchiz Edilib' : 'Yoxdur'}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between">
                          <span className="text-[11px] text-cyan-300 font-medium">
                            Seçilmiş Stansiya
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('simulator');
                            }}
                            className="text-[11px] px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 font-medium transition"
                          >
                            Simulyatora Keç →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Alert Status Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  blackIceEvaluation.isBlackIceLikely
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      blackIceEvaluation.isBlackIceLikely ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Riskin Dərəcəsi: {blackIceEvaluation.riskLevel}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/40">
                        Qara Buz İndeksi: {blackIceEvaluation.riskScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {fastSprayEvaluation.actionMessageAz}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={playIceAlertSound}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-600 transition"
                  >
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    SCADA Siqnal Səsi
                  </button>
                  <button
                    onClick={() => setForceFastSpray(!forceFastSpray)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      forceFastSpray || fastSprayEvaluation.sprayRecommended
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Droplets className="w-4 h-4" />
                    {forceFastSpray ? 'FAST Püskürtmə Dayandır' : 'FAST Məcburi Çilə'}
                  </button>
                </div>
              </div>

              {/* Dynamic 2D SVG Highway Weather & RWIS Canvas */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 overflow-hidden shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    SCADA Telemetriya Qrafiki & FAST Nozzle Püskürtmə Monitoru ({selectedStation.code})
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Həqiqi Sürtünmə: μ = {frictionEvaluation.frictionMu.toFixed(2)} | Tövsiyə Edilən Sürət: {advisorySpeedLimit} km/s
                  </span>
                </div>

                <div className="relative w-full h-48 sm:h-56 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
                    {/* Sky and clouds */}
                    <rect x="0" y="0" width="800" height="150" fill="#080e1a" />
                    {/* Mountain silhouette in background */}
                    <polygon points="0,150 120,70 260,150 380,50 560,150 680,80 800,150" fill="#0f1b2d" opacity="0.6" />

                    {/* RWIS Station Mast on Shoulder (X: 100) */}
                    <line x1="120" y1="160" x2="120" y2="40" stroke="#64748b" strokeWidth="4" />
                    {/* Anemometer */}
                    <circle cx="120" cy="35" r="5" fill="#38bdf8" />
                    <line x1="110" y1="35" x2="130" y2="35" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="110" cy="35" r="3" fill="#0284c7" />
                    <circle cx="130" cy="35" r="3" fill="#0284c7" />
                    {/* Disdrometer Scatter Sensor */}
                    <rect x="112" y="60" width="16" height="10" rx="2" fill="#0369a1" />
                    {/* IR Pyrometer aiming at road */}
                    <rect x="114" y="90" width="12" height="8" rx="2" fill="#e11d48" />
                    <line x1="120" y1="98" x2="190" y2="180" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                    <text x="135" y="68" fill="#38bdf8" fontSize="10" fontFamily="monospace">RWIS MAST</text>

                    {/* Roadbed Layer (Y: 160 to 240) */}
                    {/* Subgrade */}
                    <rect x="0" y="200" width="800" height="40" fill="#1e293b" />
                    <text x="10" y="225" fill="#64748b" fontSize="10" fontFamily="sans-serif">Qrun / Subsurface (30sm Zond: {subsurfaceTempC}°C)</text>
                    {/* Asphalt Pavement */}
                    <rect x="0" y="160" width="800" height="40" fill="#334155" />
                    {/* Lane Marking */}
                    <line x1="0" y1="180" x2="800" y2="180" stroke="#f8fafc" strokeWidth="2" strokeDasharray="20 15" opacity="0.4" />

                    {/* Ice Glaze / Water Film Overlay on Pavement */}
                    {surfaceCondition === 'BLACK_ICE' && (
                      <rect x="0" y="158" width="800" height="5" fill="#38bdf8" opacity="0.85" />
                    )}
                    {surfaceCondition === 'SNOW_PACKED' && (
                      <rect x="0" y="156" width="800" height="7" fill="#f8fafc" opacity="0.9" />
                    )}
                    {surfaceCondition === 'WET' && (
                      <rect x="0" y="158" width="800" height="4" fill="#0284c7" opacity="0.6" />
                    )}

                    {/* FAST Nozzle Network & Spray Mist (X: 250, 450, 650) */}
                    {[250, 450, 650].map((nx, i) => (
                      <g key={i}>
                        {/* Pop-up nozzle in roadbed */}
                        <circle cx={nx} cy="160" r="4" fill="#06b6d4" />
                        {(fastSprayEvaluation.sprayRecommended || forceFastSpray) && (
                          <g>
                            {/* Blue brine mist cone */}
                            <path
                              d={`M ${nx} 160 Q ${nx - 40} 130 ${nx - 60} 158 Z`}
                              fill="rgba(6, 182, 212, 0.35)"
                            />
                            <path
                              d={`M ${nx} 160 Q ${nx + 40} 130 ${nx + 60} 158 Z`}
                              fill="rgba(6, 182, 212, 0.35)"
                            />
                            {/* Spray particles */}
                            <circle cx={nx - 25} cy="145" r="1.5" fill="#67e8f9" />
                            <circle cx={nx + 25} cy="148" r="1.5" fill="#67e8f9" />
                            <circle cx={nx} cy="138" r="2" fill="#a5f3fc" />
                          </g>
                        )}
                      </g>
                    ))}

                    {/* Moving Vehicle Silhouette (X: 380, Y: 140) */}
                    <g transform="translate(360, 125)">
                      <rect x="0" y="10" width="110" height="25" rx="5" fill="#0284c7" />
                      <path d="M 20 10 L 40 -6 L 85 -6 L 100 10 Z" fill="#0369a1" />
                      {/* Windows */}
                      <polygon points="42,-4 58,-4 58,10 32,10" fill="#bae6fd" opacity="0.8" />
                      <polygon points="62,-4 82,-4 92,10 62,10" fill="#bae6fd" opacity="0.8" />
                      {/* Wheels */}
                      <circle cx="25" cy="35" r="10" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                      <circle cx="85" cy="35" r="10" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                      {/* Grip vector arrows */}
                      <line x1="25" y1="42" x2={25 + frictionEvaluation.frictionMu * 40} y2="42" stroke="#10b981" strokeWidth="3" />
                      <line x1="85" y1="42" x2={85 + frictionEvaluation.frictionMu * 40} y2="42" stroke="#10b981" strokeWidth="3" />
                      {/* Plate text */}
                      <rect x="35" y="17" width="40" height="11" rx="2" fill="#ffffff" />
                      <text x="38" y="25" fill="#000000" fontSize="8" fontWeight="bold" fontFamily="monospace">
                        {selectedVehicle.plateNumber}
                      </text>
                    </g>

                    {/* HUD Overlay Stats in SVG */}
                    <rect x="580" y="15" width="205" height="100" rx="8" fill="rgba(2, 6, 23, 0.85)" stroke="#0e7490" strokeWidth="1" />
                    <text x="590" y="32" fill="#38bdf8" fontSize="11" fontWeight="bold">RWIS TELEMETRİYA HUD</text>
                    <text x="590" y="50" fill="#94a3b8" fontSize="10">Səth Temp: <tspan fill="#f1f5f9" fontWeight="bold">{surfaceTempC}°C</tspan></text>
                    <text x="590" y="65" fill="#94a3b8" fontSize="10">Şeh Nöqtəsi: <tspan fill="#f1f5f9" fontWeight="bold">{calculatedDewPoint}°C</tspan></text>
                    <text x="590" y="80" fill="#94a3b8" fontSize="10">Sürtünmə μ: <tspan fill={frictionEvaluation.frictionMu < 0.25 ? "#f43f5e" : "#10b981"} fontWeight="bold">{frictionEvaluation.frictionMu.toFixed(2)}</tspan></text>
                    <text x="590" y="95" fill="#94a3b8" fontSize="10">FAST Nozzles: <tspan fill="#38bdf8" fontWeight="bold">{fastSprayEvaluation.systemStatus}</tspan></text>
                    <text x="590" y="108" fill="#94a3b8" fontSize="9">Reagent Sərfiyyatı: {fastSprayEvaluation.dosageMlPerM2} ml/m² ({fastSprayEvaluation.nozzlePressureBar} bar)</text>
                  </svg>
                </div>
              </div>

              {/* Interactive Controls & Physics Stand */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sliders & Weather Controls */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-cyan-400" />
                    Yol-Hava Şəraiti & Sensor İdarəetməsi
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Hava Temperaturu (Air Temp)</span>
                        <span className="font-mono text-cyan-300 font-bold">{airTempC}°C</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="25"
                        step="0.5"
                        value={airTempC}
                        onChange={(e) => setAirTempC(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Asfalt Səth Temperaturu (Surface Temp)</span>
                        <span className="font-mono text-cyan-300 font-bold">{surfaceTempC}°C</span>
                      </div>
                      <input
                        type="range"
                        min="-15"
                        max="20"
                        step="0.5"
                        value={surfaceTempC}
                        onChange={(e) => setSurfaceTempC(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Dərinlik Qatı (30sm Subsurface Temp)</span>
                        <span className="font-mono text-cyan-300 font-bold">{subsurfaceTempC}°C</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="18"
                        step="0.5"
                        value={subsurfaceTempC}
                        onChange={(e) => setSubsurfaceTempC(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Nisbi Rütubət (Relative Humidity)</span>
                        <span className="font-mono text-cyan-300 font-bold">{relativeHumidityPct}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="1"
                        value={relativeHumidityPct}
                        onChange={(e) => setRelativeHumidityPct(parseInt(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Kimyəvi Reagent Qalıq Miqdarı (Salinity)</span>
                        <span className="font-mono text-cyan-300 font-bold">{chemicalResidualGm2} g/m²</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="0.5"
                        value={chemicalResidualGm2}
                        onChange={(e) => setChemicalResidualGm2(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-slate-400 block mb-1">Yol Səth Vəziyyəti</label>
                        <select
                          value={surfaceCondition}
                          onChange={(e) => setSurfaceCondition(e.target.value as SurfaceCondition)}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        >
                          <option value="DRY">DRY (Quru)</option>
                          <option value="DAMP">DAMP (Nəm)</option>
                          <option value="WET">WET (Yaş)</option>
                          <option value="SLUSH">SLUSH (Sulu Qar)</option>
                          <option value="SNOW_PACKED">SNOW_PACKED (Qar)</option>
                          <option value="BLACK_ICE">BLACK_ICE (Qara Buz)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Yağıntı Növü</label>
                        <select
                          value={precipitationType}
                          onChange={(e) => setPrecipitationType(e.target.value as PrecipitationType)}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                        >
                          <option value="NONE">NONE (Yoxdur)</option>
                          <option value="LIGHT_RAIN">LIGHT_RAIN (Yağış)</option>
                          <option value="FREEZING_RAIN">FREEZING_RAIN (Dondurucu Yağış)</option>
                          <option value="SLEET">SLEET (Sulu Qar)</option>
                          <option value="LIGHT_SNOW">LIGHT_SNOW (Qar)</option>
                          <option value="BLIZZARD">BLIZZARD (Çovğun)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Speed, Tyres & Stopping Physics */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-400" />
                    Avtomobil Dinamikası & Əyləc Məsafəsi
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Hərəkət Sürəti (Speed)</span>
                        <span className="font-mono text-emerald-400 font-bold">{vehicleSpeedKmh} km/s</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="140"
                        step="5"
                        value={vehicleSpeedKmh}
                        onChange={(e) => setVehicleSpeedKmh(parseInt(e.target.value))}
                        className="w-full accent-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Quraşdırılmış Şin Tipi</label>
                      <select
                        value={selectedTyreType}
                        onChange={(e) => setSelectedTyreType(e.target.value as TyreType)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                      >
                        <option value="SUMMER">SUMMER (Yay Şinləri - Buzda Sürüşür)</option>
                        <option value="ALL_SEASON">ALL_SEASON (Bütün Mövsüm M+S)</option>
                        <option value="WINTER_STUDLESS">WINTER_STUDLESS (Qış Şinləri - Friksion/Silica)</option>
                        <option value="WINTER_STUDDED_CHAINS">WINTER_STUDDED_CHAINS (Tikanlı Şinlər / Zəncir)</option>
                      </select>
                    </div>

                    {/* Stopping distance comparison card */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700 space-y-2 mt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Reaksiya Məsafəsi (1.2s):</span>
                        <span className="font-mono font-bold text-white">{stoppingDistance.reactionDistanceM} m</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Tormoz Məsafəsi:</span>
                        <span className="font-mono font-bold text-amber-300">{stoppingDistance.brakingDistanceM} m</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                        <span className="text-slate-300 font-semibold">Ümumi Dayanma Məsafəsi:</span>
                        <span className="font-mono font-bold text-cyan-300 text-sm">{stoppingDistance.totalStoppingDistanceM} m</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>Quru Yolla Müqayisə (Dry: {dryStoppingDistance.totalStoppingDistanceM}m):</span>
                        <span className="font-mono text-rose-400 font-bold">
                          +{frictionEvaluation.stoppingDistanceMultiplier}x Artım
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleGenerateCertificate}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs tracking-wide shadow-md transition"
                      >
                        RWIS Təhlükəsizlik Sertifikatı Yarat →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SANCTIONS */}
          {activeTab === 'sanctions' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Nəqliyyat Vasitəsi Presetləri & İnzibati Xətalar Məcəlləsi (İXM) Sanksiyaları
                </h3>
                <p className="text-xs text-slate-400">
                  Qara buz və şaxtalı hava şəraitində şinlərin mövsümə uyğunluğu və təhlükəsiz sürət rejimi cərimələri
                </p>
              </div>

              {/* Vehicle Presets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_VEHICLE_PRESETS.map((preset) => {
                  const isSelected = selectedVehicle.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectVehicle(preset)}
                      className={`cursor-pointer p-3 rounded-xl border transition ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                          : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-white text-slate-900">
                          {preset.plateNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">{preset.category}</span>
                      </div>
                      <h5 className="text-xs font-semibold text-white mt-1.5">{preset.model}</h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</p>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/60">
                        <span className="text-cyan-300 font-mono">Şin: {preset.tyreType}</span>
                        <span className="text-slate-400">Protektor: {preset.treadDepthMm} mm</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fines evaluation breakdown */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Seçilmiş Avtomobil: {selectedVehicle.plateNumber} - {selectedVehicle.model}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Tətbiq olunan sürət: {vehicleSpeedKmh} km/s | Yol tələbi: {advisorySpeedLimit} km/s
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={interferesWithPlow}
                      onChange={(e) => setInterferesWithPlow(e.target.checked)}
                      className="w-4 h-4 rounded accent-cyan-400"
                    />
                    AAYDA Duzsəpən/Qartəmizləyən karvanına mane olma
                  </label>
                </div>

                {sanctionsEvaluation.violations.length === 0 ? (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Mövcud hava və yol şəraitində heç bir inzibati qayda pozuntusu aşkarlanmadı. Şinlər və sürət rejimi tələblərə tam uyğundur.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sanctionsEvaluation.violations.map((v, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-rose-300">{v.article}</span>
                          <p className="text-slate-300 mt-0.5">{v.descriptionAz}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-white text-sm">
                            {convertRwisCurrency(v.fineAzn, currency)} {RWIS_CURRENCY_SYMBOLS[currency]}
                          </span>
                          {v.demeritPoints > 0 && (
                            <span className="block text-[11px] text-rose-400 font-semibold">
                              +{v.demeritPoints} Cərimə Balı
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between mt-3 text-xs">
                      <div>
                        <span className="text-slate-400">Ümumi Cərimə Məbləği:</span>
                        <span className="font-mono font-bold text-white text-sm ml-2">
                          {convertRwisCurrency(sanctionsEvaluation.totalFineAzn, currency)} {RWIS_CURRENCY_SYMBOLS[currency]}
                        </span>
                        {sanctionsEvaluation.totalDemeritPoints > 0 && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                            {sanctionsEvaluation.totalDemeritPoints} Bal
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-semibold">
                          30 gün ərzində 50% Güzəştlə (İXM Maddə 38):
                        </span>
                        <span className="font-mono font-bold text-emerald-300 text-base ml-2">
                          {convertRwisCurrency(sanctionsEvaluation.discountedFineAzn, currency)} {RWIS_CURRENCY_SYMBOLS[currency]}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    RWIS Stansiyası və FAST Çiləmə Texniki Standartları
                  </h3>
                  <p className="text-xs text-slate-400">
                    AZS 410, AZS 342, EN 15518-1/2/3/4 və WMO No. 8 beynəlxalq standartlarına uyğunluq tələbləri
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium hover:bg-slate-700 transition"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Score bar */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-bold text-cyan-300 text-lg">
                    {checklistScore}%
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Standartlara Uyğunluq Dərəcəsi</h4>
                    <p className="text-xs text-slate-400">
                      {checklistScore >= 80
                        ? 'Sertifikatlaşdırılmışdır: Qış mövsümü üçün tam hazırdır'
                        : 'Diqqət: Məcburi texniki bəndlər tamamlanmamışdır'}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    checklistScore >= 80
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {checklistScore >= 80 ? 'AZS 410 TƏSDİQLƏNDİ' : 'DEFİSİTLƏR VAR'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_TECHNICAL_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-800/80 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition ${
                          isChecked
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-cyan-300 border border-cyan-500/20">
                            {item.standardCode}
                          </span>
                          {item.mandatory && (
                            <span className="text-[10px] text-rose-400 font-semibold uppercase">Məcburi</span>
                          )}
                        </div>
                        <h5 className="text-xs font-semibold text-white mt-1">{item.titleAz}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.descriptionAz}</p>
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
                  <h3 className="text-base font-semibold text-white">
                    Qara Buz & Magistral Qış Hərəkət Təhlükəsizliyi İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Azərbaycan Respublikasının "Yol hərəkəti haqqında" Qanunu və qış istismarı normativləri üzrə 10 sual
                  </p>
                </div>
                {isExamSubmitted && (
                  <button
                    onClick={handleExamReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> İmtahanı Yenidən Başla
                  </button>
                )}
              </div>

              {isExamSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    examScore >= 8
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold font-mono">
                      {examScore} / {MOCK_THEORETICAL_EXAM.length}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">
                        {examScore >= 8
                          ? 'Təbrik edirik! İmtahanı müvəffəqiyyətlə keçdiniz.'
                          : 'Təəssüf ki, keçid balı toplanmadı (Minimum 8/10).'}
                      </h4>
                      <p className="text-xs opacity-80">
                        {examScore >= 8
                          ? 'Qış mövsümündə magistral yollarda təhlükəsiz hərəkət qaydalarına tam bələdsiniz.'
                          : 'Qanunvericilik bəndlərini və izahları nəzərdən keçirərək yenidən cəhd edin.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-black/40">
                    {examScore >= 8 ? 'MƏQBUL' : 'QEYRİ-MƏQBUL'}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_THEORETICAL_EXAM.map((q) => {
                  const selectedOpt = examAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                          #{q.id}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-white">{q.questionAz}</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.optionsAz.map((opt, idx) => {
                          const isOptionSelected = selectedOpt === idx;
                          let btnStyle = 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300';

                          if (isExamSubmitted) {
                            if (idx === q.correctAnswer) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-semibold';
                          }

                          return (
                            <button
                              key={idx}
                              disabled={isExamSubmitted}
                              onClick={() => handleExamAnswer(q.id, idx)}
                              className={`p-2.5 rounded-lg border text-left text-xs transition ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                          <div className="text-cyan-300 font-semibold">Hüquqi Əsas & İzah:</div>
                          <p className="text-slate-300">{q.explanationAz}</p>
                          <div className="text-slate-500 font-mono text-[11px]">{q.legalCitation}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isExamSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleExamSubmit}
                    disabled={Object.keys(examAnswers).length === 0}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-cyan-500/20"
                  >
                    Cavabları Təsdiqlə və Nəticəni Gör →
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
                  <h3 className="text-base font-semibold text-white">
                    AAYDA & BDYP Rəsmi RWIS Qış Hərəkət Buraxılış Sertifikatı
                  </h3>
                  <p className="text-xs text-slate-400">
                    SİMA rəqəmsal imzalı, QR yoxlama kodlu elektron təhlükəsizlik şəhadətnaməsi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs font-medium transition"
                  >
                    <Printer className="w-4 h-4 text-cyan-400" /> Çap Et
                  </button>
                  <button
                    onClick={() =>
                      handleCopy(currentCertificate.certificateId, currentCertificate.certificateId)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-medium transition"
                  >
                    {copiedCode === currentCertificate.certificateId ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" /> Kopyalandı!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Kodu Kopyala
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Printable Official Certificate Document */}
              <div
                id="rwis-certificate-view"
                className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 shadow-2xl space-y-6 text-white font-sans"
              >
                {/* Certificate Heading */}
                <div className="text-center pb-4 border-b border-cyan-500/30">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
                    <Snowflake className="w-3.5 h-3.5" /> AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-wide">
                    MAGİSTRAL YOL-HAVA MƏLUMAT (RWIS) VƏ QARA BUZ TƏHLÜKƏSİZLİK SERTİFİKATI
                  </h2>
                  <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 mt-2">
                    <span>№: {currentCertificate.certificateId}</span>
                    <span>•</span>
                    <span>Tarix: {new Date(currentCertificate.issuedAt).toLocaleDateString('az-AZ')}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">STATUS: {currentCertificate.status}</span>
                  </div>
                </div>

                {/* Details Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                      Stansiya və Magistral Məlumatları
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">RWIS Stansiyası:</span>
                      <span className="font-semibold text-white">{currentCertificate.stationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Magistral / Piket:</span>
                      <span className="font-mono text-cyan-300">{currentCertificate.picketKm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dəhliz:</span>
                      <span className="text-slate-300">{currentCertificate.corridor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">FAST Çiləmə Statusu:</span>
                      <span className="font-semibold text-cyan-400">
                        {currentCertificate.fastSystemTriggered ? 'Aktiv Püskürdüldü' : 'Standby'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                      Nəqliyyat Vasitəsi & Şin Parametrləri
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                        {currentCertificate.vehiclePlate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Model:</span>
                      <span className="text-white">{currentCertificate.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Şin Qrupu:</span>
                      <span className="font-mono text-amber-300">{currentCertificate.tyreType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Təhlükəsiz Sürət Həddi:</span>
                      <span className="font-bold text-emerald-400">{currentCertificate.advisorySpeedLimitKmh} km/s</span>
                    </div>
                  </div>
                </div>

                {/* Physics & Telemetry Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Səth Temperaturu</span>
                    <span className="font-mono font-bold text-cyan-300 text-sm block mt-1">
                      {currentCertificate.surfaceTempC}°C
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Şeh Nöqtəsi</span>
                    <span className="font-mono font-bold text-cyan-300 text-sm block mt-1">
                      {currentCertificate.dewPointC}°C
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">İlişmə Əmsalı (μ)</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm block mt-1">
                      {currentCertificate.frictionMu.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Dayanma Məsafəsi</span>
                    <span className="font-mono font-bold text-amber-300 text-sm block mt-1">
                      {currentCertificate.stoppingDistanceMeters} m
                    </span>
                  </div>
                </div>

                {/* SİMA Signatures & Hash */}
                <div className="pt-4 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
                  <div>
                    <div>SİMA Rəqəmsal İmza UID: {currentCertificate.simaDigitalUid}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      SHA-256: {currentCertificate.sha256Hash}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-slate-300 font-bold">PIN: {currentCertificate.verificationPin}</div>
                      <div className="text-[10px] text-emerald-400">AAYDA / BDYP QR VERIFIED</div>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                      <div className="w-full h-full border border-slate-950 flex flex-wrap gap-0.5 p-0.5">
                        <div className="w-3 h-3 bg-slate-950" />
                        <div className="w-2 h-2 bg-slate-950" />
                        <div className="w-2 h-2 bg-slate-950" />
                        <div className="w-3 h-3 bg-slate-950" />
                      </div>
                    </div>
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
                  <h3 className="text-base font-semibold text-white">
                    Vahid Magistral Qış Sertifikatları Dövlət Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, ETSN və BDYP tərəfindən verilmiş aktiv RWIS təhlükəsizlik talonları
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Reyestrdə nömrə və ya kod axtar..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Sertifikat ID</th>
                      <th className="p-3">Nömrə / Avtomobil</th>
                      <th className="p-3">Stansiya</th>
                      <th className="p-3">Vəziyyət</th>
                      <th className="p-3">İlişmə (μ)</th>
                      <th className="p-3">Sürət</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredRegistry.map((cert) => (
                      <tr key={cert.certificateId} className="hover:bg-slate-800/50 transition">
                        <td className="p-3 font-mono text-cyan-300 font-semibold">
                          {cert.certificateId}
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-white px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                            {cert.vehiclePlate}
                          </span>
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            {cert.vehicleModel}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-white">{cert.stationCode}</span>
                          <span className="block text-[10px] text-slate-400">{cert.picketKm}</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cert.surfaceCondition === 'BLACK_ICE'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {cert.surfaceCondition}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-cyan-300">
                          {cert.frictionMu.toFixed(2)}
                        </td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">
                          {cert.advisorySpeedLimitKmh} km/s
                        </td>
                        <td className="p-3">
                          <span className="text-emerald-400 font-semibold">{cert.status}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setCurrentCertificate(cert);
                              setActiveTab('certificate');
                            }}
                            className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium transition text-[11px]"
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AAYDA / ETSN / BDYP Vahid İntellektual Yol Nəqliyyat İdarəetmə Mərkəzi (RWIS-SAFE)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>AZS 410 / EN 15518 / WMO No. 8</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
