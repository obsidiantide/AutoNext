import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  Plane,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Copy,
  Printer,
  Search,
  Scale,
  Thermometer,
  Layers,
  FileText,
  MapPin,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Info,
  Radio,
  Zap,
} from 'lucide-react';
import {
  Currency,
  AviationCargoHubId,
  AviationCargoClass,
  UldType,
  FreighterAircraftType,
  AVIATION_CARGO_CLASS_INFO,
  ULD_TYPE_INFO,
  FREIGHTER_AIRCRAFT_INFO,
  calculateAirCargoTariff,
  evaluateCargoSecurityScreening,
  issueAirCargoVoucher,
  AirCargoTransitVoucher,
  formatCurrency,
} from '../utils/airCargoCompliance';
import {
  MOCK_AVIATION_CARGO_HUBS,
  MOCK_ACTIVE_FREIGHTER_FLIGHTS,
  MOCK_CARGO_PRESETS,
  MOCK_AIR_CARGO_CHECKLIST,
  MOCK_AIR_CARGO_LAW_EXAM,
  MOCK_AIR_CARGO_REGISTRY,
} from '../data/mockAirCargoData';
import { Vehicle } from '../types/vehicle';

interface AirCargoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

type TabType =
  | 'radar'
  | 'calculator'
  | 'screening'
  | 'telemetry'
  | 'checklist'
  | 'exam'
  | 'voucher'
  | 'registry';

