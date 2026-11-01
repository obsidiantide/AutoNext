import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
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
  Gauge,
  Activity,
  Zap,
  Truck,
  RotateCcw,
  Check,
  Scale,
  Award,
  Layers,
  Wrench,
  Maximize2,
  DollarSign,
  AlertOctagon,
} from 'lucide-react';
import { Modal } from './Modal';
import { Currency } from '../types/vehicle';
import {
  BarrierType,
  ContainmentLevel,
  WorkingWidthClass,
  GuardrailCorridorAsset,
  GuardrailVehiclePreset,
  GuardrailClearanceCertificate,
  calculateGuardrailImpact,
  evaluateGuardrailChecklist,
  evaluateGuardrailExam,
  generateGuardrailCertificate,
  AZN_TO_USD,
  AZN_TO_EUR,
  EN_1317_CAPACITY_KJ,
  WORKING_WIDTH_LIMITS_M,
  BARRIER_UNIT_RESTORATION_COST_AZN,
} from '../utils/guardrailSafetyCompliance';
import {
  MOCK_GUARDRAIL_CORRIDORS,
  MOCK_GUARDRAIL_VEHICLES,
  MOCK_GUARDRAIL_CHECKLIST,
  MOCK_GUARDRAIL_EXAM,
  MOCK_GUARDRAIL_REGISTRY,
} from '../data/mockGuardrailSafetyData';

export type GuardrailTabId =
  | 'corridors'
  | 'scada'
  | 'vehicles'
  | 'indemnity'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export interface GuardrailSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

