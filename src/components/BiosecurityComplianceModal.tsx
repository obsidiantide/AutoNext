import React, { useState, useMemo } from 'react';
import {
  Currency,
  AtpClass,
  PerishableCargoType,
  DisinfectantAgent,
  ATP_CLASSES_INFO,
  PERISHABLE_CARGO_INFO,
  DISINFECTANT_AGENTS_INFO,
  evaluateColdChainCompliance,
  evaluateDisinfectionBarrier,
  calculateBiosecurityFees,
  formatCurrency,
  generateCertificateSerial,
  generateCertificateHash,
} from '../utils/biosecurityCompliance';
import {
  MOCK_BIOSECURITY_CHECKPOINTS,
  MOCK_REEFER_PRESETS,
  BIOSECURITY_CHECKLIST_ITEMS,
  BIOSECURITY_EXAM_QUESTIONS,
  MOCK_VERIFIED_BIOSECURITY_CERTIFICATES,
  ReeferPreset,
} from '../data/mockBiosecurityData';
import {
  X,
  ShieldCheck,
  ThermometerSnowflake,
  FileText,
  AlertTriangle,
  Award,
  CheckCircle2,
  Copy,
  Printer,
  Search,
  Clock,
  MapPin,
  ExternalLink,
  Layers,
  Sparkles,
  Droplets,
  Microscope,
  Calculator,
  HelpCircle,
  Truck,
  Check,
} from 'lucide-react';

interface BiosecurityComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType =
  | 'cold_chain'
  | 'disinfection'
  | 'quarantine_lab'
  | 'checkpoints'
  | 'calculator'
  | 'exam'
  | 'certificate';

