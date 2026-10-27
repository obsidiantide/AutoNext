import React, { useState, useMemo } from 'react';
import {
  Currency,
  ContainerType,
  MultimodalCorridor,
  VgmMethod,
  CONTAINER_SPECS,
  MULTIMODAL_CORRIDORS,
  AFEZ_CONCESSIONS,
  calculateSolasVgm,
  calculateAfezLogisticsTariff,
  formatAfezCurrency,
  evaluateAfezChecklist,
  gradeAfezExam,
  generateAfezCertificate,
  AfezChecklistItem,
  VerifiedAfezCertificate,
} from '../utils/afezLogisticsCompliance';
import {
  AFEZ_TERMINAL_HUBS,
  AFEZ_VEHICLE_PRESETS,
  AFEZ_CHECKLIST_ITEMS,
  AFEZ_EXAM_QUESTIONS,
  MOCK_VERIFIED_AFEZ_CERTIFICATES,
  AfezTerminalHub,
  AfezVehiclePreset,
} from '../data/mockAfezLogisticsData';
import {
  X,
  Truck,
  Anchor,
  Layers,
  ShieldCheck,
  Scale,
  FileText,
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
  Sliders,
  DollarSign,
  TrendingUp,
  Box,
  Barcode,
  ThermometerSnowflake,
  Train,
  Plane,
  Warehouse,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';

export interface AfezLogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialVehicle?: Vehicle;
}

export type AfezTab = 
  | 'calculator'
  | 'terminals'
  | 'telemetry'
  | 'checklist'
  | 'exam'
  | 'certificate';

