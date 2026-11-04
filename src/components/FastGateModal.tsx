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
  Unlock,
  Lock,
  Flame,
  Truck,
  RotateCcw,
} from 'lucide-react';
import {
  Currency,
  FastGateZone,
  FastGateVehiclePreset,
  FastGateCertificate,
  convertFastGateCurrency,
  FAST_GATE_CURRENCY_SYMBOLS,
  calculateFastGateTelemetry,
  evaluateFastGateChecklist,
  calculateFastGateExamScore,
  generateFastGateCertificate,
} from '../utils/fastGateCompliance';
import {
  MOCK_FAST_GATE_ZONES,
  MOCK_FAST_GATE_VEHICLES,
  MOCK_FAST_GATE_CHECKLIST,
  MOCK_FAST_GATE_QUESTIONS,
  MOCK_ACTIVE_CERTIFICATES,
} from '../data/mockFastGateData';

export interface FastGateModalProps {
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

export const FastGateModal: React.FC<FastGateModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);
  const [selectedZone, setSelectedZone] = useState<FastGateZone>(MOCK_FAST_GATE_ZONES[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<FastGateVehiclePreset>(MOCK_FAST_GATE_VEHICLES[0]);

  // Simulator inputs
  const [mainlineQueueKm, setMainlineQueueKm] = useState<number>(3.5);
  const [diversionFlowVehHour, setDiversionFlowVehHour] = useState<number>(1200);
  const [contraflowSpeedKmh, setContraflowSpeedKmh] = useState<number>(50);
  const [gateOpenTimeSeconds, setGateOpenTimeSeconds] = useState<number>(selectedZone.openTimeSeconds);
  const [operatingPressureBar, setOperatingPressureBar] = useState<number>(selectedZone.operatingPressureBar);
  const [gateOpenToggle, setGateOpenToggle] = useState<boolean>(false);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>(() =>
    MOCK_FAST_GATE_CHECKLIST.map((item) => item.id)
  );

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [certReason, setCertReason] = useState<string>(
    'Magistralda Zəncirvari Qəza və Yanğın Nəticələrinin Aradan Qaldırılması'
  );
  const [generatedCert, setGeneratedCert] = useState<FastGateCertificate>(MOCK_ACTIVE_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Public Registry
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryRecords, setRegistryRecords] = useState<FastGateCertificate[]>(MOCK_ACTIVE_CERTIFICATES);

  // Sound feedback
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);

  // When zone changes
  const handleSelectZone = (zone: FastGateZone) => {
    setSelectedZone(zone);
    setGateOpenTimeSeconds(zone.openTimeSeconds);
    setOperatingPressureBar(zone.operatingPressureBar);
  };

  // When vehicle changes
  const handleSelectVehicle = (veh: FastGateVehiclePreset) => {
    setSelectedVehicle(veh);
  };

  // Telemetry calculation
  const calculationResult = useMemo(() => {
    return calculateFastGateTelemetry(
      {
        mainlineQueueKm,
        diversionFlowVehHour,
        contraflowSpeedKmh,
        gateOpenTimeSeconds,
        operatingPressureBar,
      },
      selectedVehicle
    );
  }, [
    mainlineQueueKm,
    diversionFlowVehHour,
    contraflowSpeedKmh,
    gateOpenTimeSeconds,
    operatingPressureBar,
    selectedVehicle,
  ]);

  // Checklist evaluation
  const checklistResult = useMemo(() => {
    const items = MOCK_FAST_GATE_CHECKLIST.map((item) => ({
      id: item.id,
      checked: checkedItems.includes(item.id),
    }));
    return evaluateFastGateChecklist(items);
  }, [checkedItems]);

  // Exam result
  const examResult = useMemo(() => {
    return calculateFastGateExamScore(examAnswers, MOCK_FAST_GATE_QUESTIONS);
  }, [examAnswers]);

  // Audio synthesizer chime
  const playScadaChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setAudioPlayed(true);
      setTimeout(() => setAudioPlayed(false), 800);
    } catch {
      // AudioContext not available in test or restricted environments
    }
  };

  // Certificate generation
  const handleGenerateCertificate = () => {
    const newCert = generateFastGateCertificate(selectedZone, selectedVehicle, certReason);
    setGeneratedCert(newCert);
    setRegistryRecords((prev) => [newCert, ...prev]);
    playScadaChime();
  };

  // Copy code handler
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedCert.certificateUid);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Filter registry
  const filteredRegistry = useMemo(() => {
    if (!registrySearch.trim()) return registryRecords;
    const q = registrySearch.toLowerCase();
    return registryRecords.filter(
      (r) =>
        r.certificateUid.toLowerCase().includes(q) ||
        r.vehiclePlate.toLowerCase().includes(q) ||
        r.zoneName.toLowerCase().includes(q) ||
        r.barrierReleasePin.toLowerCase().includes(q)
    );
  }, [registryRecords, registrySearch]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fast-gate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 p-4 sm:p-5 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
              <ShieldCheck className="w-7 h-7 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider uppercase">
                  AAYDA • FHN 112 • BDYP
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  EN 1317 H2/H4b
                </span>
              </div>
              <h2
                id="fast-gate-modal-title"
                className="text-base sm:text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2"
              >
                Magistral Qəza və Xilasetmə Ayrıcı Zolaq Keçidləri (Fast-Gate SCADA)
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Avtomatlaşdırılmış Açılan Polad Baryerlər, Əks-Axın (Contraflow) Rejimi və Operativ Xilasetmə Dəhlizi Portalı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCurrency(c)}
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    selectedCurrency === c
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              data-testid="fast-gate-close-btn"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto no-scrollbar px-2 sm:px-4">
          {[
            { id: 'radar', label: 'Radar & Qapılar', icon: Radio },
            { id: 'simulator', label: 'SCADA Standı', icon: Sliders },
            { id: 'sanctions', label: 'Nəqliyyat & İXM', icon: Car },
            { id: 'checklist', label: 'Texniki Yoxlama', icon: CheckCircle },
            { id: 'exam', label: 'İmtahan Simulyatoru', icon: Award },
            { id: 'certificate', label: 'Elektron Sertifikat', icon: FileText },
            { id: 'registry', label: 'Dövlət Reyestri', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-400" />
                    Azərbaycan Magistral Şəbəkəsində 6 Strateji Fast-Gate Qəza Keçidi
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    M-1, M-2, M-4, Bakı Dairəvi və Zəfər Yolu mərkəzi ayrıcı zolaqlarında quraşdırılmış elektro-hidravlik qapılar
                  </p>
                </div>
                <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Activity className="w-4 h-4 animate-spin text-amber-400" />
                  Mərkəzi SCADA Telemetriyası Aktivdir
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_FAST_GATE_ZONES.map((zone) => {
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <div
                      key={zone.id}
                      onClick={() => handleSelectZone(zone)}
                      data-testid={`zone-card-${zone.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/70 shadow-lg shadow-amber-950/30'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                            {zone.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              zone.status === 'CLOSED_SECURED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : zone.status === 'OPEN_CONTRAFLOW'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {zone.status === 'CLOSED_SECURED'
                              ? 'Qapalı / Təhlükəsiz'
                              : zone.status === 'OPEN_CONTRAFLOW'
                              ? 'Açıq / Əks-Axın'
                              : 'Dispetçer Açılışı'}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-white leading-snug">
                          {zone.nameAz}
                        </h4>
                        <p className="text-xs text-slate-400">{zone.corridor}</p>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50 text-[11px]">
                          <div>
                            <span className="text-slate-400">Piket:</span>{' '}
                            <span className="font-mono text-slate-200">{zone.picketKm}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Tutma:</span>{' '}
                            <span className="font-bold text-amber-300">{zone.containmentLevel}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Qapı Uzunluğu:</span>{' '}
                            <span className="font-semibold text-slate-200">{zone.barrierLengthM} m</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Açılma Vaxtı:</span>{' '}
                            <span className="font-semibold text-cyan-300">{zone.openTimeSeconds} san</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Nəzarətçi:</span>
                        <span className="font-bold text-slate-200">
                          {zone.primaryResponder === 'BDYP'
                            ? 'BDYP Patrul Xidməti'
                            : zone.primaryResponder === 'FHN_112'
                            ? 'FHN 112 Xilasedicilər'
                            : 'AAYDA Magistral'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Zone Quick Telemetry Banner */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Seçilmiş Aktiv Keçid Qapısı</div>
                    <div className="text-sm font-bold text-white">
                      {selectedZone.nameAz} ({selectedZone.code})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('simulator')}
                    data-testid="go-to-simulator-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow"
                  >
                    SCADA Standına Keç
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA STAND */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Controls and Telemetry Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sliders and Inputs */}
                <div className="lg:col-span-5 bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      Qəza və Contraflow Parametrləri
                    </h3>
                    <button
                      onClick={playScadaChime}
                      data-testid="audio-chime-btn"
                      className="text-xs flex items-center gap-1 text-slate-400 hover:text-amber-300"
                      title="SCADA Səs Siqnalı"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {audioPlayed ? 'Siqnal...' : 'Test Səsi'}
                    </button>
                  </div>

                  {/* Slider 1: Mainline Queue */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Magistralda Qəza Tıxacı:</span>
                      <span className="font-mono text-amber-300 font-bold">
                        {mainlineQueueKm.toFixed(1)} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="15.0"
                      step="0.5"
                      value={mainlineQueueKm}
                      onChange={(e) => setMainlineQueueKm(parseFloat(e.target.value))}
                      data-testid="slider-queue-km"
                      className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Diversion Flow */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Yönləndirilən Nəqliyyat Axını:</span>
                      <span className="font-mono text-amber-300 font-bold">
                        {diversionFlowVehHour} avto/saat
                      </span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="2500"
                      step="50"
                      value={diversionFlowVehHour}
                      onChange={(e) => setDiversionFlowVehHour(parseInt(e.target.value, 10))}
                      data-testid="slider-diversion-flow"
                      className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 3: Contraflow Target Speed */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Əks-Axın Zolağı Hərəkət Sürəti:</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {contraflowSpeedKmh} km/saat
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="80"
                      step="5"
                      value={contraflowSpeedKmh}
                      onChange={(e) => setContraflowSpeedKmh(parseInt(e.target.value, 10))}
                      data-testid="slider-contraflow-speed"
                      className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 4: Gate Opening Time */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Baryerin Açılma Vaxtı:</span>
                      <span className="font-mono text-slate-200 font-bold">
                        {gateOpenTimeSeconds} saniyə
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="180"
                      step="5"
                      value={gateOpenTimeSeconds}
                      onChange={(e) => setGateOpenTimeSeconds(parseInt(e.target.value, 10))}
                      data-testid="slider-open-seconds"
                      className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 5: Hydraulic Pressure */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Hidravlik Təzyiq:</span>
                      <span
                        className={`font-mono font-bold ${
                          operatingPressureBar < 140
                            ? 'text-rose-400'
                            : operatingPressureBar < 170
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {operatingPressureBar} bar
                      </span>
                    </div>
                    <input
                      type="range"
                      min="120"
                      max="250"
                      step="5"
                      value={operatingPressureBar}
                      onChange={(e) => setOperatingPressureBar(parseInt(e.target.value, 10))}
                      data-testid="slider-pressure-bar"
                      className="w-full accent-emerald-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Manual Gate Toggle */}
                  <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Mərkəzi Qapı Vəziyyəti:
                    </span>
                    <button
                      onClick={() => {
                        setGateOpenToggle(!gateOpenToggle);
                        playScadaChime();
                      }}
                      data-testid="gate-toggle-btn"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        gateOpenToggle
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      {gateOpenToggle ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          AÇIQ (Contraflow)
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          QAPALI (Mühafizə)
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Animated 2D SVG SCADA Canvas */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-2">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      Magistral Qəza Ayrıcı Boğazı & Reversible Contraflow SXEMİ
                    </span>
                    <span className="font-mono text-amber-400">
                      EN 1317: {selectedZone.containmentLevel}
                    </span>
                  </div>

                  {/* SVG Canvas */}
                  <div className="relative w-full h-56 bg-slate-900/90 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                    <svg viewBox="0 0 600 240" className="w-full h-full">
                      {/* Carriageway Top Lanes (Northbound) */}
                      <rect x="0" y="20" width="600" height="75" fill="#1e293b" />
                      <line x1="0" y1="57" x2="600" y2="57" stroke="#64748b" strokeDasharray="8 6" strokeWidth="2" />
                      <text x="20" y="45" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                        Şimal Axını (M-1 Quba İstiqaməti)
                      </text>

                      {/* Central Median Strip (Ayrıcı Zolaq) */}
                      <rect x="0" y="95" width="600" height="50" fill="#0f172a" />

                      {/* Fixed Guardrails on Left & Right */}
                      <line x1="0" y1="100" x2="200" y2="100" stroke="#94a3b8" strokeWidth="4" />
                      <line x1="0" y1="140" x2="200" y2="140" stroke="#94a3b8" strokeWidth="4" />
                      <line x1="400" y1="100" x2="600" y2="100" stroke="#94a3b8" strokeWidth="4" />
                      <line x1="400" y1="140" x2="600" y2="140" stroke="#94a3b8" strokeWidth="4" />

                      {/* Median Crossover Gap (x: 200 to 400) */}
                      {/* If Gate is closed: steel gate segment in the middle */}
                      {!gateOpenToggle ? (
                        <g>
                          <line x1="200" y1="120" x2="400" y2="120" stroke="#f59e0b" strokeWidth="6" />
                          <circle cx="210" cy="120" r="5" fill="#ef4444" />
                          <circle cx="390" cy="120" r="5" fill="#ef4444" />
                          <text x="240" y="115" fill="#f59e0b" fontSize="11" fontWeight="bold">
                            FAST-GATE: QAPALI
                          </text>
                        </g>
                      ) : (
                        <g>
                          {/* Opened barrier rotated/telescoped away */}
                          <line x1="200" y1="100" x2="260" y2="70" stroke="#f59e0b" strokeWidth="5" />
                          <line x1="400" y1="140" x2="340" y2="170" stroke="#f59e0b" strokeWidth="5" />
                          {/* Contraflow path curved arrow */}
                          <path
                            d="M 120 185 Q 260 185 300 120 T 480 55"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="4"
                            strokeDasharray="6 4"
                          />
                          <circle cx="300" cy="120" r="4" fill="#38bdf8" />
                          <text x="240" y="138" fill="#38bdf8" fontSize="11" fontWeight="bold">
                            CONTRAFLOW KEÇİD
                          </text>
                        </g>
                      )}

                      {/* Carriageway Bottom Lanes (Southbound) */}
                      <rect x="0" y="145" width="600" height="75" fill="#1e293b" />
                      <line x1="0" y1="182" x2="600" y2="182" stroke="#64748b" strokeDasharray="8 6" strokeWidth="2" />
                      <text x="20" y="210" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                        Cənub Axını (Bakı İstiqaməti - Qəza Zonası)
                      </text>

                      {/* Vehicles on Road */}
                      {/* Queued vehicles in bottom lane */}
                      <rect x="30" y="155" width="28" height="14" rx="2" fill="#ef4444" />
                      <rect x="65" y="155" width="28" height="14" rx="2" fill="#e2e8f0" />
                      <rect x="100" y="155" width="40" height="16" rx="2" fill="#f97316" />

                      {/* Emergency vehicle crossing */}
                      <rect x="290" y="110" width="30" height="15" rx="3" fill="#3b82f6" />
                      <circle cx="305" cy="117" r="3" fill="#60a5fa" />
                    </svg>
                  </div>

                  {/* Canvas Legend */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Açılan Polad Baryer
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      Əks-Axın Trayektoriyası
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Qəza Tıxacı
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Results Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Contraflow Buraxılışı</div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-cyan-300 mt-1">
                    {calculationResult.contraflowCapacityVehHour} avto/s
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Maksimal axın gücü</div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Tıxacın Boşalma Müddəti</div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-amber-300 mt-1">
                    {calculationResult.queueClearanceTimeMinutes} dəq
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {mainlineQueueKm} km tıxacın təxliyəsi
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Qazanılmış Operativ Vaxt</div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-emerald-300 mt-1">
                    {calculationResult.emergencyResponseMinutesSaved} dəq
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Növbəti qovşağa nisbətən</div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Təkrar Qəza Riskinin Azalması</div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-indigo-300 mt-1">
                    %{calculationResult.secondaryCrashReductionPercent}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">PIARC təhlükəsizlik modeli</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLES & SANCTIONS */}
          {activeTab === 'sanctions' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-amber-400" />
                  Nəqliyyat Kateqoriyaları və İnzibati Xətalar Məcəlləsi (İXM) Cərimələri
                </h3>
                <p className="text-xs text-slate-400">
                  Yol hərəkəti qaydalarının 47-ci maddəsi və İXM-in 327.4, 328.2, 353.1 maddələri üzrə məsuliyyət
                </p>
              </div>

              {/* Vehicle Preset Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_FAST_GATE_VEHICLES.map((veh) => {
                  const isSelected = selectedVehicle.id === veh.id;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => handleSelectVehicle(veh)}
                      data-testid={`vehicle-preset-${veh.id}`}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/70 shadow'
                          : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                            {veh.plate}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              veh.isEmergencyService
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {veh.isEmergencyService ? 'Operativ Xidmət' : 'Mülki / Qeyri-operativ'}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white">{veh.model}</h4>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Çəki: {veh.massKg.toLocaleString()} kq</span>
                        <span className="font-semibold text-slate-300">
                          {veh.defaultViolation === 'NONE'
                            ? 'Qanunauyğun'
                            : veh.defaultViolation === 'CIVILIAN_ILLEGAL_UTURN'
                            ? 'İcazəsiz U-turn'
                            : veh.defaultViolation === 'CONTRAFLOW_SPEEDING'
                            ? 'Sürət həddi'
                            : 'Baryerə zərər'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sanctions & Restitution Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Seçilmiş Nəqliyyat Vasitəsinin Hüquqi Statusu
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dövlət nömrə nişanı: <span className="font-mono text-amber-300">{selectedVehicle.plate}</span> — {selectedVehicle.model}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      calculationResult.clearanceStatus === 'AUTHORIZED_DISPATCH'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {calculationResult.clearanceStatus === 'AUTHORIZED_DISPATCH'
                      ? 'İCAZƏLİ OPERATİV KEÇİD'
                      : 'QANUNSUZ KEÇİD / CƏRİMƏ'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="font-semibold text-amber-300">Hüquqi Əsas:</span>{' '}
                  {calculationResult.legalArticleAz}
                </div>

                {calculationResult.unauthorizedFineAzn > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400">İnzibati Cərimə Məbləği</div>
                      <div className="text-lg font-bold font-mono text-rose-400 mt-1">
                        {convertFastGateCurrency(calculationResult.unauthorizedFineAzn, selectedCurrency)}{' '}
                        {FAST_GATE_CURRENCY_SYMBOLS[selectedCurrency]}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        +{calculationResult.unauthorizedPoints} cərimə balı
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400">30 Günlük 50% Güzəştlə (İXM 38)</div>
                      <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                        {convertFastGateCurrency(calculationResult.discountedFineAzn, selectedCurrency)}{' '}
                        {FAST_GATE_CURRENCY_SYMBOLS[selectedCurrency]}
                      </div>
                      <div className="text-[10px] text-emerald-500/80 mt-0.5">Dərhal ödəniş hüququ</div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400">Dövlət Əmlakına Dəymiş Zərər</div>
                      <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                        {convertFastGateCurrency(calculationResult.assetDamageRestitutionAzn, selectedCurrency)}{' '}
                        {FAST_GATE_CURRENCY_SYMBOLS[selectedCurrency]}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Mülki Məcəllə Maddə 1108</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    10 Bəndlik Dövlət Standartı & SCADA Texniki Yoxlama Siyahısı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    EN 1317-2 H2/H4b, ISO 4413 hidravlik standartı və AZS 410 təhlükəsizlik qaydaları
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCheckedItems(MOCK_FAST_GATE_CHECKLIST.map((i) => i.id))
                    }
                    data-testid="check-all-btn"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition-all"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                  <button
                    onClick={() => setCheckedItems([])}
                    data-testid="reset-checklist-btn"
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-xs transition-all"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Compliance score header */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-300">
                  Yoxlama Nəticəsi:{' '}
                  <span className="font-bold text-amber-300">{checklistResult.statusAz}</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {checklistResult.passedCount} / {checklistResult.totalCount} (%{checklistResult.complianceRating})
                </span>
              </div>

              {/* Checklist items list */}
              <div className="space-y-2">
                {MOCK_FAST_GATE_CHECKLIST.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCheckedItems((prev) =>
                          isChecked
                            ? prev.filter((id) => id !== item.id)
                            : [...prev, item.id]
                        );
                      }}
                      data-testid={`chk-item-${item.id}`}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-800/40 border-slate-700'
                          : 'bg-rose-950/10 border-rose-900/40 hover:bg-slate-800/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 accent-amber-400 w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white leading-snug">
                            {item.labelAz}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {item.referenceStd}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.labelEn}</p>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    10 Suallıq Magistral Qəza Keçidləri & Contraflow İmtahan Simulyatoru
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    YHQ Maddə 47, İXM Maddə 327.4 və EN 1317 standartı üzrə sertifikatlaşdırma
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const perfectAnswers: Record<string, number> = {};
                      MOCK_FAST_GATE_QUESTIONS.forEach((q) => {
                        perfectAnswers[q.id] = q.correctAnswerIndex;
                      });
                      setExamAnswers(perfectAnswers);
                      setExamSubmitted(true);
                      playScadaChime();
                    }}
                    data-testid="exam-autofill-btn"
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-all"
                  >
                    Avtomatik Doldur (100%)
                  </button>
                  <button
                    onClick={() => {
                      setExamAnswers({});
                      setExamSubmitted(false);
                    }}
                    data-testid="exam-reset-btn"
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-xs transition-all"
                  >
                    Təmizlə
                  </button>
                </div>
              </div>

              {/* Exam Submitted Score Banner */}
              {examSubmitted && (
                <div
                  data-testid="exam-score-banner"
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    examResult.passed
                      ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div>
                    <div className="text-xs uppercase font-bold tracking-wider">
                      İmtahan Nəticəsi
                    </div>
                    <div className="text-base font-bold mt-0.5">{examResult.gradeAz}</div>
                  </div>
                  <div className="text-2xl font-mono font-bold">
                    {examResult.score} / {examResult.total} (%{examResult.percent})
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_FAST_GATE_QUESTIONS.map((q, qIndex) => {
                  const selectedOpt = examAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctAnswerIndex;
                  return (
                    <div
                      key={q.id}
                      data-testid={`question-card-${q.id}`}
                      className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-white">
                          <span className="text-amber-400 font-mono mr-1.5">{qIndex + 1}.</span>
                          {q.questionAz}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {q.legalCitation}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {q.optionsAz.map((opt, optIndex) => {
                          const isOptionSelected = selectedOpt === optIndex;
                          let optionStyle =
                            'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700';

                          if (examSubmitted) {
                            if (optIndex === q.correctAnswerIndex) {
                              optionStyle =
                                'bg-emerald-950/30 border-emerald-500/60 text-emerald-200 font-semibold';
                            } else if (isOptionSelected) {
                              optionStyle =
                                'bg-rose-950/30 border-rose-500/60 text-rose-200 font-semibold';
                            }
                          } else if (isOptionSelected) {
                            optionStyle =
                              'bg-amber-950/30 border-amber-500/60 text-amber-200 font-semibold';
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => {
                                if (!examSubmitted) {
                                  setExamAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: optIndex,
                                  }));
                                }
                              }}
                              data-testid={`opt-${q.id}-${optIndex}`}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && optIndex === q.correctAnswerIndex && (
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
                          <span className="font-semibold text-amber-300">Şərh:</span>{' '}
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!examSubmitted && (
                <button
                  onClick={() => {
                    setExamSubmitted(true);
                    playScadaChime();
                  }}
                  data-testid="submit-exam-btn"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-950/30"
                >
                  İmtahan Cavablarını Təsdiqlə və Qiymətləndir
                </button>
              )}
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Rəsmi Elektron FAST-GATE-AZ-2026 Operativ Keçid Vayçeri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AAYDA, FHN və BDYP tərəfindən SİMA Rəqəmsal İmza ilə təsdiqlənmiş operativ buraxılış
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateCertificate}
                    data-testid="generate-cert-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Yeni Vayçer Generasiya Et
                  </button>
                  <button
                    onClick={handleCopyCode}
                    data-testid="copy-cert-code-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Kodu Kopyala
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Certificate Layout */}
              <div
                data-testid="certificate-card"
                className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl"
              >
                {/* Watermark Logo */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-72 h-72 text-amber-400" />
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-4 gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                      Azərbaycan Respublikası Rəsmi Magistral İdarəetmə Sistemi
                    </div>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      FÖVQƏLADƏ OPERATİV KEÇİD & CONTRAFLOW VAYÇERİ
                    </h3>
                    <div className="text-xs text-slate-400">
                      Vayçer Kodu:{' '}
                      <span className="font-mono font-bold text-amber-300">
                        {generatedCert.certificateUid}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {generatedCert.status === 'ACTIVE_DISPATCH' ? 'Aktiv Dispetçer' : 'Arxiv'}
                    </span>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      SİMA: {generatedCert.simaSignatureUid}
                    </div>
                  </div>
                </div>

                {/* Voucher Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Strateji Keçid Qapısı:</span>
                    <span className="font-semibold text-white mt-0.5 block">
                      {generatedCert.zoneName}
                    </span>
                    <span className="font-mono text-amber-300 text-[11px]">
                      {generatedCert.zoneCode}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Operativ Nəqliyyat:</span>
                    <span className="font-semibold text-white mt-0.5 block">
                      {generatedCert.vehicleModel}
                    </span>
                    <span className="font-mono text-amber-300 text-[11px]">
                      Qeydiyyat: {generatedCert.vehiclePlate}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Qapı Açılış PIN Kodu:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                      {generatedCert.barrierReleasePin}
                    </span>
                    <span className="text-[10px] text-slate-400">Təkistifadəlik SCADA şifrəsi</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Tutma Dərəcəsi & Qurğu:</span>
                    <span className="font-semibold text-white mt-0.5 block">
                      {generatedCert.containmentRating}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Açılma müddəti: {generatedCert.openingDurationSeconds} saniyə
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Verilmə Tarixi:</span>
                    <span className="font-mono text-slate-200 mt-0.5 block">
                      {new Date(generatedCert.issuedAt).toLocaleString('az-AZ')}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block">Bitmə Tarixi (4 saatlıq):</span>
                    <span className="font-mono text-amber-300 mt-0.5 block">
                      {new Date(generatedCert.expiresAt).toLocaleString('az-AZ')}
                    </span>
                  </div>
                </div>

                {/* Reason description */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block">İcazə Əsası və Əməliyyat Təyinatı:</span>
                  <span className="text-slate-200 font-medium mt-0.5 block">
                    {generatedCert.authorizedReason}
                  </span>
                </div>

                {/* Cryptographic SHA-256 Footer */}
                <div className="pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 gap-2">
                  <div className="font-mono break-all">
                    SHA-256 HASH: <span className="text-amber-400/80">{generatedCert.sha256Hash}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Dövlət İntellektual Şəbəkəsində Yoxlanılıb</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    Vahid Dövlət Qəza Keçidləri & Fast-Gate Açıq Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rəsmi təsdiqlənmiş operativ keçidlər və qapı açılışlarının arxiv qeydləri
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Vayçer və ya nömrə axtar..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    data-testid="registry-search-input"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Records Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Vayçer UID</th>
                      <th className="p-3">Qapı Kodu & Adı</th>
                      <th className="p-3">Avtomobil</th>
                      <th className="p-3">PIN Kodu</th>
                      <th className="p-3">Verilmə Vaxtı</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredRegistry.map((cert) => (
                      <tr
                        key={cert.certificateUid}
                        data-testid={`registry-row-${cert.certificateUid}`}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3 font-mono font-bold text-amber-300">
                          {cert.certificateUid}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{cert.zoneName}</div>
                          <div className="text-[10px] text-slate-400">{cert.zoneCode}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-slate-200">{cert.vehiclePlate}</div>
                          <div className="text-[10px] text-slate-400">{cert.vehicleModel}</div>
                        </td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">
                          {cert.barrierReleasePin}
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">
                          {new Date(cert.issuedAt).toLocaleTimeString('az-AZ')}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {cert.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredRegistry.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                          Axtarışa uyğun qeyd tapılmadı.
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
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AAYDA • FHN 112 • BDYP SCADA Mərkəzi ilə Şifrələnmiş TLS 1.3 Rabitəsi</span>
          </div>
          <button
            onClick={onClose}
            data-testid="fast-gate-footer-close-btn"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold transition-all border border-slate-700"
          >
            Pəncərəni Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

export default FastGateModal;
