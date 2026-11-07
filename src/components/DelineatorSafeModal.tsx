import React, { useState, useId } from 'react';
import {
  X,
  Compass,
  Eye,
  Sliders,
  CheckCircle2,
  FileText,
  Search,
  Printer,
  Copy,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  Currency,
  DELINEATOR_SAFE_CURRENCY_SYMBOLS,
  convertDelineatorSafeCurrency,
  RetroreflectorClass,
  DelineatorPostType,
  DelineatorCorridorStation,
  evaluateDelineatorSafety,
  generateDelineatorCertificate,
  DelineatorPublicRecord,
} from '../utils/delineatorSafeCompliance';
import {
  MOCK_DELINEATOR_STATIONS,
  MOCK_DELINEATOR_VEHICLES,
  MOCK_DELINEATOR_CHECKLIST,
  MOCK_DELINEATOR_EXAM_QUESTIONS,
  MOCK_DELINEATOR_PUBLIC_RECORDS,
  DelineatorVehiclePreset,
} from '../data/mockDelineatorSafeData';

interface DelineatorSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'az' | 'en' | 'ru';
}

type TabType = 'radar' | 'simulator' | 'calculator' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const DelineatorSafeModal: React.FC<DelineatorSafeModalProps> = ({
  isOpen,
  onClose,
  language = 'az',
}) => {
  const curveRadiusSliderId = useId();
  const vehicleSpeedSliderId = useId();
  const headlightIntensitySliderId = useId();
  const visibilityMorSliderId = useId();
  const ambientLuxSliderId = useId();

  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');
  const [selectedStation, setSelectedStation] = useState<DelineatorCorridorStation>(MOCK_DELINEATOR_STATIONS[0]);
  const [radarSearch, setRadarSearch] = useState('');
  const [registrySearch, setRegistrySearch] = useState('');

  // Simulator Sliders State
  const [curveRadiusM, setCurveRadiusM] = useState<number>(MOCK_DELINEATOR_STATIONS[0].curveRadiusM);
  const [vehicleSpeedKmH, setVehicleSpeedKmH] = useState<number>(80);
  const [headlightIntensityCd, setHeadlightIntensityCd] = useState<number>(45000);
  const [visibilityMorM, setVisibilityMorM] = useState<number>(1500);
  const [ambientLux, setAmbientLux] = useState<number>(0.1);
  const [reflectorClass, setReflectorClass] = useState<RetroreflectorClass>('CLASS_R2');
  const [postType, setPostType] = useState<DelineatorPostType>('FLEXIBLE_POLYURETHANE');
  const [wheelStrikeSimulation, setWheelStrikeSimulation] = useState<boolean>(false);

  // Selected vehicle preset
  const [selectedVehicle, setSelectedVehicle] = useState<DelineatorVehiclePreset>(MOCK_DELINEATOR_VEHICLES[0]);
  const [vehiclePlate, setVehiclePlate] = useState<string>(MOCK_DELINEATOR_VEHICLES[0].plate);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'chk-cil-class': true,
    'chk-spacing-radius': true,
    'chk-transition-posts': true,
    'chk-color-coding': true,
    'chk-rebound-durability': true,
  });

  // Exam state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [issuedCertificate, setIssuedCertificate] = useState<{
    certificateNumber: string;
    issueDate: string;
    validUntil: string;
    simaUid: string;
    verificationPin: string;
    sha256Hash: string;
  } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Evaluation calculation
  const calcResult = evaluateDelineatorSafety({
    curveRadiusM,
    vehicleSpeedKmH,
    headlightIntensityCd,
    visibilityMorM,
    ambientLux,
    reflectorClass,
    postType,
    wheelStrikeSimulation,
  });

  const currSymbol = DELINEATOR_SAFE_CURRENCY_SYMBOLS[currency];

  const handleSelectStation = (station: DelineatorCorridorStation) => {
    setSelectedStation(station);
    setCurveRadiusM(station.curveRadiusM);
    setReflectorClass(station.reflectorClass);
    setPostType(station.postType);
    setActiveTab('simulator');
  };

  const handleSelectVehicle = (veh: DelineatorVehiclePreset) => {
    setSelectedVehicle(veh);
    setVehiclePlate(veh.plate);
    setVehicleSpeedKmH(veh.defaultSpeedKmH);
    setHeadlightIntensityCd(veh.headlightIntensityCd);
  };

  const playSynthesizedAlert = (freq = 880, durationMs = 180) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + durationMs / 1000);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleToggleStrike = () => {
    const nextState = !wheelStrikeSimulation;
    setWheelStrikeSimulation(nextState);
    if (nextState) {
      playSynthesizedAlert(520, 260);
    }
  };

  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllChecklist = () => {
    const all: Record<string, boolean> = {};
    MOCK_DELINEATOR_CHECKLIST.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedItems(all);
  };

  const handleExamOptionSelect = (qId: number, optIdx: number) => {
    if (examSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleQuickFillExam = () => {
    const answers: Record<number, number> = {};
    MOCK_DELINEATOR_EXAM_QUESTIONS.forEach((q) => {
      answers[q.id] = q.correctAnswer;
    });
    setUserAnswers(answers);
  };

  const handleGenerateCertificate = () => {
    const cert = generateDelineatorCertificate({
      corridorStation: selectedStation,
      vehiclePlate,
      postType,
      reflectorClass,
      calculationResult: calcResult,
    });
    setIssuedCertificate(cert);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const filteredStations = MOCK_DELINEATOR_STATIONS.filter(
    (s) =>
      s.nameAz.toLowerCase().includes(radarSearch.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(radarSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(radarSearch.toLowerCase()) ||
      s.routeNumber.toLowerCase().includes(radarSearch.toLowerCase())
  );

  const filteredRecords = MOCK_DELINEATOR_PUBLIC_RECORDS.filter(
    (r) =>
      r.certificateNumber.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.vehiclePlate.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.corridorNameAz.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.corridorNameEn.toLowerCase().includes(registrySearch.toLowerCase())
  );

  // Exam Score
  const examScore = MOCK_DELINEATOR_EXAM_QUESTIONS.reduce((score, q) => {
    return userAnswers[q.id] === q.correctAnswer ? score + 1 : score;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AAYDA • AYNA • BDYP
                </span>
                <span className="text-xs font-medium text-slate-400">EN 12899-3 / AZS 410</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                {language === 'az'
                  ? 'Bələdçi Sütuncuqlar və Optik Bələdçilik Portalı (DELINEATOR-SAFE-AZ-2026)'
                  : language === 'ru'
                  ? 'Дорожные сигнальные столбики и оптическая навигация (DELINEATOR-SAFE-AZ-2026)'
                  : 'Highway Delineator Posts & Night Optical Guidance (DELINEATOR-SAFE-AZ-2026)'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === c ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto scrollbar-none px-4">
          {[
            { id: 'radar', icon: Compass, labelAz: 'Radarlar & Dəhlizlər', labelEn: 'Corridors Radar', labelRu: 'Радар коридоров' },
            { id: 'simulator', icon: Sliders, labelAz: 'Optik Simulyator', labelEn: 'Optical Simulator', labelRu: 'Оптический симулятор' },
            { id: 'calculator', icon: Zap, labelAz: 'Nəqliyyat & İXM Cərimələri', labelEn: 'Vehicles & Penalties', labelRu: 'Транспорт и штрафы' },
            { id: 'checklist', icon: CheckCircle2, labelAz: '10-Bənd SCADA Standartı', labelEn: '10-Point Checklist', labelRu: '10-пунктный чек-лист' },
            { id: 'exam', icon: FileText, labelAz: 'Yol Qanunvericiliyi İmtahanı', labelEn: 'Safety Exam', labelRu: 'Экзамен по ПДД' },
            { id: 'certificate', icon: Sparkles, labelAz: 'Rəsmi Sertifikat', labelEn: 'Official Certificate', labelRu: 'Сертификат' },
            { id: 'registry', icon: Search, labelAz: 'Vahid Reyestr', labelEn: 'Public Registry', labelRu: 'Единый реестр' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  active
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{language === 'az' ? tab.labelAz : language === 'ru' ? tab.labelRu : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {language === 'az'
                      ? 'Respublika Magistral Yollarında Bələdçi Sütun Stansiyaları Radarı'
                      : language === 'ru'
                      ? 'Радар сигнальных столбиков автомагистралей Республики'
                      : 'State Highway Delineator & Curve Stations Radar'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'az'
                      ? 'EN 12899-3 standartına uyğun 6 strateji döngə dəhlizində real-vaxt oriyentasiya monitorinqi'
                      : language === 'ru'
                      ? 'Мониторинг оптической ориентации на 6 стратегических кривых по стандарту EN 12899-3'
                      : 'Real-time delineator guidance monitoring across 6 strategic horizontal curve corridors'}
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder={language === 'az' ? 'Dəhliz və ya nömrə axtar...' : 'Search corridors...'}
                    value={radarSearch}
                    onChange={(e) => setRadarSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((station) => {
                  const isSelected = selectedStation.id === station.id;
                  return (
                    <div
                      key={station.id}
                      onClick={() => handleSelectStation(station)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {station.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">{station.picketKm}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">
                          {language === 'az' ? station.nameAz : language === 'ru' ? station.nameRu : station.nameEn}
                        </h4>
                        <p className="text-xs text-slate-400 mb-3">{station.corridor}</p>

                        <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block">Döngə Radiusu:</span>
                            <span className="text-amber-400 font-bold">{station.curveRadiusM} m</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block">Sütun Addımı:</span>
                            <span className="text-emerald-400 font-bold">{station.nominalSpacingM} m</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block">Reflektor:</span>
                            <span className="text-slate-300 font-semibold">{station.reflectorClass}</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block">Qəza Azalması:</span>
                            <span className="text-green-400 font-bold">-{station.annualAccidentReductionPct}%</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStation(station);
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-700/60 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <span>{language === 'az' ? 'Optik Simulyatorda Aç' : 'Open in Simulator'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">Seçilmiş Strateji Dəhliz:</span>
                    <h4 className="text-sm font-bold text-white">
                      {language === 'az' ? selectedStation.nameAz : selectedStation.nameEn}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      calcResult.operationalStatus === 'OPTIMAL_OPTICAL_GUIDANCE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : calcResult.operationalStatus === 'FOG_RESTRICTED_PREVIEW'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {calcResult.operationalStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* 2D SVG Interactive Curve Visualizer */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Döngə Trayektoriyası və Bələdçi Sütunların İşıqqaytarması (2D SVG Stend)</span>
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono">
                    R = {curveRadiusM}m | S = {calcResult.recommendedSpacingM}m | v_safe = {calcResult.safeSpeedLimitKmH} km/h
                  </span>
                </div>

                <div className="relative w-full h-56 sm:h-64 bg-slate-900/90 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 700 240" className="w-full h-full">
                    <defs>
                      <linearGradient id="headlightGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
                        <stop offset="60%" stopColor="#fef08a" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
                      </linearGradient>
                      <radialGradient id="reflectorRedGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="reflectorWhiteGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Road Surface Curve */}
                    <path
                      d="M 20 200 Q 280 180, 480 80 T 680 40"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="60"
                      strokeLinecap="round"
                    />

                    {/* Traveled Way Pavement */}
                    <path
                      d="M 20 200 Q 280 180, 480 80 T 680 40"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="52"
                      strokeLinecap="round"
                    />

                    {/* Centerline Lane Markings */}
                    <path
                      d="M 20 200 Q 280 180, 480 80 T 680 40"
                      fill="none"
                      stroke="#f8fafc"
                      strokeWidth="2.5"
                      strokeDasharray="12,12"
                      strokeOpacity="0.7"
                    />

                    {/* Headlight Beam Cone from Vehicle */}
                    <polygon
                      points="120,200 420,130 380,240"
                      fill="url(#headlightGradient)"
                    />

                    {/* Delineator Posts on Outside Right Shoulder (Red Reflectors) */}
                    {[
                      { x: 100, y: 226 },
                      { x: 180, y: 216 },
                      { x: 260, y: 200 },
                      { x: 340, y: 172 },
                      { x: 420, y: 136 },
                      { x: 500, y: 92 },
                      { x: 580, y: 64 },
                      { x: 660, y: 46 },
                    ].map((pt, idx) => (
                      <g key={`right-del-${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                        {/* Post Body (white with black cap) */}
                        <rect x="-3" y="-18" width="6" height="18" fill="#f8fafc" rx="1.5" />
                        <rect x="-3" y="-18" width="6" height="4" fill="#0f172a" />
                        {/* Red Reflector */}
                        <circle cx="0" cy="-10" r="3" fill="#ef4444" />
                        <circle cx="0" cy="-10" r="7" fill="url(#reflectorRedGlow)" />
                      </g>
                    ))}

                    {/* Delineator Posts on Inside Left Shoulder (White Reflectors) */}
                    {[
                      { x: 120, y: 170 },
                      { x: 220, y: 154 },
                      { x: 320, y: 122 },
                      { x: 420, y: 80 },
                      { x: 520, y: 48 },
                      { x: 620, y: 24 },
                    ].map((pt, idx) => (
                      <g key={`left-del-${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                        <rect x="-2.5" y="-16" width="5" height="16" fill="#f8fafc" rx="1" />
                        <rect x="-2.5" y="-16" width="5" height="3" fill="#0f172a" />
                        {/* White Reflector */}
                        <circle cx="0" cy="-9" r="2.5" fill="#ffffff" />
                        <circle cx="0" cy="-9" r="6" fill="url(#reflectorWhiteGlow)" />
                      </g>
                    ))}

                    {/* Moving Vehicle Silhouette */}
                    <g transform="translate(100, 195) rotate(-10)">
                      <rect x="-20" y="-10" width="40" height="20" rx="6" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1.5" />
                      <circle cx="-12" cy="11" r="3.5" fill="#020617" />
                      <circle cx="12" cy="11" r="3.5" fill="#020617" />
                      <circle cx="-12" cy="-11" r="3.5" fill="#020617" />
                      <circle cx="12" cy="-11" r="3.5" fill="#020617" />
                      {/* Headlights */}
                      <circle cx="18" cy="-5" r="2.5" fill="#fef08a" />
                      <circle cx="18" cy="5" r="2.5" fill="#fef08a" />
                    </g>

                    {/* Knockdown Wheel Strike Indicator */}
                    {wheelStrikeSimulation && (
                      <g transform="translate(180, 216)">
                        <circle cx="0" cy="-5" r="14" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="3,3">
                          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <text x="18" y="-4" fill="#ef4444" fontSize="10" fontWeight="bold">
                          ZƏRBƏ / REBOUND 0.3s
                        </text>
                      </g>
                    )}

                    {/* HUD Telemetry in SVG */}
                    <text x="30" y="35" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                      D_PREVIEW = {calcResult.opticalPreviewDistanceM}m | t_prev = {calcResult.previewTimeSec}s
                    </text>
                    <text x="30" y="52" fill={calcResult.speedStatus === 'CRITICAL_OVERSPEED' ? '#ef4444' : '#10b981'} fontSize="11" fontFamily="monospace" fontWeight="bold">
                      SÜRƏT: {vehicleSpeedKmH} km/h (Limit: {calcResult.safeSpeedLimitKmH} km/h)
                    </text>
                  </svg>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Curve Radius */}
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor={curveRadiusSliderId} className="text-xs font-semibold text-slate-300">
                      Döngə Radiusu (R):
                    </label>
                    <span className="text-xs font-bold text-amber-400">{curveRadiusM} m</span>
                  </div>
                  <input
                    id={curveRadiusSliderId}
                    type="range"
                    min="30"
                    max="1000"
                    step="10"
                    value={curveRadiusM}
                    onChange={(e) => setCurveRadiusM(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>30m (Ağsu dar)</span>
                    <span>1000m (Geniş)</span>
                  </div>
                </div>

                {/* Vehicle Speed */}
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor={vehicleSpeedSliderId} className="text-xs font-semibold text-slate-300">
                      Avtomobil Sürəti:
                    </label>
                    <span className="text-xs font-bold text-amber-400">{vehicleSpeedKmH} km/h</span>
                  </div>
                  <input
                    id={vehicleSpeedSliderId}
                    type="range"
                    min="30"
                    max="140"
                    step="5"
                    value={vehicleSpeedKmH}
                    onChange={(e) => setVehicleSpeedKmH(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>30 km/h</span>
                    <span>140 km/h</span>
                  </div>
                </div>

                {/* Headlight Intensity */}
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor={headlightIntensitySliderId} className="text-xs font-semibold text-slate-300">
                      Faranın İşıq Şiddəti:
                    </label>
                    <span className="text-xs font-bold text-amber-400">{headlightIntensityCd} cd</span>
                  </div>
                  <input
                    id={headlightIntensitySliderId}
                    type="range"
                    min="15000"
                    max="90000"
                    step="5000"
                    value={headlightIntensityCd}
                    onChange={(e) => setHeadlightIntensityCd(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>15k (Halogen)</span>
                    <span>90k (Matrix Laser)</span>
                  </div>
                </div>

                {/* Meteorological Visibility MOR */}
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor={visibilityMorSliderId} className="text-xs font-semibold text-slate-300">
                      Görünüş Məsafəsi (MOR):
                    </label>
                    <span className="text-xs font-bold text-amber-400">{visibilityMorM} m</span>
                  </div>
                  <input
                    id={visibilityMorSliderId}
                    type="range"
                    min="50"
                    max="4000"
                    step="50"
                    value={visibilityMorM}
                    onChange={(e) => setVisibilityMorM(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>50m (Qatı duman)</span>
                    <span>4000m (Aydın)</span>
                  </div>
                </div>

                {/* Ambient Lux */}
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor={ambientLuxSliderId} className="text-xs font-semibold text-slate-300">
                      Ətraf İşıqlanma:
                    </label>
                    <span className="text-xs font-bold text-amber-400">{ambientLux} Lux</span>
                  </div>
                  <input
                    id={ambientLuxSliderId}
                    type="range"
                    min="0.01"
                    max="10.0"
                    step="0.1"
                    value={ambientLux}
                    onChange={(e) => setAmbientLux(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0.01 (Zülmət gecə)</span>
                    <span>10 Lux (Alatoran)</span>
                  </div>
                </div>

                {/* Reflector Class */}
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-300 mb-1.5 block">EN 12899-3 Reflektor Sinfi:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['CLASS_R1', 'CLASS_R2', 'CLASS_R3'] as RetroreflectorClass[]).map((rc) => (
                      <button
                        key={rc}
                        onClick={() => setReflectorClass(rc)}
                        className={`py-1 text-[11px] font-bold rounded transition-all ${
                          reflectorClass === rc
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {rc.replace('CLASS_', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Controls & Knockdown Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleToggleStrike}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center space-x-2 ${
                      wheelStrikeSimulation
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      {wheelStrikeSimulation
                        ? 'Təkər Zərbəsi Aktivdir (İXM 353.1)'
                        : 'Təkər Toqquşması & Bərpa Simulyasiyası'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setCurveRadiusM(selectedStation.curveRadiusM);
                      setVehicleSpeedKmH(80);
                      setHeadlightIntensityCd(45000);
                      setVisibilityMorM(1500);
                      setAmbientLux(0.1);
                      setReflectorClass('CLASS_R2');
                      setPostType('FLEXIBLE_POLYURETHANE');
                      setWheelStrikeSimulation(false);
                    }}
                    className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Parametrləri sıfırla"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleGenerateCertificate}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>DELINEATOR-SAFE Rəsmi Arayış Yarat</span>
                </button>
              </div>

              {/* Calculated Results Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-1">Tövsiyə Olunan Addım:</span>
                  <span className="text-lg font-extrabold text-amber-400">{calcResult.recommendedSpacingM} m</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">S = 3 * sqrt(R - 15)</span>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-1">Optik Önizləmə:</span>
                  <span className="text-lg font-extrabold text-emerald-400">{calcResult.opticalPreviewDistanceM} m</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">t_prev = {calcResult.previewTimeSec} s</span>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-1">Vizual Balı:</span>
                  <span className="text-lg font-extrabold text-blue-400">{calcResult.visualGuidanceScorePct}%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">CIL və kontrast</span>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-1">Zərbədən Bərpa:</span>
                  <span className="text-lg font-extrabold text-purple-400">{calcResult.reboundSurvivalScorePct}%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{calcResult.reboundRestorationTimeSec} s bərpa</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALCULATOR & VEHICLES */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Nəqliyyat Vasitələri Optik Kateqoriyaları və İXM Cərimə Məsuliyyəti
                </h3>
                <p className="text-xs text-slate-400">
                  İXM Maddə 327.1, 327.4, 328.2 və 353.1 üzrə inzibati cərimələr və Mülki Məcəllənin 1108-ci maddəsi üzrə ziyan kompensasiyası
                </p>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_DELINEATOR_VEHICLES.map((veh) => {
                  const isSelected = selectedVehicle.id === veh.id;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => handleSelectVehicle(veh)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-md'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{veh.name}</span>
                        <span className="px-2 py-0.5 bg-slate-900 text-amber-400 font-mono text-[11px] font-bold rounded border border-slate-700">
                          {veh.plate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        {language === 'az' ? veh.descriptionAz : language === 'ru' ? veh.descriptionRu : veh.descriptionEn}
                      </p>
                      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <span>Fara: {veh.headlightIntensityCd} cd</span>
                        <span className="font-semibold text-amber-400">Standart: {veh.defaultSpeedKmH} km/h</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sanctions Calculation Card */}
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Qanuni İnzibati Məsuliyyət və Ziyanın Kompensasiyası Hesabatı</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">İXM Cəriməsi (Əsas):</span>
                    <span className="text-lg font-bold text-rose-400">
                      {convertDelineatorSafeCurrency(calcResult.statutoryFineAzn, currency)} {currSymbol}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Cərimə balları: {calcResult.demeritPoints} bal
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">İXM 38 Güzəştli Məbləğ (30 gün):</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {convertDelineatorSafeCurrency(calcResult.statutoryFineDiscountedAzn, currency)} {currSymbol}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">50% qanuni endirimlə</span>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">AAYDA Yol Mebeli Bərpası:</span>
                    <span className="text-lg font-bold text-amber-400">
                      {convertDelineatorSafeCurrency(calcResult.civilRestitutionAzn, currency)} {currSymbol}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">MM 1108 kompensasiya</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300">
                    Yekun Ödənilməli Məbləğ (Cərimə + Bərpa):
                  </span>
                  <span className="text-base font-extrabold text-amber-400">
                    {convertDelineatorSafeCurrency(calcResult.totalLiabilityAzn, currency)} {currSymbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    10-Bəndlik Bələdçi Sütun Texniki və Quraşdırma SCADA Standartı
                  </h3>
                  <p className="text-xs text-slate-400">
                    EN 12899-3, AZS 410 və GOST 32843 texniki tələbləri üzrə rəsmi audit yoxlama siyahısı
                  </p>
                </div>
                <button
                  onClick={handleSelectAllChecklist}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all"
                >
                  Hamısını Təsdiqlə (10/10)
                </button>
              </div>

              <div className="space-y-2">
                {MOCK_DELINEATOR_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            [{item.code}] {language === 'az' ? item.titleAz : language === 'ru' ? item.titleRu : item.titleEn}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{item.standard}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isChecked
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {isChecked ? 'UYĞUNDUR' : 'YOXLAMA GÖZLƏYİR'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Bələdçi Sütunlar və Yol Hərəkəti Təhlükəsizliyi İmtahanı (10 Sual)
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və BDYP texniki normativləri və İXM maddələri üzrə nəzəriyyə testi
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleQuickFillExam}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
                  >
                    100% Avto-Doldur
                  </button>
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
                  >
                    İmtahanı Tamamla
                  </button>
                </div>
              </div>

              {examSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    examScore >= 8
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold">
                      İmtahan Nəticəsi: {examScore} / 10 Doğru Cavab ({examScore * 10}%)
                    </h4>
                    <p className="text-xs opacity-80">
                      {examScore >= 8
                        ? 'Təbriklər! Siz bələdçi sütunlar və döngə oriyentasiyası üzrə sertifikatlaşdırmanı uğurla keçdiniz.'
                        : 'Nəticə qeyri-kafidir. Standartlara uyğun olaraq keçid balı minimum 80%-dir.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setUserAnswers({});
                    }}
                    className="px-3 py-1 bg-slate-800 rounded text-xs font-semibold hover:bg-slate-700 text-white"
                  >
                    Yenidən Başla
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {MOCK_DELINEATOR_EXAM_QUESTIONS.map((q) => {
                  const answered = userAnswers[q.id] !== undefined;
                  const isCorrect = userAnswers[q.id] === q.correctAnswer;
                  return (
                    <div key={q.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-white">
                          {q.id}. {language === 'az' ? q.questionAz : language === 'ru' ? q.questionRu : q.questionEn}
                        </span>
                        {examSubmitted && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ml-2 whitespace-nowrap ${
                              isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {isCorrect ? 'DOĞRU' : 'SƏHV'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.optionsAz.map((opt, idx) => {
                          const isSelected = userAnswers[q.id] === idx;
                          let optStyle = 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300';
                          if (isSelected) {
                            optStyle = 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold';
                          }
                          if (examSubmitted) {
                            if (idx === q.correctAnswer) {
                              optStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold';
                            } else if (isSelected && !isCorrect) {
                              optStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-300';
                            }
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => handleExamOptionSelect(q.id, idx)}
                              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${optStyle}`}
                            >
                              <span className="font-mono text-slate-500 mr-1.5">
                                {String.fromCharCode(65 + idx)})
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                          <span className="text-amber-400 font-semibold">Qanuni Əsas: </span>
                          <span>{q.legalBasis}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-white">
                  Rəsmi DELINEATOR-SAFE-AZ-2026 Elektron Sertifikatı
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (!issuedCertificate) handleGenerateCertificate();
                      handleCopyCode(issuedCertificate?.certificateNumber || '', 'Seriya Kodu Kopyalandı!');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copyFeedback || 'Kopyala'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Certificate Template */}
              <div className="p-6 bg-slate-950 rounded-2xl border-2 border-amber-500/40 relative overflow-hidden shadow-2xl space-y-6">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Compass className="w-64 h-64 text-amber-400" />
                </div>

                {/* Cert Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-3 text-center sm:text-left">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
                      <Compass className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white tracking-wider">
                        AZƏRBAYCAN RESPUBLİKASI
                      </h4>
                      <p className="text-xs text-amber-400 font-semibold">
                        AAYDA • AYNA • BDYP BİRGƏ OPTİK ORIYENTASİYA KOMİSSİYASI
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        DELINEATOR-SAFE-AZ-2026 ELEKTRON TƏSDİQNAMƏSİ
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-400 block">Sənəd Nömrəsi:</span>
                    <span className="text-amber-400 font-bold text-sm">
                      {issuedCertificate?.certificateNumber || 'DELINEATOR-SAFE-AZ-2026-88142'}
                    </span>
                  </div>
                </div>

                {/* Cert Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Dəhliz:</span>
                    <span className="text-white font-bold">{selectedStation.routeNumber} ({selectedStation.picketKm})</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Döngə Radiusu:</span>
                    <span className="text-amber-400 font-bold">{curveRadiusM} metr</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Sütunlararası Addım:</span>
                    <span className="text-emerald-400 font-bold">{calcResult.recommendedSpacingM} metr</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Optik Önizləmə:</span>
                    <span className="text-blue-400 font-bold">{calcResult.opticalPreviewDistanceM} m ({calcResult.previewTimeSec} s)</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Qeydiyyat Nişanı:</span>
                    <span className="text-white font-bold">{vehiclePlate}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Təhlükəsiz Sürət:</span>
                    <span className="text-green-400 font-bold">{calcResult.safeSpeedLimitKmH} km/saat</span>
                  </div>
                </div>

                {/* Footer and Security Stamp */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
                  <div>
                    <span className="block font-mono text-slate-500">
                      SİMA UID: {issuedCertificate?.simaUid || 'SIMA-AAYDA-DEL-984A12B'}
                    </span>
                    <span className="block font-mono text-slate-500">
                      SHA256: {issuedCertificate?.sha256Hash.slice(0, 32) || 'a1b2c3d4e5f67890123456789abcdef0'}...
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-slate-500 block">Doğrulama PIN:</span>
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {issuedCertificate?.verificationPin || '684210'}
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-white p-1 rounded border border-slate-700 flex items-center justify-center">
                      <span className="text-[8px] text-slate-900 font-bold text-center">QR CODE VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Vahid İctimai Bələdçi Sütun və Qəza Qeydiyyat Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və BDYP bazasında qeydə alınmış rəsmi sertifikatlar və qəza arayışları
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder={language === 'az' ? 'Sertifikat və ya nömrə axtar...' : 'Search registry...'}
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/70 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-amber-400 font-mono">{record.certificateNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {record.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-0.5">
                        {language === 'az' ? record.corridorNameAz : record.corridorNameEn}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Nəqliyyat: <span className="text-slate-200 font-mono font-semibold">{record.vehiclePlate}</span> | Addım: {record.measuredSpacingM}m | Önizləmə: {record.previewTimeSec}s
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-xs">
                      <span className="text-emerald-400 font-bold">{record.complianceRatingPct}% Uyğunluq</span>
                      <span className="text-slate-500 text-[11px]">Etibarlıdır: {record.validUntil}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            © 2026 AAYDA • AYNA • BDYP | Magistral Yolların Bələdçi Sütun və Optik Təhlükəsizlik Sistemi
          </span>
          <span className="font-mono text-amber-500/80">EN 12899-3 • AZS 410 • İXM 327/353</span>
        </div>
      </div>
    </div>
  );
};
