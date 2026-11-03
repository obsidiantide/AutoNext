import React, { useState, useId } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  Award,
  Search,
  Copy,
  Printer,
  Gauge,
  Sun,
  CloudRain,
  CloudFog,
  Moon,
  Snowflake,
  Car,
  Truck,
  ExternalLink,
  Volume2,
  Radio,
  Layers,
  ArrowDown,
  ArrowUpLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  Currency,
  LaneControlSignal,
  WeatherCondition,
  GantryAsset,
  VmsVehiclePreset,
  VmsSimulationInput,
  convertVmsCurrency,
  VMS_CURRENCY_SYMBOLS,
  runVmsSimulation,
  evaluateVmsChecklist,
  gradeVmsExam,
  generateVmsCertificate,
  VmsClearanceCertificate,
} from '../utils/vmsSafeCompliance';
import {
  MOCK_GANTRY_ASSETS,
  MOCK_VMS_VEHICLES,
  MOCK_VMS_CHECKLIST,
  MOCK_VMS_EXAM,
  MOCK_VMS_CERTIFICATES,
} from '../data/mockVmsSafeData';

interface VmsSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

export const VmsSafeModal: React.FC<VmsSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const modalTitleId = useId();
  const [activeTab, setActiveTab] = useState<
    'corridors' | 'simulator' | 'fines' | 'checklist' | 'exam' | 'certificate' | 'registry'
  >('corridors');

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);
  const [selectedGantry, setSelectedGantry] = useState<GantryAsset>(MOCK_GANTRY_ASSETS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<VmsVehiclePreset>(MOCK_VMS_VEHICLES[0]);

  // Simulation inputs
  const [vehicleSpeedKmH, setVehicleSpeedKmH] = useState<number>(95);
  const [chosenLane, setChosenLane] = useState<number>(2);
  const [currentLcsState, setCurrentLcsState] = useState<LaneControlSignal>('LANE_OPEN_GREEN_ARROW');
  const [variableSpeedLimitKmH, setVariableSpeedLimitKmH] = useState<number>(110);
  const [characterHeightMm, setCharacterHeightMm] = useState<number>(400);
  const [messageWordCount, setMessageWordCount] = useState<number>(6);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('CLEAR_DAY');
  const [ambientLux, setAmbientLux] = useState<number>(45000);
  const [ledLuminanceCdM2, setLedLuminanceCdM2] = useState<number>(4500);
  const [backgroundLuminanceCdM2, setBackgroundLuminanceCdM2] = useState<number>(450);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>(
    MOCK_VMS_CHECKLIST.map((item) => item.id)
  );

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Generated certificate
  const [activeCertificate, setActiveCertificate] = useState<VmsClearanceCertificate>(
    MOCK_VMS_CERTIFICATES[0]
  );
  const [copiedCertId, setCopiedCertId] = useState<boolean>(false);

  // Public registry search
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryList, setRegistryList] = useState<VmsClearanceCertificate[]>(MOCK_VMS_CERTIFICATES);

  if (!isOpen) return null;

  // Run simulation
  const simInput: VmsSimulationInput = {
    vehicleSpeedKmH,
    chosenLane,
    currentLcsState,
    variableSpeedLimitKmH,
    characterHeightMm,
    messageWordCount,
    weatherCondition,
    ambientLux,
    ledLuminanceCdM2,
    backgroundLuminanceCdM2,
  };

  const simResult = runVmsSimulation(simInput);
  const checklistResult = evaluateVmsChecklist(checkedItems, MOCK_VMS_CHECKLIST.length);
  const examResult = gradeVmsExam(examAnswers, MOCK_VMS_EXAM);

  // Synthesize Web Audio alert sound
  const playGantryAudioAlert = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  const handleApplyVehiclePreset = (v: VmsVehiclePreset) => {
    setSelectedVehicle(v);
    setChosenLane(v.selectedLane);
    if (v.vehicleType.includes('Semi-Trailer') || v.vehicleType.includes('Coach')) {
      setVehicleSpeedKmH(80);
    } else if (v.plate.includes('YP')) {
      setVehicleSpeedKmH(120);
    } else {
      setVehicleSpeedKmH(105);
    }
  };

  const handleGenerateCertificate = () => {
    const cert = generateVmsCertificate({
      vehiclePlate: selectedVehicle.plate,
      vehicleName: selectedVehicle.name,
      corridorCode: selectedGantry.code,
      corridorName: selectedGantry.corridor,
      gantryCode: selectedGantry.code,
      picketKm: selectedGantry.picketKm,
      chosenLane,
      lcsState: currentLcsState,
      vehicleSpeedKmH,
      vslSpeedLimitKmH: variableSpeedLimitKmH,
      legibilityDistanceM: simResult.legibilityDistanceM,
      readingFeasibility: simResult.readingFeasibility,
      contrastRatioLR: simResult.contrastRatioLR,
      en12966Class: simResult.en12966LuminanceClass,
      laneSafetyOutcome: simResult.laneSafetyOutcome,
      totalFineAzn: simResult.totalFineAzn,
      totalPenaltyPoints: simResult.totalPenaltyPoints,
    });
    setActiveCertificate(cert);
    setRegistryList([cert, ...registryList]);
    setActiveTab('certificate');
  };

  const handleCopyCert = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(
        `VMS CLEARANCE CERTIFICATE: ${activeCertificate.certificateId}\nVehicle: ${activeCertificate.vehiclePlate} (${activeCertificate.vehicleName})\nCorridor: ${activeCertificate.corridorName}\nGantry: ${activeCertificate.gantryCode} (${activeCertificate.picketKm})\nSpeed: ${activeCertificate.vehicleSpeedKmH} km/h (Limit: ${activeCertificate.vslSpeedLimitKmH} km/h)\nLane: #${activeCertificate.chosenLane} - LCS: ${activeCertificate.lcsState}\nLegibility: ${activeCertificate.legibilityDistanceM}m - Status: ${activeCertificate.laneSafetyOutcome}\nSİMA Hash: ${activeCertificate.sha256Checksum}\nPIN: ${activeCertificate.verificationPin}`
      );
      setCopiedCertId(true);
      setTimeout(() => setCopiedCertId(false), 2500);
    }
  };

  const handlePrintCert = () => {
    window.print();
  };

  const filteredRegistry = registryList.filter((c) => {
    const q = registrySearch.toLowerCase();
    return (
      c.certificateId.toLowerCase().includes(q) ||
      c.vehiclePlate.toLowerCase().includes(q) ||
      c.corridorName.toLowerCase().includes(q) ||
      c.gantryCode.toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      data-testid="vms-safe-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                  AAYDA • AYNA • BDYP
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  EN 12966 / NTCIP 1203
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  SİMA DİGİTAL
                </span>
              </div>
              <h2 id={modalTitleId} className="text-base sm:text-lg font-bold text-amber-200">
                Magistral Dəyişən Məlumat Nişanları (VMS / DMS) & Qantry İdarəetmə Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency selector */}
            <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2 py-1 rounded-md transition-all ${
                    selectedCurrency === curr
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="vms-modal-close-btn"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 px-2 sm:px-6 py-1 scrollbar-none text-xs sm:text-sm">
          {[
            { id: 'corridors', label: 'Qantry Şəbəkəsi', icon: Layers },
            { id: 'simulator', label: 'SCADA Simulyator & LCS', icon: Radio },
            { id: 'fines', label: 'Nəqliyyat & İXM Cərimələri', icon: Gauge },
            { id: 'checklist', label: '10-Bəndlik Standart', icon: ShieldCheck },
            { id: 'exam', label: 'Nəzəri İmtahan', icon: Award },
            { id: 'certificate', label: 'VMS-SAFE Sertifikatı', icon: FileText },
            { id: 'registry', label: 'Açıq Reyestr', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-2.5 font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CORRIDORS */}
          {activeTab === 'corridors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    Azərbaycan Magistrallarında Strateji Qantry Portalları və Dinamik VMS Tabloları
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA İntellektual Nəqliyyat İdarəetmə Mərkəzi (NİİM) və BDYP Baş İdarəsi ilə fiber-optik SCADA interfeysi
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  6 Aktiv Qantry
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {MOCK_GANTRY_ASSETS.map((g) => {
                  const isSelected = selectedGantry.id === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => {
                        setSelectedGantry(g);
                        setVariableSpeedLimitKmH(g.currentVslKmH);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {g.routeNumber}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400">{g.code}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100">{g.corridor}</h4>
                      <p className="text-xs text-amber-300/90 font-mono mt-0.5">{g.picketKm}</p>

                      <div className="mt-3 pt-2.5 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">Zolaq Sayı:</span>
                          <span className="font-bold text-slate-200 ml-1">{g.totalLanes} zolaq</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Dinamik Hədd:</span>
                          <span className="font-bold text-amber-400 ml-1">{g.currentVslKmH} km/s</span>
                        </div>
                        <div>
                          <span className="text-slate-400">EN 12966:</span>
                          <span className="font-bold text-cyan-300 ml-1">{g.en12966Class.split(' ')[0]}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Optik Ping:</span>
                          <span className="font-mono text-emerald-400 ml-1">{g.opticalFiberLatencyMs} ms</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 truncate">
                        🏢 {g.centralScadaHub}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SCADA SIMULATOR & LCS */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Interactive SVG Gantry Visualization */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      LIVE SCADA GANTRY VIEW
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedGantry.code} — {selectedGantry.picketKm}
                    </span>
                  </div>
                  <button
                    onClick={playGantryAudioAlert}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Siren & Siqnal Yoxla</span>
                  </button>
                </div>

                <div className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 800 280">
                    <defs>
                      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#030712" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>
                      <linearGradient id="gantryTruss" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#475569" />
                        <stop offset="50%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                    </defs>

                    {/* Sky & Horizon */}
                    <rect x="0" y="0" width="800" height="140" fill="url(#skyGrad)" />
                    {/* Asphalt Surface */}
                    <rect x="0" y="140" width="800" height="140" fill="#0f172a" />

                    {/* Road Perspective Lines */}
                    <line x1="80" y1="280" x2="280" y2="140" stroke="#334155" strokeWidth="2" />
                    <line x1="260" y1="280" x2="360" y2="140" stroke="#e2e8f0" strokeDasharray="10 10" strokeWidth="2" />
                    <line x1="440" y1="280" x2="440" y2="140" stroke="#e2e8f0" strokeDasharray="10 10" strokeWidth="2" />
                    <line x1="620" y1="280" x2="520" y2="140" stroke="#e2e8f0" strokeDasharray="10 10" strokeWidth="2" />
                    <line x1="720" y1="280" x2="600" y2="140" stroke="#334155" strokeWidth="2" />

                    {/* Heavy Steel Gantry Truss Structure */}
                    {/* Left Column */}
                    <rect x="90" y="30" width="16" height="130" fill="url(#gantryTruss)" />
                    {/* Right Column */}
                    <rect x="694" y="30" width="16" height="130" fill="url(#gantryTruss)" />
                    {/* Overhead Truss Beam */}
                    <rect x="80" y="26" width="640" height="20" fill="url(#gantryTruss)" rx="2" />
                    <rect x="80" y="74" width="640" height="8" fill="url(#gantryTruss)" rx="1" />
                    {/* Cross braces */}
                    <line x1="120" y1="26" x2="160" y2="74" stroke="#64748b" strokeWidth="2" />
                    <line x1="160" y1="26" x2="120" y2="74" stroke="#64748b" strokeWidth="2" />
                    <line x1="220" y1="26" x2="260" y2="74" stroke="#64748b" strokeWidth="2" />
                    <line x1="260" y1="26" x2="220" y2="74" stroke="#64748b" strokeWidth="2" />
                    <line x1="540" y1="26" x2="580" y2="74" stroke="#64748b" strokeWidth="2" />
                    <line x1="580" y1="26" x2="540" y2="74" stroke="#64748b" strokeWidth="2" />
                    <line x1="640" y1="26" x2="680" y2="74" stroke="#64748b" strokeWidth="2" />
                    <line x1="680" y1="26" x2="640" y2="74" stroke="#64748b" strokeWidth="2" />

                    {/* Center VMS Matrix Display Board */}
                    <rect x="230" y="14" width="340" height="52" fill="#020617" stroke="#f59e0b" strokeWidth="2" rx="4" />
                    {/* Red speed circle sign on left of board */}
                    <circle cx="260" cy="40" r="18" fill="#ffffff" stroke="#ef4444" strokeWidth="4" />
                    <text x="260" y="45" fill="#000000" fontSize="13" fontWeight="bold" textAnchor="middle">
                      {variableSpeedLimitKmH}
                    </text>
                    {/* Message text on right of board */}
                    <text x="290" y="34" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      {simResult.pictorialWarningSign} {simResult.dynamicMessageAz.substring(0, 24)}
                    </text>
                    <text x="290" y="52" fill="#f8fafc" fontSize="9" fontFamily="monospace">
                      {simResult.dynamicMessageEn.substring(0, 32)}
                    </text>

                    {/* Overhead Lane Control Signals (LCS) */}
                    {[1, 2, 3, 4].map((laneNum) => {
                      const lcsX = 140 + (laneNum - 1) * 140;
                      const isCurrentChosen = chosenLane === laneNum;
                      const state = isCurrentChosen ? currentLcsState : 'LANE_OPEN_GREEN_ARROW';

                      let symbolColor = '#22c55e';
                      let symbol = '↓';
                      if (state === 'LANE_CLOSED_RED_CROSS') {
                        symbolColor = '#ef4444';
                        symbol = '✕';
                      } else if (state === 'MERGE_LEFT_AMBER_ARROW') {
                        symbolColor = '#f59e0b';
                        symbol = '↖';
                      } else if (state === 'MERGE_RIGHT_AMBER_ARROW') {
                        symbolColor = '#f59e0b';
                        symbol = '↗';
                      }

                      return (
                        <g key={laneNum}>
                          {/* LCS Box */}
                          <rect
                            x={lcsX}
                            y="86"
                            width="50"
                            height="44"
                            fill="#090d16"
                            stroke={isCurrentChosen ? '#f59e0b' : '#334155'}
                            strokeWidth={isCurrentChosen ? '2' : '1'}
                            rx="4"
                          />
                          {/* LCS Signal Character */}
                          <text
                            x={lcsX + 25}
                            y="116"
                            fill={symbolColor}
                            fontSize="24"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {symbol}
                          </text>
                          {/* Lane Label */}
                          <text
                            x={lcsX + 25}
                            y="136"
                            fill="#94a3b8"
                            fontSize="9"
                            textAnchor="middle"
                          >
                            Zolaq #{laneNum}
                          </text>
                        </g>
                      );
                    })}

                    {/* Moving Vehicle Positioned in Chosen Lane */}
                    {(() => {
                      const carPositions: Record<number, number> = {
                        1: 170,
                        2: 310,
                        3: 450,
                        4: 590,
                      };
                      const carX = carPositions[chosenLane] || 310;
                      const isRedViolator = currentLcsState === 'LANE_CLOSED_RED_CROSS';
                      return (
                        <g transform={`translate(${carX}, 200)`}>
                          {/* Headlight beams */}
                          <polygon
                            points="-15,0 -35,-80 35,-80 15,0"
                            fill="rgba(254, 240, 138, 0.15)"
                          />
                          {/* Car Body */}
                          <rect
                            x="-28"
                            y="-10"
                            width="56"
                            height="34"
                            fill={isRedViolator ? '#ef4444' : '#3b82f6'}
                            rx="6"
                          />
                          {/* Car Roof */}
                          <rect x="-20" y="-22" width="40" height="16" fill="#1e293b" rx="4" />
                          {/* Headlights */}
                          <circle cx="-20" cy="-6" r="3.5" fill="#fef08a" />
                          <circle cx="20" cy="-6" r="3.5" fill="#fef08a" />
                          {/* License Plate */}
                          <rect x="-14" y="14" width="28" height="8" fill="#ffffff" rx="1" />
                          <text x="0" y="20.5" fill="#000" fontSize="6" fontWeight="bold" textAnchor="middle">
                            {selectedVehicle.plate}
                          </text>
                          {/* Prohibited warning banner if Red X */}
                          {isRedViolator && (
                            <text
                              x="0"
                              y="-30"
                              fill="#ef4444"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="animate-bounce"
                            >
                              ⚠️ QADAĞAN ZOLAĞI!
                            </text>
                          )}
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Controls and Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Lane & LCS Selection */}
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      Zolaq Seçimi: #{chosenLane}
                    </label>
                    <span className="text-xs text-amber-400 font-mono">1-4 Zolaq</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((lane) => (
                      <button
                        key={lane}
                        onClick={() => setChosenLane(lane)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          chosenLane === lane
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        #{lane}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-700/50">
                    <label className="text-xs font-bold text-slate-200 block mb-1.5">
                      Zolaq İşıqforu Siqnalı (LCS):
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        onClick={() => setCurrentLcsState('LANE_OPEN_GREEN_ARROW')}
                        className={`p-2 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                          currentLcsState === 'LANE_OPEN_GREEN_ARROW'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Yaşıl Ox (Açıq)</span>
                      </button>
                      <button
                        onClick={() => setCurrentLcsState('LANE_CLOSED_RED_CROSS')}
                        className={`p-2 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                          currentLcsState === 'LANE_CLOSED_RED_CROSS'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <X className="w-3.5 h-3.5 text-rose-400" />
                        <span>Qırmızı X (Qapalı)</span>
                      </button>
                      <button
                        onClick={() => setCurrentLcsState('MERGE_LEFT_AMBER_ARROW')}
                        className={`p-2 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                          currentLcsState === 'MERGE_LEFT_AMBER_ARROW'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <ArrowUpLeft className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sarı Ox (Sol)</span>
                      </button>
                      <button
                        onClick={() => setCurrentLcsState('MERGE_RIGHT_AMBER_ARROW')}
                        className={`p-2 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                          currentLcsState === 'MERGE_RIGHT_AMBER_ARROW'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sarı Ox (Sağ)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Speed & VSL Controls */}
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-200">Avtomobil Sürəti:</span>
                      <span className="font-mono text-cyan-400 font-bold">{vehicleSpeedKmH} km/s</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="160"
                      step="5"
                      value={vehicleSpeedKmH}
                      onChange={(e) => setVehicleSpeedKmH(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-200">Dinamik Hədd (VSL):</span>
                      <span className="font-mono text-amber-400 font-bold">{variableSpeedLimitKmH} km/s</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      {[40, 60, 80, 90, 110].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setVariableSpeedLimitKmH(spd)}
                          className={`py-1 rounded font-bold transition-all ${
                            variableSpeedLimitKmH === spd
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {spd}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300">Şrift Hündürlüyü:</span>
                      <span className="font-mono text-slate-100">{characterHeightMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="500"
                      step="25"
                      value={characterHeightMm}
                      onChange={(e) => setCharacterHeightMm(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>

                {/* Weather & Optical Environment */}
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <label className="text-xs font-bold text-slate-200 block">
                    Hava və Ətraf Şəraiti:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    {[
                      { id: 'CLEAR_DAY', label: 'Aydın Gün', icon: Sun },
                      { id: 'RAIN_WET', label: 'Yağışlı', icon: CloudRain },
                      { id: 'DENSE_FOG', label: 'Qatı Duman', icon: CloudFog },
                      { id: 'NIGHT_DARK', label: 'Gecə Qaranlıq', icon: Moon },
                      { id: 'SNOW_BLIZZARD', label: 'Çovğun/Qar', icon: Snowflake },
                    ].map((w) => {
                      const Icon = w.icon;
                      const isSelected = weatherCondition === w.id;
                      return (
                        <button
                          key={w.id}
                          onClick={() => setWeatherCondition(w.id as WeatherCondition)}
                          className={`p-1.5 rounded-lg flex flex-col items-center gap-1 font-medium transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{w.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300">Mesajdakı Söz Sayı:</span>
                      <span className="font-mono text-cyan-400">{messageWordCount} söz</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      step="1"
                      value={messageWordCount}
                      onChange={(e) => setMessageWordCount(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Simulation Results Stand */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-300">
                    EN 12966 Optik Oxunaqlılıq və Təhlükəsizlik Qiymətləndirməsi
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      simResult.readingFeasibility === 'OPTIMAL'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : simResult.readingFeasibility === 'ACCEPTABLE'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : simResult.readingFeasibility === 'MARGINAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {simResult.readingFeasibility}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400">Oxuma Məsafəsi:</span>
                    <p className="text-lg font-bold text-amber-300 mt-1">
                      {simResult.legibilityDistanceM} m
                    </p>
                    <span className="text-[10px] text-slate-500">EN 12966 normativ</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400">Mövcud Baxış Vaxtı:</span>
                    <p className="text-lg font-bold text-cyan-300 mt-1">
                      {simResult.availableReadingTimeSec} s
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Tələb: {simResult.requiredReadingTimeSec} s
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400">Kontrast Əmsalı (LR):</span>
                    <p className="text-lg font-bold text-emerald-300 mt-1">
                      {simResult.contrastRatioLR} : 1
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Sinif: {simResult.en12966LuminanceClass}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400">Zolaq Statusu:</span>
                    <p
                      className={`text-sm font-bold mt-1.5 truncate ${
                        simResult.laneSafetyOutcome === 'SAFE_IN_OPEN_LANE'
                          ? 'text-emerald-400'
                          : simResult.laneSafetyOutcome === 'MANDATORY_MERGE_REQUIRED'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {simResult.laneSafetyOutcome}
                    </p>
                  </div>
                </div>

                {/* Fine / Infraction Alert if Any */}
                {simResult.totalFineAzn > 0 && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-rose-300">
                          İnzibati Xəta Aşkarlanmışdır!
                        </span>
                        <p className="text-slate-300 text-[11px]">
                          {simResult.isRedCrossViolation && 'Qırmızı "X" altında hərəkət (İXM 327.2). '}
                          {simResult.isSpeeding &&
                            `VSL dinamik sürət həddinin aşılması (${simResult.speedDeltaKmH} km/s artıq, İXM 328). `}
                          {simResult.isAmberDisobedience && 'Sarı diaqonal ox tələbinin pozulması (İXM 327.1).'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-400 text-sm">
                        {convertVmsCurrency(simResult.totalFineAzn, selectedCurrency)}{' '}
                        {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                      </span>
                      <p className="text-[10px] text-emerald-400">
                        50% endirimlə:{' '}
                        {convertVmsCurrency(simResult.totalFineWithDiscountAzn, selectedCurrency)}{' '}
                        {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleGenerateCertificate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Rəsmi VMS Sertifikatı Tərtib Et</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS & FINES */}
          {activeTab === 'fines' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  Nəqliyyat Preseti və İXM Qanunvericiliyi üzrə Cərimə Məzənnəsi
                </h3>
                <p className="text-xs text-slate-400">
                  Azərbaycan Respublikasının İnzibati Xətalar Məcəlləsinin 327.2, 328 və 38-ci maddələri
                </p>
              </div>

              {/* Vehicle Preset Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_VMS_VEHICLES.map((v) => {
                  const isSelected = selectedVehicle.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleApplyVehiclePreset(v)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/60 shadow-md'
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-100">{v.name}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-900 text-amber-400 border border-slate-700">
                          {v.plate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{v.vehicleType}</p>
                      <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between text-[10px] text-slate-300">
                        <span>Zolaq: #{v.selectedLane}</span>
                        <span>{v.grossWeightKg.toLocaleString()} kq</span>
                        <span>{v.adasTsrEquipped ? 'ADAS TSR: Var' : 'TSR: Yox'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Statutory Fines Matrix */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Dövlət Yol Polisi (BDYP) İnzibati Xətalar Cədvəli
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-[11px]">
                        <th className="py-2 px-2.5">Xəta / İnzibati Maddə</th>
                        <th className="py-2 px-2.5">Təsvir</th>
                        <th className="py-2 px-2.5">Standart Cərimə</th>
                        <th className="py-2 px-2.5">30 Günlük 50% Endirim</th>
                        <th className="py-2 px-2.5">Cərimə Balı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="py-2.5 px-2.5 font-bold text-rose-400">İXM Maddə 327.2</td>
                        <td className="py-2.5 px-2.5">
                          Qırmızı "X" zolaq işıqforunun qadağanedici siqnalına məhəl qoymamaq
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-100">
                          {convertVmsCurrency(80, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-emerald-400">
                          {convertVmsCurrency(40, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-amber-400">3 Bal</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2.5 font-bold text-amber-400">İXM Maddə 328.1</td>
                        <td className="py-2.5 px-2.5">VSL həddini 10-20 km/s aşmaq</td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-100">
                          {convertVmsCurrency(20, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-emerald-400">
                          {convertVmsCurrency(10, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-400">0 Bal</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2.5 font-bold text-amber-400">İXM Maddə 328.2</td>
                        <td className="py-2.5 px-2.5">VSL həddini 20-40 km/s aşmaq</td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-100">
                          {convertVmsCurrency(50, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-emerald-400">
                          {convertVmsCurrency(25, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-amber-400">2 Bal</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2.5 font-bold text-amber-400">İXM Maddə 328.3</td>
                        <td className="py-2.5 px-2.5">VSL həddini 40-60 km/s aşmaq</td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-100">
                          {convertVmsCurrency(150, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-emerald-400">
                          {convertVmsCurrency(75, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-amber-400">3 Bal</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2.5 font-bold text-rose-400">İXM Maddə 328.4</td>
                        <td className="py-2.5 px-2.5">VSL həddini 60 km/s-dən çox aşmaq</td>
                        <td className="py-2.5 px-2.5 font-bold text-slate-100">
                          {convertVmsCurrency(250, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-emerald-400">
                          {convertVmsCurrency(125, selectedCurrency)}{' '}
                          {VMS_CURRENCY_SYMBOLS[selectedCurrency]}
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-amber-400">4 Bal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    VMS və Qantry Qurğularının 10-Bəndlik Texniki Uyğunluq Standartı
                  </h3>
                  <p className="text-xs text-slate-400">
                    AZS 410, AZS 342, EN 12966 və NTCIP 1203 tələbləri
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCheckedItems(MOCK_VMS_CHECKLIST.map((i) => i.id))}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={() => setCheckedItems([])}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Uyğunluq Səviyyəsi:</span>
                  <span className="text-amber-400 font-bold">{checklistResult.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${checklistResult.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">{checklistResult.statusTextAz}</p>
              </div>

              {/* Checklist items */}
              <div className="space-y-2">
                {MOCK_VMS_CHECKLIST.map((item, idx) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isChecked) {
                          setCheckedItems(checkedItems.filter((id) => id !== item.id));
                        } else {
                          setCheckedItems([...checkedItems, item.id]);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-amber-950/20 border-amber-500/40 text-slate-100'
                          : 'bg-slate-800/30 border-slate-700/50 text-slate-400'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">
                            {idx + 1}. {item.titleAz}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400">
                            {item.statutoryStandard}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.descriptionAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    VMS, Qantry və Zolaq İdarəetmə Qaydaları üzrə Nəzəri İmtahan
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və BDYP təsdiqli 10 suallıq attestasiya testi (keçid balı: 80%)
                  </p>
                </div>
                {examSubmitted && (
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Yenidən Başla
                  </button>
                )}
              </div>

              {examSubmitted && (
                <div
                  className={`p-4 rounded-xl border ${
                    examResult.passed
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {examResult.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        Nəticə: {examResult.scorePercentage}% ({examResult.correctAnswersCount} /{' '}
                        {examResult.totalQuestions} düzgün)
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">{examResult.feedbackAz}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {MOCK_VMS_EXAM.map((q, idx) => {
                  const selectedIdx = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {idx + 1}. {q.questionAz}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono whitespace-nowrap">
                          {q.legalCitation}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedIdx === optIdx;
                          let btnStyle = 'bg-slate-800/80 text-slate-300 hover:bg-slate-700';

                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={examSubmitted}
                              onClick={() => setExamAnswers({ ...examAnswers, [q.id]: optIdx })}
                              className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] flex-shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="pt-2 text-[11px] text-amber-300/90 border-t border-slate-700/50">
                          💡 <span className="font-semibold">İzah:</span> {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!examSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Cavabları Təsdiqlə və Qiymətləndir
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    Rəsmi Elektron VMS Keçid və Optik Uyğunluq Sertifikatı
                  </h3>
                  <p className="text-xs text-slate-400">
                    SİMA rəqəmsal imzalı, QR kodlu və AAYDA/BDYP vahid reyestr qeydiyyatlı sənəd
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCert}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCertId ? 'Kopyalandı!' : 'Kopyala'}</span>
                  </button>
                  <button
                    onClick={handlePrintCert}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Printable Certificate Frame */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/50 shadow-2xl space-y-5 text-slate-100">
                {/* Certificate Header */}
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                      AZƏRBAYCAN RESPUBLİKASI • AAYDA / AYNA / BDYP
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-amber-200 mt-0.5">
                      VMS-SAFE-AZ-2026 ELEKTRON SERTİFİKATI
                    </h2>
                    <p className="text-xs text-slate-400">
                      Magistral Qantry VMS və Zolaq Nəzarət Siqnallarına (LCS) Uyğunluq Qeydiyyatı
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {activeCertificate.certificateId}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      PIN: <span className="font-mono text-slate-200">{activeCertificate.verificationPin}</span>
                    </p>
                  </div>
                </div>

                {/* Certificate Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Nəqliyyat Vasitəsi:</span>
                    <span className="font-bold text-slate-100">{activeCertificate.vehiclePlate}</span>
                    <p className="text-[10px] text-slate-400 truncate">{activeCertificate.vehicleName}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Qantry Portalı & Piket:</span>
                    <span className="font-bold text-amber-300">{activeCertificate.gantryCode}</span>
                    <p className="text-[10px] text-slate-400 truncate">{activeCertificate.picketKm}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Magistral Dəhliz:</span>
                    <span className="font-bold text-slate-200">{activeCertificate.corridorName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Zolaq & LCS Siqnalı:</span>
                    <span className="font-bold text-cyan-300">
                      Zolaq #{activeCertificate.chosenLane} ({activeCertificate.lcsState})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Sürət & Dinamik Hədd (VSL):</span>
                    <span className="font-bold text-amber-400">
                      {activeCertificate.vehicleSpeedKmH} km/s (VSL: {activeCertificate.vslSpeedLimitKmH} km/s)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Optik Oxuma Məsafəsi:</span>
                    <span className="font-bold text-emerald-400">{activeCertificate.legibilityDistanceM} metr</span>
                  </div>
                </div>

                {/* Digital Verification Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-[10px] text-slate-400 block">SİMA Rəqəmsal İmza UID:</span>
                    <span className="font-mono text-cyan-400 text-xs font-semibold">
                      {activeCertificate.simaSignatureUid}
                    </span>
                    <p className="text-[10px] font-mono text-slate-500 truncate max-w-sm">
                      SHA256: {activeCertificate.sha256Checksum}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ✓ DÖVLƏT REYESTRİNDƏ TƏSDİQLƏNİB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    Vahid Açıq VMS və LCS Elektron Qeydiyyat Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, AYNA və BDYP tərəfindən verilmiş rəsmi sertifikatların yoxlanması
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Sertifikat, nömrə və ya qantry..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredRegistry.map((item) => (
                  <div
                    key={item.certificateId}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300 font-mono">
                          {item.certificateId}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-900 text-slate-200 border border-slate-700">
                          {item.vehiclePlate}
                        </span>
                        <span className="text-[11px] text-slate-400">({item.vehicleName})</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {item.corridorName} • {item.gantryCode} ({item.picketKm})
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>Zolaq: #{item.chosenLane}</span>
                        <span>Sürət: {item.vehicleSpeedKmH} km/s</span>
                        <span>Məsafə: {item.legibilityDistanceM}m</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {item.laneSafetyOutcome}
                      </span>
                      <button
                        onClick={() => {
                          setActiveCertificate(item);
                          setActiveTab('certificate');
                        }}
                        className="text-amber-400 hover:text-amber-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Detallara Bax</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>NİİM SCADA Şəbəkəsi Aktivdir: 100% Gantry Monitorinqi</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>EN 12966 L3/R3/C2</span>
            <span>NTCIP 1203 V2</span>
            <span>İXM Maddə 327.2 / 328</span>
          </div>
        </div>
      </div>
    </div>
  );
};
