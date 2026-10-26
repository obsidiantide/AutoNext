import React, { useState, useMemo } from 'react';
import {
  Train,
  Car,
  ShieldCheck,
  AlertTriangle,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Zap,
  Leaf,
  Fuel,
  Info,
  QrCode,
  Sliders,
  DollarSign,
  Award,
  CreditCard,
  Building,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  MetroHubId,
  MetroLineId,
  IntermodalVehicleType,
  PnrParkingDuration,
  BakiKartValidationStatus,
  MetroIntermodalPass,
  calculateMetroIntermodalSavings,
  calculateMetroPnrCost,
  evaluateMetroChecklist,
  evaluateMetroExam,
  formatMetroPlate,
  generateMetroIntermodalPass,
  formatMetroCurrency,
} from '../utils/metroIntermodalCompliance';
import {
  MOCK_METRO_HUBS,
  MOCK_METRO_PRESETS,
  MOCK_METRO_CHECKLIST,
  MOCK_METRO_EXAM_QUESTIONS,
  MOCK_ACTIVE_METRO_PASSES,
} from '../data/mockMetroData';

export type MetroModalTab =
  | 'savings_calculator'
  | 'hubs_radar'
  | 'underground_safety'
  | 'exam_simulator'
  | 'pass_generator'
  | 'registry_lookup';

interface MetroIntermodalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: Vehicle | null;
  currency?: Currency;
}

