import React, { useId, useState } from 'react';
import {
  MOCK_GEOTECHNICAL_CHECKLIST,
  MOCK_GEOTECHNICAL_EXAM,
  MOCK_SLOPE_SAFE_REGISTRY,
  MOCK_VEHICLE_PRESETS,
  VehiclePreset,
} from '../data/mockSlopeSafeData';
import {
  Currency,
  GeotechnicalSafetyChecklistItem,
  SLOPE_REGISTRY,
  SlopeAsset,
  SlopeAssetId,
  SlopeSafeCertificate,
  VehicleCategory,
  computeSlopeStability,
  evaluateGeotechnicalChecklist,
  evaluateGeotechnicalExam,
  evaluateVehicleTransitEligibility,
  formatCurrency,
  generateSlopeSafeCertificate,
} from '../utils/slopeSafeCompliance';

interface SlopeSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehiclePlate?: string;
  initialVehicleCategory?: VehicleCategory;
}

type ActiveTab =
  | 'pass_radar'
  | 'scada_telemetry'
  | 'vehicle_restrictions'
  | 'safety_checklist'
  | 'exam_simulator'
  | 'issue_certificate'
  | 'public_registry';

export const SlopeSafeModal: React.FC<SlopeSafeModalProps> = ({
  isOpen,
  onClose,
  initialVehiclePlate = '99-SL-101',
  initialVehicleCategory = 'suv_4x4',
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pass_radar');
  const [currency, setCurrency] = useState<Currency>('AZN');
  const porePressureInputId = useId();
  const inclinometerInputId = useId();
  const rainIntensityInputId = useId();
  const boulderMassInputId = useId();
  const impactVelocityInputId = useId();

  // Selected Slope Asset
  const [selectedAssetId, setSelectedAssetId] = useState<SlopeAssetId>('mughanly_pass');
  const currentAsset: SlopeAsset = SLOPE_REGISTRY[selectedAssetId];

  // Geotechnical SCADA Sliders / States
  const [porePressureKpa, setPorePressureKpa] = useState<number>(currentAsset.defaultPorePressureKpa);
  const [inclinometerMmDay, setInclinometerMmDay] = useState<number>(currentAsset.defaultInclinometerVelocityMmDay);
  const [rainfallMmHour, setRainfallMmHour] = useState<number>(12);
  const [boulderMassTons, setBoulderMassTons] = useState<number>(1.5);
  const [impactVelocityMs, setImpactVelocityMs] = useState<number>(18);

  // Vehicle Settings
  const [selectedVehiclePresetId, setSelectedVehiclePresetId] = useState<string>('toyota_prado_4x4');
  const [vehiclePlate, setVehiclePlate] = useState<string>(initialVehiclePlate);
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>(initialVehicleCategory);
  const [grossWeightTons, setGrossWeightTons] = useState<number>(2.85);

  // Checklist state
  const [checklist, setChecklist] = useState<GeotechnicalSafetyChecklistItem[]>(MOCK_GEOTECHNICAL_CHECKLIST);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Registry & Generated Certificate
  const [generatedCertificate, setGeneratedCertificate] = useState<SlopeSafeCertificate | null>(null);
  const [registryCertificates, setRegistryCertificates] = useState<SlopeSafeCertificate[]>(MOCK_SLOPE_SAFE_REGISTRY);
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute live SCADA Telemetry
  const telemetry = computeSlopeStability(
    currentAsset,
    porePressureKpa,
    inclinometerMmDay,
    rainfallMmHour,
    boulderMassTons,
    impactVelocityMs
  );

  // Compute live Vehicle Transit Restriction Assessment
  const transitAssessment = evaluateVehicleTransitEligibility(
    vehicleCategory,
    grossWeightTons,
    telemetry
  );

  // Evaluate Checklist
  const checklistResult = evaluateGeotechnicalChecklist(checklist);

  // Evaluate Exam
  const examResult = evaluateGeotechnicalExam(MOCK_GEOTECHNICAL_EXAM, examAnswers);

  const handleAssetSelect = (assetId: SlopeAssetId) => {
    setSelectedAssetId(assetId);
    const asset = SLOPE_REGISTRY[assetId];
    setPorePressureKpa(asset.defaultPorePressureKpa);
    setInclinometerMmDay(asset.defaultInclinometerVelocityMmDay);
  };

  const handleVehiclePresetSelect = (preset: VehiclePreset) => {
    setSelectedVehiclePresetId(preset.id);
    setVehiclePlate(preset.plate);
    setVehicleCategory(preset.category);
    setGrossWeightTons(preset.grossWeightTons);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, isCompliant: !item.isCompliant } : item))
    );
  };

  const handleAnswerSelect = (questionId: number, optionIdx: number) => {
    if (examSubmitted) return;
    setExamAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleResetExam = () => {
    setExamAnswers({});
    setExamSubmitted(false);
  };

  const handleGenerateCertificate = () => {
    const cert = generateSlopeSafeCertificate(
      currentAsset,
      vehiclePlate,
      vehicleCategory,
      grossWeightTons,
      telemetry,
      transitAssessment
    );
    setGeneratedCertificate(cert);
    setRegistryCertificates(prev => [cert, ...prev]);
    setActiveTab('issue_certificate');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} kopyalandı!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const filteredRegistry = registryCertificates.filter(
    cert =>
      cert.certificateId.toLowerCase().includes(registrySearchQuery.toLowerCase()) ||
      cert.vehiclePlate.toLowerCase().includes(registrySearchQuery.toLowerCase()) ||
      cert.slopeAsset.nameAz.toLowerCase().includes(registrySearchQuery.toLowerCase())
  );

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'stable_green':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'caution_yellow':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'critical_orange':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'emergency_red':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const getRiskLabelAz = (risk: string) => {
    switch (risk) {
      case 'stable_green':
        return 'NORMAL DAYANIQLI (YAŞIL)';
      case 'caution_yellow':
        return 'XƏBƏRDARLIQ / YAVAŞ SÜRÜŞMƏ (SARI)';
      case 'critical_orange':
        return 'KRİTİK PLASTİK DEFORMASİYA (NARINCI)';
      case 'emergency_red':
        return 'FÖVQƏLADƏ TƏHLÜKƏ / BAĞLI YOL (QIRMIZI)';
      default:
        return risk;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xl font-bold shadow-inner">
              🏔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  AAYDA • FHN • BDYP
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  SLOPE-SAFE-AZ-2026
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Dağ Yolları Sürüşmə, Qaya Uçqunu və Yamac Stabilliyi SCADA Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map(cur => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    currency === cur ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-700"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto scrollbar-thin">
          {[
            { id: 'pass_radar', label: '1. Dağ Aşırımları Radarı', icon: '📡' },
            { id: 'scada_telemetry', label: '2. Geotexniki SCADA Stendi', icon: '⚡' },
            { id: 'vehicle_restrictions', label: '3. Nəqliyyat & Sürət Məhdudiyyəti', icon: '🚛' },
            { id: 'safety_checklist', label: '4. Təhlükəsizlik Çeklisti', icon: '📋' },
            { id: 'exam_simulator', label: '5. Nəzəri İmtahan', icon: '🎓' },
            { id: 'issue_certificate', label: '6. SLOPE-SAFE Sertifikatı', icon: '📜' },
            { id: 'public_registry', label: '7. Rəsmi Reyestr', icon: '🔍' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {copyFeedback && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold animate-fade-in text-center">
              ✓ {copyFeedback}
            </div>
          )}

          {/* TAB 1: PASS RADAR */}
          {activeTab === 'pass_radar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-850 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Azərbaycanın 6 Strateji Dağ Aşırımı və Aktiv Sürüşmə Yamacı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    AAYDA və FHN Geotexniki Tədqiqatlar Mərkəzi tərəfindən daimi instrumental nəzarətdə saxlanılan zonalar.
                  </p>
                </div>
                <div className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 font-mono">
                  Seçilmiş Keçid: {currentAsset.highwayCode}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(SLOPE_REGISTRY).map(asset => {
                  const isSelected = asset.id === selectedAssetId;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleAssetSelect(asset.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-850/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                            {asset.highwayCode}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            🏔️ {asset.altitudeMeters} m
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">
                          {asset.nameAz}
                        </h4>
                        <p className="text-xs text-slate-400 mb-3">{asset.locationAz}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                          <div>
                            <span className="text-slate-500 block">Yamac Meyli:</span>
                            <span className="font-semibold text-white">{asset.slopeGradientDeg}°</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Hündürlük:</span>
                            <span className="font-semibold text-white">{asset.slopeHeightMeters} m</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Qaya Toru:</span>
                            <span className="font-semibold text-amber-400 font-mono">{asset.barrierEnergyCapacityKj} kJ</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Baza FoS:</span>
                            <span className="font-semibold text-emerald-400 font-mono">{asset.defaultFoS}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 italic mb-2">
                          {asset.geologicalCompositionAz}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 truncate">{asset.fhnDispatchStationAz.split(' ')[0]}</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                          {isSelected ? '✓ Seçilib' : 'Seç'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Jump to SCADA */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-850 to-slate-900 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-300">
                  <span className="font-bold text-white">Hazırki Aktiv Sahə: </span>
                  {currentAsset.nameAz} ({currentAsset.highwayCode})
                </div>
                <button
                  onClick={() => setActiveTab('scada_telemetry')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition shadow"
                >
                  SCADA Telemetriya Stendinə Keç →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA TELEMETRY */}
          {activeTab === 'scada_telemetry' && (
            <div className="space-y-6">
              {/* Alert Status Banner */}
              <div className={`p-5 rounded-2xl border ${getRiskBadgeColor(telemetry.computedRiskLevel)} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span className="text-xs font-bold tracking-wider uppercase font-mono">
                      {getRiskLabelAz(telemetry.computedRiskLevel)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {currentAsset.nameAz} ({currentAsset.highwayCode})
                  </h3>
                  <p className="text-xs opacity-90">
                    Dayanıqlıq Əmsalı (FoS): <span className="font-bold font-mono text-sm">{telemetry.computedFactorOfSafety}</span> •
                    İcazə Verilən Sürət Həddi: <span className="font-bold font-mono text-sm">{telemetry.authorizedSpeedLimitKmH} km/saat</span> •
                    Şlaqbaum Vəziyyəti: <span className="font-bold font-mono text-sm uppercase">{telemetry.barrierStatus}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-950/60 font-mono font-bold border border-white/10">
                    {telemetry.heavyTruckProhibition ? '🚫 >10T YÜK QADAĞAN' : '✓ BÜTÜN NƏQLİYYAT'}
                  </span>
                </div>
              </div>

              {/* Sliders Control Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Geotechnical Sliders */}
                <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>📡</span> Geotexniki Qrunt və Dərinlik Sensorları
                  </h4>

                  {/* Pore Pressure Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={porePressureInputId} className="text-slate-400 cursor-pointer">
                        Məsamə Suyu Təzyiqi (Piezometer u):
                      </label>
                      <span className="font-mono font-bold text-amber-400">
                        {porePressureKpa} kPa (Kritik: {currentAsset.criticalPorePressureKpa} kPa)
                      </span>
                    </div>
                    <input
                      id={porePressureInputId}
                      type="range"
                      min="5"
                      max={currentAsset.criticalPorePressureKpa * 1.5}
                      step="1"
                      value={porePressureKpa}
                      onChange={e => setPorePressureKpa(Number(e.target.value))}
                      className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>5 kPa (Quru qrunt)</span>
                      <span>Kritik Hədd: {currentAsset.criticalPorePressureKpa} kPa</span>
                      <span>{(currentAsset.criticalPorePressureKpa * 1.5).toFixed(0)} kPa</span>
                    </div>
                  </div>

                  {/* Inclinometer Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={inclinometerInputId} className="text-slate-400 cursor-pointer">
                        Qazma Quyusu İnklinometr Sürəti:
                      </label>
                      <span className="font-mono font-bold text-amber-400">
                        {inclinometerMmDay.toFixed(1)} mm/gün (Kritik: {currentAsset.criticalInclinometerVelocityMmDay} mm/gün)
                      </span>
                    </div>
                    <input
                      id={inclinometerInputId}
                      type="range"
                      min="0.1"
                      max={currentAsset.criticalInclinometerVelocityMmDay * 2}
                      step="0.1"
                      value={inclinometerMmDay}
                      onChange={e => setInclinometerMmDay(Number(e.target.value))}
                      className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>0.1 mm/gün (Stabil)</span>
                      <span>Kritik: {currentAsset.criticalInclinometerVelocityMmDay} mm/gün</span>
                      <span>{(currentAsset.criticalInclinometerVelocityMmDay * 2).toFixed(1)} mm/gün</span>
                    </div>
                  </div>

                  {/* Rain Intensity Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={rainIntensityInputId} className="text-slate-400 cursor-pointer">
                        Yağıntı İntensivliyi (Meteo-Radar):
                      </label>
                      <span className="font-mono font-bold text-amber-400">
                        {rainfallMmHour} mm/saat (24 saatlıq: {telemetry.rainfallCumulative24hMm} mm)
                      </span>
                    </div>
                    <input
                      id={rainIntensityInputId}
                      type="range"
                      min="0"
                      max="60"
                      step="1"
                      value={rainfallMmHour}
                      onChange={e => setRainfallMmHour(Number(e.target.value))}
                      className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>0 (Açıq hava)</span>
                      <span>25 mm/saat (Güclü yağış)</span>
                      <span>60 mm/saat (Fəlakətli leysan)</span>
                    </div>
                  </div>
                </div>

                {/* Rockfall Kinetic Energy Simulator */}
                <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-5">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>🪨</span> Qaya Uçqunu & Kinetik Enerji Simulyatoru
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-400 border border-slate-700">
                      Tor: {currentAsset.barrierEnergyCapacityKj} kJ
                    </span>
                  </h4>

                  {/* Boulder Mass Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={boulderMassInputId} className="text-slate-400 cursor-pointer">
                        Uçan Qaya Blokunun Kütləsi:
                      </label>
                      <span className="font-mono font-bold text-white">{boulderMassTons.toFixed(1)} Ton</span>
                    </div>
                    <input
                      id={boulderMassInputId}
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={boulderMassTons}
                      onChange={e => setBoulderMassTons(Number(e.target.value))}
                      className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Impact Velocity Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={impactVelocityInputId} className="text-slate-400 cursor-pointer">
                        Yola Çatma Zərbə Sürəti (v):
                      </label>
                      <span className="font-mono font-bold text-white">
                        {impactVelocityMs} m/s ({(impactVelocityMs * 3.6).toFixed(0)} km/saat)
                      </span>
                    </div>
                    <input
                      id={impactVelocityInputId}
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={impactVelocityMs}
                      onChange={e => setImpactVelocityMs(Number(e.target.value))}
                      className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Energy Calculation Display */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yaranan Kinetik Zərbə Enerjisi:</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {telemetry.barrierEnergyAbsorptionKj} kJ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Baryerin Enerji Ehtiyatı (Margin):</span>
                      <span
                        className={`font-mono font-bold ${
                          telemetry.barrierAbsorptionMarginPct > 30 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {telemetry.barrierAbsorptionMarginPct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full transition-all ${
                          telemetry.barrierEnergyAbsorptionKj > currentAsset.barrierEnergyCapacityKj
                            ? 'bg-rose-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (telemetry.barrierEnergyAbsorptionKj / currentAsset.barrierEnergyCapacityKj) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    {telemetry.barrierEnergyAbsorptionKj > currentAsset.barrierEnergyCapacityKj && (
                      <p className="text-rose-400 text-xs font-semibold pt-1">
                        ⚠️ DİQQƏT: Kinetik enerji polad baryerin 5000 kJ limitini aşır! Baryerin dağılma riski mövcuddur.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sensor Telemetry Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Səth Çatlarının Açılması:</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {telemetry.extensometerApertureMm} mm
                  </span>
                </div>
                <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Mikroseysmik Hadisələr:</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {telemetry.acousticEmissionEventsHour} hadisə/saat
                  </span>
                </div>
                <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Dayanıqlıq Əmsalı (FoS):</span>
                  <span className={`text-sm font-bold font-mono ${telemetry.computedFactorOfSafety < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {telemetry.computedFactorOfSafety}
                  </span>
                </div>
                <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Tövsiyə Edilən Sürət:</span>
                  <span className="text-sm font-bold font-mono text-amber-400">
                    {telemetry.authorizedSpeedLimitKmH} km/saat
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VEHICLE RESTRICTIONS */}
          {activeTab === 'vehicle_restrictions' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1">
                  Nəqliyyat Kateqoriyası, Çəki və Dağ Yolu Keçid Uyğunluğu
                </h3>
                <p className="text-xs text-slate-400">
                  Plastik sürüşmə və yamac zəifləməsi zamanı ağır ox yüklərinin yaratdığı dinamik vibrasiyanın qarşısını almaq üçün tənzimləmə.
                </p>
              </div>

              {/* Vehicle Preset Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Hazır Nəqliyyat Nümunələri (Presets):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_VEHICLE_PRESETS.map(preset => {
                    const isSelected = preset.id === selectedVehiclePresetId;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleVehiclePresetSelect(preset)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 shadow'
                            : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                            {preset.plate}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {preset.grossWeightTons} Ton
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white mb-1">{preset.name}</h5>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{preset.descriptionAz}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Vehicle Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-850 border border-slate-800">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı:</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ümumi Kütlə (Ton):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    step="0.1"
                    value={grossWeightTons}
                    onChange={e => setGrossWeightTons(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nəqliyyat Kateqoriyası:</label>
                  <select
                    value={vehicleCategory}
                    onChange={e => setVehicleCategory(e.target.value as VehicleCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="passenger_car">Minik Avtomobili (Sedan/Hatchback)</option>
                    <option value="suv_4x4">SUV 4x4 / Krossover</option>
                    <option value="minibus_van">Mikroavtobus (14-20 yerlik)</option>
                    <option value="bus_coach">Şəhərlərarası Böyük Avtobus</option>
                    <option value="medium_truck">Orta Yük Avtomobili (KamAZ/QAZel)</option>
                    <option value="heavy_freight_tir">Ağır Yük Qatarı / TIR (&gt;20 Ton)</option>
                    <option value="emergency_patrol">FHN / Operativ Təcili Xidmət</option>
                  </select>
                </div>
              </div>

              {/* Assessment Results Card */}
              <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase">Yoxlama Nəticəsi</span>
                    <h4 className="text-base font-bold text-white">
                      {transitAssessment.isAllowedToTransit ? (
                        <span className="text-emerald-400">✓ DAĞ KEÇİDİNƏ BURAXILIŞ VERİLİR</span>
                      ) : (
                        <span className="text-rose-400">✕ DAĞ KEÇİDİNƏ BURAXILIŞ QADAĞANDIR</span>
                      )}
                    </h4>
                  </div>
                  <div className="text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 font-mono">
                    Tövsiyə Sürət: <span className="font-bold text-amber-400">{transitAssessment.recommendedSpeedKmH} km/saat</span>
                  </div>
                </div>

                {!transitAssessment.isAllowedToTransit && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-1">
                    <p className="font-bold">Qadağanın Səbəbi:</p>
                    <p>{transitAssessment.rejectionReasonAz}</p>
                    <p className="text-[11px] text-rose-400/80 italic">{transitAssessment.rejectionReasonEn}</p>
                    {transitAssessment.statutoryFineAzn > 0 && (
                      <p className="pt-2 font-mono text-amber-300 font-bold">
                        Qaydanı pozma cəriməsi: {formatCurrency(transitAssessment.statutoryFineAzn, currency)} (30 gün ərzində 50% endirimlə: {formatCurrency(transitAssessment.discountedFineAzn, currency)})
                      </p>
                    )}
                  </div>
                )}

                {/* Tariff Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Dövlət Keçid Rüsumu:</span>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(transitAssessment.transitTariffAzn, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Geotexniki SCADA Nəzarəti (18%):</span>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(transitAssessment.geotechnicalMonitoringFeeAzn, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cəmi Ödəniləcək Məbləğ:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {formatCurrency(transitAssessment.transitTariffAzn + transitAssessment.geotechnicalMonitoringFeeAzn, currency)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={!transitAssessment.isAllowedToTransit}
                    onClick={handleGenerateCertificate}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow ${
                      transitAssessment.isAllowedToTransit
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    SLOPE-SAFE-AZ-2026 Sertifikatı İstehsal Et →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAFETY CHECKLIST */}
          {activeTab === 'safety_checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-850 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    10 Maddəlik Geotexniki və Dağ Yolu İnfrastruktur Çeklisti
                  </h3>
                  <p className="text-xs text-slate-400">
                    Eurocode 7 (EN 1997) və AZS Dövlət Tikinti Normalarına uyğun mühəndis audit protokolu.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300">
                    Uyğunluq: {checklistResult.complianceScorePct}%
                  </span>
                  <span
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold ${
                      checklistResult.passedInspection
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {checklistResult.passedInspection ? '✓ AUDİTDƏN KEÇDİ' : '✕ ÇATIŞMAZLIQ VAR'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {checklist.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-4 ${
                      item.isCompliant
                        ? 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
                        : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                    }`}
                  >
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={item.isCompliant}
                        onChange={() => {}} // handled by parent onClick
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white">
                          {idx + 1}. {item.titleAz}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.standardReference}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-1">{item.notesAz}</p>
                      <p className="text-[11px] text-slate-500 italic">{item.notesEn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM SIMULATOR */}
          {activeTab === 'exam_simulator' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-850 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Dağ Yolları və Sürüşmə Təhlükəsizliyi Nəzəri İmtahan Simulyatoru
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, FHN və BDYP tərəfindən dağ yollarında xidmət edən mühəndis və sürücülər üçün 10 suallıq rəsmi test.
                  </p>
                </div>
                {examSubmitted ? (
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold ${
                        examResult.isPassed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {examResult.isPassed ? '✓ İMTAHANDAN KEÇDİ' : '✕ KƏSİLDİ'} ({examResult.correctAnswers}/10)
                    </span>
                    <button
                      onClick={handleResetExam}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Yenidən Başla
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={Object.keys(examAnswers).length < 10}
                    onClick={() => setExamSubmitted(true)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                      Object.keys(examAnswers).length === 10
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Cavabları Yoxla ({Object.keys(examAnswers).length}/10)
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_GEOTECHNICAL_EXAM.map(q => {
                  const selected = examAnswers[q.id];
                  const isCorrect = selected === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition ${
                        examSubmitted
                          ? isCorrect
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : 'bg-rose-500/5 border-rose-500/30'
                          : 'bg-slate-850 border-slate-800'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-white mb-1">
                        {q.id}. {q.questionAz}
                      </h4>
                      <p className="text-xs text-slate-400 italic mb-3">{q.questionEn}</p>

                      <div className="space-y-2">
                        {q.optionsAz.map((opt, idx) => {
                          const isOptionSelected = selected === idx;
                          let optionClasses = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (examSubmitted) {
                            if (idx === q.correctOptionIndex) {
                              optionClasses = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold';
                            } else if (isOptionSelected) {
                              optionClasses = 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold';
                            } else {
                              optionClasses = 'bg-slate-900/60 border-slate-800/80 text-slate-500 opacity-60';
                            }
                          } else if (isOptionSelected) {
                            optionClasses = 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold';
                          }

                          return (
                            <div
                              key={idx}
                              onClick={() => handleAnswerSelect(q.id, idx)}
                              className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${optionClasses}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && idx === q.correctOptionIndex && (
                                <span className="text-emerald-400 font-bold text-xs">✓ Düzgün</span>
                              )}
                              {examSubmitted && isOptionSelected && idx !== q.correctOptionIndex && (
                                <span className="text-rose-400 font-bold text-xs">✕ Səhv</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                          <p className="font-semibold text-amber-400">İzah:</p>
                          <p>{q.explanationAz}</p>
                          <p className="text-[11px] text-slate-500 italic">{q.explanationEn}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE GENERATOR */}
          {activeTab === 'issue_certificate' && (
            <div className="space-y-6">
              {generatedCertificate ? (
                <div className="space-y-6">
                  {/* Digital Certificate Document Card */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-850 via-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
                    {/* Watermark Emblem */}
                    <div className="absolute right-[-20px] bottom-[-20px] text-slate-800/20 text-9xl font-black pointer-events-none select-none">
                      AAYDA
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            AAYDA • FHN • BDYP
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            RƏSMİ ELEKTRON VƏSİQƏ
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                          DAĞ KEÇİDİ VƏ YAMAC STABİLLİYİ BURAXILIŞ SERTİFİKATI
                        </h3>
                        <p className="text-xs text-slate-400">
                          MOUNTAIN PASS TRANSIT & GEOTECHNICAL CLEARANCE CERTIFICATE
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400">Sertifikat №:</div>
                        <div className="text-sm sm:text-base font-mono font-black text-amber-400">
                          {generatedCertificate.certificateId}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          PIN: {generatedCertificate.barrierPassPin}
                        </div>
                      </div>
                    </div>

                    {/* Certificate Body Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6 border-b border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block">Nəqliyyat Vasitəsi:</span>
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          {generatedCertificate.vehiclePlate}
                        </span>
                        <span className="text-slate-400 block capitalize">
                          {generatedCertificate.vehicleCategory.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Təsdiq Edilmiş Aşırım Dəhlizi:</span>
                        <span className="font-bold text-white block">
                          {generatedCertificate.slopeAsset.highwayCode}
                        </span>
                        <span className="text-slate-400 block line-clamp-1">
                          {generatedCertificate.slopeAsset.nameAz}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Ölçülən Dayanıqlıq (FoS):</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {generatedCertificate.factorOfSafety}
                        </span>
                        <span className="text-slate-400 block">
                          İnklinometr: {generatedCertificate.measuredInclinometerMmDay} mm/gün
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Məsamə Təzyiqi:</span>
                        <span className="font-mono font-bold text-white">
                          {generatedCertificate.measuredPorePressureKpa} kPa
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">İcazə Verilən Sürət Həddi:</span>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {generatedCertificate.speedLimitKmH} km/saat
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Ödənilən Dövlət Rüsumu:</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(generatedCertificate.totalDutyPaidAzn, currency)}
                        </span>
                      </div>
                    </div>

                    {/* SİMA Signature & Verification */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 block">SİMA Rəqəmsal İmza Şifrəsi:</span>
                        <span className="font-mono text-amber-300 font-bold block text-[11px]">
                          {generatedCertificate.simaDigitalSignatureHash}
                        </span>
                        <span className="text-slate-400 block text-[10px]">
                          Verilmə: {new Date(generatedCertificate.issueTimestamp).toLocaleString('az-AZ')} • Bitmə: 24 saat
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCopyText(generatedCertificate.certificateId, 'Sertifikat nömrəsi')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700"
                        >
                          № Kopyala
                        </button>
                        <button
                          onClick={() => handleCopyText(generatedCertificate.verificationQrLink, 'Verifikasiya linki')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                        >
                          QR Link Kopyala
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-850 border border-slate-800 text-center space-y-4">
                  <span className="text-4xl block">📜</span>
                  <h4 className="text-base font-bold text-white">Hələ Sertifikat İstehsal Edilməyib</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Nəqliyyat vasitənizi seçin və təhlükəsizlik şərtlərinə uyğunluğu təsdiq edərək SLOPE-SAFE-AZ-2026 sertifikatı əldə edin.
                  </p>
                  <button
                    onClick={() => setActiveTab('vehicle_restrictions')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm"
                  >
                    Nəqliyyat və Uyğunluq Bölməsinə Get →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY */}
          {activeTab === 'public_registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-850 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Rəsmi Dağ Keçidi və Geotexniki İcazələr Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA və FHN tərəfindən verilmiş SLOPE-SAFE-AZ-2026 icazələrinin canlı yoxlanılması.
                  </p>
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Sertifikat №, nömrə və ya aşırım..."
                    value={registrySearchQuery}
                    onChange={e => setRegistrySearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredRegistry.map(cert => (
                  <div
                    key={cert.certificateId}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {cert.certificateId}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 font-mono text-slate-300 border border-slate-700">
                          PIN: {cert.barrierPassPin}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getRiskBadgeColor(cert.riskLevel)}`}>
                          FoS: {cert.factorOfSafety}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white">
                        {cert.slopeAsset.highwayCode} — {cert.slopeAsset.nameAz}
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Nəqliyyat: <span className="font-mono font-bold text-amber-300">{cert.vehiclePlate}</span> ({cert.grossWeightTons} T) •
                        Sürət Limiti: <span className="font-bold text-white">{cert.speedLimitKmH} km/saat</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleCopyText(cert.certificateId, 'Sertifikat kodu')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Kopyala
                      </button>
                    </div>
                  </div>
                ))}

                {filteredRegistry.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Sorğuya uyğun heç bir rəsmi sertifikat tapılmadı.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AAYDA & FHN Geotexniki SCADA Şəbəkəsi Canlı Əlaqədədir</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-slate-500">Eurocode 7 • AZS 410</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
