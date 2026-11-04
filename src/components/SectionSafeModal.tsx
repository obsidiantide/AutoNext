import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Gauge,
  Sliders,
  Car,
  Volume2,
  Compass,
  ArrowRight,
  Radio,
  Zap,
  Info,
  Clock,
  Award,
} from 'lucide-react';
import {
  Currency,
  SectionZone,
  VehiclePreset,
  SectionCertificate,
  convertSectionCurrency,
  SECTION_CURRENCY_SYMBOLS,
  calculateSectionTelemetry,
  evaluateSectionChecklist,
  gradeSectionExam,
  generateSectionCertificate,
} from '../utils/sectionSafeCompliance';
import {
  MOCK_SECTION_ZONES,
  MOCK_SECTION_VEHICLES,
  MOCK_SECTION_CHECKLIST,
  MOCK_SECTION_EXAM,
  MOCK_SECTION_CERTIFICATES,
} from '../data/mockSectionSafeData';

interface SectionSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType =
  | 'radar'
  | 'simulator'
  | 'sanctions'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry'
  | 'about';

export const SectionSafeModal: React.FC<SectionSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedZone, setSelectedZone] = useState<SectionZone>(MOCK_SECTION_ZONES[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePreset>(MOCK_SECTION_VEHICLES[0]);

  // Simulator inputs
  const [transitTimeSec, setTransitTimeSec] = useState<number>(609); // Default ~10 min for Zone 1
  const [speedLimit, setSpeedLimit] = useState<number>(110);
  const [approachSpeed, setApproachSpeed] = useState<number>(110);
  const [trafficDensity, setTrafficDensity] = useState<number>(24);
  const [weatherCondition, setWeatherCondition] = useState<'OPTIMAL' | 'RAIN' | 'FOG' | 'SNOW'>('OPTIMAL');

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>(() =>
    MOCK_SECTION_CHECKLIST.map((item) => item.id)
  );

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [certPlate, setCertPlate] = useState<string>('99-SC-101');
  const [certModel, setCertModel] = useState<string>('Mercedes-Benz E 350d 4MATIC Sedan');
  const [generatedCert, setGeneratedCert] = useState<SectionCertificate>(MOCK_SECTION_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Public Registry
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryRecords, setRegistryRecords] = useState<SectionCertificate[]>(MOCK_SECTION_CERTIFICATES);

  // Sound synthesis state
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);

  // When selected zone changes, adapt initial transit time & speed limit
  const handleSelectZone = (zone: SectionZone) => {
    setSelectedZone(zone);
    setSpeedLimit(zone.speedLimitKmh);
    const nominalSeconds = Math.round((zone.distanceKm * 3600) / zone.speedLimitKmh);
    setTransitTimeSec(nominalSeconds);
  };

  // When vehicle preset changes
  const handleSelectVehicle = (veh: VehiclePreset) => {
    setSelectedVehicle(veh);
    setCertPlate(veh.plate);
    setCertModel(veh.model);

    // Set transit time to match default violation if specified
    const nominalSec = Math.round((selectedZone.distanceKm * 3600) / speedLimit);
    if (veh.defaultViolation === 'SPEEDING_10_20') {
      const targetSpeed = speedLimit + 14;
      setTransitTimeSec(Math.round((selectedZone.distanceKm * 3600) / targetSpeed));
    } else if (veh.defaultViolation === 'SPEEDING_20_40') {
      const targetSpeed = speedLimit + 28;
      setTransitTimeSec(Math.round((selectedZone.distanceKm * 3600) / targetSpeed));
    } else if (veh.defaultViolation === 'SPEEDING_40_60') {
      const targetSpeed = speedLimit + 48;
      setTransitTimeSec(Math.round((selectedZone.distanceKm * 3600) / targetSpeed));
    } else if (veh.defaultViolation === 'SPEEDING_OVER_60') {
      const targetSpeed = speedLimit + 70;
      setTransitTimeSec(Math.round((selectedZone.distanceKm * 3600) / targetSpeed));
    } else {
      setTransitTimeSec(nominalSec + 15); // safe margin
    }
  };

  // Telemetry calculation
  const telemetry = useMemo(() => {
    return calculateSectionTelemetry({
      zoneDistanceKm: selectedZone.distanceKm,
      speedLimitKmh: speedLimit,
      transitTimeSeconds: transitTimeSec,
      vehicleApproachSpeedKmh: approachSpeed,
      trafficDensityVehKm: trafficDensity,
      weatherCondition,
    });
  }, [selectedZone.distanceKm, speedLimit, transitTimeSec, approachSpeed, trafficDensity, weatherCondition]);

  // Checklist evaluation
  const checklistResult = useMemo(() => {
    return evaluateSectionChecklist(checkedItems, MOCK_SECTION_CHECKLIST);
  }, [checkedItems]);

  // Exam grading
  const examResult = useMemo(() => {
    return gradeSectionExam(examAnswers, MOCK_SECTION_EXAM);
  }, [examAnswers]);

  // Audio synthesis
  const playScadaWarningSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
      setAudioPlayed(true);
      setTimeout(() => setAudioPlayed(false), 800);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleToggleCheckItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCheckAll = () => {
    setCheckedItems(MOCK_SECTION_CHECKLIST.map((item) => item.id));
  };

  const handleResetChecklist = () => {
    setCheckedItems([]);
  };

  const handleAnswerExam = (questionId: string, optionIndex: number) => {
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGenerateCertificate = () => {
    const cert = generateSectionCertificate({
      vehiclePlate: certPlate,
      vehicleModel: certModel,
      corridorCode: selectedZone.code,
      zoneNameAz: selectedZone.nameAz,
      distanceKm: selectedZone.distanceKm,
      speedLimitKmh: speedLimit,
      transitTimeSeconds: transitTimeSec,
      rawSpeedKmh: telemetry.rawAverageSpeedKmh,
      netSpeedKmh: telemetry.netSpeedKmh,
      fineAzn: telemetry.fineAzn,
      status: telemetry.fineAzn > 0 ? 'CITATION_ISSUED' : 'CLEARED',
    });
    setGeneratedCert(cert);
    setRegistryRecords((prev) => [cert, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredRegistry = useMemo(() => {
    if (!registrySearch.trim()) return registryRecords;
    const q = registrySearch.toLowerCase();
    return registryRecords.filter(
      (r) =>
        r.vehiclePlate.toLowerCase().includes(q) ||
        r.certificateCode.toLowerCase().includes(q) ||
        r.corridorCode.toLowerCase().includes(q) ||
        r.zoneNameAz.toLowerCase().includes(q)
    );
  }, [registryRecords, registrySearch]);

  if (!isOpen) return null;

  const currencySymbol = SECTION_CURRENCY_SYMBOLS[currency] || '₼';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-modal-title"
      data-testid="section-safe-modal"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AAYDA • AYNA • BDYP RƏSMİ
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  OIML R 91 / İXM MADDƏ 328
                </span>
              </div>
              <h2 id="section-modal-title" className="text-base sm:text-lg font-bold text-white">
                Magistral Section Control (Point-to-Point Ortalama Sürət) Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <button
              onClick={playScadaWarningSound}
              className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 ${
                audioPlayed
                  ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="SCADA Şəbəkə Siqnalını Yoxla"
            >
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Siqnal</span>
            </button>
            <button
              onClick={onClose}
              data-testid="section-safe-close-btn"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Bağla"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 px-4 py-2 scrollbar-none gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="section-tab-radar"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'radar'
                ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Məsafə Radarı</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            data-testid="section-tab-simulator"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'simulator'
                ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>SCADA Stendi</span>
          </button>
          <button
            onClick={() => setActiveTab('sanctions')}
            data-testid="section-tab-sanctions"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'sanctions'
                ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Car className="h-4 w-4" />
            <span>Avtomobillər və İXM</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="section-tab-checklist"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'checklist'
                ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>10-Bənd Standart</span>
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            data-testid="section-tab-exam"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'exam'
                ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>İmtahan Simulyatoru</span>
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="section-tab-certificate"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'certificate'
                ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>E-Sertifikat</span>
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            data-testid="section-tab-registry"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'registry'
                ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Dövlət Reyestri</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            data-testid="section-tab-about"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'about'
                ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Info className="h-4 w-4" />
            <span>Hüquqi Əsas</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/50">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6" data-testid="section-radar-tab">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                    <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                    Azərbaycan Magistrallarında Məsafə Üzrə Ortalama Sürət Dəhlizləri
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Giriş və çıxış ANPR qantry portalları vasitəsilə yüksəksürətli foto-qeydiyyat və atom saatları ilə dəqiq xronometriya.
                  </p>
                </div>
                <div className="text-xs text-right">
                  <span className="text-slate-400">Aktiv Məntəqələr: </span>
                  <span className="font-bold text-emerald-400">{MOCK_SECTION_ZONES.length} Dəhliz</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_SECTION_ZONES.map((zone) => {
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <div
                      key={zone.id}
                      data-testid={`section-zone-card-${zone.id}`}
                      onClick={() => handleSelectZone(zone)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-emerald-500 bg-slate-800/90 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-700/80 text-emerald-300">
                          {zone.code}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            zone.alertLevel === 'NORMAL'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {zone.alertLevel === 'NORMAL' ? 'Normal Axın' : 'Gərgin Axın'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                        {zone.nameAz}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mb-3">{zone.corridor}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                        <div>
                          <span className="text-slate-500 block text-[10px]">MƏSAFƏ</span>
                          <span className="font-semibold text-white">{zone.distanceKm} km</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">SÜRƏT HƏDDİ</span>
                          <span className="font-semibold text-emerald-400">{zone.speedLimitKmh} km/saat</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">GİRİŞ - ÇIXIŞ</span>
                          <span className="font-medium text-slate-300 text-[11px] truncate block">
                            {zone.entryPicketKm} → {zone.exitPicketKm}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">ANPR DƏQİQLİK</span>
                          <span className="font-semibold text-teal-300">{zone.anprAccuracyPercent}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-slate-400">
                          NTP Sinx: ±{zone.gpsNtpOffsetMs} ms
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectZone(zone);
                            setActiveTab('simulator');
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          <span>Stendə Keç</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SCADA SIMULATOR STAND */}
          {activeTab === 'simulator' && (
            <div className="space-y-6" data-testid="section-simulator-tab">
              {/* Selected Zone Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-950/30 border border-emerald-500/30 p-3 sm:p-4 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {selectedZone.code}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {selectedZone.nameAz}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Məsafə: <strong className="text-emerald-300">{selectedZone.distanceKm} km</strong> | 
                    Giriş: <strong className="text-slate-200">{selectedZone.entryPicketKm}</strong> | 
                    Çıxış: <strong className="text-slate-200">{selectedZone.exitPicketKm}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('radar')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    Dəhlizi Dəyiş
                  </button>
                  <button
                    onClick={handleGenerateCertificate}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-600/20"
                  >
                    E-Sertifikat Yarat
                  </button>
                </div>
              </div>

              {/* 2D SVG Perspective Section Control Highway Canvas */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span>Real-Time Traektoriya və ANPR Xronometriyası (OIML R 91 SCADA)</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    NTP Stratum-1: ±0.3ms
                  </span>
                </div>

                <div className="w-full h-44 sm:h-52 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-lg relative overflow-hidden border border-slate-800/80 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    {/* Sky / Horizon */}
                    <line x1="0" y1="50" x2="800" y2="50" stroke="#1e293b" strokeWidth="1" />

                    {/* Highway Road Surface */}
                    <polygon points="50,190 750,190 650,60 150,60" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

                    {/* Road Markings - Dividing Lines */}
                    <line x1="400" y1="60" x2="400" y2="190" stroke="#facc15" strokeWidth="2" strokeDasharray="12 8" />
                    <line x1="275" y1="60" x2="225" y2="190" stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.6" />
                    <line x1="525" y1="60" x2="575" y2="190" stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.6" />

                    {/* Entry Gantry (Km entry) */}
                    <g transform="translate(140, 30)">
                      <rect x="0" y="0" width="12" height="150" fill="#475569" rx="2" />
                      <rect x="0" y="0" width="140" height="10" fill="#334155" rx="2" />
                      <circle cx="20" cy="15" r="4" fill="#06b6d4" />
                      <circle cx="50" cy="15" r="4" fill="#10b981" />
                      <circle cx="80" cy="15" r="4" fill="#10b981" />
                      <circle cx="110" cy="15" r="4" fill="#06b6d4" />
                      <text x="5" y="-5" fill="#38bdf8" fontSize="10" fontWeight="bold">GİRİŞ QANTRY (t_entry)</text>
                      {/* Laser scanning cone */}
                      <polygon points="20,15 50,130 5,130" fill="rgba(6,182,212,0.15)" />
                    </g>

                    {/* Exit Gantry (Km exit) */}
                    <g transform="translate(540, 30)">
                      <rect x="128" y="0" width="12" height="150" fill="#475569" rx="2" />
                      <rect x="0" y="0" width="140" height="10" fill="#334155" rx="2" />
                      <circle cx="30" cy="15" r="4" fill="#10b981" />
                      <circle cx="60" cy="15" r="4" fill="#10b981" />
                      <circle cx="90" cy="15" r="4" fill="#06b6d4" />
                      <circle cx="120" cy="15" r="4" fill="#06b6d4" />
                      <text x="25" y="-5" fill="#34d399" fontSize="10" fontWeight="bold">ÇIXIŞ QANTRY (t_exit)</text>
                      {/* Exit laser cone */}
                      <polygon points="120,15 150,130 90,130" fill="rgba(52,211,153,0.15)" />
                    </g>

                    {/* Moving Vehicle Silhouette */}
                    <g transform="translate(360, 115)">
                      <rect x="0" y="8" width="80" height="26" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                      <polygon points="15,8 28,-4 58,-4 68,8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                      <circle cx="18" cy="34" r="8" fill="#334155" />
                      <circle cx="62" cy="34" r="8" fill="#334155" />
                      <circle cx="18" cy="34" r="4" fill="#94a3b8" />
                      <circle cx="62" cy="34" r="4" fill="#94a3b8" />
                      {/* Headlights beam */}
                      <polygon points="75,18 160,8 160,34" fill="rgba(250,204,21,0.2)" />
                      {/* Plate banner */}
                      <rect x="15" y="14" width="50" height="12" rx="2" fill="#0284c7" />
                      <text x="20" y="23" fill="#ffffff" fontSize="8" fontWeight="bold">{selectedVehicle.plate}</text>
                    </g>

                    {/* Speed indicator HUD in SVG */}
                    <rect x="330" y="10" width="140" height="34" rx="6" fill="rgba(15,23,42,0.9)" stroke={telemetry.excessSpeedKmh > 0 ? '#ef4444' : '#10b981'} strokeWidth="1.5" />
                    <text x="340" y="25" fill="#94a3b8" fontSize="9">ORTALAMA SÜRƏT</text>
                    <text x="340" y="38" fill={telemetry.excessSpeedKmh > 0 ? '#f87171' : '#34d399'} fontSize="13" fontWeight="bold">
                      {telemetry.netSpeedKmh} km/h (Net)
                    </text>
                  </svg>
                </div>
              </div>

              {/* Sliders and Telemetry Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Control Sliders */}
                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-emerald-400" />
                    <span>Dəhliz və Sürət Parametrləri</span>
                  </h4>

                  {/* Transit Time Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Keçid Müddəti (t_transit):</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {transitTimeSec} saniyə ({Math.floor(transitTimeSec / 60)} dəq {transitTimeSec % 60} san)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={Math.max(60, Math.round((selectedZone.distanceKm * 3600) / 220))}
                      max={Math.round((selectedZone.distanceKm * 3600) / 40)}
                      step="5"
                      value={transitTimeSec}
                      onChange={(e) => setTransitTimeSec(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>Yüksək Sürət (Qısa Vaxt)</span>
                      <span>Qanuni Limit: {telemetry.minLegalTimeSeconds} san</span>
                      <span>Sakit Axın</span>
                    </div>
                  </div>

                  {/* Speed Limit Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Qanuni Sürət Həddi (v_limit):</span>
                      <span className="font-mono font-bold text-white">{speedLimit} km/saat</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="130"
                      step="10"
                      value={speedLimit}
                      onChange={(e) => setSpeedLimit(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Approach Speed */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Yanaşma Sürəti (v_approach):</span>
                      <span className="font-mono font-bold text-slate-300">{approachSpeed} km/saat</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="160"
                      step="5"
                      value={approachSpeed}
                      onChange={(e) => setApproachSpeed(Number(e.target.value))}
                      className="w-full accent-slate-400 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Weather Condition Buttons */}
                  <div>
                    <span className="text-xs text-slate-300 font-medium block mb-1.5">Hava Şəraiti:</span>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {[
                        { id: 'OPTIMAL', label: 'Açıq/Quru' },
                        { id: 'RAIN', label: 'Yağışlı' },
                        { id: 'FOG', label: 'Dumanlı' },
                        { id: 'SNOW', label: 'Qarlı/Buzlu' },
                      ].map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setWeatherCondition(w.id as any)}
                          className={`py-1.5 px-2 rounded-lg text-center font-medium transition-colors ${
                            weatherCondition === w.id
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Output Telemetry Gauge & Cards */}
                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl flex flex-col justify-between space-y-4">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-emerald-400" />
                      Metroloji Hesablama və OIML R 91
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        telemetry.complianceStatus === 'COMPLIANT'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : telemetry.complianceStatus === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {telemetry.complianceStatus === 'COMPLIANT'
                        ? 'QANUNAUYĞUN'
                        : telemetry.complianceStatus === 'WARNING'
                        ? 'XƏBƏRDARLIQ (0-10 KM)'
                        : 'SÜRƏT HƏDDİ AŞILIB'}
                    </span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">XAM ORTALAMA SÜRƏT</span>
                      <span className="text-base sm:text-lg font-mono font-bold text-white">
                        {telemetry.rawAverageSpeedKmh} <span className="text-xs font-normal">km/s</span>
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">OIML XƏTA PAYI</span>
                      <span className="text-base sm:text-lg font-mono font-bold text-teal-400">
                        -{telemetry.toleranceDeductionKmh} <span className="text-xs font-normal">km/s</span>
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">QANUNİ NET SÜRƏT</span>
                      <span
                        className={`text-base sm:text-lg font-mono font-bold ${
                          telemetry.excessSpeedKmh > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {telemetry.netSpeedKmh} <span className="text-xs font-normal">km/s</span>
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">VAXT DEFİSİTİ</span>
                      <span className="text-base sm:text-lg font-mono font-bold text-amber-300">
                        {telemetry.timeDeficitSeconds > 0 ? `-${telemetry.timeDeficitSeconds} san` : '0 san'}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">ŞOK DALĞA BOĞULMASI</span>
                      <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">
                        +{telemetry.shockwaveDampingRatio}%
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">QƏZA RİSKİNİN AZALMASI</span>
                      <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">
                        -{telemetry.crashRiskReductionPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Ecological & Penalty summary */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Yanacaq Qənaəti (Kəskin əyləcsiz):</span>
                      <strong className="text-emerald-400">+{telemetry.fuelSavedLiters} L / transit</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>CO2 Emissiya Azalması:</span>
                      <strong className="text-teal-400">-{telemetry.co2SavedKg} kq CO2</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                      <span>Tətbiq Edilən İXM Maddəsi:</span>
                      <strong className="text-white">{telemetry.legalArticleAz}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SANCTIONS & VEHICLES */}
          {activeTab === 'sanctions' && (
            <div className="space-y-6" data-testid="section-sanctions-tab">
              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4 text-emerald-400" />
                  Nəqliyyat Vasitələri Presets və İXM Maddə 328 Sanksiyaları
                </h3>
                <p className="text-xs text-slate-400">
                  Avtomobil modelini seçərək sürət həddi aşmaları, təyin olunan cərimə balı və İXM Maddə 38 üzrə 50% endirimli ödəmə şərtlərini yoxlayın.
                </p>
              </div>

              {/* Vehicle Preset Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_SECTION_VEHICLES.map((veh) => {
                  const isSelected = selectedVehicle.id === veh.id;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => handleSelectVehicle(veh)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-slate-800/90 shadow-md shadow-emerald-500/10'
                          : 'border-slate-800 bg-slate-800/30 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                          {veh.plate}
                        </span>
                        <span className="text-[10px] text-slate-400">{veh.classType}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white line-clamp-1">{veh.model}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{veh.driverCategory}</p>

                      <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-700/60">
                        <span className="text-[11px] text-slate-400">Yanacaq: {veh.baselineFuelBurnL100km} L/100km</span>
                        <span className="text-xs font-semibold text-emerald-400">
                          {isSelected ? 'Seçilib' : 'Seç'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Statutory Fines Matrix */}
              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                <h4 className="text-xs sm:text-sm font-bold text-white mb-3">
                  İnzibati Xətalar Məcəlləsi (İXM Maddə 328) Sürət Həddi Cədvəli
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Sürət Aşma Həddi</th>
                        <th className="py-2.5 px-3">Maddə</th>
                        <th className="py-2.5 px-3">Cərimə (Standart)</th>
                        <th className="py-2.5 px-3">50% Endirim (İXM 38)</th>
                        <th className="py-2.5 px-3">Cərimə Balı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium text-white">0.1 - 9.9 km/saat</td>
                        <td className="py-2.5 px-3 text-slate-400">Qanuni güzəşt marjası</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">0 {currencySymbol}</td>
                        <td className="py-2.5 px-3 text-slate-400">-</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-400">0 Bal</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium text-white">10 - 20 km/saat</td>
                        <td className="py-2.5 px-3 text-slate-400">İXM Maddə 328.1</td>
                        <td className="py-2.5 px-3 font-semibold text-amber-300">
                          {convertSectionCurrency(20, currency)} {currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">
                          {convertSectionCurrency(10, currency)} {currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-400">0 Bal</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium text-white">20 - 40 km/saat</td>
                        <td className="py-2.5 px-3 text-slate-400">İXM Maddə 328.2</td>
                        <td className="py-2.5 px-3 font-semibold text-amber-400">
                          {convertSectionCurrency(50, currency)} {currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">
                          {convertSectionCurrency(25, currency)} {currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-amber-400">2 Bal</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium text-white">40 - 60 km/saat</td>
                        <td className="py-2.5 px-3 text-slate-400">İXM Maddə 328.3</td>
                        <td className="py-2.5 px-3 font-semibold text-rose-400">
                          {convertSectionCurrency(100, currency)} {currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">
                          {convertSectionCurrency(50, currency)} {currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-rose-400">3 Bal</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium text-white">&gt; 60 km/saat</td>
                        <td className="py-2.5 px-3 text-slate-400">İXM Maddə 328.4</td>
                        <td className="py-2.5 px-3 font-semibold text-rose-500">
                          {convertSectionCurrency(250, currency)} {currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">
                          {convertSectionCurrency(125, currency)} {currencySymbol}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-rose-500">4 Bal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="section-checklist-tab">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    10-Bəndlik OIML R 91 və Section Control Texniki Standartı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Bölmə nəzarəti sistemlərinin qanuniliyi, metroloji kalibrasiyası və ANPR dəqiqliyi üzrə dövlət tələbləri.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckAll}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300">Uyğunluq Səviyyəsi:</span>
                  <span className="font-bold text-emerald-400">
                    {checklistResult.checkedCount} / {checklistResult.totalCount} ({checklistResult.scorePercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistResult.passed ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${checklistResult.scorePercent}%` }}
                  />
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-3">
                {MOCK_SECTION_CHECKLIST.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheckItem(item.id)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-emerald-500/50 bg-slate-800/80'
                          : 'border-slate-800 bg-slate-800/20 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-600 bg-slate-800 text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-white">
                            {item.titleAz}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                            {item.standard}
                          </span>
                          {item.mandatory && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              MƏCBURİ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.descriptionAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="section-exam-tab">
              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    10-Suallıq Ortalama Sürət və İXM Qanunvericiliyi İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Section Control, OIML R 91 standartı, İXM 328 sanksiyaları və təhlükəsiz sürücülük prinsipləri üzrə bilik testi.
                  </p>
                </div>
                {examSubmitted && (
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      examResult.passed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    Nəticə: {examResult.score} / {examResult.total} ({examResult.percentage}%) -{' '}
                    {examResult.passed ? 'MÜVƏFFƏQİYYƏTLİ' : 'KƏSİLDİ'}
                  </div>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {MOCK_SECTION_EXAM.map((q, idx) => {
                  const userAnswer = examAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                          {q.questionAz}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = userAnswer === optIdx;
                          let btnStyle = 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600';
                          if (examSubmitted) {
                            if (optIdx === q.correctAnswer) {
                              btnStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-semibold';
                            } else if (isOptionSelected) {
                              btnStyle = 'border-rose-500 bg-rose-950/60 text-rose-300';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'border-emerald-500 bg-emerald-900/40 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => !examSubmitted && handleAnswerExam(q.id, optIdx)}
                              className={`p-2.5 rounded-lg border text-left transition-colors ${btnStyle}`}
                            >
                              <span className="font-mono text-slate-400 mr-1.5 font-bold">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div
                          className={`text-xs p-2.5 rounded-lg border leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950/40 text-rose-300 border-rose-800'
                          }`}
                        >
                          <strong>İzah:</strong> {q.explanationAz} ({q.legalCitation})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit or Reset Exam */}
              <div className="flex justify-end gap-2 pt-2">
                {examSubmitted ? (
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Yenidən İmtahan Ver</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20"
                  >
                    İmtahanı Tamamla və Qiymətləndir
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="section-certificate-tab">
              <div className="flex justify-between items-center bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Rəsmi SECTION-SAFE-AZ-2026 Elektron Sertifikat
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AAYDA, AYNA və BDYP tərəfindən təsdiq olunmuş kriptoqrafik tranzit və sürət uyğunluğu talonı.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Çap Et</span>
                  </button>
                  <button
                    onClick={() => handleCopyCode(generatedCert.certificateCode)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                  </button>
                </div>
              </div>

              {/* Printable Certificate Frame */}
              <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                        AZƏRBAYCAN RESPUBLİKASI DÖVLƏT SƏRƏNCAMI
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        SECTION-SAFE-AZ-2026 SERTİFİKATI
                      </h2>
                      <span className="text-xs text-slate-400">
                        AAYDA / AYNA / BDYP Vahid Tranzit və Sürət Portalı
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {generatedCert.certificateCode}
                    </span>
                    <span
                      className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        generatedCert.status === 'CLEARED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {generatedCert.status === 'CLEARED' ? 'QANUNAUYĞUN / TƏMİZ' : 'İXM PROTOKOL TƏRTİB EDİLİB'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-xs">
                  <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-2">
                      Nəqliyyat və Tranzit Məlumatları
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Qeydiyyat Nişanı:</span>
                      <strong className="font-mono text-emerald-400">{generatedCert.vehiclePlate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nəqliyyat Modeli:</span>
                      <strong className="text-white">{generatedCert.vehicleModel}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nəzarət Dəhlizi:</span>
                      <strong className="text-white truncate max-w-[200px]">{generatedCert.zoneNameAz}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dəhliz Kodu:</span>
                      <strong className="font-mono text-slate-300">{generatedCert.corridorCode}</strong>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-2">
                      Metroloji Sürət və Xronometriya
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dəhliz Uzunluğu:</span>
                      <strong className="text-white">{generatedCert.distanceKm} km</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Faktiki Keçid Vaxtı:</span>
                      <strong className="text-white">{generatedCert.transitTimeSeconds} saniyə</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Xam Ortalama Sürət:</span>
                      <strong className="text-teal-400">{generatedCert.rawSpeedKmh} km/saat</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Qanuni Net Sürət:</span>
                      <strong
                        className={generatedCert.netSpeedKmh > generatedCert.speedLimitKmh ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}
                      >
                        {generatedCert.netSpeedKmh} km/saat
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer security stamp */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-3">
                  <div>
                    <span className="block font-mono text-[10px] text-slate-500">
                      SİMA İMZA: {generatedCert.simaSignatureUid}
                    </span>
                    <span className="block font-mono text-[10px] text-slate-500 truncate max-w-sm">
                      SHA-256: {generatedCert.sha256Checksum}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-300">PIN: </span>
                    <strong className="font-mono text-emerald-400">{generatedCert.barrierPassPin}</strong>
                    <span className="block text-[10px] text-slate-500">Tarix: {generatedCert.issueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="section-registry-tab">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Vahid Dövlət Section Control Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Qeydiyyatdan keçmiş nəqliyyat vasitələrinin ortalama sürət sertifikatları və cərimə protokollarının bazası.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nömrə və ya kod axtar..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Records Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Sertifikat Kodu</th>
                        <th className="py-2.5 px-3">Qeydiyyat Nişanı</th>
                        <th className="py-2.5 px-3">Dəhliz</th>
                        <th className="py-2.5 px-3">Net Sürət</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Tarix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {filteredRegistry.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                            {rec.certificateCode}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-white">
                            {rec.vehiclePlate}
                          </td>
                          <td className="py-2.5 px-3 truncate max-w-[200px] text-slate-300">
                            {rec.zoneNameAz}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold">
                            {rec.netSpeedKmh} km/saat
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                rec.status === 'CLEARED'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {rec.status === 'CLEARED' ? 'TƏMİZ' : 'PROTOKOL'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">{rec.issueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6" data-testid="section-about-tab">
              <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                <h3 className="text-sm sm:text-base font-bold text-white mb-2">
                  Hüquqi Əsaslar və Standartlar
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bölmə Nəzarəti (Section Control / Point-to-Point) sistemi Azərbaycan Respublikasının qanunvericiliyinə və beynəlxalq metroloji standartlara tam uyğun fəaliyyət göstərir.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-800/30 border border-slate-800 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    İXM Maddə 328 və Maddə 38
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Müəyyən edilmiş hərəkət sürəti həddinin aşılmasına görə diferensial cərimə sanksiyaları və qanuni qüvvəyə mindiyi gündən 30 gün ərzində 50 faiz endirimlə ödəmə təminatı.
                  </p>
                </div>

                <div className="bg-slate-800/30 border border-slate-800 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    OIML R 91 və AZS 410 Metrologiyası
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Sürət ölçmə cihazlarında vətəndaşın xeyrinə 100 km/saatadək 3 km/saat, 100 km/saatdan yuxarı isə 3% metroloji xəta payının avtomatik çıxılması.
                  </p>
                </div>

                <div className="bg-slate-800/30 border border-slate-800 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Activity className="h-4 w-4" />
                    Şok Dalğası və Qəza Profilaktikası
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Nöqtəvi radar qarşısında kəskin əyləcləmənin (kangaroo effect) aradan qaldırılması və Elvik güc modeli ilə ağır yol-nəqliyyat hadisələrinin 45%-dək azaldılması.
                  </p>
                </div>

                <div className="bg-slate-800/30 border border-slate-800 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    NTP Stratum-1 və Kriptoqrafiya
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Bütün foto-qeydiyyat gantry portalları atom saatları ilə 1 millisaniyədən az fərqlə sinxronlaşdırılır və SHA-256 heş zənciri ilə təhlükəsiz qorunur.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AAYDA / AYNA / BDYP Birgə İnformasiya Portalı • 2026</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionSafeModal;
