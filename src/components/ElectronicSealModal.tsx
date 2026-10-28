import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Radio,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  Search,
  Copy,
  Printer,
  Compass,
  Truck,
  Eye,
  Activity,
  BatteryCharging,
  Layers,
  ChevronRight,
  Info,
  HelpCircle,
  ExternalLink,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  ElectronicSealType,
  TransitCorridorCode,
  CargoRiskType,
  ELECTRONIC_SEAL_SPECS,
  TRANSIT_CORRIDORS,
  CARGO_RISK_SPECS,
  TelemetryStandInputs,
  evaluateSealTelemetry,
  calculateSealFeesAndPenalties,
  calculateSealChecklistScore,
  evaluateSealExam,
  generateElectronicSealCertificate,
  ElectronicSealCertificate,
} from '../utils/electronicSealCompliance';
import {
  MOCK_TRANSIT_TRUCK_PRESETS,
  MOCK_SEAL_CHECKLIST_ITEMS,
  MOCK_SEAL_EXAM_QUESTIONS,
  MOCK_ISSUED_ELECTRONIC_SEALS,
} from '../data/mockElectronicSealData';

interface ElectronicSealModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle;
  currency?: Currency;
  lang?: 'az' | 'en' | 'ru';
}

type TabType = 'telemetry' | 'corridor' | 'calculator' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const ElectronicSealModal: React.FC<ElectronicSealModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency = 'AZN',
  lang = 'az',
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('telemetry');

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-1');

  // Telemetry Inputs State
  const [sealType, setSealType] = useState<ElectronicSealType>('GPS_ELOCK_PREMIUM');
  const [corridor, setCorridor] = useState<TransitCorridorCode>('CORRIDOR_NORTH_SOUTH_M1_M3');
  const [cargoRisk, setCargoRisk] = useState<CargoRiskType>('STANDARD_GENERAL');
  const [cableCut, setCableCut] = useState<boolean>(false);
  const [ambientLightLux, setAmbientLightLux] = useState<number>(0.2);
  const [shockGForce, setShockGForce] = useState<number>(0.8);
  const [batteryPercent, setBatteryPercent] = useState<number>(94);
  const [routeDeviationMeters, setRouteDeviationMeters] = useState<number>(45);
  const [unauthorizedDwellMinutes, setUnauthorizedDwellMinutes] = useState<number>(0);

  // Active Vehicle Plate & Container
  const [plateNumber, setPlateNumber] = useState<string>(vehicle?.plateNumber || '99-EL-101');
  const [containerNumber, setContainerNumber] = useState<string>('MSKU-918234-1');

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<string[]>(
    MOCK_SEAL_CHECKLIST_ITEMS.filter((i) => i.isMandatory).map((i) => i.id)
  );

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Registry & Certificate
  const [activeCert, setActiveCert] = useState<ElectronicSealCertificate | null>(null);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryFilter, setRegistryFilter] = useState<'ALL' | 'CLEARED' | 'BREACH'>('ALL');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Evaluate Telemetry Inputs
  const telemetryInputs: TelemetryStandInputs = useMemo(
    () => ({
      sealType,
      corridor,
      cargoRisk,
      cableCut,
      ambientLightLux,
      shockGForce,
      batteryPercent,
      routeDeviationMeters,
      unauthorizedDwellMinutes,
    }),
    [
      sealType,
      corridor,
      cargoRisk,
      cableCut,
      ambientLightLux,
      shockGForce,
      batteryPercent,
      routeDeviationMeters,
      unauthorizedDwellMinutes,
    ]
  );

  const evaluation = useMemo(() => evaluateSealTelemetry(telemetryInputs), [telemetryInputs]);

  const feeBreakdown = useMemo(
    () => calculateSealFeesAndPenalties(telemetryInputs, currency),
    [telemetryInputs, currency]
  );

  const checklistScore = useMemo(
    () => calculateSealChecklistScore(MOCK_SEAL_CHECKLIST_ITEMS, checkedItems),
    [checkedItems]
  );

  const examEvaluation = useMemo(
    () => evaluateSealExam(MOCK_SEAL_EXAM_QUESTIONS, examAnswers),
    [examAnswers]
  );

  // Handle Preset Loading
  const handleApplyPreset = (presetId: string) => {
    const preset = MOCK_TRANSIT_TRUCK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setPlateNumber(preset.plate);
    setContainerNumber(preset.containerNumber);
    setSealType(preset.inputs.sealType);
    setCorridor(preset.inputs.corridor);
    setCargoRisk(preset.inputs.cargoRisk);
    setCableCut(preset.inputs.cableCut);
    setAmbientLightLux(preset.inputs.ambientLightLux);
    setShockGForce(preset.inputs.shockGForce);
    setBatteryPercent(preset.inputs.batteryPercent);
    setRouteDeviationMeters(preset.inputs.routeDeviationMeters);
    setUnauthorizedDwellMinutes(preset.inputs.unauthorizedDwellMinutes);
  };

  // Generate Certificate
  const handleGenerateCertificate = () => {
    const cert = generateElectronicSealCertificate(
      plateNumber,
      containerNumber,
      telemetryInputs,
      evaluation
    );
    setActiveCert(cert);
    setActiveTab('certificate');
  };

  // Toggle Checklist Item
  const handleToggleChecklistItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    setCheckedItems(MOCK_SEAL_CHECKLIST_ITEMS.map((item) => item.id));
  };

  // Copy Certificate Action
  const handleCopyCertDetails = () => {
    if (!activeCert) return;
    const details = `DÖVLƏT GÖMRÜK KOMİTƏSİ & AYNA - ELEKTRON PLOMB SERTİFİKATI\nSertifikat №: ${activeCert.certificateNumber}\nPlomb Seriyası: ${activeCert.sealSerial}\nNəqliyyat Vasitəsi: ${activeCert.plateNumber}\nKonteyner: ${activeCert.containerNumber}\nDəhliz: ${TRANSIT_CORRIDORS[activeCert.corridor].nameAz}\nStatus: ${activeCert.isTamperFree ? 'BÜTÖV (TƏHLÜKƏSİZ)' : 'POZUNTU QEYDƏ ALINDI'}\nSHA-256: ${activeCert.securityChecksumSha256}\nSİMA: ${activeCert.simaDigitalUid}`;
    navigator.clipboard.writeText(details);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Filter Registry
  const filteredRegistry = useMemo(() => {
    return MOCK_ISSUED_ELECTRONIC_SEALS.filter((cert) => {
      const matchesSearch =
        cert.certificateNumber.toLowerCase().includes(registrySearch.toLowerCase()) ||
        cert.plateNumber.toLowerCase().includes(registrySearch.toLowerCase()) ||
        cert.containerNumber.toLowerCase().includes(registrySearch.toLowerCase()) ||
        cert.sealSerial.toLowerCase().includes(registrySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (registryFilter === 'CLEARED') {
        return cert.integrityRating === 'LOW_RISK_CLEARED';
      }
      if (registryFilter === 'BREACH') {
        return cert.integrityRating === 'CRITICAL_SECURITY_BREACH';
      }
      return true;
    });
  }, [registrySearch, registryFilter]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="seal-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white"
    >
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-slate-100 print:max-h-none print:border-none print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/20 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  DGK & AYNA & BDYP
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  ISO 17712 / Gömrük Məcəlləsi Maddə 230
                </span>
              </div>
              <h2 id="seal-modal-title" className="text-base sm:text-lg font-bold text-white tracking-wide">
                Gömrük Elektron İntellektual Plomb & Tranzit Geofencing Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Bağla"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-3 sm:px-6 flex overflow-x-auto gap-2 py-2.5 text-xs sm:text-sm font-medium scrollbar-thin">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            Telemetriya Standı
          </button>
          <button
            onClick={() => setActiveTab('corridor')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'corridor'
                ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            Dəhliz Geofencing
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            Rüsum & Cərimə
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            10-Nöqtəli Audit ({checklistScore.scorePercent}%)
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'exam'
                ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            DGK İmtahanı
          </button>
          <button
            onClick={() => {
              if (!activeCert) {
                const cert = generateElectronicSealCertificate(
                  plateNumber,
                  containerNumber,
                  telemetryInputs,
                  evaluation
                );
                setActiveCert(cert);
              }
              setActiveTab('certificate');
            }}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Rəsmi Sertifikat
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            Vahid Reyestr
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: TELEMETRY STAND */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div>
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Real Tranzit Nəqliyyat Preseti Seçin (6 Nümunə):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_TRANSIT_TRUCK_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPresetId === p.id
                          ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="font-mono font-bold text-sm text-emerald-300">{p.plate}</div>
                      <div className="text-[11px] text-slate-400 truncate">{p.containerNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">
                        {p.inputs.cableCut
                          ? '⚠️ Qırılmış Naqil'
                          : p.inputs.ambientLightLux > 5
                          ? '⚠️ Qapı Açıq'
                          : p.inputs.routeDeviationMeters > 800
                          ? '⚠️ Marşrut Kənarı'
                          : '✅ Bütöv Plomb'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Alert Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  evaluation.overallRating === 'CRITICAL_SECURITY_BREACH'
                    ? 'bg-red-950/40 border-red-500/50 text-red-200'
                    : evaluation.overallRating === 'ELEVATED_SURVEILLANCE'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {evaluation.overallRating === 'CRITICAL_SECURITY_BREACH' ? (
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 animate-bounce" />
                  ) : evaluation.overallRating === 'ELEVATED_SURVEILLANCE' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-sm sm:text-base">
                      {evaluation.overallRating === 'CRITICAL_SECURITY_BREACH'
                        ? 'KRİTİK GÖMRÜK VƏ TOXUNULMAZLIOQ POZUNTUSU QEYDƏ ALINDI!'
                        : evaluation.overallRating === 'ELEVATED_SURVEILLANCE'
                        ? 'GÜCLƏNDİRİLMİŞ MONITORİNQ VƏ PROTOKOL XƏBƏRDARLIĞI'
                        : 'ELEKTRON PLOMB VƏ TRANZİT REJİMİ TAM QANUNİDİR'}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">{evaluation.tamperExplanationAz}</div>
                  </div>
                </div>
                {evaluation.requiresCustomsInterception && (
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-red-600 text-white shrink-0 animate-pulse">
                    BDYP & DGK SAXLAMA SƏRƏNCAMI
                  </span>
                )}
              </div>

              {/* Interactive E-Lock Visualizer Stand */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual E-Lock Graphic Panel */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                      E-Lock İnteraktiv Panel
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {ELECTRONIC_SEAL_SPECS[sealType].modelCode}
                    </span>
                  </div>

                  {/* Visual E-Lock representation */}
                  <div className="relative py-6 flex flex-col items-center justify-center">
                    {/* Cable loop graphic */}
                    <div
                      className={`w-36 h-28 border-4 border-dashed rounded-t-full transition-all duration-300 ${
                        cableCut
                          ? 'border-red-500 scale-105 opacity-60'
                          : 'border-emerald-400'
                      }`}
                    >
                      {cableCut && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            KƏSİLMİŞ İLMƏ
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Lock Body */}
                    <div className="w-48 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 rounded-xl p-4 shadow-xl flex flex-col items-center text-center relative -mt-4 z-10">
                      <div className="p-2 rounded-full bg-slate-950 border border-slate-700 mb-2">
                        {cableCut ? (
                          <Unlock className="w-8 h-8 text-red-400 animate-pulse" />
                        ) : (
                          <Lock className="w-8 h-8 text-emerald-400" />
                        )}
                      </div>
                      <div className="font-mono text-xs font-bold text-white tracking-widest">
                        DGK-ELOCK-994-0192
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        SİMA Rəqəmsal İmza Tokeni
                      </div>

                      {/* Micro Telemetry Indicators */}
                      <div className="w-full grid grid-cols-2 gap-2 mt-4 text-[10px] text-left">
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                          <span className="text-slate-500 block">Şəbəkə:</span>
                          <span className="font-semibold text-emerald-400">
                            {ELECTRONIC_SEAL_SPECS[sealType].hasSatelliteUplink
                              ? '4G + İridium Peyk'
                              : '4G LTE-M'}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                          <span className="text-slate-500 block">Batareya:</span>
                          <span
                            className={`font-semibold ${
                              batteryPercent < 20 ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {batteryPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick simulation toggles */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCableCut(!cableCut)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        cableCut
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {cableCut ? 'Kabeli Bərpa Et' : '⚠️ Kabeli Qır / Kəs'}
                    </button>
                    <button
                      onClick={() => setAmbientLightLux(ambientLightLux > 5 ? 0.2 : 18.5)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ambientLightLux > 5
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {ambientLightLux > 5 ? 'Qapını Bağla (0.2 Lx)' : '🚪 Qapını Aç (18.5 Lx)'}
                    </button>
                  </div>
                </div>

                {/* Telemetry Sliders & Parameters */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Sensor Telemetriyası və İnteraktiv Dərəcələmə
                    </h3>
                    <button
                      onClick={() => {
                        setCableCut(false);
                        setAmbientLightLux(0.2);
                        setShockGForce(0.8);
                        setBatteryPercent(95);
                        setRouteDeviationMeters(40);
                        setUnauthorizedDwellMinutes(0);
                      }}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Sıfırla
                    </button>
                  </div>

                  {/* Slider 1: Ambient Light Sensor inside Container */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        Konteyner Daxili İşıq Səviyyəsi (Lux):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          ambientLightLux > 5 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {ambientLightLux.toFixed(1)} Lux {ambientLightLux > 5 ? '(QAPINI ARALAMA ALARMI!)' : '(Qapalı)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={ambientLightLux}
                      onChange={(e) => setAmbientLightLux(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.0 Lux (Zülmət Qaranlıq)</span>
                      <span className="text-amber-400">5.0 Lux (Kritik Hədd)</span>
                      <span>100 Lux (Açıq Qapı)</span>
                    </div>
                  </div>

                  {/* Slider 2: Accelerometer G-Force */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                        Akselerometr / Zərbə Təkanı (G-Force):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          shockGForce >= 3.5 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {shockGForce.toFixed(1)} G {shockGForce >= 3.5 ? '(ŞÜBHƏLİ ZƏRBƏ / QƏZA)' : '(Nominal)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="8.0"
                      step="0.1"
                      value={shockGForce}
                      onChange={(e) => setShockGForce(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.5 G (Düz Yol)</span>
                      <span className="text-amber-400">3.5 G (Kritik Zərbə Həddi)</span>
                      <span>8.0 G (Ağır Qəza / Devrilmə)</span>
                    </div>
                  </div>

                  {/* Slider 3: Route Deviation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-purple-400" />
                        Marşrut Oxundan Kənara Çıxma (Metr):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          routeDeviationMeters > 1000 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {routeDeviationMeters} m {routeDeviationMeters > 1000 ? '(GEOFENCE POZUNTUSU!)' : '(Dəhlizdə)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3000"
                      step="50"
                      value={routeDeviationMeters}
                      onChange={(e) => setRouteDeviationMeters(parseInt(e.target.value, 10))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0 m (Mərkəzi Zolaq)</span>
                      <span className="text-purple-400">1000 m (İcazə Verilən Bufer)</span>
                      <span>3000 m (Əsassız Dəhliz Terki)</span>
                    </div>
                  </div>

                  {/* Slider 4: Battery Level */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                        Plombun Batareya Enerji Səviyyəsi (%):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          batteryPercent < 20 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {batteryPercent}% {batteryPercent < 15 ? '(ÇIXIŞA QADAĞA - KRİTİK)' : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="1"
                      value={batteryPercent}
                      onChange={(e) => setBatteryPercent(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Vehicle & Container inputs */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı:</label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Konteyner / Qoşqu Nömrəsi:</label>
                      <input
                        type="text"
                        value={containerNumber}
                        onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-white">Hazırkı Tranzit Dəhlizi:</span>{' '}
                  {TRANSIT_CORRIDORS[corridor].nameAz} ({TRANSIT_CORRIDORS[corridor].distanceKm} km)
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('corridor')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Dəhliz Xəritəsi
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleGenerateCertificate}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    Rəsmi Sertifikat Yarat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CORRIDOR GEOFENCING & RADAR */}
          {activeTab === 'corridor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Azərbaycan Respublikasının Strateji Tranzit Dəhlizləri və Geofencing Radarı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Gömrük Məcəlləsi Maddə 188 və Nazirlər Kabinetinin təsdiq etdiyi beynəlxalq tranzit xətləri
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                  Maksimum Bufer: ±1000m
                </span>
              </div>

              {/* Corridor Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(TRANSIT_CORRIDORS).map((c) => (
                  <div
                    key={c.code}
                    onClick={() => setCorridor(c.code)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                      corridor === c.code
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">{c.distanceKm} km</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Maks: {c.maxAllowedHours} saat
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white mb-1.5">{c.nameAz}</h4>
                      <div className="space-y-1 text-xs text-slate-400 mb-3">
                        <div>
                          <span className="text-slate-500">Giriş:</span> {c.entryPostAz}
                        </div>
                        <div>
                          <span className="text-slate-500">Çıxış:</span> {c.exitPostAz}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] text-slate-400 font-semibold mb-1">Təsdiqlənmiş TIR Dayanacaqları:</div>
                      <ul className="text-[10px] text-slate-400 space-y-0.5 list-disc list-inside">
                        {c.designatedStopsAz.map((stop, idx) => (
                          <li key={idx} className="truncate">
                            {stop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Corridor Telemetry Stand */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    Seçilmiş Dəhliz: {TRANSIT_CORRIDORS[corridor].nameAz}
                  </h4>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                      routeDeviationMeters > TRANSIT_CORRIDORS[corridor].geofenceBufferMeters
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {routeDeviationMeters > TRANSIT_CORRIDORS[corridor].geofenceBufferMeters
                      ? 'MARŞRUTDAN ƏSASSIZ KƏNARAÇIXMA'
                      : 'MÜƏYYƏN OLUNMUŞ DƏHLİZDƏ'}
                  </span>
                </div>

                {/* Unauthorized Dwell Timer Slider */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">TIR Parkından Kənarda Dayanma Müddəti:</span>
                    <span
                      className={`font-mono font-bold ${
                        unauthorizedDwellMinutes > 45 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {unauthorizedDwellMinutes} dəqiqə {unauthorizedDwellMinutes > 45 ? '(QADAĞAN EDİLMİŞ DAYANMA)' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={unauthorizedDwellMinutes}
                    onChange={(e) => setUnauthorizedDwellMinutes(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0 dəq (Hərəkətdədir)</span>
                    <span className="text-amber-400">45 dəq (Maksimum Hədd)</span>
                    <span>120 dəq (Şübhəli Müdaxilə)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DUTY & PENALTY CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                    Elektron Plomb & Tranzit Parametrləri
                  </h3>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Elektron Plomb Növü:</label>
                    <div className="space-y-2">
                      {Object.values(ELECTRONIC_SEAL_SPECS).map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setSealType(s.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            sealType === s.id
                              ? 'bg-emerald-950/60 border-emerald-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold">{s.nameAz}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{s.descriptionAz}</div>
                          </div>
                          <span className="font-mono font-bold text-emerald-400 text-sm ml-2">
                            {s.baseFeeAzn} AZN
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Yükün Risk və Aksiz Kateqoriyası:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.values(CARGO_RISK_SPECS).map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setCargoRisk(r.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            cargoRisk === r.id
                              ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div>{r.nameAz}</div>
                          <div className="text-[10px] text-emerald-400 mt-1">
                            +{r.surveillanceSurchargeAzn} AZN Nəzarət
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Summary Panel */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
                      <span>Dövlət Rüsumu & Maliyyə Hesabatı</span>
                      <span className="font-mono text-emerald-400 text-xs">Valyuta: {currency}</span>
                    </h3>

                    <div className="divide-y divide-slate-800/80 text-xs mt-3 space-y-2">
                      <div className="flex justify-between py-1.5 text-slate-300">
                        <span>Baza Plomb İstifadə Rüsumu:</span>
                        <span className="font-mono font-semibold">{feeBreakdown.baseSealFeeAzn} AZN</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-slate-300">
                        <span>Dəhliz Məsafə Əlavəsi (&gt;300 km):</span>
                        <span className="font-mono font-semibold">{feeBreakdown.corridorDistanceSurchargeAzn} AZN</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-slate-300">
                        <span>Yüksək Risk / Aksiz Nəzarət Haqqı:</span>
                        <span className="font-mono font-semibold">{feeBreakdown.riskSurveillanceSurchargeAzn} AZN</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-slate-300">
                        <span>Peyk Rabitəsi & Data Trafik:</span>
                        <span className="font-mono font-semibold">{feeBreakdown.satelliteDataMonitoringAzn} AZN</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-slate-400">
                        <span>18% ƏDV:</span>
                        <span className="font-mono">{feeBreakdown.vat18PercentAzn} AZN</span>
                      </div>
                      <div className="flex justify-between py-2 text-white font-bold bg-slate-900/60 px-2 rounded-lg">
                        <span>Qanuni Dövlət Tranzit Rüsumu:</span>
                        <span className="font-mono text-emerald-400">{feeBreakdown.totalStatutoryDutyAzn} AZN</span>
                      </div>
                    </div>

                    {/* Fines Section */}
                    {feeBreakdown.statutoryFineAzn > 0 && (
                      <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 space-y-2">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          İnzibati Xətalar Məcəlləsi Maddə 499 & 501 Cəriməsi:
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Plombun qırılması / Marşrut kənarı:</span>
                          <span className="font-mono font-bold text-red-400">{feeBreakdown.statutoryFineAzn} AZN</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Cəmi Ödəniləcək:</span>
                      <span className="font-mono text-2xl font-black text-emerald-400">
                        {feeBreakdown.convertedTotal} {currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT SECURITY CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    10-Nöqtəli DGK & AYNA Elektron Plomb Təhlükəsizlik Auditi
                  </h3>
                  <p className="text-xs text-slate-400">
                    İSO 17712 və Gömrük Məcəlləsinin 230-cu maddəsi üzrə məcburi texniki və hüquqi tələblər
                  </p>
                </div>
                <button
                  onClick={handleSelectAllChecklist}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer"
                >
                  Hamısını Seç / Təsdiqlə
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Uyğunluq Reytinqi:</span>
                  <span
                    className={`font-mono font-bold ${
                      checklistScore.passed ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {checklistScore.scorePercent}% {checklistScore.passed ? '(Təsdiqləndi)' : '(Yetərsiz)'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistScore.passed ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${checklistScore.scorePercent}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {MOCK_SEAL_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-900 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by div click
                        className="mt-1 accent-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-white">{item.titleAz}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-400 shrink-0">
                            {item.legalBasis}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.descriptionAz}</p>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    DGK & AYNA Tranzit Rejimi və Elektron Plomb İmtahan Simulyatoru
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tranzit sürücüləri və beynəlxalq logistika operatorları üçün 10 nəzəri test sualı
                  </p>
                </div>
                {examSubmitted && (
                  <div
                    className={`px-3 py-1 rounded-xl font-bold text-xs ${
                      examEvaluation.passed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    Nəticə: {examEvaluation.scorePercent}% ({examEvaluation.passed ? 'KEÇDİ' : 'KƏSİLDİ'})
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {MOCK_SEAL_EXAM_QUESTIONS.map((q, qIdx) => {
                  const userAnswer = examAnswers[q.id];
                  return (
                    <div key={q.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs">
                          {qIdx + 1}
                        </span>
                        <div className="text-xs sm:text-sm font-semibold text-white">{q.questionAz}</div>
                      </div>

                      <div className="space-y-2 pt-1">
                        {q.optionsAz.map((opt, oIdx) => {
                          const isSelected = userAnswer === oIdx;
                          const isCorrect = q.correctIndex === oIdx;

                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                          if (examSubmitted) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-red-950/80 border-red-500 text-red-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => {
                                if (examSubmitted) return;
                                setExamAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                              }}
                              className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                              {examSubmitted && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-3 bg-slate-900/80 rounded-lg text-xs text-slate-400 border border-slate-800">
                          <span className="font-semibold text-emerald-400">İzah:</span> {q.explanationAz}
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            Hüquqi Əsas: {q.legalArticle}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                {!examSubmitted ? (
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    Cavabları Təsdiqlə və Qiymətləndir
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                  >
                    Yenidən Başla
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL CERTIFICATE & SEAL PASS */}
          {activeTab === 'certificate' && activeCert && (
            <div className="space-y-6">
              {/* Actions Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Rəsmi Elektron Tranzit və Toxunulmazlıq Sertifikatı
                  </h3>
                  <p className="text-xs text-slate-400">
                    SİMA dövlət rəqəmsal imzası və kriptoqrafik SHA-256 nəzarət xülasəsi ilə təsdiq olunmuş hüquqi sənəd
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCertDetails}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedCode ? 'Kopyalandı!' : 'Məlumatları Kopyala'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Çap Et
                  </button>
                </div>
              </div>

              {/* Certificate Canvas / Card */}
              <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl print:bg-white print:text-black print:border-black print:shadow-none">
                {/* Watermark / Header */}
                <div className="border-b-2 border-emerald-500/30 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <ShieldAlert className="w-9 h-9" />
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                        AZƏRBAYCAN RESPUBLİKASI DÖVLƏT GÖMRÜK KOMİTƏSİ
                      </div>
                      <div className="text-base sm:text-lg font-black text-white">
                        ELEKTRON İNTELLEKTUAL TRANZİT PLOMBU SERTİFİKATI
                      </div>
                      <div className="text-xs text-slate-400">
                        AYNA & BDYP Vahid İnformasiya Sistemi İnteqrasiyası
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-sm sm:text-base font-black px-3 py-1 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-lg">
                      {activeCert.certificateNumber}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      Status: {activeCert.isClearedForExit ? '✅ ÇIXIŞA İCAZƏ VERİLDİ' : '⚠️ SAXLANILDI'}
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase">Dövlət Qeydiyyatı:</span>
                    <span className="font-mono font-bold text-white text-sm">{activeCert.plateNumber}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase">Konteyner Nömrəsi:</span>
                    <span className="font-mono font-bold text-white text-sm">{activeCert.containerNumber}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase">Elektron Plomb ID:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{activeCert.sealSerial}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase">Batareya Enerjisi:</span>
                    <span className="font-mono font-bold text-white text-sm">{activeCert.batteryHealthPercent}%</span>
                  </div>
                </div>

                {/* Corridor & Checkpoints Details */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-300">
                    Təsdiqlənmiş Magistral Tranzit Dəhlizi: {TRANSIT_CORRIDORS[activeCert.corridor].nameAz} (
                    {activeCert.distanceKm} km)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                    <div>
                      <span className="text-slate-500">Giriş Gömrük Postu:</span> {activeCert.entryCheckpoint}
                    </div>
                    <div>
                      <span className="text-slate-500">Çıxış Gömrük Postu:</span> {activeCert.exitCheckpoint}
                    </div>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-slate-500">Yük Kateqoriyası:</span> {activeCert.cargoCategory}
                  </div>
                </div>

                {/* Cryptographic Verification Box */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
                  <div>
                    <div className="text-[11px] text-slate-400">SİMA Rəqəmsal İmza UID:</div>
                    <div className="text-emerald-400 font-bold">{activeCert.simaDigitalUid}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Kriptoqrafik Xülasə: {activeCert.securityChecksumSha256}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg text-slate-900 text-center shrink-0">
                    <div className="w-16 h-16 border-2 border-slate-900 border-dashed flex items-center justify-center font-bold text-[9px]">
                      QR KOD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: UNIFIED PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Dövlət Gömrük Komitəsi Elektron Plomb Vahid Açıq Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    Azərbaycan ərazisindən keçən bütün aktiv və tamamlanmış GPS e-lock sertifikatlarının axtarışı
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRegistryFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      registryFilter === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Hamısı
                  </button>
                  <button
                    onClick={() => setRegistryFilter('CLEARED')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      registryFilter === 'CLEARED' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Bütöv
                  </button>
                  <button
                    onClick={() => setRegistryFilter('BREACH')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      registryFilter === 'BREACH' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Həyəcan / Pozuntu
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Qeydiyyat nişanı, sertifikat №, konteyner və ya plomb nömrəsi ilə axtar..."
                  value={registrySearch}
                  onChange={(e) => setRegistrySearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Registry Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                      <tr>
                        <th className="p-3">Sertifikat №</th>
                        <th className="p-3">Dövlət Qeydiyyatı</th>
                        <th className="p-3">Konteyner</th>
                        <th className="p-3">Plomb Seriyası</th>
                        <th className="p-3">Dəhliz</th>
                        <th className="p-3">Batareya</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredRegistry.map((cert) => (
                        <tr key={cert.certificateNumber} className="hover:bg-slate-900/50">
                          <td className="p-3 font-mono font-bold text-emerald-400">{cert.certificateNumber}</td>
                          <td className="p-3 font-mono font-semibold text-white">{cert.plateNumber}</td>
                          <td className="p-3 font-mono text-slate-300">{cert.containerNumber}</td>
                          <td className="p-3 font-mono text-slate-400">{cert.sealSerial}</td>
                          <td className="p-3 text-slate-400 truncate max-w-[180px]">
                            {TRANSIT_CORRIDORS[cert.corridor]?.nameAz}
                          </td>
                          <td className="p-3 font-mono text-slate-300">{cert.batteryHealthPercent}%</td>
                          <td className="p-3">
                            {cert.isClearedForExit ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                                Bütöv (Keçid İcazəsi)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-300 border border-red-500/30">
                                Təhlükə / Saxlama
                              </span>
                            )}
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
      </div>
    </div>
  );
};
