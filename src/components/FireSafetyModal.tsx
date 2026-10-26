import React, { useState, useMemo } from 'react';
import {
  X,
  Flame,
  ShieldAlert,
  FireExtinguisher,
  Droplets,
  Gauge,
  Building,
  Clock,
  MapPin,
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  Copy,
  Sparkles,
  RotateCcw,
  Play,
  Square,
  Info,
  ChevronRight,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  VehicleFireCategory,
  ExtinguisherType,
  PassPhase,
  FireSafetyCertificate,
  getExtinguisherRequirement,
  calculateFireSafetyScore,
  evaluateExtinguisher,
  checkHydrantProximity,
  generateFireSafetyCertificate,
  formatAZN,
} from '../utils/fireSafetyCompliance';
import {
  FIRE_SAFETY_CHECKLIST_ITEMS,
  FIRE_STATIONS,
  FIRE_SAFETY_EXAM_QUESTIONS,
  VEHICLE_FIRE_PRESETS,
  SAMPLE_FIRE_CERTIFICATES,
  VehicleFirePreset,
} from '../data/mockFireSafetyData';

interface FireSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialVehicle?: Vehicle | null;
}

type TabType = 'audit' | 'extinguisher' | 'simulator' | 'hydrant' | 'stations' | 'exam' | 'certificate';

