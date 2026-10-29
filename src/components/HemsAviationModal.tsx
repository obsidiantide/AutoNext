import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Copy,
  Printer,
  Search,
  Activity,
  HeartPulse,
  Compass,
  Wind,
  CloudRain,
  MapPin,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Info,
  Radio,
  Zap,
  Phone,
  Flame,
} from 'lucide-react';
import {
  Currency,
  MedicalHelipadId,
  HelicopterFleetModelId,
  MedevacUrgencyCode,
  HELICOPTER_FLEET_INFO,
  MEDEVAC_URGENCY_INFO,
  calculateHemsMission,
  evaluateHemsWeatherConditions,
  issueHemsFlightCertificate,
  HemsFlightClearanceCertificate,
  formatCurrency,
} from '../utils/hemsAviationCompliance';
import {
  MOCK_MEDICAL_HELIPADS,
  MOCK_HELICOPTER_FLEET,
  MOCK_HEMS_MISSION_PRESETS,
  MOCK_HEMS_CHECKLIST,
  MOCK_HEMS_EXAM_QUESTIONS,
  MOCK_HEMS_REGISTRY,
} from '../data/mockHemsAviationData';
import { Vehicle } from '../types/vehicle';

interface HemsAviationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

type TabType =
  | 'radar'
  | 'calculator'
  | 'weather'
  | 'fleet'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const HemsAviationModal: React.FC<HemsAviationModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Helipad Radar State
  const [selectedHelipadId, setSelectedHelipadId] = useState<MedicalHelipadId>('HELI_YENI_KLINIKA');
  const [searchHelipad, setSearchHelipad] = useState('');

  // Calculator State
  const [departureHelipadId, setDepartureHelipadId] = useState<MedicalHelipadId>('HELI_SHUSHA_CITY');
  const [destinationHelipadId, setDestinationHelipadId] = useState<MedicalHelipadId>('HELI_YENI_KLINIKA');
  const [helicopterModelId, setHelicopterModelId] = useState<HelicopterFleetModelId>('H145_BK117_D3');
  const [urgencyCode, setUrgencyCode] = useState<MedevacUrgencyCode>('CODE_RED_CRITICAL');
  const [patientCount, setPatientCount] = useState(1);
  const [isNightOperation, setIsNightOperation] = useState(false);
  const [requiresHoistWinch, setRequiresHoistWinch] = useState(false);
  const [applyStateSubsidy, setApplyStateSubsidy] = useState(true);
  const [patientNotes, setPatientNotes] = useState('');

  // Weather Assessment State
  const [cloudCeilingFt, setCloudCeilingFt] = useState(2500);
  const [visibilityMeters, setVisibilityMeters] = useState(7000);
  const [windKnots, setWindKnots] = useState(14);
  const [isMountainRoute, setIsMountainRoute] = useState(true);
  const [hasIcing, setHasIcing] = useState(false);
  const [hasThunderstorm, setHasThunderstorm] = useState(false);

  // Safety Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    CHK_01_FUEL_RESERVE: true,
    CHK_02_MED_CREW_BRIEFING: true,
    CHK_03_OXYGEN_VENTILATOR: true,
    CHK_04_DEFIBRILLATOR_SUCTION: true,
    CHK_07_FOD_WINDSOCK: true,
    CHK_08_ATC_FLIGHT_PLAN: true,
    CHK_09_STRETCHER_LOCK: true,
    CHK_10_WEATHER_RADAR: true,
  });

  // Examination State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [showExamResults, setShowExamResults] = useState(false);

  // Issued Certificate State
  const [issuedCert, setIssuedCert] = useState<HemsFlightClearanceCertificate | null>(
    MOCK_HEMS_REGISTRY[0]
  );
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Registry Search
  const [registryQuery, setRegistryQuery] = useState('');
  const [registryUrgencyFilter, setRegistryUrgencyFilter] = useState<string>('ALL');

  // Filtered helipads
  const filteredHelipads = useMemo(() => {
    return MOCK_MEDICAL_HELIPADS.filter((h) => {
      const q = searchHelipad.toLowerCase();
      return (
        h.nameAz.toLowerCase().includes(q) ||
        h.locationCity.toLowerCase().includes(q) ||
        h.icaoDesignator.toLowerCase().includes(q) ||
        h.hospitalAffiliation.toLowerCase().includes(q)
      );
    });
  }, [searchHelipad]);

  // Selected Helipad Details
  const selectedHelipad = useMemo(() => {
    return (
      MOCK_MEDICAL_HELIPADS.find((h) => h.id === selectedHelipadId) ||
      MOCK_MEDICAL_HELIPADS[0]
    );
  }, [selectedHelipadId]);

  // Mission Calculation
  const missionCalc = useMemo(() => {
    return calculateHemsMission(
      {
        departureHelipadId,
        destinationHelipadId,
        helicopterModelId,
        urgencyCode,
        patientCount,
        isNightOperation,
        requiresHoistWinch,
        applyStateSubsidy,
      },
      MOCK_MEDICAL_HELIPADS
    );
  }, [
    departureHelipadId,
    destinationHelipadId,
    helicopterModelId,
    urgencyCode,
    patientCount,
    isNightOperation,
    requiresHoistWinch,
    applyStateSubsidy,
  ]);

  // Weather Assessment Result
  const weatherResult = useMemo(() => {
    return evaluateHemsWeatherConditions({
      cloudCeilingFeet: cloudCeilingFt,
      flightVisibilityMeters: visibilityMeters,
      windSpeedKnots: windKnots,
      isNightOperation,
      isMountainRoute,
      hasModerateOrSevereIcing: hasIcing,
      hasThunderstormOnRoute: hasThunderstorm,
    });
  }, [
    cloudCeilingFt,
    visibilityMeters,
    windKnots,
    isNightOperation,
    isMountainRoute,
    hasIcing,
    hasThunderstorm,
  ]);

  // Checklist Completion
  const checklistStats = useMemo(() => {
    const total = MOCK_HEMS_CHECKLIST.length;
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const allMandatoryChecked = MOCK_HEMS_CHECKLIST.filter((i) => i.isMandatory).every(
      (i) => checkedItems[i.id]
    );
    return {
      total,
      checkedCount,
      percentage: Math.round((checkedCount / total) * 100),
      isFlightCleared: allMandatoryChecked && checkedCount >= 8,
    };
  }, [checkedItems]);

  // Exam Score
  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_HEMS_EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: MOCK_HEMS_EXAM_QUESTIONS.length,
      passed: correct >= 8,
    };
  }, [examAnswers]);

  // Handle Preset Application
  const handleApplyPreset = (presetId: string) => {
    const preset = MOCK_HEMS_MISSION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setDepartureHelipadId(preset.departureHelipadId as MedicalHelipadId);
    setDestinationHelipadId(preset.destinationHelipadId as MedicalHelipadId);
    setHelicopterModelId(preset.helicopterModelId as HelicopterFleetModelId);
    setUrgencyCode(preset.urgencyCode as MedevacUrgencyCode);
    setPatientCount(preset.patientCount);
    setIsNightOperation(preset.isNightOperation);
    setRequiresHoistWinch(preset.requiresHoistWinch);
    setPatientNotes(preset.descriptionAz);
    setActiveTab('calculator');
  };

  // Issue Certificate
  const handleIssueCertificate = () => {
    const dep = MOCK_MEDICAL_HELIPADS.find((h) => h.id === departureHelipadId) || MOCK_MEDICAL_HELIPADS[0];
    const dest = MOCK_MEDICAL_HELIPADS.find((h) => h.id === destinationHelipadId) || MOCK_MEDICAL_HELIPADS[1];
    const copter = HELICOPTER_FLEET_INFO[helicopterModelId];

    const cert = issueHemsFlightCertificate({
      departureHelipad: dep,
      destinationHelipad: dest,
      helicopter: copter,
      urgencyCode,
      calcResult: missionCalc,
      weatherResult,
      patientNotes: patientNotes || (targetCar ? `Hadisə: ${targetCar.year} ${targetCar.make} ${targetCar.model} (${targetCar.plateNumber || 'Baku Highway'}) magistral təxliyəsi` : undefined),
    });

    setIssuedCert(cert);
    setActiveTab('certificate');
  };

  // Copy Certificate Details
  const handleCopyCertificate = () => {
    if (!issuedCert) return;
    const text = `AZƏRBAYCAN DÖVLƏT MÜLKİ AVİASİYA AGENTLİYİ (DDAA) & TƏBİB
SANİTAR AVİASİYA (HEMS) UÇUŞ İCAZƏ SERTİFİKATI: ${issuedCert.certificateNumber}
Çağırış Kodu: ${issuedCert.callsign} | Vertolyot: ${issuedCert.helicopterModel}
Marşrut: ${issuedCert.departureHelipadName} (${issuedCert.departureHelipadIcao}) -> ${issuedCert.destinationHelipadName} (${issuedCert.destinationHelipadIcao})
Triage: ${issuedCert.urgencyCode} | Qızıl Saat: ${issuedCert.goldenHourStatus}
Uçuş Məsafəsi: ${issuedCert.flightDistanceKm} km | Müddət: ~${issuedCert.estimatedFlightTimeMin} dəq
Dövlət İTS Subsidiyası: ${issuedCert.stateSubsidyPercent}% | Ödəniləcək: ${issuedCert.payableAmountAzn} AZN
SİMA Rəqəmsal İmza: ${issuedCert.simaDigitalUid}
SHA-256 Həqiqilik Kodu: ${issuedCert.cryptographicSha256}`;

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // Filtered Registry
  const filteredRegistry = useMemo(() => {
    return MOCK_HEMS_REGISTRY.filter((rec) => {
      const matchesQuery =
        rec.certificateNumber.toLowerCase().includes(registryQuery.toLowerCase()) ||
        rec.callsign.toLowerCase().includes(registryQuery.toLowerCase()) ||
        rec.departureHelipadName.toLowerCase().includes(registryQuery.toLowerCase()) ||
        rec.destinationHelipadName.toLowerCase().includes(registryQuery.toLowerCase()) ||
        rec.helicopterModel.toLowerCase().includes(registryQuery.toLowerCase());

      const matchesUrgency =
        registryUrgencyFilter === 'ALL' || rec.urgencyCode === registryUrgencyFilter;

      return matchesQuery && matchesUrgency;
    });
  }, [registryQuery, registryUrgencyFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-6xl my-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-red-950 via-slate-900 to-sky-950 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-xs font-bold tracking-wider uppercase rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  DDAA • FHN • TƏBİB
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  HEMS-AZ-2026
                </span>
                {targetCar && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Avtomobil İnsidenti: {targetCar.make} {targetCar.model}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Aviasiya Təcili Tibbi Yardım və Sanitar Aviasiya
              </h2>
              <p className="text-xs text-slate-300">
                Helikopter Təcili Tibbi Xidmətləri (HEMS), Hospital Heliporları Radarı və "Qızıl Saat" Uçuş Klirensi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    currency === cur
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 overflow-x-auto scrollbar-thin">
          {[
            { id: 'radar', label: 'Helipor Radarı (8)', icon: MapPin },
            { id: 'calculator', label: 'Uçuş & Qızıl Saat Kalkulyatoru', icon: Clock },
            { id: 'weather', label: 'VFR / NVG Hava Telemetriyası', icon: CloudRain },
            { id: 'fleet', label: 'Vertolyot Parkı & Reanimasiya', icon: Compass },
            { id: 'checklist', label: 'Uçuş Təhlükəsizlik Yoxlaması (10)', icon: CheckCircle2 },
            { id: 'exam', label: 'HEMS İmtahan Simulyatoru (10)', icon: HelpCircle },
            { id: 'certificate', label: 'Rəsmi HEMS Sertifikatı', icon: Shield },
            { id: 'registry', label: 'Milli Reyestr', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-red-500 text-red-400 bg-red-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-400" />
                    Azərbaycan Sanitar Aviasiya və Hospital Heliporları Radarı
                  </h3>
                  <p className="text-xs text-slate-400">
                    ICAO Annex 14 Vol II standartlı 8 strateji təcili tibbi eniş meydançası
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Helipor və ya şəhər axtar..."
                    value={searchHelipad}
                    onChange={(e) => setSearchHelipad(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Helipad Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredHelipads.map((h) => {
                  const isSelected = selectedHelipadId === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHelipadId(h.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-red-950/30 border-red-500 ring-1 ring-red-500'
                          : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded bg-slate-900 border border-slate-700 text-sky-400">
                          {h.icaoDesignator}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {h.status === 'ACTIVE_STANDBY' ? 'Aktiv Növbətçilik' : 'Məşğul'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{h.nameAz}</h4>
                      <p className="text-xs text-slate-400 mb-3">{h.locationCity}</p>

                      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-2.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hündürlük:</span>
                          <span className="font-mono">{h.elevationMeters} m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">D-Value:</span>
                          <span className="font-mono">Ø {h.dValueDiameterMeters} m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rabitə Tezliyi:</span>
                          <span className="font-mono text-amber-300">{h.vhfRadioFreqMhz}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Travma Qrupu:</span>
                          <span className="font-semibold text-red-400">
                            {h.traumaLevel === 'LEVEL_1_COMPREHENSIVE'
                              ? 'Level 1 Travma'
                              : h.traumaLevel === 'ALPINE_STABILIZATION'
                              ? 'Dağ Stabilizasiyası'
                              : 'Level 2 Regional'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Helipad Detailed Stand */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-600/30 text-red-300 border border-red-500/40">
                        {selectedHelipad.icaoDesignator}
                      </span>
                      <span className="text-xs text-slate-400">
                        {selectedHelipad.hospitalAffiliation}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white">{selectedHelipad.nameAz}</h4>
                    <p className="text-xs text-slate-300">{selectedHelipad.locationCity}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setDepartureHelipadId(selectedHelipad.id);
                        setActiveTab('calculator');
                      }}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-red-950"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Çıxış Heliporu Təyin Et
                    </button>
                    <button
                      onClick={() => {
                        setDestinationHelipadId(selectedHelipad.id);
                        setActiveTab('calculator');
                      }}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-sky-950"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Qəbul Hospitalı Təyin Et
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Səth Növü</span>
                    <span className="font-bold text-white">
                      {selectedHelipad.surfaceType === 'ELEVATED_ROOFTOP'
                        ? 'Damüstü Platforma'
                        : selectedHelipad.surfaceType === 'REINFORCED_DECK'
                        ? 'Gücləndirilmiş Göyərtə'
                        : 'Monolit Asfalt Meydança'}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Maksimum Qalxma Çəkisi (MTOW)</span>
                    <span className="font-bold text-emerald-400">
                      {selectedHelipad.maxTakeoffWeightKg.toLocaleString()} kq
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Naviqasiya Eniş Rejimi</span>
                    <span className="font-bold text-sky-400">
                      {selectedHelipad.instrumentApproachType}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block mb-1">Təcili Dispetçer Əlaqəsi</span>
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedHelipad.emergencyDispatchPhone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-400" />
                    Uçuş Marşrutu və "Qızıl Saat" (Golden Hour) Kalkulyatoru
                  </h3>
                  <p className="text-xs text-slate-400">
                    TƏBİB və DDAA reqlamenti əsasında təcili aviasiya təxliyəsi müddəti və dövlət sığorta hesablaması
                  </p>
                </div>

                {/* Golden Hour Status Indicator */}
                <div
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
                    missionCalc.isGoldenHourMet
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  }`}
                >
                  <HeartPulse className="w-4 h-4 animate-pulse" />
                  <div className="text-xs">
                    <span className="font-bold block">
                      {missionCalc.isGoldenHourMet
                        ? 'QIZIL SAAT TƏMİN OLUNUR'
                        : 'QIZIL SAAT HƏDDİ AŞILIR'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Cəmi Reaksiya: {missionCalc.totalMissionTimeMinutes} dəqiqə (Maksimum hədd: {MEDEVAC_URGENCY_INFO[urgencyCode].maxGoldenHourMinutes} dəq)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Təcili Hadisə Ssenariləri (Tez Seçim):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {MOCK_HEMS_MISSION_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      className="text-left p-2.5 bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/80 rounded-xl transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{p.titleAz}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{p.descriptionAz}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
                {/* Departure Helipad */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Çıxış Meydançası / Hadisə Ziyalı Heliporu:
                  </label>
                  <select
                    value={departureHelipadId}
                    onChange={(e) => setDepartureHelipadId(e.target.value as MedicalHelipadId)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    {MOCK_MEDICAL_HELIPADS.map((h) => (
                      <option key={h.id} value={h.id}>
                        [{h.icaoDesignator}] {h.nameAz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Helipad */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Qəbul Edən İxtisaslaşdırılmış Hospital:
                  </label>
                  <select
                    value={destinationHelipadId}
                    onChange={(e) => setDestinationHelipadId(e.target.value as MedicalHelipadId)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    {MOCK_MEDICAL_HELIPADS.map((h) => (
                      <option key={h.id} value={h.id}>
                        [{h.icaoDesignator}] {h.nameAz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Helicopter Fleet Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Sanitar Vertolyot Modeli:
                  </label>
                  <select
                    value={helicopterModelId}
                    onChange={(e) => setHelicopterModelId(e.target.value as HelicopterFleetModelId)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    {MOCK_HELICOPTER_FLEET.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.modelName} ({f.cruiseSpeedKmH} km/s)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Urgency Code Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Təcili Tibbi Triage Prioriteti:
                  </label>
                  <select
                    value={urgencyCode}
                    onChange={(e) => setUrgencyCode(e.target.value as MedevacUrgencyCode)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    {Object.values(MEDEVAC_URGENCY_INFO).map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.nameAz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient Count */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Xəstə / Yaralı Sayı:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={patientCount}
                    onChange={(e) => setPatientCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Options Toggles */}
                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNightOperation}
                      onChange={(e) => setIsNightOperation(e.target.checked)}
                      className="rounded border-slate-700 text-red-600 focus:ring-0 w-4 h-4"
                    />
                    <span>Gecə Uçuşu (NVG Zəruridir)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresHoistWinch}
                      onChange={(e) => setRequiresHoistWinch(e.target.checked)}
                      className="rounded border-slate-700 text-red-600 focus:ring-0 w-4 h-4"
                    />
                    <span>Xilasetmə Vinçi (Hoist Winch) Tələb Olunur</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyStateSubsidy}
                      onChange={(e) => setApplyStateSubsidy(e.target.checked)}
                      className="rounded border-slate-700 text-red-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-semibold text-emerald-400">
                      İcbari Tibbi Sığorta (İTS) Subsidiyasını Tətbiq Et
                    </span>
                  </label>
                </div>
              </div>

              {/* Patient Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Xəstə Klinik Vəziyyəti və Hadisə Qeydləri:
                </label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Məsələn: Magistralda toqquşma, qapalı kəllə-beyin travması, intubasiyada süni tənəffüs tələb olunur..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Results Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-1">Hava Məsafəsi</span>
                  <span className="text-xl font-black text-white">{missionCalc.distanceKm} km</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Kruiz Sürəti: {missionCalc.cruiseSpeedKmH} km/s
                  </span>
                </div>
                <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-1">Havada Uçuş Müddəti</span>
                  <span className="text-xl font-black text-sky-400">
                    {missionCalc.flightTimeMinutes} dəqiqə
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Hazırlıq: {missionCalc.scrambleTimeMinutes} dəq
                  </span>
                </div>
                <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-1">Cəmi Missiya Dəyəri</span>
                  <span className="text-xl font-black text-slate-200">
                    {formatCurrency(missionCalc.subtotalAzn, currency)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Yanacaq: {missionCalc.fuelRequiredLiters} L
                  </span>
                </div>
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl">
                  <span className="text-emerald-400 text-xs block mb-1">
                    Vətəndaşın Ödəyəcəyi Məbləğ
                  </span>
                  <span className="text-xl font-black text-emerald-300">
                    {formatCurrency(missionCalc.payableTotalAzn, currency)}
                  </span>
                  <span className="text-[11px] text-emerald-400/80 block mt-1 font-semibold">
                    Dövlət İTS Subsidiyası: -{formatCurrency(missionCalc.stateSubsidyAmountAzn, currency)}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end">
                <button
                  onClick={handleIssueCertificate}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-red-950 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Rəsmi HEMS Uçuş Klirensini Təsdiqlə və Çıxar
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WEATHER */}
          {activeTab === 'weather' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CloudRain className="w-5 h-5 text-sky-400" />
                    VFR / NVG Meteoroloji Standartlar və Dağ Uçuşu Skanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    ICAO Annex 6 Part III və EASA SPA.HEMS qaydalarına uyğun hava minimumları qiymətləndirilməsi
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 ${
                    weatherResult.isFlightPermitted
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/50 text-red-300'
                  }`}
                >
                  <Wind className="w-4 h-4" />
                  <span>{weatherResult.summaryAz}</span>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>Bulud Tavanı (Cloud Ceiling):</span>
                    <span className="font-mono text-sky-400">{cloudCeilingFt} fut</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="5000"
                    step="100"
                    value={cloudCeilingFt}
                    onChange={(e) => setCloudCeilingFt(parseInt(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Tələb olunan minimum: {weatherResult.minimumCeilingRequiredFt} fut
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>Görünmə Məsafəsi (Visibility):</span>
                    <span className="font-mono text-sky-400">{visibilityMeters} metr</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={visibilityMeters}
                    onChange={(e) => setVisibilityMeters(parseInt(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Tələb olunan minimum: {weatherResult.minimumVisibilityRequiredM} metr
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>Küləyin Sürəti (Wind Speed):</span>
                    <span className="font-mono text-amber-400">{windKnots} knot (~{Math.round(windKnots * 1.852)} km/s)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={windKnots}
                    onChange={(e) => setWindKnots(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Maksimum icazə verilən hədd: 45 knot (~83 km/s)
                  </span>
                </div>
              </div>

              {/* Toggles Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <label className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNightOperation}
                    onChange={(e) => setIsNightOperation(e.target.checked)}
                    className="rounded border-slate-700 text-red-600 focus:ring-0 w-4 h-4"
                  />
                  <span>Gecə Uçuşu</span>
                </label>
                <label className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMountainRoute}
                    onChange={(e) => setIsMountainRoute(e.target.checked)}
                    className="rounded border-slate-700 text-red-600 focus:ring-0 w-4 h-4"
                  />
                  <span>Dağlıq Marşrut</span>
                </label>
                <label className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasIcing}
                    onChange={(e) => setHasIcing(e.target.checked)}
                    className="rounded border-slate-700 text-red-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-amber-400">Buzlaşma Təhlükəsi</span>
                </label>
                <label className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasThunderstorm}
                    onChange={(e) => setHasThunderstorm(e.target.checked)}
                    className="rounded border-slate-700 text-red-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-red-400">İldırım Qasırğası</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: FLEET */}
          {activeTab === 'fleet' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-400" />
                  Sanitar Aviasiya Helikopter Parkı və Reanimasiya Modulu
                </h3>
                <p className="text-xs text-slate-400">
                  FHN Aviasiya Dəstəsi və TƏBİB sərəncamındakı ixtisaslaşmış təcili yardım hava gəmiləri
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {MOCK_HELICOPTER_FLEET.map((f) => {
                  const isCurrent = helicopterModelId === f.id;
                  return (
                    <div
                      key={f.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-br from-red-950/30 to-slate-900 border-red-500 ring-1 ring-red-500'
                          : 'bg-slate-800/60 border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-900 border border-slate-700 text-sky-400">
                          {f.manufacturer}
                        </span>
                        <span className="text-xs text-slate-400">{f.operator}</span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-2">{f.modelName}</h4>
                      <p className="text-xs text-slate-300 mb-4">{f.descriptionAz}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-t border-slate-700/60 pt-3">
                        <div>
                          <span className="text-slate-400 block">Kruiz Sürəti:</span>
                          <span className="font-bold text-white">{f.cruiseSpeedKmH} km/s</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Uçuş Məsafəsi:</span>
                          <span className="font-bold text-white">{f.maxRangeKm} km</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Xərək Tutumu:</span>
                          <span className="font-bold text-emerald-400">{f.stretcherCapacity} xərək</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Xilasetmə Vinçi:</span>
                          <span className="font-bold text-amber-300">
                            {f.hasRescueHoist ? `${f.hoistCableLengthMeters} metr` : 'Yoxdur'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">NVG Gecə Görmə:</span>
                          <span className="font-bold text-sky-400">
                            {f.hasNightVisionGogglesNVG ? 'Təchiz Edilib' : 'Məhdud'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">ICU Ventilyatoru:</span>
                          <span className="font-bold text-emerald-400">Hamilton-T1</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Uçuş saat tarifi: <strong className="text-white">{formatCurrency(f.baseHourlyRateAzn, currency)}</strong>
                        </span>
                        <button
                          onClick={() => {
                            setHelicopterModelId(f.id);
                            setActiveTab('calculator');
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Bu Modeli Seç
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    10-Point Aeronautical & Clinical Pre-Flight Safety Checklist
                  </h3>
                  <p className="text-xs text-slate-400">
                    ICAO Annex 6 və TƏBİB reanimasiya protokolu üzrə uçuşaqədərki məcburi texniki-klinik yoxlama
                  </p>
                </div>

                <button
                  onClick={() => {
                    const allChecked: Record<string, boolean> = {};
                    MOCK_HEMS_CHECKLIST.forEach((item) => {
                      allChecked[item.id] = true;
                    });
                    setCheckedItems(allChecked);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow"
                >
                  Bütün Bəndləri Təsdiqlə
                </button>
              </div>

              {/* Progress */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">
                    Tamamlanma: {checklistStats.checkedCount} / {checklistStats.total} ({checklistStats.percentage}%)
                  </span>
                  <span
                    className={
                      checklistStats.isFlightCleared ? 'text-emerald-400' : 'text-amber-400'
                    }
                  >
                    {checklistStats.isFlightCleared
                      ? 'UÇUŞA KLİRENS VERİLDİ'
                      : 'MƏCBURİ BƏNDLƏR TƏLƏB OLUNUR'}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${checklistStats.percentage}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {MOCK_HEMS_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setCheckedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 rounded border-slate-600 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white">{item.titleAz}</span>
                          {item.isMandatory && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-300 border border-red-500/30">
                              Məcburi
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.regulatoryRef}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{item.descriptionAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    HEMS Sanitar Aviasiya və Təcili Tibbi Uçuş Qaydaları İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Azərbaycan Hava Məcəlləsi, ICAO Annex 6, EASA SPA.HEMS və TƏBİB normativləri üzrə 10 sual
                  </p>
                </div>

                {showExamResults && (
                  <div
                    className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                      examScore.passed
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                        : 'bg-red-950/40 border-red-500 text-red-300'
                    }`}
                  >
                    <span>
                      Nəticə: {examScore.correct} / {examScore.total} ({examScore.passed ? 'MÜVƏFFƏQİYYƏTLİ' : 'KƏSİLDİ'})
                    </span>
                  </div>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {MOCK_HEMS_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedAnswer = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-bold text-sm text-white">
                          {idx + 1}. {q.questionAz}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 border border-slate-700 text-sky-400 whitespace-nowrap">
                          {q.regulatoryBasis}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedAnswer === optIdx;
                          const isCorrect = q.correctOptionIndex === optIdx;

                          let btnStyle =
                            'bg-slate-900/80 border-slate-700 hover:bg-slate-750 text-slate-300';
                          if (showExamResults) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-red-950/40 border-red-500 text-red-300';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-red-950/30 border-red-500 text-red-300';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                              }
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {showExamResults && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showExamResults && (
                        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-slate-300">
                          <strong className="text-amber-400 block mb-1">Qanunvericilik İzahı:</strong>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Exam Actions */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    setExamAnswers({});
                    setShowExamResults(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Yenidən Başla
                </button>
                <button
                  onClick={() => setShowExamResults(true)}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg transition-colors"
                >
                  Cavabları Yoxla və Nəticəni Gör
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: CERTIFICATE */}
          {activeTab === 'certificate' && issuedCert && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    Rəsmi HEMS Uçuş Klirensi Sertifikatı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Azərbaycan DDAA və TƏBİB tərəfindən təsdiq olunmuş hüquqi sanitar aviasiya sənədi
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCertificate}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copyFeedback ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Çap Et
                  </button>
                </div>
              </div>

              {/* Certificate Sheet */}
              <div className="p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-red-500/50 rounded-3xl shadow-2xl relative overflow-hidden text-slate-100">
                {/* Watermark Logo */}
                <div className="absolute right-6 -bottom-10 opacity-5 pointer-events-none">
                  <HeartPulse className="w-96 h-96 text-red-500" />
                </div>

                {/* Cert Header */}
                <div className="text-center pb-6 border-b border-slate-800">
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                      AZƏRBAYCAN RESPUBLİKASI RƏSMİ SANİTAR AVİASİYA KLİRENSİ
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    DÖVLƏT MÜLKİ AVİASİYA AGENTLİYİ & TƏBİB
                  </h2>
                  <p className="text-xs text-slate-400">
                    HEMS EMERGENCY MEDICAL FLIGHT CLEARANCE VOUCHER
                  </p>
                </div>

                {/* Cert Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Sertifikat №:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {issuedCert.certificateNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Çağırış Siqnalı (Callsign):</span>
                    <span className="font-mono font-bold text-sky-400 text-sm">
                      {issuedCert.callsign}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Təcili Triage Dərəcəsi:</span>
                    <span className="font-bold text-red-400">
                      {issuedCert.urgencyCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Qızıl Saat Statusu:</span>
                    <span className="font-bold text-emerald-400">
                      {issuedCert.goldenHourStatus}
                    </span>
                  </div>
                </div>

                {/* Route & Aircraft */}
                <div className="py-6 border-b border-slate-800 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1">Çıxış Heliporu:</span>
                      <strong className="text-white text-sm block">
                        {issuedCert.departureHelipadName}
                      </strong>
                      <span className="font-mono text-sky-400 text-xs">
                        ICAO: {issuedCert.departureHelipadIcao}
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1">Qəbul Edən Hospital:</span>
                      <strong className="text-white text-sm block">
                        {issuedCert.destinationHelipadName}
                      </strong>
                      <span className="font-mono text-sky-400 text-xs">
                        ICAO: {issuedCert.destinationHelipadIcao}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-400 block">Vertolyot Modeli:</span>
                      <strong className="text-white">{issuedCert.helicopterModel}</strong>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-400 block">Operator:</span>
                      <strong className="text-white">{issuedCert.operator}</strong>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-400 block">Uçuş Məsafəsi:</span>
                      <strong className="text-white">{issuedCert.flightDistanceKm} km</strong>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-400 block">Uçuş Müddəti:</span>
                      <strong className="text-white">~{issuedCert.estimatedFlightTimeMin} dəq</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg">
                    <span className="text-slate-400 block mb-1">Klinik Diaqnoz və Triage Məlumatı:</span>
                    <p className="text-slate-200">{issuedCert.patientTriageSummary}</p>
                  </div>
                </div>

                {/* Financial Subsidy & Security */}
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">İcbari Tibbi Sığorta Subsidiyası:</span>
                      <span className="font-bold text-emerald-400">
                        {issuedCert.stateSubsidyPercent}% (Tam Dövlət Təminatı)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ödəniləcək Yekun Məbləğ:</span>
                      <span className="font-bold text-white text-sm">
                        {formatCurrency(issuedCert.payableAmountAzn, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Təcili Uçuş Həkimi:</span>
                      <span className="text-slate-200">{issuedCert.flightPhysicianName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Komandir Pilot:</span>
                      <span className="text-slate-200">{issuedCert.captainPilotName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SİMA Rəqəmsal İmza:</span>
                      <span className="font-mono text-sky-400">{issuedCert.simaDigitalUid}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
                    <QrCode className="w-20 h-20 text-white mb-2" />
                    <span className="text-[10px] text-slate-400 text-center font-mono break-all max-w-xs">
                      SHA-256: {issuedCert.cryptographicSha256.slice(0, 28)}...
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-1">
                      DDAA & TƏBİB Bazasında Təsdiqlənib
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-400" />
                    Sanitar Aviasiya Rəsmi Uçuş Klirens Reyestri
                  </h3>
                  <p className="text-xs text-slate-400">
                    Milli HEMS reyestrində qeydiyyatdan keçmiş operativ təcili tibbi təxliyələr
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={registryUrgencyFilter}
                    onChange={(e) => setRegistryUrgencyFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">Bütün Triage Qrupları</option>
                    <option value="CODE_RED_CRITICAL">Qırmızı Kod (Kritik)</option>
                    <option value="CODE_YELLOW_URGENT">Sarı Kod (Təcili)</option>
                    <option value="ALPINE_SAR_RESCUE">Dağ SAR Vinç</option>
                  </select>

                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Reyestrdə axtar..."
                      value={registryQuery}
                      onChange={(e) => setRegistryQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Sertifikat №</th>
                      <th className="p-3.5">Çağırış / Vertolyot</th>
                      <th className="p-3.5">Marşrut</th>
                      <th className="p-3.5">Triage</th>
                      <th className="p-3.5">Qızıl Saat</th>
                      <th className="p-3.5">Dövlət İTS</th>
                      <th className="p-3.5 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredRegistry.map((rec) => (
                      <tr key={rec.certificateNumber} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-white">
                          {rec.certificateNumber}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-sky-400 block">{rec.callsign}</span>
                          <span className="text-[11px] text-slate-400">{rec.helicopterModel}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-white block">{rec.departureHelipadName}</span>
                          <span className="text-[11px] text-slate-400">&rarr; {rec.destinationHelipadName}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.urgencyCode === 'CODE_RED_CRITICAL'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : rec.urgencyCode === 'ALPINE_SAR_RESCUE'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {rec.urgencyCode}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-emerald-400 font-semibold">{rec.goldenHourStatus}</span>
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          {rec.stateSubsidyPercent}%
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setIssuedCert(rec);
                              setActiveTab('certificate');
                            }}
                            className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded text-xs transition-colors"
                          >
                            Bax
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>DDAA & TƏBİB Mərkəzi Sanitar Aviasiya Dispetçer Şəbəkəsi İnterfeysi</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-colors"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
