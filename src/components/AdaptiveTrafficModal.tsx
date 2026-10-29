import React, { useState, useMemo } from 'react';
import {
  X,
  Radio,
  Cpu,
  Sliders,
  FileCheck,
  Search,
  Printer,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Database,
  ExternalLink,
  ShieldAlert,
  Zap,
  Navigation,
  Activity,
  Layers,
  Car,
  Clock,
  DollarSign,
  Fuel,
  Leaf,
  Compass,
  ShieldCheck,
  Gauge,
  Sparkles,
} from 'lucide-react';
import {
  Currency,
  formatCurrency,
  StrategicCorridorId,
  SignalControlMode,
  LevelOfServiceGrade,
  VehiclePowertrainType,
  calculateGreenWaveProgression,
  evaluateQueueAndSaturation,
  calculateCongestionTariff,
  evaluateItsChecklist,
  evaluateTrafficExam,
  generateOfficialItsPriorityPass,
  OfficialItsPriorityPass,
} from '../utils/adaptiveTrafficCompliance';
import {
  MOCK_CORRIDORS_LIST,
  MOCK_CORRIDORS_RECORD,
  MOCK_TRAFFIC_VEHICLE_PRESETS,
  MOCK_ITS_CHECKLIST,
  MOCK_TRAFFIC_EXAM_QUESTIONS,
  MOCK_PUBLIC_ITS_PASSES,
  TrafficVehiclePreset,
} from '../data/mockAdaptiveTrafficData';
import { Vehicle } from '../types/vehicle';

export interface AdaptiveTrafficModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type TrafficTab =
  | 'corridors'
  | 'greenwave'
  | 'telemetry'
  | 'pricing'
  | 'checklist'
  | 'exam'
  | 'pass'
  | 'registry';

