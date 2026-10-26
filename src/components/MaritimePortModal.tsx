import React, { useState, useMemo } from 'react';
import {
  Ship,
  Anchor,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Gauge,
  Wind,
  Award,
  FileText,
  Printer,
  Copy,
  Check,
  ChevronRight,
  Sliders,
  AlertOctagon,
  Info,
  Compass,
  Navigation,
  Waves,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  PortVehicleCategory,
  CabinTier,
  FerryRouteCode,
  MaritimeWeatherSeaState,
  LinearMeterCalculation,
  MaritimeChecklistItem,
  MaritimeBoardingPass,
  MaritimeVehiclePreset,
  calculateMaritimeFreight,
  evaluateMaritimeSeaState,
  evaluateMaritimeChecklist,
  evaluateMaritimeExam,
  generateMaritimeBoardingPass,
  convertAznToCurrency,
  ROUTE_METADATA,
  CATEGORY_LABELS,
  CABIN_METADATA,
} from '../utils/maritimePortCompliance';
import {
  MOCK_PORT_FACILITIES,
  MOCK_CASPIAN_VESSELS,
  MOCK_PORT_VEHICLE_PRESETS,
  MOCK_MARITIME_CHECKLIST,
  MOCK_MARITIME_EXAM_QUESTIONS,
  MOCK_ACTIVE_BOARDING_PASSES,
} from '../data/mockMaritimePortData';

interface MaritimePortModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialVehicle?: Vehicle | null;
}

type TabType = 'calculator' | 'ports' | 'weather' | 'checklist' | 'exam' | 'boarding_pass' | 'registry';

