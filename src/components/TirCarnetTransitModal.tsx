import React, { useState, useMemo } from 'react';
import {
  Currency,
  AdrHazardClass,
  GreenCorridorStatus,
  TirVoletType,
  ADR_CLASSES_INFO,
  calculateTirTransitCost,
  evaluateXRayScanTelemetry,
  evaluateSafetyChecklist,
  evaluateTheoreticalExam,
  generateETransitCertificate,
  ETransitCertificate,
  FreightPreset,
} from '../utils/tirCarnetCompliance';
import {
  MOCK_CUSTOMS_CHECKPOINTS,
  MOCK_FREIGHT_PRESETS,
  MOCK_SAFETY_CHECKLIST,
  MOCK_THEORETICAL_EXAM_QUESTIONS,
  MOCK_ACTIVE_CERTIFICATES,
} from '../data/mockTirCarnetData';
import {
  X,
  Truck,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Award,
  CheckCircle2,
  Copy,
  Printer,
  Search,
  Radio,
  Clock,
  MapPin,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TirCarnetTransitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType = 'checkpoints' | 'calculator' | 'telemetry' | 'checklist' | 'exam' | 'certificate';

export const TirCarnetTransitModal: React.FC<TirCarnetTransitModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('checkpoints');

  // Checkpoints filtering
  const [bcpCountryFilter, setBcpCountryFilter] = useState<string>('ALL');
  const [bcpSearch, setBcpSearch] = useState<string>('');

  // Selected Freight Preset & Custom Inputs
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOCK_FREIGHT_PRESETS[0].id);
  const activePreset = useMemo(
    () => MOCK_FREIGHT_PRESETS.find((p) => p.id === selectedPresetId) || MOCK_FREIGHT_PRESETS[0],
    [selectedPresetId]
  );

  const [cargoValueAzn, setCargoValueAzn] = useState<number>(activePreset.declaredValueAzn);
  const [cargoWeightTon, setCargoWeightTon] = useState<number>(activePreset.cargoWeightTon);
  const [selectedVolet, setSelectedVolet] = useState<TirVoletType>(activePreset.tirVolets);
  const [selectedGreenTier, setSelectedGreenTier] = useState<GreenCorridorStatus>(activePreset.greenCorridorStatus);
  const [selectedAdrClass, setSelectedAdrClass] = useState<AdrHazardClass>(activePreset.adrClass);
  const [useElectronicGpsSeal, setUseElectronicGpsSeal] = useState<boolean>(activePreset.isElectronicSeal);
  const [requireEscort, setRequireEscort] = useState<boolean>(false);

  // Sync when preset changes
  const handleSelectPreset = (preset: FreightPreset) => {
    setSelectedPresetId(preset.id);
    setCargoValueAzn(preset.declaredValueAzn);
    setCargoWeightTon(preset.cargoWeightTon);
    setSelectedVolet(preset.tirVolets);
    setSelectedGreenTier(preset.greenCorridorStatus);
    setSelectedAdrClass(preset.adrClass);
    setUseElectronicGpsSeal(preset.isElectronicSeal);
    setRequireEscort(ADR_CLASSES_INFO[preset.adrClass].requiresPoliceEscort);
  };

  // Cost calculation
  const transitCalc = useMemo(() => {
    return calculateTirTransitCost(
      {
        declaredCargoValueAzn: cargoValueAzn,
        cargoWeightTon,
        tirVolets: selectedVolet,
        greenCorridorStatus: selectedGreenTier,
        adrClass: selectedAdrClass,
        isElectronicGpsSeal: useElectronicGpsSeal,
        requiresEscort: requireEscort,
      },
      currency
    );
  }, [cargoValueAzn, cargoWeightTon, selectedVolet, selectedGreenTier, selectedAdrClass, useElectronicGpsSeal, requireEscort, currency]);

  // Telemetry Stand state
  const [atomicNumberZ, setAtomicNumberZ] = useState<number>(8); // Organic baseline
  const [dosimeterRate, setDosimeterRate] = useState<number>(0.11); // Safe baseline µSv/h
  const [simulateTamper, setSimulateTamper] = useState<boolean>(false);

  const xRayTelemetry = useMemo(() => {
    return evaluateXRayScanTelemetry(atomicNumberZ, dosimeterRate, simulateTamper);
  }, [atomicNumberZ, dosimeterRate, simulateTamper]);

  // Safety Checklist state
  const [checkedChecklistIds, setCheckedChecklistIds] = useState<string[]>(
    MOCK_SAFETY_CHECKLIST.filter((i) => i.isMandatory).map((i) => i.id)
  );

  const checklistResult = useMemo(() => {
    return evaluateSafetyChecklist(checkedChecklistIds, MOCK_SAFETY_CHECKLIST);
  }, [checkedChecklistIds]);

  const toggleChecklistItem = (id: string) => {
    setCheckedChecklistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    setCheckedChecklistIds(MOCK_SAFETY_CHECKLIST.map((i) => i.id));
  };

  const handleResetChecklist = () => {
    setCheckedChecklistIds([]);
  };

  // Theoretical Exam state
  const [userExamAnswers, setUserExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  const examResult = useMemo(() => {
    return evaluateTheoreticalExam(userExamAnswers, MOCK_THEORETICAL_EXAM_QUESTIONS);
  }, [userExamAnswers]);

  const handleAnswerQuestion = (qId: number, optIdx: number) => {
    if (isExamSubmitted) return;
    setUserExamAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleResetExam = () => {
    setUserExamAnswers({});
    setIsExamSubmitted(false);
  };

  // Certificate & Unified Registry state
  const [generatedCert, setGeneratedCert] = useState<ETransitCertificate>(() =>
    generateETransitCertificate(activePreset, transitCalc)
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');

  const handleGenerateCertificate = () => {
    const newCert = generateETransitCertificate(
      {
        ...activePreset,
        declaredValueAzn: cargoValueAzn,
        cargoWeightTon,
        tirVolets: selectedVolet,
        greenCorridorStatus: selectedGreenTier,
        adrClass: selectedAdrClass,
        isElectronicSeal: useElectronicGpsSeal,
      },
      transitCalc
    );
    setGeneratedCert(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCertId = () => {
    navigator.clipboard?.writeText(generatedCert.certificateId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // Filtered checkpoints
  const filteredCheckpoints = useMemo(() => {
    return MOCK_CUSTOMS_CHECKPOINTS.filter((bcp) => {
      const matchesCountry = bcpCountryFilter === 'ALL' || bcp.country === bcpCountryFilter;
      const matchesSearch =
        bcpSearch.trim() === '' ||
        bcp.nameAz.toLowerCase().includes(bcpSearch.toLowerCase()) ||
        bcp.highwayCorridor.toLowerCase().includes(bcpSearch.toLowerCase());
      return matchesCountry && matchesSearch;
    });
  }, [bcpCountryFilter, bcpSearch]);

  // Registry search filter
  const filteredRegistry = useMemo(() => {
    const list = [generatedCert, ...MOCK_ACTIVE_CERTIFICATES];
    const q = registrySearchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.certificateId.toLowerCase().includes(q) ||
        c.tractorPlate.toLowerCase().includes(q) ||
        c.tirCarnetNumber.toLowerCase().includes(q) ||
        c.carrierName.toLowerCase().includes(q) ||
        c.driverFullName.toLowerCase().includes(q)
    );
  }, [generatedCert, registrySearchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  DGK Beynəlxalq TIR & Tranzit Gömrük Portalı
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  DGK • IRU TIR • ADR • YAŞIL DƏHLİZ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dövlət Gömrük Komitəsi, BDYP & FHN Beynəlxalq Yük Tranziti, Rentgen Telemetriyası və Təhlükəsizlik Sistemi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="tir-carnet-close-btn"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 overflow-x-auto px-4 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('checkpoints')}
            data-testid="tab-checkpoints-btn"
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'checkpoints'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Gömrük Məntəqələri Radarı
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator-btn"
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'calculator'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            TIR & Rüsum Kalkulyatoru
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            data-testid="tab-telemetry-btn"
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'telemetry'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            Rentgen & Plomb Telemetriyası
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist-btn"
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            ADR Təhlükəsizlik Yoxlaması
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam-btn"
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'exam'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            TIR/ADR İmtahanı
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate-btn"
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'certificate'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            E-Şəhadətnamə & Reyestr
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: BCP RADAR & CORRIDORS */}
          {activeTab === 'checkpoints' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Sərhəd Ölkəsi:</span>
                  {(['ALL', 'RUSSIA', 'GEORGIA', 'IRAN', 'TURKEY', 'CASPIAN_SEA'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setBcpCountryFilter(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                        bcpCountryFilter === c
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {c === 'ALL'
                        ? 'Bütün Məntəqələr'
                        : c === 'RUSSIA'
                        ? '🇷🇺 Rusiya'
                        : c === 'GEORGIA'
                        ? '🇬🇪 Gürcüstan'
                        : c === 'IRAN'
                        ? '🇮🇷 İran'
                        : c === 'TURKEY'
                        ? '🇹🇷 Türkiyə'
                        : '🌊 Xəzər Bərəsi'}
                    </button>
                  ))}
                </div>
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Məntəqə və ya dəhliz axtar..."
                    value={bcpSearch}
                    onChange={(e) => setBcpSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCheckpoints.map((bcp) => (
                  <div
                    key={bcp.id}
                    className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 hover:border-emerald-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            {bcp.nameAz}
                          </h3>
                          <p className="text-xs text-slate-400">{bcp.highwayCorridor}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            bcp.status === 'OPTIMAL'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : bcp.status === 'MODERATE'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {bcp.status === 'OPTIMAL'
                            ? 'Optimal Hərəkət'
                            : bcp.status === 'MODERATE'
                            ? 'Orta Növbə'
                            : 'Yüksək Sıxlıq'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 my-3 text-center">
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <p className="text-[10px] text-slate-400">Canlı Növbə</p>
                          <p className="text-sm font-bold text-amber-400">{bcp.activeTruckQueue} TIR</p>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <p className="text-[10px] text-slate-400">Standart Keçid</p>
                          <p className="text-sm font-bold text-slate-300">{bcp.averageClearanceHours} saat</p>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <p className="text-[10px] text-slate-400">Yaşıl Dəhliz</p>
                          <p className="text-sm font-bold text-emerald-400">
                            {bcp.greenCorridorFastTrackMinutes} dəq
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-500">Rentgen Skaneri:</span>
                          <span className="text-slate-300 font-mono text-[11px]">{bcp.xrayScannerModel}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-500">Radiasiya Monitoru (RPM):</span>
                          <span className="text-emerald-400 font-semibold">Aktiv Nəzarət Standı (0.25 µSv/h həddi)</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Məsafə: {bcp.distanceFromBakuKm} km (Bakıdan)</span>
                      <button
                        onClick={() => {
                          setActiveTab('calculator');
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Tranzit Hesabla &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TIR CARNET & FEES CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Presets Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  Hazır Beynəlxalq Yük / TIR Preseti Seçin:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MOCK_FREIGHT_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer text-xs ${
                        selectedPresetId === p.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-emerald-400">{p.tractorPlate}</span>
                        <span className="text-[10px] text-slate-400">{p.tirCarnetNumber}</span>
                      </div>
                      <p className="truncate text-slate-300 text-[11px]">{p.carrierName}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <span>{p.cargoWeightTon}t</span>
                        <span>•</span>
                        <span className="text-amber-300">{ADR_CLASSES_INFO[p.adrClass].code}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Calculation Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    Yük və Nəqliyyat Parametrləri
                  </h4>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Bəyan Edilən Yük Dəyəri (AZN):
                    </label>
                    <input
                      type="number"
                      value={cargoValueAzn}
                      onChange={(e) => setCargoValueAzn(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Yükün Ümumi Çəkisi (Ton):
                    </label>
                    <input
                      type="number"
                      value={cargoWeightTon}
                      onChange={(e) => setCargoWeightTon(Math.max(0.1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">TIR Karneti Vərəq Sayı (Volets):</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['VOLET_4', 'VOLET_6', 'VOLET_14', 'VOLET_20'] as TirVoletType[]).map((v) => (
                        <button
                          key={v}
                          onClick={() => setSelectedVolet(v)}
                          className={`py-1.5 text-xs rounded-lg font-mono font-bold transition cursor-pointer border ${
                            selectedVolet === v
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {v.replace('VOLET_', '')} Volet
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Gömrük Risk Zolağı (Dəhliz Rejimi):</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['GREEN', 'BLUE', 'YELLOW', 'RED'] as GreenCorridorStatus[]).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setSelectedGreenTier(tier)}
                          className={`py-1.5 text-xs rounded-lg font-bold transition cursor-pointer border ${
                            selectedGreenTier === tier
                              ? tier === 'GREEN'
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : tier === 'BLUE'
                                ? 'bg-blue-500 text-white border-blue-400'
                                : tier === 'YELLOW'
                                ? 'bg-amber-500 text-slate-950 border-amber-400'
                                : 'bg-rose-500 text-white border-rose-400'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {tier === 'GREEN'
                            ? 'Yaşıl'
                            : tier === 'BLUE'
                            ? 'Mavi'
                            : tier === 'YELLOW'
                            ? 'Sarı'
                            : 'Qırmızı'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ADR Təhlükəli Yük Təsnifatı:</label>
                    <select
                      value={selectedAdrClass}
                      onChange={(e) => setSelectedAdrClass(e.target.value as AdrHazardClass)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      {Object.values(ADR_CLASSES_INFO).map((info) => (
                        <option key={info.id} value={info.id}>
                          {info.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={useElectronicGpsSeal}
                        onChange={(e) => setUseElectronicGpsSeal(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span>Elektron GPS/GSM Gömrük Plombu (Peyk geo-nəzarət + tamper sensor)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={requireEscort}
                        onChange={(e) => setRequireEscort(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span>BDYP Polis & FHN Müşayiət Eskortu (Xüsusi icazə tələbi)</span>
                    </label>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Rəsmi Gömrük & Tranzit Rüsumları
                      </h4>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {currency}
                      </span>
                    </div>

                    <div className="space-y-2.5 py-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gömrük Rəsmiləşdirilməsi Rüsumu:</span>
                        <span className="font-mono text-white font-semibold">
                          {transitCalc.customsDutyAzn.toFixed(2)} AZN
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">TIR Karneti Rəsmiləşdirmə Haqqı:</span>
                        <span className="font-mono text-white">{transitCalc.tirCarnetFeeAzn.toFixed(2)} AZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rentgen/Qamma Skaner Haqqı:</span>
                        <span className="font-mono text-white">
                          {transitCalc.xrayScanFeeAzn > 0 ? `${transitCalc.xrayScanFeeAzn.toFixed(2)} AZN` : '0 AZN (Güzəştli)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gömrük Plombu (Mexaniki/Elektron GPS):</span>
                        <span className="font-mono text-white">{transitCalc.electronicSealFeeAzn.toFixed(2)} AZN</span>
                      </div>
                      {transitCalc.adrSpecialPermitFeeAzn > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span>ADR Xüsusi Təhlükəli Yük İcazəsi:</span>
                          <span className="font-mono">{transitCalc.adrSpecialPermitFeeAzn.toFixed(2)} AZN</span>
                        </div>
                      )}
                      {transitCalc.policeFhnEscortFeeAzn > 0 && (
                        <div className="flex justify-between text-blue-300">
                          <span>BDYP / FHN Müşayiət Haqqı:</span>
                          <span className="font-mono">{transitCalc.policeFhnEscortFeeAzn.toFixed(2)} AZN</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                        <span>Xidmətlər üzrə 18% ƏDV:</span>
                        <span className="font-mono text-slate-300">{transitCalc.vat18Azn.toFixed(2)} AZN</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-300">Sərhəd Gözləmə Vaxtı:</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {transitCalc.greenCorridorWaitHours} saat (Qənaət: ~{transitCalc.timeSavedHours} saat)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-300">IRU TIR Zəmanət Tavanı:</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          €{transitCalc.guaranteeCeilingEur.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-300">Risk Profili Qiyməti:</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            transitCalc.riskCategoryScore <= 20
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : transitCalc.riskCategoryScore <= 50
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {transitCalc.riskCategoryScore} / 100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-slate-400">Yekun Tranzit Ödənişi:</p>
                      <p className="text-xl font-bold font-mono text-emerald-400">
                        {currency === 'AZN'
                          ? `${transitCalc.totalPayableAzn.toFixed(2)} AZN`
                          : currency === 'USD'
                          ? `$${transitCalc.totalPayableUsd.toFixed(2)}`
                          : `€${transitCalc.totalPayableEur.toFixed(2)}`}
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateCertificate}
                      data-testid="generate-cert-from-calc-btn"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      E-Tranzit Şəhadətnaməsi Tərtib Et
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: X-RAY & SEAL TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  Dual-Energy Qamma/Rentgen & Radiasiya Telemetriyası Stendi
                </h3>
                <p className="text-xs text-slate-400">
                  Nuctech HCVP / Rapiscan Eagle M60 böyük həcmli yük və konteyner skaneri, effektiv atom nömrəsi Z_eff analizi və radiasiya dozimetriya nəzarəti.
                </p>
              </div>

              {/* Sliders and Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-700/80 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-slate-300 font-semibold">Effektiv Atom Nömrəsi (Z_eff):</span>
                      <span className="font-mono text-emerald-400 font-bold">{atomicNumberZ}</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={82}
                      step={1}
                      value={atomicNumberZ}
                      onChange={(e) => setAtomicNumberZ(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Z=6 (Üzvi/Qida)</span>
                      <span>Z=13 (Alüminium)</span>
                      <span>Z=26 (Polad/Dəmir)</span>
                      <span>Z=82 (Qurğuşun Ekran)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-slate-300 font-semibold">Radiasiya Monitoru (RPM) Dozası:</span>
                      <span
                        className={`font-mono font-bold ${
                          dosimeterRate <= 0.25 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {dosimeterRate.toFixed(2)} µSv/saat
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={0.50}
                      step={0.01}
                      value={dosimeterRate}
                      onChange={(e) => setDosimeterRate(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0.08 (Fon norması)</span>
                      <span className="text-amber-400">0.25 (Alarm həddi)</span>
                      <span className="text-rose-400">0.50 (Yüksək Təhlükə)</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateTamper}
                        onChange={(e) => setSimulateTamper(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
                      />
                      <span className="text-rose-300 font-semibold">
                        Gömrük Möhürünə Qanunsuz Müdaxilə / Plomb Qırılmasını Simulyasiya Et
                      </span>
                    </label>
                  </div>
                </div>

                {/* Telemetry Display */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Skaner Nəticəsi
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        xRayTelemetry.overallInspectionResult === 'CLEARED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : xRayTelemetry.overallInspectionResult === 'SECONDARY_PHYSICAL_SEARCH_REQUIRED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {xRayTelemetry.overallInspectionResult === 'CLEARED'
                        ? 'TƏMİZ (BURAXILIR)'
                        : xRayTelemetry.overallInspectionResult === 'SECONDARY_PHYSICAL_SEARCH_REQUIRED'
                        ? 'FİZİKİ YOXLAMA TƏLƏB OLUNUR'
                        : 'HƏBS / MÜSADİRƏ TƏDBİRİ'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Polad Nüfuzetmə Dərinliyi:</span>
                      <span className="font-mono text-slate-200">
                        {xRayTelemetry.penetrationDepthMm} mm / {xRayTelemetry.maxPenetrationLimitMm} mm
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Material Qrupu:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          xRayTelemetry.materialCategory === 'ORGANIC'
                            ? 'bg-amber-500/20 text-amber-300'
                            : xRayTelemetry.materialCategory === 'INORGANIC_ALUMINUM'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : xRayTelemetry.materialCategory === 'HEAVY_STEEL_COPPER'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {xRayTelemetry.materialCategory}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Radiasiya Təhlükəsizliyi:</span>
                      <span
                        className={`font-semibold ${
                          xRayTelemetry.isRadiationSafe ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {xRayTelemetry.isRadiationSafe ? 'Norma Daxilində (Təhlükəsiz)' : 'HƏYƏCAN (Normadan Yüksək)'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Gömrük Möhürü Statusu:</span>
                      <span
                        className={`font-semibold ${
                          xRayTelemetry.sealIntegrityStatus === 'INTACT_VERIFIED'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {xRayTelemetry.sealIntegrityStatus === 'INTACT_VERIFIED'
                          ? 'Möhür Tamdır (Qüsursuz)'
                          : 'QƏZA / PLOMB MÜDAXİLƏSİ'}
                      </span>
                    </div>

                    {xRayTelemetry.anomalyDescription && (
                      <div className="mt-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{xRayTelemetry.anomalyDescription}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAFETY CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    DGK, BDYP & FHN Beynəlxalq Yük və ADR Təhlükəsizlik Yoxlaması
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cenevrə TIR Konvensiyası və BMT ADR Qaydalarına əsasən 10 məcburi texniki təhlükəsizlik bəndi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Uyğunluq Səviyyəsi:</span>
                  <span className="font-bold text-emerald-400">
                    {checklistResult.passedCount} / {checklistResult.totalCount} ({checklistResult.completionPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistResult.allMandatoryPassed ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${checklistResult.completionPercentage}%` }}
                  />
                </div>
                {!checklistResult.allMandatoryPassed && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Bəzi məcburi təhlükəsizlik və sənəd bəndləri təmin edilməyib!
                  </p>
                )}
              </div>

              {/* Checklist items */}
              <div className="space-y-2.5">
                {MOCK_SAFETY_CHECKLIST.map((item) => {
                  const isChecked = checkedChecklistIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-semibold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                            {item.titleAz}
                          </p>
                          {item.isMandatory && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              MƏCBURİ
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.legalBasis}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    DGK & ADR Beynəlxalq Yük Daşıma İmtahan Simulyatoru
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cərimə Məcəlləsi, Gömrük Qanunvericiliyi və ADR Təhlükəli Yüklər üzrə 10 test sualı (Keçid balı: 8/10)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!isExamSubmitted ? (
                    <button
                      onClick={() => setIsExamSubmitted(true)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition cursor-pointer"
                    >
                      İmtahanı Tamamla
                    </button>
                  ) : (
                    <button
                      onClick={handleResetExam}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                    >
                      Yenidən Başla
                    </button>
                  )}
                </div>
              </div>

              {isExamSubmitted && (
                <div
                  className={`p-4 rounded-xl border ${
                    examResult.passed
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold">
                        {examResult.passed
                          ? 'Təbriklər! Nəzəri İmtahandan Müvəffəqiyyətlə Keçdiniz!'
                          : 'İmtahan Nəticəsi Qeyri-Qənaətbəxşdir'}
                      </h4>
                      <p className="text-xs mt-1">
                        Düzgün cavab: {examResult.score} / {examResult.totalQuestions} ({examResult.percentage}%)
                      </p>
                    </div>
                    <span className="text-2xl font-bold font-mono">
                      {examResult.score}/{examResult.totalQuestions}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_THEORETICAL_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedOpt = userExamAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="bg-slate-850 p-4 rounded-xl border border-slate-700/80 space-y-3"
                    >
                      <p className="text-xs font-bold text-white">
                        {idx + 1}. {q.questionAz}
                      </p>

                      <div className="space-y-1.5">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isChosen = selectedOpt === optIdx;
                          let optStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (isExamSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isChosen) {
                              optStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                            }
                          } else if (isChosen) {
                            optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerQuestion(q.id, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition cursor-pointer ${optStyle}`}
                            >
                              <span className="font-mono mr-2">{String.fromCharCode(65 + optIdx)})</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                          <p className="text-slate-300">
                            <span className="font-bold text-emerald-400">İzah: </span>
                            {q.explanationAz}
                          </p>
                          <p className="text-[10px] text-slate-500">Hüquqi Əsas: {q.legalCitation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: E-CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Generated Certificate Printable View */}
              <div
                id="dgk-tir-certificate-printable"
                className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/50 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-emerald-500/30 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                        RƏSMİ ELEKTRON SƏNƏD
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {generatedCert.certificateId}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-1 tracking-wide">
                      AZƏRBAYCAN RESPUBLİKASI DÖVLƏT GÖMRÜK KOMİTƏSİ
                    </h3>
                    <p className="text-xs text-emerald-400 font-semibold">
                      Beynəlxalq TIR Karneti & Tranzit Gömrük Buraxılış Şəhadətnaməsi
                    </p>
                  </div>

                  <div className="text-right font-mono text-xs text-slate-400">
                    <p>Verilmə Tarixi: <span className="text-slate-200">{generatedCert.issueDate}</span></p>
                    <p>Etibarlılıq: <span className="text-emerald-400 font-bold">{generatedCert.validUntil}</span></p>
                  </div>
                </div>

                {/* Certificate Body Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Daşıyıcı Şirkət</p>
                    <p className="font-bold text-white mt-0.5">{generatedCert.carrierName}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Sürücü: {generatedCert.driverFullName}</p>
                    <p className="text-[10px] font-mono text-slate-500">FİN: {generatedCert.driverFin}</p>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Nəqliyyat Vahidləri</p>
                    <p className="font-bold text-emerald-400 mt-0.5 font-mono">
                      Dartıcı: {generatedCert.tractorPlate}
                    </p>
                    <p className="font-bold text-emerald-400 font-mono">
                      Qoşqu: {generatedCert.trailerPlate}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">TIR: {generatedCert.tirCarnetNumber}</p>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Gömrük Təminatı & Möhür</p>
                    <p className="font-bold text-white mt-0.5 font-mono">
                      Plomb №: {generatedCert.customsSealSerial}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Növ: {generatedCert.isElectronicGpsSeal ? 'Elektron GPS/GSM Möhür' : 'Mexaniki Bolt Plomb'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      Zonası: {generatedCert.greenCorridorTier} TIER
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Gömrük Keçid Marşrutu</p>
                    <p className="font-bold text-white mt-0.5">{generatedCert.originCheckpoint}</p>
                    <p className="text-[11px] text-slate-400 mt-1">&darr; Təyinat:</p>
                    <p className="text-[11px] text-slate-300">{generatedCert.destinationCustoms}</p>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Rentgen & Radiasiya Skaneri</p>
                    <p className="font-bold text-emerald-400 mt-0.5">
                      {generatedCert.xrayInspectionStatus}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Dozimetr: {generatedCert.radiationDosimeterMicroSv} µSv/h (Təhlükəsiz)
                    </p>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Rüsum & Xidmət Haqqı</p>
                    <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                      {generatedCert.totalTransitFeeAzn.toFixed(2)} AZN
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">ƏDV və dövlət rüsumu daxildir</p>
                  </div>
                </div>

                {/* Security Hash & Signature */}
                <div className="pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[11px]">
                  <div className="space-y-0.5 font-mono text-slate-500">
                    <p className="text-slate-400 font-bold">{generatedCert.securityChecksumSha256}</p>
                    <p>SİMA İmza UID: {generatedCert.simaDigitalSignUid}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCertId}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}
                    </button>
                    <button
                      onClick={handlePrintCertificate}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Çap Et
                    </button>
                  </div>
                </div>
              </div>

              {/* Public Unified Registry Search */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Vahid Açıq Gömrük Tranzit Reyestri
                  </h4>
                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Şəhadətnamə, nömrə, TIR və ya şirkət axtar..."
                      value={registrySearchQuery}
                      onChange={(e) => setRegistrySearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredRegistry.map((cert) => (
                    <div
                      key={cert.certificateId}
                      className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">
                            {cert.certificateId}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            {cert.tractorPlate}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                            {cert.greenCorridorTier}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] mt-0.5">{cert.carrierName}</p>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        <p>{cert.originCheckpoint}</p>
                        <p className="text-emerald-400 font-semibold">{cert.totalTransitFeeAzn.toFixed(2)} AZN</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>AR Dövlət Gömrük Komitəsi & IRU Beynəlxalq TIR Təhlükəsizlik Zəmanəti</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
