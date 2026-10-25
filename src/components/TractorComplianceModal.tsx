import React, { useState } from 'react';
import {
  X,
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  MapPin,
  Clock,
  Shield,
  FileText,
  Users,
  Gauge,
  Sparkles,
  Phone,
  Calculator,
  Tractor,
  Route,
  Flame,
  CheckSquare,
  Square,
  DollarSign,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  TractorCategory,
  TractorCertificate,
  TractorDriverProfile,
  TractorTechnicalChecklist,
  TRACTOR_CATEGORIES,
  calculateEktisSubsidy,
  evaluateFieldTransitSafety,
  evaluateTractorChecklist,
  evaluateTractorDriver,
  generateTractorCertificate,
} from '../utils/tractorCompliance';
import {
  DaxaInspectionCenter,
  MOCK_DAXA_INSPECTION_CENTERS,
  MOCK_REGISTERED_TRACTOR_CERTIFICATES,
  MOCK_THEORY_QUESTIONS,
  MOCK_TRACTOR_MODELS,
  TractorModelPreset,
} from '../data/mockTractorData';

interface TractorComplianceModalProps {
  isOpen: boolean;
  vehicle?: Vehicle | null;
  currency?: Currency;
  onClose: () => void;
}

type TabType = 'audit' | 'driver' | 'transit' | 'subsidy' | 'centers' | 'certificate';

