import React, { useState, useMemo } from 'react';
import {
  X,
  HardHat,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  Search,
  Award,
  Sliders,
  Car,
  Gauge,
  HelpCircle,
  Clock,
  RotateCcw,
  Zap,
  ArrowRight,
  ChevronRight,
  Flame
} from 'lucide-react';
import {
  WorkZoneCorridorAsset,
  WorkZoneVehiclePreset,
  WorkZoneSimulationInput,
  WorkZoneClearanceCertificate,
  WorkZoneLaneClosureType,
  WorkZoneVmsPattern,
  Currency,
  convertCurrency,
  CURRENCY_SYMBOLS,
  runWorkZoneSimulation,
  evaluateChecklist,
  evaluateExam,
  generateWorkZoneCertificate
} from '../utils/workZoneSafeCompliance';
import {
  MOCK_WORK_ZONE_CORRIDORS,
  MOCK_WORK_ZONE_VEHICLES,
  MOCK_WORK_ZONE_CHECKLIST,
  MOCK_WORK_ZONE_EXAM,
  MOCK_WORK_ZONE_CERTIFICATES
} from '../data/mockWorkZoneSafeData';

interface WorkZoneSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType = 'radar' | 'simulator' | 'presets' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const WorkZoneSafeModal: React.FC<WorkZoneSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedCorridor, setSelectedCorridor] = useState<WorkZoneCorridorAsset>(MOCK_WORK_ZONE_CORRIDORS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<WorkZoneVehiclePreset>(MOCK_WORK_ZONE_VEHICLES[0]);

  // Simulation parameters
  const [vehicleSpeedKmH, setVehicleSpeedKmH] = useState<number>(65);
  const [vehicleGrossMassKg, setVehicleGrossMassKg] = useState<number>(1380);
  const [workZoneSpeedLimitKmH, setWorkZoneSpeedLimitKmH] = useState<number>(50);
  const [laneShiftWidthM, setLaneShiftWidthM] = useState<number>(3.5);
  const [tmaStrokeDepthM, setTmaStrokeDepthM] = useState<number>(1.8);
  const [bufferSpaceDistanceM, setBufferSpaceDistanceM] = useState<number>(65);
  const [shadowTruckMassKg, setShadowTruckMassKg] = useState<number>(10000);
  const [pavementFrictionCoeff, setPavementFrictionCoeff] = useState<number>(0.72);
  const [tmaInstalled, setTmaInstalled] = useState<boolean>(true);
  const [vmsPattern, setVmsPattern] = useState<WorkZoneVmsPattern>('SEQUENTIAL_ARROW_LEFT');

  // Driver details for certificate
  const [driverName, setDriverName] = useState<string>('Kamran Məmmədov');
  const [licensePlate, setLicensePlate] = useState<string>('99-WZ-101');

  // Checklist state
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([
    'WZ-CHK-01',
    'WZ-CHK-02',
    'WZ-CHK-03',
    'WZ-CHK-04',
    'WZ-CHK-05',
    'WZ-CHK-06',
    'WZ-CHK-10'
  ]);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificates & Registry
  const [certificates, setCertificates] = useState<WorkZoneClearanceCertificate[]>(MOCK_WORK_ZONE_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<WorkZoneClearanceCertificate>(MOCK_WORK_ZONE_CERTIFICATES[0]);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Simulation execution
  const simInput: WorkZoneSimulationInput = useMemo(
    () => ({
      vehicleSpeedKmH,
      vehicleGrossMassKg,
      workZoneSpeedLimitKmH,
      laneShiftWidthM,
      tmaStrokeDepthM,
      bufferSpaceDistanceM,
      shadowTruckMassKg,
      pavementFrictionCoeff,
      tmaInstalled
    }),
    [
      vehicleSpeedKmH,
      vehicleGrossMassKg,
      workZoneSpeedLimitKmH,
      laneShiftWidthM,
      tmaStrokeDepthM,
      bufferSpaceDistanceM,
      shadowTruckMassKg,
      pavementFrictionCoeff,
      tmaInstalled
    ]
  );

  const simResult = useMemo(() => runWorkZoneSimulation(simInput), [simInput]);

  // Checklist analysis
  const checklistResult = useMemo(
    () => evaluateChecklist(MOCK_WORK_ZONE_CHECKLIST, checkedItemIds),
    [checkedItemIds]
  );

  // Exam analysis
  const examResult = useMemo(
    () => evaluateExam(MOCK_WORK_ZONE_EXAM, examAnswers),
    [examAnswers]
  );

  if (!isOpen) return null;

  const handleSelectCorridor = (corridor: WorkZoneCorridorAsset) => {
    setSelectedCorridor(corridor);
    setWorkZoneSpeedLimitKmH(corridor.postedSpeedLimitKmH);
    setBufferSpaceDistanceM(corridor.bufferSpaceM);
    setVmsPattern(corridor.vmsPattern);
  };

  const handleSelectVehicle = (vehicle: WorkZoneVehiclePreset) => {
    setSelectedVehicle(vehicle);
    setVehicleGrossMassKg(vehicle.grossMassKg);
    setLicensePlate(vehicle.licensePlate);
    setVehicleSpeedKmH(vehicle.nominalApproachSpeedKmH);
  };

  const handleToggleChecklistItem = (id: string) => {
    setCheckedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    setCheckedItemIds(MOCK_WORK_ZONE_CHECKLIST.map((c) => c.id));
  };

  const handleResetChecklist = () => {
    setCheckedItemIds([]);
  };

  const handleAnswerExam = (questionId: string, optionIdx: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitExam = () => {
    setExamSubmitted(true);
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setExamSubmitted(false);
  };

  const handleGenerateCertificate = () => {
    const cert = generateWorkZoneCertificate(
      licensePlate,
      driverName,
      selectedCorridor,
      simResult
    );
    setCertificates((prev) => [cert, ...prev]);
    setActiveCertificate(cert);
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

  const filteredCertificates = certificates.filter(
    (c) =>
      c.certificateId.toLowerCase().includes(registrySearch.toLowerCase()) ||
      c.vehiclePlate.toLowerCase().includes(registrySearch.toLowerCase()) ||
      c.corridorNameAz.toLowerCase().includes(registrySearch.toLowerCase()) ||
      c.driverFullName.toLowerCase().includes(registrySearch.toLowerCase())
  );

  const sym = CURRENCY_SYMBOLS[currency] || '₼';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-zone-modal-title"
      data-testid="work-zone-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-900/40 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <HardHat className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  AAYDA • BDYP Rəsmi Dövlət Portalı
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-slate-800 text-slate-400 rounded">
                  WORKZONE-SAFE-AZ-2026
                </span>
              </div>
              <h2
                id="work-zone-modal-title"
                className="text-lg sm:text-xl font-bold text-white tracking-tight"
              >
                Magistral Təmir Sahələri və Zərbəuducu TMA Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="modal-close-button"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 overflow-x-auto text-xs sm:text-sm">
          <button
            data-testid="tab-radar"
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Təmir Sahələri Radarı (6)</span>
          </button>

          <button
            data-testid="tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>TMA Simulyatoru & Fizika</span>
          </button>

          <button
            data-testid="tab-presets"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'presets'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Car className="w-4 h-4 text-amber-400" />
            <span>Nəqliyyat & İXM Cərimələri</span>
          </button>

          <button
            data-testid="tab-checklist"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Təhlükəsizlik Auditi ({checkedItemIds.length}/10)</span>
          </button>

          <button
            data-testid="tab-exam"
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'exam'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Təlim & İmtahan</span>
          </button>

          <button
            data-testid="tab-certificate"
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Rəsmi Sertifikat</span>
          </button>

          <button
            data-testid="tab-registry"
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>Vahid Dövlət Reyestri</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR CORRIDORS */}
          {activeTab === 'radar' && (
            <div className="space-y-6" data-testid="radar-section">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    Respublika Magistral Təmir Sahələri və SCADA IoT Monitorinqi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    AAYDA Yol Təmiri İdarəsi tərəfindən həyata keçirilən təmir işləri, müvəqqəti zolaq qapanmaları və TMA kölgə yük maşınları
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  SCADA Canlı Rejimdə Aktivdir
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_WORK_ZONE_CORRIDORS.map((corridor) => {
                  const isSelected = selectedCorridor.id === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      data-testid={`corridor-card-${corridor.id}`}
                      onClick={() => handleSelectCorridor(corridor)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                          : 'bg-slate-800/30 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {corridor.route} • {corridor.chainageKm}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {corridor.scadaSensorCode}
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm font-semibold text-white line-clamp-1">
                        {corridor.nameAz}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {corridor.workDescriptionAz}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Sürət Məhdudiyyəti</span>
                          <span className="font-bold text-amber-400">
                            {corridor.postedSpeedLimitKmH} km/s
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1 line-through">
                            {corridor.originalSpeedLimitKmH}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">TMA Zərbəuducu</span>
                          <span className="font-semibold text-white flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-amber-400" />
                            {corridor.tmaEquippedTrucks} Maşın
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">İşçi Heyəti</span>
                          <span className="font-semibold text-white">
                            {corridor.activeWorkerCount} Mühəndis
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Bufer Məsafəsi</span>
                          <span className="font-semibold text-emerald-400">
                            {corridor.bufferSpaceM} metr
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-amber-300 font-medium">
                          <span>Seçilmiş Zona</span>
                          <Check className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected Corridor Overview Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      Seçilmiş Təmir Sahəsi SCADA Parametrləri
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {selectedCorridor.nameAz}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {selectedCorridor.region} • Təmir uzunluğu: {selectedCorridor.workZoneLengthM} metr
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                  >
                    <span>TMA Simulyatoruna Keç</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIMULATOR & PHYSICS */}
          {activeTab === 'simulator' && (
            <div className="space-y-6" data-testid="simulator-section">
              {/* Animated 2D SVG Work Zone Diagram */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 shadow-inner">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    2D Dinamik Təmir Zolağı və TMA Zərbəuducu Sxemi (Canlı SCADA)
                  </span>
                  <span className="text-slate-400">
                    VMS Rejimi: <strong className="text-amber-300">{vmsPattern}</strong>
                  </span>
                </div>

                <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-2">
                  <svg
                    viewBox="0 0 900 220"
                    className="w-full h-auto text-xs select-none"
                    data-testid="work-zone-svg"
                  >
                    {/* Road Surface */}
                    <rect x="0" y="30" width="900" height="160" fill="#1e293b" />
                    {/* Lane dividing dashed lines */}
                    <line x1="0" y1="80" x2="900" y2="80" stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />
                    <line x1="0" y1="130" x2="900" y2="130" stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />
                    {/* Road borders */}
                    <line x1="0" y1="30" x2="900" y2="30" stroke="#f1f5f9" strokeWidth="3" />
                    <line x1="0" y1="190" x2="900" y2="190" stroke="#f1f5f9" strokeWidth="3" />

                    {/* Work Zone Closed Area (Right lane closed) */}
                    <rect x="520" y="130" width="380" height="60" fill="#78350f" fillOpacity="0.4" />
                    <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="10" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" />
                    </pattern>
                    <rect x="520" y="130" width="380" height="60" fill="url(#diagonalHatch)" />

                    {/* Taper Cones (Diagonal from lane boundary) */}
                    {[
                      { x: 380, y: 185 },
                      { x: 410, y: 175 },
                      { x: 440, y: 165 },
                      { x: 470, y: 155 },
                      { x: 500, y: 145 },
                      { x: 530, y: 135 }
                    ].map((cone, idx) => (
                      <g key={idx} transform={`translate(${cone.x}, ${cone.y})`}>
                        <polygon points="0,0 5,-14 -5,-14" fill="#f97316" />
                        <line x1="-3" y1="-7" x2="3" y2="-7" stroke="#ffffff" strokeWidth="2" />
                        <rect x="-6" y="0" width="12" height="2" fill="#ea580c" />
                      </g>
                    ))}

                    {/* Advance Work Zone Sign (1.25) */}
                    <g transform="translate(80, 20)">
                      <polygon points="0,0 16,-26 -16,-26" fill="#f59e0b" stroke="#dc2626" strokeWidth="2" />
                      <text x="0" y="-12" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="bold">⚠️</text>
                      <text x="0" y="12" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">TƏMİR 300m</text>
                    </g>

                    {/* Speed limit sign 50 */}
                    <g transform="translate(180, 20)">
                      <circle cx="0" cy="-12" r="13" fill="#ffffff" stroke="#dc2626" strokeWidth="3" />
                      <text x="0" y="-8" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="bold">{workZoneSpeedLimitKmH}</text>
                      <text x="0" y="12" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">HƏDD</text>
                    </g>

                    {/* VMS Gantry Flashing Arrow */}
                    <g transform="translate(320, 25)">
                      <rect x="-24" y="-20" width="48" height="22" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                      <path d="M -12,-9 L 0,-16 L 0,-12 L 12,-12 L 12,-6 L 0,-6 L 0,-2 Z" fill="#fbbf24" />
                      <text x="0" y="12" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">SOLA MANEVR</text>
                    </g>

                    {/* TMA Shadow Truck */}
                    <g transform="translate(560, 140)">
                      {/* Truck Body */}
                      <rect x="0" y="0" width="60" height="30" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                      {/* Cab */}
                      <rect x="42" y="3" width="16" height="24" rx="2" fill="#e2e8f0" />
                      {/* TMA Energy Absorber Cushion (Rear) */}
                      <rect
                        x="-24"
                        y="4"
                        width="24"
                        height="22"
                        rx="2"
                        fill={tmaInstalled ? '#f59e0b' : '#ef4444'}
                        stroke="#b45309"
                        strokeWidth="1.5"
                      />
                      <line x1="-24" y1="4" x2="0" y2="26" stroke="#000000" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="-24" y1="26" x2="0" y2="4" stroke="#000000" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="30" y="18" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">AAYDA TMA</text>
                      <text x="-12" y="32" textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="bold">
                        {tmaInstalled ? 'TL-3 CUSHION' : 'YALIN YÜK'}
                      </text>
                    </g>

                    {/* Buffer Space Indicator */}
                    <g transform="translate(630, 155)">
                      <line x1="0" y1="0" x2="90" y2="0" stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" />
                      <circle cx="0" cy="0" r="3" fill="#10b981" />
                      <circle cx="90" cy="0" r="3" fill="#10b981" />
                      <text x="45" y="-5" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">
                        BUFER ZONA: {bufferSpaceDistanceM}m
                      </text>
                    </g>

                    {/* Road Workers in high-vis vests */}
                    <g transform="translate(740, 145)">
                      {/* Worker 1 */}
                      <circle cx="0" cy="-6" r="4" fill="#fbbf24" />
                      <rect x="-3" y="-2" width="6" height="12" fill="#ea580c" />
                      {/* Worker 2 */}
                      <circle cx="22" cy="-6" r="4" fill="#fbbf24" />
                      <rect x="19" y="-2" width="6" height="12" fill="#ea580c" />
                      {/* Asphalt roller icon */}
                      <rect x="40" y="-8" width="30" height="20" rx="3" fill="#334155" />
                      <circle cx="48" cy="12" r="5" fill="#64748b" />
                      <circle cx="62" cy="12" r="5" fill="#64748b" />
                      <text x="25" y="22" textAnchor="middle" fill="#f97316" fontSize="8" fontWeight="bold">İŞÇİ HEYƏTİ</text>
                    </g>

                    {/* Approaching Vehicle */}
                    <g transform="translate(230, 142)">
                      <rect x="0" y="0" width="40" height="24" rx="4" fill="#2563eb" stroke="#60a5fa" strokeWidth="1.5" />
                      <rect x="8" y="3" width="16" height="18" rx="2" fill="#93c5fd" />
                      <text x="20" y="14" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">{licensePlate}</text>
                      <text x="20" y="-4" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">
                        {vehicleSpeedKmH} km/s
                      </text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Real-Time Telemetry & Sliders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sliders Column */}
                <div className="space-y-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Simulyasiya Giriş Parametrləri
                  </h4>

                  {/* Vehicle Speed Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Nəqliyyatın Yaxınlaşma Sürəti</span>
                      <span className="font-mono font-bold text-amber-400">{vehicleSpeedKmH} km/s</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="140"
                      step="1"
                      value={vehicleSpeedKmH}
                      onChange={(e) => setVehicleSpeedKmH(Number(e.target.value))}
                      data-testid="slider-vehicle-speed"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>30 km/s</span>
                      <span>Sürət Həddi: {workZoneSpeedLimitKmH} km/s</span>
                      <span>140 km/s</span>
                    </div>
                  </div>

                  {/* Vehicle Gross Mass Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Nəqliyyatın Ümumi Çəkisi</span>
                      <span className="font-mono font-bold text-amber-400">{vehicleGrossMassKg.toLocaleString()} kq</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="40000"
                      step="100"
                      value={vehicleGrossMassKg}
                      onChange={(e) => setVehicleGrossMassKg(Number(e.target.value))}
                      data-testid="slider-vehicle-mass"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>1,000 kq (Sedan)</span>
                      <span>18,000 kq (Avtobus)</span>
                      <span>40,000 kq (TIR)</span>
                    </div>
                  </div>

                  {/* Work Zone Speed Limit Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Təmir Sahəsində Müvəqqəti Sürət Həddi</span>
                      <span className="font-mono font-bold text-amber-400">{workZoneSpeedLimitKmH} km/s</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="80"
                      step="10"
                      value={workZoneSpeedLimitKmH}
                      onChange={(e) => setWorkZoneSpeedLimitKmH(Number(e.target.value))}
                      data-testid="slider-speed-limit"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>30 km/s (Dağ)</span>
                      <span>50 km/s (Magistral)</span>
                      <span>80 km/s (Ekspress)</span>
                    </div>
                  </div>

                  {/* TMA Cushion Stroke Depth */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">TMA Zərbəuducu Deformasiya Dərinliyi (Stroke)</span>
                      <span className="font-mono font-bold text-amber-400">{tmaStrokeDepthM} metr</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="2.4"
                      step="0.1"
                      value={tmaStrokeDepthM}
                      onChange={(e) => setTmaStrokeDepthM(Number(e.target.value))}
                      data-testid="slider-tma-stroke"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.8m (Sərt)</span>
                      <span>1.8m (MASH TL-3)</span>
                      <span>2.4m (Yumşaq)</span>
                    </div>
                  </div>

                  {/* Buffer Space Distance */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">TMA ilə Briqada Arasında Bufer Məsafəsi</span>
                      <span className="font-mono font-bold text-emerald-400">{bufferSpaceDistanceM} metr</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      step="5"
                      value={bufferSpaceDistanceM}
                      onChange={(e) => setBufferSpaceDistanceM(Number(e.target.value))}
                      data-testid="slider-buffer-space"
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>20m (Təhlükəli)</span>
                      <span>50m (Standart)</span>
                      <span>150m (Geniş)</span>
                    </div>
                  </div>

                  {/* TMA Installed Toggle */}
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">TMA Enerjiuducu Amortizator</span>
                      <span className="text-[11px] text-slate-400">
                        {tmaInstalled ? 'MASH TL-3 Quraşdırılıb' : 'YALIN Yük Maşını (Qoruyucusuz)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTmaInstalled(!tmaInstalled)}
                      data-testid="toggle-tma-installed"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        tmaInstalled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {tmaInstalled ? 'AKTİVDİR' : 'DEAKTİV'}
                    </button>
                  </div>
                </div>

                {/* Physics Output Column */}
                <div className="space-y-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-amber-400" />
                    Fiziki Nəticələr və Zərbə Telemetriyası
                  </h4>

                  {/* Status Banner */}
                  <div
                    data-testid="status-banner"
                    className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      simResult.severityStatus === 'OPTIMAL_SAFE_DECELERATION'
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : simResult.severityStatus === 'CONTROLLED_ARREST_SURVIVABLE'
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                        : simResult.severityStatus === 'ELEVATED_G_HAZARD'
                        ? 'bg-orange-950/40 border-orange-500/50 text-orange-200'
                        : 'bg-rose-950/50 border-rose-500/70 text-rose-200 animate-pulse'
                    }`}
                  >
                    {simResult.severityStatus === 'OPTIMAL_SAFE_DECELERATION' ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider">
                        {simResult.severityStatus === 'OPTIMAL_SAFE_DECELERATION' && 'TƏHLÜKƏSİZ TƏMİR KEÇİDİ'}
                        {simResult.severityStatus === 'CONTROLLED_ARREST_SURVIVABLE' && 'NƏZARƏTLİ DAYANMA / SAĞQALMA'}
                        {simResult.severityStatus === 'ELEVATED_G_HAZARD' && 'YÜKSƏK G-QÜVVƏSİ RİSKİ'}
                        {simResult.severityStatus === 'BUFFER_INTRUSION_WORKER_HAZARD' && 'BUFER ZONAYA MÜDAXİLƏ! İŞÇİLƏR ÜÇÜN ÖLÜMCÜL TƏHLÜKƏ'}
                      </div>
                      <div className="text-[11px] opacity-90 mt-0.5">
                        {simResult.workerSafetyCompromised
                          ? 'Yük maşını zərbədən irəli diyirlənərək işçilərin olduğu sahəyə çatıb!'
                          : `İşçilərə qədər təhlükəsiz qalan bufer məsafəsi: ${simResult.remainingBufferMarginM} metr`}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/50">
                      <span className="text-slate-400 block text-[10px]">Tələb Olunan Taper Uzunluğu</span>
                      <span className="text-base font-bold text-amber-300 font-mono">
                        {simResult.requiredTaperLengthM} metr
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">L = W * S (AZS 410)</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/50">
                      <span className="text-slate-400 block text-[10px]">Toqquşma Kinetik Enerjisi</span>
                      <span className="text-base font-bold text-amber-300 font-mono">
                        {simResult.tmaImpactKineticEnergyKJ.toLocaleString()} kJ
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">E_k = 0.5 * m * v²</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/50">
                      <span className="text-slate-400 block text-[10px]">Orta Yavaşlama G-Qüvvəsi</span>
                      <span className={`text-base font-bold font-mono ${
                        simResult.averageDecelerationG > 12 ? 'text-rose-400' : 'text-emerald-300'
                      }`}>
                        {simResult.averageDecelerationG} G
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Maksimum təhlükəsiz hədd: 12G</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/50">
                      <span className="text-slate-400 block text-[10px]">Yük Maşınının İrəli Diyirlənməsi</span>
                      <span className="text-base font-bold text-amber-300 font-mono">
                        {simResult.shadowTruckRollAheadDistanceM} metr
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Roll-ahead məsafəsi</span>
                    </div>
                  </div>

                  {/* Statutory Sanctions Preview */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>İXM 328 Sürət Həddinin Aşılması:</span>
                      <span className="font-mono font-bold text-amber-400">
                        +{simResult.speedExcessKmH} km/s
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>İnzibati Cərimə Məbləği:</span>
                      <span className="font-mono font-bold text-white">
                        {convertCurrency(simResult.statutoryFineAzn, currency)} {sym}
                        {simResult.statutoryPenaltyPoints > 0 && (
                          <span className="ml-1 text-rose-400">({simResult.statutoryPenaltyPoints} bal)</span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                      <span>İXM 38 ilə 50% Güzəştli Ödəniş (30 gün):</span>
                      <span className="font-mono font-bold text-emerald-300">
                        {convertCurrency(simResult.discountedFineAzn, currency)} {sym}
                      </span>
                    </div>

                    {simResult.tmaDamagedReplacementCostAzn > 0 && (
                      <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/40 text-rose-200 text-[11px] mt-2">
                        <strong>Mülki Məcəllə Maddə 1108:</strong> TMA amortizator moduluna dəyən zərərin kompensasiyası:{' '}
                        <span className="font-mono font-bold text-white">
                          {convertCurrency(simResult.tmaDamagedReplacementCostAzn, currency)} {sym}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS & SANCTIONS */}
          {activeTab === 'presets' && (
            <div className="space-y-6" data-testid="presets-section">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-400" />
                    Azərbaycan Standart Nəqliyyat Preserləri və İXM Cərimə Şkalası
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Müxtəlif nəqliyyat kateqoriyalarının təmir sahələrində hərəkət dinamikası və qanunvericiliklə müəyyən edilmiş sanksiyalar
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_WORK_ZONE_VEHICLES.map((v) => {
                  const isSelected = selectedVehicle.id === v.id;
                  return (
                    <div
                      key={v.id}
                      data-testid={`vehicle-card-${v.id}`}
                      onClick={() => handleSelectVehicle(v)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/70 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800/30 border-slate-700/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-amber-400 rounded">
                          {v.licensePlate}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {v.grossMassKg.toLocaleString()} kq
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm font-semibold text-white">
                        {v.nameAz}
                      </h4>

                      <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Nominal Yaxınlaşma:</span>
                          <span className="font-mono text-white">{v.nominalApproachSpeedKmH} km/s</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Qəza Sərtliyi:</span>
                          <span className="font-mono text-white">{v.frontalCrushStiffnessKNm} kN/m</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Sürücü Reaksiyası:</span>
                          <span className="font-mono text-white">{v.driverReactionTimeSec} san</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-amber-300 font-medium">
                          <span>Aktiv Seçim</span>
                          <Check className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legal Penalty Table */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  İnzibati Xətalar Məcəlləsi (İXM) Təmir Sahələri Cərimə Cədvəli
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 px-3">Xəta Kateqoriyası</th>
                        <th className="py-2 px-3">Hüquqi Əsas</th>
                        <th className="py-2 px-3">Cərimə Məbləği</th>
                        <th className="py-2 px-3">Cərimə Balı</th>
                        <th className="py-2 px-3">50% Güzəşt (İXM 38)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3">Sürət həddini 10-20 km/s aşma</td>
                        <td className="py-2.5 px-3 font-mono">İXM 328.1</td>
                        <td className="py-2.5 px-3 font-bold text-white">20 AZN</td>
                        <td className="py-2.5 px-3">0 bal</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">10 AZN</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Sürət həddini 20-40 km/s aşma</td>
                        <td className="py-2.5 px-3 font-mono">İXM 328.2</td>
                        <td className="py-2.5 px-3 font-bold text-white">50 AZN</td>
                        <td className="py-2.5 px-3 text-amber-400 font-bold">2 bal</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">25 AZN</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Sürət həddini 40-60 km/s aşma</td>
                        <td className="py-2.5 px-3 font-mono">İXM 328.3</td>
                        <td className="py-2.5 px-3 font-bold text-white">150 AZN</td>
                        <td className="py-2.5 px-3 text-amber-400 font-bold">3 bal</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">75 AZN</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Sürət həddini &gt;60 km/s aşma</td>
                        <td className="py-2.5 px-3 font-mono">İXM 328.4</td>
                        <td className="py-2.5 px-3 font-bold text-white">250 AZN</td>
                        <td className="py-2.5 px-3 text-rose-400 font-bold">4 bal</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">125 AZN</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Müvəqqəti nişanlara və zolaq qapanmasına tabe olmama</td>
                        <td className="py-2.5 px-3 font-mono">İXM 327.1</td>
                        <td className="py-2.5 px-3 font-bold text-white">40 AZN</td>
                        <td className="py-2.5 px-3">0 bal</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">20 AZN</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Təmir avadanlıqlarına və ya TMA-ya zərər vurma</td>
                        <td className="py-2.5 px-3 font-mono">İXM 353.1 & MM 1108</td>
                        <td className="py-2.5 px-3 font-bold text-white">200-500 AZN + Zərər</td>
                        <td className="py-2.5 px-3 text-rose-400 font-bold">Mülki İddia</td>
                        <td className="py-2.5 px-3 text-slate-400">Yalnız cəriməyə şamil</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TECHNICAL CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="checklist-section">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    10 Maddəlik Magistral Təmir Sahəsi Texniki Təhlükəsizlik Auditi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    AZS 410, AZS 342, EN 1317-5 və Əmək Təhlükəsizliyi standartlarına əsaslanan rəsmi yoxlama
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    data-testid="checklist-select-all-btn"
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-all"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    data-testid="checklist-reset-btn"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                  >
                    Təmizlə
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Uyğunluq Göstəricisi:</span>
                  <span className="font-bold text-amber-400">
                    {checklistResult.checkedCount} / {checklistResult.totalItems} Maddə ({checklistResult.percentageScore}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistResult.percentageScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${checklistResult.percentageScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>
                    İcbari maddələr:{' '}
                    <strong className="text-white">
                      {checklistResult.mandatoryChecked}/{checklistResult.mandatoryTotal}
                    </strong>
                  </span>
                  <span>
                    Sertifikat hüququ:{' '}
                    <strong className={checklistResult.isEligibleForCertificate ? 'text-emerald-400' : 'text-rose-400'}>
                      {checklistResult.isEligibleForCertificate ? 'UYĞUNDUR' : 'YETƏRSİZ'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {MOCK_WORK_ZONE_CHECKLIST.map((item) => {
                  const isChecked = checkedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      data-testid={`checklist-item-${item.id}`}
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-amber-950/20 border-amber-500/40 text-slate-100'
                          : 'bg-slate-800/30 border-slate-700/60 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        data-testid={`checkbox-${item.id}`}
                        className="mt-1 w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-amber-300 rounded border border-slate-700">
                            {item.standardCode}
                          </span>
                          {item.mandatory && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                              İcbari Tələb
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 font-medium text-slate-200">
                          {item.descriptionAz}
                        </p>
                        <span className="mt-1 block text-[11px] text-slate-500">
                          Hüquqi baza: {item.penaltyClause}
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
            <div className="space-y-6" data-testid="exam-section">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Təmir Sahələri Təhlükəsizliyi və İXM Sürücü Test Simulyatoru
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    10 sualdan ibarət rəsmi attestasiya imtahanı (Keçid balı: 70%)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!examSubmitted ? (
                    <button
                      onClick={handleSubmitExam}
                      data-testid="exam-submit-btn"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                    >
                      Nəticəni Yoxla
                    </button>
                  ) : (
                    <button
                      onClick={handleResetExam}
                      data-testid="exam-reset-btn"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
                    >
                      Yenidən Başla
                    </button>
                  )}
                </div>
              </div>

              {examSubmitted && (
                <div
                  data-testid="exam-result-banner"
                  className={`p-4 rounded-xl border flex items-center gap-4 ${
                    examResult.passed
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {examResult.passed ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {examResult.passed ? 'İmtahan Uğurla Başa Çatdı!' : 'İmtahan Nəticəsi Qeyri-Qənaətbəxşdir'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      Düzgün cavablar: {examResult.correctAnswers} / {examResult.totalQuestions} ({examResult.percentageScore}%)
                    </p>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-4">
                {MOCK_WORK_ZONE_EXAM.map((q, idx) => {
                  const userAnswer = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      data-testid={`exam-question-${q.id}`}
                      className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-amber-400">
                          Sual #{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {q.statutoryReference}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {q.questionAz}
                      </p>

                      <div className="space-y-2">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let optStyle = 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800/60';

                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-medium';
                            } else if (isSelected && optIdx !== q.correctOptionIndex) {
                              optStyle = 'bg-rose-950/40 border-rose-500/60 text-rose-200';
                            }
                          } else if (isSelected) {
                            optStyle = 'bg-amber-950/30 border-amber-500/60 text-amber-200 font-medium';
                          }

                          return (
                            <div
                              key={optIdx}
                              onClick={() => handleAnswerExam(q.id, optIdx)}
                              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2.5 ${optStyle}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-400 text-slate-950'
                                    : 'border-slate-600 text-slate-400'
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span className="flex-1">{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700/50 text-[11px] text-slate-300">
                          <strong className="text-amber-400">İzah: </strong>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE GENERATOR */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="certificate-section">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    Rəsmi Elektron Keçid və Təhlükəsizlik Sertifikatı (AAYDA / BDYP)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    SİMA rəqəmsal imzası və təhlükəsizlik PIN şifrəsi ilə qorunan rəsmi icazə vərəqəsi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateCertificate}
                    data-testid="generate-cert-btn"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                  >
                    Yeni Sertifikat Yarat
                  </button>
                  <button
                    onClick={handlePrint}
                    data-testid="print-cert-btn"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    title="Çap et"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Certificate Form */}
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Sürücünün S.A.A.</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    data-testid="input-driver-name"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı</label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    data-testid="input-license-plate"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Printable Certificate Template */}
              <div
                data-testid="official-certificate-card"
                className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden"
              >
                {/* Background Emblem Watermark */}
                <div className="absolute right-6 top-6 opacity-5 pointer-events-none select-none">
                  <HardHat className="w-64 h-64 text-amber-500" />
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-amber-500/30 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                        AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        Magistral Təmir Sahəsi Tranzit və Təhlükəsizlik Sertifikatı
                      </h3>
                      <div className="text-[11px] text-slate-400">
                        Dövlət Yol Polisi İdarəsi (BDYP) ilə Birgə Nəzarət Sistemi
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {activeCertificate.certificateId}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Tarix: {new Date(activeCertificate.issueTimestamp).toLocaleDateString('az-AZ')}
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Sürücü / Məsul Şəxs</span>
                    <span className="font-bold text-white text-sm">
                      {activeCertificate.driverFullName}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Dövlət Qeydiyyat Nişanı</span>
                    <span className="font-bold text-amber-300 font-mono text-sm">
                      {activeCertificate.vehiclePlate}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Uyğunluq Dərəcəsi</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {activeCertificate.complianceRating}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Təmir Dəhlizi</span>
                    <span className="font-semibold text-white line-clamp-1">
                      {activeCertificate.corridorNameAz}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Ölçülmüş Sürət</span>
                    <span className="font-mono font-bold text-amber-400">
                      {activeCertificate.measuredSpeedKmH} km/s (Hədd: {activeCertificate.workZoneSpeedLimitKmH})
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">TMA Yoxlama Kodu</span>
                    <span className="font-mono text-slate-300">
                      {activeCertificate.tmaVerificationCode}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Signatures */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-400 text-[10px]">
                      SİMA Rəqəmsal İmzası:{' '}
                      <strong className="text-amber-400 font-mono">
                        {activeCertificate.simaDigitalSignatureUID}
                      </strong>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      SHA-256 Yoxlama Hash-i:{' '}
                      <span className="font-mono text-slate-500">
                        {activeCertificate.sha256Checksum}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(activeCertificate.certificateId)}
                      data-testid="copy-cert-id-btn"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                    </button>
                    <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
                      PIN: {activeCertificate.pinPasscode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="registry-section">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Search className="w-5 h-5 text-amber-400" />
                    Vahid AAYDA & BDYP Təmir Təhlükəsizlik Sertifikatları Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Elektron bazada qeydiyyatdan keçmiş bütün aktiv tranzit sertifikatları və yoxlama protokolları
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Sertifikat ID, Nömrə, Sürücü..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    data-testid="registry-search-input"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2" />
                </div>
              </div>

              {/* Registry Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                        <th className="py-3 px-4">Sertifikat ID</th>
                        <th className="py-3 px-4">Nəqliyyat Nişanı</th>
                        <th className="py-3 px-4">Sürücü</th>
                        <th className="py-3 px-4">Təmir Sahəsi</th>
                        <th className="py-3 px-4">Sürət</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredCertificates.length > 0 ? (
                        filteredCertificates.map((cert) => (
                          <tr
                            key={cert.certificateId}
                            data-testid={`registry-row-${cert.certificateId}`}
                            className="hover:bg-slate-900/40 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-amber-400">
                              {cert.certificateId}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-white">
                              {cert.vehiclePlate}
                            </td>
                            <td className="py-3 px-4">{cert.driverFullName}</td>
                            <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                              {cert.corridorNameAz}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              {cert.measuredSpeedKmH} / {cert.workZoneSpeedLimitKmH} km/s
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {cert.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setActiveCertificate(cert);
                                  setActiveTab('certificate');
                                }}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-xs transition-colors"
                              >
                                Göstər
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            Axtarışa uyğun qeydiyyat tapılmadı.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AAYDA Mühəndis Təhlükəsizlik Şəbəkəsi Aktivdir (v2026.11)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              data-testid="bottom-close-btn"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
