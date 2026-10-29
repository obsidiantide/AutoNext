import React, { useState, useMemo } from 'react';
import {
  X,
  Cpu,
  Radio,
  Eye,
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
  CloudRain,
  Sun,
  CloudFog,
  Snowflake,
  Moon,
  Car,
  Wifi,
  Sparkles,
} from 'lucide-react';
import {
  Currency,
  formatCurrency,
  SaeAutomationLevel,
  SAE_LEVEL_DEFINITIONS,
  PilotCorridorId,
  WeatherCondition,
  V2xProtocol,
  evaluateSaeAutomationLevel,
  evaluateSensorFusion,
  evaluateV2xTelemetry,
  calculateAutonomousPilotFees,
  evaluateAutonomousSafetyChecklist,
  evaluateAutonomousExam,
  generateOfficialAutonomousPilotPermit,
  OfficialAutonomousPilotPermit,
} from '../utils/autonomousVehicleCompliance';
import {
  MOCK_AUTONOMOUS_CORRIDORS_LIST,
  MOCK_AUTONOMOUS_CORRIDORS_RECORD,
  MOCK_AUTONOMOUS_PRESETS,
  MOCK_AUTONOMOUS_CHECKLIST,
  MOCK_AUTONOMOUS_EXAM_QUESTIONS,
  MOCK_PUBLIC_AUTONOMOUS_PERMITS,
} from '../data/mockAutonomousVehicleData';
import { Vehicle } from '../types/vehicle';

export interface AutonomousVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type AutonomousTab =
  | 'corridors'
  | 'telemetry'
  | 'sensors'
  | 'v2x'
  | 'fees'
  | 'checklist'
  | 'exam'
  | 'permit'
  | 'registry';

