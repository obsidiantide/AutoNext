import React, { useState, useMemo } from 'react';
import {
  Activity,
  Gauge,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Award,
  Truck,
  Building,
  RefreshCw,
  ExternalLink,
  X,
  Sliders,
  Layers,
  Network,
  Clock,
  Sparkles,
  Check,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Thermometer,
  Car,
  Navigation,
  Eye,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  formatCurrency,
  CorridorId,
  WeatherCondition,
  IncidentSeverity,
  LevelOfService,
  DigitalTwinCertificate,
  STRATEGIC_CORRIDORS,
  WEATHER_CONDITIONS,
  INCIDENT_SEVERITY_LEVELS,
  LOS_DEFINITIONS,
  DIGITAL_TWIN_SAFETY_CHECKLIST,
  DIGITAL_TWIN_EXAM_QUESTIONS,
  calculateDynamicSpeedLimit,
  calculateTrafficFlowMetrics,
  evaluateDigitalTwinSafetyChecklist,
  evaluateDigitalTwinExam,
  issueDigitalTwinCertificate,
} from '../utils/digitalTwinItsCompliance';
import {
  CORRIDOR_SCENARIO_PRESETS,
  MOCK_CORRIDOR_CERTIFICATES,
  HighwayScenarioPreset,
} from '../data/mockDigitalTwinItsData';