export const FireSafetyModal: React.FC<FireSafetyModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('audit');

  // Preset selector
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-m1-sedan');
  const currentPreset = useMemo<VehicleFirePreset>(() => {
    return (
      VEHICLE_FIRE_PRESETS.find((p) => p.id === selectedPresetId) ||
      VEHICLE_FIRE_PRESETS[0]
    );
  }, [selectedPresetId]);

  // Vehicle info state
  const [vehiclePlate, setVehiclePlate] = useState<string>(
    initialVehicle?.plateNumber || currentPreset.plateNumber
  );
  const [vehicleModel, setVehicleModel] = useState<string>(
    initialVehicle ? `${initialVehicle.make} ${initialVehicle.model}` : currentPreset.name
  );
  const [category, setCategory] = useState<VehicleFireCategory>(currentPreset.category);
  const [ownerName, setOwnerName] = useState<string>('Rəşad Nəzərov');
  const [ownerFin, setOwnerFin] = useState<string>('1ABC456');

  // Audit Checklist state
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([
    'fsi-extinguisher-spec',
    'fsi-extinguisher-bracket',
    'fsi-battery-insulation',
    'fsi-fuel-line-hermetic',
    'fsi-interior-flame-retardant',
    'fsi-escape-hammer',
    'fsi-warning-triangle-vest',
  ]);

  // Extinguisher test bench state
  const [extinguisherType, setExtinguisherType] = useState<ExtinguisherType>(
    currentPreset.extinguisherType
  );
  const [pressureBar, setPressureBar] = useState<number>(currentPreset.pressureBar);
  const [monthsSinceInspection, setMonthsSinceInspection] = useState<number>(
    currentPreset.monthsSinceInspection
  );
  const [extinguisherSerial, setExtinguisherSerial] = useState<string>('AZ-OP2-881942');

  // PASS Extinguisher Simulator state
  const [passPhase, setPassPhase] = useState<PassPhase>('pull');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [flameIntensity, setFlameIntensity] = useState<number>(100);
  const [simMessage, setSimMessage] = useState<string>(
    'PİNİ ÇƏKİN (Pull): Balonun qoruyucu plombunu qırıb qırmızı təhlükəsizlik pinini çıxarın.'
  );

  // Hydrant Proximity State
  const [hydrantDistanceMeters, setHydrantDistanceMeters] = useState<number>(6.5);

  // Fire Stations Radar State
  const [stationFilterCity, setStationFilterCity] = useState<string>('all');
  const [bookedStationId, setBookedStationId] = useState<string | null>(null);

  // Theoretical Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificate & Registry State
  const [certificatesList, setCertificatesList] = useState<FireSafetyCertificate[]>(
    SAMPLE_FIRE_CERTIFICATES
  );
  const [activeCertificate, setActiveCertificate] = useState<FireSafetyCertificate>(
    SAMPLE_FIRE_CERTIFICATES[0]
  );
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Calculate audit score
  const auditResult = useMemo(() => {
    return calculateFireSafetyScore(checkedItemIds, FIRE_SAFETY_CHECKLIST_ITEMS);
  }, [checkedItemIds]);

  // Extinguisher evaluation
  const extinguisherResult = useMemo(() => {
    return evaluateExtinguisher(monthsSinceInspection, pressureBar, category);
  }, [monthsSinceInspection, pressureBar, category]);

  // Hydrant evaluation
  const hydrantResult = useMemo(() => {
    return checkHydrantProximity(hydrantDistanceMeters);
  }, [hydrantDistanceMeters]);

  // Exam Score
  const examScore = useMemo(() => {
    let correct = 0;
    FIRE_SAFETY_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  }, [examAnswers]);

  if (!isOpen) return null;

  // Preset handler
  const handleSelectPreset = (preset: VehicleFirePreset) => {
    setSelectedPresetId(preset.id);
    setVehiclePlate(preset.plateNumber);
    setVehicleModel(preset.name);
    setCategory(preset.category);
    setExtinguisherType(preset.extinguisherType);
    setPressureBar(preset.pressureBar);
    setMonthsSinceInspection(preset.monthsSinceInspection);
  };

  // Checklist handlers
  const handleToggleCheckItem = (id: string) => {
    setCheckedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setCheckedItemIds(FIRE_SAFETY_CHECKLIST_ITEMS.map((i) => i.id));
  };

  const handleResetChecklist = () => {
    setCheckedItemIds([]);
  };

  // PASS Simulator actions
  const handleNextPassStep = () => {
    if (passPhase === 'pull') {
      setPassPhase('aim');
      setFlameIntensity(85);
      setSimMessage(
        'ALOVUN ƏSASINA TUŞLAYIN (Aim): Yanğınsöndürənin şlanqını alovun təpəsinə deyil, bilavasitə yanan səthin əsasına yönəldin.'
      );
    } else if (passPhase === 'aim') {
      setPassPhase('squeeze');
      setFlameIntensity(50);
      setSimMessage(
        'DƏSTƏYİ SIXIN (Squeeze): Yuxarı dəstəyi sıxaraq yüksək təzyiqli quru tozu fasiləsiz buraxın.'
      );
    } else if (passPhase === 'squeeze') {
      setPassPhase('sweep');
      setFlameIntensity(15);
      setSimMessage(
        'YANA DOĞRU SÜPÜRÜN (Sweep): Ucluğu soldan sağa ritmik hərəkət etdirərək alovun bütün sahəsini örtün.'
      );
    } else if (passPhase === 'sweep') {
      setPassPhase('extinguished');
      setFlameIntensity(0);
      setSimMessage(
        'TƏBRİKLƏR! Yanğın tam söndürüldü. Mühərriki söndürülmüş vəziyyətdə saxlayın və təkrar alışmanın qarşısını almaq üçün nəzarət edin.'
      );
    }
  };

  const handleResetPassSimulator = () => {
    setPassPhase('pull');
    setFlameIntensity(100);
    setIsSimulating(false);
    setSimMessage(
      'PİNİ ÇƏKİN (Pull): Balonun qoruyucu plombunu qırıb qırmızı təhlükəsizlik pinini çıxarın.'
    );
  };

  // Exam handlers
  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    if (isExamSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setIsExamSubmitted(false);
  };

  // Station booking
  const handleBookStation = (stationId: string) => {
    setBookedStationId(stationId);
    setTimeout(() => {
      setBookedStationId(null);
    }, 4000);
  };

  // Generate Certificate
  const handleIssueCertificate = () => {
    const station = FIRE_STATIONS[0];
    const newCert = generateFireSafetyCertificate({
      vehiclePlate,
      vehicleModel,
      ownerName,
      ownerFin,
      category,
      extinguisherType,
      extinguisherSerial,
      cylinderWeightKg: getExtinguisherRequirement(category).minTotalCapacityKg,
      pressureBar,
      score: auditResult.percentage,
      stationId: station.id,
      stationName: station.name,
      inspectorName: station.chiefOfficer,
      inspectorBadge: 'FHN-DYNX-0914',
    });

    setCertificatesList((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  // Copy handler
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} kopyalandı!`);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Filtered stations
  const filteredStations = useMemo(() => {
    if (stationFilterCity === 'all') return FIRE_STATIONS;
    return FIRE_STATIONS.filter((s) => s.city.toLowerCase().includes(stationFilterCity.toLowerCase()));
  }, [stationFilterCity]);

  // Filtered certificates
  const filteredCertificates = useMemo(() => {
    if (!registrySearch.trim()) return certificatesList;
    const query = registrySearch.toLowerCase().trim();
    return certificatesList.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(query) ||
        c.vehiclePlate.toLowerCase().includes(query) ||
        c.ownerFin.toLowerCase().includes(query) ||
        c.ownerName.toLowerCase().includes(query)
    );
  }, [certificatesList, registrySearch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl my-auto bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/40 text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-red-500/20 bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Fövqəladə Hallar Nazirliyi (FHN) & DYNX Yanğın Təhlükəsizlik Portalı
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-500/20 border border-red-500/30 text-red-300 rounded-full">
                  112 Xilasetmə
                </span>
              </div>
              <p className="text-xs text-slate-400">
                "Yanğın təhlükəsizliyi haqqında" AR Qanunu № 313-IQ & YHQ Əlavə 1 Bənd 7.7
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
        <div className="px-6 border-b border-slate-800 bg-slate-950/60 flex space-x-2 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'audit'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>10-Bəndlik Təhlükəsizlik Sınağı</span>
          </button>
          <button
            onClick={() => setActiveTab('extinguisher')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'extinguisher'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FireExtinguisher className="w-4 h-4" />
            <span>Yanğınsöndürən & Manometr Stendi</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'simulator'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>PASS Yanğınsöndürmə Simulyatoru</span>
          </button>
          <button
            onClick={() => setActiveTab('hydrant')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'hydrant'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Yanğın Hidrantı 5m Qorunma Zonası</span>
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'stations'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>FHN Regional Mərkəzləri Radarı</span>
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'exam'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>10-Suallıq FHN İmtahanı</span>
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'certificate'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>FHN-DYNX-2026 Sertifikatı</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Preset Selector Bar */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Nümunə Nəqliyyat Presetləri:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_FIRE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedPresetId === p.id
                      ? 'bg-red-600/30 border-red-500 text-red-200'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {p.name} ({p.plateNumber})
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: 10-Point Audit Checklist */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-950 border border-red-500/30 rounded-xl">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>Avtomobilin Yanğın Təhlükəsizlik İmtahanı & Sertifikatlaşdırma Sınağı</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Dövlət Yanğın Nəzarəti Xidmətinin 10 əsas texniki kriteriyası üzrə audit.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-red-400">
                      {auditResult.percentage}%
                    </div>
                    <div className="text-xs text-slate-400">
                      {auditResult.score} / {auditResult.maxScore} bal
                    </div>
                  </div>
                  <div
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${
                      auditResult.isCertified
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {auditResult.isCertified ? 'SERTİFİKATLAŞDIRILIR' : 'QÜSUR VAR'}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      auditResult.percentage >= 85
                        ? 'bg-emerald-500'
                        : auditResult.percentage >= 65
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${auditResult.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>0% (İstismara qadağa)</span>
                  <span>Keçid balı: 85% (1-ci Dərəcə Sertifikat)</span>
                  <span>100% (Mükəmməl)</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Status: <span className="font-semibold text-slate-200">{auditResult.gradeLabel}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FIRE_SAFETY_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checkedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheckItem(item.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-slate-900 border-red-500/40 shadow-sm shadow-red-950/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`mt-0.5 p-1 rounded-md border ${
                            isChecked
                              ? 'bg-red-500/20 border-red-500 text-red-400'
                              : 'bg-slate-800 border-slate-700 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-200">
                              {item.title}
                            </span>
                            <span className="text-xs font-bold text-amber-400">
                              +{item.points} bal
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{item.description}</p>
                          <div className="text-[11px] font-mono text-red-400/80">
                            {item.legalRef}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Issue certificate CTA */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Sertifikat Tərtibatına Hazırdır?
                  </h4>
                  <p className="text-xs text-slate-400">
                    Audit nəticəsi əsasında rəsmi elektron FHN-DYNX-2026 şəhadətnaməsi generasiya edin.
                  </p>
                </div>
                <button
                  onClick={handleIssueCertificate}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Şəhadətnamə Tərtib Et</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Extinguisher Test Bench */}
          {activeTab === 'extinguisher' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Column */}
                <div className="space-y-4 p-5 bg-slate-950 border border-slate-800 rounded-xl">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FireExtinguisher className="w-4 h-4 text-red-400" />
                    <span>Balon və Nəqliyyat Parametrləri</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Nəqliyyat Kateqoriyası
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VehicleFireCategory)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-red-500 focus:outline-none"
                    >
                      <option value="m1_passenger">M1 Minik Avtomobili (Sedan, Kupe, SUV)</option>
                      <option value="m2_minibus">M2 Mikroavtobus (≤5 ton)</option>
                      <option value="m3_bus">M3 Böyük Sərnişin Avtobusu (&gt;5 ton)</option>
                      <option value="n1_light_truck">N1 Yüngül Yük Maşını (Pikap/Furqon)</option>
                      <option value="n2_n3_heavy_truck">N2/N3 Ağır TIR və Özüboşaldan</option>
                      <option value="adr_tanker">ADR Yanacaq Sisterni (Təhlükəli Yük)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Qeydiyyat Nişanı
                    </label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Balonun Seriya Nömrəsi
                    </label>
                    <input
                      type="text"
                      value={extinguisherSerial}
                      onChange={(e) => setExtinguisherSerial(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Requirements Card */}
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-300">Qanuni Standart Tələbi:</div>
                    <div className="text-slate-400">{getExtinguisherRequirement(category).description}</div>
                    <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-400">
                      <span>Tələb olunan tutum:</span>
                      <span className="font-bold text-amber-400">
                        {getExtinguisherRequirement(category).minTotalCapacityKg} kq ({getExtinguisherRequirement(category).typeLabel})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gauge & Pressure Stand */}
                <div className="space-y-4 p-5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      <span>Manometr və Daxili Təzyiq Sınağı</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Standart işçi təzyiq: 1.2 – 1.5 MPa (Yaşıl sektor).
                    </p>
                  </div>

                  {/* Visual Gauge Representation */}
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-3">
                    <div className="text-3xl font-black font-mono tracking-tight text-white">
                      {pressureBar.toFixed(2)} MPa
                    </div>
                    {/* Gauge bar */}
                    <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="w-[30%] bg-red-600/70" title="Aşağı təzyiq (Boşalmış)" />
                      <div className="w-[45%] bg-emerald-500" title="Normal işçi zonası" />
                      <div className="w-[25%] bg-red-600/70" title="Artıq təzyiq" />
                      {/* Gauge Indicator Needle */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-md shadow-black transition-all"
                        style={{
                          left: `${Math.min(100, Math.max(0, ((pressureBar - 0.5) / 1.5) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span className="text-red-400">0.5 MPa (Boş)</span>
                      <span className="text-emerald-400">1.2 - 1.5 MPa (Normal)</span>
                      <span className="text-red-400">2.0 MPa (Təhlükəli)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Manometr Təzyiq Tənzimi:</span>
                      <span className="font-mono font-bold text-slate-200">{pressureBar.toFixed(2)} MPa</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={pressureBar}
                      onChange={(e) => setPressureBar(parseFloat(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Son Yoxlamadan Keçən Müddət:</span>
                      <span className="font-bold text-slate-200">{monthsSinceInspection} ay</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      value={monthsSinceInspection}
                      onChange={(e) => setMonthsSinceInspection(parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>Yeni yoxlanıb (0 ay)</span>
                      <span>İllik hədd (12 ay)</span>
                      <span>Gecikmiş (24 ay)</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry & Fine Risk Result */}
                <div className="space-y-4 p-5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Rəsmi DYNX Nəticəsi & İnzibati Məsuliyyət</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      İXM Maddə 342.1 üzrə DYP yol patrul sanksiyası riski.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      extinguisherResult.isValid
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/20 border-red-500/40 text-red-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      {extinguisherResult.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span>{extinguisherResult.statusLabel}</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {extinguisherResult.isValid
                        ? `Balon istismara tam yararlıdır. Növbəti yoxlamaya təxminən ${extinguisherResult.daysUntilExpiry} gün qalır.`
                        : 'Balon texniki tələblərə cavab vermir. Dərhal FHN sertifikatlı məntəqədə təkrar doldurulmalı və ya dəyişdirilməlidir.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>DYP Cərimə Riski (İXM 342.1):</span>
                      <span
                        className={`font-bold ${
                          extinguisherResult.fineRiskAZN > 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {formatAZN(extinguisherResult.fineRiskAZN, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>DYNX İllik Təftiş & Doldurma:</span>
                      <span className="font-bold text-slate-200">
                        {formatAZN(extinguisherResult.inspectionFeeAZN, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Manometr vəziyyəti:</span>
                      <span className="font-semibold text-slate-200 uppercase">
                        {extinguisherResult.pressureStatus}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('stations')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Building className="w-4 h-4 text-amber-400" />
                    <span>Doldurma Mərkəzi Seç</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PASS Simulator */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 border border-red-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  <span>Beynəlxalq PASS Prinsipi üzrə Yanğınsöndürmə Təlimatı</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  P - Pull (Pini çək), A - Aim (Alovun əsasına yönəlt), S - Squeeze (Qolu sıx), S - Sweep (Yana doğru süpür).
                </p>
              </div>

              {/* Interactive Flame & Extinguisher Arena */}
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-6 min-h-[300px]">
                {/* Visual Flame Graphic */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`transition-all duration-700 flex items-center justify-center ${
                      flameIntensity === 0
                        ? 'opacity-0 scale-50'
                        : flameIntensity < 30
                        ? 'opacity-60 scale-75 text-amber-500'
                        : flameIntensity < 70
                        ? 'opacity-80 scale-100 text-orange-500 animate-pulse'
                        : 'opacity-100 scale-125 text-red-500 animate-bounce'
                    }`}
                  >
                    <Flame className="w-24 h-24 drop-shadow-[0_0_35px_rgba(239,68,68,0.8)]" />
                  </div>
                  {flameIntensity === 0 && (
                    <div className="text-center space-y-2">
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-full inline-block">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <div className="text-lg font-bold text-emerald-300">
                        YANĞIN TAM SÖNDÜRÜLDÜ!
                      </div>
                    </div>
                  )}
                </div>

                {/* Flame Intensity Indicator */}
                <div className="w-full max-w-md space-y-1 text-center">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Alovun İntensivliyi:</span>
                    <span className="font-mono font-bold text-red-400">{flameIntensity}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-500"
                      style={{ width: `${flameIntensity}%` }}
                    />
                  </div>
                </div>

                {/* Simulation Step Instructions Box */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-lg text-center space-y-2">
                  <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Addım: {passPhase.toUpperCase()}
                  </div>
                  <p className="text-sm text-slate-200">{simMessage}</p>
                </div>

                {/* Interactive Action Controls */}
                <div className="flex items-center space-x-3">
                  {passPhase !== 'extinguished' ? (
                    <button
                      onClick={handleNextPassStep}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-all transform hover:scale-105"
                    >
                      <Play className="w-4 h-4" />
                      <span>
                        {passPhase === 'pull' && '1. Pini Çıxar (Pull)'}
                        {passPhase === 'aim' && '2. Əsasa Tuşla (Aim)'}
                        {passPhase === 'squeeze' && '3. Qolu Sıx (Squeeze)'}
                        {passPhase === 'sweep' && '4. Yana Süpür (Sweep)'}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={handleResetPassSimulator}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Yenidən Başla</span>
                    </button>
                  )}
                  <button
                    onClick={handleResetPassSimulator}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                    title="Simulyatoru sıfırla"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Hydrant Proximity */}
          {activeTab === 'hydrant' && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span>Yanğın Hidrantı və Su Mənbələri Ətrafında Qanuni Parklanma Normativi</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Yol Hərəkəti Qaydaları Maddə 52: Yanğın hidrantına 5 metrdən az məsafədə dayanmaq və durmaq qəti qadağandır.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distance Slider Card */}
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-white">Məsafə Tənzimləyicisi</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Avtomobilin ən yaxın yanğın hidrantına olan məsafəsini seçin.
                    </p>
                  </div>

                  <div className="text-center py-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="text-4xl font-black font-mono text-white">
                      {hydrantDistanceMeters.toFixed(1)} m
                    </div>
                    <div className="text-xs text-slate-400">
                      Minimum tələb: <span className="font-bold text-emerald-400">5.0 metr</span>
                    </div>
                  </div>

                  <div>
                    <input
                      type="range"
                      min="0.5"
                      max="15.0"
                      step="0.1"
                      value={hydrantDistanceMeters}
                      onChange={(e) => setHydrantDistanceMeters(parseFloat(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>0.5 m (Qadağan)</span>
                      <span className="font-bold text-blue-400">5.0 m Sərhəddi</span>
                      <span>15.0 m (Tam sərbəst)</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-2 text-slate-300">
                    <div className="font-semibold text-white">Qanunvericilik Əsası:</div>
                    <p>
                      Yanğın zamanı FHN xilasetmə briqadasının magistral şlanqı qoşması üçün hidrantın ətrafı daimi açıq olmalıdır.
                      Maneə törədən avtomobillər DYP tərəfindən dərhal cərimə meydançasına evakuasiya edilir.
                    </p>
                  </div>
                </div>

                {/* Legal Audit & Penalty Card */}
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">İnzibati Xətalar Məcəlləsi Qiymətləndirməsi</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      İXM Maddə 346 & Maddə 96 üzrə sanksiya statusu.
                    </p>
                  </div>

                  <div
                    className={`p-5 rounded-xl border space-y-3 ${
                      hydrantResult.isCompliant
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/20 border-red-500/40 text-red-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      {hydrantResult.isCompliant ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span>
                        {hydrantResult.isCompliant ? 'QANUNİ PARKLANMA' : 'QADAĞAN OLUNMUŞ ZONA!'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{hydrantResult.warningMessage}</p>
                  </div>

                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Cərimə Məbləği (İXM 346):</span>
                      <span
                        className={`font-bold ${
                          hydrantResult.fineAZN > 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {formatAZN(hydrantResult.fineAZN, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Məcburi Evakuasiya (İXM 96):</span>
                      <span
                        className={`font-bold ${
                          hydrantResult.towingRisk ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {hydrantResult.towingRisk ? 'Bəli (Dərhal Evakuasiya)' : 'Xeyr'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Hüquqi İstinad:</span>
                      <span className="font-mono text-slate-200">{hydrantResult.legalRef}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Regional Stations Radar */}
          {activeTab === 'stations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-950 border border-red-500/30 rounded-xl">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Building className="w-5 h-5 text-red-400" />
                    <span>FHN & DYNX Sertifikatlaşdırma və Yanğından Mühafizə Hissələri</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Avtomobil yanğınsöndürənlərinin təkrar doldurulması və illik yoxlama mərkəzləri.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Şəhər Filteri:</span>
                  <select
                    value={stationFilterCity}
                    onChange={(e) => setStationFilterCity(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="all">Bütün Regionlar</option>
                    <option value="Bakı">Bakı</option>
                    <option value="Sumqayıt">Sumqayıt</option>
                    <option value="Gəncə">Gəncə</option>
                    <option value="Şirvan">Şirvan</option>
                  </select>
                </div>
              </div>

              {/* Stations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((station) => (
                  <div
                    key={station.id}
                    className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between hover:border-red-500/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600/20 text-red-300 border border-red-500/30 rounded-md">
                          {station.city}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-amber-400 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>~{station.averageResponseMinutes} dəq çıxış</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white">{station.name}</h4>
                      <p className="text-xs text-slate-400">{station.division}</p>

                      <div className="space-y-1 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{station.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{station.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="text-red-400 font-bold">Qaynar Xətt: {station.hotline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        Növbətçi: <span className="text-slate-200 font-medium">{station.chiefOfficer}</span>
                      </div>
                      <button
                        onClick={() => handleBookStation(station.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          bookedStationId === station.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40'
                        }`}
                      >
                        {bookedStationId === station.id ? 'Növbə Alındı!' : 'Növbə Al'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Theoretical Exam */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-950 border border-red-500/30 rounded-xl">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>FHN & BDYP Avtomobil Yanğın Təhlükəsizliyi Nəzəri İmtahanı</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    10 sual üzrə test imtahanı. Keçid balı: ən azı 8 düzgün cavab (80%).
                  </p>
                </div>
                {isExamSubmitted && (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-2xl font-black text-amber-400">{examScore} / 10</div>
                      <div className="text-xs text-slate-400">Düzgün Cavab</div>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        examScore >= 8
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-red-500/20 border-red-500 text-red-300'
                      }`}
                    >
                      {examScore >= 8 ? 'İMTAHANDAN KEÇDİ' : 'KƏSİLDİ'}
                    </div>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {FIRE_SAFETY_EXAM_QUESTIONS.map((q, idx) => {
                  const userAnswer = examAnswers[q.id];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = userAnswer === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-white">
                          {idx + 1}. {q.question}
                        </span>
                        {isExamSubmitted && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {isCorrect ? 'DÜZGÜN' : 'SƏHV'}
                          </span>
                        )}
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (isExamSubmitted) {
                            if (optIdx === q.correctAnswer) {
                              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-red-950/40 border-red-500 text-red-300 font-semibold';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-red-600/30 border-red-500 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isExamSubmitted}
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`p-3 rounded-lg text-left text-xs border transition-all ${btnStyle}`}
                            >
                              <span className="font-mono text-slate-500 mr-2">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {isExamSubmitted && (
                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs space-y-1">
                          <div className="font-semibold text-amber-400">İzah:</div>
                          <p className="text-slate-300">{q.explanation}</p>
                          <div className="text-[11px] font-mono text-slate-500">
                            Qanunvericilik: {q.legalBasis}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit or Reset Exam */}
              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400">
                  Cavablandırılıb: {Object.keys(examAnswers).length} / {FIRE_SAFETY_EXAM_QUESTIONS.length}
                </div>
                <div className="flex space-x-3">
                  {!isExamSubmitted ? (
                    <button
                      onClick={() => setIsExamSubmitted(true)}
                      disabled={Object.keys(examAnswers).length === 0}
                      className="px-5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/30 transition-all"
                    >
                      İmtahanı Tamamla
                    </button>
                  ) : (
                    <button
                      onClick={handleResetExam}
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Yenidən İmtahan Ver</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Official Certificate & Registry */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Certificate Visual Card */}
              <div className="p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-red-500/40 rounded-2xl shadow-2xl relative space-y-6 overflow-hidden">
                {/* Decorative Background Stamp */}
                <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                  <Flame className="w-96 h-96 text-red-500" />
                </div>

                {/* Certificate Header */}
                <div className="border-b-2 border-red-500/30 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-red-400 uppercase tracking-widest">
                      Azərbaycan Respublikası Fövqəladə Hallar Nazirliyi
                    </div>
                    <h3 className="text-xl font-black text-white tracking-wide">
                      DÖVLƏT YANĞIN NƏZARƏTİ XİDMƏTİ (DYNX)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Nəqliyyat Vasitəsinin Yanğın Təhlükəsizliyi və Yanğınsöndürmə Təchizatı Şəhadətnaməsi
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-400">Şəhadətnamə №:</div>
                    <div className="text-lg font-black font-mono text-amber-400">
                      {activeCertificate.certificateNumber}
                    </div>
                  </div>
                </div>

                {/* Certificate Core Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">Qeydiyyat Nişanı:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {activeCertificate.vehiclePlate}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">Avtomobil Modeli:</span>
                    <span className="font-bold text-white text-sm truncate block">
                      {activeCertificate.vehicleModel}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">Sahibi / FİN:</span>
                    <span className="font-bold text-white text-sm truncate block">
                      {activeCertificate.ownerName} ({activeCertificate.ownerFin})
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">Yanğınsöndürən Balon:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      {activeCertificate.cylinderWeightKg} kq ({activeCertificate.extinguisherSerial})
                    </span>
                  </div>
                </div>

                {/* Score & Audit Conclusions */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Audit Qiymətləndirməsi & Dərəcə:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {activeCertificate.score}% — {activeCertificate.gradeLabel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Yoxlama və Etibarlılıq Tarixi:</span>
                    <span className="font-mono text-slate-200">
                      {activeCertificate.issueDate} — {activeCertificate.expiryDate} (12 ay)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Yoxlayan Müfəttiş & Mərkəz:</span>
                    <span className="text-slate-200 font-medium">
                      {activeCertificate.inspectorName} ({activeCertificate.inspectorBadge}) — {activeCertificate.stationName}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Signatures & Telemetry */}
                <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono text-slate-400">
                  <div className="space-y-1">
                    <div>
                      Şifrlənmiş Heş: <span className="text-slate-500">{activeCertificate.sha256Checksum}</span>
                    </div>
                    <div>
                      SİMA İmza İdentifikatoru:{' '}
                      <span className="text-emerald-400 font-semibold">
                        {activeCertificate.simaSignatureUid}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-md text-[11px] font-bold uppercase">
                      Verifikasiya Təsdiqlənib
                    </span>
                  </div>
                </div>

                {/* Certificate Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() =>
                      handleCopyText(
                        `${activeCertificate.certificateNumber} | ${activeCertificate.vehiclePlate} | ${activeCertificate.sha256Checksum}`,
                        'Sertifikat nömrəsi'
                      )
                    }
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Məlumatları Kopyala</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-red-600/30 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {copyFeedback && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl text-center font-semibold">
                  {copyFeedback}
                </div>
              )}

              {/* Public Registry Search & History */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      DYNX Vahid İctimai Yanğın Şəhadətnamələri Reyestri
                    </h4>
                    <p className="text-xs text-slate-400">
                      Qeydiyyat nişanı, FİN və ya şəhadətnamə nömrəsi ilə axtarış aparın.
                    </p>
                  </div>
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Qeydiyyat nömrəsi və ya nömrə nişanı..."
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-red-500 focus:outline-none w-full sm:w-64"
                  />
                </div>

                <div className="space-y-2">
                  {filteredCertificates.map((cert) => (
                    <div
                      key={cert.certificateNumber}
                      onClick={() => setActiveCertificate(cert)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        activeCertificate.certificateNumber === cert.certificateNumber
                          ? 'bg-slate-900 border-red-500/50 shadow-sm'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-amber-400">
                            {cert.certificateNumber}
                          </span>
                          <span className="font-mono font-bold text-white px-2 py-0.5 bg-slate-800 rounded">
                            {cert.vehiclePlate}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          {cert.vehicleModel} — {cert.ownerName}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="font-semibold text-emerald-400">{cert.gradeLabel}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Etibarlıdır: {cert.expiryDate}
                        </div>
                      </div>
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
