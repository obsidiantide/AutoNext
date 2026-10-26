import React, { useState, useMemo } from 'react';
import {
  Plane,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Radio,
  Gauge,
  Wind,
  Flame,
  Award,
  FileText,
  Printer,
  Copy,
  Check,
  ChevronRight,
  Sliders,
  AlertOctagon,
  Eye,
  Info,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  AirportTerminal,
  ApronVehiclePreset,
  ApronSpeedZone,
  ApronVehicleType,
  ChecklistItem,
  AirportRampPermit,
  evaluateApronSpeedAndPriority,
  calculateJetBlastSafety,
  calculateChecklistScore,
  calculateExamScore,
  generateAirportRampPermit,
  convertAznToCurrency,
  formatApronPlate,
} from '../utils/airportRampCompliance';
import {
  MOCK_AIRPORT_TERMINALS,
  MOCK_APRON_VEHICLE_PRESETS,
  MOCK_APRON_CHECKLIST_ITEMS,
  MOCK_AIRSIDE_EXAM_QUESTIONS,
  MOCK_AIRPORT_RAMP_PERMITS,
} from '../data/mockAirportRampData';

interface AirportRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialVehicle?: Vehicle | null;
}

type TabType = 'terminals' | 'vehicles' | 'jetblast' | 'checklist' | 'exam' | 'permit' | 'registry';

