import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types/vehicle';
import {
  MilitaryBranch,
  MilitaryVehicleCategory,
  MilitaryCertificate,
  formatBlackMilitaryPlate,
  parseBlackMilitaryPlate,
  calculateMilitaryReadinessScore,
  calculateMobilizationCompensation,
  calculateConvoyParameters,
  gradeMilitaryExam,
  generateMilitaryCertificate,
  MILITARY_DAILY_TARIFFS,
  STATUTORY_FUEL_PRICES,
} from '../utils/militaryDutyCompliance';
import {
  MOCK_MILITARY_READINESS_ITEMS,
  MOCK_CONVOY_SCENARIOS,
  MOCK_MOBILIZATION_DIVISIONS,
  MOCK_MILITARY_PRESET_VEHICLES,
  MOCK_MILITARY_EXAM_QUESTIONS,
  MOCK_MILITARY_CERTIFICATES,
  MilitaryPresetVehicle,
} from '../data/mockMilitaryDutyData';

export interface MilitaryDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  lang?: 'az' | 'en' | 'ru';
  currency?: 'AZN' | 'USD' | 'EUR';
}

export type MilitaryTabType = 'audit' | 'convoy' | 'calculator' | 'divisions' | 'exam' | 'certificate';

export const MilitaryDutyModal: React.FC<MilitaryDutyModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  lang = 'az',
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<MilitaryTabType>('audit');

  // Selected vehicle preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-land-cruiser');
  const currentPreset = useMemo(
    () => MOCK_MILITARY_PRESET_VEHICLES.find((p) => p.id === selectedPresetId) || MOCK_MILITARY_PRESET_VEHICLES[0],
    [selectedPresetId]
  );

  // Black plate state
  const [militaryPlate, setMilitaryPlate] = useState<string>(() => currentPreset.militaryPlate);
  const [selectedBranch, setSelectedBranch] = useState<MilitaryBranch>(() => currentPreset.branch);
  const [civilianPlate, setCivilianPlate] = useState<string>(() => vehicle?.plateNumber || currentPreset.civilianPlate);

  // Technical Readiness Audit state
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>(() => currentPreset.initialCheckedItems);

  // Convoy March simulation state
  const [selectedScenarioTerrain, setSelectedScenarioTerrain] = useState<'urban' | 'highway' | 'unpaved' | 'mountain'>('highway');
  const [convoySpeedKmH, setConvoySpeedKmH] = useState<number>(60);
  const [isAdverseWeather, setIsAdverseWeather] = useState<boolean>(false);

  // Requisition & Compensation state
  const [compensationCategory, setCompensationCategory] = useState<MilitaryVehicleCategory>('full_suv');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [dailyKm, setDailyKm] = useState<number>(150);
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('diesel');
  const [consumptionRate, setConsumptionRate] = useState<number>(12.0);

  // Divisions radar state
  const [divisionSearchQuery, setDivisionSearchQuery] = useState<string>('');
  const [bookingSuccessDivisionId, setBookingSuccessDivisionId] = useState<string | null>(null);

  // Theoretical exam state
  const [userExamAnswers, setUserExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Active certificate & registry state
  const [certificatesList, setCertificatesList] = useState<MilitaryCertificate[]>(MOCK_MILITARY_CERTIFICATES);
  const [activeCertificate, setActiveCertificate] = useState<MilitaryCertificate>(() => MOCK_MILITARY_CERTIFICATES[0]);
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // When a preset is chosen, update parameters
  const handleSelectPreset = (preset: MilitaryPresetVehicle) => {
    setSelectedPresetId(preset.id);
    setMilitaryPlate(preset.militaryPlate);
    setSelectedBranch(preset.branch);
    setCivilianPlate(preset.civilianPlate);
    setCheckedItemIds(preset.initialCheckedItems);
    setCompensationCategory(preset.category);
    setFuelType(preset.fuelType);
    setConsumptionRate(preset.consumptionPer100Km);
  };

  // Toggle audit checklist item
  const handleToggleItem = (id: string) => {
    setCheckedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllItems = () => {
    setCheckedItemIds(MOCK_MILITARY_READINESS_ITEMS.map((item) => item.id));
  };

  // Readiness score computation
  const readinessResult = useMemo(
    () => calculateMilitaryReadinessScore(checkedItemIds, MOCK_MILITARY_READINESS_ITEMS),
    [checkedItemIds]
  );

  // Convoy parameters computation
  const convoyResult = useMemo(
    () => calculateConvoyParameters(convoySpeedKmH, isAdverseWeather),
    [convoySpeedKmH, isAdverseWeather]
  );

  // Compensation calculation
  const compensationResult = useMemo(
    () =>
      calculateMobilizationCompensation({
        category: compensationCategory,
        durationDays,
        estimatedKmPerDay: dailyKm,
        fuelType,
        consumptionPer100Km: consumptionRate,
      }),
    [compensationCategory, durationDays, dailyKm, fuelType, consumptionRate]
  );

  // Exam result
  const examResult = useMemo(
    () => gradeMilitaryExam(userExamAnswers, MOCK_MILITARY_EXAM_QUESTIONS),
    [userExamAnswers]
  );

  // Filter divisions
  const filteredDivisions = useMemo(() => {
    const q = divisionSearchQuery.toLowerCase().trim();
    if (!q) return MOCK_MOBILIZATION_DIVISIONS;
    return MOCK_MOBILIZATION_DIVISIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.officerInCharge.toLowerCase().includes(q)
    );
  }, [divisionSearchQuery]);

  // Filter registry certificates
  const filteredCertificates = useMemo(() => {
    const q = registrySearch.toLowerCase().trim();
    if (!q) return certificatesList;
    return certificatesList.filter(
      (c) =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.civilianPlate.toLowerCase().includes(q) ||
        c.militaryPlate.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.ownerFin.toLowerCase().includes(q)
    );
  }, [certificatesList, registrySearch]);

  // Generate new certificate from current state
  const handleGenerateCertificate = () => {
    const newCert = generateMilitaryCertificate({
      civilianPlate: civilianPlate || '99-MN-050',
      militaryPlate: formatBlackMilitaryPlate(militaryPlate, selectedBranch),
      branch: selectedBranch,
      category: compensationCategory,
      ownerName: 'Həsənov Rəşad İlham oğlu',
      ownerFin: '5KJH892',
      chassisNumber: currentPreset.chassisNumber,
      readinessScore: readinessResult.score,
      readinessGrade: readinessResult.grade,
      readinessLevel: readinessResult.statusLabel,
      dailyCompensationRate: MILITARY_DAILY_TARIFFS[compensationCategory] || 60.0,
      notes: `Hərbi-nəqliyyat vəzifəsi qeydiyyatı. Hazırlıq: ${readinessResult.percentage}%. Taktiki eşelon: ${readinessResult.statusLabel}`,
    });

    setCertificatesList((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  // Copy code with feedback
  const handleCopyCode = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyFeedback(`${label} kopyalandı!`);
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  // Print certificate
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="military-duty-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/80 p-4 sm:p-5 border-b border-emerald-800/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 font-black text-xl shadow-inner">
              🎖️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-bold bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
                  SHXÇDX & MN Rəsmi Portalı
                </span>
                <span className="text-xs text-slate-400">HNV Qanunu № 759</span>
              </div>
              <h2
                id="military-duty-modal-title"
                className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mt-0.5"
              >
                Hərbi-Nəqliyyat Vəzifəsi & Qara Qeydiyyat Nişanları
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Bağla"
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/90 overflow-x-auto scrollbar-none px-2 sm:px-4">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🛡️</span>
            <span>10-Bəndlik Hazırlıq & Qara Nişan</span>
          </button>
          <button
            onClick={() => setActiveTab('convoy')}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'convoy'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🚚</span>
            <span>Taktiki Kolon Marşı</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💰</span>
            <span>Səfərbərlik Kompensasiyası</span>
          </button>
          <button
            onClick={() => setActiveTab('divisions')}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'divisions'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏢</span>
            <span>SHXÇDX İdarələri</span>
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'exam'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📝</span>
            <span>Nəzəri İmtahan</span>
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-3 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'certificate'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📜</span>
            <span>Elektron Şəhadətnamə</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: AUDIT & BLACK PLATE */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Taktiki Nəqliyyat Nümunəsi Seçin:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {MOCK_MILITARY_PRESET_VEHICLES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedPresetId === preset.id
                          ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-lg'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{preset.name.split(' ')[0]} {preset.name.split(' ')[1]}</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{preset.militaryPlate}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{preset.clearanceMm} mm klirens</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visualizer & Quick Specs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Authentic Black License Plate */}
                <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 mb-3 font-semibold">
                    Azərbaycan Respublikası Hərbi Qeydiyyat Nişanı (YHQ Maddə 27)
                  </span>

                  {/* Black Plate Frame */}
                  <div className="w-full max-w-sm h-24 bg-black border-4 border-slate-800 rounded-xl flex items-center shadow-2xl px-3 relative overflow-hidden select-none">
                    {/* Left AZ Blue Band */}
                    <div className="w-12 h-full bg-blue-700 flex flex-col items-center justify-between py-1.5 -ml-3 px-1 border-r-2 border-black/80">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-white tracking-tighter">AZ</span>
                        {/* Mini Flag */}
                        <div className="w-5 h-3 flex flex-col mt-0.5 rounded-sm overflow-hidden border border-white/20">
                          <div className="h-1 bg-cyan-500"></div>
                          <div className="h-1 bg-red-600 flex items-center justify-center">
                            <span className="text-[4px] text-white">☪</span>
                          </div>
                          <div className="h-1 bg-emerald-600"></div>
                        </div>
                      </div>
                      <span className="text-[8px] text-blue-200 font-mono">ARM</span>
                    </div>

                    {/* License Plate Digits & Letters */}
                    <div className="flex-1 flex items-center justify-center space-x-3 text-white font-mono font-black text-3xl sm:text-4xl tracking-widest pl-2">
                      <span>{formatBlackMilitaryPlate(militaryPlate, selectedBranch)}</span>
                    </div>

                    {/* Embossed Microchip Indicator */}
                    <div className="absolute right-2 top-2 w-4 h-4 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    </div>
                  </div>

                  {/* Plate Customizer Inputs */}
                  <div className="w-full grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Qoşun Qolu / Qurum:</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => {
                          const br = e.target.value as MilitaryBranch;
                          setSelectedBranch(br);
                          setMilitaryPlate(formatBlackMilitaryPlate(militaryPlate, br));
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="MN">MN — Müdafiə Nazirliyi</option>
                        <option value="DQ">DQ — Daxili Qoşunlar</option>
                        <option value="DSX">DSX — Sərhəd Xidməti</option>
                        <option value="DTX">DTX — Təhlükəsizlik Xidməti</option>
                        <option value="SHX">SHX — Səfərbərlik Xidməti</option>
                        <option value="HQ">HQ — Hərbi Prokurorluq</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Mülki Dövlət Qeydiyyatı:</label>
                      <input
                        type="text"
                        value={civilianPlate}
                        onChange={(e) => setCivilianPlate(e.target.value.toUpperCase())}
                        placeholder="Məs. 99-MN-050"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Score & Gauge */}
                <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                        Hərbi-Texniki Hazırlıq İndeksi
                      </span>
                      <h3 className="text-2xl font-black text-white mt-1">
                        {readinessResult.score} / {readinessResult.maxScore} Bal ({readinessResult.percentage}%)
                      </h3>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        readinessResult.grade === 'category_1_ready'
                          ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                          : readinessResult.grade === 'category_2_minor'
                          ? 'border-yellow-500/60 bg-yellow-950/40 text-yellow-300'
                          : 'border-red-500/60 bg-red-950/40 text-red-300'
                      }`}
                    >
                      {readinessResult.grade === 'category_1_ready'
                        ? '1-ci Dərəcə Tam Yararlı'
                        : readinessResult.grade === 'category_2_minor'
                        ? '2-ci Dərəcə Məhdud Yararlı'
                        : '3-cü Dərəcə Yararsız'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        readinessResult.percentage >= 80
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                          : readinessResult.percentage >= 50
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                          : 'bg-gradient-to-r from-red-600 to-red-400'
                      }`}
                      style={{ width: `${readinessResult.percentage}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    {readinessResult.statusLabel}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllItems}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-colors border border-slate-700"
                    >
                      ✓ Bütün Bəndləri Təsdiqlə
                    </button>
                    <button
                      onClick={handleGenerateCertificate}
                      disabled={!readinessResult.eligibleForMobilization}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
                        readinessResult.eligibleForMobilization
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Şəhadətnamə Yarat →
                    </button>
                  </div>
                </div>
              </div>

              {/* 10-Point Technical Checklist */}
              <div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                  10-Mərhələli Hərbi-Texniki Hazırlıq Reqlamenti:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MOCK_MILITARY_READINESS_ITEMS.map((item) => {
                    const isChecked = checkedItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                          isChecked
                            ? 'border-emerald-600/50 bg-emerald-950/20 shadow-sm'
                            : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          className="mt-1 w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{item.title}</span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                              +{item.points} bal
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">
                            {item.legalRef}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONVOY MARCH & SPEED */}
          {activeTab === 'convoy' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Yol Hərəkəti Qaydaları Maddə 42 & 48
                </span>
                <h3 className="text-lg font-bold text-white">
                  Taktiki Hərbi Kolon Marş Simulyatoru & Sürət Tənzimi
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kolonda hərəkət zamanı maşınlararası təhlükəsizlik məsafəsi, hava şəraiti əmsalı və VAI müşayiət rejimi.
                </p>
              </div>

              {/* Scenario Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {MOCK_CONVOY_SCENARIOS.map((sc) => (
                  <button
                    key={sc.terrain}
                    onClick={() => {
                      setSelectedScenarioTerrain(sc.terrain);
                      setConvoySpeedKmH(sc.speedKmH);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedScenarioTerrain === sc.terrain
                        ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-lg'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{sc.label}</div>
                    <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                      {sc.speedKmH} km/saat
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 line-clamp-2">{sc.notes}</div>
                  </button>
                ))}
              </div>

              {/* Dynamic Controls */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-300">Kolon Sürəti:</label>
                      <span className="text-base font-black font-mono text-emerald-400">
                        {convoySpeedKmH} km/saat
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={5}
                      value={convoySpeedKmH}
                      onChange={(e) => setConvoySpeedKmH(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>10 km/saat</span>
                      <span>50 km/saat</span>
                      <span>90 km/saat</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Çətin Hava Şəraiti (Yağış/Qar/Duman)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Məsafə əmsalı 2.0x artırılır</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isAdverseWeather}
                      onChange={(e) => setIsAdverseWeather(e.target.checked)}
                      className="w-5 h-5 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Convoy Telemetry Display */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-semibold block">Tövsiyə Olunan Məsafə (D):</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                      {convoyResult.recommendedDistanceMeters} metr
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Düstur: v × {isAdverseWeather ? '2.0' : '1.5'}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-semibold block">Tormoz və Reaksiya Zolağı:</span>
                    <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                      {convoyResult.minSafetySpacing} metr
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Reaksiya müddəti: {convoyResult.reactionTimeSeconds} san
                    </span>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-semibold block">Operativ Rejim:</span>
                    <span className="text-xs font-bold text-white mt-1 block leading-snug">
                      {convoyResult.escortMode}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                      YHQ Maddə 48 / İXM 327.1
                    </span>
                  </div>
                </div>

                {/* Convoy March Visual Flowchart */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                    Kolon Sxemi və Nizamı:
                  </span>
                  <div className="flex items-center justify-between overflow-x-auto py-2 px-1">
                    <div className="flex flex-col items-center min-w-[100px]">
                      <span className="text-2xl">🚔</span>
                      <span className="text-[10px] font-bold text-blue-400 mt-1">Ön Patrul (VAI)</span>
                      <span className="text-[9px] text-slate-500">Göy-Qırmızı Mayak</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-2">
                      <div className="w-full h-0.5 bg-dashed bg-slate-700 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-slate-900 px-2 text-[10px] font-mono text-emerald-400 border border-slate-800 rounded">
                            {convoyResult.recommendedDistanceMeters} m
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[100px]">
                      <span className="text-2xl">🚛</span>
                      <span className="text-[10px] font-bold text-emerald-400 mt-1">Hərbi Kolon</span>
                      <span className="text-[9px] text-slate-500">Məsafə fənəri</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-2">
                      <div className="w-full h-0.5 bg-dashed bg-slate-700 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-slate-900 px-2 text-[10px] font-mono text-emerald-400 border border-slate-800 rounded">
                            {convoyResult.recommendedDistanceMeters} m
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center min-w-[100px]">
                      <span className="text-2xl">🚙</span>
                      <span className="text-[10px] font-bold text-amber-400 mt-1">Arxa Mühafizə</span>
                      <span className="text-[9px] text-slate-500">Sarı/Narıncı Mayak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  HNV Qanunu Maddə 11 & 12
                </span>
                <h3 className="text-lg font-bold text-white">
                  Səfərbərlik Təlimi İcarə Kompensasiyası & Yanacaq Təminatı
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mülki nəqliyyatın müdafiə ehtiyacları və ya hərbi toplanışlara cəlb edildiyi günlər üçün rəsmi dövlət kompensasiyası kalkulyatoru.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs */}
                <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Nəqliyyat Kateqoriyası:
                    </label>
                    <select
                      value={compensationCategory}
                      onChange={(e) => setCompensationCategory(e.target.value as MilitaryVehicleCategory)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="compact_suv">Kompakt 4x4 SUV (Niva, Duster) — 40 AZN/gün</option>
                      <option value="full_suv">Tam Ölçülü 4x4 SUV (Land Cruiser, Patrol) — 60 AZN/gün</option>
                      <option value="pickup_4x4">4x4 Ağır Pikap (Hilux, L200, D-Max) — 55 AZN/gün</option>
                      <option value="heavy_truck_6x6">Ağır 6x6 / 4x4 Yük (KamAZ, Ural) — 90 AZN/gün</option>
                      <option value="tactical_bus">Taktiki Şəxsi Heyət Avtobusu — 75 AZN/gün</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-400">Toplanış Müddəti (Gün):</label>
                      <span className="text-xs font-mono font-bold text-emerald-400">{durationDays} gün</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={90}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-400">Gündəlik Taktiki Yürüş (km):</label>
                      <span className="text-xs font-mono font-bold text-emerald-400">{dailyKm} km/gün</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={500}
                      step={10}
                      value={dailyKm}
                      onChange={(e) => setDailyKm(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Yanacaq Növü:</label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value as 'petrol' | 'diesel')}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="diesel">Dizel (1.00 AZN/L)</option>
                        <option value="petrol">Aİ-92 Benzin (1.10 AZN/L)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Sərfiyyat (L/100km):</label>
                      <input
                        type="number"
                        min={5}
                        max={50}
                        step={0.5}
                        value={consumptionRate}
                        onChange={(e) => setConsumptionRate(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      Maliyyə Hesabatı & Kompensasiya:
                    </span>

                    <div className="space-y-3 mt-4 text-xs">
                      <div className="flex justify-between py-2 border-b border-slate-800">
                        <span className="text-slate-400">Sutkalıq İcarə Tarifi:</span>
                        <span className="font-mono font-bold text-white">{compensationResult.dailyRateAZN.toFixed(2)} AZN</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800">
                        <span className="text-slate-400">Cəmi İcarə Dəyəri ({durationDays} gün):</span>
                        <span className="font-mono font-bold text-white">{compensationResult.totalRentalAZN.toFixed(2)} AZN</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800">
                        <span className="text-slate-400">Ümumi Yürüş ({compensationResult.estimatedKm} km):</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {compensationResult.estimatedFuelLiters} L yanacaq
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800">
                        <span className="text-slate-400">Yanacaq Kompensasiyası:</span>
                        <span className="font-mono font-bold text-white">{compensationResult.fuelCostAZN.toFixed(2)} AZN</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-600/40 mt-6">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                      Yekun Dövlət Kompensasiyası:
                    </span>
                    <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                      {compensationResult.totalCompensationAZN.toLocaleString('az-AZ')} ₼
                    </div>
                    <div className="flex space-x-3 text-xs text-slate-400 font-mono mt-1">
                      <span>≈ ${compensationResult.totalCompensationUSD.toLocaleString('en-US')} USD</span>
                      <span>•</span>
                      <span>≈ €{compensationResult.totalCompensationEUR.toLocaleString('de-DE')} EUR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MOBILIZATION DIVISIONS RADAR */}
          {activeTab === 'divisions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    SHXÇDX Səfərbərlik İdarələri & Qərargah Radarı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Azərbaycan Respublikası üzrə hərbi-nəqliyyat uçotu aparan regional hərbi komissarlıqlar.
                  </p>
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={divisionSearchQuery}
                    onChange={(e) => setDivisionSearchQuery(e.target.value)}
                    placeholder="Rayon və ya şəhər axtar..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {bookingSuccessDivisionId && (
                <div className="bg-emerald-950/60 border border-emerald-500/60 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                  <span>✓ Növbə qəbulu uğurla qeydə alındı! SMS bildiriş göndərildi.</span>
                  <button
                    onClick={() => setBookingSuccessDivisionId(null)}
                    className="text-emerald-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDivisions.map((div) => (
                  <div
                    key={div.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {div.city} • {div.district}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {div.activeCapacityDaily} maşın/gün
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-2">{div.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{div.address}</p>

                      <div className="mt-3 pt-3 border-t border-slate-900 text-[11px] space-y-1">
                        <div className="text-slate-300">
                          <span className="text-slate-500">Zabit:</span> {div.officerInCharge} ({div.rank})
                        </div>
                        <div className="text-slate-300">
                          <span className="text-slate-500">Əlaqə:</span> {div.contactPhone}
                        </div>
                        <div className="text-slate-300">
                          <span className="text-slate-500">İş vaxtı:</span> {div.operatingHours}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingSuccessDivisionId(div.id)}
                      className="mt-4 w-full py-2 bg-slate-900 hover:bg-emerald-950 hover:border-emerald-700 text-xs font-bold text-slate-200 rounded-lg transition-colors border border-slate-800"
                    >
                      Qəbul Növbəsi Yazıl →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    Hərbi-Nəqliyyat Qanunvericiliyi İmtahanı
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    10-Suallıq Hərbi Kolon & Səfərbərlik Testi
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Keçid balı: ən azı 8/10 (80%). Bütün suallar qanunvericilik bəndləri ilə təmin edilib.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Nəticə:</span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      {examResult.score} / {examResult.total} ({examResult.percentage}%)
                    </span>
                  </div>
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl transition-colors shadow-lg"
                  >
                    Cavabları Yoxla
                  </button>
                </div>
              </div>

              {isExamSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    examResult.passed
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-red-950/60 border-red-500 text-red-300'
                  }`}
                >
                  <span>
                    {examResult.passed
                      ? '✓ TƏBRİKLƏR! Siz imtahanı uğurla verdiniz (Hərbi Kolon İdarəetmə Sertifikatı verilir).'
                      : '✕ TƏƏSSÜF Kİ, minimal keçid balı (80%) toplanmadı. Sualları yenidən nəzərdən keçirin.'}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {MOCK_MILITARY_EXAM_QUESTIONS.map((q, idx) => {
                  const userAnswer = userExamAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-white">
                          {idx + 1}. {q.question}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono ml-2 whitespace-nowrap">
                          {q.legalArticle}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          let optClass = 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-850';
                          if (userAnswer === optIdx) {
                            optClass = 'border-emerald-500 bg-emerald-950/40 text-white font-bold';
                          }
                          if (isExamSubmitted) {
                            if (optIdx === q.correctAnswerIndex) {
                              optClass = 'border-emerald-500 bg-emerald-900/60 text-emerald-200 font-bold';
                            } else if (userAnswer === optIdx && !isCorrect) {
                              optClass = 'border-red-500 bg-red-900/60 text-red-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                setUserExamAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx,
                                }))
                              }
                              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${optClass}`}
                            >
                              <span className="font-mono mr-1.5 opacity-60">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                          <span className="font-bold text-emerald-400">İzah:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {copyFeedback && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-xs text-emerald-300 text-center font-bold">
                  {copyFeedback}
                </div>
              )}

              {/* Certificate Document Visualizer */}
              <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border-2 border-emerald-600/40 shadow-2xl relative overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute right-4 bottom-4 text-9xl opacity-5 select-none pointer-events-none">
                  🎖️
                </div>

                {/* Document Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-800/40 pb-6 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-600 flex items-center justify-center text-3xl shadow-inner">
                      🇦🇿
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
                        Azərbaycan Respublikası Səfərbərlik və Hərbi Xidmətə Çağırış üzrə Dövlət Xidməti
                      </span>
                      <h2 className="text-xl font-black text-white mt-0.5">
                        Hərbi-Nəqliyyat Vəzifəsi Elektron Qeydiyyat Şəhadətnaməsi
                      </h2>
                      <span className="text-xs text-slate-400 font-mono">
                        Qeydiyyat №: {activeCertificate.certificateNumber}
                      </span>
                    </div>
                  </div>

                  {/* Black Plate Badge */}
                  <div className="h-12 bg-black border-2 border-slate-700 rounded-lg flex items-center px-3 shadow-lg select-none">
                    <div className="w-6 h-full bg-blue-700 flex flex-col items-center justify-center -ml-3 px-1 rounded-l-md mr-2">
                      <span className="text-[8px] font-bold text-white">AZ</span>
                    </div>
                    <span className="text-white font-mono font-black text-lg tracking-wider">
                      {activeCertificate.militaryPlate}
                    </span>
                  </div>
                </div>

                {/* Certificate Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Mülki Dövlət Qeydiyyatı:</span>
                    <span className="text-sm font-bold font-mono text-white mt-0.5 block">{activeCertificate.civilianPlate}</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Mülkiyyətçi & FİN:</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {activeCertificate.ownerName} ({activeCertificate.ownerFin})
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Şassi / VIN Kodu:</span>
                    <span className="text-sm font-mono font-bold text-white mt-0.5 block">{activeCertificate.chassisNumber}</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Hərbi Komissarlıq:</span>
                    <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{activeCertificate.mobilizationDivision}</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Hazırlıq Dərəcəsi:</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{activeCertificate.readinessLevel}</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Sutkalıq İcarə Tarifi:</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                      {activeCertificate.dailyCompensationRate.toFixed(2)} ₼ / gün
                    </span>
                  </div>
                </div>

                {/* SİMA Signature & QR Barcode */}
                <div className="pt-6 border-t border-emerald-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400">🛡️</span>
                      <span className="font-bold text-white">SİMA Rəqəmsal İmza Ştampı:</span>
                      <span className="font-mono text-slate-400">{activeCertificate.simaSignatureUid}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      SHA256: {activeCertificate.sha256Hash}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCode(activeCertificate.certificateNumber, 'Şəhadətnamə nömrəsi')}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-700 transition-colors"
                    >
                      Kodu Kopyala
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors"
                    >
                      🖨️ Çap Et
                    </button>
                  </div>
                </div>
              </div>

              {/* Unified Registry Search Table */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Vahid Hərbi-Nəqliyyat Reyestri Axtarışı:
                  </h3>
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      placeholder="Şəhadətnamə və ya nömrə axtar..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3">Qeydiyyat №</th>
                        <th className="py-2.5 px-3">Qara Hərbi Nişan</th>
                        <th className="py-2.5 px-3">Mülki Nömrə</th>
                        <th className="py-2.5 px-3">Mülkiyyətçi</th>
                        <th className="py-2.5 px-3">Tarix</th>
                        <th className="py-2.5 px-3 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredCertificates.map((cert) => (
                        <tr key={cert.certificateNumber} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                            {cert.certificateNumber}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-white">
                            <span className="bg-black text-white px-2 py-0.5 rounded border border-slate-700">
                              {cert.militaryPlate}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">
                            {cert.civilianPlate}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {cert.ownerName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono">
                            {cert.registrationDate}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setActiveCertificate(cert)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded font-semibold transition-colors"
                            >
                              Seç
                            </button>
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
