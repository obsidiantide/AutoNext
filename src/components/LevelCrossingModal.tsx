import React, { useState, useMemo } from 'react';
import {
  Train,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Search,
  ExternalLink,
  Layers,
  Activity,
  Calculator,
  Sliders,
  Radio,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  Info,
  Maximize2,
  Eye,
  AlertOctagon,
  Zap,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  CrossingId,
  BarrierState,
  LEVEL_CROSSINGS_REGISTRY,
  VEHICLE_CLASSES_INFO,
  VehicleClass,
  formatCurrency,
  calculateTransitTariff,
  evaluateCollisionRisk,
  LEVEL_CROSSING_CHECKLIST,
  LEVEL_CROSSING_EXAM_QUESTIONS,
  generateLevelCrossingCertificate,
  LevelCrossingCertificate,
} from '../utils/levelCrossingCompliance';
import {
  MOCK_CROSSING_TELEMETRIES,
  MOCK_VEHICLE_PRESETS,
  MOCK_CERTIFICATES_REGISTRY,
} from '../data/mockLevelCrossingData';

interface LevelCrossingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

type TabType = 'radar' | 'calculator' | 'simulator' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const LevelCrossingModal: React.FC<LevelCrossingModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedCrossingId, setSelectedCrossingId] = useState<CrossingId>('sabunchu_zabrat');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Calculator State
  const [vehicleType, setVehicleType] = useState<VehicleClass>('truck');
  const [vehiclePlate, setVehiclePlate] = useState<string>(targetCar ? targetCar.plateNumber || '10-TR-800' : '77-ZX-908');
  const [vehicleLength, setVehicleLength] = useState<number>(16.5);
  const [vehicleHeight, setVehicleHeight] = useState<number>(3.95);
  const [vehicleWidth, setVehicleWidth] = useState<number>(2.55);
  const [vehicleWeight, setVehicleWeight] = useState<number>(38.0);
  const [vehicleSpeed, setVehicleSpeed] = useState<number>(35);
  const [requiresPoliceConvoy, setRequiresPoliceConvoy] = useState<boolean>(false);

  // Simulator Telemetry State
  const [simTrainSpeed, setSimTrainSpeed] = useState<number>(110);
  const [simTrainDistance, setSimTrainDistance] = useState<number>(1200);
  const [simTrainType, setSimTrainType] = useState<'passenger_emu' | 'heavy_freight' | 'diesel_locomotive'>('passenger_emu');
  const [simObstacleDetected, setSimObstacleDetected] = useState<boolean>(false);
  const [simBarrierState, setSimBarrierState] = useState<BarrierState>('closed');
  const [simEmergencyTripTriggered, setSimEmergencyTripTriggered] = useState<boolean>(false);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate Generator State
  const [applicantName, setApplicantName] = useState<string>('Əliyev Rəşad Elxan oğlu');
  const [companyName, setCompanyName] = useState<string>('Azərbaycan Tranzit Ekspedisiya MMC');
  const [transitSlot, setTransitSlot] = useState<string>('02:00 - 04:30 (Gecə Texniki Pəncərə)');
  const [generatedCertificate, setGeneratedCertificate] = useState<LevelCrossingCertificate | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Registry Search State
  const [registryQuery, setRegistryQuery] = useState<string>('');
  const [registryList, setRegistryList] = useState<LevelCrossingCertificate[]>(MOCK_CERTIFICATES_REGISTRY);

  const activeCrossing = LEVEL_CROSSINGS_REGISTRY[selectedCrossingId];
  const activeTelemetry = MOCK_CROSSING_TELEMETRIES[selectedCrossingId];

  // Tariff calculation
  const tariffResult = useMemo(() => {
    return calculateTransitTariff({
      vehicleType,
      crossingId: selectedCrossingId,
      vehicleHeightM: vehicleHeight,
      vehicleWidthM: vehicleWidth,
      vehicleWeightTons: vehicleWeight,
      vehicleSpeedKmh: vehicleSpeed,
      requiresPoliceConvoy,
    });
  }, [vehicleType, selectedCrossingId, vehicleHeight, vehicleWidth, vehicleWeight, vehicleSpeed, requiresPoliceConvoy]);

  // Collision Risk Assessment in Simulator
  const collisionRisk = useMemo(() => {
    return evaluateCollisionRisk({
      trainSpeedKmh: simTrainSpeed,
      trainDistanceM: simTrainDistance,
      trainType: simTrainType,
      obstacleDetected: simObstacleDetected,
      barrierState: simBarrierState,
    });
  }, [simTrainSpeed, simTrainDistance, simTrainType, simObstacleDetected, simBarrierState]);

  // Checklist completion percentage
  const checklistTotal = LEVEL_CROSSING_CHECKLIST.length;
  const checklistCheckedCount = Object.values(checkedItems).filter(Boolean).length;
  const checklistPercentage = Math.round((checklistCheckedCount / checklistTotal) * 100);

  // Exam score calculation
  const examScore = useMemo(() => {
    let correct = 0;
    LEVEL_CROSSING_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: LEVEL_CROSSING_EXAM_QUESTIONS.length,
      passed: correct >= 8,
      percentage: Math.round((correct / LEVEL_CROSSING_EXAM_QUESTIONS.length) * 100),
    };
  }, [examAnswers]);

  // Filter registry
  const filteredRegistry = useMemo(() => {
    const q = registryQuery.toLowerCase().trim();
    if (!q) return registryList;
    return registryList.filter(
      (item) =>
        item.certificateId.toLowerCase().includes(q) ||
        item.vehiclePlate.toLowerCase().includes(q) ||
        item.crossingNameAz.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q)
    );
  }, [registryQuery, registryList]);

  const handleApplyPreset = (presetId: string) => {
    const preset = MOCK_VEHICLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setVehiclePlate(preset.plate);
    setVehicleType(preset.vehicleType);
    setVehicleHeight(preset.heightM);
    setVehicleWidth(preset.widthM);
    setVehicleWeight(preset.weightTons);
    setVehicleSpeed(preset.speedKmh);
    setRequiresPoliceConvoy(preset.requiresPoliceConvoy);
  };

  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllChecklist = () => {
    const all: Record<string, boolean> = {};
    LEVEL_CROSSING_CHECKLIST.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedItems(all);
  };

  const handleGenerateCertificate = () => {
    const cert = generateLevelCrossingCertificate({
      crossingId: selectedCrossingId,
      vehiclePlate,
      vehicleType,
      applicantName,
      companyName,
      transitSlot,
      calculatedFeeAzn: tariffResult.totalFeeAzn,
    });
    setGeneratedCertificate(cert);
    setRegistryList((prev) => [cert, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shadow-inner">
              <Train className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  ADY, AAYDA & BDYP Həmsəviyyəli Dəmiryolu Keçidləri SCADA Portalı
                </h2>
                <Badge variant="danger" className="text-[10px] uppercase font-bold tracking-wider">
                  Maddə 44 YHQ
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Avtomatik Şlaqbaum Baryer Kilidləmə, Lidar Maneə Aşkarlama Radarı və LEVEL-CROSSING-AZ-2026 Nəzarət Sistemi
              </p>
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  currency === c
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar-btn"
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'radar'
                ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Keçid SCADA Radarı
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator-btn"
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Tranzit Rüsum & Cərimə
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            data-testid="tab-simulator-btn"
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            SCADA Kilid Simulatoru
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist-btn"
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'checklist'
                ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            10-Bənd Təhlükəsizlik
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam-btn"
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'exam'
                ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Maddə 44 İmtahanı
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate-btn"
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'certificate'
                ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Rəsmi İcazə Sertifikatı
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry-btn"
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              activeTab === 'registry'
                ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Vahid Reyestr
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: RADAR & SCADA TELEMETRY */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              {/* Crossing Selector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(LEVEL_CROSSINGS_REGISTRY) as CrossingId[]).map((id) => {
                  const item = LEVEL_CROSSINGS_REGISTRY[id];
                  const telem = MOCK_CROSSING_TELEMETRIES[id];
                  const isSelected = selectedCrossingId === id;

                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedCrossingId(id)}
                      data-testid={`crossing-card-${id}`}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-950/30'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge
                          variant={
                            telem.barrierState === 'closed'
                              ? 'danger'
                              : telem.barrierState === 'descending'
                              ? 'warning'
                              : telem.barrierState === 'emergency_trap'
                              ? 'danger'
                              : 'success'
                          }
                          className="text-[10px]"
                        >
                          {telem.barrierState === 'closed'
                            ? 'QAPALI (Baryer Kilidli)'
                            : telem.barrierState === 'descending'
                            ? 'ŞLAQBAUM ENİR'
                            : telem.barrierState === 'emergency_trap'
                            ? 'QƏZA RELEYSİ (MANEƏ)'
                            : 'AÇIQ (Sərbəst Keçid)'}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-400">{item.railKm}</span>
                      </div>
                      <h4 className="text-sm font-bold truncate">{item.nameAz}</h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.highwayRoute}</p>
                      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-700/50">
                        <span>{item.tracksCount} Dəmiryol Yolu</span>
                        <span className="text-amber-400 font-semibold">{item.catenaryVoltageKv} kV AC</span>
                        <span>{item.maxTrainSpeedKmh} km/s Max</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Crossing Live SCADA Dashboard */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/70 via-slate-850 to-slate-900 border border-slate-700/80 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{activeCrossing.nameAz}</h3>
                      <Badge variant="info" className="text-xs font-mono">
                        {activeCrossing.railKm}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{activeCrossing.lineCorridorAz}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">ADY Qəza Mərkəzi:</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      {activeCrossing.dispatcherEmergencyPhone}
                    </span>
                  </div>
                </div>

                {/* SCADA 4 Indicator Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Gauge 1: Barrier Arm Status */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400">Avtomatik Baryer Şlaqbaum</span>
                    <div className="my-2 flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          activeTelemetry.barrierState === 'closed'
                            ? 'bg-red-500 animate-ping'
                            : activeTelemetry.barrierState === 'descending'
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-base font-bold text-white capitalize">
                        {activeTelemetry.barrierState === 'closed'
                          ? 'Kilidli / Tam Enmiş'
                          : activeTelemetry.barrierState === 'descending'
                          ? 'Enmə Prosesində'
                          : activeTelemetry.barrierState === 'emergency_trap'
                          ? 'İlişmə Həyəcanı'
                          : 'Açıq / Şaquli'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{activeCrossing.barrierTypeAz}</span>
                  </div>

                  {/* Gauge 2: Train Approach & ETA */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400">Yaxınlaşan Qatar Telemetriyası</span>
                    <div className="my-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-400">
                          {activeTelemetry.trainSpeedKmh}
                        </span>
                        <span className="text-xs text-slate-400">km/saat</span>
                        <span className="text-xs text-slate-500 ml-auto">
                          Məsafə: {activeTelemetry.trainDistanceM} m
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Keçidə Çatma Vaxtı (ETA):{' '}
                      <strong className="text-white">
                        {Math.round((activeTelemetry.trainDistanceM / ((activeTelemetry.trainSpeedKmh * 1000) / 3600)))} san
                      </strong>
                    </span>
                  </div>

                  {/* Gauge 3: 3D Laser Obstacle Radar */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400">3D Lidar Maneə Aşkarlama Radarı</span>
                    <div className="my-2 flex items-center gap-2">
                      {activeTelemetry.obstacleState === 'clear' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-400">Təhlükəli Zona Boşdur</span>
                        </>
                      ) : (
                        <>
                          <AlertOctagon className="w-5 h-5 text-red-400 animate-bounce" />
                          <span className="text-sm font-bold text-red-400">Maneə Aşkarlandı!</span>
                        </>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{activeCrossing.radarTypeAz}</span>
                  </div>

                  {/* Gauge 4: Optical & Acoustic Signals */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400">AOP İşıqfor & Zəng Siqnalı</span>
                    <div className="my-2 flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border ${
                            activeTelemetry.signalLampState === 'alternating_red'
                              ? 'bg-red-600 border-red-400 animate-pulse'
                              : 'bg-slate-700 border-slate-600'
                          }`}
                        />
                        <div
                          className={`w-3.5 h-3.5 rounded-full border ${
                            activeTelemetry.signalLampState === 'lunar_white'
                              ? 'bg-sky-200 border-white shadow-lg'
                              : 'bg-slate-700 border-slate-600'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold text-white">
                        {activeTelemetry.signalLampState === 'alternating_red'
                          ? 'İkili Qırmızı Flaş'
                          : 'Ağ Ay İşığı (Sərbəst)'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Akustik Zəng: {activeTelemetry.acousticAlarmActive ? 'AKTİV (105 dB)' : 'Sakit'}
                    </span>
                  </div>
                </div>

                {/* Statutory Article 44 Safety Notice */}
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 flex items-start gap-3">
                  <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white mb-1">
                      Azərbaycan Respublikasının Yol Hərəkəti Haqqında Qanunu - Maddə 44:
                    </h5>
                    <p className="leading-relaxed">
                      Dəmir yolu keçidinə yaxınlaşarkən sürücü qatara (lokomotivə, drezinə) yol verməlidir.
                      Şlaqbaum bağlandıqda və ya işıqforun qırmızı siqnalı yandıqda keçidə daxil olmaq qəti qadağandır.
                      Qaydaların pozulmasına görə İXM Maddə 327.3 üzrə 100 AZN cərimə və 3 cərimə balı təyin olunur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSIT TARIFF & VIOLATION PENALTY CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Quick Vehicle Presets */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  Sürətli Nəqliyyat Kateqoriyası Şablonları:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_VEHICLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      data-testid={`preset-btn-${preset.id}`}
                      className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700 text-left transition-all group"
                    >
                      <span className="text-[10px] text-amber-400 font-mono block">{preset.plate}</span>
                      <strong className="text-xs font-semibold text-white block truncate mt-0.5">
                        {preset.nameAz.split(' ')[0]}
                      </strong>
                      <span className="text-[10px] text-slate-400 block truncate">{preset.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculator Form Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-850 border border-slate-700/80 space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-2">
                    Keçid Parametrləri və Nəqliyyatın Qabaritləri
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Dövlət Qeydiyyat Nişanı (Nömrə)
                      </label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                        data-testid="input-vehicle-plate"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-red-500"
                        placeholder="10-AA-000"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Dəmiryol Keçidi Məntəqəsi
                      </label>
                      <select
                        value={selectedCrossingId}
                        onChange={(e) => setSelectedCrossingId(e.target.value as CrossingId)}
                        data-testid="select-crossing-id"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                      >
                        {(Object.keys(LEVEL_CROSSINGS_REGISTRY) as CrossingId[]).map((id) => (
                          <option key={id} value={id}>
                            {LEVEL_CROSSINGS_REGISTRY[id].nameAz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Nəqliyyatın Qabarit Hündürlüyü: <span className="text-amber-400">{vehicleHeight} m</span>
                      </label>
                      <input
                        type="range"
                        min="1.2"
                        max="5.2"
                        step="0.05"
                        value={vehicleHeight}
                        onChange={(e) => setVehicleHeight(parseFloat(e.target.value))}
                        data-testid="slider-vehicle-height"
                        className="w-full accent-red-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        {vehicleHeight > 4.5 ? '⚠️ 4.5m-dən yüksək: 25kV kontakt xətti icazəsi tələb olunur!' : 'Standart hündürlük həddində'}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Nəqliyyatın Eni (Qabarit): <span className="text-amber-400">{vehicleWidth} m</span>
                      </label>
                      <input
                        type="range"
                        min="1.5"
                        max="4.8"
                        step="0.05"
                        value={vehicleWidth}
                        onChange={(e) => setVehicleWidth(parseFloat(e.target.value))}
                        data-testid="slider-vehicle-width"
                        className="w-full accent-red-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        {vehicleWidth > 3.5 ? '⚠️ 3.5m-dən geniş: ADY müşayiəti tələb olunur!' : 'Standart en'}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Ümumi Çəki: <span className="text-amber-400">{vehicleWeight} Ton</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="80"
                        step="1"
                        value={vehicleWeight}
                        onChange={(e) => setVehicleWeight(parseFloat(e.target.value))}
                        data-testid="slider-vehicle-weight"
                        className="w-full accent-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Keçid Sürəti: <span className="text-amber-400">{vehicleSpeed} km/saat</span>
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="60"
                        step="1"
                        value={vehicleSpeed}
                        onChange={(e) => setVehicleSpeed(parseFloat(e.target.value))}
                        data-testid="slider-vehicle-speed"
                        className="w-full accent-red-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        {vehicleSpeed < 8 ? '⚠️ 8 km/saatdan az: Stansiya rəisinin icazəsi mütləqdir!' : 'Normal sürət'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="policeEscortToggle"
                      checked={requiresPoliceConvoy}
                      onChange={(e) => setRequiresPoliceConvoy(e.target.checked)}
                      data-testid="checkbox-police-convoy"
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                    />
                    <label htmlFor="policeEscortToggle" className="text-xs font-semibold text-slate-300">
                      BDYP Patrul Avtomobili ilə Fövqəladə Yol Müşayiəti (Konvoy Təhlükəsizliyi)
                    </label>
                  </div>
                </div>

                {/* Calculation Summary Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-red-950/40 border border-slate-700/80 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Rəsmi Tranzit Hesabatı
                    </span>
                    <div className="text-3xl font-black text-white">
                      {formatCurrency(tariffResult.totalFeeAzn, currency)}
                    </div>
                    <span className="text-xs text-slate-400">
                      {tariffResult.totalFeeAzn === 0 ? 'Fərdi minik avtomobilləri üçün ödənişsizdir' : 'Xüsusi qabarit & müşayiət daxil'}
                    </span>

                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-700/60 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Baza Keçid Rüsumu:</span>
                        <span className="font-semibold">{formatCurrency(tariffResult.baseFeeAzn, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ADY Stansiya Rəisi Müşayiəti:</span>
                        <span className="font-semibold">{formatCurrency(tariffResult.escortFeeAzn, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">25kV Kontakt Xətti Nəzarəti:</span>
                        <span className="font-semibold">{formatCurrency(tariffResult.catenarySafetyFeeAzn, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">BDYP Polisi Eskortu:</span>
                        <span className="font-semibold">{formatCurrency(tariffResult.policeEscortFeeAzn, currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Violation Penalty Box */}
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs space-y-1">
                    <div className="flex items-center justify-between text-red-300 font-bold">
                      <span>İXM Maddə 327.3 Pozuntu Cəriməsi:</span>
                      <span>{formatCurrency(tariffResult.violationPenaltyAzn, currency)} + 3 Bal</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      30 gün ərzində ödənişdə 50% güzəşt: <strong>{formatCurrency(tariffResult.violationPenaltyDiscountedAzn, currency)}</strong>
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleGenerateCertificate}
                    data-testid="btn-generate-cert-from-calc"
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-red-950/40"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Elektron İcazə Sertifikatı Al
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCADA INTERLOCKING & OBSTACLE LASER SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Visual Interactive Diagram */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white tracking-wide uppercase">
                      ADY SCADA 2-Yollu Həmsəviyyəli Keçid Diaqramı
                    </span>
                    <Badge variant={collisionRisk.riskLevel === 'critical_danger' ? 'danger' : 'success'}>
                      {collisionRisk.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="font-mono text-slate-400">
                    TTI (Toqquşmaya Qalan Vaxt):{' '}
                    <strong className="text-amber-400 font-bold">{collisionRisk.timeToImpactSec} san</strong>
                  </span>
                </div>

                {/* SVG Visual Crossing Representation */}
                <div className="relative w-full h-44 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 800 180">
                    {/* Road Surface (Vertical) */}
                    <rect x="340" y="0" width="120" height="180" fill="#334155" />
                    <line x1="400" y1="0" x2="400" y2="180" stroke="#f8fafc" strokeWidth="2" strokeDasharray="6,6" />

                    {/* Stop Lines on Road */}
                    <line x1="340" y1="35" x2="460" y2="35" stroke="#ef4444" strokeWidth="4" />
                    <line x1="340" y1="145" x2="460" y2="145" stroke="#ef4444" strokeWidth="4" />

                    {/* Dual Railway Tracks (Horizontal) */}
                    {/* Track 1 */}
                    <line x1="0" y1="70" x2="800" y2="70" stroke="#94a3b8" strokeWidth="3" />
                    <line x1="0" y1="85" x2="800" y2="85" stroke="#94a3b8" strokeWidth="3" />
                    {/* Sleepers */}
                    {Array.from({ length: 27 }).map((_, i) => (
                      <line
                        key={`t1-${i}`}
                        x1={i * 30 + 10}
                        y1="66"
                        x2={i * 30 + 10}
                        y2="89"
                        stroke="#64748b"
                        strokeWidth="2"
                      />
                    ))}

                    {/* Track 2 */}
                    <line x1="0" y1="105" x2="800" y2="105" stroke="#94a3b8" strokeWidth="3" />
                    <line x1="0" y1="120" x2="800" y2="120" stroke="#94a3b8" strokeWidth="3" />
                    {/* Sleepers */}
                    {Array.from({ length: 27 }).map((_, i) => (
                      <line
                        key={`t2-${i}`}
                        x1={i * 30 + 10}
                        y1="101"
                        x2={i * 30 + 10}
                        y2="124"
                        stroke="#64748b"
                        strokeWidth="2"
                      />
                    ))}

                    {/* Barriers (Top and Bottom) */}
                    {/* Top Barrier */}
                    <line
                      x1="330"
                      y1="40"
                      x2={simBarrierState === 'closed' ? '460' : '360'}
                      y2={simBarrierState === 'closed' ? '40' : '15'}
                      stroke="#ef4444"
                      strokeWidth="5"
                      strokeDasharray="10,6"
                    />
                    {/* Bottom Barrier */}
                    <line
                      x1="470"
                      y1="140"
                      x2={simBarrierState === 'closed' ? '340' : '440'}
                      y2={simBarrierState === 'closed' ? '140' : '165'}
                      stroke="#ef4444"
                      strokeWidth="5"
                      strokeDasharray="10,6"
                    />

                    {/* Flashing Signal Lamps (AOP) */}
                    <circle
                      cx="325"
                      cy="30"
                      r="6"
                      fill={simBarrierState === 'closed' ? '#ef4444' : '#38bdf8'}
                      className={simBarrierState === 'closed' ? 'animate-ping' : ''}
                    />
                    <circle
                      cx="475"
                      cy="150"
                      r="6"
                      fill={simBarrierState === 'closed' ? '#ef4444' : '#38bdf8'}
                      className={simBarrierState === 'closed' ? 'animate-ping' : ''}
                    />

                    {/* Approaching Train */}
                    <rect
                      x={Math.max(20, Math.min(260, 300 - simTrainDistance / 8))}
                      y="62"
                      width="70"
                      height="30"
                      rx="4"
                      fill="#b91c1c"
                      stroke="#f87171"
                      strokeWidth="2"
                    />
                    <text
                      x={Math.max(30, Math.min(270, 310 - simTrainDistance / 8))}
                      y="82"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      ADY {simTrainSpeed} km/s
                    </text>

                    {/* Obstacle / Vehicle on Tracks */}
                    {simObstacleDetected && (
                      <g>
                        <rect x="380" y="85" width="40" height="25" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                        <text x="388" y="102" fill="#000000" fontSize="9" fontWeight="bold">
                          MANEƏ
                        </text>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Simulation Control Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Qatarın Sürəti: <span className="text-red-400 font-bold">{simTrainSpeed} km/saat</span>
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="160"
                      step="5"
                      value={simTrainSpeed}
                      onChange={(e) => setSimTrainSpeed(parseInt(e.target.value))}
                      data-testid="slider-sim-train-speed"
                      className="w-full accent-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Qatarın Keçidə Məsafəsi: <span className="text-amber-400 font-bold">{simTrainDistance} metr</span>
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="3000"
                      step="50"
                      value={simTrainDistance}
                      onChange={(e) => setSimTrainDistance(parseInt(e.target.value))}
                      data-testid="slider-sim-train-distance"
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Şlaqbaum Rejimi
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={simBarrierState === 'closed' ? 'danger' : 'outline'}
                        onClick={() => setSimBarrierState(simBarrierState === 'closed' ? 'open' : 'closed')}
                        data-testid="btn-toggle-sim-barrier"
                        className="text-xs font-bold"
                      >
                        {simBarrierState === 'closed' ? 'Şlaqbaumu Aç' : 'Şlaqbaumu Bağla'}
                      </Button>
                      <Button
                        size="sm"
                        variant={simObstacleDetected ? 'danger' : 'outline'}
                        onClick={() => setSimObstacleDetected(!simObstacleDetected)}
                        data-testid="btn-toggle-sim-obstacle"
                        className="text-xs font-bold"
                      >
                        {simObstacleDetected ? 'Maneəni Götür' : 'Maneə Yarat'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* SCADA Decision Analysis */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      Tələb Olunan Qəza Əyləc Məsafəsi:
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {collisionRisk.emergencyBrakingDistanceM} metr (Təhlükəsizlik Ehtiyatı: {collisionRisk.distanceMarginM} m)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Sistem Təlimatı:</span>
                    <span className={`font-bold ${collisionRisk.riskLevel === 'critical_danger' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {collisionRisk.recommendedActionAz}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setSimEmergencyTripTriggered(true)}
                      data-testid="btn-emergency-ats-trip"
                      className="flex items-center gap-1.5 text-xs bg-red-700 hover:bg-red-600 font-bold"
                    >
                      <Zap className="w-4 h-4" />
                      Qatara Təcili Əyləc Əmri Göndər (ATS / ETCS Balise)
                    </Button>
                  </div>
                  {simEmergencyTripTriggered && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Lokomotiv kabinasına ALSN/ETCS qəza əyləc komandası ötürüldü. Qatar dayandırılır.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT TECHNICAL & TRAFFIC SAFETY CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/30 to-slate-900 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Həmsəviyyəli Dəmiryolu Keçidi Qaydaları üzrə 10-Bəndlik Texniki Yoxlama
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Azərbaycan Respublikası Yol Hərəkəti Haqqında Qanunun 44-cü maddəsi və ADY TİQ tələbləri
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Uyğunluq:</span>
                    <strong className="text-sm font-bold text-emerald-400 block">
                      {checklistCheckedCount} / {checklistTotal} ({checklistPercentage}%)
                    </strong>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAllChecklist}
                    data-testid="btn-select-all-checklist"
                    className="text-xs font-semibold"
                  >
                    Hamısını Təsdiqlə
                  </Button>
                </div>
              </div>

              {/* Checklist Items List */}
              <div className="space-y-3">
                {LEVEL_CROSSING_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-slate-850 border-emerald-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-5 h-5 mt-0.5 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-950 border-slate-700 pointer-events-none"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                            {item.categoryAz}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.lawReference}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold">{item.titleAz}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.descriptionAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: 10-QUESTION ARTICLE 44 EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Dəmir Yolu Keçidlərində Hərəkət Qaydaları və Maddə 44 İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hərəkət təhlükəsizliyi sertifikatlaşdırılması üçün 10 nəzəri test sualı
                  </p>
                </div>
                {examSubmitted && (
                  <Badge
                    variant={examScore.passed ? 'success' : 'danger'}
                    className="text-xs font-bold uppercase tracking-wider py-1.5 px-3"
                  >
                    Nəticə: {examScore.correct} / {examScore.total} ({examScore.percentage}%) - {examScore.passed ? 'MÜVƏFFƏQİYYƏTLİ' : 'KƏSİLDİ'}
                  </Badge>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-5">
                {LEVEL_CROSSING_EXAM_QUESTIONS.map((q, index) => {
                  const userAnswer = examAnswers[q.id];
                  const isAnswered = userAnswer !== undefined;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {index + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{q.questionAz}</h4>
                      </div>

                      <div className="space-y-2 pt-1 pl-8">
                        {q.optionsAz.map((opt, optIdx) => {
                          let optBg = 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800';

                          if (examSubmitted) {
                            if (optIdx === q.correctAnswer) {
                              optBg = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                            } else if (userAnswer === optIdx && userAnswer !== q.correctAnswer) {
                              optBg = 'bg-red-950/60 border-red-500 text-red-200';
                            }
                          } else if (userAnswer === optIdx) {
                            optBg = 'bg-red-950/50 border-red-500 text-white';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!examSubmitted) {
                                  setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                }
                              }}
                              data-testid={`exam-q-${q.id}-opt-${optIdx}`}
                              className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${optBg}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 pl-8">
                          <strong className="text-amber-400 block mb-0.5">Qanunvericilik İzahı:</strong>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Exam Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExamAnswers({});
                    setExamSubmitted(false);
                  }}
                  data-testid="btn-reset-exam"
                  className="text-xs"
                >
                  Cavabları Sıfırla
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setExamSubmitted(true)}
                  data-testid="btn-submit-exam"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  İmtahanı Tamamla və Yoxla
                </Button>
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL ELECTRONIC TRANSIT CLEARANCE CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {!generatedCertificate ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                  <FileCheck2 className="w-12 h-12 text-slate-500 mx-auto" />
                  <h3 className="text-base font-bold text-white">
                    Hələ Rəsmi Keçid Sertifikatı Yaradılmayıb
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Kombayn, ağır kran, TIR və ya xüsusi qabaritli nəqliyyat vasitəsi üçün elektron icazə vəsiqəsi yaratmaq üçün aşağıdakı düyməni sıxın.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleGenerateCertificate}
                    data-testid="btn-create-first-cert"
                    className="bg-red-600 hover:bg-red-500 text-white font-bold"
                  >
                    İndi Yeni Sertifikat Tərtib Et
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Rəsmi Sənəd UID: <strong className="text-white font-mono">{generatedCertificate.certificateId}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyCode(generatedCertificate.certificateId)}
                        data-testid="btn-copy-cert-id"
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePrint}
                        data-testid="btn-print-cert"
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Çap Et (PDF)
                      </Button>
                    </div>
                  </div>

                  {/* Printable Formal Certificate Layout */}
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-red-500/40 text-slate-200 shadow-2xl relative overflow-hidden space-y-6">
                    {/* Watermark Crest */}
                    <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                      <Train className="w-72 h-72 text-red-500" />
                    </div>

                    {/* Top Seal Header */}
                    <div className="border-b border-slate-700/80 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400">
                          <Train className="w-8 h-8" />
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-white tracking-wider uppercase">
                            "Azərbaycan Dəmir Yolları" Qapalı Səhmdar Cəmiyyəti
                          </h2>
                          <h3 className="text-xs font-semibold text-slate-400">
                            AAYDA və BDYP Birgə Həmsəviyyəli Dəmiryolu Keçidi Tranzit Şəhadətnaməsi
                          </h3>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs text-slate-400">
                        <span className="text-red-400 font-bold block">{generatedCertificate.certificateId}</span>
                        <span>Verilmə Tarixi: {generatedCertificate.issuedDate}</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Dövlət Qeydiyyat Nişanı:</span>
                        <strong className="text-base font-bold text-white font-mono">
                          {generatedCertificate.vehiclePlate}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Keçid Məntəqəsi:</span>
                        <strong className="text-sm font-bold text-amber-300">
                          {generatedCertificate.crossingNameAz}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Nəqliyyat Kateqoriyası:</span>
                        <strong className="text-sm font-bold text-white capitalize">
                          {generatedCertificate.vehicleType}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Müraciətçi / Şirkət:</span>
                        <strong className="text-sm font-bold text-white">
                          {generatedCertificate.companyName}
                        </strong>
                        <span className="text-[11px] text-slate-400 block">{generatedCertificate.applicantName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Təyin Edilmiş Vaxt Pəncərəsi:</span>
                        <strong className="text-sm font-bold text-emerald-400">
                          {generatedCertificate.transitSlot}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">ADY Müşayiət Çağırış Siqnalı:</span>
                        <strong className="text-sm font-mono text-cyan-300">
                          {generatedCertificate.escortCallsign}
                        </strong>
                      </div>
                    </div>

                    {/* Cryptographic Footprint */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
                      <div>
                        <span className="block font-mono text-slate-500">{generatedCertificate.sha256Hash}</span>
                        <span className="font-semibold text-emerald-400">{generatedCertificate.simaSignatureUid}</span>
                      </div>
                      <Badge variant="success" className="text-xs uppercase font-bold py-1 px-3">
                        RƏSMİ TƏSDİQLƏNMİŞDİR
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: UNIFIED PUBLIC REGISTRY & AUDIT LOG */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={registryQuery}
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    data-testid="input-registry-search"
                    placeholder="Qeydiyyat nişanı, sertifikat və ya keçid axtar..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  Toplam Qeyd: <strong className="text-white">{filteredRegistry.length}</strong>
                </span>
              </div>

              {/* Table of Certificates */}
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-3">Sertifikat ID</th>
                      <th className="p-3">Qeydiyyat Nişanı</th>
                      <th className="p-3">Keçid Məntəqəsi</th>
                      <th className="p-3">Şirkət / Daşıyıcı</th>
                      <th className="p-3">Məbləğ</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredRegistry.map((cert) => (
                      <tr key={cert.certificateId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-red-400">{cert.certificateId}</td>
                        <td className="p-3 font-mono text-white font-semibold">{cert.vehiclePlate}</td>
                        <td className="p-3">{cert.crossingNameAz}</td>
                        <td className="p-3 text-slate-400">{cert.companyName}</td>
                        <td className="p-3 font-semibold text-white">{formatCurrency(cert.calculatedFeeAzn, currency)}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              cert.status === 'approved' || cert.status === 'escorted_complete'
                                ? 'success'
                                : cert.status === 'in_transit'
                                ? 'warning'
                                : 'danger'
                            }
                            className="text-[10px]"
                          >
                            {cert.status === 'approved'
                              ? 'Təsdiqləndi'
                              : cert.status === 'in_transit'
                              ? 'Keçid Zonada'
                              : cert.status === 'escorted_complete'
                              ? 'Müşayiət Bitdi'
                              : 'İmtina'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ADY & BDYP Təhlükəsizlik Şəbəkəsi (AZS 422 Dövlət Standartı)</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} data-testid="btn-modal-close" className="text-xs">
            Bağla
          </Button>
        </div>
      </div>
    </Modal>
  );
};
