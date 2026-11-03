import React, { useState, useId } from 'react';
import {
  X,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sliders,
  CheckCircle2,
  FileText,
  Printer,
  Copy,
  Search,
  Zap,
  Gauge,
  Radio,
  Eye,
  Award,
  RefreshCw,
  Phone,
  Flame,
  Truck,
  Car,
  Volume2,
} from 'lucide-react';
import {
  Currency,
  SosEmergencyType,
  ShoulderType,
  SosPillarAsset,
  SosVehiclePreset,
  SosChecklistItem,
  SosSafeCertificate,
  calculateSosRoadsideSafety,
  evaluateSosChecklist,
  gradeSosExam,
  generateSosSafeCertificate,
  searchSosCertificates,
  convertSosCurrency,
} from '../utils/sosSafeCompliance';
import {
  MOCK_SOS_PILLARS,
  MOCK_SOS_VEHICLE_PRESETS,
  MOCK_SOS_CHECKLIST,
  MOCK_SOS_EXAM_QUESTIONS,
  MOCK_SOS_CERTIFICATES,
} from '../data/mockSosSafeData';

interface SosSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType = 'radar' | 'simulator' | 'vehicles' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const SosSafeModal: React.FC<SosSafeModalProps> = ({
  isOpen,
  onClose,
  currency: initialCurrency = 'AZN',
}) => {
  const gradientId = useId();
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialCurrency);
  const [selectedPillar, setSelectedPillar] = useState<SosPillarAsset>(MOCK_SOS_PILLARS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<SosVehiclePreset>(MOCK_SOS_VEHICLE_PRESETS[0]);

  // Simulation inputs
  const [distanceToPillarM, setDistanceToPillarM] = useState<number>(120);
  const [triangleDistanceM, setTriangleDistanceM] = useState<number>(55);
  const [shoulderType, setShoulderType] = useState<ShoulderType>('PAVED_HARD_SHOULDER');
  const [emergencyType, setEmergencyType] = useState<SosEmergencyType>('MECHANICAL_BREAKDOWN');
  const [vestWorn, setVestWorn] = useState<boolean>(true);
  const [hazardLightsOn, setHazardLightsOn] = useState<boolean>(true);
  const [trafficSpeedKmH, setTrafficSpeedKmH] = useState<number>(110);
  const [trafficFlowVehPerHour, setTrafficFlowVehPerHour] = useState<number>(1200);
  const [ambientCondition, setAmbientCondition] = useState<'DAY_CLEAR' | 'NIGHT_LIT' | 'NIGHT_DARK' | 'RAIN_FOG'>('NIGHT_DARK');

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>([
    'sos-chk-1',
    'sos-chk-2',
    'sos-chk-3',
    'sos-chk-4',
    'sos-chk-5',
    'sos-chk-6',
  ]);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Search in Radar and Registry
  const [radarSearch, setRadarSearch] = useState<string>('');
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [certificates, setCertificates] = useState<SosSafeCertificate[]>(MOCK_SOS_CERTIFICATES);
  const [currentCertificate, setCurrentCertificate] = useState<SosSafeCertificate>(MOCK_SOS_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Audio tone play
  const playSosAudioAlert = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio context not allowed or not supported in test env
    }
  };

  if (!isOpen) return null;

  const simulationResult = calculateSosRoadsideSafety(
    {
      distanceToPillarM,
      triangleDistanceM,
      shoulderType,
      emergencyType,
      vestWorn,
      hazardLightsOn,
      trafficSpeedKmH,
      trafficFlowVehPerHour,
      ambientCondition,
    },
    selectedPillar,
    selectedVehicle
  );

  const checklistEvaluation = evaluateSosChecklist(checkedItems, MOCK_SOS_CHECKLIST);
  const examResult = gradeSosExam(examAnswers, MOCK_SOS_EXAM_QUESTIONS);
  const filteredCertificates = searchSosCertificates(registrySearch, certificates);

  const handleGenerateCertificate = () => {
    const newCert = generateSosSafeCertificate(
      selectedPillar,
      selectedVehicle,
      emergencyType,
      simulationResult.overallSafetyIndexPercent
    );
    setCertificates([newCert, ...certificates]);
    setCurrentCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredPillars = MOCK_SOS_PILLARS.filter(
    (p) =>
      p.corridor.toLowerCase().includes(radarSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(radarSearch.toLowerCase()) ||
      p.routeNumber.toLowerCase().includes(radarSearch.toLowerCase()) ||
      p.picketKm.toLowerCase().includes(radarSearch.toLowerCase())
  );

  return (
    <div
      data-testid="sos-safe-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 text-slate-100 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AAYDA • FHN • BDYP
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">SOS-SAFE-AZ-2026 Portal</span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                Magistral SOS Qəza Çağırış Sütunları və Yol Çiyini Təhlükəsizliyi
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedCurrency === curr
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="sos-modal-close-btn"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto text-xs sm:text-sm font-medium">
          {[
            { id: 'radar', label: 'SOS Dəhlizləri', icon: Radio },
            { id: 'simulator', label: 'SCADA Simulyator', icon: Sliders },
            { id: 'vehicles', label: 'Avtomobil Preseti', icon: Car },
            { id: 'checklist', label: '10-Nöqtə Reqlament', icon: CheckCircle2 },
            { id: 'exam', label: 'Qanunvericilik İmtahanı', icon: Award },
            { id: 'certificate', label: 'SOS Arayışı', icon: FileText },
            { id: 'registry', label: 'Açıq Reyestr', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                    Azərbaycan Magistral SOS Qəza Çağırış Sütunları Şəbəkəsi
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    AAYDA və BDYP SCADA Mərkəzinə qoşulmuş optik lifli və fotovoltaik təcili zəng dirəkləri (ERT)
                  </p>
                </div>
                <div className="relative min-w-[260px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={radarSearch}
                    onChange={(e) => setRadarSearch(e.target.value)}
                    placeholder="Dəhliz, kod və ya piketaj axtar..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPillars.map((p) => {
                  const isSelected = selectedPillar.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPillar(p)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30'
                          : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {p.code}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            {p.status}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-white mb-1 line-clamp-1">{p.corridor}</h4>
                        <div className="text-xs text-slate-400 space-y-1 mb-3">
                          <div className="flex justify-between">
                            <span>Marşrut / Piketaj:</span>
                            <span className="font-medium text-slate-200">{p.picketKm}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GPS Koordinat:</span>
                            <span className="font-mono text-slate-300">
                              {p.gpsLat.toFixed(4)}° N, {p.gpsLng.toFixed(4)}° E
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Optik Lif Gecikməsi:</span>
                            <span className="font-semibold text-cyan-400">{p.opticalFiberLatencyMs} ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Günəş Batareya SoC:</span>
                            <span className="font-semibold text-emerald-400">{p.solarBatterySoC}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        <span className="truncate max-w-[170px]">{p.assignedDispatchHub}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPillar(p);
                            setActiveTab('simulator');
                          }}
                          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium transition-all"
                        >
                          Simulyasiya et →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Pillar banner */}
              <div className="p-3 sm:p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Aktiv Seçilmiş SOS Sütunu:</div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedPillar.code}</span>
                      <span className="text-xs font-normal text-amber-300">({selectedPillar.corridor})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Piketaj: <strong className="text-white">{selectedPillar.picketKm}</strong></span>
                  <span className="text-slate-500">•</span>
                  <button
                    onClick={playSosAudioAlert}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>SOS Zəng Səsi</span>
                  </button>
                </div>
              </div>

              {/* Controls and SVG grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Controls */}
                <div className="lg:col-span-5 space-y-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Hadisə və Yol Çiyini Parametrləri
                  </h4>

                  {/* Emergency type selector */}
                  <div>
                    <label htmlFor="sos-emergency-select" className="block text-xs font-medium text-slate-300 mb-1">Təcili Hadisə Növü:</label>
                    <select
                      id="sos-emergency-select"
                      aria-label="Təcili Hadisə Növü:"
                      value={emergencyType}
                      onChange={(e) => setEmergencyType(e.target.value as SosEmergencyType)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="MECHANICAL_BREAKDOWN">Mühərrik və ya Təkər Nasazlığı (Breakdown)</option>
                      <option value="MEDICAL_EMERGENCY">Təcili Tibbi Yardım / Yaralanma (103/113)</option>
                      <option value="TRAFFIC_COLLISION">Yol-Nəqliyyat Hadisəsi / Qəza (BDYP 902)</option>
                      <option value="HAZMAT_FIRE">Yanğın və ya Yanacaq Sızması (FHN 112)</option>
                      <option value="OBSTACLE_HAZARD">Yol Zolağında Təhlükəli Maneə / Daş Uçqunu</option>
                    </select>
                  </div>

                  {/* Shoulder type selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Yol Çiyininin Quruluşu:</label>
                    <select
                      value={shoulderType}
                      onChange={(e) => setShoulderType(e.target.value as ShoulderType)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="PAVED_HARD_SHOULDER">Standart Asfaltlanmış Qəza Çiyini (3.0m - 3.75m)</option>
                      <option value="NARROW_GRAVEL_SHOULDER">Dar Çınqıl/Torpaq Çiyin (Riskli)</option>
                      <option value="BRIDGE_VIADUCT_REFUGE">Körpü / Viyaduk Qəza Cibi</option>
                      <option value="TUNNEL_EMERGENCY_BAY">Dağ Tüneli Təxliyə Cibı</option>
                    </select>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-3 pt-2 border-t border-slate-700/60">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">SOS Dirəyinə Qədər Məsafə:</span>
                        <span className="font-mono font-bold text-amber-400">{distanceToPillarM} m</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="2000"
                        step="10"
                        value={distanceToPillarM}
                        onChange={(e) => setDistanceToPillarM(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Qəza Dayanma Nişanı Məsafəsi:</span>
                        <span className={`font-mono font-bold ${triangleDistanceM >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {triangleDistanceM} m {triangleDistanceM < 50 && '(Qanun: min 50m)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        step="5"
                        value={triangleDistanceM}
                        onChange={(e) => setTriangleDistanceM(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Magistralda Hərəkət Sürəti:</span>
                        <span className="font-mono font-bold text-cyan-400">{trafficSpeedKmH} km/s</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="140"
                        step="5"
                        value={trafficSpeedKmH}
                        onChange={(e) => setTrafficSpeedKmH(Number(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Nəqliyyat Axını Sıxlığı:</span>
                        <span className="font-mono font-bold text-slate-200">{trafficFlowVehPerHour} avto/saat</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="3500"
                        step="100"
                        value={trafficFlowVehPerHour}
                        onChange={(e) => setTrafficFlowVehPerHour(Number(e.target.value))}
                        className="w-full accent-slate-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="pt-2 border-t border-slate-700/60 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={vestWorn}
                        onChange={(e) => setVestWorn(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span className="text-slate-200">İşıqqaytarıcı jilet (EN ISO 20471) geyinilib</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={hazardLightsOn}
                        onChange={(e) => setHazardLightsOn(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span className="text-slate-200">Qəza işıq siqnalı (avariya) aktivdir</span>
                    </label>
                  </div>
                </div>

                {/* Right Visualizer & SCADA Metrics */}
                <div className="lg:col-span-7 space-y-4">
                  {/* SVG Roadside 2D Diagram */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
                    <div className="w-full flex justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        2D Yol Çiyini və SOS Dirəyi Telemetriyası
                      </span>
                      <span className="font-mono text-emerald-400">SCADA 100 Mbps Optik Kanal</span>
                    </div>

                    <svg viewBox="0 0 600 240" className="w-full h-52 select-none">
                      <defs>
                        <linearGradient id={`${gradientId}-asphalt`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <linearGradient id={`${gradientId}-shoulder`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#334155" />
                          <stop offset="100%" stopColor="#1e293b" />
                        </linearGradient>
                      </defs>

                      {/* Main Highway Lanes */}
                      <rect x="0" y="20" width="600" height="110" fill={`url(#${gradientId}-asphalt)`} />
                      {/* Lane divider line */}
                      <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="16, 12" />

                      {/* Moving traffic car */}
                      <rect x="420" y="35" width="55" height="24" rx="4" fill="#3b82f6" />
                      <circle cx="430" cy="62" r="3" fill="#0f172a" />
                      <circle cx="465" cy="62" r="3" fill="#0f172a" />
                      <polygon points="475,40 510,32 510,48" fill="#fef08a" opacity="0.4" />

                      {/* Shoulder line (Solid white) */}
                      <line x1="0" y1="130" x2="600" y2="130" stroke="#ffffff" strokeWidth="3" />

                      {/* Roadside Shoulder */}
                      <rect x="0" y="130" width="600" height="70" fill={`url(#${gradientId}-shoulder)`} />

                      {/* Steel Guardrail barrier */}
                      <rect x="0" y="200" width="600" height="8" fill="#64748b" />
                      <line x1="0" y1="204" x2="600" y2="204" stroke="#94a3b8" strokeWidth="2" />
                      {[40, 100, 160, 220, 280, 340, 400, 460, 520, 580].map((x) => (
                        <rect key={x} x={x} y="200" width="4" height="25" fill="#475569" />
                      ))}

                      {/* Disabled Car on Shoulder */}
                      <g transform="translate(80, 145)">
                        <rect x="0" y="0" width="65" height="28" rx="5" fill="#dc2626" />
                        <rect x="12" y="4" width="22" height="12" rx="2" fill="#94a3b8" opacity="0.8" />
                        <rect x="38" y="4" width="16" height="12" rx="2" fill="#94a3b8" opacity="0.8" />
                        <circle cx="14" cy="28" r="4" fill="#0f172a" />
                        <circle cx="52" cy="28" r="4" fill="#0f172a" />

                        {/* Blinking hazard flashers */}
                        {hazardLightsOn && (
                          <>
                            <circle cx="2" cy="6" r="3" fill="#f59e0b" className="animate-ping" />
                            <circle cx="63" cy="6" r="3" fill="#f59e0b" className="animate-ping" />
                            <circle cx="2" cy="22" r="3" fill="#f59e0b" className="animate-ping" />
                            <circle cx="63" cy="22" r="3" fill="#f59e0b" className="animate-ping" />
                          </>
                        )}
                      </g>

                      {/* Warning Triangle */}
                      <g transform="translate(180, 155)">
                        <polygon
                          points="0,15 12,15 6,2"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                        />
                        <polygon points="3,13 9,13 6,5" fill="#fbbf24" />
                        <text x="-15" y="-3" fill="#f87171" fontSize="9" fontWeight="bold">
                          {triangleDistanceM}m
                        </text>
                      </g>

                      {/* Walking Pedestrian in High-Vis */}
                      <g transform="translate(290, 165)">
                        <circle cx="5" cy="0" r="4" fill="#fde047" />
                        <line x1="5" y1="4" x2="5" y2="16" stroke={vestWorn ? '#eab308' : '#64748b'} strokeWidth="3" />
                        <line x1="5" y1="16" x2="1" y2="25" stroke="#1e293b" strokeWidth="2" />
                        <line x1="5" y1="16" x2="9" y2="25" stroke="#1e293b" strokeWidth="2" />
                        {vestWorn && (
                          <rect x="2" y="6" width="6" height="7" fill="#84cc16" opacity="0.9" />
                        )}
                      </g>

                      {/* SOS Pillar (Orange / Yellow with Solar Panel and Blue Beacon) */}
                      <g transform="translate(480, 120)">
                        {/* Foundation & Post */}
                        <rect x="10" y="25" width="12" height="70" fill="#f59e0b" rx="2" />
                        <rect x="6" y="90" width="20" height="6" fill="#475569" />

                        {/* Solar PV Panel atop */}
                        <polygon points="2,15 30,10 32,22 4,26" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                        <line x1="16" y1="22" x2="16" y2="26" stroke="#f59e0b" strokeWidth="3" />

                        {/* Telephone Call Box Enclosure */}
                        <rect x="4" y="35" width="24" height="36" rx="4" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
                        {/* Handset icon & SOS label */}
                        <text x="7" y="46" fill="#ffffff" fontSize="8" fontWeight="bold">SOS</text>
                        <circle cx="16" cy="56" r="4" fill="#ef4444" />
                        {/* Blue flashing strobe LED */}
                        <circle cx="16" cy="28" r="3" fill="#38bdf8" className="animate-ping" />

                        {/* Optical Fiber SCADA Link wave */}
                        <path d="M16,92 Q25,105 40,105" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3, 3" />
                        <text x="-10" y="115" fill="#22d3ee" fontSize="8" fontWeight="bold">
                          {selectedPillar.code}
                        </text>
                      </g>

                      {/* Distance bracket */}
                      <line x1="150" y1="190" x2="480" y2="190" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4, 4" />
                      <text x="290" y="185" fill="#f59e0b" fontSize="10" textAnchor="middle" fontWeight="bold">
                        D = {distanceToPillarM} metr
                      </text>
                    </svg>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                      <div className="text-xs text-slate-400">Piyada Riski</div>
                      <div className={`text-base sm:text-lg font-bold ${
                        simulationResult.pedestrianExposureRiskPercent < 40
                          ? 'text-emerald-400'
                          : simulationResult.pedestrianExposureRiskPercent < 70
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {simulationResult.pedestrianExposureRiskPercent}%
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{simulationResult.pedestrianSafetyStatus}</div>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                      <div className="text-xs text-slate-400">Piyada Yürüş Vaxtı</div>
                      <div className="text-base sm:text-lg font-bold text-amber-400">
                        {simulationResult.walkingTimeSec} san
                      </div>
                      <div className="text-[10px] text-slate-400">~{simulationResult.walkingTimeMin} dəqiqə</div>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                      <div className="text-xs text-slate-400">Dispetçer Çatış ETA</div>
                      <div className="text-base sm:text-lg font-bold text-cyan-400">
                        {simulationResult.dispatchEtaMinutes} dəq
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{simulationResult.dispatchAgency}</div>
                    </div>

                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                      <div className="text-xs text-slate-400">Ümumi Təhlükəsizlik</div>
                      <div className={`text-base sm:text-lg font-bold ${
                        simulationResult.overallSafetyIndexPercent >= 80 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {simulationResult.overallSafetyIndexPercent}%
                      </div>
                      <div className="text-[10px] text-slate-400">İndeks balı</div>
                    </div>
                  </div>

                  {/* Fines and Warnings */}
                  {simulationResult.statutoryFines.length > 0 ? (
                    <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/30 text-xs space-y-1.5">
                      <div className="font-bold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Aşkarlanmış Qanun Pozuntusu və İXM Cərimələri:
                      </div>
                      {simulationResult.statutoryFines.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-300">
                          <span>{f.description} ({f.article}):</span>
                          <span className="font-bold text-rose-400">
                            {convertSosCurrency(f.baseFineAZN, selectedCurrency)} {selectedCurrency} (50% endirimlə: {convertSosCurrency(f.discountedFineAZN, selectedCurrency)} {selectedCurrency})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Qəza dayanma nişanı və işıqqaytarıcı jilet üzrə bütün qanuni tələblər (YHQ Maddə 37, 43) tam yerinə yetirilib!
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleGenerateCertificate}
                      data-testid="generate-sos-cert-btn"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      Rəsmi SOS Qeydiyyat Arayışı Al →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLES */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Nəqliyyat Vasitəsi Presetləri və Qəza Avadanlıqları</h3>
                  <p className="text-xs text-slate-400">Azərbaycan dövlət qeydiyyat nişanlı minik, yük və xüsusi təyinatlı avtomobillər</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_SOS_VEHICLE_PRESETS.map((v) => {
                  const isSelected = selectedVehicle.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVehicle(v);
                        setVestWorn(v.highVisVestCount > 0);
                        setHazardLightsOn(v.flashersOperational);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30'
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-700">
                            {v.plate}
                          </span>
                          <span className="text-xs text-slate-400">{v.vehicleType}</span>
                        </div>
                        <h4 className="font-semibold text-white text-sm mb-2">{v.name}</h4>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Çəki:</span>
                            <span className="font-medium text-slate-200">{v.grossWeightKg} kq</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Qəza Dayanma Nişanı:</span>
                            <span className={v.warningTriangleEquipped ? 'text-emerald-400' : 'text-rose-400'}>
                              {v.warningTriangleEquipped ? 'Mövcuddur (Baqajda)' : 'Yoxdur'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>İşıqqaytarıcı Jilet Sayı:</span>
                            <span className="font-semibold text-amber-300">{v.highVisVestCount} ədəd</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sərnişin Tutumu:</span>
                            <span className="text-slate-300">{v.occupantCount} nəfər</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 mt-3 flex justify-between items-center">
                        <span className="text-[11px] text-slate-500">Seçmək üçün klikləyin</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVehicle(v);
                            setVestWorn(v.highVisVestCount > 0);
                            setHazardLightsOn(v.flashersOperational);
                            setActiveTab('simulator');
                          }}
                          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold"
                        >
                          Tətbiq et →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">10-Nöqtə Qəza Çağırış və Təhlükəsizlik Reqlamenti</h3>
                  <p className="text-xs text-slate-400">AAYDA, FHN və BDYP birgə magistral yol hərəkəti təhlükəsizlik yoxlama siyahısı</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCheckedItems(MOCK_SOS_CHECKLIST.map((c) => c.id))}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={() => setCheckedItems([])}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Reqlamentə Uyğunluq:</span>
                  <span className="font-bold text-amber-400">
                    {checklistEvaluation.completedItems} / {checklistEvaluation.totalItems} ({checklistEvaluation.compliancePercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${checklistEvaluation.compliancePercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {MOCK_SOS_CHECKLIST.map((item) => {
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
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-white">{item.title}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.standard}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Magistral SOS və Yol Hərəkəti Qanunvericiliyi İmtahanı</h3>
                  <p className="text-xs text-slate-400">YHQ, İXM və AAYDA normativləri üzrə 10 nəzəri sualdan ibarət test</p>
                </div>
                {examSubmitted && (
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Yenidən Başla
                  </button>
                )}
              </div>

              {examSubmitted && (
                <div className={`p-4 rounded-xl border ${
                  examResult.passed ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">
                        {examResult.passed ? '🎉 Təbriklər! İmtahandan Müvəffəqiyyətlə Keçdiniz' : 'Diqqət! İmtahan Nəticəsi Qeyri-Kafidir'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Düzgün cavab sayı: {examResult.correctAnswers} / {examResult.totalQuestions} ({examResult.scorePercentage}%) - Keçid balı: 80%
                      </p>
                    </div>
                    <div className="text-2xl font-bold font-mono">
                      {examResult.scorePercentage}%
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_SOS_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedOpt = examAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctAnswer;
                  return (
                    <div key={q.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-white">
                          <span className="text-amber-400 mr-1.5">{idx + 1}.</span>
                          {q.question}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
                          {q.legalCitation}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optStyle = 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800';
                          if (examSubmitted) {
                            if (optIdx === q.correctAnswer) {
                              optStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (isOptionSelected) {
                              optStyle = 'bg-rose-950/40 border-rose-500 text-rose-300';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={examSubmitted}
                              onClick={() => setExamAnswers({ ...examAnswers, [q.id]: optIdx })}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${optStyle}`}
                            >
                              <span className="font-mono mr-2">{String.fromCharCode(65 + optIdx)})</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 rounded bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300">
                          <strong className="text-amber-400">Şərh: </strong>
                          {q.explanation}
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
                    disabled={Object.keys(examAnswers).length < MOCK_SOS_EXAM_QUESTIONS.length}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/30 transition-all cursor-pointer"
                  >
                    İmtahanı Tamamla və Qiymətləndir →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Rəsmi Elektron SOS Qəza və Texniki Yardım Arayışı</h3>
                  <p className="text-xs text-slate-400">AAYDA, FHN və BDYP Vahid İnformasiya Sisteminə inteqrasiya olunmuş rəqəmsal sənəd</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(currentCertificate.certificateNumber, 'cert-no')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copiedCode === 'cert-no' ? 'Kopyalandı!' : 'Nömrəni Kopyala'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap et</span>
                  </button>
                </div>
              </div>

              {/* Certificate Sheet */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
                {/* Watermark badge */}
                <div className="absolute right-4 top-4 opacity-10 pointer-events-none select-none">
                  <ShieldCheck className="w-48 h-48 text-amber-400" />
                </div>

                <div className="border-b-2 border-amber-500/30 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      <PhoneCall className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
                        AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-white">
                        SOS-SAFE-AZ-2026 ELEKTRON TƏCİLİ YARDIM ARAYIŞI
                      </h2>
                      <div className="text-xs text-slate-400">FHN 112 və BDYP 902 Mərkəzi Dispetçer Koordinasiyası</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {currentCertificate.certificateNumber}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">Verilmə tarixi: {currentCertificate.issueDate}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm mb-6">
                  <div className="space-y-2 p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="font-mono font-bold text-white text-base">{currentCertificate.vehiclePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avtomobil Modeli:</span>
                      <span className="font-semibold text-slate-200">{currentCertificate.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SOS Sütunun Kodu:</span>
                      <span className="font-mono font-bold text-amber-400">{currentCertificate.corridorCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Magistral Piketajı:</span>
                      <span className="font-semibold text-slate-200">{currentCertificate.picketKm}</span>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hadisə Növü:</span>
                      <span className="font-semibold text-amber-300">{currentCertificate.emergencyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dispetçer İcra Kodu:</span>
                      <span className="font-mono text-cyan-400">{currentCertificate.dispatchReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Təhlükəsizlik İndeksi:</span>
                      <span className="font-bold text-emerald-400">{currentCertificate.safetyIndexPercent}% Qənaətbəxş</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-bold text-emerald-400">TƏSDİQLƏNİB (RƏSMİ)</span>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Verification footer */}
                <div className="pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-slate-400">
                      SİMA Rəqəmsal İmza UID: <span className="font-mono text-slate-200">{currentCertificate.simaSignatureUid}</span>
                    </div>
                    <div className="text-slate-400">
                      Təsdiq PIN Kodu: <strong className="font-mono text-amber-400">{currentCertificate.verificationPin}</strong>
                    </div>
                    <div className="text-slate-500 font-mono text-[10px]">
                      SHA-256: {currentCertificate.sha256Hash}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white text-slate-950 font-mono text-[10px] text-center border border-slate-300">
                    <div className="w-16 h-16 bg-slate-900 mx-auto mb-1 flex items-center justify-center text-white text-[9px] p-1 text-center font-sans">
                      QR KOD VERIFY
                    </div>
                    <span>AAYDA / FHN / BDYP</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Vahid SOS Qəza və Texniki Yardım Açıq Reyestri</h3>
                  <p className="text-xs text-slate-400">Verilmiş bütün SOS-SAFE-AZ-2026 rəsmi elektron arayışlarının yoxlanılması</p>
                </div>
                <div className="relative min-w-[260px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Qeydiyyat nömrəsi, arayış və ya nömrə nişanı..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Arayış №</th>
                      <th className="p-3">Nömrə Nişanı</th>
                      <th className="p-3">SOS Sütunu</th>
                      <th className="p-3">Piketaj</th>
                      <th className="p-3">Hadisə Növü</th>
                      <th className="p-3">Tarix</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {filteredCertificates.map((c) => (
                      <tr key={c.certificateNumber} className="hover:bg-slate-800/50 transition-all">
                        <td className="p-3 font-mono font-bold text-amber-400">{c.certificateNumber}</td>
                        <td className="p-3 font-mono text-white">{c.vehiclePlate}</td>
                        <td className="p-3 font-semibold text-slate-300">{c.corridorCode}</td>
                        <td className="p-3 text-slate-300">{c.picketKm}</td>
                        <td className="p-3 text-slate-400">{c.emergencyType}</td>
                        <td className="p-3 text-slate-400">{c.issueDate}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setCurrentCertificate(c);
                              setActiveTab('certificate');
                            }}
                            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium"
                          >
                            Bax →
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
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AAYDA SCADA ERT Şəbəkəsi Aktivdir: 112 FHN & 902 BDYP Dispetçer</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