export const AutonomousVehicleModal: React.FC<AutonomousVehicleModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<AutonomousTab>('corridors');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Corridors & Preset State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const activePreset = MOCK_AUTONOMOUS_PRESETS[selectedPresetIndex];

  const [corridorSearch, setCorridorSearch] = useState('');
  const [selectedCorridorId, setSelectedCorridorId] = useState<PilotCorridorId>(activePreset.corridorId);
  const activeCorridor = MOCK_AUTONOMOUS_CORRIDORS_RECORD[selectedCorridorId] || MOCK_AUTONOMOUS_CORRIDORS_LIST[0];

  // Vehicle Parameters
  const [vehiclePlate, setVehiclePlate] = useState<string>(
    targetCar ? targetCar.plateNumber || '99-AS-101' : activePreset.vehiclePlate
  );
  const [vin, setVin] = useState<string>(targetCar ? targetCar.vin || 'VF3EZ10AUT0260012' : activePreset.vin);
  const [vehicleModel, setVehicleModel] = useState<string>(
    targetCar ? `${targetCar.make} ${targetCar.model} Autonomous Testbed` : activePreset.vehicleModelAz
  );
  const [operatorCompany, setOperatorCompany] = useState<string>(activePreset.operatorCompanyAz);
  const [safetyDriverName, setSafetyDriverName] = useState<string>(activePreset.safetyDriverNameAz);
  const [safetyDriverLicense, setSafetyDriverLicense] = useState<string>(activePreset.safetyDriverLicense);

  // Telemetry Tab State
  const [saeLevel, setSaeLevel] = useState<SaeAutomationLevel>(activePreset.saeLevel);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(activePreset.operatingSpeedKmh);
  const [hasSafetyDriver, setHasSafetyDriver] = useState<boolean>(true);
  const [driverHandsOn, setDriverHandsOn] = useState<boolean>(true);
  const [manualMrmTriggered, setManualMrmTriggered] = useState<boolean>(false);

  // Sensors & Fusion Tab State
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('CLEAR_DAY');
  const [lidarRangeM, setLidarRangeM] = useState<number>(200);
  const [lidarPointsPerSec, setLidarPointsPerSec] = useState<number>(1500000);
  const [cameraOcclusionPercent, setCameraOcclusionPercent] = useState<number>(0);
  const [radarTrackingCount, setRadarTrackingCount] = useState<number>(24);
  const [isRadarActive, setIsRadarActive] = useState<boolean>(true);

  // V2X Tab State
  const [v2xProtocol, setV2xProtocol] = useState<V2xProtocol>(activePreset.v2xProtocol);
  const [v2xLatencyMs, setV2xLatencyMs] = useState<number>(14);
  const [packetDeliveryRatio, setPacketDeliveryRatio] = useState<number>(99.2);
  const [spatSyncActive, setSpatSyncActive] = useState<boolean>(true);
  const [v2pAlertActive, setV2pAlertActive] = useState<boolean>(false);

  // Fees Tab State
  const [testDurationDays, setTestDurationDays] = useState<number>(30);
  const [requiresPoliceEscort, setRequiresPoliceEscort] = useState<boolean>(true);
  const [escortDaysCount, setEscortDaysCount] = useState<number>(10);
  const [v2xSpectrumClearance, setV2xSpectrumClearance] = useState<boolean>(true);
  const [fhnSafetyStand, setFhnSafetyStand] = useState<boolean>(true);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    chk_steer_brake_redundancy: true,
    chk_dssad_edr_blackbox: true,
    chk_safety_driver_certification: true,
    chk_mrm_fail_safe_maneuver: true,
    chk_emergency_stop_button: true,
    chk_sensor_cleaning_defrost: true,
    chk_v2x_rsu_telemetry: true,
    chk_cyber_security_firewall: true,
    chk_geofencing_odd_lock: true,
    chk_external_status_beacon: true,
  });

  // Exam Simulator State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificate / Registry State
  const [customPermit, setCustomPermit] = useState<OfficialAutonomousPilotPermit | null>(null);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Apply preset handler
  const handleApplyPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const p = MOCK_AUTONOMOUS_PRESETS[index];
    setSelectedCorridorId(p.corridorId);
    setVehiclePlate(p.vehiclePlate);
    setVin(p.vin);
    setVehicleModel(p.vehicleModelAz);
    setOperatorCompany(p.operatorCompanyAz);
    setSafetyDriverName(p.safetyDriverNameAz);
    setSafetyDriverLicense(p.safetyDriverLicense);
    setSaeLevel(p.saeLevel);
    setCurrentSpeedKmh(p.operatingSpeedKmh);
    setV2xProtocol(p.v2xProtocol);
    setManualMrmTriggered(false);
  };

  // Evaluations
  const saeCompliance = useMemo(() => {
    return evaluateSaeAutomationLevel(
      saeLevel,
      hasSafetyDriver,
      currentSpeedKmh,
      activeCorridor.maxSpeedKmh
    );
  }, [saeLevel, hasSafetyDriver, currentSpeedKmh, activeCorridor.maxSpeedKmh]);

  const sensorFusionResult = useMemo(() => {
    return evaluateSensorFusion(
      lidarRangeM,
      lidarPointsPerSec,
      cameraOcclusionPercent,
      radarTrackingCount,
      weatherCondition,
      isRadarActive
    );
  }, [
    lidarRangeM,
    lidarPointsPerSec,
    cameraOcclusionPercent,
    radarTrackingCount,
    weatherCondition,
    isRadarActive,
  ]);

  const v2xResult = useMemo(() => {
    return evaluateV2xTelemetry(
      v2xProtocol,
      v2xLatencyMs,
      packetDeliveryRatio,
      spatSyncActive,
      v2pAlertActive
    );
  }, [v2xProtocol, v2xLatencyMs, packetDeliveryRatio, spatSyncActive, v2pAlertActive]);

  const feeResult = useMemo(() => {
    return calculateAutonomousPilotFees(
      saeLevel,
      testDurationDays,
      requiresPoliceEscort,
      escortDaysCount,
      v2xSpectrumClearance,
      fhnSafetyStand,
      currency
    );
  }, [
    saeLevel,
    testDurationDays,
    requiresPoliceEscort,
    escortDaysCount,
    v2xSpectrumClearance,
    fhnSafetyStand,
    currency,
  ]);

  const checklistResult = useMemo(() => {
    return evaluateAutonomousSafetyChecklist(checkedItems, MOCK_AUTONOMOUS_CHECKLIST);
  }, [checkedItems]);

  const examResult = useMemo(() => {
    return evaluateAutonomousExam(examAnswers, MOCK_AUTONOMOUS_EXAM_QUESTIONS);
  }, [examAnswers]);

  // Active permit for display
  const activePermit = useMemo<OfficialAutonomousPilotPermit>(() => {
    if (customPermit) return customPermit;
    return (
      MOCK_PUBLIC_AUTONOMOUS_PERMITS[0] ||
      generateOfficialAutonomousPilotPermit(
        vehiclePlate,
        vin,
        saeLevel,
        activeCorridor,
        operatorCompany,
        safetyDriverName,
        safetyDriverLicense,
        vehicleModel,
        currentSpeedKmh,
        v2xProtocol,
        feeResult.totalPayableAzn
      )
    );
  }, [
    customPermit,
    vehiclePlate,
    vin,
    saeLevel,
    activeCorridor,
    operatorCompany,
    safetyDriverName,
    safetyDriverLicense,
    vehicleModel,
    currentSpeedKmh,
    v2xProtocol,
    feeResult.totalPayableAzn,
  ]);

  const handleGeneratePermit = () => {
    const generated = generateOfficialAutonomousPilotPermit(
      vehiclePlate,
      vin,
      saeLevel,
      activeCorridor,
      operatorCompany,
      safetyDriverName,
      safetyDriverLicense,
      vehicleModel,
      currentSpeedKmh,
      v2xProtocol,
      feeResult.totalPayableAzn
    );
    setCustomPermit(generated);
    setActiveTab('permit');
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredCorridors = useMemo(() => {
    if (!corridorSearch.trim()) return MOCK_AUTONOMOUS_CORRIDORS_LIST;
    const q = corridorSearch.toLowerCase();
    return MOCK_AUTONOMOUS_CORRIDORS_LIST.filter(
      (c) =>
        c.nameAz.toLowerCase().includes(q) ||
        c.locationAz.toLowerCase().includes(q) ||
        c.descriptionAz.toLowerCase().includes(q)
    );
  }, [corridorSearch]);

  const filteredRegistry = useMemo(() => {
    const all = customPermit
      ? [customPermit, ...MOCK_PUBLIC_AUTONOMOUS_PERMITS]
      : MOCK_PUBLIC_AUTONOMOUS_PERMITS;
    if (!registrySearch.trim()) return all;
    const q = registrySearch.toLowerCase();
    return all.filter(
      (p) =>
        p.permitId.toLowerCase().includes(q) ||
        p.vehiclePlate.toLowerCase().includes(q) ||
        p.corridorNameAz.toLowerCase().includes(q) ||
        p.operatorCompanyAz.toLowerCase().includes(q) ||
        p.safetyDriverNameAz.toLowerCase().includes(q)
    );
  }, [customPermit, registrySearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      data-testid="autonomous-vehicle-modal"
    >
      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 text-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-900/90 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Cpu className="w-5 h-5 text-cyan-100 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AYNA • BDYP • FHN
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SAE LEVEL 3 / 4 / 5
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  UN R157 • ISO 26262 ASIL-D
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Avtonom Nəqliyyat Vasitələri, V2X Telemetriya & Sınaq İcazəsi Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Switcher */}
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    currency === curr
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="modal-close-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto scrollbar-none text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('corridors')}
            data-testid="tab-corridors"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'corridors'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Sınaq Koridorları ({MOCK_AUTONOMOUS_CORRIDORS_LIST.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            data-testid="tab-telemetry"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-400" />
            <span>SAE Telemetriya & Sürət</span>
          </button>

          <button
            onClick={() => setActiveTab('sensors')}
            data-testid="tab-sensors"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'sensors'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>LiDAR & Sensor Füzyon</span>
          </button>

          <button
            onClick={() => setActiveTab('v2x')}
            data-testid="tab-v2x"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'v2x'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wifi className="w-4 h-4 text-indigo-400" />
            <span>C-V2X 5.9 GHz & SPaT</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            data-testid="tab-fees"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'fees'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Rüsum & Müşayiət</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCheck className="w-4 h-4 text-teal-400" />
            <span>10 Bəndlik Təhlükəsizlik</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'exam'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>Nəzəri İmtahan</span>
          </button>

          <button
            onClick={() => setActiveTab('permit')}
            data-testid="tab-permit"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'permit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Rəsmi İcazə</span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4 text-rose-400" />
            <span>Vahid Reyestr</span>
          </button>
        </div>

        {/* Body Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick AV Preset Bar */}
          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                Avtonom Sınaq Preseti Seçimi:
              </span>
              <span className="text-xs text-cyan-400 font-medium">
                {activePreset.nameAz} ({activePreset.vehiclePlate})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {MOCK_AUTONOMOUS_PRESETS.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(idx)}
                  className={`p-2 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                    selectedPresetIndex === idx
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-semibold truncate">{p.nameAz.split('-')[0]}</div>
                  <div className="text-[10px] text-slate-400 truncate">{p.vehiclePlate} • {p.categoryAz}</div>
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: SINAQ KORİDORLARI RADARI */}
          {activeTab === 'corridors' && (
            <div className="space-y-6" data-testid="corridors-tab-content">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-cyan-400" />
                    Azərbaycanın 6 Strateji Avtonom Sınaq Koridoru Radarı
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    AYNA və BDYP tərəfindən təsdiqlənmiş, C-V2X RSU baza stansiyaları və 3D HD xəritələrlə təchiz edilmiş sahələr.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={corridorSearch}
                    onChange={(e) => setCorridorSearch(e.target.value)}
                    placeholder="Koridor axtarışı..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Corridors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCorridors.map((corridor) => {
                  const isSelected = selectedCorridorId === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => setSelectedCorridorId(corridor.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-bl-lg text-[10px] font-bold">
                          SEÇİLDİ
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-cyan-300 border border-cyan-500/30">
                            {corridor.corridorTypeAz}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300">
                            Maks. {corridor.maxSpeedKmh} km/s
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 mb-1">{corridor.nameAz}</h4>
                        <p className="text-xs text-slate-400 mb-3">{corridor.locationAz}</p>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">{corridor.descriptionAz}</p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Marşrut Uzunluğu:</span>
                          <span className="font-semibold text-slate-200">{corridor.routeLengthKm} km</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>C-V2X RSU Sayı:</span>
                          <span className="font-semibold text-cyan-300">{corridor.rsuCount} ədəd</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>HD Xəritə Dəqiqliyi:</span>
                          <span className="font-semibold text-emerald-400">±{corridor.hdMapPrecisionCm} sm</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Təsdiqlənmiş SAE:</span>
                          <span className="font-semibold text-purple-300">{corridor.maxSaeLevelApproved}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Corridor Overview Card */}
              <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Aktiv Koridor Xüsusiyyətləri: {activeCorridor.nameAz}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {activeCorridor.featuresAz.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg border border-slate-700/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAE TELEMETRİYA & SÜRƏT STANDI */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6" data-testid="telemetry-tab-content">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  SAE J3016 Avtomatlaşdırma Səviyyəsi & Telemetriya İdarəetməsi
                </h3>

                {/* SAE Level Selectors */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {(Object.keys(SAE_LEVEL_DEFINITIONS) as SaeAutomationLevel[]).map((lvl) => {
                    const def = SAE_LEVEL_DEFINITIONS[lvl];
                    const isSelected = saeLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => setSaeLevel(lvl)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-md shadow-blue-950/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold text-blue-400 mb-0.5">{def.code}</div>
                        <div className="text-xs font-semibold text-slate-200 line-clamp-1">{def.nameEn}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Təhvil: {def.handoverTimeMaxSec}s</div>
                      </button>
                    );
                  })}
                </div>

                {/* Level Detail Box */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm">{SAE_LEVEL_DEFINITIONS[saeLevel].titleAz}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                      {SAE_LEVEL_DEFINITIONS[saeLevel].code}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{SAE_LEVEL_DEFINITIONS[saeLevel].descriptionAz}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block">Sükan/Sürət:</span>
                      <span className="font-semibold text-slate-300">{SAE_LEVEL_DEFINITIONS[saeLevel].steeringAndSpeedControl}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block">Ətraf Müşahidəsi:</span>
                      <span className="font-semibold text-slate-300">{SAE_LEVEL_DEFINITIONS[saeLevel].environmentMonitoring}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block">Qəza Məsuliyyəti:</span>
                      <span className="font-semibold text-cyan-300">{SAE_LEVEL_DEFINITIONS[saeLevel].fallbackResponsibility}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block">Maks. Təhvil Vaxtı:</span>
                      <span className="font-semibold text-purple-300">{SAE_LEVEL_DEFINITIONS[saeLevel].handoverTimeMaxSec} saniyə</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sliders & Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Speed Slider */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Sınaq Sürəti:</span>
                    <span className="font-bold text-cyan-400 text-sm">{currentSpeedKmh} km/s</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={1}
                    value={currentSpeedKmh}
                    onChange={(e) => setCurrentSpeedKmh(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10 km/s (Zonaya giriş)</span>
                    <span>Koridor Limiti: {activeCorridor.maxSpeedKmh} km/s</span>
                    <span>120 km/s</span>
                  </div>
                </div>

                {/* Safety Driver Switches */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-300 block">Təhlükəsizlik Sürücüsü (Safety Driver) Kabinədədir:</span>
                      <span className="text-[10px] text-slate-500">Maddə 14 və 27 tələbləri</span>
                    </div>
                    <button
                      onClick={() => setHasSafetyDriver(!hasSafetyDriver)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        hasSafetyDriver ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {hasSafetyDriver ? 'BƏLİ (Hazırdır)' : 'XEYR (Qanunsuz)'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-300 block">Sürücü Əlləri Sükandadır (Hands-On):</span>
                      <span className="text-[10px] text-slate-500">Kapasitiv sükan sensoru</span>
                    </div>
                    <button
                      onClick={() => setDriverHandsOn(!driverHandsOn)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        driverHandsOn ? 'bg-blue-500 text-white' : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {driverHandsOn ? 'Aktiv (Hands-On)' : 'Buraxılıb (Hands-Off)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Compliance & MRM Trigger Stand */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {saeCompliance.isCompliant && !manualMrmTriggered ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-100">
                        {manualMrmTriggered
                          ? 'MANUAL MRM FƏALLAŞDIRILIB (Təcili Dayanma)'
                          : saeCompliance.verdictAz}
                      </div>
                      <div className="text-xs text-slate-400">{saeCompliance.statutoryArticleAz}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setManualMrmTriggered(!manualMrmTriggered)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                      manualMrmTriggered
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-950/50'
                    }`}
                  >
                    {manualMrmTriggered ? 'MRM Rejimini Sıfırla' : 'QƏZA DAYANDIRMA (E-STOP MRM)'}
                  </button>
                </div>

                {saeCompliance.penaltyAzn > 0 && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center justify-between">
                    <span>Qanunvericilik Cərimə Məbləği:</span>
                    <span className="font-bold text-rose-200">{saeCompliance.penaltyAzn} AZN</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LİDAR & SENSOR FÜZYON STANDI */}
          {activeTab === 'sensors' && (
            <div className="space-y-6" data-testid="sensors-tab-content">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  LiDAR 3D Nöqtə Buludu & Stereoskopik Kamera Sensor Füzyonu
                </h3>

                {/* Weather Simulation Switcher */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    Ətraf Mühit & İqlim Şəraiti Simulyatoru:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(
                      [
                        { id: 'CLEAR_DAY', name: 'Açıq Günəşli', icon: Sun },
                        { id: 'OVERCAST_RAIN', name: 'Yağışlı', icon: CloudRain },
                        { id: 'HEAVY_FOG', name: 'Kəskin Duman', icon: CloudFog },
                        { id: 'NIGHT_LOW_LIGHT', name: 'Qaranlıq Gecə', icon: Moon },
                        { id: 'SNOW_ICY_TRACK', name: 'Qarlı / Şaxtalı', icon: Snowflake },
                      ] as const
                    ).map((w) => {
                      const Icon = w.icon;
                      const isSelected = weatherCondition === w.id;
                      return (
                        <button
                          key={w.id}
                          onClick={() => setWeatherCondition(w.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-emerald-400" />
                          <span>{w.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sensor Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">LiDAR Məsafəsi:</span>
                      <span className="font-bold text-cyan-300">{lidarRangeM} metr</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={300}
                      step={5}
                      value={lidarRangeM}
                      onChange={(e) => setLidarRangeM(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>40m (Kritik)</span>
                      <span>200m (Standart)</span>
                      <span>300m (Luminar 1550nm)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kamera Linzası Örtülməsi (Palçıq/Yağış):</span>
                      <span className="font-bold text-amber-300">{cameraOcclusionPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={cameraOcclusionPercent}
                      onChange={(e) => setCameraOcclusionPercent(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0% (Təmiz)</span>
                      <span>50% (Qismən örtülü)</span>
                      <span>90% (Sensor korluğu)</span>
                    </div>
                  </div>
                </div>

                {/* Radar and Points Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-300 block">4D mmWave FMCW Radar (77 GHz):</span>
                      <span className="text-[10px] text-slate-500">{radarTrackingCount} hədəf izlənir</span>
                    </div>
                    <button
                      onClick={() => setIsRadarActive(!isRadarActive)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        isRadarActive ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {isRadarActive ? 'FƏAL' : 'SÖNÜLÜ'}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-300 block">Nöqtə Buludu Sıxlığı:</span>
                      <span className="text-[10px] text-cyan-400">{(lidarPointsPerSec / 1000000).toFixed(2)} Mln nöqtə/saniyə</span>
                    </div>
                    <button
                      onClick={() =>
                        setLidarPointsPerSec(lidarPointsPerSec > 1000000 ? 600000 : 1500000)
                      }
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all cursor-pointer border border-slate-700"
                    >
                      {lidarPointsPerSec > 1000000 ? 'Yüksək Sıxlıq' : 'Standart Sıxlıq'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Perception Confidence Gauge Card */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Süni İntellekt Qavrama Güvən Göstəricisi:
                  </span>
                  <span
                    className={`text-lg font-black font-mono ${
                      sensorFusionResult.overallPerceptionConfidencePercent >= 75
                        ? 'text-emerald-400'
                        : sensorFusionResult.overallPerceptionConfidencePercent >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {sensorFusionResult.overallPerceptionConfidencePercent}%
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      sensorFusionResult.overallPerceptionConfidencePercent >= 75
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                        : sensorFusionResult.overallPerceptionConfidencePercent >= 60
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                        : 'bg-gradient-to-r from-rose-600 to-red-500'
                    }`}
                    style={{ width: `${sensorFusionResult.overallPerceptionConfidencePercent}%` }}
                  />
                </div>

                <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
                  {sensorFusionResult.isSafeForAutonomousMode ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>{sensorFusionResult.fusionVerdictAz}</span>
                </div>

                {sensorFusionResult.activeFaultsAz.length > 0 && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg space-y-1 text-xs">
                    <span className="text-rose-400 font-semibold block">Aktiv Sensor Xətaları:</span>
                    {sensorFusionResult.activeFaultsAz.map((err, i) => (
                      <div key={i} className="text-rose-300 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: C-V2X 5.9 GHZ & SPAT SVETOFOR STANDI */}
          {activeTab === 'v2x' && (
            <div className="space-y-6" data-testid="v2x-tab-content">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-indigo-400" />
                  C-V2X / DSRC 5.9 GHz Şəbəkə Gecikməsi & SPaT İnterfeysi
                </h3>

                {/* Protocol Switcher */}
                <div className="flex gap-2">
                  {(
                    [
                      { id: 'C_V2X_PC5_5_9GHZ', label: 'Cellular V2X (3GPP Rel-16 PC5 5.9 GHz)' },
                      { id: 'DSRC_IEEE_802_11P', label: 'DSRC (IEEE 802.11p Dedicated Short Range)' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setV2xProtocol(p.id)}
                      className={`flex-1 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        v2xProtocol === p.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Latency & Packet Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rabitə Gecikməsi (Round Trip Time - RTT):</span>
                      <span className="font-bold font-mono text-cyan-300">{v2xLatencyMs} ms</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={120}
                      step={1}
                      value={v2xLatencyMs}
                      onChange={(e) => setV2xLatencyMs(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>5 ms (Ultra-Low URLLC)</span>
                      <span>35 ms (Standart Limit)</span>
                      <span>120 ms (Kritik İtki)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paket Çatdırılma Əmsalı (PDR %):</span>
                      <span className="font-bold font-mono text-emerald-300">{packetDeliveryRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={100}
                      step={0.5}
                      value={packetDeliveryRatio}
                      onChange={(e) => setPacketDeliveryRatio(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>80% (Zəif kanal)</span>
                      <span>95% (Minimum Tələb)</span>
                      <span>100% (Mükəmməl)</span>
                    </div>
                  </div>
                </div>

                {/* SPaT & V2P Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-300 block">SPaT Svetofor Fazaları İnterfeysi:</span>
                      <span className="text-[10px] text-slate-500">Svetofor qırmızı/yaşıl saniyəölçəni</span>
                    </div>
                    <button
                      onClick={() => setSpatSyncActive(!spatSyncActive)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        spatSyncActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {spatSyncActive ? 'SİNXRON' : 'ƏLAQƏSİZ'}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-300 block">V2P Piyada Toqquşma Xəbərdarlığı:</span>
                      <span className="text-[10px] text-slate-500">Vulnerable Road User (VRU)</span>
                    </div>
                    <button
                      onClick={() => setV2pAlertActive(!v2pAlertActive)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        v2pAlertActive ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {v2pAlertActive ? 'TƏHLÜKƏ XƏBƏRDARLIĞI' : 'Sakit Rejim'}
                    </button>
                  </div>
                </div>
              </div>

              {/* V2X Verdict Card */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{v2xResult.statusLabelAz}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                    {v2xResult.latencyCategoryAz}
                  </span>
                </div>
                <p className="text-slate-400">{v2xResult.actionRequiredAz}</p>
              </div>
            </div>
          )}

          {/* TAB 5: RÜSUM & MÜŞAYİƏT KALKULYATORU */}
          {activeTab === 'fees' && (
            <div className="space-y-6" data-testid="fees-tab-content">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  Statutar Sınaq Rüsumu & BDYP / FHN Müşayiət Xərcləri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Test Duration */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sınaq Kampaniyasının Müddəti:</span>
                      <span className="font-bold text-amber-300">{testDurationDays} gün</span>
                    </div>
                    <input
                      type="range"
                      min={7}
                      max={90}
                      step={1}
                      value={testDurationDays}
                      onChange={(e) => setTestDurationDays(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>7 gün</span>
                      <span>30 gün (Standart)</span>
                      <span>90 gün</span>
                    </div>
                  </div>

                  {/* Escort Days */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">BDYP Patrul Müşayiəti Günləri:</span>
                      <span className="font-bold text-blue-300">{escortDaysCount} gün</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={testDurationDays}
                      step={1}
                      value={escortDaysCount}
                      onChange={(e) => setEscortDaysCount(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0 gün</span>
                      <span>Seçilən: {escortDaysCount} gün</span>
                      <span>Maks: {testDurationDays} gün</span>
                    </div>
                  </div>
                </div>

                {/* Additional Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-300 block">V2X 5.9 GHz Tezlik Təsdiqi:</span>
                      <span className="text-[10px] text-slate-500">90 AZN sabit rüsum</span>
                    </div>
                    <button
                      onClick={() => setV2xSpectrumClearance(!v2xSpectrumClearance)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        v2xSpectrumClearance ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {v2xSpectrumClearance ? 'DAXİLDİR' : 'XARİC'}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-300 block">FHN Yanğın Nəzarət Postu:</span>
                      <span className="text-[10px] text-slate-500">80 AZN sabit rüsum</span>
                    </div>
                    <button
                      onClick={() => setFhnSafetyStand(!fhnSafetyStand)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        fhnSafetyStand ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {fhnSafetyStand ? 'DAXİLDİR' : 'XARİC'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown Card */}
              <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                  Rüsum Hesablaması Detalları:
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>AYNA Avtonom Sınaq Baza Rüsumu ({testDurationDays} gün):</span>
                    <span className="font-semibold">{formatCurrency(feeResult.baseTestingFeeAzn, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>BDYP Patrul Müşayiət Haqqı ({escortDaysCount} gün x 120 ₼):</span>
                    <span className="font-semibold">{formatCurrency(feeResult.corridorEscortFeeAzn, currency)}</span>
                  </div>
                  {feeResult.v2xSpectrumClearanceFeeAzn > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>V2X RSU Tezlik Zolağı Klirensi:</span>
                      <span className="font-semibold">{formatCurrency(feeResult.v2xSpectrumClearanceFeeAzn, currency)}</span>
                    </div>
                  )}
                  {feeResult.fhnSafetyStandFeeAzn > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>FHN Yanğın Təhlükəsizliyi Postu:</span>
                      <span className="font-semibold">{formatCurrency(feeResult.fhnSafetyStandFeeAzn, currency)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-slate-100">
                    <span>Yekun Ödəniləcək Məbləğ:</span>
                    <span className="text-amber-400 font-mono text-base">
                      {formatCurrency(feeResult.totalPayableCurrency, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 10 BƏNDLİK TƏHLÜKƏSİZLİK AUDİTİ */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="checklist-tab-content">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-teal-400" />
                    10 Bəndlik Avtonom Nəqliyyat Təhlükəsizlik & Ehtiyat Sistemi Auditi
                  </h3>
                  <p className="text-xs text-slate-400">
                    ISO 26262 ASIL-D, ISO 21448 SOTIF və UN R157 üzrə zəruri texniki tələblər.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const allChecked: Record<string, boolean> = {};
                    MOCK_AUTONOMOUS_CHECKLIST.forEach((item) => {
                      allChecked[item.id] = true;
                    });
                    setCheckedItems(allChecked);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  Bütün Bəndləri Təsdiqlə
                </button>
              </div>

              {/* Progress Bar */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Uyğunluq Səviyyəsi:</span>
                  <span className="font-bold text-teal-300">
                    {checklistResult.completedItems} / {checklistResult.totalItems} ({checklistResult.compliancePercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
                    style={{ width: `${checklistResult.compliancePercent}%` }}
                  />
                </div>
                <div className="text-xs font-medium text-slate-300 pt-1">
                  {checklistResult.isEligibleForPermit ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Avtonom Sınaq İcazəsi (AUTONOM-AZ-2026) verilməsi üçün tam uyğundur.
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Mütləq bəndlər tamamlanmalıdır. Çatışmayan: {checklistResult.missingMandatoryAz.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {MOCK_AUTONOMOUS_CHECKLIST.map((item) => {
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
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-teal-950/20 border-teal-500/40 text-slate-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? 'bg-teal-500 text-slate-950' : 'border border-slate-700 bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{item.titleAz}</span>
                          {item.isMandatory && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-semibold">
                              Mütləq
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 leading-relaxed">{item.descriptionAz}</p>
                        <div className="text-[10px] text-teal-400/80 font-mono pt-0.5">
                          Standart: {item.statutoryStandard}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: NƏZƏRİ İMTAHAN SİMULYATORU */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="exam-tab-content">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  AYNA & BDYP 10 Suallıq Avtonom Sürücülük Qanunvericiliyi İmtahanı
                </h3>
                <p className="text-xs text-slate-400">
                  Sertifikatlaşdırılmış Təhlükəsizlik Sürücüləri (Safety Drivers) üçün rəsmi suallar toplusu (Keçid balı: 80%).
                </p>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {MOCK_AUTONOMOUS_EXAM_QUESTIONS.map((q, idx) => {
                  const userAnswer = examAnswers[q.id];
                  const showResult = isExamSubmitted;
                  const isCorrect = userAnswer === q.correctOptionIndex;

                  return (
                    <div key={q.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                      <div className="text-xs font-bold text-slate-200 flex items-start gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] shrink-0">
                          Sual {idx + 1}
                        </span>
                        <span>{q.questionAz}</span>
                      </div>

                      <div className="space-y-2 pt-1">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (showResult) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-purple-600/20 border-purple-500 text-purple-200';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={showResult}
                              onClick={() =>
                                setExamAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx,
                                }))
                              }
                              className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {showResult && optIdx === q.correctOptionIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showResult && (
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                          <span className="font-semibold text-purple-300 block">Hüquqi Əsas:</span>
                          <span>{q.legalBasisAz}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Exam Actions & Results */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                {isExamSubmitted ? (
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-2xl font-black font-mono ${
                        examResult.isPassed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {examResult.scorePercent}%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100">
                        {examResult.isPassed ? 'İMTAHAN UĞURLA BAŞA ÇATDI' : 'KƏSİLDİNİZ (Minimum 80%)'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Düzgün cavablar: {examResult.correctAnswersCount} / {examResult.totalQuestions}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    Cavablandırılıb: {Object.keys(examAnswers).length} / {MOCK_AUTONOMOUS_EXAM_QUESTIONS.length}
                  </div>
                )}

                <div className="flex gap-2">
                  {isExamSubmitted ? (
                    <button
                      onClick={() => {
                        setExamAnswers({});
                        setIsExamSubmitted(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Yenidən Başla
                    </button>
                  ) : (
                    <button
                      disabled={Object.keys(examAnswers).length < MOCK_AUTONOMOUS_EXAM_QUESTIONS.length}
                      onClick={() => setIsExamSubmitted(true)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        Object.keys(examAnswers).length >= MOCK_AUTONOMOUS_EXAM_QUESTIONS.length
                          ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-950/50'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      İmtahanı Təsdiqlə
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: RƏSMİ İCAZƏ GENERATORU (AUTONOM-AZ-2026) */}
          {activeTab === 'permit' && (
            <div className="space-y-6" data-testid="permit-tab-content">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    AYNA & BDYP Rəsmi Elektron Avtonom Sınaq İcazəsi (AUTONOM-AZ-2026)
                  </h3>
                  <p className="text-xs text-slate-400">
                    SİMA rəqəmsal imzası və SHA-256 kriptoqrafik möhürü ilə təsdiqlənmiş sənəd.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGeneratePermit}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Yenisini Yarat</span>
                  </button>

                  <button
                    onClick={() => handleCopy(activePermit.permitId, 'permitId')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedCode === 'permitId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Kopyala</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Certificate Printable Layout */}
              <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-2xl shadow-xl shadow-cyan-950/30 space-y-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                  <Cpu className="w-96 h-96 text-cyan-400" />
                </div>

                {/* Header of Certificate */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-cyan-500/20 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block">
                      AZƏRBAYCAN RESPUBLİKASI YERÜSTÜ NƏQLİYYAT AGENTLİYİ (AYNA)
                    </span>
                    <h4 className="text-lg font-black text-slate-100 tracking-tight">
                      AVTONOM NƏQLİYYAT VASİTƏSİNİN YOL SINAĞI İCAZƏ ŞƏHADƏTNAMƏSİ
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-cyan-300 block">{activePermit.permitId}</span>
                    <span className="text-[10px] text-slate-400">Verilmə tarixi: {activePermit.issueDate}</span>
                  </div>
                </div>

                {/* Main Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Dövlət Qeydiyyat Nişanı:</span>
                    <span className="font-bold font-mono text-cyan-300 text-sm">{activePermit.vehiclePlate}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">VIN Kod:</span>
                    <span className="font-mono text-slate-200 text-xs truncate block">{activePermit.vin}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">SAE Avtomatlaşdırma:</span>
                    <span className="font-bold text-purple-300 text-xs">{activePermit.saeLevelCode}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Maks. İcazəli Sürət:</span>
                    <span className="font-bold text-emerald-400 text-sm">{activePermit.maxApprovedSpeedKmh} km/s</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px]">Təsdiqlənmiş Sınaq Koridoru (ODD):</span>
                    <span className="font-bold text-slate-200">{activePermit.corridorNameAz}</span>
                    <span className="text-[10px] text-slate-400 block">Operator: {activePermit.operatorCompanyAz}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px]">Təhlükəsizlik Sürücüsü (Safety Driver):</span>
                    <span className="font-bold text-slate-200">{activePermit.safetyDriverNameAz}</span>
                    <span className="text-[10px] text-slate-400 block">Sertifikat: {activePermit.safetyDriverLicense}</span>
                  </div>
                </div>

                {/* Footer and Security Seal */}
                <div className="pt-4 border-t border-cyan-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-mono text-[10px] text-slate-400">
                      SHA-256 Checksum: <span className="text-cyan-400">{activePermit.sha256SecurityChecksum}</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      SİMA UID: <span className="text-purple-400">{activePermit.simaDigitalUid}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>AYNA & BDYP TƏSDİQLİ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: VAHİD DÖVLƏT REYESTRİ */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="registry-tab-content">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Database className="w-5 h-5 text-rose-400" />
                    Avtonom Nəqliyyat Vasitələrinin Vahid Dövlət Sınaq Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    Azərbaycan ərazisində qeydiyyatdan keçmiş bütün aktiv və arxiv sınaq icazələri.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Qeydiyyat nişanı və ya icazə nömrəsi..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">İcazə No</th>
                        <th className="p-3">Qeydiyyat Nişanı</th>
                        <th className="p-3">SAE Səviyyəsi</th>
                        <th className="p-3">Sınaq Koridoru</th>
                        <th className="p-3">Operator Şirkət</th>
                        <th className="p-3">Təhlükəsizlik Sürücüsü</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                      {filteredRegistry.map((item) => (
                        <tr key={item.permitId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-mono font-bold text-cyan-300">{item.permitId}</td>
                          <td className="p-3 font-mono text-slate-200">{item.vehiclePlate}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold text-[10px]">
                              {item.saeLevelCode}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">{item.corridorNameAz}</td>
                          <td className="p-3 text-slate-400">{item.operatorCompanyAz}</td>
                          <td className="p-3 text-slate-300">{item.safetyDriverNameAz}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              QÜVVƏDƏDİR
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

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/90 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              RİNN, AYNA, BDYP & FHN Birgə Dövlət Sınaq Portal Sistemi • 2026
            </span>
            <span className="sm:hidden">AYNA & BDYP 2026</span>
          </div>

          <button
            onClick={onClose}
            data-testid="modal-bottom-close-btn"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all cursor-pointer"
          >
            Pəncərəni Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