export const AdaptiveTrafficModal: React.FC<AdaptiveTrafficModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<TrafficTab>('corridors');
  const [currency, setCurrency] = useState<Currency>('AZN');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Selected Corridor
  const [selectedCorridorId, setSelectedCorridorId] = useState<StrategicCorridorId>('CORRIDOR_NEFTCHILAR');
  const activeCorridor = MOCK_CORRIDORS_RECORD[selectedCorridorId] || MOCK_CORRIDORS_LIST[0];

  // Green Wave Simulator State
  const [progressionSpeedKmh, setProgressionSpeedKmh] = useState<number>(activeCorridor.defaultProgressionSpeedKmh);
  const [cycleTimeSec, setCycleTimeSec] = useState<number>(activeCorridor.defaultCycleTimeSec);
  const [greenSplitPercent, setGreenSplitPercent] = useState<number>(50);
  const [controlMode, setControlMode] = useState<SignalControlMode>(activeCorridor.activeControlMode);

  // Queue & Saturation Telemetry State
  const [arrivalRate, setArrivalRate] = useState<number>(1450);
  const [saturationFlowRate, setSaturationFlowRate] = useState<number>(1900);
  const [effectiveGreenSec, setEffectiveGreenSec] = useState<number>(55);
  const [numberOfLanes, setNumberOfLanes] = useState<number>(3);

  // Congestion Pricing State
  const [vehiclePlate, setVehiclePlate] = useState<string>(
    targetCar?.plateNumber || (targetCar?.vin ? `99-${targetCar.vin.substring(0, 2).toUpperCase()}-${targetCar.vin.substring(2, 5)}` : '10-TT-103')
  );
  const [vehicleModel, setVehicleModel] = useState<string>(
    targetCar ? `${targetCar.make} ${targetCar.model}` : 'Mercedes-Benz Sprinter 319 CDI (Təcili Tibbi Yardım)'
  );
  const [organizationName, setOrganizationName] = useState<string>(
    'Bakı Şəhər Təcili və Təxirəsalınmaz Tibbi Yardım Stansiyası'
  );
  const [powertrain, setPowertrain] = useState<VehiclePowertrainType>('EMERGENCY_AMBULANCE_FIRE');
  const [isPeakHour, setIsPeakHour] = useState<boolean>(true);
  const [passDurationDays, setPassDurationDays] = useState<number>(30);
  const [requestEmergencyPreemption, setRequestEmergencyPreemption] = useState<boolean>(true);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'chk-loop-sensors': true,
    'chk-anpr-cameras': true,
    'chk-controller-sync': true,
    'chk-amber-clearance': true,
    'chk-v2i-rsu': true,
    'chk-ups-power': true,
    'chk-pedestrian-buttons': true,
    'chk-fiber-backhaul': true,
    'chk-emergency-preempt': true,
  });

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Issued Passes
  const [issuedPasses, setIssuedPasses] = useState<OfficialItsPriorityPass[]>(MOCK_PUBLIC_ITS_PASSES);
  const [currentIssuedPass, setCurrentIssuedPass] = useState<OfficialItsPriorityPass | null>(null);

  // Registry Search
  const [registryQuery, setRegistryQuery] = useState<string>('');

  // Handle Preset Selection
  const applyPreset = (preset: TrafficVehiclePreset) => {
    setVehiclePlate(preset.vehiclePlate);
    setVehicleModel(preset.modelAz);
    setOrganizationName(preset.organizationAz);
    setPowertrain(preset.powertrain);
    setSelectedCorridorId(preset.preferredCorridorId);
    setRequestEmergencyPreemption(preset.isEmergencyPreemptionEligible);
  };

  // Copy helper
  const handleCopy = (text: string, codeId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeId);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const greenWaveResult = useMemo(() => {
    return calculateGreenWaveProgression({
      corridorLengthMeters: activeCorridor.corridorLengthMeters,
      intersectionCount: activeCorridor.intersectionCount,
      progressionSpeedKmh,
      cycleTimeSec,
      greenSplitRatio: greenSplitPercent / 100,
      trafficVolumeVehPerHour: Math.round(activeCorridor.averageDailyVehicles / 14),
      controlMode,
    });
  }, [activeCorridor, progressionSpeedKmh, cycleTimeSec, greenSplitPercent, controlMode]);

  const queueResult = useMemo(() => {
    return evaluateQueueAndSaturation({
      arrivalRateVehPerHourPerLane: arrivalRate,
      saturationFlowRateVehPerHourPerLane: saturationFlowRate,
      cycleTimeSec,
      effectiveGreenSec,
      numberOfLanes,
    });
  }, [arrivalRate, saturationFlowRate, cycleTimeSec, effectiveGreenSec, numberOfLanes]);

  const pricingResult = useMemo(() => {
    return calculateCongestionTariff({
      corridorId: selectedCorridorId,
      powertrain,
      isPeakHour,
      levelOfService: queueResult.levelOfService,
      passDurationDays,
      requestEmergencyPreemptionPass: requestEmergencyPreemption,
    });
  }, [selectedCorridorId, powertrain, isPeakHour, queueResult.levelOfService, passDurationDays, requestEmergencyPreemption]);

  const checklistResult = useMemo(() => {
    return evaluateItsChecklist(checkedItems, MOCK_ITS_CHECKLIST);
  }, [checkedItems]);

  const examResult = useMemo(() => {
    return evaluateTrafficExam(examAnswers, MOCK_TRAFFIC_EXAM_QUESTIONS);
  }, [examAnswers]);

  // Issue new pass
  const handleIssuePass = () => {
    const newPass = generateOfficialItsPriorityPass(
      vehiclePlate,
      vehicleModel,
      organizationName,
      powertrain === 'EMERGENCY_AMBULANCE_FIRE'
        ? 'Kateqoriya 1: Kritik Həyat Qurtarma və Təxirəsalınmaz Tibbi Prioritet'
        : powertrain === 'ELECTRIC'
        ? 'Kateqoriya 4: Standart Yaşıl Nəqliyyat (50% Ekoloji Güzəşt)'
        : 'Kateqoriya 5: Standart Ağıllı Şəbəkə Keçidi',
      activeCorridor,
      controlMode,
      pricingResult.totalPeriodFeeAzn,
      requestEmergencyPreemption
    );
    setIssuedPasses((prev) => [newPass, ...prev]);
    setCurrentIssuedPass(newPass);
    setActiveTab('pass');
  };

  // Filter registry
  const filteredRegistry = useMemo(() => {
    const q = registryQuery.trim().toLowerCase();
    if (!q) return issuedPasses;
    return issuedPasses.filter(
      (p) =>
        p.passId.toLowerCase().includes(q) ||
        p.vehiclePlate.toLowerCase().includes(q) ||
        p.operatorOrganizationAz.toLowerCase().includes(q) ||
        p.corridorNameAz.toLowerCase().includes(q)
    );
  }, [issuedPasses, registryQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      data-testid="adaptive-traffic-modal"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-emerald-500/20 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RİNN • AYNA • BDYP İTS-WAVE-AZ-2026
                </span>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                  SCOOT / SCATS Canlı Sinxronizasiya
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Ağıllı Nəqliyyat Sistemləri &quot;Yaşıl Dalğa&quot; və Svetofor Sinxronizasiyası Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === c
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="close-adaptive-traffic-modal-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto no-scrollbar">
          {[
            { id: 'corridors', label: '8 Strateji Dəhliz', icon: Navigation },
            { id: 'greenwave', label: 'Yaşıl Dalğa Simulyatoru', icon: Sliders },
            { id: 'telemetry', label: 'Növbə & Doymuşluq (LOS)', icon: Activity },
            { id: 'pricing', label: 'Tıxac Qiymətləndirməsi', icon: DollarSign },
            { id: 'checklist', label: '10-Bənd İTS İnfrastruktur', icon: FileCheck },
            { id: 'exam', label: 'Svetofor Mühəndisliyi İmtahanı', icon: Award },
            { id: 'pass', label: 'Rəsmi Keçid Vəsiqəsi', icon: ShieldCheck },
            { id: 'registry', label: 'Dövlət Reyestri', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TrafficTab)}
                data-testid={`traffic-tab-${tab.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CORRIDORS RADAR */}
          {activeTab === 'corridors' && (
            <div className="space-y-6" data-testid="traffic-tab-corridors-content">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-emerald-400" />
                    Bakı Metropoliten Ərazisinin 8 Əsas Ağıllı Nəqliyyat Dəhlizi
                  </h3>
                  <p className="text-xs text-slate-400">
                    SCOOT və SCATS adaptiv svetofor şəbəkəsi vasitəsilə mərkəzi idarə olunan strateji arteriyalar.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Aktiv rejim:</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    {activeCorridor.activeControlMode}
                  </span>
                </div>
              </div>

              {/* Grid of 8 Corridors */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_CORRIDORS_LIST.map((corridor) => {
                  const isSelected = corridor.id === selectedCorridorId;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => {
                        setSelectedCorridorId(corridor.id);
                        setProgressionSpeedKmh(corridor.defaultProgressionSpeedKmh);
                        setCycleTimeSec(corridor.defaultCycleTimeSec);
                        setControlMode(corridor.activeControlMode);
                      }}
                      data-testid={`corridor-card-${corridor.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                          : 'bg-slate-800/30 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {corridor.intersectionCount} Yol Ayrıcı
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              corridor.historicalPeakLos === 'B'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : corridor.historicalPeakLos === 'C'
                                ? 'bg-teal-500/20 text-teal-300'
                                : corridor.historicalPeakLos === 'D'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            LOS {corridor.historicalPeakLos}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{corridor.nameAz}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{corridor.descriptionAz}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Uzunluq:</span>
                          <span className="font-semibold text-slate-200">{(corridor.corridorLengthMeters / 1000).toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Sinxron Sürət:</span>
                          <span className="font-semibold text-emerald-400">{corridor.defaultProgressionSpeedKmh} km/saat</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Gündəlik Nəqliyyat:</span>
                          <span className="font-semibold text-slate-200">{corridor.averageDailyVehicles.toLocaleString('az-AZ')} maşın</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>İTS Sensorları:</span>
                          <span className="font-semibold text-teal-400">{corridor.connectedAynaiTsSensors} detektor</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Corridor Detail */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Seçilmiş Dəhliz Detalları</span>
                    <h3 className="text-lg font-bold text-white">{activeCorridor.nameAz}</h3>
                    <p className="text-xs text-slate-400">{activeCorridor.descriptionAz}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('greenwave')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Sliders className="w-4 h-4" />
                    Bu Dəhliz üçün Yaşıl Dalğanı Sinxronlaşdır
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-3 border-t border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Əsas Tənzimlənən Kəsişmələr:</span>
                    <ul className="space-y-1 text-slate-200 list-disc list-inside">
                      {activeCorridor.keyIntersections.map((inter, i) => (
                        <li key={i}>{inter}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-slate-400 block">GPS Koordinatları & Rabitə:</span>
                    <div className="text-slate-200 font-mono">
                      Enlik: {activeCorridor.coordinates.lat}° N<br />
                      Uzunluq: {activeCorridor.coordinates.lng}° E
                    </div>
                    <div className="text-slate-400">
                      RİNN Optik Magistral Gecikməsi: <span className="text-emerald-400 font-semibold">14 ms (Real-time)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-slate-400 block">Tövsiyə Edilən Dəhliz Rejimi:</span>
                    <div className="font-bold text-white">{activeCorridor.activeControlMode}</div>
                    <p className="text-slate-400 text-[11px]">
                      Süni intellekt əsaslı axın analizatoru pik saatlarda koordinasiya ofsetlərini avtomatik tənzimləyir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GREEN WAVE SIMULATOR */}
          {activeTab === 'greenwave' && (
            <div className="space-y-6" data-testid="traffic-tab-greenwave-content">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-400" />
                    &quot;Yaşıl Dalğa&quot; (Green Wave) Koordinasiya və Sürət Sinxronizasiyası Stendi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dəhliz boyu yerləşən svetoforların faza ofsetlərini, dövr vaxtını və buraxılış zolağını (bandwidth) interaktiv hesablayın.
                  </p>
                </div>
                <div className="text-xs text-slate-300 font-semibold px-3 py-1 rounded-lg bg-slate-800 border border-slate-700">
                  Dəhliz: <span className="text-emerald-400">{activeCorridor.nameAz.split('(')[0]}</span>
                </div>
              </div>

              {/* Sliders and Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    Dəhliz Parametrlərinin Tənzimlənməsi
                  </h4>

                  {/* Slider: Progression Speed */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Tövsiyə Olunan Yaşıl Dalğa Sürəti:</span>
                      <span className="text-emerald-400 font-bold font-mono">{progressionSpeedKmh} km/saat ({greenWaveResult.idealProgressionSpeedMs} m/s)</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={90}
                      step={5}
                      value={progressionSpeedKmh}
                      onChange={(e) => setProgressionSpeedKmh(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>30 km/s (Şəhər mərkəzi)</span>
                      <span>60 km/s (Standart magistral)</span>
                      <span>90 km/s (Ekspress koridor)</span>
                    </div>
                  </div>

                  {/* Slider: Cycle Time */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Svetofor Dövr Vaxtı (Cycle Time - C):</span>
                      <span className="text-teal-400 font-bold font-mono">{cycleTimeSec} saniyə</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={150}
                      step={5}
                      value={cycleTimeSec}
                      onChange={(e) => setCycleTimeSec(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>60 s (Qısa dövr)</span>
                      <span>100 s (Standart pik)</span>
                      <span>150 s (Ağır qovşaqlar)</span>
                    </div>
                  </div>

                  {/* Slider: Green Split */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Əsas Dəhliz Yaşıl Faza Bölgüsü (Green Split):</span>
                      <span className="text-emerald-400 font-bold font-mono">{greenSplitPercent}% ({greenWaveResult.greenTimeSec} saniyə yaşıl)</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={70}
                      step={2}
                      value={greenSplitPercent}
                      onChange={(e) => setGreenSplitPercent(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Control Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-medium block">İdarəetmə Alqoritmi:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(['FIXED_TIME', 'ACTUATED', 'ADAPTIVE_SCOOT', 'ADAPTIVE_SCATS', 'EMERGENCY_PREEMPTION'] as SignalControlMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setControlMode(mode)}
                          className={`p-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer text-left ${
                            controlMode === mode
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mode.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulation Output Dashboard */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Sinxronizasiya Keyfiyyət İndeksi
                      </h4>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          greenWaveResult.progressionQualityGrade === 'EXCELLENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : greenWaveResult.progressionQualityGrade === 'GOOD'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            : greenWaveResult.progressionQualityGrade === 'FAIR'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {greenWaveResult.progressionQualityGrade}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium mb-4">{greenWaveResult.progressionQualityAz}</p>

                    {/* Bandwidth bar */}
                    <div className="space-y-1.5 mb-5">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Fasiləsiz Keçid Pəncərəsi (Bandwidth):</span>
                        <span className="font-bold text-emerald-400">{greenWaveResult.bandwidthSec} saniyə ({greenWaveResult.bandwidthEfficiencyPercent}% effektivlik)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${greenWaveResult.bandwidthEfficiencyPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Yol Ayrıcılar Arası Ofset:</span>
                        <span className="text-base font-bold text-white font-mono">{greenWaveResult.idealOffsetPerIntersectionSec} saniyə</span>
                        <span className="text-[10px] text-slate-500 block">Orta məsafə: {greenWaveResult.averageIntersectionSpacingMeters} m</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Gözlənilən Dayanma Sayı:</span>
                        <span className="text-base font-bold text-teal-300 font-mono">{greenWaveResult.expectedStopsPerTrip} / {activeCorridor.intersectionCount} stop</span>
                        <span className="text-[10px] text-slate-500 block">Dalğasız halda: {Math.round(activeCorridor.intersectionCount * 0.65)} stop</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Səyahət Vaxtına Qənaət:</span>
                        <span className="text-base font-bold text-emerald-400 font-mono">-{greenWaveResult.travelTimeSavedPercent}%</span>
                        <span className="text-[10px] text-slate-500 block">{greenWaveResult.travelTimeSavedSec} saniyə / reys</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Gündəlik Yanacaq Qənaəti:</span>
                        <span className="text-base font-bold text-amber-300 font-mono">{greenWaveResult.fuelSavedLitersPerDay.toLocaleString('az-AZ')} L</span>
                        <span className="text-[10px] text-slate-500 block">CO2: -{greenWaveResult.co2ReductionKgPerDay.toLocaleString('az-AZ')} kq/gün</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Mühəndis Tövsiyəsi: </span>
                      {greenWaveResult.recommendationAz}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUEUE & SATURATION TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6" data-testid="traffic-tab-telemetry-content">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Növbə Uzunluğu, Doymuşluq Axını & Webster Ləngimə Analitika Stendi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kəsişmənin buraxılış qabiliyyətini (Degree of Saturation - X) və Xidmət Səviyyəsini (Level of Service - LOS A-F) hesablayın.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Cari Xidmət Səviyyəsi:</span>
                  <span
                    className={`text-sm font-black px-3 py-1 rounded-xl border ${
                      queueResult.levelOfService === 'A' || queueResult.levelOfService === 'B'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : queueResult.levelOfService === 'C' || queueResult.levelOfService === 'D'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    LOS {queueResult.levelOfService}
                  </span>
                </div>
              </div>

              {/* Sliders for Webster Model */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Hərəkət Axını və Qovşaq Giriş Parametrləri
                  </h4>

                  {/* Arrival Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Gəlmə İntensivliyi (q - avto/saat/zolaq):</span>
                      <span className="text-emerald-400 font-bold font-mono">{arrivalRate} avto/saat</span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={2200}
                      step={50}
                      value={arrivalRate}
                      onChange={(e) => setArrivalRate(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Saturation Flow Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Doymuşluq Axın Həddi (S - avto/saat/zolaq):</span>
                      <span className="text-teal-400 font-bold font-mono">{saturationFlowRate} PCU/saat</span>
                    </div>
                    <input
                      type="range"
                      min={1400}
                      max={2200}
                      step={50}
                      value={saturationFlowRate}
                      onChange={(e) => setSaturationFlowRate(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>

                  {/* Effective Green Time */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Effektiv Yaşıl Vaxt (g - saniyə):</span>
                      <span className="text-emerald-400 font-bold font-mono">{effectiveGreenSec} saniyə (C={cycleTimeSec}s)</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={cycleTimeSec - 10}
                      step={1}
                      value={effectiveGreenSec}
                      onChange={(e) => setEffectiveGreenSec(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Lanes */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Hərəkət Zolaqlarının Sayı:</span>
                      <span className="text-white font-bold font-mono">{numberOfLanes} zolaq</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((lane) => (
                        <button
                          key={lane}
                          type="button"
                          onClick={() => setNumberOfLanes(lane)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            numberOfLanes === lane
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {lane} Zolaq
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Telemetry Output Cards */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3">Hesablanmış Ləngimə və Növbə Nəticələri</h4>
                    <p className="text-xs text-slate-300 mb-4">{queueResult.levelOfServiceDescriptionAz}</p>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Doymuşluq Dərəcəsi (X):</span>
                        <span className={`text-xl font-bold font-mono ${queueResult.degreeOfSaturationX >= 1.0 ? 'text-red-400' : queueResult.degreeOfSaturationX >= 0.85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {queueResult.degreeOfSaturationX.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Tutuma nisbət q / c</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Orta Gözləmə Vaxtı:</span>
                        <span className="text-xl font-bold font-mono text-teal-300">
                          {queueResult.averageDelaySecPerVehicle} saniyə
                        </span>
                        <span className="text-[10px] text-slate-500 block">Webster modeli üzrə</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Tıxac Növbəsi (Məsafə):</span>
                        <span className="text-xl font-bold font-mono text-white">
                          {queueResult.queueLengthMeters} metr
                        </span>
                        <span className="text-[10px] text-slate-500 block">~{queueResult.queueLengthVehicles} avtomobil</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Ümumi Buraxılış Tutumu:</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">
                          {queueResult.capacityVehPerHour.toLocaleString('az-AZ')}
                        </span>
                        <span className="text-[10px] text-slate-500 block">avto / saat</span>
                      </div>
                    </div>

                    {/* Spillback Risk */}
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        queueResult.spillbackRisk === 'CRITICAL_GRIDLOCK'
                          ? 'bg-red-500/10 border-red-500/30 text-red-300'
                          : queueResult.spillbackRisk === 'HIGH'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Qonşu Yol Ayrıcı Daşma Riski (Spillback): </span>
                        {queueResult.spillbackRiskAz}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <span className="font-bold text-white block mb-1">Mühəndislik Fəaliyyət Planı:</span>
                    {queueResult.recommendedActionAz}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONGESTION PRICING TARIFF */}
          {activeTab === 'pricing' && (
            <div className="space-y-6" data-testid="traffic-tab-pricing-content">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Dinamik Tıxac Qiymətləndirməsi & Ağıllı Mobillik Keçid Kalkulyatoru
                  </h3>
                  <p className="text-xs text-slate-400">
                    Magistralın sıxlıq səviyyəsinə (LOS) və avtomobilin mühərrik növünə (EV/Hibrid) əsaslanan dinamik rüsum hesablaması.
                  </p>
                </div>
                <div className="text-xs text-slate-300">
                  Valyuta: <span className="font-bold text-emerald-400">{currency}</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Nümunəvi Nəqliyyat Şablonları:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_TRAFFIC_VEHICLE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        vehiclePlate === p.vehiclePlate
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold block text-emerald-400">{p.vehiclePlate}</span>
                      <span className="text-[11px] font-medium block truncate text-slate-300">{p.modelAz.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form and Bill Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white">Nəqliyyat və Keçid Parametrləri</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı:</label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Mühərrik və Texnologiya Tipi:</label>
                      <select
                        value={powertrain}
                        onChange={(e) => setPowertrain(e.target.value as VehiclePowertrainType)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="EMERGENCY_AMBULANCE_FIRE">Operativ Xidmət (Təcili Tibbi / Yanğın - 100% Azad)</option>
                        <option value="ELECTRIC">Tam Elektrik (EV - 50% Güzəşt)</option>
                        <option value="HYBRID">Hibrid (HEV/PHEV - 25% Güzəşt)</option>
                        <option value="INTERNAL_COMBUSTION">Daxili Yanma Mühərriki (Benzin / Dizel)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Avtomobil Modeli / Təyinatı:</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Qurum və ya Şirkət Adı:</label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPeakHour}
                        onChange={(e) => setIsPeakHour(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                      />
                      <span>Pik Saat Rejimi (1.5x Koeffisiyent)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestEmergencyPreemption}
                        onChange={(e) => setRequestEmergencyPreemption(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                      />
                      <span>V2I Prioritet Keçid (Yaşıl Dalğa Preemption)</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Vəsiqənin Qüvvədə Olma Müddəti:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { days: 1, label: '1 Gün' },
                        { days: 7, label: '7 Gün' },
                        { days: 30, label: '30 Gün' },
                        { days: 365, label: '1 İl' },
                      ].map((dur) => (
                        <button
                          key={dur.days}
                          type="button"
                          onClick={() => setPassDurationDays(dur.days)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            passDurationDays === dur.days
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {dur.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tariff Output Bill */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Rüsum Hesablaması və Güzəşt Cədvəli
                    </h4>

                    {pricingResult.isExempt ? (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          100% Azad Edilmiş Operativ Nəqliyyat
                        </div>
                        <p>{pricingResult.legalBasisAz}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                          <span>Baza Gündəlik Dəhliz Rüsumu:</span>
                          <span className="font-mono font-bold text-white">
                            {formatCurrency(pricingResult.baseDailyFeeAzn, currency)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                          <span>Pik Saat Əmsalı ({isPeakHour ? 'Aktiv 1.5x' : 'Standart'}):</span>
                          <span className="font-mono font-bold text-teal-300">
                            {pricingResult.peakHourMultiplier}x
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                          <span>Tıxac Sıxlıq Əlavəsi (LOS {queueResult.levelOfService}):</span>
                          <span className="font-mono font-bold text-amber-300">
                            +{formatCurrency(pricingResult.congestionSurchargeAzn, currency)}
                          </span>
                        </div>
                        {pricingResult.powertrainDiscountPercent > 0 && (
                          <div className="flex justify-between py-1.5 border-b border-slate-800 text-emerald-300">
                            <span>Ekoloji Mühərrik Güzəşti (-{pricingResult.powertrainDiscountPercent}%):</span>
                            <span className="font-mono font-bold">
                              -{formatCurrency(pricingResult.powertrainDiscountAzn, currency)}
                            </span>
                          </div>
                        )}
                        {pricingResult.emergencyPreemptionFeeAzn > 0 && (
                          <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                            <span>V2I Prioritet Yaşıl Dalğa Xidməti:</span>
                            <span className="font-mono font-bold text-teal-300">
                              +{formatCurrency(pricingResult.emergencyPreemptionFeeAzn, currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-slate-700 text-slate-200 font-semibold">
                          <span>Gündəlik Yekun Məbləğ:</span>
                          <span className="font-mono text-emerald-400">
                            {formatCurrency(pricingResult.subtotalDailyAzn, currency)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 text-sm font-bold text-white">
                          <span>Seçilmiş Dövr ({passDurationDays} gün):</span>
                          <span className="font-mono text-xl text-emerald-400">
                            {formatCurrency(pricingResult.totalPeriodFeeAzn, currency)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleIssuePass}
                    data-testid="issue-traffic-pass-btn"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Rəsmi İTS-PRIORITY-AZ-2026 Vəsiqəsini Təsdiqlə və Çıxar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 10-POINT ITS CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="traffic-tab-checklist-content">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    10-Bəndlik Texniki İTS İnfrastruktur & Sensor Təftiş Yoxlama Vərəqəsi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Svetofor kontrollerləri, induktiv dövrələr, C-V2X RSU ötürücüləri və optik rabitə xətlərinin audit protokolu.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const all: Record<string, boolean> = {};
                      MOCK_ITS_CHECKLIST.forEach((item) => {
                        all[item.id] = true;
                      });
                      setCheckedItems(all);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition-all cursor-pointer"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                </div>
              </div>

              {/* Progress and status */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Uyğunluq Səviyyəsi:</span>
                    <span className="text-sm font-bold text-white font-mono">{checklistResult.compliancePercent}%</span>
                    <span className="text-xs text-slate-400">({checklistResult.completedItems} / {checklistResult.totalItems} bənd)</span>
                  </div>
                  <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${checklistResult.compliancePercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  {checklistResult.isEligibleForSynchronization ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Qovşaq Sinxronizasiyaya və Yaşıl Dalğaya Tam Yararlıdır
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Mütləq bəndlər çatışmır ({checklistResult.missingMandatoryAz.length} bənd)
                    </span>
                  )}
                </div>
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_ITS_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setCheckedItems((prev) => ({
                          ...prev,
                          [item.id]: !isChecked,
                        }))
                      }
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {item.categoryAz}
                          </span>
                          {item.isMandatory && (
                            <span className="text-[10px] font-bold text-red-400 uppercase">Mütləq</span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white">{item.titleAz}</h4>
                        <p className="text-[11px] text-slate-400">{item.descriptionAz}</p>
                        <span className="text-[10px] text-emerald-400/80 block font-mono">
                          {item.standardReference}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: THEORETICAL EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="traffic-tab-exam-content">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    10-Suallıq Ağıllı Svetofor & Yol Hərəkəti Mühəndisliyi Nəzəri İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    &quot;Yol Hərəkəti Haqqında&quot; Qanun Maddə 60, 64 və İXM Maddə 327 üzrə dövlət attestasiyası.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Keçid Balı:</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    80% (8 / 10 Düzgün)
                  </span>
                </div>
              </div>

              {/* Exam Results Banner */}
              {examSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    examResult.isPassed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {examResult.isPassed ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-400" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {examResult.isPassed
                          ? 'Təbriklər! İmtahandan Uğurla Keçdiniz'
                          : 'İmtahan Nəticəsi Qeyri-Kafidir'}
                      </h4>
                      <p className="text-xs">
                        Nəticə: {examResult.correctAnswersCount} / {examResult.totalQuestions} ({examResult.scorePercent}%)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setExamAnswers({});
                      setExamSubmitted(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    Yenidən Sına
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_TRAFFIC_EXAM_QUESTIONS.map((q, idx) => {
                  const userAnswer = examAnswers[q.id];
                  const resultDetail = examSubmitted ? examResult.detailedResults[idx] : null;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-emerald-400">Sual {idx + 1} / 10</span>
                        {examSubmitted && resultDetail && (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              resultDetail.isCorrect
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {resultDetail.isCorrect ? 'Düzgün' : 'Səhv'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-medium text-white">{q.questionAz}</p>

                      <div className="space-y-2 pt-1">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let optStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
                            } else if (isSelected && !resultDetail?.isCorrect) {
                              optStyle = 'bg-red-950/40 border-red-500/50 text-red-200';
                            }
                          } else if (isSelected) {
                            optStyle = 'bg-emerald-500/20 border-emerald-500 text-white';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={examSubmitted}
                              onClick={() =>
                                setExamAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx,
                                }))
                              }
                              className={`w-full p-2.5 rounded-xl text-left text-xs border transition-all cursor-pointer flex items-center gap-2 ${optStyle}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                              </div>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                          <p>
                            <span className="font-bold text-emerald-400">İzah: </span>
                            {q.explanationAz}
                          </p>
                          <p className="font-mono text-[10px] text-slate-500">
                            Hüquqi Əsas: {q.legalBasisAz}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!examSubmitted && (
                <button
                  onClick={() => setExamSubmitted(true)}
                  disabled={Object.keys(examAnswers).length < MOCK_TRAFFIC_EXAM_QUESTIONS.length}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    Object.keys(examAnswers).length === MOCK_TRAFFIC_EXAM_QUESTIONS.length
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  İmtahan Cavablarını Təsdiqlə və Qiymətləndir ({Object.keys(examAnswers).length} / 10)
                </button>
              )}
            </div>
          )}

          {/* TAB 7: OFFICIAL PRIORITY CLEARANCE PASS */}
          {activeTab === 'pass' && (
            <div className="space-y-6" data-testid="traffic-tab-pass-content">
              {(() => {
                const pass = currentIssuedPass || issuedPasses[0];
                if (!pass) return null;

                return (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          Rəsmi İTS-PRIORITY-AZ-2026 Elektron Yaşıl Dalğa Keçid Vəsiqəsi
                        </h3>
                        <p className="text-xs text-slate-400">
                          AYNA, RİNN və BDYP tərəfindən verilmiş rəsmi nömrəli, QR-kodlu və SİMA rəqəmsal imzalı keçid sənədi.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrint}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                        >
                          <Printer className="w-4 h-4" />
                          Çap Et
                        </button>
                        <button
                          onClick={() => handleCopy(pass.passId, 'pass-id')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-500/40"
                        >
                          {copiedCode === 'pass-id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          {copiedCode === 'pass-id' ? 'Kopyalandı' : 'Kodu Kopyala'}
                        </button>
                      </div>
                    </div>

                    {/* Certificate Voucher Layout */}
                    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-6">
                      {/* Watermark */}
                      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none p-4">
                        <Radio className="w-96 h-96 text-emerald-400" />
                      </div>

                      {/* Top Header of Voucher */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-emerald-500/30">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                              AZƏRBAYCAN RESPUBLİKASI
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              RİNN • AYNA • BDYP İTS
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                            AĞILLI NƏQLİYYAT SİSTEMİ YAŞIL DALĞA PRIORITET VƏSİQƏSİ
                          </h2>
                          <p className="text-xs text-emerald-400 font-mono">
                            Vəsiqə №: <span className="text-white font-bold">{pass.passId}</span>
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-center font-mono">
                          <span className="text-[10px] text-slate-400 block">Dövlət Qeydiyyatı:</span>
                          <span className="text-lg font-black text-white">{pass.vehiclePlate}</span>
                          <span className="text-[10px] text-emerald-400 block font-semibold">{pass.signalControlMode}</span>
                        </div>
                      </div>

                      {/* Certificate Body Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-slate-400 block">Nəqliyyat Vasitəsi:</span>
                          <span className="font-bold text-white block">{pass.vehicleModelAz}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-slate-400 block">İstismarçı Qurum / Sahib:</span>
                          <span className="font-bold text-white block">{pass.operatorOrganizationAz}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-slate-400 block">Prioritet Kateqoriyası:</span>
                          <span className="font-bold text-emerald-400 block">{pass.priorityTierAz}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-slate-400 block">Təsdiqlənmiş Strateji Dəhliz:</span>
                          <span className="font-bold text-teal-300 block">{pass.corridorNameAz}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-slate-400 block">V2I C-V2X RSU Tezliyi:</span>
                          <span className="font-mono font-bold text-white block">
                            {pass.preemptionChannelFrequencyMhz} MHz (Kanal 178)
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-slate-400 block">Ödənilmiş Dinamik Tarif:</span>
                          <span className="font-mono font-bold text-emerald-400 block">
                            {formatCurrency(pass.totalTariffAzn, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Security Footer of Voucher */}
                      <div className="pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                        <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                          <div>SİMA Rəqəmsal İmza UID: <span className="text-slate-200">{pass.simaDigitalUid}</span></div>
                          <div>SHA-256 Kriptoqrafik Çeksum: <span className="text-emerald-400">{pass.sha256SecurityChecksum}</span></div>
                          <div>RİNN Mühəndis Nişanı: <span className="text-slate-200">{pass.rinnRegistryBadge}</span></div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div className="text-[11px] text-slate-400">
                            <div>Verilmə: <span className="text-white font-bold">{pass.issueDate}</span></div>
                            <div>Bitmə: <span className="text-emerald-400 font-bold">{pass.validUntil}</span></div>
                          </div>
                          <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center shadow">
                            <Radio className="w-10 h-10 text-slate-950" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 8: UNIFIED PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="traffic-tab-registry-content">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    Vahid Dövlət Ağıllı Keçid və Prioritet Vəsiqələri Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    Qeydiyyat nişanı, vəsiqə kodu və ya təşkilat adına görə rəsmi qeydiyyat yoxlaması.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={registryQuery}
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    placeholder="Nömrə və ya vəsiqə axtar..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Table / List of Registered Passes */}
              <div className="space-y-3">
                {filteredRegistry.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Uyğun gələn prioritet vəsiqəsi tapılmadı.
                  </div>
                ) : (
                  filteredRegistry.map((p) => (
                    <div
                      key={p.passId}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                            {p.passId}
                          </span>
                          <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                            {p.vehiclePlate}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Qüvvədədir: {p.validUntil}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{p.vehicleModelAz}</h4>
                        <p className="text-[11px] text-slate-400">{p.operatorOrganizationAz} • {p.corridorNameAz}</p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setCurrentIssuedPass(p);
                            setActiveTab('pass');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer border border-slate-700"
                        >
                          Vəsiqəyə Bax
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
