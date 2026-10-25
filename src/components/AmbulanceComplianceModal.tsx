import React, { useState, useMemo } from 'react';
import {
  AmbulanceClass,
  calculateAmbulanceAuditScore,
  formatAmbulancePlate,
  generateAmbulancePermitNumber,
  generateAmbulanceHash,
  convertAmbulanceCurrency,
  filterEmsSubstations,
  filterAmbulancePermits,
  gradeEmsExam,
  AmbulancePermitRecord
} from '../utils/ambulanceCompliance';
import {
  AMBULANCE_CHECKLIST_ITEMS,
  AMBULANCE_PRESETS,
  EMS_SUBSTATIONS,
  RESCUE_CORRIDOR_SCENARIOS,
  EMS_EXAM_QUESTIONS,
  SAMPLE_AMBULANCE_PERMITS
} from '../data/mockAmbulanceData';

export interface AmbulanceComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'az' | 'en' | 'ru';
  currency?: 'AZN' | 'USD' | 'EUR';
}

type TabType = 'audit' | 'presets' | 'corridor' | 'exam' | 'stations' | 'permit';

export const AmbulanceComplianceModal: React.FC<AmbulanceComplianceModalProps> = ({
  isOpen,
  onClose,
  lang = 'az',
  currency = 'AZN'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('audit');
  const [targetClass, setTargetClass] = useState<AmbulanceClass>('class_c');
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    AMBULANCE_CHECKLIST_ITEMS.forEach(item => {
      initial[item.id] = true;
    });
    return initial;
  });

  // Selected vehicle preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(AMBULANCE_PRESETS[0].id);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);

  // Rescue corridor scenario
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(RESCUE_CORRIDOR_SCENARIOS[0].id);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Stations filter
  const [stationQuery, setStationQuery] = useState<string>('');
  const [stationRegionFilter, setStationRegionFilter] = useState<string>('all');
  const [bookedStationId, setBookedStationId] = useState<string | null>(null);

  // Permit and registry state
  const [permits, setPermits] = useState<AmbulancePermitRecord[]>(SAMPLE_AMBULANCE_PERMITS);
  const [registryQuery, setRegistryQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activePermit, setActivePermit] = useState<AmbulancePermitRecord>(SAMPLE_AMBULANCE_PERMITS[0]);

  if (!isOpen) return null;

  const currentPreset = AMBULANCE_PRESETS.find(p => p.id === selectedPresetId) || AMBULANCE_PRESETS[0];
  const currentScenario = RESCUE_CORRIDOR_SCENARIOS.find(s => s.id === selectedScenarioId) || RESCUE_CORRIDOR_SCENARIOS[0];

  const auditResult = calculateAmbulanceAuditScore(checkedMap, AMBULANCE_CHECKLIST_ITEMS, targetClass);

  const toggleChecklistItem = (id: string) => {
    setCheckedMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleApplyAllCompliant = () => {
    const full: Record<string, boolean> = {};
    AMBULANCE_CHECKLIST_ITEMS.forEach(item => {
      full[item.id] = true;
    });
    setCheckedMap(full);
  };

  const handleSelectExamAnswer = (questionId: number, optionIndex: number) => {
    if (isExamSubmitted) return;
    setExamAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const examResult = gradeEmsExam(examAnswers, EMS_EXAM_QUESTIONS);

  const filteredStations = filterEmsSubstations(EMS_SUBSTATIONS, stationQuery, stationRegionFilter);
  const filteredPermits = filterAmbulancePermits(permits, registryQuery);

  const handleGeneratePermitForCurrent = () => {
    const permitNumber = generateAmbulancePermitNumber();
    const hash = generateAmbulanceHash(permitNumber, currentPreset.plate, currentPreset.vin);
    const newPermit: AmbulancePermitRecord = {
      permitNumber,
      issueDate: '2026-10-25',
      expiryDate: '2027-10-25',
      plateNumber: currentPreset.plate,
      vin: currentPreset.vin,
      organizationName: `TƏBİB ${currentPreset.name} Reanimasiya Xidməti`,
      voen: '1401928374',
      vehicleClass: currentPreset.vehicleClass,
      ambulanceType: currentPreset.ambulanceType,
      assignedStation: EMS_SUBSTATIONS[0].nameAz,
      oxygenInspectionDate: '2026-10-20',
      chiefPhysicianSignature: 'Dr. Rəşad Məmmədov (Baş Həkim)',
      status: 'valid',
      verificationHash: hash
    };

    setPermits([newPermit, ...permits]);
    setActivePermit(newPermit);
    setActiveTab('permit');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (valAzn: number) => {
    const converted = convertAmbulanceCurrency(valAzn, currency);
    return `${converted.toLocaleString()} ${currency}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-red-950/60 via-slate-900 to-blue-950/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 text-2xl shadow-lg shadow-red-500/10">
              🚑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  TƏBİB & BDYP 103
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  EN 1789 Standartı
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {lang === 'az' && 'TƏBİB & BDYP Təcili Tibbi Yardım və Reanimasiya Portalı'}
                {lang === 'en' && 'TƏBİB & State Police Emergency Medical Services & Resuscitation Portal'}
                {lang === 'ru' && 'Портал Скорой Медицинской Помощи и Реанимации TƏBİB и BDYP'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 p-2 gap-1.5 scrollbar-thin">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            📋 {lang === 'az' ? 'EN 1789 Standartı Audit' : lang === 'ru' ? 'Аудит EN 1789' : 'EN 1789 Audit Stand'}
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            🚑 {lang === 'az' ? 'Ambulans Parkı & Mayak' : lang === 'ru' ? 'Парк скорых & Маяки' : 'Fleet & Siren Stand'}
          </button>
          <button
            onClick={() => setActiveTab('corridor')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'corridor'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            🛣️ {lang === 'az' ? '«Həyat Dəhlizi» (Rettungsgasse)' : lang === 'ru' ? '«Коридор спасения»' : 'Rescue Corridor'}
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'exam'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            🎓 {lang === 'az' ? 'Sürücü İmtahanı (10 Sual)' : lang === 'ru' ? 'Экзамен водителя' : 'Driver Safety Exam'}
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'stations'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            🏥 {lang === 'az' ? '103 Stansiyaları Radarı' : lang === 'ru' ? 'Радар станций 103' : '103 Substations Radar'}
          </button>
          <button
            onClick={() => setActiveTab('permit')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'permit'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            📜 {lang === 'az' ? 'TƏBİB-EMS Buraxılış & Reyestr' : lang === 'ru' ? 'Сертификат и реестр' : 'EMS Permit & Registry'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: AUDIT & CHECKLIST */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Class Selector & Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setTargetClass('class_c')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    targetClass === 'class_c'
                      ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">EN 1789 Type C</span>
                    <span className="text-xl">🚑</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">Reanimomobil (Klass C)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    İntensiv terapiya, süni tənəffüs (IVL), perfuzorlar və 10g zərbəyə davamlı xərəklər.
                  </p>
                </div>

                <div
                  onClick={() => setTargetClass('class_b')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    targetClass === 'class_b'
                      ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">EN 1789 Type B</span>
                    <span className="text-xl">🩺</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">Təcili Yardım (Klass B)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Xətti təcili tibbi yardım, defibrilyator, EKQ və təcili müdaxilə dəstləri.
                  </p>
                </div>

                <div
                  onClick={() => setTargetClass('class_a')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    targetClass === 'class_a'
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">EN 1789 Type A</span>
                    <span className="text-xl">🚐</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">Pasient Daşıma (Klass A)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Xəstəxanalar-arası stabil pasientlərin təhlükəsiz daşınması nəqliyyatı.
                  </p>
                </div>
              </div>

              {/* Progress and KPIs */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-300">Uyğunluq Reytinqi:</span>
                    <span className={`text-lg font-bold ${auditResult.scorePercentage >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {auditResult.scorePercentage}% ({auditResult.passedItems} / {auditResult.totalItems})
                    </span>
                  </div>
                  <div className="w-48 bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        auditResult.scorePercentage === 100 ? 'bg-emerald-500' : auditResult.scorePercentage >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${auditResult.scorePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Mümkün Cərimə Riski</div>
                    <div className={`text-base font-bold ${auditResult.totalFineAzn > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {formatPrice(auditResult.totalFineAzn)}
                    </div>
                  </div>
                  <button
                    onClick={handleApplyAllCompliant}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
                  >
                    Tam Uyğunluğu Doldur (10/10)
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {AMBULANCE_CHECKLIST_ITEMS.map((item, idx) => {
                  const isChecked = !!checkedMap[item.id];
                  const isRequired = item.requiredForClasses.includes(targetClass);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                          : isRequired
                          ? 'bg-red-950/20 border-red-500/40 hover:border-red-500/60'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center font-bold text-sm border transition-all ${
                            isChecked
                              ? 'bg-red-600 border-red-500 text-white shadow-sm shadow-red-500/30'
                              : 'bg-slate-800 border-slate-600 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                              #{idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-white">
                              {lang === 'az' ? item.labelAz : lang === 'ru' ? item.labelRu : item.labelEn}
                            </span>
                            {isRequired && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                Məcburi
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{item.legalBasis}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-300">{item.penaltyAzn} AZN</span>
                        {item.penaltyPoints > 0 && (
                          <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                            +{item.penaltyPoints} Bal
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FLEET PRESETS & SIREN STAND */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              {/* Presets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {AMBULANCE_PRESETS.map(preset => {
                  const isSelected = preset.id === selectedPresetId;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                            {preset.vehicleClass.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-white">
                            {formatAmbulancePlate(preset.plate)}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{preset.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{preset.ambulanceType}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-xs text-slate-400">{preset.engine}</span>
                        <span className="text-xs font-bold text-emerald-400">{formatPrice(preset.baseCostAzn)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vehicle Detail Stand & Beacon / Siren Controller */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>🚑</span>
                      {currentPreset.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">VIN: {currentPreset.vin} | Mühərrik: {currentPreset.engine}</p>
                  </div>

                  {/* Siren / Beacon Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsSirenActive(!isSirenActive)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
                        isSirenActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 animate-pulse'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <span>🚨</span>
                      {isSirenActive ? 'Göy Mayak & Siren Aktivdir (118 dBA)' : 'Sayrışan Mayakı Yandır'}
                    </button>
                    <button
                      onClick={handleGeneratePermitForCurrent}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
                    >
                      E-Buraxılış Hazırla
                    </button>
                  </div>
                </div>

                {/* Animated Lightbar Visualizer */}
                <div className="relative h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 flex">
                    <div className="flex-1 bg-yellow-400"></div>
                    <div className="flex-1 bg-emerald-500"></div>
                    <div className="flex-1 bg-yellow-400"></div>
                    <div className="flex-1 bg-emerald-500"></div>
                  </div>

                  {/* Beacon Light Bar */}
                  <div className="relative z-10 flex items-center gap-6">
                    <div
                      className={`w-14 h-8 rounded-lg transition-all ${
                        isSirenActive
                          ? 'bg-blue-500 shadow-[0_0_35px_#3b82f6] scale-105 animate-ping'
                          : 'bg-blue-900/40 border border-blue-600/40'
                      }`}
                    />
                    <div className="px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300">
                      TƏBİB 103 REANIMATION
                    </div>
                    <div
                      className={`w-14 h-8 rounded-lg transition-all ${
                        isSirenActive
                          ? 'bg-blue-500 shadow-[0_0_35px_#3b82f6] scale-105 animate-ping'
                          : 'bg-blue-900/40 border border-blue-600/40'
                      }`}
                    />
                  </div>
                </div>

                {/* Equipment Matrix */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Xüsusi Tibbi və Reanimasiya Təchizatı:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentPreset.typicalEquipment.map((eq, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs flex items-center gap-2">
                        <span className="text-red-400 font-bold">✓</span>
                        <span className="text-slate-200">{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESCUE CORRIDOR (RETTUNGSGASSE) SIMULATOR */}
          {activeTab === 'corridor' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RESCUE_CORRIDOR_SCENARIOS.map(sc => {
                  const isSelected = sc.id === selectedScenarioId;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => setSelectedScenarioId(sc.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-red-400">{sc.roadType}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                          {sc.lanesCount} Zolaq
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">
                        {lang === 'az' ? sc.titleAz : lang === 'ru' ? sc.titleRu : sc.titleEn}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {lang === 'az' ? sc.descriptionAz : lang === 'ru' ? sc.descriptionRu : sc.descriptionEn}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Scenario Visualizer Stand */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>🛣️</span>
                      {currentScenario.titleAz}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{currentScenario.legalArticle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                      Cərimə: {currentScenario.legalPenaltyAzn} AZN
                    </span>
                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                      +{currentScenario.legalPenaltyPoints} Bal
                    </span>
                  </div>
                </div>

                {/* Road Lane Graphic Representation */}
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400 px-4">
                    <span>⬅️ SOL KƏNAR (Sıxılma zonası)</span>
                    <span className="text-red-400 font-extrabold animate-pulse">«HƏYAT DƏHLİZİ» (AMBULANS KEÇİDİ)</span>
                    <span>SAĞ KƏNAR (Sıxılma zonası) ➡️</span>
                  </div>

                  <div className="w-full h-16 bg-slate-800 rounded-lg border-y-2 border-dashed border-slate-600 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-7 rounded bg-blue-700/80 border border-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                        🚗 Sol
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/60 px-4 py-1.5 rounded-lg">
                      <span className="text-lg animate-bounce">🚑</span>
                      <span className="text-xs font-bold text-red-400">TƏCİLİ YARDIM 103</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-7 rounded bg-emerald-700/80 border border-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                        🚙 Orta
                      </div>
                      <div className="w-10 h-7 rounded bg-purple-700/80 border border-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                        🚚 Sağ
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instruction Box */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Sürücünün Düzgün və Qanuni Davranışı:
                  </h5>
                  <p className="text-sm text-slate-200">
                    {lang === 'az' ? currentScenario.correctDriverActionAz : lang === 'ru' ? currentScenario.correctDriverActionRu : currentScenario.correctDriverActionEn}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THEORETICAL EXAMINATION */}
          {activeTab === 'exam' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Təcili Tibbi Yardım və Operativ Hərəkət İmtahanı</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    10 sualdan minimum 9 düzgün cavab (90%) sertifikatlaşdırma üçün tələb olunur.
                  </p>
                </div>
                {isExamSubmitted ? (
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${examResult.passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      Nəticə: {examResult.correct} / {examResult.total} ({examResult.scorePercentage}%) {examResult.passed ? '— KEÇDİ' : '— KƏSİLDİ'}
                    </span>
                    <button
                      onClick={() => {
                        setExamAnswers({});
                        setIsExamSubmitted(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white"
                    >
                      Yenidən Başla
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
                  >
                    İmtahanı Tamamla və Yoxla
                  </button>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {EMS_EXAM_QUESTIONS.map(q => {
                  const selectedOpt = examAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isExamSubmitted
                          ? isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-red-950/20 border-red-500/40'
                          : 'bg-slate-800/40 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300 mt-0.5">
                          #{q.id}
                        </span>
                        <div className="flex-1 space-y-3">
                          <p className="text-sm font-semibold text-white">
                            {lang === 'az' ? q.questionAz : lang === 'ru' ? q.questionRu : q.questionEn}
                          </p>

                          {/* Options */}
                          <div className="space-y-1.5">
                            {q.optionsAz.map((opt, optIdx) => {
                              const isThisSelected = selectedOpt === optIdx;
                              let optClass = 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 text-slate-300';

                              if (isExamSubmitted) {
                                if (optIdx === q.correctIndex) {
                                  optClass = 'bg-emerald-900/40 border-emerald-500 text-emerald-200 font-semibold';
                                } else if (isThisSelected) {
                                  optClass = 'bg-red-900/40 border-red-500 text-red-200';
                                }
                              } else if (isThisSelected) {
                                optClass = 'bg-red-600/30 border-red-500 text-white font-semibold';
                              }

                              return (
                                <div
                                  key={optIdx}
                                  onClick={() => handleSelectExamAnswer(q.id, optIdx)}
                                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${optClass}`}
                                >
                                  <span>{lang === 'az' ? opt : lang === 'ru' ? q.optionsRu[optIdx] : q.optionsEn[optIdx]}</span>
                                  {isThisSelected && <span>✓</span>}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation if submitted */}
                          {isExamSubmitted && (
                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                              <span className="text-slate-400 font-bold">İzah: </span>
                              <span className="text-slate-300">
                                {lang === 'az' ? q.explanationAz : lang === 'ru' ? q.explanationRu : q.explanationEn}
                              </span>
                              <p className="text-slate-400 font-mono text-[10px] mt-1">İstinad: {q.legalBasis}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: 103 SUBSTATIONS RADAR */}
          {activeTab === 'stations' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Stansiya adı, rayon və ya telefon nömrəsi ilə axtar..."
                  value={stationQuery}
                  onChange={e => setStationQuery(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500 w-full md:w-80"
                />

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['all', 'Baku', 'Sumgayit', 'Ganja'].map(r => (
                    <button
                      key={r}
                      onClick={() => setStationRegionFilter(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        stationRegionFilter === r
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {r === 'all' ? 'Bütün Regionlar' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Substations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStations.map(st => {
                  const isBooked = bookedStationId === st.id;
                  return (
                    <div
                      key={st.id}
                      className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
                            {st.region}
                          </span>
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <span>⚡</span>
                            Orta çatma vaxtı: {st.avgResponseMinutes} dəq
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-2">{st.nameAz}</h4>
                        <p className="text-xs text-slate-400 mt-1">{st.addressAz}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400">Aktiv Ambulans Sayı:</div>
                          <div className="text-sm font-bold text-white">{st.activeAmbulances} Briqada</div>
                        </div>
                        <button
                          onClick={() => setBookedStationId(st.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isBooked
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                          }`}
                        >
                          {isBooked ? '✓ Dispetçer Əlaqələndi' : 'Briqada Çağırışı Simulyasiyası'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: PERMIT CERTIFICATE & REGISTRY */}
          {activeTab === 'permit' && (
            <div className="space-y-6">
              {/* Official Electronic Permit Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-red-500/40 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-2xl">
                      🚑
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-red-400">
                        Azərbaycan Respublikası Səhiyyə Nazirliyi & TƏBİB
                      </div>
                      <h3 className="text-lg font-extrabold text-white">
                        TƏCİLİ VƏ TƏXİRƏSALINMAZ TİBBİ YARDIM OPERATİV BURAXILIŞI
                      </h3>
                      <div className="text-xs text-slate-400 font-mono">Qeydiyyat №: {activePermit.permitNumber}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(activePermit.permitNumber)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                    >
                      {copiedCode ? '✓ Kopyalandı' : 'Kodu Kopyala'}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                    >
                      🖨️ Çap et
                    </button>
                  </div>
                </div>

                {/* Permit Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-white text-sm">
                        {formatAmbulancePlate(activePermit.plateNumber)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold uppercase">
                        {activePermit.vehicleClass}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <span className="text-slate-400">Təşkilat və VÖEN:</span>
                    <div className="font-bold text-white text-xs mt-1">{activePermit.organizationName}</div>
                    <div className="text-slate-400 font-mono text-[10px] mt-0.5">VÖEN: {activePermit.voen}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <span className="text-slate-400">Təyin Olunmuş Stansiya:</span>
                    <div className="font-bold text-white text-xs mt-1">{activePermit.assignedStation}</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">Məsul Həkim: {activePermit.chiefPhysicianSignature}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <span className="text-slate-400">Ambulans Tipi & EN 1789:</span>
                    <div className="font-bold text-white text-xs mt-1">{activePermit.ambulanceType}</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">VIN: {activePermit.vin}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <span className="text-slate-400">Etibarlılıq Müddəti:</span>
                    <div className="font-bold text-emerald-400 text-xs mt-1">
                      {activePermit.issueDate} — {activePermit.expiryDate}
                    </div>
                    <div className="text-slate-400 text-[10px] mt-0.5">Oksigen Yoxlanışı: {activePermit.oxygenInspectionDate}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <span className="text-slate-400">Kriptoqrafik Təsdiq Haşı:</span>
                    <div className="font-mono font-bold text-slate-300 text-[10px] mt-1 truncate">
                      {activePermit.verificationHash}
                    </div>
                    <div className="text-emerald-400 font-bold text-[10px] mt-0.5">SİMA & TƏBİB Təsdiqli</div>
                  </div>
                </div>
              </div>

              {/* Unified Public Registry Lookup */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h4 className="text-base font-bold text-white">Vahid İctimai TƏBİB Ambulans Reyestri</h4>
                  <input
                    type="text"
                    placeholder="Qeydiyyat nömrəsi, nömrə nişanı və ya VIN ilə axtar..."
                    value={registryQuery}
                    onChange={e => setRegistryQuery(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500 w-full md:w-80"
                  />
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">Qeydiyyat №</th>
                        <th className="p-3">Dövlət Nişanı</th>
                        <th className="p-3">Təşkilat</th>
                        <th className="p-3">Klass</th>
                        <th className="p-3">Stansiya</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                      {filteredPermits.map(p => (
                        <tr key={p.permitNumber} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-mono font-bold text-white">{p.permitNumber}</td>
                          <td className="p-3 font-mono">{formatAmbulancePlate(p.plateNumber)}</td>
                          <td className="p-3">{p.organizationName}</td>
                          <td className="p-3 uppercase font-bold text-red-400">{p.vehicleClass}</td>
                          <td className="p-3">{p.assignedStation}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                              {p.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setActivePermit(p)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                            >
                              Baxış
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

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span>TƏBİB & BDYP 103 Portalı — YHQ Maddə 42 & İXM Maddə 327.3</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
          >
            {lang === 'az' ? 'Bağla' : lang === 'ru' ? 'Закрыть' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
