import React, { useState, useMemo } from 'react';
import {
  Waves,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Search,
  ExternalLink,
  Activity,
  Calculator,
  Sliders,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  Info,
  AlertOctagon,
  Zap,
  Gauge,
  Droplets,
  RotateCcw,
  Check,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  UnderpassId,
  UNDERPASS_REGISTRY,
  VEHICLE_FLOOD_PROFILES,
  VehicleClass,
  formatCurrency,
  evaluateHydroLockRisk,
  calculateDrainageMetrics,
  calculateEnergyConsumption,
  calculateStatutoryFloodFines,
  INITIAL_DRAINAGE_CHECKLIST,
  FLOOD_EXAM_QUESTIONS,
  generateFloodGuardCertificate,
  FloodGuardCertificate,
  DrainageSafetyChecklist,
} from '../utils/floodGuardCompliance';
import {
  MOCK_VEHICLE_PRESETS,
  MOCK_FLOOD_CERTIFICATES,
} from '../data/mockFloodGuardData';

interface HighwayFloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

type TabType = 'radar' | 'scada' | 'hydrolock' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const HighwayFloodModal: React.FC<HighwayFloodModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');
  const [selectedUnderpassId, setSelectedUnderpassId] = useState<UnderpassId>('sabunchu_tunnel');
  const [radarSearchQuery, setRadarSearchQuery] = useState('');

  // SCADA state
  const selectedUnderpass = UNDERPASS_REGISTRY[selectedUnderpassId];
  const [waterDepthMm, setWaterDepthMm] = useState<number>(selectedUnderpass.defaultWaterLevelMm);
  const [activePumpsCount, setActivePumpsCount] = useState<number>(Math.floor(selectedUnderpass.totalPumpsCount / 2));
  const [rainIntensityMmH, setRainIntensityMmH] = useState<number>(selectedUnderpass.defaultRainIntensityMmH);
  const [pumpingDurationHours, setPumpingDurationHours] = useState<number>(4);

  // Hydro-lock vehicle state
  const [selectedVehicleClass, setSelectedVehicleClass] = useState<VehicleClass>('sedan_compact');
  const [plateNumber, setPlateNumber] = useState<string>(
    targetCar?.vin ? `99-${targetCar.vin.substring(0, 2).toUpperCase()}-101` : '99-FL-101'
  );
  const [promptFineDiscount, setPromptFineDiscount] = useState<boolean>(true);
  const [selectedFineViolation, setSelectedFineViolation] = useState<'barrier_breach' | 'stalled_blocking' | 'speeding_in_flood'>('barrier_breach');

  // Checklist state
  const [checklist, setChecklist] = useState<DrainageSafetyChecklist[]>(INITIAL_DRAINAGE_CHECKLIST);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [generatedCertificate, setGeneratedCertificate] = useState<FloodGuardCertificate | null>(null);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Registry state
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryCertificates, setRegistryCertificates] = useState<FloodGuardCertificate[]>(MOCK_FLOOD_CERTIFICATES);

  // Computed SCADA metrics
  const drainageMetrics = useMemo(() => {
    return calculateDrainageMetrics(selectedUnderpass, waterDepthMm, activePumpsCount, rainIntensityMmH);
  }, [selectedUnderpass, waterDepthMm, activePumpsCount, rainIntensityMmH]);

  const energyMetrics = useMemo(() => {
    return calculateEnergyConsumption(selectedUnderpass, activePumpsCount, pumpingDurationHours, currency);
  }, [selectedUnderpass, activePumpsCount, pumpingDurationHours, currency]);

  // Computed Hydro-lock Risk
  const hydroLockRisk = useMemo(() => {
    return evaluateHydroLockRisk(waterDepthMm, selectedVehicleClass);
  }, [waterDepthMm, selectedVehicleClass]);

  // Computed Statutory Fine
  const fineCalculation = useMemo(() => {
    return calculateStatutoryFloodFines(selectedFineViolation, promptFineDiscount, currency);
  }, [selectedFineViolation, promptFineDiscount, currency]);

  // Exam score
  const examScore = useMemo(() => {
    let correct = 0;
    FLOOD_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    return correct;
  }, [examAnswers]);

  // Filtered radar underpasses
  const filteredUnderpasses = useMemo(() => {
    const list = Object.values(UNDERPASS_REGISTRY);
    if (!radarSearchQuery.trim()) return list;
    const q = radarSearchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.nameAz.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.locationAz.toLowerCase().includes(q)
    );
  }, [radarSearchQuery]);

  // Filtered registry certificates
  const filteredRegistryCertificates = useMemo(() => {
    if (!registrySearch.trim()) return registryCertificates;
    const q = registrySearch.toLowerCase();
    return registryCertificates.filter(
      (c) =>
        c.certificateId.toLowerCase().includes(q) ||
        c.vehiclePlate.toLowerCase().includes(q) ||
        c.underpassNameAz.toLowerCase().includes(q)
    );
  }, [registrySearch, registryCertificates]);

  const handleSelectUnderpass = (id: UnderpassId) => {
    setSelectedUnderpassId(id);
    const item = UNDERPASS_REGISTRY[id];
    setWaterDepthMm(item.defaultWaterLevelMm);
    setActivePumpsCount(Math.floor(item.totalPumpsCount / 2));
    setRainIntensityMmH(item.defaultRainIntensityMmH);
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const handleVerifyAllChecklist = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, passed: true })));
  };

  const handleAnswerExam = (questionId: number, optionIndex: number) => {
    if (isExamSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setIsExamSubmitted(false);
  };

  const handleGenerateCertificate = () => {
    const cert = generateFloodGuardCertificate(
      selectedUnderpass,
      plateNumber,
      selectedVehicleClass,
      waterDepthMm,
      hydroLockRisk
    );
    setGeneratedCertificate(cert);
    setRegistryCertificates((prev) => [cert, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const applyVehiclePreset = (preset: typeof MOCK_VEHICLE_PRESETS[0]) => {
    setPlateNumber(preset.plate);
    setSelectedVehicleClass(preset.vehicleClass);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col h-[90vh] max-h-[920px] bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-wide">
                  FLOOD-GUARD-AZ-2026
                </span>
                <Badge variant="info" className="border-blue-400/50 text-blue-400 text-xs">
                  AAYDA • FHN • ADSEA • BDYP
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Avtomobil Yolları və Yolötürücü Keçidlərdə Subasma, Drenaj SCADA & Hidrostatik Telemetriya Portalı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === c
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Bağla
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/80 overflow-x-auto gap-1">
          {[
            { id: 'radar', labelAz: 'Keçidlər Radarı', icon: MapPin },
            { id: 'scada', labelAz: 'Drenaj SCADA Standı', icon: Activity },
            { id: 'hydrolock', labelAz: 'Hidrozərbə Riski', icon: AlertOctagon },
            { id: 'checklist', labelAz: 'Təhlükəsizlik Siyahısı', icon: ShieldCheck },
            { id: 'exam', labelAz: 'Nəzəri İmtahan', icon: FileCheck2 },
            { id: 'certificate', labelAz: 'E-Buraxılış Vərəqəsi', icon: FileText },
            { id: 'registry', labelAz: 'Vahid Reyestr', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{tab.labelAz}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    Bakı və Abşeron Subasma Təhlükəli Yolötürücü Keçidləri
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və FHN sensor telemetriyası ilə təchiz olunmuş 6 strateji körpüaltı tunel qovşağı
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={radarSearchQuery}
                    onChange={(e) => setRadarSearchQuery(e.target.value)}
                    placeholder="Keçid və ya küçə axtar..."
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUnderpasses.map((item) => {
                  const isSelected = selectedUnderpassId === item.id;
                  const itemMetrics = calculateDrainageMetrics(
                    item,
                    item.defaultWaterLevelMm,
                    Math.floor(item.totalPumpsCount / 2),
                    item.defaultRainIntensityMmH
                  );

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectUnderpass(item.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50 shadow-lg'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-bold text-sm text-white">{item.nameAz}</span>
                        <Badge
                          variant={
                            itemMetrics.warningLevel === 'normal'
                              ? 'success'
                              : itemMetrics.warningLevel === 'caution'
                              ? 'warning'
                              : 'danger'
                          }
                          className={
                            itemMetrics.warningLevel === 'normal'
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : itemMetrics.warningLevel === 'caution'
                              ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                              : 'border-red-500/40 text-red-400 bg-red-500/10'
                          }
                        >
                          {itemMetrics.warningLevel === 'normal'
                            ? 'Normal'
                            : itemMetrics.warningLevel === 'caution'
                            ? 'Xəbərdarlıq'
                            : 'Bağlanma'}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {item.locationAz}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 mb-3">
                        <div>
                          <span className="text-slate-500 block">Su Dərinliyi:</span>
                          <span className="font-semibold text-blue-400">
                            {item.defaultWaterLevelMm} mm ({(item.defaultWaterLevelMm / 10).toFixed(1)} sm)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Drenaj Nasosu:</span>
                          <span className="font-semibold text-slate-200">
                            {item.totalPumpsCount} ədəd ({(item.pumpCapacityM3h * item.totalPumpsCount)} m³/s)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Rezervuar Həcmi:</span>
                          <span className="font-semibold text-slate-200">
                            {item.retentionBasinCapacityM3.toLocaleString()} m³
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Kollektor:</span>
                          <span className="font-semibold text-slate-200">
                            Ø {item.collectorDiameterMm} mm
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
                        <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
                          {item.fhnDispatchStationAz}
                        </span>
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Underpass Detailed Overview Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 border border-slate-700 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                      Seçilmiş Keçid Strateji Məlumatları
                    </span>
                    <h4 className="text-lg font-bold text-white">{selectedUnderpass.nameAz}</h4>
                    <p className="text-xs text-slate-400">{selectedUnderpass.locationAz}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('scada')}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    SCADA İdarəetməsinə Keç
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Su Toplama Sahəsi:</span>
                    <span className="text-base font-bold text-white">{selectedUnderpass.catchmentAreaHa} ha</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Ehtiyat Qəza Generatorları:</span>
                    <span className="text-base font-bold text-emerald-400">{selectedUnderpass.backupGeneratorsCount}x Dizel ATS</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Kritik Qapanma Həddi:</span>
                    <span className="text-base font-bold text-red-400">{selectedUnderpass.closureThresholdMm} mm ({selectedUnderpass.closureThresholdMm / 10} sm)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Operativ Qaynar Xətt:</span>
                    <span className="text-xs font-bold text-cyan-400">{selectedUnderpass.emergencyHotline}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA STAND */}
          {activeTab === 'scada' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    SCADA Drenaj Nasosları və Hidrostatik Su Səviyyəsi Standı
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedUnderpass.nameAz} üzrə su səviyyəsi, leysan intensivliyi və nasos debetinin idarə edilməsi
                  </p>
                </div>

                <Badge
                  variant={
                    drainageMetrics.gateStatus === 'fully_barricaded'
                      ? 'danger'
                      : drainageMetrics.gateStatus === 'closing_countdown'
                      ? 'warning'
                      : 'success'
                  }
                  className={
                    drainageMetrics.gateStatus === 'fully_barricaded'
                      ? 'border-red-500 text-red-400 bg-red-500/10'
                      : drainageMetrics.gateStatus === 'closing_countdown'
                      ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                      : 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  }
                >
                  Baryer: {drainageMetrics.gateStatus === 'fully_barricaded' ? 'Yol Tam Bağlanıb' : drainageMetrics.gateStatus === 'closing_countdown' ? 'Bağlanma Rejimi' : 'Sərbəst Hərəkət'}
                </Badge>
              </div>

              {/* Water Column & Status Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Depth Gauge */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    Canlı Ultrasəs Su Səviyyəsi Göstəricisi
                  </span>

                  <div className="flex items-center justify-center my-4">
                    <div className="relative w-36 h-64 bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden flex flex-col justify-end shadow-inner">
                      {/* Grid tick marks */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-1.5 opacity-30 text-[9px] font-mono">
                        <span className="text-red-400 border-b border-red-500/40">500 mm</span>
                        <span className="text-red-400 border-b border-red-500/40">400 mm (Baryer)</span>
                        <span className="text-amber-400 border-b border-amber-500/40">300 mm (Kritik)</span>
                        <span className="text-amber-400 border-b border-amber-500/40">150 mm (Xəbərdarlıq)</span>
                        <span className="text-emerald-400">0 mm</span>
                      </div>

                      {/* Water fluid layer */}
                      <div
                        className={`w-full transition-all duration-300 relative ${
                          waterDepthMm >= selectedUnderpass.closureThresholdMm
                            ? 'bg-gradient-to-t from-red-600 via-rose-500 to-red-400'
                            : waterDepthMm >= selectedUnderpass.criticalThresholdMm
                            ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400'
                            : 'bg-gradient-to-t from-blue-700 via-cyan-600 to-sky-400'
                        }`}
                        style={{ height: `${Math.min(100, (waterDepthMm / 500) * 100)}%` }}
                      >
                        <div className="absolute inset-x-0 top-0 h-2 bg-white/40 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">Ölçülən Su Dərinliyi:</span>
                    <span className="text-2xl font-black text-white">
                      {waterDepthMm} <span className="text-sm font-normal text-slate-400">mm</span> ({(waterDepthMm / 10).toFixed(1)} sm)
                    </span>
                  </div>
                </div>

                {/* SCADA Sliders & Controls */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        Simulyasiya Olunan Su Dərinliyi (mm):
                      </label>
                      <span className="text-xs font-mono font-bold text-blue-400">{waterDepthMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={600}
                      step={5}
                      value={waterDepthMm}
                      onChange={(e) => setWaterDepthMm(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0 mm (Quru)</span>
                      <span>150 mm (Xəbərdarlıq)</span>
                      <span>300 mm (Kritik)</span>
                      <span>400 mm (Tam Qapanma)</span>
                      <span>600 mm</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Aktiv Drenaj Nasoslarının Sayı ({selectedUnderpass.totalPumpsCount}-dan):
                      </label>
                      <span className="text-xs font-mono font-bold text-emerald-400">{activePumpsCount} ədəd</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={selectedUnderpass.totalPumpsCount}
                      step={1}
                      value={activePumpsCount}
                      onChange={(e) => setActivePumpsCount(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0 (Qəza / Deaktiv)</span>
                      <span>{Math.floor(selectedUnderpass.totalPumpsCount / 2)} (Standart)</span>
                      <span>{selectedUnderpass.totalPumpsCount} (Maksimum Güc)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Waves className="w-4 h-4 text-cyan-400" />
                        Leysan Yağış İntensivliyi (mm/saat):
                      </label>
                      <span className="text-xs font-mono font-bold text-cyan-400">{rainIntensityMmH} mm/saat</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      step={1}
                      value={rainIntensityMmH}
                      onChange={(e) => setRainIntensityMmH(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0 mm/s (Quru)</span>
                      <span>15 mm/s (Orta yağış)</span>
                      <span>35 mm/s (Güclü leysan)</span>
                      <span>60 mm/s (Tropik/Subasma)</span>
                    </div>
                  </div>

                  {/* Calculated Discharge & Drain Telemetry */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-700/60 text-xs">
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Yağış Axımı:</span>
                      <span className="font-bold text-cyan-300">{drainageMetrics.rainInflowRateM3h.toLocaleString()} m³/s</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Nasos İfrazatı:</span>
                      <span className="font-bold text-emerald-400">{drainageMetrics.totalPumpingDischargeM3h.toLocaleString()} m³/s</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Xalis Boşalma:</span>
                      <span className={`font-bold ${drainageMetrics.netDrainageRateM3h > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {drainageMetrics.netDrainageRateM3h > 0 ? `+${drainageMetrics.netDrainageRateM3h}` : drainageMetrics.netDrainageRateM3h} m³/s
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Tam Boşalma Vaxtı:</span>
                      <span className="font-bold text-white">
                        {drainageMetrics.timeToCompleteDrainageMinutes >= 999
                          ? 'Səviyyə artır!'
                          : `${drainageMetrics.timeToCompleteDrainageMinutes} dəq`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Energy & Operational Costs Card */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    SCADA Nasoslarının Enerji Sərfiyyatı və İstismar Xərcləri
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">İstismar müddəti:</span>
                    <input
                      type="number"
                      min={1}
                      max={48}
                      value={pumpingDurationHours}
                      onChange={(e) => setPumpingDurationHours(Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-center text-white"
                    />
                    <span className="text-xs text-slate-400">saat</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Ümumi Nasos Gücü:</span>
                    <span className="text-base font-bold text-white">
                      {activePumpsCount * selectedUnderpass.pumpPowerKw} kVt ({activePumpsCount}x {selectedUnderpass.pumpPowerKw} kVt)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Elektrik Enerjisi Həcmi:</span>
                    <span className="text-base font-bold text-amber-400">
                      {energyMetrics.totalKwh.toLocaleString()} kVt•saat
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Bələdiyyə Elektrik Xərci:</span>
                    <span className="text-base font-bold text-emerald-400">
                      {energyMetrics.formattedCost}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HYDROLOCK RISK STAND */}
          {activeTab === 'hydrolock' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-amber-400" />
                  Mühərrikin Hidrozərbə (Hydro-Lock) və EV Batareya İzolasiyası Riski
                </h3>
                <p className="text-xs text-slate-400">
                  Cari {waterDepthMm} mm su səviyyəsində seçilmiş nəqliyyat vasitəsinin zədələnmə ehtimalı və qanunvericilik cərimələri
                </p>
              </div>

              {/* Quick Vehicle Presets */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-400 self-center mr-1">Hazır Avtomobil Preseti:</span>
                {MOCK_VEHICLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyVehiclePreset(p)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <span className="font-mono text-cyan-400 font-bold">{p.plate}</span>
                    <span>{p.makeModel.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Vehicle Selection & Specs Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
                  <span className="text-xs font-semibold text-slate-300 block">Nəqliyyat Kateqoriyası:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(VEHICLE_FLOOD_PROFILES) as VehicleClass[]).map((vKey) => {
                      const prof = VEHICLE_FLOOD_PROFILES[vKey];
                      const isSelected = selectedVehicleClass === vKey;
                      return (
                        <div
                          key={vKey}
                          onClick={() => setSelectedVehicleClass(vKey)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-950/50 border-blue-500 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs font-bold mb-1">
                            <span>{prof.nameAz}</span>
                            <span className="font-mono text-cyan-400">Klirens: {prof.groundClearanceMm} mm</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Hava Girişi: {prof.isElectric ? 'Yoxdur (Elektro)' : `${prof.airIntakeHeightMm} mm`}</span>
                            <span>{prof.waterproofRating}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Risk Evaluation Result Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs text-slate-400">Diaqnostik Risk Səviyyəsi:</span>
                        <h4 className="text-xl font-black text-white flex items-center gap-2">
                          {hydroLockRisk.riskLevel === 'safe' && <span className="text-emerald-400">Təhlükəsiz (Keçid Mümkündür)</span>}
                          {hydroLockRisk.riskLevel === 'caution' && <span className="text-amber-400">Xəbərdarlıq (Diqqətli Hərəkət)</span>}
                          {hydroLockRisk.riskLevel === 'critical' && <span className="text-rose-400">Kritik Risk (Hidrozərbə Təhlükəsi)</span>}
                          {hydroLockRisk.riskLevel === 'severe_danger' && <span className="text-red-500">FÖVQƏLADƏ TƏHLÜKƏ!</span>}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400">Zədələnmə Ehtimalı:</span>
                        <span className="text-2xl font-black font-mono text-amber-400 block">
                          {hydroLockRisk.riskScorePercent}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 mb-4 leading-relaxed">
                      {hydroLockRisk.recommendationAz}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Klirens Ehtiyatı:</span>
                        <span className={`font-bold ${hydroLockRisk.clearanceExceeded ? 'text-red-400' : 'text-emerald-400'}`}>
                          {hydroLockRisk.clearanceExceeded ? 'Aşılıb (Su altındadır)' : 'Təhlükəsiz'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Hava Filtrləri Məsafəsi:</span>
                        <span className="font-bold text-white">
                          {VEHICLE_FLOOD_PROFILES[selectedVehicleClass].isElectric
                            ? 'Elektromobil'
                            : `${hydroLockRisk.airIntakeMarginMm} mm qalıb`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Təxmini Hidrozərbə Təmir Xərci:</span>
                      <span className="font-bold text-red-400 text-sm">
                        {formatCurrency(hydroLockRisk.estimatedDamageAzn, currency)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('certificate')}
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      E-Vərəqə Al
                    </Button>
                  </div>
                </div>
              </div>

              {/* Statutory Fines Section */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    İnzibati Xətalar Məcəlləsi (İXM) üzrə Subasma Qaydalarının Pozulması Cərimələri
                  </h4>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promptFineDiscount}
                      onChange={(e) => setPromptFineDiscount(e.target.checked)}
                      className="rounded accent-blue-500"
                    />
                    <span>30 gün ərzində 50% erkən ödəniş güzəşti</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'barrier_breach', label: 'Qadağanedici Baryeri Pozmaq (İXM 327.1)' },
                    { id: 'stalled_blocking', label: 'Nasaz Maşını Keçiddə Tərk Etmək (İXM 346.1)' },
                    { id: 'speeding_in_flood', label: 'Su Qatında Təhlükəli Sürət (İXM 328.1)' },
                  ].map((viol) => (
                    <button
                      key={viol.id}
                      onClick={() => setSelectedFineViolation(viol.id as any)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedFineViolation === viol.id
                          ? 'bg-rose-950/40 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-semibold block">{viol.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{fineCalculation.articleCitation}</span>
                    <span className="text-slate-200">
                      Baza Məbləğ: {fineCalculation.baseFineAzn} AZN • Cərimə Balı: {fineCalculation.demeritPoints} bal
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Ödəniləcək Cərimə:</span>
                    <span className="text-lg font-black text-rose-400">{fineCalculation.formattedFinalFine}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    10 Bəndlik Drenaj və Yol Subasma Təhlükəsizlik Reqlamenti
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, FHN və ADSEA birgə texniki nəzarət standartlarına uyğunluq auditi
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleVerifyAllChecklist}
                  className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                >
                  Bütün Bəndləri Təsdiqlə
                </Button>
              </div>

              <div className="space-y-2.5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      item.passed
                        ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                        : 'bg-red-950/20 border-red-500/40 text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          item.passed
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {item.passed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{item.titleAz}</span>
                        <span className="text-[11px] text-slate-400">{item.titleEn}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px] border-slate-600 text-slate-400">
                        {item.standardCitation}
                      </Badge>
                      <Badge
                        variant={item.criticality === 'critical' ? 'danger' : 'info'}
                        className={
                          item.criticality === 'critical'
                            ? 'border-red-500/40 text-red-400'
                            : 'border-blue-500/40 text-blue-400'
                        }
                      >
                        {item.criticality === 'critical' ? 'Kritik' : 'Yüksək'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-blue-400" />
                    Subasma Təhlükəsizliyi və Qəza Davranışı Nəzəri İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Körpüaltı tunellərdə təxliyə, hidrozərbənin qarşısının alınması və İXM cərimələri üzrə 10 suallıq test
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isExamSubmitted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetExam}
                      className="border-slate-700 text-slate-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Yenidən Başla
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setIsExamSubmitted(true)}
                      disabled={Object.keys(examAnswers).length < 10}
                      className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                    >
                      İmtahanı Tamamla
                    </Button>
                  )}
                </div>
              </div>

              {isExamSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    examScore >= 8
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : 'bg-red-950/40 border-red-500 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {examScore >= 8 ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <span className="font-bold text-sm block">
                        {examScore >= 8
                          ? 'İmtahan Uğurla Keçildi! (Sertifikat Hüququ Təsdiqləndi)'
                          : 'İmtahan Nəticəsi Qeyri-Qənaətbəxşdir (Təkrar cəhd edin)'}
                      </span>
                      <span className="text-xs opacity-80">
                        Düzgün cavab: 10 sualdan {examScore} bal (Keçid balı: 8/10)
                      </span>
                    </div>
                  </div>
                  <Badge variant={examScore >= 8 ? 'success' : 'danger'} className="text-sm font-bold px-3 py-1">
                    {examScore * 10}%
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                {FLOOD_EXAM_QUESTIONS.map((q) => {
                  const selectedOption = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3"
                    >
                      <span className="font-semibold text-xs text-white block">
                        {q.id}. {q.questionAz}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.optionsAz.map((opt, oIdx) => {
                          const isChosen = selectedOption === oIdx;
                          let optionClass =
                            'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                          if (isExamSubmitted) {
                            if (oIdx === q.correctIndex) {
                              optionClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                            } else if (isChosen && oIdx !== q.correctIndex) {
                              optionClass = 'bg-red-950/60 border-red-500 text-red-200';
                            }
                          } else if (isChosen) {
                            optionClass = 'bg-blue-950/60 border-blue-500 text-white';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleAnswerExam(q.id, oIdx)}
                              className={`p-2.5 rounded-lg border text-left transition-all ${optionClass}`}
                            >
                              <span className="font-mono font-bold mr-1.5">{String.fromCharCode(65 + oIdx)})</span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <strong className="text-slate-300">İzah:</strong> {q.explanationAz}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    FLOOD-GUARD-AZ-2026 Rəsmi Elektron Buraxılış Vərəqəsi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Subasma zonasında qanuni keçid və təhlükəsizlik icazə sənədinin generasiyası
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleGenerateCertificate}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    Yeni Vərəqə Generasiya Et
                  </Button>
                </div>
              </div>

              {/* Certificate Input Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Nəqliyyat Dövlət Nömrə Nişanı:</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Yolötürücü Keçid:</label>
                  <select
                    value={selectedUnderpassId}
                    onChange={(e) => handleSelectUnderpass(e.target.value as UnderpassId)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.values(UNDERPASS_REGISTRY).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameAz}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nəqliyyat Kateqoriyası:</label>
                  <select
                    value={selectedVehicleClass}
                    onChange={(e) => setSelectedVehicleClass(e.target.value as VehicleClass)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.keys(VEHICLE_FLOOD_PROFILES).map((k) => (
                      <option key={k} value={k}>
                        {VEHICLE_FLOOD_PROFILES[k as VehicleClass].nameAz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Printable Official Certificate View */}
              {generatedCertificate ? (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-blue-500/40 shadow-2xl space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-400">
                        <Waves className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest block">
                          AZƏRBAYCAN RESPUBLİKASI RƏSMİ ELEKTRON DRENAJ SERTİFİKATI
                        </span>
                        <h4 className="text-xl font-black text-white tracking-wide">
                          {generatedCertificate.certificateId}
                        </h4>
                        <span className="text-xs text-slate-400">
                          AAYDA & FHN Mərkəzi Dispetçer İdarəsi
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyCode(generatedCertificate.certificateId)}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        {hasCopiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePrintCertificate}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        Çap Et
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="text-base font-bold font-mono text-cyan-400">
                        {generatedCertificate.vehiclePlate}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Ölçülən Su Dərinliyi:</span>
                      <span className="text-base font-bold text-white">
                        {generatedCertificate.measuredWaterDepthMm} mm
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Baryer Buraxılış PIN Kodu:</span>
                      <span className="text-base font-bold font-mono text-amber-400">
                        {generatedCertificate.barrierPassPinCode}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Qiymətləndirilmiş Risk:</span>
                      <span className="text-base font-bold text-emerald-400 uppercase">
                        {generatedCertificate.evaluatedRiskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] space-y-1 font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Keçid Yeri:</span>
                      <span className="text-slate-200">{generatedCertificate.underpassNameAz}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SİMA Rəqəmsal İmza UID:</span>
                      <span className="text-slate-200">{generatedCertificate.simaDigitalUid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SHA-256 İnteqrallıq Həşi:</span>
                      <span className="text-slate-200 truncate max-w-[280px]">{generatedCertificate.sha256Checksum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Təftişçi Çağırış Kodu:</span>
                      <span className="text-slate-200">{generatedCertificate.aaydaInspectorCallsign}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Etibarlılıq Müddəti:</span>
                      <span className="text-emerald-400">
                        {new Date(generatedCertificate.validUntil).toLocaleString('az-AZ')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                  <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <span className="text-sm font-semibold text-slate-300 block mb-1">
                    Elektron Buraxılış Vərəqəsi hələ generasiya edilməyib
                  </span>
                  <p className="text-xs text-slate-500 mb-4">
                    Yuxarıdakı "Yeni Vərəqə Generasiya Et" düyməsini sıxaraq rəsmi icazə sənədini yaradın
                  </p>
                  <Button
                    size="sm"
                    onClick={handleGenerateCertificate}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    İndi Generasiya Et
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    Vahid AAYDA & FHN Subasma Buraxılış Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aktiv və arxivləşdirilmiş dövlət elektron icazə vərəqələrinin mərkəzləşdirilmiş axtarışı
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Sertifikat ID və ya Nömrə axtar..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredRegistryCertificates.map((cert) => (
                  <div
                    key={cert.certificateId}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-white">{cert.certificateId}</span>
                        <Badge
                          variant={cert.status === 'active_valid' ? 'success' : 'default'}
                          className={
                            cert.status === 'active_valid'
                              ? 'border-emerald-500/40 text-emerald-400'
                              : 'border-slate-500/40 text-slate-400'
                          }
                        >
                          {cert.status === 'active_valid' ? 'Qüvvədədir' : 'Müddəti Bitib'}
                        </Badge>
                      </div>
                      <span className="text-slate-300 block">{cert.underpassNameAz}</span>
                      <span className="text-[11px] text-slate-500">
                        {cert.aaydaInspectorCallsign} • SİMA: {cert.simaDigitalUid}
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 text-sm">{cert.vehiclePlate}</span>
                      <span className="text-[11px] text-slate-400">
                        Su: {cert.measuredWaterDepthMm} mm • PIN: {cert.barrierPassPinCode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
