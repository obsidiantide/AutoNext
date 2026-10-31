import React, { useState, useMemo } from 'react';
import {
  Bike,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Award,
  RefreshCw,
  X,
  Sliders,
  Gauge,
  Activity,
  Layers,
  Sparkles,
  Check,
  Clock,
  ArrowRight,
  Info,
  MapPin,
  ExternalLink,
  Zap,
  Battery,
  AlertCircle,
  Leaf,
  CreditCard,
  UserCheck,
  Compass,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  formatCurrency,
  GeofenceZoneType,
  GEOFENCE_ZONE_DEFINITIONS,
  MicromobilityVehicleCategory,
  MICROMOBILITY_VEHICLE_CONFIGS,
  CorridorId,
  STRATEGIC_CORRIDORS,
  TelemetryState,
  evaluateMicromobilityTelemetry,
  calculateMicromobilityTariff,
  MICROMOBILITY_SAFETY_CHECKLIST,
  evaluateMicromobilityChecklist,
  MICROMOBILITY_EXAM_QUESTIONS,
  evaluateMicromobilityExam,
  generateMicromobilityCertificate,
  MicromobilityCertificate,
} from '../utils/micromobilityCompliance';
import {
  INITIAL_CORRIDOR_TELEMETRY,
  MOCK_ACTIVE_FLEET_OPERATORS,
  MOCK_MICROMOBILITY_CERTIFICATES,
} from '../data/mockMicromobilityData';