export const AirportRampModal: React.FC<AirportRampModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('terminals');

  // Terminals Tab State
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>('term-gyd-1');
  const [terminalSearchQuery, setTerminalSearchQuery] = useState<string>('');

  const selectedTerminal = useMemo<AirportTerminal>(() => {
    return (
      MOCK_AIRPORT_TERMINALS.find((t) => t.id === selectedTerminalId) ||
      MOCK_AIRPORT_TERMINALS[0]
    );
  }, [selectedTerminalId]);

  const filteredTerminals = useMemo(() => {
    if (!terminalSearchQuery.trim()) return MOCK_AIRPORT_TERMINALS;
    const q = terminalSearchQuery.toLowerCase();
    return MOCK_AIRPORT_TERMINALS.filter(
      (t) =>
        t.airportName.toLowerCase().includes(q) ||
        t.terminalName.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q)
    );
  }, [terminalSearchQuery]);

  // Vehicle Simulator State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const currentPreset = MOCK_APRON_VEHICLE_PRESETS[selectedPresetIndex];

  const [simPlate, setSimPlate] = useState<string>(
    initialVehicle?.plateNumber ? formatApronPlate(initialVehicle.plateNumber) : currentPreset.plateNumber
  );
  const [simVehicleType, setSimVehicleType] = useState<ApronVehicleType>(currentPreset.vehicleType);
  const [simSpeed, setSimSpeed] = useState<number>(currentPreset.speedKmh);
  const [simZone, setSimZone] = useState<ApronSpeedZone>(currentPreset.currentZone);
  const [simYielded, setSimYielded] = useState<boolean>(currentPreset.yieldedToAircraft);
  const [simBeacon, setSimBeacon] = useState<boolean>(currentPreset.beaconActive);
  const [simRadio, setSimRadio] = useState<boolean>(currentPreset.radioActive);

  // Speed & Priority Evaluation
  const speedAudit = useMemo(() => {
    return evaluateApronSpeedAndPriority(
      simVehicleType,
      simSpeed,
      simZone,
      simYielded,
      simBeacon,
      simRadio
    );
  }, [simVehicleType, simSpeed, simZone, simYielded, simBeacon, simRadio]);

  // Jet Blast Simulator State
  const [blastAircraftType, setBlastAircraftType] = useState<string>('Boeing 777-300ER (Heavy Widebody)');
  const [blastThrustState, setBlastThrustState] = useState<'idle' | 'breakaway' | 'takeoff'>('breakaway');
  const [blastDistanceMeters, setBlastDistanceMeters] = useState<number>(45);

  const blastCalculation = useMemo(() => {
    return calculateJetBlastSafety(blastAircraftType, blastThrustState, blastDistanceMeters);
  }, [blastAircraftType, blastThrustState, blastDistanceMeters]);

  // 10-Point Technical Checklist State
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(MOCK_APRON_CHECKLIST_ITEMS);

  const checklistScore = useMemo(() => {
    return calculateChecklistScore(checklistItems);
  }, [checklistItems]);

  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  // Exam Simulator State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [showExamResults, setShowExamResults] = useState<boolean>(false);

  const handleSelectExamAnswer = (questionId: string, answerIndex: number) => {
    setExamAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const examResult = useMemo(() => {
    return calculateExamScore(examAnswers, MOCK_AIRSIDE_EXAM_QUESTIONS);
  }, [examAnswers]);

  // Official Ramp Permit Generator State
  const [permitPlate, setPermitPlate] = useState<string>('GYD-AP-018');
  const [permitVehicleName, setPermitVehicleName] = useState<string>('Goldhofer AST-2 Aircraft Pushback Tractor');
  const [permitVehicleType, setPermitVehicleType] = useState<ApronVehicleType>('pushback_tractor');
  const [permitOperator, setPermitOperator] = useState<string>('AZAL Ground Handling CJSC');
  const [generatedPermit, setGeneratedPermit] = useState<AirportRampPermit>(() =>
    generateAirportRampPermit({
      plateNumber: 'GYD-AP-018',
      vehicleName: 'Goldhofer AST-2 Aircraft Pushback Tractor',
      vehicleType: 'pushback_tractor',
      operatorName: 'AZAL Ground Handling CJSC',
      terminalName: selectedTerminal.terminalName,
      terminalCode: selectedTerminal.code,
    })
  );

  const handleGeneratePermit = () => {
    const permit = generateAirportRampPermit({
      plateNumber: permitPlate,
      vehicleName: permitVehicleName,
      vehicleType: permitVehicleType,
      operatorName: permitOperator,
      terminalName: selectedTerminal.terminalName,
      terminalCode: selectedTerminal.code,
      complianceScore: checklistScore.score,
    });
    setGeneratedPermit(permit);
  };

  // Copy & Print Handlers
  const [copiedPermit, setCopiedPermit] = useState<boolean>(false);
  const handleCopyPermit = () => {
    const text = `AR DÖVLƏT MÜLKİ AVİASİYA AGENTLİYİ (DMAA) & AZAL
RƏSMİ APRON GİRİŞ BURAXILIŞI VƏRƏQƏSİ
Qeydiyyat Nömrəsi: ${generatedPermit.permitId}
Apron Plitəsi: ${generatedPermit.plateNumber}
Nəqliyyat: ${generatedPermit.vehicleName} (${generatedPermit.typeLabel})
Operator: ${generatedPermit.operatorName}
Aerodrom: ${generatedPermit.terminalName}
Təhlükəsizlik Skoru: ${generatedPermit.complianceScore}%
Təhlükəsizlik Şifrəsi: ${generatedPermit.securityHash}
SİMA Rəqəmsal İmza: ${generatedPermit.simaSignatureUid}
Müfəttiş: ${generatedPermit.inspectorName} (${generatedPermit.inspectorBadge})`;

    navigator.clipboard?.writeText(text);
    setCopiedPermit(true);
    setTimeout(() => setCopiedPermit(false), 2000);
  };

  const handlePrintPermit = () => {
    window.print();
  };

  // Registry Search State
  const [registryQuery, setRegistryQuery] = useState<string>('');
  const filteredRegistry = useMemo(() => {
    const allPermits = [generatedPermit, ...MOCK_AIRPORT_RAMP_PERMITS];
    if (!registryQuery.trim()) return allPermits;
    const q = registryQuery.toLowerCase();
    return allPermits.filter(
      (p) =>
        p.permitId.toLowerCase().includes(q) ||
        p.plateNumber.toLowerCase().includes(q) ||
        p.vehicleName.toLowerCase().includes(q) ||
        p.operatorName.toLowerCase().includes(q) ||
        p.terminalCode.toLowerCase().includes(q)
    );
  }, [registryQuery, generatedPermit]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="airport-ramp-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl my-auto bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl shadow-sky-950/50 flex flex-col max-h-[92vh] overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-500/20 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/20 border border-sky-500/40 rounded-xl text-sky-400 shadow-inner">
              <Plane className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  DMAA • AZAL • ICAO ANNEX 14
                </span>
                <span className="text-xs font-medium text-slate-400">
                  GYD Apron Safety & Ground Operations
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Dövlət Mülki Aviasiya Agentliyi (DMAA) & AZAL Apron Giriş Buraxılışı Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="close-airport-ramp-modal"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 px-4 py-2 border-b border-slate-800 bg-slate-950/50 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('terminals')}
            data-testid="tab-terminals"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'terminals'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>1. Aerodrom və Apron Radarı</span>
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            data-testid="tab-vehicles"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'vehicles'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>2. Nəqliyyat & Sürət Auditoru</span>
          </button>
          <button
            onClick={() => setActiveTab('jetblast')}
            data-testid="tab-jetblast"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'jetblast'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>3. Jet Blast Reaktiv Qaz Standı</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'checklist'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>4. 10-Bəndli Texniki Standart</span>
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'exam'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>5. ADP Sürücülük İmtahanı</span>
          </button>
          <button
            onClick={() => setActiveTab('permit')}
            data-testid="tab-permit"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'permit'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>6. Elektron Apron Vərəqəsi</span>
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'registry'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>7. Vahid Reyestr</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: TERMINALS & APRON RADAR */}
          {activeTab === 'terminals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                    <span>Azərbaycan Aerodromları və Heydər Əliyev Beynəlxalq Aeroportu Apron Radarı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    ICAO Doc 9137 və EASA Ground Handling üzrə aktiv təyyarə dayanacaqları və telemetriya
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    data-testid="terminal-search-input"
                    value={terminalSearchQuery}
                    onChange={(e) => setTerminalSearchQuery(e.target.value)}
                    placeholder="Terminal və ya kod axtar..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Grid of Terminals */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="terminals-section">
                {filteredTerminals.map((terminal) => {
                  const isSelected = terminal.id === selectedTerminal.id;
                  return (
                    <div
                      key={terminal.id}
                      data-testid={`terminal-card-${terminal.id}`}
                      onClick={() => setSelectedTerminalId(terminal.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500/60 shadow-lg shadow-sky-950/30 ring-1 ring-sky-500/50'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                          {terminal.code}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            terminal.status === 'optimal'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {terminal.status === 'optimal' ? 'Normal Rejim' : 'Yüksək Sıxlıq'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 leading-snug">
                        {terminal.terminalName}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">{terminal.airportName}</p>

                      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dayanacaq / Teletrap:</span>
                          <span className="font-semibold text-white">
                            {terminal.standsCount} / {terminal.jetbridgeCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Aktiv Hava Gəmisi:</span>
                          <span className="font-semibold text-sky-400">
                            {terminal.activeAircraftOnStand} təyyarə
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Apron Sıxlığı:</span>
                          <span className="font-semibold text-amber-400">
                            %{terminal.apronCongestionIndex}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">VHF Tezliyi:</span>
                          <span className="font-mono text-emerald-400 text-[11px]">
                            {terminal.vhfGroundFreqMhz}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Terminal Detailed Telemetry Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/30 border border-sky-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-sky-500/20 border border-sky-500/40 rounded-xl text-sky-400">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {selectedTerminal.terminalName} ({selectedTerminal.code})
                      </h4>
                      <p className="text-xs text-slate-400">
                        Yerüstü İdarəetmə Telemetriyası & Sürət Normativləri
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Koordinat:</span>
                    <p className="text-xs font-mono text-sky-400">
                      {selectedTerminal.coordinates.lat.toFixed(4)}°N, {selectedTerminal.coordinates.lng.toFixed(4)}°E
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">ERA Zonası (5m daxilində)</span>
                    <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                      Maks {selectedTerminal.eraLimitKmh} km/saat
                    </p>
                    <span className="text-[10px] text-slate-500">Təyyarə gövdəsi və qanadaltı</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Dayanacaq Taxilane / Baqaj</span>
                    <p className="text-xl font-bold text-sky-400 font-mono mt-1">
                      Maks {selectedTerminal.standTaxilaneLimitKmh} km/saat
                    </p>
                    <span className="text-[10px] text-slate-500">Xidmət və yükləmə zolaqları</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400">Perimetr Xidmət Yolu</span>
                    <p className="text-xl font-bold text-amber-400 font-mono mt-1">
                      Maks {selectedTerminal.serviceRoadLimitKmh} km/saat
                    </p>
                    <span className="text-[10px] text-slate-500">Aerodrom ətrafı əsas magistral</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Əlaqə Tezlikləri:</span>
                    <span className="font-mono text-white bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {selectedTerminal.vhfGroundFreqMhz}
                    </span>
                    <span className="font-mono text-white bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {selectedTerminal.vhfTowerFreqMhz}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('vehicles')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 font-semibold transition-all"
                  >
                    <span>Bu Zonada Nəqliyyatı Sına</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AIRSIDE VEHICLES & SPEED AUDIT */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6" data-testid="vehicles-section">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                  <span>Yerüstü Xidmət Nəqliyyatı & Sürət Standartları Simulyatoru</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ICAO Əlavə 14 və İXM Maddə 308 üzrə sürət məhdudiyyətləri, narıncı mayak və təyyarəyə mütləq üstünlük yoxlanışı
                </p>
              </div>

              {/* Preset Vehicle Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {MOCK_APRON_VEHICLE_PRESETS.map((preset, idx) => {
                  const isSelected = idx === selectedPresetIndex;
                  return (
                    <button
                      key={preset.id}
                      data-testid={`vehicle-preset-${preset.id}`}
                      onClick={() => {
                        setSelectedPresetIndex(idx);
                        setSimPlate(preset.plateNumber);
                        setSimVehicleType(preset.vehicleType);
                        setSimSpeed(preset.speedKmh);
                        setSimZone(preset.currentZone);
                        setSimYielded(preset.yieldedToAircraft);
                        setSimBeacon(preset.beaconActive);
                        setSimRadio(preset.radioActive);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-sky-950/60 border-sky-500 text-white shadow-md shadow-sky-950/50 ring-1 ring-sky-500/40'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      <span className="text-[10px] font-mono block text-sky-400 font-bold truncate">
                        {preset.plateNumber}
                      </span>
                      <span className="text-xs font-semibold block truncate mt-0.5">
                        {preset.name.split(' ')[0]} {preset.name.split(' ')[1] || ''}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate mt-1">
                        {preset.typeLabel.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Controls & Live Evaluation Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 6 cols: Sliders and Toggles */}
                <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    <span>Apron Hərəkət Parametrləri</span>
                  </h4>

                  {/* License Plate & Operator */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Apron Nömrəsi</label>
                      <input
                        type="text"
                        value={simPlate}
                        onChange={(e) => setSimPlate(formatApronPlate(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Xidmət Zonası</label>
                      <select
                        value={simZone}
                        onChange={(e) => setSimZone(e.target.value as ApronSpeedZone)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="era_footprint">ERA Zonası (Maks 5 km/h)</option>
                        <option value="stand_taxilane">Stand Taxilane (Maks 15 km/h)</option>
                        <option value="service_road">Perimetr Yolu (Maks 30 km/h)</option>
                      </select>
                    </div>
                  </div>

                  {/* Speed Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Faktiki Sürət:</span>
                      <span className="font-mono font-bold text-sky-400 text-sm">
                        {simSpeed} km/saat{' '}
                        <span className="text-xs text-slate-400 font-normal">
                          (Hədd: {speedAudit.speedLimitKmh} km/saat)
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      value={simSpeed}
                      data-testid="sim-speed-slider"
                      onChange={(e) => setSimSpeed(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0 km/h</span>
                      <span>5 km/h (ERA)</span>
                      <span>15 km/h (Taxilane)</span>
                      <span>30 km/h (Road)</span>
                      <span>60 km/h</span>
                    </div>
                  </div>

                  {/* Safety Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                      <span className="text-xs text-slate-200">
                        Təyyarəyə Yol Verildi (Mütləq Üstünlük)
                      </span>
                      <input
                        type="checkbox"
                        checked={simYielded}
                        data-testid="sim-yielded-checkbox"
                        onChange={(e) => setSimYielded(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-800 border-slate-700"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                      <span className="text-xs text-slate-200">
                        Narıncı Fırlanan Mayak Aktivdir (360° Strob)
                      </span>
                      <input
                        type="checkbox"
                        checked={simBeacon}
                        data-testid="sim-beacon-checkbox"
                        onChange={(e) => setSimBeacon(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-800 border-slate-700"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                      <span className="text-xs text-slate-200">
                        VHF Aviasiya Radio Rabitəsi Aktivdir (121.7 MHz)
                      </span>
                      <input
                        type="checkbox"
                        checked={simRadio}
                        data-testid="sim-radio-checkbox"
                        onChange={(e) => setSimRadio(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-800 border-slate-700"
                      />
                    </label>
                  </div>
                </div>

                {/* Right 6 cols: Live Verdict & Infractions Card */}
                <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/20 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-sky-400" />
                      <span>İnzibati & Təhlükəsizlik Rəyi</span>
                    </h4>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        speedAudit.isCompliant
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {speedAudit.isCompliant ? 'TAM UYĞUNDUR' : 'POZUNTU QEYDƏ ALINDI'}
                    </span>
                  </div>

                  {/* Plate Graphic Box */}
                  <div className="flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center border-2 border-slate-900 rounded-md shadow bg-white text-black font-mono font-black text-xl px-4 py-1.5 tracking-wider">
                      <div className="flex flex-col items-center mr-3 pr-2 border-r border-slate-300">
                        <span className="text-[9px] font-sans font-bold text-sky-700 leading-none">AZ</span>
                        <Plane className="w-3.5 h-3.5 text-sky-700 mt-0.5" />
                      </div>
                      <span>{simPlate}</span>
                      <div className="ml-3 pl-2 border-l border-slate-300 text-[10px] text-slate-600 font-sans font-bold leading-tight">
                        APRON<br />RAMP
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {speedAudit.verdict}
                  </p>

                  {/* Financials & Demerits */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-xs text-slate-400">İnzibati Cərimə:</span>
                      <p className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                        {convertAznToCurrency(speedAudit.statutoryFineAzn, currency)} {currency}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        (50% endirimlə: {convertAznToCurrency(speedAudit.discountedFineAzn, currency)} {currency})
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-xs text-slate-400">Buraxılış Məhrumiyyəti:</span>
                      <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                        {speedAudit.licenseSuspensionMonths > 0
                          ? `${speedAudit.licenseSuspensionMonths} ay`
                          : 'Yoxdur (0 ay)'}
                      </p>
                      <span className="text-[10px] text-slate-500">ADP Kartının İbtalı</span>
                    </div>
                  </div>

                  {/* Itemized Infractions */}
                  {speedAudit.infractions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 block">
                        Qeydə Alınmış Pozuntular ({speedAudit.infractions.length}):
                      </span>
                      {speedAudit.infractions.map((inf, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200"
                        >
                          <div className="flex justify-between font-bold mb-1">
                            <span>{inf.description}</span>
                            <span className="font-mono">{convertAznToCurrency(inf.fineAzn, currency)} {currency}</span>
                          </div>
                          <span className="text-[10px] text-rose-400">{inf.legalRef}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JET BLAST HAZARD STAND */}
          {activeTab === 'jetblast' && (
            <div className="space-y-6" data-testid="jetblast-section">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                  <Wind className="w-5 h-5 text-sky-400" />
                  <span>Reaktiv Mühərrik Qaz Axını (Jet Blast) və Təhlükə Standı</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ICAO Doc 9137 Standartı — Reaktiv turbofanın isti qaz sürəti, aşma təhlükəsi və minimal təhlükəsiz məsafə
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 6 cols: Blast Controls */}
                <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hava Gəmisinin Tipi</label>
                    <select
                      value={blastAircraftType}
                      onChange={(e) => setBlastAircraftType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Boeing 777-300ER (Heavy Widebody)">Boeing 777-300ER / 777F (Heavy Widebody)</option>
                      <option value="Airbus A350-900 (Heavy Widebody)">Airbus A350-900 / A330 (Heavy Widebody)</option>
                      <option value="Boeing 747-400F (Heavy Jumbo Freighter)">Boeing 747-400F Silk Way Cargo</option>
                      <option value="Airbus A320neo (Medium Narrowbody)">Airbus A320neo / A321neo (Narrowbody)</option>
                      <option value="Boeing 737-800 (Medium Narrowbody)">Boeing 737-800 / MAX</option>
                      <option value="Embraer E190 (Regional Jet)">Embraer E190 / E195 Regional</option>
                      <option value="ATR 72-600 (Turboprop Regional)">ATR 72-600 Turboprop Regional</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Mühərrikin Rejimi (Thrust State)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['idle', 'breakaway', 'takeoff'] as const).map((thrust) => (
                        <button
                          key={thrust}
                          data-testid={`blast-thrust-${thrust}`}
                          onClick={() => setBlastThrustState(thrust)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            blastThrustState === thrust
                              ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {thrust === 'idle' && 'Boş Rejim (Idle)'}
                          {thrust === 'breakaway' && 'Hərəkətə Başlama'}
                          {thrust === 'takeoff' && 'Qalxış (Takeoff)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Təyyarə Mühərrikinə Olan Məsafə:</span>
                      <span className="font-mono font-bold text-sky-400 text-sm">
                        {blastDistanceMeters} metr
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={150}
                      value={blastDistanceMeters}
                      data-testid="blast-distance-slider"
                      onChange={(e) => setBlastDistanceMeters(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>5m (Kritik)</span>
                      <span>30m</span>
                      <span>75m (Təhlükəsiz)</span>
                      <span>150m</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                    <span className="text-sky-400 font-semibold block mb-1">FOD və Zədələnmə Qaydası:</span>
                    Reaktiv qaz axını təkcə avtomobili aşıraraq zədələmir, həm də yerdəki bolt, daş və baqaj arabalarını mərmiyə bənzər sürətlə ətrafa səpələyir.
                  </div>
                </div>

                {/* Right 6 cols: Blast Gauge & Telemetry Result */}
                <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Reaktiv Qaz Göstəriciləri</span>
                    </h4>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        blastCalculation.riskSeverity === 'safe'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : blastCalculation.riskSeverity === 'caution'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                      }`}
                    >
                      {blastCalculation.riskSeverity === 'safe' && 'TƏHLÜKƏSİZ ZONA'}
                      {blastCalculation.riskSeverity === 'caution' && 'DİQQƏT: EHTİYAT ZONASI'}
                      {blastCalculation.riskSeverity === 'critical' && 'KRİTİK JET BLAST TƏHLÜKƏSİ'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-xs text-slate-400">Külək / Qaz Sürəti:</span>
                      <p className="text-2xl font-bold font-mono text-sky-400 mt-1">
                        {blastCalculation.blastWindSpeedKmh} km/saat
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {blastCalculation.windForceDescription}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-xs text-slate-400">Çıxış Hərarəti:</span>
                      <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                        +{blastCalculation.temperatureCelsius} °C
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {blastCalculation.temperatureCelsius > 60 ? 'Yüksək Termal Təhlükə' : 'Normal İstilik'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Minimal Təhlükəsiz Məsafə:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ≥ {blastCalculation.minSafeDistanceMeters} metr
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Faktiki Saxlanılan Məsafə:</span>
                      <span
                        className={`font-mono font-bold ${
                          blastCalculation.distanceMeters >= blastCalculation.minSafeDistanceMeters
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {blastCalculation.distanceMeters} metr
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {blastCalculation.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT TECHNICAL CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="checklist-section">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-sky-400" />
                    <span>ICAO Əlavə 14 & DMAA 10-Bəndli Texniki Uyğunluq Standartı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Apron Giriş Buraxılışı (AVP) əldə etmək üçün tələb olunan məcburi avadanlıq və texniki baxış
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Uyğunluq Qiyməti:</span>
                    <p
                      className={`text-lg font-bold font-mono ${
                        checklistScore.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {checklistScore.score}%
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${
                      checklistScore.passed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {checklistScore.rating}
                  </div>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    data-testid={`checklist-item-${item.id}`}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start space-x-3 ${
                      item.passed
                        ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}
                  >
                    <div className="mt-0.5">
                      {item.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertOctagon className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        {item.isCritical && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                            KRİTİK
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-1 leading-snug">{item.description}</p>
                      <span className="text-[10px] text-sky-400/80 font-mono">{item.standardRef}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">
                  Uğurlu Bəndlər: {checklistScore.passCount} / {checklistItems.length} | Cərimə Riski:{' '}
                  {convertAznToCurrency(checklistScore.penaltyAzn, currency)} {currency}
                </span>
                <button
                  onClick={() => setActiveTab('permit')}
                  className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 font-semibold transition-all"
                >
                  Buraxılış Vərəqəsi Yarat
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: AIRSIDE DRIVER PERMIT (ADP) EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="exam-section">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-sky-400" />
                    <span>ICAO Annex 14 & GYD Apron Sürücülük Buraxılışı (ADP) İmtahanı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Apron ərazisində nəqliyyat idarə etmək üçün 10-suallıq nəzəri və praktiki attestasiya simulyatoru
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-mono">
                    Cavablandırıldı: {Object.keys(examAnswers).length} / {MOCK_AIRSIDE_EXAM_QUESTIONS.length}
                  </span>
                  <button
                    onClick={() => setShowExamResults(true)}
                    data-testid="submit-exam-btn"
                    className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-400 transition-all shadow-md shadow-sky-500/30"
                  >
                    Nəticəni Hesabla
                  </button>
                </div>
              </div>

              {/* Exam Score Summary Banner */}
              {showExamResults && (
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    examResult.passed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {examResult.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-400" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        İmtahan Nəticəsi: {examResult.scorePercent}% ({examResult.correctCount}/
                        {examResult.totalCount} Düzgün) — Dərəcə: {examResult.grade}
                      </h4>
                      <p className="text-xs opacity-90">{examResult.feedback}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setExamAnswers({});
                      setShowExamResults(false);
                    }}
                    data-testid="reset-exam-btn"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Yenidən Başla
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_AIRSIDE_EXAM_QUESTIONS.map((q, qIndex) => {
                  const userAnswer = examAnswers[q.id];
                  const isAnswered = userAnswer !== undefined;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-sky-400 font-mono">
                          Sual {qIndex + 1} / {MOCK_AIRSIDE_EXAM_QUESTIONS.length}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{q.standardRef}</span>
                      </div>
                      <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = userAnswer === optIndex;
                          const isCorrect = q.correctAnswerIndex === optIndex;

                          let btnClasses =
                            'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white';
                          if (isSelected) {
                            btnClasses = 'bg-sky-500/20 border-sky-500 text-sky-200 font-semibold';
                          }
                          if (showExamResults) {
                            if (isCorrect) {
                              btnClasses = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnClasses = 'bg-rose-500/20 border-rose-500 text-rose-200 font-semibold';
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              data-testid={`exam-option-${q.id}-${optIndex}`}
                              onClick={() => handleSelectExamAnswer(q.id, optIndex)}
                              className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start space-x-2 ${btnClasses}`}
                            >
                              <span className="font-mono text-[11px] opacity-70">
                                {String.fromCharCode(65 + optIndex)})
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showExamResults && (
                        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                          <span className="text-sky-400 font-semibold">İzah: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL RAMP PERMIT GENERATOR */}
          {activeTab === 'permit' && (
            <div className="space-y-6" data-testid="permit-section">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-sky-400" />
                    <span>AR Dövlət Mülki Aviasiya Agentliyi (DMAA) Elektron Apron Buraxılış Vərəqəsi</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Heydər Əliyev Beynəlxalq Aeroportu və regional aerodromlar üçün rəsmi dövlət avadanlıq vəsiqəsi
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyPermit}
                    data-testid="copy-permit-btn"
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all"
                  >
                    {copiedPermit ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPermit ? 'Kopyalandı' : 'Məlumatı Kopyala'}</span>
                  </button>
                  <button
                    onClick={handlePrintPermit}
                    data-testid="print-permit-btn"
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-white transition-all shadow-md shadow-sky-500/20"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Custom Permit Form */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Apron Nömrəsi</label>
                  <input
                    type="text"
                    value={permitPlate}
                    onChange={(e) => setPermitPlate(formatApronPlate(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nəqliyyatın Adı</label>
                  <input
                    type="text"
                    value={permitVehicleName}
                    onChange={(e) => setPermitVehicleName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Xidmət Növü</label>
                  <select
                    value={permitVehicleType}
                    onChange={(e) => setPermitVehicleType(e.target.value as ApronVehicleType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="pushback_tractor">Təyyarə İtələyici Traktor</option>
                    <option value="follow_me">Follow-Me Bələdçi</option>
                    <option value="passenger_shuttle">Apron Sərnişin Avtobusu</option>
                    <option value="fuel_bowser">Yanacaqdolduran Sistern (Jet A-1)</option>
                    <option value="catering_loader">Keterinq Furqonu</option>
                    <option value="baggage_tug">Baqaj Dartıcı Karvanı</option>
                    <option value="deicing_truck">Buztəmizləyici Bomlu Maşın</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleGeneratePermit}
                    data-testid="generate-permit-btn"
                    className="w-full py-2 px-3 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-bold transition-all"
                  >
                    Yeni Vəsiqə Generasiya Et
                  </button>
                </div>
              </div>

              {/* Certificate Visualizer Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-sky-500/40 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-sky-500/20 pb-4 text-center sm:text-left gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-inner">
                      <Plane className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white uppercase tracking-wider">
                        Azərbaycan Respublikası Dövlət Mülki Aviasiya Agentliyi
                      </h4>
                      <p className="text-xs text-sky-300 font-medium">
                        State Civil Aviation Agency of the Republic of Azerbaijan • Airside Vehicle Permit (AVP)
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="text-[10px] text-slate-400 font-mono">Qeydiyyat Kodu:</span>
                    <p className="text-base font-black font-mono text-sky-400">{generatedPermit.permitId}</p>
                  </div>
                </div>

                {/* Center Badge Strip */}
                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Apron Plitəsi</span>
                    <div className="flex items-center border border-slate-700 rounded shadow bg-white text-black font-mono font-black text-lg px-3 py-1 mt-1 tracking-wider">
                      <span className="text-[10px] text-sky-700 mr-2 font-sans font-bold">AZ</span>
                      <span>{generatedPermit.plateNumber}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Aviasiya Operatoru</span>
                    <p className="text-sm font-bold text-white mt-1">{generatedPermit.operatorName}</p>
                    <span className="text-[10px] text-slate-500 font-mono">Akkreditasiya №AZ-GHA-77</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Təhlükəsizlik Skoru</span>
                    <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                      {generatedPermit.complianceScore}% (ICAO Annex 14)
                    </p>
                  </div>
                </div>

                {/* Details Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Nəqliyyat Vasitəsi:</span>
                    <span className="font-semibold text-white truncate block mt-0.5">
                      {generatedPermit.vehicleName}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Xidmət Kateqoriyası:</span>
                    <span className="font-semibold text-sky-300 truncate block mt-0.5">
                      {generatedPermit.typeLabel}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Təyinat Aerodromu:</span>
                    <span className="font-semibold text-white truncate block mt-0.5">
                      {generatedPermit.terminalName}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Sürət Limiteri:</span>
                    <span className="font-semibold text-emerald-400 font-mono block mt-0.5">
                      Maks {generatedPermit.speedGovernorKmh} km/saat
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Verilmə Tarixi:</span>
                    <span className="font-semibold text-white font-mono block mt-0.5">
                      {generatedPermit.issueDate}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Bitmə Tarixi:</span>
                    <span className="font-semibold text-amber-400 font-mono block mt-0.5">
                      {generatedPermit.expiryDate} (1 İl)
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">VHF Əlaqə Kanalı:</span>
                    <span className="font-semibold text-white font-mono block mt-0.5">
                      {generatedPermit.vhfFrequencyMhz}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">İcazə Verilmiş Zona:</span>
                    <span className="font-semibold text-sky-400 truncate block mt-0.5">
                      {generatedPermit.apronZoneAllowed}
                    </span>
                  </div>
                </div>

                {/* Footer Security Seal */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400 gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-300">
                      <span className="text-sky-400">SHA-256 Seal:</span>
                      <span>{generatedPermit.securityHash}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-400">
                      <span className="text-emerald-400">SİMA UID:</span>
                      <span>{generatedPermit.simaSignatureUid}</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="text-[10px] text-slate-500 block">Səlahiyyətli Müfəttiş:</span>
                    <span className="font-semibold text-white block">
                      {generatedPermit.inspectorName} ({generatedPermit.inspectorBadge})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: UNIFIED PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="registry-section">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                    <Search className="w-5 h-5 text-sky-400" />
                    <span>Azərbaycan Mülki Aviasiya Apron Nəqliyyatı Vahid Dövlət Reyestri</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dövlət Mülki Aviasiya Agentliyində (DMAA) qeydiyyatdan keçmiş aktiv apron nəqliyyat vasitələrinin yoxlanışı
                  </p>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    data-testid="registry-search-input"
                    value={registryQuery}
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    placeholder="Vəsiqə №, nömrə və ya operator axtar..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Table of Registered Permits */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-3">Buraxılış №</th>
                      <th className="p-3">Apron Plitəsi</th>
                      <th className="p-3">Nəqliyyatın Adı & Tipi</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3">Aerodrom</th>
                      <th className="p-3">Uyğunluq</th>
                      <th className="p-3">Etibarlılıq</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRegistry.map((item) => (
                      <tr key={item.permitId} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-sky-400">{item.permitId}</td>
                        <td className="p-3">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-white text-black text-[11px]">
                            {item.plateNumber}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-white block">{item.vehicleName}</span>
                          <span className="text-[10px] text-slate-400">{item.typeLabel}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-200">{item.operatorName}</td>
                        <td className="p-3">
                          <span className="font-mono text-xs text-sky-300">{item.terminalCode}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            {item.complianceScore}% (ICAO)
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">{item.expiryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
