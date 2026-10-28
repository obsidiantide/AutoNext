import React, { useState, useMemo } from 'react';
import {
  X,
  Bus,
  ShieldCheck,
  CheckSquare,
  GraduationCap,
  Award,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Printer,
  Copy,
  RotateCcw,
  Gauge,
  MapPin,
  Users,
  Clock,
  Zap,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Compass,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  formatCurrency,
  convertAzn,
  BusCategory,
  BUS_CATEGORIES,
  IntercityRouteCode,
  INTERCITY_ROUTES,
  EuroStandard,
  TenderInputs,
  calculateTenderScore,
  calculateRouteEconomics,
  LiveTelemetryInputs,
  evaluateLiveTelemetry,
  calculateMobilityChecklistScore,
  evaluateMobilityExam,
  generateIntercityMobilityCertificate,
  IntercityMobilityCertificate,
} from '../utils/intercityMobilityCompliance';
import {
  MOCK_BUS_FLEET_PRESETS,
  MOCK_MOBILITY_CHECKLIST_ITEMS,
  MOCK_MOBILITY_EXAM_QUESTIONS,
  MOCK_MOBILITY_PUBLIC_REGISTRY,
} from '../data/mockIntercityMobilityData';

interface IntercityMobilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle;
  currency?: Currency;
}

type TabType = 'tender' | 'routes' | 'telemetry' | 'checklist' | 'exam' | 'certificate' | 'registry';

