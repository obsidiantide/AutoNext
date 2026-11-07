import React, { useState, useMemo } from 'react';
import {
  X,
  Footprints,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ClipboardCheck,
  GraduationCap,
  FileText,
  Database,
  Search,
  Building2,
  Wind,
  Thermometer,
  Zap,
  Copy,
  Printer,
  RotateCcw,
  Volume2,
  Car,
  Truck,
  ArrowRight,
  ChevronRight,
  Accessibility,
} from 'lucide-react';
import {
  Currency,
  convertFootbridgeCurrency,
  FOOTBRIDGE_SAFE_CURRENCY_SYMBOLS,
  calculateFootbridgeTelemetry,
  generateFootbridgeHash,
  evaluateFootbridgeExam,
  FootbridgeSimulationInputs,
  FootbridgeStation,
  FootbridgeVehiclePreset,
  FootbridgeCertificate,
  STATUTORY_MIN_CLEARANCE_METERS,
} from '../utils/footbridgeSafeCompliance';
import {
  MOCK_FOOTBRIDGE_STATIONS,
  MOCK_FOOTBRIDGE_VEHICLE_PRESETS,
  MOCK_FOOTBRIDGE_CHECKLIST,
  MOCK_FOOTBRIDGE_EXAM_QUESTIONS,
  MOCK_FOOTBRIDGE_CERTIFICATES,
  DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS,
} from '../data/mockFootbridgeSafeData';

export interface FootbridgeSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'az' | 'en' | 'ru';
}

