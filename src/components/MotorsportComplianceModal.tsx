import React, { useState } from 'react';
import {
  X,
  Trophy,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Calendar,
  Phone,
  Flame,
  Search,
  Check,
  Clock,
  Compass,
  FileCheck,
  HelpCircle,
  Car,
} from 'lucide-react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  MotorsportDiscipline,
  CompetitionClass,
  MOTORSPORT_DISCIPLINES,
  evaluateAntiHooliganismSanctions,
  auditFiaAnnexJCompliance,
  calculateTrackDayCost,
  generateAafSportsPassport,
  filterAafPassports,
  AntiHooliganismAuditParams,
  FiaAnnexJChecklist,
  TrackDayPackage,
  TrackInsuranceTier,
  AafSportsPassport,
} from '../utils/motorsportCompliance';
import {
  MOCK_MOTORSPORT_TRACKS,
  MOCK_TRACK_VEHICLE_PRESETS,
  MOCK_ACTIVE_AAF_PASSPORTS,
  MOCK_TRACK_THEORETICAL_QUESTIONS,
  MotorsportTrack,
  TrackVehiclePreset,
} from '../data/mockMotorsportData';

type ModalTab = 'anti_hooliganism' | 'scrutineering' | 'tracks_booking' | 'exam' | 'passport_registry';

interface MotorsportComplianceModalProps {
  isOpen: boolean;
  vehicle?: Vehicle | null;
  currency: Currency;
  onClose: () => void;
}

