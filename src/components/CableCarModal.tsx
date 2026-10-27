import React, { useState, useMemo } from 'react';
import {
  CableCar,
  Mountain,
  Wind,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  Copy,
  Printer,
  Compass,
  ArrowUpDown,
  Activity,
  Info,
  Layers,
  Award,
  Users,
  Ticket,
  Zap,
  Thermometer,
  CloudRain,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  RopewayInstallation,
  AnemometerTelemetry,
  MagneticRopeTelemetry,
  FareCalculationResult,
  SafetyAuditResult,
  ExamEvaluationResult,
  CableCarCertificate,
  PassengerCategory,
  PassType,
  Currency,
  evaluateWindTelemetry,
  evaluateCableIntegrity,
  calculateFareTariff,
  evaluateSafetyChecklist,
  evaluateTheoreticalExam,
  generateCableCarCertificate,
} from '../utils/cableCarCompliance';
import {
  MOCK_ROPEWAY_INSTALLATIONS,
  MOCK_VISITOR_PRESETS,
  MOCK_SAFETY_CHECKLIST,
  MOCK_THEORETICAL_EXAM,
  MOCK_ROPEWAY_CERTIFICATES,
  VisitorPreset,
} from '../data/mockCableCarData';

interface CableCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInstallationId?: string;
}

type ActiveTab = 'radar' | 'anemometer' | 'cable_mrt' | 'fare_calc' | 'checklist' | 'exam' | 'certificate';

