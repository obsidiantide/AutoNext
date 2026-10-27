import React, { useState, useMemo } from 'react';
import {
  Currency,
  V2xMode,
  InverterPowerRating,
  TimeOfUsePeriod,
  V2X_MODES_INFO,
  INVERTER_SPECS,
  TIME_OF_USE_TARIFFS,
  calculateV2gExport,
  evaluateGridFrequency,
  evaluateV2gSafetyChecklist,
  gradeV2gExam,
  generateV2gCertificate,
  formatV2gCurrency,
  V2gChecklistItem,
  VerifiedV2gCertificate,
} from '../utils/v2gCompliance';
import {
  MOCK_SMART_SUBSTATIONS,
  V2G_VEHICLE_PRESETS,
  V2G_SAFETY_CHECKLIST_ITEMS,
  V2G_EXAM_QUESTIONS,
  MOCK_VERIFIED_V2G_CERTIFICATES,
  SmartGridSubstation,
  V2gVehiclePreset,
} from '../data/mockV2gData';
import {
  X,
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Copy,
  Printer,
  Search,
  MapPin,
  HelpCircle,
  Check,
  RotateCcw,
  Gauge,
  Sliders,
  DollarSign,
  TrendingUp,
  Radio,
  FileCheck2,
  Power,
  ChevronRight,
  BatteryCharging,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';

export interface V2gSmartGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialVehicle?: Vehicle;
}

type TabType = 'inverter' | 'substations' | 'checklist' | 'exam' | 'certificate';