export const BiosecurityComplianceModal: React.FC<BiosecurityComplianceModalProps> = ({
  isOpen,
  onClose,
  currency: initialCurrency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('cold_chain');
  const [currency, setCurrency] = useState<Currency>(initialCurrency);

  // Selected Reefer Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOCK_REEFER_PRESETS[0].id);
  const activePreset: ReeferPreset = useMemo(
    () => MOCK_REEFER_PRESETS.find((p) => p.id === selectedPresetId) || MOCK_REEFER_PRESETS[0],
    [selectedPresetId]
  );

  // Interactive Cold-Chain Telemetry State
  const [cargoType, setCargoType] = useState<PerishableCargoType>(activePreset.cargoType);
  const [measuredTempC, setMeasuredTempC] = useState<number>(activePreset.measuredTempC);
  const [humidityPercent, setHumidityPercent] = useState<number>(activePreset.humidityPercent);
  const [atpClass, setAtpClass] = useState<AtpClass>(activePreset.atpClass);

  // Update telemetry when preset changes
  const handleSelectPreset = (preset: ReeferPreset) => {
    setSelectedPresetId(preset.id);
    setCargoType(preset.cargoType);
    setMeasuredTempC(preset.measuredTempC);
    setHumidityPercent(preset.humidityPercent);
    setAtpClass(preset.atpClass);
  };

  // Disinfection Arch Simulation State
  const [disinfectantAgent, setDisinfectantAgent] = useState<DisinfectantAgent>('QUATERNARY_AMMONIUM');
  const [agentConcentrationPpm, setAgentConcentrationPpm] = useState<number>(1200);
  const [nozzlePressureBar, setNozzlePressureBar] = useState<number>(45);
  const [passageSpeedKmh, setPassageSpeedKmh] = useState<number>(8);
  const [contactTimeMinutes, setContactTimeMinutes] = useState<number>(3.5);
  const [undercarriageCoveragePercent, setUndercarriageCoveragePercent] = useState<number>(96);

  // Quarantine Lab Sampling State
  const [pestInspectionPassed, setPestInspectionPassed] = useState<boolean>(true);
  const [pesticideMrlPercent, setPesticideMrlPercent] = useState<number>(45); // % of MRL limit
  const [antibioticResiduePpb, setAntibioticResiduePpb] = useState<number>(12); // ppb (threshold <= 50)
  const [gmoStatus, setGmoStatus] = useState<'NEGATIVE' | 'POSITIVE_DECLARED' | 'POSITIVE_UNDECLARED'>('NEGATIVE');

  // Calculator State
  const [calcCargoWeightTons, setCalcCargoWeightTons] = useState<number>(20);
  const [calcRequiresExpressPcr, setCalcRequiresExpressPcr] = useState<boolean>(true);
  const [calcRequiresDisinfection, setCalcRequiresDisinfection] = useState<boolean>(true);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'chk-1': true,
    'chk-2': true,
    'chk-3': true,
    'chk-4': true,
    'chk-5': true,
    'chk-6': true,
    'chk-7': true,
  });

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (!isExamSubmitted) {
      setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }
  };

  const examScore = useMemo(() => {
    let score = 0;
    BIOSECURITY_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctOptionIndex) {
        score++;
      }
    });
    return score;
  }, [examAnswers]);

  // Certificate & Registry State
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [certificateSerial, setCertificateSerial] = useState<string>(generateCertificateSerial());
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Evaluations
  const coldChainResult = useMemo(
    () => evaluateColdChainCompliance(cargoType, measuredTempC),
    [cargoType, measuredTempC]
  );

  const disinfectionResult = useMemo(
    () =>
      evaluateDisinfectionBarrier({
        agent: disinfectantAgent,
        agentConcentrationPpm,
        nozzlePressureBar,
        archPassageSpeedKmh: passageSpeedKmh,
        contactTimeMinutes,
        undercarriageCoveragePercent,
      }),
    [
      disinfectantAgent,
      agentConcentrationPpm,
      nozzlePressureBar,
      passageSpeedKmh,
      contactTimeMinutes,
      undercarriageCoveragePercent,
    ]
  );

  const feeBreakdown = useMemo(
    () =>
      calculateBiosecurityFees({
        cargoType,
        atpClass,
        cargoWeightTons: calcCargoWeightTons,
        isTransitOnly: true,
        requiresExpressPcr: calcRequiresExpressPcr,
        requiresDisinfectionBarrier: calcRequiresDisinfection,
        currency,
      }),
    [cargoType, atpClass, calcCargoWeightTons, calcRequiresExpressPcr, calcRequiresDisinfection, currency]
  );

  const securityHash = useMemo(
    () => generateCertificateHash(certificateSerial, activePreset.plateNumber),
    [certificateSerial, activePreset.plateNumber]
  );

  const filteredCertificates = useMemo(() => {
    if (!registrySearch.trim()) return MOCK_VERIFIED_BIOSECURITY_CERTIFICATES;
    const query = registrySearch.toLowerCase();
    return MOCK_VERIFIED_BIOSECURITY_CERTIFICATES.filter(
      (c) =>
        c.certificateSerial.toLowerCase().includes(query) ||
        c.plateNumber.toLowerCase().includes(query) ||
        c.carrierCompany.toLowerCase().includes(query) ||
        c.checkpointName.toLowerCase().includes(query)
    );
  }, [registrySearch]);

  const handleCopySerial = () => {
    navigator.clipboard?.writeText(certificateSerial);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/10 flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <ThermometerSnowflake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  AQTA, DGK & KTN Sərhəd Bioloji Təhlükəsizlik və Soyuq Zəncir Portalı
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  ATP / AQTA-BIO-2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                UNECE ATP Perishable Foodstuffs Agreement • EN 12830 Reefer Telemetry • Border Biosecurity Disinfection Arch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                    currency === c
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {[
            { id: 'cold_chain', label: 'Soyuq Zəncir (ATP)', icon: ThermometerSnowflake },
            { id: 'disinfection', label: 'Dezinfeksiya Baryeri', icon: Droplets },
            { id: 'quarantine_lab', label: 'Karantin & Laboratoriya', icon: Microscope },
            { id: 'checkpoints', label: 'Gömrük Məntəqələri', icon: MapPin },
            { id: 'calculator', label: 'Rüsum Kalkulyatoru', icon: Calculator },
            { id: 'exam', label: 'Bioloji İmtahan', icon: HelpCircle },
            { id: 'certificate', label: 'Rəsmi AQTA-BIO Sertifikatı', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: COLD CHAIN & EN 12830 REEFER TELEMETRY */}
          {activeTab === 'cold_chain' && (
            <div className="space-y-6">
              {/* Presets Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    Sərhəd Tranzit Nəqliyyat Preseti Seçin
                  </h3>
                  <span className="text-xs text-slate-400">
                    Avtomatik EN 12830 telemetriya və sensor məlumatları
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_REEFER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedPresetId === preset.id
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-900/20'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white tracking-wide">
                          {preset.plateNumber}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-md">
                          {preset.atpClass}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-300 mt-1 line-clamp-1">
                        {preset.nameAz}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {preset.measuredTempC}°C • {preset.cargoWeightTons} ton • {preset.carrierCompany}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Cold-Chain Telemetry Stand */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Gauges and Sliders */}
                <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ThermometerSnowflake className="w-5 h-5 text-teal-400" />
                      <h4 className="text-sm font-semibold text-white">
                        EN 12830 Rəqəmsal Termoqraf və Temperatur Tənzimləyicisi
                      </h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        coldChainResult.isCompliant
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      {coldChainResult.isCompliant ? 'NORMA DAXİLİNDƏ' : 'SAPMA / XƏBƏRDARLIQ'}
                    </span>
                  </div>

                  {/* Cargo Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1.5">
                        Məhsul Qrupu & Qida Kateqoriyası
                      </label>
                      <select
                        value={cargoType}
                        onChange={(e) => setCargoType(e.target.value as PerishableCargoType)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {Object.values(PERISHABLE_CARGO_INFO).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameAz} ({c.targetTempC}°C)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1.5">
                        ATP Reefer Sinfi & İstilik İzolyasiyası
                      </label>
                      <select
                        value={atpClass}
                        onChange={(e) => setAtpClass(e.target.value as AtpClass)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {Object.values(ATP_CLASSES_INFO).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} (K ≤ {c.maxKValue} W/m²·K)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Temperature Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Ölçülən Reefer Yük Temperaturu:
                      </span>
                      <span className="font-bold text-white text-sm">
                        {measuredTempC.toFixed(1)} °C
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="20"
                      step="0.2"
                      value={measuredTempC}
                      onChange={(e) => setMeasuredTempC(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>-30°C (Ultra-Deep)</span>
                      <span>-18°C (Dondurulmuş)</span>
                      <span>0°C (Buzlanma)</span>
                      <span>+4°C (Süd/Ət)</span>
                      <span>+14°C (Banan)</span>
                      <span>+20°C</span>
                    </div>
                  </div>

                  {/* Humidity Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Nisbi Rütubət (RH% Sensoru):
                      </span>
                      <span className="font-bold text-white text-sm">
                        {humidityPercent} %
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      step="1"
                      value={humidityPercent}
                      onChange={(e) => setHumidityPercent(parseInt(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                  </div>

                  {/* Status Banner */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      coldChainResult.isCompliant
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {coldChainResult.isCompliant ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                    )}
                    <div className="text-xs">
                      <div className="font-bold mb-0.5">
                        {coldChainResult.isCompliant
                          ? 'Soyuq Zəncir İnteqriteti Təsdiq Edildi'
                          : 'Temperatur Sapması Bildirildi'}
                      </div>
                      <div>{coldChainResult.statusMessageAz}</div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Technical Specifications */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ATP Standart Texniki Parametrləri
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">ATP Sinif Təyinatı:</span>
                      <span className="font-semibold text-emerald-400">
                        {ATP_CLASSES_INFO[atpClass].code}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">İstilik İtki Əmsalı (K):</span>
                      <span className="font-semibold text-white">
                        ≤ {ATP_CLASSES_INFO[atpClass].maxKValue} W/(m²·K)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Hədəf Temperatur:</span>
                      <span className="font-semibold text-white">
                        {PERISHABLE_CARGO_INFO[cargoType].targetTempC} °C
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Yolverilən Diapazon:</span>
                      <span className="font-semibold text-white">
                        {PERISHABLE_CARGO_INFO[cargoType].minAllowedTempC}°C ...{' '}
                        {PERISHABLE_CARGO_INFO[cargoType].maxAllowedTempC}°C
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Optimal Rütubət:</span>
                      <span className="font-semibold text-white">
                        {PERISHABLE_CARGO_INFO[cargoType].targetHumidityPercent} %
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Saxlama Müddəti:</span>
                      <span className="font-semibold text-white">
                        {PERISHABLE_CARGO_INFO[cargoType].shelfLifeDays} gün
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nəzarət Növü:</span>
                      <span className="font-semibold text-teal-300">
                        {PERISHABLE_CARGO_INFO[cargoType].inspectionType}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      {ATP_CLASSES_INFO[atpClass].descriptionAz}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BIOSECURITY DISINFECTION BARRIER */}
          {activeTab === 'disinfection' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Avtomatlaşdırılmış Sərhəd Sanitariya və Dezinfeksiya Baryeri Simulyatoru
                      </h4>
                      <p className="text-xs text-slate-400">
                        NK Qərarı № 213 • Şassi, təkər və palçıqqoruyanların antivirus çiləmə telemetriyası
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      disinfectionResult.passed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    Baryer Nəticəsi: {disinfectionResult.passed ? 'KEÇDİ (QƏNAƏTBƏXŞ)' : 'KƏSİLDİ'}
                  </span>
                </div>

                {/* Disinfection Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Agent */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">
                      Dezinfeksiya Maddəsi
                    </label>
                    <select
                      value={disinfectantAgent}
                      onChange={(e) => setDisinfectantAgent(e.target.value as DisinfectantAgent)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {Object.entries(DISINFECTANT_AGENTS_INFO).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Concentration */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Məhlul Konsentrasiyası (ppm):</span>
                      <span className="font-bold text-white">{agentConcentrationPpm} ppm</span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="2000"
                      step="50"
                      value={agentConcentrationPpm}
                      onChange={(e) => setAgentConcentrationPpm(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Pressure */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Püskürtmə Təzyiqi (bar):</span>
                      <span className="font-bold text-white">{nozzlePressureBar} bar</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="1"
                      value={nozzlePressureBar}
                      onChange={(e) => setNozzlePressureBar(parseInt(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                  </div>

                  {/* Speed */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Qövs Keçid Sürəti:</span>
                      <span className="font-bold text-white">{passageSpeedKmh} km/saat</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="25"
                      step="1"
                      value={passageSpeedKmh}
                      onChange={(e) => setPassageSpeedKmh(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">Maksimal icazə: ≤ 10 km/saat</span>
                  </div>

                  {/* Contact Time */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Təmas Müddəti:</span>
                      <span className="font-bold text-white">{contactTimeMinutes} dəqiqə</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.5"
                      value={contactTimeMinutes}
                      onChange={(e) => setContactTimeMinutes(parseFloat(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                  </div>

                  {/* Coverage */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Şassi & Təkər Örtüyü:</span>
                      <span className="font-bold text-white">{undercarriageCoveragePercent} %</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="1"
                      value={undercarriageCoveragePercent}
                      onChange={(e) => setUndercarriageCoveragePercent(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Score and Notes */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Bioloji Təmizlik Əmsalı:</div>
                    <div className="text-lg font-bold text-emerald-400">
                      {disinfectionResult.coverageScore} / 100 xal
                    </div>
                    <div className="text-xs text-slate-300 mt-1">{disinfectionResult.notesAz}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded-lg ${
                        disinfectionResult.effectiveBiosecurity
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {disinfectionResult.effectiveBiosecurity
                        ? 'BURAXILIŞ TƏSDİQ EDİLDİ'
                        : 'TƏKRAR YUMA TƏLƏB OLUNUR'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUARANTINE & LAB SAMPLING */}
          {activeTab === 'quarantine_lab' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Microscope className="w-5 h-5 text-teal-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Sərhəd Baytarlıq, Fitosanitar və PCR Karantin Laboratoriyası
                      </h4>
                      <p className="text-xs text-slate-400">
                        Qida Təhlükəsizliyi Qanunu Maddə 24 • Karantin zərərvericiləri, pestisid MRL və antibiotik monitorinqi
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full">
                    AQTA AKKREDİTƏ LAB
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Pest inspection */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Fitosanitar Karantin Zərərvericiləri
                      </span>
                      <button
                        onClick={() => setPestInspectionPassed(!pestInspectionPassed)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                          pestInspectionPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {pestInspectionPassed ? 'ZƏRƏRVERİCİ AŞKARLANMADI' : 'MÜSBƏT (TƏHLÜKƏLİ)'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Qəhvəyi mərmər bağacığı (Halyomorpha halys), Kolorado böcəyi və Aralıq dənizi meyvə milçəyi yoxlanışı.
                    </p>
                  </div>

                  {/* Pesticides MRL */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Pestisid Qalığı (MRL %):</span>
                      <span
                        className={`font-bold ${
                          pesticideMrlPercent <= 100 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pesticideMrlPercent}% {pesticideMrlPercent <= 100 ? '(Norma)' : '(Normadan Artıq)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="180"
                      step="5"
                      value={pesticideMrlPercent}
                      onChange={(e) => setPesticideMrlPercent(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">
                      Maksimal icazə verilən qalıq həddi (MRL): ≤ 100%. Artıq olduqda utilizasiya və ya geri qaytarılma.
                    </p>
                  </div>

                  {/* Veterinary Antibiotics */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Baytarlıq Antibiotik Qalığı (ppb):</span>
                      <span
                        className={`font-bold ${
                          antibioticResiduePpb <= 50 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {antibioticResiduePpb} ppb (Limit: ≤50 ppb)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="2"
                      value={antibioticResiduePpb}
                      onChange={(e) => setAntibioticResiduePpb(parseInt(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">
                      Xloramfenikol, tetrasiklin və nitrofuran qrupu antibiotiklərinin ekspress immunoferment analizi.
                    </p>
                  </div>

                  {/* GMO Screen */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">GMO / Genetik Modifikasiya:</span>
                      <select
                        value={gmoStatus}
                        onChange={(e) =>
                          setGmoStatus(e.target.value as 'NEGATIVE' | 'POSITIVE_DECLARED' | 'POSITIVE_UNDECLARED')
                        }
                        className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white"
                      >
                        <option value="NEGATIVE">Mənfi (0% GMO - Təmiz)</option>
                        <option value="POSITIVE_DECLARED">Bəyan edilmiş (Yem məqsədli)</option>
                        <option value="POSITIVE_UNDECLARED">Bəyan edilməmiş (Qadağan olunmuş)</option>
                      </select>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Qida məhsullarında bəyan edilməmiş GMO tərkibin aşkarlanması yükün dərhal saxlanılmasına səbəb olur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BORDER CHECKPOINTS RADAR */}
          {activeTab === 'checkpoints' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Azərbaycan Respublikası Sərhəd Buraxılış Məntəqələri Radarı
                  </h3>
                  <p className="text-xs text-slate-400">
                    AQTA Bioloji Təhlükəsizlik və Dezinfeksiya Çəpərləri Məlumat Bazası
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-medium">
                  {MOCK_BIOSECURITY_CHECKPOINTS.length} Strateji Məntəqə
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_BIOSECURITY_CHECKPOINTS.map((bcp) => (
                  <div
                    key={bcp.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{bcp.nameAz}</h4>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {bcp.locationAz}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                        {bcp.neighborCountry}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[11px] text-slate-400 mb-0.5">Dezinfeksiya Qövsü Tipi:</div>
                      <div className="font-medium text-emerald-300">{bcp.disinfectionArchType}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Gündəlik Güc</div>
                        <div className="font-bold text-white">{bcp.dailyCapacityTrucks} TIR</div>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Reefer Növbəsi</div>
                        <div className="font-bold text-emerald-400">{bcp.currentQueueReefers} maşın</div>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Orta Müayinə</div>
                        <div className="font-bold text-white">{bcp.avgInspectionTimeMinutes} dəq</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STATUTORY FEES CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inputs */}
                <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    Bioloji Təhlükəsizlik və Karantin Rüsum Hesablayıcısı
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1.5">
                        Yükün Çəkisi (Ton)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={calcCargoWeightTons}
                        onChange={(e) => setCalcCargoWeightTons(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex flex-col justify-end space-y-2">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={calcRequiresDisinfection}
                          onChange={(e) => setCalcRequiresDisinfection(e.target.checked)}
                          className="rounded accent-emerald-500"
                        />
                        Sərhəd Dezinfeksiya Çəpəri Keçidi (İcbari)
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={calcRequiresExpressPcr}
                          onChange={(e) => setCalcRequiresExpressPcr(e.target.checked)}
                          className="rounded accent-emerald-500"
                        />
                        Ekspress PCR / Pestisid Laboratoriya Analizi (+50 AZN)
                      </label>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="pt-3">
                    <h5 className="text-xs font-bold text-slate-300 mb-2">
                      Məcburi AQTA/DGK İkili Nəzarət Yoxlama Siyahısı:
                    </h5>
                    <div className="space-y-2">
                      {BIOSECURITY_CHECKLIST_ITEMS.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            checkedItems[item.id]
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{item.titleAz}</span>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                              checkedItems[item.id]
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold'
                                : 'border-slate-600'
                            }`}
                          >
                            {checkedItems[item.id] && <Check className="w-3 h-3" />}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Receipt Breakdown */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                    Rəsmi Rüsum və Xidmət Qəbzi
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dezinfeksiya Baryeri:</span>
                      <span className="font-semibold text-white">
                        {feeBreakdown.disinfectionFeeAzn} AZN
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Baytarlıq / Fito Dövlət Rüsumu:</span>
                      <span className="font-semibold text-white">
                        {feeBreakdown.veterinaryDutyAzn || feeBreakdown.phytosanitaryDutyAzn} AZN
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ATP Termoqraf Kalibrasiyası:</span>
                      <span className="font-semibold text-white">
                        {feeBreakdown.atpCalibrationAuditFeeAzn} AZN
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ekspress PCR Analizi:</span>
                      <span className="font-semibold text-white">
                        {feeBreakdown.labPcrAnalysisFeeAzn} AZN
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2">
                      <span className="text-slate-400">ƏDV (18% xidmət üzrə):</span>
                      <span className="font-semibold text-slate-300">
                        {feeBreakdown.vat18Azn} AZN
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-2 text-sm font-bold">
                      <span className="text-white">Yekun Məbləğ:</span>
                      <span className="text-emerald-400">
                        {formatCurrency(feeBreakdown.totalConverted, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: THEORETICAL EXAMINATION */}
          {activeTab === 'exam' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    AQTA & UNECE ATP Bioloji Təhlükəsizlik və Soyuq Zəncir İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sürücü və logistika operatorları üçün rəsmi attestasiya sualları (10 Sual)
                  </p>
                </div>
                {isExamSubmitted && (
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      examScore >= 8
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}
                  >
                    NƏTİCƏ: {examScore} / 10 Xal ({examScore >= 8 ? 'MÜVƏFFƏQ' : 'QEYRİ-KAFİ'})
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {BIOSECURITY_EXAM_QUESTIONS.map((q) => {
                  const userAnswer = examAnswers[q.id];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = userAnswer === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-xs font-bold text-white">
                          <span className="text-emerald-400 mr-1.5">Sual #{q.id}:</span>
                          {q.questionAz}
                        </div>
                        {isExamSubmitted && (
                          <span
                            className={`text-xs font-bold ${
                              isCorrect ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isCorrect ? 'DÜZGÜN' : 'SƏHV'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.optionsAz.map((opt, idx) => {
                          const isSelected = userAnswer === idx;
                          let btnStyle =
                            'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (isExamSubmitted) {
                            if (idx === q.correctOptionIndex) {
                              btnStyle =
                                'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (isSelected) {
                              btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-300';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-300 font-medium';
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(q.id, idx)}
                              disabled={isExamSubmitted}
                              className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <span className="font-semibold text-emerald-400">İzah: </span>
                          {q.explanationAz} ({q.legalCitation})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isExamSubmitted ? (
                <button
                  onClick={() => setIsExamSubmitted(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
                >
                  İmtahan Nəticələrini Təsdiq Et və Qiymətləndir
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsExamSubmitted(false);
                    setExamAnswers({});
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  Yenidən Sınaqdan Keç
                </button>
              )}
            </div>
          )}

          {/* TAB 7: OFFICIAL CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Certificate Card */}
              <div className="bg-slate-950/90 border-2 border-emerald-500/40 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-wide">
                        AZƏRBAYCAN RESPUBLİKASI QİDA TƏHLÜKƏSİZLİYİ AGENTLİYİ
                      </h3>
                      <p className="text-xs text-emerald-400 font-semibold">
                        Sərhəd Keçid Məntəqəsi Bioloji Təhlükəsizlik və Soyuq Zəncir Buraxılış Sertifikatı
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Sertifikat Nömrəsi:</div>
                    <div className="text-sm font-mono font-bold text-white">{certificateSerial}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nəqliyyat Vasitəsi:</span>
                    <span className="font-bold text-white text-sm">
                      {activePreset.plateNumber}
                    </span>
                    <div className="text-[11px] text-slate-400">{activePreset.tractorModel}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Reefer Furqon / Aqreqat:</span>
                    <span className="font-bold text-white">{activePreset.trailerModel}</span>
                    <div className="text-[11px] text-emerald-400 font-semibold">{atpClass} Sinif</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Daşıyıcı Şirkət:</span>
                    <span className="font-bold text-white">{activePreset.carrierCompany}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Məhsul Təyinatı:</span>
                    <span className="font-bold text-white">
                      {PERISHABLE_CARGO_INFO[cargoType].nameAz}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ölçülən Temperatur:</span>
                    <span className="font-bold text-emerald-400">{measuredTempC.toFixed(1)} °C</span>
                    <div className="text-[11px] text-slate-400">RH: {humidityPercent}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Dezinfeksiya Baryeri:</span>
                    <span className="font-bold text-emerald-400">
                      {disinfectionResult.passed ? 'TƏSDİQ OLUNDU (100%)' : 'YENİDƏN YUMA'}
                    </span>
                  </div>
                </div>

                {/* Footer Security Badges */}
                <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
                  <div className="text-slate-400 font-mono">
                    Təhlükəsizlik Haşı: <span className="text-emerald-400">{securityHash}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySerial}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {isCopied ? 'Kopyalandı' : 'Kodu Kopyala'}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Çap Et
                    </button>
                  </div>
                </div>
              </div>

              {/* Public Registry Search */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">
                    AQTA Vahid Elektron Sertifikat Reyestri
                  </h4>
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Serial, nömrə və ya daşıyıcı..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Sertifikat</th>
                        <th className="p-2.5">Nömrə</th>
                        <th className="p-2.5">Daşıyıcı</th>
                        <th className="p-2.5">Yük & ATP</th>
                        <th className="p-2.5">Temperatur</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredCertificates.map((cert) => (
                        <tr key={cert.certificateSerial} className="hover:bg-slate-900/60">
                          <td className="p-2.5 font-mono text-emerald-400 font-semibold">
                            {cert.certificateSerial}
                          </td>
                          <td className="p-2.5 font-bold text-white">{cert.plateNumber}</td>
                          <td className="p-2.5 text-slate-300">{cert.carrierCompany}</td>
                          <td className="p-2.5 text-slate-300">
                            {PERISHABLE_CARGO_INFO[cert.cargoType]?.nameAz || cert.cargoType} (
                            {cert.atpClass})
                          </td>
                          <td className="p-2.5 font-mono text-emerald-300">{cert.measuredTempC}°C</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
                              {cert.quarantineLabStatus}
                            </span>
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
      </div>
    </div>
  );
};
