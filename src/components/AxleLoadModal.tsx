import React, { useState, useMemo } from 'react';
import {
  Scale,
  Truck,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  X,
  FileText,
  Printer,
  Copy,
  RotateCcw,
  Search,
  Activity,
  Info,
  Sliders,
  CheckSquare,
  Square,
  Award,
  AlertOctagon,
  Radio,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  AxleType,
  VehicleConfigType,
  Currency,
  CURRENCY_RATES,
  AXLE_LIMIT_SPECS,
  VEHICLE_CONFIG_SPECS,
  AxleLoadCalculation,
  OfficialWimCertificate,
  calculateAxleLoadCompliance,
  evaluateAxleChecklist,
  evaluateAxleExam,
  generateWimCertificate,
} from '../utils/axleLoadCompliance';
import {
  MOCK_WIM_STATIONS,
  MOCK_HEAVY_PRESETS,
  MOCK_AXLE_CHECKLIST,
  MOCK_AXLE_EXAM_QUESTIONS,
  MOCK_VERIFIED_WIM_RECORDS,
  WimStation,
  HeavyHaulagePreset,
} from '../data/mockAxleLoadData';

export interface AxleLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency?: Currency;
}

export type ModalTab =
  | 'calculator'
  | 'radar'
  | 'bridge'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const AxleLoadModal: React.FC<AxleLoadModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency: initialCurrency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('calculator');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialCurrency);
  const [selectedConfig, setSelectedConfig] = useState<VehicleConfigType>('ARTICULATED_5_AXLE');

  // Axle weights state (in kg)
  const [axleWeights, setAxleWeights] = useState<number[]>([7100, 10800, 7100, 7100, 7100]);
  const [airSuspensionAxles, setAirSuspensionAxles] = useState<boolean[]>([false, true, true, true, true]);
  const [vehiclePlate, setVehiclePlate] = useState<string>(vehicle?.plateNumber || '99-ZZ-990');
  const [transitDistanceKm, setTransitDistanceKm] = useState<number>(180);
  const [vehicleSpeedKmh, setVehicleSpeedKmh] = useState<number>(75);
  const [selectedStation, setSelectedStation] = useState<WimStation>(MOCK_WIM_STATIONS[0]);
  const [bridgeSpanMeters, setBridgeSpanMeters] = useState<number>(45);

  // Radar search
  const [stationSearch, setStationSearch] = useState<string>('');
  const [selectedHighwayFilter, setSelectedHighwayFilter] = useState<string>('ALL');

  // Checklist state
  const [checklistItems, setChecklistItems] = useState(MOCK_AXLE_CHECKLIST);

  // Exam state
  const [userExamAnswers, setUserExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [activeCertificate, setActiveCertificate] = useState<OfficialWimCertificate | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Registry search
  const [registrySearch, setRegistrySearch] = useState<string>('');

  if (!isOpen) return null;

  // Sync axle weights when vehicle config changes
  const handleConfigChange = (newConfig: VehicleConfigType) => {
    setSelectedConfig(newConfig);
    const spec = VEHICLE_CONFIG_SPECS[newConfig];
    const defaultWeightPerAxle = Math.round(spec.maxGrossWeightKg / spec.totalAxles);

    const newWeights: number[] = [];
    const newAir: boolean[] = [];
    for (let i = 0; i < spec.totalAxles; i++) {
      if (i === 0) {
        newWeights.push(Math.min(7500, defaultWeightPerAxle));
        newAir.push(false);
      } else {
        newWeights.push(defaultWeightPerAxle);
        newAir.push(true);
      }
    }
    setAxleWeights(newWeights);
    setAirSuspensionAxles(newAir);
  };

  // Apply preset
  const handleApplyPreset = (preset: HeavyHaulagePreset) => {
    setSelectedConfig(preset.vehicleConfig);
    setAxleWeights([...preset.axleWeights]);
    setAirSuspensionAxles([...preset.airSuspensionAxles]);
    setVehiclePlate(preset.vehiclePlate);
    setTransitDistanceKm(preset.transitDistanceKm);
    setVehicleSpeedKmh(preset.speedKmh);
  };

  // Update specific axle weight
  const handleAxleWeightChange = (index: number, valueKg: number) => {
    const updated = [...axleWeights];
    updated[index] = Math.max(1000, Math.min(25000, valueKg));
    setAxleWeights(updated);
  };

  // Toggle air suspension on specific axle
  const handleToggleAirSuspension = (index: number) => {
    const updated = [...airSuspensionAxles];
    updated[index] = !updated[index];
    setAirSuspensionAxles(updated);
  };

  // Calculate live compliance
  const calculation: AxleLoadCalculation = useMemo(() => {
    return calculateAxleLoadCompliance({
      vehicleConfig: selectedConfig,
      axleWeights,
      airSuspensionAxles,
      transitDistanceKm,
      speedKmh: vehicleSpeedKmh,
      spanLengthM: bridgeSpanMeters,
      bridgeNameAz: selectedStation.bridgeNameAz,
      currency: selectedCurrency,
    });
  }, [
    selectedConfig,
    axleWeights,
    airSuspensionAxles,
    transitDistanceKm,
    vehicleSpeedKmh,
    bridgeSpanMeters,
    selectedStation,
    selectedCurrency,
  ]);

  // Checklist evaluation
  const checklistAudit = useMemo(() => {
    return evaluateAxleChecklist(checklistItems);
  }, [checklistItems]);

  const handleToggleChecklist = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item => (item.id === id ? { ...item, isChecked: !item.isChecked } : item))
    );
  };

  const handleSelectAllChecklist = (checked: boolean) => {
    setChecklistItems(prev => prev.map(item => ({ ...item, isChecked: checked })));
  };

  // Exam evaluation
  const examEvaluation = useMemo(() => {
    const questionsWithAnswers = MOCK_AXLE_EXAM_QUESTIONS.map(q => ({
      id: q.id,
      selectedAnswerIndex: userExamAnswers[q.id] !== undefined ? userExamAnswers[q.id] : null,
      correctAnswerIndex: q.correctAnswerIndex,
    }));
    return evaluateAxleExam(questionsWithAnswers);
  }, [userExamAnswers]);

  const handleSelectExamAnswer = (questionId: string, answerIndex: number) => {
    if (isExamSubmitted) return;
    setUserExamAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleResetExam = () => {
    setUserExamAnswers({});
    setIsExamSubmitted(false);
  };

  // Generate certificate
  const handleIssueCertificate = () => {
    const cert = generateWimCertificate({
      stationId: selectedStation.id,
      stationNameAz: selectedStation.nameAz,
      highwayCode: selectedStation.highway,
      vehiclePlate,
      calculation,
    });
    setActiveCertificate(cert);
    setActiveTab('certificate');
  };

  const handleCopyCertificate = () => {
    if (!activeCertificate) return;
    const text = `AYNA & BDYP RƏSMİ WIM ÇƏKİ SERTİFİKATI
Sertifikat №: ${activeCertificate.certificateId}
Nəqliyyat Nömrəsi: ${activeCertificate.vehiclePlate}
Stansiya: ${activeCertificate.stationNameAz}
Ümumi Çəki: ${(activeCertificate.measuredGrossWeightKg / 1000).toFixed(1)} ton (Limit: ${(activeCertificate.legalMaxGrossWeightKg / 1000).toFixed(1)} ton)
Uyğunluq Statusu: ${activeCertificate.complianceRating}
SİMA Rəqəmsal İmza UID: ${activeCertificate.simaDigitalUid}
Doğrulama: ${activeCertificate.qrPayload}`;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // Filtered radar stations
  const filteredStations = useMemo(() => {
    return MOCK_WIM_STATIONS.filter(s => {
      const matchesSearch =
        s.nameAz.toLowerCase().includes(stationSearch.toLowerCase()) ||
        s.locationAz.toLowerCase().includes(stationSearch.toLowerCase()) ||
        s.highway.toLowerCase().includes(stationSearch.toLowerCase());
      const matchesHighway =
        selectedHighwayFilter === 'ALL' || s.highway === selectedHighwayFilter;
      return matchesSearch && matchesHighway;
    });
  }, [stationSearch, selectedHighwayFilter]);

  // Filtered registry records
  const filteredRegistryRecords = useMemo(() => {
    return MOCK_VERIFIED_WIM_RECORDS.filter(r => {
      const q = registrySearch.toLowerCase();
      return (
        r.vehiclePlate.toLowerCase().includes(q) ||
        r.certificateId.toLowerCase().includes(q) ||
        r.stationNameAz.toLowerCase().includes(q) ||
        r.simaDigitalUid.toLowerCase().includes(q)
      );
    });
  }, [registrySearch]);

  const currencySymbol = calculation.currencySymbol;

  return (
    <div
      data-testid="axle-load-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  AYNA & BDYP Avtomatik Dinamik Tərəzi (WIM) & Ox Yükü Nəzarət Portalı
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  WIM-AZ-2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                RİNN, AYNA, BDYP & AAYDA Dövlət Tərəzi Nəzarəti, Dördüncü Qüvvə Qanunu (ESAL) & Körpü Dinamika Sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCurrency(c)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    selectedCurrency === c
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              data-testid="axle-modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800 bg-slate-900/60 overflow-x-auto text-xs sm:text-sm">
          {[
            { id: 'calculator', label: 'Tərəzi & Ox Hesablayıcı', icon: Scale },
            { id: 'radar', label: 'WIM Stansiyaları Radarı', icon: Radio },
            { id: 'bridge', label: 'Körpü Dinamika Telemetriyası', icon: Activity },
            { id: 'checklist', label: 'Təhlükəsizlik Çeklisti', icon: CheckSquare },
            { id: 'exam', label: 'AYNA/BDYP İmtahanı', icon: Award },
            { id: 'certificate', label: 'WIM Sertifikatı & QR', icon: FileText },
            { id: 'registry', label: 'İctimai Reyestr', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`axle-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as ModalTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-400" />
                    Hazır Yük Nəqliyyat Nümunələri (Presets)
                  </span>
                  <span className="text-xs text-slate-400">
                    Azərbaycan magistrallarında hərəkət edən real avtoqatarlar
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {MOCK_HEAVY_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="text-left p-2.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-amber-500/50 transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-amber-400">{preset.vehiclePlate}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            preset.isCompliant
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {preset.isCompliant ? 'Uyğundur' : 'Aşırı Yüklü'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 mt-1 line-clamp-1">{preset.nameAz}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{preset.cargoDescriptionAz}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Configuration Form & Live Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 5 Cols: Config Parameters */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      Avtonəqliyyat Kateqoriyası & Parametrlər
                    </h3>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Konfiqurasiya Modeli (NK 104 nömrəli Qərar)
                      </label>
                      <select
                        value={selectedConfig}
                        onChange={e => handleConfigChange(e.target.value as VehicleConfigType)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500"
                      >
                        {Object.values(VEHICLE_CONFIG_SPECS).map(spec => (
                          <option key={spec.id} value={spec.id}>
                            {spec.nameAz} ({spec.totalAxles} Ox, Max {(spec.maxGrossWeightKg / 1000).toFixed(0)}t)
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {VEHICLE_CONFIG_SPECS[selectedConfig].typicalUseAz}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Dövlət Nömrə Nişanı
                        </label>
                        <input
                          type="text"
                          value={vehiclePlate}
                          onChange={e => setVehiclePlate(e.target.value)}
                          placeholder="99-ZZ-990"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-amber-400 uppercase tracking-wider focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Tranzit Məsafəsi (km)
                        </label>
                        <input
                          type="number"
                          value={transitDistanceKm}
                          onChange={e => setTransitDistanceKm(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          WIM Keçid Sürəti ({vehicleSpeedKmh} km/saat)
                        </label>
                        <input
                          type="range"
                          min={20}
                          max={110}
                          value={vehicleSpeedKmh}
                          onChange={e => setVehicleSpeedKmh(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Körpü Aşırımı ({bridgeSpanMeters} metr)
                        </label>
                        <input
                          type="range"
                          min={15}
                          max={90}
                          value={bridgeSpanMeters}
                          onChange={e => setBridgeSpanMeters(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Dinamik WIM Nəzarət Məntəqəsi
                      </label>
                      <select
                        value={selectedStation.id}
                        onChange={e => {
                          const found = MOCK_WIM_STATIONS.find(s => s.id === e.target.value);
                          if (found) setSelectedStation(found);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500"
                      >
                        {MOCK_WIM_STATIONS.map(st => (
                          <option key={st.id} value={st.id}>
                            {st.nameAz} ({st.highway}, km {st.kilometerMark})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Ümumi Kütlə (Ölçülən):</span>
                      <span className="text-sm font-bold text-white">
                        {(calculation.totalMeasuredGrossWeightKg / 1000).toFixed(2)} ton
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Qanuni Maksimal Hədd:</span>
                      <span className="text-sm font-semibold text-slate-300">
                        {(calculation.legalMaxGrossWeightKg / 1000).toFixed(2)} ton
                      </span>
                    </div>

                    {calculation.isGrossOverweight ? (
                      <div className="flex items-center justify-between text-rose-400 text-xs font-bold">
                        <span>Aşma Həcmi:</span>
                        <span>
                          +{(calculation.excessGrossWeightKg / 1000).toFixed(2)} ton (+{calculation.grossOverloadPercentage}%)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                        <span>Qanuni Ehtiyat Həcmi:</span>
                        <span>
                          {((calculation.legalMaxGrossWeightKg - calculation.totalMeasuredGrossWeightKg) / 1000).toFixed(2)} ton
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-700/60 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">İXM Maddə 322 Cəriməsi:</span>
                        <span
                          className={`text-sm font-bold ${
                            calculation.administrativeFineAzn > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {calculation.administrativeFineConverted} {currencySymbol}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">Yol Dağılma Kompensasiyası:</span>
                        <span
                          className={`text-sm font-bold ${
                            calculation.roadDamageCompensationAzn > 0 ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {calculation.roadDamageCompensationConverted} {currencySymbol}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">Dördüncü Qüvvə Qanunu (ESAL):</span>
                        <span className="text-xs font-mono font-semibold text-sky-400">
                          {calculation.totalEsalPavementDamage} ESAL
                        </span>
                      </div>
                    </div>

                    {calculation.isVehicleImpounded && (
                      <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-600/60 flex items-start gap-2">
                        <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div className="text-[11px] text-rose-300">
                          <strong>MƏCBURİ DAYANDIRILMA TƏDBİRİ:</strong> Aşma 25%-dən çox olduğuna görə avtomobil cərimə meydançasına göndərilir və yük boşaldılana qədər hərəkəti qadağan edilir.
                        </div>
                      </div>
                    )}

                    <button
                      data-testid="generate-cert-btn"
                      onClick={handleIssueCertificate}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-xs tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Rəsmi WIM Sertifikatı & QR Kod Yarat
                    </button>
                  </div>
                </div>

                {/* Right 7 Cols: Interactive Axle by Axle Telemetry */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-bold text-white">Oxlar Üzrə Dinamik Telemetriya & Tənzimləmə</h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {axleWeights.length} Ədəd Ox Qrupu
                      </span>
                    </div>

                    {/* Axle list */}
                    <div className="space-y-3">
                      {calculation.axleDetails.map((axle, idx) => {
                        const isOver = axle.isOverweight;
                        const percentage = Math.min(100, Math.round((axle.measuredWeightKg / axle.legalLimitKg) * 100));

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border transition ${
                              isOver
                                ? 'bg-rose-950/20 border-rose-500/50'
                                : 'bg-slate-900/60 border-slate-700/80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
                                  {axle.axleIndex}
                                </span>
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    {AXLE_LIMIT_SPECS[axle.axleType].nameAz}
                                    {axle.hasAirSuspension && (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                        Hava Asqısı (+1t)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Qanuni Normativ Hədd: {(axle.legalLimitKg / 1000).toFixed(1)} ton
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={axle.hasAirSuspension}
                                    onChange={() => handleToggleAirSuspension(idx)}
                                    className="accent-sky-500 rounded"
                                  />
                                  <span>Pnevmo</span>
                                </label>
                                <div className="text-right">
                                  <div
                                    className={`text-xs font-bold ${
                                      isOver ? 'text-rose-400' : 'text-emerald-400'
                                    }`}
                                  >
                                    {(axle.measuredWeightKg / 1000).toFixed(2)} ton
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400">
                                    {axle.wearFactorEsal} ESAL
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Weight Slider */}
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={3000}
                                max={18000}
                                step={100}
                                value={axle.measuredWeightKg}
                                onChange={e => handleAxleWeightChange(idx, Number(e.target.value))}
                                className={`w-full ${isOver ? 'accent-rose-500' : 'accent-amber-500'}`}
                              />
                            </div>

                            {/* Load progress bar */}
                            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isOver ? 'bg-rose-500' : percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              />
                            </div>

                            {isOver && (
                              <div className="mt-1 text-[11px] text-rose-400 flex items-center justify-between">
                                <span>Aşırı Yük Normativi:</span>
                                <span className="font-bold">
                                  +{(axle.excessWeightKg / 1000).toFixed(2)} ton (+{axle.overloadPercentage}%)
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={stationSearch}
                    onChange={e => setStationSearch(e.target.value)}
                    placeholder="WIM stansiyası və ya magistral axtar..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  {['ALL', 'M1', 'M2', 'M3', 'M4', 'ZY-1'].map(hw => (
                    <button
                      key={hw}
                      onClick={() => setSelectedHighwayFilter(hw)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedHighwayFilter === hw
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {hw === 'ALL' ? 'Bütün Magistrallar' : hw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map(station => {
                  const isCurrent = selectedStation.id === station.id;
                  return (
                    <div
                      key={station.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {station.code}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Aktiv Şlüz
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{station.nameAz}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            {station.locationAz}
                          </p>
                        </div>

                        <div className="bg-slate-900/60 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Sensor Texnologiyası:</span>
                            <span className="text-slate-200 font-medium text-right line-clamp-1">
                              {station.sensorTechnologyAz.split('+')[0]}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Dəqiqlik Standartı:</span>
                            <span className="text-amber-400 font-mono">{station.accuracyClass.split(' ')[0]}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Gündəlik Yük Axını:</span>
                            <span className="text-slate-200 font-semibold">{station.dailyTruckFlow} TIR/gün</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Aşma Aşkarlama Payı:</span>
                            <span className="text-rose-400 font-bold">{station.overloadDetectionRatePercent}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Körpü Aşırımı:</span>
                            <span className="text-sky-400 font-semibold">{station.bridgeSpanMeters} metr</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedStation(station);
                          setBridgeSpanMeters(station.bridgeSpanMeters);
                          setActiveTab('calculator');
                        }}
                        className="mt-4 w-full py-1.5 px-3 rounded-lg bg-slate-700/60 hover:bg-amber-600 hover:text-white text-slate-300 text-xs font-semibold transition text-center"
                      >
                        Bu Stansiyanı Seç & Hesabla
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BRIDGE TELEMETRY */}
          {activeTab === 'bridge' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-sky-400" />
                      Körpü və Aşırımların Dinamik Yük və Əyilmə (Deflection) Telemetriyası
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      SNiP 2.05.03-84 & Eurocode EN 1991-2 Avtomobil Körpülərinin Dinamik Təhlili
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      calculation.bridgeTelemetry.structuralLoadRating === 'SAFE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : calculation.bridgeTelemetry.structuralLoadRating === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    Körpü Rejimi: {calculation.bridgeTelemetry.structuralLoadRating}
                  </span>
                </div>

                {/* Telemetry Visual Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
                    <span className="text-xs text-slate-400">Ölçülən Dinamik Əyilmə</span>
                    <div className="text-2xl font-bold text-white mt-1">
                      {calculation.bridgeTelemetry.midSpanDeflectionMm} mm
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Maks. İcazə: {calculation.bridgeTelemetry.allowableDeflectionMm} mm (L/800)
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
                    <span className="text-xs text-slate-400">Dinamik Güclənmə (DAF)</span>
                    <div className="text-2xl font-bold text-sky-400 mt-1">
                      {calculation.bridgeTelemetry.dynamicAmplificationFactor}x
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Sürət təsiri əmsalı ({vehicleSpeedKmh} km/s)
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
                    <span className="text-xs text-slate-400">Məxsusi Rəqs Tezliyi</span>
                    <div className="text-2xl font-bold text-amber-400 mt-1">
                      {calculation.bridgeTelemetry.vibrationFrequencyHz} Hz
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Dempferlənmə: {(calculation.bridgeTelemetry.dampingRatio * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
                    <span className="text-xs text-slate-400">Körpü Aşırımı</span>
                    <div className="text-2xl font-bold text-purple-400 mt-1">
                      {bridgeSpanMeters} metr
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {selectedStation.bridgeNameAz}
                    </span>
                  </div>
                </div>

                {/* Deflection Visual Scale */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Aşırım Elastik Əyilmə Skalası:</span>
                    <span className="font-mono text-slate-400">
                      {calculation.bridgeTelemetry.midSpanDeflectionMm} mm / {calculation.bridgeTelemetry.allowableDeflectionMm} mm
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-700 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        calculation.bridgeTelemetry.structuralLoadRating === 'SAFE'
                          ? 'bg-emerald-500'
                          : calculation.bridgeTelemetry.structuralLoadRating === 'WARNING'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (calculation.bridgeTelemetry.midSpanDeflectionMm /
                            calculation.bridgeTelemetry.allowableDeflectionMm) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                    10 Maddəlik Ağır Tonajlı Nəqliyyat Təhlükəsizlik Çeklisti
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Nazirlər Kabinetinin 104 nömrəli Qərarı & AAYDA Normativləri
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectAllChecklist(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-xs font-medium text-slate-200"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={() => handleSelectAllChecklist(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-xs font-medium text-slate-200"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Score bar */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Uyğunluq Nəticəsi:</span>
                    <span className="font-bold text-amber-400">{checklistAudit.scorePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        checklistAudit.isEligibleForCertificate ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${checklistAudit.scorePercentage}%` }}
                    />
                  </div>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap ${
                    checklistAudit.isEligibleForCertificate
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {checklistAudit.isEligibleForCertificate ? 'Sertifikata Uyğundur' : 'Kritik Maddələr Qalıb'}
                </span>
              </div>

              {/* Checklist items */}
              <div className="space-y-2.5">
                {checklistItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      item.isChecked
                        ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item.isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          {item.titleAz}
                          {item.isCritical && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Kritik
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {item.categoryAz}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{item.descriptionAz}</p>
                      <p className="text-[11px] text-slate-500 italic">{item.legalReferenceAz}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    AYNA & BDYP Çəki və Ox İntizamı Nəzəri İmtahanı (10 Sual)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Minimum keçid balı: 70% (7 sual)
                  </p>
                </div>

                {isExamSubmitted && (
                  <button
                    onClick={handleResetExam}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Yenidən Sına
                  </button>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_AXLE_EXAM_QUESTIONS.map((q, idx) => {
                  const selected = userExamAnswers[q.id];
                  const isAnswered = selected !== undefined;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                          {q.questionAz}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.optionsAz.map((option, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          let btnStyle = 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800';

                          if (isExamSubmitted) {
                            if (optIdx === q.correctAnswerIndex) {
                              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-300';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isExamSubmitted}
                              onClick={() => handleSelectExamAnswer(q.id, optIdx)}
                              className={`p-2.5 rounded-lg border text-left text-xs transition ${btnStyle}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                          <p className="text-slate-300 leading-relaxed">{q.explanationAz}</p>
                          <p className="text-amber-400/90 font-medium italic">{q.legalCitationAz}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isExamSubmitted ? (
                <button
                  onClick={() => setIsExamSubmitted(true)}
                  disabled={Object.keys(userExamAnswers).length < MOCK_AXLE_EXAM_QUESTIONS.length}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-white font-bold text-xs tracking-wider shadow-lg transition"
                >
                  Cavabları Təsdiqlə & Nəticəni Hesabla
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">İmtahan Nəticəniz</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {examEvaluation.correctAnswers} / {examEvaluation.totalQuestions} Düzgün Cavab ({examEvaluation.scorePercentage}%)
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      examEvaluation.isPassed
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {examEvaluation.isPassed ? 'Uğurla Keçdi (Sertifikat İcazəlidir)' : 'Keçmədi'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {activeCertificate ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  {/* Watermark badge */}
                  <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                    <Scale className="w-48 h-48 text-amber-500" />
                  </div>

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                        <Scale className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          RƏSMİ WIM AVTOMATİK ÇƏKİ & OX YÜKÜ SERTİFİKATI
                        </h3>
                        <p className="text-xs text-slate-400">
                          Azərbaycan Yerüstü Nəqliyyat Agentliyi (AYNA) & Baş Dövlət Yol Polisi İdarəsi (BDYP)
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400 block">
                        {activeCertificate.certificateId}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Tarix: {activeCertificate.issueDate} / Bitmə: {activeCertificate.validUntil}
                      </span>
                    </div>
                  </div>

                  {/* Details Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400">Nəqliyyat Qeydiyyatı:</span>
                      <p className="text-sm font-bold text-amber-400 mt-0.5">{activeCertificate.vehiclePlate}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Ölçülən Ümumi Kütlə:</span>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {(activeCertificate.measuredGrossWeightKg / 1000).toFixed(2)} ton
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Qanuni Normativ Hədd:</span>
                      <p className="text-sm font-semibold text-slate-300 mt-0.5">
                        {(activeCertificate.legalMaxGrossWeightKg / 1000).toFixed(2)} ton
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Uyğunluq Statusu:</span>
                      <p
                        className={`text-sm font-bold mt-0.5 ${
                          activeCertificate.complianceRating === 'COMPLIANT'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {activeCertificate.complianceRating}
                      </p>
                    </div>
                  </div>

                  {/* Secondary Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Dinamik WIM Postu:</span>
                      <p className="text-slate-200 font-semibold mt-1">{activeCertificate.stationNameAz}</p>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Dördüncü Qüvvə Təsiri:</span>
                      <p className="text-sky-400 font-mono font-semibold mt-1">
                        {activeCertificate.esalPavementDamage} ESAL
                      </p>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">Körpü Əyilməsi:</span>
                      <p className="text-purple-400 font-semibold mt-1">
                        {activeCertificate.bridgeDeflectionMm} mm
                      </p>
                    </div>
                  </div>

                  {/* Security Verification Footer */}
                  <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>SİMA Rəqəmsal İmza UID:</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {activeCertificate.simaDigitalUid}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        SHA-256 Checksum: {activeCertificate.sha256Checksum.substring(0, 32)}...
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        data-testid="copy-cert-btn"
                        onClick={handleCopyCertificate}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedCode ? 'Kopyalandı!' : 'Məlumatları Kopyala'}
                      </button>
                      <button
                        data-testid="print-cert-btn"
                        onClick={handlePrintCertificate}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Çap Et
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl space-y-4">
                  <Scale className="w-12 h-12 text-slate-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">Aktiv WIM Sertifikatı Mövcud Deyil</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Zəhmət olmasa, "Tərəzi & Ox Hesablayıcı" bölməsindən ox çəkilərini tənzimləyərək "Rəsmi WIM Sertifikatı & QR Kod Yarat" düyməsini sıxın.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                  >
                    Hesablayıcıya Keç
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={e => setRegistrySearch(e.target.value)}
                    placeholder="Qeydiyyat nömrəsi və ya sertifikat ID axtar..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {filteredRegistryRecords.length} Təsdiqlənmiş Qeyd
                </span>
              </div>

              {/* Records table */}
              <div className="overflow-x-auto border border-slate-700 rounded-xl bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-3">Sertifikat ID</th>
                      <th className="p-3">Nömrə</th>
                      <th className="p-3">WIM Stansiyası</th>
                      <th className="p-3">Ölçülən Çəki</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Cərimə / Kompensasiya</th>
                      <th className="p-3">Tarix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredRegistryRecords.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-semibold text-amber-400">{rec.certificateId}</td>
                        <td className="p-3 font-bold text-white">{rec.vehiclePlate}</td>
                        <td className="p-3">{rec.stationNameAz}</td>
                        <td className="p-3 font-medium">
                          {(rec.totalWeightKg / 1000).toFixed(1)} t / {(rec.legalLimitKg / 1000).toFixed(1)} t
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rec.complianceRating === 'COMPLIANT'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {rec.complianceRating}
                          </span>
                        </td>
                        <td className="p-3">
                          {rec.fineAzn > 0 ? (
                            <span className="text-rose-400 font-semibold">
                              {rec.fineAzn} ₼ + {rec.roadCompensationAzn} ₼
                            </span>
                          ) : (
                            <span className="text-emerald-400">0 ₼</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400">{rec.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