export const V2gSmartGridModal: React.FC<V2gSmartGridModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialVehicle,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('inverter');

  // Active Vehicle & Inverter Configuration
  const [selectedPresetId, setSelectedPresetId] = useState<string>(V2G_VEHICLE_PRESETS[0].id);
  const [batteryCapacityKwh, setBatteryCapacityKwh] = useState<number>(
    V2G_VEHICLE_PRESETS[0].batteryCapacityKwh
  );
  const [currentSocPercent, setCurrentSocPercent] = useState<number>(85);
  const [minSocReservePercent, setMinSocReservePercent] = useState<number>(20);
  const [inverterPowerKw, setInverterPowerKw] = useState<InverterPowerRating>(11);
  const [v2xMode, setV2xMode] = useState<V2xMode>('V2G');
  const [tariffPeriod, setTariffPeriod] = useState<TimeOfUsePeriod>('peak');
  const [licensePlate, setLicensePlate] = useState<string>(
    initialVehicle?.plateNumber || V2G_VEHICLE_PRESETS[0].licensePlate
  );

  // Substation
  const [selectedSubstation, setSelectedSubstation] = useState<SmartGridSubstation>(
    MOCK_SMART_SUBSTATIONS[0]
  );
  const [substationSearch, setSubstationSearch] = useState<string>('');
  const [simulatedFrequencyHz, setSimulatedFrequencyHz] = useState<number>(50.012);

  // Checklist state
  const [checklistItems, setChecklistItems] = useState<V2gChecklistItem[]>(
    V2G_SAFETY_CHECKLIST_ITEMS.map((item) => ({ ...item }))
  );

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificates state
  const [certificates, setCertificates] = useState<VerifiedV2gCertificate[]>(
    MOCK_VERIFIED_V2G_CERTIFICATES
  );
  const [activeCertificate, setActiveCertificate] = useState<VerifiedV2gCertificate | null>(
    MOCK_VERIFIED_V2G_CERTIFICATES[0]
  );
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Handle Preset Switching
  const handleSelectPreset = (preset: V2gVehiclePreset) => {
    setSelectedPresetId(preset.id);
    setBatteryCapacityKwh(preset.batteryCapacityKwh);
    setCurrentSocPercent(preset.currentSocPercent);
    setMinSocReservePercent(preset.minSocReservePercent);
    setInverterPowerKw(preset.recommendedInverterKw);
    setLicensePlate(preset.licensePlate);
  };

  // Calculation Results
  const exportCalculation = useMemo(() => {
    return calculateV2gExport({
      batteryCapacityKwh,
      currentSocPercent,
      minSocReservePercent,
      inverterPowerKw,
      mode: v2xMode,
      tariffPeriod,
      currency,
      substationFeedInMultiplier: selectedSubstation.dynamicFeedInMultiplier,
    });
  }, [
    batteryCapacityKwh,
    currentSocPercent,
    minSocReservePercent,
    inverterPowerKw,
    v2xMode,
    tariffPeriod,
    currency,
    selectedSubstation.dynamicFeedInMultiplier,
  ]);

  // Frequency Diagnostic
  const frequencyDiagnostic = useMemo(() => {
    return evaluateGridFrequency(simulatedFrequencyHz);
  }, [simulatedFrequencyHz]);

  // Checklist Evaluation
  const checklistEvaluation = useMemo(() => {
    return evaluateV2gSafetyChecklist(checklistItems);
  }, [checklistItems]);

  const toggleChecklistItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const handleSelectAllChecklist = (passed: boolean) => {
    setChecklistItems((prev) => prev.map((item) => ({ ...item, passed })));
  };

  // Exam Evaluation
  const correctExamKeys = useMemo(() => {
    const keys: Record<number, number> = {};
    V2G_EXAM_QUESTIONS.forEach((q) => {
      keys[q.id] = q.correctIndex;
    });
    return keys;
  }, []);

  const examGrading = useMemo(() => {
    return gradeV2gExam(examAnswers, correctExamKeys);
  }, [examAnswers, correctExamKeys]);

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (isExamSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setIsExamSubmitted(false);
  };

  // Generate Certificate from Active Setup
  const handleGenerateCertificate = () => {
    const newCert = generateV2gCertificate({
      licensePlate,
      ownerFullName: 'Azərbaycan Respublikası Aktiv İstehlakçısı',
      finCode: '7M4P9Q2',
      substationId: selectedSubstation.id,
      substationNameAz: selectedSubstation.nameAz,
      smartMeterCode: `AZS-SM-${Math.floor(100000 + Math.random() * 900000)}`,
      inverterModel: INVERTER_SPECS[inverterPowerKw].nameAz,
      inverterPowerKw,
      mode: v2xMode,
      batteryCapacityKwh,
      maxExportLimitKw: inverterPowerKw,
      issueDate: '2026-10-27',
      expiryDate: '2027-10-27',
      status: 'ACTIVE',
    });

    setCertificates((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered Substations
  const filteredSubstations = useMemo(() => {
    const q = substationSearch.toLowerCase().trim();
    if (!q) return MOCK_SMART_SUBSTATIONS;
    return MOCK_SMART_SUBSTATIONS.filter(
      (s) =>
        s.nameAz.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.addressAz.toLowerCase().includes(q) ||
        s.voltageKv.toLowerCase().includes(q)
    );
  }, [substationSearch]);

  // Filtered Registry Certificates
  const filteredCertificates = useMemo(() => {
    const q = registrySearch.toLowerCase().trim();
    if (!q) return certificates;
    return certificates.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.licensePlate.toLowerCase().includes(q) ||
        c.ownerFullName.toLowerCase().includes(q) ||
        c.smartMeterCode.toLowerCase().includes(q) ||
        c.substationNameAz.toLowerCase().includes(q)
    );
  }, [certificates, registrySearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="v2g-modal-title"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="v2g-modal-title" className="text-xl font-bold text-white tracking-tight">
                  Azərişıq & Energetika Nazirliyi • Ağıllı Şəbəkə V2G Portalı
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Rəsmi V2G-AZ-2026
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Elektromobil İkitərəfli İnverter • Şəbəkəyə İxrac (V2G/V2H) • Pik Kəsilməsi (Peak-Shaving) & Dinamik Tarif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Bağla"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'inverter', label: 'İnverter & Telemetriya', icon: Sliders },
            { id: 'substations', label: 'Azərişıq Yarımstansiyalar', icon: Activity },
            { id: 'checklist', label: '10-Nöqtəli Təhlükəsizlik', icon: ShieldCheck },
            { id: 'exam', label: 'Rəsmi V2G İmtahanı', icon: HelpCircle },
            { id: 'certificate', label: 'Şəhadətnamə & Reyestr', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-200">
          {/* TAB 1: INVERTER & TELEMETRY STAND */}
          {activeTab === 'inverter' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Hazır V2G Elektromobil Modelləri:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {V2G_VEHICLE_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold truncate">{preset.name}</div>
                          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                            {preset.licensePlate} • {preset.batteryCapacityKwh} kVt·st
                          </div>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-2 truncate">
                          {preset.recommendedInverterKw} kVt • SOH {preset.sohPercent}%
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Config & Flow Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Interactive Controls */}
                <div className="lg:col-span-1 space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>İnverter & Rejim Parametrləri</span>
                  </h3>

                  {/* V2X Mode */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">
                      V2X İş Rejimi:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['V2G', 'V2H', 'V2L'] as V2xMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setV2xMode(mode)}
                          className={`py-2 text-xs font-bold rounded-lg border transition ${
                            v2xMode === mode
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {V2X_MODES_INFO[v2xMode].nameAz}
                    </p>
                  </div>

                  {/* Inverter Rating */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">
                      İnverter Gücü (kW):
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([7.4, 11, 22, 50] as InverterPowerRating[]).map((kw) => (
                        <button
                          key={kw}
                          onClick={() => setInverterPowerKw(kw)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                            inverterPowerKw === kw
                              ? 'bg-cyan-600 border-cyan-500 text-white'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {kw} kW
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-cyan-400 mt-1">
                      {INVERTER_SPECS[inverterPowerKw].nameAz}
                    </p>
                  </div>

                  {/* Time of Use Tariff */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">
                      Şəbəkə Tarif Dövrü (Tarif Şurası):
                    </label>
                    <select
                      value={tariffPeriod}
                      onChange={(e) => setTariffPeriod(e.target.value as TimeOfUsePeriod)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {Object.entries(TIME_OF_USE_TARIFFS).map(([k, t]) => (
                        <option key={k} value={k}>
                          {t.nameAz} ({t.exportCreditAznPerKwh} ₼/kVt·st)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Battery Capacity */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Ümumi Batareya Həcmi:</span>
                      <span className="font-bold text-white font-mono">{batteryCapacityKwh} kVt·st</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={150}
                      step={1}
                      value={batteryCapacityKwh}
                      onChange={(e) => setBatteryCapacityKwh(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Current SoC Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Cari Akkumulyator Şarjı (SoC):</span>
                      <span className="font-bold text-emerald-400 font-mono">{currentSocPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={currentSocPercent}
                      onChange={(e) => setCurrentSocPercent(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Min SoC Reserve Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Minimum Toxunulmaz Ehtiyat:</span>
                      <span className="font-bold text-amber-400 font-mono">{minSocReservePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={minSocReservePercent}
                      onChange={(e) => setMinSocReservePercent(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Batareyanın ömrünü qorumaq və təcili yürüş üçün saxlanılan rezerv.
                    </p>
                  </div>
                </div>

                {/* Right: Telemetry Dashboard & Power Flow */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Power Flow Visualizer */}
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <h4 className="text-sm font-bold text-white">
                          İkitərəfli Enerji Axını & Şəbəkə Balansı
                        </h4>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {exportCalculation.statusTextAz}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-center text-center py-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      {/* EV Battery */}
                      <div className="space-y-1">
                        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <BatteryCharging className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-white">Elektromobil</div>
                        <div className="text-[11px] text-emerald-400 font-mono">
                          {currentSocPercent}% SoC ({batteryCapacityKwh} kWh)
                        </div>
                      </div>

                      {/* Power Flow Arrow */}
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-cyan-400 font-mono">
                          {exportCalculation.peakShavingPowerKw} kW İxrac
                        </div>
                        <div className="flex items-center justify-center space-x-1 text-cyan-400">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          <span className="h-0.5 w-16 bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500" />
                          <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="text-[10px] text-slate-400">
                          F.İ.Ə: {exportCalculation.roundTripEfficiencyPercent}%
                        </div>
                      </div>

                      {/* Azərişıq Grid */}
                      <div className="space-y-1">
                        <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Zap className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-white">Azərişıq Şəbəkəsi</div>
                        <div className="text-[11px] text-blue-400 font-mono">
                          {selectedSubstation.voltageKv}
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-[10px] uppercase font-bold text-slate-400">İxrac Olunan Enerji</div>
                        <div className="text-lg font-extrabold text-white font-mono mt-0.5">
                          {exportCalculation.netDeliveredEnergyKwh} <span className="text-xs font-normal text-slate-400">kVt·st</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Brutto: {exportCalculation.exportableEnergyKwh} kVt·st
                        </div>
                      </div>

                      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-[10px] uppercase font-bold text-slate-400">İxrac Müddəti</div>
                        <div className="text-lg font-extrabold text-cyan-300 font-mono mt-0.5">
                          {exportCalculation.exportDurationHours} <span className="text-xs font-normal text-slate-400">saat</span>
                        </div>
                        <div className="text-[10px] text-cyan-400 mt-1">
                          {inverterPowerKw} kVt sabit güc
                        </div>
                      </div>

                      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Brutto Şəbəkə Krediti</div>
                        <div className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
                          {formatV2gCurrency(exportCalculation.grossCreditAzn, currency)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Deqradasiya: -{formatV2gCurrency(exportCalculation.batteryDegradationCostAzn, currency)}
                        </div>
                      </div>

                      <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/40">
                        <div className="text-[10px] uppercase font-bold text-emerald-300">Xalis Gəlir / Qənaət</div>
                        <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">
                          {formatV2gCurrency(exportCalculation.netEarningsAzn, currency)}
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-1">
                          CO2 qənaəti: {exportCalculation.avoidedCo2Kg} kq
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Frequency & Anti-Islanding Monitor */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Gauge className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Şəbəkə Tezliyi & Anti-İslanding Təhlükəsizlik Monitoru
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          frequencyDiagnostic.antiIslandingTripRequired
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : frequencyDiagnostic.requiresCurtailment
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {frequencyDiagnostic.antiIslandingTripRequired
                          ? 'TRIP (<100ms Açılma)'
                          : frequencyDiagnostic.requiresCurtailment
                          ? 'Droop Tənzimləmə'
                          : 'Normal (50.00 Hz)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div className="sm:col-span-2">
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Simulyasiya Olunan Şəbəkə Tezliyi:</span>
                          <span className="font-bold text-white font-mono">{simulatedFrequencyHz.toFixed(3)} Hz</span>
                        </div>
                        <input
                          type="range"
                          min={49.2}
                          max={50.8}
                          step={0.005}
                          value={simulatedFrequencyHz}
                          onChange={(e) => setSimulatedFrequencyHz(Number(e.target.value))}
                          className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>49.20 Hz (Trip Açılma)</span>
                          <span className="text-emerald-400">50.00 Hz (Nominal)</span>
                          <span>50.80 Hz (Trip Açılma)</span>
                        </div>
                      </div>

                      <div className="text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Diaqnostika:</div>
                        <div className="text-xs font-semibold text-slate-200 mt-0.5">
                          {frequencyDiagnostic.statusAz}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Banner to Certificate */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
                    <div>
                      <div className="text-sm font-bold text-white">
                        V2G İxrac İcazə Şəhadətnaməsi Almağa Hazırsınız?
                      </div>
                      <div className="text-xs text-slate-400">
                        Təhlükəsizlik auditini keçin və rəsmi elektron şəhadətnamənizi generasiya edin.
                      </div>
                    </div>
                    <button
                      onClick={handleGenerateCertificate}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>Şəhadətnamə Al</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMART SUBSTATIONS RADAR */}
          {activeTab === 'substations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <span>Azərişıq Ağıllı Rəqəmsal Yarımstansiyalar Radarı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bakı və Abşeron yarımadasında V2G dəstəkli 110/35/10 kV şəbəkə qovşaqları və canlı telemetriya
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Yarımstansiya və ya rayon axtar..."
                    value={substationSearch}
                    onChange={(e) => setSubstationSearch(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
                  />
                </div>
              </div>

              {/* Substations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubstations.map((substation) => {
                  const isSelected = selectedSubstation.id === substation.id;
                  return (
                    <div
                      key={substation.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {substation.voltageKv}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            +{Math.round((substation.dynamicFeedInMultiplier - 1) * 100)}% Bonus
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{substation.nameAz}</h4>
                          <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{substation.addressAz}</span>
                          </p>
                        </div>

                        {/* Telemetry Chips */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-400">Şəbəkə Yüklənməsi:</span>
                            <div className="font-bold text-amber-400 font-mono">
                              {substation.currentLoadPercent}%
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Tezlik:</span>
                            <div className="font-bold text-emerald-400 font-mono">
                              {substation.gridFrequencyHz.toFixed(3)} Hz
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Qoşulu EV Sayı:</span>
                            <div className="font-bold text-white font-mono">
                              {substation.connectedEvCount} avto
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Aktiv İxrac Gücü:</span>
                            <div className="font-bold text-cyan-400 font-mono">
                              {substation.totalExportPowerKw} kW
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Qəza Xidməti: {substation.contactEmergency}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedSubstation(substation);
                            setSimulatedFrequencyHz(substation.gridFrequencyHz);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isSelected ? 'Seçildi' : 'Seç & Qoşul'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 10-POINT TECHNICAL & SAFETY AUDIT */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Azərişıq & Energetika Nazirliyi 10-Nöqtəli Təhlükəsizlik Auditi</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    V2G ikitərəfli şəbəkəyə ixrac üçün zəruri olan elektrik, rabitə və batareya təhlükəsizlik standartları
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Uyğunluq Reytinqi:</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {checklistEvaluation.scorePercentage}% ({checklistEvaluation.passedItems}/{checklistEvaluation.totalItems})
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${
                      checklistEvaluation.isEligibleForExport
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {checklistEvaluation.statusBadgeAz}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Məcburi bəndlər kəsildikdə V2G şəbəkə ixracı bloklanır.
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleSelectAllChecklist(true)}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Hamısını Təsdiqlə
                  </button>
                  <button
                    onClick={() => handleSelectAllChecklist(false)}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between space-x-4 ${
                      item.passed
                        ? 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                        : 'bg-red-950/10 border-red-900/40 hover:border-red-700/60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition ${
                          item.passed
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-600 bg-slate-800 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{item.titleAz}</h4>
                          {item.isMandatory && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Məcburi
                            </span>
                          )}
                          <span className="text-[10px] text-cyan-400 font-mono">
                            [{item.category}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.descriptionAz}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          Standart: {item.standardReference}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL THEORETICAL EXAMINATION SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5 text-emerald-400" />
                    <span>Aktiv İstehlakçı & V2G Təhlükəsizlik İmtahanı</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Energetika Nazirliyi və Azərişıq tərəfindən tələb olunan 10 test sualı (Keçid balı: 8/10)
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {isExamSubmitted && (
                    <div
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${
                        examGrading.passed
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}
                    >
                      {examGrading.verdictAz} ({examGrading.correctAnswers}/10)
                    </div>
                  )}
                  <button
                    onClick={handleResetExam}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="İmtahanı Sıfırla"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-5">
                {V2G_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedIdx = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Sual {idx + 1} / 10
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {q.legalCitation}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{q.questionAz}</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isChosen = selectedIdx === optIdx;
                          let btnStyle =
                            'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700';

                          if (isChosen) {
                            btnStyle = 'bg-cyan-950/60 border-cyan-500 text-white font-semibold';
                          }

                          if (isExamSubmitted) {
                            if (optIdx === q.correctIndex) {
                              btnStyle =
                                'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isChosen && optIdx !== q.correctIndex) {
                              btnStyle = 'bg-red-950/60 border-red-500 text-red-200 font-semibold';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerSelect(q.id, optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isExamSubmitted && optIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                          <span className="font-bold text-emerald-400">İzah: </span>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isExamSubmitted && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30"
                  >
                    Nəticəni Yoxla və Təsdiqlə
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: OFFICIAL CERTIFICATE & PUBLIC REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Active Certificate Showcase */}
              {activeCertificate && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 border-2 border-emerald-500/50 shadow-2xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Azərbaycan Respublikası Energetika Nazirliyi & Azərişıq ASC
                        </span>
                        <h3 className="text-lg font-black text-white">
                          RƏSMİ V2G ENERJİ İXRAC ŞƏHADƏTNAMƏSİ
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-emerald-400 font-bold">
                        {activeCertificate.certificateNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        SİMA: {activeCertificate.simaDigitalUid}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Nəqliyyat Vasitəsi:</span>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {activeCertificate.licensePlate}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Aktiv İstehlakçı:</span>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {activeCertificate.ownerFullName}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Azərişıq Sayğac Kodu:</span>
                      <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                        {activeCertificate.smartMeterCode}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">İcazə Verilən İxrac Gücü:</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        {activeCertificate.maxExportLimitKw} kW
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400">Təhkim Olunmuş Yarımstansiya:</span>
                      <div className="text-xs font-semibold text-white mt-0.5">
                        {activeCertificate.substationNameAz}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Etibarlılıq Müddəti:</span>
                      <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                        {activeCertificate.issueDate} — {activeCertificate.expiryDate} (1 İl)
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Checksum: {activeCertificate.securityChecksum} • QR Doğrulama Aktivdir
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyCode(activeCertificate.certificateNumber)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {copiedCode === activeCertificate.certificateNumber ? 'Kopyalandı' : 'Kodu Kopyala'}
                        </span>
                      </button>
                      <button
                        onClick={handlePrint}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Çap Et</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Public Registry Table */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>Azərişıq Aktiv V2G Şəhadətnamələr Reyestri</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Dövlət tərəfindən təsdiq edilmiş aktiv istehlakçıların və elektromobillərin vahid bazası
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Nömrə, FİN və ya sayğac axtar..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Şəhadətnamə №</th>
                        <th className="p-3">Dövlət Qeydiyyatı</th>
                        <th className="p-3">Sahibi</th>
                        <th className="p-3">Sayğac Kodu</th>
                        <th className="p-3">İxrac Gücü</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {filteredCertificates.map((cert) => (
                        <tr key={cert.certificateNumber} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-mono font-bold text-white">
                            {cert.certificateNumber}
                          </td>
                          <td className="p-3 font-mono text-emerald-400">{cert.licensePlate}</td>
                          <td className="p-3 text-slate-300">{cert.ownerFullName}</td>
                          <td className="p-3 font-mono text-cyan-400">{cert.smartMeterCode}</td>
                          <td className="p-3 font-mono text-slate-300">{cert.maxExportLimitKw} kW</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {cert.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setActiveCertificate(cert)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                            >
                              Bax
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Şəbəkə Statusu: 50.00 Hz Sinxronlaşdırılıb • IEEE 1547 & ISO 15118-20</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
