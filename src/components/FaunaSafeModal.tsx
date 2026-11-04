import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
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
  Compass,
  ArrowRight,
  Radio,
  Zap,
  Info,
  Clock,
  Award,
  Lock,
  Flame,
  Truck,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin,
  Eye,
  Trees,
} from 'lucide-react';
import {
  Currency,
  FaunaEcoStation,
  FaunaVehiclePreset,
  FaunaTargetSpecies,
  FaunaCertificate,
  convertFaunaSafeCurrency,
  FAUNA_SAFE_CURRENCY_SYMBOLS,
  calculateFaunaRisk,
  evaluateFaunaChecklist,
  evaluateFaunaExam,
  generateFaunaCertificate,
  searchFaunaRegistry,
  FAUNA_RESTITUTION_RATES,
} from '../utils/faunaSafeCompliance';
import {
  MOCK_FAUNA_ECO_STATIONS,
  MOCK_FAUNA_VEHICLE_PRESETS,
  MOCK_FAUNA_CHECKLIST_ITEMS,
  MOCK_FAUNA_EXAM_QUESTIONS,
  MOCK_FAUNA_CERTIFICATES,
} from '../data/mockFaunaSafeData';

export interface FaunaSafeModalProps {
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

export const FaunaSafeModal: React.FC<FaunaSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);
  const [selectedStation, setSelectedStation] = useState<FaunaEcoStation>(MOCK_FAUNA_ECO_STATIONS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<FaunaVehiclePreset>(MOCK_FAUNA_VEHICLE_PRESETS[0]);
  const [selectedSpecies, setSelectedSpecies] = useState<FaunaTargetSpecies>(MOCK_FAUNA_ECO_STATIONS[0].primarySpecies);

  // Simulator inputs
  const [vehicleSpeedKmh, setVehicleSpeedKmh] = useState<number>(selectedVehicle.defaultSpeedKmh);
  const [animalDistanceM, setAnimalDistanceM] = useState<number>(75);
  const [animalMassKg, setAnimalMassKg] = useState<number>(180);
  const [roadFrictionMu, setRoadFrictionMu] = useState<number>(0.75);
  const [ambientIlluminanceLux, setAmbientIlluminanceLux] = useState<number>(10);
  const [acousticDeterrentEnabled, setAcousticDeterrentEnabled] = useState<boolean>(true);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    MOCK_FAUNA_CHECKLIST_ITEMS.forEach((it) => {
      init[it.id] = true;
    });
    return init;
  });

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [generatedCert, setGeneratedCert] = useState<FaunaCertificate>(MOCK_FAUNA_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Public Registry
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryRecords, setRegistryRecords] = useState<FaunaCertificate[]>(MOCK_FAUNA_CERTIFICATES);

  // Web Audio buzzer state
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);

  // Handle station selection
  const handleSelectStation = (st: FaunaEcoStation) => {
    setSelectedStation(st);
    setSelectedSpecies(st.primarySpecies);
    if (st.primarySpecies === 'BROWN_BEAR') setAnimalMassKg(250);
    else if (st.primarySpecies === 'RED_DEER') setAnimalMassKg(200);
    else if (st.primarySpecies === 'WILD_BOAR') setAnimalMassKg(140);
    else if (st.primarySpecies === 'STEPPE_GAZELLE') setAnimalMassKg(40);
    else if (st.primarySpecies === 'ROE_DEER') setAnimalMassKg(35);
  };

  // Handle vehicle selection
  const handleSelectVehicle = (veh: FaunaVehiclePreset) => {
    setSelectedVehicle(veh);
    setVehicleSpeedKmh(veh.defaultSpeedKmh);
  };

  // Calculation results
  const calcResult = useMemo(() => {
    return calculateFaunaRisk(
      {
        vehicleSpeedKmh,
        animalDistanceM,
        animalMassKg,
        roadFrictionMu,
        ambientIlluminanceLux,
        acousticDeterrentEnabled,
      },
      selectedSpecies,
      selectedVehicle.violationType
    );
  }, [
    vehicleSpeedKmh,
    animalDistanceM,
    animalMassKg,
    roadFrictionMu,
    ambientIlluminanceLux,
    acousticDeterrentEnabled,
    selectedSpecies,
    selectedVehicle.violationType,
  ]);

  // Audio warning synthesizer
  const playScadaDeterrentAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = calcResult.impactOccurs ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(calcResult.impactOccurs ? 880 : 520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(calcResult.impactOccurs ? 440 : 1040, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
      setAudioPlayed(true);
      setTimeout(() => setAudioPlayed(false), 800);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  // Checklist evaluation
  const checklistEval = useMemo(() => {
    return evaluateFaunaChecklist(checkedItems, MOCK_FAUNA_CHECKLIST_ITEMS);
  }, [checkedItems]);

  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllChecklist = () => {
    const all: Record<string, boolean> = {};
    MOCK_FAUNA_CHECKLIST_ITEMS.forEach((it) => {
      all[it.id] = true;
    });
    setCheckedItems(all);
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
  };

  // Exam evaluation
  const examEval = useMemo(() => {
    return evaluateFaunaExam(examAnswers, MOCK_FAUNA_EXAM_QUESTIONS);
  }, [examAnswers]);

  const handleSelectExamAnswer = (questionId: string, optIndex: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optIndex }));
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setExamSubmitted(false);
  };

  // Certificate generation
  const handleGenerateCertificate = () => {
    const newCert = generateFaunaCertificate(
      selectedStation,
      selectedVehicle,
      calcResult,
      selectedSpecies
    );
    setGeneratedCert(newCert);
    setRegistryRecords((prev) => [newCert, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopyCertificate = () => {
    if (!generatedCert) return;
    const text = `AAYDA, ETSN & BDYP FAUNA-SAFE-AZ-2026 SERTİFİKATI:
Qeydiyyat No: ${generatedCert.certificateId}
Stansiya: ${generatedCert.stationName} (${generatedCert.stationCode})
Dəhliz: ${generatedCert.corridor}
Nəqliyyat: ${generatedCert.vehiclePlate} (${generatedCert.vehicleModel})
Vəhşi Fauna: ${generatedCert.targetSpecies}
AVC Qəza Riski: ${generatedCert.avcRiskScore}%
Status: ${generatedCert.statusRating}
SİMA UID: ${generatedCert.simaDigitalUid}
Doğrulama PIN: ${generatedCert.verificationPin}
Tarix: ${generatedCert.issueTimestamp}`;

    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // Filter registry
  const filteredRegistry = useMemo(() => {
    return searchFaunaRegistry(registrySearch, registryRecords);
  }, [registrySearch, registryRecords]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      data-testid="fauna-safe-modal"
    >
      <div className="relative w-full max-w-6xl bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative px-5 py-4 border-b border-emerald-500/20 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <Trees className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AAYDA • ETSN • BDYP
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  EN 14389-1 • AR NK 410
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/50 flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
                  SCADA Canlı Telemetriya
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                Magistral Vəhşi Heyvan Keçidləri və Eko-Dukt Portalı
                <span className="text-xs font-normal text-emerald-400/80 hidden sm:inline">
                  (FAUNA-SAFE-AZ-2026)
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs font-semibold">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedCurrency === curr
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              data-testid="fauna-safe-close-btn"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'radar'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            Eko-Dukt Radarı ({MOCK_FAUNA_ECO_STATIONS.length})
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            data-testid="tab-simulator"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'simulator'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-teal-400" />
            SCADA Simulyator Standı
          </button>

          <button
            onClick={() => setActiveTab('sanctions')}
            data-testid="tab-sanctions"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'sanctions'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-4 h-4 text-amber-400" />
            Nəqliyyat & İXM / ETSN
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'checklist'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            Texniki Audit ({checklistEval.percentage}%)
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'exam'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4 text-purple-400" />
            Nəzəri İmtahan (10 Sual)
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'certificate'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            E-Sertifikat
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'registry'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4 text-indigo-400" />
            Dövlət Reyestri
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: RADAR / ECO-DUCT CORRIDORS */}
          {activeTab === 'radar' && (
            <div className="space-y-6" data-testid="fauna-radar-view">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-400" />
                    Azərbaycan Magistral Eko-Dukt və Vəhşi Təbiət Dəhlizləri Radarı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    AAYDA və ETSN tərəfindən idarə olunan 6 strateji meşə-dağ keçidi, FLIR termal optikaları və avtomatlaşdırılmış heyvan qovucu akustik sistemlər.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    6 Aktiv Dəhliz
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold">
                    102.9 km Hasar Şəbəkəsi
                  </span>
                </div>
              </div>

              {/* Grid of Stations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_FAUNA_ECO_STATIONS.map((st) => {
                  const isSelected = selectedStation.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleSelectStation(st)}
                      data-testid={`station-card-${st.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-950/70 to-slate-900 border-emerald-400 ring-2 ring-emerald-500/30 shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {st.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              st.sensorStatus === 'ONLINE_NOMINAL'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : st.sensorStatus === 'ANIMAL_APPROACH_DETECTED'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                            }`}
                          >
                            {st.sensorStatus}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                          {st.nameAz}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {st.corridor}
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Piket & Tip</span>
                            <span className="font-semibold text-slate-200">
                              {st.picketKm} • {st.crossingType.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Qorunan Fauna</span>
                            <span className="font-semibold text-emerald-400">
                              {st.primarySpecies}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                          <span>Hasar: {st.fenceLengthKm} km</span>
                          <span>Ort. Keçid: {st.dailyCrossingsAverage} heyvan/gün</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">İnşa: {st.installedYear}-ci il</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectStation(st);
                            setActiveTab('simulator');
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold transition-colors flex items-center gap-1"
                        >
                          Simulyasiya <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SCADA SIMULATOR STAND */}
          {activeTab === 'simulator' && (
            <div className="space-y-6" data-testid="fauna-simulator-view">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sliders & Parameters Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        SCADA Telemetriya Parametrləri
                      </h4>
                      <button
                        onClick={playScadaDeterrentAudio}
                        data-testid="audio-btn"
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                          audioPlayed
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Akustik Xəbərdarlıq Sireni Yoxla"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Səs Sınağı
                      </button>
                    </div>

                    {/* Species selector */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1.5">
                        Hədəf Fauna Növü:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                        {(
                          [
                            'RED_DEER',
                            'BROWN_BEAR',
                            'WILD_BOAR',
                            'ROE_DEER',
                            'STEPPE_GAZELLE',
                            'DOMESTIC_CATTLE',
                          ] as FaunaTargetSpecies[]
                        ).map((sp) => (
                          <button
                            key={sp}
                            onClick={() => {
                              setSelectedSpecies(sp);
                              if (sp === 'BROWN_BEAR') setAnimalMassKg(250);
                              else if (sp === 'RED_DEER') setAnimalMassKg(200);
                              else if (sp === 'WILD_BOAR') setAnimalMassKg(140);
                              else if (sp === 'STEPPE_GAZELLE') setAnimalMassKg(40);
                              else if (sp === 'ROE_DEER') setAnimalMassKg(35);
                              else if (sp === 'DOMESTIC_CATTLE') setAnimalMassKg(450);
                            }}
                            className={`p-1.5 rounded-lg border text-center transition-all ${
                              selectedSpecies === sp
                                ? 'bg-emerald-600 text-white border-emerald-400'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {sp.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vehicle Speed Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Avtomobilin Sürəti:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {vehicleSpeedKmh} km/saat
                        </span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="140"
                        step="5"
                        value={vehicleSpeedKmh}
                        onChange={(e) => setVehicleSpeedKmh(Number(e.target.value))}
                        data-testid="slider-speed"
                        className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Animal Distance Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Aşkarlanan Heyvan Məsafəsi:</span>
                        <span className="font-mono font-bold text-teal-400">
                          {animalDistanceM} metr
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="5"
                        value={animalDistanceM}
                        onChange={(e) => setAnimalDistanceM(Number(e.target.value))}
                        data-testid="slider-distance"
                        className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Animal Mass Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Heyvanın Kütləsi:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {animalMassKg} kq
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="500"
                        step="10"
                        value={animalMassKg}
                        onChange={(e) => setAnimalMassKg(Number(e.target.value))}
                        data-testid="slider-mass"
                        className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Road Surface Friction Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Yol Səthi Sürtünmə Əmsalı (μ):</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {roadFrictionMu.toFixed(2)}{' '}
                          {roadFrictionMu > 0.7 ? '(Quru Asfalt)' : '(Yaş / Qar)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.20"
                        max="0.85"
                        step="0.05"
                        value={roadFrictionMu}
                        onChange={(e) => setRoadFrictionMu(Number(e.target.value))}
                        data-testid="slider-friction"
                        className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Ambient Illuminance Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Ətraf İşıqlanma Dərəcəsi:</span>
                        <span className="font-mono font-bold text-indigo-400">
                          {ambientIlluminanceLux} Lux{' '}
                          {ambientIlluminanceLux < 5 ? '(Qatı Gecə)' : '(Gündüz)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="500"
                        step="10"
                        value={ambientIlluminanceLux}
                        onChange={(e) => setAmbientIlluminanceLux(Number(e.target.value))}
                        data-testid="slider-lux"
                        className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Ultrasonic Acoustic Deterrent Toggle */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">
                          20-30 kHz Ultrasəs Sireni
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Yol kənarı akustik qovucu avtomatik rejim
                        </span>
                      </div>
                      <button
                        onClick={() => setAcousticDeterrentEnabled(!acousticDeterrentEnabled)}
                        data-testid="toggle-deterrent"
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                          acousticDeterrentEnabled ? 'bg-emerald-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            acousticDeterrentEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Animated 2D SVG Canvas & Telemetry Display */}
                <div className="lg:col-span-7 space-y-4">
                  {/* SVG Canvas */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 overflow-hidden relative shadow-inner">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                        <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                        SCADA DİNAMİK VƏHŞİ TƏBİƏT TELEMETRİYASI
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {selectedStation.code} • {selectedStation.picketKm}
                      </span>
                    </div>

                    <svg
                      viewBox="0 0 600 240"
                      className="w-full h-56 rounded-lg bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/30 border border-slate-800"
                    >
                      {/* Sky & Mountain Background */}
                      <polygon points="0,110 90,65 180,110 320,50 480,120 600,80 600,140 0,140" fill="#061c14" opacity="0.6" />
                      <polygon points="40,110 160,70 280,110 400,60 550,110 600,95 600,140 0,140" fill="#0b2e22" opacity="0.4" />

                      {/* Eco-Duct Overpass Structure */}
                      <path d="M 220 140 Q 300 30 380 140 Z" fill="#143e2e" stroke="#22c55e" strokeWidth="2" />
                      {/* Vegetation on Eco-Duct */}
                      <rect x="235" y="60" width="130" height="15" rx="5" fill="#166534" />
                      <circle cx="255" cy="55" r="9" fill="#22c55e" opacity="0.8" />
                      <circle cx="280" cy="52" r="11" fill="#15803d" />
                      <circle cx="310" cy="50" r="13" fill="#16a34a" />
                      <circle cx="340" cy="54" r="10" fill="#22c55e" opacity="0.9" />

                      {/* Highway Pavement */}
                      <rect x="0" y="140" width="600" height="90" fill="#0f172a" />
                      {/* Road markings */}
                      <line x1="0" y1="185" x2="600" y2="185" stroke="#e2e8f0" strokeDasharray="25,20" strokeWidth="2" opacity="0.6" />
                      <line x1="0" y1="145" x2="600" y2="145" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />
                      <line x1="0" y1="225" x2="600" y2="225" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />

                      {/* Wildlife Exclusion Fences */}
                      <line x1="0" y1="135" x2="220" y2="135" stroke="#64748b" strokeWidth="2" strokeDasharray="3,3" />
                      <line x1="380" y1="135" x2="600" y2="135" stroke="#64748b" strokeWidth="2" strokeDasharray="3,3" />

                      {/* FLIR Detection Cone from Eco-Duct or Roadside */}
                      <polygon
                        points="300,50 420,195 480,195"
                        fill="rgba(56, 189, 248, 0.12)"
                        stroke="rgba(56, 189, 248, 0.4)"
                        strokeDasharray="4,4"
                      />

                      {/* Acoustic Deterrent Waves if enabled */}
                      {acousticDeterrentEnabled && (
                        <g>
                          <circle cx="300" cy="65" r="30" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" />
                          <circle cx="300" cy="65" r="50" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.2" />
                        </g>
                      )}

                      {/* Animal Sprite / Silhouette on Road or Crossing */}
                      {/* Animal positioning proportional to animalDistanceM */}
                      {(() => {
                        const animalX = Math.min(540, Math.max(340, 200 + (animalDistanceM / 200) * 320));
                        return (
                          <g transform={`translate(${animalX}, 160)`}>
                            {/* Animal Body (Deer/Bear silhouette) */}
                            <ellipse cx="20" cy="15" rx="16" ry="10" fill={calcResult.impactOccurs ? '#ef4444' : '#eab308'} />
                            <circle cx="35" cy="8" r="6" fill={calcResult.impactOccurs ? '#dc2626' : '#f59e0b'} />
                            {/* Antlers / Ears */}
                            <path d="M 37 3 L 42 -4 M 39 3 L 44 0" stroke={calcResult.impactOccurs ? '#ef4444' : '#fbbf24'} strokeWidth="1.5" />
                            {/* Legs */}
                            <line x1="12" y1="23" x2="10" y2="34" stroke={calcResult.impactOccurs ? '#ef4444' : '#d97706'} strokeWidth="2" />
                            <line x1="18" y1="23" x2="16" y2="34" stroke={calcResult.impactOccurs ? '#ef4444' : '#d97706'} strokeWidth="2" />
                            <line x1="26" y1="23" x2="28" y2="34" stroke={calcResult.impactOccurs ? '#ef4444' : '#d97706'} strokeWidth="2" />
                            <line x1="32" y1="23" x2="34" y2="34" stroke={calcResult.impactOccurs ? '#ef4444' : '#d97706'} strokeWidth="2" />
                            {/* Distance Tag */}
                            <rect x="-5" y="-18" width="55" height="14" rx="3" fill="#0f172a" opacity="0.8" />
                            <text x="22" y="-8" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">
                              {selectedSpecies}
                            </text>
                          </g>
                        );
                      })()}

                      {/* Moving Vehicle on Road */}
                      <g transform="translate(60, 165)">
                        {/* Headlight beam */}
                        <polygon
                          points="60,15 280,0 280,35"
                          fill="rgba(254, 240, 138, 0.15)"
                          stroke="rgba(254, 240, 138, 0.3)"
                          strokeDasharray="3,3"
                        />
                        {/* Vehicle chassis */}
                        <rect x="0" y="5" width="60" height="20" rx="4" fill="#3b82f6" />
                        <rect x="15" y="-3" width="30" height="10" rx="2" fill="#60a5fa" />
                        {/* Wheels */}
                        <circle cx="12" cy="25" r="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                        <circle cx="48" cy="25" r="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                        {/* Vehicle Speed HUD */}
                        <rect x="5" y="-22" width="50" height="15" rx="3" fill="#020617" opacity="0.9" />
                        <text x="30" y="-11" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                          {vehicleSpeedKmh} km/h
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* Telemetry KPIs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Reaksiya Məsafəsi</span>
                      <span className="text-base font-bold text-slate-100">
                        {calcResult.driverReactionDistanceM} m
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        t = {calcResult.driverReactionTimeSec}s
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Əyləc Məsafəsi</span>
                      <span className="text-base font-bold text-teal-400">
                        {calcResult.vehicleBrakingDistanceM} m
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        μ = {roadFrictionMu.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Tam Dayanma Yolu</span>
                      <span
                        className={`text-base font-bold ${
                          calcResult.impactOccurs ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {calcResult.totalStoppingDistanceM} m
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Mövcud: {animalDistanceM} m
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">AVC Qəza Riski</span>
                      <span
                        className={`text-base font-bold ${
                          calcResult.avcRiskScore > 50
                            ? 'text-rose-400'
                            : calcResult.avcRiskScore > 20
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {calcResult.avcRiskScore}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {calcResult.statusRating}
                      </span>
                    </div>
                  </div>

                  {/* Impact & Action Bar */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      calcResult.impactOccurs
                        ? 'bg-rose-950/40 border-rose-500/40'
                        : 'bg-emerald-950/30 border-emerald-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {calcResult.impactOccurs ? (
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        <h5 className="text-sm font-bold text-white">
                          {calcResult.impactOccurs
                            ? `TOQQUŞMA BAŞ VERİR! Zərbə Sürəti: ${calcResult.impactSpeedKmh} km/saat`
                            : `TƏHLÜKƏSİZ DAYANMA MÜMKÜNDÜR (Ehtiyat: ${(
                                animalDistanceM - calcResult.totalStoppingDistanceM
                              ).toFixed(1)} m)`}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Tövsiyə olunan təhlükəsiz sürət: {calcResult.safeSpeedAdvisoryKmh} km/saat • Akustik qovucu ehtimal: {calcResult.deterrentRepelProbabilityPercent}%
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateCertificate}
                      data-testid="generate-cert-btn"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4" />
                      E-Sertifikat Yarat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS & SANCTIONS */}
          {activeTab === 'sanctions' && (
            <div className="space-y-6" data-testid="fauna-sanctions-view">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Selection */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-400" />
                    Nəqliyyat Vasitəsi Seçimi ({MOCK_FAUNA_VEHICLE_PRESETS.length} Model)
                  </h4>
                  <div className="space-y-2">
                    {MOCK_FAUNA_VEHICLE_PRESETS.map((veh) => {
                      const isSelected = selectedVehicle.id === veh.id;
                      return (
                        <div
                          key={veh.id}
                          onClick={() => handleSelectVehicle(veh)}
                          data-testid={`vehicle-preset-${veh.id}`}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-950/50 border-emerald-400 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-100">
                              {veh.plate}
                            </span>
                            <span className="text-xs font-semibold text-slate-200 ml-2 block sm:inline mt-1 sm:mt-0">
                              {veh.model}
                            </span>
                          </div>
                          <div className="text-right text-xs">
                            <span className="font-mono text-emerald-400 font-bold block">
                              {veh.defaultSpeedKmh} km/h
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {veh.massKg} kq
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statutory Liability & Restitution Breakdown */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Qanunvericilik Cərimələri & ETSN Ziyanı (AR NK 410)
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-200 block">
                          İXM Maddə 328.2 (Sürət Həddinin Aşılması):
                        </span>
                        <span className="text-[10px] text-slate-400">
                          1.25 nişanı zonasında 20-40 km/saat aşma
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-200">
                          {convertFaunaSafeCurrency(calcResult.statutoryFineAzn, selectedCurrency)}{' '}
                          {FAUNA_SAFE_CURRENCY_SYMBOLS[selectedCurrency]}
                        </span>
                        <span className="text-[10px] text-amber-400 block font-semibold">
                          +{calcResult.penaltyPoints} cərimə balı
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-200 block">
                          İXM Maddə 38 (50% Qanuni Güzəşt):
                        </span>
                        <span className="text-[10px] text-slate-400">
                          30 gün ərzində AsanPay ilə dərhal ödəniş
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400">
                          {convertFaunaSafeCurrency(
                            calcResult.promptDiscountedFineAzn,
                            selectedCurrency
                          )}{' '}
                          {FAUNA_SAFE_CURRENCY_SYMBOLS[selectedCurrency]}
                        </span>
                        <span className="text-[10px] text-emerald-500 block">
                          -50% qənaət
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-200 block">
                          ETSN Təbiət Ziyanı Tarifi (NK Qərar № 410):
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Qorunan növ: {selectedSpecies}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-rose-400">
                          {convertFaunaSafeCurrency(
                            calcResult.wildlifeRestitutionAzn,
                            selectedCurrency
                          )}{' '}
                          {FAUNA_SAFE_CURRENCY_SYMBOLS[selectedCurrency]}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {calcResult.impactOccurs ? 'Tətbiq edilir' : '0 (Zərər yoxdur)'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex justify-between items-center">
                      <span className="font-bold text-white">Yekun Maliyyə Öhdəliyi:</span>
                      <span className="font-mono font-black text-sm text-emerald-400">
                        {convertFaunaSafeCurrency(
                          calcResult.totalFinancialLiabilityAzn,
                          selectedCurrency
                        )}{' '}
                        {FAUNA_SAFE_CURRENCY_SYMBOLS[selectedCurrency]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST STAND */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="fauna-checklist-view">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    10 Maddəlik Eko-Dukt və SCADA Texniki Auditi (EN 14389-1)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Uyğunluq Reytinqi:{' '}
                    <span className="font-bold text-emerald-400">
                      {checklistEval.statusRating} ({checklistEval.percentage}%)
                    </span>{' '}
                    • {checklistEval.passedCount} / {checklistEval.totalCount} Təsdiqlənmiş Tələb
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleSelectAllChecklist}
                    data-testid="checklist-select-all"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    data-testid="checklist-reset"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {MOCK_FAUNA_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-950/30 border-emerald-500/40'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-200">
                            {item.titleAz}
                          </h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {item.standardReference}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {item.descriptionAz}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="fauna-exam-view">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Magistral Vəhşi Heyvan Təhlükəsizliyi Nəzəri İmtahanı (10 Sual)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Keçid Həddi: {examEval.passingThresholdPercent}% (Ən azı 8 düzgün cavab tələb olunur)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExamSubmitted(true)}
                    data-testid="exam-submit-btn"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    Cavabları Yoxla
                  </button>
                  <button
                    onClick={handleResetExam}
                    data-testid="exam-reset-btn"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Yenidən Başla
                  </button>
                </div>
              </div>

              {examSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    examEval.isPassed
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                  }`}
                  data-testid="exam-results-banner"
                >
                  <div className="flex items-center gap-2">
                    {examEval.isPassed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-bold text-sm">
                      Nəticə: {examEval.score} / {examEval.totalQuestions} ({examEval.percentage}%) —{' '}
                      {examEval.isPassed ? 'İMTAHANDAN KEÇDİNİZ!' : 'KƏSİLDİNİZ!'}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_FAUNA_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedOpt = examAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctOptionIndex;
                  return (
                    <div
                      key={q.id}
                      data-testid={`exam-question-${q.id}`}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {idx + 1}. {q.questionAz}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {q.legalBasis}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {q.optionsAz.map((opt, optIdx) => {
                          let optStyle =
                            'bg-slate-950/50 border-slate-800 hover:bg-slate-800/80 text-slate-300';
                          if (selectedOpt === optIdx) {
                            optStyle = 'bg-emerald-950/60 border-emerald-500 text-white font-semibold';
                          }
                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-900/60 border-emerald-400 text-emerald-200 font-bold';
                            } else if (selectedOpt === optIdx) {
                              optStyle = 'bg-rose-900/60 border-rose-400 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectExamAnswer(q.id, optIdx)}
                              data-testid={`q-${q.id}-opt-${optIdx}`}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && optIdx === q.correctOptionIndex && (
                                <Check className="w-4 h-4 text-emerald-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                          <strong className="text-emerald-400">Hüquqi İzahat:</strong>{' '}
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL ELECTRONIC CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="fauna-certificate-view">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    FAUNA-SAFE-AZ-2026 Rəsmi Elektron E-Klirens Sertifikatı
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    SİMA rəqəmsal imzası və SHA-256 heş ilə qorunan rəsmi dövlət icazə sənədi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCertificate}
                    data-testid="copy-cert-btn"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    Kopyala
                  </button>
                  <button
                    onClick={handlePrintCertificate}
                    data-testid="print-cert-btn"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    Çap Et
                  </button>
                </div>
              </div>

              {/* Certificate Layout Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950/40 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-6">
                {/* Header of Certificate */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-emerald-500/20 pb-4 gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-400 flex items-center justify-center">
                      <Trees className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white tracking-wider uppercase">
                        AZƏRBAYCAN RESPUBLİKASI AAYDA • ETSN • BDYP
                      </h3>
                      <p className="text-xs text-emerald-400 font-semibold">
                        Magistral Vəhşi Heyvan Keçidi Təhlükəsizlik Klirens Sertifikatı
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-emerald-300 block">
                      {generatedCert.certificateId}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tarix: {generatedCert.issueTimestamp}
                    </span>
                  </div>
                </div>

                {/* Body Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Eko-Dukt Stansiyası:</span>
                    <span className="font-semibold text-slate-200">
                      {generatedCert.stationName}
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">
                      Kod: {generatedCert.stationCode}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Nəqliyyat Vasitəsi:</span>
                    <span className="font-semibold text-slate-200">
                      {generatedCert.vehiclePlate}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {generatedCert.vehicleModel}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Qorunan Fauna Növü:</span>
                    <span className="font-semibold text-amber-400">
                      {generatedCert.targetSpecies}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Keçid Növü: {generatedCert.crossingType}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">AVC Qəza Riski:</span>
                    <span className="font-semibold text-emerald-400">
                      {generatedCert.avcRiskScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Status: {generatedCert.statusRating}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">SİMA Rəqəmsal İmza UID:</span>
                    <span className="font-mono text-cyan-400 block truncate">
                      {generatedCert.simaDigitalUid}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Doğrulama PIN: {generatedCert.verificationPin}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">SHA-256 Heş Kodu:</span>
                    <span className="font-mono text-purple-400 block truncate">
                      {generatedCert.sha256Checksum}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Etibarlıdır: {generatedCert.expiryDate} tarixinədək
                    </span>
                  </div>
                </div>

                {/* Footer QR representation */}
                <div className="pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                      {/* Simple SVG QR Code visualization */}
                      <svg viewBox="0 0 40 40" className="w-full h-full text-slate-950 fill-current">
                        <rect x="0" y="0" width="12" height="12" />
                        <rect x="2" y="2" width="8" height="8" fill="#fff" />
                        <rect x="4" y="4" width="4" height="4" />
                        <rect x="28" y="0" width="12" height="12" />
                        <rect x="30" y="2" width="8" height="8" fill="#fff" />
                        <rect x="32" y="4" width="4" height="4" />
                        <rect x="0" y="28" width="12" height="12" />
                        <rect x="2" y="30" width="8" height="8" fill="#fff" />
                        <rect x="4" y="32" width="4" height="4" />
                        <rect x="16" y="8" width="8" height="8" />
                        <rect x="20" y="20" width="8" height="8" />
                        <rect x="28" y="28" width="8" height="8" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">
                        Dövlət İntellektual Nəqliyyat və Ekologiya Reyestri
                      </span>
                      <span className="text-[10px]">
                        E-Hökumət / ASAN / SİMA Rəsmi QR Yoxlama Portalı
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">
                      STATUS: ETİBARLIDIR (VERIFIED)
                    </span>
                    <span className="text-[10px]">
                      AAYDA & ETSN Birgə Nəzarət Mərkəzi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY SEARCH */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="fauna-registry-view">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400" />
                    Vahid İctimai Eko-Klirens Reyestri
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Sertifikat nömrəsi, nəqliyyat nömrəsi və ya stansiya kodu ilə canlı axtarış.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Qeydiyyat / Nömrə / PIN..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    data-testid="registry-search-input"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Records Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Sertifikat ID</th>
                      <th className="py-2.5 px-3">Nəqliyyat</th>
                      <th className="py-2.5 px-3">Eko-Dukt Stansiyası</th>
                      <th className="py-2.5 px-3">Hədəf Fauna</th>
                      <th className="py-2.5 px-3">AVC Riski</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">PIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredRegistry.map((cert) => (
                      <tr
                        key={cert.certificateId}
                        className="hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-bold text-emerald-400">
                          {cert.certificateId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">
                          {cert.vehiclePlate}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 truncate max-w-[180px]">
                          {cert.stationName}
                        </td>
                        <td className="py-2.5 px-3 text-amber-400 font-sans">
                          {cert.targetSpecies}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {cert.avcRiskScore}%
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {cert.statusRating}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {cert.verificationPin}
                        </td>
                      </tr>
                    ))}
                    {filteredRegistry.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500 font-sans">
                          Axtarış sorğusuna uyğun sertifikat tapılmadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
