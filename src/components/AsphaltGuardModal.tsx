import React, { useState, useMemo } from 'react';
import {
  Sun,
  Flame,
  Thermometer,
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
  Lock,
  RefreshCw,
  ArrowRight,
  Shield,
  Eye,
  Check,
  Scale,
  Clock,
  Droplets,
  Layers,
} from 'lucide-react';
import { Modal } from './Modal';
import { Currency } from '../types/vehicle';
import {
  AsphaltCorridorAsset,
  AsphaltVehiclePreset,
  BitumenGrade,
  calculateAsphaltThermalSimulation,
  evaluateAsphaltChecklist,
  evaluateAsphaltExam,
  generateAsphaltCertificate,
  AsphaltClearanceCertificate,
} from '../utils/asphaltGuardCompliance';
import {
  MOCK_ASPHALT_CORRIDORS,
  MOCK_ASPHALT_VEHICLES,
  MOCK_ASPHALT_CHECKLIST,
  MOCK_ASPHALT_EXAM_QUESTIONS,
  MOCK_ASPHALT_CERTIFICATES,
} from '../data/mockAsphaltGuardData';

export type AsphaltTabId =
  | 'corridors'
  | 'scada'
  | 'vehicles'
  | 'calculator'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export interface AsphaltGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

export const AsphaltGuardModal: React.FC<AsphaltGuardModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<AsphaltTabId>('corridors');
  const [selectedCorridor, setSelectedCorridor] = useState<AsphaltCorridorAsset>(MOCK_ASPHALT_CORRIDORS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<AsphaltVehiclePreset>(MOCK_ASPHALT_VEHICLES[0]);
  const [corridorSearchQuery, setCorridorSearchQuery] = useState('');

  // SCADA Simulation State
  const [simAirTempC, setSimAirTempC] = useState<number>(selectedCorridor.currentAirTempC);
  const [simSolarRadiation, setSimSolarRadiation] = useState<number>(selectedCorridor.solarRadiationWm2);
  const [simGrossMassKg, setSimGrossMassKg] = useState<number>(selectedVehicle.grossMassKg);
  const [simMaxAxleLoadTonnes, setSimMaxAxleLoadTonnes] = useState<number>(selectedVehicle.maxAxleLoadTonnes);
  const [simTirePressureBar, setSimTirePressureBar] = useState<number>(selectedVehicle.tirePressureBar);
  const [simBitumenGrade, setSimBitumenGrade] = useState<BitumenGrade>(selectedCorridor.bitumenGrade);
  const [simTruckPasses, setSimTruckPasses] = useState<number>(6000);
  const [simTimeHour, setSimTimeHour] = useState<number>(14); // 14:00 peak heat
  const [promptDiscountApplied, setPromptDiscountApplied] = useState<boolean>(true);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate & Registry State
  const [certificates, setCertificates] = useState<AsphaltClearanceCertificate[]>(MOCK_ASPHALT_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<AsphaltClearanceCertificate | null>(MOCK_ASPHALT_CERTIFICATES[0]);
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Filtered Corridors
  const filteredCorridors = useMemo(() => {
    if (!corridorSearchQuery.trim()) return MOCK_ASPHALT_CORRIDORS;
    const q = corridorSearchQuery.toLowerCase();
    return MOCK_ASPHALT_CORRIDORS.filter(
      (c) =>
        c.nameAz.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.route.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );
  }, [corridorSearchQuery]);

  // Simulation Results
  const simResult = useMemo(() => {
    return calculateAsphaltThermalSimulation({
      airTemperatureC: simAirTempC,
      solarRadiationWm2: simSolarRadiation,
      vehicleGrossMassKg: simGrossMassKg,
      maxAxleLoadTonnes: simMaxAxleLoadTonnes,
      tirePressureBar: simTirePressureBar,
      bitumenGrade: simBitumenGrade,
      truckPassesCount: simTruckPasses,
      timeHour: simTimeHour,
    });
  }, [
    simAirTempC,
    simSolarRadiation,
    simGrossMassKg,
    simMaxAxleLoadTonnes,
    simTirePressureBar,
    simBitumenGrade,
    simTruckPasses,
    simTimeHour,
  ]);

  // Checklist Evaluation
  const checklistEval = useMemo(
    () => evaluateAsphaltChecklist(MOCK_ASPHALT_CHECKLIST, checkedItems),
    [checkedItems]
  );

  // Exam Evaluation
  const examEval = useMemo(
    () => evaluateAsphaltExam(MOCK_ASPHALT_EXAM_QUESTIONS, examAnswers),
    [examAnswers]
  );

  // Registry Search
  const searchResults = useMemo(() => {
    if (!registrySearchQuery.trim()) return certificates;
    const q = registrySearchQuery.toUpperCase().trim();
    return certificates.filter(
      (c) =>
        c.certificateNumber.toUpperCase().includes(q) ||
        c.vehiclePlate.toUpperCase().includes(q) ||
        c.corridorNameAz.toUpperCase().includes(q)
    );
  }, [registrySearchQuery, certificates]);

  const handleSelectCorridor = (corridor: AsphaltCorridorAsset) => {
    setSelectedCorridor(corridor);
    setSimAirTempC(corridor.currentAirTempC);
    setSimSolarRadiation(corridor.solarRadiationWm2);
    setSimBitumenGrade(corridor.bitumenGrade);
  };

  const handleSelectVehicle = (vehicle: AsphaltVehiclePreset) => {
    setSelectedVehicle(vehicle);
    setSimGrossMassKg(vehicle.grossMassKg);
    setSimMaxAxleLoadTonnes(vehicle.maxAxleLoadTonnes);
    setSimTirePressureBar(vehicle.tirePressureBar);
  };

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCheckAll = () => {
    setCheckedItems(MOCK_ASPHALT_CHECKLIST.map((item) => item.id));
  };

  const handleResetChecklist = () => {
    setCheckedItems([]);
  };

  const handleAnswerExam = (questionId: number, optionIndex: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGenerateCertificate = () => {
    const newCert = generateAsphaltCertificate({
      vehiclePlate: selectedVehicle.licensePlate,
      vehicleClass: selectedVehicle.vehicleClass,
      grossMassKg: simGrossMassKg,
      maxAxleLoadTonnes: simMaxAxleLoadTonnes,
      corridor: selectedCorridor,
      simResult,
    });
    setCertificates((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (valAzn: number) => {
    if (currency === 'USD') return `$${Math.round(valAzn * 0.5882)}`;
    if (currency === 'EUR') return `€${Math.round(valAzn * 0.5435)}`;
    return `${valAzn} ₼`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title="AAYDA & BDYP Magistral Yollarda Asfalt Örtüyünün Yay İstisində Mühafizəsi, Təkər İzi (Rutting) SCADA Sistemi və Rəsmi ASPHALT-GUARD-AZ-2026 Portalı"
    >
      <div className="flex flex-col h-full max-h-[88vh] bg-slate-950 text-slate-100 rounded-b-2xl overflow-hidden font-sans">
        {/* TOP STATUS HEADER */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-red-950/80 border-b border-amber-500/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shadow-inner">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-amber-300 tracking-wide">
                  ASPHALT-GUARD-AZ-2026
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  AAYDA • BDYP • SUPERPAVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Respublika Magistral Yollarında Yay İstisi (+32°C), Asfalt Bitum Plastik Deformasiyası və Təkər İzi Telemetriyası
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span>Hava:</span>
              <span className={`font-bold ${simAirTempC >= 32 ? 'text-red-400' : 'text-emerald-400'}`}>
                {simAirTempC.toFixed(1)}°C
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Səth:</span>
              <span className="font-bold text-amber-400">
                {simResult.pavementSurfaceTempC.toFixed(1)}°C
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Təkər İzi:</span>
              <span className="font-bold text-cyan-300">
                {simResult.ruttingDepthMm.toFixed(1)} mm
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 gap-1 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'corridors', label: 'Magistral Radar', icon: Search },
            { id: 'scada', label: 'Termal SCADA & Rutting', icon: Sliders },
            { id: 'vehicles', label: 'Yük Nəqliyyatı', icon: Truck },
            { id: 'calculator', label: 'Yay Qadağası & Cərimə', icon: Scale },
            { id: 'checklist', label: '10-Maddəlik Yoxlama', icon: CheckCircle2 },
            { id: 'exam', label: 'İstilik Rejimi İmtahanı', icon: HelpCircle },
            { id: 'certificate', label: 'Elektron İcazə Vərəqəsi', icon: FileText },
            { id: 'registry', label: 'Vahid Dövlət Reyestri', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AsphaltTabId)}
                data-testid={`asphalt-tab-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CORRIDORS RADAR */}
          {activeTab === 'corridors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-400" />
                    Strateji Magistral İstilik & Rutting Nəzarət Dəhlizləri
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA SCADA Pave-Scan infraqırmızı sensorları və TIR-Park soyutma məntəqələri
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={corridorSearchQuery}
                    onChange={(e) => setCorridorSearchQuery(e.target.value)}
                    placeholder="Dəhliz, marşrut və ya region axtar..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
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
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-950/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 font-bold">
                          {corridor.route}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            corridor.restrictionActive
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {corridor.restrictionActive ? 'QADAĞA AKTİV (+32°C)' : 'AÇIQ TRAFİK'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-100 mb-1 line-clamp-1">
                        {corridor.nameAz}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">{corridor.region} • {corridor.chainageKm}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                        <div>
                          <span className="text-slate-500">Hava İstisi:</span>{' '}
                          <span className="text-orange-400 font-bold">{corridor.currentAirTempC}°C</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Asfalt Səthi:</span>{' '}
                          <span className="text-amber-400 font-bold">{corridor.currentPavementTempC}°C</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Bitum Markası:</span>{' '}
                          <span className="text-cyan-400 font-bold">{corridor.bitumenGrade}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">TIR Soyutma:</span>{' '}
                          <span className="text-slate-200">
                            {corridor.coolingStationOccupancy}/{corridor.coolingStationCapacityTrucks}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                          {corridor.activeMistSprinklers ? 'Çiləyici Aktiv' : 'Quru Yol'}
                        </span>
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          Seçilmiş <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Corridor Technical Summary */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-200">
                    Seçilmiş Dəhliz: {selectedCorridor.nameAz}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Koordinat: {selectedCorridor.coordinates} • Asfalt Qalınlığı: {selectedCorridor.pavementThicknessMm} mm • Əsas: {selectedCorridor.subbaseType}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('scada')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Termal SCADA Simulyatoruna Keç
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA & RUTTING SIMULATOR */}
          {activeTab === 'scada' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  SCADA Termal & Plastik Axma Parametrləri
                </h3>

                {/* Air Temperature Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Havanın Ətraf İstiliyi (T_air):</span>
                    <span className={`font-mono font-bold ${simAirTempC >= 32 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {simAirTempC.toFixed(1)}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="0.5"
                    value={simAirTempC}
                    onChange={(e) => setSimAirTempC(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>15°C (Mülayim)</span>
                    <span className="text-red-400 font-bold">32°C (Qadağa Həddi)</span>
                    <span>50°C (Ekstremal)</span>
                  </div>
                </div>

                {/* Solar Radiation Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Günəş Radiasiyası (W/m²):</span>
                    <span className="font-mono text-amber-400 font-bold">{simSolarRadiation} W/m²</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1100"
                    step="20"
                    value={simSolarRadiation}
                    onChange={(e) => setSimSolarRadiation(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Time of Day Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Günün Saatı (Tranzit Pəncərəsi):</span>
                    <span className="font-mono text-cyan-300 font-bold">{simTimeHour}:00</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={simTimeHour}
                    onChange={(e) => setSimTimeHour(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>00:00</span>
                    <span className="text-amber-400">10:00 - 20:00 (Yay Qadağa Saatları)</span>
                    <span>23:00</span>
                  </div>
                </div>

                {/* Max Axle Load Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Təkər Oxu Yükü:</span>
                    <span className={`font-mono font-bold ${simMaxAxleLoadTonnes > 5.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {simMaxAxleLoadTonnes.toFixed(1)} Ton / Ox
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="16.0"
                    step="0.5"
                    value={simMaxAxleLoadTonnes}
                    onChange={(e) => setSimMaxAxleLoadTonnes(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1.0t (Minik)</span>
                    <span className="text-rose-400 font-bold">5.0t (Yay Limit Həddi)</span>
                    <span>16.0t (Aşırı Yük)</span>
                  </div>
                </div>

                {/* Tire Pressure Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Təkər Daxili Təzyiqi:</span>
                    <span className="font-mono text-slate-200 font-bold">{simTirePressureBar.toFixed(1)} Bar</span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="11.0"
                    step="0.2"
                    value={simTirePressureBar}
                    onChange={(e) => setSimTirePressureBar(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Bitumen Grade Selection */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Asfalt Bitum Markası & Modifikatoru:</label>
                  <select
                    value={simBitumenGrade}
                    onChange={(e) => setSimBitumenGrade(e.target.value as BitumenGrade)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="BND_60_90">BND 60/90 (Standart Yol Bitumu - Həssas)</option>
                    <option value="BND_70_100">BND 70/100 (Yumşaq Bitum - Yüksək Deformasiya)</option>
                    <option value="PG_64_22">Superpave PG 64-22 (Müasir Dərəcələnmiş)</option>
                    <option value="PG_70_10">Superpave PG 70-10 (Yüksək İstiyə Davamlı)</option>
                    <option value="SMA_16_POLYMER">SMA-16 Polimer Modifikasiyalı SBS (Ən Yüksək Davamlılıq)</option>
                  </select>
                </div>

                {/* Truck Passes Count */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Təkrar Ox Keçidi (ESAL Passes):</span>
                    <span className="font-mono text-amber-300 font-bold">{simTruckPasses.toLocaleString()} ox</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="30000"
                    step="500"
                    value={simTruckPasses}
                    onChange={(e) => setSimTruckPasses(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Simulation Visuals & Telemetry Column */}
              <div className="lg:col-span-7 space-y-4">
                {/* SVG Pavement Layer Cross-Section & Rutting Visualization */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Asfalt Layının Termal Deformasiyası & Təkər İzi Kəsiyi
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        simResult.ruttingRisk === 'PAVEMENT_FAILURE'
                          ? 'bg-red-500/30 text-red-300 border border-red-500/60'
                          : simResult.ruttingRisk === 'CRITICAL_RUTTING'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {simResult.ruttingRisk === 'PAVEMENT_FAILURE'
                        ? 'YOL QATININ DAĞILMASI'
                        : simResult.ruttingRisk === 'CRITICAL_RUTTING'
                        ? 'KRİTİK TƏKƏR İZİ (>15mm)'
                        : 'MÖHKƏM / MİNİMAL İZ'}
                    </span>
                  </div>

                  <svg viewBox="0 0 600 240" className="w-full h-56 rounded-xl bg-slate-950 border border-slate-800/80">
                    <defs>
                      <linearGradient id="sunGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
                      </linearGradient>
                      <linearGradient id="asphaltGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>
                    </defs>

                    {/* Sun & Radiation Rays */}
                    <circle cx="530" cy="35" r="22" fill="#f59e0b" opacity="0.9" />
                    <line x1="500" y1="45" x2="440" y2="70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1="470" y1="35" x2="390" y2="60" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
                    <line x1="530" y1="65" x2="510" y2="110" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />

                    {/* Air Temperature Label */}
                    <text x="320" y="32" fill="#fbbf24" fontSize="12" fontFamily="monospace" fontWeight="bold">
                      Hava İstisi: {simAirTempC.toFixed(1)}°C | Radiasiya: {simSolarRadiation} W/m²
                    </text>

                    {/* Heavy Truck Tire Representation */}
                    <g transform="translate(180, 45)">
                      <rect x="0" y="0" width="60" height="75" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="3" />
                      <line x1="12" y1="10" x2="12" y2="65" stroke="#334155" strokeWidth="3" />
                      <line x1="48" y1="10" x2="48" y2="65" stroke="#334155" strokeWidth="3" />
                      <circle cx="30" cy="38" r="14" fill="#334155" stroke="#64748b" strokeWidth="2" />
                      <text x="30" y="42" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">
                        {simMaxAxleLoadTonnes.toFixed(1)}t
                      </text>
                      {/* Downward force arrows */}
                      <path d="M 30,76 L 30,95 M 24,90 L 30,96 L 36,90" stroke="#ef4444" strokeWidth="2.5" fill="none" />
                    </g>

                    {/* Dynamic Pavement Surface with Rutting Depression */}
                    {/* Road surface baseline at Y=140 */}
                    {/* Left edge (20,140) -> rut shoulder (160,138) -> rut dip (210, 140 + depth*1.8) -> right shoulder (260, 138) -> end (580,140) */}
                    <path
                      d={`M 20,140 
                          Q 140,140 160,${140 - Math.min(8, simResult.ruttingDepthMm * 0.3)} 
                          Q 210,${140 + Math.min(35, simResult.ruttingDepthMm * 1.5)} 260,${140 - Math.min(8, simResult.ruttingDepthMm * 0.3)} 
                          L 580,140 L 580,190 L 20,190 Z`}
                      fill="url(#asphaltGradient)"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />

                    {/* Subbase Layer */}
                    <rect x="20" y="190" width="560" height="40" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                    <text x="30" y="215" fill="#64748b" fontSize="10" fontFamily="monospace">
                      Qırmadaş Əsas (Subbase) • Qalınlıq: 250 mm
                    </text>

                    {/* Surface Heat & Rut Labels */}
                    <text x="280" y="132" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      Səth İstisi: {simResult.pavementSurfaceTempC.toFixed(1)}°C
                    </text>
                    <text x="280" y="162" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      Təkər İzi Dərinliyi (RD): {simResult.ruttingDepthMm.toFixed(1)} mm
                    </text>
                    <text x="280" y="180" fill="#a855f7" fontSize="10" fontFamily="monospace">
                      20mm Qat İstisi: {simResult.pavementCriticalDepthTempC.toFixed(1)}°C | Modul: {simResult.dynamicModulusMpa} MPa
                    </text>
                  </svg>
                </div>

                {/* SCADA Telemetry Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Səth İstisi (T_surf)</span>
                    <span className="text-base font-bold text-amber-400">
                      {simResult.pavementSurfaceTempC.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">20mm Qat İstisi</span>
                    <span className="text-base font-bold text-orange-400">
                      {simResult.pavementCriticalDepthTempC.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Kəsilmə Gərginliyi</span>
                    <span className="text-base font-bold text-purple-400">
                      {simResult.shearStressKPa} kPa
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">AASHTO ESAL Faktoru</span>
                    <span className="text-base font-bold text-cyan-400">
                      {simResult.esalDamageFactor}x
                    </span>
                  </div>
                </div>

                {/* Status Alert Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    simResult.isRestrictedDueToHeat
                      ? 'bg-red-950/40 border-red-500/50 text-red-200'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  {simResult.isRestrictedDueToHeat ? (
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-1">
                    <span className="font-bold block">
                      {simResult.isRestrictedDueToHeat
                        ? 'YAY İSTİSİ HƏRƏKƏT MƏHDUDİYYƏTİ QÜVVƏDƏDİR'
                        : 'SƏRBƏST TRANZİT REJİMİ'}
                    </span>
                    <p className="text-slate-300">{simResult.restrictionReasonAz}</p>
                    {simResult.isRestrictedDueToHeat && (
                      <p className="text-amber-300 font-mono">
                        Yol kənarı soyutma dayanacağında tələb olunan gözləmə: {simResult.estimatedCoolingWaitMinutes} dəqiqə (saat 20:00-dək).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLES PRESETS */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  Avtomobil Nəqliyyatı & Ox Yükü Presets
                </h3>
                <p className="text-xs text-slate-400">
                  Azərbaycan dövlət qeydiyyat nömrəli ağırçəkili, orta tonnajlı və fərdi nəqliyyat vasitələri
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_ASPHALT_VEHICLES.map((vehicle) => {
                  const isSelected = selectedVehicle.id === vehicle.id;
                  const isOverGross = vehicle.grossMassKg > 14000;
                  const isOverAxle = vehicle.maxAxleLoadTonnes > 5.0;

                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => handleSelectVehicle(vehicle)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 shadow-md'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold">
                          {vehicle.licensePlate}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOverGross || isOverAxle
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {isOverGross || isOverAxle ? 'QADAĞAYA DÜŞÜR' : 'İCAZƏLİ'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-100 mb-1">{vehicle.name}</h4>
                      <p className="text-xs text-slate-400 mb-3">{vehicle.cargoType}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-slate-500">Kütlə:</span>{' '}
                          <span className="text-slate-200">{(vehicle.grossMassKg / 1000).toFixed(1)} ton</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Maks Ox:</span>{' '}
                          <span className={vehicle.maxAxleLoadTonnes > 5.0 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                            {vehicle.maxAxleLoadTonnes}t
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Ox Sayı:</span>{' '}
                          <span className="text-slate-200">{vehicle.axleCount} ox</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Təzyiq:</span>{' '}
                          <span className="text-slate-200">{vehicle.tirePressureBar} bar</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CALCULATOR & STATUTORY FINES */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  İnzibati Xətalar Məcəlləsi (İXM 353.1 & 353.2) Cərimə Kalkulyatoru
                </h3>

                <p className="text-xs text-slate-400">
                  Yay mövsümündə asfalt örtüyünü qorumaq məqsədilə müəyyən edilmiş hərəkət məhdudiyyətinin pozulmasına görə tətbiq olunan sanksiyalar
                </p>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Məhdudiyyət Rejimi:</span>
                    <span className={`font-bold ${simResult.isRestrictedDueToHeat ? 'text-red-400' : 'text-emerald-400'}`}>
                      {simResult.isRestrictedDueToHeat ? 'QADAĞA SAATI (10:00 - 20:00)' : 'İCAZƏLİ TRANZİT'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Faktiki Ümumi Kütlə:</span>
                    <span className="font-mono text-slate-200">{(simGrossMassKg / 1000).toFixed(1)} ton (Limit: 14.0t)</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Maksimal Təkər Oxu Yükü:</span>
                    <span className="font-mono text-slate-200">{simMaxAxleLoadTonnes.toFixed(1)} ton (Limit: 5.0t)</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Standart Cərimə Məbləği:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {formatCurrency(simResult.statutoryFineAzn)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={promptDiscountApplied}
                        onChange={(e) => setPromptDiscountApplied(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>İXM Maddə 38 üzrə 30 gün ərzində 50% könüllü ödəniş güzəşti</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-amber-300 block font-medium">Yekun Cərimə Məbləği:</span>
                    <span className="text-2xl font-bold font-mono text-amber-400">
                      {formatCurrency(promptDiscountApplied ? simResult.discountedFineAzn : simResult.statutoryFineAzn)}
                    </span>
                  </div>
                  <button
                    onClick={handleGenerateCertificate}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Rəsmi İcazə / Qərar Sənədi Yarat
                  </button>
                </div>
              </div>

              {/* Cooling Station Guidance */}
              <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Yol Kənarı TIR-Park Soyutma Məntəqəsi Reqlamenti
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  AAYDA və BDYP tərəfindən magistral yollarda saxlanılan ağırçəkili nəqliyyat vasitələri yol hərəkətinə mane olmamaq üçün yaxınlıqdakı xüsusi soyutma duracaqlarına (TIR-Park) yönləndirilir.
                </p>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Təhlükəsiz Tranzit Saatı</span>
                    <span className="text-cyan-400 font-bold text-base">Saat 20:00-dan Sonra</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Soyutma Suyu Tələbi</span>
                    <span className="text-amber-400 font-bold text-base">{simResult.coolingWaterRequiredLiters} Litr / 100m</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-slate-200 block">Sürücünün Vəzifələri:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Elektron ASPHALT-GUARD-AZ-2026 QR kodunu təqdim etmək;</li>
                    <li>Avtomobili xüsusi ayrılmış kölgəlik və ya çiləyici zolaqda saxlamaq;</li>
                    <li>Refrijeratorlar üçün 380V şəbəkə qoşulma PIN kodunu qeydiyyatdan keçirmək;</li>
                    <li>Saat 20:00-dək hərəkət hissəsinə icazəsiz daxil olmamaq.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    10-Maddəlik Texniki Asfalt Mühafizəsi & Yay Təhlükəsizliyi Yoxlama Vərəqəsi
                  </h3>
                  <p className="text-xs text-slate-400">
                    AZS 410 / AZS 342 və Nazirlər Kabinetinin normativ tələblərinə uyğunluq auditi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckAll}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition-all cursor-pointer"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg font-medium transition-all cursor-pointer"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Uyğunluq Səviyyəsi:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {checklistEval.scorePercent}% ({checklistEval.checkedCount}/{checklistEval.totalItems})
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistEval.isCompliant ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${checklistEval.scorePercent}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {MOCK_ASPHALT_CHECKLIST.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-amber-950/20 border-amber-500/50'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded accent-amber-500 cursor-pointer"
                      />
                      <div className="flex-1 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isChecked ? 'text-slate-100' : 'text-slate-300'}`}>
                            {item.titleAz}
                          </span>
                          {item.isMandatory && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              Mütləq
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{item.legalRef}</p>
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
              <div className="flex justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    10-Suallıq Yol Səthi Mühafizəsi & Yay İstilik Reqlamenti İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sürücülər və logistika operatorları üçün sertifikatlaşdırma testi (Keçid balı: 80%)
                  </p>
                </div>
                {examSubmitted && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs px-3 py-1 rounded-lg font-bold border ${
                        examEval.isPassed
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-500/20 border-red-500/50 text-red-300'
                      }`}
                    >
                      Qiymət: {examEval.grade} ({examEval.scorePercent}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {MOCK_ASPHALT_EXAM_QUESTIONS.map((q, idx) => {
                  const userAnswer = examAnswers[q.id];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = hasAnswered && userAnswer === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start gap-2 text-xs font-semibold text-slate-200">
                        <span className="font-mono text-amber-400 font-bold">{idx + 1}.</span>
                        <span>{q.questionAz}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.optionsAz.map((option, optIdx) => {
                          const isOptionSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800';

                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-red-500/20 border-red-500 text-red-200';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerExam(q.id, optIdx)}
                              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${btnStyle}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                          <span className="font-bold text-amber-300 block">İzah:</span>
                          <p>{q.explanationAz}</p>
                          <span className="text-[10px] text-slate-500 block">Mənbə: {q.regulatoryReference}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                {!examSubmitted ? (
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Cavabları Təsdiqlə və Qiymətləndir
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    İmtahanı Yenidən Başla
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: CERTIFICATE SHEET */}
          {activeTab === 'certificate' && activeCertificate && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    Elektron İcazə & Tranzit Vərəqəsi
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və BDYP Vahid Reyestri tərəfindən verilmiş rəsmi rəqəmsal sənəd
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeCertificate.certificateNumber, 'cert-num')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copyFeedback === 'cert-num' ? 'Kopyalandı!' : 'Nömrəni Kopyala'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Printable Certificate Sheet */}
              <div className="max-w-3xl mx-auto bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                {/* Watermark */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                  <Sun className="w-80 h-80 text-amber-400" />
                </div>

                {/* Cert Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-amber-500/30 pb-4 gap-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 block font-bold">
                      AZƏRBAYCAN RESPUBLİKASI AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ
                    </span>
                    <h2 className="text-lg font-bold text-slate-100">
                      YAY MÖVSÜMÜ İSTİLİK VƏ ASFALT MÜHAFİZƏSİ BURAXILIŞ VƏRƏQƏSİ
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">
                      Qeydiyyat No: {activeCertificate.certificateNumber}
                    </span>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-400 block">Tarix: {activeCertificate.issueDate}</span>
                    <span className="text-amber-400 font-bold block">
                      Status: {activeCertificate.clearanceStatus}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Dövlət Qeydiyyatı:</span>
                    <span className="text-slate-100 font-bold text-sm">{activeCertificate.vehiclePlate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ümumi Kütlə:</span>
                    <span className="text-slate-100 font-bold">{(activeCertificate.grossMassKg / 1000).toFixed(1)} Ton</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Maks Ox Yükü:</span>
                    <span className="text-slate-100 font-bold">{activeCertificate.maxAxleLoadTonnes} Ton / Ox</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dəhliz:</span>
                    <span className="text-slate-100 font-bold line-clamp-1">{activeCertificate.corridorNameAz}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Yol İstisi:</span>
                    <span className="text-amber-400 font-bold">{activeCertificate.pavementSurfaceTempC.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">TIR Soyutma PIN Kodu:</span>
                    <span className="text-cyan-400 font-bold text-sm">{activeCertificate.coolingBayPinCode}</span>
                  </div>
                </div>

                {/* Digital Signature & QR Verification */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800 text-xs">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] text-slate-500 block font-mono">SİMA RƏQƏMSAL İMZA VERİFİKASİYASI:</span>
                    <span className="font-mono text-amber-300 font-bold block">{activeCertificate.digitalSignatureUid}</span>
                    <span className="text-slate-400 text-[11px] block">{activeCertificate.authorizedInspector}</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg shrink-0">
                    <div className="w-16 h-16 bg-slate-900 rounded flex items-center justify-center text-[9px] text-white font-mono text-center p-1">
                      QR VERIFY OK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    ASPHALT-GUARD-AZ-2026 Vahid Dövlət Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və BDYP tərəfindən qeydiyyata alınmış rəsmi buraxılış və məhdudiyyət sənədləri
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearchQuery}
                    onChange={(e) => setRegistrySearchQuery(e.target.value)}
                    placeholder="Sertifikat no, nömrə və ya dəhliz..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-700/60 font-mono">
                    <tr>
                      <th className="p-3">Sertifikat No</th>
                      <th className="p-3">Dövlət Nömrəsi</th>
                      <th className="p-3">Dəhliz</th>
                      <th className="p-3">Yol İstisi</th>
                      <th className="p-3">Təkər İzi</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {searchResults.map((cert) => (
                      <tr key={cert.certificateNumber} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-400">
                          {cert.certificateNumber}
                        </td>
                        <td className="p-3 font-mono font-bold">{cert.vehiclePlate}</td>
                        <td className="p-3 text-slate-300 line-clamp-1">{cert.corridorNameAz}</td>
                        <td className="p-3 font-mono text-orange-400">{cert.pavementSurfaceTempC}°C</td>
                        <td className="p-3 font-mono text-cyan-400">{cert.ruttingDepthMm} mm</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              cert.clearanceStatus === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : cert.clearanceStatus === 'RESTRICTED_COOLING_HOLD'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {cert.clearanceStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setActiveCertificate(cert);
                              setActiveTab('certificate');
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium rounded-lg text-[11px] transition-all cursor-pointer"
                          >
                            Bax
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
      </div>
    </Modal>
  );
};
