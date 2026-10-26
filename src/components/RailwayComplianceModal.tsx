import React, { useState, useMemo } from 'react';
import {
  Train,
  ShieldCheck,
  AlertTriangle,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Car,
  Zap,
  Leaf,
  Fuel,
  Info,
  ExternalLink,
  QrCode,
  Gauge,
  Sliders,
  DollarSign,
  Award,
  BellRing,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  RailVehicleCategory,
  RailPassengerClass,
  RailRouteCode,
  MOTOR_AIL_ROUTES,
  calculateMotorailFare,
  evaluateRailwayCrossingViolation,
  evaluateRailwayChecklist,
  gradeRailwayExam,
  generateRailwayBoardingPass,
  formatAzerbaijanPlate,
  convertAznToCurrency,
} from '../utils/railwayCompliance';
import {
  MOCK_RAILWAY_TERMINALS,
  MOCK_RAILWAY_PRESETS,
  MOCK_RAILWAY_CHECKLIST,
  MOCK_RAILWAY_EXAM_QUESTIONS,
  MOCK_RAILWAY_BOARDING_PASSES,
} from '../data/mockRailwayData';

interface RailwayComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: Vehicle | null;
  currency?: Currency;
}

export const RailwayComplianceModal: React.FC<RailwayComplianceModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
  currency = 'AZN',
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'radar' | 'calculator' | 'checklist' | 'terminals' | 'exam' | 'boardingPass'
  >('radar');

  // Presets & Form state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset_sedan_mercedes');
  const [plateNumber, setPlateNumber] = useState<string>(
    initialVehicle ? '10-AZ-700' : '10-AZ-700'
  );
  const [vinNumber, setVinNumber] = useState<string>(
    initialVehicle?.vin || 'WDB2130421A987654'
  );
  const [vehicleName, setVehicleName] = useState<string>(
    initialVehicle ? `${initialVehicle.make} ${initialVehicle.model}` : 'Mercedes-Benz E-Class W213'
  );
  const [vehicleCategory, setVehicleCategory] = useState<RailVehicleCategory>('sedan_compact');
  const [passengerFullName, setPassengerFullName] = useState<string>('Cavid Həsənov');
  const [passengerFin, setPassengerFin] = useState<string>('5K92LA1');
  const [passengerCount, setPassengerCount] = useState<number>(2);
  const [passengerClass, setPassengerClass] = useState<RailPassengerClass>('kupe_4berth');
  const [routeCode, setRouteCode] = useState<RailRouteCode>('BAKU_GANJA');
  const [isElectric, setIsElectric] = useState<boolean>(false);
  const [batterySocPercent, setBatterySocPercent] = useState<number>(65);

  const [vehicleLengthM, setVehicleLengthM] = useState<number>(4.93);
  const [vehicleWidthM, setVehicleWidthM] = useState<number>(1.85);
  const [vehicleHeightM, setVehicleHeightM] = useState<number>(1.47);
  const [vehicleWeightKg, setVehicleWeightKg] = useState<number>(1720);

  // Tab 1: Level Crossing Radar State
  const [crossingDistanceMeters, setCrossingDistanceMeters] = useState<number>(15);
  const [barrierState, setBarrierState] = useState<'fully_open' | 'lowering' | 'fully_closed'>(
    'lowering'
  );
  const [lightsState, setLightsState] = useState<'white_clear' | 'red_flashing_stop'>(
    'red_flashing_stop'
  );
  const [bellActive, setBellActive] = useState<boolean>(true);
  const [trainSpeedKmH, setTrainSpeedKmH] = useState<number>(120);
  const [trainDistanceMeters, setTrainDistanceMeters] = useState<number>(350);

  // Tab 3: Checklist State
  const [checklistItems, setChecklistItems] = useState(MOCK_RAILWAY_CHECKLIST);

  // Tab 4: Terminals Search
  const [terminalSearch, setTerminalSearch] = useState<string>('');

  // Tab 5: Exam State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Tab 6: Boarding Passes & Registry
  const [boardingPasses, setBoardingPasses] = useState(MOCK_RAILWAY_BOARDING_PASSES);
  const [currentPass, setCurrentPass] = useState(MOCK_RAILWAY_BOARDING_PASSES[0]);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Apply Preset Handler
  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = MOCK_RAILWAY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setVehicleName(preset.name);
    setPlateNumber(preset.plateNumber);
    setVinNumber(preset.vin);
    setVehicleCategory(preset.category);
    setVehicleLengthM(preset.lengthM);
    setVehicleWidthM(preset.widthM);
    setVehicleHeightM(preset.heightM);
    setVehicleWeightKg(preset.weightKg);
    setIsElectric(preset.isElectric);
    setBatterySocPercent(preset.batterySoc);
    setRouteCode(preset.defaultRoute);
  };

  // Calculations
  const fareCalculation = useMemo(() => {
    return calculateMotorailFare({
      vehicleLengthM,
      vehicleWidthM,
      vehicleHeightM,
      vehicleCurbWeightKg: vehicleWeightKg,
      vehicleCategory,
      passengerCount,
      passengerClass,
      routeCode,
      isElectric,
      batterySocPercent,
      currency,
    });
  }, [
    vehicleLengthM,
    vehicleWidthM,
    vehicleHeightM,
    vehicleWeightKg,
    vehicleCategory,
    passengerCount,
    passengerClass,
    routeCode,
    isElectric,
    batterySocPercent,
    currency,
  ]);

  const crossingTelemetry = useMemo(() => {
    return evaluateRailwayCrossingViolation({
      distanceMeters: crossingDistanceMeters,
      barrierState,
      lightsState,
      bellActive,
      trainApproaching: true,
      trainSpeedKmH,
      trainDistanceMeters,
    });
  }, [
    crossingDistanceMeters,
    barrierState,
    lightsState,
    bellActive,
    trainSpeedKmH,
    trainDistanceMeters,
  ]);

  const checklistScore = useMemo(() => {
    return evaluateRailwayChecklist(checklistItems);
  }, [checklistItems]);

  const examResult = useMemo(() => {
    return gradeRailwayExam(MOCK_RAILWAY_EXAM_QUESTIONS, examAnswers);
  }, [examAnswers]);

  // Toggle checklist item
  const handleToggleChecklist = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  // Generate new Boarding Pass
  const handleGenerateBoardingPass = () => {
    const newPass = generateRailwayBoardingPass({
      plateNumber: formatAzerbaijanPlate(plateNumber),
      vin: vinNumber,
      vehicleName,
      vehicleCategory,
      passengerFullName,
      passengerFin,
      passengerCount,
      passengerClass,
      routeCode,
      totalFareAzn: fareCalculation.totalFareAzn,
    });
    setCurrentPass(newPass);
    setBoardingPasses((prev) => [newPass, ...prev]);
    setActiveTab('boardingPass');
  };

  // Copy Handler
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Print Handler
  const handlePrintPass = () => {
    window.print();
  };

  // Filtered Terminals
  const filteredTerminals = useMemo(() => {
    if (!terminalSearch.trim()) return MOCK_RAILWAY_TERMINALS;
    const q = terminalSearch.toLowerCase();
    return MOCK_RAILWAY_TERMINALS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q)
    );
  }, [terminalSearch]);

  // Filtered Passes
  const filteredPasses = useMemo(() => {
    if (!registrySearch.trim()) return boardingPasses;
    const q = registrySearch.toLowerCase();
    return boardingPasses.filter(
      (p) =>
        p.passId.toLowerCase().includes(q) ||
        p.plateNumber.toLowerCase().includes(q) ||
        p.passengerFullName.toLowerCase().includes(q) ||
        p.routeName.toLowerCase().includes(q)
    );
  }, [boardingPasses, registrySearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      data-testid="railway-modal"
    >
      <div className="relative w-full max-w-5xl bg-gray-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 via-gray-900 to-cyan-950 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center shadow-inner">
              <Train className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Azərbaycan Dəmir Yolları (ADY) & BDYP
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ADY-RAIL-2026
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Dəmiryol Keçidləri Təhlükəsizliyi (YHQ Maddə 44) & "Avto-Qatar" (Motorail) Portalı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
            data-testid="close-railway-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 bg-gray-950/60 px-4 overflow-x-auto scrollbar-none gap-1">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar"
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'radar'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            Dəmiryol Keçidi Radarı
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator"
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            "Avto-Qatar" Kalkulyatoru
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Texniki Təhlükəsizlik Stendi ({checklistScore.passCount}/10)
          </button>
          <button
            onClick={() => setActiveTab('terminals')}
            data-testid="tab-terminals"
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'terminals'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Dəmir Yolu Terminalları
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'exam'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Award className="w-4 h-4" />
            YHQ 44 İmtahan Simulyatoru
          </button>
          <button
            onClick={() => setActiveTab('boardingPass')}
            data-testid="tab-boarding-pass"
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'boardingPass'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Elektron Bilet & Reyestr
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-300">
          {/* TAB 1: LEVEL CROSSING RADAR & TELEMETRY */}
          {activeTab === 'radar' && (
            <div className="space-y-6" data-testid="radar-section">
              {/* Telemetry Status Card */}
              <div
                className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  crossingTelemetry.verdict === 'critical_danger'
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    : crossingTelemetry.verdict === 'statutory_violation'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : crossingTelemetry.verdict === 'stopping_required'
                    ? 'bg-yellow-950/30 border-yellow-500/50 text-yellow-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {crossingTelemetry.isViolation ? (
                    <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {crossingTelemetry.verdict === 'critical_danger'
                        ? 'TƏHLÜKƏLİ VƏZİYYƏT: Relslərdə Qəza Riski!'
                        : crossingTelemetry.verdict === 'statutory_violation'
                        ? 'QANUN POZUNTUSU: İXM Maddə 345 Cərimə Qərarı'
                        : crossingTelemetry.verdict === 'stopping_required'
                        ? 'DAYANMAQ TƏLƏB OLUNUR: Keçid Bağlıdır / Qırmızı İşıq'
                        : 'SƏRBƏST KEÇİD: İşıqfor Ağ-Ay Rəngdədir'}
                    </h3>
                    <p className="text-xs mt-0.5">
                      {crossingTelemetry.violationArticle
                        ? `${crossingTelemetry.violationArticle} — Cərimə: ${crossingTelemetry.fineAzn} AZN + ${crossingTelemetry.penaltyPoints} Bal`
                        : 'Dəmiryol keçidində bütün təhlükəsizlik qaydalarına riayət edilir.'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-white">
                    {crossingTelemetry.calculatedTimeToImpactSec} san
                  </div>
                  <div className="text-xs text-gray-400">Qatara Qalan Vaxt</div>
                </div>
              </div>

              {/* Crossing Visualizer Simulation */}
              <div className="p-5 bg-gray-950/70 border border-gray-800 rounded-xl space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Train className="w-4 h-4 text-emerald-400" />
                    İnteraktiv Keçid Siqnalizasiyası və Şlaqbaum Stendi
                  </h4>
                  <span className="text-xs px-2.5 py-1 rounded bg-gray-800 text-gray-300 font-mono">
                    YHQ Maddə 44 Standartı
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Traffic Light State */}
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg flex flex-col items-center text-center">
                    <div className="text-xs text-gray-400 mb-2">Dəmiryol İşıqforu</div>
                    <div className="w-24 p-2 bg-black rounded-xl border border-gray-700 flex justify-around items-center mb-3">
                      <div
                        className={`w-5 h-5 rounded-full ${
                          lightsState === 'red_flashing_stop'
                            ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse'
                            : 'bg-rose-950/40'
                        }`}
                      />
                      <div
                        className={`w-5 h-5 rounded-full ${
                          lightsState === 'red_flashing_stop'
                            ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-ping'
                            : 'bg-rose-950/40'
                        }`}
                      />
                      <div
                        className={`w-5 h-5 rounded-full ${
                          lightsState === 'white_clear'
                            ? 'bg-cyan-200 shadow-[0_0_12px_#a5f3fc]'
                            : 'bg-cyan-950/30'
                        }`}
                      />
                    </div>
                    <button
                      onClick={() =>
                        setLightsState((prev) =>
                          prev === 'red_flashing_stop' ? 'white_clear' : 'red_flashing_stop'
                        )
                      }
                      data-testid="toggle-lights-btn"
                      className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-200"
                    >
                      {lightsState === 'red_flashing_stop'
                        ? 'Qırmızı Sayrışan (Dayan)'
                        : 'Ağ-Ay İşığı (Keç)'}
                    </button>
                  </div>

                  {/* Barrier State */}
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg flex flex-col items-center text-center">
                    <div className="text-xs text-gray-400 mb-2">Şlaqbaum Vəziyyəti</div>
                    <div className="text-lg font-bold text-white mb-2">
                      {barrierState === 'fully_closed'
                        ? '🚫 Tam Bağlı'
                        : barrierState === 'lowering'
                        ? '⚠️ Enməkdədir'
                        : '✅ Açıqdır'}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setBarrierState('fully_open')}
                        data-testid="barrier-open-btn"
                        className={`text-xs px-2 py-1 rounded ${
                          barrierState === 'fully_open'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        Açıq
                      </button>
                      <button
                        onClick={() => setBarrierState('lowering')}
                        data-testid="barrier-lowering-btn"
                        className={`text-xs px-2 py-1 rounded ${
                          barrierState === 'lowering'
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        Enir
                      </button>
                      <button
                        onClick={() => setBarrierState('fully_closed')}
                        data-testid="barrier-closed-btn"
                        className={`text-xs px-2 py-1 rounded ${
                          barrierState === 'fully_closed'
                            ? 'bg-rose-600 text-white'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        Bağlı
                      </button>
                    </div>
                  </div>

                  {/* Acoustic Bell */}
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg flex flex-col items-center text-center">
                    <div className="text-xs text-gray-400 mb-2">Akustik Zəng Siqnalı</div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        bellActive
                          ? 'bg-amber-500/20 text-amber-400 animate-bounce'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      <BellRing className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => setBellActive((prev) => !prev)}
                      data-testid="toggle-bell-btn"
                      className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-200"
                    >
                      {bellActive ? 'Zəng Aktivdir (Zıngıldayır)' : 'Səssiz'}
                    </button>
                  </div>
                </div>

                {/* Sliders for Distance & Train Speed */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>Avtomobilin Şlaqbauma / Relsə Məsafəsi:</span>
                      <span className="font-bold text-white font-mono">
                        {crossingDistanceMeters} metr
                        {crossingDistanceMeters < 5 && barrierState !== 'fully_open' && (
                          <span className="text-rose-400 ml-1">(&lt;5m Dayanma Pozuntusu!)</span>
                        )}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={crossingDistanceMeters}
                      onChange={(e) => setCrossingDistanceMeters(Number(e.target.value))}
                      data-testid="distance-slider"
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-300 mb-1">
                        <span>Yaxınlaşan Qatarın Sürəti:</span>
                        <span className="font-bold text-white font-mono">{trainSpeedKmH} km/saat</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="160"
                        step="10"
                        value={trainSpeedKmH}
                        onChange={(e) => setTrainSpeedKmH(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-300 mb-1">
                        <span>Qatarın Keçidə Məsafəsi:</span>
                        <span className="font-bold text-white font-mono">
                          {trainDistanceMeters} metr
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        step="50"
                        value={trainDistanceMeters}
                        onChange={(e) => setTrainDistanceMeters(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Reference Alert */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Yol Hərəkəti Haqqında Qanun — Maddə 44 Qaydaları
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Sürücü şlaqbaum olmayan keçidlərdə qatar yaxınlaşarkən ən yaxın relsə ən azı{' '}
                  <strong className="text-white">10 metr</strong>, şlaqbaum olduqda isə şlaqbauma ən
                  azı <strong className="text-white">5 metr</strong> qalmış dayanmalıdır. Keçiddə və
                  keçidə 100 metr qalmış ötmə, geriyə hərəkət və geriyə dönmə qadağandır. Qaydaların
                  pozulması İXM Maddə 345 üzrə 100 AZN və 3 cərimə balına səbəb olur.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AUTONOMOUS CAR-CARRIER (MOTORAIL) CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6" data-testid="calculator-section">
              {/* Presets Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  Hazır Nəqliyyat Presetləri:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_RAILWAY_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      data-testid={`preset-btn-${p.id}`}
                      className={`p-2 rounded-lg border text-left transition text-xs flex flex-col justify-between ${
                        selectedPresetId === p.id
                          ? 'bg-emerald-600/20 border-emerald-500 text-white'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <span className="font-bold truncate">{p.name}</span>
                      <span className="text-[10px] text-gray-500 mt-1">{p.plateNumber}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Route & Passenger Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Dəmiryol Marşrutu:
                  </label>
                  <select
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value as RailRouteCode)}
                    data-testid="route-select"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {Object.values(MOTOR_AIL_ROUTES).map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name} ({r.distanceKm} km / {Math.floor(r.travelTimeMinutes / 60)}s{' '}
                        {r.travelTimeMinutes % 60}d)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Sərnişin Sinfi (Kupelər):
                  </label>
                  <select
                    value={passengerClass}
                    onChange={(e) => setPassengerClass(e.target.value as RailPassengerClass)}
                    data-testid="passenger-class-select"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="standard_seat">Standart Oturacaq (20 AZN/nəfər)</option>
                    <option value="kupe_4berth">Kupe 4-Nəfərlik (35 AZN/nəfər)</option>
                    <option value="sv_2berth">SV / Lüks 2-Nəfərlik (60 AZN/nəfər)</option>
                    <option value="business_vip">VIP Biznes Salon (110 AZN/nəfər)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Sərnişin Sayı:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(Math.max(1, Number(e.target.value)))}
                      data-testid="passenger-count-input"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-gray-400 whitespace-nowrap">nəfər</span>
                  </div>
                </div>
              </div>

              {/* Dimensions & EV Parameters */}
              <div className="p-4 bg-gray-950/70 border border-gray-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Nəqliyyat Qabaritləri və Elektromobil Tənzimləmələri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400">Hündürlük (m):</label>
                    <input
                      type="number"
                      step="0.05"
                      value={vehicleHeightM}
                      onChange={(e) => setVehicleHeightM(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400">Uzunluq (m):</label>
                    <input
                      type="number"
                      step="0.05"
                      value={vehicleLengthM}
                      onChange={(e) => setVehicleLengthM(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400">Çəki (kq):</label>
                    <input
                      type="number"
                      value={vehicleWeightKg}
                      onChange={(e) => setVehicleWeightKg(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                      <input
                        type="checkbox"
                        checked={isElectric}
                        onChange={(e) => setIsElectric(e.target.checked)}
                        className="rounded border-gray-700 text-emerald-500 focus:ring-0"
                      />
                      <span>Elektromobildir (EV)</span>
                    </label>
                  </div>
                </div>

                {isElectric && (
                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Dartı Batareyası Doldurma Həddi (SOC%):</span>
                      <span className="font-bold text-white font-mono">
                        {batterySocPercent}%{' '}
                        {batterySocPercent > 80 && (
                          <span className="text-rose-400">(&gt;80% Yanğın Riski!)</span>
                        )}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={batterySocPercent}
                      onChange={(e) => setBatterySocPercent(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Price Breakdown & Environmental Impact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tariff Breakdown */}
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-white flex items-center justify-between border-b border-gray-800 pb-2">
                    <span>Avto-Qatar Daşıma Xərcləri:</span>
                    <span className="text-emerald-400 font-mono text-base">
                      {fareCalculation.totalConverted} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Avtomobilin Daşınması:</span>
                    <span className="font-mono text-white">
                      {fareCalculation.baseCarFareAzn} AZN
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>
                      Sərnişin Biletləri ({fareCalculation.passengerCount} nəfər):
                    </span>
                    <span className="font-mono text-white">
                      {fareCalculation.passengerTicketsTotalAzn} AZN
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Təkər Kələfi və Bərkitmə (Tie-Down):</span>
                    <span className="font-mono text-white">
                      {fareCalculation.wagonWheelTieDownFeeAzn} AZN
                    </span>
                  </div>
                  {isElectric && (
                    <div className="flex justify-between text-gray-400">
                      <span>EV Yanğın & Batareya Nəzarəti:</span>
                      <span className="font-mono text-white">
                        {fareCalculation.evSafetyBatteryAuditFeeAzn} AZN
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Vağzal və Pandus Terminal Xidməti:</span>
                    <span className="font-mono text-white">
                      {fareCalculation.stationTerminalFeeAzn} AZN
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-800 flex justify-between font-bold text-white">
                    <span>Təyin Edilən Vaqon Səviyyəsi:</span>
                    <span className="text-emerald-400">{fareCalculation.deckLevel}</span>
                  </div>
                </div>

                {/* Savings & Green Card */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-emerald-400 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Ekoloji və İqtisadi Fayda (Magistral Yolla Müqayisədə)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div className="p-2 bg-gray-900/60 rounded border border-gray-800">
                      <div className="text-[10px] text-gray-500">Qənaət Edilən Yanacaq</div>
                      <div className="text-sm font-bold text-white font-mono">
                        {fareCalculation.estimatedHighwayFuelSavedLiters} L (~
                        {fareCalculation.estimatedHighwayFuelCostSavedAzn} AZN)
                      </div>
                    </div>
                    <div className="p-2 bg-gray-900/60 rounded border border-gray-800">
                      <div className="text-[10px] text-gray-500">Ödənişli Yol Qənaəti</div>
                      <div className="text-sm font-bold text-white font-mono">
                        {fareCalculation.estimatedTollSavedAzn} AZN
                      </div>
                    </div>
                    <div className="p-2 bg-gray-900/60 rounded border border-gray-800">
                      <div className="text-[10px] text-gray-500">Azaldılmış CO2 Emissiyası</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono">
                        {fareCalculation.co2SavedKg} kq CO2 (-79%)
                      </div>
                    </div>
                    <div className="p-2 bg-gray-900/60 rounded border border-gray-800">
                      <div className="text-[10px] text-gray-500">Sükan Arxasında Yorğunluq</div>
                      <div className="text-sm font-bold text-cyan-400 font-mono">
                        0 saat (Rahat yuxu)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleGenerateBoardingPass}
                  data-testid="generate-ticket-btn"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg transition"
                >
                  <Train className="w-4 h-4" />
                  Elektron Bilet və Buraxılış Vərəqəsini Rəsmiləşdir
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: 10-POINT TECHNICAL CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="checklist-section">
              {/* Score Header */}
              <div className="p-4 bg-gray-950/80 border border-gray-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Texniki Qabarit və Təhlükəsizlik Reytinqi
                  </h4>
                  <p className="text-xs text-gray-400">{checklistScore.verdict}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-2xl font-black ${
                      checklistScore.passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {checklistScore.score}%
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {checklistScore.passCount} Keçdi / {checklistScore.failCount} Uğursuz
                  </div>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    data-testid={`checklist-item-${item.id}`}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      item.passed
                        ? 'bg-gray-900/80 border-gray-800 hover:border-emerald-500/50'
                        : 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                    }`}
                  >
                    <div className="pt-0.5">
                      {item.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        {item.isCritical && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                            Kritik
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      <span className="text-[10px] text-gray-500 mt-2 block font-mono">
                        {item.standardRef}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RAILWAY TERMINALS RADAR */}
          {activeTab === 'terminals' && (
            <div className="space-y-6" data-testid="terminals-section">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={terminalSearch}
                    onChange={(e) => setTerminalSearch(e.target.value)}
                    placeholder="Terminal adı, şəhər və ya stansiya kodu ilə axtar..."
                    data-testid="terminal-search-input"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTerminals.map((term) => (
                  <div
                    key={term.id}
                    data-testid={`terminal-card-${term.id}`}
                    className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3 hover:border-emerald-500/40 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{term.name}</h4>
                        <span className="text-[11px] text-gray-400">{term.city}</span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-800 text-emerald-400 border border-gray-700">
                        {term.code}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 pt-2 border-t border-gray-800">
                      <div>
                        Yol Sayı: <strong className="text-white">{term.platformTracks} rels</strong>
                      </div>
                      <div>
                        Rampa: <strong className="text-white">{term.autoRampCapacity} avto/saat</strong>
                      </div>
                      <div>
                        Gündəlik Qatar: <strong className="text-white">{term.dailyTrainsCount}</strong>
                      </div>
                      <div>
                        VHF Tezlik: <strong className="text-white">{term.contactVhf}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {term.hasHighSpeedConnection && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                          FLIRT / KISS 160 km/s
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">
                        {term.coordinates.lat.toFixed(4)}° N, {term.coordinates.lng.toFixed(4)}° E
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: YHQ 44 THEORETICAL EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="exam-section">
              <div className="p-4 bg-gray-950/80 border border-gray-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Dəmiryol Keçidləri Hərəkət Qaydaları (YHQ Maddə 44) Test İmtahanı
                  </h4>
                  <p className="text-xs text-gray-400">
                    Sertifikat təsdiqi üçün ən azı 80% (8 düzgün cavab) tələb olunur.
                  </p>
                </div>
                {isExamSubmitted && (
                  <div className="text-right">
                    <div
                      className={`text-xl font-black ${
                        examResult.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {examResult.scorePercent}% ({examResult.grade})
                    </div>
                    <div className="text-xs text-gray-400">
                      {examResult.correctCount} / {examResult.totalCount} Düzgün
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_RAILWAY_EXAM_QUESTIONS.map((q, idx) => (
                  <div
                    key={q.id}
                    data-testid={`exam-question-${q.id}`}
                    className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3"
                  >
                    <div className="text-xs font-bold text-white">
                      {idx + 1}. {q.question}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = examAnswers[q.id] === optIdx;
                        const isCorrect = q.correctAnswerIndex === optIdx;
                        let optionStyle = 'bg-gray-950 border-gray-800 text-gray-300';

                        if (isExamSubmitted) {
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-emerald-600/20 border-emerald-500 text-white';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              if (!isExamSubmitted) {
                                setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                              }
                            }}
                            className={`p-2.5 rounded-lg border text-left text-xs transition ${optionStyle}`}
                          >
                            <span className="font-mono text-gray-500 mr-2">
                              {String.fromCharCode(65 + optIdx)})
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {isExamSubmitted && (
                      <div className="text-[11px] text-gray-400 bg-gray-950/40 p-2 rounded border border-gray-800">
                        <strong className="text-emerald-400">İzah: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                {isExamSubmitted ? (
                  <button
                    onClick={() => {
                      setIsExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold"
                  >
                    İmtahanı Sıfırla
                  </button>
                ) : (
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    data-testid="submit-exam-btn"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    İmtahanı Tamamla və Qiymətləndir
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: BOARDING PASS & UNIFIED REGISTRY */}
          {activeTab === 'boardingPass' && (
            <div className="space-y-6" data-testid="boarding-pass-section">
              {/* Boarding Pass Preview */}
              <div className="p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950/40 border border-emerald-500/40 rounded-2xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-2">
                  <div className="flex items-center gap-3">
                    <Train className="w-8 h-8 text-emerald-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">
                        ADY "AVTO-QATAR" ELEKTRON BURAXILIŞ VƏRƏQƏSİ
                      </h3>
                      <p className="text-xs text-gray-400">
                        {currentPass.passId} • {currentPass.trainNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(currentPass.passId)}
                      data-testid="copy-pass-id-btn"
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-300 flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedNotification ? 'Kopyalandı!' : 'Kodu Kopyala'}
                    </button>
                    <button
                      onClick={handlePrintPass}
                      data-testid="print-pass-btn"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-medium text-white flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Çap Et
                    </button>
                  </div>
                </div>

                {/* Pass Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block">Qeydiyyat Nişanı:</span>
                    <span className="font-bold text-white text-sm font-mono">
                      {currentPass.plateNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Nəqliyyat Modeli:</span>
                    <span className="font-bold text-white">{currentPass.vehicleName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Sərnişin:</span>
                    <span className="font-bold text-white">
                      {currentPass.passengerFullName} ({currentPass.passengerFin})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Tarif Məbləği:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {currentPass.totalFareAzn} AZN
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-gray-800/80">
                  <div>
                    <span className="text-gray-500 block">Təyin Edilən Avtovaqon:</span>
                    <span className="font-bold text-cyan-400">{currentPass.wagonNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Qat və Yer:</span>
                    <span className="font-bold text-white">
                      {currentPass.deckLevel} / {currentPass.bayNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Sərnişin Vaqonu:</span>
                    <span className="font-bold text-white">
                      {currentPass.passengerWagonNumber} ({currentPass.seatNumbers})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Yola Düşmə / Çatma:</span>
                    <span className="font-bold text-white">
                      {currentPass.departureTime} → {currentPass.arrivalTime}
                    </span>
                  </div>
                </div>

                {/* Security Verification Footer */}
                <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Nəzarətçi: {currentPass.inspectorName} ({currentPass.inspectorBadge})</span>
                  </div>
                  <div className="font-mono text-gray-400">
                    SİMA: {currentPass.simaSignatureUid} • Şifrə: {currentPass.gatePinCode}
                  </div>
                </div>
              </div>

              {/* Unified Public Registry Search */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Vahid İctimai ADY Bilet və Buraxılış Reyestri
                  </h4>
                  <span className="text-xs text-gray-500">
                    {filteredPasses.length} aktiv qeyd
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Bilet ID, nömrə nişanı və ya sərnişin adı ilə reyestrdə axtar..."
                    data-testid="registry-search-input"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  {filteredPasses.map((p) => (
                    <div
                      key={p.passId}
                      onClick={() => setCurrentPass(p)}
                      data-testid={`registry-item-${p.passId}`}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        currentPass.passId === p.passId
                          ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                          : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{p.passId}</span>
                          <span className="text-emerald-400 font-mono">[{p.plateNumber}]</span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {p.routeName} • {p.passengerFullName}
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-bold text-emerald-400 font-mono">
                          {p.totalFareAzn} AZN
                        </div>
                        <div className="text-[10px] text-gray-500">{p.wagonNumber}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