export const IntercityMobilityModal: React.FC<IntercityMobilityModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tender');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bus-1');

  // Tender Inputs
  const [fleetAverageAgeYears, setFleetAverageAgeYears] = useState<number>(2);
  const [euroStandard, setEuroStandard] = useState<EuroStandard>('EURO_6');
  const [hasWheelchairAccessibility, setHasWheelchairAccessibility] = useState<boolean>(true);
  const [hasAynaGpsAndTachograph, setHasAynaGpsAndTachograph] = useState<boolean>(true);
  const [hasAynaBiletimIntegration, setHasAynaBiletimIntegration] = useState<boolean>(true);
  const [hasClimateAndCctv, setHasClimateAndCctv] = useState<boolean>(true);
  const [busCategory, setBusCategory] = useState<BusCategory>('INTERCITY_COACH_CLASS_III');
  const [routeCode, setRouteCode] = useState<IntercityRouteCode>('AZ_ROUTE_101_GANJA');
  const [fleetVehicleCount, setFleetVehicleCount] = useState<number>(12);
  const [seatCapacityPerBus, setSeatCapacityPerBus] = useState<number>(53);

  // Live Telemetry Inputs
  const [currentSpeedKmH, setCurrentSpeedKmH] = useState<number>(82);
  const [driverShiftHours, setDriverShiftHours] = useState<number>(3.5);
  const [cabinTemperatureCelsius, setCabinTemperatureCelsius] = useState<number>(22.0);
  const [passengerOccupancyPercent, setPassengerOccupancyPercent] = useState<number>(91);
  const [biletimValidatorOnline, setBiletimValidatorOnline] = useState<boolean>(true);
  const [alcoholInterlockOk, setAlcoholInterlockOk] = useState<boolean>(true);
  const [routeDeviationKm, setRouteDeviationKm] = useState<number>(0.2);

  // Carrier & Vehicle Details
  const [carrierName, setCarrierName] = useState<string>('BakuBus MMC');
  const [plateNumber, setPlateNumber] = useState<string>(vehicle?.plateNumber || '99-JH-101');
  const [busModel, setBusModel] = useState<string>(
    vehicle ? `${vehicle.make} ${vehicle.model}` : 'Neoplan Tourliner L'
  );

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<string[]>(
    MOCK_MOBILITY_CHECKLIST_ITEMS.filter((i) => i.isMandatory).map((i) => i.id)
  );

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificate & Public Registry State
  const [activeCert, setActiveCert] = useState<IntercityMobilityCertificate | null>(null);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryFilter, setRegistryFilter] = useState<'ALL' | 'A' | 'B' | 'PROVISIONAL'>('ALL');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Calculations
  const tenderInputs: TenderInputs = useMemo(
    () => ({
      fleetAverageAgeYears,
      euroStandard,
      hasWheelchairAccessibility,
      hasAynaGpsAndTachograph,
      hasAynaBiletimIntegration,
      hasClimateAndCctv,
      busCategory,
      routeCode,
      fleetVehicleCount,
      seatCapacityPerBus,
    }),
    [
      fleetAverageAgeYears,
      euroStandard,
      hasWheelchairAccessibility,
      hasAynaGpsAndTachograph,
      hasAynaBiletimIntegration,
      hasClimateAndCctv,
      busCategory,
      routeCode,
      fleetVehicleCount,
      seatCapacityPerBus,
    ]
  );

  const tenderScoreResult = useMemo(() => calculateTenderScore(tenderInputs), [tenderInputs]);

  const routeEconomics = useMemo(
    () => calculateRouteEconomics(tenderInputs, currency),
    [tenderInputs, currency]
  );

  const telemetryInputs: LiveTelemetryInputs = useMemo(
    () => ({
      currentSpeedKmH,
      driverShiftHours,
      cabinTemperatureCelsius,
      passengerOccupancyPercent,
      biletimValidatorOnline,
      alcoholInterlockOk,
      routeDeviationKm,
    }),
    [
      currentSpeedKmH,
      driverShiftHours,
      cabinTemperatureCelsius,
      passengerOccupancyPercent,
      biletimValidatorOnline,
      alcoholInterlockOk,
      routeDeviationKm,
    ]
  );

  const telemetryEval = useMemo(
    () => evaluateLiveTelemetry(telemetryInputs, currency),
    [telemetryInputs, currency]
  );

  const checklistScore = useMemo(
    () => calculateMobilityChecklistScore(MOCK_MOBILITY_CHECKLIST_ITEMS, checkedItems),
    [checkedItems]
  );

  const examEvaluation = useMemo(
    () => evaluateMobilityExam(MOCK_MOBILITY_EXAM_QUESTIONS, examAnswers),
    [examAnswers]
  );

  // Handle Preset Selection
  const handleApplyPreset = (presetId: string) => {
    const preset = MOCK_BUS_FLEET_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setCarrierName(preset.carrierNameAz);
    setPlateNumber(preset.plate);
    setBusModel(preset.busModel);
    setBusCategory(preset.category);
    setRouteCode(preset.routeCode);

    setFleetAverageAgeYears(preset.tenderInputs.fleetAverageAgeYears);
    setEuroStandard(preset.tenderInputs.euroStandard);
    setHasWheelchairAccessibility(preset.tenderInputs.hasWheelchairAccessibility);
    setHasAynaGpsAndTachograph(preset.tenderInputs.hasAynaGpsAndTachograph);
    setHasAynaBiletimIntegration(preset.tenderInputs.hasAynaBiletimIntegration);
    setHasClimateAndCctv(preset.tenderInputs.hasClimateAndCctv);
    setFleetVehicleCount(preset.tenderInputs.fleetVehicleCount);
    setSeatCapacityPerBus(preset.tenderInputs.seatCapacityPerBus);

    setCurrentSpeedKmH(preset.telemetryInputs.currentSpeedKmH);
    setDriverShiftHours(preset.telemetryInputs.driverShiftHours);
    setCabinTemperatureCelsius(preset.telemetryInputs.cabinTemperatureCelsius);
    setPassengerOccupancyPercent(preset.telemetryInputs.passengerOccupancyPercent);
    setBiletimValidatorOnline(preset.telemetryInputs.biletimValidatorOnline);
    setAlcoholInterlockOk(preset.telemetryInputs.alcoholInterlockOk);
    setRouteDeviationKm(preset.telemetryInputs.routeDeviationKm);
  };

  // Toggle Checklist
  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Generate Certificate
  const handleGenerateCertificate = () => {
    const cert = generateIntercityMobilityCertificate(
      carrierName,
      plateNumber,
      busModel,
      busCategory,
      routeCode,
      tenderScoreResult.totalScore,
      tenderScoreResult.grade
    );
    setActiveCert(cert);
    setActiveTab('certificate');
  };

  // Copy Certificate Action
  const handleCopyCertificate = () => {
    if (!activeCert) return;
    navigator.clipboard.writeText(
      `AYNA & RİNN Şəhərlərarası Sərnişin Daşıma Lisenziyası: ${activeCert.certificateId} | Daşıyıcı: ${activeCert.carrierEnterpriseAz} | Marşrut: ${activeCert.assignedRouteNameAz} | Qeydiyyat: ${activeCert.vehiclePlate} | Tender Balı: ${activeCert.tenderScore}/100 (${activeCert.grade}) | SİMA: ${activeCert.simaSignatureUid}`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (!isOpen) return null;

  // Filter Registry
  const filteredRegistry = MOCK_MOBILITY_PUBLIC_REGISTRY.filter((cert) => {
    const matchesSearch =
      cert.certificateId.toLowerCase().includes(registrySearch.toLowerCase()) ||
      cert.vehiclePlate.toLowerCase().includes(registrySearch.toLowerCase()) ||
      cert.carrierEnterpriseAz.toLowerCase().includes(registrySearch.toLowerCase()) ||
      cert.assignedRouteNameAz.toLowerCase().includes(registrySearch.toLowerCase());

    if (!matchesSearch) return false;
    if (registryFilter === 'ALL') return true;
    if (registryFilter === 'A') return cert.grade === 'A';
    if (registryFilter === 'B') return cert.grade === 'B';
    if (registryFilter === 'PROVISIONAL') return cert.status === 'PROVISIONAL';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        data-testid="intercity-mobility-modal"
        className="relative w-full max-w-6xl my-auto bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/50 flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RİNN & AYNA & BDYP
                </span>
                <span className="text-xs text-slate-400 font-mono">MOBIL-AZ-2026 Portal</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                Şəhərlərarası Müntəzəm Sərnişin Daşıma və Tender Qiymətləndirmə Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="modal-close-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector Bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Avtobus Parkı Hazır Nümunələr:
          </span>
          <div className="flex items-center gap-1.5">
            {MOCK_BUS_FLEET_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                data-testid={`preset-btn-${preset.id}`}
                className={`px-2.5 py-1 rounded-lg border font-mono whitespace-nowrap transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                {preset.plate} • {preset.carrierNameAz.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('tender')}
            data-testid="tab-btn-tender"
            className={`flex items-center gap-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'tender'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Tender Qiymətləndirmə (100 Bal)</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            data-testid="tab-btn-routes"
            className={`flex items-center gap-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'routes'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Strateji Marşrutlar və Kvota</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            data-testid="tab-btn-telemetry"
            className={`flex items-center gap-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'telemetry'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Göyərtə Telemetriyası</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-btn-checklist"
            className={`flex items-center gap-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'checklist'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Texniki Siyahı ({checklistScore.checkedCount}/{checklistScore.totalItems})</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-btn-exam"
            className={`flex items-center gap-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'exam'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Qaydalar İmtahanı</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-btn-certificate"
            className={`flex items-center gap-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'certificate'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Elektron Lisenziya (MOBIL-AZ)</span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-btn-registry"
            className={`flex items-center gap-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'registry'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Dövlət Reyestri</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: TENDER SCORING STAND */}
          {activeTab === 'tender' && (
            <div className="space-y-6">
              {/* Top Score Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div
                    className={`p-3 rounded-lg border ${
                      tenderScoreResult.status === 'QUALIFIED'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : tenderScoreResult.status === 'CONDITIONAL'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-red-500/10 border-red-500 text-red-400'
                    }`}
                  >
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">AYNA Müsabiqə Balı</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {tenderScoreResult.totalScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500 text-blue-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Təsnifat Dərəcəsi</div>
                    <div className="text-xl font-bold text-white flex items-center gap-1.5 font-mono">
                      Dərəcə {tenderScoreResult.grade}
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-normal ${
                          tenderScoreResult.status === 'QUALIFIED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : tenderScoreResult.status === 'CONDITIONAL'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {tenderScoreResult.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500 text-purple-400">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Avtobus Parkı Sayı</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {fleetVehicleCount} ədəd <span className="text-xs text-slate-400 font-normal">({seatCapacityPerBus} yer)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500 text-amber-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Təxmini Gündəlik Gəlir</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono">
                      {formatCurrency(routeEconomics.dailyEstimatedRevenueConverted, currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  tenderScoreResult.status === 'QUALIFIED'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : tenderScoreResult.status === 'CONDITIONAL'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-red-950/30 border-red-500/40 text-red-200'
                }`}
              >
                {tenderScoreResult.status === 'QUALIFIED' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-sm">{tenderScoreResult.licenseEligibilityAz}</div>
                  {tenderScoreResult.feedbackAz.length > 0 && (
                    <ul className="text-xs space-y-1 mt-1 text-slate-300 list-disc list-inside">
                      {tenderScoreResult.feedbackAz.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Bus className="w-4 h-4 text-emerald-400" /> Daşıyıcı və Avtobus Parkı Göstəriciləri
                  </h3>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Daşıyıcı Şirkətin Adı</label>
                    <input
                      type="text"
                      value={carrierName}
                      onChange={(e) => setCarrierName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nümunə Avtobus Qeydiyyatı</label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Avtobus Modeli</label>
                      <input
                        type="text"
                        value={busModel}
                        onChange={(e) => setBusModel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Avtobus Kateqoriyası</label>
                    <select
                      value={busCategory}
                      onChange={(e) => setBusCategory(e.target.value as BusCategory)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      {Object.values(BUS_CATEGORIES).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Parkın Orta Yaşı: <span className="text-white font-bold">{fleetAverageAgeYears} il</span> (Maks. 20 bal)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={fleetAverageAgeYears}
                      onChange={(e) => setFleetAverageAgeYears(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0-2 il (20 bal)</span>
                      <span>3-5 il (16 bal)</span>
                      <span>6-8 il (12 bal)</span>
                      <span>9-10 il (6 bal)</span>
                      <span>10+ il (0 bal)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Ekoloji Emissiya Standartı (Maks. 20 bal)</label>
                    <select
                      value={euroStandard}
                      onChange={(e) => setEuroStandard(e.target.value as EuroStandard)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ELECTRIC_ZERO">Sıfır Emissiya / 100% Elektrikli (20 bal)</option>
                      <option value="EURO_6">Euro 6d Ekoloji Standartı (18 bal)</option>
                      <option value="EURO_5">Euro 5 Standartı (14 bal)</option>
                      <option value="EURO_4">Euro 4 Standartı (6 bal)</option>
                      <option value="EURO_3_BELOW">Euro 3 və ya daha aşağı (0 bal)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Təchizat və AYNA İnteqrasiya Meyarları
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={hasWheelchairAccessibility}
                        onChange={(e) => setHasWheelchairAccessibility(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-200">
                          Əlilliyi olan şəxslər üçün hidravlik pandus/lift (15 bal)
                        </div>
                        <div className="text-slate-400">Təkərli araba təhlükəsizlik kəməri və çağırış düyməsi</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={hasAynaGpsAndTachograph}
                        onChange={(e) => setHasAynaGpsAndTachograph(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-200">
                          AYNA Onlayn GPS və Rəqəmsal Taxoqraf (15 bal)
                        </div>
                        <div className="text-slate-400">90 km/s aparat sürət məhdudlaşdırıcı və daimi telemetriya</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={hasAynaBiletimIntegration}
                        onChange={(e) => setHasAynaBiletimIntegration(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-200">
                          AYNA "Biletim" Bulud Elektron Bilet Sistemi (15 bal)
                        </div>
                        <div className="text-slate-400">Girişdə təmassız QR validator və oturacaq sensorları</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={hasClimateAndCctv}
                        onChange={(e) => setHasClimateAndCctv(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-200">
                          Klimat-kontrol, 360° DVR Video və USB çıxışlar (15 bal)
                        </div>
                        <div className="text-slate-400">İkizonalı avtomatik kondisioner, 4 kamera və Wi-Fi</div>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Xətt üzrə Avtobus Sayı</label>
                      <input
                        type="number"
                        min="2"
                        max="30"
                        value={fleetVehicleCount}
                        onChange={(e) => setFleetVehicleCount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Hər Avtobusda Oturacaq</label>
                      <input
                        type="number"
                        min="15"
                        max="65"
                        value={seatCapacityPerBus}
                        onChange={(e) => setSeatCapacityPerBus(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleGenerateCertificate}
                  data-testid="generate-cert-btn"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Rəsmi MOBIL-AZ-2026 Lisenziyası Tərtib Et</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STRATEGIC ROUTES & QUOTA RADAR */}
          {activeTab === 'routes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-400" />
                    Azərbaycan Respublikası Üzrə 7 Strateji Şəhərlərarası Magistral Dəhliz
                  </h3>
                  <p className="text-xs text-slate-400">
                    AYNA tənzimlənən sərnişin kvotaları, reys tezliyi və rəsmi tarif cədvəli
                  </p>
                </div>
              </div>

              {/* Routes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(INTERCITY_ROUTES).map((route) => {
                  const isSelected = route.code === routeCode;
                  return (
                    <div
                      key={route.code}
                      onClick={() => setRouteCode(route.code)}
                      data-testid={`route-card-${route.code}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/60'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                          {route.routeNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {route.transitHours} saat
                        </span>
                      </div>

                      <h4 className="font-semibold text-white text-sm line-clamp-1">{route.nameAz}</h4>
                      <div className="text-xs text-slate-400 mt-1 mb-3">{route.highwayCode}</div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                        <div>
                          <div className="text-slate-500">Məsafə:</div>
                          <div className="font-semibold text-slate-200">{route.distanceKm} km</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Baza Tarif:</div>
                          <div className="font-semibold text-emerald-400">{route.baseFareAzn.toFixed(2)} ₼</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Gündəlik Tələbat:</div>
                          <div className="font-semibold text-slate-200">{route.dailyPassengerDemand} nəfər</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Gündəlik Reys:</div>
                          <div className="font-semibold text-slate-200">{route.dailyScheduledTrips} gediş</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Terminal: {route.terminalHubAz}</span>
                        {isSelected && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            Seçilib <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Economic Calculation Box for Selected Route */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Seçilmiş Marşrut İqtisadi Modeli: {routeEconomics.routeNameAz} ({routeEconomics.distanceKm} km)
                  </h4>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Bilet: {formatCurrency(routeEconomics.calculatedTicketPriceConverted, currency)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-xs text-slate-400">Gündəlik Sərnişin Kvotası</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">
                      {routeEconomics.dailyPassengerQuota} <span className="text-xs text-slate-500">nəfər</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Tutumluluq: {routeEconomics.averageLoadFactorPercent}%</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-xs text-slate-400">Ümumi Gündəlik Reys</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">
                      {routeEconomics.dailyScheduledTrips} <span className="text-xs text-slate-500">gediş</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{fleetVehicleCount} avtobus ilə</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-xs text-slate-400">Gündəlik Yanacaq / Enerji</div>
                    <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                      {formatCurrency(convertAzn(routeEconomics.estimatedDailyFuelCostAzn, currency), currency)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Xərc norması</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-xs text-slate-400">Xalis Gündəlik Rentabellik</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                      {formatCurrency(routeEconomics.estimatedDailyNetProfitConverted, currency)}
                    </div>
                    <div className="text-[10px] text-emerald-500/80 mt-0.5">Sürücü və vergilərdən sonra</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE ONBOARD TELEMETRY STAND */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-emerald-400" />
                    Canlı Göyərtə Telemetriyası və Qayda Pozuntusu Radarı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sürət qovşağı (90 km/s governor), AETR taxoqraf fasiləsiz iş rejimi və AYNA "Biletim" validatoru
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    telemetryEval.isCompliant
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/40 text-red-300'
                  }`}
                >
                  {telemetryEval.isCompliant ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Tam Standartlara Uyğundur (0 Xəta)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>{telemetryEval.violationsAz.length} Qayda Pozuntusu Aşkarlandı</span>
                    </>
                  )}
                </div>
              </div>

              {/* Sliders and Sensors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Cari Avtobus Sürəti:</span>
                      <span
                        className={`font-mono font-bold ${
                          currentSpeedKmH > 90 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {currentSpeedKmH} km/saat (Maks: 90)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="130"
                      value={currentSpeedKmH}
                      onChange={(e) => setCurrentSpeedKmH(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>40 km/s</span>
                      <span className="text-amber-400">90 km/s (Statutory Limit)</span>
                      <span>130 km/s</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Sürücünün Fasiləsiz İdarəetmə Müddəti:</span>
                      <span
                        className={`font-mono font-bold ${
                          driverShiftHours > 9.0
                            ? 'text-red-400'
                            : driverShiftHours >= 4.5
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {driverShiftHours} saat (AETR Limit: 4.5h / 9.0h)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="0.1"
                      value={driverShiftHours}
                      onChange={(e) => setDriverShiftHours(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0 saat</span>
                      <span className="text-amber-400">4.5 saat (Fasilə)</span>
                      <span className="text-red-400">9.0 saat (Maks gündəlik)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Sərnişin Salonu Temperaturu:</span>
                      <span
                        className={`font-mono font-bold ${
                          cabinTemperatureCelsius < 18 || cabinTemperatureCelsius > 25
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {cabinTemperatureCelsius}°C (Sanitar norma: 20-24°C)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="32"
                      step="0.5"
                      value={cabinTemperatureCelsius}
                      onChange={(e) => setCabinTemperatureCelsius(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        AYNA "Biletim" Bulud Validatoru
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Onlayn QR bilet skaner və mərkəzi sinxronizasiya
                      </div>
                    </div>
                    <button
                      onClick={() => setBiletimValidatorOnline(!biletimValidatorOnline)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        biletimValidatorOnline
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-red-500/20 border-red-500 text-red-300'
                      }`}
                    >
                      {biletimValidatorOnline ? 'ONLAYN' : 'OFLAYN'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        Reysqabağı Alkotester İnterlok
                      </div>
                      <div className="text-[11px] text-slate-400">
                        0.00‰ göstərici ilə elektron mühərrik icazəsi
                      </div>
                    </div>
                    <button
                      onClick={() => setAlcoholInterlockOk(!alcoholInterlockOk)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        alcoholInterlockOk
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-red-500/20 border-red-500 text-red-300'
                      }`}
                    >
                      {alcoholInterlockOk ? '0.00‰ Təmiz' : 'Pozuntu Aşkarlanıb'}
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Marşrutdan Kənara Çıxma:</span>
                      <span
                        className={`font-mono font-bold ${
                          routeDeviationKm > 2.0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {routeDeviationKm} km (Maks buffer: 2.0 km)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={routeDeviationKm}
                      onChange={(e) => setRouteDeviationKm(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Violations / Fine Assessment */}
              {telemetryEval.violationsAz.length > 0 && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> İXM İnzibati Cərimə və Təhlükəsizlik Sanksiyaları
                    </span>
                    <span className="text-sm font-bold text-red-300 font-mono">
                      Cərimə: {formatCurrency(telemetryEval.potentialFineConverted, currency)}
                    </span>
                  </div>
                  <ul className="text-xs text-red-200/90 space-y-1 list-disc list-inside">
                    {telemetryEval.violationsAz.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 10-POINT TECHNICAL CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                    10-Mərhələli Rəsmi Texniki və Təhlükəsizlik Reqlamenti
                  </h3>
                  <p className="text-xs text-slate-400">
                    Nazirlər Kabinetinin № 141 Qərarı və AYNA müntəzəm sərnişindaşıma standartı
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setCheckedItems(
                        checkedItems.length === MOCK_MOBILITY_CHECKLIST_ITEMS.length
                          ? []
                          : MOCK_MOBILITY_CHECKLIST_ITEMS.map((i) => i.id)
                      )
                    }
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline"
                  >
                    {checkedItems.length === MOCK_MOBILITY_CHECKLIST_ITEMS.length
                      ? 'Hamısını Sil'
                      : 'Hamısını Seç'}
                  </button>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                    {checklistScore.scorePercent}% Tamamlandı
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {MOCK_MOBILITY_CHECKLIST_ITEMS.map((item, idx) => {
                  const isChecked = checkedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-100'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            #{idx + 1}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {item.categoryAz}
                          </span>
                          {item.isMandatory && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                              Məcburi
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-mono ml-auto">
                            +{item.points} bal
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-white mt-1">{item.titleAz}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{item.descriptionAz}</p>
                        <div className="text-[11px] text-emerald-500/80 font-mono mt-1">
                          Qanunvericilik: {item.legalCitation}
                        </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    AYNA & RİNN Şəhərlərarası Daşıyıcı İmtahan Simulyatoru (10 Sual)
                  </h3>
                  <p className="text-xs text-slate-400">
                    "Avtomobil nəqliyyatı haqqında" Qanun, İXM və beynəlxalq AETR standartları üzrə test
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    Cavablandırılıb: {examEvaluation.answeredCount}/10
                  </div>
                  {examSubmitted && (
                    <div
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                        examEvaluation.passed
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-red-500/20 border-red-500 text-red-300'
                      }`}
                    >
                      Nəticə: {examEvaluation.scorePercent}% ({examEvaluation.passed ? 'KEÇDİ' : 'KƏSİLDİ'})
                    </div>
                  )}
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {MOCK_MOBILITY_EXAM_QUESTIONS.map((q) => {
                  const selectedAnswer = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          Sual #{q.id}
                        </span>
                        <h4 className="text-sm font-semibold text-white flex-1">{q.questionAz}</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.optionsAz.map((option, optIdx) => {
                          const isOptionSelected = selectedAnswer === optIdx;
                          let btnStyle =
                            'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (examSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                            } else if (isOptionSelected && !examEvaluation.questionResults.find((r) => r.questionId === q.id)?.isCorrect) {
                              btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              data-testid={`exam-q${q.id}-opt${optIdx}`}
                              className={`p-2.5 rounded-lg border text-xs text-left transition-all ${btnStyle}`}
                            >
                              <span className="font-mono font-bold mr-1.5">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                          <div className="text-emerald-400 font-semibold mb-0.5">
                            Hüquqi Əsas: {q.legalCitationAz}
                          </div>
                          <div>{q.explanationAz}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Reset Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setExamAnswers({});
                    setExamSubmitted(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
                <button
                  onClick={() => setExamSubmitted(true)}
                  data-testid="submit-exam-btn"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>İmtahanı Yoxla və Nəticəni Göstər</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL ELECTRONIC LICENSE CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {!activeCert ? (
                <div className="text-center py-12 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <Award className="w-12 h-12 text-slate-600 mx-auto" />
                  <div>
                    <h4 className="text-base font-bold text-white">Lisenziya Hələ Tərtib Edilməyib</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Tender meyarlarını təyin edin və "Rəsmi MOBIL-AZ-2026 Lisenziyası Tərtib Et" düyməsinə klikləyin.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateCertificate}
                    data-testid="generate-cert-placeholder-btn"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" /> İndi Tərtib Et
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      RİNN Vahid Nəqliyyat Reyestri Qeydiyyatı: <strong className="text-white font-mono">{activeCert.certificateId}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyCertificate}
                        data-testid="copy-cert-btn"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedCode ? 'Kopyalandı!' : 'Məlumatı Kopyala'}</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        data-testid="print-cert-btn"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Çap Et (A4 Forma)</span>
                      </button>
                    </div>
                  </div>

                  {/* Certificate Sheet */}
                  <div
                    data-testid="certificate-sheet"
                    className="p-8 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/50 shadow-2xl space-y-6 relative overflow-hidden"
                  >
                    {/* Watermark / Background Accent */}
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Official Certificate Header */}
                    <div className="text-center space-y-1.5 border-b border-slate-800 pb-5">
                      <div className="flex items-center justify-center gap-2">
                        <Bus className="w-7 h-7 text-emerald-400" />
                        <span className="text-sm font-bold tracking-widest text-emerald-400 uppercase">
                          Azərbaycan Respublikası Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-400 tracking-wider">
                        AZƏRBAYCAN YERÜSTÜ NƏQLİYYAT AGENTLİYİ (AYNA) & BAŞ DÖVLƏT YOL POLİSİ (BDYP)
                      </div>
                      <h2 className="text-xl font-extrabold text-white tracking-wide mt-2">
                        MÜNTƏZƏM ŞƏHƏRLƏRARASI SƏRNİŞİN DAŞIMA LİSENZİYASI
                      </h2>
                      <div className="text-xs font-mono text-emerald-300 font-bold">
                        VƏSİQƏ №: {activeCert.certificateId} • DƏRƏCƏ: {activeCert.grade} (Müsabiqə Balı: {activeCert.tenderScore}/100)
                      </div>
                    </div>

                    {/* Certificate Body Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-400">Daşıyıcı Hüquqi Şəxs:</span>
                          <div className="font-bold text-white text-sm">{activeCert.carrierEnterpriseAz}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{activeCert.carrierVoen}</div>
                        </div>

                        <div>
                          <span className="text-slate-400">Təhkim Olunmuş Magistral Marşrut:</span>
                          <div className="font-bold text-emerald-400 text-sm">{activeCert.assignedRouteNameAz}</div>
                          <div className="text-[11px] text-slate-400">Marşrut Kodu: {activeCert.assignedRouteCode}</div>
                        </div>

                        <div>
                          <span className="text-slate-400">Avtobus Modeli və Kateqoriya:</span>
                          <div className="font-semibold text-white">{activeCert.busModelAz}</div>
                          <div className="text-[11px] text-slate-400">{activeCert.seatCapacity} Sərnişin Oturacağı</div>
                        </div>
                      </div>

                      <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                          <div className="font-mono font-bold text-white text-base tracking-widest">
                            {activeCert.vehiclePlate}
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400">AYNA "Biletim" Terminal Kodu:</span>
                          <div className="font-mono text-emerald-400 font-bold">{activeCert.biletimTerminalId}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400">Verilmə Tarixi:</span>
                            <div className="font-mono font-semibold text-white">{activeCert.issueDate}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Bitmə Tarixi:</span>
                            <div className="font-mono font-semibold text-white">{activeCert.expiryDate}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Digital Signatures and Hashes */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="text-slate-400">
                          SİMA Rəqəmsal İmza UID: <span className="text-emerald-400">{activeCert.simaSignatureUid}</span>
                        </div>
                        <div className="text-slate-400">
                          Təhlükəsizlik Checksum: <span className="text-slate-300">{activeCert.securityHashSha256}</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white text-black font-mono text-[9px] text-center shrink-0">
                        [QR-VERIFY-AYNA]
                        <div className="font-bold">{activeCert.certificateId}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY SEARCH */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-400" />
                    AYNA Vahid Açıq Daşıyıcı və Lisenziya Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    Qeydiyyat nişanı, lisenziya nömrəsi və daşıyıcı şirkət üzrə onlayn axtarış
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Qeydiyyat nişanı və ya nömrə..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 w-52"
                  />
                  <select
                    value={registryFilter}
                    onChange={(e) => setRegistryFilter(e.target.value as any)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">Bütün Dərəcələr</option>
                    <option value="A">Dərəcə A (Qızıl)</option>
                    <option value="B">Dərəcə B (Standart)</option>
                    <option value="PROVISIONAL">Şərti Buraxılış</option>
                  </select>
                </div>
              </div>

              {/* Registry Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="p-3">Lisenziya №</th>
                      <th className="p-3">Daşıyıcı</th>
                      <th className="p-3">Dövlət Qeydiyyatı</th>
                      <th className="p-3">Marşrut</th>
                      <th className="p-3">Tender Balı</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Biletim ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredRegistry.map((item) => (
                      <tr key={item.certificateId} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-400">{item.certificateId}</td>
                        <td className="p-3 font-semibold text-white">{item.carrierEnterpriseAz}</td>
                        <td className="p-3 font-mono font-bold text-slate-200">{item.vehiclePlate}</td>
                        <td className="p-3 text-slate-300">{item.assignedRouteNameAz}</td>
                        <td className="p-3 font-mono">
                          <span className="font-bold text-white">{item.tenderScore}</span>
                          <span className="text-slate-500"> ({item.grade})</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.status === 'ACTIVE_VALID'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {item.status === 'ACTIVE_VALID' ? 'Qüvvədədir' : 'Şərti'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-400">{item.biletimTerminalId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AYNA & BDYP Vahid Şəhərlərarası Nəqliyyat İdarəetmə Mərkəzi Onlayn</span>
          </div>
          <div>
            <button
              onClick={onClose}
              data-testid="modal-bottom-close-btn"
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
