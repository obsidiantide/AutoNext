import React, { useState, useMemo } from 'react';
import {
  Snowflake,
  Mountain,
  Wind,
  Gauge,
  Truck,
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
  ThermometerSnowflake,
  Sparkles,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  MountainPassId,
  PassOperationalStatus,
  AvalancheHazardLevel,
  DeIcingReagentType,
  DriveType,
  ChainPatternType,
  MachineryType,
  Currency,
  evaluateRwisTelemetry,
  calculateDeIcingRequirements,
  calculateTireChainCompliance,
  dispatchWinterMachinery,
  evaluateWinterChecklist,
  gradeWinterExam,
  generateWinterPassCertificate,
  convertAznTo,
  WinterPassCertificate,
} from '../utils/winterPassCompliance';
import {
  MOCK_MOUNTAIN_PASSES,
  MOCK_RWIS_CONDITIONS,
  MOCK_VEHICLE_WINTER_PRESETS,
  WINTER_SAFETY_CHECKLIST,
  WINTER_EXAM_QUESTIONS,
  MOCK_WINTER_CERTIFICATES,
  VehicleWinterPreset,
} from '../data/mockWinterPassData';

interface WinterPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPassId?: MountainPassId;
}

type ActiveTab = 'radar' | 'deicing' | 'machinery' | 'chains' | 'checklist_exam' | 'certificate';

