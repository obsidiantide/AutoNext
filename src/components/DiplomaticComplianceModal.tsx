import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types/vehicle';
import {
  DiplomaticCategory,
  DiplomaticMissionType,
  MissionCountry,
  DIPLOMATIC_CATEGORIES,
  MISSION_COUNTRIES,
  formatDiplomaticPlate,
  calculateDiplomaticCustomsExemption,
  calculateCivilianResaleDuties,
  calculateProtocolChecklistScore,
  convertCurrency,
  filterDiplomaticMissions,
  filterDiplomaticCertificates,
  createDiplomaticCertificate,
  DiplomaticCertificate
} from '../utils/diplomaticCompliance';
import {
  MOCK_VIENNA_CHECKLIST,
  MOCK_DIPLOMATIC_MISSIONS,
  MOCK_DIPLOMATIC_PRESETS,
  MOCK_PROTOCOL_EXAM_QUESTIONS,
  MOCK_ACTIVE_DIPLOMATIC_CERTIFICATES
} from '../data/mockDiplomaticData';

export interface DiplomaticComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  lang?: 'az' | 'en' | 'ru';
  currency?: 'AZN' | 'USD' | 'EUR';
}

type TabType = 'checklist' | 'plate' | 'customs' | 'missions' | 'exam' | 'certificate';