export const MetroIntermodalModal: React.FC<MetroIntermodalModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<MetroModalTab>('savings_calculator');

  // Calculator State
  const [selectedHubId, setSelectedHubId] = useState<MetroHubId>('koroglu_hub');
  const [selectedVehicleType, setSelectedVehicleType] = useState<IntermodalVehicleType>('sedan_compact');
  const [duration, setDuration] = useState<PnrParkingDuration>('commute_workday');
  const [bakiKartStatus, setBakiKartStatus] = useState<BakiKartValidationStatus>('validated_discount_active');
  const [commuteDistanceKm, setCommuteDistanceKm] = useState<number>(28);
  const [fuelConsumption, setFuelConsumption] = useState<number>(7.8);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(1.10); // Tarif Şurası Aİ-92
  const [downtownParkingCost, setDowntownParkingCost] = useState<number>(8.00); // AzParking Zone 1/2 standard workday
  const [trafficDelayMinutes, setTrafficDelayMinutes] = useState<number>(45);

  // Vehicle Details State
  const [vehiclePlate, setVehiclePlate] = useState<string>(
    initialVehicle?.plateNumber || '10-BM-100'
  );
  const [vehicleModel, setVehicleModel] = useState<string>(
    initialVehicle ? `${initialVehicle.make} ${initialVehicle.model}` : 'Hyundai Elantra 2.0 GL'
  );
  const [isLpgCng, setIsLpgCng] = useState<boolean>(false);
  const [bakiKartSerial, setBakiKartSerial] = useState<string>('99401294829104');

  // Hub Radar State
  const [selectedLineFilter, setSelectedLineFilter] = useState<'all' | MetroLineId>('all');
  const [hubSearchQuery, setHubSearchQuery] = useState<string>('');

  // Checklist State
  const [checklistMap, setChecklistMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MOCK_METRO_CHECKLIST.forEach((item) => {
      initial[item.id] = true;
    });
    return initial;
  });

  // Exam Simulator State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Generated Pass & Registry State
  const [currentPass, setCurrentPass] = useState<MetroIntermodalPass | null>(() => MOCK_ACTIVE_METRO_PASSES[0]);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copyNotification, setCopyNotification] = useState<string | null>(null);

  // Resolve current active Hub
  const selectedHub = useMemo(
    () => MOCK_METRO_HUBS.find((h) => h.id === selectedHubId) || MOCK_METRO_HUBS[0],
    [selectedHubId]
  );

  // Calculate live savings
  const savings = useMemo(() => {
    return calculateMetroIntermodalSavings({
      commuteDistanceKm,
      vehicleConsumptionL100km: fuelConsumption,
      fuelPricePerLiterAzn: fuelPricePerLiter,
      downtownParkingCostAzn: downtownParkingCost,
      pnrParkingDailyFeeAzn: selectedHub.dailyRateAzn * (bakiKartStatus === 'validated_discount_active' ? 0.4 : 1.0),
      cityTrafficDelayMinutes: trafficDelayMinutes,
    });
  }, [
    commuteDistanceKm,
    fuelConsumption,
    fuelPricePerLiter,
    downtownParkingCost,
    selectedHub.dailyRateAzn,
    bakiKartStatus,
    trafficDelayMinutes,
  ]);

  // Calculate live P+R fees
  const pnrCost = useMemo(() => {
    return calculateMetroPnrCost({
      hub: selectedHub,
      duration,
      vehicleType: selectedVehicleType,
      bakiKartStatus,
      currency,
    });
  }, [selectedHub, duration, selectedVehicleType, bakiKartStatus, currency]);

  // Evaluate Safety Checklist
  const checklistAudit = useMemo(() => {
    return evaluateMetroChecklist(MOCK_METRO_CHECKLIST, checklistMap, isLpgCng);
  }, [checklistMap, isLpgCng]);

  // Evaluate Theoretical Exam
  const examResult = useMemo(() => {
    return evaluateMetroExam(MOCK_METRO_EXAM_QUESTIONS, examAnswers);
  }, [examAnswers]);

  // Filtered Hubs for Radar
  const filteredHubs = useMemo(() => {
    return MOCK_METRO_HUBS.filter((h) => {
      const matchLine = selectedLineFilter === 'all' || h.lineId === selectedLineFilter;
      const matchSearch =
        h.name.toLowerCase().includes(hubSearchQuery.toLowerCase()) ||
        h.district.toLowerCase().includes(hubSearchQuery.toLowerCase()) ||
        h.code.toLowerCase().includes(hubSearchQuery.toLowerCase());
      return matchLine && matchSearch;
    });
  }, [selectedLineFilter, hubSearchQuery]);

  // Filtered Passes for Registry
  const filteredPasses = useMemo(() => {
    if (!registrySearch.trim()) return MOCK_ACTIVE_METRO_PASSES;
    const query = registrySearch.toLowerCase();
    return MOCK_ACTIVE_METRO_PASSES.filter(
      (p) =>
        p.passNumber.toLowerCase().includes(query) ||
        p.vehiclePlate.toLowerCase().includes(query) ||
        p.hubName.toLowerCase().includes(query) ||
        p.bakiKartSerial.toLowerCase().includes(query)
    );
  }, [registrySearch]);

  const handleApplyPreset = (presetId: string) => {
    const preset = MOCK_METRO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setVehiclePlate(preset.plate);
    setVehicleModel(preset.model);
    setSelectedVehicleType(preset.type);
    setFuelConsumption(preset.fuelConsumptionL100km);
    setCommuteDistanceKm(preset.commuteDistanceKm);
    setIsLpgCng(preset.fuelType === 'lpg_cng');
  };

  const handleToggleChecklist = (id: string) => {
    setChecklistMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    if (isExamSubmitted) return;
    setExamAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleGeneratePass = () => {
    const pass = generateMetroIntermodalPass({
      hub: selectedHub,
      vehiclePlate,
      vehicleModel,
      vehicleType: selectedVehicleType,
      pnrDuration: duration,
      bakiKartSerial,
      isLpgOrCng: isLpgCng,
      currency,
    });
    setCurrentPass(pass);
    setActiveTab('pass_generator');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopyNotification(`${label} kopyalandı!`);
    setTimeout(() => setCopyNotification(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      data-testid="metro-intermodal-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-purple-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Bakı Metropoliteni & AYNA Yerüstü NMM Portalı
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  Park & Ride (P+R)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  BakıKart 0.50 ₼
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bakı Metropoliteni QSC, AYNA Nəqliyyat Mübadilə Mərkəzləri və İctimai Nəqliyyat İnteqrasiyası
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            data-testid="metro-modal-close-btn"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-900/90 overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('savings_calculator')}
            data-testid="tab-savings-calculator"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'savings_calculator'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Qənaət Kalkulyatoru</span>
          </button>

          <button
            onClick={() => setActiveTab('hubs_radar')}
            data-testid="tab-hubs-radar"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'hubs_radar'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Metro Qovşaqları (HUB Radar)</span>
          </button>

          <button
            onClick={() => setActiveTab('underground_safety')}
            data-testid="tab-underground-safety"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'underground_safety'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Yeraltı Yanğın & Qabarit Təhlükəsizliyi</span>
          </button>

          <button
            onClick={() => setActiveTab('exam_simulator')}
            data-testid="tab-exam-simulator"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'exam_simulator'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Metro & Sərnişin Test İmtahanı</span>
          </button>

          <button
            onClick={() => setActiveTab('pass_generator')}
            data-testid="tab-pass-generator"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'pass_generator'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>P+R Buraxılış Vəsiqəsi (E-Bilet)</span>
          </button>

          <button
            onClick={() => setActiveTab('registry_lookup')}
            data-testid="tab-registry-lookup"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              activeTab === 'registry_lookup'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Dövlət P+R Reyestri</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {copyNotification && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{copyNotification}</span>
            </div>
          )}

          {/* TAB 1: SAVINGS CALCULATOR */}
          {activeTab === 'savings_calculator' && (
            <div className="space-y-6" data-testid="metro-calculator-view">
              {/* Presets Bar */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Car className="w-4 h-4 text-red-400" />
                  Sürətli Avtomobil Preseti Seçimi:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {MOCK_METRO_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      data-testid={`preset-btn-${p.id}`}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        vehiclePlate === p.plate
                          ? 'bg-red-500/15 border-red-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {p.plate} • {p.fuelConsumptionL100km} L/100km • {p.commuteDistanceKm} km
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Inputs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5 bg-slate-800/30 p-5 rounded-xl border border-slate-800">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Train className="w-5 h-5 text-red-400" />
                    P+R Nəqliyyat Mübadilə Mərkəzi və Marşrut Parametrləri
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium">Strateji Metro Hub Seçimi</label>
                      <select
                        value={selectedHubId}
                        onChange={(e) => setSelectedHubId(e.target.value as MetroHubId)}
                        data-testid="select-metro-hub"
                        className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                      >
                        {MOCK_METRO_HUBS.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} ({h.availableBays} boş yer)
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Xətt: {selectedHub.lineName}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium">Parklanma Müddəti</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value as PnrParkingDuration)}
                        data-testid="select-parking-duration"
                        className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="commute_workday">Gündəlik İş Günü (8-10 saat) - Tövsiyə olunan</option>
                        <option value="hourly_short">Qısamüddətli (1-3 saat)</option>
                        <option value="daily_24h">Tam Günlük (24 saat)</option>
                        <option value="monthly_subscription">Aylıq Limitsiz P+R Abunəlik</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium">Nəqliyyat Vasitəsi Kateqoriyası</label>
                      <select
                        value={selectedVehicleType}
                        onChange={(e) => setSelectedVehicleType(e.target.value as IntermodalVehicleType)}
                        data-testid="select-vehicle-type"
                        className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="sedan_compact">Minik Sedan / Hetçbek</option>
                        <option value="suv_crossover">Krossover / SUV</option>
                        <option value="electric_ev">Elektromobil (EV) - %25 Güzəşt</option>
                        <option value="hybrid_phev">Hibrid (HEV / PHEV)</option>
                        <option value="motorcycle_scooter">Motosiklet / Skuter - %50 Güzəşt</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium">BakıKart İnteqrasiya Statusu</label>
                      <select
                        value={bakiKartStatus}
                        onChange={(e) => setBakiKartStatus(e.target.value as BakiKartValidationStatus)}
                        data-testid="select-bakikart-status"
                        className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="validated_discount_active">Metrodan Keçid Təsdiqlənib (%60 P+R Güzəşti)</option>
                        <option value="not_validated_standard_rate">Metro Keçidi Yoxdur (Standart Parklanma Haqqı)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sliders Section */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Gündəlik Gediş-Dönüş Məsafəsi (Ev - Şəhər Mərkəzi)</span>
                        <span className="font-bold text-red-400">{commuteDistanceKm} km</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        step="2"
                        value={commuteDistanceKm}
                        onChange={(e) => setCommuteDistanceKm(Number(e.target.value))}
                        className="w-full mt-1 accent-red-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Avtomobilin Şəhəriçi Yanacaq Sərfi (L / 100km)</span>
                        <span className="font-bold text-amber-400">{fuelConsumption} L / 100km</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="18"
                        step="0.5"
                        value={fuelConsumption}
                        onChange={(e) => setFuelConsumption(Number(e.target.value))}
                        className="w-full mt-1 accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Şəhər Mərkəzində Tıxacda İtirilən Vaxt (Gündəlik Gediş-Dönüş)</span>
                        <span className="font-bold text-blue-400">{trafficDelayMinutes} dəqiqə</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="120"
                        step="5"
                        value={trafficDelayMinutes}
                        onChange={(e) => setTrafficDelayMinutes(Number(e.target.value))}
                        className="w-full mt-1 accent-blue-500"
                      />
                    </div>
                  </div>

                  {/* Vehicle Plate & Model Entry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-xs text-slate-400">Dövlət Qeydiyyat Nişanı</label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        placeholder="10-BM-100"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Avtomobil Modeli</label>
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="Hyundai Elantra"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* KPI & Summary Card */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 rounded-xl border border-red-500/20 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                      <span className="text-xs font-semibold text-slate-300">P+R Tarif İcmalı</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                        {pnrCost.effectiveDiscountPercent}% BakıKart Güzəşti
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-400">
                        <span>P+R Əsas Parklanma Haqqı:</span>
                        <span className="text-slate-200">{formatMetroCurrency(pnrCost.baseParkingFee, currency)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400">
                        <span>BakıKart Dövlət Subsidiyası:</span>
                        <span>-{formatMetroCurrency(pnrCost.concessionDiscount, currency)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Metro Gediş Haqqı (Gediş-Dönüş):</span>
                        <span className="text-slate-200">{formatMetroCurrency(pnrCost.metroFare, currency)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                        <span className="text-white font-semibold">Cəmi Xərc:</span>
                        <span className="text-2xl font-bold text-red-400">
                          {formatMetroCurrency(pnrCost.convertedCost, currency)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleGeneratePass}
                      data-testid="generate-pass-btn"
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>P+R Elektron Buraxılış Vərəqəsi Al</span>
                    </button>
                  </div>

                  {/* Ecological & Financial Savings Card */}
                  <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/60 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <Leaf className="w-4 h-4" />
                      <span>İllik Qənaət və Ekoloji Effektivlik</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        <div className="text-slate-400 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          İllik Maddi Qənaət
                        </div>
                        <div className="text-lg font-bold text-emerald-400 mt-1">
                          {formatMetroCurrency(savings.annualNetSavingsAzn, currency)}
                        </div>
                        <div className="text-[10px] text-slate-500">Yanacaq + Mərkəz parkinqi</div>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        <div className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          İllik Vaxt Qazancı
                        </div>
                        <div className="text-lg font-bold text-blue-400 mt-1">
                          {savings.annualTimeSavedHours} saat
                        </div>
                        <div className="text-[10px] text-slate-500">Tıxacdan azad səyahət</div>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        <div className="text-slate-400 flex items-center gap-1">
                          <Leaf className="w-3.5 h-3.5 text-teal-400" />
                          CO₂ Tullantı Azalması
                        </div>
                        <div className="text-lg font-bold text-teal-400 mt-1">
                          {savings.annualCo2SavedKg} kq
                        </div>
                        <div className="text-[10px] text-slate-500">Təmiz şəhər havası</div>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        <div className="text-slate-400 flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-amber-400" />
                          Gündəlik Yanacaq
                        </div>
                        <div className="text-lg font-bold text-amber-400 mt-1">
                          {savings.dailyFuelSavedLiters} L
                        </div>
                        <div className="text-[10px] text-slate-500">Hər gün qorunan benzin</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HUBS RADAR */}
          {activeTab === 'hubs_radar' && (
            <div className="space-y-6" data-testid="metro-radar-view">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-medium">Xətt filteri:</span>
                  <div className="flex gap-1.5 overflow-x-auto">
                    <button
                      onClick={() => setSelectedLineFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedLineFilter === 'all'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Bütün Xətlər (7 HUB)
                    </button>
                    <button
                      onClick={() => setSelectedLineFilter('red_line')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        selectedLineFilter === 'red_line'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-900 text-red-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Qırmızı Xətt
                    </button>
                    <button
                      onClick={() => setSelectedLineFilter('green_line')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        selectedLineFilter === 'green_line'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Yaşıl Xətt
                    </button>
                    <button
                      onClick={() => setSelectedLineFilter('purple_line')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        selectedLineFilter === 'purple_line'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-900 text-purple-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Bənövşəyi Xətt
                    </button>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={hubSearchQuery}
                    onChange={(e) => setHubSearchQuery(e.target.value)}
                    placeholder="HUB adı və ya rayon axtar..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Hub Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHubs.map((hub) => (
                  <div
                    key={hub.id}
                    data-testid={`hub-card-${hub.id}`}
                    className={`bg-slate-800/40 p-5 rounded-xl border transition-all flex flex-col justify-between ${
                      selectedHubId === hub.id
                        ? 'border-red-500 bg-slate-800/70 shadow-lg shadow-red-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                            style={{ backgroundColor: `${hub.lineColor}25`, color: hub.lineColor }}
                          >
                            {hub.code}
                          </span>
                          <h4 className="text-base font-bold text-white mt-1">{hub.name}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            {hub.district}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            hub.liveStatus === 'optimal'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : hub.liveStatus === 'moderate'
                              ? 'bg-blue-500/20 text-blue-400'
                              : hub.liveStatus === 'near_capacity'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {hub.availableBays} boş yer
                        </span>
                      </div>

                      {/* Capacity Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Doluluq Səviyyəsi</span>
                          <span>
                            {hub.totalBays - hub.availableBays} / {hub.totalBays} ({Math.round(((hub.totalBays - hub.availableBays) / hub.totalBays) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round(((hub.totalBays - hub.availableBays) / hub.totalBays) * 100)}%`,
                              backgroundColor: hub.lineColor,
                            }}
                          />
                        </div>
                      </div>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          {hub.evChargingBays} EV Şarj
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900/80 text-slate-300">
                          ♿ {hub.disabledBays} Əlil Yeri
                        </span>
                        {hub.hasDirectUnderpass && (
                          <span className="px-2 py-0.5 rounded bg-slate-900/80 text-blue-300">
                            🚇 Birbaşa Keçid
                          </span>
                        )}
                        {hub.hasSubterraneanLevels ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Yeraltı Mərtəbə
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            Yerüstü Açıq
                          </span>
                        )}
                      </div>

                      {/* Connected Buses */}
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-300 font-medium">Avtobus Bağlantısı:</span>{' '}
                        {hub.connectedBusRoutes.join(', ')}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">Gündəlik Tarif (P+R)</div>
                        <div className="text-sm font-bold text-white">
                          {formatMetroCurrency(hub.dailyRateAzn, currency)} / gün
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedHubId(hub.id);
                          setActiveTab('savings_calculator');
                        }}
                        className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                      >
                        <span>Seç və Hesabla</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: UNDERGROUND & FIRE SAFETY */}
          {activeTab === 'underground_safety' && (
            <div className="space-y-6" data-testid="metro-safety-view">
              <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-500" />
                      10 Bəndlik Yeraltı Parkinq & Yanğın Təhlükəsizliyi Yoxlama Standı
                    </h3>
                    <p className="text-xs text-slate-400">
                      Nazirlər Kabinetinin 226 №-li Qərarı və FHN Dövlət Yanğın Nəzarəti Xidməti Reqlamenti
                    </p>
                  </div>

                  {/* LPG/CNG Toggle Alert */}
                  <label className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLpgCng}
                      onChange={(e) => setIsLpgCng(e.target.checked)}
                      data-testid="checkbox-lpg-cng"
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Avtomobil Qazbalon (LPG/CNG) ilə təchiz olunub?
                    </span>
                  </label>
                </div>

                {/* Score Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Uyğunluq İndeksi</span>
                    <div className="text-2xl font-bold text-white mt-1">
                      {checklistAudit.score} / {checklistAudit.maxScore} ({checklistAudit.percentage}%)
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Buraxılış Statusu</span>
                    <div className="mt-1">
                      {checklistAudit.passed ? (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          TAM UYĞUNDUR (KEÇİDƏ İCAZƏ VERİLİR)
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          UYĞUNSUZLUQ AŞKARLANDI
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Yeraltı Qadağa</span>
                    <div className="mt-1">
                      {isLpgCng ? (
                        <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          LPG/CNG: Yeraltıya Giriş Qadağandır!
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Standart Yanacaq: İcazə Verilir
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Violations Warning */}
                {checklistAudit.violations.length > 0 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      Qeydə Alınmış Pozuntular:
                    </div>
                    {checklistAudit.violations.map((v, idx) => (
                      <div key={idx}>• {v}</div>
                    ))}
                  </div>
                )}

                {/* Checklist Items */}
                <div className="space-y-2 pt-2">
                  {MOCK_METRO_CHECKLIST.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        checklistMap[item.id]
                          ? 'bg-slate-900/70 border-slate-700/80'
                          : 'bg-red-500/5 border-red-500/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(checklistMap[item.id])}
                        onChange={() => {}} // handled by parent onClick
                        className="accent-red-500 w-4 h-4 mt-0.5 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{item.title}</span>
                          {item.isMandatory && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                              MƏCBURİ
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">+{item.points} xal</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXAM SIMULATOR */}
          {activeTab === 'exam_simulator' && (
            <div className="space-y-6" data-testid="metro-exam-view">
              <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-red-400" />
                      Bakı Metropoliteni & P+R Sərnişin Qaydaları İmtahan Standı (10 Sual)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Minimum 80% (8 düzgün cavab) tələb olunur • İctimai Nəqliyyat Şüuru Attestasiyası
                    </p>
                  </div>

                  {isExamSubmitted && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold ${
                          examResult.isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        Nəticə: {examResult.correctCount} / {examResult.totalQuestions} ({examResult.scorePercentage}%) —{' '}
                        {examResult.isPassed ? 'UĞURLA KEÇDİ' : 'KƏSİLDİ'}
                      </span>
                      <button
                        onClick={() => {
                          setExamAnswers({});
                          setIsExamSubmitted(false);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-all"
                      >
                        Yenidən Başla
                      </button>
                    </div>
                  )}
                </div>

                {/* Question List */}
                <div className="space-y-4">
                  {MOCK_METRO_EXAM_QUESTIONS.map((q, idx) => {
                    const selected = examAnswers[q.id];
                    return (
                      <div
                        key={q.id}
                        data-testid={`exam-question-${q.id}`}
                        className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3"
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-white">{q.question}</span>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            let btnStyle = 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800';
                            if (isExamSubmitted) {
                              if (optIdx === q.correctIndex) {
                                btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                              } else if (selected === optIdx) {
                                btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
                              }
                            } else if (selected === optIdx) {
                              btnStyle = 'bg-red-500/20 border-red-500 text-white font-semibold';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectAnswer(q.id, optIdx)}
                                data-testid={`exam-option-${q.id}-${optIdx}`}
                                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation & Citation after submission */}
                        {isExamSubmitted && (
                          <div className="text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-400 space-y-1">
                            <div className="text-slate-300 font-medium">{q.explanation}</div>
                            <div className="text-[11px] text-red-400/90 font-mono">İstinad: {q.citation}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!isExamSubmitted && (
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    data-testid="submit-exam-btn"
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/30 transition-all"
                  >
                    Cavabları Yoxla və İmtahanı Tamamla
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PASS GENERATOR & DIGITAL TICKET */}
          {activeTab === 'pass_generator' && currentPass && (
            <div className="space-y-6" data-testid="metro-pass-view">
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-red-500/30 shadow-2xl relative overflow-hidden space-y-6">
                {/* Metro Pass Top Branding */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-red-600/40">
                      M
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white tracking-wide">
                        BAKI METROPOLİTENİ QSC & AYNA
                      </h4>
                      <p className="text-xs text-slate-400">
                        Park & Ride (P+R) İnteqrasiya Olunmuş Buraxılış Vərəqəsi
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-red-400">{currentPass.passNumber}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      RƏSMİ ELEKTRON BİLET
                    </span>
                  </div>
                </div>

                {/* Details Matrix */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Qeydiyyat Nişanı:</span>
                    <div className="text-base font-mono font-bold text-white mt-0.5">
                      {currentPass.vehiclePlate}
                    </div>
                    <div className="text-[11px] text-slate-400">{currentPass.vehicleModel}</div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">P+R Qovşaq (HUB):</span>
                    <div className="text-sm font-semibold text-white mt-0.5">{currentPass.hubName}</div>
                    <div className="text-[11px] text-red-400">Parklanma Bölməsi: {currentPass.bayNumber}</div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">BakıKart Serial Nömrəsi:</span>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                      {currentPass.bakiKartSerial}
                    </div>
                    <div className="text-[11px] text-emerald-400">Metro Gediş-Dönüş Daxildir (0.50 ₼ x 2)</div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Turniket Keçid Kodu (PIN):</span>
                    <div className="text-base font-mono font-bold text-amber-400 mt-0.5">
                      {currentPass.turnstileGatePin}
                    </div>
                    <div className="text-[11px] text-slate-400">Şlaqbaum və Metro Turniketi</div>
                  </div>
                </div>

                {/* QR Code & Financial Strip */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
                    <QrCode className="w-full h-full text-slate-950" />
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="text-white font-semibold">Ödənilmiş Yekun Məbləğ:</div>
                    <div className="text-2xl font-bold text-red-400">
                      {formatMetroCurrency(currentPass.totalPaid, currentPass.currency)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Güzəşt: {formatMetroCurrency(currentPass.concessionDiscount, currentPass.currency)} • Tarix:{' '}
                      {currentPass.issueDate} - {currentPass.expiryDate}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      SİMA İmzası: {currentPass.simaSignatureUid}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopyText(currentPass.passNumber, 'Bilet Kodu')}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Nömrəni Kopyala</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Çap Et (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: UNIFIED PUBLIC REGISTRY LOOKUP */}
          {activeTab === 'registry_lookup' && (
            <div className="space-y-6" data-testid="metro-registry-view">
              <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Search className="w-5 h-5 text-red-400" />
                      Vahid Dövlət Park & Ride (P+R) Buraxılış Reyestri
                    </h3>
                    <p className="text-xs text-slate-400">
                      Bakı Metropoliteni QSC və AYNA Mərkəzi Server Telemetriyası
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      placeholder="Qeydiyyat nişanı və ya bilet nömrəsi..."
                      data-testid="input-registry-search"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                        <th className="p-3">Bilet Nömrəsi</th>
                        <th className="p-3">Nəqliyyat Vasitəsi</th>
                        <th className="p-3">P+R Qovşaq (HUB)</th>
                        <th className="p-3">Bölmə / PIN</th>
                        <th className="p-3">Müddət</th>
                        <th className="p-3">Məbləğ</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredPasses.map((p) => (
                        <tr key={p.passNumber} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-mono text-red-400 font-semibold">{p.passNumber}</td>
                          <td className="p-3">
                            <div className="font-mono font-bold text-white">{p.vehiclePlate}</div>
                            <div className="text-[11px] text-slate-400">{p.vehicleModel}</div>
                          </td>
                          <td className="p-3 text-slate-300">{p.hubName}</td>
                          <td className="p-3">
                            <span className="font-semibold text-white">{p.bayNumber}</span>
                            <span className="text-[11px] text-slate-400 block font-mono">PIN: {p.turnstileGatePin}</span>
                          </td>
                          <td className="p-3 text-slate-300">{p.pnrDuration}</td>
                          <td className="p-3 font-bold text-white">
                            {formatMetroCurrency(p.totalPaid, p.currency)}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              AKTİV
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

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AR Nəqliyyat Haqqında Qanun & NK 226 №-li Qərarına uyğundur</span>
          </div>
          <div>Bakı Metropoliteni QSC • AYNA NMM İdarəsi</div>
        </div>
      </div>
    </div>
  );
};