export const MotorsportComplianceModal: React.FC<MotorsportComplianceModalProps> = ({
  isOpen,
  vehicle,
  currency,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('anti_hooliganism');
  const [copiedCode, setCopiedCode] = useState(false);

  // Tab 1: Anti-Hooliganism Audit State
  const [hooliganParams, setHooliganParams] = useState<AntiHooliganismAuditParams>({
    publicDriftAttempt: false,
    sharpLaneWeaving: false,
    mufflerRemovalCutout: false,
    twoWheelTippingAttempt: false,
    isRepeatOffenseWithinOneYear: false,
    publicDisturbanceOrRaceBetting: false,
  });

  // Tab 2: Scrutineering Checklist State
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOCK_TRACK_VEHICLE_PRESETS[0].id);
  const activePreset: TrackVehiclePreset =
    MOCK_TRACK_VEHICLE_PRESETS.find((p) => p.id === selectedPresetId) || MOCK_TRACK_VEHICLE_PRESETS[0];

  const [checklist, setChecklist] = useState<FiaAnnexJChecklist>(activePreset.checklist);
  const [discipline, setDiscipline] = useState<MotorsportDiscipline>(activePreset.discipline);
  const [compClass, setCompClass] = useState<CompetitionClass>(activePreset.competitionClass);

  // Tab 3: Track Booking State
  const [selectedTrackId, setSelectedTrackId] = useState<string>(MOCK_MOTORSPORT_TRACKS[0].id);
  const activeTrack: MotorsportTrack =
    MOCK_MOTORSPORT_TRACKS.find((t) => t.id === selectedTrackId) || MOCK_MOTORSPORT_TRACKS[0];
  const [packageType, setPackageType] = useState<TrackDayPackage>('morning_session');
  const [insuranceTier, setInsuranceTier] = useState<TrackInsuranceTier>('basic_third_party');
  const [transponderTiming, setTransponderTiming] = useState<boolean>(true);
  const [pitBoxRental, setPitBoxRental] = useState<boolean>(false);
  const [bookedTrack, setBookedTrack] = useState<string | null>(null);

  // Tab 4: Theoretical Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Tab 5: Passport Generator & Registry State
  const [driverName, setDriverName] = useState<string>('Teymur Məmmədov');
  const [plateNumber, setPlateNumber] = useState<string>(vehicle ? '99-YP-330' : '99-YP-330');
  const [vinNumber, setVinNumber] = useState<string>(vehicle?.vin || 'WBA330000AA099881');
  const [vehicleName, setVehicleName] = useState<string>(
    vehicle ? `${vehicle.make} ${vehicle.model}` : 'BMW M3 CSL Track Spec'
  );

  const [generatedPassport, setGeneratedPassport] = useState<AafSportsPassport>(() =>
    generateAafSportsPassport(
      vinNumber,
      plateNumber,
      vehicleName,
      driverName,
      discipline,
      compClass,
      90,
      101,
      activeTrack.nameAz
    )
  );

  const [passportsList, setPassportsList] = useState<AafSportsPassport[]>([
    ...MOCK_ACTIVE_AAF_PASSPORTS,
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Handle Preset Selection
  const handleSelectPreset = (preset: TrackVehiclePreset) => {
    setSelectedPresetId(preset.id);
    setChecklist({ ...preset.checklist });
    setDiscipline(preset.discipline);
    setCompClass(preset.competitionClass);
    setVehicleName(preset.name);
  };

  // Toggle checklist item
  const toggleChecklistItem = (key: keyof FiaAnnexJChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculations
  const hooliganSanction = evaluateAntiHooliganismSanctions(hooliganParams);
  const fiaAudit = auditFiaAnnexJCompliance(checklist);
  const trackPricing = calculateTrackDayCost({
    packageType,
    insuranceTier,
    transponderTiming,
    pitBoxRental,
    currency,
  });

  // Handle Exam submission
  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateExamScore = () => {
    let correct = 0;
    MOCK_TRACK_THEORETICAL_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    return correct;
  };

  // Handle Generate Passport
  const handleIssuePassport = () => {
    const passport = generateAafSportsPassport(
      vinNumber,
      plateNumber,
      vehicleName,
      driverName,
      discipline,
      compClass,
      fiaAudit.score,
      activePreset.exhaustDba || 101,
      activeTrack.nameAz
    );
    setGeneratedPassport(passport);
    setPassportsList((prev) => [passport, ...prev]);
    setActiveTab('passport_registry');
  };

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPassports = filterAafPassports(passportsList, searchQuery);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      data-testid="motorsport-compliance-modal"
    >
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
              <Trophy className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  AAF & DİN / BDYP RƏSMİ MOTORSPORT
                </span>
                <span className="text-[10px] font-mono text-slate-400">FIA ANNEX J</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Avtomobil İdmanı, Trek Günləri & "Avtoxuliqanlığa Yox" Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="motorsport-modal-close-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto scrollbar-none px-4 pt-2 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('anti_hooliganism')}
            data-testid="tab-anti-hooliganism"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'anti_hooliganism'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Anti-Avtoxuliqanlıq (İXM 511)</span>
          </button>

          <button
            onClick={() => setActiveTab('scrutineering')}
            data-testid="tab-scrutineering"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'scrutineering'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>FIA Texniki Scrutineering</span>
          </button>

          <button
            onClick={() => setActiveTab('tracks_booking')}
            data-testid="tab-tracks-booking"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'tracks_booking'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Autodromlar & Trek Günləri</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            data-testid="tab-exam"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'exam'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Tras Təhlükəsizlik Testi</span>
          </button>

          <button
            onClick={() => setActiveTab('passport_registry')}
            data-testid="tab-passport-registry"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'passport_registry'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4 text-purple-400" />
            <span>AAF İdman Pasportu & Reyestr</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-200">
          {/* TAB 1: ANTI-HOOLIGANISM & STREET RACING SANCTIONS */}
          {activeTab === 'anti_hooliganism' && (
            <div className="space-y-6" data-testid="anti-hooliganism-tab-content">
              {/* Campaign Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-500/40 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center flex-shrink-0 text-red-400 shadow-lg">
                  <Flame className="w-8 h-8 text-red-400" />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                    <span>"Küçələrdə Yox, Avtodromda Sür!" Milli Təhlükəsizlik Kampaniyası</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    İctimai yollarda sürüşmə (drift), qəfil kəskin manevrlər və səsboğucunun kəsilməsi birbaşa
                    inzibati həbs və hüquqdan məhrumetmə yaradır. Yarış ehtirasınızı qapalı təhlükəsiz traslarda
                    yaşayın!
                  </p>
                </div>
              </div>

              {/* Sanction Simulator Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Interactive Violation Toggles */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Yol Hərəkəti Pozuntularının Simulyasiyası</span>
                  </h4>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-colors">
                    <span className="text-xs sm:text-sm font-medium text-slate-200">
                      Qəsdən Yana Sürüşmə (İctimai Yolda Drift)
                    </span>
                    <input
                      type="checkbox"
                      checked={hooliganParams.publicDriftAttempt}
                      onChange={(e) =>
                        setHooliganParams({ ...hooliganParams, publicDriftAttempt: e.target.checked })
                      }
                      className="w-4 h-4 text-red-600 rounded border-slate-700 bg-slate-800 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-colors">
                    <span className="text-xs sm:text-sm font-medium text-slate-200">
                      Sürətli "Şahmat" Manevrləri & Sıxışdırma
                    </span>
                    <input
                      type="checkbox"
                      checked={hooliganParams.sharpLaneWeaving}
                      onChange={(e) =>
                        setHooliganParams({ ...hooliganParams, sharpLaneWeaving: e.target.checked })
                      }
                      className="w-4 h-4 text-red-600 rounded border-slate-700 bg-slate-800 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-colors">
                    <span className="text-xs sm:text-sm font-medium text-slate-200">
                      Səsboğucunun Kəsilməsi / Düz Boru (Straight-pipe)
                    </span>
                    <input
                      type="checkbox"
                      checked={hooliganParams.mufflerRemovalCutout}
                      onChange={(e) =>
                        setHooliganParams({ ...hooliganParams, mufflerRemovalCutout: e.target.checked })
                      }
                      className="w-4 h-4 text-red-600 rounded border-slate-700 bg-slate-800 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-colors">
                    <span className="text-xs sm:text-sm font-medium text-slate-200">
                      "İki Təkər Qaldırma" & Qeyri-adi Əyilmə Cəhdi
                    </span>
                    <input
                      type="checkbox"
                      checked={hooliganParams.twoWheelTippingAttempt}
                      onChange={(e) =>
                        setHooliganParams({ ...hooliganParams, twoWheelTippingAttempt: e.target.checked })
                      }
                      className="w-4 h-4 text-red-600 rounded border-slate-700 bg-slate-800 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-colors">
                    <span className="text-xs sm:text-sm font-medium text-slate-200">
                      Qeyri-qanuni Küçə Yarışı & Mərc Təşkili
                    </span>
                    <input
                      type="checkbox"
                      checked={hooliganParams.publicDisturbanceOrRaceBetting}
                      onChange={(e) =>
                        setHooliganParams({
                          ...hooliganParams,
                          publicDisturbanceOrRaceBetting: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-red-600 rounded border-slate-700 bg-slate-800 focus:ring-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 cursor-pointer transition-colors">
                    <span className="text-xs sm:text-sm font-semibold text-red-300">
                      Bir İl Ərzində TƏKRAR Törədilməsi (İXM 511.2)
                    </span>
                    <input
                      type="checkbox"
                      checked={hooliganParams.isRepeatOffenseWithinOneYear}
                      onChange={(e) =>
                        setHooliganParams({
                          ...hooliganParams,
                          isRepeatOffenseWithinOneYear: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-red-600 rounded border-red-700 bg-slate-800 focus:ring-red-500"
                    />
                  </label>
                </div>

                {/* Right: Judicial Sanction Breakdown */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        MƏHKƏMƏ & BDYP HÜQUQİ NƏTİCƏSİ
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          hooliganSanction.severityLevel === 'compliant'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : hooliganSanction.severityLevel === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                        }`}
                      >
                        {hooliganSanction.severityLevel === 'compliant'
                          ? 'TƏHLÜKƏSİZ'
                          : hooliganSanction.severityLevel === 'warning'
                          ? 'DÜZ BORU / CƏRİMƏ'
                          : 'AVTOXULİQANLIQ / HƏBS'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="text-xs text-slate-400">Tətbiq Edilən İnzibati Cərimə:</div>
                      <div className="text-xl sm:text-2xl font-black text-white">
                        {hooliganSanction.minFineAzn === 0
                          ? '0 AZN'
                          : `${hooliganSanction.minFineAzn} – ${hooliganSanction.maxFineAzn} AZN`}
                      </div>

                      {hooliganSanction.minAdministrativeArrestDays > 0 && (
                        <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-950/50 p-2 rounded-lg border border-red-500/40">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            İnzibati Həbs: {hooliganSanction.minAdministrativeArrestDays}–
                            {hooliganSanction.maxAdministrativeArrestDays} GÜN
                          </span>
                        </div>
                      )}

                      {hooliganSanction.suspensionYears > 0 && (
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                          <XCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Sürücülük Hüququnun Məhdudlaşdırılması: {hooliganSanction.suspensionYears} İL</span>
                        </div>
                      )}

                      {hooliganSanction.impoundRequired && (
                        <div className="text-[11px] text-slate-300">
                          • İXM Maddə 96 üzrə avtomobil dərhal mühafizə olunan cərimə meydançasına göndərilir.
                        </div>
                      )}
                    </div>

                    {/* Articles Violated */}
                    {hooliganSanction.articlesViolated.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-400">POZULAN HÜQUQİ MADDƏLƏR:</div>
                        <ul className="text-xs text-red-400 space-y-1">
                          {hooliganSanction.articlesViolated.map((art, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-red-500">•</span>
                              <span>{art}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Legal Advice / Autodrom CTA */}
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3">
                    <div className="text-xs text-emerald-300">
                      {hooliganSanction.trackDayAlternativeAz}
                    </div>
                    <button
                      onClick={() => setActiveTab('tracks_booking')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex-shrink-0 transition-colors"
                    >
                      Autodrom Rezervi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIA ANNEX J TECHNICAL SCRUTINEERING */}
          {activeTab === 'scrutineering' && (
            <div className="space-y-6" data-testid="scrutineering-tab-content">
              {/* Presets Bar */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  SÜRƏTLİ BOLİD & AVTOMOBİL PRESETLƏRİ
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_TRACK_VEHICLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedPresetId === preset.id
                          ? 'bg-red-600/20 border-red-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{preset.powerHp} HP • {preset.driveTrain}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Score & Scrutineering Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Overall Readiness Gauge */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      SCRUTINEERING NƏTİCƏSİ
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl font-black text-white">{fiaAudit.score}%</div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-200">
                          {fiaAudit.passedCount} / {fiaAudit.totalCount} Standart Tamamlandı
                        </div>
                        <div
                          className={`text-xs font-bold ${
                            fiaAudit.score >= 90
                              ? 'text-emerald-400'
                              : fiaAudit.score >= 40
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {fiaAudit.statusLabelAz}
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          fiaAudit.score >= 90
                            ? 'bg-emerald-500'
                            : fiaAudit.score >= 40
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${fiaAudit.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Discipline Selector */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs font-semibold text-slate-300">Motorsport İntizamı:</label>
                    <select
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value as MotorsportDiscipline)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      {Object.values(MOTORSPORT_DISCIPLINES).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nameAz}
                        </option>
                      ))}
                    </select>

                    <label className="text-xs font-semibold text-slate-300 pt-1 block">Yarış Sinfi:</label>
                    <select
                      value={compClass}
                      onChange={(e) => setCompClass(e.target.value as CompetitionClass)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="street_stock">Street Stock (Həvəskar Zavod)</option>
                      <option value="clubman_modified">Clubman Modified (Klub Modifikasiyalı)</option>
                      <option value="pro_am">Pro-Am Championship (Peşəkar AAF)</option>
                      <option value="unlimited_outlaw">Unlimited / Outlaw</option>
                    </select>
                  </div>

                  <button
                    onClick={handleIssuePassport}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>AAF İdman Pasportu Hazırla</span>
                  </button>
                </div>

                {/* Right: 10-Point Scrutineering Checklist */}
                <div className="lg:col-span-2 p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>FIA Annex J 10-Bəndlik Təhlükəsizlik Siyahısı</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { key: 'rollCageCertified', label: 'FIA 253 Polad Karkas (Roll Cage)' },
                      { key: 'racingBucketSeat', label: 'FIA 8855 Çömçə Oturacaq (Bucket)' },
                      { key: 'multiPointHarness', label: 'FIA 8853 4/5/6 Nöqtəli Kəmər' },
                      { key: 'fireSuppressionSystem', label: 'Mərkəzi Yanğınsöndürmə (AFFF)' },
                      { key: 'masterCutoffSwitch', label: 'Elektrik Mass Açarı (Kill Switch)' },
                      { key: 'dualTowHooks', label: 'Ön/Arxa Çəki İlgəkləri (Tow Straps)' },
                      { key: 'batteryBoxCatchTank', label: 'Hermetik Akkumulyator & Catch-Tank' },
                      { key: 'fuelCellSafetyBladder', label: 'FIA FT3 Təhlükəsiz Yanacaq Çəni' },
                      { key: 'exhaustDecibelLimit', label: 'Tras Səs Həddi (≤105 dBA)' },
                      { key: 'helmetHansDevice', label: 'FIA Dəbilqə & HANS Boyun Dəstəyi' },
                    ].map((item) => {
                      const isChecked = checklist[item.key as keyof FiaAnnexJChecklist];
                      return (
                        <div
                          key={item.key}
                          onClick={() => toggleChecklistItem(item.key as keyof FiaAnnexJChecklist)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          <span className="text-xs font-medium">{item.label}</span>
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Deficiencies Notice */}
                  {fiaAudit.deficiencies.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1">
                      <div className="text-[11px] font-bold text-amber-300">
                        ÇATIŞMAYAN AVADANLIQLAR ({fiaAudit.deficiencies.length}):
                      </div>
                      <div className="text-xs text-amber-200/90 flex flex-wrap gap-1.5">
                        {fiaAudit.deficiencies.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLOSED CIRCUITS & TRACK DAY BOOKING */}
          {activeTab === 'tracks_booking' && (
            <div className="space-y-6" data-testid="tracks-booking-tab-content">
              {/* Tracks Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  AZƏRBAYCANIN RƏSMİ QAPALI MOTORSPORT AVTODROMLARI (6 MƏRKƏZ)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MOCK_MOTORSPORT_TRACKS.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => setSelectedTrackId(track.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedTrackId === track.id
                          ? 'bg-slate-900 border-red-500 shadow-lg ring-1 ring-red-500'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{track.nameAz}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {track.trackLengthMeters}m • {track.cornersCount} Döngə
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span>{track.locationAz}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Səs Limiti: <span className="font-bold text-amber-400">{track.noiseLimitDba} dBA</span>
                        </div>
                        <ul className="text-[11px] text-slate-400 space-y-1">
                          {track.featuresAz.slice(0, 2).map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{track.contactPhone}</span>
                        </span>
                        {selectedTrackId === track.id ? (
                          <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Seçildi
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Seç</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package & Cost Calculator */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    TREK GÜNÜ PAKETİ
                  </span>
                  <div className="space-y-2">
                    {[
                      { id: 'morning_session', name: 'Səhər Sessiyası (09:00 - 12:00)', price: '80 AZN' },
                      { id: 'full_day_unlimited', name: 'Tam Gün Limitsiz (10:00 - 18:00)', price: '180 AZN' },
                      { id: 'drift_open_skidpad', name: 'Drift & Yaş Meydança (4 Saat)', price: '120 AZN' },
                      { id: 'drag_night_sprint', name: 'Gecə Drag Sprinti (10 Qaçış)', price: '70 AZN' },
                    ].map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setPackageType(pkg.id as TrackDayPackage)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          packageType === pkg.id
                            ? 'bg-red-950/30 border-red-500/50 text-white font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <span>{pkg.name}</span>
                        <span className="text-red-400">{pkg.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    SIĞORTA & ƏLAVƏ XİDMƏTLƏR
                  </span>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">Tras Sığortası:</label>
                    <select
                      value={insuranceTier}
                      onChange={(e) => setInsuranceTier(e.target.value as TrackInsuranceTier)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                    >
                      <option value="basic_third_party">Əsas Məsuliyyət Sığortası (+20 AZN)</option>
                      <option value="paddock_plus">Paddok & Təmir Mühafizəsi (+45 AZN)</option>
                      <option value="comprehensive_track">Tam Tras Qəza Təminatı (+95 AZN)</option>
                    </select>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs cursor-pointer">
                      <span>MyLaps Transponder Vaxt Ölçümü (+25 AZN)</span>
                      <input
                        type="checkbox"
                        checked={transponderTiming}
                        onChange={(e) => setTransponderTiming(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs cursor-pointer">
                      <span>Qapalı Pit-Boks İcarəsi (+50 AZN)</span>
                      <input
                        type="checkbox"
                        checked={pitBoxRental}
                        onChange={(e) => setPitBoxRental(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      REZERVASİYA XÜLASƏSİ
                    </span>
                    <div className="text-xs text-slate-300">
                      Seçilmiş Tras: <span className="font-bold text-white">{activeTrack.nameAz}</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Müddət: <span className="text-slate-200">{trackPricing.sessionDurationAz}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-xs text-slate-400">Yekun Ödəniş:</div>
                      <div className="text-2xl font-black text-white">
                        {trackPricing.totalConverted} {currency}
                      </div>
                      <div className="text-[11px] text-slate-400">({trackPricing.totalAzn} AZN)</div>
                    </div>
                  </div>

                  {bookedTrack === activeTrack.id ? (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 text-center font-bold">
                      ✓ Rezervasiya Təsdiqləndi! SMS bildiriş göndərildi.
                    </div>
                  ) : (
                    <button
                      onClick={() => setBookedTrack(activeTrack.id)}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Trek Gününü Təsdiq Et</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THEORETICAL TRACK SAFETY EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="exam-tab-content">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <span>AAF Tras Təhlükəsizliyi, Bayraqlar & İXM 511 Nəzəri İmtahanı</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Avtodroma çıxış lisenziyası üçün 10 sualdan minimum 8-nə düzgün cavab verilməlidir.
                  </p>
                </div>
                {examSubmitted && (
                  <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-3">
                    <span className="text-xs text-slate-400">İmtahan Balı:</span>
                    <span
                      className={`text-lg font-black ${
                        calculateExamScore() >= 8 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {calculateExamScore()} / 10
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {calculateExamScore() >= 8 ? '✓ MÜVƏFFƏQİYYƏTLİ' : '✗ KƏSİLDİNİZ'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_TRACK_THEORETICAL_QUESTIONS.map((q) => {
                  const selectedOption = examAnswers[q.id];
                  const isAnswered = selectedOption !== undefined;
                  const isCorrect = isAnswered && selectedOption === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                          #{q.id}
                        </span>
                        <div className="text-xs sm:text-sm font-semibold text-white">{q.questionAz}</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.optionsAz.map((opt, oIdx) => {
                          const isOptionSelected = selectedOption === oIdx;
                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850';

                          if (examSubmitted) {
                            if (oIdx === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-red-950/40 border-red-500 text-red-200';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-red-950/30 border-red-500 text-white font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectAnswer(q.id, oIdx)}
                              className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {examSubmitted && oIdx === q.correctOptionIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                          <div>
                            <span className="font-bold text-slate-300">İzah:</span> {q.explanationAz}
                          </div>
                          <div className="text-[10px] text-red-400">{q.legalArticleCitation}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3">
                {!examSubmitted ? (
                  <button
                    onClick={() => setExamSubmitted(true)}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-colors"
                  >
                    Cavabları Yoxla
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setExamSubmitted(false);
                      setExamAnswers({});
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold transition-colors"
                  >
                    Yenidən Başla
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AAF SPORTS PASSPORT & UNIFIED REGISTRY */}
          {activeTab === 'passport_registry' && (
            <div className="space-y-6" data-testid="passport-registry-tab-content">
              {/* Certificate Preview Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-red-950/30 border-2 border-red-500/50 shadow-2xl relative space-y-5">
                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-red-500/30 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-red-400">
                        AZƏRBAYCAN AVTOMOBİL FEDERASİYASI (AAF)
                      </div>
                      <div className="text-base sm:text-lg font-black text-white">
                        İDMAN TEXNİKİ PASPORTU (SPORTS TECHNICAL PASSPORT)
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400">PASPORT NÖMRƏSİ:</div>
                    <div className="text-sm font-black text-red-400 tracking-wider">
                      {generatedPassport.passportNumber}
                    </div>
                  </div>
                </div>

                {/* Certificate Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Pilot / Sahib:</span>
                    <div className="font-bold text-white truncate">{generatedPassport.driverFullName}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Dövlət Nömrəsi:</span>
                    <div className="font-bold text-red-400">{generatedPassport.plateNumber}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">VIN Şassi:</span>
                    <div className="font-mono text-white truncate">{generatedPassport.vin}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Model:</span>
                    <div className="font-bold text-white truncate">{generatedPassport.vehicleModel}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">İntizam:</span>
                    <div className="font-bold text-amber-300">
                      {MOTORSPORT_DISCIPLINES[generatedPassport.discipline]?.nameAz}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Karkas Homoloqasiyası:</span>
                    <div className="font-mono text-white">{generatedPassport.rollCageSerial}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Səs Həddi (dB):</span>
                    <div className="font-bold text-emerald-400">{generatedPassport.exhaustDbRating} dBA (≤105)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Etibarlılıq:</span>
                    <div className="font-bold text-white">{generatedPassport.validityUntil}</div>
                  </div>
                </div>

                {/* Footer QR & Scrutineer */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
                  <div className="space-y-0.5">
                    <div className="font-mono text-[10px] text-slate-500">
                      {generatedPassport.qrSecurityHash}
                    </div>
                    <div>Baş Texniki Komissar: <span className="text-white font-medium">{generatedPassport.chiefScrutineer}</span></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(generatedPassport.passportNumber)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Unified Public Sports Registry Search */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Search className="w-4 h-4 text-red-400" />
                    <span>QEYDİYYATDAN KEÇMİŞ İDMAN BOLİDLƏRİ VAHİD REYESTRİ ({filteredPassports.length})</span>
                  </span>

                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Nömrə, VIN, pilot və ya model axtar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-1.5 pl-8 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
                  {filteredPassports.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{p.vehicleModel}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30">
                            {p.plateNumber}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {p.passportNumber}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span>Pilot: <strong className="text-slate-200">{p.driverFullName}</strong></span>
                          <span>Tras: <strong className="text-slate-200">{p.assignedTrackName}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          {p.auditScore}% Scrutineering
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredPassports.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Axtarışınıza uyğun heç bir idman pasportu tapılmadı.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
