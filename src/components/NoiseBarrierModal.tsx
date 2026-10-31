import React, { useState, useMemo } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Award,
  Search,
  Printer,
  Copy,
  Check,
  ChevronRight,
  Info,
  Car,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  NoiseBarrierCorridor,
  AcousticCalculationInput,
  RoadSurfaceType,
  VehicleExhaustTestInput,
  NoiseGuardCertificate,
  calculateAcousticPropagation,
  evaluateVehicleExhaustAcoustics,
  evaluateNoiseChecklist,
  gradeNoiseExam,
  generateNoiseGuardCertificate,
  searchNoiseCertificates,
  convertNoiseCurrency,
} from '../utils/noiseBarrierCompliance';
import {
  MOCK_NOISE_BARRIER_CORRIDORS,
  MOCK_VEHICLE_ACOUSTIC_PRESETS,
  MOCK_NOISE_CHECKLIST_ITEMS,
  MOCK_NOISE_EXAM_QUESTIONS,
  MOCK_NOISE_GUARD_CERTIFICATES,
} from '../data/mockNoiseBarrierData';

interface NoiseBarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialVehicle?: Vehicle | null;
}

type ModalTab = 'radar' | 'scada' | 'exhaust' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const NoiseBarrierModal: React.FC<NoiseBarrierModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('radar');
  const [selectedCorridor, setSelectedCorridor] = useState<NoiseBarrierCorridor>(
    MOCK_NOISE_BARRIER_CORRIDORS[0]
  );
  const [corridorSearchQuery, setCorridorSearchQuery] = useState('');

  // SCADA Attenuation Telemetry Stand State
  const [trafficVolumeVph, setTrafficVolumeVph] = useState<number>(selectedCorridor.trafficVolumeVph);
  const [heavyTruckPercentage, setHeavyTruckPercentage] = useState<number>(selectedCorridor.heavyTruckPercentage);
  const [speedKmH, setSpeedKmH] = useState<number>(selectedCorridor.speedLimitKmH);
  const [roadSurface, setRoadSurface] = useState<RoadSurfaceType>('dense_asphalt');
  const [barrierHeightMeters, setBarrierHeightMeters] = useState<number>(selectedCorridor.barrierHeightMeters);
  const [roadToBarrierDistanceMeters, setRoadToBarrierDistanceMeters] = useState<number>(4);
  const [barrierToReceiverDistanceMeters, setBarrierToReceiverDistanceMeters] = useState<number>(
    selectedCorridor.nearestFaçadeDistanceMeters
  );

  // Vehicle Exhaust Decibel Testing State
  const [vehiclePlate, setVehiclePlate] = useState<string>(
    initialVehicle?.plateNumber || MOCK_VEHICLE_ACOUSTIC_PRESETS[0].vehiclePlate
  );
  const [vehicleModel, setVehicleModel] = useState<string>(
    initialVehicle ? `${initialVehicle.make} ${initialVehicle.model}` : MOCK_VEHICLE_ACOUSTIC_PRESETS[0].vehicleModel
  );
  const [exhaustType, setExhaustType] = useState<VehicleExhaustTestInput['exhaustType']>(
    MOCK_VEHICLE_ACOUSTIC_PRESETS[0].exhaustType
  );
  const [measuredRpm, setMeasuredRpm] = useState<number>(2500);
  const [measuredExhaustDba, setMeasuredExhaustDba] = useState<number>(MOCK_VEHICLE_ACOUSTIC_PRESETS[0].measuredExhaustDba);
  const [measuredHornDba, setMeasuredHornDba] = useState<number>(MOCK_VEHICLE_ACOUSTIC_PRESETS[0].measuredHornDba);
  const [hasModifiedMuffler, setHasModifiedMuffler] = useState<boolean>(false);
  const [hasBypassValve, setHasBypassValve] = useState<boolean>(false);
  const [testedInResidentialZone, setTestedInResidentialZone] = useState<boolean>(false);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<string[]>([
    'chk-01',
    'chk-02',
    'chk-03',
    'chk-04',
    'chk-05',
    'chk-07',
  ]);

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificate & Registry State
  const [certificates, setCertificates] = useState<NoiseGuardCertificate[]>(MOCK_NOISE_GUARD_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<NoiseGuardCertificate>(MOCK_NOISE_GUARD_CERTIFICATES[0]);
  const [registryQuery, setRegistryQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Calculation Results
  const acousticResult = useMemo(() => {
    const input: AcousticCalculationInput = {
      trafficVolumeVph,
      heavyTruckPercentage,
      speedKmH,
      roadSurface,
      barrierHeightMeters,
      roadToBarrierDistanceMeters,
      barrierToReceiverDistanceMeters,
      receiverHeightMeters: 4.0, // 2nd floor window
      sourceHeightMeters: 0.5,
    };
    return calculateAcousticPropagation(input);
  }, [
    trafficVolumeVph,
    heavyTruckPercentage,
    speedKmH,
    roadSurface,
    barrierHeightMeters,
    roadToBarrierDistanceMeters,
    barrierToReceiverDistanceMeters,
  ]);

  const exhaustResult = useMemo(() => {
    return evaluateVehicleExhaustAcoustics({
      vehiclePlate,
      vehicleModel,
      exhaustType,
      measuredRpm,
      measuredExhaustDba,
      measuredHornDba,
      hasModifiedMuffler,
      hasBypassValve,
      testedInResidentialZone,
    });
  }, [
    vehiclePlate,
    vehicleModel,
    exhaustType,
    measuredRpm,
    measuredExhaustDba,
    measuredHornDba,
    hasModifiedMuffler,
    hasBypassValve,
    testedInResidentialZone,
  ]);

  const checklistResult = useMemo(() => {
    return evaluateNoiseChecklist(checkedItems, MOCK_NOISE_CHECKLIST_ITEMS);
  }, [checkedItems]);

  const examResult = useMemo(() => {
    return gradeNoiseExam(examAnswers, MOCK_NOISE_EXAM_QUESTIONS);
  }, [examAnswers]);

  const filteredCorridors = useMemo(() => {
    const q = corridorSearchQuery.toLowerCase();
    if (!q) return MOCK_NOISE_BARRIER_CORRIDORS;
    return MOCK_NOISE_BARRIER_CORRIDORS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.roadCode.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.residentialSettlement.toLowerCase().includes(q)
    );
  }, [corridorSearchQuery]);

  const filteredCertificates = useMemo(() => {
    return searchNoiseCertificates(registryQuery, certificates);
  }, [registryQuery, certificates]);

  if (!isOpen) return null;

  const handleSelectCorridor = (c: NoiseBarrierCorridor) => {
    setSelectedCorridor(c);
    setTrafficVolumeVph(c.trafficVolumeVph);
    setHeavyTruckPercentage(c.heavyTruckPercentage);
    setSpeedKmH(c.speedLimitKmH);
    setBarrierHeightMeters(c.barrierHeightMeters);
    setBarrierToReceiverDistanceMeters(c.nearestFaçadeDistanceMeters);
  };

  const handleApplyVehiclePreset = (preset: typeof MOCK_VEHICLE_ACOUSTIC_PRESETS[0]) => {
    setVehiclePlate(preset.vehiclePlate);
    setVehicleModel(preset.vehicleModel);
    setExhaustType(preset.exhaustType);
    setMeasuredRpm(preset.measuredRpm);
    setMeasuredExhaustDba(preset.measuredExhaustDba);
    setMeasuredHornDba(preset.measuredHornDba);
    setHasModifiedMuffler(preset.hasModifiedMuffler);
    setHasBypassValve(preset.hasBypassValve);
    setTestedInResidentialZone(preset.testedInResidentialZone);
  };

  const handleToggleChecklistItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    setCheckedItems(MOCK_NOISE_CHECKLIST_ITEMS.map((item) => item.id));
  };

  const handleResetChecklist = () => {
    setCheckedItems([]);
  };

  const handleGenerateCertificate = () => {
    const cert = generateNoiseGuardCertificate({
      vehiclePlate,
      vehicleModel,
      corridor: selectedCorridor,
      measuredReceiverDba: acousticResult.receiverSoundLevelDba,
      barrierInsertionLossDb: acousticResult.barrierInsertionLossDb,
      vehicleExhaustDba: measuredExhaustDba,
    });
    setCertificates((prev) => [cert, ...prev]);
    setActiveCertificate(cert);
    setActiveTab('certificate');
  };

  const handleCopyCertificate = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      data-testid="noise-barrier-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <VolumeX className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AAYDA • ETSN • BDYP
                </span>
                <span className="text-xs font-mono text-slate-400">NOISE-GUARD-AZ-2026</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Magistral Səs Baryerləri & Akustik Telemetriya Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="noise-barrier-modal-close-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs sm:text-sm">
          {[
            { id: 'radar', label: 'Baryer Dəhlizləri', icon: Volume2 },
            { id: 'scada', label: 'SCADA Zəifləmə Stendi', icon: Activity },
            { id: 'exhaust', label: 'Egzoz & Siqnal Cərimələri', icon: Car },
            { id: 'checklist', label: '10 Bəndlik Yoxlama', icon: CheckCircle2 },
            { id: 'exam', label: 'Qanunvericilik İmtahanı', icon: Award },
            { id: 'certificate', label: 'E-Sertifikat', icon: FileText },
            { id: 'registry', label: 'Dövlət Reyestri', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ModalTab)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-5" data-testid="tab-content-radar">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Azərbaycanın 6 Strateji Magistral Səs Baryeri Zonası
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    AAYDA və ETSN tərəfindən daimi monitorinq edilən yaşayış massivləri və akustik ekranlar
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={corridorSearchQuery}
                    onChange={(e) => setCorridorSearchQuery(e.target.value)}
                    placeholder="Dəhliz və ya yol axtarışı..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCorridors.map((corridor) => {
                  const isSelected = selectedCorridor.id === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => handleSelectCorridor(corridor)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                            {corridor.roadCode}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1">{corridor.name}</h4>
                          <p className="text-xs text-slate-400">{corridor.location}</p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                            corridor.status === 'optimal'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                              : corridor.status === 'warning'
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                              : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          }`}
                        >
                          {corridor.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-500 block">Səs Səviyyəsi (Leq):</span>
                          <span className="font-semibold text-slate-200">
                            {corridor.currentLeqDba} dBA (Hədd: {corridor.dayLimitDba} dBA)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Baryer Hündürlüyü:</span>
                          <span className="font-semibold text-slate-200">
                            {corridor.barrierHeightMeters} metr ({corridor.barrierMaterial.replace('_', ' ')})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Yaşayış Məntəqəsi:</span>
                          <span className="font-semibold text-slate-300 truncate block">
                            {corridor.residentialSettlement}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Aktiv Sensorlar:</span>
                          <span className="font-semibold text-cyan-400">
                            {corridor.acousticSensorsCount} Class-1 mikrofon
                          </span>
                        </div>
                      </div>

                      {corridor.hasBirdAntiCollisionStripes && (
                        <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Quşlar üçün qoruyucu zolaqlar quraşdırılıb</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Seçilmiş Dəhliz:</span>
                    <h4 className="text-sm font-bold text-white">{selectedCorridor.name}</h4>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('scada')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-md shadow-cyan-600/20"
                >
                  <span>SCADA Stendinə Keç</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA TELEMETRY & ATTENUATION STAND */}
          {activeTab === 'scada' && (
            <div className="space-y-6" data-testid="tab-content-scada">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-cyan-400">AAYDA / ISO 9613-2 AKUSTİK MODEL</span>
                    <h3 className="text-base font-bold text-white">
                      Maekawa Difraksiya və Fasad Səs Zəifləməsi Simulyatoru
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">Dəhliz: {selectedCorridor.roadCode}</span>
                </div>
              </div>

              {/* Real-Time Acoustic Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Yol Səs Emissiyası (10m)</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {acousticResult.sourceSoundLevelDba} <span className="text-xs font-normal text-slate-400">dBA</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Mənbə səviyyəsi</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Baryer Səs Zəifləməsi (ΔL)</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">
                    -{acousticResult.barrierInsertionLossDb} <span className="text-xs font-normal text-slate-400">dB</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Fresnel N: {acousticResult.fresnelNumber} (δ: {acousticResult.pathDifferenceMeters}m)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Pəncərədə Səs Səviyyəsi</span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      acousticResult.dayLimitCompliance ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {acousticResult.receiverSoundLevelDba} <span className="text-xs font-normal text-slate-400">dBA</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Gündüz Həddi: 55 dBA | Gecə: 45 dBA
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Səs Enerjisi Azalması</span>
                  <div className="text-2xl font-black text-purple-400 mt-1">
                    {acousticResult.acousticReductionPercentage}%
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                      acousticResult.healthRiskLevel === 'low'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : acousticResult.healthRiskLevel === 'moderate'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    Risk: {acousticResult.healthRiskLevel}
                  </span>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">
                    Yol və Hərəkət Parametrləri
                  </h4>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Nəqliyyat Axını (avtomobil/saat):</span>
                      <span className="font-bold text-white">{trafficVolumeVph} vph</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={6000}
                      step={100}
                      value={trafficVolumeVph}
                      onChange={(e) => setTrafficVolumeVph(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Ağır Yük Nəqliyyatı Payı (% TIR/Avtobus):</span>
                      <span className="font-bold text-white">{heavyTruckPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={heavyTruckPercentage}
                      onChange={(e) => setHeavyTruckPercentage(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Orta Hərəkət Sürəti:</span>
                      <span className="font-bold text-white">{speedKmH} km/saat</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={140}
                      step={5}
                      value={speedKmH}
                      onChange={(e) => setSpeedKmH(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Magistral Yol Örtüyü Növü:</label>
                    <select
                      value={roadSurface}
                      onChange={(e) => setRoadSurface(e.target.value as RoadSurfaceType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="dense_asphalt">Standart Qalın Asfaltbeton (0 dB)</option>
                      <option value="stone_mastic_sma">Şüşəli SMA Qırma Daşlı Asfalt (+0.6 dB)</option>
                      <option value="concrete">Sərt Beton Örtük (+1.8 dB)</option>
                      <option value="porous_low_noise">Məsaməli Səssiz Asfalt "Whisper" (-3.5 dB)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">
                    Akustik Baryer və Məsafə Həndəsəsi
                  </h4>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Baryer Hündürlüyü:</span>
                      <span className="font-bold text-white">{barrierHeightMeters} metr</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={6.5}
                      step={0.5}
                      value={barrierHeightMeters}
                      onChange={(e) => setBarrierHeightMeters(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <span className="text-[10px] text-slate-500">
                      0m = baryer yoxdur (birbaşa səs yayılması)
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Yoldan Baryerə qədər məsafə (d₁):</span>
                      <span className="font-bold text-white">{roadToBarrierDistanceMeters} metr</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      step={1}
                      value={roadToBarrierDistanceMeters}
                      onChange={(e) => setRoadToBarrierDistanceMeters(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Baryerdən Yaşayış Evinin Fasadına məsafə (d₂):</span>
                      <span className="font-bold text-white">{barrierToReceiverDistanceMeters} metr</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={2}
                      value={barrierToReceiverDistanceMeters}
                      onChange={(e) => setBarrierToReceiverDistanceMeters(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gündüz Normativi (≤55 dBA):</span>
                      <span className={acousticResult.dayLimitCompliance ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {acousticResult.dayLimitCompliance ? 'TAM UYĞUNDUR' : 'NORMADAN ARTIQ'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gecə Normativi (≤45 dBA):</span>
                      <span className={acousticResult.nightLimitCompliance ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {acousticResult.nightLimitCompliance ? 'TAM UYĞUNDUR' : 'GECƏ HƏDDİ AŞILIB'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE EXHAUST & DECIBEL FINE STAND */}
          {activeTab === 'exhaust' && (
            <div className="space-y-6" data-testid="tab-content-exhaust">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono text-cyan-400">İXM MADDƏ 342.2-1 & 329.3</span>
                  <h3 className="text-base font-bold text-white">
                    Avtomobil Səsboğucu və Səs Siqnalı Akustik Standartları
                  </h3>
                  <p className="text-xs text-slate-400">
                    Qanunla icazə verilən maksimum hədd: minik avtomobilləri üçün 84 dBA
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  Valyuta: <span className="font-bold text-white">{currency}</span>
                </div>
              </div>

              {/* Quick Vehicle Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Hazır Sınaq Avtomobili Şablonları:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {MOCK_VEHICLE_ACOUSTIC_PRESETS.map((p) => {
                    const isCurrent = vehiclePlate === p.vehiclePlate;
                    return (
                      <button
                        key={p.vehiclePlate}
                        onClick={() => handleApplyVehiclePreset(p)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                          isCurrent
                            ? 'bg-cyan-950/30 border-cyan-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300">{p.vehiclePlate}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{p.measuredExhaustDba} dBA</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{p.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Parameters & Decibel Meter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Dövlət Qeydiyyat Nişanı:</label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Avtomobil Modeli:</label>
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Səsboğucu Sistemi Tipi:</label>
                    <select
                      value={exhaustType}
                      onChange={(e) => setExhaustType(e.target.value as VehicleExhaustTestInput['exhaustType'])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="stock_factory">Zavod Orijinal Səsboğucu (OEM Qanuni)</option>
                      <option value="active_valve_oem">Zavod Sertifikatlı Klapanlı İdman Səsboğucu</option>
                      <option value="modified_sport_muffler">Qanunsuz Quraşdırılmış İdman Egzozu (Tüninq)</option>
                      <option value="straight_pipe_pryamotok">Düz Boru "Pryamotok" və Katalizator Ləğvi</option>
                      <option value="electric_ev">Elektromobil (Səssiz / AVAS Rejimi)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Ölçülmüş Egzoz Səsi (0.5m məsafə):</span>
                      <span className="font-bold text-cyan-300">{measuredExhaustDba} dBA</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={120}
                      step={0.5}
                      value={measuredExhaustDba}
                      onChange={(e) => setMeasuredExhaustDba(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>50 dBA (EV)</span>
                      <span className="text-emerald-400 font-bold">84 dBA (Qanuni Hədd)</span>
                      <span className="text-rose-400">120 dBA (Təhlükəli)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Səs Siqnalı Gücü:</span>
                      <span className="font-bold text-white">{measuredHornDba} dBA</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={125}
                      step={1}
                      value={measuredHornDba}
                      onChange={(e) => setMeasuredHornDba(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Norma: 93 - 112 dBA (UNECE R28)</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasModifiedMuffler}
                        onChange={(e) => setHasModifiedMuffler(e.target.checked)}
                        className="rounded accent-cyan-500"
                      />
                      <span>Konstruksiyada qanunsuz modifikasiya (səsboğucunun ləğvi/kəsilməsi)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={testedInResidentialZone}
                        onChange={(e) => setTestedInResidentialZone(e.target.checked)}
                        className="rounded accent-cyan-500"
                      />
                      <span>Yaşayış massivində / xəstəxana zonasında əsassız səs siqnalı verilib</span>
                    </label>
                  </div>
                </div>

                {/* Verdict & Sanctions */}
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      exhaustResult.inspectionVerdict === 'PASS'
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : exhaustResult.inspectionVerdict === 'WARNING'
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                        : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {exhaustResult.inspectionVerdict === 'PASS' ? (
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-8 h-8 text-rose-400" />
                      )}
                      <div>
                        <span className="text-xs uppercase font-bold tracking-wider">Texniki Yoxlama Nəticəsi:</span>
                        <h4 className="text-lg font-black">
                          {exhaustResult.inspectionVerdict === 'PASS'
                            ? 'STANDARTLARA TAM UYĞUNDUR'
                            : exhaustResult.inspectionVerdict === 'WARNING'
                            ? 'İNZİBATİ XƏTA / CƏRİMƏ TƏTBİQ OLUNUR'
                            : 'İSTİSMAR QADAĞANDIR (TƏXLİYYƏ)'}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs space-y-1">
                      <div>
                        <span className="text-slate-400">Normadan Artıq Səs:</span>{' '}
                        <span className="font-bold text-white">{exhaustResult.exhaustExcessDba} dBA</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Hüquqi Əsas:</span>{' '}
                        <span className="font-mono text-cyan-300">{exhaustResult.legalBasis}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3">
                    <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Tətbiq Edilən İnzibati Tənbeh və Cərimələr:
                    </h5>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">Rəsmi Cərimə Məbləği:</span>
                      <span className="text-base font-bold text-rose-400">
                        {convertNoiseCurrency(exhaustResult.statutoryFineAzn, currency)} {currency}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">30 Günlük 50% AsanPay Endirimi ilə:</span>
                      <span className="text-base font-bold text-emerald-400">
                        {convertNoiseCurrency(exhaustResult.promptDiscountFineAzn, currency)} {currency}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Qurğunun Müsadirəsi / Təxliyyə:</span>
                      <span className={`font-bold ${exhaustResult.impoundRequired ? 'text-rose-400' : 'text-slate-400'}`}>
                        {exhaustResult.impoundRequired ? 'Tələb Edilir (İXM Maddə 96)' : 'Tələb Edilmir'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateCertificate}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
                  >
                    Dövlət Akustik Sertifikatı Yarat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-5" data-testid="tab-content-checklist">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Səs Baryerləri və Ətraf Mühit Təhlükəsizliyi Texniki Siyahısı
                  </h3>
                  <p className="text-xs text-slate-400">
                    AZS 342, EN 1793/1794 və ETSN dövlət standartları üzrə 10 məcburi meyar
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                    title="Sıfırla"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Checklist Progress */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Yoxlama Nəticəsi:</span>
                  <div className="text-lg font-bold text-white">
                    {checklistResult.score}% Tamamlanıb ({checkedItems.length}/{checklistResult.total})
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    checklistResult.passed
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {checklistResult.passed ? 'AKREDİTASİYA TƏSDİQLƏNDİ' : 'ÇATIŞMAZLIQ AŞKAR EDİLDİ'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {MOCK_NOISE_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-cyan-950/20 border-cyan-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                          isChecked
                            ? 'bg-cyan-500 border-cyan-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-white">{item.title}</h4>
                          <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                            {item.standardRef}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAMINATION */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="tab-content-exam">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Yol Hərəkəti və Akustik Təhlükəsizlik üzrə 10 Suallıq İmtahan
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, BDYP və ETSN normativ hüquqi aktları üzrə rəsmi test simulyatoru (Keçid: 80%)
                  </p>
                </div>
                {isExamSubmitted && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Nəticəniz:</span>
                    <div
                      className={`text-lg font-black ${
                        examResult.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {examResult.percentage}% ({examResult.score}/{examResult.total})
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_NOISE_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedOpt = examAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-white">
                          <span className="text-cyan-400 font-mono mr-1.5">{idx + 1}.</span>
                          {q.question}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500">{q.legalRef}</span>
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let btnClass = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850';

                          if (isExamSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnClass = 'bg-emerald-950/30 border-emerald-500 text-emerald-300';
                            } else if (isOptionSelected) {
                              btnClass = 'bg-rose-950/30 border-rose-500 text-rose-300';
                            }
                          } else if (isOptionSelected) {
                            btnClass = 'bg-cyan-950/30 border-cyan-500 text-white';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                !isExamSubmitted &&
                                setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                              }
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between ${btnClass}`}
                            >
                              <span>{opt}</span>
                              {isExamSubmitted && optIdx === q.correctOptionIndex && (
                                <Check className="w-4 h-4 text-emerald-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                {!isExamSubmitted ? (
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    disabled={Object.keys(examAnswers).length === 0}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
                  >
                    İmtahanı Tamamla və Qiymətləndir
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setExamAnswers({});
                      setIsExamSubmitted(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Yenidən Başla
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL E-CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="tab-content-certificate">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Rəsmi Elektron Səs və Akustik Standartlara Uyğunluq Şəhadətnaməsi
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, ETSN və BDYP tərəfindən təsdiq edilmiş rəsmi elektron akt
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print?.()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Çap Et</span>
                  </button>
                  <button
                    onClick={() => handleCopyCertificate(activeCertificate.certificateId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                  </button>
                </div>
              </div>

              {/* Certificate Sheet */}
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-cyan-500/40 shadow-xl space-y-6">
                {/* Certificate Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                      AZƏRBAYCAN RESPUBLİKASI
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      DÖVLƏT AVTOMOBİL YOLLARI & ETSN AKUSTİK NƏZARƏT
                    </h2>
                    <p className="text-xs text-slate-400">
                      Rəsmi Səs-Küy Səviyyəsi və Ekran Şəhadətnaməsi: {activeCertificate.certificateId}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${
                        activeCertificate.complianceStatus === 'CERTIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : activeCertificate.complianceStatus === 'CONDITIONAL'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      {activeCertificate.complianceStatus}
                    </span>
                  </div>
                </div>

                {/* Certificate Data Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Nəqliyyat Vasitəsi:</span>
                    <span className="font-bold text-white font-mono text-sm">
                      {activeCertificate.vehiclePlate}
                    </span>
                    <span className="text-slate-400 block">{activeCertificate.vehicleModel}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Akustik Dəhliz:</span>
                    <span className="font-semibold text-slate-200">{activeCertificate.corridorName}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Ölçülmüş Egzoz Səsi:</span>
                    <span className="font-bold text-cyan-300">
                      {activeCertificate.vehicleExhaustDba} dBA (Maks. 84 dBA)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Pəncərədə Səs (Fasad):</span>
                    <span className="font-bold text-slate-200">
                      {activeCertificate.measuredReceiverDba} dBA (Gündüz: 55 dBA)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Baryer Zəifləməsi (ΔL):</span>
                    <span className="font-bold text-purple-400">
                      -{activeCertificate.barrierInsertionLossDb} dB
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Baryer Keçid Kodu (PIN):</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      #{activeCertificate.barrierPassPin}
                    </span>
                  </div>
                </div>

                {/* Footer Validation */}
                <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Rəqəmsal SİMA İmza İnteqrasiyası:</span>
                    <span className="font-mono text-cyan-400">{activeCertificate.simaSignatureUid}</span>
                    <span className="font-mono text-[10px] text-slate-600 block mt-0.5">
                      {activeCertificate.securityHash}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-slate-500 block">Məsul İnspektor:</span>
                    <span className="font-semibold text-slate-300">{activeCertificate.inspectorName}</span>
                    <span className="text-[10px] text-slate-500 block">
                      Etibarlılıq: {activeCertificate.issuedAt} - {activeCertificate.validUntil}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLIC UNIFIED REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-5" data-testid="tab-content-registry">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Dövlət Akustik Standartlar və Şəhadətnamələr Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və ETSN bazasında qeydiyyata alınmış rəsmi səs sertifikatları
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={registryQuery}
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    placeholder="Sertifikat ID və ya Nömrə ilə axtar..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.certificateId}
                    onClick={() => {
                      setActiveCertificate(cert);
                      setActiveTab('certificate');
                    }}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-300">
                          {cert.certificateId}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                            cert.complianceStatus === 'CERTIFIED'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                              : cert.complianceStatus === 'CONDITIONAL'
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                              : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          }`}
                        >
                          {cert.complianceStatus}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1">
                        {cert.vehiclePlate} • {cert.vehicleModel}
                      </h4>
                      <p className="text-xs text-slate-400">{cert.corridorName}</p>
                    </div>

                    <div className="text-right text-xs">
                      <div className="text-slate-300">
                        Egzoz: <span className="font-bold text-cyan-400">{cert.vehicleExhaustDba} dBA</span> | Fasad:{' '}
                        <span className="font-bold text-white">{cert.measuredReceiverDba} dBA</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Tarix: {cert.issuedAt}
                      </span>
                    </div>
                  </div>
                ))}

                {filteredCertificates.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Sorğu üzrə heç bir akustik şəhadətnamə tapılmadı.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