export const DiplomaticComplianceModal: React.FC<DiplomaticComplianceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  lang = 'az',
  currency = 'AZN'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('checklist');

  // Checklist state
  const [checkedIds, setCheckedIds] = useState<string[]>(() =>
    MOCK_VIENNA_CHECKLIST.map(item => item.id)
  );

  // Plate visualizer state
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('001');
  const [selectedCategory, setSelectedCategory] = useState<DiplomaticCategory>('CD');
  const [plateSequence, setPlateSequence] = useState<string>('001');

  // Customs & Resale calculation state
  const [cifValueAzn, setCifValueAzn] = useState<number>(() => vehicle?.priceAzn ? vehicle.priceAzn * 1.7 : 120000);
  const [engineCc, setEngineCc] = useState<number>(3000);
  const [monthsInService, setMonthsInService] = useState<number>(24);

  // Missions Radar state
  const [missionQuery, setMissionQuery] = useState<string>('');
  const [missionTypeFilter, setMissionTypeFilter] = useState<string>('all');
  const [selectedMissionId, setSelectedMissionId] = useState<string>(MOCK_DIPLOMATIC_MISSIONS[0].id);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Certificates & Registry state
  const [certificates, setCertificates] = useState<DiplomaticCertificate[]>(MOCK_ACTIVE_DIPLOMATIC_CERTIFICATES);
  const [currentCertificate, setCurrentCertificate] = useState<DiplomaticCertificate>(MOCK_ACTIVE_DIPLOMATIC_CERTIFICATES[0]);
  const [certSearchQuery, setCertSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentCountry = useMemo<MissionCountry>(() => {
    return MISSION_COUNTRIES.find(c => c.code === selectedCountryCode) || MISSION_COUNTRIES[0];
  }, [selectedCountryCode]);

  const currentPlateString = useMemo(() => {
    return formatDiplomaticPlate(selectedCountryCode, selectedCategory, plateSequence);
  }, [selectedCountryCode, selectedCategory, plateSequence]);

  const checklistScore = useMemo(() => {
    return calculateProtocolChecklistScore(checkedIds, MOCK_VIENNA_CHECKLIST);
  }, [checkedIds]);

  const customsExemption = useMemo(() => {
    return calculateDiplomaticCustomsExemption(cifValueAzn, engineCc, 1);
  }, [cifValueAzn, engineCc]);

  const resaleCalculation = useMemo(() => {
    return calculateCivilianResaleDuties(cifValueAzn, engineCc, 2, monthsInService);
  }, [cifValueAzn, engineCc, monthsInService]);

  const filteredMissions = useMemo(() => {
    return filterDiplomaticMissions(MOCK_DIPLOMATIC_MISSIONS, missionQuery, missionTypeFilter);
  }, [missionQuery, missionTypeFilter]);

  const filteredCertificates = useMemo(() => {
    return filterDiplomaticCertificates(certificates, certSearchQuery);
  }, [certificates, certSearchQuery]);

  const examScore = useMemo(() => {
    let correct = 0;
    MOCK_PROTOCOL_EXAM_QUESTIONS.forEach(q => {
      if (examAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: MOCK_PROTOCOL_EXAM_QUESTIONS.length,
      passed: correct >= 8,
      percentage: Math.round((correct / MOCK_PROTOCOL_EXAM_QUESTIONS.length) * 100)
    };
  }, [examAnswers]);

  const toggleChecklistItem = (id: string) => {
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleApplyPreset = (preset: typeof MOCK_DIPLOMATIC_PRESETS[0]) => {
    setSelectedCountryCode(preset.countryCode);
    setSelectedCategory(preset.category);
    const seq = preset.plateNumber.split(' ')[2] || '001';
    setPlateSequence(seq);
    setEngineCc(preset.engineCc);
    setCifValueAzn(preset.cifValueAzn);
    setMonthsInService(preset.registeredMonthsAgo);
  };

  const handleCreateNewCertificate = () => {
    const newCert = createDiplomaticCertificate({
      countryCode: selectedCountryCode,
      category: selectedCategory,
      sequence: plateSequence,
      missionName: `${currentCountry.countryAz} Səfirliyi / Nümayəndəliyi`,
      vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Mercedes-Maybach S 580 4MATIC',
      vin: vehicle?.vin || 'W1K2231761A490123',
      engineCc,
      cifValueAzn
    });
    setCertificates(prev => [newCert, ...prev]);
    setCurrentCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCertificate = () => {
    navigator.clipboard?.writeText?.(currentCertificate.certificateNumber);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diplomatic-modal-title"
    >
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-rose-950/40 text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-700 to-red-600 flex items-center justify-center shadow-lg shadow-rose-600/30 text-white font-bold text-lg">
              <span>CD</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="diplomatic-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {lang === 'az' && 'XİN & BDYP Diplomatik Korpus və Beynəlxalq Nümayəndəliklər Portalı'}
                  {lang === 'en' && 'MFA & BDYP Diplomatic Corps & International Missions Portal'}
                  {lang === 'ru' && 'МИД и BDYP Портал Дипломатического Корпуса и Миссий'}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-rose-900/60 text-rose-300 border border-rose-700/50">
                  Vyana 1961
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'az' && '1961-ci il Vyana Konvensiyası • Qırmızı Nömrələr (CD/D/T/CC) • 100% Tax-Free Gömrük Rejimi'}
                {lang === 'en' && '1961 Vienna Convention • Red Plates (CD/D/T/CC) • 100% Tax-Free Customs Status'}
                {lang === 'ru' && 'Венская Конвенция 1961 • Красные Номера • 100% Беспошлинный Ввоз'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
            aria-label="Close modal"
            data-testid="diplomatic-modal-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Quick Vehicle Presets Pill Bar */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">
            {lang === 'az' ? 'Missiya Preseti:' : lang === 'en' ? 'Mission Presets:' : 'Пресеты Миссий:'}
          </span>
          {MOCK_DIPLOMATIC_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-600 transition-all whitespace-nowrap flex items-center space-x-1.5"
              data-testid={`preset-btn-${preset.id}`}
            >
              <span>{preset.plateNumber}</span>
              <span className="text-slate-400 text-[10px]">({preset.vehicleModel.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            data-testid="tab-checklist"
          >
            📋 {lang === 'az' ? 'Vyana Protokol Standı' : lang === 'en' ? 'Vienna Protocol Stand' : 'Венский Протокол'}
          </button>
          <button
            onClick={() => setActiveTab('plate')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'plate'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            data-testid="tab-plate"
          >
            🟥 {lang === 'az' ? 'Qırmızı Nömrə Simulyatoru' : lang === 'en' ? 'Red Plate Visualizer' : 'Красный Дипномер'}
          </button>
          <button
            onClick={() => setActiveTab('customs')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'customs'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            data-testid="tab-customs"
          >
            💰 {lang === 'az' ? 'Gömrük & Mülki Satış' : lang === 'en' ? 'Customs & Resale' : 'Таможня и Перепродажа'}
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'missions'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            data-testid="tab-missions"
          >
            🏛️ {lang === 'az' ? 'Səfirliklər Radarı' : lang === 'en' ? 'Embassies Radar' : 'Радар Посольств'}
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'exam'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            data-testid="tab-exam"
          >
            🎓 {lang === 'az' ? 'Protokol İmtahanı' : lang === 'en' ? 'Protocol Exam' : 'Экзамен Протокола'}
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            data-testid="tab-certificate"
          >
            📜 {lang === 'az' ? 'Rəsmi XİN Şəhadətnaməsi' : lang === 'en' ? 'Official MFA Certificate' : 'Сертификат МИД'}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-5" data-testid="tab-content-checklist">
              {/* Score strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">
                    {lang === 'az' ? 'Vyana Uyğunluq İndeksi' : lang === 'en' ? 'Vienna Compliance Index' : 'Индекс Соответствия'}
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-black text-rose-400" data-testid="compliance-score-percentage">
                      {checklistScore.scorePercentage}%
                    </span>
                    <span className="text-xs text-slate-400">
                      ({checkedIds.length}/{MOCK_VIENNA_CHECKLIST.length} maddə)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        checklistScore.scorePercentage === 100
                          ? 'bg-emerald-500'
                          : checklistScore.scorePercentage >= 80
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${checklistScore.scorePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">
                    {lang === 'az' ? 'Mütləq Tələblər Statusu' : lang === 'en' ? 'Mandatory Requirements' : 'Обязательные Статьи'}
                  </span>
                  <div className="mt-1">
                    {checklistScore.allMandatoryMet ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                        ✓ Bütün İmmunitet Şərtləri Təmin Edilib
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950/60 text-amber-400 border border-amber-800">
                        ⚠ {checklistScore.missingMandatoryCount} Məcburi Maddə Çatışmır
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    1961 Vyana Konvensiyası Maddə 22, 29, 30, 36 toxunulmazlıq zəmanəti.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400">
                    {lang === 'az' ? 'XİN Qeydiyyat Şəhadətnaməsi' : lang === 'en' ? 'MFA Registration Status' : 'Регистрация МИД'}
                  </span>
                  <div className="mt-1">
                    <button
                      onClick={handleCreateNewCertificate}
                      className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-1.5"
                      data-testid="generate-cert-from-checklist-btn"
                    >
                      <span>📜</span>
                      <span>{lang === 'az' ? 'XİN-DIP Şəhadətnaməsi Ver' : lang === 'en' ? 'Issue MFA Certificate' : 'Выдать Сертификат'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    DGK və DİN BDYP vahid bazasında birbaşa sinxronizasiya.
                  </p>
                </div>
              </div>

              {/* Checklist list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200">
                    {lang === 'az' ? '10 Maddəlik Diplomatik Protokol və Toxunulmazlıq Standı:' : '10-Point Vienna Protocol Audit Items:'}
                  </h3>
                  <div className="space-x-2 text-xs">
                    <button
                      onClick={() => setCheckedIds(MOCK_VIENNA_CHECKLIST.map(i => i.id))}
                      className="text-rose-400 hover:underline"
                    >
                      {lang === 'az' ? 'Hamısını seç' : 'Select All'}
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      onClick={() => setCheckedIds([])}
                      className="text-slate-400 hover:underline"
                    >
                      {lang === 'az' ? 'Sıfırla' : 'Reset'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MOCK_VIENNA_CHECKLIST.map(item => {
                    const isChecked = checkedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                          isChecked
                            ? 'bg-slate-900/90 border-rose-600/60 shadow-sm shadow-rose-950/50'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-70'
                        }`}
                        data-testid={`checklist-item-${item.id}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-800 border-slate-700 pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between space-x-2">
                            <span className="text-xs font-bold text-white tracking-tight">
                              {lang === 'az' ? item.titleAz : lang === 'en' ? item.titleEn : item.titleRu}
                            </span>
                            {item.required ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-950 text-rose-300 border border-rose-800 whitespace-nowrap">
                                Məcburi
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-800 text-slate-400 whitespace-nowrap">
                                Könüllü
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {lang === 'az' ? item.descriptionAz : lang === 'en' ? item.descriptionEn : item.descriptionRu}
                          </p>
                          <span className="inline-block mt-1.5 text-[10px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
                            {item.viennaArticle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RED DIPLOMATIC PLATE VISUALIZER */}
          {activeTab === 'plate' && (
            <div className="space-y-6" data-testid="tab-content-plate">
              {/* Authentic Plate Visualizer Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-4">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                  {lang === 'az' ? 'Rəsmi Diplomatik Dövlət Qeydiyyat Nişanı' : 'Official State Diplomatic Registration Plate'}
                </span>

                {/* THE RED PLATE CONTAINER */}
                <div
                  className="relative inline-flex items-center h-20 sm:h-24 px-4 sm:px-6 rounded-xl border-4 border-slate-300 shadow-2xl select-none"
                  style={{
                    backgroundColor: '#B22222', // Authentic crimson red diplomatic background
                    boxShadow: '0 10px 25px -5px rgba(178, 34, 34, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                  }}
                  data-testid="diplomatic-plate-visualizer"
                >
                  {/* Left blue AZ strip */}
                  <div className="flex flex-col items-center justify-between h-full py-1 pr-3 border-r-2 border-red-900/60 mr-4">
                    {/* Azerbaijan Flag */}
                    <div className="w-6 h-4 rounded-xs overflow-hidden flex flex-col shadow-xs">
                      <div className="h-1/3 bg-sky-500" />
                      <div className="h-1/3 bg-red-600 flex items-center justify-center">
                        <span className="text-[6px] text-white leading-none">☾⋆</span>
                      </div>
                      <div className="h-1/3 bg-emerald-600" />
                    </div>
                    {/* AZ Letters */}
                    <span className="text-white font-black text-sm tracking-wider">AZ</span>
                  </div>

                  {/* Embossed Characters */}
                  <div className="flex items-center space-x-3 sm:space-x-5 font-black text-3xl sm:text-5xl text-white tracking-widest font-mono drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
                    <span data-testid="plate-country-code">{selectedCountryCode.padStart(3, '0')}</span>
                    <span className="text-white/90" data-testid="plate-category">{selectedCategory}</span>
                    <span data-testid="plate-seq">{plateSequence.padStart(3, '0')}</span>
                  </div>

                  {/* Microchip hologram badge */}
                  <div className="ml-5 hidden sm:flex flex-col items-center justify-center w-8 h-8 rounded-full border border-red-300/40 bg-red-800/60 shadow-inner">
                    <span className="text-[8px] text-red-200 font-bold">XİN</span>
                    <span className="text-[6px] text-red-300">RFID</span>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-300 max-w-md">
                  <span className="font-bold text-white">{currentCountry.flagEmoji} {currentCountry.countryAz}</span>: {DIPLOMATIC_CATEGORIES[selectedCategory].descriptionAz}
                </div>
              </div>

              {/* Plate Customizer Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                {/* Country Code Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'az' ? '1. Ölkə / Təşkilat Şifrəsi (İlk 3 Rəqəm):' : '1. Country / Mission Code:'}
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={e => setSelectedCountryCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
                    data-testid="select-country-code"
                  >
                    {MISSION_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.flagEmoji} {c.countryAz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Series Category Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'az' ? '2. Diplomatik Kateqoriya (Hərf):' : '2. Diplomatic Category:'}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value as DiplomaticCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
                    data-testid="select-category"
                  >
                    {Object.keys(DIPLOMATIC_CATEGORIES).map(k => {
                      const cat = k as DiplomaticCategory;
                      return (
                        <option key={cat} value={cat}>
                          {DIPLOMATIC_CATEGORIES[cat].labelAz}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Sequence Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'az' ? '3. Sıra Nömrəsi (001 - 999):' : '3. Vehicle Sequence:'}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={plateSequence}
                      onChange={e => setPlateSequence(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-rose-500"
                      placeholder="001"
                      data-testid="input-plate-sequence"
                    />
                    <button
                      onClick={() => setPlateSequence('001')}
                      className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 font-semibold"
                    >
                      #1
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Deep Dive Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-400">
                  <span>🛡️ İmmunitet Rejimi:</span>
                  <span className="text-white">{DIPLOMATIC_CATEGORIES[selectedCategory].immunityLevel}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {DIPLOMATIC_CATEGORIES[selectedCategory].descriptionAz} Sürücü və sərnişinlər 1961/1963-cü il Vyana Konvensiyasının müddəalarına uyğun olaraq xüsusi diplomatik immunitet hüququndan istifadə edirlər.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMS TAX-FREE & RESALE AMORTIZATION */}
          {activeTab === 'customs' && (
            <div className="space-y-6" data-testid="tab-content-customs">
              {/* Dual Column: Import Tax-Free Savings vs Civilian Resale Amortization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Card: 100% Tax-Free Import Exemption */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏷️</span>
                      <h3 className="text-sm font-bold text-white">
                        {lang === 'az' ? 'Diplomatik İdxal: 100% Tax-Free Qənaət' : 'Diplomatic Import: 100% Tax-Free Savings'}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      0% Rüsum
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-center">
                    <span className="text-xs text-slate-400">
                      {lang === 'az' ? 'Diplomat Üçün Tam Azad Olunan Vergi Məbləği:' : 'Total Duties & Taxes Waived:'}
                    </span>
                    <div className="text-3xl font-black text-emerald-400 mt-1">
                      {convertCurrency(customsExemption.totalSavedDutiesAzn, currency).toLocaleString()} {currency}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      (Təxminən {convertCurrency(customsExemption.totalSavedDutiesAzn, 'USD').toLocaleString()} USD)
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Əsas Gömrük İdxal Rüsumu (15%):</span>
                      <span className="font-bold text-white line-through decoration-rose-500">
                        {convertCurrency(customsExemption.baseDutyAzn, currency).toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Aksiz Vergisi ({engineCc} cc):</span>
                      <span className="font-bold text-white line-through decoration-rose-500">
                        {convertCurrency(customsExemption.exciseTaxAzn, currency).toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Əlavə Dəyər Vergisi (18% ƏDV):</span>
                      <span className="font-bold text-white line-through decoration-rose-500">
                        {convertCurrency(customsExemption.vatAzn, currency).toLocaleString()} {currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Civilian Resale Amortization */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🔄</span>
                      <h3 className="text-sm font-bold text-white">
                        {lang === 'az' ? 'Mülki Satış & De-registrasiya' : 'Civilian Resale & De-registration'}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      Amortizasiya
                    </span>
                  </div>

                  <div className={`p-4 rounded-xl border text-center ${
                    resaleCalculation.isFullyExempt
                      ? 'bg-emerald-950/30 border-emerald-800/60'
                      : 'bg-rose-950/30 border-rose-800/60'
                  }`}>
                    <span className="text-xs text-slate-400">
                      {lang === 'az' ? 'Mülki Şəxsə Satışda Qalıq Gömrük Ödənişi:' : 'Residual Duty Payable on Resale:'}
                    </span>
                    <div className={`text-3xl font-black mt-1 ${
                      resaleCalculation.isFullyExempt ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {convertCurrency(resaleCalculation.remainingPayableDutyAzn, currency).toLocaleString()} {currency}
                    </div>
                    <span className="text-[11px] text-slate-300 mt-1 block">
                      {resaleCalculation.payablePercentage}% dərəcə ({monthsInService} ay xidmətdən sonra)
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Xidmət Müddəti:</span>
                      <span className="font-bold text-white">{monthsInService} ay ({Math.floor(monthsInService / 12)} il {monthsInService % 12} ay)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>5 İl (60 Ay) Qaydası:</span>
                      <span className="font-bold text-emerald-400">
                        {resaleCalculation.isFullyExempt ? '✓ Tam 0% Azad Olunub' : `${60 - monthsInService} ay qalıb`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sliders for Simulation */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200">
                  {lang === 'az' ? 'Simulyasiya Parametrləri:' : 'Simulation Controls:'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CIF Value */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Avtomobil Dəyəri (CIF):</span>
                      <span className="font-bold text-rose-400">{cifValueAzn.toLocaleString()} AZN</span>
                    </div>
                    <input
                      type="range"
                      min={20000}
                      max={500000}
                      step={5000}
                      value={cifValueAzn}
                      onChange={e => setCifValueAzn(Number(e.target.value))}
                      className="w-full accent-rose-500"
                      data-testid="slider-cif-value"
                    />
                  </div>

                  {/* Engine CC */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Mühərrik Həcmi:</span>
                      <span className="font-bold text-rose-400">{engineCc} cc</span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={6500}
                      step={100}
                      value={engineCc}
                      onChange={e => setEngineCc(Number(e.target.value))}
                      className="w-full accent-rose-500"
                      data-testid="slider-engine-cc"
                    />
                  </div>

                  {/* Months in service */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Diplomatik Xidmətdə Ay:</span>
                      <span className="font-bold text-rose-400">{monthsInService} ay</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={72}
                      step={6}
                      value={monthsInService}
                      onChange={e => setMonthsInService(Number(e.target.value))}
                      className="w-full accent-rose-500"
                      data-testid="slider-months-service"
                    />
                  </div>
                </div>

                {/* Amortization Schedule Table */}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-1.5 px-2">Xidmət Müddəti</th>
                        <th className="py-1.5 px-2">Ödənilmə Əmsalı</th>
                        <th className="py-1.5 px-2">Gömrük Borcu</th>
                        <th className="py-1.5 px-2">Qənaət Rejimi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {[
                        { label: '0 - 12 ay (1 ilədək)', pct: 100 },
                        { label: '13 - 24 ay (1 - 2 il)', pct: 80 },
                        { label: '25 - 36 ay (2 - 3 il)', pct: 60 },
                        { label: '37 - 48 ay (3 - 4 il)', pct: 40 },
                        { label: '49 - 60 ay (4 - 5 il)', pct: 20 },
                        { label: '60+ ay (5 ildən yuxarı)', pct: 0 }
                      ].map(row => {
                        const rowPayable = Math.round((customsExemption.totalSavedDutiesAzn * row.pct) / 100);
                        const isCurrentRow =
                          (row.pct === 0 && monthsInService >= 60) ||
                          (row.pct === 20 && monthsInService >= 48 && monthsInService < 60) ||
                          (row.pct === 40 && monthsInService >= 36 && monthsInService < 48) ||
                          (row.pct === 60 && monthsInService >= 24 && monthsInService < 36) ||
                          (row.pct === 80 && monthsInService >= 12 && monthsInService < 24) ||
                          (row.pct === 100 && monthsInService < 12);

                        return (
                          <tr
                            key={row.label}
                            className={isCurrentRow ? 'bg-rose-950/40 text-rose-300 font-bold' : 'text-slate-400'}
                          >
                            <td className="py-1.5 px-2">{row.label}</td>
                            <td className="py-1.5 px-2">{row.pct}%</td>
                            <td className="py-1.5 px-2 font-mono">
                              {convertCurrency(rowPayable, currency).toLocaleString()} {currency}
                            </td>
                            <td className="py-1.5 px-2">
                              {row.pct === 0 ? '✓ 100% Azad' : `${100 - row.pct}% Güzəşt`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMBASSIES RADAR */}
          {activeTab === 'missions' && (
            <div className="space-y-4" data-testid="tab-content-missions">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={lang === 'az' ? 'Səfirlik adı, ölkə kodu və ya rayon üzrə axtar...' : 'Search embassy or country code...'}
                  value={missionQuery}
                  onChange={e => setMissionQuery(e.target.value)}
                  className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
                  data-testid="search-missions-input"
                />
                <select
                  value={missionTypeFilter}
                  onChange={e => setMissionTypeFilter(e.target.value)}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
                  data-testid="filter-mission-type"
                >
                  <option value="all">Bütün Missiya Növləri</option>
                  <option value="embassy">Səfirliklər (Embassies)</option>
                  <option value="consulate">Konsulluqlar (Consulates)</option>
                  <option value="international_org">Beynəlxalq Təşkilatlar (UN/EU)</option>
                </select>
              </div>

              {/* Missions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredMissions.map(m => {
                  const isSelected = m.id === selectedMissionId;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMissionId(m.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-slate-900 border-rose-600 shadow-md shadow-rose-950/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                      data-testid={`mission-card-${m.id}`}
                    >
                      <div className="flex items-start justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">
                            {m.missionType === 'embassy' ? '🏛️' : m.missionType === 'consulate' ? '🏢' : '🌐'}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-white tracking-tight">
                              {lang === 'az' ? m.missionNameAz : lang === 'en' ? m.missionNameEn : m.missionNameRu}
                            </h4>
                            <span className="text-[10px] text-rose-400 font-mono">
                              XİN Kod: {m.countryCode} • {m.districtAz}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 whitespace-nowrap">
                          {m.activeVehiclesCount} avtomobil
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div>📍 {m.addressAz}</div>
                        <div>👤 Əlaqələndirici: {m.liaisonOfficer}</div>
                        <div>📞 {m.phone} | ✉️ {m.email}</div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-400">Ayrılmış Park Yeri:</span>
                        <span className="font-bold text-rose-400">{m.reservedParkingBays} Diplomatik Zolaq</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: PROTOCOL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-5" data-testid="tab-content-exam">
              {/* Exam Header */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {lang === 'az' ? 'Diplomatik Protokol və Vyana Konvensiyası Qiymətləndirmə Testi' : 'Vienna Convention Protocol Knowledge Evaluation'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    10 sual • Minimum keçid balı: 80% (8 düzgün cavab) • İmmunitet və Gömrük Reqlamentləri
                  </p>
                </div>
                {isExamSubmitted && (
                  <div className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${
                    examScore.passed
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                      : 'bg-rose-950/60 text-rose-400 border-rose-800'
                  }`}>
                    {examScore.passed ? '✓ İmtahan Keçildi' : '✕ Keçilmədi'}: {examScore.correct}/{examScore.total} ({examScore.percentage}%)
                  </div>
                )}
              </div>

              {/* Questions list */}
              <div className="space-y-4">
                {MOCK_PROTOCOL_EXAM_QUESTIONS.map((q, idx) => {
                  const selectedOpt = examAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                      data-testid={`exam-question-${q.id}`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-white leading-relaxed">
                          {lang === 'az' ? q.questionAz : lang === 'en' ? q.questionEn : q.questionRu}
                        </h4>
                      </div>

                      <div className="space-y-2 pl-8">
                        {(lang === 'az' ? q.optionsAz : lang === 'en' ? q.optionsEn : q.optionsRu).map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                          if (isExamSubmitted) {
                            if (optIdx === q.correctIndex) {
                              optStyle = 'bg-emerald-950/60 border-emerald-700 text-emerald-200 font-bold';
                            } else if (isOptionSelected) {
                              optStyle = 'bg-rose-950/60 border-rose-700 text-rose-200 line-through';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'bg-rose-950/40 border-rose-600 text-white font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!isExamSubmitted) {
                                  setExamAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                                }
                              }}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${optStyle}`}
                              data-testid={`q-${q.id}-opt-${optIdx}`}
                            >
                              <span>{String.fromCharCode(65 + optIdx)}) </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className={`p-2.5 rounded-lg text-[11px] pl-8 ${
                          isCorrect ? 'text-emerald-400 bg-emerald-950/30' : 'text-rose-400 bg-rose-950/30'
                        }`}>
                          <span className="font-bold">Hüquqi Əsas:</span> {q.legalCitation} — {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Reset Exam button */}
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  onClick={() => {
                    setExamAnswers({});
                    setIsExamSubmitted(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  {lang === 'az' ? 'Yenidən Başla' : 'Reset Exam'}
                </button>
                <button
                  onClick={() => setIsExamSubmitted(true)}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
                  data-testid="submit-exam-btn"
                >
                  {lang === 'az' ? 'İmtahanı Tamamla və Yoxla' : 'Submit & Grade Exam'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL MFA CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="tab-content-certificate">
              {/* Search Registry */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder={lang === 'az' ? 'Şəhadətnamə №, Qırmızı nömrə, VIN və ya Səfirlik üzrə axtar...' : 'Search by cert number, plate or VIN...'}
                  value={certSearchQuery}
                  onChange={e => setCertSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
                  data-testid="search-certificates-input"
                />
              </div>

              {/* The Official Certificate Paper */}
              <div
                className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-900/60 shadow-2xl space-y-5 text-slate-200"
                data-testid="official-certificate-view"
              >
                {/* Certificate Header with Coat of Arms representation */}
                <div className="text-center border-b border-slate-800 pb-4 space-y-1">
                  <div className="flex items-center justify-center space-x-2 text-rose-500 text-xl font-bold">
                    <span>🇦🇿</span>
                    <span>AZƏRBAYCAN RESPUBLİKASI XARİCİ İŞLƏR NAZİRLİYİ</span>
                  </div>
                  <h3 className="text-sm font-black text-white tracking-widest uppercase">
                    DİPLOMATİK NƏQLİYYAT VASİTƏSİNİN DÖVLƏT AKKREDİTASİYA ŞƏHADƏTNAMƏSİ
                  </h3>
                  <div className="text-[11px] font-mono text-rose-400">
                    № {currentCertificate.certificateNumber} • SİMA İmzalı: {currentCertificate.simaSignatureUid}
                  </div>
                </div>

                {/* Main Certificate Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                        {currentCertificate.plateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Akkreditə Olunan Dövlət:</span>
                      <span className="font-bold text-white">{currentCertificate.countryName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Missiya Adı:</span>
                      <span className="font-bold text-white">{currentCertificate.missionName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Diplomatik Kateqoriya:</span>
                      <span className="font-bold text-rose-300">{currentCertificate.category}</span>
                    </div>
                  </div>

                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avtomobil Modeli:</span>
                      <span className="font-bold text-white">{currentCertificate.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">VIN Şifrəsi:</span>
                      <span className="font-mono text-slate-300">{currentCertificate.vin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mühərrik Həcmi:</span>
                      <span className="font-bold text-white">{currentCertificate.engineCc} cc</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gömrük Statusu:</span>
                      <span className="font-bold text-emerald-400">100% Tax-Free Azad</span>
                    </div>
                  </div>
                </div>

                {/* Legal Immunity & Protection Banner */}
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 text-xs space-y-1">
                  <div className="font-bold text-rose-300 flex items-center space-x-1.5">
                    <span>🛡️</span>
                    <span>Toxunulmazlıq Rejimi: {currentCertificate.inviolabilityLevel}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Bu nəqliyyat vasitəsi 1961-ci il "Diplomatik Əlaqələr Haqqında" Vyana Konvensiyasının 22-ci maddəsinin 3-cü bəndinə əsasən toxunulmazdır. Yerli polis və ya icra orqanları tərəfindən saxlanıla, axtarıla və ya rekvizisiya edilə bilməz.
                  </p>
                </div>

                {/* Footer Signature & Telemetry */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 gap-3">
                  <div className="space-y-0.5">
                    <div>Təsdiq Edən: {currentCertificate.protocolOfficer}</div>
                    <div className="font-mono text-[10px]">Verifikasiya Kodu: {currentCertificate.verificationCode}</div>
                    <div className="text-[10px]">Etibarlılıq: {currentCertificate.issueDate} — {currentCertificate.validUntil}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyCertificate}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center space-x-1"
                      data-testid="copy-certificate-btn"
                    >
                      <span>📋</span>
                      <span>{copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1"
                      data-testid="print-certificate-btn"
                    >
                      <span>🖨️</span>
                      <span>Çap Et</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Public Diplomatic Registry List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200">
                  {lang === 'az' ? 'XİN Vahid Diplomatik Nəqliyyat Reystri:' : 'MFA Diplomatic Vehicle Registry Roll:'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredCertificates.map(cert => (
                    <div
                      key={cert.certificateNumber}
                      onClick={() => setCurrentCertificate(cert)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        cert.certificateNumber === currentCertificate.certificateNumber
                          ? 'bg-slate-900 border-rose-600'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                      data-testid={`cert-card-${cert.certificateNumber}`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900">
                            {cert.plateNumber}
                          </span>
                          <span className="text-xs font-semibold text-white">{cert.countryName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {cert.vehicleModel} • {cert.certificateNumber}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Aktiv
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