export const GuardrailSafetyModal: React.FC<GuardrailSafetyModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<GuardrailTabId>('corridors');
  const [selectedCorridor, setSelectedCorridor] = useState<GuardrailCorridorAsset>(MOCK_GUARDRAIL_CORRIDORS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<GuardrailVehiclePreset>(MOCK_GUARDRAIL_VEHICLES[0]);
  const [corridorSearch, setCorridorSearch] = useState('');

  // Simulation input state
  const [impactSpeedKmh, setImpactSpeedKmh] = useState<number>(selectedVehicle.defaultSpeedKmh);
  const [impactAngleDeg, setImpactAngleDeg] = useState<number>(20);
  const [vehicleMassKg, setVehicleMassKg] = useState<number>(selectedVehicle.grossMassKg);
  const [barrierType, setBarrierType] = useState<BarrierType>(selectedCorridor.barrierType);
  const [containmentLevel, setContainmentLevel] = useState<ContainmentLevel>(selectedCorridor.containmentLevel);
  const [workingWidthClass, setWorkingWidthClass] = useState<WorkingWidthClass>(selectedCorridor.workingWidthClass);
  const [damagedLengthMeters, setDamagedLengthMeters] = useState<number>(8);
  const [isPromptDiscountApplied, setIsPromptDiscountApplied] = useState<boolean>(true);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checklistFilter, setChecklistFilter] = useState<string>('all');

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [generatedCert, setGeneratedCert] = useState<GuardrailClearanceCertificate | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Registry state
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryCertificates, setRegistryCertificates] = useState<GuardrailClearanceCertificate[]>(MOCK_GUARDRAIL_REGISTRY);

  // Filtered corridors
  const filteredCorridors = useMemo(() => {
    const q = corridorSearch.toLowerCase().trim();
    if (!q) return MOCK_GUARDRAIL_CORRIDORS;
    return MOCK_GUARDRAIL_CORRIDORS.filter(
      (c) =>
        c.nameAz.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.route.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.chainageKm.toLowerCase().includes(q)
    );
  }, [corridorSearch]);

  // Simulation calculation
  const simulationResult = useMemo(() => {
    return calculateGuardrailImpact({
      vehicleGrossMassKg: vehicleMassKg,
      impactSpeedKmh,
      impactAngleDeg,
      barrierType,
      containmentLevel,
      workingWidthClass,
      damagedLengthMeters,
    });
  }, [
    vehicleMassKg,
    impactSpeedKmh,
    impactAngleDeg,
    barrierType,
    containmentLevel,
    workingWidthClass,
    damagedLengthMeters,
  ]);

  // Format currency
  const formatCost = (valAzn: number) => {
    if (currency === 'USD') return `$${Math.round(valAzn * AZN_TO_USD).toLocaleString()}`;
    if (currency === 'EUR') return `€${Math.round(valAzn * AZN_TO_EUR).toLocaleString()}`;
    return `${valAzn.toLocaleString()} ₼`;
  };

  // Checklist evaluation
  const checklistEvaluation = useMemo(() => {
    return evaluateGuardrailChecklist(MOCK_GUARDRAIL_CHECKLIST, checkedItems);
  }, [checkedItems]);

  const filteredChecklistItems = useMemo(() => {
    if (checklistFilter === 'all') return MOCK_GUARDRAIL_CHECKLIST;
    return MOCK_GUARDRAIL_CHECKLIST.filter((item) => item.category === checklistFilter);
  }, [checklistFilter]);

  // Exam evaluation
  const examResult = useMemo(() => {
    return evaluateGuardrailExam(MOCK_GUARDRAIL_EXAM, examAnswers);
  }, [examAnswers]);

  // Filtered registry
  const filteredRegistry = useMemo(() => {
    const q = registrySearch.toLowerCase().trim();
    if (!q) return registryCertificates;
    return registryCertificates.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.vehiclePlate.toLowerCase().includes(q) ||
        c.vehicleModel.toLowerCase().includes(q) ||
        c.corridorLocationAz.toLowerCase().includes(q) ||
        c.digitalSignatureUid.toLowerCase().includes(q)
    );
  }, [registrySearch, registryCertificates]);

  const handleSelectCorridor = (c: GuardrailCorridorAsset) => {
    setSelectedCorridor(c);
    setBarrierType(c.barrierType);
    setContainmentLevel(c.containmentLevel);
    setWorkingWidthClass(c.workingWidthClass);
  };

  const handleSelectVehicle = (v: GuardrailVehiclePreset) => {
    setSelectedVehicle(v);
    setVehicleMassKg(v.grossMassKg);
    setImpactSpeedKmh(v.defaultSpeedKmh);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    if (checkedItems.length === MOCK_GUARDRAIL_CHECKLIST.length) {
      setCheckedItems([]);
    } else {
      setCheckedItems(MOCK_GUARDRAIL_CHECKLIST.map((c) => c.id));
    }
  };

  const handleGenerateCertificate = () => {
    const newCert = generateGuardrailCertificate(
      selectedVehicle.licensePlate,
      selectedVehicle.name,
      barrierType,
      containmentLevel,
      impactSpeedKmh,
      impactAngleDeg,
      vehicleMassKg,
      selectedCorridor.nameAz,
      selectedCorridor.nameEn
    );
    setGeneratedCert(newCert);
    setRegistryCertificates((prev) => [newCert, ...prev]);
    setActiveTab('certificate');
  };

  const outcomeColors: Record<string, { bg: string; text: string; border: string }> = {
    SAFELY_REDIRECTED: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700' },
    DECELERATED_IN_CUSHION: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
    POCKETING_WARNING: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' },
    BREACH_PENETRATION_CRITICAL: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col h-[90vh] max-h-[850px] bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-b border-indigo-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 rounded-lg border border-blue-400/40 backdrop-blur-md">
              <Shield className="w-6 h-6 text-blue-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">
                  AAYDA & BDYP Highway Guardrail & VRS Safety Portal
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-full">
                  EN 1317 / AZS 410
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Respublika Magistral Yollarında Yol Çəpərləri, Zərbəuducu Amortizatorlar və Tutma Qabiliyyəti Telemetriyası
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden md:flex flex-col items-end text-blue-200/80">
              <span className="font-semibold text-white">SİMA Dövlət İmzası İnteqrasiyası</span>
              <span>GUARD-SAFE-AZ-2026 Portal</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto bg-white dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 px-4 scrollbar-none">
          <button
            data-testid="guardrail-tab-corridors"
            onClick={() => setActiveTab('corridors')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'corridors'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Magistral Dəhlizlər</span>
          </button>
          <button
            data-testid="guardrail-tab-scada"
            onClick={() => setActiveTab('scada')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'scada'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Zərbə Simulyasiyası & SCADA</span>
          </button>
          <button
            data-testid="guardrail-tab-vehicles"
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'vehicles'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Nəqliyyat Presetləri</span>
          </button>
          <button
            data-testid="guardrail-tab-indemnity"
            onClick={() => setActiveTab('indemnity')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'indemnity'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Ziyanın Ödənilməsi & Cərimə</span>
          </button>
          <button
            data-testid="guardrail-tab-checklist"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'checklist'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>VRS Yoxlama Vərəqəsi</span>
          </button>
          <button
            data-testid="guardrail-tab-exam"
            onClick={() => setActiveTab('exam')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'exam'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>İmtahan Simulyatoru</span>
          </button>
          <button
            data-testid="guardrail-tab-certificate"
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'certificate'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Sertifikat</span>
          </button>
          <button
            data-testid="guardrail-tab-registry"
            onClick={() => setActiveTab('registry')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'registry'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Vahid Dövlət Reyestri</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CORRIDORS */}
          {activeTab === 'corridors' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Strateji Magistral Yol Dəhlizləri və Çəpər Şəbəkəsi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AAYDA-nın dispetçer idarəetməsində olan aktiv SCADA sensorlu yol çəpərləri və zərbəuducu qurğular
                  </p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Dəhliz, marşrut və ya region üzrə axtar..."
                    value={corridorSearch}
                    onChange={(e) => setCorridorSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCorridors.map((corridor) => {
                  const isSelected = selectedCorridor.id === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => handleSelectCorridor(corridor)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          {corridor.route}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            corridor.impactAlertActive
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 animate-pulse'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {corridor.impactAlertActive ? 'ZƏRBƏ XƏBƏRDARLIĞI' : 'NORMAL REJİM'}
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm font-bold line-clamp-1">{corridor.nameAz}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{corridor.region}</p>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Çəpər Növü:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {corridor.barrierType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tutma Səviyyəsi:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            EN 1317: {corridor.containmentLevel}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Piketaj & Koordinat:</span>
                          <span className="font-medium">{corridor.chainageKm}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">SCADA Sensorları:</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {corridor.scadaSensorsActive} Aktiv IoT
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCorridor(corridor);
                          setActiveTab('scada');
                        }}
                        className="mt-3 w-full py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Simulyasiyada Yoxla →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SCADA & DYNAMICS SIMULATION */}
          {activeTab === 'scada' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Control Panel */}
                <div className="lg:col-span-1 space-y-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                    <h4 className="text-sm font-bold flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-blue-500" />
                      <span>Zərbə Parametrləri</span>
                    </h4>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {selectedCorridor.chainageKm}
                    </span>
                  </div>

                  {/* Impact Speed Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Toqquşma Sürəti:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{impactSpeedKmh} km/saat</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={140}
                      step={5}
                      value={impactSpeedKmh}
                      onChange={(e) => setImpactSpeedKmh(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>30 km/h</span>
                      <span>Norma: 90-110</span>
                      <span>140 km/h</span>
                    </div>
                  </div>

                  {/* Impact Angle Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Zərbə Bucağı (θ):</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{impactAngleDeg}° dərəcə</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={35}
                      step={1}
                      value={impactAngleDeg}
                      onChange={(e) => setImpactAngleDeg(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>5° (Sürtünmə)</span>
                      <span>EN 1317: 20°</span>
                      <span>35° (Kəskin)</span>
                    </div>
                  </div>

                  {/* Vehicle Mass Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Faktiki Çəki:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {vehicleMassKg.toLocaleString()} kq ({(vehicleMassKg / 1000).toFixed(1)} t)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={44000}
                      step={250}
                      value={vehicleMassKg}
                      onChange={(e) => setVehicleMassKg(Number(e.target.value))}
                      className="w-full accent-slate-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>1,000 kq (Mini)</span>
                      <span>19t (Avtobus)</span>
                      <span>44,000 kq (TIR)</span>
                    </div>
                  </div>

                  {/* Damaged Length */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Zədələnmiş Çəpər Uzunluğu:</span>
                      <span className="font-bold text-amber-600">{damagedLengthMeters} metr</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={30}
                      step={1}
                      value={damagedLengthMeters}
                      onChange={(e) => setDamagedLengthMeters(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Barrier Type Selector */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Çəpər Konstruksiyası:</label>
                    <select
                      value={barrierType}
                      onChange={(e) => setBarrierType(e.target.value as BarrierType)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    >
                      <option value="W_BEAM_STEEL">2-dalğalı Sinklənmiş Polad Çəpər (W-Beam)</option>
                      <option value="THRIE_BEAM_REINFORCED">3-dalğalı Gücləndirilmiş Çəpər (Thrie-Beam)</option>
                      <option value="CONCRETE_NEW_JERSEY">Dəmir-Beton Monolit Parapet (New Jersey)</option>
                      <option value="CABLE_BARRIER">Dartılmış Polad Kanat Baryeri (Cable Barrier)</option>
                      <option value="CRASH_CUSHION_TERMINAL">Zərbəuducu Amortizator Terminalı (Crash Cushion)</option>
                    </select>
                  </div>

                  {/* Containment Level Selector */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">EN 1317 Tutma Səviyyəsi:</label>
                    <select
                      value={containmentLevel}
                      onChange={(e) => setContainmentLevel(e.target.value as ContainmentLevel)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    >
                      <option value="N1">N1 (40 kJ - Kompakt avtomobil)</option>
                      <option value="N2">N2 (81.9 kJ - Normal minik avtomobili)</option>
                      <option value="H1">H1 (127.5 kJ - Yük avtomobili 10t)</option>
                      <option value="H2">H2 (287.5 kJ - Avtobus 13t-19t)</option>
                      <option value="H3">H3 (472.0 kJ - Ağır yük avtomobili 16t)</option>
                      <option value="H4b">H4b (724.6 kJ - 38t Qoşqulu TIR / Estakada)</option>
                    </select>
                  </div>

                  {/* Working Width Class */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">İşçi Eni Tələbi (Working Width):</label>
                    <select
                      value={workingWidthClass}
                      onChange={(e) => setWorkingWidthClass(e.target.value as WorkingWidthClass)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    >
                      <option value="W1">W1 (Maks. 0.6 m defleksiya)</option>
                      <option value="W2">W2 (Maks. 0.8 m defleksiya)</option>
                      <option value="W3">W3 (Maks. 1.0 m defleksiya)</option>
                      <option value="W4">W4 (Maks. 1.3 m defleksiya)</option>
                      <option value="W5">W5 (Maks. 1.7 m defleksiya)</option>
                      <option value="W6">W6 (Maks. 2.1 m defleksiya)</option>
                      <option value="W7">W7 (Maks. 2.5 m defleksiya)</option>
                      <option value="W8">W8 (Maks. 3.5 m defleksiya)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateCertificate}
                    className="w-full py-2.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    <span>Dövlət Sertifikatı İstehsal Et</span>
                  </button>
                </div>

                {/* Simulation Canvas & Analytics */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      outcomeColors[simulationResult.containmentOutcome].bg
                    } ${outcomeColors[simulationResult.containmentOutcome].border}`}
                  >
                    <div className="flex items-center space-x-3">
                      {simulationResult.isBreached ? (
                        <AlertOctagon className="w-6 h-6 text-red-600 animate-bounce" />
                      ) : simulationResult.containmentOutcome === 'POCKETING_WARNING' ? (
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      ) : (
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      )}
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Toqquşma Nəticəsi (EN 1317)
                        </div>
                        <div className={`text-base font-extrabold ${outcomeColors[simulationResult.containmentOutcome].text}`}>
                          {simulationResult.containmentOutcome === 'SAFELY_REDIRECTED' && 'TƏHLÜKƏSİZ YÖNLƏNDİRMƏ (SAFELY REDIRECTED)'}
                          {simulationResult.containmentOutcome === 'DECELERATED_IN_CUSHION' && 'AMORTİZATORDА TƏHLÜKƏSİZ SÖNDÜRMƏ (CUSHION COMPRESSED)'}
                          {simulationResult.containmentOutcome === 'POCKETING_WARNING' && 'CİBLƏNMƏ VƏ İLİŞMƏ XƏBƏRDARLIĞI (POCKETING RISK)'}
                          {simulationResult.containmentOutcome === 'BREACH_PENETRATION_CRITICAL' && 'ÇƏPƏRİN YARILMASI VƏ AŞMA TƏHLÜKƏSİ (BARRIER BREACH)'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] block text-slate-500">Zərbə Gücü</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                        {simulationResult.kineticEnergyNormalKj} kJ
                      </span>
                      <span className="text-[10px] block text-slate-400">
                        Hədd: {simulationResult.barrierCapacityKj} kJ
                      </span>
                    </div>
                  </div>

                  {/* SVG Physics Crash Trajectory Diagram */}
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span>Toqquşma Trayektoriyası və Dinamik Əyilmə Eni Simulyatoru</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Dinamik Defleksiya: <strong className="text-blue-600">{simulationResult.dynamicDeflectionM}m</strong> / Maks: {WORKING_WIDTH_LIMITS_M[workingWidthClass]}m
                      </span>
                    </div>

                    <div className="relative w-full h-48 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                      <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                        {/* Asphalt Road Surface */}
                        <rect x="0" y="0" width="600" height="200" fill="#1e293b" />
                        
                        {/* Road Marking lines */}
                        <line x1="0" y1="130" x2="600" y2="130" stroke="#475569" strokeDasharray="15,15" strokeWidth="2" />
                        <line x1="0" y1="180" x2="600" y2="180" stroke="#f8fafc" strokeWidth="3" />

                        {/* Guardrail Undeflected Baseline (Yellow / Metallic Line) */}
                        <line x1="0" y1="50" x2="600" y2="50" stroke="#64748b" strokeWidth="6" strokeDasharray="4,2" />

                        {/* Deformed Barrier Curve under Impact */}
                        <path
                          d={`M 0,50 L 220,50 Q 300,${50 - simulationResult.dynamicDeflectionM * 25} 380,50 L 600,50`}
                          fill="none"
                          stroke={simulationResult.isBreached ? '#ef4444' : '#3b82f6'}
                          strokeWidth="8"
                          strokeLinecap="round"
                        />

                        {/* Working Width Envelope dashed zone */}
                        <path
                          d={`M 220,50 Q 300,${50 - WORKING_WIDTH_LIMITS_M[workingWidthClass] * 25} 380,50`}
                          fill="none"
                          stroke="#eab308"
                          strokeDasharray="4,4"
                          strokeWidth="2"
                        />

                        {/* Vehicle Trajectory Arrow */}
                        <path
                          d={`M 100,160 Q 250,110 295,${65 - simulationResult.dynamicDeflectionM * 20}`}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="3"
                          markerEnd="url(#arrow)"
                        />

                        {/* Redirection Trajectory */}
                        {!simulationResult.isBreached && (
                          <path
                            d={`M 305,${65 - simulationResult.dynamicDeflectionM * 20} Q 360,110 500,150`}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                          />
                        )}

                        {/* Breach Penetration Path */}
                        {simulationResult.isBreached && (
                          <path
                            d={`M 305,${65 - simulationResult.dynamicDeflectionM * 20} L 420,-10`}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="4"
                            strokeDasharray="6,4"
                          />
                        )}

                        {/* Vehicle impact representation */}
                        <rect
                          x="280"
                          y={55 - simulationResult.dynamicDeflectionM * 18}
                          width="35"
                          height="20"
                          rx="4"
                          fill={simulationResult.isBreached ? '#dc2626' : '#2563eb'}
                          transform={`rotate(${impactAngleDeg - 15}, 297, ${65 - simulationResult.dynamicDeflectionM * 18})`}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />

                        {/* Annotations */}
                        <text x="15" y="40" fill="#94a3b8" fontSize="11" fontWeight="bold">
                          YOL ÇƏPƏRİ (VRS BARYERİ)
                        </text>
                        <text x="320" y="25" fill="#f59e0b" fontSize="10">
                          {`W = ${WORKING_WIDTH_LIMITS_M[workingWidthClass]}m`}
                        </text>
                        <text x="320" y={simulationResult.isBreached ? 30 : 75} fill="#38bdf8" fontSize="10" fontWeight="bold">
                          {`Defleksiya: ${simulationResult.dynamicDeflectionM}m`}
                        </text>
                      </svg>
                    </div>
                  </div>

                  {/* Key Engineering Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Təcil Kəskinliyi (ASI)</span>
                      <div className="flex items-baseline space-x-1.5 mt-1">
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                          {simulationResult.accelerationSeverityIndex}
                        </span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {simulationResult.asiClass}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">Standart: ≤ 1.0 (Class A)</span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Baş Zərbə Sürəti (THIV)</span>
                      <div className="flex items-baseline space-x-1.5 mt-1">
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                          {simulationResult.theoreticalHeadImpactVelocityKmh}
                        </span>
                        <span className="text-xs text-slate-400">km/saat</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Maks. Normativ: ≤ 33 km/h</span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Bərpa Dəyəri (Mülki 1108)</span>
                      <div className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                        {formatCost(simulationResult.restorationCostAzn)}
                      </div>
                      <span className="text-[10px] text-slate-500">{damagedLengthMeters}m çəpər + montaj</span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">İXM 342.1 Cərimə</span>
                      <div className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">
                        {formatCost(simulationResult.discountedFineAzn)}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">30 gün 50% endirimlə</span>
                    </div>
                  </div>

                  {/* Engineering Notes */}
                  <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">Normativ Rəy və Qeydlər:</span>
                    {simulationResult.complianceNotes.map((note, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-slate-600 dark:text-slate-300">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Avtomobil Filosu və EN 1317 Zərbə Presetləri</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Respublika avtomobil parkında istismar edilən müxtəlif kütlə və ağırlıq mərkəzli nəqliyyat modelləri
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_GUARDRAIL_VEHICLES.map((vehicle) => {
                  const isSelected = selectedVehicle.id === vehicle.id;
                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => handleSelectVehicle(vehicle)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-slate-900 text-amber-400 border border-amber-400/40">
                          {vehicle.licensePlate}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {(vehicle.grossMassKg / 1000).toFixed(1)} Ton
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm font-bold line-clamp-1">{vehicle.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{vehicle.chassisType}</p>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Ağırlıq Mərkəzi (CG):</span>
                          <span className="font-semibold">{vehicle.centerOfGravityHeightM} m</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Test Sürəti:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {vehicle.defaultSpeedKmh} km/saat
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Uzunluq:</span>
                          <span className="font-medium">{vehicle.lengthMeters} m</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Faktiki Çəki:</span>
                          <span className="font-medium">{vehicle.grossMassKg.toLocaleString()} kq</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVehicle(vehicle);
                          setActiveTab('scada');
                        }}
                        className="mt-3 w-full py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Simulyasiyaya Tətbiq Et →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: INDEMNITY & STATUTORY FINES */}
          {activeTab === 'indemnity' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Yol İnfrastrukturuna Dəyən Zərərin Ödənilməsi & Cərimə</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AR Mülki Məcəlləsinin 1108-ci maddəsi və İnzibati Xətalar Məcəlləsinin 342.1-ci maddəsi üzrə məsuliyyət
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {/* Detailed breakdown card */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                      Dövlət Əmlakının Bərpası Kalkulyasiyası
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/50">
                        <span className="text-slate-600 dark:text-slate-300">
                          Zədələnmiş Çəpər Tipi ({barrierType.replace(/_/g, ' ')})
                        </span>
                        <span className="font-semibold">
                          {damagedLengthMeters} metr × {BARRIER_UNIT_RESTORATION_COST_AZN[barrierType]} AZN = {damagedLengthMeters * BARRIER_UNIT_RESTORATION_COST_AZN[barrierType]} AZN
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/50">
                        <span className="text-slate-600 dark:text-slate-300">
                          Ağır Montaj Texnikası, Kran və Hərəkətin Zolaq Məhdudiyyəti Xərci
                        </span>
                        <span className="font-semibold">350 AZN</span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/50">
                        <span className="text-slate-600 dark:text-slate-300">
                          AAYDA Bərpa Hesabı Üzrə Cəmi Maddi Ziyan
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {formatCost(simulationResult.restorationCostAzn)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/50">
                        <span className="text-slate-600 dark:text-slate-300">
                          İXM 342.1 İnzibati Cəriməsi (100 AZN + 3 cərimə balı)
                        </span>
                        <span className="font-semibold text-red-600">
                          {isPromptDiscountApplied ? '50 AZN (50% endirimlə)' : '100 AZN'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-3 text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        <span>YEKUN ÖDƏNİLMƏLİ MƏBLƏĞ:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-base">
                          {formatCost(
                            isPromptDiscountApplied
                              ? simulationResult.discountedTotalLiabilityAzn
                              : simulationResult.totalLiabilityAzn
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPromptDiscountApplied}
                          onChange={(e) => setIsPromptDiscountApplied(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          İXM Maddə 38 üzrə 30 gün ərzində 50% erkən ödəniş güzəştini tətbiq et
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Statutory Legal citation card */}
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 text-xs space-y-2">
                    <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-1.5">
                      <Scale className="w-4 h-4" />
                      <span>Hüquqi Əsas və Təzminat Mexanizmi:</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong>AR Mülki Məcəlləsinin 1108-ci maddəsinə</strong> əsasən şəxsin qanunsuz hərəkətləri nəticəsində
                      dövlət mülkiyyətinə dəyən zərər tam həcmdə ödənilir. Nəqliyyat vasitəsi sahibinin mülki məsuliyyətinin
                      icbari sığortası mövcud olduqda 5,000 AZN-dək zərər sığorta şirkəti tərəfindən birbaşa AAYDA hesabına
                      ödənilir.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold mb-3">Çəpər Tipləri Üzrə 1 Metr Qiymət</h4>
                    <div className="space-y-2.5 text-xs">
                      {Object.entries(BARRIER_UNIT_RESTORATION_COST_AZN).map(([type, cost]) => (
                        <div key={type} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/40">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            {type.replace(/_/g, ' ')}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {cost} ₼ / m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">10-Maddəlik Texniki VRS Təhlükəsizlik Yoxlama Vərəqəsi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AZS 410, AZS 342 və Avropa Standartı EN 1317 tələbləri üzrə dövlət magistral çəpər auditi
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    {checkedItems.length === MOCK_GUARDRAIL_CHECKLIST.length ? 'Bütününü Sil' : 'Hamısını Seç'}
                  </button>
                </div>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Uyğunluq Reytinqi</span>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    {checklistEvaluation.scorePercent}%
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {checklistEvaluation.checkedCount} / {checklistEvaluation.totalItems} maddə
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">İcbari Tələblər</span>
                  <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
                    {checklistEvaluation.mandatoryCheckedCount} / {checklistEvaluation.mandatoryCount}
                  </div>
                  <span className="text-[10px] text-slate-500">Qanunverici maddələr</span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Müayinə Nəticəsi</span>
                  <div className={`text-sm font-bold mt-1 ${checklistEvaluation.isCompliant ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {checklistEvaluation.isCompliant ? 'TAM UYĞUNDUR' : 'ÇATIŞMAZLIQ VAR'}
                  </div>
                  <span className="text-[10px] text-slate-500">EN 1317 Qəbulu</span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Təftiş İdarəsi</span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                    AAYDA & BDYP
                  </div>
                  <span className="text-[10px] text-slate-500">Dövlət Magistral Nəzarət</span>
                </div>
              </div>

              {/* Checklist items list */}
              <div className="space-y-2">
                {MOCK_GUARDRAIL_CHECKLIST.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.titleAz}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{item.legalRef}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.isMandatory && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            İCBARY
                          </span>
                        )}
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">VRS və Çəpər Təhlükəsizliyi İmtahan Simulyatoru</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AAYDA və BDYP mühəndisləri üçün 10-suallıq sertifikatlaşdırma testi
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {examSubmitted && (
                    <button
                      onClick={() => {
                        setExamSubmitted(false);
                        setExamAnswers({});
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 transition-colors"
                    >
                      Yenidən Başla
                    </button>
                  )}
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                  >
                    Nəticəni Təsdiqlə
                  </button>
                </div>
              </div>

              {/* Exam Score Summary if submitted */}
              {examSubmitted && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">İmtahan Qiyməti</span>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {examResult.scorePercent}% ({examResult.correctCount} / {examResult.totalQuestions})
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-black rounded-lg ${
                      examResult.isPassed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    DƏRƏCƏ: {examResult.grade}
                  </span>
                </div>
              )}

              {/* Questions list */}
              <div className="space-y-4">
                {MOCK_GUARDRAIL_EXAM.map((q) => {
                  const userAnswer = examAnswers[q.id];
                  const isAnswered = userAnswer !== undefined;
                  const isCorrect = isAnswered && userAnswer === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {q.id}. {q.questionAz}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{q.regulatoryReference}</span>
                      </div>

                      <div className="space-y-1.5">
                        {q.optionsAz.map((option, optIdx) => {
                          const isOptionSelected = userAnswer === optIdx;
                          let btnStyle = 'border-slate-200 dark:border-slate-700 hover:border-blue-400';

                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold';
                            } else if (isOptionSelected) {
                              btnStyle = 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={examSubmitted}
                              onClick={() => setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${btnStyle}`}
                            >
                              <span className="font-semibold mr-2">{String.fromCharCode(65 + optIdx)})</span>
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">İzah və Normativ:</span>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Rəsmi GUARD-SAFE-AZ-2026 Dövlət Sertifikatı</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AAYDA və BDYP tərəfindən elektron təsdiq olunmuş yol çəpəri və zərbə təhlükəsizliyi sənədi
                </p>
              </div>

              {generatedCert ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-indigo-500/40 shadow-xl max-w-2xl mx-auto space-y-6">
                  {/* Certificate Header */}
                  <div className="text-center pb-4 border-b-2 border-indigo-100 dark:border-indigo-900/60">
                    <div className="inline-block p-2 bg-indigo-50 dark:bg-indigo-950 rounded-full mb-2">
                      <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="text-base font-black tracking-wide text-indigo-950 dark:text-indigo-200 uppercase">
                      AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      Yol Mühəndis Qurğuları və Çəpər Restavrasiyası Sertifikatı
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-bold rounded-full border border-indigo-300 dark:border-indigo-700">
                      № {generatedCert.certificateNumber}
                    </span>
                  </div>

                  {/* Certificate Fields */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">
                        {generatedCert.vehiclePlate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nəqliyyat Modeli:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {generatedCert.vehicleModel}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Çəpər Səviyyəsi:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        EN 1317: {generatedCert.containmentLevel} ({generatedCert.barrierType.replace(/_/g, ' ')})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ASI və THIV Reytinqi:</span>
                      <span className="font-semibold">
                        ASI: {generatedCert.asiRating} ({generatedCert.asiClass})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Hadisə və ya Sınaq Ərazisi:</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {generatedCert.corridorLocationAz}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sınaq Parametrləri:</span>
                      <span className="font-medium">
                        {generatedCert.testedSpeedKmh} km/h @ {generatedCert.impactAngleDeg}° bucaq
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic Signature Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">
                        SİMA Rəqəmsal İmza UID:
                      </span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {generatedCert.digitalSignatureUid}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">
                        Bərpa PIN Kodu:
                      </span>
                      <span className="font-mono text-emerald-600 font-bold">
                        {generatedCert.restorationPin}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => handleCopy(generatedCert.certificateNumber, 'cert-num')}
                      className="flex-1 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedKey === 'cert-num' ? 'Kopyalandı!' : 'Sertifikat Nömrəsini Kopyala'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et (PDF)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Hələ heç bir aktiv sertifikat yaradılmayıb
                  </p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Zərbə Simulyasiyası bölməsində testi apararaq rəsmi sertifikat tərtib edə bilərsiniz
                  </p>
                  <button
                    onClick={() => setActiveTab('scada')}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Simulyatora Get →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Vahid Dövlət Çəpər və Təhlükəsizlik Reyestri</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AAYDA və BDYP bazasında qeydiyyata alınmış rəsmi GUARD-SAFE-AZ-2026 sertifikatları
                  </p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Sertifikat №, nömrə və ya yer üzrə axtar..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredRegistry.map((cert) => (
                  <div
                    key={cert.certificateNumber}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {cert.certificateNumber}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 text-amber-400 font-mono">
                          {cert.vehiclePlate}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {cert.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {cert.vehicleModel} — {cert.corridorLocationAz}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Tutma: <strong>{cert.containmentLevel}</strong> | ASI: <strong>{cert.asiRating}</strong> | PIN: {cert.restorationPin}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <button
                        onClick={() => {
                          setGeneratedCert(cert);
                          setActiveTab('certificate');
                        }}
                        className="flex-1 md:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                      >
                        Sertifikata Bax
                      </button>
                      <button
                        onClick={() => handleCopy(cert.certificateNumber, cert.certificateNumber)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {copiedKey === cert.certificateNumber ? 'Kopyalandı' : 'Kopyala'}
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
