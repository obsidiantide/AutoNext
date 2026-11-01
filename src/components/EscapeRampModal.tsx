import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
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
  Truck,
  Lock,
  RefreshCw,
  ArrowRight,
  Shield,
  Eye,
  Check,
  Thermometer,
  Anchor,
  Flame,
  Scale,
} from 'lucide-react';
import { Modal } from './Modal';
import { Currency } from '../types/vehicle';
import {
  EscapeRampAsset,
  EscapeVehicleProfile,
  EscapeRampSimulationInput,
  calculateEscapeRampPhysics,
  evaluateEscapeChecklist,
  scoreEscapeExam,
  generateEscapeRampCertificate,
  verifyEscapeCertificate,
  EscapeRampCertificate,
  ESCAPE_CURRENCY_RATES,
} from '../utils/escapeRampCompliance';
import {
  MOCK_ESCAPE_RAMP_ASSETS,
  MOCK_ESCAPE_VEHICLES,
  MOCK_ESCAPE_CHECKLIST,
  MOCK_ESCAPE_EXAM_QUESTIONS,
  MOCK_ESCAPE_CERTIFICATES,
} from '../data/mockEscapeRampData';

export type EscapeTabId =
  | 'ramps'
  | 'scada'
  | 'vehicles'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export interface EscapeRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

