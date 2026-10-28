import React, { useState, useMemo } from 'react';
import {
  Currency,
  convertAzn,
  formatCurrency,
  EmissionEuroClass,
  VehiclePropulsionType,
  LowEmissionZoneInfo,
  EmissionTelemetry,
  calculateEcoScore,
  calculateLezPermitCost,
  evaluateEcoChecklist,
  evaluateEcoAuditExam,
  generateOfficialLezCertificate,
  OfficialLezPermitCertificate,
} from '../utils/lezEcoCompliance';
import {
  MOCK_LEZ_ZONES,
  MOCK_VEHICLE_PRESETS,
  MOCK_ECO_CHECKLIST,
  MOCK_ECO_EXAM_QUESTIONS,
  MOCK_ACTIVE_PERMITS,
  MockVehiclePreset,
} from '../data/mockLezEcoData';
import { Vehicle } from '../types/vehicle';

export interface LezEcoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type ModalTab = 'zones' | 'telemetry' | 'calculator' | 'checklist' | 'exam' | 'certificate';

export const LezEcoModal: React.FC<LezEcoModalProps> = ({ isOpen, onClose, targetCar }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('zones');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Selected Preset or Target Car
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const activePreset: MockVehiclePreset = useMemo(() => {
    if (targetCar) {
      // Adapt targetCar to preset structure
      const isEv = targetCar.fuelType?.toLowerCase().includes('elektrik') || targetCar.fuelType?.toLowerCase().includes('electric');
      const isHybrid = targetCar.fuelType?.toLowerCase().includes('hibrid') || targetCar.fuelType?.toLowerCase().includes('hybrid');
      const isDiesel = targetCar.fuelType?.toLowerCase().includes('dizel') || targetCar.fuelType?.toLowerCase().includes('diesel');

      let propulsion: VehiclePropulsionType = 'PETROL';
      let euroClass: EmissionEuroClass = 'EURO_5';
      if (isEv) {
        propulsion = 'ELECTRIC';
        euroClass = 'ZERO_EMISSION';
      } else if (isHybrid) {
        propulsion = 'HYBRID';
        euroClass = 'EURO_6D';
      } else if (isDiesel) {
        propulsion = 'DIESEL';
        euroClass = targetCar.year >= 2020 ? 'EURO_6' : targetCar.year >= 2014 ? 'EURO_5' : 'EURO_4';
      } else {
        euroClass = targetCar.year >= 2020 ? 'EURO_6' : targetCar.year >= 2012 ? 'EURO_5' : 'EURO_4';
      }

      return {
        plate: targetCar.vin ? `99-${targetCar.vin.substring(0, 2).toUpperCase()}-777` : '99-XX-999',
        vin: targetCar.vin || 'LGXCE9876AZ123456',
        makeModel: `${targetCar.make} ${targetCar.model} (${targetCar.year})`,
        year: targetCar.year,
        propulsion,
        euroClass,
        ownerNameAz: 'Cari Nəqliyyat Vasitəsi',
        telemetry: {
          euroClass,
          propulsion,
          co2GramsPerKm: isEv ? 0 : isHybrid ? 92 : 145,
          noxMgPerKm: isEv ? 0 : 45,
          pmMgPerKm: isEv ? 0 : 2.5,
          dpfBackpressureMbar: isDiesel ? 24 : 0,
          adBlueLevelPercent: isDiesel ? 80 : 100,
          batterySohPercent: isEv || isHybrid ? 95 : undefined,
          tailpipeSmokeOpacityK: isDiesel ? 0.22 : 0.05,
          noiseLevelDb: isEv ? 62 : 70,
          obdMilStatus: 'CLEAR',
        },
      };
    }
    return MOCK_VEHICLE_PRESETS[selectedPresetIndex] || MOCK_VEHICLE_PRESETS[0];
  }, [targetCar, selectedPresetIndex]);

  // Telemetry interactive controls
  const [customTelemetry, setCustomTelemetry] = useState<EmissionTelemetry>(activePreset.telemetry);

  // Sync when preset changes
  React.useEffect(() => {
    setCustomTelemetry(activePreset.telemetry);
  }, [activePreset]);

  // Zone selection & Calculator states
  const [selectedZoneId, setSelectedZoneId] = useState<string>(MOCK_LEZ_ZONES[0].id);
  const [zoneCityFilter, setZoneCityFilter] = useState<string>('ALL');
  const [durationDays, setDurationDays] = useState<number>(1);
  const [isRushHour, setIsRushHour] = useState<boolean>(false);
  const [includeTreeOffset, setIncludeTreeOffset] = useState<boolean>(true);

  // 10-Point Checklist State
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({
    CHK_DPF_INTEGRITY: true,
    CHK_SCR_ADBLUE: true,
    CHK_EXHAUST_SMOKE_K: true,
    CHK_EV_BATTERY_SOH: true,
    CHK_CATALYTIC_CONVERTER: true,
    CHK_ACOUSTIC_NOISE: true,
    CHK_OBD_MIL_LAMP: true,
    CHK_CRANKCASE_VENTILATION: true,
    CHK_EVAPORATIVE_CANISTER: true,
    CHK_TIRE_ROLLING_RESISTANCE: true,
  });

  // Theory Exam State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificate and registry
  const [certificateData, setCertificateData] = useState<OfficialLezPermitCertificate | null>(null);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Derived zone
  const activeZone = useMemo(() => {
    return MOCK_LEZ_ZONES.find((z) => z.id === selectedZoneId) || MOCK_LEZ_ZONES[0];
  }, [selectedZoneId]);

  // Derived Eco-Score
  const ecoScoreResult = useMemo(() => {
    return calculateEcoScore(customTelemetry);
  }, [customTelemetry]);

  // Derived Cost
  const permitCostResult = useMemo(() => {
    return calculateLezPermitCost({
      zoneBaseRateAzn: activeZone.dailyBaseFeeAzn,
      euroClass: customTelemetry.euroClass,
      durationDays,
      isRushHour,
      includeTreeOffset,
      currency,
    });
  }, [activeZone, customTelemetry.euroClass, durationDays, isRushHour, includeTreeOffset, currency]);

  // Derived Checklist
  const checklistResult = useMemo(() => {
    return evaluateEcoChecklist(MOCK_ECO_CHECKLIST, checkedMap);
  }, [checkedMap]);

  // Derived Exam Result
  const examResult = useMemo(() => {
    return evaluateEcoAuditExam(MOCK_ECO_EXAM_QUESTIONS, examAnswers);
  }, [examAnswers]);

  // Filtered zones
  const filteredZones = useMemo(() => {
    if (zoneCityFilter === 'ALL') return MOCK_LEZ_ZONES;
    return MOCK_LEZ_ZONES.filter((z) => z.cityAz.toLowerCase() === zoneCityFilter.toLowerCase());
  }, [zoneCityFilter]);

  // Filtered permits
  const filteredPermits = useMemo(() => {
    if (!registrySearch.trim()) return MOCK_ACTIVE_PERMITS;
    const q = registrySearch.toLowerCase();
    return MOCK_ACTIVE_PERMITS.filter(
      (p) =>
        p.certificateId.toLowerCase().includes(q) ||
        p.vehiclePlate.toLowerCase().includes(q) ||
        p.carrierOrOwner.toLowerCase().includes(q) ||
        p.zoneNameAz.toLowerCase().includes(q)
    );
  }, [registrySearch]);

  const handleGenerateCertificate = () => {
    const cert = generateOfficialLezCertificate({
      vehiclePlate: activePreset.plate,
      vin: activePreset.vin,
      carrierOrOwner: activePreset.ownerNameAz,
      propulsion: customTelemetry.propulsion,
      euroClass: customTelemetry.euroClass,
      ecoScore: ecoScoreResult.totalScore,
      zoneId: activeZone.id,
      zoneNameAz: activeZone.nameAz,
      permitType:
        customTelemetry.euroClass === 'ZERO_EMISSION'
          ? 'PERMANENT_GREEN'
          : customTelemetry.propulsion === 'DIESEL' && customTelemetry.euroClass === 'EURO_6'
          ? 'COMMERCIAL_DELIVERY'
          : 'TRANSIT_TEMPORARY',
      treesFunded: includeTreeOffset ? durationDays * 2 : 2,
    });
    setCertificateData(cert);
    setActiveTab('certificate');
  };

  const handleCopyCertificate = () => {
    if (!certificateData) return;
    const text = `ETSN & AYNA LEZ TƏMİZ ŞƏHƏR İCAZƏ ŞƏHADƏTNAMƏSİ:
№: ${certificateData.certificateId}
Nəqliyyat Vasitəsi: ${certificateData.vehiclePlate} (VIN: ${certificateData.vin})
Sahib / Daşıyıcı: ${certificateData.carrierOrOwner}
Ekoloji Sinif: ${certificateData.euroClass} | Eko-Skor: ${certificateData.ecoScore}/100
Təyin olunmuş LEZ Zonası: ${certificateData.zoneNameAz}
İcazə Verilən Saatlar: ${certificateData.permittedHours}
Səlahiyyətli Müfəttiş: ${certificateData.inspectorNameAz}
SİMA Rəqəmsal İmza UID: ${certificateData.simaDigitalUid}
Təhlükəsizlik Hash-i: ${certificateData.sha256SecurityChecksum}
QR Yoxlama: ${certificateData.qrVerificationUrl}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback('Şəhadətnamə məlumatları mübadilə buferinə kopyalandı!');
      setTimeout(() => setCopyFeedback(null), 3000);
    });
  };

  const handleToggleChecklist = (id: string) => {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllChecklist = () => {
    const all: Record<string, boolean> = {};
    MOCK_ECO_CHECKLIST.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedMap(all);
  };

  const handleResetChecklist = () => {
    setCheckedMap({});
  };

  const handleSelectExamOption = (questionId: string, optionIndex: number) => {
    if (isExamSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Top Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xl">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ETSN • AYNA • BDYP
                </span>
                <span className="text-xs text-slate-400 font-mono">ECO-ZONE-AZ-2026</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Aşağı Emissiya Zonaları (LEZ) & Yaşıl Donanma Portalı
              </h2>
            </div>
          </div>

          {/* Controls: Currency switcher & close */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-800/80 p-1 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    currency === curr ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Close Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Vehicle Preset Selector Bar */}
        <div className="border-b border-slate-800 bg-slate-950/70 px-6 py-2.5 overflow-x-auto flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Seçilmiş Nəqliyyat:</span>
          {targetCar ? (
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/50 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap">
              🚗 {activePreset.makeModel} ({activePreset.plate})
            </span>
          ) : (
            MOCK_VEHICLE_PRESETS.map((p, idx) => (
              <button
                key={p.plate}
                onClick={() => setSelectedPresetIndex(idx)}
                className={`px-3 py-1 rounded-lg border font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedPresetIndex === idx
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <span>{p.plate}</span>
                <span className="text-[11px] opacity-75">({p.makeModel.split(' ')[0]})</span>
              </button>
            ))
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 overflow-x-auto gap-2">
          {[
            { id: 'zones', label: '🗺️ LEZ Radarı & Zonalar' },
            { id: 'telemetry', label: '📊 Eko-Skor & Telemetriya' },
            { id: 'calculator', label: '🧮 İcazə & Rüsum Kalkulyatoru' },
            { id: 'checklist', label: '📋 10-Bəndlik Eko-Audit' },
            { id: 'exam', label: '🎓 Nəzəri İmtahan Simulyatoru' },
            { id: 'certificate', label: '📜 Ekoloji İcazə & Reyestr' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ModalTab)}
              className={`py-3 px-3 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
          {/* TAB 1: LEZ ZONES & RADAR */}
          {activeTab === 'zones' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <div>
                  <h3 className="font-bold text-white text-base">Azərbaycan Şəhər Aşağı Emissiya Zonaları (LEZ) Şəbəkəsi</h3>
                  <p className="text-xs text-slate-400">
                    ETSN və AYNA tərəfindən 24/7 radar kameraları və ANPR nömrəoxuma ilə monitorinq olunan ekoloji sahələr
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Şəhər Filtri:</span>
                  {(['ALL', 'Bakı', 'Gəncə', 'Şuşa'] as const).map((city) => (
                    <button
                      key={city}
                      onClick={() => setZoneCityFilter(city)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        zoneCityFilter === city
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {city === 'ALL' ? 'Hamısı' : city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zones Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredZones.map((zone) => {
                  const isSelected = selectedZoneId === zone.id;
                  const aqiColor =
                    zone.currentAqi <= 30
                      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
                      : zone.currentAqi <= 50
                      ? 'text-teal-400 bg-teal-950/60 border-teal-500/40'
                      : 'text-amber-400 bg-amber-950/60 border-amber-500/40';

                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {zone.category} • {zone.cityAz}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${aqiColor}`}>
                            AQI: {zone.currentAqi} (Hava İndeksi)
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm mb-1.5 leading-snug">{zone.nameAz}</h4>
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{zone.descriptionAz}</p>

                        <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5 mb-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">İcazə Verilən Standart:</span>
                            <span className="font-semibold text-emerald-400">{zone.minAllowedEuroClass}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Nəzarət Kameraları:</span>
                            <span className="font-semibold text-slate-200">{zone.cameraCount} ANPR Radarı</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Əhatə Dairəsi:</span>
                            <span className="font-semibold text-slate-200">{zone.areaKm2} km²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">İşləmə Rejimi:</span>
                            <span className="font-semibold text-slate-200">{zone.operatingHours}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {zone.keyLandmarksAz.map((lm) => (
                            <span key={lm} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/50">
                              📍 {lm}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                        <span className="text-xs text-slate-400">
                          Baza Rüsum: <strong className="text-emerald-400">{formatCurrency(convertAzn(zone.dailyBaseFeeAzn, currency), currency)}</strong> / gün
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedZoneId(zone.id);
                            setActiveTab('calculator');
                          }}
                          className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        >
                          Rüsumu Hesabla →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ECO-SCORE & TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Gauge & Summary Card */}
              <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="text-center mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Yaşıl Donanma İndeksi</span>
                    <h3 className="text-lg font-bold text-white mt-1">Avtomobil Eko-Skoru</h3>
                  </div>

                  {/* Circular Score Visualizer */}
                  <div className="relative mx-auto my-4 w-40 h-40 flex items-center justify-center rounded-full border-8 border-slate-800 bg-slate-950 shadow-inner">
                    <div
                      className="absolute inset-0 rounded-full border-8"
                      style={{
                        borderColor: ecoScoreResult.tierColor,
                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 ${100 - ecoScoreResult.totalScore}%)`,
                      }}
                    />
                    <div className="text-center z-10">
                      <span className="text-4xl font-extrabold text-white">{ecoScoreResult.totalScore}</span>
                      <span className="text-xs text-slate-400 block font-semibold">/ 100 bal</span>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: `${ecoScoreResult.tierColor}20`,
                        color: ecoScoreResult.tierColor,
                        borderColor: `${ecoScoreResult.tierColor}60`,
                      }}
                    >
                      {ecoScoreResult.tierLabelAz}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">LEZ Giriş Hüququ:</span>
                      <span className={`font-bold ${ecoScoreResult.isEligibleForLez ? 'text-emerald-400' : 'text-red-400'}`}>
                        {ecoScoreResult.isEligibleForLez ? '✅ İCAZƏ VERİLİR' : '⛔ GİRİŞ QADAĞANDIR'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mühərrik / Eko-Sinif:</span>
                      <span className="font-semibold text-slate-200">{customTelemetry.euroClass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yanacaq / Enerji:</span>
                      <span className="font-semibold text-slate-200">{customTelemetry.propulsion}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleGenerateCertificate}
                    disabled={!ecoScoreResult.isEligibleForLez}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-all shadow-md"
                  >
                    {ecoScoreResult.isEligibleForLez ? '📜 Rəsmi Eko-İcazə Şəhadətnaməsi Yarat' : '❌ Standarta Uyğun Deyil'}
                  </button>
                </div>
              </div>

              {/* Telemetry Sensor Tuning Sliders & Alerts */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <h4 className="font-bold text-white text-sm mb-3 flex items-center justify-between">
                    <span>OBD-II Tailpipe & Bort Sensor Telemetriyası</span>
                    <button
                      onClick={() => setCustomTelemetry(activePreset.telemetry)}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Zavod Parametrlərini Bərpa Et
                    </button>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Propulsion & Euro class */}
                    <div>
                      <label className="text-slate-400 block mb-1">Ekoloji Sinif (Euro Standard)</label>
                      <select
                        value={customTelemetry.euroClass}
                        onChange={(e) =>
                          setCustomTelemetry({
                            ...customTelemetry,
                            euroClass: e.target.value as EmissionEuroClass,
                          })
                        }
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white"
                      >
                        <option value="ZERO_EMISSION">Sıfır Emissiya (Tam Elektrikli / EV / Hydrogen)</option>
                        <option value="EURO_6D">Avro-6d (Ən Son Təmiz Yanma Standartı)</option>
                        <option value="EURO_6">Avro-6 (Standard DPF + SCR)</option>
                        <option value="EURO_5">Avro-5 (Köhnə DPF Standartı)</option>
                        <option value="EURO_4">Avro-4 (Şəhər Üzrə Minimal Tarixi Hədd)</option>
                        <option value="EURO_3">Avro-3 (LEZ Girişi Məhdudlaşdırılmış)</option>
                        <option value="EURO_2_BELOW">Avro-2 və daha aşağı (Tam Qadağan)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Mühərrik Tipi / Güc Aqreqatı</label>
                      <select
                        value={customTelemetry.propulsion}
                        onChange={(e) =>
                          setCustomTelemetry({
                            ...customTelemetry,
                            propulsion: e.target.value as VehiclePropulsionType,
                          })
                        }
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white"
                      >
                        <option value="ELECTRIC">Tam Elektrikli (BEV)</option>
                        <option value="HYBRID">Hibrid (HEV)</option>
                        <option value="PLUG_IN_HYBRID">Qoşulan Hibrid (PHEV)</option>
                        <option value="PETROL">Benzin (ICE)</option>
                        <option value="DIESEL">Dizel (Turbocharged DPF)</option>
                        <option value="CNG_LNG">Sıxılmış Qaz (CNG/LNG)</option>
                        <option value="HYDROGEN">Hidrogen Yanacaq Elementi (FCEV)</option>
                      </select>
                    </div>

                    {/* CO2 Emissions */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>CO2 Tullantısı:</span>
                        <strong className="text-white">{customTelemetry.co2GramsPerKm} q/km</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="350"
                        value={customTelemetry.co2GramsPerKm}
                        onChange={(e) =>
                          setCustomTelemetry({ ...customTelemetry, co2GramsPerKm: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    {/* NOx Emissions */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>NOx Azot Oksidi:</span>
                        <strong className="text-white">{customTelemetry.noxMgPerKm} mq/km</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={customTelemetry.noxMgPerKm}
                        onChange={(e) =>
                          setCustomTelemetry({ ...customTelemetry, noxMgPerKm: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    {/* DPF Backpressure */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>DPF Əks-Təzyiqi:</span>
                        <strong className="text-white">{customTelemetry.dpfBackpressureMbar} mbar</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customTelemetry.dpfBackpressureMbar}
                        onChange={(e) =>
                          setCustomTelemetry({ ...customTelemetry, dpfBackpressureMbar: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    {/* AdBlue DEF Level */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>AdBlue / DEF Səviyyəsi:</span>
                        <strong className="text-white">{customTelemetry.adBlueLevelPercent}%</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customTelemetry.adBlueLevelPercent}
                        onChange={(e) =>
                          setCustomTelemetry({ ...customTelemetry, adBlueLevelPercent: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    {/* Smoke Opacity K-factor */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Tüstülənmə K-Əmsalı:</span>
                        <strong className="text-white">{customTelemetry.tailpipeSmokeOpacityK} m⁻¹</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2.5"
                        step="0.05"
                        value={customTelemetry.tailpipeSmokeOpacityK}
                        onChange={(e) =>
                          setCustomTelemetry({ ...customTelemetry, tailpipeSmokeOpacityK: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    {/* Acoustic Noise */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Akustik Səs-Küy:</span>
                        <strong className="text-white">{customTelemetry.noiseLevelDb} dB</strong>
                      </div>
                      <input
                        type="range"
                        min="55"
                        max="95"
                        value={customTelemetry.noiseLevelDb}
                        onChange={(e) =>
                          setCustomTelemetry({ ...customTelemetry, noiseLevelDb: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Warnings & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <h5 className="font-bold text-amber-400 text-xs mb-2 flex items-center gap-1.5">
                      ⚠️ Aşkar Edilmiş Xəbərdarlıqlar ({ecoScoreResult.warningsAz.length})
                    </h5>
                    {ecoScoreResult.warningsAz.length === 0 ? (
                      <p className="text-xs text-emerald-400">Heç bir ekoloji anomaliya aşkar edilmədi. Sistem idealdır.</p>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {ecoScoreResult.warningsAz.map((w, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <h5 className="font-bold text-emerald-400 text-xs mb-2 flex items-center gap-1.5">
                      💡 Ekoloji Tövsiyələr & Reqlament
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {ecoScoreResult.recommendationsAz.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">✔</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERMIT & TOLL CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="font-bold text-white text-sm">LEZ Giriş Rüsumu & Karbon Ofseti Parametrləri</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Məqsəd Zonası</label>
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white"
                      >
                        {MOCK_LEZ_ZONES.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.nameAz} ({z.cityAz})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Giriş Müddəti (Gün sayı)</label>
                      <select
                        value={durationDays}
                        onChange={(e) => setDurationDays(Number(e.target.value))}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white"
                      >
                        <option value={1}>1 Günlük Tranzit Giriş</option>
                        <option value={7}>7 Günlük Həftəlik Abunəlik</option>
                        <option value={30}>30 Günlük Aylıq İcazə</option>
                        <option value={365}>1 İllik Rəsmi Donanma İcazəsi</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={isRushHour}
                        onChange={(e) => setIsRushHour(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-white">Pik Saatlar Ərzində Hərəkət Rejimi (+50% Rüsum)</span>
                        <p className="text-slate-400 text-[11px]">Səhər 08:00 - 10:00 və axşam 17:00 - 20:00 saatlarında tıxac əleyhinə tənzimləmə</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={includeTreeOffset}
                        onChange={(e) => setIncludeTreeOffset(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-emerald-300">🌱 Könüllü Karbon Kompensasiyası (Ağacəkmə Fondu - 5 ₼/gün)</span>
                        <p className="text-slate-400 text-[11px]">ETSN Yaşıl Dünya fondu vasitəsilə gündəlik 2 ədəd Eldar şamı və ya çinar əkilməsi</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Statutory warning / restriction card */}
                {(!permitCostResult.isAccessPermitted || permitCostResult.restrictionReasonAz) && (
                  <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 text-xs">
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                      <span>⛔ İCAZƏ MƏHDUDİYYƏTİ VƏ CƏRİMƏ XƏBƏRDARLIĞI</span>
                    </div>
                    <p className="text-slate-300 mb-2">{permitCostResult.restrictionReasonAz}</p>
                    {permitCostResult.statutoryFineNoticeAz && (
                      <p className="text-amber-300 font-medium">{permitCostResult.statutoryFineNoticeAz}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Cost Breakdown Receipt Card */}
              <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2 mb-3">
                    Rəsmi Ödəniş Hesabatı
                  </h4>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Baza Tarif:</span>
                      <span>{formatCurrency(convertAzn(permitCostResult.zoneBaseRateAzn, currency), currency)} / gün</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Eko-Sinif Əmsalı:</span>
                      <span className="font-bold text-emerald-400">
                        {permitCostResult.euroMultiplier === 0 ? '0.0x (Sıfır Rüsum)' : `${permitCostResult.euroMultiplier}x`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Müddət:</span>
                      <span>{durationDays} gün</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pik Saat Artımı:</span>
                      <span>{formatCurrency(convertAzn(permitCostResult.rushHourSurchargeAzn, currency), currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yaşıl Ağacəkmə Töhfəsi:</span>
                      <span className="text-emerald-300">
                        {formatCurrency(convertAzn(permitCostResult.carbonOffsetAzn, currency), currency)}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm">
                      <span className="font-bold text-white">Yekun Məbləğ:</span>
                      <span className="font-extrabold text-lg text-emerald-400">
                        {formatCurrency(permitCostResult.totalConverted, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleGenerateCertificate}
                    disabled={!permitCostResult.isAccessPermitted}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-all shadow-md"
                  >
                    {permitCostResult.isAccessPermitted ? 'Rüsumu Təsdiqlə və İcazə Al' : 'Giriş Hüququ Yoxdur'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10-POINT ECO CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <div>
                  <h4 className="font-bold text-white text-sm">10-Bəndlik Texniki & Ekoloji Yoxlama Siyahısı</h4>
                  <p className="text-xs text-slate-400">
                    ETSN və BDYP dövlət texniki müayinə protokolu üzrə məcburi kriteriyalar
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 block">
                      Uyğunluq: {checklistResult.passedCount} / {checklistResult.totalCount} ({checklistResult.scorePercentage}%)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Kritik Bəndlər: {checklistResult.isAllCriticalPassed ? '✅ Tam Saz' : '❌ Nöqsan Var'}
                    </span>
                  </div>
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50"
                  >
                    Hamısını Təsdiqlə
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 text-slate-400 hover:text-white"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_ECO_CHECKLIST.map((item) => {
                  const isChecked = !!checkedMap[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-900/80 border-emerald-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 pointer-events-none"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.code}
                          </span>
                          {item.isCritical && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-500/30">
                              KRİTİK
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">{item.category}</span>
                        </div>
                        <h5 className="font-semibold text-white text-xs mb-1">{item.titleAz}</h5>
                        <p className="text-[11px] text-slate-400 mb-1.5">{item.standardRequirementAz}</p>
                        <span className="text-[10px] text-emerald-400/80 font-mono">
                          Hüquqi əsas: {item.legalReference}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORY EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <div>
                  <h4 className="font-bold text-white text-sm">Ekoloji Maarifləndirmə & LEZ İmtahan Simulyatoru</h4>
                  <p className="text-xs text-slate-400">
                    Sürücülər və logistika menecerləri üçün 10 rəsmi ekoloji və qanunvericilik testi
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300">
                    Cavablandırıldı: {Object.keys(examAnswers).length} / {MOCK_ECO_EXAM_QUESTIONS.length}
                  </span>
                  {!isExamSubmitted ? (
                    <button
                      onClick={() => setIsExamSubmitted(true)}
                      disabled={Object.keys(examAnswers).length === 0}
                      className="px-3 py-1.5 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-colors"
                    >
                      İmtahanı Bitir və Nəticəni Yoxla
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setExamAnswers({});
                        setIsExamSubmitted(false);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      Yenidən Başla
                    </button>
                  )}
                </div>
              </div>

              {isExamSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    examResult.isPassed
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/60 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{examResult.isPassed ? '🎉' : '❌'}</span>
                    <span>
                      {examResult.isPassed
                        ? `TƏBRİKLƏR! İmtahandan uğurla keçdiniz: ${examResult.correctCount} / ${examResult.totalCount} (${examResult.percentage}%)`
                        : `MÜVƏFFƏQİYYƏTSİZ: ${examResult.correctCount} / ${examResult.totalCount} (${examResult.percentage}%). Keçid balı: 80%`}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">ETSN Yaşıl Sürücü Sertifikasiyası</span>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_ECO_EXAM_QUESTIONS.map((q, qIdx) => {
                  const selected = examAnswers[q.id];
                  const isAnswered = selected !== undefined;
                  const isCorrect = selected === q.correctOptionIndex;

                  return (
                    <div key={q.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                          Sual {qIdx + 1} • {q.code}
                        </span>
                        {isExamSubmitted && isAnswered && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCorrect ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                            }`}
                          >
                            {isCorrect ? 'DÜZGÜN' : 'SƏHV'}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-white text-sm mb-3">{q.questionAz}</h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          let btnStyle = 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (isOptionSelected) {
                            btnStyle = 'bg-emerald-950/80 border-emerald-500 text-white font-semibold ring-1 ring-emerald-500';
                          }

                          if (isExamSubmitted) {
                            if (optIdx === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-900/50 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = 'bg-red-950/80 border-red-500 text-red-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectExamOption(q.id, optIdx)}
                              className={`text-left p-2.5 rounded-lg border transition-all ${btnStyle}`}
                            >
                              <span className="opacity-60 mr-1.5 font-mono">{String.fromCharCode(65 + optIdx)})</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-300 space-y-1">
                          <p>
                            <strong className="text-emerald-400">İzah:</strong> {q.explanationAz}
                          </p>
                          <p className="text-slate-500 font-mono">Hüquqi İstinad: {q.legalCitation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL CERTIFICATE & PUBLIC REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Generated Certificate Display */}
              {certificateData ? (
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  {/* Decorative stamp watermark */}
                  <div className="absolute right-6 top-6 opacity-10 pointer-events-none text-emerald-400 text-8xl font-black rotate-12">
                    ETSN
                  </div>

                  {/* Certificate Top Header */}
                  <div className="border-b border-emerald-500/30 pb-4 mb-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-2xl">
                        🌿
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                          AZƏRBAYCAN RESPUBLİKASI EKOLOGİYA VƏ TƏBİİ SƏRVƏTLƏR NAZİRLİYİ • AYNA
                        </div>
                        <h3 className="text-base md:text-lg font-extrabold text-white">
                          ŞƏHƏR AŞAĞI EMİSSİYA ZONASI (LEZ) GİRİŞ ŞƏHADƏTNAMƏSİ
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-500/40">
                        {certificateData.certificateId}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">Status: AKTİV VƏ ETİBARLI</span>
                    </div>
                  </div>

                  {/* Certificate Body Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px] block">Nəqliyyat Vasitəsi & Qeydiyyat</span>
                      <p className="font-bold text-white text-sm">{certificateData.vehiclePlate}</p>
                      <p className="text-slate-400 font-mono text-[11px]">VIN: {certificateData.vin}</p>
                      <p className="text-slate-300 text-[11px]">Sahib: {certificateData.carrierOrOwner}</p>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px] block">Ekoloji Göstəricilər & Skor</span>
                      <p className="font-bold text-emerald-400 text-sm">
                        Eko-Skor: {certificateData.ecoScore} / 100
                      </p>
                      <p className="text-slate-300 text-[11px]">Sinif: {certificateData.euroClass}</p>
                      <p className="text-slate-300 text-[11px]">Güc Aqreqatı: {certificateData.propulsion}</p>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px] block">Təyin Olunmuş LEZ Zonası</span>
                      <p className="font-bold text-white text-sm">{certificateData.zoneNameAz}</p>
                      <p className="text-slate-300 text-[11px]">Saatlar: {certificateData.permittedHours}</p>
                      <p className="text-emerald-400 text-[11px]">
                        Ağacəkmə Fondu: {certificateData.carbonOffsetTreesFunded} Ağac Əkildi
                      </p>
                    </div>
                  </div>

                  {/* Security Footprint & SİMA UID */}
                  <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
                    <div>
                      <span>Rəqəmsal İmza UID: </span>
                      <strong className="text-slate-200">{certificateData.simaDigitalUid}</strong>
                      <span className="mx-2">•</span>
                      <span>Verilmə Tarixi: </span>
                      <strong className="text-slate-200">{certificateData.issueDate}</strong>
                      <span className="mx-2">•</span>
                      <span>Bitmə Tarixi: </span>
                      <strong className="text-slate-200">{certificateData.validUntil}</strong>
                    </div>
                    <div className="text-emerald-400 font-semibold">
                      {certificateData.sha256SecurityChecksum}
                    </div>
                  </div>

                  {/* Certificate Action Buttons */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleCopyCertificate}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      📋 Məlumatları Kopyala
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      🖨️ Çap Et (PDF)
                    </button>
                    {copyFeedback && (
                      <span className="text-xs text-emerald-400 font-medium">{copyFeedback}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-6">
                  <span className="text-3xl block mb-2">📜</span>
                  <p className="text-sm font-bold text-white mb-1">Aktiv Eko-İcazə Şəhadətnaməsi Seçilməyib</p>
                  <p className="text-xs text-slate-400 mb-4">
                    "Eko-Skor & Telemetriya" və ya "İcazə & Rüsum Kalkulyatoru" bölməsindən rəsmi şəhadətnamə generasiya edə bilərsiniz.
                  </p>
                  <button
                    onClick={handleGenerateCertificate}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Cari Nəqliyyat üçün Şəhadətnamə Yarat
                  </button>
                </div>
              )}

              {/* Public Unified Registry Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">Vahid Dövlət LEZ Eko-İcazələr Reyestri</h4>
                    <p className="text-xs text-slate-400">Verilmiş aktiv şəhadətnamələrin ictimai axtarış və verifikasiya bazası</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Dövlət nömrəsi və ya №..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Şəhadətnamə №</th>
                        <th className="py-2.5 px-3">Nömrə / VIN</th>
                        <th className="py-2.5 px-3">Sahib / Daşıyıcı</th>
                        <th className="py-2.5 px-3">Eko-Sinif / Skor</th>
                        <th className="py-2.5 px-3">Təyin Olunmuş Zona</th>
                        <th className="py-2.5 px-3">Etibarlılıq</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredPermits.map((p) => (
                        <tr key={p.certificateId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{p.certificateId}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white block">{p.vehiclePlate}</span>
                            <span className="font-mono text-[10px] text-slate-400">{p.vin}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-200">{p.carrierOrOwner}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-emerald-400">{p.ecoScore}/100</span>
                            <span className="text-[10px] text-slate-400 block">{p.euroClass}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-200">{p.zoneNameAz}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">{p.validUntil}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              AKTİV
                            </span>
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

        {/* Modal Bottom Footer */}
        <div className="border-t border-slate-800 bg-slate-900/80 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ETSN & AYNA Dövlət İntellektual Şəbəkəsi Sinxronlaşdırılıb</span>
          </div>
          <div>
            <button
              onClick={onClose}
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
