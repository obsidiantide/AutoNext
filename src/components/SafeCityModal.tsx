import React, { useState, useMemo } from 'react';
import {
  X,
  Video,
  Shield,
  Gauge,
  Radio,
  Clock,
  MapPin,
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Copy,
  Sparkles,
  RotateCcw,
  Info,
  ChevronRight,
  ShieldCheck,
  Search,
  Zap,
  Activity,
  Car,
  Layers,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  TrafficCorridor,
  LevelOfService,
  IncidentDispatch,
  SafeCityCertificate,
  AnprDetection,
  convertCurrency,
  formatCurrency,
  formatAzerbaijanPlate,
  getLosDetails,
  calculateAnprFines,
  calculateGreenWaveSync,
  generateSafeCityCertificate,
} from '../utils/safeCityCompliance';
import {
  MOCK_TRAFFIC_CORRIDORS,
  MOCK_ANPR_PRESETS,
  MOCK_INCIDENT_DISPATCHES,
  MOCK_SAFE_CITY_CERTIFICATES,
  MOCK_EXAM_QUESTIONS,
} from '../data/mockSafeCityData';

interface SafeCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialVehicle?: Vehicle | null;
}

type TabType = 'corridors' | 'anpr' | 'greenwave' | 'incidents' | 'exam' | 'certificate' | 'registry';