export const TractorComplianceModal: React.FC<TractorComplianceModalProps> = ({
  isOpen,
  currency = 'AZN',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('audit');
  const [copiedCode, setCopiedCode] = useState(false);

  // Tab 1: Machinery Selection & Technical Audit State
  const [selectedModelId, setSelectedModelId] = useState<string>(MOCK_TRACTOR_MODELS[0].id);
  const activeModel: TractorModelPreset =
    MOCK_TRACTOR_MODELS.find((m) => m.id === selectedModelId) || MOCK_TRACTOR_MODELS[0];
  const [checklist, setChecklist] = useState<TractorTechnicalChecklist>(activeModel.defaultChecklist);

  // Tab 2: Driver & Theory Exam State
  const [driverProfile, setDriverProfile] = useState<TractorDriverProfile>({
    fullName: 'Rəşad Qasımov',
    finCode: '6JK9821',
    category: activeModel.category,
    driverAge: 28,
    medicalFitnessValid: true,
    theoryExamScore: 10,
    practicalTillageExamPassed: true,
  });
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({
    1: 1,
    2: 2,
    3: 1,
    4: 2,
    5: 1,
    6: 1,
    7: 2,
    8: 1,
    9: 1,
    10: 2,
  });
  const [showExamExplanations, setShowExamExplanations] = useState(false);

  // Tab 3: Field Transit Safety State
  const [transitMachineryType, setTransitMachineryType] = useState<'wheeled' | 'crawler' | 'combine'>(
    activeModel.chassisType === 'crawler' ? 'crawler' : activeModel.category === 'F' ? 'combine' : 'wheeled'
  );
  const [travelSurface, setTravelSurface] = useState<'asphalt_highway' | 'dirt_field_road'>('asphalt_highway');
  const [cuttingWidthMeters, setCuttingWidthMeters] = useState<number>(6.5);
  const [isHeaderAttachedToFront, setIsHeaderAttachedToFront] = useState<boolean>(true);
  const [hasAmberBeaconActive, setHasAmberBeaconActive] = useState<boolean>(true);
  const [hasPilotEscortVehicle, setHasPilotEscortVehicle] = useState<boolean>(false);
  const [plannedSpeedKmh, setPlannedSpeedKmh] = useState<number>(35);

  // Tab 4: EKTİS Subsidy State
  const [subsidyMachineryPrice, setSubsidyMachineryPrice] = useState<number>(activeModel.priceAzn);
  const [subsidyCategory, setSubsidyCategory] = useState<TractorCategory>(activeModel.category);
  const [isPreferential, setIsPreferential] = useState<boolean>(true);
  const [leaseMonths, setLeaseMonths] = useState<number>(60);
  const [activeCurrency, setActiveCurrency] = useState<Currency>(currency);

  // Tab 5: Centers State
  const [centerSearchQuery, setCenterSearchQuery] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState<string>(MOCK_DAXA_INSPECTION_CENTERS[0].id);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('10:00');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Tab 6: Certificate State
  const [certificates, setCertificates] = useState<TractorCertificate[]>(MOCK_REGISTERED_TRACTOR_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<TractorCertificate>(
    MOCK_REGISTERED_TRACTOR_CERTIFICATES[0]
  );
  const [registrySearch, setRegistrySearch] = useState('');

  if (!isOpen) return null;

  // Handle Preset Model Switching
  const handleModelSelect = (model: TractorModelPreset) => {
    setSelectedModelId(model.id);
    setChecklist(model.defaultChecklist);
    setDriverProfile((prev) => ({ ...prev, category: model.category }));
    setTransitMachineryType(
      model.chassisType === 'crawler' ? 'crawler' : model.category === 'F' ? 'combine' : 'wheeled'
    );
    setSubsidyMachineryPrice(model.priceAzn);
    setSubsidyCategory(model.category);
  };

  // Toggle checklist item
  const toggleChecklist = (key: keyof TractorTechnicalChecklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculations
  const auditResult = evaluateTractorChecklist(checklist);
  const driverResult = evaluateTractorDriver(driverProfile);
  const transitResult = evaluateFieldTransitSafety({
    machineryType: transitMachineryType,
    cuttingWidthMeters,
    isHeaderAttachedToFront,
    travelSurface,
    hasAmberBeaconActive,
    hasPilotEscortVehicle,
    plannedSpeedKmh,
  });
  const subsidyResult = calculateEktisSubsidy({
    machineryPriceAzn: subsidyMachineryPrice,
    machineryCategory: subsidyCategory,
    isLocalAssemblyOrPreferential: isPreferential,
    leasePeriodMonths: leaseMonths,
    currency: activeCurrency,
  });

  // Handle Theory Question Answer
  const handleAnswerSelect = (qId: number, optIdx: number) => {
    const updated = { ...examAnswers, [qId]: optIdx };
    setExamAnswers(updated);
    let correctCount = 0;
    for (const q of MOCK_THEORY_QUESTIONS) {
      if (updated[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    }
    setDriverProfile((prev) => ({ ...prev, theoryExamScore: correctCount }));
  };

  // Generate new certificate
  const handleIssueCertificate = () => {
    const activeCenter =
      MOCK_DAXA_INSPECTION_CENTERS.find((c) => c.id === selectedCenterId) || MOCK_DAXA_INSPECTION_CENTERS[0];
    const newCert = generateTractorCertificate({
      daxaDivisionName: activeCenter.name,
      plateNumber: activeModel.plateNumber,
      chassisNumber: activeModel.chassisSerial,
      engineSerial: activeModel.engineSerial,
      category: activeModel.category,
      ownerName: driverProfile.fullName + ' (Aqrar Təsərrüfatı)',
      ownerVoenOrFin: `FİN: ${driverProfile.finCode}`,
      safetyScore: auditResult.score,
    });
    setCertificates((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredCenters = MOCK_DAXA_INSPECTION_CENTERS.filter(
    (c) =>
      c.name.toLowerCase().includes(centerSearchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(centerSearchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(centerSearchQuery.toLowerCase())
  );

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.certificateNumber.toLowerCase().includes(registrySearch.toLowerCase()) ||
      cert.plateNumber.toLowerCase().includes(registrySearch.toLowerCase()) ||
      cert.ownerName.toLowerCase().includes(registrySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/60 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <Tractor className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                  KTN & DAXA Aqrotexnika və Traktor Portalı
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full">
                  DAXA / EKTİS 2026
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Kənd Təsərrüfatı Nazirliyi, Baş Dövlət Texniki Nəzarət Müfəttişliyi və BDYP Rəsmi Reyestri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 pt-3 bg-slate-900/90 border-b border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'audit'
                ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Tractor className="w-4 h-4" />
            <span>Texnika & Diaqnostika</span>
          </button>

          <button
            onClick={() => setActiveTab('driver')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'driver'
                ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Sürücülük (A–F) & İmtahan</span>
          </button>

          <button
            onClick={() => setActiveTab('transit')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'transit'
                ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Sahəyə Çıxış & Şose Rejimi</span>
          </button>

          <button
            onClick={() => setActiveTab('subsidy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'subsidy'
                ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>EKTİS Subsidiya & Lizinq</span>
          </button>

          <button
            onClick={() => setActiveTab('centers')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'centers'
                ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Regional Müfəttişliklər</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'certificate'
                ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Qeydiyyat Şəhadətnaməsi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: AUDIT & CHECKLIST */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Preset Model Bar */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Kənd Təsərrüfatı və Meliorasiya Texnikası Modeli Seçin:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_TRACTOR_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedModelId === model.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Kat. {model.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{model.chassisType === 'crawler' ? 'Tırtıllı' : 'Təkərli'}</span>
                      </div>
                      <div className="text-xs font-bold truncate">{model.brand}</div>
                      <div className="text-[11px] text-slate-300 truncate">{model.model}</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-1">{model.enginePowerHp} a.g.</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & KPI Score Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl border ${
                      auditResult.isCompliant
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    }`}
                  >
                    <Gauge className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Texniki Baxış Balı</div>
                    <div className="text-2xl font-bold font-mono text-white">
                      {auditResult.score} / 100
                    </div>
                    <div className="text-xs text-slate-300">
                      {auditResult.isCompliant ? '✅ Texniki cəhətdən saz' : '⚠️ Bərpa tələb olunur'}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-400">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Standart Tələblər</div>
                    <div className="text-2xl font-bold font-mono text-white">
                      {auditResult.passedCount} / {auditResult.totalCount}
                    </div>
                    <div className="text-xs text-slate-300">10-bəndlik normativ</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl border ${
                      auditResult.fineAmountAzn > 0
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Cərimə Riski (İXM)</div>
                    <div className="text-2xl font-bold font-mono text-white">
                      {auditResult.fineAmountAzn} ₼
                    </div>
                    <div className="text-xs text-slate-300">
                      {auditResult.fineAmountAzn === 0 ? 'Sanksiya yoxdur' : 'İnzibati xəta'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 10-Point Technical Checklist */}
              <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    DAXA 10-Bəndlik Texniki Baxış və Təhlükəsizlik Auditi
                  </h3>
                  <span className="text-xs text-slate-400">İşarələyərək yoxlayın</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'chassisAndEngineMatch', label: 'Şassi və mühərrik nömrələrinin texniki pasportla eyniliyi', desc: 'Mühərrik və ramadakı zavod qəlibi silinməmiş və düzgündür' },
                    { key: 'hydraulicSystemIntegrity', label: 'Yüksək təzyiqli hidravlika və 3-nöqtəli aqreqat asqısı', desc: 'Sızma yoxdur, hidro-silindrlər və şlanqlar tam saz vəziyyətdədir' },
                    { key: 'steeringBrakeFunction', label: 'Sükan mexanizmi və qoşalaşmış əyləc pedalının şose kilidi', desc: 'Yolda hərəkət üçün pedalları birləşdirən mexaniki fiksator işləkdir' },
                    { key: 'emergencyBeaconLight', label: 'Sarı/narıncı yanıb-sönən xəbərdarlıq mayakı', desc: 'Kabina tavanında 360 dərəcə görünən sarı mayak çırağı' },
                    { key: 'slowMovingVehicleSign', label: 'Arxa əks-etdirici "Aşağı Sürətli Nəqliyyat" (SMV) üçbucağı', desc: 'UNECE R69 standartı üzrə ≤40 km/saat xəbərdarlıq nişanı' },
                    { key: 'lightingAndReflectors', label: 'Xarici işıq cihazları, qabarit və dönmə siqnalları', desc: 'Qaranlıqda və dumanlı havada görünmə üçün işıqlandırma' },
                    { key: 'cabinRolloverProtection', label: 'ROPS / FOPS sertifikatlı aşma və zərbəyə davamlı kabina', desc: 'Aşma zamanı mexanizatorun həyatını qoruyan təhlükəsizlik karkası' },
                    { key: 'fireExtinguisherAndFirstAid', label: 'OP-5 odsöndürən balon və kənd təsərrüfatı tibbi çantası', desc: 'FHN sertifikatlı odsöndürən və ilk tibbi yardım qutusu' },
                    { key: 'ptoShaftShield', label: 'Gücayıran valın (VOM / PTO) mühafizə qoruyucu örtüyü', desc: 'Fırlanan kardan karkasının plastik və ya metal zireh örtüyü' },
                    { key: 'exhaustSparkArrester', label: 'Səsboğucuda taxıl yanğınlarının qarşısını alan qığılcımsöndürən', desc: 'Quru zəmilərdə qığılcımların səpələnməsinin qarşısını alır' },
                  ].map((item) => {
                    const checked = checklist[item.key as keyof TractorTechnicalChecklist];
                    return (
                      <div
                        key={item.key}
                        onClick={() => toggleChecklist(item.key as keyof TractorTechnicalChecklist)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          checked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="mt-0.5">
                          {checked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{item.label}</div>
                          <div className="text-[11px] text-slate-400">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Dövlət Rüsumu: Qeydiyyat nişanı (20 ₼) + Texniki Pasport (15 ₼) + İllik Texniki Baxış (10 ₼) = <span className="font-bold text-emerald-400">45 AZN</span>
                </div>
                <button
                  onClick={handleIssueCertificate}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Rəsmi DAXA Qeydiyyat Şəhadətnaməsi Ver
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DRIVER LICENSING (A-F) & THEORY EXAM */}
          {activeTab === 'driver' && (
            <div className="space-y-6">
              {/* Category Matrix */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Traktorçu-Maşinist Vəsiqəsi Kateqoriyaları (YHQ Maddə 33)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(Object.keys(TRACTOR_CATEGORIES) as TractorCategory[]).map((catKey) => {
                    const cat = TRACTOR_CATEGORIES[catKey];
                    const isSelected = driverProfile.category === catKey;
                    return (
                      <div
                        key={catKey}
                        onClick={() => setDriverProfile((prev) => ({ ...prev, category: catKey }))}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                            Kateqoriya {cat.category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Yaş: {cat.minAge}+</span>
                        </div>
                        <div className="text-xs font-bold text-white mb-1">{cat.name}</div>
                        <div className="text-[11px] text-slate-300 mb-2">{cat.description}</div>
                        <div className="text-[10px] text-slate-400 italic truncate">Nümunə: {cat.sampleVehicles}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Driver Attestation Dossier */}
              <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Sürücü & Mexanizator Attestasiya Məlumatları
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      driverResult.isEligible
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {driverResult.isEligible ? 'Attestasiyadan Keçdi' : 'Çatışmazlıq Var'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Mexanizator S.A.A:</label>
                    <input
                      type="text"
                      value={driverProfile.fullName}
                      onChange={(e) => setDriverProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">FİN Kod:</label>
                    <input
                      type="text"
                      value={driverProfile.finCode}
                      onChange={(e) => setDriverProfile((prev) => ({ ...prev, finCode: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Mexanizatorun Yaşı:</label>
                    <input
                      type="number"
                      value={driverProfile.driverAge}
                      onChange={(e) => setDriverProfile((prev) => ({ ...prev, driverAge: Number(e.target.value) }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-700 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={driverProfile.medicalFitnessValid}
                      onChange={(e) => setDriverProfile((prev) => ({ ...prev, medicalFitnessValid: e.target.checked }))}
                      className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Forma AZS-083/e Tibbi Müayinə Qüvvədədir</div>
                      <div className="text-[11px] text-slate-400">Görmə və psixonevroloji rəqəmsal təsdiq</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-700 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={driverProfile.practicalTillageExamPassed}
                      onChange={(e) =>
                        setDriverProfile((prev) => ({ ...prev, practicalTillageExamPassed: e.target.checked }))
                      }
                      className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Praktiki Şum və Aqreqasiya İmtahanı</div>
                      <div className="text-[11px] text-slate-400">Poliqonda traktor idarəetmə və manevr testi</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 10-Question Theory Examination Simulator */}
              <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-400" />
                      DAXA Nəzəri İmtahan Simulyatoru (10 Sual)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Keçid balı: minimum 9/10 doğru cavab. Cari nəticə:{' '}
                      <span className="font-mono font-bold text-emerald-400">
                        {driverProfile.theoryExamScore} / 10
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowExamExplanations((prev) => !prev)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showExamExplanations ? 'İzahları Gizlə' : 'Hüquqi İzahları Göstər'}</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {MOCK_THEORY_QUESTIONS.map((q) => {
                    const selectedOpt = examAnswers[q.id];
                    const isCorrect = selectedOpt === q.correctIndex;
                    return (
                      <div key={q.id} className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-white flex items-start gap-2">
                          <span className="text-emerald-400 font-mono">#{q.id}</span>
                          <span>{q.question}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedOpt === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerSelect(q.id, optIdx)}
                                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                                  isChosen
                                    ? isCorrect
                                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-medium'
                                      : 'bg-rose-500/20 border-rose-500 text-white font-medium'
                                    : 'bg-slate-900/60 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <span className="font-mono text-slate-400 mr-1.5">
                                  {String.fromCharCode(65 + optIdx)})
                                </span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {showExamExplanations && (
                          <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-[11px] text-slate-300 space-y-0.5">
                            <div className="text-emerald-400 font-semibold">{q.legalBasis}</div>
                            <div>{q.explanation}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIELD TRANSIT & HIGHWAY ROAD SAFETY */}
          {activeTab === 'transit' && (
            <div className="space-y-6">
              {/* Transit Parameters Configurator */}
              <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Route className="w-4 h-4 text-emerald-400" />
                  Sahəyə Çıxış və Yol Hərəkəti Təhlükəsizliyi Şərtləri
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Texnika Tipi:</label>
                    <select
                      value={transitMachineryType}
                      onChange={(e) =>
                        setTransitMachineryType(e.target.value as 'wheeled' | 'crawler' | 'combine')
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="wheeled">Təkərli Traktor (MTZ / John Deere)</option>
                      <option value="crawler">Tırtıllı Traktor (DT-75 / Buldozer)</option>
                      <option value="combine">Taxılyığan / Pambıqyığan Kombayn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Hərəkət Marşrutu:</label>
                    <select
                      value={travelSurface}
                      onChange={(e) =>
                        setTravelSurface(e.target.value as 'asphalt_highway' | 'dirt_field_road')
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="asphalt_highway">Asfalt Örtüklü Dövlət Avtomobil Yolu</option>
                      <option value="dirt_field_road">Torpaq Zəmi & Sahələrarası Yol</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Planlaşdırılan Sürət (km/saat):</label>
                    <input
                      type="number"
                      value={plannedSpeedKmh}
                      onChange={(e) => setPlannedSpeedKmh(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Combine Header Specific Controls */}
                {transitMachineryType === 'combine' && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-amber-300">
                      Biçən Aqreqat ("Jatka") və Qabarit Ölçüləri:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Biçən Aqreqatın Eni: <span className="font-bold text-white">{cuttingWidthMeters} metr</span>
                        </label>
                        <input
                          type="range"
                          min={3.0}
                          max={9.0}
                          step={0.5}
                          value={cuttingWidthMeters}
                          onChange={(e) => setCuttingWidthMeters(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                          <input
                            type="checkbox"
                            checked={isHeaderAttachedToFront}
                            onChange={(e) => setIsHeaderAttachedToFront(e.target.checked)}
                            className="w-4 h-4 text-amber-500 rounded"
                          />
                          <span>Ön tərəfə qoşulu vəziyyətdə (sökülməyib)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Safety Signals & Escort Checks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-700 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAmberBeaconActive}
                      onChange={(e) => setHasAmberBeaconActive(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Sarı Yanıb-Sönən Mayak Aktivdir</div>
                      <div className="text-[11px] text-slate-400">360° xəbərdarlıq optik mayakı</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-700 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPilotEscortVehicle}
                      onChange={(e) => setHasPilotEscortVehicle(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Müşayiətçi Eskort Avtomobili Var</div>
                      <div className="text-[11px] text-slate-400">Öndə "Geniş Qabarit" xəbərdarlıqlı avtomobil</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Transit Evaluation Verdict */}
              <div
                className={`p-5 rounded-xl border space-y-3 ${
                  transitResult.isHighwayTransitPermitted
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-rose-500/10 border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {transitResult.isHighwayTransitPermitted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                    <h4 className="text-sm font-bold text-white">
                      {transitResult.isHighwayTransitPermitted
                        ? 'Yolda Hərəkətə İcazə Verilir'
                        : 'Yolda Hərəkət Qadağandır (İXM Pozuntusu)'}
                    </h4>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">
                    Maksimal Qanuni Sürət: {transitResult.maxLegalSpeedKmh} km/saat
                  </div>
                </div>

                {transitResult.restrictions.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-rose-400">Aşkar Edilən Qadağalar:</div>
                    <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                      {transitResult.restrictions.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {transitResult.mandatoryActions.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-xs font-semibold text-emerald-400">Məcburi Tədbirlər:</div>
                    <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                      {transitResult.mandatoryActions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {transitResult.fineRiskAzn > 0 && (
                  <div className="text-xs font-semibold text-rose-400 pt-1">
                    Potensial Cərimə Riski: {transitResult.fineRiskAzn} AZN
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EKTIS SUBSIDY & CONCESSIONAL LEASING */}
          {activeTab === 'subsidy' && (
            <div className="space-y-6">
              {/* Subsidy Input Parameters */}
              <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Aqrar Subsidiya Şurası & EKTİS Lizinq Şərtləri
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setActiveCurrency(curr)}
                        className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                          activeCurrency === curr
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Texnikanın Faktura Dəyəri (AZN):</label>
                    <input
                      type="number"
                      value={subsidyMachineryPrice}
                      onChange={(e) => setSubsidyMachineryPrice(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Kateqoriya:</label>
                    <select
                      value={subsidyCategory}
                      onChange={(e) => setSubsidyCategory(e.target.value as TractorCategory)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="A">Kateqoriya A (Kiçik təkərli)</option>
                      <option value="B">Kateqoriya B (Orta təkərli - MTZ)</option>
                      <option value="C">Kateqoriya C (Ağır kotan - John Deere)</option>
                      <option value="D">Kateqoriya D (Tırtıllı traktorlar)</option>
                      <option value="E">Kateqoriya E (Meliorasiya ekskavator)</option>
                      <option value="F">Kateqoriya F (Taxılyığan kombaynlar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Lizinq Müddəti (Ay):</label>
                    <select
                      value={leaseMonths}
                      onChange={(e) => setLeaseMonths(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                    >
                      <option value={36}>36 ay (3 il)</option>
                      <option value={48}>48 ay (4 il)</option>
                      <option value={60}>60 ay (5 il - Standart EKTİS)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1">
                  <div className="text-xs text-emerald-400 font-semibold">Dövlət Subsidiyası (40%)</div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {subsidyResult.formattedSubsidy}
                  </div>
                  <div className="text-[11px] text-slate-300">Geri qaytarılmayan dövlət qrantı</div>
                </div>

                <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-1">
                  <div className="text-xs text-blue-400 font-semibold">Fermer İlkin Ödənişi (20%)</div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {subsidyResult.formattedDownPayment}
                  </div>
                  <div className="text-[11px] text-slate-300">Təhvil zamanı ilkin mayə</div>
                </div>

                <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1">
                  <div className="text-xs text-amber-400 font-semibold">Aylıq Lizinq Ödənişi</div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {subsidyResult.formattedMonthly}
                  </div>
                  <div className="text-[11px] text-slate-300">{leaseMonths} ay ərzində (0% faiz)</div>
                </div>

                <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1">
                  <div className="text-xs text-purple-400 font-semibold">Ümumi Fermer Qənaəti</div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {subsidyResult.formattedSubsidy}
                  </div>
                  <div className="text-[11px] text-slate-300">AKİA dəstəyi ilə</div>
                </div>
              </div>

              {/* Concessional Explanation */}
              <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  "Aqroservis" ASC və EKTİS Şəffaflıq Mexanizmi:
                </div>
                <p>
                  Azərbaycan Respublikası Prezidentinin müvafiq fərmanı ilə təsdiq edilmiş Aqrar Subsidiya Qaydalarına əsasən,
                  lisenziyalı təchizatçılardan alınan bütün kənd təsərrüfatı texnikalarının dəyərinin 40%-i dövlət tərəfindən
                  birbaşa subsidiyalaşdırılır. Fermerlər qalan 40%-i 5 il müddətində heç bir illik faiz dərəcəsi olmadan (0% AKİA kompensasiyası) bərabər hissələrlə ödəyirlər.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: REGIONAL DAXA CENTERS */}
          {activeTab === 'centers' && (
            <div className="space-y-6">
              {/* Search & Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Regional Dövlət Aqrar Xidmətlər Agentliyi (DAXA) Müfəttişlikləri
                  </h3>
                  <p className="text-xs text-slate-400">Texniki baxış, qeydiyyat və traktorçu vəsiqəsi imtahan mərkəzləri</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Rayon və ya bölgə axtar..."
                    value={centerSearchQuery}
                    onChange={(e) => setCenterSearchQuery(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Centers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map((center) => {
                  const isSelected = selectedCenterId === center.id;
                  return (
                    <div
                      key={center.id}
                      onClick={() => setSelectedCenterId(center.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{center.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                          {center.region}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{center.address}</span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-mono">{center.phone}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[11px] text-slate-400">
                        <span>Baş Müfəttiş: {center.chiefInspector}</span>
                        <span className="font-mono">Tutum: {center.dailyCapacity} texnika/gün</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Slot Booking Section */}
              <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Texniki Baxış və Sənədləşmə Növbəsi Rezervasiyası
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {['09:30', '11:00', '14:00', '15:30', '16:30'].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlotTime(slot)}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                        selectedSlotTime === slot
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setBookingConfirmed(true);
                      setTimeout(() => setBookingConfirmed(false), 3000);
                    }}
                    className="ml-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{bookingConfirmed ? 'Növbə Təsdiqləndi!' : 'Növbə Rezerv Et'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL ELECTRONIC CERTIFICATE & UNIFIED REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Certificate Layout */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-900 to-emerald-950/30 border-2 border-emerald-500/40 rounded-2xl shadow-2xl space-y-6">
                {/* Header with Coat of Arms representation */}
                <div className="text-center space-y-1.5 border-b border-emerald-500/30 pb-4">
                  <div className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                    Azərbaycan Respublikası Kənd Təsərrüfatı Nazirliyi
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase">
                    Baş Dövlət Texniki Nəzarət Müfəttişliyi
                  </h3>
                  <div className="text-xs text-slate-300">
                    Kənd Təsərrüfatı və Meliorasiya Texnikasının Dövlət Qeydiyyatı Şəhadətnaməsi və Texniki Baxış Talonu
                  </div>
                </div>

                {/* Main Certificate Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Machine Plate & Identifiers */}
                  <div className="space-y-4">
                    {/* Authentic Azerbaijan Tractor License Plate Visualizer */}
                    <div>
                      <div className="text-xs text-slate-400 mb-1.5">Dövlət Qeydiyyat Nişanı (DQN):</div>
                      <div className="inline-block p-2.5 bg-white border-2 border-slate-900 rounded-lg shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center border-r-2 border-slate-300 pr-2">
                            <span className="text-[10px] font-black text-blue-800">AZ</span>
                            <div className="w-4 h-2.5 bg-gradient-to-b from-cyan-500 via-rose-500 to-emerald-500 rounded-xs mt-0.5" />
                          </div>
                          <div className="text-2xl font-black font-mono tracking-widest text-slate-950">
                            {activeCertificate.plateNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-slate-400">Şəhadətnamə Nömrəsi:</div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {activeCertificate.certificateNumber}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-slate-400">İllik Texniki Baxış Talonu:</div>
                      <div className="font-mono font-semibold text-white">
                        {activeCertificate.annualInspectionTalonNumber}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-slate-400">Texnika Kateqoriyası:</div>
                      <div className="font-bold text-white">
                        Kateqoriya {activeCertificate.category} ({TRACTOR_CATEGORIES[activeCertificate.category]?.name})
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Owner & Technical Parameters */}
                  <div className="space-y-4">
                    <div className="space-y-1 text-xs">
                      <div className="text-slate-400">Mülkiyyətçi / Təsərrüfat Subyekti:</div>
                      <div className="font-bold text-white text-sm">{activeCertificate.ownerName}</div>
                      <div className="text-slate-400 font-mono">{activeCertificate.ownerVoenOrFin}</div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-slate-400">Qeydiyyat Orqanı:</div>
                      <div className="text-slate-200">{activeCertificate.daxaDivisionName}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-slate-400">Şassi (Rama) №:</div>
                        <div className="font-mono font-semibold text-white truncate">
                          {activeCertificate.chassisNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Mühərrik №:</div>
                        <div className="font-mono font-semibold text-white truncate">
                          {activeCertificate.engineSerial}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-slate-400">Verilmə Tarixi:</div>
                        <div className="font-mono text-white">{activeCertificate.issueDate}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Növbəti Texniki Baxış:</div>
                        <div className="font-mono text-emerald-400 font-bold">
                          {activeCertificate.expiryDate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Checksum & QR Telemetry */}
                <div className="pt-4 border-t border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400">Təhlükəsizlik Kontrol İmzası (SHA256):</div>
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {activeCertificate.securityChecksum}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(activeCertificate.certificateNumber)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Kopyalandı' : 'Nömrəni Kopyala'}</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Public Unified Registry Lookup */}
              <div className="p-5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      DAXA Vahid Aqrotexnika İctimai Axtarış Reyestri
                    </h4>
                    <p className="text-xs text-slate-400">
                      Dövlət nömrə nişanı, şassi nömrəsi və ya şəhadətnamə kodu üzrə canlı axtarış
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="DQN və ya Şəhadətnamə №..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                        <th className="pb-2">Şəhadətnamə №</th>
                        <th className="pb-2">DQN</th>
                        <th className="pb-2">Kat.</th>
                        <th className="pb-2">Sahibkar / Təsərrüfat</th>
                        <th className="pb-2">Müfəttişlik</th>
                        <th className="pb-2">Növbəti Baxış</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredCertificates.map((cert) => (
                        <tr
                          key={cert.certificateNumber}
                          onClick={() => setActiveCertificate(cert)}
                          className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 font-mono text-emerald-400 font-semibold">
                            {cert.certificateNumber}
                          </td>
                          <td className="py-2.5 font-mono font-bold text-white">{cert.plateNumber}</td>
                          <td className="py-2.5 text-slate-300">Kat. {cert.category}</td>
                          <td className="py-2.5 text-slate-200">{cert.ownerName}</td>
                          <td className="py-2.5 text-slate-400">{cert.daxaDivisionName}</td>
                          <td className="py-2.5 font-mono text-slate-300">{cert.expiryDate}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Qüvvədədir
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