export const CableCarModal: React.FC<CableCarModalProps> = ({
  isOpen,
  onClose,
  initialInstallationId,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar');
  const [selectedInstallationId, setSelectedInstallationId] = useState<string>(
    initialInstallationId || MOCK_ROPEWAY_INSTALLATIONS[0].id
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedResortFilter, setSelectedResortFilter] = useState<string>('all');

  // Anemometer interactive state
  const [windSpeedMs, setWindSpeedMs] = useState<number>(7.5);
  const [windGustMs, setWindGustMs] = useState<number>(10.2);
  const [crossWindAngleDeg, setCrossWindAngleDeg] = useState<number>(45);
  const [ambientTempC, setAmbientTempC] = useState<number>(4);
  const [iceAccretionMm, setIceAccretionMm] = useState<number>(0);
  const [lightningDistanceKm, setLightningDistanceKm] = useState<number>(25);

  // Cable MRT state
  const [measuredDiameterMm, setMeasuredDiameterMm] = useState<number>(51.4);
  const [brokenOuterWires6d, setBrokenOuterWires6d] = useState<number>(1);
  const [brokenOuterWires30d, setBrokenOuterWires30d] = useState<number>(3);
  const [lossMetallicAreaPct, setLossMetallicAreaPct] = useState<number>(2.4);
  const [tensionHydraulicBar, setTensionHydraulicBar] = useState<number>(165);
  const [bullwheelLinerWearMm, setBullwheelLinerWearMm] = useState<number>(5.5);
  const [emergencyTrackBrakeMs, setEmergencyTrackBrakeMs] = useState<number>(310);

  // Fare calculator state
  const [selectedPassType, setSelectedPassType] = useState<PassType>('single_ride');
  const [selectedPassengerCategory, setSelectedPassengerCategory] = useState<PassengerCategory>('adult');
  const [hasGearAddon, setHasGearAddon] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('AZN');

  // Checklist state
  const [checklistItems, setChecklistItems] = useState(MOCK_SAFETY_CHECKLIST);

  // Theoretical exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [certificates, setCertificates] = useState<CableCarCertificate[]>(MOCK_ROPEWAY_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<CableCarCertificate>(MOCK_ROPEWAY_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Selected installation object
  const currentInstallation = useMemo(() => {
    return (
      MOCK_ROPEWAY_INSTALLATIONS.find((inst) => inst.id === selectedInstallationId) ||
      MOCK_ROPEWAY_INSTALLATIONS[0]
    );
  }, [selectedInstallationId]);

  // Telemetry evaluations
  const windTelemetry: AnemometerTelemetry = useMemo(() => {
    return evaluateWindTelemetry(
      windSpeedMs,
      windGustMs,
      crossWindAngleDeg,
      ambientTempC,
      iceAccretionMm,
      lightningDistanceKm
    );
  }, [windSpeedMs, windGustMs, crossWindAngleDeg, ambientTempC, iceAccretionMm, lightningDistanceKm]);

  const cableTelemetry: MagneticRopeTelemetry = useMemo(() => {
    return evaluateCableIntegrity(
      currentInstallation.cableDiameterMm,
      measuredDiameterMm,
      brokenOuterWires6d,
      brokenOuterWires30d,
      lossMetallicAreaPct,
      tensionHydraulicBar,
      bullwheelLinerWearMm,
      emergencyTrackBrakeMs
    );
  }, [
    currentInstallation.cableDiameterMm,
    measuredDiameterMm,
    brokenOuterWires6d,
    brokenOuterWires30d,
    lossMetallicAreaPct,
    tensionHydraulicBar,
    bullwheelLinerWearMm,
    emergencyTrackBrakeMs,
  ]);

  const fareResult: FareCalculationResult = useMemo(() => {
    return calculateFareTariff(
      currentInstallation.baseSingleFareAzn,
      selectedPassType,
      selectedPassengerCategory,
      hasGearAddon,
      selectedCurrency
    );
  }, [currentInstallation.baseSingleFareAzn, selectedPassType, selectedPassengerCategory, hasGearAddon, selectedCurrency]);

  const auditResult: SafetyAuditResult = useMemo(() => {
    return evaluateSafetyChecklist(checklistItems);
  }, [checklistItems]);

  const examResult: ExamEvaluationResult = useMemo(() => {
    return evaluateTheoreticalExam(MOCK_THEORETICAL_EXAM, examAnswers);
  }, [examAnswers]);

  // Filtered installations
  const filteredInstallations = useMemo(() => {
    return MOCK_ROPEWAY_INSTALLATIONS.filter((item) => {
      const matchesSearch =
        item.nameAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.resortNameAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.districtAz.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesResort =
        selectedResortFilter === 'all' ||
        (selectedResortFilter === 'baku' && item.districtAz.includes('Bakı')) ||
        (selectedResortFilter === 'shahdag' && item.resortNameAz.includes('Şahdağ')) ||
        (selectedResortFilter === 'tufandag' && item.resortNameAz.includes('Tufandağ')) ||
        (selectedResortFilter === 'nakhchivan' && item.districtAz.includes('Naxçıvan'));

      return matchesSearch && matchesResort;
    });
  }, [searchQuery, selectedResortFilter]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: VisitorPreset) => {
    setSelectedInstallationId(preset.preferredInstallationId);
    setSelectedPassengerCategory(preset.category);
    setSelectedPassType(preset.passType);
    setHasGearAddon(preset.hasGear);
    setActiveTab('fare_calc');
  };

  const handleToggleChecklist = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, compliant: !item.compliant } : item))
    );
  };

  const handleSelectAllChecklist = () => {
    setChecklistItems((prev) => prev.map((item) => ({ ...item, compliant: true })));
  };

  const handleSelectExamAnswer = (questionId: string, optionIndex: number) => {
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGenerateCertificate = () => {
    const newCert = generateCableCarCertificate(currentInstallation, cableTelemetry, auditResult);
    setActiveCertificate(newCert);
    setCertificates((prev) => [newCert, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      data-testid="cablecar-modal-backdrop"
    >
      <div className="relative w-full max-w-6xl my-6 bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[92vh] overflow-hidden text-slate-100 font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-inner">
              <CableCar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  DTA • AYNA • FHN
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  EN 1709 / EN 12927
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Kanat Yolları & Funikulyor Təhlükəsizlik Portalı
              </h2>
              <p className="text-xs text-slate-400">
                Dövlət Turizm Agentliyi və FHN Dağ-Mədən İdarəsi Sərnişin Kanat Qurğuları Nəzarət Sistemi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="cablecar-modal-close-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-800/50 border-b border-slate-700/60 overflow-x-auto text-xs font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Xətlər Radarı</span>
          </button>

          <button
            onClick={() => setActiveTab('anemometer')}
            data-testid="tab-anemometer"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'anemometer'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Külək & Anemometr</span>
            {windTelemetry.status === 'critical_evacuation' && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cable_mrt')}
            data-testid="tab-cable-mrt"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'cable_mrt'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Kanat MRT Defektoskopiyası</span>
          </button>

          <button
            onClick={() => setActiveTab('fare_calc')}
            data-testid="tab-fare-calc"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'fare_calc'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Bilet & Ski-Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>FHN Təhlükəsizlik Auditi</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'exam'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Texniki İmtahan</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>DTA-CAB Sertifikatı</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6" data-testid="cablecar-radar-tab-content">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Xətt, kurort və ya rayon axtar..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                  {[
                    { key: 'all', label: 'Bütün Qurğular' },
                    { key: 'baku', label: 'Bakı' },
                    { key: 'shahdag', label: 'Şahdağ' },
                    { key: 'tufandag', label: 'Tufandağ' },
                    { key: 'nakhchivan', label: 'Naxçıvan' },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setSelectedResortFilter(filter.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        selectedResortFilter === filter.key
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Installations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInstallations.map((item) => {
                  const isSelected = item.id === selectedInstallationId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedInstallationId(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-950/50'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600">
                            {item.fhnRegistryCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              item.status === 'operational'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {item.status === 'operational' ? 'Fəal İstismar' : 'Gözləmə'}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-sm mb-1">{item.nameAz}</h3>
                        <p className="text-xs text-cyan-400 font-medium mb-3 flex items-center gap-1.5">
                          <Mountain className="w-3.5 h-3.5" />
                          {item.resortNameAz}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mb-3">
                          <div>
                            <span className="text-slate-400 block">Qurğu Növü:</span>
                            <span className="font-semibold text-slate-200">
                              {item.systemType === 'funicular'
                                ? 'Relsli Funikulyor'
                                : item.systemType === 'gondola_detachable'
                                ? 'Ayrılan Qondola (MGD)'
                                : 'Kreslolu Xizək Lifti'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Hündürlük Fərqi:</span>
                            <span className="font-semibold text-emerald-400">
                              +{item.verticalRiseM} m ({item.elevationBottomM}m - {item.elevationTopM}m)
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Uzunluq:</span>
                            <span className="font-semibold text-slate-200">{item.slopeLengthM} metr</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Buraxılış Qabiliyyəti:</span>
                            <span className="font-semibold text-cyan-300">{item.capacityPphd} nəfər/saat</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/60">
                        <span className="text-slate-400">{item.manufacturer}</span>
                        <span className="font-bold text-emerald-400">
                          {item.baseSingleFareAzn.toFixed(2)} AZN-dən
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tourist Presets */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Sürətli Ziyarətçi / Turist Preseti Seçimi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {MOCK_VISITOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-left transition-all group"
                    >
                      <div className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200 mb-1 flex items-center justify-between">
                        <span>{preset.nameAz}</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{preset.notesAz}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANEMOMETER TELEMETRY */}
          {activeTab === 'anemometer' && (
            <div className="space-y-6" data-testid="cablecar-anemometer-tab-content">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  windTelemetry.status === 'safe'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : windTelemetry.status === 'caution'
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                    : 'bg-red-950/30 border-red-500/50 text-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {windTelemetry.status === 'safe' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                  {windTelemetry.status === 'caution' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
                  {windTelemetry.status === 'critical_evacuation' && (
                    <XCircle className="w-6 h-6 text-red-400 animate-bounce" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">
                      {windTelemetry.status === 'safe'
                        ? 'TƏHLÜKƏSİZ KÜLƏK REJİMİ (NORMAL İSTİSMAR)'
                        : windTelemetry.status === 'caution'
                        ? 'XƏBƏRDARLIQ: SÜRƏT MƏHDUDİYYƏTİ TƏTBİQ OLUNUR (3.0 m/s)'
                        : 'KRİTİK DAYANMA VƏ TƏXİSAT REJİMİ (XƏTTİN EVAKUASİYASI)'}
                    </h3>
                    <p className="text-xs opacity-90">{windTelemetry.recommendedActionAz}</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] font-mono block text-slate-400">Normativ Standart:</span>
                  <span className="text-xs font-semibold">{windTelemetry.regulatoryStandardCitation}</span>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    Külək Sürəti:
                  </div>
                  <div className="text-xl font-bold text-white">
                    {windTelemetry.windSpeedMs} m/s{' '}
                    <span className="text-xs font-normal text-slate-400">({windTelemetry.windSpeedKmh} km/h)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Ani Həmlə (Gust):
                  </div>
                  <div className="text-xl font-bold text-amber-400">
                    {windTelemetry.windGustMs} m/s
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                    Qondola Yellənməsi:
                  </div>
                  <div className="text-xl font-bold text-purple-300">
                    ±{windTelemetry.lateralCabinSwayDeg}°
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-slate-400 text-xs mb-1 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    İcazə Verilən Sürət:
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    {windTelemetry.maxOperationalSpeedLimitMs} m/s
                  </div>
                </div>
              </div>

              {/* Sliders Control Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Orta Külək Sürəti:</span>
                      <span className="font-mono font-bold text-cyan-400">{windSpeedMs} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="0.5"
                      value={windSpeedMs}
                      onChange={(e) => setWindSpeedMs(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0 m/s (Sakit)</span>
                      <span>12 m/s (Hədd)</span>
                      <span>30 m/s (Fırtına)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Küləyin Ani Həmləsi (Gust):</span>
                      <span className="font-mono font-bold text-amber-400">{windGustMs} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="35"
                      step="0.5"
                      value={windGustMs}
                      onChange={(e) => setWindGustMs(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0 m/s</span>
                      <span>18 m/s (FHN Dayanma Həddi)</span>
                      <span>35 m/s</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Çarpaz Külək Bucağı (Cross-wind):</span>
                      <span className="font-mono font-bold text-purple-400">{crossWindAngleDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="5"
                      value={crossWindAngleDeg}
                      onChange={(e) => setCrossWindAngleDeg(parseInt(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Ətraf Mühit Temperaturu:</span>
                      <span className="font-mono font-bold text-blue-400">{ambientTempC}°C</span>
                    </div>
                    <input
                      type="range"
                      min="-25"
                      max="35"
                      step="1"
                      value={ambientTempC}
                      onChange={(e) => setAmbientTempC(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">Kanatda Buzlaşma Qatı (Ice Accretion):</span>
                      <span className="font-mono font-bold text-cyan-300">{iceAccretionMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={iceAccretionMm}
                      onChange={(e) => setIceAccretionMm(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0 mm</span>
                      <span>5 mm (Kritik yük)</span>
                      <span>15 mm</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">İldırım Boşalması Məsafəsi:</span>
                      <span className="font-mono font-bold text-yellow-400">{lightningDistanceKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      step="1"
                      value={lightningDistanceKm}
                      onChange={(e) => setLightningDistanceKm(parseInt(e.target.value))}
                      className="w-full accent-yellow-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>1 km (Təcili dayanma)</span>
                      <span>15 km (Xəbərdarlıq)</span>
                      <span>40 km (Təhlükəsiz)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CABLE MRT DEFECTOSCOPY */}
          {activeTab === 'cable_mrt' && (
            <div className="space-y-6" data-testid="cablecar-mrt-tab-content">
              {/* Integrity Status */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  cableTelemetry.status === 'certified'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : cableTelemetry.status === 'maintenance_due'
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                    : 'bg-red-950/30 border-red-500/50 text-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">
                      {cableTelemetry.status === 'certified'
                        ? 'POLAD KANAT İSTİSMARA TAM YARARLIDIR'
                        : cableTelemetry.status === 'maintenance_due'
                        ? 'PLANLI TEXNİKİ QULLUQ VƏ MRT NƏZARƏTİ TƏLƏB OLUNUR'
                        : 'KANATIN DƏRHAL İSTİSMARDAN ÇIXARILMASI (DISCARD) TƏLƏB OLUNUR'}
                    </h3>
                    <p className="text-xs opacity-90">
                      Təhlükəsizlik Əmsalı: k = {cableTelemetry.safetyFactor} (Tələb: k ≥ 3.5) •{' '}
                      {cableTelemetry.isoStandardCitation}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold block">
                    Kəsik İtkisi: {cableTelemetry.lossMetallicAreaPct}%
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Diametr Azalması: -{cableTelemetry.diameterReductionPct}%
                  </span>
                </div>
              </div>

              {/* Cable Diagnostics Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <h4 className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Xarici Diametr & LMA İtkisi
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Nominal Diametr:</span>
                        <span className="font-bold text-white">{currentInstallation.cableDiameterMm} mm</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Ölçülən Diametr:</span>
                        <span className="font-bold text-cyan-400">{measuredDiameterMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min={currentInstallation.cableDiameterMm * 0.85}
                        max={currentInstallation.cableDiameterMm}
                        step="0.1"
                        value={measuredDiameterMm}
                        onChange={(e) => setMeasuredDiameterMm(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer mt-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Kəsik İtkisi (LMA):</span>
                        <span className="font-bold text-amber-400">{lossMetallicAreaPct}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        step="0.2"
                        value={lossMetallicAreaPct}
                        onChange={(e) => setLossMetallicAreaPct(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer mt-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                        <span>0%</span>
                        <span>8% (Xəbərdarlıq)</span>
                        <span>10% (Ləğv)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <h4 className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Qırıq Tellər (Broken Wires)
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">6d Addımında Qırıq Tellər:</span>
                        <span className="font-bold text-amber-300">{brokenOuterWires6d} ədəd</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={brokenOuterWires6d}
                        onChange={(e) => setBrokenOuterWires6d(parseInt(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer mt-1"
                      />
                      <span className="text-[10px] text-slate-500">Maksimum icazə: &lt;6 ədəd / 6d</span>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">30d Addımında Qırıq Tellər:</span>
                        <span className="font-bold text-amber-300">{brokenOuterWires30d} ədəd</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={brokenOuterWires30d}
                        onChange={(e) => setBrokenOuterWires30d(parseInt(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer mt-1"
                      />
                      <span className="text-[10px] text-slate-500">Maksimum icazə: &lt;12 ədəd / 30d</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <h4 className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    Hidravlika & Əyləc Reaksiyası
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Gərmə Təzyiqi:</span>
                        <span className="font-bold text-emerald-400">{tensionHydraulicBar} bar</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="220"
                        step="5"
                        value={tensionHydraulicBar}
                        onChange={(e) => setTensionHydraulicBar(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer mt-1"
                      />
                      <span className="text-[10px] text-slate-500">Nominal zolaq: 140 – 180 bar</span>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Qəza Əyləc Müddəti:</span>
                        <span className="font-bold text-purple-300">{emergencyTrackBrakeMs} ms</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="600"
                        step="10"
                        value={emergencyTrackBrakeMs}
                        onChange={(e) => setEmergencyTrackBrakeMs(parseInt(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer mt-1"
                      />
                      <span className="text-[10px] text-slate-500">Statutory hədd: &le; 400 ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FARE & SKI-PASS CALCULATOR */}
          {activeTab === 'fare_calc' && (
            <div className="space-y-6" data-testid="cablecar-fare-tab-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Controls */}
                <div className="space-y-4 bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-cyan-400" />
                    Bilet & Keçid Parametrləri
                  </h4>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Seçilmiş Kanat Qurğusu:</label>
                    <select
                      value={selectedInstallationId}
                      onChange={(e) => setSelectedInstallationId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      {MOCK_ROPEWAY_INSTALLATIONS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nameAz} ({item.resortNameAz})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Bilet / Keçid Növü:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'single_ride', label: 'Bir Tərəfli Gediş' },
                        { key: 'return_trip', label: 'Gediş-Dönüş (Round-Trip)' },
                        { key: 'day_ski_pass', label: '1 Günlük Ski-Pass' },
                        { key: 'three_day_pass', label: '3 Günlük Ski-Pass' },
                        { key: 'season_pass', label: 'Mövsümi Abunəlik' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedPassType(item.key as PassType)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            selectedPassType === item.key
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-semibold'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Sərnişin Kateqoriyası:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'adult', label: 'Böyük (Standart)' },
                        { key: 'child_student', label: 'Uşaq / Tələbə (-50%)' },
                        { key: 'senior', label: 'Pensiyaçı (-40%)' },
                        { key: 'prm_veteran', label: 'Qazi / Əlil (Ödənişsiz)' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedPassengerCategory(item.key as PassengerCategory)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            selectedPassengerCategory === item.key
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-semibold'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                    <div>
                      <span className="text-xs text-slate-300 block font-medium">Dağ Velosipedi / Paraplan:</span>
                      <span className="text-[11px] text-slate-500">+5.00 AZN avadanlıq daşıma rüsumu</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasGearAddon}
                      onChange={(e) => setHasGearAddon(e.target.checked)}
                      className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Calculation Summary Card */}
                <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                      <div>
                        <span className="text-xs text-slate-400 block">Hesablanan Tarif Cədvəli</span>
                        <h4 className="font-bold text-white text-base">{currentInstallation.nameAz}</h4>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                        {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                          <button
                            key={curr}
                            onClick={() => setSelectedCurrency(curr)}
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              selectedCurrency === curr
                                ? 'bg-cyan-500 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Baza Qiyməti:</span>
                        <span className="font-mono">{fareResult.basePriceAzn.toFixed(2)} AZN</span>
                      </div>

                      {fareResult.discountPercentage > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Dövlət / Sosial Güzəşti ({fareResult.discountPercentage}%):</span>
                          <span className="font-mono">-{fareResult.discountAmountAzn.toFixed(2)} AZN</span>
                        </div>
                      )}

                      {fareResult.gearSurchargeAzn > 0 && (
                        <div className="flex justify-between text-cyan-300">
                          <span>Avadanlıq Daşıma Rüsumu:</span>
                          <span className="font-mono">+{fareResult.gearSurchargeAzn.toFixed(2)} AZN</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-400">
                        <span>Daxil Olan ƏDV (18%):</span>
                        <span className="font-mono">{fareResult.vat18Azn.toFixed(2)} AZN</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 mt-2">
                        {fareResult.notesAz}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-700">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-slate-300">Yekun Ödəniş Məbləği:</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-400">
                          {selectedCurrency === 'AZN'
                            ? `${fareResult.finalTotalAzn.toFixed(2)} ₼`
                            : selectedCurrency === 'USD'
                            ? `$${fareResult.finalTotalUsd.toFixed(2)}`
                            : `€${fareResult.finalTotalEur.toFixed(2)}`}
                        </span>
                        {selectedCurrency !== 'AZN' && (
                          <span className="text-xs text-slate-400 block font-mono">
                            ({fareResult.finalTotalAzn.toFixed(2)} AZN)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SAFETY CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="cablecar-checklist-tab-content">
              {/* Header with score and select all */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    FHN və EN 1709 İllik Dövlət Təhlükəsizlik Auditi (10 Bənd)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Uyğunluq Reytinqi: {auditResult.compliantCount} / {auditResult.totalItems} ({auditResult.scorePercentage}%)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                  <button
                    onClick={handleGenerateCertificate}
                    disabled={auditResult.overallStatus === 'failed'}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                      auditResult.overallStatus !== 'failed'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    FHN Sertifikatı Yarat
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      item.compliant
                        ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                        : item.critical
                        ? 'bg-red-950/20 border-red-500/40'
                        : 'bg-amber-950/20 border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.compliant}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">{item.titleAz}</h4>
                          {item.critical && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                              KRİTİK
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.descriptionAz}</p>
                        <span className="text-[10px] font-mono text-cyan-400/80 block mt-1">
                          Standart: {item.regulatoryStandard}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {item.compliant ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Təsdiqlənib
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Çatışmazlıq
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: THEORETICAL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="cablecar-exam-tab-content">
              {/* Exam Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    FHN və Dağ-Mədən İdarəsi Operator Attestasiyası İmtahanı (10 Sual)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Minimum Keçid Balı: 8 / 10 (80%) • Cavablandırıldı: {Object.keys(examAnswers).length} / 10
                  </p>
                </div>

                <button
                  onClick={() => setExamSubmitted(true)}
                  disabled={Object.keys(examAnswers).length < 10}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    Object.keys(examAnswers).length === 10
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  İmtahanı Tamamla və Yoxla
                </button>
              </div>

              {/* Evaluation Result Banner */}
              {examSubmitted && (
                <div
                  className={`p-4 rounded-xl border ${
                    examResult.passed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/30 border-red-500/50 text-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-base flex items-center gap-2">
                      {examResult.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {examResult.passed ? 'ATTESTAT TƏSDİQLƏNDİ' : 'İMTAHAN UĞURSUZ OLDU'}
                    </h4>
                    <span className="text-sm font-mono font-bold">
                      {examResult.correctAnswersCount} / {examResult.totalQuestions} ({examResult.scorePercentage}%)
                    </span>
                  </div>
                  <p className="text-xs opacity-90">{examResult.certificationStatusAz}</p>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_THEORETICAL_EXAM.map((q, idx) => {
                  const selectedOpt = examAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctOptionIndex;

                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-xs font-bold text-cyan-400">Sual № {idx + 1}:</span>
                        <span className="text-[10px] font-mono text-slate-400">{q.legalCitation}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white mb-3">{q.questionAz}</h4>

                      <div className="space-y-2">
                        {q.optionsAz.map((opt, optIdx) => {
                          let optClass = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (selectedOpt === optIdx) {
                            optClass = 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold';
                          }

                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (selectedOpt === optIdx && !isCorrect) {
                              optClass = 'bg-red-500/20 border-red-500 text-red-300';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectExamAnswer(q.id, optIdx)}
                              className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optClass}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && optIdx === q.correctOptionIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                          <span className="font-semibold text-cyan-400">İzah: </span>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="cablecar-certificate-tab-content">
              {/* Certificate Display */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/95 border-2 border-cyan-500/50 shadow-xl relative overflow-hidden">
                {/* Certificate Watermark / Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-cyan-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                      <CableCar className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block">
                        AZƏRBAYCAN RESPUBLİKASI DÖVLƏT TURİZM AGENTLİYİ & FHN
                      </span>
                      <h3 className="font-black text-white text-base sm:text-lg">
                        SƏRNİŞİN KANAT YOLU İSTİSMAR ŞƏHADƏTNAMƏSİ
                      </h3>
                      <p className="text-xs text-slate-400">
                        Qeydiyyat Kodu: {activeCertificate.fhnRegistryCode} • Sertifikat №:{' '}
                        {activeCertificate.certificateNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(activeCertificate.certificateNumber)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
                      title="Sertifikat nömrəsini kopyala"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{copiedCode ? 'Kopyalandı!' : 'Kopyala'}</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                      title="Çap et"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap et</span>
                    </button>
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 text-xs text-slate-300">
                  <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Qurğunun Adı:</span>
                      <span className="font-bold text-white text-right">{activeCertificate.installationNameAz}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Turizm Mərkəzi:</span>
                      <span className="font-bold text-cyan-300">{activeCertificate.resortNameAz}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sistem Tipi:</span>
                      <span className="font-semibold text-slate-200 uppercase">
                        {activeCertificate.systemType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kanat Vəziyyəti:</span>
                      <span className="font-bold text-emerald-400 uppercase">
                        {activeCertificate.cableIntegrityStatus} (ISO 4309)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verilmə Tarixi:</span>
                      <span className="font-bold text-white">{activeCertificate.issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Etibarlılıq Müddəti:</span>
                      <span className="font-bold text-emerald-400">{activeCertificate.validUntil} (1 il)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Külək Kəsilmə Həddi:</span>
                      <span className="font-bold text-amber-400">{activeCertificate.anemometerCutoffSpeedMs} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Baş Müfəttiş:</span>
                      <span className="font-semibold text-slate-200">{activeCertificate.leadInspectorName}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures & Security Footer */}
                <div className="pt-4 border-t border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
                  <div>
                    <span className="block font-mono text-cyan-300 font-semibold">
                      SİMA Rəqəmsal İmza UID: {activeCertificate.simsSignatureUid}
                    </span>
                    <span className="block font-mono text-[10px] text-slate-500">
                      {activeCertificate.sha256SecurityHash}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      FHN DAĞ-MƏDƏN NƏZARƏTİ TƏSDİQLƏMİŞDİR
                    </span>
                  </div>
                </div>
              </div>

              {/* Public Registry Search */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Dövlət Kanat Yolları Şəhadətnamələr Reyestri ({certificates.length})
                </h4>
                <div className="space-y-2">
                  {certificates.map((cert) => (
                    <div
                      key={cert.certificateNumber}
                      onClick={() => setActiveCertificate(cert)}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                        activeCertificate.certificateNumber === cert.certificateNumber
                          ? 'bg-cyan-950/30 border-cyan-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-cyan-400 block">{cert.certificateNumber}</span>
                        <span className="text-[11px] text-slate-400">{cert.installationNameAz}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-semibold block">{cert.validUntil}-dək etibarlıdır</span>
                        <span className="text-[10px] text-slate-500 font-mono">{cert.fhnRegistryCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
