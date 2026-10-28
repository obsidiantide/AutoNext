import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Gauge,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Printer,
  Copy,
  RotateCcw,
  Zap,
  Radio,
  FileText,
  MapPin,
  CheckSquare,
  GraduationCap,
  Award,
  ExternalLink,
  Lock,
  Building2,
  Sliders,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  formatCurrency,
  AdrVehicleCategory,
  ADR_VEHICLE_CATEGORIES,
  TankerHydrostaticTelemetry,
  FlameArresterGroundingTelemetry,
  evaluateTankerCompliance,
  calculateTankerInspectionCosts,
  generateTankerCertificateHash,
  AdrTankerApprovalCertificate,
} from '../utils/tankerSafetyCompliance';
import {
  MOCK_TANKER_PRESETS,
  MOCK_ADR_TERMINALS,
  MOCK_TANKER_CHECKLIST_ITEMS,
  MOCK_ADR_EXAM_QUESTIONS,
  MOCK_ACTIVE_CERTIFICATES,
  TankerPreset,
} from '../data/mockTankerSafetyData';

export interface TankerSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle;
  currency?: Currency;
}

export type TankerModalTab =
  | 'telemetry'
  | 'calculator'
  | 'terminals'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const TankerSafetyModal: React.FC<TankerSafetyModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency: initialCurrency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TankerModalTab>('telemetry');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialCurrency);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOCK_TANKER_PRESETS[0].id);

  // Active preset state
  const currentPreset: TankerPreset = useMemo(() => {
    return (
      MOCK_TANKER_PRESETS.find(p => p.id === selectedPresetId) || MOCK_TANKER_PRESETS[0]
    );
  }, [selectedPresetId]);

  // Telemetry Inputs State
  const [hydrostatic, setHydrostatic] = useState<TankerHydrostaticTelemetry>(
    currentPreset.hydrostaticTelemetry
  );
  const [flameArrester, setFlameArrester] = useState<FlameArresterGroundingTelemetry>(
    currentPreset.flameArresterTelemetry
  );
  const [vehicleCategory, setVehicleCategory] = useState<AdrVehicleCategory>(
    currentPreset.category
  );

  // Cost calculator toggles
  const [needsPoliceEscort, setNeedsPoliceEscort] = useState<boolean>(false);
  const [includeNdt, setIncludeNdt] = useState<boolean>(true);

  // Terminals radar search
  const [terminalSearch, setTerminalSearch] = useState<string>('');

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MOCK_TANKER_CHECKLIST_ITEMS.forEach(item => {
      initial[item.id] = true;
    });
    return initial;
  });

  // Exam state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Copy feedback
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Registry search state
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryStatusFilter, setRegistryStatusFilter] = useState<'ALL' | 'ACTIVE_APPROVED' | 'REVOKED_DEFECT'>('ALL');

  // Handle Preset Change
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = MOCK_TANKER_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setHydrostatic(preset.hydrostaticTelemetry);
      setFlameArrester(preset.flameArresterTelemetry);
      setVehicleCategory(preset.category);
    }
  };

  // Evaluation computation
  const complianceEvaluation = useMemo(() => {
    return evaluateTankerCompliance(hydrostatic, flameArrester, vehicleCategory);
  }, [hydrostatic, flameArrester, vehicleCategory]);

  // Cost computation
  const inspectionCosts = useMemo(() => {
    return calculateTankerInspectionCosts(
      vehicleCategory,
      needsPoliceEscort,
      includeNdt,
      selectedCurrency
    );
  }, [vehicleCategory, needsPoliceEscort, includeNdt, selectedCurrency]);

  // Terminals filtering
  const filteredTerminals = useMemo(() => {
    const q = terminalSearch.toLowerCase().trim();
    if (!q) return MOCK_ADR_TERMINALS;
    return MOCK_ADR_TERMINALS.filter(
      t =>
        t.nameAz.toLowerCase().includes(q) ||
        t.locationAz.toLowerCase().includes(q) ||
        t.primarySubstancesAz.some(s => s.toLowerCase().includes(q)) ||
        t.unCodes.some(u => u.toLowerCase().includes(q))
    );
  }, [terminalSearch]);

  // Checklist score computation
  const checklistScore = useMemo(() => {
    let earned = 0;
    let total = 0;
    let mandatoryPassed = true;

    MOCK_TANKER_CHECKLIST_ITEMS.forEach(item => {
      total += item.weight;
      if (checkedItems[item.id]) {
        earned += item.weight;
      } else if (item.isMandatory) {
        mandatoryPassed = false;
      }
    });

    const percentage = Math.round((earned / total) * 100);
    return {
      percentage,
      mandatoryPassed,
      isReady: percentage >= 85 && mandatoryPassed,
    };
  }, [checkedItems]);

  const toggleChecklistItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAllChecklist = () => {
    const allChecked: Record<string, boolean> = {};
    MOCK_TANKER_CHECKLIST_ITEMS.forEach(item => {
      allChecked[item.id] = true;
    });
    setCheckedItems(allChecked);
  };

  // Exam Evaluation
  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_ADR_EXAM_QUESTIONS.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    const percentage = Math.round((correct / MOCK_ADR_EXAM_QUESTIONS.length) * 100);
    return {
      correct,
      total: MOCK_ADR_EXAM_QUESTIONS.length,
      percentage,
      passed: correct >= 9,
    };
  }, [selectedAnswers]);

  const handleSelectExamAnswer = (questionId: number, optionIndex: number) => {
    if (examSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleResetExam = () => {
    setSelectedAnswers({});
    setExamSubmitted(false);
  };

  // Generated Certificate
  const generatedCertificate: AdrTankerApprovalCertificate = useMemo(() => {
    const plate = vehicle?.plateNumber || currentPreset.vehiclePlate;
    const vin = vehicle?.vin || currentPreset.chassisVin;
    const tankSerial = currentPreset.tankSerialNumber;
    const hash = generateTankerCertificateHash(plate, vin, tankSerial, vehicleCategory);

    return {
      certificateId: `ADR-AZ-2026-${Math.abs(parseInt(hash.slice(0, 6), 16) % 90000 + 10000)}`,
      vehiclePlate: plate,
      chassisVin: vin,
      carrierCompanyName: currentPreset.carrierName,
      carrierVoen: currentPreset.carrierVoen,
      vehicleCategory,
      tankSerialNumber: tankSerial,
      tankManufacturer: currentPreset.tankManufacturer,
      tankCapacityLiters: currentPreset.tankCapacityLiters,
      tankCompartmentsCount: currentPreset.tankCompartments,
      hydrostaticTestDate: '2026-03-15',
      hydrostaticNextDueDate: '2029-03-15',
      permittedUnNumbers: [currentPreset.unCode, 'UN 1202', 'UN 1223'],
      flameArresterModel: 'Protego FL-Ex-IIB / ATEX 2026',
      staticGroundResistanceOhms: flameArrester.staticGroundResistanceOhms,
      inspectionInspectorName: 'Polkovnik-leytenant F. Quliyev (FHN DYNX Baş İnspektor)',
      issueDate: '2026-03-15',
      expiryDate: '2027-03-15',
      status: complianceEvaluation.isFullyCompliant ? 'ACTIVE_APPROVED' : 'REVOKED_DEFECT',
      securityHashSha256: hash,
      simaSignatureUid: `SIMA-FHN-2026-${plate.replace(/-/g, '')}-AZ`,
    };
  }, [vehicle, currentPreset, vehicleCategory, flameArrester, complianceEvaluation]);

  const handleCopyCertificateCode = () => {
    navigator.clipboard?.writeText(generatedCertificate.certificateId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Registry filter
  const filteredRegistry = useMemo(() => {
    const q = registrySearch.toLowerCase().trim();
    return MOCK_ACTIVE_CERTIFICATES.filter(cert => {
      const matchesStatus =
        registryStatusFilter === 'ALL' || cert.status === registryStatusFilter;
      const matchesQuery =
        !q ||
        cert.certificateId.toLowerCase().includes(q) ||
        cert.vehiclePlate.toLowerCase().includes(q) ||
        cert.carrierCompanyName.toLowerCase().includes(q) ||
        cert.tankSerialNumber.toLowerCase().includes(q) ||
        cert.permittedUnNumbers.some(u => u.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [registrySearch, registryStatusFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Flame className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/30 border border-white/20 text-amber-200">
                  FHN DÖVLƏT YANĞIN NƏZARƏTİ XİDMƏTİ (DYNX) & BDYP
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/20 text-white">
                  UNECE ADR PART 9
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight mt-0.5">
                Təhlükəli Yüklər (ADR) və Yanacaq Sisternləri Təhlükəsizlik Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/20">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map(cur => (
                <button
                  key={cur}
                  onClick={() => setSelectedCurrency(cur)}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                    selectedCurrency === cur
                      ? 'bg-white text-orange-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Bağla"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Preset Selector Banner */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Sınaq Şablonları (Presets):
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {MOCK_TANKER_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-orange-600 text-white shadow-sm ring-2 ring-orange-400/50'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {preset.vehiclePlate} ({preset.category})
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 overflow-x-auto">
          {[
            { id: 'telemetry', label: 'Hidrostatik & Telemetriya', icon: Gauge },
            { id: 'calculator', label: 'FHN Rüsum Kalkulyatoru', icon: ShieldCheck },
            { id: 'terminals', label: 'Neft-Kimya Terminalları', icon: MapPin },
            { id: 'checklist', label: '10 Bəndlik Yoxlama', icon: CheckSquare },
            { id: 'exam', label: 'ADR Sürücü İmtahanı', icon: GraduationCap },
            { id: 'certificate', label: 'ADR-AZ-2026 Şəhadətnamə', icon: Award },
            { id: 'registry', label: 'Vahid Reyestr', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TankerModalTab)}
                className={`flex items-center space-x-2 py-3.5 px-4 font-medium text-xs md:text-sm border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              {/* Vehicle Preset Info Card */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm px-2 py-0.5 bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold rounded">
                      {currentPreset.vehiclePlate}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-orange-600 text-white font-semibold rounded">
                      {currentPreset.category} Kateqoriyası
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded">
                      Kemler: {currentPreset.kemlerCode} / {currentPreset.unCode}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mt-1">
                    {currentPreset.vehicleModel}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Daşıyıcı: <span className="font-medium">{currentPreset.carrierName}</span> (VÖEN: {currentPreset.carrierVoen})
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                    Əsas Təhlükəli Yük: {currentPreset.primaryCargoAz}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Çən Gövdə Seriyası:</div>
                  <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {currentPreset.tankSerialNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Tutumu & Bölmə Sayı:</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {currentPreset.tankCapacityLiters.toLocaleString()} L ({currentPreset.tankCompartments} bölmə)
                  </div>
                </div>
              </div>

              {/* Interactive Telemetry Stand Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel A: Hydrostatic Test & Thickness */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        Hidrostatik Təzyiq & Divar Qalınlığı
                      </h4>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        complianceEvaluation.hydrostaticPassed && complianceEvaluation.thicknessPassed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }`}
                    >
                      {complianceEvaluation.hydrostaticPassed && complianceEvaluation.thicknessPassed
                        ? 'SINAQDAN KEÇDİ'
                        : 'DEFEKT AŞKARLANDI'}
                    </span>
                  </div>

                  {/* Sınaq Təzyiqi */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        Hidravlik Sınaq Təzyiqi:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {hydrostatic.testPressureBar.toFixed(1)} bar
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="30.0"
                      step="0.1"
                      value={hydrostatic.testPressureBar}
                      onChange={e =>
                        setHydrostatic({ ...hydrostatic, testPressureBar: parseFloat(e.target.value) })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Təzyiq İtkisi */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        30 dəq ərzində Təzyiq İtkisi (ΔP):
                      </span>
                      <span
                        className={`font-bold ${
                          hydrostatic.pressureDropBar === 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {hydrostatic.pressureDropBar.toFixed(2)} bar (Maks: 0.00 bar)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="0.5"
                      step="0.01"
                      value={hydrostatic.pressureDropBar}
                      onChange={e =>
                        setHydrostatic({ ...hydrostatic, pressureDropBar: parseFloat(e.target.value) })
                      }
                      className="w-full accent-red-600"
                    />
                  </div>

                  {/* Divar Qalınlığı (Ultrasəs) */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        Ultrasəs NDT Gövdə Qalınlığı:
                      </span>
                      <span
                        className={`font-bold ${
                          hydrostatic.shellThicknessMm >= hydrostatic.minNominalThicknessMm
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {hydrostatic.shellThicknessMm.toFixed(1)} mm (Min tələb: {hydrostatic.minNominalThicknessMm.toFixed(1)} mm)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="15.0"
                      step="0.1"
                      value={hydrostatic.shellThicknessMm}
                      onChange={e =>
                        setHydrostatic({ ...hydrostatic, shellThicknessMm: parseFloat(e.target.value) })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Pnevmatik Qəza Klapanı */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        Daxili Dib Klapanının (Foot valve) Qəza Bağlanma Müddəti:
                      </span>
                      <span
                        className={`font-bold ${
                          hydrostatic.bottomValveClosureSeconds <= 5.0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {hydrostatic.bottomValveClosureSeconds.toFixed(1)} san (Norma: ≤ 5.0 san)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="12.0"
                      step="0.1"
                      value={hydrostatic.bottomValveClosureSeconds}
                      onChange={e =>
                        setHydrostatic({
                          ...hydrostatic,
                          bottomValveClosureSeconds: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-orange-600"
                    />
                  </div>

                  {/* Qırılma Zəif Zolağı (Shear Groove) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Qəza Qırılma Kompensatoru (Shear Groove):
                    </span>
                    <button
                      onClick={() =>
                        setHydrostatic({ ...hydrostatic, shearGrooveIntact: !hydrostatic.shearGrooveIntact })
                      }
                      className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                        hydrostatic.shearGrooveIntact
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }`}
                    >
                      {hydrostatic.shearGrooveIntact ? 'Qorunur / Bütöv' : 'Zədələnib / İtirilmiş'}
                    </button>
                  </div>
                </div>

                {/* Panel B: Flame Arrester & Grounding Telemetry */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        Alovsöndürən & Statik Torpaqlama
                      </h4>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        complianceEvaluation.flameArresterPassed && complianceEvaluation.groundingPassed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }`}
                    >
                      {complianceEvaluation.flameArresterPassed && complianceEvaluation.groundingPassed
                        ? 'TEXNİKİ NORMADA'
                        : 'RİSKLİ / DEFİSİT'}
                    </span>
                  </div>

                  {/* Flame Arrester Cleanliness */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        Qığılcımsöndürən Torun Təmizliyi:
                      </span>
                      <span
                        className={`font-bold ${
                          flameArrester.flameArresterCleanlinessPercent >= 80
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {flameArrester.flameArresterCleanlinessPercent}% (Min: 80%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      step="1"
                      value={flameArrester.flameArresterCleanlinessPercent}
                      onChange={e =>
                        setFlameArrester({
                          ...flameArrester,
                          flameArresterCleanlinessPercent: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {/* Pressure Drop Delta P */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        Egzoz Əks Təzyiq Düşgüsü (ΔP):
                      </span>
                      <span
                        className={`font-bold ${
                          flameArrester.pressureDropMbar <= 15
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {flameArrester.pressureDropMbar.toFixed(1)} mbar (Maks: 15.0 mbar)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="35.0"
                      step="0.5"
                      value={flameArrester.pressureDropMbar}
                      onChange={e =>
                        setFlameArrester({
                          ...flameArrester,
                          pressureDropMbar: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-orange-500"
                    />
                  </div>

                  {/* Grounding Resistance */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        Statik Elektrik Torpaqlama Müqaviməti:
                      </span>
                      <span
                        className={`font-bold ${
                          flameArrester.staticGroundResistanceOhms <= 10.0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {flameArrester.staticGroundResistanceOhms.toFixed(1)} Ω (ADR Norma: ≤ 10.0 Ω)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="50.0"
                      step="0.5"
                      value={flameArrester.staticGroundResistanceOhms}
                      onChange={e =>
                        setFlameArrester({
                          ...flameArrester,
                          staticGroundResistanceOhms: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-red-600"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        ADR Master Switch (İkiqütblü Batareya Açarı):
                      </span>
                      <button
                        onClick={() =>
                          setFlameArrester({
                            ...flameArrester,
                            batteryMasterSwitchOperable: !flameArrester.batteryMasterSwitchOperable,
                          })
                        }
                        className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                          flameArrester.batteryMasterSwitchOperable
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        }`}
                      >
                        {flameArrester.batteryMasterSwitchOperable ? 'İşləkdir' : 'Xətalı'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        Overfill Dolma Həddi Sensoru (EN 13922):
                      </span>
                      <button
                        onClick={() =>
                          setFlameArrester({
                            ...flameArrester,
                            overfillSensorOperational: !flameArrester.overfillSensorOperational,
                          })
                        }
                        className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                          flameArrester.overfillSensorOperational
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        }`}
                      >
                        {flameArrester.overfillSensorOperational ? 'Aktiv / Cavab Verir' : 'Qeyri-aktiv'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        Vapor Recovery Qaz Dövriyyə Klapanı (VRU):
                      </span>
                      <button
                        onClick={() =>
                          setFlameArrester({
                            ...flameArrester,
                            vaporRecoveryValveSealed: !flameArrester.vaporRecoveryValveSealed,
                          })
                        }
                        className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                          flameArrester.vaporRecoveryValveSealed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {flameArrester.vaporRecoveryValveSealed ? 'Hermetik' : 'Mikro-sızma'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Comprehensive Audit Summary */}
              <div
                className={`p-5 rounded-xl border ${
                  complianceEvaluation.isFullyCompliant
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    {complianceEvaluation.isFullyCompliant ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {complianceEvaluation.isFullyCompliant
                            ? 'FHN DYNX Təhlükəsizlik Normativlərinə Tam Uyğundur'
                            : 'Kritik Təhlükəsizlik Qüsurları Qeydə Alındı!'}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded font-black bg-white dark:bg-slate-800 border">
                          İndeks: {complianceEvaluation.overallScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {complianceEvaluation.isFullyCompliant
                          ? 'Sistern çəninin hidrostatik təzyiq, alovkəsici tor və torpaqlama telemetriyası ADR Part 9 tələblərinə cavab verir.'
                          : 'Aşkar edilmiş defektlər aradan qaldırılmadan nəqliyyat vasitəsinin reysə və ya neft terminalına girişi QADAĞANDIR!'}
                      </p>
                    </div>
                  </div>

                  {!complianceEvaluation.isFullyCompliant && complianceEvaluation.finesRiskAzn > 0 && (
                    <div className="text-right bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-xs text-slate-500">İXM 323 Cərimə Riski:</div>
                      <div className="text-lg font-black text-red-600 dark:text-red-400">
                        {formatCurrency(complianceEvaluation.finesRiskAzn, selectedCurrency)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Defects & Citations */}
                {complianceEvaluation.criticalDefectsAz.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800/60 space-y-1.5">
                    <span className="text-xs font-bold text-red-800 dark:text-red-300">
                      Təxirəsalınmaz Aradan Qaldırılmalı Qüsurlar:
                    </span>
                    <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                      {complianceEvaluation.criticalDefectsAz.map((defect, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span>{defect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-5">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    FHN Dövlət Yanğın Nəzarəti Xidməti və BDYP ADR Rəsmi Rüsum Hesablayıcısı
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    «Dövlət rüsumu haqqında» AR Qanunu və Nazirlər Kabinetinin 10 saylı Qərarına uyğun olaraq təsdiq edilmiş rəsmi tariflər
                  </p>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    ADR Nəqliyyat Kateqoriyasını Seçin:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(Object.keys(ADR_VEHICLE_CATEGORIES) as AdrVehicleCategory[]).map(catKey => {
                      const meta = ADR_VEHICLE_CATEGORIES[catKey];
                      const isSelected = vehicleCategory === catKey;
                      return (
                        <div
                          key={catKey}
                          onClick={() => setVehicleCategory(catKey)}
                          className={`cursor-pointer p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-sm ring-1 ring-orange-500'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {meta.code}
                            </span>
                            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                              {formatCurrency(meta.baseInspectionFeeAzn, selectedCurrency)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {meta.nameAz}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div
                    onClick={() => setIncludeNdt(!includeNdt)}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between ${
                      includeNdt
                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Ultrasəs NDT Gövdə Qalınlığı Müayinəsi (+120 ₼)
                      </div>
                      <div className="text-xs text-slate-500">
                        Akkreditasiya olunmuş laboratoriya tərəfindən qalınlıq xəritəsi
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeNdt}
                      onChange={() => {}}
                      className="accent-orange-600 w-4 h-4 pointer-events-none"
                    />
                  </div>

                  <div
                    onClick={() => setNeedsPoliceEscort(!needsPoliceEscort)}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between ${
                      needsPoliceEscort
                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        BDYP Xüsusi Eskort və Marşrut Mühafizəsi (+250 ₼)
                      </div>
                      <div className="text-xs text-slate-500">
                        Sinif 1 Partlayıcılar və ya zəhərli qaz karvanı müşayiəti
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={needsPoliceEscort}
                      onChange={() => {}}
                      className="accent-orange-600 w-4 h-4 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Cost Breakdown Summary */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Əsas Nəqliyyat Kateqoriya Baxış Rüsumu:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(inspectionCosts.categoryBaseFeeAzn, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Sistern Dövri Hidrostatik və Kiplik Sınaq Ekspertizası:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(inspectionCosts.hydrostaticTestFeeAzn, selectedCurrency)}
                    </span>
                  </div>
                  {includeNdt && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Ultrasəs Qalınlıqölçən Laboratoriya Xidməti (NDT):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(inspectionCosts.ultrasonicNdtFeeAzn, selectedCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Alovkəsici & Ex-proof Elektrik Yanğın Rəyi (DYNX):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(inspectionCosts.flameArresterCertFeeAzn, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>ADR B.3 Təsdiq Şəhadətnaməsinin Dövlət Rüsumu:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(inspectionCosts.adrCertificateFeeAzn, selectedCurrency)}
                    </span>
                  </div>
                  {needsPoliceEscort && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>BDYP Xüsusi Operativ Eskort Müşayiəti:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(inspectionCosts.policeEscortFeeAzn, selectedCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>ƏDV (18%):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(inspectionCosts.vatAzn, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-orange-600 dark:text-orange-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Yekun Rəsmi Ödəniş Məbləği:</span>
                    <span className="text-base font-black">
                      {formatCurrency(inspectionCosts.totalConverted, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMINALS RADAR */}
          {activeTab === 'terminals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Terminal adı, məntəqə və ya UN kodu üzrə axtarış..."
                    value={terminalSearch}
                    onChange={e => setTerminalSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  Cəmi: {filteredTerminals.length} Terminal
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTerminals.map(terminal => (
                  <div
                    key={terminal.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:border-orange-400 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                            {terminal.safetyTier}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {terminal.coordinates}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {terminal.nameAz}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{terminal.locationAz}</span>
                        </p>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                          terminal.liveStatus === 'OPERATIONAL'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {terminal.liveStatus}
                      </span>
                    </div>

                    {/* Substances & UN Codes */}
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Əsas Doldurulan Mayelər:</div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {terminal.primarySubstancesAz.map((sub, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Terminal Specifications */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-500">Gündəlik Həcm:</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {terminal.maxDailyThroughputTons.toLocaleString()} t
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-500">Doldurma Yeri:</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {terminal.activeLoadingBays} estakada
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-500">FHN YHQ Məsafəsi:</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {terminal.fireStationDistanceKm} km
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    FHN DYNX 10 Bəndlik Rəsmi Yanğın və Texniki Yoxlama Protokolu
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hər bir bənd ADR Hissə 6 və 9 tələblərinə uyğun olaraq fiziki olaraq yoxlanılmalıdır
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Uyğunluq Dərəcəsi:</div>
                    <div
                      className={`text-base font-black ${
                        checklistScore.isReady ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {checklistScore.percentage}% ({checklistScore.isReady ? 'Reysə Hazırdır' : 'Buraxılış Verilmir'})
                    </div>
                  </div>

                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {MOCK_TANKER_CHECKLIST_ITEMS.map(item => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start space-x-3 ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="accent-emerald-600 w-4 h-4 mt-0.5 pointer-events-none"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {item.titleAz}
                          </span>
                          {item.isMandatory && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                              MƏCBURİ
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                            Çəki: {item.weight}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {item.descriptionAz}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                          Hüquqi Əsas: {item.legalBasis}
                        </span>
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
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    ADR Təhlükəli Yük Sürücüsü və Təhlükəsizlik Məsləhətçisi İmtahan Simulyatoru
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fövqəladə Hallar Nazirliyinin dövlət attestasiya imtahan biletləri (Keçid balı: ən azı 9/10 düzgün cavab)
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {examSubmitted && (
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Nəticə:</div>
                      <div
                        className={`text-base font-black ${
                          examScore.passed ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {examScore.correct}/{examScore.total} ({examScore.percentage}%) - {examScore.passed ? 'KEÇDİ' : 'KƏSİLDİ'}
                      </div>
                    </div>
                  )}

                  {!examSubmitted ? (
                    <button
                      onClick={() => setExamSubmitted(true)}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                    >
                      İmtahanı Tamamla & Qiymətləndir
                    </button>
                  ) : (
                    <button
                      onClick={handleResetExam}
                      className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Yenidən Başla</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_ADR_EXAM_QUESTIONS.map(q => {
                  const selectedOpt = selectedAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                          Sual {q.id}. {q.questionAz}
                        </span>
                        {examSubmitted && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-bold shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            }`}
                          >
                            {isCorrect ? 'DÜZGÜN' : 'SƏHV'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.optionsAz.map((opt, optIdx) => {
                          let optClasses =
                            'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300';

                          if (!examSubmitted && selectedOpt === optIdx) {
                            optClasses = 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-200 ring-1 ring-orange-500 font-semibold';
                          } else if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold';
                            } else if (selectedOpt === optIdx) {
                              optClasses = 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectExamAnswer(q.id, optIdx)}
                              disabled={examSubmitted}
                              className={`text-left p-3 rounded-lg border text-xs transition-colors flex items-center space-x-2 ${optClasses}`}
                            >
                              <span className="font-mono text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-current shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1">
                          <p className="text-slate-600 dark:text-slate-400">
                            <span className="font-bold text-slate-800 dark:text-slate-200">İzah: </span>
                            {q.explanationAz}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 block">
                            Hüquqi Əsas: {q.legalCitation}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCopyCertificateCode}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copySuccess ? 'Kopyalandı!' : 'Şəhadətnamə Nömrəsini Kopyala'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Çap Et / PDF Yadda Saxla</span>
                </button>
              </div>

              {/* Official ADR Certificate Layout (ADR B.3 Form) */}
              <div className="border-4 border-amber-600 dark:border-amber-700 rounded-2xl p-6 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 shadow-xl space-y-6">
                {/* Official Certificate Header */}
                <div className="text-center border-b-2 border-amber-500/40 pb-4">
                  <div className="inline-block p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full mb-1">
                    <Shield className="w-8 h-8 text-amber-700 dark:text-amber-300" />
                  </div>
                  <h3 className="text-sm md:text-base font-black tracking-wider uppercase text-amber-900 dark:text-amber-200">
                    Azərbaycan Respublikası Fövqəladə Hallar Nazirliyi
                  </h3>
                  <h4 className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                    Dövlət Yanğın Nəzarəti Xidməti & Baş Dövlət Yol Polisi İdarəsi
                  </h4>
                  <div className="mt-2 text-xs font-mono font-bold tracking-widest text-orange-700 dark:text-orange-400">
                    CERTIFICATE OF APPROVAL FOR VEHICLES CARRYING CERTAIN DANGEROUS GOODS (ADR B.3)
                  </div>
                </div>

                {/* Certificate Number & Barcode */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
                  <div>
                    <span className="text-slate-500">Şəhadətnamənin Qeydiyyat Nömrəsi:</span>
                    <div className="font-mono text-base font-black text-amber-800 dark:text-amber-300">
                      {generatedCertificate.certificateId}
                    </div>
                  </div>
                  <div className="text-right mt-2 md:mt-0 font-mono text-[11px] text-slate-500">
                    SİMA Rəqəmsal İmza UID: <span className="font-bold text-slate-800 dark:text-slate-200">{generatedCertificate.simaSignatureUid}</span>
                  </div>
                </div>

                {/* Main Vehicle & Tanker Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 border-r md:border-r border-slate-200 dark:border-slate-700 pr-2">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {generatedCertificate.vehiclePlate}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Şassi VIN Kodu:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {generatedCertificate.chassisVin}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Daşıyıcı Təşkilat:</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-right">
                        {generatedCertificate.carrierCompanyName}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">VÖEN:</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {generatedCertificate.carrierVoen}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Təsdiq Kateqoriyası:</span>
                      <span className="font-bold px-2 py-0.5 rounded bg-orange-600 text-white">
                        {generatedCertificate.vehicleCategory}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Sistern Çən Seriya №:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {generatedCertificate.tankSerialNumber}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Çən İstehsalçısı:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {generatedCertificate.tankManufacturer}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Həcmi & Bölmələr:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {generatedCertificate.tankCapacityLiters.toLocaleString()} L ({generatedCertificate.tankCompartmentsCount} bölmə)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Növbəti Hidrostatik Sınaq:</span>
                      <span className="font-bold text-emerald-600">
                        {generatedCertificate.hydrostaticNextDueDate}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Alovkəsici / Torpaqlama:</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {generatedCertificate.staticGroundResistanceOhms} Ω / Ex-d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Authorized UN Substances */}
                <div className="bg-amber-100/60 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-300 dark:border-amber-800 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    Daşınmasına İcazə Verilmiş Təhlükəli Yüklər (BMT Kodları):
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {generatedCertificate.permittedUnNumbers.map((un, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 font-mono font-bold"
                      >
                        {un}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certificate Footer Stamp & Signatures */}
                <div className="pt-4 border-t-2 border-amber-500/30 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                  <div>
                    <div className="text-slate-500">Məsul Dövlət Müfəttişi:</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {generatedCertificate.inspectionInspectorName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Verilmə: {generatedCertificate.issueDate} | Etibarlılıq: {generatedCertificate.expiryDate}
                    </div>
                  </div>

                  <div className="text-center font-mono text-[10px] text-slate-400">
                    <div>SHA-256 Kriptoqrafik İzləmə Həşi:</div>
                    <div className="font-bold text-slate-600 dark:text-slate-300">
                      {generatedCertificate.securityHashSha256}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Qeydiyyat nömrəsi, nömrə nişanı, daşıyıcı və ya UN kodu..."
                    value={registrySearch}
                    onChange={e => setRegistrySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex space-x-2">
                  {(['ALL', 'ACTIVE_APPROVED', 'REVOKED_DEFECT'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setRegistryStatusFilter(status)}
                      className={`px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                        registryStatusFilter === status
                          ? 'bg-orange-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {status === 'ALL'
                        ? 'Hamısı'
                        : status === 'ACTIVE_APPROVED'
                        ? 'Qüvvədə Olanlar'
                        : 'Ləğv / Defektli'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table / Cards */}
              <div className="space-y-3">
                {filteredRegistry.map(cert => (
                  <div
                    key={cert.certificateId}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:border-orange-400 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {cert.certificateId}
                        </span>
                        <span className="font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-bold">
                          {cert.vehiclePlate}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-semibold">
                          {cert.vehicleCategory}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            cert.status === 'ACTIVE_APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          }`}
                        >
                          {cert.status === 'ACTIVE_APPROVED' ? 'QÜVVƏDƏDİR' : 'LƏĞV EDİLİB'}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 mt-1 font-medium">
                        Daşıyıcı: {cert.carrierCompanyName} (Çən: {cert.tankSerialNumber})
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        İcazə Verilmiş BMT Kodları: {cert.permittedUnNumbers.join(', ')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-500">Etibarlılıq Müddəti:</div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {cert.issueDate} - {cert.expiryDate}
                      </div>
                      <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">
                        Növbəti Baxış: {cert.hydrostaticNextDueDate}
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