export const SafeCityModal: React.FC<SafeCityModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('corridors');

  // Selected Corridor State
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('corridor-1');
  const [corridorSearchQuery, setCorridorSearchQuery] = useState<string>('');

  const selectedCorridor = useMemo<TrafficCorridor>(() => {
    return (
      MOCK_TRAFFIC_CORRIDORS.find((c) => c.id === selectedCorridorId) ||
      MOCK_TRAFFIC_CORRIDORS[0]
    );
  }, [selectedCorridorId]);

  const filteredCorridors = useMemo(() => {
    if (!corridorSearchQuery.trim()) return MOCK_TRAFFIC_CORRIDORS;
    const q = corridorSearchQuery.toLowerCase();
    return MOCK_TRAFFIC_CORRIDORS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.vmsAlert.toLowerCase().includes(q)
    );
  }, [corridorSearchQuery]);

  // ANPR Telemetry State
  const [selectedAnprPresetIndex, setSelectedAnprPresetIndex] = useState<number>(0);
  const currentAnprPreset = MOCK_ANPR_PRESETS[selectedAnprPresetIndex];

  const [anprPlate, setAnprPlate] = useState<string>(
    initialVehicle?.plateNumber || currentAnprPreset.plateNumber
  );
  const [anprSpeed, setAnprSpeed] = useState<number>(currentAnprPreset.speedKmh);
  const [anprSpeedLimit, setAnprSpeedLimit] = useState<number>(currentAnprPreset.speedLimitKmh);
  const [anprBusLane, setAnprBusLane] = useState<boolean>(currentAnprPreset.inBusLane);
  const [anprSeatbelt, setAnprSeatbelt] = useState<boolean>(currentAnprPreset.seatbeltFastened);
  const [anprMobilePhone, setAnprMobilePhone] = useState<boolean>(currentAnprPreset.usingMobilePhone);
  const [anprRedLight, setAnprRedLight] = useState<boolean>(currentAnprPreset.redLightRun);
  const [anprPlateObscured, setAnprPlateObscured] = useState<boolean>(currentAnprPreset.plateObscured);
  const [anprWanted, setAnprWanted] = useState<boolean>(currentAnprPreset.isStolenOrWanted);

  // Compute live detection object
  const liveDetection = useMemo<AnprDetection>(() => {
    const isSpeeding = anprSpeed > anprSpeedLimit;
    const speedDeltaKmh = Math.max(0, anprSpeed - anprSpeedLimit);
    return {
      plateNumber: formatAzerbaijanPlate(anprPlate),
      speedKmh: anprSpeed,
      speedLimitKmh: anprSpeedLimit,
      isSpeeding,
      speedDeltaKmh,
      inBusLane: anprBusLane,
      seatbeltFastened: anprSeatbelt,
      usingMobilePhone: anprMobilePhone,
      redLightRun: anprRedLight,
      plateObscured: anprPlateObscured,
      isStolenOrWanted: anprWanted,
      cameraConfidence: 99.1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      corridorId: selectedCorridor.id,
    };
  }, [
    anprPlate,
    anprSpeed,
    anprSpeedLimit,
    anprBusLane,
    anprSeatbelt,
    anprMobilePhone,
    anprRedLight,
    anprPlateObscured,
    anprWanted,
    selectedCorridor.id,
  ]);

  const fineResults = useMemo(() => {
    return calculateAnprFines(liveDetection);
  }, [liveDetection]);

  // Green Wave Simulator State
  const [greenWaveDriverSpeed, setGreenWaveDriverSpeed] = useState<number>(selectedCorridor.greenWaveSpeedKmh);
  const greenWaveMetrics = useMemo(() => {
    return calculateGreenWaveSync(
      selectedCorridor.lengthKm,
      greenWaveDriverSpeed,
      selectedCorridor.greenWaveSpeedKmh
    );
  }, [selectedCorridor.lengthKm, greenWaveDriverSpeed, selectedCorridor.greenWaveSpeedKmh]);

  // Incident Dispatch State
  const [incidentsList, setIncidentsList] = useState<IncidentDispatch[]>(MOCK_INCIDENT_DISPATCHES);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(MOCK_INCIDENT_DISPATCHES[0].id);

  const selectedIncident = useMemo(() => {
    return incidentsList.find((i) => i.id === selectedIncidentId) || incidentsList[0];
  }, [incidentsList, selectedIncidentId]);

  // Exam Simulator State
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  const examScore = useMemo(() => {
    let score = 0;
    MOCK_EXAM_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  }, [userAnswers]);

  // Certificate Generator State
  const [certOwnerName, setCertOwnerName] = useState<string>('Namiq Rəşid oğlu Məmmədov');
  const [certVin, setCertVin] = useState<string>(initialVehicle?.vin || 'VF1BB0A0548190342');
  const [generatedCertificate, setGeneratedCertificate] = useState<SafeCityCertificate>(() =>
    generateSafeCityCertificate('10-AA-100', 'VF1BB0A0548190342', 'Namiq Rəşid oğlu Məmmədov', selectedCorridor.name, selectedCorridor.currentLos)
  );
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Registry Search State
  const [registryQuery, setRegistryQuery] = useState<string>('');
  const allCertificates = useMemo(() => {
    return [generatedCertificate, ...MOCK_SAFE_CITY_CERTIFICATES];
  }, [generatedCertificate]);

  const searchResults = useMemo(() => {
    if (!registryQuery.trim()) return allCertificates;
    const q = registryQuery.toLowerCase();
    return allCertificates.filter(
      (c) =>
        c.certificateId.toLowerCase().includes(q) ||
        c.plateNumber.toLowerCase().includes(q) ||
        c.ownerFullName.toLowerCase().includes(q) ||
        c.vin.toLowerCase().includes(q)
    );
  }, [registryQuery, allCertificates]);

  if (!isOpen) return null;

  const handlePresetChange = (idx: number) => {
    setSelectedAnprPresetIndex(idx);
    const p = MOCK_ANPR_PRESETS[idx];
    setAnprPlate(p.plateNumber);
    setAnprSpeed(p.speedKmh);
    setAnprSpeedLimit(p.speedLimitKmh);
    setAnprBusLane(p.inBusLane);
    setAnprSeatbelt(p.seatbeltFastened);
    setAnprMobilePhone(p.usingMobilePhone);
    setAnprRedLight(p.redLightRun);
    setAnprPlateObscured(p.plateObscured);
    setAnprWanted(p.isStolenOrWanted);
  };

  const handleGenerateCertificate = () => {
    const cert = generateSafeCityCertificate(
      anprPlate,
      certVin,
      certOwnerName,
      selectedCorridor.name,
      selectedCorridor.currentLos
    );
    setGeneratedCertificate(cert);
    setActiveTab('certificate');
  };

  const handleCopyCertificate = () => {
    navigator.clipboard?.writeText(JSON.stringify(generatedCertificate, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleResetExam = () => {
    setUserAnswers({});
    setIsExamSubmitted(false);
  };

  const losDetails = getLosDetails(selectedCorridor.currentLos);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      data-testid="safe-city-modal"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-inner">
              <Video className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  DİN & NİİM RƏSMİ PORTAL
                </span>
                <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                  Təhlükəsiz Şəhər & İntellektual Nəqliyyat İdarəetməsi
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                DİN "Təhlükəsiz Şəhər" & NİİM Telemetriya Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              data-testid="close-safe-city-modal"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('corridors')}
            data-testid="tab-corridors"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'corridors'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>NİİM Şəhər Radarı ({MOCK_TRAFFIC_CORRIDORS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('anpr')}
            data-testid="tab-anpr"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'anpr'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>ANPR & AI Telemetriya</span>
          </button>

          <button
            onClick={() => setActiveTab('greenwave')}
            data-testid="tab-greenwave"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'greenwave'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>"Yaşıl Dalğa" İşıqforu</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            data-testid="tab-incidents"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Dispetçer Standı ({incidentsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'exam'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>10-Sual İmtahan</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>DİN-NİİM Sertifikatı</span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Vahid Reyestr</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: CORRIDORS & RADAR */}
          {activeTab === 'corridors' && (
            <div className="space-y-6" data-testid="corridors-section">
              {/* Search & Overview Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={corridorSearchQuery}
                    onChange={(e) => setCorridorSearchQuery(e.target.value)}
                    placeholder="Magistral və ya rayon axtar..."
                    data-testid="corridor-search-input"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Canlı Telemetriya Aktiv
                  </span>
                  <span className="text-slate-500">|</span>
                  <span>Cəmi 246 Safe City Kamerası</span>
                </div>
              </div>

              {/* Grid of Corridors */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCorridors.map((c) => {
                  const isSelected = c.id === selectedCorridor.id;
                  const cLos = getLosDetails(c.currentLos);
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCorridorId(c.id)}
                      data-testid={`corridor-card-${c.id}`}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {c.district}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cLos.bgClass} ${cLos.colorClass}`}
                          >
                            {c.currentLos.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white line-clamp-1">{c.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.vmsAlert}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Məsafə:</span>
                          <span className="font-semibold text-white">{c.lengthKm} km</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Kamera Sayı:</span>
                          <span className="font-semibold text-indigo-400">{c.cameraCount} CCTV/ANPR</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Yaşıl Dalğa Sürəti:</span>
                          <span className="font-semibold text-emerald-400">{c.greenWaveSpeedKmh} km/saat</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Tıxac İndeksi:</span>
                          <span
                            className={`font-semibold ${
                              c.congestionIndex < 35
                                ? 'text-emerald-400'
                                : c.congestionIndex < 70
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}
                          >
                            %{c.congestionIndex}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Corridor Live Telemetry Detail Stand */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      Seçilmiş Magistralın Telemetriya Kartı
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      {selectedCorridor.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('greenwave')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Yaşıl Dalğanı Test Et</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('anpr')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      <span>ANPR Yoxla</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Xidmət Səviyyəsi (LOS)</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-base font-bold ${losDetails.colorClass}`}>
                        {selectedCorridor.currentLos.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {losDetails.delaySecondsPerVehicle} gecikmə
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Ortalama Keçid Vaxtı</span>
                    <div className="text-base font-bold text-white mt-1">
                      {selectedCorridor.averageTravelTimeMinutes} dəq
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Sərbəst axında: {selectedCorridor.freeFlowTravelTimeMinutes} dəq
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Sürət Həddi / Yaşıl Dalğa</span>
                    <div className="text-base font-bold text-white mt-1">
                      {selectedCorridor.speedLimitKmh} / {selectedCorridor.greenWaveSpeedKmh} km/s
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Tövsiyə faza: {selectedCorridor.greenWaveSpeedKmh} km/s
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Aktiv İnsidentlər</span>
                    <div className="text-base font-bold text-amber-400 mt-1">
                      {selectedCorridor.activeIncidents} Hadisə
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      YPX & NİİM nəzarətində
                    </span>
                  </div>
                </div>

                {/* VMS Live LED Banner Simulator */}
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      VMS ELEKTRON MƏLUMAT TABLOSU (CANLI XƏBƏRDARLIQ)
                    </span>
                    <p className="text-sm font-medium text-amber-200 mt-0.5">
                      {selectedCorridor.vmsAlert}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANPR & AI TELEMETRY AUDITOR */}
          {activeTab === 'anpr' && (
            <div className="space-y-6" data-testid="anpr-section">
              {/* Presets Bar */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-400 block">
                  Hazır ANPR Telemetriya Nümunələri (Presets):
                </span>
                <div className="flex flex-wrap gap-2">
                  {MOCK_ANPR_PRESETS.map((p, idx) => (
                    <button
                      key={p.plateNumber}
                      onClick={() => handlePresetChange(idx)}
                      data-testid={`anpr-preset-${idx}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedAnprPresetIndex === idx
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-900/80 text-slate-400 border-slate-700/60 hover:text-white'
                      }`}
                    >
                      {p.plateNumber} {p.isStolenOrWanted ? '🚨 AXATARIŞ' : p.isSpeeding ? '⚡ SÜRƏT' : '✅ QANUNİ'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ANPR Control Form & Live Camera Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Input Parameters */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-indigo-400" />
                    <span>ANPR & AI Parametrləri</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı (DQN)</label>
                      <input
                        type="text"
                        value={anprPlate}
                        onChange={(e) => setAnprPlate(e.target.value)}
                        placeholder="Məs: 99-NN-999"
                        data-testid="anpr-plate-input"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500 uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Qeydə Alınan Sürət</span>
                          <span className="font-bold text-white">{anprSpeed} km/saat</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="160"
                          step="1"
                          value={anprSpeed}
                          onChange={(e) => setAnprSpeed(Number(e.target.value))}
                          data-testid="anpr-speed-slider"
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Sürət Həddi</span>
                          <span className="font-bold text-indigo-400">{anprSpeedLimit} km/saat</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="110"
                          step="10"
                          value={anprSpeedLimit}
                          onChange={(e) => setAnprSpeedLimit(Number(e.target.value))}
                          data-testid="anpr-speed-limit-slider"
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Checkbox Toggles */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 block">AI Kamera Təyinatları:</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={anprBusLane}
                            onChange={(e) => setAnprBusLane(e.target.checked)}
                            data-testid="toggle-bus-lane"
                            className="rounded accent-indigo-500"
                          />
                          <span className="text-slate-300">Avtobus "A" Zolağı</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={anprRedLight}
                            onChange={(e) => setAnprRedLight(e.target.checked)}
                            data-testid="toggle-red-light"
                            className="rounded accent-indigo-500"
                          />
                          <span className="text-slate-300">Qırmızı İşıq Keçidi</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!anprSeatbelt}
                            onChange={(e) => setAnprSeatbelt(!e.target.checked)}
                            data-testid="toggle-seatbelt"
                            className="rounded accent-indigo-500"
                          />
                          <span className="text-slate-300">Kəmər Taxılmayıb</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={anprMobilePhone}
                            onChange={(e) => setAnprMobilePhone(e.target.checked)}
                            data-testid="toggle-mobile-phone"
                            className="rounded accent-indigo-500"
                          />
                          <span className="text-slate-300">Telefondan İstifadə</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={anprPlateObscured}
                            onChange={(e) => setAnprPlateObscured(e.target.checked)}
                            data-testid="toggle-plate-obscured"
                            className="rounded accent-indigo-500"
                          />
                          <span className="text-slate-300">Nömrə Oxunmur</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={anprWanted}
                            onChange={(e) => setAnprWanted(e.target.checked)}
                            data-testid="toggle-wanted"
                            className="rounded accent-red-500"
                          />
                          <span className="text-red-400 font-semibold">🚨 Axtarış / Oğurluq</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Camera Vision Simulation Stand & Sanction Results */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      Süni İntellekt ANPR Vizual Standı
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Dəqiqlik: %99.2
                    </span>
                  </div>

                  {/* Simulated Camera Screen */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[10px] text-red-500">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span>REC [HD 4K]</span>
                    </div>

                    <div className="text-slate-400 text-[11px] mb-2">
                      CAM: DİN-NIIM-CAM-084 // CORRIDOR: {selectedCorridor.name.substring(0, 24)}...
                    </div>

                    {/* Azerbaijan Plate Mock Display */}
                    <div className="flex justify-center my-3">
                      <div className="inline-flex items-center bg-white text-black font-bold px-3 py-1.5 rounded-md border-2 border-slate-900 shadow-lg tracking-wider text-base sm:text-lg">
                        <div className="flex flex-col items-center mr-2 border-r border-slate-300 pr-1.5">
                          <div className="w-3.5 h-2.5 bg-blue-600 rounded-xs mb-0.5 flex flex-col justify-between">
                            <span className="h-[30%] bg-blue-600" />
                            <span className="h-[30%] bg-red-600" />
                            <span className="h-[30%] bg-green-600" />
                          </div>
                          <span className="text-[9px] font-black text-blue-900 leading-none">AZ</span>
                        </div>
                        <span data-testid="plate-display-text">{liveDetection.plateNumber || '10-AA-100'}</span>
                      </div>
                    </div>

                    {/* Telemetry Readouts */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                      <div>
                        Sürət: <span className={liveDetection.isSpeeding ? 'text-red-400 font-bold' : 'text-emerald-400'}>{liveDetection.speedKmh} km/s</span>
                      </div>
                      <div>
                        Hədd: <span className="text-white">{liveDetection.speedLimitKmh} km/s</span>
                      </div>
                      <div>
                        Kəmər: <span className={liveDetection.seatbeltFastened ? 'text-emerald-400' : 'text-red-400 font-bold'}>{liveDetection.seatbeltFastened ? 'TAXILIB' : 'TAXILMAYIB'}</span>
                      </div>
                      <div>
                        Avtobus Zolağı: <span className={liveDetection.inBusLane ? 'text-red-400 font-bold' : 'text-emerald-400'}>{liveDetection.inBusLane ? 'İSTİFADƏDƏ' : 'SƏRBƏST'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Fines & Sanctions Card */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Cərimə & Cərimə Balları Yekunu:</span>
                      {fineResults.hasCriticalViolation && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          KRİTİK XƏTA
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Ümumi Cərimə (AZN)</span>
                        <span className="text-base font-bold text-white" data-testid="total-fine-azn">
                          {formatCurrency(convertCurrency(fineResults.totalFineAZN, currency), currency)}
                        </span>
                        <span className="text-[10px] text-emerald-400 block mt-0.5">
                          30 gün endirimlə: {formatCurrency(convertCurrency(fineResults.discountedFineAZN, currency), currency)}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Cərimə Balları</span>
                        <span
                          className={`text-base font-bold ${
                            fineResults.totalDemeritPoints > 0 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                          data-testid="total-demerit-points"
                        >
                          {fineResults.totalDemeritPoints} Bal
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          12 balda sürücülük məhdudiyyəti
                        </span>
                      </div>
                    </div>

                    {/* Violations Itemized List */}
                    {fineResults.violations.length > 0 ? (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                        <span className="text-[11px] font-semibold text-slate-400 block">Qeydə Alınmış Xətalar:</span>
                        {fineResults.violations.map((v, i) => (
                          <div key={i} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold">{v.legalRef}</span>: {v.description}
                            </div>
                            <span className="font-bold text-white shrink-0">+{v.fineAZN} ₼</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Xəta qeydə alınmadı. Sürücü yol hərəkəti qaydalarına tam riayət edir.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GREEN WAVE SIMULATOR */}
          {activeTab === 'greenwave' && (
            <div className="space-y-6" data-testid="greenwave-section">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Dinamik İşıqfor Fazası & Dalğa Uyğunluğu
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      "Yaşıl Dalğa" (Green Wave) Koordinasiya Simulyatoru
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Optimum Sürət: {selectedCorridor.greenWaveSpeedKmh} km/saat
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Avtomobilin Sürəti:</span>
                    <span className="font-bold text-white text-sm">{greenWaveDriverSpeed} km/saat</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="110"
                    step="1"
                    value={greenWaveDriverSpeed}
                    onChange={(e) => setGreenWaveDriverSpeed(Number(e.target.value))}
                    data-testid="greenwave-speed-slider"
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>20 km/saat (Ləng)</span>
                    <span className="text-emerald-400 font-semibold">{selectedCorridor.greenWaveSpeedKmh} km/saat (Hədəf)</span>
                    <span>110 km/saat (Aşırı)</span>
                  </div>
                </div>

                {/* Efficiency Gauge & Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">Dalğa Uyğunluğu</span>
                    <span
                      className={`text-lg font-black block mt-0.5 ${
                        greenWaveMetrics.syncEfficiencyPercent >= 80
                          ? 'text-emerald-400'
                          : greenWaveMetrics.syncEfficiencyPercent >= 50
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                      data-testid="greenwave-efficiency"
                    >
                      %{greenWaveMetrics.syncEfficiencyPercent}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Sinxronizasiya</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">Təxmini Dayanma</span>
                    <span className="text-lg font-black text-white block mt-0.5" data-testid="greenwave-stops">
                      {greenWaveMetrics.estimatedStops} Dəfə
                    </span>
                    <span className="text-[10px] text-slate-500 block">Qırmızı işıqda</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">Məsafə Keçid Vaxtı</span>
                    <span className="text-lg font-black text-indigo-400 block mt-0.5">
                      {greenWaveMetrics.travelTimeMinutes} dəq
                    </span>
                    <span className="text-[10px] text-slate-500 block">{selectedCorridor.lengthKm} km marşrutda</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">Qənaət Olunan Yanacaq</span>
                    <span className="text-lg font-black text-emerald-400 block mt-0.5">
                      {greenWaveMetrics.fuelSavedLiters} L
                    </span>
                    <span className="text-[10px] text-slate-500 block">-{greenWaveMetrics.co2SavedGrams}g CO2</span>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    greenWaveMetrics.isSpeedInSync
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                  data-testid="greenwave-recommendation"
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">
                      {greenWaveMetrics.isSpeedInSync ? 'Tam Sinxronizasiya:' : 'Tövsiyə Edilən Tənzimləmə:'}
                    </span>
                    {greenWaveMetrics.recommendation}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INCIDENT DISPATCH STAND */}
          {activeTab === 'incidents' && (
            <div className="space-y-6" data-testid="incidents-section">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400">NİİM Operativ Hərəkət İdarəsi</span>
                  <h3 className="text-base font-bold text-white">Canlı Qəza & İnsident Dispetçer Nəzarəti</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                  Aktiv Hadisələr: {incidentsList.length}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of active incidents */}
                <div className="space-y-3 lg:col-span-1">
                  {incidentsList.map((inc) => {
                    const isSelected = inc.id === selectedIncident.id;
                    return (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        data-testid={`incident-item-${inc.id}`}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500 shadow-md'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono text-slate-400">{inc.id}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              inc.severity === 'critical'
                                ? 'bg-red-500/20 text-red-400'
                                : inc.severity === 'high'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {inc.severity.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{inc.typeLabel}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{inc.corridorName}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Incident Dossier */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Hadisə Protokolu:</span>
                      <h3 className="text-base font-bold text-white mt-0.5">{selectedIncident.typeLabel}</h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      Status: {selectedIncident.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">Məkan:</span>
                      <span className="font-semibold text-white mt-0.5 block">{selectedIncident.corridorName}</span>
                      <span className="text-slate-500 text-[11px]">{selectedIncident.locationDetails}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">Təyin Edilmiş Operativ Qrup:</span>
                      <span className="font-semibold text-indigo-400 mt-0.5 block">{selectedIncident.dispatchedUnit}</span>
                      <span className="text-slate-500 text-[11px]">Çatma vaxtı: ~{selectedIncident.estimatedResponseMinutes} dəq</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${selectedIncident.requiresTow ? 'bg-amber-400' : 'bg-slate-600'}`} />
                      <span>Evakuator: {selectedIncident.requiresTow ? 'Tələb olunur' : 'Yoxdur'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${selectedIncident.requiresAmbulance ? 'bg-red-400' : 'bg-slate-600'}`} />
                      <span>Təcili Tibbi Yardım: {selectedIncident.requiresAmbulance ? 'Çağırılıb' : 'Ehtiyac yoxdur'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 10-QUESTION THEORETICAL EXAMINATION */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="exam-section">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-indigo-400">DİN NİİM Tədris Standartı</span>
                  <h3 className="text-base font-bold text-white">
                    "Təhlükəsiz Şəhər" & İntellektual Hərəkət Nəzəriyyə İmtahanı
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {isExamSubmitted && (
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                        examScore >= 8
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}
                      data-testid="exam-result-badge"
                    >
                      Nəticə: {examScore} / 10 ({examScore >= 8 ? 'MÜVƏFFƏQ' : 'KƏSİLDİ'})
                    </span>
                  )}
                  <button
                    onClick={handleResetExam}
                    data-testid="reset-exam-btn"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Yenidən Başla"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_EXAM_QUESTIONS.map((q, qIndex) => {
                  const selectedOpt = userAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      data-testid={`exam-question-${qIndex}`}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-indigo-400">Sual №{qIndex + 1}</span>
                        <span className="text-[10px] text-slate-500">{q.legalCitation}</span>
                      </div>

                      <p className="text-sm font-semibold text-white">{q.question}</p>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIndex) => {
                          const isOptionSelected = selectedOpt === optIndex;
                          let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60';

                          if (isExamSubmitted) {
                            if (optIndex === q.correctIndex) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = 'bg-red-500/20 border-red-500 text-red-200';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => {
                                if (!isExamSubmitted) {
                                  setUserAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
                                }
                              }}
                              data-testid={`question-${qIndex}-option-${optIndex}`}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${btnStyle}`}
                            >
                              <span className="mr-2 font-mono font-bold text-slate-400">
                                {String.fromCharCode(65 + optIndex)})
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                          <span className="font-semibold text-indigo-300">İzah:</span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isExamSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    data-testid="submit-exam-btn"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    İmtahanı Tamamla & Qiymətləndir
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: OFFICIAL ELECTRONIC CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="certificate-section">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400">Rəsmi Elektron Sənəd</span>
                  <h3 className="text-base font-bold text-white">DİN-NİİM Telemetriya & Şəhər Buraxılış Sertifikatı</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCertificate}
                    data-testid="copy-cert-btn"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copySuccess ? 'Kopyalandı!' : 'Kopyala'}</span>
                  </button>
                  <button
                    onClick={handlePrintCertificate}
                    data-testid="print-cert-btn"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Certificate Canvas / Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden font-sans space-y-6">
                {/* Decorative Background Stamp */}
                <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
                  <Video className="w-64 h-64 text-indigo-400" />
                </div>

                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-indigo-500/30 pb-4 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                        Azərbaycan Respublikası Daxili İşlər Nazirliyi
                      </h4>
                      <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                        Nəqliyyatın İntellektual İdarəetmə Mərkəzi (NİİM)
                      </h2>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-[10px] text-slate-400 block">Sənəd Qeydiyyat №</span>
                    <span className="text-sm font-mono font-bold text-indigo-300" data-testid="cert-id-display">
                      {generatedCertificate.certificateId}
                    </span>
                  </div>
                </div>

                {/* Core Certificate Body */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Nəqliyyat Sahibinin S.A.A.</span>
                    <span className="font-bold text-white text-sm block">{generatedCertificate.ownerFullName}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Dövlət Qeydiyyat Nişanı (DQN)</span>
                    <span className="font-mono font-bold text-indigo-400 text-sm block" data-testid="cert-plate-display">
                      {generatedCertificate.plateNumber}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">VIN / Şassi Nömrəsi</span>
                    <span className="font-mono text-slate-300 text-xs block">{generatedCertificate.vin}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Təsdiqlənmiş Magistral Marşrut</span>
                    <span className="font-semibold text-white text-xs block">{generatedCertificate.corridorName}</span>
                  </div>
                </div>

                {/* Telemetry Seal Readouts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-slate-800/80 pt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Xidmət Səviyyəsi</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
                      {generatedCertificate.losGrade.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">ANPR Dəqiqlik İndeksi</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">
                      %{generatedCertificate.anprTrustScore}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Yaşıl Dalğa Uyğunluğu</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">TƏSDİQLƏNDİ</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">İntellektual Xəta Qeydi</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">TƏMİZ (0 Xəta)</span>
                  </div>
                </div>

                {/* Footer Signatures & Hashes */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-slate-800/80 pt-4 text-[11px] text-slate-400">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="font-mono text-[10px] text-slate-500">
                      SİMA Digital Signature: {generatedCertificate.simaSignatureUid}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      Hash Checksum: {generatedCertificate.securityHash}
                    </div>
                  </div>

                  <div className="text-center sm:text-right space-y-0.5">
                    <div className="font-bold text-white">{generatedCertificate.inspectorName}</div>
                    <div className="text-[10px] text-indigo-400">{generatedCertificate.inspectorBadge}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: UNIFIED REGISTRY SEARCH */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="registry-section">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={registryQuery}
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    placeholder="Sertifikat ID, DQN və ya S.A.A. axtar..."
                    data-testid="registry-search-input"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  Tapılan qeydlər: <span className="font-bold text-white">{searchResults.length}</span>
                </span>
              </div>

              <div className="space-y-3">
                {searchResults.map((cert) => (
                  <div
                    key={cert.certificateId}
                    data-testid={`registry-item-${cert.certificateId}`}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-400">{cert.certificateId}</span>
                        <span className="text-slate-600">|</span>
                        <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                          {cert.plateNumber}
                        </span>
                        <span className="text-emerald-400 font-semibold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10">
                          AKTİV
                        </span>
                      </div>
                      <div className="text-slate-300 font-medium">{cert.ownerFullName}</div>
                      <div className="text-slate-500 text-[11px]">{cert.corridorName}</div>
                    </div>

                    <div className="text-right space-y-1 sm:self-center">
                      <div className="text-slate-400 text-[11px]">Etibarlılıq: {cert.expiryDate}</div>
                      <span className="text-[10px] font-mono text-slate-500">{cert.simaSignatureUid}</span>
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