export const MaritimePortModal: React.FC<MaritimePortModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialVehicle,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  // Calculator State
  const [selectedCategory, setSelectedCategory] = useState<PortVehicleCategory>(() => {
    if (initialVehicle?.fuelType === 'electric') return 'electric_vehicle';
    if (initialVehicle?.bodyType === 'suv') return 'suv_crossover';
    if (initialVehicle?.bodyType === 'minivan') return 'minibus_van';
    return 'sedan_compact';
  });
  const [selectedRoute, setSelectedRoute] = useState<FerryRouteCode>('ALAT_AKTAU');
  const [vehicleLengthM, setVehicleLengthM] = useState<number>(4.8);
  const [vehicleWidthM, setVehicleWidthM] = useState<number>(1.9);
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [cabinTier, setCabinTier] = useState<CabinTier>('deck_seat');
  const [isHazardousImdg, setIsHazardousImdg] = useState<boolean>(false);
  const [isElectricVehicle, setIsElectricVehicle] = useState<boolean>(
    initialVehicle?.fuelType === 'electric'
  );

  // Weather / Lashing Stand State
  const [beaufortScale, setBeaufortScale] = useState<number>(3);
  const [shipRollAngleDeg, setShipRollAngleDeg] = useState<number>(6);

  // Checklist State
  const [checklistItems, setChecklistItems] = useState<MaritimeChecklistItem[]>(MOCK_MARITIME_CHECKLIST);

  // Exam State
  const [userExamAnswers, setUserExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Boarding Pass Generator State
  const [driverFullName, setDriverFullName] = useState<string>('Namiq S. Əsədov');
  const [driverFin, setDriverFin] = useState<string>('5X9M2L4');
  const [plateNumber, setPlateNumber] = useState<string>(
    initialVehicle ? '10-AA-100' : '99-AB-123'
  );
  const [vinNumber, setVinNumber] = useState<string>(
    initialVehicle?.vin || 'JTMHZ01A204918231'
  );
  const [vehicleName, setVehicleName] = useState<string>(
    initialVehicle ? `${initialVehicle.make} ${initialVehicle.model}` : 'Toyota Land Cruiser 300'
  );
  const [selectedVesselName, setSelectedVesselName] = useState<string>('«Zərifə Əliyeva» Ro-Pax');
  const [generatedPass, setGeneratedPass] = useState<MaritimeBoardingPass | null>(null);

  // Public Registry Search
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [activePassesList, setActivePassesList] = useState<MaritimeBoardingPass[]>(
    MOCK_ACTIVE_BOARDING_PASSES
  );

  // UI helpers
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [portFilter, setPortFilter] = useState<'all' | 'azerbaijan' | 'caspian'>('all');

  // Freight Calculation result
  const freightCalc: LinearMeterCalculation = useMemo(() => {
    return calculateMaritimeFreight({
      vehicleLengthM,
      vehicleWidthM,
      vehicleCategory: selectedCategory,
      passengerCount,
      cabinTier,
      routeCode: selectedRoute,
      isHazardousImdg,
      isElectricVehicle,
      currency,
    });
  }, [
    vehicleLengthM,
    vehicleWidthM,
    selectedCategory,
    passengerCount,
    cabinTier,
    selectedRoute,
    isHazardousImdg,
    isElectricVehicle,
    currency,
  ]);

  // Weather Sea State result
  const seaState: MaritimeWeatherSeaState = useMemo(() => {
    return evaluateMaritimeSeaState(beaufortScale, shipRollAngleDeg);
  }, [beaufortScale, shipRollAngleDeg]);

  // Checklist score result
  const checklistScore = useMemo(() => {
    return evaluateMaritimeChecklist(checklistItems);
  }, [checklistItems]);

  // Exam score result
  const examResult = useMemo(() => {
    return evaluateMaritimeExam(userExamAnswers, MOCK_MARITIME_EXAM_QUESTIONS);
  }, [userExamAnswers]);

  // Handle Preset Selection
  const applyPreset = (preset: MaritimeVehiclePreset) => {
    setSelectedCategory(preset.category);
    setSelectedRoute(preset.defaultRoute);
    setVehicleLengthM(preset.lengthM);
    setVehicleWidthM(preset.widthM);
    setIsHazardousImdg(preset.isHazardous);
    setIsElectricVehicle(preset.isElectric);
    setPlateNumber(preset.plateNumber);
    setVinNumber(preset.vin);
    setVehicleName(preset.name);
  };

  // Toggle checklist item
  const toggleChecklistItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  // Set all checklist items to passed
  const handleSelectAllChecklist = () => {
    setChecklistItems((prev) => prev.map((item) => ({ ...item, passed: true })));
  };

  // Handle exam option click
  const handleExamOptionSelect = (questionId: string, optionIndex: number) => {
    if (isExamSubmitted) return;
    setUserExamAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Generate Boarding Pass
  const handleGeneratePass = () => {
    const pass = generateMaritimeBoardingPass({
      plateNumber,
      vin: vinNumber,
      vehicleName,
      vehicleCategory: selectedCategory,
      driverFullName,
      driverFin,
      routeCode: selectedRoute,
      vesselName: selectedVesselName,
      cabinTier,
      totalFareAzn: freightCalc.totalPortAndFerryCostAzn,
      imdgClass: isHazardousImdg ? 'Class 3 (Yanar Mayelər)' : null,
      evSocChecked: isElectricVehicle,
    });
    setGeneratedPass(pass);
    setActivePassesList((prev) => [pass, ...prev]);
    setActiveTab('boarding_pass');
  };

  // Filtered Ports
  const filteredPorts = useMemo(() => {
    if (portFilter === 'azerbaijan') {
      return MOCK_PORT_FACILITIES.filter((p) => p.country === 'Azərbaycan');
    }
    if (portFilter === 'caspian') {
      return MOCK_PORT_FACILITIES.filter((p) => p.country !== 'Azərbaycan');
    }
    return MOCK_PORT_FACILITIES;
  }, [portFilter]);

  // Filtered Registry
  const filteredRegistry = useMemo(() => {
    const query = registrySearch.toLowerCase().trim();
    if (!query) return activePassesList;
    return activePassesList.filter(
      (pass) =>
        pass.plateNumber.toLowerCase().includes(query) ||
        pass.passId.toLowerCase().includes(query) ||
        pass.driverFullName.toLowerCase().includes(query) ||
        pass.vesselName.toLowerCase().includes(query)
    );
  }, [activePassesList, registrySearch]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      data-testid="maritime-port-modal"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Anchor className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Dövlət Dəniz və Liman Agentliyi (DDLA) & ASCO
                </h2>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Port of Baku (Ələt)
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Ro-Pax Bərə Portalı
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Xəzər Dənizi Bərə Keçidi, SOLAS/IMDG Bəndləmə Standartı & Elektron Buraxılış Vəsiqəsi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="maritime-port-close-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all cursor-pointer"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto text-xs sm:text-sm scrollbar-none">
          <button
            data-testid="tab-calculator-btn"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Bərə & Xətti Metr</span>
          </button>
          <button
            data-testid="tab-ports-btn"
            onClick={() => setActiveTab('ports')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ports'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Limanlar & Donanma</span>
          </button>
          <button
            data-testid="tab-weather-btn"
            onClick={() => setActiveTab('weather')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'weather'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Dəniz & Lashing Stendi</span>
          </button>
          <button
            data-testid="tab-checklist-btn"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Texniki Yoxlama</span>
          </button>
          <button
            data-testid="tab-exam-btn"
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'exam'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Dəniz İmtahanı</span>
          </button>
          <button
            data-testid="tab-boarding-pass-btn"
            onClick={() => setActiveTab('boarding_pass')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'boarding_pass'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Elektron Bilet</span>
          </button>
          <button
            data-testid="tab-registry-btn"
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Buraxılış Reyestri</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: FREIGHT & LINEAR METER CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6" data-testid="maritime-calculator-section">
              {/* Presets Strip */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Nümunəvi Nəqliyyat Presetləri
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_PORT_VEHICLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      data-testid={`preset-btn-${preset.id}`}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedCategory === preset.category && vehicleName === preset.name
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold line-clamp-1">{preset.name}</div>
                      <div className="text-[10px] text-cyan-400 mt-1 font-mono">{preset.plateNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{preset.lengthM}m uzunluq</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 2 cols: inputs + summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs (7 cols) */}
                <div className="lg:col-span-7 space-y-5 bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Bərə Marşrutu və Nəqliyyat Parametrləri</span>
                  </h3>

                  {/* Route Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Bərə Dəhlizi (Middle Corridor Marşrutu):
                    </label>
                    <select
                      value={selectedRoute}
                      onChange={(e) => setSelectedRoute(e.target.value as FerryRouteCode)}
                      data-testid="ferry-route-select"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {Object.entries(ROUTE_METADATA).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.name} ({info.nauticalMiles} mil, ~{info.transitHours} saat)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Nəqliyyat Vasitəsinin Kateqoriyası:
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as PortVehicleCategory)}
                      data-testid="vehicle-category-select"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                        <option key={catKey} value={catKey}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sliders: Length and Width */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">Avtomobilin Uzunluğu:</span>
                        <span className="text-cyan-400 font-bold font-mono">{vehicleLengthM} metr</span>
                      </div>
                      <input
                        type="range"
                        min="3.0"
                        max="22.0"
                        step="0.1"
                        value={vehicleLengthM}
                        onChange={(e) => setVehicleLengthM(parseFloat(e.target.value))}
                        data-testid="vehicle-length-slider"
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>3.0m</span>
                        <span>12.0m</span>
                        <span>22.0m</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">Avtomobilin Eni:</span>
                        <span className="text-cyan-400 font-bold font-mono">{vehicleWidthM} metr</span>
                      </div>
                      <input
                        type="range"
                        min="1.6"
                        max="3.2"
                        step="0.05"
                        value={vehicleWidthM}
                        onChange={(e) => setVehicleWidthM(parseFloat(e.target.value))}
                        data-testid="vehicle-width-slider"
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>1.6m</span>
                        <span>2.5m</span>
                        <span>3.2m</span>
                      </div>
                    </div>
                  </div>

                  {/* Passenger count and Cabin Tier */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Sərnişin Sayı:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={passengerCount}
                        onChange={(e) => setPassengerCount(Math.max(1, parseInt(e.target.value) || 1))}
                        data-testid="passenger-count-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Kayut / Yer Kateqoriyası:
                      </label>
                      <select
                        value={cabinTier}
                        onChange={(e) => setCabinTier(e.target.value as CabinTier)}
                        data-testid="cabin-tier-select"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        {Object.entries(CABIN_METADATA).map(([cKey, cInfo]) => (
                          <option key={cKey} value={cKey}>
                            {cInfo.label} (+{cInfo.surchargeAzn} ₼)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes: Hazardous / Electric */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={isHazardousImdg}
                        onChange={(e) => setIsHazardousImdg(e.target.checked)}
                        data-testid="hazardous-checkbox"
                        className="rounded accent-cyan-500"
                      />
                      <span>Təhlükəli Yük (IMDG +35%)</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={isElectricVehicle}
                        onChange={(e) => setIsElectricVehicle(e.target.checked)}
                        data-testid="electric-vehicle-checkbox"
                        className="rounded accent-cyan-500"
                      />
                      <span>Elektromobil (EV Batareya +20 ₼)</span>
                    </label>
                  </div>
                </div>

                {/* Calculation Summary Card (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Bərə & Liman Rüsumu</span>
                        <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
                          {freightCalc.totalConverted} {currency}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <Ship className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Breakdown items */}
                    <div className="py-3 space-y-2 text-xs border-b border-slate-800">
                      <div className="flex justify-between text-slate-300">
                        <span>Xətti metr daşıma haqqı ({freightCalc.vehicleLengthM}m × {freightCalc.linearMeterRateAzn} ₼):</span>
                        <span className="font-mono font-semibold">{freightCalc.baseFreightCostAzn} ₼</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Sərnişin biletləri ({freightCalc.passengerCount} nəfər):</span>
                        <span className="font-mono font-semibold">{freightCalc.passengerTicketTotalAzn} ₼</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Kayut tarif fərqi:</span>
                        <span className="font-mono font-semibold">{freightCalc.cabinSurchargeAzn} ₼</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>ISPS Dəniz Təhlükəsizlik Rüsumu:</span>
                        <span className="font-mono">{freightCalc.ispsSecurityFeeAzn} ₼</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Port of Baku THC (Körpü Xidməti):</span>
                        <span className="font-mono">{freightCalc.terminalHandlingFeeAzn} ₼</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>DGK Elektron Tranzit Manifesti:</span>
                        <span className="font-mono">{freightCalc.dgkManifestDutyAzn} ₼</span>
                      </div>
                      {freightCalc.hazardousSurchargeAzn > 0 && (
                        <div className="flex justify-between text-amber-400 font-semibold">
                          <span>IMDG Təhlükəli Yük Əlavəsi (+35%):</span>
                          <span className="font-mono">+{freightCalc.hazardousSurchargeAzn} ₼</span>
                        </div>
                      )}
                      {freightCalc.evBatteryHandlingFeeAzn > 0 && (
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>EV Termal İzolasiya & Yoxlama:</span>
                          <span className="font-mono">+{freightCalc.evBatteryHandlingFeeAzn} ₼</span>
                        </div>
                      )}
                    </div>

                    {/* Route Details */}
                    <div className="pt-3 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Məsafə: <strong>{freightCalc.nauticalMiles} dəniz mili</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Təxmini Səyahət Müddəti: <strong>~{freightCalc.transitTimeHours} saat</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Boarding Pass Button */}
                  <div className="pt-5">
                    <button
                      onClick={() => setActiveTab('boarding_pass')}
                      data-testid="proceed-boarding-pass-btn"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      <span>Elektron Bilet Hazırla</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PORTS & FLEET RADAR */}
          {activeTab === 'ports' && (
            <div className="space-y-6" data-testid="ports-fleet-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    <span>Xəzər Dənizi Bərə Limanları & Donanma Radarı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bakı (Ələt), Hövsan, Aktau, Kurık və Türkmənbaşı strateji dəniz limanları
                  </p>
                </div>
                {/* Filter buttons */}
                <div className="flex gap-1.5 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto text-xs">
                  <button
                    onClick={() => setPortFilter('all')}
                    data-testid="port-filter-all"
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      portFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Bütün Limanlar
                  </button>
                  <button
                    onClick={() => setPortFilter('azerbaijan')}
                    data-testid="port-filter-az"
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      portFilter === 'azerbaijan' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Azərbaycan
                  </button>
                  <button
                    onClick={() => setPortFilter('caspian')}
                    data-testid="port-filter-caspian"
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      portFilter === 'caspian' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Qarşı Sahil
                  </button>
                </div>
              </div>

              {/* Ports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPorts.map((port) => (
                  <div
                    key={port.id}
                    data-testid={`port-card-${port.id}`}
                    className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                          {port.code}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          ISPS Səviyyə {port.ispsSecurityLevel}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-2 leading-snug">{port.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{port.city}, {port.country}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Yanalma körpüləri:</span>
                        <span className="font-mono font-semibold">{port.berthCount} körpü</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Maksimum suyaoturma (Draft):</span>
                        <span className="font-mono font-semibold">{port.maxDraftMeters} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">VHF Rabitə Kanalı:</span>
                        <span className="font-mono text-cyan-300">{port.vhfChannel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bərə körpüsü uzunluğu:</span>
                        <span className="font-mono font-semibold">{port.ferryBridgeLengthM} m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ASCO Active Ferry Fleet Table */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Ship className="w-4 h-4 text-cyan-400" />
                  <span>ASCO Xəzər Ro-Pax Bərə Donanması</span>
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Gəmi Adı</th>
                        <th className="px-4 py-3">IMO №</th>
                        <th className="px-4 py-3">Tip</th>
                        <th className="px-4 py-3">TIR / Avtomobil Tutumu</th>
                        <th className="px-4 py-3">Sərnişin</th>
                        <th className="px-4 py-3">Cari Mövqe</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {MOCK_CASPIAN_VESSELS.map((vessel) => (
                        <tr key={vessel.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-sans font-bold text-white">{vessel.name}</td>
                          <td className="px-4 py-3 text-cyan-400">{vessel.imoNumber}</td>
                          <td className="px-4 py-3">{vessel.type}</td>
                          <td className="px-4 py-3">{vessel.carCapacity} vahid</td>
                          <td className="px-4 py-3">{vessel.passengerCapacity} nəfər</td>
                          <td className="px-4 py-3 font-sans text-slate-300 text-[11px]">{vessel.currentLocation}</td>
                          <td className="px-4 py-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                vessel.status === 'boarding'
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                  : vessel.status === 'in_transit'
                                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                                  : 'bg-slate-700/40 text-slate-300'
                              }`}
                            >
                              {vessel.status === 'boarding'
                                ? 'Yüklənmə'
                                : vessel.status === 'in_transit'
                                ? 'Dənizdə (Reysdə)'
                                : vessel.status === 'berthed'
                                ? 'Liman Körpüsündə'
                                : 'Qrafik Üzrə'}
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

          {/* TAB 3: WEATHER & MARITIME LASHING STAND */}
          {activeTab === 'weather' && (
            <div className="space-y-6" data-testid="weather-lashing-section">
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Waves className="w-5 h-5 text-cyan-400" />
                      <span>Xəzər Dəniz Dalğalanması & Lashing (Bəndləmə) Telemetriyası</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      IMO CSS Code, SOLAS Fəsil VI və Bofort şkalası əsasında dinamik zəncir gərilməsi simulyatoru
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                      seaState.isNavigationPermitted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${seaState.isNavigationPermitted ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`}></span>
                    <span>{seaState.isNavigationPermitted ? 'Dənizə Çıxış Açıqdır' : 'Fırtına Qadağası'}</span>
                  </div>
                </div>

                {/* Sliders: Beaufort & Ship Roll */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Bofort Şkalası (Külək & Dalğa):</span>
                      <span className="text-cyan-400 font-bold font-mono">
                        {beaufortScale} Bal ({seaState.windSpeedKnots} knots / ~{seaState.waveHeightMeters}m dalğa)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="11"
                      step="1"
                      value={beaufortScale}
                      onChange={(e) => setBeaufortScale(parseInt(e.target.value))}
                      data-testid="beaufort-slider"
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0 (Sakit)</span>
                      <span>4 (Mülayim)</span>
                      <span>7 (Girişməli)</span>
                      <span>10+ (Fırtına)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Gəmi Yellənmə Bucağı (Ship Roll Angle θ):</span>
                      <span className="text-cyan-400 font-bold font-mono">{shipRollAngleDeg}° dərəcə</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={shipRollAngleDeg}
                      onChange={(e) => setShipRollAngleDeg(parseInt(e.target.value))}
                      data-testid="ship-roll-slider"
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0°</span>
                      <span>10° (Normal)</span>
                      <span>20° (Kritik)</span>
                      <span>30° (Fövqəladə)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lashing Requirements Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs">Lashing Rejimi:</span>
                  <div className="text-sm font-bold text-white">
                    {seaState.lashingRequirement === 'standard_4point'
                      ? '4-Nöqtəli Standart Zəncir'
                      : seaState.lashingRequirement === 'reinforced_6point'
                      ? '6-Nöqtəli Gücləndirilmiş'
                      : seaState.lashingRequirement === 'heavy_8point'
                      ? '8-Nöqtəli Ağır Polad Zəncir'
                      : '12-Nöqtəli Qasırğa Zirehi'}
                  </div>
                  <span className="text-[10px] text-cyan-400 block font-mono">IMO CSS Code Annex 13</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs">Minimum Qırılma Gücü (MBL):</span>
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    ≥ {seaState.minLashingTensionKn} kN
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Hər zəncir halqası üçün</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs">Tələb Olunan Təkər Pazları:</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {seaState.chockPairsRequired} Cüt Paz ({seaState.chockPairsRequired * 2} ədəd)
                  </div>
                  <span className="text-[10px] text-slate-400 block">Ön və arxa təkər blokadası</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs">Dəniz Vəziyyəti:</span>
                  <div className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                    {seaState.seaCondition}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Dalğa hündürlüyü: {seaState.waveHeightMeters}m</span>
                </div>
              </div>

              {/* Advisory Banner */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Liman Nəzarətçisinin Rəsmi Dəniz Təlimatı:
                  </h4>
                  <p className="text-xs text-cyan-200 mt-1">{seaState.advisory}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT TECHNICAL CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="checklist-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    <span>SOLAS & IMDG 10-Bəndli Texniki Stowage Yoxlaması</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bərəyə minikdən əvvəl avtomobilin mexaniki, yanğın və dəniz təhlükəsizliyi auditi
                  </p>
                </div>
                <button
                  onClick={handleSelectAllChecklist}
                  data-testid="select-all-checklist-btn"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-all cursor-pointer self-start sm:self-auto"
                >
                  Hamısını Təsdiqlə (10/10)
                </button>
              </div>

              {/* Score strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-400 text-xs">Uyğunluq Balı:</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{checklistScore.score}%</div>
                  <span className="text-[10px] text-slate-400">{checklistScore.passCount} / 10 bənd keçib</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-400 text-xs">Qərar Dərəcəsi:</span>
                  <div className="text-sm font-bold text-white mt-1">{checklistScore.rating}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-400 text-xs">Kritik Qüsur:</span>
                  <div className={`text-sm font-bold mt-1 ${checklistScore.criticalFail ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {checklistScore.criticalFail ? 'MÖVCUDDUR' : 'Yoxdur (Təmiz)'}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-400 text-xs">İnzibati Cərimə Riski:</span>
                  <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                    {checklistScore.penaltyAzn} ₼
                  </div>
                </div>
              </div>

              {/* Verdict Notice */}
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${
                  checklistScore.passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                }`}
              >
                {checklistScore.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{checklistScore.verdict}</span>
              </div>

              {/* Checklist items list */}
              <div className="space-y-2.5">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    data-testid={`checklist-row-${item.id}`}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      item.passed
                        ? 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
                        : 'bg-rose-950/20 border-rose-900/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        {item.isCritical && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            Kritik
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{item.description}</p>
                      <span className="text-[10px] font-mono text-cyan-400 block pt-0.5">
                        {item.standardRef}
                      </span>
                    </div>

                    <button
                      type="button"
                      data-testid={`toggle-check-${item.id}`}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        item.passed
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {item.passed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL MARITIME EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="maritime-exam-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    <span>Dəniz Gəmiçiliyi & Bərə Təhlükəsizlik İmtahanı (10 Sual)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    SOLAS, CSS Code, IMDG və AR Ticarət Gəmiçiliyi Məcəlləsi test bankı (Keçid balı: 80%)
                  </p>
                </div>
                {!isExamSubmitted ? (
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    data-testid="submit-exam-btn"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer self-start sm:self-auto"
                  >
                    İmtahanı Tamamla
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsExamSubmitted(false);
                      setUserExamAnswers({});
                    }}
                    data-testid="reset-exam-btn"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer self-start sm:self-auto"
                  >
                    Yenidən Başla
                  </button>
                )}
              </div>

              {/* Exam result card when submitted */}
              {isExamSubmitted && (
                <div
                  data-testid="exam-result-banner"
                  className={`p-5 rounded-2xl border space-y-2 ${
                    examResult.passed
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold flex items-center gap-2">
                      {examResult.passed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertOctagon className="w-5 h-5 text-rose-400" />}
                      Nəticə: {examResult.passed ? 'MƏQBUL (TƏSDİQLƏNDİ)' : 'QEYRİ-MƏQBUL'}
                    </span>
                    <span className="font-mono text-lg font-black">{examResult.scorePercent}% ({examResult.correctCount}/10)</span>
                  </div>
                  <p className="text-xs text-slate-300">{examResult.feedback}</p>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-5">
                {MOCK_MARITIME_EXAM_QUESTIONS.map((q, idx) => {
                  const userAnswer = userExamAnswers[q.id];
                  const isCorrect = isExamSubmitted && userAnswer === q.correctAnswerIndex;
                  const isWrong = isExamSubmitted && userAnswer !== undefined && userAnswer !== q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      data-testid={`exam-question-${q.id}`}
                      className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                          № {idx + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-white leading-relaxed">{q.question}</h4>
                      </div>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let optStyle = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (isExamSubmitted) {
                            if (optIdx === q.correctAnswerIndex) {
                              optStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold';
                            } else if (isSelected) {
                              optStyle = 'bg-rose-500/15 border-rose-500/50 text-rose-300 font-semibold';
                            }
                          } else if (isSelected) {
                            optStyle = 'bg-cyan-500/15 border-cyan-500/60 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleExamOptionSelect(q.id, optIdx)}
                              data-testid={`opt-${q.id}-${optIdx}`}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {isExamSubmitted && optIdx === q.correctAnswerIndex && (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              {isExamSubmitted && isSelected && optIdx !== q.correctAnswerIndex && (
                                <X className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80 space-y-1">
                          <p><strong className="text-cyan-400">İzahat:</strong> {q.explanation}</p>
                          <span className="text-[10px] font-mono text-slate-500">{q.standardRef}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL ELECTRONIC BOARDING PASS */}
          {activeTab === 'boarding_pass' && (
            <div className="space-y-6" data-testid="boarding-pass-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span>Elektron Bərə Bileti & Liman Keçid Vəsiqəsi</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    DDLA, ASCO və Port of Baku rəsmi ştrix-kodlu göyərtə minik talonu
                  </p>
                </div>
                {generatedPass && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      data-testid="print-pass-btn"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-cyan-400" />
                      <span>Çap Et</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedPass.passId)}
                      data-testid="copy-pass-id-btn"
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Form to issue or re-issue pass if not created yet */}
              {!generatedPass ? (
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Bilet və Buraxılış Məlumatlarını Təsdiqləyin
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Sürücünün S.A.A.:</label>
                      <input
                        type="text"
                        value={driverFullName}
                        onChange={(e) => setDriverFullName(e.target.value)}
                        data-testid="driver-name-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Sürücü FİN Kodu:</label>
                      <input
                        type="text"
                        value={driverFin}
                        onChange={(e) => setDriverFin(e.target.value)}
                        data-testid="driver-fin-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Dövlət Qeydiyyat Nişanı:</label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        data-testid="plate-number-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Avtomobil / Marka Model:</label>
                      <input
                        type="text"
                        value={vehicleName}
                        onChange={(e) => setVehicleName(e.target.value)}
                        data-testid="vehicle-name-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Təyin Edilmiş Bərə Gəmisi:</label>
                      <select
                        value={selectedVesselName}
                        onChange={(e) => setSelectedVesselName(e.target.value)}
                        data-testid="vessel-select"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                      >
                        {MOCK_CASPIAN_VESSELS.map((v) => (
                          <option key={v.id} value={v.name}>
                            {v.name} ({v.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">VIN Şifrəsi:</label>
                      <input
                        type="text"
                        value={vinNumber}
                        onChange={(e) => setVinNumber(e.target.value)}
                        data-testid="vin-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGeneratePass}
                    data-testid="generate-pass-btn"
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Elektron Bilet və QR Talonu Formalaşdır</span>
                  </button>
                </div>
              ) : (
                /* Authentic Digital Boarding Pass Ticket */
                <div
                  data-testid="boarding-pass-ticket"
                  className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/40 shadow-2xl relative overflow-hidden space-y-6"
                >
                  {/* Decorative background anchor */}
                  <Anchor className="absolute -right-10 -bottom-10 w-64 h-64 text-cyan-500/5 pointer-events-none" />

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        <Ship className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-xs font-mono uppercase text-cyan-400 font-bold">
                          Dövlət Dəniz və Liman Agentliyi (DDLA)
                        </div>
                        <h4 className="text-base font-black text-white tracking-wide">
                          ASCO & PORT OF BAKU (ƏLƏT) CASPIAN FERRY PASS
                        </h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono">Bilet / Qeydiyyat №</span>
                      <div className="text-sm sm:text-base font-mono font-black text-cyan-400">
                        {generatedPass.passId}
                      </div>
                    </div>
                  </div>

                  {/* Flight-like layout: Origin -> Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Çıxış Limanı</span>
                      <div className="text-sm font-bold text-white mt-0.5">Bakı Beynəlxalq Limanı (Ələt)</div>
                      <span className="text-[11px] text-cyan-400 font-mono">Bərə Körpüsü № 1</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-slate-500 font-mono">Xəzər Bərə Reysi</span>
                      <div className="flex items-center gap-2 my-1 text-cyan-400">
                        <div className="w-6 h-0.5 bg-cyan-500/30"></div>
                        <Ship className="w-4 h-4 animate-pulse" />
                        <div className="w-6 h-0.5 bg-cyan-500/30"></div>
                      </div>
                      <span className="text-[10px] text-slate-400">{generatedPass.vesselName}</span>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Təyinat Limanı</span>
                      <div className="text-sm font-bold text-white mt-0.5">{generatedPass.routeName.split('—')[1]?.trim()}</div>
                      <span className="text-[11px] text-cyan-400 font-mono">Tranzit Dəhlizi</span>
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Sürücü:</span>
                      <div className="font-semibold text-white mt-0.5">{generatedPass.driverFullName}</div>
                      <span className="text-[10px] font-mono text-slate-500">FİN: {generatedPass.driverFin}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Nəqliyyat & Nömrə:</span>
                      <div className="font-semibold text-white mt-0.5">{generatedPass.vehicleName}</div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{generatedPass.plateNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Təyin Edilmiş Göyərtə:</span>
                      <div className="font-semibold text-emerald-400 mt-0.5">{generatedPass.deckLevel}</div>
                      <span className="text-[10px] font-mono text-slate-400">{generatedPass.laneNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Liman Giriş PIN Kodu:</span>
                      <div className="font-mono font-bold text-amber-400 text-sm mt-0.5">{generatedPass.gatePinCode}</div>
                      <span className="text-[10px] text-slate-500">Avtomatik Şlaqbaum</span>
                    </div>
                  </div>

                  {/* Lashing & Safety instructions on ticket */}
                  <div className="p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs space-y-1">
                    <span className="text-slate-400 font-medium">Bərkidilmə & Təhlükəsizlik Rejimi:</span>
                    <div className="font-mono text-cyan-300 font-semibold">{generatedPass.lashingSecuringType}</div>
                  </div>

                  {/* Footer with QR representation & SİMA UID */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-[11px] font-mono text-slate-400">
                        SİMA Rəqəmsal İmza: <strong className="text-white">{generatedPass.simaSignatureUid}</strong>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Təhlükəsizlik İmzası: {generatedPass.securityHash}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">Cəmi Ödəniş:</span>
                        <div className="text-lg font-mono font-black text-cyan-400">{generatedPass.totalFareAzn} ₼</div>
                      </div>
                      <button
                        onClick={() => setGeneratedPass(null)}
                        data-testid="reissue-pass-btn"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
                      >
                        Düzəliş Et
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PUBLIC BOARDING PASS REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="registry-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <span>Dövlət Dəniz və Liman Agentliyi Bərə Buraxılış Reyestri</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Qeydiyyat nişanı, bilet kodu və ya sürücü adına görə vahid dəniz bazasında axtarış
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    data-testid="registry-search-input"
                    placeholder="Qeydiyyat nömrəsi və ya bilet..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Passes List */}
              <div className="space-y-3">
                {filteredRegistry.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-800/20 rounded-2xl border border-slate-800">
                    Axtarış üzrə heç bir aktiv bərə buraxılış vəsiqəsi tapılmadı.
                  </div>
                ) : (
                  filteredRegistry.map((pass) => (
                    <div
                      key={pass.passId}
                      data-testid={`registry-item-${pass.passId}`}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400 text-xs">{pass.passId}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-white font-bold border border-slate-700">
                            {pass.plateNumber}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Təsdiqlənib
                          </span>
                        </div>
                        <div className="text-xs text-white font-semibold">{pass.vehicleName}</div>
                        <div className="text-[11px] text-slate-400">
                          {pass.driverFullName} • {pass.routeName} • {pass.vesselName}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:text-right">
                        <div>
                          <span className="text-[10px] text-slate-400">Giriş PIN:</span>
                          <div className="font-mono font-bold text-amber-400 text-xs">{pass.gatePinCode}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400">Məbləğ:</span>
                          <div className="font-mono font-black text-cyan-400 text-xs">{pass.totalFareAzn} ₼</div>
                        </div>
                        <button
                          onClick={() => {
                            setGeneratedPass(pass);
                            setActiveTab('boarding_pass');
                          }}
                          data-testid={`view-pass-${pass.passId}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                        >
                          Biletə Bax
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