export const AirCargoModal: React.FC<AirCargoModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Hub Radar State
  const [selectedHubId, setSelectedHubId] = useState<AviationCargoHubId>('HUB_GYD');
  const [searchHub, setSearchHub] = useState('');

  // Calculator State
  const [originHubId, setOriginHubId] = useState<AviationCargoHubId>('HUB_GYD');
  const [destinationAirportCode, setDestinationAirportCode] = useState('FRA / EDDF');
  const [flightNumber, setFlightNumber] = useState('7L 774');
  const [cargoClass, setCargoClass] = useState<AviationCargoClass>('PERISHABLE_COLD_CHAIN');
  const [uldType, setUldType] = useState<UldType>('RAP_COOL_ULD');
  const [freighterType, setFreighterType] = useState<FreighterAircraftType>('B777F');
  const [actualGrossWeightKg, setActualGrossWeightKg] = useState(4200);
  const [lengthCm, setLengthCm] = useState(318);
  const [widthCm, setWidthCm] = useState(244);
  const [heightCm, setHeightCm] = useState(163);
  const [piecesCount, setPiecesCount] = useState(1);
  const [rfsTruckPlate, setRfsTruckPlate] = useState(targetCar?.plateNumber || '99-AC-101');
  const [rfsDistanceKm, setRfsDistanceKm] = useState(45);
  const [carrierEnterprise, setCarrierEnterprise] = useState('Silk Way West Airlines QSC');
  const [shipperName, setShipperName] = useState('AzərPharma Biosintez QSC (Sumqayıt Kimya Parkı)');
  const [consigneeName, setConsigneeName] = useState('BioNTech SE Healthcare Logistics Mainz');
  const [isKnownConsignor, setIsKnownConsignor] = useState(true);
  const [isExportTransit, setIsExportTransit] = useState(true);
  const [isPriorityAog, setIsPriorityAog] = useState(false);

  // Screening Stand State
  const [xrayDensityPassed, setXrayDensityPassed] = useState(true);
  const [etdTraceDetected, setEtdTraceDetected] = useState(false);
  const [k9CanineCleared, setK9CanineCleared] = useState(true);
  const [lithiumBatteryCompliant, setLithiumBatteryCompliant] = useState(true);
  const [knownConsignorValid, setKnownConsignorValid] = useState(true);
  const [tamperSealIntact, setTamperSealIntact] = useState(true);

  // Telemetry Stand State
  const [tempTargetTier, setTempTargetTier] = useState<'+2_TO_+8' | '-20' | '+15_TO_+25'>('+2_TO_+8');
  const [batterySocPercent, setBatterySocPercent] = useState(88);
  const [rollerBedLocked, setRollerBedLocked] = useState(true);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    CHK_AIR_01: true,
    CHK_AIR_02: true,
    CHK_AIR_03: true,
    CHK_AIR_04: true,
    CHK_AIR_05: true,
    CHK_AIR_08: true,
    CHK_AIR_09: true,
    CHK_AIR_10: true,
  });

  // Exam State
  const [userExamAnswers, setUserExamAnswers] = useState<Record<number, number>>({});
  const [showExamResults, setShowExamResults] = useState(false);

  // Voucher & Registry State
  const [currentVoucher, setCurrentVoucher] = useState<AirCargoTransitVoucher | null>(null);
  const [registryList, setRegistryList] = useState<AirCargoTransitVoucher[]>(MOCK_AIR_CARGO_REGISTRY);
  const [searchRegistry, setSearchRegistry] = useState('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Selected Hub Details
  const selectedHub = useMemo(
    () => MOCK_AVIATION_CARGO_HUBS.find((h) => h.id === selectedHubId) || MOCK_AVIATION_CARGO_HUBS[0],
    [selectedHubId]
  );

  // Filtered Hubs
  const filteredHubs = useMemo(() => {
    return MOCK_AVIATION_CARGO_HUBS.filter(
      (h) =>
        h.nameAz.toLowerCase().includes(searchHub.toLowerCase()) ||
        h.iataCode.toLowerCase().includes(searchHub.toLowerCase()) ||
        h.locationCity.toLowerCase().includes(searchHub.toLowerCase())
    );
  }, [searchHub]);

  // Tariff Breakdown
  const tariffBreakdown = useMemo(() => {
    return calculateAirCargoTariff({
      originHubId,
      destinationAirportCode,
      cargoClass,
      uldType,
      actualGrossWeightKg,
      lengthCm,
      widthCm,
      heightCm,
      piecesCount,
      rfsDistanceKm,
      isKnownConsignor,
      isExportTransit,
      isPriorityAog,
    });
  }, [
    originHubId,
    destinationAirportCode,
    cargoClass,
    uldType,
    actualGrossWeightKg,
    lengthCm,
    widthCm,
    heightCm,
    piecesCount,
    rfsDistanceKm,
    isKnownConsignor,
    isExportTransit,
    isPriorityAog,
  ]);

  // Screening Evaluation
  const screeningResult = useMemo(() => {
    return evaluateCargoSecurityScreening({
      xrayDensityPassed,
      etdTraceDetected,
      k9CanineCleared,
      lithiumBatteryCompliant,
      knownConsignorValid,
      tamperSealIntact,
    });
  }, [
    xrayDensityPassed,
    etdTraceDetected,
    k9CanineCleared,
    lithiumBatteryCompliant,
    knownConsignorValid,
    tamperSealIntact,
  ]);

  // Checklist Calculations
  const checklistScore = useMemo(() => {
    let score = 0;
    MOCK_AIR_CARGO_CHECKLIST.forEach((item) => {
      if (checkedItems[item.id]) {
        score += item.weightScore;
      }
    });
    return score;
  }, [checkedItems]);

  const checklistPenaltyAzn = useMemo(() => {
    let penalty = 0;
    MOCK_AIR_CARGO_CHECKLIST.forEach((item) => {
      if (!checkedItems[item.id]) {
        penalty += item.fineAzn;
      }
    });
    return penalty;
  }, [checkedItems]);

  // Exam Score
  const examScore = useMemo(() => {
    let correctCount = 0;
    MOCK_AIR_CARGO_LAW_EXAM.forEach((q) => {
      if (userExamAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });
    return correctCount;
  }, [userExamAnswers]);

  // Filtered Registry
  const filteredRegistry = useMemo(() => {
    return registryList.filter(
      (v) =>
        v.voucherId.toLowerCase().includes(searchRegistry.toLowerCase()) ||
        v.awbNumber.toLowerCase().includes(searchRegistry.toLowerCase()) ||
        v.flightNumber.toLowerCase().includes(searchRegistry.toLowerCase()) ||
        v.rfsTruckPlate.toLowerCase().includes(searchRegistry.toLowerCase()) ||
        v.shipperName.toLowerCase().includes(searchRegistry.toLowerCase())
    );
  }, [registryList, searchRegistry]);

  // Apply Preset
  const handleApplyPreset = (preset: (typeof MOCK_CARGO_PRESETS)[0]) => {
    setCargoClass(preset.cargoClass);
    setUldType(preset.uldType);
    setFreighterType(preset.freighterType);
    setOriginHubId(preset.originHubId);
    setDestinationAirportCode(preset.destinationAirportCode);
    setFlightNumber(preset.flightNumber);
    setActualGrossWeightKg(preset.actualGrossWeightKg);
    setLengthCm(preset.lengthCm);
    setWidthCm(preset.widthCm);
    setHeightCm(preset.heightCm);
    setPiecesCount(preset.piecesCount);
    setRfsTruckPlate(preset.rfsTruckPlate);
    setRfsDistanceKm(preset.rfsDistanceKm);
    setShipperName(preset.shipperName);
    setConsigneeName(preset.consigneeName);
    setIsKnownConsignor(preset.isKnownConsignor);
    setIsExportTransit(preset.isExportTransit);
    setIsPriorityAog(preset.isPriorityAog);
  };

  // Generate Voucher
  const handleGenerateVoucher = () => {
    const newVoucher = issueAirCargoVoucher({
      originHubId,
      destinationAirportCode,
      flightNumber,
      freighterType,
      cargoClass,
      uldType,
      actualGrossWeightKg,
      lengthCm,
      widthCm,
      heightCm,
      rfsTruckPlate,
      carrierEnterprise,
      shipperName,
      consigneeName,
      rfsDistanceKm,
      isExportTransit,
      isPriorityAog,
      awbPrefix: cargoClass === 'EXPRESS_COURIER_AOG' ? '077' : '463',
    });

    setCurrentVoucher(newVoucher);
    setRegistryList((prev) => [newVoucher, ...prev]);
    setActiveTab('voucher');
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNotification(label);
      setTimeout(() => setCopiedNotification(null), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-950 text-white border-b border-sky-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/20 border border-sky-400/30 rounded-xl shadow-inner">
              <Plane className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-sky-500/30 text-sky-200 rounded border border-sky-400/40">
                  DDAA / DMAA • AZAL • SILK WAY WEST
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-emerald-500/30 text-emerald-300 rounded border border-emerald-400/40">
                  ICAO ANNEX 17 & IATA DGR
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Dövlət Mülki Aviasiya Agentliyi (DDAA) & Silk Way West Hava-Yol Karqo Portalı</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    currency === cur
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {cur === 'AZN' ? '₼ AZN' : cur === 'USD' ? '$ USD' : '€ EUR'}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-6 overflow-x-auto text-sm font-medium">
          {[
            { id: 'radar', label: 'Hava Limanı Karqo Radarı', icon: Radio },
            { id: 'calculator', label: 'Avia-Tarif & Həcm Kalkulyatoru', icon: Scale },
            { id: 'screening', label: 'ICAO Annex 17 & DGR Standı', icon: Shield },
            { id: 'telemetry', label: 'Apron & Soyuq Zəncir', icon: Thermometer },
            { id: 'checklist', label: '10-Bəndlik Təhlükəsizlik', icon: CheckCircle2 },
            { id: 'exam', label: 'Aviasiya Qanunvericilik İmtahanı', icon: HelpCircle },
            { id: 'voucher', label: 'Elektron Uçuş Buraxılış Vərəqəsi', icon: QrCode },
            { id: 'registry', label: 'Dövlət Karqo Reyestri', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 py-3.5 px-4 border-b-2 font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {copiedNotification && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{copiedNotification} buferə kopyalandı!</span>
            </div>
          )}

          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sky-50 dark:bg-sky-950/30 p-4 rounded-xl border border-sky-100 dark:border-sky-900">
                <div>
                  <h3 className="font-bold text-sky-950 dark:text-sky-100 text-lg flex items-center space-x-2">
                    <Radio className="w-5 h-5 text-sky-500 animate-pulse" />
                    <span>Azərbaycan Respublikası Hava Limanları Karqo Şəbəkəsi</span>
                  </h3>
                  <p className="text-xs text-sky-800 dark:text-sky-300 mt-1">
                    Silk Way West Airlines qlobal habı (GYD), Gəncə, Füzuli, Zəngilan, Naxçıvan və Qəbələ aeroportlarının yük tutumu və reysləri
                  </p>
                </div>
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchHub}
                    onChange={(e) => setSearchHub(e.target.value)}
                    placeholder="Aeroport adı və ya IATA kodu..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Hub Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHubs.map((hub) => {
                  const isSelected = selectedHubId === hub.id;
                  return (
                    <div
                      key={hub.id}
                      onClick={() => setSelectedHubId(hub.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-2 ring-sky-500/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 text-xs font-bold bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded font-mono">
                            {hub.iataCode} / {hub.icaoCode}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-sm line-clamp-1">
                            {hub.nameAz}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{hub.locationCity}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                            {hub.activeFreighterFlightsToday} Reys/gün
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {hub.rfsTruckBaysCount} RFS Rampası
                          </span>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Anbar Doluluğu:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {hub.currentWarehouseLoadPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              hub.currentWarehouseLoadPercent > 80
                                ? 'bg-rose-500'
                                : hub.currentWarehouseLoadPercent > 60
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${hub.currentWarehouseLoadPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Facility Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {hub.hasPharmaColdChainFacility && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                            Termo-Zəncir (CRT)
                          </span>
                        )}
                        {hub.hasDangerousGoodsFacility && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium">
                            IATA DGR Hazmat
                          </span>
                        )}
                        {hub.hasDualEnergyGantryScanner && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium">
                            Dual-Energy X-Ray
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Hub Deep Inspection */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-sky-600 text-white rounded">
                        {selectedHub.iataCode}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedHub.nameAz}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Zolaq: {selectedHub.runwayDimensions} • İllik Yük Buraxılışı: {selectedHub.annualCargoCapacityTons.toLocaleString()} Ton
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOriginHubId(selectedHub.id);
                      setActiveTab('calculator');
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition"
                  >
                    <span>Bu Habdan Yük Göndər</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Scheduled Flights for Selected Hub */}
                <div className="mt-4">
                  <h5 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-3">
                    Bugünkü Aktiv Yük Reysləri & RFS Dəhlizləri
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="py-2 px-3 rounded-l">Reys №</th>
                          <th className="py-2 px-3">Aviadaşıyıcı</th>
                          <th className="py-2 px-3">Hava Gəmisi</th>
                          <th className="py-2 px-3">Təyinat Limanı</th>
                          <th className="py-2 px-3">Uçuş Vaxtı</th>
                          <th className="py-2 px-3">Boş Yer (Kq)</th>
                          <th className="py-2 px-3 rounded-r">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                        {MOCK_ACTIVE_FREIGHTER_FLIGHTS.map((flight) => (
                          <tr key={flight.flightNumber} className="hover:bg-slate-100 dark:hover:bg-slate-750">
                            <td className="py-2 px-3 font-bold text-sky-600 dark:text-sky-400 font-mono">
                              {flight.flightNumber}
                            </td>
                            <td className="py-2 px-3">{flight.airline}</td>
                            <td className="py-2 px-3 font-medium">
                              {FREIGHTER_AIRCRAFT_INFO[flight.freighterType].modelName}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {flight.destinationAirportCode}
                              </span>{' '}
                              ({flight.destinationCity})
                            </td>
                            <td className="py-2 px-3 font-mono">{flight.scheduledDeparture}</td>
                            <td className="py-2 px-3 font-mono font-semibold">
                              {flight.availableCapacityKg.toLocaleString()} kq
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                {flight.statusAz}
                              </span>
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

          {/* TAB 2: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Sürətli Sınaq Nümunələri (Presets)
                </span>
                <div className="flex flex-wrap gap-2">
                  {MOCK_CARGO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sky-500 dark:hover:border-sky-400 text-slate-800 dark:text-slate-200 transition shadow-sm flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{preset.titleAz}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inputs Column 1 */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Plane className="w-4 h-4 text-sky-500" />
                    <span>Uçuş & Təyinat Parametrləri</span>
                  </h4>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Çıxış Karqo Habı (Origin)
                    </label>
                    <select
                      value={originHubId}
                      onChange={(e) => setOriginHubId(e.target.value as AviationCargoHubId)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {MOCK_AVIATION_CARGO_HUBS.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.iataCode} - {h.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Təyinat Hava Limanı (Destination)
                    </label>
                    <input
                      type="text"
                      value={destinationAirportCode}
                      onChange={(e) => setDestinationAirportCode(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="FRA / EDDF (Frankfurt)"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Reys Nömrəsi (Flight №)
                    </label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                      placeholder="7L 774"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Yük Təyyarəsi Modeli (Freighter)
                    </label>
                    <select
                      value={freighterType}
                      onChange={(e) => setFreighterType(e.target.value as FreighterAircraftType)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {(Object.keys(FREIGHTER_AIRCRAFT_INFO) as FreighterAircraftType[]).map((type) => (
                        <option key={type} value={type}>
                          {FREIGHTER_AIRCRAFT_INFO[type].modelName} ({FREIGHTER_AIRCRAFT_INFO[type].operator})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Yük Kateqoriyası (Cargo Class)
                    </label>
                    <select
                      value={cargoClass}
                      onChange={(e) => setCargoClass(e.target.value as AviationCargoClass)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {(Object.keys(AVIATION_CARGO_CLASS_INFO) as AviationCargoClass[]).map((cat) => (
                        <option key={cat} value={cat}>
                          {AVIATION_CARGO_CLASS_INFO[cat].nameAz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Inputs Column 2: Dimensions & ULD */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-sky-500" />
                    <span>ULD & Fiziki Ölçülər</span>
                  </h4>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      ULD Aviasiya Paleti / Konteyner
                    </label>
                    <select
                      value={uldType}
                      onChange={(e) => setUldType(e.target.value as UldType)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {(Object.keys(ULD_TYPE_INFO) as UldType[]).map((u) => (
                        <option key={u} value={u}>
                          {ULD_TYPE_INFO[u].nameAz} ({ULD_TYPE_INFO[u].dimensionsCm})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Faktiki Brütto Çəki (Kq)
                    </label>
                    <input
                      type="number"
                      value={actualGrossWeightKg}
                      onChange={(e) => setActualGrossWeightKg(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Uzunluq (sm)
                      </label>
                      <input
                        type="number"
                        value={lengthCm}
                        onChange={(e) => setLengthCm(Math.max(10, Number(e.target.value)))}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        En (sm)
                      </label>
                      <input
                        type="number"
                        value={widthCm}
                        onChange={(e) => setWidthCm(Math.max(10, Number(e.target.value)))}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Hündürlük (sm)
                      </label>
                      <input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(Math.max(10, Number(e.target.value)))}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  {/* RFS Feeder Settings */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      RFS Avtomobil Dövlət Qeydiyyat Nişanı
                    </label>
                    <input
                      type="text"
                      value={rfsTruckPlate}
                      onChange={(e) => setRfsTruckPlate(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      RFS Quru Dəhliz Məsafəsi (km)
                    </label>
                    <input
                      type="number"
                      value={rfsDistanceKm}
                      onChange={(e) => setRfsDistanceKm(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Inputs Column 3: Policy Toggles & Summary */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2 mb-3">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Rejim & Xüsusi Şərtlər</span>
                    </h4>

                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isKnownConsignor}
                          onChange={(e) => setIsKnownConsignor(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Məlum Göndərən (Known Consignor / KC)
                        </span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isExportTransit}
                          onChange={(e) => setIsExportTransit(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Beynəlxalq İxrac Tranziti (0% ƏDV - Maddə 165.1.4)
                        </span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isPriorityAog}
                          onChange={(e) => setIsPriorityAog(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          Təcili AOG (Aircraft On Ground Priority)
                        </span>
                      </label>
                    </div>

                    {/* Weight Comparison Box */}
                    <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Faktiki Çəki:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {tariffBreakdown.actualGrossWeightKg} kq
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Həcmi Çəki (IATA):</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {tariffBreakdown.volumetricWeightKg} kq
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-semibold text-sky-600 dark:text-sky-400">
                        <span>Ödənişli Çəki (Chargeable):</span>
                        <span className="font-mono">{tariffBreakdown.chargeableWeightKg} kq</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Ümumi Həcm:</span>
                        <span>{tariffBreakdown.volumeM3} m³</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Output */}
                  <div className="bg-sky-950 text-white p-4 rounded-xl space-y-2 text-xs border border-sky-800">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Əsas Hava Fraxtı:</span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(tariffBreakdown.airFreightCostAzn, currency)}
                      </span>
                    </div>
                    {tariffBreakdown.rfsTruckTransitCostAzn > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-300">RFS Avto-Dəhliz Daşıması:</span>
                        <span className="font-mono">
                          {formatCurrency(tariffBreakdown.rfsTruckTransitCostAzn, currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-300">ICAO X-Ray Təhlükəsizlik:</span>
                      <span className="font-mono">
                        {formatCurrency(tariffBreakdown.securityScreeningCostAzn, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">THC Terminal Xidmətləri:</span>
                      <span className="font-mono">
                        {formatCurrency(tariffBreakdown.terminalHandlingCostAzn, currency)}
                      </span>
                    </div>
                    {tariffBreakdown.specialHandlingCostAzn > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-300">Xüsusi Yük İşləməsi:</span>
                        <span className="font-mono">
                          {formatCurrency(tariffBreakdown.specialHandlingCostAzn, currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-sky-800/80 text-sm font-bold text-sky-300">
                      <span>Yekun Məbləğ:</span>
                      <span>{formatCurrency(tariffBreakdown.totalCostAzn, currency)}</span>
                    </div>

                    <button
                      onClick={handleGenerateVoucher}
                      className="w-full mt-3 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-lg text-xs transition shadow-md flex items-center justify-center space-x-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Uçuş Buraxılış Vərəqəsi Yarat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCREENING STAND */}
          {activeTab === 'screening' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-800">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-6 h-6 text-sky-400" />
                  <h3 className="font-bold text-lg">
                    ICAO Annex 17 & IATA DGR Təhlükəsizlik və Rentgen Skaneri Standı
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Hi-Scan 180180-2is Dual-Energy rentgen baxışı, orqanik/qeyri-orqanik maddə ayrı-seçkiliyi və partlayıcı izi detektoru (ETD)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Diagnostics Toggle Column */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-sky-500" />
                    <span>Telemetriya və Sensor Göstəriciləri</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="font-semibold text-xs block text-slate-900 dark:text-white">
                          Dual-Energy Rentgen Sıxlıq Şəkli (X-Ray Density)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {xrayDensityPassed ? 'Normativ daxilində (Z_eff 7.8)' : 'Şübhəli sıxlıq anomaliyası'}
                        </span>
                      </div>
                      <button
                        onClick={() => setXrayDensityPassed(!xrayDensityPassed)}
                        className={`px-3 py-1 text-xs font-bold rounded ${
                          xrayDensityPassed
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {xrayDensityPassed ? 'KEÇDİ' : 'QÜSUR'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="font-semibold text-xs block text-slate-900 dark:text-white">
                          Partlayıcı Maddə İzi Detektoru (ETD Swab)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {etdTraceDetected ? 'Müsbət kimyəvi reaksiya (Təhlükə!)' : 'Mənfi nəticə (Təmiz)'}
                        </span>
                      </div>
                      <button
                        onClick={() => setEtdTraceDetected(!etdTraceDetected)}
                        className={`px-3 py-1 text-xs font-bold rounded ${
                          !etdTraceDetected
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {etdTraceDetected ? 'TƏHLÜKƏ' : 'TƏMİZ'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="font-semibold text-xs block text-slate-900 dark:text-white">
                          Kinoloji Xidmət İti (K9 Canine)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {k9CanineCleared ? 'Şübhəli reaksiya yoxdur' : 'İt xüsusi həyəcan siqnalı verdi'}
                        </span>
                      </div>
                      <button
                        onClick={() => setK9CanineCleared(!k9CanineCleared)}
                        className={`px-3 py-1 text-xs font-bold rounded ${
                          k9CanineCleared
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {k9CanineCleared ? 'KEÇDİ' : 'ŞÜBHƏLİ'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="font-semibold text-xs block text-slate-900 dark:text-white">
                          IATA DGR UN 3480 Litium Batareya Şarjı (SOC ≤ 30%)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {lithiumBatteryCompliant ? 'SOC 28% (IATA DGR PI965 uyğun)' : 'SOC > 30% (Uçuşa qadağandır)'}
                        </span>
                      </div>
                      <button
                        onClick={() => setLithiumBatteryCompliant(!lithiumBatteryCompliant)}
                        className={`px-3 py-1 text-xs font-bold rounded ${
                          lithiumBatteryCompliant
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {lithiumBatteryCompliant ? 'UYĞUN' : 'UYĞUNSUZ'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="font-semibold text-xs block text-slate-900 dark:text-white">
                          RFS Yük Maşını / ULD Mühafizə Plombu
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {tamperSealIntact ? 'Elektron plomb toxunulmazdır' : 'Plomb zədələnib və ya açılıb'}
                        </span>
                      </div>
                      <button
                        onClick={() => setTamperSealIntact(!tamperSealIntact)}
                        className={`px-3 py-1 text-xs font-bold rounded ${
                          tamperSealIntact
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {tamperSealIntact ? 'TAM' : 'POZULUB'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Screening Conclusion Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2 mb-3">
                      <Shield className="w-4 h-4 text-sky-500" />
                      <span>Aviasiya Təhlükəsizlik Rəyi (Security Status)</span>
                    </h4>

                    <div
                      className={`p-4 rounded-xl border ${
                        screeningResult.securityRiskLevel === 'LOW_CLEARED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-100'
                          : screeningResult.securityRiskLevel === 'MEDIUM_ENHANCED_SEARCH'
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-100'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2 font-bold text-sm mb-2">
                        {screeningResult.securityRiskLevel === 'LOW_CLEARED' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                        )}
                        <span>
                          {screeningResult.securityRiskLevel === 'LOW_CLEARED'
                            ? 'UÇUŞA TAM BURAXILDI (CLEARED)'
                            : screeningResult.securityRiskLevel === 'MEDIUM_ENHANCED_SEARCH'
                            ? 'DƏRİNLƏŞDİRİLMİŞ FİZİKİ AXTARIŞ TƏLƏB OLUNUR'
                            : 'QƏTİ QADAĞAN EDİLDİ (REJECTED)'}
                        </span>
                      </div>

                      <ul className="text-xs space-y-1 list-disc pl-5">
                        {screeningResult.reasonsAz.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>

                      <div className="mt-3 pt-3 border-t border-slate-200/40 text-xs font-semibold">
                        <span className="block text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">
                          Tövsiyə Olunan Əməliyyat:
                        </span>
                        <span>{screeningResult.recommendedActionAz}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                    <p className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <Info className="w-4 h-4 text-sky-500" />
                      <span>Hava Məcəlləsi Maddə 52 Xəbərdarlığı:</span>
                    </p>
                    <p>
                      Xüsusi yoxlamadan yayınma və ya aviasiya üçün təhlükəli malların bəyan edilmədən hava gəmisinə verilməsi İXM-in 308-ci maddəsi ilə 1,500 manatadək cərimə və cinayət məsuliyyəti yaradır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TELEMETRY & COLD-CHAIN */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="bg-sky-900 text-white p-5 rounded-2xl border border-sky-700">
                <div className="flex items-center space-x-3 mb-2">
                  <Thermometer className="w-6 h-6 text-sky-300" />
                  <h3 className="font-bold text-lg">
                    Apron Rampası & Envirotainer Aktiv Termo-Zəncir Telemetriyası
                  </h3>
                </div>
                <p className="text-xs text-sky-200">
                  Envirotainer RAP e2 aktiv konteyner sensorları, batareya ehtiyatı, RFS roller-bed hidravlik kilid və təyyarə qapı uyğunluğu
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cold-Chain Box */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-sky-500" />
                    <span>Daxili Temperatur Rejimi</span>
                  </h4>

                  <div className="space-y-2">
                    {[
                      { id: '+2_TO_+8', label: '+2°C ... +8°C (Vaksinlər & Əczaçılıq)', val: '+4.2°C' },
                      { id: '-20', label: '-20°C (Dərin Dondurulmuş Biomaterial)', val: '-20.5°C' },
                      { id: '+15_TO_+25', label: '+15°C ... +25°C (Nəzarətli Otaq - CRT)', val: '+18.6°C' },
                    ].map((tier) => (
                      <div
                        key={tier.id}
                        onClick={() => setTempTargetTier(tier.id as any)}
                        className={`p-3 rounded-lg border cursor-pointer transition ${
                          tempTargetTier === tier.id
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-900 dark:text-sky-100 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span>{tier.label}</span>
                          <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{tier.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Battery SOC */}
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Envirotainer Batareya SOC:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {batterySocPercent}% (Avtonom 72 saat)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${batterySocPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Freighter Aircraft Door Clearance */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Plane className="w-4 h-4 text-sky-500" />
                    <span>Hava Gəmisi Yük Qapısı Qabariti</span>
                  </h4>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 block font-mono">
                      {FREIGHTER_AIRCRAFT_INFO[freighterType].modelName}
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Maksimum Faydalı Yük:</span>
                      <span className="font-mono font-semibold">
                        {(FREIGHTER_AIRCRAFT_INFO[freighterType].maxPayloadKg / 1000).toFixed(1)} Ton
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Əsas Qapı Ölçüsü:</span>
                      <span className="font-mono font-semibold">
                        {FREIGHTER_AIRCRAFT_INFO[freighterType].mainDeckDoorSizeCm}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Burun Lyuku (Nose Door):</span>
                      <span className="font-mono font-semibold">
                        {FREIGHTER_AIRCRAFT_INFO[freighterType].hasNoseDoor ? 'Mövcuddur (B747)' : 'Yoxdur'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Palet Yerləri:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {FREIGHTER_AIRCRAFT_INFO[freighterType].palletPositions}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RFS Roller-bed Truck */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-sky-500" />
                    <span>RFS Roller-Bed Yük Platforması</span>
                  </h4>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Pnevmatik Roller-Bed Kilidi:</span>
                      <button
                        onClick={() => setRollerBedLocked(!rollerBedLocked)}
                        className={`px-3 py-1 font-bold text-xs rounded ${
                          rollerBedLocked
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {rollerBedLocked ? 'KİLİDLƏNİB' : 'AÇIQ (SÜRÜŞMƏ RİSKİ)'}
                      </button>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Yük Maşını Nömrəsi:</span>
                      <span className="font-mono font-bold">{rfsTruckPlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Qoşqu Tipləri:</span>
                      <span>Roller-Bed 4 Track (Pneumatic)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Standart Hündürlük:</span>
                      <span>125 sm (Hi-Loader Docking)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-sky-500" />
                    <span>10-Bəndlik Məcburi Aviasiya Karqo Təhlükəsizlik və RFS Yoxlama Vərəqəsi</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hava Məcəlləsi Maddə 38/52, ICAO Annex 17 və IATA DGR üzrə icbari bəndlər
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Uyğunluq Reytinqi:</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        checklistScore === 100
                          ? 'text-emerald-600'
                          : checklistScore >= 80
                          ? 'text-amber-500'
                          : 'text-rose-600'
                      }`}
                    >
                      {checklistScore} / 100 Bal
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const allChecked: Record<string, boolean> = {};
                      MOCK_AIR_CARGO_CHECKLIST.forEach((item) => (allChecked[item.id] = true));
                      setCheckedItems(allChecked);
                    }}
                    className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition"
                  >
                    Hamısını Təsdiqlə
                  </button>
                </div>
              </div>

              {checklistPenaltyAzn > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>
                      Təsdiqlənməmiş bəndlər üzrə İXM Maddə 308/309 sanksiya riski:
                    </span>
                  </div>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                    {checklistPenaltyAzn} AZN
                  </span>
                </div>
              )}

              <div className="space-y-2">
                {MOCK_AIR_CARGO_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setCheckedItems((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                        isChecked
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by parent div
                        className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.titleAz}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            +{item.weightScore} bal
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                          <span>{item.legalCitation}</span>
                          {!isChecked && (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                              Cərimə: {item.fineAzn} AZN
                            </span>
                          )}
                        </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5 text-sky-500" />
                    <span>DDAA & ICAO Aviasiya Yük Daşımaları Qanunvericilik İmtahanı</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    10 sualdan ən azı 8-nə düzgün cavab verilməlidir (80% keçid həddi)
                  </p>
                </div>
                <button
                  onClick={() => setShowExamResults(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs transition"
                >
                  Nəticələri Yoxla
                </button>
              </div>

              {showExamResults && (
                <div
                  className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
                    examScore >= 8
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-900 dark:text-emerald-100'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-900 dark:text-rose-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {examScore >= 8 ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600" />
                    )}
                    <div>
                      <span className="font-bold block">
                        {examScore >= 8
                          ? 'Təbriklər! İmtahandan Müvəffəqiyyətlə Keçdiniz.'
                          : 'İmtahandan Keçmədiniz. Yenidən təkrar edin.'}
                      </span>
                      <span className="text-xs">
                        Nəticəniz: {examScore} / 10 Düzgün ({examScore * 10}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_AIR_CARGO_LAW_EXAM.map((q) => {
                  const selectedOption = userExamAnswers[q.id];
                  const isAnswered = selectedOption !== undefined;
                  const isCorrect = isAnswered && selectedOption === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {q.id}. {q.questionAz}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-mono">
                          {q.legalArticle}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.optionsAz.map((opt, idx) => {
                          const isOptionSelected = selectedOption === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() =>
                                setUserExamAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: idx,
                                }))
                              }
                              className={`text-left p-2.5 rounded-lg border transition ${
                                isOptionSelected
                                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-100 font-semibold'
                                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              <span className="font-mono mr-1.5">
                                {String.fromCharCode(65 + idx)})
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showExamResults && (
                        <div
                          className={`p-2.5 rounded-lg text-[11px] ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                          }`}
                        >
                          <span className="font-bold block mb-0.5">
                            {isCorrect ? 'Düzgün Cavab!' : 'Səhv Cavab!'}
                          </span>
                          <span>{q.explanationAz}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: VOUCHER VIEW */}
          {activeTab === 'voucher' && (
            <div className="space-y-6">
              {currentVoucher ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-sky-500 shadow-xl overflow-hidden max-w-3xl mx-auto">
                  {/* Voucher Header Banner */}
                  <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-950 text-white p-5 border-b border-sky-700 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/30 text-sky-200 rounded border border-sky-400/40">
                          ICAO ANNEX 17 & DDAA UÇUŞ BURAXILIŞI
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/30 text-emerald-300 rounded border border-emerald-400/40 font-mono">
                          {currentVoucher.voucherId}
                        </span>
                      </div>
                      <h3 className="text-base font-bold mt-1 text-white">
                        Elektron Uçuş Tranzit və Apron Buraxılış Vərəqəsi
                      </h3>
                      <p className="text-xs text-sky-200">
                        Heydər Əliyev Beynəlxalq Aeroportu Karqo Terminalı & Silk Way West Airlines
                      </p>
                    </div>

                    <div className="p-2 bg-white rounded-xl">
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </div>
                  </div>

                  {/* Voucher Body Details */}
                  <div className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Aviaqaimə Nömrəsi (AWB):</span>
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                          {currentVoucher.awbNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Reys & Hava Gəmisi:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {currentVoucher.flightNumber} ({FREIGHTER_AIRCRAFT_INFO[currentVoucher.freighterType].modelName})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Təyinat Hava Limanı:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {currentVoucher.destinationAirportCode}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Ödənişli Çəki (Chargeable):</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {currentVoucher.chargeableWeightKg} kq ({currentVoucher.volumeM3} m³)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">ULD Konteyner / Palet:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {ULD_TYPE_INFO[currentVoucher.uldType].nameAz}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">RFS Yük Maşını Nömrəsi:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {currentVoucher.rfsTruckPlate}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-slate-400 block text-[11px]">Göndərən & Qəbul Edən:</span>
                        <span className="text-slate-800 dark:text-slate-200">
                          {currentVoucher.shipperName} ➔ {currentVoucher.consigneeName}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Təhlükəsizlik Yoxlama Kodu (SHA-256):</span>
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {currentVoucher.securityChecksumSha256}
                        </span>
                        <span className="text-slate-400 block text-[10px] mt-0.5">
                          SİMA İmzası: {currentVoucher.simaDigitalSignatureUid}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 block text-[11px]">Yekun Ödəniş:</span>
                        <span className="text-base font-bold text-sky-600 dark:text-sky-400 font-mono">
                          {formatCurrency(currentVoucher.totalCostAzn, currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
                    <button
                      onClick={() => handleCopyText(currentVoucher.voucherId, 'Vauçer Kodu')}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center space-x-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kodu Kopyala</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <QrCode className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    Aktiv Buraxılış Vərəqəsi Tapılmadı
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Kalkulyator bölməsindən parametr daxil edərək yeni avia-buraxılış vərəqəsi generasiya edin.
                  </p>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition"
                  >
                    Kalkulyatora Keç
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-sky-500" />
                    <span>DDAA & Silk Way Vahid İctimai Karqo və Buraxılış Reyestri</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hava limanı giriş-çıxışı və uçuş qeydiyyatı üçün verifikasiya sistemi
                  </p>
                </div>
                <div className="relative min-w-[260px]">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchRegistry}
                    onChange={(e) => setSearchRegistry(e.target.value)}
                    placeholder="AWB, Vauçer, Reys və ya Nömrə..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-3 px-4">Vauçer ID</th>
                      <th className="py-3 px-4">AWB №</th>
                      <th className="py-3 px-4">Reys & Təyinat</th>
                      <th className="py-3 px-4">RFS Maşın</th>
                      <th className="py-3 px-4">Ödənişli Çəki</th>
                      <th className="py-3 px-4">Məbləğ</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRegistry.map((voucher) => (
                      <tr key={voucher.voucherId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {voucher.voucherId}
                        </td>
                        <td className="py-3 px-4 font-mono">{voucher.awbNumber}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{voucher.flightNumber}</span> ➔ {voucher.destinationAirportCode}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">{voucher.rfsTruckPlate}</td>
                        <td className="py-3 px-4 font-mono">{voucher.chargeableWeightKg} kq</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {formatCurrency(voucher.totalCostAzn, currency)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            TƏSDİQLƏNİB
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setCurrentVoucher(voucher);
                              setActiveTab('voucher');
                            }}
                            className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 hover:bg-sky-100 rounded border border-sky-200 dark:border-sky-800 font-semibold text-[11px] transition"
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
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>DDAA Mülki Aviasiya İnformasiya Sistemi & ICAO Annex 17 Canlı İnteqrasiyası Aktivdir</span>
          </div>
          <div className="text-[11px] font-mono">
            Protokol: IATA-RFS-2026-V8.4 • Şifrələmə: SHA-256
          </div>
        </div>
      </div>
    </div>
  );
};
