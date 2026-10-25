import React, { useState, useMemo } from 'react';
import {
  WineOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  ShieldAlert,
  Search,
  Building2,
  Phone,
  Clock,
  Sparkles,
  RefreshCw,
  FileText,
  UserCheck,
  Stethoscope,
  Activity,
  Car,
  ChevronRight,
  Flame,
  X
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  SobrietyLevel,
  DrugSubstanceId,
  SanctionArticle,
  SobrietyProtocolRecord,
  STATUTORY_BAC_LIMIT_PROMILLE,
  STATUTORY_BRAC_LIMIT_MG_L,
  evaluateAlcoholIntoxication,
  calculateClinicalImpairment,
  calculateSobrietySanctions,
  generateSobrietyProtocolNumber,
  formatPlate,
  formatPromille,
  formatCurrency,
  SANCTION_RULES
} from '../utils/sobrietyCompliance';
import {
  DRUG_SUBSTANCES,
  CLINICAL_TEST_ITEMS,
  TOXICOLOGY_CENTERS,
  DRIVER_PRESETS,
  SAMPLE_SOBRIETY_PROTOCOLS
} from '../data/mockSobrietyData';

interface SobrietyComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency?: 'AZN' | 'USD' | 'EUR';
  lang?: 'az' | 'en' | 'ru';
}

