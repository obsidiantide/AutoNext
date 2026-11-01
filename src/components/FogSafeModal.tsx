import React, { useState, useMemo } from 'react';
import {
  CloudFog,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  FileText,
  Search,
  Printer,
  Copy,
  ExternalLink,
  HelpCircle,
  Wind,
  Gauge,
  Eye,
  Activity,
  Zap,
  Car,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Modal } from './Modal';
import { Currency } from '../types/vehicle';
import {
  FogCorridor,
  RoadSurfaceCondition,
  calculateVisibilityMetrics,
  calculateFogViolationFine,
  evaluateFogChecklist,
  evaluateFogExam,
  generateFogCertificate,
  FogClearanceCertificate,
} from '../utils/fogSafeCompliance';
import {
  MOCK_FOG_CORRIDORS,
  MOCK_VEHICLE_FOG_PRESETS,
  MOCK_FOG_CHECKLIST_ITEMS,
  MOCK_FOG_EXAM_QUESTIONS,
  MOCK_FOG_CERTIFICATES,
} from '../data/mockFogSafeData';

export type FogTabId =
  | 'radar'
  | 'scada'
  | 'calculator'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export interface FogSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

export const FogSafeModal: React.FC<FogSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<FogTabId>('radar');
  const [selectedCorridor, setSelectedCorridor] = useState<FogCorridor>(MOCK_FOG_CORRIDORS[0]);
  const [radarSearchQuery, setRadarSearchQuery] = useState('');

  // SCADA and Simulation State
  const [simVisibilityMeters, setSimVisibilityMeters] = useState<number>(selectedCorridor.currentVisibilityMeters);
  const [simRoadSurface, setSimRoadSurface] = useState<RoadSurfaceCondition>('wet_damp');
  const [simVehicleSpeed, setSimVehicleSpeed] = useState<number>(60);
  const [simReactionTime, setSimReactionTime] = useState<number>(1.4);
  const [simHeadwayGap, setSimHeadwayGap] = useState<number>(50);

  // Calculator & Fine State
  const [calcActualSpeed, setCalcActualSpeed] = useState<number>(85);
  const [calcVslSpeed, setCalcVslSpeed] = useState<number>(60);
  const [calcHeadlightsViolation, setCalcHeadlightsViolation] = useState<boolean>(false);
  const [calcRearFogMisuse, setCalcRearFogMisuse] = useState<boolean>(false);
  const [calcSafeDistanceViolation, setCalcSafeDistanceViolation] = useState<boolean>(true);

  // Vehicle Preset & Certificate Form State
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>(MOCK_VEHICLE_FOG_PRESETS[0].plate);
  const [selectedVehicleModel, setSelectedVehicleModel] = useState<string>(MOCK_VEHICLE_FOG_PRESETS[0].model);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<string[]>([
    'FOG_CHK_01_FRONT_LAMPS',
    'FOG_CHK_02_REAR_FOG_LAMP',
    'FOG_CHK_03_LOW_BEAM_ONLY',
    'FOG_CHK_04_WIPERS_WASHER',
    'FOG_CHK_05_TIRE_TREAD_DEPTH',
  ]);

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificates & Registry
  const [certificates, setCertificates] = useState<FogClearanceCertificate[]>(MOCK_FOG_CERTIFICATES);
  const [currentCert, setCurrentCert] = useState<FogClearanceCertificate>(MOCK_FOG_CERTIFICATES[0]);
  const [registrySearch, setRegistrySearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Derived Metrics
  const visibilityMetrics = useMemo(() => {
    return calculateVisibilityMetrics({
      visibilityMeters: simVisibilityMeters,
      vehicleSpeedKmH: simVehicleSpeed,
      roadSurface: simRoadSurface,
      reactionTimeSeconds: simReactionTime,
      headwayGapMeters: simHeadwayGap,
    });
  }, [simVisibilityMeters, simVehicleSpeed, simRoadSurface, simReactionTime, simHeadwayGap]);

  const violationCalculation = useMemo(() => {
    return calculateFogViolationFine(
      calcActualSpeed,
      calcVslSpeed,
      calcHeadlightsViolation,
      calcRearFogMisuse,
      calcSafeDistanceViolation,
      currency
    );
  }, [
    calcActualSpeed,
    calcVslSpeed,
    calcHeadlightsViolation,
    calcRearFogMisuse,
    calcSafeDistanceViolation,
    currency,
  ]);

  const checklistResult = useMemo(() => {
    return evaluateFogChecklist(checkedItems, MOCK_FOG_CHECKLIST_ITEMS);
  }, [checkedItems]);

  const examResult = useMemo(() => {
    return evaluateFogExam(examAnswers, MOCK_FOG_EXAM_QUESTIONS);
  }, [examAnswers]);

  // Corridor Selection Handler
  const handleSelectCorridor = (corridor: FogCorridor) => {
    setSelectedCorridor(corridor);
    setSimVisibilityMeters(corridor.currentVisibilityMeters);
    setCalcVslSpeed(corridor.recommendedVslKmH);
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset: (typeof MOCK_VEHICLE_FOG_PRESETS)[0]) => {
    setSelectedVehiclePlate(preset.plate);
    setSelectedVehicleModel(preset.model);
    setCalcActualSpeed(preset.nominalSpeedKmH);
    setSimVehicleSpeed(preset.nominalSpeedKmH);
  };

  // Generate Certificate Handler
  const handleGenerateCertificate = () => {
    const cert = generateFogCertificate(
      selectedCorridor,
      selectedVehiclePlate,
      selectedVehicleModel,
      simVisibilityMeters,
      simRoadSurface
    );
    setCertificates([cert, ...certificates]);
    setCurrentCert(cert);
    setActiveTab('certificate');
  };

  // Filtered Corridors for Radar Tab
  const filteredCorridors = useMemo(() => {
    const q = radarSearchQuery.toLowerCase();
    return MOCK_FOG_CORRIDORS.filter(
      (c) =>
        c.nameAz.toLowerCase().includes(q) ||
        c.regionAz.toLowerCase().includes(q) ||
        c.roadCode.toLowerCase().includes(q) ||
        c.fogTypeNameAz.toLowerCase().includes(q)
    );
  }, [radarSearchQuery]);

  // Filtered Certificates for Registry Tab
  const filteredCertificates = useMemo(() => {
    const q = registrySearch.toLowerCase();
    return certificates.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.vehiclePlate.toLowerCase().includes(q) ||
        c.corridorNameAz.toLowerCase().includes(q) ||
        c.roadCode.toLowerCase().includes(q)
    );
  }, [certificates, registrySearch]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    setCheckedItems(MOCK_FOG_CHECKLIST_ITEMS.map((item) => item.id));
  };

  const getCurrencySymbol = (curr: Currency) => {
    return curr === 'USD' ? '$' : curr === 'EUR' ? '€' : '₼';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col h-[90vh] max-h-[850px] bg-slate-950 text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border-b border-slate-800 p-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
              <CloudFog className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  AAYDA • ETSN • BDYP
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FOG-SAFE-AZ-2026
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                Qatı Duman, Toz Fırtınası və Məhdud Görünüş SCADA Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 flex gap-1 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'radar', label: 'Duman Koridorları Radarı', icon: Eye },
            { id: 'scada', label: 'SCADA & VSL Standı', icon: Sliders },
            { id: 'calculator', label: 'Fizika & Cərimə Hesablayıcı', icon: Gauge },
            { id: 'checklist', label: '10-Bənd Təhlükəsizlik', icon: CheckCircle2 },
            { id: 'exam', label: 'Yol Hərəkəti İmtahanı', icon: HelpCircle },
            { id: 'certificate', label: 'FOG-SAFE Sertifikatı', icon: FileText },
            { id: 'registry', label: 'Vahid Reyestr', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FogTabId)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-sky-400 text-sky-300 bg-sky-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    Azərbaycanın 6 Strateji Duman və Toz Fırtınası Koridoru
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transmissometr telemetriyası, duman növü, ekstinksiya əmsalı və VSL elektron tabloları
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={radarSearchQuery}
                    onChange={(e) => setRadarSearchQuery(e.target.value)}
                    placeholder="Koridor və ya magistral axtar..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCorridors.map((c) => {
                  const isSelected = selectedCorridor.id === c.id;
                  const tier = c.currentVisibilityMeters < 50 ? 'CRITICAL' : c.currentVisibilityMeters < 100 ? 'WARNING' : 'MODERATE';
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCorridor(c)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all text-left relative overflow-hidden ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500/80 shadow-lg shadow-sky-950/50 ring-1 ring-sky-500'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                          {c.roadCode} • {c.highwayKm}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            tier === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : tier === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {tier}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">{c.nameAz}</h4>
                      <p className="text-[11px] text-slate-400 mb-3">{c.regionAz}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Optik Görünüş:</span>
                          <span className="font-bold text-sky-300">{c.currentVisibilityMeters} metr</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Dinamik VSL:</span>
                          <span className="font-bold text-emerald-400">{c.recommendedVslKmH} km/s</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Ekstinksiya (k):</span>
                          <span className="font-mono text-slate-300">{c.currentExtinctionK} m⁻¹</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Nisbi Rütubət:</span>
                          <span className="text-slate-300">{c.relativeHumidityPercent}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-2">
                        <span className="truncate pr-2">Patrul: {c.responsiblePatrolRegimentAz}</span>
                        {isSelected && <span className="text-sky-400 font-bold shrink-0">Seçildi ✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Corridor Live Status Banner */}
              <div className="bg-gradient-to-r from-sky-950/30 via-slate-900 to-sky-950/30 p-4 rounded-xl border border-sky-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black">
                    VSL
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Seçilmiş Sahə: {selectedCorridor.nameAz}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Duman Növü: {selectedCorridor.fogTypeNameAz} • Quraşdırılmış Transmissometrlər: {selectedCorridor.transmissometersCount} ədəd
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('scada')}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    SCADA İdarəetməsinə Keç
                  </button>
                  <button
                    onClick={handleGenerateCertificate}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Keçid Sertifikatı Al
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA TELEMETRY & DYNAMIC VSL */}
          {activeTab === 'scada' && (
            <div className="space-y-6">
              {/* Dynamic Gantry Sign Matrix Simulation */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300 mb-3 border border-slate-700">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  AAYDA & BDYP Magistral Dəyişkən Sürət Həddi (VSL) Elektron Portalı
                </div>

                <div className="max-w-xl mx-auto bg-black border-2 border-amber-500/40 rounded-xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-around gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-amber-400 uppercase font-mono tracking-widest mb-1">
                      Dinamik VSL Həddi
                    </span>
                    <div className="w-20 h-20 rounded-full border-4 border-rose-600 bg-white flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-black text-slate-950 font-sans">
                        {visibilityMetrics.recommendedVslKmH}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">KM/SAAT (MƏCBURİ)</span>
                  </div>

                  <div className="text-left font-mono space-y-1">
                    <div className="text-amber-400 text-sm font-black flex items-center gap-2">
                      <CloudFog className="w-4 h-4" />
                      {visibilityMetrics.visibilityTier === 'CRITICAL_ZERO'
                        ? 'QATI DUMAN! SÜRƏTİ AZALDIN'
                        : visibilityMetrics.visibilityTier === 'DENSE_FOG'
                        ? 'DUMAN! ARA MƏSAFƏSİ SAXLAYIN'
                        : 'MƏHDUD GÖRÜNÜŞ ŞƏRAİTİ'}
                    </div>
                    <div className="text-xs text-slate-300">
                      Görmə Məsafəsi: <span className="text-sky-400 font-bold">{simVisibilityMeters} m</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Ekstinksiya (k): <span className="text-emerald-400 font-bold">{visibilityMetrics.extinctionCoefficientK} m⁻¹</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Yol Şəraiti:{' '}
                      <span className="text-amber-300 font-bold">
                        {simRoadSurface === 'dry_asphalt'
                          ? 'Quru Asfalt'
                          : simRoadSurface === 'wet_damp'
                          ? 'Yaş və Nəm'
                          : simRoadSurface === 'slush_snow'
                          ? 'Sulu Qar'
                          : 'Qara Buz (Black Ice)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                {/* Visibility Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-sky-400" />
                      Meteoroloji Optik Görünüş (MOR):
                    </span>
                    <span className="text-sky-300 font-mono font-bold">{simVisibilityMeters} metr</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="800"
                    step="5"
                    value={simVisibilityMeters}
                    onChange={(e) => setSimVisibilityMeters(Number(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>15m (Kritik Duman)</span>
                    <span>100m (Qatı)</span>
                    <span>300m (Orta)</span>
                    <span>800m (Aydın)</span>
                  </div>
                </div>

                {/* Vehicle Speed Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-emerald-400" />
                      Sınaq Hərəkət Sürəti:
                    </span>
                    <span className="text-emerald-300 font-mono font-bold">{simVehicleSpeed} km/s</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="140"
                    step="5"
                    value={simVehicleSpeed}
                    onChange={(e) => setSimVehicleSpeed(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>20 km/s</span>
                    <span>60 km/s</span>
                    <span>90 km/s</span>
                    <span>140 km/s</span>
                  </div>
                </div>

                {/* Road Surface Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Yol Səthinin Friksiya Vəziyyəti (μ):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'dry_asphalt', label: 'Quru (0.75)', color: 'bg-emerald-950/40 border-emerald-700/50' },
                      { id: 'wet_damp', label: 'Yaş/Duman (0.45)', color: 'bg-sky-950/40 border-sky-700/50' },
                      { id: 'slush_snow', label: 'Qar/Sulu (0.25)', color: 'bg-amber-950/40 border-amber-700/50' },
                      { id: 'black_ice', label: 'Qara Buz (0.12)', color: 'bg-rose-950/40 border-rose-700/50' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSimRoadSurface(item.id as RoadSurfaceCondition)}
                        className={`px-2 py-2 rounded-lg text-[11px] font-semibold border transition-all ${
                          simRoadSurface === item.id
                            ? `${item.color} text-white border-2 ring-1 ring-white/20`
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reaction Time and Headway */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300">Sürücü Reaksiya Vaxtı (t_r):</span>
                    <span className="text-amber-300 font-mono font-bold">{simReactionTime} saniyə</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.2"
                    step="0.1"
                    value={simReactionTime}
                    onChange={(e) => setSimReactionTime(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.8s (İdman)</span>
                    <span>1.4s (Standart Dumanda)</span>
                    <span>2.2s (Yorğun)</span>
                  </div>
                </div>
              </div>

              {/* Stopping Distance vs Sight Distance Calculation Results */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Dayanma Məsafəsi və Görünüş Ehtiyatı Analizi</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      visibilityMetrics.riskVerdict === 'SAFE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : visibilityMetrics.riskVerdict === 'CAUTION'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : visibilityMetrics.riskVerdict === 'HIGH_RISK'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {visibilityMetrics.riskVerdict}
                  </span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Reaksiya Məsafəsi:</span>
                    <span className="text-sm font-mono font-bold text-slate-200">
                      {visibilityMetrics.reactionDistanceMeters} m
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Tormoz Yolu:</span>
                    <span className="text-sm font-mono font-bold text-amber-400">
                      {visibilityMetrics.brakingDistanceMeters} m
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Ümumi Dayanma Yolu:</span>
                    <span className="text-sm font-mono font-bold text-sky-400">
                      {visibilityMetrics.totalStoppingDistanceMeters} m
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Görünüş Ehtiyatı (ΔS):</span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        visibilityMetrics.sightStoppingMarginMeters >= 10
                          ? 'text-emerald-400'
                          : visibilityMetrics.sightStoppingMarginMeters >= 0
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {visibilityMetrics.sightStoppingMarginMeters > 0 ? '+' : ''}
                      {visibilityMetrics.sightStoppingMarginMeters} m
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <p className="font-semibold">{visibilityMetrics.riskDescriptionAz}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALCULATOR & STATUTORY FINES */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Vehicle Preset Quick Selector */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  Avtomobil Presetləri (Qeydiyyat Nişanı və İşıq Təchizatı):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MOCK_VEHICLE_FOG_PRESETS.map((p) => {
                    const isSelected = selectedVehiclePlate === p.plate;
                    return (
                      <button
                        key={p.plate}
                        onClick={() => handleSelectPreset(p)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-sky-950/60 border-sky-500 text-white shadow-md'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-black text-sky-400 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-800">
                            {p.plate}
                          </span>
                          <span className="text-[10px] text-slate-400">{p.nominalSpeedKmH} km/s</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-200 truncate">{p.model}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calculator Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-slate-300">Faktiki Sürət:</span>
                      <span className="text-sky-300 font-mono font-bold">{calcActualSpeed} km/s</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="150"
                      step="5"
                      value={calcActualSpeed}
                      onChange={(e) => setCalcActualSpeed(Number(e.target.value))}
                      className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-slate-300">Duman Zonası VSL Həddi:</span>
                      <span className="text-emerald-300 font-mono font-bold">{calcVslSpeed} km/s</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="110"
                      step="10"
                      value={calcVslSpeed}
                      onChange={(e) => setCalcVslSpeed(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">Qayda Pozuntusu İndikatorları:</span>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcHeadlightsViolation}
                      onChange={(e) => setCalcHeadlightsViolation(e.target.checked)}
                      className="rounded accent-sky-500"
                    />
                    <span className="text-xs text-slate-300">
                      Dumanda uzaq vuran işıqlar və ya işıqsız hərəkət (İXM 342.1.4 — 30 ₼)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcRearFogMisuse}
                      onChange={(e) => setCalcRearFogMisuse(e.target.checked)}
                      className="rounded accent-sky-500"
                    />
                    <span className="text-xs text-slate-300">
                      Aydın havada arxa duman fənərinin kor edici qanunsuz istifadəsi (30 ₼)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcSafeDistanceViolation}
                      onChange={(e) => setCalcSafeDistanceViolation(e.target.checked)}
                      className="rounded accent-sky-500"
                    />
                    <span className="text-xs text-slate-300">
                      Məhdud görünüşdə təhlükəsiz ara məsafəsinin pozulması (İXM 327.1 — 40 ₼)
                    </span>
                  </label>
                </div>
              </div>

              {/* Fines Breakdown Box */}
              <div className="bg-gradient-to-r from-slate-900 to-sky-950/40 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    İnzibati Xətalar Məcəlləsi (İXM) Cərimə Hesabatı
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Cərimə Balı:</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
                      +{violationCalculation.penaltyPoints} Bal
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Sürət Aşımı:</span>
                    <span className="text-sm font-mono font-bold text-slate-200">
                      +{violationCalculation.speedExcessKmH} km/s
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Sürət Cəriməsi:</span>
                    <span className="text-sm font-mono font-bold text-slate-200">
                      {violationCalculation.speedFineAzn} ₼
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Ümumi Cərimə:</span>
                    <span className="text-sm font-mono font-bold text-rose-400">
                      {currency === 'AZN'
                        ? `${violationCalculation.totalFineAzn} ₼`
                        : `${getCurrencySymbol(currency)}${violationCalculation.totalFineForeign}`}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-emerald-800/40">
                    <span className="text-[10px] text-emerald-400 block font-semibold">30 Günlük 50% Güzəşt:</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {currency === 'AZN'
                        ? `${violationCalculation.promptDiscountFineAzn} ₼`
                        : `${getCurrencySymbol(currency)}${violationCalculation.promptDiscountFineForeign}`}
                    </span>
                  </div>
                </div>

                {violationCalculation.violationsSummaryAz.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {violationCalculation.violationsSummaryAz.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    10-Bəndlik Texniki Görünüş və Yol Təhlükəsizliyi Yoxlama Vərəqəsi
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AZS 410, UNECE R19, R38 standartlarına uyğun məcburi avadanlıq və duman hazırlığı
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      checklistResult.isCompliant
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    Uyğunluq: {checklistResult.percentage}% ({checklistResult.passedCount}/
                    {checklistResult.totalCount})
                  </span>
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Hamısını Təsdiqlə
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {MOCK_FOG_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-800/60 shadow-sm'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="mt-0.5 rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{item.titleAz}</span>
                          <div className="flex items-center gap-2">
                            {item.isMandatory && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                MƏCBURİ
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-500">{item.standardRef}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{item.descriptionAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-sky-400" />
                    Duman və Məhdud Görünüşdə Hərəkət Qaydaları İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Azərbaycan Respublikası Yol Hərəkəti Qanunu (Maddə 42, 50, 73) və İXM üzrə 10 sual
                  </p>
                </div>
                {examSubmitted && (
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      examResult.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    Nəticə: {examResult.correctCount}/{examResult.totalCount} ({examResult.percentage}%) —{' '}
                    {examResult.passed ? 'MÜVƏFFƏQ' : 'KƏSİLDİ'}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_FOG_EXAM_QUESTIONS.map((q) => {
                  const selectedOpt = examAnswers[q.id];
                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-sky-400 font-mono">Q{q.id}.</span>
                        <h4 className="text-xs font-bold text-white">{q.questionAz}</h4>
                      </div>

                      <div className="space-y-1.5 pl-6">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isPicked = selectedOpt === optIdx;
                          const isCorrect = q.correctOptionIndex === optIdx;
                          let optStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900';
                          if (examSubmitted) {
                            if (isCorrect) optStyle = 'bg-emerald-950/40 border-emerald-600 text-emerald-200';
                            else if (isPicked && !isCorrect) optStyle = 'bg-rose-950/40 border-rose-600 text-rose-200';
                          } else if (isPicked) {
                            optStyle = 'bg-sky-950/50 border-sky-500 text-white';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!examSubmitted) {
                                  setExamAnswers({ ...examAnswers, [q.id]: optIdx });
                                }
                              }}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && isCorrect && <span className="text-emerald-400 font-bold">✓</span>}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 pl-6 space-y-1">
                          <p className="text-sky-300 font-semibold">{q.explanationAz}</p>
                          <p className="text-slate-500 font-mono text-[10px]">İstinad: {q.legalCitation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {!examSubmitted ? (
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-sky-950/50"
                  >
                    İmtahanı Tamamla və Qiymətləndir
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Yenidən Sına
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Certificate Sheet (Printable) */}
              <div className="max-w-2xl mx-auto bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-600/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left">
                {/* Watermark Logo */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                  <CloudFog className="w-64 h-64 text-sky-400" />
                </div>

                {/* Certificate Header */}
                <div className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-black block">
                      AZƏRBAYCAN RESPUBLİKASI AAYDA & BDYP
                    </span>
                    <h3 className="text-base font-black text-white mt-0.5">
                      RƏSMİ MAGİSTRAL DUMAN KEÇİD SERTİFİKATI
                    </h3>
                    <p className="text-xs text-slate-400">
                      Meteoroloji Optik Görünüş və Dinamik VSL Hərəkət İcazəsi
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-emerald-400 block">
                      {currentCert.certificateNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      PIN: {currentCert.barrierReleasePin}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Təyin Olunmuş Koridor:</span>
                    <span className="font-semibold text-white">{currentCert.corridorNameAz}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Magistral İndeksi:</span>
                    <span className="font-semibold text-white">{currentCert.roadCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Nəqliyyat Vasitəsi:</span>
                    <span className="font-semibold text-white">
                      {currentCert.vehicleModel} ({currentCert.vehiclePlate})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ölçülmüş Görünüş Məsafəsi:</span>
                    <span className="font-semibold text-sky-400">
                      {currentCert.measuredVisibilityMeters} metr ({currentCert.visibilityTier})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">İcazə Verilmiş VSL Sürəti:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      maks. {currentCert.assignedVslSpeedKmH} km/s
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Eskort Tələbi:</span>
                    <span className="font-semibold text-white">
                      {currentCert.escortRequired ? 'BDYP Eskortu ilə Məcburidir' : 'Fərdi Hərəkət İcazəlidir'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Verilmə Tarixi:</span>
                    <span className="font-mono text-slate-300">{currentCert.issuedAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Etibarlılıq Müddəti (12 Saat):</span>
                    <span className="font-mono text-slate-300">{currentCert.validUntil}</span>
                  </div>
                </div>

                {/* SİMA Digital Signature UID & Checksum */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>SİMA Rəqəmsal İmza:</span>
                    <span className="text-sky-400 font-bold">{currentCert.simaDigitalUid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kriptoqrafik SHA-256:</span>
                    <span className="text-slate-500 truncate max-w-[280px]">
                      {currentCert.sha256Checksum}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleCopyCode(currentCert.certificateNumber)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-sky-950/50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Sertifikatı Çap Et
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Vahid Magistral Duman Keçid Sertifikatları Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Aktiv və yoxlanılmış FOG-SAFE-AZ-2026 icazələrinin mərkəzləşdirilmiş bazası
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Qeydiyyat nişanı və ya nömrə..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.certificateNumber}
                    className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-sky-400">
                          {cert.certificateNumber}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {cert.status}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {cert.roadCode}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {cert.vehiclePlate} • {cert.vehicleModel}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {cert.corridorNameAz} • VSL: {cert.assignedVslSpeedKmH} km/s • Görünüş:{' '}
                        {cert.measuredVisibilityMeters}m
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setCurrentCert(cert);
                          setActiveTab('certificate');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Görüntülə
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