interface DigitalTwinItsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type DigitalTwinTabId =
  | 'radar'
  | 'vsl-sim'
  | 'physics-flow'
  | 'weather-grip'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const DigitalTwinItsModal: React.FC<DigitalTwinItsModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<DigitalTwinTabId>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Selected corridor for simulation
  const [selectedCorridorId, setSelectedCorridorId] =
    useState<CorridorId>('CORRIDOR_BAKU_RING_ROAD');

  // Simulation Parameters
  const [densityK, setDensityK] = useState<number>(45); // veh/km/lane
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('DRY');
  const [surfaceTempCelsius, setSurfaceTempCelsius] = useState<number>(18);
  const [incidentSeverity, setIncidentSeverity] = useState<IncidentSeverity>('NONE');

  // Flow & Mix parameters
  const [truckPercent, setTruckPercent] = useState<number>(20);
  const [busPercent, setBusPercent] = useState<number>(8);

  // Radar search filter
  const [radarSearchQuery, setRadarSearchQuery] = useState<string>('');

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>([
    'ITS_CHK_01_V2X_RSU',
    'ITS_CHK_02_VMS_OPTICAL',
    'ITS_CHK_03_RWIS_WEATHER',
    'ITS_CHK_05_BDYP_RADAR_SYNC',
    'ITS_CHK_06_FIBER_BACKBONE',
    'ITS_CHK_07_BIM_LOD400',
    'ITS_CHK_08_SOS_TELEPHONY',
    'ITS_CHK_09_UPS_POWER',
  ]);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate generation state
  const [operatorOrg, setOperatorOrg] = useState<string>(
    'Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA) & AYNA Nəzarət İdarəsi'
  );
  const [operatorVoen, setOperatorVoen] = useState<string>('1402283941');
  const [generatedCertificate, setGeneratedCertificate] =
    useState<DigitalTwinCertificate | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Registry search filter
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');

  // Calculations
  const vslResult = useMemo(() => {
    return calculateDynamicSpeedLimit(
      selectedCorridorId,
      densityK,
      weatherCondition,
      incidentSeverity,
      surfaceTempCelsius
    );
  }, [selectedCorridorId, densityK, weatherCondition, incidentSeverity, surfaceTempCelsius]);

  const flowMetrics = useMemo(() => {
    return calculateTrafficFlowMetrics(
      selectedCorridorId,
      densityK,
      truckPercent,
      busPercent,
      incidentSeverity
    );
  }, [selectedCorridorId, densityK, truckPercent, busPercent, incidentSeverity]);

  const checklistEvaluation = useMemo(() => {
    return evaluateDigitalTwinSafetyChecklist(checkedItems);
  }, [checkedItems]);

  const examEvaluation = useMemo(() => {
    return evaluateDigitalTwinExam(examAnswers);
  }, [examAnswers]);

  // Filtered corridors in radar tab
  const filteredCorridors = useMemo(() => {
    const list = Object.values(STRATEGIC_CORRIDORS);
    if (!radarSearchQuery.trim()) return list;
    const q = radarSearchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.nameAz.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.routeCode.toLowerCase().includes(q) ||
        c.primaryRiskFactorsAz.toLowerCase().includes(q)
    );
  }, [radarSearchQuery]);

  // Filtered certificates in registry
  const filteredCertificates = useMemo(() => {
    const list = generatedCertificate
      ? [generatedCertificate, ...MOCK_CORRIDOR_CERTIFICATES]
      : MOCK_CORRIDOR_CERTIFICATES;

    if (!registrySearchQuery.trim()) return list;
    const q = registrySearchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.certificateId.toLowerCase().includes(q) ||
        c.corridorNameAz.toLowerCase().includes(q) ||
        c.authorizedOrganization.toLowerCase().includes(q) ||
        c.simaDigitalUid.toLowerCase().includes(q)
    );
  }, [registrySearchQuery, generatedCertificate]);

  // Handlers
  const handleApplyScenario = (preset: HighwayScenarioPreset) => {
    setSelectedCorridorId(preset.corridorId);
    setDensityK(preset.densityK);
    setWeatherCondition(preset.weatherCondition);
    setIncidentSeverity(preset.incidentSeverity);
    setSurfaceTempCelsius(preset.surfaceTempCelsius);
    setTruckPercent(preset.truckPercent);
    setBusPercent(preset.busPercent);
  };

  const handleToggleChecklistItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    setCheckedItems(DIGITAL_TWIN_SAFETY_CHECKLIST.map((item) => item.id));
  };

  const handleExamAnswer = (questionId: number, optionIndex: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGenerateCertificate = () => {
    const cert = issueDigitalTwinCertificate({
      corridorId: selectedCorridorId,
      authorizedOrganization: operatorOrg,
      operatorVoen: operatorVoen,
      safetyScorePercentage: checklistEvaluation.scorePercentage,
      activeVslKmH: vslResult.recommendedVslKmH,
      levelOfService: vslResult.levelOfService,
      rwisFrictionMu: vslResult.effectiveFrictionCoefficient,
    });
    setGeneratedCertificate(cert);
    setActiveTab('certificate');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="digital-twin-its-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="digital-twin-modal-title"
    >
      <div className="relative w-full max-w-6xl my-auto bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-sky-950/50 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white flex-shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  RİNN • AYNA • BDYP • NITS 2026
                </span>
                <span className="text-[10px] font-semibold text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                  ISO 14813 / 19650
                </span>
              </div>
              <h2
                id="digital-twin-modal-title"
                className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5"
              >
                Milli Ağıllı Nəqliyyat Sistemi (NITS) & Rəqəmsal Əkiz 3D BIM Baku Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                    currency === cur
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="modal-close-btn"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-slate-800 bg-slate-900/90 px-3 py-2 gap-1.5 scrollbar-thin">
          {[
            { id: 'radar', label: '3D Radar Dəhlizlər', icon: Navigation },
            { id: 'vsl-sim', label: 'Dinamik VSL Simulyator', icon: Gauge },
            { id: 'physics-flow', label: 'Nəqliyyat Axını Fizikası', icon: Activity },
            { id: 'weather-grip', label: 'RWIS Hava & Sürtünmə', icon: CloudRain },
            { id: 'checklist', label: '10-Nöqtəli Audit', icon: ShieldCheck },
            { id: 'exam', label: 'ITS İmtahanı', icon: Award },
            { id: 'certificate', label: 'E-Sertifikat', icon: CheckCircle2 },
            { id: 'registry', label: 'İctimai Reyestr', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DigitalTwinTabId)}
                data-testid={`tab-btn-${tab.id}`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR (6 Strategic Highway Corridors 3D Telemetry Radar) */}
          {activeTab === 'radar' && (
            <div className="space-y-6" data-testid="tab-content-radar">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-400" />
                    6 Strateji Magistral Dəhlizi — 3D BIM LOD 400 Rəqəmsal Əkiz Şəbəkəsi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Bakı və Abşeron yarımadasının strateji nəqliyyat arteriyalarının canlı telemetriyası, CCTV AID analitikası və hava stansiyaları.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={radarSearchQuery}
                    onChange={(e) => setRadarSearchQuery(e.target.value)}
                    placeholder="Dəhliz və ya yol axtar..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCorridors.map((corridor) => {
                  const isSelected = selectedCorridorId === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => setSelectedCorridorId(corridor.id)}
                      data-testid={`corridor-card-${corridor.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {corridor.routeCode}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            {corridor.bimLodLevel}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug">
                          {corridor.nameAz}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {corridor.primaryRiskFactorsAz}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-1.5 rounded-lg bg-slate-900/60">
                          <span className="text-[10px] text-slate-400 block">Uzunluq</span>
                          <span className="font-bold text-white">{corridor.lengthKm} km</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900/60">
                          <span className="text-[10px] text-slate-400 block">Zolaqlar</span>
                          <span className="font-bold text-emerald-400">{corridor.laneCount} ({corridor.lanesPerDirection}x2)</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900/60">
                          <span className="text-[10px] text-slate-400 block">Sürət</span>
                          <span className="font-bold text-sky-400">{corridor.baselineSpeedLimitKmH} km/s</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-teal-400" />
                          {corridor.cctvGantriesCount} CCTV Gantri
                        </span>
                        <span className="flex items-center gap-1">
                          <Network className="w-3.5 h-3.5 text-amber-400" />
                          {corridor.v2xRsuCount} V2X RSU
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Corridor Overview Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/80 via-emerald-950/20 to-slate-800/80 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Seçilmiş Aktiv Dəhliz
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {STRATEGIC_CORRIDORS[selectedCorridorId].nameAz}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Gündəlik nəqliyyat yükü: ~{STRATEGIC_CORRIDORS[selectedCorridorId].dailyTrafficVehicles.toLocaleString('az-AZ')} avtomobil/gün • Hündürlük: {STRATEGIC_CORRIDORS[selectedCorridorId].elevationRangeMeters.min}m ilə {STRATEGIC_CORRIDORS[selectedCorridorId].elevationRangeMeters.max}m arası.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('vsl-sim')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                >
                  <Gauge className="w-4 h-4" />
                  VSL Simulyatoruna Keç
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VSL SIMULATOR (Dynamic Variable Speed Limit Stand) */}
          {activeTab === 'vsl-sim' && (
            <div className="space-y-6" data-testid="tab-content-vsl-sim">
              {/* Presets Bar */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Sürətli Ssenari Preseti Seçin:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {CORRIDOR_SCENARIO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyScenario(preset)}
                      className="p-2 text-left rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-emerald-500 text-[11px] text-slate-300 transition-all"
                    >
                      <span className="font-semibold text-emerald-400 block truncate">
                        {preset.nameAz.split(' - ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {preset.nameAz.split(' - ')[1]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Highway VMS Dynamic Matrix Sign Visualizer */}
              <div className="p-6 rounded-2xl bg-black border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4">
                <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2 text-[10px] text-slate-500 tracking-widest uppercase">
                  <span>NITS AZERBAIJAN • VMS GANTRY #14-B</span>
                  <span>{STRATEGIC_CORRIDORS[selectedCorridorId].nameAz}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    LIVE TELEMETRY
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                  {/* Dynamic Speed Limit Circle or Red X */}
                  {vslResult.isHighwayClosed ? (
                    <div className="w-28 h-28 rounded-2xl bg-red-950 border-4 border-red-600 flex items-center justify-center shadow-lg shadow-red-600/50">
                      <span className="text-5xl font-black text-red-500 animate-pulse">✕</span>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-white border-8 border-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                      <span className="text-4xl font-black text-black tracking-tighter">
                        {vslResult.recommendedVslKmH}
                      </span>
                    </div>
                  )}

                  {/* VMS Matrix LED Display */}
                  <div className="space-y-2 text-left">
                    <div className="px-4 py-2.5 rounded-lg bg-zinc-950 border border-amber-500/40 text-amber-400 font-mono text-sm sm:text-base font-bold tracking-wider shadow-inner">
                      {vslResult.vmsDisplayMessageAz}
                    </div>
                    <div className="px-4 py-1.5 rounded-lg bg-zinc-950 border border-slate-800 text-slate-400 font-mono text-xs tracking-wider">
                      {vslResult.vmsDisplayMessageEn}
                    </div>
                  </div>
                </div>

                {/* Overhead Lane Control Signals */}
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-900 w-full">
                  {vslResult.laneSignals.map((signal, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800"
                    >
                      <span className="text-[10px] text-slate-500">Zolaq {idx + 1}</span>
                      {signal === 'OPEN_GREEN' && (
                        <span className="text-lg font-bold text-emerald-400 animate-pulse">↓</span>
                      )}
                      {signal === 'MERGE_LEFT' && (
                        <span className="text-lg font-bold text-amber-400 animate-pulse">↙</span>
                      )}
                      {signal === 'MERGE_RIGHT' && (
                        <span className="text-lg font-bold text-amber-400 animate-pulse">↘</span>
                      )}
                      {signal === 'CLOSED_RED_X' && (
                        <span className="text-lg font-bold text-red-500 animate-pulse">✕</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulator Controls & Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/40 p-5 rounded-xl border border-slate-700/60">
                {/* Left Column: Sliders */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>Nəqliyyat Sıxlığı (k):</span>
                      <span className="text-emerald-400 font-bold">{densityK} avtomobil/km/zolaq</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={110}
                      step={1}
                      value={densityK}
                      onChange={(e) => setDensityK(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>Sərbəst (0)</span>
                      <span>Məqbul (35)</span>
                      <span>Sıx (55)</span>
                      <span>Böhran / Tıxac (110)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>Asfalt Örtük Temperaturu:</span>
                      <span className="text-sky-400 font-bold">{surfaceTempCelsius}°C</span>
                    </div>
                    <input
                      type="range"
                      min={-10}
                      max={45}
                      step={1}
                      value={surfaceTempCelsius}
                      onChange={(e) => setSurfaceTempCelsius(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>Şaxta (-10°C)</span>
                      <span>Mülayim (+18°C)</span>
                      <span>İsti Asfalt (+45°C)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Hava və Yol Səthi Şəraiti:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(WEATHER_CONDITIONS) as WeatherCondition[]).map((cond) => {
                        const info = WEATHER_CONDITIONS[cond];
                        const isSelected = weatherCondition === cond;
                        return (
                          <button
                            key={cond}
                            onClick={() => setWeatherCondition(cond)}
                            className={`p-2 rounded-lg text-xs text-left border transition-all ${
                              isSelected
                                ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="block">{info.labelAz}</span>
                            <span className="text-[10px] text-slate-500 block">
                              Sürtünmə μ = {info.baseFrictionCoefficient}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Incident & Result Metrics */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Magistral İnsident və Qəza Vəziyyəti:
                    </label>
                    <select
                      value={incidentSeverity}
                      onChange={(e) => setIncidentSeverity(e.target.value as IncidentSeverity)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {(Object.keys(INCIDENT_SEVERITY_LEVELS) as IncidentSeverity[]).map((sev) => (
                        <option key={sev} value={sev}>
                          {INCIDENT_SEVERITY_LEVELS[sev].labelAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Xidmət Səviyyəsi (LOS)</span>
                      <span
                        className={`text-sm font-bold block mt-0.5 ${
                          LOS_DEFINITIONS[vslResult.levelOfService].colorClass.split(' ')[0]
                        }`}
                      >
                        {LOS_DEFINITIONS[vslResult.levelOfService].nameAz}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Sürtünmə Əmsalı (μ)</span>
                      <span className="text-sm font-bold text-teal-400 block mt-0.5">
                        μ = {vslResult.effectiveFrictionCoefficient}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Növbə / Tıxac Uzunluğu</span>
                      <span className="text-sm font-bold text-amber-400 block mt-0.5">
                        {vslResult.queueLengthKm} km
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Orta Yubanma Vaxtı</span>
                      <span className="text-sm font-bold text-rose-400 block mt-0.5">
                        +{vslResult.delayMinutes} dəqiqə
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                    <span className="text-emerald-400 font-semibold block mb-0.5">Qanuni Əsaslandırma:</span>
                    {vslResult.safetyRationaleAz}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRAFFIC FLOW PHYSICS (Macro & Micro Flow Stand) */}
          {activeTab === 'physics-flow' && (
            <div className="space-y-6" data-testid="tab-content-physics-flow">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Makro və Mikro Nəqliyyat Axını Qanunauyğunluqları (Greenshields Modeli)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Nəqliyyat tərkibi (TIR, avtobus, minik) üzrə Ekvivalent Minik Avtomobili (PCU), dinamik fasilə (headway) və ekoloji itkilərin hesablanması.
                </p>
              </div>

              {/* Vehicle Mix Adjustment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Ağır Yük TIR Payı:</span>
                    <span className="text-amber-400 font-bold">{truckPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    value={truckPercent}
                    onChange={(e) => setTruckPercent(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">PCU əmsalı = 2.5</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Avtobus / Mikroavtobus Payı:</span>
                    <span className="text-sky-400 font-bold">{busPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={25}
                    value={busPercent}
                    onChange={(e) => setBusPercent(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">PCU əmsalı = 2.2</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Fərdi Minik Avtomobilləri:</span>
                    <span className="text-emerald-400 font-bold">{flowMetrics.passengerCarPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${flowMetrics.passengerCarPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">PCU əmsalı = 1.0</span>
                </div>
              </div>

              {/* Computed Macro Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block">Saatlıq Axın Həcmi</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {flowMetrics.hourlyVolumeVehTotal.toLocaleString('az-AZ')}
                  </span>
                  <span className="text-[10px] text-slate-500">avto/saat</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block">PCU Ekvivalenti</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">
                    {flowMetrics.pcuEquivalentFlow.toLocaleString('az-AZ')}
                  </span>
                  <span className="text-[10px] text-slate-500">PCU/saat</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block">Orta Zaman İntervalı</span>
                  <span className="text-base font-bold text-teal-400 mt-1 block">
                    {flowMetrics.averageHeadwaySeconds} s
                  </span>
                  <span className="text-[10px] text-slate-500">headway</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block">İtki Yanacaq Sərfi</span>
                  <span className="text-base font-bold text-amber-400 mt-1 block">
                    {flowMetrics.fuelWasteLitresPerHour} L
                  </span>
                  <span className="text-[10px] text-slate-500">saatda</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block">Artıq CO2 Emissiyası</span>
                  <span className="text-base font-bold text-rose-400 mt-1 block">
                    {flowMetrics.excessCo2KgPerHour} kq
                  </span>
                  <span className="text-[10px] text-slate-500">saatda</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                  <span className="text-[10px] text-slate-400 block">İqtisadi İtki</span>
                  <span className="text-base font-bold text-emerald-300 mt-1 block">
                    {formatCurrency(flowMetrics.economicDelayCostAznPerHour, currency)}
                  </span>
                  <span className="text-[10px] text-slate-500">saatda</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEATHER SENSORS & GRIP TELEMETRY (RWIS) */}
          {activeTab === 'weather-grip' && (
            <div className="space-y-6" data-testid="tab-content-weather-grip">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-emerald-400" />
                  RWIS Yol-Hava Telemetriyası və Səth Sürtünmə Qabiliyyəti (Grip Index)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Yol örtüyü spektroskopik lazer sensorları su filmi qalınlığını, donma nöqtəsini və avtomatik duz-məhlul (brine) püskürtmə sistemlərini idarə edir.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Sürtünmə Əmsalı (μ)</span>
                    <Thermometer className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    μ = {vslResult.effectiveFrictionCoefficient}
                  </div>
                  <p className="text-xs text-slate-400">
                    Tələb olunan minimum normativ hədd: μ &ge; 0.45.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Görmə Məsafəsi</span>
                    <Eye className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold text-sky-400">
                    {WEATHER_CONDITIONS[weatherCondition].visibilityMeters} m
                  </div>
                  <p className="text-xs text-slate-400">
                    Duman və ya qarlı hava şəraitində optik ləngimə.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Avtomatlaşdırılmış Brine Çiləyici</span>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm font-bold text-amber-400">
                    {weatherCondition === 'SNOW_ICE' ? 'AKTİV ÇİLƏMƏ REJİMİ' : 'STANDBY GÖZLƏMƏ'}
                  </div>
                  <p className="text-xs text-slate-400">
                    Viaduk və körpülərdə FAST avtomatlaşdırılmış duz məhlulu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST (10-Point Operational Safety Checklist) */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="tab-content-checklist">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    10-Nöqtəli ITS Rəqəmsal Əkiz Əməliyyat Təhlükəsizliyi Auditi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Nazirlər Kabinetinin ITS Qaydaları və ISO 14813 standartına uyğunluğun təsdiqi.
                  </p>
                </div>
                <button
                  onClick={handleSelectAllChecklist}
                  data-testid="checklist-select-all-btn"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all whitespace-nowrap"
                >
                  Hamısını Təsdiq Et (10/10)
                </button>
              </div>

              {/* Progress and score */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 w-full sm:w-2/3">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Audit Nəticəsi:</span>
                    <span className="text-emerald-400">{checklistEvaluation.scorePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        checklistEvaluation.scorePercentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${checklistEvaluation.scorePercentage}%` }}
                    />
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    checklistEvaluation.isCompliant
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {checklistEvaluation.statusAz}
                </div>
              </div>

              {/* Checklist items list */}
              <div className="space-y-3">
                {DIGITAL_TWIN_SAFETY_CHECKLIST.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(item.id)}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-800/80 border-emerald-500/40'
                          : 'bg-slate-800/30 border-slate-700/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border flex-shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                            {item.categoryAz}
                          </span>
                          <span className="text-[10px] text-slate-500">{item.statutoryReference}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white">
                          {item.titleAz}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.descriptionAz}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: EXAM (10-Question Smart Mobility & ITS Law Exam) */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="tab-content-exam">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Ağıllı Nəqliyyat və Magistral Qanunvericiliyi İmtahanı (10 Sual)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Yol hərəkəti haqqında Qanunun 34 və 50-ci maddələri, VMS dinamik tablolara riayət və V2X hüquqi tələbləri.
                </p>
              </div>

              {/* Questions List */}
              <div className="space-y-5">
                {DIGITAL_TWIN_EXAM_QUESTIONS.map((q) => {
                  const selectedOpt = examAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 space-y-3"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-emerald-400">Sual #{q.id}</span>
                        <span>{q.statutoryReference}</span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {q.questionAz}
                      </p>

                      <div className="space-y-2">
                        {q.optionsAz.map((opt, oIdx) => {
                          const isOptionSelected = selectedOpt === oIdx;
                          let optStyle =
                            'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/60';

                          if (examSubmitted) {
                            if (oIdx === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-900/40 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isOptionSelected) {
                              optStyle = 'bg-rose-900/40 border-rose-500 text-rose-200';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'bg-emerald-600/20 border-emerald-500 text-white font-semibold';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleExamAnswer(q.id, oIdx)}
                              data-testid={`exam-q${q.id}-opt${oIdx}`}
                              className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && oIdx === q.correctOptionIndex && (
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                          <span className="text-emerald-400 font-semibold block">İzah:</span>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Score Action */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  Cavablandırılıb: {Object.keys(examAnswers).length} / {DIGITAL_TWIN_EXAM_QUESTIONS.length}
                </div>

                {!examSubmitted ? (
                  <button
                    onClick={() => setExamSubmitted(true)}
                    data-testid="exam-submit-btn"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
                  >
                    İmtahanı Tamamla və Qiymətləndir
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">
                      Nəticə: {examEvaluation.percentage}% ({examEvaluation.scoreGrade})
                    </span>
                    <button
                      onClick={() => {
                        setExamSubmitted(false);
                        setExamAnswers({});
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-white"
                    >
                      Yenidən Cəhd Et
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: CERTIFICATE (Official NITS-TWIN-AZ-2026 Clearance Certificate) */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="tab-content-certificate">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Rəsmi NITS-TWIN-AZ-2026 Rəqəmsal Dəhliz İcazə və Uyğunluq Sertifikatı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    SİMA rəqəmsal imzalı, SHA-256 kriptoqrafik çeksum ilə təmin olunmuş dövlət reyestr sertifikatı.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateCertificate}
                    data-testid="generate-cert-btn"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Yeni Sertifikat Tərtib Et
                  </button>
                </div>
              </div>

              {/* Certificate Template */}
              {generatedCertificate || MOCK_CORRIDOR_CERTIFICATES[0] ? (
                (() => {
                  const cert = generatedCertificate || MOCK_CORRIDOR_CERTIFICATES[0];
                  return (
                    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-6">
                      {/* Watermark Emblem */}
                      <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                        <Activity className="w-96 h-96 text-emerald-400" />
                      </div>

                      {/* Top Header */}
                      <div className="border-b-2 border-emerald-500/30 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                            AZƏRBAYCAN RESPUBLİKASI RƏQƏMSAL İNKİŞAF VƏ NƏQLİYYAT NAZİRLİYİ
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-white mt-1">
                            MİLLİ AĞILLI NƏQLİYYAT SİSTEMİ (NITS) DƏHLİZ İCAZƏSİ
                          </h3>
                          <span className="text-xs text-slate-400">
                            NITS & BDYP Dövlət Rəqəmsal Əkiz İnteqrasiya Portalı
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                            {cert.certificateId}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-1">
                            Status: {cert.status}
                          </span>
                        </div>
                      </div>

                      {/* Certificate Body Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">Magistral Dəhlizi</span>
                          <span className="font-bold text-white block mt-0.5">{cert.corridorNameAz}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">İstismarçı Qurum & VÖEN</span>
                          <span className="font-bold text-white block mt-0.5">{cert.authorizedOrganization}</span>
                          <span className="text-[10px] text-slate-400">VÖEN: {cert.operatorVoen}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">3D BIM Səviyyəsi</span>
                          <span className="font-bold text-sky-400 block mt-0.5">{cert.bimLodLevel}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">Təhlükəsizlik Uyğunluq Skoru</span>
                          <span className="font-bold text-emerald-400 block mt-0.5">
                            {cert.safetyScorePercentage}% (Normativ: &ge;80%)
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">Aktiv Dinamik Sürət / Baza</span>
                          <span className="font-bold text-amber-400 block mt-0.5">
                            {cert.activeVslKmH} km/s / {cert.baselineSpeedLimitKmH} km/s
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">RWIS Səth Sürtünməsi</span>
                          <span className="font-bold text-teal-400 block mt-0.5">
                            μ = {cert.rwisFrictionMu}
                          </span>
                        </div>
                      </div>

                      {/* Cryptographic Verification Box */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            SİMA İmzası: {cert.simaDigitalUid}
                          </span>
                          <span className="text-slate-500">
                            Etibarlılıq: {cert.issueDateIso} — {cert.expiryDateIso}
                          </span>
                        </div>

                        <div className="text-[10px] font-mono text-slate-500 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                          SHA-256 HASH: {cert.sha256VerificationHash}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyText(cert.sha256VerificationHash)}
                            data-testid="copy-hash-btn"
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {isCopied ? 'Kopyalandı!' : 'SHA-256 Hash Kopyala'}
                          </button>

                          <button
                            onClick={() => handleCopyText(cert.qrVerificationUrl)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Yoxlama Linki
                          </button>
                        </div>

                        <button
                          onClick={handlePrint}
                          data-testid="print-cert-btn"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Çap Et (A4 Talon)
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </div>
          )}

          {/* TAB 8: REGISTRY (Unified Public Registry) */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="tab-content-registry">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Vahid Nəqliyyat Dəhlizləri və Sertifikatlar Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Dövlət orqanları və ictimaiyyət üçün açıq NITS rəqəmsal əkiz reyestr məlumat bazası.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={registrySearchQuery}
                    onChange={(e) => setRegistrySearchQuery(e.target.value)}
                    placeholder="Sertifikat ID və ya qurum axtar..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.certificateId}
                    data-testid={`registry-cert-${cert.certificateId}`}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 hover:bg-slate-800/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {cert.certificateId}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            cert.status === 'ACTIVE_CERTIFIED'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {cert.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{cert.corridorNameAz}</h4>
                      <p className="text-xs text-slate-400">{cert.authorizedOrganization}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Dinamik VSL</span>
                        <span className="font-bold text-amber-400">{cert.activeVslKmH} km/s</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Sürtünmə</span>
                        <span className="font-bold text-teal-400">μ = {cert.rwisFrictionMu}</span>
                      </div>
                      <button
                        onClick={() => {
                          setGeneratedCertificate(cert);
                          setActiveTab('certificate');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold whitespace-nowrap"
                      >
                        Baxış
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