export const WinterPassModal: React.FC<WinterPassModalProps> = ({
  isOpen,
  onClose,
  initialPassId,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar');
  const [selectedPassId, setSelectedPassId] = useState<MountainPassId>(
    initialPassId || 'm4_agsu_pass'
  );
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('AZN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // De-Icing interactive state
  const [selectedReagent, setSelectedReagent] = useState<DeIcingReagentType>('nacl_salt');
  const [customRoadTempC, setCustomRoadTempC] = useState<number>(-4);
  const [customIceThicknessMm, setCustomIceThicknessMm] = useState<number>(5);
  const [customSegmentLengthKm, setCustomSegmentLengthKm] = useState<number>(20);
  const [customRoadWidthM, setCustomRoadWidthM] = useState<number>(7.5);

  // Machinery dispatch interactive state
  const [selectedMachinery, setSelectedMachinery] = useState<MachineryType>('snow_plow_blade');
  const [dispatchPriority, setDispatchPriority] = useState<'standard' | 'urgent' | 'emergency'>('standard');
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Tire chain interactive state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('prado_4x4');
  const [driveType, setDriveType] = useState<DriveType>('awd_4x4');
  const [chainPattern, setChainPattern] = useState<ChainPatternType>('diamond_steel_12mm');
  const [tireWidthMm, setTireWidthMm] = useState<number>(265);
  const [wheelArchClearanceMm, setWheelArchClearanceMm] = useState<number>(45);

  // Checklist interactive state
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([
    'tire_chains',
    'winter_tires_tread',
    'antifreeze_washer',
    'battery_charge',
    'tow_strap_shackles',
    'full_fuel_tank',
    'exhaust_snow_clearance',
    'emergency_contacts',
  ]);

  // Exam interactive state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate interactive state
  const [certificates, setCertificates] = useState<WinterPassCertificate[]>(MOCK_WINTER_CERTIFICATES);
  const [activeCert, setActiveCert] = useState<WinterPassCertificate>(MOCK_WINTER_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [certPlateInput, setCertPlateInput] = useState<string>('99-FS-101');
  const [certVinInput, setCertVinInput] = useState<string>('JTEBU29J700142851');
  const [registrySearch, setRegistrySearch] = useState<string>('');

  // Selected Mountain Pass object
  const currentPass = useMemo(() => {
    return (
      MOCK_MOUNTAIN_PASSES.find((p) => p.id === selectedPassId) || MOCK_MOUNTAIN_PASSES[0]
    );
  }, [selectedPassId]);

  // Current RWIS conditions for current pass
  const currentRwis = useMemo(() => {
    return MOCK_RWIS_CONDITIONS[selectedPassId] || MOCK_RWIS_CONDITIONS.m4_agsu_pass;
  }, [selectedPassId]);

  // De-Icing calculation result
  const deIcingResult = useMemo(() => {
    return calculateDeIcingRequirements(
      selectedReagent,
      customRoadTempC,
      customIceThicknessMm,
      customSegmentLengthKm,
      customRoadWidthM,
      selectedCurrency
    );
  }, [
    selectedReagent,
    customRoadTempC,
    customIceThicknessMm,
    customSegmentLengthKm,
    customRoadWidthM,
    selectedCurrency,
  ]);

  // Tire chain compliance result
  const chainResult = useMemo(() => {
    return calculateTireChainCompliance(
      driveType,
      chainPattern,
      tireWidthMm,
      wheelArchClearanceMm,
      currentRwis.status
    );
  }, [driveType, chainPattern, tireWidthMm, wheelArchClearanceMm, currentRwis.status]);

  // Machinery dispatch calculation result
  const machineryDispatch = useMemo(() => {
    return dispatchWinterMachinery(
      selectedPassId,
      selectedMachinery,
      currentPass.depotDistanceKm,
      dispatchPriority
    );
  }, [selectedPassId, selectedMachinery, currentPass.depotDistanceKm, dispatchPriority]);

  // Checklist evaluation
  const checklistResult = useMemo(() => {
    return evaluateWinterChecklist(checkedItemIds);
  }, [checkedItemIds]);

  // Correct answer map for exam
  const correctAnswerMap = useMemo(() => {
    const map: Record<number, number> = {};
    WINTER_EXAM_QUESTIONS.forEach((q) => {
      map[q.id] = q.correctOptionIndex;
    });
    return map;
  }, []);

  // Exam result
  const examResult = useMemo(() => {
    return gradeWinterExam(examAnswers, correctAnswerMap);
  }, [examAnswers, correctAnswerMap]);

  // Preset applicator
  const handleApplyPreset = (preset: VehicleWinterPreset) => {
    setSelectedPresetId(preset.id);
    setDriveType(preset.driveType);
    setChainPattern(preset.chainPattern);
    setTireWidthMm(preset.tireWidthMm);
    setWheelArchClearanceMm(preset.wheelArchClearanceMm);
    setCertPlateInput(preset.vehiclePlate);
    setCertVinInput(preset.vin);
  };

  // Toggle checklist item
  const handleToggleChecklist = (id: string) => {
    setCheckedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Handle exam option selection
  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // Generate certificate
  const handleGenerateCertificate = () => {
    const clearanceStatus =
      currentRwis.status === 'full_closure'
        ? 'prohibited_transit'
        : chainResult.compliant
        ? 'cleared_full'
        : 'cleared_chains_only';

    const newCert = generateWinterPassCertificate({
      vehiclePlate: certPlateInput || '99-XX-999',
      vin: certVinInput || 'VIN1234567890ABC',
      passId: selectedPassId,
      passNameAz: currentPass.nameAz,
      passNameEn: currentPass.nameEn,
      driveType,
      tireChainCertified: chainResult.compliant,
      rwisFrictionCoeff: currentRwis.frictionCoeff,
      avalancheRating: currentRwis.avalancheRisk,
      clearanceStatus,
    });

    setCertificates((prev) => [newCert, ...prev]);
    setActiveCert(newCert);
    setActiveTab('certificate');
  };

  // Copy code handler
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Filtered passes for radar
  const filteredPasses = useMemo(() => {
    return MOCK_MOUNTAIN_PASSES.filter((p) => {
      const condition = MOCK_RWIS_CONDITIONS[p.id];
      const matchesSearch =
        p.nameAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.districtAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.highwayCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || (condition && condition.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Filtered certificates for registry
  const filteredCertificates = useMemo(() => {
    if (!registrySearch.trim()) return certificates;
    const q = registrySearch.toLowerCase();
    return certificates.filter(
      (c) =>
        c.certificateId.toLowerCase().includes(q) ||
        c.vehiclePlate.toLowerCase().includes(q) ||
        c.vin.toLowerCase().includes(q) ||
        c.passNameAz.toLowerCase().includes(q)
    );
  }, [certificates, registrySearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
      data-testid="winter-pass-modal"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-cyan-500/20 bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-600/30">
              <Snowflake className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  AAYDA, BDYP & FHN Qış Dağ Aşırımları və Təhlükəsizlik Portalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AAYDA-QAR-2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ağsu, Şahdağ, Murovdağ, Muğanlı, Gədəbəy və Lerik Aşırımları • RWIS Meteoroloji Telemetriya & Zəncir Standartı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setSelectedCurrency(cur)}
                  className={`px-2 py-1 rounded font-medium transition-all ${
                    selectedCurrency === cur
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="winter-pass-modal-close-btn"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/50 overflow-x-auto scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all shrink-0 ${
              activeTab === 'radar'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Aşırımlar Radarı & RWIS</span>
          </button>

          <button
            onClick={() => setActiveTab('deicing')}
            data-testid="tab-deicing"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all shrink-0 ${
              activeTab === 'deicing'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ThermometerSnowflake className="w-4 h-4" />
            <span>Buz Əridici Reagent & Duz</span>
          </button>

          <button
            onClick={() => setActiveTab('machinery')}
            data-testid="tab-machinery"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all shrink-0 ${
              activeTab === 'machinery'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Qar Kürəyən Texnika Dispetçeri</span>
          </button>

          <button
            onClick={() => setActiveTab('chains')}
            data-testid="tab-chains"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all shrink-0 ${
              activeTab === 'chains'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Təkər Zənciri Stendi</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist_exam')}
            data-testid="tab-checklist-exam"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all shrink-0 ${
              activeTab === 'checklist_exam'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>10-Qayda & İmtahan</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all shrink-0 ${
              activeTab === 'certificate'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Elektron Buraxılış & Reyestr</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: PASS RADAR & RWIS SENSORS */}
          {activeTab === 'radar' && (
            <div className="space-y-6" data-testid="tab-content-radar">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Aşırım adı, rayon və ya magistral nömrəsi ilə axtar..."
                    className="w-full bg-slate-800/80 border border-slate-700 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 whitespace-nowrap">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs sm:text-sm rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">Bütün Statuslar</option>
                    <option value="open_all">Tam Açıq</option>
                    <option value="chains_required">Yalnız Zəncirlə</option>
                    <option value="heavy_truck_restricted">TIR-lar üçün Bağlı</option>
                    <option value="full_closure">Tam Bağlı (Uçqun)</option>
                  </select>
                </div>
              </div>

              {/* Passes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPasses.map((pass) => {
                  const rwis = MOCK_RWIS_CONDITIONS[pass.id] || MOCK_RWIS_CONDITIONS.m4_agsu_pass;
                  const isSelected = selectedPassId === pass.id;

                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Açıq
                    </span>
                  );
                  if (rwis.status === 'chains_required') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Zəncir İcbari
                      </span>
                    );
                  } else if (rwis.status === 'heavy_truck_restricted') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> TIR Məhdud
                      </span>
                    );
                  } else if (rwis.status === 'full_closure') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Uçqun (Bağlı)
                      </span>
                    );
                  }

                  return (
                    <div
                      key={pass.id}
                      onClick={() => setSelectedPassId(pass.id)}
                      data-testid={`pass-card-${pass.id}`}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-500'
                          : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                              <Mountain className="w-4 h-4 text-cyan-400 shrink-0" />
                              {pass.nameAz}
                            </h3>
                            <p className="text-xs text-slate-400">{pass.highwayCode}</p>
                          </div>
                          {statusBadge}
                        </div>

                        {/* Telemetry Chips */}
                        <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-slate-400">Yol Hərarəti:</span>
                            <div className="font-semibold text-cyan-300 flex items-center gap-1 mt-0.5">
                              <ThermometerSnowflake className="w-3.5 h-3.5" />
                              {rwis.roadTempC}°C
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Sürtünmə (µ):</span>
                            <div className="font-semibold text-amber-300 flex items-center gap-1 mt-0.5">
                              <Activity className="w-3.5 h-3.5" />
                              {rwis.frictionCoeff.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Qar Qalınlığı:</span>
                            <div className="font-semibold text-slate-200 mt-0.5">
                              {rwis.snowDepthCm} sm
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Uçqun Riski:</span>
                            <div className="font-semibold text-red-400 mt-0.5">
                              Dərəcə {rwis.avalancheRisk}/5
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 italic mb-2">
                          "{rwis.advisoryAz}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs text-slate-400">
                        <span>Hündürlük: {pass.elevationM}m</span>
                        <span>{pass.serpentineTurns} döngə</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Pass Detailed Telemetry Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-cyan-500/40 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                      Canlı RWIS Telemetriya Stansiyası: {currentPass.rwisStationCode}
                    </span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                      <Snowflake className="w-5 h-5 text-cyan-400" />
                      {currentPass.nameAz} ({currentPass.elevationM} m)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Dispetçer Mərkəzi: {currentPass.nearestDepotAz} ({currentPass.depotDistanceKm} km)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Hava Hərarəti</span>
                    <span className="text-base font-bold text-white">{currentRwis.ambientTempC}°C</span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Buz Qalınlığı</span>
                    <span className="text-base font-bold text-cyan-300">{currentRwis.iceThicknessMm} mm</span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Külək Sürəti</span>
                    <span className="text-base font-bold text-slate-200">{currentRwis.windGustKmh} km/saat</span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Görmə Məsafəsi</span>
                    <span className="text-base font-bold text-amber-300">{currentRwis.visibilityM} metr</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Yol İstismar Qaydaları (YHQ Maddə 37): </span>
                    {currentRwis.advisoryAz}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DE-ICING CHEMICAL TREATMENT & SALT CALCULATOR */}
          {activeTab === 'deicing' && (
            <div className="space-y-6" data-testid="tab-content-deicing">
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mb-1">
                  <ThermometerSnowflake className="w-5 h-5 text-cyan-400" />
                  Avtomobil Yollarının Şaxtaya Qarşı Kimyəvi Reagent və Duz Kalkulyatoru
                </h3>
                <p className="text-xs text-slate-400">
                  AAYDA və EN 16811 standartlarına əsasən temperatur, buz qalınlığı və yol sahəsinə görə reagent normasının hesablanması.
                </p>
              </div>

              {/* Reagent Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: 'nacl_salt' as DeIcingReagentType,
                    titleAz: 'Bərk Texniki Duz (NaCl)',
                    tempLimit: '-10°C',
                    price: '0.22 AZN/kq',
                    desc: 'Standart qaya duzu; -10°C-dək buz üçün effektivdir.',
                  },
                  {
                    id: 'cacl2_liquid' as DeIcingReagentType,
                    titleAz: 'Kalsium Xlorid (CaCl₂)',
                    tempLimit: '-25°C',
                    price: '0.65 AZN/kq',
                    desc: 'Sürətli ekzotermik ərimə; dərin şaxtada dərhal təsir edir.',
                  },
                  {
                    id: 'bischofite_mgcl2' as DeIcingReagentType,
                    titleAz: 'Bişofit / MgCl₂ Mineralı',
                    tempLimit: '-30°C',
                    price: '0.85 AZN/kq',
                    desc: 'Ekoloji təmiz təbii mineral; avtomobil kuzovuna zərərsizdir.',
                  },
                  {
                    id: 'sand_salt_mix' as DeIcingReagentType,
                    titleAz: 'Qum-Duz Qarışığı (70/30)',
                    tempLimit: '-15°C',
                    price: '0.08 AZN/kq',
                    desc: 'Aşındırıcı sürtünmə artırıcı; dik serpentine döngələri üçün ideal.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReagent(item.id)}
                    data-testid={`reagent-select-${item.id}`}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                      selectedReagent === item.id
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500'
                        : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs sm:text-sm">{item.titleAz}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-cyan-300 font-mono">
                        {item.tempLimit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{item.desc}</p>
                    <div className="text-xs font-semibold text-emerald-400">{item.price}</div>
                  </div>
                ))}
              </div>

              {/* Sliders Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/60 p-4 sm:p-6 rounded-2xl border border-slate-700">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Yol Səthinin Temperaturu (°C):</span>
                      <span className="font-bold text-cyan-300 font-mono">{customRoadTempC}°C</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="2"
                      step="1"
                      value={customRoadTempC}
                      onChange={(e) => setCustomRoadTempC(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Buz / Şaxta Qalınlığı (mm):</span>
                      <span className="font-bold text-amber-300 font-mono">{customIceThicknessMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={customIceThicknessMm}
                      onChange={(e) => setCustomIceThicknessMm(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">İşləniləcək Yol Sahəsi Uzunluğu (km):</span>
                      <span className="font-bold text-emerald-300 font-mono">{customSegmentLengthKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="1"
                      value={customSegmentLengthKm}
                      onChange={(e) => setCustomSegmentLengthKm(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Yol Hərəkət Zolaqlarının Eni (metr):</span>
                      <span className="font-bold text-slate-200 font-mono">{customRoadWidthM} m</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="15"
                      step="0.5"
                      value={customRoadWidthM}
                      onChange={(e) => setCustomRoadWidthM(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Calculation Summary Cards */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  AAYDA Reagent Sərfiyyatı və Xərc Hesabatı
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-0.5">Reagent Norması</span>
                    <span className="text-base font-bold text-cyan-300 font-mono">
                      {deIcingResult.dosageGm2} q/m²
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-0.5">Ümumi Kütlə</span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      {deIcingResult.totalReagentTons} Ton
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-0.5">Təmizləmə Sahəsi</span>
                    <span className="text-base font-bold text-slate-200 font-mono">
                      {(deIcingResult.coverageAreaM2 / 1000).toFixed(0)} min m²
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-0.5">Ümumi Maliyyə (ƏDV daxil)</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {selectedCurrency === 'AZN' && `${deIcingResult.totalCostAzn} AZN`}
                      {selectedCurrency === 'USD' && `$${deIcingResult.totalCostUsd}`}
                      {selectedCurrency === 'EUR' && `€${deIcingResult.totalCostEur}`}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/80 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Ekoloji və Texniki Təsir: </span>
                    {deIcingResult.environmentalImpactAz}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MACHINERY & HEAVY FLEET DISPATCH */}
          {activeTab === 'machinery' && (
            <div className="space-y-6" data-testid="tab-content-machinery">
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-cyan-400" />
                    AAYDA & FHN Qartəmizləyən Ağır Texnika Donanması və Dispetçer
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aşırıma ən yaxın regional Yol İstismarı İdarəsindən (Yİİ) operativ texnika çağırışı.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Prioritet:</span>
                  <select
                    value={dispatchPriority}
                    onChange={(e) => setDispatchPriority(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-2.5 py-1.5 text-white"
                  >
                    <option value="standard">Standart</option>
                    <option value="urgent">Təcili</option>
                    <option value="emergency">Fövqəladə (FHN)</option>
                  </select>
                </div>
              </div>

              {/* Machinery Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'snow_plow_blade' as MachineryType,
                    titleAz: 'MAN TGS 6x6 Ön Kürəkli Qar Təmizləyən',
                    rate: '90 AZN/saat',
                    speed: '50 km/saat',
                    desc: '3.4m genişlikdə zolaq açır, təzə qar örtüyünü kənara atır.',
                  },
                  {
                    id: 'rotary_snow_blower' as MachineryType,
                    titleAz: 'Ural-4320 Şnek-Rotasion Qar Sovuran (1,500 t/saat)',
                    rate: '140 AZN/saat',
                    speed: '30 km/saat',
                    desc: '2.5 metr hündürlüyündə qar yığınlarını 30 metr kənara sovurur.',
                  },
                  {
                    id: 'salt_brine_spreader' as MachineryType,
                    titleAz: 'Kamaz-6522 Otomatik Duz və Maye Məhlul Səpən',
                    rate: '80 AZN/saat',
                    speed: '45 km/saat',
                    desc: '8 m³ tutumlu çən, 12 metr enində avtomatlaşdırılmış paylama.',
                  },
                  {
                    id: 'fhn_crawler_tractor' as MachineryType,
                    titleAz: 'FHN Komatsu D65 Dağ Tırtıllı Buldozer',
                    rate: '180 AZN/saat',
                    speed: '18 km/saat',
                    desc: 'Ağır qar uçqunu və torpaq sürüşməsi kütləsini təmizləmək üçün.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMachinery(item.id)}
                    data-testid={`machinery-select-${item.id}`}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      selectedMachinery === item.id
                        ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500'
                        : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-cyan-400" />
                        {item.titleAz}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-cyan-300 font-mono">
                        {item.speed}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">{item.desc}</p>
                    <div className="text-xs font-semibold text-emerald-400">{item.rate}</div>
                  </div>
                ))}
              </div>

              {/* Dispatch Action Panel */}
              <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">
                      Seçilmiş Texnika: {machineryDispatch.machineryNameAz}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Təyinat Nöqtəsi: {currentPass.nameAz} • Depo: {currentPass.nearestDepotAz} ({currentPass.depotDistanceKm} km)
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDispatchSuccessMsg(
                        `Texnika uğurla dispetçerləşdirildi! Təxmini çatma müddəti: ${machineryDispatch.etaMinutes} dəqiqə.`
                      );
                      setTimeout(() => setDispatchSuccessMsg(null), 5000);
                    }}
                    data-testid="dispatch-machinery-btn"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Donanmanı Yola Sal</span>
                  </button>
                </div>

                {dispatchSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {dispatchSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-0.5">Təxmini Çatma (ETA)</span>
                    <span className="text-base font-bold text-cyan-300 font-mono">
                      {machineryDispatch.etaMinutes} dəqiqə
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-0.5">Tranzit Sürəti</span>
                    <span className="text-base font-bold text-slate-200 font-mono">
                      {machineryDispatch.transitSpeedKmh} km/saat
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-0.5">Yanacaq Sərfi</span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      {machineryDispatch.fuelConsumptionLiters} Litr Dizel
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-0.5">İstismar Xərci</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {selectedCurrency === 'AZN' && `${machineryDispatch.operationalCostAzn} AZN`}
                      {selectedCurrency === 'USD' && `$${machineryDispatch.operationalCostUsd}`}
                      {selectedCurrency === 'EUR' && `€${machineryDispatch.operationalCostEur}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TIRE CHAINS STAND */}
          {activeTab === 'chains' && (
            <div className="space-y-6" data-testid="tab-content-chains">
              {/* Presets Bar */}
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl">
                <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider block mb-2">
                  Hazır Nəqliyyat Vasitələri Preseti:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_VEHICLE_WINTER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      data-testid={`preset-btn-${preset.id}`}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedPresetId === preset.id
                          ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-sm'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{preset.name.split(' ')[0]}</div>
                      <div className="text-[11px] font-mono text-cyan-400">{preset.vehiclePlate}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chain Config Stand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Configurations */}
                <div className="bg-slate-800/60 border border-slate-700 p-4 sm:p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Ötürücü Ox və Zəncir Növü
                  </h4>

                  {/* Drive Type */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5">Ötürücü Sistemi (Drive Type):</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'fwd' as DriveType, label: 'Ön (FWD)' },
                        { id: 'rwd' as DriveType, label: 'Arxa (RWD)' },
                        { id: 'awd_4x4' as DriveType, label: 'Tam (4WD/AWD)' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setDriveType(t.id)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            driveType === t.id
                              ? 'bg-cyan-600 text-white border-cyan-500 shadow'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chain Pattern */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5">Zəncir Konstruksiyası:</label>
                    <select
                      value={chainPattern}
                      onChange={(e) => setChainPattern(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="diamond_steel_12mm">12mm Polad Romb Zəncir (Ağır Dağ Şəraiti)</option>
                      <option value="diamond_steel_9mm">9mm Polad Romb Zəncir (Krossover/Sedan)</option>
                      <option value="ladder_steel">Pilləkən Tipli Polad Zəncir</option>
                      <option value="textile_snow_socks">Tekstil Qar Corabı (Yalnız Qəza Limp-Home)</option>
                    </select>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Təkər Eni:</span>
                        <span className="font-mono text-cyan-300">{tireWidthMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="165"
                        max="315"
                        step="5"
                        value={tireWidthMm}
                        onChange={(e) => setTireWidthMm(Number(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Təkər Arkası Klirensi (Clearance):</span>
                        <span className="font-mono text-amber-300">{wheelArchClearanceMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="60"
                        step="1"
                        value={wheelArchClearanceMm}
                        onChange={(e) => setWheelArchClearanceMm(Number(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Telemetry & Legal Compliance Output */}
                <div className="bg-slate-900 border border-cyan-500/30 p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase font-bold text-slate-400">
                        YHQ & İXM Maddə 342.1.5 Uyğunluğu
                      </span>
                      {chainResult.compliant ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sertifikatlaşdırılıb
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Qeyri-Məqbul
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block">Quraşdırılmalı Ox:</span>
                        <span className="font-semibold text-white">{chainResult.driveAxlePlacementAz}</span>
                      </div>

                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block">Maksimal İcazə Verilən Sürət Həddi:</span>
                        <span className="font-bold text-amber-300 font-mono">
                          Maksimum {chainResult.maxAllowedSpeedKmh} km/saat (Qanuni Hədd)
                        </span>
                      </div>

                      {chainResult.fineRiskAzn > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl text-red-300">
                          <span className="font-bold">Cərimə Riski: </span>
                          İXM Maddə 342.1.5 üzrə {chainResult.fineRiskAzn} AZN məbləğində inzibati tənbeh.
                        </div>
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      {chainResult.recommendationsAz.map((rec, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                    Qeyd: Aşırımda 4.7 yol nişanı aktiv olduqda zəncirsiz minik maşınlarının hərəkəti qadağandır.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 10-POINT CHECKLIST & 10-QUESTION EXAM */}
          {activeTab === 'checklist_exam' && (
            <div className="space-y-6" data-testid="tab-content-checklist-exam">
              {/* Checklist Section */}
              <div className="bg-slate-800/60 border border-slate-700 p-4 sm:p-6 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-cyan-400" />
                      AAYDA & FHN 10-Mərhələli Qış Dağ Yolu Təhlükəsizlik Yoxlaması
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dağ aşırımına çıxmazdan əvvəl hər bir sürücünün yoxlamalı olduğu həyati tələblər.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-cyan-300">
                      Nəticə: {checklistResult.score}/{checklistResult.total}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        checklistResult.passed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      {checklistResult.passed ? 'MƏQBUL' : 'QEYRİ-MƏQBUL'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {WINTER_SAFETY_CHECKLIST.map((item) => {
                    const isChecked = checkedItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleChecklist(item.id)}
                        data-testid={`checklist-item-${item.id}`}
                        className={`cursor-pointer p-3 rounded-xl border flex items-start gap-3 transition-all ${
                          isChecked
                            ? 'bg-slate-800/90 border-cyan-500/50'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                            isChecked
                              ? 'bg-cyan-600 border-cyan-500 text-white'
                              : 'bg-slate-800 border-slate-600 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>

                        <div className="text-xs flex-1">
                          <p className={`font-medium ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                            {item.labelAz}
                          </p>
                          <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">
                            {item.regulatoryCode}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 10-Question Theoretical Exam Section */}
              <div className="bg-slate-900 border border-cyan-500/30 p-4 sm:p-6 rounded-2xl space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Qış Şəraitində Dağ Sürüşü və Aşırım Qaydaları Test İmtahanı (10 Sual)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Keçid balı: 9/10 (90%) • İXM, YHQ və AAYDA qanunvericilik bazası
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {examSubmitted ? (
                      <button
                        onClick={() => {
                          setExamAnswers({});
                          setExamSubmitted(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Yenidən Başla
                      </button>
                    ) : (
                      <button
                        onClick={() => setExamSubmitted(true)}
                        data-testid="submit-exam-btn"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs sm:text-sm font-semibold shadow"
                      >
                        İmtahanı Tamamla
                      </button>
                    )}
                  </div>
                </div>

                {examSubmitted && (
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
                      examResult.passed
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/40 text-red-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-base block">
                        {examResult.passed ? 'TƏBRİKLƏR! İMTAHANDAN KEÇDİNİZ!' : 'TƏƏSSÜF! KƏSİLDİNİZ!'}
                      </span>
                      <span>
                        Düzgün Cavablar: {examResult.score} / {examResult.total} ({examResult.percentage}%)
                      </span>
                    </div>

                    <div className="text-xs font-semibold">
                      {examResult.passed
                        ? 'Qış dağ aşırımlarında təhlükəsiz sürücülük səlahiyyətiniz təsdiqləndi.'
                        : 'Aşırıma çıxmazdan əvvəl qış təhlükəsizlik qaydalarını təkrar edin.'}
                    </div>
                  </div>
                )}

                {/* Exam Questions List */}
                <div className="space-y-4">
                  {WINTER_EXAM_QUESTIONS.map((q, idx) => {
                    const selectedOption = examAnswers[q.id];
                    const isCorrect = selectedOption === q.correctOptionIndex;

                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-2.5 text-xs"
                      >
                        <div className="font-semibold text-white flex items-start gap-2">
                          <span className="text-cyan-400 font-mono">#{idx + 1}.</span>
                          <span>{q.questionAz}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.optionsAz.map((opt, optIdx) => {
                            let optStyle = 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750';
                            if (selectedOption === optIdx) {
                              optStyle = 'bg-cyan-600/30 border-cyan-500 text-cyan-200';
                            }
                            if (examSubmitted) {
                              if (optIdx === q.correctOptionIndex) {
                                optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                              } else if (selectedOption === optIdx && !isCorrect) {
                                optStyle = 'bg-red-500/20 border-red-500 text-red-300';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                data-testid={`exam-q${q.id}-opt${optIdx}`}
                                className={`text-left p-2.5 rounded-lg border transition-all ${optStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {examSubmitted && (
                          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800 flex items-start gap-1">
                            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-slate-300">İzah ({q.legalCitation}): </strong>
                              {q.explanationAz}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE & PUBLIC REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="tab-content-certificate">
              {/* Form to issue a new certificate */}
              <div className="bg-slate-800/60 border border-slate-700 p-4 sm:p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Yeni Elektron Qış Dağ Aşırımı Buraxılış Vərəqəsi Rəsmiləşdir
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı:</label>
                    <input
                      type="text"
                      value={certPlateInput}
                      onChange={(e) => setCertPlateInput(e.target.value.toUpperCase())}
                      placeholder="99-FS-101"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">VIN Kodu:</label>
                    <input
                      type="text"
                      value={certVinInput}
                      onChange={(e) => setCertVinInput(e.target.value.toUpperCase())}
                      placeholder="JTEBU29J700142851"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleGenerateCertificate}
                      data-testid="generate-cert-btn"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Buraxılış Şəhadətnaməsi Yarat</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Certificate Printable Voucher Layout */}
              <div
                className="bg-slate-950 border-2 border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
                data-testid="certificate-voucher"
              >
                {/* Watermark / Background Glow */}
                <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyan-500/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/40 text-cyan-400">
                      <Snowflake className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                        Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA) & BDYP
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                        RƏSMİ DAĞ AŞIRIMI QIŞ BURAXILIŞ VƏRƏQƏSİ
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">{activeCert.certificateId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleCopyCode(activeCert.certificateId)}
                      data-testid="copy-cert-btn"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
                      title="Nömrəni Kopyala"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedCode ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                    <button
                      onClick={handlePrint}
                      data-testid="print-cert-btn"
                      className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs flex items-center gap-1.5"
                      title="Çap et"
                    >
                      <Printer className="w-4 h-4" />
                      Çap
                    </button>
                  </div>
                </div>

                {/* Voucher Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı</span>
                    <span className="text-sm font-black font-mono text-cyan-300">
                      {activeCert.vehiclePlate}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Aşırım</span>
                    <span className="text-sm font-bold text-white truncate block">
                      {activeCert.passNameAz}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Keçid Statusu</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {activeCert.clearanceStatus === 'cleared_full' && 'Tam İcazə Verilib'}
                      {activeCert.clearanceStatus === 'cleared_chains_only' && 'Yalnız Zəncirlə'}
                      {activeCert.clearanceStatus === 'prohibited_transit' && 'Qadağan Edilib'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Etibarlılıq Müddəti</span>
                    <span className="text-xs font-mono text-slate-300">{activeCert.validUntil}</span>
                  </div>
                </div>

                {/* Telemetry and Security Block */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Yoxlanılmış Zəncir Standartı:</span>
                    <span className="font-semibold text-white">
                      {activeCert.tireChainCertified
                        ? 'ISO 14382 Sertifikatlaşdırılmış Polad Zəncir Təsdiqləndi'
                        : 'Standartlara uyğun olmayan zəncir'}
                    </span>
                    <span className="text-slate-400 block mt-2 mb-0.5">RWIS Sürtünmə Əmsalı:</span>
                    <span className="font-mono text-amber-300">µ = {activeCert.rwisFrictionCoeff}</span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-slate-400">
                    <div>SİMA Rəqəmsal İmza UID: {activeCert.simaDigitalUid}</div>
                    <div>Növbətçi Dispetçer: {activeCert.roadInspectorBadge}</div>
                    <div className="truncate">SHA-256 Checksum: {activeCert.sha256Checksum}</div>
                  </div>
                </div>
              </div>

              {/* Public Registry Search */}
              <div className="bg-slate-800/40 border border-slate-700/80 p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    Vahid İctimai AAYDA Qış Reyestrində Axtarış
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Reyestrdə {filteredCertificates.length} sənəd mövcuddur
                  </span>
                </div>

                <input
                  type="text"
                  value={registrySearch}
                  onChange={(e) => setRegistrySearch(e.target.value)}
                  placeholder="Sənəd №, Nömrə nişanı və ya VIN ilə reyestrdə axtar..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredCertificates.map((cert) => (
                    <div
                      key={cert.certificateId}
                      onClick={() => setActiveCert(cert)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                        activeCert.certificateId === cert.certificateId
                          ? 'bg-cyan-950/40 border-cyan-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono font-bold">{cert.certificateId}</span>
                        <span className="text-slate-400">({cert.vehiclePlate})</span>
                      </div>
                      <span className="text-slate-400">{cert.passNameAz}</span>
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
