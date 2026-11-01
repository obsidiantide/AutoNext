import React, { useState, useMemo } from 'react';
import {
  Wind,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  FileText,
  Search,
  Printer,
  Copy,
  ExternalLink,
  HelpCircle,
  Gauge,
  Activity,
  Zap,
  Car,
  Lock,
  RefreshCw,
  Compass,
  ArrowRight,
  Shield,
  Eye,
  Check,
} from 'lucide-react';
import { Modal } from './Modal';
import { Currency } from '../types/vehicle';
import {
  WindCorridorAsset,
  VehicleAeroProfile,
  RoadSurfaceFriction,
  calculateAerodynamicForces,
  evaluateWindChecklist,
  gradeWindExam,
  generateWindSafeCertificate,
  WindSafeCertificate,
} from '../utils/windSafeCompliance';
import {
  MOCK_WIND_CORRIDORS,
  MOCK_VEHICLE_AERO_PROFILES,
  MOCK_WIND_CHECKLIST_ITEMS,
  MOCK_WIND_EXAM_QUESTIONS,
  MOCK_ACTIVE_WIND_CERTIFICATES,
} from '../data/mockWindSafeData';

export type WindTabId =
  | 'corridors'
  | 'scada'
  | 'calculator'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export interface WindSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

export const WindSafeModal: React.FC<WindSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<WindTabId>('corridors');
  const [selectedCorridor, setSelectedCorridor] = useState<WindCorridorAsset>(MOCK_WIND_CORRIDORS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleAeroProfile>(MOCK_VEHICLE_AERO_PROFILES[0]);
  const [corridorSearchQuery, setCorridorSearchQuery] = useState('');

  // SCADA and Simulation State
  const [simVehicleSpeedKmh, setSimVehicleSpeedKmh] = useState<number>(selectedVehicle.typicalSpeedKmh);
  const [simWindSpeedMs, setSimWindSpeedMs] = useState<number>(selectedCorridor.currentWindSpeedMs);
  const [simGustFactor, setSimGustFactor] = useState<number>(1.4);
  const [simWindAngleDeg, setSimWindAngleDeg] = useState<number>(90); // 90° = pure perpendicular crosswind
  const [simBarrierReduction, setSimBarrierReduction] = useState<number>(
    selectedCorridor.barrierInstalled ? Math.round((1 - selectedCorridor.barrierPorosity) * 100) : 0
  );
  const [simRoadCondition, setSimRoadCondition] = useState<RoadSurfaceFriction>('dry');

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<string[]>([
    'chk-1',
    'chk-2',
    'chk-3',
    'chk-4',
    'chk-5',
    'chk-6',
    'chk-8',
    'chk-9',
  ]);

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificates & Registry
  const [certificates, setCertificates] = useState<WindSafeCertificate[]>(MOCK_ACTIVE_WIND_CERTIFICATES);
  const [currentCert, setCurrentCert] = useState<WindSafeCertificate>(MOCK_ACTIVE_WIND_CERTIFICATES[0]);
  const [registrySearch, setRegistrySearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Derived Calculations
  const aeroResult = useMemo(() => {
    return calculateAerodynamicForces({
      vehicleSpeedKmh: simVehicleSpeedKmh,
      windSpeedMs: simWindSpeedMs,
      gustFactor: simGustFactor,
      windAttackAngleDeg: simWindAngleDeg,
      barrierReductionPercent: simBarrierReduction,
      roadCondition: simRoadCondition,
      vehicleProfile: selectedVehicle,
    });
  }, [
    simVehicleSpeedKmh,
    simWindSpeedMs,
    simGustFactor,
    simWindAngleDeg,
    simBarrierReduction,
    simRoadCondition,
    selectedVehicle,
  ]);

  const checklistResult = useMemo(() => {
    return evaluateWindChecklist(checkedItems, MOCK_WIND_CHECKLIST_ITEMS);
  }, [checkedItems]);

  const examResult = useMemo(() => {
    return gradeWindExam(examAnswers, MOCK_WIND_EXAM_QUESTIONS);
  }, [examAnswers]);

  // Corridor Selection Handler
  const handleSelectCorridor = (corridor: WindCorridorAsset) => {
    setSelectedCorridor(corridor);
    setSimWindSpeedMs(corridor.currentWindSpeedMs);
    setSimBarrierReduction(corridor.barrierInstalled ? Math.round((1 - corridor.barrierPorosity) * 100) : 0);
  };

  // Preset Selection Handler
  const handleSelectVehicle = (vehicle: VehicleAeroProfile) => {
    setSelectedVehicle(vehicle);
    setSimVehicleSpeedKmh(vehicle.typicalSpeedKmh);
  };

  // Checklist Helpers
  const handleToggleChecklist = (id: string) => {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    setCheckedItems(MOCK_WIND_CHECKLIST_ITEMS.map(item => item.id));
  };

  const handleResetChecklist = () => {
    setCheckedItems([]);
  };

  // Exam Helpers
  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (examSubmitted) return;
    setExamAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitExam = () => {
    setExamSubmitted(true);
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setExamSubmitted(false);
  };

  // Certificate Generator
  const handleGenerateCertificate = () => {
    const newCert = generateWindSafeCertificate(
      selectedCorridor,
      selectedVehicle,
      {
        vehicleSpeedKmh: simVehicleSpeedKmh,
        windSpeedMs: simWindSpeedMs,
        gustFactor: simGustFactor,
        windAttackAngleDeg: simWindAngleDeg,
        barrierReductionPercent: simBarrierReduction,
        roadCondition: simRoadCondition,
        vehicleProfile: selectedVehicle,
      },
      aeroResult
    );
    setCertificates(prev => [newCert, ...prev]);
    setCurrentCert(newCert);
    setActiveTab('certificate');
  };

  const handleCopyPassCode = () => {
    if (!currentCert) return;
    navigator.clipboard.writeText(
      `WIND-SAFE SERTİFİKAT: ${currentCert.certificateId} | NÖMRƏ: ${currentCert.vehiclePlate} | KOD: ${currentCert.barrierPassCode} | SİMA: ${currentCert.simaSignatureUid}`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // Filtered corridors and registry
  const filteredCorridors = useMemo(() => {
    if (!corridorSearchQuery.trim()) return MOCK_WIND_CORRIDORS;
    const q = corridorSearchQuery.toLowerCase();
    return MOCK_WIND_CORRIDORS.filter(
      c =>
        c.nameAz.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.route.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );
  }, [corridorSearchQuery]);

  const filteredCertificates = useMemo(() => {
    if (!registrySearch.trim()) return certificates;
    const q = registrySearch.toLowerCase();
    return certificates.filter(
      c =>
        c.certificateId.toLowerCase().includes(q) ||
        c.vehiclePlate.toLowerCase().includes(q) ||
        c.corridorName.toLowerCase().includes(q) ||
        c.vehicleModel.toLowerCase().includes(q) ||
        c.simaSignatureUid.toLowerCase().includes(q)
    );
  }, [certificates, registrySearch]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="full"
      className="p-0 overflow-hidden bg-slate-950 text-slate-100 max-w-6xl mx-auto rounded-2xl shadow-2xl border border-cyan-500/20"
    >
      <div className="flex flex-col h-[90vh] max-h-[920px] bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl shadow-lg shadow-cyan-500/20 text-white">
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  AAYDA, ETSN & BDYP Magistral Yan Külək və Qasırğa SCADA Monitorinqi
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  WIND-SAFE-AZ-2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Azərbaycan Respublikası Avtomobil Yolları Dövlət Agentliyi • Ekologiya Nazirliyi • Baş Dövlət Yol Polisi İdarəsi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal window"
            data-testid="wind-modal-header-close"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 shrink-0 overflow-x-auto gap-2">
          {[
            { id: 'corridors', label: '1. Magistral Dəhlizləri', icon: Compass },
            { id: 'scada', label: '2. SCADA Telemetriya', icon: Activity },
            { id: 'calculator', label: '3. Nəqliyyat & İXM Cərimə', icon: Sliders },
            { id: 'checklist', label: '4. Təhlükəsizlik Bəndləri', icon: CheckCircle2 },
            { id: 'exam', label: '5. İmtahan Simulatoru', icon: HelpCircle },
            { id: 'certificate', label: '6. Rəsmi Sertifikat', icon: FileText },
            { id: 'registry', label: '7. Dövlət Reyestri', icon: Search },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WindTabId)}
                className={`flex items-center space-x-2 py-3 px-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {/* TAB 1: CORRIDORS RADAR */}
          {activeTab === 'corridors' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    Azərbaycanın 6 Strateji Qasırğalı Yan Külək Dəhlizi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Xəzər sahili və dağ keçidlərində AAYDA ultrasəs anemometrləri və BDYP postları ilə təchiz olunmuş nəzarət nöqtələri
                  </p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={corridorSearchQuery}
                    onChange={e => setCorridorSearchQuery(e.target.value)}
                    placeholder="Dəhliz, marşrut və ya rayon axtar..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCorridors.map(c => {
                  const isSelected = selectedCorridor.id === c.id;
                  let alertBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                  let alertText = 'Normal Rejim';
                  if (c.alertTier === 'advisory') {
                    alertBadgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                    alertText = 'Məsləhət Görülür';
                  } else if (c.alertTier === 'warning') {
                    alertBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                    alertText = 'Təhlükəli Külək';
                  } else if (c.alertTier === 'emergency') {
                    alertBadgeClass = 'bg-red-500/20 text-red-300 border-red-500/30';
                    alertText = 'Qasırğa Qırmızı Həyəcan';
                  }

                  return (
                    <div
                      key={c.id}
                      data-testid={`corridor-card-${c.id}`}
                      onClick={() => handleSelectCorridor(c)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'bg-slate-900/90 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-800 text-cyan-400 rounded border border-slate-700">
                          {c.route}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${alertBadgeClass}`}>
                          {alertText}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white line-clamp-1 mb-1">{c.nameAz}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mb-3">{c.region} • {c.coordinates}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Külək Sürəti</span>
                          <span className="font-semibold text-slate-200">{c.currentWindSpeedMs} m/s</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Maksimal Poryv</span>
                          <span className="font-semibold text-amber-400">{c.currentGustSpeedMs} m/s</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Dominant Külək</span>
                          <span className="font-semibold text-cyan-300 uppercase">
                            {c.predominantWindType === 'khazri' ? 'Xəzri (Şimal)' : c.predominantWindType === 'gilavar' ? 'Giləvar (Cənub)' : 'Dağ Küləyi'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Baryer Vəziyyəti</span>
                          <span className={`font-semibold ${c.barrierInstalled ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {c.barrierInstalled ? `${c.barrierHeightM}m Aerodinamik` : 'Baryer Yoxdur'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Tövsiyə sürət həddi:</span>
                        <span className="font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                          ≤ {c.recommendedSpeedLimitKmh} km/saat
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Corridor Overview Banner */}
              <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 rounded-xl border border-cyan-800/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-900/40 rounded-xl border border-cyan-700/50 text-cyan-400">
                    <Wind className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider block">Seçilmiş Nəzarət Dəhlizi</span>
                    <h4 className="text-base font-bold text-white">{selectedCorridor.nameAz}</h4>
                    <p className="text-xs text-slate-400">
                      Koordinat: {selectedCorridor.coordinates} • Hündürlük: {selectedCorridor.elevationM}m • Külək Azimutu: {selectedCorridor.windAzimuthDeg}°
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('scada')}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
                >
                  <span>SCADA Telemetriyaya Keç</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA TELEMETRY & OVERTURNING STAND */}
          {activeTab === 'scada' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Interactive Controls */}
                <div className="lg:col-span-1 space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    SCADA İdarəetmə & Meteoroloji Parametrlər
                  </h4>

                  {/* Wind Speed Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Əsas Külək Sürəti</span>
                      <span className="font-mono font-bold text-cyan-400">{simWindSpeedMs} m/s ({(simWindSpeedMs * 3.6).toFixed(0)} km/s)</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={45}
                      step={0.5}
                      value={simWindSpeedMs}
                      onChange={e => setSimWindSpeedMs(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800"
                    />
                  </div>

                  {/* Wind Gust Factor Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Qasırğa Poryv Əmsalı</span>
                      <span className="font-mono font-bold text-amber-400">{simGustFactor}x ({aeroResult.peakGustSpeedMs} m/s)</span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={2.0}
                      step={0.05}
                      value={simGustFactor}
                      onChange={e => setSimGustFactor(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800"
                    />
                  </div>

                  {/* Wind Attack Angle Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Küləyin Hücum Bucaq Dərəcəsi</span>
                      <span className="font-mono font-bold text-blue-400">
                        {simWindAngleDeg}° ({simWindAngleDeg === 90 ? 'Təmiz Yan Külək' : simWindAngleDeg < 90 ? 'Qarşı-Yan Külək' : 'Arxa-Yan Külək'})
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={180}
                      step={5}
                      value={simWindAngleDeg}
                      onChange={e => setSimWindAngleDeg(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-slate-800"
                    />
                  </div>

                  {/* Windbreak Barrier Reduction Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Aerodinamik Ekran Zəiflətməsi</span>
                      <span className="font-mono font-bold text-emerald-400">{simBarrierReduction}% Zəiflətmə</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={70}
                      step={5}
                      value={simBarrierReduction}
                      onChange={e => setSimBarrierReduction(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800"
                    />
                  </div>

                  {/* Vehicle Speed Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Nəqliyyatın Sürəti</span>
                      <span className="font-mono font-bold text-purple-400">{simVehicleSpeedKmh} km/saat</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={140}
                      step={5}
                      value={simVehicleSpeedKmh}
                      onChange={e => setSimVehicleSpeedKmh(parseInt(e.target.value))}
                      className="w-full accent-purple-500 bg-slate-800"
                    />
                  </div>

                  {/* Road Surface Condition */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Yol Səthinin Sürtünmə Vəziyyəti</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['dry', 'wet', 'slush', 'ice'] as RoadSurfaceFriction[]).map(cond => (
                        <button
                          key={cond}
                          onClick={() => setSimRoadCondition(cond)}
                          className={`py-1 text-xs rounded uppercase font-semibold transition-colors ${
                            simRoadCondition === cond
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {cond === 'dry' ? 'Quru' : cond === 'wet' ? 'Nəm' : cond === 'slush' ? 'Sulaq' : 'Buz'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center & Right Column: Telemetry Gauges & Rollover Stand */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Real-time Dynamic Matrix Gantry (VMS) */}
                  <div className="p-4 bg-black border-2 border-amber-500/60 rounded-xl shadow-lg font-mono">
                    <div className="flex items-center justify-between border-b border-amber-900/60 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">
                          AAYDA & BDYP ELEKTRON VMS TABLO
                        </span>
                      </div>
                      <span className="text-xs text-amber-500/80">{selectedCorridor.route} KM 58</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                      <div>
                        <div className="text-amber-300 font-black text-lg md:text-xl tracking-wider uppercase">
                          {aeroResult.isOverturningLikely
                            ? 'DİQQƏT! GÜCLÜ QASIRĞA — HƏRƏKƏT QADAĞANDIR!'
                            : aeroResult.rolloverRiskFactor >= 0.75
                            ? 'XƏBƏRDARLIQ: YAN QASIRĞA — SÜRƏTİ AZALT!'
                            : 'MÜTƏŞƏKKİL HƏRƏKƏT — TƏHLÜKƏSİZ MƏSAFƏ SAXLA'}
                        </div>
                        <div className="text-xs text-amber-400/80 mt-1">
                          Külək: {aeroResult.peakGustSpeedMs} m/s • Poryv: {simGustFactor}x • Zolaqdan meyil riski: {aeroResult.lateralDeviationMarginM}m
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-amber-500/40 p-3 rounded-lg shrink-0">
                        <span className="text-[10px] text-amber-400 block uppercase">Dinamik Sürət Həddi</span>
                        <span className="text-2xl font-black text-amber-400">
                          {aeroResult.dynamicSpeedLimitKmh > 0 ? `${aeroResult.dynamicSpeedLimitKmh} KM/S` : 'STOP 0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Physics & Moment Breakdown Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Aerodinamik Yan Qüvvə (Fy)</span>
                      <span className="text-lg font-bold text-cyan-400 font-mono">{aeroResult.sideAeroForceN.toLocaleString()} N</span>
                      <span className="text-[10px] text-slate-500 block">{(aeroResult.sideAeroForceN / 1000).toFixed(1)} kN lateral force</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Aşırma Momenti (Mo)</span>
                      <span className="text-lg font-bold text-amber-400 font-mono">{aeroResult.overturningMomentNm.toLocaleString()} N·m</span>
                      <span className="text-[10px] text-slate-500 block">CoP: {selectedVehicle.centerOfPressureHeightM}m</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Bərpaedici Moment (Mr)</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">{aeroResult.restoringMomentNm.toLocaleString()} N·m</span>
                      <span className="text-[10px] text-slate-500 block">Təkər bazası: {selectedVehicle.trackWidthM}m</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">RRF Aşırma Əmsalı</span>
                      <span className={`text-lg font-bold font-mono ${
                        aeroResult.rolloverRiskFactor >= 1.0
                          ? 'text-red-400'
                          : aeroResult.rolloverRiskFactor >= 0.75
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {aeroResult.rolloverRiskFactor}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {aeroResult.rolloverRiskFactor >= 1.0 ? 'AŞMA BAŞ VERİR' : aeroResult.rolloverRiskFactor >= 0.75 ? 'KRİTİK HƏD' : 'QƏBUL EDİLƏN'}
                      </span>
                    </div>
                  </div>

                  {/* Rollover Risk Factor Gauge Bar */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-cyan-400" />
                        Rollover Risk Factor (RRF) İndikatoru:
                      </span>
                      <span className="font-mono font-bold text-white">
                        {aeroResult.rolloverRiskFactor} / 1.00 (Maksimal Hədd)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${Math.min(50, (aeroResult.rolloverRiskFactor / 1.2) * 100)}%` }}
                      />
                      <div
                        className="bg-amber-500 h-full transition-all"
                        style={{ width: `${Math.max(0, Math.min(25, ((aeroResult.rolloverRiskFactor - 0.5) / 1.2) * 100))}%` }}
                      />
                      <div
                        className="bg-red-500 h-full transition-all"
                        style={{ width: `${Math.max(0, ((aeroResult.rolloverRiskFactor - 0.75) / 1.2) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0.00 (Təhlükəsiz)</span>
                      <span>0.50 (Advisory)</span>
                      <span>0.75 (Kritik Həyəcan)</span>
                      <span>1.00+ (Rollover / Aşma)</span>
                    </div>
                  </div>

                  {/* Action Banner */}
                  <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-300">
                      Nəqliyyat modeli: <strong className="text-white">{selectedVehicle.name}</strong> ({selectedVehicle.licensePlate})
                    </div>
                    <button
                      onClick={handleGenerateCertificate}
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Buraxılış Sertifikatı Yarad</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE PRESETS & STATUTORY FINES */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vehicle Selection Cards */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-cyan-400" />
                    6 Standart Nəqliyyat Aerodinamik Profili
                  </h4>

                  <div className="space-y-2">
                    {MOCK_VEHICLE_AERO_PROFILES.map(veh => {
                      const isSelected = selectedVehicle.id === veh.id;
                      return (
                        <div
                          key={veh.id}
                          onClick={() => handleSelectVehicle(veh)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20'
                              : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{veh.name}</span>
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-cyan-400 rounded border border-slate-700">
                              {veh.licensePlate}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 font-mono mt-2">
                            <div>Yan Sahə: <span className="text-slate-200">{veh.sideAreaM2}m²</span></div>
                            <div>CoP Hündürlük: <span className="text-slate-200">{veh.centerOfPressureHeightM}m</span></div>
                            <div>Çəki: <span className="text-slate-200">{veh.curbMassKg}kg</span></div>
                            <div>Həssaslıq: <span className="text-amber-400 uppercase">{veh.rolloverSensitivity}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statutory Fines & Compliance Evaluation */}
                <div className="space-y-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    İnzibati Xətalar Məcəlləsi (İXM) Cərimə Standı
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-300 font-semibold">Cari Sürət / Dinamik Hədd</span>
                        <span className="font-mono text-xs font-bold text-purple-400">
                          {simVehicleSpeedKmh} km/s / {aeroResult.dynamicSpeedLimitKmh} km/s
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {simVehicleSpeedKmh > aeroResult.dynamicSpeedLimitKmh
                          ? `Sürət həddi ${simVehicleSpeedKmh - aeroResult.dynamicSpeedLimitKmh} km/saat aşılıb.`
                          : 'Sürət həddi daxilindədir.'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-300 font-semibold">Tətbiq Edilən İnzibati Cərimə</span>
                        <span className="font-mono text-base font-black text-amber-400">
                          {currency === 'AZN'
                            ? `${aeroResult.statutoryFineAzN} AZN`
                            : currency === 'USD'
                            ? `$${aeroResult.statutoryFineUsd}`
                            : `€${aeroResult.statutoryFineEur}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-emerald-400">
                        <span>İXM Maddə 38 üzrə 30 gün ərzində 50% endirimlə:</span>
                        <span className="font-bold">
                          {currency === 'AZN'
                            ? `${aeroResult.discountedFineAzN} AZN`
                            : currency === 'USD'
                            ? `$${(aeroResult.statutoryFineUsd * 0.5).toFixed(2)}`
                            : `€${(aeroResult.statutoryFineEur * 0.5).toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    {aeroResult.complianceNotes.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-semibold text-slate-300 block">Hüquqi & Texniki Rəylər:</span>
                        {aeroResult.complianceNotes.map((note, idx) => (
                          <div key={idx} className="p-2.5 bg-red-950/30 border border-red-800/40 rounded-lg text-xs text-red-300 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    10 Bəndlik Magistral Yan Külək Təhlükəsizlik Yoxlama Protokolu
                  </h3>
                  <p className="text-xs text-slate-400">
                    AZS 410, EN 12642 Code XL və Yol Hərəkəti Haqqında Qanunun tələblərinə uyğun yoxlama
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 border border-cyan-700/50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Uyğunluq Göstəricisi</span>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{checklistResult.checkedCount} / {checklistResult.totalCount} bənd təsdiqləndi</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">({checklistResult.scorePercentage}%)</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  checklistResult.isCompliant
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {checklistResult.isCompliant ? 'MƏCBURİ BƏNDLƏR TAMDIR' : 'ÇATIŞMAYAN BƏNDLƏR VAR'}
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {MOCK_WIND_CHECKLIST_ITEMS.map(item => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-900/80 border-cyan-500/60'
                          : 'bg-slate-900/30 border-slate-800 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded transition-colors ${
                        isChecked ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-100">{item.titleAz}</span>
                          {item.isMandatory && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-950 text-red-400 border border-red-800/50 rounded">
                              Məcburi
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{item.titleEn}</p>
                        <span className="text-[10px] text-cyan-400/80 font-mono mt-1 block">
                          Hüquqi Əsas: {item.legalRef}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-cyan-400" />
                    Magistral Qasırğa & Yan Külək Təhlükəsizliyi İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sürücülər və logistika operatorları üçün 10 suallıq rəsmi test simulatoru (Keçid balı: 80%)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!examSubmitted ? (
                    <button
                      onClick={handleSubmitExam}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      İmtahanı Tamamla
                    </button>
                  ) : (
                    <button
                      onClick={handleResetExam}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Yenidən Başla
                    </button>
                  )}
                </div>
              </div>

              {examSubmitted && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  examResult.isPassed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  <div className="flex items-center gap-3">
                    {examResult.isPassed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {examResult.isPassed ? 'Təbriklər! İmtahandan Müvəffəqiyyətlə Keçdiniz' : 'İmtahan Nəticəsi Qeyri-Qənaətbəxşdir'}
                      </h4>
                      <p className="text-xs opacity-80">
                        {examResult.correctAnswers} / {examResult.totalQuestions} düzgün cavab ({examResult.scorePercentage}%)
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-black font-mono">
                    {examResult.isPassed ? 'KEÇDİ' : 'KƏSİLDİ'}
                  </span>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_WIND_EXAM_QUESTIONS.map(q => {
                  const selected = examAnswers[q.id];
                  const res = examResult.results.find(r => r.questionId === q.id);
                  return (
                    <div key={q.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold text-white">
                          <span className="text-cyan-400 font-mono mr-2">#{q.id}</span>
                          {q.questionAz}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{q.articleRef}</span>
                      </div>

                      <div className="space-y-1.5">
                        {q.optionsAz.map((opt, oIdx) => {
                          const isSelected = selected === oIdx;
                          let optStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800';
                          if (examSubmitted) {
                            if (oIdx === q.correctOptionIndex) {
                              optStyle = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200';
                            } else if (isSelected) {
                              optStyle = 'bg-red-950/50 border-red-500/60 text-red-200';
                            }
                          } else if (isSelected) {
                            optStyle = 'bg-cyan-950/60 border-cyan-500 text-cyan-200';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(q.id, oIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && oIdx === q.correctOptionIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && res && (
                        <div className="p-2.5 bg-slate-950 rounded-lg text-xs text-slate-400 border border-slate-800/80">
                          <strong className="text-cyan-400 block mb-1">Rəsmi Qanunvericilik İzahı:</strong>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && currentCert && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    WIND-SAFE-AZ-2026 Rəsmi Külək Buraxılış Sertifikatı
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, ETSN və BDYP tərəfindən təsdiq olunmuş elektron QR və SİMA ştrix-kodlu sertifikat
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPassCode}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                  </button>
                  <button
                    onClick={handlePrintCertificate}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Printable Official Certificate Sheet */}
              <div className="p-8 bg-slate-900 border-2 border-cyan-500/40 rounded-2xl shadow-2xl relative overflow-hidden text-slate-200">
                <div className="flex justify-between items-start border-b border-slate-700 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                      AZƏRBAYCAN RESPUBLİKASI AAYDA & BDYP VAHİD PORTALI
                    </span>
                    <h2 className="text-xl font-black text-white mt-0.5">WIND-SAFE-AZ-2026 SERTİFİKATI</h2>
                    <span className="text-xs font-mono text-slate-400">ID: {currentCert.certificateId}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 text-xs font-bold rounded-full border bg-cyan-950/60 text-cyan-300 border-cyan-700/50">
                      {currentCert.complianceStatus}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">Tarix: {currentCert.issueDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-6">
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Nəqliyyat Nömrəsi</span>
                    <span className="font-bold text-white font-mono text-sm">{currentCert.vehiclePlate}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Nəqliyyat Modeli</span>
                    <span className="font-semibold text-slate-200">{currentCert.vehicleModel}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Təyin Olunmuş Dəhliz</span>
                    <span className="font-semibold text-slate-200">{currentCert.corridorName}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">RRF Aşırma Əmsalı</span>
                    <span className="font-bold text-cyan-400 font-mono text-sm">{currentCert.rolloverRiskFactor}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Dinamik Sürət Həddi</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">≤ {currentCert.dynamicSpeedLimitKmh} km/saat</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Şlaqbaum Keçid PİN-i</span>
                    <span className="font-black text-emerald-400 font-mono text-base tracking-widest">{currentCert.barrierPassCode}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                  <div className="space-y-1">
                    <div>SİMA Rəqəmsal İmza UID: <span className="font-mono text-slate-300">{currentCert.simaSignatureUid}</span></div>
                    <div>SHA-256 Checksum: <span className="font-mono text-slate-500 text-[10px]">{currentCert.sha256Checksum.slice(0, 32)}...</span></div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">QR Verifikasiya Keçidi:</span>
                    <span className="font-mono text-cyan-400 text-[10px]">{currentCert.qrVerificationUrl}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-400" />
                    WIND-SAFE Vahid Dövlət Reyestr Axtarışı
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və BDYP bazasında qeydiyyatdan keçmiş aktiv külək buraxılış vərəqələri
                  </p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={e => setRegistrySearch(e.target.value)}
                    placeholder="Sertifikat ID, dövlət nömrəsi, model..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Sertifikat ID</th>
                      <th className="p-3">Dövlət Nömrəsi</th>
                      <th className="p-3">Nəqliyyat Modeli</th>
                      <th className="p-3">Dəhliz</th>
                      <th className="p-3">RRF</th>
                      <th className="p-3">Sürət</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">PİN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredCertificates.map(cert => (
                      <tr key={cert.certificateId} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 font-semibold text-cyan-400">{cert.certificateId}</td>
                        <td className="p-3 font-bold text-white">{cert.vehiclePlate}</td>
                        <td className="p-3 font-sans text-slate-300">{cert.vehicleModel}</td>
                        <td className="p-3 font-sans text-slate-400 truncate max-w-xs">{cert.corridorName}</td>
                        <td className="p-3 font-bold text-amber-400">{cert.rolloverRiskFactor}</td>
                        <td className="p-3">{cert.dynamicSpeedLimitKmh} km/s</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            cert.complianceStatus === 'PERMITTED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : cert.complianceStatus === 'SPEED_RESTRICTED'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}>
                            {cert.complianceStatus}
                          </span>
                        </td>
                        <td className="p-3 font-black text-emerald-400">{cert.barrierPassCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AAYDA SCADA Serveri: Canlı Əlaqə Qurulub (Gecikmə: 18ms)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Bağla
          </button>
        </div>
      </div>
    </Modal>
  );
};
