import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Gauge,
  Sliders,
  Car,
  Volume2,
  Compass,
  ArrowRight,
  Radio,
  Zap,
  Info,
  Clock,
  Award,
  Lock,
  Flame,
  Truck,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin,
} from 'lucide-react';
import {
  Currency,
  CushionGoreZone,
  CushionVehiclePreset,
  CushionCertificate,
  convertCushionSafeCurrency,
  CUSHION_SAFE_CURRENCY_SYMBOLS,
  calculateCushionPhysics,
  generateCushionCertificateNumber,
  generateSimaDigitalUid,
  generateQrVerificationPin,
  generateSha256Checksum,
} from '../utils/cushionSafeCompliance';
import {
  MOCK_CUSHION_GORE_ZONES,
  MOCK_CUSHION_VEHICLE_PRESETS,
  MOCK_CUSHION_CHECKLIST,
  MOCK_CUSHION_EXAM_QUESTIONS,
  MOCK_CUSHION_CERTIFICATES,
} from '../data/mockCushionSafeData';

export interface CushionSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type TabType =
  | 'radar'
  | 'simulator'
  | 'sanctions'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const CushionSafeModal: React.FC<CushionSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);
  const [selectedZone, setSelectedZone] = useState<CushionGoreZone>(MOCK_CUSHION_GORE_ZONES[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<CushionVehiclePreset>(MOCK_CUSHION_VEHICLE_PRESETS[0]);

  // Simulator inputs
  const [impactSpeedKmh, setImpactSpeedKmh] = useState<number>(selectedVehicle.defaultSpeedKmh);
  const [impactAngleDeg, setImpactAngleDeg] = useState<number>(selectedVehicle.defaultAngleDeg);
  const [vehicleMassKg, setVehicleMassKg] = useState<number>(selectedVehicle.massKg);
  const [cushionBaysRemaining, setCushionBaysRemaining] = useState<number>(selectedZone.totalBays);
  const [ambientTempC, setAmbientTempC] = useState<number>(22);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>(() =>
    MOCK_CUSHION_CHECKLIST.map((item) => item.id)
  );

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate state
  const [generatedCert, setGeneratedCert] = useState<CushionCertificate>(MOCK_CUSHION_CERTIFICATES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Public Registry
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryRecords, setRegistryRecords] = useState<CushionCertificate[]>(MOCK_CUSHION_CERTIFICATES);

  // Web Audio chime state
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);

  // Handle zone selection
  const handleSelectZone = (zone: CushionGoreZone) => {
    setSelectedZone(zone);
    setCushionBaysRemaining(zone.totalBays);
  };

  // Handle vehicle selection
  const handleSelectVehicle = (veh: CushionVehiclePreset) => {
    setSelectedVehicle(veh);
    setImpactSpeedKmh(veh.defaultSpeedKmh);
    setImpactAngleDeg(veh.defaultAngleDeg);
    setVehicleMassKg(veh.massKg);
  };

  // Physics calculation
  const calculationResult = useMemo(() => {
    return calculateCushionPhysics({
      impactSpeedKmh,
      impactAngleDeg,
      vehicleMassKg,
      cushionBaysRemaining,
      ambientTempC,
    });
  }, [impactSpeedKmh, impactAngleDeg, vehicleMassKg, cushionBaysRemaining, ambientTempC]);

  // Audio warning sound synthesizer
  const playScadaAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = calculationResult.sensorTriggered ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(calculationResult.sensorTriggered ? 780 : 540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      setAudioPlayed(true);
      setTimeout(() => setAudioPlayed(false), 800);
    } catch {
      // Audio playback fallback
    }
  };

  // Toggle checklist item
  const handleToggleChecklist = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleVerifyAllChecklist = () => {
    setCheckedItems(MOCK_CUSHION_CHECKLIST.map((item) => item.id));
  };

  const handleResetChecklist = () => {
    setCheckedItems([]);
  };

  // Exam actions
  const handleAnswerQuestion = (qId: string, optIdx: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleExamSubmit = () => {
    setExamSubmitted(true);
  };

  const handleExamReset = () => {
    setExamAnswers({});
    setExamSubmitted(false);
  };

  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_CUSHION_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  }, [examAnswers]);

  // Generate certificate
  const handleGenerateCertificate = () => {
    const certNum = generateCushionCertificateNumber();
    const simaUid = generateSimaDigitalUid();
    const pin = generateQrVerificationPin();
    const hash = generateSha256Checksum(`${certNum}-${selectedVehicle.plate}-${selectedZone.code}`);

    const newCert: CushionCertificate = {
      id: `cert-cs-${Date.now()}`,
      certificateNumber: certNum,
      vehiclePlate: selectedVehicle.plate,
      vehicleModel: selectedVehicle.model,
      zoneCode: selectedZone.code,
      containmentLevel: `EN 1317-3 ${selectedZone.speedRatingKmh}R`,
      asiScore: calculationResult.asiScore,
      impactSpeedKmh,
      kineticEnergyKj: calculationResult.kineticEnergyKj,
      restitutionCostAzn: calculationResult.restitutionCostAzn,
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: calculationResult.bottomingOutRiskPct > 60 ? 'DEFICIT_PENDING' : 'ACTIVE_CERTIFIED',
      simaDigitalUid: simaUid,
      qrVerificationPin: pin,
      sha256Hash: hash,
    };

    setGeneratedCert(newCert);
    setRegistryRecords((prev) => [newCert, ...prev]);
    setActiveTab('certificate');
  };

  // Copy certificate number
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${generatedCert.certificateNumber} | SİMA: ${generatedCert.simaDigitalUid} | SHA-256: ${generatedCert.sha256Hash}`
      );
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Print voucher
  const handlePrintCertificate = () => {
    window.print();
  };

  // Filtered registry
  const filteredRegistry = useMemo(() => {
    if (!registrySearch.trim()) return registryRecords;
    const q = registrySearch.toLowerCase();
    return registryRecords.filter(
      (r) =>
        r.certificateNumber.toLowerCase().includes(q) ||
        r.vehiclePlate.toLowerCase().includes(q) ||
        r.vehicleModel.toLowerCase().includes(q) ||
        r.zoneCode.toLowerCase().includes(q)
    );
  }, [registrySearch, registryRecords]);

  if (!isOpen) return null;

  const currSymbol = CUSHION_SAFE_CURRENCY_SYMBOLS[selectedCurrency];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Cushion Safe Modal"
    >
      <div className="relative w-full max-w-6xl my-8 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/30 text-amber-300 rounded border border-amber-500/40">
                  AAYDA • AYNA • BDYP
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                  EN 1317-3:2010
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  CUSHION-SAFE-AZ-2026
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-wide mt-1">
                Magistral Qəza Sönümləyici Yastıqlar və Zərbə Amortizatorları Portalı
              </h2>
              <p className="text-xs text-slate-400">
                Gore Point Haçalanması, Körpü Dayaqları Qorunması, Kinetik Enerji Udma SCADA Telemetriyası və İXM 353 / MM 1108
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency switcher */}
            <div className="flex bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCurrency(c)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedCurrency === c
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'radar', label: '1. Haçalanma Radarı (Gore Zones)', icon: MapPin },
            { id: 'simulator', label: '2. SCADA Zərbə Stendi', icon: Activity },
            { id: 'sanctions', label: '3. Nəqliyyat & İXM Məsuliyyəti', icon: Car },
            { id: 'checklist', label: '4. EN 1317-3 Çeklist', icon: ShieldCheck },
            { id: 'exam', label: '5. İmtahan Simulyatoru', icon: Award },
            { id: 'certificate', label: '6. Rəsmi Sertifikat', icon: FileText },
            { id: 'registry', label: '7. İctimai Reyestr', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-130px)] space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Azərbaycan Magistral Şəbəkəsində 6 Strateji Qəza Sönümləyici Yastıq Stansiyası
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Haçalanma (gore points) zonaları, körpü pilonları və estakada beton dirəklərinin EN 1317-3 qoruma nöqtələri
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  SCADA IoT Sensor Şəbəkəsi Aktivdir
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_CUSHION_GORE_ZONES.map((zone) => {
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <div
                      key={zone.id}
                      onClick={() => handleSelectZone(zone)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-900/20'
                          : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-amber-400 rounded border border-slate-700">
                          {zone.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            zone.sensorStatus === 'OK_INTACT'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {zone.sensorStatus === 'OK_INTACT' ? 'TAM QORUNUR' : 'DİQQƏT'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-2 leading-snug">
                        {zone.nameAz}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{zone.corridor}</p>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Piket:</span>
                          <span className="font-mono text-slate-300 font-semibold">{zone.picketKm}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">EN 1317-3 Sinfi:</span>
                          <span className="font-semibold text-amber-400">{zone.speedRatingKmh} km/h (R)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Hücrə Sayı:</span>
                          <span className="text-slate-300">{zone.totalBays} kartric ({zone.systemLengthM} m)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Qorunan Obyekt:</span>
                          <span className="text-slate-300 truncate block">{zone.protectedStructureAz}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/40">
                        <span>Quraşdırılma: {zone.installedYear}</span>
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          Seçildi <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Zone Quick Specs */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Seçilmiş Qəza Yastığı Nöqtəsi:</div>
                    <div className="text-base font-bold text-white">
                      {selectedZone.nameAz} ({selectedZone.code})
                    </div>
                    <div className="text-xs text-amber-400/90 mt-0.5">
                      Qorunan mühəndis strukturu: {selectedZone.protectedStructureAz}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('simulator')}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Sliders className="w-4 h-4" />
                  SCADA Zərbə Stendinə Keç
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Telemetry Alert Bar */}
              <div
                className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                  calculationResult.status === 'STRUCTURAL_OVERLOAD'
                    ? 'bg-red-950/40 border-red-500/60 text-red-200'
                    : calculationResult.status === 'CONTROLLED_REDESIGN'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      calculationResult.status === 'STRUCTURAL_OVERLOAD'
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : calculationResult.status === 'CONTROLLED_REDESIGN'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    }`}
                  >
                    {calculationResult.status === 'STRUCTURAL_OVERLOAD' ? (
                      <Flame className="w-6 h-6 animate-bounce" />
                    ) : calculationResult.status === 'CONTROLLED_REDESIGN' ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <CheckCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      SCADA Telemetriya Vəziyyəti: {calculationResult.status}
                    </div>
                    <div className="text-sm font-black text-white mt-0.5">
                      {calculationResult.status === 'STRUCTURAL_OVERLOAD'
                        ? 'TƏHLÜKƏ: Həddindən artıq kinetik enerji! Yastığın sıxılma ehtiyatı tükənir, beton dirək zədələnə bilər!'
                        : calculationResult.status === 'CONTROLLED_REDESIGN'
                        ? 'NƏZARƏTDƏ OLAN YÖNƏLTMƏ: Bucaqlı zərbə zamanı avtomobil təhlükəsiz zolağa qaytarılır.'
                        : 'TƏHLÜKƏSİZ ENERJİ UDULMASI: EN 1317-3 standartı üzrə insan həyatı və körpü pilonu tam qorunur.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={playScadaAlertChime}
                  className="px-3.5 py-2 bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-xs font-semibold rounded-lg flex items-center gap-2 text-slate-300 hover:text-white transition-all"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  {audioPlayed ? 'Siqnal Səslənir...' : 'SCADA Siqnal Testi'}
                </button>
              </div>

              {/* 2D Animated SVG Motorway Gore Bifurcation */}
              <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden">
                <div className="text-xs font-bold text-slate-400 mb-2 flex items-center justify-between">
                  <span>2D Haçalanma və Qəza Sönümləyici Zərbə Dinamikası</span>
                  <span className="font-mono text-amber-400">
                    {selectedZone.code} • {selectedZone.nameAz}
                  </span>
                </div>

                <svg viewBox="0 0 900 240" className="w-full h-56 bg-slate-950 rounded-lg select-none">
                  <defs>
                    <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="cushionGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ca8a04" />
                    </linearGradient>
                    <pattern id="chevronPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M0 20 L10 0 L20 20 Z" fill="#eab308" />
                      <path d="M10 20 L20 0 L30 20 Z" fill="#0f172a" />
                    </pattern>
                  </defs>

                  {/* Main Road & Split Ramp Lanes */}
                  {/* Left Lane: Continuing Highway */}
                  <path d="M 0 50 L 500 50 L 900 20" stroke="#475569" strokeWidth="2" fill="none" />
                  <path d="M 0 110 L 500 110 L 900 80" stroke="#64748b" strokeWidth="2" strokeDasharray="10 10" fill="none" />

                  {/* Right Lane: Exit Ramp */}
                  <path d="M 0 190 L 500 190 L 900 220" stroke="#475569" strokeWidth="2" fill="none" />
                  <path d="M 0 130 L 500 130 L 900 160" stroke="#64748b" strokeWidth="2" strokeDasharray="10 10" fill="none" />

                  {/* Gore Area (Haçalanma Bufer Zonası) Hatching */}
                  <polygon points="500,110 500,130 900,160 900,80" fill="rgba(245, 158, 11, 0.08)" />
                  <line x1="530" y1="108" x2="560" y2="132" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="580" y1="104" x2="620" y2="136" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="640" y1="99" x2="690" y2="141" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="710" y1="94" x2="770" y2="146" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="790" y1="89" x2="860" y2="151" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />

                  {/* Concrete Bridge Pier at Gore Tail */}
                  <rect x="760" y="100" width="130" height="40" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                  <text x="825" y="125" fill="#f8fafc" fontSize="10" textAnchor="middle" fontWeight="bold">
                    KÖRPÜ DAYAĞI
                  </text>

                  {/* Transition Guide Rails */}
                  <line x1="720" y1="105" x2="760" y2="105" stroke="#94a3b8" strokeWidth="5" />
                  <line x1="720" y1="135" x2="760" y2="135" stroke="#94a3b8" strokeWidth="5" />

                  {/* Crash Cushion Multi-Bay System */}
                  {/* Each bay dynamically rendered with compression */}
                  {Array.from({ length: selectedZone.totalBays }).map((_, idx) => {
                    const bayWidth = (140 / selectedZone.totalBays) * (1 - (calculationResult.compressionDeflectionPct / 100) * 0.5);
                    const bayX = 580 + idx * bayWidth;
                    return (
                      <g key={idx}>
                        <rect
                          x={bayX}
                          y="105"
                          width={bayWidth - 2}
                          height="30"
                          rx="2"
                          fill="url(#cushionGrad)"
                          stroke="#78350f"
                          strokeWidth="1.5"
                        />
                        <line x1={bayX + bayWidth / 2} y1="105" x2={bayX + bayWidth / 2} y2="135" stroke="#000" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                      </g>
                    );
                  })}

                  {/* High Intensity Retroreflective Nose Cap */}
                  <polygon
                    points="575,103 575,137 560,120"
                    fill="#eab308"
                    stroke="#000"
                    strokeWidth="2"
                  />
                  <line x1="565" y1="110" x2="573" y2="118" stroke="#000" strokeWidth="2" />
                  <line x1="565" y1="130" x2="573" y2="122" stroke="#000" strokeWidth="2" />

                  {/* Vehicle approaching or impacting */}
                  <g transform={`translate(${Math.max(50, 520 - (impactSpeedKmh * 1.5))}, 100) rotate(${impactAngleDeg})`}>
                    <rect x="0" y="5" width="48" height="30" rx="5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" />
                    <rect x="30" y="8" width="12" height="24" rx="2" fill="#1e293b" />
                    <circle cx="8" cy="4" r="3" fill="#64748b" />
                    <circle cx="8" cy="36" r="3" fill="#64748b" />
                    <circle cx="38" cy="4" r="3" fill="#64748b" />
                    <circle cx="38" cy="36" r="3" fill="#64748b" />
                    <text x="24" y="23" fill="#ffffff" fontSize="8" textAnchor="middle" fontWeight="bold">
                      {selectedVehicle.plate}
                    </text>
                  </g>

                  {/* Impact vector line */}
                  <line x1="380" y1="120" x2="555" y2="120" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Telemetry HUD Labels */}
                  <text x="30" y="25" fill="#94a3b8" fontSize="10">
                    Əsas Yol (Düz) ⮞
                  </text>
                  <text x="30" y="225" fill="#94a3b8" fontSize="10">
                    Çıxış Rampası ⮞
                  </text>
                  <text x="560" y="90" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">
                    EN 1317-3 Qəza Yastığı ({calculationResult.compressionDeflectionPct}% sıxılma)
                  </text>
                </svg>
              </div>

              {/* Sliders Stand */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-950/70 border border-slate-800 rounded-xl p-5">
                {/* Speed Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" />
                      Toqquşma Sürəti:
                    </span>
                    <span className="font-mono font-bold text-amber-400">{impactSpeedKmh} km/saat</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="140"
                    step="1"
                    value={impactSpeedKmh}
                    onChange={(e) => setImpactSpeedKmh(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>40 km/h</span>
                    <span>110 km/h (Maks Normativ)</span>
                    <span>140 km/h</span>
                  </div>
                </div>

                {/* Impact Angle Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      Toqquşma Bucağı:
                    </span>
                    <span className="font-mono font-bold text-amber-400">{impactAngleDeg}° ({impactAngleDeg === 0 ? 'Ön Düz' : 'Bucaqlı'})</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={impactAngleDeg}
                    onChange={(e) => setImpactAngleDeg(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0° (Head-on)</span>
                    <span>15° (Redirective)</span>
                    <span>25°</span>
                  </div>
                </div>

                {/* Vehicle Mass Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      Avtomobil Çəkisi:
                    </span>
                    <span className="font-mono font-bold text-amber-400">{vehicleMassKg} kq</span>
                  </div>
                  <input
                    type="range"
                    min="900"
                    max="4500"
                    step="50"
                    value={vehicleMassKg}
                    onChange={(e) => setVehicleMassKg(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>900 kq</span>
                    <span>2000 kq</span>
                    <span>4500 kq</span>
                  </div>
                </div>

                {/* Remaining Bays Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Mövcud Teleskopik Hücrə Sayı:
                    </span>
                    <span className="font-mono font-bold text-amber-400">{cushionBaysRemaining} kartric</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={cushionBaysRemaining}
                    onChange={(e) => setCushionBaysRemaining(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 bay (0.9m)</span>
                    <span>4 bays (3.6m)</span>
                    <span>6 bays (5.4m)</span>
                  </div>
                </div>

                {/* Ambient Temperature Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Ətraf Mühit Temperaturu:
                    </span>
                    <span className="font-mono font-bold text-amber-400">{ambientTempC}°C</span>
                  </div>
                  <input
                    type="range"
                    min="-15"
                    max="45"
                    step="1"
                    value={ambientTempC}
                    onChange={(e) => setAmbientTempC(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-15°C Şaxta</span>
                    <span>+20°C Mülayim</span>
                    <span>+45°C İsti</span>
                  </div>
                </div>

                {/* Generate Cert Quick Action */}
                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateCertificate}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    Bu Toqquşmaya Rəsmi Akt / Sertifikat Tərtib Et
                  </button>
                </div>
              </div>

              {/* Dynamic Telemetry Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Kinetic Energy */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Kinetik Enerji ($E_k$):
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {calculationResult.kineticEnergyKj} <span className="text-xs font-normal text-slate-400">kJ</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    0.5 · m · v² düsturu üzrə
                  </p>
                </div>

                {/* ASI Index */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    ASI İntensivlik İndeksi:
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 flex items-baseline gap-2">
                    <span
                      className={
                        calculationResult.asiScore <= 1.0
                          ? 'text-emerald-400'
                          : calculationResult.asiScore <= 1.4
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }
                    >
                      {calculationResult.asiScore}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ({calculationResult.asiClass})
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    EN 1317-3 həddi: ≤ 1.4 (Sinif B)
                  </p>
                </div>

                {/* THIV */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    THIV Baş Zərbə Sürəti:
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 flex items-baseline gap-2">
                    <span className={calculationResult.thivCompliant ? 'text-emerald-400' : 'text-red-400'}>
                      {calculationResult.thivKmh}
                    </span>
                    <span className="text-xs font-normal text-slate-400">km/saat</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Normativ: ≤ 33.0 km/saat ({calculationResult.thivCompliant ? 'Uyğundur' : 'Pozulur'})
                  </p>
                </div>

                {/* Pier Protection */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Körpü Pilonunun Qorunması:
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                    {calculationResult.pierProtectionScorePct}%
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Bottoming out riski: {calculationResult.bottomingOutRiskPct}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SANCTIONS */}
          {activeTab === 'sanctions' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    Azərbaycan Nömrəli Nəqliyyat Preseti və Qanunvericilik Sanksiyaları
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    İXM Maddə 327.2 (haçalanma buferi), Maddə 328.2 (sürət), Maddə 353.1 (yol mebelinə zərər) və Mülki Məcəllə 1108
                  </p>
                </div>
                <div className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  İXM 38 üzrə 30 günə 50% Güzəşt
                </div>
              </div>

              {/* Vehicle Preset Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_CUSHION_VEHICLE_PRESETS.map((veh) => {
                  const isSelected = selectedVehicle.id === veh.id;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => handleSelectVehicle(veh)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-900/20'
                          : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="px-2.5 py-1 text-xs font-mono font-black bg-white text-slate-950 rounded border border-slate-300 shadow-sm">
                          {veh.plate}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {veh.massKg} kq
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-2.5">{veh.model}</h4>

                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Sürət:</span>
                          <span className="font-mono text-slate-300 font-bold">{veh.defaultSpeedKmh} km/h</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Bucaq:</span>
                          <span className="font-mono text-amber-400 font-bold">{veh.defaultAngleDeg}°</span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/40">
                        <span className="text-[10px] text-amber-400">
                          {veh.violationType === 'NONE'
                            ? 'Qanuni Hərəkət'
                            : veh.violationType === 'GORE_INTRUSION'
                            ? 'İXM 327.2 Haçalanma Pozuntusu'
                            : veh.violationType === 'EXCESS_SPEED'
                            ? 'İXM 328.2 Sürət Aşma'
                            : 'İXM 353.1 Tam Zərbə Qəzası'}
                        </span>
                        <span className="text-amber-400 font-medium">Tətbiq Et</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sanctions & Civil Restitution Breakdown Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Maliyyə və Hüquqi Məsuliyyət Hesabatı ({selectedVehicle.plate})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Administrative Fine */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 block">İXM İnzibati Cəriməsi:</span>
                    <div className="text-xl font-black text-white font-mono">
                      {currSymbol} {convertCushionSafeCurrency(calculationResult.fineAzn, selectedCurrency)}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium">
                      50% güzəştlə: {currSymbol} {convertCushionSafeCurrency(calculationResult.discountedFineAzn, selectedCurrency)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Cərimə balı: +{calculationResult.demeritPoints} bal
                    </div>
                  </div>

                  {/* Restitution Cost under Civil Code 1108 */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 block">AAYDA Bərpa Ziyanı (MM 1108):</span>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      {currSymbol} {convertCushionSafeCurrency(calculationResult.restitutionCostAzn, selectedCurrency)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Teleskopik kartriclər, shear pins və montaj
                    </div>
                    <div className="text-[10px] text-amber-400/90 mt-1">
                      Kasko və ya İcbari Sığorta təminatlı
                    </div>
                  </div>

                  {/* Total Liability */}
                  <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-1">
                    <span className="text-xs text-amber-300 font-semibold block">Cəmi Ödəniləcək Öhdəlik:</span>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {currSymbol} {convertCushionSafeCurrency(calculationResult.totalLiabilityAzn, selectedCurrency)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      50% güzəştli cərimə + AAYDA bərpa xərcləri
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    10-Bəndlik Texniki & SCADA Təhlükəsizlik Çeklisti
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    EN 1317-3, AZS 410, ETAG 001 və AAYDA İstismar Qaydalarına uyğunluq meyarları
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyAllChecklist}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                  <button
                    type="button"
                    onClick={handleResetChecklist}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_CUSHION_CHECKLIST.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isChecked
                          ? 'bg-slate-900 border-emerald-500/60 shadow-sm'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 p-1 rounded-md border ${
                              isChecked
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-slate-800 border-slate-700 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                              {item.standard}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                              {item.titleAz}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {item.detailsAz}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Qəza Sönümləyici Yastıqlar və Haçalanma Qaydaları Üzrə 10 Suallıq İmtahan
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    EN 1317-3, AR Yol Hərəkəti Qanunu Maddə 14/60 və İXM Maddə 327.2 / 353 üzrə nəzəri qiymətləndirmə
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {examSubmitted ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        Nəticə: {examScore} / {MOCK_CUSHION_EXAM_QUESTIONS.length}
                      </span>
                      <button
                        type="button"
                        onClick={handleExamReset}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Yenidən Başla
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleExamSubmit}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                    >
                      İmtahanı Təsdiqlə
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {MOCK_CUSHION_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedOpt = examAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white">
                          <span className="text-amber-400 font-mono mr-2">{idx + 1}.</span>
                          {q.questionAz}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                          {q.legalArticle}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let btnStyle = 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800';

                          if (examSubmitted) {
                            if (optIdx === q.correctIndex) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-red-950/60 border-red-500 text-red-200';
                            } else {
                              btnStyle = 'bg-slate-900 border-slate-800 text-slate-500';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswerQuestion(q.id, optIdx)}
                              className={`p-3 text-left text-xs rounded-xl border transition-all ${btnStyle}`}
                            >
                              <span className="font-mono text-slate-400 mr-2">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed border ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                              : 'bg-red-950/40 border-red-500/40 text-red-300'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5 mb-1">
                            {isCorrect ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            {isCorrect ? 'Düzgün Cavab!' : 'Səhv Cavab!'}
                          </div>
                          {q.explanationAz}
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
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Rəsmi Elektron Sönümləyici Zərbə & Təhlükəsizlik Aktı (Voucher)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    SİMA Rəqəmsal İmza, SHA-256 Kriptoqrafik Heş və AAYDA vahid reyestr qeydiyyatı
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Çap Et
                  </button>
                </div>
              </div>

              {/* Printable Voucher Paper */}
              <div className="bg-slate-950 border-2 border-amber-500/50 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                {/* Background Watermark */}
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none select-none">
                  <ShieldCheck className="w-96 h-96 text-amber-500" />
                </div>

                {/* Voucher Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-400">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                        AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ
                      </span>
                      <h3 className="text-xl font-black text-white tracking-wide mt-0.5">
                        RƏSMİ QƏZA SÖNÜMLƏYİCİ VƏ ZƏRBƏ AKT-SERTİFİKATI
                      </h3>
                      <p className="text-xs text-slate-400">
                        EN 1317-3:2010 / AR Yol Hərəkəti Qanunu Maddə 14 / İXM Maddə 353.1
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Sertifikat Nömrəsi:</div>
                    <div className="font-mono text-base font-black text-amber-400">
                      {generatedCert.certificateNumber}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      Status: {generatedCert.status}
                    </div>
                  </div>
                </div>

                {/* Voucher Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Nəqliyyat Vasitəsi:</span>
                    <span className="font-bold text-white text-sm">{generatedCert.vehicleModel}</span>
                    <span className="font-mono text-amber-400 block mt-0.5 font-bold">
                      {generatedCert.vehiclePlate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Haçalanma Nöqtəsi:</span>
                    <span className="font-bold text-white text-sm">{generatedCert.zoneCode}</span>
                    <span className="text-slate-400 block mt-0.5 truncate">{selectedZone.nameAz}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">EN 1317-3 Sinfi:</span>
                    <span className="font-bold text-amber-400 text-sm">{generatedCert.containmentLevel}</span>
                    <span className="text-slate-400 block mt-0.5">ASI: {generatedCert.asiScore}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Bərpa Ziyanı (MM 1108):</span>
                    <span className="font-bold text-emerald-400 text-sm font-mono">
                      {currSymbol} {convertCushionSafeCurrency(generatedCert.restitutionCostAzn, selectedCurrency)}
                    </span>
                    <span className="text-slate-400 block mt-0.5">AAYDA Yol Fondu</span>
                  </div>
                </div>

                {/* Signatures & Security Footer */}
                <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[10px]">SİMA Rəqəmsal İmza UID:</span>
                    <span className="font-mono text-slate-300 font-bold block">{generatedCert.simaDigitalUid}</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Təsdiqlənmiş Elektron Sənəd
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[10px]">QR Yoxlama PİN-Kodu:</span>
                    <span className="font-mono text-amber-400 font-black text-sm">{generatedCert.qrVerificationPin}</span>
                    <span className="text-slate-500 block text-[10px]">AAYDA Portalında autentifikasiya üçün</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block text-[10px]">SHA-256 Heş Kodu:</span>
                    <span className="font-mono text-[10px] text-slate-400 break-all block">
                      {generatedCert.sha256Hash}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    Vahid İctimai Qəza Sönümləyici Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Azərbaycan magistral yollarında qeydə alınmış bütün zərbə sönümləyici aktlarının axtarışı
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Nömrə, sertifikat və ya zona axtar..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredRegistry.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-amber-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-sm">
                            {cert.certificateNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              cert.status === 'ACTIVE_CERTIFIED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {cert.status}
                          </span>
                        </div>
                        <div className="text-xs text-white font-semibold mt-1">
                          {cert.vehicleModel} ({cert.vehiclePlate}) • {cert.zoneCode}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          SİMA: {cert.simaDigitalUid} • SHA-256: {cert.sha256Hash.substring(0, 20)}...
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">Təmir Bərpa:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {currSymbol} {convertCushionSafeCurrency(cert.restitutionCostAzn, selectedCurrency)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">Verilmə Tarixi:</span>
                        <span className="font-mono text-slate-300">{cert.issueDate}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedCert(cert);
                          setActiveTab('certificate');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition-colors"
                      >
                        Bax
                      </button>
                    </div>
                  </div>
                ))}

                {filteredRegistry.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Sorğu üzrə heç bir sertifikat tapılmadı.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>EN 1317-3 H2/H4b & MASH Sertifikatlı Şəbəkə • AAYDA İntellektual Qəza İdarəetmə Sistemi</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
