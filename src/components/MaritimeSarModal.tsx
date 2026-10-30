import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Copy,
  Printer,
  Search,
  Activity,
  Compass,
  Wind,
  Waves,
  MapPin,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Info,
  Radio,
  Zap,
  Phone,
  Flame,
  Anchor,
  Ship,
  LifeBuoy,
  Eye,
} from 'lucide-react';
import {
  Currency,
  MaritimeSarStationId,
  RescueVesselModelId,
  MaritimeUrgencyCode,
  RESCUE_VESSEL_FLEET,
  MARITIME_URGENCY_INFO,
  calculateMaritimeSarMission,
  evaluateSeaStateConditions,
  issueMaritimeSarCertificate,
  MaritimeSarClearanceCertificate,
  formatCurrency,
} from '../utils/maritimeSarCompliance';
import {
  MOCK_MARITIME_SAR_STATIONS,
  MOCK_INCIDENT_PRESETS,
  MOCK_MARITIME_CHECKLIST,
  MOCK_MARITIME_EXAM,
  MOCK_VERIFIABLE_MARITIME_CERTIFICATES,
} from '../data/mockMaritimeSarData';
import { Vehicle } from '../types/vehicle';

interface MaritimeSarModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

type TabType =
  | 'radar'
  | 'calculator'
  | 'weather'
  | 'fleet'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const MaritimeSarModal: React.FC<MaritimeSarModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Selected Station & Vessel
  const [selectedStationId, setSelectedStationId] = useState<MaritimeSarStationId>('SAR_BAKU_BAY');
  const [selectedVesselId, setSelectedVesselId] = useState<RescueVesselModelId>('DAMEN_PILOT_2205');
  const [selectedUrgencyCode, setSelectedUrgencyCode] = useState<MaritimeUrgencyCode>('CODE_RED_MOB');

  // Mission distance slider (NM)
  const [distanceNm, setDistanceNm] = useState<number>(14);
  const [requiresSpecialDivers, setRequiresSpecialDivers] = useState<boolean>(false);

  // Sea State Telemetry parameters
  const [waveHeightMeters, setWaveHeightMeters] = useState<number>(1.2);
  const [windSpeedKnots, setWindSpeedKnots] = useState<number>(16);
  const [isNightOperation, setIsNightOperation] = useState<boolean>(false);
  const [visibilityNm, setVisibilityNm] = useState<number>(8);
  const [hasFogOrHeavyRain, setHasFogOrHeavyRain] = useState<boolean>(false);
  const [isOffshoreDeepwater, setIsOffshoreDeepwater] = useState<boolean>(false);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Active Issued Certificate state
  const [activeCertificate, setActiveCertificate] = useState<MaritimeSarClearanceCertificate | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Registry search query
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [stationFilterQuery, setStationFilterQuery] = useState<string>('');

  // Selected Station Object
  const selectedStation = useMemo(() => {
    return (
      MOCK_MARITIME_SAR_STATIONS.find((s) => s.id === selectedStationId) ||
      MOCK_MARITIME_SAR_STATIONS[0]
    );
  }, [selectedStationId]);

  // Selected Vessel Object
  const selectedVessel = useMemo(() => {
    return RESCUE_VESSEL_FLEET[selectedVesselId] || RESCUE_VESSEL_FLEET.DAMEN_PILOT_2205;
  }, [selectedVesselId]);

  // Sea State Evaluation
  const seaStateResult = useMemo(() => {
    return evaluateSeaStateConditions({
      waveHeightMeters,
      windSpeedKnots,
      isNightOperation,
      visibilityNauticalMiles: visibilityNm,
      hasFogOrHeavyRain,
      isOffshoreDeepwater,
    });
  }, [waveHeightMeters, windSpeedKnots, isNightOperation, visibilityNm, hasFogOrHeavyRain, isOffshoreDeepwater]);

  // Calculation Result
  const calcResult = useMemo(() => {
    return calculateMaritimeSarMission({
      station: selectedStation,
      vessel: selectedVessel,
      urgencyCode: selectedUrgencyCode,
      distanceNm,
      seaStateResult,
      requiresSpecialDivers,
    });
  }, [selectedStation, selectedVessel, selectedUrgencyCode, distanceNm, seaStateResult, requiresSpecialDivers]);

  // Apply Preset
  const handleApplyPreset = (presetId: string) => {
    const preset = MOCK_INCIDENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedStationId(preset.stationId as MaritimeSarStationId);
    setSelectedVesselId(preset.vesselModelId);
    setSelectedUrgencyCode(preset.urgencyCode);
    setDistanceNm(preset.targetDistanceNm);
    setWaveHeightMeters(preset.waveHeightM);
    setWindSpeedKnots(preset.windSpeedKts);
    setIsNightOperation(preset.isNight);
    setActiveTab('calculator');
  };

  // Toggle Checklist
  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckAll = () => {
    const allChecked: Record<string, boolean> = {};
    MOCK_MARITIME_CHECKLIST.forEach((item) => {
      allChecked[item.id] = true;
    });
    setCheckedItems(allChecked);
  };

  const checklistScore = useMemo(() => {
    const count = Object.values(checkedItems).filter(Boolean).length;
    return {
      count,
      total: MOCK_MARITIME_CHECKLIST.length,
      isComplete: count === MOCK_MARITIME_CHECKLIST.length,
    };
  }, [checkedItems]);

  // Exam Score
  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_MARITIME_EXAM.forEach((q) => {
      if (examAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: MOCK_MARITIME_EXAM.length,
      passed: correct >= 8, // 80% passing grade
      percentage: Math.round((correct / MOCK_MARITIME_EXAM.length) * 100),
    };
  }, [examAnswers]);

  // Issue Certificate
  const handleIssueCertificate = () => {
    const cert = issueMaritimeSarCertificate({
      station: selectedStation,
      vessel: selectedVessel,
      urgencyCode: selectedUrgencyCode,
      calcResult,
      seaStateResult,
      incidentNotes: targetCar
        ? `${targetCar.year} ${targetCar.make} ${targetCar.model} dəniz sahil reydi dəstək təxliyəsi`
        : undefined,
    });
    setActiveCertificate(cert);
    setActiveTab('certificate');
  };

  // Copy code
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Filtered Registry
  const filteredRegistry = useMemo(() => {
    const q = registrySearch.toLowerCase().trim();
    if (!q) return MOCK_VERIFIABLE_MARITIME_CERTIFICATES;
    return MOCK_VERIFIABLE_MARITIME_CERTIFICATES.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.callsign.toLowerCase().includes(q) ||
        c.vesselModel.toLowerCase().includes(q) ||
        c.stationNameAz.toLowerCase().includes(q) ||
        c.casualtyTriageSummary.toLowerCase().includes(q)
    );
  }, [registrySearch]);

  // Filtered Stations
  const filteredStations = useMemo(() => {
    const q = stationFilterQuery.toLowerCase().trim();
    if (!q) return MOCK_MARITIME_SAR_STATIONS;
    return MOCK_MARITIME_SAR_STATIONS.filter(
      (s) =>
        s.nameAz.toLowerCase().includes(q) ||
        s.regionAz.toLowerCase().includes(q) ||
        s.vhfWorkingChannel.toLowerCase().includes(q)
    );
  }, [stationFilterQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      data-testid="maritime-sar-modal"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Anchor className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  DDAA &bull; FHN &bull; DSX
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SOLAS 74/88 &bull; IAMSAR
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Dövlət Dəniz və Liman Agentliyi (DDAA) Xəzər SAR Portalı
              </h2>
              <p className="text-xs text-slate-400">
                Axtarış-Xilasetmə, Bələdçi Katerləri, Sahil Mühafizəsi &amp; Qəza Təxliyə Sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === cur
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="maritime-sar-close-btn"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 scrollbar-none text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            SAR Stansiyaları Radarı
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            Qızıl Saat &amp; Təxliyə Kalkulyatoru
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            data-testid="tab-weather"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Waves className="w-4 h-4 text-blue-400" />
            Dəniz Dalğalanması &amp; Beaufort
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            data-testid="tab-fleet"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Ship className="w-4 h-4 text-indigo-400" />
            Xilasedici Flotiliya
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-emerald-400" />
            SOLAS Yoxlama Vərəqəsi
            {checklistScore.count > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">
                {checklistScore.count}/10
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'exam'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            Dəniz Hüququ İmtahanı
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            SAR-CASPIAN Şəhadətnaməsi
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Search className="w-4 h-4 text-blue-400" />
            Vahid Reyestr
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              {/* Presets Banner */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Operativ Dəniz Təxirəsalınmaz Ssenariləri (Presets)
                  </h3>
                  <span className="text-xs text-slate-400">Bir kliklə simulyasiyanı yükləyin</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {MOCK_INCIDENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      data-testid={`preset-${preset.id}`}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-cyan-300 group-hover:text-cyan-200">
                          {preset.targetDistanceNm} NM &bull; {preset.waveHeightM}m Dalğa
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-xs font-medium text-slate-200 line-clamp-1">{preset.titleAz}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{preset.notesAz}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Station Filter Search */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={stationFilterQuery}
                    onChange={(e) => setStationFilterQuery(e.target.value)}
                    placeholder="Dəniz axtarış-xilasetmə məntəqəsini axtar (ad, region, VHF kanalı)..."
                    data-testid="station-search-input"
                    className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {filteredStations.length} Məntəqə Aktivdir
                </span>
              </div>

              {/* Stations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((st) => {
                  const isSelected = st.id === selectedStationId;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStationId(st.id)}
                      data-testid={`station-card-${st.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50'
                          : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {st.regionAz}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              {st.status === 'ACTIVE_24_7' ? '24/7 Növbətçi' : st.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-snug">{st.nameAz}</h4>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                            isSelected ? 'border-cyan-400 bg-cyan-500' : 'border-slate-500'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 mb-3 line-clamp-2">{st.descriptionAz}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-700/60 text-slate-300">
                        <div>
                          <span className="text-slate-400 block">VHF Fəlakət:</span>
                          <span className="font-mono text-amber-300 font-semibold">{st.vhfEmergencyChannel}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">İşçi Kanal:</span>
                          <span className="font-mono text-cyan-300">{st.vhfWorkingChannel}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Radar Əhatəsi:</span>
                          <span className="font-semibold text-slate-200">{st.radarCoverageNm} Dəniz Mili</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Qaynar Xətt:</span>
                          <span className="font-semibold text-emerald-300">{st.emergencyHotline}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {st.coordinates.dmsString}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStationId(st.id);
                            setActiveTab('calculator');
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5 cursor-pointer"
                        >
                          Seç &amp; Hesabla <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Controls */}
              <div className="lg:col-span-2 space-y-5 bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-700/60">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  Dəniz Təxirəsalınmaz Əməliyyat Parametrləri
                </h3>

                {/* Selected Station Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Çıxış SAR Məntəqəsi (Base Station):
                  </label>
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value as MaritimeSarStationId)}
                    data-testid="select-sar-station"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {MOCK_MARITIME_SAR_STATIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameAz} ({s.regionAz}) - Radar: {s.radarCoverageNm} NM
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vessel Fleet Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Xilasedici Gəmi / Kater Modeli:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Object.keys(RESCUE_VESSEL_FLEET) as RescueVesselModelId[]).map((vKey) => {
                      const v = RESCUE_VESSEL_FLEET[vKey];
                      const isVSelected = vKey === selectedVesselId;
                      return (
                        <div
                          key={vKey}
                          onClick={() => setSelectedVesselId(vKey)}
                          data-testid={`vessel-card-${vKey}`}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isVSelected
                              ? 'bg-cyan-950/40 border-cyan-500 shadow-md'
                              : 'bg-slate-900/70 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white">{v.modelName}</span>
                            <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.2 bg-cyan-950 rounded">
                              {v.maxSpeedKnots} kts
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{v.operator}</p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-300 font-mono">
                            <span>Xərək: {v.stretcherCapacity}</span>
                            <span>&bull;</span>
                            <span>Tutum: {v.rescueCapacitySurvivors} nəfər</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Urgency Triage Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Fövqəladə Triage Dərəcəsi &amp; Qəza Növü:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(Object.keys(MARITIME_URGENCY_INFO) as MaritimeUrgencyCode[]).map((uKey) => {
                      const u = MARITIME_URGENCY_INFO[uKey];
                      const isUSelected = uKey === selectedUrgencyCode;
                      return (
                        <button
                          key={uKey}
                          type="button"
                          onClick={() => setSelectedUrgencyCode(uKey)}
                          data-testid={`urgency-btn-${uKey}`}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isUSelected
                              ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                              : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                            <span>{u.nameAz.split('-')[0]}</span>
                            <span className="text-[10px] text-amber-400 font-mono">
                              &le; {u.goldenHourMinutes} dəq
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{u.descriptionAz}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Distance Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Qəza Məntəqəsinə Məsafə:</span>
                    <span className="font-mono text-cyan-300 text-sm">
                      {distanceNm} Dəniz Mili ({calcResult.distanceKm} km)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={distanceNm}
                    onChange={(e) => setDistanceNm(Number(e.target.value))}
                    data-testid="distance-slider"
                    className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 NM (Sahilyanı)</span>
                    <span>30 NM (Orta Akvatoriya)</span>
                    <span>60 NM (Dərin Xəzər Platformaları)</span>
                  </div>
                </div>

                {/* Toggle Diver Team */}
                <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Dərinlik Qəza Dalğıc Heyəti (Special Diver Team)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Su altında axtarış, qayalıqdan xilasetmə və dekompressiya dəstəyi
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requiresSpecialDivers}
                    onChange={(e) => setRequiresSpecialDivers(e.target.checked)}
                    data-testid="checkbox-divers"
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Real-Time Telemetry & Cost Panel */}
              <div className="space-y-4">
                {/* Golden Hour Status Box */}
                <div
                  className={`p-4 rounded-2xl border text-center ${
                    calcResult.isGoldenHourMet
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-red-950/40 border-red-500/50 text-red-200'
                  }`}
                  data-testid="golden-hour-banner"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {calcResult.isGoldenHourMet ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-bold text-sm">
                      {calcResult.isGoldenHourMet
                        ? 'QIZIL SAAT TƏMİN OLUNUR'
                        : 'QIZIL SAAT HƏDDİ AŞILIR!'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Cəmi reaksiya &amp; çatış müddəti:{' '}
                    <span className="font-bold font-mono text-white text-base">
                      {calcResult.totalMissionTimeMinutes} dəqiqə
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    (Maksimal kritik hədd: {MARITIME_URGENCY_INFO[selectedUrgencyCode].goldenHourMinutes} dəq)
                  </p>
                </div>

                {/* Telemetry Breakdown */}
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-2.5 text-xs text-slate-300">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Dəniz Telemetriya İcmalı
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gəminin Effektiv Sürəti:</span>
                    <span className="font-mono font-semibold text-cyan-300">
                      {calcResult.effectiveSpeedKnots} Knot ({Math.round(calcResult.effectiveSpeedKnots * 1.852)} km/s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dalğa Müqaviməti İtkisi:</span>
                    <span className="font-mono text-amber-400">
                      -{seaStateResult.speedReductionFactorPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hazırlıq &amp; Yanalma Körpüsü:</span>
                    <span className="font-mono text-slate-200">
                      {calcResult.scrambleTimeMinutes} dəqiqə
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dənizdə Keçid (Transit):</span>
                    <span className="font-mono text-slate-200">
                      {calcResult.transitTimeMinutes} dəqiqə
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Təxmini MGO Yanacağı:</span>
                    <span className="font-mono text-slate-200">
                      {calcResult.fuelRequiredLiters} Litr Dizel
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                  <h4 className="font-bold text-white mb-2 flex items-center justify-between">
                    <span>Maliyyə &amp; Dövlət Subsidiyası</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      SOLAS Konvensiyası
                    </span>
                  </h4>
                  <div className="flex justify-between text-slate-400">
                    <span>Xilasedici Kater İcarə/Xərci:</span>
                    <span className="font-mono text-slate-200">
                      {formatCurrency(calcResult.vesselBaseCostAzn, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fövqəladə Reaksiya Əlavəsi:</span>
                    <span className="font-mono text-slate-200">
                      {formatCurrency(calcResult.urgencySurchargeAzn, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tibbi Reanimasiya &amp; Dalğıc:</span>
                    <span className="font-mono text-slate-200">
                      {formatCurrency(calcResult.diverOrMedicalCrewFeeAzn, currency)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex justify-between font-semibold">
                    <span className="text-slate-300">Ümumi Əməliyyat Maya Dəyəri:</span>
                    <span className="font-mono text-slate-100">
                      {formatCurrency(calcResult.subtotalAzn, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Dövlət Subsidiyası ({MARITIME_URGENCY_INFO[selectedUrgencyCode].stateSubsidyPercent}%):</span>
                    <span className="font-mono">
                      -{formatCurrency(calcResult.stateSubsidyAmountAzn, currency)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Ödəniləcək Məbləğ:</span>
                    <span className="text-base font-bold font-mono text-cyan-300">
                      {formatCurrency(calcResult.payableTotalAzn, currency)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic mt-1">
                    * Ticarət Dənizçiliyi Məcəlləsinin 201/215-ci maddələrinə əsasən insan həyatının xilası tamamilə dövlət tərəfindən maliyyələşdirilir (0 ₼).
                  </p>
                </div>

                {/* Dispatch / Issue Button */}
                <button
                  type="button"
                  onClick={handleIssueCertificate}
                  data-testid="issue-sar-cert-btn"
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Ship className="w-4 h-4" />
                  Xilasetmə Çıxışını Təsdiqlə &amp; Şəhadətnamə Al
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WEATHER & BEAUFORT */}
          {activeTab === 'weather' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-5 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  Dəniz Hidrometeoroloji &amp; Dalğa Standı
                </h3>

                {/* Wave height slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Əhəmiyyətli Dalğa Hündürlüyü (Hs):</span>
                    <span className="font-mono text-blue-300 text-sm">
                      {waveHeightMeters} Metr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={waveHeightMeters}
                    onChange={(e) => setWaveHeightMeters(Number(e.target.value))}
                    data-testid="wave-height-slider"
                    className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0.2m (Sakit)</span>
                    <span>1.5m (Mülayim)</span>
                    <span>3.0m (Fırtına)</span>
                    <span>5.0m+ (Qasırğa)</span>
                  </div>
                </div>

                {/* Wind speed slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Küləyin Sürəti:</span>
                    <span className="font-mono text-cyan-300 text-sm">
                      {windSpeedKnots} Knot ({Math.round(windSpeedKnots * 1.852)} km/s)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="1"
                    value={windSpeedKnots}
                    onChange={(e) => setWindSpeedKnots(Number(e.target.value))}
                    data-testid="wind-speed-slider"
                    className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>5 kts (Briz)</span>
                    <span>20 kts (Güclü)</span>
                    <span>35 kts (Xəzri Ştormu)</span>
                    <span>50 kts (Tufan)</span>
                  </div>
                </div>

                {/* Visibility slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Optik Görmə Məsafəsi:</span>
                    <span className="font-mono text-emerald-300 text-sm">
                      {visibilityNm} Dəniz Mili
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={visibilityNm}
                    onChange={(e) => setVisibilityNm(Number(e.target.value))}
                    data-testid="visibility-slider"
                    className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Environmental Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
                  <label className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl cursor-pointer">
                    <span className="text-slate-300">Gecə Əməliyyatı (Night Operation / FLIR tələb olunur):</span>
                    <input
                      type="checkbox"
                      checked={isNightOperation}
                      onChange={(e) => setIsNightOperation(e.target.checked)}
                      data-testid="checkbox-night"
                      className="w-4 h-4 accent-cyan-500 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl cursor-pointer">
                    <span className="text-slate-300">Sıx Duman və ya Güclü Yağış (Heavy Fog / Rain):</span>
                    <input
                      type="checkbox"
                      checked={hasFogOrHeavyRain}
                      onChange={(e) => setHasFogOrHeavyRain(e.target.checked)}
                      data-testid="checkbox-fog"
                      className="w-4 h-4 accent-cyan-500 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl cursor-pointer">
                    <span className="text-slate-300">Açıq Dəniz Dərin Akvatoriya (&gt;50m Dərinlik):</span>
                    <input
                      type="checkbox"
                      checked={isOffshoreDeepwater}
                      onChange={(e) => setIsOffshoreDeepwater(e.target.checked)}
                      data-testid="checkbox-offshore"
                      className="w-4 h-4 accent-cyan-500 rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Beaufort Evaluation Card */}
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        Bofort Şkalası (WMO)
                      </span>
                      <h4 className="text-2xl font-bold text-white flex items-center gap-2">
                        {seaStateResult.beaufortScale} Bal
                        <span className="text-xs font-normal text-slate-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                          {seaStateResult.condition}
                        </span>
                      </h4>
                    </div>
                    <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-300">
                      <Waves className="w-8 h-8" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                    {seaStateResult.operationalRiskAz}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                      <span className="text-slate-400 block mb-1">FLIR Termal Kamera:</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          seaStateResult.flirThermalRequired ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {seaStateResult.flirThermalRequired ? 'Məcburidir' : 'Standart Rejim'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                      <span className="text-slate-400 block mb-1">Maks. Təhlükəsiz Sürət:</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {seaStateResult.maxRecommendedCraftSpeedKnots} Knot
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs">
                    <span className="text-slate-400 block mb-1">Xilasedici Kater Uyğunluğu:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Damen Stan Pilot 2205: Beaufort 7-dək (2.5m dalğa) tam təhlükəsiz
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        SAR Interceptor 1606: 35 knotadək çevik patrul və sürətli hədəf tutma
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        AP1-88 Hovercraft: Dayazlıq və buz sahələri üçün 100% amfibiya
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Caspian Fire Tug 60: Ağır fırtına (Beaufort 9+) və FiFi-1 yanğınsöndürmə
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FLEET */}
          {activeTab === 'fleet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(RESCUE_VESSEL_FLEET) as RescueVesselModelId[]).map((vKey) => {
                const v = RESCUE_VESSEL_FLEET[vKey];
                return (
                  <div
                    key={vKey}
                    className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/70 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded">
                          {v.builder}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">{v.modelName}</h4>
                        <p className="text-xs text-slate-400">{v.operator}</p>
                      </div>
                      <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300">
                        <Ship className="w-6 h-6" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">{v.descriptionAz}</p>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-slate-700/60">
                      <div className="p-2 bg-slate-900/60 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Maks. Sürət:</span>
                        <span className="font-mono font-bold text-cyan-300">{v.maxSpeedKnots} Knot</span>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Kruiz Sürəti:</span>
                        <span className="font-mono font-bold text-slate-200">{v.cruiseSpeedKnots} Knot</span>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Uzunluq/En:</span>
                        <span className="font-mono text-slate-200">{v.lengthMeters}m / {v.beamMeters}m</span>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Xərək Tutumu:</span>
                        <span className="font-bold text-emerald-300">{v.stretcherCapacity} Xərək</span>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Xilas Tutumu:</span>
                        <span className="font-bold text-slate-200">{v.rescueCapacitySurvivors} Nəfər</span>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">MGO Yanacaq:</span>
                        <span className="font-mono text-amber-300">{v.fuelBurnLitersPerHour} L/saat</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Baza Saatlıq Tarif: <strong className="text-white">{formatCurrency(v.baseHourlyRateAzn, currency)}/saat</strong>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedVesselId(vKey);
                          setActiveTab('calculator');
                        }}
                        className="px-3 py-1 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        Bu Kateri Seç
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-emerald-400" />
                    10 Bəndlik SOLAS &amp; Dəniz Axtarış-Xilasetmə Texniki Yoxlama Vərəqəsi
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hər bir çıxışdan öncə GMDSS, peyk mayakı və reanimasiya avadanlıqlarının audit balı
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Tamamlanma:</span>
                    <span className="font-bold text-base font-mono text-emerald-400">
                      {checklistScore.count} / {checklistScore.total}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckAll}
                    data-testid="check-all-btn"
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_MARITIME_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Controlled via card click
                        className="mt-1 w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-white">{item.titleAz}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.descriptionAz}</p>
                        <p className="text-[10px] text-cyan-400/80 font-mono">{item.regulatoryRef}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    Dəniz Nəqliyyat Hüququ &amp; IAMSAR Reqlamenti İmtahan Simulyatoru
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ticarət Dənizçiliyi Məcəlləsi (Maddə 201, 215) və SOLAS Konvensiyası üzrə 10 test sualı
                  </p>
                </div>
                {isExamSubmitted && (
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                      examScore.passed
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                        : 'bg-red-950/40 border-red-500 text-red-300'
                    }`}
                    data-testid="exam-result-badge"
                  >
                    Nəticə: {examScore.correct}/{examScore.total} ({examScore.percentage}%) -{' '}
                    {examScore.passed ? 'KEÇDİ' : 'KƏSİLDİ'}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_MARITIME_EXAM.map((q, qIndex) => {
                  const selectedOpt = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <p className="text-xs font-semibold text-slate-100">{q.questionAz}</p>
                      </div>

                      <div className="space-y-1.5 pl-7">
                        {q.optionsAz.map((opt, optIndex) => {
                          const isOptionSelected = selectedOpt === optIndex;
                          let optStyle = 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800';

                          if (isExamSubmitted) {
                            if (optIndex === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isOptionSelected && optIndex !== q.correctOptionIndex) {
                              optStyle = 'bg-red-950/50 border-red-500 text-red-200';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'bg-purple-950/50 border-purple-500 text-purple-200 font-semibold';
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => {
                                if (!isExamSubmitted) {
                                  setExamAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
                                }
                              }}
                              data-testid={`exam-option-${q.id}-${optIndex}`}
                              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${optStyle}`}
                            >
                              <span className="font-mono mr-2">{String.fromCharCode(65 + optIndex)})</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="mt-2 pl-7 text-[11px] bg-slate-900/80 p-3 rounded-lg border border-slate-700 space-y-1">
                          <p className="text-slate-300 font-medium">{q.explanationAz}</p>
                          <p className="text-cyan-400 font-mono text-[10px]">İstinad: {q.regulatoryBasis}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Reset Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                {isExamSubmitted ? (
                  <button
                    onClick={() => {
                      setIsExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    data-testid="reset-exam-btn"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    İmtahanı Yenidən Başlat
                  </button>
                ) : (
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    data-testid="submit-exam-btn"
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer"
                  >
                    Cavabları Təsdiqlə &amp; Qiymətləndir
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="max-w-3xl mx-auto space-y-5">
              {activeCertificate ? (
                <div
                  className="bg-slate-950 p-6 sm:p-8 rounded-2xl border-2 border-cyan-500/50 shadow-2xl space-y-6 text-slate-200"
                  data-testid="active-certificate-view"
                >
                  {/* Top Seal / Header */}
                  <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400">
                        <Anchor className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                          Azərbaycan Respublikası Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
                          Dövlət Dəniz və Liman Agentliyi (DDAA)
                        </h3>
                        <p className="text-xs text-slate-400">
                          Xəzər Dənizi Fövqəladə Xilasetmə və Bələdçi Çıxış Şəhadətnaməsi
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Qeydiyyat Kodu:</span>
                      <span className="font-mono font-bold text-cyan-300 text-sm">
                        {activeCertificate.certificateNumber}
                      </span>
                    </div>
                  </div>

                  {/* Body Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 block">Çağırış Siqnalı / Kater:</span>
                      <span className="font-bold text-white">{activeCertificate.callsign}</span>
                      <p className="text-cyan-300 text-[11px]">{activeCertificate.vesselModel}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 block">İstismarçı Qurum:</span>
                      <span className="font-bold text-white">{activeCertificate.operator}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 block">Çıxış Məntəqəsi:</span>
                      <span className="font-bold text-white">{activeCertificate.stationNameAz}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 block">Qəza Koordinatları / Məsafə:</span>
                      <span className="font-mono text-amber-300">{activeCertificate.incidentLocationDms}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 block">Triage Dərəcəsi &amp; Status:</span>
                      <span className="font-semibold text-white">{activeCertificate.casualtyTriageSummary}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 block">Qızıl Saat Göstəricisi:</span>
                      <span className="font-bold text-emerald-400">{activeCertificate.goldenHourStatus}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 block">Effektiv Sürət / Dalğa:</span>
                      <span className="font-mono text-slate-200">
                        {activeCertificate.effectiveSpeedKnots} Knot &bull; {activeCertificate.beaufortScale} Bal Bofort
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 block">Dövlət Ödəniş Subsidiyası:</span>
                      <span className="font-bold text-emerald-400">
                        {activeCertificate.stateSubsidyPercent}% Dövlət Zəmanəti (Ödənişsiz)
                      </span>
                    </div>
                  </div>

                  {/* SİMA Seal & Checksum */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">SİMA İmza İdentifikatoru:</span>
                      <span className="font-mono text-cyan-300">{activeCertificate.simaDigitalUid}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Baş Xilasedici / Komandir:</span>
                      <span className="font-semibold text-white">{activeCertificate.missionCommanderName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 break-all pt-1 border-t border-slate-800">
                      SHA256 CHECKSUM: {activeCertificate.cryptographicSha256}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => handleCopyCode(activeCertificate.certificateNumber)}
                      data-testid="copy-cert-btn"
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-cyan-400" />
                      {copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}
                    </button>

                    <button
                      onClick={handlePrint}
                      data-testid="print-cert-btn"
                      className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Çap Et / PDF Saxla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 bg-slate-800/30 rounded-2xl border border-slate-700/50 space-y-3">
                  <Anchor className="w-12 h-12 text-slate-500 mx-auto" />
                  <h4 className="text-base font-bold text-white">Aktiv Şəhadətnamə Mövcud Deyil</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Kalkulyator bölməsindən çıxış parametrlərini seçərək rəsmi SAR-CASPIAN-AZ-2026 şəhadətnaməsini generasiya edin.
                  </p>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Kalkulyatora Keç
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    Vahid Dəniz Axtarış-Xilasetmə (SAR) Əməliyyatları Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    DDAA, FHN və Sahil Mühafizəsi tərəfindən icra edilmiş rəsmi qeydiyyatdan keçmiş SAR missiyaları
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Şəhadətnamə №, kater və ya stansiya..."
                    data-testid="registry-search-input"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredRegistry.map((cert) => (
                  <div
                    key={cert.certificateNumber}
                    data-testid={`registry-card-${cert.certificateNumber}`}
                    className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300">
                          {cert.certificateNumber}
                        </span>
                        <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded text-[10px]">
                          {cert.callsign}
                        </span>
                        <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px]">
                          {cert.goldenHourStatus}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(cert.issuedAt).toLocaleDateString('az-AZ')}
                      </span>
                    </div>

                    <p className="text-slate-200 font-medium">{cert.casualtyTriageSummary}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                      <div>
                        <span>Stansiya: </span>
                        <strong className="text-slate-200">{cert.stationNameAz}</strong>
                      </div>
                      <div>
                        <span>Model: </span>
                        <strong className="text-slate-200">{cert.vesselModel}</strong>
                      </div>
                      <div>
                        <span>Məsafə / Sürət: </span>
                        <strong className="text-slate-200">
                          {cert.distanceNm} NM ({cert.effectiveSpeedKnots} kts)
                        </strong>
                      </div>
                      <div>
                        <span>Dövlət Subsidiyası: </span>
                        <strong className="text-emerald-400">100% Zəmanətli</strong>
                      </div>
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