export const AfezLogisticsModal: React.FC<AfezLogisticsModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<AfezTab>('calculator');
  const [activeCurrency, setActiveCurrency] = useState<Currency>(currency);

  // Selected container and freight configuration
  const [selectedContainerType, setSelectedContainerType] = useState<ContainerType>('40FT_HC');
  const [selectedCorridor, setSelectedCorridor] = useState<MultimodalCorridor>('TRANS_CASPIAN_SEA');
  const [dwellDays, setDwellDays] = useState<number>(7);
  const [cargoNetWeightKg, setCargoNetWeightKg] = useState<number>(22400);
  const [cargoDeclaredValueAzn, setCargoDeclaredValueAzn] = useState<number>(185000);
  const [requestReeferPower, setRequestReeferPower] = useState<boolean>(true);
  const [requestSolasVgm, setRequestSolasVgm] = useState<boolean>(true);
  const [vgmMethod, setVgmMethod] = useState<VgmMethod>('METHOD_1_WEIGHBRIDGE');

  // Terminal Hub filter
  const [terminalSearch, setTerminalSearch] = useState<string>('');
  const [selectedTerminal, setSelectedTerminal] = useState<AfezTerminalHub>(AFEZ_TERMINAL_HUBS[0]);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>(
    AFEZ_CHECKLIST_ITEMS.slice(0, 9).map((item) => item.id)
  );

  // Exam state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showExamResults, setShowExamResults] = useState<boolean>(false);

  // Certificate Generator & Public Registry
  const [carrierTruckPlate, setCarrierTruckPlate] = useState<string>(
    initialVehicle?.plateNumber || '99-AF-101'
  );
  const [containerNumber, setContainerNumber] = useState<string>('MSKU-749215-3');
  const [driverFullName, setDriverFullName] = useState<string>('Rəşad Qasımov Əli oğlu');
  const [driverPassportFin, setDriverPassportFin] = useState<string>('5K8M2P1');
  const [originCountry, setOriginCountry] = useState<string>('Türkiyə (Mersin Limanı)');
  const [destinationPort, setDestinationPort] = useState<string>('Qazaxıstan (Aktau Portu / Almatı)');
  const [currentCertificate, setCurrentCertificate] = useState<VerifiedAfezCertificate | null>(null);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Calculations
  const tariffCalculation = useMemo(() => {
    return calculateAfezLogisticsTariff({
      containerType: selectedContainerType,
      corridor: selectedCorridor,
      dwellDays,
      cargoValueAzn: cargoDeclaredValueAzn,
      requestReeferPower,
      requestSolasVgm,
      currency: activeCurrency,
    });
  }, [
    selectedContainerType,
    selectedCorridor,
    dwellDays,
    cargoDeclaredValueAzn,
    requestReeferPower,
    requestSolasVgm,
    activeCurrency,
  ]);

  const vgmCalculation = useMemo(() => {
    return calculateSolasVgm(selectedContainerType, cargoNetWeightKg, vgmMethod);
  }, [selectedContainerType, cargoNetWeightKg, vgmMethod]);

  const checklistEvaluation = useMemo(() => {
    return evaluateAfezChecklist(AFEZ_CHECKLIST_ITEMS, checkedItems);
  }, [checkedItems]);

  const examEvaluation = useMemo(() => {
    return gradeAfezExam(AFEZ_EXAM_QUESTIONS, userAnswers);
  }, [userAnswers]);

  // Filtered Terminals
  const filteredTerminals = useMemo(() => {
    if (!terminalSearch.trim()) return AFEZ_TERMINAL_HUBS;
    const query = terminalSearch.toLowerCase();
    return AFEZ_TERMINAL_HUBS.filter(
      (hub) =>
        hub.nameAz.toLowerCase().includes(query) ||
        hub.nameEn.toLowerCase().includes(query) ||
        hub.code.toLowerCase().includes(query) ||
        hub.locationAz.toLowerCase().includes(query) ||
        hub.customsPostName.toLowerCase().includes(query)
    );
  }, [terminalSearch]);

  // Public Registry Search
  const filteredCertificates = useMemo(() => {
    const list = currentCertificate
      ? [currentCertificate, ...MOCK_VERIFIED_AFEZ_CERTIFICATES]
      : MOCK_VERIFIED_AFEZ_CERTIFICATES;

    if (!registrySearch.trim()) return list;
    const q = registrySearch.toLowerCase();
    return list.filter(
      (c) =>
        c.certificateUid.toLowerCase().includes(q) ||
        c.containerNumber.toLowerCase().includes(q) ||
        c.carrierTruckPlate.toLowerCase().includes(q) ||
        c.driverFullName.toLowerCase().includes(q) ||
        c.destinationPort.toLowerCase().includes(q)
    );
  }, [registrySearch, currentCertificate]);

  const applyPreset = (preset: AfezVehiclePreset) => {
    setSelectedContainerType(preset.containerType);
    setSelectedCorridor(preset.corridor);
    setContainerNumber(preset.containerNumber);
    setCarrierTruckPlate(preset.truckPlate);
    setDriverFullName(preset.driverName);
    setDriverPassportFin(preset.driverFin);
    setOriginCountry(preset.originCountry);
    setDestinationPort(preset.destinationPort);
    setCargoNetWeightKg(preset.cargoNetWeightKg);
    setCargoDeclaredValueAzn(preset.cargoDeclaredValueAzn);
  };

  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    if (checkedItems.length === AFEZ_CHECKLIST_ITEMS.length) {
      setCheckedItems([]);
    } else {
      setCheckedItems(AFEZ_CHECKLIST_ITEMS.map((item) => item.id));
    }
  };

  const handleAnswerQuestion = (qId: string, optIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleGenerateCertificate = () => {
    const cert = generateAfezCertificate({
      containerNumber,
      containerType: selectedContainerType,
      carrierTruckPlate,
      driverFullName,
      driverPassportFin,
      originCountry,
      destinationPort,
      corridor: selectedCorridor,
      cargoNetWeightKg,
      cargoDeclaredValueAzn,
      vgmMethod,
    });
    setCurrentCertificate(cert);
    setActiveTab('certificate');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="afez-logistics-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 px-6 py-5 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-sky-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  AFEZ • DDLA • DGK • PORT OF BAKU
                </span>
                <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                  0% Gömrük & ƏDV Rejimi
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                Ələt Azad İqtisadi Zonası (AFEZ) Multimodal Logistika və Gömrük Portalı
              </h2>
              <p className="text-xs text-slate-400">
                Trans-Xəzər Orta Dəhliz, SOLAS VGM Konteyner Çəkisi və AFEZ-TIR-2026 Giriş-Çıxış Buraxılış Sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setActiveCurrency(cur)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeCurrency === cur
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="afez-modal-close-btn"
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {[
            { id: 'calculator', label: 'Multimodal Tarif & Vergi Qənaəti', icon: DollarSign },
            { id: 'terminals', label: 'AFEZ Terminallar & Radar', icon: MapPin },
            { id: 'telemetry', label: 'ISO 6346 & SOLAS VGM Standı', icon: Scale },
            { id: 'checklist', label: '10-Nöqtə Gömrük Yoxlanışı', icon: ShieldCheck },
            { id: 'exam', label: 'Multimodal Nəqliyyat İmtahanı', icon: HelpCircle },
            { id: 'certificate', label: 'AFEZ-TIR-2026 Sertifikatı & Reyestr', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AfezTab)}
                data-testid={`afez-tab-${tab.id}`}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Hazır Konteyner və Multimodal Marşrut Nümunələri
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {AFEZ_VEHICLE_PRESETS.map((p) => {
                    const isSelected = containerNumber === p.containerNumber;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-white text-xs truncate">{p.containerNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400">
                            {p.truckPlate}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{p.titleAz}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{p.originCountry.split(' ')[0]} ➔ {p.destinationPort.split(' ')[0]}</span>
                          <span className="text-emerald-400 font-semibold">{p.assignedBay}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Config & Calculation Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Config (7 cols) */}
                <div className="lg:col-span-7 space-y-5 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Konteyner və Dəhliz Parametrlərinin Tənzimlənməsi
                  </h3>

                  {/* Container Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Konteyner Növü və ISO 6346 Qabarit Standartı
                    </label>
                    <select
                      value={selectedContainerType}
                      onChange={(e) => setSelectedContainerType(e.target.value as ContainerType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {Object.values(CONTAINER_SPECS).map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.nameAz} ({spec.isoCode} • {spec.teuValue} TEU • Tare: {spec.tareWeightKg} kq)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Multimodal Corridor */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Multimodal Nəqliyyat Dəhlizi və Daşıma Marşrutu
                    </label>
                    <select
                      value={selectedCorridor}
                      onChange={(e) => setSelectedCorridor(e.target.value as MultimodalCorridor)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {Object.values(MULTIMODAL_CORRIDORS).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameAz} ({c.code} • ~{c.averageTransitDays} gün)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>AFEZ Saxlanc Müddəti:</span>
                        <span className="font-bold text-white">{dwellDays} gün</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="45"
                        value={dwellDays}
                        onChange={(e) => setDwellDays(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">
                        (İlk {AFEZ_CONCESSIONS.freeBondedStorageDays} gün ödənişsizdir)
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Yükün Bəyan Olunmuş Dəyəri:</span>
                        <span className="font-bold text-emerald-400">
                          {formatAfezCurrency(cargoDeclaredValueAzn, 'AZN')}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10000"
                        max="1000000"
                        step="10000"
                        value={cargoDeclaredValueAzn}
                        onChange={(e) => setCargoDeclaredValueAzn(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500">
                        (0% ƏDV və 0% Gömrük qənaəti hesabı üçün)
                      </span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={requestSolasVgm}
                        onChange={(e) => setRequestSolasVgm(e.target.checked)}
                        className="w-4 h-4 text-emerald-500 rounded focus:ring-0 accent-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">SOLAS VGM Rəsmi Tərəzi</span>
                        <span className="text-[10px] text-slate-400">+20 ₼ Sertifikatlı Tərəzi Çəkisi</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={requestReeferPower}
                        onChange={(e) => setRequestReeferPower(e.target.checked)}
                        disabled={!CONTAINER_SPECS[selectedContainerType].isReefer}
                        className="w-4 h-4 text-emerald-500 rounded focus:ring-0 accent-emerald-500 disabled:opacity-30"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">380V Shore-Power Soyutma</span>
                        <span className="text-[10px] text-slate-400">
                          {CONTAINER_SPECS[selectedContainerType].isReefer
                            ? '+25 ₼/günlü elektrik xidməti'
                            : 'Yalnız refrijerator üçün keçərlidir'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Right Results & Savings (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Fiscal Savings Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        AFEZ 0% Vergi və Gömrük Qənaəti
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                        100% AZADOLMA
                      </span>
                    </div>

                    <div className="text-3xl font-black text-white">
                      {formatAfezCurrency(tariffCalculation.convertedTotalFiscalSavings, activeCurrency)}
                    </div>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-emerald-500/20 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Standart 15% Gömrük Rüsumu Qənaəti:</span>
                        <span className="font-semibold text-emerald-300">
                          {formatAfezCurrency(tariffCalculation.standardCustomsDutySavedAzn * (activeCurrency === 'USD' ? 0.5882 : activeCurrency === 'EUR' ? 0.5435 : 1), activeCurrency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Standart 18% ƏDV Qənaəti:</span>
                        <span className="font-semibold text-emerald-300">
                          {formatAfezCurrency(tariffCalculation.standardVatSavedAzn * (activeCurrency === 'USD' ? 0.5882 : activeCurrency === 'EUR' ? 0.5435 : 1), activeCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Handling Cost Card */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Terminal və Logistika Xərci
                      </span>
                      <span className="text-xs font-mono text-cyan-400">
                        {tariffCalculation.containerSpec.isoCode} ({tariffCalculation.containerSpec.teuValue} TEU)
                      </span>
                    </div>

                    <div className="text-2xl font-black text-emerald-400">
                      {formatAfezCurrency(tariffCalculation.convertedTotalOperationalCost, activeCurrency)}
                    </div>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800 text-slate-400">
                      <div className="flex justify-between">
                        <span>Aşırılma (Lo-Lo / Reach Stacker):</span>
                        <span className="text-white font-medium">
                          {formatAfezCurrency(tariffCalculation.liftOnLiftOffCostAzn, 'AZN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dəhliz Daşıma Fraxtı:</span>
                        <span className="text-white font-medium">
                          {formatAfezCurrency(tariffCalculation.freightCostAzn, 'AZN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gömrük Anbarı Saxlanc ({dwellDays} gün):</span>
                        <span className="text-white font-medium">
                          {tariffCalculation.billableDwellDays > 0
                            ? formatAfezCurrency(tariffCalculation.storageDemurrageCostAzn, 'AZN')
                            : '0.00 ₼ (14 gün pulsuz)'}
                        </span>
                      </div>
                      {tariffCalculation.reeferShorePowerCostAzn > 0 && (
                        <div className="flex justify-between text-cyan-300">
                          <span>Reefer Shore-Power:</span>
                          <span className="font-medium">
                            {formatAfezCurrency(tariffCalculation.reeferShorePowerCostAzn, 'AZN')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>VGM Tərəzi & RFID Plomb:</span>
                        <span className="text-white font-medium">
                          {formatAfezCurrency(
                            tariffCalculation.solasVgmCostAzn + tariffCalculation.rfidBarrierSecurityFeeAzn,
                            'AZN'
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>DGK Elektron Bəyannamə (Bir Pəncərə):</span>
                        <span className="text-white font-medium">
                          {formatAfezCurrency(tariffCalculation.dgkCustomsBondedProcessingAzn, 'AZN')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('certificate')}
                      className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Sertifikat və Gate-Pass Sənədinə Keç</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TERMINALS & RADAR */}
          {activeTab === 'terminals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={terminalSearch}
                    onChange={(e) => setTerminalSearch(e.target.value)}
                    placeholder="Terminal adı, kod, rayon və ya gömrük postu üzrə axtar..."
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Ümumi: <span className="font-bold text-white">{filteredTerminals.length}</span> Strateji Hub
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTerminals.map((hub) => {
                  const isSelected = selectedTerminal.id === hub.id;
                  return (
                    <div
                      key={hub.id}
                      onClick={() => setSelectedTerminal(hub)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400">
                            {hub.code}
                          </span>
                          <span className="text-[11px] font-semibold text-cyan-400">
                            {hub.occupancyPercent}% Doluluq
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm leading-snug">{hub.nameAz}</h4>
                        <p className="text-xs text-slate-400 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>{hub.locationAz}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Tutumu:</span>
                            <span className="font-bold text-white">
                              {hub.currentOccupiedTeu.toLocaleString()} / {hub.totalCapacityTeu.toLocaleString()} TEU
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                              style={{ width: `${hub.occupancyPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                          <div>
                            Reach Stacker: <span className="font-semibold text-white">{hub.activeReachStackers} ədəd</span>
                          </div>
                          <div>
                            STS Kranlar: <span className="font-semibold text-white">{hub.stsGantryCranes} ədəd</span>
                          </div>
                          <div>
                            Reefer Yuvaları: <span className="font-semibold text-white">{hub.reeferPlugsAvailable} ədəd</span>
                          </div>
                          <div>
                            Dəmiryol: <span className="font-semibold text-emerald-400">{hub.railSpurConnected ? 'Mövcuddur' : 'Yoxdur'}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {hub.tagsAz.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-900 text-slate-300 border border-slate-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ISO 6346 & SOLAS VGM STAND */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Telemetry Controls */}
                <div className="lg:col-span-6 space-y-5 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    SOLAS Chapter VI Reg 2 - Yoxlanılmış Ümumi Kütlə (VGM) Standı
                  </h3>

                  {/* Weighing Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      VGM Təsdiqləmə Metodu
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setVgmMethod('METHOD_1_WEIGHBRIDGE')}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          vgmMethod === 'METHOD_1_WEIGHBRIDGE'
                            ? 'bg-emerald-500/20 border-emerald-500 text-white font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-white mb-0.5">Metod 1 (Avtotərəzi)</div>
                        <div className="text-[10px] text-slate-400">Yüklənmiş konteynerin bütöv çəkilməsi</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVgmMethod('METHOD_2_CALCULATED')}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          vgmMethod === 'METHOD_2_CALCULATED'
                            ? 'bg-emerald-500/20 border-emerald-500 text-white font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-white mb-0.5">Metod 2 (Hesablama)</div>
                        <div className="text-[10px] text-slate-400">Bağlamaların cəmi + Tare çəkisi</div>
                      </button>
                    </div>
                  </div>

                  {/* Cargo Net Weight */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Xalis Yük Çəkisi (Net Cargo Payload):</span>
                      <span className="font-bold text-white">{cargoNetWeightKg.toLocaleString()} kq</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="34000"
                      step="200"
                      value={cargoNetWeightKg}
                      onChange={(e) => setCargoNetWeightKg(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Min: 1 000 kq</span>
                      <span>Maksimum İcazə: {CONTAINER_SPECS[selectedContainerType].maxPayloadKg.toLocaleString()} kq</span>
                    </div>
                  </div>

                  {/* CSC Plate Specs */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                      <Barcode className="w-4 h-4 text-cyan-400" />
                      CSC 1972 Konteyner Təhlükəsizlik Lövhəsi (ACEP Reyestri)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>Konteyner Nömrəsi: <span className="font-mono text-white font-bold">{containerNumber}</span></div>
                      <div>ISO Ölçü Kodu: <span className="font-mono text-white font-bold">{vgmCalculation.containerIso}</span></div>
                      <div>Tare (Boş Çəki): <span className="text-white font-semibold">{vgmCalculation.tareWeightKg} kq</span></div>
                      <div>Maksimum Brutto: <span className="text-white font-semibold">{vgmCalculation.maxGrossPermissibleKg} kq</span></div>
                    </div>
                  </div>
                </div>

                {/* Right Telemetry Gauge */}
                <div className="lg:col-span-6 space-y-4">
                  <div
                    className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
                      vgmCalculation.isOverloaded
                        ? 'bg-rose-950/30 border-rose-500/60 shadow-xl shadow-rose-500/10'
                        : 'bg-emerald-950/30 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-emerald-400" />
                        SOLAS VGM Telemetriya Nəticəsi
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          vgmCalculation.isOverloaded
                            ? 'bg-rose-500 text-white'
                            : 'bg-emerald-500 text-slate-950'
                        }`}
                      >
                        {vgmCalculation.isOverloaded ? 'QADAĞANDIR' : 'TƏSDİQLƏNDİ'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-slate-400">Yoxlanılmış Ümumi Kütlə (VGM):</span>
                      <div className="text-4xl font-black text-white">
                        {vgmCalculation.verifiedGrossMassKg.toLocaleString()} <span className="text-lg font-bold text-slate-400">kq</span>
                      </div>
                      <p className={`text-xs font-semibold ${vgmCalculation.isOverloaded ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {vgmCalculation.statusAz}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tərəzi İdentifikatoru:</span>
                        <span className="font-mono text-cyan-400">{vgmCalculation.weighbridgeScaleId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tərəzi Dəqiqlik Dərəcəsi:</span>
                        <span className="font-bold text-white">{vgmCalculation.scaleAccuracyPercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">VGM Sertifikat Qeydiyyat Nömrəsi:</span>
                        <span className="font-mono text-emerald-300 font-bold">{vgmCalculation.vgmCertificateUid}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      AFEZ Gömrük & Təhlükəsizlik Buraxılış Audit Balı:
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        checklistEvaluation.isEligibleForClearance
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {checklistEvaluation.scorePercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{checklistEvaluation.verdictAz}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {checkedItems.length === AFEZ_CHECKLIST_ITEMS.length ? 'Hamısını Sil' : 'Hamısını Seç'}
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AFEZ_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 text-slate-950'
                            : 'border border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-bold text-white text-xs leading-snug">{item.titleAz}</h5>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400 shrink-0">
                            +{item.weight} b
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{item.descriptionAz}</p>
                        <span className="text-[10px] text-emerald-400/80 font-mono block pt-0.5">
                          {item.legalArticle}
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    AFEZ & Multimodal Logistika Qaydaları üzrə Nəzəri Test
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cavablandırılıb: {Object.keys(userAnswers).length} / {AFEZ_EXAM_QUESTIONS.length} sual (Keçid balı: 80%)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExamResults(!showExamResults)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
                  >
                    {showExamResults ? 'Nəticəni Gizlət' : 'Nəticəni Yoxla'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswers({});
                      setShowExamResults(false);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Cavabları sıfırla"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exam Results Banner */}
              {showExamResults && (
                <div
                  className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                    examEvaluation.passed
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500 text-rose-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-base font-black text-white flex items-center gap-2">
                      {examEvaluation.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                      )}
                      <span>{examEvaluation.passed ? 'İMTAHANDAN KEÇDİNİZ!' : 'İMTAHANDAN KƏSİLDİNİZ'}</span>
                    </div>
                    <p className="text-xs">{examEvaluation.feedbackAz}</p>
                  </div>
                  <div className="text-3xl font-black text-white">
                    {examEvaluation.scorePercentage}%
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {AFEZ_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedOpt = userAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {idx + 1}. {q.questionAz}
                        </h4>
                        {showExamResults && isAnswered && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {isCorrect ? 'Düzgün' : 'Səhv'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                          if (showExamResults) {
                            if (optIdx === q.correctAnswerIndex) {
                              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-300';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-500 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswerQuestion(q.id, optIdx)}
                              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showExamResults && (
                        <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80 space-y-1">
                          <p><strong className="text-slate-300">İzahat:</strong> {q.explanationAz}</p>
                          <span className="text-[10px] text-cyan-400 font-mono">{q.legalCitation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Certificate Details Form */}
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    AFEZ-TIR-2026 Rəsmi Giriş-Çıxış Buraxılış Talonunun Tərtibi
                  </h3>
                  <button
                    type="button"
                    onClick={handleGenerateCertificate}
                    data-testid="generate-afez-certificate-btn"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
                  >
                    Yeni Sertifikat Tərtib Et
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Konteyner Nömrəsi (ISO 6346)
                    </label>
                    <input
                      type="text"
                      value={containerNumber}
                      onChange={(e) => setContainerNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      TIR Nəqliyyat Nömrəsi
                    </label>
                    <input
                      type="text"
                      value={carrierTruckPlate}
                      onChange={(e) => setCarrierTruckPlate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Sürücünün S.A.A.
                    </label>
                    <input
                      type="text"
                      value={driverFullName}
                      onChange={(e) => setDriverFullName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Sürücü FİN Kodu
                    </label>
                    <input
                      type="text"
                      value={driverPassportFin}
                      onChange={(e) => setDriverPassportFin(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Yola Düşmə Ölkəsi / Limanı
                    </label>
                    <input
                      type="text"
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Təyinat Limanı / Şəhəri
                    </label>
                    <input
                      type="text"
                      value={destinationPort}
                      onChange={(e) => setDestinationPort(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Active Certificate Preview */}
              {currentCertificate && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-2 border-emerald-500/50 shadow-2xl space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                        RƏSMİ BURAXILIŞ TALONU • AFEZ-TIR-2026
                      </span>
                      <h3 className="text-xl font-black text-white mt-1">
                        {currentCertificate.certificateUid}
                      </h3>
                      <p className="text-xs text-emerald-300 font-mono">
                        SİMA UID: {currentCertificate.simaDigitalUid}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(currentCertificate.certificateUid)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Çap Et</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Konteyner:</span>
                      <span className="font-mono font-bold text-white text-sm">{currentCertificate.containerNumber}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Daşıyıcı TIR:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{currentCertificate.carrierTruckPlate}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">VGM Kütlə:</span>
                      <span className="font-bold text-white text-sm">{currentCertificate.verifiedGrossMassKg.toLocaleString()} kq</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Təyin Olunmuş Bay:</span>
                      <span className="font-bold text-cyan-400 text-sm">{currentCertificate.assignedYardBay}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="truncate">SHA-256 Həş: {currentCertificate.sha256VerificationHash}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      STATUS: AKTİV TƏSDİQLƏNDİ
                    </span>
                  </div>
                </div>
              )}

              {/* Public Registry Search */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400" />
                    Vahid İctimai AFEZ-TIR Elektron Reyestri
                  </h4>
                  <div className="relative w-full sm:w-80">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      placeholder="Sertifikat nömrəsi və ya konteyner nömrəsi..."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Sertifikat UID</th>
                        <th className="py-3 px-4">Konteyner</th>
                        <th className="py-3 px-4">TIR Nömrəsi</th>
                        <th className="py-3 px-4">Sürücü</th>
                        <th className="py-3 px-4">VGM Kütlə</th>
                        <th className="py-3 px-4">Vergi Qənaəti</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {filteredCertificates.map((c) => (
                        <tr key={c.certificateUid} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-emerald-400">{c.certificateUid}</td>
                          <td className="py-2.5 px-4 text-white font-semibold">{c.containerNumber}</td>
                          <td className="py-2.5 px-4 text-cyan-300">{c.carrierTruckPlate}</td>
                          <td className="py-2.5 px-4 font-sans text-slate-300">{c.driverFullName}</td>
                          <td className="py-2.5 px-4 text-white">{c.verifiedGrossMassKg.toLocaleString()} kq</td>
                          <td className="py-2.5 px-4 text-emerald-300 font-bold">
                            {formatAfezCurrency(c.totalFiscalSavingsAzn, 'AZN')}
                          </td>
                          <td className="py-2.5 px-4 font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                              {c.status}
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
