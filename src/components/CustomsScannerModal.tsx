import React, { useState, useMemo } from 'react';
import {
  X,
  Scan,
  ShieldAlert,
  Radio,
  FileCheck,
  Search,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Truck,
  Eye,
  Award,
  Database,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  Currency,
  formatCurrency,
  CheckpointId,
  MaterialCategory,
  AnomalyLocation,
  evaluateMaterialDiscrimination,
  evaluateRadiographyAnomaly,
  evaluateRpmTelemetry,
  calculateCustomsScanningFees,
  evaluateScannerChecklist,
  evaluateScannerExam,
  generateOfficialCustomsScannerCertificate,
  OfficialCustomsScannerCertificate,
} from '../utils/customsScannerCompliance';
import {
  MOCK_CHECKPOINTS_LIST,
  MOCK_CHECKPOINTS_RECORD,
  MOCK_TRUCK_PRESETS,
  MOCK_SCANNER_CHECKLIST,
  MOCK_SCANNER_EXAM_QUESTIONS,
  MOCK_PUBLIC_REGISTRY_CERTIFICATES,
} from '../data/mockCustomsScannerData';
import { Vehicle } from '../types/vehicle';

export interface CustomsScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type CustomsScannerTab =
  | 'checkpoints'
  | 'simulator'
  | 'rpm'
  | 'fees'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const CustomsScannerModal: React.FC<CustomsScannerModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<CustomsScannerTab>('checkpoints');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Checkpoints Tab State
  const [checkpointSearch, setCheckpointSearch] = useState('');
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<CheckpointId>('samur_north');

  // Simulator Tab State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const activePreset = MOCK_TRUCK_PRESETS[selectedPresetIndex];

  const [trailerPlate, setTrailerPlate] = useState<string>(
    targetCar ? targetCar.plateNumber || '99-TR-707' : activePreset.trailerPlate
  );
  const [tractorPlate, setTractorPlate] = useState<string>(activePreset.tractorPlate);
  const [driverName, setDriverName] = useState<string>(activePreset.driverNameAz);
  const [carrierName, setCarrierName] = useState<string>(activePreset.carrierNameAz);
  const [customsManifest, setCustomsManifest] = useState<string>(activePreset.customsManifestNumber);
  const [declaredCargo, setDeclaredCargo] = useState<string>(activePreset.declaredCargoAz);
  const [declaredDensity, setDeclaredDensity] = useState<number>(activePreset.declaredDensityGcm3);
  const [measuredDensity, setMeasuredDensity] = useState<number>(activePreset.measuredDensityGcm3);
  const [dominantMaterial, setDominantMaterial] = useState<MaterialCategory>(activePreset.dominantMaterial);
  const [anomalyLocation, setAnomalyLocation] = useState<AnomalyLocation>(activePreset.anomalyLocation);
  const [anomalyVolume, setAnomalyVolume] = useState<number>(activePreset.anomalyVolumeLitres);
  const [isGreenCorridor, setIsGreenCorridor] = useState<boolean>(activePreset.isGreenCorridor);

  // RPM Tab State
  const [rpmGamma, setRpmGamma] = useState<number>(activePreset.rpmGammaDoseRate);
  const [rpmNeutron, setRpmNeutron] = useState<number>(activePreset.rpmNeutronCps);

  // Checklist Tab State
  const [completedChecklistIds, setCompletedChecklistIds] = useState<string[]>(
    MOCK_SCANNER_CHECKLIST.filter((i) => i.isMandatory).map((i) => i.id)
  );

  // Exam Tab State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificate Tab State
  const [generatedCertificate, setGeneratedCertificate] =
    useState<OfficialCustomsScannerCertificate | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Registry Search Tab State
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [selectedRegistryFilter, setSelectedRegistryFilter] = useState<'ALL' | 'CLEAR' | 'SUSPICIOUS' | 'CRITICAL'>('ALL');

  // Handle Preset Switching
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const preset = MOCK_TRUCK_PRESETS[index];
    setTrailerPlate(preset.trailerPlate);
    setTractorPlate(preset.tractorPlate);
    setDriverName(preset.driverNameAz);
    setCarrierName(preset.carrierNameAz);
    setCustomsManifest(preset.customsManifestNumber);
    setDeclaredCargo(preset.declaredCargoAz);
    setDeclaredDensity(preset.declaredDensityGcm3);
    setMeasuredDensity(preset.measuredDensityGcm3);
    setDominantMaterial(preset.dominantMaterial);
    setAnomalyLocation(preset.anomalyLocation);
    setAnomalyVolume(preset.anomalyVolumeLitres);
    setRpmGamma(preset.rpmGammaDoseRate);
    setRpmNeutron(preset.rpmNeutronCps);
    setIsGreenCorridor(preset.isGreenCorridor);
    setSelectedCheckpointId(preset.checkpointId);
  };

  const selectedCheckpoint = MOCK_CHECKPOINTS_RECORD[selectedCheckpointId] || MOCK_CHECKPOINTS_LIST[0];

  // Evaluations
  const materialResult = useMemo(
    () => evaluateMaterialDiscrimination(dominantMaterial, declaredDensity, measuredDensity),
    [dominantMaterial, declaredDensity, measuredDensity]
  );

  const anomalyResult = useMemo(
    () => evaluateRadiographyAnomaly(declaredDensity, measuredDensity, anomalyLocation, anomalyVolume),
    [declaredDensity, measuredDensity, anomalyLocation, anomalyVolume]
  );

  const rpmResult = useMemo(
    () => evaluateRpmTelemetry(rpmGamma, rpmNeutron),
    [rpmGamma, rpmNeutron]
  );

  const feeResult = useMemo(
    () =>
      calculateCustomsScanningFees(
        selectedCheckpoint.scannerType,
        anomalyResult.verdict,
        !rpmResult.isRadiationSafe,
        isGreenCorridor
      ),
    [selectedCheckpoint.scannerType, anomalyResult.verdict, rpmResult.isRadiationSafe, isGreenCorridor]
  );

  const checklistResult = useMemo(
    () => evaluateScannerChecklist(completedChecklistIds, MOCK_SCANNER_CHECKLIST),
    [completedChecklistIds]
  );

  const examResult = useMemo(
    () => evaluateScannerExam(examAnswers, MOCK_SCANNER_EXAM_QUESTIONS),
    [examAnswers]
  );

  // Generate Certificate
  const handleGenerateCertificate = () => {
    const cert = generateOfficialCustomsScannerCertificate(
      {
        id: `truck_custom_${Date.now()}`,
        trailerPlate,
        tractorPlate,
        driverNameAz: driverName,
        carrierNameAz: carrierName,
        customsManifestNumber: customsManifest,
        checkpointId: selectedCheckpointId,
        scannerType: selectedCheckpoint.scannerType,
        declaredCargoAz: declaredCargo,
        declaredWeightTonnes: 20.0,
        declaredDensityGcm3: declaredDensity,
        measuredDensityGcm3: measuredDensity,
        dominantMaterial,
        anomalyLocation,
        anomalyVolumeLitres: anomalyVolume,
        rpmGammaDoseRate: rpmGamma,
        rpmNeutronCps: rpmNeutron,
        isGreenCorridor,
      },
      selectedCheckpoint,
      anomalyResult,
      materialResult,
      rpmResult,
      feeResult
    );
    setGeneratedCertificate(cert);
    setActiveTab('certificate');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrintCertificate = () => {
    window.print?.();
  };

  // Filtered checkpoints
  const filteredCheckpoints = useMemo(() => {
    if (!checkpointSearch.trim()) return MOCK_CHECKPOINTS_LIST;
    const q = checkpointSearch.toLowerCase();
    return MOCK_CHECKPOINTS_LIST.filter(
      (cp) =>
        cp.nameAz.toLowerCase().includes(q) ||
        cp.locationAz.toLowerCase().includes(q) ||
        cp.corridorAz.toLowerCase().includes(q) ||
        cp.scannerModel.toLowerCase().includes(q)
    );
  }, [checkpointSearch]);

  // Filtered registry certificates
  const filteredRegistry = useMemo(() => {
    return MOCK_PUBLIC_REGISTRY_CERTIFICATES.filter((cert) => {
      const matchSearch =
        !registrySearch.trim() ||
        cert.certificateId.toLowerCase().includes(registrySearch.toLowerCase()) ||
        cert.trailerPlate.toLowerCase().includes(registrySearch.toLowerCase()) ||
        cert.customsManifestNumber.toLowerCase().includes(registrySearch.toLowerCase()) ||
        cert.carrierNameAz.toLowerCase().includes(registrySearch.toLowerCase());

      if (!matchSearch) return false;
      if (selectedRegistryFilter === 'CLEAR') return cert.radiographyVerdict === 'CLEAR_PASSED';
      if (selectedRegistryFilter === 'SUSPICIOUS') return cert.radiographyVerdict === 'SUSPICIOUS_DENSITY';
      if (selectedRegistryFilter === 'CRITICAL') return cert.radiographyVerdict === 'CRITICAL_CONCEALMENT_DETECTED';
      return true;
    });
  }, [registrySearch, selectedRegistryFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl my-auto bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 flex flex-col max-h-[92vh] overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/20 bg-slate-900/95 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>DGK & AYNA Yüksək Enerjili Rentgen-Qantri Skaneri Portalı</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    NII 6.0 MeV
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Gömrük Məcəlləsi Maddə 38/42 • IAEA SSG-55 Standartı • WCO SAFE Radiasiya və Anomaliya Nəzarəti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2 py-1 rounded-md transition-all font-medium ${
                    currency === cur
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="close-scanner-modal-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-900/60 border-b border-slate-800 overflow-x-auto text-xs sm:text-sm scrollbar-none">
          <button
            onClick={() => setActiveTab('checkpoints')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all font-medium ${
              activeTab === 'checkpoints'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Sərhəd Radarı ({MOCK_CHECKPOINTS_LIST.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all font-medium ${
              activeTab === 'simulator'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scan className="w-4 h-4 text-cyan-400" />
            <span>Qantri Rentgen Simulyatoru</span>
          </button>

          <button
            onClick={() => setActiveTab('rpm')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all font-medium ${
              activeTab === 'rpm'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>RPM Radiasiya Monitoru</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all font-medium ${
              activeTab === 'fees'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Gömrük Rüsumu & Sanksiyalar</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all font-medium ${
              activeTab === 'checklist'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>IAEA Təhlükəsizlik Çeklisti ({checklistResult.complianceScorePercent}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all font-medium ${
              activeTab === 'exam'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            <span>NII Nəzəri İmtahan</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all font-medium ${
              activeTab === 'certificate'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCheck className="w-4 h-4 text-teal-400" />
            <span>DGK-SCAN-2026 Sertifikatı</span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all font-medium ${
              activeTab === 'registry'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4 text-sky-400" />
            <span>Açıq Reyestr</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CHECKPOINTS RADAR */}
          {activeTab === 'checkpoints' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-emerald-400" />
                    <span>Azərbaycan Respublikası Sərhəd Rentgen-Qantri Kompleksləri</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    WCO və IAEA tələblərinə cavab verən 6.0 MeV yüksək enerjili stasionar və mobil qeyri-intruziv baxış nöqtələri
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={checkpointSearch}
                    onChange={(e) => setCheckpointSearch(e.target.value)}
                    placeholder="Məntəqə və ya dəhliz axtar..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCheckpoints.map((cp) => {
                  const isSelected = cp.id === selectedCheckpointId;
                  return (
                    <div
                      key={cp.id}
                      onClick={() => setSelectedCheckpointId(cp.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-white">{cp.nameAz}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {cp.radiationEnergyMev} MeV
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400/90 font-medium mt-1">{cp.corridorAz}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cp.locationAz}</p>

                        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5 text-xs text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Skaner Modeli:</span>
                            <span className="font-medium text-slate-200">{cp.scannerModel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Polad Nüfuz:</span>
                            <span className="font-medium text-cyan-300">{cp.steelPenetrationMm} mm ASTM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Keçid Sürəti:</span>
                            <span className="font-medium text-slate-200">{cp.scanSpeedKmh} km/saat</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Gündəlik Buraxılış:</span>
                            <span className="font-medium text-amber-300">{cp.dailyTruckCapacity} yük vahidi</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>RPM İnteqrasiyası</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCheckpointId(cp.id);
                            setActiveTab('simulator');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium transition-all"
                        >
                          Skanerə Keç →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RADIOGRAPHY SCANNER SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Hazır Sərhəd Yoxlama Nümunələri (Presets):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_TRUCK_PRESETS.map((p, idx) => {
                    const isSelected = idx === selectedPresetIndex;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(idx)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{p.trailerPlate}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.declaredCargoAz.split(' ')[0]}</div>
                        <div className="text-[9px] mt-0.5 font-medium">
                          {p.anomalyLocation !== 'DECLARED_CARGO_UNIFORM' ? (
                            <span className="text-rose-400 font-bold">Kritik Anomaliya</span>
                          ) : p.measuredDensityGcm3 - p.declaredDensityGcm3 > 0.45 ? (
                            <span className="text-amber-400 font-bold">Şübhəli Sıxlıq</span>
                          ) : (
                            <span className="text-emerald-400 font-medium">Təmiz Yük</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Controls and Telemetry Stand */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 5 Cols: Config Parameters */}
                <div className="lg:col-span-5 space-y-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    <span>Nəqliyyat və Yük Parametrləri</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Yarımqoşqu DQN:</label>
                      <input
                        type="text"
                        value={trailerPlate}
                        onChange={(e) => setTrailerPlate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Dartıcı DQN:</label>
                      <input
                        type="text"
                        value={tractorPlate}
                        onChange={(e) => setTractorPlate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="text-slate-400 block mb-1">Bəyan Edilən Yük Növü:</label>
                    <input
                      type="text"
                      value={declaredCargo}
                      onChange={(e) => setDeclaredCargo(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">
                        Bəyan Sıxlığı (ρ₀): <span className="text-white font-bold">{declaredDensity} q/sm³</span>
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="8.0"
                        step="0.05"
                        value={declaredDensity}
                        onChange={(e) => setDeclaredDensity(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">
                        Ölçülən Sıxlıq (ρ): <span className="text-cyan-400 font-bold">{measuredDensity} q/sm³</span>
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="8.0"
                        step="0.05"
                        value={measuredDensity}
                        onChange={(e) => setMeasuredDensity(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="text-slate-400 block mb-1">Dominant Material Spektri (Dual-Energy Z_eff):</label>
                    <select
                      value={dominantMaterial}
                      onChange={(e) => setDominantMaterial(e.target.value as MaterialCategory)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="ORGANIC">Üzvi maddələr / Tekstil / Qida / Polimerlər (Z ≤ 10)</option>
                      <option value="INORGANIC_LIGHT">Qeyri-üzvi yüngül materiallar / Şüşə / Alüminium (10 &lt; Z ≤ 20)</option>
                      <option value="HEAVY_METALS">Ağır metallar / Polad / Mis / Mühərriklər (20 &lt; Z &lt; 82)</option>
                      <option value="DENSE_SHIELDING">Yüksək sıxlıqlı ekranlaşdırma / Qurğuşun / Volfram (Z ≥ 82)</option>
                    </select>
                  </div>

                  <div className="text-xs">
                    <label className="text-slate-400 block mb-1">Konstruktiv Anomaliya / Gizli Bölmə Yeri:</label>
                    <select
                      value={anomalyLocation}
                      onChange={(e) => setAnomalyLocation(e.target.value as AnomalyLocation)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="DECLARED_CARGO_UNIFORM">Bəyan edilmiş uniform yük (Gizli anbar yoxdur)</option>
                      <option value="FALSE_BULKHEAD_FRONT">Ön Qoşa Arakəsmə / Yalançı Divar Boşluğu</option>
                      <option value="DOUBLE_FLOOR_CAVITY">Qoşa Döşəmə / Şassi Altı Gizli Baza</option>
                      <option value="FUEL_TANK_INNER_COMPARTMENT">Yanacaq Çəninin Daxili Qeyri-Qanuni Bölməsi</option>
                      <option value="REEFER_ROOF_VOID">Soyuducu Aqreqatın Tavan İzolyasiya Boşluğu</option>
                      <option value="SPARE_WHEEL_VOID">Ehtiyat Təkər və Alət Qutusu Doldurması</option>
                      <option value="CHASSIS_HOLLOW_BEAMS">Şassi Boyuna Tirinin İçi Boşluqları</option>
                    </select>
                  </div>

                  {anomalyLocation !== 'DECLARED_CARGO_UNIFORM' && (
                    <div className="text-xs">
                      <label className="text-slate-400 block mb-1">
                        Gizli Boşluğun Həcmi: <span className="text-rose-400 font-bold">{anomalyVolume} Litr</span>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="300"
                        step="5"
                        value={anomalyVolume}
                        onChange={(e) => setAnomalyVolume(parseInt(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                    <span className="text-slate-300">Yaşıl Dəhliz (Green Corridor) İcazəsi:</span>
                    <button
                      type="button"
                      onClick={() => setIsGreenCorridor(!isGreenCorridor)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        isGreenCorridor
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isGreenCorridor ? 'Bəli (100% Rüsumsuz)' : 'Xeyr (Standart Rejim)'}
                    </button>
                  </div>
                </div>

                {/* Right 7 Cols: High-Energy Radiography Monitor Screen */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4 bg-slate-950 p-5 rounded-2xl border-2 border-emerald-500/40 shadow-inner">
                  {/* Screen Header */}
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-emerald-400 font-bold uppercase">
                        {selectedCheckpoint.scannerModel} (6.0 MeV X-RAY)
                      </span>
                    </div>
                    <span className="font-mono text-slate-400">{selectedCheckpoint.nameAz}</span>
                  </div>

                  {/* Radiography Simulated Viewport */}
                  <div className="relative h-64 w-full bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                    {/* Grid Background */}
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                    />

                    {/* Truck Outline Mockup */}
                    <div className="relative w-11/12 h-36 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center p-2">
                      {/* Cab */}
                      <div className="w-16 h-28 border border-slate-500 rounded bg-slate-800/80 flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono">
                        <span>CABIN</span>
                        <span className="text-[8px] text-emerald-400">CUTOFF</span>
                      </div>

                      {/* Cargo Body with Material Color */}
                      <div
                        className="flex-1 h-28 ml-2 rounded border transition-all flex flex-col items-center justify-center p-2 relative"
                        style={{
                          backgroundColor: `${materialResult.colorHexCode}25`,
                          borderColor: materialResult.colorHexCode,
                        }}
                      >
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded shadow"
                          style={{
                            color: materialResult.colorHexCode,
                            backgroundColor: `${materialResult.colorHexCode}20`,
                          }}
                        >
                          Z_eff ≈ {materialResult.estimatedEffectiveAtomicNumber} ({materialResult.dominantMaterial})
                        </span>

                        <span className="text-[11px] text-slate-200 mt-1 font-mono">
                          ρ = {measuredDensity} q/sm³ (Δρ = {anomalyResult.densityDeltaGcm3} q/sm³)
                        </span>

                        {/* Hidden Compartment Alert Tag inside wireframe */}
                        {anomalyLocation !== 'DECLARED_CARGO_UNIFORM' && (
                          <div className="absolute top-2 right-2 bg-rose-600/90 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded animate-bounce flex items-center gap-1 shadow-lg">
                            <AlertTriangle className="w-3 h-3" />
                            <span>ANOMALİYA: {anomalyVolume}L</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scan Line Animation */}
                    <div className="absolute top-0 bottom-0 w-1 bg-emerald-400/80 shadow-[0_0_12px_#10b981] animate-[pulse_2s_infinite]" />
                  </div>

                  {/* Telemetry KPIs */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Polad Nüfuz:</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        {selectedCheckpoint.steelPenetrationMm} mm
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Şüalanma Dərəcəsi:</span>
                      <span className="font-mono text-cyan-400 font-bold text-sm">
                        {anomalyResult.attenuationOpacityPercent}% Qeyri-şəffaf
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Risk İndeksi:</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          anomalyResult.riskScore > 80
                            ? 'text-rose-400'
                            : anomalyResult.riskScore > 40
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {anomalyResult.riskScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* Verdict Banner */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      anomalyResult.verdict === 'CRITICAL_CONCEALMENT_DETECTED'
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                        : anomalyResult.verdict === 'SUSPICIOUS_DENSITY'
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                        : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    }`}
                  >
                    {anomalyResult.verdict === 'CRITICAL_CONCEALMENT_DETECTED' ? (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    ) : anomalyResult.verdict === 'SUSPICIOUS_DENSITY' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs">
                      <p className="font-bold">{anomalyResult.verdictLabelAz}</p>
                      <p className="mt-1 opacity-90">{anomalyResult.recommendedActionAz}</p>
                      {anomalyResult.rejectionReasonAz && (
                        <p className="mt-1 font-mono text-[11px] underline opacity-95">
                          {anomalyResult.rejectionReasonAz}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('rpm')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                    >
                      RPM Telemetriyasına Bax →
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateCertificate}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-1.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>DGK-SCAN Sertifikatı Yarat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RPM RADIATION PORTAL MONITOR */}
          {activeTab === 'rpm' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Radiasiya Portal Monitoru (RPM) və Qamma/Neytron Telemetriyası</span>
                </h3>
                <p className="text-xs text-slate-400">
                  IAEA SSG-55 və BMT Nüvə Təhlükəsizliyi Qaydalarına uyğun olaraq sərhəddən keçən yükün radioloji təmizliyi
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    <span>Canlı Detektor Sensorları</span>
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Qamma Doza Gücü (µSv/h):</span>
                      <span className="font-mono font-bold text-amber-300">{rpmGamma} µSv/h</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.00"
                      step="0.01"
                      value={rpmGamma}
                      onChange={(e) => setRpmGamma(parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0.08 (Təbii Fon)</span>
                      <span>0.25 (Xəbərdarlıq)</span>
                      <span>0.50+ (Kritik Təhlükə)</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-700/60">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Neytron Sayğacı (cps - counts/sec):</span>
                      <span className="font-mono font-bold text-indigo-300">{rpmNeutron} cps</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={rpmNeutron}
                      onChange={(e) => setRpmNeutron(parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0–2 (Normal)</span>
                      <span>4–5 (Yüksək)</span>
                      <span>10+ (FHN Qəza Protokolu)</span>
                    </div>
                  </div>
                </div>

                {/* Status Box */}
                <div
                  className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    rpmResult.alarmLevel === 'RADIOACTIVE_THREAT_DETECTED'
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                      : rpmResult.alarmLevel === 'ELEVATED_NON_HAZARDOUS'
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                      : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-900/60 border border-current">
                      RPM Həyəcan Statusu
                    </span>
                    <h4 className="text-base font-bold mt-3">{rpmResult.alarmLabelAz}</h4>
                    <p className="text-xs mt-2 opacity-90">{rpmResult.actionProtocolAz}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-current/20 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="opacity-75 block text-[10px]">Təbii Fondan Fərq:</span>
                      <span className="font-bold">+{rpmResult.gammaDeltaPercent}%</span>
                    </div>
                    <div>
                      <span className="opacity-75 block text-[10px]">Radioloji Risk:</span>
                      <span className="font-bold">{rpmResult.radiologicalRiskScore} / 100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATUTORY CUSTOMS FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  <span>Qanunvericilik üzrə Gömrük Rentgen Rüsumları və İnzibati Sanksiyalar</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Gömrük Məcəlləsi Maddə 38 və İnzibati Xətalar Məcəlləsi Maddə 482 əsasında hesablanan məbləğlər
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3 text-xs">
                  <h4 className="font-bold text-sm text-slate-200 border-b border-slate-700/60 pb-2">
                    Xidmət və Rüsumların Tərkibi
                  </h4>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Baza Qeyri-İntruziv Skan Rüsumu:</span>
                    <span className="font-mono text-white font-medium">
                      {formatCurrency(feeResult.baseScanFeeAzn, currency)}
                    </span>
                  </div>

                  {feeResult.greenCorridorDiscountAzn > 0 && (
                    <div className="flex justify-between py-1 text-emerald-400">
                      <span>Yaşıl Dəhliz 100% Güzəşti:</span>
                      <span className="font-mono font-medium">
                        -{formatCurrency(feeResult.greenCorridorDiscountAzn, currency)}
                      </span>
                    </div>
                  )}

                  {feeResult.rescanFeeAzn > 0 && (
                    <div className="flex justify-between py-1 text-amber-300">
                      <span>Təkrar Yüksək Dəqiqlikli Skan:</span>
                      <span className="font-mono font-medium">
                        +{formatCurrency(feeResult.rescanFeeAzn, currency)}
                      </span>
                    </div>
                  )}

                  {feeResult.physicalEscortFeeAzn > 0 && (
                    <div className="flex justify-between py-1 text-rose-300">
                      <span>Dərin Fiziki Baxış Anqarına Müşayiət:</span>
                      <span className="font-mono font-medium">
                        +{formatCurrency(feeResult.physicalEscortFeeAzn, currency)}
                      </span>
                    </div>
                  )}

                  {feeResult.k9InspectionFeeAzn > 0 && (
                    <div className="flex justify-between py-1 text-rose-300">
                      <span>Kinoloji Xidmət İtləri Yoxlanışı:</span>
                      <span className="font-mono font-medium">
                        +{formatCurrency(feeResult.k9InspectionFeeAzn, currency)}
                      </span>
                    </div>
                  )}

                  {feeResult.statutoryFineAzn > 0 && (
                    <div className="flex justify-between py-1 text-rose-400 font-bold border-t border-slate-700/60 pt-2">
                      <span>İXM Maddə 482 İnzibati Cərimə:</span>
                      <span className="font-mono">
                        +{formatCurrency(feeResult.statutoryFineAzn, currency)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Yekun Ödəniləcək Məbləğ
                    </span>
                    <h3 className="text-3xl font-extrabold text-white font-mono mt-2">
                      {formatCurrency(feeResult.totalPayableAzn, currency)}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 font-mono">
                      USD: ${feeResult.totalPayableUsd} • EUR: €{feeResult.totalPayableEur}
                    </p>
                    <p className="text-xs text-emerald-300 mt-3 p-2.5 rounded-lg bg-emerald-900/30 border border-emerald-500/20">
                      {feeResult.statutoryArticleAz}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCertificate}
                    className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Rəsmi Sertifikata Əlavə Et və Çıxarış Al</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <span>IAEA SSG-55 və Gömrük Radiasiya Kalibrasiya Çeklisti</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Skanerin işə salınmasından öncə 10 mərhələli texniki və radioloji təhlükəsizlik yoxlaması
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-indigo-400">
                    {checklistResult.completedCount} / {checklistResult.totalCount} ({checklistResult.complianceScorePercent}%)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {MOCK_SCANNER_CHECKLIST.map((item) => {
                  const isChecked = completedChecklistIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isChecked) {
                          setCompletedChecklistIds(completedChecklistIds.filter((id) => id !== item.id));
                        } else {
                          setCompletedChecklistIds([...completedChecklistIds, item.id]);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-200'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-white">{item.titleAz}</h5>
                          {item.isMandatory && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                              MƏCBURİ
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 mt-1">{item.descriptionAz}</p>
                        <p className="text-[10px] text-indigo-400 font-mono mt-1">{item.iaeaStandard}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: THEORETICAL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-yellow-400" />
                    <span>DGK Qeyri-İntruziv Yoxlama (NII) Nəzəri İmtahan Simulyatoru</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Gömrük Məcəlləsi və IAEA qaydaları üzrə 10 sual. Keçid balı: 80% (8/10 düzgün cavab)
                  </p>
                </div>
                {isExamSubmitted && (
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold font-mono px-3 py-1 rounded-full ${
                        examResult.isPassed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {examResult.scorePercent}% — {examResult.isPassed ? 'KEÇDİ' : 'KƏSİLDİ'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_SCANNER_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedOpt = examAnswers[q.id];
                  const resultDetail = examResult.detailedResults.find((r) => r.questionId === q.id);
                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                      <h4 className="text-xs font-semibold text-white flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-[10px] text-slate-200">
                          {idx + 1}
                        </span>
                        <span>{q.questionAz}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let btnStyle =
                            'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-500';
                          if (isOptionSelected) {
                            btnStyle = 'bg-yellow-500/20 border-yellow-500 text-yellow-200 font-medium';
                          }
                          if (isExamSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected && !resultDetail?.isCorrect) {
                              btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={isExamSubmitted}
                              onClick={() => setExamAnswers({ ...examAnswers, [q.id]: optIdx })}
                              className={`p-2.5 rounded-lg border text-left transition-all ${btnStyle}`}
                            >
                              <span className="font-mono text-slate-500 mr-1.5">{optIdx + 1})</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <p className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-700/40">
                          Hüquqi Əsas: {q.legalBasisAz}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {isExamSubmitted ? (
                  <button
                    type="button"
                    onClick={() => {
                      setExamAnswers({});
                      setIsExamSubmitted(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Yenidən Başla</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsExamSubmitted(true)}
                    className="px-5 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-xs transition-all shadow-md"
                  >
                    İmtahanı Təsdiqlə və Qiymətləndir
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {generatedCertificate ? (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-2xl text-slate-100 space-y-5">
                  {/* Certificate Header */}
                  <div className="flex items-start justify-between border-b border-emerald-500/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] tracking-widest uppercase font-bold text-emerald-400">
                          Azərbaycan Respublikası Dövlət Gömrük Komitəsi
                        </span>
                        <h3 className="text-base font-bold text-white uppercase tracking-tight">
                          Qeyri-İntruziv Rentgen Baxış Sertifikatı
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono">
                          X-RAY NII CLEARANCE PASS • FORM DGK-SCAN-2026
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30 block">
                        {generatedCertificate.certificateId}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Tarix: {generatedCertificate.issueDate}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle and Inspector Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Yarımqoşqu:</span>
                      <span className="font-mono font-bold text-white">{generatedCertificate.trailerPlate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Dartıcı:</span>
                      <span className="font-mono font-bold text-slate-200">{generatedCertificate.tractorPlate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Bəyannamə №:</span>
                      <span className="font-mono text-cyan-300 font-semibold">{generatedCertificate.customsManifestNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Skaner Zolağı:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{generatedCertificate.inspectionLaneCode}</span>
                    </div>
                  </div>

                  {/* Radiography Telemetry Details */}
                  <div className="space-y-2 text-xs">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-emerald-400">
                      Radioloji Spektr və Sıxlıq Nəticələri
                    </h5>
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800 font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Gömrük Məntəqəsi:</span>
                        <span className="text-white">{generatedCertificate.checkpointAz}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Skaner Modeli & Enerji:</span>
                        <span className="text-white">{generatedCertificate.scannerModel} ({generatedCertificate.radiationEnergyMev} MeV)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Material Z_eff:</span>
                        <span className="text-cyan-300">Z ≈ {generatedCertificate.effectiveAtomicNumberZ} ({generatedCertificate.materialDiscriminationAz.split(' ')[0]})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">RPM Radiasiya Fonu:</span>
                        <span className="text-amber-300">{generatedCertificate.rpmGammaUsvh} µSv/h ({generatedCertificate.rpmNeutronCps} cps)</span>
                      </div>
                    </div>
                  </div>

                  {/* Verdict Stamp */}
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold block uppercase">Yekun Qərar</span>
                      <span className="font-bold text-white text-sm">{generatedCertificate.verdictLabelAz}</span>
                    </div>
                    <span className="px-3 py-1 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                      {generatedCertificate.radiographyVerdict}
                    </span>
                  </div>

                  {/* Security Footer */}
                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
                    <div>
                      <span>SHA256: {generatedCertificate.sha256SecurityChecksum}</span>
                      <span className="block text-emerald-400">{generatedCertificate.simaDigitalUid}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(generatedCertificate.certificateId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-sans text-xs flex items-center gap-1.5"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Kodu Kopyala</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintCertificate}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Çap Et</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/60 p-6">
                  <Scan className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <h4 className="text-base font-semibold text-white">Sertifikat Hələ Generasiya Edilməyib</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Simulyator tabından nəqliyyat parametrlərini yoxlayın və «DGK-SCAN Sertifikatı Yarat» düyməsini sıxın.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('simulator')}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md"
                  >
                    Simulyatora Get
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-sky-400" />
                    <span>DGK Vahid Açıq Rentgen Skan Reyestri</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sərhəd-keçid məntəqələrində rəsmiləşdirilmiş aktiv elektron skan sertifikatlarının axtarışı
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="relative w-full sm:w-60">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      placeholder="DQN və ya sertifikat №..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <select
                    value={selectedRegistryFilter}
                    onChange={(e) => setSelectedRegistryFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="ALL">Bütün Statuslar</option>
                    <option value="CLEAR">Təsdiqləndi</option>
                    <option value="SUSPICIOUS">Şübhəli</option>
                    <option value="CRITICAL">Kritik Anomaliya</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredRegistry.map((cert) => (
                  <div
                    key={cert.certificateId}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/60 transition-all text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{cert.certificateId}</span>
                        <span className="font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-bold">
                          {cert.trailerPlate}
                        </span>
                        <span className="text-slate-400">({cert.customsManifestNumber})</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          cert.radiographyVerdict === 'CLEAR_PASSED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : cert.radiographyVerdict === 'SUSPICIOUS_DENSITY'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {cert.radiographyVerdict}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 text-slate-300 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Daşıyıcı:</span>
                        <span className="truncate block font-sans">{cert.carrierNameAz}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Məntəqə:</span>
                        <span className="truncate block font-sans">{cert.checkpointAz.split(' ')[0]}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Yük / Sıxlıq:</span>
                        <span>ρ = {cert.measuredDensityGcm3} q/sm³</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Gömrük İnspektoru:</span>
                        <span>{cert.customsInspectorBadge} ({cert.inspectionLaneCode})</span>
                      </div>
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
