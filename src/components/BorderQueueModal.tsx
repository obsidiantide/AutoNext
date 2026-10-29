import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Copy,
  Printer,
  Search,
  Fingerprint,
  UserCheck,
  FileText,
  MapPin,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import {
  Currency,
  BorderCheckpointId,
  CommercialVehicleCategory,
  CargoPriorityTier,
  BorderCheckpointInfo,
  COMMERCIAL_VEHICLE_INFO,
  CARGO_PRIORITY_INFO,
  evaluateCheckpointBuffer,
  calculateQueueBooking,
  verifyBiometricEGate,
  issueBorderQueueVoucher,
  BorderQueueVoucher,
  formatCurrency,
} from '../utils/borderQueueCompliance';
import {
  MOCK_BORDER_CHECKPOINTS,
  MOCK_COMMERCIAL_PRESETS,
  MOCK_BORDER_SECURITY_CHECKLIST,
  MOCK_BORDER_LAW_EXAM,
  MOCK_BORDER_QUEUE_REGISTRY,
} from '../data/mockBorderQueueData';
import { Vehicle } from '../types/vehicle';

interface BorderQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

type TabType = 'radar' | 'booking' | 'egate' | 'checklist' | 'exam' | 'voucher' | 'registry';

export const BorderQueueModal: React.FC<BorderQueueModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Selected Checkpoint
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<BorderCheckpointId>('BCP_SAMUR');
  const [searchCheckpoint, setSearchCheckpoint] = useState('');

  // Queue Booking Form State
  const [vehiclePlate, setVehiclePlate] = useState(targetCar?.plateNumber || '99-BQ-101');
  const [vehicleCategory, setVehicleCategory] = useState<CommercialVehicleCategory>('REFRIGERATED_TRUCK');
  const [priorityTier, setPriorityTier] = useState<CargoPriorityTier>('GREEN_LANE');
  const [carrierCompanyName, setCarrierCompanyName] = useState('AzAgro Trans Beynəlxalq Loqistika MMC');
  const [driverFullName, setDriverFullName] = useState('Qasımov İlqar Mehman oğlu');
  const [driverFin, setDriverFin] = useState('5A10988');
  const [isNightSlot, setIsNightSlot] = useState(false);

  // Biometric e-Gate State
  const [facialScore, setFacialScore] = useState(94);
  const [fingerprintScore, setFingerprintScore] = useState(96);
  const [licenseVerified, setLicenseVerified] = useState(true);
  const [visaValid, setVisaValid] = useState(true);
  const [breathalyzerPromille, setBreathalyzerPromille] = useState(0.00);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    CHK_BORDER_01: true,
    CHK_BORDER_02: true,
    CHK_BORDER_03: true,
    CHK_BORDER_05: true,
    CHK_BORDER_07: true,
    CHK_BORDER_08: true,
    CHK_BORDER_09: true,
  });

  // Exam State
  const [userExamAnswers, setUserExamAnswers] = useState<Record<number, number>>({});
  const [showExamResults, setShowExamResults] = useState(false);

  // Generated Voucher & Registry
  const [currentVoucher, setCurrentVoucher] = useState<BorderQueueVoucher | null>(null);
  const [registryList, setRegistryList] = useState<BorderQueueVoucher[]>(MOCK_BORDER_QUEUE_REGISTRY);
  const [registrySearch, setRegistrySearch] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Active checkpoint object
  const activeCheckpoint = useMemo(() => {
    return (
      MOCK_BORDER_CHECKPOINTS.find((c) => c.id === selectedCheckpointId) ||
      MOCK_BORDER_CHECKPOINTS[0]
    );
  }, [selectedCheckpointId]);

  // Buffer evaluation for active checkpoint
  const bufferEvaluation = useMemo(() => {
    return evaluateCheckpointBuffer(activeCheckpoint);
  }, [activeCheckpoint]);

  // Biometric e-Gate verification status
  const biometricVerification = useMemo(() => {
    return verifyBiometricEGate(
      facialScore,
      fingerprintScore,
      licenseVerified,
      visaValid,
      breathalyzerPromille
    );
  }, [facialScore, fingerprintScore, licenseVerified, visaValid, breathalyzerPromille]);

  // Booking Calculation
  const bookingCalculation = useMemo(() => {
    return calculateQueueBooking({
      checkpoint: activeCheckpoint,
      vehicleCategory,
      priorityTier,
      isNightSlot,
      driverEGateCleared: biometricVerification.isCleared,
      currency,
    });
  }, [activeCheckpoint, vehicleCategory, priorityTier, isNightSlot, biometricVerification.isCleared, currency]);

  // Handle Preset application
  const handleApplyPreset = (presetId: string) => {
    const preset = MOCK_COMMERCIAL_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setVehiclePlate(preset.vehiclePlate);
    setVehicleCategory(preset.vehicleCategory);
    setPriorityTier(preset.priorityTier);
    setCarrierCompanyName(preset.carrierName);
    setDriverFullName(preset.driverFullName);
    setDriverFin(preset.driverFin);
    setSelectedCheckpointId(preset.targetCheckpointId as BorderCheckpointId);
    setIsNightSlot(preset.isNightSlot);
  };

  // Handle Issue Voucher
  const handleIssueVoucher = () => {
    const newVoucher = issueBorderQueueVoucher(
      activeCheckpoint,
      vehiclePlate,
      vehicleCategory,
      priorityTier,
      carrierCompanyName,
      driverFullName,
      driverFin,
      bookingCalculation
    );
    setCurrentVoucher(newVoucher);
    setRegistryList([newVoucher, ...registryList]);
    setActiveTab('voucher');
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopyFeedback(`${label} kopyalandı!`);
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // Filtered checkpoints
  const filteredCheckpoints = useMemo(() => {
    if (!searchCheckpoint.trim()) return MOCK_BORDER_CHECKPOINTS;
    const q = searchCheckpoint.toLowerCase();
    return MOCK_BORDER_CHECKPOINTS.filter(
      (c) =>
        c.nameAz.toLowerCase().includes(q) ||
        c.neighborCountry.toLowerCase().includes(q) ||
        c.highwayCorridor.toLowerCase().includes(q)
    );
  }, [searchCheckpoint]);

  // Filtered Registry
  const filteredRegistry = useMemo(() => {
    if (!registrySearch.trim()) return registryList;
    const q = registrySearch.toLowerCase();
    return registryList.filter(
      (v) =>
        v.voucherNumber.toLowerCase().includes(q) ||
        v.queueTicketNumber.toLowerCase().includes(q) ||
        v.vehiclePlate.toLowerCase().includes(q) ||
        v.carrierCompanyName.toLowerCase().includes(q) ||
        v.driverFullName.toLowerCase().includes(q)
    );
  }, [registryList, registrySearch]);

  // Checklist score
  const checklistScore = useMemo(() => {
    const total = MOCK_BORDER_SECURITY_CHECKLIST.length;
    const checked = MOCK_BORDER_SECURITY_CHECKLIST.filter((item) => checkedItems[item.id]).length;
    return Math.round((checked / total) * 100);
  }, [checkedItems]);

  // Exam Score
  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_BORDER_LAW_EXAM.forEach((q) => {
      if (userExamAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    return {
      correctCount: correct,
      totalCount: MOCK_BORDER_LAW_EXAM.length,
      percentage: Math.round((correct / MOCK_BORDER_LAW_EXAM.length) * 100),
      passed: correct >= 8, // 8/10 passing score
    };
  }, [userExamAnswers]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="border-queue-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
    >
      <div
        data-testid="border-queue-modal-container"
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-slate-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-6 py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Dövlət Sərhəd Buraxılış Məntəqəsi Elektron Növbə Portalı
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-medium">
                  DSX • DGK • BDYP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rəsmi Beynəlxalq Yük Daşımaları Sərhədkeçmə Növbəsi, Biometrik e-Gate & Smart Frontier Telemetriyası
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-1 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    currency === cur
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              data-testid="border-queue-close-btn"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2 flex flex-wrap gap-2 overflow-x-auto">
          {[
            { id: 'radar', label: '1. SBM Radarı & Bufer Zona', icon: MapPin },
            { id: 'booking', label: '2. Növbə Rezervasiyası', icon: Clock },
            { id: 'egate', label: '3. Biometrik e-Gate Stendi', icon: Fingerprint },
            { id: 'checklist', label: '4. Sərhəd Bəyannamə Auditi', icon: CheckCircle2 },
            { id: 'exam', label: '5. Sərhəd Qanun İmtahanı', icon: FileText },
            { id: 'voucher', label: '6. Elektron Növbə Talonu', icon: QrCode },
            { id: 'registry', label: '7. Vahid Dövlət Reyestri', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Feedback alert */}
        {copyFeedback && (
          <div className="mx-6 mt-4 p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            {copyFeedback}
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SBM Checkpoints Radar */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-400" />
                    7 Strateji Beynəlxalq Sərhəd Buraxılış Məntəqələri Radarı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Azərbaycan Respublikasının Dövlət Sərhədi boyunca canlı bufer zona sıxlığı, telemetriya və gözləmə vaxtı
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchCheckpoint}
                    onChange={(e) => setSearchCheckpoint(e.target.value)}
                    placeholder="SBM adı və ya dəhliz axtar..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Checkpoints Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCheckpoints.map((cp) => {
                  const evalBuf = evaluateCheckpointBuffer(cp);
                  const isSelected = cp.id === selectedCheckpointId;

                  return (
                    <div
                      key={cp.id}
                      onClick={() => setSelectedCheckpointId(cp.id)}
                      data-testid={`checkpoint-card-${cp.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-900/30 ring-1 ring-blue-500'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                            {cp.neighborCountry}
                          </span>
                          <h4 className="font-bold text-sm text-white mt-0.5">{cp.nameAz}</h4>
                          <p className="text-xs text-slate-400 mt-1">{cp.highwayCorridor}</p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            evalBuf.statusLevel === 'CRITICAL_CONGESTION'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : evalBuf.statusLevel === 'ELEVATED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {evalBuf.occupancyPercentage}% Dolu
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              evalBuf.statusLevel === 'CRITICAL_CONGESTION'
                                ? 'bg-rose-500'
                                : evalBuf.statusLevel === 'ELEVATED'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, evalBuf.occupancyPercentage)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                          <span>Növbədə: {cp.currentActiveQueueTrucks} TIR</span>
                          <span>Boş yer: {evalBuf.availableSlotsInZone} yer</span>
                        </div>
                      </div>

                      {/* Telemetry Stats */}
                      <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/60 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-400 block">Standart Gözləmə:</span>
                          <span className="font-semibold text-amber-300">
                            ~{evalBuf.estimatedStandardWaitHours} saat
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg">
                          <span className="text-[10px] text-slate-400 block">Yaşıl Dəhliz (Fast):</span>
                          <span className="font-semibold text-emerald-400">
                            ~{evalBuf.estimatedFastTrackWaitHours} saat
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>e-Gate Zolaqları: {cp.biometricEGateLanes} ədəd</span>
                        <span className="text-blue-400 font-medium flex items-center gap-1">
                          Seçildi <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Checkpoint Detailed Dossier */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                      Aktiv Sərhəd Buraxılış Məntəqəsi
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {activeCheckpoint.nameAz}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('booking')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/30"
                  >
                    Bu Məntəqəyə Elektron Növbə Al
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block text-[11px]">Buraxılış Gücü:</span>
                    <span className="font-bold text-white text-sm">
                      {activeCheckpoint.processingThroughputPerHour} TIR / saat
                    </span>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block text-[11px]">Orta Yoxlama Müddəti:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {activeCheckpoint.averageSpeedPerTruckMins} dəqiqə / TIR
                    </span>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block text-[11px]">Bufer Tutumu:</span>
                    <span className="font-bold text-blue-400 text-sm">
                      {activeCheckpoint.bufferZoneTotalSlots} avtoqatar yeri
                    </span>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block text-[11px]">Qaynar Xətt / Növbətçi:</span>
                    <span className="font-bold text-amber-300 text-xs">
                      {activeCheckpoint.contactEmergency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Queue Booking & Fast-Track */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Elektron Növbə Rezervasiyası & Tarif Hesablayıcısı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Avtomobil kateqoriyası, yük növü və Yaşıl Dəhliz parametrləri əsasında dinamik yer bronu
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="text-slate-400 text-[11px] font-medium">Hazır Şablonlar:</span>
                  {MOCK_COMMERCIAL_PRESETS.slice(0, 3).map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => handleApplyPreset(pr.id)}
                      data-testid={`preset-btn-${pr.id}`}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs transition-colors"
                    >
                      {pr.vehiclePlate} ({pr.carrierName.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 cols: inputs */}
                <div className="lg:col-span-2 space-y-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Dövlət Qeydiyyat Nişanı (DQN):
                      </label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                        data-testid="input-vehicle-plate"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        SBM Sərhəd Məntəqəsi:
                      </label>
                      <select
                        value={selectedCheckpointId}
                        onChange={(e) => setSelectedCheckpointId(e.target.value as BorderCheckpointId)}
                        data-testid="select-checkpoint"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {MOCK_BORDER_CHECKPOINTS.map((cp) => (
                          <option key={cp.id} value={cp.id}>
                            {cp.nameAz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Yük Nəqliyyatının Növü:
                      </label>
                      <select
                        value={vehicleCategory}
                        onChange={(e) => setVehicleCategory(e.target.value as CommercialVehicleCategory)}
                        data-testid="select-vehicle-category"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {Object.values(COMMERCIAL_VEHICLE_INFO).map((info) => (
                          <option key={info.category} value={info.category}>
                            {info.nameAz} ({info.statutoryBaseFeeAzn} AZN)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Yük Prioritet Dərəcəsi:
                      </label>
                      <select
                        value={priorityTier}
                        onChange={(e) => setPriorityTier(e.target.value as CargoPriorityTier)}
                        data-testid="select-priority-tier"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {Object.values(CARGO_PRIORITY_INFO).map((info) => (
                          <option key={info.tier} value={info.tier}>
                            {info.nameAz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Daşıyıcı Şirkət:
                      </label>
                      <input
                        type="text"
                        value={carrierCompanyName}
                        onChange={(e) => setCarrierCompanyName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Sürücünün S.A.A:
                      </label>
                      <input
                        type="text"
                        value={driverFullName}
                        onChange={(e) => setDriverFullName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Sürücü FİN Kodu:
                      </label>
                      <input
                        type="text"
                        value={driverFin}
                        onChange={(e) => setDriverFin(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Night slot & e-Gate status toggles */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={isNightSlot}
                        onChange={(e) => setIsNightSlot(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      Gecə Saatı Rezervasiyası (22:00 - 06:00, +15 AZN xidmət haqqı)
                    </label>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Biometrik e-Gate Statusu:</span>
                      {biometricVerification.isCleared ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                          Təsdiqləndi (-10 AZN Güzəşt)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                          Əl ilə yoxlama tələb olunur
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right col: Calculation Summary */}
                <div className="bg-gradient-to-b from-blue-950/60 to-slate-900 border border-blue-600/30 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
                      Rəsmi Növbə Tarif Xülasəsi
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">
                      {bookingCalculation.queueTicketNumber}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Təyin olunan zolaq: <span className="text-blue-300 font-semibold">{bookingCalculation.assignedLane}</span>
                    </p>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                        <span>Baza Sərhədkeçmə Rüsumu:</span>
                        <span className="text-white font-medium">{bookingCalculation.baseFeeAzn} AZN</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                        <span>Yaşıl Dəhliz / Prioritet Əlavəsi:</span>
                        <span className="text-white font-medium">+{bookingCalculation.prioritySurchargeAzn} AZN</span>
                      </div>
                      {bookingCalculation.nightSurchargeAzn > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                          <span>Gecə Rejimi Əlavəsi:</span>
                          <span className="text-amber-400 font-medium">+{bookingCalculation.nightSurchargeAzn} AZN</span>
                        </div>
                      )}
                      {bookingCalculation.eGateDiscountAzn > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                          <span>Biometrik e-Gate Güzəşti:</span>
                          <span className="text-emerald-400 font-medium">-{bookingCalculation.eGateDiscountAzn} AZN</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                        <span>Bufer Zona Dayanacaq Yeri:</span>
                        <span className="text-blue-300 font-bold">№ {bookingCalculation.bufferZoneBayNumber}</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-400">
                        <span>Gözlənilən Keçid Vaxtı:</span>
                        <span className="text-emerald-400 font-bold">~{bookingCalculation.estimatedWaitMinutes} dəqiqə</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-500/30">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-xs text-slate-400">Yekun Dövlət Ödənişi:</span>
                      <span className="text-xl font-extrabold text-white">
                        {formatCurrency(bookingCalculation.totalFeeSelectedCurrency, currency)}
                      </span>
                    </div>

                    <button
                      onClick={handleIssueVoucher}
                      data-testid="issue-voucher-btn"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      Elektron Növbə Talonu Yarat (Voucher)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Biometric e-Gate Telemetry */}
          {activeTab === 'egate' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-blue-400" />
                  DSX Ağıllı Sərhəd Biometrik e-Gate İdentifikasiya Stendi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sürücünün biometrik pasportu, daktiloskopik barmaq izi, üz tanıma AI və alkotester telemetriyası
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 cols: sliders & checks */}
                <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-5">
                  {/* Facial Recognition Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        Üz Tanıma Biometrik Uyğunluğu (AI Face Match):
                      </span>
                      <span
                        className={`font-bold ${
                          facialScore >= 85 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {facialScore}% (Tələb: ≥85%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={facialScore}
                      onChange={(e) => setFacialScore(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Fingerprint Match Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Fingerprint className="w-4 h-4 text-indigo-400" />
                        Daktiloskopik Barmaq İzi Uyğunluğu:
                      </span>
                      <span
                        className={`font-bold ${
                          fingerprintScore >= 90 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {fingerprintScore}% (Tələb: ≥90%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="100"
                      value={fingerprintScore}
                      onChange={(e) => setFingerprintScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Breathalyzer Promille */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Rəqəmsal Alkotester Səviyyəsi (Promille ‰):
                      </span>
                      <span
                        className={`font-bold ${
                          breathalyzerPromille <= 0.05 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {breathalyzerPromille.toFixed(2)} ‰ (Qanuni hədd: ≤0.05 ‰)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="0.8"
                      step="0.01"
                      value={breathalyzerPromille}
                      onChange={(e) => setBreathalyzerPromille(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-700/60 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                      <input
                        type="checkbox"
                        checked={licenseVerified}
                        onChange={(e) => setLicenseVerified(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Beynəlxalq CE Sürücülük Vəsiqəsi Təsdiqlənib</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                      <input
                        type="checkbox"
                        checked={visaValid}
                        onChange={(e) => setVisaValid(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Dövlət Sərhədi Giriş Vizası / Rejimi Etibarlıdır</span>
                    </label>
                  </div>
                </div>

                {/* Right col: e-Gate Verification Decision Card */}
                <div
                  className={`border rounded-2xl p-5 flex flex-col justify-between ${
                    biometricVerification.gateStatus === 'CLEARED'
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : biometricVerification.gateStatus === 'FLAGGED_MANUAL_CHECK'
                      ? 'bg-amber-950/30 border-amber-500/50'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {biometricVerification.gateStatus === 'CLEARED' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : biometricVerification.gateStatus === 'FLAGGED_MANUAL_CHECK' ? (
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                      ) : (
                        <X className="w-6 h-6 text-rose-400" />
                      )}
                      <h4 className="text-base font-bold text-white">
                        {biometricVerification.gateStatus === 'CLEARED'
                          ? 'e-Gate Keçidinə İcazə Verildi'
                          : biometricVerification.gateStatus === 'FLAGGED_MANUAL_CHECK'
                          ? 'Fiziki Nəzarət Zolağına Yönləndirildi'
                          : 'Dövlət Sərhədindən Keçid Qadağandır'}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300">
                      DSX İntellektual Sərhəd Alqoritminin qiymətləndirmə nəticəsi:
                    </p>

                    <ul className="space-y-1.5 text-xs">
                      {biometricVerification.reasonsAz.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-blue-400 font-bold">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-700/60 text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Sürücü:</span>
                      <span className="text-white font-medium">{driverFullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FİN Kod:</span>
                      <span className="text-white font-mono">{driverFin}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    10-Bəndlik Beynəlxalq Sərhəd Təhlükəsizliyi & Yük Bəyannaməsi Auditi
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    TIR Konvensiyası, Gömrük Məcəlləsi və Dövlət Sərhədi Haqqında Qanun tələblərinə uyğunluq
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Uyğunluq Reytinqi:</span>
                    <span
                      className={`text-base font-bold ${
                        checklistScore >= 90
                          ? 'text-emerald-400'
                          : checklistScore >= 70
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {checklistScore}%
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const allChecked: Record<string, boolean> = {};
                      MOCK_BORDER_SECURITY_CHECKLIST.forEach((item) => (allChecked[item.id] = true));
                      setCheckedItems(allChecked);
                    }}
                    className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold transition-all"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_BORDER_SECURITY_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setCheckedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-blue-950/20 border-blue-500/40'
                          : 'bg-slate-800/40 border-slate-700/60 opacity-75'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-bold text-white text-xs">{item.titleAz}</h5>
                          {item.mandatory && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                              Məcburi
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                          {item.descriptionAz}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{item.statutoryReference}</span>
                          <span className="text-amber-400">Pozuntu cəriməsi: {item.penaltyAzn} AZN</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Exam */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    DSX & DGK Beynəlxalq Sərhədkeçmə Qanunvericiliyi İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    TIR sürücüləri və beynəlxalq logistika menecerləri üçün 10 suallıq rəsmi test
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowExamResults(!showExamResults)}
                    data-testid="toggle-exam-results-btn"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-600/30"
                  >
                    {showExamResults ? 'Nəticələri Gizlət' : 'İmtahanı Tamamla və Yoxla'}
                  </button>
                </div>
              </div>

              {showExamResults && (
                <div
                  className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                    examScore.passed
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6" />
                    <div>
                      <h4 className="font-bold text-sm">
                        {examScore.passed
                          ? 'Təbriklər! İmtahandan Müvəffəqiyyətlə Keçdiniz'
                          : 'Təəssüf! Keçid Balı Toplanmadı (Minimum 8 düzgün cavab tələb olunur)'}
                      </h4>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        Düzgün cavab sayı: {examScore.correctCount} / {examScore.totalCount} ({examScore.percentage}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_BORDER_LAW_EXAM.map((q, idx) => {
                  const selectedOpt = userExamAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 text-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-white text-sm">
                          {idx + 1}. {q.questionAz}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: #{q.id}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optStyle = 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500';

                          if (showExamResults) {
                            if (optIdx === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (isOptionSelected) {
                              optStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'bg-blue-600/30 border-blue-500 text-blue-200 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                setUserExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                              }
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {showExamResults && optIdx === q.correctOptionIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showExamResults && (
                        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
                          <p className="font-semibold text-blue-300">İzah:</p>
                          <p>{q.explanationAz}</p>
                          <span className="text-slate-500 text-[10px] block mt-1">
                            İstinad: {q.legalReference}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: Voucher */}
          {activeTab === 'voucher' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-400" />
                  Rəsmi Sərhəd Buraxılış Elektron Növbə Talonu (Voucher)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  DSX e-Gate şlaqbaum keçid PIN kodu və SİMA rəqəmsal imzalı təsdiq sənədi
                </p>
              </div>

              {currentVoucher ? (
                <div
                  data-testid="voucher-card"
                  className="bg-gradient-to-b from-slate-900 to-blue-950/60 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl relative space-y-5"
                >
                  {/* Voucher Header */}
                  <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                        Azərbaycan Respublikası Dövlət Sərhəd Xidməti
                      </span>
                      <h4 className="text-base font-extrabold text-white">
                        {currentVoucher.checkpointNameAz}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Elektron Növbə və Prioritet Tranzit Talonu
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30">
                        {currentVoucher.voucherNumber}
                      </span>
                    </div>
                  </div>

                  {/* Main Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">Növbə Qeydiyyat Nömrəsi:</span>
                      <span className="font-bold text-white font-mono text-sm">
                        {currentVoucher.queueTicketNumber}
                      </span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">Təyin Edilən Keçid Zolağı:</span>
                      <span className="font-bold text-blue-400 text-sm">
                        {currentVoucher.assignedLane}
                      </span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">Avtomobil DQN / Daşıyıcı:</span>
                      <span className="font-bold text-white text-xs">
                        {currentVoucher.vehiclePlate} • {currentVoucher.carrierCompanyName}
                      </span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">Sürücü S.A.A / FİN:</span>
                      <span className="font-bold text-white text-xs">
                        {currentVoucher.driverFullName} ({currentVoucher.driverFin})
                      </span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">Bufer Dayanacaq Yeri:</span>
                      <span className="font-bold text-amber-300 text-sm">
                        Sektor B, № {currentVoucher.bufferZoneBayNumber}
                      </span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 text-[10px] block">Gözlənilən Çağırış:</span>
                      <span className="font-bold text-emerald-400 text-xs">
                        {currentVoucher.estimatedCallTimeAz}
                      </span>
                    </div>
                  </div>

                  {/* Barrier PIN and QR Box */}
                  <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        e-Gate Şlaqbaum PIN Kodu:
                      </span>
                      <span className="text-2xl font-mono font-extrabold text-blue-400 tracking-widest">
                        {currentVoucher.barrierGatePin}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Terminalla yaxınlaşdıqda skanerə daxil edin
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Dövlət Rüsumu:</span>
                      <span className="text-lg font-bold text-white">
                        {currentVoucher.totalFeeFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic Signatures */}
                  <div className="text-[10px] text-slate-500 space-y-1 border-t border-slate-800 pt-3">
                    <div className="flex justify-between">
                      <span>SİMA Rəqəmsal İmzası:</span>
                      <span className="font-mono text-slate-400">{currentVoucher.simaDigitalSignatureUid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Təhlükəsizlik Hash-i:</span>
                      <span className="font-mono text-slate-400">{currentVoucher.securityChecksumSha256}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleCopy(currentVoucher.voucherNumber, 'Voucher Kodu')}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Kodu Kopyala
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Çap Et / PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
                  <Clock className="w-10 h-10 text-slate-500 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-300">
                    Aktiv Elektron Növbə Talonu Yoxdur
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Növbə rezervasiyası bölməsinə keçərək məntəqə və yük məlumatlarını doldurub yeni talon əldə edin.
                  </p>
                  <button
                    onClick={() => setActiveTab('booking')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    Növbə Rezervasiyasına Get
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Registry */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Vahid Dövlət Elektron Növbə & Tranzit Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    DSX və DGK bazasında qeydiyyata alınmış aktiv beynəlxalq yük növbələri
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Vauçer, DQN və ya sürücü axtar..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Vauçer Kodu</th>
                      <th className="py-3 px-4">SBM Məntəqəsi</th>
                      <th className="py-3 px-4">Nəqliyyat DQN</th>
                      <th className="py-3 px-4">Daşıyıcı & Sürücü</th>
                      <th className="py-3 px-4">Zolaq</th>
                      <th className="py-3 px-4">Çağırış</th>
                      <th className="py-3 px-4">Rüsum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                    {filteredRegistry.map((reg) => (
                      <tr key={reg.voucherNumber} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">
                          {reg.voucherNumber}
                        </td>
                        <td className="py-3 px-4">{reg.checkpointNameAz}</td>
                        <td className="py-3 px-4 font-bold text-white font-mono">
                          {reg.vehiclePlate}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{reg.carrierCompanyName}</div>
                          <div className="text-slate-400 text-[10px]">{reg.driverFullName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                            {reg.assignedLane.split(' ')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-medium">
                          {reg.estimatedCallTimeAz.split(' ')[0]}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {reg.totalFeeFormatted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>
              AR Dövlət Sərhədi Haqqında Qanun (Maddə 8, 12, 19) • Gömrük Məcəlləsi (Maddə 184–210)
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Pəncərəni Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