export const EscapeRampModal: React.FC<EscapeRampModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<EscapeTabId>('ramps');
  const [selectedRamp, setSelectedRamp] = useState<EscapeRampAsset>(MOCK_ESCAPE_RAMP_ASSETS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<EscapeVehicleProfile>(MOCK_ESCAPE_VEHICLES[0]);
  const [rampSearchQuery, setRampSearchQuery] = useState('');

  // SCADA Simulation State
  const [simEntrySpeedKmh, setSimEntrySpeedKmh] = useState<number>(selectedVehicle.typicalDescentSpeedKmh);
  const [simVehicleMassKg, setSimVehicleMassKg] = useState<number>(selectedVehicle.grossMassKg);
  const [simRampInclineDeg, setSimRampInclineDeg] = useState<number>(selectedRamp.rampInclineDeg);
  const [simBedFrictionCoeff, setSimBedFrictionCoeff] = useState<number>(selectedRamp.frictionCoeff);
  const [simBrakeTempC, setSimBrakeTempC] = useState<number>(420);
  const [simBedLengthM, setSimBedLengthM] = useState<number>(selectedRamp.rampLengthM);
  const [simHasCableNet, setSimHasCableNet] = useState<boolean>(selectedRamp.hasCableNetAttenuator);

  // Checklist State
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate & Registry State
  const [certificates, setCertificates] = useState<EscapeRampCertificate[]>(MOCK_ESCAPE_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<EscapeRampCertificate | null>(MOCK_ESCAPE_CERTIFICATES[0]);
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Filtered Ramps
  const filteredRamps = useMemo(() => {
    if (!rampSearchQuery.trim()) return MOCK_ESCAPE_RAMP_ASSETS;
    const q = rampSearchQuery.toLowerCase();
    return MOCK_ESCAPE_RAMP_ASSETS.filter(
      r =>
        r.nameAz.toLowerCase().includes(q) ||
        r.nameEn.toLowerCase().includes(q) ||
        r.route.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q)
    );
  }, [rampSearchQuery]);

  // Simulation Results
  const simInput: EscapeRampSimulationInput = useMemo(
    () => ({
      entrySpeedKmh: simEntrySpeedKmh,
      vehicleMassKg: simVehicleMassKg,
      rampInclineDeg: simRampInclineDeg,
      bedFrictionCoeff: simBedFrictionCoeff,
      brakeTempC: simBrakeTempC,
      bedLengthM: simBedLengthM,
      hasCableNetArrester: simHasCableNet,
    }),
    [
      simEntrySpeedKmh,
      simVehicleMassKg,
      simRampInclineDeg,
      simBedFrictionCoeff,
      simBrakeTempC,
      simBedLengthM,
      simHasCableNet,
    ]
  );

  const simResult = useMemo(
    () => calculateEscapeRampPhysics(simInput, currency),
    [simInput, currency]
  );

  // Checklist Evaluation
  const checklistEval = useMemo(
    () => evaluateEscapeChecklist(MOCK_ESCAPE_CHECKLIST, checklistState),
    [checklistState]
  );

  // Exam Evaluation
  const examEval = useMemo(
    () => scoreEscapeExam(MOCK_ESCAPE_EXAM_QUESTIONS, examAnswers),
    [examAnswers]
  );

  // Registry Search
  const searchResults = useMemo(() => {
    if (!registrySearchQuery.trim()) return certificates;
    const q = registrySearchQuery.toUpperCase().trim();
    return certificates.filter(
      c =>
        c.certificateId.toUpperCase().includes(q) ||
        c.vehiclePlate.toUpperCase().includes(q) ||
        c.rampName.toUpperCase().includes(q)
    );
  }, [registrySearchQuery, certificates]);

  const handleSelectRamp = (ramp: EscapeRampAsset) => {
    setSelectedRamp(ramp);
    setSimRampInclineDeg(ramp.rampInclineDeg);
    setSimBedFrictionCoeff(ramp.frictionCoeff);
    setSimBedLengthM(ramp.rampLengthM);
    setSimHasCableNet(ramp.hasCableNetAttenuator);
  };

  const handleSelectVehicle = (vehicle: EscapeVehicleProfile) => {
    setSelectedVehicle(vehicle);
    setSimVehicleMassKg(vehicle.grossMassKg);
    setSimEntrySpeedKmh(vehicle.typicalDescentSpeedKmh);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckAll = () => {
    const allChecked: Record<string, boolean> = {};
    MOCK_ESCAPE_CHECKLIST.forEach(item => {
      allChecked[item.id] = true;
    });
    setChecklistState(allChecked);
  };

  const handleSelectExamOption = (questionId: number, optionIndex: number) => {
    setExamAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleQuickFillExam = () => {
    const filled: Record<number, number> = {};
    MOCK_ESCAPE_EXAM_QUESTIONS.forEach(q => {
      filled[q.id] = q.correctOptionIndex;
    });
    setExamAnswers(filled);
  };

  const handleIssueCertificate = () => {
    const newCert = generateEscapeRampCertificate(
      selectedRamp,
      selectedVehicle,
      simInput,
      simResult
    );
    setCertificates(prev => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopyFeedback(`${label} kopyalandı!`);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AAYDA, FHN & BDYP Dağlıq Magistral Qəza Zolaqları, Qravitasiya Çınqıl Yatağı və Termal SCADA Portalı (ESCAPE-RAMP-AZ-2026)"
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white p-5 rounded-2xl shadow-lg border border-red-800/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600/30 rounded-xl border border-red-500/50 backdrop-blur-sm">
                <Truck className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/30 text-red-300 border border-red-500/40">
                    AAYDA • FHN • BDYP RƏSMİ DÖVLƏT SCADA
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ESCAPE-RAMP-AZ-2026
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight mt-1 text-slate-100">
                  Dağ Enişlərində Qəza Tormoz Zolaqları (EER) və Çınqıl Yatağı SCADA Monitorinqi
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ağsu dolamaları, Murovdağ, Lerik, Xınalıq və Zəfər yolunda əyləc aşırı qızması (Brake Fade) və qravitasiya sönümləməsi
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleIssueCertificate}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-md transition-all border border-amber-400/40"
              >
                <FileText className="w-4 h-4" />
                Elektron Talon Generasiyası
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-3 border-t border-slate-700/60">
            <button
              onClick={() => setActiveTab('ramps')}
              data-testid="tab-ramps"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ramps'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              6 Strateji Aşırım Radarı
            </button>
            <button
              onClick={() => setActiveTab('scada')}
              data-testid="tab-scada"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'scada'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              SCADA Çınqıl Yatağı & Dinamika
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              data-testid="tab-vehicles"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'vehicles'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Nəqliyyat Tipləri & Cərimələr
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              data-testid="tab-checklist"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'checklist'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              10-Bəndlik Təhlükəsizlik Reqlamenti
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              data-testid="tab-exam"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'exam'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Sürücü İmtahan Simulyatoru
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              data-testid="tab-certificate"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'certificate'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Rəsmi Elektron Talon (SİMA)
            </button>
            <button
              onClick={() => setActiveTab('registry')}
              data-testid="tab-registry"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'registry'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Vahid İctimai Reyestr
            </button>
          </div>
        </div>

        {/* Copy Feedback Alert */}
        {copyFeedback && (
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {copyFeedback}
          </div>
        )}

        {/* TAB 1: 6 STRATEGIC MOUNTAIN PASS RADAR */}
        {activeTab === 'ramps' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Aşırım və ya magistral axtar (məs. Ağsu, Murovdağ)..."
                  value={rampSearchQuery}
                  onChange={e => setRampSearchQuery(e.target.value)}
                  className="bg-slate-800/90 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-red-500 w-full sm:w-72"
                />
              </div>
              <span className="text-xs text-slate-400">
                Aktiv SCADA Stansiyaları: <strong className="text-red-400">{filteredRamps.length}</strong> / {MOCK_ESCAPE_RAMP_ASSETS.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRamps.map(ramp => {
                const isSelected = selectedRamp.id === ramp.id;
                return (
                  <div
                    key={ramp.id}
                    onClick={() => handleSelectRamp(ramp)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-red-500 shadow-md shadow-red-950/30 ring-1 ring-red-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {ramp.route}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 mt-2 line-clamp-1">{ramp.nameAz}</h3>
                        <p className="text-xs text-slate-400">{ramp.region}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400">SCADA CANLI</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Eniş Meyilliyi:</span>
                        <span className="font-bold text-red-400 text-sm">{ramp.descentGradePercent}%</span>
                      </div>
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Yataq Uzunluğu:</span>
                        <span className="font-bold text-amber-300 text-sm">{ramp.rampLengthM} metr</span>
                      </div>
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Yuxarı Meyillik:</span>
                        <span className="font-bold text-emerald-400 text-sm">+{ramp.rampInclineDeg}° Qravitasiya</span>
                      </div>
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Hündürlük:</span>
                        <span className="font-bold text-slate-200 text-sm">{ramp.elevationM} m</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                        <span>FLIR Termal: {ramp.flirCameraActive ? 'Aktiv (99.8%)' : 'Sönülü'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Anchor className="w-3 h-3 text-red-400" />
                        <span>50t Bucurqad</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Corridor Overview Card */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 mt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      SEÇİLMİŞ DAĞ ZOLAĞI
                    </span>
                    <h3 className="text-base font-bold text-white">{selectedRamp.nameAz}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Koordinat: {selectedRamp.coordinates} • Son Texniki Baxış: {selectedRamp.lastInspectionDate} • Yataq Tipi: {selectedRamp.bedMaterialType === 'pea_gravel' ? 'Yuvarlaq Çınqıl (Pea Gravel)' : 'Qırma Daş & Kabel Attenuator'}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('scada')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start md:self-auto"
                >
                  <Sliders className="w-4 h-4" />
                  SCADA Simulyasiyasına Keç
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCADA ARRESTER BED & PHYSICS */}
        {activeTab === 'scada' && (
          <div className="space-y-6">
            {/* Interactive Sliders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              {/* Left Column: Sliders */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-red-400" />
                  Giriş Telemetriyası və Yataq Parametrləri
                </h3>

                {/* Entry Speed Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Qəza Zolağına Giriş Sürəti ($v_0$):</span>
                    <span className="font-bold text-red-400">{simEntrySpeedKmh} km/saat ({simResult.entrySpeedMs} m/s)</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="160"
                    step="2"
                    value={simEntrySpeedKmh}
                    onChange={e => setSimEntrySpeedKmh(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>30 km/s (Nəzarətli)</span>
                    <span>90 km/s (Tipik Runaway)</span>
                    <span>160 km/s (Ekstremal)</span>
                  </div>
                </div>

                {/* Vehicle Mass Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Nəqliyyatın Ümumi Kütləsi ($m$):</span>
                    <span className="font-bold text-amber-300">{simVehicleMassKg.toLocaleString()} kq ({(simVehicleMassKg / 1000).toFixed(1)} ton)</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="44000"
                    step="500"
                    value={simVehicleMassKg}
                    onChange={e => setSimVehicleMassKg(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>2,000 kq (Mikroavtobus)</span>
                    <span>20,000 kq (Avtobus)</span>
                    <span>44,000 kq (Ağır TIR)</span>
                  </div>
                </div>

                {/* Ramp Incline Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Zolağın Yuxarı Qravitasiya Meyilliyi ($\theta$):</span>
                    <span className="font-bold text-emerald-400">+{simRampInclineDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="18"
                    step="0.5"
                    value={simRampInclineDeg}
                    onChange={e => setSimRampInclineDeg(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0° (Üfüqi Yataq)</span>
                    <span>9° (Ağsu Standartı)</span>
                    <span>18° (Dik Qravitasiya)</span>
                  </div>
                </div>

                {/* Bed Aggregate Friction Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Çınqıl Sürtünmə Əmsalı (&mu; yataq):</span>
                    <span className="font-bold text-cyan-400">{simBedFrictionCoeff.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.38"
                    step="0.01"
                    value={simBedFrictionCoeff}
                    onChange={e => setSimBedFrictionCoeff(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.15 (Qırma Daş)</span>
                    <span>0.28 (Yuvarlaq Çınqıl)</span>
                    <span>0.38 (Qalın Boş Torpaq)</span>
                  </div>
                </div>

                {/* Brake Rotor Temperature Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Girişdə Əyləc Diski Temperaturu:</span>
                    <span className={`font-bold ${simBrakeTempC >= 450 ? 'text-red-400' : 'text-amber-400'}`}>
                      {simBrakeTempC}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="750"
                    step="10"
                    value={simBrakeTempC}
                    onChange={e => setSimBrakeTempC(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>100°C (Normal)</span>
                    <span>420°C (Brake Fade)</span>
                    <span>750°C (Tam Ərimə/Alışma)</span>
                  </div>
                </div>

                {/* Toggle Cable Net Arrester */}
                <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <Anchor className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Kinetik Sönümləyici Kabel Toru (Drag Net):</span>
                      <p className="text-[10px] text-slate-400">Yataq sonunda qəza çıxışının qarşısını alan elastik polad tor</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={simHasCableNet}
                    onChange={e => setSimHasCableNet(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Column: Physics Calculation Output Cards */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Fiziki Hesablama və SCADA Qiymətləndirməsi
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Stopping Distance */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Tələb Olunan Tormoz Məsafəsi:</span>
                    <span className="text-lg font-black text-white">{simResult.stoppingDistanceM} metr</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Yataq: {simBedLengthM} m ({simResult.isWithinBedBounds ? 'Kifayətdir' : 'Çatışmır!'})
                    </span>
                  </div>

                  {/* Deceleration G-force */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Yavaşıma Qüvvəsi ($G$-Force):</span>
                    <span className="text-lg font-black text-amber-400">{simResult.decelerationG} G</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {simResult.decelerationMps2} m/s² sürətlənmə
                    </span>
                  </div>

                  {/* Wheel Sink Penetration */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Təkərin Çınqıla Batma Dərinliyi:</span>
                    <span className="text-lg font-black text-cyan-400">{simResult.penetrationDepthCm} sm</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {simResult.requiresHeavyRotatorWinch ? 'Rotator bucurqad tələb olunur' : 'Yüngül çıxarış'}
                    </span>
                  </div>

                  {/* Kinetic Energy */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Sönümlənən Kinetik Enerji ($E_k$):</span>
                    <span className="text-lg font-black text-rose-400">{simResult.kineticEnergyMj} MJ</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      ~{(simResult.kineticEnergyMj * 0.278).toFixed(1)} kVt·saat ekvivalent
                    </span>
                  </div>
                </div>

                {/* Total Brake Temperature & Status Gauge */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-semibold text-slate-200">
                        Əyləc Qızması (Brake Fade) Vəziyyəti:
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        simResult.brakeFadeStatus === 'NORMAL'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : simResult.brakeFadeStatus === 'ELEVATED'
                          ? 'bg-amber-500/20 text-amber-300'
                          : simResult.brakeFadeStatus === 'CRITICAL'
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-red-500/30 text-red-300 animate-pulse'
                      }`}
                    >
                      {simResult.brakeFadeStatus} ({simResult.totalBrakeTempC}°C)
                    </span>
                  </div>

                  {/* Progress bar for temperature */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        simResult.totalBrakeTempC < 300
                          ? 'bg-emerald-500'
                          : simResult.totalBrakeTempC < 450
                          ? 'bg-amber-500'
                          : simResult.totalBrakeTempC < 600
                          ? 'bg-orange-500'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(100, (simResult.totalBrakeTempC / 750) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Normal (&lt;280°C)</span>
                    <span>Qızma (280-420°C)</span>
                    <span>Kritik (420-550°C)</span>
                    <span>Fade (&gt;550°C)</span>
                  </div>
                </div>

                {/* Ramp Arrest Status Banner */}
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                    simResult.rampArrestStatus === 'SAFE_STOP'
                      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                      : simResult.rampArrestStatus === 'FULL_BED_USED'
                      ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
                      : simResult.rampArrestStatus === 'ARRESTER_NET_ENGAGED'
                      ? 'bg-orange-950/40 border-orange-800/50 text-orange-300'
                      : 'bg-red-950/50 border-red-800/60 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Dayanma Rejimi: {simResult.rampArrestStatus}</span>
                      <p className="text-[10px] opacity-80">
                        Qalıq yataq ehtiyatı: {simResult.bedLengthRemainingM} metr
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-black/30">
                    {simResult.isWithinBedBounds ? 'Təhlükəsiz' : 'Riskli'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual SVG Runaway Truck Escape Ramp Graphic */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-red-400" />
                  Qəza Zolağında Tormozlama və Çınqıl Yatağı Vizual Qrafikası
                </span>
                <span className="text-slate-400">
                  Giriş: {simEntrySpeedKmh} km/s • Yataq: {simBedLengthM}m • Dayanma: {simResult.stoppingDistanceM}m
                </span>
              </div>

              <div className="relative w-full h-36 bg-gradient-to-r from-slate-900 via-stone-900 to-amber-950 rounded-xl overflow-hidden border border-slate-800 flex items-end p-4">
                {/* Visual Gravel Pattern */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-stone-800/60 border-t-2 border-stone-600 flex items-center justify-around overflow-hidden">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full bg-stone-500/40 transform translate-y-1"
                    />
                  ))}
                </div>

                {/* Ramp Incline Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="20"
                    y1="110"
                    x2="95%"
                    y2={110 - simRampInclineDeg * 3.5}
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                </svg>

                {/* Animated Vehicle Representation */}
                <div
                  className="absolute transition-all duration-500 flex flex-col items-center"
                  style={{
                    left: `${Math.min(90, Math.max(8, (simResult.stoppingDistanceM / simBedLengthM) * 85))}%`,
                    bottom: `${Math.min(60, 24 + simRampInclineDeg * 1.8)}px`,
                  }}
                >
                  <div className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold shadow-lg mb-1 whitespace-nowrap">
                    {simResult.stoppingDistanceM}m ({simResult.decelerationG}G)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-red-500 text-red-400 shadow-xl">
                    <Truck className="w-6 h-6 animate-pulse" />
                  </div>
                  {/* Wheel Sink visual */}
                  <div
                    className="w-8 bg-amber-600/60 rounded-full mt-0.5"
                    style={{ height: `${Math.min(18, simResult.penetrationDepthCm * 0.4)}px` }}
                  />
                </div>

                {/* Cable Net representation at far right */}
                {simHasCableNet && (
                  <div className="absolute right-4 bottom-4 h-24 w-2 bg-gradient-to-t from-red-600 to-amber-500 rounded border border-white flex flex-col justify-around items-center">
                    <div className="w-4 h-1 bg-white rounded" />
                    <div className="w-4 h-1 bg-white rounded" />
                    <div className="w-4 h-1 bg-white rounded" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VEHICLES & RECOVERY TARIFF & FINES */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-red-400" />
                Azərbaycan Magistrallarında Tipik Nəqliyyat Preserləri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_ESCAPE_VEHICLES.map(vehicle => {
                  const isSelected = selectedVehicle.id === vehicle.id;
                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => handleSelectVehicle(vehicle)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-red-500 shadow-md ring-1 ring-red-500/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                            {vehicle.licensePlate}
                          </span>
                          <h4 className="text-xs font-bold text-slate-100 mt-2">{vehicle.name}</h4>
                        </div>
                        <Truck className="w-5 h-5 text-slate-400" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Ümumi Çəki:</span>
                          <span className="font-bold text-white">{(vehicle.grossMassKg / 1000).toFixed(1)} ton</span>
                        </div>
                        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Əyləc Növü:</span>
                          <span className="font-bold text-slate-300 text-[11px] truncate">{vehicle.brakeType}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Retarder/Jake: {vehicle.hasJakeBrakeRetarder ? 'Mövcuddur' : 'Yoxdur'}</span>
                        <span className="text-red-400 font-semibold">{vehicle.typicalDescentSpeedKmh} km/s</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial and Legal Liabilities Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
              {/* Statutory Fines under Azerbaijani Code of Administrative Offences */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-red-400" />
                  <h4 className="text-sm font-bold text-slate-100">
                    İnzibati Məsuliyyət və Cərimələr (İXM)
                  </h4>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Hesablanmış Cərimə:</span>
                    <span className="text-base font-bold text-red-400">
                      {simResult.statutoryFineAzN} AZN ({simResult.statutoryFineUsd} USD / {simResult.statutoryFineEur} EUR)
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-slate-400">30 Gün Ərzində 50% Endirimlə:</span>
                    <span className="text-base font-bold text-emerald-400">
                      {simResult.discountedFineAzN} AZN
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block font-semibold">Tətbiq Edilən Hüquqi Əsaslar:</span>
                  <ul className="space-y-1">
                    {simResult.complianceNotes.map((note, idx) => (
                      <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Rotator Heavy Winch Extraction Tariff (AAYDA / FHN) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-slate-100">
                    AAYDA / FHN Ağır Evakuasiya və Bucurqad Xidməti
                  </h4>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Rotator Bucurqad Tələbi:</span>
                    <span className={`font-bold ${simResult.requiresHeavyRotatorWinch ? 'text-amber-400' : 'text-slate-400'}`}>
                      {simResult.requiresHeavyRotatorWinch ? 'Zəruridir (Dərin batma)' : 'Tələb olunmur'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Xilasetmə & Çıxarış Haqqı:</span>
                    <span className="text-base font-bold text-amber-300">
                      {simResult.estimatedRecoveryCostAzN} AZN ({simResult.estimatedRecoveryCostUsd} USD / {simResult.estimatedRecoveryCostEur} EUR)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  * FHN və AAYDA dağ xilasetmə bölmələri çınqıl yatağında dərindən batmış təkərləri oxlara və şassiyə zərər yetirmədən çıxarmaq üçün xüsusi yerüstü ankerlərə bərkidilmiş hidravlik bucurqadlardan istifadə edir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 10-POINT TECHNICAL CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  10-Bəndlik Texniki Təhlükəsizlik və İnfrastruktur Reqlamenti
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AZS 410, AASHTO EER və EN 1317 standartlarına əsasən qəza zolağı və nəqliyyat sazlığı
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Tamamlanma:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {checklistEval.completedItems} / {checklistEval.totalItems} ({checklistEval.completionPercentage}%)
                  </span>
                </div>
                <button
                  onClick={handleCheckAll}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                >
                  Bütün Bəndləri Təsdiqlə
                </button>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              {MOCK_ESCAPE_CHECKLIST.map((item, index) => {
                const isChecked = !!checklistState[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-slate-900/90 border-emerald-500/50 text-slate-200'
                        : 'bg-slate-950/50 border-slate-800 hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 mt-0.5 accent-emerald-500 rounded cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-100">
                          {index + 1}. {item.titleAz}
                        </span>
                        {item.isMandatory && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 whitespace-nowrap">
                            MƏCBURİ
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.titleEn}</p>
                      <span className="text-[10px] text-slate-500 mt-1 inline-block">
                        Standart: {item.legalRef}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: 10-QUESTION EXAM SIMULATOR */}
        {activeTab === 'exam' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Dağ Enişləri və Qəza Zolaqlarından İstifadə İmtahanı (10 Sual)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  BDYP və AAYDA sürücü təlimatlandırması və tormoz sistemləri üzrə normativ test
                </p>
              </div>

              <div className="flex items-center gap-3">
                {examSubmitted && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Nəticə:</span>
                    <span
                      className={`text-sm font-bold ${
                        examEval.isPassed ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {examEval.correctAnswers} / {examEval.totalQuestions} ({examEval.scorePercentage}%) - {examEval.isPassed ? 'KEÇDİ' : 'KƏSİLDİ'}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleQuickFillExam}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                >
                  Sürətli Doldur (Demo)
                </button>
                <button
                  onClick={() => setExamSubmitted(true)}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-all shadow-md"
                >
                  İmtahanı Tamamla
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {MOCK_ESCAPE_EXAM_QUESTIONS.map(q => {
                const selectedOption = examAnswers[q.id];
                const isAnswered = selectedOption !== undefined;
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-amber-400">Sual {q.id}:</span>
                        <h4 className="text-xs font-bold text-slate-100 mt-0.5">{q.questionAz}</h4>
                        <p className="text-[11px] text-slate-400">{q.questionEn}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">{q.legalBasis}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.optionsAz.map((opt, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        let btnStyle = 'bg-slate-950/60 border-slate-800 hover:bg-slate-850 text-slate-300';
                        if (examSubmitted) {
                          if (optIdx === q.correctOptionIndex) {
                            btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                          } else if (isChosen && optIdx !== q.correctOptionIndex) {
                            btnStyle = 'bg-red-950/60 border-red-500 text-red-200';
                          }
                        } else if (isChosen) {
                          btnStyle = 'bg-slate-800 border-red-500 text-white ring-1 ring-red-500';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectExamOption(q.id, optIdx)}
                            className={`text-left p-3 rounded-lg border text-xs transition-all flex items-start gap-2 ${btnStyle}`}
                          >
                            <span className="font-bold text-[11px]">{String.fromCharCode(65 + optIdx)})</span>
                            <div>
                              <span>{opt}</span>
                              <span className="block text-[10px] text-slate-500 mt-0.5">{q.optionsEn[optIdx]}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {examSubmitted && (
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                        <strong className="text-amber-400 block mb-0.5">İzah:</strong>
                        {q.explanationAz}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: OFFICIAL ELECTRONIC CERTIFICATE GENERATOR */}
        {activeTab === 'certificate' && activeCertificate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Rəsmi Elektron Keçid və Təhlükəsizlik Talonu
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(activeCertificate.certificateId, 'Talon ID')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Kopyala
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-all shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Çap Et
                </button>
              </div>
            </div>

            {/* Printable Certificate Layout */}
            <div className="bg-slate-950 p-6 rounded-2xl border-2 border-red-800/60 shadow-xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
                    AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ (AAYDA) • FHN • BDYP
                  </span>
                  <h2 className="text-lg font-black text-white mt-1">
                    DAĞ AŞIRIMLARINDA QƏZA ZOLAĞI (EER) VƏ ƏYLƏC SAZLIĞI TALONU
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rəsmi Elektron Sertifikat Seriyası: <strong className="text-amber-400">{activeCertificate.certificateId}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    STATUS: {activeCertificate.complianceStatus}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-1">
                    Verilmə: {activeCertificate.issueDate} • Bitmə: {activeCertificate.expiryDate}
                  </span>
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Nəqliyyat Nömrəsi:</span>
                  <span className="font-bold text-amber-300 text-sm">{activeCertificate.vehiclePlate}</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Aşırım / Qəza Zolağı:</span>
                  <span className="font-bold text-white text-xs truncate block">{activeCertificate.rampName}</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Giriş Sürəti & Kütlə:</span>
                  <span className="font-bold text-red-400 text-sm">
                    {activeCertificate.entrySpeedKmh} km/s • {(activeCertificate.vehicleMassKg / 1000).toFixed(1)}t
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Tormoz Məsafəsi:</span>
                  <span className="font-bold text-emerald-400 text-sm">{activeCertificate.stoppingDistanceM} metr</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Əyləc Səth İstiliyi:</span>
                  <span className="font-bold text-white">{activeCertificate.brakeTempC}°C ({activeCertificate.brakeFadeStatus})</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Təxliyə PIN Kodu:</span>
                  <span className="font-bold text-cyan-400 text-sm tracking-widest">{activeCertificate.recoveryPin}</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Rotator Bucurqad:</span>
                  <span className="font-bold text-white">
                    {activeCertificate.requiresHeavyRotatorWinch ? 'Tələb Olunur (FHN 50t)' : 'Tələb Olunmur'}
                  </span>
                </div>
              </div>

              {/* SİMA Digital Signature Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">SİMA Rəqəmsal İmzası ilə Təsdiqlənib:</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 block">{activeCertificate.simaSignatureUid}</span>
                  <span className="font-mono text-[9px] text-slate-600 block truncate max-w-md">
                    SHA-256: {activeCertificate.sha256Checksum}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center">
                    {/* Simulated QR Code */}
                    <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className={`${i % 3 === 0 || i % 5 === 0 ? 'bg-black' : 'bg-transparent'} rounded-xs`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 max-w-xs">
                    Rəsmi QR kod ilə AAYDA və BDYP postlarında yoxlanıla bilər.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: UNIFIED PUBLIC REGISTRY */}
        {activeTab === 'registry' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Talon ID, Nəqliyyat dövlət nömrəsi və ya Aşırım adı ilə axtar..."
                  value={registrySearchQuery}
                  onChange={e => setRegistrySearchQuery(e.target.value)}
                  className="bg-slate-800/90 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-red-500 w-full sm:w-80"
                />
              </div>
              <span className="text-xs text-slate-400">
                Aktiv Qeydiyyat Qeydləri: <strong className="text-amber-400">{searchResults.length}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {searchResults.map(cert => (
                <div
                  key={cert.certificateId}
                  onClick={() => {
                    setActiveCertificate(cert);
                    setActiveTab('certificate');
                  }}
                  className="cursor-pointer p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {cert.certificateId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {cert.vehiclePlate}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {cert.complianceStatus}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 mt-1">{cert.rampName}</h4>
                    <p className="text-[11px] text-slate-400">
                      Giriş: {cert.entrySpeedKmh} km/s • Tormoz Məsafəsi: {cert.stoppingDistanceM} m • İstilik: {cert.brakeTempC}°C
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleCopyText(cert.certificateId, 'Talon ID');
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveCertificate(cert);
                        setActiveTab('certificate');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Bax
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