interface MicromobilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type MicromobilityTabId =
  | 'corridors'
  | 'telemetry'
  | 'calculator'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const MicromobilityModal: React.FC<MicromobilityModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<MicromobilityTabId>('corridors');
  const [selectedCorridorId, setSelectedCorridorId] = useState<CorridorId>('boulevard_seaside');
  const [currency, setCurrency] = useState<Currency>('AZN');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<'all' | GeofenceZoneType>('all');

  // Telemetry simulation state
  const [telemetry, setTelemetry] = useState<TelemetryState>(
    INITIAL_CORRIDOR_TELEMETRY.boulevard_seaside
  );

  // Calculator inputs
  const [calcCategory, setCalcCategory] = useState<MicromobilityVehicleCategory>(
    'shared_fleet_scooter'
  );
  const [calcDurationMinutes, setCalcDurationMinutes] = useState(25);
  const [calcDistanceKm, setCalcDistanceKm] = useState(4.5);
  const [hasStudentDiscount, setHasStudentDiscount] = useState(false);
  const [hasBakuCardTransfer, setHasBakuCardTransfer] = useState(true);
  const [includeHelmetRental, setIncludeHelmetRental] = useState(false);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<string[]>(
    MICROMOBILITY_SAFETY_CHECKLIST.map((item) => item.id)
  );

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Certificate form & public registry state
  const [riderFullName, setRiderFullName] = useState(
    targetCar?.seller?.name || 'Tural Qasımov'
  );
  const [riderFin, setRiderFin] = useState('7XYZ99A');
  const [vehicleSerial, setVehicleSerial] = useState('WINGZ-BAKU-2026-904');
  const [operatorBrand, setOperatorBrand] = useState('Wingz Azerbaijan (Rəqəmsal Samokat)');
  const [certificates, setCertificates] = useState<MicromobilityCertificate[]>(
    MOCK_MICROMOBILITY_CERTIFICATES
  );
  const [activeCertificate, setActiveCertificate] = useState<MicromobilityCertificate>(
    MOCK_MICROMOBILITY_CERTIFICATES[0]
  );
  const [copiedCode, setCopiedCode] = useState(false);

  // Selected corridor helper
  const selectedCorridor = STRATEGIC_CORRIDORS[selectedCorridorId];

  // Telemetry evaluation
  const telemetryEval = useMemo(() => {
    return evaluateMicromobilityTelemetry(telemetry);
  }, [telemetry]);

  // Tariff calculation
  const tariffResult = useMemo(() => {
    return calculateMicromobilityTariff({
      category: calcCategory,
      corridorId: selectedCorridorId,
      durationMinutes: calcDurationMinutes,
      distanceKm: calcDistanceKm,
      hasStudentDiscount,
      hasBakuCardTransitTransfer: hasBakuCardTransfer,
      includeHelmetRental,
    });
  }, [
    calcCategory,
    selectedCorridorId,
    calcDurationMinutes,
    calcDistanceKm,
    hasStudentDiscount,
    hasBakuCardTransfer,
    includeHelmetRental,
  ]);

  // Checklist evaluation
  const checklistResult = useMemo(() => {
    return evaluateMicromobilityChecklist(checkedItems);
  }, [checkedItems]);

  // Exam evaluation
  const examResult = useMemo(() => {
    return evaluateMicromobilityExam(examAnswers);
  }, [examAnswers]);

  // Corridors filtered list
  const filteredCorridors = useMemo(() => {
    return Object.values(STRATEGIC_CORRIDORS).filter((c) => {
      const matchesSearch =
        c.nameAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.descriptionAz.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZone = zoneFilter === 'all' || c.primaryGeofence === zoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [searchQuery, zoneFilter]);

  // Handle corridor selection change
  const handleSelectCorridor = (id: CorridorId) => {
    setSelectedCorridorId(id);
    if (INITIAL_CORRIDOR_TELEMETRY[id]) {
      setTelemetry(INITIAL_CORRIDOR_TELEMETRY[id]);
    }
  };

  // Toggle checklist item
  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Check all checklist items
  const handleCheckAll = () => {
    setCheckedItems(MICROMOBILITY_SAFETY_CHECKLIST.map((item) => item.id));
  };

  // Answer exam question
  const handleAnswerExam = (qId: number, optionIdx: number) => {
    setExamAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  // Quick fill 100% exam answers
  const handleQuickFillExam = () => {
    const perfect: Record<number, number> = {};
    MICROMOBILITY_EXAM_QUESTIONS.forEach((q) => {
      perfect[q.id] = q.correctIndex;
    });
    setExamAnswers(perfect);
    setExamSubmitted(true);
  };

  // Generate new certificate
  const handleGenerateCertificate = () => {
    const newCert = generateMicromobilityCertificate({
      riderFullName,
      riderFin,
      vehicleCategory: calcCategory,
      vehicleSerialNumber: vehicleSerial,
      operatorBrand,
      helmetCertified: telemetry.helmetDetected,
      examScore: examResult.scorePercent || 100,
      checklistScore: checklistResult.scorePercent,
    });
    setCertificates((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  // Copy certificate number
  const handleCopyCertificateNumber = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Print simulation
  const handlePrint = () => {
    window.print?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      data-testid="micromobility-modal"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Bike className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  AYNA & BDYP Rəqəmsal Mikromobillik və Velosiped Zolaqları Portalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AYNA / BDYP / RİNN
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  MICROMOBILITY-BAKU-AZ-2026
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bakı Şəhəri Xüsusi Velozolaqlar Şəbəkəsi, Elektrosamokat Geofencing Sürət Məhdudiyyətləri & Təhlükəsizlik Telemetriyası
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="micromobility-modal-close-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto no-scrollbar px-3">
          {[
            { id: 'corridors', labelAz: 'Velozolaqlar & Şəbəkə', icon: Compass },
            { id: 'telemetry', labelAz: 'Telemetriya & Geofencing', icon: Activity },
            { id: 'calculator', labelAz: 'Tarif & Ekoloji Qənaət', icon: Leaf },
            { id: 'checklist', labelAz: 'Təhlükəsizlik Yoxlaması', icon: CheckCircle2 },
            { id: 'exam', labelAz: 'YHQ İmtahanı', icon: Award },
            { id: 'certificate', labelAz: 'Rəsmi Sertifikat', icon: ShieldCheck },
            { id: 'registry', labelAz: 'Dövlət Reyestri', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MicromobilityTabId)}
                data-testid={`micromobility-tab-${tab.id}`}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {tab.labelAz}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CORRIDORS */}
          {activeTab === 'corridors' && (
            <div className="space-y-6" data-testid="tab-corridors-content">
              {/* Quick Filter & Search Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Velozolaq, dəhliz və ya metro stansiyası üzrə axtarış..."
                    data-testid="corridor-search-input"
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'green', 'yellow', 'red', 'purple'] as const).map((z) => (
                    <button
                      key={z}
                      onClick={() => setZoneFilter(z)}
                      className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer capitalize ${
                        zoneFilter === z
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {z === 'all' ? 'Bütün Zonalar' : z}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corridor Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCorridors.map((c) => {
                  const isSelected = selectedCorridorId === c.id;
                  const zoneDef = GEOFENCE_ZONE_DEFINITIONS[c.primaryGeofence];
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCorridor(c.id)}
                      data-testid={`corridor-card-${c.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-white text-sm leading-snug">
                          {c.nameAz}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${zoneDef.bgClass} ${zoneDef.colorClass} border ${zoneDef.borderClass}`}
                        >
                          {c.primaryGeofence} ZONA
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {c.descriptionAz}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="p-2 rounded bg-slate-900/60 border border-slate-700/50">
                          <span className="text-slate-500 block text-[10px]">Uzunluq & En:</span>
                          <span className="font-medium text-slate-200">
                            {c.lengthKm} km / {c.widthMeters} m
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-900/60 border border-slate-700/50">
                          <span className="text-slate-500 block text-[10px]">Maksimum Sürət:</span>
                          <span className="font-bold text-emerald-400">
                            {c.maxSpeedKmh} km/saat
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{c.activeScootersCount + c.activeBicyclesCount} aktiv vasitə</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          <span>{c.pSpotParkingBays} P-Spot cib</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 py-1 px-2.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center justify-between border border-emerald-500/30">
                          <span>Seçilmiş Dəhliz</span>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Fleet Operators Banner */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    AYNA Rəsmi Lisenziyalı Şəhər İcarə Operatorları
                  </h4>
                  <span className="text-xs text-slate-400">
                    Baku Micromobility Fleet Standards
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {MOCK_ACTIVE_FLEET_OPERATORS.map((op) => (
                    <div
                      key={op.id}
                      className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-xs space-y-1.5"
                    >
                      <div className="font-semibold text-emerald-300 truncate">
                        {op.brandName}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Lisenziya: <span className="text-slate-300 font-mono">{op.licenseNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>Aktiv Donanma:</span>
                        <span className="font-semibold text-white">{op.availableScooters} / {op.totalActiveFleet}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>Təhlükəsizlik Reytinqi:</span>
                        <span className="font-bold text-emerald-400">%{op.safetyScorePercent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY & GEOFENCING STAND */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6" data-testid="tab-telemetry-content">
              {/* Telemetry Evaluation Alert Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
                  telemetryEval.badgeVariant === 'danger'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : telemetryEval.badgeVariant === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {telemetryEval.badgeVariant === 'danger' ? (
                    <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />
                  ) : telemetryEval.badgeVariant === 'warning' ? (
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  )}
                  <div>
                    <div className="font-bold text-sm sm:text-base">
                      {telemetryEval.statusBadgeAz}
                    </div>
                    <div className="text-xs opacity-80">
                      Tənzimlənmiş Sürət: {telemetryEval.governedSpeedKmh} km/saat | Cərimə Cəzası: {telemetryEval.fineAmountAzn} AZN
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/60 border border-current">
                    Cərimə Balı: {telemetryEval.penaltyPoints}
                  </span>
                </div>
              </div>

              {/* Interactive Telemetry Sliders and Toggles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: Dynamic Geofence and Speed Governor */}
                <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-5">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    AYNA Geofence Sürət Məhdudlaşdırıcısı Simulyatoru
                  </h3>

                  {/* Geofence Zone Selection */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-medium">
                      Aktiv Geofence Zonası:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['green', 'yellow', 'red', 'purple'] as GeofenceZoneType[]).map((zone) => {
                        const def = GEOFENCE_ZONE_DEFINITIONS[zone];
                        const isSelected = telemetry.geofenceZone === zone;
                        return (
                          <button
                            key={zone}
                            onClick={() => setTelemetry((prev) => ({ ...prev, geofenceZone: zone }))}
                            data-testid={`telemetry-zone-btn-${zone}`}
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              isSelected
                                ? `${def.bgClass} ${def.borderClass} ${def.colorClass} ring-1`
                                : 'bg-slate-900/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-bold uppercase tracking-wide text-[11px]">
                              {zone} ZONA ({def.speedLimitKmh} km/s)
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {def.nameAz}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Speed Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Sürücünün Drossel Sürəti:</span>
                      <span className="font-bold text-white font-mono">
                        {telemetry.currentSpeedKmh} km/saat
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={35}
                      step={0.5}
                      value={telemetry.currentSpeedKmh}
                      onChange={(e) =>
                        setTelemetry((prev) => ({
                          ...prev,
                          currentSpeedKmh: parseFloat(e.target.value),
                        }))
                      }
                      data-testid="telemetry-speed-slider"
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0 km/s (Dayanıb)</span>
                      <span>12 km/s (Piyada Z.)</span>
                      <span>20 km/s (Velozolaq)</span>
                      <span>35 km/s (Qeyri-qanuni)</span>
                    </div>
                  </div>

                  {/* Surface Vibration Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Səth Vibrasiyası (Akselerometr G):</span>
                      <span className="font-bold text-white font-mono">
                        {telemetry.surfaceVibrationG} G
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={3.0}
                      step={0.05}
                      value={telemetry.surfaceVibrationG}
                      onChange={(e) =>
                        setTelemetry((prev) => ({
                          ...prev,
                          surfaceVibrationG: parseFloat(e.target.value),
                        }))
                      }
                      data-testid="telemetry-vibration-slider"
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-500">
                      1.8 G-dən yuxarı vibrasiya səkidən pilləkənlərə tullanma və ya kobud sürüşü bildirir.
                    </div>
                  </div>
                </div>

                {/* Right Card: Sensors, Battery & Safety Violations */}
                <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-5">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Sensorlar, Dəbilqə və Batareya Vəziyyəti
                  </h3>

                  {/* Toggles: Helmet & Tandem */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-700/60">
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Sertifikatlı Dəbilqə (Kaska Sensoru)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          YHQ Maddə 338.3 üzrə yolda hərəkət zamanı məcburidir
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setTelemetry((prev) => ({ ...prev, helmetDetected: !prev.helmetDetected }))
                        }
                        data-testid="telemetry-helmet-toggle"
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          telemetry.helmetDetected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {telemetry.helmetDetected ? 'Taxılıb' : 'Yoxdur'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-700/60">
                      <div>
                        <div className="text-xs font-semibold text-white">
                          İki Nəfərlə Sürmə (Tandem Ağırlıq Sensoru)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Samokatda 2 nəfərin minməsi qəti qadağandır (30 AZN cərimə)
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setTelemetry((prev) => ({
                            ...prev,
                            tandemRidingDetected: !prev.tandemRidingDetected,
                          }))
                        }
                        data-testid="telemetry-tandem-toggle"
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          telemetry.tandemRidingDetected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {telemetry.tandemRidingDetected ? 'Aşkar Edildi' : 'Tək Sürücü'}
                      </button>
                    </div>
                  </div>

                  {/* Battery Health & Regenerative Braking */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Battery className="w-3.5 h-3.5 text-emerald-400" />
                          Batareya Şarjı:
                        </span>
                        <span className="font-bold text-white">{telemetry.batterySocPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        value={telemetry.batterySocPercent}
                        onChange={(e) =>
                          setTelemetry((prev) => ({
                            ...prev,
                            batterySocPercent: parseInt(e.target.value),
                          }))
                        }
                        data-testid="telemetry-battery-slider"
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60">
                      <div className="text-xs text-slate-400">Regenerativ Qənaət:</div>
                      <div className="text-base font-bold text-cyan-400 mt-1">
                        {telemetry.regenerativeHarvestingWatts} W
                      </div>
                      <div className="text-[10px] text-slate-500">Əyləc zamanı enerji bərpası</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TARIFF & ECO SAVINGS CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6" data-testid="tab-calculator-content">
              {/* Currency Selector */}
              <div className="flex justify-end items-center gap-2">
                <span className="text-xs text-slate-400">Valyuta:</span>
                {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    data-testid={`calculator-currency-${curr}`}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      currency === curr
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-4">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Mikromobillik və İcarə Parametrləri
                  </h3>

                  {/* Vehicle Category */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                      Nəqliyyat Növü:
                    </label>
                    <select
                      value={calcCategory}
                      onChange={(e) =>
                        setCalcCategory(e.target.value as MicromobilityVehicleCategory)
                      }
                      data-testid="calculator-category-select"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {Object.values(MICROMOBILITY_VEHICLE_CONFIGS).map((cfg) => (
                        <option key={cfg.id} value={cfg.id}>
                          {cfg.nameAz} ({cfg.maxAutonomousSpeedKmh} km/s limit)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ride Duration */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Səyahət Müddəti:</span>
                      <span className="font-bold text-white font-mono">
                        {calcDurationMinutes} dəqiqə
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={120}
                      step={5}
                      value={calcDurationMinutes}
                      onChange={(e) => setCalcDurationMinutes(parseInt(e.target.value))}
                      data-testid="calculator-duration-slider"
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Distance */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Qət Edilən Məsafə:</span>
                      <span className="font-bold text-white font-mono">
                        {calcDistanceKm} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={0.5}
                      value={calcDistanceKm}
                      onChange={(e) => setCalcDistanceKm(parseFloat(e.target.value))}
                      data-testid="calculator-distance-slider"
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Toggles: Discounts */}
                  <div className="space-y-2 pt-2 border-t border-slate-700/60">
                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 cursor-pointer text-xs">
                      <span className="text-slate-300">Tələbə / Gənclər Güzəşti (%20)</span>
                      <input
                        type="checkbox"
                        checked={hasStudentDiscount}
                        onChange={(e) => setHasStudentDiscount(e.target.checked)}
                        data-testid="calculator-student-checkbox"
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 cursor-pointer text-xs">
                      <span className="text-slate-300">BakuCard İctimai Nəqliyyat İnteqrasiyası (%25)</span>
                      <input
                        type="checkbox"
                        checked={hasBakuCardTransfer}
                        onChange={(e) => setHasBakuCardTransfer(e.target.checked)}
                        data-testid="calculator-bakucard-checkbox"
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 cursor-pointer text-xs">
                      <span className="text-slate-300">Sanitariya Şleminin İcarəsi (+0.30 ₼)</span>
                      <input
                        type="checkbox"
                        checked={includeHelmetRental}
                        onChange={(e) => setIncludeHelmetRental(e.target.checked)}
                        data-testid="calculator-helmet-checkbox"
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Tariff & Eco Results Summary */}
                <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-4">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                      Tarif Hesabatı və Ekoloji Təsir
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-700/60">
                        <span className="text-slate-400">Kilidin Açılması (Start) Haqqı:</span>
                        <span className="text-white font-mono">
                          {formatCurrency(tariffResult.baseUnlockFeeAzn, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-700/60">
                        <span className="text-slate-400">Dəqiqəlik İcarə Haqqı:</span>
                        <span className="text-white font-mono">
                          {formatCurrency(tariffResult.rideMinuteFeeAzn, currency)}
                        </span>
                      </div>
                      {tariffResult.helmetRentalFeeAzn > 0 && (
                        <div className="flex justify-between py-1.5 border-b border-slate-700/60">
                          <span className="text-slate-400">Dəbilqə İcarəsi:</span>
                          <span className="text-white font-mono">
                            {formatCurrency(tariffResult.helmetRentalFeeAzn, currency)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5 border-b border-slate-700/60 text-emerald-400">
                        <span>Tətbiq Edilən Güzəştlər Cəmi:</span>
                        <span className="font-mono">
                          -{formatCurrency(tariffResult.totalDiscountAmountAzn, currency)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 mt-4 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                          Yekun Ödəniləcək Məbləğ:
                        </div>
                        <div className="text-2xl font-black text-emerald-400 font-mono">
                          {formatCurrency(tariffResult.netPayableAzn, currency)}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        AYNA Smart Tarif
                      </span>
                    </div>
                  </div>

                  {/* Ecological Impact Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/60 text-xs">
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                      <div className="text-slate-400 text-[11px]">Qarşısı Alınan CO₂:</div>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">
                        {tariffResult.co2EmissionsSavedGrams} qram
                      </div>
                      <div className="text-[10px] text-slate-500">Avtomobil emissiyasına nisbətən</div>
                    </div>
                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
                      <div className="text-slate-400 text-[11px]">Qənaət Olunan Yanacaq:</div>
                      <div className="text-lg font-bold text-cyan-400 mt-0.5">
                        {tariffResult.equivalentFuelSavedLitres} litr
                      </div>
                      <div className="text-[10px] text-slate-500">Şəhər daxili yanacaq qənaəti</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="tab-checklist-content">
              {/* Checklist Status Banner */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      checklistResult.isEligible
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      10 Bəndlik Mikromobillik Təhlükəsizlik Auditi
                    </h3>
                    <p className="text-xs text-slate-400">
                      EN 17128, ISO 4210 və YHQ Maddə 46-48 üzrə texniki və sürücü yoxlanışı
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Uyğunluq Reytinqi:</span>
                    <span
                      className={`text-lg font-bold ${
                        checklistResult.isEligible ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      %{checklistResult.scorePercent}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckAll}
                    data-testid="checklist-check-all-btn"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MICROMOBILITY_SAFETY_CHECKLIST.map((item) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-800/80 border-emerald-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-0.5 rounded accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-medium leading-snug">{item.titleAz}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                          <span>Qaydalar: {item.regulatoryReference}</span>
                          {item.isMandatory && (
                            <span className="text-rose-400 font-semibold uppercase">Məcburi</span>
                          )}
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
            <div className="space-y-6" data-testid="tab-exam-content">
              {/* Header and Quick Fill */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    AYNA & BDYP Yol Hərəkəti Qaydaları İmtahan Simulyatoru
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fərdi mobillik və velosiped hərəkətinə dair 10 rəsmi sual (Keçid balı: 80%)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuickFillExam}
                    data-testid="exam-quick-fill-btn"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    100% Avtomatik Doldur
                  </button>
                  <button
                    onClick={() => setExamSubmitted(true)}
                    data-testid="exam-submit-btn"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    İmtahanı Tamamla
                  </button>
                </div>
              </div>

              {/* Exam Result Banner (if submitted) */}
              {examSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    examResult.passed
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {examResult.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-400" />
                    )}
                    <div>
                      <div className="font-bold text-sm sm:text-base">
                        {examResult.passed
                          ? 'Təbriklər! İmtahan Müvəffəqiyyətlə Keçildi'
                          : 'İmtahan Nəticəsi Qeyri-Məqbuldur'}
                      </div>
                      <div className="text-xs opacity-80">
                        Doğru Cavablar: {examResult.correctCount} / {examResult.totalQuestions} (%{examResult.scorePercent})
                      </div>
                    </div>
                  </div>
                  {examResult.passed && (
                    <button
                      onClick={() => setActiveTab('certificate')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Sertifikatı Al
                    </button>
                  )}
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {MICROMOBILITY_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedAnswer = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white text-xs sm:text-sm">
                          {idx + 1}. {q.questionAz}
                        </span>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {q.regulatorySource}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedAnswer === optIdx;
                          let optionClasses =
                            'p-2.5 rounded-lg text-xs text-left border transition-all cursor-pointer ';
                          if (isOptionSelected) {
                            optionClasses += 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium';
                          } else {
                            optionClasses += 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-600';
                          }
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerExam(q.id, optIdx)}
                              data-testid={`exam-q${q.id}-opt${optIdx}`}
                              className={optionClasses}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="text-[11px] p-2.5 rounded bg-slate-900/70 border border-slate-700 text-slate-400 mt-2">
                          <span className="text-emerald-400 font-semibold">İzah: </span>
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
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="tab-certificate-content">
              {/* Certificate Generator Controls */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      MICROMOBILITY-BAKU-AZ-2026 Rəsmi Şəhər İcazə Vəsiqəsi
                    </h3>
                    <p className="text-xs text-slate-400">
                      SİMA Rəqəmsal İmza və SHA-256 Kriptoqrafik Doğrulama Standartı
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCertificateNumber(activeCertificate.certificateNumber)}
                    data-testid="cert-copy-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs font-medium cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    {copiedCode ? 'Kopyalandı!' : 'Nömrəni Kopyala'}
                  </button>
                  <button
                    onClick={handlePrint}
                    data-testid="cert-print-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Çap Et
                  </button>
                </div>
              </div>

              {/* Certificate Paper Sheet */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
                {/* Watermark */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                  <Bike className="w-72 h-72 text-emerald-400" />
                </div>

                {/* Sheet Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-5 mb-5 flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                      Azərbaycan Respublikası Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi
                    </div>
                    <div className="text-xs text-slate-300 font-semibold">
                      Azərbaycan Yerüstü Nəqliyyat Agentliyi (AYNA) & BDYP
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-wide mt-1">
                      ŞƏHƏR MİKROMOBİLLİK HƏRƏKƏT VƏ BURAXILIŞ VƏSİQƏSİ
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Vəsiqə Nömrəsi:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                      {activeCertificate.certificateNumber}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      SİMA UID: {activeCertificate.simaDigitalUid}
                    </div>
                  </div>
                </div>

                {/* Sheet Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs mb-6">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Sürücü / Operator:</span>
                    <span className="font-semibold text-white text-sm">
                      {activeCertificate.riderFullName}
                    </span>
                    <div className="text-slate-400 text-[11px]">FIN: {activeCertificate.riderFin}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Vasitə Kateqoriyası & Seriya:</span>
                    <span className="font-semibold text-emerald-300 text-sm">
                      {MICROMOBILITY_VEHICLE_CONFIGS[activeCertificate.vehicleCategory]?.nameAz}
                    </span>
                    <div className="text-slate-400 font-mono text-[11px]">
                      {activeCertificate.vehicleSerialNumber}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">İcazə Verilən Sürət Həddi:</span>
                    <span className="font-bold text-white text-sm">
                      Maksimum {activeCertificate.allowedMaxSpeedKmh} km/saat
                    </span>
                    <div className="text-emerald-400 text-[11px]">Avtomatik Geofence Nəzarətində</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">İmtahan & Audit Balı:</span>
                    <span className="font-semibold text-white">
                      YHQ İmtahanı: %{activeCertificate.examScore} | Audit: %{activeCertificate.checklistScore}
                    </span>
                    <div className="text-cyan-400 text-[11px]">Müvəffəqiyyətlə Təsdiqlənib</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Verilmə Tarixi:</span>
                    <span className="font-medium text-white">{activeCertificate.issueDate}</span>
                    <div className="text-slate-500 text-[11px]">
                      Etibarlıdır: {activeCertificate.expiryDate}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Lisenziyalı Şəbəkə:</span>
                    <span className="font-medium text-white">{activeCertificate.operatorBrand}</span>
                    <div className="text-emerald-400 text-[11px]">AYNA Sertifikatlı Operator</div>
                  </div>
                </div>

                {/* Authorized Corridors Badges */}
                <div className="mb-6">
                  <span className="text-[10px] text-slate-400 block mb-1.5 uppercase tracking-wide">
                    İcazə Verilmiş Bakı Şəhər Velodəhlizləri:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCertificate.authorizedCorridors.map((cId) => (
                      <span
                        key={cId}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium"
                      >
                        {STRATEGIC_CORRIDORS[cId]?.nameAz || cId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cryptographic Digest & Footer */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-500">
                  <div className="font-mono truncate max-w-md">
                    SHA-256 Digest: {activeCertificate.sha256Digest}
                  </div>
                  <div>Dövlət Yol Polisi İdarəsi və AYNA Mərkəzi Qeydiyyat Sistemi</div>
                </div>
              </div>

              {/* Issue New Certificate Form */}
              <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/70 space-y-4">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Yeni Sürücü və ya Donanma Vəsiqəsi Forması
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Sürücünün Adı, Soyadı:</label>
                    <input
                      type="text"
                      value={riderFullName}
                      onChange={(e) => setRiderFullName(e.target.value)}
                      data-testid="cert-form-fullname"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Sürücünün FİN Kodu:</label>
                    <input
                      type="text"
                      value={riderFin}
                      onChange={(e) => setRiderFin(e.target.value.toUpperCase())}
                      data-testid="cert-form-fin"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Vasitə / QR Seriya Nömrəsi:</label>
                    <input
                      type="text"
                      value={vehicleSerial}
                      onChange={(e) => setVehicleSerial(e.target.value)}
                      data-testid="cert-form-serial"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateCertificate}
                    data-testid="cert-generate-submit-btn"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    Vəsiqəni Tərtib Et və Reyestrə Yaz
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4" data-testid="tab-registry-content">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    AYNA Rəsmi Mikromobillik və Sürücü Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    Qeydiyyata alınmış fərdi və icarə fərdi mobillik vəsiqələri
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {certificates.length} Qeydiyyat
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700/80">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Vəsiqə №</th>
                      <th className="px-4 py-3">Sürücü & FİN</th>
                      <th className="px-4 py-3">Kateqoriya</th>
                      <th className="px-4 py-3">Vasitə Seriyası</th>
                      <th className="px-4 py-3">Maks. Sürət</th>
                      <th className="px-4 py-3">Tarix</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                    {certificates.map((cert) => (
                      <tr
                        key={cert.certificateNumber}
                        onClick={() => {
                          setActiveCertificate(cert);
                          setActiveTab('certificate');
                        }}
                        className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-emerald-400 font-bold whitespace-nowrap">
                          {cert.certificateNumber}
                        </td>
                        <td className="px-4 py-3 font-sans text-white">
                          <div>{cert.riderFullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{cert.riderFin}</div>
                        </td>
                        <td className="px-4 py-3 font-sans text-slate-300">
                          {MICROMOBILITY_VEHICLE_CONFIGS[cert.vehicleCategory]?.nameAz}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{cert.vehicleSerialNumber}</td>
                        <td className="px-4 py-3 text-white font-bold">{cert.allowedMaxSpeedKmh} km/s</td>
                        <td className="px-4 py-3 text-slate-400">{cert.issueDate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Aktiv
                          </span>
                        </td>
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