type TabType = 'radar' | 'simulator' | 'presets' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const FootbridgeSafeModal: React.FC<FootbridgeSafeModalProps> = ({
  isOpen,
  onClose,
  language = 'az',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<FootbridgeStation>(MOCK_FOOTBRIDGE_STATIONS[0]);
  const [selectedPreset, setSelectedPreset] = useState<FootbridgeVehiclePreset>(MOCK_FOOTBRIDGE_VEHICLE_PRESETS[3]);
  const [simInputs, setSimInputs] = useState<FootbridgeSimulationInputs>(DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'chk-clearance': true,
    'chk-prm-elevators': true,
    'chk-stair-heating': true,
    'chk-fence-containment': true,
    'chk-triplex-glass': true,
    'chk-ai-cctv': true,
  });

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Certificates state
  const [certificates, setCertificates] = useState<FootbridgeCertificate[]>(MOCK_FOOTBRIDGE_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<FootbridgeCertificate | null>(MOCK_FOOTBRIDGE_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Telemetry computation
  const telemetry = useMemo(() => calculateFootbridgeTelemetry(simInputs), [simInputs]);

  // Filtered stations
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_FOOTBRIDGE_STATIONS;
    const q = searchQuery.toLowerCase();
    return MOCK_FOOTBRIDGE_STATIONS.filter(
      (s) =>
        s.nameAz.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.routeNumber.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.corridor.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered certificates
  const filteredCertificates = useMemo(() => {
    if (!searchQuery.trim()) return certificates;
    const q = searchQuery.toLowerCase();
    return certificates.filter(
      (c) =>
        c.certificateId.toLowerCase().includes(q) ||
        c.vehiclePlate.toLowerCase().includes(q) ||
        c.footbridgeCode.toLowerCase().includes(q) ||
        c.footbridgeName.toLowerCase().includes(q)
    );
  }, [certificates, searchQuery]);

  // Audio warning chime synthesis
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext not available or blocked in browser
    }
  };

  const handleSelectPreset = (preset: FootbridgeVehiclePreset) => {
    setSelectedPreset(preset);
    if (preset.isJaywalkingPedestrian) {
      setSimInputs((prev) => ({
        ...prev,
        crossViaOverpass: false,
        medianFenceIntact: !preset.isVandalismActor,
      }));
      playAlertChime();
    } else {
      setSimInputs((prev) => ({
        ...prev,
        crossViaOverpass: true,
        medianFenceIntact: true,
        bridgeClearanceMeters: Math.max(5.50, preset.heightMeters + 1.2),
      }));
    }
  };

  const handleGenerateCertificate = () => {
    const newCert: FootbridgeCertificate = {
      certificateId: `FOOTBRIDGE-SAFE-AZ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      vehiclePlate: selectedPreset.licensePlate,
      footbridgeCode: selectedStation.code,
      footbridgeName: selectedStation.nameAz,
      routeNumber: selectedStation.routeNumber,
      crossingSafetyScorePercent: telemetry.crossingSafetyScorePercent,
      prmComplianceScorePercent: telemetry.prmAccessibilityScorePercent,
      sha256Checksum: generateFootbridgeHash(selectedPreset.licensePlate),
      simaSignatureUid: `SIMA-AZ-FB-2026-AAYDA-${Math.floor(1000 + Math.random() * 9000)}`,
      verificationPin: `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      inspectorOfficer: 'Polis Polkovnik-Leytenantı E. Məmmədov (BDYP / AAYDA)',
      status: 'ACTIVE',
    };
    setCertificates((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const examEvaluation = useMemo(() => {
    return evaluateFootbridgeExam(examAnswers, MOCK_FOOTBRIDGE_EXAM_QUESTIONS);
  }, [examAnswers]);

  if (!isOpen) return null;

  const sym = FOOTBRIDGE_SAFE_CURRENCY_SYMBOLS[currency];
  const formatMoney = (azn: number) => `${sym}${convertFootbridgeCurrency(azn, currency).toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Footprints className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-wide text-white">
                  AAYDA • AYNA • BDYP FOOTBRIDGE-SAFE-AZ-2026
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  AZS 410 / EN 1991-1-7 / EN 81-70
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Magistral Yerüstü Piyada Keçidləri, Şüşəbəndli Körpülər, PRM Panoramik Liftlər və SİMA Rəqəmsal Nəzarət Portalı
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency selector */}
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    currency === curr
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 px-4 scrollbar-none text-xs font-medium">
          {[
            { id: 'radar', label: '1. Keçidlər Radarı (6 Stansiya)', icon: Building2 },
            { id: 'simulator', label: '2. SCADA Keçid Simulyatoru', icon: Sliders },
            { id: 'presets', label: '3. Qəza və Sanksiyalar Stendi', icon: Shield },
            { id: 'checklist', label: '4. 10 Bəndlik Texniki Audit', icon: ClipboardCheck },
            { id: 'exam', label: '5. Qanunvericilik İmtahanı', icon: GraduationCap },
            { id: 'certificate', label: '6. Rəsmi SİMA Sertifikatı', icon: FileText },
            { id: 'registry', label: '7. İctimai Reyestr', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/90 space-y-6">
          {/* TAB 1: RADAR & STATIONS */}
          {activeTab === 'radar' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Keçid adı, piket km və ya marşrut nömrəsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  AAYDA Aktiv Yerüstü Keçidlər: <span className="text-emerald-400 font-bold">{filteredStations.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((station) => {
                  const isSelected = selectedStation.id === station.id;
                  return (
                    <div
                      key={station.id}
                      onClick={() => {
                        setSelectedStation(station);
                        setSimInputs((prev) => ({
                          ...prev,
                          bridgeClearanceMeters: station.clearanceMeters,
                        }));
                      }}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-emerald-300 rounded border border-slate-700">
                          {station.code} • {station.picketKm}
                        </span>
                        <span className="flex items-center text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {station.prmElevatorsStatus}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 leading-snug">{station.nameAz}</h4>
                      <p className="text-xs text-slate-400 mb-3">{station.corridor}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                        <div>
                          <span className="text-slate-500">Şaquli Qabarit:</span>
                          <span className="font-bold text-emerald-400 ml-1">{station.clearanceMeters}m</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Zolaq Sayı:</span>
                          <span className="font-bold text-slate-300 ml-1">{station.lanesSpanned} zolaq</span>
                        </div>
                        <div>
                          <span className="text-slate-500">PRM Liftlər:</span>
                          <span className="font-bold text-indigo-400 ml-1">{station.prmElevatorsCount} Panoramik</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Qış Qızdırıcı:</span>
                          <span className={`font-bold ml-1 ${station.heatingActive ? 'text-amber-400' : 'text-slate-400'}`}>
                            {station.heatingActive ? 'Aktiv (Auto)' : 'Gözləmədə'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Piyada Axını:</span>
                          <span className="font-bold text-slate-300 ml-1">{station.hourlyPedestrianVolume} piyada/saat</span>
                        </div>
                        <div>
                          <span className="text-slate-500">AI Kameralar:</span>
                          <span className="font-bold text-emerald-400 ml-1">{station.cctvAiCamerasCount} CCTV Tripwire</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStation(station);
                          setSimInputs((prev) => ({
                            ...prev,
                            bridgeClearanceMeters: station.clearanceMeters,
                          }));
                          setActiveTab('simulator');
                        }}
                        className="w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <span>Simulyatorda Yoxla</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SCADA TELEMETRY & CROSSING SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* 2D SVG Motorway Cross-Section Visualizer */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-emerald-400">2D SCADA İnfrastruktur Kəsiyi:</span>
                    <span className="text-slate-400">{selectedStation.nameAz} ({selectedStation.clearanceMeters}m qabarit)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      simInputs.crossViaOverpass
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    }`}>
                      {simInputs.crossViaOverpass ? 'QORUNAN YERÜSTÜ HƏRƏKƏT' : 'TƏHLÜKƏLİ AT-GRADE QAÇIŞ!'}
                    </span>
                    <button
                      onClick={playAlertChime}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Səs Testi"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative w-full h-56 bg-gradient-to-b from-sky-950/40 via-slate-950 to-slate-900 rounded-lg overflow-hidden border border-slate-800/80">
                  <svg className="w-full h-full" viewBox="0 0 900 240" preserveAspectRatio="none">
                    {/* Sky & Clouds */}
                    <rect x="0" y="0" width="900" height="150" fill="#090d16" />
                    
                    {/* Road Surface (6 Lanes) */}
                    <rect x="120" y="150" width="660" height="80" fill="#1e293b" />
                    
                    {/* Lane Striping */}
                    {[150, 175, 200].map((y, idx) => (
                      <line
                        key={idx}
                        x1="120"
                        y1={y}
                        x2="780"
                        y2={y}
                        stroke="#64748b"
                        strokeDasharray="15 15"
                        strokeWidth="2"
                      />
                    ))}

                    {/* Central Median Barrier & 2m Anti-Pedestrian Fence */}
                    <rect x="445" y="150" width="10" height="30" fill="#475569" />
                    {simInputs.medianFenceIntact ? (
                      <g>
                        {/* 2.0m High-Tensile Steel Mesh Fence */}
                        <line x1="450" y1="150" x2="450" y2="105" stroke="#10b981" strokeWidth="3" />
                        <line x1="440" y1="110" x2="460" y2="110" stroke="#10b981" strokeWidth="1.5" />
                        <line x1="440" y1="125" x2="460" y2="125" stroke="#10b981" strokeWidth="1.5" />
                        <line x1="440" y1="140" x2="460" y2="140" stroke="#10b981" strokeWidth="1.5" />
                        <text x="450" y="100" fill="#10b981" fontSize="9" textAnchor="middle">2.0m Tor Çəpər</text>
                      </g>
                    ) : (
                      <g>
                        {/* Broken Vandalized Fence */}
                        <line x1="450" y1="150" x2="445" y2="125" stroke="#f43f5e" strokeWidth="3" />
                        <line x1="445" y1="125" x2="460" y2="140" stroke="#f43f5e" strokeWidth="3" strokeDasharray="3 3" />
                        <text x="450" y="100" fill="#f43f5e" fontSize="9" textAnchor="middle" fontWeight="bold">Çəpər Qırılıb!</text>
                      </g>
                    )}

                    {/* Dual Elevator Towers (Left & Right) */}
                    {/* Left Tower */}
                    <rect x="70" y="40" width="50" height="190" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="4" />
                    <rect x="80" y="55" width="30" height="40" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
                    <rect x="80" y="145" width="30" height="40" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
                    <text x="95" y="32" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">PRM Lift-A</text>

                    {/* Right Tower */}
                    <rect x="780" y="40" width="50" height="190" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="4" />
                    <rect x="790" y="55" width="30" height="40" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
                    <rect x="790" y="145" width="30" height="40" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
                    <text x="805" y="32" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">PRM Lift-B</text>

                    {/* Footbridge Overhead Enclosed Glass Gallery */}
                    <rect
                      x="110"
                      y="45"
                      width="680"
                      height="35"
                      fill="#047857"
                      fillOpacity="0.25"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      rx="6"
                    />
                    {/* Glass Triplex Panels */}
                    {[180, 260, 340, 420, 500, 580, 660, 740].map((x, idx) => (
                      <line key={idx} x1={x} y1="45" x2={x} y2="80" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.7" />
                    ))}

                    {/* Bridge Lower Girder and Vertical Clearance Arrow */}
                    <line x1="300" y1="80" x2="300" y2="150" stroke="#eab308" strokeWidth="2" markerEnd="url(#arrow)" />
                    <line x1="290" y1="80" x2="310" y2="80" stroke="#eab308" strokeWidth="2" />
                    <line x1="290" y1="150" x2="310" y2="150" stroke="#eab308" strokeWidth="2" />
                    <text x="320" y="118" fill="#eab308" fontSize="11" fontWeight="bold">
                      H = {simInputs.bridgeClearanceMeters}m {simInputs.bridgeClearanceMeters >= 5.50 ? '✓' : '⚠️ <5.50m'}
                    </text>

                    {/* Vehicles on Highway Underneath */}
                    {/* Car 1 */}
                    <rect x="200" y="165" width="55" height="22" rx="4" fill="#3b82f6" />
                    <circle cx="212" cy="188" r="6" fill="#000" />
                    <circle cx="243" cy="188" r="6" fill="#000" />

                    {/* Truck 2 */}
                    <rect x="530" y="148" width="90" height="42" rx="3" fill="#f97316" />
                    <circle cx="545" cy="190" r="7" fill="#000" />
                    <circle cx="565" cy="190" r="7" fill="#000" />
                    <circle cx="605" cy="190" r="7" fill="#000" />

                    {/* Pedestrian Visualizer */}
                    {simInputs.crossViaOverpass ? (
                      /* Walking Safely inside Bridge */
                      <g>
                        <circle cx="450" cy="58" r="5" fill="#34d399" />
                        <line x1="450" y1="63" x2="450" y2="74" stroke="#34d399" strokeWidth="2.5" />
                        <line x1="445" y1="68" x2="455" y2="68" stroke="#34d399" strokeWidth="2" />
                        <text x="450" y="40" fill="#34d399" fontSize="10" textAnchor="middle" fontWeight="bold">Təhlükəsiz Piyada</text>
                      </g>
                    ) : (
                      /* Jaywalking on Road Surface! */
                      <g>
                        <circle cx="420" cy="165" r="5" fill="#f43f5e" />
                        <line x1="420" y1="170" x2="420" y2="182" stroke="#f43f5e" strokeWidth="2.5" />
                        <line x1="415" y1="174" x2="425" y2="174" stroke="#f43f5e" strokeWidth="2" />
                        <text x="420" y="155" fill="#f43f5e" fontSize="10" textAnchor="middle" fontWeight="bold">QƏZA TƏHLÜKƏSİ!</text>
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* Sliders and Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {/* Traffic Speed Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Magistral Hərəkət Sürəti:</span>
                    <span className="font-bold text-emerald-400">{simInputs.trafficSpeedKmh} km/saat</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="130"
                    step="5"
                    value={simInputs.trafficSpeedKmh}
                    onChange={(e) => setSimInputs((prev) => ({ ...prev, trafficSpeedKmh: Number(e.target.value) }))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>40 km/h</span>
                    <span>90 km/h</span>
                    <span>130 km/h</span>
                  </div>
                </div>

                {/* Traffic Flow Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Nəqliyyat Axını:</span>
                    <span className="font-bold text-sky-400">{simInputs.trafficFlowVehHour} avto/saat</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="4500"
                    step="100"
                    value={simInputs.trafficFlowVehHour}
                    onChange={(e) => setSimInputs((prev) => ({ ...prev, trafficFlowVehHour: Number(e.target.value) }))}
                    className="w-full accent-sky-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>500 v/h</span>
                    <span>2400 v/h</span>
                    <span>4500 v/h</span>
                  </div>
                </div>

                {/* Vertical Clearance Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Şaquli Qabarit (Hündürlük):</span>
                    <span className={`font-bold ${simInputs.bridgeClearanceMeters >= 5.50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simInputs.bridgeClearanceMeters} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4.8"
                    max="6.5"
                    step="0.05"
                    value={simInputs.bridgeClearanceMeters}
                    onChange={(e) => setSimInputs((prev) => ({ ...prev, bridgeClearanceMeters: Number(e.target.value) }))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>4.8m (Kritik)</span>
                    <span className="text-amber-400 font-semibold">5.50m (AZS 410)</span>
                    <span>6.5m</span>
                  </div>
                </div>

                {/* Ambient Temperature Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Ətraf Temperatur (Qızdırıcı):</span>
                    <span className={`font-bold ${simInputs.ambientTemperatureC <= 3 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {simInputs.ambientTemperatureC > 0 ? `+${simInputs.ambientTemperatureC}` : simInputs.ambientTemperatureC}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="40"
                    step="1"
                    value={simInputs.ambientTemperatureC}
                    onChange={(e) => setSimInputs((prev) => ({ ...prev, ambientTemperatureC: Number(e.target.value) }))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-15°C</span>
                    <span>+3°C (Auto On)</span>
                    <span>+40°C</span>
                  </div>
                </div>

                {/* Khazri Wind Gust Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Xəzri Külək Sürəti:</span>
                    <span className={`font-bold ${simInputs.windGustSpeedKmh >= 100 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {simInputs.windGustSpeedKmh} km/saat
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="140"
                    step="5"
                    value={simInputs.windGustSpeedKmh}
                    onChange={(e) => setSimInputs((prev) => ({ ...prev, windGustSpeedKmh: Number(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0 (Sakit)</span>
                    <span>70 (Mülayim)</span>
                    <span>140 km/h (Qasırğa)</span>
                  </div>
                </div>

                {/* PRM Elevator Load Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">PRM Lift Yükü (EN 81-70):</span>
                    <span className={`font-bold ${simInputs.elevatorOccupantsKg > 1000 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {simInputs.elevatorOccupantsKg} kq ({Math.round(simInputs.elevatorOccupantsKg / 75)} nəfər)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1400"
                    step="50"
                    value={simInputs.elevatorOccupantsKg}
                    onChange={(e) => setSimInputs((prev) => ({ ...prev, elevatorOccupantsKg: Number(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0 kg</span>
                    <span>800 kg</span>
                    <span>1000 kg (Maks)</span>
                  </div>
                </div>
              </div>

              {/* Toggles Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={simInputs.crossViaOverpass}
                      onChange={(e) => {
                        setSimInputs((prev) => ({ ...prev, crossViaOverpass: e.target.checked }));
                        if (!e.target.checked) playAlertChime();
                      }}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className={simInputs.crossViaOverpass ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      Piyada Körpüdən İstifadə Edir
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={simInputs.medianFenceIntact}
                      onChange={(e) => {
                        setSimInputs((prev) => ({ ...prev, medianFenceIntact: e.target.checked }));
                        if (!e.target.checked) playAlertChime();
                      }}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className={simInputs.medianFenceIntact ? 'text-slate-300' : 'text-rose-400 font-semibold'}>
                      2.0m Ayırıcı Zolaq Çəpəri Qorunur
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => setSimInputs(DEFAULT_FOOTBRIDGE_SIMULATION_INPUTS)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              {/* Dynamic Telemetry Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">Keçid Təhlükəsizlik İndeksi:</div>
                  <div className={`text-lg font-bold ${
                    telemetry.crossingSafetyScorePercent >= 90 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {telemetry.crossingSafetyScorePercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {simInputs.crossViaOverpass ? '100% Qorunan Səviyyə' : 'At-Grade Kritik Ölüm Riski'}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">At-Grade Qəza/Ölüm Riski:</div>
                  <div className={`text-lg font-bold ${
                    telemetry.atGradeFatalityRiskPercent === 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {telemetry.atGradeFatalityRiskPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {telemetry.atGradeFatalityRiskPercent > 0 ? 'İXM 338 Maddəsi ilə Qadağan' : 'Sıfır Risk'}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">PRM Lift Uyğunluğu (EN 81-70):</div>
                  <div className={`text-lg font-bold ${
                    telemetry.prmAccessibilityScorePercent >= 90 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {telemetry.prmAccessibilityScorePercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">Maksimum Tutum: 1000 kq</div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">Qış Qızdırıcı Güc Tələbatı:</div>
                  <div className="text-lg font-bold text-amber-400">
                    {telemetry.heatingPowerDemandKw} kVt
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Buzlaşma Riski: {telemetry.stairIceRiskPercent}%
                  </div>
                </div>
              </div>

              {/* Action Banner to Issue SİMA Certificate */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 p-4 rounded-xl border border-emerald-500/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Rəsmi FOOTBRIDGE-SAFE-AZ-2026 Sertifikatı</h4>
                    <p className="text-xs text-slate-400">
                      SİMA rəqəmsal imzası və SHA-256 kriptoqrafik çeksum ilə təsdiqlənmiş elektron akt yaradın.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateCertificate}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-950/40"
                >
                  Sertifikat Formalaşdır
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE & PEDESTRIAN PRESETS & SANCTIONS */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">Avtonom Nəqliyyat və Piyada İntruziya Preseti Seçin</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_FOOTBRIDGE_VEHICLE_PRESETS.map((preset) => {
                    const isSelected = selectedPreset.id === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`cursor-pointer p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-emerald-950/20 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {preset.licensePlate}
                          </span>
                          <span className="text-[10px] text-slate-400">{preset.vehicleType}</span>
                        </div>
                        <h5 className="text-xs font-bold text-white mb-1">{preset.name}</h5>
                        <p className="text-[11px] text-slate-400 leading-tight mb-2">{preset.riskDescription}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Qabarit: {preset.heightMeters}m</span>
                          <span>Kütlə: {preset.massKg.toLocaleString()} kq</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statutory Fines & Sanctions Calculator Card */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">Qanunvericilik və İnzibati Xətalar Hesabatı</h4>
                    <p className="text-xs text-slate-400">{telemetry.legalReference}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg">
                    İXM Maddə 38: 30 gün ərzində 50% Güzəşt
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">İnzibati Cərimə (Standart):</span>
                    <div className="text-xl font-bold text-rose-400 mt-1">
                      {formatMoney(telemetry.statutoryFineAzn)}
                    </div>
                    <span className="text-[10px] text-slate-500">İXM 338.1 / 338.3 / 353.1</span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-emerald-500/30">
                    <span className="text-xs text-emerald-400 font-semibold">50% Endirimlə Ödəniş (30 gün):</span>
                    <div className="text-xl font-bold text-emerald-300 mt-1">
                      {formatMoney(telemetry.statutoryFineDiscountedAzn)}
                    </div>
                    <span className="text-[10px] text-emerald-500">Dövlət Rüsumu Portalı / ASAN Pay</span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Mülki Bərpa Dəyəri (MM 1108):</span>
                    <div className="text-xl font-bold text-amber-400 mt-1">
                      {formatMoney(telemetry.restitutionCostAzn)}
                    </div>
                    <span className="text-[10px] text-slate-500">AAYDA Balansına Kompensasiya</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <p>
                    📌 <strong className="text-slate-300">İXM Maddə 338.1:</strong> Piyada tərəfindən magistralda yerüstü keçid mövcud olduğu halda yolu hərəkət hissəsindən keçmə — <strong>20 AZN</strong> cərimə.
                  </p>
                  <p>
                    📌 <strong className="text-slate-300">İXM Maddə 338.3:</strong> Piyadanın hərəkət hissəsinə qəflətən çıxaraq qəza şəraiti yaratması — <strong>40 AZN</strong> cərimə.
                  </p>
                  <p>
                    📌 <strong className="text-slate-300">İXM Maddə 353.1:</strong> Yerüstü piyada körpüsünün liftlərinə, şüşə konstruksiyalarına və ya dəmir torlarına ziyan vurulması — <strong>600 AZN</strong> cərimə + vurulmuş real ziyanın tam bərpası.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT TECHNICAL AUDIT CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">
                  Təsdiqlənmiş bəndlər: <span className="text-emerald-400 font-bold">{Object.values(checkedItems).filter(Boolean).length}</span> / {MOCK_FOOTBRIDGE_CHECKLIST.length}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const all: Record<string, boolean> = {};
                      MOCK_FOOTBRIDGE_CHECKLIST.forEach((item) => (all[item.id] = true));
                      setCheckedItems(all);
                    }}
                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs transition-colors"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                  <button
                    onClick={() => setCheckedItems({})}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-xs transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_FOOTBRIDGE_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => setCheckedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/50'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                          />
                          <div>
                            <h5 className="text-xs font-bold text-white">{item.titleAz}</h5>
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded border border-slate-700">
                              {item.standard}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 pl-6">{item.descriptionAz}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: LEGISLATIVE EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-white">Yol Hərəkəti və Piyada Keçidləri Qanunvericilik İmtahanı</span>
                  <p className="text-slate-400">10 nəzəri sual • Keçid balı: 80% (ən azı 8 düzgün cavab)</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const answers: Record<string, number> = {};
                      MOCK_FOOTBRIDGE_EXAM_QUESTIONS.forEach((q) => (answers[q.id] = q.correctOptionIndex));
                      setExamAnswers(answers);
                      setExamSubmitted(true);
                    }}
                    className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded text-xs transition-colors"
                  >
                    Avto-Doldur (Demo)
                  </button>
                  <button
                    onClick={() => {
                      setExamAnswers({});
                      setExamSubmitted(false);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-xs transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {examSubmitted && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  examEvaluation.passed
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    {examEvaluation.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-400" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {examEvaluation.passed ? 'İmtahan Müvəffəqiyyətlə Keçildi!' : 'İmtahan Nəticəsi Qənaətbəxş Deyil'}
                      </h4>
                      <p className="text-xs opacity-80">
                        Toplanan bal: {examEvaluation.scorePercent}% ({examEvaluation.correctCount} / {examEvaluation.totalQuestions} düzgün cavab)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (examEvaluation.passed) {
                        handleGenerateCertificate();
                      }
                    }}
                    disabled={!examEvaluation.passed}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      examEvaluation.passed
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Sertifikat Əldə Et
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_FOOTBRIDGE_EXAM_QUESTIONS.map((q, qIndex) => {
                  const selectedOption = examAnswers[q.id];
                  return (
                    <div key={q.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <h5 className="text-xs font-bold text-white">
                          <span className="text-emerald-400 mr-1.5">#{qIndex + 1}</span>
                          {q.questionAz}
                        </h5>
                        <span className="text-[10px] text-slate-500 ml-2 whitespace-nowrap">{q.legalCitation}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.optionsAz.map((option, optIdx) => {
                          const isOptionSelected = selectedOption === optIdx;
                          let btnStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';
                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-300';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              className={`p-2.5 rounded-lg border text-xs text-left transition-all ${btnStyle}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="text-[11px] bg-slate-900/60 p-2.5 rounded border border-slate-800 text-slate-400">
                          💡 <strong className="text-emerald-400">İzahat:</strong> {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!examSubmitted && (
                <button
                  onClick={() => setExamSubmitted(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50"
                >
                  Cavabları Yoxla və Nəticəni Hesabla
                </button>
              )}
            </div>
          )}

          {/* TAB 6: OFFICIAL SIMA CLEARANCE CERTIFICATE */}
          {activeTab === 'certificate' && activeCertificate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">Rəsmi Elektron Sənəd Çap və Təsdiq Modulu</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopyCode(activeCertificate.certificateId)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode === activeCertificate.certificateId ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Printable Certificate Template */}
              <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border-4 border-double border-emerald-900 shadow-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-900 rounded-xl flex items-center justify-center text-white font-black text-xl">
                      AZ
                    </div>
                    <div>
                      <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">
                        Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA)
                      </h3>
                      <h4 className="text-xs font-bold text-slate-700">
                        Baş Dövlət Yol Polisi İdarəsi (BDYP) • Yerüstü Piyada Keçidləri Departamenti
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Rəsmi FOOTBRIDGE-SAFE-AZ-2026 Elektron Mühəndislik Uyğunluq Sertifikatı
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-mono text-xs font-bold">
                      {activeCertificate.status}
                    </span>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      PIN: {activeCertificate.verificationPin}
                    </div>
                  </div>
                </div>

                {/* Certificate Core Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Sertifikat No:</span>
                    <strong className="font-mono text-emerald-900">{activeCertificate.certificateId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Piyada / Nəqliyyat Kodu:</span>
                    <strong className="font-mono text-slate-900">{activeCertificate.vehiclePlate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Keçid Stansiya Kodu:</span>
                    <strong className="text-slate-900">{activeCertificate.footbridgeCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Magistral Marşrut:</span>
                    <strong className="text-emerald-900">{activeCertificate.routeNumber}</strong>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 py-1.5">
                    <span className="text-slate-600">Yerüstü Keçidin Adı:</span>
                    <strong className="text-slate-900 text-right">{activeCertificate.footbridgeName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1.5">
                    <span className="text-slate-600">Keçid Təhlükəsizlik Reytinqi:</span>
                    <strong className="text-emerald-700">{activeCertificate.crossingSafetyScorePercent}% (Normativə Tam Uyğun)</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1.5">
                    <span className="text-slate-600">PRM Əlillik Əlçatanlıq Qiyməti (EN 81-70):</span>
                    <strong className="text-indigo-700">{activeCertificate.prmComplianceScorePercent}% (Dual Panoramik Lift Aktiv)</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 py-1.5">
                    <span className="text-slate-600">Yoxlayıcı Müfəttiş:</span>
                    <strong className="text-slate-900">{activeCertificate.inspectorOfficer}</strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600">Qüvvədə olma müddəti:</span>
                    <span className="font-mono text-slate-800">
                      {new Date(activeCertificate.issueDate).toLocaleDateString()} — {new Date(activeCertificate.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* SİMA Digital Seal & Hashes */}
                <div className="pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">SİMA Rəqəmsal İmza Təsdiq UID:</span>
                    <span className="font-mono text-emerald-800 font-bold">{activeCertificate.simaSignatureUid}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Kriptoqrafik SHA-256 İmzası:</span>
                    <span className="font-mono text-[9px] text-slate-600">{activeCertificate.sha256Checksum}</span>
                  </div>
                  <div className="border border-slate-300 p-2 rounded text-center">
                    <div className="w-16 h-16 bg-slate-900 text-white font-mono text-[9px] flex items-center justify-center rounded">
                      [QR VERIFY]
                    </div>
                    <span className="text-[8px] text-slate-500 block mt-1">ASAN / AAYDA GIS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: UNIFIED PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Sertifikat ID, nömrə nişanı və ya körpü adı..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-slate-400">
                  Qeydiyyatda olan aktlar: <span className="text-emerald-400 font-bold">{filteredCertificates.length}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.certificateId}
                    onClick={() => {
                      setActiveCertificate(cert);
                      setActiveTab('certificate');
                    }}
                    className="cursor-pointer bg-slate-950/60 hover:bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-400">{cert.certificateId}</span>
                        <span className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-300 rounded border border-slate-700">
                          {cert.vehiclePlate}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                          {cert.status}
                        </span>
                      </div>
                      <p className="text-white font-medium">{cert.footbridgeName}</p>
                      <span className="text-[10px] text-slate-500">{cert.sha256Checksum}</span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-[11px] gap-1">
                      <span className="text-emerald-400 font-bold">
                        Təhlükəsizlik: {cert.crossingSafetyScorePercent}%
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Verilmə: {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