export const SobrietyComplianceModal: React.FC<SobrietyComplianceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency = 'AZN',
  lang = 'az'
}) => {
  const language = lang;

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'alcotest' | 'drug_screen' | 'clinical' | 'sanctions' | 'registry'>('alcotest');

  // Diagnostic inputs
  const [bracMgL, setBracMgL] = useState<number>(0.00);
  const [detectedDrugs, setDetectedDrugs] = useState<DrugSubstanceId[]>([]);
  const [failedClinicalTests, setFailedClinicalTests] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<SanctionArticle>('article_333_1');
  const [isRefusal, setIsRefusal] = useState<boolean>(false);

  // Driver & vehicle dossier
  const [driverName, setDriverName] = useState<string>(vehicle?.seller?.name || 'Rauf Qasımov');
  const [finCode, setFinCode] = useState<string>('5BKL872');
  const [licenseNumber, setLicenseNumber] = useState<string>('SV-772190');
  const [vehiclePlate, setVehiclePlate] = useState<string>(vehicle?.plateNumber || '10-TR-808');
  const [vehicleModel, setVehicleModel] = useState<string>(vehicle ? `${vehicle.make} ${vehicle.model}` : 'Hyundai Elantra 2.0');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('rnm_yasamal_division');

  // Clinical category filter
  const [clinicalFilter, setClinicalFilter] = useState<'all' | 'neurological' | 'motor' | 'cognitive' | 'autonomic' | 'ocular'>('all');

  // Protocol generation & registry
  const [protocols, setProtocols] = useState<SobrietyProtocolRecord[]>(SAMPLE_SOBRIETY_PROTOCOLS);
  const [currentProtocol, setCurrentProtocol] = useState<SobrietyProtocolRecord | null>(SAMPLE_SOBRIETY_PROTOCOLS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [centerSearchQuery, setCenterSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Evaluations
  const alcoholEval = useMemo(() => evaluateAlcoholIntoxication(bracMgL), [bracMgL]);

  const clinicalEval = useMemo(
    () => calculateClinicalImpairment(failedClinicalTests, CLINICAL_TEST_ITEMS.length),
    [failedClinicalTests]
  );

  const sanctionsEval = useMemo(
    () =>
      calculateSobrietySanctions({
        article: selectedArticle,
        bracMgL,
        detectedDrugs,
        refusal: isRefusal,
        currency
      }),
    [selectedArticle, bracMgL, detectedDrugs, isRefusal, currency]
  );

  const selectedCenter = useMemo(
    () => TOXICOLOGY_CENTERS.find((c) => c.id === selectedCenterId) || TOXICOLOGY_CENTERS[0],
    [selectedCenterId]
  );

  // Filtered clinical items
  const filteredClinicalItems = useMemo(() => {
    if (clinicalFilter === 'all') return CLINICAL_TEST_ITEMS;
    return CLINICAL_TEST_ITEMS.filter((item) => item.category === clinicalFilter);
  }, [clinicalFilter]);

  // Filtered protocols
  const filteredProtocols = useMemo(() => {
    if (!searchQuery.trim()) return protocols;
    const q = searchQuery.toLowerCase();
    return protocols.filter(
      (p) =>
        p.protocolNumber.toLowerCase().includes(q) ||
        p.driverName.toLowerCase().includes(q) ||
        p.vehiclePlate.toLowerCase().includes(q) ||
        p.finCode.toLowerCase().includes(q)
    );
  }, [protocols, searchQuery]);

  // Filtered centers
  const filteredCenters = useMemo(() => {
    if (!centerSearchQuery.trim()) return TOXICOLOGY_CENTERS;
    const q = centerSearchQuery.toLowerCase();
    return TOXICOLOGY_CENTERS.filter(
      (c) =>
        c.nameAz.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.cityAz.toLowerCase().includes(q) ||
        c.cityEn.toLowerCase().includes(q)
    );
  }, [centerSearchQuery]);

  if (!isOpen) return null;

  // Handlers
  const handleSelectPreset = (preset: typeof DRIVER_PRESETS[0]) => {
    setDriverName(preset.driverName);
    setFinCode(preset.finCode);
    setLicenseNumber(preset.licenseNumber);
    setVehiclePlate(preset.vehiclePlate);
    setVehicleModel(preset.vehicleModel);
    setBracMgL(preset.bracMgL);
    setDetectedDrugs([...preset.detectedDrugs]);
    setFailedClinicalTests([...preset.failedClinicalTests]);
    setSelectedArticle(preset.violationArticle);
    setIsRefusal(preset.refusal);
  };

  const toggleDrug = (drugId: DrugSubstanceId) => {
    setDetectedDrugs((prev) =>
      prev.includes(drugId) ? prev.filter((d) => d !== drugId) : [...prev, drugId]
    );
  };

  const toggleClinicalTest = (testId: string) => {
    setFailedClinicalTests((prev) =>
      prev.includes(testId) ? prev.filter((t) => t !== testId) : [...prev, testId]
    );
  };

  const handleGenerateProtocol = () => {
    const isIntoxicated = alcoholEval.isViolation || detectedDrugs.length > 0 || isRefusal;
    let status: 'confirmed_intoxicated' | 'sober_cleared' | 'refusal_sanctioned' = 'sober_cleared';
    if (isRefusal) {
      status = 'refusal_sanctioned';
    } else if (isIntoxicated) {
      status = 'confirmed_intoxicated';
    }

    const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: SobrietyProtocolRecord = {
      id: `proto-${Date.now()}`,
      protocolNumber: generateSobrietyProtocolNumber(),
      date: dateStr,
      driverName,
      finCode,
      licenseNumber,
      vehiclePlate,
      vehicleModel,
      centerId: selectedCenter.id,
      centerName: language === 'az' ? selectedCenter.nameAz : language === 'ru' ? selectedCenter.nameRu : selectedCenter.nameEn,
      examiningDoctor: 'Dr. Əli Ağayev (Ali Dərəcəli Həkim-Narkoloq)',
      doctorRegNumber: 'NK-AZ-4419',
      inspectorBadge: 'YP-77-402 (Baş Leytenant)',
      policeDistrict: 'Bakı ş. BPİ DYPİ 1-ci Patrul Taboru',
      dragerDeviceSerial: 'AR-7510-9941',
      bracMgL,
      bacPromille: alcoholEval.bacPromille,
      sobrietyLevel: alcoholEval.status,
      detectedDrugs: [...detectedDrugs],
      clinicalFailedCount: clinicalEval.failedCount,
      clinicalImpairmentScore: clinicalEval.impairmentScore,
      clinicalPass: clinicalEval.clinicalPass,
      fineAzn: sanctionsEval.fineAzn,
      penaltyPoints: sanctionsEval.penaltyPoints,
      suspensionMonths: sanctionsEval.suspensionMonths,
      arrestDaysMax: sanctionsEval.arrestDaysMax,
      impoundMandatory: sanctionsEval.impoundMandatory,
      status,
      verificationHash: randomHash
    };

    setProtocols([newRecord, ...protocols]);
    setCurrentProtocol(newRecord);
    setActiveTab('registry');
  };

  const handleCopyCode = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (level: SobrietyLevel) => {
    switch (level) {
      case 'sober':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {language === 'az' ? 'Ayıq (Qanuni Hədd)' : language === 'ru' ? 'Трезвый (Норма)' : 'Sober (Legal)'}
          </span>
        );
      case 'mild':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {language === 'az' ? 'Yüngül Sərxoşluq (0.30–0.79 ‰)' : language === 'ru' ? 'Легкое опьянение' : 'Mild Intoxication'}
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            {language === 'az' ? 'Orta Sərxoşluq (0.80–1.49 ‰)' : language === 'ru' ? 'Среднее опьянение' : 'Moderate Intoxication'}
          </span>
        );
      case 'severe':
      case 'coma_risk':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
            {language === 'az' ? 'Ağır Toksik Sərxoşluq (≥1.50 ‰)' : language === 'ru' ? 'Тяжелое опьянение' : 'Severe Intoxication'}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      data-testid="sobriety-compliance-modal"
    >
      <div className="relative w-full max-w-5xl my-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-600/10 via-rose-500/5 to-slate-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-lg shadow-red-500/25">
              <WineOff className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-red-600 dark:text-red-400">
                  DİN & Səhiyyə Nazirliyi • RNM
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500">
                  İXM Maddə 333 / 334
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {language === 'az'
                  ? 'Sürücü Sərxoşluğu, Alkotest Telemetriyası & Toksikoloji Müayinə Portalı'
                  : language === 'ru'
                  ? 'Освидетельствование на состояние опьянения, Алкотестер и Наркология'
                  : 'Driver Sobriety, Breathalyzer Telemetry & Narcological Forensic Portal'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="close-sobriety-modal-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Driver Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {language === 'az' ? 'Yol Patrul Ssenariləri:' : language === 'ru' ? 'Сценарии патруля:' : 'Patrol Scenarios:'}
          </span>
          {DRIVER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-950/30 text-slate-700 dark:text-slate-300 font-medium transition-all shrink-0"
            >
              {preset.driverName} ({preset.bracMgL > 0 ? `${(preset.bracMgL * 2).toFixed(2)} ‰` : preset.detectedDrugs.length > 0 ? 'Narkotik' : preset.refusal ? 'İmtina' : 'Ayıq'})
            </button>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto bg-white dark:bg-slate-900">
          {[
            { id: 'alcotest', labelAz: 'Dräger Alkotest (BrAC/BAC)', labelRu: 'Алкотестер Dräger', labelEn: 'Dräger Alcotest', icon: Activity },
            { id: 'drug_screen', labelAz: '6-Panel Narkotik Testi', labelRu: '6-Панельный наркотест', labelEn: '6-Panel Drug Screen', icon: Flame },
            { id: 'clinical', labelAz: 'Klinik Koordinasiya Sınağı', labelRu: 'Клинические пробы', labelEn: 'Clinical Romberg Tests', icon: Stethoscope },
            { id: 'sanctions', labelAz: 'İXM 333 Sanksiyaları & Mərkəzlər', labelRu: 'Санкции КоАП и Центры', labelEn: 'Sanctions & Centers Radar', icon: Building2 },
            { id: 'registry', labelAz: 'Protokol & Dövlət Reyestri', labelRu: 'Протокол и Реестр', labelEn: 'Protocol & Registry', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                data-testid={`sobriety-tab-${tab.id}`}
                className={`py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-red-600 text-red-600 dark:text-red-400 dark:border-red-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {language === 'az' ? tab.labelAz : language === 'ru' ? tab.labelRu : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ALCOTEST SIMULATOR */}
          {activeTab === 'alcotest' && (
            <div className="space-y-6" data-testid="alcotest-tab-content">
              {/* Dräger Virtual Stand */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Visual Dräger Device */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-800 to-slate-950 p-6 rounded-2xl border-4 border-slate-700 shadow-xl text-white flex flex-col items-center">
                  <div className="w-full flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
                    <span className="font-mono text-xs tracking-widest text-slate-400 font-semibold">
                      Dräger Alcotest 7510
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      EC-SENSOR OK
                    </span>
                  </div>

                  {/* LCD Display */}
                  <div className="w-full bg-[#9ebb7b] text-slate-900 font-mono p-4 rounded-xl shadow-inner border-2 border-[#8da96b] mb-4">
                    <div className="text-[10px] tracking-wider font-bold opacity-75 mb-1 flex justify-between">
                      <span>DİN-BDYP AZE</span>
                      <span>{alcoholEval.isViolation ? '⚠️ POSITIVE' : '✓ NEGATIVE'}</span>
                    </div>
                    <div className="text-3xl font-black tracking-tight text-center my-2">
                      {bracMgL.toFixed(2)} <span className="text-sm font-normal">mg/L</span>
                    </div>
                    <div className="text-center font-bold text-xs border-t border-slate-800/20 pt-1 flex justify-between">
                      <span>BAC: {formatPromille(alcoholEval.bacPromille)}</span>
                      <span>Hədd: 0.30 ‰</span>
                    </div>
                  </div>

                  {/* Device LED Indicators */}
                  <div className="w-full grid grid-cols-3 gap-2 mb-4">
                    <div className={`p-2 rounded-lg text-center border text-[11px] font-bold ${
                      !alcoholEval.isViolation
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800/40 text-slate-600 border-slate-700'
                    }`}>
                      AYIQ (&lt;0.30‰)
                    </div>
                    <div className={`p-2 rounded-lg text-center border text-[11px] font-bold ${
                      alcoholEval.status === 'mild'
                        ? 'bg-amber-500/30 text-amber-300 border-amber-500'
                        : 'bg-slate-800/40 text-slate-600 border-slate-700'
                    }`}>
                      YÜNGÜL (0.3–0.8)
                    </div>
                    <div className={`p-2 rounded-lg text-center border text-[11px] font-bold ${
                      alcoholEval.status === 'moderate' || alcoholEval.status === 'severe' || alcoholEval.status === 'coma_risk'
                        ? 'bg-rose-500/30 text-rose-300 border-rose-500 animate-pulse'
                        : 'bg-slate-800/40 text-slate-600 border-slate-700'
                    }`}>
                      AĞIR (&gt;0.8‰)
                    </div>
                  </div>

                  <div className="w-full text-center text-xs text-slate-400 border-t border-slate-800 pt-3">
                    Seriya №: <span className="font-mono text-slate-200">AR-7510-9941</span> • Kalibrasiya: <span className="text-emerald-400">2026-10-15</span>
                  </div>
                </div>

                {/* Controls & Telemetry */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-red-500" />
                        Nəfəs Havasında Spirt Qatılığı (BrAC):
                      </label>
                      <span className="font-mono text-base font-black text-red-600 dark:text-red-400">
                        {bracMgL.toFixed(2)} mg/L ({formatPromille(alcoholEval.bacPromille)})
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.00"
                      max="2.50"
                      step="0.01"
                      value={bracMgL}
                      onChange={(e) => setBracMgL(parseFloat(e.target.value))}
                      data-testid="brac-slider"
                      className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />

                    {/* Quick Concentration Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      {[
                        { label: '0.00 mg/L (Ayıq)', val: 0.00 },
                        { label: '0.15 mg/L (0.30 ‰ Hədd)', val: 0.15 },
                        { label: '0.25 mg/L (0.50 ‰ Yüngül)', val: 0.25 },
                        { label: '0.50 mg/L (1.00 ‰ Orta)', val: 0.50 },
                        { label: '1.05 mg/L (2.10 ‰ Ağır)', val: 1.05 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => setBracMgL(item.val)}
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-red-500 text-slate-700 dark:text-slate-200 font-mono transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diagnostics Assessment Card */}
                  <div className={`p-4 rounded-xl border ${
                    alcoholEval.isViolation
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-emerald-500/10 border-emerald-500/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      {alcoholEval.isViolation ? (
                        <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {alcoholEval.severityText[language]}
                          </h4>
                          {getStatusBadge(alcoholEval.status)}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {alcoholEval.isViolation
                            ? `Qanuni hədd (0.30 ‰) ${((alcoholEval.bacPromille / STATUTORY_BAC_LIMIT_PROMILLE) * 100 - 100).toFixed(0)}% aşılıb. AR İXM Maddə 333 üzrə nəqliyyat vasitəsinin idarə olunması dərhal qadağan edilir və avtomobil cərimə meydançasına göndərilir.`
                            : 'Nəfəs və qanda spirt qatılığı qanunla müəyyən edilmiş 0.30 promil fizioloji həddi daxilindədir. Nəqliyyat vasitəsini idarə etməyə maneə yoxdur.'}
                        </p>
                        {alcoholEval.hoursToSober > 0 && (
                          <div className="pt-2 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-500" />
                            Tam ayılma müddəti (0.15 ‰/saat metobolizm sürəti ilə): ~
                            <span className="text-red-600 dark:text-red-400">{alcoholEval.hoursToSober} saat</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 6-PANEL DRUG SCREEN */}
          {activeTab === 'drug_screen' && (
            <div className="space-y-6" data-testid="drug-screen-tab-content">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    Sürətli Tüpürcək & Sidik Narkotik Kaset Müayinəsi (6 Panel)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Respublika Narkoloji Mərkəzi tərəfindən təsdiq olunmuş immunoxromatoqrafik ekspress test
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    detectedDrugs.length > 0
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  }`}>
                    {detectedDrugs.length > 0 ? `${detectedDrugs.length} Maddə AŞKARLANDI` : 'MƏNFİ (Maddə Yoxdur)'}
                  </span>
                </div>
              </div>

              {/* Drug Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DRUG_SUBSTANCES.map((substance) => {
                  const isDetected = detectedDrugs.includes(substance.id);
                  return (
                    <div
                      key={substance.id}
                      onClick={() => toggleDrug(substance.id)}
                      data-testid={`drug-item-${substance.id}`}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isDetected
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500 shadow-md shadow-rose-500/10'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-500">
                            {substance.id.toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDetected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {isDetected ? 'MÜSBƏT (Aşkarlandı)' : 'MƏNFİ (Təmiz)'}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                          {language === 'az' ? substance.nameAz : language === 'ru' ? substance.nameRu : substance.nameEn}
                        </h4>

                        <div className="text-[11px] text-slate-500 space-y-0.5 mb-3 font-mono">
                          <div>Cut-off: {substance.cutoffNgMl} ng/mL</div>
                          <div>Qanda qalma: {substance.detectionWindowDays}</div>
                        </div>

                        {/* Test Strip Visualizer */}
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-around mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                            <span className="text-slate-400">C:</span>
                            <span className="w-1.5 h-4 rounded bg-rose-600" title="Control Line (Valid)" />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                            <span className="text-slate-400">T:</span>
                            {isDetected ? (
                              <span className="w-1.5 h-4 rounded bg-transparent border border-dashed border-slate-400" title="Test Line Absent (Positive)" />
                            ) : (
                              <span className="w-1.5 h-4 rounded bg-rose-600" title="Test Line Present (Negative)" />
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/60 pt-2">
                        {language === 'az' ? substance.riskDescriptionAz : language === 'ru' ? substance.riskDescriptionRu : substance.riskDescriptionEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CLINICAL COORDINATION TESTS */}
          {activeTab === 'clinical' && (
            <div className="space-y-6" data-testid="clinical-tab-content">
              {/* Score Bar */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-red-500" />
                    Respublika Narkoloji Mərkəzi 10-Mərhələli Klinik Koordinasiya Standı
                  </h3>
                  <p className="text-xs text-slate-500">
                    Həkim-narkoloq tərəfindən aparılan hərəki, nevroloji və vegetativ testlər
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-medium text-slate-500">Pozulma İndeksi:</div>
                    <div className="text-xl font-black text-red-600 dark:text-red-400 font-mono">
                      {clinicalEval.impairmentScore}% ({clinicalEval.failedCount} / 10 sınaq)
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    clinicalEval.clinicalPass
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  }`}>
                    {clinicalEval.clinicalPass ? 'KLİNİK AYIQ' : 'KLİNİK SƏRXOŞLUQ'}
                  </span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 text-xs overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'Bütün Testlər (10)' },
                  { id: 'neurological', label: 'Nevroloji' },
                  { id: 'ocular', label: 'Göz / Bəbək (HGN)' },
                  { id: 'motor', label: 'Hərəki / Müvazinət' },
                  { id: 'cognitive', label: 'Koqnitiv / Nitq' },
                  { id: 'autonomic', label: 'Vegetativ Əlamətlər' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setClinicalFilter(cat.id as typeof clinicalFilter)}
                    className={`px-3 py-1 rounded-lg border font-medium transition-colors ${
                      clinicalFilter === cat.id
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {filteredClinicalItems.map((item) => {
                  const isFailed = failedClinicalTests.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleClinicalTest(item.id)}
                      data-testid={`clinical-test-${item.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isFailed
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-100'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-slate-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {language === 'az' ? item.nameAz : language === 'ru' ? item.nameRu : item.nameEn}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {language === 'az' ? item.descriptionAz : language === 'ru' ? item.descriptionRu : item.descriptionEn}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isFailed ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold">
                            <XCircle className="w-4 h-4" />
                            POZULUB
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            NORMAL
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SANCTIONS MATRIX & CENTERS RADAR */}
          {activeTab === 'sanctions' && (
            <div className="space-y-6" data-testid="sanctions-tab-content">
              {/* Scenario Selector & Sanctions Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    İnzibati Xətalar Məcəlləsi (İXM) Sanksiya Seçimi
                  </h3>

                  <div className="space-y-2">
                    {(Object.keys(SANCTION_RULES) as SanctionArticle[]).map((art) => {
                      const rule = SANCTION_RULES[art];
                      const isSelected = selectedArticle === art;
                      return (
                        <div
                          key={art}
                          onClick={() => {
                            setSelectedArticle(art);
                            if (art === 'article_334_1') setIsRefusal(true);
                            else setIsRefusal(false);
                          }}
                          data-testid={`article-option-${art}`}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-500/10 border-red-500 text-slate-900 dark:text-white'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs">{rule.titleAz}</span>
                            <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                              {rule.baseFineAzn} AZN {rule.penaltyPoints > 0 ? `+ ${rule.penaltyPoints} Bal` : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{rule.descriptionAz}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="lg:col-span-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-500" />
                    Tətbiq Edilən İnzibati Tənbeh Tədbirləri
                  </h3>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-slate-400 text-xs font-medium">Hüquqi Əsas:</span>
                      <span className="font-mono text-xs text-amber-400 font-bold">
                        {sanctionsEval.legalBasis}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                        <div className="text-[11px] text-slate-400">İnzibati Cərimə:</div>
                        <div className="text-2xl font-black text-white font-mono mt-1">
                          {formatCurrency(sanctionsEval.convertedFine, currency)}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                        <div className="text-[11px] text-slate-400">Cərimə Balı:</div>
                        <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                          {sanctionsEval.penaltyPoints} Bal
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                        <div className="text-[11px] text-slate-400">Sürücülük Məhrumetmə:</div>
                        <div className="text-lg font-bold text-rose-400 mt-1">
                          {sanctionsEval.suspensionMonths > 0
                            ? `${sanctionsEval.suspensionMonths} Ay (${sanctionsEval.suspensionMonths / 12} İl)`
                            : 'Məhrumetmə Yoxdur'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                        <div className="text-[11px] text-slate-400">İnzibati Həbs Riski:</div>
                        <div className="text-lg font-bold text-rose-400 mt-1">
                          {sanctionsEval.arrestDaysMax > 0
                            ? `${sanctionsEval.arrestDaysMax} Günədək`
                            : 'Nəzərdə Tutulmayıb'}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                      <span>
                        <strong>İXM Maddə 96.1:</strong> Sərxoş sürücünün avtomobili dərhal təxliyə olunaraq mühafizə olunan cərimə duracağına göndərilir.
                      </span>
                    </div>

                    <button
                      onClick={handleGenerateProtocol}
                      data-testid="create-protocol-btn"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      Rəsmi Protokol Tərtib Et və Reyestrə Yaz
                    </button>
                  </div>
                </div>
              </div>

              {/* Centers Radar */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-red-500" />
                      Respublika Narkoloji Mərkəzi 24/7 Toksikoloji Ekspertiza Məntəqələri
                    </h3>
                    <p className="text-xs text-slate-500">
                      Səhiyyə Nazirliyi və DİN BDYP tərəfindən akkreditə olunmuş stasionar laboratoriyalar
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Məntəqə və ya şəhər axtar..."
                      value={centerSearchQuery}
                      onChange={(e) => setCenterSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-red-500 w-56"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCenters.map((center) => (
                    <div
                      key={center.id}
                      onClick={() => setSelectedCenterId(center.id)}
                      data-testid={`center-card-${center.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedCenterId === center.id
                          ? 'bg-red-500/10 border-red-500 shadow-md shadow-red-500/10'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">
                            {center.cityAz}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                            {center.workingHours}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {language === 'az' ? center.nameAz : language === 'ru' ? center.nameRu : center.nameEn}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {language === 'az' ? center.addressAz : language === 'ru' ? center.addressRu : center.addressEn}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-3 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-red-500" />
                          {center.phone}
                        </span>
                        <span>{center.activePhysicians} Həkim-Narkoloq</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROTOCOL & REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="registry-tab-content">
              {currentProtocol && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-500" />
                      Rəsmi Tibbi Müayinə Protokolu (DİN-RNM-2026)
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(currentProtocol.protocolNumber, currentProtocol.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedId === currentProtocol.id ? 'Kopyalandı!' : 'Kodu Kopyala'}
                      </button>
                      <button
                        onClick={handlePrint}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Çap Et
                      </button>
                    </div>
                  </div>

                  {/* Dual View: Thermal Slip + Certificate */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Thermal Paper Slip */}
                    <div className="lg:col-span-5 bg-[#faf8ef] dark:bg-[#1a1b18] text-slate-800 dark:text-[#d3d0c2] p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 font-mono text-xs shadow-inner space-y-2">
                      <div className="text-center font-bold pb-2 border-b border-dashed border-slate-400 dark:border-slate-700">
                        ================================<br />
                        AZƏRBAYCAN RESPUBLİKASI DİN<br />
                        BAŞ DÖVLƏT YOL POLİSİ İDARƏSİ<br />
                        DRÄGER ALCOTEST 7510 TELEMETRİYA<br />
                        ================================
                      </div>
                      <div className="flex justify-between">
                        <span>PROTOKOL №:</span>
                        <span className="font-bold">{currentProtocol.protocolNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TARİX / SAAT:</span>
                        <span>{currentProtocol.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CİHAZ SERİYA:</span>
                        <span>{currentProtocol.dragerDeviceSerial}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MÜFETTİŞ:</span>
                        <span>{currentProtocol.inspectorBadge}</span>
                      </div>
                      <div className="border-t border-dashed border-slate-400 dark:border-slate-700 my-2 pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>SÜRÜCÜ:</span>
                          <span className="font-bold">{currentProtocol.driverName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>DÖVLƏT NÖMRƏ:</span>
                          <span className="font-bold">{formatPlate(currentProtocol.vehiclePlate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>FİN KOD:</span>
                          <span>{currentProtocol.finCode}</span>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-slate-400 dark:border-slate-700 my-2 pt-2 space-y-1">
                        <div className="flex justify-between text-sm font-bold">
                          <span>BrAC NƏTİCƏ:</span>
                          <span>{currentProtocol.bracMgL.toFixed(2)} mg/L</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                          <span>BAC (QAN EK.):</span>
                          <span className="text-red-600 dark:text-red-400">
                            {formatPromille(currentProtocol.bacPromille)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>HƏDD:</span>
                          <span>0.30 ‰ (Fizioloji norma)</span>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-slate-400 dark:border-slate-700 my-2 pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>NARKOTİK TESTİ:</span>
                          <span>{currentProtocol.detectedDrugs.length > 0 ? currentProtocol.detectedDrugs.join(', ').toUpperCase() : 'MƏNFİ'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>KLİNİK SINAQ:</span>
                          <span>{currentProtocol.clinicalPass ? 'AYIQ (Normal)' : `${currentProtocol.clinicalImpairmentScore}% Pozulma`}</span>
                        </div>
                      </div>
                      <div className="text-center font-bold pt-3 border-t border-dashed border-slate-400 dark:border-slate-700">
                        {currentProtocol.status === 'confirmed_intoxicated'
                          ? '*** SƏRXOŞLUQ TƏSDİQLƏNDİ ***'
                          : currentProtocol.status === 'refusal_sanctioned'
                          ? '*** MÜAYİNƏDƏN İMTİNA EDİLDİ ***'
                          : '*** SPİRT QATILIĞI AŞKARLANMADI ***'}
                      </div>
                    </div>

                    {/* Certificate Card */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                        <div>
                          <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">
                            Təsdiq Edilmiş Tibbi-Ekspertiza Rəyi
                          </div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {currentProtocol.centerName}
                          </h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          currentProtocol.status === 'confirmed_intoxicated' || currentProtocol.status === 'refusal_sanctioned'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        }`}>
                          {currentProtocol.status === 'confirmed_intoxicated'
                            ? 'SƏRXOŞ VƏZİYYƏT'
                            : currentProtocol.status === 'refusal_sanctioned'
                            ? 'İMTİNA SANKSİYASI'
                            : 'MƏNFİ / AYIQ'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">Sürücü:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{currentProtocol.driverName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Nəqliyyat Vasitəsi:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{currentProtocol.vehicleModel} ({formatPlate(currentProtocol.vehiclePlate)})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Ekspert-Narkoloq:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{currentProtocol.examiningDoctor}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Həkim Qeydiyyat №:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentProtocol.doctorRegNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">İXM Maddə Cəriməsi:</span>
                          <span className="font-mono font-bold text-red-600 dark:text-red-400">{currentProtocol.fineAzn} AZN</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Məhrumetmə Müddəti:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{currentProtocol.suspensionMonths > 0 ? `${currentProtocol.suspensionMonths} Ay` : 'Tətbiq olunmur'}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div className="space-y-0.5 font-mono text-[11px] text-slate-500">
                          <div>SHA256: {currentProtocol.verificationHash.slice(0, 20)}...</div>
                          <div>SİMA Biometrik İmza: Təsdiqlənib</div>
                        </div>
                        <div className="w-12 h-12 bg-white p-1 rounded border border-slate-300 flex items-center justify-center font-mono text-[9px] text-slate-800 text-center font-bold">
                          QR VERIFY
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Historical Public Registry Table */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-red-500" />
                      Vahid Dövlət Toksikoloji Ekspertiza Reyestri
                    </h3>
                    <p className="text-xs text-slate-500">
                      Son 24 saat ərzində BDYP və RNM tərəfindən qeydə alınmış rəsmi protokollar
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Protokol, ad, nömrə və ya FİN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:border-red-500 w-64"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="p-3">Protokol №</th>
                          <th className="p-3">Tarix</th>
                          <th className="p-3">Sürücü & FİN</th>
                          <th className="p-3">Nömrə</th>
                          <th className="p-3">Spirt / Narkotik</th>
                          <th className="p-3">Sanksiya</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Əməliyyat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredProtocols.map((p) => (
                          <tr
                            key={p.id}
                            onClick={() => setCurrentProtocol(p)}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                          >
                            <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">
                              {p.protocolNumber}
                            </td>
                            <td className="p-3 text-slate-500">{p.date}</td>
                            <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                              {p.driverName} <span className="text-[10px] text-slate-400 font-mono">({p.finCode})</span>
                            </td>
                            <td className="p-3 font-mono font-semibold">{formatPlate(p.vehiclePlate)}</td>
                            <td className="p-3 font-mono">
                              {p.bacPromille > 0 ? (
                                <span className="font-bold text-red-500">{formatPromille(p.bacPromille)}</span>
                              ) : p.detectedDrugs.length > 0 ? (
                                <span className="font-bold text-amber-500">{p.detectedDrugs.join(', ').toUpperCase()}</span>
                              ) : (
                                <span className="text-emerald-500 font-bold">0.00 ‰ (Ayıq)</span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                              {p.fineAzn > 0 ? `${p.fineAzn} AZN` : 'Cəriməsiz'}
                              {p.suspensionMonths > 0 ? ` + ${p.suspensionMonths / 12}il` : ''}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'confirmed_intoxicated'
                                  ? 'bg-rose-500/10 text-rose-500'
                                  : p.status === 'refusal_sanctioned'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-emerald-500/10 text-emerald-500'
                              }`}>
                                {p.status === 'confirmed_intoxicated' ? 'Sərxoşluq' : p.status === 'refusal_sanctioned' ? 'İmtina' : 'Ayıq'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentProtocol(p);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white transition-colors text-[11px] font-semibold"
                              >
                                Baxış
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>
              <strong>Dövlət İnteqrasiyası:</strong> AR Daxili İşlər Nazirliyi BDYP & Səhiyyə Nazirliyi Respublika Narkoloji Mərkəzi
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
