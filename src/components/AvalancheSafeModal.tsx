import React, { useState, useMemo } from 'react';
import {
  Mountain,
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
  Activity,
  Zap,
  Car,
  Lock,
  RefreshCw,
  Flame,
  Volume2,
} from 'lucide-react';
import { Modal } from './Modal';
import { Currency } from '../types/vehicle';
import {
  AlpineCorridor,
  AlpineSurfaceCondition,
  VehicleTireEquipment,
  calculateAvalancheMetrics,
  calculateAvalancheViolationFine,
  evaluateAvalancheChecklist,
  evaluateAvalancheExam,
  generateAvalancheCertificate,
  AvalancheClearanceCertificate,
} from '../utils/avalancheSafeCompliance';
import {
  MOCK_ALPINE_CORRIDORS,
  MOCK_VEHICLE_ALPINE_PRESETS,
  MOCK_AVALANCHE_CHECKLIST_ITEMS,
  MOCK_AVALANCHE_EXAM_QUESTIONS,
  MOCK_AVALANCHE_CERTIFICATES,
} from '../data/mockAvalancheSafeData';

export type AvalancheTabId =
  | 'radar'
  | 'scada'
  | 'calculator'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export interface AvalancheSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

export const AvalancheSafeModal: React.FC<AvalancheSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<AvalancheTabId>('radar');
  const [selectedCorridor, setSelectedCorridor] = useState<AlpineCorridor>(MOCK_ALPINE_CORRIDORS[0]);
  const [radarSearchQuery, setRadarSearchQuery] = useState('');

  // SCADA and Simulation State
  const [simSnowDepthCm, setSimSnowDepthCm] = useState<number>(selectedCorridor.currentSnowDepthCm);
  const [simSnowDensityKgM3, setSimSnowDensityKgM3] = useState<number>(selectedCorridor.currentSnowDensityKgM3);
  const [simWeakLayerKPa, setSimWeakLayerKPa] = useState<number>(selectedCorridor.weakLayerShearStrengthKPa);
  const [simSlopeAngleDeg, setSimSlopeAngleDeg] = useState<number>(selectedCorridor.slopeAngleDeg);
  const [simPavementTempC, setSimPavementTempC] = useState<number>(selectedCorridor.pavementTemperatureC);
  const [simAmbientTempC, setSimAmbientTempC] = useState<number>(selectedCorridor.ambientTemperatureC);
  const [simVehicleSpeed, setSimVehicleSpeed] = useState<number>(45);
  const [simSurface, setSimSurface] = useState<AlpineSurfaceCondition>('packed_snow_groomed');
  const [simTires, setSimTires] = useState<VehicleTireEquipment>('winter_3pmsf');

  // Gazex SCADA Detonation status
  const [isGazexDetonating, setIsGazexDetonating] = useState<boolean>(false);
  const [gazexDetonatedMessage, setGazexDetonatedMessage] = useState<string | null>(null);

  // Calculator & Fine State
  const [calcTransitDefiance, setCalcTransitDefiance] = useState<boolean>(false);
  const [calcMissingSnowChains, setCalcMissingSnowChains] = useState<boolean>(true);
  const [calcSafeDistanceViolation, setCalcSafeDistanceViolation] = useState<boolean>(false);
  const [calcSpeedExcessBlizzard, setCalcSpeedExcessBlizzard] = useState<boolean>(false);

  // Vehicle Preset & Certificate Form State
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>(
    MOCK_VEHICLE_ALPINE_PRESETS[0].plate
  );
  const [selectedVehicleModel, setSelectedVehicleModel] = useState<string>(
    MOCK_VEHICLE_ALPINE_PRESETS[0].model
  );

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<string[]>([
    'AVL_CHK_01_WINTER_TIRES',
    'AVL_CHK_02_SNOW_CHAINS_FITTED',
    'AVL_CHK_03_GAZEX_RACS_STATUS',
    'AVL_CHK_04_ACOUSTIC_SNOW_SENSOR',
    'AVL_CHK_05_ANTI_ICE_BRINE',
  ]);

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificates & Registry
  const [certificates, setCertificates] = useState<AvalancheClearanceCertificate[]>(
    MOCK_AVALANCHE_CERTIFICATES
  );
  const [currentCert, setCurrentCert] = useState<AvalancheClearanceCertificate>(
    MOCK_AVALANCHE_CERTIFICATES[0]
  );
  const [registrySearch, setRegistrySearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Derived Calculations
  const avalancheMetrics = useMemo(() => {
    return calculateAvalancheMetrics({
      snowDepthCm: simSnowDepthCm,
      snowDensityKgM3: simSnowDensityKgM3,
      weakLayerShearStrengthKPa: simWeakLayerKPa,
      slopeAngleDeg: simSlopeAngleDeg,
      pavementTempC: simPavementTempC,
      ambientTempC: simAmbientTempC,
      vehicleSpeedKmH: simVehicleSpeed,
      surfaceCondition: simSurface,
      tireEquipment: simTires,
    });
  }, [
    simSnowDepthCm,
    simSnowDensityKgM3,
    simWeakLayerKPa,
    simSlopeAngleDeg,
    simPavementTempC,
    simAmbientTempC,
    simVehicleSpeed,
    simSurface,
    simTires,
  ]);

  const violationCalculation = useMemo(() => {
    return calculateAvalancheViolationFine(
      calcTransitDefiance,
      calcMissingSnowChains,
      calcSafeDistanceViolation,
      calcSpeedExcessBlizzard,
      currency
    );
  }, [
    calcTransitDefiance,
    calcMissingSnowChains,
    calcSafeDistanceViolation,
    calcSpeedExcessBlizzard,
    currency,
  ]);

  const checklistResult = useMemo(() => {
    return evaluateAvalancheChecklist(checkedItems, MOCK_AVALANCHE_CHECKLIST_ITEMS);
  }, [checkedItems]);

  const examResult = useMemo(() => {
    return evaluateAvalancheExam(examAnswers, MOCK_AVALANCHE_EXAM_QUESTIONS);
  }, [examAnswers]);

  // Corridor Selection Handler
  const handleSelectCorridor = (corridor: AlpineCorridor) => {
    setSelectedCorridor(corridor);
    setSimSnowDepthCm(corridor.currentSnowDepthCm);
    setSimSnowDensityKgM3(corridor.currentSnowDensityKgM3);
    setSimWeakLayerKPa(corridor.weakLayerShearStrengthKPa);
    setSimSlopeAngleDeg(corridor.slopeAngleDeg);
    setSimPavementTempC(corridor.pavementTemperatureC);
    setSimAmbientTempC(corridor.ambientTemperatureC);
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset: (typeof MOCK_VEHICLE_ALPINE_PRESETS)[0]) => {
    setSelectedVehiclePlate(preset.plate);
    setSelectedVehicleModel(preset.model);
    setSimVehicleSpeed(preset.nominalSpeedKmH);
    setSimTires(preset.defaultTires);
  };

  // Trigger Gazex remote explosion simulation
  const handleTriggerGazexBlast = () => {
    setIsGazexDetonating(true);
    setGazexDetonatedMessage(null);

    // Audio cue if SpeechSynthesis is available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(
          'Diqqət! Gazex pnevmatik partladıcı işə salındı. Qar uçqunu nəzarətli boşaldıldı.'
        );
        utterance.lang = 'az-AZ';
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback ignore
      }
    }

    setTimeout(() => {
      setIsGazexDetonating(false);
      setSimSnowDepthCm((prev) => Math.max(15, Math.round(prev * 0.4)));
      setSimWeakLayerKPa((prev) => Math.round((prev + 1.2) * 10) / 10);
      setGazexDetonatedMessage(
        'UĞURLU: Gazex pnevmatik partlayışı 4200 kJ enerji ilə həyata keçirildi. 65% zəif qar kütləsi təhlükəsiz qar qoruyucu vala töküldü.'
      );
    }, 1200);
  };

  // Generate Certificate Handler
  const handleGenerateCertificate = () => {
    const cert = generateAvalancheCertificate(
      selectedCorridor,
      selectedVehiclePlate,
      selectedVehicleModel,
      avalancheMetrics.avalancheRiskTier,
      avalancheMetrics.stabilityIndexSn,
      simSnowDepthCm,
      selectedCorridor.activeExploderReady
    );
    setCurrentCert(cert);
    setCertificates((prev) => [cert, ...prev]);
    setActiveTab('certificate');
  };

  // Copy to clipboard helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // Filter corridors by radar search
  const filteredCorridors = useMemo(() => {
    if (!radarSearchQuery.trim()) return MOCK_ALPINE_CORRIDORS;
    const q = radarSearchQuery.toLowerCase();
    return MOCK_ALPINE_CORRIDORS.filter(
      (c) =>
        c.nameAz.toLowerCase().includes(q) ||
        c.regionAz.toLowerCase().includes(q) ||
        c.roadCode.toLowerCase().includes(q)
    );
  }, [radarSearchQuery]);

  // Filter public registry
  const filteredRegistry = useMemo(() => {
    if (!registrySearch.trim()) return certificates;
    const q = registrySearch.toLowerCase();
    return certificates.filter(
      (c) =>
        c.certificateUid.toLowerCase().includes(q) ||
        c.vehiclePlate.toLowerCase().includes(q) ||
        c.corridorNameAz.toLowerCase().includes(q)
    );
  }, [certificates, registrySearch]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col h-[90vh] max-h-[850px] bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-950 px-6 py-4 border-b border-cyan-800/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/20 rounded-lg border border-cyan-400/40 text-cyan-300">
              <Mountain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  AAYDA, FHN & BDYP AVALANCHE-SAFE-AZ-2026
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 rounded-full">
                  SCADA Qar Uçqunu Portalı
                </span>
              </div>
              <p className="text-xs text-cyan-200/80">
                Yüksək Dağlıq Magistral Yollarda Qar Uçqunu, Çovğun, Gazex RACS və Şüşəvari Buzlaşma SCADA Monitorinqi
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-1 rounded bg-slate-800/80 text-cyan-300 border border-cyan-500/30 font-mono">
              SİMA E-İmza 2026
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-800/90 border-b border-slate-700 px-4 space-x-1 overflow-x-auto flex-shrink-0">
          {[
            { id: 'radar', label: 'Dağ Aşırımları Radarı', icon: Mountain },
            { id: 'scada', label: 'SCADA Telemetriya & Gazex', icon: Sliders },
            { id: 'calculator', label: 'Tormoz Fizikası & Cərimələr', icon: Gauge },
            { id: 'checklist', label: 'Qış Texniki Yoxlanışı (10)', icon: CheckCircle2 },
            { id: 'exam', label: 'Qar Qaydaları İmtahanı', icon: HelpCircle },
            { id: 'certificate', label: 'Rəsmi Keçid Şəhadətnaməsi', icon: FileText },
            { id: 'registry', label: 'Vahid Dövlət Reyestri', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AvalancheTabId)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/50 p-3.5 rounded-lg border border-slate-700">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={radarSearchQuery}
                    onChange={(e) => setRadarSearchQuery(e.target.value)}
                    placeholder="Dağ aşırımı, rayon və ya magistral kodunu axtarın (məs: Xınalıq, Şahdağ, Ömər)..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Cəmi 6 Strateji Yüksək Dağ Aşırımı Aktivdir
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredCorridors.map((corridor) => {
                  const isSelected = selectedCorridor.id === corridor.id;
                  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                  let tierLabel = 'Aşağı Risk (Tier 1)';
                  if (corridor.riskTier === 'TIER_5_VERY_HIGH') {
                    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                    tierLabel = 'Fövqəladə Təhlükəli (Tier 5)';
                  } else if (corridor.riskTier === 'TIER_4_HIGH') {
                    badgeColor = 'bg-red-500/20 text-red-300 border-red-500/40';
                    tierLabel = 'Yüksək Risk (Tier 4)';
                  } else if (corridor.riskTier === 'TIER_3_CONSIDERABLE') {
                    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                    tierLabel = 'Nəzərəçarpan (Tier 3)';
                  } else if (corridor.riskTier === 'TIER_2_MODERATE') {
                    badgeColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
                    tierLabel = 'Mülayim (Tier 2)';
                  }

                  return (
                    <div
                      key={corridor.id}
                      onClick={() => handleSelectCorridor(corridor)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-950/40'
                          : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {corridor.roadCode}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {tierLabel}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white mb-1">{corridor.nameAz}</h4>
                      <p className="text-xs text-slate-400 mb-3">{corridor.regionAz}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 mb-3">
                        <div>
                          <span className="text-slate-500 block">Zirvə Hündürlüyü:</span>
                          <span className="font-semibold text-slate-200">{corridor.altitudeMeters} metr</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Yamac Meyilliyi:</span>
                          <span className="font-semibold text-slate-200">{corridor.slopeAngleDeg}° ({corridor.aspectAzimuth})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Qar Dərinliyi:</span>
                          <span className="font-semibold text-cyan-300">{corridor.currentSnowDepthCm} sm</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Hava Temp / Külək:</span>
                          <span className="font-semibold text-indigo-300">
                            {corridor.ambientTemperatureC}°C / {corridor.windSpeedMs} m/s
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span>Gazex Sayı: {corridor.gazexExplodersCount} ədəd</span>
                        <span
                          className={`font-medium ${
                            corridor.transitStatus === 'CLOSED_EMERGENCY'
                              ? 'text-rose-400'
                              : corridor.transitStatus === 'CHAINS_ONLY_4X4'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {corridor.transitStatus === 'CLOSED_EMERGENCY'
                            ? 'Bağlıdır'
                            : corridor.transitStatus === 'CHAINS_ONLY_4X4'
                            ? '4x4 & Zəncir'
                            : 'Açıqdır'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Corridor Action Bar */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-cyan-800/50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-cyan-300">
                    <Mountain className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-300">Seçilmiş Aktiv Aşırım:</h5>
                    <p className="text-sm font-bold text-white">{selectedCorridor.nameAz}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('scada')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center space-x-1.5"
                  >
                    <span>SCADA İdarəetməsinə Keç</span>
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleGenerateCertificate}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center space-x-1.5"
                  >
                    <span>Keçid İcazəsi Al</span>
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA TELEMETRY & GAZEX */}
          {activeTab === 'scada' && (
            <div className="space-y-4">
              {gazexDetonatedMessage && (
                <div className="bg-emerald-950/80 border border-emerald-500/60 p-3.5 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{gazexDetonatedMessage}</span>
                  </div>
                  <button
                    onClick={() => setGazexDetonatedMessage(null)}
                    className="text-emerald-400 hover:text-white text-xs underline ml-2"
                  >
                    Bağla
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Interactive Telemetry Controls */}
                <div className="lg:col-span-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                    <Sliders className="w-4 h-4" />
                    <span>Canlı Akustik Qar və Meyillik Telemetriyası Sladerləri</span>
                  </h4>

                  {/* Snow Depth Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Qar Örtüyünün Dərinliyi (Hs):</span>
                      <span className="font-mono font-bold text-cyan-400">{simSnowDepthCm} sm</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={220}
                      value={simSnowDepthCm}
                      onChange={(e) => setSimSnowDepthCm(Number(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0 sm (Açıq)</span>
                      <span>50 sm</span>
                      <span>100 sm</span>
                      <span>150 sm</span>
                      <span>220 sm (Kritik Uçqun)</span>
                    </div>
                  </div>

                  {/* Slope Angle Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Yamacın Meyillik Bucağı (θ):</span>
                      <span className="font-mono font-bold text-amber-400">{simSlopeAngleDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={simSlopeAngleDeg}
                      onChange={(e) => setSimSlopeAngleDeg(Number(e.target.value))}
                      className="w-full accent-amber-400 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>10° (Düzənlik)</span>
                      <span>30° (Təhlükə Zonası)</span>
                      <span>38° (Maksimum Uçqun)</span>
                      <span>45°</span>
                      <span>60° (Dik Qayalıq)</span>
                    </div>
                  </div>

                  {/* Weak Layer Shear Strength */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Zəif Qatın Kəsilmə Müqaviməti (τ_f):</span>
                      <span className="font-mono font-bold text-indigo-400">{simWeakLayerKPa} kPa</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={5.0}
                      step={0.1}
                      value={simWeakLayerKPa}
                      onChange={(e) => setSimWeakLayerKPa(Number(e.target.value))}
                      className="w-full accent-indigo-400 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.5 kPa (Çox Kövrək Dənəvər)</span>
                      <span>2.5 kPa</span>
                      <span>5.0 kPa (Monolit Buz Firn)</span>
                    </div>
                  </div>

                  {/* Pavement & Ambient Temperature */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Asfalt Örtüyünün Temp:</span>
                        <span className="font-mono font-bold text-rose-300">{simPavementTempC}°C</span>
                      </div>
                      <input
                        type="range"
                        min={-25}
                        max={10}
                        value={simPavementTempC}
                        onChange={(e) => setSimPavementTempC(Number(e.target.value))}
                        className="w-full accent-rose-400 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Ətraf Havanın Temp:</span>
                        <span className="font-mono font-bold text-blue-300">{simAmbientTempC}°C</span>
                      </div>
                      <input
                        type="range"
                        min={-30}
                        max={10}
                        value={simAmbientTempC}
                        onChange={(e) => setSimAmbientTempC(Number(e.target.value))}
                        className="w-full accent-blue-400 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Surface Condition Selector */}
                  <div className="pt-2">
                    <label className="text-xs text-slate-300 block mb-1.5">Dağ Yolu Örtüyünün Vəziyyəti:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'dry_cold_asphalt', label: 'Quru Asfalt' },
                        { id: 'slush_chemically_treated', label: 'Duzlanmış Qarlı Palçıq' },
                        { id: 'packed_snow_groomed', label: 'Taptanmış Qar Qatı' },
                        { id: 'black_ice_glaze', label: 'Şüşə Buzlaşma (Glaze)' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSimSurface(item.id as AlpineSurfaceCondition)}
                          className={`px-2.5 py-1.5 rounded text-[11px] font-medium border text-center transition-all ${
                            simSurface === item.id
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                              : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Stability Index & Gazex SCADA Detonation Stand */}
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3 flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Qar Stabillik İndeksi ($S_n$)</span>
                    </h4>

                    {/* Stability Gauge Card */}
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 space-y-2.5 text-center">
                      <div className="text-3xl font-mono font-black tracking-tight text-white">
                        {avalancheMetrics.stabilityIndexSn}
                      </div>
                      <div className="text-xs font-semibold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border ${
                            avalancheMetrics.avalancheRiskTier === 'TIER_5_VERY_HIGH'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : avalancheMetrics.avalancheRiskTier === 'TIER_4_HIGH'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : avalancheMetrics.avalancheRiskTier === 'TIER_3_CONSIDERABLE'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : avalancheMetrics.avalancheRiskTier === 'TIER_2_MODERATE'
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {avalancheMetrics.avalancheRiskTier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {avalancheMetrics.stabilityIndexSn < 1.0
                          ? 'TƏHLÜKƏLİ: Lövhəvari kəsilmə gərginliyi müqaviməti üstələyir. Spontan uçqun gözlənilir!'
                          : avalancheMetrics.stabilityIndexSn < 1.5
                          ? 'DİQQƏT: Zəif qat qeyri-sabitdir. Qabaqlayıcı Gazex partladılması tələb olunur.'
                          : 'STABİL: Qar qatı möhkəmdir, spontan uçqun ehtimalı minimumdur.'}
                      </p>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/60">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Qar Ekvivalenti (SWE):</span>
                        <span className="font-mono text-cyan-300">{avalancheMetrics.snowWaterEquivalentMm} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kəsilmə Gərginliyi (τ_g):</span>
                        <span className="font-mono text-amber-300">{avalancheMetrics.slabShearStressKPa} kPa</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tövsiyə Duz Səpki Dozası:</span>
                        <span className="font-mono text-emerald-300">{avalancheMetrics.recommendedAntiIceSaltGm2} q/m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">CaCl2 Maye Reaktiv:</span>
                        <span className="font-mono text-blue-300">{avalancheMetrics.recommendedBrineLitersM2} L/m²</span>
                      </div>
                    </div>
                  </div>

                  {/* Gazex Remote Exploder Trigger */}
                  <div className="bg-gradient-to-br from-rose-950/40 via-red-950/20 to-slate-900 p-3.5 rounded-xl border border-rose-800/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-300">
                        <Flame className="w-4 h-4 text-rose-400" />
                        <span>Gazex RACS SCADA Pultu</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/40 text-rose-200 border border-rose-700/50">
                        Propan-Oksigen Hazır
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Uçqun başlamazdan əvvəl dik dərə kənarında pnevmatik zərbə dalğası ilə qabaqlayıcı boşaltma tətiyi.
                    </p>
                    <button
                      onClick={handleTriggerGazexBlast}
                      disabled={isGazexDetonating}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                        isGazexDetonating
                          ? 'bg-rose-900 text-rose-300 cursor-not-allowed animate-pulse'
                          : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-rose-950/60'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>{isGazexDetonating ? 'Partlayış Həyata Keçirilir...' : 'Gazex Partladıcını İcazəli Boşalt'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STOPPING PHYSICS, DE-ICING & FINES */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Vehicle Preset & Stopping Distance */}
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                    <Car className="w-4 h-4" />
                    <span>Nəqliyyat Vasitəsi və Dağ Tormozlanma Fizikası</span>
                  </h4>

                  {/* Vehicle Presets */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5">Hazır Avtomobil Preseti Seçin:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {MOCK_VEHICLE_ALPINE_PRESETS.map((preset) => (
                        <button
                          key={preset.plate}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-2 rounded text-left border transition-all ${
                            selectedVehiclePlate === preset.plate
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                              : 'bg-slate-900/50 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className="font-mono text-xs font-bold text-white">{preset.plate}</div>
                          <div className="text-[10px] text-slate-400 truncate">{preset.model}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tire Equipment Selector */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5">Təkər və Təhlükəsizlik Təchizatı:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'summer_tires', label: 'Yay Təkərləri (Təhlükəli)' },
                        { id: 'all_season_m_s', label: 'Bütün Fəsil (M+S)' },
                        { id: 'winter_3pmsf', label: 'Qış Təkəri (3PMSF Qar)' },
                        { id: 'studded_or_chains', label: 'Qar Zənciri / Mismarlı' },
                      ].map((tire) => (
                        <button
                          key={tire.id}
                          onClick={() => setSimTires(tire.id as VehicleTireEquipment)}
                          className={`px-3 py-2 rounded text-xs font-medium border text-left transition-all ${
                            simTires === tire.id
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                              : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {tire.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Speed Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Aşırımda Hərəkət Sürəti:</span>
                      <span className="font-mono font-bold text-cyan-400">{simVehicleSpeed} km/s</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={simVehicleSpeed}
                      onChange={(e) => setSimVehicleSpeed(Number(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>10 km/s (Ehtiyatlı)</span>
                      <span>30 km/s (Tövsiyə)</span>
                      <span>60 km/s</span>
                      <span>90 km/s (Təhlükəli)</span>
                    </div>
                  </div>

                  {/* Traction Verdict Box */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">İlişmə Əmsalı (μ):</span>
                      <span className="font-mono font-bold text-amber-300">{avalancheMetrics.frictionCoefficientMu}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Hesablanmış Tam Dayanma Məsafəsi:</span>
                      <span className="font-mono font-bold text-rose-400 text-sm">{avalancheMetrics.stoppingDistanceMeters} metr</span>
                    </div>
                    <div className="pt-1 text-xs">
                      <span
                        className={`font-semibold ${
                          avalancheMetrics.tractionVerdict === 'PROHIBITED'
                            ? 'text-rose-400'
                            : avalancheMetrics.tractionVerdict === 'HAZARDOUS'
                            ? 'text-red-400'
                            : avalancheMetrics.tractionVerdict === 'ACCEPTABLE'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        Qərar: {avalancheMetrics.tractionVerdictDescriptionAz}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Statutory Administrative Violations & Fine Simulator */}
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>İnzibati Xətalar Məcəlləsi (İXM Maddə 353 & 327.1) Cərimə Simulyatoru</span>
                  </h4>

                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calcTransitDefiance}
                        onChange={(e) => setCalcTransitDefiance(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>AAYDA / FHN tərəfindən bağlanmış aşırıma icazəsiz giriş (İXM 353 — 100 AZN + 3 bal)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calcMissingSnowChains}
                        onChange={(e) => setCalcMissingSnowChains(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Tələb olunan dağ aşırımında qar zəncirinin olmaması (İXM 353 — 80 AZN + 2 bal)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calcSafeDistanceViolation}
                        onChange={(e) => setCalcSafeDistanceViolation(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Çovğun və qar toplanışında minimum 70m ara məsafəsinin pozulması (İXM 327.1 — 40 AZN)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calcSpeedExcessBlizzard}
                        onChange={(e) => setCalcSpeedExcessBlizzard(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Aşırımda tövsiyə olunan sürət həddinin 20+ km/s aşılması (İXM 328.1 — 50 AZN + 2 bal)</span>
                    </label>
                  </div>

                  {/* Fine Calculation Display */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Ümumi İnzibati Cərimə Məbləği:</span>
                      <span className="text-lg font-mono font-bold text-rose-400">
                        {violationCalculation.totalFineAzn} AZN
                        {currency !== 'AZN' && ` (~${violationCalculation.totalFineForeign} ${currency})`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                      <span className="text-emerald-300 font-medium">İXM Maddə 38 (30 gün ərzində 50% Endirim):</span>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {violationCalculation.promptDiscountFineAzn} AZN
                        {currency !== 'AZN' && ` (~${violationCalculation.promptDiscountFineForeign} ${currency})`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Tətbiq Edilən Cərimə Balları:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {violationCalculation.penaltyPoints} Bal
                      </span>
                    </div>

                    {violationCalculation.violationsSummaryAz.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                        <span className="text-slate-500 block font-semibold">Protokol Maddələri:</span>
                        {violationCalculation.violationsSummaryAz.map((v, i) => (
                          <div key={i} className="text-rose-300/90">• {v}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    AAYDA & FHN Dağ Aşırımı Qış Təhlükəsizlik Yoxlanışı (10 Bənd)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Sertifikat təsdiqi üçün bütün məcburi bəndlər və minimum 80% uyğunluq tələb olunur.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCheckedItems(MOCK_AVALANCHE_CHECKLIST_ITEMS.map((item) => item.id))}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-all"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                  <button
                    onClick={() => setCheckedItems([])}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-medium transition-all"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Uyğunluq Səviyyəsi:</span>
                  <span className="font-mono font-bold text-cyan-400">{checklistResult.percentage}% ({checklistResult.checkedCount} / {checklistResult.totalCount})</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistResult.isCompliant ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${checklistResult.percentage}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {MOCK_AVALANCHE_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCheckedItems((prev) =>
                          isChecked ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                        );
                      }}
                      className={`cursor-pointer p-3 rounded-lg border transition-all flex items-start space-x-3 ${
                        isChecked
                          ? 'bg-slate-800/80 border-cyan-500/50'
                          : 'bg-slate-900/40 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-xs font-bold text-white">{item.titleAz}</h5>
                          {item.isMandatory && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded">
                              Məcburi
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                            {item.standardRef}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{item.descriptionAz}</p>
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
              <div className="bg-slate-800/50 p-3.5 rounded-lg border border-slate-700 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    BDYP & AAYDA Dağ Aşırımı və Qar Uçqunu Təhlükəsizliyi İmtahanı
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    10 nəzəri sualdan minimum 8-nə düzgün cavab verilməlidir (80% keçid balı).
                  </p>
                </div>
                {examSubmitted && (
                  <div className="text-xs font-bold">
                    Nəticə:{' '}
                    <span className={examResult.isPassed ? 'text-emerald-400' : 'text-rose-400'}>
                      {examResult.scorePercentage}% ({examResult.isPassed ? 'KEÇDİ' : 'KƏSİLDİ'})
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3.5">
                {MOCK_AVALANCHE_EXAM_QUESTIONS.map((q) => {
                  const selectedOpt = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 space-y-2.5"
                    >
                      <h5 className="text-xs font-semibold text-slate-200">
                        {q.id}. {q.questionAz}
                      </h5>
                      <div className="space-y-1.5">
                        {q.optionsAz.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center space-x-2 p-2 rounded text-xs cursor-pointer border transition-all ${
                              selectedOpt === optIdx
                                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200'
                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-900/80'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`exam-question-${q.id}`}
                              checked={selectedOpt === optIdx}
                              onChange={() =>
                                setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                              }
                              className="text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {examSubmitted && (
                        <div className="text-[11px] bg-slate-900 p-2 rounded border border-slate-700 space-y-1 mt-2">
                          <div className={selectedOpt === q.correctIndex ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {selectedOpt === q.correctIndex ? '✓ Düzgün cavab!' : `✗ Səhv cavab. Düzgün variant: ${q.optionsAz[q.correctIndex]}`}
                          </div>
                          <div className="text-slate-400">{q.explanationAz}</div>
                          <div className="text-cyan-300 font-mono text-[10px]">{q.legalBasisAz}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setExamSubmitted(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg text-xs shadow-lg transition-all"
                >
                  İmtahan Cavablarını Təsdiqlə və Qiymətləndir
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/40 shadow-xl max-w-2xl mx-auto space-y-5 print:bg-white print:text-black">
                {/* Certificate Header */}
                <div className="border-b border-cyan-800/60 pb-4 text-center space-y-1">
                  <div className="flex justify-center mb-2">
                    <div className="p-2.5 bg-cyan-500/20 rounded-full border border-cyan-400/50 text-cyan-300">
                      <Mountain className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-wider uppercase">
                    Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA) & FHN
                  </h3>
                  <p className="text-xs text-cyan-300 font-medium">
                    Yüksək Dağlıq Magistral Aşırımı və Qar Uçqunu Təhlükəsizlik Keçid Şəhadətnaməsi
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Rəsmi Elektron Sənəd UID: {currentCert.certificateUid}
                  </p>
                </div>

                {/* Certificate Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-700/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Magistral Aşırımı:</span>
                    <span className="font-semibold text-white">{currentCert.corridorNameAz}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nəqliyyat Vasitəsi:</span>
                    <span className="font-semibold text-white">{currentCert.vehiclePlate} ({currentCert.vehicleModel})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Təhlükə Tieri / Stabillik:</span>
                    <span className="font-semibold text-cyan-300">
                      {currentCert.riskTier} (Sn: {currentCert.measuredStabilityIndex})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Qar Dərinliyi / Gazex:</span>
                    <span className="font-semibold text-emerald-300">
                      {currentCert.snowDepthCm} sm (Gazex Hazır)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Şlaqbaum Buraxılış PIN Kodu:</span>
                    <span className="font-mono font-bold text-lg text-amber-400">{currentCert.passPinCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Qüvvədəolma Müddəti:</span>
                    <span className="font-semibold text-slate-200">{currentCert.issueDate} - {currentCert.expiryDate} (24 saat)</span>
                  </div>
                </div>

                {/* Verdict Banner */}
                <div className="bg-cyan-950/40 p-3 rounded-lg border border-cyan-800/40 text-center">
                  <div className="text-xs font-bold text-cyan-200">{currentCert.transitVerdictAz}</div>
                </div>

                {/* Security Signatures */}
                <div className="border-t border-slate-700 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <div>
                    <div>SİMA UID: {currentCert.simaSignatureUid}</div>
                    <div className="truncate max-w-[280px]">SHA-256: {currentCert.sha256VerificationHash}</div>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 rounded">
                    RƏSMİ TƏSDİQLƏNMİŞDİR
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => handleCopyCode(currentCert.sha256VerificationHash)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-600 flex items-center space-x-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Kopyalandı!' : 'Hash Kopyala'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded shadow flex items-center space-x-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Sənədi Çap Et</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/50 p-3.5 rounded-lg border border-slate-700">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Sertifikat UID, avtomobil nömrəsi və ya aşırım adına görə axtarın..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Qeydiyyatda: {filteredRegistry.length} Sənəd
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredRegistry.map((cert) => (
                  <div
                    key={cert.certificateUid}
                    className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-600 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-cyan-300">
                          {cert.certificateUid}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-amber-300 border border-slate-700">
                          PIN: {cert.passPinCode}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Təsdiqli
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-white">{cert.corridorNameAz}</h5>
                      <p className="text-[11px] text-slate-400">
                        Nəqliyyat: <strong className="text-slate-200">{cert.vehiclePlate}</strong> ({cert.vehicleModel}) | Qüvvədədir: {cert.issueDate} - {cert.expiryDate}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setCurrentCert(cert);
                          setActiveTab('certificate');
                        }}
                        className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white rounded text-xs font-medium border border-cyan-500/40 transition-all"
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
    </Modal>
  );
};
