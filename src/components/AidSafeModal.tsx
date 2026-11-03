import React, { useState, useMemo, useRef } from 'react';
import {
  Currency,
  IncidentType,
  WeatherCondition,
  AidCameraNode,
  AidSimulationInput,
  evaluateAidCompliance,
  generateAidCertificate,
  convertAidCurrency,
  AID_CURRENCY_SYMBOLS,
} from '../utils/aidSafeCompliance';
import {
  MOCK_AID_CAMERAS,
  MOCK_AID_VEHICLES,
  MOCK_AID_CHECKLIST,
  MOCK_AID_EXAM_QUESTIONS,
  MOCK_AID_REGISTRY,
  AidVehiclePreset,
  AidRegistryRecord,
} from '../data/mockAidSafeData';
import {
  Video,
  AlertTriangle,
  ShieldCheck,
  FileCheck2,
  ListFilter,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Search,
  Volume2,
  Radio,
  Clock,
  Car,
  Eye,
  Activity,
  Layers,
  Sparkles,
  MapPin,
  X,
  Gauge,
  Flame,
  UserX,
  ArrowRightLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface AidSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType = 'corridors' | 'scada' | 'presets' | 'checklist_exam' | 'certificate_registry';

export const AidSafeModal: React.FC<AidSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('corridors');
  const [selectedCamera, setSelectedCamera] = useState<AidCameraNode>(MOCK_AID_CAMERAS[0]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);

  // Simulation inputs
  const [incidentType, setIncidentType] = useState<IncidentType>('WRONG_WAY_DRIVER');
  const [approachSpeedKmh, setApproachSpeedKmh] = useState<number>(110);
  const [incidentSpeedKmh, setIncidentSpeedKmh] = useState<number>(60);
  const [distanceMeters, setDistanceMeters] = useState<number>(350);
  const [affectedLane, setAffectedLane] = useState<number>(1);
  const [cameraFocalLengthMm, setCameraFocalLengthMm] = useState<number>(50);
  const [detectionLatencySec, setDetectionLatencySec] = useState<number>(3.5);
  const [aiFrameRateFps, setAiFrameRateFps] = useState<number>(60);
  const [ambientVisibility, setAmbientVisibility] = useState<WeatherCondition>('CLEAR_DAY');
  const [trafficFlowVehPerHour, setTrafficFlowVehPerHour] = useState<number>(1800);
  const [aiConfidenceThresholdPct, setAiConfidenceThresholdPct] = useState<number>(95);
  const [driverReactionTimeSec, setDriverReactionTimeSec] = useState<number>(1.2);

  // Vehicle plate state
  const [currentPlate, setCurrentPlate] = useState<string>('99-AI-101');
  const [vmsLang, setVmsLang] = useState<'AZ' | 'EN' | 'RU'>('AZ');

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'chk-01': true,
    'chk-02': true,
    'chk-03': true,
    'chk-04': true,
    'chk-05': true,
  });

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Registry & Certificate state
  const [registryRecords, setRegistryRecords] = useState<AidRegistryRecord[]>(MOCK_AID_REGISTRY);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Audio synthesis state
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Prepare input for simulation
  const simulationInput: AidSimulationInput = useMemo(
    () => ({
      incidentType,
      approachSpeedKmh,
      incidentSpeedKmh,
      distanceToIncidentMeters: distanceMeters,
      cameraFocalLengthMm,
      detectionLatencySec,
      aiFrameRateFps,
      ambientVisibility,
      trafficFlowVehPerHour,
      aiConfidenceThresholdPct,
      driverReactionTimeSec,
      affectedLane,
    }),
    [
      incidentType,
      approachSpeedKmh,
      incidentSpeedKmh,
      distanceMeters,
      cameraFocalLengthMm,
      detectionLatencySec,
      aiFrameRateFps,
      ambientVisibility,
      trafficFlowVehPerHour,
      aiConfidenceThresholdPct,
      driverReactionTimeSec,
      affectedLane,
    ]
  );

  // Evaluation results
  const evaluation = useMemo(
    () => evaluateAidCompliance(simulationInput),
    [simulationInput]
  );

  // Certificate generated dynamically
  const certificate = useMemo(
    () => generateAidCertificate(selectedCamera, evaluation, currentPlate, 'AAYDA & BDYP SCADA Operator'),
    [selectedCamera, evaluation, currentPlate]
  );

  // Audio alert tone generator
  const playAlertTone = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (evaluation.collisionMetrics.severity === 'CRITICAL_EMERGENCY') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      }

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext unavailable or blocked in environment
    }
  };

  // Preset applicator
  const applyPreset = (preset: AidVehiclePreset) => {
    setCurrentPlate(preset.plate);
    setApproachSpeedKmh(preset.approachSpeedKmh);
    setIncidentType(preset.incidentType);
    setIncidentSpeedKmh(preset.incidentSpeedKmh);
    setDistanceMeters(preset.distanceMeters);
    setAffectedLane(preset.affectedLane);
  };

  // Exam handlers
  const handleSelectAnswer = (qId: string, optIdx: number) => {
    if (!examSubmitted) {
      setExamAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    }
  };

  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_AID_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return Math.round((correct / MOCK_AID_EXAM_QUESTIONS.length) * 100);
  }, [examAnswers]);

  // Registry filter
  const filteredRegistry = useMemo(() => {
    const q = registrySearch.toLowerCase().trim();
    if (!q) return registryRecords;
    return registryRecords.filter(
      (r) =>
        r.certificateId.toLowerCase().includes(q) ||
        r.vehiclePlate.toLowerCase().includes(q) ||
        r.corridor.toLowerCase().includes(q) ||
        r.cameraCode.toLowerCase().includes(q) ||
        r.incidentType.toLowerCase().includes(q)
    );
  }, [registryRecords, registrySearch]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  const simulatePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      data-testid="aid-safe-modal"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/40 overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/20">
              <Video className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AID-SAFE-AZ-2026
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  AAYDA • AYNA • BDYP
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  4K AI SCADA
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                Magistral Yollarda Avtomatik Hadisə Aşkarlama (AID) & CCTV Video Analitika Portalı
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency selector */}
            <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCurrency(c)}
                  className={`px-2 py-1 rounded font-medium transition-all ${
                    selectedCurrency === c
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c} ({AID_CURRENCY_SYMBOLS[c]})
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="aid-safe-close-btn"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('corridors')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'corridors'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Dəhlizlər & Kameralar
          </button>

          <button
            onClick={() => setActiveTab('scada')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scada'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            SCADA Video Analitika
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            Nəqliyyat Preserləri & İXM
          </button>

          <button
            onClick={() => setActiveTab('checklist_exam')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'checklist_exam'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Standartlar & İmtahan
          </button>

          <button
            onClick={() => setActiveTab('certificate_registry')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'certificate_registry'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Sertifikat & Reyestr
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CORRIDORS & RADAR */}
          {activeTab === 'corridors' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    Respublika Magistral Avtomobil Yollarında AID CCTV Şəbəkəsi
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    AAYDA, AYNA və BDYP tərəfindən idarə olunan 4K AI dərin öyrənmə kameraları, optik lifli telemetriya və avtomatik hadisə aşkarlama qovşaqları.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    6 Aktiv AID Node
                  </span>
                  <span className="text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/30">
                    Gecikmə &lt; 10ms
                  </span>
                </div>
              </div>

              {/* Cameras Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_AID_CAMERAS.map((cam) => {
                  const isSelected = selectedCamera.id === cam.id;
                  return (
                    <div
                      key={cam.id}
                      onClick={() => {
                        setSelectedCamera(cam);
                        setAmbientVisibility(cam.weatherCondition);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                          : 'bg-slate-800/30 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-emerald-300 border border-slate-700">
                            {cam.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cam.status === 'ONLINE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            ● {cam.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{cam.corridor}</h3>
                        <p className="text-xs text-slate-400 mt-1">{cam.picketKm}</p>

                        <div className="mt-3 space-y-1.5 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Sensor:</span>
                            <span className="font-semibold text-slate-200">{cam.sensorResolution}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Kadr Tezliyi:</span>
                            <span className="font-semibold text-emerald-400">{cam.aiFrameRateFps} FPS</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Optik Zoom:</span>
                            <span className="font-semibold text-slate-200">{cam.opticalZoom}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Optik Lif Gecikməsi:</span>
                            <span className="font-semibold text-blue-400">{cam.fiberLatencyMs} ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Cari Hava:</span>
                            <span className="font-semibold text-amber-300">{cam.weatherCondition}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          GPS: {cam.gpsLat.toFixed(3)}, {cam.gpsLng.toFixed(3)}
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          Seç <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Camera Specs Callout */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-xs text-slate-400">Hazırda Seçilmiş AID Qovşağı:</span>
                      <h4 className="text-sm font-bold text-white">
                        {selectedCamera.code} — {selectedCamera.corridor} ({selectedCamera.picketKm})
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('scada')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    SCADA Analitikasına Keç
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA VIDEO ANALYTICS STAND */}
          {activeTab === 'scada' && (
            <div className="space-y-6">
              {/* Controls and Sliders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Controls & Dynamic SVG Simulator */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Parameter Controls */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-emerald-400" />
                        Hadisə və Kamera Simulyasiya Parametrləri
                      </h3>
                      <button
                        onClick={playAlertTone}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                        title="SCADA səs siqnalını sınaqdan keçir"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        Səs Siqnalı Test
                      </button>
                    </div>

                    {/* Incident Type Grid */}
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                        Aşkarlanan Hadisə Növü (Incident Type):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { type: 'WRONG_WAY_DRIVER' as IncidentType, label: 'Əks İstiqamət (Ghost Driver)', icon: ArrowRightLeft, color: 'border-red-500/50 text-red-300' },
                          { type: 'STOPPED_VEHICLE' as IncidentType, label: 'Zolaqda Dayanmış Avtomobil', icon: Car, color: 'border-amber-500/50 text-amber-300' },
                          { type: 'DEBRIS_OBSTACLE' as IncidentType, label: 'Yola Düşmüş Yük / Qalıqlar', icon: AlertTriangle, color: 'border-orange-500/50 text-orange-300' },
                          { type: 'PEDESTRIAN_INTRUSION' as IncidentType, label: 'Piyada İntruziyası', icon: UserX, color: 'border-purple-500/50 text-purple-300' },
                          { type: 'TRAFFIC_CONGESTION_SHOCKWAVE' as IncidentType, label: 'Qəfil Tıxac Şok Dalğası', icon: Activity, color: 'border-blue-500/50 text-blue-300' },
                          { type: 'VEHICLE_FIRE_SMOKE' as IncidentType, label: 'Yanğın və Tüstü Ocağı', icon: Flame, color: 'border-rose-500/50 text-rose-300' },
                        ].map((item) => {
                          const isCur = incidentType === item.type;
                          const IconC = item.icon;
                          return (
                            <button
                              key={item.type}
                              onClick={() => setIncidentType(item.type)}
                              className={`p-2 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                                isCur
                                  ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-sm'
                                  : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600'
                              }`}
                            >
                              <IconC className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">Yaxınlaşma Sürəti:</span>
                          <span className="font-bold text-emerald-400">{approachSpeedKmh} km/saat</span>
                        </div>
                        <input
                          type="range"
                          min={30}
                          max={150}
                          step={5}
                          value={approachSpeedKmh}
                          onChange={(e) => setApproachSpeedKmh(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">Hadisə Məsafəsi:</span>
                          <span className="font-bold text-blue-400">{distanceMeters} metr</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={800}
                          step={25}
                          value={distanceMeters}
                          onChange={(e) => setDistanceMeters(Number(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">Təsirə Məruz Qalan Zolaq:</span>
                          <span className="font-bold text-amber-300">Zolaq #{affectedLane}</span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((lane) => (
                            <button
                              key={lane}
                              onClick={() => setAffectedLane(lane)}
                              className={`flex-1 py-1 rounded text-center font-bold border transition-all cursor-pointer ${
                                affectedLane === lane
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {lane === 4 ? 'Çiyin' : `Zolaq ${lane}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">Kamera Fokus Məsafəsi:</span>
                          <span className="font-bold text-slate-200">{cameraFocalLengthMm} mm</span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={120}
                          step={2}
                          value={cameraFocalLengthMm}
                          onChange={(e) => setCameraFocalLengthMm(Number(e.target.value))}
                          className="w-full accent-slate-400 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">Hava və Görünüş Rejimi:</span>
                          <span className="font-bold text-slate-200">{ambientVisibility}</span>
                        </div>
                        <select
                          value={ambientVisibility}
                          onChange={(e) => setAmbientVisibility(e.target.value as WeatherCondition)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 cursor-pointer"
                        >
                          <option value="CLEAR_DAY">Aydın Gün (Clear Day)</option>
                          <option value="RAIN_WET">Güclü Yağış / Asfalt İslak</option>
                          <option value="DENSE_FOG">Qatı Duman (Dense Fog)</option>
                          <option value="NIGHT_IR">Gecə Rejimi (IR İşıqlandırma)</option>
                          <option value="DUST_WIND">Tozlu Külək / Xəzri Qasırğası</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">Nəqliyyat Axını Sıxlığı:</span>
                          <span className="font-bold text-slate-200">{trafficFlowVehPerHour} maşın/saat</span>
                        </div>
                        <input
                          type="range"
                          min={300}
                          max={3800}
                          step={100}
                          value={trafficFlowVehPerHour}
                          onChange={(e) => setTrafficFlowVehPerHour(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SVG Canvas Simulator */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-hidden relative shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-2">
                      <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        LIVE AI FEED: {selectedCamera.code} [{aiFrameRateFps} FPS]
                      </span>
                      <span>Hədəf Məsafəsi: {distanceMeters}m | Zolaq: #{affectedLane}</span>
                    </div>

                    <svg
                      viewBox="0 0 700 280"
                      className="w-full h-auto bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-lg select-none"
                    >
                      {/* Sky & Horizon */}
                      <rect x="0" y="0" width="700" height="90" fill="#090d16" />
                      <line x1="0" y1="90" x2="700" y2="90" stroke="#1e293b" strokeWidth="1" />

                      {/* Road surface in perspective */}
                      <polygon points="260,90 440,90 680,280 20,280" fill="#1e293b" />

                      {/* Road Lane Markings in perspective */}
                      {/* Lane 1-2 dividing line */}
                      <line x1="320" y1="90" x2="240" y2="280" stroke="#f8fafc" strokeWidth="2" strokeDasharray="12,12" opacity="0.6" />
                      {/* Lane 2-3 dividing line */}
                      <line x1="380" y1="90" x2="460" y2="280" stroke="#f8fafc" strokeWidth="2" strokeDasharray="12,12" opacity="0.6" />
                      {/* Outer boundary lines */}
                      <line x1="260" y1="90" x2="20" y2="280" stroke="#fbbf24" strokeWidth="3" />
                      <line x1="440" y1="90" x2="680" y2="280" stroke="#fbbf24" strokeWidth="3" />

                      {/* CCTV Camera Tower on Left with scanning cone */}
                      <rect x="40" y="40" width="6" height="180" fill="#64748b" />
                      <line x1="40" y1="50" x2="100" y2="50" stroke="#64748b" strokeWidth="4" />
                      <polygon points="98,46 112,50 98,54" fill="#10b981" />
                      {/* Scanning Cone */}
                      <polygon
                        points="112,50 320,130 520,240"
                        fill="rgba(16, 185, 129, 0.08)"
                        stroke="rgba(16, 185, 129, 0.3)"
                        strokeDasharray="4,4"
                      />

                      {/* Incident Target Position */}
                      {/* Approximate coordinate based on affectedLane and distance */}
                      {(() => {
                        const distFactor = Math.max(0.15, Math.min(0.85, (800 - distanceMeters) / 750));
                        const yPos = 90 + distFactor * 160;
                        const leftEdge = 260 - distFactor * 240;
                        const rightEdge = 440 + distFactor * 240;
                        const roadWidth = rightEdge - leftEdge;
                        const laneWidth = roadWidth / 3;
                        const xPos = leftEdge + (affectedLane - 0.5) * laneWidth;
                        const targetScale = 0.5 + distFactor * 0.9;

                        return (
                          <g transform={`translate(${xPos}, ${yPos}) scale(${targetScale})`}>
                            {/* Bounding Box */}
                            <rect
                              x="-30"
                              y="-25"
                              width="60"
                              height="50"
                              fill={incidentType === 'WRONG_WAY_DRIVER' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}
                              stroke={incidentType === 'WRONG_WAY_DRIVER' ? '#ef4444' : '#f59e0b'}
                              strokeWidth="2"
                              strokeDasharray="3,3"
                            />
                            {/* Object Label */}
                            <rect
                              x="-30"
                              y="-37"
                              width="60"
                              height="12"
                              fill={incidentType === 'WRONG_WAY_DRIVER' ? '#ef4444' : '#f59e0b'}
                            />
                            <text
                              x="0"
                              y="-28"
                              fill="#ffffff"
                              fontSize="8"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {incidentType === 'WRONG_WAY_DRIVER' ? 'WRONG-WAY' : 'OBSTACLE'}
                            </text>

                            {/* Target Icon Representation */}
                            {incidentType === 'WRONG_WAY_DRIVER' ? (
                              <g>
                                <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#ef4444" />
                                <polygon points="0,-16 -10,-4 10,-4" fill="#fbbf24" />
                                {/* Red inverted velocity vector pointing forward (towards us) */}
                                <line x1="0" y1="12" x2="0" y2="35" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow)" />
                              </g>
                            ) : incidentType === 'VEHICLE_FIRE_SMOKE' ? (
                              <g>
                                <circle cx="0" cy="0" r="14" fill="#f43f5e" opacity="0.8" />
                                <circle cx="-4" cy="-8" r="8" fill="#fbbf24" opacity="0.9" />
                              </g>
                            ) : incidentType === 'PEDESTRIAN_INTRUSION' ? (
                              <g>
                                <circle cx="0" cy="-10" r="5" fill="#a855f7" />
                                <rect x="-3" y="-5" width="6" height="15" fill="#a855f7" />
                              </g>
                            ) : (
                              <g>
                                <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#f59e0b" />
                                <circle cx="-8" cy="8" r="4" fill="#0f172a" />
                                <circle cx="8" cy="8" r="4" fill="#0f172a" />
                              </g>
                            )}
                          </g>
                        );
                      })()}

                      {/* Approaching User Vehicle in lower right */}
                      <g transform="translate(480, 240)">
                        <rect x="-24" y="-18" width="48" height="36" rx="5" fill="#0284c7" />
                        <rect x="-20" y="-14" width="40" height="12" rx="2" fill="#38bdf8" opacity="0.6" />
                        <circle cx="-16" cy="18" r="6" fill="#0f172a" />
                        <circle cx="16" cy="18" r="6" fill="#0f172a" />
                        <text x="0" y="2" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {currentPlate}
                        </text>
                      </g>

                      {/* HUD Overlay Stats */}
                      <g transform="translate(15, 20)">
                        <rect x="0" y="0" width="160" height="50" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="#334155" />
                        <text x="10" y="16" fill="#94a3b8" fontSize="10">Kamera:</text>
                        <text x="60" y="16" fill="#f8fafc" fontSize="10" fontWeight="bold">{selectedCamera.code}</text>
                        <text x="10" y="30" fill="#94a3b8" fontSize="10">Sıxlıq:</text>
                        <text x="60" y="30" fill="#38bdf8" fontSize="10" fontWeight="bold">{evaluation.opticalMetrics.pixelsPerMeter} px/m</text>
                        <text x="10" y="44" fill="#94a3b8" fontSize="10">Dəqiqlik:</text>
                        <text x="60" y="44" fill="#10b981" fontSize="10" fontWeight="bold">{evaluation.opticalMetrics.effectiveAiConfidencePct}%</text>
                      </g>

                      {/* TTC Alert Badge in Top Right */}
                      <g transform="translate(520, 20)">
                        <rect
                          x="0"
                          y="0"
                          width="165"
                          height="50"
                          rx="6"
                          fill={evaluation.collisionMetrics.collisionPredicted ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.85)'}
                          stroke={evaluation.collisionMetrics.collisionPredicted ? '#f87171' : '#334155'}
                        />
                        <text x="10" y="18" fill="#ffffff" fontSize="10" fontWeight="bold">
                          Time-to-Collision (TTC):
                        </text>
                        <text x="10" y="40" fill="#ffffff" fontSize="18" fontWeight="black" fontFamily="monospace">
                          {evaluation.collisionMetrics.timeToCollisionSec} saniyə
                        </text>
                      </g>
                    </svg>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>Johnson Meyarı: <strong className="text-white">{evaluation.opticalMetrics.johnsonCriteriaStatus}</strong></span>
                      <span>Orta Aşkarlama Müddəti (MTTD): <strong className="text-emerald-400">{evaluation.opticalMetrics.meanTimeToDetectSec} s</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Col: SCADA Telemetry & Automated Actuations */}
                <div className="space-y-4">
                  {/* Collision & Safety Evaluation Card */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      Qəza Riski & Təhlükəsizlik Telemetriyası
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Nisbi Yaxınlaşma Sürəti:</span>
                        <span className="font-bold text-white">{evaluation.collisionMetrics.closingSpeedKmh} km/saat</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Tələb Olunan Dayanma Yolu:</span>
                        <span className="font-bold text-amber-300">{evaluation.collisionMetrics.stoppingDistanceRequiredM} m</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Maneəyə Qalan Məsafə Ehtiyatı:</span>
                        <span
                          className={`font-bold ${
                            evaluation.collisionMetrics.clearanceMarginM < 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {evaluation.collisionMetrics.clearanceMarginM > 0 ? '+' : ''}
                          {evaluation.collisionMetrics.clearanceMarginM} m
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">İkinci Dərəcəli Qəza Ehtimalı:</span>
                        <span className="font-bold text-purple-300">{evaluation.collisionMetrics.secondaryCrashRiskPct}%</span>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">Təhlükə Dərəcəsi:</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            evaluation.collisionMetrics.severity === 'CRITICAL_EMERGENCY'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : evaluation.collisionMetrics.severity === 'HIGH_PRIORITY'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {evaluation.collisionMetrics.severity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Automated VMS Banner Preview Card */}
                  <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Avtomatik VMS Gantry Xəbərdarlığı
                      </span>
                      <div className="flex gap-1 text-[10px]">
                        {(['AZ', 'EN', 'RU'] as const).map((l) => (
                          <button
                            key={l}
                            onClick={() => setVmsLang(l)}
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              vmsLang === l ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black p-3 rounded-lg border border-amber-500/50 text-center font-mono font-bold text-amber-300 text-xs shadow-inner min-h-[50px] flex items-center justify-center">
                      {vmsLang === 'AZ' && evaluation.scadaAction.vmsBannerAz}
                      {vmsLang === 'EN' && evaluation.scadaAction.vmsBannerEn}
                      {vmsLang === 'RU' && evaluation.scadaAction.vmsBannerRu}
                    </div>

                    {/* Lane Control Signals (LCS) Preview */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Zolaq Nəzarət İşıqforları (LCS):</span>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {evaluation.scadaAction.recommendedLaneSignals.map((sig, idx) => (
                          <div
                            key={idx}
                            className={`p-1.5 rounded font-bold border ${
                              sig === 'RED_CROSS'
                                ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                : sig === 'MERGE_RIGHT' || sig === 'MERGE_LEFT'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            }`}
                          >
                            <span className="text-[10px] text-slate-400 block">Zolaq {idx + 1}</span>
                            {sig === 'RED_CROSS' ? '✕ BAĞLI' : sig === 'MERGE_RIGHT' ? '↗ KEÇ' : sig === 'MERGE_LEFT' ? '↖ KEÇ' : '↓ AÇIQ'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dispatched Units */}
                    <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-400 block font-semibold mb-1">Təcili Dispetçer Yönləndirməsi:</span>
                      <ul className="space-y-0.5 list-disc list-inside text-emerald-300">
                        {evaluation.scadaAction.dispatchUnits.map((u, i) => (
                          <li key={i}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS & STATUTORY SANCTIONS */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              {/* Presets Grid */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-400" />
                  Həqiqi Azərbaycan Magistral Ssenariləri və Nəqliyyat Preserləri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MOCK_AID_VEHICLES.map((preset) => {
                    const isSelected = currentPlate === preset.plate;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40'
                            : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-blue-900/60 text-white border border-blue-400/40">
                              🇦🇿 {preset.plate}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{preset.vehicleCategory}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                          <p className="text-xs text-slate-300 mt-2 line-clamp-2">{preset.description}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-700 text-xs flex items-center justify-between text-slate-400">
                          <span>Sürət: {preset.approachSpeedKmh} km/s</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            Tətbiq et <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statutory Fines & Sanctions Card */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                      İnzibati Xətalar Məcəlləsi (İXM) üzrə Sanksiyalar
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {evaluation.violationTitle}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                    {evaluation.statutoryArticle}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                    <span className="text-xs text-slate-400 block">Qanuni İnzibati Cərimə:</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {convertAidCurrency(evaluation.statutoryFineAzn, selectedCurrency)} {AID_CURRENCY_SYMBOLS[selectedCurrency]}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">Əsas məbləğ ({evaluation.statutoryFineAzn} AZN)</span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-500/30">
                    <span className="text-xs text-emerald-400 block">İXM Maddə 38 (50% Güzəştli Ödəniş):</span>
                    <div className="text-xl font-bold text-emerald-300 mt-1">
                      {convertAidCurrency(evaluation.statutoryFineAzn * 0.5, selectedCurrency)} {AID_CURRENCY_SYMBOLS[selectedCurrency]}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">30 gün ərzində AsanPay / HÖP ilə</span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                    <span className="text-xs text-slate-400 block">Sürücülük Cərimə Balları:</span>
                    <div className="text-xl font-bold text-amber-300 mt-1">
                      {evaluation.demeritPoints > 0 ? `+${evaluation.demeritPoints} Bal` : '0 Bal'}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">BDYP vahid bal sistemi</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                  <strong className="text-slate-300">Mülki Məcəllə Maddə 1108:</strong> Yol infrastrukturuna, çəpərlərə və ya təhlükəsizlik qurğularına vurulan zərər, həmçinin AAYDA xüsusi texnikasının hadisə yerini təmizləmə xərcləri təqsirkar sürücü və ya onun sığorta şirkəti tərəfindən tam kompensasiya edilir.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STANDARDS CHECKLIST & EXAM */}
          {activeTab === 'checklist_exam' && (
            <div className="space-y-6">
              {/* Checklist Section */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      10-Mərhələli AID və Video Analitika Texniki Uyğunluq Standartı
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      AZS 410, EN 50132-7, ISO 14827 və ONVIF Profile T standartları üzrə yoxlama siyahısı.
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => {
                        const all: Record<string, boolean> = {};
                        MOCK_AID_CHECKLIST.forEach((c) => (all[c.id] = true));
                        setCheckedItems(all);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                    >
                      Hamısını Seç
                    </button>
                    <button
                      onClick={() => setCheckedItems({})}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 cursor-pointer"
                    >
                      Sıfırla
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {MOCK_AID_CHECKLIST.map((item) => {
                    const isChecked = !!checkedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => setCheckedItems((p) => ({ ...p, [item.id]: !p[item.id] }))}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 accent-emerald-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{item.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{item.requirement}</p>
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                            {item.standard}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Theoretical Exam Simulator */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      Magistral Qəza Aşkarlama & Yol Hərəkəti Təhlükəsizliyi İmtahanı (10 Sual)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      İXM, YHQ və AAYDA reqlamentləri üzrə interaktiv bilik qiymətləndirməsi.
                    </p>
                  </div>
                  {examSubmitted && (
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-3 py-1 rounded-full font-bold ${
                          examScore >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}
                      >
                        Nəticə: {examScore}% ({examScore >= 80 ? 'MÜVƏFFƏQ' : 'KƏSİLDİ'})
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {MOCK_AID_EXAM_QUESTIONS.map((q, idx) => {
                    const selectedOpt = examAnswers[q.id];
                    return (
                      <div key={q.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                        <span className="font-bold text-white">
                          {idx + 1}. {q.question}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedOpt === optIdx;
                            let style = 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600';
                            if (examSubmitted) {
                              if (optIdx === q.correctIndex) {
                                style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                              } else if (isChosen) {
                                style = 'bg-red-950/60 border-red-500 text-red-300';
                              }
                            } else if (isChosen) {
                              style = 'bg-emerald-900/40 border-emerald-500 text-white font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={examSubmitted}
                                onClick={() => handleSelectAnswer(q.id, optIdx)}
                                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${style}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {examSubmitted && (
                          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 mt-2">
                            <strong className="text-emerald-400">İzah:</strong> {q.explanation} (
                            <span className="text-slate-300">{q.legalCitation}</span>)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {!examSubmitted ? (
                    <button
                      onClick={() => setExamSubmitted(true)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
                    >
                      Cavabları Təsdiqlə və Qiymətləndir
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setExamAnswers({});
                        setExamSubmitted(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Yenidən Başla
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate_registry' && (
            <div className="space-y-6">
              {/* Generated Official Certificate Card */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-mono">RƏSMİ ELEKTRON HADİSƏ ŞƏHADƏTNAMƏSİ</span>
                      <h3 className="text-base font-bold text-white font-mono">{certificate.certificateId}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(certificate.certificateId, 'Sertifikat nömrəsi')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Kopyala
                    </button>
                    <button
                      onClick={simulatePrint}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1.5 font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Çap Et
                    </button>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Nəqliyyat Nömrəsi:</span>
                    <span className="font-bold text-white text-sm">{currentPlate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Qeydə Alınan Qovşaq:</span>
                    <span className="font-bold text-white">{selectedCamera.code} ({selectedCamera.picketKm})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dəhliz:</span>
                    <span className="font-bold text-white">{selectedCamera.corridor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hadisə Tipi:</span>
                    <span className="font-bold text-amber-300">{evaluation.violationTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Təhlükə / Ciddilik:</span>
                    <span className="font-bold text-red-400">{evaluation.collisionMetrics.severity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">TTC & MTTD:</span>
                    <span className="font-bold text-emerald-400">
                      TTC: {evaluation.collisionMetrics.timeToCollisionSec}s | MTTD: {evaluation.opticalMetrics.meanTimeToDetectSec}s
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SİMA Rəqəmsal İmza:</span>
                    <span className="font-mono text-emerald-400">{certificate.simaSignatureUid}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hadisə Jurnal Kodu:</span>
                    <span className="font-mono text-slate-300">{certificate.incidentLogReference}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Qəza Baryer Keçid PIN:</span>
                    <span className="font-mono font-bold text-amber-400">{certificate.barrierPIN}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2 font-mono">
                  <span>SHA-256: {certificate.sha256Digest}</span>
                  <span>Verililik Tarixi: {new Date().toLocaleDateString('az-AZ')}</span>
                </div>
              </div>

              {/* Public Unified Registry Search */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ListFilter className="w-4 h-4 text-emerald-400" />
                      Vahid Dövlət AID və Qəza Telemetriya Reyestri
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bütün qeydə alınmış hadisələrin və arayışların real vaxt axtarış və yoxlama bazası.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Nömrə, sertifikat və ya dəhliz..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-900/80 text-slate-400">
                        <th className="py-2.5 px-3">Sertifikat ID</th>
                        <th className="py-2.5 px-3">Dövlət Nömrəsi</th>
                        <th className="py-2.5 px-3">Kamera Qovşağı</th>
                        <th className="py-2.5 px-3">Hadisə Növü</th>
                        <th className="py-2.5 px-3">TTC</th>
                        <th className="py-2.5 px-3">Operator</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredRegistry.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{reg.certificateId}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-white">{reg.vehiclePlate}</td>
                          <td className="py-2.5 px-3 text-slate-300">{reg.cameraCode}</td>
                          <td className="py-2.5 px-3 text-amber-300">{reg.incidentType}</td>
                          <td className="py-2.5 px-3 text-slate-300">{reg.ttcSec} s</td>
                          <td className="py-2.5 px-3 text-slate-400">{reg.operator}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                reg.status === 'ACTIVE_RESOLVED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {reg.status}
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

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>AAYDA ITS & BDYP SCADA Rəsmi Şəbəkəsi</span>
          </div>
          <div className="flex items-center gap-3">
            {copySuccess && (
              <span className="text-emerald-400 font-semibold animate-pulse">{copySuccess} kopyalandı!</span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
